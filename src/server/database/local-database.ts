import "server-only";
import { readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { PGlite } from "@electric-sql/pglite";

const globalDb = globalThis as typeof globalThis & {
  cardeoDb?: Promise<PGlite>;
};
export async function localDatabase() {
  if (!globalDb.cardeoDb) {
    globalDb.cardeoDb = (async () => {
      const { PGlite } = await import("@electric-sql/pglite");
      const directory = process.env.CARDEO_DATABASE_DIR
        ? path.resolve(process.env.CARDEO_DATABASE_DIR)
        : path.join(process.cwd(), ".cardeo");
      await mkdir(directory, { recursive: true });
      const db = new PGlite(directory);
      await db.waitReady;
      const check = await db.query<{ exists: boolean }>("select to_regclass('public.cards') is not null as exists");
      if (!check.rows[0].exists) {
        await db.exec("create role anon; create role authenticated; create role service_role;");
        await db.exec(await readFile(path.join(process.cwd(), "supabase/schema.sql"), "utf8"));
      }
      await db.exec(await readFile(path.join(process.cwd(), "supabase/catalogue-api.sql"), "utf8"));
      const cards = await db.query<{ n: number }>("select count(*)::int as n from public.cards");
      if (cards.rows[0].n === 0) {
        const source = JSON.parse(await readFile(path.join(process.cwd(), "data/cards.json"), "utf8"));
        await db.transaction(async (tx) => {
          for (const card of source.cards) {
            await tx.query("insert into public.cards (id, rarity, data) values ($1,$2,$3::jsonb) on conflict (id) do nothing", [card.id, card.rarity, JSON.stringify(card)]);
          }
        });
      }
      return db;
    })().catch((error) => {
      globalDb.cardeoDb = undefined;
      throw error;
    });
  }
  return globalDb.cardeoDb;
}

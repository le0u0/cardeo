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
      const check = await db.query<{ exists: boolean }>(
        "select to_regclass('public.products') is not null as exists",
      );
      if (!check.rows[0].exists) {
        await db.exec(
          "create role anon; create role authenticated; create role service_role;",
        );
        await db.exec(
          await readFile(
            path.join(process.cwd(), "supabase/migrations/001_shop.sql"),
            "utf8",
          ),
        );
        await db.exec(
          await readFile(path.join(process.cwd(), "supabase/seed.sql"), "utf8"),
        );
      }
      await db.exec(
        await readFile(path.join(process.cwd(), "supabase/migrations/002_private_rankings.sql"), "utf8"),
      );
      return db;
    })().catch((error) => {
      globalDb.cardeoDb = undefined;
      throw error;
    });
  }
  return globalDb.cardeoDb;
}

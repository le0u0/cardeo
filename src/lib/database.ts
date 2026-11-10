import "server-only";
import { cache } from "react";
import { readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { PGlite } from "@electric-sql/pglite";
import type { Product, CheckoutInput, CheckoutResult } from "./types";
import { fingerprint } from "./checkout";

const globalDb = globalThis as typeof globalThis & {
  cardeoDb?: Promise<PGlite>;
};
async function localDatabase() {
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
async function rpc<T>(
  name: "get_catalogue" | "demo_checkout",
  parameters: Record<string, unknown> = {},
): Promise<T> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    const response = await fetch(
      `${url.replace(/\/$/, "")}/rest/v1/rpc/${name}`,
      {
        method: "POST",
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parameters),
        cache: "no-store",
        signal: AbortSignal.timeout(12000),
      },
    );
    if (!response.ok) throw new Error("Database request failed");
    return response.json() as Promise<T>;
  }
  if (url || key || process.env.VERCEL)
    throw new Error("Configure both Supabase server environment variables");
  const db = await localDatabase();
  const keys = Object.keys(parameters);
  const values = Object.values(parameters).map((v) =>
    typeof v === "object" ? JSON.stringify(v) : v,
  );
  const result = await db.query<{ result: T }>(
    `select public.${name}(${keys.map((k, i) => `${k} => $${i + 1}`).join(",")}) as result`,
    values,
  );
  return result.rows[0].result;
}
export const getCatalogue = cache(async () => {
  const products = await rpc<Product[]>("get_catalogue");
  // Explicit public fields also protect deployments awaiting the SQL migration.
  return products.map(
    ({ id, slug, name, character, price_minor, image_url, description }) => ({
      id,
      slug,
      name,
      character,
      price_minor,
      image_url,
      description: description.replace(/ Its reference tier is [SABCD]\./g, ""),
    }),
  );
});
export const submitCheckout = async (
  input: CheckoutInput,
  bucket: string,
): Promise<CheckoutResult> => {
  const result = await rpc<CheckoutResult>("demo_checkout", {
    p_items: input.items,
    p_expected_total: input.expectedTotal,
    p_request_key: input.requestKey,
    p_fingerprint: fingerprint(input),
    p_outcome: input.outcome,
    p_bucket: bucket,
  });

  if (result.kind !== "completed") return result;
  const { reference, createdAt, total, currency, items } = result.receipt;
  return {
    kind: "completed",
    receipt: {
      reference,
      createdAt,
      total,
      currency,
      items: items.map(({ name, unitPrice, quantity }) => ({
        name,
        unitPrice,
        quantity,
      })),
    },
  };
};

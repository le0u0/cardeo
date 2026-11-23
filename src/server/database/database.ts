import "server-only";
import { cache } from "react";
import type { Product, CheckoutInput, CheckoutResult } from "@/lib/types";
import { fingerprint } from "@/server/api/checkout/checkout";

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
  if (url || key || process.env.HOSTED)
    throw new Error("Configure both Supabase server environment variables");
  const { localDatabase } = await import("./local-database");
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

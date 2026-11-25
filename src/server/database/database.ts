import "server-only";
import { cache } from "react";
import { getI18n } from "@/server/i18n/i18n-server";
import type { Product, CheckoutInput, CheckoutResult } from "@/lib/types";
import { fingerprint } from "@/server/api/checkout/checkout";

async function rpc<T>(
  name: "list_cards" | "get_card" | "checkout",
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
    v !== null && typeof v === "object" ? JSON.stringify(v) : v,
  );
  const result = await db.query<{ result: T }>(
    `select public.${name}(${keys.map((k, i) => `${k} => $${i + 1}`).join(",")}) as result`,
    values,
  );
  return result.rows[0].result;
}
export type CataloguePage = { items: Product[]; total: number; maxPrice: number; counts: Record<string, number> };
function imageUrl(card: Product): Product {
  const base = process.env.SUPABASE_URL;
  return base ? { ...card, image_url: `${base.replace(/\/$/, "")}/storage/v1/object/public/cards/${card.image_url.replace(/^\/card-images\/(en|zh-HK)\//, (_, language: string) => language === "en" ? "en/" : "zh/")}` } : card;
}
export const listCards = cache(async (options: { className?: string; keyword?: string; sort?: string; page?: number; limit?: number; maxPrice?: number; ids?: string[] } = {}) => {
  const { locale } = await getI18n();
  const result = await rpc<CataloguePage>("list_cards", { p_locale: locale, p_class: options.className || null, p_keyword: options.keyword || "", p_sort: options.sort || "featured", p_page: options.page || 1, p_limit: options.limit || 12, p_max_price: options.maxPrice ?? null, p_ids: options.ids ?? null });
  return { ...result, items: result.items.map(imageUrl) };
});
export const getCard = cache(async (id: string) => {
  const { locale } = await getI18n();
  const card = await rpc<Product | null>("get_card", { p_locale: locale, p_id: id });
  return card ? imageUrl(card) : null;
});
export const submitCheckout = async (
  input: CheckoutInput,
  bucket: string,
): Promise<CheckoutResult> => {
  const result = await rpc<CheckoutResult>("checkout", {
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

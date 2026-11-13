import { createHash } from "node:crypto";
import type { CheckoutInput } from "../lib/types";
export function parseCheckout(value: unknown): CheckoutInput {
  if (!value || typeof value !== "object") throw new Error("Invalid request");
  const v = value as Record<string, unknown>;
  if (!Array.isArray(v.items) || v.items.length < 1 || v.items.length > 30)
    throw new Error("Cart must contain 1–30 different cards");
  const seen = new Set<string>();
  const items = v.items
    .map((item: unknown) => {
      if (!item || typeof item !== "object") throw new Error("Invalid item");
      const { productId, quantity } = item as Record<string, unknown>;
      if (
        typeof productId !== "string" ||
        !/^[a-z0-9-]{1,100}$/.test(productId) ||
        seen.has(productId)
      )
        throw new Error("Invalid or duplicate card");
      if (
        typeof quantity !== "number" ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 10
      )
        throw new Error("Quantity must be 1–10");
      seen.add(productId);
      return { productId, quantity };
    })
    .sort((a, b) => a.productId.localeCompare(b.productId));
  if (
    typeof v.expectedTotal !== "number" ||
    !Number.isSafeInteger(v.expectedTotal) ||
    v.expectedTotal < 0 ||
    v.expectedTotal > 3000000
  )
    throw new Error("Invalid expected total");
  if (
    typeof v.requestKey !== "string" ||
    !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(
      v.requestKey,
    )
  )
    throw new Error("Invalid request key");
  if (v.outcome !== "success" && v.outcome !== "failure")
    throw new Error("Invalid simulation");
  return {
    items,
    expectedTotal: v.expectedTotal,
    requestKey: v.requestKey,
    outcome: v.outcome,
  };
}
export function fingerprint(input: CheckoutInput): string {
  return createHash("sha256")
    .update(JSON.stringify({ items: input.items, outcome: input.outcome }))
    .digest("hex");
}

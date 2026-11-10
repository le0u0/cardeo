import { describe, it, expect } from "vitest";
import { parseCheckout, fingerprint } from "./checkout";
const key = "5b7bf618-ef08-4d17-9262-6d2fddc96a52";
const valid = {
  items: [{ productId: "ironclad-offering", quantity: 1 }],
  expectedTotal: 10000,
  requestKey: key,
  outcome: "success",
};
describe("checkout boundary", () => {
  it("rejects empty, duplicate, fractional, negative and oversized carts", () => {
    for (const items of [
      [],
      [{ productId: "x", quantity: 0 }],
      [{ productId: "x", quantity: 1.5 }],
      [{ productId: "x", quantity: 11 }],
      [
        { productId: "x", quantity: 1 },
        { productId: "x", quantity: 2 },
      ],
      Array.from({ length: 31 }, (_, i) => ({
        productId: `p-${i}`,
        quantity: 1,
      })),
    ])
      expect(() => parseCheckout({ ...valid, items })).toThrow();
  });
  it("rejects unsafe totals, missing keys and unknown simulation values", () => {
    for (const patch of [
      { expectedTotal: 1.2 },
      { expectedTotal: -1 },
      { expectedTotal: Number.MAX_SAFE_INTEGER },
      { requestKey: "bad" },
      { outcome: "live" },
    ])
      expect(() => parseCheckout({ ...valid, ...patch })).toThrow();
  });
  it("ignores browser prices and canonicalizes cart order before hashing", () => {
    const a = parseCheckout({
      ...valid,
      items: [
        { productId: "silent-adrenaline", quantity: 2, price: 1 },
        { productId: "ironclad-offering", quantity: 1, price: 1 },
      ],
    });
    const b = parseCheckout({
      ...valid,
      items: [
        { productId: "ironclad-offering", quantity: 1 },
        { productId: "silent-adrenaline", quantity: 2 },
      ],
    });
    expect(fingerprint(a)).toBe(fingerprint(b));
    expect(a.items[0]).not.toHaveProperty("price");
  });
});

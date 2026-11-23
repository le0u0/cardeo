import { beforeAll, beforeEach, afterAll, describe, it, expect } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import type { CheckoutInput, CheckoutResult, Product } from "../../src/lib/types";
import { fingerprint, parseCheckout } from "../../src/server/api/checkout/checkout";
const db = new PGlite();
async function checkout(
  patch: Partial<CheckoutInput> = {},
  bucket: string = randomUUID(),
) {
  const input = parseCheckout({
    items: [{ productId: "ironclad-offering", quantity: 1 }],
    expectedTotal: 10000,
    requestKey: randomUUID(),
    outcome: "success",
    ...patch,
  });
  const result = await db.query<{ result: CheckoutResult }>(
    "select public.demo_checkout($1,$2,$3,$4,$5,$6) as result",
    [
      JSON.stringify(input.items),
      input.expectedTotal,
      input.requestKey,
      fingerprint(input),
      input.outcome,
      bucket,
    ],
  );
  return result.rows[0].result;
}
async function count(table: "orders" | "order_items") {
  return (
    await db.query<{ n: number }>(
      `select count(*)::integer as n from public.${table}`,
    )
  ).rows[0].n;
}
beforeAll(async () => {
  await db.exec(
    "create role anon; create role authenticated; create role service_role;",
  );
  await db.exec(await readFile("supabase/migrations/001_shop.sql", "utf8"));
  await db.exec(await readFile("supabase/seed.sql", "utf8"));
  await db.exec(await readFile("supabase/migrations/002_private_rankings.sql", "utf8"));
});
beforeEach(async () => {
  await db.exec(
    "truncate public.order_items,public.orders,public.checkout_attempts; update public.tier_prices set unit_price_minor=10000 where tier='S'; update public.products set active=true; update public.products set tier='S' where id='ironclad-offering';",
  );
});
afterAll(async () => {
  await db.close();
});
describe("actual PostgreSQL checkout function", () => {
  it("serves 30 products with database-derived tier prices", async () => {
    const { rows } = await db.query<{ catalogue: Product[] }>(
      "select public.get_catalogue() as catalogue",
    );
    expect(rows[0].catalogue).toHaveLength(30);
    const prices = await db.query<{ id: string; price: number }>(
      "select p.id, t.unit_price_minor as price from public.products p join public.tier_prices t on p.tier=t.tier",
    );
    for (const p of rows[0].catalogue) {
      expect(p.price_minor).toBe(prices.rows.find((row) => row.id === p.id)?.price);
      expect(p).not.toHaveProperty("tier");
      expect(p.description).not.toMatch(/tier/i);
    }
  });
  it("creates item snapshots with the server total", async () => {
    const result = await checkout({
      items: [
        { productId: "ironclad-offering", quantity: 2 },
        { productId: "ironclad-vicious", quantity: 1 },
      ],
      expectedTotal: 22500,
    });
    expect(result.kind).toBe("completed");
    if (result.kind !== "completed") return;
    expect(result.receipt.total).toBe(22500);
    expect(result.receipt.items).toHaveLength(2);
    result.receipt.items.forEach((item) => expect(item).not.toHaveProperty("tier"));
    expect(result.receipt.reference).toMatch(/^DEMO-[A-F0-9]{16}$/);
    expect(await count("orders")).toBe(1);
    expect(await count("order_items")).toBe(2);
  });
  it("requotes a tampered total and writes no order", async () => {
    expect(await checkout({ expectedTotal: 1 })).toEqual({
      kind: "requote",
      total: 10000,
    });
    expect(await count("orders")).toBe(0);
  });
  it("excludes inactive, unranked and nonexistent cards", async () => {
    await db.exec(
      "update public.products set active=false where id='silent-adrenaline'; update public.products set tier=null where id='ironclad-offering';",
    );
    for (const productId of [
      "silent-adrenaline",
      "ironclad-offering",
      "missing-card",
    ])
      expect(
        (await checkout({ items: [{ productId, quantity: 1 }] })).kind,
      ).toBe("invalid");
    const { rows } = await db.query<{ catalogue: Product[] }>(
      "select public.get_catalogue() as catalogue",
    );
    expect(rows[0].catalogue).toHaveLength(28);
    expect(await count("orders")).toBe(0);
  });
  it("keeps failed simulations out of completed orders", async () => {
    expect((await checkout({ outcome: "failure" })).kind).toBe("failed");
    expect(await count("orders")).toBe(0);
  });
  it("returns one receipt for sequential and concurrent identical retries", async () => {
    const requestKey = randomUUID();
    const first = await checkout({ requestKey });
    const results = await Promise.all([
      checkout({ requestKey }),
      checkout({ requestKey }),
      checkout({ requestKey }),
    ]);
    results.forEach((r) => expect(r).toEqual(first));
    expect(await count("orders")).toBe(1);
    expect(await count("order_items")).toBe(1);
  });
  it("rejects the same key used with a different cart", async () => {
    const requestKey = randomUUID();
    await checkout({ requestKey });
    expect(
      (
        await checkout({
          requestKey,
          items: [{ productId: "ironclad-offering", quantity: 2 }],
          expectedTotal: 20000,
        })
      ).kind,
    ).toBe("conflict");
    expect(await count("orders")).toBe(1);
  });
  it("retains historical prices after repricing the catalogue", async () => {
    const requestKey = randomUUID();
    const first = await checkout({ requestKey });
    await db.exec(
      "update public.tier_prices set unit_price_minor=11000 where tier='S';",
    );
    expect(await checkout({ requestKey })).toEqual(first);
    expect(await checkout()).toEqual({ kind: "requote", total: 11000 });
  });
  it("rolls back the whole order when an item insert fails", async () => {
    await db.exec(
      "alter table public.order_items add constraint test_reject check (name_snapshot <> 'Offering');",
    );
    try {
      await expect(checkout()).rejects.toThrow();
      expect(await count("orders")).toBe(0);
      expect(await count("order_items")).toBe(0);
    } finally {
      await db.exec(
        "alter table public.order_items drop constraint test_reject;",
      );
    }
  });
  it("limits failed requests across database calls and expires old buckets", async () => {
    for (let i = 0; i < 20; i++)
      expect((await checkout({ outcome: "failure" }, "same-client")).kind).toBe(
        "failed",
      );
    expect((await checkout({ outcome: "failure" }, "same-client")).kind).toBe(
      "limited",
    );
    await db.exec(
      "update public.checkout_attempts set expires_at=now()-interval '1 minute';",
    );
    expect((await checkout({ outcome: "failure" }, "same-client")).kind).toBe(
      "failed",
    );
  });
  it("blocks anonymous order reads, product edits and direct RPC execution", async () => {
    await db.exec("set role anon;");
    try {
      await expect(db.query("select * from public.orders")).rejects.toThrow(
        /permission denied/,
      );
      await expect(
        db.query("update public.products set active=false"),
      ).rejects.toThrow(/permission denied/);
      await expect(db.query("select public.get_catalogue()")).rejects.toThrow(
        /permission denied/,
      );
      await expect(
        db.query(
          "select public.demo_checkout('[]',0,gen_random_uuid(),'hash','success','test')",
        ),
      ).rejects.toThrow(/permission denied/);
    } finally {
      await db.exec("reset role;");
    }
  });
});

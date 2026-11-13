import { test, expect } from "@playwright/test";

test("catalogue API, search, prices, URL state, empty recovery and pagination", async ({
  page,
}) => {
  await page.goto("/shop");
  await expect(
    page.getByRole("heading", { name: "每張牌，都有它的位置。" }),
  ).toBeVisible();
  await expect(page.locator(".product-card")).toHaveCount(12);
  await page.getByRole("button", { name: "下一頁", exact: true }).click();
  await expect(page).toHaveURL(/page=2/);
  await page.getByRole("searchbox", { name: "搜尋卡牌" }).fill("Offering");
  await expect(page.locator(".product-card")).toHaveCount(1);
  await expect(page.locator(".product-card")).toContainText("HK$100.00");
  await expect(page).not.toHaveURL(/page=/);
  await page.getByRole("searchbox", { name: "搜尋卡牌" }).fill("no-such-card");
  await expect(
    page.getByRole("heading", { name: "這次，還沒找到合適的牌。" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "瀏覽全部卡牌" }).click();
  await expect(page.locator(".product-card")).toHaveCount(12);
  const catalogue = await page.request.get("/api/catalogue");
  expect(catalogue.headers()["cache-control"]).toBe("no-store");
  const products = await catalogue.json();
  expect(products).toHaveLength(30);
  for (const product of products) {
    expect(product).not.toHaveProperty("tier");
    expect(product.description).not.toMatch(/tier/i);
  }
  await expect(page.locator(".tier-badge")).toHaveCount(0);
  await page.getByLabel("最高價格", { exact: true }).first().fill("10");
  await expect(page.locator(".product-card")).toHaveCount(5);
  for (const card of await page.locator(".product-card").all())
    await expect(card).toContainText("HK$10.00");
  await page.reload();
  await expect(page.locator(".product-card")).toHaveCount(5);
  await page.goBack();
  await expect(page.locator(".product-card")).toHaveCount(12);
});

test("cart persists, enforces quantity limits and completes a failed-then-successful simulation", async ({
  page,
}) => {
  await page.goto("/cards/ironclad-offering");
  await page.getByRole("button", { name: "增加 Offering 數量" }).click();
  await page.getByRole("button", { name: "加入購物袋", exact: true }).click();
  await page.goto("/cart");
  await expect(page.locator(".summary-total")).toContainText("HK$200.00");
  await page.reload();
  await expect(page.getByLabel("Offering 數量", { exact: true })).toHaveText(
    "2",
  );
  await page.getByRole("button", { name: "增加 Offering 數量" }).click();
  await expect(page.locator(".summary-total")).toContainText("HK$300.00");
  await page.getByRole("button", { name: "減少 Offering 數量" }).click();
  await page.getByRole("link", { name: "前往示範結帳" }).click();
  await page.getByRole("radio", { name: "模擬失敗", exact: true }).check();
  await page.getByRole("button", { name: "模擬訂單", exact: true }).click();
  await expect(
    page.locator(".checkout-summary").getByRole("alert"),
  ).toContainText("模擬付款失敗");
  await expect(page.getByRole("button", { name: /開啟購物袋/ })).toContainText(
    "2",
  );
  await page.getByRole("radio", { name: "模擬成功", exact: true }).check();
  await page.getByRole("button", { name: "模擬訂單", exact: true }).click();
  await expect(page).toHaveURL(/checkout\/success/);
  await expect(
    page.getByRole("heading", { name: "好牌，已經集合。" }),
  ).toBeVisible();
  await expect(page.locator(".receipt-paper")).toContainText("HK$200.00");
  await page.reload();
  await expect(page.locator(".receipt-top")).toContainText("DEMO-");
  await page.goto("/cart");
  await expect(
    page.getByRole("heading", { name: "還沒選好？慢慢來。" }),
  ).toBeVisible();
});

test("missing receipt, missing card and malformed persisted cart recover safely", async ({
  page,
}) => {
  await page.goto("/checkout/success");
  await expect(
    page.getByRole("heading", { name: "這裡還沒有收據。" }),
  ).toBeVisible();
  await page.goto("/cards/missing-card");
  await expect(
    page.getByRole("heading", { name: "這張牌似乎不在店裡。" }),
  ).toBeVisible();
  await page.evaluate(() => localStorage.setItem("cardeo.cart.v1", "not-json"));
  await page.goto("/cart");
  await expect(
    page.getByRole("heading", { name: "還沒選好？慢慢來。" }),
  ).toBeVisible();
  await page.evaluate(() =>
    sessionStorage.setItem(
      "cardeo.receipt.v1",
      JSON.stringify({ reference: "invalid", createdAt: "never", items: [] }),
    ),
  );
  await page.goto("/checkout/success");
  await expect(
    page.getByRole("heading", { name: "這裡還沒有收據。" }),
  ).toBeVisible();
});

test("mobile filter drawer cancels, applies, closes with Escape and restores focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/shop");
  const opener = page.getByRole("button", { name: "篩選", exact: true });
  await opener.click();
  const dialog = page.getByRole("dialog", { name: "篩選卡牌" });
  await dialog.getByLabel("最高價格", { exact: true }).fill("10");
  await dialog.getByRole("button", { name: "取消篩選" }).click();
  await expect(page.locator(".product-card")).toHaveCount(12);
  await opener.click();
  await dialog.getByLabel("最高價格", { exact: true }).fill("10");
  await dialog.getByRole("button", { name: "顯示結果" }).click();
  await expect(page.locator(".product-card")).toHaveCount(5);
  await page.getByRole("button", { name: "篩選 (1)", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "篩選 (1)", exact: true }),
  ).toBeFocused();
});

test("mobile layouts fit 320px, with cart drawer and dedicated checkout", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 780 });
  for (const path of [
    "/",
    "/shop",
    "/cards/ironclad-offering",
    "/about",
    "/checkout/success",
  ]) {
    await page.goto(path);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      path,
    ).toBe(true);
  }
  await page.goto("/cards/ironclad-offering");
  await page.getByRole("button", { name: "加入購物袋", exact: true }).click();
  await page.getByRole("button", { name: /開啟購物袋/ }).click();
  await expect(page.getByRole("dialog", { name: "你的購物袋" })).toBeVisible();
  await page.getByRole("link", { name: "查看購物袋" }).click();
  await expect(page).toHaveURL(/\/cart$/);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("link", { name: "前往示範結帳" }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("checkout API rejects cross-site and malformed requests; ignores browser price fields", async ({
  page,
}) => {
  await page.goto("/shop");
  const results = await page.evaluate(async () => {
    const requestKey = crypto.randomUUID();
    const body = {
      items: [{ productId: "ironclad-offering", quantity: 1, price: 1 }],
      expectedTotal: 1,
      requestKey,
      outcome: "success",
    };
    const malformed = await fetch("/api/demo-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{",
    });
    const tampered = await fetch("/api/demo-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return {
      malformed: malformed.status,
      tampered: tampered.status,
      quote: await tampered.json(),
    };
  });
  expect(results.malformed).toBe(400);
  expect(results.tampered).toBe(409);
  expect(results.quote).toEqual({ kind: "requote", total: 10000 });
  const cross = await page.request.post("/api/demo-checkout", {
    headers: { Origin: "https://unrelated.example" },
    data: {},
  });
  expect(cross.status()).toBe(403);
});

test("language switch translates the storefront and persists through navigation and reload", async ({ page }) => {
  await page.goto("/shop?character=Ironclad");
  await expect(page.getByRole("button", { name: "中文", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.getByRole("button", { name: "EN", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { name: "A place for every card." })).toBeVisible();
  await expect(page).toHaveURL(/character=Ironclad/);
  await expect(page.locator(".product-character").first()).toHaveText("Ironclad");
  await expect(page.getByPlaceholder("Search card names…")).toBeVisible();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.goto("/about");
  await expect(page.getByRole("heading", { name: "Sources and artwork." })).toBeVisible();
  await page.getByRole("button", { name: "中文", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-Hant");
  await expect(page.getByRole("heading", { name: "資料與圖像來源。" })).toBeVisible();
});

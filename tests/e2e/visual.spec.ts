import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";
test("desktop and mobile layouts produce reviewable screenshots without browser errors", async ({
  page,
}) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const output = process.env.CARDEO_SCREENSHOT_DIR || ".artifacts/screenshots";
  await mkdir(output, { recursive: true });
  for (const screen of [
    { name: "cardeo-home-desktop", url: "/", width: 1440, height: 1000 },
    { name: "cardeo-shop-desktop", url: "/shop", width: 1440, height: 1000 },
    {
      name: "cardeo-card-desktop",
      url: "/cards/ironclad-offering",
      width: 1440,
      height: 1000,
    },
    { name: "cardeo-home-mobile", url: "/", width: 390, height: 844 },
    { name: "cardeo-shop-mobile", url: "/shop", width: 390, height: 844 },
  ]) {
    await page.setViewportSize({ width: screen.width, height: screen.height });
    await page.goto(screen.url);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.evaluate(() => {
      for (const image of document.images) image.loading = "eager";
    });
    await page.evaluate(() =>
      Promise.all(
        Array.from(document.images, (img) => img.decode().catch(() => {})),
      ),
    );
    await page.screenshot({
      path: path.join(output, `${screen.name}.png`),
      fullPage: true,
    });
  }
  expect(errors).toEqual([]);
});

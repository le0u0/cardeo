import { getI18n } from "@/lib/i18n-server";
import { LocaleProvider } from "@/components/i18n/locale-provider";
import type { Metadata } from "next";
import Link from "next/link";
import { CartProvider, CatalogueContent } from "@/components/cart/cart-provider";
import { Header, MerchantMark } from "@/components/layout/header";
import "./globals.css";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: { default: t("Cardeo｜尖塔商人小店"), template: "%s｜Cardeo" },
    other: { "page-type": "product", "site-kind": "other" },
    description: t("以 Slay the Spire 2 為靈感的非官方卡牌商店習作。瀏覽卡牌，體驗不收款的示範購物流程。"),
  };
}
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t, locale } = await getI18n();
  return (
    <html lang={locale} data-type="product" data-radius="soft" data-buttons="solid">
      <body>
        <a className="skip-link" href="#main">
          {t("跳至主要內容")}</a>
        <LocaleProvider locale={locale}>
          <CartProvider>
            <Header />
            <main id="main">
              <CatalogueContent>{children}</CatalogueContent>
            </main>
            <footer className="site-footer">
              <div className="container footer-main">
                <div className="footer-brand">
                  <MerchantMark />
                  <div>
                    <strong>Cardeo</strong>
                    <p>{t("每次爬塔，總會遇上好牌。")}</p>
                  </div>
                </div>
                <div className="footer-links">
                  <Link href="/shop">{t("瀏覽卡牌")}</Link>
                  <Link href="/about">{t("關於與資料來源")}</Link>
                  <a
                    href="https://mobalytics.gg/slay-the-spire-2/tier-lists/cards"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t("卡牌資料來源")}</a>
                </div>
              </div>
              <div className="container footer-bottom">
                <span>
                  {t("非官方同人作品 · Slay the Spire 2 由 Mega Crit 擁有。")}</span>
                <span>{t("示範用途 · 沒有真實交易")}</span>
              </div>
            </footer>
          </CartProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}

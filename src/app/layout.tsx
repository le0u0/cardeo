import { getI18n } from "@/server/i18n-server";
import { LocaleProvider } from "@/providers/locale-provider";
import type { Metadata } from "next";
import Link from "next/link";
import { CartProvider, CatalogueContent } from "@/providers/cart-provider";
import { Header, MerchantMark } from "@/widgets/header";
import "./globals.css";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: { default: t("cardeoTheSpireMerchant"), template: "%s｜Cardeo" },
    other: { "page-type": "product", "site-kind": "other" },
    description: t("siteDescription"),
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
          {t("skipToMainContent")}</a>
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
                    <p>{t("aGoodCardForEveryClimb")}</p>
                  </div>
                </div>
                <div className="footer-links">
                  <Link href="/shop">{t("browseCards")}</Link>
                  <Link href="/about">{t("aboutAndCredits")}</Link>
                </div>
              </div>
              <div className="container footer-bottom">
                <span>
                  {t("fanProjectAttribution")}</span>
                <span>{t("demoOnlyNoRealTransactions")}</span>
              </div>
            </footer>
          </CartProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}

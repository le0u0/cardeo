import "./_common/globals.css";
import { getI18n } from "@/server/i18n-server";
import { LocaleProvider } from "@/app/_common/context/locale-context/locale-context";
import type { Metadata } from "next";
import { CartProvider, CatalogueContent } from "@/app/_common/context/cart-context/cart-context";
import { Header } from "@/app/_common/_header/header";
import { Footer } from "@/app/_common/_footer/footer";
import "./layout.css";
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
            <Footer />
          </CartProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}

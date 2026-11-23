import { getI18n } from "@/server/i18n/i18n-server";
import { CheckoutPage } from "@/app/checkout/_checkout-page/checkout-page";
export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t("demoCheckout") };
}
export default function Page() {
  return <CheckoutPage />;
}

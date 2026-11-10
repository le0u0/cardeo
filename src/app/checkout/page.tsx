import { getI18n } from "@/lib/i18n-server";
import { CheckoutPage } from "@/components/checkout/checkout-page";
export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t("示範結帳") };
}
export default function Page() {
  return <CheckoutPage />;
}

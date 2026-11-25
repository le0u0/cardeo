import { getI18n } from "@/server/i18n/i18n-server";
import { CartPage } from "@/app/cart/_cart-page/cart-page";
export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t("bag") };
}
export default function Page() {
  return <CartPage referenceArt={true} />;
}

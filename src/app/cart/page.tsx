import { getI18n } from "@/server/i18n-server";
import { CartPage } from "@/components/cart/cart-page";
export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t("bag") };
}
export default function Page() {
  return <CartPage referenceArt={process.env.REFERENCE_ART !== "false"} />;
}

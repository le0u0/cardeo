import { getI18n } from "@/lib/i18n-server";
import { CartPage } from "@/components/cart/cart-page";
export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t("購物袋") };
}
export default function Page() {
  return <CartPage referenceArt={process.env.REFERENCE_ART !== "false"} />;
}

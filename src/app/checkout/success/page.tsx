import { getI18n } from "@/lib/i18n-server";
import { SuccessPage } from "@/components/checkout/success-page";
export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t("示範訂單完成") };
}
export default function Page() {
  return <SuccessPage />;
}

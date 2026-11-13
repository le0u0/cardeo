import { getI18n } from "@/server/i18n-server";
import { SuccessPage } from "@/app/components/checkout/success-page";
export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t("demoOrderComplete") };
}
export default function Page() {
  return <SuccessPage />;
}

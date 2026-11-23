import { getI18n } from "@/server/i18n/i18n-server";
import { SuccessPage } from "@/app/checkout/_success-page/success-page";
export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t("demoOrderComplete") };
}
export default function Page() {
  return <SuccessPage />;
}

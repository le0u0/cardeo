import { getI18n } from "@/server/i18n/i18n-server";
import Link from "next/link";
import { Layers } from "lucide-react";
export default async function NotFound() {
  const { t } = await getI18n();
  return (
    <div className="container page-pad empty-state page-empty">
      <Layers size={48} />
      <h1>{t("thisCardIsNotInTheShop")}</h1>
      <p>{t("cardNotFoundHelp")}</p>
      <Link href="/shop" className="button primary">
        {t("browseCards")}</Link>
    </div>
  );
}

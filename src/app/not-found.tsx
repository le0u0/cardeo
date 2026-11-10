import { getI18n } from "@/lib/i18n-server";
import Link from "next/link";
import { Layers } from "lucide-react";
export default async function NotFound() {
  const { t } = await getI18n();
  return (
    <div className="container page-pad empty-state page-empty">
      <Layers size={48} />
      <h1>{t("這張牌似乎不在店裡。")}</h1>
      <p>{t("連結可能已變更。回到小店，還有其他好牌等著你。")}</p>
      <Link href="/shop" className="button primary">
        {t("瀏覽卡牌")}</Link>
    </div>
  );
}

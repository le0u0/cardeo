import { getI18n } from "@/lib/i18n-server";
import { ArrowUpRight } from "lucide-react";
export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t("關於小店") };
}
export default async function AboutPage() {
  const { t } = await getI18n();
  return (
    <div className="container page-pad about-page">
      <div className="page-heading">
        <h1>{t("資料與圖像來源。")}</h1>
      </div>
      <div className="about-copy">
        <p>{t("本網站與 Mega Crit、Slay the Spire 及 Mobalytics 並無官方關聯，也不是官方商店。")}</p>
        <p>{t("Slay the Spire 2 由 Mega Crit 開發。卡牌名稱參照已核對的來源；示範圖像沿用提供的 HTML 範例中的 Mobalytics 圖像網址。圖像權利屬各權利人，來源連結不代表使用授權或官方認可。")}</p>
        <a href="https://mobalytics.gg/slay-the-spire-2/tier-lists/cards" target="_blank" rel="noreferrer" className="quiet-link">
          Mobalytics <ArrowUpRight size={16} />
        </a>
        <a href="https://www.megacrit.com/content-policy/" target="_blank" rel="noreferrer" className="quiet-link">
          {t("Mega Crit 內容政策")}<ArrowUpRight size={16} />
        </a>
      </div>
    </div>
  );
}

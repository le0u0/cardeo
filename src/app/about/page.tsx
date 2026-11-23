import { getI18n } from "@/server/i18n/i18n-server";
import { ArrowUpRight } from "lucide-react";
import "./about.css";
export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t("about") };
}
export default async function AboutPage() {
  const { t } = await getI18n();
  return (
    <div className="container page-pad about-page">
      <div className="page-heading">
        <h1>{t("sourcesAndArtwork")}</h1>
      </div>
      <div className="about-copy">
        <p>{t("unofficialAffiliationNotice")}</p>
        <p>{t("artworkCredits")}</p>
        <a href="https://mobalytics.gg/slay-the-spire-2/tier-lists/cards" target="_blank" rel="noreferrer" className="quiet-link">
          Mobalytics <ArrowUpRight size={16} />
        </a>
        <a href="https://www.megacrit.com/content-policy/" target="_blank" rel="noreferrer" className="quiet-link">
          {t("megaCritContentPolicy")}<ArrowUpRight size={16} />
        </a>
      </div>
    </div>
  );
}

import Link from "next/link";
import { getI18n } from "@/server/i18n-server";
import { MerchantMark } from "@/app/_common/sections/header";
import "./footer.css";

export async function Footer() {
  const { t } = await getI18n();
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-brand">
          <MerchantMark />
          <div>
            <strong>Cardeo</strong>
            <p>{t("aGoodCardForEveryClimb")}</p>
          </div>
        </div>
        <div className="footer-links">
          <Link href="/shop">{t("browseCards")}</Link>
          <Link href="/about">{t("aboutAndCredits")}</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          {t("fanProjectAttribution")}</span>
        <span>{t("demoOnlyNoRealTransactions")}</span>
      </div>
    </footer>
  );
}

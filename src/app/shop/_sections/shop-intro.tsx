"use client";
import { useI18n } from "@/app/_common/providers/locale-provider";
export function ShopIntro() {
  const { t } = useI18n();
  return (
    <div className="shop-intro">
      <div>
        <h1>{t("aPlaceForEveryCard")}</h1>
        <p>{t("catalogueIntroduction")}</p>
      </div>
    </div>
  );
}

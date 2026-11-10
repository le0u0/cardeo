import { getI18n } from "@/lib/i18n-server";
import { Suspense } from "react";
import { Shop } from "@/components/catalogue/shop";
export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t("瀏覽卡牌") };
}
export default async function ShopPage() {
  const { t } = await getI18n();
  return (
    <Suspense fallback={<p className="container page-pad">{t("正在整理卡牌…")}</p>}>
      <Shop
        referenceArt={process.env.REFERENCE_ART !== "false"}
      />
    </Suspense>
  );
}

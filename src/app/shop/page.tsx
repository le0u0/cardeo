import { getI18n } from "@/server/i18n-server";
import { Suspense } from "react";
import { Shop } from "@/app/shop/_shop/shop";
export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t("browseCards") };
}
export default async function ShopPage() {
  const { t } = await getI18n();
  return (
    <Suspense fallback={<p className="container page-pad">{t("loadingCards")}</p>}>
      <Shop
        referenceArt={process.env.REFERENCE_ART !== "false"}
      />
    </Suspense>
  );
}

import { getI18n } from "@/server/i18n/i18n-server";
import { notFound } from "next/navigation";
import { getCatalogue } from "@/server/database/database";
import { CardDetail } from "@/app/cards/[id]/_card-detail/card-detail";
import { RelatedCards } from "@/app/cards/[id]/_related-cards/related-cards";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { t } = await getI18n();
  const { id } = await params;
  const p = (await getCatalogue()).find((p) => p.id === id);
  return { title: p?.name ?? t("cardNotFound") };
}
export default async function CardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const products = await getCatalogue();
  const product = products.find((p) => p.id === id);
  if (!product) notFound();
  const referenceArt = process.env.REFERENCE_ART !== "false";
  return (
    <div className="container page-pad">
      <CardDetail product={product} referenceArt={referenceArt} />
      <RelatedCards
        product={product}
        products={products}
        referenceArt={referenceArt}
      />
    </div>
  );
}

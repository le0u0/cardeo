import { getI18n } from "@/server/i18n/i18n-server";
import { notFound } from "next/navigation";
import { getCard, listCards } from "@/server/database/database";
import { CardDetail } from "@/app/cards/[id]/_card-detail/card-detail";
import { RelatedCards } from "@/app/cards/[id]/_related-cards/related-cards";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { t } = await getI18n();
  const { id } = await params;
  const p = await getCard(id);
  return { title: p?.name ?? t("cardNotFound") };
}
export default async function CardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getCard(id);
  if (!product) notFound();
  const products = (await listCards({ className: product.character, limit: 5 })).items;
  const referenceArt = true;
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

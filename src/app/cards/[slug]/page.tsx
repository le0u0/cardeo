import { getI18n } from "@/server/i18n-server";
import { notFound } from "next/navigation";
import { getCatalogue } from "@/server/database";
import { CardDetail } from "@/app/cards/[slug]/_sections/card-detail";
import { RelatedCards } from "@/app/cards/[slug]/_sections/related-cards";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { t } = await getI18n();
  const { slug } = await params;
  const p = (await getCatalogue()).find((p) => p.slug === slug);
  return { title: p?.name ?? t("cardNotFound") };
}
export default async function CardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const products = await getCatalogue();
  const product = products.find((p) => p.slug === slug);
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

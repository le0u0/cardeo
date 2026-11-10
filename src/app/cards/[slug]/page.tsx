import { getI18n } from "@/lib/i18n-server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getCatalogue } from "@/lib/database";
import { CardArt } from "@/components/catalogue/card-art";
import { BuyCard } from "@/components/catalogue/buy-card";
import { ProductCard } from "@/components/catalogue/product-card";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { t } = await getI18n();
  const { slug } = await params;
  const p = (await getCatalogue()).find((p) => p.slug === slug);
  return { title: p?.name ?? t("找不到卡牌") };
}
export default async function CardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { t, characterName } = await getI18n();
  const { slug } = await params;
  const products = await getCatalogue();
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();
  const referenceArt = process.env.REFERENCE_ART !== "false";
  return (
    <div className="container page-pad">
      <Link
        className="quiet-link back-link"
        href={`/shop?character=${product.character}`}
      >
        <ArrowLeft size={16} />
        {t("返回{character}卡牌", { character: characterName(product.character) })}
      </Link>
      <section className="detail-layout">
        <div
          className={`detail-artwork character-${product.character.toLowerCase()}`}
        >
          <CardArt product={product} priority referenceArt={referenceArt} />
        </div>
        <div className="detail-info">
          <p
            className={`product-character character-${product.character.toLowerCase()}`}
          >
            <span className="character-dot" />
            {characterName(product.character)}
          </p>
          <h1>{product.name}</h1>
          <p className="detail-description">
            {t("來自{character}的卡牌。挑選你喜歡的牌，體驗一次不收款的購物旅程。", { character: characterName(product.character) })}
          </p>
          <BuyCard product={product} />
        </div>
      </section>
      <section className="related-section">
        <div className="section-heading">
          <h2>{t("同路的好牌。")}</h2>
          <Link
            href={`/shop?character=${product.character}`}
            className="quiet-link"
          >
            {t("查看同角色卡牌")}<ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="featured-grid">
          {products
            .filter(
              (p) => p.character === product.character && p.id !== product.id,
            )
            .slice(0, 4)
            .map((p) => (
              <ProductCard key={p.id} product={p} referenceArt={referenceArt} />
            ))}
        </div>
      </section>
    </div>
  );
}

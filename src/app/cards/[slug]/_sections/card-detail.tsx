import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getI18n } from "@/server/i18n-server";
import { CardArt } from "@/app/_common/widgets/card-art";
import { BuyCard } from "@/app/cards/[slug]/_widgets/buy-card";
import type { Product } from "@/lib/types";
import "./card-detail.css";

export async function CardDetail({
  product,
  referenceArt,
}: {
  product: Product;
  referenceArt: boolean;
}) {
  const { t, characterName } = await getI18n();
  return (
    <>
      <Link
        className="quiet-link back-link"
        href={`/shop?character=${product.character}`}
      >
        <ArrowLeft size={16} />
        {t("backToCharacterCards", { character: characterName(product.character) })}
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
            {t("cardCollectionDescription", { character: characterName(product.character) })}
          </p>
          <BuyCard product={product} />
        </div>
      </section>
    </>
  );
}

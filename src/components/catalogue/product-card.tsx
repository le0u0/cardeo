"use client";
import { useI18n } from "@/components/i18n/locale-provider";
import Link from "next/link";
import { Plus, Check } from "lucide-react";
import { CardArt } from "@/components/catalogue/card-art";
import { useCart } from "@/components/cart/cart-provider";
import { money, type Product } from "@/lib/types";
export function ProductCard({
  product,
  referenceArt,
}: {
  product: Product;
  referenceArt: boolean;
}) {
  const { t, characterName } = useI18n();
  const cart = useCart();
  const quantity =
    cart.items.find((i) => i.productId === product.id)?.quantity ?? 0;
  return (
    <article
      className={`product-card character-${product.character.toLowerCase()}`}
    >
      <Link
        className="product-image-link"
        href={`/cards/${product.slug}`}
        aria-label={t("查看 {p0}", { p0: product.name })}
      >
        <CardArt product={product} referenceArt={referenceArt} />
      </Link>
      <div className="product-info">
        <p className="product-character">
          <span className="character-dot" />
          {characterName(product.character)}
        </p>
        <h3>
          <Link href={`/cards/${product.slug}`}>{product.name}</Link>
        </h3>
        <div className="product-bottom">
          <strong>{money(product.price_minor)}</strong>
          <button
            className="add-button"
            disabled={quantity >= 10}
            onClick={() => cart.add(product.id)}
            aria-label={t("將 {p0} 加入購物袋", { p0: product.name })}
          >
            {quantity ? <Check size={17} /> : <Plus size={17} />}
            <span>{quantity ? t("已加入 {p0}", { p0: quantity }) : t("加入")}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

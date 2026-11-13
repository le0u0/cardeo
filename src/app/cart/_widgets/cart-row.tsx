"use client";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useI18n } from "@/app/_common/providers/locale-provider";
import { useCart } from "@/app/_common/providers/cart-provider";
import { CardArt } from "@/app/_common/widgets/card-art";
import { Quantity } from "@/app/_common/widgets/quantity";
import { money } from "@/lib/types";
import "./cart-row.css";

export function CartRow({
  productId,
  quantity,
  referenceArt,
}: {
  productId: string;
  quantity: number;
  referenceArt: boolean;
}) {
  const { t, characterName } = useI18n();
  const cart = useCart();
  const product = cart.products.find((p) => p.id === productId);
  return (
    <article className="cart-row">
      <div className="cart-thumbnail" aria-hidden="true">
        {product && <CardArt product={product} referenceArt={referenceArt} />}
      </div>
      <div className="cart-item-info">
        <h2>
          {product ? (
            <Link href={`/cards/${product.slug}`}>
              {product.name}
            </Link>
          ) : (
            t("unavailableCard")
          )}
        </h2>
        <p>
          {product
            ? characterName(product.character)
            : t("pleaseRemoveThisCard")}
        </p>
        <span>
          {product ? t("priceCard", { price: money(product.price_minor) }) : t("unavailable")}
        </span>
        <button
          className="text-button cart-remove"
          onClick={() => cart.remove(productId)}
          aria-label={t("removeValue", { p0: product?.name ?? t("unavailableCard") })}
        >
          <Trash2 size={13} />
          {t("remove")}</button>
      </div>
      <Quantity
        name={product?.name ?? productId}
        value={quantity}
        onChange={(q) => cart.setQuantity(productId, q)}
      />
      <strong className="cart-line-price">
        {product ? money(product.price_minor * quantity) : "—"}
      </strong>
    </article>
  );
}

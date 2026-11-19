"use client";
import { useI18n } from "@/app/_common/context/locale-context/locale-context";
import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/app/_common/context/cart-context/cart-context";
import { Quantity } from "@/app/_common/widgets/quantity/quantity";
import { money, type Product } from "@/lib/types";
import "./buy-card.css";
export function BuyCard({ product }: { product: Product }) {
  const { t } = useI18n();
  const [quantity, setQuantity] = useState(1);
  const cart = useCart();
  const existing =
    cart.items.find((i) => i.productId === product.id)?.quantity ?? 0;
  return (
    <div className="buy-card">
      <div className="buy-price">
        <strong>{money(product.price_minor)}</strong>
        <span>{t("perCardDemoPrice")}</span>
      </div>
      <div className="buy-actions">
        <Quantity
          name={product.name}
          value={quantity}
          onChange={(n) => n >= 1 && n <= 10 && setQuantity(n)}
        />
        <button
          className="button primary"
          disabled={existing + quantity > 10}
          onClick={() => cart.add(product.id, quantity)}
        >
          <ShoppingBag size={18} />
          {t("addToBag")}</button>
      </div>
      <p className="fine-print">
        {existing + quantity > 10
          ? t("cartQuantityLimit")
          : t("subtotalAndQuantityLimit", { p0: money(product.price_minor * quantity) })}
      </p>
    </div>
  );
}

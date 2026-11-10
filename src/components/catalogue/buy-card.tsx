"use client";
import { useI18n } from "@/components/i18n/locale-provider";
import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { Quantity } from "@/components/cart/quantity";
import { money, type Product } from "@/lib/types";
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
        <span>{t("每張 · 示範價格")}</span>
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
          {t("加入購物袋")}</button>
      </div>
      <p className="fine-print">
        {existing + quantity > 10
          ? t("購物袋內每款最多 10 張，請調整數量。")
          : t("小計 {p0} · 每款最多 10 張", { p0: money(product.price_minor * quantity) })}
      </p>
    </div>
  );
}

"use client";
import { useI18n } from "@/app/_common/context/locale-context/locale-context";
import { useCart } from "@/app/_common/context/cart-context/cart-context";
import { CartRow } from "@/app/_common/widgets/cart-row/cart-row";
import "./cart-list.css";

export function CartList({
  unavailable,
  referenceArt,
}: {
  unavailable: boolean;
  referenceArt: boolean;
}) {
  const { t } = useI18n();
  const cart = useCart();
  return (
    <section className="cart-list" aria-label={t("bagContents")}>
      {unavailable && (
        <p className="alert" role="alert">
          {t("removeUnavailableCardsBeforeCheckout")}</p>
      )}
      {cart.items.map((item) => (
        <CartRow
          key={item.productId}
          productId={item.productId}
          quantity={item.quantity}
          referenceArt={referenceArt}
        />
      ))}
      <button className="text-button clear-cart" onClick={cart.clear}>
        {t("emptyBag")}</button>
    </section>
  );
}

"use client";
import { useI18n } from "@/app/_common/providers/locale-provider";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useCart } from "@/app/_common/providers/cart-provider";
import { EmptyCart } from "@/app/cart/_sections/empty-cart";
import { CartList } from "@/app/cart/_sections/cart-list";
import { OrderSummary } from "@/app/cart/_sections/order-summary";
export function CartPage({ referenceArt }: { referenceArt: boolean }) {
  const { t } = useI18n();
  const cart = useCart();
  const unavailable = cart.items.some(
    (i) => !cart.products.find((p) => p.id === i.productId),
  );
  if (!cart.ready)
    return (
      <div className="container page-pad">
        <p>{t("openingYourBag")}</p>
      </div>
    );
  return (
    <div className="container page-pad">
      <Link href="/shop" className="quiet-link back-link">
        <ArrowLeft size={16} />
        {t("keepBrowsing")}</Link>
      <div className="page-heading">
        <h1>{t("yourBagHeading")}</h1>
        <p>{t("cartItemCountDescription", { count: cart.count })}</p>
      </div>
      {!cart.items.length ? (
        <EmptyCart />
      ) : (
        <div className="checkout-layout">
          <CartList unavailable={unavailable} referenceArt={referenceArt} />
          <OrderSummary unavailable={unavailable} />
        </div>
      )}
    </div>
  );
}

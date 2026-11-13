"use client";
import { useI18n } from "@/providers/locale-provider";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "@/providers/cart-provider";
import { CardArt } from "@/widgets/card-art";
import { Quantity } from "@/widgets/quantity";
import { money } from "@/lib/types";
export function CartPage({ referenceArt }: { referenceArt: boolean }) {
  const { t, characterName } = useI18n();
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
        <div className="empty-state page-empty">
          <ShoppingBag size={48} />
          <h2>{t("stillChoosingTakeYourTime")}</h2>
          <p>{t("emptyCartDescription")}</p>
          <Link href="/shop" className="button primary">
            {t("browseCards")}<ArrowRight size={17} />
          </Link>
        </div>
      ) : (
        <div className="checkout-layout">
          <section className="cart-list" aria-label={t("bagContents")}>
            {unavailable && (
              <p className="alert" role="alert">
                {t("removeUnavailableCardsBeforeCheckout")}</p>
            )}
            {cart.items.map((item) => {
              const product = cart.products.find(
                (p) => p.id === item.productId,
              );
              return (
                <article className="cart-row" key={item.productId}>
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
                      onClick={() => cart.remove(item.productId)}
                      aria-label={t("removeValue", { p0: product?.name ?? t("unavailableCard") })}
                    >
                      <Trash2 size={13} />
                      {t("remove")}</button>
                  </div>
                  <Quantity
                    name={product?.name ?? item.productId}
                    value={item.quantity}
                    onChange={(q) => cart.setQuantity(item.productId, q)}
                  />
                  <strong className="cart-line-price">
                    {product ? money(product.price_minor * item.quantity) : "—"}
                  </strong>
                </article>
              );
            })}
            <button className="text-button clear-cart" onClick={cart.clear}>
              {t("emptyBag")}</button>
          </section>
          <aside className="order-summary">
            <h2>{t("orderSummary")}</h2>
            <div className="summary-line">
              <span>{t("cardSubtotal")}</span>
              <strong>{money(cart.total)}</strong>
            </div>
            <div className="summary-line">
              <span>{t("demoDelivery")}</span>
              <span>{t("free")}</span>
            </div>
            <div className="summary-total">
              <span>{t("total")}</span>
              <strong>{money(cart.total)}</strong>
            </div>
            {unavailable ? (
              <button className="button primary full" disabled>
                {t("removeUnavailableCardsFirst")}</button>
            ) : (
              <Link href="/checkout" className="button primary full">
                {t("continueToDemoCheckout")}<ArrowRight size={17} />
              </Link>
            )}
            <p className="summary-assurance">
              <ShieldCheck size={16} />
              {t("noPaymentRequired")}</p>
          </aside>
        </div>
      )}
    </div>
  );
}

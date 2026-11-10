"use client";
import { useI18n } from "@/components/i18n/locale-provider";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { CardArt } from "@/components/catalogue/card-art";
import { Quantity } from "@/components/cart/quantity";
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
        <p>{t("正在打開購物袋…")}</p>
      </div>
    );
  return (
    <div className="container page-pad">
      <Link href="/shop" className="quiet-link back-link">
        <ArrowLeft size={16} />
        {t("繼續逛逛")}</Link>
      <div className="page-heading">
        <h1>{t("你的購物袋。")}</h1>
        <p>{t("選好的牌，先在這裡集合。共 {count} 張卡牌。", { count: cart.count })}</p>
      </div>
      {!cart.items.length ? (
        <div className="empty-state page-empty">
          <ShoppingBag size={48} />
          <h2>{t("還沒選好？慢慢來。")}</h2>
          <p>{t("好牌不用急著找，先逛逛再說。")}</p>
          <Link href="/shop" className="button primary">
            {t("瀏覽卡牌")}<ArrowRight size={17} />
          </Link>
        </div>
      ) : (
        <div className="checkout-layout">
          <section className="cart-list" aria-label={t("購物袋內容")}>
            {unavailable && (
              <p className="alert" role="alert">
                {t("部分卡牌已下架，請移除後再結帳。")}</p>
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
                        t("已下架卡牌")
                      )}
                    </h2>
                    <p>
                      {product
                        ? characterName(product.character)
                        : t("請移除這張卡牌")}
                    </p>
                    <span>
                      {product ? t("{price} / 張", { price: money(product.price_minor) }) : t("無法購買")}
                    </span>
                    <button
                      className="text-button cart-remove"
                      onClick={() => cart.remove(item.productId)}
                      aria-label={t("移除 {p0}", { p0: product?.name ?? t("已下架卡牌") })}
                    >
                      <Trash2 size={13} />
                      {t("移除")}</button>
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
              {t("清空購物袋")}</button>
          </section>
          <aside className="order-summary">
            <h2>{t("訂單小結")}</h2>
            <div className="summary-line">
              <span>{t("卡牌小計")}</span>
              <strong>{money(cart.total)}</strong>
            </div>
            <div className="summary-line">
              <span>{t("模擬配送")}</span>
              <span>{t("免費")}</span>
            </div>
            <div className="summary-total">
              <span>{t("合計")}</span>
              <strong>{money(cart.total)}</strong>
            </div>
            {unavailable ? (
              <button className="button primary full" disabled>
                {t("請先移除已下架卡牌")}</button>
            ) : (
              <Link href="/checkout" className="button primary full">
                {t("前往示範結帳")}<ArrowRight size={17} />
              </Link>
            )}
            <p className="summary-assurance">
              <ShieldCheck size={16} />
              {t("不用信用卡，不會收取任何款項。")}</p>
          </aside>
        </div>
      )}
    </div>
  );
}

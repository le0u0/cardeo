"use client";
import { LanguageSwitch, useI18n } from "@/components/i18n/locale-provider";
import Link from "next/link";
import { ShoppingBag, X, Menu, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/cart/cart-provider";
import { money } from "@/lib/types";
export function MerchantMark() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="10" y="7" width="28" height="36" rx="5" stroke="currentColor" strokeWidth="2" />
      <path d="M29 18a8 8 0 1 0 0 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
export function Header() {
  const { t } = useI18n();
  const cart = useCart();
  const path = usePathname();
  const drawer = useRef<HTMLDialogElement>(null);
  const menu = useRef<HTMLDialogElement>(null);
  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <Link href="/" className="brand" aria-label={t("Cardeo 首頁")}>
            <MerchantMark />
            <span>
              Cardeo
            </span>
          </Link>
          <nav className="desktop-nav" aria-label={t("主要導覽")}>
            <Link href="/" aria-current={path === "/" ? "page" : undefined}>
              {t("商人小店")}</Link>
            <Link
              href="/shop"
              aria-current={
                path.startsWith("/shop") || path.startsWith("/cards")
                  ? "page"
                  : undefined
              }
            >
              {t("瀏覽卡牌")}</Link>
            <Link
              href="/about"
              aria-current={path === "/about" ? "page" : undefined}
            >
              {t("關於小店")}</Link>
          </nav>
          <div className="header-actions">
            <LanguageSwitch />
            <span className="currency-note">{t("香港 / HKD")}</span>
            <button
              className="bag-button"
              onClick={() => drawer.current?.showModal()}
              aria-label={t("開啟購物袋，{count} 張卡牌", { count: cart.count })}
            >
              <ShoppingBag size={19} />
              <span className="bag-word">{t("購物袋")}</span>
              <span className="bag-count">{cart.count}</span>
            </button>
            <button
              className="icon-button mobile-menu"
              aria-label={t("開啟導覽")}
              onClick={() => menu.current?.showModal()}
            >
              <Menu />
            </button>
          </div>
        </div>
      </header>
      <dialog
        ref={drawer}
        className="side-dialog"
        aria-labelledby="bag-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) drawer.current?.close();
        }}
      >
        <div className="dialog-inner">
          <div className="dialog-heading">
            <h2 id="bag-title">{t("你的購物袋")}</h2>
            <button
              className="icon-button"
              aria-label={t("關閉購物袋")}
              onClick={() => drawer.current?.close()}
            >
              <X />
            </button>
          </div>
          {cart.items.length ? (
            <>
              <ul className="mini-cart">
                {cart.items.map((item) => {
                  const p = cart.products.find((p) => p.id === item.productId);
                  return (
                    <li key={item.productId}>
                      <div>
                        <strong>{p?.name ?? t("已下架卡牌")}</strong>
                        <small>
                          {t("{count} 張", { count: item.quantity })} ·{" "}
                          {p ? money(p.price_minor * item.quantity) : t("請移除")}
                        </small>
                      </div>
                      <button
                        className="text-button"
                        onClick={() => cart.remove(item.productId)}
                      >
                        {t("移除")}</button>
                    </li>
                  );
                })}
              </ul>
              <div className="mini-total">
                <span>{t("小計")}</span>
                <strong>{money(cart.total)}</strong>
              </div>
              <Link
                className="button primary full"
                href="/cart"
                onClick={() => drawer.current?.close()}
              >
                {t("查看購物袋")}<ChevronRight size={17} />
              </Link>
            </>
          ) : (
            <div className="empty-state">
              <ShoppingBag size={42} />
              <h3>{t("好牌，還在等你。")}</h3>
              <p>{t("逛逛卡牌，找一張合眼緣的。")}</p>
              <Link
                href="/shop"
                className="button primary"
                onClick={() => drawer.current?.close()}
              >
                {t("瀏覽卡牌")}</Link>
            </div>
          )}
        </div>
      </dialog>
      <dialog ref={menu} className="side-dialog" aria-labelledby="menu-title">
        <div className="dialog-inner">
          <div className="dialog-heading">
            <h2 id="menu-title">{t("導覽")}</h2>
            <button
              className="icon-button"
              aria-label={t("關閉導覽")}
              onClick={() => menu.current?.close()}
            >
              <X />
            </button>
          </div>
          <nav className="mobile-nav">
            {[
              ["/", t("商人小店")],
              ["/shop", t("瀏覽卡牌")],
              ["/about", t("關於小店")],
            ].map(([href, label]) => (
              <Link
                href={href}
                key={href}
                onClick={() => menu.current?.close()}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </dialog>
    </>
  );
}

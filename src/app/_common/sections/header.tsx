"use client";
import { LanguageSwitch, useI18n } from "@/app/_common/providers/locale-provider";
import Link from "next/link";
import { ShoppingBag, X, Menu, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/app/_common/providers/cart-provider";
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
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <Link href="/" className="brand" aria-label={t("cardeoHome")}>
            <MerchantMark />
            <span>
              Cardeo
            </span>
          </Link>
          <nav className="desktop-nav" aria-label={t("mainNavigation")}>
            <Link href="/" aria-current={path === "/" ? "page" : undefined}>
              {t("home")}</Link>
            <Link
              href="/shop"
              aria-current={
                path.startsWith("/shop") || path.startsWith("/cards")
                  ? "page"
                  : undefined
              }
            >
              {t("browseCards")}</Link>
            <Link
              href="/about"
              aria-current={path === "/about" ? "page" : undefined}
            >
              {t("about")}</Link>
          </nav>
          <div className="header-actions">
            <LanguageSwitch />
            <button
              className="bag-button"
              onClick={() => drawer.current?.showModal()}
              aria-label={t("openBagCountCards", { count: cart.count })}
            >
              <ShoppingBag size={19} />
              <span className="bag-word">{t("bag")}</span>
              <span className="bag-count">{cart.count}</span>
            </button>
            <button
              className="icon-button mobile-menu"
              aria-label={t("openNavigation")}
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              onClick={() => {
                setMenuOpen(true);
                menu.current?.showModal();
              }}
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
            <h2 id="bag-title">{t("yourBag")}</h2>
            <button
              className="icon-button"
              aria-label={t("closeBag")}
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
                        <strong>{p?.name ?? t("unavailableCard")}</strong>
                        <small>
                          {t("countCards", { count: item.quantity })} ·{" "}
                          {p ? money(p.price_minor * item.quantity) : t("pleaseRemove")}
                        </small>
                      </div>
                      <button
                        className="text-button"
                        onClick={() => cart.remove(item.productId)}
                      >
                        {t("remove")}</button>
                    </li>
                  );
                })}
              </ul>
              <div className="mini-total">
                <span>{t("subtotal")}</span>
                <strong>{money(cart.total)}</strong>
              </div>
              <Link
                className="button primary full"
                href="/cart"
                onClick={() => drawer.current?.close()}
              >
                {t("viewBag")}<ChevronRight size={17} />
              </Link>
            </>
          ) : (
            <div className="empty-state">
              <ShoppingBag size={42} />
              <h3>{t("yourNextCardIsWaiting")}</h3>
              <p>{t("browseTheCardsAndFindAFavourite")}</p>
              <Link
                href="/shop"
                className="button primary"
                onClick={() => drawer.current?.close()}
              >
                {t("browseCards")}</Link>
            </div>
          )}
        </div>
      </dialog>
      <dialog id="site-menu" ref={menu} className="side-dialog" aria-labelledby="menu-title" onClose={() => setMenuOpen(false)}>
        <div className="dialog-inner">
          <div className="dialog-heading">
            <h2 id="menu-title">{t("navigation")}</h2>
            <button
              className="icon-button"
              aria-label={t("closeNavigation")}
              onClick={() => menu.current?.close()}
            >
              <X />
            </button>
          </div>
          <nav className="mobile-nav">
            {[
              ["/", t("home")],
              ["/shop", t("browseCards")],
              ["/about", t("about")],
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

"use client";
import { useI18n } from "@/components/i18n/locale-provider";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { CHARACTERS, type Character } from "@/lib/types";
import { useCart } from "@/components/cart/cart-provider";
import { ProductCard } from "@/components/catalogue/product-card";
type Filters = { character: string; max: number };
function Fields({
  value,
  change,
  prefix,
}: {
  value: Filters;
  change: (key: keyof Filters, value: string | number) => void;
  prefix: string;
}) {
  const { t, characterName } = useI18n();
  const { products } = useCart();
  const maxPrice = Math.max(1, ...products.map((p) => Math.ceil(p.price_minor / 100)));
  return (
    <>
      <fieldset>
        <legend>{t("character")}</legend>
        <div className="character-options">
          {["all", ...CHARACTERS].map((c) => (
            <label key={c}>
              <input
                type="radio"
                name={`${prefix}-character`}
                value={c}
                checked={value.character === c}
                onChange={() => change("character", c)}
              />
              <span>
                {c === "all"
                  ? t("allCharacters")
                  : characterName(c as Character)}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>
          <label htmlFor={`${prefix}-max`}>{t("maximumPrice")}</label>
          <strong>HK${value.max}</strong>
        </legend>
        <input
          id={`${prefix}-max`}
          type="range"
          min="0"
          max={maxPrice}
          step="1"
          value={value.max}
          onChange={(e) => change("max", Number(e.target.value))}
        />
        <div className="range-labels">
          <span>HK$0</span>
          <span>HK${maxPrice}</span>
        </div>
      </fieldset>
    </>
  );
}
export function Shop({
  referenceArt,
}: {
  referenceArt: boolean;
}) {
  const { t, characterName } = useI18n();
  const { products } = useCart();
  const maxPrice = Math.max(1, ...products.map((p) => Math.ceil(p.price_minor / 100)));
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const sort = params.get("sort") ?? "featured";
  const filters: Filters = {
    character: CHARACTERS.includes(
      params.get("character") as (typeof CHARACTERS)[number],
    )
      ? params.get("character")!
      : "all",
    max: params.has("max") && Number.isFinite(Number(params.get("max")))
      ? Math.min(maxPrice, Math.max(0, Number(params.get("max"))))
      : maxPrice,
  };
  const drawer = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<Filters>(filters);
  function update(entries: Record<string, string | number>, replace = false) {
    const next = new URLSearchParams();
    for (const key of ["q", "sort", "character", "max", "page"]) {
      const value = params.get(key);
      if (value) next.set(key, value);
    }
    for (const [k, v] of Object.entries(entries)) {
      if (
        v === "all" ||
        v === "" ||
        (k === "max" && v === maxPrice) ||
        (k === "sort" && v === "featured")
      )
        next.delete(k);
      else next.set(k, String(v));
    }
    if (!("page" in entries)) next.delete("page");
    const url = "/shop" + (next.size ? `?${next}` : "");
    if (replace) window.history.replaceState(null, "", url);
    else window.history.pushState(null, "", url);
  }
  function change(key: keyof Filters, value: string | number) {
    update({ [key]: value });
  }
  const matches = products
    .filter(
      (p) =>
        (!q || p.name.toLowerCase().includes(q.toLowerCase().trim())) &&
        (filters.character === "all" || p.character === filters.character) &&
        p.price_minor <= filters.max * 100,
    )
    .sort((a, b) =>
      sort === "price-asc"
        ? a.price_minor - b.price_minor || a.name.localeCompare(b.name)
        : sort === "price-desc"
          ? b.price_minor - a.price_minor || a.name.localeCompare(b.name)
          : sort === "name"
            ? a.name.localeCompare(b.name)
            : 0,
    );
  const pages = Math.max(1, Math.ceil(matches.length / 12));
  const page = Math.min(
    pages,
    Math.max(1, Math.floor(Number(params.get("page")) || 1)),
  );
  const shown = matches.slice((page - 1) * 12, page * 12);
  const activeCount =
    Number(filters.character !== "all") +
    Number(filters.max < maxPrice);
  function reset() {
    window.history.pushState(null, "", "/shop");
  }
  return (
    <div className="container shop-page">
      <div className="shop-intro">
        <div>
          <h1>{t("aPlaceForEveryCard")}</h1>
          <p>{t("catalogueIntroduction")}</p>
        </div>
      </div>
      <nav className="character-tabs" aria-label={t("browseByCharacter")}>
        <button
          className={filters.character === "all" ? "active" : ""}
          aria-pressed={filters.character === "all"}
          onClick={() => change("character", "all")}
        >
          {t("allCards")}<small>{products.length}</small>
        </button>
        {CHARACTERS.map((c) => (
          <button
            key={c}
            className={`character-${c.toLowerCase()} ${filters.character === c ? "active" : ""}`}
            aria-pressed={filters.character === c}
            onClick={() => change("character", c)}
          >
            <span className="character-dot" />
            {characterName(c)}
            <small>{products.filter((p) => p.character === c).length}</small>
          </button>
        ))}
      </nav>
      <div className="catalogue-layout">
        <aside className="filter-sidebar" aria-label={t("cardFilters")}>
          <div className="filter-heading">
            <h2>
              <SlidersHorizontal size={17} />
              {t("filterCards")}</h2>
            <button
              className="icon-button"
              aria-label={t("resetAllFilters")}
              onClick={reset}
            >
              <RotateCcw size={15} />
            </button>
          </div>
          <Fields value={filters} change={change} prefix="desktop" />
        </aside>
        <section className="catalogue-results" aria-label={t("cardCatalogue")}>
          <h2 className="sr-only">{t("cardCatalogue")}</h2>
          <div className="catalogue-toolbar">
            <label className="search-field">
              <Search size={18} />
              <span className="sr-only">{t("searchCards")}</span>
              <input
                type="search"
                placeholder={t("searchCardNames")}
                value={q}
                onChange={(e) => update({ q: e.target.value }, true)}
              />
            </label>
            <label className="sort-field">
              <span className="sr-only">{t("sortBy")}</span>
              <select
                value={sort}
                onChange={(e) => update({ sort: e.target.value })}
              >
                <option value="featured">{t("sortMerchantPicks")}</option>
                <option value="price-asc">{t("priceLowToHigh")}</option>
                <option value="price-desc">{t("priceHighToLow")}</option>
                <option value="name">{t("nameAToZ")}</option>
              </select>
            </label>
            <button
              className="button secondary mobile-filter-toggle"
              onClick={() => {
                setDraft(filters);
                drawer.current?.showModal();
              }}
            >
              <SlidersHorizontal size={17} />
              {t("filters")}{activeCount ? ` (${activeCount})` : ""}
            </button>
          </div>
          <div className="results-meta">
            <p aria-live="polite">
              {t("countCardsFound", { count: matches.length })}
              {matches.length > 0 && (
                <span>
                  {" "}
                  {t("showingStartEnd", { start: (page - 1) * 12 + 1, end: Math.min(page * 12, matches.length) })}
                </span>
              )}
            </p>
            {(activeCount > 0 || q) && (
              <button className="text-button" onClick={reset}>
                {t("clearFilters")}<X size={13} />
              </button>
            )}
          </div>
          {activeCount > 0 && (
            <div className="filter-chips">
              {filters.character !== "all" && (
                <button onClick={() => change("character", "all")}>
                  {characterName(filters.character as Character)}
                  <X size={12} />
                </button>
              )}
              {filters.max < maxPrice && (
                <button onClick={() => change("max", maxPrice)}>
                  {t("upToHkPrice", { price: filters.max })}
                  <X size={12} />
                </button>
              )}
            </div>
          )}
          {shown.length ? (
            <div className="product-grid">
              {shown.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  referenceArt={referenceArt}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state search-empty">
              <Search size={38} />
              <h2>{t("noCardsFoundThisTime")}</h2>
              <p>{t("tryAnotherSearchOrLoosenTheFilters")}</p>
              <button className="button primary" onClick={reset}>
                {t("browseAllCards")}</button>
            </div>
          )}
          {pages > 1 && (
            <nav className="pagination" aria-label={t("cataloguePages")}>
              <button
                aria-label={t("previousPage")}
                disabled={page === 1}
                onClick={() => update({ page: page - 1 })}
              >
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: pages }, (_, i) => (
                <button
                  key={i}
                  aria-label={t("pageValue", { p0: i + 1 })}
                  aria-current={page === i + 1 ? "page" : undefined}
                  onClick={() => update({ page: i + 1 })}
                >
                  {i + 1}
                </button>
              ))}
              <button
                aria-label={t("nextPage")}
                disabled={page === pages}
                onClick={() => update({ page: page + 1 })}
              >
                <ChevronRight size={18} />
              </button>
            </nav>
          )}
        </section>
      </div>
      <dialog
        ref={drawer}
        className="side-dialog"
        aria-labelledby="filter-title"
      >
        <form
          className="dialog-inner"
          onSubmit={(e) => {
            e.preventDefault();
            update(draft);
            drawer.current?.close();
          }}
        >
          <div className="dialog-heading">
            <h2 id="filter-title">{t("filterCards")}</h2>
            <button
              type="button"
              className="icon-button"
              aria-label={t("cancelFilters")}
              onClick={() => drawer.current?.close()}
            >
              <X />
            </button>
          </div>
          <Fields
            value={draft}
            change={(key, value) =>
              setDraft((old) => ({ ...old, [key]: value }))
            }
            prefix="mobile"
          />
          <div className="drawer-actions">
            <button
              type="button"
              className="button secondary"
              onClick={() =>
                setDraft({ character: "all", max: maxPrice })
              }
            >
              {t("reset")}</button>
            <button className="button primary" type="submit">
              {t("showResults")}</button>
          </div>
        </form>
      </dialog>
    </div>
  );
}

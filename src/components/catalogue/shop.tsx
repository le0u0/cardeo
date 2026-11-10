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
        <legend>{t("角色")}</legend>
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
                  ? t("全部角色")
                  : characterName(c as Character)}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>
          <label htmlFor={`${prefix}-max`}>{t("最高價格")}</label>
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
          <h1>{t("每張牌，都有它的位置。")}</h1>
          <p>{t("依角色挑選，尋找喜歡的卡牌。下一張好牌，或許就在這裡。")}</p>
        </div>
      </div>
      <nav className="character-tabs" aria-label={t("按角色瀏覽")}>
        <button
          className={filters.character === "all" ? "active" : ""}
          aria-pressed={filters.character === "all"}
          onClick={() => change("character", "all")}
        >
          {t("全部卡牌")}<small>{products.length}</small>
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
        <aside className="filter-sidebar" aria-label={t("卡牌篩選")}>
          <div className="filter-heading">
            <h2>
              <SlidersHorizontal size={17} />
              {t("篩選卡牌")}</h2>
            <button
              className="icon-button"
              aria-label={t("重設所有篩選")}
              onClick={reset}
            >
              <RotateCcw size={15} />
            </button>
          </div>
          <Fields value={filters} change={change} prefix="desktop" />
        </aside>
        <section className="catalogue-results" aria-label={t("卡牌目錄")}>
          <h2 className="sr-only">{t("卡牌目錄")}</h2>
          <div className="catalogue-toolbar">
            <label className="search-field">
              <Search size={18} />
              <span className="sr-only">{t("搜尋卡牌")}</span>
              <input
                type="search"
                placeholder={t("搜尋卡牌名稱…")}
                value={q}
                onChange={(e) => update({ q: e.target.value }, true)}
              />
            </label>
            <label className="sort-field">
              <span className="sr-only">{t("排序方式")}</span>
              <select
                value={sort}
                onChange={(e) => update({ sort: e.target.value })}
              >
                <option value="featured">{t("商人推薦")}</option>
                <option value="price-asc">{t("價格：由低至高")}</option>
                <option value="price-desc">{t("價格：由高至低")}</option>
                <option value="name">{t("名稱：A 至 Z")}</option>
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
              {t("篩選")}{activeCount ? ` (${activeCount})` : ""}
            </button>
          </div>
          <div className="results-meta">
            <p aria-live="polite">
              {t("找到 {count} 款卡牌", { count: matches.length })}
              {matches.length > 0 && (
                <span>
                  {" "}
                  {t("· 顯示 {start}–{end}", { start: (page - 1) * 12 + 1, end: Math.min(page * 12, matches.length) })}
                </span>
              )}
            </p>
            {(activeCount > 0 || q) && (
              <button className="text-button" onClick={reset}>
                {t("清除篩選")}<X size={13} />
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
                  {t("HK${price} 以下", { price: filters.max })}
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
              <h2>{t("這次，還沒找到合適的牌。")}</h2>
              <p>{t("換個關鍵字，或放寬篩選再看看。")}</p>
              <button className="button primary" onClick={reset}>
                {t("瀏覽全部卡牌")}</button>
            </div>
          )}
          {pages > 1 && (
            <nav className="pagination" aria-label={t("卡牌分頁")}>
              <button
                aria-label={t("上一頁")}
                disabled={page === 1}
                onClick={() => update({ page: page - 1 })}
              >
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: pages }, (_, i) => (
                <button
                  key={i}
                  aria-label={t("第 {p0} 頁", { p0: i + 1 })}
                  aria-current={page === i + 1 ? "page" : undefined}
                  onClick={() => update({ page: i + 1 })}
                >
                  {i + 1}
                </button>
              ))}
              <button
                aria-label={t("下一頁")}
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
            <h2 id="filter-title">{t("篩選卡牌")}</h2>
            <button
              type="button"
              className="icon-button"
              aria-label={t("取消篩選")}
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
              {t("重設")}</button>
            <button className="button primary" type="submit">
              {t("顯示結果")}</button>
          </div>
        </form>
      </dialog>
    </div>
  );
}

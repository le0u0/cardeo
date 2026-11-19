"use client";
import { useI18n } from "@/app/_common/context/locale-context/locale-context";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { CHARACTERS } from "@/lib/types";
import { useCart } from "@/app/_common/context/cart-context/cart-context";
import { type Filters } from "@/app/_common/widgets/filter-fields/filter-fields";
import { Pagination } from "@/app/_common/widgets/pagination/pagination";
import { ShopIntro } from "@/app/shop/_shop-intro/shop-intro";
import { CharacterTabs } from "@/app/shop/_character-tabs/character-tabs";
import { FilterSidebar } from "@/app/shop/_filter-sidebar/filter-sidebar";
import { ResultsToolbar } from "@/app/shop/_results-toolbar/results-toolbar";
import { ResultsSummary } from "@/app/shop/_results-summary/results-summary";
import { ProductResults } from "@/app/shop/_product-results/product-results";
import { FilterDrawer } from "@/app/shop/_filter-drawer/filter-drawer";
import "./shop.css";
export function Shop({
  referenceArt,
}: {
  referenceArt: boolean;
}) {
  const { t } = useI18n();
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
      <ShopIntro />
      <CharacterTabs
        selected={filters.character}
        onChange={(character) => change("character", character)}
      />
      <div className="catalogue-layout">
        <FilterSidebar filters={filters} change={change} reset={reset} />
        <section className="catalogue-results" aria-label={t("cardCatalogue")}>
          <h2 className="sr-only">{t("cardCatalogue")}</h2>
          <ResultsToolbar
            q={q}
            sort={sort}
            update={update}
            activeCount={activeCount}
            onOpenFilters={() => {
              setDraft(filters);
              drawer.current?.showModal();
            }}
          />
          <ResultsSummary
            matchCount={matches.length}
            page={page}
            q={q}
            activeCount={activeCount}
            filters={filters}
            maxPrice={maxPrice}
            change={change}
            reset={reset}
          />
          <ProductResults
            products={shown}
            referenceArt={referenceArt}
            reset={reset}
          />
          {pages > 1 && (
            <Pagination page={page} pages={pages} onChange={(next) => update({ page: next })} />
          )}
        </section>
      </div>
      <FilterDrawer
        drawer={drawer}
        draft={draft}
        setDraft={setDraft}
        update={update}
        maxPrice={maxPrice}
      />
    </div>
  );
}

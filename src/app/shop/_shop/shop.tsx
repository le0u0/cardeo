"use client";
import { useI18n } from "@/app/_common/context/locale-context/locale-context";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { CHARACTERS } from "@/lib/types";
import { useCards } from "@/app/_common/hooks/use-cards";
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
  const params = useSearchParams();
  const query = new URLSearchParams();
  if (params.get("character") && params.get("character") !== "all") query.set("class", params.get("character")!);
  if (params.get("q")) query.set("keyword", params.get("q")!);
  if (params.get("sort")) query.set("sort", params.get("sort")!);
  if (params.get("page")) query.set("page", params.get("page")!);
  if (params.has("max") && Number.isFinite(Number(params.get("max")))) query.set("max", String(Math.max(0, Math.floor(Number(params.get("max")) * 100))));
  const { data, error } = useCards(query.toString());
  const maxPrice = Math.max(1, Math.ceil((data?.maxPrice ?? 10000) / 100));
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
  const matchCount = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(matchCount / 12));
  const page = Math.min(pages, Math.max(1, Math.floor(Number(params.get("page")) || 1)));
  const shown = data?.items ?? [];
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
        counts={data?.counts ?? {}} total={Object.values(data?.counts ?? {}).reduce((a, b) => a + b, 0)}
        selected={filters.character}
        onChange={(character) => change("character", character)}
      />
      <div className="catalogue-layout">
        <FilterSidebar filters={filters} change={change} reset={reset} maxPrice={maxPrice} />
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
            matchCount={matchCount}
            page={page}
            q={q}
            activeCount={activeCount}
            filters={filters}
            maxPrice={maxPrice}
            change={change}
            reset={reset}
          />
          {error ? <p role="alert">{t("catalogueLoadFailed")}</p> : !data ? <p role="status">{t("loadingCards")}</p> : <ProductResults
            products={shown}
            referenceArt={referenceArt}
            reset={reset}
          />}
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

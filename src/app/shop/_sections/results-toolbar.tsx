"use client";
import { Search, SlidersHorizontal } from "lucide-react";
import { useI18n } from "@/app/_common/providers/locale-provider";
type Update = (
  entries: Record<string, string | number>,
  replace?: boolean,
) => void;
export function ResultsToolbar({
  q,
  sort,
  update,
  activeCount,
  onOpenFilters,
}: {
  q: string;
  sort: string;
  update: Update;
  activeCount: number;
  onOpenFilters: () => void;
}) {
  const { t } = useI18n();
  return (
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
        onClick={onOpenFilters}
      >
        <SlidersHorizontal size={17} />
        {t("filters")}{activeCount ? ` (${activeCount})` : ""}
      </button>
    </div>
  );
}

"use client";
import { SlidersHorizontal, RotateCcw } from "lucide-react";
import { useI18n } from "@/app/_common/context/locale-context/locale-context";
import { FilterFields, type Filters } from "@/app/_common/widgets/filter-fields/filter-fields";
import "./filter-sidebar.css";
export function FilterSidebar({
  filters,
  change,
  reset,
}: {
  filters: Filters;
  change: (key: keyof Filters, value: string | number) => void;
  reset: () => void;
}) {
  const { t } = useI18n();
  return (
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
      <FilterFields value={filters} change={change} prefix="desktop" />
    </aside>
  );
}

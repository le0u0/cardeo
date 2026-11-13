"use client";
import { X } from "lucide-react";
import { useI18n } from "@/app/_common/providers/locale-provider";
import { type Character } from "@/lib/types";
import { type Filters } from "@/app/shop/_widgets/filter-fields";
import "./results-summary.css";
export function ResultsSummary({
  matchCount,
  page,
  q,
  activeCount,
  filters,
  maxPrice,
  change,
  reset,
}: {
  matchCount: number;
  page: number;
  q: string;
  activeCount: number;
  filters: Filters;
  maxPrice: number;
  change: (key: keyof Filters, value: string | number) => void;
  reset: () => void;
}) {
  const { t, characterName } = useI18n();
  return (
    <>
      <div className="results-meta">
        <p aria-live="polite">
          {t("countCardsFound", { count: matchCount })}
          {matchCount > 0 && (
            <span>
              {" "}
              {t("showingStartEnd", { start: (page - 1) * 12 + 1, end: Math.min(page * 12, matchCount) })}
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
    </>
  );
}

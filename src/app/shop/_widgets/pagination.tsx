"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/app/_common/providers/locale-provider";
export function Pagination({
  page,
  pages,
  onChange,
}: {
  page: number;
  pages: number;
  onChange: (page: number) => void;
}) {
  const { t } = useI18n();
  return (
    <nav className="pagination" aria-label={t("cataloguePages")}>
      <button
        aria-label={t("previousPage")}
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeft size={18} />
      </button>
      {Array.from({ length: pages }, (_, i) => (
        <button
          key={i}
          aria-label={t("pageValue", { p0: i + 1 })}
          aria-current={page === i + 1 ? "page" : undefined}
          onClick={() => onChange(i + 1)}
        >
          {i + 1}
        </button>
      ))}
      <button
        aria-label={t("nextPage")}
        disabled={page === pages}
        onClick={() => onChange(page + 1)}
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}

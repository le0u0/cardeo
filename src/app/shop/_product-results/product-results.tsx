"use client";
import { Search } from "lucide-react";
import { useI18n } from "@/app/_common/context/locale-context/locale-context";
import { ProductCard } from "@/app/_common/widgets/product-card/product-card";
import { type Product } from "@/lib/types";
import "./product-results.css";
export function ProductResults({
  products,
  referenceArt,
  reset,
}: {
  products: Product[];
  referenceArt: boolean;
  reset: () => void;
}) {
  const { t } = useI18n();
  return products.length ? (
    <div className="product-grid">
      {products.map((p) => (
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
  );
}

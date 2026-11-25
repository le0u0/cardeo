"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useI18n } from "@/app/_common/context/locale-context/locale-context";
import { useCards } from "@/app/_common/hooks/use-cards";
import { ProductCard } from "@/app/_common/widgets/product-card/product-card";
import "./featured-picks.css";

export function FeaturedPicks({ referenceArt }: { referenceArt: boolean }) {
  const { t } = useI18n();
  const { data } = useCards("id=echo_form&id=adrenaline&id=feed&id=friendship&limit=30");
  const picks = data?.items ?? [];
  return (
    <section className="container featured-section">
      <div className="section-heading">
        <h2>{t("featuredMerchantPicks")}</h2>
        <Link href="/shop" className="quiet-link">
          {t("browseAllCards")} <ArrowUpRight size={18} />
        </Link>
      </div>
      <div className="featured-grid">
        {picks.map((product) => (
          <ProductCard key={product.id} product={product} referenceArt={referenceArt} />
        ))}
      </div>
    </section>
  );
}

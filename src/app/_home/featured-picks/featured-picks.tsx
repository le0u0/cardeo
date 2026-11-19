"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useI18n } from "@/app/_common/context/locale-context/locale-context";
import { useCart } from "@/app/_common/context/cart-context/cart-context";
import { ProductCard } from "@/app/_common/widgets/product-card/product-card";
import "./featured-picks.css";

export function FeaturedPicks({ referenceArt }: { referenceArt: boolean }) {
  const { t } = useI18n();
  const { products } = useCart();
  const picks = ["defect-echo-form", "silent-adrenaline", "ironclad-feed", "necrobinder-friendship"]
    .map((id) => products.find((product) => product.id === id))
    .filter((product) => !!product);
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

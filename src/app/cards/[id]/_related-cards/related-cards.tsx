import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getI18n } from "@/server/i18n-server";
import { ProductCard } from "@/app/_common/widgets/product-card/product-card";
import type { Product } from "@/lib/types";
import "./related-cards.css";

export async function RelatedCards({
  product,
  products,
  referenceArt,
}: {
  product: Product;
  products: Product[];
  referenceArt: boolean;
}) {
  const { t } = await getI18n();
  return (
    <section className="related-section">
      <div className="section-heading">
        <h2>{t("moreFromThisCollection")}</h2>
        <Link
          href={`/shop?character=${product.character}`}
          className="quiet-link"
        >
          {t("viewThisCollection")}<ArrowUpRight size={17} />
        </Link>
      </div>
      <div className="featured-grid">
        {products
          .filter(
            (p) => p.character === product.character && p.id !== product.id,
          )
          .slice(0, 4)
          .map((p) => (
            <ProductCard key={p.id} product={p} referenceArt={referenceArt} />
          ))}
      </div>
    </section>
  );
}

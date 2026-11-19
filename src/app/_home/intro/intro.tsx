"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/app/_common/context/locale-context/locale-context";
import { useCart } from "@/app/_common/context/cart-context/cart-context";
import { CardArt } from "@/app/_common/widgets/card-art/card-art";
import "./intro.css";

export function HomeIntro({ referenceArt }: { referenceArt: boolean }) {
  const { t } = useI18n();
  const { products } = useCart();
  const showcase = ["silent-adrenaline", "ironclad-offering", "regent-big-bang"]
    .map((id) => products.find((product) => product.id === id))
    .filter((product) => !!product);
  return (
    <section className="hero container" data-enter>
      <div className="hero-copy">
        <h1>{t("theSpire")}<br />{t("cardShop")}</h1>
        <p className="hero-description">
          {t("homeIntroduction")}
        </p>
        <div className="hero-actions">
          <Link href="/shop" className="button primary">
            {t("browseCards")} <ArrowRight size={18} />
          </Link>
        </div>
      </div>
      <div className="hero-display" aria-label={t("featuredCardPreviews")}>
        <div className="hero-cards">
          {showcase.map((product) => (
            <Link
              href={`/cards/${product.id}`}
              className="hero-card"
              key={product.id}
              aria-label={t("viewValue", { p0: product.name })}
            >
              <CardArt product={product} priority referenceArt={referenceArt} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

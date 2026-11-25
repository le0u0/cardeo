"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/app/_common/context/locale-context/locale-context";
import { useCards } from "@/app/_common/hooks/use-cards";
import { CardArt } from "@/app/_common/widgets/card-art/card-art";
import "./intro.css";

export function HomeIntro({ referenceArt }: { referenceArt: boolean }) {
  const { t } = useI18n();
  const { data } = useCards("id=adrenaline&id=offering&id=big_bang&limit=30");
  const showcase = data?.items ?? [];
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

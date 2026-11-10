"use client";
import Link from "next/link";
import { ArrowUpRight, ArrowRight, Sword, Leaf, Orbit, Crown, Skull } from "lucide-react";
import { useI18n } from "@/components/i18n/locale-provider";
import { useCart } from "@/components/cart/cart-provider";
import { CardArt } from "@/components/catalogue/card-art";
import { ProductCard } from "@/components/catalogue/product-card";
import { CHARACTERS } from "@/lib/types";

const characterIcons = [Sword, Leaf, Orbit, Crown, Skull];

export function Home({ referenceArt }: { referenceArt: boolean }) {
  const { t, characterName } = useI18n();
  const { products } = useCart();
  const showcase = ["silent-adrenaline", "ironclad-offering", "regent-big-bang"]
    .map((id) => products.find((product) => product.id === id))
    .filter((product) => !!product);
  const picks = ["defect-echo-form", "silent-adrenaline", "ironclad-feed", "necrobinder-friendship"]
    .map((id) => products.find((product) => product.id === id))
    .filter((product) => !!product);

  return (
    <>
      <section className="hero container" data-enter>
        <div className="hero-copy">
          <h1>{t("你的尖塔")}<br />{t("卡牌小店。")}</h1>
          <p className="hero-description">
            {t("從五位角色的卡牌中，挑選下一次爬塔的靈感。")}
          </p>
          <div className="hero-actions">
            <Link href="/shop" className="button primary">
              {t("瀏覽卡牌")} <ArrowRight size={18} />
            </Link>
          </div>
        </div>
        <div className="hero-display" aria-label={t("精選卡牌預覽")}>
          <div className="hero-cards">
            {showcase.map((product) => (
              <Link
                href={`/cards/${product.slug}`}
                className="hero-card"
                key={product.id}
                aria-label={t("查看 {p0}", { p0: product.name })}
              >
                <CardArt product={product} priority referenceArt={referenceArt} />
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="container collection-section">
        <div className="section-heading">
          <h2>{t("按角色選牌")}</h2>
          <Link href="/shop" className="quiet-link">
            {t("全部卡牌")} <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="character-collections">
          {CHARACTERS.map((character, index) => {
            const Icon = characterIcons[index];
            return (
              <Link
                key={character}
                href={`/shop?character=${character}`}
                className={`character-collection character-${character.toLowerCase()}`}
              >
                <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
                <h3>{characterName(character)}</h3>
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </section>
      <section className="container featured-section">
        <div className="section-heading">
          <h2>{t("商人精選")}</h2>
          <Link href="/shop" className="quiet-link">
            {t("瀏覽全部卡牌")} <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="featured-grid">
          {picks.map((product) => (
            <ProductCard key={product.id} product={product} referenceArt={referenceArt} />
          ))}
        </div>
      </section>
    </>
  );
}

"use client";
import Link from "next/link";
import { ArrowUpRight, Sword, Leaf, Orbit, Crown, Skull } from "lucide-react";
import { useI18n } from "@/app/_common/providers/locale-provider";
import { CHARACTERS } from "@/lib/types";
import "./character-collections.css";

const characterIcons = [Sword, Leaf, Orbit, Crown, Skull];

export function CharacterCollections() {
  const { t, characterName } = useI18n();
  return (
    <section className="container collection-section">
      <div className="section-heading">
        <h2>{t("shopByCharacter")}</h2>
        <Link href="/shop" className="quiet-link">
          {t("allCards")} <ArrowUpRight size={18} />
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
  );
}

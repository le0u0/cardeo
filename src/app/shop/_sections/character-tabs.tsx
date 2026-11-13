"use client";
import { useI18n } from "@/app/_common/providers/locale-provider";
import { useCart } from "@/app/_common/providers/cart-provider";
import { CHARACTERS } from "@/lib/types";
export function CharacterTabs({
  selected,
  onChange,
}: {
  selected: string;
  onChange: (character: string) => void;
}) {
  const { t, characterName } = useI18n();
  const { products } = useCart();
  return (
    <nav className="character-tabs" aria-label={t("browseByCharacter")}>
      <button
        className={selected === "all" ? "active" : ""}
        aria-pressed={selected === "all"}
        onClick={() => onChange("all")}
      >
        {t("allCards")}<small>{products.length}</small>
      </button>
      {CHARACTERS.map((c) => (
        <button
          key={c}
          className={`character-${c.toLowerCase()} ${selected === c ? "active" : ""}`}
          aria-pressed={selected === c}
          onClick={() => onChange(c)}
        >
          <span className="character-dot" />
          {characterName(c)}
          <small>{products.filter((p) => p.character === c).length}</small>
        </button>
      ))}
    </nav>
  );
}

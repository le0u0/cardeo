"use client";
import { useI18n } from "@/app/_common/context/locale-context/locale-context";
import { CHARACTERS } from "@/lib/types";
import "./character-tabs.css";
export function CharacterTabs({
  selected,
  onChange,
  counts, total,
}: {
  selected: string;
  counts: Record<string, number>; total: number;
  onChange: (character: string) => void;
}) {
  const { t, characterName } = useI18n();
  return (
    <nav className="character-tabs" aria-label={t("browseByCharacter")}>
      <button
        className={selected === "all" ? "active" : ""}
        aria-pressed={selected === "all"}
        onClick={() => onChange("all")}
      >
        {t("allCards")}<small>{total}</small>
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
          <small>{counts[c] ?? 0}</small>
        </button>
      ))}
    </nav>
  );
}

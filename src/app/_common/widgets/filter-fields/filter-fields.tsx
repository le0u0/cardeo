"use client";
import { useI18n } from "@/app/_common/context/locale-context/locale-context";
import { CHARACTERS, type Character } from "@/lib/types";
import { useCart } from "@/app/_common/context/cart-context/cart-context";
import "./filter-fields.css";
export type Filters = { character: string; max: number };
export function FilterFields({
  value,
  change,
  prefix,
}: {
  value: Filters;
  change: (key: keyof Filters, value: string | number) => void;
  prefix: string;
}) {
  const { t, characterName } = useI18n();
  const { products } = useCart();
  const maxPrice = Math.max(1, ...products.map((p) => Math.ceil(p.price_minor / 100)));
  return (
    <>
      <fieldset>
        <legend>{t("character")}</legend>
        <div className="character-options">
          {["all", ...CHARACTERS].map((c) => (
            <label key={c}>
              <input
                type="radio"
                name={`${prefix}-character`}
                value={c}
                checked={value.character === c}
                onChange={() => change("character", c)}
              />
              <span>
                {c === "all"
                  ? t("allCharacters")
                  : characterName(c as Character)}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>
          <label htmlFor={`${prefix}-max`}>{t("maximumPrice")}</label>
          <strong>HK${value.max}</strong>
        </legend>
        <input
          id={`${prefix}-max`}
          type="range"
          min="0"
          max={maxPrice}
          step="1"
          value={value.max}
          onChange={(e) => change("max", Number(e.target.value))}
        />
        <div className="range-labels">
          <span>HK$0</span>
          <span>HK${maxPrice}</span>
        </div>
      </fieldset>
    </>
  );
}

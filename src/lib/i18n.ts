import { english, englishSingular, type Message } from "./messages";
import { CHARACTER_ZH, type Character } from "./types";

export type Locale = "zh-Hant" | "en";
export const LOCALE_COOKIE = "cardeo.locale";
export function parseLocale(value?: string): Locale {
  return value === "en" ? "en" : "zh-Hant";
}
export function createI18n(locale: Locale) {
  return {
    locale,
    characterName: (character: Character) =>
      locale === "en" ? character : CHARACTER_ZH[character],
    t: (message: Message, values: Record<string, string | number> = {}) => {
      const text = locale === "en"
        ? (values.count === 1 ? englishSingular[message] : undefined) ?? english[message]
        : message;
      return text.replace(/\{(\w+)\}/g, (placeholder, key: string) =>
        key in values ? String(values[key]) : placeholder,
      );
    },
  };
}

import { describe, expect, it } from "vitest";
import { createI18n, parseLocale } from "./i18n";
import { chinese, english, type Message } from "./messages";

describe("storefront translations", () => {
  it("defaults unsupported language preferences to Traditional Chinese", () => {
    expect(parseLocale(undefined)).toBe("zh-Hant");
    expect(parseLocale("fr")).toBe("zh-Hant");
    expect(parseLocale("en")).toBe("en");
  });
  it("renders one character name for the selected language", () => {
    expect(createI18n("zh-Hant").characterName("Ironclad")).toBe("鐵衛");
    expect(createI18n("en").characterName("Ironclad")).toBe("Ironclad");
  });
  it("interpolates whole sentences in either language", () => {
    expect(createI18n("en").t("countCardsFound", { count: 30 })).toBe("30 cards found");
    expect(createI18n("zh-Hant").t("countCardsFound", { count: 30 })).toBe("找到 30 款卡牌");
  });
  it("uses singular English card counts", () => {
    expect(createI18n("en").t("countCardsFound", { count: 1 })).toBe("1 card found");
    expect(createI18n("en").t("countCards", { count: 1 })).toBe("1 card");
  });
  it("keeps translated messages free of Chinese text and preserves placeholders", () => {
    for (const [key, translated] of Object.entries(english)) {
      const source = chinese[key as Message];
      expect(translated).not.toMatch(/[\u3400-\u9fff]/);
      expect(translated.match(/\{\w+\}/g)?.sort() ?? []).toEqual(source.match(/\{\w+\}/g)?.sort() ?? []);
    }
  });
});

import type { CardClass, CardRarity, CardType } from "@/server/enums/card";

type LocalizedText = {
  en: string;
  "zh-HK": string;
};

export type Card = {
  id: string;
  nameI18n: LocalizedText;
  descI18n: LocalizedText;
  class: CardClass;
  type: CardType;
  rarity: CardRarity;
  cost: {
    energy: number | "X" | null;
    stars: number | "X" | null;
  };
  isUpgraded: boolean;
  imageFiles: LocalizedText;
};

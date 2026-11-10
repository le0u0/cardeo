export const CHARACTERS = [
  "Ironclad",
  "Silent",
  "Defect",
  "Regent",
  "Necrobinder",
] as const;
export type Character = (typeof CHARACTERS)[number];
export const CHARACTER_ZH: Record<Character, string> = {
  Ironclad: "鐵衛",
  Silent: "靜默",
  Defect: "故障機器人",
  Regent: "攝政王",
  Necrobinder: "死靈師",
};
export const SOURCE_URL =
  "https://mobalytics.gg/slay-the-spire-2/tier-lists/cards";
export const SOURCE_DATE = "2026-08-12";
export type Product = {
  id: string;
  slug: string;
  name: string;
  character: Character;
  price_minor: number;
  image_url: string;
  description: string;
};
export type CartItem = { productId: string; quantity: number };
export type Receipt = {
  reference: string;
  createdAt: string;
  total: number;
  currency: "HKD";
  items: { name: string; unitPrice: number; quantity: number }[];
};
export type CheckoutInput = {
  items: CartItem[];
  expectedTotal: number;
  requestKey: string;
  outcome: "success" | "failure";
};
export type CheckoutResult =
  | { kind: "completed"; receipt: Receipt }
  | { kind: "requote"; total: number }
  | { kind: "invalid" | "conflict" | "failed" | "limited"; message: string };
export const money = (minor: number) =>
  "HK$" +
  (minor / 100).toLocaleString("en-HK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

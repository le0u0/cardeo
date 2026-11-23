import type { Character } from "@/lib/types";

export type CardClass = Character | "Colorless" | "Event" | "Curse" | "Status" | "Quest" | "Token";
export type CardType = "attack" | "skill" | "power" | "curse" | "status" | "quest";
export type CardRarity = "basic" | "common" | "uncommon" | "rare" | "ancient" | "curse" | "status" | "event" | "quest" | "token";

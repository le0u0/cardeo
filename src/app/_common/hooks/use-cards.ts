"use client";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
type Result = { items: Product[]; total: number; maxPrice: number; counts: Record<string, number> };
type State = { query: string; data: Result | null; error: boolean };
export function useCards(query: string) {
  const [state, setState] = useState<State | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/cards?${query}`, { signal: controller.signal, cache: "no-store" })
      .then((response) => { if (!response.ok) throw new Error("Catalogue unavailable"); return response.json() as Promise<Result>; })
      .then(data => setState({ query, data, error: false }))
      .catch(() => { if (!controller.signal.aborted) setState({ query, data: null, error: true }); });
    return () => controller.abort();
  }, [query]);
  return state?.query === query ? state : { data: null, error: false };
}

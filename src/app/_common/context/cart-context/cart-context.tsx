"use client";
import { useI18n } from "@/app/_common/context/locale-context/locale-context";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { CartItem, Product } from "@/lib/types";
import "./cart-context.css";
const KEY = "cardeo.cart.v1";
let memory = "[]";
let storageUnavailable = false;
function snapshot() {
  if (storageUnavailable) return memory;
  try {
    return localStorage.getItem(KEY) ?? memory;
  } catch {
    return memory;
  }
}
function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener("cardeo-cart", listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener("cardeo-cart", listener);
  };
}
function decode(raw: string): CartItem[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    return parsed.slice(0, 30).flatMap((item) => {
      if (
        !item ||
        typeof item.productId !== "string" ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 10 ||
        seen.has(item.productId)
      )
        return [];
      seen.add(item.productId);
      return [{ productId: item.productId, quantity: item.quantity }];
    });
  } catch {
    return [];
  }
}
function save(items: CartItem[]) {
  memory = JSON.stringify(items);
  try {
    localStorage.setItem(KEY, memory);
  } catch {
    storageUnavailable = true;
  }
  window.dispatchEvent(new Event("cardeo-cart"));
}
type CartContextType = {
  items: CartItem[];
  products: Product[];
  ready: boolean;
  catalogueReady: boolean;
  catalogueError: string;
  reloadCatalogue: () => void;
  count: number;
  total: number;
  add: (product: Product, quantity?: number) => void;
  setQuantity: (id: string, q: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  notify: (text: string) => void;
};
const CartContext = createContext<CartContextType | null>(null);
export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { t } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadedIds, setLoadedIds] = useState("");
  const [catalogueError, setCatalogueError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const raw = useSyncExternalStore(subscribe, snapshot, () => "[]");
  const items = useMemo(() => decode(raw), [raw]);
  const ids = items.map(item => item.productId).join(",");
  useEffect(() => {
    if (!ids) return;
    const query = new URLSearchParams();
    ids.split(",").forEach(id => query.append("id", id));
    query.set("limit", "30");
    const controller = new AbortController();
    fetch(`/api/cards?${query}`, {
      cache: "no-store",
      signal: AbortSignal.any([controller.signal, AbortSignal.timeout(12000)]),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Catalogue unavailable");
        return response.json() as Promise<{ items: Product[] }>;
      })
      .then((data) => {
        setProducts(data.items);
        setCatalogueError("");
        setLoadedIds(ids);
      })
      .catch(() => {
        if (!controller.signal.aborted) setCatalogueError(t("catalogueLoadFailed"));
      });
    return () => controller.abort();
  }, [attempt, t, ids]);
  const ready = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const catalogueReady = !ids || loadedIds === ids;
  const [notice, setNotice] = useState("");
  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(""), 3500);
      return () => clearTimeout(timer);
    }
  }, [notice]);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce(
    (sum, i) =>
      sum +
      (products.find((p) => p.id === i.productId)?.price_minor ?? 0) *
        i.quantity,
    0,
  );
  function add(product: Product, quantity = 1) {
    const id = product.id;
    const current = decode(snapshot());
    const old = current.find((i) => i.productId === id);
    if (old && old.quantity + quantity > 10) {
      setNotice(t("youCanChooseUpTo10Of"));
      return;
    }
    if (!old && current.length >= 30) {
      setNotice(t("yourBagCanHoldUpTo30"));
      return;
    }
    save(
      old
        ? current.map((i) =>
            i.productId === id ? { ...i, quantity: i.quantity + quantity } : i,
          )
        : [...current, { productId: id, quantity }],
    );
    setNotice(t("valueAddedToYourBag", { p0: product.name }));
  }
  const value = {
    products: ids ? products : [],
    items,
    catalogueReady,
    catalogueError,
    reloadCatalogue: () => setAttempt((value) => value + 1),
    ready: ready && catalogueReady,
    count,
    total,
    add,
    notify: setNotice,
    setQuantity(id: string, q: number) {
      if (Number.isInteger(q) && q >= 1 && q <= 10)
        save(
          decode(snapshot()).map((i) =>
            i.productId === id ? { ...i, quantity: q } : i,
          ),
        );
    },
    remove(id: string) {
      save(decode(snapshot()).filter((i) => i.productId !== id));
    },
    clear() {
      save([]);
    },
  };
  return (
    <CartContext.Provider value={value}>
      {children}
      <div
        className={`toast ${notice ? "visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        {notice}
      </div>
    </CartContext.Provider>
  );
}
export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error("Missing CartProvider");
  return cart;
}

export function CatalogueContent({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const cart = useCart();
  if (cart.catalogueError) {
    return (
      <div className="container page-pad empty-state" role="alert">
        <p>{cart.catalogueError}</p>
        <button className="button primary" onClick={cart.reloadCatalogue}>{t("reload")}</button>
      </div>
    );
  }
  if (!cart.catalogueReady) {
    return <div className="container page-pad" role="status">{t("loadingCards")}</div>;
  }
  return children;
}

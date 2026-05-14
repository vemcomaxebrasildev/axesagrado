import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { products as seedProducts, type Product } from "@/data/products";

export type ProductVariation = {
  id: string;
  name: string;
  sku?: string;
  price?: number;
  stock: number;
};

export type AdminProduct = Product & {
  videoUrl?: string;
  variations?: ProductVariation[];
  active?: boolean;
};

type Ctx = {
  items: AdminProduct[];
  upsert: (p: AdminProduct) => void;
  remove: (slug: string) => void;
  setStock: (slug: string, stock: number) => void;
  reset: () => void;
};

const ProductsContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "axe-admin-products-v1";

const seed: AdminProduct[] = seedProducts.map((p) => ({ ...p, active: true, variations: [] }));

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<AdminProduct[]>(seed);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const upsert = useCallback((p: AdminProduct) => {
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.slug === p.slug);
      if (idx === -1) return [p, ...prev];
      const next = [...prev];
      next[idx] = p;
      return next;
    });
  }, []);

  const remove = useCallback((slug: string) => {
    setItems((prev) => prev.filter((p) => p.slug !== slug));
  }, []);

  const setStock = useCallback((slug: string, stock: number) => {
    setItems((prev) => prev.map((p) => (p.slug === slug ? { ...p, stock } : p)));
  }, []);

  const reset = useCallback(() => setItems(seed), []);

  const value = useMemo(() => ({ items, upsert, remove, setStock, reset }), [items, upsert, remove, setStock, reset]);

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used inside ProductsProvider");
  return ctx;
}

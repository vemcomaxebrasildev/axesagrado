import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/site/ProductCard";
import { categories, products } from "@/data/products";
import { cn } from "@/lib/utils";

type Search = { cat?: string; sort?: string; q?: string };

export const Route = createFileRoute("/catalogo")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    cat: typeof s.cat === "string" ? s.cat : undefined,
    sort: typeof s.sort === "string" ? s.sort : undefined,
    q: typeof s.q === "string" ? s.q : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Catálogo — Axé Sagrado" },
      { name: "description", content: "Catálogo completo de imagens, guias, velas e artigos ritualísticos de Umbanda." },
      { property: "og:title", content: "Catálogo de Umbanda — Axé Sagrado" },
    ],
  }),
  component: CatalogPage,
});

function CatalogPage() {
  const search = Route.useSearch();
  const [sort, setSort] = useState(search.sort ?? "relevance");
  const [maxPrice, setMaxPrice] = useState(800);

  const list = useMemo(() => {
    let l = [...products];
    if (search.cat) l = l.filter((p) => p.category === search.cat);
    l = l.filter((p) => p.price <= maxPrice);
    if (sort === "price-asc") l.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") l.sort((a, b) => b.price - a.price);
    if (sort === "rating") l.sort((a, b) => b.rating - a.rating);
    return l;
  }, [search.cat, sort, maxPrice]);

  const activeCat = categories.find((c) => c.slug === search.cat);

  return (
    <div className="bg-warm">
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-7xl px-6 py-14 md:px-8 md:py-20">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            {activeCat ? "Categoria" : "Todo o catálogo"}
          </p>
          <h1 className="mt-3 text-balance font-display text-4xl font-semibold tracking-tight md:text-6xl">
            {activeCat ? activeCat.name : "O catálogo do sagrado"}
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-muted-foreground">
            {activeCat?.description ??
              "Navegue por imagens, guias, velas e artigos ritualísticos cuidadosamente selecionados."}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 md:grid md:grid-cols-12 md:gap-10 md:px-8">
        {/* Sidebar filtros */}
        <aside className="md:col-span-3">
          <div className="sticky top-24">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Categorias
            </h3>
            <ul className="mt-4 space-y-1.5">
              <li>
                <Link
                  to="/catalogo"
                  className={cn(
                    "block rounded-md px-3 py-2 text-sm transition",
                    !search.cat ? "bg-foreground text-background" : "text-foreground/80 hover:bg-muted",
                  )}
                >
                  Todas as peças
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    to="/catalogo"
                    search={{ cat: c.slug } as never}
                    className={cn(
                      "block rounded-md px-3 py-2 text-sm transition",
                      search.cat === c.slug
                        ? "bg-foreground text-background"
                        : "text-foreground/80 hover:bg-muted",
                    )}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="mt-10 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Faixa de preço
            </h3>
            <div className="mt-4">
              <input
                type="range"
                min={50}
                max={800}
                step={10}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>R$ 50</span>
                <span className="font-medium text-foreground">até R$ {maxPrice}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Grid */}
        <div className="mt-10 md:col-span-9 md:mt-0">
          <div className="mb-6 flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{list.length}</span> peças
            </p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm focus:border-primary focus:outline-none"
            >
              <option value="relevance">Relevância</option>
              <option value="price-asc">Menor preço</option>
              <option value="price-desc">Maior preço</option>
              <option value="rating">Melhor avaliação</option>
            </select>
          </div>

          {list.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center">
              <p className="font-display text-xl">Nenhuma peça encontrada.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Tente ajustar os filtros ou ver todas as categorias.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3">
              {list.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

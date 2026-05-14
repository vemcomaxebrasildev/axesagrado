import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Star, Truck, Shield, Sparkles, Plus, Minus } from "lucide-react";
import { useState } from "react";
import { products, formatBRL } from "@/data/products";
import { ProductCard } from "@/components/site/ProductCard";
import { ShareMenu } from "@/components/site/ShareMenu";
import { useCart } from "@/contexts/CartContext";

export const Route = createFileRoute("/produto/$slug")({
  loader: ({ params }) => {
    const product = products.find((p) => p.slug === params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — Axé Sagrado` },
          { name: "description", content: loaderData.product.shortDescription },
          { property: "og:title", content: loaderData.product.name },
          { property: "og:description", content: loaderData.product.shortDescription },
          { property: "og:image", content: loaderData.product.image },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-32 text-center">
      <h1 className="font-display text-4xl">Peça não encontrada.</h1>
      <Link to="/catalogo" className="mt-6 inline-block text-primary underline">
        Voltar ao catálogo
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl px-6 py-32 text-center">
      <h1 className="font-display text-3xl">Algo não fluiu.</h1>
      <p className="mt-3 text-muted-foreground">{error.message}</p>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { add } = useCart();
  const [qty, setQty] = useState(1);

  const related = products.filter((p) => p.category === product.category && p.slug !== product.slug).slice(0, 4);
  const installments = (product.price / 6).toFixed(2).replace(".", ",");

  return (
    <div className="bg-warm">
      <div className="mx-auto max-w-7xl px-6 pt-8 md:px-8">
        <Link
          to="/catalogo"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao catálogo
        </Link>
      </div>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-10 md:grid-cols-12 md:gap-16 md:px-8 md:py-16">
        <div className="md:col-span-7">
          <div className="overflow-hidden rounded-2xl bg-muted shadow-altar">
            <img
              src={product.image}
              alt={product.name}
              width={1024}
              height={1280}
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
        </div>

        <div className="md:col-span-5">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            {product.entity ?? product.category.replace("-", " ")}
          </p>
          <h1 className="mt-3 text-balance font-display text-4xl font-semibold tracking-tight md:text-5xl">
            {product.name}
          </h1>

          <div className="mt-4 flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1 text-primary">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-4 w-4"
                  fill={i < Math.round(product.rating) ? "currentColor" : "transparent"}
                  strokeWidth={1.5}
                />
              ))}
            </div>
            <span className="text-muted-foreground">
              {product.rating.toFixed(1)} · {product.reviews} avaliações
            </span>
          </div>

          <p className="mt-6 text-pretty text-base leading-relaxed text-foreground/85">
            {product.description}
          </p>

          <div className="mt-8 flex items-end gap-3">
            {product.oldPrice && (
              <span className="text-base text-muted-foreground line-through">
                {formatBRL(product.oldPrice)}
              </span>
            )}
            <span className="font-display text-4xl font-semibold text-foreground">
              {formatBRL(product.price)}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            ou 6× de R$ {installments} sem juros · 5% off no PIX
          </p>

          <div className="mt-8 flex items-center gap-3">
            <div className="inline-flex items-center rounded-full border border-border bg-card">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-11 w-11 place-items-center text-foreground/70 hover:text-foreground"
                aria-label="Diminuir"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-medium">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="grid h-11 w-11 place-items-center text-foreground/70 hover:text-foreground"
                aria-label="Aumentar"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() => add(product, qty)}
              className="flex-1 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:bg-primary"
            >
              Adicionar à sacola
            </button>
          </div>

          <div className="mt-6">
            <ShareMenu slug={product.slug} title={product.name} variant="inline" />
          </div>

          <ul className="mt-8 space-y-3 border-t border-border pt-6 text-sm">
            <li className="flex items-center gap-3 text-foreground/85">
              <Truck className="h-4 w-4 text-accent" /> {product.shipping} · Frete grátis acima de R$ 350
            </li>
            <li className="flex items-center gap-3 text-foreground/85">
              <Shield className="h-4 w-4 text-accent" /> Embalagem reforçada com proteção espiritual
            </li>
            <li className="flex items-center gap-3 text-foreground/85">
              <Sparkles className="h-4 w-4 text-accent" /> Peça única feita à mão por artesãos brasileiros
            </li>
          </ul>

          <dl className="mt-8 grid grid-cols-2 gap-4 rounded-2xl border border-border bg-card p-5 text-sm">
            <div>
              <dt className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Dimensões</dt>
              <dd className="mt-1 font-medium">{product.dimensions}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Peso</dt>
              <dd className="mt-1 font-medium">{product.weight}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Estoque</dt>
              <dd className="mt-1 font-medium">{product.stock} disponíveis</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Categoria</dt>
              <dd className="mt-1 font-medium capitalize">{product.category.replace("-", " ")}</dd>
            </div>
          </dl>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-24 md:px-8">
          <h2 className="font-display text-2xl font-semibold md:text-3xl">
            Da mesma linha
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

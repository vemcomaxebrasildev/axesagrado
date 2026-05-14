import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { formatBRL } from "@/data/products";

export const Route = createFileRoute("/carrinho")({
  head: () => ({
    meta: [{ title: "Sacola — Axé Sagrado" }],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, setQty, remove, subtotal, count, clear } = useCart();
  const shipping = subtotal > 350 ? 0 : subtotal > 0 ? 24.9 : 0;
  const total = subtotal + shipping;

  if (count === 0) {
    return (
      <div className="bg-warm">
        <div className="mx-auto max-w-2xl px-6 py-32 text-center md:px-8">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-secondary text-foreground/70">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <h1 className="mt-6 font-display text-4xl font-semibold">Sua sacola está vazia.</h1>
          <p className="mt-3 text-muted-foreground">
            Encontre a peça certa para fortalecer o seu axé.
          </p>
          <Link
            to="/catalogo"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:bg-primary"
          >
            Explorar o catálogo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-warm">
      <section className="mx-auto max-w-7xl px-6 py-14 md:px-8 md:py-20">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Sua sacola</p>
        <h1 className="mt-3 font-display text-4xl font-semibold md:text-5xl">
          Quase lá, irmão de fé.
        </h1>

        <div className="mt-12 grid gap-10 md:grid-cols-12">
          <div className="md:col-span-8">
            <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
              {items.map(({ product, qty }) => (
                <li key={product.slug} className="flex gap-4 p-4 md:gap-6 md:p-6">
                  <Link
                    to="/produto/$slug"
                    params={{ slug: product.slug }}
                    className="block w-24 shrink-0 overflow-hidden rounded-lg bg-muted md:w-32"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="aspect-[4/5] w-full object-cover"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                          {product.entity ?? product.category.replace("-", " ")}
                        </p>
                        <h3 className="mt-1 font-display text-lg font-semibold">
                          {product.name}
                        </h3>
                      </div>
                      <button
                        onClick={() => remove(product.slug)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label="Remover"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-3 flex items-end justify-between gap-4">
                      <div className="inline-flex items-center rounded-full border border-border">
                        <button
                          onClick={() => setQty(product.slug, qty - 1)}
                          className="grid h-9 w-9 place-items-center text-foreground/70 hover:text-foreground"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-7 text-center text-sm font-medium">{qty}</span>
                        <button
                          onClick={() => setQty(product.slug, qty + 1)}
                          className="grid h-9 w-9 place-items-center text-foreground/70 hover:text-foreground"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="font-display text-lg font-semibold">
                        {formatBRL(product.price * qty)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <button
              onClick={clear}
              className="mt-4 text-xs text-muted-foreground hover:text-destructive"
            >
              Esvaziar sacola
            </button>
          </div>

          <aside className="md:col-span-4">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-soft">
              <h2 className="font-display text-xl font-semibold">Resumo</h2>
              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal ({count} itens)</dt>
                  <dd className="font-medium">{formatBRL(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Frete</dt>
                  <dd className="font-medium">
                    {shipping === 0 ? (
                      <span className="text-accent">Grátis</span>
                    ) : (
                      formatBRL(shipping)
                    )}
                  </dd>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex items-end justify-between">
                    <dt className="font-medium">Total</dt>
                    <dd className="font-display text-2xl font-semibold">{formatBRL(total)}</dd>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    em até 6× sem juros · 5% off no PIX
                  </p>
                </div>
              </dl>

              <button className="mt-6 w-full rounded-full bg-foreground py-3.5 text-sm font-medium text-background transition hover:bg-primary">
                Finalizar compra
              </button>
              <p className="mt-3 text-center text-[11px] text-muted-foreground">
                Pagamento seguro · PIX, cartão e boleto
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

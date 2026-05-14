import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, Plus, Minus, Sparkles, ArrowRight, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { products, formatBRL, type Product } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/conga")({
  head: () => ({
    meta: [
      { title: "Monte seu Congá — Axé Sagrado" },
      {
        name: "description",
        content:
          "Monte o seu altar de Umbanda escolhendo entre Congás de 7, 14 ou 21 imagens das entidades.",
      },
      { property: "og:title", content: "Monte seu Congá — Axé Sagrado" },
      {
        property: "og:description",
        content: "Crie um altar personalizado com as imagens das entidades que te acompanham.",
      },
    ],
  }),
  component: CongaPage,
});

type Tier = {
  id: "pequeno" | "medio" | "grande";
  slots: 7 | 14 | 21;
  name: string;
  description: string;
  basePrice: number;
};

const TIERS: Tier[] = [
  {
    id: "pequeno",
    slots: 7,
    name: "Congá das 7 Linhas",
    description: "Altar essencial com as sete linhas da Umbanda. Ideal para começar.",
    basePrice: 349,
  },
  {
    id: "medio",
    slots: 14,
    name: "Congá Médio",
    description: "Espaço amplo para suas guias principais e seus protetores.",
    basePrice: 589,
  },
  {
    id: "grande",
    slots: 21,
    name: "Congá Grande das 21 Forças",
    description: "Altar completo com todas as falanges e oferendas.",
    basePrice: 879,
  },
];

const ALTAR_CATEGORIES = ["orixas", "pretos-velhos", "caboclos", "pombagiras"];

function CongaPage() {
  const { add } = useCart();
  const [tier, setTier] = useState<Tier | null>(null);
  const [selection, setSelection] = useState<Record<string, number>>({});

  const imageProducts = useMemo(
    () => products.filter((p) => ALTAR_CATEGORIES.includes(p.category)),
    [],
  );

  const totalPicked = Object.values(selection).reduce((a, b) => a + b, 0);
  const remaining = tier ? tier.slots - totalPicked : 0;

  const imagesSubtotal = Object.entries(selection).reduce((sum, [slug, qty]) => {
    const p = products.find((x) => x.slug === slug);
    return sum + (p ? p.price * qty : 0);
  }, 0);

  const total = (tier?.basePrice ?? 0) + imagesSubtotal;

  const inc = (p: Product) => {
    if (!tier) return;
    if (totalPicked >= tier.slots) {
      toast.error("Congá completo", {
        description: `Você já preencheu as ${tier.slots} vagas.`,
      });
      return;
    }
    setSelection((s) => ({ ...s, [p.slug]: (s[p.slug] ?? 0) + 1 }));
  };

  const dec = (p: Product) => {
    setSelection((s) => {
      const cur = s[p.slug] ?? 0;
      if (cur <= 1) {
        const { [p.slug]: _, ...rest } = s;
        return rest;
      }
      return { ...s, [p.slug]: cur - 1 };
    });
  };

  const finalize = () => {
    if (!tier) return;
    if (totalPicked < tier.slots) {
      toast.error("Faltam imagens", {
        description: `Escolha mais ${remaining} para fechar seu Congá.`,
      });
      return;
    }
    Object.entries(selection).forEach(([slug, qty]) => {
      const p = products.find((x) => x.slug === slug);
      if (p) add(p, qty);
    });
    toast.success("Congá montado!", {
      description: `${tier.name} adicionado à sua sacola.`,
    });
    setSelection({});
    setTier(null);
  };

  return (
    <div className="bg-warm">
      <section className="mx-auto max-w-7xl px-6 pt-14 md:px-8 md:pt-20">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Experiência guiada
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-[1.05] md:text-6xl">
          Monte seu Congá.
          <br />
          <span className="text-primary">O altar é seu, o axé é nosso.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
          Escolha o tamanho do seu altar e selecione as imagens das entidades que caminham com
          você. Em poucos passos, você leva para casa um Congá pronto para ser firmado.
        </p>
      </section>

      {/* Step 1 - tiers */}
      <section className="mx-auto max-w-7xl px-6 py-12 md:px-8 md:py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Passo 1
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold md:text-3xl">
              Escolha o tamanho do seu Congá
            </h2>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {TIERS.map((t) => {
            const active = tier?.id === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setTier(t);
                  setSelection({});
                }}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border bg-card p-6 text-left shadow-soft transition hover-lift",
                  active ? "border-primary ring-2 ring-primary/20" : "border-border",
                )}
              >
                {active && (
                  <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                    <Check className="h-3 w-3" /> Selecionado
                  </span>
                )}
                <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Altar de {t.slots} imagens
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold">{t.name}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{t.description}</p>
                <div className="mt-6 flex items-end justify-between border-t border-border pt-4">
                  <span className="font-display text-2xl font-semibold">
                    {formatBRL(t.basePrice)}
                  </span>
                  <span className="text-xs text-muted-foreground">+ imagens escolhidas</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Step 2 - images */}
      {tier && (
        <section className="mx-auto max-w-7xl px-6 pb-20 md:px-8">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-8">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Passo 2
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold md:text-3xl">
                Escolha as imagens do seu Congá
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Toque em + para adicionar uma entidade. Você pode repetir falanges para reforçar
                a presença no altar.
              </p>

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                {imageProducts.map((p) => {
                  const qty = selection[p.slug] ?? 0;
                  return (
                    <article
                      key={p.slug}
                      className={cn(
                        "overflow-hidden rounded-2xl border bg-card shadow-soft transition",
                        qty > 0 ? "border-primary" : "border-border",
                      )}
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                        <img
                          src={p.image}
                          alt={p.name}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                        {qty > 0 && (
                          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                            <Check className="h-3 w-3" /> {qty} no Congá
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-3 p-4">
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                            {p.entity ?? p.category}
                          </p>
                          <h3 className="mt-0.5 truncate font-display text-base font-semibold">
                            {p.name}
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {formatBRL(p.price)}
                          </p>
                        </div>
                        <div className="inline-flex items-center rounded-full border border-border">
                          <button
                            onClick={() => dec(p)}
                            disabled={qty === 0}
                            className="grid h-9 w-9 place-items-center text-foreground/70 hover:text-foreground disabled:opacity-40"
                            aria-label="Remover"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-7 text-center text-sm font-medium">{qty}</span>
                          <button
                            onClick={() => inc(p)}
                            className="grid h-9 w-9 place-items-center text-foreground/70 hover:text-foreground"
                            aria-label="Adicionar"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* Resumo */}
            <aside className="md:col-span-4">
              <div className="sticky top-24 space-y-4">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Sparkles className="h-4 w-4 text-accent" /> Seu Congá
                  </div>
                  <h3 className="mt-3 font-display text-xl font-semibold">{tier.name}</h3>

                  <div className="mt-5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Vagas preenchidas</span>
                      <span className="font-medium">
                        {totalPicked} / {tier.slots}
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: `${Math.min(100, (totalPicked / tier.slots) * 100)}%`,
                        }}
                      />
                    </div>
                    {remaining > 0 ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Faltam {remaining} {remaining === 1 ? "imagem" : "imagens"}.
                      </p>
                    ) : (
                      <p className="mt-2 text-xs text-accent">Congá completo. Axé!</p>
                    )}
                  </div>

                  {totalPicked > 0 && (
                    <ul className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
                      {Object.entries(selection).map(([slug, qty]) => {
                        const p = products.find((x) => x.slug === slug);
                        if (!p) return null;
                        return (
                          <li
                            key={slug}
                            className="flex items-center justify-between gap-3"
                          >
                            <span className="truncate">
                              {qty}× {p.name}
                            </span>
                            <span className="shrink-0 text-muted-foreground">
                              {formatBRL(p.price * qty)}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Base do Congá</dt>
                      <dd className="font-medium">{formatBRL(tier.basePrice)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Imagens</dt>
                      <dd className="font-medium">{formatBRL(imagesSubtotal)}</dd>
                    </div>
                    <div className="flex items-end justify-between border-t border-border pt-3">
                      <dt className="font-medium">Total</dt>
                      <dd className="font-display text-2xl font-semibold">{formatBRL(total)}</dd>
                    </div>
                  </dl>

                  <button
                    onClick={finalize}
                    disabled={remaining > 0}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-3.5 text-sm font-medium text-background transition hover:bg-primary disabled:opacity-50"
                  >
                    <ShoppingBag className="h-4 w-4" /> Adicionar Congá à sacola
                  </button>
                  <Link
                    to="/catalogo"
                    className="mt-3 inline-flex w-full items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Explorar mais peças <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </section>
      )}
    </div>
  );
}

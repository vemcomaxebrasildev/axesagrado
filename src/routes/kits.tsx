import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Check, ShoppingBag, ArrowRight, Flame, Droplets, Leaf, Star, Moon, Heart } from "lucide-react";
import { toast } from "sonner";
import { products, formatBRL, type Product } from "@/data/products";
import { useCart } from "@/contexts/CartContext";

export const Route = createFileRoute("/kits")({
  head: () => ({
    meta: [
      { title: "Kits Sagrados — Vem com Axé" },
      {
        name: "description",
        content:
          "Kits prontos de Umbanda: Força da Esquerda, Energia das Águas, Mata Sagrada e mais. Tudo curado para firmar seu axé.",
      },
      { property: "og:title", content: "Kits Sagrados — Vem com Axé" },
      {
        property: "og:description",
        content: "Kits curados com 7 imagens cada para sua casa de axé.",
      },
    ],
  }),
  component: KitsPage,
});

type KitItem = { slug: string; qty: number };
type Kit = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  vibe: string;
  icon: typeof Flame;
  accent: string;
  items: KitItem[];
  price: number;
  badge?: string;
};

const KITS: Kit[] = [
  {
    id: "forca-da-esquerda",
    name: "Força da Esquerda",
    tagline: "7 imagens · Exus, Pombagiras e proteção",
    description:
      "Kit firmado para abrir caminhos, quebrar demandas e firmar a guarda. Energia da rua e da meia-noite.",
    vibe: "Abertura de caminhos",
    icon: Flame,
    accent: "from-rose-900/20 via-rose-700/10 to-transparent",
    items: [
      { slug: "pombagira-rosa-vermelha", qty: 2 },
      { slug: "velas-7-dias-cera-natural", qty: 2 },
      { slug: "incensos-defumacao-mata", qty: 1 },
      { slug: "guia-7-linhas", qty: 2 },
    ],
    price: 549,
    badge: "Mais pedido",
  },
  {
    id: "energia-das-aguas",
    name: "Energia das Águas",
    tagline: "7 imagens · Oxum, Iemanjá e correntes d'água",
    description:
      "Kit das águas doces e salgadas. Para amor, prosperidade, fertilidade e cura emocional.",
    vibe: "Amor e prosperidade",
    icon: Droplets,
    accent: "from-sky-900/20 via-cyan-700/10 to-transparent",
    items: [
      { slug: "orixa-oxum-coroa-dourada", qty: 2 },
      { slug: "velas-7-dias-cera-natural", qty: 2 },
      { slug: "guia-7-linhas", qty: 2 },
      { slug: "incensos-defumacao-mata", qty: 1 },
    ],
    price: 729,
  },
  {
    id: "mata-sagrada",
    name: "Mata Sagrada",
    tagline: "7 imagens · Caboclos e força da mata",
    description:
      "A força dos caboclos guerreiros, das ervas e da floresta. Para coragem, saúde e firmeza.",
    vibe: "Cura e coragem",
    icon: Leaf,
    accent: "from-emerald-900/20 via-green-700/10 to-transparent",
    items: [
      { slug: "caboclo-pena-branca", qty: 2 },
      { slug: "incensos-defumacao-mata", qty: 2 },
      { slug: "velas-7-dias-cera-natural", qty: 1 },
      { slug: "guia-7-linhas", qty: 2 },
    ],
    price: 619,
  },
  {
    id: "ancestralidade-preta",
    name: "Ancestralidade Preta",
    tagline: "7 imagens · Pretos Velhos e sabedoria",
    description:
      "Calmaria, conselho e cura espiritual. A sabedoria ancestral dos vovôs e vovós da Umbanda.",
    vibe: "Paz e sabedoria",
    icon: Moon,
    accent: "from-amber-900/20 via-yellow-700/10 to-transparent",
    items: [
      { slug: "preto-velho-pai-joaquim", qty: 2 },
      { slug: "velas-7-dias-cera-natural", qty: 2 },
      { slug: "incensos-defumacao-mata", qty: 1 },
      { slug: "guia-7-linhas", qty: 2 },
    ],
    price: 589,
  },
  {
    id: "luz-dos-orixas",
    name: "Luz dos Orixás",
    tagline: "7 imagens · As 7 linhas em harmonia",
    description:
      "Equilíbrio das sete linhas. Para quem quer firmar todas as forças no mesmo congá.",
    vibe: "Equilíbrio total",
    icon: Star,
    accent: "from-indigo-900/20 via-violet-700/10 to-transparent",
    items: [
      { slug: "orixa-oxum-coroa-dourada", qty: 1 },
      { slug: "preto-velho-pai-joaquim", qty: 1 },
      { slug: "caboclo-pena-branca", qty: 1 },
      { slug: "pombagira-rosa-vermelha", qty: 1 },
      { slug: "guia-7-linhas", qty: 1 },
      { slug: "velas-7-dias-cera-natural", qty: 1 },
      { slug: "incensos-defumacao-mata", qty: 1 },
    ],
    price: 899,
    badge: "Edição limitada",
  },
  {
    id: "amor-e-paixao",
    name: "Amor e Paixão",
    tagline: "7 imagens · Pombagiras e Oxum",
    description:
      "Para abrir o coração, atrair amor verdadeiro e firmar relacionamentos. Energia rosa e dourada.",
    vibe: "Amor e atração",
    icon: Heart,
    accent: "from-pink-900/20 via-rose-700/10 to-transparent",
    items: [
      { slug: "pombagira-rosa-vermelha", qty: 2 },
      { slug: "orixa-oxum-coroa-dourada", qty: 2 },
      { slug: "velas-7-dias-cera-natural", qty: 1 },
      { slug: "guia-7-linhas", qty: 2 },
    ],
    price: 679,
  },
];

function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

function kitOriginalPrice(kit: Kit): number {
  return kit.items.reduce((sum, it) => {
    const p = getProduct(it.slug);
    return sum + (p ? p.price * it.qty : 0);
  }, 0);
}

function kitTotalPieces(kit: Kit): number {
  return kit.items.reduce((s, it) => s + it.qty, 0);
}

function KitsPage() {
  const { add } = useCart();

  const addKit = (kit: Kit) => {
    kit.items.forEach((it) => {
      const p = getProduct(it.slug);
      if (p) add(p, it.qty);
    });
    toast.success("Kit adicionado", {
      description: `${kit.name} foi pra sua sacola. Axé!`,
    });
  };

  return (
    <div className="bg-warm">
      <section className="mx-auto max-w-7xl px-6 pt-14 md:px-8 md:pt-20">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Curadoria da casa
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-[1.05] md:text-6xl">
          Kits Sagrados.
          <br />
          <span className="text-primary">Tudo pronto pra firmar.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
          Combinações cuidadosamente preparadas pelos pais e mães da casa. Cada kit traz 7
          imagens e itens essenciais para uma firmeza completa.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 md:px-8 md:py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {KITS.map((kit) => {
            const original = kitOriginalPrice(kit);
            const pieces = kitTotalPieces(kit);
            const savings = original - kit.price;
            const Icon = kit.icon;
            return (
              <article
                key={kit.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition hover-lift"
              >
                <div
                  className={`relative h-40 bg-gradient-to-br ${kit.accent} p-6`}
                >
                  <div className="absolute inset-0 bg-foreground/5" />
                  <div className="relative flex h-full flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-background/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground backdrop-blur">
                        <Icon className="h-3 w-3" />
                        {kit.vibe}
                      </span>
                      {kit.badge && (
                        <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                          {kit.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-end justify-between">
                      <Icon className="h-10 w-10 text-foreground/40" />
                      <span className="text-[10px] uppercase tracking-[0.18em] text-foreground/60">
                        {pieces} peças
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h2 className="font-display text-xl font-semibold">{kit.name}</h2>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    {kit.tagline}
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground">{kit.description}</p>

                  <ul className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
                    {kit.items.map((it) => {
                      const p = getProduct(it.slug);
                      if (!p) return null;
                      return (
                        <li key={it.slug} className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-accent" />
                          <span className="truncate">
                            {it.qty}× {p.name}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="mt-auto pt-6">
                    <div className="flex items-end justify-between">
                      <div>
                        {savings > 0 && (
                          <p className="text-xs text-muted-foreground line-through">
                            {formatBRL(original)}
                          </p>
                        )}
                        <p className="font-display text-2xl font-semibold">
                          {formatBRL(kit.price)}
                        </p>
                        {savings > 0 && (
                          <p className="text-[11px] font-medium text-accent">
                            Economize {formatBRL(savings)}
                          </p>
                        )}
                      </div>
                      <Sparkles className="h-5 w-5 text-accent" />
                    </div>

                    <button
                      onClick={() => addKit(kit)}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-3 text-sm font-medium text-background transition hover:bg-primary"
                    >
                      <ShoppingBag className="h-4 w-4" /> Quero este kit
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20 md:px-8">
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-soft md:p-12">
          <Sparkles className="mx-auto h-6 w-6 text-accent" />
          <h2 className="mt-4 font-display text-2xl font-semibold md:text-3xl">
            Quer montar do seu jeito?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
            Use a experiência guiada do Monte seu Congá e escolha cada imagem da sua firmeza.
          </p>
          <Link
            to="/conga"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:bg-primary"
          >
            Montar meu Congá <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

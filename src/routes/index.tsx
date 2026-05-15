import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Sparkles, Flame, Leaf } from "lucide-react";
import hero from "@/assets/hero-altar.jpg";
import congaBanner from "@/assets/conga-banner.jpg";
import { ProductCard } from "@/components/site/ProductCard";
import { categories, products } from "@/data/products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Axé Sagrado — Imagens, guias e artigos de Umbanda" },
      {
        name: "description",
        content:
          "Catálogo espiritual de Umbanda: imagens de Orixás, Pretos Velhos, Caboclos, Pombagiras, guias, velas e ervas. Peças artesanais com envio para todo o Brasil.",
      },
      { property: "og:title", content: "Axé Sagrado — Casa de Umbanda" },
      { property: "og:image", content: hero },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const featured = products.slice(0, 4);
  const editorialPick = products.find((p) => p.slug === "preto-velho-pai-joaquim")!;

  return (
    <div className="bg-warm">
      {/* BANNER — Monte seu Congá */}
      <section className="mx-auto max-w-7xl px-6 pt-10 md:px-8 md:pt-16">
        <Link
          to="/conga"
          className="group relative block overflow-hidden rounded-2xl shadow-altar"
        >
          <img
            src={congaBanner}
            alt="Altar de Umbanda personalizado com imagens de Orixás, velas e ervas"
            loading="eager"
            width={1600}
            height={900}
            className="h-[360px] w-full object-cover transition-transform duration-700 group-hover:scale-105 md:h-[480px]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/55 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-xl px-6 py-10 md:px-12 md:py-14">
              <span className="inline-flex items-center gap-2 rounded-full border border-background/25 bg-background/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-background backdrop-blur">
                <Sparkles className="h-3 w-3" /> Exclusivo Axé Sagrado
              </span>
              <h2 className="mt-5 text-balance font-display text-3xl font-semibold leading-[1.05] text-background md:text-5xl">
                Monte seu Congá <em className="not-italic text-primary">personalizado</em>.
              </h2>
              <p className="mt-4 max-w-md text-pretty text-sm leading-relaxed text-background/80 md:text-base">
                Escolha entre Congás de 7, 14 ou 21 imagens e crie um altar único com as
                entidades que te acompanham.
              </p>
              <span className="mt-8 inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm font-medium text-foreground transition group-hover:bg-primary group-hover:text-primary-foreground">
                Montar meu Congá
                <ArrowUpRight className="h-4 w-4 transition group-hover:rotate-45" />
              </span>
            </div>
          </div>
        </Link>
      </section>

      {/* HERO editorial */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 pb-16 pt-10 md:grid-cols-12 md:px-8 md:pb-24 md:pt-16">
          <div className="md:col-span-5 md:pt-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <Sparkles className="h-3 w-3" /> Coleção 2026 · Saravá
            </span>
            <h1 className="mt-6 text-balance font-display text-5xl font-semibold leading-[1.02] tracking-tight text-foreground md:text-7xl">
              O sagrado <em className="not-italic text-primary">vive</em> no detalhe das mãos.
            </h1>
            <p className="mt-6 max-w-md text-pretty text-base leading-relaxed text-muted-foreground">
              Imagens, guias e artigos ritualísticos esculpidos por artesãos brasileiros para
              fortalecer o seu axé e honrar a sua casa de Umbanda.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/catalogo"
                className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:bg-primary"
              >
                Explorar o catálogo
                <ArrowUpRight className="h-4 w-4 transition group-hover:rotate-45" />
              </Link>
              <Link
                to="/catalogo"
                search={{ cat: "orixas" } as never}
                className="inline-flex items-center gap-2 rounded-full border border-foreground/15 px-6 py-3 text-sm font-medium text-foreground transition hover:border-foreground/40"
              >
                Ver Orixás
              </Link>
            </div>

            <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-border/60 pt-8">
              {[
                { k: "Peças", v: "120+" },
                { k: "Artesãos", v: "18" },
                { k: "Avaliação", v: "4,9★" },
              ].map((s) => (
                <div key={s.k}>
                  <dt className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {s.k}
                  </dt>
                  <dd className="mt-1 font-display text-2xl font-semibold text-foreground">
                    {s.v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative md:col-span-7">
            <div className="relative overflow-hidden rounded-2xl shadow-altar">
              <img
                src={hero}
                alt="Altar de Umbanda com imagens em terracota, ervas e velas acesas"
                width={1600}
                height={1200}
                className="h-[420px] w-full object-cover md:h-[640px]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 to-transparent p-6 md:p-8">
                <p className="text-[11px] uppercase tracking-[0.2em] text-background/70">
                  Editorial · Pretos Velhos
                </p>
                <h3 className="mt-2 max-w-md font-display text-2xl text-background md:text-3xl">
                  "Que a sabedoria dos mais velhos guie nossos caminhos."
                </h3>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 hidden w-56 rounded-xl border border-border bg-card p-4 shadow-soft md:block">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Em destaque
              </p>
              <p className="mt-1 font-display text-base font-semibold">
                {editorialPick.name}
              </p>
              <Link
                to="/produto/$slug"
                params={{ slug: editorialPick.slug }}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary"
              >
                Conhecer peça <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* DESTAQUES */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-28">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Em destaque
            </p>
            <h2 className="mt-3 max-w-xl text-balance font-display text-3xl font-semibold md:text-5xl">
              Peças escolhidas com axé.
            </h2>
          </div>
          <Link
            to="/catalogo"
            className="hidden items-center gap-1.5 text-sm font-medium text-foreground/80 hover:text-foreground md:inline-flex"
          >
            Ver tudo <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* CATEGORIAS — magazine */}
      <section className="border-y border-border/60 bg-card/40">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-20">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Linhas espirituais
              </p>
              <h2 className="mt-3 max-w-xl text-balance font-display text-3xl font-semibold md:text-5xl">
                Cada falange, sua morada.
              </h2>
            </div>
            <Link
              to="/catalogo"
              className="hidden items-center gap-1.5 text-sm font-medium text-foreground/80 hover:text-foreground md:inline-flex"
            >
              Todas as categorias <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
            {categories.map((c, i) => (
              <Link
                key={c.slug}
                to="/catalogo"
                search={{ cat: c.slug } as never}
                className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition hover:border-primary/40 hover:bg-card"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex h-32 flex-col justify-between">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-foreground/70">
                    {i % 3 === 0 ? <Flame className="h-4 w-4" /> : i % 3 === 1 ? <Leaf className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold leading-tight">
                      {c.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {c.description}
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="absolute right-4 top-4 h-4 w-4 -translate-y-1 translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="bg-foreground text-background">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-12 md:px-8 md:py-28">
          <div className="md:col-span-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-background/60">
              A Casa
            </p>
          </div>
          <div className="md:col-span-8">
            <h2 className="text-balance font-display text-3xl leading-[1.1] md:text-5xl">
              Não vendemos objetos. <span className="text-primary">Entregamos morada</span> para
              o sagrado encontrar a sua casa.
            </h2>
            <p className="mt-6 max-w-2xl text-pretty leading-relaxed text-background/75">
              Cada peça do Axé Sagrado nasce do trabalho de artesãos brasileiros que carregam
              séculos de tradição em suas mãos. Selecionamos materiais nobres, respeitamos a
              simbologia de cada entidade e cuidamos para que a sua firmeza chegue intacta —
              em corpo e em axé.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/sobre"
                className="inline-flex items-center gap-2 rounded-full border border-background/20 px-5 py-2.5 text-sm font-medium text-background hover:bg-background hover:text-foreground"
              >
                Conhecer a Casa <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-28">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Quem firmou conosco
        </p>
        <h2 className="mt-3 max-w-xl text-balance font-display text-3xl font-semibold md:text-5xl">
          Histórias de fé.
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { q: "A imagem da Mamãe Oxum chegou impecável. Senti o axé desde a embalagem.", a: "Mãe Cristina · Terreiro Filhos d'Oxalá" },
            { q: "Atendimento humano e produto de qualidade. Recomendo a todos os irmãos.", a: "Pai Marcos · Tenda de Umbanda" },
            { q: "A guia das 7 linhas é uma obra de arte. Já encomendei outras três.", a: "Luana M. · Médium" },
          ].map((t, i) => (
            <figure
              key={i}
              className="rounded-2xl border border-border bg-card p-7 shadow-soft"
            >
              <blockquote className="font-display text-lg leading-snug text-foreground">
                "{t.q}"
              </blockquote>
              <figcaption className="mt-6 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                {t.a}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}

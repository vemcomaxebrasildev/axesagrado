import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Sparkles, Flame, Leaf } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import hero from "@/assets/hero-altar.jpg";
import congaBanner from "@/assets/conga-banner.jpg";
import { ProductCard } from "@/components/site/ProductCard";
import { categories, products as fallbackProducts, type Product } from "@/data/products";
import { supabase } from "@/integrations/supabase/client";

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

type CongaBanner = {
  enabled: boolean; image: string; badge: string;
  title_prefix: string; title_emphasis: string; title_suffix: string;
  description: string; cta_label: string; cta_href: string;
};
type Stat = { k: string; v: string };
type Hero = {
  enabled: boolean; badge: string;
  title_prefix: string; title_emphasis: string; title_suffix: string;
  description: string; image: string;
  primary_cta_label: string; primary_cta_href: string; secondary_cta_label: string;
  editorial_caption: string; editorial_quote: string; stats: Stat[];
};

function mapDbProduct(p: {
  slug: string; name: string; category: string; entity: string | null;
  short_description: string | null; description: string | null;
  price: number; old_price: number | null; image: string | null;
  images: string[] | null; badge: string | null; stock: number;
  dimensions: string | null; weight: string | null; shipping: string | null;
}): Product {
  return {
    slug: p.slug, name: p.name, category: p.category,
    entity: p.entity ?? undefined,
    shortDescription: p.short_description ?? "",
    description: p.description ?? "",
    price: Number(p.price),
    oldPrice: p.old_price ? Number(p.old_price) : undefined,
    image: p.image ?? "",
    images: p.images ?? [],
    badge: (p.badge as Product["badge"]) ?? undefined,
    rating: 5, reviews: 0, stock: p.stock,
    dimensions: p.dimensions ?? "", weight: p.weight ?? "", shipping: p.shipping ?? "",
  };
}

function HomePage() {
  const { data: featured } = useQuery({
    queryKey: ["home-featured"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products")
        .select("*").eq("featured", true).eq("active", true)
        .order("featured_position");
      if (error) throw error;
      return (data ?? []).map(mapDbProduct);
    },
  });

  const { data: bannerData } = useQuery({
    queryKey: ["home_content", "conga_banner"],
    queryFn: async () => {
      const { data } = await supabase.from("home_content").select("value").eq("key", "conga_banner").maybeSingle();
      return (data?.value ?? null) as CongaBanner | null;
    },
  });

  const { data: heroData } = useQuery({
    queryKey: ["home_content", "hero"],
    queryFn: async () => {
      const { data } = await supabase.from("home_content").select("value").eq("key", "hero").maybeSingle();
      return (data?.value ?? null) as Hero | null;
    },
  });

  const { data: testimonials } = useQuery({
    queryKey: ["testimonials-public"],
    queryFn: async () => {
      const { data } = await supabase.from("testimonials").select("*").eq("active", true).order("position");
      return data ?? [];
    },
  });

  const featuredList = (featured && featured.length > 0) ? featured : fallbackProducts.slice(0, 4);
  const editorialPick = fallbackProducts.find((p) => p.slug === "preto-velho-pai-joaquim")!;

  const banner = bannerData;
  const heroC = heroData;

  return (
    <div className="bg-warm">
      {/* BANNER — Monte seu Congá */}
      {banner?.enabled !== false && (
        <section className="mx-auto max-w-7xl px-6 pt-10 md:px-8 md:pt-16">
          <Link
            to={(banner?.cta_href || "/conga") as "/conga"}
            className="group relative block overflow-hidden rounded-2xl shadow-altar"
          >
            <img
              src={banner?.image || congaBanner}
              alt="Altar de Umbanda personalizado com imagens de Orixás, velas e ervas"
              loading="eager"
              width={1600}
              height={900}
              className="h-[360px] w-full object-cover transition-transform duration-700 group-hover:scale-105 md:h-[480px]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/55 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-xl px-6 py-10 md:px-12 md:py-14">
                {banner?.badge && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-background/25 bg-background/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-background backdrop-blur">
                    <Sparkles className="h-3 w-3" /> {banner.badge}
                  </span>
                )}
                <h2 className="mt-5 text-balance font-display text-3xl font-semibold leading-[1.05] text-background md:text-5xl">
                  {banner?.title_prefix ?? "Monte seu Congá"}{" "}
                  <em className="not-italic text-primary">{banner?.title_emphasis ?? "personalizado"}</em>
                  {banner?.title_suffix ?? "."}
                </h2>
                <p className="mt-4 max-w-md text-pretty text-sm leading-relaxed text-background/80 md:text-base">
                  {banner?.description ?? "Escolha entre Congás de 7, 14 ou 21 imagens e crie um altar único com as entidades que te acompanham."}
                </p>
                <span className="mt-8 inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm font-medium text-foreground transition group-hover:bg-primary group-hover:text-primary-foreground">
                  {banner?.cta_label || "Montar meu Congá"}
                  <ArrowUpRight className="h-4 w-4 transition group-hover:rotate-45" />
                </span>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* HERO editorial */}
      {heroC?.enabled !== false && (
        <section className="relative overflow-hidden">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 pb-16 pt-10 md:grid-cols-12 md:px-8 md:pb-24 md:pt-16">
            <div className="md:col-span-5 md:pt-10">
              {heroC?.badge && (
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  <Sparkles className="h-3 w-3" /> {heroC.badge}
                </span>
              )}
              <h1 className="mt-6 text-balance font-display text-5xl font-semibold leading-[1.02] tracking-tight text-foreground md:text-7xl">
                {heroC?.title_prefix ?? "O sagrado"}{" "}
                <em className="not-italic text-primary">{heroC?.title_emphasis ?? "vive"}</em>{" "}
                {heroC?.title_suffix ?? "no detalhe das mãos."}
              </h1>
              <p className="mt-6 max-w-md text-pretty text-base leading-relaxed text-muted-foreground">
                {heroC?.description ?? "Imagens, guias e artigos ritualísticos esculpidos por artesãos brasileiros para fortalecer o seu axé e honrar a sua casa de Umbanda."}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to={(heroC?.primary_cta_href || "/catalogo") as "/catalogo"}
                  className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:bg-primary"
                >
                  {heroC?.primary_cta_label || "Explorar o catálogo"}
                  <ArrowUpRight className="h-4 w-4 transition group-hover:rotate-45" />
                </Link>
                {heroC?.secondary_cta_label && (
                  <Link
                    to="/catalogo"
                    search={{ cat: "orixas" } as never}
                    className="inline-flex items-center gap-2 rounded-full border border-foreground/15 px-6 py-3 text-sm font-medium text-foreground transition hover:border-foreground/40"
                  >
                    {heroC.secondary_cta_label}
                  </Link>
                )}
              </div>

              {(heroC?.stats?.length ?? 0) > 0 && (
                <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-border/60 pt-8">
                  {(heroC?.stats ?? []).map((s) => (
                    <div key={s.k}>
                      <dt className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{s.k}</dt>
                      <dd className="mt-1 font-display text-2xl font-semibold text-foreground">{s.v}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>

            <div className="relative md:col-span-7">
              <div className="relative overflow-hidden rounded-2xl shadow-altar">
                <img
                  src={heroC?.image || hero}
                  alt="Altar de Umbanda com imagens em terracota, ervas e velas acesas"
                  width={1600}
                  height={1200}
                  className="h-[420px] w-full object-cover md:h-[640px]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 to-transparent p-6 md:p-8">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-background/70">
                    {heroC?.editorial_caption ?? "Editorial · Pretos Velhos"}
                  </p>
                  <h3 className="mt-2 max-w-md font-display text-2xl text-background md:text-3xl">
                    "{heroC?.editorial_quote ?? "Que a sabedoria dos mais velhos guie nossos caminhos."}"
                  </h3>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 hidden w-56 rounded-xl border border-border bg-card p-4 shadow-soft md:block">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Em destaque</p>
                <p className="mt-1 font-display text-base font-semibold">{editorialPick.name}</p>
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
      )}

      {/* DESTAQUES */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-28">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Em destaque</p>
            <h2 className="mt-3 max-w-xl text-balance font-display text-3xl font-semibold md:text-5xl">
              Peças escolhidas com axé.
            </h2>
          </div>
          <Link to="/catalogo" className="hidden items-center gap-1.5 text-sm font-medium text-foreground/80 hover:text-foreground md:inline-flex">
            Ver tudo <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4">
          {featuredList.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* CATEGORIAS */}
      <section className="border-y border-border/60 bg-card/40">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-20">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Linhas espirituais</p>
              <h2 className="mt-3 max-w-xl text-balance font-display text-3xl font-semibold md:text-5xl">
                Cada falange, sua morada.
              </h2>
            </div>
            <Link to="/catalogo" className="hidden items-center gap-1.5 text-sm font-medium text-foreground/80 hover:text-foreground md:inline-flex">
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
                    <h3 className="font-display text-lg font-semibold leading-tight">{c.name}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{c.description}</p>
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
            <p className="text-[11px] uppercase tracking-[0.22em] text-background/60">A Casa</p>
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
      {(testimonials?.length ?? 0) > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-28">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Quem firmou conosco</p>
          <h2 className="mt-3 max-w-xl text-balance font-display text-3xl font-semibold md:text-5xl">
            Histórias de fé.
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {(testimonials ?? []).map((t) => (
              <figure key={t.id} className="rounded-2xl border border-border bg-card p-7 shadow-soft">
                <blockquote className="font-display text-lg leading-snug text-foreground">
                  "{t.quote}"
                </blockquote>
                <figcaption className="mt-6 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  {t.author}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

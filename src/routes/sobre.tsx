import { createFileRoute } from "@tanstack/react-router";
import { usePage, PageSections } from "@/components/site/PageRenderer";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "A Casa — Vem com Axé" },
      { name: "description", content: "Conheça a história e os valores da nossa casa." },
    ],
  }),
  component: SobrePage,
});

function SobrePage() {
  const { data: page, isLoading } = usePage("sobre");

  if (isLoading) {
    return <div className="mx-auto max-w-4xl px-6 py-20 text-center text-muted-foreground">Carregando...</div>;
  }

  if (!page) {
    return <div className="mx-auto max-w-4xl px-6 py-20 text-center text-muted-foreground">Página não encontrada.</div>;
  }

  return (
    <div className="bg-warm">
      <section className="mx-auto max-w-4xl px-6 py-20 md:px-8 md:py-28">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">A Casa</p>
        <h1 className="mt-3 text-balance font-display text-4xl font-semibold leading-[1.05] md:text-6xl">
          {page.title}
        </h1>
        {page.subtitle && (
          <p className="mt-4 text-pretty text-lg text-muted-foreground">{page.subtitle}</p>
        )}
        {page.hero_image && (
          <div className="mt-10 overflow-hidden rounded-2xl shadow-altar">
            <img src={page.hero_image} alt={page.title} className="h-full w-full object-cover" />
          </div>
        )}
        <div className="mt-10">
          <PageSections sections={page.sections} />
        </div>
      </section>
    </div>
  );
}

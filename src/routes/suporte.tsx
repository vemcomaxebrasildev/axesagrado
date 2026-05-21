import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Phone, Mail, Clock } from "lucide-react";
import { usePage, PageSections } from "@/components/site/PageRenderer";
import { useBranding } from "@/hooks/useBranding";

export const Route = createFileRoute("/suporte")({
  component: SuportePage,
  head: () => ({
    meta: [
      { title: "Suporte ao Cliente — Vem com Axé" },
      { name: "description", content: "Fale conosco e conheça os termos de troca e devolução." },
    ],
  }),
});

function SuportePage() {
  const { settings } = useBranding();
  const { contact } = settings;
  const { data: page } = usePage("suporte");

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 md:px-8">
      <header className="max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Atendimento
        </span>
        <h1 className="mt-3 font-display text-4xl font-semibold text-foreground md:text-5xl">
          {page?.title ?? "Suporte ao Cliente"}
        </h1>
        {page?.subtitle && (
          <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">{page.subtitle}</p>
        )}
      </header>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {contact.whatsapp && (
          <a
            href={`https://wa.me/${contact.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="group rounded-2xl border border-border bg-card p-6 transition hover:border-primary hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MessageCircle className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold text-foreground">WhatsApp</h3>
            <p className="mt-1 text-sm text-muted-foreground">Resposta rápida.</p>
            <p className="mt-3 text-sm font-medium text-foreground">{contact.phone || contact.whatsapp}</p>
          </a>
        )}
        {contact.phone && (
          <a
            href={`tel:+${contact.whatsapp || contact.phone.replace(/\D/g, "")}`}
            className="group rounded-2xl border border-border bg-card p-6 transition hover:border-primary hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Phone className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold text-foreground">Telefone</h3>
            <p className="mt-1 text-sm text-muted-foreground">Fale com a equipe.</p>
            <p className="mt-3 text-sm font-medium text-foreground">{contact.phone}</p>
          </a>
        )}
        {contact.email && (
          <a
            href={`mailto:${contact.email}`}
            className="group rounded-2xl border border-border bg-card p-6 transition hover:border-primary hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold text-foreground">E-mail</h3>
            <p className="mt-1 text-sm text-muted-foreground">Pedidos detalhados.</p>
            <p className="mt-3 text-sm font-medium text-foreground">{contact.email}</p>
          </a>
        )}
      </section>

      {contact.hours && (
        <section className="mt-8 flex items-center gap-3 rounded-2xl border border-border bg-muted/40 p-5 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 shrink-0 text-foreground" />
          <span>
            <strong className="text-foreground">Horário de atendimento:</strong> {contact.hours}
          </span>
        </section>
      )}

      {page && page.sections.length > 0 && (
        <section className="mt-16">
          <PageSections sections={page.sections} />
        </section>
      )}
    </div>
  );
}

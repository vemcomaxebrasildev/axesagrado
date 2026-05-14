import { createFileRoute, Link } from "@tanstack/react-router";
import { Package, User, Heart, MapPin, ArrowRight, ShoppingBag } from "lucide-react";
import { formatBRL } from "@/data/products";

export const Route = createFileRoute("/minha-conta")({
  head: () => ({
    meta: [
      { title: "Meus Pedidos — Axé Sagrado" },
      {
        name: "description",
        content: "Acompanhe seus pedidos, endereços e favoritos na Axé Sagrado.",
      },
      { property: "og:title", content: "Meus Pedidos — Axé Sagrado" },
      {
        property: "og:description",
        content: "Área do cliente: histórico de pedidos e dados pessoais.",
      },
    ],
  }),
  component: MinhaContaPage,
});

type Order = {
  id: string;
  date: string;
  status: "Em preparação" | "Enviado" | "Entregue";
  total: number;
  items: number;
};

const ORDERS: Order[] = [
  {
    id: "AS-2049",
    date: "12 mai 2026",
    status: "Enviado",
    total: 489.9,
    items: 3,
  },
  {
    id: "AS-1987",
    date: "28 abr 2026",
    status: "Entregue",
    total: 159.0,
    items: 1,
  },
  {
    id: "AS-1842",
    date: "03 abr 2026",
    status: "Entregue",
    total: 879.0,
    items: 21,
  },
];

const statusStyles: Record<Order["status"], string> = {
  "Em preparação": "bg-accent/15 text-accent",
  Enviado: "bg-primary/15 text-primary",
  Entregue: "bg-muted text-muted-foreground",
};

function MinhaContaPage() {
  return (
    <div className="bg-warm">
      <section className="mx-auto max-w-7xl px-6 pt-14 md:px-8 md:pt-20">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Área do cliente
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.05] md:text-5xl">
          Olá, filho de fé.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
          Acompanhe seus pedidos, endereços e tudo que já passou pela sua casa de axé.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 md:px-8 md:py-16">
        <div className="grid gap-8 md:grid-cols-12">
          <aside className="md:col-span-3">
            <nav className="sticky top-24 space-y-1 rounded-2xl border border-border bg-card p-3 shadow-soft">
              {[
                { icon: Package, label: "Meus pedidos", active: true },
                { icon: User, label: "Meus dados" },
                { icon: MapPin, label: "Endereços" },
                { icon: Heart, label: "Favoritos" },
              ].map((item) => (
                <button
                  key={item.label}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                    item.active
                      ? "bg-foreground text-background"
                      : "text-foreground/70 hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          <div className="md:col-span-9">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 className="font-display text-2xl font-semibold md:text-3xl">
                  Meus pedidos
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Histórico completo das suas compras.
                </p>
              </div>
              <Link
                to="/catalogo"
                className="hidden items-center gap-1 text-sm text-muted-foreground hover:text-foreground sm:inline-flex"
              >
                Continuar comprando <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {ORDERS.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
                <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground" />
                <h3 className="mt-4 font-display text-lg font-semibold">
                  Você ainda não tem pedidos
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Quando finalizar uma compra, ela aparece aqui.
                </p>
                <Link
                  to="/catalogo"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
                >
                  Ver catálogo <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {ORDERS.map((o) => (
                  <li
                    key={o.id}
                    className="rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:border-foreground/20"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                          Pedido {o.id}
                        </p>
                        <h3 className="mt-1 font-display text-lg font-semibold">
                          {o.date}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {o.items} {o.items === 1 ? "item" : "itens"}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusStyles[o.status]}`}
                        >
                          {o.status}
                        </span>
                        <div className="text-right">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                            Total
                          </p>
                          <p className="font-display text-lg font-semibold">
                            {formatBRL(o.total)}
                          </p>
                        </div>
                        <button className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-xs font-medium transition hover:border-foreground">
                          Detalhes <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

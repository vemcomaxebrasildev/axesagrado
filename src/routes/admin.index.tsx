import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp, ShoppingBag, Users, Package, ArrowUpRight } from "lucide-react";
import { products, formatBRL } from "@/data/products";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const RECENT = [
  { id: "AS-2049", customer: "Maria Silva", total: 489.9, status: "Enviado" },
  { id: "AS-2048", customer: "João Santos", total: 879.0, status: "Em preparação" },
  { id: "AS-2047", customer: "Ana Costa", total: 159.0, status: "Entregue" },
  { id: "AS-2046", customer: "Pedro Lima", total: 729.0, status: "Enviado" },
];

function AdminDashboard() {
  const stats = [
    {
      label: "Vendas (mês)",
      value: "R$ 28.490",
      delta: "+12%",
      icon: TrendingUp,
    },
    {
      label: "Pedidos (mês)",
      value: "84",
      delta: "+8%",
      icon: ShoppingBag,
    },
    { label: "Clientes ativos", value: "312", delta: "+24", icon: Users },
    {
      label: "Produtos ativos",
      value: String(products.length),
      delta: "0",
      icon: Package,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Visão geral da loja em tempo real.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-border bg-card p-5 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-muted">
                <s.icon className="h-4 w-4" />
              </div>
              <span className="inline-flex items-center gap-0.5 text-xs font-medium text-accent">
                {s.delta} <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
            <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              {s.label}
            </p>
            <p className="mt-1 font-display text-2xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Pedidos recentes</h2>
            <span className="text-xs text-muted-foreground">Últimos 4</span>
          </div>
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Pedido</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {RECENT.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{r.id}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.customer}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium">
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatBRL(r.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="mb-4 font-display text-lg font-semibold">
            Mais vendidos
          </h2>
          <ul className="space-y-3">
            {products.slice(0, 5).map((p, i) => (
              <li key={p.slug} className="flex items-center gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-muted text-xs font-medium">
                  {i + 1}
                </span>
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-10 w-10 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatBRL(p.price)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

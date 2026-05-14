import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp, ShoppingBag, Users, Package, ArrowUpRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/data/products";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const statusStyle: Record<string, string> = {
  "Em preparação": "bg-amber-500/10 text-amber-700",
  Enviado: "bg-primary/10 text-primary",
  Entregue: "bg-emerald-500/10 text-emerald-700",
  Cancelado: "bg-destructive/10 text-destructive",
};

function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const startMonth = new Date();
      startMonth.setDate(1);
      startMonth.setHours(0, 0, 0, 0);

      const [ordersMonth, customers, productsCount] = await Promise.all([
        supabase.from("orders").select("total, created_at").gte("created_at", startMonth.toISOString()),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }),
      ]);

      const sales = (ordersMonth.data ?? []).reduce((s, o) => s + Number(o.total), 0);
      return {
        sales,
        ordersCount: ordersMonth.data?.length ?? 0,
        customers: customers.count ?? 0,
        products: productsCount.count ?? 0,
      };
    },
  });

  const { data: recent } = useQuery({
    queryKey: ["admin-recent-orders"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, customer_name, total, status, created_at")
        .order("created_at", { ascending: false })
        .limit(6);
      return data ?? [];
    },
  });

  const { data: topProducts } = useQuery({
    queryKey: ["admin-top-products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").order("created_at").limit(5);
      return data ?? [];
    },
  });

  const cards = [
    { label: "Vendas (mês)", value: formatBRL(stats?.sales ?? 0), icon: TrendingUp },
    { label: "Pedidos (mês)", value: String(stats?.ordersCount ?? 0), icon: ShoppingBag },
    { label: "Clientes", value: String(stats?.customers ?? 0), icon: Users },
    { label: "Produtos ativos", value: String(stats?.products ?? 0), icon: Package },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Visão geral da loja em tempo real.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-muted">
                <s.icon className="h-4 w-4" />
              </div>
              <ArrowUpRight className="h-3 w-3 text-accent" />
            </div>
            <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{s.label}</p>
            <p className="mt-1 font-display text-2xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Pedidos recentes</h2>
            <span className="text-xs text-muted-foreground">Últimos {recent?.length ?? 0}</span>
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
                {(recent ?? []).map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">#{r.id.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.customer_name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${statusStyle[r.status] ?? "bg-muted"}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{formatBRL(Number(r.total))}</td>
                  </tr>
                ))}
                {(!recent || recent.length === 0) && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">Nenhum pedido ainda.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="mb-4 font-display text-lg font-semibold">Catálogo</h2>
          <ul className="space-y-3">
            {(topProducts ?? []).map((p, i) => (
              <li key={p.id} className="flex items-center gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-muted text-xs font-medium">{i + 1}</span>
                {p.image && <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{formatBRL(Number(p.price))}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

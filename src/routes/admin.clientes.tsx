import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageCircle, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/data/products";

export const Route = createFileRoute("/admin/clientes")({
  component: AdminClientes,
});

function AdminClientes() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-clientes"],
    queryFn: async () => {
      const [profilesRes, ordersRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("orders").select("user_id, total, customer_email"),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      const adminIds = new Set(
        (rolesRes.data ?? []).filter((r) => r.role === "admin").map((r) => r.user_id),
      );
      const totals = new Map<string, { count: number; total: number }>();
      (ordersRes.data ?? []).forEach((o) => {
        const key = o.user_id ?? o.customer_email;
        if (!key) return;
        const cur = totals.get(key) ?? { count: 0, total: 0 };
        cur.count += 1;
        cur.total += Number(o.total);
        totals.set(key, cur);
      });
      return (profilesRes.data ?? [])
        .filter((p) => !adminIds.has(p.id))
        .map((p) => ({
          ...p,
          ...(totals.get(p.id) ?? totals.get(p.email ?? "") ?? { count: 0, total: 0 }),
        }));
    },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold">Clientes</h1>
        <p className="mt-1 text-sm text-muted-foreground">{data?.length ?? 0} clientes cadastrados</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            <tr><th className="px-4 py-3">Cliente</th><th className="px-4 py-3">Contato</th><th className="px-4 py-3">Pedidos</th><th className="px-4 py-3 text-right">Total gasto</th></tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={4} className="px-4 py-8 text-center"><Loader2 className="mx-auto h-4 w-4 animate-spin" /></td></tr>}
            {(data ?? []).map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{c.full_name || "—"}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {c.email && <p className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {c.email}</p>}
                  {c.phone && <p className="mt-1 flex items-center gap-1.5"><MessageCircle className="h-3 w-3" /> {c.phone}</p>}
                </td>
                <td className="px-4 py-3">{c.count}</td>
                <td className="px-4 py-3 text-right font-medium">{formatBRL(c.total)}</td>
              </tr>
            ))}
            {!isLoading && (data?.length ?? 0) === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">Nenhum cliente ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

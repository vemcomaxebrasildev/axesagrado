import { createFileRoute } from "@tanstack/react-router";
import { Eye, Search, Loader2 } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/data/products";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/pedidos")({
  component: AdminPedidos,
});

const STATUSES = ["Em preparação", "Enviado", "Entregue", "Cancelado"];
const statusStyle: Record<string, string> = {
  "Em preparação": "bg-amber-500/10 text-amber-700",
  Enviado: "bg-primary/10 text-primary",
  Entregue: "bg-emerald-500/10 text-emerald-700",
  Cancelado: "bg-destructive/10 text-destructive",
};

type Order = {
  id: string; customer_name: string; customer_email: string; customer_phone: string | null;
  total: number; status: string; created_at: string; address: string | null;
};

function AdminPedidos() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [viewing, setViewing] = useState<Order | null>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Order[];
    },
  });

  const { data: items } = useQuery({
    queryKey: ["admin-order-items", viewing?.id],
    enabled: !!viewing,
    queryFn: async () => {
      const { data } = await supabase.from("order_items").select("*").eq("order_id", viewing!.id);
      return data ?? [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status atualizado");
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (e: Error) => toast.error("Erro", { description: e.message }),
  });

  const filtered = (orders ?? []).filter((o) =>
    o.id.toLowerCase().includes(q.toLowerCase()) || o.customer_name.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold">Pedidos</h1>
        <p className="mt-1 text-sm text-muted-foreground">{orders?.length ?? 0} pedidos no total</p>
      </div>

      <div className="mb-4 relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por número ou cliente..."
          className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm outline-none focus:border-foreground" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Pedido</th><th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Data</th><th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="px-4 py-8 text-center"><Loader2 className="mx-auto h-4 w-4 animate-spin" /></td></tr>}
            {filtered.map((o) => (
              <tr key={o.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">#{o.id.slice(0, 8)}</td>
                <td className="px-4 py-3"><p className="font-medium">{o.customer_name}</p><p className="text-xs text-muted-foreground">{o.customer_email}</p></td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(o.created_at).toLocaleDateString("pt-BR")}</td>
                <td className="px-4 py-3">
                  <select value={o.status} onChange={(e) => updateStatus.mutate({ id: o.id, status: e.target.value })}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium border-0 outline-none ${statusStyle[o.status] ?? "bg-muted"}`}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-right font-medium">{formatBRL(Number(o.total))}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setViewing(o)} className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {!isLoading && filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">Nenhum pedido encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Pedido #{viewing?.id.slice(0, 8)}</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-4 text-sm">
              <div className="rounded-xl border border-border p-3">
                <p className="font-medium">{viewing.customer_name}</p>
                <p className="text-muted-foreground">{viewing.customer_email}</p>
                {viewing.customer_phone && <p className="text-muted-foreground">{viewing.customer_phone}</p>}
                {viewing.address && <p className="mt-2 text-xs text-muted-foreground">{viewing.address}</p>}
              </div>
              <div className="rounded-xl border border-border">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50"><tr><th className="px-3 py-2 text-left">Produto</th><th className="px-3 py-2">Qtd</th><th className="px-3 py-2 text-right">Preço</th></tr></thead>
                  <tbody>
                    {(items ?? []).map((it: { id: string; product_name: string; quantity: number; unit_price: number }) => (
                      <tr key={it.id} className="border-t border-border">
                        <td className="px-3 py-2">{it.product_name}</td>
                        <td className="px-3 py-2 text-center">{it.quantity}</td>
                        <td className="px-3 py-2 text-right">{formatBRL(Number(it.unit_price) * it.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between border-t border-border pt-3 font-medium">
                <span>Total</span><span className="text-lg">{formatBRL(Number(viewing.total))}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

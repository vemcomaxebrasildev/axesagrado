import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, TrendingUp, TrendingDown, Wallet, Truck, Receipt, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/data/products";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/financeiro")({
  component: AdminFinanceiro,
});

type Order = {
  id: string;
  customer_name: string;
  customer_email: string;
  total: number;
  status: string;
  created_at: string;
  payment_status: string;
  payment_method: string | null;
  paid_amount: number;
  paid_at: string | null;
  shipping_carrier: string | null;
  tracking_code: string | null;
  shipping_cost: number;
  shipped_at: string | null;
  delivered_at: string | null;
  notes: string | null;
};

type Expense = {
  id: string;
  description: string;
  category: string;
  amount: number;
  expense_date: string;
  order_id: string | null;
  notes: string | null;
};

const PAYMENT_STATUSES = ["pendente", "pago", "parcial", "estornado"];
const PAYMENT_METHODS = ["PIX", "Cartão", "Boleto", "Dinheiro", "Transferência"];
const CARRIERS = ["Correios", "Jadlog", "Sequoia", "Loggi", "Motoboy", "Retirada"];

const payStyle: Record<string, string> = {
  pendente: "bg-amber-500/10 text-amber-700",
  pago: "bg-emerald-500/10 text-emerald-700",
  parcial: "bg-blue-500/10 text-blue-700",
  estornado: "bg-destructive/10 text-destructive",
};

function AdminFinanceiro() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold">Financeiro</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Recebimentos, envios, despesas e visão consolidada.
        </p>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList className="mb-6">
          <TabsTrigger value="dashboard"><Wallet className="mr-2 h-3.5 w-3.5" />Dashboard</TabsTrigger>
          <TabsTrigger value="recebimentos"><DollarSign className="mr-2 h-3.5 w-3.5" />Recebimentos</TabsTrigger>
          <TabsTrigger value="envios"><Truck className="mr-2 h-3.5 w-3.5" />Envios</TabsTrigger>
          <TabsTrigger value="despesas"><Receipt className="mr-2 h-3.5 w-3.5" />Despesas</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard"><DashboardTab /></TabsContent>
        <TabsContent value="recebimentos"><RecebimentosTab /></TabsContent>
        <TabsContent value="envios"><EnviosTab /></TabsContent>
        <TabsContent value="despesas"><DespesasTab /></TabsContent>
      </Tabs>
    </div>
  );
}

/* ============== DASHBOARD ============== */
function DashboardTab() {
  const { data: orders } = useQuery({
    queryKey: ["fin-orders"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      return (data ?? []) as Order[];
    },
  });
  const { data: expenses } = useQuery({
    queryKey: ["fin-expenses"],
    queryFn: async () => {
      const { data } = await supabase.from("expenses").select("*").order("expense_date", { ascending: false });
      return (data ?? []) as Expense[];
    },
  });

  const stats = useMemo(() => {
    const startMonth = new Date(); startMonth.setDate(1); startMonth.setHours(0, 0, 0, 0);
    const monthOrders = (orders ?? []).filter((o) => new Date(o.created_at) >= startMonth);
    const faturamento = monthOrders.reduce((s, o) => s + Number(o.total), 0);
    const recebido = monthOrders.reduce((s, o) => s + Number(o.paid_amount), 0);
    const aReceber = faturamento - recebido;
    const desp = (expenses ?? []).filter((e) => new Date(e.expense_date) >= startMonth)
      .reduce((s, e) => s + Number(e.amount), 0);
    const fretes = monthOrders.reduce((s, o) => s + Number(o.shipping_cost), 0);
    const despesasTotais = desp + fretes;
    const lucro = recebido - despesasTotais;
    return { faturamento, recebido, aReceber, despesasTotais, lucro };
  }, [orders, expenses]);

  const cards = [
    { label: "Faturamento (mês)", value: formatBRL(stats.faturamento), icon: TrendingUp, tint: "text-foreground" },
    { label: "Recebido", value: formatBRL(stats.recebido), icon: DollarSign, tint: "text-emerald-700" },
    { label: "A receber", value: formatBRL(stats.aReceber), icon: Wallet, tint: "text-amber-700" },
    { label: "Despesas + fretes", value: formatBRL(stats.despesasTotais), icon: TrendingDown, tint: "text-destructive" },
    { label: "Lucro líquido", value: formatBRL(stats.lucro), icon: TrendingUp, tint: stats.lucro >= 0 ? "text-emerald-700" : "text-destructive" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((c) => (
        <div key={c.label} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-muted">
            <c.icon className="h-4 w-4" />
          </div>
          <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{c.label}</p>
          <p className={`mt-1 font-display text-xl font-semibold ${c.tint}`}>{c.value}</p>
        </div>
      ))}
    </div>
  );
}

/* ============== RECEBIMENTOS ============== */
function RecebimentosTab() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Order | null>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["fin-orders"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      return (data ?? []) as Order[];
    },
  });

  const save = useMutation({
    mutationFn: async (o: Order) => {
      const { error } = await supabase.from("orders").update({
        payment_status: o.payment_status,
        payment_method: o.payment_method,
        paid_amount: Number(o.paid_amount) || 0,
        paid_at: o.paid_at || null,
      }).eq("id", o.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Recebimento atualizado");
      qc.invalidateQueries({ queryKey: ["fin-orders"] });
      setEditing(null);
    },
    onError: (e: Error) => toast.error("Erro", { description: e.message }),
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Pedido</th>
            <th className="px-4 py-3">Cliente</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Recebido</th>
            <th className="px-4 py-3">Método</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {isLoading && <tr><td colSpan={7} className="px-4 py-8 text-center"><Loader2 className="mx-auto h-4 w-4 animate-spin" /></td></tr>}
          {(orders ?? []).map((o) => (
            <tr key={o.id} className="border-t border-border">
              <td className="px-4 py-3 font-medium">#{o.id.slice(0, 8)}</td>
              <td className="px-4 py-3">{o.customer_name}</td>
              <td className="px-4 py-3">{formatBRL(Number(o.total))}</td>
              <td className="px-4 py-3">{formatBRL(Number(o.paid_amount))}</td>
              <td className="px-4 py-3 text-muted-foreground">{o.payment_method ?? "—"}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${payStyle[o.payment_status] ?? "bg-muted"}`}>
                  {o.payment_status}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <Button size="sm" variant="outline" onClick={() => setEditing(o)}>Editar</Button>
              </td>
            </tr>
          ))}
          {!isLoading && (orders ?? []).length === 0 && (
            <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Nenhum pedido.</td></tr>
          )}
        </tbody>
      </table>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Recebimento #{editing?.id.slice(0, 8)}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div>
                <Label>Status do pagamento</Label>
                <select value={editing.payment_status}
                  onChange={(e) => setEditing({ ...editing, payment_status: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                  {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <Label>Método</Label>
                <select value={editing.payment_method ?? ""}
                  onChange={(e) => setEditing({ ...editing, payment_method: e.target.value || null })}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                  <option value="">—</option>
                  {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <Label>Valor recebido</Label>
                <Input type="number" step="0.01" value={editing.paid_amount}
                  onChange={(e) => setEditing({ ...editing, paid_amount: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Data do pagamento</Label>
                <Input type="datetime-local"
                  value={editing.paid_at ? new Date(editing.paid_at).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setEditing({ ...editing, paid_at: e.target.value ? new Date(e.target.value).toISOString() : null })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button onClick={() => editing && save.mutate(editing)} disabled={save.isPending}>
              {save.isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ============== ENVIOS ============== */
function EnviosTab() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Order | null>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["fin-orders"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      return (data ?? []) as Order[];
    },
  });

  const save = useMutation({
    mutationFn: async (o: Order) => {
      const { error } = await supabase.from("orders").update({
        shipping_carrier: o.shipping_carrier,
        tracking_code: o.tracking_code,
        shipping_cost: Number(o.shipping_cost) || 0,
        shipped_at: o.shipped_at || null,
        delivered_at: o.delivered_at || null,
      }).eq("id", o.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Envio atualizado");
      qc.invalidateQueries({ queryKey: ["fin-orders"] });
      setEditing(null);
    },
    onError: (e: Error) => toast.error("Erro", { description: e.message }),
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Pedido</th>
            <th className="px-4 py-3">Cliente</th>
            <th className="px-4 py-3">Transportadora</th>
            <th className="px-4 py-3">Rastreio</th>
            <th className="px-4 py-3">Frete</th>
            <th className="px-4 py-3">Enviado</th>
            <th className="px-4 py-3">Entregue</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {isLoading && <tr><td colSpan={8} className="px-4 py-8 text-center"><Loader2 className="mx-auto h-4 w-4 animate-spin" /></td></tr>}
          {(orders ?? []).map((o) => (
            <tr key={o.id} className="border-t border-border">
              <td className="px-4 py-3 font-medium">#{o.id.slice(0, 8)}</td>
              <td className="px-4 py-3">{o.customer_name}</td>
              <td className="px-4 py-3 text-muted-foreground">{o.shipping_carrier ?? "—"}</td>
              <td className="px-4 py-3 text-muted-foreground">{o.tracking_code ?? "—"}</td>
              <td className="px-4 py-3">{formatBRL(Number(o.shipping_cost))}</td>
              <td className="px-4 py-3 text-muted-foreground">{o.shipped_at ? new Date(o.shipped_at).toLocaleDateString("pt-BR") : "—"}</td>
              <td className="px-4 py-3 text-muted-foreground">{o.delivered_at ? new Date(o.delivered_at).toLocaleDateString("pt-BR") : "—"}</td>
              <td className="px-4 py-3 text-right">
                <Button size="sm" variant="outline" onClick={() => setEditing(o)}>Editar</Button>
              </td>
            </tr>
          ))}
          {!isLoading && (orders ?? []).length === 0 && (
            <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Nenhum pedido.</td></tr>
          )}
        </tbody>
      </table>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Envio #{editing?.id.slice(0, 8)}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div>
                <Label>Transportadora</Label>
                <select value={editing.shipping_carrier ?? ""}
                  onChange={(e) => setEditing({ ...editing, shipping_carrier: e.target.value || null })}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                  <option value="">—</option>
                  {CARRIERS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <Label>Código de rastreio</Label>
                <Input value={editing.tracking_code ?? ""}
                  onChange={(e) => setEditing({ ...editing, tracking_code: e.target.value || null })} />
              </div>
              <div>
                <Label>Custo do frete</Label>
                <Input type="number" step="0.01" value={editing.shipping_cost}
                  onChange={(e) => setEditing({ ...editing, shipping_cost: Number(e.target.value) })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Enviado em</Label>
                  <Input type="date"
                    value={editing.shipped_at ? new Date(editing.shipped_at).toISOString().slice(0, 10) : ""}
                    onChange={(e) => setEditing({ ...editing, shipped_at: e.target.value ? new Date(e.target.value).toISOString() : null })} />
                </div>
                <div>
                  <Label>Entregue em</Label>
                  <Input type="date"
                    value={editing.delivered_at ? new Date(editing.delivered_at).toISOString().slice(0, 10) : ""}
                    onChange={(e) => setEditing({ ...editing, delivered_at: e.target.value ? new Date(e.target.value).toISOString() : null })} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button onClick={() => editing && save.mutate(editing)} disabled={save.isPending}>
              {save.isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ============== DESPESAS ============== */
function DespesasTab() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const empty: Expense = { id: "", description: "", category: "geral", amount: 0,
    expense_date: new Date().toISOString().slice(0, 10), order_id: null, notes: null };
  const [form, setForm] = useState<Expense>(empty);

  const { data: expenses, isLoading } = useQuery({
    queryKey: ["fin-expenses"],
    queryFn: async () => {
      const { data } = await supabase.from("expenses").select("*").order("expense_date", { ascending: false });
      return (data ?? []) as Expense[];
    },
  });

  const save = useMutation({
    mutationFn: async (e: Expense) => {
      const payload = {
        description: e.description, category: e.category, amount: Number(e.amount) || 0,
        expense_date: e.expense_date, order_id: e.order_id || null, notes: e.notes || null,
      };
      if (e.id) {
        const { error } = await supabase.from("expenses").update(payload).eq("id", e.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("expenses").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Despesa salva");
      qc.invalidateQueries({ queryKey: ["fin-expenses"] });
      setOpen(false); setForm(empty);
    },
    onError: (e: Error) => toast.error("Erro", { description: e.message }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Despesa removida");
      qc.invalidateQueries({ queryKey: ["fin-expenses"] });
    },
  });

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => { setForm(empty); setOpen(true); }}>
          <Plus className="mr-2 h-3.5 w-3.5" />Nova despesa
        </Button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3 text-right">Valor</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={5} className="px-4 py-8 text-center"><Loader2 className="mx-auto h-4 w-4 animate-spin" /></td></tr>}
            {(expenses ?? []).map((e) => (
              <tr key={e.id} className="border-t border-border">
                <td className="px-4 py-3 text-muted-foreground">{new Date(e.expense_date).toLocaleDateString("pt-BR")}</td>
                <td className="px-4 py-3">{e.description}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.category}</td>
                <td className="px-4 py-3 text-right font-medium">{formatBRL(Number(e.amount))}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => { setForm(e); setOpen(true); }}>Editar</Button>
                  <Button size="sm" variant="ghost" onClick={() => del.mutate(e.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </td>
              </tr>
            ))}
            {!isLoading && (expenses ?? []).length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Nenhuma despesa.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{form.id ? "Editar despesa" : "Nova despesa"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Descrição</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Categoria</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
              <div>
                <Label>Valor</Label>
                <Input type="number" step="0.01" value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <Label>Data</Label>
              <Input type="date" value={form.expense_date}
                onChange={(e) => setForm({ ...form, expense_date: e.target.value })} />
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value || null })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending || !form.description}>
              {save.isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

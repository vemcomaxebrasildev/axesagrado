import { createFileRoute } from "@tanstack/react-router";
import { Eye, Search } from "lucide-react";
import { useState } from "react";
import { formatBRL } from "@/data/products";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/pedidos")({
  component: AdminPedidos,
});

const ORDERS = [
  { id: "AS-2049", customer: "Maria Silva", email: "maria@email.com", date: "12/05/2026", total: 489.9, status: "Enviado", items: 3 },
  { id: "AS-2048", customer: "João Santos", email: "joao@email.com", date: "12/05/2026", total: 879.0, status: "Em preparação", items: 21 },
  { id: "AS-2047", customer: "Ana Costa", email: "ana@email.com", date: "11/05/2026", total: 159.0, status: "Entregue", items: 1 },
  { id: "AS-2046", customer: "Pedro Lima", email: "pedro@email.com", date: "10/05/2026", total: 729.0, status: "Enviado", items: 7 },
  { id: "AS-2045", customer: "Carla Souza", email: "carla@email.com", date: "09/05/2026", total: 349.0, status: "Entregue", items: 2 },
  { id: "AS-2044", customer: "Roberto Dias", email: "roberto@email.com", date: "08/05/2026", total: 1259.0, status: "Entregue", items: 14 },
];

const statusStyle: Record<string, string> = {
  "Em preparação": "bg-amber-500/10 text-amber-700",
  Enviado: "bg-primary/10 text-primary",
  Entregue: "bg-emerald-500/10 text-emerald-700",
};

function AdminPedidos() {
  const [q, setQ] = useState("");
  const filtered = ORDERS.filter(
    (o) =>
      o.id.toLowerCase().includes(q.toLowerCase()) ||
      o.customer.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold">Pedidos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {ORDERS.length} pedidos no total
        </p>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por número ou cliente..."
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm outline-none focus:border-foreground"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Pedido</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Itens</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{o.id}</td>
                <td className="px-4 py-3">
                  <p className="font-medium">{o.customer}</p>
                  <p className="text-xs text-muted-foreground">{o.email}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{o.date}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.items}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${statusStyle[o.status] ?? "bg-muted"}`}
                  >
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  {formatBRL(o.total)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => toast(o.id, { description: "Detalhes em breve" })}
                    className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

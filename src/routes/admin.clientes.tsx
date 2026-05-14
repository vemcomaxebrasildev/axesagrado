import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageCircle } from "lucide-react";
import { formatBRL } from "@/data/products";

export const Route = createFileRoute("/admin/clientes")({
  component: AdminClientes,
});

const CLIENTES = [
  { name: "Maria Silva", email: "maria@email.com", phone: "(11) 98765-4321", orders: 4, total: 1849.0 },
  { name: "João Santos", email: "joao@email.com", phone: "(21) 99876-5432", orders: 2, total: 1059.0 },
  { name: "Ana Costa", email: "ana@email.com", phone: "(31) 91234-5678", orders: 7, total: 3290.0 },
  { name: "Pedro Lima", email: "pedro@email.com", phone: "(11) 92345-6789", orders: 1, total: 729.0 },
  { name: "Carla Souza", email: "carla@email.com", phone: "(41) 93456-7890", orders: 3, total: 980.0 },
];

function AdminClientes() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold">Clientes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {CLIENTES.length} clientes cadastrados
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Contato</th>
              <th className="px-4 py-3">Pedidos</th>
              <th className="px-4 py-3 text-right">Total gasto</th>
            </tr>
          </thead>
          <tbody>
            {CLIENTES.map((c) => (
              <tr key={c.email} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1.5">
                    <Mail className="h-3 w-3" /> {c.email}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5">
                    <MessageCircle className="h-3 w-3" /> {c.phone}
                  </p>
                </td>
                <td className="px-4 py-3">{c.orders}</td>
                <td className="px-4 py-3 text-right font-medium">
                  {formatBRL(c.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

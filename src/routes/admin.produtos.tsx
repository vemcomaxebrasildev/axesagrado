import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/data/products";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/admin/produtos")({
  component: AdminProdutos,
});

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  short_description: string | null;
  price: number;
  old_price: number | null;
  stock: number;
  image: string | null;
  badge: string | null;
};

const empty: Partial<ProductRow> = {
  slug: "", name: "", category: "orixas", description: "", short_description: "",
  price: 0, stock: 0, image: "", badge: null,
};

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function AdminProdutos() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Partial<ProductRow> | null>(null);
  const [deleting, setDeleting] = useState<ProductRow | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as ProductRow[];
    },
  });

  const saveMut = useMutation({
    mutationFn: async (p: Partial<ProductRow>) => {
      const payload = {
        slug: p.slug || slugify(p.name ?? ""),
        name: p.name,
        category: p.category,
        description: p.description,
        short_description: p.short_description,
        price: Number(p.price),
        old_price: p.old_price ? Number(p.old_price) : null,
        stock: Number(p.stock),
        image: p.image,
        badge: p.badge || null,
      };
      if (p.id) {
        const { error } = await supabase.from("products").update(payload).eq("id", p.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing?.id ? "Produto atualizado" : "Produto criado");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      setEditing(null);
    },
    onError: (e: Error) => toast.error("Erro ao salvar", { description: e.message }),
  });

  const delMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Produto excluído");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      setDeleting(null);
    },
    onError: (e: Error) => toast.error("Erro ao excluir", { description: e.message }),
  });

  const filtered = (products ?? []).filter((p) =>
    p.name.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Produtos</h1>
          <p className="mt-1 text-sm text-muted-foreground">{products?.length ?? 0} peças cadastradas</p>
        </div>
        <button onClick={() => setEditing({ ...empty })}
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background transition hover:bg-primary">
          <Plus className="h-4 w-4" /> Novo produto
        </button>
      </div>

      <div className="mb-4 relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar produto..."
          className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm outline-none focus:border-foreground" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Estoque</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={5} className="px-4 py-8 text-center"><Loader2 className="mx-auto h-4 w-4 animate-spin" /></td></tr>
            )}
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.image && <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />}
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground capitalize">{p.category.replace("-", " ")}</td>
                <td className="px-4 py-3">
                  <span className={p.stock < 5
                    ? "inline-flex rounded-full bg-destructive/10 px-2.5 py-1 text-[11px] font-medium text-destructive"
                    : "inline-flex rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium"}>
                    {p.stock} un
                  </span>
                </td>
                <td className="px-4 py-3 font-medium">{formatBRL(Number(p.price))}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setEditing(p)}
                      className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setDeleting(p)}
                      className="grid h-8 w-8 place-items-center rounded-lg text-destructive/70 hover:bg-destructive/10">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">Nenhum produto encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit/Create dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Editar produto" : "Novo produto"}</DialogTitle>
            <DialogDescription>Preencha os campos abaixo.</DialogDescription>
          </DialogHeader>
          {editing && (
            <form onSubmit={(e) => { e.preventDefault(); saveMut.mutate(editing); }} className="space-y-3">
              <Field label="Nome">
                <input required value={editing.name ?? ""}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value, slug: editing.id ? editing.slug : slugify(e.target.value) })}
                  className={input} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Slug"><input required value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className={input} /></Field>
                <Field label="Categoria">
                  <select value={editing.category ?? "orixas"} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className={input}>
                    {["orixas","pretos-velhos","caboclos","pombagiras","guias","velas","incensos"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Descrição curta">
                <input value={editing.short_description ?? ""} onChange={(e) => setEditing({ ...editing, short_description: e.target.value })} className={input} />
              </Field>
              <Field label="Descrição">
                <textarea rows={3} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className={input} />
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Preço (R$)"><input type="number" step="0.01" required value={editing.price ?? 0} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} className={input} /></Field>
                <Field label="Preço antigo"><input type="number" step="0.01" value={editing.old_price ?? ""} onChange={(e) => setEditing({ ...editing, old_price: e.target.value ? Number(e.target.value) : null })} className={input} /></Field>
                <Field label="Estoque"><input type="number" required value={editing.stock ?? 0} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} className={input} /></Field>
              </div>
              <Field label="URL da imagem">
                <input value={editing.image ?? ""} onChange={(e) => setEditing({ ...editing, image: e.target.value })} className={input} placeholder="https://..." />
              </Field>
              <Field label="Selo (opcional)">
                <select value={editing.badge ?? ""} onChange={(e) => setEditing({ ...editing, badge: e.target.value || null })} className={input}>
                  <option value="">Nenhum</option>
                  {["Lançamento","Mais vendido","Promoção","Edição limitada"].map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </Field>

              <DialogFooter className="pt-2">
                <button type="button" onClick={() => setEditing(null)} className="rounded-full border border-border px-4 py-2 text-sm">Cancelar</button>
                <button type="submit" disabled={saveMut.isPending}
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background hover:bg-primary disabled:opacity-60">
                  {saveMut.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Salvar
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. {deleting?.name} será removido do catálogo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleting && delMut.mutate(deleting.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const input = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

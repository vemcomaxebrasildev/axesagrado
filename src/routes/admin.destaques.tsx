import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, GripVertical, Star, StarOff, Search } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/data/products";
import {
  DndContext, PointerSensor, closestCenter, useSensor, useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, arrayMove, useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export const Route = createFileRoute("/admin/destaques")({
  component: AdminDestaques,
});

type Row = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  category: string;
  featured: boolean;
  featured_position: number;
};

function AdminDestaques() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");

  const { data: products, isLoading } = useQuery({
    queryKey: ["all-products-featured"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products")
        .select("id, name, slug, price, image, category, featured, featured_position")
        .order("name");
      if (error) throw error;
      return data as Row[];
    },
  });

  const [order, setOrder] = useState<string[]>([]);
  useEffect(() => {
    if (!products) return;
    const f = products.filter((p) => p.featured).sort((a, b) => a.featured_position - b.featured_position).map((p) => p.id);
    setOrder(f);
  }, [products]);

  const featured = useMemo(() => {
    if (!products) return [];
    const map = new Map(products.map((p) => [p.id, p]));
    return order.map((id) => map.get(id)).filter(Boolean) as Row[];
  }, [order, products]);

  const available = useMemo(() => {
    if (!products) return [];
    const set = new Set(order);
    return products.filter((p) => !set.has(p.id) && p.name.toLowerCase().includes(q.toLowerCase()));
  }, [order, products, q]);

  const toggleMut = useMutation({
    mutationFn: async ({ id, on, position }: { id: string; on: boolean; position: number }) => {
      const { error } = await supabase.from("products").update({ featured: on, featured_position: position }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["all-products-featured"] }),
    onError: (e: Error) => toast.error("Erro", { description: e.message }),
  });

  const saveOrder = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id, i) =>
        supabase.from("products").update({ featured_position: i }).eq("id", id)
      ));
    },
    onSuccess: () => { toast.success("Ordem salva"); qc.invalidateQueries({ queryKey: ["all-products-featured"] }); },
    onError: (e: Error) => toast.error("Erro ao salvar ordem", { description: e.message }),
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldI = order.indexOf(active.id as string);
    const newI = order.indexOf(over.id as string);
    if (oldI < 0 || newI < 0) return;
    const next = arrayMove(order, oldI, newI);
    setOrder(next);
    saveOrder.mutate(next);
  };

  const addToFeatured = (p: Row) => {
    const next = [...order, p.id];
    setOrder(next);
    toggleMut.mutate({ id: p.id, on: true, position: next.length - 1 });
  };

  const removeFromFeatured = (p: Row) => {
    const next = order.filter((id) => id !== p.id);
    setOrder(next);
    toggleMut.mutate({ id: p.id, on: false, position: 0 });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold">Produtos em destaque</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Arraste para reordenar os produtos exibidos na seção "Em destaque" da home.
        </p>
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-20"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Featured list */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <header className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Em destaque na home</h2>
              <span className="text-xs text-muted-foreground">{featured.length} produtos</span>
            </header>
            {featured.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Nenhum produto em destaque. Adicione da lista ao lado.
              </p>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={order} strategy={verticalListSortingStrategy}>
                  <ul className="space-y-2">
                    {featured.map((p, i) => (
                      <SortableItem key={p.id} id={p.id} index={i} p={p} onRemove={() => removeFromFeatured(p)} />
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
            )}
          </section>

          {/* Available list */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <header className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-semibold">Disponíveis</h2>
              <div className="relative w-56">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar..."
                  className="w-full rounded-lg border border-border bg-background py-1.5 pl-8 pr-3 text-xs outline-none focus:border-foreground" />
              </div>
            </header>
            <ul className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
              {available.map((p) => (
                <li key={p.id} className="flex items-center gap-3 rounded-xl border border-border bg-background p-2.5">
                  {p.image && <img src={p.image} alt="" className="h-10 w-10 rounded-lg object-cover" />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-[11px] text-muted-foreground">{formatBRL(Number(p.price))}</p>
                  </div>
                  <button onClick={() => addToFeatured(p)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-[11px] font-medium text-background hover:bg-primary">
                    <Star className="h-3 w-3" /> Destacar
                  </button>
                </li>
              ))}
              {available.length === 0 && (
                <li className="py-6 text-center text-xs text-muted-foreground">Nenhum produto encontrado.</li>
              )}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}

function SortableItem({ id, index, p, onRemove }: { id: string; index: number; p: Row; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <li ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="flex items-center gap-3 rounded-xl border border-border bg-background p-2.5">
      <button {...attributes} {...listeners}
        className="grid h-8 w-6 cursor-grab place-items-center text-muted-foreground hover:text-foreground">
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="grid h-6 w-6 place-items-center rounded-full bg-muted text-[10px] font-semibold">{index + 1}</span>
      {p.image && <img src={p.image} alt="" className="h-10 w-10 rounded-lg object-cover" />}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{p.name}</p>
        <p className="text-[11px] text-muted-foreground">{formatBRL(Number(p.price))}</p>
      </div>
      <button onClick={onRemove}
        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] font-medium hover:bg-muted">
        <StarOff className="h-3 w-3" /> Remover
      </button>
    </li>
  );
}

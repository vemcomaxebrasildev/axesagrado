import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Edit, Eye, EyeOff, Plus } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/paginas")({
  component: AdminPagesList,
});

function AdminPagesList() {
  const qc = useQueryClient();
  const { data: pages, isLoading } = useQuery({
    queryKey: ["admin", "pages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("id, slug, title, published, updated_at")
        .order("slug");
      if (error) throw error;
      return data;
    },
  });

  const [showNew, setShowNew] = useState(false);
  const [newSlug, setNewSlug] = useState("");
  const [newTitle, setNewTitle] = useState("");

  const togglePublished = async (id: string, current: boolean) => {
    const { error } = await supabase.from("pages").update({ published: !current }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(!current ? "Página publicada." : "Página despublicada.");
    qc.invalidateQueries({ queryKey: ["admin", "pages"] });
  };

  const createPage = async () => {
    if (!newSlug || !newTitle) return toast.error("Preencha slug e título");
    const slug = newSlug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-");
    const { error } = await supabase.from("pages").insert({
      slug,
      title: newTitle,
      sections: [],
      published: false,
    });
    if (error) return toast.error(error.message);
    toast.success("Página criada.");
    setShowNew(false);
    setNewSlug("");
    setNewTitle("");
    qc.invalidateQueries({ queryKey: ["admin", "pages"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Páginas do site</h1>
          <p className="mt-1 text-sm text-muted-foreground">Edite o conteúdo de todas as páginas estáticas.</p>
        </div>
        <Button onClick={() => setShowNew(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nova página
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Slug</th>
              <th className="px-4 py-3 text-left">Título</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Carregando...</td></tr>
            )}
            {pages?.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">/{p.slug}</td>
                <td className="px-4 py-3 font-medium">{p.title}</td>
                <td className="px-4 py-3">
                  {p.published ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                      <Eye className="h-3 w-3" /> Publicada
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      <EyeOff className="h-3 w-3" /> Rascunho
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="sm" onClick={() => togglePublished(p.id, p.published)}>
                    {p.published ? "Despublicar" : "Publicar"}
                  </Button>
                  <Link to={"/admin/paginas/$id" as any} params={{ id: p.id } as any}>
                    <Button variant="outline" size="sm" className="ml-2">
                      <Edit className="mr-1.5 h-3.5 w-3.5" /> Editar
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova página</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Slug (URL)</Label>
              <Input value={newSlug} onChange={(e) => setNewSlug(e.target.value)} placeholder="termos-de-uso" />
            </div>
            <div>
              <Label>Título</Label>
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowNew(false)}>Cancelar</Button>
            <Button onClick={createPage}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

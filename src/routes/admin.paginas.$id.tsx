import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown, Save } from "lucide-react";
import type { PageSection } from "@/components/site/PageRenderer";

export const Route = createFileRoute("/admin/paginas/$id")({
  component: AdminPageEditor,
});

function AdminPageEditor() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: page, isLoading } = useQuery({
    queryKey: ["admin", "page", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("pages").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [sections, setSections] = useState<PageSection[]>([]);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [seoOg, setSeoOg] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (page) {
      setTitle(page.title);
      setSubtitle(page.subtitle ?? "");
      setHeroImage(page.hero_image ?? "");
      setSections(((page.sections as unknown) as PageSection[]) ?? []);
      setSeoTitle(page.seo_title ?? "");
      setSeoDesc(page.seo_description ?? "");
      setSeoOg(page.seo_og_image ?? "");
    }
  }, [page]);

  const uploadImage = async (file: File) => {
    const path = `pages/${id}-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("product-media").upload(path, file);
    if (error) throw error;
    return supabase.storage.from("product-media").getPublicUrl(path).data.publicUrl;
  };

  const save = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("pages")
        .update({
          title,
          subtitle: subtitle || null,
          hero_image: heroImage || null,
          sections: sections as unknown as never,
          seo_title: seoTitle || null,
          seo_description: seoDesc || null,
          seo_og_image: seoOg || null,
        })
        .eq("id", id);
      if (error) throw error;
      toast.success("Página salva.");
      qc.invalidateQueries({ queryKey: ["page"] });
      qc.invalidateQueries({ queryKey: ["admin", "page", id] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const addSection = (type: PageSection["type"]) => {
    const base: Record<PageSection["type"], PageSection> = {
      rich_text: { type: "rich_text", html: "<p>Novo texto...</p>" },
      image: { type: "image", url: "", alt: "" },
      cta: { type: "cta", title: "", button_label: "Saiba mais", button_url: "/" },
      quote: { type: "quote", text: "" },
    };
    setSections([...sections, base[type]]);
  };

  const updateSection = (idx: number, updated: PageSection) => {
    setSections(sections.map((s, i) => (i === idx ? updated : s)));
  };

  const removeSection = (idx: number) => setSections(sections.filter((_, i) => i !== idx));
  const moveSection = (idx: number, dir: -1 | 1) => {
    const next = [...sections];
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= next.length) return;
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    setSections(next);
  };

  if (isLoading || !page) {
    return <div className="text-center text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/admin/paginas" })}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <div>
            <h1 className="font-display text-xl font-semibold">Editar página</h1>
            <p className="text-xs text-muted-foreground">/{page.slug}</p>
          </div>
        </div>
        <Button onClick={save} disabled={saving}>
          <Save className="mr-2 h-4 w-4" /> {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>

      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">Conteúdo</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="mt-6 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold">Cabeçalho</h2>
            <div className="mt-4 space-y-4">
              <div>
                <Label>Título</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label>Subtítulo</Label>
                <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label>Imagem hero (URL)</Label>
                <div className="mt-1.5 flex gap-2">
                  <Input value={heroImage} onChange={(e) => setHeroImage(e.target.value)} placeholder="URL" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      try {
                        const url = await uploadImage(f);
                        setHeroImage(url);
                        toast.success("Upload concluído.");
                      } catch (err) { toast.error((err as Error).message); }
                    }}
                    className="text-xs"
                  />
                </div>
                {heroImage && <img src={heroImage} alt="" className="mt-2 h-32 rounded object-cover" />}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Blocos de conteúdo</h2>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => addSection("rich_text")}><Plus className="mr-1 h-3 w-3" /> Texto</Button>
                <Button size="sm" variant="outline" onClick={() => addSection("image")}><Plus className="mr-1 h-3 w-3" /> Imagem</Button>
                <Button size="sm" variant="outline" onClick={() => addSection("quote")}><Plus className="mr-1 h-3 w-3" /> Citação</Button>
                <Button size="sm" variant="outline" onClick={() => addSection("cta")}><Plus className="mr-1 h-3 w-3" /> CTA</Button>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {sections.length === 0 && (
                <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Nenhum bloco. Adicione um acima.
                </div>
              )}
              {sections.map((s, i) => (
                <div key={i} className="rounded-xl border border-border bg-background p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{labelFor(s.type)}</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => moveSection(i, -1)} disabled={i === 0}><ChevronUp className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => moveSection(i, 1)} disabled={i === sections.length - 1}><ChevronDown className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => removeSection(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                  <SectionEditor section={s} onChange={(u) => updateSection(i, u)} upload={uploadImage} />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="seo" className="mt-6">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div>
              <Label>Título SEO</Label>
              <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label>Descrição SEO</Label>
              <Textarea value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} rows={3} className="mt-1.5" />
            </div>
            <div>
              <Label>Imagem OG (compartilhamento)</Label>
              <Input value={seoOg} onChange={(e) => setSeoOg(e.target.value)} className="mt-1.5" placeholder="URL" />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function labelFor(t: PageSection["type"]) {
  return { rich_text: "Texto rico", image: "Imagem", cta: "Chamada (CTA)", quote: "Citação" }[t];
}

function SectionEditor({
  section,
  onChange,
  upload,
}: {
  section: PageSection;
  onChange: (s: PageSection) => void;
  upload: (f: File) => Promise<string>;
}) {
  if (section.type === "rich_text") {
    return (
      <div>
        <Label className="text-xs">HTML (use &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;, &lt;strong&gt;, etc.)</Label>
        <Textarea
          value={section.html}
          onChange={(e) => onChange({ ...section, html: e.target.value })}
          rows={6}
          className="mt-1.5 font-mono text-xs"
        />
      </div>
    );
  }
  if (section.type === "image") {
    return (
      <div className="space-y-2">
        <Input value={section.url} onChange={(e) => onChange({ ...section, url: e.target.value })} placeholder="URL da imagem" />
        <Input value={section.alt ?? ""} onChange={(e) => onChange({ ...section, alt: e.target.value })} placeholder="Texto alternativo" />
        <input type="file" accept="image/*" className="text-xs" onChange={async (e) => {
          const f = e.target.files?.[0]; if (!f) return;
          try { const url = await upload(f); onChange({ ...section, url }); toast.success("Upload concluído."); } catch (err) { toast.error((err as Error).message); }
        }} />
        {section.url && <img src={section.url} alt="" className="h-24 rounded object-cover" />}
      </div>
    );
  }
  if (section.type === "quote") {
    return (
      <div className="space-y-2">
        <Textarea value={section.text} onChange={(e) => onChange({ ...section, text: e.target.value })} placeholder="Citação" rows={2} />
        <Input value={section.author ?? ""} onChange={(e) => onChange({ ...section, author: e.target.value })} placeholder="Autor (opcional)" />
      </div>
    );
  }
  if (section.type === "cta") {
    return (
      <div className="space-y-2">
        <Input value={section.title} onChange={(e) => onChange({ ...section, title: e.target.value })} placeholder="Título" />
        <Input value={section.subtitle ?? ""} onChange={(e) => onChange({ ...section, subtitle: e.target.value })} placeholder="Subtítulo (opcional)" />
        <div className="grid grid-cols-2 gap-2">
          <Input value={section.button_label} onChange={(e) => onChange({ ...section, button_label: e.target.value })} placeholder="Texto do botão" />
          <Input value={section.button_url} onChange={(e) => onChange({ ...section, button_url: e.target.value })} placeholder="URL do botão" />
        </div>
      </div>
    );
  }
  return null;
}

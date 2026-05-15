import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Loader2, Plus, Trash2, Upload, Image as ImageIcon, ArrowUp, ArrowDown, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/home")({
  component: AdminHome,
});

type CongaBanner = {
  enabled: boolean;
  image: string;
  badge: string;
  title_prefix: string;
  title_emphasis: string;
  title_suffix: string;
  description: string;
  cta_label: string;
  cta_href: string;
};

type Stat = { k: string; v: string };
type Hero = {
  enabled: boolean;
  badge: string;
  title_prefix: string;
  title_emphasis: string;
  title_suffix: string;
  description: string;
  image: string;
  primary_cta_label: string;
  primary_cta_href: string;
  secondary_cta_label: string;
  editorial_caption: string;
  editorial_quote: string;
  stats: Stat[];
};

type Testimonial = {
  id: string;
  quote: string;
  author: string;
  position: number;
  active: boolean;
};

async function uploadImage(file: File) {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `home/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("product-media").upload(path, file, {
    contentType: file.type, upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from("product-media").getPublicUrl(path).data.publicUrl;
}

function AdminHome() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl font-semibold">Conteúdo da home</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie banner, hero e depoimentos exibidos na página inicial.
        </p>
      </div>
      <BannerSection />
      <HeroSection />
      <NavMenuSection />
      <TestimonialsSection />
    </div>
  );
}

type NavItem = { to: string; label: string; visible: boolean };

const defaultNav: NavItem[] = [
  { to: "/", label: "Início", visible: true },
  { to: "/catalogo", label: "Catálogo", visible: true },
  { to: "/conga", label: "Monte seu Congá", visible: true },
  { to: "/kits", label: "Kits Sagrados", visible: true },
  { to: "/catalogo?cat=pretos-velhos", label: "Pretos Velhos", visible: true },
  { to: "/sobre", label: "A Casa", visible: true },
  { to: "/minha-conta", label: "Meus pedidos", visible: true },
];

function NavMenuSection() {
  const { data, isLoading, save } = useHomeKey<NavItem[]>("nav_menu", defaultNav);
  const [items, setItems] = useState<NavItem[]>(defaultNav);
  useEffect(() => { if (data) setItems(data.map((i) => ({ ...i, visible: i.visible !== false }))); }, [data]);

  if (isLoading) return <Card title="Menu da home"><Loader2 className="h-4 w-4 animate-spin" /></Card>;

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
  };
  const update = (i: number, patch: Partial<NavItem>) =>
    setItems(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const remove = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const add = () => setItems([...items, { label: "Novo item", to: "/", visible: true }]);

  return (
    <Card title="Menu da home" subtitle="Edite, reordene e controle a visibilidade dos itens do menu do cabeçalho.">
      <form onSubmit={(e) => { e.preventDefault(); save.mutate(items); }} className="space-y-3">
        {items.map((it, i) => (
          <div key={i} className="grid grid-cols-[auto_1fr_1fr_auto_auto] items-center gap-2 rounded-xl border border-border bg-background p-2">
            <div className="flex flex-col">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0}
                className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:bg-muted disabled:opacity-30">
                <ArrowUp className="h-3 w-3" />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1}
                className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:bg-muted disabled:opacity-30">
                <ArrowDown className="h-3 w-3" />
              </button>
            </div>
            <input className={input} placeholder="Rótulo" value={it.label} onChange={(e) => update(i, { label: e.target.value })} />
            <input className={input} placeholder="/caminho" value={it.to} onChange={(e) => update(i, { to: e.target.value })} />
            <button type="button" onClick={() => update(i, { visible: !it.visible })} title={it.visible ? "Visível" : "Oculto"}
              className={`grid h-9 w-9 place-items-center rounded-lg ${it.visible ? "text-foreground hover:bg-muted" : "text-muted-foreground hover:bg-muted"}`}>
              {it.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
            <button type="button" onClick={() => remove(i)}
              className="grid h-9 w-9 place-items-center rounded-lg text-destructive hover:bg-destructive/10">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <button type="button" onClick={add}
          className="inline-flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-foreground hover:text-foreground">
          <Plus className="h-3 w-3" /> Adicionar item
        </button>
        <SaveButton pending={save.isPending} />
      </form>
    </Card>
  );
}

function useHomeKey<T>(key: string, fallback: T) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["home_content", key],
    queryFn: async () => {
      const { data, error } = await supabase.from("home_content").select("value").eq("key", key).maybeSingle();
      if (error) throw error;
      return ((data?.value as T) ?? fallback) as T;
    },
  });
  const save = useMutation({
    mutationFn: async (value: T) => {
      const { error } = await supabase.from("home_content").upsert({ key, value: value as never });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Salvo");
      qc.invalidateQueries({ queryKey: ["home_content", key] });
    },
    onError: (e: Error) => toast.error("Erro ao salvar", { description: e.message }),
  });
  return { ...q, save };
}

function BannerSection() {
  const fallback: CongaBanner = {
    enabled: true, image: "", badge: "", title_prefix: "", title_emphasis: "",
    title_suffix: "", description: "", cta_label: "", cta_href: "/conga",
  };
  const { data, isLoading, save } = useHomeKey<CongaBanner>("conga_banner", fallback);
  const [v, setV] = useState<CongaBanner>(fallback);
  useEffect(() => { if (data) setV(data); }, [data]);

  if (isLoading) return <Card title="Banner do Congá"><Loader2 className="h-4 w-4 animate-spin" /></Card>;

  return (
    <Card title="Banner do Congá" subtitle="Bloco no topo da home com link para /conga.">
      <form onSubmit={(e) => { e.preventDefault(); save.mutate(v); }} className="space-y-4">
        <Toggle checked={v.enabled} onChange={(b) => setV({ ...v, enabled: b })} label="Exibir banner na home" />
        <ImageField label="Imagem de fundo" value={v.image} onChange={(u) => setV({ ...v, image: u })} />
        <Field label="Badge"><input className={input} value={v.badge} onChange={(e) => setV({ ...v, badge: e.target.value })} /></Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Título — início"><input className={input} value={v.title_prefix} onChange={(e) => setV({ ...v, title_prefix: e.target.value })} /></Field>
          <Field label="Palavra em destaque"><input className={input} value={v.title_emphasis} onChange={(e) => setV({ ...v, title_emphasis: e.target.value })} /></Field>
          <Field label="Final"><input className={input} value={v.title_suffix} onChange={(e) => setV({ ...v, title_suffix: e.target.value })} /></Field>
        </div>
        <Field label="Descrição"><textarea rows={3} className={input} value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Texto do botão"><input className={input} value={v.cta_label} onChange={(e) => setV({ ...v, cta_label: e.target.value })} /></Field>
          <Field label="Link do botão"><input className={input} value={v.cta_href} onChange={(e) => setV({ ...v, cta_href: e.target.value })} /></Field>
        </div>
        <SaveButton pending={save.isPending} />
      </form>
    </Card>
  );
}

function HeroSection() {
  const fallback: Hero = {
    enabled: true, badge: "", title_prefix: "", title_emphasis: "", title_suffix: "",
    description: "", image: "", primary_cta_label: "", primary_cta_href: "/catalogo",
    secondary_cta_label: "", editorial_caption: "", editorial_quote: "", stats: [],
  };
  const { data, isLoading, save } = useHomeKey<Hero>("hero", fallback);
  const [v, setV] = useState<Hero>(fallback);
  useEffect(() => { if (data) setV(data); }, [data]);

  if (isLoading) return <Card title="Hero editorial"><Loader2 className="h-4 w-4 animate-spin" /></Card>;

  const setStat = (i: number, patch: Partial<Stat>) => {
    const next = v.stats.map((s, idx) => (idx === i ? { ...s, ...patch } : s));
    setV({ ...v, stats: next });
  };

  return (
    <Card title="Hero editorial" subtitle="Bloco principal de apresentação.">
      <form onSubmit={(e) => { e.preventDefault(); save.mutate(v); }} className="space-y-4">
        <Toggle checked={v.enabled} onChange={(b) => setV({ ...v, enabled: b })} label="Exibir hero na home" />
        <Field label="Badge"><input className={input} value={v.badge} onChange={(e) => setV({ ...v, badge: e.target.value })} /></Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Título — início"><input className={input} value={v.title_prefix} onChange={(e) => setV({ ...v, title_prefix: e.target.value })} /></Field>
          <Field label="Palavra em destaque"><input className={input} value={v.title_emphasis} onChange={(e) => setV({ ...v, title_emphasis: e.target.value })} /></Field>
          <Field label="Final"><input className={input} value={v.title_suffix} onChange={(e) => setV({ ...v, title_suffix: e.target.value })} /></Field>
        </div>
        <Field label="Descrição"><textarea rows={3} className={input} value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} /></Field>
        <ImageField label="Imagem do hero" value={v.image} onChange={(u) => setV({ ...v, image: u })} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="CTA principal — texto"><input className={input} value={v.primary_cta_label} onChange={(e) => setV({ ...v, primary_cta_label: e.target.value })} /></Field>
          <Field label="CTA principal — link"><input className={input} value={v.primary_cta_href} onChange={(e) => setV({ ...v, primary_cta_href: e.target.value })} /></Field>
        </div>
        <Field label="CTA secundário"><input className={input} value={v.secondary_cta_label} onChange={(e) => setV({ ...v, secondary_cta_label: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Legenda editorial"><input className={input} value={v.editorial_caption} onChange={(e) => setV({ ...v, editorial_caption: e.target.value })} /></Field>
          <Field label="Frase editorial"><input className={input} value={v.editorial_quote} onChange={(e) => setV({ ...v, editorial_quote: e.target.value })} /></Field>
        </div>
        <div>
          <span className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Estatísticas</span>
          <div className="space-y-2">
            {v.stats.map((s, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <input className={input} placeholder="Rótulo" value={s.k} onChange={(e) => setStat(i, { k: e.target.value })} />
                <input className={input} placeholder="Valor" value={s.v} onChange={(e) => setStat(i, { v: e.target.value })} />
                <button type="button" onClick={() => setV({ ...v, stats: v.stats.filter((_, idx) => idx !== i) })}
                  className="grid h-9 w-9 place-items-center rounded-lg text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => setV({ ...v, stats: [...v.stats, { k: "", v: "" }] })}
              className="inline-flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-foreground hover:text-foreground">
              <Plus className="h-3 w-3" /> Adicionar
            </button>
          </div>
        </div>
        <SaveButton pending={save.isPending} />
      </form>
    </Card>
  );
}

function TestimonialsSection() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase.from("testimonials").select("*").order("position");
      if (error) throw error;
      return data as Testimonial[];
    },
  });

  const upsert = useMutation({
    mutationFn: async (t: Partial<Testimonial> & { id?: string }) => {
      if (t.id) {
        const { error } = await supabase.from("testimonials").update({
          quote: t.quote!, author: t.author!, active: t.active ?? true, position: t.position ?? 0,
        }).eq("id", t.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("testimonials").insert({
          quote: t.quote!, author: t.author!, position: t.position ?? 999,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success("Salvo"); qc.invalidateQueries({ queryKey: ["testimonials"] }); },
    onError: (e: Error) => toast.error("Erro", { description: e.message }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("testimonials").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Removido"); qc.invalidateQueries({ queryKey: ["testimonials"] }); },
  });

  const [draft, setDraft] = useState<{ quote: string; author: string }>({ quote: "", author: "" });

  return (
    <Card title="Depoimentos" subtitle="Frases exibidas na seção 'Histórias de fé'.">
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
        <div className="space-y-3">
          {(data ?? []).map((t, i) => (
            <TestimonialRow key={t.id} t={t} index={i} onSave={(p) => upsert.mutate({ id: t.id, ...p })} onDelete={() => del.mutate(t.id)} />
          ))}
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!draft.quote || !draft.author) return;
            upsert.mutate({ ...draft, position: (data?.length ?? 0) });
            setDraft({ quote: "", author: "" });
          }} className="rounded-xl border border-dashed border-border p-3 space-y-2">
            <Field label="Nova frase">
              <textarea rows={2} className={input} value={draft.quote} onChange={(e) => setDraft({ ...draft, quote: e.target.value })} />
            </Field>
            <Field label="Autor">
              <input className={input} value={draft.author} onChange={(e) => setDraft({ ...draft, author: e.target.value })} />
            </Field>
            <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background hover:bg-primary">
              <Plus className="h-3 w-3" /> Adicionar depoimento
            </button>
          </form>
        </div>
      )}
    </Card>
  );
}

function TestimonialRow({ t, index, onSave, onDelete }: { t: Testimonial; index: number; onSave: (p: Partial<Testimonial>) => void; onDelete: () => void }) {
  const [v, setV] = useState(t);
  useEffect(() => setV(t), [t]);
  const dirty = v.quote !== t.quote || v.author !== t.author || v.active !== t.active;
  return (
    <div className="rounded-xl border border-border bg-background p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">#{index + 1}</span>
        <div className="flex items-center gap-2">
          <Toggle checked={v.active} onChange={(b) => { setV({ ...v, active: b }); onSave({ active: b }); }} label="Ativo" small />
          <button onClick={onDelete} className="grid h-7 w-7 place-items-center rounded-lg text-destructive hover:bg-destructive/10">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <textarea rows={2} className={input} value={v.quote} onChange={(e) => setV({ ...v, quote: e.target.value })} />
      <input className={input} value={v.author} onChange={(e) => setV({ ...v, author: e.target.value })} />
      {dirty && (
        <button onClick={() => onSave({ quote: v.quote, author: v.author })}
          className="rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:bg-primary">Salvar</button>
      )}
    </div>
  );
}

/* shared bits */
const input = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground";

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <header className="mb-4">
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ checked, onChange, label, small }: { checked: boolean; onChange: (b: boolean) => void; label: string; small?: boolean }) {
  return (
    <label className={`inline-flex cursor-pointer items-center gap-2 ${small ? "text-xs" : "text-sm"}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-foreground" />
      {label}
    </label>
  );
}

function SaveButton({ pending }: { pending: boolean }) {
  return (
    <div className="pt-2">
      <button type="submit" disabled={pending}
        className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background hover:bg-primary disabled:opacity-60">
        {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Salvar
      </button>
    </div>
  );
}

function ImageField({ label, value, onChange }: { label: string; value: string; onChange: (url: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div>
      <span className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      <div className="flex items-center gap-3">
        <div className="grid h-20 w-32 place-items-center overflow-hidden rounded-lg border border-border bg-muted">
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="h-5 w-5 text-muted-foreground" />}
        </div>
        <div className="flex-1 space-y-2">
          <input className={input} placeholder="URL da imagem" value={value} onChange={(e) => onChange(e.target.value)} />
          <input ref={ref} type="file" accept="image/*" className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0]; if (!f) return;
              setBusy(true);
              try { onChange(await uploadImage(f)); } catch (err) { toast.error("Falha no upload", { description: (err as Error).message }); }
              finally { setBusy(false); if (ref.current) ref.current.value = ""; }
            }} />
          <button type="button" disabled={busy} onClick={() => ref.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-foreground hover:text-foreground">
            {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />} Enviar arquivo
          </button>
        </div>
      </div>
    </div>
  );
}

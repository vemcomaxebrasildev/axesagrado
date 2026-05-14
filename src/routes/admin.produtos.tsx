import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  X,
  Image as ImageIcon,
  Video,
  Layers,
  Package as PackageIcon,
  Upload,
  Minus,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { categories, formatBRL } from "@/data/products";
import { useProducts, type AdminProduct, type ProductVariation } from "@/contexts/ProductsContext";

export const Route = createFileRoute("/admin/produtos")({
  component: AdminProdutos,
});

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const newId = () => Math.random().toString(36).slice(2, 9);

const emptyDraft = (): AdminProduct => ({
  slug: "",
  name: "",
  category: "orixas",
  entity: "",
  shortDescription: "",
  description: "",
  price: 0,
  oldPrice: undefined,
  image: "",
  images: [],
  videoUrl: "",
  rating: 5,
  reviews: 0,
  stock: 0,
  dimensions: "",
  weight: "",
  shipping: "Envio em até 5 dias úteis",
  variations: [],
  active: true,
});

function AdminProdutos() {
  const { items, upsert, remove, setStock, reset } = useProducts();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [viewing, setViewing] = useState<AdminProduct | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminProduct | null>(null);

  const filtered = useMemo(
    () =>
      items.filter(
        (p) =>
          p.name.toLowerCase().includes(q.toLowerCase()) &&
          (cat === "all" || p.category === cat),
      ),
    [items, q, cat],
  );

  const totalStock = items.reduce(
    (acc, p) =>
      acc +
      (p.variations && p.variations.length
        ? p.variations.reduce((a, v) => a + v.stock, 0)
        : p.stock),
    0,
  );
  const lowStock = items.filter((p) => p.stock < 5).length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Produtos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length} peças cadastradas · {totalStock} unidades em estoque ·{" "}
            <span className={lowStock ? "text-destructive" : ""}>
              {lowStock} com estoque baixo
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (confirm("Restaurar produtos iniciais? Suas alterações serão perdidas.")) {
                reset();
                toast.success("Produtos restaurados");
              }
            }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs font-medium hover:bg-muted"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Restaurar
          </button>
          <button
            onClick={() => setEditing(emptyDraft())}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background transition hover:bg-primary"
          >
            <Plus className="h-4 w-4" /> Novo produto
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar produto..."
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm outline-none focus:border-foreground"
          />
        </div>
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-foreground"
        >
          <option value="all">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Mídia</th>
              <th className="px-4 py-3">Estoque</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const photoCount = (p.images?.length || 0) + (p.image && !p.images?.includes(p.image) ? 1 : 0);
              return (
                <tr key={p.slug} className="border-t border-border">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                      ) : (
                        <div className="grid h-10 w-10 place-items-center rounded-lg bg-muted text-muted-foreground">
                          <ImageIcon className="h-4 w-4" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{p.name || "(sem nome)"}</p>
                        <p className="text-xs text-muted-foreground">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">
                    {p.category.replace("-", " ")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <ImageIcon className="h-3 w-3" /> {photoCount}
                      </span>
                      {p.videoUrl && (
                        <span className="inline-flex items-center gap-1">
                          <Video className="h-3 w-3" /> 1
                        </span>
                      )}
                      {p.variations && p.variations.length > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Layers className="h-3 w-3" /> {p.variations.length}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setStock(p.slug, Math.max(0, p.stock - 1))}
                        className="grid h-6 w-6 place-items-center rounded-md border border-border text-muted-foreground hover:bg-muted"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span
                        className={
                          p.stock < 5
                            ? "min-w-[44px] text-center inline-flex justify-center rounded-full bg-destructive/10 px-2.5 py-1 text-[11px] font-medium text-destructive"
                            : "min-w-[44px] text-center inline-flex justify-center rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium"
                        }
                      >
                        {p.stock}
                      </span>
                      <button
                        onClick={() => setStock(p.slug, p.stock + 1)}
                        className="grid h-6 w-6 place-items-center rounded-md border border-border text-muted-foreground hover:bg-muted"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">{formatBRL(p.price)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setViewing(p)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                        title="Visualizar"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setEditing({ ...p })}
                        className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                        title="Editar"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(p)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-destructive/70 hover:bg-destructive/10"
                        title="Excluir"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  Nenhum produto encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <ProductForm
          initial={editing}
          existingSlugs={items.map((i) => i.slug)}
          onCancel={() => setEditing(null)}
          onSave={(p) => {
            upsert(p);
            setEditing(null);
            toast.success("Produto salvo", { description: p.name });
          }}
        />
      )}

      {viewing && <ProductView product={viewing} onClose={() => setViewing(null)} />}

      {confirmDelete && (
        <ConfirmDialog
          title="Excluir produto?"
          message={`"${confirmDelete.name}" será removido permanentemente.`}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            remove(confirmDelete.slug);
            toast.success("Produto excluído");
            setConfirmDelete(null);
          }}
        />
      )}
    </div>
  );
}

/* -------------------- Product Form -------------------- */

function ProductForm({
  initial,
  existingSlugs,
  onCancel,
  onSave,
}: {
  initial: AdminProduct;
  existingSlugs: string[];
  onCancel: () => void;
  onSave: (p: AdminProduct) => void;
}) {
  const isNew = !existingSlugs.includes(initial.slug);
  const [draft, setDraft] = useState<AdminProduct>(initial);
  const [tab, setTab] = useState<"basico" | "midia" | "variacoes" | "estoque">("basico");
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof AdminProduct>(k: K, v: AdminProduct[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    arr.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        setDraft((d) => {
          const images = [...(d.images || []), url];
          return { ...d, images, image: d.image || url };
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const addImageUrl = (url: string) => {
    if (!url.trim()) return;
    setDraft((d) => {
      const images = [...(d.images || []), url.trim()];
      return { ...d, images, image: d.image || url.trim() };
    });
  };

  const removeImage = (i: number) => {
    setDraft((d) => {
      const images = (d.images || []).filter((_, idx) => idx !== i);
      const image = d.image === d.images?.[i] ? images[0] || "" : d.image;
      return { ...d, images, image };
    });
  };

  const setMainImage = (url: string) => set("image", url);

  const addVariation = () =>
    setDraft((d) => ({
      ...d,
      variations: [
        ...(d.variations || []),
        { id: newId(), name: "", sku: "", stock: 0 } as ProductVariation,
      ],
    }));

  const updateVariation = (id: string, patch: Partial<ProductVariation>) =>
    setDraft((d) => ({
      ...d,
      variations: (d.variations || []).map((v) => (v.id === id ? { ...v, ...patch } : v)),
    }));

  const removeVariation = (id: string) =>
    setDraft((d) => ({
      ...d,
      variations: (d.variations || []).filter((v) => v.id !== id),
    }));

  const submit = () => {
    if (!draft.name.trim()) return toast.error("Informe o nome do produto");
    const slug = draft.slug?.trim() || slugify(draft.name);
    if (isNew && existingSlugs.includes(slug)) return toast.error("Slug já existente");
    if (draft.price <= 0) return toast.error("Informe um preço válido");
    if (!draft.image && (!draft.images || draft.images.length === 0))
      return toast.error("Adicione ao menos uma imagem");

    const images = draft.images && draft.images.length ? draft.images : [draft.image];
    const image = draft.image || images[0];

    onSave({ ...draft, slug, images, image });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/50 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-2xl flex-col bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="font-display text-xl font-semibold">
              {isNew ? "Novo produto" : "Editar produto"}
            </h2>
            <p className="text-xs text-muted-foreground">{draft.name || "Sem título"}</p>
          </div>
          <button
            onClick={onCancel}
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex border-b border-border px-6">
          {[
            { id: "basico", label: "Básico", icon: PackageIcon },
            { id: "midia", label: "Mídia", icon: ImageIcon },
            { id: "variacoes", label: "Variações", icon: Layers },
            { id: "estoque", label: "Estoque", icon: Layers },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className={
                tab === t.id
                  ? "relative flex items-center gap-2 px-3 py-3 text-sm font-medium text-foreground"
                  : "relative flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground hover:text-foreground"
              }
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
              {tab === t.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto p-6">
          {tab === "basico" && (
            <div className="space-y-4">
              <Field label="Nome">
                <input
                  value={draft.name}
                  onChange={(e) => set("name", e.target.value)}
                  onBlur={() => isNew && !draft.slug && set("slug", slugify(draft.name))}
                  className="input"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Slug (URL)">
                  <input
                    value={draft.slug}
                    onChange={(e) => set("slug", slugify(e.target.value))}
                    disabled={!isNew}
                    className="input disabled:opacity-60"
                  />
                </Field>
                <Field label="Categoria">
                  <select
                    value={draft.category}
                    onChange={(e) => set("category", e.target.value)}
                    className="input"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Entidade (opcional)">
                <input
                  value={draft.entity || ""}
                  onChange={(e) => set("entity", e.target.value)}
                  className="input"
                  placeholder="Ex: Oxum, Caboclo, Preto Velho..."
                />
              </Field>
              <Field label="Descrição curta">
                <input
                  value={draft.shortDescription}
                  onChange={(e) => set("shortDescription", e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="Descrição completa">
                <textarea
                  value={draft.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={5}
                  className="input resize-none"
                />
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Preço (R$)">
                  <input
                    type="number"
                    step="0.01"
                    value={draft.price}
                    onChange={(e) => set("price", Number(e.target.value))}
                    className="input"
                  />
                </Field>
                <Field label="Preço antigo (R$)">
                  <input
                    type="number"
                    step="0.01"
                    value={draft.oldPrice ?? ""}
                    onChange={(e) =>
                      set("oldPrice", e.target.value ? Number(e.target.value) : undefined)
                    }
                    className="input"
                  />
                </Field>
                <Field label="Selo">
                  <select
                    value={draft.badge || ""}
                    onChange={(e) =>
                      set("badge", (e.target.value || undefined) as AdminProduct["badge"])
                    }
                    className="input"
                  >
                    <option value="">Nenhum</option>
                    <option>Lançamento</option>
                    <option>Mais vendido</option>
                    <option>Promoção</option>
                    <option>Edição limitada</option>
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Dimensões">
                  <input
                    value={draft.dimensions}
                    onChange={(e) => set("dimensions", e.target.value)}
                    className="input"
                  />
                </Field>
                <Field label="Peso">
                  <input
                    value={draft.weight}
                    onChange={(e) => set("weight", e.target.value)}
                    className="input"
                  />
                </Field>
                <Field label="Envio">
                  <input
                    value={draft.shipping}
                    onChange={(e) => set("shipping", e.target.value)}
                    className="input"
                  />
                </Field>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft.active !== false}
                  onChange={(e) => set("active", e.target.checked)}
                />
                Produto ativo (visível na loja)
              </label>
            </div>
          )}

          {tab === "midia" && (
            <div className="space-y-5">
              <div>
                <p className="mb-2 text-sm font-medium">Fotos</p>
                <p className="mb-3 text-xs text-muted-foreground">
                  Faça upload de múltiplas imagens. A foto destacada aparece em listagens.
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {(draft.images || []).map((url, i) => (
                    <div
                      key={i}
                      className={
                        url === draft.image
                          ? "group relative aspect-square overflow-hidden rounded-xl border-2 border-foreground"
                          : "group relative aspect-square overflow-hidden rounded-xl border border-border"
                      }
                    >
                      <img src={url} alt="" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60 opacity-0 transition group-hover:opacity-100">
                        <button
                          onClick={() => setMainImage(url)}
                          className="rounded-full bg-background px-3 py-1 text-[11px] font-medium"
                        >
                          {url === draft.image ? "Destacada" : "Definir destaque"}
                        </button>
                        <button
                          onClick={() => removeImage(i)}
                          className="rounded-full bg-destructive px-3 py-1 text-[11px] font-medium text-destructive-foreground"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="grid aspect-square place-items-center rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                  >
                    <div className="text-center text-xs">
                      <Upload className="mx-auto mb-1 h-5 w-5" />
                      Adicionar
                    </div>
                  </button>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    handleFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
                <UrlAdd onAdd={addImageUrl} placeholder="Ou cole uma URL de imagem..." />
              </div>

              <div className="border-t border-border pt-5">
                <p className="mb-2 text-sm font-medium">Vídeo do produto</p>
                <p className="mb-3 text-xs text-muted-foreground">
                  Cole a URL do YouTube, Vimeo ou um arquivo .mp4 público.
                </p>
                <input
                  value={draft.videoUrl || ""}
                  onChange={(e) => set("videoUrl", e.target.value)}
                  placeholder="https://..."
                  className="input"
                />
                {draft.videoUrl && (
                  <div className="mt-3 overflow-hidden rounded-xl border border-border bg-black/5 p-3 text-xs text-muted-foreground">
                    <Video className="mr-1.5 inline h-3.5 w-3.5" />
                    {draft.videoUrl}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "variacoes" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Variações</p>
                  <p className="text-xs text-muted-foreground">
                    Use para cores, tamanhos ou modelos. Cada variação tem estoque próprio.
                  </p>
                </div>
                <button
                  onClick={addVariation}
                  className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:bg-primary"
                >
                  <Plus className="h-3 w-3" /> Adicionar
                </button>
              </div>

              {(draft.variations || []).length === 0 && (
                <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  Nenhuma variação. Use o estoque principal na aba "Estoque".
                </div>
              )}

              {(draft.variations || []).map((v) => (
                <div
                  key={v.id}
                  className="grid grid-cols-12 gap-2 rounded-xl border border-border bg-card p-3"
                >
                  <input
                    value={v.name}
                    onChange={(e) => updateVariation(v.id, { name: e.target.value })}
                    placeholder="Nome (ex: Tamanho M)"
                    className="input col-span-4"
                  />
                  <input
                    value={v.sku || ""}
                    onChange={(e) => updateVariation(v.id, { sku: e.target.value })}
                    placeholder="SKU"
                    className="input col-span-3"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={v.price ?? ""}
                    onChange={(e) =>
                      updateVariation(v.id, {
                        price: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="Preço"
                    className="input col-span-2"
                  />
                  <input
                    type="number"
                    value={v.stock}
                    onChange={(e) => updateVariation(v.id, { stock: Number(e.target.value) })}
                    placeholder="Estoque"
                    className="input col-span-2"
                  />
                  <button
                    onClick={() => removeVariation(v.id)}
                    className="col-span-1 grid place-items-center rounded-lg text-destructive/70 hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === "estoque" && (
            <div className="space-y-4">
              <Field label="Estoque principal">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => set("stock", Math.max(0, draft.stock - 1))}
                    className="grid h-10 w-10 place-items-center rounded-lg border border-border hover:bg-muted"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    value={draft.stock}
                    onChange={(e) => set("stock", Math.max(0, Number(e.target.value)))}
                    className="input flex-1 text-center text-lg font-semibold"
                  />
                  <button
                    onClick={() => set("stock", draft.stock + 1)}
                    className="grid h-10 w-10 place-items-center rounded-lg border border-border hover:bg-muted"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </Field>
              {draft.stock < 5 && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                  Estoque baixo — considere repor antes de esgotar.
                </div>
              )}
              {draft.variations && draft.variations.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium">Estoque por variação</p>
                  <div className="space-y-2">
                    {draft.variations.map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-sm"
                      >
                        <span>{v.name || "Variação sem nome"}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateVariation(v.id, { stock: Math.max(0, v.stock - 1) })
                            }
                            className="grid h-7 w-7 place-items-center rounded-md border border-border hover:bg-muted"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-10 text-center font-medium">{v.stock}</span>
                          <button
                            onClick={() => updateVariation(v.id, { stock: v.stock + 1 })}
                            className="grid h-7 w-7 place-items-center rounded-md border border-border hover:bg-muted"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Total nas variações:{" "}
                    {draft.variations.reduce((a, v) => a + v.stock, 0)} unidades
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-card px-6 py-4">
          <button
            onClick={onCancel}
            className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            onClick={submit}
            className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background hover:bg-primary"
          >
            Salvar produto
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------- View / Confirm -------------------- */

function ProductView({ product, onClose }: { product: AdminProduct; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h3 className="font-display font-semibold">{product.name}</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-auto p-5">
          {product.image && (
            <img
              src={product.image}
              alt={product.name}
              className="mb-4 h-56 w-full rounded-xl object-cover"
            />
          )}
          <p className="text-sm text-muted-foreground">{product.shortDescription}</p>
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <Info label="Preço" value={formatBRL(product.price)} />
            <Info label="Estoque" value={`${product.stock} un`} />
            <Info label="Categoria" value={product.category} />
            <Info label="Fotos" value={`${(product.images || []).length}`} />
            <Info label="Vídeo" value={product.videoUrl ? "Sim" : "Não"} />
            <Info label="Variações" value={`${(product.variations || []).length}`} />
          </div>
          <p className="mt-4 whitespace-pre-line text-sm">{product.description}</p>
        </div>
      </div>
    </div>
  );
}

function ConfirmDialog({
  title,
  message,
  onCancel,
  onConfirm,
}: {
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-background p-5 shadow-2xl">
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="rounded-full bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:opacity-90"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------- helpers -------------------- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium capitalize">{value}</p>
    </div>
  );
}

function UrlAdd({ onAdd, placeholder }: { onAdd: (url: string) => void; placeholder?: string }) {
  const [v, setV] = useState("");
  return (
    <div className="mt-3 flex gap-2">
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder={placeholder}
        className="input flex-1"
      />
      <button
        onClick={() => {
          onAdd(v);
          setV("");
        }}
        className="rounded-xl border border-border bg-background px-4 text-sm font-medium hover:bg-muted"
      >
        Adicionar
      </button>
    </div>
  );
}

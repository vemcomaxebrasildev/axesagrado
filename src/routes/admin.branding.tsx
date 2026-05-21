import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Save } from "lucide-react";
import type { BrandSettings, ContactSettings, SocialSettings, SeoDefaults } from "@/hooks/useBranding";
import { DEFAULT_SETTINGS } from "@/hooks/useBranding";

export const Route = createFileRoute("/admin/branding")({
  component: AdminBrandingPage,
});

function AdminBrandingPage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["site_settings", "admin"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("key, value");
      const map: Record<string, unknown> = {};
      (data ?? []).forEach((r) => (map[r.key] = r.value));
      return {
        brand: { ...DEFAULT_SETTINGS.brand, ...((map.brand as object) ?? {}) } as BrandSettings,
        contact: { ...DEFAULT_SETTINGS.contact, ...((map.contact as object) ?? {}) } as ContactSettings,
        social: { ...DEFAULT_SETTINGS.social, ...((map.social as object) ?? {}) } as SocialSettings,
        seo_defaults: { ...DEFAULT_SETTINGS.seo_defaults, ...((map.seo_defaults as object) ?? {}) } as SeoDefaults,
      };
    },
  });

  const [brand, setBrand] = useState<BrandSettings>(DEFAULT_SETTINGS.brand);
  const [contact, setContact] = useState<ContactSettings>(DEFAULT_SETTINGS.contact);
  const [social, setSocial] = useState<SocialSettings>(DEFAULT_SETTINGS.social);
  const [seo, setSeo] = useState<SeoDefaults>(DEFAULT_SETTINGS.seo_defaults);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setBrand(data.brand);
      setContact(data.contact);
      setSocial(data.social);
      setSeo(data.seo_defaults);
    }
  }, [data]);

  const uploadFile = async (file: File, prefix: string) => {
    const path = `branding/${prefix}-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("product-media").upload(path, file);
    if (error) throw error;
    const { data: pub } = supabase.storage.from("product-media").getPublicUrl(path);
    return pub.publicUrl;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const rows = [
        { key: "brand", value: brand as unknown as Record<string, unknown> },
        { key: "contact", value: contact as unknown as Record<string, unknown> },
        { key: "social", value: social as unknown as Record<string, unknown> },
        { key: "seo_defaults", value: seo as unknown as Record<string, unknown> },
      ];
      for (const row of rows) {
        const { error } = await supabase.from("site_settings").upsert(row as never);
        if (error) throw error;
      }
      toast.success("Configurações salvas.");
      qc.invalidateQueries({ queryKey: ["site_settings"] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Identidade da loja (Whitelabel)</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Personalize nome, logo, cores, contato e redes — aplicado em todo o site.
        </p>
      </div>

      <Section title="Marca">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nome da loja">
            <Input value={brand.name} onChange={(e) => setBrand({ ...brand, name: e.target.value })} />
          </Field>
          <Field label="Tagline (subtítulo)">
            <Input value={brand.tagline} onChange={(e) => setBrand({ ...brand, tagline: e.target.value })} />
          </Field>
          <ImageField
            label="Logo"
            value={brand.logo_url}
            onChange={(url) => setBrand({ ...brand, logo_url: url })}
            upload={(f) => uploadFile(f, "logo")}
          />
          <ImageField
            label="Favicon"
            value={brand.favicon_url}
            onChange={(url) => setBrand({ ...brand, favicon_url: url })}
            upload={(f) => uploadFile(f, "favicon")}
          />
          <Field label="Cor primária">
            <div className="flex gap-2">
              <Input type="color" value={brand.primary_color} onChange={(e) => setBrand({ ...brand, primary_color: e.target.value })} className="w-20" />
              <Input value={brand.primary_color} onChange={(e) => setBrand({ ...brand, primary_color: e.target.value })} />
            </div>
          </Field>
          <Field label="Cor de destaque">
            <div className="flex gap-2">
              <Input type="color" value={brand.accent_color} onChange={(e) => setBrand({ ...brand, accent_color: e.target.value })} className="w-20" />
              <Input value={brand.accent_color} onChange={(e) => setBrand({ ...brand, accent_color: e.target.value })} />
            </div>
          </Field>
        </div>
      </Section>

      <Section title="Contato">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="WhatsApp (DDI+DDD+número, só dígitos)">
            <Input value={contact.whatsapp} onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })} placeholder="5511999990000" />
          </Field>
          <Field label="Telefone para exibição">
            <Input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
          </Field>
          <Field label="E-mail">
            <Input type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
          </Field>
          <Field label="Horário de atendimento">
            <Input value={contact.hours} onChange={(e) => setContact({ ...contact, hours: e.target.value })} />
          </Field>
          <Field label="Endereço" className="md:col-span-2">
            <Input value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} />
          </Field>
        </div>
      </Section>

      <Section title="Redes sociais (URLs completas)">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Instagram"><Input value={social.instagram} onChange={(e) => setSocial({ ...social, instagram: e.target.value })} placeholder="https://instagram.com/..." /></Field>
          <Field label="Facebook"><Input value={social.facebook} onChange={(e) => setSocial({ ...social, facebook: e.target.value })} placeholder="https://facebook.com/..." /></Field>
          <Field label="YouTube"><Input value={social.youtube} onChange={(e) => setSocial({ ...social, youtube: e.target.value })} placeholder="https://youtube.com/..." /></Field>
          <Field label="TikTok"><Input value={social.tiktok} onChange={(e) => setSocial({ ...social, tiktok: e.target.value })} placeholder="https://tiktok.com/..." /></Field>
        </div>
      </Section>

      <Section title="SEO padrão (usado quando a página não tem SEO próprio)">
        <div className="space-y-4">
          <Field label="Título"><Input value={seo.title} onChange={(e) => setSeo({ ...seo, title: e.target.value })} /></Field>
          <Field label="Descrição"><Textarea value={seo.description} onChange={(e) => setSeo({ ...seo, description: e.target.value })} rows={3} /></Field>
          <ImageField label="Imagem OG (compartilhamento)" value={seo.og_image} onChange={(url) => setSeo({ ...seo, og_image: url })} upload={(f) => uploadFile(f, "og")} />
        </div>
      </Section>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function ImageField({
  label,
  value,
  onChange,
  upload,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  upload: (file: File) => Promise<string>;
}) {
  const [uploading, setUploading] = useState(false);
  return (
    <Field label={label}>
      <div className="flex items-center gap-3">
        {value && <img src={value} alt="" className="h-12 w-12 rounded border border-border object-cover" />}
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="URL da imagem" />
        <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-border bg-background px-3 text-xs font-medium hover:bg-muted">
          <Upload className="h-3 w-3" />
          {uploading ? "..." : "Upload"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setUploading(true);
              try {
                const url = await upload(file);
                onChange(url);
                toast.success("Imagem enviada.");
              } catch (err) {
                toast.error((err as Error).message);
              } finally {
                setUploading(false);
              }
            }}
          />
        </label>
      </div>
    </Field>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Truck, Save, Info } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/frete")({
  component: AdminFretePage,
});

type ShippingConfig = {
  provider: string;
  origin_cep: string;
  free_threshold: number;
  api_url: string;
  api_token: string;
  contract: string;
  services: string;
  markup_percent: number;
  enabled: boolean;
};

const DEFAULTS: ShippingConfig = {
  provider: "melhor_envio",
  origin_cep: "",
  free_threshold: 350,
  api_url: "",
  api_token: "",
  contract: "",
  services: "PAC,SEDEX",
  markup_percent: 0,
  enabled: false,
};

const PROVIDERS = [
  { value: "melhor_envio", label: "Melhor Envio" },
  { value: "frenet", label: "Frenet" },
  { value: "correios", label: "Correios (WS)" },
  { value: "kangu", label: "Kangu" },
  { value: "custom", label: "API customizada" },
  { value: "manual", label: "Manual (sem integração)" },
];

function AdminFretePage() {
  const [cfg, setCfg] = useState<ShippingConfig>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("admin_settings")
        .select("value")
        .eq("key", "shipping")
        .maybeSingle();
      if (!error && data?.value) {
        setCfg({ ...DEFAULTS, ...(data.value as Partial<ShippingConfig>) });
      }
      setLoading(false);
    })();
  }, []);

  const set = <K extends keyof ShippingConfig>(k: K, v: ShippingConfig[K]) =>
    setCfg((c) => ({ ...c, [k]: v }));

  const onSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("admin_settings")
      .upsert({ key: "shipping", value: cfg as never }, { onConflict: "key" });
    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar", { description: error.message });
      return;
    }
    toast.success("Configurações de frete salvas");
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Carregando...</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Truck className="h-6 w-6 text-primary" />
        <div>
          <h1 className="font-display text-2xl font-semibold">Configuração de frete</h1>
          <p className="text-sm text-muted-foreground">
            Defina a integração com a API de cálculo de frete usada na loja.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <label className="flex items-center justify-between gap-3 rounded-xl border border-border p-4">
          <div>
            <p className="text-sm font-medium">Habilitar cálculo via API</p>
            <p className="text-xs text-muted-foreground">
              Quando desligado, a loja usa apenas tarifas manuais.
            </p>
          </div>
          <input
            type="checkbox"
            checked={cfg.enabled}
            onChange={(e) => set("enabled", e.target.checked)}
            className="h-5 w-5 accent-primary"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Provedor">
            <select
              value={cfg.provider}
              onChange={(e) => set("provider", e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              {PROVIDERS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="CEP de origem">
            <input
              inputMode="numeric"
              maxLength={9}
              placeholder="00000-000"
              value={cfg.origin_cep}
              onChange={(e) => set("origin_cep", e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </Field>

          <Field label="URL da API">
            <input
              type="url"
              placeholder="https://api.provedor.com.br/calcular"
              value={cfg.api_url}
              onChange={(e) => set("api_url", e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </Field>

          <Field label="Token / API Key">
            <input
              type="password"
              placeholder="••••••••"
              value={cfg.api_token}
              onChange={(e) => set("api_token", e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </Field>

          <Field label="Contrato / Carteira (opcional)">
            <input
              value={cfg.contract}
              onChange={(e) => set("contract", e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </Field>

          <Field label="Serviços (separados por vírgula)">
            <input
              value={cfg.services}
              onChange={(e) => set("services", e.target.value)}
              placeholder="PAC,SEDEX"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </Field>

          <Field label="Frete grátis acima de (R$)">
            <input
              type="number"
              min={0}
              value={cfg.free_threshold}
              onChange={(e) => set("free_threshold", Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </Field>

          <Field label="Markup sobre o frete (%)">
            <input
              type="number"
              min={0}
              max={100}
              value={cfg.markup_percent}
              onChange={(e) => set("markup_percent", Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </Field>
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Para máxima segurança em produção, recomenda-se também armazenar o token como
            <strong> secret do servidor</strong> e usar uma server function para chamar a API
            (evita expor a chave ao cliente).
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:bg-primary disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Salvando..." : "Salvar configuração"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-foreground/80">{label}</span>
      {children}
    </label>
  );
}

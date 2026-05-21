import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Activity, AlertCircle, BarChart3, History, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/admin/saude")({
  component: AdminSaude,
});

function StatusDot({ ok }: { ok: boolean }) {
  return ok ? (
    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
  ) : (
    <XCircle className="h-4 w-4 text-rose-600" />
  );
}

function useHealthChecks() {
  const [checks, setChecks] = useState<{ name: string; ok: boolean; latency?: number; error?: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    async function run() {
      setLoading(true);
      const out: typeof checks = [];

      // DB read
      const t1 = performance.now();
      try {
        const { error } = await supabase.from("site_settings").select("key").limit(1);
        out.push({ name: "Banco de dados (leitura)", ok: !error, latency: Math.round(performance.now() - t1), error: error?.message });
      } catch (e: any) {
        out.push({ name: "Banco de dados (leitura)", ok: false, error: String(e?.message ?? e) });
      }

      // Storage
      const t2 = performance.now();
      try {
        const { error } = await supabase.storage.from("product-media").list("", { limit: 1 });
        out.push({ name: "Storage (product-media)", ok: !error, latency: Math.round(performance.now() - t2), error: error?.message });
      } catch (e: any) {
        out.push({ name: "Storage (product-media)", ok: false, error: String(e?.message ?? e) });
      }

      // Auth
      const t3 = performance.now();
      try {
        const { error } = await supabase.auth.getSession();
        out.push({ name: "Autenticação", ok: !error, latency: Math.round(performance.now() - t3), error: error?.message });
      } catch (e: any) {
        out.push({ name: "Autenticação", ok: false, error: String(e?.message ?? e) });
      }

      if (!cancel) {
        setChecks(out);
        setLoading(false);
      }
    }
    run();
    return () => { cancel = true; };
  }, []);

  return { checks, loading };
}

function AdminSaude() {
  const { checks, loading: healthLoading } = useHealthChecks();

  const { data: logs } = useQuery({
    queryKey: ["system-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const { data: audit } = useQuery({
    queryKey: ["audit-log"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const { data: metrics } = useQuery({
    queryKey: ["health-metrics"],
    queryFn: async () => {
      const since = new Date(Date.now() - 7 * 86400_000).toISOString();
      const [orders, views, oos] = await Promise.all([
        supabase.from("orders").select("id,total,created_at,status").gte("created_at", since),
        supabase.from("page_views").select("id,created_at").gte("created_at", since),
        supabase.from("products").select("id,name,stock").lte("stock", 0).eq("active", true),
      ]);
      return {
        orders: orders.data ?? [],
        views: views.data ?? [],
        outOfStock: oos.data ?? [],
      };
    },
  });

  const totalRevenue = (metrics?.orders ?? []).reduce((s, o: any) => s + Number(o.total ?? 0), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Saúde do sistema</h1>
        <p className="text-sm text-muted-foreground">Status, logs, métricas e auditoria.</p>
      </div>

      {/* Health */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <Activity className="h-4 w-4" /> Status dos serviços
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          {healthLoading ? (
            <div className="col-span-3 flex items-center gap-2 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Verificando...
            </div>
          ) : (
            checks.map((c) => (
              <div key={c.name} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{c.name}</p>
                  <StatusDot ok={c.ok} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {c.ok ? `OK — ${c.latency}ms` : c.error ?? "Falha"}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Metrics */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <BarChart3 className="h-4 w-4" /> Métricas (últimos 7 dias)
        </h2>
        <div className="grid gap-3 md:grid-cols-4">
          <Metric label="Pedidos" value={String(metrics?.orders.length ?? 0)} />
          <Metric label="Faturamento" value={totalRevenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} />
          <Metric label="Visualizações" value={String(metrics?.views.length ?? 0)} />
          <Metric label="Produtos sem estoque" value={String(metrics?.outOfStock.length ?? 0)} highlight={(metrics?.outOfStock.length ?? 0) > 0} />
        </div>
      </section>

      {/* System logs */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <AlertCircle className="h-4 w-4" /> Logs recentes
        </h2>
        <div className="rounded-xl border border-border bg-card">
          {logs && logs.length > 0 ? (
            <ul className="divide-y divide-border">
              {logs.map((l: any) => (
                <li key={l.id} className="flex items-start gap-3 p-3 text-sm">
                  <span className={
                    l.level === "error" ? "mt-1 h-2 w-2 rounded-full bg-rose-600" :
                    l.level === "warn" ? "mt-1 h-2 w-2 rounded-full bg-amber-500" :
                    "mt-1 h-2 w-2 rounded-full bg-emerald-500"
                  } />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{l.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {l.source} · {new Date(l.created_at).toLocaleString("pt-BR")}
                    </p>
                    {l.context && (
                      <pre className="mt-1 overflow-x-auto rounded bg-muted p-2 text-[10px]">{JSON.stringify(l.context, null, 2)}</pre>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-6 text-center text-sm text-muted-foreground">Nenhum log registrado.</p>
          )}
        </div>
      </section>

      {/* Audit */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <History className="h-4 w-4" /> Auditoria de admin
        </h2>
        <div className="rounded-xl border border-border bg-card">
          {audit && audit.length > 0 ? (
            <ul className="divide-y divide-border">
              {audit.map((a: any) => (
                <li key={a.id} className="p-3 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium">{a.action}</span>
                    <span className="text-xs text-muted-foreground">{a.entity_type}{a.entity_id ? ` · ${a.entity_id}` : ""}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {a.actor_email ?? a.actor_id ?? "—"} · {new Date(a.created_at).toLocaleString("pt-BR")}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-6 text-center text-sm text-muted-foreground">Nenhuma ação registrada ainda.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border bg-card p-4 ${highlight ? "border-rose-300" : "border-border"}`}>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold">{value}</p>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { getInboxMetrics } from "@/lib/whatsapp.functions";

export const Route = createFileRoute("/admin/atendimento/metricas")({
  component: MetricasPage,
});

type Metrics = Awaited<ReturnType<typeof getInboxMetrics>>;

function MetricasPage() {
  const load = useServerFn(getInboxMetrics);
  const [m, setM] = useState<Metrics | null>(null);
  useEffect(() => { load().then(setM as any); }, []);

  if (!m) return <p className="text-sm text-muted-foreground">Carregando…</p>;

  const fmtSec = (s: number) => {
    if (!s) return "—";
    if (s < 60) return `${s}s`;
    if (s < 3600) return `${Math.round(s / 60)} min`;
    return `${(s / 3600).toFixed(1)} h`;
  };

  const maxDay = Math.max(1, ...m.resolvedByDay.map((d) => d.count));

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Métricas do atendimento</h1>
          <p className="text-sm text-muted-foreground">Visão geral dos últimos 7 dias.</p>
        </div>
        <Link to="/admin/atendimento" className="text-sm text-muted-foreground hover:text-foreground">← Voltar ao Inbox</Link>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Stat label="Hoje" value={m.today} />
        <Stat label="Em fila" value={m.queued} />
        <Stat label="Em atendimento" value={m.assigned} />
        <Stat label="Resolvidas (7d)" value={m.resolved7d} />
        <Stat label="TMR" value={fmtSec(m.avgFirstResponseSec)} />
      </div>

      <Card className="p-6">
        <h2 className="font-semibold mb-4">Resolvidas por dia</h2>
        <div className="flex items-end gap-2 h-40">
          {m.resolvedByDay.map((d) => (
            <div key={d.day} className="flex-1 flex flex-col items-center justify-end">
              <div className="w-full bg-primary rounded-t" style={{ height: `${(d.count / maxDay) * 100}%` }} />
              <span className="text-[10px] text-muted-foreground mt-1">{d.day}</span>
              <span className="text-xs font-medium">{d.count}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold mb-4">Por atendente</h2>
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-muted-foreground">
            <tr><th className="py-2">Atendente</th><th>Atendidas</th><th>Resolvidas</th></tr>
          </thead>
          <tbody>
            {m.byAgent.map((a) => (
              <tr key={a.user_id} className="border-t border-border">
                <td className="py-2">{a.display_name}</td>
                <td>{a.handled}</td>
                <td>{a.resolved}</td>
              </tr>
            ))}
            {m.byAgent.length === 0 && <tr><td colSpan={3} className="py-6 text-center text-muted-foreground">Nenhum dado ainda.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <Card className="p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </Card>
  );
}

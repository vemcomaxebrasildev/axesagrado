import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Send, UserPlus, CheckCircle2, Search, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  listConversations,
  getConversation,
  assignConversation,
  resolveConversation,
  sendMessage,
  markRead,
  listAgents,
} from "@/lib/whatsapp.functions";

export const Route = createFileRoute("/admin/atendimento")({
  component: AtendimentoPage,
});

type Conv = {
  id: string;
  contact_phone: string;
  contact_name: string | null;
  status: string;
  assigned_to: string | null;
  last_message_at: string;
  unread_count: number;
};

type Msg = {
  id: string;
  direction: string;
  kind: string;
  body: string;
  created_at: string;
  sender_user_id: string | null;
};

function AtendimentoPage() {
  const { userId } = useAdminAuth();
  const loadList = useServerFn(listConversations);
  const loadConv = useServerFn(getConversation);
  const loadAgents = useServerFn(listAgents);
  const doAssign = useServerFn(assignConversation);
  const doResolve = useServerFn(resolveConversation);
  const doSend = useServerFn(sendMessage);
  const doMarkRead = useServerFn(markRead);

  const [filter, setFilter] = useState<"queued" | "mine" | "assigned" | "all" | "resolved">("queued");
  const [q, setQ] = useState("");
  const [list, setList] = useState<Conv[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [conv, setConv] = useState<Conv | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [body, setBody] = useState("");
  const [agents, setAgents] = useState<{ user_id: string; display_name: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const refreshList = async () => {
    const r = await loadList({ data: { status: filter, q: q || undefined } });
    setList(r.conversations as Conv[]);
  };
  const refreshConv = async (id: string) => {
    const r = await loadConv({ data: { id } });
    setConv(r.conversation as Conv);
    setMsgs(r.messages as Msg[]);
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }), 50);
  };

  useEffect(() => { refreshList(); }, [filter, q]);
  useEffect(() => { loadAgents().then((r) => setAgents(r.agents as any)); }, []);
  useEffect(() => { if (selectedId) { refreshConv(selectedId); doMarkRead({ data: { id: selectedId } }); } }, [selectedId]);

  // Realtime: refresh list on any conv change, conv pane on its message changes
  useEffect(() => {
    const ch = supabase
      .channel("wa-inbox")
      .on("postgres_changes", { event: "*", schema: "public", table: "wa_conversations" }, () => refreshList())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "wa_messages" }, (payload: any) => {
        if (selectedId && payload.new?.conversation_id === selectedId) refreshConv(selectedId);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [selectedId, filter, q]);

  const send = async () => {
    if (!conv || !body.trim()) return;
    try {
      await doSend({ data: { conversation_id: conv.id, body: body.trim() } });
      setBody("");
      refreshConv(conv.id);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Falha ao enviar"); }
  };

  const assignToMe = async () => {
    if (!conv || !userId) return;
    await doAssign({ data: { id: conv.id, agent_user_id: userId } });
    refreshConv(conv.id); refreshList();
  };
  const resolve = async () => {
    if (!conv) return;
    await doResolve({ data: { id: conv.id } });
    refreshConv(conv.id); refreshList();
  };
  const transfer = async (uid: string) => {
    if (!conv) return;
    await doAssign({ data: { id: conv.id, agent_user_id: uid } });
    refreshConv(conv.id); refreshList();
  };

  const tabs: { key: typeof filter; label: string }[] = [
    { key: "queued", label: "Fila" },
    { key: "mine", label: "Minhas" },
    { key: "assigned", label: "Em atendimento" },
    { key: "all", label: "Todas" },
    { key: "resolved", label: "Resolvidas" },
  ];

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Atendimento</h1>
          <p className="text-sm text-muted-foreground">Conversas em tempo real do WhatsApp.</p>
        </div>
        <Link to="/admin/atendimento/metricas" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <BarChart3 className="h-4 w-4" /> Métricas
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4 h-[calc(100vh-180px)]">
        {/* List */}
        <Card className="flex flex-col overflow-hidden">
          <div className="p-3 border-b border-border space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-8" placeholder="Buscar nome ou telefone" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-1">
              {tabs.map((t) => (
                <button key={t.key} onClick={() => setFilter(t.key)}
                  className={cn("text-xs rounded-full px-2.5 py-1 border", filter === t.key ? "bg-foreground text-background border-foreground" : "border-border hover:bg-muted")}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-auto">
            {list.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">Nenhuma conversa.</p>}
            {list.map((c) => (
              <button key={c.id} onClick={() => setSelectedId(c.id)}
                className={cn("w-full text-left px-3 py-3 border-b border-border hover:bg-muted/50", selectedId === c.id && "bg-muted")}>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm truncate">{c.contact_name ?? c.contact_phone}</span>
                  {c.unread_count > 0 && <span className="text-[10px] bg-primary text-primary-foreground rounded-full px-1.5">{c.unread_count}</span>}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                  <span>{c.contact_phone}</span>
                  <span className="capitalize">{c.status}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{new Date(c.last_message_at).toLocaleString("pt-BR")}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* Conversation pane */}
        <Card className="flex flex-col overflow-hidden">
          {!conv ? (
            <div className="flex-1 grid place-items-center text-muted-foreground text-sm">
              Selecione uma conversa.
            </div>
          ) : (
            <>
              <div className="p-3 border-b border-border flex items-center justify-between">
                <div>
                  <p className="font-semibold">{conv.contact_name ?? conv.contact_phone}</p>
                  <p className="text-xs text-muted-foreground">{conv.contact_phone} · {conv.status}</p>
                </div>
                <div className="flex gap-2">
                  {conv.assigned_to !== userId && (
                    <Button size="sm" variant="outline" onClick={assignToMe}><UserPlus className="h-4 w-4 mr-1" />Atribuir a mim</Button>
                  )}
                  <select
                    className="h-8 text-xs rounded-md border border-border bg-background px-2"
                    value={conv.assigned_to ?? ""}
                    onChange={(e) => transfer(e.target.value)}
                  >
                    <option value="">— Transferir —</option>
                    {agents.map((a) => <option key={a.user_id} value={a.user_id}>{a.display_name}</option>)}
                  </select>
                  {conv.status !== "resolved" && (
                    <Button size="sm" variant="outline" onClick={resolve}><CheckCircle2 className="h-4 w-4 mr-1" />Resolver</Button>
                  )}
                </div>
              </div>
              <div ref={scrollRef} className="flex-1 overflow-auto p-4 space-y-2 bg-muted/20">
                {msgs.map((m) => (
                  <div key={m.id} className={cn("flex", m.direction === "out" ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[70%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap",
                      m.direction === "out"
                        ? (m.kind === "menu" ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground")
                        : "bg-card border border-border"
                    )}>
                      {m.body}
                      <div className="text-[10px] opacity-70 mt-1">{new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-border flex gap-2">
                <Textarea
                  rows={2}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder="Digite a mensagem… (Enter para enviar)"
                />
                <Button onClick={send} disabled={!body.trim()}><Send className="h-4 w-4" /></Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

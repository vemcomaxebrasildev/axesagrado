import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, Plus, Trash2, MessageSquare, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  listChatbotMenu,
  saveChatbotNode,
  deleteChatbotNode,
  listAgents,
  saveAgent,
} from "@/lib/whatsapp.functions";

export const Route = createFileRoute("/admin/whatsapp")({
  component: WhatsappAdmin,
});

type Node = {
  id: string;
  parent_id: string | null;
  trigger: string;
  title: string;
  response_text: string | null;
  action: string;
  position: number;
};

function WhatsappAdmin() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-semibold">WhatsApp Business</h1>
        <p className="text-sm text-muted-foreground">
          Conecte o número da Meta, configure o chatbot e gerencie atendentes.
        </p>
      </header>
      <Tabs defaultValue="conexao">
        <TabsList>
          <TabsTrigger value="conexao"><Settings className="mr-2 h-4 w-4" />Conexão</TabsTrigger>
          <TabsTrigger value="chatbot"><MessageSquare className="mr-2 h-4 w-4" />Chatbot</TabsTrigger>
          <TabsTrigger value="atendentes">Atendentes</TabsTrigger>
        </TabsList>
        <TabsContent value="conexao"><ConexaoTab /></TabsContent>
        <TabsContent value="chatbot"><ChatbotTab /></TabsContent>
        <TabsContent value="atendentes"><AgentsTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function ConexaoTab() {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const webhookUrl = `${origin}/api/public/whatsapp/webhook`;
  const copy = (s: string) => { navigator.clipboard.writeText(s); toast.success("Copiado"); };
  return (
    <Card className="p-6 space-y-4">
      <div>
        <h2 className="font-semibold">Webhook da Meta</h2>
        <p className="text-sm text-muted-foreground">
          No Meta for Developers → WhatsApp → Configuration, use a URL abaixo e o Verify Token configurado.
        </p>
      </div>
      <div className="space-y-2">
        <Label>Callback URL</Label>
        <div className="flex gap-2">
          <Input readOnly value={webhookUrl} />
          <Button type="button" variant="outline" onClick={() => copy(webhookUrl)}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
        <p className="font-medium mb-2">Secrets necessários (já configurados):</p>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li><code>META_WA_ACCESS_TOKEN</code> — token permanente do System User</li>
          <li><code>META_WA_APP_SECRET</code> — usado para validar assinatura do webhook</li>
          <li><code>META_WA_PHONE_NUMBER_ID</code> — ID do número de telefone</li>
          <li><code>META_WA_VERIFY_TOKEN</code> — qualquer string; cole no painel da Meta</li>
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          Eventos a assinar: <code>messages</code>.
        </p>
      </div>
    </Card>
  );
}

function ChatbotTab() {
  const load = useServerFn(listChatbotMenu);
  const save = useServerFn(saveChatbotNode);
  const del = useServerFn(deleteChatbotNode);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [editing, setEditing] = useState<Partial<Node> | null>(null);

  const refresh = async () => {
    const r = await load();
    setNodes(r.nodes as Node[]);
  };
  useEffect(() => { refresh(); }, []);

  const parents = nodes.filter((n) => n.action === "submenu");

  const submit = async () => {
    if (!editing) return;
    if (!editing.trigger || !editing.title || !editing.action) {
      toast.error("Preencha gatilho, título e ação");
      return;
    }
    try {
      await save({
        data: {
          id: editing.id,
          parent_id: editing.parent_id ?? null,
          trigger: editing.trigger,
          title: editing.title,
          response_text: editing.response_text ?? null,
          action: editing.action as "reply" | "submenu" | "handoff",
          position: editing.position ?? 0,
        },
      });
      toast.success("Salvo");
      setEditing(null);
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar");
    }
  };

  const grouped = (parentId: string | null) =>
    nodes.filter((n) => (n.parent_id ?? null) === parentId).sort((a, b) => a.position - b.position);

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_360px]">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Menu do chatbot</h2>
          <Button size="sm" onClick={() => setEditing({ parent_id: null, action: "reply", position: 0 })}>
            <Plus className="h-4 w-4 mr-1" />Novo nó
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          O gatilho é o que o cliente digita (ex: <code>1</code>). Use a ação <strong>submenu</strong> para abrir outro nível,
          <strong> handoff</strong> para transferir ao humano, ou <strong>reply</strong> para responder e ficar no mesmo menu.
          O cliente sempre pode digitar <code>0</code> para falar com um atendente.
        </p>
        {nodes.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum nó configurado. Crie o primeiro para o bot funcionar.</p>
        )}
        {grouped(null).map((n) => (
          <NodeRow key={n.id} n={n} nodes={nodes} onEdit={setEditing} onDelete={async (id) => { await del({ data: { id } }); refresh(); }} depth={0} />
        ))}
      </Card>

      {editing && (
        <Card className="p-6 space-y-3 h-fit sticky top-4">
          <h3 className="font-semibold">{editing.id ? "Editar nó" : "Novo nó"}</h3>
          <div>
            <Label>Menu pai</Label>
            <Select
              value={editing.parent_id ?? "root"}
              onValueChange={(v) => setEditing({ ...editing, parent_id: v === "root" ? null : v })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="root">— Menu principal —</SelectItem>
                {parents.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.trigger}. {p.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-[100px_1fr] gap-2">
            <div>
              <Label>Gatilho</Label>
              <Input value={editing.trigger ?? ""} onChange={(e) => setEditing({ ...editing, trigger: e.target.value })} placeholder="1" />
            </div>
            <div>
              <Label>Título</Label>
              <Input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Falar com vendas" />
            </div>
          </div>
          <div>
            <Label>Ação</Label>
            <Select value={editing.action ?? "reply"} onValueChange={(v) => setEditing({ ...editing, action: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="reply">Responder</SelectItem>
                <SelectItem value="submenu">Abrir submenu</SelectItem>
                <SelectItem value="handoff">Transferir ao humano</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Mensagem de resposta</Label>
            <Textarea
              rows={5}
              value={editing.response_text ?? ""}
              onChange={(e) => setEditing({ ...editing, response_text: e.target.value })}
              placeholder="Texto que será enviado quando o cliente escolher esta opção"
            />
          </div>
          <div>
            <Label>Posição</Label>
            <Input
              type="number"
              value={editing.position ?? 0}
              onChange={(e) => setEditing({ ...editing, position: Number(e.target.value) })}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={submit}>Salvar</Button>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
          </div>
        </Card>
      )}
    </div>
  );
}

function NodeRow({
  n, nodes, onEdit, onDelete, depth,
}: { n: Node; nodes: Node[]; onEdit: (n: Node) => void; onDelete: (id: string) => void; depth: number }) {
  const children = nodes.filter((c) => c.parent_id === n.id).sort((a, b) => a.position - b.position);
  return (
    <div className="border-l border-border" style={{ marginLeft: depth * 16 }}>
      <div className="flex items-center justify-between py-2 pl-3">
        <div>
          <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-muted mr-2">{n.trigger}</span>
          <span className="font-medium">{n.title}</span>
          <span className="ml-2 text-xs text-muted-foreground">[{n.action}]</span>
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => onEdit(n)}>Editar</Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(n.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      {children.map((c) => (
        <NodeRow key={c.id} n={c} nodes={nodes} onEdit={onEdit} onDelete={onDelete} depth={depth + 1} />
      ))}
    </div>
  );
}

function AgentsTab() {
  const load = useServerFn(listAgents);
  const save = useServerFn(saveAgent);
  const [agents, setAgents] = useState<{ id: string; user_id: string; display_name: string; active: boolean }[]>([]);
  const [form, setForm] = useState({ user_id: "", display_name: "", active: true });

  const refresh = async () => {
    const r = await load();
    setAgents(r.agents as any);
  };
  useEffect(() => { refresh(); }, []);

  const submit = async () => {
    if (!form.user_id || !form.display_name) {
      toast.error("Informe ID do usuário e nome");
      return;
    }
    try {
      await save({ data: form });
      toast.success("Atendente salvo");
      setForm({ user_id: "", display_name: "", active: true });
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro");
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_360px]">
      <Card className="p-6">
        <h2 className="font-semibold mb-3">Atendentes ativos</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Cadastre usuários do sistema que poderão acessar o Inbox de atendimento. Use o ID do usuário (UUID) que aparece em Clientes.
        </p>
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-muted-foreground">
            <tr><th className="py-2">Nome</th><th>User ID</th><th>Ativo</th></tr>
          </thead>
          <tbody>
            {agents.map((a) => (
              <tr key={a.id} className="border-t border-border">
                <td className="py-2">{a.display_name}</td>
                <td className="font-mono text-xs">{a.user_id}</td>
                <td>{a.active ? "Sim" : "Não"}</td>
              </tr>
            ))}
            {agents.length === 0 && <tr><td colSpan={3} className="py-6 text-center text-muted-foreground">Nenhum atendente cadastrado.</td></tr>}
          </tbody>
        </table>
      </Card>
      <Card className="p-6 space-y-3 h-fit">
        <h3 className="font-semibold">Adicionar atendente</h3>
        <div><Label>User ID (UUID)</Label><Input value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })} /></div>
        <div><Label>Nome de exibição</Label><Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} /></div>
        <Button onClick={submit}>Salvar</Button>
      </Card>
    </div>
  );
}

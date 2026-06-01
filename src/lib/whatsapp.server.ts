// Server-only helpers for WhatsApp Business (Meta Cloud API).
// This module must never be imported from client code.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const GRAPH_VERSION = "v21.0";

export type MetaSendResult = {
  ok: boolean;
  wa_message_id?: string;
  error?: string;
};

export async function metaSendText(toPhone: string, body: string): Promise<MetaSendResult> {
  const token = process.env.META_WA_ACCESS_TOKEN;
  const phoneId = process.env.META_WA_PHONE_NUMBER_ID;
  if (!token || !phoneId) {
    return { ok: false, error: "META_WA_ACCESS_TOKEN/META_WA_PHONE_NUMBER_ID not set" };
  }
  try {
    const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: toPhone,
        type: "text",
        text: { body: body.slice(0, 4000) },
      }),
    });
    const json = (await res.json()) as { messages?: { id: string }[]; error?: { message: string } };
    if (!res.ok) return { ok: false, error: json?.error?.message ?? `HTTP ${res.status}` };
    return { ok: true, wa_message_id: json.messages?.[0]?.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "unknown error" };
  }
}

type MenuNode = {
  id: string;
  parent_id: string | null;
  trigger: string;
  title: string;
  response_text: string | null;
  action: string;
  position: number;
};

function renderMenu(parentId: string | null, nodes: MenuNode[]): string {
  const children = nodes
    .filter((n) => (n.parent_id ?? null) === parentId)
    .sort((a, b) => a.position - b.position);
  if (children.length === 0) return "";
  const lines = children.map((c) => `${c.trigger}. ${c.title}`);
  return lines.join("\n");
}

/**
 * Runs the chatbot for an incoming message and returns text to send back
 * (or null when handing off to a human).
 */
export async function runChatbot(opts: {
  conversationId: string;
  incomingText: string;
  botState: { node?: string | null } | null;
}): Promise<{ reply: string | null; handoff: boolean; nextState: { node: string | null } }> {
  const { conversationId, incomingText } = opts;
  const text = incomingText.trim();

  const { data: nodesData } = await supabaseAdmin
    .from("chatbot_menu")
    .select("id, parent_id, trigger, title, response_text, action, position");
  const nodes = (nodesData ?? []) as MenuNode[];

  const currentParent = opts.botState?.node ?? null;

  // Reserved triggers
  const wantsHuman = /^(0|humano|atendente|sair)$/i.test(text);
  if (wantsHuman) {
    return {
      reply: "Tudo bem! Vou te transferir para um atendente humano. Aguarde um instante. 🙋",
      handoff: true,
      nextState: { node: null },
    };
  }

  // Find a matching child of current node
  const candidates = nodes.filter((n) => (n.parent_id ?? null) === currentParent);
  const match = candidates.find(
    (c) => c.trigger.toLowerCase() === text.toLowerCase() || c.title.toLowerCase() === text.toLowerCase(),
  );

  if (!match) {
    // No match: render current menu (or root) as a fallback / welcome
    const menuText = renderMenu(currentParent, nodes);
    if (menuText) {
      return {
        reply:
          `Olá! 👋 Como podemos te ajudar?\n\n${menuText}\n\nResponda com o número da opção desejada.\nDigite *0* a qualquer momento para falar com um atendente.`,
        handoff: false,
        nextState: { node: currentParent },
      };
    }
    // No menu configured: handoff
    return {
      reply: "Olá! Vou te encaminhar para um atendente.",
      handoff: true,
      nextState: { node: null },
    };
  }

  // Match found
  if (match.action === "handoff") {
    return {
      reply: match.response_text || "Encaminhando você para um atendente. Um instante!",
      handoff: true,
      nextState: { node: null },
    };
  }

  if (match.action === "submenu") {
    const sub = renderMenu(match.id, nodes);
    const intro = match.response_text ? `${match.response_text}\n\n` : "";
    return {
      reply: `${intro}${sub}\n\nDigite *0* para falar com um atendente.`,
      handoff: false,
      nextState: { node: match.id },
    };
  }

  // default: reply
  return {
    reply: match.response_text || match.title,
    handoff: false,
    nextState: { node: currentParent },
  };
}

/** Upsert (open or create) a conversation for an inbound phone. */
export async function getOrCreateOpenConversation(phone: string, name: string | null) {
  // Try open conversation first
  const { data: existing } = await supabaseAdmin
    .from("wa_conversations")
    .select("*")
    .eq("contact_phone", phone)
    .neq("status", "resolved")
    .maybeSingle();
  if (existing) return existing;

  const { data: created, error } = await supabaseAdmin
    .from("wa_conversations")
    .insert({
      contact_phone: phone,
      contact_name: name,
      status: "bot",
      last_message_at: new Date().toISOString(),
    })
    .select("*")
    .single();
  if (error) throw error;
  return created;
}

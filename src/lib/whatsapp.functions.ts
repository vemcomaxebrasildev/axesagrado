import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { metaSendText } from "./whatsapp.server";

async function assertStaff(supabase: any, userId: string) {
  // admin?
  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (roles) return { isAdmin: true };
  // agent?
  const { data: agent } = await supabase
    .from("wa_agents")
    .select("id")
    .eq("user_id", userId)
    .eq("active", true)
    .maybeSingle();
  if (!agent) throw new Error("Forbidden: not a WhatsApp staff member");
  return { isAdmin: false };
}

// ---- Chatbot menu ----
export const listChatbotMenu = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("chatbot_menu")
      .select("*")
      .order("position", { ascending: true });
    if (error) throw new Error(error.message);
    return { nodes: data ?? [] };
  });

const NodeInput = z.object({
  id: z.string().uuid().optional(),
  parent_id: z.string().uuid().nullable(),
  trigger: z.string().trim().min(1).max(32),
  title: z.string().trim().min(1).max(200),
  response_text: z.string().max(4000).nullable().optional(),
  action: z.enum(["reply", "submenu", "handoff"]),
  position: z.number().int().min(0).max(999),
});

export const saveChatbotNode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => NodeInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: roles } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roles) throw new Error("Forbidden: admin only");

    if (data.id) {
      const { error } = await context.supabase
        .from("chatbot_menu")
        .update({
          parent_id: data.parent_id,
          trigger: data.trigger,
          title: data.title,
          response_text: data.response_text ?? null,
          action: data.action,
          position: data.position,
        })
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: created, error } = await context.supabase
      .from("chatbot_menu")
      .insert({
        parent_id: data.parent_id,
        trigger: data.trigger,
        title: data.title,
        response_text: data.response_text ?? null,
        action: data.action,
        position: data.position,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: created.id };
  });

export const deleteChatbotNode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: roles } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roles) throw new Error("Forbidden: admin only");
    const { error } = await context.supabase.from("chatbot_menu").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---- Agents ----
export const listAgents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("wa_agents")
      .select("id, user_id, display_name, active")
      .order("display_name");
    if (error) throw new Error(error.message);
    return { agents: data ?? [] };
  });

export const saveAgent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        user_id: z.string().uuid(),
        display_name: z.string().trim().min(1).max(200),
        active: z.boolean(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: roles } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roles) throw new Error("Forbidden: admin only");
    const { error } = await context.supabase.from("wa_agents").upsert(data, { onConflict: "user_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---- Conversations ----
export const listConversations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        status: z.enum(["all", "queued", "assigned", "bot", "resolved", "mine"]).default("all"),
        q: z.string().max(200).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    let query = context.supabase
      .from("wa_conversations")
      .select("*")
      .order("last_message_at", { ascending: false })
      .limit(200);

    if (data.status === "mine") {
      query = query.eq("assigned_to", context.userId).neq("status", "resolved");
    } else if (data.status !== "all") {
      query = query.eq("status", data.status);
    }
    if (data.q) {
      query = query.or(`contact_phone.ilike.%${data.q}%,contact_name.ilike.%${data.q}%`);
    }
    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return { conversations: rows ?? [] };
  });

export const getConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    const [{ data: conv, error: e1 }, { data: msgs, error: e2 }] = await Promise.all([
      context.supabase.from("wa_conversations").select("*").eq("id", data.id).single(),
      context.supabase
        .from("wa_messages")
        .select("*")
        .eq("conversation_id", data.id)
        .order("created_at", { ascending: true }),
    ]);
    if (e1) throw new Error(e1.message);
    if (e2) throw new Error(e2.message);
    return { conversation: conv, messages: msgs ?? [] };
  });

export const assignConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid(),
        agent_user_id: z.string().uuid().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("wa_conversations")
      .update({
        assigned_to: data.agent_user_id,
        status: data.agent_user_id ? "assigned" : "queued",
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const resolveConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("wa_conversations")
      .update({ status: "resolved", resolved_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const sendMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        conversation_id: z.string().uuid(),
        body: z.string().trim().min(1).max(4000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);

    // Fetch contact phone (RLS-checked under user)
    const { data: conv, error: e1 } = await context.supabase
      .from("wa_conversations")
      .select("id, contact_phone, first_response_at, assigned_to, status")
      .eq("id", data.conversation_id)
      .single();
    if (e1 || !conv) throw new Error(e1?.message ?? "Conversation not found");

    const result = await metaSendText(conv.contact_phone, data.body);
    if (!result.ok) throw new Error(result.error ?? "Failed to send to WhatsApp");

    // Insert message (RLS allows out-direction insert for staff)
    const { error: e2 } = await context.supabase.from("wa_messages").insert({
      conversation_id: conv.id,
      direction: "out",
      kind: "text",
      body: data.body,
      wa_message_id: result.wa_message_id ?? null,
      sender_user_id: context.userId,
    });
    if (e2) throw new Error(e2.message);

    // Update conversation timestamps (use admin to also set first_response_at if needed)
    await supabaseAdmin
      .from("wa_conversations")
      .update({
        last_message_at: new Date().toISOString(),
        first_response_at: conv.first_response_at ?? new Date().toISOString(),
        assigned_to: conv.assigned_to ?? context.userId,
        status: conv.status === "resolved" ? "assigned" : conv.status === "bot" || conv.status === "queued" ? "assigned" : conv.status,
        unread_count: 0,
      })
      .eq("id", conv.id);

    return { ok: true };
  });

export const markRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    await context.supabase.from("wa_conversations").update({ unread_count: 0 }).eq("id", data.id);
    return { ok: true };
  });

// ---- Metrics ----
export const getInboxMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.supabase, context.userId);
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);

    const [{ data: all }, { data: queued }, { data: assigned }, { data: agents }] = await Promise.all([
      context.supabase.from("wa_conversations").select("id, status, assigned_to, last_message_at, first_response_at, resolved_at, created_at"),
      context.supabase.from("wa_conversations").select("id").eq("status", "queued"),
      context.supabase.from("wa_conversations").select("id").eq("status", "assigned"),
      context.supabase.from("wa_agents").select("user_id, display_name").eq("active", true),
    ]);

    const rows = all ?? [];
    const today = rows.filter((r) => new Date(r.created_at) >= todayStart).length;
    const resolved7d = rows.filter((r) => r.resolved_at && new Date(r.resolved_at) >= new Date(since));
    const ttFr = rows
      .map((r) => (r.first_response_at && r.created_at ? new Date(r.first_response_at).getTime() - new Date(r.created_at).getTime() : null))
      .filter((v): v is number => v !== null && v > 0);
    const avgFirstResponseSec = ttFr.length ? Math.round(ttFr.reduce((a, b) => a + b, 0) / ttFr.length / 1000) : 0;

    // per-agent
    const byAgent = new Map<string, { handled: number; resolved: number; display_name: string }>();
    for (const a of agents ?? []) byAgent.set(a.user_id as string, { handled: 0, resolved: 0, display_name: a.display_name as string });
    for (const r of rows) {
      if (!r.assigned_to) continue;
      const entry = byAgent.get(r.assigned_to as string) ?? { handled: 0, resolved: 0, display_name: "—" };
      entry.handled += 1;
      if (r.resolved_at) entry.resolved += 1;
      byAgent.set(r.assigned_to as string, entry);
    }

    // resolved per day (last 7d)
    const days: { day: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
      const next = new Date(d); next.setDate(next.getDate() + 1);
      const c = (resolved7d ?? []).filter((r) => r.resolved_at && new Date(r.resolved_at) >= d && new Date(r.resolved_at) < next).length;
      days.push({ day: d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit" }), count: c });
    }

    return {
      today,
      queued: (queued ?? []).length,
      assigned: (assigned ?? []).length,
      resolved7d: (resolved7d ?? []).length,
      avgFirstResponseSec,
      byAgent: Array.from(byAgent.entries()).map(([user_id, v]) => ({ user_id, ...v })),
      resolvedByDay: days,
    };
  });

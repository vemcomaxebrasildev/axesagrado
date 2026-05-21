// Telemetria: audit log, system logs e page views.
// Funções tolerantes a falha — nunca quebram a UX se o insert falhar.
import { supabase } from "@/integrations/supabase/client";

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "publish"
  | "unpublish"
  | "login"
  | "logout"
  | "other";

export async function recordAudit(params: {
  action: AuditAction | string;
  entityType: string;
  entityId?: string | null;
  diff?: Record<string, unknown> | null;
}) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    await supabase.from("audit_log").insert({
      actor_id: user?.id ?? null,
      actor_email: user?.email ?? null,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId ?? null,
      diff: params.diff ?? null,
    });
  } catch (err) {
    // silencioso — telemetria não pode derrubar a UI
    console.warn("[audit] insert failed", err);
  }
}

export async function recordSystemLog(params: {
  level?: "info" | "warn" | "error";
  source?: string;
  message: string;
  context?: Record<string, unknown> | null;
}) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    await supabase.from("system_logs").insert({
      level: params.level ?? "info",
      source: params.source ?? "client",
      message: params.message,
      context: params.context ?? null,
      user_id: userData.user?.id ?? null,
    });
  } catch (err) {
    console.warn("[system_logs] insert failed", err);
  }
}

export async function recordPageView(path: string) {
  try {
    if (path.startsWith("/admin")) return; // não monitora admin
    await supabase.from("page_views").insert({
      path,
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
      user_agent:
        typeof navigator !== "undefined" ? navigator.userAgent || null : null,
    });
  } catch (err) {
    console.warn("[page_views] insert failed", err);
  }
}

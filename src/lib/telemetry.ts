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
    // Escrita via função controlada no servidor: o ator é derivado do token,
    // nunca enviado pelo cliente (evita forjar trilha de auditoria).
    await supabase.rpc("log_audit", {
      p_action: params.action,
      p_entity_type: params.entityType,
      p_entity_id: params.entityId ?? undefined,
      p_diff: (params.diff ?? null) as never,
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
    await supabase.rpc("log_system_event", {
      p_level: params.level ?? "info",
      p_source: params.source ?? "client",
      p_message: params.message,
      p_context: (params.context ?? null) as never,
    });
  } catch (err) {
    console.warn("[system_logs] insert failed", err);
  }
}

export async function recordPageView(path: string) {
  try {
    if (path.startsWith("/admin")) return; // não monitora admin
    await supabase.rpc("log_page_view", {
      p_path: path,
      p_referrer: typeof document !== "undefined" ? document.referrer || undefined : undefined,
    });
  } catch (err) {
    console.warn("[page_views] insert failed", err);
  }
}

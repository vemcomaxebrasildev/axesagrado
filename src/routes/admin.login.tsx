import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, Mail, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { login, isAuthed, isAdmin, loading } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthed && isAdmin) {
      navigate({ to: "/admin" });
    }
  }, [loading, isAuthed, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await login(email, password);
    if (!res.ok) {
      setSubmitting(false);
      setError(res.error ?? "Falha no login");
      return;
    }
    // verify admin role explicitly so we can redirect immediately
    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData.session?.user.id;
    if (!uid) {
      setSubmitting(false);
      setError("Sessão não encontrada.");
      return;
    }
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid)
      .eq("role", "admin")
      .maybeSingle();
    setSubmitting(false);
    if (!roleData) {
      await supabase.auth.signOut();
      setError("Esta conta não tem permissão de administrador.");
      return;
    }
    toast.success("Bem-vindo!", { description: "Acesso liberado." });
    navigate({ to: "/admin" });
  };

  return (
    <div className="grid min-h-screen place-items-center bg-muted/30 px-6">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-foreground text-background">
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-semibold">Vem com Axé · Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">Entre para gerenciar o site</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          )}

          <label className="block">
            <span className="mb-1.5 block text-[11px] uppercase tracking-[0.16em] text-muted-foreground">E-mail</span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-foreground focus:ring-2 focus:ring-foreground/10"
                placeholder="seu@email.com" />
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Senha</span>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-foreground focus:ring-2 focus:ring-foreground/10"
                placeholder="••••" />
            </div>
          </label>

          <button type="submit" disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-3 text-sm font-medium text-background transition hover:bg-primary disabled:opacity-60">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Entrar
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">Acesso restrito · uso interno</p>
      </div>
    </div>
  );
}

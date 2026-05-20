import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, Lock, User, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

type Search = { redirect?: string };

export const Route = (createFileRoute as any)("/login")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: (search.redirect as any) ?? "/minha-conta" });
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: window.location.origin + "/minha-conta",
          },
        });
        if (error) throw error;
        toast.success("Conta criada!", { description: "Confirme seu e-mail para entrar." });
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        toast.success("Bem-vindo(a)!");
        navigate({ to: (search.redirect as any) ?? "/minha-conta" });
      }
    } catch (err: any) {
      setError(err?.message ?? "Não foi possível concluir.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    setError(null);
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin + "/minha-conta",
    });
    if (result.error) {
      setError(result.error.message ?? `Falha ao entrar com ${provider}.`);
      return;
    }
    if (result.redirected) return;
    navigate({ to: ((search as any).redirect ?? "/minha-conta") as any });
  };

  return (
    <div className="grid min-h-[80vh] place-items-center bg-warm px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-foreground text-background">
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="mt-4 font-display text-3xl font-semibold">
            {mode === "login" ? "Entrar" : "Criar conta"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login"
              ? "Acesse seus pedidos e favoritos."
              : "Crie sua conta para acompanhar pedidos."}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="space-y-2">
            <button
              onClick={() => handleOAuth("google")}
              type="button"
              className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-border bg-background py-3 text-sm font-medium transition hover:border-foreground"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.997 10.997 0 0 0 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.997 10.997 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
              </svg>
              Continuar com Google
            </button>
            <button
              onClick={() => handleOAuth("apple")}
              type="button"
              className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-border bg-foreground py-3 text-sm font-medium text-background transition hover:opacity-90"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Continuar com Apple
            </button>
          </div>

          <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            ou
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}

            {mode === "signup" && (
              <label className="block">
                <span className="mb-1.5 block text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Nome</span>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input value={name} onChange={(e) => setName(e.target.value)} required
                    className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-foreground focus:ring-2 focus:ring-foreground/10"
                    placeholder="Seu nome" />
                </div>
              </label>
            )}

            <label className="block">
              <span className="mb-1.5 block text-[11px] uppercase tracking-[0.16em] text-muted-foreground">E-mail</span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-foreground focus:ring-2 focus:ring-foreground/10"
                  placeholder="seu@email.com" />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Senha</span>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input type="password" autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                  className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-foreground focus:ring-2 focus:ring-foreground/10"
                  placeholder="••••••" />
              </div>
            </label>

            <button type="submit" disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-3 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-60">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "login" ? "Entrar" : "Criar conta"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>Não tem conta?{" "}
                <button onClick={() => { setMode("signup"); setError(null); }} className="font-medium text-foreground underline-offset-4 hover:underline">
                  Criar agora
                </button>
              </>
            ) : (
              <>Já tem conta?{" "}
                <button onClick={() => { setMode("login"); setError(null); }} className="font-medium text-foreground underline-offset-4 hover:underline">
                  Entrar
                </button>
              </>
            )}
          </p>
        </div>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Ao continuar, você concorda com nossos termos.{" "}
          <Link to="/" className="underline-offset-4 hover:underline">Voltar à loja</Link>
        </p>
      </div>
    </div>
  );
}

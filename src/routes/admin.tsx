import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { LayoutDashboard, Package, ShoppingBag, Users, LogOut, Sparkles, Home, Star, Wallet } from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/produtos", label: "Produtos", icon: Package },
  { to: "/admin/destaques", label: "Destaques", icon: Star },
  { to: "/admin/home", label: "Home", icon: Home },
  { to: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { to: "/admin/financeiro", label: "Financeiro", icon: Wallet },
  { to: "/admin/clientes", label: "Clientes", icon: Users },
];

function AdminLayout() {
  const { isAuthed, isAdmin, loading, email, logout } = useAdminAuth();
  const navigate = useNavigate();
  const { location } = useRouterState();
  const isLoginRoute = location.pathname === "/admin/login";

  useEffect(() => {
    if (loading) return;
    if (!isAuthed && !isLoginRoute) {
      navigate({ to: "/admin/login" });
    } else if (isAuthed && !isAdmin && !isLoginRoute) {
      // signed in but no admin role
      navigate({ to: "/admin/login" });
    }
  }, [loading, isAuthed, isAdmin, isLoginRoute, navigate]);

  if (isLoginRoute) {
    return <Outlet />;
  }

  if (loading || !isAuthed || !isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-border bg-card md:block">
          <div className="flex h-16 items-center gap-2 border-b border-border px-6">
            <Sparkles className="h-5 w-5 text-primary" />
            <div>
              <p className="font-display text-sm font-semibold">Vem com Axé</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Admin
              </p>
            </div>
          </div>
          <nav className="space-y-1 p-3">
            {NAV.map((n) => {
              const active = n.exact
                ? location.pathname === n.to
                : location.pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                    active
                      ? "bg-foreground text-background"
                      : "text-foreground/70 hover:bg-muted hover:text-foreground",
                  )}
                >
                  <n.icon className="h-4 w-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="absolute bottom-0 w-64 border-t border-border p-3">
            <div className="rounded-xl bg-muted p-3">
              <p className="text-xs font-medium">{email}</p>
              <p className="text-[10px] text-muted-foreground">Administrador</p>
              <button
                onClick={() => {
                  logout();
                  navigate({ to: "/admin/login" });
                }}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background py-2 text-xs font-medium hover:bg-muted"
              >
                <LogOut className="h-3 w-3" /> Sair
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1 overflow-auto">
          <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
            <div className="flex items-center gap-3 md:hidden">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-display text-sm font-semibold">Admin</span>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <Link
                to="/"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Ver site →
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate({ to: "/admin/login" });
                }}
                className="md:hidden inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium"
              >
                <LogOut className="h-3 w-3" /> Sair
              </button>
            </div>
          </header>
          <div className="p-6 md:p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

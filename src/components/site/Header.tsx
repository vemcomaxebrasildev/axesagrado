import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { ShoppingBag, Search, Menu, X, LogIn, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/contexts/CartContext";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; visible?: boolean };

const defaultNav: NavItem[] = [
  { to: "/", label: "Início", visible: true },
  { to: "/catalogo", label: "Catálogo", visible: true },
  { to: "/conga", label: "Monte seu Congá", visible: true },
  { to: "/kits", label: "Kits Sagrados", visible: true },
  { to: "/catalogo?cat=pretos-velhos", label: "Pretos Velhos", visible: true },
  { to: "/sobre", label: "A Casa", visible: true },
  { to: "/minha-conta", label: "Meus pedidos", visible: true },
];

export function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const { location } = useRouterState();
  const { isAuthed, email, logout } = useAdminAuth();
  const navigate = useNavigate();
  const { data: navData } = useQuery({
    queryKey: ["home_content", "nav_menu"],
    queryFn: async () => {
      const { data } = await supabase.from("home_content").select("value").eq("key", "nav_menu").maybeSingle();
      return (data?.value as NavItem[] | null) ?? defaultNav;
    },
  });
  const nav = (navData ?? defaultNav).filter((n) => n.visible !== false);

  const handleLogout = async () => {
    await logout();
    toast.success("Você saiu.");
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 md:h-20 md:px-8">
        <Link to="/" className="group flex items-center">
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-semibold tracking-tight">Vem com Axé</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Casa de Umbanda
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {nav.map((n) => {
            const active = location.pathname === n.to.split("?")[0];
            return (
              <Link
                key={n.to}
                to={n.to as string}
                className={cn(
                  "text-sm font-medium text-foreground/70 transition-colors hover:text-foreground",
                  active && "text-foreground",
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <button className="hidden h-10 w-10 items-center justify-center rounded-full text-foreground/70 transition hover:bg-muted hover:text-foreground md:inline-flex">
            <Search className="h-4 w-4" />
          </button>
          {isAuthed ? (
            <>
              <Link
                to={"/minha-conta" as any}
                className="hidden h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium text-foreground/80 transition hover:border-foreground hover:text-foreground md:inline-flex"
                title={email ?? ""}
              >
                <User className="h-4 w-4" />
                <span className="max-w-[120px] truncate">{email?.split("@")[0] ?? "Conta"}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="hidden h-10 w-10 items-center justify-center rounded-full text-foreground/70 hover:bg-muted hover:text-foreground md:inline-flex"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <Link
              to={"/login" as any}
              className="hidden h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium text-foreground/80 transition hover:border-foreground hover:text-foreground md:inline-flex"
            >
              <LogIn className="h-4 w-4" />
              <span>Entrar</span>
            </Link>
          )}
          <Link
            to="/carrinho"
            className="relative inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-medium text-background transition hover:opacity-90"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Sacola</span>
            {count > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
          <button
            onClick={() => setOpen((s) => !s)}
            className="ml-1 grid h-10 w-10 place-items-center rounded-full text-foreground/70 hover:bg-muted md:hidden"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-5 py-3">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to as string}
                onClick={() => setOpen(false)}
                className="py-3 text-sm font-medium text-foreground/80"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

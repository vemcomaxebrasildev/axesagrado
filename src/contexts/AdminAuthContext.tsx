import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const ADMIN_EMAIL = "tiladeira@gmail.com";
const ADMIN_PASSWORD = "1234";
const STORAGE_KEY = "axe-admin-session-v1";

type AdminCtx = {
  isAuthed: boolean;
  email: string | null;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
};

const Ctx = createContext<AdminCtx | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setEmail(JSON.parse(raw).email);
    } catch {}
  }, []);

  const login = (e: string, p: string) => {
    if (e.trim().toLowerCase() !== ADMIN_EMAIL || p !== ADMIN_PASSWORD) {
      return { ok: false, error: "E-mail ou senha incorretos." };
    }
    const session = { email: e.trim().toLowerCase(), at: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setEmail(session.email);
    return { ok: true };
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setEmail(null);
  };

  return (
    <Ctx.Provider value={{ isAuthed: !!email, email, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAdminAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return v;
}

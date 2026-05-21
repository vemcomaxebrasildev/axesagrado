import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "vca_cookie_consent_v1";

type Consent = "accepted" | "essential" | null;

export function CookieConsent() {
  const [consent, setConsent] = useState<Consent>("accepted");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Consent;
      setConsent(stored ?? null);
    } catch {
      setConsent(null);
    }
  }, []);

  const save = (value: Exclude<Consent, null>) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // ignore
    }
    setConsent(value);
  };

  if (!mounted || consent !== null) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-6 sm:pb-6">
      <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-background/95 p-4 shadow-2xl backdrop-blur md:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
          <div className="flex items-start gap-3">
            <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary sm:flex">
              <Cookie className="h-5 w-5" />
            </div>
            <div className="text-sm leading-relaxed text-foreground">
              <strong className="font-semibold">Sua privacidade é importante.</strong>{" "}
              <span className="text-muted-foreground">
                Usamos cookies para melhorar sua experiência, lembrar do seu carrinho e analisar o
                tráfego, conforme a LGPD (Lei nº 13.709/18). Saiba mais em{" "}
                <Link to="/suporte" className="font-medium text-foreground underline underline-offset-2">
                  Suporte
                </Link>
                .
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 md:ml-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => save("essential")}
              className="text-muted-foreground hover:text-foreground"
            >
              Só essenciais
            </Button>
            <Button size="sm" onClick={() => save("accepted")}>
              Aceitar todos
            </Button>
            <button
              type="button"
              aria-label="Fechar"
              onClick={() => save("essential")}
              className="ml-1 hidden h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground sm:flex"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

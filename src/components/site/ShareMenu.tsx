import { useEffect, useRef, useState, type ReactNode } from "react";
import { Share2, Check, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ShareTarget = {
  key: "whatsapp" | "facebook" | "instagram" | "tiktok" | "copy";
  label: string;
  color: string;
  href?: (url: string, text: string) => string;
  copyOnly?: boolean;
  icon: ReactNode;
};

const TARGETS: ShareTarget[] = [
  {
    key: "whatsapp",
    label: "WhatsApp",
    color: "#25D366",
    href: (url, text) => `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
        <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.59 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l.6.953-1 3.648 3.379-.96zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01a1.1 1.1 0 0 0-.794.372c-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413z" />
      </svg>
    ),
  },
  {
    key: "facebook",
    label: "Facebook",
    color: "#1877F2",
    href: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.412c0-3.017 1.792-4.683 4.533-4.683 1.312 0 2.686.235 2.686.235v2.97h-1.514c-1.49 0-1.955.93-1.955 1.886v2.265h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
      </svg>
    ),
  },
  {
    key: "instagram",
    label: "Instagram",
    color: "#E4405F",
    copyOnly: true,
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.975.975 1.246 2.242 1.308 3.608.058 1.266.069 1.646.069 4.85s-.011 3.584-.069 4.85c-.062 1.366-.333 2.633-1.308 3.608-.975.975-2.242 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.011-4.85-.069c-1.366-.062-2.633-.333-3.608-1.308-.975-.975-1.246-2.242-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608C4.516 2.567 5.783 2.295 7.149 2.233 8.416 2.175 8.796 2.163 12 2.163zm0 1.838c-3.155 0-3.508.012-4.745.069-1.005.046-1.555.213-1.918.355-.483.187-.827.41-1.19.772-.362.363-.585.707-.772 1.19-.142.363-.309.913-.355 1.918-.057 1.237-.069 1.59-.069 4.745s.012 3.508.069 4.745c.046 1.005.213 1.555.355 1.918.187.483.41.827.772 1.19.363.362.707.585 1.19.772.363.142.913.309 1.918.355 1.237.057 1.59.069 4.745.069s3.508-.012 4.745-.069c1.005-.046 1.555-.213 1.918-.355.483-.187.827-.41 1.19-.772.362-.363.585-.707.772-1.19.142-.363.309-.913.355-1.918.057-1.237.069-1.59.069-4.745s-.012-3.508-.069-4.745c-.046-1.005-.213-1.555-.355-1.918a3.197 3.197 0 0 0-.772-1.19 3.197 3.197 0 0 0-1.19-.772c-.363-.142-.913-.309-1.918-.355C15.508 4.013 15.155 4.001 12 4.001zm0 3.131a4.866 4.866 0 1 1 0 9.732 4.866 4.866 0 0 1 0-9.732zm0 8.027a3.16 3.16 0 1 0 0-6.32 3.16 3.16 0 0 0 0 6.32zm6.193-8.231a1.137 1.137 0 1 1-2.273 0 1.137 1.137 0 0 1 2.273 0z" />
      </svg>
    ),
  },
  {
    key: "tiktok",
    label: "TikTok",
    color: "#000000",
    copyOnly: true,
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.83a8.16 8.16 0 0 0 4.77 1.52V6.93a4.85 4.85 0 0 1-1.84-.24z" />
      </svg>
    ),
  },
];

function buildUrl(slug?: string) {
  if (typeof window === "undefined") return "";
  if (!slug) return window.location.href;
  return `${window.location.origin}/produto/${slug}`;
}

export function ShareMenu({
  slug,
  title,
  variant = "compact",
  className,
}: {
  slug?: string;
  title: string;
  variant?: "compact" | "inline";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const handle = async (t: ShareTarget, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = buildUrl(slug);
    const text = `Confira: ${title}`;
    if (t.copyOnly) {
      try {
        await navigator.clipboard.writeText(`${text} — ${url}`);
        toast.success(`Link copiado para compartilhar no ${t.label}`, {
          description: "Cole no app para postar ou enviar em DM.",
        });
      } catch {
        toast.error("Não foi possível copiar o link.");
      }
      setOpen(false);
      return;
    }
    if (t.href) window.open(t.href(url, text), "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  const copyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(buildUrl(slug));
      toast.success("Link copiado!");
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
    setOpen(false);
  };

  if (variant === "inline") {
    return (
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        <span className="mr-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Compartilhar
        </span>
        {TARGETS.map((t) => (
          <button
            key={t.key}
            onClick={(e) => handle(t, e)}
            aria-label={`Compartilhar no ${t.label}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground/80 transition hover:-translate-y-0.5 hover:text-background"
            style={{ ["--brand" as string]: t.color }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = t.color)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
          >
            {t.icon}
          </button>
        ))}
        <button
          onClick={copyLink}
          aria-label="Copiar link"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground/80 transition hover:bg-foreground hover:text-background"
        >
          <LinkIcon className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((s) => !s);
        }}
        aria-label="Compartilhar"
        className="grid h-9 w-9 place-items-center rounded-full bg-background/85 text-foreground shadow-soft backdrop-blur transition hover:bg-foreground hover:text-background"
      >
        <Share2 className="h-4 w-4" />
      </button>
      {open && (
        <div
          className="absolute right-0 z-30 mt-2 w-52 overflow-hidden rounded-xl border border-border bg-card p-1 shadow-altar"
          onClick={(e) => e.stopPropagation()}
        >
          {TARGETS.map((t) => (
            <button
              key={t.key}
              onClick={(e) => handle(t, e)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground/85 transition hover:bg-muted"
            >
              <span
                className="grid h-7 w-7 place-items-center rounded-full text-white"
                style={{ backgroundColor: t.color }}
              >
                {t.icon}
              </span>
              {t.label}
              {t.copyOnly && (
                <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">
                  copiar
                </span>
              )}
            </button>
          ))}
          <div className="my-1 h-px bg-border" />
          <button
            onClick={copyLink}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground/85 transition hover:bg-muted"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-muted text-foreground">
              <Check className="h-3.5 w-3.5" />
            </span>
            Copiar link
          </button>
        </div>
      )}
    </div>
  );
}

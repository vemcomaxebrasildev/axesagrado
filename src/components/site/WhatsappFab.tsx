import { MessageCircle } from "lucide-react";

export function WhatsappFab() {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
      <span className="hidden sm:inline-flex animate-pulse items-center rounded-full bg-accent px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent-foreground shadow-altar">
        Compre pelo WhatsApp
      </span>
      <a
        href="https://wa.me/5511999990000?text=Ol%C3%A1!%20Gostaria%20de%20saber%20sobre%20um%20produto."
        target="_blank"
        rel="noreferrer"
        aria-label="Compre pelo WhatsApp"
        className="relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-altar transition hover:scale-105"
      >
        <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-accent/40" />
        <MessageCircle className="h-6 w-6" />
      </a>
    </div>
  );
}

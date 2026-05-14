import { MessageCircle } from "lucide-react";

export function WhatsappFab() {
  return (
    <a
      href="https://wa.me/5511999990000?text=Ol%C3%A1!%20Gostaria%20de%20saber%20sobre%20um%20produto."
      target="_blank"
      rel="noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-6 right-6 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-altar transition hover:scale-105"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}

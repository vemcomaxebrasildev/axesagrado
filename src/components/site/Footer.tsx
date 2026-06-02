import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Youtube } from "lucide-react";
import { useBranding } from "@/hooks/useBranding";

export function Footer() {
  const { settings } = useBranding();
  const { brand, contact, social } = settings;

  const socials = [
    { icon: Instagram, url: social.instagram },
    { icon: Facebook, url: social.facebook },
    { icon: Youtube, url: social.youtube },
  ].filter((s) => s.url);

  return (
    <footer className="mt-24 border-t border-border/60 bg-foreground text-background">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-4 md:px-8">
        <div className="md:col-span-2">
          <div className="font-display text-2xl font-semibold">{brand.name}</div>
          <p className="mt-3 max-w-md text-pretty text-sm leading-relaxed text-background/70">
            {brand.tagline}
          </p>
          {socials.length > 0 && (
            <div className="mt-6 flex gap-2">
              {socials.map(({ icon: Icon, url }, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="grid h-10 w-10 place-items-center rounded-full border border-background/15 text-background/80 transition hover:bg-background hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-background/60">
            Navegar
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link to="/catalogo" className="text-background/85 hover:text-background">Catálogo</Link></li>
            <li><Link to="/sobre" className="text-background/85 hover:text-background">A Casa</Link></li>
            <li><Link to="/carrinho" className="text-background/85 hover:text-background">Sacola</Link></li>
            <li><Link to="/suporte" className="text-background/85 hover:text-background">Suporte & Trocas</Link></li>
            <li><Link to="/admin/login" className="text-background/85 hover:text-background">Admin</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-background/60">
            Atendimento
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm text-background/85">
            {contact.hours && <li>{contact.hours}</li>}
            {contact.email && <li>{contact.email}</li>}
            {contact.phone && <li>WhatsApp {contact.phone}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-background/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-5 text-xs text-background/60 md:flex-row md:items-center md:justify-between md:px-8">
          <span>© {new Date().getFullYear()} {brand.name}. Saravá!</span>
          <span>Feito com respeito às tradições afro-brasileiras.</span>
        </div>
      </div>
    </footer>
  );
}

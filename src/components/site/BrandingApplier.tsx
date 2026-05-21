import { useEffect } from "react";
import { useBranding } from "@/hooks/useBranding";

/** Injects brand colors as CSS variables and updates favicon. */
export function BrandingApplier() {
  const { settings } = useBranding();

  useEffect(() => {
    const root = document.documentElement;
    if (settings.brand.primary_color) {
      root.style.setProperty("--brand-primary", settings.brand.primary_color);
    }
    if (settings.brand.accent_color) {
      root.style.setProperty("--brand-accent", settings.brand.accent_color);
    }

    if (settings.brand.favicon_url) {
      let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = settings.brand.favicon_url;
    }

    if (settings.brand.name) {
      // Set a sensible document title fallback for client navigations
      if (!document.title || document.title === "Vem com Axé — Casa de Umbanda") {
        document.title = settings.brand.name;
      }
    }
  }, [settings]);

  return null;
}

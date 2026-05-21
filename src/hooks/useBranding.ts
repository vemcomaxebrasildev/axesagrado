import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type BrandSettings = {
  name: string;
  tagline: string;
  logo_url: string;
  favicon_url: string;
  primary_color: string;
  accent_color: string;
  font_heading: string;
  font_body: string;
};

export type ContactSettings = {
  whatsapp: string;
  phone: string;
  email: string;
  address: string;
  hours: string;
};

export type SocialSettings = {
  instagram: string;
  facebook: string;
  youtube: string;
  tiktok: string;
};

export type SeoDefaults = {
  title: string;
  description: string;
  og_image: string;
};

export type SiteSettings = {
  brand: BrandSettings;
  contact: ContactSettings;
  social: SocialSettings;
  seo_defaults: SeoDefaults;
};

const DEFAULTS: SiteSettings = {
  brand: {
    name: "Vem com Axé",
    tagline: "Casa de Umbanda",
    logo_url: "",
    favicon_url: "",
    primary_color: "#8B5A2B",
    accent_color: "#D4A24C",
    font_heading: "Playfair Display",
    font_body: "Inter",
  },
  contact: {
    whatsapp: "5511999990000",
    phone: "(11) 99999-0000",
    email: "contato@axesagrado.com.br",
    address: "",
    hours: "Seg a Sex · 10h às 18h",
  },
  social: { instagram: "", facebook: "", youtube: "", tiktok: "" },
  seo_defaults: {
    title: "Vem com Axé — Casa de Umbanda",
    description: "Imagens de Orixás, Pretos Velhos, Caboclos, guias, velas e artigos ritualísticos.",
    og_image: "",
  },
};

export function useBranding() {
  const query = useQuery({
    queryKey: ["site_settings"],
    queryFn: async (): Promise<SiteSettings> => {
      const { data } = await supabase.from("site_settings").select("key, value");
      const map: Record<string, unknown> = {};
      (data ?? []).forEach((row) => {
        map[row.key] = row.value;
      });
      return {
        brand: { ...DEFAULTS.brand, ...((map.brand as object) ?? {}) },
        contact: { ...DEFAULTS.contact, ...((map.contact as object) ?? {}) },
        social: { ...DEFAULTS.social, ...((map.social as object) ?? {}) },
        seo_defaults: { ...DEFAULTS.seo_defaults, ...((map.seo_defaults as object) ?? {}) },
      } as SiteSettings;
    },
    staleTime: 5 * 60 * 1000,
  });

  return { settings: query.data ?? DEFAULTS, isLoading: query.isLoading };
}

export const DEFAULT_SETTINGS = DEFAULTS;

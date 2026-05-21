import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PageSection =
  | { type: "rich_text"; html: string }
  | { type: "image"; url: string; alt?: string; caption?: string }
  | { type: "cta"; title: string; subtitle?: string; button_label: string; button_url: string }
  | { type: "quote"; text: string; author?: string };

export type DynamicPage = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  hero_image: string | null;
  sections: PageSection[];
  seo_title: string | null;
  seo_description: string | null;
  seo_og_image: string | null;
  published: boolean;
};

export function usePage(slug: string) {
  return useQuery({
    queryKey: ["page", slug],
    queryFn: async (): Promise<DynamicPage | null> => {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return { ...data, sections: (data.sections as unknown as PageSection[]) ?? [] };
    },
  });
}

export function PageSections({ sections }: { sections: PageSection[] }) {
  return (
    <div className="space-y-10">
      {sections.map((s, i) => {
        if (s.type === "rich_text") {
          return (
            <div
              key={i}
              className="prose prose-neutral max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-foreground/85 prose-li:text-foreground/85 prose-a:text-primary"
              dangerouslySetInnerHTML={{ __html: s.html }}
            />
          );
        }
        if (s.type === "image") {
          return (
            <figure key={i} className="overflow-hidden rounded-2xl">
              <img src={s.url} alt={s.alt ?? ""} className="w-full" />
              {s.caption && (
                <figcaption className="mt-2 text-center text-sm text-muted-foreground">{s.caption}</figcaption>
              )}
            </figure>
          );
        }
        if (s.type === "quote") {
          return (
            <blockquote key={i} className="border-l-4 border-primary pl-6 italic text-foreground/85">
              <p>"{s.text}"</p>
              {s.author && <footer className="mt-2 text-sm not-italic text-muted-foreground">— {s.author}</footer>}
            </blockquote>
          );
        }
        if (s.type === "cta") {
          return (
            <div key={i} className="rounded-2xl border border-border bg-muted/40 p-8 text-center">
              <h3 className="font-display text-2xl font-semibold">{s.title}</h3>
              {s.subtitle && <p className="mt-2 text-muted-foreground">{s.subtitle}</p>}
              <a
                href={s.button_url}
                className="mt-5 inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                {s.button_label}
              </a>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

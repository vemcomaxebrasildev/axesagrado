-- Home content key-value store
CREATE TABLE public.home_content (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.home_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can view home_content" ON public.home_content FOR SELECT USING (true);
CREATE POLICY "admins insert home_content" ON public.home_content FOR INSERT WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update home_content" ON public.home_content FOR UPDATE USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete home_content" ON public.home_content FOR DELETE USING (private.has_role(auth.uid(), 'admin'));

CREATE TRIGGER touch_home_content BEFORE UPDATE ON public.home_content
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed defaults
INSERT INTO public.home_content (key, value) VALUES
('conga_banner', '{
  "enabled": true,
  "image": "",
  "badge": "Exclusivo Axé Sagrado",
  "title_prefix": "Monte seu Congá",
  "title_emphasis": "personalizado",
  "title_suffix": ".",
  "description": "Escolha entre Congás de 7, 14 ou 21 imagens e crie um altar único com as entidades que te acompanham.",
  "cta_label": "Montar meu Congá",
  "cta_href": "/conga"
}'::jsonb),
('hero', '{
  "enabled": true,
  "badge": "Coleção 2026 · Saravá",
  "title_prefix": "O sagrado",
  "title_emphasis": "vive",
  "title_suffix": "no detalhe das mãos.",
  "description": "Imagens, guias e artigos ritualísticos esculpidos por artesãos brasileiros para fortalecer o seu axé e honrar a sua casa de Umbanda.",
  "image": "",
  "primary_cta_label": "Explorar o catálogo",
  "primary_cta_href": "/catalogo",
  "secondary_cta_label": "Ver Orixás",
  "editorial_caption": "Editorial · Pretos Velhos",
  "editorial_quote": "Que a sabedoria dos mais velhos guie nossos caminhos.",
  "stats": [
    {"k":"Peças","v":"120+"},
    {"k":"Artesãos","v":"18"},
    {"k":"Avaliação","v":"4,9★"}
  ]
}'::jsonb);

-- Testimonials
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote TEXT NOT NULL,
  author TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can view testimonials" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "admins insert testimonials" ON public.testimonials FOR INSERT WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update testimonials" ON public.testimonials FOR UPDATE USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete testimonials" ON public.testimonials FOR DELETE USING (private.has_role(auth.uid(), 'admin'));

CREATE TRIGGER touch_testimonials BEFORE UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.testimonials (quote, author, position) VALUES
('A imagem da Mamãe Oxum chegou impecável. Senti o axé desde a embalagem.', 'Mãe Cristina · Terreiro Filhos d''Oxalá', 0),
('Atendimento humano e produto de qualidade. Recomendo a todos os irmãos.', 'Pai Marcos · Tenda de Umbanda', 1),
('A guia das 7 linhas é uma obra de arte. Já encomendei outras três.', 'Luana M. · Médium', 2);

-- Featured products
ALTER TABLE public.products
  ADD COLUMN featured BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN featured_position INTEGER NOT NULL DEFAULT 0;

CREATE INDEX idx_products_featured ON public.products (featured, featured_position) WHERE featured = true;
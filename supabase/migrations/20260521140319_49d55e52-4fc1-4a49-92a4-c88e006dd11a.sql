
-- =========================================
-- site_settings (key/value JSON)
-- =========================================
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can view site_settings"
  ON public.site_settings FOR SELECT USING (true);

CREATE POLICY "admins insert site_settings"
  ON public.site_settings FOR INSERT
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins update site_settings"
  ON public.site_settings FOR UPDATE
  USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins delete site_settings"
  ON public.site_settings FOR DELETE
  USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER touch_site_settings
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================================
-- pages (dynamic content pages)
-- =========================================
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  hero_image TEXT,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  seo_title TEXT,
  seo_description TEXT,
  seo_og_image TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can view published pages"
  ON public.pages FOR SELECT
  USING (published = true OR private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins insert pages"
  ON public.pages FOR INSERT
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins update pages"
  ON public.pages FOR UPDATE
  USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins delete pages"
  ON public.pages FOR DELETE
  USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER touch_pages
  BEFORE UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================================
-- audit_log
-- =========================================
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  actor_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  diff JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_created_at ON public.audit_log (created_at DESC);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins view audit_log"
  ON public.audit_log FOR SELECT
  USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "authenticated insert audit_log"
  ON public.audit_log FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- =========================================
-- system_logs
-- =========================================
CREATE TABLE public.system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL DEFAULT 'info',
  source TEXT NOT NULL DEFAULT 'server',
  message TEXT NOT NULL,
  context JSONB,
  user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_system_logs_created_at ON public.system_logs (created_at DESC);
CREATE INDEX idx_system_logs_level ON public.system_logs (level);

ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins view system_logs"
  ON public.system_logs FOR SELECT
  USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "anyone insert system_logs"
  ON public.system_logs FOR INSERT
  WITH CHECK (true);

-- =========================================
-- page_views
-- =========================================
CREATE TABLE public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_page_views_created_at ON public.page_views (created_at DESC);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins view page_views"
  ON public.page_views FOR SELECT
  USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "anyone insert page_views"
  ON public.page_views FOR INSERT
  WITH CHECK (true);

-- =========================================
-- Seeds
-- =========================================

INSERT INTO public.site_settings (key, value) VALUES
  ('brand', jsonb_build_object(
    'name', 'Vem com Axé',
    'tagline', 'Casa de Umbanda',
    'logo_url', '',
    'favicon_url', '',
    'primary_color', '#8B5A2B',
    'accent_color', '#D4A24C',
    'font_heading', 'Playfair Display',
    'font_body', 'Inter'
  )),
  ('contact', jsonb_build_object(
    'whatsapp', '5511999990000',
    'phone', '(11) 99999-0000',
    'email', 'contato@axesagrado.com.br',
    'address', '',
    'hours', 'Seg a Sex · 10h às 18h'
  )),
  ('social', jsonb_build_object(
    'instagram', '',
    'facebook', '',
    'youtube', '',
    'tiktok', ''
  )),
  ('seo_defaults', jsonb_build_object(
    'title', 'Vem com Axé — Casa de Umbanda',
    'description', 'Imagens de Orixás, Pretos Velhos, Caboclos, guias, velas e artigos ritualísticos. Peças artesanais com respeito às tradições da Umbanda.',
    'og_image', ''
  ));

INSERT INTO public.pages (slug, title, subtitle, sections, seo_title, seo_description, published) VALUES
  (
    'sobre',
    'A Casa Vem com Axé',
    'Uma casa dedicada às tradições afro-brasileiras',
    '[
      {"type":"rich_text","html":"<p>A Vem com Axé nasceu do amor às tradições da Umbanda e do respeito aos saberes ancestrais. Cada peça é escolhida com cuidado, feita por artesãos brasileiros que carregam a memória dos terreiros.</p><p>Trabalhamos com imagens de Orixás, Pretos Velhos, Caboclos, guias, velas, ervas e tudo que fortalece o seu axé.</p>"}
    ]'::jsonb,
    'Sobre — Vem com Axé',
    'Conheça a Vem com Axé, casa dedicada às tradições afro-brasileiras.',
    true
  ),
  (
    'suporte',
    'Suporte ao Cliente',
    'Estamos aqui para ajudar com pedidos, dúvidas, prazos e trocas.',
    '[
      {"type":"rich_text","html":"<h2>Termos de Troca e Devolução</h2><p>Em conformidade com o Código de Defesa do Consumidor (Lei nº 8.078/90).</p><h3>1. Prazo de arrependimento</h3><p>Você tem até <strong>7 dias corridos</strong> após o recebimento para solicitar devolução sem justificativa (art. 49 CDC).</p><h3>2. Troca por defeito</h3><p>Em caso de defeito de fabricação, o prazo é de <strong>30 dias</strong> a partir do recebimento.</p><h3>3. Condições</h3><ul><li>Produto sem sinais de uso, com embalagem original.</li><li>Acompanhar nota fiscal.</li><li>Peças personalizadas ou consagradas não podem ser trocadas, salvo defeito.</li></ul><h3>4. Como solicitar</h3><ol><li>Entre em contato pelo WhatsApp ou e-mail.</li><li>Nossa equipe envia código de postagem reversa em até 2 dias úteis.</li><li>Após conferência, processamos a troca ou reembolso em até 7 dias úteis.</li></ol>"}
    ]'::jsonb,
    'Suporte ao Cliente — Vem com Axé',
    'Fale com a Vem com Axé pelo WhatsApp, telefone ou e-mail. Conheça nossos termos de troca.',
    true
  ),
  (
    'conga',
    'Monte seu Congá',
    'Monte um espaço sagrado de devoção em sua casa',
    '[{"type":"rich_text","html":"<p>O congá é o altar onde reverenciamos as entidades. Aqui você encontra orientações para montar o seu com respeito.</p>"}]'::jsonb,
    'Monte seu Congá — Vem com Axé',
    'Guia para montar seu congá em casa com respeito às tradições.',
    true
  ),
  (
    'kits',
    'Kits Sagrados',
    'Conjuntos preparados para cada momento de devoção',
    '[{"type":"rich_text","html":"<p>Conjuntos pensados para iniciar ou complementar sua jornada.</p>"}]'::jsonb,
    'Kits Sagrados — Vem com Axé',
    'Kits prontos para cada devoção e momento ritualístico.',
    true
  );

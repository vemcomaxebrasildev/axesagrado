CREATE TABLE public.admin_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins view admin_settings" ON public.admin_settings
  FOR SELECT USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins insert admin_settings" ON public.admin_settings
  FOR INSERT WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins update admin_settings" ON public.admin_settings
  FOR UPDATE USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins delete admin_settings" ON public.admin_settings
  FOR DELETE USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER touch_admin_settings_updated_at
  BEFORE UPDATE ON public.admin_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
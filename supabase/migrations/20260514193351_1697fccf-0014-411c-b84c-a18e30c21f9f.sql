
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS images text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS video text;

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-media', 'product-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public read product-media"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-media');

CREATE POLICY "admins upload product-media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-media' AND private.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins update product-media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-media' AND private.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins delete product-media"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-media' AND private.has_role(auth.uid(), 'admin'));

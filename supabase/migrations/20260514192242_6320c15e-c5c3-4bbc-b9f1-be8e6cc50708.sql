CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;

DROP POLICY IF EXISTS "admins view all order items" ON public.order_items;
CREATE POLICY "admins view all order items"
ON public.order_items
FOR SELECT
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "admins delete orders" ON public.orders;
CREATE POLICY "admins delete orders"
ON public.orders
FOR DELETE
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "admins update orders" ON public.orders;
CREATE POLICY "admins update orders"
ON public.orders
FOR UPDATE
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "admins view all orders" ON public.orders;
CREATE POLICY "admins view all orders"
ON public.orders
FOR SELECT
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "admins delete products" ON public.products;
CREATE POLICY "admins delete products"
ON public.products
FOR DELETE
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "admins insert products" ON public.products;
CREATE POLICY "admins insert products"
ON public.products
FOR INSERT
WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "admins update products" ON public.products;
CREATE POLICY "admins update products"
ON public.products
FOR UPDATE
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "admins view all profiles" ON public.profiles;
CREATE POLICY "admins view all profiles"
ON public.profiles
FOR SELECT
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "admins manage roles" ON public.user_roles;
CREATE POLICY "admins manage roles"
ON public.user_roles
FOR ALL
USING (private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "admins view all roles" ON public.user_roles;
CREATE POLICY "admins view all roles"
ON public.user_roles
FOR SELECT
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

-- Move is_wa_staff out of the exposed public schema
CREATE OR REPLACE FUNCTION private.is_wa_staff(_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT private.has_role(_uid, 'admin'::app_role)
      OR EXISTS (SELECT 1 FROM public.wa_agents WHERE user_id = _uid AND active = true);
$$;

REVOKE ALL ON FUNCTION private.is_wa_staff(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_wa_staff(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION private.is_wa_staff(uuid) TO authenticated;

-- Lock down the admin role helper: no PUBLIC/anon execute
REVOKE ALL ON FUNCTION private.has_role(uuid, app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.has_role(uuid, app_role) FROM anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, app_role) TO authenticated;

-- Recreate WhatsApp policies scoped to authenticated using the private helper
DROP POLICY IF EXISTS "staff view conversations" ON public.wa_conversations;
DROP POLICY IF EXISTS "staff update conversations" ON public.wa_conversations;
DROP POLICY IF EXISTS "staff view messages" ON public.wa_messages;
DROP POLICY IF EXISTS "staff insert messages" ON public.wa_messages;

CREATE POLICY "staff view conversations" ON public.wa_conversations
  FOR SELECT TO authenticated USING (private.is_wa_staff(auth.uid()));
CREATE POLICY "staff update conversations" ON public.wa_conversations
  FOR UPDATE TO authenticated USING (private.is_wa_staff(auth.uid()));
CREATE POLICY "staff view messages" ON public.wa_messages
  FOR SELECT TO authenticated USING (private.is_wa_staff(auth.uid()));
CREATE POLICY "staff insert messages" ON public.wa_messages
  FOR INSERT TO authenticated WITH CHECK (private.is_wa_staff(auth.uid()) AND direction = 'out');

DROP FUNCTION IF EXISTS public.is_wa_staff(uuid);

-- Ensure the trigger helper and public role helper are not callable via the API
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM anon, authenticated;
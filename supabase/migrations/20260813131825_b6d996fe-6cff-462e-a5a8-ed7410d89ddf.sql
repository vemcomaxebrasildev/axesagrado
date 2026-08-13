-- 1) Remove permissive direct-insert policies
DROP POLICY IF EXISTS "authenticated insert audit_log" ON public.audit_log;
DROP POLICY IF EXISTS "anyone insert page_views" ON public.page_views;
DROP POLICY IF EXISTS "anyone insert system_logs" ON public.system_logs;

REVOKE INSERT ON public.audit_log FROM anon, authenticated;
REVOKE INSERT ON public.page_views FROM anon, authenticated;
REVOKE INSERT ON public.system_logs FROM anon, authenticated;

-- 2) Controlled writers (SECURITY DEFINER, sanitized inputs)
CREATE OR REPLACE FUNCTION public.log_audit(
  p_action text,
  p_entity_type text,
  p_entity_id text DEFAULT NULL,
  p_diff jsonb DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  IF p_action IS NULL OR length(p_action) > 40 OR p_entity_type IS NULL OR length(p_entity_type) > 60 THEN
    RAISE EXCEPTION 'Invalid input';
  END IF;
  IF p_entity_id IS NOT NULL AND length(p_entity_id) > 100 THEN
    RAISE EXCEPTION 'Invalid input';
  END IF;
  IF p_diff IS NOT NULL AND length(p_diff::text) > 20000 THEN
    RAISE EXCEPTION 'Invalid input';
  END IF;

  INSERT INTO public.audit_log (actor_id, actor_email, action, entity_type, entity_id, diff)
  VALUES (
    v_uid,
    (SELECT email FROM auth.users WHERE id = v_uid),
    p_action,
    p_entity_type,
    p_entity_id,
    p_diff
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.log_system_event(
  p_level text,
  p_source text,
  p_message text,
  p_context jsonb DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_level IS NULL OR p_level NOT IN ('info', 'warn', 'error') THEN
    RAISE EXCEPTION 'Invalid input';
  END IF;
  IF p_message IS NULL OR length(p_message) = 0 OR length(p_message) > 2000 THEN
    RAISE EXCEPTION 'Invalid input';
  END IF;
  IF p_source IS NOT NULL AND length(p_source) > 60 THEN
    RAISE EXCEPTION 'Invalid input';
  END IF;
  IF p_context IS NOT NULL AND length(p_context::text) > 10000 THEN
    RAISE EXCEPTION 'Invalid input';
  END IF;

  INSERT INTO public.system_logs (level, source, message, context, user_id)
  VALUES (p_level, COALESCE(p_source, 'client'), p_message, p_context, auth.uid());
END;
$$;

CREATE OR REPLACE FUNCTION public.log_page_view(
  p_path text,
  p_referrer text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_path IS NULL OR length(p_path) = 0 OR length(p_path) > 300 OR p_path NOT LIKE '/%' THEN
    RAISE EXCEPTION 'Invalid input';
  END IF;

  INSERT INTO public.page_views (path, referrer, user_agent)
  VALUES (
    p_path,
    left(NULLIF(p_referrer, ''), 300),
    left(NULLIF(current_setting('request.headers', true)::json->>'user-agent', ''), 300)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.log_audit(text, text, text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.log_audit(text, text, text, jsonb) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.log_system_event(text, text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_system_event(text, text, text, jsonb) TO anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.log_page_view(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_page_view(text, text) TO anon, authenticated, service_role;

-- 3) wa_agents: staff/admin only
DROP POLICY IF EXISTS "authed view wa_agents" ON public.wa_agents;
CREATE POLICY "staff view wa_agents" ON public.wa_agents
  FOR SELECT TO authenticated
  USING (private.is_wa_staff(auth.uid()));
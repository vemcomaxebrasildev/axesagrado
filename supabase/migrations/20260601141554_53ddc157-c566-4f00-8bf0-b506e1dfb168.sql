
-- Chatbot menu nodes
CREATE TABLE public.chatbot_menu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES public.chatbot_menu(id) ON DELETE CASCADE,
  trigger TEXT NOT NULL,
  title TEXT NOT NULL,
  response_text TEXT,
  action TEXT NOT NULL DEFAULT 'reply',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.chatbot_menu TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chatbot_menu TO authenticated;
GRANT ALL ON public.chatbot_menu TO service_role;
ALTER TABLE public.chatbot_menu ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone view chatbot_menu" ON public.chatbot_menu FOR SELECT USING (true);
CREATE POLICY "admins manage chatbot_menu" ON public.chatbot_menu FOR ALL
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_chatbot_menu_updated BEFORE UPDATE ON public.chatbot_menu
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Agents
CREATE TABLE public.wa_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.wa_agents TO authenticated;
GRANT ALL ON public.wa_agents TO service_role;
ALTER TABLE public.wa_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authed view wa_agents" ON public.wa_agents FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage wa_agents" ON public.wa_agents FOR ALL
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_wa_agents_updated BEFORE UPDATE ON public.wa_agents
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Helper: is current user an agent or admin
CREATE OR REPLACE FUNCTION public.is_wa_staff(_uid UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT private.has_role(_uid, 'admin'::app_role)
      OR EXISTS (SELECT 1 FROM public.wa_agents WHERE user_id = _uid AND active = true);
$$;

-- Conversations
CREATE TABLE public.wa_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_phone TEXT NOT NULL,
  contact_name TEXT,
  status TEXT NOT NULL DEFAULT 'bot',
  assigned_to UUID,
  queue TEXT DEFAULT 'geral',
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  first_response_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  unread_count INTEGER NOT NULL DEFAULT 0,
  bot_state JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_wa_conversations_status ON public.wa_conversations(status, last_message_at DESC);
CREATE INDEX idx_wa_conversations_assigned ON public.wa_conversations(assigned_to);
CREATE UNIQUE INDEX uniq_wa_conversations_open_phone ON public.wa_conversations(contact_phone)
  WHERE status <> 'resolved';

GRANT SELECT, INSERT, UPDATE, DELETE ON public.wa_conversations TO authenticated;
GRANT ALL ON public.wa_conversations TO service_role;
ALTER TABLE public.wa_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff view conversations" ON public.wa_conversations FOR SELECT
  USING (public.is_wa_staff(auth.uid()));
CREATE POLICY "staff update conversations" ON public.wa_conversations FOR UPDATE
  USING (public.is_wa_staff(auth.uid()));
CREATE POLICY "admins delete conversations" ON public.wa_conversations FOR DELETE
  USING (private.has_role(auth.uid(), 'admin'::app_role));
-- INSERT happens via service_role from the webhook only

CREATE TRIGGER trg_wa_conv_updated BEFORE UPDATE ON public.wa_conversations
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Messages
CREATE TABLE public.wa_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.wa_conversations(id) ON DELETE CASCADE,
  direction TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'text',
  body TEXT NOT NULL,
  wa_message_id TEXT,
  sender_user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_wa_messages_conv ON public.wa_messages(conversation_id, created_at);

GRANT SELECT, INSERT ON public.wa_messages TO authenticated;
GRANT ALL ON public.wa_messages TO service_role;
ALTER TABLE public.wa_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff view messages" ON public.wa_messages FOR SELECT
  USING (public.is_wa_staff(auth.uid()));
CREATE POLICY "staff insert messages" ON public.wa_messages FOR INSERT
  WITH CHECK (public.is_wa_staff(auth.uid()) AND direction = 'out');

-- Realtime
ALTER TABLE public.wa_conversations REPLICA IDENTITY FULL;
ALTER TABLE public.wa_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wa_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wa_messages;

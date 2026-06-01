# Integração WhatsApp Business + Chatbot + Inbox

## Visão geral

Adicionar 3 módulos no admin:

1. **Configuração WhatsApp Business** (Meta Cloud API)
2. **Chatbot de menu** (1, 2, 3 — configurável)
3. **Inbox de atendimento** (múltiplos atendentes, filas, atribuição, métricas)

## Arquitetura

```text
WhatsApp Cloud API
   │  (webhook entrada)
   ▼
/api/public/whatsapp/webhook  ──► grava mensagem ──► roda chatbot
                                                       │
                                          ┌────────────┴────────────┐
                                          ▼                         ▼
                                 responde via menu        cria handoff p/ humano
                                                                    │
                                                                    ▼
                                                          Inbox admin (realtime)
                                                                    │
                                                                    ▼
                                              atendente responde ──► /api/.../send
                                                                    │
                                                                    ▼
                                                          Meta Cloud API (saída)
```

## Banco de dados

Novas tabelas (todas com RLS + GRANTs):

- `whatsapp_config` (singleton em `admin_settings.key='whatsapp'`) — phone_number_id, business_account_id, webhook_verify_token, access_token, ativo
- `chatbot_menu` — árvore de nós (id, parent_id, trigger, title, response_text, action: `reply`|`handoff`|`submenu`, position)
- `wa_conversations` — id, contact_phone, contact_name, status (`bot`|`queued`|`assigned`|`resolved`), assigned_to (uuid → auth.users), queue, last_message_at, first_response_at, resolved_at, unread_count
- `wa_messages` — id, conversation_id, direction (`in`|`out`), kind (`text`|`menu`|`system`), body, wa_message_id, sender_user_id, created_at
- `wa_agents` — user_id, display_name, active, online (presence)
- Realtime: ADD TABLE wa_conversations, wa_messages

## Server-side

`src/lib/whatsapp.functions.ts` (`createServerFn`, todas com `requireSupabaseAuth` + checagem de admin/agente):
- `getWhatsappConfig`, `saveWhatsappConfig`
- `listConversations({status, assigned_to, q})` com métricas agregadas
- `getConversation(id)` + mensagens
- `assignConversation(id, agentId)`, `resolveConversation(id)`, `transferConversation(id, agentId)`
- `sendMessage(conversationId, text)` → chama Meta Cloud API + insere em `wa_messages`
- `listChatbotMenu`, `saveChatbotNode`, `deleteChatbotNode`
- `getInboxMetrics(range)` — TMR (tempo médio de resposta), conversas/atendente, resolvidas/dia, fila atual

`src/routes/api/public/whatsapp/webhook.ts` (server route):
- `GET`: handshake `hub.challenge` (validar `hub.verify_token`)
- `POST`: receber mensagem, gravar em `wa_messages`, rodar `runChatbot()` → responder via menu ou criar handoff (`status=queued`)

`src/lib/whatsapp.server.ts` — helper `metaSend(phone, text)` (POST Graph API com `access_token`).

## Admin UI (novas rotas)

- `src/routes/admin.whatsapp.tsx` — abas: **Conexão** (config Meta, URL do webhook copiável, teste de envio), **Chatbot** (árvore de menus drag-free com tabela de nós, preview do fluxo).
- `src/routes/admin.atendimento.tsx` — Inbox:
  - sidebar com filas (Fila, Minhas, Todas, Resolvidas) e busca
  - lista de conversas (nome, último trecho, tempo de espera, badge não lidas)
  - painel direito: histórico + composer + ações (Atribuir a mim, Transferir, Resolver, Notas)
  - realtime via Supabase channels em `wa_conversations` e `wa_messages`
- `src/routes/admin.atendimento.metricas.tsx` — cards: conversas hoje, em fila, em atendimento, TMR, resolvidas/dia (gráfico); tabela por atendente (atendidas, TMR, resolvidas).

Adicionar 2 itens no menu do `admin.tsx`: **WhatsApp** e **Atendimento**.

## Segurança

- `access_token` da Meta como **secret** (`META_WA_ACCESS_TOKEN`) — solicitar via `add_secret`.
- `webhook_verify_token` gerado e exibido no admin (não secret, pode ficar no banco).
- Webhook valida assinatura `x-hub-signature-256` com `META_WA_APP_SECRET`.
- Inbox: somente admins ou usuários em `wa_agents` ativos podem ler/escrever.
- Validação Zod em todas as server fns e no webhook.

## Fora de escopo (próxima fase, se quiser)

- Templates HSM aprovados pela Meta para iniciar conversas
- Mídia (imagem/áudio/documento) — inicialmente só texto
- Múltiplos números/canais
- Integração do bot com IA

## Secrets necessários

Vou pedir ao confirmar o plano:
- `META_WA_ACCESS_TOKEN` (token permanente do System User)
- `META_WA_APP_SECRET` (para validar assinatura do webhook)

Aprovar para eu começar?

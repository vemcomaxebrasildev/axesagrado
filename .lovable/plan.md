
## Visão geral

Transformar a loja em whitelabel (todo conteúdo editável pelo admin) e adicionar um painel de saúde do sistema com logs, métricas e auditoria, integrado ao Sentry para captura de erros em produção.

---

## Parte 1 — Whitelabel & CMS

### 1.1 Banco: novas tabelas

- **`site_settings`** (key/value JSON) — identidade visual e dados globais
  - `brand` → `{ name, tagline, logo_url, favicon_url, primary_color, accent_color, font_heading, font_body }`
  - `contact` → `{ whatsapp, phone, email, address, hours }`
  - `social` → `{ instagram, facebook, youtube, tiktok }`
  - `seo_defaults` → `{ title, description, og_image }`

- **`pages`** — páginas dinâmicas (sobre, conga, kits, suporte, termos, privacidade, trocas)
  - colunas: `slug`, `title`, `subtitle`, `hero_image`, `sections` (jsonb — array de blocos), `seo_title`, `seo_description`, `seo_og_image`, `published`, `updated_at`
  - blocos suportados em `sections`: `{ type: "rich_text" | "image" | "cta" | "feature_grid" | "quote", ...campos }`

- **`audit_log`** — quem mudou o quê (preenche Parte 2.4)

RLS: leitura pública em `site_settings` e `pages` (somente `published=true`); escrita só admin.

### 1.2 Aplicação no frontend

- Provider `BrandingProvider` no `__root.tsx` carrega `site_settings` via server function e injeta cores/fontes em CSS variables (`--primary`, fonte, etc.) e nome/logo no Header/Footer.
- Páginas estáticas atuais (`sobre.tsx`, `conga.tsx`, `kits.tsx`, `suporte.tsx`) viram **renderers**: buscam `pages` por slug e renderizam os blocos.
- `head()` de cada rota lê `seo_title`/`seo_description`/`seo_og_image` da página.
- Footer, contato e WhatsApp FAB consomem `site_settings.contact` e `social`.

### 1.3 Admin

Novas telas:
- **`/admin/branding`** — nome, logo (upload no bucket `product-media`), favicon, cores (color picker), fontes, contato, redes sociais, SEO padrão.
- **`/admin/paginas`** — lista de páginas. Botão "Editar":
  - Aba **Conteúdo**: campos estruturados (título, subtítulo, hero) + construtor de blocos (rich text com tiptap, imagem, CTA, grid de features, citação) — reordenar via drag-and-drop.
  - Aba **SEO**: título, descrição, OG image.
  - Toggle publicar/despublicar.

Dependência nova: `@tiptap/react` + `@tiptap/starter-kit` para o rich text.

---

## Parte 2 — Saúde do sistema, logs e telemetria

### 2.1 Sentry (erros em produção)

- Instalar `@sentry/react`.
- Inicializar no `__root.tsx` apenas em produção, lendo `VITE_SENTRY_DSN` (publishable, fica em `.env`/code).
- Server functions: `@sentry/node` opcional na fase 2 (começo só frontend; suficiente para 90% dos casos).
- Pedir ao usuário o DSN do Sentry quando esta parte for implementada (gratuito em sentry.io).

### 2.2 Logs internos (tabela `system_logs`)

Colunas: `level` (info/warn/error), `source` (frontend/server/webhook), `message`, `context` (jsonb), `user_id`, `created_at`.

Server function `logEvent({ level, source, message, context })` grava na tabela. Usada em: falhas de pagamento, falhas de frete, erros de server functions com try/catch.

### 2.3 Painel `/admin/saude`

Quatro seções:

1. **Status do banco e APIs** — cards com último ping ao Supabase, à API de frete configurada e ao gateway de pagamento. Server function `checkSystemHealth` faz os pings sob demanda.
2. **Logs de erros recentes** — tabela paginada de `system_logs` filtrável por nível.
3. **Métricas de uso** — cards: pedidos hoje/semana/mês, ticket médio, produtos sem estoque, taxa de conversão (visitas vs pedidos — visitas via tabela `page_views` simples).
4. **Auditoria** — últimas 50 ações da `audit_log`.

### 2.4 Auditoria

- Tabela `audit_log`: `actor_id`, `actor_email`, `action` (`product.update`, `order.status_change`, `branding.update`...), `entity_type`, `entity_id`, `diff` (jsonb), `created_at`.
- Server function `recordAudit(...)` chamada em todos os mutate handlers do admin (produtos, pedidos, branding, páginas, frete).

### 2.5 Tracking de pageviews

Tabela `page_views`: `path`, `referrer`, `user_agent`, `created_at`. Hook no `__root.tsx` dispara `recordPageView` em cada navegação (não-admin). Alimenta métricas de uso.

---

## Detalhes técnicos

- Todas as escritas vão via `createServerFn` com `requireSupabaseAuth` + verificação de role admin no handler.
- `BrandingProvider` busca `site_settings` no SSR via server function pública (admin) e cacheia com React Query (`staleTime: 5min`).
- Rich text: armazena HTML sanitizado (`DOMPurify` no client antes do save).
- Upload de logo/favicon/hero: reusa bucket `product-media` (já público).
- Sentry só dispara em `import.meta.env.PROD`.

---

## Plano de entrega (3 fases)

**Fase 1 — Whitelabel base** (esta entrega)
- Migration: `site_settings`, `pages`, `audit_log`, `system_logs`, `page_views`
- `BrandingProvider` + aplicação no Header/Footer/WhatsappFab
- Admin `/admin/branding`
- Conversão de Sobre, Suporte para páginas dinâmicas + admin `/admin/paginas`
- Seed das páginas com o conteúdo atual

**Fase 2 — Saúde & telemetria**
- Admin `/admin/saude` com as 4 seções
- `recordAudit` wired em todas as mutations existentes
- `recordPageView` no root
- Sentry no frontend (pede DSN)

**Fase 3 — Refinos**
- Conga e Kits também dinâmicos
- Construtor de blocos completo (atualmente: rich text + imagem + CTA)
- Sentry no server side se necessário

---

## Confirmação

Confirma que sigo nessa ordem (Fase 1 agora, Fase 2 na próxima mensagem)? Ou prefere que eu entregue tudo de uma vez em uma mensagem maior?

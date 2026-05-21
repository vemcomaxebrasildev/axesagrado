# Guia de Deploy

Este projeto pode ser publicado de duas formas em servidor externo.

---

## Opção A — Docker (SSR completo, recomendado)

Suporta server functions, SSR, rotas dinâmicas e admin. Roda em qualquer VPS
(DigitalOcean, AWS EC2, Hetzner, Railway, Render, Fly.io etc.).

### 1. Pré-requisitos
- Docker 24+ e Docker Compose
- Conta no Lovable Cloud (Supabase) já provisionada

### 2. Configurar variáveis
```bash
cp .env.example .env
# edite .env com as chaves do projeto (veja painel Lovable Cloud)
```

### 3. Build + run
```bash
docker compose up -d --build
```
App disponível em `http://localhost:3000`.

### 4. Atrás de proxy reverso (Nginx/Caddy)
Exemplo Caddy:
```
seudominio.com {
  reverse_proxy localhost:3000
}
```

### 5. Deploy em provedores específicos
- **Railway / Render / Fly.io**: conecte o repo, eles detectam o `Dockerfile` automaticamente.
- **VPS manual**: `git pull && docker compose up -d --build`.
- **CI/CD**: faça push da imagem para um registry (GHCR, Docker Hub) e use `docker compose pull && up -d`.

---

## Opção B — Build estático (SSG)

Gera apenas HTML/CSS/JS. **Limitações:**
- Server functions (`createServerFn`) **não funcionam** — todas as chamadas precisam ir direto ao Supabase pelo cliente.
- Rotas dinâmicas (`/admin/produtos/$id`) precisam de fallback SPA.
- Auditoria e telemetria server-side precisam ser reescritas no cliente ou movidas para Edge Functions Supabase.

### 1. Build
```bash
bun install
bun run build
```
Saída em `.output/public/` (assets) — para SSG puro, use deploy com fallback SPA.

### 2. Hospedagem
- **Netlify**: arraste `.output/public/` ou conecte o repo. Adicione `_redirects`:
  ```
  /*  /index.html  200
  ```
- **Vercel**: framework preset "Other", output dir `.output/public`.
- **Cloudflare Pages**: build command `bun run build`, output `.output/public`.
- **AWS S3 + CloudFront**: upload do conteúdo, configure `index.html` como error doc.
- **GitHub Pages**: copie `.output/public/` para branch `gh-pages`.

### 3. Variáveis (build-time)
Configure no painel do provedor:
```
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_PROJECT_ID
VITE_SENTRY_DSN
```

---

## Qual escolher?

| Necessidade | Opção |
|---|---|
| Admin, server functions, SSR, SEO dinâmico | **Docker** |
| Site simples, CDN global, custo zero | **Estático** |
| Webhooks, cron, telemetria server-side | **Docker** |

Para este projeto (CMS whitelabel + admin + telemetria), recomendamos **Docker**.

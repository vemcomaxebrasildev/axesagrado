# Guia de Deploy

Saída do build (fora da Lovable): **`dist/`**
- `dist/client` → arquivos estáticos (assets)
- `dist/server/index.mjs` → servidor SSR (Node)

> Nada é gerado em `.output`. O diretório de saída está fixado em `vite.config.ts`.

---

## Hostinger (Node.js / VPS)

Configuração no painel:

| Campo | Valor |
|---|---|
| Install command | `npm install` |
| Build command | `npm run build:node` |
| Output Directory | `dist` |
| Start command | `npm start` (= `node dist/server/index.mjs`) |
| Node version | 20 ou 22 |

Variáveis de ambiente (Environment Variables):
```
NITRO_PRESET=node-server
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_PROJECT_ID=...
```

Notas:
- `NITRO_PRESET=node-server` é o que garante um servidor Node (sem ele, o build
  pode mirar Cloudflare). O `build:node` já define isso; a variável cobre painéis
  que executam `npm run build` direto.
- Se o painel só aceitar **hospedagem estática**, este projeto **não funciona**:
  o build é SSR e não gera `index.html`. Use plano com Node.js/VPS ou publique pela Lovable.
- `SUPABASE_SERVICE_ROLE_KEY` não é exportável do Lovable Cloud; recursos que
  dependem dela só funcionam na publicação pela Lovable.

---

## Hostinger via GitHub (deploy automático)

### 1. Enviar o código para o GitHub
Na Lovable: menu **+** (chat) → **GitHub** → **Connect project** → autorizar → **Create Repository**.
A partir daí todo commit na Lovable vai para o repo (e vice-versa).

### 2. Escolher o produto certo na Hostinger
| Produto | Funciona? |
|---|---|
| VPS | Sim (recomendado) |
| Cloud/Web Hosting com Node.js App | Sim |
| Hospedagem compartilhada estática (só PHP) | **Não** — o app é SSR |

### 3a. VPS + Git (sem Docker)
```bash
ssh root@SEU_IP
apt update && apt install -y git nodejs npm
npm i -g pm2
git clone https://github.com/SEU_USUARIO/SEU_REPO.git app && cd app
cp .env.example .env && nano .env      # preencher VITE_SUPABASE_*
npm install && npm run build:node
pm2 start dist/server/index.mjs --name vem-com-axe --update-env
pm2 save && pm2 startup
```
Atualizar depois de um push:
```bash
cd ~/app && git pull && npm install && npm run build:node && pm2 restart vem-com-axe
```

### 3b. VPS + Docker (a partir do repo)
```bash
git clone https://github.com/SEU_USUARIO/SEU_REPO.git app && cd app
cp .env.example .env
docker compose up -d --build
```

### 3c. Painel "Node.js App" / Deploy por Git
Aponte para o repositório e a branch `main`, e use:

| Campo | Valor |
|---|---|
| Install | `npm install` |
| Build | `npm run build:node` |
| Output Directory | `dist` |
| Start | `npm start` |
| Node | 20 ou 22 |

Variáveis: as mesmas da seção anterior (`NITRO_PRESET=node-server`, `PORT`, `HOST`, `VITE_SUPABASE_*`).

### 4. Domínio e HTTPS (VPS)
Aponte o DNS para o IP e coloque um proxy na frente da porta 3000:
```
seudominio.com {
  reverse_proxy localhost:3000
}
```
(Caddy já emite o certificado automaticamente; com Nginx use `certbot`.)

### 5. Deploy automático a cada push (opcional)
Crie `.github/workflows/deploy.yml` com um passo de SSH que roda o comando de atualização do item 3a, usando secrets `HOST`, `USERNAME`, `SSH_KEY`.

> Lembrete: o backend (banco, auth, storage) continua no Lovable Cloud — a Hostinger serve apenas o app. Recursos que exigem `SUPABASE_SERVICE_ROLE_KEY` só funcionam na publicação pela Lovable.

---


## Opção A — Docker (SSR completo, VPS)

### 1. Pré-requisitos
- Docker 24+ e Docker Compose

### 2. Configurar variáveis
```bash
cp .env.example .env
```

### 3. Build + run
```bash
docker compose up -d --build
```
App em `http://localhost:3000`.

### 4. Proxy reverso (Caddy)
```
seudominio.com {
  reverse_proxy localhost:3000
}
```

### 5. Provedores
- **Railway / Render / Fly.io**: detectam o `Dockerfile` automaticamente.
- **VPS manual**: `git pull && docker compose up -d --build`.

---

## Opção B — Sem Docker, direto no servidor

```bash
npm install
npm run build:node
PORT=3000 npm start
```
Use `pm2 start dist/server/index.mjs --name vem-com-axe` para manter no ar.

---

## Qual escolher?

| Necessidade | Opção |
|---|---|
| Admin, server functions, SSR, SEO dinâmico | **Node/Docker** |
| Zero configuração e todas as features | **Publish da Lovable** |
| Hospedagem estática pura | **Não suportado** |

## Objetivo
Substituir todos os dados mockados do painel `/admin` por persistência real no Lovable Cloud, com autenticação segura por papel (`admin`) e CRUDs completos.

## Etapas

### 1. Habilitar Lovable Cloud
Provisionar banco, autenticação e storage do projeto.

### 2. Esquema do banco (migrations)
Tabelas:
- `profiles` (id, full_name, email, phone, created_at) — espelha `auth.users`
- `user_roles` (id, user_id, role) com enum `app_role` (`admin`, `customer`) + função `has_role()` (security definer)
- `products` (id, slug, name, category, description, price, stock, image, created_at, updated_at)
- `orders` (id, user_id, customer_name, customer_email, customer_phone, total, status, address, created_at)
- `order_items` (id, order_id, product_id, product_name, quantity, unit_price)

Trigger `handle_new_user` cria profile + role `customer` automaticamente. RLS:
- `products`: SELECT público, INSERT/UPDATE/DELETE só admin
- `orders`/`order_items`: usuário vê os próprios; admin vê todos
- `profiles`: usuário vê o próprio; admin vê todos
- `user_roles`: usuário vê os próprios; admin gerencia

### 3. Seed
Inserir os produtos atuais de `src/data/products.ts` na tabela `products`.

### 4. Autenticação real
- Substituir `AdminAuthContext` (localStorage) por sessão Supabase
- Tela `/admin/login` usa `signInWithPassword`
- Layout `/admin` checa role `admin` via `has_role()` — sem role redireciona pro login
- Criar conta `tiladeira@gmail.com` / senha `1234` e atribuir role `admin` via SQL

### 5. CRUDs do painel
- **Produtos** (`/admin/produtos`): listar do BD, busca, criar/editar (dialog com formulário + upload de imagem ou URL), excluir com confirmação, alerta de estoque
- **Pedidos** (`/admin/pedidos`): listar do BD, filtros, ver detalhes (drawer com itens), alterar status (select)
- **Clientes** (`/admin/clientes`): listar de `profiles` com totais agregados de `orders`
- **Dashboard** (`/admin/index`): stats reais (vendas do mês, pedidos, clientes, ticket médio) + últimos pedidos

### 6. Checkout integrado
Atualizar `/checkout` pra gravar pedido real (`orders` + `order_items`) ao "finalizar".

### 7. Limpar mocks
Remover arrays hard-coded de `admin.*.tsx` e dados de exemplo.

## Detalhes técnicos
- Queries via `supabase` client (browser) — RLS já protege
- TanStack Query para cache e invalidação
- Formulários com `react-hook-form` + `zod`
- Toasts de sucesso/erro com `sonner`
- Imagens de produto: campo URL (storage opcional em iteração futura)

## Arquivos
**Migrations**: 1 SQL com tudo (enums, tabelas, RLS, trigger, seed)  
**Editar**: `AdminAuthContext.tsx`, `admin.tsx`, `admin.login.tsx`, `admin.index.tsx`, `admin.produtos.tsx`, `admin.pedidos.tsx`, `admin.clientes.tsx`, `checkout.tsx`  
**Criar**: `src/hooks/useAdminProducts.ts`, dialogs de produto/pedido

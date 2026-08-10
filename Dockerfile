# ---------- Build stage ----------
FROM node:22-slim AS builder
WORKDIR /app
RUN corepack enable

# Install deps
COPY package.json bun.lock* package-lock.json* ./
RUN npm install --no-audit --no-fund

# Copy source and build
COPY . .

# Build-time public env (override with --build-arg)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_PROJECT_ID
ARG VITE_SENTRY_DSN
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY \
    VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID \
    VITE_SENTRY_DSN=$VITE_SENTRY_DSN

# Node server preset -> dist/server/index.mjs + dist/client
ENV NITRO_PRESET=node-server
RUN npm run build

# ---------- Runtime stage ----------
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

# Copy build output and minimal runtime files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["node", "dist/server/index.mjs"]

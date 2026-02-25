# =====================================================
# Stage 1: Installa dependencies
#======================================================
FROM node:20-alpine AS deps
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml* .npmrc* ./

# Install deps
RUN pnpm install --frozen-lockfile


# =====================================================
# Stage 2: Build aplications
#======================================================
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=deps /app/node_modules ./node_modules

COPY . .

RUN pnpm run build


# =========================================
# Stage 3: Production image
# =========================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1

# Crea un usuario y grupo no-root para ejecutar la aplicación
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia el public folder (si existe y tiene assets estáticos)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copia todo el contenido de standalone a la raíz de /app
# Esto incluye server.js, node_modules optimizado, package.json, etc.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copia los assets estáticos generados (con hash para caching)
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Cambia al usuario no-root
USER nextjs

# Expone el puerto en el que se ejecuta la aplicación
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "server.js"]
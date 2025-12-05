# ---- Base Stage ----
FROM node:18-alpine AS base
WORKDIR /app

# ---- Dependencies Stage ----
FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
# 使用 npm ci 安裝依賴 (讀取 package-lock.json)
RUN npm ci

# ---- Builder Stage ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# 建置專案
RUN npm run build

# ---- Runner Stage ----
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
# 複製 standalone 輸出
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080
ENV PORT 8080
CMD ["node", "server.js"]

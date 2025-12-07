# ---- Base Stage ----
# 升級到 Node 20 以支援 Next.js 16+
FROM node:20-alpine AS base
WORKDIR /app

# ---- Dependencies Stage ----
FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
# 改用 npm install 以自動修復 lock file 不同步的問題
RUN npm install

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

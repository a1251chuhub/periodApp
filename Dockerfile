# Dockerfile for Next.js 14+ App Router on Google Cloud Run

# ---- Base Stage ----
# Use a specific Node.js version for reproducibility. 18-alpine is a good, small choice.
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install pnpm, a fast and efficient package manager.
# If you use npm or yarn, you can adjust this part.
RUN npm install -g pnpm

# ---- Dependencies Stage ----
# This stage is for installing dependencies. It's a separate stage to leverage Docker's layer caching.
# If your package.json/pnpm-lock.yaml don't change, this layer won't be re-built, speeding up subsequent builds.
FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# ---- Builder Stage ----
# This stage builds the Next.js application.
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables needed for the build process (if any)
# ENV NEXT_PUBLIC_SUPABASE_URL=... (Not recommended to put secrets here)
RUN pnpm build

# ---- Runner Stage ----
# This is the final, small, production-ready image.
FROM base AS runner

ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 8080
ENV PORT 8080

CMD ["node", "server.js"]
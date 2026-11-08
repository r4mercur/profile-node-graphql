# syntax=docker/dockerfile:1

# --- Stage 1: install production dependencies -------------------------------
FROM oven/bun:1 AS deps
WORKDIR /app

COPY package.json ./
RUN bun install --production

# --- Stage 2: runtime ---------------------------------------------------------
# Bun runs the TypeScript sources directly, so there is no separate build step.
FROM oven/bun:1-slim
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY package.json tsconfig.json ./
COPY src ./src

# Configuration is read from the environment, see src/config/env.ts
# (PORT, DB_*, RABBIT_*) and src/config/googleCloudStorage.ts (GCS_*).
EXPOSE 4000

USER bun
CMD ["bun", "src/index.ts"]

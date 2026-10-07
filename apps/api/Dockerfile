# ---- Build stage ----
FROM node:22-slim AS build
RUN corepack enable
WORKDIR /repo

# Copy workspace manifests first for better layer caching.
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/config/package.json packages/config/
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile=false --filter @alldocs/api...

# Copy sources and build config + api.
COPY packages/config packages/config
COPY apps/api apps/api
RUN pnpm --filter @alldocs/config build \
 && pnpm --filter @alldocs/api build \
 && pnpm --filter @alldocs/api --prod deploy /app

# ---- Runtime stage ----
FROM node:22-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app .
# config's built dist is needed at runtime; deploy brings workspace deps.
EXPOSE 4000
CMD ["node", "dist/main.js"]

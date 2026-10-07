# ---- Build stage ----
FROM node:22-slim AS build
RUN corepack enable
WORKDIR /repo

COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/config/package.json packages/config/
COPY packages/pdf-core/package.json packages/pdf-core/
COPY apps/web/package.json apps/web/
RUN pnpm install --frozen-lockfile=false --filter @alldocs/web...

COPY packages packages
COPY apps/web apps/web
RUN pnpm --filter @alldocs/config build \
 && pnpm --filter @alldocs/web build

# ---- Runtime stage ----
FROM node:22-slim AS runtime
RUN corepack enable
ENV NODE_ENV=production
WORKDIR /repo
COPY --from=build /repo /repo
EXPOSE 3000
CMD ["pnpm", "--filter", "@alldocs/web", "start"]

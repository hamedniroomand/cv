# syntax=docker/dockerfile:1

# Build stage: Playwright's image ships Chromium so the PDF step can run during the build.
FROM mcr.microsoft.com/playwright:v1.62.1-noble AS build
ENV BUN_INSTALL=/root/.bun
ENV PATH=$BUN_INSTALL/bin:$PATH
RUN curl -fsSL https://bun.sh/install | bash
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
ARG NUXT_PUBLIC_SITE_URL=http://localhost:3000
ENV NUXT_PUBLIC_SITE_URL=$NUXT_PUBLIC_SITE_URL
RUN bun run build

# Runtime stage: only the Nitro output.
FROM oven/bun:1.4-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=build /app/.output ./.output
EXPOSE 3000
USER bun
CMD ["bun", ".output/server/index.mjs"]

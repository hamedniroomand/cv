# syntax=docker/dockerfile:1

# Build stage: install dependencies and produce the Nitro output.
FROM oven/bun:1.4 AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
ARG NUXT_PUBLIC_SITE_URL=http://localhost:3000
ARG NUXT_PUBLIC_TURNSTILE_SITE_KEY=
ENV NUXT_PUBLIC_SITE_URL=$NUXT_PUBLIC_SITE_URL
ENV NUXT_PUBLIC_TURNSTILE_SITE_KEY=$NUXT_PUBLIC_TURNSTILE_SITE_KEY
RUN bun run build

# Runtime stage: only the Nitro output (the PDF ships as a static file under public/).
FROM oven/bun:1.4-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=build /app/.output ./.output
EXPOSE 3000
USER bun
CMD ["bun", ".output/server/index.mjs"]

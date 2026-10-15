FROM oven/bun:1.4.2 AS bun-runtime
FROM node:22-bookworm-slim AS build
COPY --from=bun-runtime /usr/local/bin/bun /usr/local/bin/bun
WORKDIR /app
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    PLAYWRIGHT_BROWSERS_PATH=/opt/playwright
COPY --from=build /app/node_modules ./node_modules
RUN node node_modules/playwright/cli.js install --with-deps chromium \
    && rm -rf /var/lib/apt/lists/* \
    && chmod -R a+rX /opt/playwright
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
USER node
EXPOSE 3000
CMD ["node", "dist/server.cjs"]

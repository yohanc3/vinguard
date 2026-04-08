# Build stage
FROM oven/bun:1.2-debian AS build

WORKDIR /app

# Copy dependencies
COPY bun.lock package.json ./

# Build dependencies
RUN bun install --production --verbose

# Copy source and compile
COPY . .

# Run build
RUN bun build --compile --minify --sourcemap ./src --outfile vinguard-backend --external playwright --external playwright-core
RUN bun build --compile --minify --sourcemap ./src/services/scraper/worker.ts --outfile vinguard-worker --external playwright --external playwright-core

# Our applicaiton runner - we need playwright, so we install their runner
FROM mcr.microsoft.com/playwright:v1.58.2-noble AS runner

# Remove playwright browsers we don't need
RUN rm -rf /ms-playwright/firefox-* \
           # /ms-playwright/webkit-* \
           # /ms-playwright/ffmpeg-* \
           # /ms-playwright/chromium-*

ENV NODE_ENV=production
ENV VOLUME_PATH=/app/data

WORKDIR /app

ARG BUILD_APP_PORT=3000
ENV APP_PORT=${BUILD_APP_PORT}
EXPOSE ${APP_PORT}

RUN mkdir -p /app/data && chmod 755 /app/data
RUN mkdir -p /app/data/videos /app/data/traces && chmod 755 /app/data/videos /app/data/traces

# Copy the compiled executable from the build stage
COPY --from=build /app/vinguard-backend .

COPY --from=build /app/src ./src
COPY --from=build /app/package.json .
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/node_modules ./node_modules

COPY --from=build /usr/local/bin/bun /usr/local/bin/bun

COPY start.sh .
RUN chmod +x start.sh

ENTRYPOINT ["./start.sh"]

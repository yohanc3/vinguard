# Build stage
FROM oven/bun:1.2-debian AS build

WORKDIR /app

# Create Docker volume folder and attribute permissions
RUN mkdir -p /app/data && chmod 755 /app/data

# Copy dependencies
COPY bun.lock package.json ./

# Build dependencies
RUN bun install --production --verbose

# Copy source and compile
COPY . .

# Give permissions to wrapper script for running backend and worker in same container 
RUN chmod +x start.sh

# Run build
RUN bun build --compile --minify --sourcemap ./src --outfile vinguard-backend 
RUN bun build --compile --minify --sourcemap ./src/services/scraper/worker.ts --outfile vinguard-worker 

FROM gcr.io/distroless/base-debian12:debug AS runner

ENV NODE_ENV=production

WORKDIR /app

ARG BUILD_APP_PORT=3000
ENV APP_PORT=${BUILD_APP_PORT}
EXPOSE ${APP_PORT}

# Copy over Docker volume folder 
COPY --from=build /app/data /app/data

# Copy the compiled executable from the build stage
COPY --from=build /app/vinguard-backend .
COPY --from=build /app/vinguard-worker .

COPY --from=build /app/src ./src
COPY --from=build /app/drizzle ./drizzle

# Copy wrapper script from build stage
COPY --from=build /app/start.sh ./start.sh

ENTRYPOINT ["/busybox/sh", "./start.sh"]

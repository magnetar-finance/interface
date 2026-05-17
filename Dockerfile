FROM oven/bun:latest AS base
WORKDIR /app
COPY public public/
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

FROM base AS production
WORKDIR /app
COPY . .
RUN bun run build
EXPOSE 12000
CMD ["bun", "run", "start", "-p", "12000"]

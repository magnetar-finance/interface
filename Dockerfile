FROM oven/bun:latest AS base
WORKDIR /app
COPY public public/
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

FROM base AS production
WORKDIR /app
ARG NEXT_PUBLIC_WALLET_CONNECT_ID
ARG NEXT_PUBLIC_API_URI
ARG ASSETS_REPO_SLUG
ENV NODE_ENV=production
ENV NEXT_PUBLIC_WALLET_CONNECT_ID=${NEXT_PUBLIC_WALLET_CONNECT_ID}
ENV NEXT_PUBLIC_API_URI=${NEXT_PUBLIC_API_URI}
ENV ASSETS_REPO_SLUG=${ASSETS_REPO_SLUG}
COPY . .
RUN bun run codegen:generate
RUN bun run build
EXPOSE 12000
CMD ["bun", "run", "start", "-p", "12000"]

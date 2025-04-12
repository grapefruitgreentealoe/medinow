# -- frontend Dockerfile --
FROM node:20 AS builder

ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app
COPY . .

RUN pnpm install
RUN pnpm build --filter=frontend...

EXPOSE 3000
CMD ["pnpm", "start"]

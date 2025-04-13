# -------------------------
# 1. Builder Stage
# -------------------------
FROM node:20 AS builder

ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app
COPY . .

RUN pnpm install
RUN pnpm run build --filter=backend...

# -------------------------
# 2. Runtime Stage
# -------------------------
FROM node:20 AS runner

ENV NODE_ENV=production
ENV PORT=4000

WORKDIR /app

# 빌드된 파일, 패키지 복사
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/apps/backend/package.json ./apps/backend/

# pnpm 세팅 + 프로덕션 의존성 설치
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --prod

EXPOSE 4000

CMD ["node", "apps/backend/dist/main.js"]
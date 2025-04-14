# -------------------------
# 1. Builder Stage
# -------------------------
FROM node:20 AS builder

# 작업 디렉토리
WORKDIR /app

# 전체 모노레포 복사
COPY . .

# Corepack 활성화 및 pnpm 설정
RUN corepack enable && corepack prepare pnpm@latest --activate

# 전체 의존성 설치 (개발 + 프로덕션)
RUN pnpm install

# 백엔드만 빌드
RUN pnpm run build --filter=backend

# -------------------------
# 2. Runtime Stage
# -------------------------
FROM node:20 AS runner

ENV NODE_ENV=production
ENV PORT=4000

WORKDIR /app

COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/apps/backend/.env ./.env

RUN cat .env

# Corepack 설정 및 의존성 설치 (프로덕션 전용)
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --prod

# 포트 오픈
EXPOSE 4000

# 실행
CMD ["node", "dist/main.js"]
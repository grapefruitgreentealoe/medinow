FROM node:20

WORKDIR /app

# 필요한 파일만 정확히 복사
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/frontend ./apps/frontend
COPY packages ./packages

# deps 설치
RUN corepack enable && corepack prepare pnpm@10.8.0 --activate && pnpm install --filter frontend...

# 앱 빌드
WORKDIR /app/apps/frontend
COPY apps/frontend/ ./
RUN pnpm build

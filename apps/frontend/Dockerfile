FROM node:20

WORKDIR /app

# 모노레포 전체 복사
COPY . .

# ✅ corepack 제거하고 pnpm 직접 설치 
RUN curl -fsSL https://get.pnpm.io/install.sh | sh - && \
    export PATH="$HOME/.local/share/pnpm:$PATH"

# ✅ 의존성 설치
RUN pnpm install

# ✅ 프론트엔드 빌드
RUN pnpm --filter ./apps/frontend build

# 실행 경로
WORKDIR /app/apps/frontend

CMD ["pnpm", "start"]

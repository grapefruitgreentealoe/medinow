FROM node:20

WORKDIR /app

# 전체 루트 복사 (모노레포니까 루트 package.json + pnpm-workspace.yaml 있어야 함)
COPY . .

ENV NEXT_PUBLIC_API_URL=https://medinow.co.kr/api/v1
ENV NEXT_PUBLIC_SOCKET_URL=wss://medinow.co.kr/chat

# pnpm 준비
RUN corepack enable && corepack prepare pnpm@latest --activate

# 전체 워크스페이스 의존성 설치
RUN pnpm install

# frontend만 빌드
RUN pnpm --filter ./apps/frontend build

# 실행 경로 설정
WORKDIR /app/apps/frontend
CMD ["pnpm", "start"]

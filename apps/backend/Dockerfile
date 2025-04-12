# 1. Node.js 기반 빌드 이미지 생성
FROM node:20 AS builder

# 2. 빌드 컨텍스트 설정
WORKDIR /app

# 3. 패키지 매니저 활성화 및 최신 버전 설치
RUN corepack enable && corepack prepare pnpm@latest --activate

# 4. nestjs cli 설치
RUN pnpm install -g @nestjs/cli

# 5. 빌드 컨텍스트 복사
COPY . .

# 6. 패키지 설치 및 빌드
RUN pnpm install && pnpm run build --filter=backend...

# 7. 런타임 이미지
FROM node:20 AS runner

WORKDIR /app

# 필요한 파일들 복사
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./

# 패키지 매니저 설정 및 프로덕션 의존성 설치
RUN corepack enable && corepack prepare pnpm@latest --activate && \
    pnpm install --prod

# 환경 변수 설정
ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["node", "apps/backend/dist/main.js"]
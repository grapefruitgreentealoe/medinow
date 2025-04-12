# 1. Node.js 기반 빌드 이미지 생성
FROM node:20 AS builder

# 2. PNPM 설정
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH

# 3. 패키지 매니저 활성화 및 최신 버전 설치
RUN corepack enable && corepack prepare pnpm@latest --activate

# 4. nestjs cli 설치
RUN pnpm install -g @nestjs/cli

# 5. 빌드 컨텍스트 복사
WORKDIR /app
COPY . .

# 6. 패키지 설치 및 빌드
RUN pnpm install && pnpm run build --filter=backend...

# 7. 런타임 이미지
FROM node:20 AS runner

# 8. 패키지 매니저 설정 및 프로덕션 의존성 설치
RUN corepack enable && corepack prepare pnpm@latest --activate && \
    pnpm install --prod

# 9. 환경 변수 설정
ENV NODE_ENV=production
ENV PORT=4000

# 10. 포트 노출
EXPOSE 4000

# 11. 애플리케이션 실행
CMD ["node", "apps/backend/dist/main.js"]

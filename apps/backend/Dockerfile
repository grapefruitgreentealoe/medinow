FROM node:20

# 작업 디렉토리
WORKDIR /app

# 전체 모노레포 복사
COPY . .

# Corepack 활성화 및 pnpm 설정
RUN corepack enable && corepack prepare pnpm@latest --activate

# 전체 의존성 설치 (개발 + 프로덕션)
RUN pnpm install

# 백엔드만 빌드
RUN pnpm --filter ./apps/backend run build

# 환경 변수 설정
ENV NODE_ENV=production

ENV PORT=4000

# 포트 오픈
EXPOSE 4000

# 실행
CMD ["sh", "-c", "pnpm --filter ./apps/backend run migration:run && pnpm --filter ./apps/backend run start:prod"]
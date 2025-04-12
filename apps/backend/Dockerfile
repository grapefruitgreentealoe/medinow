FROM node:20

# 글로벌 설치 경로 수동 설정
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable && corepack prepare pnpm@latest --activate

# 수동으로 디렉토리 만들기 (setup 대신)
RUN mkdir -p $PNPM_HOME && chmod -R 755 $PNPM_HOME

# Nest CLI 글로벌 설치
RUN pnpm install -g @nestjs/cli

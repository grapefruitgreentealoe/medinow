<p align="center">
  <a href="https://nestjs.com/" target="_blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS Logo" />
  </a>
</p>

<h1 align="center">MediNow - 백엔드 서버</h1>
<p align="center">
  실시간 병원 정보 제공 및 사용자 커뮤니티를 위한 NestJS 기반 웹 플랫폼
</p>

<p align="center">
  <a href="https://circleci.com/gh/삼시세코/medinow" target="_blank">
    <img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI Build">
  </a>
  <a href="https://www.npmjs.com/package/@nestjs/core" target="_blank">
    <img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version">
  </a>
  <a href="https://github.com/삼시세코/medinow/blob/main/LICENSE" target="_blank">
    <img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="License">
  </a>
</p>

---

## 프로젝트 소개

MediNow는 사용자들에게 실시간 병원 정보를 제공하고 의료 커뮤니티를 형성할 수 있는 웹 플랫폼입니다. 이 저장소는 MediNow의 백엔드 서버 코드를 포함하고 있습니다.

## 기술 스택

- **프레임워크**: [NestJS](https://nestjs.com/)
- **언어**: TypeScript
- **데이터베이스**: PostgreSQL
- **ORM**: TypeORM
- **캐싱**: Redis
- **인증**: JWT, Passport
- **API 문서화**: Swagger
- **테스트**: Jest

## 시스템 구조

```
src/
├── common/          # 공통 유틸리티, 데코레이터, 가드 등
├── config/          # 환경 설정 (DB, Redis, 앱 설정)
├── migrations/      # TypeORM 마이그레이션 파일
└── modules/         # 기능별 모듈
    ├── auth/        # 인증 관련 기능
    └── users/       # 사용자 관련 기능
```

## 설치 방법

```bash
# 의존성 설치
$ pnpm install
```

## 실행 방법

```bash
# 개발 모드
$ pnpm run start:dev

# 프로덕션 모드
$ pnpm run start:prod
```

## 테스트

```bash
# 단위 테스트
$ pnpm run test

# e2e 테스트
$ pnpm run test:e2e

# 테스트 커버리지
$ pnpm run test:cov
```

## API 문서

애플리케이션이 실행되면 Swagger 문서를 다음 URL에서 확인할 수 있습니다:
```
http://localhost:4000/docs
```

## 데이터베이스 마이그레이션

```bash
# 마이그레이션 생성
$ pnpm run migration:generate src/migrations/[마이그레이션이름]

# 마이그레이션 실행
$ pnpm run migration:run

# 마이그레이션 롤백
$ pnpm run migration:revert
```

## 환경 변수

`.env.local` 또는 `.env.production` 파일에 다음과 같은 환경 변수를 설정해야 합니다:

- `PORT`: 서버 포트 (기본값: 4000)
- `DATABASE_HOST`: 데이터베이스 호스트
- `DATABASE_PORT`: 데이터베이스 포트
- `DATABASE_USERNAME`: 데이터베이스 사용자 이름
- `DATABASE_PASSWORD`: 데이터베이스 비밀번호
- `DATABASE_NAME`: 데이터베이스 이름
- `JWT_ACCESS_SECRET`: JWT ACCESS 토큰 암호화 키
- `JWT_ACCESS_EXPIRATION_TIME`: JWT ACCESS 토큰 만료 시간
- `JWT_REFRESH_SECRET`: JWT REFRESH 토큰 암호화 키
- `JWT_REFRESH_EXPIRATION_TIME`: JWT REFRESH 토큰 만료 시간

## 라이센스

이 프로젝트는 MIT 라이센스를 따릅니다.

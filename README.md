# 🏥 Medinow (Monorepo with Turborepo)

> 실시간 병원 정보, 혼잡도 시각화, 후기 및 즐겨찾기, 실시간 채팅까지  
> `Next.js`, `NestJS`, `pnpm`, `Turborepo` 기반 실시간 의료기관 정보 플랫폼

---

## 📦 프로젝트 구조

```bash
medinow/
├── apps/
│   ├── frontend/             # Next.js 기반 프론트엔드
│   │   └── .env.local        # 로컬 개발용
│   └── backend/              # NestJS 기반 백엔드
│       └── .env.local
├── packages/
│   ├── shared/               # 실행 코드에서 사용하는 공통 타입, 상수, 이벤트
│   ├── eslint-config-custom/ # ESLint 공통 설정 패키지
│   └── tsconfig/             # TypeScript base 설정
├── scripts                   # VM에서 사용되는 배포 스크립트(실행이나 배포용X 아카이브용)
├── .env.frontend             # Docker용 프론트 env
├── .env.backend              # Docker용 백엔드 env
├── .env.frontend.template    # 프론트 env 템플릿 (Git에 포함)
├── .env.backend.template     # 백엔드 env 템플릿 (Git에 포함)
├── .env.template             # 전체 공통 샘플 (선택)
├── turbo.json                # Turborepo pipeline 설정
├── pnpm-workspace.yaml       # pnpm workspace 구성
├── .gitignore
└── package.json              # 루트 스크립트 및 의존성
```

---

## ⚙️ 실행 스크립트

루트 `package.json` 기준:

```json
"scripts": {
  "dev": "turbo run dev",
  "build": "turbo run build",
  "lint": "turbo run lint",
  "test": "turbo run test",
  "setup:env": "cp .env.frontend.template .env.frontend && cp .env.backend.template .env.backend"
}
```

---

## 🔐 환경 변수 설정

```bash
# 기본 템플릿 복사
pnpm setup:env
```

**프론트 (`.env.frontend`) 예시:**

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_KAKAO_MAP_KEY=your-kakao-key
```

**백엔드 (`.env.backend`) 예시:**

```env
JWT_SECRET=your-secret
DATABASE_URL=postgres://user:pass@localhost:5432/medinow
REDIS_URL=redis://localhost:6379
```

> `.env.frontend.template`, `.env.backend.template`는 Git에 포함  
> 실제 `.env.frontend`, `.env.backend`, `.env.local`은 Git에 무시됨

---

## 🧩 터보레포 작업 정의 (`turbo.json`)

```json
{
  "tasks": {
    "dev": { "cache": false },
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "out/**"]
    },
    "lint": { "outputs": [] },
    "test": { "outputs": [] }
  }
}
```

---

## 🧪 개발환경 통일

- ESLint + Prettier + TSConfig 통합
- 모든 앱은 `eslint-config-custom`, `tsconfig/base.json`을 확장하여 사용
- `apps/frontend`, `apps/backend` 내부에서 각각 다음처럼 작성:

```js
// .eslintrc.js
module.exports = {
  root: true,
  extends: ['eslint-config-custom'],
};
```

```json
// tsconfig.json
{
  "extends": "../../packages/tsconfig/base.json"
}
```

---

## 🧰 사용 기술 스택

| 분류      | 기술                                                 |
| --------- | ---------------------------------------------------- |
| Monorepo  | Turborepo, pnpm                                      |
| Frontend  | Next.js, Tailwind, Recoil, socket.io-client          |
| Backend   | NestJS, TypeORM, Swagger, Redis(pub/sub), PostgreSQL |
| Dev Tools | ESLint, Prettier, husky, lint-staged, GitLab CI/CD   |
| 배포      | Docker, docker-compose, GitLab SSH 배포              |

---

## 💡 배포 전략 요약

- **Docker build & push:** GitLab CI에서 실행
- **VM SSH 자동 접속:** `deploy-*.sh` 스크립트로 실행
- **환경 변수:** GitLab `CI/CD > Variables`에 비밀키 관리
- **조건 분기:** 프론트/백엔드 변경 감지 → 빌드/배포 분리 가능 or 항상 전체 배포 가능

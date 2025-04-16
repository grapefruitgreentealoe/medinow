apps/
└── frontend/
├── app/ # Next.js App Router 루트
├── entities/ # 도메인 단위 모델 (ex: user, post, hospital 등)
├── features/ # 기능 단위 (ex: 로그인, 후기쓰기 등)
├── widgets/ # 조합된 뷰 블록들 (헤더, 카드리스트 등)
├── shared/
│ ├── ui/ # Atomic UI 컴포넌트 (Button, Input, Avatar 등)
│ ├── styles/ # tailwind, global.css, tokens 등
│ └── lib/ # 공통 유틸, API 클라이언트, socket 등
├── components/
│ └── ui/ #shadcn/ui로부터 들어오는 components
├── hooks/ # 전역에서 쓰이는 custom hook
├── public/ # 정적 파일
├── types/ # 글로벌 타입 정의
└── constants/ # 상수들

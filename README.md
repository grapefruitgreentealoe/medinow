# MediNow - 실시간 의료 정보 플랫폼

## 서비스 소개

MediNow는 사용자의 실시간 위치를 기반으로 주변 의료 시설 정보를 제공하고, 의료 종사자와 환자 간 직접적인 소통을 돕는 의료 정보 플랫폼입니다.

### 개발 동기

의료 정보 접근이 어려운 환자들과, 과중한 업무에 시달리는 의료 종사자들 사이의 간극을 줄이고자 시작된 프로젝트입니다.

환자들은 "지금, 여기서 가능한" 의료서비스를 찾기 힘들고, 응급실을 전전하다 치료가 늦어지는 문제(응급실 뺑뺑이)가 발생합니다. 의료 기관 역시 당직 인원 부족, 반복적인 응대 등의 문제로 피로도가 높습니다.

> "급하게 병원을 가야하는데 지금 운영하는지 확인할 수 있으면 좋겠어요"
>
> - 박용선(30), 서울에서 홀로 자취 중인 개발자

MediNow는 이러한 문제를 해결하기 위해 다음과 같은 기능을 제공합니다:

- **실시간 위치 기반 의료시설 필터링**: 현재 시간과 위치에 따라 운영 중인 응급실/병원을 빠르게 확인
- **혼잡도 시각화**: 병원별 혼잡도를 그래픽으로 보여주어 직관적인 선택 지원
- **실시간 채팅 및 피드백 기능**: 의료진과 환자 간 채팅, 감사 메시지 전달, 긍정 피드백 뱃지로 따뜻한 커뮤니케이션 강화

### 주요 기능

- **실시간 위치 기반 의료 시설 탐색**: 사용자 주변의 병원, 약국, 응급실을 지도에서 확인
- **카테고리 및 운영 상태 필터링**: 원하는 유형의 의료 시설만 필터링하여 조회
- **실시간 혼잡도 정보**: 응급실 병상 가용 현황 등 실시간 혼잡도 시각화
- **의료진-환자 간 실시간 채팅**: 방문 전 문의사항을 직접 의료진에게 질문
- **리뷰 시스템**: 의료 경험을 공유하고 참고할 수 있는 리뷰 플랫폼
- **즐겨찾기 기능**: 자주 이용하는 의료 시설을 즐겨찾기하여 빠르게 접근

### 사용자 유형

- **일반 사용자**: 의료 시설 정보 조회, 리뷰 작성, 의료진과 채팅
- **의료 기관 관리자**: 시설 정보 관리, 환자와 채팅, 리뷰 관리

실시간 위치 기반 의료시설 정보를 제공하고, 의료 종사자와 환자 간 소통을 돕는 의료 플랫폼

<aside>
🌐 [사이트 도메인 링크 ↗️](https://medinow.co.kr)

</aside>

🥇엘리스 부트캠프 최종 프로젝트 수상팀

> 심사평:
의료기관 위치 기반 서비스 구축을 통해 실제 사회 문제 해결에 기여하고자 했으며, 지도 및 공공 API 활용, 기관별 계정·채팅 기능 구현 등으로 서비스 완성도를 높였습니다. 체계적인 협업과 안정적인 배포 환경 구축 경험은 팀의 기술적 성장에도 크게 기여했습니다.
>


### 기여한 내용

---

### **프론트엔드 파트**

- **프로젝트 구조 설계 및 기술 스택 선정 주도**
  - Turborepo 기반 Monorepo 구조 설정
  - 프론트엔드 기술 스택 선정 및 초기 세팅 (Next.js, TailwindCSS, Jotai TanStack Query, Shadcn UI 등) [Jotai를 사용한 이유](https://www.notion.so/Next15-app-route-Jotai-tanstack-query-1e01311db2878055867aec3d5376c0af?pvs=21)
- **실시간 위치 기반 병원 조회 및 필터링 기능 개발**
  - Kakao Map API를 활용한 위치 기반 병원 마커 렌더링
  - 운영 중 여부 및 병원 카테고리(응급실, 약국, 병원 등)에 따른 실시간 필터링 기능 구현
  - 마커 클릭 시 상세 정보 모달 제공 및 병원 리스트 → 지도 위치 연동 기능 개발
- **혼잡도 시각화 및 병원 상세 인터랙션 기능 개발**
  - 병원 혼잡도(`available_beds`, 혼잡도 레벨 등)를 바탕으로 마커 색상 구분
  - 병원 상세 정보 모달에 운영시간, 위치, 즐겨찾기, 채팅 가능 여부 등 정보 표시
- **로그인 및 사용자 상태 관리**
  - JWT 쿠키 기반 사용자 인증 흐름 구축 (Next.js서버 미들웨어와 연동)
  - 사용자/관리자 권한 분기 처리, 로그인 상태 기반 페이지 router guard 구현
- SEO
  - 병원정보 링크공유 시 dynamic metadata 생성

### 인프라

- **서비스 운영 환경 및 DevOps 협업**
  - GitLab CI/CD 공통, 프론트 배포 자동화 스크립트 작성
  - VM instance Docker 기반 환경 구성
  - nginx + certbot 기반 SSL 환경 구성 및 next app reverse proxy 설정

### 프로젝트 매니징

- **협업 및 커뮤니케이션**
  - Figma를 이용하여 플로우 작업 및 소통
  - Notion 기반 Epic → Story → Task 구조화 및 팀 회고/스크럼 주도
  - 스프린트마다 테스트 분배, 이슈 트래킹, 문서화 진행

### 트러블 슈팅

---

### 1. API 호출 최적화 및 UX 개선

### 1-1. 지도 이동 시 API 호출 최적화

**문제**

- 지도 이동 시 `idle` 이벤트마다 병원 목록 API가 호출되어, 트래픽 과다 및 UX 저하가 발생함.

**해결**

- `debounce` 처리로 연속 이벤트 중복 호출 방지.
- 지도 중심 좌표 및 zoom level 변화 감지하여 실질적인 변화가 있을 때만 API 호출.

**성과**

- API 호출량 약 **60% 감소**
- UX 개선 및 서버 부하 완화

### 1-2. 즐겨찾기,리뷰삭제 기능 Optimistic Update 적용

**문제**

- 서버 응답을 기다리는 동안 UI 반영이 지연되어 사용자 반응성 저하.

**해결**

- TanStack Query 기반 **Optimistic Update** 적용
- 클릭 즉시 UI 갱신 후, 실패 시 rollback 처리

**성과**

- 체감 반응 속도 **2배 향상**
- 서버-클라이언트 상태 싱크도 안정적으로 유지됨

---

### 2. 생산성 향상 및 배포 루틴 최적화

### 2-1. GitLab CI/CD 최적화 (husky 사전 검증 + Job 분리)

**문제**

- GitLab CI에서 `lint/build/test` 전 과정을 실행하느라 빌드 시간이 지연되고, 불필요한 파이프라인 낭비 발생

**해결**

- `husky pre-push` hook을 활용하여, 로컬에서 `lint`, `build`, `test`를 사전 실행
- `.gitlab-ci.yml`을 리팩토링하여 **Docker build + 배포 Job만** 실행되도록 구성
- 변화된 부분에 따라 필요한 job만 돌게 하여 pipline 시간 감축

**성과**

- CI 파이프라인 평균 실행 시간 **40% 단축**
- 사소한 코드로 인한 파이프라인 낭비 제거

### 2-2. GitLab 파이프라인 리팩토링 전후 비교

<img width="928" alt="image" src="https://github.com/user-attachments/assets/d9b83fa8-3f49-4b18-8d69-f703159ec18c" />

> 4월 10~16일: 파이프라인 실행 약 100건 이상
>
> 개선 이후: 실행 횟수 급감 + 성공률 안정화
>
> → 효율적인 배포 루틴 정착 및 리소스 낭비 제거

---

### 3. 실시간 채팅 연결 안정화

**문제**

- 클라이언트에서 `careUnitId`만 존재하는 경우, 이미 존재하는 채팅방이 있어도 `joinRoom`이벤트가 중복 실행되어 새로운 roomId로 연결되어 중복 생성

**해결**

- 서버에서 `careUnitId` 기반 기존 room 탐색 후, 존재 시 해당 roomId 반환 (`foundRoom` / `roomCreated` 분기)
- 클라이언트는 반환된 roomId 기준으로 `joinRoom` 수행
- `socket.on` 등록 전 `socket.off`로 중복 리스너 제거하여 이벤트 충돌 방지

**성과**

- 중복 리스너를 제거하여 이벤트 충돌 방지를 통해 중복 채팅방 생성 방지, 불필요한 요청 제거

---

### 4. shadcnui/dropdown으로 구성된 컴포넌트의 unmount시, onClick 이벤트 작동안됨

**문제**

- 즐겨찾기 목록에서 즐겨찾기 해제 시 카드를 삭제하는 경우, dropdown 이 닫히지 않은 상태에서 onclick이 일어나면서 언마운트로 되며 이벤트가 붙어있던 react fiver 트리의 해당 노드가 사라지며 추적 불가.
  버블 경로 추적이 안되면서 이벤트 위임 실패. 결과적으로 이벤트의 나머지 부분이 무시되거나 전파가 안된다.

**해결**

- shadcnui의 dropdownitem의 onClick에서, onClick으로 넘어오는 핸들러를 requestAnimation으로 감싸, 다음 틱에서 실행되게 함.
- React가 DOM unmount, fiber 정리, 이벤트 위임 재설정까지 다 끝낸 "안정된 시점" 이후에 fn()이 실행됨
- React synthetic event 시스템이 다시 정상 작동 가능한 상태로 만들어줌.
  **성과**

- 즐겨찾기 카드가 삭제되고, 다른 이벤트들의 추적이 가능해짐.

### 기술 스택

---

|                   | 사용 기술                                | 설명                           |
| ----------------- | ---------------------------------------- | ------------------------------ |
| **Monorepo**      | Turborepo                                | 프론트/백엔드 통합 개발 환경   |
| **Frontend**      | Next.js, TypeScript                      | SSR 및 CSR 대응 SPA 프레임워크 |
|                   | Jotai, TanStack Query                    | 상태/캐시 관리                 |
|                   | React-Hook-Form, Zod                     | 폼 상태 및 런타임 타입 검사    |
|                   | TailwindCSS, Shadcn UI                   | 스타일링 및 UI 컴포넌트 시스템 |
|                   | socket.io-client                         | 실시간 채팅 클라이언트         |
|                   | Kakao Map API                            | 위치기반 병원 정보 시각화      |
| **Infra/DevOps**  | Docker, nginx, certbot                   | 컨테이너, SSL, 프록시 구성     |
|                   | GitLab Runner                            | 자체 호스팅 CI/CD 자동화       |
|                   | Elice Cloud                              | VM 서버 운영                   |
| **Collaboration** | GitLab, Notion, Discord, Google Calendar | 협업 및 일정 관리              |
| **Design**        | Figma                                    | UI/UX 협업 디자인 도구         |

---

# 쓰담쓰담 (SseudamSseudam)

> 쓰레기 무단 투기 예방 및 도시 환경 개선을 위한 쓰레기통 위치 정보 제공 앱

## 🌱 프로젝트 개요

**쓰담쓰담**은 실시간 위치 기반 서비스를 통해 시민들이 쉽게 쓰레기통을 찾고, 분리수거를 실천할 수 있도록 도와주는 친환경 도시 환경 개선 앱입니다.

### 🎯 주요 목표
- 쓰레기 무단 투기 예방을 통한 깨끗한 도시 환경 조성
- 사용자 참여형 쓰레기통 정보 관리 시스템 구축
- 시민 참여형 환경 개선 플랫폼 제공

### ✨ 핵심 기능
- **🗺️ 실시간 위치 기반 쓰레기통 찾기**: GPS를 활용한 주변 쓰레기통 위치 안내
- **📊 사용자 제보 기반 용량 모니터링**: 커뮤니티 사용자들이 직접 제보하는 쓰레기통 상태 정보
- **🔍 위치 검색 및 즐겨찾기**: 자주 방문하는 장소의 쓰레기통을 미리 등록하고 관리
- **👥 사용자 관리 시스템**: 간편한 로그인/회원가입으로 개인맞춤 서비스 이용
- **🏛️ 기관 연계 서비스**: 관할 기관과 협력하여 쓰레기통 증설 건의 및 처리
- **♻️ 환경 교육 콘텐츠**: 올바른 분리수거 방법과 쓰레기 배출 요령 안내
- **🏘️ 커뮤니티 기능**: 시민들이 함께 참여하는 환경 개선 신고 및 소통 공간

## 🛠️ 기술 스택

### Frontend
- **Framework**: Next.js 15.2.4 (React 19)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4.17
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: React Hook Form + Zod
- **Maps**: Kakao Map API
- **Theme**: next-themes (다크모드 지원)

### Development Tools
- **Package Manager**: pnpm
- **Linting**: ESLint
- **Deployment**: Static Export 지원
- **Build Tool**: Next.js Built-in Bundler

### UI/UX
- **Design System**: shadcn/ui 기반 커스텀 컴포넌트
- **Icons**: Lucide React
- **Animations**: Tailwind CSS Animate
- **Responsive Design**: Mobile-first 접근 방식
- **Charts**: Recharts

## 📁 프로젝트 구조

```txt
sseudamsseudam-app-dev/
├── app/                    # Next.js 13+ App Router
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx           # 메인 페이지
│   ├── loading.tsx        # 로딩 컴포넌트
│   └── globals.css        # 전역 스타일
├── components/             # 재사용 가능한 컴포넌트
│   ├── ui/                # shadcn/ui 기반 UI 컴포넌트
│   │   ├── button.tsx     # 버튼 컴포넌트
│   │   ├── card.tsx       # 카드 컴포넌트
│   │   ├── dialog.tsx     # 다이얼로그 컴포넌트
│   │   └── ...           # 기타 UI 컴포넌트들
│   ├── kakao-map.tsx      # 카카오맵 통합 컴포넌트
│   └── theme-provider.tsx # 테마 제공자
├── hooks/                  # 커스텀 React 훅
├── lib/                    # 유틸리티 함수 및 설정
├── public/                 # 정적 파일
├── styles/                 # 스타일 파일
├── components.json         # shadcn/ui 설정
├── next.config.mjs         # Next.js 설정
├── tailwind.config.ts      # Tailwind CSS 설정
├── tsconfig.json          # TypeScript 설정
└── package.json           # 프로젝트 의존성
```

## 🖥️ 화면 구성

### 메인 화면 플로우

```txt
시작 화면 (Splash) → 앱 소개 → 홈 화면 (지도) → 기능별 상세 화면
```

### 상세 화면 구성

| 번호 | 화면 이름             | 구성 요소                                        | 주요 기능                 |
| ---- | --------------------- | ------------------------------------------------ | ------------------------- |
| 1    | 시작 화면 (Splash)    | 로고, 앱 소개 한 줄, 시작하기 버튼               | 앱 진입점 및 브랜딩       |
| 2    | 앱 설명(최초 실행 시) | 앱 최초 실행 시 앱에 대한 설명 (퀵스타트 가이드) | 사용자 온보딩             |
| 3    | 홈 화면(지도)         | 사용자 기반 위치 지도 화면                       | 실시간 쓰레기통 위치 표시 |
| 4    | 검색창                | 검색, 내 위치 등록                               | 위치 검색 및 즐겨찾기     |
| 5    | 커뮤니티              | 무단 투기 신고(사진&영상 업로드)                 | 시민 참여 및 신고 기능    |
| 6    | 내 위치 등록 리스트   | 등록해둔 쓰레기통 위치 리스트                    | 개인화된 위치 관리        |
| 7    | 로그인 / 회원가입     | 회원 정보 수집                                   | 사용자 인증 및 관리       |

## 🚦 설치 및 실행

### 사전 요구사항
- Node.js 18.17 이상
- pnpm 8.0 이상
- 카카오 개발자 계정 (지도 API 키 필요)

### 설치 방법

1. **저장소 클론**

   ```bash
   git clone https://github.com/coding-pelican/sseudamsseudam-app-dev
   cd sseudamsseudam-app-dev
   ```

2. **의존성 설치**

   ```bash
   pnpm install
   ```

3. **환경 변수 설정**

   ```bash
   # .env.local 파일 생성
   cp .env.example .env.local

   # 카카오 지도 API 키 설정
   NEXT_PUBLIC_KAKAO_MAP_API_KEY=your_kakao_map_api_key
   ```

4. **개발 서버 실행**

   ```bash
   pnpm dev
   ```

5. **브라우저에서 확인**

   ```txt
   http://localhost:3000/sseudamsseudam-app-dev/
   ```

   > **참고**: 위 URL은 [next.config.mjs](./next.config.mjs)파일의 `basePath` 구성 경로를 따릅니다.

### 빌드 및 배포

```bash
# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start

# 정적 파일 배포용 빌드
pnpm deploy
```

## 🔧 개발 환경 설정

### VS Code 권장 확장 프로그램
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- TypeScript Importer
- Prettier - Code formatter
- ESLint

### 코드 스타일 가이드
- **TypeScript**: strict 모드 사용
- **컴포넌트**: 함수형 컴포넌트 + Hooks 패턴
- **스타일링**: Tailwind CSS 유틸리티 클래스
- **폴더 구조**: 기능별 모듈화

## 📱 주요 기능 상세

### 1. 실시간 지도 서비스
- 카카오맵 API 기반 인터랙티브 지도
- 사용자 현재 위치 표시
- 사용자 등록 쓰레기통 위치 마커 표시
- 커뮤니티 제보 기반 상태 정보 표시

### 2. 사용자 참여형 쓰레기통 관리
- 사용자 직접 쓰레기통 위치 등록
- 사용자 제보 기반 용량 상태 공유
- 커뮤니티 기반 정보 업데이트 시스템
- 관할 기관 자동 연계

### 3. 사용자 커뮤니티
- 무단 투기 신고 기능
- 사진/동영상 업로드
- 실시간 댓글 시스템
- 지역별 커뮤니티 분류

### 4. 환경 교육 콘텐츠
- 분리수거 가이드라인
- 쓰레기 배출 요령
- 환경 보호 팁
- 재활용 정보

## 🌟 향후 계획

### Phase 1 (현재)
- [x] 기본 UI/UX 프로토타입 완성
- [x] 카카오맵 API 연동
- [x] 반응형 디자인 구현

### Phase 2 (예정)

#### 핵심 기능 구현
- [ ] 쓰레기통 위치 등록 및 상태 공유 시스템
- [ ] 실시간 쓰레기통 정보 조회 및 검색
- [ ] 환경 개선 커뮤니티 플랫폼

#### 백엔드 인프라
- [ ] API 서버 구축 및 데이터베이스 연동
- [ ] 사용자 인증 및 권한 관리 시스템

## 🙏 Acknowledgments
- [Next.js](https://nextjs.org/) - React 프레임워크
- [shadcn/ui](https://ui.shadcn.com/) - UI 컴포넌트 라이브러리
- [Tailwind CSS](https://tailwindcss.com/) - 유틸리티 우선 CSS 프레임워크
- [Kakao Map API](https://apis.map.kakao.com/) - 지도 서비스
- [Radix UI](https://www.radix-ui.com/) - 접근성 중심 UI 컴포넌트

---

<div align="center">
  <strong>🌍 더 깨끗한 도시를 위한 첫 걸음, 쓰담쓰담과 함께하세요! 🌱</strong>
</div>

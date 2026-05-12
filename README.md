# Refresh Day Hub

회사 Refresh Day 일정 안내 및 실시간 게임 점수판 서비스입니다.

## 기능

- 참가자 관리 (등록, 수정, 삭제)
- 실시간 점수 관리 및 랭킹 표시
- 관리자 패널 - 탭 기반 UI
  - 참가자 관리 탭: 참가자 CRUD, 점수 조정
  - 일정 관리 탭: 장소별 일정 CRUD, 카카오 주소 검색
- 공개 랭킹 페이지 (/ranking)
- 일정 확인 페이지 (/schedule) - 시간별 상세 일정, 카카오맵 표시, 네비게이션 바로가기
- Firebase Firestore 실시간 동기화

## 기술 스택

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Firebase Firestore
- Kakao Map API
- Vercel 배포

## 로컬 실행 방법

1. 저장소를 클론합니다.

2. 의존성을 설치합니다:
   ```bash
   npm install
   ```

3. Firebase 프로젝트를 생성하고 Firestore를 활성화합니다.

4. Kakao Map API 키를 발급받습니다 ([카카오 개발자 센터](https://developers.kakao.com/)).

5. `.env.local` 파일을 생성하고 설정을 입력합니다:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_ADMIN_PASSWORD=admin123
   
   NEXT_PUBLIC_KAKAO_MAP_KEY=your_kakao_map_app_key
   
   NEXT_PUBLIC_EVENT_START_DATE=2026-06-11
   NEXT_PUBLIC_EVENT_END_DATE=2026-06-12
   NEXT_PUBLIC_EVENT_LOCATION_NAME=행사장 이름
   NEXT_PUBLIC_EVENT_LOCATION_LATITUDE=37.5000
   NEXT_PUBLIC_EVENT_LOCATION_LONGITUDE=127.0000
   ```

6. 개발 서버를 실행합니다:
   ```bash
   npm run dev
   ```

7. 브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다.

## Firebase 설정

1. [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트를 생성합니다.
2. Firestore Database를 활성화합니다.
3. 프로젝트 설정에서 웹 앱을 추가하고 Firebase 설정 값을 복사합니다.
4. Firestore 보안 규칙을 설정합니다 (아래 참조).

## Firestore 보안 규칙

현재 이 앱은 클라이언트에서 Firestore에 직접 쓰기를 수행하므로, MVP 테스트 환경에서는 다음 규칙을 사용합니다:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /participants/{document} {
      allow read, write: if true;
    }
    match /scoreLogs/{document} {
      allow read, write: if true;
    }
    match /schedules/{document} {
      allow read, write: if true;
    }
  }
}
```

> 이 규칙은 개발/행사용 MVP 용도입니다. 실제 운영 환경에서는 Firebase Authentication, 서버 측 관리자 검증 또는 Firebase Admin SDK 기반 API를 구현하여 쓰기 권한을 안전하게 제한해야 합니다.

## 카카오맵 API 설정

1. [카카오 개발자 센터](https://developers.kakao.com/)에서 계정을 생성합니다.
2. 새 애플리케이션을 생성합니다.
3. 앱 설정에서 **JavaScript Key**를 획득합니다.
4. `.env.local`에 다음 값을 입력합니다:
   ```
   NEXT_PUBLIC_KAKAO_MAP_KEY=JavaScript Key
   ```
5. 플랫폼 설정에서 Web을 추가하고 배포할 도메인을 등록합니다.

## 일정 관리

### 관리자 페이지에서 일정 추가

1. 관리자 페이지 `/admin`에 접속합니다. (비밀번호: 환경변수 설정값)
2. "일정 관리" 탭을 클릭합니다.
3. "일정 추가" 버튼을 클릭합니다.
4. 일정 정보를 입력합니다:
   - 제목: 오리엔테이션, 팀 빌딩 게임 등
   - 설명: 선택사항
   - 시작/종료 시간: 일정의 시작과 종료 시간
   - 장소: "검색" 버튼으로 카카오 주소 검색 API에서 장소를 검색합니다
5. "추가" 버튼을 클릭하면 Firestore에 저장됩니다.

### 공개 일정 페이지

- `/schedule` 페이지에서 사용자가 실시간으로 일정을 확인할 수 있습니다.
- 진행 중인 일정은 노란색 배경으로 강조됩니다.
- 종료된 일정은 투명도가 낮아집니다.
- 각 일정마다 시간, 제목, 설명, 장소 정보가 표시됩니다.

## 일정 페이지 설정

장소가 정해지면 `.env.local`의 다음 환경변수를 수정합니다:

```
NEXT_PUBLIC_EVENT_LOCATION_NAME=행사장 이름
NEXT_PUBLIC_EVENT_LOCATION_LATITUDE=37.5000
NEXT_PUBLIC_EVENT_LOCATION_LONGITUDE=127.0000
```

위도/경도 찾기: [네이버 지도](https://map.naver.com)에서 장소를 검색하고, URL의 좌표를 확인하세요.

## Vercel 배포

1. [Vercel](https://vercel.com)에 가입합니다.
2. 새 프로젝트를 생성하고 이 저장소를 연결합니다.
3. 환경변수를 Vercel 프로젝트 설정에 추가합니다:
   - `NEXT_PUBLIC_FIREBASE_*` (모든 Firebase 설정)
   - `NEXT_PUBLIC_KAKAO_MAP_KEY`
   - `NEXT_PUBLIC_EVENT_*` (모든 이벤트 설정)
   - `NEXT_PUBLIC_ADMIN_PASSWORD`
4. 배포합니다.

## 프로젝트 구조

```
app/
├── admin/
│   ├── AdminPanel.tsx
│   ├── ScheduleSection.tsx
│   └── page.tsx
├── components/
│   └── AddressSearchModal.tsx
├── hooks/
│   ├── useParticipants.ts
│   └── useSchedules.ts
├── lib/
│   ├── firebase.ts
│   ├── participantService.ts
│   └── scheduleService.ts
├── ranking/
│   └── page.tsx
├── schedule/
│   └── page.tsx
├── types/
│   └── index.ts
├── utils/
│   └── ranking.ts
└── page.tsx
```

## 라이선스

MIT

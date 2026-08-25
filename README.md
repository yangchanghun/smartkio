# SmartKio

스마트 키오스크 운영 플랫폼입니다. 관리자 웹은 Vercel, API와 PostgreSQL은 Docker Compose로 운영 서버에 배포하며 Android 키오스크 앱은 Expo/React Native로 빌드합니다.

## 구성

| 경로 | 역할 |
| --- | --- |
| `apps/admin-web` | Vite + React 관리자 페이지 (Vercel) |
| `apps/backend` | Django REST API (운영 서버 Docker) |
| `apps/kiosk-app` | Expo React Native Android 앱 |
| `compose.production.yml` | PostgreSQL, Django, Nginx 운영 구성 |

## 로컬 실행

```bash
cp .env.example .env.production
docker compose up --build
```

- 관리자: http://localhost:5173
- API 상태: http://localhost:8000/health/
- Django Admin: http://localhost:8000/admin/
- 초기 관리자: `admin` / `admin1234!` (운영 배포 전에 반드시 변경)

### 관리자 웹만 로컬에서 수정하며 보기

Docker Desktop이 설치되어 있다면 터미널 1에서 PostgreSQL과 API만 실행합니다.

```bash
docker compose up db backend
```

Docker가 없는 PC에서는 아래 관리자 웹 명령만 실행해도 됩니다. Vite가 운영 API로 `/api` 요청을 프록시합니다. 이 경우 프런트엔드 수정은 즉시 확인할 수 있지만, 백엔드 코드는 서버에 배포해야 반영됩니다.

터미널에서 실행합니다.

```bash
cd apps/admin-web
npm install
npm run dev
```

브라우저에서 `http://localhost:5173`을 열면 됩니다. `src/` 아래 파일을 저장할 때마다 Vite가 즉시 화면을 갱신합니다.

## Android APK

`apps/kiosk-app`에 `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_KIOSK_KEY`를 설정한 뒤 Android SDK가 있는 환경에서 실행합니다.

```bash
cd apps/kiosk-app
npx expo prebuild --platform android
cd android && ./gradlew app:assembleRelease
```

`KIOSK_API_KEY`는 API와 APK 빌드 환경에 동일하게 설정합니다. 기기별 키 관리와 실제 결제/VAN 연동은 운영 요구사항 확정 후 추가합니다.

## 운영 배포 전 준비

1. `api` 서브도메인의 DNS A 레코드를 `211.37.174.174`로 설정하고 HTTPS 인증서를 준비합니다.
2. 서버에서 저장소를 `/opt/smartkio`에 배치하고 `.env.production`을 생성합니다. 이 파일은 커밋하지 않습니다.
3. GitHub Actions secrets에 `SSH_HOST`, `SSH_PORT`, `SSH_USER`, `SSH_PRIVATE_KEY`, `SSH_KNOWN_HOSTS`를 설정합니다.
4. Vercel 프로젝트의 Root Directory를 `apps/admin-web`로 지정하고 `VITE_API_URL=https://api.<domain>`을 설정합니다.
5. API의 CORS/CSRF 허용 도메인도 관리자 도메인으로 교체합니다.

`main` 푸시는 CI와 서버 배포 워크플로를 실행합니다. Vercel은 Git 연동 배포를 권장합니다.

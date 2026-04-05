# 오션중 학생 허브 (ocean-ms-student)

비공식 학생용 Next.js 앱 — 일정·급식·과제(로컬), 익명 게시판, 실시간 채팅, 이메일 로그인·프로필, 개발자 시크릿 기반 어드민.

## 요구 사항

- Node.js 20+
- [Supabase](https://supabase.com/) 프로젝트 (무료 플랜 가능)

## 설정

1. Supabase에서 프로젝트 생성 후 **API URL**과 **anon key**를 복사합니다.
2. **SQL**: `supabase/migrations/001_initial.sql` 내용을 Supabase SQL Editor에 붙여 실행합니다.
   - 트리거 오류 시 Postgres 버전에 따라 `execute function`을 `execute procedure`로 바꿔 보세요.
3. **Authentication → URL configuration**에 Site URL과 Redirect URL에 로컬/배포 도메인을 추가합니다 (예: `http://localhost:3000/auth/callback`).
4. 개발용으로 **Email confirmations**을 끄면 가입 직후 로그인 테스트가 쉽습니다.
5. **Database → Replication**에서 `chat_messages` 테이블이 Realtime에 포함됐는지 확인합니다 (마이그레이션에 `alter publication` 포함).
6. 루트에 `.env.local` 생성:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ADMIN_SETUP_SECRET=아주-긴-비밀문장
```

`SUPABASE_SERVICE_ROLE_KEY`와 `ADMIN_SETUP_SECRET`은 **서버 전용**입니다. Git에 올리지 마세요.

## 어드민

1. 회원가입/로그인 후 `/admin/unlock`에서 `ADMIN_SETUP_SECRET` 값을 입력합니다.
2. 새로고침 후 상단 **관리** 메뉴에서 게시글 숨김/삭제가 가능합니다.

## 개발

```bash
npm install
npm run dev
```

## 배포 (Vercel)

- 동일 환경변수를 Vercel 프로젝트에 등록합니다.
- Supabase Auth에 배포 URL의 `/auth/callback`을 추가합니다.

## 급식 (NEIS 연동)

1. [공공데이터포털](https://www.data.go.kr/) 또는 [나이스 교육정보 개방 포털](https://open.neis.go.kr/)에서 **급식식단정보 API** 인증키를 발급합니다.
2. [학교기본정보 조회](https://open.neis.go.kr/hub/schoolInfo) 등으로 학교의 **시도교육청코드**(`ATPT_OFCDC_SC_CODE`), **학교코드**(`SD_SCHUL_CODE`)를 확인합니다.
3. Vercel(또는 `.env.local`)에 서버 전용 변수로 추가합니다:

```
NEIS_API_KEY=발급받은_KEY
NEIS_ATPT_OFCDC_SC_CODE=B10
NEIS_SD_SCHUL_CODE=1234567
```

선택: `NEIS_MMEAL_SC_CODE` — `1` 조식, `2` 중식(기본), `3` 석식.

4. 배포 후 `/급식` 페이지는 **서울 기준 이번 주 월~금** 중식을 NEIS에서 가져옵니다. 변수가 없거나 오류 시 `src/data/meals.json` 샘플로 대체됩니다.

## 데이터

- 학사 일정: `src/data/events.json`
- 급식(백업·미연동 시): `src/data/meals.json`

소스 파일은 **UTF-8**로 저장하세요 (`.editorconfig` 참고). 제목·푸터 한글이 깨지면 파일 인코딩을 UTF-8로 다시 저장합니다.

## 라이선스

MIT (필요 시 수정)
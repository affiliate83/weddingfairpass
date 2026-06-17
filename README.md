# Wedding Fair MVP

웨딩박람회 무료입장 DB 모집을 위한 1차 정적 MVP입니다.

## 구성

- `index.html`: 홈, 지역별 박람회 리스트, 커플 성향 테스트, 웨딩 타로, 무료 궁합 사주, 예산 계산기
- `data.js`: 박람회 데이터, 제휴 링크, 분석 ID 설정
- `app.js`: 필터, 테스트, 예산 계산, UTM/이벤트 추적
- `styles.css`: 반응형 UI
- `privacy.html`: 개인정보처리방침 초안
- `contact.html`: 문의 페이지 초안
- `robots.txt`, `sitemap.xml`: 검색엔진용 초안

## 실제 운영 전 교체할 값

`data.js`:

```js
const AFFILIATE_CONFIG = {
  affiliateUrl: "실제 웨딩박람회 제휴 링크",
  ga4Id: "G-...",
  metaPixelId: "...",
};
```

`fairs` 배열:
- 실제 박람회명
- 지역
- 일정
- 장소
- 혜택
- 승인 가능한 신청 링크

## 데이터 갱신 방법

### 현행: 리플알바 API 연동 방식 (권장)

필수 환경변수:

```text
REPLYALBA_API_ID=...
REPLYALBA_API_KEY=...
```

전체 갱신 순서:

```powershell
npm.cmd run fetch:replyalba
npm.cmd run apply:replyalba
npm.cmd run build:fairs
npm.cmd run check
npm.cmd run validate:fairs
npm.cmd run check:baseline
```

또는 한 번에:

```powershell
npm.cmd run sync:replyalba
```

`fetch:replyalba` — 리플알바 API에서 웨딩박람회 캠페인 목록을 가져와 `data/replyalba-wedding-api.json`에 저장합니다.
`apply:replyalba` — API 응답을 `data/fairs.csv`에 병합합니다.
`build:fairs` — CSV에서 `fairs.generated.js`, 지역 페이지, 상세 페이지, `sitemap.xml`, `rss.xml`을 생성합니다.
`validate:fairs` — active 행에 필수값과 제휴 링크가 있는지 검사합니다.
`check:baseline` — 생성된 페이지/sitemap/RSS 카운트가 기준선과 일치하는지 확인합니다.

### 수동: CSV 직접 편집 방식

API를 사용할 수 없을 때 `data/fairs.csv`를 직접 편집합니다.

`data/fairs.csv` 컬럼:

```csv
id,region,title,venue,date,tags,summary,badge,affiliateUrl,status
```

입력 규칙:
- `id`: 고유값. 예: `seoul-coex-20260606`
- `region`: 서울, 경기, 인천, 부산 등
- `title`: 박람회명
- `venue`: 장소
- `date`: 노출할 일정 문구
- `tags`: `웨딩홀|스드메|혼수`처럼 `|`로 구분
- `summary`: 카드 설명
- `badge`: 인기, 신규, 서울 등
- `affiliateUrl`: 리플알바 제휴 링크 또는 입력폼 링크
- `status`: `active`면 노출, `inactive`면 제외

편집 후 실행:

```powershell
npm.cmd run validate:fairs
npm.cmd run build:fairs
npm.cmd run check:baseline
```

주의:
- 리플알바 관리자 화면을 무단 스크래핑하지 않는다.
- 공식 API, export, 입력폼 퍼가기, 제휴 링크 제공 방식이 있으면 그 방식을 우선한다.
- 광고주가 공개를 제한한 단가, 승인 기준, 관리자 화면 정보는 사이트에 노출하지 않는다.
- 일정과 혜택은 실제 광고주 랜딩 기준으로 확인한 뒤 노출한다.
- 리플알바 `pt` 링크에는 UTM 파라미터를 붙이지 않는다.

`privacy.html`:
- 실제 개인정보 수집 주체
- 수집 항목
- 이용 목적
- 보유 기간
- 제3자 제공 내용

`robots.txt`, `sitemap.xml`:
- 도메인은 이미 `https://weddingfairpass.com`으로 설정됨. 재생성 시 `SITE_URL` 환경변수가 유지되는지 확인.

## 권장 퍼널

```text
Threads / Meta 광고 / 검색 유입
-> 지역별 박람회 리스트
-> 커플 성향 테스트 또는 예산 계산기
-> 무료입장 신청 CTA
-> 실제 제휴 신청폼
```

## 초기 Threads 콘텐츠

1. 결혼 준비 처음이면 웨딩홀보다 먼저 확인해야 하는 것
2. 웨딩박람회 그냥 가면 손해 보는 이유
3. 결혼 예산 계산하다가 대부분 여기서 한 번 막힙니다
4. 커플 성향 테스트 만들었는데 결과가 꽤 현실적입니다
5. 지역별 웨딩박람회 무료입장 일정을 모으는 사이트를 만들고 있습니다
6. 오늘의 웨딩 타로 결과별로 먼저 볼 박람회가 달라집니다
7. 생년월일 기반 무료 궁합 사주로 우리 커플 결혼 준비 스타일을 확인해보세요

## 현재 기준선 (2026-06-17)

| 항목 | 수 |
|---|---|
| CSV 행 | 130 |
| Active 행 | 130 |
| 지역 페이지 | 9 |
| 상세 페이지 | 112 |
| Sitemap URL | 124 |
| RSS 항목 | 112 |

기준선 확인:

```powershell
npm.cmd run check:baseline
```

## 자주 쓰는 명령

```powershell
npm.cmd run check            # 구문 검사
npm.cmd run validate:fairs   # 박람회 데이터 필수값 검사
npm.cmd run check:baseline   # 생성 파일 카운트 검사
npm.cmd run build:fairs      # 페이지/sitemap/RSS 재생성
npm.cmd run start            # 로컬 서버 (http://127.0.0.1:4173/)
npm.cmd run submit:indexnow:dry  # IndexNow 제출 dry-run
```

## 문서 및 gitignore 안내

`docs/`와 `PROJECT_HANDOFF_*.md`는 `.gitignore`에 등록되어 있어 로컬에서만 존재합니다.
git status나 배포에 포함시키려면 `.gitignore`를 수정하거나 `git add -f`로 강제 추가해야 합니다.

## 추적 이벤트

현재 `app.js`는 아래 이벤트를 콘솔과 `dataLayer`에 남깁니다.

- `page_view`
- `region_filter`
- `fair_apply`
- `quiz_answer`
- `test_complete`
- `tarot_complete`
- `saju_complete`
- `budget_change`
- `budget_cta`

GA4와 Meta Pixel을 실제로 붙일 때는 `track()` 함수 안에 `gtag()`와 `fbq()` 호출을 추가하면 됩니다.

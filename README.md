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

## 리플알바 일정 연동 방식

가장 안정적인 순서:

1. 리플알바에서 공식 API 또는 캠페인 목록 export 기능이 있는지 확인
2. 없으면 리플알바에서 진행 중인 웨딩박람회 캠페인을 CSV/구글시트로 관리
3. `data/fairs.csv`에 일정과 제휴 링크를 입력
4. `npm.cmd run build:fairs`로 `fairs.generated.js` 생성
5. 사이트에서 생성된 일정 데이터를 자동 사용

API가 늦거나 제공되지 않으면 아래 반자동 운영 방식을 사용합니다.

```text
리플알바 캠페인 상세 확인
-> data/ripplealba-campaigns-template.csv 형식으로 정리
-> npm.cmd run convert:ripplealba
-> npm.cmd run validate:fairs
-> npm.cmd run build:fairs
-> 사이트 확인
```

CSV 컬럼:

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

명령:

```bash
npm.cmd run convert:ripplealba
npm.cmd run validate:fairs
npm.cmd run build:fairs
```

`convert:ripplealba`는 리플알바 운영용 확장 CSV를 사이트 노출용 `data/fairs.csv`로 변환합니다.
`validate:fairs`는 active 상태의 박람회 데이터에 필수값과 링크가 있는지 검사합니다.

주의:
- 리플알바 관리자 화면을 무단 스크래핑하지 않는다.
- 공식 API, export, 입력폼 퍼가기, 제휴 링크 제공 방식이 있으면 그 방식을 우선한다.
- 광고주가 공개를 제한한 단가, 승인 기준, 관리자 화면 정보는 사이트에 노출하지 않는다.
- 일정과 혜택은 실제 광고주 랜딩 기준으로 확인한 뒤 노출한다.

`privacy.html`:
- 실제 개인정보 수집 주체
- 수집 항목
- 이용 목적
- 보유 기간
- 제3자 제공 내용

`robots.txt`, `sitemap.xml`:
- 실제 도메인으로 `https://example.com` 교체

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

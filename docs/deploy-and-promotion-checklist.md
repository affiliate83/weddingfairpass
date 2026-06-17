# 웨딩페어패스 배포/홍보 체크리스트

## 현재 사이트 상태

- 메인 페이지 1개
- 지역 SEO 페이지 9개
- 개별 박람회 상세 페이지 112개
- sitemap URL 124개
- 리플알바 캠페인 URL 118개 확보
  - 개별 머천트 신규 생성 114개
  - 전국 랜딩 고정 캠페인 4개

## 도메인 연결 전 필수 작업

1. 실제 도메인 확정
2. `SITE_URL`에 실제 도메인을 넣고 재생성

```bash
set SITE_URL=https://weddingfairpass.com
npm.cmd run build:fairs
```

3. 아래 파일에서 `https://weddingfairpass.com`이 반영됐는지 확인
   - `sitemap.xml`
   - `robots.txt`
   - `regions/*.html`
   - `fairs/*.html`
   - `index.html`의 canonical/og:url

4. 개인정보처리방침/문의 페이지 실제 운영 정보 반영
5. 제휴/광고성 고지 문구 확인
6. 배포 후 모든 CTA가 리플알바 `pt` 링크로 이동하는지 확인

## 검색 등록

- Google Search Console 사이트 등록
- Google Search Console에 `sitemap.xml` 제출
- Naver Search Advisor 사이트 등록
- Naver Search Advisor에 `sitemap.xml` 제출
- Naver robots.txt 진단에서 수집 허용 확인
- 주요 URL 수집 요청

## Threads 홍보 원칙

- 여러 계정을 쓰더라도 같은 문구를 반복 발행하지 않는다.
- 계정별 역할을 분리한다.
  - 지역 일정 큐레이션 계정
  - 결혼 예산/준비 팁 계정
  - 커플 테스트/재미 콘텐츠 계정
- 리플알바 최종 `pt` 링크에는 UTM을 붙이지 않는다.
- 사이트 내부 유입 URL에는 UTM을 붙여도 된다.
- 광고/제휴 관계가 있는 콘텐츠는 제휴성 안내를 명확히 한다.
- 자동 백링크 대량 등록은 피하고, 블로그/카페/Threads/자체 콘텐츠 허브 중심으로 자연 유입을 만든다.

## 다음 개선 후보

- `review` 상태 13개 머천트의 날짜 수동 보강
- 개별 상세 페이지에 지도/주소 섹션 강화
- 지역 페이지별 소개 문단을 더 다르게 작성
- 날짜 지난 박람회 자동 비활성화
- GA4/Meta Pixel 연결
- 네이버 키워드광고용 지역별 랜딩 URL 세트 정리

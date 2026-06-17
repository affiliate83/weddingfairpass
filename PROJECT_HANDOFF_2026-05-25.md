> **[SUPERSEDED — 2026-06-17]**
> 이 문서는 2026-05-25 작성 시점의 초기 기록입니다. 현재 명령과 데이터 갱신 흐름은 `README.md`를 참조하세요.
> 특히 `convert:ripplealba` 명령과 `tools/convert-ripplealba.js`는 더 이상 사용하지 않습니다.
> 현행 흐름: `fetch:replyalba` → `apply:replyalba` → `build:fairs` → `check:baseline`

# 웨딩페어패스 프로젝트 인수인계 메모

작성일: 2026-05-25  
프로젝트 폴더: `C:\Users\user\Documents\Codex\affiliate-marketing`  
원본 작업 폴더: `C:\Users\user\Documents\Codex\2026-05-23\new-chat\wedding-fair-mvp`

## 1. 프로젝트 목적

웨딩박람회 제휴마케팅용 사이트 `웨딩페어패스`를 만든다.

목표는 단순 랜딩페이지가 아니라, 검색 유입을 받을 수 있는 `전국/지역별 웨딩박람회 일정 모음 사이트`로 키우는 것이다.

핵심 수익 구조:

- 리플알바 웨딩박람회 CPA 캠페인 링크로 무료입장 DB 접수 유도
- 지역별 SEO 페이지로 검색 유입 확보
- 커플 성향 테스트, 웨딩 타로, 무료 궁합 사주, 예산 계산기 같은 체류/전환 장치로 신청률 개선
- 추후 Threads, 네이버 블로그, 카페, 광고 유입을 병행

## 2. 현재 구현된 사이트 기능

현재 프로젝트에는 아래 기능이 구현되어 있다.

- 브랜드명: `웨딩페어패스`
- 메인 페이지: `index.html`
- 지역별 웨딩박람회 카드 목록
- 검색창/지역 필터
- 무료입장 신청 CTA
- 커플 성향 테스트
- 웨딩 타로 12장
- 무료 궁합 사주
  - 생년월일
  - 태어난 시간
  - 오행 기반 궁합 결과
  - 결혼하면 좋은 달 추천
- 결혼 예산 계산기
- FAQ
- 웨딩박람회 방문 가이드
- FAQ/Event JSON-LD 구조화 데이터
- 리플알바 CSV 변환/검증/빌드 파이프라인
- 리플알바 전국 캠페인 링크 목적별 매핑

주요 파일:

- `index.html`
- `styles.css`
- `app.js`
- `data.js`
- `fairs.generated.js`
- `campaign-links.js`
- `data/fairs.csv`
- `data/ripplealba-campaigns-template.csv`
- `tools/convert-ripplealba.js`
- `tools/build-fairs.js`
- `tools/validate-fairs.js`
- `docs/ripplealba-integration-checklist.md`
- `docs/replyalba-national-wedding-campaign-guide.md`
- `docs/weddingmoment-benchmark.md`
- `docs/threads-30day-calendar.md`

## 3. 리플알바 캠페인 링크 구조

리플알바 전국 웨딩박람회는 정렬 방식별 캠페인 링크가 따로 있다.

현재 발급받은 링크:

- 가나다순/SEO용: `https://www.replyalba.co.kr/pt/QguXBOoowJ`
- 인기순/메인 CTA용: `https://www.replyalba.co.kr/pt/Jk1KV29KEE`
- 승인률순/테스트·사주·예산 결과 CTA용: `https://www.replyalba.co.kr/pt/X52Q81jKNG`
- 랜덤순/보조 탐색 또는 실험용: `https://www.replyalba.co.kr/pt/TlsVkTDHfa`

지역별 링크는 뒤에 `/{regionCode}/hit`을 붙인다.

예시:

```text
서울 인기순: https://www.replyalba.co.kr/pt/Jk1KV29KEE/seoul/hit
경기 승인률순: https://www.replyalba.co.kr/pt/X52Q81jKNG/gyeonggi/hit
서울 가나다순: https://www.replyalba.co.kr/pt/QguXBOoowJ/seoul/hit
```

지역 코드:

```text
서울 seoul
경기 gyeonggi
인천 incheon
부산 busan
충청 chungcheong
전라 jeolla
강원 gangwon
경상 gyeongsang
제주 jeju
```

중요한 운영 원칙:

- 리플알바 `pt` 링크에는 UTM 파라미터를 붙이지 않는다.
- 실적 인정은 리플알바 발급 URL 기준이므로 원본 링크 보존이 중요하다.
- 사이트 내부 분석은 GA/dataLayer 이벤트로 기록한다.
- 개별 박람회 캠페인은 개별 발급 URL을 그대로 사용한다.

현재 개별 캠페인:

- 수원 타임빌라스 웨딩박람회
- 링크: `https://www.replyalba.co.kr/pt/zrcMAYQH57`
- PC 인트로: `https://www.replyalba.co.kr/intros/paris_swlt0607/`
- 모바일 인트로: `https://www.replyalba.co.kr/intros/paris_swlt0607/mobile.php`

## 4. 현재 링크 적용 상태

`campaign-links.js`에 전국 캠페인 링크가 저장되어 있다.

`app.js`에서 목적별로 다음처럼 사용한다.

- 메인 히어로 CTA: 인기순 링크
- 예산 계산 CTA: 승인률순 링크
- 커플 성향 테스트 결과 CTA: 승인률순 링크
- 궁합 사주 결과 CTA: 승인률순 링크
- 카드 목록: `fairs.generated.js`의 각 `affiliateUrl` 사용

브라우저 확인 결과:

- 기본 상태 메인 CTA: `https://www.replyalba.co.kr/pt/Jk1KV29KEE/seoul/hit`
- 기본 상태 예산 CTA: `https://www.replyalba.co.kr/pt/X52Q81jKNG/seoul/hit`
- 경기 탭 선택 후 메인 CTA: `https://www.replyalba.co.kr/pt/Jk1KV29KEE/gyeonggi/hit`
- 경기 탭 선택 후 예산 CTA: `https://www.replyalba.co.kr/pt/X52Q81jKNG/gyeonggi/hit`
- 수원 개별 카드: `https://www.replyalba.co.kr/pt/zrcMAYQH57`

검증 명령:

```bash
npm.cmd run check
```

최근 검증 시 통과했다.

## 5. CSV 운영 방식

리플알바 API를 바로 받기 어렵기 때문에 현재는 수동/반자동 방식으로 운영한다.

운영 흐름:

```text
리플알바에서 캠페인 확인
-> data/ripplealba-campaigns-template.csv 업데이트
-> npm.cmd run convert:ripplealba
-> npm.cmd run validate:fairs
-> npm.cmd run build:fairs
-> npm.cmd run check
```

주의:

- Excel에서 한글 깨짐 방지를 위해 CSV는 UTF-8 BOM이 필요하다.
- Excel에서 CSV를 열어둔 상태면 Windows에서 파일 잠금이 생길 수 있다.
- 입력폼 항목은 광고주가 원하는 항목 이상으로 늘리지 않는다.
- 입력폼 퍼가기 기능을 나중에 쓸 수 있다.

## 6. 벤치마킹 사이트

벤치마킹 사이트:

- `https://weddingmoment.co.kr/`

이 사이트에서 얻은 방향:

- 웨딩박람회 일정 모음 사이트처럼 보이게 구성
- 지역별 필터
- 일정 카드형 리스트
- SEO 친화적인 제목과 설명
- 너무 랜딩페이지만 같지 않게 정보성 콘텐츠와 도구를 섞기

## 7. 사용자가 제공한 쓰레드 내용 정리

### 7-1. 웨딩박람회 일정 사이트 제작 과정

사용자가 캡처로 제공한 쓰레드 핵심 내용:

```text
네이버 바이브 코딩으로 제휴마케팅 전용 웨딩박람회일정을 만든 과정

1. 구글 안티그래비티 > 클로드 코드 연동
2. 리플알바 > 제휴마케팅 상품 검색 > 전국 웨딩박람회일정 > 레퍼럴 코드 가져오기
3. 레퍼럴 코드 가져온 사이트의 전체적인 구조를 이해시킴
4. 네이버 > 웨딩박람회일정 검색 후 상위잡고 있는 사이트 구조 이해시킴
5. SEO, GEO 고려해서 레퍼럴 사이트 만들어달라고 요청함
6. 주 단위, 월 단위 박람회 일정이 바뀌니 주기적으로 자동 업데이트 해달라고 함
7. 네이버, 구글 SEO에 맞게 사이트 구조 잡아달라고 함
8. 네이버 indexnow 및 검색순위 반영해달라고 함
9. 트래픽이 들어오면서 검색 순위가 서서히 올라감
```

우리 프로젝트에 적용할 점:

- 단일 페이지보다 `지역별 SEO 페이지` 구조로 확장해야 한다.
- 지역별 키워드와 개별 박람회 키워드를 노린다.
- 일정 업데이트가 가능하도록 CSV/API 기반 구조를 유지한다.
- 네이버/구글 색인을 고려한 사이트맵과 구조화 데이터를 강화한다.

### 7-2. 추가할 것들

사용자가 추가로 제공한 쓰레드 핵심 내용:

```text
1. 네이버 키워드 검색 광고 연동
> 이제 웨딩박람회 일정 어드민 페이지에서 네이버 키워드광고 컨트를 하려고 함

2. 자동으로 웹사이트 백링크 작업 하려고함
>> 난 일체 건들지 않고 알아서 하도록 할 예정

3. 지금은 웨딩박람회일정만 이렇게 하는거고, 차후에 api를 활용한 다양한 서비스들을 완전 자동화로 구현할 생각
```

우리 프로젝트에 적용할 점:

- 네이버 키워드 광고용 랜딩 URL/지역별 전환 링크/성과를 나중에 관리할 수 있게 한다.
- 백링크 자동화는 위험하므로 무작위 자동 등록은 피한다.
- 대신 Threads, 블로그, 카페, 자체 콘텐츠 허브에 자연스럽게 연결한다.
- 추후 API가 생기면 리플알바 캠페인 자동 수집, 일정 자동 갱신, 다른 CPA 서비스 확장까지 가능하게 한다.

## 8. 다음 개발 우선순위

사용자가 “그렇게 진행해줘”라고 요청한 다음 작업:

1. 지역별 SEO 페이지 자동 생성
   - `/regions/seoul.html`
   - `/regions/gyeonggi.html`
   - `/regions/incheon.html`
   - `/regions/busan.html`
   - `/regions/chungcheong.html`
   - `/regions/jeolla.html`
   - `/regions/gangwon.html`
   - `/regions/gyeongsang.html`
   - `/regions/jeju.html`

2. 개별 박람회 상세 페이지 자동 생성
   - 현재는 구체 일정이 있는 수원 타임빌라스만 우선 생성
   - 전국형/상시확인 데이터는 개별 상세 페이지로 만들면 얇은 중복 페이지가 될 수 있으므로 지역 페이지에만 사용

3. `sitemap.xml` 자동 생성
   - 메인
   - 개인정보/문의
   - 지역별 페이지
   - 개별 박람회 상세 페이지

4. `robots.txt` 확인 및 sitemap URL 반영

5. SEO 메타/구조화 데이터 강화
   - 지역 페이지 Title/Description
   - FAQPage
   - Event/ItemList
   - BreadcrumbList

6. IndexNow 제출 스크립트는 추후 추가
   - 실제 도메인 확정 후 진행하는 것이 좋음

## 9. SEO 페이지 생성 시 권장 구조

지역 페이지 예시:

```text
Title: 서울 웨딩박람회 일정 2026 | 무료입장 신청
Description: 서울 지역 웨딩박람회 일정, 장소, 무료입장 신청 정보를 한 번에 확인하세요.
H1: 서울 웨딩박람회 일정 무료입장 신청
CTA: 인기순 또는 가나다순 서울 링크
카드 목록: 서울 지역 fairs
FAQ:
- 무료입장은 정말 무료인가요?
- 신청 후 연락이 오나요?
- 웨딩박람회에서 무엇을 비교해야 하나요?
- 방문 전 준비할 것은 무엇인가요?
```

개별 페이지 예시:

```text
Title: 수원 타임빌라스 웨딩박람회 일정 | 무료입장 신청
Description: 롯데백화점 수원점 B1 특별행사장에서 열리는 수원 타임빌라스 웨딩박람회 일정과 무료입장 신청 정보를 확인하세요.
H1: 수원 타임빌라스 웨딩박람회
장소: 롯데백화점 수원점 B1 특별행사장
일정: 6월 7일 11:00-20:00
CTA: 리플알바 개별 링크
```

## 10. 광고/전환 운영 아이디어

네이버 키워드 광고를 붙일 경우:

- 지역별 랜딩 URL을 분리한다.
- 키워드 예시:
  - 서울 웨딩박람회
  - 수원 웨딩박람회
  - 웨딩박람회 무료입장
  - 웨딩박람회 일정
  - 2026 웨딩박람회
- 광고 URL에는 사이트 내부 UTM을 붙일 수 있다.
- 단, 최종 리플알바 `pt` 링크에는 UTM을 붙이지 않는다.

성과 관리 항목:

- 유입 키워드
- 지역 페이지
- CTA 클릭 수
- 리플알바 승인 DB 수
- 단가
- 승인율
- 반려 사유

## 11. Codex/플러그인 관련 메모

사용자가 유튜브에서 본 Computer Use/Chrome Extension 기반 자동화와 현재 세션 상황이 달랐다.

현재 세션에서 확인된 사용 가능 플러그인:

- Browser
- Documents
- Presentations
- Spreadsheets

스크린샷상 사용자 계정 플러그인 목록에는 `Chrome` 플러그인이 보였다.  
리플알바 사이트에 직접 접속해서 로그인 세션으로 캠페인 목록을 가져오려면 다음이 필요하다.

- Chrome 플러그인
- Chrome Extension 연결
- 사용자가 리플알바에 로그인한 크롬 세션

만약 직접 조작이 안 되면 대안은 다음과 같다.

- 사용자가 상세페이지 URL/스크린샷 제공
- 사용자가 캠페인 링크 발급 후 전달
- 리플알바 CSV/엑셀 export 제공 시 변환
- 현재처럼 반자동 CSV 관리

## 12. Codex 앱 멈춤 이슈 메모

대화 중 Codex 앱이 `응답 없음`처럼 흐려지는 현상이 있었다.

가능한 이유:

- 파일 수정/브라우저 확인/서버 실행 중 새 메시지 입력으로 이전 작업이 중단됨
- `turn_aborted` 발생
- Codex 앱 UI가 이전 실행 상태를 정리하지 못함
- 로컬 서버나 브라우저 도구 실행이 꼬임

대응:

- 긴 작업 중에는 잠깐 기다리기
- 급하면 “멈춰”라고 말하기
- 앱이 흐려지고 `응답 없음`이면 Codex 앱 재시작
- 새 채팅에서 이 파일을 읽고 이어가기

## 13. 다음 채팅에서 바로 시작할 요청 문장

새 채팅에서는 이렇게 말하면 된다.

```text
@C:\Users\user\Documents\Codex\affiliate-marketing\PROJECT_HANDOFF_2026-05-25.md
이 파일 읽고 웨딩페어패스 프로젝트 이어서 진행해줘.
우선 지역별 SEO 페이지 자동 생성, 개별 박람회 상세 페이지 생성, sitemap.xml 자동 생성부터 해줘.
```

## 14. 실행 명령 모음

프로젝트 폴더:

```bash
cd C:\Users\user\Documents\Codex\affiliate-marketing
```

검증:

```bash
npm.cmd run check
```

리플알바 CSV 반영:

```bash
npm.cmd run convert:ripplealba
npm.cmd run validate:fairs
npm.cmd run build:fairs
npm.cmd run check
```

로컬 서버:

```bash
npm.cmd run start
```

접속:

```text
http://127.0.0.1:4173/
```


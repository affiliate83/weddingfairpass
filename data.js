const AFFILIATE_CONFIG = {
  offerName: "웨딩박람회 무료입장",
  affiliateUrl: "https://example.com/wedding-fair-offer",
  ga4Id: "",
  metaPixelId: "",
};

const fairs = Array.isArray(window.WEDDING_FAIRS) && window.WEDDING_FAIRS.length ? window.WEDDING_FAIRS : [
  {
    id: "seoul-coex-01",
    region: "서울",
    title: "서울 강남 웨딩박람회",
    venue: "코엑스 인근 상담관",
    date: "6월 6일 - 6월 7일",
    tags: ["웨딩홀", "스드메", "혼수"],
    summary: "서울권 예식장과 스드메 혜택을 한 번에 비교하고 싶은 예비부부에게 적합합니다.",
    badge: "인기",
  },
  {
    id: "seoul-jamsil-01",
    region: "서울",
    title: "잠실 웨딩 혜택 박람회",
    venue: "잠실 종합 상담센터",
    date: "6월 13일 - 6월 14일",
    tags: ["웨딩홀", "예물", "예복"],
    summary: "동서울, 경기 동부권 예비부부가 방문하기 좋은 일정입니다.",
    badge: "서울",
  },
  {
    id: "gyeonggi-suwon-01",
    region: "경기",
    title: "수원 웨딩페어",
    venue: "수원 컨벤션 인근",
    date: "6월 7일 - 6월 8일",
    tags: ["웨딩홀", "드레스", "신혼여행"],
    summary: "수원, 용인, 화성 지역 예비부부를 위한 무료입장 일정입니다.",
    badge: "경기",
  },
  {
    id: "gyeonggi-bundang-01",
    region: "경기",
    title: "분당 프리미엄 웨딩 상담전",
    venue: "분당 상담 라운지",
    date: "6월 14일 - 6월 15일",
    tags: ["스드메", "혼수", "예물"],
    summary: "예산과 혜택을 함께 비교하고 싶은 커플에게 맞는 일정입니다.",
    badge: "혜택",
  },
  {
    id: "incheon-songdo-01",
    region: "인천",
    title: "송도 웨딩박람회",
    venue: "송도 컨벤시아 인근",
    date: "6월 20일 - 6월 21일",
    tags: ["웨딩홀", "혼수", "가전"],
    summary: "인천, 김포, 부천권 예비부부가 확인하기 좋은 박람회입니다.",
    badge: "신규",
  },
  {
    id: "busan-centum-01",
    region: "부산",
    title: "부산 센텀 웨딩페어",
    venue: "센텀시티 상담관",
    date: "6월 21일 - 6월 22일",
    tags: ["웨딩홀", "스드메", "한복"],
    summary: "부산권 웨딩 준비를 시작하는 예비부부에게 맞는 무료입장 일정입니다.",
    badge: "부산",
  },
];

const quizQuestions = [
  {
    id: "style",
    title: "결혼 준비에서 가장 먼저 보고 싶은 것은?",
    options: [
      { label: "예식장 분위기와 위치", type: "venue" },
      { label: "스드메 견적과 혜택", type: "package" },
      { label: "혼수, 예물, 가전 혜택", type: "benefit" },
    ],
  },
  {
    id: "pace",
    title: "준비 방식은 어느 쪽에 가까운가요?",
    options: [
      { label: "한 번에 비교하고 빠르게 결정", type: "package" },
      { label: "천천히 발품 팔며 꼼꼼히 확인", type: "venue" },
      { label: "할인과 사은품을 최대한 챙김", type: "benefit" },
    ],
  },
  {
    id: "budget",
    title: "가장 줄이고 싶은 비용은?",
    options: [
      { label: "웨딩홀 대관과 식대", type: "venue" },
      { label: "촬영, 드레스, 메이크업", type: "package" },
      { label: "혼수, 예물, 신혼여행", type: "benefit" },
    ],
  },
];

const resultCopy = {
  venue: {
    title: "웨딩홀 비교형 커플",
    body: "위치, 식대, 홀 분위기를 먼저 비교하는 편입니다. 지역별 박람회에서 상담 가능한 홀과 날짜를 먼저 확인하는 흐름이 잘 맞습니다.",
    cta: "내 지역 웨딩홀 혜택 보기",
  },
  package: {
    title: "스드메 패키지 비교형 커플",
    body: "스튜디오, 드레스, 메이크업 견적을 한 번에 정리하면 결정 속도가 빨라지는 유형입니다. 박람회 방문 전 예산 기준을 잡아두면 좋습니다.",
    cta: "스드메 혜택 박람회 보기",
  },
  benefit: {
    title: "혜택 회수형 커플",
    body: "혼수, 예물, 가전, 신혼여행까지 혜택을 꼼꼼히 챙기는 유형입니다. 무료입장 신청 후 관심 항목을 미리 정리해두는 편이 유리합니다.",
    cta: "무료입장 혜택 확인하기",
  },
};

const tarotCards = [
  {
    name: "The Lovers",
    label: "함께 결정하는 카드",
    message: "두 사람이 같은 방향을 바라볼수록 준비 속도가 빨라집니다. 오늘은 웨딩홀과 예산 기준을 함께 정리하기 좋은 날입니다.",
    action: "지역별 박람회 일정을 확인해보세요.",
    image: "assets/tarot/lovers.png",
  },
  {
    name: "Ten of Cups",
    label: "축복의 카드",
    message: "가족, 하객, 분위기처럼 주변 사람들과 함께 만드는 결혼식에 강한 운이 있습니다. 상담 전 하객 규모를 먼저 잡아보세요.",
    action: "웨딩홀 상담 가능한 박람회를 보는 것이 좋습니다.",
    image: "assets/tarot/ten-of-cups.png",
  },
  {
    name: "Two of Pentacles",
    label: "예산 조율의 카드",
    message: "하고 싶은 것은 많지만 예산 배분이 중요한 시기입니다. 스드메, 혼수, 예물 중 우선순위를 정하면 선택이 쉬워집니다.",
    action: "예산 계산기를 먼저 사용해보세요.",
    image: "assets/tarot/two-of-pentacles.png",
  },
  {
    name: "The Star",
    label: "취향 발견의 카드",
    message: "두 사람만의 분위기를 찾기 좋은 흐름입니다. 사진, 드레스, 공간 무드를 비교하면서 원하는 결을 좁혀보세요.",
    action: "스드메 혜택이 있는 박람회를 확인해보세요.",
    image: "assets/tarot/star.png",
  },
  {
    name: "The Empress",
    label: "풍요와 준비의 카드",
    message: "결혼 준비에 필요한 자원이 모이는 흐름입니다. 혼수, 예물, 가전처럼 실제 생활과 연결되는 항목을 확인하기 좋습니다.",
    action: "혼수 혜택이 있는 박람회를 확인해보세요.",
    image: "assets/tarot/empress.png",
  },
  {
    name: "The Hierophant",
    label: "약속과 계약의 카드",
    message: "조건을 정확히 확인할수록 좋은 선택을 할 수 있습니다. 계약 전 포함 항목, 변경 조건, 취소 규정을 꼭 비교하세요.",
    action: "상담 전 체크리스트를 확인해보세요.",
    image: "assets/tarot/hierophant.png",
  },
  {
    name: "Justice",
    label: "조건 확인의 카드",
    message: "감성보다 기준이 중요한 날입니다. 견적서, 추가 비용, 사은품 조건을 차분히 비교하면 손해를 줄일 수 있습니다.",
    action: "여러 박람회 혜택을 비교해보세요.",
    image: "assets/tarot/justice.png",
  },
  {
    name: "Four of Wands",
    label: "예식의 카드",
    message: "예식장 분위기와 하객 동선에 좋은 기운이 있습니다. 홀 투어와 식대 상담을 먼저 잡아보면 좋습니다.",
    action: "웨딩홀 중심 박람회를 확인해보세요.",
    image: "assets/tarot/four-of-wands.png",
  },
  {
    name: "Ace of Cups",
    label: "새로운 시작의 카드",
    message: "결혼 준비를 본격적으로 시작하기 좋은 흐름입니다. 큰 결정보다 첫 상담과 정보 수집부터 가볍게 시작하세요.",
    action: "무료입장 가능한 일정을 먼저 확인하세요.",
    image: "assets/tarot/ace-of-cups.png",
  },
  {
    name: "Temperance",
    label: "조율의 카드",
    message: "두 사람의 의견을 맞추는 과정이 중요합니다. 예산, 취향, 가족 의견을 한 번에 정리할 수 있는 상담이 잘 맞습니다.",
    action: "커플 성향 테스트 결과와 함께 확인해보세요.",
    image: "assets/tarot/temperance.png",
  },
  {
    name: "The Sun",
    label: "밝은 일정의 카드",
    message: "기분 좋게 결정을 내리기 좋은 흐름입니다. 날짜와 지역 후보가 어느 정도 정해졌다면 바로 상담 일정을 잡아도 좋습니다.",
    action: "이번 달 박람회 일정을 확인해보세요.",
    image: "assets/tarot/sun.png",
  },
  {
    name: "The World",
    label: "완성의 카드",
    message: "준비의 큰 그림이 맞춰지는 시기입니다. 남은 항목을 한 번에 점검하고 혜택을 마무리하기 좋습니다.",
    action: "최종 비교용 박람회를 확인해보세요.",
    image: "assets/tarot/world.png",
  },
];

const sajuElements = {
  wood: {
    name: "목",
    title: "성장과 취향을 중시하는 기운",
    trait: "새로운 것을 함께 시도할수록 관계의 결이 좋아지는 타입입니다.",
    wedding: "스튜디오, 드레스, 공간 무드를 비교하는 과정에서 만족도가 높습니다.",
  },
  fire: {
    name: "화",
    title: "표현과 추진력이 강한 기운",
    trait: "결정이 빠르고 분위기를 끌어올리는 힘이 있는 타입입니다.",
    wedding: "방문 전 예산 상한선만 정해두면 박람회 상담 효율이 좋아집니다.",
  },
  earth: {
    name: "토",
    title: "현실감과 안정감을 중시하는 기운",
    trait: "조건과 비용을 꼼꼼히 맞춰갈 때 관계의 안정감이 커지는 타입입니다.",
    wedding: "웨딩홀, 식대, 계약 조건을 먼저 비교하는 흐름이 잘 맞습니다.",
  },
  metal: {
    name: "금",
    title: "기준과 완성도를 중시하는 기운",
    trait: "분명한 기준을 세우면 선택이 빨라지고 만족도가 올라가는 타입입니다.",
    wedding: "스드메 구성, 촬영 스타일, 포함 항목을 체크리스트로 비교해보세요.",
  },
  water: {
    name: "수",
    title: "감정과 흐름을 읽는 기운",
    trait: "서로의 속도를 맞추고 충분히 대화할수록 좋은 결정을 내리는 타입입니다.",
    wedding: "상담 전 원하는 결혼식 분위기를 말로 정리해두면 도움이 됩니다.",
  },
};

const sajuRelations = {
  harmony: {
    title: "상생 조율형 궁합",
    body: "두 사람의 기운이 서로를 보완하는 흐름입니다. 결혼 준비에서는 한 사람이 방향을 잡고 다른 사람이 세부를 챙길 때 균형이 좋습니다.",
    cta: "우리에게 맞는 박람회 보기",
  },
  same: {
    title: "취향 공명형 궁합",
    body: "비슷한 기준과 취향이 강하게 맞는 조합입니다. 다만 둘 다 같은 부분을 중요하게 보므로 예산 우선순위를 먼저 정하는 것이 좋습니다.",
    cta: "예산 기준 잡고 박람회 보기",
  },
  balance: {
    title: "현실 균형형 궁합",
    body: "서로 다른 관점이 결혼 준비의 균형을 만들어주는 조합입니다. 감성, 비용, 일정 중 누가 어떤 항목을 맡을지 정하면 효율이 좋습니다.",
    cta: "지역별 무료입장 일정 보기",
  },
};

const weddingMonthAdvice = {
  wood: {
    months: "3월, 4월, 5월",
    reason: "새로운 시작과 성장의 기운이 강한 봄 시즌과 잘 맞습니다.",
  },
  fire: {
    months: "5월, 6월, 7월",
    reason: "분위기와 표현력이 살아나는 계절이라 화사한 예식 연출에 유리합니다.",
  },
  earth: {
    months: "4월, 9월, 10월",
    reason: "안정감과 현실적인 준비 흐름이 강해 계약과 일정 조율에 좋습니다.",
  },
  metal: {
    months: "9월, 10월, 11월",
    reason: "완성도와 격식이 살아나는 계절이라 클래식한 예식과 잘 맞습니다.",
  },
  water: {
    months: "11월, 12월, 1월",
    reason: "차분하게 깊이를 더하는 흐름이라 소규모 예식이나 감성적인 무드에 좋습니다.",
  },
};

const faqs = [
  {
    question: "웨딩박람회 무료입장은 정말 무료인가요?",
    answer: "무료입장 혜택은 각 박람회와 광고주가 제공하는 조건을 기준으로 합니다. 실제 신청 페이지에서 일정, 장소, 혜택 조건을 다시 확인하세요.",
  },
  {
    question: "박람회에 가기 전에 무엇을 정해야 하나요?",
    answer: "결혼 예정 시기, 선호 지역, 대략적인 예산, 관심 항목을 먼저 정리하면 상담 시간이 짧아지고 비교가 쉬워집니다.",
  },
  {
    question: "커플 성향 테스트나 사주는 신청에 꼭 필요한가요?",
    answer: "필수는 아닙니다. 결혼 준비 우선순위를 정하고 어떤 박람회를 먼저 볼지 참고하기 위한 무료 콘텐츠입니다.",
  },
  {
    question: "신청 후 연락은 어디서 오나요?",
    answer: "무료입장 신청은 제휴 신청 페이지에서 진행되며, 실제 연락 주체와 개인정보 처리 내용은 해당 신청 페이지의 동의 내용을 기준으로 합니다.",
  },
];

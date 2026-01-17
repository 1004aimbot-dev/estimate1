import { Estimate, EstimateStatus, LibraryItem, EstimateTemplate } from "./types";

export const MOCK_ESTIMATES: Estimate[] = [
    {
        id: "1",
        title: "서울 아파트 타일 공사",
        customerName: "김민수",
        price: 4500000,
        status: EstimateStatus.Completed,
        category: "Tile",
        imageUrl: "https://picsum.photos/200/200?random=1",
        date: "2023-10-25"
    },
    {
        id: "2",
        title: "강남 사무실 목공 공사",
        customerName: "이정호",
        price: 8200000,
        status: EstimateStatus.Sent,
        category: "Carpentry",
        imageUrl: "https://picsum.photos/200/200?random=2",
        date: "2023-10-26"
    },
    {
        id: "3",
        title: "한남 빌라 바닥 공사",
        customerName: "박서준",
        price: 2100000,
        status: EstimateStatus.Draft,
        category: "Tile",
        imageUrl: "https://picsum.photos/200/200?random=3",
        date: "2023-10-27"
    },
    {
        id: "4",
        title: "이태원 카페 카운터 시공",
        customerName: "최지원",
        price: 3850000,
        status: EstimateStatus.Sent,
        category: "Carpentry",
        imageUrl: "https://picsum.photos/200/200?random=4",
        date: "2023-10-28"
    }
];

export const MOCK_LIBRARY: LibraryItem[] = [
    // --- 목공 (Carpentry) 20 items ---
    { id: "w1", category: "목공", name: "석고보드 가벽 설치", price: 55000, unit: "m²", description: "일반 석고보드 2P, 목재 스터드 포함", isFavorite: true },
    { id: "w2", category: "목공", name: "천장 평탄화 작업", price: 28000, unit: "m²", description: "기존 천장 철거 후 수평 보강", isFavorite: true },
    { id: "w3", category: "목공", name: "걸레받이 시공 (MDF)", price: 8500, unit: "m", description: "백색 필름 마감, 실리콘 마감 포함", isFavorite: true },
    { id: "w4", category: "목공", name: "천장 몰딩 시공 (평몰딩)", price: 7500, unit: "m", description: "백색 60mm 평몰딩 기준", isFavorite: false },
    { id: "w5", category: "목공", name: "문틀/문짝 목공 마감", price: 120000, unit: "set", description: "문틀 보강 및 수평 작업", isFavorite: false },
    { id: "w6", category: "목공", name: "싱크대 하부장 골조", price: 350000, unit: "m", description: "주방 가구 목재 프레임 작업", isFavorite: false },
    { id: "w7", category: "목공", name: "붙박이장 골조 작업", price: 280000, unit: "m", description: "안방 수납장 목공 기본 틀", isFavorite: false },
    { id: "w8", category: "목공", name: "아트월 목공 시공", price: 450000, unit: "식", description: "거실 TV 벽면 포인트 목공", isFavorite: true },
    { id: "w9", category: "목공", name: "간접 등박스 조성", price: 45000, unit: "m", description: "T5 조명용 매립 박스", isFavorite: false },
    { id: "w10", category: "목공", name: "커튼박스 보강 시공", price: 15000, unit: "m", description: "창가 합판 보강 작업", isFavorite: false },
    { id: "w11", category: "목공", name: "아치형 문틀 제작", price: 250000, unit: "ea", description: "곡선 라운드 목공 작업", isFavorite: true },
    { id: "w12", category: "목공", name: "무지주 선반 제작", price: 85000, unit: "ea", description: "벽체 매립형 목재 선반", isFavorite: false },
    { id: "w13", category: "목공", name: "계단 목공 보수", price: 650000, unit: "식", description: "실내 계단 디딤판 보강", isFavorite: false },
    { id: "w14", category: "목공", name: "데크 시공 (방부목)", price: 180000, unit: "m²", description: "외부 테라스 방부목 데크", isFavorite: false },
    { id: "w15", category: "목공", name: "벽면 루바 시공", price: 55000, unit: "m²", description: "수평/수직 우드 루바 시공", isFavorite: false },
    { id: "w16", category: "목공", name: "단열재 충전 및 마감", price: 35000, unit: "m²", description: "이보드 또는 단열재 50T", isFavorite: false },
    { id: "w17", category: "목공", name: "흡음판 타공 시공", price: 95000, unit: "m²", description: "음악실용 목재 타공판", isFavorite: false },
    { id: "w18", category: "목공", name: "유리틀 파티션 제작", price: 380000, unit: "m", description: "목재 프레임 및 유리 고정틀", isFavorite: false },
    { id: "w19", category: "목공", name: "슬라이딩 레일 매립", price: 150000, unit: "set", description: "포켓 도어용 상부 레일 목공", isFavorite: false },
    { id: "w20", category: "목공", name: "목재 창호 보수", price: 80000, unit: "ea", description: "기존 목재 창호 밸런스 조정", isFavorite: false },

    // --- 타일 (Tile) 20 items ---
    { id: "t1", category: "타일", name: "600각 포세린 타일 시공", price: 75000, unit: "m²", description: "거실/주방 바닥, 졸리컷 마감 별도", isFavorite: true },
    { id: "t2", category: "타일", name: "욕실 벽 타일 (300*600)", price: 45000, unit: "m²", description: "국산 도기질 타일 기준", isFavorite: true },
    { id: "t3", category: "타일", name: "욕실 바닥 타일 (300각)", price: 42000, unit: "m²", description: "미끄럼 방지 자기질 타일", isFavorite: false },
    { id: "t4", category: "타일", name: "주방 서브웨이 타일", price: 55000, unit: "m²", description: "100*300각 포인트 시공", isFavorite: false },
    { id: "t5", category: "타일", name: "현관 헥사곤 타일", price: 65000, unit: "m²", description: "벌집 모양 포인트 타일", isFavorite: true },
    { id: "t6", category: "타일", name: "발코니 우드 타일 시공", price: 38000, unit: "m²", description: "나무 질감의 쪽마루 타일", isFavorite: false },
    { id: "t7", category: "타일", name: "모자이크 타일 시공", price: 85000, unit: "m²", description: "그물망 타일, 포인트 벽면용", isFavorite: false },
    { id: "t8", category: "타일", name: "박판 타일 (1200*2400)", price: 250000, unit: "m²", description: "대형 세라믹 박판 타일", isFavorite: false },
    { id: "t9", category: "타일", name: "졸리컷 마감 처리", price: 35000, unit: "m", description: "타일 모서리 45도 가공 마감", isFavorite: true },
    { id: "t10", category: "타일", name: "에폭시 줄눈 (메지) 작업", price: 120000, unit: "식", description: "오염 방지용 반짝이 줄눈 등", isFavorite: false },
    { id: "t11", category: "타일", name: "테라조 타일 시공", price: 65000, unit: "m²", description: "인조석 질감 테라조 패턴", isFavorite: false },
    { id: "t12", category: "타일", name: "빈티지 노출 타일", price: 58000, unit: "m²", description: "콘크리트 질감 빈티지 타일", isFavorite: false },
    { id: "t13", category: "타일", name: "욕조 측면 타일 마감", price: 150000, unit: "ea", description: "에이프런 타일 마감 시공", isFavorite: false },
    { id: "t14", category: "타일", name: "젠다이 타일 졸리컷", price: 180000, unit: "식", description: "욕실 선반 타일 일체형 시공", isFavorite: false },
    { id: "t15", category: "타일", name: "포인트 벽 타일 (패턴)", price: 75000, unit: "m²", description: "특수 패턴 포인트 타일", isFavorite: false },
    { id: "t16", category: "타일", name: "실외 계단 타일 시공", price: 95000, unit: "m²", description: "외부용 논슬립 고강도 타일", isFavorite: false },
    { id: "t17", category: "타일", name: "수영장 타일 (20각)", price: 150000, unit: "m²", description: "담수용 수영장 미니 타일", isFavorite: false },
    { id: "t18", category: "타일", name: "타일 철거 후 면정리", price: 25000, unit: "m²", description: "기존 타일 제거 및 바닥 정리", isFavorite: false },
    { id: "t19", category: "타일", name: "폴리싱 타일 (800각)", price: 85000, unit: "m²", description: "고광택 폴리싱 타일 시공", isFavorite: false },
    { id: "t20", category: "타일", name: "파벽돌 인테리어 시공", price: 55000, unit: "m²", description: "카페형 파벽돌 부착 및 줄눈", isFavorite: false },

    // --- 자재 (Materials) 20 items ---
    { id: "m1", category: "자재", name: "편백나무 루바 (bundle)", price: 42000, unit: "bundle", description: "무절, 2400mm x 100mm", isFavorite: false },
    { id: "m2", category: "자재", name: "영림 도어 (ABS)", price: 245000, unit: "set", description: "문틀, 문짝 세트 제품", isFavorite: true },
    { id: "m3", category: "자재", name: "세라픽스 7000 (20kg)", price: 28000, unit: "ea", description: "벽타일 접착 본드", isFavorite: false },
    { id: "m4", category: "자재", name: "압착 시멘트 (25kg)", price: 9500, unit: "bag", description: "바닥 타일용 시멘트", isFavorite: false },
    { id: "m5", category: "자재", name: "아덱스 FG4 탄성줄눈", price: 18000, unit: "bg", description: "고급 탄성 줄눈제 2kg", isFavorite: true },
    { id: "m6", category: "자재", name: "백색 실리콘 (박스)", price: 85000, unit: "box", description: "수성/유성 실리콘 20개", isFavorite: false },
    { id: "m7", category: "자재", name: "우레탄 폼 (건용)", price: 6500, unit: "ea", description: "창호/문틀 충전용 폼", isFavorite: false },
    { id: "m8", category: "자재", name: "목공 본드 205 (10kg)", price: 22000, unit: "ea", description: "오공본드 정품", isFavorite: false },
    { id: "m9", category: "자재", name: "LG 인테리어 필름", price: 25000, unit: "m", description: "방염 필름, 기본 단색", isFavorite: true },
    { id: "m10", category: "자재", name: "도배용 친환경 풀", price: 12000, unit: "ea", description: "밀가루 기반 친환경 도배풀", isFavorite: false },
    { id: "m11", category: "자재", name: "수성 페인트 (18L)", price: 55000, unit: "can", description: "실내 벽체용 화이트 수성", isFavorite: false },
    { id: "m12", category: "자재", name: "락카 스프레이", price: 3500, unit: "ea", description: "부분 마감용 스프레이", isFavorite: false },
    { id: "m13", category: "자재", name: "전선 VAF 2.5sq", price: 120000, unit: "roll", description: "접지 포함 3선 100m", isFavorite: false },
    { id: "m14", category: "자재", name: "LED 3인치 매입등", price: 4500, unit: "ea", description: "다운라이트 집중형/확산형", isFavorite: true },
    { id: "m15", category: "자재", name: "스위치/콘센트 세트", price: 8500, unit: "set", description: "르그랑/나노 기본형", isFavorite: false },
    { id: "m16", category: "자재", name: "실크 벽지 (1롤)", price: 38000, unit: "roll", description: "5평 기준 1롤 자재", isFavorite: false },
    { id: "m17", category: "자재", name: "강마루 자재 (1박스)", price: 65000, unit: "box", description: "0.5평 시공 가능 수량", isFavorite: false },
    { id: "m18", category: "자재", name: "수평 몰탈 (25kg)", price: 14000, unit: "bag", description: "자동수평 몰탈 자재", isFavorite: false },
    { id: "m19", category: "자재", name: "방수액 완결 (20L)", price: 15000, unit: "ea", description: "시멘트 혼입용 방수액", isFavorite: false },
    { id: "m20", category: "자재", name: "작업용 A자 사다리", price: 120000, unit: "ea", description: "5단 알루미늄 사다리", isFavorite: false },

    // --- 기타 (Others) 20 items ---
    { id: "o1", category: "기타", name: "폐기물 처리비 (1톤)", price: 400000, unit: "truck", description: "상차비 및 폐기장 이용료", isFavorite: true },
    { id: "o2", category: "기타", name: "욕실 철거 및 방수", price: 850000, unit: "set", description: "철거, 액방, 도막방수 포함", isFavorite: true },
    { id: "o3", category: "기타", name: "입주/준공 청소 (평)", price: 15000, unit: "py", description: "공사 후 분진 제거 청소", isFavorite: false },
    { id: "o4", category: "기타", name: "승강기 보양 작업", price: 150000, unit: "set", description: "플라베베 활용 전면 보양", isFavorite: true },
    { id: "o5", category: "기타", name: "에어컨 배관 매립", price: 250000, unit: "식", description: "벽체 타공 및 배관 숨김", isFavorite: false },
    { id: "o6", category: "기타", name: "욕실 기구 세팅비", price: 250000, unit: "set", description: "양변기, 세면기 설치 공임", isFavorite: false },
    { id: "o7", category: "기타", name: "조명 교체 인건비", price: 15000, unit: "ea", description: "기존 등 탈거 및 신규 설치", isFavorite: false },
    { id: "o8", category: "기타", name: "도장 뿜칠 인건비", price: 45000, unit: "m²", description: "기계 분사 도장 전문 작업", isFavorite: false },
    { id: "o9", category: "기타", name: "철거 인건비 (철거공)", price: 250000, unit: "person", description: "전문 철거 인력 1인 하루", isFavorite: false },
    { id: "o10", category: "기타", name: "현장 관리비 (경비)", price: 300000, unit: "식", description: "식대, 유류비, 소모품비", isFavorite: false },
    { id: "o11", category: "기타", name: "유료 주차 지원비", price: 50000, unit: "day", description: "현장 주변 주차장 이용료", isFavorite: false },
    { id: "o12", category: "기타", name: "도배 시공 인건비", price: 35000, unit: "py", description: "숙련공 기준 도배 공임", isFavorite: false },
    { id: "o13", category: "기타", name: "전기 증설/이설비", price: 150000, unit: "식", description: "차단기 용량 증설 및 위치 이동", isFavorite: false },
    { id: "o14", category: "기타", name: "가구 실측 및 설계비", price: 100000, unit: "식", description: "맞춤 가구 도면 작성비", isFavorite: false },
    { id: "o15", category: "기타", name: "필름 시공 인건비", price: 220000, unit: "person", description: "인테리어 필름 시공 전문가", isFavorite: false },
    { id: "o16", category: "기타", name: "실리콘 마감 처리비", price: 50000, unit: "식", description: "공사 전체 구간 코킹 마감", isFavorite: false },
    { id: "o17", category: "기타", name: "도시가스 배관 수정", price: 280000, unit: "식", description: "가스공사 대행 업체 비용", isFavorite: false },
    { id: "o18", category: "기타", name: "소방 감지기 증설", price: 35000, unit: "ea", description: "화재 감지기 라인 추가", isFavorite: false },
    { id: "o19", category: "기타", name: "금속 프레임 제작비", price: 450000, unit: "식", description: "철제 구조물 현장 용접/제작", isFavorite: false },
    { id: "o20", category: "기타", name: "현장 잡자재비", price: 100000, unit: "식", description: "장갑, 테이프, 비닐 등", isFavorite: false }
];

export const ESTIMATE_TEMPLATES: EstimateTemplate[] = [
    {
        id: "t1",
        name: "30평형 아파트 전체 도배",
        category: "주거공간",
        description: "광폭 합지, 천장 포함 기본 시공",
        items: [
            { name: "기존 벽지 제거", unit: "식", quantity: 1, materialCost: 0, laborCost: 250000, description: "기존 실크벽지 전체 제거" },
            { name: "30평형 전체 도배 (광폭합지)", unit: "py", quantity: 30, materialCost: 15000, laborCost: 25000, description: "신한 벽지 광폭 합지 기준" },
            { name: "부자재 및 풀", unit: "식", quantity: 1, materialCost: 150000, laborCost: 0, description: "친환경 풀 및 초배지" },
            { name: "폐기물 처리", unit: "식", quantity: 1, materialCost: 50000, laborCost: 0, description: "도배지 폐기물 수거" }
        ]
    },
    {
        id: "t2",
        name: "욕실 리모델링 (덧방 시공)",
        category: "주거공간",
        description: "기본형 욕실, 도기 세팅 포함",
        items: [
            { name: "기본 철거 (도기/천장)", unit: "식", quantity: 1, materialCost: 0, laborCost: 350000, description: "타일 제외 도기 및 천장재 철거" },
            { name: "벽 타일 시공 (덧방)", unit: "m²", quantity: 22, materialCost: 35000, laborCost: 40000, description: "300*600각 도기질" },
            { name: "바닥 타일 시공 (덧방)", unit: "m²", quantity: 5, materialCost: 35000, laborCost: 40000, description: "300각 논슬립" },
            { name: "평돔 천장 시공", unit: "식", quantity: 1, materialCost: 250000, laborCost: 150000, description: "LED 매입등 2구 포함" },
            { name: "위생 도기 세팅", unit: "식", quantity: 1, materialCost: 450000, laborCost: 150000, description: "양변기, 세면기, 수전 세트" }
        ]
    },
    {
        id: "t3",
        name: "상가 가벽 및 파티션 공사",
        category: "상업공간",
        description: "10m 기준 석고 2P 가벽",
        items: [
            { name: "목재 스터드 골조", unit: "m", quantity: 10, materialCost: 15000, laborCost: 25000, description: "투바이 구조목 @450 간격" },
            { name: "석고보드 취부 (2P)", unit: "m²", quantity: 25, materialCost: 8000, laborCost: 15000, description: "9.5T 일반 석고보드 양면" },
            { name: "걸레받이 시공", unit: "m", quantity: 20, materialCost: 5000, laborCost: 5000, description: "MDF 80mm 백색" }
        ]
    }
];

export const CURRENCY_FORMAT = new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    currencyDisplay: 'symbol',
});
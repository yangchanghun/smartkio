import type { ImageSourcePropType } from "react-native";

export type CoupangProduct = {
  id: string;
  name: string;
  shortName: string;
  category: "생활용품" | "식품" | "패션" | "뷰티";
  searchTerms: string[];
  missionTerm: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  delivery: string;
  badge: string;
  image: ImageSourcePropType;
};

export const coupangProducts: CoupangProduct[] = [
  {
    id: "tissue",
    name: "라벤더 향 도톰한 3겹 화장지 30m 30롤, 1팩",
    shortName: "라벤더 3겹 화장지",
    category: "생활용품",
    searchTerms: ["휴지", "화장지", "라벤더", "롤휴지"],
    missionTerm: "휴지",
    price: 13950,
    originalPrice: 19990,
    discount: 30,
    rating: 4.8,
    reviewCount: 145092,
    delivery: "내일 도착 예정",
    badge: "무료배송",
    image: require("../../../assets/coupang/product-main.png"),
  },
  {
    id: "tissue-natural",
    name: "천연펄프 수프림 소프트 4겹 화장지 27m 30롤, 1팩",
    shortName: "천연펄프 4겹 화장지",
    category: "생활용품",
    searchTerms: ["휴지", "화장지", "천연펄프", "롤휴지", "4겹"],
    missionTerm: "휴지",
    price: 14900,
    originalPrice: 21900,
    discount: 31,
    rating: 4.7,
    reviewCount: 6543,
    delivery: "내일 도착 예정",
    badge: "판매자로켓",
    image: require("../../../assets/coupang/product-tissue-natural.png"),
  },
  {
    id: "tissue-soft",
    name: "포근한 순면감촉 데코 3겹 화장지 33m 24롤, 1팩",
    shortName: "순면감촉 3겹 화장지",
    category: "생활용품",
    searchTerms: ["휴지", "화장지", "롤휴지", "순면", "3겹"],
    missionTerm: "화장지",
    price: 11900,
    originalPrice: 15900,
    discount: 25,
    rating: 4.8,
    reviewCount: 21887,
    delivery: "오늘 도착 예정",
    badge: "로켓배송",
    image: require("../../../assets/coupang/product-tissue-soft.png"),
  },
  {
    id: "tissue-eco",
    name: "무형광 친환경 대나무 펄프 3겹 화장지 25m 30롤",
    shortName: "친환경 대나무 화장지",
    category: "생활용품",
    searchTerms: ["휴지", "화장지", "친환경", "대나무", "무형광"],
    missionTerm: "친환경 휴지",
    price: 16800,
    originalPrice: 21000,
    discount: 20,
    rating: 4.6,
    reviewCount: 3941,
    delivery: "모레 도착 예정",
    badge: "무료배송",
    image: require("../../../assets/coupang/product-tissue-eco.png"),
  },
  {
    id: "tissue-compact",
    name: "데일리 가성비 2겹 화장지 40m 30롤, 1팩",
    shortName: "데일리 2겹 화장지",
    category: "생활용품",
    searchTerms: ["휴지", "화장지", "가성비", "롤휴지", "2겹"],
    missionTerm: "가성비 휴지",
    price: 9900,
    originalPrice: 12900,
    discount: 23,
    rating: 4.5,
    reviewCount: 9782,
    delivery: "내일 도착 예정",
    badge: "로켓배송",
    image: require("../../../assets/coupang/product-tissue-compact.png"),
  },
  {
    id: "water",
    name: "맑은샘 무라벨 생수 2L, 6개",
    shortName: "무라벨 생수",
    category: "식품",
    searchTerms: ["생수", "물", "무라벨"],
    missionTerm: "생수",
    price: 5490,
    originalPrice: 6900,
    discount: 20,
    rating: 4.9,
    reviewCount: 88341,
    delivery: "오늘 도착 예정",
    badge: "로켓배송",
    image: require("../../../assets/coupang/product-water.png"),
  },
  {
    id: "rice",
    name: "우리들판 신선한 경기미 10kg, 1개",
    shortName: "경기미 10kg",
    category: "식품",
    searchTerms: ["쌀", "백미", "경기미"],
    missionTerm: "쌀",
    price: 32900,
    originalPrice: 38900,
    discount: 15,
    rating: 4.8,
    reviewCount: 24118,
    delivery: "내일 도착 예정",
    badge: "무료배송",
    image: require("../../../assets/coupang/product-rice.png"),
  },
  {
    id: "detergent",
    name: "깨끗한날 액체 세탁세제 리필 2.1L, 4개",
    shortName: "액체 세탁세제",
    category: "생활용품",
    searchTerms: ["세제", "세탁세제", "빨래"],
    missionTerm: "세제",
    price: 18900,
    originalPrice: 24900,
    discount: 24,
    rating: 4.7,
    reviewCount: 19104,
    delivery: "내일 도착 예정",
    badge: "로켓배송",
    image: require("../../../assets/coupang/product-detergent.png"),
  },
  {
    id: "ramen",
    name: "매콤한 한끼 라면 120g, 5개입",
    shortName: "매콤한 라면",
    category: "식품",
    searchTerms: ["라면", "봉지라면", "간식"],
    missionTerm: "라면",
    price: 4980,
    originalPrice: 5500,
    discount: 9,
    rating: 4.8,
    reviewCount: 57220,
    delivery: "오늘 도착 예정",
    badge: "로켓배송",
    image: require("../../../assets/coupang/product-ramen.png"),
  },
  {
    id: "shampoo",
    name: "순한허브 데일리 샴푸 1L, 2개",
    shortName: "데일리 샴푸",
    category: "뷰티",
    searchTerms: ["샴푸", "머리", "헤어"],
    missionTerm: "샴푸",
    price: 16900,
    originalPrice: 22000,
    discount: 23,
    rating: 4.7,
    reviewCount: 12043,
    delivery: "내일 도착 예정",
    badge: "무료배송",
    image: require("../../../assets/coupang/product-shampoo.png"),
  },
  {
    id: "socks",
    name: "데일리 쿠션 중목 양말 10켤레 세트",
    shortName: "중목 양말 세트",
    category: "패션",
    searchTerms: ["양말", "중목양말", "패션"],
    missionTerm: "양말",
    price: 12900,
    originalPrice: 17900,
    discount: 27,
    rating: 4.6,
    reviewCount: 8931,
    delivery: "내일 도착 예정",
    badge: "로켓배송",
    image: require("../../../assets/coupang/product-socks.png"),
  },
  {
    id: "apple",
    name: "아삭한 당도선별 사과 1.5kg, 1박스",
    shortName: "당도선별 사과",
    category: "식품",
    searchTerms: ["사과", "과일", "홍로"],
    missionTerm: "사과",
    price: 14900,
    originalPrice: 18900,
    discount: 21,
    rating: 4.7,
    reviewCount: 6772,
    delivery: "오늘 도착 예정",
    badge: "로켓프레시",
    image: require("../../../assets/coupang/product-apple.png"),
  },
];

export const missionProducts = coupangProducts.filter((product) =>
  ["tissue", "water", "rice", "detergent", "ramen", "shampoo"].includes(
    product.id,
  ),
);

export function searchProducts(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  return coupangProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(normalized) ||
      product.category.includes(normalized) ||
      product.searchTerms.some(
        (term) => term.includes(normalized) || normalized.includes(term),
      ),
  );
}

export function formatWon(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

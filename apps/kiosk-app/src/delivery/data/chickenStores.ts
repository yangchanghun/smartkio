export type ChickenStore = {
  id: string;
  name: string;
  rating: string;
  reviews: number;
  deliveryTime: string;
  deliveryFee: string;
  minimumOrder: string;
  distance: string;
  menu: [string, string, string, string];
};

export const CHICKEN_STORES: ChickenStore[] = [
  {
    id: "smart-chicken",
    name: "스마트치킨 은평점",
    rating: "4.9",
    reviews: 842,
    deliveryTime: "약 20분",
    deliveryFee: "배달팁 0원",
    minimumOrder: "최소주문 12,000원",
    distance: "620m",
    menu: ["🍗", "후라이드 치킨", "🌶️", "양념 치킨"],
  },
  {
    id: "happy-chicken",
    name: "행복통닭 불광점",
    rating: "4.8",
    reviews: 516,
    deliveryTime: "약 32분",
    deliveryFee: "배달팁 2,000원",
    minimumOrder: "최소주문 15,000원",
    distance: "1.1km",
    menu: ["🍗", "옛날 통닭", "🍟", "감자튀김"],
  },
  {
    id: "crispy-chicken",
    name: "바삭한마리 연신내점",
    rating: "4.7",
    reviews: 391,
    deliveryTime: "약 27분",
    deliveryFee: "배달팁 1,500원",
    minimumOrder: "최소주문 14,000원",
    distance: "890m",
    menu: ["🍗", "크리스피 치킨", "🧀", "치즈볼"],
  },
];

import type { DeliveryAddress } from "../types";

export const SAMPLE_ADDRESSES: DeliveryAddress[] = [
  {
    id: "home",
    name: "스마트아파트 301동",
    roadAddress: "서울 서대문구 연희로 11길 10",
    detail: "301동 101호",
    request: "문 앞에 두고 노크해 주세요.",
  },
  {
    id: "family",
    name: "행복빌라",
    roadAddress: "서울 서대문구 연희로 27길 7",
    detail: "201호",
    request: "문 앞에 두고 초인종을 눌러 주세요.",
  },
  {
    id: "center",
    name: "스마트키오 교육센터",
    roadAddress: "서울 서대문구 연희로 684",
    detail: "1층 안내데스크",
    request: "도착하면 안내데스크에 맡겨 주세요.",
  },
];

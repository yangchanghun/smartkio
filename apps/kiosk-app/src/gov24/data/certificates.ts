import type { ImageSourcePropType } from "react-native";

export type Gov24Certificate = {
  id: string;
  name: string;
  image: ImageSourcePropType;
};

export const GOV24_CERTIFICATES: Gov24Certificate[] = [
  { id: "kakaobank", name: "카카오뱅크", image: require("../../../assets/goverment/certificates/nh_files/kakaobank.png") },
  { id: "kb", name: "국민인증서", image: require("../../../assets/goverment/certificates/kb.png") },
  { id: "pass", name: "통신사PASS", image: require("../../../assets/goverment/certificates/nh_files/okpass.jpg") },
  { id: "naver", name: "네이버", image: require("../../../assets/goverment/certificates/naver.jpg") },
  { id: "kakaotalk", name: "카카오톡", image: require("../../../assets/goverment/certificates/kakaotalk.png") },
  { id: "woori", name: "우리인증서", image: require("../../../assets/goverment/certificates/uri.png") },
  { id: "nh", name: "NH인증서", image: require("../../../assets/goverment/certificates/nh_files/nh.jpg") },
  { id: "samsung-pass", name: "삼성패스", image: require("../../../assets/goverment/certificates/sp.jpg") },
  { id: "bankwallet", name: "뱅크월렛", image: require("../../../assets/goverment/certificates/wallet.png") },
  { id: "toss", name: "토스", image: require("../../../assets/goverment/certificates/nh_files/toss.jpg") },
  { id: "dream", name: "드림인증", image: require("../../../assets/goverment/certificates/dream.jpg") },
  { id: "hana", name: "하나인증서", image: require("../../../assets/goverment/certificates/hana.jpg") },
  { id: "shinhan", name: "신한인증서", image: require("../../../assets/goverment/certificates/sinhan.jpg") },
];

import type { ImageSourcePropType } from "react-native";

// 이미지를 추가한 뒤 null을 아래 예시처럼 바꾸면 화면에 바로 표시됩니다.
// portrait: require("../../../assets/goverment/mobile-id/portrait.png")
// qr: require("../../../assets/goverment/mobile-id/qr.png")
// carriers.skt: require("../../../assets/goverment/mobile-id/skt.png")
export const mobileIdAssets: {
  portrait: ImageSourcePropType | null;
  qr: ImageSourcePropType | null;
  carriers: Record<"skt" | "kt" | "lgu" | "mvno", ImageSourcePropType | null>;
} = {
  portrait: require("../../../assets/goverment/mobile-id/portrait.png"),
  qr: require("../../../assets/goverment/mobile-id/qr.png"),
  carriers: {
    skt: require("../../../assets/goverment/mobile-id/skt.png"),
    kt: require("../../../assets/goverment/mobile-id/kt.png"),
    lgu: require("../../../assets/goverment/mobile-id/lgu.png"),
    mvno: require("../../../assets/goverment/mobile-id/mvno.png"),
  },
};

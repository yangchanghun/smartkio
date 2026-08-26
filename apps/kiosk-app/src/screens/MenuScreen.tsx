import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  useWindowDimensions,
} from "react-native";
import type { Session } from "../hooks/useKioskSession";
const items = [
  //   ["miryang", "밀양카드앱관련가이드", "#ef62ba", "miryang-card.png"],
  //   ["ddaeng", "땡겨요", "#ef62ba", "ddaeng-geo.png"],
  //   ["jeju", "제주항공", "#ff9400", "jeju-air.png"],
  //   ["ktx", "KTX 예약 앱", "#31bdbc", "ktx.png"],
  //   ["phone", "스마트폰 기본 사용\n가이드", "#31bdbc", "smartphone-guide.png"],
  ["voice", "보이스피싱퀴즈", "#ff6a6d", "voice-phishing.png"],
  ["baemin", "배달의민족", "#31bdbc", "baemin.png"],
  ["kakao", "카카오톡", "#fee500"],
  //   ["coupang", "쿠팡", "#447fe9", "coupang.png"],
  //   ["pay", "카카오페이", "#fee500", "kakao-pay.png"],
  ["taxi", "카카오T", "#fee500", "kakao-t.png"],
  //   ["naver", "네이버지도", "#20bd3b", "naver-map.png"],
] as const;
export function MenuScreen({
  session,
  onLogout,
  onStart,
  onStartDelivery,
  onStartTaxi,
}: {
  session: Session;
  onLogout: () => void;
  onStart: () => void;
  onStartDelivery: () => void;
  onStartTaxi: () => void;
}) {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  const isCompact = width < 1000;
  const columns = isMobile ? 2 : isCompact ? 3 : 4;
  const gridPadding = isMobile ? 6 : 10;
  const cardMargin = isMobile ? 5 : 9;
  const cardWidth =
    (width - gridPadding * 2 - cardMargin * 2 * columns) / columns;
  const expiry = new Date(session.expires_at).toLocaleDateString("ko-KR");
  return (
    <SafeAreaView style={s.page}>
      <View style={[s.header, isMobile && s.headerMobile]}>
        <View style={[s.logoArea, isMobile && s.logoAreaMobile]}>
          <Image
            source={require("../../assets/branding/smartkio-logo.png")}
            style={[s.logoImage, isMobile && s.logoImageMobile]}
            resizeMode="contain"
          />
        </View>
        <View style={[s.account, isMobile && s.accountMobile]}>
          <Text style={[s.name, isMobile && s.accountTextMobile]}>
            {session.username} 계정
          </Text>
          <Text style={[s.expiry, isMobile && s.accountTextMobile]}>
            ~ {expiry}까지
          </Text>
          <Pressable onPress={onLogout}>
            <Text style={[s.logout, isMobile && s.logoutMobile]}>로그아웃</Text>
          </Pressable>
        </View>
      </View>
      <FlatList
        key={`menu-${columns}`}
        data={items}
        numColumns={columns}
        keyExtractor={([id]) => id}
        contentContainerStyle={[s.grid, { padding: gridPadding }]}
        renderItem={({ item: [id, title, color] }) => (
          <Pressable
            style={[
              s.card,
              isCompact && s.cardCompact,
              isMobile && s.cardMobile,
              { width: cardWidth, margin: cardMargin, backgroundColor: color },
            ]}
            onPress={
              id === "kakao"
                ? onStart
                : id === "baemin"
                  ? onStartDelivery
                  : id === "taxi"
                    ? onStartTaxi
                    : undefined
            }
          >
            <View
              style={[
                s.iconBox,
                isCompact && s.iconBoxCompact,
                isMobile && s.iconBoxMobile,
              ]}
            >
              {id === "kakao" ? (
                <Image
                  source={require("../../assets/menu/kakaotalk.png")}
                  style={[
                    s.menuIcon,
                    isCompact && s.menuIconCompact,
                    isMobile && s.menuIconMobile,
                  ]}
                  resizeMode="contain"
                />
              ) : id === "baemin" ? (
                <View style={s.deliveryIcon}>
                  <Text style={s.deliveryIconText}>배민</Text>
                </View>
              ) : id === "taxi" ? (
                <View style={s.taxiIcon}>
                  <Text style={s.taxiIconText}>T</Text>
                </View>
              ) : null}
            </View>
            <Text
              style={[
                s.title,
                isCompact && s.titleCompact,
                isMobile && s.titleMobile,
                id === "kakao" && s.dark,
              ]}
            >
              {title}
            </Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#aeaeae" },
  header: { height: 245, position: "relative", justifyContent: "center" },
  headerMobile: { height: 190 },
  logoArea: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 38,
    bottom: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  logoAreaMobile: { top: 8, bottom: 66 },
  logoImage: { width: 470, height: 150 },
  logoImageMobile: { width: 230, height: 95 },
  logo: { fontSize: 61, fontWeight: "900", letterSpacing: 3, color: "#167253" },
  logoSub: { fontSize: 16, letterSpacing: 7, color: "#174f3f" },
  logoHint: { fontSize: 10, color: "#555", marginTop: 7 },
  account: {
    position: "absolute",
    top: 100,
    right: 20,
    alignItems: "flex-end",
  },
  accountMobile: {
    left: 12,
    right: 12,
    top: undefined,
    bottom: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  name: {
    padding: 10,
    backgroundColor: "#ddd",
    borderRadius: 13,
    fontSize: 18,
  },
  accountTextMobile: {
    padding: 7,
    borderRadius: 9,
    fontSize: 12,
    marginTop: 0,
  },
  expiry: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "#8c8c8c",
    borderRadius: 11,
    color: "white",
    fontSize: 18,
  },
  logout: { marginTop: 7, fontWeight: "800" },
  logoutMobile: { marginTop: 0, padding: 7, fontSize: 12 },
  grid: { paddingBottom: 24 },
  card: {
    minHeight: 275,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,.22)",
    elevation: 3,
  },
  cardCompact: { minHeight: 220, padding: 14 },
  cardMobile: { minHeight: 168, borderRadius: 15, borderWidth: 2, padding: 10 },
  iconBox: {
    width: 120,
    height: 120,

    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  iconBoxCompact: { width: 92, height: 92, marginBottom: 14 },
  iconBoxMobile: { width: 68, height: 68, marginBottom: 8 },
  iconHint: { fontSize: 11, textAlign: "center", color: "#666" },
  menuIcon: { width: 112, height: 112 },
  menuIconCompact: { width: 86, height: 86 },
  menuIconMobile: { width: 64, height: 64 },
  title: {
    fontSize: 21,
    fontWeight: "900",
    color: "white",
    textAlign: "center",
    lineHeight: 28,
  },
  titleCompact: { fontSize: 19, lineHeight: 25 },
  titleMobile: { fontSize: 16, lineHeight: 21 },
  dark: { color: "#3c1e1e" },
  deliveryIcon: {
    width: 78,
    height: 78,
    borderRadius: 22,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-4deg" }],
  },
  deliveryIconText: { color: "#18aaa2", fontSize: 25, fontWeight: "900" },
  taxiIcon: { width: 78, height: 78, borderRadius: 24, backgroundColor: "#1c1c1c", alignItems: "center", justifyContent: "center" },
  taxiIconText: { color: "#fee500", fontSize: 45, fontWeight: "900" },
});

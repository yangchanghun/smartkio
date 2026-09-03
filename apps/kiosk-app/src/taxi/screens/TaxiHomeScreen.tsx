import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const services = [
  ["🚕", "택시"],
  ["📅", "택시예약"],
  ["🚙", "렌터카"],
  ["🛵", "바이크"],
  ["🎟️", "바이크30분"],
  ["🚆", "기차/버스"],
] as const;

export function TaxiHomeScreen({
  onBack,
  onTaxi,
}: {
  onBack: () => void;
  onTaxi: () => void;
}) {
  const unavailable = (label: string) =>
    Alert.alert(
      "연습 안내",
      `이번 연습에서는 택시를 선택해 주세요.\n${label} 연습은 준비 중이에요.`,
    );
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.hero}>
          <View style={s.topRow}>
            <Pressable
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="메뉴로 돌아가기"
            >
              <Text style={s.back}>‹</Text>
            </Pressable>
            <Text style={s.logo}>kakao T</Text>
            <Text style={s.bell}>♧</Text>
          </View>
          <Pressable
            style={s.search}
            onPress={onTaxi}
            accessibilityRole="button"
            accessibilityLabel="택시 출발지와 목적지 설정"
          >
            <Text style={s.searchText}>어디로 갈까요?</Text>
            <Text style={s.quick}>⊕ 집　⊕ 회사</Text>
          </Pressable>
          <View style={s.promo}>
            <View>
              <Text style={s.promoTitle}>안전하고 편안한 이동</Text>
              <Text style={s.promoSub}>카카오 T 택시 호출을 연습해 보세요</Text>
            </View>
            <Text style={s.promoCar}>🚕</Text>
          </View>
        </View>

        <View style={s.card}>
          <View style={s.tabs}>
            <Text style={s.tabActive}>이동할 때</Text>
            <Text style={s.tab}>운전할 때</Text>
            <Text style={s.tab}>물건보낼 때</Text>
            <Text style={s.tab}>해외갈 때</Text>
          </View>
          <View style={s.serviceGrid}>
            {services.map(([icon, label]) => (
              <Pressable
                key={label}
                style={s.service}
                onPress={label === "택시" ? onTaxi : () => unavailable(label)}
              >
                <Text style={s.serviceIcon}>{icon}</Text>
                <Text style={s.serviceLabel}>{label}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable style={s.allServices}>
            <Text style={s.allText}>전체 서비스 보기 〉</Text>
          </Pressable>
        </View>

        <View style={s.frequent}>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>자주 쓰는 서비스</Text>
            <Text style={s.edit}>편집</Text>
          </View>
          <View style={s.frequentRow}>
            <View style={s.favorite}>
              <Text style={s.favoriteIcon}>🚕</Text>
              <Text style={s.favoriteText}>택시</Text>
            </View>
            <View style={s.favorite}>
              <Text style={s.favoriteIcon}>🚙</Text>
              <Text style={s.favoriteText}>렌터카</Text>
            </View>
            <View style={s.add}>
              <Text style={s.pin}>＋</Text>
              <Text style={s.addText}>추가</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={s.bottomNav}>
        {[
          ["◉", "전체보기"],
          ["▣", "비즈니스"],
          ["✣", "홈"],
          ["♧", "이용/알림"],
          ["♙", "내 정보"],
        ].map(([icon, label]) => (
          <View key={label} style={s.navItem}>
            <Text style={[s.navIcon, label === "홈" && s.active]}>{icon}</Text>
            <Text style={[s.navText, label === "홈" && s.active]}>{label}</Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f1f2f4" },
  content: { paddingBottom: 110 },
  hero: { backgroundColor: "#fff", padding: 22, paddingTop: 14 },
  topRow: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  back: { fontSize: 48, lineHeight: 48, color: "#252b35" },
  logo: { fontSize: 25, fontWeight: "900", color: "#222" },
  bell: { fontSize: 30, color: "#333" },
  search: {
    marginTop: 15,
    borderWidth: 2,
    borderColor: "#252525",
    borderRadius: 24,
    minHeight: 72,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchText: { fontSize: 25, fontWeight: "700", color: "#6d7480" },
  quick: { fontSize: 16, fontWeight: "700", color: "#565d69" },
  promo: {
    marginTop: 24,
    borderRadius: 18,
    padding: 22,
    backgroundColor: "#ffe032",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  promoTitle: { fontSize: 20, fontWeight: "900", color: "#2d3035" },
  promoSub: { fontSize: 14, color: "#6c6250", marginTop: 7 },
  promoCar: { fontSize: 52 },
  card: {
    marginTop: 10,
    backgroundColor: "white",
    borderRadius: 24,
    paddingTop: 20,
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderColor: "#eceef0",
  },
  tab: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: "#777",
    paddingBottom: 16,
  },
  tabActive: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "900",
    color: "#1675e7",
    paddingBottom: 16,
    borderBottomWidth: 3,
    borderColor: "#1675e7",
  },
  serviceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingVertical: 22,
    paddingHorizontal: 14,
  },
  service: { width: "33.333%", alignItems: "center", paddingVertical: 12 },
  serviceIcon: { fontSize: 43 },
  serviceLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#303640",
    marginTop: 8,
  },
  allServices: {
    borderTopWidth: 1,
    borderColor: "#eee",
    padding: 18,
    alignItems: "center",
  },
  allText: { fontSize: 17, fontWeight: "800" },
  frequent: {
    backgroundColor: "white",
    borderRadius: 24,
    marginTop: 12,
    padding: 22,
  },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: { fontSize: 22, fontWeight: "900" },
  edit: { fontSize: 16, color: "#777" },
  frequentRow: { flexDirection: "row", gap: 24, marginTop: 22 },
  favorite: { alignItems: "center" },
  favoriteIcon: {
    fontSize: 42,
    backgroundColor: "#f3f4f6",
    padding: 13,
    borderRadius: 18,
  },
  favoriteText: { fontSize: 15, fontWeight: "700", marginTop: 7 },
  add: { alignItems: "center" },
  pin: {
    fontSize: 34,
    color: "#aaa",
    backgroundColor: "#f1f2f4",
    padding: 13,
    borderRadius: 18,
  },
  addText: { fontSize: 15, color: "#999", marginTop: 7 },
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 88,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderColor: "#e5e5e5",
    flexDirection: "row",
    alignItems: "center",
  },
  navItem: { flex: 1, alignItems: "center" },
  navIcon: { fontSize: 24, color: "#343a43" },
  navText: { fontSize: 12, color: "#343a43", marginTop: 5 },
  active: { color: "#e21e38", fontWeight: "900" },
});

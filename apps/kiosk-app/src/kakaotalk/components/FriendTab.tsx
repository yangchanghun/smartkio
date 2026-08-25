import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export type FriendTabTarget = "add" | "friend" | "settings";
export function FriendTab({
  target,
  onAdd,
  onFriend,
  onSettings,
  onBack,
  friendAdded = false,
}: {
  target: FriendTabTarget;
  onAdd: () => void;
  onFriend: () => void;
  onSettings: () => void;
  onBack?: () => void;
  friendAdded?: boolean;
}) {
  const profiles = friendAdded ? ["내 프로필", "홍길동"] : ["내 프로필"];
  return (
    <View style={s.page}>
      {/* <View style={s.status}>
        <Text>2:58</Text>
        <View style={s.island} />
        <Text>▮▮▮ LTE 37</Text>
      </View> */}
      <Pressable style={s.backMenu} onPress={onBack}>
        <Text style={s.backMenuText}>‹ 메뉴</Text>
      </Pressable>
      <View style={s.header}>
        <View style={s.me}>
          <View style={s.avatar}>
            <Text>👤</Text>
          </View>
          <Text style={s.meName}>SmartKio</Text>
        </View>
        <View style={s.actions}>
          <Text>⌕</Text>
          <Pressable style={target === "add" && s.glow} onPress={onAdd}>
            <Text>♙＋</Text>
          </Pressable>
          <Text>🔖</Text>
          <Pressable
            style={target === "settings" && s.glow}
            onPress={onSettings}
          >
            <Text>⚙</Text>
          </Pressable>
        </View>
      </View>
      <View style={s.tabs}>
        <Text style={s.activeTab}>친구</Text>
        <Text style={s.newsTab}>
          소식 <Text style={s.badge}>N</Text>
        </Text>
      </View>
      <View style={s.banner}>
        <Text style={s.pin}>● 교육용 키오스크</Text>
        <Text style={s.bannerTitle}>레아비전</Text>
        <Text style={s.bannerSub}>1644-4907</Text>
        <Text style={s.doctor}>👩‍⚕️</Text>
      </View>
      <Text style={s.sectionTitle}>업데이트 프로필</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.profiles}
      >
        {profiles.map((name, index) => (
          <View key={name} style={s.profile}>
            <View style={[s.profileAvatar, index === 0 && s.primaryAvatar]}>
              <Text>{index === 0 ? "👤" : index === 3 ? "AD" : "🙂"}</Text>
            </View>
            <Text numberOfLines={1} style={s.profileName}>
              {name}
            </Text>
          </View>
        ))}
      </ScrollView>
      <View style={s.line} />
      <Text style={s.sectionTitle}>친구 {friendAdded ? 1 : 0}</Text>
      {friendAdded ? (
        <Pressable
          style={[s.friendRow, target === "friend" && s.glow]}
          onPress={onFriend}
        >
          <View style={s.friendAvatar}>
            <Text>👤</Text>
          </View>
          <View>
            <Text style={s.friendName}>홍길동</Text>
            <Text style={s.friendSub}>카카오톡 친구</Text>
          </View>
        </Pressable>
      ) : (
        <Text style={s.empty}>
          친구 추가 버튼을 눌러 홍길동을 친구로 추가해 보세요.
        </Text>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "white", paddingBottom: 65 },
  status: {
    height: 58,
    paddingHorizontal: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: 18,
    fontWeight: "900",
  },
  island: {
    width: 190,
    height: 34,
    borderRadius: 18,
    backgroundColor: "black",
  },
  backMenu: {
    alignSelf: "flex-start",
    marginLeft: 18,
    marginTop: 2,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
  },
  backMenuText: { fontSize: 16, fontWeight: "800", color: "#333" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 26,
    paddingVertical: 15,
  },
  me: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: "#a6c2ec",
    alignItems: "center",
    justifyContent: "center",
  },
  meName: { fontSize: 29, fontWeight: "900" },
  actions: { flexDirection: "row", alignItems: "center", gap: 17 },
  tabs: { flexDirection: "row", gap: 15, padding: 26 },
  activeTab: {
    backgroundColor: "#171717",
    color: "white",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 28,
    fontSize: 21,
    fontWeight: "900",
  },
  newsTab: {
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 28,
    fontSize: 21,
    fontWeight: "900",
  },
  badge: {
    backgroundColor: "#ff5b2c",
    color: "white",
    borderRadius: 20,
    paddingHorizontal: 7,
  },
  banner: {
    marginHorizontal: 26,
    backgroundColor: "#f3f3f3",
    borderRadius: 22,
    padding: 19,
    position: "relative",
  },
  pin: { fontSize: 15, color: "#2874d6", fontWeight: "800" },
  bannerTitle: { fontSize: 20, fontWeight: "900", marginTop: 5 },
  bannerSub: { fontSize: 14, color: "#888", marginTop: 4 },
  doctor: { position: "absolute", right: 24, top: 26, fontSize: 38 },
  sectionTitle: {
    fontSize: 20,
    color: "#777",
    marginHorizontal: 26,
    marginTop: 28,
    marginBottom: 15,
  },
  profiles: { paddingHorizontal: 26, gap: 16 },
  profile: { width: 65, alignItems: "center" },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 24,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryAvatar: { backgroundColor: "#8dcada" },
  profileName: { fontSize: 12, marginTop: 7 },
  line: {
    height: 1,
    backgroundColor: "#eee",
    marginHorizontal: 26,
    marginTop: 25,
  },
  friendRow: {
    marginHorizontal: 26,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    borderRadius: 14,
  },
  friendAvatar: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: "#a6c2ec",
    alignItems: "center",
    justifyContent: "center",
  },
  friendName: { fontSize: 20, fontWeight: "800" },
  friendSub: { fontSize: 14, color: "#888", marginTop: 4 },
  empty: { color: "#888", marginHorizontal: 26, fontSize: 16 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    marginHorizontal: 26,
  },
  recommend: { fontSize: 35 },
  chevron: { marginLeft: "auto", fontSize: 30, color: "#777" },
  bottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 65,
    backgroundColor: "#fafafa",
    borderTopWidth: 1,
    borderColor: "#ddd",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  glow: {
    borderWidth: 3,
    borderColor: "#ff4e33",
    backgroundColor: "#fff9a8",
    borderRadius: 12,
    padding: 4,
    elevation: 10,
  },
});

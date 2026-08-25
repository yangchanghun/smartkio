import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
export type KakaoScreen = "signup" | "friend" | "chat" | "block";
const lessons: {
  id: KakaoScreen;
  no: string;
  title: string;
  description: string;
}[] = [
  {
    id: "signup",
    no: "01",
    title: "카카오톡 회원가입 따라하기",
    description: "카카오계정을 만들고 프로필을 설정해요",
  },
  {
    id: "friend",
    no: "02",
    title: "카카오톡 친구 추가하기",
    description: "QR, 전화번호, ID로 친구를 추가해요",
  },
  {
    id: "chat",
    no: "03",
    title: "카카오톡 친구랑 대화하기",
    description: "메시지와 사진을 보내봐요",
  },
  {
    id: "block",
    no: "04",
    title: "카카오톡 상대방 차단하기",
    description: "친구를 차단하고 다시 해제해요",
  },
];
export function KakaoTutorialScreen({
  onBack,
  onSelect,
}: {
  onBack: () => void;
  onSelect: (screen: KakaoScreen) => void;
}) {
  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <Pressable onPress={onBack}>
          <Text style={s.back}>← 메인</Text>
        </Pressable>
        <Text style={s.logo}>kakao</Text>
        <View style={s.space} />
      </View>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.body}
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled"
      >
        <Text style={s.title}>카카오톡 연습하기</Text>
        <Text style={s.desc}>
          원하는 항목을 선택해 실제 화면처럼 따라 해보세요.
        </Text>
        <View style={s.list}>
          {lessons.map((x) => (
            <Pressable key={x.id} style={s.card} onPress={() => onSelect(x.id)}>
              <Text style={s.no}>{x.no}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.cardTitle}>{x.title}</Text>
                <Text style={s.cardDesc}>{x.description}</Text>
              </View>
              <Text style={s.arrow}>→</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f7f7f7" },
  scroll: { flex: 1 },
  header: {
    height: 75,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  back: { fontWeight: "900", color: "#3c1e1e" },
  logo: { fontSize: 31, color: "#3c1e1e" },
  space: { width: 50 },
  body: { flexGrow: 1, padding: 35, paddingBottom: 48, alignItems: "center" },
  title: { fontSize: 34, fontWeight: "900" },
  desc: { fontSize: 17, color: "#70675f", marginTop: 10 },
  list: { width: "100%", maxWidth: 820, marginTop: 32, gap: 13 },
  card: {
    minHeight: 112,
    backgroundColor: "white",
    borderRadius: 14,
    padding: 22,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    borderLeftWidth: 9,
    borderColor: "#fee500",
  },
  no: { fontSize: 26, fontWeight: "900", color: "#3c1e1e", width: 65 },
  cardTitle: { fontSize: 20, fontWeight: "900" },
  cardDesc: { fontSize: 15, color: "#70675f", marginTop: 6 },
  arrow: { fontSize: 28, fontWeight: "900", color: "#3c1e1e" },
});

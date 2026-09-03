import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export function Gov24HubScreen({
  onBack,
  onLogin,
  onTranscript,
  onMobileId,
}: {
  onBack: () => void;
  onLogin: () => void;
  onTranscript: () => void;
  onMobileId: () => void;
}) {
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.page}>
        <View style={s.header}>
          <Pressable onPress={onBack} style={s.back}>
            <Text style={s.backText}>‹</Text>
          </Pressable>
          <Image
            source={require("../../../assets/goverment/goverment.png")}
            style={s.logo}
            resizeMode="contain"
          />
          <View style={s.back} />
        </View>
        <Text style={s.title}>정부24 연습하기</Text>
        <Text style={s.sub}>연습할 내용을 하나 선택해 주세요.</Text>
        <View style={s.cards}>
          <Card
            icon="🔐"
            title="로그인 연습"
            description="간편인증과 카카오 인증서로 로그인하는 방법을 연습해요."
            onPress={onLogin}
          />
          <Card
            icon="📄"
            title="주민등록표 초본 발급"
            description="초본을 신청하고 문서로 출력하는 방법까지 연습해요."
            onPress={onTranscript}
          />
          <Card
            icon="📱"
            title="주민등록증 모바일 확인"
            description="PASS 인증부터 모바일 주민등록증과 QR 확인까지 연습해요."
            onPress={onMobileId}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
function Card({
  icon,
  title,
  description,
  onPress,
}: {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={s.card} onPress={onPress}>
      <View style={s.icon}>
        <Text style={s.iconText}>{icon}</Text>
      </View>
      <View style={s.copy}>
        <Text style={s.cardTitle}>{title}</Text>
        <Text style={s.desc}>{description}</Text>
      </View>
      <Text style={s.chevron}>›</Text>
    </Pressable>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f4f7fb" },
  page: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 950,
    alignSelf: "center",
    padding: 24,
    paddingBottom: 48,
  },
  header: {
    height: 80,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  back: {
    width: 54,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: { fontSize: 46, color: "#1b2d45" },
  logo: { width: 120, height: 68 },
  title: { fontSize: 34, fontWeight: "900", color: "#172b45", marginTop: 30 },
  sub: { fontSize: 19, color: "#667085", marginTop: 10 },
  cards: { gap: 18, marginTop: 32 },
  card: {
    minHeight: 150,
    backgroundColor: "white",
    borderRadius: 22,
    padding: 22,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e5ebf2",
  },
  icon: {
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: "#eaf3ff",
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { fontSize: 40 },
  copy: { flex: 1, marginHorizontal: 22 },
  cardTitle: { fontSize: 25, fontWeight: "900", color: "#172b45" },
  desc: { fontSize: 17, lineHeight: 25, color: "#667085", marginTop: 8 },
  chevron: { fontSize: 42, color: "#8c98a8" },
});

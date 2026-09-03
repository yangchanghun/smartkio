import { Image, Pressable, SafeAreaView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { CoupangLogo } from "../components/CoupangUi";

export function CoupangHubScreen({ onBack, onSignup, onShopping }: { onBack: () => void; onSignup: () => void; onShopping: () => void }) {
  const { width } = useWindowDimensions();
  const compact = width < 650;
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}><Pressable style={styles.back} onPress={onBack}><Text style={styles.backText}>‹</Text></Pressable><Text style={styles.headerTitle}>쿠팡 연습하기</Text></View>
      <View style={[styles.body, compact && styles.bodyCompact]}>
        <CoupangLogo />
        <Text style={styles.title}>어떤 연습을 해볼까요?</Text>
        <Text style={styles.subtitle}>원하는 연습을 선택하면 음성으로 하나씩 알려드려요.</Text>
        <View style={[styles.cards, compact && styles.cardsCompact]}>
          <Pressable accessibilityRole="button" style={[styles.card, styles.signup, compact && styles.cardCompact]} onPress={onSignup}>
            <View style={[styles.iconCircle, compact && styles.circleCompact]}><Text style={[styles.icon, compact && styles.iconCompact]}>👤</Text></View><Text style={[styles.cardTitle, compact && styles.cardTitleCompact]}>회원가입 연습</Text><Text style={[styles.cardText, compact && styles.cardTextCompact]}>약관 동의부터 휴대폰번호 로그인까지 연습해요.</Text><Text style={styles.start}>시작하기  ›</Text>
          </Pressable>
          <Pressable accessibilityRole="button" style={[styles.card, styles.shopping, compact && styles.cardCompact]} onPress={onShopping}>
            <View style={[styles.productCircle, compact && styles.circleCompact]}><Image source={require("../../../assets/coupang/lavender-tissue-v2.png")} style={[styles.product, compact && styles.productCompact]} resizeMode="contain" /></View><Text style={[styles.cardTitle, compact && styles.cardTitleCompact]}>상품 구매 연습</Text><Text style={[styles.cardText, compact && styles.cardTextCompact]}>상품을 검색하고 바로구매와 주문 확인을 연습해요.</Text><Text style={styles.start}>시작하기  ›</Text>
          </Pressable>
        </View>
        <View style={styles.notice}><Text style={styles.noticeIcon}>🛡️</Text><Text style={styles.noticeText}>연습용 화면이에요. 실제 회원가입이나 결제는 진행되지 않습니다.</Text></View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f5f6f8" },
  header: { height: 78, backgroundColor: "white", flexDirection: "row", alignItems: "center", justifyContent: "center", borderBottomWidth: 1, borderBottomColor: "#e4e7eb" },
  back: { position: "absolute", left: 20, width: 52, height: 52, justifyContent: "center" }, backText: { fontSize: 48, color: "#172033" }, headerTitle: { fontSize: 24, fontWeight: "900", color: "#172033" },
  body: { flex: 1, padding: 40, alignItems: "center", justifyContent: "center" }, bodyCompact: { padding: 18, justifyContent: "flex-start" },
  title: { marginTop: 28, fontSize: 32, fontWeight: "900", color: "#172033" }, subtitle: { marginTop: 10, marginBottom: 32, fontSize: 18, color: "#687180", textAlign: "center" },
  cards: { width: "100%", maxWidth: 1000, flexDirection: "row", gap: 24 }, cardsCompact: { flexDirection: "row", gap: 10 },
  card: { flex: 1, minHeight: 330, borderRadius: 24, padding: 30, alignItems: "center", justifyContent: "center", borderWidth: 2, elevation: 5 },
  cardCompact: { minHeight: 360, paddingHorizontal: 10, paddingVertical: 18, borderRadius: 18 },
  signup: { backgroundColor: "#eef5ff", borderColor: "#bbd5ff" }, shopping: { backgroundColor: "white", borderColor: "#d9e4f6" },
  iconCircle: { width: 110, height: 110, borderRadius: 55, backgroundColor: "white", alignItems: "center", justifyContent: "center" }, icon: { fontSize: 52 },
  circleCompact: { width: 82, height: 82, borderRadius: 41 }, iconCompact: { fontSize: 38 },
  productCircle: { width: 130, height: 110, borderRadius: 28, backgroundColor: "#f6f2ff", alignItems: "center", justifyContent: "center" }, product: { width: 116, height: 100 },
  productCompact: { width: 78, height: 72 },
  cardTitle: { marginTop: 20, fontSize: 27, fontWeight: "900", color: "#172033" }, cardText: { marginTop: 10, fontSize: 17, lineHeight: 25, color: "#606a78", textAlign: "center" }, start: { marginTop: 20, color: "#3478eb", fontSize: 19, fontWeight: "900" },
  cardTitleCompact: { fontSize: 20, textAlign: "center" }, cardTextCompact: { fontSize: 14, lineHeight: 20 },
  notice: { maxWidth: 850, marginTop: 30, borderRadius: 13, backgroundColor: "#fff8e8", paddingHorizontal: 20, paddingVertical: 15, flexDirection: "row", alignItems: "center" }, noticeIcon: { fontSize: 23, marginRight: 10 }, noticeText: { flex: 1, fontSize: 15, color: "#75623f" },
});

import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { KakaoMapView } from "../components/KakaoMapView";
import type { TaxiPlace } from "./TaxiDestinationScreen";

export function TaxiMatchedScreen({
  departure,
  onAgain,
  onHome,
}: {
  departure: TaxiPlace;
  onAgain: () => void;
  onHome: () => void;
}) {
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.map}>
        <KakaoMapView center={departure} />
        <View style={s.car}>
          <Text style={s.carIcon}>🚕</Text>
          <Text style={s.arrival}>3분 후 도착</Text>
        </View>
      </View>
      <View style={s.sheet}>
        <View style={s.success}>
          <Text style={s.check}>✓</Text>
          <View>
            <Text style={s.title}>택시가 잡혔어요!</Text>
            <Text style={s.subtitle}>기사님이 출발지로 이동 중이에요</Text>
          </View>
        </View>
        <View style={s.driver}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>김</Text>
          </View>
          <View style={s.driverInfo}>
            <Text style={s.driverName}>김카카오 기사님</Text>
            <Text style={s.carInfo}>서울 31바 8427 · 흰색 쏘나타</Text>
          </View>
          <Pressable style={s.call}>
            <Text style={s.callText}>☎</Text>
          </Pressable>
        </View>
        <View style={s.tip}>
          <Text style={s.tipTitle}>탑승 전 확인하세요</Text>
          <Text style={s.tipText}>
            차량 번호와 기사님 정보를 확인한 뒤 탑승하세요.
          </Text>
        </View>
        <Text style={s.practice}>
          연습을 완료했어요. 실제 택시는 호출되지 않았습니다.
        </Text>
        <View style={s.actions}>
          <Pressable style={s.again} onPress={onAgain}>
            <Text style={s.againText}>다시 연습하기</Text>
          </Pressable>
          <Pressable style={s.home} onPress={onHome}>
            <Text style={s.homeText}>처음으로</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "white" },
  map: { flex: 1, position: "relative" },
  car: { position: "absolute", top: "48%", left: "44%", alignItems: "center" },
  carIcon: { fontSize: 48 },
  arrival: {
    backgroundColor: "#202124",
    color: "white",
    fontSize: 14,
    fontWeight: "900",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: -4,
  },
  sheet: {
    backgroundColor: "white",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingTop: 26,
    elevation: 12,
  },
  success: { flexDirection: "row", alignItems: "center" },
  check: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e8f3ff",
    color: "#1677f9",
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 48,
    marginRight: 14,
  },
  title: { fontSize: 25, fontWeight: "900", color: "#20262e" },
  subtitle: { fontSize: 14, color: "#747c86", marginTop: 4 },
  driver: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f6f8",
    borderRadius: 18,
    padding: 16,
    marginTop: 22,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#dbe8f7",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 20, fontWeight: "900", color: "#3e5e83" },
  driverInfo: { flex: 1, marginLeft: 13 },
  driverName: { fontSize: 18, fontWeight: "900" },
  carInfo: { fontSize: 14, color: "#747c86", marginTop: 5 },
  call: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1677f9",
    alignItems: "center",
    justifyContent: "center",
  },
  callText: { fontSize: 22, color: "white" },
  tip: {
    marginTop: 16,
    borderRadius: 14,
    backgroundColor: "#fff8dc",
    padding: 14,
  },
  tipTitle: { fontSize: 15, fontWeight: "900" },
  tipText: { fontSize: 13, color: "#6c6550", marginTop: 5 },
  practice: { fontSize: 12, color: "#969ca5", marginTop: 12 },
  actions: { flexDirection: "row", gap: 10, marginTop: 18 },
  again: {
    flex: 1,
    height: 54,
    borderWidth: 1,
    borderColor: "#cfd4da",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  againText: { fontSize: 16, fontWeight: "800" },
  home: {
    flex: 1,
    height: 54,
    backgroundColor: "#fee500",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  homeText: { fontSize: 16, fontWeight: "900" },
});

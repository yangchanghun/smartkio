import { useEffect } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { KakaoMapView } from "../components/KakaoMapView";
import type { TaxiRoutePreview } from "../services/taxiApi";
import type { TaxiPlace } from "./TaxiDestinationScreen";
import type { TaxiVehicle } from "./TaxiMapScreen";

export function TaxiCallingScreen({
  departure,
  destination,
  vehicle,
  preview,
  onCancel,
  onMatched,
}: {
  departure: TaxiPlace;
  destination: TaxiPlace;
  vehicle: TaxiVehicle;
  preview: TaxiRoutePreview;
  onCancel: () => void;
  onMatched: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onMatched, 4500);
    return () => clearTimeout(timer);
  }, [onMatched]);
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.map}>
        <KakaoMapView center={departure} routePath={preview.path} />
        <View style={s.searching}>
          <ActivityIndicator size="large" color="#1677f9" />
          <Text style={s.searchTitle}>주변 택시를 찾고 있어요</Text>
          <Text style={s.searchText}>잠시만 기다려 주세요</Text>
        </View>
      </View>
      <View style={s.sheet}>
        <View style={s.handle} />
        <Text style={s.title}>
          {vehicle.icon} {vehicle.name} 호출 중...
        </Text>
        <Text style={s.route}>
          {departure.name}　→　{destination.name}
        </Text>
        <View style={s.steps}>
          <View style={s.stepActive} />
          <View style={s.stepActive} />
          <View style={s.step} />
        </View>
        <Text style={s.notice}>
          기사님에게 요청을 보내고 있어요. 이 화면은 연습용이며 실제 호출은
          발생하지 않습니다.
        </Text>
        <Pressable style={s.cancel} onPress={onCancel}>
          <Text style={s.cancelText}>호출 취소</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "white" },
  map: { flex: 1, position: "relative" },
  searching: {
    position: "absolute",
    top: "38%",
    left: 34,
    right: 34,
    borderRadius: 22,
    backgroundColor: "white",
    padding: 25,
    alignItems: "center",
    elevation: 10,
  },
  searchTitle: { fontSize: 21, fontWeight: "900", marginTop: 15 },
  searchText: { fontSize: 14, color: "#858b94", marginTop: 6 },
  sheet: {
    backgroundColor: "white",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingTop: 10,
    elevation: 12,
  },
  handle: {
    alignSelf: "center",
    width: 44,
    height: 4,
    backgroundColor: "#d0d3d7",
    borderRadius: 2,
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: "900" },
  route: { fontSize: 15, color: "#646c76", marginTop: 9 },
  steps: { flexDirection: "row", gap: 7, marginTop: 20 },
  stepActive: {
    height: 5,
    flex: 1,
    borderRadius: 3,
    backgroundColor: "#1677f9",
  },
  step: { height: 5, flex: 1, borderRadius: 3, backgroundColor: "#dfe3e8" },
  notice: { fontSize: 13, lineHeight: 20, color: "#858b94", marginTop: 16 },
  cancel: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#d5d9de",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  cancelText: { fontSize: 17, fontWeight: "800", color: "#4f5660" },
});

import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { KakaoMapView } from "../components/KakaoMapView";
import type { TaxiRoutePreview } from "../services/taxiApi";
import type { TaxiPlace } from "./TaxiDestinationScreen";
import type { TaxiVehicle } from "./TaxiMapScreen";

const won = (value: number) => `${value.toLocaleString("ko-KR")}원`;

export function TaxiCallConfirmScreen({
  departure,
  destination,
  vehicle,
  preview,
  onBack,
  onCall,
}: {
  departure: TaxiPlace;
  destination: TaxiPlace;
  vehicle: TaxiVehicle;
  preview: TaxiRoutePreview;
  onBack: () => void;
  onCall: () => void;
}) {
  const total = preview.taxi_fare + vehicle.surcharge;
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.map}>
        <KakaoMapView center={departure} routePath={preview.path} />
        <View style={s.routeHeader}>
          <Pressable onPress={onBack}>
            <Text style={s.close}>×</Text>
          </Pressable>
          <Text numberOfLines={1} style={s.routeText}>
            {departure.name}
          </Text>
          <Text style={s.arrow}>→</Text>
          <Text numberOfLines={1} style={s.routeText}>
            {destination.name}
          </Text>
        </View>
      </View>
      <View style={s.sheet}>
        <View style={s.handle} />
        <ScrollView
          style={s.content}
          contentContainerStyle={s.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={s.vehicleRow}>
            <Text style={s.vehicleIcon}>{vehicle.icon}</Text>
            <View style={s.vehicleInfo}>
              <Text style={s.vehicleName}>{vehicle.name}⌄</Text>
              <Text style={s.vehicleDesc}>{vehicle.description}</Text>
            </View>
          </View>
          <View style={s.sizes}>
            <Pressable style={s.sizeActive}>
              <Text style={s.sizeActiveText}>중형</Text>
            </Pressable>
            <Pressable
              style={s.size}
              onPress={() =>
                Alert.alert(
                  "연습 안내",
                  "이번 연습에서는 중형 차량으로 호출해 주세요.",
                )
              }
            >
              <Text style={s.sizeText}>대형</Text>
            </Pressable>
          </View>
          <Text style={s.section}>직접결제</Text>
          <Pressable
            style={s.row}
            onPress={() =>
              Alert.alert(
                "쿠폰·포인트",
                "사용할 쿠폰과 포인트가 없는 것으로 연습을 계속합니다.",
              )
            }
          >
            <Text style={s.link}>쿠폰</Text>
            <Text style={s.muted}>포인트 0P　›</Text>
          </Pressable>
          <View style={s.line} />
          <View style={s.row}>
            <Text style={s.rowTitle}>본인탑승　›</Text>
            <Text style={s.fare}>예상　{won(total)}</Text>
          </View>
          <Text style={s.disclaimer}>
            연습용 화면입니다. 실제 택시는 호출되지 않아요.
          </Text>
        </ScrollView>
        <Pressable
          style={s.callButton}
          onPress={onCall}
          accessibilityRole="button"
          accessibilityLabel={`${vehicle.name} 호출하기`}
        >
          <Text style={s.callText}>호출하기</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "white" },
  map: { height: "43%", position: "relative" },
  routeHeader: {
    position: "absolute",
    top: 20,
    left: 22,
    right: 22,
    height: 58,
    borderRadius: 29,
    backgroundColor: "white",
    elevation: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  close: { fontSize: 36, lineHeight: 38, marginRight: 12 },
  routeText: { flex: 1, fontSize: 16, fontWeight: "800", textAlign: "center" },
  arrow: { fontSize: 18, color: "#777", marginHorizontal: 8 },
  sheet: {
    flex: 1,
    marginTop: -18,
    backgroundColor: "white",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 24,
    paddingTop: 10,
    paddingBottom: 16,
    elevation: 12,
  },
  handle: {
    alignSelf: "center",
    width: 44,
    height: 4,
    backgroundColor: "#d0d3d7",
    borderRadius: 2,
    marginBottom: 12,
  },
  content: { flex: 1 },
  contentContainer: { paddingBottom: 12 },
  vehicleRow: { flexDirection: "row", alignItems: "center" },
  vehicleIcon: { fontSize: 48, width: 70 },
  vehicleInfo: { flex: 1 },
  vehicleName: { fontSize: 22, fontWeight: "900", color: "#20262e" },
  vehicleDesc: { fontSize: 14, color: "#858b94", marginTop: 4 },
  sizes: { flexDirection: "row", gap: 10, marginTop: 22 },
  sizeActive: {
    borderWidth: 2,
    borderColor: "#1677ff",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  size: {
    borderWidth: 1,
    borderColor: "#d6d9de",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  sizeActiveText: { color: "#1677ff", fontWeight: "900" },
  sizeText: { color: "#626a74", fontWeight: "700" },
  section: { fontSize: 16, fontWeight: "900", marginTop: 26, marginBottom: 8 },
  row: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  link: { color: "#1476ef", fontSize: 15, fontWeight: "800" },
  muted: { fontSize: 14, color: "#69717b" },
  line: { height: 1, backgroundColor: "#e9ebee" },
  rowTitle: { fontSize: 16, fontWeight: "700" },
  fare: { fontSize: 18, fontWeight: "900" },
  disclaimer: { fontSize: 12, color: "#999fa7", marginTop: 14 },
  callButton: {
    height: 62,
    borderRadius: 14,
    backgroundColor: "#1677f9",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    flexShrink: 0,
  },
  callText: { color: "white", fontSize: 20, fontWeight: "900" },
});

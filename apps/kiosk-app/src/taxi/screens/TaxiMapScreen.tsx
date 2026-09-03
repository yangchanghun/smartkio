import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { KakaoMapView } from "../components/KakaoMapView";
import {
  getTaxiRoutePreview,
  type TaxiRoutePreview,
} from "../services/taxiApi";
import type { TaxiPlace } from "./TaxiDestinationScreen";

export type TaxiVehicle = {
  id: "blue" | "general" | "venti" | "reserve";
  icon: string;
  name: string;
  description: string;
  surcharge: number;
  reservable?: boolean;
};

const VEHICLES: TaxiVehicle[] = [
  {
    id: "blue",
    icon: "🚕",
    name: "블루파트너스",
    description: "배차될 때까지 찾아주는 제휴 택시",
    surcharge: 1800,
  },
  {
    id: "general",
    icon: "🚖",
    name: "일반호출",
    description: "주변 택시 호출",
    surcharge: 0,
  },
  {
    id: "venti",
    icon: "🚐",
    name: "벤티 예약",
    description: "넓고 편안한 대형 차량",
    surcharge: 5200,
    reservable: true,
  },
  {
    id: "reserve",
    icon: "🚕",
    name: "블루파트너스 예약",
    description: "원하는 시간에 미리 예약",
    surcharge: 3500,
    reservable: true,
  },
];

const won = (value: number) => `${value.toLocaleString("ko-KR")}원`;
const minutes = (seconds: number) => Math.max(1, Math.ceil(seconds / 60));

export function TaxiMapScreen({
  departure,
  destination,
  token,
  onBack,
  onChangeDeparture,
  onChangeDestination,
  onSelectVehicle,
}: {
  departure: TaxiPlace;
  destination: TaxiPlace;
  token: string;
  onBack: () => void;
  onChangeDeparture: () => void;
  onChangeDestination: () => void;
  onSelectVehicle: (vehicle: TaxiVehicle, preview: TaxiRoutePreview) => void;
}) {
  const [preview, setPreview] = useState<TaxiRoutePreview | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getTaxiRoutePreview(departure, destination, token)
      .then((result) => active && setPreview(result))
      .catch(
        (reason: unknown) =>
          active &&
          setError(
            reason instanceof Error
              ? reason.message
              : "경로를 불러오지 못했습니다.",
          ),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [departure, destination, token]);
  const eta = useMemo(
    () => (preview ? minutes(preview.duration_seconds) : 0),
    [preview],
  );

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.map}>
        <KakaoMapView center={departure} routePath={preview?.path} />
        <View style={s.routeHeader}>
          <Pressable onPress={onBack}>
            <Text style={s.close}>×</Text>
          </Pressable>
          <Pressable style={s.headerPlace} onPress={onChangeDeparture}>
            <Text numberOfLines={1} style={s.headerText}>
              {departure.name}
            </Text>
          </Pressable>
          <Text style={s.arrow}>›</Text>
          <Pressable style={s.headerPlace} onPress={onChangeDestination}>
            <Text numberOfLines={1} style={s.headerText}>
              {destination.name}
            </Text>
          </Pressable>
        </View>
        {preview ? (
          <View style={s.etaBadge}>
            <Text style={s.etaLabel}>도착</Text>
            <Text style={s.etaText}>{eta}분 예상</Text>
          </View>
        ) : null}
      </View>
      <View style={s.sheet}>
        <View style={s.handle} />
        <View style={s.tabs}>
          <View style={s.tabActive}>
            <Text style={s.tabActiveText}>모든 호출</Text>
          </View>
          <Pressable
            style={s.tab}
            onPress={() =>
              Alert.alert(
                "연습 안내",
                "이번 미션은 지금 바로 부르는 ‘모든 호출’을 선택해 주세요.",
              )
            }
          >
            <Text style={s.tabText}>원하는 시간으로 호출</Text>
          </Pressable>
        </View>
        {loading ? (
          <View style={s.loading}>
            <ActivityIndicator size="large" color="#1677ff" />
            <Text style={s.loadingText}>
              주변 차량과 예상 요금을 찾고 있어요
            </Text>
          </View>
        ) : error ? (
          <View style={s.loading}>
            <Text style={s.error}>{error}</Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.list}
          >
            <Text style={s.guide}>차량을 하나 선택해 보세요</Text>
            {VEHICLES.map((vehicle) => (
              <Pressable
                key={vehicle.id}
                style={s.vehicle}
                onPress={() =>
                  vehicle.reservable
                    ? Alert.alert(
                        "예약 호출",
                        "예약 호출은 다음 연습에서 배워요. 지금은 일반호출 또는 블루파트너스를 선택해 주세요.",
                      )
                    : preview && onSelectVehicle(vehicle, preview)
                }
                accessibilityRole="button"
                accessibilityLabel={`${vehicle.name} 선택`}
              >
                <Text style={s.vehicleIcon}>{vehicle.icon}</Text>
                <View style={s.vehicleText}>
                  <Text style={s.vehicleName}>{vehicle.name}</Text>
                  <Text style={s.vehicleDesc}>{vehicle.description}</Text>
                  {vehicle.reservable ? (
                    <Text style={s.reserve}>◷ 10분 이후 출발</Text>
                  ) : null}
                </View>
                <Text style={s.price}>
                  {preview
                    ? `예상 ${won(preview.taxi_fare + vehicle.surcharge)}`
                    : ""}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "white" },
  map: { height: "43%", position: "relative" },
  routeHeader: {
    position: "absolute",
    top: 22,
    left: 20,
    right: 20,
    height: 62,
    borderRadius: 31,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    elevation: 9,
  },
  close: { fontSize: 38, lineHeight: 40, color: "#303640", marginRight: 12 },
  headerPlace: { flex: 1 },
  headerText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#2e343c",
    textAlign: "center",
  },
  arrow: { fontSize: 28, color: "#777", marginHorizontal: 5 },
  etaBadge: {
    position: "absolute",
    right: 24,
    bottom: 24,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    elevation: 5,
    overflow: "hidden",
  },
  etaLabel: {
    backgroundColor: "#e42635",
    color: "white",
    fontSize: 16,
    fontWeight: "900",
    padding: 12,
  },
  etaText: { fontSize: 16, fontWeight: "900", paddingHorizontal: 14 },
  sheet: {
    flex: 1,
    marginTop: -18,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    backgroundColor: "white",
    paddingTop: 10,
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
  tabs: {
    height: 58,
    marginHorizontal: 24,
    backgroundColor: "#f2f3f5",
    borderRadius: 29,
    flexDirection: "row",
    padding: 4,
  },
  tabActive: {
    flex: 1,
    borderRadius: 25,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  tab: { flex: 1, alignItems: "center", justifyContent: "center" },
  tabActiveText: { fontSize: 17, fontWeight: "900", color: "#252a31" },
  tabText: { fontSize: 16, fontWeight: "700", color: "#777e87" },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { fontSize: 15, color: "#777e87" },
  error: { fontSize: 15, color: "#d52b35", padding: 25, textAlign: "center" },
  list: { paddingHorizontal: 24, paddingBottom: 30 },
  guide: {
    fontSize: 14,
    color: "#5d6570",
    backgroundColor: "#eef4ff",
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginTop: 14,
  },
  vehicle: {
    minHeight: 112,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#eceef0",
    paddingVertical: 14,
  },
  vehicleIcon: { fontSize: 42, width: 62 },
  vehicleText: { flex: 1 },
  vehicleName: { fontSize: 19, fontWeight: "900", color: "#242a32" },
  vehicleDesc: { fontSize: 14, color: "#7b828c", marginTop: 5 },
  reserve: { fontSize: 13, color: "#1675e7", fontWeight: "800", marginTop: 6 },
  price: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2d333b",
    textAlign: "right",
  },
});

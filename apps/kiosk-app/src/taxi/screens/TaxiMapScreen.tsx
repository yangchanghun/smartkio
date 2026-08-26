import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
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

type Props = {
  departure: TaxiPlace;
  destination: TaxiPlace;
  token: string;
  onBack: () => void;
  onChangeDeparture: () => void;
  onChangeDestination: () => void;
};

const formatMinutes = (seconds: number) => Math.max(1, Math.ceil(seconds / 60));
const formatDistance = (meters: number) =>
  meters >= 1000 ? `${(meters / 1000).toFixed(1)}km` : `${meters}m`;
const formatWon = (value: number) => `${value.toLocaleString("ko-KR")}원`;

export function TaxiMapScreen({
  departure,
  destination,
  token,
  onBack,
  onChangeDeparture,
  onChangeDestination,
}: Props) {
  const [preview, setPreview] = useState<TaxiRoutePreview | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setPreview(null);
    getTaxiRoutePreview(departure, destination, token)
      .then((result) => active && setPreview(result))
      .catch((reason: unknown) => {
        if (active) {
          setError(
            reason instanceof Error
              ? reason.message
              : "예상 시간과 요금을 불러오지 못했습니다.",
          );
        }
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [departure, destination, token]);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.map}>
        <KakaoMapView center={departure} />
        <Pressable style={s.back} onPress={onBack} accessibilityLabel="뒤로 가기">
          <Text style={s.backText}>‹</Text>
        </Pressable>
        <View style={s.pin}>
          <Text style={s.pinText}>출발</Text>
        </View>
        <Pressable style={s.locate} accessibilityLabel="현재 위치로 이동">
          <Text style={s.locateText}>⌖</Text>
        </Pressable>
      </View>
      <View style={s.sheet}>
        <View style={s.handle} />
        <Pressable style={s.route} onPress={onChangeDeparture}>
          <Text style={s.startDot}>●</Text>
          <View style={s.routeText}>
            <Text style={s.label}>출발</Text>
            <Text style={s.value}>{departure.name}</Text>
            <Text style={s.address}>{departure.address}</Text>
          </View>
          <Text style={s.change}>변경</Text>
        </Pressable>
        <View style={s.line} />
        <Pressable style={s.route} onPress={onChangeDestination}>
          <Text style={s.endDot}>●</Text>
          <View style={s.routeText}>
            <Text style={s.label}>도착</Text>
            <Text style={s.value}>{destination.name}</Text>
            <Text style={s.address}>{destination.address}</Text>
          </View>
          <Text style={s.change}>변경</Text>
        </Pressable>

        <View style={s.previewCard}>
          {loading ? (
            <View style={s.loadingRow}>
              <ActivityIndicator color="#d9272e" />
              <Text style={s.loadingText}>예상 시간과 요금을 계산하고 있어요</Text>
            </View>
          ) : preview ? (
            <>
              <View style={s.previewMain}>
                <View>
                  <Text style={s.previewLabel}>예상 소요 시간</Text>
                  <Text style={s.previewTime}>약 {formatMinutes(preview.duration_seconds)}분</Text>
                </View>
                <View style={s.fareArea}>
                  <Text style={s.previewLabel}>예상 택시비</Text>
                  <Text style={s.previewFare}>{formatWon(preview.taxi_fare)}</Text>
                </View>
              </View>
              <Text style={s.previewSub}>
                이동 거리 {formatDistance(preview.distance_meters)}
                {preview.toll_fare > 0
                  ? ` · 통행료 ${formatWon(preview.toll_fare)}`
                  : " · 통행료 없음"}
              </Text>
              <Text style={s.notice}>교통 상황과 실제 운행 경로에 따라 달라질 수 있어요.</Text>
            </>
          ) : (
            <View>
              <Text style={s.errorTitle}>예상 요금을 표시하지 못했어요</Text>
              <Text style={s.errorText}>{error}</Text>
            </View>
          )}
        </View>

        <Pressable
          style={[s.next, (!preview || loading) && s.nextDisabled]}
          disabled={!preview || loading}
          accessibilityRole="button"
          accessibilityLabel="택시 선택하기"
        >
          <Text style={s.nextText}>택시 선택하기</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "white" },
  map: { flex: 1, position: "relative" },
  back: { position: "absolute", top: 24, left: 22, width: 56, height: 56, borderRadius: 28, backgroundColor: "white", alignItems: "center", justifyContent: "center", elevation: 6 },
  backText: { fontSize: 45, lineHeight: 45, color: "#29303a" },
  pin: { position: "absolute", top: "51%", left: "45%", backgroundColor: "#282828", borderRadius: 5, paddingHorizontal: 15, paddingVertical: 10, elevation: 4 },
  pinText: { color: "white", fontSize: 16, fontWeight: "900" },
  locate: { position: "absolute", right: 22, bottom: 22, width: 56, height: 56, borderRadius: 28, backgroundColor: "white", alignItems: "center", justifyContent: "center", elevation: 5 },
  locateText: { fontSize: 30, color: "#29303a" },
  sheet: { backgroundColor: "white", borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingTop: 10, paddingBottom: 22, elevation: 10 },
  handle: { alignSelf: "center", width: 42, height: 4, borderRadius: 2, backgroundColor: "#d4d7da", marginBottom: 10 },
  route: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 8 },
  startDot: { fontSize: 12, color: "#333", marginTop: 7, marginRight: 14 },
  endDot: { fontSize: 12, color: "#e22b37", marginTop: 7, marginRight: 14 },
  routeText: { flex: 1 },
  label: { fontSize: 13, color: "#888", marginBottom: 3 },
  value: { fontSize: 18, fontWeight: "800", color: "#242931" },
  address: { fontSize: 13, color: "#818791", marginTop: 3 },
  change: { fontSize: 14, fontWeight: "800", color: "#3971b9", padding: 8 },
  line: { height: 1, backgroundColor: "#eceef0", marginLeft: 26 },
  previewCard: { marginTop: 10, borderRadius: 16, padding: 16, backgroundColor: "#f5f6f8", minHeight: 102, justifyContent: "center" },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  loadingText: { color: "#646b75", fontSize: 15, fontWeight: "700" },
  previewMain: { flexDirection: "row", justifyContent: "space-between" },
  fareArea: { alignItems: "flex-end" },
  previewLabel: { color: "#777e87", fontSize: 13, marginBottom: 2 },
  previewTime: { color: "#202630", fontSize: 23, fontWeight: "900" },
  previewFare: { color: "#202630", fontSize: 23, fontWeight: "900" },
  previewSub: { color: "#505762", fontSize: 14, marginTop: 8 },
  notice: { color: "#9298a0", fontSize: 11, marginTop: 4 },
  errorTitle: { color: "#303640", fontSize: 15, fontWeight: "800", marginBottom: 4 },
  errorText: { color: "#858b94", fontSize: 13, lineHeight: 18 },
  next: { height: 58, borderRadius: 14, backgroundColor: "#fee500", alignItems: "center", justifyContent: "center", marginTop: 13 },
  nextDisabled: { backgroundColor: "#e4e6e9" },
  nextText: { fontSize: 20, fontWeight: "900", color: "#222" },
});

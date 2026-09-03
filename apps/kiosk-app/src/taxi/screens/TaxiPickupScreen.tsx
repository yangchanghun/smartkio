import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { KakaoMapView } from "../components/KakaoMapView";
import type { TaxiPlace } from "./TaxiDestinationScreen";

export function TaxiPickupScreen({
  departure,
  destination,
  onBack,
  onDeparture,
  onDepartureChange,
  onCurrentLocation,
  onDestination,
}: {
  departure: TaxiPlace;
  destination: TaxiPlace | null;
  onBack: () => void;
  onDeparture: () => void;
  onDepartureChange: (place: TaxiPlace, reason?: "initial" | "drag") => void;
  onCurrentLocation: () => void;
  onDestination: () => void;
}) {
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.map}>
        <KakaoMapView center={departure} onCenter={onDepartureChange} />
        <Pressable
          style={s.back}
          onPress={onBack}
          accessibilityLabel="카카오T 홈으로 돌아가기"
        >
          <Text style={s.backText}>‹</Text>
        </Pressable>
        <View style={s.car}>
          <Text style={s.carIcon}>🚕</Text>
          <Text style={s.carLabel}>출발</Text>
        </View>
        <View style={s.dragGuide} pointerEvents="none">
          <Text style={s.dragGuideText}>
            ↔ 지도를 움직여 출발지를 바꿔 보세요
          </Text>
        </View>
        <Pressable
          style={s.locate}
          onPress={onCurrentLocation}
          accessibilityRole="button"
          accessibilityLabel="현재 위치로 이동"
        >
          <Text style={s.locateText}>⌖</Text>
        </Pressable>
      </View>
      <View style={s.sheet}>
        <View style={s.handle} />
        <Pressable
          style={[s.placeRow, s.departureRow]}
          onPress={onDeparture}
          accessibilityRole="button"
          accessibilityLabel={`현재 출발지 ${departure.name}, 출발지 변경`}
        >
          <Text style={s.startDot}>●</Text>
          <View style={s.placeText}>
            <Text maxFontSizeMultiplier={1.3} style={s.small}>
              출발 위치
            </Text>
            <Text numberOfLines={2} maxFontSizeMultiplier={1.3} style={s.place}>
              {departure.name}
            </Text>
            <Text
              numberOfLines={2}
              maxFontSizeMultiplier={1.3}
              style={s.address}
            >
              {departure.address}
            </Text>
          </View>
          <Text numberOfLines={1} maxFontSizeMultiplier={1.2} style={s.change}>
            출발지 변경 ›
          </Text>
        </Pressable>
        <View style={s.divider} />
        <Pressable
          style={s.placeRow}
          onPress={onDestination}
          accessibilityRole="button"
          accessibilityLabel="도착지 입력"
        >
          <Text style={s.endDot}>●</Text>
          <Text style={destination ? s.place : s.placeholder}>
            {destination?.name ?? "어디로 갈까요?"}
          </Text>
          <Text style={s.chevron}>›</Text>
        </Pressable>
        <View style={s.quickRow}>
          <Pressable style={s.quick} onPress={onDestination}>
            <Text style={s.quickText}>＋ 집</Text>
          </Pressable>
          <Pressable style={s.quick} onPress={onDestination}>
            <Text style={s.quickText}>＋ 회사</Text>
          </Pressable>
          <Pressable style={s.recent} onPress={onDestination}>
            <Text style={s.recentText}>최근 목적지 보기 ›</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "white" },
  map: { flex: 1, position: "relative" },
  back: {
    position: "absolute",
    top: 26,
    left: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },
  backText: { fontSize: 46, lineHeight: 46, color: "#26303a" },
  car: {
    position: "absolute",
    left: "50%",
    top: "50%",
    alignItems: "center",
    transform: [{ translateX: -26 }, { translateY: -10 }],
  },
  carIcon: { fontSize: 42, transform: [{ rotate: "20deg" }] },
  carLabel: {
    position: "absolute",
    bottom: 38,
    backgroundColor: "#27282a",
    color: "white",
    fontSize: 17,
    fontWeight: "900",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 5,
  },
  dragGuide: {
    position: "absolute",
    top: 100,
    left: 24,
    right: 24,
    alignItems: "center",
    backgroundColor: "rgba(32, 38, 46, 0.88)",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  dragGuideText: { color: "white", fontSize: 14, fontWeight: "800" },
  locate: {
    position: "absolute",
    right: 24,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  locateText: { fontSize: 30 },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: "white",
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 26,
    elevation: 12,
  },
  handle: {
    alignSelf: "center",
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#d0d3d7",
    marginBottom: 12,
  },
  placeRow: { minHeight: 72, flexDirection: "row", alignItems: "center" },
  departureRow: { minHeight: 108, paddingVertical: 12 },
  startDot: { fontSize: 13, color: "#27292d", marginRight: 16 },
  endDot: { fontSize: 13, color: "#df2935", marginRight: 16 },
  placeText: { flex: 1, justifyContent: "center" },
  small: { fontSize: 13, lineHeight: 19, color: "#8a9098" },
  place: {
    fontSize: 21,
    lineHeight: 28,
    fontWeight: "800",
    color: "#222831",
    flex: 1,
  },
  address: { fontSize: 13, lineHeight: 19, color: "#858b94", marginTop: 3 },
  placeholder: { fontSize: 23, color: "#969ca5", fontWeight: "700", flex: 1 },
  change: { color: "#3171c7", fontSize: 15, fontWeight: "800", padding: 10 },
  chevron: { fontSize: 34, color: "#555" },
  divider: { height: 1, backgroundColor: "#e7e9ec", marginLeft: 30 },
  quickRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
  },
  quick: {
    borderWidth: 1,
    borderColor: "#d9dce1",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  quickText: { fontSize: 15, fontWeight: "700" },
  recent: { marginLeft: "auto", padding: 8 },
  recentText: { fontSize: 14, fontWeight: "700", color: "#666d76" },
});

import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export type TaxiPlace = {
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
};
export type PlaceRole = "departure" | "destination";
export const SAMPLE_TAXI_PLACES: TaxiPlace[] = [
  {
    name: "김천아파트",
    address: "서울 은평구 연서로 98-8",
    latitude: 37.6167,
    longitude: 126.9292,
  },
  {
    name: "서울역",
    address: "서울 용산구 한강대로 405",
    latitude: 37.5547,
    longitude: 126.9707,
  },
  {
    name: "삼선동 주민센터",
    address: "서울 성북구 보문로 168",
    latitude: 37.5908,
    longitude: 127.0159,
  },
  {
    name: "숭실대학교",
    address: "서울 동작구 상도로 369",
    latitude: 37.4963,
    longitude: 126.9574,
  },
  {
    name: "서울대학교병원",
    address: "서울 종로구 대학로 101",
    latitude: 37.5796,
    longitude: 126.999,
  },
];

export function TaxiDestinationScreen({
  role,
  currentDeparture,
  onBack,
  onSelect,
  onOpenMap,
}: {
  role: PlaceRole;
  currentDeparture: TaxiPlace;
  onBack: () => void;
  onSelect: (place: TaxiPlace) => void;
  onOpenMap: (query: string) => void;
}) {
  const [query, setQuery] = useState("");
  const label = role === "departure" ? "출발지" : "도착지";
  const term = query.trim();
  const filtered = term
    ? SAMPLE_TAXI_PLACES.filter((p) => `${p.name} ${p.address}`.includes(term))
    : SAMPLE_TAXI_PLACES;
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Pressable onPress={onBack}>
          <Text style={s.back}>‹</Text>
        </Pressable>
        <Text style={s.title}>{label} 설정</Text>
        <View style={s.gap} />
      </View>
      <View style={s.routeBox}>
        <View style={s.routeRow}>
          <Text style={s.startDot}>●</Text>
          <Text style={s.routeLabel}>출발</Text>
          <Text style={s.routeValue}>{currentDeparture.name}</Text>
        </View>
        <View style={s.line} />
        <View style={s.searchRow}>
          <Text style={role === "departure" ? s.startDot : s.endDot}>●</Text>
          <TextInput
            autoFocus
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => onOpenMap(query)}
            placeholder={`${label} 검색`}
            placeholderTextColor="#969ca5"
            style={s.input}
            returnKeyType="search"
          />
          <Pressable onPress={() => onOpenMap(query)}>
            <Text style={s.mapButton}>지도</Text>
          </Pressable>
        </View>
      </View>
      <View style={s.quickRow}>
        <Pressable
          style={s.quick}
          onPress={() => onSelect(SAMPLE_TAXI_PLACES[0])}
        >
          <Text>＋ 집</Text>
        </Pressable>
        <Pressable
          style={s.quick}
          onPress={() => onSelect(SAMPLE_TAXI_PLACES[3])}
        >
          <Text>＋ 회사</Text>
        </Pressable>
        <Pressable style={s.mapQuick} onPress={() => onOpenMap(query)}>
          <Text style={s.mapQuickText}>⌖ 지도에서 고르기</Text>
        </Pressable>
      </View>
      <View style={s.divider} />
      <Text style={s.section}>{term ? "검색 결과" : "최근 목적지"}</Text>
      <ScrollView keyboardShouldPersistTaps="handled">
        {filtered.map((place) => (
          <Pressable
            key={`${place.name}-${place.address}`}
            style={s.place}
            onPress={() => onSelect(place)}
            accessibilityRole="button"
            accessibilityLabel={`${place.name} ${label} 선택`}
          >
            <View style={s.placeText}>
              <Text style={s.placeName}>{place.name}</Text>
              <Text style={s.address}>{place.address}</Text>
            </View>
            <Text style={s.select}>선택</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "white" },
  header: {
    height: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  back: { fontSize: 48, lineHeight: 50, color: "#252b35" },
  title: { fontSize: 22, fontWeight: "900" },
  gap: { width: 34 },
  routeBox: {
    margin: 18,
    borderRadius: 18,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 20,
  },
  routeRow: { height: 58, flexDirection: "row", alignItems: "center" },
  line: { height: 1, backgroundColor: "#dddfe3", marginLeft: 28 },
  searchRow: { height: 68, flexDirection: "row", alignItems: "center" },
  startDot: { fontSize: 11, color: "#333", marginRight: 12 },
  endDot: { fontSize: 11, color: "#e22b37", marginRight: 12 },
  routeLabel: { fontSize: 13, color: "#858b94", marginRight: 10 },
  routeValue: { fontSize: 17, fontWeight: "700", color: "#303640" },
  input: { flex: 1, fontSize: 20, color: "#20252d", padding: 0 },
  mapButton: { fontSize: 15, fontWeight: "800", color: "#376fb9", padding: 10 },
  quickRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  quick: {
    borderWidth: 1,
    borderColor: "#d9dce1",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  mapQuick: { marginLeft: "auto", padding: 10 },
  mapQuickText: { fontSize: 15, fontWeight: "800", color: "#343a43" },
  divider: { height: 10, backgroundColor: "#f2f3f5" },
  section: {
    fontSize: 18,
    fontWeight: "800",
    color: "#686f79",
    paddingHorizontal: 22,
    paddingVertical: 20,
  },
  place: {
    minHeight: 92,
    borderBottomWidth: 1,
    borderColor: "#edf0f2",
    paddingHorizontal: 22,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  placeText: { flex: 1 },
  placeName: {
    fontSize: 19,
    fontWeight: "700",
    color: "#262c35",
    marginBottom: 6,
  },
  address: { fontSize: 15, color: "#7a818b" },
  select: {
    fontSize: 15,
    color: "#555",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 10,
  },
});

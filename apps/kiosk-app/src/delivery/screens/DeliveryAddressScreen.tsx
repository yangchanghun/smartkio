import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { searchDeliveryAddresses } from "../services/addressApi";
import type { AddressSearchResult, DeliveryAddress } from "../types";

export function DeliveryAddressScreen({
  addresses,
  selectedId,
  onSelect,
  onBack,
  token,
}: {
  addresses: DeliveryAddress[];
  selectedId: string;
  onSelect: (address: DeliveryAddress) => void;
  onBack: () => void;
  token: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AddressSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const guide = () => Alert.alert("주소 선택 미션", "목록에서 배달받을 주소를 하나 눌러 주세요.");
  const search = async () => {
    if (query.trim().length < 2) {
      Alert.alert("주소 검색", "도로명이나 건물명을 두 글자 이상 입력해 주세요.");
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      setResults(await searchDeliveryAddresses(query, token));
    } catch (error) {
      setResults([]);
      Alert.alert("주소 검색 오류", error instanceof Error ? error.message : "주소를 검색하지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };
  const selectSearchResult = (result: AddressSearchResult, index: number) => {
    const roadAddress = result.roadAddress || result.jibunAddress;
    onSelect({
      id: `naver-${result.x}-${result.y}-${index}`,
      name: result.name || roadAddress,
      roadAddress,
      detail: "",
      request: "상세주소는 다음 단계에서 입력할 수 있어요.",
      longitude: result.x,
      latitude: result.y,
    });
  };
  return (
    <View style={s.page}>
      <View style={s.header}>
        <Pressable onPress={onBack} hitSlop={10}><Text style={s.back}>‹</Text></Pressable>
        <Text style={s.title}>주소 설정</Text>
        <Pressable onPress={guide}><Text style={s.edit}>✎</Text></Pressable>
      </View>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <View style={s.searchWrap}>
          <Text style={s.searchIcon}>⌕</Text>
          <TextInput
            style={s.searchInput}
            placeholder="도로명, 건물명, 지번으로 검색"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={() => void search()}
            autoCorrect={false}
          />
          <Pressable style={s.searchButton} onPress={() => void search()}>
            <Text style={s.searchButtonText}>검색</Text>
          </Pressable>
        </View>
        <Pressable style={s.currentLocation} onPress={guide}>
          <Text style={s.currentLocationText}>◎  현재 위치로 찾기</Text>
        </Pressable>
        <Pressable style={s.addHome} onPress={guide}>
          <Text style={s.homeIcon}>⌂</Text><Text style={s.addHomeText}>우리집 추가</Text>
        </Pressable>
        <View style={s.divider} />
        {loading && <ActivityIndicator style={s.loading} size="large" color="#11b9ad" />}
        {!loading && searched && results.length === 0 && (
          <View style={s.empty}><Text style={s.emptyTitle}>검색 결과가 없습니다.</Text><Text style={s.emptyText}>도로명이나 건물명을 다시 확인해 주세요.</Text></View>
        )}
        {!loading && results.map((result, index) => (
          <Pressable key={`${result.x}-${result.y}-${index}`} style={s.addressRow} onPress={() => selectSearchResult(result, index)}>
            <Text style={s.pin}>⌖</Text>
            <View style={s.addressBody}>
              {!!result.name && <Text style={s.name}>{result.name}</Text>}
              <Text style={result.name ? s.road : s.name}>{result.roadAddress || result.jibunAddress}</Text>
              {!!result.roadAddress && !!result.jibunAddress && <Text style={s.road}>지번 {result.jibunAddress}</Text>}
              {!!result.category && <Text style={s.category}>{result.category}</Text>}
              <Text style={s.request}>이 주소를 선택하려면 눌러 주세요.</Text>
            </View>
          </Pressable>
        ))}
        {!searched && addresses.map((address) => {
          const selected = address.id === selectedId;
          return (
            <Pressable key={address.id} style={s.addressRow} onPress={() => onSelect(address)}>
              <Text style={s.pin}>⌖</Text>
              <View style={s.addressBody}>
                <View style={s.nameRow}>
                  <Text style={s.name}>{address.name}</Text>
                  {selected && <View style={s.selectedBadge}><Text style={s.selectedBadgeText}>현재 설정된 주소</Text></View>}
                </View>
                <Text style={s.road}>{address.roadAddress} {address.detail}</Text>
                <Text style={s.request}>{address.request}</Text>
              </View>
              {selected && <Text style={s.check}>✓</Text>}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, width: "100%", maxWidth: 680, alignSelf: "center", backgroundColor: "white" },
  header: { height: 76, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 22 },
  back: { fontSize: 44, lineHeight: 46 },
  title: { fontSize: 24, fontWeight: "900" },
  edit: { fontSize: 31 },
  content: { paddingTop: 18, paddingBottom: 32 },
  searchWrap: { marginHorizontal: 20, height: 62, borderRadius: 19, backgroundColor: "#f5f5f7", flexDirection: "row", alignItems: "center", paddingHorizontal: 18 },
  searchIcon: { fontSize: 30, color: "#777" },
  searchInput: { flex: 1, marginLeft: 9, fontSize: 17, color: "#777" },
  searchButton: { borderRadius: 12, backgroundColor: "#11d8c7", paddingHorizontal: 14, paddingVertical: 10 },
  searchButtonText: { fontWeight: "900", color: "#10201f" },
  currentLocation: { margin: 20, height: 59, borderRadius: 16, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  currentLocationText: { fontSize: 18, fontWeight: "900" },
  addHome: { flexDirection: "row", alignItems: "center", paddingHorizontal: 28, paddingVertical: 18 },
  homeIcon: { fontSize: 30, marginRight: 15 },
  addHomeText: { fontSize: 21, fontWeight: "900" },
  divider: { height: 12, backgroundColor: "#f4f5f6" },
  addressRow: { minHeight: 155, marginHorizontal: 20, paddingVertical: 24, flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#eee" },
  pin: { width: 38, paddingTop: 4, fontSize: 27 },
  addressBody: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 7 },
  name: { fontSize: 20, fontWeight: "900" },
  selectedBadge: { borderRadius: 6, backgroundColor: "#e7f5ff", paddingHorizontal: 7, paddingVertical: 4 },
  selectedBadgeText: { color: "#1684e8", fontSize: 11, fontWeight: "900" },
  road: { marginTop: 9, fontSize: 16, lineHeight: 23, color: "#333" },
  request: { marginTop: 7, fontSize: 14, lineHeight: 20, color: "#999" },
  category: { marginTop: 6, fontSize: 13, color: "#11a99e" },
  check: { width: 30, alignSelf: "center", fontSize: 29, fontWeight: "900" },
  loading: { marginTop: 45 },
  empty: { alignItems: "center", padding: 48 },
  emptyTitle: { fontSize: 18, fontWeight: "900" },
  emptyText: { marginTop: 8, color: "#888" },
});

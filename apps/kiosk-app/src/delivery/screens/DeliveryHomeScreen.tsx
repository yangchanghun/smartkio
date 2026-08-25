import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { DeliveryAddress } from "../types";
import { DeliveryBottomNav } from "../components/DeliveryBottomNav";

const categories = [
  ["🍔", "패스트푸드"], ["☕", "카페·디저트"], ["🍜", "중식"], ["🍗", "치킨"], ["🍚", "한식"],
  ["🎟️", "배짱할인"], ["📋", "줄서는 맛집"], ["🍲", "한그릇"], ["📍", "픽업"], ["🥩", "푸줏간"],
] as const;

export function DeliveryHomeScreen({
  address,
  onOpenAddress,
  onBack,
}: {
  address: DeliveryAddress;
  onOpenAddress: () => void;
  onBack: () => void;
}) {
  const guide = () => Alert.alert("주소 설정 미션", "화면 맨 위의 배달 주소를 눌러 주세요.");

  return (
    <View style={s.page}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.mintArea}>
          <View style={s.header}>
            <Pressable onPress={onBack} hitSlop={10}><Text style={s.back}>‹</Text></Pressable>
            <Pressable style={s.addressButton} onPress={onOpenAddress}>
              <Text style={s.addressText} numberOfLines={1}>{address.name}</Text>
              <Text style={s.chevron}>⌄</Text>
            </Pressable>
            <View style={s.headerActions}>
              <Pressable onPress={guide}><Text style={s.headerIcon}>♢</Text></Pressable>
              <Pressable onPress={guide}><Text style={s.headerIcon}>♧</Text></Pressable>
              <Pressable onPress={guide}><Text style={s.headerIcon}>🛒</Text></Pressable>
            </View>
          </View>
          <Pressable style={s.search} onPress={guide}>
            <Text style={s.searchPlaceholder}>먹고 싶은 메뉴를 검색해 보세요</Text>
            <Text style={s.searchIcon}>⌕</Text>
          </Pressable>
          <View style={s.promo}>
            <View style={s.promoCopy}>
              <Text style={s.promoTag}>오늘의 추천</Text>
              <Text style={s.promoTitle}>치킨이 고민이신가요?</Text>
              <Text style={s.promoText}>인기 메뉴 3,000원 할인  ›</Text>
            </View>
            <Text style={s.promoFood}>🍗</Text>
          </View>
        </View>

        <View style={s.serviceCard}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.serviceTabs}>
            {['음식배달', '픽업', '장보기·쇼핑', '선물하기', '혜택모아보기'].map((item, index) => (
              <Pressable key={item} onPress={index === 0 ? undefined : guide} style={[s.serviceTab, index === 0 && s.serviceTabActive]}>
                <Text style={[s.serviceText, index === 0 && s.serviceTextActive]}>{item}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <View style={s.categoryGrid}>
            {categories.map(([emoji, label]) => (
              <Pressable key={label} style={s.category} onPress={guide}>
                <View style={s.categoryIcon}><Text style={s.categoryEmoji}>{emoji}</Text></View>
                <Text style={s.categoryLabel}>{label}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable style={s.more} onPress={guide}><Text style={s.moreText}><Text style={s.bold}>음식배달</Text>에서 더보기  ›</Text></Pressable>
        </View>

        <View style={s.storeSection}>
          <Text style={s.sectionTitle}>지금 많이 주문해요</Text>
          <View style={s.storeCard}>
            <View style={s.foodImage}><Text style={s.foodEmoji}>🍔</Text></View>
            <View style={s.storeInfo}>
              <Text style={s.storeName}>스마트버거 은평점</Text>
              <Text style={s.rating}>★ 4.8 <Text style={s.gray}>(328)</Text></Text>
              <Text style={s.storeMeta}>약 20분 · 배달팁 0원 · 최소주문 12,000원</Text>
              <View style={s.chip}><Text style={s.chipText}>배달팁 0원</Text></View>
            </View>
          </View>
        </View>
      </ScrollView>
      <DeliveryBottomNav onWrongPress={guide} />
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, width: "100%", maxWidth: 680, alignSelf: "center", backgroundColor: "#f5f6f7" },
  content: { paddingBottom: 10 },
  mintArea: { backgroundColor: "#e0faf5", paddingTop: 8, paddingHorizontal: 18, paddingBottom: 26 },
  header: { minHeight: 64, flexDirection: "row", alignItems: "center" },
  back: { fontSize: 43, lineHeight: 45, fontWeight: "300" },
  addressButton: { flex: 1, marginLeft: 8, flexDirection: "row", alignItems: "center" },
  addressText: { maxWidth: "85%", fontSize: 21, fontWeight: "900" },
  chevron: { marginLeft: 6, fontSize: 18, fontWeight: "900" },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 14 },
  headerIcon: { fontSize: 24 },
  search: { height: 58, borderRadius: 29, borderWidth: 1.5, backgroundColor: "white", flexDirection: "row", alignItems: "center", paddingHorizontal: 20 },
  searchPlaceholder: { flex: 1, color: "#888", fontSize: 16 },
  searchIcon: { fontSize: 32, fontWeight: "900" },
  promo: { minHeight: 155, flexDirection: "row", alignItems: "center", paddingTop: 18 },
  promoCopy: { flex: 1 },
  promoTag: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderRadius: 4, fontWeight: "900", color: "#555" },
  promoTitle: { marginTop: 12, fontSize: 23, fontWeight: "900" },
  promoText: { marginTop: 7, fontSize: 18, fontWeight: "800" },
  promoFood: { width: 135, textAlign: "center", fontSize: 82 },
  serviceCard: { marginTop: -20, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: "white", overflow: "hidden" },
  serviceTabs: { paddingHorizontal: 16, minWidth: "100%" },
  serviceTab: { paddingHorizontal: 11, paddingVertical: 20 },
  serviceTabActive: { borderBottomWidth: 4, borderBottomColor: "#141414" },
  serviceText: { fontSize: 17, color: "#777" },
  serviceTextActive: { color: "#111", fontWeight: "900" },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 10, paddingTop: 18 },
  category: { width: "20%", alignItems: "center", marginBottom: 20 },
  categoryIcon: { width: 57, height: 57, borderRadius: 20, backgroundColor: "#f3f4f5", alignItems: "center", justifyContent: "center" },
  categoryEmoji: { fontSize: 34 },
  categoryLabel: { marginTop: 7, fontSize: 12, textAlign: "center", color: "#262626" },
  more: { borderTopWidth: 1, borderColor: "#eee", alignItems: "center", padding: 17 },
  moreText: { fontSize: 16 },
  bold: { fontWeight: "900" },
  storeSection: { marginTop: 10, backgroundColor: "white", padding: 20 },
  sectionTitle: { fontSize: 21, fontWeight: "900", marginBottom: 14 },
  storeCard: { flexDirection: "row", borderRadius: 18, borderWidth: 1, borderColor: "#eee", overflow: "hidden" },
  foodImage: { width: 120, minHeight: 126, backgroundColor: "#fff4dc", alignItems: "center", justifyContent: "center" },
  foodEmoji: { fontSize: 63 },
  storeInfo: { flex: 1, padding: 14 },
  storeName: { fontSize: 18, fontWeight: "900" },
  rating: { marginTop: 5, color: "#f4b400", fontWeight: "900" },
  gray: { color: "#888", fontWeight: "400" },
  storeMeta: { marginTop: 7, color: "#666", fontSize: 12, lineHeight: 18 },
  chip: { alignSelf: "flex-start", marginTop: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: "#e2fbf7" },
  chipText: { color: "#009a8d", fontSize: 11, fontWeight: "900" },
});


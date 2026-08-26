import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { DeliveryBottomNav } from "../components/DeliveryBottomNav";
import { CHICKEN_STORES, type ChickenStore } from "../data/chickenStores";

const friedChickenImage = require("../../../assets/delivery/chicken-fried.png");
const spicyChickenImage = require("../../../assets/delivery/chicken-spicy.png");

export function ChickenStoreListScreen({
  onBack,
  onSelectStore,
  onWrongPress,
}: {
  onBack: () => void;
  onSelectStore: (store: ChickenStore) => void;
  onWrongPress: () => void;
}) {
  return (
    <View style={s.page}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Pressable onPress={onBack} hitSlop={10}><Text style={s.back}>‹</Text></Pressable>
          <Text style={s.title}>음식배달 🍴</Text>
          <View style={s.actions}>
            <Pressable onPress={onWrongPress}><Text style={s.action}>⌕</Text></Pressable>
            <Pressable onPress={onWrongPress}><Text style={s.action}>🛒</Text></Pressable>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabs}>
          {['홈', '패스트푸드', '카페·디저트', '중식', '치킨', '한식'].map((tab) => (
            <Pressable key={tab} onPress={tab === '치킨' ? undefined : onWrongPress} style={[s.tab, tab === '치킨' && s.tabActive]}>
              <Text style={[s.tabText, tab === '치킨' && s.tabTextActive]}>{tab}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={s.separator} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters}>
          {['↕ 기본순', '✿ 배달팁 0원', '⚡ 할인·쿠폰', '배달방식⌄'].map((filter) => (
            <Pressable key={filter} style={s.filter} onPress={onWrongPress}><Text style={s.filterText}>{filter}</Text></Pressable>
          ))}
        </ScrollView>

        <Text style={s.sectionTitle}>치킨 가게</Text>
        <Text style={s.sectionDesc}>배달 시간과 배달팁을 비교해 보세요.</Text>

        {CHICKEN_STORES.map((store, index) => (
          <View key={store.id}>
            <Pressable style={s.store} onPress={() => onSelectStore(store)}>
              <View style={s.menuGrid}>
                <View style={s.menuTile}>
                  <Image source={friedChickenImage} style={s.menuImage} />
                  <View style={s.menuShade} />
                  <Text style={s.menuLabel}>{store.menu[1]}</Text>
                </View>
                <View style={s.menuTile}>
                  <Image source={spicyChickenImage} style={s.menuImage} />
                  <View style={s.menuShade} />
                  <Text style={s.menuLabel}>{store.menu[3]}</Text>
                </View>
              </View>
              <View style={s.freeTip}><Text style={s.freeTipText}>⚡ {store.deliveryFee}</Text></View>
              <View style={s.storeBody}>
                <View style={s.logo}><Text style={s.logoText}>{index === 0 ? 'S' : '🍗'}</Text></View>
                <View style={s.storeInfo}>
                  <Text style={s.storeName}>{store.name} <Text style={s.rating}>★ {store.rating}</Text> <Text style={s.reviews}>({store.reviews})</Text></Text>
                  <Text style={s.meta}>{store.deliveryTime} · <Text style={store.deliveryFee === '배달팁 0원' ? s.tipZero : undefined}>{store.deliveryFee}</Text> · {store.distance}</Text>
                  <Text style={s.minimum}>{store.minimumOrder}</Text>
                  <View style={s.badges}><Text style={s.badge}>포장 가능</Text><Text style={s.badge}>위생 인증</Text></View>
                </View>
              </View>
            </Pressable>
            {index === 0 && <Pressable style={s.coupon} onPress={onWrongPress}><Text style={s.couponText}>곧 사라져요! 이번 주 한정 쿠폰 확인  🎟️</Text></Pressable>}
          </View>
        ))}
      </ScrollView>
      <DeliveryBottomNav onWrongPress={onWrongPress} />
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, width: "100%", maxWidth: 680, alignSelf: "center", backgroundColor: "white" },
  content: { paddingBottom: 105 },
  header: { minHeight: 78, paddingHorizontal: 20, flexDirection: "row", alignItems: "center" },
  back: { fontSize: 45, lineHeight: 47 },
  title: { flex: 1, marginLeft: 12, fontSize: 25, fontWeight: "900" },
  actions: { flexDirection: "row", alignItems: "center", gap: 20 },
  action: { fontSize: 29 },
  tabs: { paddingHorizontal: 14 },
  tab: { paddingHorizontal: 14, paddingVertical: 16 },
  tabActive: { borderBottomWidth: 4, borderBottomColor: "#171717" },
  tabText: { fontSize: 17, color: "#888" },
  tabTextActive: { color: "#111", fontWeight: "900" },
  separator: { height: 12, backgroundColor: "#f4f5f6" },
  filters: { paddingHorizontal: 14, paddingVertical: 15, gap: 9 },
  filter: { borderWidth: 1, borderColor: "#ddd", borderRadius: 22, paddingHorizontal: 15, paddingVertical: 10, backgroundColor: "white" },
  filterText: { fontSize: 14, fontWeight: "700" },
  sectionTitle: { marginTop: 9, paddingHorizontal: 20, fontSize: 22, fontWeight: "900" },
  sectionDesc: { paddingHorizontal: 20, marginTop: 6, marginBottom: 15, color: "#888" },
  store: { borderTopWidth: 1, borderColor: "#eee", paddingTop: 16, backgroundColor: "white" },
  menuGrid: { height: 155, marginHorizontal: 18, borderRadius: 18, overflow: "hidden", flexDirection: "row", backgroundColor: "#fff8e8" },
  menuTile: { width: "50%", alignItems: "center", justifyContent: "flex-end", borderRightWidth: 1, borderColor: "white", overflow: "hidden" },
  menuImage: { ...StyleSheet.absoluteFillObject, width: undefined, height: undefined, resizeMode: "cover" },
  menuShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.22)" },
  menuLabel: { marginBottom: 13, fontWeight: "900", color: "white", fontSize: 14, textShadowColor: "rgba(0,0,0,0.45)", textShadowRadius: 4 },
  freeTip: { marginHorizontal: 18, backgroundColor: "#3613dc", paddingHorizontal: 14, paddingVertical: 8, borderBottomLeftRadius: 10, borderBottomRightRadius: 10 },
  freeTipText: { color: "white", fontWeight: "900" },
  storeBody: { flexDirection: "row", padding: 18 },
  logo: { width: 54, height: 54, borderRadius: 27, backgroundColor: "#10bfae", alignItems: "center", justifyContent: "center" },
  logoText: { fontSize: 25, fontWeight: "900", color: "white" },
  storeInfo: { flex: 1, marginLeft: 12 },
  storeName: { fontSize: 18, fontWeight: "900" },
  rating: { color: "#f3b400" },
  reviews: { color: "#999", fontWeight: "500" },
  meta: { marginTop: 6, color: "#555", lineHeight: 21 },
  tipZero: { color: "#3417e8", fontWeight: "900" },
  minimum: { marginTop: 2, color: "#777" },
  badges: { flexDirection: "row", gap: 6, marginTop: 8 },
  badge: { backgroundColor: "#f1f2f3", borderRadius: 5, paddingHorizontal: 7, paddingVertical: 4, fontSize: 11, color: "#555" },
  coupon: { marginHorizontal: 18, marginBottom: 20, borderRadius: 16, backgroundColor: "#54e1e8", padding: 18 },
  couponText: { textAlign: "center", fontSize: 16, fontWeight: "900" },
});

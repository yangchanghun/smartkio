import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { ChickenStore } from "../data/chickenStores";

const heroImage = require("../../../assets/delivery/chicken-hero.png");
const friedChickenImage = require("../../../assets/delivery/chicken-fried.png");
const spicyChickenImage = require("../../../assets/delivery/chicken-spicy.png");

export const CHICKEN_MENU_ITEMS = [
  { id: "fried", name: "바삭 후라이드 한마리", description: "갓 튀겨낸 바삭한 후라이드 치킨", price: "18,000원", image: friedChickenImage, badge: "인기 1위" },
  { id: "spicy", name: "달콤 양념 한마리", description: "매콤달콤한 특제 양념을 입힌 치킨", price: "19,000원", image: spicyChickenImage, badge: "인기 2위" },
  { id: "half", name: "반반 치킨", description: "후라이드와 양념을 한 번에 즐겨 보세요", price: "20,000원", image: heroImage, badge: "추천" },
];
export type ChickenMenuItem = (typeof CHICKEN_MENU_ITEMS)[number];

export function ChickenStoreDetailScreen({
  store,
  onBack,
  onSelectMenu,
  cartCount,
  cartTotal,
  onOpenCart,
  onWrongPress,
}: {
  store: ChickenStore;
  onBack: () => void;
  onSelectMenu: (id: ChickenMenuItem["id"]) => void;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onWrongPress: () => void;
}) {
  return (
    <View style={s.page}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        <View style={s.hero}>
          <Image source={heroImage} style={s.heroImage} />
          <View style={s.heroShade} />
          <View style={s.heroBar}>
            <Pressable onPress={onBack} hitSlop={12} style={s.heroIcon}><Text style={s.heroIconText}>‹</Text></Pressable>
            <View style={s.heroActions}>
              <Pressable onPress={onWrongPress} style={s.heroIcon}><Text style={s.share}>↗</Text></Pressable>
              <Pressable onPress={onWrongPress} style={s.heroIcon}><Text style={s.heroIconText}>⌕</Text></Pressable>
              <Pressable onPress={onWrongPress} style={s.heroIcon}><Text style={s.cart}>🛒</Text></Pressable>
            </View>
          </View>
          <View style={s.heroCaption}><Text style={s.captionBadge}>SMART CHICKEN</Text><Text style={s.caption}>오늘 갓 튀긴 치킨을 만나보세요</Text></View>
        </View>

        <View style={s.storeIntro}>
          <View style={s.nameLine}><Text style={s.storeName}>✦ {store.name}</Text><Pressable onPress={onWrongPress}><Text style={s.heart}>♡</Text></Pressable></View>
          <View style={s.ratingLine}><Text style={s.star}>★</Text><Text style={s.rating}>{store.rating} ({store.reviews})</Text><Text style={s.chevron}>›</Text><Text style={s.infoPill}>가게정보·원산지</Text></View>
          <View style={s.deliveryBox}>
            <View style={s.deliveryTabs}><View style={s.deliveryTabActive}><Text style={s.deliveryTabText}>배달</Text></View><View style={s.deliveryTab}><Text style={s.deliveryTabMuted}>포장 약 15분</Text></View></View>
            <View style={s.deliveryRow}><Text style={s.deliveryLabel}>최소주문</Text><Text style={s.deliveryValue}>12,000원</Text><Text style={s.deliveryGuide}>배달 안내</Text></View>
            <View style={s.deliveryRow}><Text style={s.deliveryLabel}>알뜰배달</Text><Text style={s.deliveryValue}>약 20분</Text><Text style={s.zeroTip}>배달팁 0원</Text></View>
            <View style={s.deliveryRow}><Text style={s.deliveryLabel}>한집배달</Text><Text style={s.deliveryValue}>10~20분</Text><Text style={s.deliveryFee}>1,000원</Text></View>
          </View>
        </View>

        <Pressable style={s.clubBanner} onPress={onWrongPress}><Text style={s.clubMark}>배민클럽</Text><Text style={s.clubText}> 무료이용권 1개월 + 5천원 쿠폰</Text><Text style={s.clubArrow}>›</Text></Pressable>
        <View style={s.reviewCard}><View style={s.reviewPhoto}><Image source={friedChickenImage} style={s.fillImage} /></View><View style={s.reviewCopy}><Text style={s.reviewStars}>★★★★★</Text><Text style={s.reviewText}>치킨이 바삭하고 양도 넉넉해요!{`\n`}다음에도 또 주문할게요.</Text></View></View>
        <View style={s.separator} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
          {["⌕", "인기 메뉴", "신메뉴", "한마리", "반반", "사이드"].map((chip, index) => <Pressable key={chip} onPress={onWrongPress} style={[s.chip, index === 1 && s.chipActive]}><Text style={[s.chipText, index === 1 && s.chipTextActive]}>{chip}</Text></Pressable>)}
        </ScrollView>
        <View style={s.menuHeader}><Text style={s.menuHeading}>가장 인기 있는 메뉴</Text><Text style={s.menuSub}>많이 찾는 메뉴부터 골라 보세요.</Text></View>
        {CHICKEN_MENU_ITEMS.map((menu) => (
          <Pressable key={menu.id} style={s.menuItem} onPress={() => onSelectMenu(menu.id)}>
            <View style={s.menuText}><Text style={s.rankBadge}>{menu.badge}</Text><Text style={s.itemName}>{menu.name}</Text><Text style={s.itemDesc}>{menu.description}</Text><Text style={s.itemPrice}>{menu.price}</Text><Text style={s.itemReview}>리뷰 {menu.id === "fried" ? "218" : "97"}</Text></View>
            <View style={s.itemPhoto}><Image source={menu.image} style={s.fillImage} /><View style={s.plusButton}><Text style={s.plus}>＋</Text></View></View>
          </Pressable>
        ))}
      </ScrollView>
      <View style={s.bottomBar}><View><Text style={s.bottomPrice}>{cartCount ? `${cartTotal.toLocaleString()}원` : "0원"}</Text><Text style={s.bottomHint}>{cartCount ? `메뉴 ${cartCount}개를 담았어요` : "메뉴를 담아 보세요"}</Text></View><Pressable style={[s.orderButton, !cartCount && s.orderButtonDisabled]} onPress={cartCount ? onOpenCart : onWrongPress}><Text style={s.orderText}>{cartCount ? `● ${cartCount}  장바구니 보기` : "장바구니 보기"}</Text></Pressable></View>
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, width: "100%", maxWidth: 680, alignSelf: "center", backgroundColor: "white" }, content: { paddingBottom: 115 },
  hero: { height: 280, overflow: "hidden", backgroundColor: "#3b1014" }, heroImage: { ...StyleSheet.absoluteFillObject, width: undefined, height: undefined, resizeMode: "cover" }, heroShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.12)" },
  heroBar: { paddingTop: 14, paddingHorizontal: 17, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, heroActions: { flexDirection: "row", gap: 8 }, heroIcon: { minWidth: 40, height: 40, justifyContent: "center", alignItems: "center" }, heroIconText: { color: "white", fontSize: 40, lineHeight: 40, fontWeight: "300" }, share: { color: "white", fontSize: 33, fontWeight: "700" }, cart: { color: "white", fontSize: 23 }, heroCaption: { position: "absolute", left: 22, bottom: 23 }, captionBadge: { color: "#111", backgroundColor: "#f6cb3f", overflow: "hidden", borderRadius: 5, paddingHorizontal: 8, paddingVertical: 4, fontSize: 11, fontWeight: "900" }, caption: { color: "white", fontSize: 20, fontWeight: "900", marginTop: 8, textShadowColor: "rgba(0,0,0,.7)", textShadowRadius: 4 },
  storeIntro: { paddingHorizontal: 20, paddingTop: 22 }, nameLine: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, storeName: { fontSize: 27, fontWeight: "900" }, heart: { fontSize: 42, lineHeight: 42 }, ratingLine: { flexDirection: "row", alignItems: "center", marginTop: 14 }, star: { color: "#ffc722", fontSize: 27 }, rating: { fontSize: 20, fontWeight: "900", marginLeft: 5 }, chevron: { fontSize: 28, marginLeft: 4 }, infoPill: { marginLeft: "auto", backgroundColor: "#f3f4f5", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 15, color: "#555", fontSize: 12 },
  deliveryBox: { borderWidth: 1, borderColor: "#e2e3e5", borderRadius: 16, marginTop: 22, padding: 13 }, deliveryTabs: { flexDirection: "row", backgroundColor: "#f4f5f6", borderRadius: 28, padding: 3, marginBottom: 13 }, deliveryTabActive: { width: "50%", backgroundColor: "white", borderRadius: 24, paddingVertical: 12, alignItems: "center", shadowColor: "#aaa", shadowOpacity: .12, shadowRadius: 3 }, deliveryTab: { width: "50%", paddingVertical: 12, alignItems: "center" }, deliveryTabText: { fontWeight: "900", fontSize: 16 }, deliveryTabMuted: { color: "#999", fontWeight: "700", fontSize: 16 }, deliveryRow: { flexDirection: "row", alignItems: "center", paddingVertical: 9 }, deliveryLabel: { width: 91, fontWeight: "700", fontSize: 16 }, deliveryValue: { fontWeight: "900", fontSize: 16 }, deliveryGuide: { marginLeft: "auto", backgroundColor: "#f4f5f6", borderRadius: 15, paddingHorizontal: 10, paddingVertical: 5, color: "#555" }, zeroTip: { marginLeft: "auto", color: "#3522e9", fontSize: 16, fontWeight: "900" }, deliveryFee: { marginLeft: "auto", fontWeight: "700" },
  clubBanner: { margin: 20, marginBottom: 16, borderRadius: 16, backgroundColor: "#07172f", padding: 19, flexDirection: "row", alignItems: "center" }, clubMark: { color: "#08242b", backgroundColor: "#39d6c4", borderRadius: 3, overflow: "hidden", fontSize: 15, paddingHorizontal: 6, paddingVertical: 4, fontWeight: "900" }, clubText: { color: "white", fontSize: 16, fontWeight: "700", flex: 1 }, clubArrow: { color: "white", fontSize: 30 },
  reviewCard: { marginHorizontal: 20, backgroundColor: "#f4f5f6", borderRadius: 14, padding: 12, flexDirection: "row" }, reviewPhoto: { width: 80, height: 80, borderRadius: 10, overflow: "hidden" }, fillImage: { width: "100%", height: "100%", resizeMode: "cover" }, reviewCopy: { paddingLeft: 12, justifyContent: "center", flex: 1 }, reviewStars: { color: "#ffc312", fontSize: 17, letterSpacing: 1 }, reviewText: { marginTop: 5, lineHeight: 21, fontSize: 14, fontWeight: "600" }, separator: { marginTop: 21, height: 10, backgroundColor: "#f3f4f5" },
  chips: { paddingHorizontal: 18, paddingVertical: 16, gap: 8 }, chip: { borderWidth: 1, borderColor: "#ddd", borderRadius: 22, paddingHorizontal: 15, paddingVertical: 10 }, chipActive: { backgroundColor: "#151515", borderColor: "#151515" }, chipText: { fontSize: 15, fontWeight: "700" }, chipTextActive: { color: "white" },
  menuHeader: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 6 }, menuHeading: { fontSize: 25, fontWeight: "900" }, menuSub: { color: "#888", marginTop: 8, fontSize: 16 }, menuItem: { minHeight: 170, padding: 20, borderBottomWidth: 1, borderColor: "#eee", flexDirection: "row" }, menuText: { flex: 1, paddingRight: 14 }, rankBadge: { alignSelf: "flex-start", backgroundColor: "#f3f4f5", borderRadius: 5, paddingHorizontal: 7, paddingVertical: 4, color: "#666", fontSize: 12, fontWeight: "800" }, itemName: { marginTop: 8, fontSize: 19, fontWeight: "900" }, itemDesc: { marginTop: 5, color: "#858585", fontSize: 14, lineHeight: 19 }, itemPrice: { marginTop: 7, fontSize: 19, fontWeight: "900" }, itemReview: { marginTop: 5, color: "#777" }, itemPhoto: { width: 118, height: 118, borderRadius: 14, overflow: "visible", borderWidth: 1, borderColor: "#f0f0f0" }, plusButton: { position: "absolute", right: -9, bottom: -9, width: 42, height: 42, borderRadius: 21, backgroundColor: "white", borderWidth: 1, borderColor: "#eee", justifyContent: "center", alignItems: "center", shadowColor: "#777", shadowOpacity: .2, shadowRadius: 5, elevation: 4 }, plus: { fontSize: 28, lineHeight: 31 },
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, minHeight: 91, padding: 14, paddingHorizontal: 19, backgroundColor: "white", borderTopWidth: 1, borderColor: "#eee", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, bottomPrice: { fontSize: 25, fontWeight: "900" }, bottomHint: { marginTop: 3, color: "#666" }, orderButton: { backgroundColor: "#54dccc", paddingHorizontal: 19, paddingVertical: 18, borderRadius: 13 }, orderText: { fontSize: 18, fontWeight: "900" }, orderButtonDisabled: { backgroundColor: "#d8dcde" },
});

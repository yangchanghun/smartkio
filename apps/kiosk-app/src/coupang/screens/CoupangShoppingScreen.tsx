import { useCallback, useRef, useState } from "react";
import {
  Animated,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  PanResponder,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { CoupangMissionModal } from "../components/CoupangMissionModal";
import { CoupangLogo, PrimaryButton } from "../components/CoupangUi";
import {
  coupangProducts,
  formatWon,
  missionProducts,
  searchProducts,
  type CoupangProduct,
} from "../data/products";
import { usePracticeSession } from "../../practice/hooks/usePracticeSession";

type ShopStage =
  | "home"
  | "search"
  | "results"
  | "detail"
  | "checkout"
  | "complete";
const missions: Record<ShopStage, { step: number; text: string }> = {
  home: { step: 1, text: "검색창을 눌러 구매할 상품을 검색해보세요." },
  search: { step: 2, text: "검색창에 휴지를 입력하고 검색 버튼을 눌러보세요." },
  results: { step: 3, text: "검색 결과에서 라벤더 화장지를 선택해보세요." },
  detail: {
    step: 4,
    text: "상품 정보와 가격을 확인하고 바로구매를 눌러보세요.",
  },
  checkout: {
    step: 5,
    text: "배송지와 결제수단을 확인한 뒤 밀어서 결제하기를 눌러보세요.",
  },
  complete: { step: 6, text: "상품 구매 연습을 모두 완료했어요." },
};

export function CoupangShoppingScreen({
  onBack,
  onHome,
  token,
}: {
  onBack: () => void;
  onHome: () => void;
  token: string;
}) {
  const { completePractice, restartPracticeSession } = usePracticeSession(token, "COUPANG_SHOPPING");
  const [stage, setStage] = useState<ShopStage>("home");
  const [missionVisible, setMissionVisible] = useState(true);
  const [query, setQuery] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [missionProduct] = useState(
    () => missionProducts[Math.floor(Math.random() * missionProducts.length)],
  );
  const [selectedProduct, setSelectedProduct] =
    useState<CoupangProduct>(missionProduct);
  const results = searchProducts(query);
  const mission =
    stage === "search"
      ? {
          step: 2,
          text: `검색창에 '${missionProduct.missionTerm}'을 입력하고 검색 버튼을 눌러보세요.`,
        }
      : stage === "results"
        ? { step: 3, text: "검색 결과에서 원하는 상품을 하나 선택해보세요." }
        : missions[stage];
  const go = useCallback((next: ShopStage) => {
    setStage(next);
    setMissionVisible(true);
  }, []);
  const back = () => {
    if (stage === "home") onBack();
    else if (stage === "search") go("home");
    else if (stage === "results") go("search");
    else if (stage === "detail") go("results");
    else if (stage === "checkout") go("detail");
    else onBack();
  };
  const search = () => {
    if (results.length === 0) {
      Alert.alert(
        "검색 결과가 없어요",
        "휴지, 생수, 쌀, 세제, 라면, 샴푸, 양말, 사과 등을 검색해보세요.",
      );
      return;
    }
    go("results");
  };
  const searchAgain = () => {
    if (results.length === 0)
      Alert.alert(
        "검색 결과가 없어요",
        "다른 상품 이름이나 종류를 입력해보세요.",
      );
  };
  const finishPurchase = useCallback(async () => {
    try {
      await completePractice();
    } finally {
      go("complete");
    }
  }, [completePractice, go]);
  const practiceAgain = useCallback(() => {
    void restartPracticeSession().catch(() => undefined);
    setQuery("");
    setQuantity(1);
    go("home");
  }, [go, restartPracticeSession]);

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={s.safe}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {stage !== "home" ? (
          <View style={s.header}>
            <Pressable style={s.back} onPress={back}>
              <Text style={s.backText}>‹</Text>
            </Pressable>
            <Text style={s.headerTitle}>
              {stage === "checkout"
                ? "주문/결제"
                : stage === "complete"
                  ? "구매 완료"
                  : "쿠팡"}
            </Text>
            <Pressable style={s.voice} onPress={() => setMissionVisible(true)}>
              <Text>🔊</Text>
            </Pressable>
          </View>
        ) : null}
        {stage === "home" ? (
          <Home
            onBack={onBack}
            onSearch={() => go("search")}
            onMission={() => setMissionVisible(true)}
          />
        ) : null}
        {stage === "search" ? (
          <Search
            query={query}
            setQuery={setQuery}
            missionTerm={missionProduct.missionTerm}
            onSearch={search}
          />
        ) : null}
        {stage === "results" ? (
          <Results
            query={query}
            products={results}
            setQuery={setQuery}
            onSearch={searchAgain}
            onSelect={(product) => {
              setSelectedProduct(product);
              go("detail");
            }}
          />
        ) : null}
        {stage === "detail" ? (
          <Detail
            product={selectedProduct}
            quantity={quantity}
            setQuantity={setQuantity}
            onBuy={() => go("checkout")}
          />
        ) : null}
        {stage === "checkout" ? (
          <Checkout
            product={selectedProduct}
            quantity={quantity}
            onPay={() => void finishPurchase()}
          />
        ) : null}
        {stage === "complete" ? (
          <Complete
            product={selectedProduct}
            onAgain={practiceAgain}
            onHome={onHome}
          />
        ) : null}
        <CoupangMissionModal
          visible={missionVisible}
          step={mission.step}
          instruction={mission.text}
          onClose={() => setMissionVisible(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function BottomNav({ active = "home" }: { active?: "home" | "search" }) {
  return (
    <View style={s.nav}>
      {[
        ["⌂", "홈", "home"],
        ["▦", "카테고리", ""],
        ["⌕", "검색", "search"],
        ["♙", "마이쿠팡", ""],
        ["🛒", "장바구니", ""],
      ].map(([icon, label, id]) => (
        <View key={label} style={s.navItem}>
          <Text style={[s.navIcon, id === active && s.active]}>{icon}</Text>
          <Text style={[s.navLabel, id === active && s.active]}>{label}</Text>
        </View>
      ))}
    </View>
  );
}
function Home({
  onBack,
  onSearch,
  onMission,
}: {
  onBack: () => void;
  onSearch: () => void;
  onMission: () => void;
}) {
  const featured = coupangProducts[0];
  return (
    <View style={s.stage}>
      <ScrollView contentContainerStyle={s.homeScroll}>
        <View style={s.homeTop}>
          <Pressable onPress={onBack}>
            <Text style={s.homeBack}>‹</Text>
          </Pressable>
          <CoupangLogo />
          <Pressable onPress={onMission}>
            <Text style={s.bell}>🔊</Text>
          </Pressable>
        </View>
        <Pressable style={s.searchBar} onPress={onSearch}>
          <Text style={s.searchIcon}>⌕</Text>
          <Text style={s.placeholder}>쿠팡에서 검색하세요!</Text>
          <Text style={s.camera}>▣</Text>
        </Pressable>
        <View style={s.hero}>
          <Text style={s.heroEyebrow}>오늘만 특가</Text>
          <Text style={s.heroTitle}>생활용품{`\n`}최대 35% 할인</Text>
        </View>
        <View style={s.categories}>
          {[
            ["🧺", "자주산상품"],
            ["🎁", "쿠팡플레이"],
            ["🥬", "로켓프레시"],
            ["🍪", "쿠팡이츠"],
            ["🏆", "골드박스"],
            ["👗", "패션/잡화"],
            ["⏱️", "반짝세일"],
            ["🚀", "로켓배송"],
          ].map(([icon, label]) => (
            <View key={label} style={s.category}>
              <Text style={s.categoryIcon}>{icon}</Text>
              <Text style={s.categoryText}>{label}</Text>
            </View>
          ))}
        </View>
        <Text style={s.sectionTitle}>이 상품 놓치지 마세요!</Text>
        {coupangProducts.slice(0, 3).map((product) => (
          <View key={product.id} style={s.recommend}>
            <Image
              source={product.image}
              style={s.recommendImage}
              resizeMode="contain"
            />
            <View style={s.recommendInfo}>
              <Text style={s.recommendTitle}>{product.shortName}</Text>
              <Text style={s.price}>{formatWon(product.price)}</Text>
              <Text style={s.rocket}>
                🚀 {product.badge} · {product.delivery}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <BottomNav />
    </View>
  );
}
function Search({
  query,
  setQuery,
  missionTerm,
  onSearch,
}: {
  query: string;
  setQuery: (v: string) => void;
  missionTerm: string;
  onSearch: () => void;
}) {
  return (
    <View style={s.stage}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={s.searchPage}
      >
        <View style={s.searchInputWrap}>
          <Text style={s.searchIcon}>⌕</Text>
          <TextInput
            autoFocus
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={onSearch}
            placeholder="검색어 입력"
            placeholderTextColor="#a5acb5"
            style={s.searchInput}
            returnKeyType="search"
          />
          <Pressable style={s.searchSubmit} onPress={onSearch}>
            <Text style={s.searchSubmitText}>검색</Text>
          </Pressable>
        </View>
        <Text style={s.searchHeading}>최근 검색어</Text>
        <Text style={s.empty}>검색 내역이 없습니다.</Text>
        <Text style={s.searchHeading}>추천 검색어</Text>
        <View style={s.chips}>
          {["휴지", "생수", "쌀", "세제", "라면", "샴푸", "양말", "사과"].map(
            (x) => (
              <Pressable key={x} style={s.chip} onPress={() => setQuery(x)}>
                <Text style={s.chipText}>{x}</Text>
              </Pressable>
            ),
          )}
        </View>
        <Text style={s.searchHeading}>이번 연습 상품</Text>
        <View style={s.tip}>
          <Text style={s.tipIcon}>💡</Text>
          <Text style={s.tipText}>
            검색창에 <Text style={s.bold}>{missionTerm}</Text>을 입력한 뒤
            검색을 눌러주세요.
          </Text>
        </View>
      </ScrollView>
      <BottomNav active="search" />
    </View>
  );
}
function Results({
  query,
  products,
  setQuery,
  onSearch,
  onSelect,
}: {
  query: string;
  products: CoupangProduct[];
  setQuery: (value: string) => void;
  onSearch: () => void;
  onSelect: (product: CoupangProduct) => void;
}) {
  return (
    <View style={s.stage}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={s.results}
      >
        <View style={s.resultSearch}>
          <Text style={s.searchIcon}>⌕</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={onSearch}
            returnKeyType="search"
            placeholder="쿠팡에서 검색하세요!"
            placeholderTextColor="#8793a3"
            style={s.resultInput}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="다시 검색"
            style={s.resultSearchButton}
            onPress={onSearch}
          >
            <Text style={s.resultSearchButtonText}>검색</Text>
          </Pressable>
        </View>
        <View style={s.filters}>
          {["☷", "🚀 로켓", "🚀 오늘/새벽", "가격대⌄", "판매량순"].map((x) => (
            <View key={x} style={s.filter}>
              <Text style={s.filterText}>{x}</Text>
            </View>
          ))}
        </View>
        <View style={s.resultControls}>
          <Text style={s.deliveryToggle}>◯　배송비 포함</Text>
          <Text style={s.ranking}>쿠팡 랭킹순 ▾　▦</Text>
        </View>
        <View style={s.benefit}>
          <Text style={s.benefitText}>
            놓친 <Text style={s.benefitRed}>혜택</Text>이 있어요.
          </Text>
          <Text style={s.benefitAction}>혜택 알림 받기　›</Text>
        </View>
        <View style={s.productGrid}>
          {products.map((product) => (
            <Pressable
              key={product.id}
              style={s.productCard}
              onPress={() => onSelect(product)}
            >
              <Image
                source={product.image}
                style={s.gridImage}
                resizeMode="contain"
              />
              <Text style={s.ad}>광고 ⓘ</Text>
              <Text style={s.productName}>{product.name}</Text>
              {product.originalPrice ? (
                <Text style={s.original}>
                  {formatWon(product.originalPrice)}
                </Text>
              ) : null}
              <Text style={s.discount}>
                {product.discount ?? 0}%{" "}
                <Text style={s.bigPrice}>{formatWon(product.price)}</Text>
              </Text>
              <Text style={s.free}>{product.badge}</Text>
              <Text style={s.arrivalGreen}>{product.delivery}</Text>
              <Text style={s.rating}>
                ★★★★★ ({product.reviewCount.toLocaleString()})　›
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <BottomNav active="search" />
    </View>
  );
}
function Detail({
  product,
  quantity,
  setQuantity,
  onBuy,
}: {
  product: CoupangProduct;
  quantity: number;
  setQuantity: (n: number) => void;
  onBuy: () => void;
}) {
  return (
    <View style={s.stage}>
      <ScrollView contentContainerStyle={s.detail}>
        <Image
          source={product.image}
          style={s.detailImage}
          resizeMode="contain"
        />
        <Text style={s.socialProof}>
          한 달간 <Text style={s.orange}>1,000명 이상</Text> 구매했어요
        </Text>
        <Text style={s.seller} numberOfLines={1} adjustsFontSizeToFit>
          공식 판매자 ★★★★★ ({product.reviewCount.toLocaleString()})
        </Text>
        <Text style={s.detailName} numberOfLines={3}>
          {product.name}
        </Text>
        <View style={s.option}>
          <View style={s.optionCopy}>
            <Text style={s.optionHint}>상품 옵션 × 수량</Text>
            <Text style={s.optionText} numberOfLines={2} adjustsFontSizeToFit>
              {product.shortName} × {quantity}개
            </Text>
          </View>
          <Image
            source={product.image}
            style={s.optionImage}
            resizeMode="contain"
          />
        </View>
        <Text style={s.detailPrice}>
          <Text style={s.discountSmall}>{product.discount ?? 0}% </Text>
          {formatWon(product.price)}
        </Text>
        <Text style={s.delivery} numberOfLines={2}>
          🚚 {product.badge}　📅 {product.delivery}
        </Text>
      </ScrollView>
      <View style={s.buyBar}>
        <Pressable
          style={s.quantity}
          onPress={() => setQuantity(quantity === 1 ? 2 : 1)}
        >
          <Text style={s.quantityText}>{quantity}⌄</Text>
        </Pressable>
        <Pressable
          style={s.cartButton}
          onPress={() =>
            Alert.alert(
              "장바구니에 담았어요",
              "이번 미션에서는 바로구매를 눌러보세요.",
            )
          }
        >
          <Text style={s.cartText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
            장바구니 담기
          </Text>
        </Pressable>
        <Pressable style={s.buyButton} onPress={onBuy}>
          <Text style={s.buyText} numberOfLines={1} adjustsFontSizeToFit>
            바로구매
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
function Checkout({
  product,
  quantity,
  onPay,
}: {
  product: CoupangProduct;
  quantity: number;
  onPay: () => void;
}) {
  const total = product.price * quantity;
  const [address, setAddress] = useState("");
  return (
    <View style={s.stage}>
      <ScrollView contentContainerStyle={s.checkout}>
        <View style={s.orderCard}>
          <View style={s.orderProduct}>
            <Image
              source={product.image}
              style={s.orderImage}
              resizeMode="contain"
            />
            <View style={s.orderInfo}>
              <Text style={s.orderTitle} numberOfLines={2}>
                {product.shortName}, {quantity}개
              </Text>
              <Text style={s.orderPrice} numberOfLines={1} adjustsFontSizeToFit>
                {formatWon(total)} <Text style={s.orderSub}>총 결제 금액</Text>
              </Text>
              <Text style={s.orderSub}>
                {product.badge} / 수량 {quantity}개
              </Text>
            </View>
          </View>
          <View style={s.divider} />
          <Text style={s.rowTitle}>📍 배송지 주소</Text>
          <TextInput
            value={address}
            onChangeText={setAddress}
            style={s.addressInput}
            placeholder="배송받을 주소를 입력하세요"
            placeholderTextColor="#8a93a0"
            returnKeyType="done"
            accessibilityLabel="배송지 주소 입력"
          />
          <Text style={s.addressHint}>예: 서울시 강남구 테헤란로 123, 101동 202호</Text>
          <Text style={s.arrival}>{product.delivery}</Text>
          <View style={s.divider} />
          <Text style={s.rowTitle}>
            ▣ 결제수단 <Text style={s.change}>변경</Text>
          </Text>
          <Text style={s.rowMain}>신용/체크카드</Text>
          <Text style={s.rowSub}>연습용 카드, 일시불</Text>
        </View>
        <Text style={s.terms}>
          주문 내용을 확인했으며 구매조건 및 개인정보 제공에 동의합니다.
        </Text>
      </ScrollView>
      <View style={s.payFooter}>
        <Text style={s.total}>결제금액　{formatWon(total)}</Text>
        <SlideToPay
          enabled={address.trim().length > 0}
          onPay={onPay}
          onMissingAddress={() =>
            Alert.alert("배송지를 입력해 주세요", "결제하기 전에 배송받을 주소가 필요해요.")
          }
        />
      </View>
    </View>
  );
}

function SlideToPay({ enabled, onPay, onMissingAddress }: { enabled: boolean; onPay: () => void; onMissingAddress: () => void }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const maxX = useRef(0);
  const paid = useRef(false);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const reset = () => Animated.spring(translateX, { toValue: 0, useNativeDriver: true, bounciness: 7 }).start();
  const finish = () => {
    if (paid.current) return;
    paid.current = true;
    Animated.timing(translateX, { toValue: maxX.current, duration: 160, useNativeDriver: true }).start(onPay);
  };
  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 3,
    onPanResponderGrant: () => translateX.stopAnimation(),
    onPanResponderMove: (_, gesture) => translateX.setValue(Math.max(0, Math.min(gesture.dx, maxX.current))),
    onPanResponderRelease: (_, gesture) => {
      if (!enabledRef.current) { reset(); onMissingAddress(); return; }
      if (gesture.dx >= maxX.current * 0.82) finish();
      else reset();
    },
    onPanResponderTerminate: reset,
  })).current;

  return (
    <View
      style={[s.slidePay, !enabled && s.slidePayDisabled]}
      onLayout={(event) => { maxX.current = Math.max(event.nativeEvent.layout.width - 76, 0); }}
      accessibilityRole="adjustable"
      accessibilityLabel="밀어서 결제하기"
      accessibilityHint="손잡이를 오른쪽 끝까지 밀어주세요"
      accessibilityActions={[{ name: "increment", label: "결제하기" }]}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName !== "increment") return;
        if (enabled) finish(); else onMissingAddress();
      }}
    >
      <Text pointerEvents="none" style={s.slideText}>{enabled ? "밀어서 결제하기" : "먼저 배송지를 입력하세요"}</Text>
      <Animated.View {...panResponder.panHandlers} style={[s.slideHandle, { transform: [{ translateX }] }]}>
        <Text style={s.slideArrow}>≫</Text>
      </Animated.View>
    </View>
  );
}
function Complete({
  product,
  onAgain,
  onHome,
}: {
  product: CoupangProduct;
  onAgain: () => void;
  onHome: () => void;
}) {
  return (
    <View style={s.complete}>
      <Text style={s.completeIcon}>✓</Text>
      <Text style={s.completeTitle}>상품 구매 연습 완료!</Text>
      <Text style={s.completeSub}>
        상품 검색부터 주문 확인까지 잘 해냈어요.{`\n`}실제 결제는 진행되지
        않았습니다.
      </Text>
      <View style={s.completeProduct}>
        <Image
          source={product.image}
          style={s.completeImage}
          resizeMode="contain"
        />
        <Text style={s.completeProductText}>
          {product.shortName}
          {`\n`}
          {product.delivery}
        </Text>
      </View>
      <View style={s.completeButtons}>
        <PrimaryButton label="다른 상품도 구매해보기" onPress={onAgain} />
        <Pressable style={s.outline} onPress={onHome}>
          <Text style={s.outlineText}>쿠팡 연습 선택으로</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "white" },
  stage: { flex: 1 },
  header: {
    height: 76,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  back: { position: "absolute", left: 18, width: 50 },
  backText: { fontSize: 46 },
  headerTitle: { fontSize: 24, fontWeight: "900" },
  voice: {
    position: "absolute",
    right: 22,
    padding: 14,
    backgroundColor: "#edf4ff",
    borderRadius: 25,
  },
  homeScroll: { paddingBottom: 30 },
  homeTop: {
    paddingHorizontal: 28,
    height: 110,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  homeBack: { fontSize: 46 },
  bell: { fontSize: 26 },
  searchBar: {
    marginHorizontal: 28,
    height: 76,
    borderWidth: 3,
    borderColor: "#111",
    borderRadius: 38,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  searchIcon: { fontSize: 35 },
  placeholder: { flex: 1, marginLeft: 12, fontSize: 23, color: "#8692a2" },
  camera: { fontSize: 28 },
  hero: {
    height: 250,
    marginTop: 24,
    backgroundColor: "#e8dfd4",
    padding: 38,
    overflow: "hidden",
  },
  heroEyebrow: { fontSize: 19, fontWeight: "800", color: "#6f573f" },
  heroTitle: {
    fontSize: 38,
    lineHeight: 48,
    fontWeight: "900",
    color: "#3c332b",
  },
  heroImage: {
    position: "absolute",
    right: 20,
    bottom: -18,
    width: "52%",
    height: 320,
  },
  categories: {
    paddingVertical: 24,
    paddingHorizontal: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  category: {
    width: "24%",
    minWidth: 120,
    alignItems: "center",
    paddingVertical: 12,
  },
  categoryIcon: { fontSize: 42 },
  categoryText: { fontSize: 15, fontWeight: "700", marginTop: 8 },
  sectionTitle: { fontSize: 26, fontWeight: "900", padding: 24 },
  recommend: {
    marginHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e1e4e8",
    padding: 18,
    flexDirection: "row",
  },
  recommendImage: { width: 150, height: 150 },
  recommendInfo: { flex: 1, justifyContent: "center" },
  recommendTitle: { fontSize: 19, fontWeight: "700" },
  price: { fontSize: 26, fontWeight: "900", marginTop: 10 },
  rocket: { color: "#008d3d", marginTop: 8, fontSize: 16 },
  nav: {
    height: 92,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "white",
    flexDirection: "row",
  },
  navItem: { flex: 1, alignItems: "center", justifyContent: "center" },
  navIcon: { fontSize: 28, color: "#111" },
  navLabel: { fontSize: 12, marginTop: 4 },
  active: { color: "#3478eb" },
  searchPage: { padding: 30 },
  searchInputWrap: {
    height: 76,
    borderWidth: 3,
    borderColor: "#111",
    borderRadius: 38,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 20,
  },
  searchInput: { flex: 1, fontSize: 24, paddingHorizontal: 15 },
  searchSubmit: {
    height: 58,
    paddingHorizontal: 25,
    marginRight: 7,
    borderRadius: 28,
    backgroundColor: "#3478eb",
    justifyContent: "center",
  },
  searchSubmitText: { color: "white", fontWeight: "900", fontSize: 18 },
  searchHeading: { fontSize: 23, fontWeight: "900", marginTop: 36 },
  empty: { fontSize: 20, color: "#999", marginTop: 24 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 20 },
  chip: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    backgroundColor: "#e8f7e9",
  },
  chipText: { fontSize: 18, color: "#118b2b", fontWeight: "800" },
  tip: {
    marginTop: 24,
    padding: 20,
    backgroundColor: "#eef5ff",
    borderRadius: 14,
    flexDirection: "row",
  },
  tipIcon: { fontSize: 24, marginRight: 10 },
  tipText: { fontSize: 18, lineHeight: 26 },
  bold: { fontWeight: "900", color: "#3478eb" },
  results: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 120 },
  resultSearch: {
    height: 58,
    borderWidth: 2.5,
    borderColor: "#111",
    borderRadius: 29,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 16,
  },
  resultInput: { flex: 1, fontSize: 20, paddingHorizontal: 10, color: "#111" },
  resultSearchButton: {
    height: 44,
    marginRight: 6,
    paddingHorizontal: 17,
    borderRadius: 22,
    backgroundColor: "#3478eb",
    alignItems: "center",
    justifyContent: "center",
  },
  resultSearchButtonText: { color: "white", fontSize: 15, fontWeight: "900" },
  filters: { flexDirection: "row", gap: 6, marginTop: 12, flexWrap: "wrap" },
  filter: {
    borderWidth: 1,
    borderColor: "#aeb7c3",
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  filterText: { fontSize: 13, fontWeight: "700" },
  resultControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 13,
  },
  deliveryToggle: { fontSize: 14, color: "#566171" },
  ranking: { fontSize: 15, fontWeight: "800" },
  benefit: {
    minHeight: 72,
    backgroundColor: "#f0f1f3",
    borderRadius: 10,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  benefitText: { fontSize: 18, fontWeight: "900" },
  benefitRed: { color: "#ef2a2a" },
  benefitAction: { fontSize: 14, fontWeight: "800" },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 12,
    rowGap: 28,
  },
  productCard: { width: "48%", alignSelf: "flex-start" },
  gridImage: { width: "100%", height: 205, backgroundColor: "#fafafa" },
  altProduct: {
    height: 205,
    backgroundColor: "#f1ecf8",
    alignItems: "center",
    justifyContent: "center",
  },
  altEmoji: { fontSize: 90 },
  ad: { fontSize: 12, color: "#929aa5", textAlign: "right", marginTop: 4 },
  productName: { fontSize: 16, lineHeight: 22, marginTop: 6, minHeight: 44 },
  original: {
    textDecorationLine: "line-through",
    color: "#8d95a0",
    marginTop: 6,
    fontSize: 14,
  },
  discount: { color: "#d92816", fontWeight: "900", fontSize: 17, marginTop: 2 },
  bigPrice: { fontSize: 22 },
  free: {
    alignSelf: "flex-start",
    backgroundColor: "#d8f2ff",
    fontWeight: "800",
    fontSize: 13,
    paddingHorizontal: 5,
    paddingVertical: 3,
    marginTop: 6,
  },
  arrivalGreen: {
    color: "#168b2e",
    fontWeight: "800",
    fontSize: 13,
    marginTop: 6,
  },
  rating: { color: "#f58431", fontSize: 13, marginTop: 7 },
  detail: { padding: 24, paddingBottom: 125 },
  detailImage: { width: "100%", height: 470, backgroundColor: "#fafafa" },
  socialProof: { fontSize: 19, fontWeight: "800", marginTop: 20 },
  orange: { color: "#dc5916" },
  seller: { fontSize: 16, color: "#43506a", marginTop: 21 },
  detailName: { fontSize: 22, lineHeight: 31, marginTop: 20 },
  option: {
    marginTop: 22,
    borderWidth: 1,
    borderColor: "#cbd1d9",
    borderRadius: 14,
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
  },
  optionCopy: { flex: 1, minWidth: 0, paddingRight: 10 },
  optionHint: { fontSize: 16, color: "#748091" },
  optionText: { fontSize: 20, lineHeight: 27, fontWeight: "900", marginTop: 7 },
  optionImage: { width: 78, height: 78, flexShrink: 0 },
  detailPrice: { fontSize: 31, fontWeight: "900", marginTop: 23 },
  discountSmall: { fontSize: 18, fontWeight: "500" },
  delivery: { fontSize: 17, lineHeight: 24, fontWeight: "700", marginTop: 15 },
  buyBar: {
    height: 92,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    flexDirection: "row",
    padding: 10,
    gap: 8,
  },
  quantity: {
    width: 74,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityText: { fontSize: 20, fontWeight: "800" },
  cartButton: {
    flex: 1.05,
    minWidth: 0,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: "#3478eb",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cartText: { color: "#3478eb", fontSize: 17, fontWeight: "900", textAlign: "center" },
  buyButton: {
    flex: 1.25,
    minWidth: 0,
    paddingHorizontal: 8,
    backgroundColor: "#3478eb",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buyText: { color: "white", fontSize: 20, fontWeight: "900" },
  checkout: { padding: 25, paddingBottom: 190, backgroundColor: "#f3f4f6" },
  orderCard: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#c9ced6",
    padding: 22,
  },
  orderProduct: { flexDirection: "row" },
  orderImage: { width: 140, height: 140 },
  orderInfo: { flex: 1, justifyContent: "center" },
  orderTitle: { fontSize: 19, fontWeight: "800", lineHeight: 27 },
  orderPrice: { fontSize: 28, fontWeight: "900", marginTop: 8 },
  orderSub: { fontSize: 16, color: "#626b78", marginTop: 7 },
  divider: { height: 1, backgroundColor: "#ddd", marginVertical: 24 },
  rowTitle: { fontSize: 21, fontWeight: "900" },
  change: { color: "#3478eb", fontSize: 16 },
  rowMain: { fontSize: 19, fontWeight: "800", marginTop: 14 },
  rowSub: { fontSize: 17, color: "#555", marginTop: 7 },
  addressInput: { height: 60, borderWidth: 1.5, borderColor: "#aeb7c3", borderRadius: 9, paddingHorizontal: 15, fontSize: 17, color: "#111", marginTop: 14, backgroundColor: "white" },
  addressHint: { fontSize: 14, color: "#737d8b", marginTop: 8, lineHeight: 20 },
  arrival: { fontSize: 18, fontWeight: "800", marginTop: 14 },
  terms: { fontSize: 15, color: "#777", lineHeight: 23, marginTop: 20 },
  payFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "white",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  total: {
    fontSize: 18,
    fontWeight: "900",
    textAlign: "right",
    marginBottom: 12,
  },
  slidePay: {
    height: 70,
    backgroundColor: "#6f95ed",
    borderRadius: 8,
    overflow: "hidden",
    justifyContent: "center",
  },
  slidePayDisabled: { backgroundColor: "#aeb7c6" },
  slideHandle: { position: "absolute", left: 0, top: 0, width: 76, height: 70, backgroundColor: "#3478eb", alignItems: "center", justifyContent: "center" },
  slideArrow: {
    textAlign: "center",
    color: "white",
    fontSize: 34,
  },
  slideText: {
    textAlign: "center",
    color: "white",
    fontSize: 22,
    fontWeight: "900",
    paddingHorizontal: 82,
  },
  complete: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: "#f6f8fb",
  },
  completeIcon: {
    width: 110,
    height: 110,
    borderRadius: 55,
    textAlign: "center",
    textAlignVertical: "center",
    backgroundColor: "#3478eb",
    color: "white",
    fontSize: 60,
    fontWeight: "900",
  },
  completeTitle: { fontSize: 32, fontWeight: "900", marginTop: 30 },
  completeSub: {
    fontSize: 18,
    lineHeight: 28,
    color: "#657080",
    textAlign: "center",
    marginTop: 14,
  },
  completeProduct: {
    width: "100%",
    maxWidth: 600,
    backgroundColor: "white",
    borderRadius: 18,
    padding: 20,
    marginTop: 28,
    flexDirection: "row",
    alignItems: "center",
  },
  completeImage: { width: 130, height: 130 },
  completeProductText: { fontSize: 19, lineHeight: 30, fontWeight: "700" },
  completeButtons: { width: "100%", maxWidth: 500, gap: 12, marginTop: 28 },
  outline: {
    height: 64,
    borderWidth: 2,
    borderColor: "#3478eb",
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineText: { color: "#3478eb", fontSize: 19, fontWeight: "900" },
});

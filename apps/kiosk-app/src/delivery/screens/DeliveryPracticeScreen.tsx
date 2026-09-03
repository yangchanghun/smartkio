import { useEffect, useState } from "react";
import { Alert, SafeAreaView, StyleSheet, View } from "react-native";
import * as Speech from "expo-speech";
import { DeliveryMissionModal } from "../components/DeliveryMissionModal";
import { SAMPLE_ADDRESSES } from "../data/addresses";
import type { DeliveryAddress } from "../types";
import { DeliveryAddressScreen } from "./DeliveryAddressScreen";
import { DeliveryHomeScreen } from "./DeliveryHomeScreen";
import { ChickenStoreListScreen } from "./ChickenStoreListScreen";
import { CHICKEN_MENU_ITEMS, ChickenStoreDetailScreen, type ChickenMenuItem } from "./ChickenStoreDetailScreen";
import { ChickenMenuOptionScreen } from "./ChickenMenuOptionScreen";
import { DeliveryOrderScreen } from "./DeliveryOrderScreen";
import { DeliveryPaymentScreen } from "./DeliveryPaymentScreen";
import { DeliveryCompleteScreen } from "./DeliveryCompleteScreen";
import type { ChickenStore } from "../data/chickenStores";
import { CHICKEN_STORES } from "../data/chickenStores";
import { usePracticeSession } from "../../practice/hooks/usePracticeSession";

export function DeliveryPracticeScreen({ onBack, token }: { onBack: () => void; token: string }) {
  const { completePractice, restartPracticeSession } = usePracticeSession(token, "DELIVERY");
  const [page, setPage] = useState<"home" | "address" | "stores" | "store-detail" | "menu-option" | "order" | "payment" | "complete">("home");
  const [selectedStore, setSelectedStore] = useState<ChickenStore>(CHICKEN_STORES[0]);
  const [selectedMenu, setSelectedMenu] = useState<ChickenMenuItem>(CHICKEN_MENU_ITEMS[0]);
  const [cartItems, setCartItems] = useState<ChickenMenuItem[]>([]);
  const [challengeRound, setChallengeRound] = useState(false);
  const [address, setAddress] = useState(SAMPLE_ADDRESSES[0]);
  const [hasSelectedAddress, setHasSelectedAddress] = useState(false);
  const [mission, setMission] = useState<"address" | "category" | "store" | "menu" | "add" | "extra" | "extraAdd" | "cart" | "order" | "payment" | "done">("address");
  const [missionVisible, setMissionVisible] = useState(true);
  const cartTotal = cartItems.reduce((sum, item) => sum + Number(item.price.replace(/[^0-9]/g, "")), 0);

  const speak = (message: string) => {
    void Speech.stop();
    Speech.speak(message, { language: "ko-KR", rate: 0.88, pitch: 1 });
  };

  useEffect(() => () => { void Speech.stop(); }, []);

  const openAddress = () => {
    setPage("address");
    speak("주소 설정 화면입니다. 목록에서 배달받을 주소를 하나 선택해 주세요.");
  };

  const selectAddress = (selected: DeliveryAddress) => {
    setAddress(selected);
    setHasSelectedAddress(true);
    setPage("home");
    setMission("category");
    setMissionVisible(true);
    speak(`${selected.name} 주소를 선택했습니다. 첫 번째 미션을 완료했습니다. 이제 치킨 카테고리를 선택해 보세요.`);
  };

  const wrongAction = () => {
    const message = mission === "address"
      ? "지금은 배달 주소를 설정하는 미션입니다. 화면 맨 위의 주소를 눌러 주세요."
      : mission === "category"
        ? "지금은 음식 종류를 선택하는 미션입니다. 치킨 카테고리를 찾아 눌러 주세요."
        : mission === "store"
          ? "지금은 치킨 가게를 선택하는 미션입니다. 배달팁 0원이고 약 20분 걸리는 스마트치킨 은평점을 눌러 주세요."
          : mission === "menu"
            ? "지금은 메뉴를 고르는 미션입니다. 바삭 후라이드 한마리를 눌러 주세요."
            : mission === "add"
              ? "지금은 메뉴를 담는 미션입니다. 화면 아래 담기 버튼을 눌러 주세요."
              : mission === "extra"
                ? "이번에는 달콤 양념 한마리를 추가로 골라 주세요."
                : mission === "extraAdd"
                  ? "양념치킨 옵션을 확인하고 담기 버튼을 눌러 주세요."
              : "지금은 주문 내용을 확인하는 미션입니다. 결제하기 버튼을 눌러 주세요.";
    Alert.alert("현재 미션을 확인해 주세요", message);
    speak(message);
  };

  const selectCategory = (category: string) => {
    if (category !== "치킨") {
      wrongAction();
      return;
    }
    if (mission !== "address" && mission !== "category") {
      setPage("stores");
      setMissionVisible(mission === "store");
      speak(
        mission === "store"
          ? "치킨 가게 목록으로 돌아왔습니다. 배달팁 0원이고 약 20분 걸리는 스마트치킨 은평점을 눌러 주세요."
          : "치킨 가게 목록을 다시 열었습니다. 스마트치킨 은평점을 눌러 이어서 연습하세요.",
      );
      return;
    }
    if (mission !== "category") {
      wrongAction();
      return;
    }
    setMission("store");
    setPage("stores");
    setMissionVisible(true);
    speak("치킨 카테고리를 선택했습니다. 두 번째 미션을 완료했습니다. 이제 배달팁과 배달 시간을 확인해 가게를 선택해 보세요.");
  };

  const selectStore = (store: ChickenStore) => {
    if (mission !== "address" && mission !== "category" && mission !== "store") {
      setSelectedStore(store);
      setPage("store-detail");
      speak(`${store.name} 가게를 선택했습니다.`);
      return;
    }
    if (mission !== "store" || store.id !== "smart-chicken") {
      wrongAction();
      return;
    }
    setMission("menu");
    setMissionVisible(true);
    setSelectedStore(store);
    setPage("store-detail");
    speak("스마트치킨 은평점을 선택했습니다. 세 번째 미션을 완료했습니다.");
  };

  const selectMenu = (menuId: ChickenMenuItem["id"]) => {
    const menu = CHICKEN_MENU_ITEMS.find((item) => item.id === menuId);
    if (!menu || mission === "address" || mission === "category" || mission === "store") { wrongAction(); return; }
    const firstTarget = challengeRound ? "half" : "fried";
    if ((mission === "menu" && menuId !== firstTarget) || (mission === "extra" && menuId !== "spicy")) { wrongAction(); return; }
    setSelectedMenu(menu);
    if (mission === "menu") {
      setMission("add"); setMissionVisible(true);
      speak(`${menu.name}을 선택했습니다. 메뉴 고르기 미션을 완료했습니다. 옵션을 확인한 뒤 담기 버튼을 눌러 주세요.`);
    } else if (mission === "extra") {
      setMission("extraAdd"); setMissionVisible(true);
      speak("양념치킨을 선택했습니다. 여섯 번째 미션을 완료했습니다. 옵션을 확인하고 담아 주세요.");
    } else if (mission !== "add" && mission !== "extraAdd") {
      setMission("add"); setMissionVisible(true);
      speak("메뉴 옵션 화면을 다시 열었습니다. 옵션을 확인한 뒤 담기 버튼을 눌러 주세요.");
    } else {
      speak("메뉴 옵션 화면으로 다시 들어왔습니다. 아래 담기 버튼을 눌러 주세요.");
    }
    setPage("menu-option");
  };
  const addMenu = () => {
    if (mission !== "add" && mission !== "extraAdd") { wrongAction(); return; }
    setCartItems((items) => [...items.filter((item) => item.id !== selectedMenu.id), selectedMenu]);
    if (mission === "add") {
      if (challengeRound) {
        setMission("cart"); setPage("store-detail"); setMissionVisible(true);
        speak("반반 치킨을 담았습니다. 장바구니 보기를 눌러 다시 주문해 보세요.");
        return;
      }
      setMission("extra"); setPage("store-detail"); setMissionVisible(true);
      speak("후라이드 치킨을 담았습니다. 다섯 번째 미션을 완료했습니다. 이번에는 달콤 양념 한마리도 추가로 골라 보세요.");
      return;
    }
    setMission("cart"); setPage("store-detail"); setMissionVisible(true);
    speak("양념치킨도 담았습니다. 일곱 번째 미션을 완료했습니다. 이제 장바구니 보기를 눌러 두 메뉴와 합계를 확인해 보세요.");
  };
  const openCart = () => {
    if (mission === "cart") {
      setMission("order"); setPage("order"); setMissionVisible(true);
      speak("장바구니를 열었습니다. 여덟 번째 미션을 완료했습니다. 두 메뉴와 합계를 확인하고 주문하기를 눌러 주세요.");
      return;
    }
    if (mission === "order" || mission === "done") {
      setPage("order");
      speak("장바구니 주문 내용을 다시 열었습니다.");
      return;
    }
    wrongAction();
  };
  const openPayment = () => {
    if (mission !== "order") { wrongAction(); return; }
    setMission("payment"); setPage("payment"); setMissionVisible(true);
    speak("주문하기를 눌렀습니다. 아홉 번째 미션을 완료했습니다. 결제수단과 할인 내용을 확인한 뒤 결제하기를 눌러 주세요.");
  };
  const pay = () => {
    if (mission !== "payment") { wrongAction(); return; }
    void completePractice().catch(() => undefined);
    setMission("done"); setPage("complete"); speak("주문 연습을 모두 완료했습니다. 정말 잘하셨어요. 처음부터 다시 연습하기 버튼을 누르면 주소 선택부터 다시 연습할 수 있습니다.");
  };
  const restartPractice = () => {
    void restartPracticeSession().catch(() => undefined);
    setAddress(SAMPLE_ADDRESSES[0]); setHasSelectedAddress(false); setSelectedStore(CHICKEN_STORES[0]); setSelectedMenu(CHICKEN_MENU_ITEMS[0]); setCartItems([]); setChallengeRound(false);
    setMission("address"); setPage("home"); setMissionVisible(true);
    speak("배달의민족 연습을 처음부터 다시 시작합니다. 홈 화면 맨 위의 배달 주소를 눌러 주세요.");
  };
  const orderAgain = () => {
    void restartPracticeSession().catch(() => undefined);
    const halfMenu = CHICKEN_MENU_ITEMS.find((item) => item.id === "half") ?? CHICKEN_MENU_ITEMS[0];
    setCartItems([]); setSelectedMenu(halfMenu); setChallengeRound(true);
    setMission("menu"); setPage("store-detail"); setMissionVisible(true);
    speak("추가 도전입니다. 이번에는 반반 치킨을 찾아 주문해 보세요.");
  };

  const missionCopy = mission === "address"
    ? {
        title: "1. 배달 주소 설정하기",
        description: "홈 화면 맨 위에 표시된 주소를 누른 다음, 배달받을 주소를 하나 선택해 보세요.",
        voice: "첫 번째 미션입니다. 홈 화면 맨 위에 표시된 배달 주소를 눌러 주세요.",
      }
    : mission === "category" ? {
        title: "2. 음식 종류 선택하기",
        description: "음식배달 카테고리 목록에서 치킨을 찾아 눌러 보세요.",
        voice: "두 번째 미션입니다. 음식 종류에서 치킨 카테고리를 찾아 눌러 주세요.",
      }
    : mission === "store" ? {
        title: "3. 치킨 가게 선택하기",
        description: "가게 정보를 비교해 배달팁이 0원이고 약 20분 걸리는 스마트치킨 은평점을 눌러 보세요.",
        voice: "세 번째 미션입니다. 배달팁 0원이고 약 20분 걸리는 스마트치킨 은평점을 찾아 눌러 주세요.",
      } : mission === "menu" ? {
        title: "4. 메뉴 고르기", description: challengeRound ? "추가 도전입니다. 반반 치킨을 찾아 눌러 보세요." : "가장 인기 있는 메뉴에서 바삭 후라이드 한마리를 눌러 보세요.", voice: challengeRound ? "추가 도전입니다. 반반 치킨을 찾아 눌러 주세요." : "네 번째 미션입니다. 바삭 후라이드 한마리를 눌러 주세요.",
      } : mission === "add" ? {
        title: "5. 메뉴 담기", description: "치킨 조각 옵션을 확인한 뒤 아래의 담기 버튼을 눌러 보세요.", voice: "다섯 번째 미션입니다. 화면 아래 담기 버튼을 눌러 주세요.",
      } : mission === "extra" ? {
        title: "6. 메뉴 하나 더 고르기", description: "한 가지 메뉴를 더 주문해 봅니다. 달콤 양념 한마리를 눌러 보세요.", voice: "여섯 번째 미션입니다. 달콤 양념 한마리를 추가로 골라 주세요.",
      } : mission === "extraAdd" ? {
        title: "7. 두 번째 메뉴 담기", description: "양념치킨 옵션을 확인한 뒤 담기 버튼을 눌러 보세요.", voice: "일곱 번째 미션입니다. 양념치킨도 장바구니에 담아 주세요.",
      } : mission === "cart" ? {
        title: "8. 장바구니 합계 확인", description: "메뉴 2개가 담겼습니다. 장바구니 보기에서 메뉴와 합계를 확인해 보세요.", voice: "여덟 번째 미션입니다. 장바구니 보기를 눌러 두 메뉴와 합계를 확인해 주세요.",
      } : {
        title: mission === "order" ? "9. 주문하기" : "10. 결제 내용 확인하기", description: mission === "order" ? "주문 메뉴와 배달주소를 확인하고 주문하기 버튼을 눌러 보세요." : "할인과 결제수단을 확인한 뒤 결제하기 버튼을 눌러 보세요. 실제 결제는 되지 않습니다.", voice: mission === "order" ? "아홉 번째 미션입니다. 주문 내용을 확인하고 주문하기를 눌러 주세요." : "열 번째 미션입니다. 결제 내용을 확인하고 결제하기를 눌러 주세요.",
      };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.shell}>
        {page === "home" ? (
          <DeliveryHomeScreen
            address={address}
            hasSelectedAddress={hasSelectedAddress}
            onOpenAddress={mission === "address" ? openAddress : wrongAction}
            onBack={onBack}
            onSelectCategory={selectCategory}
            onWrongPress={wrongAction}
          />
        ) : page === "address" ? (
          <DeliveryAddressScreen addresses={SAMPLE_ADDRESSES} selectedId={address.id} onSelect={selectAddress} onBack={() => setPage("home")} token={token} />
        ) : page === "stores" ? (
          <ChickenStoreListScreen onBack={() => setPage("home")} onSelectStore={selectStore} onWrongPress={wrongAction} />
        ) : page === "store-detail" ? (
          <ChickenStoreDetailScreen store={selectedStore} onBack={() => setPage("stores")} onSelectMenu={selectMenu} cartCount={cartItems.length} cartTotal={cartTotal} onOpenCart={openCart} onWrongPress={wrongAction} />
        ) : page === "menu-option" ? (
          <ChickenMenuOptionScreen menu={selectedMenu} onBack={() => setPage("store-detail")} onAdd={addMenu} />
        ) : page === "order" ? (
          <DeliveryOrderScreen address={address} items={cartItems} total={cartTotal} onBack={() => setPage("store-detail")} onPay={openPayment} />
        ) : page === "payment" ? (
          <DeliveryPaymentScreen total={cartTotal} onBack={() => setPage("order")} onPay={pay} />
        ) : (
          <DeliveryCompleteScreen onOrderAgain={orderAgain} onRestart={restartPractice} onBack={onBack} />
        )}
      </View>
      <DeliveryMissionModal
        visible={missionVisible && mission !== "done"}
        title={missionCopy.title}
        description={missionCopy.description}
        onConfirm={() => {
          setMissionVisible(false);
          speak(missionCopy.voice);
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#d7d7d7" },
  shell: { flex: 1, alignItems: "center" },
});

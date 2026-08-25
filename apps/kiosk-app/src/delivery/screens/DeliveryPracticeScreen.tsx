import { useEffect, useState } from "react";
import { Alert, SafeAreaView, StyleSheet, View } from "react-native";
import * as Speech from "expo-speech";
import { DeliveryMissionModal } from "../components/DeliveryMissionModal";
import { SAMPLE_ADDRESSES } from "../data/addresses";
import type { DeliveryAddress } from "../types";
import { DeliveryAddressScreen } from "./DeliveryAddressScreen";
import { DeliveryHomeScreen } from "./DeliveryHomeScreen";
import { ChickenStoreListScreen } from "./ChickenStoreListScreen";
import type { ChickenStore } from "../data/chickenStores";

export function DeliveryPracticeScreen({ onBack, token }: { onBack: () => void; token: string }) {
  const [page, setPage] = useState<"home" | "address" | "stores">("home");
  const [address, setAddress] = useState(SAMPLE_ADDRESSES[0]);
  const [mission, setMission] = useState<"address" | "category" | "store" | "done">("address");
  const [missionVisible, setMissionVisible] = useState(true);

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
        : "지금은 치킨 가게를 선택하는 미션입니다. 배달팁 0원이고 약 20분 걸리는 스마트치킨 은평점을 눌러 주세요.";
    Alert.alert("현재 미션을 확인해 주세요", message);
    speak(message);
  };

  const selectCategory = (category: string) => {
    if (category !== "치킨") {
      wrongAction();
      return;
    }
    if (mission === "store" || mission === "done") {
      setPage("stores");
      setMissionVisible(mission === "store");
      speak(
        mission === "store"
          ? "치킨 가게 목록으로 돌아왔습니다. 배달팁 0원이고 약 20분 걸리는 스마트치킨 은평점을 눌러 주세요."
          : "치킨 가게 목록을 다시 열었습니다. 가게 정보를 살펴보세요.",
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
    if (mission === "done") {
      speak(`${store.name} 가게를 선택했습니다.`);
      Alert.alert("가게 선택", `${store.name}을(를) 선택했습니다.`);
      return;
    }
    if (mission !== "store" || store.id !== "smart-chicken") {
      wrongAction();
      return;
    }
    setMission("done");
    speak("스마트치킨 은평점을 선택했습니다. 세 번째 미션을 완료했습니다.");
    Alert.alert("미션 완료", "배달팁 0원, 약 20분인 스마트치킨 은평점을 선택했습니다.");
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
    : {
        title: "3. 치킨 가게 선택하기",
        description: "가게 정보를 비교해 배달팁이 0원이고 약 20분 걸리는 스마트치킨 은평점을 눌러 보세요.",
        voice: "세 번째 미션입니다. 배달팁 0원이고 약 20분 걸리는 스마트치킨 은평점을 찾아 눌러 주세요.",
      };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.shell}>
        {page === "home" ? (
          <DeliveryHomeScreen
            address={address}
            onOpenAddress={mission === "address" ? openAddress : wrongAction}
            onBack={onBack}
            onSelectCategory={selectCategory}
            onWrongPress={wrongAction}
          />
        ) : page === "address" ? (
          <DeliveryAddressScreen addresses={SAMPLE_ADDRESSES} selectedId={address.id} onSelect={selectAddress} onBack={() => setPage("home")} token={token} />
        ) : (
          <ChickenStoreListScreen onBack={() => setPage("home")} onSelectStore={selectStore} onWrongPress={wrongAction} />
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

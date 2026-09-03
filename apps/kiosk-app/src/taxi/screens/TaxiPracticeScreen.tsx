import { useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import * as Speech from "expo-speech";
import * as Location from "expo-location";
import { usePracticeSession } from "../../practice/hooks/usePracticeSession";
import { TaxiMissionModal } from "../components/TaxiMissionModal";
import type { TaxiRoutePreview } from "../services/taxiApi";
import { TaxiCallConfirmScreen } from "./TaxiCallConfirmScreen";
import { TaxiCallingScreen } from "./TaxiCallingScreen";
import {
  TaxiDestinationScreen,
  type PlaceRole,
  type TaxiPlace,
} from "./TaxiDestinationScreen";
import { TaxiHomeScreen } from "./TaxiHomeScreen";
import { TaxiMapScreen, type TaxiVehicle } from "./TaxiMapScreen";
import { TaxiMapSearchScreen } from "./TaxiMapSearchScreen";
import { TaxiMatchedScreen } from "./TaxiMatchedScreen";
import { TaxiPickupScreen } from "./TaxiPickupScreen";

type Page =
  | "home"
  | "pickup"
  | "search"
  | "map-search"
  | "vehicle"
  | "confirm"
  | "calling"
  | "matched";
const GUIDES: Partial<Record<Page, { title: string; message: string }>> = {
  home: {
    title: "미션 1 · 택시 서비스 선택",
    message:
      "카카오 T에서 택시를 부르는 연습을 시작합니다. 화면의 택시 버튼을 눌러 주세요.",
  },
  pickup: {
    title: "미션 2 · 출발지와 도착지",
    message:
      "현재 위치가 출발지로 표시됩니다. 지도를 손가락이나 마우스로 움직여 출발 위치를 바꿔 보세요. 위치를 확인한 다음 ‘어디로 갈까요?’를 눌러 도착지를 선택하세요.",
  },
  vehicle: {
    title: "미션 3 · 택시 선택",
    message:
      "경로와 예상 요금을 확인하고 ‘일반호출’ 또는 ‘블루파트너스’를 선택해 보세요.",
  },
  confirm: {
    title: "미션 4 · 호출 내용 확인",
    message:
      "차량 종류, 결제 방법과 예상 요금을 확인한 뒤 ‘호출하기’를 눌러 보세요.",
  },
};

export function TaxiPracticeScreen({
  onBack,
  token,
}: {
  onBack: () => void;
  token: string;
}) {
  const { completePractice, restartPracticeSession } = usePracticeSession(
    token,
    "TAXI",
  );
  const [page, setPage] = useState<Page>("home");
  const shownGuides = useRef(new Set<Page>());
  const locating = useRef(false);
  const [role, setRole] = useState<PlaceRole>("destination");
  const [mapQuery, setMapQuery] = useState("");
  const [guideOpen, setGuideOpen] = useState(false);
  const [departure, setDeparture] = useState<TaxiPlace>({
    name: "현재 위치",
    address: "위치를 확인하고 있어요",
    latitude: 37.5774,
    longitude: 126.8909,
  });
  const [destination, setDestination] = useState<TaxiPlace | null>(null);
  const [vehicle, setVehicle] = useState<TaxiVehicle | null>(null);
  const [preview, setPreview] = useState<TaxiRoutePreview | null>(null);

  const moveToCurrentLocation = useCallback(async () => {
    if (locating.current) return;
    locating.current = true;
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        setDeparture((current) => ({
          ...current,
          name: "현재 위치",
          address: "위치 권한을 허용하면 실제 위치를 표시해요",
        }));
        return;
      }
      const result = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = result.coords;
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      const address = addresses[0];
      const addressText = address
        ? [
            address.region,
            address.city,
            address.district,
            address.street,
            address.streetNumber,
          ]
            .filter(Boolean)
            .join(" ")
        : "지도를 움직여 출발 위치를 조정하세요";
      setDeparture({
        name: "현재 위치",
        address: addressText,
        latitude,
        longitude,
      });
    } catch {
      setDeparture((current) => ({
        ...current,
        name: "현재 위치",
        address: "현재 위치를 확인하지 못했어요. 지도를 움직여 설정하세요",
      }));
    } finally {
      locating.current = false;
    }
  }, []);

  useEffect(() => {
    if (page === "pickup" && departure.name === "현재 위치") {
      void moveToCurrentLocation();
    }
  }, [departure.name, moveToCurrentLocation, page]);

  useEffect(() => {
    const guide = GUIDES[page];
    Speech.stop();
    if (guide && !shownGuides.current.has(page)) {
      shownGuides.current.add(page);
      setGuideOpen(true);
      Speech.speak(`${guide.title}. ${guide.message}`, {
        language: "ko-KR",
        rate: 0.88,
        pitch: 1,
      });
    } else {
      setGuideOpen(false);
    }
    if (page === "calling") {
      Speech.speak("주변 택시를 찾고 있습니다. 잠시만 기다려 주세요.", {
        language: "ko-KR",
        rate: 0.88,
      });
    } else if (page === "matched") {
      Speech.speak(
        "택시가 잡혔습니다. 차량 번호와 기사님 정보를 확인해 주세요. 연습을 완료했습니다.",
        { language: "ko-KR", rate: 0.88 },
      );
    }
    return () => {
      Speech.stop();
    };
  }, [page]);

  const openSearch = (nextRole: PlaceRole) => {
    setRole(nextRole);
    setPage("search");
  };
  const openMap = (query = "", nextRole = role) => {
    setRole(nextRole);
    setMapQuery(query);
    setPage("map-search");
  };
  const selectPlace = (place: TaxiPlace) => {
    if (role === "departure") {
      setDeparture(place);
      setPage(destination ? "vehicle" : "pickup");
    } else {
      setDestination(place);
      setPage("vehicle");
    }
  };
  const changeDepartureFromMap = useCallback(
    (place: TaxiPlace, reason?: "initial" | "drag") => {
      if (reason !== "drag") return;
      setDeparture(place);
      Speech.stop();
      Speech.speak(
        `출발 위치가 ${place.address}(으)로 변경되었습니다. 도착지를 선택해 주세요.`,
        { language: "ko-KR", rate: 0.88 },
      );
    },
    [],
  );
  const selectVehicle = (
    nextVehicle: TaxiVehicle,
    nextPreview: TaxiRoutePreview,
  ) => {
    setVehicle(nextVehicle);
    setPreview(nextPreview);
    setPage("confirm");
  };
  const finishCalling = useCallback(() => {
    void completePractice().catch(() => undefined);
    setPage("matched");
  }, [completePractice]);
  const practiceAgain = () => {
    void restartPracticeSession().catch(() => undefined);
    setDestination(null);
    setVehicle(null);
    setPreview(null);
    setPage("pickup");
  };

  let content;
  if (page === "home")
    content = (
      <TaxiHomeScreen onBack={onBack} onTaxi={() => setPage("pickup")} />
    );
  else if (page === "pickup")
    content = (
      <TaxiPickupScreen
        departure={departure}
        destination={destination}
        onBack={() => setPage("home")}
        onDeparture={() => openSearch("departure")}
        onDepartureChange={changeDepartureFromMap}
        onCurrentLocation={moveToCurrentLocation}
        onDestination={() => openSearch("destination")}
      />
    );
  else if (page === "search")
    content = (
      <TaxiDestinationScreen
        role={role}
        currentDeparture={departure}
        onBack={() => setPage("pickup")}
        onSelect={selectPlace}
        onOpenMap={openMap}
      />
    );
  else if (page === "map-search")
    content = (
      <TaxiMapSearchScreen
        role={role}
        initialQuery={mapQuery}
        onBack={() => setPage("search")}
        onSelect={selectPlace}
      />
    );
  else if (page === "vehicle" && destination)
    content = (
      <TaxiMapScreen
        departure={departure}
        destination={destination}
        token={token}
        onBack={() => setPage("pickup")}
        onChangeDeparture={() => openSearch("departure")}
        onChangeDestination={() => openSearch("destination")}
        onSelectVehicle={selectVehicle}
      />
    );
  else if (page === "confirm" && destination && vehicle && preview)
    content = (
      <TaxiCallConfirmScreen
        departure={departure}
        destination={destination}
        vehicle={vehicle}
        preview={preview}
        onBack={() => setPage("vehicle")}
        onCall={() => setPage("calling")}
      />
    );
  else if (page === "calling" && destination && vehicle && preview)
    content = (
      <TaxiCallingScreen
        departure={departure}
        destination={destination}
        vehicle={vehicle}
        preview={preview}
        onCancel={() => setPage("confirm")}
        onMatched={finishCalling}
      />
    );
  else if (page === "matched")
    content = (
      <TaxiMatchedScreen
        departure={departure}
        onAgain={practiceAgain}
        onHome={onBack}
      />
    );
  else
    content = (
      <TaxiHomeScreen onBack={onBack} onTaxi={() => setPage("pickup")} />
    );

  const guide = GUIDES[page];
  return (
    <View style={{ flex: 1 }}>
      {content}
      <TaxiMissionModal
        visible={Boolean(guide && guideOpen)}
        title={guide?.title ?? ""}
        message={guide?.message ?? ""}
        onClose={() => setGuideOpen(false)}
      />
    </View>
  );
}

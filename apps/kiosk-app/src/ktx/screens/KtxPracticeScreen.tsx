import { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Speech from "expo-speech";
import { createTrainOptions, stations, TrainOption } from "../data/railData";
import {
  KtxDatePicker,
  KtxHomeView,
  KtxPassengerPicker,
  KtxResultsView,
  KtxSeatView,
  KtxStationPicker,
  PassengerCounts,
} from "../components/KtxPolishedViews";
import { KtxPaymentView } from "../components/KtxPaymentView";
import { usePracticeSession } from "../../practice/hooks/usePracticeSession";

type Page = "home" | "results" | "seat" | "payment" | "done";
type StationTarget = "from" | "to" | null;
const guides = [
  "출발역과 도착역을 차례로 선택해 주세요.",
  "가는 날, 출발 시간대와 인원을 선택한 뒤 열차 조회를 눌러 주세요.",
  "원하는 열차를 선택하고 좌석 선택을 눌러 주세요.",
  "원하는 호차에서 인원수에 맞게 빈 좌석을 선택한 뒤 예매를 눌러 주세요.",
  "예약 내용을 확인하고 결제하기를 눌러 주세요.",
];

export function KtxPracticeScreen({
  onBack,
  token,
}: {
  onBack: () => void;
  token: string;
}) {
  const { completePractice, restartPracticeSession } = usePracticeSession(
    token,
    "KTX_BOOKING",
  );
  const [page, setPage] = useState<Page>("home");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [target, setTarget] = useState<StationTarget>(null);
  const [dateOpen, setDateOpen] = useState(false);
  const [dateOffset, setDateOffset] = useState(0);
  const [hour, setHour] = useState(9);
  const [missionStep, setMissionStep] = useState(0);
  const [mission, setMission] = useState(true);
  const [wrongAction, setWrongAction] = useState("");
  const [dateConfirmed, setDateConfirmed] = useState(false);
  const [passengerOpen, setPassengerOpen] = useState(false);
  const [passengers, setPassengers] = useState<PassengerCounts>({
    adult: 1,
    child: 0,
    infant: 0,
    senior: 0,
    severe: 0,
    mild: 0,
  });
  const [selectedTrain, setSelectedTrain] = useState<TrainOption | null>(null);
  const [car, setCar] = useState(8);
  const [seats, setSeats] = useState<string[]>([]);
  const trains = useMemo(
    () => (from && to ? createTrainOptions(from, to, hour) : []),
    [from, to, hour],
  );
  const passengerCount = Object.values(passengers).reduce(
    (sum, n) => sum + n,
    0,
  );
  const selectedDate = new Date(2026, 8, 2 + dateOffset);
  const dateText = `${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일 (${"일월화수목금토"[selectedDate.getDay()]})`;
  const nextMission = (step: number) => {
    setMissionStep(step);
    setMission(true);
  };
  const remindMission = (detail?: string) => {
    const text = detail || guides[missionStep];
    setWrongAction(text);
    Speech.speak(`지금은 다른 버튼을 누르지 말고, ${text}`, {
      language: "ko-KR",
      rate: 0.88,
    });
  };
  const openStation = (nextTarget: Exclude<StationTarget, null>) => {
    // 두 역을 같은 곳으로 골랐을 때는 다음 미션으로 넘어간 뒤라도
    // 출발역/도착역을 다시 열어 바로 수정할 수 있어야 한다.
    if (missionStep === 1 && from && to && from === to) {
      setTarget(nextTarget);
      return;
    }
    const expected = !from ? "from" : !to ? "to" : null;
    if (missionStep !== 0 || expected !== nextTarget) {
      remindMission(
        expected === "from"
          ? "먼저 출발역을 선택해 주세요."
          : expected === "to"
            ? "이번에는 도착역을 선택해 주세요."
            : undefined,
      );
      return;
    }
    setTarget(nextTarget);
  };
  const chooseStation = (name: string) => {
    if (target === "from") setFrom(name);
    else setTo(name);
    setTarget(null);
    if (
      missionStep === 0 &&
      ((target === "from" && to) || (target === "to" && from))
    )
      nextMission(1);
  };
  const reset = () => {
    void restartPracticeSession().catch(() => undefined);
    setPage("home");
    setFrom("");
    setTo("");
    setDateOffset(0);
    setHour(9);
    setDateConfirmed(false);
    setPassengers({
      adult: 1,
      child: 0,
      infant: 0,
      senior: 0,
      severe: 0,
      mild: 0,
    });
    setSelectedTrain(null);
    setSeats([]);
    setCar(8);
    nextMission(0);
  };

  if (page === "done" && selectedTrain)
    return (
      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.ticketDone}>
          <View style={s.ticketDoneHead}>
            <View>
              <Text style={s.ticketDoneEyebrow}>예매가 완료되었습니다</Text>
              <Text style={s.ticketDoneTitle}>나의 승차권</Text>
            </View>
            <View style={s.ticketDoneCheck}>
              <Text style={s.ticketDoneCheckText}>✓</Text>
            </View>
          </View>
          <View style={s.boardingPass}>
            <View style={s.passTop}>
              <View>
                <Text style={s.passBrand}>KORAIL</Text>
                <Text style={s.passKind}>KTX 일반실 승차권</Text>
              </View>
              <View style={s.passStatus}>
                <Text style={s.passStatusText}>결제완료</Text>
              </View>
            </View>
            <Text style={s.passDate}>{dateText}</Text>
            <View style={s.passRoute}>
              <View style={s.passStation}>
                <Text style={s.passTime}>{selectedTrain.departure}</Text>
                <Text
                  style={s.passStationName}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {from}
                </Text>
              </View>
              <View style={s.passJourney}>
                <Text style={s.passTrain}>{selectedTrain.id}</Text>
                <View style={s.passLine} />
                <Text style={s.passDuration}>{selectedTrain.minutes}분</Text>
              </View>
              <View style={s.passStation}>
                <Text style={s.passTime}>{selectedTrain.arrival}</Text>
                <Text
                  style={s.passStationName}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {to}
                </Text>
              </View>
            </View>
            <View style={s.passDivider}>
              <View style={s.passNotchLeft} />
              <View style={s.passDash} />
              <View style={s.passNotchRight} />
            </View>
            <View style={s.passDetails}>
              <View style={s.passDetail}>
                <Text style={s.passDetailLabel}>인원</Text>
                <Text style={s.passDetailValue}>{passengerCount}명</Text>
              </View>
              <View style={s.passDetail}>
                <Text style={s.passDetailLabel}>호차</Text>
                <Text style={s.passDetailValue}>{car}호차</Text>
              </View>
              <View style={[s.passDetail, { flex: 1.5 }]}>
                <Text style={s.passDetailLabel}>좌석</Text>
                <Text
                  style={s.passDetailValue}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {seats.join(", ")}
                </Text>
              </View>
            </View>
            <View style={s.passBottom}>
              <View>
                <Text style={s.passNumberLabel}>승차권 번호</Text>
                <Text style={s.passNumber}>
                  20260902-{selectedTrain.id.replace(/\D/g, "")}-
                  {String(car).padStart(2, "0")}
                </Text>
              </View>
              <View style={s.qrMock}>
                <Text style={s.qrText}>▦</Text>
              </View>
            </View>
          </View>
          <View style={s.trainingNotice}>
            <Text style={s.trainingNoticeTitle}>교육용 승차권입니다</Text>
            <Text style={s.trainingNoticeText}>
              실제 열차 탑승이나 결제에는 사용할 수 없습니다.
            </Text>
          </View>
          <Pressable style={[s.primaryWide, s.doneButtonWide]} onPress={reset}>
            <Text style={s.primaryText}>다시 연습하기</Text>
          </Pressable>
          <Pressable style={s.outline} onPress={onBack}>
            <Text style={s.outlineText}>처음으로</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.shell}>
        {page === "home" ? (
          <KtxHomeView
            from={from}
            to={to}
            dateText={dateText}
            hour={hour}
            passengerCount={passengerCount}
            onPassenger={() => {
              if (missionStep !== 1) return remindMission();
              setPassengerOpen(true);
            }}
            onBack={onBack}
            onStation={openStation}
            onWrong={() => remindMission()}
            onDate={() => {
              if (missionStep !== 1) return remindMission();
              setDateOpen(true);
            }}
            onSearch={() => {
              if (missionStep !== 1 || !dateConfirmed)
                return remindMission(
                  "가는 날과 출발 시간대를 먼저 선택해 주세요.",
                );
              if (!from || !to)
                return Alert.alert("출발역과 도착역을 선택해 주세요");
              if (from === to)
                return Alert.alert("서로 다른 역을 선택해 주세요");
              setPage("results");
              nextMission(2);
            }}
          />
        ) : null}
        {page === "results" ? (
          <KtxResultsView
            from={from}
            to={to}
            dateText={dateText}
            hour={hour}
            passengerCount={passengerCount}
            trains={trains}
            onBack={() => setPage("home")}
            onWrong={() => remindMission()}
            onSelect={(train) => setSelectedTrain(train)}
            selected={selectedTrain}
            onSeat={() => {
              if (!selectedTrain)
                return remindMission("먼저 원하는 열차를 선택해 주세요.");
              setPage("seat");
              nextMission(3);
            }}
          />
        ) : null}
        {page === "seat" && selectedTrain ? (
          <KtxSeatView
            train={selectedTrain}
            car={car}
            setCar={setCar}
            seats={seats}
            setSeats={setSeats}
            requiredSeats={passengerCount}
            onBack={() => setPage("results")}
            onReserve={() => {
              if (seats.length !== passengerCount)
                return remindMission(
                  `${passengerCount}명에 맞게 좌석 ${passengerCount}개를 선택해 주세요.`,
                );
              setPage("payment");
              nextMission(4);
            }}
          />
        ) : null}
        {page === "payment" && selectedTrain ? (
          <KtxPaymentView
            from={from}
            to={to}
            dateText={dateText}
            train={selectedTrain}
            car={car}
            seats={seats}
            passengers={passengers}
            onWrong={() =>
              remindMission(
                "토스페이가 자동으로 선택되어 있어요. 약관에 동의한 뒤 교육용 결제를 눌러 주세요.",
              )
            }
            onBack={() => setPage("seat")}
            onPay={async () => {
              try {
                await completePractice();
                Speech.speak("교육용 토스페이 결제가 완료되었습니다.", {
                  language: "ko-KR",
                  rate: 0.88,
                });
                setPage("done");
              } catch {
                Alert.alert(
                  "통계 저장 실패",
                  "네트워크를 확인한 뒤 다시 눌러 주세요.",
                );
              }
            }}
          />
        ) : null}
        <KtxStationPicker
          target={target}
          onClose={() => setTarget(null)}
          onSelect={chooseStation}
        />
        <KtxPassengerPicker
          visible={passengerOpen}
          value={passengers}
          onChange={setPassengers}
          onClose={() => setPassengerOpen(false)}
        />
        <KtxDatePicker
          visible={dateOpen}
          selected={dateOffset}
          hour={hour}
          onHour={setHour}
          onSelect={setDateOffset}
          onClose={() => setDateOpen(false)}
          onDone={() => {
            setDateOpen(false);
            setDateConfirmed(true);
          }}
        />
        <Mission
          visible={mission}
          step={missionStep + 1}
          text={guides[missionStep]}
          onClose={() => setMission(false)}
        />
        <WrongMission
          visible={Boolean(wrongAction)}
          text={wrongAction}
          onClose={() => setWrongAction("")}
        />
      </View>
    </SafeAreaView>
  );
}

function Home({
  from,
  to,
  dateText,
  hour,
  onBack,
  onStation,
  onDate,
  onSearch,
}: {
  from: string;
  to: string;
  dateText: string;
  hour: number;
  onBack: () => void;
  onStation: (v: StationTarget) => void;
  onDate: () => void;
  onSearch: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={s.home}>
      <View style={s.blue}>
        <View style={s.top}>
          <Pressable onPress={onBack}>
            <Text style={s.back}>‹</Text>
          </Pressable>
          <Text style={s.korail}>KORAIL</Text>
          <Text style={s.topIcons}>큰글씨　</Text>
        </View>
        <Text style={s.hero}>어디로 떠나볼까요?</Text>
        <View style={s.searchCard}>
          <View style={s.stationRow}>
            <Pressable style={s.station} onPress={() => onStation("from")}>
              <Text style={s.label}>출발역</Text>
              <Text style={s.stationName}>{from || "선택"} ›</Text>
            </Pressable>
            <Text style={s.swap}>⇄</Text>
            <Pressable style={s.station} onPress={() => onStation("to")}>
              <Text style={s.label}>도착역</Text>
              <Text style={s.stationName}>{to || "선택"} ›</Text>
            </Pressable>
          </View>
          <Pressable style={s.option} onPress={onDate}>
            <Text style={s.label}>가는날</Text>
            <Text style={s.optionValue}>
              {dateText} {hour}시 이후
            </Text>
          </Pressable>
          <View style={s.smallOptions}>
            <View style={s.smallOption}>
              <Text style={s.label}>
                인원　<Text style={s.optionValue}>어른 1명</Text>
              </Text>
            </View>
            <View style={s.smallOption}>
              <Text style={s.label}>
                좌석　<Text style={s.optionValue}>일반 좌석</Text>
              </Text>
            </View>
          </View>
          <Pressable style={s.searchBtn} onPress={onSearch}>
            <Text style={s.primaryText}>열차 조회</Text>
          </Pressable>
        </View>
      </View>
      <View style={s.quick}>
        <Text style={s.quickIcon}>📅{`\n`}정기권</Text>
        <Text style={s.quickIcon}>🎟️{`\n`}N카드</Text>
        <Text style={s.quickIcon}>🏷️{`\n`}특가상품</Text>
      </View>
    </ScrollView>
  );
}
function Results({
  from,
  to,
  dateText,
  trains,
  onBack,
  onSelect,
  selected,
  onSeat,
}: {
  from: string;
  to: string;
  dateText: string;
  trains: TrainOption[];
  onBack: () => void;
  onSelect: (t: TrainOption) => void;
  selected: TrainOption | null;
  onSeat: () => void;
}) {
  return (
    <View style={s.results}>
      <View style={s.resultHead}>
        <Pressable onPress={onBack}>
          <Text style={s.back}>‹</Text>
        </Pressable>
        <View>
          <Text style={s.route}>
            {from} → {to}
          </Text>
          <Text style={s.resultDate}>{dateText}</Text>
        </View>
        <Text style={s.cart}>🛒</Text>
      </View>
      <ScrollView
        contentContainerStyle={{ paddingBottom: selected ? 230 : 20 }}
      >
        {trains.map((t) => (
          <Pressable
            key={t.id}
            style={[s.train, selected?.id === t.id && s.trainOn]}
            onPress={() => onSelect(t)}
          >
            <View style={s.trainMain}>
              <Text style={s.trainLabel}>
                KTX　<Text style={s.trainId}>{t.id.replace("KTX-", "")}</Text>
              </Text>
              <Text style={s.times}>
                {t.departure}　→　{t.arrival}
              </Text>
              <Text style={s.places}>
                {from}　　　　　　　 {to}
              </Text>
              <Text style={s.duration}>{t.minutes}분 소요</Text>
            </View>
            <View style={s.prices}>
              <Text style={s.priceLabel}>
                일반실　
                <Text style={s.price}>
                  {t.standardPrice.toLocaleString()}원
                </Text>
              </Text>
              <Text style={s.priceLabel}>
                특실　
                <Text style={s.price}>{t.firstPrice.toLocaleString()}원</Text>
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
      {selected ? (
        <View style={s.trainSheet}>
          <Text style={s.sheetTitle}>{selected.id}</Text>
          <Text style={s.sheetInfo}>
            일반실　{selected.standardPrice.toLocaleString()}원
          </Text>
          <Pressable style={s.primaryWide} onPress={onSeat}>
            <Text style={s.primaryText}>좌석선택</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
function SeatPage({
  train,
  car,
  setCar,
  seat,
  setSeat,
  onBack,
  onReserve,
}: {
  train: TrainOption;
  car: number;
  setCar: (n: number) => void;
  seat: string;
  setSeat: (v: string) => void;
  onBack: () => void;
  onReserve: () => void;
}) {
  const unavailable = new Set(["15A", "14B", "12A", "11C", "10A", "9B"]);
  const seats = Array.from({ length: 8 }, (_, i) => 15 - i).flatMap((row) =>
    ["A", "B", "C", "D"].map((letter) => `${row}${letter}`),
  );
  return (
    <View style={s.seatPage}>
      <View style={s.seatHead}>
        <Pressable onPress={onBack}>
          <Text style={s.backDark}>‹</Text>
        </Pressable>
        <Text style={s.seatTitle}>좌석선택</Text>
        <View />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.cars}
      >
        {train.cars.map((n) => (
          <Pressable
            key={n}
            style={[s.car, car === n && s.carOn]}
            onPress={() => setCar(n)}
          >
            <Text style={[s.carText, car === n && s.carTextOn]}>{n}호차</Text>
            <Text>일반 좌석</Text>
          </Pressable>
        ))}
      </ScrollView>
      <Text style={s.seatLegend}>□ 선택 가능　■ 선택 좌석　▧ 선택 불가</Text>
      <ScrollView contentContainerStyle={s.seatGrid}>
        {seats.map((x) => {
          const blocked = unavailable.has(x);
          return (
            <Pressable
              key={x}
              disabled={blocked}
              style={[s.seat, blocked && s.seatBlocked, seat === x && s.seatOn]}
              onPress={() => setSeat(x)}
            >
              <Text
                style={[
                  s.seatText,
                  blocked && s.blockedText,
                  seat === x && s.seatTextOn,
                ]}
              >
                {x}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={s.seatBottom}>
        <Text style={s.selectedCount}>
          <Text style={s.blueText}>{seat ? "1" : "0"}석 선택</Text> / 1석
        </Text>
        <Pressable
          style={[s.primaryWide, !seat && s.disabled]}
          onPress={onReserve}
        >
          <Text style={s.primaryText}>예매</Text>
        </Pressable>
      </View>
    </View>
  );
}
function Payment({
  from,
  to,
  dateText,
  train,
  car,
  seat,
  onBack,
  onPay,
}: {
  from: string;
  to: string;
  dateText: string;
  train: TrainOption;
  car: number;
  seat: string;
  onBack: () => void;
  onPay: () => void;
}) {
  return (
    <View style={s.payment}>
      <View style={s.seatHead}>
        <Pressable onPress={onBack}>
          <Text style={s.backDark}>‹</Text>
        </Pressable>
        <Text style={s.seatTitle}>예약 확인</Text>
        <View />
      </View>
      <View style={s.ticket}>
        <Text style={s.ticketTitle}>
          {from} → {to}
        </Text>
        <Text style={s.ticketDate}>{dateText}</Text>
        <View style={s.ticketTimes}>
          <Text style={s.bigTime}>
            {train.departure}
            {`\n`}
            <Text style={s.ticketStation}>{from}</Text>
          </Text>
          <Text style={s.arrow}>→</Text>
          <Text style={s.bigTime}>
            {train.arrival}
            {`\n`}
            <Text style={s.ticketStation}>{to}</Text>
          </Text>
        </View>
        <Text style={s.ticketInfo}>
          {train.id}　·　{car}호차 {seat}　·　어른 1명
        </Text>
      </View>
      <View style={s.payRow}>
        <Text style={s.payLabel}>결제금액</Text>
        <Text style={s.payPrice}>{train.standardPrice.toLocaleString()}원</Text>
      </View>
      <View style={s.payMethod}>
        <Text style={s.payTitle}>결제수단</Text>
        <Text style={s.payChoice}>◉ 신용·체크카드</Text>
      </View>
      <Pressable style={s.payBtn} onPress={onPay}>
        <Text style={s.primaryText}>
          {train.standardPrice.toLocaleString()}원 결제하기
        </Text>
      </Pressable>
    </View>
  );
}
function StationModal({
  target,
  onClose,
  onSelect,
}: {
  target: StationTarget;
  onClose: () => void;
  onSelect: (n: string) => void;
}) {
  return (
    <Modal visible={Boolean(target)} transparent animationType="slide">
      <View style={s.modalDim}>
        <View style={s.stationModal}>
          <View style={s.modalHead}>
            <Text style={s.modalTitle}>
              {target === "from" ? "출발역" : "도착역"} 선택
            </Text>
            <Pressable onPress={onClose}>
              <Text style={s.close}>×</Text>
            </Pressable>
          </View>
          <View style={s.fakeSearch}>
            <Text>⌕　역 이름 또는 초성 입력</Text>
          </View>
          <ScrollView>
            {stations.map((st) => (
              <Pressable
                key={st.name}
                style={s.stationItem}
                onPress={() => onSelect(st.name)}
              >
                <Text style={s.stationItemText}>{st.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
function DateModal({
  visible,
  selected,
  hour,
  onHour,
  onSelect,
  onClose,
  onDone,
}: {
  visible: boolean;
  selected: number;
  hour: number;
  onHour: (h: number) => void;
  onSelect: (n: number) => void;
  onClose: () => void;
  onDone: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={s.modalDim}>
        <View style={s.dateModal}>
          <View style={s.modalHead}>
            <Text style={s.modalTitle}>가는날 선택</Text>
            <Pressable onPress={onClose}>
              <Text style={s.close}>×</Text>
            </Pressable>
          </View>
          <Text style={s.month}>2026년 9월</Text>
          <View style={s.calendar}>
            {Array.from({ length: 21 }, (_, i) => i + 2).map((d, i) => (
              <Pressable
                key={d}
                style={[s.day, selected === i && s.dayOn]}
                onPress={() => onSelect(i)}
              >
                <Text style={[s.dayText, selected === i && s.dayTextOn]}>
                  {d}
                </Text>
                {i === 0 ? (
                  <Text style={[s.today, selected === 0 && s.dayTextOn]}>
                    오늘
                  </Text>
                ) : null}
              </Pressable>
            ))}
          </View>
          <Text style={s.timeTitle}>시간대 선택</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((h) => (
              <Pressable
                key={h}
                style={[s.hour, hour === h && s.hourOn]}
                onPress={() => onHour(h)}
              >
                <Text style={[s.hourText, hour === h && s.blueText]}>
                  {h}시
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          <Pressable style={s.dateDone} onPress={onDone}>
            <Text style={s.primaryText}>선택 완료</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
function Mission({
  visible,
  step,
  text,
  onClose,
}: {
  visible: boolean;
  step: number;
  text: string;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={s.missionDim}>
        <View style={s.missionCard}>
          <Text style={s.missionBadge}>MISSION {step}</Text>
          <Text style={s.missionTitle}>KTX 예약 미션</Text>
          <Text style={s.missionText}>{text}</Text>
          <Text style={s.missionNote}>
            실제 열차 예약이나 결제는 진행되지 않아요.
          </Text>
          <Pressable
            style={[s.primaryWide, { width: "100%" }]}
            onPress={() => {
              Speech.speak(text, { language: "ko-KR", rate: 0.88 });
              onClose();
            }}
          >
            <Text style={s.primaryText}>시작하기</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
function WrongMission({
  visible,
  text,
  onClose,
}: {
  visible: boolean;
  text: string;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={s.missionDim}>
        <View style={s.remindCard}>
          <Text style={s.remindIcon}>!</Text>
          <Text style={s.remindTitle}>지금은 이 버튼이 아니에요</Text>
          <Text style={s.remindText}>
            다른 버튼을 누르지 말고{`\n`}
            <Text style={s.remindStrong}>{text}</Text>
          </Text>
          <Pressable
            style={[s.primaryWide, { width: "100%" }]}
            onPress={onClose}
          >
            <Text style={s.primaryText}>미션 계속하기</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "white" },
  shell: { flex: 1, width: "100%", maxWidth: 980, alignSelf: "center" },
  home: { flexGrow: 1, backgroundColor: "#f5f6fa" },
  blue: { backgroundColor: "#168af5", padding: 24, paddingTop: 35 },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  back: { fontSize: 45, color: "white" },
  korail: {
    fontSize: 32,
    fontWeight: "900",
    fontStyle: "italic",
    color: "white",
  },
  topIcons: { fontSize: 16, color: "white" },
  hero: { fontSize: 30, fontWeight: "800", color: "white", marginVertical: 30 },
  searchCard: {
    backgroundColor: "white",
    borderRadius: 24,
    overflow: "hidden",
  },
  stationRow: { flexDirection: "row", alignItems: "center", padding: 25 },
  station: { flex: 1, alignItems: "center" },
  label: { fontSize: 16, color: "#77808c" },
  stationName: { fontSize: 28, fontWeight: "900", marginTop: 8 },
  swap: { fontSize: 34, color: "#1677ed" },
  option: {
    marginHorizontal: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#cfd7e1",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionValue: { fontSize: 17, fontWeight: "800", color: "#17212f" },
  smallOptions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginTop: 12,
  },
  smallOption: {
    flex: 1,
    padding: 17,
    borderWidth: 1,
    borderColor: "#cfd7e1",
    borderRadius: 10,
  },
  searchBtn: {
    height: 65,
    backgroundColor: "#176deb",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  primaryText: { color: "white", fontSize: 20, fontWeight: "900" },
  quick: {
    margin: 22,
    backgroundColor: "white",
    borderRadius: 22,
    padding: 28,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  quickIcon: {
    fontSize: 18,
    lineHeight: 32,
    textAlign: "center",
    fontWeight: "700",
  },
  results: { flex: 1, backgroundColor: "#f6f7fa" },
  resultHead: {
    backgroundColor: "#168af5",
    padding: 20,
    paddingTop: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  route: { fontSize: 25, fontWeight: "900", color: "white" },
  resultDate: { color: "#dcecff", marginTop: 5 },
  cart: { fontSize: 26 },
  train: {
    backgroundColor: "white",
    padding: 18,
    borderBottomWidth: 8,
    borderBottomColor: "#f6f7fa",
    flexDirection: "row",
  },
  trainOn: { borderWidth: 3, borderColor: "#1474ed", borderRadius: 12 },
  trainMain: { flex: 1 },
  trainLabel: {
    backgroundColor: "#1677ed",
    alignSelf: "flex-start",
    color: "white",
    fontSize: 17,
    fontWeight: "900",
    padding: 4,
  },
  trainId: { color: "#111" },
  times: { fontSize: 27, fontWeight: "900", marginTop: 12 },
  places: { fontSize: 16, marginTop: 4 },
  duration: {
    alignSelf: "flex-start",
    backgroundColor: "#eee",
    padding: 4,
    marginTop: 10,
  },
  prices: {
    width: 180,
    borderLeftWidth: 1,
    borderLeftColor: "#ddd",
    paddingLeft: 15,
    justifyContent: "space-around",
  },
  priceLabel: { fontSize: 17, color: "#666" },
  price: { fontSize: 22, fontWeight: "900", color: "#111" },
  trainSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "white",
    padding: 22,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    elevation: 15,
  },
  sheetTitle: { fontSize: 24, fontWeight: "900" },
  sheetInfo: { fontSize: 18, marginTop: 12 },
  primaryWide: {
    minHeight: 60,
    backgroundColor: "#176deb",
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  seatPage: { flex: 1, backgroundColor: "white" },
  seatHead: {
    height: 74,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e8ec",
  },
  backDark: { fontSize: 44, color: "#172b45" },
  seatTitle: { fontSize: 25, fontWeight: "900" },
  cars: { maxHeight: 125, padding: 15 },
  car: {
    width: 170,
    height: 90,
    borderWidth: 2,
    borderColor: "#777",
    borderRadius: 12,
    padding: 14,
    marginRight: 12,
  },
  carOn: { borderColor: "#176deb", borderWidth: 4 },
  carText: { fontSize: 20, fontWeight: "900" },
  carTextOn: { color: "#176deb" },
  seatLegend: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    textAlign: "center",
    fontSize: 16,
  },
  seatGrid: {
    padding: 20,
    paddingBottom: 180,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  seat: {
    width: "21%",
    height: 74,
    borderWidth: 2,
    borderColor: "#737982",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  seatBlocked: { backgroundColor: "#eee", borderColor: "#ddd" },
  seatOn: { backgroundColor: "#176deb", borderColor: "#176deb" },
  seatText: { fontSize: 18 },
  blockedText: { color: "#bbb" },
  seatTextOn: { color: "white", fontWeight: "900" },
  seatBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "white",
    padding: 18,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  selectedCount: { fontSize: 20 },
  blueText: { color: "#176deb", fontWeight: "900" },
  disabled: { opacity: 0.35 },
  payment: { flex: 1, backgroundColor: "#f5f7fa", paddingBottom: 22 },
  ticket: {
    backgroundColor: "white",
    margin: 20,
    padding: 24,
    borderRadius: 20,
  },
  ticketTitle: { fontSize: 27, fontWeight: "900" },
  ticketDate: { fontSize: 16, color: "#667085", marginTop: 8 },
  ticketTimes: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 30,
  },
  bigTime: { fontSize: 31, fontWeight: "900" },
  ticketStation: { fontSize: 17, fontWeight: "500" },
  arrow: { fontSize: 30, color: "#176deb" },
  ticketInfo: {
    fontSize: 18,
    marginTop: 28,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  payRow: {
    backgroundColor: "white",
    padding: 22,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  payLabel: { fontSize: 20, fontWeight: "700" },
  payPrice: { fontSize: 24, fontWeight: "900", color: "#176deb" },
  payMethod: { backgroundColor: "white", padding: 22, marginTop: 14 },
  payTitle: { fontSize: 20, fontWeight: "900" },
  payChoice: { fontSize: 18, marginTop: 18 },
  payBtn: {
    marginTop: "auto",
    marginHorizontal: 20,
    minHeight: 65,
    backgroundColor: "#176deb",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  modalDim: {
    flex: 1,
    backgroundColor: "rgba(0,35,75,.72)",
    justifyContent: "flex-end",
  },
  stationModal: {
    height: "82%",
    backgroundColor: "white",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
  },
  dateModal: {
    height: "88%",
    backgroundColor: "white",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
  },
  modalHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: { fontSize: 28, fontWeight: "900" },
  close: { fontSize: 43 },
  fakeSearch: {
    height: 64,
    borderWidth: 2,
    borderColor: "#777",
    borderRadius: 12,
    justifyContent: "center",
    paddingHorizontal: 18,
    marginVertical: 22,
  },
  stationItem: {
    height: 66,
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  stationItemText: { fontSize: 21 },
  month: {
    fontSize: 25,
    fontWeight: "900",
    textAlign: "center",
    marginVertical: 28,
  },
  calendar: { flexDirection: "row", flexWrap: "wrap" },
  day: {
    width: "14.28%",
    height: 75,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  dayOn: { backgroundColor: "#176deb" },
  dayText: { fontSize: 20 },
  dayTextOn: { color: "white", fontWeight: "900" },
  today: { fontSize: 11, color: "#176deb" },
  timeTitle: {
    fontSize: 22,
    fontWeight: "900",
    marginTop: 20,
    marginBottom: 12,
  },
  hour: {
    width: 90,
    height: 60,
    borderWidth: 1,
    borderColor: "#777",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  hourOn: { borderWidth: 3, borderColor: "#176deb" },
  hourText: { fontSize: 20 },
  dateDone: {
    marginTop: "auto",
    height: 64,
    backgroundColor: "#176deb",
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  missionDim: {
    flex: 1,
    backgroundColor: "rgba(10,25,48,.65)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  missionCard: {
    width: "100%",
    maxWidth: 600,
    backgroundColor: "white",
    borderRadius: 28,
    padding: 32,
    alignItems: "center",
  },
  missionBadge: {
    backgroundColor: "#e7f1ff",
    color: "#1769c2",
    fontWeight: "900",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 99,
  },
  missionTitle: { fontSize: 29, fontWeight: "900", marginTop: 20 },
  missionText: {
    fontSize: 23,
    lineHeight: 34,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 18,
  },
  missionNote: { fontSize: 15, color: "#778292", marginTop: 16 },
  remindCard: {
    width: "100%",
    maxWidth: 560,
    backgroundColor: "white",
    borderRadius: 28,
    padding: 32,
    alignItems: "center",
  },
  remindIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#fff1dd",
    color: "#ef7d00",
    fontSize: 38,
    fontWeight: "900",
    textAlign: "center",
    textAlignVertical: "center",
  },
  remindTitle: { fontSize: 25, fontWeight: "900", marginTop: 18 },
  remindText: {
    fontSize: 19,
    lineHeight: 30,
    color: "#687386",
    textAlign: "center",
    marginTop: 14,
  },
  remindStrong: { color: "#176deb", fontWeight: "900" },
  ticketDone: {
    flexGrow: 1,
    backgroundColor: "#f3f6fb",
    padding: 24,
    paddingBottom: 36,
  },
  ticketDoneHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  ticketDoneEyebrow: { fontSize: 16, color: "#176deb", fontWeight: "800" },
  ticketDoneTitle: {
    fontSize: 31,
    fontWeight: "900",
    marginTop: 4,
    color: "#101828",
  },
  ticketDoneCheck: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#176deb",
    alignItems: "center",
    justifyContent: "center",
  },
  ticketDoneCheckText: { fontSize: 31, color: "white", fontWeight: "900" },
  boardingPass: {
    backgroundColor: "white",
    borderRadius: 24,
    elevation: 5,
    overflow: "hidden",
  },
  passTop: {
    backgroundColor: "#133f81",
    padding: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  passBrand: {
    fontSize: 27,
    color: "white",
    fontWeight: "900",
    fontStyle: "italic",
  },
  passKind: { fontSize: 14, color: "#dbeafe", marginTop: 3 },
  passStatus: {
    backgroundColor: "#e8f2ff",
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  passStatusText: { color: "#176deb", fontWeight: "900" },
  passDate: {
    fontSize: 17,
    color: "#667085",
    textAlign: "center",
    marginTop: 22,
  },
  passRoute: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 24,
  },
  passStation: { flex: 1, alignItems: "center", minWidth: 0 },
  passTime: { fontSize: 30, fontWeight: "900", color: "#101828" },
  passStationName: {
    fontSize: 21,
    fontWeight: "800",
    marginTop: 7,
    maxWidth: "100%",
  },
  passJourney: { width: 100, alignItems: "center" },
  passTrain: { fontSize: 13, color: "#176deb", fontWeight: "900" },
  passLine: {
    height: 2,
    width: 78,
    backgroundColor: "#176deb",
    marginVertical: 9,
  },
  passDuration: { fontSize: 12, color: "#667085" },
  passDivider: { height: 24, flexDirection: "row", alignItems: "center" },
  passNotchLeft: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#f3f6fb",
    marginLeft: -12,
  },
  passDash: {
    flex: 1,
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: "#cfd5df",
  },
  passNotchRight: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#f3f6fb",
    marginRight: -12,
  },
  passDetails: {
    flexDirection: "row",
    paddingHorizontal: 22,
    paddingVertical: 18,
  },
  passDetail: { flex: 1 },
  passDetailLabel: { fontSize: 13, color: "#667085" },
  passDetailValue: { fontSize: 19, fontWeight: "900", marginTop: 5 },
  passBottom: {
    backgroundColor: "#f8fafc",
    padding: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  passNumberLabel: { fontSize: 12, color: "#667085" },
  passNumber: { fontSize: 15, fontWeight: "800", marginTop: 5 },
  qrMock: {
    width: 58,
    height: 58,
    borderWidth: 2,
    borderColor: "#101828",
    alignItems: "center",
    justifyContent: "center",
  },
  qrText: { fontSize: 40, color: "#101828" },
  trainingNotice: {
    backgroundColor: "#fff7e8",
    borderRadius: 12,
    padding: 16,
    marginTop: 18,
  },
  trainingNoticeTitle: { fontSize: 17, fontWeight: "900", color: "#a15c00" },
  trainingNoticeText: { fontSize: 14, color: "#8a5a19", marginTop: 5 },
  doneButtonWide: { width: "100%" },
  outline: {
    width: "100%",
    maxWidth: 560,
    minHeight: 60,
    borderWidth: 2,
    borderColor: "#176deb",
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    alignSelf: "center",
  },
  outlineText: { fontSize: 18, fontWeight: "900", color: "#176deb" },
});

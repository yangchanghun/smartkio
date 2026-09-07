import { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Speech from "expo-speech";
import { usePracticeSession } from "../../practice/hooks/usePracticeSession";

const BLUE = "#315efb";
const guides = [
  "상단의 항공권을 눌러 주세요.",
  "출발지 칸을 누르고 원하는 도시를 검색하거나 목록에서 선택해 주세요.",
  "도착지 칸을 누르고 원하는 도시를 검색하거나 목록에서 선택해 주세요.",
  "날짜 칸을 누르고 가는 날과 오는 날을 선택해 주세요.",
  "탑승객 칸을 누르고 성인, 어린이, 유아 인원을 정해 주세요.",
  "항공권 검색을 눌러 주세요.",
  "가는 편에서 원하는 항공편을 선택해 주세요.",
  "오는 편에서 원하는 항공편을 선택해 주세요.",
  "선택한 여행 정보를 확인하고 예약하기를 눌러 주세요.",
  "탑승객의 국적, 영문 이름, 성별, 생년월일을 입력하고 계속을 눌러 주세요.",
  "예약 완료 화면에서 확인을 눌러 탑승권을 열어 주세요.",
  "발급된 모바일 탑승권을 확인하고 연습 완료를 눌러 주세요.",
];
type Flight = {
  time: string;
  arrival: string;
  airline: string;
  price: number;
  airport: string;
};
const outFlights: Flight[] = [
  {
    time: "21:05",
    arrival: "23:05",
    airline: "티웨이항공",
    price: 155000,
    airport: "ICN T1 → KIX T1",
  },
  {
    time: "17:00",
    arrival: "18:55",
    airline: "제주항공",
    price: 185000,
    airport: "ICN T1 → KIX T2",
  },
  {
    time: "09:05",
    arrival: "11:00",
    airline: "제주항공",
    price: 185800,
    airport: "ICN T1 → KIX T2",
  },
  {
    time: "14:50",
    arrival: "17:00",
    airline: "에어부산",
    price: 187000,
    airport: "ICN T2 → KIX T1",
  },
];
const inFlights: Flight[] = [
  {
    time: "00:15",
    arrival: "02:15",
    airline: "티웨이항공",
    price: 0,
    airport: "KIX T1 → ICN T1",
  },
  {
    time: "10:50",
    arrival: "12:50",
    airline: "제주항공",
    price: 15600,
    airport: "KIX T2 → ICN T1",
  },
  {
    time: "16:00",
    arrival: "18:00",
    airline: "제주항공",
    price: 25000,
    airport: "UKB T2 → ICN T1",
  },
  {
    time: "14:20",
    arrival: "16:15",
    airline: "피치항공",
    price: 28200,
    airport: "KIX T2 → GMP",
  },
];

export function FlightPracticeScreen({
  onBack,
  token,
}: {
  onBack: () => void;
  token: string;
}) {
  const { completePractice, restartPracticeSession } = usePracticeSession(
    token,
    "FLIGHT_BOOKING",
  );
  const [step, setStep] = useState(0);
  const [mission, setMission] = useState(true);
  const [wrong, setWrong] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [editor, setEditor] = useState<
    "from" | "to" | "dates" | "people" | null
  >(null);
  const [departDay, setDepartDay] = useState<number | null>(null);
  const [returnDay, setReturnDay] = useState<number | null>(null);
  const [out, setOut] = useState<Flight | null>(null);
  const [incoming, setIncoming] = useState<Flight | null>(null);
  const [nationality, setNationality] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [gender, setGender] = useState<"남성" | "여성" | "">("");
  const [birth, setBirth] = useState("");
  const next = () => {
    setStep((v) => v + 1);
    setMission(true);
    setWrong("");
  };
  const remind = (text = guides[step]) => {
    setWrong(text);
    Speech.speak(`지금은 다른 버튼을 누르지 말고, ${text}`, {
      language: "ko-KR",
      rate: 0.88,
    });
  };
  const previous = () => {
    if (step === 0) return onBack();
    setStep((v) => Math.max(0, v - 1));
    setMission(true);
  };
  const reset = () => {
    void restartPracticeSession().catch(() => undefined);
    setStep(0);
    setMission(true);
    setEditor(null);
    setAdults(1);
    setChildren(0);
    setInfants(0);
    setFrom("");
    setTo("");
    setDepartDay(null);
    setReturnDay(null);
    setOut(null);
    setIncoming(null);
    setNationality("");
    setLastName("");
    setFirstName("");
    setGender("");
    setBirth("");
  };
  const people = adults + children + infants;
  const total = ((out?.price || 0) + (incoming?.price || 0)) * people;
  const dates =
    departDay && returnDay
      ? `9월 ${departDay}일 - 9월 ${returnDay}일`
      : "날짜 선택";
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.shell}>
        {step === 0 && <TripHome onFlight={next} onWrong={() => remind()} />}
        {step >= 1 && step <= 5 && !editor && (
          <SearchCard
            from={from}
            to={to}
            dates={dates}
            adults={adults}
            children={children}
            infants={infants}
            onFrom={() => setEditor("from")}
            onTo={() => setEditor("to")}
            onDates={() => setEditor("dates")}
            onPeople={() => setEditor("people")}
            onSearch={() => {
              if (step === 5 && from && to && departDay && returnDay) next();
              else remind("출발지, 도착지, 날짜, 탑승객을 모두 선택해 주세요.");
            }}
            onBack={previous}
          />
        )}
        {editor === "from" && (
          <CityPicker
            title="출발지 선택"
            selected={from}
            onPick={(city) => {
              setFrom(city);
              if (city === to) setTo("");
              setEditor(null);
              if (step === 1) next();
            }}
            onBack={() => setEditor(null)}
          />
        )}
        {editor === "to" && (
          <CityPicker
            title="도착지 선택"
            selected={to}
            blocked={from}
            onPick={(city) => {
              if (city === from) {
                remind("출발지와 다른 도시를 선택해 주세요.");
                return;
              }
              setTo(city);
              setEditor(null);
              if (step === 2) next();
            }}
            onBack={() => setEditor(null)}
          />
        )}
        {editor === "dates" && (
          <Calendar
            departDay={departDay}
            returnDay={returnDay}
            setDepartDay={setDepartDay}
            setReturnDay={setReturnDay}
            onConfirm={() => {
              setEditor(null);
              if (step === 3) next();
            }}
            onBack={() => setEditor(null)}
            onWrong={remind}
          />
        )}
        {editor === "people" && (
          <Passengers
            adults={adults}
            children={children}
            infants={infants}
            setAdults={setAdults}
            setChildren={setChildren}
            setInfants={setInfants}
            onConfirm={() => {
              setEditor(null);
              if (step === 4) next();
            }}
            onBack={() => setEditor(null)}
          />
        )}
        {step === 6 && (
          <FlightList
            route={`${from} ⇄ ${to}`}
            travelDay={departDay!}
            title="가는편 선택"
            flights={outFlights}
            selected={out}
            onSelect={(f) => {
              setOut(f);
              next();
            }}
            onBack={previous}
          />
        )}
        {step === 7 && (
          <FlightList
            route={`${from} ⇄ ${to}`}
            travelDay={returnDay!}
            title="오는편 선택"
            flights={inFlights}
            selected={incoming}
            onSelect={(f) => {
              setIncoming(f);
              next();
            }}
            onBack={previous}
          />
        )}
        {step === 8 && out && incoming && (
          <Review
            from={from}
            to={to}
            departDay={departDay!}
            returnDay={returnDay!}
            out={out}
            incoming={incoming}
            people={people}
            total={total}
            onBook={next}
            onBack={previous}
          />
        )}
        {step === 9 && (
          <PassengerInfo
            from={from}
            to={to}
            departDay={departDay!}
            returnDay={returnDay!}
            out={out!}
            incoming={incoming!}
            nationality={nationality}
            lastName={lastName}
            firstName={firstName}
            gender={gender}
            birth={birth}
            setNationality={setNationality}
            setLastName={setLastName}
            setFirstName={setFirstName}
            setGender={setGender}
            setBirth={setBirth}
            total={total}
            onContinue={next}
            onBack={previous}
          />
        )}
        {step === 10 && (
          <Booked
            from={from}
            to={to}
            dates={dates}
            total={total}
            onConfirm={async () => {
              try {
                await completePractice();
                next();
              } catch {
                Alert.alert(
                  "통계 저장 실패",
                  "네트워크를 확인한 뒤 다시 눌러 주세요.",
                );
              }
            }}
          />
        )}
        {step === 11 && (
          <BoardingPass
            from={from}
            to={to}
            departDay={departDay!}
            flight={out!}
            passenger={`${lastName} ${firstName}`}
            onDone={next}
            onBack={previous}
          />
        )}
        {step === 12 && <Finished onBack={onBack} onReset={reset} />}
        {step < 12 && !mission && (
          <Controls onPrevious={previous} onExit={onBack} />
        )}
        <Mission
          visible={mission && step < 12}
          step={step + 1}
          text={guides[step] || ""}
          onStart={() => setMission(false)}
          onExit={onBack}
        />
        <Wrong
          visible={Boolean(wrong)}
          text={wrong}
          onClose={() => setWrong("")}
        />
      </View>
    </SafeAreaView>
  );
}

function TripHome({
  onFlight,
  onWrong,
}: {
  onFlight: () => void;
  onWrong: () => void;
}) {
  return (
    <ScrollView style={s.page}>
      <View style={s.hero}>
        <Text style={s.trip}>
          여행<Text style={s.yellow}>.</Text>com
        </Text>
        <Text style={s.silver}>🟡</Text>
      </View>
      <View style={s.homeCard}>
        <View style={s.mainIcons}>
          {[
            ["🛏️", "숙소"],
            ["✈️", "항공권"],
            ["🏨", "항공 + 호텔"],
            ["🚆", "기차표"],
          ].map(([i, t]) => (
            <Pressable
              key={t}
              onPress={t === "항공권" ? onFlight : onWrong}
              style={s.mainIcon}
            >
              <View style={s.circle}>
                <Text style={s.iconBig}>{i}</Text>
              </View>
              <Text style={s.iconTitle}>
                {t}
                <Text style={s.yellow}>.</Text>
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={s.subIcons}>
          {["홈&빌라", "투어&티켓", "공항픽업", "렌터카", "더보기(6)"].map(
            (x) => (
              <Pressable onPress={onWrong} key={x} style={s.subIcon}>
                <Text style={s.subEmoji}>✈</Text>
                <Text>{x}</Text>
              </Pressable>
            ),
          )}
        </View>
        <View style={s.search}>
          <Text style={s.gray}>🤖　싱가포르</Text>
          <Text style={s.searchButton}>⌕</Text>
        </View>
        <View style={s.tags}>
          <Text>베이징</Text>
          <Text>상하이</Text>
          <Text>쿠알라룸푸르</Text>
          <Text>싱가포르</Text>
        </View>
        <View style={s.banner}>
          <Text style={s.bannerTop}>9.9 메가세일</Text>
          <Text style={s.bannerText}>일본 · 중국 · 베트남 항공권 9,000원~</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function CityPicker({
  title,
  selected,
  blocked,
  onPick,
  onBack,
}: {
  title: string;
  selected: string;
  blocked?: string;
  onPick: (city: string) => void;
  onBack: () => void;
}) {
  const [query, setQuery] = useState("");
  const cities = [
    "서울",
    "부산",
    "제주",
    "대구",
    "광주",
    "오사카",
    "도쿄",
    "후쿠오카",
    "삿포로",
    "오키나와",
    "베이징",
    "상하이",
    "홍콩",
    "타이베이",
    "방콕",
    "다낭",
    "싱가포르",
    "괌",
  ];
  const airports = [
    { code: "GMP", name: "김포국제공항", city: "서울" },
    { code: "ICN", name: "인천국제공항", city: "서울" },
    { code: "PUS", name: "김해국제공항", city: "부산" },
    { code: "CJU", name: "제주국제공항", city: "제주" },
  ];
  const q = query.trim().toLowerCase();
  const shownCities = cities.filter((c) => !q || c.toLowerCase().includes(q));
  const shownAirports = airports.filter(
    (a) => !q || `${a.code} ${a.name} ${a.city}`.toLowerCase().includes(q),
  );
  return (
    <View style={s.page}>
      <Header title={title} onBack={onBack} />
      <View style={s.citySearch}>
        <Text style={{ fontSize: 22 }}>⌕</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          autoFocus
          placeholder="국가, 도시, 공항 검색"
          style={{ flex: 1, fontSize: 18 }}
        />
      </View>
      <ScrollView contentContainerStyle={s.cityPad}>
        <Text style={s.chooseHint}>
          {blocked
            ? `${blocked} 이외의 도착지를 선택해 주세요.`
            : "검색하거나 아래 목록에서 출발지를 선택해 주세요."}
        </Text>
        {shownCities.length > 0 && (
          <>
            <Text style={s.section}>{q ? "도시 검색 결과" : "인기 도시"}</Text>
            <View style={s.cityGrid}>
              {shownCities.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => onPick(c)}
                  style={[
                    s.city,
                    c === selected && s.cityTarget,
                    c === blocked && s.cityBlocked,
                  ]}
                >
                  <Text style={c === selected ? s.blueText : undefined}>
                    {c}
                    {c === blocked ? " · 출발지" : ""}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
        {shownAirports.length > 0 && (
          <>
            <Text style={s.section}>주요 공항</Text>
            {shownAirports.map((a) => (
              <Pressable
                key={a.code}
                onPress={() => onPick(a.city)}
                style={[s.airport, a.city === blocked && s.cityBlocked]}
              >
                <Text style={s.airportTitle}>
                  ✈ {a.code} {a.name}
                </Text>
                <Text style={s.gray}>
                  {a.city}
                  {a.city === blocked ? " · 출발지" : ""}
                </Text>
              </Pressable>
            ))}
          </>
        )}
        {shownCities.length === 0 && shownAirports.length === 0 && (
          <Text style={s.gray}>
            검색 결과가 없습니다. 다른 도시 이름을 입력해 주세요.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const dayText = (day: number | null) =>
  day
    ? `9월 ${day}일(${["일", "월", "화", "수", "목", "금", "토"][(day + 1) % 7]})`
    : "날짜 선택";
function Calendar({
  departDay,
  returnDay,
  setDepartDay,
  setReturnDay,
  onConfirm,
  onBack,
  onWrong,
}: {
  departDay: number | null;
  returnDay: number | null;
  setDepartDay: (day: number | null) => void;
  setReturnDay: (day: number | null) => void;
  onConfirm: () => void;
  onBack: () => void;
  onWrong: (text: string) => void;
}) {
  const selectDay = (day: number) => {
    if (!departDay || returnDay || day <= departDay) {
      setDepartDay(day);
      setReturnDay(null);
      return;
    }
    setReturnDay(day);
  };
  const ready = Boolean(departDay && returnDay);
  return (
    <View style={s.page}>
      <Header title="날짜 선택" onBack={onBack} />
      <View style={s.week}>
        {["일", "월", "화", "수", "목", "금", "토"].map((x) => (
          <Text key={x} style={x === "일" ? s.red : undefined}>
            {x}
          </Text>
        ))}
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 180 }}>
        <Text style={s.month}>2026년 9월</Text>
        <Text style={[s.gray, { textAlign: "center", marginBottom: 12 }]}>
          {returnDay
            ? "날짜 선택이 완료됐어요."
            : departDay
              ? "이제 가는 날보다 뒤의 오는 날을 선택해 주세요."
              : "먼저 가는 날을 선택해 주세요."}
        </Text>
        <View style={s.days}>
          {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => {
            const edge = d === departDay || d === returnDay;
            const between = Boolean(
              departDay && returnDay && d > departDay && d < returnDay,
            );
            return (
              <Pressable
                key={d}
                onPress={() => selectDay(d)}
                style={[s.day, edge && s.dayOn, between && s.dayBetween]}
              >
                <Text
                  style={
                    edge ? s.whiteText : (d + 1) % 7 === 0 ? s.red : undefined
                  }
                >
                  {d}
                </Text>
                {d === returnDay && <Text style={s.dayPrice}>선택</Text>}
              </Pressable>
            );
          })}
        </View>
        <View style={s.holidays}>
          <Text>• 9월 24일 추석 연휴</Text>
          <Text>• 9월 25일 추석</Text>
          <Text>• 9월 26일 추석 연휴</Text>
        </View>
      </ScrollView>
      <View style={s.calendarBottom}>
        <View style={s.rowBetween}>
          <Text style={s.dateText}>{dayText(departDay)}</Text>
          <Text style={[s.dateText, returnDay ? s.blueText : undefined]}>
            {dayText(returnDay)}
          </Text>
        </View>
        <Pressable
          style={[s.blueButton, !ready && { opacity: 0.45 }]}
          onPress={
            ready
              ? onConfirm
              : () => onWrong("가는 날과 오는 날을 모두 선택해 주세요.")
          }
        >
          <Text style={s.buttonText}>확인</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Passengers({
  adults,
  children,
  infants,
  setAdults,
  setChildren,
  setInfants,
  onConfirm,
  onBack,
}: {
  adults: number;
  children: number;
  infants: number;
  setAdults: (n: number) => void;
  setChildren: (n: number) => void;
  setInfants: (n: number) => void;
  onConfirm: () => void;
  onBack: () => void;
}) {
  return (
    <View style={s.page}>
      <Header title="탑승객" onBack={onBack} />
      <View style={s.passengerPad}>
        <Counter
          title="성인"
          note="탑승일 기준 만 12세 이상"
          value={adults}
          setValue={(n) => setAdults(Math.max(1, n))}
        />
        <Counter
          title="어린이"
          note="탑승일 기준 만 2~11세"
          value={children}
          setValue={(n) => setChildren(Math.max(0, n))}
        />
        <Counter
          title="유아(보호자와 동반착석)"
          note="탑승일 기준 생후 14일~만 2세 미만"
          value={infants}
          setValue={(n) => setInfants(Math.max(0, n))}
        />
        <View style={s.passengerInfo}>
          <Text>
            표시되는 정보는{" "}
            <Text style={{ fontWeight: "900" }}>1인당 평균 요금</Text>이며,
            {`\n`}탑승객 유형에 따라 금액이 달라질 수 있습니다.
          </Text>
        </View>
        <Pressable style={s.blueButton} onPress={onConfirm}>
          <Text style={s.buttonText}>확인</Text>
        </Pressable>
      </View>
    </View>
  );
}
function Counter({
  title,
  note,
  value,
  setValue,
}: {
  title: string;
  note: string;
  value: number;
  setValue: (n: number) => void;
}) {
  return (
    <View style={s.counter}>
      <View style={{ flex: 1 }}>
        <Text style={s.counterTitle}>{title}</Text>
        <Text style={s.gray}>{note}</Text>
      </View>
      <Pressable style={s.minus} onPress={() => setValue(value - 1)}>
        <Text style={s.counterSign}>−</Text>
      </Pressable>
      <Text style={s.count}>{value}</Text>
      <Pressable style={s.plus} onPress={() => setValue(value + 1)}>
        <Text style={[s.counterSign, s.whiteText]}>＋</Text>
      </Pressable>
    </View>
  );
}

function SearchCard({
  from,
  to,
  dates,
  adults,
  children,
  infants,
  onFrom,
  onTo,
  onDates,
  onPeople,
  onSearch,
  onBack,
}: {
  from: string;
  to: string;
  dates: string;
  adults: number;
  children: number;
  infants: number;
  onFrom: () => void;
  onTo: () => void;
  onDates: () => void;
  onPeople: () => void;
  onSearch: () => void;
  onBack: () => void;
}) {
  const passengerText = [
    `성인 ${adults}명`,
    children ? `어린이 ${children}명` : "",
    infants ? `유아 ${infants}명` : "",
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <ScrollView style={s.page}>
      <View style={s.searchHero}>
        <Pressable onPress={onBack}>
          <Text style={s.backWhite}>‹</Text>
        </Pressable>
        <Text style={s.tripSmall}>여행</Text>
      </View>
      <View style={s.bookingCard}>
        <View style={s.tripTabs}>
          <Text>편도</Text>
          <Text style={s.tabOn}>왕복</Text>
          <Text>다구간</Text>
        </View>
        <Pressable onPress={onFrom}>
          <Text style={s.route}>🛫　{from || "출발지 선택"}</Text>
        </Pressable>
        <Pressable onPress={onTo}>
          <Text style={s.route}>🛬　{to || "도착지 선택"}</Text>
        </Pressable>
        <Pressable onPress={onDates}>
          <Text style={s.route}>▣　{dates}</Text>
        </Pressable>
        <Pressable onPress={onPeople}>
          <Text style={s.route}>♙　{passengerText} · 일반석</Text>
        </Pressable>
        <Pressable style={s.blueButton} onPress={onSearch}>
          <Text style={s.buttonText}>선택 조건으로 항공권 조회</Text>
        </Pressable>
      </View>
      <View style={s.bigBanner}>
        <Text style={s.whiteTitle}>
          {from && to ? `${from}-${to}` : "원하는 여행 조건을 선택하세요"}
          {`\n`}왕복 특가를 확인하세요!
        </Text>
        <Text style={s.plane}>✈️</Text>
      </View>
    </ScrollView>
  );
}

function FlightList({
  title,
  route,
  travelDay,
  flights,
  selected,
  onSelect,
  onBack,
}: {
  title: string;
  route: string;
  travelDay: number;
  flights: Flight[];
  selected: Flight | null;
  onSelect: (f: Flight) => void;
  onBack: () => void;
}) {
  const [from, to] = route.split(" ⇄ ");
  const direction = title.startsWith("가는")
    ? `${from} → ${to}`
    : `${to} → ${from}`;
  return (
    <View style={[s.page, s.listBg]}>
      <Header title={route} onBack={onBack} />
      <View style={s.stepTitle}>
        <Text style={s.stepBadge}>{title.startsWith("가는") ? "1" : "2"}</Text>
        <Text style={s.listTitle}>{title}</Text>
      </View>
      <View style={s.dateStrip}>
        <Text>
          9월 {Math.max(1, travelDay - 1)}일{`\n`}195,400원
        </Text>
        <Text style={s.dateOn}>
          {dayText(travelDay)}
          {`\n`}155,000원
        </Text>
        <Text>
          9월 {Math.min(30, travelDay + 1)}일{`\n`}160,600원
        </Text>
      </View>
      <View style={s.sort}>
        <Text>⌁ 추천</Text>
        <Text>☷ 필터</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 120 }}>
        {flights.map((f, i) => (
          <Pressable
            key={f.time}
            style={[s.flightCard, selected === f && s.flightSelected]}
            onPress={() => onSelect(f)}
          >
            <Text style={s.lowest}>
              {i === 0 ? "최저가(직항)" : i === 1 ? "가성비 최고" : "직항"}
            </Text>
            <View style={s.flightTimes}>
              <Text style={s.flightTime}>{f.time}</Text>
              <Text style={s.duration}>2시간</Text>
              <Text style={s.flightTime}>{f.arrival}</Text>
              <Text style={s.price}>
                {title.startsWith("오는") ? "+" : ""}
                {f.price.toLocaleString()}원
              </Text>
            </View>
            <Text style={s.airportCode}>{direction}</Text>
            <Text style={s.airline}>▣ {f.airline}　|　보잉 737</Text>
            <Text style={s.baggage}>▣ 위탁 수하물 15kg</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function Review({
  from,
  to,
  departDay,
  returnDay,
  out,
  incoming,
  people,
  total,
  onBook,
  onBack,
}: {
  from: string;
  to: string;
  departDay: number;
  returnDay: number;
  out: Flight;
  incoming: Flight;
  people: number;
  total: number;
  onBook: () => void;
  onBack: () => void;
}) {
  return (
    <View style={[s.page, s.listBg]}>
      <Header title="예약 정보 확인" onBack={onBack} />
      <ScrollView contentContainerStyle={s.reviewPad}>
        <Text style={s.reviewTitle}>
          {from} ⇄ {to}
        </Text>
        <Text style={s.gray}>왕복 · 탑승객 {people}명 · 일반석</Text>
        <FlightSummary
          label={`가는 편 · ${dayText(departDay)}`}
          flight={out}
          route={`${from} → ${to}`}
        />
        <FlightSummary
          label={`오는 편 · ${dayText(returnDay)}`}
          flight={incoming}
          route={`${to} → ${from}`}
        />
        <View style={s.totalBox}>
          <Text style={s.section}>결제 예정 금액</Text>
          <Text style={s.total}>{total.toLocaleString()}원</Text>
          <Text style={s.gray}>
            선택한 전체 탑승객 기준 · 실제 결제는 진행되지 않습니다.
          </Text>
        </View>
      </ScrollView>
      <View style={s.reviewBottom}>
        <View>
          <Text style={s.price}>{total.toLocaleString()}원</Text>
          <Text>총 결제 금액</Text>
        </View>
        <Pressable style={s.bookButton} onPress={onBook}>
          <Text style={s.buttonText}>예약하기</Text>
        </Pressable>
      </View>
    </View>
  );
}
function FlightSummary({
  label,
  flight,
  route,
}: {
  label: string;
  flight: Flight;
  route: string;
}) {
  return (
    <View style={s.summary}>
      <Text style={s.summaryLabel}>{label}</Text>
      <Text style={s.flightTime}>
        {flight.time}　→　{flight.arrival}
      </Text>
      <Text style={s.airportCode}>{route}</Text>
      <Text style={s.airline}>{flight.airline} · 위탁 수하물 15kg</Text>
    </View>
  );
}
function PassengerInfo({
  from,
  to,
  departDay,
  returnDay,
  out,
  incoming,
  nationality,
  lastName,
  firstName,
  gender,
  birth,
  setNationality,
  setLastName,
  setFirstName,
  setGender,
  setBirth,
  total,
  onContinue,
  onBack,
}: {
  from: string;
  to: string;
  departDay: number;
  returnDay: number;
  out: Flight;
  incoming: Flight;
  nationality: string;
  lastName: string;
  firstName: string;
  gender: "남성" | "여성" | "";
  birth: string;
  setNationality: (value: string) => void;
  setLastName: (value: string) => void;
  setFirstName: (value: string) => void;
  setGender: (value: "남성" | "여성") => void;
  setBirth: (value: string) => void;
  total: number;
  onContinue: () => void;
  onBack: () => void;
}) {
  const [countryOpen, setCountryOpen] = useState(false);
  const ready = Boolean(
    nationality && lastName.trim() && firstName.trim() && gender && birth.length === 8,
  );
  const continueBooking = () => {
    if (!ready) {
      Alert.alert("입력 정보를 확인해 주세요", "국적, 영문 성과 이름, 성별, 생년월일 8자리를 모두 입력해 주세요.");
      return;
    }
    onContinue();
  };
  return (
    <View style={[s.page, s.listBg]}>
      <Header title="정보 입력" onBack={onBack} />
      <ScrollView contentContainerStyle={s.passengerFormPad}>
        <View style={s.progressRow}>
          <Text style={s.progressActive}>1</Text><Text style={s.progressLine}>―</Text><Text style={s.progressOff}>2</Text><Text style={s.progressLine}>―</Text><Text style={s.progressOff}>3</Text><Text style={s.progressLine}>―</Text><Text style={s.progressOff}>4</Text>
        </View>
        <Text style={s.securing}>◯ 선택하신 운임과 좌석 등급을 확보하는 중입니다…</Text>
        <View style={s.itineraryBox}>
          <Text style={s.reviewTitle}>{from} ⇄ {to}</Text>
          <Text style={s.itineraryText}>가는날: {dayText(departDay)}　{out.time}~{out.arrival}</Text>
          <Text style={s.itineraryText}>오는날: {dayText(returnDay)}　{incoming.time}~{incoming.arrival}</Text>
          <Text style={s.ruleText}>수하물 및 규정　›</Text>
        </View>
        <View style={s.flexBox}><Text style={s.flexText}>🛡 트립플렉스 · 간편 취소/변경 연습</Text><Text>›</Text></View>
        <View style={s.passengerForm}>
          <Text style={s.formTitle}>탑승객 정보</Text>
          <Text style={s.formGuide}>• 신분증 또는 여권에 기재된 정보와 동일하게 입력해 주세요.</Text>
          <Pressable style={s.formInput} onPress={() => setCountryOpen(true)}><Text style={nationality?s.inputValue:s.inputPlaceholder}>{nationality || "국적(국가/지역)"}</Text><Text style={s.inputArrow}>›</Text></Pressable>
          <TextInput style={s.formInput} value={lastName} onChangeText={(v) => setLastName(v.replace(/[^a-zA-Z]/g, "").toUpperCase())} autoCapitalize="characters" placeholder="성 (영어)" />
          <TextInput style={s.formInput} value={firstName} onChangeText={(v) => setFirstName(v.replace(/[^a-zA-Z]/g, "").toUpperCase())} autoCapitalize="characters" placeholder="이름 (영어)" />
          <View style={s.genderBox}><Text style={s.genderLegend}>신분증 상 성별</Text>{(["남성","여성"] as const).map((item) => <Pressable key={item} style={s.genderChoice} onPress={() => setGender(item)}><Text style={[s.radio,gender===item&&s.radioOn]}>{gender===item?"●":"○"}</Text><Text style={s.genderText}>{item}</Text></Pressable>)}</View>
          <TextInput style={s.formInput} value={birth} onChangeText={(v) => setBirth(v.replace(/\D/g, "").slice(0, 8))} keyboardType="number-pad" maxLength={8} placeholder="생년월일 8자리 (예: 19600101)" />
          <View style={s.practiceNotice}><Text style={s.gray}>연습용 화면입니다. 실제 개인정보는 저장되지 않습니다.</Text></View>
        </View>
      </ScrollView>
      <View style={s.infoBottom}><View><Text style={s.gray}>총 결제 예정 금액</Text><Text style={s.price}>{total.toLocaleString()}원</Text></View><Pressable style={[s.continueButton,!ready&&{opacity:.45}]} onPress={continueBooking}><Text style={s.buttonText}>계속</Text></Pressable></View>
      <Modal visible={countryOpen} transparent animationType="slide"><View style={s.countryDim}><View style={s.countrySheet}><Text style={s.formTitle}>국적 선택</Text>{["대한민국","일본","미국","중국","태국","베트남","싱가포르"].map((country) => <Pressable key={country} style={s.countryRow} onPress={() => {setNationality(country);setCountryOpen(false)}}><Text style={s.countryText}>{country}</Text><Text>›</Text></Pressable>)}<Pressable style={s.retry} onPress={() => setCountryOpen(false)}><Text style={s.gray}>닫기</Text></Pressable></View></View></Modal>
    </View>
  );
}
function Booked({
  from,
  to,
  dates,
  total,
  onConfirm,
}: {
  from: string;
  to: string;
  dates: string;
  total: number;
  onConfirm: () => void;
}) {
  return (
    <View style={[s.page, s.center]}>
      <View style={s.completeCircle}>
        <Text style={s.completeCheck}>✓</Text>
      </View>
      <Text style={s.completeTitle}>항공권 예약을 완료했어요</Text>
      <Text style={s.completeRoute}>
        {from} ⇄ {to}
      </Text>
      <Text style={s.gray}>{dates}</Text>
      <View style={s.ticket}>
        <Text style={s.ticketTitle}>왕복 항공권</Text>
        <Text style={s.total}>{total.toLocaleString()}원</Text>
        <Text style={s.gray}>교육용 예약 번호　TRIP-0908</Text>
      </View>
      <Pressable style={s.blueButton} onPress={onConfirm}>
        <Text style={s.buttonText}>확인</Text>
      </Pressable>
    </View>
  );
}
const airportCodes: Record<string, string> = {
  서울: "ICN", 부산: "PUS", 제주: "CJU", 대구: "TAE", 광주: "KWJ",
  오사카: "KIX", 도쿄: "NRT", 후쿠오카: "FUK", 삿포로: "CTS", 오키나와: "OKA",
  베이징: "PEK", 상하이: "PVG", 홍콩: "HKG", 타이베이: "TPE", 방콕: "BKK",
  다낭: "DAD", 싱가포르: "SIN", 괌: "GUM",
};
function BoardingPass({
  from,
  to,
  departDay,
  flight,
  passenger,
  onDone,
  onBack,
}: {
  from: string;
  to: string;
  departDay: number;
  flight: Flight;
  passenger: string;
  onDone: () => void;
  onBack: () => void;
}) {
  const qrPattern = Array.from({ length: 81 }, (_, i) =>
    [0,1,2,9,11,18,19,20,4,6,12,15,22,24,27,29,31,33,35,37,40,41,43,45,47,49,51,53,55,57,59,61,63,65,67,69,71,73,75,77,79,80].includes(i),
  );
  return (
    <View style={[s.page, s.boardingBg]}>
      <Header title="모바일 탑승권" onBack={onBack} />
      <ScrollView contentContainerStyle={s.boardingPad}>
        <Text style={s.boardingHero}>탑승권이 발급되었어요</Text>
        <Text style={s.boardingSub}>공항에서는 탑승권과 신분증을 함께 준비해 주세요.</Text>
        <View style={s.boardingCard}>
          <View style={s.boardingBrand}><Text style={s.boardingBrandText}>SMART AIR</Text><Text style={s.boardingType}>BOARDING PASS</Text></View>
          <View style={s.boardingRoute}>
            <View style={s.codeBlock}><Text style={s.airportBig}>{airportCodes[from] || "DEP"}</Text><Text style={s.citySmall}>{from}</Text></View>
            <View style={s.routePlane}><Text style={s.routeLine}>━━━━ ✈</Text><Text style={s.directText}>직항</Text></View>
            <View style={[s.codeBlock,{alignItems:"flex-end"}]}><Text style={s.airportBig}>{airportCodes[to] || "ARR"}</Text><Text style={s.citySmall}>{to}</Text></View>
          </View>
          <View style={s.ticketDivider}><View style={s.ticketNotchLeft}/><Text style={s.dashLine}>- - - - - - - - - - - - - - - -</Text><View style={s.ticketNotchRight}/></View>
          <View style={s.boardingDetails}>
            <TicketField label="탑승객" value={passenger || "PASSENGER"}/>
            <TicketField label="항공편" value="SK 0908"/>
            <TicketField label="탑승일" value={dayText(departDay)}/>
            <TicketField label="출발시간" value={flight.time}/>
            <TicketField label="게이트" value="A12"/>
            <TicketField label="좌석" value="18A" highlight/>
          </View>
          <View style={s.qrArea}><View style={s.qrBox}>{qrPattern.map((on,i)=><View key={i} style={[s.qrCell,on&&s.qrCellOn]}/>)}</View><View style={{flex:1}}><Text style={s.scanTitle}>탑승 시 QR을 보여주세요</Text><Text style={s.boardingNumber}>교육용 탑승권 · BP-0908-18A</Text></View></View>
          <View style={s.fakeBanner}><Text style={s.fakeBannerText}>연습용 탑승권입니다 · 실제 탑승에는 사용할 수 없습니다</Text></View>
        </View>
        <View style={s.boardingTip}><Text style={s.formTitle}>탑승 전 확인</Text><Text style={s.tipText}>✓ 출발 2시간 전 공항 도착</Text><Text style={s.tipText}>✓ 탑승권과 신분증 준비</Text><Text style={s.tipText}>✓ 탑승구와 탑승 시간 다시 확인</Text></View>
        <Pressable style={s.blueButton} onPress={onDone}><Text style={s.buttonText}>탑승권 확인 완료</Text></Pressable>
      </ScrollView>
    </View>
  );
}
function TicketField({label,value,highlight=false}:{label:string;value:string;highlight?:boolean}) {
  return <View style={s.ticketField}><Text style={s.ticketFieldLabel}>{label}</Text><Text style={[s.ticketFieldValue,highlight&&s.ticketHighlight]}>{value}</Text></View>;
}
function Finished({
  onBack,
  onReset,
}: {
  onBack: () => void;
  onReset: () => void;
}) {
  return (
    <View style={[s.page, s.center]}>
      <Text style={s.finishEmoji}>✈️</Text>
      <Text style={s.completeTitle}>항공권 예약 연습 완료!</Text>
      <Text style={s.finishText}>
        출발지, 날짜, 탑승객과 왕복 항공편을{`\n`}차례대로 선택하는 방법을
        익혔어요.
      </Text>
      <Pressable style={s.blueButton} onPress={onBack}>
        <Text style={s.buttonText}>연습 목록으로</Text>
      </Pressable>
      <Pressable onPress={onReset} style={s.retry}>
        <Text style={s.blueText}>다시 연습하기</Text>
      </Pressable>
    </View>
  );
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={s.header}>
      <Pressable onPress={onBack}>
        <Text style={s.back}>‹</Text>
      </Pressable>
      <Text style={s.headerTitle}>{title}</Text>
      <View style={{ width: 30 }} />
    </View>
  );
}
function Controls({
  onPrevious,
  onExit,
}: {
  onPrevious: () => void;
  onExit: () => void;
}) {
  return (
    <View style={s.controls}>
      <Pressable onPress={onPrevious} style={s.controlDark}>
        <Text style={s.whiteText}>‹ 이전</Text>
      </Pressable>
      <Pressable onPress={onExit} style={s.controlLight}>
        <Text style={s.exitText}>교육 마치기</Text>
      </Pressable>
    </View>
  );
}
function Mission({
  visible,
  step,
  text,
  onStart,
  onExit,
}: {
  visible: boolean;
  step: number;
  text: string;
  onStart: () => void;
  onExit: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={s.dim}>
        <View style={s.mission}>
          <Text style={s.missionBadge}>MISSION {step}</Text>
          <Text style={s.missionTitle}>항공권 예약 미션</Text>
          <Text style={s.missionText}>{text}</Text>
          <Text style={s.missionNote}>
            실제 항공권 예약이나 결제는 진행되지 않아요.
          </Text>
          <Pressable
            style={s.missionButton}
            onPress={() => {
              Speech.speak(text, { language: "ko-KR", rate: 0.88 });
              onStart();
            }}
          >
            <Text style={s.buttonText}>시작하기</Text>
          </Pressable>
          <Pressable style={s.retry} onPress={onExit}>
            <Text style={s.gray}>교육 마치기</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
function Wrong({
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
      <View style={s.dim}>
        <View style={s.mission}>
          <Text style={s.wrongIcon}>!</Text>
          <Text style={s.missionTitle}>지금은 이 버튼이 아니에요</Text>
          <Text style={s.missionText}>
            다른 버튼을 누르지 말고{`\n`}
            <Text style={{ fontWeight: "900" }}>{text}</Text>
          </Text>
          <Pressable style={s.missionButton} onPress={onClose}>
            <Text style={s.buttonText}>미션 계속하기</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "white" },
  shell: { flex: 1, width: "100%", maxWidth: 980, alignSelf: "center" },
  page: { flex: 1, backgroundColor: "white" },
  hero: {
    height: 160,
    backgroundColor: BLUE,
    padding: 28,
    paddingTop: 55,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  trip: { fontSize: 40, fontWeight: "900", color: "white" },
  tripSmall: { fontSize: 25, fontWeight: "900", color: "white" },
  yellow: { color: "#ffc400" },
  silver: { color: "white", fontWeight: "800", marginTop: 15 },
  homeCard: {
    marginTop: -20,
    backgroundColor: "white",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
  },
  mainIcons: { flexDirection: "row", justifyContent: "space-between" },
  mainIcon: { width: "24%", alignItems: "center" },
  circle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#f0f3ff",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBig: { fontSize: 37 },
  iconTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: BLUE,
    marginTop: 8,
    textAlign: "center",
  },
  subIcons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 32,
  },
  subIcon: { alignItems: "center", gap: 6 },
  subEmoji: { fontSize: 25, color: BLUE },
  search: {
    height: 62,
    borderWidth: 2,
    borderColor: BLUE,
    borderRadius: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 25,
  },
  gray: { color: "#7c8494" },
  searchButton: {
    width: 58,
    height: 52,
    borderRadius: 27,
    backgroundColor: BLUE,
    color: "white",
    fontSize: 38,
    textAlign: "center",
  },
  tags: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 18,
  },
  banner: {
    height: 150,
    borderRadius: 16,
    backgroundColor: "#073fc1",
    padding: 25,
  },
  bannerTop: { fontSize: 27, fontWeight: "900", color: "white" },
  bannerText: {
    fontSize: 21,
    fontWeight: "900",
    color: "#ffe41f",
    marginTop: 14,
  },
  header: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  back: { fontSize: 42 },
  headerTitle: { fontSize: 22, fontWeight: "900" },
  citySearch: {
    height: 60,
    margin: 20,
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 7,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  cityPad: { padding: 20, paddingBottom: 80 },
  chooseHint: { color: "#777", marginTop: -10, marginBottom: 14 },
  section: { fontSize: 22, fontWeight: "900", marginVertical: 18 },
  cityGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  city: {
    width: "31%",
    height: 54,
    backgroundColor: "#f5f6fa",
    alignItems: "center",
    justifyContent: "center",
  },
  cityTarget: { borderWidth: 2, borderColor: BLUE, backgroundColor: "#eff3ff" },
  cityBlocked: { backgroundColor: "#eee", opacity: 0.65 },
  blueText: { color: BLUE, fontWeight: "900" },
  airport: { padding: 19, borderBottomWidth: 1, borderColor: "#ddd", gap: 9 },
  airportTitle: { fontSize: 19, fontWeight: "800" },
  week: {
    height: 55,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  red: { color: "#e53636" },
  month: {
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
    marginVertical: 22,
  },
  days: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 22 },
  day: {
    width: "14.285%",
    height: 69,
    alignItems: "center",
    justifyContent: "center",
  },
  dayOn: { backgroundColor: BLUE, borderRadius: 8 },
  dayBetween: { backgroundColor: "#edf3ff" },
  whiteText: { color: "white", fontWeight: "900" },
  dayPrice: { fontSize: 11, color: "white" },
  holidays: { padding: 28, gap: 13 },
  calendarBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderColor: "#ddd",
    gap: 18,
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between" },
  dateText: { fontSize: 22, fontWeight: "900" },
  blueButton: {
    minHeight: 62,
    borderRadius: 6,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  buttonText: { color: "white", fontSize: 19, fontWeight: "900" },
  passengerPad: { padding: 25, gap: 6 },
  counter: {
    minHeight: 112,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  counterTitle: { fontSize: 22, fontWeight: "800", marginBottom: 8 },
  minus: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: "#7f8795",
    alignItems: "center",
    justifyContent: "center",
  },
  plus: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
  },
  counterSign: { fontSize: 30, fontWeight: "900", color: "#777" },
  count: { fontSize: 24, marginHorizontal: 18 },
  passengerInfo: {
    backgroundColor: "#eef3ff",
    padding: 18,
    borderRadius: 8,
    marginVertical: 24,
  },
  searchHero: {
    height: 170,
    backgroundColor: "#21376b",
    padding: 28,
    flexDirection: "row",
    gap: 30,
  },
  backWhite: { fontSize: 44, color: "white" },
  bookingCard: {
    margin: -50,
    marginHorizontal: 26,
    backgroundColor: "white",
    borderRadius: 17,
    padding: 24,
    elevation: 7,
    gap: 4,
  },
  tripTabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  tabOn: {
    color: BLUE,
    fontWeight: "900",
    borderBottomWidth: 3,
    borderColor: BLUE,
    paddingBottom: 13,
  },
  route: {
    fontSize: 21,
    fontWeight: "800",
    paddingVertical: 17,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  bigBanner: {
    height: 170,
    margin: 26,
    marginTop: 75,
    borderRadius: 18,
    backgroundColor: "#174ec5",
    padding: 24,
  },
  whiteTitle: { fontSize: 25, fontWeight: "900", color: "white" },
  plane: { fontSize: 60, position: "absolute", right: 35, bottom: 25 },
  listBg: { backgroundColor: "#f0f2f6" },
  stepTitle: {
    height: 72,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 26,
    gap: 10,
  },
  stepBadge: {
    backgroundColor: BLUE,
    color: "white",
    fontSize: 20,
    padding: 7,
    borderRadius: 4,
  },
  listTitle: { fontSize: 22, fontWeight: "800" },
  dateStrip: {
    height: 90,
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  dateOn: {
    backgroundColor: BLUE,
    color: "white",
    padding: 15,
    borderRadius: 7,
    textAlign: "center",
  },
  sort: {
    height: 62,
    margin: 14,
    marginBottom: 0,
    backgroundColor: "white",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  flightCard: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
  },
  flightSelected: { borderWidth: 3, borderColor: BLUE },
  lowest: { color: "#068e9a", fontWeight: "800" },
  flightTimes: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 13,
  },
  flightTime: { fontSize: 26, fontWeight: "900" },
  duration: { color: "#777" },
  price: { fontSize: 24, fontWeight: "900", color: BLUE },
  airportCode: { fontSize: 15, marginTop: 6 },
  airline: { color: "#777", fontSize: 16, marginTop: 15 },
  baggage: { color: "#008b96", fontSize: 16, marginTop: 12 },
  reviewPad: { padding: 20, paddingBottom: 125 },
  reviewTitle: { fontSize: 28, fontWeight: "900", marginTop: 10 },
  summary: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginTop: 17,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 17,
    fontWeight: "900",
    color: BLUE,
    marginBottom: 14,
  },
  totalBox: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginTop: 17,
  },
  total: { fontSize: 31, fontWeight: "900", marginVertical: 8 },
  reviewBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 105,
    backgroundColor: "white",
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bookButton: {
    width: 190,
    height: 67,
    backgroundColor: BLUE,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  passengerFormPad: { padding: 18, paddingBottom: 130 },
  progressRow: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 5 },
  progressActive: { width: 25, height: 25, borderRadius: 13, backgroundColor: "#172033", color: "white", textAlign: "center", textAlignVertical: "center", fontWeight: "900" },
  progressOff: { width: 25, height: 25, borderRadius: 13, backgroundColor: "#9aa0aa", color: "white", textAlign: "center", textAlignVertical: "center", fontWeight: "900" },
  progressLine: { color: "#9aa0aa" },
  securing: { color: "#008d9b", fontSize: 17, fontWeight: "800", marginVertical: 14 },
  itineraryBox: { backgroundColor: "white", borderRadius: 15, padding: 20, gap: 12 },
  itineraryText: { fontSize: 17, fontWeight: "700" },
  ruleText: { borderTopWidth: 1, borderColor: "#e1e4e8", paddingTop: 17, fontSize: 17, color: "#555" },
  flexBox: { backgroundColor: "white", borderRadius: 15, padding: 20, marginVertical: 14, flexDirection: "row", justifyContent: "space-between" },
  flexText: { color: "#555", fontSize: 16, fontWeight: "700" },
  passengerForm: { backgroundColor: "white", borderRadius: 15, padding: 20, gap: 14 },
  formTitle: { fontSize: 24, fontWeight: "900" },
  formGuide: { color: "#626b7b", lineHeight: 23 },
  formInput: { minHeight: 64, borderWidth: 1, borderColor: "#c8cdd7", borderRadius: 6, paddingHorizontal: 16, fontSize: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "white" },
  inputPlaceholder: { color: "#858d9c", fontSize: 18 },
  inputValue: { color: "#172033", fontSize: 18, fontWeight: "800" },
  inputArrow: { fontSize: 32, color: "#596273" },
  genderBox: { minHeight: 76, borderWidth: 1, borderColor: "#c8cdd7", borderRadius: 6, paddingHorizontal: 16, paddingTop: 16, flexDirection: "row", alignItems: "center" },
  genderLegend: { position: "absolute", top: -11, left: 14, paddingHorizontal: 5, backgroundColor: "white", color: "#707887" },
  genderChoice: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  radio: { fontSize: 31, color: "#858d9c" },
  radioOn: { color: BLUE },
  genderText: { fontSize: 18, fontWeight: "700" },
  practiceNotice: { backgroundColor: "#eef3ff", padding: 14, borderRadius: 7 },
  infoBottom: { position: "absolute", bottom: 0, left: 0, right: 0, minHeight: 105, backgroundColor: "white", padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1, borderColor: "#e5e7eb" },
  continueButton: { width: 180, height: 65, backgroundColor: BLUE, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  countryDim: { flex: 1, backgroundColor: "rgba(0,0,0,.5)", justifyContent: "flex-end" },
  countrySheet: { backgroundColor: "white", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "78%" },
  countryRow: { minHeight: 58, borderBottomWidth: 1, borderColor: "#eee", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  countryText: { fontSize: 18, fontWeight: "700" },
  boardingBg: { backgroundColor: "#edf2fa" },
  boardingPad: { padding: 20, paddingBottom: 80 },
  boardingHero: { fontSize: 28, fontWeight: "900", textAlign: "center", marginTop: 10 },
  boardingSub: { color: "#697386", textAlign: "center", marginTop: 8, marginBottom: 22 },
  boardingCard: { backgroundColor: "white", borderRadius: 22, overflow: "hidden", elevation: 5 },
  boardingBrand: { backgroundColor: "#172b65", paddingHorizontal: 22, height: 72, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  boardingBrandText: { color: "white", fontSize: 24, fontWeight: "900" },
  boardingType: { color: "#cbd7ff", fontSize: 13, fontWeight: "800", letterSpacing: 1 },
  boardingRoute: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 24 },
  codeBlock: { flex: 1 },
  airportBig: { fontSize: 38, fontWeight: "900", color: "#172033" },
  citySmall: { color: "#697386", fontSize: 16, marginTop: 2 },
  routePlane: { flex: 1.2, alignItems: "center" },
  routeLine: { color: BLUE, fontSize: 18 },
  directText: { color: "#697386", fontSize: 12, marginTop: 4 },
  ticketDivider: { height: 28, justifyContent: "center", overflow: "hidden" },
  dashLine: { color: "#c9cfda", textAlign: "center" },
  ticketNotchLeft: { position: "absolute", left: -14, width: 28, height: 28, borderRadius: 14, backgroundColor: "#edf2fa" },
  ticketNotchRight: { position: "absolute", right: -14, width: 28, height: 28, borderRadius: 14, backgroundColor: "#edf2fa" },
  boardingDetails: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 22, paddingBottom: 12 },
  ticketField: { width: "33.33%", paddingVertical: 10 },
  ticketFieldLabel: { color: "#7b8495", fontSize: 13 },
  ticketFieldValue: { color: "#172033", fontSize: 17, fontWeight: "800", marginTop: 5 },
  ticketHighlight: { color: BLUE, fontSize: 25 },
  qrArea: { borderTopWidth: 1, borderColor: "#e5e8ee", marginHorizontal: 22, paddingVertical: 20, flexDirection: "row", alignItems: "center", gap: 18 },
  qrBox: { width: 99, height: 99, flexDirection: "row", flexWrap: "wrap", padding: 5, borderWidth: 1, borderColor: "#172033" },
  qrCell: { width: 9.7, height: 9.7, backgroundColor: "white" },
  qrCellOn: { backgroundColor: "#172033" },
  scanTitle: { fontSize: 17, fontWeight: "900" },
  boardingNumber: { color: "#7b8495", fontSize: 12, marginTop: 8 },
  fakeBanner: { backgroundColor: "#fff4d7", padding: 14 },
  fakeBannerText: { color: "#9b6500", fontWeight: "800", textAlign: "center" },
  boardingTip: { backgroundColor: "white", borderRadius: 16, padding: 20, marginVertical: 18, gap: 10 },
  tipText: { color: "#4c5668", fontSize: 16 },
  center: { padding: 30, alignItems: "center", justifyContent: "center" },
  completeCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
  },
  completeCheck: { fontSize: 62, color: "white" },
  completeTitle: {
    fontSize: 28,
    fontWeight: "900",
    marginTop: 25,
    textAlign: "center",
  },
  completeRoute: { fontSize: 21, fontWeight: "800", marginTop: 18 },
  ticket: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#dce2f1",
    borderRadius: 16,
    padding: 22,
    marginVertical: 30,
  },
  ticketTitle: { fontSize: 18, fontWeight: "900", color: BLUE },
  finishEmoji: { fontSize: 78 },
  finishText: {
    fontSize: 17,
    lineHeight: 27,
    textAlign: "center",
    color: "#666",
    marginVertical: 25,
  },
  retry: { padding: 17 },
  controls: {
    position: "absolute",
    top: 10,
    left: 12,
    right: 12,
    zIndex: 50,
    elevation: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  controlDark: {
    height: 43,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: "#222",
    alignItems: "center",
    justifyContent: "center",
  },
  controlLight: {
    height: 43,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  exitText: { color: "#d94b4b", fontWeight: "900" },
  dim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,.58)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  mission: {
    width: "100%",
    maxWidth: 560,
    backgroundColor: "white",
    borderRadius: 28,
    padding: 30,
    alignItems: "center",
  },
  missionBadge: {
    backgroundColor: "#e9efff",
    color: BLUE,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    fontWeight: "900",
  },
  missionTitle: { fontSize: 28, fontWeight: "900", marginTop: 18 },
  missionText: {
    fontSize: 21,
    lineHeight: 32,
    textAlign: "center",
    marginVertical: 18,
  },
  missionNote: { color: "#888", marginBottom: 16 },
  missionButton: {
    minHeight: 62,
    borderRadius: 10,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  wrongIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#fff1d8",
    color: "#e67a00",
    fontSize: 38,
    fontWeight: "900",
    textAlign: "center",
    textAlignVertical: "center",
  },
});

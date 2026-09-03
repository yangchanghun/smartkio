import { useState } from "react";
import {
  Alert,
  Image,
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
import { Gov24MissionModal } from "../components/Gov24MissionModal";
import { GOV24_CERTIFICATES } from "../data/certificates";

type Page =
  | "home"
  | "login"
  | "providers"
  | "form"
  | "terms"
  | "consent"
  | "waiting"
  | "done";
const missions = [
  "화면 아래의 로그인 버튼을 눌러 주세요.",
  "로그인 방식에서 간편인증을 선택해 주세요.",
  "민간 인증서 목록에서 카카오톡을 선택해 주세요.",
  "이름, 생년월일, 휴대폰 번호를 입력하고 다음을 눌러 주세요.",
  "필수 이용약관 세 가지를 모두 선택하고 인증 요청을 눌러 주세요.",
  "개인정보 수집 및 이용 동의를 선택하고 다음을 눌러 주세요.",
  "휴대폰 인증을 마쳤다고 가정하고 인증 완료 버튼을 눌러 주세요.",
];
export function Gov24PracticeScreen({
  token,
  onBack,
}: {
  token: string;
  onBack: () => void;
}) {
  const [page, setPage] = useState<Page>("home");
  const [step, setStep] = useState(0);
  const [mission, setMission] = useState(true);
  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const [phone, setPhone] = useState("");
  const [checks, setChecks] = useState([false, false, false]);
  const [consent, setConsent] = useState(false);
  const { completePractice, restartPracticeSession } = usePracticeSession(
    token,
    "GOV24_LOGIN",
  );
  const next = (target: Page) => {
    setPage(target);
    setStep((x) => x + 1);
    setMission(true);
  };
  const wrong = () => Alert.alert("현재 미션을 확인해 주세요", missions[step]);
  const reset = () => {
    setPage("home");
    setStep(0);
    setName("");
    setBirth("");
    setPhone("");
    setChecks([false, false, false]);
    setConsent(false);
    setMission(true);
    void restartPracticeSession().catch(() => undefined);
  };
  const finish = () => {
    setPage("done");
    setMission(false);
    Speech.speak("정부24 로그인 연습을 완료했습니다. 정말 잘하셨어요.", {
      language: "ko-KR",
      rate: 0.88,
    });
    void completePractice().catch(() => undefined);
  };
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.shell}>
        {page !== "done" && (
          <View style={s.top}>
            <Pressable onPress={onBack} style={s.back}>
              <Text style={s.backText}>‹</Text>
            </Pressable>
            <GovLogo />
            <Pressable onPress={() => setMission(true)} style={s.voice}>
              <Text>🔊</Text>
            </Pressable>
          </View>
        )}
        {page === "home" && (
          <Home onLogin={() => next("login")} onWrong={wrong} />
        )}
        {page === "login" && (
          <LoginMethods onPrivate={() => next("providers")} onWrong={wrong} />
        )}
        {page === "providers" && (
          <Providers onKakao={() => next("form")} onWrong={wrong} />
        )}
        {page === "form" && (
          <Form
            name={name}
            birth={birth}
            phone={phone}
            setName={setName}
            setBirth={setBirth}
            setPhone={setPhone}
            onNext={() =>
              name.trim() && birth.length >= 6 && phone.length >= 7
                ? next("terms")
                : Alert.alert(
                    "정보를 입력해 주세요",
                    "이름, 생년월일, 휴대폰 번호를 모두 입력해 주세요.",
                  )
            }
          />
        )}
        {page === "terms" && (
          <Terms
            values={checks}
            onToggle={(i) =>
              setChecks((v) => v.map((x, n) => (n === i ? !x : x)))
            }
            onNext={() =>
              checks.every(Boolean)
                ? next("consent")
                : Alert.alert(
                    "필수 동의가 필요해요",
                    "세 가지 항목을 모두 선택해 주세요.",
                  )
            }
          />
        )}
        {page === "consent" && (
          <Consent
            checked={consent}
            onToggle={() => setConsent((x) => !x)}
            onNext={() =>
              consent
                ? next("waiting")
                : Alert.alert(
                    "동의가 필요해요",
                    "개인정보 수집 및 이용 동의를 선택해 주세요.",
                  )
            }
          />
        )}
        {page === "waiting" && <Waiting onComplete={finish} />}
        {page === "done" && <Done onAgain={reset} onHome={onBack} />}
        {page !== "done" && (
          <Gov24MissionModal
            visible={mission}
            step={step + 1}
            text={missions[step]}
            onClose={() => setMission(false)}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
function GovLogo() {
  return (
    <Image
      source={require("../../../assets/goverment/goverment.png")}
      style={s.govLogo}
      resizeMode="contain"
    />
  );
}
function Home({
  onLogin,
  onWrong,
}: {
  onLogin: () => void;
  onWrong: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={s.content}>
      <View style={s.search}>
        <Text style={s.searchHint}>
          ◉ 모든 정부 서비스, 이제 한 곳에서 찾아보세요
        </Text>
        <Text style={s.searchIcon}>⌕</Text>
      </View>
      <View style={s.frequent}>
        <Text style={s.sectionTitle}>자주 찾는 서비스</Text>
        <View style={s.serviceGrid}>
          {[
            "민원증명서",
            "토지(임야)대장",
            "주민등록등본(초본)",
            "자동차등록원부",
            "건축물대장",
            "가족관계증명서",
            "여권 재발급",
            "지방세 납세증명",
          ].map((x, i) => (
            <Pressable key={x} onPress={onWrong} style={s.service}>
              <Text style={s.serviceEmoji}>
                {["📄", "🏢", "🏠", "🎯", "🏬", "🔍", "✏️", "📚"][i]}
              </Text>
              <Text style={s.serviceText}>{x}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <Text style={s.hero}>
        회원가입하고 여러 서비스를{`\n`}편리하게 이용하세요.
      </Text>
      {["민원신청", "전자증명", "복합민원 혜택", "세무정보"].map((x) => (
        <Pressable key={x} onPress={onWrong} style={s.row}>
          <Text style={s.rowIcon}>●</Text>
          <Text style={s.rowText}>{x}</Text>
        </Pressable>
      ))}
      <Pressable style={s.primary} onPress={onLogin}>
        <Text style={s.primaryText}>로그인</Text>
      </Pressable>
    </ScrollView>
  );
}
function Header({ title }: { title: string }) {
  return (
    <View style={s.pageHeader}>
      <Text style={s.pageTitle}>{title}</Text>
    </View>
  );
}
function LoginMethods({
  onPrivate,
  onWrong,
}: {
  onPrivate: () => void;
  onWrong: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={s.content}>
      <Header title="로그인" />
      <Text style={s.bigTitle}>로그인 방식을{`\n`}선택해 주세요.</Text>
      <View style={s.tabs}>
        <Text style={s.tabOn}>개인</Text>
        <Text style={s.tabOff}>법인</Text>
      </View>
      <View style={s.methodGrid}>
        {[
          ["▣", "모바일 신분증"],
          ["▱", "간편인증"],
          ["✓", "공동인증서"],
          ["▧", "금융인증서"],
          ["〉", "민간ID"],
        ].map(([i, t]) => (
          <Pressable
            key={t}
            onPress={t === "간편인증" ? onPrivate : onWrong}
            style={s.method}
          >
            <Text style={s.methodIcon}>{i}</Text>
            <Text style={s.methodText}>{t}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
function Providers({
  onKakao,
  onWrong,
}: {
  onKakao: () => void;
  onWrong: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={s.content}>
      <Header title="간편인증" />
      <Text style={s.providerGuide}>사용할 민간 인증서를 선택해 주세요.</Text>
      <View style={s.providerGrid}>
        {GOV24_CERTIFICATES.map((item) => (
          <Pressable
            key={item.id}
            onPress={item.id === "kakaotalk" ? onKakao : onWrong}
            style={s.provider}
          >
            <View style={s.providerIcon}>
              <Image
                source={item.image}
                style={{ width: "100%", height: "100%", borderRadius: 14 }}
                resizeMode="contain"
              />
            </View>
            <Text style={s.providerText}>{item.name}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
function Form(p: {
  name: string;
  birth: string;
  phone: string;
  setName: (x: string) => void;
  setBirth: (x: string) => void;
  setPhone: (x: string) => void;
  onNext: () => void;
}) {
  return (
    <ScrollView
      contentContainerStyle={s.content}
      keyboardShouldPersistTaps="handled"
    >
      <Header title="간편인증 · 카카오톡" />
      <Label text="이름" />
      <TextInput
        style={s.input}
        value={p.name}
        onChangeText={p.setName}
        placeholder="이름을 입력하세요"
      />
      <Label text="생년월일" />
      <TextInput
        style={s.input}
        value={p.birth}
        onChangeText={p.setBirth}
        placeholder="YYMMDD"
        keyboardType="number-pad"
        maxLength={6}
      />
      <Label text="휴대폰번호" />
      <View style={s.phoneRow}>
        <View style={s.prefix}>
          <Text>010⌄</Text>
        </View>
        <TextInput
          style={[s.input, { flex: 1, marginTop: 0 }]}
          value={p.phone}
          onChangeText={p.setPhone}
          placeholder="나머지 번호 입력"
          keyboardType="phone-pad"
        />
      </View>
      <Pressable style={s.primary} onPress={p.onNext}>
        <Text style={s.primaryText}>다음</Text>
      </Pressable>
    </ScrollView>
  );
}
function Label({ text }: { text: string }) {
  return <Text style={s.label}>{text}</Text>;
}
function Terms({
  values,
  onToggle,
  onNext,
}: {
  values: boolean[];
  onToggle: (i: number) => void;
  onNext: () => void;
}) {
  let a = ["개인정보 이용 동의", "제3자정보제공동의", "공공실명정보처리동의"];
  return (
    <View style={s.content}>
      <Header title="이용약관 동의" />
      {a.map((x, i) => (
        <Pressable key={x} style={s.term} onPress={() => onToggle(i)}>
          <Text style={s.check}>{values[i] ? "☑" : "□"}</Text>
          <Text style={s.termText}>{x}</Text>
          <Text style={s.view}>보기</Text>
        </Pressable>
      ))}
      <Pressable
        style={[
          s.primary,
          { marginTop: "auto" },
          !values.every(Boolean) && s.disabled,
        ]}
        onPress={onNext}
      >
        <Text style={s.primaryText}>모두 동의하고 인증요청</Text>
      </Pressable>
    </View>
  );
}
function Consent({
  checked,
  onToggle,
  onNext,
}: {
  checked: boolean;
  onToggle: () => void;
  onNext: () => void;
}) {
  return (
    <View style={s.content}>
      <Text style={s.consentTitle}>카카오 인증서로 인증했습니다</Text>
      <View style={s.govCard}>
        <GovLogo />
        <Text style={s.govCardTitle}>정부24</Text>
      </View>
      <View style={s.info}>
        <Text>요청구분　 정부24 인증서비스</Text>
        <Text>받는이　　 연습 사용자</Text>
        <Text>유효일시　 오늘</Text>
      </View>
      <Pressable style={s.consentRow} onPress={onToggle}>
        <Text style={s.check}>{checked ? "☑" : "□"}</Text>
        <Text style={s.termText}>[확인] 개인정보 수집 및 이용 동의</Text>
      </Pressable>
      <Pressable style={[s.primary, !checked && s.disabled]} onPress={onNext}>
        <Text style={s.primaryText}>다음</Text>
      </Pressable>
    </View>
  );
}
function Waiting({ onComplete }: { onComplete: () => void }) {
  return (
    <View style={[s.content, { alignItems: "center" }]}>
      <Text style={s.waitTitle}>인증을 진행해 주세요.</Text>
      <Text style={s.waitText}>
        인증된 휴대폰으로 인증 요청 메시지를 보냈습니다.{`\n`}실제 문자는
        발송되지 않습니다.
      </Text>
      <View style={s.phonePic}>
        <Text style={{ fontSize: 44 }}>📱</Text>
        <Text style={{ fontWeight: "900" }}>TALK</Text>
      </View>
      <Text style={s.caution}>문의 받지 시 주의사항</Text>
      <Text style={s.waitText}>
        이 화면은 정부24 로그인 방법을 익히는 연습 화면입니다.
      </Text>
      <Pressable
        style={[s.primary, { marginTop: "auto" }]}
        onPress={onComplete}
      >
        <Text style={s.primaryText}>인증 완료</Text>
      </Pressable>
    </View>
  );
}
function Done({
  onAgain,
  onHome,
}: {
  onAgain: () => void;
  onHome: () => void;
}) {
  return (
    <View style={s.done}>
      <Text style={s.doneIcon}>✓</Text>
      <Text style={s.doneTitle}>정부24 로그인 연습 완료!</Text>
      <Text style={s.doneText}>
        민간 인증서로 로그인하는 전 과정을 완료했어요.
      </Text>
      <Pressable style={s.primary} onPress={onAgain}>
        <Text style={s.primaryText}>다시 연습하기</Text>
      </Pressable>
      <Pressable style={s.secondary} onPress={onHome}>
        <Text style={s.secondaryText}>처음으로</Text>
      </Pressable>
    </View>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  shell: {
    flex: 1,
    width: "100%",
    maxWidth: 1100,
    alignSelf: "center",
    backgroundColor: "#fff",
  },
  top: {
    height: 72,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e9ef",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
  },
  back: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: { fontSize: 42, color: "#203044" },
  voice: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#eaf2fc",
    alignItems: "center",
    justifyContent: "center",
  },
  govLogo: { width: 100, height: 58 },
  logo: { flexDirection: "row", alignItems: "center", gap: 8 },
  swirl: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 6,
    borderColor: "#116bb5",
    alignItems: "center",
    justifyContent: "center",
  },
  swirlText: { color: "#e72b3b", fontSize: 14 },
  logoText: { fontSize: 22, fontWeight: "900", color: "#182b44" },
  content: { flexGrow: 1, padding: 20, paddingBottom: 28 },
  search: {
    height: 68,
    borderWidth: 2,
    borderColor: "#2e6de9",
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
  },
  searchHint: { fontSize: 18, color: "#8993a1" },
  searchIcon: { fontSize: 34 },
  frequent: {
    backgroundColor: "#e9fbff",
    borderRadius: 30,
    padding: 24,
    marginTop: 24,
  },
  sectionTitle: { fontSize: 20, fontWeight: "900" },
  serviceGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 15 },
  service: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
  },
  serviceEmoji: { fontSize: 20, marginRight: 12 },
  serviceText: { fontSize: 15 },
  hero: { fontSize: 28, lineHeight: 38, fontWeight: "900", marginVertical: 26 },
  row: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#edf0f3",
  },
  rowIcon: { color: "#7358a7", marginRight: 15 },
  rowText: { fontSize: 20 },
  primary: {
    minHeight: 62,
    backgroundColor: "#347dec",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  primaryText: { fontSize: 19, color: "white", fontWeight: "900" },
  pageHeader: {
    alignItems: "center",
    paddingBottom: 22,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e8ec",
  },
  pageTitle: { fontSize: 22, fontWeight: "900" },
  bigTitle: {
    fontSize: 31,
    lineHeight: 40,
    fontWeight: "900",
    marginVertical: 28,
  },
  tabs: {
    flexDirection: "row",
    height: 60,
    borderWidth: 1,
    borderColor: "#d7dbe1",
    borderRadius: 8,
  },
  tabOn: {
    flex: 1,
    textAlign: "center",
    textAlignVertical: "center",
    backgroundColor: "#235697",
    color: "white",
    fontSize: 18,
    fontWeight: "900",
  },
  tabOff: {
    flex: 1,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 18,
  },
  methodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 30,
  },
  method: {
    width: "48%",
    minHeight: 128,
    borderWidth: 1,
    borderColor: "#d7dbe1",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  methodIcon: { fontSize: 27, color: "#617080" },
  methodText: { fontSize: 21, fontWeight: "800", marginTop: 15 },
  providerGuide: { fontSize: 18, color: "#667085", marginTop: 22 },
  providerGrid: { flexDirection: "row", flexWrap: "wrap", paddingTop: 28 },
  provider: { width: "25%", alignItems: "center", marginBottom: 30 },
  providerIcon: {
    width: 72,
    height: 72,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  providerIconText: { color: "white", fontWeight: "900", fontSize: 17 },
  providerText: { fontSize: 17, fontWeight: "700", marginTop: 10 },
  label: { fontSize: 18, fontWeight: "900", marginTop: 24 },
  input: {
    height: 62,
    borderWidth: 1,
    borderColor: "#cfd5dc",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 18,
    marginTop: 10,
  },
  phoneRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  prefix: {
    width: 86,
    height: 62,
    borderWidth: 1,
    borderColor: "#cfd5dc",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  term: {
    height: 84,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e8ec",
    flexDirection: "row",
    alignItems: "center",
  },
  check: { fontSize: 27, color: "#1677e8", marginRight: 12 },
  termText: { fontSize: 18, flex: 1 },
  view: { color: "#076cea", fontWeight: "800" },
  disabled: { backgroundColor: "#c8cbd0" },
  consentTitle: {
    textAlign: "center",
    fontSize: 30,
    fontWeight: "900",
    marginTop: 14,
  },
  govCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    marginTop: 28,
  },
  govCardTitle: { fontSize: 27, fontWeight: "900" },
  info: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#bcc3ca",
    paddingVertical: 20,
    gap: 13,
    marginVertical: 25,
  },
  consentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
  },
  waitTitle: { fontSize: 30, fontWeight: "900", marginTop: 18 },
  waitText: {
    fontSize: 17,
    lineHeight: 27,
    textAlign: "center",
    color: "#667085",
    marginTop: 16,
  },
  phonePic: {
    width: 120,
    height: 165,
    borderWidth: 2,
    borderColor: "#333",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 35,
  },
  caution: {
    alignSelf: "flex-start",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 35,
  },
  done: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  doneIcon: {
    fontSize: 52,
    color: "white",
    backgroundColor: "#1677e8",
    width: 90,
    height: 90,
    borderRadius: 45,
    textAlign: "center",
    textAlignVertical: "center",
  },
  doneTitle: { fontSize: 31, fontWeight: "900", marginTop: 28 },
  doneText: {
    fontSize: 18,
    color: "#667085",
    marginVertical: 18,
    textAlign: "center",
  },
  secondary: {
    minHeight: 60,
    width: "100%",
    maxWidth: 560,
    borderWidth: 2,
    borderColor: "#347dec",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  secondaryText: { fontSize: 19, color: "#347dec", fontWeight: "900" },
});

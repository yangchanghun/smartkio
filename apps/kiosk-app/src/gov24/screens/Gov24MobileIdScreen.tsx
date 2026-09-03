import { useState } from "react";
import {
  Alert,
  Image,
  ImageSourcePropType,
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
import { mobileIdAssets } from "../data/mobileIdAssets";
import { Gov24MissionModal } from "../components/Gov24MissionModal";
import { usePracticeSession } from "../../practice/hooks/usePracticeSession";

type Page =
  | "home"
  | "terms"
  | "carrier"
  | "info"
  | "password"
  | "card"
  | "done";
type Carrier = "skt" | "kt" | "lgu" | "mvno";
const carrierNames: Record<Carrier, string> = {
  skt: "SKT",
  kt: "KT",
  lgu: "LG U+",
  mvno: "알뜰폰",
};
const missionGuides: Record<Exclude<Page, "done">, string> = {
  home: "화면 아래 주민등록증 모바일 확인 서비스를 눌러 주세요.",
  terms: "필수 약관에 모두 동의한 뒤 확인 버튼을 눌러 주세요.",
  carrier:
    "이용 중인 통신사를 선택하고 필수 약관에 동의한 뒤 PASS로 인증하기를 눌러 주세요.",
  info: "이름과 주민등록번호를 입력하고 발급일자를 확인해 주세요.",
  password:
    "사용할 6자리 비밀번호를 입력하고 같은 번호를 한 번 더 입력해 주세요.",
  card: "모바일 주민등록증의 사람 정보와 QR 코드를 확인한 뒤 확인 버튼을 눌러 주세요.",
};
const missionPages: Exclude<Page, "done">[] = [
  "home",
  "terms",
  "carrier",
  "info",
  "password",
  "card",
];

export function Gov24MobileIdScreen({
  token,
  onBack,
}: {
  token: string;
  onBack: () => void;
}) {
  const [page, setPage] = useState<Page>("home");
  const [notice, setNotice] = useState(false);
  const [agreements, setAgreements] = useState([false, false, false]);
  const [carrier, setCarrier] = useState<Carrier | null>(null);
  const [carrierTerms, setCarrierTerms] = useState(false);
  const [name, setName] = useState("");
  const [rrn, setRrn] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mission, setMission] = useState(true);
  const { completePractice, restartPracticeSession } = usePracticeSession(
    token,
    "GOV24_MOBILE_ID",
  );

  const speak = (text: string) =>
    Speech.speak(text, { language: "ko-KR", rate: 0.88 });
  const go = (next: Page, message: string) => {
    setPage(next);
    if (next === "done") speak(message);
    else setMission(true);
  };
  const reset = () => {
    setPage("home");
    setNotice(false);
    setAgreements([false, false, false]);
    setCarrier(null);
    setCarrierTerms(false);
    setName("");
    setRrn("");
    setPassword("");
    setConfirmPassword("");
    setMission(true);
    void restartPracticeSession().catch(() => undefined);
  };
  const finish = () => {
    go("done", "주민등록증 모바일 확인서비스 연습을 완료했습니다.");
    void completePractice().catch(() => undefined);
  };
  const allAgreed = agreements.every(Boolean);

  if (page === "done")
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.done}>
          <Text style={s.doneCheck}>✓</Text>
          <Text style={s.doneTitle}>모바일 확인서비스 등록 완료!</Text>
          <Text style={s.doneText}>
            주민등록증 확인 화면과 QR 사용 방법까지 연습했어요.
          </Text>
          <Pressable style={s.primaryWide} onPress={reset}>
            <Text style={s.primaryText}>다시 연습하기</Text>
          </Pressable>
          <Pressable style={s.secondary} onPress={onBack}>
            <Text style={s.secondaryText}>정부24 연습 선택으로</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.shell}>
        <Header
          onBack={
            page === "home"
              ? onBack
              : () => {
                  setPage("home");
                  setMission(true);
                }
          }
        />
        {page === "home" ? <Home onStart={() => setNotice(true)} /> : null}
        {page === "terms" ? (
          <Terms
            values={agreements}
            onChange={setAgreements}
            onCancel={() => {
              setPage("home");
              setMission(true);
            }}
            onNext={() =>
              allAgreed
                ? go(
                    "carrier",
                    "이용 중인 통신사를 선택하고 필수 약관에 동의해 주세요.",
                  )
                : Alert.alert("필수 약관을 확인해 주세요")
            }
          />
        ) : null}
        {page === "carrier" ? (
          <CarrierPage
            carrier={carrier}
            setCarrier={setCarrier}
            agreed={carrierTerms}
            setAgreed={setCarrierTerms}
            onNext={() =>
              carrier && carrierTerms
                ? go("info", "이름과 주민등록번호, 발급일자를 입력해 주세요.")
                : Alert.alert("통신사와 필수 약관을 선택해 주세요")
            }
          />
        ) : null}
        {page === "info" ? (
          <InfoPage
            name={name}
            setName={setName}
            rrn={rrn}
            setRrn={setRrn}
            onNext={() =>
              name.trim() && rrn.length >= 6
                ? go(
                    "password",
                    "사용할 여섯 자리 비밀번호를 두 번 입력해 주세요.",
                  )
                : Alert.alert("기본 정보를 입력해 주세요")
            }
          />
        ) : null}
        {page === "password" ? (
          <PasswordPage
            password={password}
            setPassword={setPassword}
            confirm={confirmPassword}
            setConfirm={setConfirmPassword}
            onNext={() =>
              password.length === 6 && password === confirmPassword
                ? go("card", "모바일 주민등록증과 큐알 코드를 확인해 주세요.")
                : Alert.alert("같은 6자리 숫자를 입력해 주세요")
            }
          />
        ) : null}
        {page === "card" ? (
          <MobileCard name={name || "연습 사용자"} onDone={finish} />
        ) : null}
        <StartNotice
          visible={notice}
          onLater={onBack}
          onConfirm={() => {
            setNotice(false);
            go("terms", "약관에 모두 동의한 뒤 확인 버튼을 눌러 주세요.");
          }}
        />
        <Gov24MissionModal
          title="모바일 주민등록증 확인 미션"
          visible={!notice && mission}
          step={missionPages.indexOf(page as Exclude<Page, "done">) + 1}
          text={missionGuides[page as Exclude<Page, "done">]}
          onClose={() => setMission(false)}
        />
      </View>
    </SafeAreaView>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View style={s.header}>
      <Pressable onPress={onBack} style={s.headerBtn}>
        <Text style={s.back}>‹</Text>
      </Pressable>
      <View style={s.brand}>
        <Image
          source={require("../../../assets/goverment/goverment.png")}
          style={s.logo}
        />
        {/* <Text style={s.brandText}>주민등록증 모바일 확인서비스</Text> */}
      </View>
      <View style={s.headerBtn} />
    </View>
  );
}
function Home({ onStart }: { onStart: () => void }) {
  return (
    <ScrollView contentContainerStyle={s.home}>
      <View style={s.search}>
        <Text style={s.searchText}>
          ◉ 모든 정부 서비스, 이제 한 곳에서 찾아보세요
        </Text>
      </View>
      <View style={s.frequent}>
        <Text style={s.sectionTitle}>자주 찾는 서비스</Text>
        <Text style={s.services}>
          📄 민원증명서　　　　　　　🏢 토지(임야)대장{`\n\n`}🏠
          주민등록등본(초본)　　　　🎯 자동차등록원부{`\n\n`}🏬
          건축물대장　　　　　　　　🔍 가족관계증명서
        </Text>
      </View>
      <Text style={s.homeTitle}>
        회원가입하고 여러 서비스를{`\n`}편리하게 이용하세요.
      </Text>
      <Pressable style={s.shortcut} onPress={onStart}>
        <Text style={s.shortcutText}>주민등록증 모바일 확인 서비스</Text>
        <Text style={s.phone}>▯</Text>
      </Pressable>
    </ScrollView>
  );
}
function StartNotice({
  visible,
  onLater,
  onConfirm,
}: {
  visible: boolean;
  onLater: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={s.dim}>
        <View style={s.noticeCard}>
          <View style={s.noticeTitleRow}>
            <Image
              source={require("../../../assets/goverment/goverment.png")}
              style={s.noticeLogo}
            />
            <Text style={s.noticeTitle}>주민등록증 확인서비스</Text>
          </View>
          <Text style={s.noticeCopy}>
            주민등록증 모바일 확인서비스를{`\n`}등록하시겠습니까?{`\n\n`}*
            주민등록증을 준비해 주세요{`\n`}* 본인명의 개인 휴대폰만 등록
            가능합니다
          </Text>
          <View style={s.noticeActions}>
            <Pressable onPress={onLater}>
              <Text style={s.later}>나중에</Text>
            </Pressable>
            <Pressable onPress={onConfirm}>
              <Text style={s.confirm}>확인</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
function Terms({
  values,
  onChange,
  onCancel,
  onNext,
}: {
  values: boolean[];
  onChange: (v: boolean[]) => void;
  onCancel: () => void;
  onNext: () => void;
}) {
  const all = values.every(Boolean);
  return (
    <View style={s.page}>
      <Text style={s.bigTitle}>
        주민등록증{`\n`}모바일 확인서비스 약관에{`\n`}동의해 주세요.
      </Text>
      <Pressable
        style={s.checkRow}
        onPress={() => onChange([!all, !all, !all])}
      >
        <Text style={s.check}>{all ? "◉" : "○"}</Text>
        <Text style={s.checkLabel}>전체약관동의</Text>
      </Pressable>
      {[
        "이용약관(필수)",
        "개인정보 수집 및 이용 동의(필수)",
        "전자약관동의",
      ].map((x, i) => (
        <Pressable
          key={x}
          style={s.checkRow}
          onPress={() => onChange(values.map((v, n) => (n === i ? !v : v)))}
        >
          <Text style={s.check}>{values[i] ? "◉" : "○"}</Text>
          <Text style={s.checkLabel}>{x}</Text>
        </Pressable>
      ))}
      <BottomButtons onCancel={onCancel} onNext={onNext} enabled={all} />
    </View>
  );
}
function CarrierPage({
  carrier,
  setCarrier,
  agreed,
  setAgreed,
  onNext,
}: {
  carrier: Carrier | null;
  setCarrier: (v: Carrier) => void;
  agreed: boolean;
  setAgreed: (v: boolean) => void;
  onNext: () => void;
}) {
  return (
    <View style={s.page}>
      <Text style={s.pass}>PASS</Text>
      <Text style={s.bigTitle}>이용중이신 통신사를 선택해 주세요.</Text>
      <View style={s.carrierGrid}>
        {(Object.keys(carrierNames) as Carrier[]).map((k) => (
          <Pressable
            key={k}
            style={[s.carrier, carrier === k && s.carrierOn]}
            onPress={() => setCarrier(k)}
          >
            <Asset
              source={mobileIdAssets.carriers[k]}
              fallback={carrierNames[k]}
            />
          </Pressable>
        ))}
      </View>
      <Pressable style={s.checkRow} onPress={() => setAgreed(!agreed)}>
        <Text style={s.check}>{agreed ? "◉" : "○"}</Text>
        <Text style={s.checkLabel}>전체 동의하기 (필수)</Text>
      </Pressable>
      <Pressable
        style={[s.passBtn, !(carrier && agreed) && s.disabled]}
        onPress={onNext}
      >
        <Text style={s.primaryText}>PASS로 인증하기</Text>
      </Pressable>
    </View>
  );
}
function InfoPage({
  name,
  setName,
  rrn,
  setRrn,
  onNext,
}: {
  name: string;
  setName: (v: string) => void;
  rrn: string;
  setRrn: (v: string) => void;
  onNext: () => void;
}) {
  return (
    <View style={s.page}>
      <Text style={s.formHeading}>기본정보입력</Text>
      <Text style={s.help}>등록을 위해 주민등록증 정보를 입력해 주세요.</Text>
      <Field
        label="이름"
        value={name}
        onChange={setName}
        placeholder="이름을 입력해 주세요"
      />
      <Field
        label="주민등록번호"
        value={rrn}
        onChange={(v) => setRrn(v.replace(/\D/g, "").slice(0, 13))}
        placeholder="숫자만 입력"
        keyboardType="number-pad"
      />
      <Text style={s.fieldLabel}>발급일자</Text>
      <View style={s.dateRow}>
        <Text style={s.date}>2025⌄</Text>
        <Text style={s.date}>01⌄</Text>
        <Text style={s.date}>01⌄</Text>
      </View>
      <View style={s.idPreview}>
        <Text style={s.idTitle}>주민등록증</Text>
        <Text style={s.idText}>
          {name || "이름"}
          {`\n`}
          {rrn ? `${rrn.slice(0, 6)}-*******` : "주민등록번호"}
          {`\n`}2025.01.01
        </Text>
        <Asset source={mobileIdAssets.portrait} fallback="사람 이미지" small />
      </View>
      <BottomButtons
        onCancel={() => {}}
        onNext={onNext}
        enabled={Boolean(name.trim() && rrn.length >= 6)}
      />
    </View>
  );
}
function PasswordPage({
  password,
  setPassword,
  confirm,
  setConfirm,
  onNext,
}: {
  password: string;
  setPassword: (v: string) => void;
  confirm: string;
  setConfirm: (v: string) => void;
  onNext: () => void;
}) {
  const pin = (v: string) => v.replace(/\D/g, "").slice(0, 6);
  return (
    <View style={s.page}>
      <Text style={s.formHeading}>비밀번호 등록</Text>
      <Text style={s.help}>
        주민등록증 모바일 확인서비스에서 사용할{`\n`}6자리 비밀번호를 설정해
        주세요.
      </Text>
      <Field
        label="비밀번호 입력"
        value={password}
        onChange={(v) => setPassword(pin(v))}
        placeholder="6자리 숫자"
        keyboardType="number-pad"
        secure
      />
      <Field
        label="비밀번호 확인"
        value={confirm}
        onChange={(v) => setConfirm(pin(v))}
        placeholder="6자리 숫자"
        keyboardType="number-pad"
        secure
      />
      <BottomButtons
        onCancel={() => {}}
        onNext={onNext}
        enabled={password.length === 6 && password === confirm}
      />
    </View>
  );
}
function MobileCard({ name, onDone }: { name: string; onDone: () => void }) {
  return (
    <View style={[s.page, s.cardPage]}>
      <View style={s.mobileCard}>
        <Asset
          source={mobileIdAssets.portrait}
          fallback="사람 이미지"
          portrait
        />
        <View style={s.cardBottom}>
          <View>
            <Text style={s.person}>{name}</Text>
            <Text style={s.personInfo}>99.05.11{`\n`}서울시 중구</Text>
          </View>
          <Asset source={mobileIdAssets.qr} fallback="QR 이미지" qr />
        </View>
      </View>
      <Pressable style={s.primaryWide} onPress={onDone}>
        <Text style={s.primaryText}>확인</Text>
      </Pressable>
    </View>
  );
}
function Asset({
  source,
  fallback,
  small,
  portrait,
  qr,
}: {
  source: ImageSourcePropType | null;
  fallback: string;
  small?: boolean;
  portrait?: boolean;
  qr?: boolean;
}) {
  const style = portrait
    ? s.portrait
    : qr
      ? s.qr
      : small
        ? s.smallAsset
        : s.asset;
  return source ? (
    <Image source={source} style={style} resizeMode="contain" />
  ) : (
    <View style={[style, s.assetFallback]}>
      <Text style={s.assetText}>{fallback}</Text>
    </View>
  );
}
function Field({
  label,
  value,
  onChange,
  placeholder,
  keyboardType,
  secure,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  keyboardType?: "number-pad";
  secure?: boolean;
}) {
  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TextInput
        style={s.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        keyboardType={keyboardType}
        secureTextEntry={secure}
      />
    </View>
  );
}
function BottomButtons({
  onCancel,
  onNext,
  enabled,
}: {
  onCancel: () => void;
  onNext: () => void;
  enabled: boolean;
}) {
  return (
    <View style={s.bottom}>
      <Pressable style={s.cancel} onPress={onCancel}>
        <Text style={s.cancelText}>취소</Text>
      </Pressable>
      <Pressable style={[s.next, !enabled && s.disabled]} onPress={onNext}>
        <Text style={s.primaryText}>확인</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "white" },
  shell: { flex: 1, width: "100%", maxWidth: 980, alignSelf: "center" },
  header: {
    height: 74,
    borderBottomWidth: 1,
    borderBottomColor: "#e4e8ed",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerBtn: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  back: { fontSize: 44, color: "#1d3047" },
  brand: { flexDirection: "row", alignItems: "center" },
  logo: { width: 50, height: 48, resizeMode: "contain" },
  brandText: {
    fontSize: 21,
    fontWeight: "900",
    color: "#172b45",
    marginLeft: 8,
  },
  home: { padding: 22, paddingBottom: 40 },
  search: {
    height: 65,
    borderWidth: 2,
    borderColor: "#296cf0",
    borderRadius: 22,
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  searchText: { fontSize: 18, color: "#8a94a3" },
  frequent: {
    backgroundColor: "#e8fbff",
    padding: 24,
    borderRadius: 28,
    marginTop: 22,
  },
  sectionTitle: { fontSize: 20, fontWeight: "900" },
  services: { fontSize: 15, lineHeight: 24, marginTop: 22 },
  homeTitle: {
    fontSize: 27,
    lineHeight: 38,
    fontWeight: "900",
    marginVertical: 28,
  },
  shortcut: {
    height: 78,
    borderWidth: 1,
    borderColor: "#d9dee5",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  shortcutText: { fontSize: 18, fontWeight: "800" },
  phone: { fontSize: 28 },
  dim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,.52)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  noticeCard: {
    width: "100%",
    maxWidth: 500,
    backgroundColor: "white",
    borderRadius: 28,
    padding: 30,
  },
  noticeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  noticeLogo: { width: 42, height: 42, resizeMode: "contain" },
  noticeTitle: { fontSize: 23, fontWeight: "900", marginLeft: 8 },
  noticeCopy: {
    fontSize: 17,
    lineHeight: 27,
    textAlign: "center",
    marginVertical: 36,
  },
  noticeActions: { flexDirection: "row", justifyContent: "space-around" },
  later: { fontSize: 18, fontWeight: "800" },
  confirm: { fontSize: 18, fontWeight: "900", color: "#147ef5" },
  page: { flex: 1, padding: 26 },
  bigTitle: {
    fontSize: 29,
    lineHeight: 39,
    fontWeight: "900",
    color: "#172b45",
    marginVertical: 25,
  },
  checkRow: { minHeight: 52, flexDirection: "row", alignItems: "center" },
  check: { fontSize: 24, color: "#147ef5", marginRight: 12 },
  checkLabel: { fontSize: 17, fontWeight: "700" },
  bottom: {
    marginTop: "auto",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e9ee",
    flexDirection: "row",
    gap: 12,
  },
  cancel: {
    flex: 1,
    minHeight: 60,
    borderWidth: 1,
    borderColor: "#d8dde5",
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: { fontSize: 17, fontWeight: "800", color: "#667085" },
  next: {
    flex: 1,
    minHeight: 60,
    backgroundColor: "#147ef5",
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: { opacity: 0.35 },
  primaryText: { fontSize: 18, fontWeight: "900", color: "white" },
  pass: {
    alignSelf: "flex-start",
    backgroundColor: "#ff4650",
    color: "white",
    fontSize: 18,
    fontWeight: "900",
    paddingHorizontal: 17,
    paddingVertical: 8,
    borderRadius: 4,
  },
  carrierGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    gap: 16,
  },
  carrier: {
    width: "42%",
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: "#d9dee5",
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  carrierOn: {
    borderWidth: 4,
    borderColor: "#147ef5",
    backgroundColor: "#f0f7ff",
  },
  asset: { width: "75%", height: "75%" },
  assetFallback: {
    backgroundColor: "#f4f6f8",
    alignItems: "center",
    justifyContent: "center",
  },
  assetText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#667085",
    textAlign: "center",
  },
  passBtn: {
    minHeight: 58,
    backgroundColor: "#ff4650",
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    marginTop: "auto",
  },
  formHeading: {
    fontSize: 27,
    fontWeight: "900",
    color: "#172b45",
    marginTop: 10,
  },
  help: {
    fontSize: 17,
    lineHeight: 27,
    color: "#667085",
    marginTop: 12,
    marginBottom: 20,
  },
  field: { marginTop: 16 },
  fieldLabel: { fontSize: 17, fontWeight: "900", color: "#172b45" },
  input: {
    height: 58,
    borderBottomWidth: 2,
    borderBottomColor: "#147ef5",
    fontSize: 18,
    paddingHorizontal: 8,
  },
  dateRow: { flexDirection: "row", gap: 12, marginTop: 10 },
  date: {
    flex: 1,
    borderBottomWidth: 2,
    borderBottomColor: "#147ef5",
    padding: 15,
    fontSize: 17,
  },
  idPreview: {
    width: 330,
    maxWidth: "90%",
    alignSelf: "center",
    backgroundColor: "#eaf7ff",
    borderRadius: 10,
    elevation: 3,
    padding: 18,
    marginTop: 32,
  },
  idTitle: { fontSize: 21, fontWeight: "900" },
  idText: { fontSize: 16, lineHeight: 30, marginTop: 12 },
  smallAsset: {
    position: "absolute",
    right: 18,
    top: 52,
    width: 90,
    height: 90,
  },
  cardPage: { backgroundColor: "#e8f6ff" },
  mobileCard: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 24,
    elevation: 4,
    width: "100%",
    maxWidth: 640,
    alignSelf: "center",
    marginTop: 10,
  },
  portrait: {
    width: "75%",
    maxWidth: 380,
    aspectRatio: 1,
    alignSelf: "center",
    borderRadius: 14,
  },
  cardBottom: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 24,
  },
  person: { fontSize: 27, fontWeight: "900" },
  personInfo: { fontSize: 20, lineHeight: 31, marginTop: 8, color: "#43546a" },
  qr: { width: 145, height: 145 },
  primaryWide: {
    minHeight: 60,
    backgroundColor: "#147ef5",
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    marginTop: "auto",
  },
  done: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  doneCheck: {
    fontSize: 54,
    color: "white",
    backgroundColor: "#147ef5",
    width: 92,
    height: 92,
    borderRadius: 46,
    textAlign: "center",
    textAlignVertical: "center",
  },
  doneTitle: {
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 28,
  },
  doneText: {
    fontSize: 18,
    color: "#667085",
    textAlign: "center",
    marginTop: 12,
  },
  secondary: {
    width: "100%",
    maxWidth: 560,
    minHeight: 60,
    borderWidth: 2,
    borderColor: "#147ef5",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  secondaryText: { color: "#147ef5", fontSize: 18, fontWeight: "900" },
});

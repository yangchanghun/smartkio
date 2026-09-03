import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import * as Speech from "expo-speech";
import { CoupangMissionModal } from "../components/CoupangMissionModal";
import { CoupangLogo, FormSection, PrimaryButton, SignupProgress, SummaryRow } from "../components/CoupangUi";
import { usePracticeSession } from "../../practice/hooks/usePracticeSession";

type Stage = "login" | "agreements" | "name" | "email" | "phone" | "complete" | "phoneLogin" | "finished";
type SignupData = { name: string; email: string; phone: string };

const MISSION: Record<Stage, { step: number; text: string }> = {
  login: { step: 1, text: "회원가입 버튼을 눌러 쿠팡 가입 연습을 시작해보세요." },
  agreements: { step: 2, text: "필수 약관을 모두 확인하고 동의한 뒤 다음을 눌러보세요." },
  name: { step: 3, text: "가입할 사람의 이름을 입력하고 다음을 눌러보세요." },
  email: { step: 4, text: "이메일 주소를 입력하고 다음을 눌러보세요." },
  phone: { step: 5, text: "휴대폰 번호를 입력하고 인증을 완료한 뒤 가입완료를 눌러보세요." },
  complete: { step: 6, text: "회원가입이 끝났어요. 휴대폰번호로 로그인하기를 눌러보세요." },
  phoneLogin: { step: 7, text: "방금 가입한 휴대폰 번호를 입력하고 로그인해보세요." },
  finished: { step: 8, text: "쿠팡 회원가입과 휴대폰번호 로그인 연습을 모두 완료했어요." },
};

const REQUIRED = ["만 14세 이상입니다", "쿠팡 이용약관 동의", "전자금융거래 이용약관 동의", "개인정보 수집 및 이용 동의", "개인정보 제3자 제공 동의"];
const OPTIONAL = ["마케팅 목적의 개인정보 수집 및 이용 동의", "광고성 정보 수신 동의"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizePhone(value: string) {
  return value.replace(/\D/g, "").slice(0, 11);
}

function formatPhone(value: string) {
  if (value.length <= 3) return value;
  if (value.length <= 7) return `${value.slice(0, 3)}-${value.slice(3)}`;
  return `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7)}`;
}

export function CoupangPracticeScreen({ onBack, token }: { onBack: () => void; token: string }) {
  const { completePractice, restartPracticeSession } = usePracticeSession(token, "COUPANG_SIGNUP");
  const { width } = useWindowDimensions();
  const compact = width < 650;
  const [stage, setStage] = useState<Stage>("login");
  const [missionVisible, setMissionVisible] = useState(true);
  const [data, setData] = useState<SignupData>({ name: "", email: "", phone: "" });
  const [checked, setChecked] = useState<Set<string>>(() => new Set());
  const [verificationRequested, setVerificationRequested] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verified, setVerified] = useState(false);
  const [loginPhone, setLoginPhone] = useState("");
  const scrollRef = useRef<ScrollView>(null);

  const mission = MISSION[stage];
  const requiredComplete = REQUIRED.every((item) => checked.has(item));
  const allComplete = [...REQUIRED, ...OPTIONAL].every((item) => checked.has(item));

  const go = useCallback((next: Stage) => {
    setStage(next);
    setMissionVisible(true);
  }, []);

  useEffect(() => () => { Speech.stop(); }, []);
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [stage]);

  const reset = useCallback(() => {
    void restartPracticeSession().catch(() => undefined);
    setData({ name: "", email: "", phone: "" });
    setChecked(new Set());
    setVerificationRequested(false);
    setVerificationCode("");
    setVerified(false);
    setLoginPhone("");
    go("login");
  }, [go, restartPracticeSession]);

  const finishPractice = useCallback(async () => {
    try {
      await completePractice();
    } finally {
      go("finished");
    }
  }, [completePractice, go]);

  const handleContinue = useCallback(() => {
    if (stage === "agreements") {
      if (!requiredComplete) {
        Alert.alert("필수 동의가 필요해요", "[필수] 항목을 모두 선택해주세요.");
        return;
      }
      go("name");
      return;
    }
    if (stage === "name") {
      if (data.name.trim().length < 2) {
        Alert.alert("이름을 확인해주세요", "이름을 두 글자 이상 입력해주세요.");
        return;
      }
      go("email");
      return;
    }
    if (stage === "email") {
      if (!EMAIL_PATTERN.test(data.email.trim())) {
        Alert.alert("이메일을 확인해주세요", "예: smart@naver.com 형식으로 입력해주세요.");
        return;
      }
      go("phone");
      return;
    }
    if (stage === "phone") {
      if (!verified) {
        Alert.alert("휴대폰 인증이 필요해요", "인증 요청 후 연습용 인증번호를 확인해주세요.");
        return;
      }
      go("complete");
    }
  }, [data.email, data.name, go, requiredComplete, stage, verified]);

  const content = useMemo(() => {
    if (stage === "login" || stage === "phoneLogin") {
      const isPhoneLogin = stage === "phoneLogin";
      return (
        <View style={[styles.loginCard, compact && styles.loginCardCompact]}>
          <CoupangLogo />
          <View style={styles.tabs}>
            <Text style={styles.tabMuted}>이메일 로그인</Text>
            <Text style={styles.tabActive}>휴대폰번호 로그인 <Text style={styles.newBadge}>N</Text></Text>
          </View>
          <TextInput
            accessibilityLabel="휴대폰번호"
            value={isPhoneLogin ? formatPhone(loginPhone) : ""}
            onChangeText={(value) => isPhoneLogin && setLoginPhone(normalizePhone(value))}
            editable={isPhoneLogin}
            keyboardType="phone-pad"
            placeholder="휴대폰번호"
            placeholderTextColor="#979da6"
            style={styles.input}
            maxLength={13}
          />
          <View style={styles.quickRow}><View style={styles.checkSmall}><Text style={styles.checkMark}>✓</Text></View><Text style={styles.quickText}>간편 로그인 등록</Text><Text style={styles.linkText}>아이디 찾기  |  비밀번호 찾기</Text></View>
          <PrimaryButton
            label="로그인"
            onPress={() => {
              if (!isPhoneLogin) {
                Alert.alert("연습 안내", "먼저 회원가입 버튼을 눌러주세요.");
                return;
              }
              if (loginPhone !== data.phone) {
                Alert.alert("번호를 확인해주세요", "회원가입할 때 입력한 휴대폰 번호와 같아야 해요.");
                return;
              }
              void finishPractice();
            }}
          />
          {!isPhoneLogin ? (
            <Pressable accessibilityRole="button" style={styles.secondaryButton} onPress={() => go("agreements")}><Text style={styles.secondaryText}>회원가입</Text></Pressable>
          ) : null}
          <View style={styles.coupon}><View><Text style={styles.couponSmall}>신규 고객님께</Text><Text style={styles.couponTitle}>최대 2만 5천원 쿠폰을 드려요!</Text></View><View style={styles.couponTicket}><Text style={styles.couponTicketText}>COUPON</Text><Text style={styles.couponTicketSub}>LOGIN</Text></View></View>
          <Text style={styles.business}>법인 고객이신가요?{`\n`}사업자 회원으로 전용 특가 혜택을 누려보세요.</Text>
        </View>
      );
    }

    if (stage === "agreements") {
      const toggle = (item: string) => setChecked((current) => {
        const next = new Set(current);
        if (next.has(item)) next.delete(item); else next.add(item);
        return next;
      });
      const toggleAll = () => setChecked(allComplete ? new Set() : new Set([...REQUIRED, ...OPTIONAL]));
      return (
        <FormSection>
          <SignupProgress step={1} />
          <Text style={styles.heading}>확인 후 동의해주세요</Text>
          <AgreementRow label="모두 동의" checked={allComplete} strong onPress={toggleAll} />
          {REQUIRED.map((item) => <AgreementRow key={item} label={`[필수] ${item}`} checked={checked.has(item)} onPress={() => toggle(item)} />)}
          {OPTIONAL.map((item) => <AgreementRow key={item} label={`[선택] ${item}`} checked={checked.has(item)} onPress={() => toggle(item)} />)}
        </FormSection>
      );
    }

    if (stage === "name" || stage === "email" || stage === "phone") {
      const isName = stage === "name";
      const isEmail = stage === "email";
      return (
        <FormSection>
          <SignupProgress step={2} />
          <Text style={styles.heading}>{isName ? "이름을 입력해주세요" : isEmail ? "이메일을 입력해주세요" : "휴대폰번호를 입력 후 인증해주세요"}</Text>
          {stage === "phone" ? (
            <View style={styles.inlineInput}>
              <TextInput accessibilityLabel="가입 휴대폰번호" value={formatPhone(data.phone)} onChangeText={(value) => { setData((current) => ({ ...current, phone: normalizePhone(value) })); setVerified(false); setVerificationRequested(false); }} keyboardType="phone-pad" placeholder="휴대폰 번호" placeholderTextColor="#979da6" style={styles.flexInput} maxLength={13} />
              <Pressable accessibilityRole="button" style={[styles.verifyButton, data.phone.length !== 11 && styles.verifyDisabled]} disabled={data.phone.length !== 11} onPress={() => { setVerificationRequested(true); Speech.speak("연습용 인증번호는 일 이 삼 사 오 육 입니다.", { language: "ko-KR", rate: 0.85 }); }}><Text style={styles.verifyText}>인증 요청</Text></Pressable>
            </View>
          ) : (
            <TextInput
              autoFocus
              accessibilityLabel={isName ? "이름" : "이메일"}
              value={isName ? data.name : data.email}
              onChangeText={(value) => setData((current) => ({ ...current, [isName ? "name" : "email"]: value }))}
              keyboardType={isEmail ? "email-address" : "default"}
              autoCapitalize="none"
              placeholder={isName ? "이름" : "이메일"}
              placeholderTextColor="#979da6"
              style={styles.input}
            />
          )}
          {verificationRequested ? <View style={styles.inlineInput}><TextInput accessibilityLabel="인증번호" value={verificationCode} onChangeText={(value) => setVerificationCode(value.replace(/\D/g, "").slice(0, 6))} keyboardType="number-pad" placeholder="인증번호 6자리" placeholderTextColor="#979da6" style={styles.flexInput} maxLength={6} /><Pressable style={styles.verifyButton} onPress={() => verificationCode === "123456" ? setVerified(true) : Alert.alert("인증번호가 달라요", "연습용 인증번호 123456을 입력해주세요.")}><Text style={styles.verifyText}>{verified ? "인증 완료" : "확인"}</Text></Pressable></View> : null}
          {stage !== "name" ? <SummaryRow icon="👤" value={data.name} /> : null}
          {stage === "phone" ? <SummaryRow icon="✉️" value={data.email} /> : null}
          {verificationRequested ? <Text style={styles.practiceCode}>연습용 인증번호: 123456</Text> : null}
        </FormSection>
      );
    }

    if (stage === "complete") {
      return <View style={styles.complete}><View style={styles.avatar}><Text style={styles.avatarText}>●</Text></View><Text style={styles.completeTitle}>쿠팡 회원이 되신 것을 환영합니다!</Text><Text style={styles.completeSub}>이제 방금 가입한 번호로 로그인하는 방법을 연습해볼게요.</Text><View style={styles.completeButton}><PrimaryButton label="휴대폰번호로 로그인하기" onPress={() => { setLoginPhone(""); go("phoneLogin"); }} /></View></View>;
    }

    return <View style={styles.complete}><Text style={styles.party}>🎉</Text><Text style={styles.completeTitle}>쿠팡 연습을 완료했어요!</Text><Text style={styles.completeSub}>회원가입부터 휴대폰번호 로그인까지 정말 잘하셨어요.</Text><View style={styles.resultButtons}><PrimaryButton label="다시 연습하기" onPress={reset} /><Pressable style={styles.homeButton} onPress={onBack}><Text style={styles.homeText}>처음으로</Text></Pressable></View></View>;
  }, [allComplete, checked, compact, data, finishPractice, go, loginPhone, onBack, reset, stage, verificationCode, verificationRequested, verified]);

  const canGoBack = stage !== "finished";
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="뒤로 가기" style={styles.back} onPress={() => {
            if (stage === "login") onBack(); else if (stage === "agreements") go("login"); else if (stage === "name") go("agreements"); else if (stage === "email") go("name"); else if (stage === "phone") go("email"); else if (stage === "phoneLogin" || stage === "complete") go("login"); else onBack();
          }}><Text style={styles.backText}>{canGoBack ? "‹" : "×"}</Text></Pressable>
          <Text style={styles.headerTitle}>{stage === "complete" || stage === "finished" ? "회원가입 연습" : "쿠팡 연습하기"}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="미션 다시 듣기" style={styles.sound} onPress={() => setMissionVisible(true)}><Text style={styles.soundText}>🔊</Text></Pressable>
        </View>
        <ScrollView ref={scrollRef} style={styles.scrollView} keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.scroll, compact && styles.scrollCompact]}>{content}</ScrollView>
        {stage === "agreements" || stage === "name" || stage === "email" || stage === "phone" ? (
          <View style={styles.fixedFooter}>
            <View style={styles.fixedFooterInner}>
              <PrimaryButton label={stage === "phone" ? "가입완료" : "다음"} onPress={handleContinue} />
            </View>
          </View>
        ) : null}
        <CoupangMissionModal visible={missionVisible} step={mission.step} instruction={mission.text} onClose={() => setMissionVisible(false)} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function AgreementRow({ label, checked, onPress, strong = false }: { label: string; checked: boolean; onPress: () => void; strong?: boolean }) {
  return <Pressable accessibilityRole="checkbox" accessibilityState={{ checked }} style={[styles.agreement, strong && styles.agreementAll]} onPress={onPress}><View style={[styles.checkbox, checked && styles.checkboxChecked]}><Text style={styles.checkMark}>{checked ? "✓" : ""}</Text></View><Text style={[styles.agreementText, strong && styles.agreementStrong]}>{label}</Text><Text style={styles.chevron}>{strong ? "" : "›"}</Text></Pressable>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f5f6f8" },
  header: { minHeight: 76, backgroundColor: "white", flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: "#e7e9ed", elevation: 2 },
  back: { position: "absolute", left: 18, width: 52, height: 52, alignItems: "center", justifyContent: "center" },
  backText: { fontSize: 46, lineHeight: 48, color: "#182132", fontWeight: "300" },
  headerTitle: { fontSize: 23, color: "#182132", fontWeight: "900" },
  sound: { position: "absolute", right: 18, width: 52, height: 52, alignItems: "center", justifyContent: "center", backgroundColor: "#edf4ff", borderRadius: 26 },
  soundText: { fontSize: 23 },
  scrollView: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 36, paddingVertical: 34, alignItems: "center" },
  scrollCompact: { paddingHorizontal: 16, paddingVertical: 22 },
  loginCard: { width: "100%", maxWidth: 560, backgroundColor: "white", borderRadius: 18, padding: 38, elevation: 7, marginVertical: "auto" },
  loginCardCompact: { padding: 24, marginVertical: 10 },
  tabs: { marginTop: 34, marginBottom: 24, flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e1e4e9" },
  tabMuted: { flex: 1, textAlign: "center", paddingVertical: 16, fontSize: 16, fontWeight: "700", color: "#4d535d" },
  tabActive: { flex: 1, textAlign: "center", paddingVertical: 16, fontSize: 16, fontWeight: "800", color: "#3478eb", borderBottomWidth: 3, borderBottomColor: "#3478eb" },
  newBadge: { color: "white", backgroundColor: "#ff4d56", fontSize: 11 },
  input: { width: "100%", minHeight: 64, borderWidth: 2, borderColor: "#cfd4dc", borderRadius: 9, backgroundColor: "white", paddingHorizontal: 18, fontSize: 20, color: "#222" },
  quickRow: { minHeight: 66, flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
  checkSmall: { width: 24, height: 24, borderRadius: 5, backgroundColor: "#4385ef", alignItems: "center", justifyContent: "center" },
  checkMark: { color: "white", fontWeight: "900", fontSize: 17 },
  quickText: { fontSize: 15, fontWeight: "700", color: "#333" },
  linkText: { marginLeft: "auto", fontSize: 14, color: "#555" },
  secondaryButton: { minHeight: 62, borderWidth: 1, borderColor: "#cfd3da", borderRadius: 9, alignItems: "center", justifyContent: "center", marginTop: 22 },
  secondaryText: { fontSize: 20, color: "#343943", fontWeight: "900" },
  coupon: { marginTop: 26, backgroundColor: "#ff7548", borderRadius: 10, minHeight: 98, padding: 18, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  couponSmall: { color: "white", fontSize: 14, fontWeight: "700" },
  couponTitle: { color: "white", fontSize: 17, fontWeight: "900", marginTop: 5 },
  couponTicket: { borderRadius: 8, backgroundColor: "#ff987a", padding: 11, alignItems: "center" },
  couponTicketText: { color: "#f45d30", backgroundColor: "white", paddingHorizontal: 8, paddingVertical: 3, fontWeight: "800" },
  couponTicketSub: { color: "white", fontSize: 10, marginTop: 3 },
  business: { marginTop: 24, paddingTop: 20, borderTopWidth: 1, borderTopColor: "#e6e8ec", color: "#888", textAlign: "center", lineHeight: 21 },
  heading: { fontSize: 27, fontWeight: "900", color: "#172033", marginBottom: 28 },
  agreement: { minHeight: 65, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  agreementAll: { borderWidth: 1, borderColor: "#d9dde4", borderRadius: 9, backgroundColor: "#fafbfc", marginBottom: 14 },
  checkbox: { width: 25, height: 25, borderRadius: 4, borderWidth: 2, borderColor: "#cdd2da", alignItems: "center", justifyContent: "center", marginRight: 14 },
  checkboxChecked: { backgroundColor: "#3478eb", borderColor: "#3478eb" },
  agreementText: { flex: 1, fontSize: 17, color: "#262d38" },
  agreementStrong: { fontWeight: "900", fontSize: 19 },
  chevron: { fontSize: 28, color: "#8b929d" },
  fixedFooter: { backgroundColor: "white", borderTopWidth: 1, borderTopColor: "#e1e4e9", paddingHorizontal: 22, paddingVertical: 16, elevation: 12 },
  fixedFooterInner: { width: "100%", maxWidth: 820, alignSelf: "center" },
  inlineInput: { width: "100%", minHeight: 64, borderWidth: 2, borderColor: "#3478eb", borderRadius: 9, backgroundColor: "white", flexDirection: "row", alignItems: "center", paddingLeft: 4, marginBottom: 2 },
  flexInput: { flex: 1, minHeight: 60, paddingHorizontal: 15, fontSize: 20, color: "#222" },
  verifyButton: { marginRight: 7, minHeight: 48, paddingHorizontal: 18, borderRadius: 7, backgroundColor: "#3478eb", alignItems: "center", justifyContent: "center" },
  verifyDisabled: { backgroundColor: "#d7dae0" },
  verifyText: { color: "white", fontSize: 16, fontWeight: "900" },
  practiceCode: { color: "#3478eb", fontSize: 17, fontWeight: "800", marginTop: 18 },
  complete: { flex: 1, minHeight: 580, width: "100%", maxWidth: 720, alignItems: "center", justifyContent: "center", padding: 30 },
  avatar: { width: 110, height: 110, borderRadius: 55, backgroundColor: "#f0f2f5", alignItems: "center", justifyContent: "center", elevation: 5 },
  avatarText: { fontSize: 54, color: "#d1d4d9" },
  party: { fontSize: 72 },
  completeTitle: { marginTop: 35, fontSize: 29, fontWeight: "900", color: "#1b2432", textAlign: "center" },
  completeSub: { marginTop: 17, fontSize: 18, lineHeight: 28, color: "#626b78", textAlign: "center" },
  completeButton: { width: "100%", maxWidth: 480, marginTop: 40 },
  resultButtons: { width: "100%", maxWidth: 480, marginTop: 40, gap: 15 },
  homeButton: { minHeight: 62, borderWidth: 2, borderColor: "#3478eb", borderRadius: 9, alignItems: "center", justifyContent: "center" },
  homeText: { color: "#3478eb", fontSize: 20, fontWeight: "900" },
});

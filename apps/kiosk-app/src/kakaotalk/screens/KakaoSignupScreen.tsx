import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Speech from "expo-speech";

type Props = { onBack: () => void };
const REQUIRED_TERMS = [
  "만 14세 이상입니다.",
  "[필수] 카카오계정 약관",
  "[필수] 카카오 통합서비스 약관",
  "[필수] 개인정보 수집 및 이용 동의",
];

const SIGNUP_VOICE_GUIDES = [
  "회원가입 연습 첫 번째 단계입니다. 화면 아래에 있는 회원가입 글자를 눌러 주세요. 선택한 다음, 다음 버튼을 누르세요.",
  "두 번째 단계입니다. 카카오 계정으로 사용할 이메일이 있는지 선택하고 다음 버튼을 눌러 주세요.",
  "세 번째 단계입니다. 서비스 이용을 위해 필수 약관 네 개에 모두 동의해 주세요. 모두 동의합니다를 누르면 한 번에 선택할 수 있습니다.",
  "네 번째 단계입니다. 휴대폰 번호 숫자 열한 자리를 입력한 뒤 인증 요청 버튼을 눌러 주세요.",
  "다섯 번째 단계입니다. 카카오 메일로 사용할 아이디를 영문과 숫자 조합으로 두 글자 이상 입력해 주세요.",
  "여섯 번째 단계입니다. 여덟 자리 이상 비밀번호를 입력하고, 아래 칸에 같은 비밀번호를 한 번 더 입력해 주세요.",
  "일곱 번째 단계입니다. 카카오톡에서 사용할 닉네임을 입력하고 다음 버튼을 눌러 주세요.",
  "회원가입 연습을 모두 완료했습니다. 시작하기 버튼을 눌러 연습 선택 화면으로 돌아가세요.",
];

function speakSignupGuide(step: number) {
  void Speech.stop();
  Speech.speak(SIGNUP_VOICE_GUIDES[step - 1], {
    language: "ko-KR",
    rate: 0.88,
    pitch: 1,
  });
}

export function KakaoSignupScreen({ onBack }: Props) {
  const [step, setStep] = useState(1);
  const [joined, setJoined] = useState(false);
  const [emailChoice, setEmailChoice] = useState<"existing" | "new" | null>(
    null,
  );
  const [terms, setTerms] = useState<string[]>([]);
  const [phone, setPhone] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    speakSignupGuide(step);
  }, [step]);

  useEffect(
    () => () => {
      void Speech.stop();
    },
    [],
  );
  const canNext = useMemo(() => {
    if (step === 1) return joined;
    if (step === 2) return emailChoice !== null;
    if (step === 3) return REQUIRED_TERMS.every((term) => terms.includes(term));
    if (step === 4) return phoneVerified;
    if (step === 5) return /^[a-zA-Z0-9._-]{2,20}$/.test(email);
    if (step === 6)
      return (
        password.length >= 8 &&
        password.length <= 32 &&
        password === passwordConfirm
      );
    if (step === 7)
      return nickname.trim().length >= 1 && nickname.trim().length <= 20;
    return false;
  }, [
    step,
    joined,
    emailChoice,
    terms,
    phoneVerified,
    email,
    password,
    passwordConfirm,
    nickname,
  ]);
  const next = () => {
    if (step === 8) return;
    if (!canNext)
      return Alert.alert("미션을 먼저 완료해 주세요.", missionHint(step));
    setStep((value) => value + 1);
  };
  const toggleTerm = (term: string) =>
    setTerms((current) =>
      current.includes(term)
        ? current.filter((item) => item !== term)
        : [...current, term],
    );
  const toggleAll = () =>
    setTerms(terms.length === REQUIRED_TERMS.length ? [] : REQUIRED_TERMS);

  return (
    <SafeAreaView style={s.page}>
      <View style={s.top}>
        <Pressable onPress={onBack}>
          <Text style={s.back}>← 메뉴</Text>
        </Pressable>
        <Text style={s.topTitle}>카카오톡 회원가입 연습</Text>
        <View style={s.spacer} />
      </View>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.card}>
          <View style={s.guide}>
            <Text style={s.guideText}>
              카카오톡 회원가입 따라하기 {step} / 8단계
            </Text>
            <Pressable
              style={s.listenAgain}
              onPress={() => speakSignupGuide(step)}
            >
              <Text style={s.listenAgainText}>🔊 설명 다시 듣기</Text>
            </Pressable>
          </View>
          <Text style={s.kakao}>kakao</Text>
          {step === 1 && (
            <>
              <TextInput
                style={s.input}
                placeholder="카카오메일 아이디, 이메일, 전화번호"
              />
              <TextInput
                style={s.input}
                placeholder="비밀번호"
                secureTextEntry
              />
              <Text style={s.check}>□ 간편로그인 정보 저장 ?</Text>
              <Pressable
                style={s.purple}
                onPress={() =>
                  Alert.alert(
                    "안내",
                    "기존 계정 로그인은 이 연습에서 진행하지 않습니다.",
                  )
                }
              >
                <Text style={s.white}>로그인</Text>
              </Pressable>
              <Text style={s.or}>──────── 또는 ────────</Text>
              <Pressable
                style={s.outline}
                onPress={() =>
                  Alert.alert(
                    "QR코드 로그인",
                    "교육용 앱에서는 QR 로그인을 제공하지 않습니다.",
                  )
                }
              >
                <Text style={s.outlineText}>QR코드 로그인</Text>
              </Pressable>
              <View style={s.linksRow}>
                <Pressable onPress={() => setJoined(true)}>
                  <Text style={[s.linkText, joined && s.doneLink]}>
                    회원가입
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() =>
                    Alert.alert("안내", "회원가입 버튼을 클릭해주세요")
                  }
                >
                  <Text style={s.linkText}>계정 찾기</Text>
                </Pressable>

                <Pressable
                  onPress={() =>
                    Alert.alert("안내", "회원가입 버튼을 클릭해주세요")
                  }
                >
                  <Text style={s.linkText}>비밀번호 찾기</Text>
                </Pressable>
              </View>
              {joined && (
                <Text style={s.complete}>
                  ✓ 회원가입을 선택했습니다. 아래 다음 버튼을 누르세요.
                </Text>
              )}
            </>
          )}
          {step === 2 && (
            <View style={s.center}>
              <Text style={s.heading}>가입을 시작합니다!</Text>
              <Text style={s.subhead}>카카오계정 하나로</Text>
              <Text style={s.muted}>
                다양한 서비스를 편리하게 이용해 보세요.
              </Text>
              <Text style={s.question}>
                카카오계정으로 사용할 이메일이 있나요?
              </Text>
              <Pressable
                style={[s.yellow, emailChoice === "existing" && s.selected]}
                onPress={() => setEmailChoice("existing")}
              >
                <Text style={s.strong}>이메일이 있습니다.</Text>
              </Pressable>
              <Pressable
                style={[s.outline, emailChoice === "new" && s.selectedOutline]}
                onPress={() => setEmailChoice("new")}
              >
                <Text style={s.outlineText}>새 이메일이 필요합니다.</Text>
              </Pressable>
              {emailChoice && (
                <Text style={s.complete}>
                  ✓ 선택했습니다. 아래 다음 버튼을 누르세요.
                </Text>
              )}
            </View>
          )}
          {step === 3 && (
            <>
              <Text style={s.headingLeft}>카카오계정</Text>
              <Text style={s.muted}>서비스 약관에 동의해 주세요.</Text>
              <View style={s.terms}>
                <Pressable style={s.term} onPress={toggleAll}>
                  <Text style={s.termText}>
                    {terms.length === REQUIRED_TERMS.length ? "☑" : "□"} 모두
                    동의합니다.
                  </Text>
                </Pressable>
                {REQUIRED_TERMS.map((term) => (
                  <Pressable
                    key={term}
                    style={s.term}
                    onPress={() => toggleTerm(term)}
                  >
                    <Text style={[s.termText, term.includes("14세") && s.blue]}>
                      {terms.includes(term) ? "☑" : "□"} {term}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Text style={s.complete}>{terms.length}/4 필수 약관 동의</Text>
            </>
          )}
          {step === 4 && (
            <View style={s.center}>
              <Text style={s.heading}>카카오계정 가입을 위해</Text>
              <Text style={s.muted}>휴대폰 인증을 진행해 주세요.</Text>
              <View style={s.phone}>
                <Text style={s.country}>+82⌄</Text>
                <TextInput
                  style={s.phoneInput}
                  value={phone}
                  onChangeText={(value) => {
                    setPhone(value.replace(/\D/g, "").slice(0, 11));
                    setPhoneVerified(false);
                  }}
                  placeholder="01012345678"
                  keyboardType="number-pad"
                  inputMode="numeric"
                  maxLength={11}
                />
                <Pressable
                  style={[
                    s.verify,
                    phone.length !== 11 && s.disabled,
                  ]}
                  onPress={() => {
                    if (phone.length !== 11)
                      return Alert.alert(
                        "전화번호 확인",
                        "휴대폰 번호 숫자 11자리를 입력해 주세요.",
                      );
                    setPhoneVerified(true);
                  }}
                >
                  <Text style={s.verifyText}>
                    {phoneVerified ? "인증완료" : "인증요청"}
                  </Text>
                </Pressable>
              </View>
              <Text style={s.muted}>숫자만 입력해 주세요. ({phone.length}/11)</Text>
              {phoneVerified && (
                <Text style={s.complete}>✓ 휴대폰 인증이 완료되었습니다.</Text>
              )}
            </View>
          )}
          {step === 5 && (
            <>
              <Text style={s.headingLeft}>카카오계정으로 사용할</Text>
              <Text style={s.muted}>카카오메일을 만들어 주세요.</Text>
              <View style={s.emailRow}>
                <TextInput
                  style={s.emailInput}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="test"
                  autoCapitalize="none"
                />
                <Text style={s.domain}>@ kakao.com</Text>
              </View>
              <Text style={s.bullet}>
                • 영문, 숫자, ., _, - 조합으로 2~20자를 입력하세요.
              </Text>
              {/^[a-zA-Z0-9._-]{2,20}$/.test(email) && (
                <Text style={s.complete}>✓ 사용할 카카오메일입니다.</Text>
              )}
            </>
          )}
          {step === 6 && (
            <>
              <Text style={s.headingLeft}>카카오계정 로그인에 사용할</Text>
              <Text style={s.muted}>비밀번호를 등록해 주세요.</Text>
              <Text style={s.label}>카카오계정</Text>
              <View style={s.readonly}>
                <Text>{email || "test"}@kakao.com</Text>
              </View>
              <Text style={s.label}>비밀번호</Text>
              <TextInput
                style={s.input}
                value={password}
                onChangeText={setPassword}
                placeholder="비밀번호 입력(8~32자리)"
                secureTextEntry
              />
              <Text style={s.label}>비밀번호 재입력</Text>
              <TextInput
                style={s.input}
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
                placeholder="비밀번호 재입력"
                secureTextEntry
              />
              {password &&
                password === passwordConfirm &&
                password.length >= 8 && (
                  <Text style={s.complete}>✓ 비밀번호가 일치합니다.</Text>
                )}
            </>
          )}
          {step === 7 && (
            <>
              <Text style={s.headingLeft}>카카오계정 프로필을</Text>
              <Text style={s.muted}>설정해 주세요.</Text>
              <Text style={s.label}>닉네임</Text>
              <TextInput
                style={s.input}
                value={nickname}
                onChangeText={setNickname}
                maxLength={20}
                placeholder="닉네임 입력"
              />
              <Text style={s.bullet}>
                닉네임은 1~20자 이내여야 합니다. {nickname.length}/20
              </Text>
              {nickname.trim().length > 0 && (
                <Text style={s.complete}>✓ 사용할 수 있는 닉네임입니다.</Text>
              )}
            </>
          )}
          {step === 8 && (
            <View style={s.center}>
              <Text style={s.heading}>환영합니다!</Text>
              <Text style={s.muted}>카카오계정 가입이 완료되었습니다.</Text>
              <View style={s.profile}>
                <Text style={s.avatar}>👤</Text>
                <Text style={s.profileName}>{nickname}</Text>
                <Text style={s.muted}>{email}@kakao.com</Text>
              </View>
              <Pressable style={s.yellow} onPress={onBack}>
                <Text style={s.strong}>시작하기</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
      <View style={s.nav}>
        <Pressable
          style={[s.navButton, step === 1 && s.invisible]}
          onPress={() => setStep((value) => Math.max(1, value - 1))}
        >
          <Text style={s.navText}>이전</Text>
        </Pressable>
        <Pressable style={s.navButton} onPress={() => setStep(1)}>
          <Text style={s.navText}>처음으로</Text>
        </Pressable>
        <Pressable
          style={[s.navButton, !canNext && step !== 8 && s.nextDisabled]}
          onPress={next}
        >
          <Text style={s.navText}>{step === 8 ? "완료" : "다음"}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
function missionHint(step: number) {
  return [
    "회원가입을 눌러 주세요.",
    "이메일이 있는지 선택해 주세요.",
    "필수 약관 4개에 모두 동의해 주세요.",
    "휴대폰 번호 숫자 11자리를 입력한 후 인증요청을 눌러 주세요.",
    "사용할 카카오메일을 올바르게 입력해 주세요.",
    "8~32자 비밀번호를 두 번 동일하게 입력해 주세요.",
    "1~20자의 닉네임을 입력해 주세요.",
  ][step - 1];
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f5f5f5" },
  top: {
    height: 58,
    backgroundColor: "#fff",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  back: { fontWeight: "900", color: "#3c1e1e" },
  topTitle: { fontSize: 17, fontWeight: "900" },
  spacer: { width: 45 },
  scroll: { padding: 22, flexGrow: 1, justifyContent: "center" },
  card: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 760,
    minHeight: 570,
    padding: 32,
    backgroundColor: "#fff",
    borderRadius: 15,
    elevation: 4,
  },
  guide: {
    padding: 17,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#fee500",
  },
  guideText: { fontSize: 18, fontWeight: "900", color: "#3c1e1e" },
  listenAgain: {
    marginTop: 9,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,.72)",
  },
  listenAgainText: { color: "#5d4700", fontSize: 14, fontWeight: "900" },
  kakao: { fontSize: 47, textAlign: "center", marginVertical: 42 },
  input: {
    height: 65,
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 9,
    paddingHorizontal: 18,
    fontSize: 17,
    marginBottom: 18,
  },
  check: { fontSize: 16, marginVertical: 10 },
  purple: {
    alignItems: "center",
    padding: 18,
    borderRadius: 8,
    backgroundColor: "#7655b7",
    marginTop: 14,
  },
  white: { color: "#fff", fontSize: 17, fontWeight: "900" },
  or: { textAlign: "center", marginVertical: 25, color: "#786e66" },
  outline: {
    borderWidth: 2,
    borderColor: "#ddd",
    padding: 18,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 14,
  },
  selectedOutline: { borderColor: "#fee500", backgroundColor: "#fffbe0" },
  outlineText: { fontWeight: "800", fontSize: 17, color: "#625852" },
  links: { color: "#1670dd", textAlign: "center", fontSize: 16, marginTop: 36 },
  doneLink: { fontWeight: "900", textDecorationLine: "underline" },
  complete: {
    color: "#14743a",
    fontWeight: "800",
    marginTop: 18,
    textAlign: "center",
  },
  center: { alignItems: "center" },
  heading: { fontSize: 30, fontWeight: "900", marginTop: 12 },
  headingLeft: { fontSize: 29, fontWeight: "900" },
  subhead: { fontSize: 20, fontWeight: "800", marginTop: 38 },
  muted: { fontSize: 16, color: "#756961", marginTop: 10 },
  question: {
    fontWeight: "800",
    fontSize: 17,
    marginTop: 65,
    marginBottom: 25,
  },
  yellow: {
    minWidth: 260,
    width: "65%",
    backgroundColor: "#fee500",
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  selected: { borderWidth: 3, borderColor: "#3c1e1e" },
  strong: { fontSize: 17, fontWeight: "900", color: "#3c1e1e" },
  terms: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginTop: 28,
  },
  linksRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 22,
    marginTop: 36,
  },
  linkText: {
    color: "#1670dd",
    fontSize: 16,
  },
  term: { padding: 18, borderBottomWidth: 1, borderColor: "#eee" },
  termText: { fontSize: 16 },
  blue: { color: "#1670dd", fontWeight: "800" },
  phone: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 48 },
  country: {
    padding: 19,
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  phoneInput: {
    flex: 1,
    height: 65,
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 9,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  verify: { padding: 19, backgroundColor: "#fee500", borderRadius: 8 },
  verifyText: { fontWeight: "900", color: "#3c1e1e" },
  disabled: { opacity: 0.45 },
  emailRow: {
    height: 70,
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 9,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    marginTop: 40,
  },
  emailInput: { flex: 1, fontSize: 17 },
  domain: { fontSize: 16, color: "#625852" },
  bullet: { color: "#756961", lineHeight: 27, marginTop: 16 },
  label: { fontWeight: "800", marginTop: 25, marginBottom: 10 },
  readonly: {
    padding: 18,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 9,
    backgroundColor: "#f7f8f9",
  },
  profile: { alignItems: "center", marginVertical: 45 },
  avatar: {
    fontSize: 58,
    backgroundColor: "#eee",
    borderRadius: 50,
    padding: 12,
  },
  profileName: { fontSize: 21, fontWeight: "900", marginTop: 12 },
  nav: { flexDirection: "row", justifyContent: "space-between", padding: 18 },
  navButton: {
    minWidth: 90,
    alignItems: "center",
    backgroundColor: "#fee500",
    paddingVertical: 16,
    paddingHorizontal: 22,
    borderRadius: 8,
  },
  nextDisabled: { opacity: 0.4 },
  navText: { fontSize: 17, fontWeight: "900", color: "#3c1e1e" },
  invisible: { opacity: 0 },
});

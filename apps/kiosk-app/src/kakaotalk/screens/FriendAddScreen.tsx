import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { FriendTab } from "../components/FriendTab";
import { MissionComplete, MissionGuide } from "../components/MissionGuide";
import * as Speech from "expo-speech";
type Page = "home" | "add" | "id" | "qr" | "phone";
type FriendMission = "qr" | "phone" | "id";

const FRIEND_MISSIONS: { id: FriendMission; title: string; description: string }[] = [
  {
    id: "qr",
    title: "QR코드로 친구 추가",
    description: "카메라 화면에서 QR코드를 촬영해 보세요.",
  },
  {
    id: "phone",
    title: "연락처로 친구 추가",
    description: "친구의 휴대폰 번호를 입력해 보세요.",
  },
  {
    id: "id",
    title: "카카오톡 ID로 친구 추가",
    description: "친구의 카카오톡 ID를 검색해 보세요.",
  },
];

const speakGuide = (message: string) => {
  Speech.stop();
  Speech.speak(message, {
    language: "ko-KR",
    rate: 0.88,
    pitch: 1,
  });
};

export function FriendAddScreen({ onBack }: { onBack: () => void }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  const [page, setPage] = useState<Page>("home");
  const [friendId, setFriendId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [added, setAdded] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [missionIndex, setMissionIndex] = useState(0);
  const [missionModal, setMissionModal] = useState<"intro" | "next" | null>(
    "intro",
  );
  const mission = FRIEND_MISSIONS[missionIndex];

  useEffect(() => {
    if (missionModal !== null) return;
    if (page === "qr") {
      speakGuide(
        "첫 번째 미션입니다. 휴대폰 카메라로 친구의 큐알 코드를 화면 안에 맞춘 뒤, 큐알 촬영하기 버튼을 눌러 주세요.",
      );
    } else if (page === "phone") {
      speakGuide(
        "두 번째 미션입니다. 친구의 휴대폰 번호를 입력한 뒤 추가 버튼을 눌러 주세요.",
      );
    } else if (page === "id") {
      speakGuide(
        "세 번째 미션입니다. 친구의 카카오톡 아이디를 두 글자 이상 입력한 뒤 친구 추가 버튼을 눌러 주세요.",
      );
    }
  }, [missionModal, page]);

  useEffect(
    () => () => {
      void Speech.stop();
    },
    [],
  );
  const close = () => setPage("home");
  const completeMission = () => {
    setAdded(true);
    close();
    if (missionIndex === FRIEND_MISSIONS.length - 1) {
      setCompleted(true);
      return;
    }
    setMissionIndex((current) => current + 1);
    setMissionModal("next");
  };
  const openMission = (target: FriendMission) => {
    if (target !== mission.id) {
      Alert.alert(
        "현재 미션을 먼저 진행해 주세요",
        `지금은 ${mission.title} 미션이에요.`,
      );
      return;
    }
    setPage(target);
  };
  if (page === "id")
    return (
      <SafeAreaView style={s.page}>
        <Top title="카카오톡 ID로 추가" onClose={close} />
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[s.idBody, isMobile && s.idBodyMobile]}
        >
          <TextInput
            style={s.idInput}
            value={friendId}
            onChangeText={setFriendId}
            placeholder="친구 카카오톡 ID"
            maxLength={20}
          />
          <Text style={s.count}>{friendId.length}/20</Text>
          <View style={s.myId}>
            <Text style={s.myIdLabel}>내 아이디</Text>
            <Text style={s.myIdValue}>smartkio01</Text>
          </View>
          <Pressable
            style={[s.yellowButton, friendId.length < 2 && s.inactive]}
            onPress={() =>
              friendId.length < 2
                ? Alert.alert(
                    "ID 입력",
                    "친구 카카오톡 ID를 2자 이상 입력해 주세요.",
                  )
                : completeMission()
            }
          >
            <Text style={s.buttonText}>친구 추가</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  return (
    <SafeAreaView style={s.page}>
      <FriendTab
        target="add"
        friendAdded={added}
        onBack={onBack}
        onAdd={() => setPage("add")}
        onFriend={() => {}}
        onSettings={() => {}}
      />
      {!completed && (
        <MissionGuide
          title={`${missionIndex + 1}/3 ${mission.title}`}
          description={`오른쪽 위 친구 추가 버튼을 누르세요. ${mission.description}`}
        />
      )}
      <FriendMissionModal
        visible={missionModal !== null}
        mode={missionModal ?? "intro"}
        missionIndex={missionIndex}
        onStart={() => setMissionModal(null)}
      />
      <MissionComplete
        visible={completed}
        title="친구 추가"
        onRestart={() => {
          setAdded(false);
          setFriendId("");
          setPhoneNumber("");
          setMissionIndex(0);
          setMissionModal("intro");
          setCompleted(false);
          setPage("home");
        }}
        onExit={onBack}
      />
      <Modal
        visible={page === "add"}
        transparent
        animationType="slide"
        onRequestClose={close}
      >
        <View style={[s.shade, s.shadeMobile]}>
          <View style={[s.addSheet, s.addSheetMobile]}>
            <Top title="친구 추가" onClose={close} />
            <View style={[s.options, isMobile && s.optionsMobile]}>
              <Option
                compact={isMobile}
                icon="⌗"
                label="QR코드"
                onPress={() => openMission("qr")}
              />
              <Option
                compact={isMobile}
                icon="▣"
                label="연락처"
                onPress={() => openMission("phone")}
              />
              <Option
                compact={isMobile}
                icon="ID"
                label="카카오톡 ID"
                onPress={() => openMission("id")}
              />
              <Option
                compact={isMobile}
                icon="♙"
                label="추천친구"
                onPress={() =>
                  Alert.alert(
                    "안내",
                    "교육용 연습에서는 추천친구 기능을 제공하지 않습니다.",
                  )
                }
              />
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={page === "qr" || page === "phone"}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={close}
      >
        <KeyboardAvoidingView
          style={s.shade}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={[s.dialog, isMobile && s.dialogMobile]}>
            <Text style={s.dialogTitle}>
              {page === "qr" ? "QR코드를 스캔하세요" : "전화번호로 친구 추가"}
            </Text>
            {page === "qr" ? (
              <QrCameraPractice onCaptured={completeMission} />
            ) : (
              <>
                <TextInput
                  style={s.phoneInput}
                  placeholder="전화번호 입력"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />
                <Pressable
                  style={[s.yellowButton, phoneNumber.length < 10 && s.inactive]}
                  onPress={() =>
                    phoneNumber.replace(/\D/g, "").length < 10
                      ? Alert.alert("연락처 입력", "휴대폰 번호를 정확히 입력해 주세요.")
                      : completeMission()
                  }
                >
                  <Text style={s.buttonText}>추가</Text>
                </Pressable>
              </>
            )}
            <Pressable onPress={close}>
              <Text style={s.cancel}>취소</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function FriendMissionModal({
  visible,
  mode,
  missionIndex,
  onStart,
}: {
  visible: boolean;
  mode: "intro" | "next";
  missionIndex: number;
  onStart: () => void;
}) {
  const current = FRIEND_MISSIONS[missionIndex];
  const voiceMessage =
    mode === "intro"
      ? "친구 추가 미션을 시작합니다. 큐알 코드, 연락처, 카카오톡 아이디. 세 가지 방법을 순서대로 연습해 보세요. 먼저 큐알 코드로 친구를 추가합니다."
      : `잘했어요. 다음은 ${current.title} 미션입니다. ${current.description}`;

  useEffect(() => {
    if (!visible) return;
    speakGuide(voiceMessage);
  }, [visible, voiceMessage]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onStart}
    >
      <View style={s.missionShade}>
        <View style={s.missionModal}>
          <Text style={s.missionEmoji}>{mode === "intro" ? "🎯" : "👏"}</Text>
          <Text style={s.missionModalTitle}>
            {mode === "intro" ? "친구 추가 미션" : "미션 완료!"}
          </Text>
          <Text style={s.missionModalDescription}>
            {mode === "intro"
              ? "친구를 추가하는 세 가지 방법을 순서대로 연습해 보세요."
              : `잘했어요! 이제 ${current.title} 미션을 시작해요.`}
          </Text>
          <View style={s.missionList}>
            {FRIEND_MISSIONS.map((item, index) => {
              const done = index < missionIndex;
              const active = index === missionIndex;
              return (
                <View
                  key={item.id}
                  style={[s.missionRow, active && s.missionRowActive]}
                >
                  <View style={[s.missionNumber, done && s.missionNumberDone]}>
                    <Text style={s.missionNumberText}>{done ? "✓" : index + 1}</Text>
                  </View>
                  <View style={s.missionCopy}>
                    <Text style={[s.missionName, done && s.missionNameDone]}>
                      {item.title}
                    </Text>
                    <Text style={s.missionDescription}>{item.description}</Text>
                  </View>
                </View>
              );
            })}
          </View>
          <Pressable style={s.listenAgain} onPress={() => speakGuide(voiceMessage)}>
            <Text style={s.listenAgainText}>🔊 설명 다시 듣기</Text>
          </Pressable>
          <Pressable style={s.missionStartButton} onPress={onStart}>
            <Text style={s.missionStartText}>
              {mode === "intro" ? "미션 시작하기" : "다음 미션 시작"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function QrCameraPractice({ onCaptured }: { onCaptured: () => void }) {
  const scanProgress = useRef(new Animated.Value(0)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    const scanAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanProgress, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scanProgress, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    scanAnimation.start();
    return () => scanAnimation.stop();
  }, [scanProgress]);

  const capture = () => {
    if (capturing) return;
    setCapturing(true);
    Animated.sequence([
      Animated.timing(flashOpacity, {
        toValue: 0.9,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.delay(120),
      Animated.timing(flashOpacity, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start(onCaptured);
  };

  const scanTranslate = scanProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 178],
  });

  return (
    <View style={s.qrPractice}>
      <Text style={s.qrInstruction}>
        휴대폰 카메라로 친구의 QR코드를 화면 안에 맞춰 촬영하면 친구를 추가할 수
        있습니다.
      </Text>
      <View style={s.cameraFrame}>
        <Text style={s.cameraLabel}>카메라 미리보기</Text>
        <View style={s.qrTarget}>
          <Text style={s.qrPattern}>
            ▦ ▥ ▦{`\n`}▥ ▦ ▥{`\n`}▦ ▥ ▦
          </Text>
        </View>
        <Animated.View
          style={[s.scanLine, { transform: [{ translateY: scanTranslate }] }]}
        />
        <Animated.View
          pointerEvents="none"
          style={[s.cameraFlash, { opacity: flashOpacity }]}
        />
      </View>
      <Text style={s.cameraHint}>
        QR코드가 프레임 안에 들어오면 아래 버튼을 눌러보세요.
      </Text>
      <Pressable
        disabled={capturing}
        style={[s.captureButton, capturing && s.inactive]}
        onPress={capture}
      >
        <View style={s.captureButtonInner} />
      </Pressable>
      <Text style={s.captureLabel}>
        {capturing ? "확인 중..." : "QR 촬영하기"}
      </Text>
    </View>
  );
}

function Top({ title, onClose }: { title: string; onClose: () => void }) {
  const { width } = useWindowDimensions();
  const compact = width < 600;
  return (
    <View style={[s.top, compact && s.topMobile]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="닫기"
        hitSlop={8}
        style={[s.close, compact && s.closeMobile]}
        onPress={onClose}
      >
        <View
          pointerEvents="none"
          style={[s.closeGlyph, compact && s.closeGlyphMobile]}
        >
          <View style={[s.closeLine, s.closeLineForward]} />
          <View style={[s.closeLine, s.closeLineBackward]} />
        </View>
      </Pressable>
      <Text numberOfLines={1} style={[s.topTitle, compact && s.topTitleMobile]}>
        {title}
      </Text>
      <View style={{ width: compact ? 42 : 70 }} />
    </View>
  );
}
function Option({
  compact,
  icon,
  label,
  onPress,
}: {
  compact: boolean;
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={[s.option, compact && s.optionMobile]} onPress={onPress}>
      <Text style={[s.optionIcon, compact && s.optionIconMobile]}>{icon}</Text>
      <Text style={[s.optionText, compact && s.optionTextMobile]}>{label}</Text>
    </Pressable>
  );
}
export function FriendHome({
  onBack,
  onAdd,
  added,
  onFriend,
  highlight = "add",
}: {
  onBack: () => void;
  onAdd: () => void;
  added: boolean;
  onFriend?: () => void;
  highlight?: "add" | "friend" | "menu";
}) {
  return (
    <>
      <View style={s.friendHeader}>
        <Pressable onPress={onBack}>
          <Text style={s.back}>← 카카오톡</Text>
        </Pressable>
        <Text style={s.friendTitle}>친구</Text>
        <View style={s.icons}>
          <Text style={s.icon}>⌕</Text>
          <Pressable style={highlight === "add" && s.glow} onPress={onAdd}>
            <Text style={s.icon}>♙＋</Text>
          </Pressable>
          <Text style={s.icon}>⚙</Text>
        </View>
      </View>
      <Text style={s.guide}>여기를 눌러 다음 연습을 진행하세요</Text>
      <View style={s.myProfile}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>👤</Text>
        </View>
        <Text style={s.myName}>SmartKio</Text>
      </View>
      <View style={s.section}>
        <Text style={s.sectionTitle}>친구 {added ? 1 : 0}</Text>
        {added ? (
          <Pressable
            style={[s.friendRow, highlight === "friend" && s.glow]}
            onPress={onFriend}
          >
            <View style={s.smallAvatar}>
              <Text>👤</Text>
            </View>
            <View>
              <Text style={s.friendName}>홍길동</Text>
              <Text style={s.friendStatus}>카카오톡 ID로 추가됨</Text>
            </View>
          </Pressable>
        ) : (
          <Text style={s.empty}>
            친구가 없습니다. 오른쪽 상단의 친구 추가 버튼을 눌러 홍길동을 추가해
            보세요.
          </Text>
        )}
      </View>
      <View style={s.bottom}>
        <Text>●</Text>
        <Text>◌</Text>
        <Text>◉</Text>
        <Text>▣</Text>
        <Text>•••</Text>
      </View>
    </>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#fff" },
  friendHeader: {
    height: 100,
    paddingHorizontal: 26,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  back: { fontWeight: "800", color: "#333" },
  friendTitle: { fontSize: 30, fontWeight: "900" },
  icons: { flexDirection: "row", gap: 18, alignItems: "center" },
  icon: { fontSize: 25 },
  guide: {
    marginHorizontal: 30,
    backgroundColor: "#fff3a3",
    color: "#5d4700",
    fontWeight: "900",
    padding: 12,
    borderRadius: 9,
    textAlign: "center",
  },
  myProfile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 30,
    paddingVertical: 18,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 22,
    backgroundColor: "#a6c2ec",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 35 },
  myName: { fontSize: 23, fontWeight: "900" },
  section: {
    padding: 30,
    borderTopWidth: 1,
    borderColor: "#eee",
    marginTop: 20,
  },
  sectionTitle: { fontSize: 18, color: "#777", marginBottom: 18 },
  empty: { fontSize: 16, color: "#888", lineHeight: 25 },
  friendRow: {
    flexDirection: "row",
    gap: 15,
    alignItems: "center",
    padding: 7,
    borderRadius: 12,
  },
  glow: {
    borderWidth: 4,
    borderColor: "#ff4e33",
    backgroundColor: "#fff9a8",
    shadowColor: "#ff2c00",
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 10,
  },
  smallAvatar: {
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor: "#a6c2ec",
    alignItems: "center",
    justifyContent: "center",
  },
  friendName: { fontSize: 20, fontWeight: "800" },
  friendStatus: { color: "#888", marginTop: 4 },
  bottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fafafa",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    fontSize: 24,
  },
  shade: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  shadeMobile: { justifyContent: "flex-start", padding: 0 },
  addSheet: {
    width: "92%",
    maxWidth: 860,
    backgroundColor: "white",
    borderRadius: 24,
    overflow: "hidden",
  },
  addSheetMobile: {
    width: "100%",
    borderRadius: 0,
  },
  top: {
    height: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 45,
  },
  topMobile: { height: 72, paddingHorizontal: 16 },
  close: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f7f7f7",
    alignItems: "center",
    justifyContent: "center",
  },
  closeMobile: { width: 42, height: 42, borderRadius: 21 },
  closeGlyph: {
    position: "relative",
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  closeGlyphMobile: { width: 20, height: 20 },
  closeLine: {
    position: "absolute",
    width: "100%",
    height: 3,
    borderRadius: 2,
    backgroundColor: "#171717",
  },
  closeLineForward: { transform: [{ rotate: "45deg" }] },
  closeLineBackward: { transform: [{ rotate: "-45deg" }] },
  topTitle: { fontSize: 30, fontWeight: "900" },
  topTitleMobile: { flexShrink: 1, fontSize: 21 },
  options: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  optionsMobile: { paddingHorizontal: 4, paddingBottom: 18 },
  option: { alignItems: "center", gap: 14 },
  optionMobile: { width: "25%", paddingVertical: 14, gap: 8 },
  optionIcon: { fontSize: 39 },
  optionIconMobile: { fontSize: 31 },
  optionText: { fontSize: 17 },
  optionTextMobile: { fontSize: 15 },
  idBody: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 860,
    alignSelf: "center",
    padding: 48,
  },
  idBodyMobile: { padding: 20, paddingBottom: 40 },
  idInput: {
    fontSize: 26,
    borderBottomWidth: 2,
    borderColor: "#777",
    paddingVertical: 18,
  },
  count: { textAlign: "right", fontSize: 17, color: "#777", marginTop: 8 },
  myId: {
    marginTop: 38,
    padding: 22,
    backgroundColor: "#f6f6f6",
    borderRadius: 13,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  myIdLabel: { fontSize: 19 },
  myIdValue: { fontSize: 21 },
  yellowButton: {
    backgroundColor: "#fee500",
    padding: 18,
    borderRadius: 11,
    alignItems: "center",
    marginTop: 28,
  },
  inactive: { opacity: 0.4 },
  buttonText: { fontSize: 18, fontWeight: "900", color: "#3c1e1e" },
  dialog: {
    width: "100%",
    maxWidth: 620,
    padding: 28,
    borderRadius: 20,
    backgroundColor: "white",
    alignItems: "center",
  },
  dialogMobile: { width: "94%", padding: 20, borderRadius: 16 },
  dialogTitle: { fontSize: 22, fontWeight: "900" },
  qrPractice: { width: "100%", alignItems: "center" },
  qrInstruction: {
    marginTop: 12,
    color: "#555",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  cameraFrame: {
    width: "100%",
    maxWidth: 360,
    height: 220,
    marginTop: 16,
    backgroundColor: "#17191d",
    borderRadius: 18,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#333840",
  },
  cameraLabel: {
    position: "absolute",
    top: 10,
    left: 14,
    color: "#c9cdd3",
    fontSize: 11,
    fontWeight: "700",
  },
  qrTarget: {
    width: 150,
    height: 150,
    borderWidth: 3,
    borderColor: "#fee500",
    borderRadius: 12,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  qrPattern: {
    color: "#151515",
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 37,
    textAlign: "center",
  },
  scanLine: {
    position: "absolute",
    top: 18,
    left: 38,
    right: 38,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#fee500",
    shadowColor: "#fee500",
    shadowOpacity: 0.9,
    shadowRadius: 7,
    elevation: 6,
  },
  cameraFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "white",
  },
  cameraHint: {
    color: "#777",
    fontSize: 12,
    marginTop: 12,
    textAlign: "center",
  },
  captureButton: {
    width: 62,
    height: 62,
    marginTop: 14,
    borderRadius: 31,
    borderWidth: 3,
    borderColor: "#3c1e1e",
    padding: 5,
  },
  captureButtonInner: {
    flex: 1,
    borderRadius: 25,
    backgroundColor: "#fee500",
  },
  captureLabel: { marginTop: 6, color: "#3c1e1e", fontWeight: "900" },
  phoneInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 9,
    padding: 15,
    marginTop: 25,
  },
  missionShade: {
    flex: 1,
    padding: 24,
    backgroundColor: "rgba(0,0,0,.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  missionModal: {
    width: "100%",
    maxWidth: 560,
    padding: 26,
    borderRadius: 24,
    backgroundColor: "white",
    alignItems: "center",
  },
  missionEmoji: { fontSize: 42 },
  missionModalTitle: { marginTop: 8, fontSize: 27, fontWeight: "900" },
  missionModalDescription: {
    marginTop: 8,
    color: "#666",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  missionList: { width: "100%", marginTop: 20, gap: 9 },
  missionRow: {
    minHeight: 70,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#f6f6f6",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  missionRowActive: {
    borderWidth: 2,
    borderColor: "#fee500",
    backgroundColor: "#fffdf0",
  },
  missionNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fee500",
    alignItems: "center",
    justifyContent: "center",
  },
  missionNumberDone: { backgroundColor: "#58b36b" },
  missionNumberText: { color: "#302400", fontSize: 16, fontWeight: "900" },
  missionCopy: { flex: 1 },
  missionName: { fontSize: 16, fontWeight: "900" },
  missionNameDone: { color: "#777", textDecorationLine: "line-through" },
  missionDescription: { marginTop: 3, color: "#777", fontSize: 12 },
  missionStartButton: {
    width: "100%",
    marginTop: 10,
    padding: 16,
    borderRadius: 13,
    backgroundColor: "#fee500",
    alignItems: "center",
  },
  missionStartText: { color: "#3c1e1e", fontSize: 17, fontWeight: "900" },
  listenAgain: { marginTop: 15, paddingVertical: 8, paddingHorizontal: 14 },
  listenAgainText: { color: "#5d4700", fontSize: 15, fontWeight: "900" },
  cancel: { marginTop: 18, color: "#666", fontWeight: "800" },
});

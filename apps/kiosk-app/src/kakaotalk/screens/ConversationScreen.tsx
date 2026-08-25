import { useEffect, useState } from "react";
import {
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
} from "react-native";
import { FriendTab } from "../components/FriendTab";
import { MissionComplete, MissionGuide } from "../components/MissionGuide";
import * as Speech from "expo-speech";

function speakChat(message: string) {
  void Speech.stop();
  Speech.speak(message, { language: "ko-KR", rate: 0.88, pitch: 1 });
}

export function ConversationScreen({ onBack }: { onBack: () => void }) {
  const [page, setPage] = useState<"home" | "profile" | "chat">("home");
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [panel, setPanel] = useState(false);
  const [albumOpen, setAlbumOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [photo, setPhoto] = useState(false);
  const [complete, setComplete] = useState(false);
  const [missionStep, setMissionStep] = useState<0 | 1>(0);
  const [missionModal, setMissionModal] = useState<
    "intro" | "next" | "wrong" | null
  >("intro");
  useEffect(() => {
    if (missionModal !== null || page === "home") return;
    if (page === "profile")
      speakChat("홍길동의 프로필입니다. 일대일 채팅 버튼을 눌러 주세요.");
    else if (missionStep === 0)
      speakChat(
        "첫 번째 미션입니다. 메시지를 입력하고 전송 버튼을 눌러 주세요.",
      );
    else
      speakChat(
        "두 번째 미션입니다. 플러스 버튼을 누르고 앨범에서 사진을 선택해 전송해 주세요.",
      );
  }, [missionModal, missionStep, page]);
  useEffect(
    () => () => {
      void Speech.stop();
    },
    [],
  );
  const restart = () => {
    setPage("home");
    setText("");
    setMessages([]);
    setPanel(false);
    setAlbumOpen(false);
    setSelectedPhoto(null);
    setPhoto(false);
    setComplete(false);
    setMissionStep(0);
    setMissionModal("intro");
  };
  const wrongMission = () => setMissionModal("wrong");
  const send = () => {
    if (missionStep !== 0) return wrongMission();
    if (!text.trim()) return;
    setMessages((x) => [...x, text.trim()]);
    setText("");
    setMissionStep(1);
    setMissionModal("next");
  };
  const sendPhoto = () => {
    setPhoto(true);
    setPanel(false);
    setTimeout(() => {
      setComplete(true);
      setPage("home");
    }, 1200);
  };

  if (page === "home")
    return (
      <SafeAreaView style={s.fill}>
        <FriendTab
          target="friend"
          friendAdded
          onBack={onBack}
          onAdd={wrongMission}
          onFriend={() => setPage("profile")}
          onSettings={wrongMission}
        />
        <MissionGuide
          title={
            missionStep === 0
              ? "1/2 홍길동에게 메시지를 보내세요"
              : "2/2 홍길동에게 사진을 보내세요"
          }
          description={
            missionStep === 0
              ? "홍길동과 1:1 채팅을 열고 인사 메시지를 입력해 전송하세요."
              : "+ → 앨범을 누르고 사진을 선택한 뒤 전송하세요."
          }
        />
        <ChatMissionModal
          visible={missionModal !== null}
          mode={missionModal ?? "intro"}
          step={missionStep}
          onClose={() => setMissionModal(null)}
        />
        <MissionComplete
          visible={complete}
          title="친구와 대화"
          onRestart={restart}
          onExit={onBack}
        />
      </SafeAreaView>
    );

  if (page === "profile")
    return (
      <SafeAreaView style={s.profile}>
        <View style={s.profileTop}>
          <Pressable
            accessibilityLabel="닫기"
            style={s.closeButton}
            onPress={() => setPage("home")}
          >
            <CloseIcon />
          </Pressable>
          <View style={s.profileTools}>
            <Pressable onPress={wrongMission}>
              <Text style={s.tool}>♡</Text>
            </Pressable>
            <Pressable onPress={wrongMission}>
              <Text style={s.tool}>ⓦ</Text>
            </Pressable>
            <Pressable onPress={wrongMission}>
              <Text style={s.more}>•••</Text>
            </Pressable>
          </View>
        </View>
        <View style={s.profileBody}>
          <Avatar large />
          <Text style={s.profileName}>홍길동</Text>
          <View style={s.profileActions}>
            <Pressable style={s.action} onPress={() => setPage("chat")}>
              <Text style={s.actionIcon}>◯</Text>
              <Text style={s.actionText}>1:1 채팅</Text>
            </Pressable>
            <View style={s.divider} />
            <Pressable style={s.action} onPress={wrongMission}>
              <Text style={s.actionIcon}>♧</Text>
              <Text style={s.actionText}>통화</Text>
            </Pressable>
          </View>
          <Text style={s.updates}>아직 친구가 남긴 소식이 없어요</Text>
        </View>
        <ChatMissionModal
          visible={missionModal !== null}
          mode={missionModal ?? "intro"}
          step={missionStep}
          onClose={() => setMissionModal(null)}
        />
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={s.chat}>
      <KeyboardAvoidingView
        style={s.fill}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={s.chatHeader}>
          <Pressable style={s.headerSide} onPress={() => setPage("profile")}>
            <Text style={s.back}>‹</Text>
          </Pressable>
          <View style={s.chatTitle}>
            <Text style={s.chatName}>홍길동</Text>
            <Text style={s.people}>1</Text>
          </View>
          <View style={[s.headerSide, s.headerTools]}>
            <Pressable onPress={wrongMission}>
              <Text style={s.headerIcon}>⌕</Text>
            </Pressable>
            <Pressable onPress={wrongMission}>
              <Text style={s.headerIcon}>☰</Text>
            </Pressable>
          </View>
        </View>
        <ScrollView
          style={s.fill}
          contentContainerStyle={s.messages}
          keyboardShouldPersistTaps="handled"
        >
          <View style={s.date}>
            <Text style={s.dateText}>2026년 8월 24일 월요일</Text>
          </View>
          <View style={s.otherRow}>
            <Avatar />
            <View>
              <Text style={s.sender}>홍길동</Text>
              <View style={s.otherBubble}>
                <Text style={s.bubbleText}>안녕하세요! 반가워요.</Text>
              </View>
            </View>
          </View>
          {messages.map((message, index) => (
            <View key={`${message}-${index}`} style={s.mineRow}>
              <Text style={s.time}>오전 11:42</Text>
              <View style={s.mineBubble}>
                <Text style={s.bubbleText}>{message}</Text>
              </View>
            </View>
          ))}
          {photo && (
            <View style={s.photoBubble}>
              <View style={s.photoImage}>
                <Text style={s.sun}>●</Text>
                <Text style={s.mountains}>▲ ▲</Text>
              </View>
              <Text style={s.photoCaption}>사진을 보냈습니다</Text>
            </View>
          )}
        </ScrollView>
        <View style={s.composer}>
          <Pressable
            style={s.plusButton}
            onPress={() =>
              missionStep === 0 ? wrongMission() : setPanel((x) => !x)
            }
          >
            <Text style={s.plus}>{panel ? "×" : "+"}</Text>
          </Pressable>
          <View style={s.inputShell}>
            <TextInput
              style={s.input}
              value={text}
              onChangeText={setText}
              placeholder="메시지 입력"
              onSubmitEditing={send}
            />
            <Text style={s.smile}>☺</Text>
          </View>
          <Pressable style={[s.send, !text.trim() && s.sendOff]} onPress={send}>
            <Text style={s.sendText}>전송</Text>
          </Pressable>
        </View>
        {panel && (
          <View style={s.panel}>
            <Attachment
              icon="▣"
              label="앨범"
              onPress={() => {
                setPanel(false);
                setSelectedPhoto(null);
                setAlbumOpen(true);
              }}
            />
            <Attachment icon="◎" label="카메라" onPress={wrongMission} />
            <Attachment icon="▤" label="파일" onPress={wrongMission} />
            <Attachment icon="♧" label="연락처" onPress={wrongMission} />
          </View>
        )}
        <ChatMissionModal
          visible={missionModal !== null}
          mode={missionModal ?? "intro"}
          step={missionStep}
          onClose={() => setMissionModal(null)}
        />
        <AlbumPicker
          visible={albumOpen}
          selected={selectedPhoto}
          onSelect={setSelectedPhoto}
          onClose={() => setAlbumOpen(false)}
          onSend={() => {
            if (selectedPhoto !== null) {
              setAlbumOpen(false);
              sendPhoto();
            }
          }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function CloseIcon() {
  return (
    <View style={s.closeGlyph}>
      <View style={[s.closeLine, s.forward]} />
      <View style={[s.closeLine, s.backward]} />
    </View>
  );
}
function Avatar({ large = false }: { large?: boolean }) {
  return (
    <View style={[s.avatar, large && s.avatarLarge]}>
      <View style={[s.avatarHead, large && s.avatarHeadLarge]} />
      <View style={[s.avatarBody, large && s.avatarBodyLarge]} />
    </View>
  );
}
function Attachment({
  icon,
  label,
  enabled = true,
  onPress,
}: {
  icon: string;
  label: string;
  enabled?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable style={[s.attachment, !enabled && s.disabled]} onPress={onPress}>
      <View style={s.attachmentCircle}>
        <Text style={s.attachmentIcon}>{icon}</Text>
      </View>
      <Text style={s.attachmentText}>{label}</Text>
    </Pressable>
  );
}

function ChatMissionModal({
  visible,
  mode,
  step,
  onClose,
}: {
  visible: boolean;
  mode: "intro" | "next" | "wrong";
  step: 0 | 1;
  onClose: () => void;
}) {
  const title =
    mode === "intro"
      ? "친구와 대화 미션"
      : mode === "next"
        ? "첫 번째 미션 완료!"
        : "현재 미션을 먼저 진행해 주세요";
  const description =
    mode === "intro"
      ? "메시지와 사진을 차례대로 보내는 두 가지 미션을 진행합니다."
      : mode === "next"
        ? "잘했어요! 이제 + 버튼을 눌러 앨범에서 사진을 보내세요."
        : step === 0
          ? "지금은 메시지 보내기 미션입니다. 메시지를 입력하고 전송 버튼을 눌러 주세요."
          : "지금은 사진 보내기 미션입니다. + 버튼에서 앨범을 선택해 주세요.";
  const voice =
    mode === "intro"
      ? "친구와 대화 미션을 시작합니다. 첫 번째, 메시지 보내기. 두 번째, 앨범에서 사진 보내기. 먼저 홍길동과 일대일 채팅을 열어 주세요."
      : mode === "next"
        ? "첫 번째 메시지 보내기 미션을 완료했습니다. 이제 플러스 버튼을 누르고 앨범에서 사진을 선택해 전송해 주세요."
        : description;
  useEffect(() => {
    if (visible) speakChat(voice);
  }, [visible, voice]);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={s.missionShade}>
        <View style={s.missionCard}>
          <Text style={s.missionEmoji}>
            {mode === "wrong" ? "☝️" : mode === "next" ? "👏" : "💬"}
          </Text>
          <Text style={s.missionTitle}>{title}</Text>
          <Text style={s.missionDescription}>{description}</Text>
          {mode === "intro" && (
            <View style={s.missionList}>
              <View style={s.missionRow}>
                <Text style={s.missionNumber}>1</Text>
                <Text style={s.missionRowText}>메시지 보내기</Text>
              </View>
              <View style={s.missionRow}>
                <Text style={s.missionNumber}>2</Text>
                <Text style={s.missionRowText}>앨범에서 사진 보내기</Text>
              </View>
            </View>
          )}
          <Pressable style={s.voiceReplay} onPress={() => speakChat(voice)}>
            <Text style={s.voiceReplayText}>🔊 설명 다시 듣기</Text>
          </Pressable>
          <Pressable style={s.missionButton} onPress={onClose}>
            <Text style={s.missionButtonText}>
              {mode === "intro"
                ? "미션 시작하기"
                : mode === "next"
                  ? "두 번째 미션 시작"
                  : "미션 계속하기"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function AlbumPicker({
  visible,
  selected,
  onSelect,
  onClose,
  onSend,
}: {
  visible: boolean;
  selected: number | null;
  onSelect: (value: number) => void;
  onClose: () => void;
  onSend: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={s.albumOverlay}>
        <Pressable style={s.albumDim} onPress={onClose} />
        <View style={s.albumSheet}>
          <View style={s.albumHandle} />
          <View style={s.albumHeader}>
            <Pressable
              accessibilityLabel="닫기"
              style={s.albumClose}
              onPress={onClose}
            >
              <CloseIcon />
            </Pressable>
            <Text style={s.albumTitle}>사진</Text>
            <Pressable
              style={[s.albumSend, selected === null && s.albumSendOff]}
              onPress={onSend}
            >
              <Text
                style={[
                  s.albumSendText,
                  selected === null && s.albumSendTextOff,
                ]}
              >
                전송
              </Text>
            </Pressable>
          </View>
          <Text style={s.albumGuide}>보낼 사진을 선택해 주세요</Text>
          <ScrollView
            style={s.albumPhotos}
            contentContainerStyle={s.grid}
            showsVerticalScrollIndicator={false}
          >
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <Pressable
                key={item}
                style={s.thumb}
                onPress={() => onSelect(item)}
              >
                <FakePhoto variant={item} />
                <View
                  style={[s.photoCheck, selected === item && s.photoCheckOn]}
                >
                  <Text style={s.photoCheckText}>
                    {selected === item ? "1" : ""}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
          <View style={s.albumFooter}>
            <View style={s.allPhotos}>
              <Text style={s.allPhotosIcon}>▦</Text>
              <Text style={s.allPhotosText}>전체</Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function FakePhoto({ variant }: { variant: number }) {
  if (variant === 0)
    return (
      <View style={[s.fakePhoto, s.cameraTile]}>
        <Text style={s.cameraLens}>●</Text>
        <View style={s.cameraBase} />
      </View>
    );
  if (variant === 1)
    return (
      <View style={[s.fakePhoto, s.screenTile]}>
        <View style={s.miniHeader} />
        <View style={s.miniCard} />
        <View style={s.miniRows} />
      </View>
    );
  if (variant === 2)
    return (
      <View style={[s.fakePhoto, s.chatTile]}>
        <View style={s.miniOther} />
        <View style={s.miniMine} />
        <View style={s.miniMineShort} />
      </View>
    );
  if (variant === 3)
    return (
      <View style={[s.fakePhoto, s.profileTile]}>
        <View style={s.miniAvatar} />
        <View style={s.miniProfileLine} />
      </View>
    );
  if (variant === 4)
    return (
      <View style={[s.fakePhoto, s.noteTile]}>
        <View style={s.noteLine} />
        <View style={s.noteLine} />
        <View style={s.noteShort} />
      </View>
    );
  return (
    <View style={[s.fakePhoto, s.qrTile]}>
      <View style={s.qrMini}>
        <Text style={s.qrText}>▦{`\n`}▥</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  missionShade: {
    flex: 1,
    padding: 24,
    backgroundColor: "rgba(0,0,0,.58)",
    alignItems: "center",
    justifyContent: "center",
  },
  missionCard: {
    width: "100%",
    maxWidth: 500,
    padding: 27,
    borderRadius: 22,
    backgroundColor: "white",
    alignItems: "center",
  },
  missionEmoji: { fontSize: 42 },
  missionTitle: {
    marginTop: 9,
    color: "#171717",
    fontSize: 23,
    fontWeight: "900",
    textAlign: "center",
  },
  missionDescription: {
    marginTop: 10,
    color: "#666",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  missionList: { width: "100%", marginTop: 20, gap: 9 },
  missionRow: {
    minHeight: 57,
    paddingHorizontal: 15,
    borderRadius: 13,
    backgroundColor: "#fffbe0",
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  missionNumber: {
    width: 31,
    height: 31,
    lineHeight: 31,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fee500",
    color: "#3c1e1e",
    fontWeight: "900",
    textAlign: "center",
  },
  missionRowText: { fontSize: 16, fontWeight: "800" },
  voiceReplay: { marginTop: 13, paddingVertical: 8, paddingHorizontal: 13 },
  voiceReplayText: { color: "#5d4700", fontSize: 14, fontWeight: "900" },
  missionButton: {
    width: "100%",
    marginTop: 8,
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#fee500",
    alignItems: "center",
  },
  missionButtonText: { color: "#3c1e1e", fontSize: 16, fontWeight: "900" },
  profile: { flex: 1, backgroundColor: "#8995a1" },
  profileTop: {
    height: 112,
    paddingHorizontal: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(226,236,245,.72)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.75)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeGlyph: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  closeLine: {
    position: "absolute",
    width: "100%",
    height: 3,
    borderRadius: 2,
    backgroundColor: "#26323c",
  },
  forward: { transform: [{ rotate: "45deg" }] },
  backward: { transform: [{ rotate: "-45deg" }] },
  profileTools: {
    width: 180,
    height: 56,
    paddingHorizontal: 22,
    borderRadius: 28,
    backgroundColor: "rgba(226,236,245,.72)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.75)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tool: { color: "#26323c", fontSize: 25, fontWeight: "800" },
  more: { color: "#26323c", fontSize: 22, fontWeight: "900", letterSpacing: 2 },
  profileBody: { flex: 1, paddingHorizontal: 38, paddingTop: "34%" },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "#9dbfe3",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLarge: { width: 116, height: 116, borderRadius: 38 },
  avatarHead: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: "#dceaf8",
    marginBottom: 2,
  },
  avatarHeadLarge: { width: 31, height: 31, borderRadius: 16, marginBottom: 5 },
  avatarBody: {
    width: 24,
    height: 11,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: "#dceaf8",
  },
  avatarBodyLarge: {
    width: 58,
    height: 28,
    borderTopLeftRadius: 29,
    borderTopRightRadius: 29,
  },
  profileName: {
    marginTop: 23,
    color: "white",
    fontSize: 38,
    fontWeight: "800",
  },
  profileActions: {
    height: 78,
    marginTop: 31,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,.72)",
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  action: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 11,
  },
  actionIcon: { color: "white", fontSize: 25 },
  actionText: { color: "white", fontSize: 19, fontWeight: "700" },
  divider: { width: 1, height: 42, backgroundColor: "rgba(255,255,255,.65)" },
  updates: {
    color: "rgba(255,255,255,.94)",
    fontSize: 18,
    textAlign: "center",
    marginTop: 120,
  },
  chat: { flex: 1, backgroundColor: "#b2c7d9" },
  chatHeader: {
    height: 70,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerSide: { width: 86 },
  back: { fontSize: 42, lineHeight: 45 },
  chatTitle: { alignItems: "center" },
  chatName: { fontSize: 18, fontWeight: "800" },
  people: { color: "#687681", fontSize: 11 },
  headerTools: { flexDirection: "row", justifyContent: "flex-end", gap: 18 },
  headerIcon: { fontSize: 23 },
  messages: { padding: 16, flexGrow: 1 },
  date: {
    alignSelf: "center",
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "rgba(85,105,122,.28)",
    marginBottom: 23,
  },
  dateText: { color: "white", fontSize: 11 },
  otherRow: { flexDirection: "row", gap: 9 },
  sender: { color: "#40505a", fontSize: 12, marginBottom: 5 },
  otherBubble: {
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 12,
    borderTopLeftRadius: 2,
    backgroundColor: "white",
  },
  bubbleText: { fontSize: 16, lineHeight: 22 },
  mineRow: {
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    marginTop: 11,
  },
  mineBubble: {
    maxWidth: 310,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 12,
    borderTopRightRadius: 2,
    backgroundColor: "#fee500",
  },
  time: { color: "#687986", fontSize: 10 },
  photoBubble: {
    alignSelf: "flex-end",
    width: 190,
    padding: 7,
    marginTop: 11,
    borderRadius: 12,
    backgroundColor: "white",
  },
  photoImage: {
    height: 120,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#91c8e9",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  sun: {
    position: "absolute",
    top: 15,
    right: 23,
    color: "#ffe879",
    fontSize: 24,
  },
  mountains: { color: "#668d67", fontSize: 51, letterSpacing: -11 },
  photoCaption: { color: "#777", fontSize: 11, padding: 7 },
  composer: {
    minHeight: 64,
    padding: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "white",
  },
  plusButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  plus: { color: "#777", fontSize: 32 },
  inputShell: {
    flex: 1,
    minHeight: 43,
    paddingLeft: 15,
    paddingRight: 10,
    borderWidth: 1,
    borderColor: "#e4e4e4",
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
  input: { flex: 1, height: 42, fontSize: 15 },
  smile: { color: "#888", fontSize: 22 },
  send: {
    height: 42,
    paddingHorizontal: 15,
    borderRadius: 7,
    backgroundColor: "#fee500",
    alignItems: "center",
    justifyContent: "center",
  },
  sendOff: { backgroundColor: "#f2f2f2" },
  sendText: { color: "#332800", fontWeight: "800" },
  panel: {
    height: 150,
    paddingHorizontal: 18,
    paddingTop: 18,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#f7f7f7",
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  attachment: { alignItems: "center", gap: 7 },
  attachmentCircle: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e6e6e6",
    alignItems: "center",
    justifyContent: "center",
  },
  attachmentIcon: { color: "#555", fontSize: 25 },
  attachmentText: { color: "#555", fontSize: 12 },
  disabled: { opacity: 0.35 },
  albumOverlay: { flex: 1, justifyContent: "flex-end" },
  albumDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(121,151,176,.68)",
  },
  albumSheet: {
    width: "100%",
    height: "58%",
    paddingTop: 8,
    backgroundColor: "white",
    borderTopLeftRadius: 23,
    borderTopRightRadius: 23,
    overflow: "hidden",
  },
  albumHandle: {
    alignSelf: "center",
    width: 86,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#aaa",
    marginBottom: 5,
  },
  albumHeader: {
    height: 70,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  albumClose: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ scale: 0.78 }],
  },
  albumTitle: { fontSize: 22, fontWeight: "900" },
  albumSend: {
    minWidth: 68,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: "#fee500",
    alignItems: "center",
  },
  albumSendOff: { backgroundColor: "#f0f0f0" },
  albumSendText: { color: "#3c1e1e", fontSize: 16, fontWeight: "900" },
  albumSendTextOff: { color: "#999" },
  albumGuide: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    color: "#777",
    fontSize: 13,
  },
  albumPhotos: { flex: 1 },
  grid: { flexDirection: "row", flexWrap: "wrap", backgroundColor: "#fff" },
  thumb: {
    width: "33.3333%",
    aspectRatio: 1,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "white",
  },
  fakePhoto: { flex: 1, alignItems: "center", justifyContent: "center" },
  photoCheck: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "white",
    backgroundColor: "rgba(0,0,0,.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  photoCheckOn: { backgroundColor: "#fee500", borderColor: "#3c1e1e" },
  photoCheckText: { color: "#3c1e1e", fontWeight: "900" },
  cameraTile: { backgroundColor: "#969696" },
  cameraLens: { color: "white", fontSize: 42 },
  cameraBase: {
    position: "absolute",
    width: 72,
    height: 50,
    borderWidth: 7,
    borderColor: "white",
    borderRadius: 12,
  },
  screenTile: { backgroundColor: "#f8f8f8", padding: 15 },
  miniHeader: {
    width: "90%",
    height: 15,
    backgroundColor: "#d8d8d8",
    marginBottom: 11,
  },
  miniCard: {
    width: "90%",
    height: 37,
    borderRadius: 5,
    backgroundColor: "#fee500",
  },
  miniRows: {
    width: "90%",
    height: 55,
    marginTop: 9,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderColor: "#ddd",
  },
  chatTile: { backgroundColor: "#b2c7d9", alignItems: "stretch", padding: 17 },
  miniOther: {
    width: "48%",
    height: 22,
    borderRadius: 8,
    backgroundColor: "white",
  },
  miniMine: {
    alignSelf: "flex-end",
    width: "62%",
    height: 22,
    borderRadius: 8,
    backgroundColor: "#fee500",
    marginTop: 12,
  },
  miniMineShort: {
    alignSelf: "flex-end",
    width: "43%",
    height: 22,
    borderRadius: 8,
    backgroundColor: "#fee500",
    marginTop: 8,
  },
  profileTile: { backgroundColor: "#8995a1" },
  miniAvatar: {
    width: 56,
    height: 56,
    borderRadius: 19,
    backgroundColor: "#9dbfe3",
  },
  miniProfileLine: {
    width: 90,
    height: 13,
    borderRadius: 7,
    backgroundColor: "white",
    marginTop: 15,
  },
  noteTile: { backgroundColor: "#fffdf1", paddingHorizontal: 25 },
  noteLine: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    backgroundColor: "#d1cbb2",
    marginVertical: 6,
  },
  noteShort: {
    width: "65%",
    height: 8,
    borderRadius: 4,
    backgroundColor: "#d1cbb2",
    marginVertical: 6,
  },
  qrTile: { backgroundColor: "#c9f1ea" },
  qrMini: {
    width: 82,
    height: 82,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  qrText: { fontSize: 28, lineHeight: 29, fontWeight: "900" },
  albumFooter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "flex-start",
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  allPhotos: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 25,
    backgroundColor: "white",
    flexDirection: "row",
    gap: 9,
    elevation: 5,
  },
  allPhotosIcon: { fontSize: 20 },
  allPhotosText: { fontSize: 16, fontWeight: "800" },
});

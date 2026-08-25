import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { FriendTab } from "../components/FriendTab";
import { MissionComplete, MissionGuide } from "../components/MissionGuide";
import * as Speech from "expo-speech";

function speakBlock(message: string) {
  void Speech.stop();
  Speech.speak(message, { language: "ko-KR", rate: 0.88, pitch: 1 });
}

export function BlockFriendScreen({ onBack }: { onBack: () => void }) {
  const [profile, setProfile] = useState(false);
  const [menu, setMenu] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [intro, setIntro] = useState(true);
  const [wrong, setWrong] = useState(false);

  useEffect(() => {
    if (intro || wrong) return;
    if (confirm)
      speakBlock(
        "홍길동님을 차단하시겠어요? 내용을 확인한 뒤 차단 버튼을 눌러 주세요.",
      );
    else if (menu)
      speakBlock("더보기 메뉴가 열렸습니다. 차단 항목을 눌러 주세요.");
    else if (profile)
      speakBlock(
        "홍길동의 프로필입니다. 오른쪽 위 점 세 개 더보기 버튼을 눌러 주세요.",
      );
  }, [confirm, intro, menu, profile, wrong]);
  useEffect(
    () => () => {
      void Speech.stop();
    },
    [],
  );

  const restart = () => {
    setProfile(false);
    setMenu(false);
    setConfirm(false);
    setCompleted(false);
    setIntro(true);
    setWrong(false);
  };
  const wrongMission = () => setWrong(true);
  const blockFriend = () => {
    setConfirm(false);
    setMenu(false);
    setProfile(false);
    setCompleted(true);
  };

  if (!profile)
    return (
      <SafeAreaView style={s.fill}>
        <FriendTab
          target="friend"
          friendAdded
          onBack={onBack}
          onAdd={wrongMission}
          onFriend={() => setProfile(true)}
          onSettings={wrongMission}
        />
        <MissionGuide
          title="홍길동을 차단하세요"
          description="홍길동의 프로필을 열고 오른쪽 위 ••• 메뉴에서 차단을 선택하세요."
        />
        <BlockIntroModal visible={intro} onClose={() => setIntro(false)} />
        <BlockWrongModal visible={wrong} onClose={() => setWrong(false)} />
        <MissionComplete
          visible={completed}
          title="친구 차단"
          onRestart={restart}
          onExit={onBack}
        />
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={s.profile}>
      <View style={s.profileTop}>
        <Pressable
          accessibilityLabel="닫기"
          style={s.closeButton}
          onPress={() => {
            setMenu(false);
            setProfile(false);
          }}
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
          <Pressable
            accessibilityLabel="더보기"
            style={menu && s.moreActive}
            onPress={() => setMenu((value) => !value)}
          >
            <Text style={s.more}>•••</Text>
          </Pressable>
        </View>
      </View>

      <View style={s.profileBody}>
        <Avatar />
        <Text style={s.name}>홍길동</Text>
        <View style={s.actions}>
          <Pressable style={s.action} onPress={wrongMission}>
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

      {menu && (
        <Pressable style={s.menuBackdrop} onPress={() => setMenu(false)} />
      )}
      {menu && (
        <View style={s.menuCard}>
          <MenuRow icon="★" label="즐겨찾기에 추가" onPress={wrongMission} />
          <MenuRow icon="✎" label="이름 변경" onPress={wrongMission} />
          <MenuRow icon="⊘" label="숨김" onPress={wrongMission} />
          <Pressable
            style={[s.menuRow, s.blockRow]}
            onPress={() => setConfirm(true)}
          >
            <Text style={s.menuIcon}>⊗</Text>
            <Text style={s.blockText}>차단</Text>
          </Pressable>
          <MenuRow icon="!" label="신고" danger onPress={wrongMission} />
        </View>
      )}

      <Modal
        visible={confirm}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirm(false)}
      >
        <View style={s.modalShade}>
          <View style={s.confirmCard}>
            <Text style={s.confirmTitle}>홍길동님을 차단하시겠어요?</Text>
            <Text style={s.confirmDescription}>
              차단하면 메시지를 받을 수 없고{`\n`}친구 목록에서도 삭제됩니다.
            </Text>
            <Pressable
              style={s.replay}
              onPress={() =>
                speakBlock(
                  "홍길동님을 차단하시겠어요? 차단하면 메시지를 받을 수 없고 친구 목록에서도 삭제됩니다.",
                )
              }
            >
              <Text style={s.replayText}>🔊 설명 다시 듣기</Text>
            </Pressable>
            <View style={s.confirmButtons}>
              <Pressable
                style={s.cancelButton}
                onPress={() => setConfirm(false)}
              >
                <Text style={s.cancelText}>취소</Text>
              </Pressable>
              <Pressable style={s.blockButton} onPress={blockFriend}>
                <Text style={s.blockButtonText}>차단</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <BlockWrongModal visible={wrong} onClose={() => setWrong(false)} />
    </SafeAreaView>
  );
}

function BlockIntroModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const voice =
    "상대방 차단하기 미션입니다. 홍길동의 프로필을 열고, 오른쪽 위 점 세 개 더보기 버튼을 누른 뒤 차단을 선택해 주세요.";
  useEffect(() => {
    if (visible) speakBlock(voice);
  }, [visible]);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={s.modalShade}>
        <View style={s.introCard}>
          <Text style={s.introEmoji}>🛡️</Text>
          <Text style={s.introTitle}>상대방 차단하기</Text>
          <Text style={s.introDescription}>
            홍길동 프로필 → ••• 더보기 → 차단 순서로 진행하세요.
          </Text>
          <Pressable style={s.replay} onPress={() => speakBlock(voice)}>
            <Text style={s.replayText}>🔊 설명 다시 듣기</Text>
          </Pressable>
          <Pressable style={s.introButton} onPress={onClose}>
            <Text style={s.introButtonText}>미션 시작하기</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
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
function Avatar() {
  return (
    <View style={s.avatar}>
      <View style={s.avatarHead} />
      <View style={s.avatarBody} />
    </View>
  );
}
function MenuRow({
  icon,
  label,
  danger = false,
  onPress,
}: {
  icon: string;
  label: string;
  danger?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable style={s.menuRow} onPress={onPress}>
      <Text style={[s.menuIcon, danger && s.danger]}>{icon}</Text>
      <Text style={[s.menuText, danger && s.danger]}>{label}</Text>
    </Pressable>
  );
}

function BlockWrongModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const voice =
    "현재는 상대방 차단하기 미션입니다. 홍길동의 프로필에서 오른쪽 위 점 세 개 더보기 버튼을 누르고 차단을 선택해 주세요.";
  useEffect(() => {
    if (visible) speakBlock(voice);
  }, [visible]);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={s.modalShade}>
        <View style={s.introCard}>
          <Text style={s.introEmoji}>☝️</Text>
          <Text style={s.introTitle}>현재 미션을 먼저 진행해 주세요</Text>
          <Text style={s.introDescription}>
            지금은 홍길동을 차단하는 미션입니다.{`\n`}프로필의 ••• 메뉴에서
            차단을 선택하세요.
          </Text>
          <Pressable style={s.replay} onPress={() => speakBlock(voice)}>
            <Text style={s.replayText}>🔊 설명 다시 듣기</Text>
          </Pressable>
          <Pressable style={s.introButton} onPress={onClose}>
            <Text style={s.introButtonText}>미션 계속하기</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  profile: { flex: 1, backgroundColor: "#8995a1" },
  profileTop: {
    height: 112,
    paddingHorizontal: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 5,
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
    paddingHorizontal: 20,
    borderRadius: 28,
    backgroundColor: "rgba(226,236,245,.72)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.75)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tool: { color: "#26323c", fontSize: 25, fontWeight: "800" },
  more: {
    color: "#26323c",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 2,
    padding: 5,
  },
  moreActive: { borderRadius: 14, backgroundColor: "rgba(255,229,0,.9)" },
  profileBody: { flex: 1, paddingHorizontal: 38, paddingTop: "34%" },
  avatar: {
    width: 116,
    height: 116,
    borderRadius: 38,
    backgroundColor: "#9dbfe3",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarHead: {
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: "#dceaf8",
    marginBottom: 5,
  },
  avatarBody: {
    width: 58,
    height: 28,
    borderTopLeftRadius: 29,
    borderTopRightRadius: 29,
    backgroundColor: "#dceaf8",
  },
  name: { marginTop: 23, color: "white", fontSize: 38, fontWeight: "800" },
  actions: {
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
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 6,
    backgroundColor: "rgba(0,0,0,.12)",
  },
  menuCard: {
    position: "absolute",
    zIndex: 7,
    top: 91,
    right: 28,
    width: 285,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 12,
  },
  menuRow: {
    minHeight: 56,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  menuIcon: { width: 28, color: "#333", fontSize: 21, textAlign: "center" },
  menuText: { color: "#222", fontSize: 17, fontWeight: "600" },
  blockRow: { backgroundColor: "#fff8d5" },
  blockText: { color: "#222", fontSize: 17, fontWeight: "900" },
  danger: { color: "#d84b42" },
  modalShade: {
    flex: 1,
    padding: 24,
    backgroundColor: "rgba(0,0,0,.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmCard: {
    width: "100%",
    maxWidth: 470,
    paddingTop: 28,
    paddingHorizontal: 25,
    paddingBottom: 18,
    borderRadius: 20,
    backgroundColor: "white",
    alignItems: "center",
  },
  confirmTitle: {
    color: "#111",
    fontSize: 21,
    fontWeight: "900",
    textAlign: "center",
  },
  confirmDescription: {
    marginTop: 12,
    color: "#666",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  confirmButtons: {
    width: "100%",
    marginTop: 25,
    flexDirection: "row",
    gap: 9,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#f1f1f1",
    alignItems: "center",
  },
  cancelText: { color: "#444", fontSize: 16, fontWeight: "800" },
  blockButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#fee500",
    alignItems: "center",
  },
  blockButtonText: { color: "#3c1e1e", fontSize: 16, fontWeight: "900" },
  introCard: {
    width: "100%",
    maxWidth: 500,
    padding: 28,
    borderRadius: 22,
    backgroundColor: "white",
    alignItems: "center",
  },
  introEmoji: { fontSize: 43 },
  introTitle: { marginTop: 9, fontSize: 24, fontWeight: "900" },
  introDescription: {
    marginTop: 11,
    color: "#666",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  replay: { marginTop: 14, paddingVertical: 8, paddingHorizontal: 13 },
  replayText: { color: "#5d4700", fontSize: 14, fontWeight: "900" },
  introButton: {
    width: "100%",
    marginTop: 9,
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#fee500",
    alignItems: "center",
  },
  introButtonText: { color: "#3c1e1e", fontSize: 16, fontWeight: "900" },
});

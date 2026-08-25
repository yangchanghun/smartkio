import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { FriendTab } from "../components/FriendTab";
export function ConversationScreen({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<"home" | "profile" | "chat">("home"),
    [panel, setPanel] = useState(false),
    [photo, setPhoto] = useState(false),
    [text, setText] = useState(""),
    [sent, setSent] = useState<string[]>([]);
  const send = () => {
    if (text.trim()) {
      setSent((x) => [...x, text]);
      setText("");
    }
  };
  if (view === "home")
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <FriendTab
          target="friend"
          friendAdded
          onAdd={() => {}}
          onFriend={() => setView("profile")}
          onSettings={() => {}}
        />
      </SafeAreaView>
    );
  if (view === "profile")
    return (
      <SafeAreaView style={s.profilePage}>
        <View style={s.profileTop}>
          <Pressable onPress={() => setView("home")}>
            <Text style={s.close}>×</Text>
          </Pressable>
          <Text style={s.more}>♡ ₩ •••</Text>
        </View>
        <View style={s.profileBody}>
          <View style={s.bigAvatar}>
            <Text>👤</Text>
          </View>
          <Text style={s.profileName}>홍길동</Text>
          <View style={s.profileButtons}>
            <Pressable onPress={() => setView("chat")}>
              <Text style={s.profileButton}>◯ 1:1 채팅</Text>
            </Pressable>
            <Text style={s.divider}>│</Text>
            <Text style={s.profileButton}>☎ 통화</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  return (
    <SafeAreaView style={s.chatPage}>
      <View style={s.chatHeader}>
        <Pressable onPress={() => setView("profile")}>
          <Text style={s.back}>‹ 3</Text>
        </Pressable>
        <Text style={s.chatName}>홍길동</Text>
        <Text style={s.tools}>⌕ ☎ ☰</Text>
      </View>
      <View style={s.messages}>
        <Text style={s.other}>안녕하세요!</Text>
        {sent.map((message, index) => (
          <Text key={index} style={s.mine}>
            {message}
          </Text>
        ))}
        {photo && (
          <View style={s.photoBubble}>
            <Text style={{ fontSize: 34 }}>🌄</Text>
            <Text>사진</Text>
          </View>
        )}
      </View>
      <View style={s.composer}>
        <Pressable style={s.round} onPress={() => setPanel(!panel)}>
          <Text style={s.plus}>{panel ? "×" : "＋"}</Text>
        </Pressable>
        <TextInput
          style={s.messageInput}
          value={text}
          onChangeText={setText}
          placeholder="메시지 입력"
        />
        <Pressable style={s.send} onPress={send}>
          <Text style={s.sendText}>전송</Text>
        </Pressable>
      </View>
      {panel && (
        <View style={s.panel}>
          <Pressable
            style={s.panelItem}
            onPress={() => {
              setPhoto(true);
              setPanel(false);
            }}
          >
            <Text style={s.panelIcon}>▣</Text>
            <Text>사진</Text>
          </Pressable>
          <View style={s.panelItem}>
            <Text style={s.panelIcon}>◉</Text>
            <Text>카메라</Text>
          </View>
          <View style={s.panelItem}>
            <Text style={s.panelIcon}>♡</Text>
            <Text>선물하기</Text>
          </View>
          <View style={s.panelItem}>
            <Text style={s.panelIcon}>●</Text>
            <Text>지도</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  profilePage: { flex: 1, backgroundColor: "#8795a2" },
  profileTop: {
    height: 100,
    padding: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  close: { fontSize: 46, color: "white" },
  more: { fontSize: 26, color: "white" },
  profileBody: { flex: 1, justifyContent: "flex-end", padding: 40 },
  bigAvatar: {
    width: 150,
    height: 150,
    borderRadius: 48,
    backgroundColor: "#a6c2ec",
    alignItems: "center",
    justifyContent: "center",
  },
  profileName: {
    fontSize: 40,
    fontWeight: "900",
    color: "white",
    marginTop: 25,
  },
  profileButtons: {
    borderWidth: 2,
    borderColor: "#d8e1e8",
    borderRadius: 19,
    marginTop: 42,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  profileButton: { fontSize: 20, fontWeight: "800", color: "white" },
  divider: { color: "white" },
  chatPage: { flex: 1, backgroundColor: "#adc2d2" },
  chatHeader: {
    height: 70,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 22,
  },
  back: { fontSize: 23, fontWeight: "800" },
  chatName: { fontSize: 22, fontWeight: "900" },
  tools: { fontSize: 21 },
  messages: { flex: 1, padding: 20 },
  other: {
    alignSelf: "flex-start",
    backgroundColor: "white",
    padding: 13,
    borderRadius: 15,
    fontSize: 18,
  },
  mine: {
    alignSelf: "flex-end",
    backgroundColor: "#fee500",
    padding: 13,
    borderRadius: 15,
    fontSize: 18,
    marginTop: 12,
  },
  photoBubble: {
    alignSelf: "flex-end",
    alignItems: "center",
    backgroundColor: "white",
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  composer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 9,
    backgroundColor: "#d8e5f0",
  },
  round: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  plus: { fontSize: 34 },
  messageInput: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 16,
  },
  send: { backgroundColor: "#fee500", borderRadius: 20, padding: 13 },
  sendText: { fontWeight: "900" },
  panel: {
    backgroundColor: "white",
    height: 190,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 28,
  },
  panelItem: { alignItems: "center", gap: 8 },
  panelIcon: { fontSize: 34 },
});

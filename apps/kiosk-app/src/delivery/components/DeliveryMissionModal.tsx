import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

export function DeliveryMissionModal({
  visible,
  title,
  description,
  onConfirm,
}: {
  visible: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={s.backdrop}>
        <View style={s.card}>
          <View style={s.badge}><Text style={s.badgeText}>오늘의 미션</Text></View>
          <Text style={s.title}>{title}</Text>
          <Text style={s.description}>{description}</Text>
          <Pressable style={s.button} onPress={onConfirm}>
            <Text style={s.buttonText}>연습 시작하기</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,.52)", alignItems: "center", justifyContent: "center", padding: 24 },
  card: { width: "100%", maxWidth: 460, borderRadius: 26, backgroundColor: "white", padding: 26, elevation: 10 },
  badge: { alignSelf: "flex-start", borderRadius: 20, backgroundColor: "#e1fbf7", paddingHorizontal: 12, paddingVertical: 7 },
  badgeText: { color: "#008c83", fontWeight: "900", fontSize: 14 },
  title: { marginTop: 17, fontSize: 26, fontWeight: "900", color: "#171717" },
  description: { marginTop: 10, fontSize: 17, lineHeight: 26, color: "#555" },
  button: { marginTop: 24, borderRadius: 16, backgroundColor: "#11d8c7", alignItems: "center", paddingVertical: 17 },
  buttonText: { fontSize: 18, fontWeight: "900", color: "#10201f" },
});


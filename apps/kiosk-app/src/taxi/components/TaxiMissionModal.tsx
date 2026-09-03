import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

export function TaxiMissionModal({
  visible,
  title,
  message,
  onClose,
}: {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <View style={s.card}>
          <Text style={s.badge}>카카오 T 연습</Text>
          <Text style={s.title}>{title}</Text>
          <Text style={s.message}>{message}</Text>
          <Pressable
            style={s.button}
            onPress={onClose}
            accessibilityRole="button"
          >
            <Text style={s.buttonText}>연습 시작</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,.48)",
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },
  card: {
    width: "100%",
    maxWidth: 520,
    borderRadius: 24,
    backgroundColor: "white",
    padding: 26,
    elevation: 12,
  },
  badge: {
    alignSelf: "flex-start",
    color: "#e32636",
    backgroundColor: "#fff0f1",
    borderRadius: 12,
    paddingHorizontal: 11,
    paddingVertical: 6,
    fontSize: 13,
    fontWeight: "900",
  },
  title: { marginTop: 16, fontSize: 25, fontWeight: "900", color: "#20252d" },
  message: { marginTop: 10, fontSize: 17, lineHeight: 26, color: "#5f6670" },
  button: {
    marginTop: 24,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#fee500",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { fontSize: 18, fontWeight: "900", color: "#202124" },
});

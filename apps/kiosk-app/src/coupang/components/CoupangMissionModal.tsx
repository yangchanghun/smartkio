import { useEffect } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import * as Speech from "expo-speech";

export function CoupangMissionModal({
  visible,
  step,
  instruction,
  onClose,
}: {
  visible: boolean;
  step: number;
  instruction: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!visible) return;
    Speech.stop();
    Speech.speak(`미션 ${step}. ${instruction}`, {
      language: "ko-KR",
      rate: 0.88,
      pitch: 1,
    });
    return () => {
      Speech.stop();
    };
  }, [instruction, step, visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card} accessibilityViewIsModal>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>MISSION {step}</Text>
          </View>
          <Text style={styles.title}>쿠팡 연습 미션</Text>
          <Text style={styles.instruction}>{instruction}</Text>
          <Text style={styles.note}>실제 가입이나 결제는 진행되지 않아요.</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="미션 시작하기"
            style={styles.button}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>시작하기</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 560,
    borderRadius: 26,
    backgroundColor: "white",
    padding: 30,
    alignItems: "center",
    elevation: 14,
  },
  badge: { backgroundColor: "#e9f1ff", borderRadius: 999, paddingHorizontal: 18, paddingVertical: 9 },
  badgeText: { color: "#2875e8", fontSize: 17, fontWeight: "900" },
  title: { marginTop: 18, fontSize: 28, fontWeight: "900", color: "#172033" },
  instruction: { marginTop: 17, fontSize: 23, lineHeight: 34, fontWeight: "700", textAlign: "center", color: "#222" },
  note: { marginTop: 18, fontSize: 15, color: "#7a8290" },
  button: { marginTop: 25, width: "100%", minHeight: 64, borderRadius: 10, backgroundColor: "#3478eb", alignItems: "center", justifyContent: "center" },
  buttonText: { color: "white", fontSize: 21, fontWeight: "900" },
});

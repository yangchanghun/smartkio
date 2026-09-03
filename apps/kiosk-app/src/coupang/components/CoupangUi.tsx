import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export function CoupangLogo() {
  return (
    <View style={styles.logo} accessibilityLabel="쿠팡">
      <Text style={[styles.logoText, { color: "#e85b20" }]}>cou</Text>
      <Text style={[styles.logoText, { color: "#f19b22" }]}>p</Text>
      <Text style={[styles.logoText, { color: "#66b849" }]}>a</Text>
      <Text style={[styles.logoText, { color: "#43bdad" }]}>n</Text>
      <Text style={[styles.logoText, { color: "#447ee9" }]}>g</Text>
    </View>
  );
}

export function SignupProgress({ step }: { step: 1 | 2 }) {
  return (
    <View style={styles.progress}>
      <View style={styles.progressItem}>
        <View style={styles.stepCircle}><Text style={styles.stepText}>{step === 1 ? "1" : "✓"}</Text></View>
        <Text style={styles.progressLabel}>동의하기</Text>
      </View>
      <View style={styles.line} />
      <View style={styles.progressItem}>
        <View style={[styles.stepCircle, step === 1 && styles.stepInactive]}><Text style={[styles.stepText, step === 1 && styles.stepTextInactive]}>2</Text></View>
        <Text style={styles.progressLabel}>정보 입력하기</Text>
      </View>
    </View>
  );
}

export function PrimaryButton({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled} onPress={onPress} style={[styles.primary, disabled ? styles.disabled : undefined]}>
      <Text style={styles.primaryText}>{label}</Text>
    </Pressable>
  );
}

export function SummaryRow({ icon, value }: { icon: string; value: string }) {
  return (
    <View style={styles.summary}><Text style={styles.summaryIcon}>{icon}</Text><Text style={styles.summaryText}>{value}</Text></View>
  );
}

export function FormSection({ children }: { children: ReactNode }) {
  return <View style={styles.form}>{children}</View>;
}

const styles = StyleSheet.create({
  logo: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  logoText: { fontSize: 38, fontWeight: "900", letterSpacing: -2 },
  progress: { flexDirection: "row", justifyContent: "center", alignItems: "flex-start", marginBottom: 36 },
  progressItem: { alignItems: "center", minWidth: 110 },
  stepCircle: { width: 58, height: 40, borderRadius: 22, backgroundColor: "#2f7de9", alignItems: "center", justifyContent: "center" },
  stepInactive: { backgroundColor: "#edf0f4", borderWidth: 1, borderColor: "#dfe3e9" },
  stepText: { color: "white", fontSize: 18, fontWeight: "900" },
  stepTextInactive: { color: "#939aa6" },
  progressLabel: { marginTop: 11, color: "#1d2738", fontSize: 18, fontWeight: "800" },
  line: { width: 62, height: 2, marginTop: 20, backgroundColor: "#d9dde4" },
  primary: { minHeight: 64, width: "100%", borderRadius: 9, backgroundColor: "#3478eb", alignItems: "center", justifyContent: "center", elevation: 2 },
  disabled: { backgroundColor: "#b9c7dc", elevation: 0 },
  primaryText: { color: "white", fontSize: 20, fontWeight: "900" },
  summary: { minHeight: 60, borderWidth: 1, borderColor: "#d8dbe0", backgroundColor: "#fafafa", borderRadius: 8, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", marginTop: 13 },
  summaryIcon: { marginRight: 12, fontSize: 18 },
  summaryText: { fontSize: 18, color: "#303743", flex: 1 },
  form: { flex: 1, width: "100%", maxWidth: 820, alignSelf: "center" },
});

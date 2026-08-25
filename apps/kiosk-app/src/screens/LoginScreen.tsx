import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { kioskLogin, Session } from "../hooks/useKioskSession";
export function LoginScreen({
  onLogin,
}: {
  onLogin: (s: Session) => Promise<void>;
}) {
  const [u, setU] = useState("sp1"),
    [p, setP] = useState("1234"),
    [e, setE] = useState("");
  const submit = async () => {
    try {
      setE("");
      await onLogin(await kioskLogin(u, p));
    } catch (x) {
      setE(x instanceof Error ? x.message : "네트워크 오류");
    }
  };
  return (
    <SafeAreaView style={s.page}>
      <View style={s.card}>
        <Text style={s.logo}>SmartKio</Text>
        <Text style={s.title}>연습을 시작해 볼까요?</Text>
        <Text style={s.desc}>부여받은 아이디와 비밀번호로 로그인하세요.</Text>
        <TextInput
          style={s.input}
          value={u}
          onChangeText={setU}
          placeholder="아이디"
        />
        <TextInput
          style={s.input}
          value={p}
          onChangeText={setP}
          placeholder="비밀번호"
          secureTextEntry
        />
        <Pressable style={s.btn} onPress={submit}>
          <Text style={s.btnText}>로그인</Text>
        </Pressable>
        <Text style={s.error}>{e || "예시 계정 sp1 / 1234"}</Text>
      </View>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff8e8",
  },
  card: {
    width: "86%",
    padding: 34,
    backgroundColor: "white",
    borderRadius: 28,
    elevation: 3,
  },
  logo: { fontSize: 30, fontWeight: "900", color: "#3c1e1e" },
  title: { fontSize: 27, fontWeight: "800", marginTop: 20 },
  desc: { color: "#746861", marginVertical: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    marginTop: 9,
    fontSize: 16,
  },
  btn: {
    backgroundColor: "#fee500",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 18,
  },
  btnText: { fontWeight: "900", fontSize: 17, color: "#3c1e1e" },
  error: { marginTop: 14, color: "#766d65" },
});

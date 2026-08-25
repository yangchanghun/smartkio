import { Pressable, StyleSheet, Text, View } from "react-native";

const tabs = [
  ["⌂", "홈"],
  ["▣", "장보기·쇼핑"],
  ["♡", "찜"],
  ["▤", "주문내역"],
  ["☺", "마이배민"],
] as const;

export function DeliveryBottomNav({ onWrongPress }: { onWrongPress: () => void }) {
  return (
    <View style={s.wrap}>
      {tabs.map(([icon, label], index) => (
        <Pressable key={label} style={[s.tab, index === 0 && s.selected]} onPress={index === 0 ? undefined : onWrongPress}>
          <Text style={s.icon}>{icon}</Text>
          <Text style={[s.label, index === 0 && s.labelSelected]}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flexDirection: "row", marginHorizontal: 12, marginBottom: 8, borderRadius: 28, backgroundColor: "rgba(255,255,255,.96)", padding: 7, elevation: 9 },
  tab: { flex: 1, minHeight: 58, alignItems: "center", justifyContent: "center", borderRadius: 22 },
  selected: { backgroundColor: "#edf7f6" },
  icon: { fontSize: 24, fontWeight: "900" },
  label: { marginTop: 2, fontSize: 11, color: "#333" },
  labelSelected: { fontWeight: "900" },
});


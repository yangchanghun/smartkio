import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { PassengerCounts } from "./KtxPolishedViews";
import { TrainOption } from "../data/railData";

type Props = {
  from: string;
  to: string;
  dateText: string;
  train: TrainOption;
  car: number;
  seats: string[];
  passengers: PassengerCounts;
  onBack: () => void;
  onPay: () => void;
  onWrong: () => void;
};

export function KtxPaymentView({
  from,
  to,
  dateText,
  train,
  car,
  seats,
  passengers,
  onBack,
  onPay,
  onWrong,
}: Props) {
  const [agreed, setAgreed] = useState(false);
  const [seconds, setSeconds] = useState(599);
  useEffect(() => {
    const timer = setInterval(
      () => setSeconds((v) => Math.max(0, v - 1)),
      1000,
    );
    return () => clearInterval(timer);
  }, []);
  const passengerCount = Object.values(passengers).reduce((a, b) => a + b, 0);
  const fareUnits =
    passengers.adult +
    passengers.child * 0.5 +
    passengers.infant * 0.25 +
    passengers.senior * 0.7 +
    passengers.severe * 0.5 +
    passengers.mild * 0.7;
  const total = useMemo(
    () => Math.round((train.standardPrice * fareUnits) / 100) * 100,
    [train.standardPrice, fareUnits],
  );
  const timer = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  return (
    <View style={x.page}>
      <View style={x.header}>
        <Text style={x.title}>결제</Text>
        <Pressable onPress={onBack}>
          <Text style={x.close}>×</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={x.content}>
        <View style={x.timer}>
          <Text style={x.timerRed}>{timer}</Text>
          <Text style={x.timerText}>
            {" "}
            이내 결제하지 않으면 예약이 취소돼요.
          </Text>
        </View>
        <Text style={x.sectionTitle}>
          결제할 티켓 <Text style={x.blue}>1</Text>
        </Text>
        <View style={x.ticket}>
          <View style={x.ticketTop}>
            <Text style={x.ticketTopText}>{dateText}</Text>
            <Text style={x.ticketTopText}>결제 전</Text>
          </View>
          <View style={x.route}>
            <View>
              <Text style={x.station}>{from}</Text>
              <Text style={x.time}>{train.departure}</Text>
            </View>
            <Text style={x.arrow}>→</Text>
            <View>
              <Text style={x.station}>{to}</Text>
              <Text style={x.time}>{train.arrival}</Text>
            </View>
          </View>
          <Text style={x.train}>
            <Text style={x.badge}>KTX-산천</Text>　
            {train.id.replace("KTX-", "")}
          </Text>
          <View style={x.seatInfo}>
            <Text style={x.seatStrong}>
              {car}호차 <Text style={x.gray}>(일반실)</Text>
            </Text>
            <Text style={x.seatStrong}>{seats.join(", ")}</Text>
          </View>
          <View style={x.ticketLine}>
            <Text style={x.lineTitle}>대상자 할인</Text>
            <Text style={x.lineLink}>할인 적용 ›</Text>
          </View>
          <Text style={x.hint}>● 인원별 추가 할인을 적용해보세요.</Text>
          <View style={x.divider} />
          <View style={x.ticketLine}>
            <Text style={x.lineTitle}>
              쿠폰　<Text style={x.coupon}>보유 0</Text>
            </Text>
            <Text style={x.lineLink}>쿠폰 적용 ›</Text>
          </View>
        </View>
        <Text style={x.sectionTitle}>포인트 사용</Text>
        <View style={x.promo}>
          <Text style={x.promoTag}>혜택</Text>
          <Text style={x.promoText}>결제 프로모션 자세히 보기　›</Text>
        </View>
        <Text style={x.sectionTitle}>결제 수단</Text>
        <View style={x.methods}>
          <View style={x.method}>
            <View style={x.radioOn}>
              <View style={x.radioDot} />
            </View>
            <Text style={x.toss}>●</Text>
            <View>
              <Text style={x.methodName}>토스페이</Text>
              <Text style={x.auto}>자동 등록된 교육용 결제수단</Text>
            </View>
            <Text style={x.benefit}>혜택</Text>
          </View>
          {["Npay(머니)", "카카오페이", "간편 결제", "카드 결제"].map(
            (name) => (
              <Pressable key={name} style={x.method} onPress={onWrong}>
                <View style={x.radio} />
                <Text style={x.methodName}>{name}</Text>
              </Pressable>
            ),
          )}
        </View>
        <Text style={x.sectionTitle}>결제 금액</Text>
        <View style={x.amount}>
          <Row
            label={`운임 (${passengerCount}명)`}
            value={`${total.toLocaleString()}원`}
          />
          <Row label="요금" value="0원" />
          <Row label="운임 할인" value="0원" />
          <Row label="포인트 사용" value="0원" />
          <View style={x.divider} />
          <Row
            label="최종 결제 금액"
            value={`${total.toLocaleString()}원`}
            strong
          />
        </View>
        <Text style={x.sectionTitle}>이용 안내 및 반환 규정</Text>
        <View style={x.rules}>
          <Text style={x.rule}>승차권 환불(반환) 위약금　›</Text>
          <Text style={x.rule}>열차 내 물품 휴대기준　›</Text>
        </View>
      </ScrollView>
      <View style={x.footer}>
        <Pressable style={x.agreeRow} onPress={() => setAgreed((v) => !v)}>
          <Text style={x.agreeText}>
            위 내용을 확인하였으며, 결제에 동의합니다.
          </Text>
          <View style={[x.check, agreed && x.checkOn]}>
            <Text style={x.checkMark}>{agreed ? "✓" : ""}</Text>
          </View>
        </Pressable>
        <View style={x.actions}>
          <Pressable style={x.cancel} onPress={onBack}>
            <Text style={x.cancelText}>예약취소</Text>
          </Pressable>
          <Pressable
            disabled={!agreed}
            style={[x.pay, !agreed && x.disabled]}
            onPress={onPay}
          >
            <Text style={x.payText}>
              {total.toLocaleString()}원 교육용 결제
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function Row({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <View style={x.amountRow}>
      <Text style={[x.amountLabel, strong && x.strong]}>{label}</Text>
      <Text style={[x.amountValue, strong && x.strong]}>{value}</Text>
    </View>
  );
}

const x = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f7f7fb" },
  header: {
    height: 90,
    backgroundColor: "white",
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 30, fontWeight: "900" },
  close: { fontSize: 46 },
  content: { paddingBottom: 230 },
  timer: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 30,
    minHeight: 60,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    elevation: 2,
  },
  timerRed: { fontSize: 20, color: "#ed2946", fontWeight: "900" },
  timerText: { fontSize: 18, fontWeight: "800" },
  sectionTitle: { fontSize: 27, fontWeight: "900", margin: 22, marginTop: 30 },
  blue: { color: "#176fee" },
  ticket: {
    marginHorizontal: 20,
    backgroundColor: "white",
    borderRadius: 22,
    overflow: "hidden",
    padding: 20,
  },
  ticketTop: {
    backgroundColor: "#2f323c",
    margin: -20,
    marginBottom: 25,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  ticketTopText: { color: "white", fontSize: 17, fontWeight: "800" },
  route: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  station: { fontSize: 17, textAlign: "center", fontWeight: "700" },
  time: { fontSize: 30, fontWeight: "900", marginTop: 4 },
  arrow: { fontSize: 27, color: "#777" },
  train: { fontSize: 17, fontWeight: "800", marginTop: 28 },
  badge: { backgroundColor: "#176fee", color: "white", fontWeight: "900" },
  seatInfo: {
    backgroundColor: "#f5f5f5",
    padding: 17,
    borderRadius: 10,
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  seatStrong: { fontSize: 19, fontWeight: "900" },
  gray: { color: "#777", fontWeight: "500" },
  ticketLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  lineTitle: { fontSize: 18, fontWeight: "900" },
  lineLink: { fontSize: 18 },
  hint: { color: "#777", marginTop: 10 },
  divider: { height: 1, backgroundColor: "#ddd", marginTop: 20 },
  coupon: {
    color: "#176fee",
    borderWidth: 1,
    borderColor: "#176fee",
    borderRadius: 12,
  },
  promo: {
    marginHorizontal: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  promoTag: {
    backgroundColor: "#176fee",
    color: "white",
    padding: 7,
    borderRadius: 18,
    fontWeight: "900",
  },
  promoText: {
    color: "#176fee",
    fontSize: 17,
    fontWeight: "800",
    marginLeft: 12,
  },
  methods: { backgroundColor: "white", paddingHorizontal: 22 },
  method: {
    minHeight: 82,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  radio: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#999",
  },
  radioOn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#176fee",
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "white",
  },
  toss: { fontSize: 30, color: "#176fee" },
  methodName: { fontSize: 20, fontWeight: "900" },
  auto: { color: "#176fee", marginTop: 3 },
  benefit: {
    color: "#176fee",
    borderWidth: 1,
    borderColor: "#176fee",
    padding: 5,
    borderRadius: 15,
  },
  amount: { backgroundColor: "white", padding: 22 },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 13,
  },
  amountLabel: { fontSize: 18, color: "#444" },
  amountValue: { fontSize: 19, fontWeight: "800" },
  strong: { fontSize: 21, fontWeight: "900", color: "#111" },
  rules: { backgroundColor: "white", paddingHorizontal: 22 },
  rule: {
    fontSize: 18,
    fontWeight: "800",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "white",
    padding: 18,
    elevation: 20,
  },
  agreeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
  },
  agreeText: { fontSize: 17, fontWeight: "800" },
  check: {
    width: 34,
    height: 34,
    borderWidth: 2,
    borderColor: "#aaa",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  checkOn: { backgroundColor: "#176fee", borderColor: "#176fee" },
  checkMark: { color: "white", fontSize: 23, fontWeight: "900" },
  actions: { flexDirection: "row", gap: 10, marginTop: 16 },
  cancel: {
    flex: 1,
    height: 62,
    backgroundColor: "#eee",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: { fontSize: 19, fontWeight: "900" },
  pay: {
    flex: 1.7,
    height: 62,
    backgroundColor: "#176fee",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  payText: { fontSize: 18, fontWeight: "900", color: "white" },
  disabled: { opacity: 0.25 },
});

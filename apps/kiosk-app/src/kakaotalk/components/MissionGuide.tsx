import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

export function MissionGuide({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  return (
    <View
      pointerEvents="none"
      className="rounded-[18px] border-2 border-kakao bg-mission-cream p-[18px]"
      style={[s.card, isMobile && s.cardMobile]}
    >
      <Text className="text-[13px] font-black text-[#865d00]">오늘의 미션</Text>
      <Text className="mt-[5px] text-[19px] font-black text-[#202020]" style={isMobile && s.titleMobile}>{title}</Text>
      <Text className="mt-[6px] text-[14px] leading-5 text-[#555]" style={isMobile && s.descriptionMobile}>{description}</Text>
    </View>
  );
}

export function MissionComplete({
  visible,
  title,
  onRestart,
  onExit,
}: {
  visible: boolean;
  title: string;
  onRestart: () => void;
  onExit: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/55 p-[30px]">
        <View className="w-full items-center rounded-3xl bg-white p-7">
          <Text className="text-[45px]">🎉</Text>
          <Text className="mt-2.5 text-[28px] font-black">미션 완료!</Text>
          <Text className="my-3 text-base text-[#666]">{title} 연습을 완료했어요.</Text>
          <Pressable className="mt-2 w-full items-center rounded-[14px] bg-kakao p-4" onPress={onRestart}>
            <Text className="text-[17px] font-black">처음으로 다시하기</Text>
          </Pressable>
          <Pressable className="p-4" onPress={onExit}>
            <Text className="text-[15px] font-bold text-[#555]">연습 선택으로</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  card: {
    position: "absolute",
    top: "42%",
    left: 22,
    right: 22,
    shadowColor: "#8f7400",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  cardMobile: {
    position: "relative",
    top: undefined,
    left: undefined,
    right: undefined,
    flexShrink: 0,
    marginHorizontal: 12,
    marginBottom: 10,
    padding: 12,
    borderRadius: 14,
    elevation: 3,
  },
  titleMobile: { fontSize: 16, marginTop: 3 },
  descriptionMobile: { fontSize: 12, marginTop: 4, lineHeight: 17 },
});

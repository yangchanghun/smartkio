import { useEffect } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import * as Speech from "expo-speech";

export function Gov24MissionModal({ visible, step, text, onClose, title = "정부24 로그인 미션" }: { visible: boolean; step: number; text: string; onClose: () => void; title?: string }) {
  useEffect(() => {
    if (!visible) return;
    Speech.stop();
    Speech.speak(`${title}, 미션 ${step}. ${text}`, { language: "ko-KR", rate: 0.88 });
    return () => { Speech.stop(); };
  }, [visible, step, text, title]);
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={s.dim}><View style={s.card}>
      <View style={s.badge}><Text style={s.badgeText}>MISSION {step}</Text></View>
      <Text style={s.title}>{title}</Text>
      <Text style={s.text}>{text}</Text>
      <Text style={s.note}>실제 로그인이나 본인인증은 진행되지 않아요.</Text>
      <Pressable style={s.button} onPress={onClose}><Text style={s.buttonText}>시작하기</Text></Pressable>
    </View></View>
  </Modal>;
}
const s = StyleSheet.create({
  dim:{flex:1,backgroundColor:"rgba(10,25,48,.6)",alignItems:"center",justifyContent:"center",padding:24},
  card:{width:"100%",maxWidth:600,borderRadius:28,backgroundColor:"white",padding:32,alignItems:"center",elevation:15},
  badge:{backgroundColor:"#e7f1ff",paddingHorizontal:20,paddingVertical:9,borderRadius:99},badgeText:{color:"#1769c2",fontWeight:"900",fontSize:17},
  title:{fontSize:29,fontWeight:"900",color:"#172b45",marginTop:20},text:{fontSize:23,lineHeight:35,fontWeight:"700",textAlign:"center",marginTop:18,color:"#1d2733"},
  note:{fontSize:15,color:"#778292",marginTop:17},button:{width:"100%",minHeight:66,backgroundColor:"#1677e8",borderRadius:10,alignItems:"center",justifyContent:"center",marginTop:26},buttonText:{fontSize:22,color:"white",fontWeight:"900"}
});

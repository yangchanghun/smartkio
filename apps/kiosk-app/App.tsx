import { ActivityIndicator, View } from "react-native";
import "./global.css";
import { useState } from "react";
import { useKioskSession } from "./src/hooks/useKioskSession";
import { LoginScreen } from "./src/screens/LoginScreen";
import { MenuScreen } from "./src/screens/MenuScreen";
import { KakaoSignupScreen } from "./src/kakaotalk/screens/KakaoSignupScreen";
import { KakaoTutorialScreen } from "./src/kakaotalk/screens/KakaoTutorialScreen";
import { FriendAddScreen } from "./src/kakaotalk/screens/FriendAddScreen";
import { ConversationScreen } from "./src/kakaotalk/screens/ConversationScreen";
import { BlockFriendScreen } from "./src/kakaotalk/screens/BlockFriendScreen";
import { DeliveryPracticeScreen } from "./src/delivery/screens/DeliveryPracticeScreen";
import { TaxiPracticeScreen } from "./src/taxi/screens/TaxiPracticeScreen";

type Screen =
  | "menu"
  | "kakao"
  | "signup"
  | "friend"
  | "chat"
  | "block"
  | "delivery"
  | "taxi";

export default function App() {
  const { session, loading, login, logout } = useKioskSession();
  const [screen, setScreen] = useState<Screen>("menu");
  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#fee500" />
      </View>
    );
  if (!session) return <LoginScreen onLogin={login} />;
  if (screen === "signup")
    return <KakaoSignupScreen onBack={() => setScreen("kakao")} />;
  if (screen === "friend")
    return <FriendAddScreen onBack={() => setScreen("kakao")} />;
  if (screen === "chat")
    return <ConversationScreen onBack={() => setScreen("kakao")} />;
  if (screen === "block")
    return <BlockFriendScreen onBack={() => setScreen("kakao")} />;
  if (screen === "kakao")
    return (
      <KakaoTutorialScreen
        onBack={() => setScreen("menu")}
        onSelect={setScreen}
      />
    );
  if (screen === "delivery")
    return (
      <DeliveryPracticeScreen
        onBack={() => setScreen("menu")}
        token={session.token}
      />
    );
  if (screen === "taxi")
    return (
      <TaxiPracticeScreen
        onBack={() => setScreen("menu")}
        token={session.token}
      />
    );
  return (
    <MenuScreen
      session={session}
      onLogout={logout}
      onStart={() => setScreen("kakao")}
      onStartDelivery={() => setScreen("delivery")}
      onStartTaxi={() => setScreen("taxi")}
    />
  );
}

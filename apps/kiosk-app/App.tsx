import { ActivityIndicator, View } from "react-native";
import "./global.css";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
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
import { CoupangPracticeScreen } from "./src/coupang/screens/CoupangPracticeScreen";
import { CoupangHubScreen } from "./src/coupang/screens/CoupangHubScreen";
import { CoupangShoppingScreen } from "./src/coupang/screens/CoupangShoppingScreen";
import { Gov24PracticeScreen } from "./src/gov24/screens/Gov24PracticeScreen";
import { Gov24HubScreen } from "./src/gov24/screens/Gov24HubScreen";
import { Gov24TranscriptScreen } from "./src/gov24/screens/Gov24TranscriptScreen";
import { Gov24MobileIdScreen } from "./src/gov24/screens/Gov24MobileIdScreen";
import { KtxPracticeScreen } from "./src/ktx/screens/KtxPracticeScreen";
import { KakaoPayPracticeScreen } from "./src/kakaopay/screens/KakaoPayPracticeScreen";
import { KakaoPayHubScreen } from "./src/kakaopay/screens/KakaoPayHubScreen";
import { KakaoPayAccountScreen } from "./src/kakaopay/screens/KakaoPayAccountScreen";

type Screen =
  | "menu"
  | "kakao"
  | "signup"
  | "friend"
  | "chat"
  | "block"
  | "delivery"
  | "taxi"
  | "coupang"
  | "coupang-signup"
  | "coupang-shopping"
  | "gov24"
  | "gov24-login"
  | "gov24-transcript"
  | "gov24-mobile-id"
  | "ktx"
  | "kakaopay"
  | "kakaopay-login"
  | "kakaopay-account";

export default function App() {
  const { session, loading, login, logout } = useKioskSession();
  const [screen, setScreen] = useState<Screen>("menu");
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetInactivity = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (!session) return;
    inactivityTimer.current = setTimeout(() => setScreen("menu"), 10 * 60 * 1000);
  }, [session]);

  useEffect(() => {
    resetInactivity();
    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [resetInactivity, screen]);

  const guard = (content: ReactNode) => (
    <View
      style={{ flex: 1 }}
      onStartShouldSetResponderCapture={() => {
        resetInactivity();
        return false;
      }}
    >
      {content}
    </View>
  );
  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#fee500" />
      </View>
    );
  if (!session) return <LoginScreen onLogin={login} />;
  if (screen === "signup")
    return guard(<KakaoSignupScreen onBack={() => setScreen("kakao")} />);
  if (screen === "friend")
    return guard(<FriendAddScreen onBack={() => setScreen("kakao")} />);
  if (screen === "chat")
    return guard(<ConversationScreen onBack={() => setScreen("kakao")} />);
  if (screen === "block")
    return guard(<BlockFriendScreen onBack={() => setScreen("kakao")} />);
  if (screen === "kakao")
    return guard(
      <KakaoTutorialScreen
        onBack={() => setScreen("menu")}
        onSelect={setScreen}
      />
    );
  if (screen === "delivery")
    return guard(
      <DeliveryPracticeScreen
        onBack={() => setScreen("menu")}
        token={session.token}
      />
    );
  if (screen === "taxi")
    return guard(
      <TaxiPracticeScreen
        onBack={() => setScreen("menu")}
        token={session.token}
      />
    );
  if (screen === "coupang")
    return guard(<CoupangHubScreen onBack={() => setScreen("menu")} onSignup={() => setScreen("coupang-signup")} onShopping={() => setScreen("coupang-shopping")} />);
  if (screen === "coupang-signup")
    return guard(<CoupangPracticeScreen onBack={() => setScreen("coupang")} token={session.token} />);
  if (screen === "coupang-shopping")
    return guard(<CoupangShoppingScreen onBack={() => setScreen("coupang")} onHome={() => setScreen("coupang")} token={session.token} />);
  if (screen === "gov24")
    return guard(<Gov24HubScreen onBack={() => setScreen("menu")} onLogin={() => setScreen("gov24-login")} onTranscript={() => setScreen("gov24-transcript")} onMobileId={() => setScreen("gov24-mobile-id")} />);
  if (screen === "gov24-login")
    return guard(<Gov24PracticeScreen onBack={() => setScreen("gov24")} token={session.token} />);
  if (screen === "gov24-transcript")
    return guard(<Gov24TranscriptScreen onBack={() => setScreen("gov24")} token={session.token} />);
  if (screen === "gov24-mobile-id")
    return guard(<Gov24MobileIdScreen onBack={() => setScreen("gov24")} token={session.token} />);
  if (screen === "ktx")
    return guard(<KtxPracticeScreen onBack={() => setScreen("menu")} token={session.token} />);
  if (screen === "kakaopay")
    return guard(<KakaoPayHubScreen onBack={() => setScreen("menu")} onLogin={() => setScreen("kakaopay-login")} onAccount={() => setScreen("kakaopay-account")} />);
  if (screen === "kakaopay-login")
    return guard(<KakaoPayPracticeScreen onBack={() => setScreen("kakaopay")} token={session.token} />);
  if (screen === "kakaopay-account")
    return guard(<KakaoPayAccountScreen onBack={() => setScreen("kakaopay")} token={session.token} />);
  return guard(
    <MenuScreen
      session={session}
      onLogout={logout}
      onStart={() => setScreen("kakao")}
      onStartDelivery={() => setScreen("delivery")}
      onStartTaxi={() => setScreen("taxi")}
      onStartCoupang={() => setScreen("coupang")}
      onStartGov24={() => setScreen("gov24")}
      onStartKtx={() => setScreen("ktx")}
      onStartKakaoPay={() => setScreen("kakaopay")}
    />
  );
}

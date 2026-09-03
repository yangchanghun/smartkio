import { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Speech from "expo-speech";
import { usePracticeSession } from "../../practice/hooks/usePracticeSession";

const YELLOW = "#fee500";
const banks = [
  "SC제일은행",
  "한국씨티은행",
  "대구은행",
  "부산은행",
  "광주은행",
  "제주은행",
  "전북은행",
  "카카오뱅크",
  "케이뱅크",
  "토스뱅크",
  "국민은행",
  "신한은행",
  "우리은행",
  "하나은행",
  "농협은행",
];
const guides = [
  "오른쪽 위의 ☰ 메뉴를 눌러 주세요.",
  "설정 화면에서 충전계좌 관리를 눌러 주세요.",
  "계좌 연결하기 버튼을 눌러 주세요.",
  "은행을 선택하고 연습용 계좌번호를 입력한 뒤 다음을 눌러 주세요.",
  "계좌 연결 필수 약관 두 개에 동의하고 확인을 눌러 주세요.",
  "자동이체 출금동의에서 카카오 인증의 인증하기를 눌러 주세요.",
  "카카오톡을 열어 인증을 계속해 주세요.",
  "필수 항목 두 개를 선택하고 서명하기를 눌러 주세요.",
  "계좌 연결 완료 화면에서 확인을 눌러 주세요.",
];

export function KakaoPayAccountScreen({
  onBack,
  token,
}: {
  onBack: () => void;
  token: string;
}) {
  const { completePractice, restartPracticeSession } = usePracticeSession(
    token,
    "KAKAOPAY_ACCOUNT",
  );
  const [step, setStep] = useState(0);
  const [mission, setMission] = useState(true);
  const [wrong, setWrong] = useState("");
  const [method, setMethod] = useState(false);
  const [bankModal, setBankModal] = useState(false);
  const [bank, setBank] = useState("");
  const [account, setAccount] = useState("");
  const [terms, setTerms] = useState([false, false]);
  const [openPrompt, setOpenPrompt] = useState(false);
  const [signTerms, setSignTerms] = useState([false, false]);
  const next = (n: number) => {
    setStep(n);
    setMission(true);
  };
  const remind = (text?: string) => {
    const message = text || guides[step];
    setWrong(message);
    Speech.speak(`지금은 다른 버튼을 누르지 말고, ${message}`, {
      language: "ko-KR",
      rate: 0.88,
    });
  };
  const masked = account
    ? `${account.slice(0, 4)}${"*".repeat(Math.max(4, account.length - 8))}${account.slice(-4)}`
    : "1111********1111";
  const reset = () => {
    void restartPracticeSession().catch(() => undefined);
    setStep(0);
    setBank("");
    setAccount("");
    setTerms([false, false]);
    setSignTerms([false, false]);
    setMission(true);
  };
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.shell}>
        {step === 0 ? (
          <EntryHome
            onMenu={() => next(1)}
            onWrong={() => remind()}
            onBack={onBack}
          />
        ) : null}
        {step === 1 ? (
          <Settings
            onBack={() => setStep(0)}
            onAccount={() => next(2)}
            onWrong={() => remind()}
          />
        ) : null}
        {step === 2 ? (
          <AccountIntro
            onBack={() => setStep(1)}
            onConnect={() => setMethod(true)}
            onWrong={() => remind()}
          />
        ) : null}
        {step === 3 ? (
          <AccountInput
            bank={bank}
            account={account}
            setAccount={(v) => setAccount(v.replace(/\D/g, "").slice(0, 16))}
            onBank={() => setBankModal(true)}
            onBack={() => setStep(2)}
            onNext={() =>
              bank && account.length >= 8
                ? next(4)
                : remind("은행과 8자리 이상의 연습용 계좌번호를 입력해 주세요.")
            }
          />
        ) : null}
        {step === 5 ? (
          <DebitConsent
            bank={bank}
            masked={masked}
            onBack={() => setStep(3)}
            onAuth={() => setOpenPrompt(true)}
            onWrong={() => remind()}
          />
        ) : null}
        {step === 7 ? (
          <Signature
            bank={bank}
            masked={masked}
            checked={signTerms}
            onToggle={(i) =>
              setSignTerms((v) => v.map((x, n) => (n === i ? !x : x)))
            }
            onBack={() => setStep(5)}
            onSign={() =>
              signTerms.every(Boolean)
                ? next(8)
                : remind(
                    "전자서명을 위한 필수 항목 두 개를 모두 선택해 주세요.",
                  )
            }
          />
        ) : null}
        {step === 8 ? (
          <Complete
            bank={bank}
            masked={masked}
            onConfirm={async () => {
              try {
                await completePractice();
                next(9);
              } catch {
                Alert.alert(
                  "통계 저장 실패",
                  "네트워크를 확인한 뒤 다시 눌러 주세요.",
                );
              }
            }}
          />
        ) : null}
        {step === 9 ? (
          <AccountList
            bank={bank}
            masked={masked}
            onBack={onBack}
            onReset={reset}
          />
        ) : null}
        <MethodSheet
          visible={method}
          onClose={() => setMethod(false)}
          onPick={() => {
            setMethod(false);
            next(3);
          }}
          onWrong={() => remind()}
        />
        <BankPicker
          visible={bankModal}
          onClose={() => setBankModal(false)}
          onSelect={(name) => {
            setBank(name);
            setBankModal(false);
          }}
        />
        <TermsSheet
          visible={step === 4}
          checked={terms}
          onToggle={(i) => setTerms((v) => v.map((x, n) => (n === i ? !x : x)))}
          onConfirm={() =>
            terms.every(Boolean)
              ? next(5)
              : remind("필수 약관 두 개를 모두 선택해 주세요.")
          }
        />
        <OpenKakao
          visible={openPrompt}
          onCancel={() => setOpenPrompt(false)}
          onOpen={() => {
            setOpenPrompt(false);
            next(7);
          }}
        />
        <Mission
          visible={mission && step < 9}
          step={step + 1}
          text={guides[step] || ""}
          onClose={() => setMission(false)}
        />
        <Wrong
          visible={Boolean(wrong)}
          text={wrong}
          onClose={() => setWrong("")}
        />
      </View>
    </SafeAreaView>
  );
}

function Header({
  title,
  onBack,
  home = false,
}: {
  title: string;
  onBack: () => void;
  home?: boolean;
}) {
  return (
    <View style={s.header}>
      <Pressable onPress={onBack}>
        <Text style={s.back}>←</Text>
      </Pressable>
      <Text style={s.headerTitle}>{title}</Text>
      <Text style={s.home}>{home ? "🏠" : ""}</Text>
    </View>
  );
}
function EntryHome({
  onMenu,
  onWrong,
  onBack,
}: {
  onMenu: () => void;
  onWrong: () => void;
  onBack: () => void;
}) {
  return (
    <View style={[s.page, { backgroundColor: "#f4f4f4" }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 115 }}>
        <View style={s.entryTop}>
          <Pressable onPress={onBack}>
            <Text style={s.entryUser}>
              할인 <Text style={s.entryBadge}>1</Text>
            </Text>
          </Pressable>
          <View style={s.entryActions}>
            <Pressable onPress={onWrong}>
              <Text style={s.entryAction}>🔍</Text>
            </Pressable>
            <Pressable onPress={onWrong}>
              <Text style={s.entryAction}>🔔</Text>
            </Pressable>
            <Pressable onPress={onMenu}>
              <Text style={s.hamburger}>☰</Text>
            </Pressable>
          </View>
        </View>
        <Pressable style={s.moneyBar} onPress={onWrong}>
          <Text style={s.moneyLabel}>머니결제</Text>
          <Text style={s.moneyValue}>39,310원 ▼</Text>
        </Pressable>
        <View style={s.promo}>
          <Text style={s.promoSmall}>3일 남음</Text>
          <Text style={s.promoTitle}>매장 결제 포인트가{`\n`}곧 사라져요</Text>
          <Pressable style={s.pointButton} onPress={onWrong}>
            <Text style={s.buttonText}>포인트 받기</Text>
          </Pressable>
          <Text style={s.promoIcon}>🅿️</Text>
        </View>
        <View style={s.entryMenu}>
          {[
            ["▧", "결제내역"],
            ["🎟", "쿠폰함"],
            ["💌", "멤버십"],
            ["💵", "굿딜"],
            ["◉", "소비쿠폰"],
          ].map(([icon, label]) => (
            <Pressable key={label} style={s.entryMenuItem} onPress={onWrong}>
              <Text style={s.entryMenuIcon}>{icon}</Text>
              <Text style={s.entryMenuText}>{label}</Text>
            </Pressable>
          ))}
        </View>
        <View style={s.pointCard}>
          <View style={s.pointHead}>
            <Text style={s.pointTitle}>매장결제 포인트</Text>
            <Text style={s.pointRecent}>최근 3개월 823원 적립</Text>
          </View>
          <View style={s.pointProgress}>
            <Text style={s.pointProgressText}>68원 받기 14</Text>
          </View>
        </View>
        <Pressable style={s.popular} onPress={onWrong}>
          <Text>실시간 인기혜택 ▼</Text>
        </Pressable>
        <Pressable style={s.entryPay} onPress={onWrong}>
          <Text style={s.buttonText}>결제하기</Text>
        </Pressable>
      </ScrollView>
      <View style={s.entryNav}>
        {["🏠\n홈", "🎁\n혜택", "💳\n결제", "▥\n자산", "📁\n증권"].map((x) => (
          <Pressable key={x} onPress={onWrong}>
            <Text style={s.entryNavText}>{x}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
function Settings({
  onBack,
  onAccount,
  onWrong,
}: {
  onBack: () => void;
  onAccount: () => void;
  onWrong: () => void;
}) {
  return (
    <View style={s.page}>
      <Header title="설정" onBack={onBack} />
      <ScrollView>
        <SettingRow text="비밀번호" onPress={onWrong} />
        <SettingRow text="알림" onPress={onWrong} />
        <View style={s.alertBox}>
          <Text style={s.alertTitle}>ⓘ　기기 알림이 꺼져있습니다.</Text>
          <Text style={s.alertText}>　　설정에서 알림을 켜주세요.</Text>
          <Text style={s.alertLink}>　　설정 바로가기 ›</Text>
        </View>
        <SettingRow text="화면 잠금" value="사용 안 함" onPress={onWrong} />
        <SettingRow
          text="동영상 자동 재생"
          value="항상 사용"
          onPress={onWrong}
        />
        <View style={s.settingDivider} />
        <Text style={s.settingSection}>머니 관리</Text>
        <SettingRow text="카카오페이증권 계좌" onPress={onWrong} />
        <SettingRow text="충전계좌 관리" onPress={onAccount} />
        <SettingRow text="빠른송금" onPress={onWrong} />
        <SettingRow text="자동충전" onPress={onWrong} />
        <SettingRow text="송금한도" onPress={onWrong} />
        <SettingRow text="송금확인증" onPress={onWrong} />
        <View style={s.settingDivider} />
        <Text style={s.settingSection}>결제 관리</Text>
        <SettingRow text="결제 수단" onPress={onWrong} />
      </ScrollView>
    </View>
  );
}
function SettingRow({
  text,
  value,
  onPress,
}: {
  text: string;
  value?: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={s.settingRow} onPress={onPress}>
      <Text style={s.settingText}>{text}</Text>
      <Text style={s.settingValue}>{value ? `${value}  ›` : "›"}</Text>
    </Pressable>
  );
}
function Wallet() {
  return (
    <View style={s.wallet}>
      <View style={s.walletBack} />
      <View style={s.walletFront}>
        <View style={s.walletSlot} />
      </View>
    </View>
  );
}
function AccountIntro({
  onBack,
  onConnect,
  onWrong,
}: {
  onBack: () => void;
  onConnect: () => void;
  onWrong: () => void;
}) {
  return (
    <View style={s.page}>
      <Header title="충전계좌" onBack={onBack} home />
      <View style={s.tabs}>
        <Text style={s.tabOn}>머니 충전계좌</Text>
        <Text style={s.tab}>내 모든 계좌</Text>
      </View>
      <View style={s.intro}>
        <Wallet />
        <Text style={s.introTitle}>
          연결된 내 계좌끼리는{`\n`}송금 수수료가 무료!
        </Text>
        <Text style={s.introText}>
          계좌를 연결하면 더 간편해진{`\n`}송금, 결제를 경험할 수 있어요.
        </Text>
      </View>
      <View style={s.bottom}>
        <Pressable style={s.yellow} onPress={onConnect}>
          <Text style={s.buttonText}>계좌 연결하기</Text>
        </Pressable>
        <Pressable onPress={onWrong}>
          <Text style={s.link}>계좌 순서 변경하기</Text>
        </Pressable>
      </View>
    </View>
  );
}
function MethodSheet({
  visible,
  onClose,
  onPick,
  onWrong,
}: {
  visible: boolean;
  onClose: () => void;
  onPick: () => void;
  onWrong: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={s.dim}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View style={s.sheet}>
          <View style={s.handle} />
          <Text style={s.sheetTitle}>어떻게 연결할까요?</Text>
          <Pressable style={s.method} onPress={onWrong}>
            <Text style={s.methodIcon}>ϟ</Text>
            <Text style={s.methodText}>여러개를 한 번에</Text>
            <Text style={s.chev}>›</Text>
          </Pressable>
          <Pressable style={s.method} onPress={onPick}>
            <Text style={s.methodIcon}>✓</Text>
            <Text style={s.methodText}>지금 필요한 하나만</Text>
            <Text style={s.chev}>›</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
function AccountInput({
  bank,
  account,
  setAccount,
  onBank,
  onBack,
  onNext,
}: {
  bank: string;
  account: string;
  setAccount: (v: string) => void;
  onBank: () => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const enabled = bank && account.length >= 8;
  return (
    <View style={s.page}>
      <Header title="충전계좌 연결" onBack={onBack} />
      <View style={s.form}>
        <View style={s.stepTitle}>
          <Text style={s.stepCircle}>1</Text>
          <Text style={s.stepText}>계좌번호 입력</Text>
        </View>
        <Text style={s.help}>연결이 잘 안되시나요　?</Text>
        <Pressable style={s.input} onPress={onBank}>
          <Text style={bank ? s.inputText : s.placeholder}>
            {bank || "은행/증권사"}
          </Text>
          <Text>▼</Text>
        </Pressable>
        <TextInput
          style={s.input}
          value={account}
          onChangeText={setAccount}
          keyboardType="number-pad"
          placeholder="계좌번호"
          placeholderTextColor="#aaa"
        />
        <Text style={s.training}>
          실제 계좌번호가 아닌 연습용 숫자를 입력하세요.
        </Text>
      </View>
      <View style={s.bottom}>
        <Pressable style={[s.next, !enabled && s.disabled]} onPress={onNext}>
          <Text style={[s.buttonText, !enabled && { color: "#aaa" }]}>
            다음
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
function BankPicker({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (v: string) => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={s.dim}>
        <View style={s.bankSheet}>
          <View style={s.bankHead}>
            <Text style={s.bankTitle}>은행/증권사 선택</Text>
            <Pressable onPress={onClose}>
              <Text style={s.close}>×</Text>
            </Pressable>
          </View>
          <ScrollView>
            {banks.map((x) => (
              <Pressable key={x} style={s.bankRow} onPress={() => onSelect(x)}>
                <Text style={s.bankName}>{x}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
function TermsSheet({
  visible,
  checked,
  onToggle,
  onConfirm,
}: {
  visible: boolean;
  checked: boolean[];
  onToggle: (i: number) => void;
  onConfirm: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={s.dim}>
        <View style={s.sheet}>
          <View style={s.handle} />
          <Text style={s.sheetTitle}>
            계좌를 연결하려면 약관에 동의해 주세요.
          </Text>
          <Check
            text="(필수) 오픈뱅킹 참여은행 자동이체 출금동의"
            checked={checked[0]}
            onPress={() => onToggle(0)}
          />
          <Check
            text="(필수) 자동이체출금 등록을 위한 개인정보 제공 동의(카카오)"
            checked={checked[1]}
            onPress={() => onToggle(1)}
          />
          <Pressable
            style={[s.yellow, !checked.every(Boolean) && s.disabled]}
            onPress={onConfirm}
          >
            <Text style={s.buttonText}>확인</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
function Check({
  text,
  checked,
  onPress,
}: {
  text: string;
  checked: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={s.checkRow} onPress={onPress}>
      <View style={[s.checkbox, checked && s.checkboxOn]}>
        <Text>{checked ? "✓" : ""}</Text>
      </View>
      <Text style={s.checkText}>{text}</Text>
    </Pressable>
  );
}
function DebitConsent({
  bank,
  masked,
  onBack,
  onAuth,
  onWrong,
}: {
  bank: string;
  masked: string;
  onBack: () => void;
  onAuth: () => void;
  onWrong: () => void;
}) {
  return (
    <View style={s.page}>
      <Header title="충전계좌 연결" onBack={onBack} />
      <View style={s.selectedBank}>
        <Text style={s.doneCircle}>✓</Text>
        <Text style={s.selectedText}>
          {bank} {masked}
        </Text>
        <Text style={s.change}>변경</Text>
      </View>
      <View style={s.stepTitle}>
        <Text style={s.stepCircle}>2</Text>
        <Text style={s.stepText}>자동이체 출금동의</Text>
      </View>
      <View style={s.authTabs}>
        <Text style={s.authTabOn}>카카오 인증</Text>
        <Text style={s.authTab}>ARS 인증</Text>
      </View>
      <View style={s.authCard}>
        <Text style={s.authTitle}>카카오 인증</Text>
        <Text style={s.authText}>
          빠르고 안전한 카카오 인증으로{`\n`}계좌 연결을 완료해 보세요!
        </Text>
        <Pressable style={s.authButton} onPress={onAuth}>
          <Text style={s.buttonText}>🛡️　인증하기</Text>
        </Pressable>
      </View>
      <Pressable onPress={onWrong}>
        <Text style={s.helpCenter}>연결이 잘 안되시나요　?</Text>
      </Pressable>
    </View>
  );
}
function OpenKakao({
  visible,
  onCancel,
  onOpen,
}: {
  visible: boolean;
  onCancel: () => void;
  onOpen: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={s.centerDim}>
        <View style={s.dialog}>
          <Text style={s.dialogTitle}>카카오 인증</Text>
          <Text style={s.dialogText}>
            서비스 사용을 위해 카카오톡을 열까요?
          </Text>
          <View style={s.dialogButtons}>
            <Pressable style={s.cancelButton} onPress={onCancel}>
              <Text style={s.buttonText}>취소</Text>
            </Pressable>
            <Pressable style={s.openButton} onPress={onOpen}>
              <Text style={s.buttonText}>열기</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
function Signature({
  bank,
  masked,
  checked,
  onToggle,
  onBack,
  onSign,
}: {
  bank: string;
  masked: string;
  checked: boolean[];
  onToggle: (i: number) => void;
  onBack: () => void;
  onSign: () => void;
}) {
  const enabled = checked.every(Boolean);
  return (
    <View style={[s.page, { backgroundColor: "#f7f7f7" }]}>
      <Header title="카카오 인증서로 전자서명을 진행합니다" onBack={onBack} />
      <View style={s.signCard}>
        <Text style={s.payLogo}>● pay　주식회사 카카오페이</Text>
        <View style={s.line} />
        <Info label="요청구분" value="자동이체 출금동의" />
        <Info label="받는이" value="홍길동" />
        <Info label="서명요청" value={`${bank} ${masked}`} />
        <View style={s.line} />
        <Text style={s.customer}>주식회사 카카오페이 고객센터</Text>
      </View>
      <View style={s.signChecks}>
        <Check
          text="[필수] 개인정보 제3자 제공 동의"
          checked={checked[0]}
          onPress={() => onToggle(0)}
        />
        <Check
          text="전자서명값"
          checked={checked[1]}
          onPress={() => onToggle(1)}
        />
      </View>
      <View style={s.bottom}>
        <Pressable
          style={[s.signButton, !enabled && s.disabled]}
          onPress={onSign}
        >
          <Text style={s.buttonText}>서명하기</Text>
        </Pressable>
      </View>
    </View>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.info}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  );
}
function Complete({
  bank,
  masked,
  onConfirm,
}: {
  bank: string;
  masked: string;
  onConfirm: () => void;
}) {
  return (
    <View style={s.page}>
      <View style={s.complete}>
        <Text style={s.completeCheck}>✓</Text>
        <Text style={s.completeTitle}>계좌 연결이{`\n`}완료되었어요</Text>
        <Text style={s.completeText}>
          은행에서 계좌 연결이 되었다는 안내 문자가{`\n`}올 거예요. 최대 2개까지
          받을 수 있어요.
        </Text>
      </View>
      <View style={s.summary}>
        <Text style={s.summaryLabel}>충전계좌</Text>
        <Text style={s.summaryValue}>
          {bank} {masked}
        </Text>
      </View>
      <View style={s.summary}>
        <Text style={s.summaryLabel}>계좌별명</Text>
        <Text style={s.summaryMuted}>예) 티끌모아잔산 ›</Text>
      </View>
      <View style={s.bottom}>
        <Pressable style={s.yellow} onPress={onConfirm}>
          <Text style={s.buttonText}>확인</Text>
        </Pressable>
      </View>
    </View>
  );
}
function AccountList({
  bank,
  masked,
  onBack,
  onReset,
}: {
  bank: string;
  masked: string;
  onBack: () => void;
  onReset: () => void;
}) {
  return (
    <View style={s.page}>
      <Header title="충전계좌" onBack={onBack} home />
      <View style={s.tabs}>
        <Text style={s.tabOn}>머니 충전계좌</Text>
        <Text style={s.tab}>내 모든 계좌</Text>
      </View>
      <Text style={s.accountCount}>충전계좌 1</Text>
      <View style={s.accountRow}>
        <Text style={s.bankEmoji}>🏦</Text>
        <View>
          <Text style={s.accountName}>
            {bank} {masked}
          </Text>
          <Text style={s.mainTag}>주계좌</Text>
        </View>
        <Pressable style={s.send}>
          <Text style={s.sendText}>송금</Text>
        </Pressable>
      </View>
      <View style={s.bottom}>
        <Pressable style={s.yellow} onPress={onReset}>
          <Text style={s.buttonText}>계좌 연결 다시 연습</Text>
        </Pressable>
        <Pressable onPress={onBack}>
          <Text style={s.link}>카카오페이 연습 목록</Text>
        </Pressable>
      </View>
    </View>
  );
}
function Mission({
  visible,
  step,
  text,
  onClose,
}: {
  visible: boolean;
  step: number;
  text: string;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={s.missionDim}>
        <View style={s.mission}>
          <Text style={s.missionBadge}>MISSION {step}</Text>
          <Text style={s.missionTitle}>계좌 연결하기</Text>
          <Text style={s.missionText}>{text}</Text>
          <Text style={s.missionNote}>
            실제 계좌 연결이나 금융 거래는 진행되지 않아요.
          </Text>
          <Pressable
            style={s.yellow}
            onPress={() => {
              Speech.speak(text, { language: "ko-KR", rate: 0.88 });
              onClose();
            }}
          >
            <Text style={s.buttonText}>시작하기</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
function Wrong({
  visible,
  text,
  onClose,
}: {
  visible: boolean;
  text: string;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent>
      <View style={s.missionDim}>
        <View style={s.mission}>
          <Text style={s.wrongIcon}>!</Text>
          <Text style={s.missionTitle}>지금은 이 버튼이 아니에요</Text>
          <Text style={s.missionText}>
            다른 버튼을 누르지 말고{`\n`}
            <Text style={{ fontWeight: "900" }}>{text}</Text>
          </Text>
          <Pressable style={s.yellow} onPress={onClose}>
            <Text style={s.buttonText}>미션 계속하기</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "white" },
  shell: { flex: 1, width: "100%", maxWidth: 980, alignSelf: "center" },
  page: { flex: 1, backgroundColor: "white" },
  header: {
    height: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  back: { fontSize: 29 },
  headerTitle: { fontSize: 21, fontWeight: "900" },
  home: { width: 30, fontSize: 21 },
  entryTop: {
    height: 76,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
  },
  entryUser: { fontSize: 20, fontWeight: "900" },
  entryBadge: { color: "white", backgroundColor: "#ff2688" },
  entryActions: { flexDirection: "row", alignItems: "center", gap: 24 },
  entryAction: { fontSize: 21 },
  hamburger: { fontSize: 30, fontWeight: "900" },
  moneyBar: {
    marginHorizontal: 20,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    elevation: 2,
  },
  moneyLabel: { color: "#777" },
  moneyValue: { fontSize: 18, fontWeight: "900" },
  promo: {
    margin: 16,
    backgroundColor: "white",
    borderRadius: 17,
    padding: 22,
    minHeight: 178,
    elevation: 2,
  },
  promoSmall: { color: "#ff2688" },
  promoTitle: {
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 30,
    marginTop: 10,
  },
  promoIcon: { position: "absolute", right: 35, bottom: 34, fontSize: 44 },
  pointButton: {
    backgroundColor: YELLOW,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 9,
    alignSelf: "flex-start",
    marginTop: 17,
  },
  entryMenu: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 14,
  },
  entryMenuItem: { alignItems: "center", width: "19%" },
  entryMenuIcon: {
    fontSize: 24,
    backgroundColor: "#fff7e8",
    padding: 11,
    borderRadius: 11,
  },
  entryMenuText: { fontSize: 12, fontWeight: "700", marginTop: 7 },
  pointCard: {
    margin: 16,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 19,
    elevation: 2,
  },
  pointHead: { flexDirection: "row", justifyContent: "space-between" },
  pointTitle: { fontSize: 18, fontWeight: "900" },
  pointRecent: { fontSize: 11, color: "#aaa" },
  pointProgress: {
    height: 46,
    borderRadius: 23,
    backgroundColor: "#58a4ed",
    justifyContent: "center",
    paddingHorizontal: 17,
    marginTop: 17,
  },
  pointProgressText: { color: "white", fontWeight: "900" },
  popular: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    padding: 9,
    marginLeft: 16,
  },
  entryPay: {
    margin: 16,
    marginTop: 28,
    height: 60,
    backgroundColor: YELLOW,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  entryNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 90,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  entryNavText: { textAlign: "center", lineHeight: 24, color: "#777" },
  settingRow: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
  },
  settingText: { fontSize: 17, fontWeight: "800" },
  settingValue: { marginLeft: "auto", color: "#999" },
  alertBox: {
    marginHorizontal: 18,
    backgroundColor: "#e2f2ff",
    borderRadius: 12,
    padding: 18,
  },
  alertTitle: { color: "#3280c4", fontWeight: "800" },
  alertText: { color: "#555", marginTop: 5 },
  alertLink: { fontWeight: "800", marginTop: 14 },
  settingDivider: { height: 7, backgroundColor: "#f3f3f3", marginVertical: 8 },
  settingSection: { color: "#999", paddingHorizontal: 22, paddingTop: 18 },
  tabs: {
    height: 72,
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tabOn: {
    flex: 1,
    textAlign: "center",
    paddingTop: 28,
    fontWeight: "900",
    borderBottomWidth: 2,
  },
  tab: { flex: 1, textAlign: "center", paddingTop: 28, color: "#888" },
  intro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
  },
  wallet: { width: 210, height: 165 },
  walletBack: {
    position: "absolute",
    width: 170,
    height: 112,
    backgroundColor: "#b9ddf8",
    borderRadius: 12,
    right: 5,
    bottom: 5,
  },
  walletFront: {
    position: "absolute",
    width: 190,
    height: 120,
    backgroundColor: "#48a5e9",
    borderRadius: 12,
    left: 0,
    top: 0,
    transform: [{ skewX: "-12deg" }],
    alignItems: "center",
    justifyContent: "center",
  },
  walletSlot: {
    width: 55,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#ffd536",
  },
  introTitle: {
    fontSize: 30,
    lineHeight: 40,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 25,
  },
  introText: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 10,
  },
  bottom: { marginTop: "auto", padding: 20, backgroundColor: "#f7f7f7" },
  yellow: {
    minHeight: 62,
    borderRadius: 10,
    backgroundColor: YELLOW,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  buttonText: { fontSize: 18, fontWeight: "900" },
  link: {
    textAlign: "center",
    textDecorationLine: "underline",
    marginTop: 18,
    color: "#777",
  },
  dim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,.42)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "white",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 30,
  },
  handle: {
    width: 85,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#999",
    alignSelf: "center",
    marginBottom: 20,
  },
  sheetTitle: { fontSize: 30, fontWeight: "900", marginBottom: 18 },
  method: { minHeight: 72, flexDirection: "row", alignItems: "center" },
  methodIcon: { fontSize: 36, fontWeight: "900", width: 45 },
  methodText: { fontSize: 20, fontWeight: "900" },
  chev: { marginLeft: "auto", fontSize: 29 },
  form: { padding: 28 },
  stepTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    margin: 25,
  },
  stepCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: YELLOW,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 18,
    fontWeight: "900",
  },
  stepText: { fontSize: 27, fontWeight: "900" },
  help: { color: "#aaa", marginLeft: 74, marginTop: -15, marginBottom: 45 },
  input: {
    height: 67,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 18,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: 18,
  },
  inputText: { fontSize: 18, fontWeight: "800" },
  placeholder: { fontSize: 18, color: "#aaa" },
  training: { color: "#d17b00", marginTop: 4 },
  next: {
    height: 64,
    borderRadius: 10,
    backgroundColor: YELLOW,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: { opacity: 0.35 },
  bankSheet: {
    height: "72%",
    backgroundColor: "white",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  bankHead: {
    height: 78,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  bankTitle: { fontSize: 22, fontWeight: "900" },
  close: { fontSize: 40 },
  bankRow: { height: 65, justifyContent: "center", paddingHorizontal: 24 },
  bankName: { fontSize: 18, fontWeight: "700" },
  checkRow: { flexDirection: "row", alignItems: "center", marginVertical: 14 },
  checkbox: {
    width: 26,
    height: 26,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxOn: { backgroundColor: YELLOW, borderColor: YELLOW },
  checkText: { fontSize: 17, marginLeft: 8, flex: 1 },
  selectedBank: {
    height: 90,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  doneCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#555",
    color: "white",
    textAlign: "center",
    textAlignVertical: "center",
  },
  selectedText: { fontSize: 18, fontWeight: "800", marginLeft: 14 },
  change: { marginLeft: "auto", color: "#888" },
  authTabs: { flexDirection: "row", marginHorizontal: 28 },
  authTabOn: {
    flex: 1,
    textAlign: "center",
    padding: 18,
    borderRadius: 30,
    backgroundColor: "white",
    elevation: 2,
    fontWeight: "900",
  },
  authTab: {
    flex: 1,
    textAlign: "center",
    padding: 18,
    borderRadius: 30,
    backgroundColor: "#f4f4f4",
    color: "#888",
  },
  authCard: {
    margin: 28,
    backgroundColor: "#f7f7f7",
    borderRadius: 18,
    padding: 50,
    alignItems: "center",
  },
  authTitle: { fontSize: 27, fontWeight: "900" },
  authText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#777",
    textAlign: "center",
    marginTop: 16,
  },
  authButton: {
    backgroundColor: YELLOW,
    borderRadius: 30,
    paddingHorizontal: 35,
    paddingVertical: 17,
    marginTop: 30,
  },
  helpCenter: { textAlign: "right", marginRight: 32, color: "#aaa" },
  centerDim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  dialog: {
    width: "100%",
    maxWidth: 430,
    backgroundColor: "white",
    borderRadius: 22,
    padding: 24,
    alignItems: "center",
  },
  dialogTitle: { fontSize: 25, fontWeight: "900" },
  dialogText: { fontSize: 17, marginVertical: 28 },
  dialogButtons: { flexDirection: "row", gap: 10 },
  cancelButton: {
    flex: 1,
    height: 58,
    backgroundColor: "#eee",
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  openButton: {
    flex: 1,
    height: 58,
    backgroundColor: YELLOW,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  signCard: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 14,
    padding: 22,
  },
  payLogo: { fontSize: 18, fontWeight: "900" },
  line: { height: 1, backgroundColor: "#ddd", marginVertical: 20 },
  info: { flexDirection: "row", marginVertical: 8 },
  infoLabel: { width: 95, color: "#888" },
  infoValue: { fontWeight: "700", flex: 1 },
  customer: { color: "#777" },
  signChecks: {
    marginHorizontal: 20,
    backgroundColor: "white",
    borderRadius: 14,
    paddingHorizontal: 18,
  },
  signButton: {
    height: 64,
    backgroundColor: YELLOW,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  complete: { alignItems: "center", paddingTop: 45 },
  completeCheck: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: YELLOW,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 66,
  },
  completeTitle: {
    fontSize: 31,
    lineHeight: 39,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 25,
  },
  completeText: {
    fontSize: 15,
    lineHeight: 23,
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },
  summary: {
    height: 78,
    marginHorizontal: 25,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryLabel: { color: "#777" },
  summaryValue: { fontWeight: "900" },
  summaryMuted: { color: "#aaa" },
  accountCount: { margin: 18 },
  accountRow: {
    height: 90,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  bankEmoji: { fontSize: 30 },
  accountName: { fontSize: 17, fontWeight: "900", marginLeft: 12 },
  mainTag: { color: "#429be1", marginLeft: 12, marginTop: 4 },
  send: {
    marginLeft: "auto",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  sendText: { fontWeight: "900" },
  missionDim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,.58)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  mission: {
    width: "100%",
    maxWidth: 560,
    backgroundColor: "white",
    borderRadius: 28,
    padding: 30,
    alignItems: "center",
  },
  missionBadge: {
    backgroundColor: "#fff7bd",
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    fontWeight: "900",
  },
  missionTitle: { fontSize: 28, fontWeight: "900", marginTop: 18 },
  missionText: {
    fontSize: 21,
    lineHeight: 32,
    textAlign: "center",
    marginVertical: 18,
  },
  missionNote: { color: "#888", marginBottom: 16 },
  wrongIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#fff1d8",
    color: "#e67a00",
    fontSize: 38,
    fontWeight: "900",
    textAlign: "center",
    textAlignVertical: "center",
  },
});

export type Tab = "statistics" | "accounts";
export function Sidebar({
  tab,
  onTab,
  onLogout,
  isSuperuser,
}: {
  tab: Tab;
  onTab: (tab: Tab) => void;
  onLogout: () => void;
  isSuperuser: boolean;
}) {
  const item = (name: Tab, label: string) => (
    <button
      className={`rounded-xl px-3 py-2 text-left font-bold ${tab === name ? "bg-emerald-700 text-white" : "text-emerald-50 hover:bg-emerald-800"}`}
      onClick={() => onTab(name)}
    >
      {label}
    </button>
  );
  return (
    <aside className="flex min-h-0 flex-col gap-2 bg-forest p-5 text-white md:min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-black">SmartKio</h1>
        <p className="mt-1 text-xs text-emerald-200">디지털 연습 통계</p>
      </div>
      {item("statistics", "연습 통계")}
      {isSuperuser && item("accounts", "회원 계정")}
      <button
        className="mt-auto rounded-xl px-3 py-2 text-left text-emerald-100 hover:bg-emerald-800"
        onClick={onLogout}
      >
        로그아웃
      </button>
    </aside>
  );
}

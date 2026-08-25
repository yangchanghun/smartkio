export type Tab = "products" | "orders" | "accounts";
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
      <h1 className="mb-6 text-2xl font-black">SmartKio</h1>

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

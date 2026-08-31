import { useState } from "react";
import { AccountsPanel } from "./components/AccountsPanel";
import { LoginPage } from "./components/LoginPage";
import { Sidebar, type Tab } from "./components/Sidebar";
import { StatisticsDashboard } from "./components/StatisticsDashboard";
import { useDashboardData } from "./hooks/useDashboardData";

function Dashboard() {
  const [tab, setTab] = useState<Tab>("statistics");
  const { sessions, loading, error, reload } = useDashboardData();
  const superuser = localStorage.getItem("smartkio_is_superuser") === "true";
  return (
    <main className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <Sidebar tab={tab} onTab={setTab} isSuperuser={superuser} onLogout={() => { localStorage.clear(); location.reload(); }} />
      <section className="mx-auto w-full max-w-[1440px] p-4 sm:p-6 md:p-10">
        <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-emerald-700">SMARTKIO ANALYTICS</p>
            <h2 className="mt-1 text-3xl font-black">{tab === "statistics" ? "연습 현황" : "회원 계정"}</h2>
          </div>
          {tab === "statistics" ? <button className="rounded-xl bg-forest px-4 py-2 font-bold text-white hover:bg-emerald-900" onClick={() => void reload()}>새로고침</button> : null}
        </header>
        {error ? <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        {tab === "statistics" ? <StatisticsDashboard sessions={sessions} loading={loading} /> : <AccountsPanel />}
      </section>
    </main>
  );
}

export default function App() {
  const [logged, setLogged] = useState(Boolean(localStorage.getItem("smartkio_token")));
  return logged ? <Dashboard /> : <LoginPage onDone={() => setLogged(true)} />;
}

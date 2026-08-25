import { FormEvent, useState } from "react";
import { request } from "./api";
import { LoginPage } from "./components/LoginPage";
import { AccountsPanel } from "./components/AccountsPanel";

import { Sidebar, Tab } from "./components/Sidebar";
import { useDashboardData } from "./hooks/useDashboardData";

function Dashboard() {
  const [tab, setTab] = useState<Tab>("products");
  const [message, setMessage] = useState("");
  const { error, reload } = useDashboardData();
  async function addProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      await request("/api/products/", {
        method: "POST",
        body: JSON.stringify({
          name: data.get("name"),
          price: Number(data.get("price")),
          category: Number(data.get("category")),
          is_available: true,
        }),
      });
      event.currentTarget.reset();
      await reload();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "상품을 저장하지 못했습니다.",
      );
    }
  }
  const superuser = localStorage.getItem("smartkio_is_superuser") === "true";
  return (
    <main className="min-h-screen md:grid md:grid-cols-[220px_1fr]">
      <Sidebar
        tab={tab}
        onTab={setTab}
        isSuperuser={superuser}
        onLogout={() => {
          localStorage.clear();
          location.reload();
        }}
      />
      <section className="mx-auto w-full max-w-6xl p-6 md:p-10">
        <header className="mb-7 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest text-slate-500">
              STORE CONSOLE
            </p>
            <h2 className="mt-1 text-3xl font-black">
              {tab === "products"
                ? "상품 관리"
                : tab === "orders"
                  ? "주문 내역"
                  : "회원 계정"}
            </h2>
          </div>
          <button
            className="rounded-xl bg-forest px-4 py-2 font-bold text-white hover:bg-emerald-900"
            onClick={() => void reload()}
          >
            새로고침
          </button>
        </header>
        {(error || message) && (
          <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {error || message}
          </p>
        )}
        <AccountsPanel />
      </section>
    </main>
  );
}
export default function App() {
  const [logged, setLogged] = useState(
    Boolean(localStorage.getItem("smartkio_token")),
  );
  return logged ? <Dashboard /> : <LoginPage onDone={() => setLogged(true)} />;
}

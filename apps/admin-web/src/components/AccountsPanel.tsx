import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { request } from "../api";
import type { KioskAccount } from "../types";
import { AccountDetailPanel } from "./AccountDetailPanel";
export function AccountsPanel() {
  const [accounts, setAccounts] = useState<KioskAccount[]>([]);
  const [selected, setSelected] = useState<KioskAccount | null>(null);
  const [q, setQ] = useState("");
  const [creating, setCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setAccounts(await request<KioskAccount[]>("/api/kiosk-accounts/"));
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  const rows = useMemo(
    () => accounts.filter((a) => a.username.includes(q)),
    [accounts, q],
  );
  async function save(e: FormEvent<HTMLFormElement>, a: KioskAccount) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    await request(`/api/kiosk-accounts/${a.id}/`, {
      method: "PATCH",
      body: JSON.stringify({
        expires_at: new Date(String(d.get("expires_at"))).toISOString(),
        is_active: d.get("is_active") === "on",
      }),
    });
    void load();
  }
  async function createAccount(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const password = String(data.get("password") ?? "");
    if (password !== String(data.get("password_confirm") ?? "")) {
      setError("비밀번호가 서로 일치하지 않습니다.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const account = await request<KioskAccount>("/api/kiosk-accounts/", {
        method: "POST",
        body: JSON.stringify({
          username: String(data.get("username") ?? "").trim(),
          password,
          expires_at: new Date(String(data.get("expires_at"))).toISOString(),
          is_active: true,
        }),
      });
      await load();
      setMessage(`${account.username} 계정을 만들었습니다.`);
      setCreating(false);
      form.reset();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "계정을 만들지 못했습니다.");
    } finally {
      setSubmitting(false);
    }
  }
  if (selected) {
    return <AccountDetailPanel account={selected} onBack={() => setSelected(null)} />;
  }
  if (creating) {
    return (
      <section className="mx-auto max-w-2xl rounded-3xl bg-white p-6 shadow-sm sm:p-9">
        <button className="mb-7 font-bold text-slate-500 hover:text-slate-900" onClick={() => { setCreating(false); setError(""); }} type="button">
          ← 회원 계정 목록
        </button>
        <div className="mb-8">
          <p className="text-sm font-bold text-emerald-700">KIOSK ACCOUNT</p>
          <h3 className="mt-1 text-2xl font-black">새 연습 계정 만들기</h3>
          <p className="mt-2 text-sm text-slate-500">사용자가 키오스크 앱에 로그인할 아이디와 이용 기간을 설정합니다.</p>
        </div>
        {error ? <p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p> : null}
        <form className="space-y-5" onSubmit={(e) => void createAccount(e)}>
          <label className="block">
            <span className="mb-2 block text-sm font-bold">로그인 아이디</span>
            <input autoComplete="username" className="w-full rounded-xl border border-slate-200 p-3.5 focus:border-emerald-600 focus:outline-none" minLength={3} name="username" placeholder="예: smartkio01" required />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-bold">비밀번호</span>
              <input autoComplete="new-password" className="w-full rounded-xl border border-slate-200 p-3.5 focus:border-emerald-600 focus:outline-none" minLength={4} name="password" placeholder="4자 이상" required type="password" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold">비밀번호 확인</span>
              <input autoComplete="new-password" className="w-full rounded-xl border border-slate-200 p-3.5 focus:border-emerald-600 focus:outline-none" minLength={4} name="password_confirm" placeholder="한 번 더 입력" required type="password" />
            </label>
          </div>
          <label className="block">
            <span className="mb-2 block text-sm font-bold">이용 만료일</span>
            <input className="w-full rounded-xl border border-slate-200 p-3.5 focus:border-emerald-600 focus:outline-none" min={new Date().toISOString().slice(0, 10)} name="expires_at" required type="date" />
          </label>
          <button className="w-full rounded-xl bg-forest px-5 py-4 text-lg font-black text-white hover:bg-emerald-900 disabled:cursor-wait disabled:opacity-60" disabled={submitting} type="submit">
            {submitting ? "계정 생성 중..." : "회원 계정 생성"}
          </button>
        </form>
      </section>
    );
  }
  return (
    <>
      {message ? <p role="status" className="mb-4 rounded-xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800">{message}</p> : null}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <input
          className="w-full max-w-sm rounded-xl border border-slate-200 p-3"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="아이디 검색"
        />
        <button className="rounded-xl bg-forest px-5 py-3 font-black text-white hover:bg-emerald-900" onClick={() => { setCreating(true); setMessage(""); }} type="button">
          + 새 계정 만들기
        </button>
      </div>
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="p-4">아이디</th>
              <th>유효기간</th>
              <th>상태</th>
              <th>마지막 로그인</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr className="border-t border-slate-100" key={a.id}>
                <td className="p-4 font-bold"><button className="text-emerald-800 underline-offset-4 hover:underline" onClick={() => setSelected(a)} type="button">{a.username}</button></td>
                <td>{new Date(a.expires_at).toLocaleDateString("ko-KR")}</td>
                <td
                  className={a.is_active ? "text-emerald-700" : "text-red-600"}
                >
                  {a.is_active ? "사용" : "중지"}
                </td>
                <td>
                  {a.last_login_at
                    ? new Date(a.last_login_at).toLocaleString("ko-KR")
                    : "-"}
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button className="rounded border border-emerald-700 px-3 py-1 font-bold text-emerald-800" onClick={() => setSelected(a)} type="button">통계 보기</button>
                    <form className="flex gap-2" onSubmit={(e) => void save(e, a)}>
                    <input
                      className="rounded border p-1"
                      name="expires_at"
                      type="date"
                      defaultValue={a.expires_at.slice(0, 10)}
                    />
                    <label>
                      <input
                        name="is_active"
                        type="checkbox"
                        defaultChecked={a.is_active}
                      />{" "}
                      사용
                    </label>
                    <button className="rounded bg-forest px-3 py-1 text-white">
                      저장
                    </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

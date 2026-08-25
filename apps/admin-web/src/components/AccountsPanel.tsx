import { FormEvent, useEffect, useMemo, useState } from "react";
import { request } from "../api";
type Account = {
  id: number;
  username: string;
  expires_at: string;
  is_active: boolean;
  last_login_at: string | null;
};
export function AccountsPanel() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [q, setQ] = useState("");
  const load = async () =>
    setAccounts(await request<Account[]>("/api/kiosk-accounts/"));
  useEffect(() => {
    void load();
  }, []);
  const rows = useMemo(
    () => accounts.filter((a) => a.username.includes(q)),
    [accounts, q],
  );
  async function save(e: FormEvent<HTMLFormElement>, a: Account) {
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
  return (
    <>
      <input
        className="mb-4 w-full max-w-sm rounded-xl border border-slate-200 p-3"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="아이디 검색"
      />
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
                <td className="p-4 font-bold">{a.username}</td>
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
                  <form
                    className="flex gap-2"
                    onSubmit={(e) => void save(e, a)}
                  >
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

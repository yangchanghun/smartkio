import { FormEvent, useState } from "react";
import { request } from "../api";

export function LoginPage({ onDone }: { onDone: () => void }) {
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      const result = await request<{ token: string; is_superuser: boolean }>("/api/auth/login/", { method: "POST", body: JSON.stringify({ username: data.get("username"), password: data.get("password") }) });
      localStorage.setItem("smartkio_token", result.token);
      localStorage.setItem("smartkio_is_superuser", String(result.is_superuser));
      onDone();
    } catch (error) { setError(error instanceof Error ? error.message : "로그인에 실패했습니다."); }
  }
  return <main className="grid min-h-screen place-items-center p-5"><form className="w-full max-w-sm rounded-3xl bg-white p-9 shadow-2xl shadow-emerald-950/10" onSubmit={submit}><p className="mb-1 text-sm font-bold tracking-widest text-leaf">SMARTKIO</p><h1 className="m-0 text-3xl font-black text-forest">매장 운영 관리자</h1><p className="mb-6 text-sm text-slate-500">등록된 계정으로 로그인하세요.</p><input className="mb-3 w-full rounded-xl border border-slate-200 p-3" name="username" defaultValue="admin" placeholder="아이디" required /><input className="mb-3 w-full rounded-xl border border-slate-200 p-3" name="password" type="password" defaultValue="admin1234!" placeholder="비밀번호" required /><button className="w-full rounded-xl bg-leaf p-3 font-bold text-white hover:bg-emerald-800">로그인</button>{error && <p className="mt-3 text-sm text-red-700">{error}</p>}</form></main>;
}

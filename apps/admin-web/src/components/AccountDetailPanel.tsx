import { useCallback, useEffect, useState } from "react";
import { download, request } from "../api";
import type { KioskAccount, PracticeSession, PracticeSessionPage, PracticeSummary } from "../types";

const STATUS_LABEL = { COMPLETED: "성공", FAILED: "실패", IN_PROGRESS: "진행 중" } as const;

function duration(seconds: number | null) {
  if (seconds === null) return "-";
  const minutes = Math.floor(seconds / 60);
  return minutes ? `${minutes}분 ${seconds % 60}초` : `${seconds}초`;
}

function localApiPath(url: string) {
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
}

export function AccountDetailPanel({ account, onBack }: { account: KioskAccount; onBack: () => void }) {
  const [summary, setSummary] = useState<PracticeSummary | null>(null);
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [statistics, page] = await Promise.all([
        request<PracticeSummary>(`/api/practice-sessions/account-statistics/?account_id=${account.id}`),
        request<PracticeSessionPage>(`/api/practice-sessions/?account_id=${account.id}&page_size=50`),
      ]);
      setSummary(statistics);
      setSessions(page.results);
      setNext(page.next);
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "통계를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [account.id]);

  useEffect(() => { void load(); }, [load]);

  async function loadMore() {
    if (!next || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await request<PracticeSessionPage>(localApiPath(next));
      setSessions((current) => [...current, ...page.results]);
      setNext(page.next);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "다음 기록을 불러오지 못했습니다.");
    } finally {
      setLoadingMore(false);
    }
  }

  async function exportExcel() {
    setExporting(true);
    try {
      await download(`/api/practice-sessions/export/?account_id=${account.id}`);
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "엑셀을 다운로드하지 못했습니다.");
    } finally {
      setExporting(false);
    }
  }

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white p-6 shadow-sm">
      <div>
        <button className="mb-3 font-bold text-slate-500 hover:text-slate-900" onClick={onBack} type="button">← 회원 계정 목록</button>
        <h3 className="text-2xl font-black">{account.username} 계정 통계</h3>
        <p className="mt-1 text-sm text-slate-500">만료일 {new Date(account.expires_at).toLocaleDateString("ko-KR")} · {account.is_active ? "사용 중" : "사용 중지"}</p>
      </div>
      <button className="w-full rounded-xl bg-emerald-700 px-6 py-4 text-lg font-black text-white shadow-sm hover:bg-emerald-800 disabled:opacity-50 sm:w-auto" disabled={loading || exporting} onClick={() => void exportExcel()} type="button">
        {exporting ? "엑셀 생성 중..." : "↓ 엑셀 다운로드"}
      </button>
    </div>
    {error ? <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p> : null}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {[["전체 연습", `${summary?.total ?? 0}회`], ["성공", `${summary?.completed ?? 0}회`], ["실패", `${summary?.failed ?? 0}회`], ["성공률", `${summary?.rate ?? 0}%`], ["평균 성공 시간", duration(summary?.average ?? null)]].map(([label, value]) => <div className="rounded-2xl bg-white p-5 shadow-sm" key={label}><p className="text-sm font-bold text-slate-500">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div>)}
    </div>
    <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 p-6 pb-4"><h4 className="text-xl font-black">전체 연습 기록</h4><span className="text-sm text-slate-500">최신순 · {sessions.length}건 표시</span></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-4 pl-6">서비스</th><th>결과</th><th>소요 시간</th><th>시작 시간</th><th>종료 시간</th><th>종료 사유</th></tr></thead><tbody>{sessions.map((item) => <tr className="border-t border-slate-100" key={item.id}><td className="p-4 pl-6 font-bold">{item.service_name}</td><td>{STATUS_LABEL[item.status]}</td><td>{duration(item.duration_seconds)}</td><td>{new Date(item.started_at).toLocaleString("ko-KR")}</td><td>{item.finished_at ? new Date(item.finished_at).toLocaleString("ko-KR") : "-"}</td><td className="text-slate-500">{item.failure_reason || "-"}</td></tr>)}</tbody></table></div>
      {next ? <div className="border-t border-slate-100 p-4 text-center"><button className="rounded-xl border border-emerald-700 px-6 py-3 font-bold text-emerald-800 hover:bg-emerald-50 disabled:opacity-50" disabled={loadingMore} onClick={() => void loadMore()} type="button">{loadingMore ? "불러오는 중..." : "기록 더 보기"}</button></div> : null}
      {!loading && !sessions.length ? <p className="p-6 text-sm text-slate-400">아직 기록된 연습 데이터가 없습니다.</p> : null}
      {loading ? <p className="p-6 text-sm text-slate-400">계정 통계를 불러오는 중입니다.</p> : null}
    </section>
  </div>;
}

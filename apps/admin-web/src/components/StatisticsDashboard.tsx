import { useMemo, useState } from "react";
import type { PracticeSession } from "../types";

type Range = "7" | "30" | "all";
const STATUS_LABEL = { COMPLETED: "성공", FAILED: "실패", IN_PROGRESS: "진행 중" } as const;

function formatDuration(seconds: number | null) {
  if (seconds === null) return "-";
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return minutes ? `${minutes}분 ${rest}초` : `${rest}초`;
}

export function StatisticsDashboard({ sessions, loading }: { sessions: PracticeSession[]; loading: boolean }) {
  const [range, setRange] = useState<Range>("30");
  const filtered = useMemo(() => {
    const threshold = range === "all" ? 0 : Date.now() - Number(range) * 86_400_000;
    return sessions.filter((session) => !threshold || new Date(session.started_at).getTime() >= threshold);
  }, [range, sessions]);

  const summary = useMemo(() => {
    const completed = filtered.filter((item) => item.status === "COMPLETED");
    const failed = filtered.filter((item) => item.status === "FAILED");
    const durations = completed.flatMap((item) => item.duration_seconds === null ? [] : [item.duration_seconds]);
    return { total: filtered.length, completed: completed.length, failed: failed.length, progress: filtered.filter((item) => item.status === "IN_PROGRESS").length, rate: filtered.length ? Math.round(completed.length / filtered.length * 100) : 0, average: durations.length ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length) : null };
  }, [filtered]);

  const byService = useMemo(() => {
    const map = new Map<string, { name: string; total: number; completed: number; durations: number[] }>();
    for (const item of filtered) {
      const row = map.get(item.service) ?? { name: item.service_name, total: 0, completed: 0, durations: [] };
      row.total += 1;
      if (item.status === "COMPLETED") { row.completed += 1; if (item.duration_seconds !== null) row.durations.push(item.duration_seconds); }
      map.set(item.service, row);
    }
    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [filtered]);

  const byAccount = useMemo(() => {
    const map = new Map<string, { total: number; completed: number; failed: number; last: string }>();
    for (const item of filtered) {
      const row = map.get(item.username) ?? { total: 0, completed: 0, failed: 0, last: item.started_at };
      row.total += 1;
      if (item.status === "COMPLETED") row.completed += 1;
      if (item.status === "FAILED") row.failed += 1;
      if (item.started_at > row.last) row.last = item.started_at;
      map.set(item.username, row);
    }
    return [...map.entries()].sort(([, a], [, b]) => b.last.localeCompare(a.last));
  }, [filtered]);

  if (loading) return <div className="rounded-3xl bg-white p-10 text-center text-slate-500 shadow-sm">통계를 불러오는 중입니다.</div>;
  return <div className="space-y-6">
    <div className="flex flex-wrap gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex rounded-xl bg-slate-100 p-1">{(["7", "30", "all"] as Range[]).map((value) => <button key={value} onClick={() => setRange(value)} className={`rounded-lg px-4 py-2 text-sm font-bold ${range === value ? "bg-forest text-white" : "text-slate-600"}`}>{value === "all" ? "전체" : `최근 ${value}일`}</button>)}</div>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6"><Metric label="전체 연습" value={`${summary.total}회`} /><Metric label="성공" value={`${summary.completed}회`} tone="green" /><Metric label="실패" value={`${summary.failed}회`} tone="red" /><Metric label="진행 중" value={`${summary.progress}회`} tone="blue" /><Metric label="성공률" value={`${summary.rate}%`} tone="green" /><Metric label="평균 성공 시간" value={formatDuration(summary.average)} /></div>
    <div className="grid gap-6 xl:grid-cols-[1fr_1.35fr]">
      <section className="rounded-3xl bg-white p-6 shadow-sm"><h3 className="mb-5 text-xl font-black">서비스별 성공률</h3><div className="space-y-5">{byService.length ? byService.map((row) => { const rate = row.total ? Math.round(row.completed / row.total * 100) : 0; const average = row.durations.length ? Math.round(row.durations.reduce((sum, value) => sum + value, 0) / row.durations.length) : null; return <div key={row.name}><div className="mb-2 flex justify-between gap-3 text-sm"><strong>{row.name}</strong><span className="text-slate-500">{row.completed}/{row.total} 성공 · 평균 {formatDuration(average)}</span></div><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${rate}%` }} /></div></div>; }) : <Empty />}</div></section>
      <section className="overflow-hidden rounded-3xl bg-white shadow-sm"><h3 className="p-6 pb-4 text-xl font-black">계정별 연습 현황</h3><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-4 pl-6">계정</th><th>전체</th><th>성공</th><th>실패</th><th>성공률</th><th>최근 연습</th></tr></thead><tbody>{byAccount.map(([username, row]) => <tr key={username} className="border-t border-slate-100"><td className="p-4 pl-6 font-bold">{username}</td><td>{row.total}</td><td className="text-emerald-700">{row.completed}</td><td className="text-red-600">{row.failed}</td><td>{row.total ? Math.round(row.completed / row.total * 100) : 0}%</td><td>{new Date(row.last).toLocaleString("ko-KR")}</td></tr>)}</tbody></table></div>{!byAccount.length ? <div className="p-6"><Empty /></div> : null}</section>
    </div>
    <section className="overflow-hidden rounded-3xl bg-white shadow-sm"><h3 className="p-6 pb-4 text-xl font-black">최근 연습 기록</h3><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-4 pl-6">계정</th><th>연습 서비스</th><th>결과</th><th>소요 시간</th><th>시작 시간</th><th>종료 사유</th></tr></thead><tbody>{filtered.slice(0, 30).map((item) => <tr key={item.id} className="border-t border-slate-100"><td className="p-4 pl-6 font-bold">{item.username}</td><td>{item.service_name}</td><td><Status value={item.status} /></td><td>{formatDuration(item.duration_seconds)}</td><td>{new Date(item.started_at).toLocaleString("ko-KR")}</td><td className="text-slate-500">{item.failure_reason || "-"}</td></tr>)}</tbody></table></div>{!filtered.length ? <div className="p-6"><Empty /></div> : null}</section>
  </div>;
}

function Metric({ label, value, tone = "slate" }: { label: string; value: string; tone?: "slate" | "green" | "red" | "blue" }) { const colors = { slate: "text-slate-900", green: "text-emerald-700", red: "text-red-600", blue: "text-blue-600" }; return <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm font-bold text-slate-500">{label}</p><p className={`mt-2 text-3xl font-black ${colors[tone]}`}>{value}</p></div>; }
function Status({ value }: { value: PracticeSession["status"] }) { const colors = value === "COMPLETED" ? "bg-emerald-50 text-emerald-700" : value === "FAILED" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"; return <span className={`rounded-full px-3 py-1 text-xs font-bold ${colors}`}>{STATUS_LABEL[value]}</span>; }
function Empty() { return <p className="text-sm text-slate-400">아직 기록된 연습 데이터가 없습니다.</p>; }

import { useCallback, useEffect, useMemo, useState } from "react";
import { request } from "../api";
import type { KioskAccount, PracticeSession } from "../types";

const STATUS_LABEL = { COMPLETED: "성공", FAILED: "실패", IN_PROGRESS: "진행 중" } as const;

function duration(seconds: number | null) {
  if (seconds === null) return "-";
  const minutes = Math.floor(seconds / 60);
  return minutes ? `${minutes}분 ${seconds % 60}초` : `${seconds}초`;
}

function escapeXml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function cell(value: unknown, type: "String" | "Number" = "String", style = "") {
  return `<Cell${style ? ` ss:StyleID="${style}"` : ""}><Data ss:Type="${type}">${escapeXml(value)}</Data></Cell>`;
}

function downloadExcel(account: KioskAccount, sessions: PracticeSession[]) {
  const completed = sessions.filter((item) => item.status === "COMPLETED").length;
  const failed = sessions.filter((item) => item.status === "FAILED").length;
  const summaryRows = [
    ["계정 아이디", account.username],
    ["계정 상태", account.is_active ? "사용" : "중지"],
    ["이용 만료일", new Date(account.expires_at).toLocaleDateString("ko-KR")],
    ["전체 연습", sessions.length],
    ["성공", completed],
    ["실패", failed],
    ["성공률", sessions.length ? `${Math.round((completed / sessions.length) * 100)}%` : "0%"],
  ];
  const summaryXml = summaryRows.map(([label, value]) => `<Row>${cell(label, "String", "Header")}${cell(value, typeof value === "number" ? "Number" : "String")}</Row>`).join("");
  const recordHeader = ["번호", "서비스", "결과", "소요 시간(초)", "시작 시간", "종료 시간", "종료 사유"]
    .map((value) => cell(value, "String", "Header"))
    .join("");
  const recordRows = sessions.map((item, index) => `<Row>${cell(index + 1, "Number")}${cell(item.service_name)}${cell(STATUS_LABEL[item.status])}${item.duration_seconds === null ? cell("") : cell(item.duration_seconds, "Number")}${cell(new Date(item.started_at).toLocaleString("ko-KR"))}${cell(item.finished_at ? new Date(item.finished_at).toLocaleString("ko-KR") : "-")}${cell(item.failure_reason || "-")}</Row>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Styles><Style ss:ID="Default"><Alignment ss:Vertical="Center"/><Font ss:FontName="맑은 고딕" ss:Size="11"/></Style><Style ss:ID="Header"><Font ss:Bold="1"/><Interior ss:Color="#D1FAE5" ss:Pattern="Solid"/></Style></Styles><Worksheet ss:Name="계정 요약"><Table><Column ss:Width="130"/><Column ss:Width="180"/>${summaryXml}</Table></Worksheet><Worksheet ss:Name="연습 기록"><Table><Column ss:Width="50"/><Column ss:Width="120"/><Column ss:Width="80"/><Column ss:Width="100"/><Column ss:Width="150"/><Column ss:Width="150"/><Column ss:Width="130"/><Row>${recordHeader}</Row>${recordRows}</Table></Worksheet></Workbook>`;
  const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${account.username}_연습통계_${new Date().toISOString().slice(0, 10)}.xls`;
  link.click();
  URL.revokeObjectURL(url);
}

export function AccountDetailPanel({ account, onBack }: { account: KioskAccount; onBack: () => void }) {
  const [allSessions, setAllSessions] = useState<PracticeSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try {
      setAllSessions(await request<PracticeSession[]>("/api/practice-sessions/"));
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "통계를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const sessions = useMemo(() => allSessions.filter((item) => item.username === account.username), [account.username, allSessions]);
  const completed = sessions.filter((item) => item.status === "COMPLETED").length;
  const failed = sessions.filter((item) => item.status === "FAILED").length;
  const averageItems = sessions.flatMap((item) => item.status === "COMPLETED" && item.duration_seconds !== null ? [item.duration_seconds] : []);
  const average = averageItems.length ? Math.round(averageItems.reduce((sum, value) => sum + value, 0) / averageItems.length) : null;

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white p-6 shadow-sm">
      <div>
        <button className="mb-3 font-bold text-slate-500 hover:text-slate-900" onClick={onBack} type="button">← 회원 계정 목록</button>
        <h3 className="text-2xl font-black">{account.username} 계정 통계</h3>
        <p className="mt-1 text-sm text-slate-500">만료일 {new Date(account.expires_at).toLocaleDateString("ko-KR")} · {account.is_active ? "사용 중" : "사용 중지"}</p>
      </div>
      <button className="rounded-xl bg-emerald-700 px-5 py-3 font-black text-white hover:bg-emerald-800 disabled:opacity-50" disabled={loading} onClick={() => downloadExcel(account, sessions)} type="button">엑셀 다운로드</button>
    </div>
    {error ? <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p> : null}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {[['전체 연습', `${sessions.length}회`], ['성공', `${completed}회`], ['실패', `${failed}회`], ['성공률', `${sessions.length ? Math.round((completed / sessions.length) * 100) : 0}%`], ['평균 성공 시간', duration(average)]].map(([label, value]) => <div className="rounded-2xl bg-white p-5 shadow-sm" key={label}><p className="text-sm font-bold text-slate-500">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div>)}
    </div>
    <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
      <h4 className="p-6 pb-4 text-xl font-black">전체 연습 기록</h4>
      <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-4 pl-6">서비스</th><th>결과</th><th>소요 시간</th><th>시작 시간</th><th>종료 시간</th><th>종료 사유</th></tr></thead><tbody>{sessions.map((item) => <tr className="border-t border-slate-100" key={item.id}><td className="p-4 pl-6 font-bold">{item.service_name}</td><td>{STATUS_LABEL[item.status]}</td><td>{duration(item.duration_seconds)}</td><td>{new Date(item.started_at).toLocaleString("ko-KR")}</td><td>{item.finished_at ? new Date(item.finished_at).toLocaleString("ko-KR") : "-"}</td><td className="text-slate-500">{item.failure_reason || "-"}</td></tr>)}</tbody></table></div>
      {!loading && !sessions.length ? <p className="p-6 text-sm text-slate-400">아직 기록된 연습 데이터가 없습니다.</p> : null}
      {loading ? <p className="p-6 text-sm text-slate-400">계정 통계를 불러오는 중입니다.</p> : null}
    </section>
  </div>;
}

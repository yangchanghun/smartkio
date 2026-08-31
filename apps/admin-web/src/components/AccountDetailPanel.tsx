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

function cell(value: unknown, type: "String" | "Number" = "String", style = "", mergeAcross = 0) {
  return `<Cell${style ? ` ss:StyleID="${style}"` : ""}${mergeAcross ? ` ss:MergeAcross="${mergeAcross}"` : ""}><Data ss:Type="${type}">${escapeXml(value)}</Data></Cell>`;
}

function excelDate(value: string) {
  const date = new Date(value);
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds} (${weekdays[date.getDay()]})`;
}

function downloadExcel(account: KioskAccount, sessions: PracticeSession[]) {
  const completed = sessions.filter((item) => item.status === "COMPLETED").length;
  const failed = sessions.filter((item) => item.status === "FAILED").length;
  const successRate = sessions.length ? Math.round((completed / sessions.length) * 100) : 0;
  const recordHeader = ["N", "날짜", "섹션", "소요시간", "결과"]
    .map((value) => cell(value, "String", "Header"))
    .join("");
  const recordRows = sessions.map((item, index) => `<Row ss:Height="24">${cell(index + 1, "Number", "Center")}${cell(excelDate(item.started_at), "String", "Center")}${cell(item.service_name, "String", "Center")}${cell(duration(item.duration_seconds), "String", "Center")}${cell(STATUS_LABEL[item.status], "String", item.status === "COMPLETED" ? "Success" : item.status === "FAILED" ? "Failure" : "Progress")}</Row>`).join("");
  const styles = `<Styles>
    <Style ss:ID="Default"><Alignment ss:Vertical="Center"/><Font ss:FontName="맑은 고딕" ss:Size="11"/></Style>
    <Style ss:ID="Border"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/></Borders></Style>
    <Style ss:ID="Title" ss:Parent="Border"><Font ss:FontName="맑은 고딕" ss:Size="12" ss:Bold="1"/><Interior ss:Color="#E2F0D9" ss:Pattern="Solid"/></Style>
    <Style ss:ID="Header" ss:Parent="Border"><Font ss:FontName="맑은 고딕" ss:Size="11" ss:Bold="1"/><Interior ss:Color="#F2F2F2" ss:Pattern="Solid"/></Style>
    <Style ss:ID="Center" ss:Parent="Border"/>
    <Style ss:ID="Success" ss:Parent="Border"><Font ss:FontName="맑은 고딕" ss:Size="11" ss:Bold="1" ss:Color="#008000"/></Style>
    <Style ss:ID="Failure" ss:Parent="Border"><Font ss:FontName="맑은 고딕" ss:Size="11" ss:Bold="1" ss:Color="#C00000"/></Style>
    <Style ss:ID="Progress" ss:Parent="Border"><Font ss:FontName="맑은 고딕" ss:Size="11" ss:Bold="1" ss:Color="#0070C0"/></Style>
  </Styles>`;
  const summary = `<Row ss:Height="28">${cell(`${account.username}의 키오스크`, "String", "Title", 1)}${cell("진행", "String", "Title")}${cell("성공/실패", "String", "Title")}${cell("성공률", "String", "Title")}</Row>
    <Row ss:Height="28">${cell("전체성공률", "String", "Title", 1)}${cell(`${sessions.length}회`, "String", "Title")}${cell(`${completed}회/${failed}회`, "String", "Title")}${cell(`${successRate}%`, "String", "Title")}</Row>
    <Row ss:Height="12">${cell("")}</Row>`;
  const xml = `<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:x="urn:schemas-microsoft-com:office:excel">${styles}<Worksheet ss:Name="연습 통계"><Table><Column ss:Width="45"/><Column ss:Width="250"/><Column ss:Width="120"/><Column ss:Width="110"/><Column ss:Width="95"/>${summary}<Row ss:Height="25">${recordHeader}</Row>${recordRows}</Table><WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel"><Selected/><FreezePanes/><FrozenNoSplit/><SplitHorizontal>4</SplitHorizontal><TopRowBottomPane>4</TopRowBottomPane><PageSetup><Layout x:Orientation="Landscape"/></PageSetup></WorksheetOptions></Worksheet></Workbook>`;
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
      <button className="w-full rounded-xl bg-emerald-700 px-6 py-4 text-lg font-black text-white shadow-sm hover:bg-emerald-800 disabled:opacity-50 sm:w-auto" disabled={loading} onClick={() => downloadExcel(account, sessions)} type="button">
        ↓ 엑셀 다운로드
      </button>
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

// 개발 환경에서는 빈 값으로 두면 Vite의 /api 프록시를 사용합니다.
const API = import.meta.env.VITE_API_URL ?? "";
export const getToken = () => localStorage.getItem("smartkio_token");
export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API}${path}`, { ...options, headers: {"Content-Type": "application/json", ...(token ? {Authorization: `Token ${token}`} : {}), ...options.headers} });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const firstError = Object.values(payload).flat().find((value) => typeof value === "string");
    throw new Error(payload.detail || firstError || "요청에 실패했습니다.");
  }
  return response.json();
}
export async function download(path: string): Promise<void> {
  const token = getToken();
  const response = await fetch(`${API}${path}`, {
    headers: token ? { Authorization: `Token ${token}` } : {},
  });
  if (!response.ok) throw new Error("파일을 다운로드하지 못했습니다.");
  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition") ?? "";
  const encodedName = disposition.match(/filename\*=UTF-8''([^;]+)/)?.[1];
  const filename = encodedName ? decodeURIComponent(encodedName) : "연습통계.xls";
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
export { API };

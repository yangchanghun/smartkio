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
export { API };

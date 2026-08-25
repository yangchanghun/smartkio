import type { AddressSearchResult } from "../types";

const API_BASE = process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:8000";

export async function searchDeliveryAddresses(query: string, token: string) {
  const response = await fetch(
    `${API_BASE}/api/delivery/addresses/search/?q=${encodeURIComponent(query.trim())}`,
    { headers: { Authorization: `Token ${token}` } },
  );
  const rawBody = await response.text();
  let data: {
    results?: AddressSearchResult[];
    detail?: string;
  } = {};
  try {
    data = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    if (response.status === 404) {
      throw new Error("주소 검색 서버가 아직 배포되지 않았습니다.");
    }
    throw new Error("주소 검색 서버의 응답 형식이 올바르지 않습니다.");
  }
  if (!response.ok) {
    throw new Error(
      data.detail ||
        (response.status === 404
          ? "주소 검색 서버가 아직 배포되지 않았습니다."
          : "주소를 검색하지 못했습니다."),
    );
  }
  return data.results || [];
}

import type { TaxiPlace } from "../screens/TaxiDestinationScreen";

const API_BASE = process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:8000";

export type TaxiRoutePreview = {
  distance_meters: number;
  duration_seconds: number;
  taxi_fare: number;
  toll_fare: number;
};

export async function getTaxiRoutePreview(
  origin: TaxiPlace,
  destination: TaxiPlace,
  token: string,
) {
  if (
    origin.latitude == null ||
    origin.longitude == null ||
    destination.latitude == null ||
    destination.longitude == null
  ) {
    throw new Error("출발지와 도착지 위치를 다시 선택해 주세요.");
  }
  const params = new URLSearchParams({
    origin_longitude: String(origin.longitude),
    origin_latitude: String(origin.latitude),
    destination_longitude: String(destination.longitude),
    destination_latitude: String(destination.latitude),
  });
  const response = await fetch(`${API_BASE}/api/taxi/route-preview/?${params}`, {
    headers: { Authorization: `Token ${token}` },
  });
  const rawBody = await response.text();
  let data: Partial<TaxiRoutePreview> & { detail?: string } = {};
  try {
    data = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    throw new Error("택시 예상 요금 서버의 응답 형식이 올바르지 않습니다.");
  }
  if (!response.ok) {
    throw new Error(data.detail || "예상 시간과 요금을 불러오지 못했습니다.");
  }
  return data as TaxiRoutePreview;
}

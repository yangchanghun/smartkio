const API_BASE = process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:8000";

export type PracticeService =
  | "DELIVERY"
  | "KAKAOTALK"
  | "TAXI"
  | "COUPANG_SIGNUP"
  | "COUPANG_SHOPPING"
  | "GOV24_LOGIN"
  | "GOV24_TRANSCRIPT"
  | "GOV24_MOBILE_ID"
  | "KTX_BOOKING"
  | "KAKAOPAY_LOGIN"
  | "KAKAOPAY_ACCOUNT";

export type PracticeSessionRecord = {
  id: number;
  service: PracticeService;
  status: "IN_PROGRESS" | "COMPLETED" | "FAILED";
  started_at: string;
  finished_at: string | null;
  duration_seconds: number | null;
  failure_reason: string;
};

async function practiceRequest(
  path: string,
  token: string,
  body?: Record<string, string>,
) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.detail || "연습 기록을 저장하지 못했습니다.");
  }
  return payload as PracticeSessionRecord;
}

export function startPracticeSession(token: string, service: PracticeService) {
  return practiceRequest("/api/practice-sessions/start/", token, { service });
}

export function completePracticeSession(token: string, sessionId: number) {
  return practiceRequest(`/api/practice-sessions/${sessionId}/complete/`, token);
}

export function heartbeatPracticeSession(token: string, sessionId: number) {
  return practiceRequest(`/api/practice-sessions/${sessionId}/heartbeat/`, token);
}

export function abandonPracticeSession(
  token: string,
  sessionId: number,
  reason = "USER_EXIT",
) {
  return practiceRequest(`/api/practice-sessions/${sessionId}/abandon/`, token, {
    reason,
  });
}

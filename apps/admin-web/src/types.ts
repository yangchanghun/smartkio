export type PracticeStatus = "IN_PROGRESS" | "COMPLETED" | "FAILED";
export type PracticeSession = {
  id: number;
  username: string;
  service: string;
  service_name: string;
  status: PracticeStatus;
  started_at: string;
  finished_at: string | null;
  duration_seconds: number | null;
  failure_reason: string;
};

export type KioskAccount = {
  id: number;
  username: string;
  expires_at: string;
  is_active: boolean;
  last_login_at: string | null;
};

export type PracticeSummary = {
  total: number;
  completed: number;
  failed: number;
  progress: number;
  rate: number;
  average: number | null;
};

export type DashboardStatistics = {
  summary: PracticeSummary;
  by_service: Array<{ service: string; name: string; total: number; completed: number; average: number | null }>;
  by_account: Array<{ account_id: number; username: string; total: number; completed: number; failed: number; rate: number; last: string }>;
  recent: PracticeSession[];
};

export type PracticeSessionPage = {
  next: string | null;
  previous: string | null;
  results: PracticeSession[];
};

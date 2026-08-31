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

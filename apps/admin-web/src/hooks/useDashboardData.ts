import { useCallback, useEffect, useState } from "react";
import { request } from "../api";
import { PracticeSession } from "../types";

export function useDashboardData() {
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const reload = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setSessions(await request<PracticeSession[]>("/api/practice-sessions/"));
      setError("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "데이터를 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void reload();
    const timer = window.setInterval(() => void reload(true), 15_000);
    return () => window.clearInterval(timer);
  }, [reload]);
  return { sessions, loading, error, reload };
}

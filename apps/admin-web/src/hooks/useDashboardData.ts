import { useCallback, useEffect, useState } from "react";
import { request } from "../api";
import type { DashboardStatistics } from "../types";

export type StatisticsRange = "7" | "30" | "all";

export function useDashboardData() {
  const [data, setData] = useState<DashboardStatistics | null>(null);
  const [range, setRange] = useState<StatisticsRange>("30");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const reload = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setData(await request<DashboardStatistics>(`/api/practice-sessions/statistics/?range=${range}`));
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
  }, [range]);
  useEffect(() => {
    void reload();
    const timer = window.setInterval(() => void reload(true), 15_000);
    return () => window.clearInterval(timer);
  }, [reload]);
  return { data, range, setRange, loading, error, reload };
}

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
export type Session = { token: string; username: string; expires_at: string };
const key = "smartkio.kiosk.session",
  base = process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:8000";
const request = (path: string, token?: string, options: RequestInit = {}) =>
  fetch(`${base}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Token ${token}` } : {}),
    },
  });
export function useKioskSession() {
  const [session, setSession] = useState<Session | null>(null),
    [loading, setLoading] = useState(true);
  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(key);
    } finally {
      setSession(null);
    }
  }, []);
  const verify = useCallback(
    async (s: Session) => {
      try {
        if (!(await request("/api/products/", s.token)).ok) throw 0;
        setSession(s);
      } catch {
        await logout();
      } finally {
        setLoading(false);
      }
    },
    [logout],
  );
  const login = useCallback(async (s: Session) => {
    await AsyncStorage.setItem(key, JSON.stringify(s));
    setSession(s);
  }, []);
  useEffect(() => {
    const restore = async () => {
      try {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          const saved = JSON.parse(value) as Session;
          if (!saved.token || !saved.username || !saved.expires_at)
            throw new Error("Invalid saved session");
          await verify(saved);
          return;
        }
      } catch {
        try {
          await AsyncStorage.removeItem(key);
        } catch {}
      }
      setLoading(false);
    };
    void restore();
  }, [verify]);
  useEffect(() => {
    if (!session) return;
    const id = setInterval(() => void verify(session), 30000);
    return () => clearInterval(id);
  }, [session, verify]);
  return { session, loading, login, logout };
}
export async function kioskLogin(username: string, password: string) {
  const res = await request("/api/kiosk/auth/login/", undefined, {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "로그인에 실패했습니다.");
  return data as Session;
}

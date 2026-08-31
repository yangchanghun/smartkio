import { useCallback, useEffect, useRef } from "react";
import {
  abandonPracticeSession,
  completePracticeSession,
  type PracticeService,
  startPracticeSession,
} from "../services/practiceApi";

export function usePracticeSession(token: string, service: PracticeService) {
  const sessionPromise = useRef<Promise<number> | null>(null);
  const terminal = useRef(false);
  const mounted = useRef(true);

  const begin = useCallback(() => {
    terminal.current = false;
    const promise = startPracticeSession(token, service).then((session) => {
      if (!mounted.current && !terminal.current) {
        void abandonPracticeSession(token, session.id, "USER_EXIT");
      }
      return session.id;
    });
    sessionPromise.current = promise;
    return promise;
  }, [service, token]);

  useEffect(() => {
    mounted.current = true;
    void begin().catch(() => undefined);
    return () => {
      mounted.current = false;
      if (terminal.current) return;
      void sessionPromise.current
        ?.then((sessionId) =>
          abandonPracticeSession(token, sessionId, "USER_EXIT"),
        )
        .catch(() => undefined);
    };
  }, [begin, token]);

  const completePractice = useCallback(async () => {
    const sessionId = await sessionPromise.current;
    if (!sessionId || terminal.current) return;
    await completePracticeSession(token, sessionId);
    terminal.current = true;
  }, [token]);

  const restartPracticeSession = useCallback(async () => {
    if (!terminal.current) {
      const sessionId = await sessionPromise.current;
      if (sessionId) {
        await abandonPracticeSession(token, sessionId, "RESTARTED");
      }
    }
    return begin();
  }, [begin, token]);

  return { completePractice, restartPracticeSession };
}

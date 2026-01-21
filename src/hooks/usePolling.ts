"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface PollingOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  onAttempt?: (attempt: number) => void;
  onSuccess?: () => void;
  onTimeout?: () => void;
}

export function usePolling(
  callback: () => Promise<boolean>,
  enabled: boolean = true,
  options: PollingOptions = {}
) {
  const {
    maxAttempts = 30,
    initialDelay = 1000,
    maxDelay = 5000,
    onAttempt,
    onSuccess,
    onTimeout,
  } = options;

  const [attempt, setAttempt] = useState(0);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef(false);

  const stop = useCallback(() => {
    abortRef.current = true;
    setIsPolling(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  const start = useCallback(async () => {
    abortRef.current = false;
    setIsPolling(true);
    setAttempt(0);
    setError(null);

    const poll = async (currentAttempt: number) => {
      if (abortRef.current) {
        setIsPolling(false);
        return;
      }

      try {
        onAttempt?.(currentAttempt);
        const success = await callback();

        if (success) {
          setIsPolling(false);
          onSuccess?.();
          return;
        }

        if (currentAttempt >= maxAttempts) {
          setIsPolling(false);
          onTimeout?.();
          return;
        }

        // Exponential backoff: 1s, 1s, 1s, 2s, 2s, 3s, max 5s
        const delay = Math.min(
          initialDelay + Math.floor(currentAttempt / 3) * 1000,
          maxDelay
        );

        timerRef.current = setTimeout(() => {
          setAttempt(currentAttempt + 1);
          poll(currentAttempt + 1);
        }, delay);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Polling error");
        setIsPolling(false);
      }
    };

    poll(0);
  }, [
    callback,
    maxAttempts,
    initialDelay,
    maxDelay,
    onAttempt,
    onSuccess,
    onTimeout,
  ]);

  useEffect(() => {
    if (enabled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      start();
    }

    return () => {
      stop();
    };
  }, [enabled, start, stop]);

  return { isPolling, attempt, error, stop, start };
}

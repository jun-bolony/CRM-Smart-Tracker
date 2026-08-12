// frontend/src/hooks/useBackendHealth.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { checkHealth } from '../services/api';

const INITIAL_WAIT_SECONDS = 60;
const RETRY_WAIT_SECONDS = 15;
const REQUEST_TIMEOUT_MS = 3000;

export const useBackendHealth = () => {
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isWaiting, setIsWaiting] = useState(false);

  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  const stopTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startWakeUpTimer = useCallback(() => {
    setIsWaiting(true);
    let countdown = INITIAL_WAIT_SECONDS;
    setSecondsLeft(countdown);

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      countdown -= 1;
      setSecondsLeft(countdown);
      if (countdown <= 0) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        // When timer reaches 0, try to check again
        performCheck(false);
      }
    }, 1000);
  }, []);

  const performCheck = useCallback(async (isInitial: boolean) => {
    if (!isMountedRef.current) return;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      await checkHealth(controller.signal);
      // Success: backend is ready
      clearTimeout(timeoutId);
      if (isMountedRef.current) {
        stopTimers();
        setIsBackendReady(true);
        setIsWaiting(false);
        setSecondsLeft(0);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (!isMountedRef.current) return;
      // If error (including abort due to timeout), backend is not ready
      if (isInitial) {
        // First attempt failed, start wake-up timer
        startWakeUpTimer();
      } else {
        // Retry attempt failed, add extra 15 seconds and restart timer
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        let countdown = RETRY_WAIT_SECONDS;
        setSecondsLeft(countdown);
        setIsWaiting(true);
        intervalRef.current = window.setInterval(() => {
          countdown -= 1;
          setSecondsLeft(countdown);
          if (countdown <= 0) {
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            performCheck(false);
          }
        }, 1000);
      }
    }
  }, [startWakeUpTimer, stopTimers]);

  useEffect(() => {
    isMountedRef.current = true;
    // Start initial check immediately
    performCheck(true);

    return () => {
      isMountedRef.current = false;
      stopTimers();
    };
  }, [performCheck, stopTimers]);

  return { isBackendReady, secondsLeft, isWaiting };
};
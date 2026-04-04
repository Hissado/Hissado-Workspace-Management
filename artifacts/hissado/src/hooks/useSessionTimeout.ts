import { useState, useEffect, useRef, useCallback } from "react";

export const INACTIVITY_MINUTES = 55;
const INACTIVITY_MS = INACTIVITY_MINUTES * 60 * 1000;
const WARNING_MS    =  5 * 60 * 1000;
const WARNING_SECS  = WARNING_MS / 1000;

const ACTIVITY_EVENTS = ["click", "keydown", "mousedown", "touchstart", "scroll", "mousemove"] as const;

export function useSessionTimeout({
  enabled,
  onSignOut,
}: {
  enabled: boolean;
  onSignOut: () => void;
}) {
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(WARNING_SECS);

  const onSignOutRef = useRef(onSignOut);
  useEffect(() => { onSignOutRef.current = onSignOut; }, [onSignOut]);

  const inactivityRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const warnActiveRef  = useRef(false);

  const clearAll = useCallback(() => {
    if (inactivityRef.current)  { clearTimeout(inactivityRef.current);  inactivityRef.current  = null; }
    if (warningRef.current)     { clearTimeout(warningRef.current);     warningRef.current     = null; }
    if (countdownRef.current)   { clearInterval(countdownRef.current);  countdownRef.current   = null; }
  }, []);

  const beginWarning = useCallback(() => {
    warnActiveRef.current = true;
    setShowWarning(true);
    setCountdown(WARNING_SECS);

    countdownRef.current = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1));
    }, 1000);

    warningRef.current = setTimeout(() => {
      clearAll();
      onSignOutRef.current();
    }, WARNING_MS);
  }, [clearAll]);

  const resetInactivity = useCallback(() => {
    if (warnActiveRef.current) return;
    if (inactivityRef.current) clearTimeout(inactivityRef.current);
    inactivityRef.current = setTimeout(beginWarning, INACTIVITY_MS);
  }, [beginWarning]);

  const stayActive = useCallback(() => {
    warnActiveRef.current = false;
    clearAll();
    setShowWarning(false);
    inactivityRef.current = setTimeout(beginWarning, INACTIVITY_MS);
  }, [beginWarning, clearAll]);

  useEffect(() => {
    if (!enabled) return;

    inactivityRef.current = setTimeout(beginWarning, INACTIVITY_MS);

    const handler = () => resetInactivity();
    ACTIVITY_EVENTS.forEach((ev) =>
      window.addEventListener(ev, handler, { passive: true })
    );

    return () => {
      clearAll();
      ACTIVITY_EVENTS.forEach((ev) =>
        window.removeEventListener(ev, handler)
      );
    };
  }, [enabled, beginWarning, resetInactivity, clearAll]);

  return { showWarning, countdown, stayActive };
}

import { useEffect, useRef, useCallback, useState } from "react";
import type { Message, Conversation } from "@/lib/data";

export interface CallSignal {
  callId: string;
  callerId: string;
  callerName: string;
  callerColor?: string;
  roomName: string;
  videoEnabled: boolean;
}

export interface MessageSignal {
  fromId: string;
  fromName: string;
  text: string;
  conversationId: string;
  /** Full message object — allows the recipient to sync it into their local store. */
  message?: Message;
  /** Conversation object — allows the recipient to auto-create the thread if they don't have it. */
  conversation?: Conversation;
}

interface Handlers {
  onIncomingCall?: (signal: CallSignal) => void;
  onCallAccepted?: (callId: string, roomName: string, videoEnabled: boolean) => void;
  onCallDeclined?: (callId: string) => void;
  onCallEnded?: (callId: string) => void;
  onNewMessage?: (signal: MessageSignal) => void;
}

/* Exponential-backoff delays (ms) for SSE reconnection */
const BACKOFF = [2_000, 4_000, 8_000, 15_000, 30_000];

export function useRealtime(userId: string | null, handlers: Handlers) {
  const esRef = useRef<EventSource | null>(null);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  /* Incrementing this triggers a full reconnect of the EventSource
     (the effect re-runs with a fresh connection + all event handlers). */
  const [reconnectCount, setReconnectCount] = useState(0);
  const failCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!userId) return;

    /* Clear any pending retry timer from a previous cycle */
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }

    const es = new EventSource(
      `/api/signal/stream?userId=${encodeURIComponent(userId)}`
    );
    esRef.current = es;

    const on = (event: string, cb: (d: unknown) => void) => {
      es.addEventListener(event, (e: MessageEvent) => {
        try { cb(JSON.parse(e.data)); } catch { /* ignore malformed data */ }
      });
    };

    on("call-ring", (d) =>
      handlersRef.current.onIncomingCall?.(d as CallSignal));
    on("call-accept", (d) => {
      const s = d as { callId: string; roomName: string; videoEnabled: boolean };
      handlersRef.current.onCallAccepted?.(s.callId, s.roomName, s.videoEnabled);
    });
    on("call-decline", (d) =>
      handlersRef.current.onCallDeclined?.((d as { callId: string }).callId));
    on("call-end", (d) =>
      handlersRef.current.onCallEnded?.((d as { callId: string }).callId));
    on("new-message", (d) =>
      handlersRef.current.onNewMessage?.(d as MessageSignal));

    es.onopen = () => {
      /* Successful (re)connect — reset fail counter */
      failCountRef.current = 0;
    };

    es.onerror = () => {
      es.close();
      esRef.current = null;

      /* Exponential-backoff reconnect — picks next delay up to the cap */
      const delay = BACKOFF[Math.min(failCountRef.current, BACKOFF.length - 1)];
      failCountRef.current += 1;

      retryTimerRef.current = setTimeout(() => {
        setReconnectCount((c) => c + 1);
      }, delay);
    };

    return () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      es.close();
      esRef.current = null;
    };
    // reconnectCount is intentionally included so the effect re-runs on reconnect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, reconnectCount]);

  const signal = useCallback(async (to: string, event: string, data: unknown) => {
    try {
      await fetch("/api/signal/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, event, data }),
      });
    } catch { /* non-fatal */ }
  }, []);

  const ringUser = useCallback((toId: string, s: CallSignal) =>
    signal(toId, "call-ring", s), [signal]);

  const acceptCall = useCallback(
    (toId: string, callId: string, roomName: string, videoEnabled: boolean) =>
      signal(toId, "call-accept", { callId, roomName, videoEnabled }),
    [signal]
  );

  const declineCall = useCallback((toId: string, callId: string) =>
    signal(toId, "call-decline", { callId }), [signal]);

  const endCall = useCallback((toId: string, callId: string) =>
    signal(toId, "call-end", { callId }), [signal]);

  const notifyMessage = useCallback((toId: string, s: MessageSignal) =>
    signal(toId, "new-message", s), [signal]);

  return { ringUser, acceptCall, declineCall, endCall, notifyMessage };
}

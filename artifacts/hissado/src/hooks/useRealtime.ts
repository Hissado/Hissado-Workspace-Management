import { useEffect, useRef, useCallback } from "react";

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
}

interface Handlers {
  onIncomingCall?: (signal: CallSignal) => void;
  onCallAccepted?: (callId: string, roomName: string, videoEnabled: boolean) => void;
  onCallDeclined?: (callId: string) => void;
  onCallEnded?: (callId: string) => void;
  onNewMessage?: (signal: MessageSignal) => void;
}

export function useRealtime(userId: string | null, handlers: Handlers) {
  const esRef = useRef<EventSource | null>(null);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!userId) return;

    const es = new EventSource(`/api/signal/stream?userId=${encodeURIComponent(userId)}`);
    esRef.current = es;

    const on = (event: string, cb: (d: any) => void) => {
      es.addEventListener(event, (e: MessageEvent) => {
        try { cb(JSON.parse(e.data)); } catch { /* ignore */ }
      });
    };

    on("call-ring", (d: CallSignal) => handlersRef.current.onIncomingCall?.(d));
    on("call-accept", (d: { callId: string; roomName: string; videoEnabled: boolean }) =>
      handlersRef.current.onCallAccepted?.(d.callId, d.roomName, d.videoEnabled));
    on("call-decline", (d: { callId: string }) =>
      handlersRef.current.onCallDeclined?.(d.callId));
    on("call-end", (d: { callId: string }) =>
      handlersRef.current.onCallEnded?.(d.callId));
    on("new-message", (d: MessageSignal) =>
      handlersRef.current.onNewMessage?.(d));

    es.onerror = () => {
      es.close();
      esRef.current = null;
      setTimeout(() => {
        if (userId) {
          const next = new EventSource(`/api/signal/stream?userId=${encodeURIComponent(userId)}`);
          esRef.current = next;
        }
      }, 5000);
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [userId]);

  const signal = useCallback(async (to: string, event: string, data: unknown) => {
    try {
      await fetch("/api/signal/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, event, data }),
      });
    } catch { /* ignore */ }
  }, []);

  const ringUser = useCallback((toId: string, s: CallSignal) =>
    signal(toId, "call-ring", s), [signal]);

  const acceptCall = useCallback((toId: string, callId: string, roomName: string, videoEnabled: boolean) =>
    signal(toId, "call-accept", { callId, roomName, videoEnabled }), [signal]);

  const declineCall = useCallback((toId: string, callId: string) =>
    signal(toId, "call-decline", { callId }), [signal]);

  const endCall = useCallback((toId: string, callId: string) =>
    signal(toId, "call-end", { callId }), [signal]);

  const notifyMessage = useCallback((toId: string, s: MessageSignal) =>
    signal(toId, "new-message", s), [signal]);

  return { ringUser, acceptCall, declineCall, endCall, notifyMessage };
}

import { useState, useEffect, useRef, useCallback } from "react";
import { C } from "./primitives";
import { useI18n } from "@/lib/i18n";

/* ─── Language config ──────────────────────────────────────── */
const LANGS = [
  { code: "en", label: "English",    sr: "en-US" },
  { code: "fr", label: "Français",   sr: "fr-FR" },
  { code: "zh", label: "中文",        sr: "zh-CN" },
  { code: "es", label: "Español",    sr: "es-ES" },
  { code: "de", label: "Deutsch",    sr: "de-DE" },
  { code: "pt", label: "Português",  sr: "pt-BR" },
  { code: "ar", label: "العربية",    sr: "ar-SA" },
  { code: "ja", label: "日本語",      sr: "ja-JP" },
  { code: "it", label: "Italiano",   sr: "it-IT" },
  { code: "ko", label: "한국어",      sr: "ko-KR" },
];

/* ─── Icons ─────────────────────────────────────────────────── */
const CaptionsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <path d="M7 12h2M13 12h4M7 16h4M13 16h2" />
  </svg>
);
const GlobeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
const ChevDownIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const MicIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);
const TranslateIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M5 8l6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6" />
  </svg>
);
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);
const VideoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

/* ─── Jitsi script loader ────────────────────────────────────── */
declare global {
  interface Window { JitsiMeetExternalAPI: any; }
}

function loadJitsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.JitsiMeetExternalAPI) { resolve(); return; }
    if (document.getElementById("jitsi-api-script")) {
      const check = setInterval(() => {
        if (window.JitsiMeetExternalAPI) { clearInterval(check); resolve(); }
      }, 100);
      return;
    }
    const s = document.createElement("script");
    s.id = "jitsi-api-script";
    s.src = "https://meet.jit.si/external_api.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Jitsi"));
    document.head.appendChild(s);
  });
}

/* ─── MyMemory translation ───────────────────────────────────── */
async function translateText(text: string, from: string, to: string): Promise<string> {
  if (!text.trim() || from === to) return text;
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 400))}&langpair=${from}|${to}`,
      { signal: AbortSignal.timeout(8000) }
    );
    const json = await res.json();
    if (json?.responseStatus === 200 && json?.responseData?.translatedText) {
      return json.responseData.translatedText;
    }
  } catch { /* ignore */ }
  return text;
}

/* ─── Props ──────────────────────────────────────────────────── */
export interface VideoRoomProps {
  roomName: string;
  displayName: string;
  roomTitle?: string;
  startWithVideoMuted?: boolean;
  defaultLang?: string;
  onLeave: () => void;
}

/* ─── Component ──────────────────────────────────────────────── */
export default function VideoRoom({
  roomName, displayName, roomTitle, startWithVideoMuted = false, defaultLang = "en", onLeave,
}: VideoRoomProps) {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const translateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [captionsOpen, setCaptionsOpen] = useState(false);
  const [captionsActive, setCaptionsActive] = useState(false);

  const [inputLang, setInputLang] = useState("en");
  const [outputLang, setOutputLang] = useState(defaultLang === "fr" ? "fr" : defaultLang === "zh" ? "zh" : "en");
  const [showInputPicker, setShowInputPicker] = useState(false);
  const [showOutputPicker, setShowOutputPicker] = useState(false);

  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [translation, setTranslation] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  const inputLangObj = LANGS.find((l) => l.code === inputLang) || LANGS[0];
  const outputLangObj = LANGS.find((l) => l.code === outputLang) || LANGS[1];

  /* ─── Translation trigger ─── */
  const triggerTranslation = useCallback(async (text: string) => {
    if (!text.trim() || inputLang === outputLang) {
      setTranslation(text);
      return;
    }
    setIsTranslating(true);
    const result = await translateText(text, inputLang, outputLang);
    setTranslation(result);
    setIsTranslating(false);
  }, [inputLang, outputLang]);

  /* ─── Speech recognition ─── */
  const startRecognition = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return false;

    const r = new SR();
    r.lang = inputLangObj.sr;
    r.continuous = true;
    r.interimResults = true;
    r.maxAlternatives = 1;

    let finalBuffer = "";

    r.onresult = (e: any) => {
      let interim = "";
      let newFinal = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) {
          newFinal += result[0].transcript + " ";
        } else {
          interim += result[0].transcript;
        }
      }
      if (newFinal) {
        finalBuffer += newFinal;
        setTranscript(finalBuffer.trim());
        if (translateTimerRef.current) clearTimeout(translateTimerRef.current);
        translateTimerRef.current = setTimeout(() => {
          triggerTranslation(finalBuffer.trim());
        }, 600);
      }
      setInterimTranscript(interim);
    };

    r.onerror = (e: any) => {
      if (e.error === "no-speech" || e.error === "audio-capture") return;
    };

    r.onend = () => {
      if (captionsActive && recognitionRef.current === r) {
        try { r.start(); } catch { /* already stopped */ }
      }
    };

    r.start();
    recognitionRef.current = r;
    return true;
  }, [inputLangObj.sr, captionsActive, triggerTranslation]);

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
    if (translateTimerRef.current) {
      clearTimeout(translateTimerRef.current);
      translateTimerRef.current = null;
    }
  }, []);

  const toggleCaptions = useCallback(() => {
    if (!captionsOpen) {
      setCaptionsOpen(true);
      return;
    }
    if (!captionsActive) {
      const ok = startRecognition();
      if (!ok) { alert("Live captions require Chrome or Edge (Web Speech API)."); return; }
      setCaptionsActive(true);
    } else {
      stopRecognition();
      setCaptionsActive(false);
      setTranscript("");
      setInterimTranscript("");
      setTranslation("");
    }
  }, [captionsOpen, captionsActive, startRecognition, stopRecognition]);

  const closeCaptions = useCallback(() => {
    stopRecognition();
    setCaptionsActive(false);
    setCaptionsOpen(false);
    setTranscript("");
    setInterimTranscript("");
    setTranslation("");
  }, [stopRecognition]);

  /* ─── Restart recognition when language changes ─── */
  useEffect(() => {
    if (captionsActive) {
      stopRecognition();
      setTranscript("");
      setInterimTranscript("");
      setTranslation("");
      setTimeout(() => startRecognition(), 200);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputLang]);

  /* ─── Jitsi init ─── */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    loadJitsiScript()
      .then(() => {
        if (cancelled || !containerRef.current) return;
        try {
          const api = new window.JitsiMeetExternalAPI("meet.jit.si", {
            roomName: `hissado-${roomName}`,
            width: "100%",
            height: "100%",
            parentNode: containerRef.current,
            userInfo: { displayName },
            configOverwrite: {
              prejoinPageEnabled: false,
              startWithAudioMuted: false,
              startWithVideoMuted,
              disableDeepLinking: true,
              enableNoisyMicDetection: true,
              disableInviteFunctions: false,
              doNotStoreRoom: true,
            },
            interfaceConfigOverwrite: {
              MOBILE_APP_PROMO: false,
              SHOW_JITSI_WATERMARK: false,
              SHOW_WATERMARK_FOR_GUESTS: false,
              DISABLE_VIDEO_BACKGROUND: false,
              TOOLBAR_ALWAYS_VISIBLE: true,
            },
          });
          apiRef.current = api;

          api.addEventListeners({
            videoConferenceLeft: () => { if (!cancelled) onLeave(); },
            readyToClose: () => { if (!cancelled) onLeave(); },
          });

          if (!cancelled) setLoading(false);
        } catch (err) {
          if (!cancelled) setError(t.meet_error);
        }
      })
      .catch(() => {
        if (!cancelled) setError(t.meet_error);
      });

    return () => {
      cancelled = true;
      stopRecognition();
      if (apiRef.current) {
        try { apiRef.current.dispose(); } catch { /* ignore */ }
        apiRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomName, displayName]);

  /* ─── Translate when output language changes ─── */
  useEffect(() => {
    if (transcript) triggerTranslation(transcript);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outputLang]);

  /* ─── Lang picker dropdown ─── */
  const LangPicker = ({
    value, onChange, show, setShow, label,
  }: {
    value: string; onChange: (c: string) => void;
    show: boolean; setShow: (v: boolean) => void; label: string;
  }) => {
    const lang = LANGS.find((l) => l.code === value) || LANGS[0];
    return (
      <div style={{ position: "relative" }}>
        <button
          onClick={() => { setShow(!show); }}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "5px 10px", border: `1px solid rgba(255,255,255,.2)`,
            borderRadius: 8, background: "rgba(255,255,255,.08)", cursor: "pointer",
            color: "#fff", fontSize: 12, fontFamily: "'DM Sans',sans-serif", fontWeight: 600,
          }}
        >
          <span style={{ fontSize: 10, color: "rgba(255,255,255,.5)", marginRight: 2 }}>{label}</span>
          <GlobeIcon />
          <span>{lang.label}</span>
          <ChevDownIcon />
        </button>
        {show && (
          <div style={{
            position: "absolute", bottom: "calc(100% + 6px)", left: 0, zIndex: 10010,
            background: C.navy, border: "1px solid rgba(255,255,255,.12)", borderRadius: 10,
            boxShadow: "0 8px 32px rgba(0,0,0,.5)", minWidth: 160, overflow: "hidden",
          }}>
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => { onChange(l.code); setShow(false); }}
                style={{
                  width: "100%", textAlign: "left", padding: "8px 14px",
                  border: "none", background: l.code === value ? `${C.gold}22` : "transparent",
                  cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans',sans-serif",
                  color: l.code === value ? C.gold : "rgba(255,255,255,.85)",
                  fontWeight: l.code === value ? 700 : 400,
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  /* ─── Render ─── */
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      display: "flex", flexDirection: "column",
      background: "#000",
    }}>

      {/* ── Header bar ── */}
      <div style={{
        height: 52, flexShrink: 0,
        background: `linear-gradient(90deg,${C.navy} 0%,${C.navyD || "#030813"} 100%)`,
        borderBottom: "1px solid rgba(255,255,255,.08)",
        display: "flex", alignItems: "center", padding: "0 16px", gap: 12,
      }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: `linear-gradient(135deg,${C.gold} 0%,${C.gold}CC 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <VideoIcon />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#fff", letterSpacing: ".12em", lineHeight: 1 }}>HISSADO</div>
            <div style={{ fontSize: 7.5, fontWeight: 600, color: `${C.gold}CC`, letterSpacing: ".18em", textTransform: "uppercase" }}>MEET</div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: "rgba(255,255,255,.1)", flexShrink: 0 }} />

        {/* Room name */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.9)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {roomTitle || t.meet_room_label}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", fontFamily: "monospace" }}>
            {roomName}
          </div>
        </div>

        {/* Captions toggle */}
        <button
          onClick={toggleCaptions}
          title={captionsActive ? t.meet_captions_off : t.meet_captions}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
            border: `1px solid ${captionsOpen ? C.gold : "rgba(255,255,255,.2)"}`,
            borderRadius: 8, background: captionsOpen ? `${C.gold}22` : "rgba(255,255,255,.06)",
            cursor: "pointer", color: captionsOpen ? C.gold : "rgba(255,255,255,.7)",
            fontSize: 12, fontFamily: "'DM Sans',sans-serif", fontWeight: 600,
            transition: "all .2s",
          }}
        >
          <CaptionsIcon />
          <span style={{ display: window.innerWidth < 600 ? "none" : "inline" }}>
            {captionsOpen
              ? (captionsActive ? t.meet_captions : t.meet_captions)
              : t.meet_captions}
          </span>
          {captionsActive && (
            <span style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "#22C55E", boxShadow: "0 0 6px #22C55E",
              flexShrink: 0,
            }} />
          )}
        </button>
      </div>

      {/* ── Jitsi container ── */}
      <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
        <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

        {/* Loading overlay */}
        {loading && !error && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 10,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            background: "rgba(7,13,26,.92)",
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: `linear-gradient(135deg,${C.gold}33,${C.gold}11)`,
              border: `2px solid ${C.gold}44`,
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18,
            }}>
              <VideoIcon />
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,.8)", marginBottom: 8 }}>
              {t.meet_connecting}
            </div>
            <div style={{
              width: 120, height: 3, borderRadius: 2, background: "rgba(255,255,255,.08)",
              overflow: "hidden", marginTop: 4,
            }}>
              <div style={{
                height: "100%", background: C.gold, borderRadius: 2,
                animation: "jitsi-load 1.5s ease-in-out infinite",
                width: "40%",
              }} />
            </div>
            <style>{`
              @keyframes jitsi-load {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(350%); }
              }
            `}</style>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 10,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            background: "rgba(7,13,26,.95)", padding: 32, textAlign: "center",
          }}>
            <div style={{
              fontSize: 40, marginBottom: 16,
            }}>⚠️</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 8 }}>
              Connection Error
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", maxWidth: 360, lineHeight: 1.6, marginBottom: 24 }}>
              {t.meet_error}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "9px 18px", border: `1px solid ${C.gold}`,
                  borderRadius: 8, background: `${C.gold}18`, color: C.gold,
                  cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans',sans-serif",
                }}
              >
                <RefreshIcon /> {t.meet_retry}
              </button>
              <button
                onClick={onLeave}
                style={{
                  padding: "9px 18px", border: "1px solid rgba(255,255,255,.15)",
                  borderRadius: 8, background: "rgba(255,255,255,.05)", color: "rgba(255,255,255,.7)",
                  cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans',sans-serif",
                }}
              >
                {t.meet_leave}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Live captions panel ── */}
      {captionsOpen && (
        <div style={{
          flexShrink: 0,
          background: `linear-gradient(180deg,rgba(7,13,26,.97) 0%,${C.navy} 100%)`,
          borderTop: "1px solid rgba(255,255,255,.08)",
          padding: "12px 16px 16px",
          minHeight: 180, maxHeight: 260,
          display: "flex", flexDirection: "column", gap: 10,
        }}>

          {/* Panel header */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.5)", textTransform: "uppercase", letterSpacing: ".1em", flex: 1 }}>
              {t.meet_captions}
            </span>

            {/* Start / Stop recognition button */}
            <button
              onClick={() => {
                if (captionsActive) {
                  stopRecognition();
                  setCaptionsActive(false);
                  setTranscript(""); setInterimTranscript(""); setTranslation("");
                } else {
                  const ok = startRecognition();
                  if (ok) setCaptionsActive(true);
                  else alert("Live captions require Chrome or Edge.");
                }
              }}
              style={{
                display: "flex", alignItems: "center", gap: 5, padding: "4px 10px",
                border: `1px solid ${captionsActive ? "#22C55E" : "rgba(255,255,255,.2)"}`,
                borderRadius: 6, background: captionsActive ? "#22C55E22" : "rgba(255,255,255,.06)",
                cursor: "pointer", color: captionsActive ? "#22C55E" : "rgba(255,255,255,.6)",
                fontSize: 11, fontWeight: 600, fontFamily: "'DM Sans',sans-serif",
              }}
            >
              <MicIcon />
              {captionsActive ? "Recording" : "Start"}
              {captionsActive && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 6px #22C55E" }} />}
            </button>

            {/* Close captions */}
            <button
              onClick={closeCaptions}
              style={{
                width: 26, height: 26, borderRadius: 6, border: "1px solid rgba(255,255,255,.12)",
                background: "rgba(255,255,255,.06)", cursor: "pointer",
                color: "rgba(255,255,255,.5)", display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <XIcon />
            </button>
          </div>

          {/* Language pickers */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <LangPicker
              label={t.meet_speaking}
              value={inputLang}
              onChange={(c) => { setInputLang(c); setShowInputPicker(false); }}
              show={showInputPicker}
              setShow={setShowInputPicker}
            />
            <div style={{ display: "flex", alignItems: "center", color: "rgba(255,255,255,.3)", fontSize: 14 }}>→</div>
            <LangPicker
              label={t.meet_translate_to}
              value={outputLang}
              onChange={(c) => { setOutputLang(c); setShowOutputPicker(false); }}
              show={showOutputPicker}
              setShow={setShowOutputPicker}
            />
          </div>

          {/* Transcript + translation area */}
          <div style={{ display: "flex", gap: 10, flex: 1, minHeight: 0 }}>
            {/* Transcript */}
            <div style={{
              flex: 1, padding: "10px 12px",
              background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)",
              borderRadius: 10, overflow: "auto",
              display: "flex", flexDirection: "column", gap: 2,
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,.35)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>
                <MicIcon /> {inputLangObj.label}
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.5, color: "rgba(255,255,255,.85)" }}>
                {transcript || <span style={{ color: "rgba(255,255,255,.25)", fontStyle: "italic" }}>{t.meet_transcript_ph}</span>}
                {interimTranscript && (
                  <span style={{ color: "rgba(255,255,255,.35)", fontStyle: "italic" }}> {interimTranscript}</span>
                )}
              </div>
            </div>

            {/* Translation */}
            {inputLang !== outputLang && (
              <div style={{
                flex: 1, padding: "10px 12px",
                background: `${C.gold}08`, border: `1px solid ${C.gold}22`,
                borderRadius: 10, overflow: "auto",
                display: "flex", flexDirection: "column", gap: 2,
              }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: `${C.gold}80`, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
                  <TranslateIcon /> {outputLangObj.label}
                  {isTranslating && <span style={{ fontSize: 8, color: `${C.gold}60` }}>translating...</span>}
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.5, color: `${C.gold}CC` }}>
                  {translation || <span style={{ color: `${C.gold}40`, fontStyle: "italic" }}>{t.meet_translation_ph}</span>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

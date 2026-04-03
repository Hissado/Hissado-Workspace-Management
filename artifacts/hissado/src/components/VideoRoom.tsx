import { useState, useEffect, useRef, useCallback } from "react";
import { C } from "./primitives";
import { useI18n } from "@/lib/i18n";

/* ─── Language config ──────────────────────────────────────── */
const LANGS = [
  { code: "en", label: "English",   sr: "en-US" },
  { code: "fr", label: "Français",  sr: "fr-FR" },
  { code: "zh", label: "中文",       sr: "zh-CN" },
  { code: "es", label: "Español",   sr: "es-ES" },
  { code: "de", label: "Deutsch",   sr: "de-DE" },
  { code: "pt", label: "Português", sr: "pt-BR" },
  { code: "ar", label: "العربية",   sr: "ar-SA" },
  { code: "ja", label: "日本語",     sr: "ja-JP" },
  { code: "it", label: "Italiano",  sr: "it-IT" },
  { code: "ko", label: "한국어",     sr: "ko-KR" },
];

/* ─── Translation ────────────────────────────────────────────── */
async function translateText(text: string, from: string, to: string): Promise<string> {
  if (!text.trim() || from === to) return text;
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 400))}&langpair=${from}|${to}`,
      { signal: AbortSignal.timeout(8000) }
    );
    const json = await res.json();
    if (json?.responseStatus === 200 && json?.responseData?.translatedText)
      return json.responseData.translatedText;
  } catch { /* ignore */ }
  return text;
}

/* ─── Icons ─────────────────────────────────────────────────── */
const CcIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2" /><path d="M7 12h2M13 12h4" />
  </svg>
);
const MicIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);
const XIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const PhoneOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.42 19.42 0 0 1 4.26 4.26" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);
const GlobeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

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
  const recognitionRef = useRef<any>(null);
  const translateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [frameLoaded, setFrameLoaded] = useState(false);
  const [showCaptions, setShowCaptions] = useState(false);
  const [captionsActive, setCaptionsActive] = useState(false);
  const [inputLang, setInputLang] = useState("en");
  const [outputLang, setOutputLang] = useState(() =>
    defaultLang === "fr" ? "fr" : defaultLang === "zh" ? "zh" : "en"
  );
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [translation, setTranslation] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [showControls, setShowControls] = useState(true);

  /* ─── Build Jitsi URL with hash config (no External API) ─── */
  const jitsiUrl = (() => {
    const room = `hissado-${roomName}`;
    const params = [
      "config.prejoinPageEnabled=false",
      `config.startWithVideoMuted=${startWithVideoMuted}`,
      "config.startWithAudioMuted=false",
      "config.disableDeepLinking=true",
      "config.doNotStoreRoom=true",
      "config.enableNoisyMicDetection=true",
      "interfaceConfig.SHOW_JITSI_WATERMARK=false",
      "interfaceConfig.SHOW_WATERMARK_FOR_GUESTS=false",
      "interfaceConfig.MOBILE_APP_PROMO=false",
      `userInfo.displayName=${encodeURIComponent(displayName)}`,
    ].join("&");
    return `https://meet.jit.si/${room}#${params}`;
  })();

  /* ─── Auto-hide controls ─── */
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    if (!showCaptions) {
      controlsTimerRef.current = setTimeout(() => setShowControls(false), 3500);
    }
  }, [showCaptions]);

  useEffect(() => {
    resetControlsTimer();
    return () => { if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCaptions]);

  /* ─── Translation ─── */
  const triggerTranslation = useCallback(async (text: string) => {
    if (!text.trim() || inputLang === outputLang) { setTranslation(text); return; }
    setIsTranslating(true);
    const result = await translateText(text, inputLang, outputLang);
    setTranslation(result);
    setIsTranslating(false);
  }, [inputLang, outputLang]);

  /* ─── Speech recognition ─── */
  const inputLangObj = LANGS.find((l) => l.code === inputLang) || LANGS[0];

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
        const res = e.results[i];
        if (res.isFinal) newFinal += res[0].transcript + " ";
        else interim += res[0].transcript;
      }
      if (newFinal) {
        finalBuffer += newFinal;
        setTranscript(finalBuffer.trim());
        if (translateTimerRef.current) clearTimeout(translateTimerRef.current);
        translateTimerRef.current = setTimeout(() => triggerTranslation(finalBuffer.trim()), 600);
      }
      setInterimTranscript(interim);
    };
    r.onerror = () => {};
    r.onend = () => { if (captionsActive && recognitionRef.current === r) { try { r.start(); } catch { /* ignore */ } } };
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
    if (translateTimerRef.current) { clearTimeout(translateTimerRef.current); translateTimerRef.current = null; }
  }, []);

  useEffect(() => {
    if (transcript) triggerTranslation(transcript);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outputLang]);

  useEffect(() => {
    if (captionsActive) {
      stopRecognition();
      setTranscript(""); setInterimTranscript(""); setTranslation("");
      setTimeout(() => startRecognition(), 200);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputLang]);

  /* Cleanup on unmount */
  useEffect(() => () => {
    stopRecognition();
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
  }, [stopRecognition]);

  /* ─── Render ─── */
  return (
    <div
      onMouseMove={resetControlsTimer}
      onTouchStart={resetControlsTimer}
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#000", display: "flex", flexDirection: "column" }}
    >
      <style>{`
        @keyframes vr-load {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
        @keyframes vr-fade-in {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Jitsi iframe (direct embed — permissions scoped to meet.jit.si) ── */}
      <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
        <iframe
          src={jitsiUrl}
          allow="camera *; microphone *; fullscreen *; display-capture *; autoplay *"
          allowFullScreen
          onLoad={() => setFrameLoaded(true)}
          style={{ width: "100%", height: "100%", border: "none", display: "block" }}
          title="Hissado Meet"
        />

        {/* Loading overlay — shown until iframe fires onLoad */}
        {!frameLoaded && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 10,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            background: "#070D1A",
          }}>
            <div style={{
              fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.55)",
              fontFamily: "'DM Sans',sans-serif", marginBottom: 20,
            }}>
              {roomTitle ? `Connecting to ${roomTitle}…` : t.meet_connecting}
            </div>
            <div style={{ width: 140, height: 2, borderRadius: 2, background: "rgba(255,255,255,.08)", overflow: "hidden" }}>
              <div style={{
                height: "100%", background: C.gold, borderRadius: 2,
                animation: "vr-load 1.4s ease-in-out infinite", width: "40%",
              }} />
            </div>
          </div>
        )}

        {/* Floating top bar — auto-hides after 3.5 s of no mouse movement */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, zIndex: 20,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px",
          background: "linear-gradient(180deg,rgba(0,0,0,.65) 0%,transparent 100%)",
          opacity: showControls ? 1 : 0,
          transition: "opacity .4s ease",
          pointerEvents: showControls ? "auto" : "none",
        }}>
          {/* Room info */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: frameLoaded ? "#22C55E" : "rgba(255,255,255,.3)",
              boxShadow: frameLoaded ? "0 0 6px #22C55E" : "none",
            }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.85)", fontFamily: "'DM Sans',sans-serif" }}>
              {roomTitle || roomName}
            </span>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => setShowCaptions((v) => !v)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "6px 12px", border: `1px solid ${showCaptions ? C.gold : "rgba(255,255,255,.25)"}`,
                borderRadius: 20, background: showCaptions ? `${C.gold}22` : "rgba(255,255,255,.1)",
                cursor: "pointer", color: showCaptions ? C.gold : "rgba(255,255,255,.85)",
                fontSize: 12, fontFamily: "'DM Sans',sans-serif", fontWeight: 600,
                backdropFilter: "blur(8px)",
              }}
            >
              <CcIcon />
              <span style={{ display: window.innerWidth < 480 ? "none" : "inline" }}>CC</span>
              {captionsActive && (
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 5px #22C55E" }} />
              )}
            </button>
            <button
              onClick={onLeave}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 14px", border: "none",
                borderRadius: 20, background: "#EF4444",
                cursor: "pointer", color: "#fff",
                fontSize: 12, fontFamily: "'DM Sans',sans-serif", fontWeight: 700,
                boxShadow: "0 2px 12px rgba(239,68,68,.4)",
              }}
            >
              <PhoneOffIcon />
              <span style={{ display: window.innerWidth < 480 ? "none" : "inline" }}>Leave</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Live captions panel ── */}
      {showCaptions && (
        <div style={{
          flexShrink: 0,
          background: "rgba(7,13,26,.96)",
          borderTop: "1px solid rgba(255,255,255,.08)",
          padding: "12px 16px 16px",
          minHeight: 170, maxHeight: 240,
          display: "flex", flexDirection: "column", gap: 10,
          animation: "vr-fade-in .25s ease",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.4)", textTransform: "uppercase", letterSpacing: ".1em", flex: 1 }}>
              Live Captions
            </span>

            <button
              onClick={() => {
                if (captionsActive) {
                  stopRecognition(); setCaptionsActive(false);
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
                cursor: "pointer", color: captionsActive ? "#22C55E" : "rgba(255,255,255,.5)",
                fontSize: 11, fontWeight: 600, fontFamily: "'DM Sans',sans-serif",
              }}
            >
              <MicIcon />
              {captionsActive ? "Stop" : "Start"}
              {captionsActive && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#22C55E" }} />}
            </button>

            {/* Translate-to picker */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowLangPicker((v) => !v)}
                style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "4px 10px",
                  border: "1px solid rgba(255,255,255,.2)", borderRadius: 6,
                  background: "rgba(255,255,255,.06)", cursor: "pointer",
                  color: "rgba(255,255,255,.6)", fontSize: 11, fontFamily: "'DM Sans',sans-serif", fontWeight: 600,
                }}
              >
                <GlobeIcon />
                {LANGS.find((l) => l.code === outputLang)?.label || "EN"}
              </button>
              {showLangPicker && (
                <div style={{
                  position: "absolute", bottom: "calc(100% + 6px)", right: 0, zIndex: 100,
                  background: C.navy, border: "1px solid rgba(255,255,255,.12)", borderRadius: 10,
                  boxShadow: "0 8px 32px rgba(0,0,0,.5)", minWidth: 150, overflow: "hidden",
                }}>
                  <div style={{ padding: "6px 8px 4px", fontSize: 10, color: "rgba(255,255,255,.3)", fontFamily: "'DM Sans',sans-serif", letterSpacing: ".06em" }}>
                    TRANSLATE TO
                  </div>
                  {LANGS.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { setOutputLang(l.code); setShowLangPicker(false); }}
                      style={{
                        width: "100%", textAlign: "left", padding: "7px 12px", border: "none",
                        background: l.code === outputLang ? `${C.gold}22` : "transparent",
                        cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans',sans-serif",
                        color: l.code === outputLang ? C.gold : "rgba(255,255,255,.8)",
                        fontWeight: l.code === outputLang ? 700 : 400,
                      }}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input lang select */}
            <select
              value={inputLang}
              onChange={(e) => setInputLang(e.target.value)}
              style={{
                padding: "4px 8px", border: "1px solid rgba(255,255,255,.2)", borderRadius: 6,
                background: "rgba(255,255,255,.06)", color: "rgba(255,255,255,.6)",
                fontSize: 11, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", outline: "none",
              }}
            >
              {LANGS.map((l) => <option key={l.code} value={l.code} style={{ background: C.navy }}>{l.label}</option>)}
            </select>

            <button
              onClick={() => {
                stopRecognition(); setCaptionsActive(false);
                setTranscript(""); setInterimTranscript(""); setTranslation("");
                setShowCaptions(false);
              }}
              style={{
                width: 26, height: 26, borderRadius: 6, border: "1px solid rgba(255,255,255,.12)",
                background: "rgba(255,255,255,.06)", cursor: "pointer",
                color: "rgba(255,255,255,.4)", display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <XIcon />
            </button>
          </div>

          <div style={{
            flex: 1, minHeight: 0, background: "rgba(255,255,255,.04)", borderRadius: 10,
            padding: "10px 14px", overflow: "auto",
          }}>
            {!transcript && !interimTranscript && (
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.2)", fontFamily: "'DM Sans',sans-serif", fontStyle: "italic" }}>
                {captionsActive ? "Listening..." : "Start recording to see captions"}
              </div>
            )}
            {transcript && (
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.8)", lineHeight: 1.6, fontFamily: "'DM Sans',sans-serif" }}>
                {transcript}
              </div>
            )}
            {interimTranscript && (
              <span style={{ fontSize: 13, color: "rgba(255,255,255,.4)", fontStyle: "italic" }}>{interimTranscript}</span>
            )}
            {translation && inputLang !== outputLang && (
              <div style={{
                marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,.08)",
                fontSize: 13, color: C.gold, lineHeight: 1.6, fontFamily: "'DM Sans',sans-serif",
              }}>
                {isTranslating ? "Translating…" : translation}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

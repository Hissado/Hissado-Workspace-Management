import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { C, Av, Btn, Modal, Inp } from "@/components/primitives";
import { useI18n, type TranslationKey } from "@/lib/i18n";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Conversation, Message, User, Notification, Attachment, SharedLocation } from "@/lib/data";
import { uid, fmtT } from "@/lib/data";
import ConfirmDialog from "@/components/ConfirmDialog";

/* ─── Icons ─────────────────────────────────────────────── */
const BackIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>;
const PlusIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const SearchIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
const SendIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>;
const UsersIcon2 = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const TrashIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></svg>;
const MicIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>;
const MicOffIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="1" y1="1" x2="23" y2="23" /><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" /><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>;
const GlobeIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>;
const PenIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>;
const TranslateIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 8l6 6" /><path d="M4 14l6-6 2-3" /><path d="M2 5h12" /><path d="M7 2h1" /><path d="M22 22l-5-10-5 10" /><path d="M14 18h6" /></svg>;
const ChevronIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>;
const WhatsAppIcon = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>;
const PaperclipIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>;
const FileIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" /></svg>;
const DownloadIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>;
const XSmIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
const EditIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
const ReplyIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 17 4 12 9 7" /><path d="M20 18v-2a4 4 0 0 0-4-4H4" /></svg>;
const SmileIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>;
const CheckIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>;
const CheckCheckIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="17 6 9 17 5 13" /><polyline points="22 6 14 17" /></svg>;
const SearchMsgIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
const CloseIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
const MapPinIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const ExternalLinkIcon = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>;
const NavIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>;

/* ─── Emoji reactions set ────────────────────────────────── */
const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

/* ─── Location card component ────────────────────────────── */
function LocationCard({ loc, isMe }: { loc: SharedLocation; isMe: boolean }) {
  const [address, setAddress] = useState<string | null>(null);
  const [addrLoading, setAddrLoading] = useState(false);

  const lat = loc.lat.toFixed(5);
  const lng = loc.lng.toFixed(5);
  const googleUrl = `https://www.google.com/maps?q=${loc.lat},${loc.lng}`;
  const osmUrl = `https://www.openstreetmap.org/?mlat=${loc.lat}&mlon=${loc.lng}#map=15/${loc.lat}/${loc.lng}`;
  const tileUrl = `https://tile.openstreetmap.org/14/${lonToTile(loc.lng, 14)}/${latToTile(loc.lat, 14)}.png`;

  useEffect(() => {
    if (address || addrLoading) return;
    setAddrLoading(true);
    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${loc.lat}&lon=${loc.lng}`,
      { headers: { "Accept-Language": "en" } }
    )
      .then((r) => r.json())
      .then((d) => setAddress(d?.display_name?.split(",").slice(0, 3).join(", ") || null))
      .catch(() => setAddress(null))
      .finally(() => setAddrLoading(false));
  }, []);

  return (
    <div style={{
      borderRadius: 12, overflow: "hidden",
      width: 240, maxWidth: "100%",
      boxShadow: "0 2px 10px rgba(0,0,0,.15)",
      background: C.w,
      border: `1px solid ${isMe ? "rgba(255,255,255,.15)" : C.g100}`,
    }}>
      {/* Map preview tile */}
      <div style={{ position: "relative", height: 120, overflow: "hidden", background: "#e8f4ea" }}>
        <img
          src={tileUrl}
          alt="Map"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          style={{
            width: "100%", height: "100%",
            objectFit: "cover", display: "block",
            filter: "saturate(0.85) brightness(1.05)",
          }}
        />
        {/* Pin overlay */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          pointerEvents: "none",
        }}>
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,.4))",
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50% 50% 50% 0",
              background: "#E53E3E", transform: "rotate(-45deg)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,.3)",
            }}>
              <div style={{
                width: 12, height: 12, borderRadius: "50%",
                background: "#fff", transform: "rotate(45deg)",
              }} />
            </div>
            <div style={{ width: 2, height: 8, background: "#E53E3E", borderRadius: 1 }} />
            <div style={{ width: 8, height: 3, borderRadius: "50%", background: "rgba(0,0,0,.3)" }} />
          </div>
        </div>
        {/* Gradient overlay at bottom */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, background: "linear-gradient(transparent, rgba(0,0,0,.3))" }} />
        <div style={{ position: "absolute", bottom: 6, left: 8, fontSize: 10, color: "#fff", fontWeight: 600, fontFamily: "inherit", textShadow: "0 1px 2px rgba(0,0,0,.5)" }}>
          {lat}°, {lng}°
        </div>
      </div>

      {/* Info footer */}
      <div style={{ padding: "8px 10px", background: isMe ? "rgba(255,255,255,.06)" : "#fff" }}>
        {/* Address line */}
        <div style={{ fontSize: 11, color: isMe ? "rgba(255,255,255,.85)" : C.navy, fontWeight: 600, marginBottom: 2, lineHeight: 1.4, minHeight: 14 }}>
          {addrLoading ? (
            <span style={{ color: isMe ? "rgba(255,255,255,.5)" : C.g400 }}>Locating address…</span>
          ) : address ? address : (
            <span style={{ color: isMe ? "rgba(255,255,255,.5)" : C.g400 }}>📍 Shared Location</span>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
          <a
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
              padding: "5px 0",
              background: isMe ? "rgba(255,255,255,.15)" : `${C.gold}12`,
              border: `1px solid ${isMe ? "rgba(255,255,255,.2)" : `${C.gold}30`}`,
              borderRadius: 7, textDecoration: "none",
              fontSize: 11, fontWeight: 700, fontFamily: "inherit",
              color: isMe ? "#fff" : C.gold,
              cursor: "pointer",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.8"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
          >
            <NavIcon /> Google Maps
          </a>
          <a
            href={osmUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
              background: isMe ? "rgba(255,255,255,.08)" : C.g50,
              border: `1px solid ${isMe ? "rgba(255,255,255,.12)" : C.g100}`,
              borderRadius: 7, textDecoration: "none",
              color: isMe ? "rgba(255,255,255,.6)" : C.g500,
              cursor: "pointer",
              flexShrink: 0,
            }}
            title="View on OpenStreetMap"
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.7"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
          >
            <ExternalLinkIcon />
          </a>
        </div>
      </div>
    </div>
  );
}

/* OSM tile coordinate helpers */
function lonToTile(lon: number, zoom: number) { return Math.floor((lon + 180) / 360 * Math.pow(2, zoom)); }
function latToTile(lat: number, zoom: number) {
  return Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
}

/* ─── Translation API ────────────────────────────────────── */
const LANG_CODES: Record<string, string> = {
  en: "en-US", fr: "fr-FR", zh: "zh-CN", es: "es-ES",
  de: "de-DE", ar: "ar-SA", pt: "pt-BR", ja: "ja-JP",
};

/**
 * Translate `text` to `targetLang` via the MyMemory public API.
 * Throws on network error or a non-200 API status so callers can show
 * an explicit error + retry button instead of silently returning the source.
 */
async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || text.startsWith("data:image")) return text;
  const code = LANG_CODES[targetLang] || targetLang;
  const res = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${code}`,
    { signal: AbortSignal.timeout(8000) }
  );
  if (!res.ok) throw new Error(`Translation API error: ${res.status}`);
  const json = await res.json();
  if (json?.responseStatus === 200 && json?.responseData?.translatedText) {
    return json.responseData.translatedText;
  }
  throw new Error(json?.responseDetails || "Translation unavailable");
}

/* ─── Voice recognition helper ───────────────────────────── */
type SpeechRecognitionResult = { transcript: string; confidence: number };
type SpeechRecognitionResultItem = { isFinal: boolean; [k: number]: SpeechRecognitionResult; length: number };
type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: {
    results: { [k: number]: SpeechRecognitionResultItem; length: number };
    resultIndex: number;
  }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
};
const getSR = (): (new () => SpeechRecognitionInstance) | null =>
  (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance; webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ||
  (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition || null;

/* ─── Drawing / Signature canvas component ───────────────── */
function DrawPad({ onSend, onClose, t }: { onSend: (dataUrl: string) => void; onClose: () => void; t: Record<string, string> }) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const sendBtnRef = useRef<HTMLButtonElement>(null);
  const drawing    = useRef(false);
  const lastPos    = useRef<{ x: number; y: number } | null>(null);
  /* Use a ref so the keydown handler always has the live value without
     needing to re-register on every render.                           */
  const hasDrawnRef = useRef(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const initWhite = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  /* Initialise canvas on mount */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) initWhite(canvas);
  }, []);

  /* Send helper (shared by button click and Enter key) */
  const sendDrawing = useCallback(() => {
    if (!hasDrawnRef.current) return;          // nothing drawn → ignore
    const canvas = canvasRef.current; if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onSend(dataUrl);
    onClose();
  }, [onSend, onClose]);

  /* Global Enter key → confirm signature.
     Registered once; always safe because sendDrawing reads from refs. */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.shiftKey) return;
      /* Don't steal Enter from any focused text input / textarea */
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (!hasDrawnRef.current) {
        /* Gently flash the canvas border to remind the user to sign first */
        const c = canvasRef.current;
        if (c) {
          c.style.borderColor = "#C9A96E";
          c.style.boxShadow   = "0 0 0 3px rgba(201,169,110,.25)";
          setTimeout(() => {
            c.style.borderColor = "#E5E7EB";
            c.style.boxShadow   = "none";
          }, 600);
        }
        return;
      }
      e.preventDefault();
      /* Pulse the Send button briefly so the user sees the key was recognised */
      const btn = sendBtnRef.current;
      if (btn) {
        btn.style.transform  = "scale(0.94)";
        btn.style.opacity    = "0.8";
        setTimeout(() => {
          btn.style.transform = "scale(1)";
          btn.style.opacity   = "1";
          sendDrawing();
        }, 120);
      } else {
        sendDrawing();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [sendDrawing]);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      const touch = e.touches[0];
      return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current; if (!canvas) return;
    drawing.current  = true;
    lastPos.current  = getPos(e, canvas);
    hasDrawnRef.current = true;
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!drawing.current || !lastPos.current) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx    = canvas.getContext("2d");    if (!ctx)    return;
    const pos    = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth   = 2.5;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";
    ctx.stroke();
    lastPos.current = pos;
  };

  const endDraw = () => { drawing.current = false; lastPos.current = null; };

  const clearCanvas = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    initWhite(canvas);
    hasDrawnRef.current = false;
    setHasDrawn(false);
  };

  return (
    <div>
      <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 12 }}>
        {t.chat_draw_hint}
      </p>

      <canvas
        ref={canvasRef}
        width={520}
        height={240}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
        style={{
          width: "100%", height: 200,
          border: `1.5px solid ${hasDrawn ? "#C9A96E" : "#E5E7EB"}`,
          borderRadius: 10, cursor: "crosshair", background: "#ffffff",
          touchAction: "none", display: "block",
          transition: "border-color .2s, box-shadow .2s",
        }}
      />

      {/* Keyboard shortcut hint */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6, margin: "7px 0 0" }}>
        <span style={{ fontSize: 11, color: "#9CA3AF" }}>
          {t.chat_draw_enter_hint || "Press Enter to confirm"}
        </span>
        <kbd style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          padding: "1px 6px", borderRadius: 5, fontSize: 11, lineHeight: 1.6,
          fontFamily: "inherit", fontWeight: 600,
          background: hasDrawn ? "rgba(201,169,110,.12)" : "#F3F4F6",
          border: `1px solid ${hasDrawn ? "rgba(201,169,110,.35)" : "#E5E7EB"}`,
          color: hasDrawn ? "#C9A96E" : "#9CA3AF",
          transition: "all .2s",
        }}>
          ↵
        </kbd>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button
          onClick={clearCanvas}
          style={{
            flex: 1, padding: "9px 0",
            border: "1px solid #E5E7EB", borderRadius: 8,
            background: "#FFF", cursor: "pointer",
            fontSize: 13, fontFamily: "inherit", color: "#374151",
            transition: "border-color .15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#C9A96E"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; }}
        >
          {t.chat_draw_clear}
        </button>
        <button
          ref={sendBtnRef}
          onClick={sendDrawing}
          disabled={!hasDrawn}
          style={{
            flex: 2, padding: "9px 0",
            border: "none", borderRadius: 8,
            background: hasDrawn
              ? "linear-gradient(135deg,#C9A96E,#a87e4a)"
              : "#E5E7EB",
            cursor: hasDrawn ? "pointer" : "not-allowed",
            fontSize: 13, fontFamily: "inherit",
            color: hasDrawn ? "#FFF" : "#9CA3AF",
            fontWeight: 600,
            transition: "background .2s, color .2s, transform .12s, opacity .12s",
          }}
        >
          {t.chat_draw_send}
        </button>
      </div>
    </div>
  );
}

/* ─── Language picker dropdown ───────────────────────────── */
type LangLabelKey = Extract<TranslationKey,
  "chat_trans_off" | "chat_lang_en" | "chat_lang_fr" | "chat_lang_zh" |
  "chat_lang_es" | "chat_lang_de" | "chat_lang_ar" | "chat_lang_pt" | "chat_lang_ja"
>;
const LANGS: Array<{ code: string; labelKey: LangLabelKey }> = [
  { code: "off", labelKey: "chat_trans_off" },
  { code: "en",  labelKey: "chat_lang_en" },
  { code: "fr",  labelKey: "chat_lang_fr" },
  { code: "zh",  labelKey: "chat_lang_zh" },
  { code: "es",  labelKey: "chat_lang_es" },
  { code: "de",  labelKey: "chat_lang_de" },
  { code: "ar",  labelKey: "chat_lang_ar" },
  { code: "pt",  labelKey: "chat_lang_pt" },
  { code: "ja",  labelKey: "chat_lang_ja" },
];

/* ─── Call icons ──────────────────────────────────────────── */
const PhoneCallIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.26h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l1.81-1.81a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const VideoCallIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>;

/* ─── Props ──────────────────────────────────────────────── */
interface ChatProps {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  users: User[];
  currentUser: User;
  onSendMessage: (cId: string, msg: Message) => void;
  onCreateConvo: (cv: Conversation) => void;
  onAddNotification: (n: Notification) => void;
  onDeleteConversation?: (id: string) => void;
  onStartCall?: (roomName: string, title: string, videoEnabled: boolean, target?: { id: string; name: string; color?: string }) => void;
  onUpdateMessage?: (id: string, updates: Partial<Message>) => void;
  onDeleteMessage?: (id: string) => void;
  onReact?: (msgId: string, emoji: string, userId: string) => void;
  onMarkRead?: (cId: string, userId: string) => void;
  initialConvoId?: string | null;
  onConvoOpened?: () => void;
}

/* ─── Highlight helper ───────────────────────────────────── */
function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: "#FDE68A", borderRadius: 2, padding: "0 1px" }}>{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

/* ─── Pure utilities (outside component to avoid recreation) ── */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ─── Main component ─────────────────────────────────────── */
export default function Chat({ conversations, messages, users, currentUser, onSendMessage, onCreateConvo, onAddNotification, onDeleteConversation, onStartCall, onUpdateMessage, onDeleteMessage, onReact, onMarkRead, initialConvoId, onConvoOpened }: ChatProps) {
  const { t } = useI18n();
  const isMobile = useIsMobile();

  /* conversation list state */
  const [selected, setSelected] = useState<string | null>(conversations[0]?.id || null);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [search, setSearch] = useState("");
  const [confirmDeleteConvo, setConfirmDeleteConvo] = useState<Conversation | null>(null);

  /* new conversation modal */
  const [showNew, setShowNew] = useState(false);
  const [newType, setNewType] = useState<"direct" | "group">("direct");
  const [newPerson, setNewPerson] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupMembers, setNewGroupMembers] = useState<string[]>([]);

  /* input */
  const [input, setInput] = useState("");

  /* voice-to-text */
  const [isRecording, setIsRecording] = useState(false);
  const [voiceUnsupported, setVoiceUnsupported] = useState(false);
  const [interimText, setInterimText] = useState("");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const finalTranscriptRef = useRef("");
  const SR = getSR();

  /* drawing */
  const [showDrawPad, setShowDrawPad] = useState(false);

  /* file attachment */
  const [pendingFile, setPendingFile] = useState<Attachment | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  /* translation */
  const [autoTransLang, setAutoTransLang] = useState<string>("off");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [transLoading, setTransLoading] = useState<Set<string>>(new Set());
  const [transError, setTransError] = useState<Set<string>>(new Set());
  const [showLangPicker, setShowLangPicker] = useState(false);
  const langPickerRef = useRef<HTMLDivElement>(null);

  /* ── NEW: WhatsApp features state ── */
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);
  const [emojiPickerMsgId, setEmojiPickerMsgId] = useState<string | null>(null);
  const [showMsgSearch, setShowMsgSearch] = useState(false);
  const [msgSearch, setMsgSearch] = useState("");
  const [confirmDeleteMsg, setConfirmDeleteMsg] = useState<Message | null>(null);

  /* location sharing */
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  /* scroll */
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── Memoized derived state (prevents re-computation on every render) ── */

  /* O(n) lookup map for users — rebuilt only when the users array changes */
  const userMap = useMemo(
    () => Object.fromEntries(users.map((u) => [u.id, u])),
    [users]
  );

  /* Other team-members (for new-conversation picker) */
  const otherUsers = useMemo(
    () => users.filter((u) => u.id !== currentUser.id),
    [users, currentUser.id]
  );

  /* Stable conversation label — depends on userMap */
  const getConvoLabel = useCallback((cv: Conversation): string => {
    if (cv.name) return cv.name;
    const others = cv.parts.filter((id) => id !== currentUser.id);
    return others.map((id) => userMap[id]?.name || "?").join(", ");
  }, [userMap, currentUser.id]);

  /* Conversation list — sorted newest-first, filtered by search */
  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => {
      const aTs = (messages[a.id] || []).at(-1)?.ts || a.created;
      const bTs = (messages[b.id] || []).at(-1)?.ts || b.created;
      return new Date(bTs).getTime() - new Date(aTs).getTime();
    });
  }, [conversations, messages]);

  const filtered = useMemo(
    () => sortedConversations.filter(
      (cv) => getConvoLabel(cv).toLowerCase().includes(search.toLowerCase())
    ),
    [sortedConversations, getConvoLabel, search]
  );

  /* Active conversation object */
  const convo = useMemo(
    () => conversations.find((c) => c.id === selected),
    [conversations, selected]
  );

  /* Active conversation messages, optionally filtered by message search */
  const allMsgs = useMemo(
    () => selected ? (messages[selected] || []) : [],
    [messages, selected]
  );
  const msgs = useMemo(
    () => msgSearch
      ? allMsgs.filter((m) => m.text.toLowerCase().includes(msgSearch.toLowerCase()))
      : allMsgs,
    [allMsgs, msgSearch]
  );

  /* WhatsApp deep-link for the other party in a direct conversation */
  const whatsappUrl = useMemo(() => {
    if (!convo || convo.type !== "direct") return null;
    const otherId = convo.parts.find((id) => id !== currentUser.id);
    const phone = otherId ? userMap[otherId]?.phone : undefined;
    if (!phone) return null;
    const digits = phone.replace(/\s+/g, "").replace(/[^\d+]/g, "").replace(/^\+/, "");
    return digits ? `https://wa.me/${digits}` : null;
  }, [convo, currentUser.id, userMap]);

  /* Avatar for a conversation (group icon or user Av) */
  const getConvoAv = useCallback((cv: Conversation) => {
    if (cv.type === "group") return (
      <div style={{ width: 42, height: 42, borderRadius: 14, background: `${C.gold}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <UsersIcon2 />
      </div>
    );
    const other = cv.parts.find((id) => id !== currentUser.id);
    return <Av ini={userMap[other || ""]?.av || "??"} photo={userMap[other || ""]?.photo} size={42} />;
  }, [userMap, currentUser.id]);

  const showList = !isMobile || !mobileShowChat || !selected;
  const showChat = !isMobile || (mobileShowChat && !!selected);

  /* ── Navigate here from notification ── */
  useEffect(() => {
    if (!initialConvoId) return;
    const exists = conversations.find((c) => c.id === initialConvoId);
    if (exists) {
      setSelected(initialConvoId);
      if (isMobile) setMobileShowChat(true);
      onConvoOpened?.();
    }
  }, [initialConvoId]);

  /* ── Mark messages as read when entering a conversation ── */
  useEffect(() => {
    if (selected && onMarkRead) {
      onMarkRead(selected, currentUser.id);
    }
  }, [selected]);

  /* Track previous selected conversation to detect conversation-switch vs new message */
  const prevSelectedRef = useRef<string | null>(null);
  /* auto-scroll to newest message:
     • instant jump when switching conversation (no jank)
     • smooth scroll when a new message arrives in the current conversation */
  useEffect(() => {
    const switched = prevSelectedRef.current !== selected;
    prevSelectedRef.current = selected;
    bottomRef.current?.scrollIntoView({ behavior: switched ? "instant" : "smooth" });
  }, [msgs.length, selected]);

  /* close lang picker on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langPickerRef.current && !langPickerRef.current.contains(e.target as Node)) {
        setShowLangPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* close emoji picker on outside click */
  useEffect(() => {
    if (!emojiPickerMsgId) return;
    const handler = (e: MouseEvent) => {
      const el = document.getElementById(`emoji-picker-${emojiPickerMsgId}`);
      if (el && !el.contains(e.target as Node)) setEmojiPickerMsgId(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [emojiPickerMsgId]);

  /* Escape key: cancel edit / reply / close search */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (editingMsgId) { setEditingMsgId(null); setEditText(""); setInput(""); }
        else if (replyToId) setReplyToId(null);
        else if (showMsgSearch) { setShowMsgSearch(false); setMsgSearch(""); }
        else if (emojiPickerMsgId) setEmojiPickerMsgId(null);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [editingMsgId, replyToId, showMsgSearch, emojiPickerMsgId]);

  /* auto-translate new messages */
  useEffect(() => {
    if (autoTransLang === "off") return;
    msgs.forEach((m) => {
      if (m.from === currentUser.id) return;
      /* Skip drawings, location pins, and empty messages — nothing to translate */
      if (!m.text || m.text.startsWith("data:image")) return;
      const key = `${m.id}_${autoTransLang}`;
      if (translations[key] || transLoading.has(key)) return;
      translateMsg(m.id, m.text, autoTransLang);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [msgs.length, autoTransLang, selected]);

  /* translate a single message — clears the error flag and retries if called again */
  const translateMsg = useCallback(async (msgId: string, text: string, lang: string) => {
    const key = `${msgId}_${lang}`;
    setTransLoading((s) => new Set(s).add(key));
    setTransError((prev) => { const n = new Set(prev); n.delete(key); return n; });
    try {
      const result = await translateText(text, lang);
      setTranslations((prev) => ({ ...prev, [key]: result }));
    } catch {
      setTransError((s) => new Set(s).add(key));
    } finally {
      setTransLoading((s) => { const n = new Set(s); n.delete(key); return n; });
    }
  }, []);

  /* file selection */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    if (file.size > MAX_FILE_SIZE) {
      setFileError("File too large. Maximum size is 5 MB.");
      setTimeout(() => setFileError(null), 4000);
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = ev.target?.result as string;
      setPendingFile({ name: file.name, type: file.type, size: file.size, data });
    };
    reader.readAsDataURL(file);
  };

  /* ── Send / edit message ── */
  const sendMessage = () => {
    if (!selected) return;

    /* Edit mode: update existing message */
    if (editingMsgId) {
      const trimmed = input.trim();
      if (!trimmed) return;
      onUpdateMessage?.(editingMsgId, { text: trimmed, edited: true });
      setEditingMsgId(null);
      setEditText("");
      setInput("");
      return;
    }

    if (!input.trim() && !pendingFile) return;

    const msg: Message = {
      id: uid(), cId: selected, from: currentUser.id,
      text: input.trim(), ts: new Date().toISOString(),
      ...(pendingFile ? { attachment: pendingFile } : {}),
      ...(replyToId ? { replyTo: replyToId } : {}),
    };
    onSendMessage(selected, msg);
    // NOTE: Do NOT call onAddNotification here — the sender should NOT receive their own
    // bell notification. Recipient notifications are triggered by the onNewMessage handler
    // in App.tsx when the SSE signal is received.
    setInput("");
    setPendingFile(null);
    setReplyToId(null);
  };

  /* send drawing */
  const sendDrawing = (dataUrl: string) => {
    if (!selected) return;
    const msg: Message = { id: uid(), cId: selected, from: currentUser.id, text: dataUrl, ts: new Date().toISOString() };
    onSendMessage(selected, msg);
  };

  /* share location */
  const handleShareLocation = () => {
    if (!selected) return;
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setTimeout(() => setLocationError(null), 4000);
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const msg: Message = {
          id: uid(), cId: selected, from: currentUser.id,
          text: "", ts: new Date().toISOString(),
          location: loc,
        };
        onSendMessage(selected, msg);
        // Location sharing: same as regular messages — do NOT notify the sender themselves.
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) setLocationError("Location access denied. Please allow location in your browser.");
        else if (err.code === 2) setLocationError("Unable to determine your location.");
        else setLocationError("Location request timed out. Try again.");
        setTimeout(() => setLocationError(null), 5000);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  /* voice input */
  const startVoice = () => {
    if (!SR) { setVoiceUnsupported(true); setTimeout(() => setVoiceUnsupported(false), 3000); return; }
    const rec = new SR();
    rec.lang = "";
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 3;
    finalTranscriptRef.current = input.trimEnd();
    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        const best = r[0].transcript.trim();
        if (r.isFinal) {
          finalTranscriptRef.current = finalTranscriptRef.current ? finalTranscriptRef.current + " " + best : best;
        } else {
          interim = best;
        }
      }
      setInterimText(interim);
      const display = interim ? (finalTranscriptRef.current ? finalTranscriptRef.current + " " + interim : interim) : finalTranscriptRef.current;
      setInput(display);
    };
    rec.onerror = (e) => {
      if (e.error === "aborted" || e.error === "not-allowed") { setIsRecording(false); setInterimText(""); }
    };
    rec.onend = () => { setInput(finalTranscriptRef.current); setInterimText(""); setIsRecording(false); };
    rec.start();
    recognitionRef.current = rec;
    setIsRecording(true);
  };
  const stopVoice = () => { recognitionRef.current?.stop(); recognitionRef.current = null; };
  const toggleVoice = () => isRecording ? stopVoice() : startVoice();

  /* ── Edit / delete / react handlers ── */
  const startEdit = (m: Message) => {
    setEditingMsgId(m.id);
    setEditText(m.text);
    setInput(m.text);
    setReplyToId(null);
    setHoveredMsgId(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const cancelEdit = () => {
    setEditingMsgId(null);
    setEditText("");
    setInput("");
  };

  const handleDeleteMsg = () => {
    if (confirmDeleteMsg) {
      onDeleteMessage?.(confirmDeleteMsg.id);
      setConfirmDeleteMsg(null);
    }
  };

  const startReply = (m: Message) => {
    setReplyToId(m.id);
    setEditingMsgId(null);
    setHoveredMsgId(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleReact = (msgId: string, emoji: string) => {
    onReact?.(msgId, emoji, currentUser.id);
    setEmojiPickerMsgId(null);
  };

  /* create conversation */
  const createConvo = () => {
    if (newType === "direct") {
      if (!newPerson) return;
      const cv: Conversation = { id: uid(), type: "direct", parts: [currentUser.id, newPerson], name: null, created: new Date().toISOString() };
      onCreateConvo(cv); setSelected(cv.id);
    } else {
      if (!newGroupName || newGroupMembers.length === 0) return;
      const cv: Conversation = { id: uid(), type: "group", parts: [currentUser.id, ...newGroupMembers], name: newGroupName, created: new Date().toISOString() };
      onCreateConvo(cv); setSelected(cv.id);
    }
    setShowNew(false); setNewPerson(""); setNewGroupName(""); setNewGroupMembers([]);
  };

  const handleDeleteConvo = () => {
    if (!confirmDeleteConvo) return;
    onDeleteConversation?.(confirmDeleteConvo.id);
    if (selected === confirmDeleteConvo.id) {
      const remaining = conversations.filter((c) => c.id !== confirmDeleteConvo.id);
      setSelected(remaining[0]?.id || null);
    }
    setConfirmDeleteConvo(null);
  };

  /* ─── Render ─────────────────────────────────────────── */
  return (
    <div style={{ display: "flex", height: "calc(100vh - 68px)", overflow: "hidden", background: C.bg }}>

      {/* ── Conversation list ─────────────────────────── */}
      {showList && (
        <div style={{
          width: isMobile ? "100%" : 300,
          display: "flex", flexDirection: "column",
          background: C.w,
          borderRight: isMobile ? "none" : `1px solid ${C.g100}`,
          flexShrink: 0, overflow: "hidden",
        }}>
          {/* header */}
          <div style={{ padding: "16px 16px 12px", borderBottom: `1px solid ${C.g100}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: C.navy, margin: 0 }}>{t.chat_title}</h2>
              <button
                onClick={() => setShowNew(true)}
                data-testid="new-convo-btn"
                style={{ background: `linear-gradient(135deg,${C.navy},${C.navyL})`, border: "none", borderRadius: 9, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.w }}
              >
                <PlusIcon />
              </button>
            </div>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.g300 }}><SearchIcon /></span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.chat_search}
                data-testid="chat-search"
                style={{ width: "100%", padding: "8px 12px 8px 32px", border: `1px solid ${C.g100}`, borderRadius: 9, fontSize: 12, fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: C.g50, color: C.navy }}
              />
            </div>
          </div>

          {/* list */}
          <div style={{ flex: 1, overflow: "auto" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: C.g400, fontSize: 13 }}>{t.chat_no_convos}</div>
            ) : filtered.map((cv) => {
              const lastMsg = (messages[cv.id] || []).at(-1);
              const isActive = selected === cv.id;
              const isImage = lastMsg?.text?.startsWith("data:image");
              /* unread count: messages not from me with readBy not including me */
              const unread = (messages[cv.id] || []).filter(
                (m) => m.from !== currentUser.id && !(m.readBy?.includes(currentUser.id))
              ).length;
              return (
                <div key={cv.id} style={{ position: "relative" }}>
                  <div
                    onClick={() => { setSelected(cv.id); if (isMobile) setMobileShowChat(true); }}
                    data-testid={`convo-${cv.id}`}
                    style={{
                      padding: "12px 40px 12px 14px",
                      display: "flex", gap: 10, cursor: "pointer", alignItems: "center",
                      background: isActive ? `${C.navy}0a` : "transparent",
                      borderBottom: `1px solid ${C.g50}`,
                      borderLeft: isActive ? `3px solid ${C.gold}` : "3px solid transparent",
                      transition: "all .12s",
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = C.g50; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                  >
                    {getConvoAv(cv)}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 13, fontWeight: unread > 0 ? 700 : 600, color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{getConvoLabel(cv)}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0, marginLeft: 6 }}>
                          {lastMsg && <span style={{ fontSize: 10, color: C.g400 }}>{fmtT(lastMsg.ts)}</span>}
                          {unread > 0 && (
                            <span style={{ background: C.gold, color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 10, padding: "1px 6px", minWidth: 18, textAlign: "center" }}>{unread}</span>
                          )}
                        </div>
                      </div>
                      {lastMsg && (
                        <div style={{ fontSize: 12, color: unread > 0 ? C.navy : C.g400, fontWeight: unread > 0 ? 600 : 400, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {lastMsg.from === currentUser.id ? <span style={{ color: C.gold, fontSize: 11 }}>{t.chat_you}</span> : ""}
                          {isImage ? "🖊 Drawing" : lastMsg.location ? "📍 Location" : (lastMsg.attachment && !lastMsg.text ? `📎 ${lastMsg.attachment.name}` : lastMsg.text)}
                        </div>
                      )}
                      {cv.type === "group" && (
                        <div style={{ fontSize: 10, color: C.g300, marginTop: 2, display: "flex", alignItems: "center", gap: 3 }}>
                          <UsersIcon2 /> {cv.parts.length} {t.chat_members}
                        </div>
                      )}
                    </div>
                  </div>
                  {onDeleteConversation && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmDeleteConvo(cv); }}
                      data-testid={`delete-convo-${cv.id}`}
                      title="Delete"
                      style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 22, height: 22, borderRadius: 6, border: "none", background: "transparent", cursor: "pointer", color: C.g300, display: "flex", alignItems: "center", justifyContent: "center" }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = C.err; e.currentTarget.style.background = "#FEF2F2"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = C.g300; e.currentTarget.style.background = "transparent"; }}
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Main chat area ────────────────────────────── */}
      {showChat && convo ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#F8F9FC" }}>

          {/* Chat header */}
          <div style={{
            padding: "10px 20px", borderBottom: `1px solid ${C.g100}`,
            display: "flex", alignItems: "center", gap: 10,
            background: C.w, flexShrink: 0,
            boxShadow: "0 1px 4px rgba(7,13,26,.04)",
          }}>
            {isMobile && (
              <button onClick={() => setMobileShowChat(false)} style={{ background: "none", border: "none", cursor: "pointer", color: C.navy, display: "flex", padding: "4px", flexShrink: 0 }}>
                <BackIcon />
              </button>
            )}
            {getConvoAv(convo)}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{getConvoLabel(convo)}</div>
              <div style={{ fontSize: 11, color: "#22C55E", fontWeight: 600 }}>{t.chat_online}</div>
            </div>

            {/* Message search toggle */}
            <button
              onClick={() => { setShowMsgSearch((v) => !v); if (showMsgSearch) setMsgSearch(""); }}
              title="Search messages"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 32, height: 32, border: `1px solid ${showMsgSearch ? C.gold : C.g200}`,
                borderRadius: 8, background: showMsgSearch ? `${C.gold}12` : C.w,
                cursor: "pointer", color: showMsgSearch ? C.gold : C.g400,
              }}
            >
              <SearchMsgIcon />
            </button>

            {/* Auto-translate language picker */}
            <div ref={langPickerRef} style={{ position: "relative" }}>
              <button
                onClick={() => setShowLangPicker((v) => !v)}
                title={t.chat_auto_translate}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "6px 10px", border: `1px solid ${autoTransLang !== "off" ? C.gold : C.g200}`,
                  borderRadius: 8, background: autoTransLang !== "off" ? `${C.gold}12` : C.w,
                  cursor: "pointer", fontSize: 12, fontWeight: 600,
                  color: autoTransLang !== "off" ? C.gold : C.g500,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <GlobeIcon />
                {autoTransLang !== "off" ? t[LANGS.find((l) => l.code === autoTransLang)?.labelKey ?? "chat_lang_en"] : ""}
                <ChevronIcon />
              </button>
              {showLangPicker && (
                <div style={{
                  position: "absolute", right: 0, top: "calc(100% + 6px)", zIndex: 200,
                  background: C.w, border: `1px solid ${C.g100}`, borderRadius: 10,
                  boxShadow: "0 8px 24px rgba(0,0,0,.12)", minWidth: 160, overflow: "hidden",
                }}>
                  <div style={{ padding: "8px 12px 4px", fontSize: 10, fontWeight: 700, color: C.g400, textTransform: "uppercase", letterSpacing: ".06em" }}>
                    {t.chat_auto_translate}
                  </div>
                  {LANGS.map(({ code, labelKey }) => (
                    <button
                      key={code}
                      onClick={() => { setAutoTransLang(code); setShowLangPicker(false); }}
                      style={{
                        width: "100%", textAlign: "left", padding: "8px 14px",
                        border: "none", background: autoTransLang === code ? `${C.gold}12` : "transparent",
                        cursor: "pointer", fontSize: 13, fontFamily: "inherit",
                        color: autoTransLang === code ? C.gold : C.navy,
                        fontWeight: autoTransLang === code ? 700 : 400,
                      }}
                    >
                      {t[labelKey]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Audio / Video call buttons */}
            {onStartCall && (() => {
              const roomName = convo.type === "direct" ? [...convo.parts].sort().join("-") : convo.id;
              const title = getConvoLabel(convo);
              const otherUserId = convo.type === "direct" ? convo.parts.find((p) => p !== currentUser.id) : undefined;
              const targetUser = otherUserId ? userMap[otherUserId] : undefined;
              const target = targetUser ? { id: targetUser.id, name: targetUser.name, color: targetUser.color } : undefined;
              return (
                <>
                  <button onClick={() => onStartCall(roomName, title, false, target)} title="Audio call"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, border: `1px solid ${C.g200}`, borderRadius: 8, background: C.w, cursor: "pointer", color: "#16A34A" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#F0FDF4"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = C.w; }}
                  ><PhoneCallIcon /></button>
                  <button onClick={() => onStartCall(roomName, title, true, target)} title="Video call"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, border: `1px solid ${C.g200}`, borderRadius: 8, background: C.w, cursor: "pointer", color: C.gold }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = `${C.gold}10`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = C.w; }}
                  ><VideoCallIcon /></button>
                </>
              );
            })()}

            {onDeleteConversation && (
              <button
                onClick={() => setConfirmDeleteConvo(convo)}
                data-testid="delete-convo-header-btn"
                title="Delete conversation"
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", border: `1px solid ${C.g200}`, borderRadius: 8, background: C.w, cursor: "pointer", fontSize: 12, fontWeight: 600, color: C.g500, fontFamily: "'DM Sans', sans-serif" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.color = C.err; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = C.w; e.currentTarget.style.color = C.g500; }}
              >
                <TrashIcon /> Delete
              </button>
            )}
          </div>

          {/* ── Message search bar ── */}
          {showMsgSearch && (
            <div style={{
              padding: "8px 20px", borderBottom: `1px solid ${C.g100}`,
              background: `${C.gold}08`, display: "flex", alignItems: "center", gap: 8,
            }}>
              <SearchMsgIcon />
              <input
                autoFocus
                value={msgSearch}
                onChange={(e) => setMsgSearch(e.target.value)}
                placeholder="Search messages…"
                style={{
                  flex: 1, border: "none", background: "none", outline: "none",
                  fontSize: 13, fontFamily: "inherit", color: C.navy,
                }}
              />
              {msgSearch && (
                <button onClick={() => setMsgSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: C.g400, display: "flex" }}>
                  <CloseIcon />
                </button>
              )}
              {msgSearch && (
                <span style={{ fontSize: 12, color: C.g400 }}>
                  {msgs.length} result{msgs.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          )}

          {/* Messages area */}
          <div style={{ flex: 1, overflow: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 4 }}>
            {msgs.length === 0 && (
              <div style={{ textAlign: "center", color: C.g400, fontSize: 13, marginTop: 40 }}>
                {msgSearch ? "No messages match your search." : t.chat_no_messages}
              </div>
            )}
            {msgs.map((m, idx) => {
              const isMe = m.from === currentUser.id;
              const sender = userMap[m.from];
              const prevMsg = msgs[idx - 1];
              const showAvatar = !isMe && (!prevMsg || prevMsg.from !== m.from);
              const showName = showAvatar;
              const isImage = m.text.startsWith("data:image");
              const isLocationOnly = !!m.location && !m.text && !m.attachment && !isImage;
              const transKey = `${m.id}_${autoTransLang}`;
              const translated = autoTransLang !== "off" ? translations[transKey] : undefined;
              const loading = transLoading.has(transKey);
              const failed = transError.has(transKey);
              const isHovered = hoveredMsgId === m.id;
              const replyMsg = m.replyTo ? allMsgs.find((x) => x.id === m.replyTo) : null;
              const isRead = isMe && (m.readBy?.some((uid) => uid !== currentUser.id));
              const isSent = isMe && !isRead;

              return (
                <div
                  key={m.id}
                  data-testid={`msg-${m.id}`}
                  onMouseEnter={() => setHoveredMsgId(m.id)}
                  onMouseLeave={() => { setHoveredMsgId(null); }}
                  style={{
                    display: "flex", gap: 8, alignItems: "flex-end",
                    flexDirection: isMe ? "row-reverse" : "row",
                    marginTop: idx > 0 && msgs[idx - 1].from !== m.from ? 10 : 0,
                    position: "relative",
                  }}
                >
                  {/* Avatar */}
                  <div style={{ width: 30, flexShrink: 0 }}>
                    {showAvatar && <Av ini={sender?.av || "??"} photo={sender?.photo} size={30} />}
                  </div>

                  <div style={{ maxWidth: isMobile ? "78%" : 420, minWidth: 0 }}>
                    {showName && <div style={{ fontSize: 11, color: C.g400, marginBottom: 3, marginLeft: 4 }}>{sender?.name}</div>}

                    {/* Reply quote */}
                    {replyMsg && (
                      <div style={{
                        marginBottom: 4,
                        padding: "5px 10px",
                        borderLeft: `3px solid ${C.gold}`,
                        borderRadius: "8px 8px 0 0",
                        background: isMe ? "rgba(255,255,255,.1)" : `${C.gold}10`,
                        fontSize: 11, color: isMe ? "rgba(255,255,255,.7)" : C.g500,
                        maxWidth: "100%",
                        overflow: "hidden",
                      }}>
                        <div style={{ fontWeight: 700, color: isMe ? "rgba(255,255,255,.9)" : C.gold, fontSize: 11, marginBottom: 1 }}>
                          {replyMsg.from === currentUser.id ? "You" : userMap[replyMsg.from]?.name || "?"}
                        </div>
                        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {replyMsg.text.startsWith("data:image") ? "🖊 Drawing" : replyMsg.text.slice(0, 80)}
                        </div>
                      </div>
                    )}

                    {/* Bubble */}
                    <div style={{
                      padding: isLocationOnly ? 0 : (isImage && !m.attachment) ? "4px" : "10px 14px",
                      borderRadius: isMe ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
                      background: isLocationOnly ? "transparent" : isMe
                        ? `linear-gradient(135deg,${C.navy} 0%,${C.navyL} 100%)`
                        : C.w,
                      color: isMe ? C.w : C.navy,
                      fontSize: 13, lineHeight: 1.55,
                      wordBreak: "break-word",
                      boxShadow: isLocationOnly ? "none" : isMe ? "0 2px 8px rgba(7,13,26,.18)" : "0 1px 4px rgba(0,0,0,.07)",
                      overflow: isLocationOnly ? "hidden" : undefined,
                    }}>
                      {isImage ? (
                        <div style={{ background: "#ffffff", borderRadius: 8, overflow: "hidden", display: "inline-block" }}>
                          <img src={m.text} alt="Drawing" style={{ maxWidth: 280, maxHeight: 180, display: "block", verticalAlign: "top" }} />
                        </div>
                      ) : m.text ? (
                        <span>{msgSearch ? highlight(m.text, msgSearch) : m.text}</span>
                      ) : null}

                      {/* Location card */}
                      {m.location && (
                        <LocationCard loc={m.location} isMe={isMe} />
                      )}

                      {/* File / image attachment */}
                      {m.attachment && (
                        <div style={{ marginTop: m.text ? 8 : 0 }}>
                          {m.attachment.type.startsWith("image/") ? (
                            <div style={{ borderRadius: 10, overflow: "hidden", maxWidth: 280 }}>
                              <img src={m.attachment.data} alt={m.attachment.name} style={{ width: "100%", display: "block", maxHeight: 240, objectFit: "cover" }} />
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 8px", background: isMe ? "rgba(0,0,0,.25)" : "rgba(0,0,0,.04)", fontSize: 11 }}>
                                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>{m.attachment.name}</span>
                                <a href={m.attachment.data} download={m.attachment.name} style={{ color: isMe ? "rgba(255,255,255,.7)" : C.gold, marginLeft: 8, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}><DownloadIcon /></a>
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: isMe ? "rgba(255,255,255,.08)" : `${C.gold}10`, border: `1px solid ${isMe ? "rgba(255,255,255,.12)" : `${C.gold}25`}`, minWidth: 160, maxWidth: 260 }}>
                              <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: isMe ? "rgba(255,255,255,.12)" : `${C.gold}20`, display: "flex", alignItems: "center", justifyContent: "center", color: isMe ? "rgba(255,255,255,.8)" : C.gold }}>
                                <FileIcon />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: isMe ? "rgba(255,255,255,.9)" : C.navy }}>{m.attachment.name}</div>
                                <div style={{ fontSize: 11, color: isMe ? "rgba(255,255,255,.45)" : C.g400, marginTop: 1 }}>{formatFileSize(m.attachment.size)}</div>
                              </div>
                              <a href={m.attachment.data} download={m.attachment.name} style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, background: isMe ? "rgba(255,255,255,.12)" : `${C.gold}18`, display: "flex", alignItems: "center", justifyContent: "center", color: isMe ? "rgba(255,255,255,.8)" : C.gold, textDecoration: "none" }} onClick={(e) => e.stopPropagation()}>
                                <DownloadIcon />
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Reactions row */}
                    {m.reactions && m.reactions.length > 0 && (
                      <div style={{
                        display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4,
                        justifyContent: isMe ? "flex-end" : "flex-start",
                      }}>
                        {m.reactions.map((r) => {
                          const iReacted = r.userIds.includes(currentUser.id);
                          return (
                            <button
                              key={r.emoji}
                              onClick={() => handleReact(m.id, r.emoji)}
                              style={{
                                display: "flex", alignItems: "center", gap: 3,
                                padding: "2px 7px", borderRadius: 12,
                                border: `1.5px solid ${iReacted ? C.gold : C.g200}`,
                                background: iReacted ? `${C.gold}15` : C.w,
                                cursor: "pointer", fontSize: 13,
                                fontFamily: "inherit",
                              }}
                            >
                              {r.emoji}
                              <span style={{ fontSize: 11, color: iReacted ? C.gold : C.g500, fontWeight: iReacted ? 700 : 400 }}>
                                {r.userIds.length}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Translation row */}
                    {!isMe && !isImage && autoTransLang !== "off" && (
                      <div style={{ marginTop: 4, marginLeft: 4 }}>
                        {loading ? (
                          <span style={{ fontSize: 11, color: C.gold }}>{t.chat_translating}</span>
                        ) : failed ? (
                          <span style={{ fontSize: 11, color: C.err, display: "flex", alignItems: "center", gap: 6 }}>
                            {t.chat_trans_failed}
                            <button
                              onClick={() => translateMsg(m.id, m.text, autoTransLang)}
                              style={{ fontSize: 11, color: C.gold, background: "none", border: "none", cursor: "pointer", padding: "0 2px", fontFamily: "inherit", textDecoration: "underline" }}
                            >
                              {t.chat_translate}
                            </button>
                          </span>
                        ) : translated ? (
                          <div style={{ fontSize: 12, color: C.g500, background: `${C.gold}0e`, borderRadius: 8, padding: "5px 10px", borderLeft: `2px solid ${C.gold}` }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: C.gold, display: "block", marginBottom: 1 }}>{t.chat_translated}</span>
                            {translated}
                          </div>
                        ) : null}
                      </div>
                    )}

                    {/* Per-message manual translate button */}
                    {!isMe && !isImage && autoTransLang === "off" && m.text && (
                      <div style={{ marginTop: 4, marginLeft: 4 }}>
                        {transLoading.has(`${m.id}_en`) ? (
                          <span style={{ fontSize: 11, color: C.gold }}>{t.chat_translating}</span>
                        ) : translations[`${m.id}_en`] ? (
                          <div style={{ fontSize: 12, color: C.g500, background: `${C.gold}0e`, borderRadius: 8, padding: "5px 10px", borderLeft: `2px solid ${C.gold}` }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: C.gold, display: "block", marginBottom: 1 }}>{t.chat_translated}</span>
                            {translations[`${m.id}_en`]}
                          </div>
                        ) : transError.has(`${m.id}_en`) ? (
                          <span style={{ fontSize: 11, color: C.err, display: "flex", alignItems: "center", gap: 6 }}>
                            {t.chat_trans_failed}
                            <button
                              onClick={() => translateMsg(m.id, m.text, "en")}
                              style={{ fontSize: 11, color: C.gold, background: "none", border: "none", cursor: "pointer", padding: "0 2px", fontFamily: "inherit", textDecoration: "underline" }}
                            >
                              {t.chat_translate}
                            </button>
                          </span>
                        ) : (
                          <button
                            onClick={() => translateMsg(m.id, m.text, "en")}
                            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: C.g400, display: "flex", alignItems: "center", gap: 3, padding: "2px 0", fontFamily: "inherit" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = C.gold; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = C.g400; }}
                          >
                            <TranslateIcon /> {t.chat_translate}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Timestamp + edited + read receipts */}
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, justifyContent: isMe ? "flex-end" : "flex-start", marginLeft: 4, marginRight: 4 }}>
                      <span style={{ fontSize: 10, color: C.g400 }}>{fmtT(m.ts)}</span>
                      {m.edited && <span style={{ fontSize: 10, color: C.g400, fontStyle: "italic" }}>(edited)</span>}
                      {isMe && (
                        <span style={{ color: isRead ? C.gold : C.g400, display: "flex", alignItems: "center" }} title={isRead ? "Read" : "Sent"}>
                          {isRead ? <CheckCheckIcon /> : isSent ? <CheckIcon /> : null}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ── Hover action bar ── */}
                  {isHovered && !isImage && (
                    <div style={{
                      display: "flex", alignItems: "center", gap: 2,
                      position: "absolute",
                      [isMe ? "left" : "right"]: isMobile ? 36 : 44,
                      bottom: 24,
                      background: C.w,
                      border: `1px solid ${C.g100}`,
                      borderRadius: 10,
                      padding: "3px 4px",
                      boxShadow: "0 2px 12px rgba(0,0,0,.12)",
                      zIndex: 10,
                    }}>
                      {/* Reply */}
                      <button
                        onClick={() => startReply(m)}
                        title="Reply"
                        style={{ width: 26, height: 26, border: "none", background: "none", cursor: "pointer", color: C.g400, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = C.g50; e.currentTarget.style.color = C.navy; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.g400; }}
                      ><ReplyIcon /></button>

                      {/* React */}
                      <div style={{ position: "relative" }}>
                        <button
                          onClick={() => setEmojiPickerMsgId(emojiPickerMsgId === m.id ? null : m.id)}
                          title="React"
                          style={{ width: 26, height: 26, border: "none", background: emojiPickerMsgId === m.id ? C.g50 : "none", cursor: "pointer", color: C.g400, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = C.g50; e.currentTarget.style.color = C.navy; }}
                          onMouseLeave={(e) => { if (emojiPickerMsgId !== m.id) { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.g400; } }}
                        ><SmileIcon /></button>

                        {/* Emoji picker */}
                        {emojiPickerMsgId === m.id && (
                          <div
                            id={`emoji-picker-${m.id}`}
                            style={{
                              position: "absolute",
                              bottom: "calc(100% + 6px)",
                              [isMe ? "right" : "left"]: 0,
                              background: C.w,
                              border: `1px solid ${C.g100}`,
                              borderRadius: 12,
                              padding: "6px 8px",
                              display: "flex", gap: 4,
                              boxShadow: "0 4px 20px rgba(0,0,0,.15)",
                              zIndex: 50,
                            }}
                          >
                            {QUICK_EMOJIS.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => handleReact(m.id, emoji)}
                                style={{ width: 32, height: 32, border: "none", background: "none", cursor: "pointer", fontSize: 18, borderRadius: 8, transition: "transform .1s" }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.3)"; (e.currentTarget as HTMLElement).style.background = C.g50; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; (e.currentTarget as HTMLElement).style.background = "none"; }}
                              >{emoji}</button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Edit (own messages only) */}
                      {isMe && !m.attachment && (
                        <button
                          onClick={() => startEdit(m)}
                          title="Edit"
                          style={{ width: 26, height: 26, border: "none", background: "none", cursor: "pointer", color: C.g400, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = C.g50; e.currentTarget.style.color = C.navy; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.g400; }}
                        ><EditIcon /></button>
                      )}

                      {/* Delete */}
                      {isMe && (
                        <button
                          onClick={() => setConfirmDeleteMsg(m)}
                          title="Delete"
                          style={{ width: 26, height: 26, border: "none", background: "none", cursor: "pointer", color: C.g400, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.color = C.err; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.g400; }}
                        ><TrashIcon /></button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Voice unsupported toast */}
          {voiceUnsupported && (
            <div style={{ margin: "0 20px 8px", padding: "8px 14px", background: "#FEF2F2", borderRadius: 8, fontSize: 12, color: C.err, border: `1px solid #FECACA` }}>
              {t.chat_voice_unsupported}
            </div>
          )}

          {/* File too large error */}
          {fileError && (
            <div style={{ margin: "0 20px 8px", padding: "8px 14px", background: "#FEF2F2", borderRadius: 8, fontSize: 12, color: C.err, border: `1px solid #FECACA` }}>
              {fileError}
            </div>
          )}

          {/* ── Edit mode banner ── */}
          {editingMsgId && (
            <div style={{
              margin: "0 20px 6px", padding: "7px 12px",
              background: `${C.gold}10`, border: `1px solid ${C.gold}30`,
              borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <EditIcon />
                <span style={{ fontSize: 12, fontWeight: 600, color: C.gold }}>Editing message</span>
                <span style={{ fontSize: 11, color: C.g400 }}>— press Esc to cancel</span>
              </div>
              <button onClick={cancelEdit} style={{ background: "none", border: "none", cursor: "pointer", color: C.g400, display: "flex" }}>
                <CloseIcon />
              </button>
            </div>
          )}

          {/* ── Reply-to preview strip ── */}
          {replyToId && !editingMsgId && (
            <div style={{
              margin: "0 20px 6px", padding: "7px 12px",
              background: `${C.navy}06`, border: `1px solid ${C.g100}`,
              borderLeft: `3px solid ${C.gold}`,
              borderRadius: "0 8px 8px 0",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, marginBottom: 1 }}>
                  Replying to {(() => {
                    const rm = allMsgs.find((x) => x.id === replyToId);
                    return rm ? (rm.from === currentUser.id ? "yourself" : userMap[rm.from]?.name || "?") : "message";
                  })()}
                </div>
                <div style={{ fontSize: 11, color: C.g500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {(() => {
                    const rm = allMsgs.find((x) => x.id === replyToId);
                    if (!rm) return "";
                    return rm.text.startsWith("data:image") ? "🖊 Drawing" : rm.text.slice(0, 60);
                  })()}
                </div>
              </div>
              <button onClick={() => setReplyToId(null)} style={{ background: "none", border: "none", cursor: "pointer", color: C.g400, display: "flex", flexShrink: 0, marginLeft: 8 }}>
                <CloseIcon />
              </button>
            </div>
          )}

          {/* Pending file preview strip */}
          {pendingFile && (
            <div style={{ margin: "0 20px 8px", padding: "8px 12px", borderRadius: 10, background: `${C.gold}0c`, border: `1px solid ${C.gold}30`, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 7, flexShrink: 0, background: `${C.gold}20`, display: "flex", alignItems: "center", justifyContent: "center", color: C.gold }}>
                {pendingFile.type.startsWith("image/") ? (
                  <img src={pendingFile.data} alt="" style={{ width: 30, height: 30, objectFit: "cover", borderRadius: 7 }} />
                ) : <FileIcon />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pendingFile.name}</div>
                <div style={{ fontSize: 11, color: C.g400 }}>{formatFileSize(pendingFile.size)}</div>
              </div>
              <button onClick={() => setPendingFile(null)} style={{ background: "none", border: "none", cursor: "pointer", color: C.g400, padding: 4, display: "flex", alignItems: "center", justifyContent: "center" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = C.err; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = C.g400; }}
              ><XSmIcon /></button>
            </div>
          )}

          {/* Input bar */}
          {/* Location error banner */}
          {locationError && (
            <div style={{
              margin: "0 20px 4px",
              padding: "8px 14px",
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: 10,
              fontSize: 12,
              color: "#DC2626",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              <span style={{ fontSize: 14 }}>📍</span>
              {locationError}
            </div>
          )}

          {/* Locating indicator */}
          {isLocating && (
            <div style={{
              margin: "0 20px 4px",
              padding: "8px 14px",
              background: `${C.gold}10`,
              border: `1px solid ${C.gold}30`,
              borderRadius: 10,
              fontSize: 12,
              color: C.gold,
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              <MapPinIcon />
              Getting your location…
            </div>
          )}

          <div style={{ padding: "12px 20px", borderTop: `1px solid ${C.g100}`, background: C.w, display: "flex", gap: 8, alignItems: "center" }}>
            <input ref={fileInputRef} type="file" accept="*/*" style={{ display: "none" }} onChange={handleFileSelect} />

            {/* Attach file */}
            {!editingMsgId && (
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Attach file"
                data-testid="attach-file-btn"
                style={{ width: 38, height: 38, border: `1px solid ${pendingFile ? C.gold : C.g200}`, borderRadius: 10, background: pendingFile ? `${C.gold}10` : C.w, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: pendingFile ? C.gold : C.g400, flexShrink: 0, transition: "all .15s" }}
                onMouseEnter={(e) => { if (!pendingFile) { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; } }}
                onMouseLeave={(e) => { if (!pendingFile) { e.currentTarget.style.borderColor = C.g200; e.currentTarget.style.color = C.g400; } }}
              ><PaperclipIcon /></button>
            )}

            {/* Draw */}
            {!editingMsgId && (
              <button
                onClick={() => setShowDrawPad(true)}
                title={t.chat_draw_title}
                style={{ width: 38, height: 38, border: `1px solid ${C.g200}`, borderRadius: 10, background: C.w, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.g400, flexShrink: 0 }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.g200; e.currentTarget.style.color = C.g400; }}
              ><PenIcon /></button>
            )}

            {/* Share location */}
            {!editingMsgId && (
              <button
                onClick={handleShareLocation}
                disabled={isLocating}
                title="Share my location"
                data-testid="share-location-btn"
                style={{
                  width: 38, height: 38,
                  border: `1px solid ${isLocating ? C.gold : C.g200}`,
                  borderRadius: 10,
                  background: isLocating ? `${C.gold}12` : C.w,
                  cursor: isLocating ? "wait" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: isLocating ? C.gold : C.g400,
                  flexShrink: 0,
                  transition: "all .15s",
                  opacity: isLocating ? 0.7 : 1,
                  animation: isLocating ? "pulse 1s ease-in-out infinite" : "none",
                }}
                onMouseEnter={(e) => { if (!isLocating) { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; } }}
                onMouseLeave={(e) => { if (!isLocating) { e.currentTarget.style.borderColor = C.g200; e.currentTarget.style.color = C.g400; } }}
              >
                <MapPinIcon />
              </button>
            )}

            {/* Text input */}
            <div style={{ flex: 1, position: "relative" }}>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (isRecording) finalTranscriptRef.current = e.target.value;
                }}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder={
                  editingMsgId ? "Edit your message…" :
                  isRecording && !input ? (t.chat_voice_recording || "Listening…") :
                  t.chat_placeholder
                }
                data-testid="chat-input"
                style={{
                  width: "100%", padding: isRecording ? "10px 36px 10px 16px" : "10px 16px",
                  border: `1.5px solid ${editingMsgId ? C.gold : isRecording ? C.gold : C.g200}`,
                  borderRadius: 12, fontSize: 13, fontFamily: "inherit", outline: "none",
                  boxSizing: "border-box",
                  background: editingMsgId ? `${C.gold}06` : isRecording ? `${C.gold}08` : C.w,
                  color: interimText ? "#6B7280" : C.navy,
                  transition: "border-color .15s, background .15s, color .15s",
                }}
              />
              {isRecording && (
                <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 8, height: 8, borderRadius: "50%", background: C.gold, animation: "pulse 1.2s ease-in-out infinite" }} />
              )}
            </div>

            {/* Voice button */}
            {SR && !editingMsgId && (
              <button onClick={toggleVoice} title={t.chat_voice_tip}
                style={{ width: 38, height: 38, border: `1.5px solid ${isRecording ? C.gold : C.g200}`, borderRadius: 10, background: isRecording ? `${C.gold}15` : C.w, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: isRecording ? C.gold : C.g400, flexShrink: 0, transition: "all .15s" }}
              >{isRecording ? <MicOffIcon /> : <MicIcon />}</button>
            )}

            {/* WhatsApp */}
            {whatsappUrl && !editingMsgId && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" title={t.chat_whatsapp_tip} data-testid="whatsapp-btn"
                style={{ width: 38, height: 38, borderRadius: 10, background: "#25D366", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0, textDecoration: "none", transition: "opacity .15s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
              ><WhatsAppIcon /></a>
            )}

            {/* Cancel edit button */}
            {editingMsgId && (
              <button onClick={cancelEdit} title="Cancel edit"
                style={{ width: 38, height: 38, border: `1px solid ${C.g200}`, borderRadius: 10, background: C.w, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.g400, flexShrink: 0 }}
              ><CloseIcon /></button>
            )}

            {/* Send / Save button */}
            <button
              onClick={sendMessage}
              data-testid="send-btn"
              style={{ width: 38, height: 38, background: `linear-gradient(135deg,${C.gold},${C.goldD})`, border: "none", borderRadius: 10, cursor: "pointer", color: C.w, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
            >
              {editingMsgId ? <CheckIcon /> : <SendIcon />}
            </button>
          </div>
        </div>
      ) : (!isMobile ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, background: "#F8F9FC" }}>
          <div style={{ fontSize: 48 }}>💬</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>{t.chat_empty_title}</div>
          <div style={{ fontSize: 13, color: C.g400 }}>{t.chat_empty_desc}</div>
          <button onClick={() => setShowNew(true)} style={{ marginTop: 4, padding: "10px 22px", background: `linear-gradient(135deg,${C.navy},${C.navyL})`, border: "none", borderRadius: 10, cursor: "pointer", color: C.w, fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}>
            + {t.chat_new}
          </button>
        </div>
      ) : null)}

      {/* ── Modals ────────────────────────────────────── */}

      <Modal open={showDrawPad} onClose={() => setShowDrawPad(false)} title={t.chat_draw_title}>
        <DrawPad onSend={sendDrawing} onClose={() => setShowDrawPad(false)} t={t as unknown as Record<string, string>} />
      </Modal>

      <Modal open={showNew} onClose={() => setShowNew(false)} title={t.chat_new}>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {([["direct", t.chat_direct], ["group", t.chat_group]] as const).map(([type, label]) => (
            <button key={type} onClick={() => setNewType(type)}
              style={{ flex: 1, padding: "9px", border: `2px solid ${newType === type ? C.gold : C.g200}`, borderRadius: 9, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: newType === type ? 700 : 400, background: newType === type ? `${C.gold}10` : C.w, color: newType === type ? C.gold : C.g500 }}>
              {label}
            </button>
          ))}
        </div>
        {newType === "direct" ? (
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.g600, display: "block", marginBottom: 6 }}>{t.chat_select_person}</label>
            <select value={newPerson} onChange={(e) => setNewPerson(e.target.value)} data-testid="select-person"
              style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.g200}`, borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", marginBottom: 16 }}>
              <option value="">—</option>
              {otherUsers.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
        ) : (
          <div>
            <Inp label={t.chat_group_name} value={newGroupName} onChange={setNewGroupName} ph={t.chat_group_ph} />
            <label style={{ fontSize: 12, fontWeight: 600, color: C.g600, display: "block", marginBottom: 6 }}>{t.chat_select_members}</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16, maxHeight: 180, overflow: "auto" }}>
              {otherUsers.map((u) => (
                <label key={u.id} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "6px 8px", borderRadius: 6, background: newGroupMembers.includes(u.id) ? `${C.gold}10` : "transparent" }}>
                  <input type="checkbox" checked={newGroupMembers.includes(u.id)} onChange={(e) => setNewGroupMembers(e.target.checked ? [...newGroupMembers, u.id] : newGroupMembers.filter((x) => x !== u.id))} />
                  <Av ini={u.av} photo={u.photo} size={24} />
                  <span style={{ fontSize: 13, color: C.navy }}>{u.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        <Btn onClick={createConvo} data-testid="start-convo-btn" style={{ width: "100%", justifyContent: "center" }}>
          {t.chat_start}
        </Btn>
      </Modal>

      <ConfirmDialog
        open={!!confirmDeleteConvo}
        title="Delete Conversation"
        message={`Are you sure you want to delete "${confirmDeleteConvo ? getConvoLabel(confirmDeleteConvo) : ""}"? All messages will be permanently removed.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteConvo}
        onCancel={() => setConfirmDeleteConvo(null)}
      />

      <ConfirmDialog
        open={!!confirmDeleteMsg}
        title="Delete Message"
        message="Are you sure you want to delete this message? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteMsg}
        onCancel={() => setConfirmDeleteMsg(null)}
      />
    </div>
  );
}

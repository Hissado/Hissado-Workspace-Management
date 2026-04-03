import { useState, useRef, useEffect, useCallback } from "react";
import { C, Av, Btn, Modal, Inp } from "@/components/primitives";
import { useI18n } from "@/lib/i18n";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Conversation, Message, User, Notification } from "@/lib/data";
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

/* ─── Translation API ────────────────────────────────────── */
const LANG_CODES: Record<string, string> = {
  en: "en-US", fr: "fr-FR", zh: "zh-CN", es: "es-ES",
  de: "de-DE", ar: "ar-SA", pt: "pt-BR", ja: "ja-JP",
};

async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || text.startsWith("data:image")) return text;
  try {
    const code = LANG_CODES[targetLang] || targetLang;
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${code}`,
      { signal: AbortSignal.timeout(8000) }
    );
    const json = await res.json();
    if (json?.responseStatus === 200 && json?.responseData?.translatedText) {
      return json.responseData.translatedText;
    }
    return text;
  } catch {
    return text;
  }
}

/* ─── Voice recognition helper ───────────────────────────── */
type SpeechRecognitionInstance = {
  lang: string; continuous: boolean; interimResults: boolean;
  onresult: ((e: { results: { [k: number]: { [k: number]: { transcript: string } } } }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void; stop(): void;
};
const getSR = (): (new () => SpeechRecognitionInstance) | null =>
  (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance; webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ||
  (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition || null;

/* ─── Drawing canvas component ───────────────────────────── */
function DrawPad({ onSend, onClose, t }: { onSend: (dataUrl: string) => void; onClose: () => void; t: Record<string, string> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      const t = e.touches[0];
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current; if (!canvas) return;
    drawing.current = true;
    lastPos.current = getPos(e, canvas);
  };
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!drawing.current || !lastPos.current) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#070D1A";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
  };
  const endDraw = () => { drawing.current = false; lastPos.current = null; };

  const clearCanvas = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const sendDrawing = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onSend(dataUrl);
    onClose();
  };

  return (
    <div>
      <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 12 }}>{t.chat_draw_hint}</p>
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
          width: "100%", height: 200, border: `1.5px solid #E5E7EB`,
          borderRadius: 10, cursor: "crosshair", background: "#FAFAFA",
          touchAction: "none", display: "block",
        }}
      />
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button onClick={clearCanvas} style={{ flex: 1, padding: "9px 0", border: `1px solid #E5E7EB`, borderRadius: 8, background: "#FFF", cursor: "pointer", fontSize: 13, fontFamily: "inherit", color: "#374151" }}>
          {t.chat_draw_clear}
        </button>
        <button onClick={sendDrawing} style={{ flex: 2, padding: "9px 0", border: "none", borderRadius: 8, background: `linear-gradient(135deg,#C9A96E,#a87e4a)`, cursor: "pointer", fontSize: 13, fontFamily: "inherit", color: "#FFF", fontWeight: 600 }}>
          {t.chat_draw_send}
        </button>
      </div>
    </div>
  );
}

/* ─── Language picker dropdown ───────────────────────────── */
const LANGS = [
  { code: "off", labelKey: "chat_trans_off" },
  { code: "en", labelKey: "chat_lang_en" },
  { code: "fr", labelKey: "chat_lang_fr" },
  { code: "zh", labelKey: "chat_lang_zh" },
  { code: "es", labelKey: "chat_lang_es" },
  { code: "de", labelKey: "chat_lang_de" },
  { code: "ar", labelKey: "chat_lang_ar" },
  { code: "pt", labelKey: "chat_lang_pt" },
  { code: "ja", labelKey: "chat_lang_ja" },
];

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
}

/* ─── Main component ─────────────────────────────────────── */
export default function Chat({ conversations, messages, users, currentUser, onSendMessage, onCreateConvo, onAddNotification, onDeleteConversation }: ChatProps) {
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
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const SR = getSR();

  /* drawing */
  const [showDrawPad, setShowDrawPad] = useState(false);

  /* translation */
  const [autoTransLang, setAutoTransLang] = useState<string>("off");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [transLoading, setTransLoading] = useState<Set<string>>(new Set());
  const [transError, setTransError] = useState<Set<string>>(new Set());
  const [showLangPicker, setShowLangPicker] = useState(false);
  const langPickerRef = useRef<HTMLDivElement>(null);

  /* scroll */
  const bottomRef = useRef<HTMLDivElement>(null);

  /* derived */
  const convo = conversations.find((c) => c.id === selected);
  const msgs = selected ? (messages[selected] || []) : [];
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));
  const otherUsers = users.filter((u) => u.id !== currentUser.id);

  /* whatsapp — only for direct conversations with a phone number */
  const whatsappUrl = (() => {
    if (!convo || convo.type !== "direct") return null;
    const otherId = convo.parts.find((id) => id !== currentUser.id);
    const phone = otherId ? userMap[otherId]?.phone : undefined;
    if (!phone) return null;
    const digits = phone.replace(/\s+/g, "").replace(/[^\d+]/g, "").replace(/^\+/, "");
    return digits ? `https://wa.me/${digits}` : null;
  })();

  const showList = !isMobile || !mobileShowChat || !selected;
  const showChat = !isMobile || (mobileShowChat && !!selected);

  /* sort conversations by most recent message (newest first in list) */
  const sortedConversations = [...conversations].sort((a, b) => {
    const aTs = (messages[a.id] || []).at(-1)?.ts || a.created;
    const bTs = (messages[b.id] || []).at(-1)?.ts || b.created;
    return new Date(bTs).getTime() - new Date(aTs).getTime();
  });
  const filtered = sortedConversations.filter((cv) => getConvoLabel(cv).toLowerCase().includes(search.toLowerCase()));

  /* helpers */
  function getConvoLabel(cv: Conversation): string {
    if (cv.name) return cv.name;
    const others = cv.parts.filter((id) => id !== currentUser.id);
    return others.map((id) => userMap[id]?.name || "?").join(", ");
  }

  function getConvoAv(cv: Conversation) {
    if (cv.type === "group") return (
      <div style={{ width: 42, height: 42, borderRadius: 14, background: `${C.gold}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <UsersIcon2 />
      </div>
    );
    const other = cv.parts.find((id) => id !== currentUser.id);
    return <Av ini={userMap[other || ""]?.av || "??"} photo={userMap[other || ""]?.photo} size={42} />;
  }

  /* auto-scroll to newest message */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
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

  /* auto-translate new messages when autoTransLang is set */
  useEffect(() => {
    if (autoTransLang === "off") return;
    msgs.forEach((m) => {
      if (m.from === currentUser.id) return;
      if (m.text.startsWith("data:image")) return;
      const key = `${m.id}_${autoTransLang}`;
      if (translations[key] || transLoading.has(key)) return;
      translateMsg(m.id, m.text, autoTransLang);
    });
  }, [msgs.length, autoTransLang, selected]);

  /* translate a single message */
  const translateMsg = useCallback(async (msgId: string, text: string, lang: string) => {
    const key = `${msgId}_${lang}`;
    setTransLoading((s) => new Set(s).add(key));
    setTransError((prev) => { const n = new Set(prev); n.delete(key); return n; });
    const result = await translateText(text, lang);
    if (result === text) {
      setTransError((s) => new Set(s).add(key));
    } else {
      setTranslations((prev) => ({ ...prev, [key]: result }));
    }
    setTransLoading((s) => { const n = new Set(s); n.delete(key); return n; });
  }, []);

  /* send text message */
  const sendMessage = () => {
    if (!input.trim() || !selected) return;
    const msg: Message = { id: uid(), cId: selected, from: currentUser.id, text: input.trim(), ts: new Date().toISOString() };
    onSendMessage(selected, msg);
    onAddNotification({ id: uid(), type: "message", text: `New message in ${getConvoLabel(convo!)}`, read: false, date: fmtT(msg.ts) });
    setInput("");
  };

  /* send drawing */
  const sendDrawing = (dataUrl: string) => {
    if (!selected) return;
    const msg: Message = { id: uid(), cId: selected, from: currentUser.id, text: dataUrl, ts: new Date().toISOString() };
    onSendMessage(selected, msg);
  };

  /* voice input */
  const startVoice = () => {
    if (!SR) { setVoiceUnsupported(true); setTimeout(() => setVoiceUnsupported(false), 3000); return; }
    const rec = new SR();
    rec.lang = navigator.language || "en-US";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput((prev) => (prev ? prev + " " + transcript : transcript));
    };
    rec.onerror = () => setIsRecording(false);
    rec.onend = () => setIsRecording(false);
    rec.start();
    recognitionRef.current = rec;
    setIsRecording(true);
  };
  const stopVoice = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsRecording(false);
  };
  const toggleVoice = () => isRecording ? stopVoice() : startVoice();

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

          {/* list (sorted newest-first by last message) */}
          <div style={{ flex: 1, overflow: "auto" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: C.g400, fontSize: 13 }}>{t.chat_no_convos}</div>
            ) : filtered.map((cv) => {
              const lastMsg = (messages[cv.id] || []).at(-1);
              const isActive = selected === cv.id;
              const isImage = lastMsg?.text?.startsWith("data:image");
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
                        <span style={{ fontSize: 13, fontWeight: 600, color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{getConvoLabel(cv)}</span>
                        {lastMsg && <span style={{ fontSize: 10, color: C.g400, flexShrink: 0, marginLeft: 6 }}>{fmtT(lastMsg.ts)}</span>}
                      </div>
                      {lastMsg && (
                        <div style={{ fontSize: 12, color: C.g400, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {lastMsg.from === currentUser.id ? <span style={{ color: C.gold, fontSize: 11 }}>{t.chat_you}</span> : ""}
                          {isImage ? "🖊 Drawing" : lastMsg.text}
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
                {autoTransLang !== "off" ? (t as Record<string, string>)[`chat_lang_${autoTransLang}`] : ""}
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
                      {(t as Record<string, string>)[labelKey]}
                    </button>
                  ))}
                </div>
              )}
            </div>

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

          {/* Messages area — oldest at top, newest at bottom (auto-scrolls down) */}
          <div style={{ flex: 1, overflow: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 4 }}>
            {msgs.length === 0 && (
              <div style={{ textAlign: "center", color: C.g400, fontSize: 13, marginTop: 40 }}>{t.chat_no_messages}</div>
            )}
            {msgs.map((m, idx) => {
              const isMe = m.from === currentUser.id;
              const sender = userMap[m.from];
              const prevMsg = msgs[idx - 1];
              const showAvatar = !isMe && (!prevMsg || prevMsg.from !== m.from);
              const showName = showAvatar;
              const isImage = m.text.startsWith("data:image");
              const transKey = `${m.id}_${autoTransLang}`;
              const translated = autoTransLang !== "off" ? translations[transKey] : undefined;
              const loading = transLoading.has(transKey);
              const failed = transError.has(transKey);
              return (
                <div key={m.id} data-testid={`msg-${m.id}`} style={{ display: "flex", gap: 8, alignItems: "flex-end", flexDirection: isMe ? "row-reverse" : "row", marginTop: idx > 0 && msgs[idx - 1].from !== m.from ? 10 : 0 }}>
                  {/* Avatar — only for first message in a run */}
                  <div style={{ width: 30, flexShrink: 0 }}>
                    {showAvatar && <Av ini={sender?.av || "??"} photo={sender?.photo} size={30} />}
                  </div>
                  <div style={{ maxWidth: isMobile ? "78%" : 420 }}>
                    {showName && <div style={{ fontSize: 11, color: C.g400, marginBottom: 3, marginLeft: 4 }}>{sender?.name}</div>}

                    {/* Bubble */}
                    <div style={{
                      padding: isImage ? "4px" : "10px 14px",
                      borderRadius: isMe ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
                      background: isMe
                        ? `linear-gradient(135deg,${C.navy} 0%,${C.navyL} 100%)`
                        : C.w,
                      color: isMe ? C.w : C.navy,
                      fontSize: 13, lineHeight: 1.55,
                      wordBreak: "break-word",
                      boxShadow: isMe ? "0 2px 8px rgba(7,13,26,.18)" : "0 1px 4px rgba(0,0,0,.07)",
                    }}>
                      {isImage ? (
                        <img src={m.text} alt="Drawing" style={{ maxWidth: 280, maxHeight: 180, borderRadius: 10, display: "block" }} />
                      ) : (
                        m.text
                      )}
                    </div>

                    {/* Translation row */}
                    {!isMe && !isImage && autoTransLang !== "off" && (
                      <div style={{ marginTop: 4, marginLeft: 4 }}>
                        {loading ? (
                          <span style={{ fontSize: 11, color: C.gold }}>{t.chat_translating}</span>
                        ) : failed ? (
                          <span style={{ fontSize: 11, color: C.err }}>{t.chat_trans_failed}</span>
                        ) : translated ? (
                          <div style={{ fontSize: 12, color: C.g500, background: `${C.gold}0e`, borderRadius: 8, padding: "5px 10px", borderLeft: `2px solid ${C.gold}` }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: C.gold, display: "block", marginBottom: 1 }}>{t.chat_translated}</span>
                            {translated}
                          </div>
                        ) : null}
                      </div>
                    )}

                    {/* Per-message manual translate button */}
                    {!isMe && !isImage && autoTransLang === "off" && (
                      <button
                        onClick={() => {
                          const lang = "en";
                          translateMsg(m.id, m.text, lang);
                        }}
                        style={{ marginTop: 4, marginLeft: 4, background: "none", border: "none", cursor: "pointer", fontSize: 11, color: C.g400, display: "flex", alignItems: "center", gap: 3, padding: "2px 0" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = C.gold; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = C.g400; }}
                      >
                        {transLoading.has(`${m.id}_en`) ? (
                          <span>{t.chat_translating}</span>
                        ) : translations[`${m.id}_en`] ? (
                          <span style={{ color: C.gold }}>{t.chat_translated}: {translations[`${m.id}_en`]}</span>
                        ) : (
                          <><TranslateIcon /> {t.chat_translate}</>
                        )}
                      </button>
                    )}

                    <div style={{ fontSize: 10, color: C.g400, marginTop: 4, textAlign: isMe ? "right" : "left", marginLeft: 4, marginRight: 4 }}>{fmtT(m.ts)}</div>
                  </div>
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

          {/* Input bar */}
          <div style={{ padding: "12px 20px", borderTop: `1px solid ${C.g100}`, background: C.w, display: "flex", gap: 8, alignItems: "center" }}>
            {/* Draw button */}
            <button
              onClick={() => setShowDrawPad(true)}
              title={t.chat_draw_title}
              style={{
                width: 38, height: 38, border: `1px solid ${C.g200}`, borderRadius: 10,
                background: C.w, cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", color: C.g400, flexShrink: 0,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.g200; e.currentTarget.style.color = C.g400; }}
            >
              <PenIcon />
            </button>

            {/* Text input */}
            <div style={{ flex: 1, position: "relative" }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder={isRecording ? (t.chat_voice_recording || "Listening...") : t.chat_placeholder}
                data-testid="chat-input"
                style={{
                  width: "100%", padding: "10px 16px",
                  border: `1.5px solid ${isRecording ? C.gold : C.g200}`,
                  borderRadius: 12, fontSize: 13, fontFamily: "inherit", outline: "none",
                  boxSizing: "border-box", background: isRecording ? `${C.gold}08` : C.w, color: C.navy,
                  transition: "border-color .15s",
                }}
              />
            </div>

            {/* Voice button */}
            {SR && (
              <button
                onClick={toggleVoice}
                title={t.chat_voice_tip}
                style={{
                  width: 38, height: 38, border: `1.5px solid ${isRecording ? C.gold : C.g200}`,
                  borderRadius: 10, background: isRecording ? `${C.gold}15` : C.w,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  color: isRecording ? C.gold : C.g400, flexShrink: 0, transition: "all .15s",
                }}
              >
                {isRecording ? <MicOffIcon /> : <MicIcon />}
              </button>
            )}

            {/* WhatsApp button — only for direct conversations with a phone number */}
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={t.chat_whatsapp_tip}
                data-testid="whatsapp-btn"
                style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: "#25D366", border: "none",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", flexShrink: 0, textDecoration: "none",
                  transition: "opacity .15s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
              >
                <WhatsAppIcon />
              </a>
            )}

            {/* Send button */}
            <button
              onClick={sendMessage}
              data-testid="send-btn"
              style={{
                width: 38, height: 38, background: `linear-gradient(135deg,${C.gold},${C.goldD})`,
                border: "none", borderRadius: 10, cursor: "pointer", color: C.w,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}
            >
              <SendIcon />
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

      {/* Drawing pad modal */}
      <Modal open={showDrawPad} onClose={() => setShowDrawPad(false)} title={t.chat_draw_title}>
        <DrawPad onSend={sendDrawing} onClose={() => setShowDrawPad(false)} t={t as unknown as Record<string, string>} />
      </Modal>

      {/* New conversation modal */}
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

      {/* Confirm delete */}
      <ConfirmDialog
        open={!!confirmDeleteConvo}
        title="Delete Conversation"
        message={`Are you sure you want to delete "${confirmDeleteConvo ? getConvoLabel(confirmDeleteConvo) : ""}"? All messages will be permanently removed.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteConvo}
        onCancel={() => setConfirmDeleteConvo(null)}
      />
    </div>
  );
}

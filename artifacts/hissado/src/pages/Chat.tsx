import { useState, useRef, useEffect } from "react";
import { C, Av, Btn, Modal, Inp } from "@/components/primitives";
import type { Conversation, Message, User, Notification } from "@/lib/data";
import { uid, fmtT } from "@/lib/data";

const PlusIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const SearchIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
const SendIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>;
const UsersIcon2 = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;

interface ChatProps {
  conversations: Conversation[];
  messages: Message[];
  users: User[];
  currentUser: User;
  onSendMessage: (m: Message) => void;
  onCreateConvo: (c: Conversation) => void;
  onAddNotification: (n: Notification) => void;
}

export default function Chat({ conversations, messages, users, currentUser, onSendMessage, onCreateConvo, onAddNotification }: ChatProps) {
  const [active, setActive] = useState<Conversation | null>(null);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newType, setNewType] = useState<"direct" | "group">("direct");
  const [selMems, setSelMems] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const now = new Date();

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, active]);

  const convoName = (cv: Conversation) => {
    if (cv.name) return cv.name;
    const other = cv.parts.find((id) => id !== currentUser.id);
    return users.find((u) => u.id === other)?.name || "Unknown";
  };
  const convoAv = (cv: Conversation) => {
    if (cv.type === "group") return cv.name?.[0] || "G";
    const other = cv.parts.find((id) => id !== currentUser.id);
    return users.find((u) => u.id === other)?.av || "?";
  };

  const lastMsg = (cv: Conversation) =>
    messages.filter((m) => m.cId === cv.id).sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())[0];

  const filtered = conversations.filter((cv) => convoName(cv).toLowerCase().includes(search.toLowerCase()));

  const sendMsg = () => {
    if (!text.trim() || !active) return;
    const m: Message = { id: uid(), cId: active.id, from: currentUser.id, text, ts: new Date().toISOString() };
    onSendMessage(m);
    setText("");
  };

  const createConvo = () => {
    if (newType === "direct" && selMems.length === 1) {
      const ex = conversations.find((c) => c.type === "direct" && c.parts.includes(currentUser.id) && c.parts.includes(selMems[0]));
      if (ex) { setActive(ex); setShowNew(false); setSelMems([]); return; }
    }
    const cv: Conversation = {
      id: uid(), type: newType,
      name: newType === "group" ? groupName || "New Group" : null,
      parts: [...new Set([currentUser.id, ...selMems])],
      created: new Date().toISOString(),
    };
    onCreateConvo(cv);
    setActive(cv);
    setShowNew(false);
    setSelMems([]);
    setGroupName("");
  };

  const cMsgs = active
    ? messages.filter((m) => m.cId === active.id).sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime())
    : [];

  const grouped = cMsgs.reduce((acc, m) => {
    const d = new Date(m.ts).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
    if (!acc[d]) acc[d] = [];
    acc[d].push(m);
    return acc;
  }, {} as Record<string, Message[]>);

  return (
    <div style={{ display: "flex", height: "calc(100vh - 68px)", overflow: "hidden" }}>
      {/* Conversation list */}
      <div style={{ width: 300, borderRight: `1px solid ${C.g100}`, display: "flex", flexDirection: "column", background: C.w, flexShrink: 0 }}>
        <div style={{ padding: "16px 16px 12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>Messages</h3>
            <button
              onClick={() => setShowNew(true)}
              data-testid="new-conversation-btn"
              style={{ background: `${C.gold}15`, border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.gold }}
            >
              <PlusIcon />
            </button>
          </div>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.g300, display: "flex" }}><SearchIcon /></span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search conversations..." style={{ width: "100%", padding: "8px 12px 8px 34px", border: `1px solid ${C.g200}`, borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", background: C.g50 }} />
          </div>
        </div>

        <div style={{ flex: 1, overflow: "auto" }}>
          {filtered.map((cv) => {
            const last = lastMsg(cv);
            const sender = last ? users.find((u) => u.id === last.from) : null;
            const isActive = active?.id === cv.id;
            const ts = last ? (() => {
              const d = new Date(last.ts);
              const diff = (now.getTime() - d.getTime()) / 86400000;
              return diff < 1 ? fmtT(last.ts) : diff < 7 ? d.toLocaleDateString("en", { weekday: "short" }) : d.toLocaleDateString("en", { month: "short", day: "numeric" });
            })() : "";

            return (
              <div
                key={cv.id}
                onClick={() => setActive(cv)}
                data-testid={`conversation-${cv.id}`}
                style={{ padding: "12px 16px", display: "flex", gap: 10, cursor: "pointer", transition: "background .1s", background: isActive ? `${C.gold}08` : "transparent", borderLeft: isActive ? `3px solid ${C.gold}` : "3px solid transparent" }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = C.g50; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <Av ini={convoAv(cv)} size={40} color={cv.type === "group" ? C.info : C.gold} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{convoName(cv)}</span>
                    <span style={{ fontSize: 10, color: C.g400, flexShrink: 0 }}>{ts}</span>
                  </div>
                  {last && <p style={{ fontSize: 12, color: C.g400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sender?.id === currentUser.id ? "You: " : ""}{last.text}</p>}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div style={{ padding: 40, textAlign: "center", color: C.g400, fontSize: 13 }}>No conversations</div>}
        </div>
      </div>

      {/* Chat area */}
      {active ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Header */}
          <div style={{ padding: "14px 24px", borderBottom: `1px solid ${C.g100}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: C.w }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Av ini={convoAv(active)} size={36} color={active.type === "group" ? C.info : C.gold} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{convoName(active)}</div>
                {active.type === "group" && <div style={{ fontSize: 11, color: C.g400 }}>{active.parts.map((pid) => users.find((u) => u.id === pid)?.name).filter(Boolean).join(", ")}</div>}
                {active.type === "direct" && <div style={{ fontSize: 11, color: C.ok, display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: C.ok }} />Online</div>}
              </div>
            </div>
            {active.type === "group" && <span style={{ fontSize: 12, color: C.g400, display: "flex", alignItems: "center", gap: 4 }}><UsersIcon2 /> {active.parts.length} members</span>}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflow: "auto", padding: "16px 24px", background: C.g50 }}>
            {Object.entries(grouped).map(([date, ms]) => (
              <div key={date}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0 16px" }}>
                  <div style={{ flex: 1, height: 1, background: C.g200 }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.g400, flexShrink: 0, padding: "2px 12px", background: C.w, borderRadius: 10, border: `1px solid ${C.g200}` }}>{date}</span>
                  <div style={{ flex: 1, height: 1, background: C.g200 }} />
                </div>
                {ms.map((m, mi) => {
                  const mine = m.from === currentUser.id;
                  const sender = users.find((u) => u.id === m.from);
                  const showAv = !mine && (mi === 0 || ms[mi - 1]?.from !== m.from);
                  return (
                    <div
                      key={m.id}
                      data-testid={`message-${m.id}`}
                      style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", marginBottom: 4, gap: 8, alignItems: "flex-end" }}
                    >
                      {!mine && <div style={{ width: 28, flexShrink: 0 }}>{showAv && <Av ini={sender?.av || "?"} size={28} />}</div>}
                      <div style={{ maxWidth: "65%" }}>
                        {showAv && !mine && active.type === "group" && (
                          <span style={{ fontSize: 10, fontWeight: 600, color: C.g500, marginBottom: 2, display: "block", marginLeft: 4 }}>{sender?.name}</span>
                        )}
                        <div style={{
                          padding: "10px 16px",
                          borderRadius: mine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                          background: mine ? `linear-gradient(135deg,${C.gold},${C.goldD})` : C.w,
                          color: mine ? "#fff" : C.g700,
                          fontSize: 13, lineHeight: 1.5,
                          boxShadow: mine ? "0 2px 8px rgba(200,164,92,.2)" : "0 1px 3px rgba(0,0,0,.06)",
                          border: mine ? "none" : `1px solid ${C.g100}`,
                        }}>
                          {m.text}
                        </div>
                        <span style={{ fontSize: 10, color: C.g400, marginTop: 3, display: "block", textAlign: mine ? "right" : "left", padding: "0 4px" }}>{fmtT(m.ts)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "12px 24px", borderTop: `1px solid ${C.g100}`, background: C.w }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMsg()}
                placeholder="Type a message..."
                data-testid="chat-input"
                style={{ flex: 1, padding: "10px 16px", border: `1px solid ${C.g200}`, borderRadius: 24, fontSize: 13, fontFamily: "inherit", outline: "none", background: C.g50 }}
                onFocus={(e) => (e.target.style.borderColor = C.gold)}
                onBlur={(e) => (e.target.style.borderColor = C.g200)}
              />
              <button
                onClick={sendMsg}
                disabled={!text.trim()}
                data-testid="chat-send-btn"
                style={{ width: 40, height: 40, borderRadius: "50%", border: "none", background: text.trim() ? `linear-gradient(135deg,${C.gold},${C.goldD})` : C.g200, color: text.trim() ? "#fff" : C.g400, cursor: text.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}
              >
                <SendIcon />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: C.g50 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 80, height: 80, borderRadius: 24, background: `${C.gold}10`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: C.gold }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: C.navy, fontFamily: "'Playfair Display',serif", marginBottom: 8 }}>Team Chat</h3>
            <p style={{ fontSize: 13, color: C.g400, marginBottom: 20 }}>Select a conversation or start a new one</p>
            <Btn onClick={() => setShowNew(true)} icon={<PlusIcon />}>New Conversation</Btn>
          </div>
        </div>
      )}

      {/* New Conversation modal */}
      <Modal open={showNew} onClose={() => { setShowNew(false); setSelMems([]); setGroupName(""); }} title="New Conversation" w={440}>
        <div style={{ display: "flex", gap: 4, background: C.g100, borderRadius: 8, padding: 3, marginBottom: 16 }}>
          {[{ k: "direct" as const, l: "Direct Message" }, { k: "group" as const, l: "Group Chat" }].map((t) => (
            <button key={t.k} onClick={() => { setNewType(t.k); setSelMems([]); }} style={{ flex: 1, padding: 8, border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", background: newType === t.k ? C.w : "transparent", color: newType === t.k ? C.navy : C.g400, boxShadow: newType === t.k ? "0 1px 4px rgba(0,0,0,.08)" : "none" }}>{t.l}</button>
          ))}
        </div>
        {newType === "group" && <Inp label="Group Name" value={groupName} onChange={setGroupName} ph="e.g., Design Team..." />}
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.g500, marginBottom: 8, textTransform: "uppercase", letterSpacing: ".05em" }}>
          Select {newType === "direct" ? "Person" : "Members"}
        </label>
        <div style={{ maxHeight: 250, overflow: "auto", marginBottom: 16 }}>
          {users.filter((u) => u.id !== currentUser.id && u.status === "active").map((u) => {
            const sel = selMems.includes(u.id);
            return (
              <div
                key={u.id}
                onClick={() => { if (newType === "direct") setSelMems([u.id]); else setSelMems((p) => sel ? p.filter((id) => id !== u.id) : [...p, u.id]); }}
                data-testid={`select-user-${u.id}`}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, cursor: "pointer", background: sel ? `${C.gold}10` : "transparent", border: sel ? `1px solid ${C.gold}30` : "1px solid transparent", marginBottom: 4, transition: "all .1s" }}
              >
                <Av ini={u.av} size={32} />
                <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{u.name}</div><div style={{ fontSize: 11, color: C.g400 }}>{u.dept} · {u.role}</div></div>
                {sel && <div style={{ width: 20, height: 20, borderRadius: "50%", background: C.gold, display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg></div>}
              </div>
            );
          })}
        </div>
        <Btn onClick={createConvo} disabled={selMems.length === 0} style={{ width: "100%", justifyContent: "center" }}>Start Conversation</Btn>
      </Modal>
    </div>
  );
}

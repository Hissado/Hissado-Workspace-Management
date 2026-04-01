import { useState, useRef, useEffect } from "react";
import { C, Av, Btn, Modal, Inp } from "@/components/primitives";
import { useI18n } from "@/lib/i18n";
import type { Conversation, Message, User, Notification } from "@/lib/data";
import { uid, fmtT } from "@/lib/data";
import ConfirmDialog from "@/components/ConfirmDialog";

const PlusIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const SearchIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
const SendIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>;
const UsersIcon2 = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const TrashIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></svg>;

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

export default function Chat({ conversations, messages, users, currentUser, onSendMessage, onCreateConvo, onAddNotification, onDeleteConversation }: ChatProps) {
  const { t } = useI18n();
  const [selected, setSelected] = useState<string | null>(conversations[0]?.id || null);
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newType, setNewType] = useState<"direct" | "group">("direct");
  const [newPerson, setNewPerson] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupMembers, setNewGroupMembers] = useState<string[]>([]);
  const [confirmDeleteConvo, setConfirmDeleteConvo] = useState<Conversation | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const convo = conversations.find((c) => c.id === selected);
  const msgs = selected ? messages[selected] || [] : [];
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length, selected]);

  const getConvoLabel = (cv: Conversation) => {
    if (cv.name) return cv.name;
    const others = cv.parts.filter((id) => id !== currentUser.id);
    return others.map((id) => userMap[id]?.name || "?").join(", ");
  };

  const getConvoAv = (cv: Conversation) => {
    if (cv.type === "group") return <div style={{ width: 40, height: 40, borderRadius: 12, background: `${C.gold}20`, display: "flex", alignItems: "center", justifyContent: "center" }}><UsersIcon2 /></div>;
    const other = cv.parts.find((id) => id !== currentUser.id);
    return <Av ini={userMap[other || ""]?.av || "??"} size={40} />;
  };

  const filtered = conversations.filter((cv) => getConvoLabel(cv).toLowerCase().includes(search.toLowerCase()));

  const sendMessage = () => {
    if (!input.trim() || !selected) return;
    const msg: Message = { id: uid(), cId: selected, from: currentUser.id, text: input.trim(), ts: new Date().toISOString() };
    onSendMessage(selected, msg);
    onAddNotification({ id: uid(), type: "message", text: `New message in ${getConvoLabel(convo!)}`, read: false, date: fmtT(msg.ts) });
    setInput("");
  };

  const createConvo = () => {
    if (newType === "direct") {
      if (!newPerson) return;
      const cv: Conversation = { id: uid(), type: "direct", parts: [currentUser.id, newPerson], name: null, created: new Date().toISOString() };
      onCreateConvo(cv);
      setSelected(cv.id);
    } else {
      if (!newGroupName || newGroupMembers.length === 0) return;
      const cv: Conversation = { id: uid(), type: "group", parts: [currentUser.id, ...newGroupMembers], name: newGroupName, created: new Date().toISOString() };
      onCreateConvo(cv);
      setSelected(cv.id);
    }
    setShowNew(false);
    setNewPerson("");
    setNewGroupName("");
    setNewGroupMembers([]);
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

  const otherUsers = users.filter((u) => u.id !== currentUser.id);

  return (
    <div style={{ display: "flex", height: "calc(100vh - 68px)", overflow: "hidden" }}>
      {/* Sidebar */}
      <div style={{ width: 300, borderRight: `1px solid ${C.g100}`, display: "flex", flexDirection: "column", background: C.w, flexShrink: 0 }}>
        <div style={{ padding: "16px", borderBottom: `1px solid ${C.g100}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>{t.chat_title}</h2>
            <button onClick={() => setShowNew(true)} data-testid="new-convo-btn" style={{ background: C.navy, border: "none", borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.w }}>
              <PlusIcon />
            </button>
          </div>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.g300 }}><SearchIcon /></span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.chat_search} data-testid="chat-search" style={{ width: "100%", padding: "8px 12px 8px 34px", border: `1px solid ${C.g100}`, borderRadius: 8, fontSize: 12, fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: C.g50 }} />
          </div>
        </div>

        <div style={{ flex: 1, overflow: "auto" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: C.g400, fontSize: 13 }}>{t.chat_no_convos}</div>
          ) : filtered.map((cv) => {
            const lastMsg = (messages[cv.id] || []).at(-1);
            const isActive = selected === cv.id;
            return (
              <div key={cv.id} style={{ position: "relative" }}>
                <div onClick={() => setSelected(cv.id)} data-testid={`convo-${cv.id}`}
                  style={{ padding: "12px 16px", display: "flex", gap: 10, cursor: "pointer", background: isActive ? `${C.navy}08` : "transparent", borderBottom: `1px solid ${C.g50}`, paddingRight: onDeleteConversation ? 36 : 16 }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = C.g50; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                >
                  {getConvoAv(cv)}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{getConvoLabel(cv)}</span>
                      {lastMsg && <span style={{ fontSize: 10, color: C.g400, flexShrink: 0, marginLeft: 4 }}>{fmtT(lastMsg.ts)}</span>}
                    </div>
                    {lastMsg && (
                      <div style={{ fontSize: 12, color: C.g400, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {lastMsg.from === currentUser.id ? t.chat_you : ""}{lastMsg.text}
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
                    title="Delete conversation"
                    style={{
                      position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                      width: 22, height: 22, borderRadius: 6, border: "none",
                      background: "transparent", cursor: "pointer", color: C.g300,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all .12s",
                    }}
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

      {/* Main chat area */}
      {convo ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Chat header */}
          <div style={{ padding: "12px 20px", borderBottom: `1px solid ${C.g100}`, display: "flex", alignItems: "center", gap: 10, background: C.w, flexShrink: 0 }}>
            {getConvoAv(convo)}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{getConvoLabel(convo)}</div>
              <div style={{ fontSize: 11, color: "#22C55E", fontWeight: 600 }}>{t.chat_online}</div>
            </div>
            {onDeleteConversation && (
              <button
                onClick={() => setConfirmDeleteConvo(convo)}
                data-testid="delete-convo-header-btn"
                title="Delete conversation"
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 12px", border: `1px solid ${C.g200}`,
                  borderRadius: 8, background: C.w, cursor: "pointer",
                  fontSize: 12, fontWeight: 600, color: C.g500,
                  fontFamily: "'DM Sans', sans-serif", transition: "all .15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.color = C.err; e.currentTarget.style.borderColor = "#FECACA"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = C.w; e.currentTarget.style.color = C.g500; e.currentTarget.style.borderColor = C.g200; }}
              >
                <TrashIcon /> Delete
              </button>
            )}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflow: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            {msgs.length === 0 && <div style={{ textAlign: "center", color: C.g400, fontSize: 13, marginTop: 40 }}>{t.chat_no_messages}</div>}
            {msgs.map((m) => {
              const isMe = m.from === currentUser.id;
              const sender = userMap[m.from];
              return (
                <div key={m.id} data-testid={`msg-${m.id}`} style={{ display: "flex", gap: 8, alignItems: "flex-end", flexDirection: isMe ? "row-reverse" : "row" }}>
                  {!isMe && <Av ini={sender?.av || "??"} size={28} />}
                  <div>
                    {!isMe && sender && <div style={{ fontSize: 11, color: C.g400, marginBottom: 3, marginLeft: 4 }}>{sender.name}</div>}
                    <div style={{ maxWidth: 380, padding: "10px 14px", borderRadius: isMe ? "16px 16px 4px 16px" : "4px 16px 16px 16px", background: isMe ? `linear-gradient(135deg,${C.navy},${C.navyL})` : C.g100, color: isMe ? C.w : C.navy, fontSize: 13, lineHeight: 1.5, wordBreak: "break-word" }}>
                      {m.text}
                    </div>
                    <div style={{ fontSize: 10, color: C.g400, marginTop: 3, textAlign: isMe ? "right" : "left", marginLeft: 4, marginRight: 4 }}>{fmtT(m.ts)}</div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "12px 20px", borderTop: `1px solid ${C.g100}`, display: "flex", gap: 10, background: C.w }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder={t.chat_placeholder}
              data-testid="chat-input"
              style={{ flex: 1, padding: "10px 16px", border: `1px solid ${C.g200}`, borderRadius: 12, fontSize: 13, fontFamily: "inherit", outline: "none", resize: "none" }}
            />
            <button onClick={sendMessage} data-testid="send-btn" style={{ padding: "10px 16px", background: `linear-gradient(135deg,${C.gold},${C.goldD})`, border: "none", borderRadius: 12, cursor: "pointer", color: C.w, display: "flex", alignItems: "center", gap: 6 }}>
              <SendIcon />
            </button>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 40 }}>💬</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>{t.chat_empty_title}</div>
          <div style={{ fontSize: 13, color: C.g400 }}>{t.chat_empty_desc}</div>
        </div>
      )}

      {/* New conversation modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title={t.chat_new}>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {([["direct", t.chat_direct], ["group", t.chat_group]] as const).map(([type, label]) => (
            <button key={type} onClick={() => setNewType(type)}
              style={{ flex: 1, padding: "8px", border: `2px solid ${newType === type ? C.gold : C.g200}`, borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: newType === type ? 700 : 400, background: newType === type ? `${C.gold}10` : C.w, color: newType === type ? C.gold : C.g500 }}>
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
                  <Av ini={u.av} size={24} />
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

      {/* Confirm delete conversation */}
      <ConfirmDialog
        open={!!confirmDeleteConvo}
        title="Delete Conversation"
        message={`Are you sure you want to delete "${confirmDeleteConvo ? getConvoLabel(confirmDeleteConvo) : ""}"? All messages in this conversation will be permanently removed.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteConvo}
        onCancel={() => setConfirmDeleteConvo(null)}
      />
    </div>
  );
}

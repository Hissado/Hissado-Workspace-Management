import { useState, useMemo } from "react";
import { C, Av } from "@/components/primitives";
import { useI18n } from "@/lib/i18n";
import { useIsMobile } from "@/hooks/use-mobile";
import type { User } from "@/lib/data";

/* ─── Icons ─────────────────────────────────────────────────── */
const PhoneIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.26h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l1.81-1.81a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const VideoIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const LinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);
const CopyIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

/* ─── Room code generator ────────────────────────────────────── */
function genCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

/* ─── Role badge ─────────────────────────────────────────────── */
function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, { bg: string; t: string }> = {
    admin: { bg: `${C.gold}22`, t: C.gold },
    manager: { bg: "#DBEAFE", t: "#1E40AF" },
    member: { bg: "#D1FAE5", t: "#065F46" },
    client: { bg: "#F3E5F5", t: "#6A1B9A" },
  };
  const c = colors[role] || colors.member;
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99,
      background: c.bg, color: c.t, textTransform: "capitalize", letterSpacing: ".04em",
    }}>
      {role}
    </span>
  );
}

/* ─── Props ──────────────────────────────────────────────────── */
interface MeetingsProps {
  currentUser: User;
  teamMembers: User[];
  onStartCall: (roomName: string, title: string, videoEnabled: boolean) => void;
}

/* ─── Component ──────────────────────────────────────────────── */
export default function Meetings({ currentUser, teamMembers, onStartCall }: MeetingsProps) {
  const { t } = useI18n();
  const isMobile = useIsMobile();

  const [instantCode] = useState(() => genCode());
  const [joinCode, setJoinCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState("");

  const others = useMemo(
    () => teamMembers.filter((u) => u.id !== currentUser.id && u.status === "active"),
    [teamMembers, currentUser.id]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return others;
    return others.filter((u) =>
      u.name.toLowerCase().includes(q) ||
      u.dept?.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  }, [others, search]);

  const handleCopy = () => {
    navigator.clipboard.writeText(instantCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const startInstant = (video: boolean) => {
    onStartCall(instantCode.toLowerCase(), t.meet_instant_title, video);
  };

  const handleJoin = () => {
    const code = joinCode.trim().toLowerCase();
    if (!code) return;
    onStartCall(code, `Room ${code.toUpperCase()}`, true);
  };

  const startWith = (member: User, video: boolean) => {
    const ids = [currentUser.id, member.id].sort().join("-");
    onStartCall(ids, member.name, video);
  };

  /* ─── Render ─── */
  return (
    <div style={{
      flex: 1, minHeight: 0, overflowY: "auto",
      background: C.bg, padding: isMobile ? "16px 12px" : "28px 32px",
      display: "flex", flexDirection: "column", gap: 24,
    }}>

      {/* ── Page header ── */}
      <div>
        <h1 style={{
          margin: 0, fontSize: isMobile ? 22 : 28, fontWeight: 800,
          fontFamily: "'Playfair Display',serif", color: C.navy, letterSpacing: "-.02em",
        }}>
          {t.meet_title}
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6B7280" }}>
          {t.meet_instant_desc}
        </p>
      </div>

      {/* ── Top action row ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: 16,
      }}>

        {/* Instant meeting card */}
        <div style={{
          background: C.w, borderRadius: 16, padding: "22px 24px",
          border: `1px solid ${C.g100}`,
          boxShadow: "0 2px 12px rgba(7,13,26,.05)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: `linear-gradient(135deg,${C.gold}22,${C.gold}0A)`,
              border: `1px solid ${C.gold}30`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: C.gold,
            }}>
              <VideoIcon />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{t.meet_instant_title}</div>
              <div style={{ fontSize: 12, color: "#9CA3AF" }}>{t.meet_instant_desc}</div>
            </div>
          </div>

          {/* Room code display */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: C.bg, borderRadius: 10, padding: "10px 14px",
            border: `1px solid ${C.g100}`, marginBottom: 14,
          }}>
            <LinkIcon />
            <span style={{
              flex: 1, fontSize: 16, fontWeight: 800, letterSpacing: ".18em",
              color: C.navy, fontFamily: "monospace",
            }}>
              {instantCode}
            </span>
            <button
              onClick={handleCopy}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "5px 10px", borderRadius: 7,
                border: `1px solid ${copied ? "#22C55E40" : C.g200}`,
                background: copied ? "#22C55E0F" : "transparent",
                cursor: "pointer", fontSize: 12, fontWeight: 600,
                color: copied ? "#16A34A" : "#6B7280",
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              <CopyIcon />
              {copied ? t.meet_copied : t.meet_copy}
            </button>
          </div>

          {/* Start buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => startInstant(true)}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                padding: "10px 0",
                background: `linear-gradient(135deg,${C.gold} 0%,${C.gold}CC 100%)`,
                border: "none", borderRadius: 10, cursor: "pointer",
                fontSize: 13, fontWeight: 700, color: C.navy,
                fontFamily: "'DM Sans',sans-serif",
                boxShadow: `0 3px 14px ${C.gold}33`,
              }}
            >
              <VideoIcon /> {t.meet_video}
            </button>
            <button
              onClick={() => startInstant(false)}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                padding: "10px 0",
                background: C.bg, border: `1px solid ${C.g200}`,
                borderRadius: 10, cursor: "pointer",
                fontSize: 13, fontWeight: 600, color: C.navy,
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              <PhoneIcon /> {t.meet_audio}
            </button>
          </div>
        </div>

        {/* Join with code card */}
        <div style={{
          background: C.w, borderRadius: 16, padding: "22px 24px",
          border: `1px solid ${C.g100}`,
          boxShadow: "0 2px 12px rgba(7,13,26,.05)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: "#EFF6FF", border: "1px solid #BFDBFE",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#3B82F6",
            }}>
              <LinkIcon />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{t.meet_join}</div>
              <div style={{ fontSize: 12, color: "#9CA3AF" }}>{t.meet_instant_code}</div>
            </div>
          </div>

          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            placeholder={t.meet_join_ph}
            style={{
              width: "100%", padding: "11px 14px",
              border: `1.5px solid ${joinCode ? C.gold : C.g100}`,
              borderRadius: 10, fontSize: 15, fontWeight: 700,
              letterSpacing: ".12em", fontFamily: "monospace",
              outline: "none", color: C.navy, background: C.bg,
              boxSizing: "border-box", marginBottom: 14,
              transition: "border-color .2s",
            }}
          />

          <button
            onClick={handleJoin}
            disabled={!joinCode.trim()}
            style={{
              width: "100%", padding: "10px 0",
              background: joinCode.trim() ? `linear-gradient(135deg,${C.navy} 0%,#1A2540 100%)` : C.g100,
              border: "none", borderRadius: 10, cursor: joinCode.trim() ? "pointer" : "not-allowed",
              fontSize: 13, fontWeight: 700,
              color: joinCode.trim() ? "#fff" : C.g400,
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            {t.meet_join_btn}
          </button>
        </div>
      </div>

      {/* ── Team members ── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h2 style={{
            margin: 0, fontSize: 16, fontWeight: 800, color: C.navy,
            fontFamily: "'DM Sans',sans-serif",
          }}>
            {t.meet_team_header}
          </h2>

          {/* Search */}
          <div style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "6px 12px", background: C.w, border: `1px solid ${C.g100}`,
            borderRadius: 10, boxShadow: "0 1px 4px rgba(7,13,26,.04)",
          }}>
            <SearchIcon />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`${t.search_tasks.replace("tasks", "members")}...`}
              style={{
                border: "none", outline: "none", fontSize: 13,
                background: "transparent", color: C.navy, width: 140,
                fontFamily: "'DM Sans',sans-serif",
              }}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{
            background: C.w, borderRadius: 14, padding: "40px 24px",
            textAlign: "center", border: `1px solid ${C.g100}`,
            color: "#9CA3AF", fontSize: 14,
          }}>
            {t.meet_no_members}
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "1fr"
              : "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 12,
          }}>
            {filtered.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                onAudio={() => startWith(member, false)}
                onVideo={() => startWith(member, true)}
                audioLabel={t.meet_audio}
                videoLabel={t.meet_video}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Member card ────────────────────────────────────────────── */
function MemberCard({
  member, onAudio, onVideo, audioLabel, videoLabel,
}: {
  member: User;
  onAudio: () => void;
  onVideo: () => void;
  audioLabel: string;
  videoLabel: string;
}) {
  const [hov, setHov] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: C.w, borderRadius: 14, padding: "16px 18px",
        border: `1.5px solid ${hov ? C.gold + "44" : C.g100}`,
        boxShadow: hov ? `0 4px 20px rgba(201,169,110,.12)` : "0 1px 6px rgba(7,13,26,.04)",
        display: "flex", alignItems: "center", gap: 14,
        transition: "all .18s cubic-bezier(.4,0,.2,1)",
      }}
    >
      <Av ini={member.av || member.name.slice(0, 2)} photo={member.photo} size={44} color={member.color} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 700, color: C.navy,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {member.name}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
          <RoleBadge role={member.role} />
          {member.dept && (
            <span style={{ fontSize: 11, color: "#9CA3AF" }}>{member.dept}</span>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <button
          onClick={onAudio}
          title={audioLabel}
          style={{
            width: 34, height: 34, borderRadius: 9,
            border: `1px solid ${C.g100}`,
            background: hov ? "#F0FDF4" : C.bg,
            color: hov ? "#16A34A" : "#6B7280",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "all .18s",
          }}
        >
          <PhoneIcon />
        </button>
        <button
          onClick={onVideo}
          title={videoLabel}
          style={{
            width: 34, height: 34, borderRadius: 9,
            border: `1px solid ${hov ? C.gold + "44" : C.g100}`,
            background: hov ? `${C.gold}14` : C.bg,
            color: hov ? C.gold : "#6B7280",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "all .18s",
          }}
        >
          <VideoIcon />
        </button>
      </div>
    </div>
  );
}

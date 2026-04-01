import { useState } from "react";
import { C, Av, Btn, Modal, Inp, Bdg, Empty } from "@/components/primitives";
import type { User } from "@/lib/data";
import { uid } from "@/lib/data";

const PlusIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const UsersIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const MailIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>;

const ROLE_COLORS: Record<string, string> = { admin: C.err, manager: C.gold, member: C.info, viewer: C.g400 };
const DEPT_COLORS: Record<string, string> = { Engineering: C.info, Design: C.gold, Product: C.ok, Marketing: "#8B5CF6", Sales: "#EC4899", Operations: C.g500 };

interface TeamProps {
  users: User[];
  currentUser: User;
  onAddUser: (u: User) => void;
}

export default function Team({ users, currentUser, onAddUser }: TeamProps) {
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [filterRole, setFilterRole] = useState("All");
  const [showInvite, setShowInvite] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [dept, setDept] = useState("Engineering");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const depts = ["All", ...Array.from(new Set(users.map((u) => u.dept)))];
  const roles = ["All", "admin", "manager", "member", "viewer"];

  const filtered = users.filter((u) =>
    (search === "" || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())) &&
    (filterDept === "All" || u.dept === filterDept) &&
    (filterRole === "All" || u.role === filterRole)
  );

  const isAdmin = currentUser.role === "admin" || currentUser.role === "manager";

  const invite = () => {
    if (!name.trim() || !email.trim()) return;
    const ini = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
    onAddUser({ id: uid(), name, email, role: role as User["role"], dept, av: ini, status: "active", joined: new Date().toISOString(), title: dept });
    setShowInvite(false);
    setName(""); setEmail(""); setRole("member"); setDept("Engineering");
  };

  return (
    <div className="fade-in" style={{ padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: C.navy, fontFamily: "'Playfair Display',serif" }}>Team</h2>
          <p style={{ fontSize: 13, color: C.g400, marginTop: 4 }}>{users.filter((u) => u.status === "active").length} active members</p>
        </div>
        {isAdmin && <Btn onClick={() => setShowInvite(true)} icon={<PlusIcon />} data-testid="invite-member-btn">Invite Member</Btn>}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 300 }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search team..." style={{ width: "100%", padding: "8px 12px 8px 36px", border: `1px solid ${C.g200}`, borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none" }} />
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.g400, display: "flex" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          </span>
        </div>
        <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} style={{ padding: "8px 12px", border: `1px solid ${C.g200}`, borderRadius: 8, fontSize: 12, fontFamily: "inherit", cursor: "pointer", outline: "none" }}>
          {depts.map((d) => <option key={d} value={d}>{d === "All" ? "All Departments" : d}</option>)}
        </select>
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} style={{ padding: "8px 12px", border: `1px solid ${C.g200}`, borderRadius: 8, fontSize: 12, fontFamily: "inherit", cursor: "pointer", outline: "none" }}>
          {roles.map((r) => <option key={r} value={r}>{r === "All" ? "All Roles" : r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
        </select>
      </div>

      {/* Dept overview cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
        {Array.from(new Set(users.map((u) => u.dept))).map((d) => {
          const count = users.filter((u) => u.dept === d && u.status === "active").length;
          const color = DEPT_COLORS[d] || C.g400;
          return (
            <div key={d} onClick={() => setFilterDept(d === filterDept ? "All" : d)} style={{ background: filterDept === d ? `${color}10` : C.w, border: `1px solid ${filterDept === d ? color : C.g100}`, borderRadius: 12, padding: "12px 14px", cursor: "pointer", transition: "all .15s" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color, fontFamily: "'Playfair Display',serif" }}>{count}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.g500, marginTop: 2 }}>{d}</div>
            </div>
          );
        })}
      </div>

      {/* Member grid */}
      {filtered.length === 0 ? (
        <Empty icon={<UsersIcon />} title="No team members found" desc="Adjust your filters or invite new members" action={isAdmin ? <Btn onClick={() => setShowInvite(true)} icon={<PlusIcon />} sz="sm">Invite</Btn> : undefined} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {filtered.map((u) => (
            <div
              key={u.id}
              onClick={() => setSelectedUser(u)}
              data-testid={`team-member-${u.id}`}
              className="fade-in"
              style={{ background: C.w, borderRadius: 14, border: `1px solid ${C.g100}`, padding: "20px", cursor: "pointer", transition: "all .15s", boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.gold + "40"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.g100; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,.04)"; e.currentTarget.style.transform = ""; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <Av ini={u.av} size={44} />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <Bdg v={u.role === "admin" ? "danger" : u.role === "manager" ? "gold" : u.role === "member" ? "info" : "default"}>{u.role}</Bdg>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: u.status === "active" ? C.ok : C.g300 }} />
                </div>
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 3 }}>{u.name}</h3>
              <div style={{ fontSize: 12, color: C.g400, marginBottom: 2 }}>{u.title || u.dept}</div>
              <div style={{ fontSize: 11, color: DEPT_COLORS[u.dept] || C.g400, fontWeight: 600 }}>{u.dept}</div>
              <div style={{ fontSize: 11, color: C.g400, marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}><MailIcon />{u.email}</div>
            </div>
          ))}
        </div>
      )}

      {/* Member detail modal */}
      <Modal open={!!selectedUser} onClose={() => setSelectedUser(null)} title="Member Profile" w={480}>
        {selectedUser && (
          <div>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 20, padding: "0 0 20px", borderBottom: `1px solid ${C.g100}` }}>
              <Av ini={selectedUser.av} size={64} />
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>{selectedUser.name}</h3>
                <p style={{ fontSize: 13, color: C.g500, marginTop: 3 }}>{selectedUser.title || selectedUser.role}</p>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <Bdg v={selectedUser.role === "admin" ? "danger" : selectedUser.role === "manager" ? "gold" : "info"}>{selectedUser.role}</Bdg>
                  <Bdg v="default">{selectedUser.dept}</Bdg>
                </div>
              </div>
            </div>
            {[
              { l: "Email", v: selectedUser.email },
              { l: "Department", v: selectedUser.dept },
              { l: "Status", v: selectedUser.status },
              { l: "Joined", v: selectedUser.joined?.slice(0, 10) || "—" },
            ].map(({ l, v }) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.g50}` }}>
                <span style={{ fontSize: 13, color: C.g400 }}>{l}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: C.navy }}>{v}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Invite modal */}
      <Modal open={showInvite} onClose={() => setShowInvite(false)} title="Invite Member">
        <Inp label="Full Name" value={name} onChange={setName} ph="John Smith" />
        <Inp label="Email" value={email} onChange={setEmail} ph="john@company.com" type="email" />
        <Inp label="Role" value={role} onChange={setRole} opts={[{ v: "member", l: "Member" }, { v: "manager", l: "Manager" }, { v: "viewer", l: "Viewer" }]} />
        <Inp label="Department" value={dept} onChange={setDept} opts={["Engineering", "Design", "Product", "Marketing", "Sales", "Operations"].map((d) => ({ v: d, l: d }))} />
        <Btn onClick={invite} disabled={!name.trim() || !email.trim()} style={{ width: "100%", justifyContent: "center" }}>Send Invitation</Btn>
      </Modal>
    </div>
  );
}

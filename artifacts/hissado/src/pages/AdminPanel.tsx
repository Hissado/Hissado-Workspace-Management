import { useState } from "react";
import { useStore } from "@/lib/store";
import { ALL_PERMISSIONS, type RoleDef, type BdgVariant } from "@/lib/data";
import { C, Bdg, Btn, Inp } from "@/components/primitives";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useI18n } from "@/lib/i18n";

const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);

const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const BADGE_VARIANTS: { v: BdgVariant; key: "admin_badge_red" | "admin_badge_gold" | "admin_badge_blue" | "admin_badge_green" | "admin_badge_orange" | "admin_badge_navy" | "admin_badge_grey" }[] = [
  { v: "danger",  key: "admin_badge_red" },
  { v: "gold",    key: "admin_badge_gold" },
  { v: "info",    key: "admin_badge_blue" },
  { v: "success", key: "admin_badge_green" },
  { v: "warning", key: "admin_badge_orange" },
  { v: "navy",    key: "admin_badge_navy" },
  { v: "default", key: "admin_badge_grey" },
];

const SECTION_HDR: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color: C.g400,
  marginBottom: 14,
};

const ICON_BTN = (danger?: boolean): React.CSSProperties => ({
  border: `1px solid ${danger ? "#FECACA" : C.g200}`,
  borderRadius: 7,
  padding: "5px 8px",
  background: danger ? "#FEF2F2" : C.w,
  color: danger ? C.err : C.g500,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all .15s",
});

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        width: 38, height: 22, borderRadius: 11, border: "none",
        cursor: "pointer", position: "relative",
        background: on ? C.gold : C.g200,
        transition: "background .2s", flexShrink: 0,
      }}
    >
      <div style={{
        position: "absolute", top: 3,
        left: on ? 19 : 3,
        width: 16, height: 16, borderRadius: "50%",
        background: C.w, transition: "left .2s",
        boxShadow: "0 1px 3px rgba(0,0,0,.18)",
      }} />
    </button>
  );
}

export default function AdminPanel() {
  const { t, lang } = useI18n();
  const {
    departments, addDepartment, updateDepartment, deleteDepartment,
    roleDefs, addRoleDef, updateRoleDef, deleteRoleDef,
    rolePermissions, setRolePermissions,
  } = useStore();

  // ── Departments state ──
  const [deptInput, setDeptInput] = useState("");
  const [editingDept, setEditingDept] = useState<string | null>(null);
  const [editDeptVal, setEditDeptVal] = useState("");
  const [confirmDept, setConfirmDept] = useState<string | null>(null);

  // ── Roles state ──
  const [selectedRole, setSelectedRole] = useState<string>(roleDefs[0]?.id ?? "admin");
  const [showNewRoleForm, setShowNewRoleForm] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleBadge, setNewRoleBadge] = useState<BdgVariant>("info");
  const [confirmRoleId, setConfirmRoleId] = useState<string | null>(null);
  const [editingRoleLabel, setEditingRoleLabel] = useState<string | null>(null);
  const [editRoleLabelVal, setEditRoleLabelVal] = useState("");

  const activeRole = roleDefs.find((r) => r.id === selectedRole) ?? roleDefs[0];
  const currentPerms = new Set<string>(rolePermissions[selectedRole] ?? []);

  // Group ALL_PERMISSIONS by group
  const groups = Array.from(new Set(ALL_PERMISSIONS.map((p) => p.group)));
  const groupLabel = (group: string) => {
    if (lang !== "fr") return group;
    return ALL_PERMISSIONS.find((p) => p.group === group)?.groupFr ?? group;
  };

  function togglePerm(permId: string) {
    const next = new Set(currentPerms);
    if (next.has(permId)) next.delete(permId);
    else next.add(permId);
    setRolePermissions(selectedRole, Array.from(next) as import("@/lib/data").Permission[]);
  }

  function handleAddDept() {
    const name = deptInput.trim();
    if (!name || departments.includes(name)) return;
    addDepartment(name);
    setDeptInput("");
  }

  function handleSaveDept() {
    const name = editDeptVal.trim();
    if (!name || !editingDept) return;
    updateDepartment(editingDept, name);
    setEditingDept(null);
    setEditDeptVal("");
  }

  function handleCreateRole() {
    const name = newRoleName.trim();
    if (!name) return;
    const id = name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    if (roleDefs.some((r) => r.id === id)) return;
    const newRole: RoleDef = { id, label: name, isSystem: false, badgeVariant: newRoleBadge };
    addRoleDef(newRole);
    // Default permissions: copy from member
    setRolePermissions(id, [...(rolePermissions["member"] ?? [])]);
    setNewRoleName("");
    setNewRoleBadge("info");
    setShowNewRoleForm(false);
    setSelectedRole(id);
  }

  function handleSaveRoleLabel() {
    if (!editingRoleLabel || !editRoleLabelVal.trim()) return;
    const role = roleDefs.find((r) => r.id === editingRoleLabel);
    if (!role) return;
    updateRoleDef({ ...role, label: editRoleLabelVal.trim() });
    setEditingRoleLabel(null);
    setEditRoleLabelVal("");
  }

  const confirmDeptObj = confirmDept ? { name: confirmDept } : null;
  const confirmRoleObj = confirmRoleId ? roleDefs.find((r) => r.id === confirmRoleId) : null;

  return (
    <div>
      {/* ── DEPARTMENTS ── */}
      <div style={{ marginBottom: 40 }}>
        <p style={SECTION_HDR}>{t.admin_dept_section}</p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {departments.map((dept) => (
            <div
              key={dept}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: C.bg, border: `1px solid ${C.g200}`,
                borderRadius: 10, padding: "5px 10px 5px 12px",
              }}
            >
              {editingDept === dept ? (
                <>
                  <input
                    value={editDeptVal}
                    onChange={(e) => setEditDeptVal(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSaveDept(); if (e.key === "Escape") setEditingDept(null); }}
                    autoFocus
                    style={{
                      border: `1px solid ${C.gold}`, borderRadius: 6,
                      padding: "2px 8px", fontSize: 13, fontFamily: "'DM Sans',sans-serif",
                      outline: "none", color: C.navy, background: C.w, width: 130,
                    }}
                  />
                  <button onClick={handleSaveDept} style={ICON_BTN()} title="Save">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </button>
                  <button onClick={() => setEditingDept(null)} style={ICON_BTN()} title="Cancel">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.g400} strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </>
              ) : (
                <>
                  <span style={{ fontSize: 13, color: C.navy, fontWeight: 500 }}>{dept}</span>
                  <button onClick={() => { setEditingDept(dept); setEditDeptVal(dept); }} style={ICON_BTN()} title={t.admin_dept_edit}>
                    <EditIcon />
                  </button>
                  <button onClick={() => setConfirmDept(dept)} style={ICON_BTN(true)} title={t.admin_delete}>
                    <TrashIcon />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Add department inline form */}
        <div style={{ display: "flex", gap: 8, maxWidth: 380 }}>
          <Inp
            label=""
            value={deptInput}
            onChange={setDeptInput}
            ph={t.admin_dept_add_ph}
          />
          <div style={{ paddingTop: 0, display: "flex", alignItems: "flex-end" }}>
            <Btn
              onClick={handleAddDept}
              disabled={!deptInput.trim() || departments.includes(deptInput.trim())}
              style={{ height: 40, padding: "0 16px", display: "flex", alignItems: "center", gap: 6 }}
            >
              <PlusIcon /> {t.admin_dept_add_btn}
            </Btn>
          </div>
        </div>
      </div>

      {/* ── ROLES & PERMISSIONS ── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <p style={{ ...SECTION_HDR, marginBottom: 0 }}>{t.admin_roles_section}</p>
          <button
            onClick={() => setShowNewRoleForm((v) => !v)}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              background: `${C.gold}15`, border: `1px solid ${C.gold}40`,
              borderRadius: 8, padding: "5px 12px",
              fontSize: 12, fontWeight: 600, color: C.gold,
              cursor: "pointer", transition: "all .15s", fontFamily: "'DM Sans',sans-serif",
            }}
          >
            <PlusIcon /> {t.admin_role_new_btn}
          </button>
        </div>

        {/* New role form */}
        {showNewRoleForm && (
          <div style={{
            background: `${C.navy}05`, border: `1px dashed ${C.g200}`,
            borderRadius: 12, padding: 16, marginBottom: 16,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 12 }}>{t.admin_role_new_btn}</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <Inp
                  label={t.admin_role_name_label}
                  value={newRoleName}
                  onChange={setNewRoleName}
                  ph={t.admin_role_name_ph}
                />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.g500, marginBottom: 6 }}>{t.admin_role_color_label}</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {BADGE_VARIANTS.map((opt) => (
                    <button
                      key={opt.v}
                      onClick={() => setNewRoleBadge(opt.v)}
                      style={{
                        padding: "0",
                        background: "none", border: "none", cursor: "pointer",
                        outline: newRoleBadge === opt.v ? `2px solid ${C.gold}` : "none",
                        borderRadius: 6,
                      }}
                    >
                      <Bdg v={opt.v}>{t[opt.key]}</Bdg>
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn onClick={handleCreateRole} disabled={!newRoleName.trim()} style={{ height: 40, padding: "0 16px" }}>
                  {t.admin_role_create_btn}
                </Btn>
                <Btn
                  onClick={() => { setShowNewRoleForm(false); setNewRoleName(""); }}
                  style={{ height: 40, padding: "0 14px", background: C.g100, color: C.navy, boxShadow: "none" }}
                >
                  {t.admin_cancel}
                </Btn>
              </div>
            </div>
          </div>
        )}

        {/* Role tabs */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
          {roleDefs.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "7px 14px",
                border: `1.5px solid ${selectedRole === role.id ? C.gold : C.g200}`,
                borderRadius: 10, cursor: "pointer",
                background: selectedRole === role.id ? `${C.gold}10` : C.w,
                fontFamily: "'DM Sans',sans-serif",
                transition: "all .15s",
              }}
            >
              <Bdg v={role.badgeVariant}>{role.label}</Bdg>
              {role.isSystem && (
                <span style={{ fontSize: 9, fontWeight: 700, color: C.g400, letterSpacing: ".06em", textTransform: "uppercase" }}>
                  {t.admin_system_badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Selected role header */}
        {activeRole && (
          <div style={{
            background: C.bg, borderRadius: 12, padding: "12px 16px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 20, border: `1px solid ${C.g100}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {editingRoleLabel === activeRole.id ? (
                <>
                  <input
                    value={editRoleLabelVal}
                    onChange={(e) => setEditRoleLabelVal(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSaveRoleLabel(); if (e.key === "Escape") setEditingRoleLabel(null); }}
                    autoFocus
                    style={{
                      border: `1px solid ${C.gold}`, borderRadius: 6,
                      padding: "4px 10px", fontSize: 14, fontFamily: "'DM Sans',sans-serif",
                      fontWeight: 600, color: C.navy, background: C.w, outline: "none", width: 180,
                    }}
                  />
                  <button onClick={handleSaveRoleLabel} style={ICON_BTN()}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </button>
                  <button onClick={() => setEditingRoleLabel(null)} style={ICON_BTN()}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.g400} strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </>
              ) : (
                <>
                  <span style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>{activeRole.label}</span>
                  <Bdg v={activeRole.badgeVariant}>{activeRole.label}</Bdg>
                  <button
                    onClick={() => { setEditingRoleLabel(activeRole.id); setEditRoleLabelVal(activeRole.label); }}
                    style={ICON_BTN()}
                    title={t.admin_dept_edit}
                  >
                    <EditIcon />
                  </button>
                </>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {activeRole.isSystem ? (
                <span style={{ fontSize: 11, color: C.g400, fontStyle: "italic" }}>{t.admin_no_delete_system}</span>
              ) : (
                <button
                  onClick={() => setConfirmRoleId(activeRole.id)}
                  style={{ ...ICON_BTN(true), gap: 5, padding: "5px 10px", fontSize: 12, fontWeight: 600 }}
                >
                  <TrashIcon /> {t.admin_delete}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Permission matrix */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {groups.map((group) => {
            const items = ALL_PERMISSIONS.filter((p) => p.group === group);
            return (
              <div
                key={group}
                style={{
                  border: `1px solid ${C.g100}`, borderRadius: 12, overflow: "hidden",
                }}
              >
                <div style={{
                  padding: "8px 14px",
                  background: `${C.navy}06`,
                  borderBottom: `1px solid ${C.g100}`,
                  fontSize: 11, fontWeight: 800, color: C.g500,
                  letterSpacing: ".1em", textTransform: "uppercase",
                }}>
                  {groupLabel(group)}
                </div>
                {items.map((perm, i) => (
                  <div
                    key={perm.id}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "10px 14px",
                      borderBottom: i < items.length - 1 ? `1px solid ${C.g50}` : "none",
                      background: C.w,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: C.navy }}>
                        {lang === "fr" ? perm.labelFr : perm.label}
                      </div>
                      <div style={{ fontSize: 11, color: C.g400, marginTop: 1 }}>{perm.id}</div>
                    </div>
                    <Toggle
                      on={currentPerms.has(perm.id)}
                      onChange={() => togglePerm(perm.id)}
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={!!confirmDeptObj}
        title={t.admin_dept_delete_title}
        message={confirmDeptObj ? t.admin_dept_delete_msg(confirmDeptObj.name) : ""}
        confirmLabel={t.admin_delete}
        cancelLabel={t.admin_cancel}
        onConfirm={() => {
          if (confirmDept) deleteDepartment(confirmDept);
          setConfirmDept(null);
        }}
        onCancel={() => setConfirmDept(null)}
      />
      <ConfirmDialog
        open={!!confirmRoleObj}
        title={t.admin_role_delete_title}
        message={confirmRoleObj ? t.admin_role_delete_msg(confirmRoleObj.label) : ""}
        confirmLabel={t.admin_delete}
        cancelLabel={t.admin_cancel}
        onConfirm={() => {
          if (confirmRoleId) {
            deleteRoleDef(confirmRoleId);
            setConfirmRoleId(null);
            setSelectedRole("admin");
          }
        }}
        onCancel={() => setConfirmRoleId(null)}
      />
    </div>
  );
}

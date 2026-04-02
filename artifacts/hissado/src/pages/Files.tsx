import { useState, useMemo } from "react";
import { C, Btn, Modal, Inp, FileIcon, Empty } from "@/components/primitives";
import { useI18n } from "@/lib/i18n";
import type { FileItem, Folder, User, Project, Service } from "@/lib/data";
import { uid } from "@/lib/data";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useIsMobile } from "@/hooks/use-mobile";

/* ─── Icons ──────────────────────────────────────────────── */
const PlusIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const FolderOpen = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /><polyline points="2 10 22 10" /></svg>;
const FolderClosed = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>;
const ChevRight = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>;
const ChevDown = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>;
const DownloadIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>;
const TrashIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></svg>;
const SearchIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
const UploadIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>;
const LayersIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>;
const MenuIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>;
const ServiceIcon2 = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>;

const FILE_TYPE_OPTS = ["PDF", "DOCX", "XLSX", "PPTX", "PNG", "JPG", "MP4", "ZIP", "TXT", "MD"] as const;

/* ─── Selection model ────────────────────────────────────── */
type Selection =
  | { type: "all" }
  | { type: "proj"; id: string }
  | { type: "svc"; id: string }
  | { type: "folder"; id: string; parentType: "proj" | "svc"; parentId: string };

/* ─── Props ──────────────────────────────────────────────── */
interface FilesProps {
  files: FileItem[];
  folders: Folder[];
  users: User[];
  projects: Project[];
  services: Service[];
  onAddFile: (f: FileItem) => void;
  onAddFolder: (f: Folder) => void;
  onDeleteFile?: (id: string) => void;
  onDeleteFolder?: (id: string) => void;
}

/* ─── Main component ─────────────────────────────────────── */
export default function Files({ files, folders, users, projects, services, onAddFile, onAddFolder, onDeleteFile, onDeleteFolder }: FilesProps) {
  const { t } = useI18n();
  const isMobile = useIsMobile();
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  /* tree state */
  const [expanded, setExpanded] = useState<Set<string>>(new Set(projects.slice(0, 2).map((p) => p.id)));
  const [selection, setSelection] = useState<Selection>({ type: "all" });
  const [showTree, setShowTree] = useState(false); // mobile toggle

  /* search */
  const [searchQuery, setSearchQuery] = useState("");

  /* modals */
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderParentType, setNewFolderParentType] = useState<"proj" | "svc">("proj");
  const [newFolderParentId, setNewFolderParentId] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [newFileType, setNewFileType] = useState<string>("PDF");
  const [newFileFolderId, setNewFileFolderId] = useState("");
  const [confirmDeleteFolder, setConfirmDeleteFolder] = useState<Folder | null>(null);
  const [confirmDeleteFile, setConfirmDeleteFile] = useState<FileItem | null>(null);

  /* ── Derived content ────────────────────────────────────── */
  const projMap = Object.fromEntries(projects.map((p) => [p.id, p]));
  const svcMap = Object.fromEntries(services.map((s) => [s.id, s]));
  const folderMap = Object.fromEntries(folders.map((f) => [f.id, f]));

  const projFolders = (pId: string) => folders.filter((f) => f.pId === pId);
  const svcFolders = (sId: string) => folders.filter((f) => f.sId === sId);
  const folderFiles = (fId: string) => files.filter((f) => f.fId === fId);
  const projFiles = (pId: string) => files.filter((f) => f.pId === pId);
  const svcFiles = (sId: string) => files.filter((f) => f.sId === sId || folders.filter((fl) => fl.sId === sId).map((fl) => fl.id).includes(f.fId));

  const totalFiles = files.length;

  /* displayed files/folders based on selection */
  const { displayFiles, displayFolders, breadcrumb } = useMemo(() => {
    const query = searchQuery.toLowerCase();

    if (query) {
      const found = files.filter((f) => f.name.toLowerCase().includes(query) || f.type.toLowerCase().includes(query));
      return { displayFiles: found, displayFolders: [] as Folder[], breadcrumb: [] as string[] };
    }

    switch (selection.type) {
      case "all":
        return { displayFiles: files, displayFolders: [] as Folder[], breadcrumb: [t.files_all_files] };
      case "proj": {
        const proj = projMap[selection.id];
        const pFolders = projFolders(selection.id);
        const pFiles = projFiles(selection.id);
        return { displayFiles: pFiles, displayFolders: pFolders, breadcrumb: [t.files_all_files, proj?.name || ""] };
      }
      case "svc": {
        const svc = svcMap[selection.id];
        const sFolders = svcFolders(selection.id);
        const sFiles = svcFiles(selection.id);
        return { displayFiles: sFiles, displayFolders: sFolders, breadcrumb: [t.files_all_files, svc?.name || ""] };
      }
      case "folder": {
        const folder = folderMap[selection.id];
        const fFiles = folderFiles(selection.id);
        const parentName = selection.parentType === "proj"
          ? projMap[selection.parentId]?.name
          : svcMap[selection.parentId]?.name;
        return { displayFiles: fFiles, displayFolders: [] as Folder[], breadcrumb: [t.files_all_files, parentName || "", folder?.name || ""] };
      }
    }
  }, [selection, files, folders, searchQuery, t]);

  /* ── Actions ──────────────────────────────────────────────── */
  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const openNewFolder = () => {
    if (selection.type === "proj") {
      setNewFolderParentType("proj");
      setNewFolderParentId(selection.id);
    } else if (selection.type === "svc") {
      setNewFolderParentType("svc");
      setNewFolderParentId(selection.id);
    } else if (selection.type === "folder") {
      setNewFolderParentType(selection.parentType);
      setNewFolderParentId(selection.parentId);
    } else {
      setNewFolderParentType("proj");
      setNewFolderParentId(projects[0]?.id || "");
    }
    setNewFolderName("");
    setShowNewFolder(true);
  };

  const openUpload = () => {
    if (selection.type === "folder") {
      setNewFileFolderId(selection.id);
    } else {
      setNewFileFolderId(folders[0]?.id || "");
    }
    setNewFileName("");
    setShowUpload(true);
  };

  const createFolder = () => {
    if (!newFolderName.trim() || !newFolderParentId) return;
    const f: Folder = newFolderParentType === "proj"
      ? { id: uid(), name: newFolderName.trim(), pId: newFolderParentId }
      : { id: uid(), name: newFolderName.trim(), pId: "", sId: newFolderParentId };
    onAddFolder(f);
    if (newFolderParentType === "proj") {
      setExpanded((prev) => new Set(prev).add(newFolderParentId));
      setSelection({ type: "proj", id: newFolderParentId });
    } else {
      setExpanded((prev) => new Set(prev).add(newFolderParentId));
      setSelection({ type: "svc", id: newFolderParentId });
    }
    setNewFolderName("");
    setShowNewFolder(false);
  };

  const uploadFile = () => {
    if (!newFileName.trim() || !newFileFolderId) return;
    const folder = folderMap[newFileFolderId];
    const f: FileItem = {
      id: uid(),
      name: newFileName.trim() + "." + newFileType.toLowerCase(),
      type: newFileType.toLowerCase(),
      size: `${Math.floor(Math.random() * 900 + 100)} KB`,
      pId: folder?.pId || "",
      sId: folder?.sId,
      fId: newFileFolderId,
      by: users[0]?.id || "",
      at: new Date().toISOString(),
      tags: [],
    };
    onAddFile(f);
    setNewFileName("");
    setShowUpload(false);
  };

  const handleDeleteFolder = () => {
    if (!confirmDeleteFolder) return;
    if (selection.type === "folder" && selection.id === confirmDeleteFolder.id) {
      setSelection({ type: "all" });
    }
    onDeleteFolder?.(confirmDeleteFolder.id);
    setConfirmDeleteFolder(null);
  };

  /* ── Tree panel ───────────────────────────────────────────── */
  const treePanel = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.w, borderRight: `1px solid ${C.g100}` }}>
      {/* Tree header */}
      <div style={{ padding: "16px 16px 12px", borderBottom: `1px solid ${C.g100}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 14, fontWeight: 700, color: C.navy }}>
            <LayersIcon /> {t.files_title}
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: C.g300 }}><SearchIcon /></span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.files_search}
            data-testid="files-search"
            style={{ width: "100%", padding: "7px 10px 7px 30px", border: `1px solid ${C.g200}`, borderRadius: 8, fontSize: 12, fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: C.g50, color: C.navy }}
          />
        </div>
      </div>

      {/* Tree body */}
      <div style={{ flex: 1, overflow: "auto", padding: "8px 0" }}>

        {/* All Files root */}
        <TreeRow
          icon={<LayersIcon />}
          label={t.files_all_files}
          count={totalFiles}
          active={selection.type === "all" && !searchQuery}
          depth={0}
          testId="tree-all"
          onClick={() => { setSelection({ type: "all" }); setSearchQuery(""); if (isMobile) setShowTree(false); }}
        />

        <div style={{ height: 1, background: C.g100, margin: "8px 0" }} />

        {/* Projects section */}
        <div style={{ padding: "4px 14px 4px", fontSize: 10, fontWeight: 700, color: C.g400, textTransform: "uppercase", letterSpacing: ".08em" }}>
          {t.files_projects_section}
        </div>
        {projects.map((proj) => {
          const pFolders = projFolders(proj.id);
          const pFileCount = projFiles(proj.id).length;
          const isExpanded = expanded.has(proj.id);
          const isProjSelected = selection.type === "proj" && selection.id === proj.id;
          return (
            <div key={proj.id}>
              <TreeRow
                icon={<span style={{ width: 10, height: 10, borderRadius: 3, background: proj.color, flexShrink: 0, display: "inline-block" }} />}
                label={proj.name}
                count={pFileCount}
                active={isProjSelected}
                depth={0}
                expandable={pFolders.length > 0}
                expanded={isExpanded}
                testId={`tree-proj-${proj.id}`}
                onExpand={(e) => toggleExpand(proj.id, e)}
                onClick={() => { setSelection({ type: "proj", id: proj.id }); setExpanded((p) => new Set(p).add(proj.id)); if (isMobile) setShowTree(false); }}
              />
              {isExpanded && pFolders.map((folder) => {
                const fc = folderFiles(folder.id).length;
                const isFolderSelected = selection.type === "folder" && selection.id === folder.id;
                return (
                  <TreeRow
                    key={folder.id}
                    icon={isFolderSelected ? <FolderOpen /> : <FolderClosed />}
                    label={folder.name}
                    count={fc}
                    active={isFolderSelected}
                    depth={1}
                    testId={`tree-folder-${folder.id}`}
                    onClick={() => { setSelection({ type: "folder", id: folder.id, parentType: "proj", parentId: proj.id }); if (isMobile) setShowTree(false); }}
                    onDelete={onDeleteFolder ? () => setConfirmDeleteFolder(folder) : undefined}
                  />
                );
              })}
            </div>
          );
        })}

        <div style={{ height: 1, background: C.g100, margin: "8px 0" }} />

        {/* Services section */}
        <div style={{ padding: "4px 14px 4px", fontSize: 10, fontWeight: 700, color: C.g400, textTransform: "uppercase", letterSpacing: ".08em" }}>
          {t.files_services_section}
        </div>
        {services.map((svc) => {
          const sFolders = svcFolders(svc.id);
          const sFileCount = svcFiles(svc.id).length;
          const isExpanded = expanded.has(svc.id);
          const isSvcSelected = selection.type === "svc" && selection.id === svc.id;
          return (
            <div key={svc.id}>
              <TreeRow
                icon={<span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: "50%", background: svc.color, flexShrink: 0, display: "inline-block" }} /><ServiceIcon2 /></span>}
                label={svc.name}
                count={sFileCount}
                active={isSvcSelected}
                depth={0}
                expandable={sFolders.length > 0}
                expanded={isExpanded}
                testId={`tree-svc-${svc.id}`}
                onExpand={(e) => toggleExpand(svc.id, e)}
                onClick={() => { setSelection({ type: "svc", id: svc.id }); setExpanded((p) => new Set(p).add(svc.id)); if (isMobile) setShowTree(false); }}
              />
              {isExpanded && sFolders.map((folder) => {
                const fc = folderFiles(folder.id).length;
                const isFolderSelected = selection.type === "folder" && selection.id === folder.id;
                return (
                  <TreeRow
                    key={folder.id}
                    icon={isFolderSelected ? <FolderOpen /> : <FolderClosed />}
                    label={folder.name}
                    count={fc}
                    active={isFolderSelected}
                    depth={1}
                    testId={`tree-folder-${folder.id}`}
                    onClick={() => { setSelection({ type: "folder", id: folder.id, parentType: "svc", parentId: svc.id }); if (isMobile) setShowTree(false); }}
                    onDelete={onDeleteFolder ? () => setConfirmDeleteFolder(folder) : undefined}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );

  /* ── Content panel ─────────────────────────────────────────── */
  const contextName = selection.type === "proj"
    ? projMap[selection.id]?.name
    : selection.type === "svc"
    ? svcMap[selection.id]?.name
    : selection.type === "folder"
    ? (selection.parentType === "proj" ? projMap[selection.parentId]?.name : svcMap[selection.parentId]?.name)
    : null;

  const contentPanel = (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: C.bg }}>
      {/* Content header */}
      <div style={{ padding: isMobile ? "14px 16px" : "18px 28px", background: C.w, borderBottom: `1px solid ${C.g100}`, display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        {isMobile && (
          <button onClick={() => setShowTree(true)} style={{ background: "none", border: "none", cursor: "pointer", color: C.navy, display: "flex", padding: 4, borderRadius: 6, flexShrink: 0 }}>
            <MenuIcon />
          </button>
        )}
        {/* Breadcrumb */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", minWidth: 0 }}>
          {breadcrumb.map((crumb, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {i > 0 && <span style={{ color: C.g300 }}><ChevRight /></span>}
              <span style={{ fontSize: 13, fontWeight: i === breadcrumb.length - 1 ? 700 : 400, color: i === breadcrumb.length - 1 ? C.navy : C.g400 }}>{crumb}</span>
            </span>
          ))}
          {searchQuery && <span style={{ fontSize: 12, color: C.gold, fontWeight: 600 }}>"{searchQuery}"</span>}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button
            onClick={openNewFolder}
            data-testid="new-folder-btn"
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", border: `1px solid ${C.g200}`, borderRadius: 8, background: C.w, cursor: "pointer", fontSize: 12, fontWeight: 600, color: C.g600, fontFamily: "inherit" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.g200; e.currentTarget.style.color = C.g600; }}
          >
            <PlusIcon /> {isMobile ? "" : t.files_new_folder}
          </button>
          <button
            onClick={openUpload}
            data-testid="upload-file-btn"
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", border: "none", borderRadius: 8, background: `linear-gradient(135deg,${C.gold},${C.goldD})`, cursor: "pointer", fontSize: 12, fontWeight: 600, color: C.w, fontFamily: "inherit" }}
          >
            <UploadIcon /> {isMobile ? "" : t.files_upload}
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflow: "auto", padding: isMobile ? "16px" : "24px 28px" }}>

        {/* Folder grid (shown when a project/service is selected) */}
        {displayFolders.length > 0 && (
          <section style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.g400, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>{t.files_folders}</div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill,minmax(${isMobile ? "140px" : "180px"},1fr))`, gap: 10 }}>
              {displayFolders.map((folder) => {
                const fc = folderFiles(folder.id).length;
                const parentType = folder.sId ? "svc" : "proj";
                const parentId = folder.sId || folder.pId;
                return (
                  <div key={folder.id} style={{ position: "relative" }}>
                    <button
                      onClick={() => setSelection({ type: "folder", id: folder.id, parentType, parentId })}
                      data-testid={`folder-${folder.id}`}
                      style={{ width: "100%", padding: "14px 16px", background: C.w, border: `1.5px solid ${C.g100}`, borderRadius: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, textAlign: "left", fontFamily: "inherit", paddingRight: onDeleteFolder ? 36 : 16, transition: "all .15s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,.09)"; e.currentTarget.style.borderColor = C.gold; }}
                      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = C.g100; }}
                    >
                      <div style={{ color: C.gold }}><FolderClosed /></div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{folder.name}</div>
                        <div style={{ fontSize: 11, color: C.g400 }}>{fc} {t.files_files_label}</div>
                      </div>
                    </button>
                    {onDeleteFolder && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteFolder(folder); }}
                        data-testid={`delete-folder-${folder.id}`}
                        style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", width: 22, height: 22, borderRadius: 5, border: "none", background: "transparent", cursor: "pointer", color: C.g300, display: "flex", alignItems: "center", justifyContent: "center" }}
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
          </section>
        )}

        {/* Files */}
        {!searchQuery && displayFiles.length > 0 && (
          <div style={{ fontSize: 11, fontWeight: 700, color: C.g400, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>{t.files_files}</div>
        )}
        {searchQuery && (
          <div style={{ fontSize: 11, fontWeight: 700, color: C.g400, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>
            {t.files_search_results(displayFiles.length)}
          </div>
        )}

        {displayFiles.length === 0 && displayFolders.length === 0 ? (
          <Empty icon="📄" title={t.files_no_files} desc={t.files_no_files_desc} />
        ) : displayFiles.length === 0 ? null : (
          <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill,minmax(${isMobile ? "160px" : "220px"},1fr))`, gap: 12 }}>
            {displayFiles.map((f) => {
              const uploader = userMap[f.by];
              const folder = folderMap[f.fId];
              const ext = f.type.toLowerCase();
              const proj = f.pId ? projMap[f.pId] : null;
              const svc = f.sId ? svcMap[f.sId] : null;
              return (
                <div
                  key={f.id}
                  data-testid={`file-${f.id}`}
                  style={{ background: C.w, borderRadius: 12, padding: "14px", border: `1.5px solid ${C.g100}`, display: "flex", flexDirection: "column", gap: 10, transition: "all .15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,.09)"; e.currentTarget.style.borderColor = `${C.navy}20`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = C.g100; }}
                >
                  {/* File icon row */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <FileIcon type={ext} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={f.name}>{f.name}</div>
                      <div style={{ fontSize: 11, color: C.g400 }}>{f.size}</div>
                    </div>
                  </div>

                  {/* Context chip — folder + project/service */}
                  {(folder || proj || svc) && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {folder && (
                        <span style={{ fontSize: 10, background: C.g50, border: `1px solid ${C.g100}`, borderRadius: 5, padding: "2px 7px", color: C.g500, fontWeight: 500 }}>
                          {folder.name}
                        </span>
                      )}
                      {(proj || svc) && (
                        <span style={{ fontSize: 10, background: `${(proj?.color || svc?.color || C.gold)}15`, borderRadius: 5, padding: "2px 7px", color: proj?.color || svc?.color || C.gold, fontWeight: 600 }}>
                          {proj?.name || svc?.name}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: C.g400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{uploader?.name || "—"}</span>
                    <div style={{ display: "flex", gap: 3 }}>
                      {onDeleteFile && (
                        <button
                          onClick={() => setConfirmDeleteFile(f)}
                          data-testid={`delete-file-${f.id}`}
                          style={{ background: "none", border: "none", cursor: "pointer", color: C.g300, display: "flex", padding: 4, borderRadius: 5 }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = C.err; e.currentTarget.style.background = "#FEF2F2"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = C.g300; e.currentTarget.style.background = "none"; }}
                        >
                          <TrashIcon />
                        </button>
                      )}
                      <button style={{ background: "none", border: "none", cursor: "pointer", color: C.g400, display: "flex", padding: 4 }} title="Download">
                        <DownloadIcon />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  /* ── Render ───────────────────────────────────────────────── */
  return (
    <div style={{ display: "flex", height: "calc(100vh - 68px)", overflow: "hidden" }}>

      {/* Tree panel — sidebar on desktop, drawer on mobile */}
      {isMobile ? (
        showTree ? (
          <>
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 200 }} onClick={() => setShowTree(false)} />
            <div style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: 280, zIndex: 201, overflow: "hidden" }}>
              {treePanel}
            </div>
          </>
        ) : null
      ) : (
        <div style={{ width: 268, flexShrink: 0, overflow: "hidden" }}>
          {treePanel}
        </div>
      )}

      {/* Content panel */}
      {contentPanel}

      {/* ── Modals ──────────────────────────────────────────── */}

      {/* New Folder */}
      <Modal open={showNewFolder} onClose={() => setShowNewFolder(false)} title={t.files_new_folder}>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: C.g400, textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 6 }}>
            {t.files_new_folder_in}
          </label>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <button
              onClick={() => setNewFolderParentType("proj")}
              style={{ flex: 1, padding: "8px", border: `2px solid ${newFolderParentType === "proj" ? C.gold : C.g200}`, borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600, background: newFolderParentType === "proj" ? `${C.gold}10` : C.w, color: newFolderParentType === "proj" ? C.gold : C.g500 }}
            >
              {t.files_projects_section}
            </button>
            <button
              onClick={() => setNewFolderParentType("svc")}
              style={{ flex: 1, padding: "8px", border: `2px solid ${newFolderParentType === "svc" ? C.gold : C.g200}`, borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600, background: newFolderParentType === "svc" ? `${C.gold}10` : C.w, color: newFolderParentType === "svc" ? C.gold : C.g500 }}
            >
              {t.files_services_section}
            </button>
          </div>
          <select
            value={newFolderParentId}
            onChange={(e) => setNewFolderParentId(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.g200}`, borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", marginBottom: 14 }}
          >
            <option value="">—</option>
            {(newFolderParentType === "proj" ? projects : services).map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </div>
        <Inp label={t.files_folder_name} value={newFolderName} onChange={setNewFolderName} ph={t.files_folder_ph} />
        <Btn onClick={createFolder} data-testid="create-folder-btn" style={{ width: "100%", justifyContent: "center" }}>
          {t.files_create_folder}
        </Btn>
      </Modal>

      {/* Upload File */}
      <Modal open={showUpload} onClose={() => setShowUpload(false)} title={t.files_upload}>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: C.g400, textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 6 }}>
            {t.files_upload_to}
          </label>
          <select
            value={newFileFolderId}
            onChange={(e) => setNewFileFolderId(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.g200}`, borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", marginBottom: 4 }}
          >
            {folders.map((folder) => {
              const proj = folder.pId ? projMap[folder.pId] : null;
              const svc = folder.sId ? svcMap[folder.sId] : null;
              const parent = proj?.name || svc?.name || "Unknown";
              return <option key={folder.id} value={folder.id}>{parent} / {folder.name}</option>;
            })}
          </select>
        </div>
        <Inp label={t.files_file_name} value={newFileName} onChange={setNewFileName} ph={t.files_file_ph} />
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.g600, display: "block", marginBottom: 6 }}>{t.files_file_type}</label>
          <select value={newFileType} onChange={(e) => setNewFileType(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.g200}`, borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none" }}>
            {FILE_TYPE_OPTS.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        <Btn onClick={uploadFile} data-testid="submit-upload-btn" style={{ width: "100%", justifyContent: "center" }}>
          {t.files_upload_btn}
        </Btn>
      </Modal>

      {/* Confirm delete folder */}
      <ConfirmDialog
        open={!!confirmDeleteFolder}
        title={t.files_delete_folder_title}
        message={confirmDeleteFolder ? t.files_delete_folder_msg_fn(confirmDeleteFolder.name) : ""}
        confirmLabel={t.files_delete_folder_btn}
        cancelLabel={t.cancel}
        onConfirm={handleDeleteFolder}
        onCancel={() => setConfirmDeleteFolder(null)}
      />

      {/* Confirm delete file */}
      <ConfirmDialog
        open={!!confirmDeleteFile}
        title={t.files_delete_file_title}
        message={confirmDeleteFile ? t.files_delete_file_msg_fn(confirmDeleteFile.name) : ""}
        confirmLabel={t.files_delete_file_btn}
        cancelLabel={t.cancel}
        onConfirm={() => { if (confirmDeleteFile) onDeleteFile?.(confirmDeleteFile.id); setConfirmDeleteFile(null); }}
        onCancel={() => setConfirmDeleteFile(null)}
      />
    </div>
  );
}

/* ─── Tree row helper ────────────────────────────────────── */
function TreeRow({
  icon, label, count, active, depth, expandable, expanded, onClick, onExpand, onDelete, testId,
}: {
  icon: React.ReactNode; label: string; count: number; active: boolean;
  depth: number; expandable?: boolean; expanded?: boolean;
  onClick: () => void; onExpand?: (e: React.MouseEvent) => void;
  onDelete?: () => void; testId?: string;
}) {
  return (
    <div
      onClick={onClick}
      data-testid={testId}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: `6px ${depth === 1 ? "12px" : "10px"} 6px ${depth === 1 ? "28px" : "12px"}`,
        cursor: "pointer",
        background: active ? `${C.navy}0a` : "transparent",
        borderLeft: active ? `2px solid ${C.gold}` : "2px solid transparent",
        position: "relative",
        transition: "all .1s",
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = C.g50; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      {/* Expand toggle */}
      {expandable ? (
        <span
          onClick={onExpand}
          style={{ color: C.g400, display: "flex", flexShrink: 0, padding: 2, borderRadius: 3, transition: "color .1s" }}
        >
          {expanded ? <ChevDown /> : <ChevRight />}
        </span>
      ) : (
        <span style={{ width: 16, flexShrink: 0 }} />
      )}

      {/* Icon */}
      <span style={{ color: active ? C.gold : C.g400, display: "flex", alignItems: "center", flexShrink: 0 }}>{icon}</span>

      {/* Label */}
      <span style={{ flex: 1, fontSize: 12, fontWeight: active ? 700 : 500, color: active ? C.navy : C.g600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {label}
      </span>

      {/* Count badge */}
      <span style={{ fontSize: 10, color: C.g400, background: C.g100, borderRadius: 10, padding: "1px 6px", flexShrink: 0, marginRight: onDelete ? 18 : 0 }}>
        {count}
      </span>

      {/* Delete button */}
      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{ position: "absolute", right: 6, width: 16, height: 16, borderRadius: 4, border: "none", background: "transparent", cursor: "pointer", color: "transparent", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
          onMouseEnter={(e) => { e.currentTarget.style.color = C.err; e.currentTarget.style.background = "#FEF2F2"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "transparent"; e.currentTarget.style.background = "transparent"; }}
        >
          <TrashIcon />
        </button>
      )}
    </div>
  );
}

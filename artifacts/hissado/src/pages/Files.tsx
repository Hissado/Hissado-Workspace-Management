import { useState } from "react";
import { C, Btn, Modal, Inp, FileIcon, Empty } from "@/components/primitives";
import type { FileItem, Folder, User } from "@/lib/data";
import { uid, FILE_TYPES } from "@/lib/data";

const PlusIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const FolderIconSvg = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>;
const DownloadIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>;
const FileBigIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>;
const ChevRight = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>;

interface FilesProps {
  files: FileItem[];
  folders: Folder[];
  users: User[];
  onAddFile: (f: FileItem) => void;
  onAddFolder: (f: Folder) => void;
}

export default function Files({ files, folders, users, onAddFile, onAddFolder }: FilesProps) {
  const [curFolder, setCurFolder] = useState<string | null>(null);
  const [showAddFile, setShowAddFile] = useState(false);
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [newFileType, setNewFileType] = useState("pdf");
  const [search, setSearch] = useState("");

  // folders with matching pId (null means root)
  const curFolders = folders.filter((f) => f.pId === (curFolder || ""));
  // files for current folder — match by fId
  const curFiles = files.filter((f) => {
    if (curFolder === null) return !f.fId || f.fId === "";
    return f.fId === curFolder;
  }).filter((f) => search ? f.name.toLowerCase().includes(search.toLowerCase()) : true);

  const curFolderObj = folders.find((f) => f.id === curFolder);
  const crumb = curFolder
    ? [{ id: null as string | null, name: "All Files" }, { id: curFolder, name: curFolderObj?.name || "" }]
    : [{ id: null as string | null, name: "All Files" }];

  const allCurFiles = files.filter((f) => search ? f.name.toLowerCase().includes(search.toLowerCase()) : true);
  const displayFiles = search ? allCurFiles : curFiles;

  return (
    <div className="fade-in" style={{ padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: C.navy, fontFamily: "'Playfair Display',serif" }}>Files & Documents</h2>
          <p style={{ fontSize: 13, color: C.g400, marginTop: 4 }}>{files.length} files across {folders.length} folders</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn v="secondary" onClick={() => setShowAddFolder(true)} icon={<FolderIconSvg />} data-testid="add-folder-btn">New Folder</Btn>
          <Btn onClick={() => setShowAddFile(true)} icon={<PlusIcon />} data-testid="add-file-btn">Upload File</Btn>
        </div>
      </div>

      {/* Breadcrumb */}
      {!search && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
          {crumb.map((b, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {i > 0 && <ChevRight />}
              <button
                onClick={() => setCurFolder(b.id)}
                style={{ background: "none", border: "none", cursor: i < crumb.length - 1 ? "pointer" : "default", color: i < crumb.length - 1 ? C.g400 : C.navy, fontSize: 13, fontWeight: i === crumb.length - 1 ? 600 : 400, fontFamily: "inherit" }}
              >
                {b.name}
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 20, maxWidth: 300 }}>
        <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.g300, display: "flex" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        </span>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search files..." style={{ width: "100%", padding: "8px 12px 8px 32px", border: `1px solid ${C.g200}`, borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", background: C.w }} />
      </div>

      {/* Folders (only show when not searching) */}
      {!search && curFolders.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: C.g500, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 12 }}>Folders</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            {curFolders.map((f) => {
              const count = files.filter((fi) => fi.fId === f.id).length;
              return (
                <div
                  key={f.id}
                  onClick={() => setCurFolder(f.id)}
                  data-testid={`folder-${f.id}`}
                  style={{ background: C.w, borderRadius: 12, padding: "14px 16px", border: `1px solid ${C.g100}`, cursor: "pointer", display: "flex", gap: 12, alignItems: "center", transition: "all .15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.gold + "50"; e.currentTarget.style.background = `${C.gold}04`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.g100; e.currentTarget.style.background = C.w; }}
                >
                  <div style={{ color: C.gold }}><FolderIconSvg /></div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{f.name}</div>
                    <div style={{ fontSize: 11, color: C.g400 }}>{count} files</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Root folders list when at root */}
      {!search && curFolder === null && (
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: C.g500, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 12 }}>All Folders</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            {folders.map((f) => {
              const count = files.filter((fi) => fi.fId === f.id).length;
              return (
                <div
                  key={f.id}
                  onClick={() => setCurFolder(f.id)}
                  data-testid={`folder-card-${f.id}`}
                  style={{ background: C.w, borderRadius: 12, padding: "14px 16px", border: `1px solid ${C.g100}`, cursor: "pointer", display: "flex", gap: 12, alignItems: "center", transition: "all .15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.gold + "50"; e.currentTarget.style.background = `${C.gold}04`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.g100; e.currentTarget.style.background = C.w; }}
                >
                  <div style={{ color: C.gold }}><FolderIconSvg /></div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{f.name}</div>
                    <div style={{ fontSize: 11, color: C.g400 }}>{count} files</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Files */}
      <div>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: C.g500, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 12 }}>
          {search ? `Search Results (${displayFiles.length})` : "All Files"}
        </h3>
        {displayFiles.length === 0 ? (
          <Empty icon={<FileBigIcon />} title="No files found" desc="Upload a file or search with a different term" action={<Btn onClick={() => setShowAddFile(true)} icon={<PlusIcon />} sz="sm">Upload File</Btn>} />
        ) : (
          <div style={{ background: C.w, borderRadius: 14, border: `1px solid ${C.g100}`, overflow: "hidden" }}>
            {(search ? displayFiles : files).map((f) => {
              const ft = FILE_TYPES[f.type] || { c: C.g400, l: f.type.toUpperCase() };
              const uploader = users.find((u) => u.id === f.by);
              const uploadDate = new Date(f.at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
              return (
                <div key={f.id} data-testid={`file-row-${f.id}`} style={{ display: "flex", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${C.g50}`, gap: 14 }}>
                  <div style={{ width: 36, height: 44, borderRadius: 6, background: `${ft.c}12`, border: `1px solid ${ft.c}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 9, fontWeight: 800, color: ft.c, textTransform: "uppercase" }}>{ft.l}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                    <div style={{ fontSize: 11, color: C.g400, marginTop: 3 }}>{f.size} · {uploader?.name || "Unknown"} · {uploadDate}</div>
                    {f.tags && f.tags.length > 0 && (
                      <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                        {f.tags.map((tag) => (
                          <span key={tag} style={{ fontSize: 10, padding: "1px 7px", borderRadius: 10, background: `${C.gold}15`, color: C.goldD }}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button style={{ background: "none", border: "none", cursor: "pointer", color: C.g400, display: "flex", padding: 6, borderRadius: 6 }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = C.gold)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = C.g400)}
                  ><DownloadIcon /></button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Folder Modal */}
      <Modal open={showAddFolder} onClose={() => { setShowAddFolder(false); setNewFolderName(""); }} title="New Folder">
        <Inp label="Folder Name" value={newFolderName} onChange={setNewFolderName} ph="e.g., Design Assets" />
        <Btn
          onClick={() => {
            if (!newFolderName.trim()) return;
            onAddFolder({ id: uid(), name: newFolderName, pId: curFolder || "p1" });
            setShowAddFolder(false);
            setNewFolderName("");
          }}
          style={{ width: "100%", justifyContent: "center" }}
          disabled={!newFolderName.trim()}
        >
          Create Folder
        </Btn>
      </Modal>

      {/* Add File Modal */}
      <Modal open={showAddFile} onClose={() => { setShowAddFile(false); setNewFileName(""); }} title="Upload File">
        <Inp label="File Name" value={newFileName} onChange={setNewFileName} ph="e.g., Project Brief" />
        <Inp label="File Type" value={newFileType} onChange={setNewFileType} opts={[{ v: "pdf", l: "PDF" }, { v: "doc", l: "Word Document" }, { v: "xls", l: "Excel" }, { v: "pptx", l: "PowerPoint" }, { v: "png", l: "Image (PNG)" }, { v: "fig", l: "Figma" }, { v: "zip", l: "Archive (ZIP)" }]} />
        <Btn
          onClick={() => {
            if (!newFileName.trim()) return;
            const sizes: Record<string, string> = { pdf: "1.2 MB", doc: "320 KB", xls: "180 KB", pptx: "3.4 MB", png: "2.1 MB", fig: "8.5 MB", zip: "15 MB" };
            onAddFile({
              id: uid(),
              name: `${newFileName}.${newFileType}`,
              type: newFileType,
              size: sizes[newFileType] || "512 KB",
              fId: curFolder || "fl1",
              pId: "p1",
              by: "u1",
              at: new Date().toISOString(),
              tags: [],
            });
            setShowAddFile(false);
            setNewFileName("");
          }}
          style={{ width: "100%", justifyContent: "center" }}
          disabled={!newFileName.trim()}
        >
          Upload File
        </Btn>
      </Modal>
    </div>
  );
}

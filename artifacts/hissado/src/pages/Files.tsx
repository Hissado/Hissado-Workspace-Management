import { useState } from "react";
import { C, Btn, Modal, Inp, FileIcon, Empty } from "@/components/primitives";
import { useI18n } from "@/lib/i18n";
import type { FileItem, Folder, User } from "@/lib/data";
import { uid } from "@/lib/data";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useIsMobile } from "@/hooks/use-mobile";

const PlusIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const FolderIconSvg = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>;
const DownloadIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>;
const ChevRight = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>;
const TrashIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></svg>;

interface FilesProps {
  files: FileItem[];
  folders: Folder[];
  users: User[];
  onAddFile: (f: FileItem) => void;
  onAddFolder: (f: Folder) => void;
  onDeleteFile?: (id: string) => void;
  onDeleteFolder?: (id: string) => void;
}

const FILE_TYPE_OPTS = ["PDF", "DOCX", "XLSX", "PNG", "JPG", "MP4", "ZIP", "TXT"] as const;

export default function Files({ files, folders, users, onAddFile, onAddFolder, onDeleteFile, onDeleteFolder }: FilesProps) {
  const { t } = useI18n();
  const isMobile = useIsMobile();
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [newFileType, setNewFileType] = useState<string>("PDF");
  const [confirmDeleteFolder, setConfirmDeleteFolder] = useState<Folder | null>(null);
  const [confirmDeleteFile, setConfirmDeleteFile] = useState<FileItem | null>(null);

  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  const searchResults = searchQuery
    ? files.filter((f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  const activeFolder = activeFolderId ? folders.find((f) => f.id === activeFolderId) : null;
  const displayFiles = searchResults || (activeFolderId ? files.filter((f) => f.fId === activeFolderId) : files);

  const firstProjId = folders[0]?.pId || files[0]?.pId || "";

  const createFolder = () => {
    if (!newFolderName.trim()) return;
    const f: Folder = { id: uid(), name: newFolderName.trim(), pId: firstProjId };
    onAddFolder(f);
    setNewFolderName("");
    setShowNewFolder(false);
  };

  const uploadFile = () => {
    if (!newFileName.trim()) return;
    const f: FileItem = {
      id: uid(), name: newFileName.trim() + "." + newFileType.toLowerCase(),
      type: newFileType.toLowerCase(), size: `${Math.floor(Math.random() * 900 + 100)} KB`,
      pId: activeFolderId ? (folders.find((fo) => fo.id === activeFolderId)?.pId || firstProjId) : firstProjId,
      fId: activeFolderId || folders[0]?.id || "",
      by: users[0]?.id || "", at: new Date().toISOString(), tags: [],
    };
    onAddFile(f);
    setNewFileName("");
    setShowUpload(false);
  };

  const handleDeleteFolder = () => {
    if (!confirmDeleteFolder) return;
    if (activeFolderId === confirmDeleteFolder.id) setActiveFolderId(null);
    onDeleteFolder?.(confirmDeleteFolder.id);
    setConfirmDeleteFolder(null);
  };

  return (
    <div style={{ padding: isMobile ? "16px 16px 40px" : "32px 36px 60px", background: C.bg, minHeight: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: C.navy, fontFamily: "'Playfair Display',serif", margin: "0 0 6px", letterSpacing: "-.01em" }}>{t.files_title}</h2>
          <p style={{ fontSize: 13, color: C.g400, margin: 0 }}>{t.files_subtitle_fn(files.length, folders.length)}</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn onClick={() => setShowNewFolder(true)} data-testid="new-folder-btn" style={{ background: C.g100, color: C.navy, boxShadow: "none" }}>
            <PlusIcon /> {t.files_new_folder}
          </Btn>
          <Btn onClick={() => setShowUpload(true)} data-testid="upload-file-btn">
            <PlusIcon /> {t.files_upload}
          </Btn>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 24 }}>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.files_search}
          data-testid="files-search"
          style={{ width: "100%", padding: "10px 16px 10px 40px", border: `1px solid ${C.g200}`, borderRadius: 10, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: C.w }}
        />
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: C.g300, fontSize: 14 }}>🔍</span>
      </div>

      {/* Breadcrumb */}
      {!searchQuery && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20, fontSize: 13, color: C.g400 }}>
          <button onClick={() => setActiveFolderId(null)} style={{ background: "none", border: "none", cursor: "pointer", color: activeFolderId ? C.g400 : C.navy, fontWeight: activeFolderId ? 400 : 600, fontFamily: "inherit", fontSize: 13, padding: 0 }}>
            {t.files_all_folders}
          </button>
          {activeFolder && (
            <>
              <ChevRight />
              <span style={{ fontWeight: 600, color: C.navy }}>{activeFolder.name}</span>
            </>
          )}
        </div>
      )}

      {searchQuery ? (
        <section>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: C.g400, marginBottom: 12, textTransform: "uppercase", letterSpacing: ".08em" }}>
            {t.files_search_results(searchResults?.length || 0)}
          </h3>
          {searchResults?.length === 0 ? (
            <Empty icon="📄" title={t.files_no_files} desc={t.files_no_files_desc} />
          ) : (
            <FileGrid files={searchResults || []} userMap={userMap} onDeleteFile={onDeleteFile} onConfirmDelete={setConfirmDeleteFile} />
          )}
        </section>
      ) : (
        <>
          {/* Folders */}
          {!activeFolderId && (
            <section style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: C.g400, marginBottom: 12, textTransform: "uppercase", letterSpacing: ".08em" }}>{t.files_folders}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12 }}>
                {folders.map((folder) => {
                  const folderFileCount = files.filter((f) => f.fId === folder.id).length;
                  return (
                    <div key={folder.id} style={{ position: "relative" }}>
                      <button onClick={() => setActiveFolderId(folder.id)} data-testid={`folder-${folder.id}`}
                        style={{ width: "100%", padding: "16px 20px", background: C.w, border: `1px solid ${C.g100}`, borderRadius: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left", transition: "box-shadow .15s", fontFamily: "inherit", paddingRight: onDeleteFolder ? 44 : 20 }}
                        onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,.08)"}
                        onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
                      >
                        <div style={{ color: C.gold, flexShrink: 0 }}><FolderIconSvg /></div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{folder.name}</div>
                          <div style={{ fontSize: 11, color: C.g400 }}>{folderFileCount} {t.files_files_label}</div>
                        </div>
                      </button>
                      {onDeleteFolder && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmDeleteFolder(folder); }}
                          data-testid={`delete-folder-${folder.id}`}
                          title="Delete folder"
                          style={{
                            position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                            width: 26, height: 26, borderRadius: 7, border: "none",
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
            </section>
          )}

          {/* Files */}
          <section>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: C.g400, marginBottom: 12, textTransform: "uppercase", letterSpacing: ".08em" }}>{t.files_files}</h3>
            {displayFiles.length === 0 ? (
              <Empty icon="📄" title={t.files_no_files} desc={t.files_no_files_desc} />
            ) : (
              <FileGrid files={displayFiles} userMap={userMap} onDeleteFile={onDeleteFile} onConfirmDelete={setConfirmDeleteFile} />
            )}
          </section>
        </>
      )}

      {/* New Folder Modal */}
      <Modal open={showNewFolder} onClose={() => setShowNewFolder(false)} title={t.files_new_folder}>
        <Inp label={t.files_folder_name} value={newFolderName} onChange={setNewFolderName} ph={t.files_folder_ph} />
        <Btn onClick={createFolder} data-testid="create-folder-btn" style={{ width: "100%", justifyContent: "center" }}>
          {t.files_create_folder}
        </Btn>
      </Modal>

      {/* Upload Modal */}
      <Modal open={showUpload} onClose={() => setShowUpload(false)} title={t.files_upload}>
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
        title="Delete Folder"
        message={`Are you sure you want to delete "${confirmDeleteFolder?.name}"? All files inside this folder will also be permanently removed.`}
        confirmLabel="Delete Folder"
        onConfirm={handleDeleteFolder}
        onCancel={() => setConfirmDeleteFolder(null)}
      />

      {/* Confirm delete file */}
      <ConfirmDialog
        open={!!confirmDeleteFile}
        title="Delete File"
        message={`Are you sure you want to permanently delete "${confirmDeleteFile?.name}"?`}
        confirmLabel="Delete File"
        onConfirm={() => { if (confirmDeleteFile) onDeleteFile?.(confirmDeleteFile.id); setConfirmDeleteFile(null); }}
        onCancel={() => setConfirmDeleteFile(null)}
      />
    </div>
  );
}

function FileGrid({
  files, userMap, onDeleteFile, onConfirmDelete,
}: {
  files: FileItem[];
  userMap: Record<string, User>;
  onDeleteFile?: (id: string) => void;
  onConfirmDelete: (f: FileItem) => void;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 12 }}>
      {files.map((f) => {
        const uploader = userMap[f.by];
        const ext = f.type.toLowerCase();
        return (
          <div key={f.id} data-testid={`file-${f.id}`}
            style={{ background: C.w, borderRadius: 12, padding: "16px", border: `1px solid ${C.g100}`, display: "flex", flexDirection: "column", gap: 10, transition: "box-shadow .15s" }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,.08)"}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <FileIcon type={ext} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                <div style={{ fontSize: 11, color: C.g400 }}>{f.size}</div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: C.g400 }}>{uploader?.name || "—"}</span>
              <div style={{ display: "flex", gap: 4 }}>
                {onDeleteFile && (
                  <button
                    onClick={() => onConfirmDelete(f)}
                    data-testid={`delete-file-${f.id}`}
                    title="Delete file"
                    style={{ background: "none", border: "none", cursor: "pointer", color: C.g300, display: "flex", padding: 4, borderRadius: 6, transition: "all .12s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = C.err; e.currentTarget.style.background = "#FEF2F2"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = C.g300; e.currentTarget.style.background = "none"; }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></svg>
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
  );
}

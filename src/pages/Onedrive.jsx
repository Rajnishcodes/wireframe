import { useState, useMemo } from "react";
import {
  CloudRounded,
  Search,
  Close,
  MoreVert,
  Folder,
  PictureAsPdf,
  Description,
  Image,
  InsertDriveFile,
  Add,
  UploadFile,
  CreateNewFolder,
  Download,
  DriveFileRenameOutline,
  Delete,
  ChevronRight as ChevronRightIcon,
  Home,
  GridView,
  ViewList,
} from "@mui/icons-material";

import "../styles/Dashboard.css";
import "../styles/OneDrive.css";

/* =====================================================
   Mock file system — replace with real Graph API data later
===================================================== */

const INITIAL_ITEMS = {
  root: [
    { id: "f1", type: "folder", name: "Board Documents", modified: "2 days ago", parent: "root" },
    { id: "f2", type: "folder", name: "Marketing Assets", modified: "1 week ago", parent: "root" },
    { id: "d1", type: "pdf", name: "Q3 Financial Report.pdf", size: "2.4 MB", modified: "Today", parent: "root" },
    { id: "d2", type: "pdf", name: "Investor Deck.pdf", size: "5.1 MB", modified: "Yesterday", parent: "root" },
    { id: "d3", type: "doc", name: "Meeting Notes.docx", size: "128 KB", modified: "3 days ago", parent: "root" },
    { id: "d4", type: "image", name: "Team Photo.jpg", size: "3.2 MB", modified: "1 week ago", parent: "root" },
  ],
  f1: [
    { id: "d5", type: "pdf", name: "Board Resolution — June.pdf", size: "890 KB", modified: "2 days ago", parent: "f1" },
    { id: "d6", type: "pdf", name: "Annual Report 2025.pdf", size: "4.7 MB", modified: "3 weeks ago", parent: "f1" },
  ],
  f2: [
    { id: "d7", type: "image", name: "Brand Guidelines.png", size: "1.8 MB", modified: "5 days ago", parent: "f2" },
    { id: "d8", type: "doc", name: "Campaign Brief.docx", size: "210 KB", modified: "1 week ago", parent: "f2" },
  ],
};

const FOLDER_NAMES = {
  root: "OneDrive",
  f1: "Board Documents",
  f2: "Marketing Assets",
};

const FILE_ICONS = {
  pdf: { Icon: PictureAsPdf, color: "#E11D48", tint: "od-tint-rose" },
  doc: { Icon: Description, color: "#0284C7", tint: "od-tint-sky" },
  image: { Icon: Image, color: "#059669", tint: "od-tint-emerald" },
  default: { Icon: InsertDriveFile, color: "#7C3AED", tint: "od-tint-violet" },
};

export default function OneDrivePage() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [currentFolder, setCurrentFolder] = useState("root");
  const [breadcrumb, setBreadcrumb] = useState(["root"]);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [newFolderDialog, setNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [toast, setToast] = useState(null);

  const currentItems = items[currentFolder] || [];

  const filtered = useMemo(() => {
    if (!search.trim()) return currentItems;
    const q = search.toLowerCase();
    return currentItems.filter((i) => i.name.toLowerCase().includes(q));
  }, [currentItems, search]);

  const showToast = (text) => {
    setToast(text);
    setTimeout(() => setToast(null), 2200);
  };

  /* ---------- Navigation ---------- */
  const openFolder = (folderId) => {
    setCurrentFolder(folderId);
    setBreadcrumb((prev) => [...prev, folderId]);
    setSearch("");
  };

  const goToBreadcrumb = (index) => {
    const newCrumb = breadcrumb.slice(0, index + 1);
    setBreadcrumb(newCrumb);
    setCurrentFolder(newCrumb[newCrumb.length - 1]);
    setSearch("");
  };

  /* ---------- CRUD actions ---------- */
  const handleItemClick = (item) => {
    if (item.type === "folder") {
      openFolder(item.id);
    } else {
      setPreviewFile(item);
    }
  };

  const openNewFolderDialog = () => {
    setNewFolderName("");
    setNewFolderDialog(true);
  };

  const createFolder = () => {
    if (!newFolderName.trim()) return;
    const id = `f${Date.now()}`;
    const newFolder = {
      id,
      type: "folder",
      name: newFolderName.trim(),
      modified: "Just now",
      parent: currentFolder,
    };
    setItems((prev) => ({
      ...prev,
      [currentFolder]: [newFolder, ...(prev[currentFolder] || [])],
      [id]: [],
    }));
    FOLDER_NAMES[id] = newFolderName.trim();
    setNewFolderDialog(false);
    showToast(`Folder "${newFolderName.trim()}" created`);
  };

  const handleUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFiles = files.map((file) => {
      const ext = file.name.split(".").pop().toLowerCase();
      let type = "default";
      if (ext === "pdf") type = "pdf";
      else if (["doc", "docx"].includes(ext)) type = "doc";
      else if (["png", "jpg", "jpeg", "gif"].includes(ext)) type = "image";

      return {
        id: `d${Date.now()}${Math.random()}`,
        type,
        name: file.name,
        size: `${(file.size / 1024).toFixed(0)} KB`,
        modified: "Just now",
        parent: currentFolder,
        // For real PDFs, create an object URL so preview actually works with uploaded files
        previewUrl: type === "pdf" ? URL.createObjectURL(file) : null,
      };
    });

    setItems((prev) => ({
      ...prev,
      [currentFolder]: [...newFiles, ...(prev[currentFolder] || [])],
    }));
    showToast(`${files.length} file${files.length > 1 ? "s" : ""} uploaded`);
    e.target.value = "";
  };

  const deleteItem = (item) => {
    setItems((prev) => ({
      ...prev,
      [currentFolder]: (prev[currentFolder] || []).filter((i) => i.id !== item.id),
    }));
    setMenuOpenId(null);
    showToast(`"${item.name}" deleted`);
  };

  const openRenameDialog = (item) => {
    setRenameTarget(item);
    setRenameValue(item.name);
    setMenuOpenId(null);
  };

  const confirmRename = () => {
    if (!renameValue.trim() || !renameTarget) return;
    setItems((prev) => ({
      ...prev,
      [currentFolder]: (prev[currentFolder] || []).map((i) =>
        i.id === renameTarget.id ? { ...i, name: renameValue.trim() } : i
      ),
    }));
    if (renameTarget.type === "folder") {
      FOLDER_NAMES[renameTarget.id] = renameValue.trim();
    }
    showToast("Renamed successfully");
    setRenameTarget(null);
  };

  const handleDownload = (item) => {
    setMenuOpenId(null);
    showToast(`Downloading "${item.name}"...`);
    // Real implementation: fetch from Graph API's @microsoft.graph.downloadUrl
  };

  return (
    <div className="lavender-page">
      {/* Header */}
      <div className="meet-header mb-6">
        <div className="od-header-left">
          <div className="meet-header-icon">
            <CloudRounded className="icon-violet" style={{ fontSize: 26 }} />
          </div>
          <div>
            <h1 className="greeting-title" style={{ fontSize: "1.5rem" }}>OneDrive</h1>
            <p className="muted text-sm mt-1">
              {currentItems.length} items · Connected as john.doe@executivehub.com
            </p>
          </div>
        </div>

        <div className="od-header-actions">
          <button className="btn-secondary" onClick={openNewFolderDialog}>
            <CreateNewFolder style={{ fontSize: 18 }} /> New Folder
          </button>

          <label className="btn-gradient od-upload-btn">
            <UploadFile style={{ fontSize: 18 }} /> Upload
            <input type="file" multiple hidden onChange={handleUpload} />
          </label>
        </div>
      </div>

      {/* Toolbar: breadcrumb + search + view toggle */}
      <div className="od-toolbar mb-6">
        <div className="od-breadcrumb">
          {breadcrumb.map((crumbId, index) => (
            <span key={crumbId} className="od-breadcrumb-item">
              {index > 0 && <ChevronRightIcon style={{ fontSize: 16 }} className="icon-muted" />}
              <button
                className={`od-breadcrumb-btn ${index === breadcrumb.length - 1 ? "od-breadcrumb-active" : ""}`}
                onClick={() => goToBreadcrumb(index)}
              >
                {index === 0 && <Home style={{ fontSize: 15 }} />}
                {FOLDER_NAMES[crumbId] || "Folder"}
              </button>
            </span>
          ))}
        </div>

        <div className="od-toolbar-right">
          <div className="meet-search od-search">
            <Search className="icon-muted icon-sm" />
            <input
              type="text"
              placeholder="Search this folder..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="meet-search-clear" onClick={() => setSearch("")}>
                <Close style={{ fontSize: 16 }} />
              </button>
            )}
          </div>

          <div className="od-view-toggle">
            <button
              className={`od-view-btn ${viewMode === "grid" ? "od-view-active" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Grid view"
            >
              <GridView style={{ fontSize: 18 }} />
            </button>
            <button
              className={`od-view-btn ${viewMode === "list" ? "od-view-active" : ""}`}
              onClick={() => setViewMode("list")}
              title="List view"
            >
              <ViewList style={{ fontSize: 18 }} />
            </button>
          </div>
        </div>
      </div>

      {/* File/Folder display */}
      {filtered.length === 0 ? (
        <div className="glass-card p-6 meet-empty">
          <Search className="icon-muted" style={{ fontSize: 32 }} />
          <p className="muted mt-2">
            {search ? "No items match your search." : "This folder is empty."}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="od-grid">
          {filtered.map((item) => (
            <FileCard
              key={item.id}
              item={item}
              menuOpenId={menuOpenId}
              setMenuOpenId={setMenuOpenId}
              onOpen={() => handleItemClick(item)}
              onRename={() => openRenameDialog(item)}
              onDelete={() => deleteItem(item)}
              onDownload={() => handleDownload(item)}
            />
          ))}
        </div>
      ) : (
        <div className="glass-card od-list-wrap">
          {filtered.map((item) => (
            <FileRow
              key={item.id}
              item={item}
              menuOpenId={menuOpenId}
              setMenuOpenId={setMenuOpenId}
              onOpen={() => handleItemClick(item)}
              onRename={() => openRenameDialog(item)}
              onDelete={() => deleteItem(item)}
              onDownload={() => handleDownload(item)}
            />
          ))}
        </div>
      )}

      {/* New Folder Dialog */}
      {newFolderDialog && (
        <div className="note-modal-overlay" onClick={() => setNewFolderDialog(false)}>
          <div className="note-modal" style={{ maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
            <div className="note-modal-header">
              <h2 className="section-title">New Folder</h2>
              <button className="note-icon-btn" onClick={() => setNewFolderDialog(false)}>
                <Close />
              </button>
            </div>
            <input
              className="note-input-title"
              placeholder="Folder name..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createFolder()}
              autoFocus
            />
            <div className="note-modal-footer">
              <div className="od-footer-actions">
                <button className="btn-secondary" onClick={() => setNewFolderDialog(false)}>Cancel</button>
                <button className="btn-gradient" style={{ width: "auto", padding: "10px 20px" }} onClick={createFolder}>
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rename Dialog */}
      {renameTarget && (
        <div className="note-modal-overlay" onClick={() => setRenameTarget(null)}>
          <div className="note-modal" style={{ maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
            <div className="note-modal-header">
              <h2 className="section-title">Rename</h2>
              <button className="note-icon-btn" onClick={() => setRenameTarget(null)}>
                <Close />
              </button>
            </div>
            <input
              className="note-input-title"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && confirmRename()}
              autoFocus
            />
            <div className="note-modal-footer">
              <div className="od-footer-actions">
                <button className="btn-secondary" onClick={() => setRenameTarget(null)}>Cancel</button>
                <button className="btn-gradient" style={{ width: "auto", padding: "10px 20px" }} onClick={confirmRename}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF / Document Preview Modal */}
      {previewFile && (
        <div className="od-preview-overlay" onClick={() => setPreviewFile(null)}>
          <div className="od-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="od-preview-header">
              <div className="od-preview-title">
                <PictureAsPdf style={{ fontSize: 20, color: "#E11D48" }} />
                <span>{previewFile.name}</span>
              </div>
              <div className="od-preview-actions">
                <button className="note-icon-btn" onClick={() => handleDownload(previewFile)} title="Download">
                  <Download style={{ fontSize: 20 }} />
                </button>
                <button className="note-icon-btn" onClick={() => setPreviewFile(null)} title="Close">
                  <Close style={{ fontSize: 20 }} />
                </button>
              </div>
            </div>

            <div className="od-preview-body">
              {previewFile.type === "pdf" && previewFile.previewUrl ? (
                // Real uploaded PDF — actually renders via the browser's built-in PDF viewer
                <iframe
                  src={previewFile.previewUrl}
                  title={previewFile.name}
                  className="od-preview-iframe"
                />
              ) : (
                // Mock/placeholder items — no real file content to render yet.
                // Once Microsoft Graph API is connected, this branch will instead use
                // a real preview URL returned by POST /me/drive/items/{id}/preview
                <div className="od-preview-placeholder">
                  <PictureAsPdf style={{ fontSize: 64, color: "#E9E5F5" }} />
                  <p className="muted text-sm mt-3" style={{ textAlign: "center", maxWidth: 320 }}>
                    This is placeholder data. Once connected to OneDrive, this file will render
                    here using Microsoft's live document preview.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="settings-toast">
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

/* =====================================================
   Grid card
===================================================== */

function FileCard({ item, menuOpenId, setMenuOpenId, onOpen, onRename, onDelete, onDownload }) {
  const meta = item.type === "folder"
    ? { Icon: Folder, color: "#7C3AED", tint: "od-tint-violet" }
    : FILE_ICONS[item.type] || FILE_ICONS.default;
  const { Icon, tint } = meta;
  const isMenuOpen = menuOpenId === item.id;

  return (
    <div className="glass-card od-file-card" onClick={onOpen}>
      <div className="od-file-card-top">
        <div className={`od-file-icon-box ${tint}`}>
          <Icon style={{ fontSize: 28 }} />
        </div>
        <div className="od-file-menu-wrap" onClick={(e) => e.stopPropagation()}>
          <button
            className="note-icon-btn"
            onClick={() => setMenuOpenId(isMenuOpen ? null : item.id)}
          >
            <MoreVert style={{ fontSize: 18 }} />
          </button>
          {isMenuOpen && (
            <div className="od-item-menu">
              {item.type !== "folder" && (
                <button onClick={onDownload}><Download style={{ fontSize: 16 }} /> Download</button>
              )}
              <button onClick={onRename}><DriveFileRenameOutline style={{ fontSize: 16 }} /> Rename</button>
              <button className="od-item-menu-danger" onClick={onDelete}><Delete style={{ fontSize: 16 }} /> Delete</button>
            </div>
          )}
        </div>
      </div>
      <div className="od-file-name">{item.name}</div>
      <div className="muted text-xs">
        {item.type === "folder" ? item.modified : `${item.size} · ${item.modified}`}
      </div>
    </div>
  );
}

/* =====================================================
   List row
===================================================== */

function FileRow({ item, menuOpenId, setMenuOpenId, onOpen, onRename, onDelete, onDownload }) {
  const meta = item.type === "folder"
    ? { Icon: Folder, color: "#7C3AED", tint: "od-tint-violet" }
    : FILE_ICONS[item.type] || FILE_ICONS.default;
  const { Icon, tint } = meta;
  const isMenuOpen = menuOpenId === item.id;

  return (
    <div className="od-file-row" onClick={onOpen}>
      <div className={`od-file-icon-box od-file-icon-sm ${tint}`}>
        <Icon style={{ fontSize: 20 }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="od-file-name">{item.name}</div>
      </div>
      <div className="od-file-row-meta muted text-xs">
        {item.type === "folder" ? item.modified : item.size}
      </div>
      <div className="od-file-row-meta muted text-xs">
        {item.modified}
      </div>
      <div className="od-file-menu-wrap" onClick={(e) => e.stopPropagation()}>
        <button
          className="note-icon-btn"
          onClick={() => setMenuOpenId(isMenuOpen ? null : item.id)}
        >
          <MoreVert style={{ fontSize: 18 }} />
        </button>
        {isMenuOpen && (
          <div className="od-item-menu">
            {item.type !== "folder" && (
              <button onClick={onDownload}><Download style={{ fontSize: 16 }} /> Download</button>
            )}
            <button onClick={onRename}><DriveFileRenameOutline style={{ fontSize: 16 }} /> Rename</button>
            <button className="od-item-menu-danger" onClick={onDelete}><Delete style={{ fontSize: 16 }} /> Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}
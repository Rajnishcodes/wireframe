import { useState, useMemo, useEffect } from "react";
import {
  NoteAlt,
  PushPin,
  PushPinOutlined,
  Add,
  Close,
  Delete,
  Search,
  Brush,
  NotificationsActive,
} from "@mui/icons-material";

import "../styles/Dashboard.css";
import "../styles/Notes.css";
import Whiteboard from "../components/Whiteboard";

const API_BASE_URL = "http://localhost:5000/api";

const TAG_COLORS = {
  Strategy:   "note-violet",
  Marketing:  "note-rose",
  Board:      "note-amber",
  Leadership: "note-emerald",
  Product:    "note-sky",
  Personal:   "note-violet",
};

const TAG_OPTIONS = Object.keys(TAG_COLORS);

// Converts an ISO/Date value into the "yyyy-MM-ddTHH:mm" format
// required by <input type="datetime-local">
const toDatetimeLocalValue = (isoString) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// Formats a note's last-updated timestamp into "Updated 2h ago" style text
const formatUpdatedMeta = (updatedAt) => {
  if (!updatedAt) return "";
  const diffMs = Date.now() - new Date(updatedAt).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Updated just now";
  if (diffMins < 60) return `Updated ${diffMins}m ago`;
  if (diffHours < 24) return `Updated ${diffHours}h ago`;
  if (diffDays === 1) return "Updated yesterday";
  if (diffDays < 7) return `Updated ${diffDays}d ago`;
  return `Updated ${new Date(updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
};

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeNote, setActiveNote] = useState(null); // note being viewed/edited, or "new"
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [draftTag, setDraftTag] = useState(TAG_OPTIONS[0]);
  const [draftReminderAt, setDraftReminderAt] = useState("");
  const [draftWhiteboardData, setDraftWhiteboardData] = useState(null);
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchNotes = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/notes`, { credentials: "include" });
      const data = await res.json();
      setNotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load notes:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return notes
      .filter((n) => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q))
      .sort((a, b) => Number(b.pinned) - Number(a.pinned));
  }, [notes, search]);

  const pinnedCount = notes.filter((n) => n.pinned).length;
  const reminderCount = notes.filter((n) => n.reminderAt).length;

  const openNew = () => {
    setDraftTitle("");
    setDraftBody("");
    setDraftTag(TAG_OPTIONS[0]);
    setDraftReminderAt("");
    setDraftWhiteboardData(null);
    setActiveNote("new");
  };

  const openEdit = (note) => {
    setDraftTitle(note.title);
    setDraftBody(note.body);
    setDraftTag(note.tag);
    setDraftReminderAt(toDatetimeLocalValue(note.reminderAt));
    setDraftWhiteboardData(note.whiteboardData || null);
    setActiveNote(note);
  };

  const closeModal = () => setActiveNote(null);

  const togglePin = async (id, e) => {
    e.stopPropagation();

    const target = notes.find((n) => n._id === id);
    if (!target) return;

    const prevNotes = notes;
    // Optimistic update — flip pin instantly, confirm with backend after
    setNotes((prev) => prev.map((n) => (n._id === id ? { ...n, pinned: !n.pinned } : n)));

    try {
      const res = await fetch(`${API_BASE_URL}/notes/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: !target.pinned }),
      });
      if (!res.ok) throw new Error("Failed to update pin");
    } catch (err) {
      console.error(err.message);
      setNotes(prevNotes);
    }
  };

  const deleteNote = async (id, e) => {
    e?.stopPropagation();

    const prevNotes = notes;
    setNotes((prev) => prev.filter((n) => n._id !== id));
    if (activeNote && activeNote !== "new" && activeNote._id === id) closeModal();

    try {
      const res = await fetch(`${API_BASE_URL}/notes/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete note");
    } catch (err) {
      console.error(err.message);
      setNotes(prevNotes);
    }
  };

  const saveDraft = async () => {
    if (!draftTitle.trim()) return;

    setSaving(true);

    const payload = {
      title: draftTitle.trim(),
      body: draftBody.trim(),
      tag: draftTag,
      reminderAt: draftReminderAt ? new Date(draftReminderAt).toISOString() : null,
      whiteboardData: draftWhiteboardData,
    };

    try {
      const url = activeNote === "new" ? `${API_BASE_URL}/notes` : `${API_BASE_URL}/notes/${activeNote._id}`;
      const method = activeNote === "new" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to save note");
      }

      const saved = await res.json();

      setNotes((prev) =>
        activeNote === "new" ? [saved, ...prev] : prev.map((n) => (n._id === saved._id ? saved : n))
      );

      closeModal();
    } catch (err) {
      console.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleWhiteboardSave = (dataUrl) => {
    setDraftWhiteboardData(dataUrl);
    setWhiteboardOpen(false);
  };

  const clearReminder = () => setDraftReminderAt("");

  return (
    <div className="lavender-page">
      {/* Header */}
      <div className="meet-header mb-6">
        <div className="notes-header-left">
          <div className="meet-header-icon">
            <NoteAlt className="icon-violet" style={{ fontSize: 26 }} />
          </div>
          <div>
            <h1 className="greeting-title" style={{ fontSize: "1.5rem" }}>Notes</h1>
            <p className="muted text-sm mt-1">
              {notes.length} notes · {pinnedCount} pinned · {reminderCount} with reminders
            </p>
          </div>
        </div>
        <button className="btn-gradient meet-header-btn" onClick={openNew}>
          <Add className="icon-sm" /> New Note
        </button>
      </div>

      {/* Search */}
      <div className="meet-search mb-6" style={{ maxWidth: 360 }}>
        <Search className="icon-muted icon-sm" />
        <input
          type="text"
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button className="meet-search-clear" onClick={() => setSearch("")}>
            <Close style={{ fontSize: 16 }} />
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="glass-card p-6 meet-empty">
          <p className="muted">Loading notes...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-6 meet-empty">
          <Search className="icon-muted" style={{ fontSize: 32 }} />
          <p className="muted mt-2">
            {notes.length === 0 ? "No notes yet — create your first one above." : "No notes match your search."}
          </p>
        </div>
      ) : (
        <div className="notes-grid">
          {filtered.map((n) => (
            <div
              key={n._id}
              className={`glass-card note-card ${TAG_COLORS[n.tag] || "note-violet"}`}
              onClick={() => openEdit(n)}
            >
              <div className="note-card-top">
                <div className="note-card-title">{n.title}</div>
                <div className="note-card-actions">
                  <button
                    className="note-icon-btn"
                    onClick={(e) => togglePin(n._id, e)}
                    title={n.pinned ? "Unpin" : "Pin"}
                  >
                    {n.pinned ? (
                      <PushPin className="icon-violet" style={{ fontSize: 18 }} />
                    ) : (
                      <PushPinOutlined className="icon-muted" style={{ fontSize: 18 }} />
                    )}
                  </button>
                  <button
                    className="note-icon-btn note-icon-btn-danger"
                    onClick={(e) => deleteNote(n._id, e)}
                    title="Delete"
                  >
                    <Delete className="icon-muted" style={{ fontSize: 18 }} />
                  </button>
                </div>
              </div>

              {n.whiteboardData && (
                <img src={n.whiteboardData} alt="Whiteboard sketch" className="note-whiteboard-thumb" />
              )}

              <p className="note-card-body">{n.body}</p>

              <div className="note-card-bottom">
                <span className="note-tag-badge">{n.tag}</span>
                {n.reminderAt ? (
                  <span className="note-reminder-badge">
                    <NotificationsActive style={{ fontSize: 13 }} />
                    {new Date(n.reminderAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </span>
                ) : (
                  <span className="note-meta">{formatUpdatedMeta(n.updatedAt)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New / Edit Modal */}
      {activeNote && (
        <div className="note-modal-overlay" onClick={closeModal}>
          <div className="note-modal" onClick={(e) => e.stopPropagation()}>

            <div className="note-modal-header">
              <h2 className="section-title">{activeNote === "new" ? "New Note" : "Edit Note"}</h2>
              <button className="note-icon-btn" onClick={closeModal}>
                <Close />
              </button>
            </div>

            <div className="note-modal-scroll-body">

              <input
                className="note-input-title"
                placeholder="Note title..."
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                autoFocus
              />

              <textarea
                className="note-input-body"
                placeholder="Write your note..."
                rows={5}
                value={draftBody}
                onChange={(e) => setDraftBody(e.target.value)}
              />

              <div className="note-tag-picker">
                {TAG_OPTIONS.map((tag) => (
                  <button
                    key={tag}
                    className={`note-tag-option ${draftTag === tag ? "note-tag-option-active" : ""}`}
                    onClick={() => setDraftTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <p className="kanban-modal-label">Reminder</p>
              <div className="note-reminder-row">
                <input
                  type="datetime-local"
                  className="note-reminder-input"
                  value={draftReminderAt}
                  onChange={(e) => setDraftReminderAt(e.target.value)}
                />
                {draftReminderAt && (
                  <button className="note-icon-btn" onClick={clearReminder} title="Remove reminder">
                    <Close style={{ fontSize: 16 }} />
                  </button>
                )}
              </div>
              {draftReminderAt && (
                <div className="note-reminder-hint">
                  <NotificationsActive style={{ fontSize: 14 }} />
                  This will also appear on your Reminders page.
                </div>
              )}

              <p className="kanban-modal-label" style={{ marginTop: 16 }}>Whiteboard Sketch</p>
              {draftWhiteboardData ? (
                <div className="note-whiteboard-preview-wrap">
                  <img src={draftWhiteboardData} alt="Whiteboard sketch" className="note-whiteboard-preview" />
                  <div className="note-whiteboard-preview-actions">
                    <button className="btn-secondary" onClick={() => setWhiteboardOpen(true)}>
                      <Brush style={{ fontSize: 16 }} /> Edit Sketch
                    </button>
                    <button className="btn-text-danger" onClick={() => setDraftWhiteboardData(null)}>
                      <Delete style={{ fontSize: 16 }} /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button className="note-whiteboard-add-btn" onClick={() => setWhiteboardOpen(true)}>
                  <Brush style={{ fontSize: 18 }} /> Add Whiteboard Sketch
                </button>
              )}

              <div style={{ height: 20 }} />

            </div>

            <div className="note-modal-footer">
              {activeNote !== "new" && (
                <button className="btn-text-danger" onClick={(e) => deleteNote(activeNote._id, e)}>
                  <Delete style={{ fontSize: 16 }} /> Delete
                </button>
              )}
              <div className="notes-footer-actions">
                <button className="btn-secondary" onClick={closeModal} disabled={saving}>Cancel</button>
                <button
                  className="btn-gradient"
                  style={{ width: "auto", padding: "10px 20px" }}
                  onClick={saveDraft}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Whiteboard modal */}
      {whiteboardOpen && (
        <Whiteboard
          initialData={draftWhiteboardData}
          onSave={handleWhiteboardSave}
          onClose={() => setWhiteboardOpen(false)}
        />
      )}
    </div>
  );
}
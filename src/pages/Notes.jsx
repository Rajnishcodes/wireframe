import { useState, useMemo } from "react";
import {
  NoteAlt,
  PushPin,
  PushPinOutlined,
  Add,
  Close,
  Delete,
  Search,
} from "@mui/icons-material";

import "../styles/Dashboard.css";
import "../styles/Notes.css";

const TAG_COLORS = {
  Strategy:   "note-violet",
  Marketing:  "note-rose",
  Board:      "note-amber",
  Leadership: "note-emerald",
  Product:    "note-sky",
  Personal:   "note-violet",
};

const TAG_OPTIONS = Object.keys(TAG_COLORS);

const INITIAL_NOTES = [
  { id: 1, title: "Q3 Strategy Discussion", body: "Key bets: AI assistant, mobile launch, EMEA expansion. Risks around hiring velocity.", meta: "Updated 2h ago",  tag: "Strategy",   pinned: true  },
  { id: 2, title: "Marketing Ideas",         body: "Brand refresh, podcast sponsorships, founder-led LinkedIn series.",                    meta: "Updated yesterday", tag: "Marketing",  pinned: false },
  { id: 3, title: "Board Prep — June",       body: "Agenda: financials, hiring, product roadmap, fundraising. Send deck Fri.",              meta: "Updated 3d ago",  tag: "Board",      pinned: true  },
  { id: 4, title: "1:1 — CFO",               body: "Discuss cash runway, FP&A hire, audit prep.",                                          meta: "Updated 5d ago",  tag: "Leadership", pinned: false },
  { id: 5, title: "Customer Insights",       body: "Top 3 themes: speed, integrations, onboarding clarity.",                                meta: "Updated 1w ago",  tag: "Product",    pinned: false },
  { id: 6, title: "Reading List",            body: "High Output Management, Amp It Up, The Score Takes Care of Itself.",                    meta: "Updated 2w ago",  tag: "Personal",   pinned: false },
];

export default function NotesPage() {
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [search, setSearch] = useState("");
  const [activeNote, setActiveNote] = useState(null); // note being viewed/edited, or "new"
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [draftTag, setDraftTag] = useState(TAG_OPTIONS[0]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return notes
      .filter((n) => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q))
      .sort((a, b) => Number(b.pinned) - Number(a.pinned)); // pinned float to top
  }, [notes, search]);

  const pinnedCount = notes.filter((n) => n.pinned).length;

  const openNew = () => {
    setDraftTitle("");
    setDraftBody("");
    setDraftTag(TAG_OPTIONS[0]);
    setActiveNote("new");
  };

  const openEdit = (note) => {
    setDraftTitle(note.title);
    setDraftBody(note.body);
    setDraftTag(note.tag);
    setActiveNote(note);
  };

  const closeModal = () => setActiveNote(null);

  const togglePin = (id, e) => {
    e.stopPropagation();
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)));
  };

  const deleteNote = (id, e) => {
    e?.stopPropagation();
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (activeNote && activeNote !== "new" && activeNote.id === id) closeModal();
  };

  const saveDraft = () => {
    if (!draftTitle.trim()) return;

    if (activeNote === "new") {
      const newNote = {
        id: Date.now(),
        title: draftTitle.trim(),
        body: draftBody.trim(),
        meta: "Updated just now",
        tag: draftTag,
        pinned: false,
      };
      setNotes((prev) => [newNote, ...prev]);
    } else {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === activeNote.id
            ? { ...n, title: draftTitle.trim(), body: draftBody.trim(), tag: draftTag, meta: "Updated just now" }
            : n
        )
      );
    }
    closeModal();
  };

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
              {notes.length} notes · {pinnedCount} pinned
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
      {filtered.length === 0 ? (
        <div className="glass-card p-6 meet-empty">
          <Search className="icon-muted" style={{ fontSize: 32 }} />
          <p className="muted mt-2">No notes match your search.</p>
        </div>
      ) : (
        <div className="notes-grid">
          {filtered.map((n) => (
            <div
              key={n.id}
              className={`glass-card note-card ${TAG_COLORS[n.tag] || "note-violet"}`}
              onClick={() => openEdit(n)}
            >
              <div className="note-card-top">
                <div className="note-card-title">{n.title}</div>
                <div className="note-card-actions">
                  <button
                    className="note-icon-btn"
                    onClick={(e) => togglePin(n.id, e)}
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
                    onClick={(e) => deleteNote(n.id, e)}
                    title="Delete"
                  >
                    <Delete className="icon-muted" style={{ fontSize: 18 }} />
                  </button>
                </div>
              </div>

              <p className="note-card-body">{n.body}</p>

              <div className="note-card-bottom">
                <span className="note-tag-badge">{n.tag}</span>
                <span className="note-meta">{n.meta}</span>
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

            <div className="note-modal-footer">
              {activeNote !== "new" && (
                <button className="btn-text-danger" onClick={(e) => deleteNote(activeNote.id, e)}>
                  <Delete style={{ fontSize: 16 }} /> Delete
                </button>
              )}
              <div className="notes-footer-actions">
                <button className="btn-secondary" onClick={closeModal}>Cancel</button>
                <button className="btn-gradient" style={{ width: "auto", padding: "10px 20px" }} onClick={saveDraft}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
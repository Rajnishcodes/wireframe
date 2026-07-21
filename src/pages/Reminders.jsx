import { useState, useEffect, useMemo, useRef } from "react";
import {
  NotificationsActive,
  Call,
  Groups,
  TaskAlt,
  Event,
  NoteAlt,
  Schedule,
  Check,
  MoreVert,
  Add,
  Close,
  Snooze,
  Edit,
  Delete,
  Undo,
  Tune,
} from "@mui/icons-material";

import "../styles/Dashboard.css";
import "../styles/Reminders.css";

const API_BASE_URL = "http://localhost:5000/api";

// Visuals per category — icon, color, label. This drives the badge
// shown on every reminder card, and the toggle panel labels.
const CATEGORY_META = {
  notes:    { label: "Notes",    color: "#7C3AED", Icon: NoteAlt },
  meetings: { label: "Meetings", color: "#0284C7", Icon: Event },
  tasks:    { label: "Tasks",    color: "#059669", Icon: TaskAlt },
  general:  { label: "General",  color: "#D97706", Icon: Call },
};

const PRIORITY_TONE = {
  High: "tone-rose",
  Medium: "tone-amber",
  Low: "tone-emerald",
};

const emptyForm = { title: "", time: "", priority: "Medium" };

// Converts an ISO/Date value into the "yyyy-MM-ddTHH:mm" format
// required by <input type="datetime-local">
const toDatetimeLocalValue = (isoString) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const formatReminderTime = (time) => {
  const d = new Date(time);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOnly = new Date(d);
  dayOnly.setHours(0, 0, 0, 0);

  const diffDays = Math.round((dayOnly - today) / (1000 * 60 * 60 * 24));
  const timeLabel = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  let dayLabel;
  if (diffDays === 0) dayLabel = "Today";
  else if (diffDays === 1) dayLabel = "Tomorrow";
  else if (diffDays === -1) dayLabel = "Yesterday";
  else dayLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return `${dayLabel} · ${timeLabel}`;
};

export default function RemindersPage() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState({ notes: true, meetings: true, tasks: true, general: true });
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editing, setEditing] = useState(null); // reminder being edited, or "new"
  const [draftTitle, setDraftTitle] = useState("");
  const [draftTime, setDraftTime] = useState("");
  const [draftPriority, setDraftPriority] = useState("Medium");
  const [toast, setToast] = useState(null);
  const menuRef = useRef(null);

  const fetchReminders = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/reminders`, { credentials: "include" });
      const data = await res.json();
      setReminders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load reminders:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/me/preferences`, { credentials: "include" });
      const data = await res.json();
      if (data && typeof data === "object") setPreferences(data);
    } catch (err) {
      console.error("Failed to load preferences:", err.message);
    }
  };

  useEffect(() => {
    fetchReminders();
    fetchPreferences();
  }, []);

  // Close the kebab menu on outside click
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (text, extra = {}) => setToast({ text, ...extra });

  // Only reminders whose category the user currently has enabled, and
  // that aren't marked completed, show up in the active list
  const visibleReminders = useMemo(() => {
    return reminders
      .filter((r) => !r.completed)
      .filter((r) => preferences[r.category] !== false)
      .sort((a, b) => new Date(a.time) - new Date(b.time));
  }, [reminders, preferences]);

  const dueTodayCount = visibleReminders.filter((r) => {
    const d = new Date(r.time);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;
  const upcomingCount = visibleReminders.length - dueTodayCount;

  const togglePreference = async (category) => {
    const newValue = !preferences[category];
    const prevPrefs = preferences;

    // Optimistic update
    setPreferences((prev) => ({ ...prev, [category]: newValue }));

    try {
      const res = await fetch(`${API_BASE_URL}/users/me/preferences`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [category]: newValue }),
      });
      if (!res.ok) throw new Error("Failed to update preference");
    } catch (err) {
      console.error(err.message);
      setPreferences(prevPrefs);
    }
  };

  const complete = async (id) => {
    const r = reminders.find((x) => x._id === id);
    if (!r) return;

    setOpenMenuId(null);

    try {
      const res = await fetch(`${API_BASE_URL}/reminders/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      });
      if (!res.ok) throw new Error("Failed to complete reminder");

      const updated = await res.json();
      setReminders((prev) => prev.map((x) => (x._id === id ? updated : x)));
      showToast(`"${r.title}" marked done`, { undoId: id });
    } catch (err) {
      console.error(err.message);
    }
  };

  const undoComplete = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/reminders/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: false }),
      });
      if (!res.ok) throw new Error("Failed to undo");

      const updated = await res.json();
      setReminders((prev) => prev.map((x) => (x._id === id ? updated : x)));
      setToast(null);
    } catch (err) {
      console.error(err.message);
    }
  };

  const snooze = async (id) => {
    const r = reminders.find((x) => x._id === id);
    if (!r) return;

    setOpenMenuId(null);

    const nextDay = new Date(r.time);
    nextDay.setDate(nextDay.getDate() + 1);

    try {
      const res = await fetch(`${API_BASE_URL}/reminders/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ time: nextDay.toISOString() }),
      });
      if (!res.ok) throw new Error("Failed to snooze");

      const updated = await res.json();
      setReminders((prev) => prev.map((x) => (x._id === id ? updated : x)));
      showToast("Reminder snoozed to tomorrow");
    } catch (err) {
      console.error(err.message);
    }
  };

  const removeReminder = async (id) => {
    setOpenMenuId(null);
    const prevReminders = reminders;
    setReminders((prev) => prev.filter((x) => x._id !== id));

    try {
      const res = await fetch(`${API_BASE_URL}/reminders/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete reminder");
    } catch (err) {
      console.error(err.message);
      setReminders(prevReminders);
    }
  };

  const openNew = () => {
    setDraftTitle("");
    setDraftTime("");
    setDraftPriority("Medium");
    setEditing("new");
  };

  const openEdit = (r) => {
    setDraftTitle(r.title);
    setDraftTime(toDatetimeLocalValue(r.time));
    setDraftPriority(r.priority);
    setEditing(r);
    setOpenMenuId(null);
  };

  const closeModal = () => setEditing(null);

  const saveDraft = async () => {
    if (!draftTitle.trim() || !draftTime) return;

    const payload = {
      title: draftTitle.trim(),
      time: new Date(draftTime).toISOString(),
      priority: draftPriority,
    };

    try {
      if (editing === "new") {
        const res = await fetch(`${API_BASE_URL}/reminders`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, icon: "task_alt" }),
        });
        if (!res.ok) throw new Error("Failed to create reminder");
        const created = await res.json();
        setReminders((prev) => [created, ...prev]);
      } else {
        const res = await fetch(`${API_BASE_URL}/reminders/${editing._id}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to update reminder");
        const updated = await res.json();
        setReminders((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
      }
      closeModal();
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <div className="lavender-page">
      {/* Header */}
      <div className="meet-header mb-6">
        <div className="rem-header-left">
          <div className="meet-header-icon">
            <NotificationsActive className="icon-violet" style={{ fontSize: 26 }} />
          </div>
          <div>
            <h1 className="greeting-title" style={{ fontSize: "1.5rem" }}>Reminders</h1>
            <p className="muted text-sm mt-1">
              {dueTodayCount} due today · {upcomingCount} upcoming
            </p>
          </div>
        </div>

        <div className="rem-header-actions">
          <button className="btn-secondary" onClick={() => setPrefsOpen((v) => !v)}>
            <Tune style={{ fontSize: 16 }} /> Notification Settings
          </button>
          <button className="btn-gradient meet-header-btn" onClick={openNew}>
            <Add className="icon-sm" /> New Reminder
          </button>
        </div>
      </div>

      {/* Notification preferences panel */}
      {prefsOpen && (
        <div className="glass-card p-6 mb-6 rem-prefs-panel">
          <h3 className="section-title-sm mb-4">Which reminders do you want to see?</h3>
          <div className="rem-prefs-grid">
            {Object.entries(CATEGORY_META).map(([key, meta]) => {
              const CatIcon = meta.Icon;
              const enabled = preferences[key] !== false;
              return (
                <div key={key} className="rem-pref-row">
                  <div className="rem-pref-info">
                    <div className="rem-pref-icon" style={{ background: `${meta.color}1A`, color: meta.color }}>
                      <CatIcon style={{ fontSize: 18 }} />
                    </div>
                    <span className="rem-pref-label">{meta.label}</span>
                  </div>
                  <button
                    className={`rem-switch ${enabled ? "rem-switch-on" : ""}`}
                    onClick={() => togglePreference(key)}
                    role="switch"
                    aria-checked={enabled}
                  >
                    <span className="rem-switch-thumb" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List */}
      <div className="glass-card p-6">
        {loading ? (
          <div className="rem-empty">
            <p className="muted">Loading reminders...</p>
          </div>
        ) : visibleReminders.length === 0 ? (
          <div className="rem-empty">
            <Check className="icon-violet" style={{ fontSize: 32 }} />
            <p className="muted mt-2">
              {reminders.length === 0
                ? "All caught up — nothing on your list yet."
                : "No reminders match your current notification settings."}
            </p>
          </div>
        ) : (
          <ul className="rem-list">
            {visibleReminders.map((r) => {
              const meta = CATEGORY_META[r.category] || CATEGORY_META.general;
              const CatIcon = meta.Icon;
              const tone = PRIORITY_TONE[r.priority] || "tone-amber";
              const isLinked = !!(r.linkedNoteId || r.linkedMeetingId || r.linkedTaskId);

              return (
                <li key={r._id} className="rem-item">
                  <div className="rem-icon-box" style={{ background: `${meta.color}1A` }}>
                    <CatIcon style={{ fontSize: 20, color: meta.color }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="rem-title-row">
                      <div className="rem-title">{r.title}</div>
                      <span className="rem-category-badge" style={{ background: `${meta.color}1A`, color: meta.color }}>
                        {meta.label}
                      </span>
                    </div>
                    <div className="rem-time">
                      <Schedule style={{ fontSize: 14 }} /> {formatReminderTime(r.time)}
                    </div>
                  </div>

                  <span className={`rem-priority-chip ${tone}`}>{r.priority}</span>

                  <button className="rem-icon-action" title="Mark done" onClick={() => complete(r._id)}>
                    <Check />
                  </button>

                  <div className="rem-menu-wrap" ref={openMenuId === r._id ? menuRef : null}>
                    <button
                      className="rem-icon-action"
                      title="More"
                      onClick={() => setOpenMenuId(openMenuId === r._id ? null : r._id)}
                    >
                      <MoreVert />
                    </button>

                    {openMenuId === r._id && (
                      <div className="rem-menu">
                        <button className="rem-menu-item" onClick={() => snooze(r._id)}>
                          <Snooze style={{ fontSize: 16 }} /> Snooze to tomorrow
                        </button>
                        {!isLinked && (
                          <button className="rem-menu-item" onClick={() => openEdit(r)}>
                            <Edit style={{ fontSize: 16 }} /> Edit
                          </button>
                        )}
                        <button className="rem-menu-item rem-menu-item-danger" onClick={() => removeReminder(r._id)}>
                          <Delete style={{ fontSize: 16 }} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Toast (undo) */}
      {toast && (
        <div className="rem-toast">
          <span>{toast.text}</span>
          {toast.undoId != null && (
            <button className="rem-toast-undo" onClick={() => undoComplete(toast.undoId)}>
              <Undo style={{ fontSize: 16 }} /> Undo
            </button>
          )}
        </div>
      )}

      {/* New / Edit Modal — only for standalone reminders */}
      {editing && (
        <div className="note-modal-overlay" onClick={closeModal}>
          <div className="note-modal" onClick={(e) => e.stopPropagation()}>
            <div className="note-modal-header">
              <h2 className="section-title">{editing === "new" ? "New Reminder" : "Edit Reminder"}</h2>
              <button className="note-icon-btn" onClick={closeModal}>
                <Close />
              </button>
            </div>

            <input
              className="note-input-title"
              placeholder="Reminder title..."
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              autoFocus
            />

            <input
              type="datetime-local"
              className="note-input-title"
              style={{ fontWeight: 500, fontSize: "0.9375rem" }}
              value={draftTime}
              onChange={(e) => setDraftTime(e.target.value)}
            />

            <div className="note-tag-picker" style={{ marginTop: 4 }}>
              {["High", "Medium", "Low"].map((p) => (
                <button
                  key={p}
                  className={`note-tag-option ${draftPriority === p ? "note-tag-option-active" : ""}`}
                  onClick={() => setDraftPriority(p)}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="note-modal-footer">
              {editing !== "new" && (
                <button className="btn-text-danger" onClick={() => { removeReminder(editing._id); closeModal(); }}>
                  <Delete style={{ fontSize: 16 }} /> Delete
                </button>
              )}
              <div className="rem-footer-actions">
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
import { useState, useMemo, useRef, useEffect } from "react";
import {
  NotificationsActive,
  Call,
  Groups,
  TaskAlt,
  ReceiptLong,
  Draw,
  Schedule,
  Check,
  MoreHoriz,
  Add,
  Close,
  Snooze,
  Edit,
  Delete,
  Undo,
} from "@mui/icons-material";

import "../styles/Dashboard.css";
import "../styles/Reminders.css";

const ICON_MAP = {
  call: Call,
  groups: Groups,
  task_alt: TaskAlt,
  receipt_long: ReceiptLong,
  draw: Draw,
};

const TONE_STYLES = {
  rose:    "tone-rose",
  amber:   "tone-amber",
  emerald: "tone-emerald",
};

const PRIORITY_TONE = {
  High:   "rose",
  Medium: "amber",
  Low:    "emerald",
};

const INITIAL_REMINDERS = [
  { id: 1, title: "Call Investor",              time: "Today · 04:00 PM",    priority: "High",   icon: "call"         },
  { id: 2, title: "Board Meeting",               time: "Tomorrow · 11:00 AM", priority: "High",   icon: "groups"       },
  { id: 3, title: "Approve marketing budget",   time: "Fri · 10:00 AM",      priority: "Medium", icon: "task_alt"     },
  { id: 4, title: "Submit expense report",       time: "Sat · 12:00 PM",      priority: "Low",    icon: "receipt_long" },
  { id: 5, title: "Sign partnership MOU",        time: "Mon · 09:00 AM",      priority: "Medium", icon: "draw"         },
];

const PRIORITY_OPTIONS = ["High", "Medium", "Low"];

export default function RemindersPage() {
  const [reminders, setReminders] = useState(INITIAL_REMINDERS);
  const [completed, setCompleted] = useState([]); // recently completed, for undo
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editing, setEditing] = useState(null); // reminder being edited, or "new"
  const [draftTitle, setDraftTitle] = useState("");
  const [draftTime, setDraftTime] = useState("");
  const [draftPriority, setDraftPriority] = useState("Medium");
  const [toast, setToast] = useState(null); // { text }
  const menuRef = useRef(null);

  // close the kebab menu on outside click
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const dueTodayCount = reminders.filter((r) => r.time.startsWith("Today")).length;
  const upcomingCount = reminders.length - dueTodayCount;

  const complete = (id) => {
    const r = reminders.find((x) => x.id === id);
    if (!r) return;
    setReminders((prev) => prev.filter((x) => x.id !== id));
    setCompleted((prev) => [...prev, r]);
    setOpenMenuId(null);
    setToast({ text: `"${r.title}" marked done`, undoId: id });
  };

  const undoComplete = (id) => {
    const r = completed.find((x) => x.id === id);
    if (!r) return;
    setCompleted((prev) => prev.filter((x) => x.id !== id));
    setReminders((prev) => [r, ...prev]);
    setToast(null);
  };

  const snooze = (id) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, time: r.time.replace("Today", "Tomorrow") } : r))
    );
    setOpenMenuId(null);
    setToast({ text: "Reminder snoozed to tomorrow" });
  };

  const removeReminder = (id) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    setOpenMenuId(null);
  };

  const openNew = () => {
    setDraftTitle("");
    setDraftTime("");
    setDraftPriority("Medium");
    setEditing("new");
  };

  const openEdit = (r) => {
    setDraftTitle(r.title);
    setDraftTime(r.time);
    setDraftPriority(r.priority);
    setEditing(r);
    setOpenMenuId(null);
  };

  const closeModal = () => setEditing(null);

  const saveDraft = () => {
    if (!draftTitle.trim() || !draftTime.trim()) return;

    if (editing === "new") {
      const newReminder = {
        id: Date.now(),
        title: draftTitle.trim(),
        time: draftTime.trim(),
        priority: draftPriority,
        icon: "task_alt",
      };
      setReminders((prev) => [newReminder, ...prev]);
    } else {
      setReminders((prev) =>
        prev.map((r) =>
          r.id === editing.id
            ? { ...r, title: draftTitle.trim(), time: draftTime.trim(), priority: draftPriority }
            : r
        )
      );
    }
    closeModal();
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
              {dueTodayCount} due today · {upcomingCount} upcoming this week
            </p>
          </div>
        </div>
        <button className="btn-gradient meet-header-btn" onClick={openNew}>
          <Add className="icon-sm" /> New Reminder
        </button>
      </div>

      {/* List */}
      <div className="glass-card p-6">
        {reminders.length === 0 ? (
          <div className="rem-empty">
            <Check className="icon-violet" style={{ fontSize: 32 }} />
            <p className="muted mt-2">All caught up — nothing left on your list.</p>
          </div>
        ) : (
          <ul className="rem-list">
            {reminders.map((r) => {
              const RowIcon = ICON_MAP[r.icon] || TaskAlt;
              const tone = PRIORITY_TONE[r.priority] || "amber";
              return (
                <li key={r.id} className="rem-item">
                  <div className="rem-icon-box">
                    <RowIcon className="icon-violet" style={{ fontSize: 20 }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="rem-title">{r.title}</div>
                    <div className="rem-time">
                      <Schedule style={{ fontSize: 14 }} /> {r.time}
                    </div>
                  </div>

                  <span className={`rem-priority-chip ${TONE_STYLES[tone]}`}>{r.priority}</span>

                  <button className="rem-icon-action" title="Mark done" onClick={() => complete(r.id)}>
                    <Check />
                  </button>

                  <div className="rem-menu-wrap" ref={openMenuId === r.id ? menuRef : null}>
                    <button
                      className="rem-icon-action"
                      title="More"
                      onClick={() => setOpenMenuId(openMenuId === r.id ? null : r.id)}
                    >
                      <MoreHoriz />
                    </button>

                    {openMenuId === r.id && (
                      <div className="rem-menu">
                        <button className="rem-menu-item" onClick={() => snooze(r.id)}>
                          <Snooze style={{ fontSize: 16 }} /> Snooze to tomorrow
                        </button>
                        <button className="rem-menu-item" onClick={() => openEdit(r)}>
                          <Edit style={{ fontSize: 16 }} /> Edit
                        </button>
                        <button className="rem-menu-item rem-menu-item-danger" onClick={() => removeReminder(r.id)}>
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

      {/* New / Edit Modal */}
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
              className="note-input-title"
              style={{ fontWeight: 500, fontSize: "0.9375rem" }}
              placeholder="When? e.g. Today · 04:00 PM"
              value={draftTime}
              onChange={(e) => setDraftTime(e.target.value)}
            />

            <div className="note-tag-picker" style={{ marginTop: 4 }}>
              {PRIORITY_OPTIONS.map((p) => (
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
                <button className="btn-text-danger" onClick={() => { removeReminder(editing.id); closeModal(); }}>
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
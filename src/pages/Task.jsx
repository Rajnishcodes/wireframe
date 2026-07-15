import { useState, useMemo, useEffect } from "react";
import {
  TaskAlt,
  Schedule,
  Add,
  Close,
  Delete,
} from "@mui/icons-material";

import "../styles/Dashboard.css";
import "../styles/Task.css";

const API_BASE_URL = "http://localhost:5000/api";

const COLUMN_META = {
  todo:     { label: "To Do",        tone: "col-tone-amber"   },
  progress: { label: "In Progress",  tone: "col-tone-violet"  },
  done:     { label: "Completed",    tone: "col-tone-emerald" },
};

const COLUMN_ORDER = ["todo", "progress", "done"];

// Formats an actual Date into the same style of label your UI showed before
// ("Today", "Tomorrow", weekday name, or a short date) — purely for display.
const formatDueLabel = (dueDate, col) => {
  if (col === "done") return "Done";
  if (!dueDate) return "—";

  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays > 1 && diffDays < 7) {
    return due.toLocaleDateString("en-US", { weekday: "short" });
  }
  return due.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// Converts a Date object/string into the "yyyy-mm-dd" format
// required by an <input type="date"> value
const toDateInputValue = (dueDate) => {
  if (!dueDate) return "";
  const d = new Date(dueDate);
  return d.toISOString().split("T")[0];
};

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  const [editing, setEditing] = useState(null); // "new" or a task object
  const [draftTitle, setDraftTitle] = useState("");
  const [draftTag, setDraftTag] = useState("");
  const [draftDueDate, setDraftDueDate] = useState("");
  const [draftCol, setDraftCol] = useState("todo");

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/tasks`, { credentials: "include" });
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load tasks:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const grouped = useMemo(() => {
    const g = { todo: [], progress: [], done: [] };
    tasks.forEach((t) => g[t.col]?.push(t));
    return g;
  }, [tasks]);

  const activeCount = tasks.filter((t) => t.col !== "done").length;
  const doneCount = tasks.filter((t) => t.col === "done").length;

  /* ---------- Drag & Drop ---------- */
  const handleDragStart = (id) => setDraggingId(id);
  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverCol(null);
  };
  const handleDragOverCol = (e, colKey) => {
    e.preventDefault();
    setDragOverCol(colKey);
  };

  const handleDropOnCol = async (colKey) => {
    if (draggingId == null) return;

    const prevTasks = tasks;
    // Optimistic update — move the card instantly in the UI,
    // then confirm with the backend in the background
    setTasks((prev) => prev.map((t) => (t._id === draggingId ? { ...t, col: colKey } : t)));
    setDraggingId(null);
    setDragOverCol(null);

    try {
      const res = await fetch(`${API_BASE_URL}/tasks/${draggingId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ col: colKey }),
      });
      if (!res.ok) throw new Error("Failed to move task");
    } catch (err) {
      console.error(err.message);
      setTasks(prevTasks); // roll back on failure
    }
  };

  /* ---------- Modal helpers ---------- */
  const openNew = (colKey) => {
    setDraftTitle("");
    setDraftTag("");
    setDraftDueDate("");
    setDraftCol(colKey);
    setEditing("new");
  };

  const openEdit = (task) => {
    setDraftTitle(task.title);
    setDraftTag(task.tag || "");
    setDraftDueDate(toDateInputValue(task.dueDate));
    setDraftCol(task.col);
    setEditing(task);
  };

  const closeModal = () => setEditing(null);

  const removeTask = async (id) => {
    const prevTasks = tasks;
    setTasks((prev) => prev.filter((t) => t._id !== id));
    if (editing && editing !== "new" && editing._id === id) closeModal();

    try {
      const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete task");
    } catch (err) {
      console.error(err.message);
      setTasks(prevTasks);
    }
  };

  const saveDraft = async () => {
    if (!draftTitle.trim()) return;

    try {
      if (editing === "new") {
        const res = await fetch(`${API_BASE_URL}/tasks`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: draftTitle.trim(),
            tag: draftTag.trim() || "General",
            dueDate: draftDueDate || null,
            col: draftCol,
          }),
        });
        if (!res.ok) throw new Error("Failed to create task");
        const newTask = await res.json();
        setTasks((prev) => [newTask, ...prev]);
      } else {
        const res = await fetch(`${API_BASE_URL}/tasks/${editing._id}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: draftTitle.trim(),
            tag: draftTag.trim() || "General",
            dueDate: draftDueDate || null,
            col: draftCol,
          }),
        });
        if (!res.ok) throw new Error("Failed to update task");
        const updated = await res.json();
        setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
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
        <div className="task-header-left">
          <div className="meet-header-icon">
            <TaskAlt className="icon-violet" style={{ fontSize: 26 }} />
          </div>
          <div>
            <h1 className="greeting-title" style={{ fontSize: "1.5rem" }}>Tasks</h1>
            <p className="muted text-sm mt-1">
              {activeCount} active tasks · {doneCount} completed
            </p>
          </div>
        </div>
        <button className="btn-gradient meet-header-btn" onClick={() => openNew("todo")}>
          <Add className="icon-sm" /> New Task
        </button>
      </div>

      {/* Board */}
      {loading ? (
        <div className="glass-card p-6"><p className="muted">Loading tasks...</p></div>
      ) : (
        <div className="kanban-grid">
          {COLUMN_ORDER.map((colKey) => {
            const meta = COLUMN_META[colKey];
            const items = grouped[colKey];
            const isDragOver = dragOverCol === colKey;

            return (
              <section
                key={colKey}
                className={`glass-card kanban-col kanban-col-${colKey} ${isDragOver ? "kanban-col-over" : ""}`}
                onDragOver={(e) => handleDragOverCol(e, colKey)}
                onDragLeave={() => setDragOverCol((c) => (c === colKey ? null : c))}
                onDrop={() => handleDropOnCol(colKey)}
              >
                <div className="kanban-col-header">
                  <div className="kanban-col-heading">
                    <span className={`kanban-col-badge ${meta.tone}`}>{meta.label}</span>
                    <span className="kanban-col-count">{items.length}</span>
                  </div>
                  <button className="note-icon-btn" onClick={() => openNew(colKey)} title="Add task">
                    <Add style={{ fontSize: 18 }} />
                  </button>
                </div>

                <div className="kanban-col-body">
                  {items.length === 0 && (
                    <div className="kanban-empty">Drop a task here</div>
                  )}

                  {items.map((t) => (
                    <div
                      key={t._id}
                      className={`kanban-card ${draggingId === t._id ? "kanban-card-dragging" : ""}`}
                      draggable
                      onDragStart={() => handleDragStart(t._id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => openEdit(t)}
                    >
                      <div className="kanban-card-title">{t.title}</div>
                      <div className="kanban-card-bottom">
                        <span className="kanban-tag">{t.tag || "General"}</span>
                        <span className="kanban-due">
                          <Schedule style={{ fontSize: 14 }} /> {formatDueLabel(t.dueDate, t.col)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* New / Edit Modal */}
      {editing && (
        <div className="note-modal-overlay" onClick={closeModal}>
          <div className="note-modal" onClick={(e) => e.stopPropagation()}>
            <div className="note-modal-header">
              <h2 className="section-title">{editing === "new" ? "New Task" : "Edit Task"}</h2>
              <button className="note-icon-btn" onClick={closeModal}>
                <Close />
              </button>
            </div>

            <input
              className="note-input-title"
              placeholder="Task title..."
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              autoFocus
            />

            <input
              className="note-input-title"
              style={{ fontWeight: 500, fontSize: "0.9375rem" }}
              placeholder="Tag — e.g. Finance, Marketing"
              value={draftTag}
              onChange={(e) => setDraftTag(e.target.value)}
            />

            <p className="kanban-modal-label">Due Date</p>
            <input
              type="date"
              className="note-input-title"
              style={{ fontWeight: 500, fontSize: "0.9375rem", marginBottom: 20 }}
              value={draftDueDate}
              onChange={(e) => setDraftDueDate(e.target.value)}
            />

            <p className="kanban-modal-label">Column</p>
            <div className="note-tag-picker" style={{ marginBottom: 20 }}>
              {COLUMN_ORDER.map((colKey) => (
                <button
                  key={colKey}
                  className={`note-tag-option ${draftCol === colKey ? "note-tag-option-active" : ""}`}
                  onClick={() => setDraftCol(colKey)}
                >
                  {COLUMN_META[colKey].label}
                </button>
              ))}
            </div>

            <div className="note-modal-footer">
              {editing !== "new" && (
                <button className="btn-text-danger" onClick={() => removeTask(editing._id)}>
                  <Delete style={{ fontSize: 16 }} /> Delete
                </button>
              )}
              <div className="task-footer-actions">
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
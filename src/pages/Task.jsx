import { useState, useMemo } from "react";
import {
  TaskAlt,
  Schedule,
  Add,
  Close,
  Delete,
} from "@mui/icons-material";

import "../styles/Dashboard.css";
import "../styles/Task.css";

const COLUMN_META = {
  todo:     { label: "To Do",        tone: "col-tone-amber"   },
  progress: { label: "In Progress",  tone: "col-tone-violet"  },
  done:     { label: "Completed",    tone: "col-tone-emerald" },
};

const COLUMN_ORDER = ["todo", "progress", "done"];

const TAG_OPTIONS = ["Finance", "Strategy", "Marketing", "Investors", "People", "Product", "Ops", "Legal", "Team"];

const INITIAL_TASKS = [
  { id: 1, title: "Review Q3 financial report",   tag: "Finance",    due: "Today",    col: "todo"     },
  { id: 2, title: "Prepare board deck",            tag: "Strategy",   due: "Tomorrow", col: "todo"     },
  { id: 3, title: "Approve marketing budget",      tag: "Marketing",  due: "Fri",      col: "todo"     },
  { id: 4, title: "Draft investor update",         tag: "Investors",  due: "Today",    col: "progress" },
  { id: 5, title: "Hiring plan: VP Engineering",   tag: "People",     due: "Wed",      col: "progress" },
  { id: 6, title: "Product roadmap revisions",     tag: "Product",    due: "Thu",      col: "progress" },
  { id: 7, title: "Vendor renegotiation",          tag: "Ops",        due: "Fri",      col: "progress" },
  { id: 8, title: "Sign partnership MOU",          tag: "Legal",      due: "Done",     col: "done"     },
  { id: 9, title: "Morning brief notes",           tag: "Team",       due: "Done",     col: "done"     },
  { id: 10,title: "Reply to investor email",       tag: "Investors",  due: "Done",     col: "done"     },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  // modal state — "new" with a preset column, or a task object for editing
  const [editing, setEditing] = useState(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftTag, setDraftTag] = useState(TAG_OPTIONS[0]);
  const [draftDue, setDraftDue] = useState("");
  const [draftCol, setDraftCol] = useState("todo");

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
  const handleDropOnCol = (colKey) => {
    if (draggingId == null) return;
    setTasks((prev) => prev.map((t) => (t.id === draggingId ? { ...t, col: colKey } : t)));
    setDraggingId(null);
    setDragOverCol(null);
  };

  /* ---------- Modal helpers ---------- */
  const openNew = (colKey) => {
    setDraftTitle("");
    setDraftTag(TAG_OPTIONS[0]);
    setDraftDue("");
    setDraftCol(colKey);
    setEditing("new");
  };

  const openEdit = (task) => {
    setDraftTitle(task.title);
    setDraftTag(task.tag);
    setDraftDue(task.due);
    setDraftCol(task.col);
    setEditing(task);
  };

  const closeModal = () => setEditing(null);

  const removeTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (editing && editing !== "new" && editing.id === id) closeModal();
  };

  const saveDraft = () => {
    if (!draftTitle.trim()) return;

    if (editing === "new") {
      const newTask = {
        id: Date.now(),
        title: draftTitle.trim(),
        tag: draftTag,
        due: draftDue.trim() || "—",
        col: draftCol,
      };
      setTasks((prev) => [...prev, newTask]);
    } else {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editing.id
            ? { ...t, title: draftTitle.trim(), tag: draftTag, due: draftDue.trim() || "—", col: draftCol }
            : t
        )
      );
    }
    closeModal();
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
              {activeCount} active tasks · {doneCount} completed today
            </p>
          </div>
        </div>
        <button className="btn-gradient meet-header-btn" onClick={() => openNew("todo")}>
          <Add className="icon-sm" /> New Task
        </button>
      </div>

      {/* Board */}
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
                    key={t.id}
                    className={`kanban-card ${draggingId === t.id ? "kanban-card-dragging" : ""}`}
                    draggable
                    onDragStart={() => handleDragStart(t.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => openEdit(t)}
                  >
                    <div className="kanban-card-title">{t.title}</div>
                    <div className="kanban-card-bottom">
                      <span className="kanban-tag">{t.tag}</span>
                      <span className="kanban-due">
                        <Schedule style={{ fontSize: 14 }} /> {t.due}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

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
              placeholder="Due — e.g. Today, Fri, Done"
              value={draftDue}
              onChange={(e) => setDraftDue(e.target.value)}
            />

            <p className="kanban-modal-label">Tag</p>
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
                <button className="btn-text-danger" onClick={() => removeTask(editing.id)}>
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
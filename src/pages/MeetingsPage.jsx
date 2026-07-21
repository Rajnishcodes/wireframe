import { useState, useMemo, useEffect } from "react";
import {
  Groups,
  CalendarMonth,
  Schedule,
  LocationOn,
  Group,
  Videocam,
  Add,
  Search,
  Close,
  CheckCircle,
  Link as LinkIcon,
} from "@mui/icons-material";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";

import "../styles/Dashboard.css";
import "../styles/MeetingsPage.css";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "http://localhost:5000/api";

const PLATFORMS = [
  { id: "zoom",  name: "Zoom",            short: "Z", color: "#2D8CFF" },
  { id: "meet",  name: "Google Meet",     short: "G", color: "#00897B" },
  { id: "teams", name: "Microsoft Teams", short: "T", color: "#5059C9" },
];

const getPlatform = (id) => PLATFORMS.find((p) => p.id === id) || null;

const detectPlatformFromLink = (link) => {
  if (!link || !link.trim()) return null;
  const url = link.toLowerCase();
  if (url.includes("zoom.us")) return "zoom";
  if (url.includes("meet.google.com")) return "meet";
  if (url.includes("teams.microsoft.com") || url.includes("teams.live.com")) return "teams";
  return null;
};

// Treats "", "#", and legacy placeholder values as "no real link"
const hasRealLink = (link) => !!link && link.trim() !== "" && link.trim() !== "#";

const toneStyles = { success: "badge-success", info: "badge-info", warning: "badge-warning" };
const statusToTone = { Upcoming: "info", Scheduled: "warning", Completed: "success" };
const FILTERS = ["All", "Upcoming", "Scheduled", "Completed"];

const emptyForm = {
  title: "",
  scheduledAt: "",
  durationMinutes: 30,
  location: "",
  people: 1,
  status: "Upcoming",
  joinLink: "",
};

const formatScheduledLabel = (scheduledAt) => {
  const d = new Date(scheduledAt);
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

const toDatetimeLocalValue = (isoString) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function MeetingsPage() {
  const { user } = useAuth();

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [joined, setJoined] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const fetchMeetings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/meetings`, { credentials: "include" });
      const data = await res.json();

      // Meetings page only shows entries that have a real join link.
      // Calendar events created without a link still exist and show
      // on the Calendar, but never appear here.
      const linkedOnly = Array.isArray(data)
        ? data.filter((m) => hasRealLink(m.joinLink))
        : [];

      setMeetings(linkedOnly);
    } catch (err) {
      console.error("Failed to load meetings:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
    const interval = setInterval(fetchMeetings, 60000);
    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(() => {
    return meetings.filter((m) => {
      const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === "All" || m.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [meetings, search, filter]);

  const upcomingCount = meetings.filter((m) => m.status === "Upcoming").length;
  const completedToday = meetings.filter((m) => m.status === "Completed").length;

  const canEditOrDelete = (meeting) => {
    if (!user) return false;
    if (user.role === "superadmin" || user.role === "admin") return true;
    return meeting.createdBy === user._id;
  };

  const openScheduleDialog = () => {
    setForm(emptyForm);
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEditDialog = (m) => {
    setForm({
      title: m.title,
      scheduledAt: toDatetimeLocalValue(m.scheduledAt),
      durationMinutes: m.durationMinutes,
      location: m.location,
      people: m.people,
      status: m.status,
      joinLink: hasRealLink(m.joinLink) ? m.joinLink : "",
    });
    setEditingId(m._id);
    setDialogOpen(true);
  };

  const handleSaveMeeting = async () => {
    if (!form.title.trim() || !form.scheduledAt) return;

    if (!hasRealLink(form.joinLink)) {
      alert("Please add a join link — meetings without a link won't appear on this page (they'll still show on the Calendar).");
      return;
    }

    const payload = {
      title: form.title,
      scheduledAt: new Date(form.scheduledAt).toISOString(),
      durationMinutes: Number(form.durationMinutes) || 30,
      location: form.location,
      people: Number(form.people) || 1,
      status: form.status,
      joinLink: form.joinLink.trim(),
    };

    try {
      const url = editingId ? `${API_BASE_URL}/meetings/${editingId}` : `${API_BASE_URL}/meetings`;
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to save meeting");
      }

      const saved = await res.json();

      if (hasRealLink(saved.joinLink)) {
        setMeetings((prev) =>
          editingId ? prev.map((m) => (m._id === saved._id ? saved : m)) : [saved, ...prev]
        );
      }

      setDialogOpen(false);
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleDeleteMeeting = async (id) => {
    const prevMeetings = meetings;
    setMeetings((prev) => prev.filter((m) => m._id !== id));

    try {
      const res = await fetch(`${API_BASE_URL}/meetings/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete meeting");
    } catch (err) {
      console.error(err.message);
      setMeetings(prevMeetings);
    }
  };

  // Every click opens the link — whether this is the FIRST join or a
  // rejoin after a disconnect. Once joined, the button stays available
  // to reopen the exact same link at any time.
  const handleJoin = (m) => {
    setJoined(m._id);
    window.open(m.joinLink, "_blank", "noopener,noreferrer");
  };

  // Lets the user manually reset the card's local "joined" indicator
  // back to a fresh "Join" state — purely a frontend visual reset,
  // does not affect the meeting's actual status on the backend.
  const handleLeaveMeeting = (id) => {
    setJoined((prev) => (prev === id ? null : prev));
  };

  // Explicitly ends a meeting — the ONLY way a meeting becomes
  // "Completed" now (no automatic duration-based cutoff), so a
  // meeting scheduled for 30 min can run for 2 hours with zero
  // interruption to Join/Rejoin.
  const handleEndMeeting = async (id) => {
    const prevMeetings = meetings;

    try {
      const res = await fetch(`${API_BASE_URL}/meetings/${id}/end`, {
        method: "PATCH",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to end meeting");

      const updated = await res.json();
      setMeetings((prev) => prev.map((m) => (m._id === id ? updated : m)));
    } catch (err) {
      console.error(err.message);
      setMeetings(prevMeetings);
    }
  };

  const handleActionSelect = (meeting, action, selectEl) => {
    if (action === "edit") {
      openEditDialog(meeting);
    } else if (action === "delete") {
      handleDeleteMeeting(meeting._id);
    } else if (action === "end") {
      handleEndMeeting(meeting._id);
    }
    if (selectEl) selectEl.value = "";
  };

  const formLinkHasValue = hasRealLink(form.joinLink);
  const detectedPlatform = formLinkHasValue ? getPlatform(detectPlatformFromLink(form.joinLink)) : null;

  return (
    <div className="lavender-page">
      {/* Page Header */}
      <div className="meet-header mb-6">
        <div className="meet-header-left">
          <div className="meet-header-icon">
            <Groups className="icon-violet" style={{ fontSize: 26 }} />
          </div>
          <div>
            <h1 className="greeting-title" style={{ fontSize: "1.5rem" }}>Meetings</h1>
            <p className="muted text-sm mt-1">
              {upcomingCount} meetings scheduled · {completedToday} completed
            </p>
          </div>
        </div>

        <button className="btn-gradient meet-header-btn" onClick={openScheduleDialog}>
          <Add className="icon-sm" /> Schedule Meeting
        </button>
      </div>

      {/* Toolbar */}
      <div className="meet-toolbar mb-6">
        <div className="meet-search">
          <Search className="icon-muted icon-sm" />
          <input
            type="text"
            placeholder="Search meetings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="meet-search-clear" onClick={() => setSearch("")}>
              <Close style={{ fontSize: 16 }} />
            </button>
          )}
        </div>

        <div className="meet-filter-pills">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`meet-pill ${filter === f ? "meet-pill-active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Meeting list */}
      <div className="meet-list">
        {loading && <div className="glass-card p-6 meet-empty"><p className="muted">Loading meetings...</p></div>}

        {!loading && filtered.length === 0 && (
          <div className="glass-card p-6 meet-empty">
            <Search className="icon-muted" style={{ fontSize: 32 }} />
            <p className="muted mt-2">
              {meetings.length === 0
                ? "No meetings with a join link yet. Add one from the Calendar or Schedule Meeting above."
                : "No meetings match your search."}
            </p>
          </div>
        )}

        {filtered.map((m) => {
          const isJoined = joined === m._id;
          const canJoin = m.status !== "Completed";
          const platform = getPlatform(m.platform);

          return (
            <div key={m._id} className="glass-card meet-card">
              <div className="meet-icon-box">
                <CalendarMonth className="icon-violet" style={{ fontSize: 26 }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="meet-title-row">
                  <span className="meet-title">{m.title}</span>
                  {platform && (
                    <span
                      className="platform-badge"
                      style={{ background: `${platform.color}1A`, color: platform.color }}
                      title={platform.name}
                    >
                      {platform.short} {platform.name}
                    </span>
                  )}
                </div>

                <div className="meet-meta-row">
                  <span className="meet-meta-item">
                    <Schedule style={{ fontSize: 16 }} /> {formatScheduledLabel(m.scheduledAt)} · {m.durationMinutes} min
                  </span>
                  <span className="meet-meta-item">
                    <LocationOn style={{ fontSize: 16 }} /> {m.location || "—"}
                  </span>
                  <span className="meet-meta-item">
                    <Group style={{ fontSize: 16 }} /> {m.people} people
                  </span>
                </div>
              </div>

              <span className={`badge ${toneStyles[statusToTone[m.status]]}`}>{m.status}</span>

              {canJoin ? (
                isJoined ? (
                  <div className="meet-join-group">
                    <button className="btn-joined" onClick={() => handleJoin(m)} title="Reopen the meeting link">
                      <Videocam style={{ fontSize: 18 }} /> Rejoin
                    </button>
                    <button
                      className="meet-leave-btn"
                      onClick={() => handleLeaveMeeting(m._id)}
                      title="Mark as left"
                    >
                      <Close style={{ fontSize: 16 }} />
                    </button>
                  </div>
                ) : (
                  <button className="btn-gradient meet-join-btn" onClick={() => handleJoin(m)}>
                    <Videocam style={{ fontSize: 18 }} /> Join
                  </button>
                )
              ) : (
                <button className="btn-disabled" disabled>
                  <CheckCircle style={{ fontSize: 18 }} /> Done
                </button>
              )}

              {canEditOrDelete(m) && (
                <select
                  className="meet-action-select"
                  defaultValue=""
                  onChange={(e) => handleActionSelect(m, e.target.value, e.target)}
                >
                  <option value="" disabled>Actions</option>
                  {m.status !== "Completed" && <option value="end">End Meeting</option>}
                  <option value="edit">Edit</option>
                  <option value="delete">Delete</option>
                </select>
              )}
            </div>
          );
        })}
      </div>

      {/* Schedule / Edit Meeting Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editingId ? "Edit Meeting" : "Schedule Meeting"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Meeting title"
            size="small"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />

          <TextField
            label="Date & Time"
            type="datetime-local"
            size="small"
            value={form.scheduledAt}
            onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
            InputLabelProps={{ shrink: true }}
          />

          <div style={{ display: "flex", gap: 12 }}>
            <TextField
              label="Duration (minutes)"
              type="number"
              size="small"
              value={form.durationMinutes}
              inputProps={{ min: 1 }}
              onChange={(e) => setForm((f) => ({ ...f, durationMinutes: e.target.value }))}
              fullWidth
            />
            <TextField
              label="People"
              type="number"
              size="small"
              value={form.people}
              inputProps={{ min: 1 }}
              onChange={(e) => setForm((f) => ({ ...f, people: e.target.value }))}
              fullWidth
            />
          </div>

          <TextField
            label="Location / Room (optional)"
            size="small"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          />

          <TextField
            select
            label="Status"
            size="small"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
          >
            {["Upcoming", "Scheduled", "Completed"].map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="Join link / Meeting ID"
            size="small"
            placeholder="https://... (required)"
            value={form.joinLink}
            onChange={(e) => setForm((f) => ({ ...f, joinLink: e.target.value }))}
            required
            InputProps={{
              startAdornment: <LinkIcon style={{ fontSize: 18, marginRight: 6, color: "#9CA3AF" }} />,
            }}
          />

          {formLinkHasValue && detectedPlatform && (
            <div style={{ fontSize: "0.75rem", color: "#7C3AED", fontWeight: 600, marginTop: -8 }}>
              Detected platform: {detectedPlatform.name}
            </div>
          )}

          {formLinkHasValue && !detectedPlatform && (
            <div style={{ fontSize: "0.75rem", color: "#9CA3AF", fontWeight: 500, marginTop: -8 }}>
              Link added — platform not recognized (Zoom, Google Meet, or Teams links get a badge).
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" className="new-event-btn" onClick={handleSaveMeeting}>
            {editingId ? "Save Changes" : "Schedule"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
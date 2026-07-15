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
  MoreVert,
  Edit,
  Delete,
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
  { id: "zoom",   name: "Zoom",             short: "Z",  color: "#2D8CFF", urlPrefix: "https://zoom.us/j/" },
  { id: "meet",   name: "Google Meet",      short: "G",  color: "#00897B", urlPrefix: "https://meet.google.com/" },
  { id: "teams",  name: "Microsoft Teams",  short: "T",  color: "#5059C9", urlPrefix: "https://teams.microsoft.com/l/meetup-join/" },
  { id: "custom", name: "Custom Link",      short: "🔗", color: "#7C3AED", urlPrefix: "" },
];

const getPlatform = (id) => PLATFORMS.find((p) => p.id === id) || PLATFORMS[3];

const detectPlatformFromLink = (link) => {
  if (!link) return null;
  const url = link.toLowerCase();
  if (url.includes("zoom.us")) return "zoom";
  if (url.includes("meet.google.com")) return "meet";
  if (url.includes("teams.microsoft.com") || url.includes("teams.live.com")) return "teams";
  return "custom";
};

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

// Formats a real Date into "Today · 5:42 PM", "Tomorrow · ...", or a short date
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

// Converts a Date/ISO string into the "yyyy-MM-ddTHH:mm" format
// required by <input type="datetime-local">
const toDatetimeLocalValue = (isoString) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function MeetingsPage() {
  const { user } = useAuth();
  const canManageMeetings = user?.role === "superadmin" || user?.role === "admin";

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [joined, setJoined] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null); // null = creating new
  const [menuOpenId, setMenuOpenId] = useState(null);

  const fetchMeetings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/meetings`, { credentials: "include" });
      const data = await res.json();
      setMeetings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load meetings:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
    // Re-fetch periodically so a meeting that just ended flips to
    // "Completed" without requiring a manual page refresh
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
      joinLink: m.joinLink === "#" ? "" : m.joinLink,
    });
    setEditingId(m._id);
    setMenuOpenId(null);
    setDialogOpen(true);
  };

  const handleSaveMeeting = async () => {
    if (!form.title.trim() || !form.scheduledAt) return;

    const payload = {
      title: form.title,
      scheduledAt: new Date(form.scheduledAt).toISOString(),
      durationMinutes: Number(form.durationMinutes) || 30,
      location: form.location || getPlatform(detectPlatformFromLink(form.joinLink) || "custom").name,
      people: Number(form.people) || 1,
      status: form.status,
      joinLink: form.joinLink || "#",
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

      setMeetings((prev) =>
        editingId ? prev.map((m) => (m._id === saved._id ? saved : m)) : [saved, ...prev]
      );

      setDialogOpen(false);
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleDeleteMeeting = async (id) => {
    setMenuOpenId(null);
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

  const handleJoin = (m) => {
    if (joined === m._id) {
      setJoined(null);
      return;
    }
    setJoined(m._id);
    if (m.joinLink && m.joinLink !== "#") {
      window.open(m.joinLink, "_blank", "noopener,noreferrer");
    }
  };

  const handleJoinLinkChange = (e) => {
    const link = e.target.value;
    setForm((f) => ({ ...f, joinLink: link }));
  };

  const detectedPlatform = getPlatform(detectPlatformFromLink(form.joinLink));

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

        {canManageMeetings && (
          <button className="btn-gradient meet-header-btn" onClick={openScheduleDialog}>
            <Add className="icon-sm" /> Schedule Meeting
          </button>
        )}
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
            <p className="muted mt-2">No meetings match your search.</p>
          </div>
        )}

        {filtered.map((m) => {
          const isJoined = joined === m._id;
          const canJoin = m.status !== "Completed";
          const platform = getPlatform(m.platform);
          const isMenuOpen = menuOpenId === m._id;

          return (
            <div key={m._id} className="glass-card meet-card">
              <div className="meet-icon-box">
                <CalendarMonth className="icon-violet" style={{ fontSize: 26 }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="meet-title-row">
                  <span className="meet-title">{m.title}</span>
                  <span
                    className="platform-badge"
                    style={{ background: `${platform.color}1A`, color: platform.color }}
                    title={platform.name}
                  >
                    {platform.short} {platform.name}
                  </span>
                </div>

                <div className="meet-meta-row">
                  <span className="meet-meta-item">
                    <Schedule style={{ fontSize: 16 }} /> {formatScheduledLabel(m.scheduledAt)} · {m.durationMinutes} min
                  </span>
                  <span className="meet-meta-item">
                    <LocationOn style={{ fontSize: 16 }} /> {m.location}
                  </span>
                  <span className="meet-meta-item">
                    <Group style={{ fontSize: 16 }} /> {m.people} people
                  </span>
                </div>
              </div>

              <span className={`badge ${toneStyles[statusToTone[m.status]]}`}>{m.status}</span>

              {canJoin ? (
                <button
                  className={isJoined ? "btn-joined" : "btn-gradient meet-join-btn"}
                  onClick={() => handleJoin(m)}
                >
                  {isJoined ? (
                    <>
                      <CheckCircle style={{ fontSize: 18 }} /> Joined
                    </>
                  ) : (
                    <>
                      <Videocam style={{ fontSize: 18 }} /> Join
                    </>
                  )}
                </button>
              ) : (
                <button className="btn-disabled" disabled>
                  <CheckCircle style={{ fontSize: 18 }} /> Done
                </button>
              )}

              {/* Edit/Delete — only visible to Admin & Super Admin */}
              {canManageMeetings && (
                <div className="meet-menu-wrap">
                  <button className="note-icon-btn" onClick={() => setMenuOpenId(isMenuOpen ? null : m._id)}>
                    <MoreVert style={{ fontSize: 20 }} />
                  </button>
                  {isMenuOpen && (
                    <div className="meet-item-menu">
                      <button onClick={() => openEditDialog(m)}>
                        <Edit style={{ fontSize: 16 }} /> Edit
                      </button>
                      <button className="meet-item-menu-danger" onClick={() => handleDeleteMeeting(m._id)}>
                        <Delete style={{ fontSize: 16 }} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Schedule / Edit Meeting Dialog */}
      {canManageMeetings && (
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
              placeholder="Leave blank to use platform name"
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
              placeholder="https://..."
              value={form.joinLink}
              onChange={handleJoinLinkChange}
              InputProps={{
                startAdornment: <LinkIcon style={{ fontSize: 18, marginRight: 6, color: "#9CA3AF" }} />,
              }}
            />

            {form.joinLink.trim() && (
              <div style={{ fontSize: "0.75rem", color: "#7C3AED", fontWeight: 600, marginTop: -8 }}>
                Detected platform: {detectedPlatform.name}
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
      )}
    </div>
  );
}
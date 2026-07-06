import { useState, useMemo } from "react";
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

/* =====================================================
   Platform definitions
===================================================== */

const PLATFORMS = [
  { id: "zoom",     name: "Zoom",             short: "Z",  color: "#2D8CFF", urlPrefix: "https://zoom.us/j/" },
  { id: "meet",     name: "Google Meet",      short: "G",  color: "#00897B", urlPrefix: "https://meet.google.com/" },
  { id: "teams",    name: "Microsoft Teams",  short: "T",  color: "#5059C9", urlPrefix: "https://teams.microsoft.com/l/meetup-join/" },
  { id: "custom",   name: "Custom Link",      short: "🔗", color: "#7C3AED", urlPrefix: "" },
];

const getPlatform = (id) => PLATFORMS.find((p) => p.id === id) || PLATFORMS[3];

const INITIAL_MEETINGS = [
  { id: 1, title: "Project Review",         time: "Today · 10:30 AM",    duration: "60 min", location: "Conference Room A", people: 7,  status: "Upcoming",  tone: "info",    platform: "meet",  joinLink: "https://meet.google.com/abc-defg-hij" },
  { id: 2, title: "Client Call — Acme Co.", time: "Today · 03:00 PM",    duration: "45 min", location: "Zoom",              people: 4,  status: "Upcoming",  tone: "info",    platform: "zoom",  joinLink: "https://zoom.us/j/1234567890" },
  { id: 3, title: "Team Meeting",           time: "Today · 05:30 PM",    duration: "30 min", location: "Conference Room B", people: 12, status: "Upcoming",  tone: "info",    platform: "teams", joinLink: "https://teams.microsoft.com/l/meetup-join/sample" },
  { id: 4, title: "Investor Sync",          time: "Tomorrow · 11:00 AM", duration: "60 min", location: "Zoom",              people: 5,  status: "Scheduled", tone: "warning", platform: "zoom",  joinLink: "https://zoom.us/j/9876543210" },
  { id: 5, title: "Morning Brief",          time: "Today · 09:00 AM",    duration: "15 min", location: "Team",              people: 8,  status: "Completed", tone: "success", platform: "meet",  joinLink: "https://meet.google.com/xyz-uvwx-rst" },
];

const toneStyles = {
  success: "badge-success",
  info: "badge-info",
  warning: "badge-warning",
};

const FILTERS = ["All", "Upcoming", "Scheduled", "Completed"];

const emptyForm = {
  title: "",
  date: "Today",
  time: "",
  duration: "30 min",
  location: "",
  people: 1,
  status: "Upcoming",
  platform: "zoom",
  joinLink: "",
};

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState(INITIAL_MEETINGS);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [joined, setJoined] = useState(null); // id of meeting currently "in"
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(() => {
    return meetings.filter((m) => {
      const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === "All" || m.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [meetings, search, filter]);

  const upcomingCount = meetings.filter((m) => m.status === "Upcoming").length;
  const completedToday = meetings.filter((m) => m.status === "Completed").length;

  const statusToTone = { Upcoming: "info", Scheduled: "warning", Completed: "success" };

  const openScheduleDialog = () => {
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const handleCreateMeeting = () => {
    if (!form.title.trim()) return;

    const newMeeting = {
      id: Date.now(),
      title: form.title,
      time: `${form.date} · ${form.time || "TBD"}`,
      duration: form.duration,
      location: form.location || getPlatform(form.platform).name,
      people: Number(form.people) || 1,
      status: form.status,
      tone: statusToTone[form.status],
      platform: form.platform,
      joinLink: form.joinLink || "#",
    };

    setMeetings((prev) => [newMeeting, ...prev]);
    setDialogOpen(false);
  };

  const handleJoin = (m) => {
    if (joined === m.id) {
      setJoined(null);
      return;
    }
    setJoined(m.id);
    if (m.joinLink && m.joinLink !== "#") {
      window.open(m.joinLink, "_blank", "noopener,noreferrer");
    }
  };

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
              {upcomingCount} meetings scheduled · {completedToday} completed today
            </p>
          </div>
        </div>
        <button className="btn-gradient meet-header-btn" onClick={openScheduleDialog}>
          <Add className="icon-sm" /> Schedule Meeting
        </button>
      </div>

      {/* Toolbar: search + status filter pills */}
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
        {filtered.length === 0 && (
          <div className="glass-card p-6 meet-empty">
            <Search className="icon-muted" style={{ fontSize: 32 }} />
            <p className="muted mt-2">No meetings match your search.</p>
          </div>
        )}

        {filtered.map((m) => {
          const isJoined = joined === m.id;
          const canJoin = m.status !== "Completed";
          const platform = getPlatform(m.platform);

          return (
            <div key={m.id} className="glass-card meet-card">
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
                    <Schedule style={{ fontSize: 16 }} /> {m.time} · {m.duration}
                  </span>
                  <span className="meet-meta-item">
                    <LocationOn style={{ fontSize: 16 }} /> {m.location}
                  </span>
                  <span className="meet-meta-item">
                    <Group style={{ fontSize: 16 }} /> {m.people} people
                  </span>
                </div>
              </div>

              <span className={`badge ${toneStyles[m.tone]}`}>{m.status}</span>

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
            </div>
          );
        })}
      </div>

      {/* Schedule Meeting Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Schedule Meeting</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Meeting title"
            size="small"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />

          <div style={{ display: "flex", gap: 12 }}>
            <TextField
              label="Date"
              size="small"
              placeholder="Today / Tomorrow / Jul 10"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Time"
              size="small"
              placeholder="e.g. 02:00 PM"
              value={form.time}
              onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
              fullWidth
            />
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <TextField
              label="Duration"
              size="small"
              value={form.duration}
              onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
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
            select
            label="Meeting platform"
            size="small"
            value={form.platform}
            onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
          >
            {PLATFORMS.map((p) => (
              <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="Join link / Meeting ID"
            size="small"
            placeholder={getPlatform(form.platform).urlPrefix || "https://..."}
            value={form.joinLink}
            onChange={(e) => setForm((f) => ({ ...f, joinLink: e.target.value }))}
            InputProps={{
              startAdornment: <LinkIcon style={{ fontSize: 18, marginRight: 6, color: "#9CA3AF" }} />,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" className="new-event-btn" onClick={handleCreateMeeting}>
            Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
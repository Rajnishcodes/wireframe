import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Calendar.css";

import "bootstrap/dist/css/bootstrap.min.css";

import {
  Button,
  IconButton,
  Chip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from "@mui/material";

import {
  CalendarMonthRounded,
  ChevronLeftRounded,
  ChevronRightRounded,
  AddRounded,
  Link as LinkIcon,
} from "@mui/icons-material";

const API_BASE_URL = "http://localhost:5000/api";

/* =====================================================
   Helpers
===================================================== */

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const PLATFORM_TONE = {
  zoom: "violet",
  meet: "green",
  teams: "orange",
  custom: "red",
};

// Falls back to a neutral tone when a meeting has no platform yet
// (platform is null until a real join link is provided)
const getEventTone = (platform) => (platform ? PLATFORM_TONE[platform] || "violet" : "gray");

const emptyForm = {
  title: "",
  time: "",
  duration: 30,
  location: "",
  people: 1,
  status: "Upcoming",
  joinLink: "",
};

/* =====================================================
   Component
===================================================== */

const Calendar = () => {
  const navigate = useNavigate();
  const realToday = new Date();

  const [calendarDate, setCalendarDate] = useState(
    new Date(realToday.getFullYear(), realToday.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(realToday.getDate());

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("Month");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  const monthLabel = calendarDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const isRealTodayInView =
    realToday.getFullYear() === year && realToday.getMonth() === month;
  const todayDate = isRealTodayInView ? realToday.getDate() : null;

  const blanks = Array.from({ length: firstDayIndex }, (_, i) => null);
  const allDates = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Midnight today — used to compare whole days (ignoring the current time)
  const todayMidnight = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  // True if a given day-of-month (in the CURRENTLY VIEWED month/year) is before today
  const isPastDate = (date) => {
    const d = new Date(year, month, date);
    d.setHours(0, 0, 0, 0);
    return d < todayMidnight;
  };

  const selectedIsPast = isPastDate(selectedDate);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/meetings?year=${year}&month=${month + 1}`,
        { credentials: "include" }
      );
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
  }, [year, month]);

  const eventsByDay = useMemo(() => {
    const map = {};
    meetings.forEach((m) => {
      const d = new Date(m.scheduledAt).getDate();
      if (!map[d]) map[d] = [];
      map[d].push(m);
    });
    return map;
  }, [meetings]);

  const getEventsFor = (date) => eventsByDay[date] || [];

  const goPrevMonth = () => {
    setCalendarDate(new Date(year, month - 1, 1));
  };
  const goNextMonth = () => {
    setCalendarDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const t = new Date();
    setCalendarDate(new Date(t.getFullYear(), t.getMonth(), 1));
    setSelectedDate(t.getDate());
  };

  const weekDates = useMemo(() => {
    if (view !== "Week") return allDates;
    const anchor = selectedDate <= daysInMonth ? selectedDate : todayDate || 1;
    const anchorDow = (new Date(year, month, anchor).getDay() + 6) % 7;
    const weekStart = anchor - anchorDow;
    const result = [];
    for (let i = 0; i < 7; i++) {
      const d = weekStart + i;
      if (d >= 1 && d <= daysInMonth) result.push(d);
    }
    return result;
  }, [view, selectedDate, todayDate, daysInMonth, year, month]);

  const visibleDates =
    view === "Day" ? [selectedDate].filter((d) => d >= 1 && d <= daysInMonth)
    : view === "Week" ? weekDates
    : allDates;

  const visibleBlanks = view === "Month" ? blanks : [];

  const eventsThisWeekCount = useMemo(() => {
    const anchor = todayDate || selectedDate || 1;
    const anchorDow = (new Date(year, month, anchor).getDay() + 6) % 7;
    const weekStart = anchor - anchorDow;
    let count = 0;
    for (let i = 0; i < 7; i++) {
      const d = weekStart + i;
      if (d >= 1 && d <= daysInMonth) count += getEventsFor(d).length;
    }
    return count;
  }, [eventsByDay, year, month, daysInMonth, todayDate, selectedDate]);

  const openNewEventDialog = () => {
    // Extra safety net — button is already disabled for past dates,
    // but this blocks it even if somehow triggered another way
    if (selectedIsPast) {
      return;
    }
    setForm(emptyForm);
    setFormError("");
    setDialogOpen(true);
  };

  const handleAddEvent = async () => {
    setFormError("");

    if (!form.title.trim()) {
      setFormError("Please enter an event title.");
      return;
    }
    if (!form.time) {
      setFormError("Please choose a time.");
      return;
    }

    const [hours, minutes] = form.time.split(":").map(Number);
    const scheduledAt = new Date(year, month, selectedDate, hours, minutes);

    // Final guard — blocks BOTH a past day AND a past time on today itself
    // (e.g. selecting today but choosing a time that has already passed)
    if (scheduledAt < new Date()) {
      setFormError("You can't schedule an event in the past. Please choose a future date and time.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/meetings`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          scheduledAt: scheduledAt.toISOString(),
          durationMinutes: Number(form.duration) || 30,
          location: form.location.trim(),
          people: Number(form.people) || 1,
          status: form.status,
          joinLink: form.joinLink.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to create event");
      }

      const created = await res.json();
      setMeetings((prev) => [...prev, created]);
      setDialogOpen(false);
    } catch (err) {
      setFormError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid py-4">

      {/* Header */}
      <div className="calendar-header">
        <div className="header-left">
          <div className="calendar-icon">
            <CalendarMonthRounded />
          </div>
          <div>
            <Typography variant="h4" className="title">Calendar</Typography>
            <Typography className="subtitle">
              {monthLabel} • {eventsThisWeekCount} event{eventsThisWeekCount !== 1 ? "s" : ""} scheduled this week
            </Typography>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Button variant="outlined" onClick={goToToday} className="today-btn">
            Today
          </Button>
          <Button
            variant="contained"
            startIcon={<AddRounded />}
            className="new-event-btn"
            onClick={openNewEventDialog}
            disabled={selectedIsPast}
            title={selectedIsPast ? "Select today or a future date to schedule an event" : ""}
          >
            New Event
          </Button>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="calendar-card">

        <div className="calendar-top">
          <div className="month-control">
            <IconButton onClick={goPrevMonth}><ChevronLeftRounded /></IconButton>
            <h4>{monthLabel}</h4>
            <IconButton onClick={goNextMonth}><ChevronRightRounded /></IconButton>
          </div>

          <div className="view-buttons">
            {["Day", "Week", "Month"].map((item) => (
              <button
                key={item}
                className={`view-btn ${view === item ? "active-view" : ""}`}
                onClick={() => setView(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {loading && <div className="muted-empty" style={{ padding: "20px 0" }}>Loading meetings...</div>}

        {!loading && view !== "Day" && (
          <div className="row g-2 calendar-days">
            {days.map((day) => (
              <div key={day} className="col">
                <div className="day-name">{day}</div>
              </div>
            ))}
          </div>
        )}

        {!loading && (
          <div className="row g-2">
            {visibleBlanks.map((_, i) => (
              <div key={`b${i}`} className="col-12 col-sm-6 col-md-4 col-lg calendar-column" />
            ))}

            {visibleDates.map((date) => {
              const dayIsPast = isPastDate(date);
              return (
                <div
                  key={date}
                  className={
                    view === "Day"
                      ? "col-12 calendar-column"
                      : "col-12 col-sm-6 col-md-4 col-lg calendar-column"
                  }
                >
                  <div
                    className={`calendar-day ${todayDate === date ? "today" : ""} ${
                      selectedDate === date ? "selected" : ""
                    } ${dayIsPast ? "past-day" : ""}`}
                    onClick={() => setSelectedDate(date)}
                    style={{ cursor: "pointer" }}
                    title={dayIsPast ? "Past date — you can view events but not create new ones" : ""}
                  >
                    <div className="date-number">{date}</div>

                    <div className="event-list">
                      {getEventsFor(date).map((m) => (
                        <Chip
                          key={m._id}
                          label={`${new Date(m.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} • ${m.title}`}
                          size="small"
                          className={`event-chip ${getEventTone(m.platform)}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("/meetings");
                          }}
                        />
                      ))}
                      {getEventsFor(date).length === 0 && view === "Day" && (
                        <div className="muted-empty">No events scheduled</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* New Event Dialog */}
      <Dialog open={dialogOpen} onClose={() => !saving && setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>New Event — {monthLabel} {selectedDate}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Event title"
            size="small"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />

          <TextField
            label="Time"
            type="time"
            size="small"
            value={form.time}
            onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
            InputLabelProps={{ shrink: true }}
          />

          <div style={{ display: "flex", gap: 12 }}>
            <TextField
              label="Duration (minutes)"
              type="number"
              size="small"
              value={form.duration}
              inputProps={{ min: 1 }}
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
            label="Location (optional)"
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
            label="Join link (optional)"
            size="small"
            placeholder="Leave blank if you don't have one yet"
            value={form.joinLink}
            onChange={(e) => setForm((f) => ({ ...f, joinLink: e.target.value }))}
            InputProps={{
              startAdornment: <LinkIcon style={{ fontSize: 18, marginRight: 6, color: "#9CA3AF" }} />,
            }}
          />

          {formError && (
            <div style={{ color: "#DC2626", fontSize: "0.8125rem", fontWeight: 500 }}>
              {formError}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
          <Button variant="contained" className="new-event-btn" onClick={handleAddEvent} disabled={saving}>
            {saving ? "Adding..." : "Add Event"}
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
};

export default Calendar;
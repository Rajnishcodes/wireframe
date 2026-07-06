import React, { useState, useMemo } from "react";
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
} from "@mui/icons-material";

/* =====================================================
   Helpers
===================================================== */

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const toKey = (year, month, date) => `${year}-${month}-${date}`;

const initialEvents = {
  [toKey(2026, 5, 3)]: [{ title: "Strategy Sync", time: "10:00 AM", tone: "violet" }],
  [toKey(2026, 5, 10)]: [{ title: "Board Review", time: "11:00 AM", tone: "green" }],
  [toKey(2026, 5, 15)]: [{ title: "Quarterly Check-in", time: "02:00 PM", tone: "orange" }],
  [toKey(2026, 5, 22)]: [{ title: "Investor Call", time: "04:00 PM", tone: "red" }],
  [toKey(2026, 5, 29)]: [
    { title: "Project Review", time: "10:30 AM", tone: "violet" },
    { title: "Client Call", time: "03:00 PM", tone: "green" },
  ],
};

const toneOptions = [
  { value: "violet", label: "Violet" },
  { value: "green", label: "Green" },
  { value: "orange", label: "Orange" },
  { value: "red", label: "Red" },
];

/* =====================================================
   Component
===================================================== */

const Calendar = () => {
  const realToday = new Date();

  const [calendarDate, setCalendarDate] = useState(new Date(2026, 5, 1)); // viewing June 2026
  const [events, setEvents] = useState(initialEvents);
  const [view, setView] = useState("Month");
  const [selectedDate, setSelectedDate] = useState(29);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ date: 29, title: "", time: "", tone: "violet" });

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  const monthLabel = calendarDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const isRealTodayInView =
    realToday.getFullYear() === year && realToday.getMonth() === month;
  const todayDate = isRealTodayInView ? realToday.getDate() : null;

  const blanks = Array.from({ length: firstDayIndex }, (_, i) => null);
  const allDates = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const goPrevMonth = () => setCalendarDate(new Date(year, month - 1, 1));
  const goNextMonth = () => setCalendarDate(new Date(year, month + 1, 1));

  const getEventsFor = (date) => events[toKey(year, month, date)] || [];

  // Determine which dates belong to the "current week" (based on selectedDate) for Week view
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

  // Count events scheduled within the currently visible week (for subtitle)
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
  }, [events, year, month, daysInMonth, todayDate, selectedDate]);

  const openNewEventDialog = () => {
    setForm({ date: selectedDate || 1, title: "", time: "", tone: "violet" });
    setDialogOpen(true);
  };

  const handleAddEvent = () => {
    if (!form.title.trim()) return;
    const key = toKey(year, month, Number(form.date));
    setEvents((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), { title: form.title, time: form.time || "All day", tone: form.tone }],
    }));
    setDialogOpen(false);
  };

  return (
    <div className="container-fluid py-4">

      {/* ============================================
            Header
      ============================================ */}

      <div className="calendar-header">

        <div className="header-left">

          <div className="calendar-icon">
            <CalendarMonthRounded />
          </div>

          <div>
            <Typography variant="h4" className="title">
              Calendar
            </Typography>

            <Typography className="subtitle">
              {monthLabel} • {eventsThisWeekCount} event{eventsThisWeekCount !== 1 ? "s" : ""} scheduled this week
            </Typography>
          </div>

        </div>

        <Button
          variant="contained"
          startIcon={<AddRounded />}
          className="new-event-btn"
          onClick={openNewEventDialog}
        >
          New Event
        </Button>

      </div>

      {/* ============================================
            Calendar Card
      ============================================ */}

      <div className="calendar-card">

        {/* Top */}
        <div className="calendar-top">

          {/* Month */}
          <div className="month-control">
            <IconButton onClick={goPrevMonth}>
              <ChevronLeftRounded />
            </IconButton>

            <h4>{monthLabel}</h4>

            <IconButton onClick={goNextMonth}>
              <ChevronRightRounded />
            </IconButton>
          </div>

          {/* Views */}
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

        {/* Days header (only meaningful for Month/Week) */}
        {view !== "Day" && (
          <div className="row g-2 calendar-days">
            {days.map((day) => (
              <div key={day} className="col">
                <div className="day-name">{day}</div>
              </div>
            ))}
          </div>
        )}

        {/* Dates */}
        <div className="row g-2">
          {visibleBlanks.map((_, i) => (
            <div key={`b${i}`} className="col-12 col-sm-6 col-md-4 col-lg calendar-column" />
          ))}

          {visibleDates.map((date) => (
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
                }`}
                onClick={() => setSelectedDate(date)}
                style={{ cursor: "pointer" }}
              >
                <div className="date-number">{date}</div>

                <div className="event-list">
                  {getEventsFor(date).map((event, index) => (
                    <Chip
                      key={index}
                      label={`${event.time} • ${event.title}`}
                      size="small"
                      className={`event-chip ${event.tone}`}
                    />
                  ))}
                  {getEventsFor(date).length === 0 && view === "Day" && (
                    <div className="muted-empty">No events scheduled</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ============================================
            New Event Dialog
      ============================================ */}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>New Event — {monthLabel}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Day of month"
            type="number"
            size="small"
            value={form.date}
            inputProps={{ min: 1, max: daysInMonth }}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          />
          <TextField
            label="Event title"
            size="small"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <TextField
            label="Time"
            size="small"
            placeholder="e.g. 02:00 PM"
            value={form.time}
            onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
          />
          <TextField
            select
            label="Color tag"
            size="small"
            value={form.tone}
            onChange={(e) => setForm((f) => ({ ...f, tone: e.target.value }))}
          >
            {toneOptions.map((t) => (
              <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" className="new-event-btn" onClick={handleAddEvent}>
            Add Event
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
};

export default Calendar;
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import {
  EventAvailable,
  TaskAlt,
  Notifications,
  NoteAlt,
  CalendarMonth,
  ExpandMore,
  ArrowForward,
  MoreHoriz,
  CheckCircle,
  RadioButtonUnchecked,
  Restaurant,
  Videocam,
  Groups,
  LocationOn,
  Edit,
  Description,
  Group,
  ChevronLeft,
  ChevronRight,
  NotificationsActive,
  PushPin,
  FormatQuote,
} from "@mui/icons-material";

import "../styles/Dashboard.css";

const initialStats = [
  { id: "meetings", label: "Meetings Today", value: 4, Icon: EventAvailable, action: "View all", route: "/meetings", tint: "tint-violet", iconColor: "icon-violet" },
  { id: "tasks", label: "Tasks", value: 9, Icon: TaskAlt, action: "View tasks", route: "/tasks", tint: "tint-emerald", iconColor: "icon-emerald" },
  { id: "reminders", label: "Reminders", value: 2, Icon: Notifications, action: "View all", route: "/reminders", tint: "tint-amber", iconColor: "icon-amber" },
  { id: "notes", label: "Notes", value: 6, Icon: NoteAlt, action: "View notes", route: "/notes", tint: "tint-sky", iconColor: "icon-sky" },
];

const initialSchedule = [
  { id: 1, time: "09:00 AM", title: "Morning Brief", meta: "15 min · Team", completed: true, tone: "success", Icon: CheckCircle },
  { id: 2, time: "10:30 AM", title: "Project Review", meta: "60 min · Conference Room A", completed: false, tone: "info", Icon: CalendarMonth },
  { id: 3, time: "01:00 PM", title: "Lunch Break", meta: "60 min · Personal", completed: false, tone: "warning", Icon: Restaurant },
  { id: 4, time: "03:00 PM", title: "Client Call", meta: "45 min · Zoom Meeting", completed: false, tone: "info", Icon: Videocam },
  { id: 5, time: "05:30 PM", title: "Team Meeting", meta: "30 min · Conference Room B", completed: false, tone: "info", Icon: Groups },
];

const initialReminders = [
  { id: 1, title: "Call Investor", time: "Today, 04:00 PM" },
  { id: 2, title: "Board Meeting", time: "Tomorrow, 11:00 AM" },
];

const initialNotes = [
  { id: 1, title: "Q3 Strategy Discussion", meta: "Updated 2h ago", pinned: true },
  { id: 2, title: "Marketing Ideas", meta: "Updated yesterday", pinned: false },
];

const quickActions = [
  { label: "Add Meeting", route: "/meetings", Icon: CalendarMonth, color: "icon-violet" },
  { label: "Add Task", route: "/tasks", Icon: TaskAlt, color: "icon-emerald" },
  { label: "Add Reminder", route: "/reminders", Icon: NotificationsActive, color: "icon-amber" },
  { label: "Add Note", route: "/notes", Icon: NoteAlt, color: "icon-rose" },
];

const quotes = [
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
];

const toneStyles = {
  success: "badge-success",
  info: "badge-info",
  warning: "badge-warning",
};

/* =====================================================
   Time-based greeting helper — richer, varied emoji sets
===================================================== */

const GREETING_SETS = {
  morning:   { greeting: "Good Morning",   emojis: ["🌞"] },
  afternoon: { greeting: "Good Afternoon", emojis: [ "😎"] },
  evening:   { greeting: "Good Evening",   emojis: ["🌆"] },
  night:     { greeting: "Good Night",     emojis: ["🌙"] },
};

function getTimeInfo() {
  const hour = new Date().getHours();

  let key = "night";
  if (hour >= 5 && hour < 12) key = "morning";
  else if (hour >= 12 && hour < 17) key = "afternoon";
  else if (hour >= 17 && hour < 21) key = "evening";

  const set = GREETING_SETS[key];
  const emoji = set.emojis[Math.floor(Math.random() * set.emojis.length)];

  return { greeting: set.greeting, emoji };
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [schedule, setSchedule] = useState(initialSchedule);
  const [reminders] = useState(initialReminders);
  const [notes] = useState(initialNotes);
  const [openMenu, setOpenMenu] = useState(null); // which "..." menu is open
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [calendarDate, setCalendarDate] = useState(new Date(2026, 5, 29)); // June 29 2026
  const [selectedDate, setSelectedDate] = useState(29);
  const [timeInfo, setTimeInfo] = useState(getTimeInfo());

  // Re-check the time every 60 seconds so the greeting updates live
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeInfo(getTimeInfo());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const formattedToday = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, []);

  const stats = useMemo(() => initialStats, []);

  const nextMeeting = schedule.find((e) => !e.completed && e.tone === "info");

  const toggleScheduleItem = (id) => {
    setSchedule((prev) =>
      prev.map((e) => (e.id === id ? { ...e, completed: !e.completed } : e))
    );
  };

  const toggleMenu = (key) => {
    setOpenMenu((prev) => (prev === key ? null : key));
  };

  const goTo = (route) => () => navigate(route);

  return (
    <div className="lavender-page">
      {/* Greeting */}
      <div className="dash-row-between dash-wrap dash-gap-4 mb-6">
        <div>
          <h1 className="greeting-title">
            {timeInfo.greeting}, Boss <span className="greeting-emoji">{timeInfo.emoji}</span>
          </h1>
          <p className="muted mt-1">Here's what's happening today.</p>
        </div>
        <button className="date-pill" onClick={goTo("/calendar")}>
          <CalendarMonth className="icon-violet icon-sm" />
          {formattedToday}
          <ExpandMore className="icon-muted icon-sm" />
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid mb-6">
        {stats.map((s) => {
          const StatIcon = s.Icon;
          return (
            <div key={s.label} className="glass-card stat-card">
              <div className={`stat-icon-box ${s.tint}`}>
                <StatIcon className={`${s.iconColor} icon-lg`} />
              </div>
              <div className="muted text-sm">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              <button className="link-action mt-3" onClick={goTo(s.route)}>
                {s.action} <ArrowForward className="icon-xs" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Middle row */}
      <div className="middle-grid mb-6">
        {/* Schedule */}
        <section className="glass-card p-6 card-flex">
          <div className="dash-row-between mb-4">
            <h2 className="section-title">Today's Schedule</h2>
            <div className="menu-wrap">
              <button className="icon-btn-ghost" onClick={() => toggleMenu("schedule")}>
                <MoreHoriz />
              </button>
              {openMenu === "schedule" && (
                <div className="mini-menu">
                  <button onClick={() => setSchedule(initialSchedule)}>Reset schedule</button>
                  <button onClick={goTo("/calendar")}>Open calendar</button>
                </div>
              )}
            </div>
          </div>

          <div className="schedule-wrap">
            <div className="schedule-line" />
            <ul className="schedule-list">
              {schedule.map((e) => {
                const RowIcon = e.Icon;
                const status = e.completed ? "Completed" : e.tone === "warning" ? "Break" : "Upcoming";
                const tone = e.completed ? "success" : e.tone;
                return (
                  <li key={e.id} className="schedule-item">
                    <div className="schedule-time">{e.time}</div>
                    <div className={`schedule-dot dot-${tone}`} />
                    <div className="flex-1 min-w-0">
                      <div className="schedule-title">{e.title}</div>
                      <div className="schedule-meta">{e.meta}</div>
                    </div>
                    <span className={`badge ${toneStyles[tone]}`}>{status}</span>
                    <button
                      className="icon-toggle-btn"
                      onClick={() => toggleScheduleItem(e.id)}
                      aria-label="Toggle complete"
                    >
                      {e.completed ? (
                        <CheckCircle className="icon-sm icon-emerald" />
                      ) : (
                        <RadioButtonUnchecked className="icon-muted icon-sm" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <button className="link-action-block mt-5" onClick={goTo("/calendar")}>
            View Full Calendar <ArrowForward className="icon-xs" />
          </button>
        </section>

        {/* Next Meeting */}
        <section className="glass-card p-6 card-flex">
          <div className="dash-row-between mb-4">
            <h2 className="section-title">Next Meeting</h2>
            <div className="menu-wrap">
              <button className="icon-btn-ghost" onClick={() => toggleMenu("meeting")}>
                <MoreHoriz />
              </button>
              {openMenu === "meeting" && (
                <div className="mini-menu">
                  <button onClick={goTo("/meetings")}>Reschedule</button>
                  <button onClick={goTo("/meetings")}>Cancel meeting</button>
                </div>
              )}
            </div>
          </div>

          <div className="meeting-center">
            <div className="meeting-icon-box">
              <CalendarMonth className="icon-violet" style={{ fontSize: 32 }} />
            </div>
            <div className="meeting-title">{nextMeeting ? nextMeeting.title : "No upcoming meetings"}</div>
            <div className="muted text-sm mt-1">10:30 AM – 11:30 AM (60 min)</div>
            <div className="muted text-sm mt-1 dash-row dash-gap-1">
              <LocationOn className="icon-xs" /> Conference Room A
            </div>

            <div className="avatars dash-row mt-5">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="avatar-bubble" style={{ marginLeft: i > 0 ? -8 : 0 }}>
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
              <div className="avatar-bubble avatar-more" style={{ marginLeft: -8 }}>+3</div>
            </div>

            <button className="btn-gradient mt-5" onClick={goTo("/meetings")}>
              <Videocam className="icon-sm" /> Join Meeting
            </button>

            <div className="action-row mt-3">
              <button className="action-square" onClick={goTo("/meetings")} aria-label="Edit meeting">
                <Edit className="icon-muted icon-sm" />
              </button>
              <button className="action-square" onClick={goTo("/notes")} aria-label="Meeting notes">
                <Description className="icon-muted icon-sm" />
              </button>
              <button className="action-square" onClick={goTo("/meetings")} aria-label="Attendees">
                <Group className="icon-muted icon-sm" />
              </button>
              <button className="action-square" onClick={() => toggleMenu("meetingMore")} aria-label="More options">
                <MoreHoriz className="icon-muted icon-sm" />
              </button>
            </div>
          </div>
        </section>

        {/* Calendar + Quick Actions */}
        <section className="stack-5">
          <MiniCalendar
            calendarDate={calendarDate}
            setCalendarDate={setCalendarDate}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
          <div className="glass-card p-5">
            <h3 className="section-title-sm mb-3">Quick Actions</h3>
            <div className="quick-actions-list">
              {quickActions.map((q) => {
                const QIcon = q.Icon;
                return (
                  <button key={q.label} className="quick-action-btn" onClick={goTo(q.route)}>
                    <QIcon className={`${q.color} icon-sm`} />
                    <span className="flex-1 text-left">{q.label}</span>
                    <ArrowForward className="icon-muted icon-xs" />
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* Bottom row — Tasks Overview removed, now 3 cards */}
      <div className="bottom-grid">
        <section className="glass-card p-6 card-flex">
          <h3 className="section-title-sm mb-4">Reminders</h3>
          <ul className="stack-3">
            {reminders.map((r) => (
              <li key={r.id} className="list-row">
                <div className="list-icon-box bg-amber-100">
                  <Notifications className="icon-amber icon-sm" />
                </div>
                <div className="min-w-0">
                  <div className="row-title">{r.title}</div>
                  <div className="muted text-xs">{r.time}</div>
                </div>
              </li>
            ))}
          </ul>
          <button className="link-action-block mt-5" onClick={goTo("/reminders")}>
            View All Reminders <ArrowForward className="icon-xs" />
          </button>
        </section>

        <section className="glass-card p-6 card-flex">
          <h3 className="section-title-sm mb-4">Notes</h3>
          <ul className="stack-3">
            {notes.map((n) => (
              <li key={n.id} className="list-row">
                <div className="min-w-0 flex-1">
                  <div className="row-title">{n.title}</div>
                  <div className="muted text-xs">{n.meta}</div>
                </div>
                {n.pinned && <PushPin className="icon-violet icon-sm" />}
              </li>
            ))}
          </ul>
          <button className="link-action-block mt-5" onClick={goTo("/notes")}>
            View All Notes <ArrowForward className="icon-xs" />
          </button>
        </section>

        <section className="glass-card p-6 quote-card card-flex">
          <FormatQuote className="icon-violet-light" style={{ fontSize: 48, marginBottom: -10 }} />
          <p className="quote-text">{quotes[quoteIndex].text}</p>
          <p className="muted text-sm mt-3">– {quotes[quoteIndex].author}</p>
          <svg className="quote-wave" viewBox="0 0 200 40" preserveAspectRatio="none">
            <path d="M0 30 Q 50 10 100 25 T 200 20 V40 H0 Z" fill="rgba(167,139,250,0.25)" />
            <path d="M0 35 Q 60 20 120 30 T 200 28 V40 H0 Z" fill="rgba(124,58,237,0.18)" />
          </svg>
          <div className="quote-dots">
            {quotes.map((_, i) => (
              <button
                key={i}
                className={`dot-tiny-btn ${i === quoteIndex ? "dot-tiny-active" : ""}`}
                onClick={() => setQuoteIndex(i)}
                aria-label={`Quote ${i + 1}`}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function MiniCalendar({ calendarDate, setCalendarDate, selectedDate, setSelectedDate }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  const monthLabel = calendarDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Mon = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const blanks = Array.from({ length: firstDayIndex }, (_, i) => null);
  const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const goPrevMonth = () => setCalendarDate(new Date(year, month - 1, 1));
  const goNextMonth = () => setCalendarDate(new Date(year, month + 1, 1));

  return (
    <div className="glass-card p-5">
      <div className="dash-row-between mb-3">
        <div className="font-bold">{monthLabel}</div>
        <div className="dash-row dash-gap-1">
          <button className="cal-nav-btn" onClick={goPrevMonth}>
            <ChevronLeft className="icon-sm" />
          </button>
          <button className="cal-nav-btn" onClick={goNextMonth}>
            <ChevronRight className="icon-sm" />
          </button>
        </div>
      </div>
      <div className="cal-days-header">
        {days.map((d) => <div key={d}>{d}</div>)}
      </div>
      <div className="cal-dates-grid">
        {blanks.map((_, i) => <div key={`b${i}`} />)}
        {dates.map((d) => (
          <button
            key={d}
            className={`cal-date ${d === selectedDate ? "cal-date-active" : ""}`}
            onClick={() => setSelectedDate(d)}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}
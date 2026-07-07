import { useState } from "react";
import {
  SettingsRounded,
  PersonRounded,
  NotificationsRounded,
  PaletteRounded,
  SecurityRounded,
  LanguageRounded,
  Save,
  PhotoCamera,
  Visibility,
  VisibilityOff,
  DeleteForever,
  CheckCircle,
} from "@mui/icons-material";

import "../styles/Dashboard.css";
import "../styles/Settings.css";

const TABS = [
  { id: "profile", label: "Profile", icon: PersonRounded },
  { id: "notifications", label: "Notifications", icon: NotificationsRounded },
  { id: "appearance", label: "Appearance", icon: PaletteRounded },
  { id: "security", label: "Security", icon: SecurityRounded },
  { id: "preferences", label: "Preferences", icon: LanguageRounded },
];

const initialProfile = {
  name: "John Doe",
  email: "john.doe@executivehub.com",
  role: "Administrator",
  phone: "+1 (555) 123-4567",
  avatar: "https://i.pravatar.cc/150?img=12",
};

const initialNotifications = {
  emailMeetings: true,
  emailTasks: true,
  emailReminders: false,
  pushMeetings: true,
  pushTasks: false,
  pushReminders: true,
  weeklyDigest: true,
};

const THEME_OPTIONS = [
  { id: "light", label: "Light", swatch: "#FFFFFF" },
  { id: "dark", label: "Dark", swatch: "#1E1B2E" },
  { id: "system", label: "System", swatch: "linear-gradient(135deg, #FFFFFF 50%, #1E1B2E 50%)" },
];

const ACCENT_OPTIONS = [
  { id: "violet", color: "#7C3AED" },
  { id: "rose", color: "#E11D48" },
  { id: "emerald", color: "#059669" },
  { id: "sky", color: "#0284C7" },
  { id: "amber", color: "#D97706" },
];

const LANGUAGES = ["English (US)", "English (UK)", "Spanish", "French", "German", "Hindi"];
const TIMEZONES = [
  "(GMT-08:00) Pacific Time",
  "(GMT-05:00) Eastern Time",
  "(GMT+00:00) London",
  "(GMT+01:00) Berlin",
  "(GMT+05:30) India Standard Time",
  "(GMT+09:00) Tokyo",
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState(initialProfile);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [theme, setTheme] = useState("light");
  const [accent, setAccent] = useState("violet");
  const [compactMode, setCompactMode] = useState(false);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [timezone, setTimezone] = useState(TIMEZONES[0]);
  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [twoFactor, setTwoFactor] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const showSavedToast = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const updateProfileField = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateProfileField("avatar", url);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    showSavedToast();
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!passwords.current || !passwords.next) return;
    if (passwords.next !== passwords.confirm) {
      alert("New password and confirmation do not match.");
      return;
    }
    setPasswords({ current: "", next: "", confirm: "" });
    showSavedToast();
  };

  return (
    <div className="lavender-page">
      {/* Header */}
      <div className="meet-header mb-6">
        <div className="settings-header-left">
          <div className="meet-header-icon">
            <SettingsRounded className="icon-violet" style={{ fontSize: 26 }} />
          </div>
          <div>
            <h1 className="greeting-title" style={{ fontSize: "1.5rem" }}>Settings</h1>
            <p className="muted text-sm mt-1">Manage your account, preferences, and workspace</p>
          </div>
        </div>
      </div>

      <div className="settings-layout">
        {/* Tabs */}
        <nav className="settings-tabs glass-card">
          {TABS.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                className={`settings-tab-btn ${isActive ? "settings-tab-active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <TabIcon style={{ fontSize: 20 }} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <div className="settings-content">

          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <form className="glass-card p-6 settings-panel" onSubmit={handleSaveProfile}>
              <h2 className="section-title mb-4">Profile Information</h2>

              <div className="settings-avatar-row">
                <div className="settings-avatar-wrap">
                  <img src={profile.avatar} alt="Avatar" className="settings-avatar-img" />
                  <label className="settings-avatar-upload" title="Change photo">
                    <PhotoCamera style={{ fontSize: 16 }} />
                    <input type="file" accept="image/*" hidden onChange={handleAvatarChange} />
                  </label>
                </div>
                <div>
                  <div className="settings-avatar-name">{profile.name}</div>
                  <div className="muted text-sm">{profile.role}</div>
                </div>
              </div>

              <div className="settings-form-grid">
                <div className="settings-field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => updateProfileField("name", e.target.value)}
                  />
                </div>

                <div className="settings-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => updateProfileField("email", e.target.value)}
                  />
                </div>

                <div className="settings-field">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => updateProfileField("phone", e.target.value)}
                  />
                </div>

                <div className="settings-field">
                  <label>Role</label>
                  <input type="text" value={profile.role} disabled />
                </div>
              </div>

              <button type="submit" className="btn-gradient settings-save-btn">
                <Save style={{ fontSize: 18 }} /> Save Changes
              </button>
            </form>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <div className="glass-card p-6 settings-panel">
              <h2 className="section-title mb-4">Notification Preferences</h2>

              <p className="settings-group-label">Email Notifications</p>
              <ToggleRow
                label="Meeting reminders"
                checked={notifications.emailMeetings}
                onChange={() => toggleNotification("emailMeetings")}
              />
              <ToggleRow
                label="Task updates"
                checked={notifications.emailTasks}
                onChange={() => toggleNotification("emailTasks")}
              />
              <ToggleRow
                label="Reminder alerts"
                checked={notifications.emailReminders}
                onChange={() => toggleNotification("emailReminders")}
              />

              <p className="settings-group-label" style={{ marginTop: 24 }}>Push Notifications</p>
              <ToggleRow
                label="Meeting reminders"
                checked={notifications.pushMeetings}
                onChange={() => toggleNotification("pushMeetings")}
              />
              <ToggleRow
                label="Task updates"
                checked={notifications.pushTasks}
                onChange={() => toggleNotification("pushTasks")}
              />
              <ToggleRow
                label="Reminder alerts"
                checked={notifications.pushReminders}
                onChange={() => toggleNotification("pushReminders")}
              />

              <p className="settings-group-label" style={{ marginTop: 24 }}>Digest</p>
              <ToggleRow
                label="Weekly summary email"
                checked={notifications.weeklyDigest}
                onChange={() => toggleNotification("weeklyDigest")}
              />

              <button className="btn-gradient settings-save-btn" onClick={showSavedToast}>
                <Save style={{ fontSize: 18 }} /> Save Changes
              </button>
            </div>
          )}

          {/* APPEARANCE TAB */}
          {activeTab === "appearance" && (
            <div className="glass-card p-6 settings-panel">
              <h2 className="section-title mb-4">Appearance</h2>

              <p className="settings-group-label">Theme</p>
              <div className="settings-theme-grid">
                {THEME_OPTIONS.map((t) => (
                  <button
                    key={t.id}
                    className={`settings-theme-card ${theme === t.id ? "settings-theme-active" : ""}`}
                    onClick={() => setTheme(t.id)}
                  >
                    <span className="settings-theme-swatch" style={{ background: t.swatch }} />
                    <span>{t.label}</span>
                    {theme === t.id && <CheckCircle className="icon-violet" style={{ fontSize: 18 }} />}
                  </button>
                ))}
              </div>

              <p className="settings-group-label" style={{ marginTop: 24 }}>Accent Color</p>
              <div className="settings-accent-row">
                {ACCENT_OPTIONS.map((a) => (
                  <button
                    key={a.id}
                    className={`settings-accent-dot ${accent === a.id ? "settings-accent-active" : ""}`}
                    style={{ background: a.color }}
                    onClick={() => setAccent(a.id)}
                    title={a.id}
                  />
                ))}
              </div>

              <p className="settings-group-label" style={{ marginTop: 24 }}>Layout</p>
              <ToggleRow
                label="Compact mode"
                sub="Reduce padding and spacing across the dashboard"
                checked={compactMode}
                onChange={() => setCompactMode((v) => !v)}
              />

              <button className="btn-gradient settings-save-btn" onClick={showSavedToast}>
                <Save style={{ fontSize: 18 }} /> Save Changes
              </button>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <form className="glass-card p-6 settings-panel" onSubmit={handleChangePassword}>
              <h2 className="section-title mb-4">Security</h2>

              <p className="settings-group-label">Change Password</p>

              <div className="settings-field">
                <label>Current Password</label>
                <div className="settings-password-wrap">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwords.current}
                    onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
                  />
                  <button
                    type="button"
                    className="settings-password-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <VisibilityOff style={{ fontSize: 18 }} /> : <Visibility style={{ fontSize: 18 }} />}
                  </button>
                </div>
              </div>

              <div className="settings-form-grid" style={{ marginTop: 12 }}>
                <div className="settings-field">
                  <label>New Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwords.next}
                    onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))}
                  />
                </div>
                <div className="settings-field">
                  <label>Confirm New Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwords.confirm}
                    onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                  />
                </div>
              </div>

              <button type="submit" className="btn-gradient settings-save-btn">
                <Save style={{ fontSize: 18 }} /> Update Password
              </button>

              <div className="settings-divider" />

              <p className="settings-group-label">Two-Factor Authentication</p>
              <ToggleRow
                label="Enable 2FA"
                sub="Add an extra layer of security to your account"
                checked={twoFactor}
                onChange={() => setTwoFactor((v) => !v)}
              />

              <div className="settings-divider" />

              <p className="settings-group-label" style={{ color: "#DC2626" }}>Danger Zone</p>
              <div className="settings-danger-box">
                <div>
                  <div className="settings-danger-title">Delete Account</div>
                  <div className="muted text-sm">This action is permanent and cannot be undone.</div>
                </div>
                <input
                  type="text"
                  className="settings-danger-input"
                  placeholder='Type "DELETE" to confirm'
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                />
                <button
                  type="button"
                  className="settings-danger-btn"
                  disabled={deleteConfirm !== "DELETE"}
                >
                  <DeleteForever style={{ fontSize: 18 }} /> Delete My Account
                </button>
              </div>
            </form>
          )}

          {/* PREFERENCES TAB */}
          {activeTab === "preferences" && (
            <div className="glass-card p-6 settings-panel">
              <h2 className="section-title mb-4">Preferences</h2>

              <div className="settings-field">
                <label>Language</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div className="settings-field" style={{ marginTop: 16 }}>
                <label>Timezone</label>
                <select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>

              <button className="btn-gradient settings-save-btn" onClick={showSavedToast}>
                <Save style={{ fontSize: 18 }} /> Save Changes
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Saved toast */}
      {savedToast && (
        <div className="settings-toast">
          <CheckCircle style={{ fontSize: 18 }} />
          <span>Settings saved successfully</span>
        </div>
      )}
    </div>
  );
}

function ToggleRow({ label, sub, checked, onChange }) {
  return (
    <div className="settings-toggle-row">
      <div>
        <div className="settings-toggle-label">{label}</div>
        {sub && <div className="muted text-xs">{sub}</div>}
      </div>
      <button
        className={`settings-switch ${checked ? "settings-switch-on" : ""}`}
        onClick={onChange}
        type="button"
        role="switch"
        aria-checked={checked}
      >
        <span className="settings-switch-thumb" />
      </button>
    </div>
  );
}
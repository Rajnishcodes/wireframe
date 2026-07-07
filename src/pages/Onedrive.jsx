import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/Sidebar.css";

import {
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  InputAdornment,
} from "@mui/material";

import {
  ChevronLeft,
  ChevronRight,
  DashboardRounded,
  CalendarMonthRounded,
  EventRounded,
  AssignmentRounded,
  NotificationsRounded,
  StickyNote2Rounded,
  SettingsRounded,
  WorkspacePremiumRounded,
  TrendingUpRounded,
  CloudRounded,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

import SidebarItem from "../components/SidebarItem";

const Sidebar = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();

  const [active, setActive] = useState("dashboard");

  // OneDrive login modal state
  const [oneDriveDialogOpen, setOneDriveDialogOpen] = useState(false);
  const [oneDriveEmail, setOneDriveEmail] = useState("");
  const [oneDrivePassword, setOneDrivePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [oneDriveError, setOneDriveError] = useState("");

  const menuItems = [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: <DashboardRounded />,
    },
    {
      id: "calendar",
      title: "Calendar",
      icon: <CalendarMonthRounded />,
    },
    {
      id: "meetings",
      title: "Meetings",
      icon: <EventRounded />,
    },
    {
      id: "tasks",
      title: "Tasks",
      icon: <AssignmentRounded />,
    },
    {
      id: "reminders",
      title: "Reminders",
      icon: <NotificationsRounded />,
    },
    {
      id: "notes",
      title: "Notes",
      icon: <StickyNote2Rounded />,
    },
    {
      id: "onedrive",
      title: "OneDrive",
      icon: <CloudRounded />,
    },
    {
      id: "settings",
      title: "Settings",
      icon: <SettingsRounded />,
    },
  ];

  const handleMenuClick = (item) => {
    setActive(item.id);

    // OneDrive now opens a credentials modal instead of launching directly
    if (item.id === "onedrive") {
      setOneDriveError("");
      setOneDriveDialogOpen(true);
      return;
    }

    if (item.id === "settings") {
      navigate("/settings");
      return;
    }

    navigate(`/${item.id}`);
  };

  const closeOneDriveDialog = () => {
    setOneDriveDialogOpen(false);
    setOneDriveEmail("");
    setOneDrivePassword("");
    setShowPassword(false);
    setOneDriveError("");
  };

  const handleOneDriveSubmit = (e) => {
    e.preventDefault();

    if (!oneDriveEmail.trim() || !oneDrivePassword.trim()) {
      setOneDriveError("Please enter both your email and password.");
      return;
    }

    // NOTE: this does not actually authenticate with Microsoft — it simply
    // captures credentials in the UI before opening the OneDrive site.
    // Real Microsoft sign-in happens on Microsoft's own login page once
    // OneDrive opens in a new tab.
    closeOneDriveDialog();

    // Opens in whatever browser the user is currently using — a webpage
    // cannot force a different browser to open due to browser security rules.
    window.open(
      "https://www.office.com/launch/onedrive",
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>

      {/* =========================
          HEADER
      ========================== */}

      <div className="sidebar-header">

        <div className="header-top">

          <div className="logo-wrapper">

            <div className="logo-icon">
              <WorkspacePremiumRounded />
            </div>

            {!collapsed && (
              <div className="logo-text">
                <h2>Executive Hub</h2>
                <span>Smart Productivity Workspace</span>
              </div>
            )}

          </div>

          <IconButton
            className="collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>

        </div>

      </div>

      {/* =========================
          WORKSPACE CARD
      ========================== */}

      {!collapsed && (
        <div className="workspace-card">

          <div className="workspace-icon">
            <TrendingUpRounded />
          </div>

          <div className="workspace-content">
            <h4>Workspace</h4>
            <p>Productivity 92%</p>

            <div className="workspace-progress">
              <div className="workspace-progress-fill"></div>
            </div>

          </div>

        </div>
      )}

      {/* =========================
          MENU TITLE
      ========================== */}

      {!collapsed && (
        <div className="sidebar-section-title">
          MAIN MENU
        </div>
      )}

      {/* =========================
          MENU
      ========================== */}

      <div className="sidebar-menu">

        {menuItems.map((item) => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            title={item.title}
            collapsed={collapsed}
            active={active === item.id}
            onClick={() => handleMenuClick(item)}
          />
        ))}

      </div>

      {/* =========================
          USER PROFILE
      ========================== */}

      <div className="sidebar-footer">

        <div className="sidebar-profile">

          <Avatar
            src="https://i.pravatar.cc/150?img=12"
            sx={{
              width: collapsed ? 42 : 48,
              height: collapsed ? 42 : 48,
            }}
          />

          {!collapsed && (
            <div className="sidebar-profile-info">
              <h4>John Doe</h4>
              <span>Administrator</span>
            </div>
          )}

        </div>

      </div>

      {/* =========================
          ONEDRIVE LOGIN MODAL
      ========================== */}

      <Dialog open={oneDriveDialogOpen} onClose={closeOneDriveDialog} fullWidth maxWidth="xs">
        <form onSubmit={handleOneDriveSubmit}>
          <DialogTitle>Sign in to OneDrive</DialogTitle>

          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Email or Phone"
              type="email"
              size="small"
              value={oneDriveEmail}
              onChange={(e) => setOneDriveEmail(e.target.value)}
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email style={{ fontSize: 18, color: "#9CA3AF" }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              size="small"
              value={oneDrivePassword}
              onChange={(e) => setOneDrivePassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock style={{ fontSize: 18, color: "#9CA3AF" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowPassword((v) => !v)}
                      edge="end"
                      tabIndex={-1}
                    >
                      {showPassword ? <VisibilityOff style={{ fontSize: 18 }} /> : <Visibility style={{ fontSize: 18 }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {oneDriveError && (
              <div style={{ color: "#DC2626", fontSize: "0.8125rem", fontWeight: 500 }}>
                {oneDriveError}
              </div>
            )}

            <p style={{ margin: 0, fontSize: "0.75rem", color: "#9CA3AF" }}>
              This opens OneDrive in a new tab in your current browser, where you'll complete sign-in securely on Microsoft's own login page.
            </p>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={closeOneDriveDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              Sign In
            </Button>
          </DialogActions>
        </form>
      </Dialog>

    </aside>
  );
};

export default Sidebar;
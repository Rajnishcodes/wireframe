import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Header.css";

import {
  Search,
  NotificationsNone,
  Settings,
  KeyboardArrowDown,
} from "@mui/icons-material";

import {
  Avatar,
  Badge,
  IconButton,
  TextField,
  InputAdornment,
  Menu as MuiMenu,
  MenuItem,
} from "@mui/material";

import { useAuth } from "../context/AuthContext";

// Human-friendly labels for each stored role value
const ROLE_LABELS = {
  superadmin: "Super Admin",
  admin: "Administrator",
  user: "Member",
};

export default function Header() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [profileAnchor, setProfileAnchor] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [settingsAnchor, setSettingsAnchor] = useState(null);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Real logged-in user data, pulled from AuthContext instead of hardcoded values
  const userFullName = user?.name || "";
  const userFirstName = userFullName.split(" ")[0] || "";
  const userRoleLabel = ROLE_LABELS[user?.role] || "Member";
  const userAvatar = user?.avatar || "https://i.pravatar.cc/150?img=12";

  const closeProfileMenu = () => setProfileAnchor(null);
  const closeSettingsMenu = () => setSettingsAnchor(null);

  const goToProfile = () => {
    closeProfileMenu();
    navigate("/profile");
  };

  const goToAccountSettings = () => {
    closeProfileMenu();
    navigate("/accountsettings");
  };

  const handleLogout = async () => {
    closeProfileMenu();

    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout request failed:", err.message);
    } finally {
      setUser(null);
      navigate("/login");
    }
  };

  const goToSettingsPage = () => {
    closeSettingsMenu();
    navigate("/settings");
  };

  return (
    <header className="header">

      {/* LEFT — shows only the user's first name */}
      <div className="header-left">
        <div>
          <h2>{userFirstName}</h2>
          <p>{today}</p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="header-right">

        {/* Search */}
        <TextField
          size="small"
          placeholder="Search..."
          className="search-box"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />

        {/* Notifications */}
        <IconButton
          className="header-icon"
          onClick={(e) => setNotificationAnchor(e.currentTarget)}
        >
          <Badge color="error" variant="dot">
            <NotificationsNone />
          </Badge>
        </IconButton>

        <MuiMenu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={() => setNotificationAnchor(null)}
        >
          <MenuItem>No new notifications</MenuItem>
        </MuiMenu>

        {/* Settings */}
        <IconButton
          className="header-icon"
          onClick={(e) => setSettingsAnchor(e.currentTarget)}
        >
          <Settings />
        </IconButton>

        <MuiMenu
          anchorEl={settingsAnchor}
          open={Boolean(settingsAnchor)}
          onClose={closeSettingsMenu}
        >
          <MenuItem onClick={goToSettingsPage}>Profile Settings</MenuItem>
          <MenuItem onClick={goToSettingsPage}>Preferences</MenuItem>
          <MenuItem onClick={goToSettingsPage}>Security</MenuItem>
        </MuiMenu>

        {/* Profile */}
        <div
          className="profile"
          onClick={(e) => setProfileAnchor(e.currentTarget)}
        >
          <Avatar
            src={userAvatar}
            sx={{ width: 42, height: 42 }}
          />

          <div className="profile-info">
            <h5>{userFullName}</h5>
            <span>{userRoleLabel}</span>
          </div>

          <KeyboardArrowDown />
        </div>

        <MuiMenu
          anchorEl={profileAnchor}
          open={Boolean(profileAnchor)}
          onClose={closeProfileMenu}
        >
          <MenuItem onClick={goToProfile}>My Profile</MenuItem>
          <MenuItem onClick={goToAccountSettings}>Account Settings</MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </MuiMenu>

      </div>

    </header>
  );
}
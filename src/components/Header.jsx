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

export default function Header() {
  const navigate = useNavigate();

  const [profileAnchor, setProfileAnchor] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [settingsAnchor, setSettingsAnchor] = useState(null);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Full user name lives here — swap this out for your actual auth/user data later
  const userFullName = "John Doe";
  const userFirstName = userFullName.split(" ")[0];

  const closeProfileMenu = () => setProfileAnchor(null);
  const closeSettingsMenu = () => setSettingsAnchor(null);

  const goToProfile = () => {
    closeProfileMenu();
    navigate("/profile");
  };

  const goToAccountSettings = () => {
    closeProfileMenu();
    navigate("/account-settings");
  };

  const handleLogout = () => {
    closeProfileMenu();
    // Placeholder — wire this to your real auth/logout logic later
    navigate("/login");
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
            src="https://i.pravatar.cc/150?img=12"
            sx={{ width: 42, height: 42 }}
          />

          <div className="profile-info">
            <h5>John Doe</h5>
            <span>Administrator</span>
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
import { useState } from "react";
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
          onClose={() => setSettingsAnchor(null)}
        >
          <MenuItem>Profile Settings</MenuItem>
          <MenuItem>Preferences</MenuItem>
          <MenuItem>Security</MenuItem>
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
          onClose={() => setProfileAnchor(null)}
        >
          <MenuItem>My Profile</MenuItem>
          <MenuItem>Account Settings</MenuItem>
          <MenuItem>Logout</MenuItem>
        </MuiMenu>

      </div>

    </header>
  );
}
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/Sidebar.css";

import { Avatar, IconButton } from "@mui/material";

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
} from "@mui/icons-material";

import SidebarItem from "./SidebarItem";

const Sidebar = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();

  const [active, setActive] = useState("dashboard");

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

    // Open OneDrive in a new tab
    if (item.id === "onedrive") {
      window.open(
        "https://www.office.com/launch/onedrive",
        "_blank",
        "noopener,noreferrer"
      );
      return;
    }

    // Settings page (if you create it later)
    if (item.id === "settings") {
      navigate("/settings");
      return;
    }

    // All other pages
    navigate(`/${item.id}`);
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

    </aside>
  );
};

export default Sidebar;
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/Sidebar.css";

import { IconButton } from "@mui/material";

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
} from "@mui/icons-material";

import SidebarItem from "./SidebarItem";

const Sidebar = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();

  const [active, setActive] = useState("dashboard");

  const menuItems = [
    { id: "dashboard", title: "Dashboard", icon: <DashboardRounded /> },
    { id: "calendar", title: "Calendar", icon: <CalendarMonthRounded /> },
    { id: "meetings", title: "Meetings", icon: <EventRounded /> },
    { id: "tasks", title: "Tasks", icon: <AssignmentRounded /> },
    { id: "reminders", title: "Reminders", icon: <NotificationsRounded /> },
    { id: "notes", title: "Notes", icon: <StickyNote2Rounded /> },
    { id: "settings", title: "Settings", icon: <SettingsRounded /> },
  ];

  return (
    <aside className={`sb-sidebar ${collapsed ? "sb-collapsed" : ""}`}>

      {/* Logo Section */}
      <div className="sb-header">
        <div className="sb-header-top">

          <div className="sb-logo-wrapper">
            <div className="sb-logo-icon">
              <WorkspacePremiumRounded />
            </div>

            {!collapsed && (
              <div className="sb-logo-text">
                <h2>Executive Hub</h2>
                <span>Premium Workspace</span>
              </div>
            )}
          </div>

          <IconButton
            className="sb-collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>

        </div>
      </div>

      {/* Navigation */}
      <div className="sb-menu">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            title={item.title}
            collapsed={collapsed}
            active={active === item.id}
            onClick={() => {
              setActive(item.id);

              if (item.id !== "settings") {
                navigate(`/${item.id}`);
              }
            }}
          />
        ))}
      </div>

    </aside>
  );
};

export default Sidebar;
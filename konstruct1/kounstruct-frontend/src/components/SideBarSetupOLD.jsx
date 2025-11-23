import React from "react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../ThemeContext";

// THEME CONSTANTS
const ORANGE = "#ea6822";
const ORANGE_DARK = "#e44a22";
const ORANGE_LIGHT = "#fff8f2";
const GOLD_DARK = "#facc15";

// Utility to extract normalized roles from USER_DATA
function getAllRoles() {
  const userString = localStorage.getItem("USER_DATA");
  if (!userString || userString === "undefined") return [];
  try {
    const userData = JSON.parse(userString);
    let roles = [];
    if (typeof userData.role === "string") roles.push(userData.role);
    if (Array.isArray(userData.roles)) {
      userData.roles.forEach((r) => {
        if (typeof r === "string") roles.push(r);
        else if (typeof r === "object" && r && r.role) roles.push(r.role);
      });
    }
    if (Array.isArray(userData.accesses)) {
      userData.accesses.forEach((a) => {
        if (Array.isArray(a.roles)) {
          a.roles.forEach((r) => {
            if (typeof r === "string") roles.push(r);
            else if (typeof r === "object" && r && r.role) roles.push(r.role);
          });
        }
      });
    }
    if (userData.superadmin) roles.push("Super Admin");
    if (userData.is_manager) roles.push("Manager");
    if (userData.is_client === false) roles.push("Admin");
    return [...new Set(roles)];
  } catch {
    return [];
  }
}

function SideBarSetup() {
  const { theme } = useTheme();
  const allRoles = getAllRoles();
  const rolee = (localStorage.getItem("ROLE") || "").toLowerCase();

  const isInitializer = allRoles.some(r => r === "Intializer" || r === "Initializer");
  if (isInitializer) return null;

  const badgeRole = allRoles[0] || "User";

  // Only for Manager (case-insensitive): Show restricted menu
  let navItems;
  if (rolee === "manager") {
    navItems = [
      { name: "User & Role", path: "/user" },
      { name: "Checklist", path: "/Checklist" },
      // { name: "All Checklists", path: "/all-checklists" },
      { name: "Category management", path: "/category-sidebar" },
    ];
  } else {
    navItems = [
      { name: "User Setup", path: "/user-setup" },
      { name: "Unit Setup", path: "/setup" },
      // { name: "CA Setup", path: "/casetup" },
      { name: "User & Role", path: "/user" },
      { name: "Checklist", path: "/Checklist" },
      { name: "Users Management", path: "/UsersManagement" },
      // { name: "All Checklists", path: "/all-checklists" },
      // { name: "Category management", path: "/category-sidebar" },
      // { name: "Escalation Setup", path: "/escalation-setup" },
      // { name: "Contractors", path: "/contractors" },
      // { name: "Geo Tag", path: "/geo-tag" },
      // { name: "Project Setup", path: "/project-setup" },
      // { name: "Import/Export", path: "/import-export" },
    ];
  }

  const palette = theme === "dark"
    ? {
        bg: "linear-gradient(135deg, #23232e, #181820 100%)",
        border: `3px solid ${GOLD_DARK}`,
        shadow: "0 4px 32px #fffbe022",
        title: GOLD_DARK,
        badgeBg: GOLD_DARK,
        badgeColor: "#181820",
        linkActiveBg: `linear-gradient(90deg, #fde047 80%, #facc15)`,
        linkActive: "#23232e",
        linkInactive: GOLD_DARK,
        linkBgInactive: "transparent",
        footer: GOLD_DARK
      }
    : {
        bg: `linear-gradient(135deg, ${ORANGE_LIGHT}, #fff)`,
        border: `3px solid ${ORANGE}`,
        shadow: "0 4px 32px #ea682220",
        title: ORANGE_DARK,
        badgeBg: ORANGE,
        badgeColor: "#fff",
        linkActiveBg: `linear-gradient(90deg, ${ORANGE} 80%, ${ORANGE_DARK})`,
        linkActive: "#fff",
        linkInactive: ORANGE_DARK,
        linkBgInactive: "#fff",
        footer: ORANGE_DARK
      };

  return (
    <div
      className="fixed w-[15%] h-screen shadow-lg p-4 flex flex-col"
      style={{
        background: palette.bg,
        borderRight: palette.border,
        boxShadow: palette.shadow,
        transition: "all 0.3s"
      }}
    >
      <div className="mb-6 text-center">
        <div
          className="text-lg font-bold tracking-wide"
          style={{
            color: palette.title,
            letterSpacing: "2px",
            transition: "color 0.3s"
          }}
        >
          Admin Panel
        </div>
        <div
          className="text-xs font-medium mt-1 px-2 py-1 rounded"
          style={{
            background: palette.badgeBg,
            color: palette.badgeColor,
            display: "inline-block",
            letterSpacing: "1px",
            transition: "all 0.3s"
          }}
        >
          {badgeRole}
        </div>
      </div>
      <nav className="space-y-2 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `block px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200`
            }
            style={({ isActive }) =>
              isActive
                ? {
                    background: palette.linkActiveBg,
                    color: palette.linkActive,
                    boxShadow: theme === "dark"
                      ? "0 2px 12px #fffbe022"
                      : "0 2px 12px #ea682238",
                  }
                : {
                    color: palette.linkInactive,
                    background: palette.linkBgInactive,
                  }
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
      <div className="mt-8 text-xs text-center" style={{ color: palette.footer }}>
        &copy; {new Date().getFullYear()} Your Company
      </div>
    </div>
  );
}

export default SideBarSetup;

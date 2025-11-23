// import React from "react";
// import { NavLink } from "react-router-dom";
// import { useTheme } from "../ThemeContext";

// // Only these colors!
// const ORANGE = "#ffbe63";
// const BG_OFFWHITE = "#fcfaf7";

// const ROLE_MENUS = {
//   ADMIN: [
//     { name: "Projects", path: "/config" },
//     { name: "Initialize Checklist", path: "/Initialize-Checklist" },
//     { name: "Pending Inspector Checklist", path: "/PendingInspector-Checklist" },
//     { name: "Pending For Maker Items", path: "/Pending-For-MakerItems" },
//     { name: "Pending Supervisor Items", path: "/PendingSupervisorItems" },
//     { name: "Users Management", path: "/UsersManagement" },
//   ],
//   MANAGER: [
//     { name: "Projects", path: "/config" },
//     { name: "Initialize Checklist", path: "/Initialize-Checklist" },
//     { name: "Purpose Management", path: "/create-purpose" },
//     { name: "Pending Inspector Checklist", path: "/PendingInspector-Checklist" },
//     { name: "Pending For Maker Items", path: "/Pending-For-MakerItems" },
//     { name: "Pending Supervisor Items", path: "/PendingSupervisorItems" },
//     { name: "Users Management", path: "/UsersManagement" },
//   ],
//   SUPERADMIN: [
//     { name: "Projects", path: "/config" },
//     { name: "Initialize Checklist", path: "/Initialize-Checklist" },
//     { name: "Purpose Management", path: "/create-purpose" },
//     { name: "Pending Inspector Checklist", path: "/PendingInspector-Checklist" },
//     { name: "Pending For Maker Items", path: "/Pending-For-MakerItems" },
//     { name: "Pending Supervisor Items", path: "/PendingSupervisorItems" },
//     { name: "Users Management", path: "/UsersManagement" },
//   ],
//   INTIALIZER: [{ name: "Initialize Checklist", path: "/Initialize-Checklist" }],
//   INSPECTOR: [
//     { name: "Pending Inspector Checklist", path: "/PendingInspector-Checklist" },
//   ],
//   CHECKER: [
//     { name: "Pending Inspector Checklist", path: "/PendingInspector-Checklist" },
//   ],
//   MAKER: [{ name: "Pending For Maker Items", path: "/Pending-For-MakerItems" }],
//   SUPERVISOR: [
//     { name: "Pending Supervisor Items", path: "/PendingSupervisorItems" },
//   ],
// };

// function getUserRole() {
//   try {
//     return (localStorage.getItem("ROLE") || "").trim().toUpperCase();
//   } catch {
//     return "";
//   }
// }

// function SiteBarHome() {
//   const { theme } = useTheme();
//   const userRole = getUserRole();

//   // --- Palette: Only these variables
//   const bgColor = theme === "dark" ? "#191922" : BG_OFFWHITE;
//   const cardColor = theme === "dark" ? "#23232c" : "#fff";
//   const borderColor = ORANGE;
//   const textColor = theme === "dark" ? "#fff" : "#222";
//   const iconColor = ORANGE; // Not used here, but available!

//   // Pick nav based on role
//   let navItems = [];
//   if (
//     userRole === "ADMIN" ||
//     userRole === "MANAGER" ||
//     userRole === "SUPERADMIN"
//   ) {
//     navItems = ROLE_MENUS.ADMIN;
//   } else if (ROLE_MENUS[userRole]) {
//     navItems = ROLE_MENUS[userRole];
//   }

//   return (
//    <div
//   className="fixed h-screen shadow-lg p-4 flex flex-col"
//   style={{
//     width: 240, // px, match the SIDEBAR_WIDTH!
//     background: bgColor,
//     borderRight: `3px solid ${borderColor}`,
//     boxShadow: "0 4px 32px #0002",
//     transition: "all 0.3s",
//     zIndex: 50,
//   }}
// >

//       <div className="mb-6 text-center">
//         <div
//           className="text-lg font-bold tracking-wide"
//           style={{ color: borderColor, letterSpacing: "2px" }}
//         >
//           Main Menu
//         </div>
//       </div>
//       <nav className="space-y-2 flex-1">
//         {navItems.map((item) => (
//           <NavLink
//             key={item.name}
//             to={item.path}
//             className="block px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200"
//             style={({ isActive }) =>
//               isActive
//                 ? {
//                     background: borderColor,
//                     color: "#fff",
//                   }
//                 : {
//                     color: textColor,
//                     background: cardColor,
//                   }
//             }
//           >
//             {item.name}
//           </NavLink>
//         ))}
//       </nav>
//       <div
//         className="mt-8 text-xs text-center"
//         style={{ color: borderColor }}
//       >
//         &copy; {new Date().getFullYear()} Your Company
//       </div>
//     </div>
//   );
// }

// // export default SiteBarHome;
// import React from "react";
// import { NavLink } from "react-router-dom";
// import { useTheme } from "../ThemeContext";
// import { useSidebar } from "./SidebarContext"; // <-- Added for push-content sync

// // Only these colors!
// const ORANGE = "#ffbe63";
// const BG_OFFWHITE = "#fcfaf7";
// const SIDEBAR_WIDTH = 240; // px, must match everywhere

// const ROLE_MENUS = {
//   ADMIN: [
//     { name: "Projects", path: "/config" },
//     { name: "Initialize Checklist", path: "/Initialize-Checklist" },
//     {
//       name: "Pending Inspector Checklist",
//       path: "/PendingInspector-Checklist",
//     },
//     { name: "Pending For Maker Items", path: "/Pending-For-MakerItems" },
//     { name: "Pending Supervisor Items", path: "/PendingSupervisorItems" },
//     { name: "Users Management", path: "/UsersManagement" },
//   ],
//   MANAGER: [
//     { name: "Projects", path: "/config" },
//     { name: "Initialize Checklist", path: "/Initialize-Checklist" },
//     { name: "Purpose Management", path: "/create-purpose" },
//     {
//       name: "Pending Inspector Checklist",
//       path: "/PendingInspector-Checklist",
//     },
//     { name: "Pending For Maker Items", path: "/Pending-For-MakerItems" },
//     { name: "Pending Supervisor Items", path: "/PendingSupervisorItems" },
//     { name: "Users Management", path: "/UsersManagement" },
//   ],
//   SUPERADMIN: [
//     { name: "Projects", path: "/config" },
//     { name: "Initialize Checklist", path: "/Initialize-Checklist" },
//     { name: "Purpose Management", path: "/create-purpose" },
//     {
//       name: "Pending Inspector Checklist",
//       path: "/PendingInspector-Checklist",
//     },
//     { name: "Pending For Maker Items", path: "/Pending-For-MakerItems" },
//     { name: "Pending Supervisor Items", path: "/PendingSupervisorItems" },
//     { name: "Users Management", path: "/UsersManagement" },
//   ],
//   INTIALIZER: [{ name: "Initialize Checklist", path: "/Initialize-Checklist" }],
//   INSPECTOR: [
//     {
//       name: "Pending Inspector Checklist",
//       path: "/PendingInspector-Checklist",
//     },
//   ],
//   CHECKER: [
//     {
//       name: "Pending Inspector Checklist",
//       path: "/PendingInspector-Checklist",
//     },
//   ],
//   MAKER: [{ name: "Pending For Maker Items", path: "/Pending-For-MakerItems" }],
//   SUPERVISOR: [
//     { name: "Pending Supervisor Items", path: "/PendingSupervisorItems" },
//   ],
// };

// function getUserRole() {
//   try {
//     return (localStorage.getItem("ROLE") || "").trim().toUpperCase();
//   } catch {
//     return "";
//   }
// }

// function SiteBarHome() {
//   const { theme } = useTheme();
//   const { sidebarOpen } = useSidebar(); // <-- This syncs sidebar with hamburger/menu
//   const userRole = getUserRole();

//   // Palette colors
//   const bgColor = theme === "dark" ? "#191922" : BG_OFFWHITE;
//   const cardColor = theme === "dark" ? "#23232c" : "#fff";
//   const borderColor = ORANGE;
//   const textColor = theme === "dark" ? "#fff" : "#222";

//   // Pick nav based on role
//   let navItems = [];
//   if (
//     userRole === "ADMIN" ||
//     userRole === "MANAGER" ||
//     userRole === "SUPERADMIN"
//   ) {
//     navItems = ROLE_MENUS.ADMIN;
//   } else if (ROLE_MENUS[userRole]) {
//     navItems = ROLE_MENUS[userRole];
//   }

//   return (
//     <div
//       className="fixed h-screen shadow-lg p-4 flex flex-col"
//       style={{
//         width: SIDEBAR_WIDTH,
//         background: bgColor,
//         borderRight: `3px solid ${borderColor}`,
//         boxShadow: "0 4px 32px #0002",
//         transition: "transform 0.35s cubic-bezier(.6,-0.17,.22,1.08)",
//         zIndex: 1000,
//         top: 0,
//         left: 0,
//         transform: sidebarOpen
//           ? "translateX(0)"
//           : `translateX(-${SIDEBAR_WIDTH}px)`, // <-- This is the magic!
//       }}
//     >
//       <div className="mb-6 text-center">
//         <div
//           className="text-lg font-bold tracking-wide"
//           style={{ color: borderColor, letterSpacing: "2px" }}
//         >
//           Main Menu
//         </div>
//       </div>
//       <nav className="space-y-2 flex-1">
//         {navItems.map((item) => (
//           <NavLink
//             key={item.name}
//             to={item.path}
//             className="block px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200"
//             style={({ isActive }) =>
//               isActive
//                 ? {
//                     background: borderColor,
//                     color: "#fff",
//                   }
//                 : {
//                     color: textColor,
//                     background: cardColor,
//                   }
//             }
//           >
//             {item.name}
//           </NavLink>
//         ))}
//       </nav>
//       <div className="mt-8 text-xs text-center" style={{ color: borderColor }}>
//         &copy; {new Date().getFullYear()} Your Company
//       </div>
//     </div>
//   );
// }

// export default SiteBarHome;



// import React from "react";
// import { NavLink } from "react-router-dom";
// import { useTheme } from "../ThemeContext";

// // Only these colors!
// const ORANGE = "#ffbe63";
// const BG_OFFWHITE = "#fcfaf7";

// const ROLE_MENUS = {
//   ADMIN: [
//     { name: "Projects", path: "/config" },
//     // { name: "Initialize Checklist", path: "/Initialize-Checklist" },
//     // { name: "Pending Inspector Checklist", path: "/PendingInspector-Checklist" },
//     // { name: "Pending For Maker Items", path: "/Pending-For-MakerItems" },
//     // { name: "Pending Supervisor Items", path: "/PendingSupervisorItems" },
//     { name: "Users Management", path: "/UsersManagement" },
//   ],
//   MANAGER: [
//     { name: "Projects", path: "/config" },
//     // { name: "Initialize Checklist", path: "/Initialize-Checklist" },
//     // { name: "Purpose Management", path: "/create-purpose" },
//     // { name: "Pending Inspector Checklist", path: "/PendingInspector-Checklist" },
//     // { name: "Pending For Maker Items", path: "/Pending-For-MakerItems" },
//     // { name: "Pending Supervisor Items", path: "/PendingSupervisorItems" },
//     { name: "Users Management", path: "/UsersManagement" },
//   ],
//   SUPERADMIN: [
//     { name: "Projects", path: "/config" },
//     // { name: "Initialize Checklist", path: "/Initialize-Checklist" },
//     // { name: "Purpose Management", path: "/create-purpose" },
//     // { name: "Pending Inspector Checklist", path: "/PendingInspector-Checklist" },
//     // { name: "Pending For Maker Items", path: "/Pending-For-MakerItems" },
//     // { name: "Pending Supervisor Items", path: "/PendingSupervisorItems" },
//     { name: "Users Management", path: "/UsersManagement" },
//   ],
//   // INTIALIZER: [{ name: "Initialize Checklist", path: "/Initialize-Checklist" }],
//   // INSPECTOR: [
//   //   {
//   //     name: "Pending Inspector Checklist",
//   //     path: "/PendingInspector-Checklist",
//   //   },
//   // ],
//   // CHECKER: [
//   //   {
//   //     name: "Pending Inspector Checklist",
//   //     path: "/PendingInspector-Checklist",
//   //   },
//   // ],
//   // MAKER: [{ name: "Pending For Maker Items", path: "/Pending-For-MakerItems" }],
//   // SUPERVISOR: [
//   //   { name: "Pending Supervisor Items", path: "/PendingSupervisorItems" },
//   // ],
// };

// function getUserRole() {
//   try {
//     return (localStorage.getItem("ROLE") || "").trim().toUpperCase();
//   } catch {
//     return "";
//   }
// }

// function SiteBarHome() {
//   const { theme } = useTheme();
//   const userRole = getUserRole();

//   // --- Palette: Only these variables
//   const bgColor = theme === "dark" ? "#191922" : BG_OFFWHITE;
//   const cardColor = theme === "dark" ? "#23232c" : "#fff";
//   const borderColor = ORANGE;
//   const textColor = theme === "dark" ? "#fff" : "#222";
//   const iconColor = ORANGE; // Not used here, but available!

//   // Pick nav based on role
//   let navItems = [];
//   if (
//     userRole === "ADMIN" ||
//     userRole === "MANAGER" ||
//     userRole === "SUPERADMIN"
//   ) {
//     navItems = ROLE_MENUS.ADMIN;
//   } else if (ROLE_MENUS[userRole]) {
//     navItems = ROLE_MENUS[userRole];
//   }

//   return (
//     <div
//       className="fixed h-screen shadow-lg p-4 flex flex-col"
//       style={{
//         width: 240, // px, match the SIDEBAR_WIDTH!
//         background: bgColor,
//         borderRight: `3px solid ${borderColor}`,
//         boxShadow: "0 4px 32px #0002",
//         transition: "all 0.3s",
//         zIndex: 50,
//       }}
//     >
//       <div className="mb-6 text-center">
//         <div
//           className="text-lg font-bold tracking-wide"
//           style={{ color: borderColor, letterSpacing: "2px" }}
//         >
//           Main Menu
//         </div>
//       </div>
//       <nav className="space-y-2 flex-1">
//         {navItems.map((item) => (
//           <NavLink
//             key={item.name}
//             to={item.path}
//             className="block px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200"
//             style={({ isActive }) =>
//               isActive
//                 ? {
//                     background: borderColor,
//                     color: "#fff",
//                   }
//                 : {
//                     color: textColor,
//                     background: cardColor,
//                   }
//             }
//           >
//             {item.name}
//           </NavLink>
//         ))}
//       </nav>
//       <div className="mt-8 text-xs text-center" style={{ color: borderColor }}>
//         &copy; {new Date().getFullYear()} Your Company
//       </div>
//     </div>
//   );
// }

// export default SiteBarHome;



import React from "react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../ThemeContext";

// Only these colors!
const ORANGE = "#ffbe63";
const BG_OFFWHITE = "#fcfaf7";

const ROLE_MENUS = {
  ADMIN: [
    { name: "Projects", path: "/config" },
    { name: "Users Management", path: "/UsersManagement" },
  ],
  MANAGER: [
    { name: "Projects", path: "/config" },
    { name: "Users Management", path: "/UsersManagement" },
  ],
  SUPERADMIN: [
    { name: "Projects", path: "/config" },
    { name: "Users Management", path: "/UsersManagement" },
  ],
  // Others can be added as needed
};

function getUserRole() {
  try {
    return (localStorage.getItem("ROLE") || "").trim().toUpperCase();
  } catch {
    return "";
  }
}

function SiteBarHome() {
  const { theme } = useTheme();
  const userRole = getUserRole();

  // List of roles that should NOT see the sidebar
  const HIDE_SIDEBAR_ROLES = [
    "INTIALIZER", // check your app, sometimes "INITIALIZER"
    "INITIALIZER",
    "CHECKER",
    "MAKER",
    "INSPECTOR",
    "SUPERVISOR"
  ];

  // Completely hide sidebar for these roles
  if (HIDE_SIDEBAR_ROLES.includes(userRole)) {
    return null;
  }

  // --- Palette
  const bgColor = theme === "dark" ? "#191922" : BG_OFFWHITE;
  const cardColor = theme === "dark" ? "#23232c" : "#fff";
  const borderColor = ORANGE;
  const textColor = theme === "dark" ? "#fff" : "#222";
  const iconColor = ORANGE; // Not used here, but available!

  // Pick nav based on role
  let navItems = [];
  if (
    userRole === "ADMIN" ||
    userRole === "MANAGER" ||
    userRole === "SUPERADMIN"
  ) {
    navItems = ROLE_MENUS.ADMIN;
  } else if (ROLE_MENUS[userRole]) {
    navItems = ROLE_MENUS[userRole];
  }

  return (
    <div
      className="fixed h-screen shadow-lg p-4 flex flex-col"
      style={{
        width: 240, // px, match the SIDEBAR_WIDTH!
        background: bgColor,
        borderRight: `3px solid ${borderColor}`,
        boxShadow: "0 4px 32px #0002",
        transition: "all 0.3s",
        zIndex: 50,
      }}
    >
      <div className="mb-6 text-center">
        <div
          className="text-lg font-bold tracking-wide"
          style={{ color: borderColor, letterSpacing: "2px" }}
        >
          Main Menu
        </div>
      </div>
      <nav className="space-y-2 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className="block px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200"
            style={({ isActive }) =>
              isActive
                ? {
                    background: borderColor,
                    color: "#fff",
                  }
                : {
                    color: textColor,
                    background: cardColor,
                  }
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
      <div className="mt-8 text-xs text-center" style={{ color: borderColor }}>
        &copy; {new Date().getFullYear()} Your Company
      </div>
    </div>
  );
}

export default SiteBarHome;

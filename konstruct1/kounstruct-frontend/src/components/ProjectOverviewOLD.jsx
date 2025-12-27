// // src/components/ProjectOverview.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import axios from "axios";
// import { useTheme } from "../ThemeContext";
// import toast from "react-hot-toast";
// import {
//   BarChart,
//   Bar,
//   LineChart,
//   Line,
//   AreaChart,
//   Area,
//   PieChart,
//   Pie,
//   Cell,
//   RadarChart,
//   PolarGrid,
//   PolarAngleAxis,
//   PolarRadiusAxis,
//   Radar,
//   ComposedChart,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";

// const API_BASE = "https://konstruct.world";

// const authHeaders = () => ({
//   Authorization: `Bearer ${
//     localStorage.getItem("ACCESS_TOKEN") ||
//     localStorage.getItem("TOKEN") ||
//     localStorage.getItem("token") ||
//     ""
//   }`,
// });

// // --------- small helpers ----------
// function safeNumber(n, fallback = 0) {
//   if (typeof n === "number" && !Number.isNaN(n)) return n;
//   const parsed = Number(n);
//   return Number.isNaN(parsed) ? fallback : parsed;
// }

// function pct(part, total) {
//   const p = safeNumber(part);
//   const t = safeNumber(total);
//   if (!t || t <= 0) return 0;
//   return Math.round((p / t) * 100);
// }

// function fmtInt(n) {
//   return safeNumber(n).toLocaleString("en-IN");
// }

// function titleCaseStatus(status) {
//   if (!status) return "-";
//   return String(status)
//     .toLowerCase()
//     .split("_")
//     .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
//     .join(" ");
// }

// function statusColor(status) {
//   const s = String(status || "").toLowerCase();

//   if (s === "completed") {
//     return {
//       bg: "rgba(16,185,129,0.15)",
//       border: "rgba(16,185,129,0.5)",
//       text: "#047857",
//       gradient: "linear-gradient(135deg, #10b981, #34d399)",
//       chartColor: "#10b981",
//     };
//   }
//   if (s === "pending_checker" || s === "pending_for_checker") {
//     return {
//       bg: "rgba(59,130,246,0.15)",
//       border: "rgba(59,130,246,0.5)",
//       text: "#1d4ed8",
//       gradient: "linear-gradient(135deg, #3b82f6, #60a5fa)",
//       chartColor: "#3b82f6",
//     };
//   }
//   if (s === "pending_for_inspector") {
//     return {
//       bg: "rgba(249,115,22,0.15)",
//       border: "rgba(249,115,22,0.5)",
//       text: "#c2410c",
//       gradient: "linear-gradient(135deg, #f97316, #fb923c)",
//       chartColor: "#f97316",
//     };
//   }
//   if (s === "not_started" || s === "created") {
//     return {
//       bg: "rgba(148,163,184,0.15)",
//       border: "rgba(148,163,184,0.5)",
//       text: "#475569",
//       gradient: "linear-gradient(135deg, #94a3b8, #cbd5e1)",
//       chartColor: "#94a3b8",
//     };
//   }
//   return {
//     bg: "rgba(148,163,184,0.15)",
//     border: "rgba(148,163,184,0.5)",
//     text: "#475569",
//     gradient: "linear-gradient(135deg, #94a3b8, #cbd5e1)",
//     chartColor: "#94a3b8",
//   };
// }

// function formatDateTime(dt) {
//   if (!dt) return "-";
//   const d = new Date(dt);
//   if (Number.isNaN(d.getTime())) return "-";
//   return d.toLocaleString();
// }

// function buildLocationLabel(loc, flatLookup = {}) {
//   if (!loc) return "-";

//   const parts = [];

//   const flatMeta = loc.flat_id ? flatLookup[loc.flat_id] : null;

//   if (flatMeta) {
//     parts.push(
//       `Flat ${flatMeta.number}${
//         flatMeta.typeName ? ` (${flatMeta.typeName})` : ""
//       }`
//     );
//   } else if (loc.flat_id) {
//     parts.push(`Flat-${loc.flat_id}`);
//   }

//   if (flatMeta?.levelName) {
//     parts.push(flatMeta.levelName);
//   } else if (loc.level_id) {
//     parts.push(`Level-${loc.level_id}`);
//   }

//   return parts.length ? parts.join(" / ") : "-";
// }

// // summary builder used when filters are active
// function buildSummaryFromItems(items) {
//   const byStatus = {};
//   let totalWithSubmission = 0;
//   const byStageMap = {};
//   const roleSummary = {};

//   items.forEach((item) => {
//     const status = String(item.item_status || "").toLowerCase() || "unknown";
//     byStatus[status] = (byStatus[status] || 0) + 1;

//     if (item.latest_submission) {
//       totalWithSubmission += 1;
//     }

//     const stageId = item.checklist?.stage_id;
//     if (stageId != null) {
//       let stageRec = byStageMap[stageId];
//       if (!stageRec) {
//         stageRec = {
//           stage_id: stageId,
//           items: 0,
//           by_latest_status: {},
//         };
//         byStageMap[stageId] = stageRec;
//       }
//       stageRec.items += 1;
//       stageRec.by_latest_status[status] =
//         (stageRec.by_latest_status[status] || 0) + 1;
//     }

//     const rolesObj = item.roles || {};
//     Object.entries(rolesObj).forEach(([rk, info]) => {
//       if (!info || !info.user_id) return;
//       const key = rk.toUpperCase();
//       let rRec = roleSummary[key];
//       if (!rRec) {
//         rRec = {
//           items_touched: 0,
//           distinct_users: 0,
//           _userIds: new Set(),
//         };
//         roleSummary[key] = rRec;
//       }
//       rRec.items_touched += 1;
//       rRec._userIds.add(info.user_id);
//     });
//   });

//   Object.values(roleSummary).forEach((r) => {
//     r.distinct_users = r._userIds.size;
//     delete r._userIds;
//   });

//   return {
//     total_items: items.length,
//     total_with_submission: totalWithSubmission,
//     by_latest_status: byStatus,
//     by_stage: Object.values(byStageMap),
//     roles: roleSummary,
//   };
// }

// const PARETO_CATEGORY_MODES = [
//   { value: "room", label: "By Room Category" },
//   { value: "flatType", label: "By Flat Type" },
//   { value: "checklist", label: "By Checklist title" },
//     { value: "question", label: "By Question" },

// ];

// // 👇 helper – pareto ke liye category label nikalne ke liye
// function getParetoCategoryLabel(item, flatLookup, mode) {
//   const loc = item.location || {};
//   const cl = item.checklist || {};

//   // 1) Room based
//   if (mode === "room") {
//     const label =
//       loc.room_category ||
//       loc.room_type ||
//       loc.room ||
//       null;
//     return label || "⚠ Unmapped Room";
//   }

//   // 2) Flat type based (1 BHK / 2 BHK etc.)
//   if (mode === "flatType") {
//     const flatId = loc.flat_id;
//     const meta = flatId ? flatLookup[flatId] : null;
//     return (
//       meta?.typeName ||
//       (meta?.number ? `Flat ${meta.number}` : null) ||
//       "⚠ Unmapped Flat Type"
//     );
//   }

//   // 3) Checklist category based
//  // 3) Checklist category based
// if (mode === "checklist") {
//   // sabse pehle deep category levels
//   const label =
//     cl.category_level3_name ||
//     cl.category_level3_label ||
//     cl.category_level3_title ||
//     (cl.category_level3 && (cl.category_level3.name || cl.category_level3.title)) ||

//     cl.category_level2_name ||
//     cl.category_level2_label ||
//     (cl.category_level2 && (cl.category_level2.name || cl.category_level2.title)) ||

//     cl.category_level1_name ||
//     cl.category_level1_label ||
//     (cl.category_level1 && (cl.category_level1.name || cl.category_level1.title)) ||

//     // base category fields
//     cl.category_name ||
//     cl.category_label ||
//     cl.category_title ||
//     (cl.category && (cl.category.name || cl.category.title)) ||

//     // ✅ fallback: checklist ka hi title ko category treat karo
//     cl.name ||
//     cl.title ||
//     null;

//   if (label) return String(label);
//   if (cl.id) return `Checklist #${cl.id}`;
//   return "⚠ Unmapped Checklist title";
// }


//   // 4) Question level Pareto
//   if (mode === "question") {
//     const q =
//       item.item_title ||
//       item.question ||
//       cl.question_text ||
//       null;
//     return q || `⚠ Unmapped Question (${item.item_id || "N/A"})`;
//   }

//   // fallback
//   return "Other";
// }



// const CORE_ROLES_FOR_HEAD = [
//   "MAKER",
//   "SUPERVISOR",
//   "CHECKER",
//   "PROJECT_MANAGER",
//   "PROJECT_HEAD",
//   "MANAGER",
//   "HEAD",
// ];

// const CHART_COLORS = {
//   primary: "#8b5cf6",
//   secondary: "#3b82f6",
//   success: "#10b981",
//   warning: "#f59e0b",
//   danger: "#ef4444",
//   info: "#06b6d4",
//   purple: "#a855f7",
//   pink: "#ec4899",
//   indigo: "#6366f1",
//   orange: "#f97316",
// };

// const ProjectOverview = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { theme } = useTheme();
//   const location = useLocation();

//   const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [globalFilters, setGlobalFilters] = useState({
//     status: "",
//     role: "",
//     stageId: "",
//     buildingId: "",
//      flatCategory: "",
//     roomCategory: "",
//     timeWindow: "all", // all | 30d | 7d
//   });

//   const [questionStats, setQuestionStats] = useState(null);
//   const [loadingQuestions, setLoadingQuestions] = useState(false);
//   const [questionFilters, setQuestionFilters] = useState({
//     stageId: "",
//     categoryId: "",
//     buildingId: "",
//     floorId: "",
//     roomCategory: "",
//     statusBucket: "open", // open | closed | all
//   });

//   const [userMap, setUserMap] = useState({});
//   const [users, setUsers] = useState([]);
//   const [stageMap, setStageMap] = useState({});
//   const [flatLookup, setFlatLookup] = useState({});

//   const projectFromState = location.state?.project || null;

//   const [viewMode, setViewMode] = useState("head");

//   useEffect(() => {
//     try {
//       const userDataStr = localStorage.getItem("USER_DATA");
//       const userData = userDataStr ? JSON.parse(userDataStr) : null;

//       const roleFromStorage =
//         localStorage.getItem("ROLE") ||
//         userData?.role ||
//         (userData?.roles && userData.roles[0]) ||
//         "";

//       const normalizedProjectRoles = Array.isArray(projectFromState?.roles)
//         ? projectFromState.roles.map((r) =>
//             typeof r === "string" ? r : r?.role || ""
//           )
//         : [];

//       const allRoleStrings = [roleFromStorage, ...(normalizedProjectRoles || [])]
//         .filter(Boolean)
//         .map((r) => String(r).toLowerCase());

//       const isManager =
//         userData?.is_manager ||
//         allRoleStrings.some((r) =>
//           ["manager", "project_manager"].some((x) => r.includes(x))
//         );

//       const isHead = allRoleStrings.some((r) =>
//         ["project_head", "head"].some((x) => r.includes(x))
//       );

//       const isSuperAdmin =
//         (typeof roleFromStorage === "string" &&
//           roleFromStorage.toLowerCase().includes("super admin")) ||
//         userData?.superadmin === true ||
//         userData?.is_superadmin === true ||
//         userData?.is_staff === true;

//       if (isSuperAdmin || isManager) {
//         setViewMode("manager");
//       } else if (isHead) {
//         setViewMode("head");
//       } else {
//         setViewMode("manager");
//       }
//     } catch (e) {
//       console.error("Failed to derive view mode", e);
//       setViewMode("head");
//     }
//   }, [projectFromState]);

//   const resolveUserName = (uid) => {
//     if (!uid) return "-";
//     return userMap[uid] || `User #${uid}`;
//   };

//   useEffect(() => {
//     const fetchAll = async () => {
//       setLoading(true);
//       setError("");
//       try {
//         const [statsRes, usersRes] = await Promise.all([
//           axios.get(`${API_BASE}/checklists/stats/watcher-deep/`, {
//             params: { project_id: id },
//             headers: authHeaders(),
//           }),
//           axios.get(`${API_BASE}/users/users-by-creator/`, {
//             headers: authHeaders(),
//           }),
//         ]);

//         const statsData = statsRes.data;
//         setStats(statsData);

//         const uMap = {};
//         (usersRes.data || []).forEach((u) => {
//           const displayName =
//             (u.first_name && u.first_name.trim()) ||
//             (u.username && u.username.trim()) ||
//             u.email ||
//             `User #${u.id}`;
//           uMap[u.id] = displayName;
//         });
//         setUserMap(uMap);
//         setUsers(usersRes.data || []);

//         const phaseSet = new Set();
//         (statsData.items || []).forEach((item) => {
//           const phId = item.checklist?.phase_id;
//           if (phId) phaseSet.add(phId);
//         });
//         const phaseIds = Array.from(phaseSet);

//         const newStageMap = {};

//         if (phaseIds.length > 0) {
//           await Promise.all(
//             phaseIds.map((phaseId) =>
//               axios
//                 .get(`${API_BASE}/projects/stages/by_phase/${phaseId}/`, {
//                   headers: authHeaders(),
//                 })
//                 .then((resp) => {
//                   (resp.data || []).forEach((stage) => {
//                     if (stage && stage.id != null) {
//                       newStageMap[stage.id] =
//                         stage.name ||
//                         (stage.stage_name && stage.stage_name.name) ||
//                         `Stage #${stage.id}`;
//                     }
//                   });
//                 })
//                 .catch((err) => {
//                   console.error("Failed to load stages for phase", phaseId, err);
//                 })
//             )
//           );
//         }

//         setStageMap(newStageMap);
//       } catch (err) {
//         console.error(err);
//         const msg =
//           err?.response?.data?.detail ||
//           err?.response?.data?.message ||
//           "Failed to load project stats.";
//         setError(msg);
//         toast.error(msg);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (id) {
//       fetchAll();
//     }
//   }, [id]);

//   // levels-with-flats for flat label
//   useEffect(() => {
//     if (!stats?.items || !Array.isArray(stats.items)) return;

//     const buildingIds = Array.from(
//       new Set(
//         stats.items
//           .map((it) => it.location?.building_id)
//           .filter(Boolean)
//       )
//     );

//     if (!buildingIds.length) return;

//     const fetchLevelsWithFlats = async () => {
//       try {
//         const responses = await Promise.all(
//           buildingIds.map((bid) =>
//             axios.get(`${API_BASE}/projects/levels-with-flats/${bid}/`, {
//               headers: authHeaders(),
//             })
//           )
//         );

//         const map = {};

//         responses.forEach((res) => {
//   (res.data || []).forEach((level) => {
//     const levelName = level.name;
//     const levelId = level.id; // 👈 yaha se floor/level id

//     (level.flats || []).forEach((flat) => {
//       map[flat.id] = {
//         number: flat.number,
//         typeName: flat.flattype?.type_name || "",
//         levelName,
//         levelId, // 👈 add this
//       };
//     });
//   });
// });


//         setFlatLookup(map);
//       } catch (e) {
//         console.error("Failed to load levels-with-flats", e);
//       }
//     };

//     fetchLevelsWithFlats();
//   }, [stats]);

//   // question hotspots
//   useEffect(() => {
//     if (!id) return;

//     const fetchQuestions = async () => {
//       setLoadingQuestions(true);
//       try {
//         const res = await axios.get(
//           `${API_BASE}/checklists/stats/questions/`,
//           {
//             params: {
//               project_id: id,
//               limit: 50,
//             },
//             headers: authHeaders(),
//           }
//         );
//         setQuestionStats(res.data || null);
//       } catch (err) {
//         console.error("Failed to load question hotspots", err);
//       } finally {
//         setLoadingQuestions(false);
//       }
//     };

//     fetchQuestions();
//   }, [id]);

//   const bgColor = theme === "dark" ? "#0f172a" : "#f8fafc";
//   const cardColor = theme === "dark" ? "#1e293b" : "#ffffff";
//   const borderColor = theme === "dark" ? "#334155" : "#192e4aff";
//   const textColor = theme === "dark" ? "#f1f5f9" : "#0f172a";
//   const secondaryTextColor = theme === "dark" ? "#94a3b8" : "#64748b";

//   const projectName =
//     projectFromState?.name ||
//     projectFromState?.project_name ||
//     `Project #${id}`;

//   // distinct statuses (for dropdown options)
//   const distinctStatuses = useMemo(() => {
//     const s = new Set();
//     (stats?.items || []).forEach((item) => {
//       if (item.item_status) {
//         s.add(String(item.item_status).toLowerCase());
//       }
//     });
//     return Array.from(s);
//   }, [stats]);

//   // building filter options
 

//   // Floors list based on selected building + flatLookup
// const floorOptions = useMemo(() => {
//   const buildingId = globalFilters.buildingId;
//   if (!buildingId) return [];

//   const items = Array.isArray(stats?.items) ? stats.items : [];
//   const levelsMap = new Map();

//   items.forEach((it) => {
//     const loc = it.location || {};
//     if (!loc.flat_id) return;
//     if (!loc.building_id || String(loc.building_id) !== String(buildingId)) return;

//     const meta = flatLookup[loc.flat_id];
//     if (!meta || !meta.levelId) return;

//     if (!levelsMap.has(meta.levelId)) {
//       levelsMap.set(meta.levelId, {
//         id: String(meta.levelId),
//         label: meta.levelName || `Floor #${meta.levelId}`,
//       });
//     }
//   });

//   return Array.from(levelsMap.values()).sort((a, b) =>
//     String(a.label).localeCompare(String(b.label))
//   );
// }, [stats, globalFilters.buildingId, flatLookup]);
//  // 👇 NEW: flats list for "Focus flat" dropdown (respecting current building filter)
//   const flatOptions = useMemo(() => {
//     const items = Array.isArray(stats?.items) ? stats.items : [];
//     const map = new Map();

//     items.forEach((it) => {
//       const loc = it.location || {};
//       const flatId = loc.flat_id;
//       if (!flatId) return;

//       // If building filter set, restrict flats to that building
//       if (
//         globalFilters.buildingId &&
//         loc.building_id &&
//         String(loc.building_id) !== String(globalFilters.buildingId)
//       ) {
//         return;
//       }

//       if (!map.has(flatId)) {
//         const meta = flatLookup[flatId] || {};
//         const baseLabel = meta.number
//           ? `Flat ${meta.number}`
//           : `Flat #${flatId}`;
//         const label = meta.typeName
//           ? `${baseLabel} • ${meta.typeName}`
//           : baseLabel;
//         map.set(flatId, { id: String(flatId), label });
//       }
//     });

//     return Array.from(map.values()).sort((a, b) =>
//       String(a.label).localeCompare(String(b.label))
//     );
//   }, [stats, flatLookup, globalFilters.buildingId]);

//   // Floors only for Question filters (stage+building+floor+room view)
//   const questionFloorOptions = useMemo(() => {
//     const bId = questionFilters.buildingId;
//     if (!bId) return [];

//     const items = Array.isArray(stats?.items) ? stats.items : [];
//     const levelsMap = new Map();

//     items.forEach((it) => {
//       const loc = it.location || {};
//       if (!loc.flat_id) return;
//       if (!loc.building_id || String(loc.building_id) !== String(bId)) return;

//       const meta = flatLookup[loc.flat_id];
//       if (!meta || !meta.levelId) return;

//       if (!levelsMap.has(meta.levelId)) {
//         levelsMap.set(meta.levelId, {
//           id: String(meta.levelId),
//           label: meta.levelName || `Floor #${meta.levelId}`,
//         });
//       }
//     });

//     return Array.from(levelsMap.values()).sort((a, b) =>
//       String(a.label).localeCompare(String(b.label))
//     );
//   }, [stats, flatLookup, questionFilters.buildingId]);

//     // flat categories – e.g. 1 BHK / 2 BHK, etc.
//   const flatCategoryOptions = useMemo(() => {
//     const items = Array.isArray(stats?.items) ? stats.items : [];
//     const categories = new Set();

//     items.forEach((it) => {
//       const flatId = it.location?.flat_id;
//       if (!flatId) return;
//       const meta = flatLookup[flatId];
//       const cat = meta?.typeName || null; // backend se jo bhi aa raha ho (1 BHK / 2 BHK)
//       if (cat) categories.add(String(cat));
//     });

//     return Array.from(categories).sort();
//   }, [stats, flatLookup]);

//   // room categories – e.g. Living, Bedroom, Toilet
//   const roomCategoryOptions = useMemo(() => {
//     const items = Array.isArray(stats?.items) ? stats.items : [];
//     const categories = new Set();

//     items.forEach((it) => {
//       const loc = it.location || {};
//       const cat =
//         loc.room_category ||
//         loc.room_type ||
//         loc.room ||
//         null; // jo bhi key tum use kar rahe ho
//       if (cat) categories.add(String(cat));
//     });

//     return Array.from(categories).sort();
//   }, [stats]);

//   // checklist category options (for question filters)
//   const checklistCategoryOptions = useMemo(() => {
//   const items = Array.isArray(stats?.items) ? stats.items : [];
//   const map = new Map();

//   items.forEach((it) => {
//     const cl = it.checklist || {};

//     // 1) ID for filter logic
//     const id =
//       cl.category_id ||
//       cl.category ||
//       cl.categoryId ||
//       cl.category_id_fk ||
//       null;
//     if (!id) return;

//     // 2) BEST possible human label
//     const label =
//       cl.category_name ||          // try direct field
//       cl.category_label ||
//       cl.category_title ||
//       (cl.category && cl.category.name) ||
//       cl.name ||                   // many APIs: checklist.name
//       cl.title ||
//       `Category #${id}`;

//     const key = String(id);
//     if (!map.has(key)) {
//       map.set(key, String(label));
//     }
//   });

//   return Array.from(map.entries()).map(([id, label]) => ({
//     id,
//     label,
//   }));
// }, [stats]);
// // Map of building_id -> building name (Tower / Wing label)
// const buildingNameMap = useMemo(() => {
//   const map = new Map();

//   // Option A: if API directly sends buildings list
//   (stats?.buildings || []).forEach((b) => {
//     const id = b.id || b.building_id;
//     if (!id) return;
//     const label =
//       b.name ||
//       b.title ||
//       b.building_name ||
//       b.code ||
//       `Building #${id}`;
//     map.set(String(id), String(label));
//   });

//   // Option B: derive from flats / locations (fallback)
//   const items = Array.isArray(stats?.items) ? stats.items : [];
//   items.forEach((it) => {
//     const loc = it.location || {};
//     if (!loc.building_id) return;

//     const id = String(loc.building_id);

//     const fromLoc =
//       loc.building_name ||
//       loc.building ||
//       loc.tower_name ||
//       loc.wing ||
//       null;

//     const fromFlat =
//       (it.flat_meta && it.flat_meta.building_name) ||
//       (it.flat_meta && it.flat_meta.tower_name) ||
//       null;

//     const label =
//       fromLoc ||
//       fromFlat ||
//       map.get(id) ||
//       `Building #${id}`;

//     map.set(id, String(label));
//   });

//   return map;
// }, [stats]);

// const buildingOptions = useMemo(() => {
//   return Array.from(buildingNameMap.entries()).map(([id, label]) => ({
//     id,
//     label,
//   }));
// }, [buildingNameMap]);

//   // ---------- GLOBAL FILTER MECHANISM ----------
//   const filteredItemsGlobal = useMemo(() => {
//     const items = Array.isArray(stats?.items) ? stats.items : [];
// const {
//       status,
//       role,
//       stageId,
//       buildingId,
//       flatCategory,
//       roomCategory,
//       timeWindow,
//     } = globalFilters;
//         if (
//       !status &&
//       !role &&
//       !stageId &&
//       !buildingId &&
//       !flatCategory &&
//       !roomCategory &&
//       timeWindow === "all"
//     ) {
//       return items;
//     }


//     const now = new Date();

//     return items.filter((item) => {
//       // status
//       if (status) {
//         if (
//           String(item.item_status || "").toLowerCase() !==
//           String(status).toLowerCase()
//         ) {
//           return false;
//         }
//       }

//       // role
//       if (role) {
//         const rolesObj = item.roles || {};
//         const block = rolesObj[role.toLowerCase()];
//         if (!block || !block.user_id) return false;
//       }

//       // stage
//       if (stageId) {
//         const sId = item.checklist?.stage_id;
//         if (!sId || String(sId) !== String(stageId)) return false;
//       }

//       // building
//       if (buildingId) {
//         const bId = item.location?.building_id;
//         if (!bId || String(bId) !== String(buildingId)) return false;
//       }
//             // flat category filter (1 BHK / 2 BHK etc.)
//       if (flatCategory) {
//         const flatId = item.location?.flat_id;
//         if (!flatId) return false;
//         const meta = flatLookup[flatId];
//         const cat = meta?.typeName || null;
//         if (!cat || String(cat) !== String(flatCategory)) {
//           return false;
//         }
//       }

//       // room category filter (Living, Bedroom, Toilet etc.)
//       if (roomCategory) {
//         const loc = item.location || {};
//         const cat =
//           loc.room_category ||
//           loc.room_type ||
//           loc.room ||
//           null;
//         if (!cat || String(cat) !== String(roomCategory)) {
//           return false;
//         }
//       }


//       // time window
//       if (timeWindow !== "all") {
//         const latest = item.latest_submission || {};
//         const lastTimeStr =
//           latest.checked_at ||
//           latest.supervised_at ||
//           latest.maker_at ||
//           null;
//         if (!lastTimeStr) return false;
//         const t = new Date(lastTimeStr);
//         if (Number.isNaN(t.getTime())) return false;

//         const diffDays = (now - t) / (1000 * 60 * 60 * 24);
//         if (timeWindow === "30d" && diffDays > 30) return false;
//         if (timeWindow === "7d" && diffDays > 7) return false;
//       }

//       return true;
//     });
//   }, [stats, globalFilters,flatLookup]);

//  const [paretoFilters, setParetoFilters] = useState({
//   categoryMode: "room", // 'room' | 'flatType' | 'checklist' | 'question'
//   floorIds: [],         // multi-select floor ids as strings
//   focusFlatId: [],      // optional: restrict Pareto to single flat
// });


//   const filtersActive = useMemo(() => {
//     const {
//       status,
//       role,
//       stageId,
//       buildingId,
//       flatCategory,
//       roomCategory,
//       timeWindow,
//     } = globalFilters;
//     return (
//       !!status ||
//       !!role ||
//       !!stageId ||
//       !!buildingId ||
//       !!flatCategory ||
//       !!roomCategory ||
//       timeWindow !== "all"
//     );
//   }, [globalFilters]);

//   const workingItems = useMemo(() => {
//     if (filtersActive) {
//       return filteredItemsGlobal;
//     }
//     return Array.isArray(stats?.items) ? stats.items : [];
//   }, [stats, filteredItemsGlobal, filtersActive]);

//   const rawSummary = stats?.summary || {};

//   const summary = useMemo(() => {
//     if (!workingItems || !workingItems.length) {
//       return {
//         total_items: 0,
//         total_with_submission: 0,
//         by_latest_status: {},
//         by_stage: [],
//         roles: {},
//       };
//     }

//     if (!filtersActive && rawSummary && Object.keys(rawSummary).length) {
//       return rawSummary;
//     }

//     // filters active -> recompute summary from workingItems
//     return buildSummaryFromItems(workingItems);
//   }, [workingItems, filtersActive, rawSummary]);

//   const totalItems = safeNumber(summary.total_items);
//   const totalWithSubmission = safeNumber(summary.total_with_submission);
//   const byStatus = summary.by_latest_status || {};
//   const statusKeys = Object.keys(byStatus);

//   const completionRate = pct(byStatus.completed || 0, totalItems);
//   const withSubmissionRate = pct(totalWithSubmission, totalItems);

//   const roleStatsObj = summary.roles || {};
//   const allRoleKeys = Object.keys(roleStatsObj);

//   const visibleRoleKeys =
//     viewMode === "manager"
//       ? allRoleKeys
//       : allRoleKeys.filter((k) => CORE_ROLES_FOR_HEAD.includes(k));

//   const hasData = !!stats && !loading && !error;
//   const numericProjectId = Number(id) || null;

//   // ============ CHART DATA COMPUTATIONS ============
// const paretoCategoryData = useMemo(() => {
//   if (!workingItems || !workingItems.length) return [];

//   const pendingKeys = [
//     "pending_checker",
//     "pending_for_inspector",
//     "not_started",
//   ];

//   const selectedStageId = globalFilters.stageId || null;
//   const selectedBuildingId = globalFilters.buildingId || null;
//   const selectedFloorIds = paretoFilters.floorIds || [];
//   const focusFlatId = paretoFilters.focusFlatId || "";
//   const selectedFlatIds = paretoFilters.focusFlatIds || [];
//   const categoryMode = paretoFilters.categoryMode || "room";

//   const rowsMap = {};

//   workingItems.forEach((item) => {
//     const status = (item.item_status || "").toLowerCase();
//     if (!pendingKeys.includes(status)) return; // sirf pending count karna hai

//     // Stage filter (global)
//     if (selectedStageId) {
//       const sId = item.checklist?.stage_id;
//       if (!sId || String(sId) !== String(selectedStageId)) return;
//     }

//     // Building filter (global)
//     if (selectedBuildingId) {
//       const bId = item.location?.building_id;
//       if (!bId || String(bId) !== String(selectedBuildingId)) return;
//     }

//     // Floors filter (local Pareto)
//     if (selectedFloorIds.length) {
//       const flatId = item.location?.flat_id;
//       if (!flatId) return;
//       const meta = flatLookup[flatId];
//       if (!meta || !meta.levelId) return;

//       const lid = String(meta.levelId);
//       if (!selectedFloorIds.includes(lid)) return;
//     }

//     // Focus flat filter (local Pareto) – e.g. "Flat 3" only
//      if (selectedFlatIds.length) {
//       const fId = item.location?.flat_id;
//       if (!fId) return;
//       if (!selectedFlatIds.includes(String(fId))) return;
//     }

//     const label = getParetoCategoryLabel(item, flatLookup, categoryMode);
//     const key = label;

//     let row = rowsMap[key];
//     if (!row) {
//       row = {
//         categoryLabel: label,
//         pending: 0,
//       };
//       rowsMap[key] = row;
//     }
//     row.pending += 1;
//   });

//   let rows = Object.values(rowsMap).filter((r) => r.pending > 0);
//   if (!rows.length) return [];

//   // Sort desc by pending
//   rows.sort((a, b) => b.pending - a.pending);

//   // Cumulative % (Pareto) + top 80% flag
//   const totalPending = rows.reduce((sum, r) => sum + r.pending, 0) || 1;
//   let running = 0;

//   rows = rows.map((r) => {
//     running += r.pending;
//     const cumulativePct = Math.round((running / totalPending) * 100);
//     const isTop80 = cumulativePct <= 80;
//     const isUnmapped =
//       typeof r.categoryLabel === "string" &&
//       r.categoryLabel.startsWith("⚠");
//     return {
//       ...r,
//       cumulativePct,
//       isTop80,
//       isUnmapped,
//     };
//   });

//   return rows;
// }, [
//   workingItems,
//   globalFilters.stageId,
//   globalFilters.buildingId,
//   paretoFilters,
//   flatLookup,
// ]);

//   // 1. Project Health Score
//   const projectHealthScore = useMemo(() => {
//     if (!hasData) return 0;

//     const completionWeight = completionRate * 0.4; // 40% weight
//     const submissionWeight = withSubmissionRate * 0.3; // 30% weight

//     // Rework penalty
//     let reworkCount = 0;
//     (workingItems || []).forEach((item) => {
//       if (safeNumber(item.latest_submission?.attempts, 0) > 1) reworkCount++;
//     });
//     const reworkPenalty = totalItems > 0 ? (reworkCount / totalItems) * 20 : 0;

//     // Pending work factor
//     const pendingCount =
//       safeNumber(byStatus.pending_checker) +
//       safeNumber(byStatus.pending_for_inspector) +
//       safeNumber(byStatus.not_started);
//     const pendingFactor =
//       totalItems > 0 ? (pendingCount / totalItems) * 30 : 0;

//     const score = Math.max(
//       0,
//       Math.min(
//         100,
//         completionWeight +
//           submissionWeight +
//           (30 - pendingFactor) -
//           reworkPenalty
//       )
//     );

//     return Math.round(score);
//   }, [
//     hasData,
//     completionRate,
//     withSubmissionRate,
//     byStatus,
//     workingItems,
//     totalItems,
//   ]);

//   // 2. Stage Progress Chart Data
//   const stageProgressChartData = useMemo(() => {
//     if (!summary.by_stage) return [];

//     return summary.by_stage
//       .map((stg) => {
//         const stgItems = safeNumber(stg.items);
//         const statusData = stg.by_latest_status || {};
//         const stageLabel =
//           stageMap[stg.stage_id] || stg.stage_name || `Stage ${stg.stage_id}`;

//         return {
//           name: stageLabel,
//           completed: safeNumber(statusData.completed),
//           pending_checker: safeNumber(statusData.pending_checker),
//           pending_for_inspector: safeNumber(statusData.pending_for_inspector),
//           not_started: safeNumber(statusData.not_started),
//           total: stgItems,
//           completionRate: pct(statusData.completed, stgItems),
//         };
//       })
//       .sort((a, b) => b.total - a.total);
//   }, [summary, stageMap]);

//   // 3. Status Distribution Pie Chart
//   const statusPieData = useMemo(
//     () =>
//       statusKeys
//         .map((key) => ({
//           name: titleCaseStatus(key),
//           value: safeNumber(byStatus[key]),
//           color: statusColor(key).chartColor,
//         }))
//         .filter((d) => d.value > 0),
//     [statusKeys, byStatus]
//   );

//   // 4. Team Performance Comparison
//   const teamPerformanceData = useMemo(() => {
//     if (!hasData) return [];

//     const userStats = {};

//     (workingItems || []).forEach((item) => {
//       const status = (item.item_status || "").toLowerCase();
//       const rolesObj = item.roles || {};

//       ["maker", "checker", "supervisor"].forEach((rk) => {
//         const uid = rolesObj[rk]?.user_id;
//         if (!uid) return;

//         if (!userStats[uid]) {
//           userStats[uid] = {
//             userName: resolveUserName(uid),
//             completed: 0,
//             pending: 0,
//             total: 0,
//             efficiency: 0,
//           };
//         }

//         userStats[uid].total += 1;
//         if (status === "completed") {
//           userStats[uid].completed += 1;
//         } else {
//           userStats[uid].pending += 1;
//         }
//       });
//     });

//     return Object.values(userStats)
//       .map((u) => ({
//         ...u,
//         efficiency:
//           u.total > 0 ? Math.round((u.completed / u.total) * 100) : 0,
//       }))
//       .sort((a, b) => b.total - a.total)
//       .slice(0, 10);
//   }, [workingItems, userMap, hasData]);

//   // 5. Workload Distribution
//   const workloadDistributionData = useMemo(() => {
//     if (!visibleRoleKeys.length) return [];

//     return visibleRoleKeys
//       .map((roleKey) => {
//         const rStats = roleStatsObj[roleKey] || {};
//         const roleLabel = roleKey
//           .split("_")
//           .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
//           .join(" ");

//         return {
//           role: roleLabel,
//           items: safeNumber(rStats.items_touched),
//           users: safeNumber(rStats.distinct_users),
//           avgPerUser:
//             safeNumber(rStats.distinct_users) > 0
//               ? Math.round(
//                   safeNumber(rStats.items_touched) /
//                     safeNumber(rStats.distinct_users)
//                 )
//               : 0,
//         };
//       })
//       .filter((d) => d.items > 0);
//   }, [visibleRoleKeys, roleStatsObj]);

//   // 6. Timeline/Velocity (last 30 days)
//   const velocityChartData = useMemo(() => {
//     if (!workingItems || !workingItems.length) return [];

//     const days = 30;
//     const data = [];
//     const now = new Date();

//     for (let i = days - 1; i >= 0; i--) {
//       const date = new Date(now);
//       date.setDate(date.getDate() - i);

//       let completed = 0;
//       let started = 0;

//       workingItems.forEach((item) => {
//         const latest = item.latest_submission || {};
//         const activityDate =
//           latest.checked_at || latest.supervised_at || latest.maker_at;

//         if (activityDate) {
//           const actDate = new Date(activityDate);
//           if (actDate.toDateString() === date.toDateString()) {
//             if ((item.item_status || "").toLowerCase() === "completed") {
//               completed++;
//             } else {
//               started++;
//             }
//           }
//         }
//       });

//       data.push({
//         date: `${date.getDate()}/${date.getMonth() + 1}`,
//         completed,
//         started,
//         total: completed + started,
//       });
//     }

//     return data;
//   }, [workingItems]);

//   // 7. Role Performance Radar
//   const roleRadarData = useMemo(() => {
//     if (!visibleRoleKeys.length) return [];

//     const maxItems = Math.max(
//       0,
//       ...visibleRoleKeys.map((k) =>
//         safeNumber(roleStatsObj[k]?.items_touched)
//       )
//     );

//     return visibleRoleKeys
//       .map((roleKey) => {
//         const rStats = roleStatsObj[roleKey] || {};
//         const roleLabel = roleKey.split("_")[0];

//         const items = safeNumber(rStats.items_touched);

//         return {
//           role: roleLabel,
//           coverage: maxItems > 0 ? Math.round((items / maxItems) * 100) : 0,
//           users: safeNumber(rStats.distinct_users) * 10,
//         };
//       })
//       .filter((d) => d.coverage > 0);
//   }, [visibleRoleKeys, roleStatsObj]);
//   // 9. Stage-wise Pareto (80/20 pending work)
//   const paretoStageData = useMemo(() => {
//     if (!summary.by_stage || !summary.by_stage.length) return [];

//     // Step 1: stage-wise pending count banao
//     const rows = summary.by_stage
//       .map((stg) => {
//         const statusData = stg.by_latest_status || {};
//         const pending =
//           safeNumber(statusData.pending_checker) +
//           safeNumber(statusData.pending_for_inspector) +
//           safeNumber(statusData.not_started);

//         if (pending <= 0) return null;

//         const stageLabel =
//           stageMap[stg.stage_id] ||
//           stg.stage_name ||
//           `Stage #${stg.stage_id}`;

//         return {
//           stageId: stg.stage_id,
//           stageLabel,
//           pending,
//         };
//       })
//       .filter(Boolean)
//       .sort((a, b) => b.pending - a.pending); // descending

//     if (!rows.length) return [];

//     // Step 2: cumulative % nikaalo
//     const totalPending = rows.reduce((sum, r) => sum + r.pending, 0) || 1;
//     let running = 0;

//     return rows.map((r) => {
//       running += r.pending;
//       const cumulativePct = Math.round((running / totalPending) * 100);
//       return {
//         ...r,
//         cumulativePct,
//       };
//     });
//   }, [summary, stageMap]);

//   // 8. Bottleneck Identification
//   const bottleneckData = useMemo(() => {
//     if (!summary.by_stage) return [];
    

//     return summary.by_stage
//       .map((stg) => {
//         const stgItems = safeNumber(stg.items);
//         const statusData = stg.by_latest_status || {};
//         const stageLabel = stageMap[stg.stage_id] || `Stage #${stg.stage_id}`;

//         const pending =
//           safeNumber(statusData.pending_checker) +
//           safeNumber(statusData.pending_for_inspector) +
//           safeNumber(statusData.not_started);

//         const bottleneckScore =
//           stgItems > 0 ? (pending / stgItems) * 100 : 0;

//         return {
//           stage: stageLabel,
//           pendingItems: pending,
//           totalItems: stgItems,
//           bottleneckScore: Math.round(bottleneckScore),
//           isBottleneck: bottleneckScore > 50,
//         };
//       })
//       .filter((d) => d.isBottleneck)
//       .sort((a, b) => b.bottleneckScore - a.bottleneckScore);
//   }, [summary, stageMap]);

//   // ---------- existing analytics from previous version ----------

//   const responsibilityMatrix = useMemo(() => {
//     if (!workingItems || !workingItems.length) return [];
//     const byStage = {};

//     workingItems.forEach((item) => {
//       const stageId = item.checklist?.stage_id;
//       if (!stageId) return;
//       if (!byStage[stageId]) {
//         byStage[stageId] = {
//           stageId,
//           assignments: {
//             INITIALIZER: {},
//             MAKER: {},
//             SUPERVISOR: {},
//             CHECKER: {},
//           },
//         };
//       }
//       const rolesObj = item.roles || {};
//       ["initializer", "maker", "supervisor", "checker"].forEach((rk) => {
//         const block = rolesObj[rk];
//         const uid = block?.user_id;
//         if (!uid) return;
//         const roleName = rk.toUpperCase();
//         const bucket = byStage[stageId].assignments[roleName];
//         bucket[uid] = (bucket[uid] || 0) + 1;
//       });
//     });

//     return Object.values(byStage)
//       .map((entry) => {
//         const stageLabel = stageMap[entry.stageId] || `Stage #${entry.stageId}`;
//         const roles = {};
//         Object.entries(entry.assignments).forEach(([roleName, userCounts]) => {
//           const arr = Object.entries(userCounts)
//             .map(([uid, count]) => ({
//               userId: Number(uid),
//               userName: resolveUserName(Number(uid)),
//               count,
//             }))
//             .sort((a, b) => b.count - a.count);
//           if (arr.length) roles[roleName] = arr;
//         });
//         return { stageId: entry.stageId, stageLabel, roles };
//       })
//       .sort((a, b) => a.stageId - b.stageId);
//   }, [workingItems, stageMap, userMap]);

//   const userWorkload = useMemo(() => {
//     if (!workingItems || !workingItems.length) return [];
//     const map = {};

//     workingItems.forEach((item) => {
//       const status = (item.item_status || "").toLowerCase();
//       const rolesObj = item.roles || {};
//       ["maker", "checker", "supervisor"].forEach((rk) => {
//         const uid = rolesObj[rk]?.user_id;
//         if (!uid) return;
//         const rec =
//           map[uid] ||
//           (map[uid] = {
//             userId: uid,
//             userName: resolveUserName(uid),
//             counts: {
//               total: 0,
//               completed: 0,
//               pending_checker: 0,
//               pending_for_inspector: 0,
//               not_started: 0,
//               other: 0,
//             },
//             roles: { MAKER: 0, CHECKER: 0, SUPERVISOR: 0 },
//             reworkItems: 0,
//           });
//         rec.counts.total += 1;
//         if (status && Object.prototype.hasOwnProperty.call(rec.counts, status)) {
//           rec.counts[status] += 1;
//         } else {
//           rec.counts.other += 1;
//         }
//         const upper = rk.toUpperCase();
//         rec.roles[upper] = (rec.roles[upper] || 0) + 1;

//         const attempts = safeNumber(item.latest_submission?.attempts, 0);
//         if (attempts > 1) {
//           rec.reworkItems += 1;
//         }
//       });
//     });

//     return Object.values(map).sort(
//       (a, b) => b.counts.total - a.counts.total
//     );
//   }, [workingItems, userMap]);

//   const locationHotspots = useMemo(() => {
//     if (!workingItems || !workingItems.length) return [];
//     const flatMap = {};

//     workingItems.forEach((item) => {
//       const flatId = item.location?.flat_id;
//       if (!flatId) return;
//       const status = (item.item_status || "").toLowerCase();
//       const rec =
//         flatMap[flatId] ||
//         (flatMap[flatId] = {
//           flatId,
//           meta: flatLookup[flatId] || null,
//           total: 0,
//           completed: 0,
//           pending_checker: 0,
//           pending_for_inspector: 0,
//           not_started: 0,
//         });
//       rec.total += 1;
//       if (Object.prototype.hasOwnProperty.call(rec, status)) {
//         rec[status] += 1;
//       }
//     });

//     let arr = Object.values(flatMap);
//     arr.forEach((r) => {
//       r.openIssues =
//         safeNumber(r.pending_checker) +
//         safeNumber(r.pending_for_inspector) +
//         safeNumber(r.not_started);
//     });
//     arr.sort((a, b) => b.openIssues - a.openIssues);
//     return arr.slice(0, 5);
//   }, [workingItems, flatLookup]);

//   const reworkSummary = useMemo(() => {
//     if (!workingItems || !workingItems.length) {
//       return { totalRework: 0, byStage: [], byUser: [] };
//     }
//     const byStage = {};
//     const byUser = {};
//     let total = 0;

//     workingItems.forEach((item) => {
//       const attempts = safeNumber(item.latest_submission?.attempts, 0);
//       if (attempts <= 1) return;
//       total += 1;
//       const stageId = item.checklist?.stage_id;
//       if (stageId) {
//         const sRec =
//           byStage[stageId] || (byStage[stageId] = { stageId, count: 0 });
//         sRec.count += 1;
//       }
//       const rolesObj = item.roles || {};
//       ["maker", "checker"].forEach((rk) => {
//         const uid = rolesObj[rk]?.user_id;
//         if (!uid) return;
//         const uRec =
//           byUser[uid] || (byUser[uid] = { userId: uid, count: 0 });
//         uRec.count += 1;
//       });
//     });

//     const stageArr = Object.values(byStage)
//       .map((r) => ({
//         ...r,
//         stageLabel:
//           stageMap[r.stageId] ||
//           (typeof r.stageId !== "undefined"
//             ? `Stage #${r.stageId}`
//             : "Stage"),
//       }))
//       .sort((a, b) => b.count - a.count)
//       .slice(0, 5);

//     const userArr = Object.values(byUser)
//       .map((r) => ({
//         ...r,
//         userName: resolveUserName(r.userId),
//       }))
//       .sort((a, b) => b.count - a.count)
//       .slice(0, 5);

//     return { totalRework: total, byStage: stageArr, byUser: userArr };
//   }, [workingItems, stageMap, userMap]);

//   const recentActivity = useMemo(() => {
//     if (!workingItems || !workingItems.length) return null;
//     const now = Date.now();
//     const days = 7;
//     const cutoff = now - days * 24 * 60 * 60 * 1000;

//     let total = 0;
//     const counts = {
//       completed: 0,
//       pending_checker: 0,
//       pending_for_inspector: 0,
//       not_started: 0,
//       other: 0,
//     };

//     workingItems.forEach((item) => {
//       const latest = item.latest_submission || {};
//       const lastTimeStr =
//         latest.checked_at || latest.supervised_at || latest.maker_at;
//       if (!lastTimeStr) return;
//       const t = new Date(lastTimeStr).getTime();
//       if (!t || Number.isNaN(t) || t < cutoff) return;
//       total += 1;
//       const status = (item.item_status || "").toLowerCase();
//       if (Object.prototype.hasOwnProperty.call(counts, status)) {
//         counts[status] += 1;
//       } else {
//         counts.other += 1;
//       }
//     });

//     if (!total) return null;
//     return { days, total, counts };
//   }, [workingItems]);

//   const projectUsersAccesses = useMemo(() => {
//     if (!numericProjectId || !Array.isArray(users)) return [];
//     const result = [];
//     users.forEach((u) => {
//       const accesses = Array.isArray(u.accesses) ? u.accesses : [];
//       const userName =
//         (u.first_name && u.first_name.trim()) ||
//         (u.username && u.username.trim()) ||
//         u.email ||
//         `User #${u.id}`;
//       accesses.forEach((acc) => {
//         if (acc.project_id && acc.project_id !== numericProjectId) return;
//         const rolesArr = Array.isArray(acc.roles) ? acc.roles : [];
//         const roleNames = rolesArr
//           .map((r) => (typeof r === "string" ? r : r?.role))
//           .filter(Boolean);
//         result.push({
//           userId: u.id,
//           userName,
//           accessId: acc.id,
//           stageId: acc.stage_id,
//           phaseId: acc.phase_id,
//           purposeId: acc.purpose_id,
//           allChecklist: acc.All_checklist,
//           roleNames,
//         });
//       });
//     });
//     return result;
//   }, [users, numericProjectId]);

//   const configAndActivity = useMemo(() => {
//     if (!numericProjectId) {
//       return {
//         coverageList: [],
//         inactiveAssignments: [],
//         unconfiguredActivity: [],
//       };
//     }

//     const configAssignments = {};
//     const coverageByStage = {};

//     (projectUsersAccesses || []).forEach((acc) => {
//       const stageId = acc.stageId;
//       if (!stageId) return;
//       const stageRec =
//         coverageByStage[stageId] ||
//         (coverageByStage[stageId] = { stageId, roles: {} });

//       acc.roleNames.forEach((roleNameRaw) => {
//         const roleName = String(roleNameRaw || "").toUpperCase();
//         if (!roleName) return;
//         const key = `${stageId}|${roleName}|${acc.userId}`;
//         if (!configAssignments[key]) {
//           configAssignments[key] = {
//             stageId,
//             roleName,
//             userId: acc.userId,
//             userName: acc.userName,
//             fromAccess: acc,
//           };
//         }
//         const set =
//           stageRec.roles[roleName] ||
//           (stageRec.roles[roleName] = new Set());
//         set.add(acc.userId);
//       });
//     });

//     const actualAssignments = {};
//     if (workingItems && workingItems.length) {
//       workingItems.forEach((item) => {
//         const stageId = item.checklist?.stage_id;
//         if (!stageId) return;
//         const rolesObj = item.roles || {};
//         ["maker", "checker", "supervisor", "initializer"].forEach((rk) => {
//           const uid = rolesObj[rk]?.user_id;
//           if (!uid) return;
//           const roleName = rk.toUpperCase();
//           const key = `${stageId}|${roleName}|${uid}`;
//           const rec =
//             actualAssignments[key] ||
//             (actualAssignments[key] = {
//               stageId,
//               roleName,
//               userId: uid,
//               count: 0,
//             });
//           rec.count += 1;
//         });
//       });
//     }

//     const inactiveAssignments = [];
//     Object.entries(configAssignments).forEach(([key, cfg]) => {
//       const act = actualAssignments[key];
//       if (!act || !act.count) {
//         inactiveAssignments.push({
//           ...cfg,
//           count: 0,
//         });
//       }
//     });

//     const unconfiguredActivity = [];
//     Object.entries(actualAssignments).forEach(([key, act]) => {
//       if (!configAssignments[key]) {
//         unconfiguredActivity.push({
//           ...act,
//           userName: resolveUserName(act.userId),
//         });
//       }
//     });

//     const coverageList = Object.values(coverageByStage).map((entry) => {
//       const stageLabel =
//         stageMap[entry.stageId] || `Stage #${entry.stageId}`;
//       const roles = Object.entries(entry.roles).map(([roleName, set]) => ({
//         roleName,
//         userCount: set.size,
//       }));
//       roles.sort((a, b) => b.userCount - a.userCount);
//       return { stageId: entry.stageId, stageLabel, roles };
//     });

//     inactiveAssignments.sort((a, b) =>
//       a.userName.localeCompare(b.userName)
//     );
//     unconfiguredActivity.sort((a, b) => b.count - a.count);

//     return {
//       coverageList,
//       inactiveAssignments: inactiveAssignments.slice(0, 10),
//       unconfiguredActivity: unconfiguredActivity.slice(0, 10),
//     };
//   }, [projectUsersAccesses, workingItems, stageMap, userMap, numericProjectId]);

//   const configByUser = useMemo(() => {
//     const map = {};
//     (projectUsersAccesses || []).forEach((acc) => {
//       const rec =
//         map[acc.userId] ||
//         (map[acc.userId] = {
//           userId: acc.userId,
//           userName: acc.userName,
//           accesses: [],
//         });
//       rec.accesses.push(acc);
//     });
//     return Object.values(map)
//       .filter((r) => r.accesses.length)
//       .sort((a, b) => a.userName.localeCompare(b.userName));
//   }, [projectUsersAccesses]);

//     // Question-level stats with local filters (stage + category + building + floor + room + status)
//   const questionStatusData = useMemo(() => {
//     const items = Array.isArray(workingItems) ? workingItems : [];
//     if (!items.length) return [];

//     const {
//       stageId,
//       categoryId,
//       buildingId,
//       floorId,
//       roomCategory,
//       statusBucket,
//     } = questionFilters;

//     const filtered = items.filter((item) => {
//       const loc = item.location || {};
//       const cl = item.checklist || {};

//       // Stage filter
//       if (stageId) {
//         const sId = cl.stage_id;
//         if (!sId || String(sId) !== String(stageId)) return false;
//       }

//       // Checklist category filter
//       if (categoryId) {
//         const catId = cl.category_id || cl.category;
//         if (!catId || String(catId) !== String(categoryId)) return false;
//       }

//       // Building filter
//       if (buildingId) {
//         const bId = loc.building_id;
//         if (!bId || String(bId) !== String(buildingId)) return false;
//       }

//       // Floor filter (using flat → levelId mapping)
//       if (floorId) {
//         const flatId = loc.flat_id;
//         if (!flatId) return false;
//         const meta = flatLookup[flatId];
//         if (!meta || String(meta.levelId) !== String(floorId)) return false;
//       }

//       // Room category filter
//       if (roomCategory) {
//         const rc =
//           loc.room_category ||
//           loc.room_type ||
//           loc.room ||
//           null;
//         if (!rc || String(rc) !== String(roomCategory)) return false;
//       }

//       // Status bucket filter (open / closed / all)
//       const s = (item.item_status || "").toLowerCase();
//       if (statusBucket === "open") {
//         if (
//           !["pending_checker", "pending_for_inspector", "not_started"].includes(
//             s
//           )
//         ) {
//           return false;
//         }
//       } else if (statusBucket === "closed") {
//         if (s !== "completed") return false;
//       }

//       return true;
//     });

//     if (!filtered.length) return [];

//     const byQuestion = {};

//     filtered.forEach((item) => {
//       const key = item.item_title || `Item #${item.item_id}`;
//       const cl = item.checklist || {};
//       const catLabel = getParetoCategoryLabel(item, flatLookup, "checklist");

//       if (!byQuestion[key]) {
//         byQuestion[key] = {
//           question: key,
//           categoryLabel: null,
//           total: 0,
//           completed: 0,
//           pending_checker: 0,
//           pending_for_inspector: 0,
//           not_started: 0,
//           other: 0,
//         };
//       }

//       const rec = byQuestion[key];

//       if (!rec.categoryLabel && catLabel) {
//         rec.categoryLabel = catLabel;
//       }

//       const st = (item.item_status || "").toLowerCase();
//       rec.total += 1;
//       if (Object.prototype.hasOwnProperty.call(rec, st)) {
//         rec[st] += 1;
//       } else {
//         rec.other += 1;
//       }
//     });

//     let list = Object.values(byQuestion);

//     list.forEach((q) => {
//       q.openCount =
//         safeNumber(q.pending_checker) +
//         safeNumber(q.pending_for_inspector) +
//         safeNumber(q.not_started);
//       q.openPct =
//         q.total > 0 ? Math.round((q.openCount / q.total) * 100) : 0;
//       q.completedPct =
//         q.total > 0 ? Math.round((q.completed / q.total) * 100) : 0;
//     });

//     // Sort by open count desc, then total
//     list.sort(
//       (a, b) => b.openCount - a.openCount || b.total - a.total
//     );

//     // Top 15 questions for this slice
//     return list.slice(0, 15);
//   }, [workingItems, questionFilters, flatLookup]);


//   // Custom Tooltip Components
//   const CustomTooltip = ({ active, payload, label }) => {
//     if (!active || !payload) return null;

//     return (
//       <div
//         className="rounded-xl p-4 shadow-2xl border backdrop-blur-xl"
//         style={{
//           background:
//             theme === "dark"
//               ? "rgba(30,41,59,0.95)"
//               : "rgba(255,255,255,0.95)",
//           borderColor: theme === "dark" ? "#475569" : "#cbd5e1",
//         }}
//       >
//         <p className="font-bold mb-2" style={{ color: textColor }}>
//           {label}
//         </p>
//         {payload.map((entry, index) => (
//           <p
//             key={index}
//             className="text-sm font-semibold"
//             style={{ color: entry.color }}
//           >
//             {entry.name}: {entry.value}
//           </p>
//         ))}
//       </div>
//     );
//   };

//   // Health Score Color
//   const getHealthColor = (score) => {
//     if (score >= 80)
//       return {
//         color: "#10b981",
//         label: "Excellent",
//         bg: "rgba(16,185,129,0.1)",
//       };
//     if (score >= 60)
//       return {
//         color: "#3b82f6",
//         label: "Good",
//         bg: "rgba(59,130,246,0.1)",
//       };
//     if (score >= 40)
//       return {
//         color: "#f59e0b",
//         label: "Fair",
//         bg: "rgba(245,158,11,0.1)",
//       };
//     return {
//       color: "#ef4444",
//       label: "Needs Attention",
//       bg: "rgba(239,68,68,0.1)",
//     };
//   };

//   const healthInfo = getHealthColor(projectHealthScore);

//   const {
//     coverageList = [],
//     inactiveAssignments = [],
//     unconfiguredActivity = [],
//   } = configAndActivity || {};

//   const filteredItems = useMemo(() => {
//     return Array.isArray(workingItems) ? workingItems : [];
//   }, [workingItems]);



//   // ⬇️ old ko hatao, ye naya version paste karo
// const handleOpenFlatReport = (flatId, flatMeta = null) => {
//   if (!flatId) return;

//   navigate(`/projects/${id}/flat-report/${flatId}`, {
//     state: {
//       project: projectFromState || null,
//       flatId,
//       flatMeta, // 👈 flat ka number, type, level, etc.
//       // 👇 jo global filters tumne upar use kiye hain, wo bhi pass kar dete
//       filters: {
//         stageId: globalFilters.stageId || "",
//         buildingId: globalFilters.buildingId || "",
//       },
//     },
//   });
// };




//   return (
//     <div
//       className="min-h-screen transition-colors duration-300"
//       style={{
//         background:
//           theme === "dark"
//             ? "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
//             : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
//       }}
//     >
//       <div className="mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12 py-8 md:py-12">
//         {/* Executive Header Card */}
//         <div
//           className="relative rounded-3xl overflow-hidden backdrop-blur-xl transition-all duration-500 hover:shadow-2xl mb-8"
//           style={{
//             backgroundColor:
//               theme === "dark"
//                 ? "rgba(30,41,59,0.7)"
//                 : "rgba(255,255,255,0.9)",
//             border: `1px solid ${
//               theme === "dark" ? "#334155" : "#e2e8f0"
//             }`,
//             boxShadow:
//               theme === "dark"
//                 ? "0 25px 60px -15px rgba(0,0,0,0.5)"
//                 : "0 25px 60px -15px rgba(15,23,42,0.15)",
//           }}
//         >
//           <div
//             className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
//             style={{
//               background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
//             }}
//           />
//           <div
//             className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none"
//             style={{
//               background: "linear-gradient(135deg, #10b981, #3b82f6)",
//             }}
//           />

//           <div className="relative z-10 p-8 md:p-10">
//             <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
//               <div className="flex items-start gap-5 flex-1">
//                 <button
//                   type="button"
//                   onClick={() => navigate("/config")}
//                   className="mt-2 inline-flex items-center justify-center w-12 h-12 rounded-2xl border-2 font-semibold hover:scale-110 transition-all duration-300"
//                   style={{
//                     borderColor:
//                       theme === "dark" ? "#475569" : "#cbd5e1",
//                     color: textColor,
//                     backgroundColor:
//                       theme === "dark"
//                         ? "rgba(15,23,42,0.6)"
//                         : "rgba(255,255,255,0.9)",
//                   }}
//                 >
//                   <span className="text-xl">←</span>
//                 </button>
//                 <div className="flex-1">
//                   <div
//                     className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-bold mb-4 backdrop-blur-xl"
//                     style={{
//                       background:
//                         viewMode === "manager"
//                           ? "linear-gradient(135deg, #10b981, #34d399)"
//                           : "linear-gradient(135deg, #3b82f6, #60a5fa)",
//                       color: "#ffffff",
//                       boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
//                     }}
//                   >
//                     <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse" />
//                     {viewMode === "manager"
//                       ? "OVERVIEW OF PROJECT"
//                       : "PROJECT HEAD VIEW"}
//                   </div>

//                   <h1
//                     className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-3"
//                     style={{
//                       color: textColor,
//                       textShadow:
//                         theme === "dark"
//                           ? "0 2px 10px rgba(0,0,0,0.3)"
//                           : "none",
//                     }}
//                   >
//                     {projectName}
//                   </h1>
//                   <p
//                     className="text-base md:text-lg font-medium max-w-3xl leading-relaxed"
//                     style={{ color: secondaryTextColor }}
//                   >
//                     Comprehensive project analytics with real-time insights,
//                     visual performance metrics, and strategic decision-making
//                     data
//                   </p>

//                   {Array.isArray(projectFromState?.roles) &&
//                     projectFromState.roles.length > 0 && (
//                       <div className="mt-5 flex flex-wrap gap-2">
//                         {projectFromState.roles.map((r, idx) => {
//                           const label =
//                             typeof r === "string" ? r : r?.role || "Role";
//                           return (
//                             <span
//                               key={idx}
//                               className="px-4 py-2 rounded-full text-xs font-bold backdrop-blur-xl"
//                               style={{
//                                 background:
//                                   theme === "dark"
//                                     ? "rgba(51,65,85,0.8)"
//                                     : "rgba(241,245,249,0.9)",
//                                 color: textColor,
//                                 border: `1px solid ${
//                                   theme === "dark"
//                                     ? "#475569"
//                                     : "#cbd5e1"
//                                 }`,
//                               }}
//                             >
//                               {label}
//                             </span>
//                           );
//                         })}
//                       </div>
//                     )}
//                 </div>
//               </div>

//               {hasData && (
//                 <div className="flex flex-col items-end gap-4">
//                   <div className="text-right">
//                     <div
//                       className="text-xs font-bold uppercase tracking-wider mb-2"
//                       style={{ color: secondaryTextColor }}
//                     >
//                       Completion Rate
//                     </div>
//                     <div
//                       className="text-6xl font-black mb-3"
//                       style={{
//                         background:
//                           "linear-gradient(135deg, #10b981, #34d399)",
//                         WebkitBackgroundClip: "text",
//                         WebkitTextFillColor: "transparent",
//                         backgroundClip: "text",
//                       }}
//                     >
//                       {completionRate}%
//                     </div>
//                   </div>
//                   <div className="w-56 h-3 rounded-full bg-black/10 overflow-hidden backdrop-blur-xl">
//                     <div
//                       className="h-full rounded-full transition-all duration-1000"
//                       style={{
//                         width: `${completionRate}%`,
//                         background:
//                           "linear-gradient(90deg, #10b981, #34d399, #6ee7b7)",
//                       }}
//                     />
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {loading && (
//           <div className="py-24 flex flex-col items-center justify-center">
//             <div className="relative mb-6">
//               <div
//                 className="w-20 h-20 rounded-full border-4 border-t-transparent animate-spin"
//                 style={{
//                   borderColor:
//                     theme === "dark" ? "#475569" : "#cbd5e1",
//                   borderTopColor: "transparent",
//                 }}
//               />
//               <div
//                 className="absolute inset-3 rounded-full border-2 border-dashed animate-ping"
//                 style={{
//                   borderColor:
//                     theme === "dark" ? "#64748b" : "#94a3b8",
//                 }}
//               />
//             </div>
//             <p
//               className="text-lg font-bold opacity-80"
//               style={{ color: textColor }}
//             >
//               Loading Executive Dashboard...
//             </p>
//           </div>
//         )}

//         {!loading && error && (
//           <div
//             className="rounded-3xl border-2 px-8 py-8 flex items-start gap-5 backdrop-blur-xl"
//             style={{
//               borderColor: "rgba(248,113,113,0.5)",
//               background:
//                 theme === "dark"
//                   ? "rgba(127,29,29,0.3)"
//                   : "rgba(254,226,226,0.95)",
//             }}
//           >
//             <div
//               className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black"
//               style={{
//                 backgroundColor: "rgba(248,113,113,0.2)",
//                 color: "#b91c1c",
//               }}
//             >
//               !
//             </div>
//             <div>
//               <div
//                 className="font-black text-xl mb-2"
//                 style={{ color: textColor }}
//               >
//                 Unable to Load Dashboard
//               </div>
//               <div className="text-base opacity-80">{error}</div>
//             </div>
//           </div>
//         )}

//         {hasData && (
//           <div className="space-y-8">
//             {/* PROJECT HEALTH SCORE + QUICK STATS */}
//             <div className="grid gap-6 lg:grid-cols-3">
//               <div
//                 className="lg:col-span-1 rounded-3xl border-2 p-8 backdrop-blur-xl relative overflow-hidden"
//                 style={{
//                   background:
//                     theme === "dark"
//                       ? "linear-gradient(135deg, rgba(30,41,59,0.8), rgba(51,65,85,0.6))"
//                       : "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(241,245,249,0.9))",
//                   borderColor: healthInfo.color,
//                   boxShadow: `0 10px 40px ${healthInfo.color}40`,
//                 }}
//               >
//                 <div
//                   className="absolute inset-0 opacity-5"
//                   style={{ background: healthInfo.color }}
//                 />
//                 <div className="relative z-10">
//                   <div
//                     className="text-xs font-bold uppercase tracking-wider mb-3"
//                     style={{ color: secondaryTextColor }}
//                   >
//                     Project Health Score
//                   </div>
//                   <div className="flex items-end gap-4 mb-6">
//                     <div
//                       className="text-7xl font-black"
//                       style={{ color: healthInfo.color }}
//                     >
//                       {projectHealthScore}
//                     </div>
//                     <div className="pb-3">
//                       <div
//                         className="text-2xl font-black mb-1"
//                         style={{ color: healthInfo.color }}
//                       >
//                         /100
//                       </div>
//                       <div
//                         className="text-sm font-bold px-3 py-1 rounded-full"
//                         style={{
//                           background: healthInfo.bg,
//                           color: healthInfo.color,
//                         }}
//                       >
//                         {healthInfo.label}
//                       </div>
//                     </div>
//                   </div>
//                   <div className="w-full h-3 rounded-full bg-black/10 overflow-hidden mb-4">
//                     <div
//                       className="h-full rounded-full transition-all duration-1000"
//                       style={{
//                         width: `${projectHealthScore}%`,
//                         background: healthInfo.color,
//                       }}
//                     />
//                   </div>
//                   <div
//                     className="text-xs font-semibold space-y-2"
//                     style={{ color: secondaryTextColor }}
//                   >
//                     <div className="flex justify-between">
//                       <span>Completion Impact:</span>
//                       <span style={{ color: textColor }}>40%</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span>Submission Rate:</span>
//                       <span style={{ color: textColor }}>30%</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span>Pending Work:</span>
//                       <span style={{ color: textColor }}>30%</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Quick Stats */}
//               <div className="lg:col-span-2 grid gap-4 md:grid-cols-2">
//                 <div
//                   className="rounded-3xl border p-6 backdrop-blur-xl hover:shadow-xl transition-all duration-300"
//                   style={{
//                     background:
//                       theme === "dark"
//                         ? "rgba(30,41,59,0.6)"
//                         : "rgba(255,255,255,0.95)",
//                     borderColor:
//                       theme === "dark" ? "#475569" : "#cbd5e1",
//                   }}
//                 >
//                   <div
//                     className="text-xs font-bold uppercase tracking-wider mb-2"
//                     style={{ color: secondaryTextColor }}
//                   >
//                     Total Items
//                   </div>
//                   <div
//                     className="text-4xl font-black mb-2"
//                     style={{ color: textColor }}
//                   >
//                     {fmtInt(totalItems)}
//                   </div>
//                   <div
//                     className="text-sm font-semibold"
//                     style={{ color: secondaryTextColor }}
//                   >
//                     Across all stages &amp; locations (after filters)
//                   </div>
//                 </div>

//                 <div
//                   className="rounded-3xl border p-6 backdrop-blur-xl hover:shadow-xl transition-all duration-300"
//                   style={{
//                     background:
//                       theme === "dark"
//                         ? "linear-gradient(135deg, #064e3b, #065f46)"
//                         : "linear-gradient(135deg, #d1fae5, #a7f3d0)",
//                     borderColor:
//                       theme === "dark" ? "#059669" : "#10b981",
//                   }}
//                 >
//                   <div className="flex justify-between items-center mb-2">
//                     <div
//                       className="text-xs font-bold uppercase tracking-wider"
//                       style={{
//                         color:
//                           theme === "dark" ? "#6ee7b7" : "#065f46",
//                       }}
//                     >
//                       With Submission
//                     </div>
//                     <div className="text-xs font-black px-3 py-1 rounded-full bg-white/20">
//                       {withSubmissionRate}%
//                     </div>
//                   </div>
//                   <div
//                     className="text-4xl font-black mb-3"
//                     style={{
//                       color:
//                         theme === "dark" ? "#d1fae5" : "#065f46",
//                     }}
//                   >
//                     {fmtInt(totalWithSubmission)}
//                   </div>
//                   <div className="w-full h-2 rounded-full bg-black/20 overflow-hidden">
//                     <div
//                       className="h-full rounded-full transition-all duration-1000"
//                       style={{
//                         width: `${withSubmissionRate}%`,
//                         background:
//                           "linear-gradient(90deg, #10b981, #34d399)",
//                       }}
//                     />
//                   </div>
//                 </div>

//                 <div
//                   className="rounded-3xl border p-6 backdrop-blur-xl hover:shadow-xl transition-all duration-300"
//                   style={{
//                     background:
//                       theme === "dark"
//                         ? "linear-gradient(135deg, #1e3a8a, #1e40af)"
//                         : "linear-gradient(135deg, #dbeafe, #bfdbfe)",
//                     borderColor:
//                       theme === "dark" ? "#3b82f6" : "#60a5fa",
//                   }}
//                 >
//                   <div
//                     className="text-xs font-bold uppercase tracking-wider mb-2"
//                     style={{
//                       color:
//                         theme === "dark" ? "#93c5fd" : "#1e40af",
//                     }}
//                   >
//                     Pending Checker
//                   </div>
//                   <div
//                     className="text-4xl font-black"
//                     style={{
//                       color:
//                         theme === "dark" ? "#dbeafe" : "#1e40af",
//                     }}
//                   >
//                     {fmtInt(byStatus.pending_checker || 0)}
//                   </div>
//                 </div>

//                 <div
//                   className="rounded-3xl border p-6 backdrop-blur-xl hover:shadow-xl transition-all duration-300"
//                   style={{
//                     background:
//                       theme === "dark"
//                         ? "linear-gradient(135deg, #92400e, #b45309)"
//                         : "linear-gradient(135deg, #fed7aa, #fdba74)",
//                     borderColor:
//                       theme === "dark" ? "#f97316" : "#fb923c",
//                   }}
//                 >
//                   <div
//                     className="text-xs font-bold uppercase tracking-wider mb-2"
//                     style={{
//                       color:
//                         theme === "dark" ? "#fcd34d" : "#92400e",
//                     }}
//                   >
//                     Pending Inspector
//                   </div>
//                   <div
//                     className="text-4xl font-black"
//                     style={{
//                       color:
//                         theme === "dark" ? "#fed7aa" : "#92400e",
//                     }}
//                   >
//                     {fmtInt(byStatus.pending_for_inspector || 0)}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* GLOBAL FILTERS BAR – applies to the whole page */}
//             <div
//               className="mt-2 rounded-3xl border px-4 py-3 md:px-6 md:py-4 backdrop-blur-xl"
//               style={{
//                 background:
//                   theme === "dark"
//                     ? "rgba(15,23,42,0.85)"
//                     : "rgba(255,255,255,0.95)",
//                 borderColor: theme === "dark" ? "#475569" : "#cbd5e1",
//               }}
//             >
//               <div className="flex flex-wrap gap-3 items-center justify-between">
//                 <div>
//                   <div
//                     className="text-xs font-bold uppercase tracking-wider mb-1"
//                     style={{ color: secondaryTextColor }}
//                   >
//                     Global Filters
//                   </div>
//                   <div
//                     className="text-[11px] font-semibold"
//                     style={{ color: secondaryTextColor }}
//                   >
//                     In filters se niche ke sab charts, cards aur tables ka data
//                     change hota hai.
//                   </div>
//                 </div>

//                 <div className="flex flex-wrap gap-3">
//                   {/* Status */}
//                   <div className="min-w-[160px]">
//                     <label
//                       className="text-[11px] font-semibold block mb-1"
//                       style={{ color: secondaryTextColor }}
//                     >
//                       Status
//                     </label>
//                     <select
//                       value={globalFilters.status}
//                       onChange={(e) =>
//                         setGlobalFilters((prev) => ({
//                           ...prev,
//                           status: e.target.value,
//                         }))
//                       }
//                       className="w-full px-3 py-2 rounded-xl border text-sm font-semibold outline-none"
//                       style={{
//                         borderColor:
//                           theme === "dark" ? "#475569" : "#cbd5e1",
//                         background:
//                           theme === "dark"
//                             ? "rgba(15,23,42,0.9)"
//                             : "rgba(248,250,252,0.95)",
//                         color: textColor,
//                       }}
//                     >
//                       <option value="">All statuses</option>
//                       {distinctStatuses.map((s) => (
//                         <option key={s} value={s}>
//                           {titleCaseStatus(s)}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   {/* Role */}
//                   <div className="min-w-[150px]">
//                     <label
//                       className="text-[11px] font-semibold block mb-1"
//                       style={{ color: secondaryTextColor }}
//                     >
//                       Role touch
//                     </label>
//                     <select
//                       value={globalFilters.role}
//                       onChange={(e) =>
//                         setGlobalFilters((prev) => ({
//                           ...prev,
//                           role: e.target.value,
//                         }))
//                       }
//                       className="w-full px-3 py-2 rounded-xl border text-sm font-semibold outline-none"
//                       style={{
//                         borderColor:
//                           theme === "dark" ? "#475569" : "#cbd5e1",
//                         background:
//                           theme === "dark"
//                             ? "rgba(15,23,42,0.9)"
//                             : "rgba(248,250,252,0.95)",
//                         color: textColor,
//                       }}
//                     >
//                       <option value="">All roles</option>
//                       <option value="maker">Maker</option>
//                       <option value="supervisor">Supervisor</option>
//                       <option value="checker">Checker</option>
//                     </select>
//                   </div>

//                   {/* Stage */}
//                   <div className="min-w-[180px]">
//                     <label
//                       className="text-[11px] font-semibold block mb-1"
//                       style={{ color: secondaryTextColor }}
//                     >
//                       Stage
//                     </label>
//                     <select
//                       value={globalFilters.stageId}
//                       onChange={(e) =>
//                         setGlobalFilters((prev) => ({
//                           ...prev,
//                           stageId: e.target.value,
//                         }))
//                       }
//                       className="w-full px-3 py-2 rounded-xl border text-sm font-semibold outline-none"
//                       style={{
//                         borderColor:
//                           theme === "dark" ? "#475569" : "#cbd5e1",
//                         background:
//                           theme === "dark"
//                             ? "rgba(15,23,42,0.9)"
//                             : "rgba(248,250,252,0.95)",
//                         color: textColor,
//                       }}
//                     >
//                       <option value="">All stages</option>
//                       {Object.entries(stageMap).map(([sid, label]) => (
//                         <option key={sid} value={sid}>
//                           {label}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                                     {/* Flat category (1 BHK / 2 BHK etc.) */}
//                   {flatCategoryOptions.length > 0 && (
//                     <div className="min-w-[180px]">
//                       <label
//                         className="text-[11px] font-semibold block mb-1"
//                         style={{ color: secondaryTextColor }}
//                       >
//                         Flat category
//                       </label>
//                       <select
//                         value={globalFilters.flatCategory}
//                         onChange={(e) =>
//                           setGlobalFilters((prev) => ({
//                             ...prev,
//                             flatCategory: e.target.value,
//                           }))
//                         }
//                         className="w-full px-3 py-2 rounded-xl border text-sm font-semibold outline-none"
//                         style={{
//                           borderColor:
//                             theme === "dark" ? "#475569" : "#cbd5e1",
//                           background:
//                             theme === "dark"
//                               ? "rgba(15,23,42,0.9)"
//                               : "rgba(248,250,252,0.95)",
//                           color: textColor,
//                         }}
//                       >
//                         <option value="">All Flat Categories</option>
//                         {flatCategoryOptions.map((cat) => (
//                           <option key={cat} value={cat}>
//                             {cat}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                   )}

//                   {/* Room category (Living, Bedroom, Toilet etc.) */}
//                   {roomCategoryOptions.length > 0 && (
//                     <div className="min-w-[180px]">
//                       <label
//                         className="text-[11px] font-semibold block mb-1"
//                         style={{ color: secondaryTextColor }}
//                       >
//                         Room category
//                       </label>
//                       <select
//                         value={globalFilters.roomCategory}
//                         onChange={(e) =>
//                           setGlobalFilters((prev) => ({
//                             ...prev,
//                             roomCategory: e.target.value,
//                           }))
//                         }
//                         className="w-full px-3 py-2 rounded-xl border text-sm font-semibold outline-none"
//                         style={{
//                           borderColor:
//                             theme === "dark" ? "#475569" : "#cbd5e1",
//                           background:
//                             theme === "dark"
//                               ? "rgba(15,23,42,0.9)"
//                               : "rgba(248,250,252,0.95)",
//                           color: textColor,
//                         }}
//                       >
//                         <option value="">All rooms</option>
//                         {roomCategoryOptions.map((cat) => (
//                           <option key={cat} value={cat}>
//                             {cat}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                   )}


//                   {/* Building */}
//                   {buildingOptions.length > 0 && (
//                     <div className="min-w-[180px]">
//                       <label
//                         className="text-[11px] font-semibold block mb-1"
//                         style={{ color: secondaryTextColor }}
//                       >
//                         Building
//                       </label>
//                       <select
//                         value={globalFilters.buildingId}
//                         onChange={(e) =>
//                           setGlobalFilters((prev) => ({
//                             ...prev,
//                             buildingId: e.target.value,
//                           }))
//                         }
//                         className="w-full px-3 py-2 rounded-xl border text-sm font-semibold outline-none"
//                         style={{
//                           borderColor:
//                             theme === "dark" ? "#475569" : "#cbd5e1",
//                           background:
//                             theme === "dark"
//                               ? "rgba(15,23,42,0.9)"
//                               : "rgba(248,250,252,0.95)",
//                           color: textColor,
//                         }}
//                       >
//                         <option value="">All buildings</option>
//                         {buildingOptions.map((b) => (
//                           <option key={b.id} value={b.id}>
//                             {b.label}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                   )}

//                   {/* Time window */}
//                   <div className="min-w-[160px]">
//                     <label
//                       className="text-[11px] font-semibold block mb-1"
//                       style={{ color: secondaryTextColor }}
//                     >
//                       Time window
//                     </label>
//                     <select
//                       value={globalFilters.timeWindow}
//                       onChange={(e) =>
//                         setGlobalFilters((prev) => ({
//                           ...prev,
//                           timeWindow: e.target.value,
//                         }))
//                       }
//                       className="w-full px-3 py-2 rounded-xl border text-sm font-semibold outline-none"
//                       style={{
//                         borderColor:
//                           theme === "dark" ? "#475569" : "#cbd5e1",
//                         background:
//                           theme === "dark"
//                             ? "rgba(15,23,42,0.9)"
//                             : "rgba(248,250,252,0.95)",
//                         color: textColor,
//                       }}
//                     >
//                       <option value="all">All time</option>
//                       <option value="30d">Last 30 days</option>
//                       <option value="7d">Last 7 days</option>
//                     </select>
//                   </div>

//                   {/* Clear */}
//                   <button
//                     type="button"
//                     onClick={() =>
//                       setGlobalFilters({
//                         status: "",
//                         role: "",
//                         stageId: "",
//                         buildingId: "",
//                         flatCategory: "",
//                         roomCategory: "",
//                         timeWindow: "all",
//                       })
//                     }
//                     className="px-3 py-2 rounded-xl text-xs font-bold border"
//                     style={{
//                       borderColor:
//                         theme === "dark" ? "#64748b" : "#cbd5e1",
//                       background:
//                         theme === "dark"
//                           ? "rgba(15,23,42,0.9)"
//                           : "rgba(248,250,252,0.95)",
//                       color: secondaryTextColor,
//                     }}
//                   >
//                     Clear
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* VISUAL ANALYTICS GRID */}
//             <div className="grid gap-6 lg:grid-cols-2">
//               {/* Stage Progress Chart */}
//               {stageProgressChartData.length > 0 && (
//                 <div
//                   className="rounded-3xl border p-6 backdrop-blur-xl"
//                   style={{
//                     background:
//                       theme === "dark"
//                         ? "rgba(30,41,59,0.8)"
//                         : "rgba(255,255,255,0.98)",
//                     borderColor:
//                       theme === "dark" ? "#475569" : "#cbd5e1",
//                   }}
//                 >
//                   <h3
//                     className="text-xl font-black mb-4"
//                     style={{ color: textColor }}
//                   >
//                     📊 Stage-wise Progress
//                   </h3>
//                   <ResponsiveContainer width="100%" height={300}>
//                     <BarChart
//                       data={stageProgressChartData}
//                       layout="vertical"
//                     >
//                       <CartesianGrid
//                         strokeDasharray="3 3"
//                         stroke={
//                           theme === "dark" ? "#334155" : "#e2e8f0"
//                         }
//                       />
//                       <XAxis
//                         type="number"
//                         stroke={secondaryTextColor}
//                       />
//                       <YAxis
//                         dataKey="name"
//                         type="category"
//                         width={100}
//                         stroke={secondaryTextColor}
//                         style={{ fontSize: "11px" }}
//                       />
//                       <Tooltip content={<CustomTooltip />} />
//                       <Legend />
//                       <Bar
//                         dataKey="completed"
//                         stackId="a"
//                         fill={CHART_COLORS.success}
//                         name="Completed"
//                       />
//                       <Bar
//                         dataKey="pending_checker"
//                         stackId="a"
//                         fill={CHART_COLORS.secondary}
//                         name="Pending Checker"
//                       />
//                       <Bar
//                         dataKey="pending_for_inspector"
//                         stackId="a"
//                         fill={CHART_COLORS.warning}
//                         name="Pending Inspector"
//                       />
//                       <Bar
//                         dataKey="not_started"
//                         stackId="a"
//                         fill={CHART_COLORS.danger}
//                         name="Not Started"
//                       />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </div>
//               )}
//             {/* Stage-wise Pareto – 80/20 pending analysis */}
//           {paretoCategoryData.length > 0 && (
//   <div
//     className="rounded-3xl border p-6 backdrop-blur-xl"
//     style={{
//       background:
//         theme === "dark"
//           ? "rgba(30,41,59,0.9)"
//           : "rgba(255,255,255,0.98)",
//       borderColor: theme === "dark" ? "#475569" : "#cbd5e1",
//     }}
//   >
//     <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
//       <div>
//         <h3
//           className="text-xl font-black flex items-center gap-2"
//           style={{ color: textColor }}
//         >
//           📌 Pareto – Category 80/20 (Deep)
//         </h3>
//         {/* <p
//           className="text-[11px] font-semibold"
//           style={{ color: secondaryTextColor }}
//         >
//           Stage + Building filter upar Global Filters se aayega. Yaha se
//           floors aur category dimension choose karke dekh sakte ho kaun
//           se category me pending ka 80% load aa raha hai.
//         </p> */}
//       </div>

//       {/* Category dimension select */}
//             <div className="flex flex-wrap gap-3">
//         {/* Category dimension select */}
//         <div className="min-w-[180px]">
//           <label
//             className="text-[11px] font-semibold block mb-1"
//             style={{ color: secondaryTextColor }}
//           >
//             Category dimension
//           </label>
//           <select
//             value={paretoFilters.categoryMode}
//             onChange={(e) =>
//               setParetoFilters((prev) => ({
//                 ...prev,
//                 categoryMode: e.target.value,
//               }))
//             }
//             className="w-full px-3 py-2 rounded-xl border text-sm font-semibold outline-none"
//             style={{
//               borderColor: theme === "dark" ? "#475569" : "#cbd5e1",
//               background:
//                 theme === "dark"
//                   ? "rgba(15,23,42,0.9)"
//                   : "rgba(248,250,252,0.95)",
//               color: textColor,
//             }}
//           >
//             {PARETO_CATEGORY_MODES.map((m) => (
//               <option key={m.value} value={m.value}>
//                 {m.label}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Floors (multi-select) – only when building selected */}
//         {globalFilters.buildingId && floorOptions.length > 0 && (
//           <div className="min-w-[220px]">
//             <label
//               className="text-[11px] font-semibold block mb-1"
//               style={{ color: secondaryTextColor }}
//             >
//               Floors (multi-select)
//             </label>
//             <select
//               multiple
//               value={paretoFilters.floorIds}
//               onChange={(e) => {
//                 const selected = Array.from(
//                   e.target.selectedOptions
//                 ).map((opt) => opt.value);
//                 setParetoFilters((prev) => ({
//                   ...prev,
//                   floorIds: selected,
//                 }));
//               }}
//               className="w-full px-3 py-2 rounded-xl border text-sm font-semibold outline-none"
//               style={{
//                 borderColor: theme === "dark" ? "#475569" : "#cbd5e1",
//                 background:
//                   theme === "dark"
//                     ? "rgba(15,23,42,0.9)"
//                     : "rgba(248,250,252,0.95)",
//                 color: textColor,
//                 minHeight: "70px",
//               }}
//             >
//               {floorOptions.map((f) => (
//                 <option key={f.id} value={f.id}>
//                   {f.label}
//                 </option>
//               ))}
//             </select>
//             <p
//               className="text-[10px] mt-1"
//               style={{ color: secondaryTextColor }}
//             >
//               Windows: Ctrl + Click, Mac: ⌘ + Click for multiple floors
//             </p>
//           </div>
//         )}

//         {/* Focus Flat (optional) – yaha se tu "Flat 3" choose karega */}
//         {flatOptions.length > 0 && (
//   <div className="min-w-[220px]">
//     <label
//       className="text-[11px] font-semibold block mb-1"
//       style={{ color: secondaryTextColor }}
//     >
//       Focus flats (multi-select)
//     </label>
//     <select
//       multiple
//       value={paretoFilters.focusFlatIds}
//       onChange={(e) => {
//         const selected = Array.from(e.target.selectedOptions).map(
//           (opt) => opt.value
//         );
//         setParetoFilters((prev) => ({
//           ...prev,
//           focusFlatIds: selected,
//         }));
//       }}
//       className="w-full px-3 py-2 rounded-xl border text-sm font-semibold outline-none"
//       style={{
//         borderColor:
//           theme === "dark" ? "#475569" : "#cbd5e1",
//         background:
//           theme === "dark"
//             ? "rgba(15,23,42,0.9)"
//             : "rgba(248,250,252,0.95)",
//         color: textColor,
//         minHeight: "70px",
//       }}
//     >
//       {flatOptions.map((f) => (
//         <option key={f.id} value={f.id}>
//           {f.label}
//         </option>
//       ))}
//     </select>
//     <p
//       className="text-[10px] mt-1"
//       style={{ color: secondaryTextColor }}
//     >
//       Windows: Ctrl + Click, Mac: ⌘ + Click for multiple flats
//     </p>
//   </div>
// )}

//       </div>

//     </div>

//     {paretoCategoryData.length === 0 ? (
//       <div
//         className="mt-4 text-xs font-semibold"
//         style={{ color: secondaryTextColor }}
//       >
//         No pending items for current filters.
//       </div>
//     ) : (
//       <ResponsiveContainer width="100%" height={320}>
//         <ComposedChart data={paretoCategoryData}>
//           <CartesianGrid
//             strokeDasharray="3 3"
//             stroke={theme === "dark" ? "#334155" : "#e2e8f0"}
//           />
//           <XAxis
//             dataKey="categoryLabel"
//             stroke={secondaryTextColor}
//             angle={-35}
//             textAnchor="end"
//             height={80}
//             style={{ fontSize: "11px" }}
//           />
//           {/* Left Y-axis -> Pending count */}
//           <YAxis
//             yAxisId="left"
//             stroke={secondaryTextColor}
//             width={50}
//           />
//           {/* Right Y-axis -> Cumulative % */}
//           <YAxis
//             yAxisId="right"
//             orientation="right"
//             stroke={secondaryTextColor}
//             domain={[0, 100]}
//             tickFormatter={(v) => `${v}%`}
//             width={40}
//           />
//           <Tooltip content={<CustomTooltip />} />
//           <Legend />
//           {/* Bars: pending items */}
//                     {/* Bars: pending items – top 80% ko red, baaki grey */}
//           <Bar
//             yAxisId="left"
//             dataKey="pending"
//             name="Pending Items"
//           >
//             {paretoCategoryData.map((entry, index) => (
//               <Cell
//                 key={`bar-${index}`}
//                 fill={
//                   entry.isTop80
//                     ? CHART_COLORS.danger // top 80% load
//                     : "#9ca3af"          // remaining 20% muted
//                 }
//               />
//             ))}
//           </Bar>

//           {/* Line: cumulative percentage */}
//           <Line
//             yAxisId="right"
//             type="monotone"
//             dataKey="cumulativePct"
//             name="Cumulative %"
//             stroke={CHART_COLORS.secondary}
//             strokeWidth={2}
//             dot={false}
//           />

//         </ComposedChart>
//       </ResponsiveContainer>
//     )}
//   </div>
// )}


//               {/* Status Distribution Pie */}
//               {statusPieData.length > 0 && (
//                 <div
//                   className="rounded-3xl border p-6 backdrop-blur-xl"
//                   style={{
//                     background:
//                       theme === "dark"
//                         ? "rgba(30,41,59,0.8)"
//                         : "rgba(255,255,255,0.98)",
//                     borderColor:
//                       theme === "dark" ? "#475569" : "#cbd5e1",
//                   }}
//                 >
//                   <h3
//                     className="text-xl font-black mb-4"
//                     style={{ color: textColor }}
//                   >
//                     🎯 Status Distribution
//                   </h3>
//                   <ResponsiveContainer width="100%" height={300}>
//                     <PieChart>
//                       <Pie
//                         data={statusPieData}
//                         cx="50%"
//                         cy="50%"
//                         labelLine={false}
//                         label={({ name, percent }) =>
//                           `${name}: ${(percent * 100).toFixed(0)}%`
//                         }
//                         outerRadius={100}
//                         fill="#8884d8"
//                         dataKey="value"
//                       >
//                         {statusPieData.map((entry, index) => (
//                           <Cell
//                             key={`cell-${index}`}
//                             fill={entry.color}
//                           />
//                         ))}
//                       </Pie>
//                       <Tooltip content={<CustomTooltip />} />
//                     </PieChart>
//                   </ResponsiveContainer>
//                 </div>
//               )}
//             </div>

//             {/* Team Performance & Workload */}
//             <div className="grid gap-6 lg:grid-cols-2">
//               {/* Team Performance */}
//               {teamPerformanceData.length > 0 && (
//                 <div
//                   className="rounded-3xl border p-6 backdrop-blur-xl"
//                   style={{
//                     background:
//                       theme === "dark"
//                         ? "rgba(30,41,59,0.8)"
//                         : "rgba(255,255,255,0.98)",
//                     borderColor:
//                       theme === "dark" ? "#475569" : "#cbd5e1",
//                   }}
//                 >
//                   <h3
//                     className="text-xl font-black mb-4"
//                     style={{ color: textColor }}
//                   >
//                     👥 Top Team Performance
//                   </h3>
//                   <ResponsiveContainer width="100%" height={300}>
//                     <BarChart data={teamPerformanceData}>
//                       <CartesianGrid
//                         strokeDasharray="3 3"
//                         stroke={
//                           theme === "dark" ? "#334155" : "#e2e8f0"
//                         }
//                       />
//                       <XAxis
//                         dataKey="userName"
//                         stroke={secondaryTextColor}
//                         angle={-45}
//                         textAnchor="end"
//                         height={100}
//                         style={{ fontSize: "10px" }}
//                       />
//                       <YAxis stroke={secondaryTextColor} />
//                       <Tooltip content={<CustomTooltip />} />
//                       <Legend />
//                       <Bar
//                         dataKey="completed"
//                         fill={CHART_COLORS.success}
//                         name="Completed"
//                       />
//                       <Bar
//                         dataKey="pending"
//                         fill={CHART_COLORS.warning}
//                         name="Pending"
//                       />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </div>
//               )}

//               {/* Workload Distribution */}
//               {workloadDistributionData.length > 0 && (
//                 <div
//                   className="rounded-3xl border p-6 backdrop-blur-xl"
//                   style={{
//                     background:
//                       theme === "dark"
//                         ? "rgba(30,41,59,0.8)"
//                         : "rgba(255,255,255,0.98)",
//                     borderColor:
//                       theme === "dark" ? "#475569" : "#cbd5e1",
//                   }}
//                 >
//                   <h3
//                     className="text-xl font-black mb-4"
//                     style={{ color: textColor }}
//                   >
//                     ⚖️ Role-wise Workload
//                   </h3>
//                   <ResponsiveContainer width="100%" height={300}>
//                     <BarChart data={workloadDistributionData}>
//                       <CartesianGrid
//                         strokeDasharray="3 3"
//                         stroke={
//                           theme === "dark" ? "#334155" : "#e2e8f0"
//                         }
//                       />
//                       <XAxis
//                         dataKey="role"
//                         stroke={secondaryTextColor}
//                         angle={-45}
//                         textAnchor="end"
//                         height={80}
//                         style={{ fontSize: "11px" }}
//                       />
//                       <YAxis stroke={secondaryTextColor} />
//                       <Tooltip content={<CustomTooltip />} />
//                       <Legend />
//                       <Bar
//                         dataKey="items"
//                         fill={CHART_COLORS.primary}
//                         name="Total Items"
//                       />
//                       <Bar
//                         dataKey="avgPerUser"
//                         fill={CHART_COLORS.info}
//                         name="Avg per User"
//                       />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </div>
//               )}
//             </div>

//             {/* Velocity Chart & Role Radar */}
//             <div className="grid gap-6 lg:grid-cols-2">
//               {/* Velocity/Timeline */}
//               {velocityChartData.length > 0 && (
//                 <div
//                   className="rounded-3xl border p-6 backdrop-blur-xl"
//                   style={{
//                     background:
//                       theme === "dark"
//                         ? "rgba(30,41,59,0.8)"
//                         : "rgba(255,255,255,0.98)",
//                     borderColor:
//                       theme === "dark" ? "#475569" : "#cbd5e1",
//                   }}
//                 >
//                   <h3
//                     className="text-xl font-black mb-4"
//                     style={{ color: textColor }}
//                   >
//                     📈 30-Day Activity Velocity
//                   </h3>
//                   <ResponsiveContainer width="100%" height={300}>
//                     <AreaChart data={velocityChartData}>
//                       <defs>
//                         <linearGradient
//                           id="colorCompleted"
//                           x1="0"
//                           y1="0"
//                           x2="0"
//                           y2="1"
//                         >
//                           <stop
//                             offset="5%"
//                             stopColor={CHART_COLORS.success}
//                             stopOpacity={0.8}
//                           />
//                           <stop
//                             offset="95%"
//                             stopColor={CHART_COLORS.success}
//                             stopOpacity={0}
//                           />
//                         </linearGradient>
//                         <linearGradient
//                           id="colorStarted"
//                           x1="0"
//                           y1="0"
//                           x2="0"
//                           y2="1"
//                         >
//                           <stop
//                             offset="5%"
//                             stopColor={CHART_COLORS.secondary}
//                             stopOpacity={0.8}
//                           />
//                           <stop
//                             offset="95%"
//                             stopColor={CHART_COLORS.secondary}
//                             stopOpacity={0}
//                           />
//                         </linearGradient>
//                       </defs>
//                       <CartesianGrid
//                         strokeDasharray="3 3"
//                         stroke={
//                           theme === "dark" ? "#334155" : "#e2e8f0"
//                         }
//                       />
//                       <XAxis
//                         dataKey="date"
//                         stroke={secondaryTextColor}
//                         style={{ fontSize: "10px" }}
//                       />
//                       <YAxis stroke={secondaryTextColor} />
//                       <Tooltip content={<CustomTooltip />} />
//                       <Legend />
//                       <Area
//                         type="monotone"
//                         dataKey="completed"
//                         stroke={CHART_COLORS.success}
//                         fillOpacity={1}
//                         fill="url(#colorCompleted)"
//                         name="Completed"
//                       />
//                       <Area
//                         type="monotone"
//                         dataKey="started"
//                         stroke={CHART_COLORS.secondary}
//                         fillOpacity={1}
//                         fill="url(#colorStarted)"
//                         name="Started"
//                       />
//                     </AreaChart>
//                   </ResponsiveContainer>
//                 </div>
//               )}

//               {/* Role Performance Radar */}
//               {roleRadarData.length > 0 && (
//                 <div
//                   className="rounded-3xl border p-6 backdrop-blur-xl"
//                   style={{
//                     background:
//                       theme === "dark"
//                         ? "rgba(30,41,59,0.8)"
//                         : "rgba(255,255,255,0.98)",
//                     borderColor:
//                       theme === "dark" ? "#475569" : "#cbd5e1",
//                   }}
//                 >
//                   <h3
//                     className="text-xl font-black mb-4"
//                     style={{ color: textColor }}
//                   >
//                     🎯 Role Coverage Analysis
//                   </h3>
//                   <ResponsiveContainer width="100%" height={300}>
//                     <RadarChart data={roleRadarData}>
//                       <PolarGrid
//                         stroke={
//                           theme === "dark" ? "#334155" : "#e2e8f0"
//                         }
//                       />
//                       <PolarAngleAxis
//                         dataKey="role"
//                         stroke={secondaryTextColor}
//                         style={{ fontSize: "12px" }}
//                       />
//                       <PolarRadiusAxis stroke={secondaryTextColor} />
//                       <Radar
//                         name="Coverage"
//                         dataKey="coverage"
//                         stroke={CHART_COLORS.primary}
//                         fill={CHART_COLORS.primary}
//                         fillOpacity={0.6}
//                       />
//                       <Tooltip content={<CustomTooltip />} />
//                       <Legend />
//                     </RadarChart>
//                   </ResponsiveContainer>
//                 </div>
//               )}
//             </div>

//             {/* Bottleneck Alert Section */}
//             {bottleneckData.length > 0 && (
//               <div
//                 className="rounded-3xl border-2 p-6 backdrop-blur-xl"
//                 style={{
//                   background:
//                     theme === "dark"
//                       ? "rgba(127,29,29,0.4)"
//                       : "rgba(254,242,242,0.95)",
//                   borderColor: "#ef4444",
//                 }}
//               >
//                 <div className="flex items-center gap-3 mb-6">
//                   <div
//                     className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
//                     style={{
//                       background:
//                         "linear-gradient(135deg, #ef4444, #f87171)",
//                     }}
//                   >
//                     ⚠️
//                   </div>
//                   <div>
//                     <h3
//                       className="text-xl font-black"
//                       style={{ color: textColor }}
//                     >
//                       🚨 Bottleneck Alert
//                     </h3>
//                     <p
//                       className="text-sm font-semibold"
//                       style={{ color: secondaryTextColor }}
//                     >
//                       Stages requiring immediate attention (&gt;50% pending
//                       items)
//                     </p>
//                   </div>
//                 </div>
//                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//                   {bottleneckData.map((stage, idx) => (
//                     <div
//                       key={idx}
//                       className="rounded-2xl border-2 p-4"
//                       style={{
//                         borderColor: "#f87171",
//                         background:
//                           theme === "dark"
//                             ? "rgba(127,29,29,0.3)"
//                             : "rgba(254,226,226,0.5)",
//                       }}
//                     >
//                       <div className="flex justify-between items-center mb-2">
//                         <div
//                           className="font-black text-base"
//                           style={{ color: textColor }}
//                         >
//                           {stage.stage}
//                         </div>
//                         <div
//                           className="text-2xl font-black"
//                           style={{ color: "#ef4444" }}
//                         >
//                           {stage.bottleneckScore}%
//                         </div>
//                       </div>
//                       <div
//                         className="text-sm font-semibold"
//                         style={{ color: secondaryTextColor }}
//                       >
//                         {stage.pendingItems} of {stage.totalItems} items
//                         pending
//                       </div>
//                       <div className="w-full h-2 rounded-full bg-black/20 overflow-hidden mt-3">
//                         <div
//                           className="h-full rounded-full"
//                           style={{
//                             width: `${stage.bottleneckScore}%`,
//                             background:
//                               "linear-gradient(90deg, #ef4444, #f87171)",
//                           }}
//                         />
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Recent Activity */}
//             {recentActivity && (
//               <div>
//                 <h2
//                   className="text-2xl font-black mb-6 tracking-tight"
//                   style={{ color: textColor }}
//                 >
//                   Recent Activity (Last {recentActivity.days} Days)
//                 </h2>
//                 <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
//                   {[
//                     {
//                       label: "Total Activity",
//                       value: recentActivity.total,
//                       gradient:
//                         "linear-gradient(135deg, #6366f1, #8b5cf6)",
//                     },
//                     {
//                       label: "Completed",
//                       value: recentActivity.counts.completed || 0,
//                       gradient:
//                         "linear-gradient(135deg, #10b981, #34d399)",
//                     },
//                     {
//                       label: "Pending Checker",
//                       value:
//                         recentActivity.counts.pending_checker || 0,
//                       gradient:
//                         "linear-gradient(135deg, #3b82f6, #60a5fa)",
//                     },
//                     {
//                       label: "Pending Inspector",
//                       value:
//                         recentActivity.counts.pending_for_inspector ||
//                         0,
//                       gradient:
//                         "linear-gradient(135deg, #f97316, #fb923c)",
//                     },
//                   ].map((item, idx) => (
//                     <div
//                       key={idx}
//                       className="rounded-3xl border p-6 backdrop-blur-xl hover:shadow-xl transition-all duration-300"
//                       style={{
//                         background:
//                           theme === "dark"
//                             ? "rgba(30,41,59,0.6)"
//                             : "rgba(255,255,255,0.95)",
//                         borderColor:
//                           theme === "dark" ? "#475569" : "#cbd5e1",
//                       }}
//                     >
//                       <div
//                         className="text-xs font-bold uppercase tracking-wider mb-2"
//                         style={{ color: secondaryTextColor }}
//                       >
//                         {item.label}
//                       </div>
//                       <div
//                         className="text-4xl font-black"
//                         style={{
//                           background: item.gradient,
//                           WebkitBackgroundClip: "text",
//                           WebkitTextFillColor: "transparent",
//                           backgroundClip: "text",
//                         }}
//                       >
//                         {fmtInt(item.value)}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//             {/* Flat / Room Hotspots – Top Flats with Open Issues */}
//             {locationHotspots.length > 0 && (
//               <div className="mt-10">
//                 <h2
//                   className="text-2xl font-black mb-4 tracking-tight flex items-center gap-2"
//                   style={{ color: textColor }}
//                 >
//                   🏠 Flat / Room Hotspots
//                   <span
//                     className="text-xs font-semibold px-3 py-1 rounded-full"
//                     style={{
//                       background:
//                         theme === "dark"
//                           ? "rgba(30,64,175,0.35)"
//                           : "rgba(219,234,254,0.9)",
//                       color: secondaryTextColor,
//                     }}
//                   >
//                     Top {locationHotspots.length} flats with open issues
//                   </span>
//                 </h2>

//                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//                   {locationHotspots.map((f) => {
//                     const meta = f.meta || {};
//                     const label =
//                       meta.number || meta.typeName
//                         ? `Flat ${meta.number || f.flatId}${
//                             meta.typeName ? ` • ${meta.typeName}` : ""
//                           }`
//                         : `Flat #${f.flatId}`;

//                     const levelLabel = meta.levelName
//                       ? meta.levelName
//                       : "";

//                     const completionPct =
//                       f.total > 0
//                         ? Math.round(
//                             (safeNumber(f.completed) /
//                               safeNumber(f.total)) *
//                               100
//                           )
//                         : 0;

//                     return (
//                       <button
//                         key={f.flatId}
//                         type="button"
//   onClick={() => handleOpenFlatReport(f.flatId, f.meta || null)}
//                         className="text-left rounded-2xl border p-4 hover:shadow-xl transition-all duration-300 group"
//                         style={{
//                           borderColor:
//                             theme === "dark" ? "#475569" : "#e2e8f0",
//                           background:
//                             theme === "dark"
//                               ? "rgba(15,23,42,0.9)"
//                               : "rgba(255,255,255,0.98)",
//                         }}
//                       >
//                         <div className="flex justify-between items-start mb-2">
//                           <div>
//                             <div
//                               className="text-sm font-black"
//                               style={{ color: textColor }}
//                             >
//                               {label}
//                             </div>
//                             {levelLabel && (
//                               <div
//                                 className="text-[11px] font-semibold"
//                                 style={{ color: secondaryTextColor }}
//                               >
//                                 {levelLabel}
//                               </div>
//                             )}
//                           </div>
//                           <div className="text-right text-xs font-semibold">
//                             <div
//                               style={{
//                                 color: secondaryTextColor,
//                               }}
//                             >
//                               Total: {fmtInt(f.total)}
//                             </div>
//                             <div
//                               style={{
//                                 color: "#ef4444",
//                               }}
//                             >
//                               Open: {fmtInt(f.openIssues)}
//                             </div>
//                           </div>
//                         </div>

//                         {/* Progress bar */}
//                         <div className="mt-2">
//                           <div className="flex justify-between text-[11px] font-semibold mb-1">
//                             <span style={{ color: secondaryTextColor }}>
//                               Completion
//                             </span>
//                             <span style={{ color: textColor }}>
//                               {completionPct}%
//                             </span>
//                           </div>
//                           <div className="w-full h-2.5 rounded-full bg-black/10 overflow-hidden">
//                             <div
//                               className="h-full rounded-full transition-all duration-700 group-hover:scale-x-[1.02] origin-left"
//                               style={{
//                                 width: `${completionPct}%`,
//                                 background:
//                                   "linear-gradient(90deg, #10b981, #22c55e, #a3e635)",
//                               }}
//                             />
//                           </div>
//                         </div>

//                         <div
//                           className="mt-3 grid grid-cols-3 gap-2 text-[11px] font-semibold"
//                           style={{ color: secondaryTextColor }}
//                         >
//                           <div>
//                             <div>Completed</div>
//                             <div
//                               className="text-xs font-black"
//                               style={{ color: textColor }}
//                             >
//                               {fmtInt(f.completed)}
//                             </div>
//                           </div>
//                           <div>
//                             <div>Pending</div>
//                             <div
//                               className="text-xs font-black"
//                               style={{ color: "#f97316" }}
//                             >
//                               {fmtInt(
//                                 safeNumber(f.pending_checker) +
//                                   safeNumber(
//                                     f.pending_for_inspector
//                                   ) +
//                                   safeNumber(f.not_started)
//                               )}
//                             </div>
//                           </div>
//                           <div>
//                             <div>Click for report</div>
//                             <div className="text-[10px] opacity-70">
//                               Room-wise details
//                             </div>
//                           </div>
//                         </div>
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>
//             )}

//             {/* Question Hotspots (Top 10 Questions) */}
//                        {/* Question Hotspots with Stage + Category + Location Filters */}
//             <div>
//               <h2
//                 className="text-2xl font-black mb-4 tracking-tight flex items-center gap-2"
//                 style={{ color: textColor }}
//               >
//                 🔥 Question Hotspots (Slice-wise)
//                 <span
//                   className="text-xs font-semibold px-3 py-1 rounded-full"
//                   style={{
//                     background:
//                       theme === "dark"
//                         ? "rgba(30,64,175,0.35)"
//                         : "rgba(219,234,254,0.9)",
//                     color: secondaryTextColor,
//                   }}
//                 >
//                   Stage + Category + Building + Floor + Room + Status
//                 </span>
//               </h2>

//               <div
//                 className="rounded-3xl border p-6 backdrop-blur-xl"
//                 style={{
//                   background:
//                     theme === "dark"
//                       ? "rgba(30,41,59,0.9)"
//                       : "rgba(255,255,255,0.98)",
//                   borderColor: theme === "dark" ? "#475569" : "#cbd5e1",
//                 }}
//               >
//                 {/* Local filters for this section */}
//                 <div className="flex flex-wrap gap-3 mb-4 items-end justify-between">
//                   <div className="flex flex-wrap gap-3">
//                     {/* Stage */}
//                     <div className="min-w-[180px]">
//                       <label
//                         className="text-[11px] font-semibold block mb-1"
//                         style={{ color: secondaryTextColor }}
//                       >
//                         Stage
//                       </label>
//                       <select
//                         value={questionFilters.stageId}
//                         onChange={(e) =>
//                           setQuestionFilters((prev) => ({
//                             ...prev,
//                             stageId: e.target.value,
//                           }))
//                         }
//                         className="w-full px-3 py-2 rounded-xl border text-sm font-semibold outline-none"
//                         style={{
//                           borderColor:
//                             theme === "dark" ? "#475569" : "#cbd5e1",
//                           background:
//                             theme === "dark"
//                               ? "rgba(15,23,42,0.9)"
//                               : "rgba(248,250,252,0.95)",
//                           color: textColor,
//                         }}
//                       >
//                         <option value="">All stages</option>
//                         {Object.entries(stageMap).map(([sid, label]) => (
//                           <option key={sid} value={sid}>
//                             {label}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     {/* Checklist category */}
//                     {checklistCategoryOptions.length > 0 && (
//                       <div className="min-w-[180px]">
//                         <label
//                           className="text-[11px] font-semibold block mb-1"
//                           style={{ color: secondaryTextColor }}
//                         >
//                           Checklist title
//                         </label>
//                         <select
//                           value={questionFilters.categoryId}
//                           onChange={(e) =>
//                             setQuestionFilters((prev) => ({
//                               ...prev,
//                               categoryId: e.target.value,
//                             }))
//                           }
//                           className="w-full px-3 py-2 rounded-xl border text-sm font-semibold outline-none"
//                           style={{
//                             borderColor:
//                               theme === "dark" ? "#475569" : "#cbd5e1",
//                             background:
//                               theme === "dark"
//                                 ? "rgba(15,23,42,0.9)"
//                                 : "rgba(248,250,252,0.95)",
//                             color: textColor,
//                           }}
//                         >
//                           <option value="">All Checklist Titles</option>
//                           {checklistCategoryOptions.map((c) => (
//                             <option key={c.id} value={c.id}>
//                               {c.label}
//                             </option>
//                           ))}
//                         </select>
//                       </div>
//                     )}

//                     {/* Building */}
//                     {buildingOptions.length > 0 && (
//                       <div className="min-w-[180px]">
//                         <label
//                           className="text-[11px] font-semibold block mb-1"
//                           style={{ color: secondaryTextColor }}
//                         >
//                           Building
//                         </label>
//                         <select
//   value={questionFilters.buildingId}
//   onChange={(e) =>
//     setQuestionFilters((prev) => ({
//       ...prev,
//       buildingId: e.target.value,
//       floorId: "", // building change → floor reset
//     }))
//   }
// >
//   <option value="">All buildings</option>
//   {buildingOptions.map((b) => (
//     <option key={b.id} value={b.id}>
//       {b.label}
//     </option>
//   ))}
// </select>

//                       </div>
//                     )}

//                     {/* Floor (depends on building in this section) */}
//                     {questionFilters.buildingId &&
//                       questionFloorOptions.length > 0 && (
//                         <div className="min-w-[180px]">
//                           <label
//                             className="text-[11px] font-semibold block mb-1"
//                             style={{ color: secondaryTextColor }}
//                           >
//                             Floor
//                           </label>
//                           <select
//                             value={questionFilters.floorId}
//                             onChange={(e) =>
//                               setQuestionFilters((prev) => ({
//                                 ...prev,
//                                 floorId: e.target.value,
//                               }))
//                             }
//                             className="w-full px-3 py-2 rounded-xl border text-sm font-semibold outline-none"
//                             style={{
//                               borderColor:
//                                 theme === "dark" ? "#475569" : "#cbd5e1",
//                               background:
//                                 theme === "dark"
//                                   ? "rgba(15,23,42,0.9)"
//                                   : "rgba(248,250,252,0.95)",
//                               color: textColor,
//                             }}
//                           >
//                             <option value="">All floors</option>
//                             {questionFloorOptions.map((f) => (
//                               <option key={f.id} value={f.id}>
//                                 {f.label}
//                               </option>
//                             ))}
//                           </select>
//                         </div>
//                       )}

//                     {/* Room category */}
//                     {roomCategoryOptions.length > 0 && (
//                       <div className="min-w-[180px]">
//                         <label
//                           className="text-[11px] font-semibold block mb-1"
//                           style={{ color: secondaryTextColor }}
//                         >
//                           Room
//                         </label>
//                         <select
//                           value={questionFilters.roomCategory}
//                           onChange={(e) =>
//                             setQuestionFilters((prev) => ({
//                               ...prev,
//                               roomCategory: e.target.value,
//                             }))
//                           }
//                           className="w-full px-3 py-2 rounded-xl border text-sm font-semibold outline-none"
//                           style={{
//                             borderColor:
//                               theme === "dark" ? "#475569" : "#cbd5e1",
//                             background:
//                               theme === "dark"
//                                 ? "rgba(15,23,42,0.9)"
//                                 : "rgba(248,250,252,0.95)",
//                             color: textColor,
//                           }}
//                         >
//                           <option value="">All rooms</option>
//                           {roomCategoryOptions.map((cat) => (
//                             <option key={cat} value={cat}>
//                               {cat}
//                             </option>
//                           ))}
//                         </select>
//                       </div>
//                     )}

//                     {/* Status bucket */}
//                     <div className="min-w-[150px]">
//                       <label
//                         className="text-[11px] font-semibold block mb-1"
//                         style={{ color: secondaryTextColor }}
//                       >
//                         Status bucket
//                       </label>
//                       <select
//                         value={questionFilters.statusBucket}
//                         onChange={(e) =>
//                           setQuestionFilters((prev) => ({
//                             ...prev,
//                             statusBucket: e.target.value,
//                           }))
//                         }
//                         className="w-full px-3 py-2 rounded-xl border text-sm font-semibold outline-none"
//                         style={{
//                           borderColor:
//                             theme === "dark" ? "#475569" : "#cbd5e1",
//                           background:
//                             theme === "dark"
//                               ? "rgba(15,23,42,0.9)"
//                               : "rgba(248,250,252,0.95)",
//                           color: textColor,
//                         }}
//                       >
//                         <option value="open">Open only</option>
//                         <option value="closed">Completed only</option>
//                         <option value="all">All statuses</option>
//                       </select>
//                     </div>
//                   </div>

//                   {/* Clear button */}
//                   <button
//                     type="button"
//                     onClick={() =>
//                       setQuestionFilters({
//                         stageId: "",
//                         categoryId: "",
//                         buildingId: "",
//                         floorId: "",
//                         roomCategory: "",
//                         statusBucket: "open",
//                       })
//                     }
//                     className="px-3 py-2 rounded-xl text-xs font-bold border"
//                     style={{
//                       borderColor:
//                         theme === "dark" ? "#64748b" : "#cbd5e1",
//                       background:
//                         theme === "dark"
//                           ? "rgba(15,23,42,0.9)"
//                           : "rgba(248,250,252,0.95)",
//                       color: secondaryTextColor,
//                     }}
//                   >
//                     Clear filters
//                   </button>
//                 </div>

//                 {/* List of questions for current slice */}
//                 {questionStatusData.length === 0 ? (
//                   <div
//                     className="py-6 text-sm font-semibold"
//                     style={{ color: secondaryTextColor }}
//                   >
//                     No questions match the current Question Hotspot filters.
//                   </div>
//                 ) : (
//                   <div className="space-y-4 mt-2">
//                     {questionStatusData.map((q, idx) => (
//                       <div
//                         key={idx}
//                         className="rounded-2xl border px-4 py-3"
//                         style={{
//                           borderColor:
//                             theme === "dark" ? "#475569" : "#e2e8f0",
//                           background:
//                             theme === "dark"
//                               ? "rgba(15,23,42,0.85)"
//                               : "rgba(248,250,252,0.95)",
//                         }}
//                       >
//                         <div className="flex justify-between items-start gap-3 mb-2">
//                           <div className="flex-1">
//                             <div
//                               className="text-sm font-bold mb-1"
//                               style={{ color: textColor }}
//                             >
//                               {q.question}
//                             </div>
//                             {q.categoryLabel && (
//                               <div
//                                 className="text-[11px] font-semibold"
//                                 style={{ color: secondaryTextColor }}
//                               >
//                                 Category: {q.categoryLabel}
//                               </div>
//                             )}
//                           </div>
//                           <div className="text-right text-xs font-black">
//                             <div style={{ color: textColor }}>
//                               Total: {fmtInt(q.total)}
//                             </div>
//                             <div style={{ color: "#ef4444" }}>
//                               Open: {fmtInt(q.openCount)} ({q.openPct}%)
//                             </div>
//                             <div style={{ color: "#10b981" }}>
//                               Done: {fmtInt(q.completed)} ({q.completedPct}
//                               %)
//                             </div>
//                           </div>
//                         </div>

//                         {/* Open vs completed bar */}
//                         <div className="w-full h-2.5 rounded-full bg-black/10 overflow-hidden mb-1">
//                           <div
//                             className="h-full rounded-full"
//                             style={{
//                               width: `${q.openPct}%`,
//                               background:
//                                 "linear-gradient(90deg, #ef4444, #f97316)",
//                             }}
//                           />
//                         </div>
//                         <div
//                           className="mt-1 text-[11px] font-semibold flex justify-between"
//                           style={{ color: secondaryTextColor }}
//                         >
//                           <span>
//                             {q.openPct}% of this question is still open
//                           </span>
//                           <span>
//                             Completed: {q.completedPct}% of this question
//                           </span>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>


//             {/* ROLES & ACCESS OVERVIEW (CONFIG + ACTIVITY) */}
//             {(coverageList.length > 0 ||
//               inactiveAssignments.length > 0 ||
//               unconfiguredActivity.length > 0 ||
//               configByUser.length > 0) && (
//               <div className="space-y-6">
//                 <div className="flex flex-wrap items-center justify-between gap-3">
//                   <h2
//                     className="text-2xl font-black tracking-tight"
//                     style={{ color: textColor }}
//                   >
//                     🧩 Roles & Access Overview
//                   </h2>
//                   <p
//                     className="text-sm font-semibold"
//                     style={{ color: secondaryTextColor }}
//                   >
//                     Configured responsibilities vs. actual checklist
//                     activity
//                   </p>
//                 </div>

//                 {/* Stage & Role Coverage + Per-user Config */}
//                 <div className="grid gap-6 lg:grid-cols-2">
//                   {coverageList.length > 0 && (
//                     <div
//                       className="rounded-3xl border p-6 backdrop-blur-xl"
//                       style={{
//                         background:
//                           theme === "dark"
//                             ? "rgba(30,41,59,0.8)"
//                             : "rgba(255,255,255,0.98)",
//                         borderColor:
//                           theme === "dark" ? "#475569" : "#cbd5e1",
//                       }}
//                     >
//                       <h3
//                         className="text-xl font-black mb-4"
//                         style={{ color: textColor }}
//                       >
//                         Stage & Role Coverage (from Config)
//                       </h3>
//                       <div className="space-y-4 max-h-[320px] overflow-auto pr-1">
//                         {coverageList.map((entry) => (
//                           <div
//                             key={entry.stageId}
//                             className="rounded-2xl border px-4 py-3"
//                             style={{
//                               borderColor:
//                                 theme === "dark"
//                                   ? "#475569"
//                                   : "#e2e8f0",
//                               background:
//                                 theme === "dark"
//                                   ? "rgba(15,23,42,0.85)"
//                                   : "rgba(248,250,252,0.95)",
//                             }}
//                           >
//                             <div className="flex items-center justify-between mb-2">
//                               <div
//                                 className="font-black"
//                                 style={{ color: textColor }}
//                               >
//                                 {entry.stageLabel}
//                               </div>
//                               <div
//                                 className="text-xs font-semibold px-2 py-1 rounded-full"
//                                 style={{
//                                   background:
//                                     theme === "dark"
//                                       ? "rgba(30,64,175,0.3)"
//                                       : "rgba(219,234,254,0.9)",
//                                   color: secondaryTextColor,
//                                 }}
//                               >
//                                 {entry.roles.reduce(
//                                   (sum, r) => sum + r.userCount,
//                                   0
//                                 )}{" "}
//                                 users mapped
//                               </div>
//                             </div>
//                             <div className="flex flex-wrap gap-2">
//                               {entry.roles.map((r) => (
//                                 <span
//                                   key={r.roleName}
//                                   className="px-3 py-1 rounded-full text-xs font-semibold"
//                                   style={{
//                                     background:
//                                       theme === "dark"
//                                         ? "rgba(30,64,175,0.4)"
//                                         : "rgba(239,246,255,0.9)",
//                                     color: textColor,
//                                     border: `1px solid ${
//                                       theme === "dark"
//                                         ? "#3b82f6"
//                                         : "#60a5fa"
//                                     }`,
//                                   }}
//                                 >
//                                   {r.roleName} • {r.userCount} user
//                                   {r.userCount === 1 ? "" : "s"}
//                                 </span>
//                               ))}
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   {configByUser.length > 0 && (
//                     <div
//                       className="rounded-3xl border p-6 backdrop-blur-xl"
//                       style={{
//                         background:
//                           theme === "dark"
//                             ? "rgba(30,41,59,0.8)"
//                             : "rgba(255,255,255,0.98)",
//                         borderColor:
//                           theme === "dark" ? "#475569" : "#cbd5e1",
//                       }}
//                     >
//                       <h3
//                         className="text-xl font-black mb-4"
//                         style={{ color: textColor }}
//                       >
//                         Per-user Configuration
//                       </h3>
//                       <div className="space-y-3 max-h-[320px] overflow-auto pr-1">
//                         {configByUser.map((u) => (
//                           <div
//                             key={u.userId}
//                             className="rounded-2xl border px-4 py-3"
//                             style={{
//                               borderColor:
//                                 theme === "dark"
//                                   ? "#475569"
//                                   : "#e2e8f0",
//                               background:
//                                 theme === "dark"
//                                   ? "rgba(15,23,42,0.85)"
//                                   : "rgba(248,250,252,0.95)",
//                             }}
//                           >
//                             <div className="flex items-center justify-between mb-1">
//                               <div
//                                 className="font-black"
//                                 style={{ color: textColor }}
//                               >
//                                 {u.userName}
//                               </div>
//                               <div
//                                 className="text-[11px] font-semibold px-2 py-1 rounded-full"
//                                 style={{
//                                   background:
//                                     theme === "dark"
//                                       ? "rgba(22,163,74,0.3)"
//                                       : "rgba(220,252,231,0.9)",
//                                   color: secondaryTextColor,
//                                 }}
//                               >
//                                 {u.accesses.length} access
//                                 {u.accesses.length === 1 ? "" : "es"}
//                               </div>
//                             </div>
//                             <div
//                               className="text-[11px] space-y-1"
//                               style={{ color: secondaryTextColor }}
//                             >
//                               {u.accesses.slice(0, 4).map((acc, idx) => (
//                                 <div key={idx}>
//                                   <span className="font-semibold">
//                                     {acc.roleNames && acc.roleNames.length
//                                       ? acc.roleNames.join(", ")
//                                       : "Role"}
//                                   </span>{" "}
//                                   on{" "}
//                                   <span>
//                                     {stageMap[acc.stageId] ||
//                                       (acc.stageId
//                                         ? `Stage #${acc.stageId}`
//                                         : "-")}
//                                   </span>
//                                 </div>
//                               ))}
//                               {u.accesses.length > 4 && (
//                                 <div className="opacity-70">
//                                   +{u.accesses.length - 4} more…
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* Config vs Activity anomalies */}
//                 {(inactiveAssignments.length > 0 ||
//                   unconfiguredActivity.length > 0) && (
//                   <div className="grid gap-6 lg:grid-cols-2">
//                     {inactiveAssignments.length > 0 && (
//                       <div
//                         className="rounded-3xl border p-6 backdrop-blur-xl"
//                         style={{
//                           background:
//                             theme === "dark"
//                               ? "rgba(30,41,59,0.8)"
//                               : "rgba(255,255,255,0.98)",
//                           borderColor:
//                             theme === "dark" ? "#475569" : "#cbd5e1",
//                         }}
//                       >
//                         <h3
//                           className="text-xl font-black mb-2"
//                           style={{ color: textColor }}
//                         >
//                           💤 Configured but No Activity
//                         </h3>
//                         <p
//                           className="text-xs mb-3"
//                           style={{ color: secondaryTextColor }}
//                         >
//                           Users mapped in configuration but not yet
//                           appearing in checklist submissions.
//                         </p>
//                         <div className="max-h-[260px] overflow-auto pr-1">
//                           <table className="min-w-full text-xs">
//                             <thead>
//                               <tr style={{ color: secondaryTextColor }}>
//                                 <th className="text-left py-2 pr-3 font-semibold">
//                                   User
//                                 </th>
//                                 <th className="text-left py-2 pr-3 font-semibold">
//                                   Stage
//                                 </th>
//                                 <th className="text-left py-2 pr-3 font-semibold">
//                                   Role
//                                 </th>
//                               </tr>
//                             </thead>
//                             <tbody>
//                               {inactiveAssignments.map((row, idx) => (
//                                 <tr
//                                   key={idx}
//                                   className="border-t"
//                                   style={{
//                                     borderColor:
//                                       theme === "dark"
//                                         ? "#334155"
//                                         : "#e2e8f0",
//                                   }}
//                                 >
//                                   <td
//                                     className="py-2 pr-3"
//                                     style={{ color: textColor }}
//                                   >
//                                     {row.userName}
//                                   </td>
//                                   <td
//                                     className="py-2 pr-3"
//                                     style={{
//                                       color: secondaryTextColor,
//                                     }}
//                                   >
//                                     {stageMap[row.stageId] ||
//                                       (row.stageId
//                                         ? `Stage #${row.stageId}`
//                                         : "-")}
//                                   </td>
//                                   <td
//                                     className="py-2 pr-3"
//                                     style={{
//                                       color: secondaryTextColor,
//                                     }}
//                                   >
//                                     {row.roleName}
//                                   </td>
//                                 </tr>
//                               ))}
//                             </tbody>
//                           </table>
//                         </div>
//                       </div>
//                     )}

//                     {unconfiguredActivity.length > 0 && (
//                       <div
//                         className="rounded-3xl border p-6 backdrop-blur-xl"
//                         style={{
//                           background:
//                             theme === "dark"
//                               ? "rgba(30,41,59,0.8)"
//                               : "rgba(255,255,255,0.98)",
//                           borderColor:
//                             theme === "dark" ? "#475569" : "#cbd5e1",
//                         }}
//                       >
//                         <h3
//                           className="text-xl font-black mb-2"
//                           style={{ color: textColor }}
//                         >
//                           🔍 Activity Without Config
//                         </h3>
//                         <p
//                           className="text-xs mb-3"
//                           style={{ color: secondaryTextColor }}
//                         >
//                           Submissions done by users who are not formally
//                           mapped to that stage/role.
//                         </p>
//                         <div className="max-h-[260px] overflow-auto pr-1">
//                           <table className="min-w-full text-xs">
//                             <thead>
//                               <tr style={{ color: secondaryTextColor }}>
//                                 <th className="text-left py-2 pr-3 font-semibold">
//                                   User
//                                 </th>
//                                 <th className="text-left py-2 pr-3 font-semibold">
//                                   Stage
//                                 </th>
//                                 <th className="text-left py-2 pr-3 font-semibold">
//                                   Role
//                                 </th>
//                                 <th className="text-left py-2 pr-3 font-semibold">
//                                   Items
//                                 </th>
//                               </tr>
//                             </thead>
//                             <tbody>
//                               {unconfiguredActivity.map((row, idx) => (
//                                 <tr
//                                   key={idx}
//                                   className="border-t"
//                                   style={{
//                                     borderColor:
//                                       theme === "dark"
//                                         ? "#334155"
//                                         : "#e2e8f0",
//                                   }}
//                                 >
//                                   <td
//                                     className="py-2 pr-3"
//                                     style={{ color: textColor }}
//                                   >
//                                     {row.userName}
//                                   </td>
//                                   <td
//                                     className="py-2 pr-3"
//                                     style={{
//                                       color: secondaryTextColor,
//                                     }}
//                                   >
//                                     {stageMap[row.stageId] ||
//                                       (row.stageId
//                                         ? `Stage #${row.stageId}`
//                                         : "-")}
//                                   </td>
//                                   <td
//                                     className="py-2 pr-3"
//                                     style={{
//                                       color: secondaryTextColor,
//                                     }}
//                                   >
//                                     {row.roleName}
//                                   </td>
//                                   <td
//                                     className="py-2 pr-3"
//                                     style={{
//                                       color: secondaryTextColor,
//                                     }}
//                                   >
//                                     {fmtInt(row.count || 0)}
//                                   </td>
//                                 </tr>
//                               ))}
//                             </tbody>
//                           </table>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Detailed Item View */}
//             <div>
//               <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
//                 <h2
//                   className="text-2xl font-black tracking-tight"
//                   style={{ color: textColor }}
//                 >
//                   🔍 Detailed Item View
//                 </h2>
//                 <div className="flex flex-wrap gap-3">
//                   <select
//                     value={globalFilters.status}
//                     onChange={(e) =>
//                       setGlobalFilters((prev) => ({
//                         ...prev,
//                         status: e.target.value,
//                       }))
//                     }
//                     className="px-4 py-2.5 rounded-xl border-2 font-semibold backdrop-blur-xl"
//                     style={{
//                       borderColor:
//                         theme === "dark" ? "#475569" : "#cbd5e1",
//                       background:
//                         theme === "dark"
//                           ? "rgba(30,41,59,0.8)"
//                           : "rgba(255,255,255,0.9)",
//                       color: textColor,
//                     }}
//                   >
//                     <option value="">All Statuses</option>
//                     {distinctStatuses.map((s) => (
//                       <option key={s} value={s}>
//                         {titleCaseStatus(s)}
//                       </option>
//                     ))}
//                   </select>
//                   <select
//                     value={globalFilters.role}
//                     onChange={(e) =>
//                       setGlobalFilters((prev) => ({
//                         ...prev,
//                         role: e.target.value,
//                       }))
//                     }
//                     className="px-4 py-2.5 rounded-xl border-2 font-semibold backdrop-blur-xl"
//                     style={{
//                       borderColor:
//                         theme === "dark" ? "#475569" : "#cbd5e1",
//                       background:
//                         theme === "dark"
//                           ? "rgba(30,41,59,0.8)"
//                           : "rgba(255,255,255,0.9)",
//                       color: textColor,
//                     }}
//                   >
//                     <option value="">All Roles</option>
//                     <option value="maker">Maker</option>
//                     <option value="supervisor">Supervisor</option>
//                     <option value="checker">Checker</option>
//                   </select>
//                 </div>
//               </div>

//               <div
//                 className="rounded-3xl border overflow-hidden backdrop-blur-xl"
//                 style={{
//                   borderColor:
//                     theme === "dark" ? "#475569" : "#cbd5e1",
//                   background:
//                     theme === "dark"
//                       ? "rgba(30,41,59,0.95)"
//                       : "rgba(255,255,255,0.98)",
//                 }}
//               >
//                 <div className="relative max-h-[500px] overflow-auto">
//                   <table className="min-w-full text-sm">
//                     <thead
//                       className="sticky top-0 z-10"
//                       style={{
//                         background:
//                           theme === "dark" ? "#1e293b" : "#f1f5f9",
//                       }}
//                     >
//                       <tr>
//                         <th
//                           className="text-left px-6 py-4 font-black"
//                           style={{ color: textColor }}
//                         >
//                           Item
//                         </th>
//                         <th
//                           className="text-left px-6 py-4 font-black"
//                           style={{ color: textColor }}
//                         >
//                           Status
//                         </th>
//                         <th
//                           className="text-left px-6 py-4 font-black"
//                           style={{ color: textColor }}
//                         >
//                           Location
//                         </th>
//                         <th
//                           className="text-left px-6 py-4 font-black"
//                           style={{ color: textColor }}
//                         >
//                           Team
//                         </th>
//                         <th
//                           className="text-left px-6 py-4 font-black"
//                           style={{ color: textColor }}
//                         >
//                           Activity
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {filteredItems.length === 0 ? (
//                         <tr>
//                           <td
//                             colSpan={5}
//                             className="px-6 py-12 text-center font-bold"
//                             style={{ color: secondaryTextColor }}
//                           >
//                             No items match the current filters
//                           </td>
//                         </tr>
//                       ) : (
//                         filteredItems.map((item) => {
//                           const col = statusColor(item.item_status);
//                           const latest = item.latest_submission || {};
//                           const lastTime =
//                             latest.checked_at ||
//                             latest.supervised_at ||
//                             latest.maker_at ||
//                             null;
//                           const stageId = item.checklist?.stage_id;
//                           const stageLabel =
//                             (stageId && stageMap[stageId]) ||
//                             (stageId ? `Stage #${stageId}` : "-");

//                           return (
//                             <tr
//                               key={item.item_id}
//                               className="border-t hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
//                               style={{
//                                 borderColor:
//                                   theme === "dark"
//                                     ? "#334155"
//                                     : "#e2e8f0",
//                               }}
//                             >
//                               <td className="px-6 py-4 align-top">
//                                 <div
//                                   className="font-black mb-1"
//                                   style={{ color: textColor }}
//                                 >
//                                   {item.item_title}
//                                 </div>
//                                 <div
//                                   className="text-xs font-semibold"
//                                   style={{ color: secondaryTextColor }}
//                                 >
//                                   Checklist {item.checklist?.id} •{" "}
//                                   {stageLabel}
//                                 </div>
//                               </td>
//                               <td className="px-6 py-4 align-top">
//                                 <span
//                                   className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-black"
//                                   style={{
//                                     background: col.gradient,
//                                     color: "#ffffff",
//                                   }}
//                                 >
//                                   {titleCaseStatus(item.item_status)}
//                                 </span>
//                               </td>
//                               <td className="px-6 py-4 align-top">
//                                 <div
//                                   className="text-xs font-semibold"
//                                   style={{ color: secondaryTextColor }}
//                                 >
//                                   {buildLocationLabel(
//                                     item.location,
//                                     flatLookup
//                                   )}
//                                 </div>
//                                  {(() => {
//                                   const loc = item.location || {};
//                                   const roomCat =
//                                     loc.room_category ||
//                                     loc.room_type ||
//                                     loc.room ||
//                                     null;
//                                   return roomCat ? (
//                                     <div
//                                       className="text-[11px] mt-1"
//                                       style={{ color: secondaryTextColor }}
//                                     >
//                                       Room: {roomCat}
//                                     </div>
//                                   ) : null;
//                                 })()}
//                               </td>
//                               <td className="px-6 py-4 align-top">
//                                 <div className="flex flex-col gap-1 text-xs font-semibold">
//                                   {["maker", "supervisor", "checker"].map(
//                                     (rKey) => {
//                                       const rBlock =
//                                         item.roles && item.roles[rKey];
//                                       if (!rBlock || !rBlock.user_id)
//                                         return null;
//                                       const name = resolveUserName(
//                                         rBlock.user_id
//                                       );
//                                       return (
//                                         <div
//                                           key={rKey}
//                                           style={{
//                                             color: secondaryTextColor,
//                                           }}
//                                         >
//                                           <span className="uppercase font-black">
//                                             {rKey
//                                               .slice(0, 1)
//                                               .toUpperCase() +
//                                               rKey.slice(1)}
//                                             :
//                                           </span>{" "}
//                                           <span
//                                             style={{ color: textColor }}
//                                           >
//                                             {name}
//                                           </span>
//                                           {name &&
//                                             !name.startsWith("User #") && (
//                                               <span className="text-[10px] opacity-50">
//                                                 {" "}
//                                                 #{rBlock.user_id}
//                                               </span>
//                                             )}
//                                         </div>
//                                       );
//                                     }
//                                   )}
//                                   {!item.roles && (
//                                     <span
//                                       style={{ color: secondaryTextColor }}
//                                     >
//                                       No team assigned
//                                     </span>
//                                   )}
//                                 </div>
//                               </td>
//                               <td className="px-6 py-4 align-top">
//                                 <div
//                                   className="text-xs font-semibold"
//                                   style={{ color: secondaryTextColor }}
//                                 >
//                                   {formatDateTime(lastTime)}
//                                 </div>
//                                 {latest.attempts && (
//                                   <div
//                                     className="text-xs font-bold"
//                                     style={{ color: textColor }}
//                                   >
//                                     Attempts: {latest.attempts}
//                                   </div>
//                                 )}
//                               </td>
//                             </tr>
//                           );
//                         })
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProjectOverview;







// src/components/ProjectOverview.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useTheme } from "../ThemeContext";
import { exportReportNewExcel } from "../utils/exportReportNewExcel";
import ProjectOverviewKpi from "./ProjectOverviewKpi";


import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const API_BASE = "https://konstruct.world";

const authHeaders = () => ({
  Authorization: `Bearer ${
    localStorage.getItem("ACCESS_TOKEN") ||
    localStorage.getItem("TOKEN") ||
    localStorage.getItem("token") ||
    ""
  }`,
});

/* ---------------- utils ---------------- */
const isStartedItem = (item) => {
  const st = String(item?.item_status || "").toLowerCase();
  // If API already sends "started"
  if (st === "started") return true;

  // Otherwise: has any submission and not completed/not_started
  const hasSub = !!item?.latest_submission;
  return hasSub && st !== "completed" && st !== "not_started";
};

const matchesStatusFilter = (item, status) => {
  const s = String(status || "").toLowerCase();
  if (!s) return true;

  const st = String(item?.item_status || "").toLowerCase();

  if (s === "started") return isStartedItem(item);
  return st === s;
};

const isNumberLike = (v) =>
  v !== null && v !== undefined && String(v).trim() !== "" && !Number.isNaN(Number(v));

function safeNumber(n, fallback = 0) {
  if (typeof n === "number" && !Number.isNaN(n)) return n;
  const parsed = Number(n);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function pct(part, total) {
  const p = safeNumber(part);
  const t = safeNumber(total);
  if (!t || t <= 0) return 0;
  return Math.round((p / t) * 100);
}

function fmtInt(n) {
  return safeNumber(n).toLocaleString("en-IN");
}

function titleCaseStatus(status) {
  if (!status) return "-";

  const s = String(status).toLowerCase();

  // ✅ Rename only (value same rahega)
  if (s === "pending_for_inspector") return "Pending For Checker";

  return s
    .split("_")
    .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
    .join(" ");
}


function statusColor(status) {
  const s = String(status || "").toLowerCase();
  if (s === "completed") return { text: "#047857", chartColor: "#10b981" };
  if (s === "pending_checker" || s === "pending_for_checker")
    return { text: "#1d4ed8", chartColor: "#3b82f6" };
  if (s === "pending_for_inspector") return { text: "#c2410c", chartColor: "#f97316" };
  if (s === "not_started" || s === "created") return { text: "#475569", chartColor: "#94a3b8" };
  return { text: "#475569", chartColor: "#94a3b8" };
}

function formatDateTime(dt) {
  if (!dt) return "-";
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
}

function buildLocationLabel(loc, flatLookup = {}) {
  if (!loc) return "-";
  const parts = [];
  const flatMeta = loc.flat_id ? flatLookup[loc.flat_id] : null;

  if (flatMeta) {
    parts.push(
      `Flat ${flatMeta.number}${flatMeta.typeName ? ` (${flatMeta.typeName})` : ""}`
    );
  } else if (loc.flat_id) {
    parts.push(`Flat-${loc.flat_id}`);
  }

  if (flatMeta?.levelName) parts.push(flatMeta.levelName);
  else if (loc.level_id) parts.push(`Level-${loc.level_id}`);

  return parts.length ? parts.join(" / ") : "-";
}

function buildSummaryFromItems(items) {
  const byStatus = {};
  let totalWithSubmission = 0;
  const byStageMap = {};
  const roleSummary = {};

  items.forEach((item) => {
    const status = String(item.item_status || "").toLowerCase() || "unknown";
    byStatus[status] = (byStatus[status] || 0) + 1;

    if (item.latest_submission) totalWithSubmission += 1;

    const stageId = item.checklist?.stage_id;
    if (stageId != null) {
      let stageRec = byStageMap[stageId];
      if (!stageRec) {
        stageRec = { stage_id: stageId, items: 0, by_latest_status: {} };
        byStageMap[stageId] = stageRec;
      }
      stageRec.items += 1;
      stageRec.by_latest_status[status] = (stageRec.by_latest_status[status] || 0) + 1;
    }

    const rolesObj = item.roles || {};
    Object.entries(rolesObj).forEach(([rk, info]) => {
      if (!info || !info.user_id) return;
      const key = rk.toUpperCase();
      let rRec = roleSummary[key];
      if (!rRec) {
        rRec = { items_touched: 0, distinct_users: 0, _userIds: new Set() };
        roleSummary[key] = rRec;
      }
      rRec.items_touched += 1;
      rRec._userIds.add(info.user_id);
    });
  });

  Object.values(roleSummary).forEach((r) => {
    r.distinct_users = r._userIds.size;
    delete r._userIds;
  });

  return {
    total_items: items.length,
    total_with_submission: totalWithSubmission,
    by_latest_status: byStatus,
    by_stage: Object.values(byStageMap),
    roles: roleSummary,
  };
}
// Helpers
const norm = (s) => String(s || "").toLowerCase();
// ✅ do NOT "includes('snag')" guess. Only trust actual flags/types if present.
const isSnagPoint = (it) => {
  const v =
    it?.is_snag_point ??
    it?.is_snag ??
    it?.snag_point ??
    it?.snag ??
    it?.item?.is_snag_point ??
    null;

  if (v === true) return true;
  if (v === false) return false;

  // fallback only if backend sends a strict type
  const t = String(it?.item_type || it?.type || it?.item_kind || "").toLowerCase();
  return t === "snag" || t === "snag_point";
};

const pendingFromLabel = (statusCounts = {}) => {
  // 1) Not started -> initializer
  if ((statusCounts.not_started || 0) > 0 || (statusCounts.created || 0) > 0) return "Initializer";

  // 2) Pending for maker / started -> maker
  if (
    (statusCounts.pending_for_maker || 0) > 0 ||
    (statusCounts.pending_maker || 0) > 0 ||
    (statusCounts.started || 0) > 0
  ) return "Maker";

  // 3) Inspector bucket
  if ((statusCounts.pending_for_inspector || 0) > 0) return "Inspector";

  // 4) Checker bucket
  if (
    (statusCounts.pending_checker || 0) > 0 ||
    (statusCounts.pending_for_checker || 0) > 0
  ) return "Checker";

  return "";
};

const overallStatusLabel = (pendingCount) => (pendingCount > 0 ? "Pending" : "Completed");
const sortRowsByTowerUnit = (rows = []) => {
  const unitNum = (v) => {
    const n = Number(String(v ?? "").replace(/[^\d]/g, ""));
    return Number.isNaN(n) ? 0 : n;
  };

  rows.sort((a, b) => {
    const t = String(a?.[0] ?? "").localeCompare(String(b?.[0] ?? ""));
    if (t) return t;

    const ua = unitNum(a?.[1]);
    const ub = unitNum(b?.[1]);
    if (ua !== ub) return ua - ub;

    const c = String(a?.[2] ?? "").localeCompare(String(b?.[2] ?? ""));
    if (c) return c;

    return String(a?.[3] ?? "").localeCompare(String(b?.[3] ?? ""));
  });

  return rows;
};

export function buildHotoRowsFromItems(
  items,
  { stageMap, flatLookup, buildingNameMap, getChecklistLabel } = {}
) {
  const map = new Map();

  (items || []).forEach((it) => {
    // ❌ remove this line:
    // if (!isSnagPoint(it)) return;

    const loc = it.location || {};
    const flatId = loc.flat_id;
    const meta = flatId ? flatLookup?.[flatId] : null;
    const towerRaw =
  loc.tower_name ||
  loc.building_name ||
  (loc.building_id && buildingNameMap?.get?.(String(loc.building_id))) ||
  (loc.building_id ? `Building #${loc.building_id}` : "");

const unitRaw = meta?.number || flatId || "";

const stageId = it.checklist?.stage_id || "";
const stageRaw = stageMap?.[stageId] || stageId || "";

const checklistRaw = getChecklistLabel
  ? getChecklistLabel(it)
  : it.checklist?.title || it.checklist?.name || "";

// ✅ normalize to avoid duplicates like "Tower A " vs "Tower A"
const tower = String(towerRaw || "").trim();
const unitNo = String(unitRaw || "").trim();
const stage = String(stageRaw || "").trim();
const checklist = String(checklistRaw || "").trim();

const key = `${tower}|${unitNo}|${checklist}|${stage}`;


    // const tower =
    //   loc.tower_name ||
    //   loc.building_name ||
    //   (loc.building_id && buildingNameMap?.get?.(String(loc.building_id))) ||
    //   (loc.building_id ? `Building #${loc.building_id}` : "");

    // const unitNo = meta?.number || flatId || "";

    // const stageId = it.checklist?.stage_id || "";
    // const stage = stageMap?.[stageId] || stageId || "";

    // const checklist = getChecklistLabel
    //   ? getChecklistLabel(it)
    //   : it.checklist?.title || it.checklist?.name || "";

    // const key = `${tower}|${unitNo}|${checklist}|${stage}`;
    const rec = map.get(key) || {
      tower,
      unitNo,
      checklist,
      stage,
      total: 0,
      completed: 0,
      statusCounts: {},
    };

    rec.total += 1;

    const st = String(it.item_status || "").toLowerCase();
    rec.statusCounts[st] = (rec.statusCounts[st] || 0) + 1;
    if (st === "completed") rec.completed += 1;

    map.set(key, rec);
  });

  const rows = Array.from(map.values()).map((r) => {
  const pending = r.total - r.completed;
  return [
    r.tower,
    r.unitNo,
    r.checklist,
    r.stage,
    r.total,
    r.completed,
    pending,
    "",
    pending > 0 ? "Pending" : "Completed",
    pendingFromLabel(r.statusCounts),
  ];
});

return sortRowsByTowerUnit(rows);

}

// export function buildSnaggingRowsFromItems(
//   items,
//   { stageMap, flatLookup, buildingNameMap, getChecklistLabel } = {}
// ) {
//   const map = new Map();

//   (items || []).forEach((it) => {
//     const loc = it.location || {};
//     const flatId = loc.flat_id;
//     const meta = flatId ? flatLookup?.[flatId] : null;

//     const tower =
//       loc.tower_name ||
//       loc.building_name ||
//       (loc.building_id && buildingNameMap?.get?.(String(loc.building_id))) ||
//       (loc.building_id ? `Building #${loc.building_id}` : "");

//     const unitNo = meta?.number || flatId || "";

//     const stageId = it.checklist?.stage_id || "";
//     const stage = stageMap?.[stageId] || stageId || "";

//     const checklist = getChecklistLabel
//       ? getChecklistLabel(it)
//       : it.checklist?.title || it.checklist?.name || "";

//     const key = `${tower}|${unitNo}|${checklist}|${stage}`;
//     const rec = map.get(key) || {
//       tower,
//       unitNo,
//       checklist,
//       stage,

//       // ✅ keep both, but we will mirror them
//       totalCp: 0,
//       doneCp: 0,
//       totalSnag: 0,
//       doneSnag: 0,

//       statusCounts: {},
//       attemptsMax: 0,
//     };

//     const st = String(it.item_status || "").toLowerCase();
//     rec.statusCounts[st] = (rec.statusCounts[st] || 0) + 1;

//     // ✅ IMPORTANT: CP & Snag both count the SAME items
//     rec.totalCp += 1;
//     rec.totalSnag += 1;

//     if (st === "completed") {
//       rec.doneCp += 1;
//       rec.doneSnag += 1;
//     }

//     const att = Number(it?.latest_submission?.attempts || 0);
//     if (!Number.isNaN(att)) rec.attemptsMax = Math.max(rec.attemptsMax, att);

//     map.set(key, rec);
//   });

//   return Array.from(map.values()).map((r) => {
//     const pendingCp = r.totalCp - r.doneCp;
//     const pendingSnag = r.totalSnag - r.doneSnag;

//     // ✅ now these will always be identical
//     const cpPct = r.totalCp > 0 ? Math.round((r.doneCp / r.totalCp) * 100) : 0;
//     const snagPct = r.totalSnag > 0 ? Math.round((r.doneSnag / r.totalSnag) * 100) : 0;

//     // ✅ overall also same (use base totals, no double-count confusion)
//     const overallPct = r.totalCp > 0 ? Math.round((r.doneCp / r.totalCp) * 100) : 0;

//     const pendingAll = pendingCp; // same as pendingSnag

//     return [
//       r.tower,
//       r.unitNo,
//       r.checklist,
//       r.stage,

//       r.totalCp,
//       r.doneCp,
//       pendingCp,
//       `${cpPct}%`,

//       r.totalSnag,
//       r.doneSnag,
//       pendingSnag,
//       `${snagPct}%`,

//       r.attemptsMax || 0,
//       pendingAll > 0 ? "Pending" : "Completed",
//       pendingFromLabel(r.statusCounts),
//       `${overallPct}%`,
//     ];
//   });
// }

// export function buildSnaggingRowsFromItems(
//   items,
//   { stageMap, flatLookup, buildingNameMap, getChecklistLabel } = {}
// ) {
//   const map = new Map();

//   const norm = (s) => String(s || "").toLowerCase();

//   // 👇 tweak these if your backend uses different status names
//   const MAKER_PENDING_STATUSES = new Set([
//     "pending_for_maker",
//     "pending_maker",
//     "started",
//   ]);

//   const CHECKER_PENDING_STATUSES = new Set([
//     "pending_checker",
//     "pending_for_checker",
//     "pending_for_inspector", // you renamed this label in UI as "Pending For Checker"
//   ]);

//   const isCheckerChecked = (it) => {
//     const latest = it?.latest_submission || {};
//     const st = norm(it?.item_status);
//     // primary: checked_at exists
//     if (latest?.checked_at) return true;
//     // fallback: if item moved past creation/not_started states
//     if (st && st !== "created" && st !== "not_started") return true;
//     return false;
//   };

//   const isClosed = (it) => norm(it?.item_status) === "completed";

//   const getAttempts = (it) => {
//     const n = Number(it?.latest_submission?.attempts || 0);
//     return Number.isNaN(n) ? 0 : n;
//   };

//   // ✅ identify snag points:
//   // 1) trust actual flags if present (your helper exists above in file)
//   // 2) otherwise infer via statuses / attempts
//   const isSnag = (it) => {
//     try {
//       if (typeof isSnagPoint === "function" && isSnagPoint(it) === true) return true;
//     } catch {}

//     const st = norm(it?.item_status);
//     const att = getAttempts(it);

//     if (MAKER_PENDING_STATUSES.has(st)) return true;
//     if (CHECKER_PENDING_STATUSES.has(st)) return true;

//     // attempts > 0 usually means checker rejected at least once (snag cycle)
//     if (att > 0) return true;

//     return false;
//   };

//   const computePendingFromAndStatus = ({
//     cpPending,
//     totalSnag,
//     makerPending,
//     checkerPending,
//   }) => {
//     // If checker hasn't even checked all checkpoints yet
//     if (cpPending > 0) return { status: "Pending by Checker", pendingFrom: "Checker" };

//     // If snag exists -> maker/checker derived status
//     if (totalSnag > 0) {
//       if (makerPending > 0) return { status: "Pending by Maker", pendingFrom: "Maker" };
//       if (checkerPending > 0) return { status: "Pending by Checker", pendingFrom: "Checker" };
//       return { status: "Completed", pendingFrom: "" };
//     }

//     // No snags & checker finished
//     return { status: "Completed", pendingFrom: "" };
//   };

//   (items || []).forEach((it) => {
//     const loc = it.location || {};
//     const flatId = loc.flat_id;
//     const meta = flatId ? flatLookup?.[flatId] : null;

//     // const tower =
//     //   loc.tower_name ||
//     //   loc.building_name ||
//     //   (loc.building_id && buildingNameMap?.get?.(String(loc.building_id))) ||
//     //   (loc.building_id ? `Building #${loc.building_id}` : "");

//     // const unitNo = meta?.number || flatId || "";

//     // const stageId = it.checklist?.stage_id || "";
//     // const stage = stageMap?.[stageId] || stageId || "";

//     // const checklist = getChecklistLabel
//     //   ? getChecklistLabel(it)
//     //   : it.checklist?.title || it.checklist?.name || "";

//     // const key = `${tower}|${unitNo}|${checklist}|${stage}`;
//     const towerRaw =
//   loc.tower_name ||
//   loc.building_name ||
//   (loc.building_id && buildingNameMap?.get?.(String(loc.building_id))) ||
//   (loc.building_id ? `Building #${loc.building_id}` : "");

// const unitRaw = meta?.number || flatId || "";

// const stageId = it.checklist?.stage_id || "";
// const stageRaw = stageMap?.[stageId] || stageId || "";

// const checklistRaw = getChecklistLabel
//   ? getChecklistLabel(it)
//   : it.checklist?.title || it.checklist?.name || "";

// // ✅ normalize
// const tower = String(towerRaw || "").trim();
// const unitNo = String(unitRaw || "").trim();
// const stage = String(stageRaw || "").trim();
// const checklist = String(checklistRaw || "").trim();

// const key = `${tower}|${unitNo}|${checklist}|${stage}`;


//     const rec = map.get(key) || {
//       tower,
//       unitNo,
//       checklist,
//       stage,

//       // totals
//       totalCp: 0,
//       checkerCheckDone: 0,

//       totalSnag: 0,
//       snagRejected: 0, // same bucket count

//       makerPending: 0,
//       checkerPending: 0,
//       checkerDone: 0,

//       // for overall
//       nonSnagChecked: 0,

//       attemptsMax: 0,
//     };

//     rec.totalCp += 1;

//     const st = norm(it.item_status);
//     const checked = isCheckerChecked(it);
//     if (checked) rec.checkerCheckDone += 1;

//     const att = getAttempts(it);
//     rec.attemptsMax = Math.max(rec.attemptsMax, att);

//     const snag = isSnag(it);
//     if (snag) {
//       rec.totalSnag += 1;
//       rec.snagRejected += 1;

//       // maker pending = currently with maker
//       if (MAKER_PENDING_STATUSES.has(st)) {
//         rec.makerPending += 1;
//       } else if (!it?.latest_submission?.maker_at && !isClosed(it)) {
//         // fallback: if maker never submitted and not closed, assume with maker
//         rec.makerPending += 1;
//       }

//       // checker pending = currently with checker after maker submits
//       if (CHECKER_PENDING_STATUSES.has(st)) {
//         rec.checkerPending += 1;
//       }

//       // closed by checker
//       if (isClosed(it)) rec.checkerDone += 1;
//     } else {
//       // non-snag: count done for overall when checker checked
//       if (checked) rec.nonSnagChecked += 1;
//     }

//     map.set(key, rec);
//   });

//     const rows = Array.from(map.values()).map((r) => {
//     const cpPending = r.totalCp - r.checkerCheckDone;
//     const checkerCheckPct =
//       r.totalCp > 0 ? Math.round((r.checkerCheckDone / r.totalCp) * 100) : 0;

//     const makerDone = r.totalSnag - r.makerPending;
//     const makerPct =
//       r.totalSnag > 0 ? Math.round((makerDone / r.totalSnag) * 100) : 0;

//     const checkerPct =
//       r.totalSnag > 0 ? Math.round((r.checkerDone / r.totalSnag) * 100) : 0;

//     const { status, pendingFrom } = computePendingFromAndStatus({
//       cpPending,
//       totalSnag: r.totalSnag,
//       makerPending: r.makerPending,
//       checkerPending: r.checkerPending,
//     });

//     const overallDone = r.nonSnagChecked + r.checkerDone;
//     const overallPct =
//       r.totalCp > 0 ? Math.round((overallDone / r.totalCp) * 100) : 0;

//     return [
//       r.tower,
//       r.unitNo,
//       r.checklist,
//       r.stage,

//       r.totalCp,
//       r.checkerCheckDone,
//       cpPending,
//       `${checkerCheckPct}%`,

//       r.totalSnag,
//       r.snagRejected,

//       makerDone,
//       r.makerPending,
//       `${makerPct}%`,

//       r.checkerDone,
//       r.checkerPending,
//       `${checkerPct}%`,

//       r.attemptsMax || 0,
//       status,
//       pendingFrom,
//       `${overallPct}%`,
//     ];
//   });

//   return sortRowsByTowerUnit(rows);
// }


export function buildSnaggingRowsFromItems(
  items,
  { stageMap, flatLookup, buildingNameMap, getChecklistLabel } = {}
) {
  const map = new Map();
  const norm = (s) => String(s || "").toLowerCase().trim();

  const towerLabel = (loc = {}) =>
    String(
      (loc.tower_name ||
        loc.building_name ||
        (loc.building_id && buildingNameMap?.get?.(String(loc.building_id))) ||
        (loc.building_id ? `Building #${loc.building_id}` : "")) || ""
    ).trim();

  const unitLabel = (flatId, meta) =>
    String(meta?.number || flatId || "").trim();

  const stageLabel = (it) => {
    const sid = it?.checklist?.stage_id;
    return String(stageMap?.[sid] || sid || "").trim();
  };

  const checklistLabel = (it) =>
    String(
      (getChecklistLabel ? getChecklistLabel(it) : "") ||
        it?.checklist?.title ||
        it?.checklist?.name ||
        ""
    ).trim();

  const toTime = (v) => {
    const t = v ? new Date(v).getTime() : 0;
    return Number.isNaN(t) ? 0 : t;
  };

  (items || []).forEach((it) => {
    const loc = it.location || {};
    const flatId = loc.flat_id;
    const meta = flatId ? flatLookup?.[flatId] : null;

    const tower = towerLabel(loc);
    const unitNo = unitLabel(flatId, meta);
    const stage = stageLabel(it);
    const checklist = checklistLabel(it);

    const key = `${tower}|${unitNo}|${checklist}|${stage}`;

    const rec = map.get(key) || {
      tower,
      unitNo,
      checklist,
      stage,

      // ✅ Base
      totalCp: 0,

      // ✅ Checker initial check
      checkerChecked: 0, // checked (accepted OR rejected)
      cpPending: 0,       // derived later

      // ✅ Open/total snags
      totalSnagOpen: 0,   // derived later

      // ✅ Rejected (actual snags raised by checker)
      rejectedTotal: 0,

      // ✅ Maker cycle on rejected
      makerPending: 0,
      makerDone: 0,

      // ✅ Checker re-check cycle (only after maker submits)
      checkerPending: 0,
      checkerDone: 0,

      attemptsMax: 0,
    };

    rec.totalCp += 1;

    const st = norm(it?.item_status);
    const latest = it?.latest_submission || {};

    const checkedAt = toTime(latest.checked_at); // checker action time
    const makerAt = toTime(latest.maker_at);     // maker submit time
    const attempts = Number(latest.attempts || 0);
    rec.attemptsMax = Math.max(rec.attemptsMax, Number.isNaN(attempts) ? 0 : attempts);

    const isClosed = st === "completed";

    // ✅ Checker "checked" = accepted OR rejected (once checker touches)
    // Prefer checked_at, fallback by status
    const checkerTouched =
      !!checkedAt ||
      isClosed ||
      st === "pending_for_maker" ||
      st === "pending_maker" ||
      st === "pending_for_checker" ||
      st === "pending_for_inspector" ||
      st === "pending_checker";

    if (checkerTouched) rec.checkerChecked += 1;

    // ✅ "Rejected by checker" = attempts>0 (true snag raised)
    // Fallback: if status shows maker/checker cycle but attempts missing.
    const everRejected =
      attempts > 0 ||
      st === "pending_for_maker" ||
      st === "pending_maker" ||
      st === "pending_for_checker" ||
      st === "pending_for_inspector";

    if (everRejected) {
      rec.rejectedTotal += 1;

      // ✅ Decide current bucket using timeline (more accurate than guessing)
      // If maker has NOT submitted after last checker action -> pending with maker
      if (!isClosed && (makerAt === 0 || makerAt <= checkedAt)) {
        rec.makerPending += 1;
      } else {
        // maker has submitted (or item is closed)
        rec.makerDone += 1;

        if (isClosed) {
          rec.checkerDone += 1;
        } else {
          // maker submitted but checker hasn't closed yet -> pending with checker
          rec.checkerPending += 1;
        }
      }
    }

    map.set(key, rec);
  });
  const rows = Array.from(map.values()).map((r) => {
  const cpPending = r.totalCp - r.checkerChecked;

  // OPEN rejected only
  const totalSnagPoints = r.makerPending + r.checkerPending;
  const totalRejectedByChecker = r.rejectedTotal;

  const checkerCheckPct =
    r.totalCp > 0 ? Math.round((r.checkerChecked / r.totalCp) * 100) : 0;

  const makerDen = r.makerDone + r.makerPending;
  const makerPct = makerDen > 0 ? Math.round((r.makerDone / makerDen) * 100) : 0;

  const checkerDen = r.checkerDone + r.checkerPending;
  const checkerPct = checkerDen > 0 ? Math.round((r.checkerDone / checkerDen) * 100) : 0;

  let status = "Completed";
  let pendingFrom = "";
  if (cpPending > 0) {
    status = "Pending by Checker";
    pendingFrom = "Checker";
  } else if (r.makerPending > 0) {
    status = "Pending by Maker";
    pendingFrom = "Maker";
  } else if (r.checkerPending > 0) {
    status = "Pending by Checker";
    pendingFrom = "Checker";
  }

  const overallDone = r.totalCp - (cpPending + totalSnagPoints);
  const overallPct = r.totalCp > 0 ? Math.round((overallDone / r.totalCp) * 100) : 0;

  return [
    r.tower,
    r.unitNo,
    r.checklist,
    r.stage,

    r.totalCp,
    r.checkerChecked,
    cpPending,
    `${checkerCheckPct}%`,          // ✅ THIS WAS MISSING (col 7)

    totalSnagPoints,               // col 8
    totalRejectedByChecker,        // col 9

    r.makerDone,                   // col 10
    r.makerPending,                // col 11
    `${makerPct}%`,                // col 12

    r.checkerDone,                 // col 13
    r.checkerPending,              // col 14
    `${checkerPct}%`,              // col 15

    r.attemptsMax || 0,            // col 16
    status,                        // col 17
    pendingFrom,                   // col 18
    `${overallPct}%`,              // col 19
  ];
});

  // const rows = Array.from(map.values()).map((r) => {
  //   const cpPending = r.totalCp - r.checkerChecked;

  //   // ✅ Open points (tumhari language: "pending wale points")
  //   // (not yet checked by checker) + (rejected pending with maker) + (maker submitted but checker pending)
  //   const totalSnagOpen = cpPending + r.makerPending + r.checkerPending;

  //   // ✅ Maker %
  //   const makerDen = r.makerDone + r.makerPending; // = rejectedTotal basically
  //   const makerPct = makerDen > 0 ? Math.round((r.makerDone / makerDen) * 100) : 0;

  //   // ✅ Checker %
  //   const checkerDen = r.checkerDone + r.checkerPending; // only after maker submit
  //   const checkerPct = checkerDen > 0 ? Math.round((r.checkerDone / checkerDen) * 100) : 0;

  //   // ✅ Status / Pending From
  //   let status = "Completed";
  //   let pendingFrom = "";
  //   if (cpPending > 0) {
  //     status = "Pending by Checker";
  //     pendingFrom = "Checker";
  //   } else if (r.makerPending > 0) {
  //     status = "Pending by Maker";
  //     pendingFrom = "Maker";
  //   } else if (r.checkerPending > 0) {
  //     status = "Pending by Checker";
  //     pendingFrom = "Checker";
  //   }

  //   // ✅ Overall %
  //   const openAll = totalSnagOpen;
  //   const overallDone = r.totalCp - openAll;
  //   const overallPct = r.totalCp > 0 ? Math.round((overallDone / r.totalCp) * 100) : 0;

  //   const checkerCheckPct = r.totalCp > 0 ? Math.round((r.checkerChecked / r.totalCp) * 100) : 0;

  //   return [
  //     r.tower,
  //     r.unitNo,
  //     r.checklist,
  //     r.stage,

  //     r.totalCp,
  //     r.checkerChecked,
  //     cpPending,
  //     `${checkerCheckPct}%`,

  //     totalSnagOpen,        // ✅ Total Snag Points (open/pending)
  //     r.rejectedTotal,      // ✅ Snag Rejected by Checker (TRUE rejected)

  //     r.makerDone,
  //     r.makerPending,
  //     `${makerPct}%`,

  //     r.checkerDone,
  //     r.checkerPending,
  //     `${checkerPct}%`,

  //     r.attemptsMax || 0,
  //     status,
  //     pendingFrom,
  //     `${overallPct}%`,
  //   ];
  // });

  // Keep your sort (same as earlier)
  return sortRowsByTowerUnit(rows);
}



/* ---------------- Pareto ---------------- */
const PARETO_CATEGORY_MODES = [
  // { value: "room", label: "Room Category" },
  // { value: "flatType", label: "Flat Type" },
  { value: "checklist", label: "Checklist Title" },
  // { value: "question", label: "Question" },
];

function getParetoCategoryLabel(item, flatLookup, mode) {
  const loc = item.location || {};
  const cl = item.checklist || {};

  if (mode === "room") {
    const label = loc.room_category || loc.room_type || loc.room || null;
    return label || "Unmapped Room";
  }

  if (mode === "flatType") {
    const flatId = loc.flat_id;
    const meta = flatId ? flatLookup[flatId] : null;
    return meta?.typeName || (meta?.number ? `Flat ${meta.number}` : null) || "Unmapped Flat Type";
  }

  if (mode === "checklist") {
    const label =
      cl.category_level3_name ||
      cl.category_level3_label ||
      cl.category_level3_title ||
      (cl.category_level3 && (cl.category_level3.name || cl.category_level3.title)) ||
      cl.category_level2_name ||
      cl.category_level2_label ||
      (cl.category_level2 && (cl.category_level2.name || cl.category_level2.title)) ||
      cl.category_level1_name ||
      cl.category_level1_label ||
      (cl.category_level1 && (cl.category_level1.name || cl.category_level1.title)) ||
      cl.category_name ||
      cl.category_label ||
      cl.category_title ||
      (cl.category && (cl.category.name || cl.category.title)) ||
      cl.name ||
      cl.title ||
      null;

    if (label) return String(label);
    if (cl.id) return `Checklist #${cl.id}`;
    return "Unmapped Checklist";
  }

  if (mode === "question") {
    const q = item.item_title || item.question || cl.question_text || null;
    return q || `Unmapped Question (${item.item_id || "N/A"})`;
  }

  return "Other";
}

const CORE_ROLES_FOR_HEAD = [
  "MAKER",
  "SUPERVISOR",
  "CHECKER",
  "PROJECT_MANAGER",
  "PROJECT_HEAD",
  "MANAGER",
  "HEAD",
];

const CHART_COLORS = {
  primary: "#4f46e5",
  secondary: "#2563eb",
  success: "#16a34a",
  warning: "#f97316",
  danger: "#dc2626",
  muted: "#94a3b8",
};

const Card = ({ theme, children, className = "" }) => (
  <div
    className={`rounded-2xl border backdrop-blur-sm ${className}`}
    style={{
      background: theme === "dark" ? "rgba(15,23,42,0.70)" : "rgba(255,255,255,0.95)",
      borderColor: theme === "dark" ? "#334155" : "#e2e8f0",
    }}
  >
    {children}
  </div>
);


const Label = ({ theme, children }) => (
  <div
    className="text-[11px] font-semibold mb-1"
    style={{ color: theme === "dark" ? "#94a3b8" : "#64748b" }}
  >
    {children}
  </div>
);

const Select = ({ theme, value, onChange, children, multiple = false, className = "" }) => (
  <select
    multiple={multiple}
    value={value}
    onChange={onChange}
    className={`w-full px-3 py-2 rounded-xl border text-sm font-semibold outline-none ${className}`}
    style={{
      borderColor: theme === "dark" ? "#475569" : "#cbd5e1",
      background: theme === "dark" ? "rgba(2,6,23,0.6)" : "rgba(248,250,252,0.95)",
      color: theme === "dark" ? "#e2e8f0" : "#0f172a",
      minHeight: multiple ? "70px" : undefined,
    }}
  >
    {children}
  </select>
);

const ProjectOverview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const location = useLocation();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [stageMap, setStageMap] = useState({});
  const [flatLookup, setFlatLookup] = useState({});
  // const [stageMap, setStageMap] = useState({});
const [stagePurposeMap, setStagePurposeMap] = useState({}); // ✅ add this
// const [flatLookup, setFlatLookup] = useState({});


  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const projectFromState = location.state?.project || null;

  const [viewMode, setViewMode] = useState("head");
  const [globalFilters, setGlobalFilters] = useState({
  buildingId: "",
  floorId: "",     // ✅ NEW
  flatId: "",

  stageId: "",
  status: "",
  role: "",

  // (optional) keep these if you still want advanced filters
  flatCategory: "",
  roomCategory: "",
  timeWindow: "all",
});


  // const [globalFilters, setGlobalFilters] = useState({
  //   status: "",
  //   role: "",
  //   stageId: "",
  //   buildingId: "",
  //   flatId: "",          // ✅ add
  //   flatCategory: "",
  //   roomCategory: "",
  //   timeWindow: "all", // all | 30d | 7d
  // });


 const [paretoFilters, setParetoFilters] = useState({
  categoryMode: "checklist", // ✅ match the dropdown options
  floorIds: [],
  focusFlatIds: [],
});

  const [questionFilters, setQuestionFilters] = useState({
    stageId: "",
    categoryId: "",
    buildingId: "",
    floorId: "",
    roomCategory: "",
    statusBucket: "open", // open | closed | all
  });

  const textColor = theme === "dark" ? "#e2e8f0" : "#0f172a";
  const subText = theme === "dark" ? "#94a3b8" : "#64748b";

  useEffect(() => {
    try {
      const userDataStr = localStorage.getItem("USER_DATA");
      const userData = userDataStr ? JSON.parse(userDataStr) : null;

      const roleFromStorage =
        localStorage.getItem("ROLE") ||
        userData?.role ||
        (userData?.roles && userData.roles[0]) ||
        "";

      const normalizedProjectRoles = Array.isArray(projectFromState?.roles)
        ? projectFromState.roles.map((r) => (typeof r === "string" ? r : r?.role || ""))
        : [];

      const allRoleStrings = [roleFromStorage, ...(normalizedProjectRoles || [])]
        .filter(Boolean)
        .map((r) => String(r).toLowerCase());

      const isManager =
        userData?.is_manager ||
        allRoleStrings.some((r) => ["manager", "project_manager"].some((x) => r.includes(x)));

      const isHead = allRoleStrings.some((r) => ["project_head", "head"].some((x) => r.includes(x)));

      const isSuperAdmin =
        (typeof roleFromStorage === "string" && roleFromStorage.toLowerCase().includes("super admin")) ||
        userData?.superadmin === true ||
        userData?.is_superadmin === true ||
        userData?.is_staff === true;

      if (isSuperAdmin || isManager) setViewMode("manager");
      else if (isHead) setViewMode("head");
      else setViewMode("manager");
    } catch {
      setViewMode("head");
    }
  }, [projectFromState]);

  const resolveUserName = (uid) => {
    if (!uid) return "-";
    return userMap[uid] || `User #${uid}`;
  };
const pickPurposeInfo = (it) => {
  const stageId = it?.checklist?.stage_id;
  const p = stageId ? stagePurposeMap?.[stageId] : null;

  const label = p?.name
    ? String(p.name)
    : String(
        it?.checklist?.purpose_name ||
        it?.checklist?.purpose ||
        it?.purpose_name ||
        it?.purpose ||
        "Unassigned"
      );

  // ✅ key always based on label
  return { key: label.trim().toLowerCase(), label };
};

// ✅ Pareto: Select all / Unselect all for flats

const [projectBuildings, setProjectBuildings] = useState([]);

useEffect(() => {
  if (!id) return;
  axios
    .get(`${API_BASE}/projects/buildings/by_project/${id}/`, { headers: authHeaders() })
    .then((res) => setProjectBuildings(Array.isArray(res.data) ? res.data : []))
    .catch(() => setProjectBuildings([]));
}, [id]);

const groupItemsByPurpose = (items = []) => {
  const map = new Map();
  items.forEach((it) => {
    const { key, label } = pickPurposeInfo(it);
    const rec = map.get(key) || { key, label, items: [] };
    rec.items.push(it);
    map.set(key, rec);
  });

  return Array.from(map.values()).sort(
    (a, b) => b.items.length - a.items.length || String(a.label).localeCompare(String(b.label))
  );
};

// ✅ do NOT "includes('snag')" guess. Only trust actual flags/types if present.
// const isSnagPoint = (it) => {
//   const v =
//     it?.is_snag_point ??
//     it?.is_snag ??
//     it?.snag_point ??
//     it?.snag ??
//     it?.item?.is_snag_point ??
//     null;

//   if (v === true) return true;
//   if (v === false) return false;

//   // fallback only if backend sends a strict type
//   const t = String(it?.item_type || it?.type || it?.item_kind || "").toLowerCase();
//   return t === "snag" || t === "snag_point";
// };

  /* ---------------- data fetch ---------------- */
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError("");
      try {
        const [statsRes, usersRes] = await Promise.all([
          axios.get(`${API_BASE}/checklists/stats/watcher-deep/`, {
            params: { project_id: id },
            headers: authHeaders(),
          }),
          axios.get(`${API_BASE}/users/users-by-creator/`, { headers: authHeaders() }),
        ]);

        const statsData = statsRes.data;
        setStats(statsData);

        const uMap = {};
        (usersRes.data || []).forEach((u) => {
          const displayName =
            (u.first_name && u.first_name.trim()) ||
            (u.username && u.username.trim()) ||
            u.email ||
            `User #${u.id}`;
          uMap[u.id] = displayName;
        });
        setUserMap(uMap);
        setUsers(usersRes.data || []);

        // stage map by phase ids (derived from items)
        const phaseSet = new Set();
        (statsData.items || []).forEach((item) => {
          const phId = item.checklist?.phase_id;
          if (phId) phaseSet.add(phId);
        });

        const phaseIds = Array.from(phaseSet);
const newStageMap = {};
const newPurposeMap = {};

        if (phaseIds.length > 0) {
          await Promise.all(
            phaseIds.map((phaseId) =>
              axios
                .get(`${API_BASE}/projects/stages/by_phase/${phaseId}/`, { headers: authHeaders() })
                .then((resp) => {
                  (resp.data || []).forEach((stage) => {
  if (!stage || stage.id == null) return;

  // stage label
  newStageMap[stage.id] =
    stage.name ||
    (stage.stage_name && stage.stage_name.name) ||
    `Stage #${stage.id}`;

  // ✅ purpose extraction (matches your API response)
  const pObj =
    stage?.purpose?.name?.purpose ||  // <-- your sample: purpose.name.purpose
    stage?.purpose?.purpose ||
    stage?.purpose;

  const pId = pObj?.id ?? stage?.purpose?.id ?? null;
  const pName = pObj?.name ?? pObj?.title ?? null;

  if (pName || pId) {
    newPurposeMap[stage.id] = { id: pId ? String(pId) : String(pName), name: String(pName || "Unassigned") };
  }
});

                })
                .catch(() => {})
            )
          );
        }
        setStageMap(newStageMap);
        setStagePurposeMap(newPurposeMap);

      } catch (err) {
        const msg =
          err?.response?.data?.detail || err?.response?.data?.message || "Failed to load project stats.";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAll();
  }, [id]);

  // levels-with-flats for flat meta
  useEffect(() => {
    if (!stats?.items || !Array.isArray(stats.items)) return;

    const buildingIds = Array.from(
      new Set(stats.items.map((it) => it.location?.building_id).filter(Boolean))
    );
    if (!buildingIds.length) return;

    const fetchLevelsWithFlats = async () => {
      try {
        const responses = await Promise.all(
          buildingIds.map((bid) => axios.get(`${API_BASE}/projects/levels-with-flats/${bid}/`, { headers: authHeaders() }))
        );

        const map = {};
        responses.forEach((res) => {
          (res.data || []).forEach((level) => {
            const levelName = level.name;
            const levelId = level.id;
            (level.flats || []).forEach((flat) => {
              map[flat.id] = {
                number: flat.number,
                typeName: flat.flattype?.type_name || "",
                levelName,
                levelId,
              };
            });
          });
        });

        setFlatLookup(map);
      } catch {
        // silent
      }
    };

    fetchLevelsWithFlats();
  }, [stats]);

  /* ---------------- derived options ---------------- */
  const projectName =
    projectFromState?.name || projectFromState?.project_name || `Project #${id}`;

  const distinctStatuses = useMemo(() => {
    const s = new Set();
    (stats?.items || []).forEach((item) => {
      if (item.item_status) s.add(String(item.item_status).toLowerCase());
    });
    return Array.from(s);
  }, [stats]);
  

  const buildingNameMap = useMemo(() => {
    const map = new Map();
    (stats?.buildings || []).forEach((b) => {
      const bid = b.id || b.building_id;
      if (!bid) return;
      map.set(String(bid), String(b.name || b.title || b.building_name || `Building #${bid}`));
    });
    (projectBuildings || []).forEach((b) => {
    if (!b?.id) return;
    map.set(String(b.id), String(b.name || `Building #${b.id}`));
  });

    const items = Array.isArray(stats?.items) ? stats.items : [];
    items.forEach((it) => {
      const loc = it.location || {};
      if (!loc.building_id) return;
      const bid = String(loc.building_id);
      const label = loc.building_name || loc.tower_name || loc.wing || map.get(bid) || `Building #${bid}`;
      map.set(bid, String(label));
    });

    return map;
  }, [stats,projectBuildings]);

  const buildingOptions = useMemo(
    () => Array.from(buildingNameMap.entries()).map(([id, label]) => ({ id, label })),
    [buildingNameMap]
  );

  const floorOptions = useMemo(() => {
    const buildingId = globalFilters.buildingId;
    if (!buildingId) return [];
    const items = Array.isArray(stats?.items) ? stats.items : [];
    const levelsMap = new Map();

    items.forEach((it) => {
      const loc = it.location || {};
      if (!loc.flat_id) return;
      if (!loc.building_id || String(loc.building_id) !== String(buildingId)) return;

      const meta = flatLookup[loc.flat_id];
      if (!meta?.levelId) return;

      if (!levelsMap.has(meta.levelId)) {
        levelsMap.set(meta.levelId, {
          id: String(meta.levelId),
          label: meta.levelName || `Floor #${meta.levelId}`,
        });
      }
    });

    return Array.from(levelsMap.values()).sort((a, b) => String(a.label).localeCompare(String(b.label)));
  }, [stats, globalFilters.buildingId, flatLookup]);

  // const flatOptions = useMemo(() => {
  //   // const items = Array.isArray(stats?.items) ? stats.items : [];
  //   const items = Array.isArray(workingItems) ? workingItems : [];

  //   const map = new Map();

  //   items.forEach((it) => {
  //     const loc = it.location || {};
  //     const flatId = loc.flat_id;
  //     if (!flatId) return;

  //     if (globalFilters.buildingId && loc.building_id && String(loc.building_id) !== String(globalFilters.buildingId)) {
  //       return;
  //     }

  //     if (!map.has(flatId)) {
  //       const meta = flatLookup[flatId] || {};
  //       const baseLabel = meta.number ? `Flat ${meta.number}` : `Flat #${flatId}`;
  //       const label = meta.typeName ? `${baseLabel} • ${meta.typeName}` : baseLabel;
  //       map.set(flatId, { id: String(flatId), label });
  //     }
  //   });

  //   return Array.from(map.values()).sort((a, b) => String(a.label).localeCompare(String(b.label)));
  // }, [stats, flatLookup, globalFilters.buildingId]);

  const flatCategoryOptions = useMemo(() => {
    const items = Array.isArray(stats?.items) ? stats.items : [];
    const categories = new Set();
    items.forEach((it) => {
      const flatId = it.location?.flat_id;
      if (!flatId) return;
      const meta = flatLookup[flatId];
      const cat = meta?.typeName || null;
      if (cat) categories.add(String(cat));
    });
    return Array.from(categories).sort();
  }, [stats, flatLookup]);

  const roomCategoryOptions = useMemo(() => {
    const items = Array.isArray(stats?.items) ? stats.items : [];
    const categories = new Set();
    items.forEach((it) => {
      const loc = it.location || {};
      const cat = loc.room_category || loc.room_type || loc.room || null;
      if (cat) categories.add(String(cat));
    });
    return Array.from(categories).sort();
  }, [stats]);

  const checklistCategoryOptions = useMemo(() => {
    const items = Array.isArray(stats?.items) ? stats.items : [];
    const map = new Map();

    items.forEach((it) => {
      const cl = it.checklist || {};
      const cid = cl.category_id || cl.category || cl.categoryId || cl.category_id_fk || null;
      if (!cid) return;

      const label =
        cl.category_name ||
        cl.category_label ||
        cl.category_title ||
        (cl.category && cl.category.name) ||
        cl.name ||
        cl.title ||
        `Category #${cid}`;

      const key = String(cid);
      if (!map.has(key)) map.set(key, String(label));
    });

    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [stats]);

  const questionFloorOptions = useMemo(() => {
    const bId = questionFilters.buildingId;
    if (!bId) return [];

    const items = Array.isArray(stats?.items) ? stats.items : [];
    const levelsMap = new Map();

    items.forEach((it) => {
      const loc = it.location || {};
      if (!loc.flat_id) return;
      if (!loc.building_id || String(loc.building_id) !== String(bId)) return;

      const meta = flatLookup[loc.flat_id];
      if (!meta?.levelId) return;

      if (!levelsMap.has(meta.levelId)) {
        levelsMap.set(meta.levelId, {
          id: String(meta.levelId),
          label: meta.levelName || `Floor #${meta.levelId}`,
        });
      }
    });

    return Array.from(levelsMap.values()).sort((a, b) => String(a.label).localeCompare(String(b.label)));
  }, [stats, flatLookup, questionFilters.buildingId]);

  /* ---------------- filtering ---------------- */
  const filteredItemsGlobal = useMemo(() => {
  const items = Array.isArray(stats?.items) ? stats.items : [];

  // const {
  //   status,
  //   role,
  //   stageId,
  //   buildingId,
  //   flatId, // ✅ IMPORTANT
  //   flatCategory,
  //   roomCategory,
  //   timeWindow,
  // } = globalFilters;
  const {
  buildingId,
  floorId,  // ✅ NEW
  flatId,
  stageId,
  status,
  role,
  flatCategory,
  roomCategory,
  timeWindow,
} = globalFilters;


  // ✅ include flatId here also
  if (
    !status &&
    !role &&
    !stageId &&
    !buildingId &&
    !flatId &&
    !flatCategory &&
    !roomCategory &&
    timeWindow === "all"
  ) {
    return items;
  }

  const now = new Date();

  return items.filter((item) => {
    if (status && !matchesStatusFilter(item, status)) return false;

    if (role) {
      const rolesObj = item.roles || {};
      const block = rolesObj[role.toLowerCase()];
      if (!block || !block.user_id) return false;
    }

    if (stageId) {
      const sId = item.checklist?.stage_id;
      if (!sId || String(sId) !== String(stageId)) return false;
    }

    if (buildingId) {
      const bId = item.location?.building_id;
      if (!bId || String(bId) !== String(buildingId)) return false;
    }

    // ✅ Flat filter (put it HERE)
    if (flatId) {
      const fId = item.location?.flat_id;
      if (!fId || String(fId) !== String(flatId)) return false;
    }

    if (flatCategory) {
      const itemFlatId = item.location?.flat_id; // ✅ rename to avoid confusion
      if (!itemFlatId) return false;
      const meta = flatLookup[itemFlatId];
      const cat = meta?.typeName || null;
      if (!cat || String(cat) !== String(flatCategory)) return false;
    }
    // ✅ Floor filter (uses flatLookup levelId)
if (floorId) {
  const fId = item.location?.flat_id;
  if (!fId) return false;

  const meta = flatLookup[fId];
  const lvl = meta?.levelId ? String(meta.levelId) : "";
  if (!lvl || lvl !== String(floorId)) return false;
}


    if (roomCategory) {
      const loc = item.location || {};
      const cat = loc.room_category || loc.room_type || loc.room || null;
      if (!cat || String(cat) !== String(roomCategory)) return false;
    }

    if (timeWindow !== "all") {
      const latest = item.latest_submission || {};
      const lastTimeStr = latest.checked_at || latest.supervised_at || latest.maker_at || null;
      if (!lastTimeStr) return false;

      const t = new Date(lastTimeStr);
      if (Number.isNaN(t.getTime())) return false;

      const diffDays = (now - t) / (1000 * 60 * 60 * 24);
      if (timeWindow === "30d" && diffDays > 30) return false;
      if (timeWindow === "7d" && diffDays > 7) return false;
    }

    return true;
  });
}, [stats, globalFilters, flatLookup]);


  // const filtersActive = useMemo(() => {
  //   const { status, role, stageId, buildingId, flatCategory,flatId, roomCategory, timeWindow } = globalFilters;
  //   return !!status || !!role || !!stageId || !!buildingId ||  !!flatId ||  !!flatCategory || !!roomCategory || timeWindow !== "all";
  // }, [globalFilters]);
  const filtersActive = useMemo(() => {
  const {
    buildingId,
    floorId,
    flatId,
    stageId,
    status,
    role,
    flatCategory,
    roomCategory,
    timeWindow,
  } = globalFilters;

  return (
    !!buildingId ||
    !!floorId ||
    !!flatId ||
    !!stageId ||
    !!status ||
    !!role ||
    !!flatCategory ||
    !!roomCategory ||
    timeWindow !== "all"
  );
}, [globalFilters]);


  const workingItems = useMemo(() => {
    if (filtersActive) return filteredItemsGlobal;
    return Array.isArray(stats?.items) ? stats.items : [];
  }, [stats, filteredItemsGlobal, filtersActive]);

const handleExport = () => {
  const groups = groupItemsByPurpose(workingItems);

  // ✅ for each purpose -> one sheet
  const sections = groups.map((g) => {
    const hotoRows = buildHotoRowsFromItems(g.items, {
      stageMap,
      flatLookup,
      buildingNameMap,
      getChecklistLabel: (it) => it?.checklist?.title || it?.checklist?.name || "",
    });

    const snaggingRows = buildSnaggingRowsFromItems(g.items, {
      stageMap,
      flatLookup,
      buildingNameMap,
      getChecklistLabel: (it) => it?.checklist?.title || it?.checklist?.name || "",
    });

    return {
  sheetName: g.label,
  rightTitle: g.label,
  snaggingRows,
  rightOnly: true, // ✅ ADD THIS
};

  });

  exportReportNewExcel({
  sections,
  fileName: `Report - ${projectName}.xlsx`,
  items: workingItems,
  buildingNameMap, // ✅ NEW (so Raw Items gets names)
});

};

const itemsForFlatOptions = useMemo(() => {
  const items = Array.isArray(stats?.items) ? stats.items : [];
  const { flatId, ...rest } = globalFilters; // ✅ remove flatId only

  // reuse your filteredItemsGlobal logic by temporarily overriding flatId
  const gf = { ...rest, flatId: "" };

  const now = new Date();
  return items.filter((item) => {
    if (gf.status && !matchesStatusFilter(item, gf.status)) return false;

    if (gf.role) {
      const rolesObj = item.roles || {};
      const block = rolesObj[gf.role.toLowerCase()];
      if (!block || !block.user_id) return false;
    }

    if (gf.stageId) {
      const sId = item.checklist?.stage_id;
      if (!sId || String(sId) !== String(gf.stageId)) return false;
    }

    if (gf.buildingId) {
      const bId = item.location?.building_id;
      if (!bId || String(bId) !== String(gf.buildingId)) return false;
    }

    if (gf.flatCategory) {
      const itemFlatId = item.location?.flat_id;
      if (!itemFlatId) return false;
      const meta = flatLookup[itemFlatId];
      const cat = meta?.typeName || null;
      if (!cat || String(cat) !== String(gf.flatCategory)) return false;
    }

    if (gf.roomCategory) {
      const loc = item.location || {};
      const cat = loc.room_category || loc.room_type || loc.room || null;
      if (!cat || String(cat) !== String(gf.roomCategory)) return false;
    }

    if (gf.timeWindow !== "all") {
      const latest = item.latest_submission || {};
      const lastTimeStr = latest.checked_at || latest.supervised_at || latest.maker_at || null;
      if (!lastTimeStr) return false;

      const t = new Date(lastTimeStr);
      if (Number.isNaN(t.getTime())) return false;

      const diffDays = (now - t) / (1000 * 60 * 60 * 24);
      if (gf.timeWindow === "30d" && diffDays > 30) return false;
      if (gf.timeWindow === "7d" && diffDays > 7) return false;
    }

    return true;
  });
}, [stats, globalFilters, flatLookup]);




  const flatOptions = useMemo(() => {
  const items = Array.isArray(itemsForFlatOptions) ? itemsForFlatOptions : [];
  const map = new Map();

  items.forEach((it) => {
    const loc = it.location || {};
    const flatId = loc.flat_id;
    if (!flatId) return;

    if (
      globalFilters.buildingId &&
      loc.building_id &&
      String(loc.building_id) !== String(globalFilters.buildingId)
    ) {
      return;
    }
    // ✅ Floor restriction (if selected)
if (globalFilters.floorId) {
  const meta = flatLookup[flatId];
  const lvl = meta?.levelId ? String(meta.levelId) : "";
  if (!lvl || lvl !== String(globalFilters.floorId)) return;
}


    if (!map.has(flatId)) {
      const meta = flatLookup[flatId] || {};
      const baseLabel = meta.number ? `Flat ${meta.number}` : `Flat #${flatId}`;
      const label = meta.typeName ? `${baseLabel} • ${meta.typeName}` : baseLabel;
      map.set(flatId, { id: String(flatId), label });
    }
  });

  return Array.from(map.values()).sort((a, b) =>
    String(a.label).localeCompare(String(b.label))
  );
}, [itemsForFlatOptions, flatLookup, globalFilters.buildingId]);

const allParetoFlatIds = useMemo(
  () => (flatOptions || []).map((f) => String(f.id)),
  [flatOptions]
);

const paretoAllFlatsSelected = useMemo(() => {
  if (!allParetoFlatIds.length) return false;
  const set = new Set(paretoFilters.focusFlatIds || []);
  return allParetoFlatIds.every((id) => set.has(id));
}, [allParetoFlatIds, paretoFilters.focusFlatIds]);

const toggleParetoSelectAllFlats = () => {
  setParetoFilters((p) => ({
    ...p,
    focusFlatIds: paretoAllFlatsSelected ? [] : allParetoFlatIds,
  }));
};


  const rawSummary = stats?.summary || {};
  const summary = useMemo(() => {
    if (!workingItems || !workingItems.length) {
      return { total_items: 0, total_with_submission: 0, by_latest_status: {}, by_stage: [], roles: {} };
    }
    if (!filtersActive && rawSummary && Object.keys(rawSummary).length) return rawSummary;
    return buildSummaryFromItems(workingItems);
  }, [workingItems, filtersActive, rawSummary]);

  const totalItems = safeNumber(summary.total_items);
  const totalWithSubmission = safeNumber(summary.total_with_submission);
  const byStatus = summary.by_latest_status || {};
  const statusKeys = Object.keys(byStatus);

  const completionRate = pct(byStatus.completed || 0, totalItems);
  const withSubmissionRate = pct(totalWithSubmission, totalItems);

  const roleStatsObj = summary.roles || {};
  const allRoleKeys = Object.keys(roleStatsObj);
  const visibleRoleKeys =
    viewMode === "manager" ? allRoleKeys : allRoleKeys.filter((k) => CORE_ROLES_FOR_HEAD.includes(k));

  const hasData = !!stats && !loading && !error;
  const numericProjectId = Number(id) || null;

  /* ---------------- charts data ---------------- */
  // const stageProgressChartData = useMemo(() => {
  //   if (!summary.by_stage) return [];
  //   return summary.by_stage
  //     .map((stg) => {
  //       const stgItems = safeNumber(stg.items);
  //       const statusData = stg.by_latest_status || {};
  //       const stageLabel = stageMap[stg.stage_id] || stg.stage_name || `Stage ${stg.stage_id}`;
  //       return {
  //         name: stageLabel,
  //         completed: safeNumber(statusData.completed),
  //         pending_checker: safeNumber(statusData.pending_checker),
  //         pending_for_inspector: safeNumber(statusData.pending_for_inspector),
  //         not_started: safeNumber(statusData.not_started),
  //         total: stgItems,
  //       };
  //     })
  //     .sort((a, b) => b.total - a.total);
  // }, [summary, stageMap]);

  const statusPieData = useMemo(
    () =>
      statusKeys
        .map((key) => ({
          name: titleCaseStatus(key),
          value: safeNumber(byStatus[key]),
          color: statusColor(key).chartColor,
        }))
        .filter((d) => d.value > 0),
    [statusKeys, byStatus]
  );
const flatLabel = (flatId) => {
  const meta = flatLookup?.[flatId];
  const base = meta?.number ? `Flat ${meta.number}` : `Flat #${flatId}`;
  return meta?.typeName ? `${base} • ${meta.typeName}` : base;
};

const flatProgressChartData = useMemo(() => {
  const items = Array.isArray(workingItems) ? workingItems : [];
  const map = new Map();

  items.forEach((it) => {
    const flatId = it?.location?.flat_id;
    if (!flatId) return;

    const st = String(it?.item_status || "").toLowerCase();

    const rec =
      map.get(flatId) ||
      {
        flatId: String(flatId),
        name: flatLabel(flatId),
        completed: 0,
        pending_checker: 0,
        pending_for_inspector: 0,
        not_started: 0,
        other: 0,
        total: 0,
      };

    rec.total += 1;

    if (st === "completed") rec.completed += 1;
    else if (st === "pending_checker" || st === "pending_for_checker") rec.pending_checker += 1;
    else if (st === "pending_for_inspector") rec.pending_for_inspector += 1;
    else if (st === "not_started" || st === "created") rec.not_started += 1;
    else rec.other += 1;

    map.set(flatId, rec);
  });

  const arr = Array.from(map.values());

  // sort: open issues first (more useful)
  arr.forEach((r) => {
    r.open = r.pending_checker + r.pending_for_inspector + r.not_started;
  });

  arr.sort((a, b) => b.open - a.open || b.total - a.total);

  // show top 12 flats (change if you want)
  return arr.slice(0, 12);
}, [workingItems, flatLookup]);
const BarValueLabel = ({ x, y, width, value, fill }) => {
  if (!value || value <= 0) return null;
  return (
    <text
      x={x + width / 2}
      y={y - 6}
      textAnchor="middle"
      fontSize={11}
      fontWeight={900}
      fill={fill || "#0f172a"}
      style={{ pointerEvents: "none" }}
    >
      {value}
    </text>
  );
};

  const teamPerformanceData = useMemo(() => {
    if (!hasData) return [];
    const userStats = {};
    (workingItems || []).forEach((item) => {
      const status = (item.item_status || "").toLowerCase();
      const rolesObj = item.roles || {};
      ["maker", "checker", "supervisor"].forEach((rk) => {
        const uid = rolesObj[rk]?.user_id;
        if (!uid) return;
        if (!userStats[uid]) {
          userStats[uid] = { userName: resolveUserName(uid), completed: 0, pending: 0, total: 0, efficiency: 0 };
        }
        userStats[uid].total += 1;
        if (status === "completed") userStats[uid].completed += 1;
        else userStats[uid].pending += 1;
      });
    });

    return Object.values(userStats)
      .map((u) => ({
        ...u,
        efficiency: u.total > 0 ? Math.round((u.completed / u.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [workingItems, hasData, userMap]);

  const workloadDistributionData = useMemo(() => {
    if (!visibleRoleKeys.length) return [];
    return visibleRoleKeys
      .map((roleKey) => {
        const rStats = roleStatsObj[roleKey] || {};
        const roleLabel = roleKey
          .split("_")
          .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
          .join(" ");
        return {
          role: roleLabel,
          items: safeNumber(rStats.items_touched),
          users: safeNumber(rStats.distinct_users),
          avgPerUser:
            safeNumber(rStats.distinct_users) > 0
              ? Math.round(safeNumber(rStats.items_touched) / safeNumber(rStats.distinct_users))
              : 0,
        };
      })
      .filter((d) => d.items > 0);
  }, [visibleRoleKeys, roleStatsObj]);

  const velocityChartData = useMemo(() => {
    if (!workingItems || !workingItems.length) return [];
    const days = 30;
    const data = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      let completed = 0;
      let started = 0;

      workingItems.forEach((item) => {
        const latest = item.latest_submission || {};
        const activityDate = latest.checked_at || latest.supervised_at || latest.maker_at;
        if (!activityDate) return;
        const actDate = new Date(activityDate);
        if (actDate.toDateString() === date.toDateString()) {
          if ((item.item_status || "").toLowerCase() === "completed") completed++;
          else started++;
        }
      });

      data.push({
        date: `${date.getDate()}/${date.getMonth() + 1}`,
        completed,
        started,
      });
    }
    return data;
  }, [workingItems]);

  const roleRadarData = useMemo(() => {
    if (!visibleRoleKeys.length) return [];
    const maxItems = Math.max(0, ...visibleRoleKeys.map((k) => safeNumber(roleStatsObj[k]?.items_touched)));
    return visibleRoleKeys
      .map((roleKey) => {
        const rStats = roleStatsObj[roleKey] || {};
        const roleLabel = roleKey.split("_")[0];
        const items = safeNumber(rStats.items_touched);
        return {
          role: roleLabel,
          coverage: maxItems > 0 ? Math.round((items / maxItems) * 100) : 0,
          users: safeNumber(rStats.distinct_users) * 10,
        };
      })
      .filter((d) => d.coverage > 0);
  }, [visibleRoleKeys, roleStatsObj]);

  const paretoCategoryData = useMemo(() => {
    if (!workingItems || !workingItems.length) return [];

    const pendingKeys = ["pending_checker", "pending_for_inspector", "not_started"];
    const selectedStatus = String(globalFilters.status || "").toLowerCase();

    const selectedStageId = globalFilters.stageId || null;
    const selectedBuildingId = globalFilters.buildingId || null;
    const selectedFloorIds = paretoFilters.floorIds || [];
    const selectedFlatIds = paretoFilters.focusFlatIds || [];
    const categoryMode = paretoFilters.categoryMode || "room";

    const rowsMap = {};
    workingItems.forEach((item) => {
  const status = (item.item_status || "").toLowerCase();

  // ✅ If dropdown status selected -> only that bucket
  if (selectedStatus) {
    if (!matchesStatusFilter(item, selectedStatus)) return;
  } else {
    // ✅ default: pending concentration
    const pendingKeys = ["pending_checker", "pending_for_inspector", "not_started"];
      if (!pendingKeys.includes(status)) return;
  }
      if (selectedStageId) {
        const sId = item.checklist?.stage_id;
        if (!sId || String(sId) !== String(selectedStageId)) return;
      }

      if (selectedBuildingId) {
        const bId = item.location?.building_id;
        if (!bId || String(bId) !== String(selectedBuildingId)) return;
      }

      if (selectedFloorIds.length) {
        const flatId = item.location?.flat_id;
        const meta = flatId ? flatLookup[flatId] : null;
        const lid = meta?.levelId ? String(meta.levelId) : null;
        if (!lid || !selectedFloorIds.includes(lid)) return;
      }

      if (selectedFlatIds.length) {
        const fId = item.location?.flat_id;
        if (!fId || !selectedFlatIds.includes(String(fId))) return;
      }

      const label = getParetoCategoryLabel(item, flatLookup, categoryMode);
      const key = label;

      if (!rowsMap[key]) rowsMap[key] = { categoryLabel: label, pending: 0 };
      rowsMap[key].pending += 1;
    });

    let rows = Object.values(rowsMap).filter((r) => r.pending > 0);
    if (!rows.length) return [];

    rows.sort((a, b) => b.pending - a.pending);

    const totalPending = rows.reduce((sum, r) => sum + r.pending, 0) || 1;
    let running = 0;

    return rows.map((r) => {
      running += r.pending;
      const cumulativePct = Math.round((running / totalPending) * 100);
      return {
        ...r,
        cumulativePct,
        isTop80: cumulativePct <= 80,
      };
    });
  }, [workingItems, globalFilters.stageId, globalFilters.buildingId, paretoFilters, flatLookup]);

  const bottleneckData = useMemo(() => {
    if (!summary.by_stage) return [];
    return summary.by_stage
      .map((stg) => {
        const stgItems = safeNumber(stg.items);
        const statusData = stg.by_latest_status || {};
        const stageLabel = stageMap[stg.stage_id] || `Stage #${stg.stage_id}`;

        const pending =
          safeNumber(statusData.pending_checker) +
          safeNumber(statusData.pending_for_inspector) +
          safeNumber(statusData.not_started);

        const score = stgItems > 0 ? (pending / stgItems) * 100 : 0;
        return {
          stage: stageLabel,
          pendingItems: pending,
          totalItems: stgItems,
          bottleneckScore: Math.round(score),
          isBottleneck: score > 50,
        };
      })
      .filter((d) => d.isBottleneck)
      .sort((a, b) => b.bottleneckScore - a.bottleneckScore);
  }, [summary, stageMap]);

  const recentActivity = useMemo(() => {
    if (!workingItems || !workingItems.length) return null;
    const now = Date.now();
    const days = 7;
    const cutoff = now - days * 24 * 60 * 60 * 1000;

    let total = 0;
    const counts = { completed: 0, pending_checker: 0, pending_for_inspector: 0, not_started: 0, other: 0 };

    workingItems.forEach((item) => {
      const latest = item.latest_submission || {};
      const lastTimeStr = latest.checked_at || latest.supervised_at || latest.maker_at;
      if (!lastTimeStr) return;
      const t = new Date(lastTimeStr).getTime();
      if (!t || Number.isNaN(t) || t < cutoff) return;

      total += 1;
      const st = (item.item_status || "").toLowerCase();
      if (Object.prototype.hasOwnProperty.call(counts, st)) counts[st] += 1;
      else counts.other += 1;
    });

    if (!total) return null;
    return { days, total, counts };
  }, [workingItems]);

  const locationHotspots = useMemo(() => {
    if (!workingItems || !workingItems.length) return [];
    const flatMap = {};

    workingItems.forEach((item) => {
      const flatId = item.location?.flat_id;
      if (!flatId) return;
      const status = (item.item_status || "").toLowerCase();

      const rec =
        flatMap[flatId] ||
        (flatMap[flatId] = {
          flatId,
          meta: flatLookup[flatId] || null,
          total: 0,
          completed: 0,
          pending_checker: 0,
          pending_for_inspector: 0,
          not_started: 0,
        });

      rec.total += 1;
      if (Object.prototype.hasOwnProperty.call(rec, status)) rec[status] += 1;
    });

    let arr = Object.values(flatMap);
    arr.forEach((r) => {
      r.openIssues = safeNumber(r.pending_checker) + safeNumber(r.pending_for_inspector) + safeNumber(r.not_started);
    });
    arr.sort((a, b) => b.openIssues - a.openIssues);
    return arr.slice(0, 6);
  }, [workingItems, flatLookup]);

  /* ---------------- roles/access config vs activity ---------------- */
  const projectUsersAccesses = useMemo(() => {
    if (!numericProjectId || !Array.isArray(users)) return [];
    const result = [];
    users.forEach((u) => {
      const accesses = Array.isArray(u.accesses) ? u.accesses : [];
      const userName =
        (u.first_name && u.first_name.trim()) ||
        (u.username && u.username.trim()) ||
        u.email ||
        `User #${u.id}`;

      accesses.forEach((acc) => {
        if (acc.project_id && acc.project_id !== numericProjectId) return;
        const rolesArr = Array.isArray(acc.roles) ? acc.roles : [];
        const roleNames = rolesArr.map((r) => (typeof r === "string" ? r : r?.role)).filter(Boolean);
        result.push({
          userId: u.id,
          userName,
          accessId: acc.id,
          stageId: acc.stage_id,
          phaseId: acc.phase_id,
          roleNames,
        });
      });
    });
    return result;
  }, [users, numericProjectId]);

  const configAndActivity = useMemo(() => {
    if (!numericProjectId) return { coverageList: [], inactiveAssignments: [], unconfiguredActivity: [] };

    const configAssignments = {};
    const coverageByStage = {};

    (projectUsersAccesses || []).forEach((acc) => {
      const stageId = acc.stageId;
      if (!stageId) return;

      const stageRec =
        coverageByStage[stageId] || (coverageByStage[stageId] = { stageId, roles: {} });

      acc.roleNames.forEach((roleNameRaw) => {
        const roleName = String(roleNameRaw || "").toUpperCase();
        if (!roleName) return;
        const key = `${stageId}|${roleName}|${acc.userId}`;
        if (!configAssignments[key]) {
          configAssignments[key] = { stageId, roleName, userId: acc.userId, userName: acc.userName };
        }
        const set = stageRec.roles[roleName] || (stageRec.roles[roleName] = new Set());
        set.add(acc.userId);
      });
    });

    const actualAssignments = {};
    (workingItems || []).forEach((item) => {
      const stageId = item.checklist?.stage_id;
      if (!stageId) return;
      const rolesObj = item.roles || {};
      ["maker", "checker", "supervisor", "initializer"].forEach((rk) => {
        const uid = rolesObj[rk]?.user_id;
        if (!uid) return;
        const roleName = rk.toUpperCase();
        const key = `${stageId}|${roleName}|${uid}`;
        const rec = actualAssignments[key] || (actualAssignments[key] = { stageId, roleName, userId: uid, count: 0 });
        rec.count += 1;
      });
    });

    const inactiveAssignments = [];
    Object.entries(configAssignments).forEach(([key, cfg]) => {
      const act = actualAssignments[key];
      if (!act || !act.count) inactiveAssignments.push({ ...cfg, count: 0 });
    });

    const unconfiguredActivity = [];
    Object.entries(actualAssignments).forEach(([key, act]) => {
      if (!configAssignments[key]) {
        unconfiguredActivity.push({ ...act, userName: resolveUserName(act.userId) });
      }
    });

    const coverageList = Object.values(coverageByStage).map((entry) => {
      const stageLabel = stageMap[entry.stageId] || `Stage #${entry.stageId}`;
      const roles = Object.entries(entry.roles).map(([roleName, set]) => ({ roleName, userCount: set.size }));
      roles.sort((a, b) => b.userCount - a.userCount);
      return { stageId: entry.stageId, stageLabel, roles };
    });

    inactiveAssignments.sort((a, b) => a.userName.localeCompare(b.userName));
    unconfiguredActivity.sort((a, b) => b.count - a.count);

    return {
      coverageList,
      inactiveAssignments: inactiveAssignments.slice(0, 10),
      unconfiguredActivity: unconfiguredActivity.slice(0, 10),
    };
  }, [projectUsersAccesses, workingItems, stageMap, userMap, numericProjectId]);

  const configByUser = useMemo(() => {
    const map = {};
    (projectUsersAccesses || []).forEach((acc) => {
      const rec = map[acc.userId] || (map[acc.userId] = { userId: acc.userId, userName: acc.userName, accesses: [] });
      rec.accesses.push(acc);
    });
    return Object.values(map)
      .filter((r) => r.accesses.length)
      .sort((a, b) => a.userName.localeCompare(b.userName));
  }, [projectUsersAccesses]);

  /* ---------------- Question hotspots slice ---------------- */
  const questionStatusData = useMemo(() => {
    const items = Array.isArray(workingItems) ? workingItems : [];
    if (!items.length) return [];

    const { stageId, categoryId, buildingId, floorId, roomCategory, statusBucket } = questionFilters;

    const filtered = items.filter((item) => {
      const loc = item.location || {};
      const cl = item.checklist || {};

      if (stageId) {
        const sId = cl.stage_id;
        if (!sId || String(sId) !== String(stageId)) return false;
      }

      if (categoryId) {
        const catId = cl.category_id || cl.category;
        if (!catId || String(catId) !== String(categoryId)) return false;
      }

      if (buildingId) {
        const bId = loc.building_id;
        if (!bId || String(bId) !== String(buildingId)) return false;
      }

      if (floorId) {
        const flatId = loc.flat_id;
        const meta = flatId ? flatLookup[flatId] : null;
        if (!meta || String(meta.levelId) !== String(floorId)) return false;
      }

      if (roomCategory) {
        const rc = loc.room_category || loc.room_type || loc.room || null;
        if (!rc || String(rc) !== String(roomCategory)) return false;
      }

      const s = (item.item_status || "").toLowerCase();
      if (statusBucket === "open") {
        if (!["pending_checker", "pending_for_inspector", "not_started"].includes(s)) return false;
      } else if (statusBucket === "closed") {
        if (s !== "completed") return false;
      }

      return true;
    });

    if (!filtered.length) return [];

    const byQuestion = {};
    filtered.forEach((item) => {
      const key = item.item_title || `Item #${item.item_id}`;
      const catLabel = getParetoCategoryLabel(item, flatLookup, "checklist");
      if (!byQuestion[key]) {
        byQuestion[key] = {
          question: key,
          categoryLabel: null,
          total: 0,
          completed: 0,
          pending_checker: 0,
          pending_for_inspector: 0,
          not_started: 0,
          other: 0,
        };
      }
      const rec = byQuestion[key];
      if (!rec.categoryLabel && catLabel) rec.categoryLabel = catLabel;

      const st = (item.item_status || "").toLowerCase();
      rec.total += 1;
      if (Object.prototype.hasOwnProperty.call(rec, st)) rec[st] += 1;
      else rec.other += 1;
    });

    let list = Object.values(byQuestion);
    list.forEach((q) => {
      q.openCount = safeNumber(q.pending_checker) + safeNumber(q.pending_for_inspector) + safeNumber(q.not_started);
      q.openPct = q.total > 0 ? Math.round((q.openCount / q.total) * 100) : 0;
      q.completedPct = q.total > 0 ? Math.round((q.completed / q.total) * 100) : 0;
    });
    list.sort((a, b) => b.openCount - a.openCount || b.total - a.total);
    return list.slice(0, 15);
  }, [workingItems, questionFilters, flatLookup]);

  const handleOpenFlatReport = (flatId, flatMeta = null) => {
    if (!flatId) return;
    navigate(`/projects/${id}/flat-report/${flatId}`, {
      state: {
        project: projectFromState || null,
        flatId,
        flatMeta,
        filters: { stageId: globalFilters.stageId || "", buildingId: globalFilters.buildingId || "" },
      },
    });
  };



  // ---- bar value labels (show values on each stacked segment) ----
const getReadableTextColor = (hex) => {
  try {
    const h = String(hex || "").replace("#", "");
    if (h.length !== 6) return "#fff";
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.62 ? "#0f172a" : "#ffffff";
  } catch {
    return "#ffffff";
  }
};

const StackValueLabel = ({ x, y, width, height, value, fill }) => {
  if (!value || value <= 0) return null;

  // if segment is too small, don't print (avoids clutter)
  if (width < 18 || height < 14) return null;

  return (
    <text
      x={x + width / 2}
      y={y + height / 2 + 4}
      textAnchor="middle"
      fontSize={11}
      fontWeight={900}
      fill={getReadableTextColor(fill)}
      style={{ pointerEvents: "none" }}
    >
      {value}
    </text>
  );
};




const TopValueLabel = ({ x, y, width, value, fill }) => {
  if (!value || value <= 0) return null;
  return (
    <text
      x={x + width / 2}
      y={y - 6}
      textAnchor="middle"
      fontSize={11}
      fontWeight={900}
      fill={fill || "#0f172a"}
      style={{ pointerEvents: "none" }}
    >
      {value}
    </text>
  );
};


  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null;
    return (
      <div
        className="rounded-xl p-3 shadow-xl border"
        style={{
          background: theme === "dark" ? "rgba(15,23,42,0.95)" : "rgba(255,255,255,0.98)",
          borderColor: theme === "dark" ? "#334155" : "#e2e8f0",
        }}
      >
        <div className="text-xs font-bold mb-2" style={{ color: textColor }}>
          {label}
        </div>
        {payload.map((entry, idx) => (
          <div key={idx} className="text-xs font-semibold" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </div>
        ))}
      </div>
    );
  };
  const paretoMinWidth = useMemo(() => {
  const n = paretoCategoryData?.length || 0;
  return Math.max(900, n * 90); // 90px per category (adjust if needed)
}, [paretoCategoryData]);


  /* ---------------- render ---------------- */
  return (
    <div
      className="min-h-screen"
      style={{
        background: theme === "dark" ? "#0b1220" : "#f8fafc",
        color: textColor,
      }}
    >
      <div className="mx-auto max-w-[1600px] px-4 md:px-8 py-8 space-y-6">
        {/* Header */}
        {/* <Card theme={theme} className="p-6 md:p-8">
         
        </Card> */}

        {loading && (
          <div className="py-16 text-center font-bold" style={{ color: subText }}>
            Loading dashboard...
          </div>
        )}

        {!loading && error && (
          <Card theme={theme} className="p-6 border-red-300">
            <div className="font-black text-lg">Unable to load</div>
            <div className="text-sm font-semibold mt-1" style={{ color: subText }}>
              {error}
            </div>
          </Card>
        )}
        

        {hasData && (
          <>
            {/* Quick stats row */}
            {/* <div className="grid gap-4 md:grid-cols-4">
              <Card theme={theme} className="p-5">
                <div className="text-[11px] font-bold uppercase" style={{ color: subText }}>
                  Total Items
                </div>
                <div className="text-3xl font-black mt-1">{fmtInt(totalItems)}</div>
                <div className="text-xs font-semibold mt-1" style={{ color: subText }}>
                  After filters
                </div>
              </Card>

              <Card theme={theme} className="p-5">
                <div className="text-[11px] font-bold uppercase" style={{ color: subText }}>
                  With Submission
                </div>
                <div className="text-3xl font-black mt-1">{fmtInt(totalWithSubmission)}</div>
                <div className="text-xs font-semibold mt-1" style={{ color: subText }}>
                  {withSubmissionRate}% coverage
                </div>
              </Card>

              <Card theme={theme} className="p-5">
                <div className="text-[11px] font-bold uppercase" style={{ color: subText }}>
                  Pending Checker
                </div>
                <div className="text-3xl font-black mt-1">{fmtInt(byStatus.pending_checker || 0)}</div>
              </Card>

              <Card theme={theme} className="p-5">
                <div className="text-[11px] font-bold uppercase" style={{ color: subText }}>
                  Pending Inspector
                </div>
                <div className="text-3xl font-black mt-1">{fmtInt(byStatus.pending_for_inspector || 0)}</div>
              </Card>
            </div> */}

            {/* Global Filters */}
            <Card theme={theme} className="p-5">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="text-sm font-black">Global Filters</div>
                  <div className="text-xs font-semibold mt-1" style={{ color: subText }}>
                    These filters affect all charts/tables below.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setGlobalFilters({
  buildingId: "",
  floorId: "",
  flatId: "",

  stageId: "",
  status: "",
  role: "",

  flatCategory: "",
  roomCategory: "",
  timeWindow: "all",

                    })
                  }
                  className="px-3 py-2 rounded-xl text-xs font-black border"
                  style={{
                    borderColor: theme === "dark" ? "#334155" : "#e2e8f0",
                    color: subText,
                    background: theme === "dark" ? "rgba(2,6,23,0.4)" : "rgba(248,250,252,0.95)",
                  }}
                >
                  Clear
                </button>
              </div>

<div className="grid gap-3 mt-4 md:grid-cols-7">
                <div>
                  <Label theme={theme}>Status</Label>
                  <Select
                    theme={theme}
                    value={globalFilters.status}
                    onChange={(e) => setGlobalFilters((p) => ({ ...p, status: e.target.value }))}
                  >
                    <option value="">All</option>
                    <option value="started">Started</option>

                    {distinctStatuses.map((s) => (
                      <option key={s} value={s}>
                        {titleCaseStatus(s)}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label theme={theme}>Role touch</Label>
                  <Select
                    theme={theme}
                    value={globalFilters.role}
                    onChange={(e) => setGlobalFilters((p) => ({ ...p, role: e.target.value }))}
                  >
                    <option value="">All</option>
                    <option value="maker">Maker</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="checker">Checker</option>
                  </Select>
                </div>

                <div>
                  <Label theme={theme}>Stage</Label>
                  <Select
                    theme={theme}
                    value={globalFilters.stageId}
                    onChange={(e) => setGlobalFilters((p) => ({ ...p, stageId: e.target.value }))}
                  >
                    <option value="">All</option>
                    {Object.entries(stageMap).map(([sid, label]) => (
                      <option key={sid} value={sid}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label theme={theme}>Building</Label>
                  <Select
  theme={theme}
  value={globalFilters.buildingId}
  onChange={(e) =>
    setGlobalFilters((p) => ({
      ...p,
      buildingId: e.target.value,
      floorId: "", // ✅ reset floor when building changes
      flatId: "",  // ✅ reset flat when building changes
    }))
  }
>
  <option value="">All</option>
  {buildingOptions.map((b) => (
    <option key={b.id} value={b.id}>
      {b.label}
    </option>
  ))}
</Select>

                </div>
                <div>
  <Label theme={theme}>Floor</Label>
  <Select
    theme={theme}
    value={globalFilters.floorId}
    onChange={(e) =>
      setGlobalFilters((p) => ({
        ...p,
        floorId: e.target.value,
        flatId: "", // ✅ reset flat when floor changes
      }))
    }
  >
    <option value="">All</option>
    {floorOptions.map((f) => (
      <option key={f.id} value={f.id}>
        {f.label}
      </option>
    ))}
  </Select>
</div>

                <div>
  <Label theme={theme}>Flat</Label>
  <Select
    theme={theme}
    value={globalFilters.flatId}
    onChange={(e) => setGlobalFilters((p) => ({ ...p, flatId: e.target.value }))}
  >
    <option value="">All</option>
    {flatOptions.map((f) => (
      <option key={f.id} value={f.id}>
        {f.label}
      </option>
    ))}
  </Select>
</div>


                <div>
                  <Label theme={theme}>Flat Category</Label>
                  <Select
                    theme={theme}
                    value={globalFilters.flatCategory}
                    onChange={(e) => setGlobalFilters((p) => ({ ...p, flatCategory: e.target.value }))}
                  >
                    <option value="">All</option>
                    {flatCategoryOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label theme={theme}>Room Category</Label>
                  <Select
                    theme={theme}
                    value={globalFilters.roomCategory}
                    onChange={(e) => setGlobalFilters((p) => ({ ...p, roomCategory: e.target.value }))}
                  >
                    <option value="">All</option>
                    {roomCategoryOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="mt-3 max-w-[240px]">
                <Label theme={theme}>Time Window</Label>
                <Select
                  theme={theme}
                  value={globalFilters.timeWindow}
                  onChange={(e) => setGlobalFilters((p) => ({ ...p, timeWindow: e.target.value }))}
                >
                  <option value="all">All time</option>
                  <option value="30d">Last 30 days</option>
                  <option value="7d">Last 7 days</option>
                </Select>
              </div>
            </Card>

            {/* Charts Grid */}
            <div className="grid gap-4 lg:grid-cols-2">
            {flatProgressChartData.length > 0 && (
  <Card theme={theme} className="p-5">
    <div className="text-base font-black mb-3">Flat-wise Progress</div>

    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={flatProgressChartData} barSize={18}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#334155" : "#e2e8f0"} />

        <XAxis
          dataKey="name"
          stroke={subText}
          angle={-25}
          textAnchor="end"
          height={80}
          style={{ fontSize: "11px" }}
        />
        <YAxis stroke={subText} />

        <Tooltip content={<CustomTooltip />} />
        <Legend />

        <Bar dataKey="completed" fill={CHART_COLORS.success} name="Completed" label={<BarValueLabel />} />
        <Bar dataKey="pending_checker" fill={CHART_COLORS.secondary} name="Pending Checker" label={<BarValueLabel />} />
<Bar
  dataKey="pending_for_inspector"
  fill={CHART_COLORS.warning}
  name="Pending For Checker"
  label={<BarValueLabel />}
/>
        <Bar dataKey="not_started" fill={CHART_COLORS.danger} name="Not Started" label={<BarValueLabel />} />
      </BarChart>
    </ResponsiveContainer>
  </Card>
)}



              
              {statusPieData.length > 0 && (
                <Card theme={theme} className="p-5">
                  <div className="text-base font-black mb-3">Status Distribution</div>
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={statusPieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        dataKey="value"
                      >
                        {statusPieData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {teamPerformanceData.length > 0 && (
                <Card theme={theme} className="p-5">
                  <div className="text-base font-black mb-3">Top Team Performance</div>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={teamPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#334155" : "#e2e8f0"} />
                      <XAxis dataKey="userName" stroke={subText} angle={-40} textAnchor="end" height={90} style={{ fontSize: "10px" }} />
                      <YAxis stroke={subText} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="completed" fill={CHART_COLORS.success} name="Completed" />
                      <Bar dataKey="pending" fill={CHART_COLORS.warning} name="Pending" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {workloadDistributionData.length > 0 && (
                <Card theme={theme} className="p-5">
                  <div className="text-base font-black mb-3">Role-wise Workload</div>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={workloadDistributionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#334155" : "#e2e8f0"} />
                      <XAxis dataKey="role" stroke={subText} angle={-35} textAnchor="end" height={80} style={{ fontSize: "11px" }} />
                      <YAxis stroke={subText} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="items" fill={CHART_COLORS.primary} name="Total Items" />
                      <Bar dataKey="avgPerUser" fill={CHART_COLORS.secondary} name="Avg per User" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {velocityChartData.length > 0 && (
                <Card theme={theme} className="p-5">
                  <div className="text-base font-black mb-3">30-Day Activity Velocity</div>
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={velocityChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#334155" : "#e2e8f0"} />
                      <XAxis dataKey="date" stroke={subText} style={{ fontSize: "10px" }} />
                      <YAxis stroke={subText} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area type="monotone" dataKey="completed" stroke={CHART_COLORS.success} fill={CHART_COLORS.success} fillOpacity={0.25} name="Completed" />
                      <Area type="monotone" dataKey="started" stroke={CHART_COLORS.secondary} fill={CHART_COLORS.secondary} fillOpacity={0.20} name="Touched" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {roleRadarData.length > 0 && (
                <Card theme={theme} className="p-5">
                  <div className="text-base font-black mb-3">Role Coverage Analysis</div>
                  <ResponsiveContainer width="100%" height={320}>
                    <RadarChart data={roleRadarData}>
                      <PolarGrid stroke={theme === "dark" ? "#334155" : "#e2e8f0"} />
                      <PolarAngleAxis dataKey="role" stroke={subText} style={{ fontSize: "12px" }} />
                      <PolarRadiusAxis stroke={subText} />
                      <Radar
                        name="Coverage"
                        dataKey="coverage"
                        stroke={CHART_COLORS.primary}
                        fill={CHART_COLORS.primary}
                        fillOpacity={0.25}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </Card>
              )}
            </div>
            {/* ✅ Full-width Pareto Block */}
{paretoCategoryData.length > 0 && (
  <Card theme={theme} className="p-5">
    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
      <div>
        <div className="text-base font-black">Pareto Deep (Pending Concentration)</div>
        <div className="text-xs font-semibold mt-1" style={{ color: subText }}>
          Category dimension + optional floor / flat focus.
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-3 w-full lg:w-auto">
        <div className="min-w-[190px]">
          <Label theme={theme}>Category dimension</Label>
          <Select
            theme={theme}
            value={paretoFilters.categoryMode}
            onChange={(e) => setParetoFilters((p) => ({ ...p, categoryMode: e.target.value }))}
          >
            {PARETO_CATEGORY_MODES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </Select>
        </div>

        {globalFilters.buildingId && floorOptions.length > 0 && (
          <div className="min-w-[220px]">
            <Label theme={theme}>Floors (multi-select)</Label>
            <Select
              theme={theme}
              multiple
              value={paretoFilters.floorIds}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
                setParetoFilters((p) => ({ ...p, floorIds: selected }));
              }}
            >
              {floorOptions.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </Select>
          </div>
        )}

        {flatOptions.length > 0 && (
         <div className="min-w-[220px]">
  <div className="flex items-center justify-between mb-1">
    <Label theme={theme}>Focus flats (multi-select)</Label>

    <button
      type="button"
      onClick={toggleParetoSelectAllFlats}
      className="px-2 py-1 rounded-lg text-[11px] font-black border"
      style={{
        borderColor: theme === "dark" ? "#334155" : "#e2e8f0",
        color: theme === "dark" ? "#e2e8f0" : "#0f172a",
        background: theme === "dark" ? "rgba(2,6,23,0.45)" : "rgba(248,250,252,0.95)",
      }}
    >
      {paretoAllFlatsSelected ? "Unselect all" : "Select all"}
    </button>
  </div>

  <Select
    theme={theme}
    multiple
    value={paretoFilters.focusFlatIds}
    onChange={(e) => {
      const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
      setParetoFilters((p) => ({ ...p, focusFlatIds: selected }));
    }}
  >
    {flatOptions.map((f) => (
      <option key={f.id} value={f.id}>
        {f.label}
      </option>
    ))}
  </Select>
</div>

        )}
      </div>
    </div>

    {/* ✅ Scrollable canvas so X labels never crush */}
    <div className="overflow-x-auto">
      <div style={{ minWidth: paretoMinWidth }}>
        <ResponsiveContainer width="100%" height={460}>
          <ComposedChart
            data={paretoCategoryData}
            margin={{ top: 20, right: 30, left: 10, bottom: 90 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme === "dark" ? "#334155" : "#e2e8f0"}
            />

            <XAxis
              dataKey="categoryLabel"
              stroke={subText}
              angle={-30}
              textAnchor="end"
              height={95}
              interval={0}
              style={{ fontSize: "11px" }}
              tickFormatter={(v) => (String(v).length > 28 ? `${String(v).slice(0, 28)}…` : v)}
            />

            <YAxis yAxisId="left" stroke={subText} width={55} />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke={subText}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              width={50}
            />

            <Tooltip content={<CustomTooltip />} />
            <Legend />

            <Bar
              yAxisId="left"
              dataKey="pending"
              name="Pending Items"
              label={<TopValueLabel />}
            >
              {paretoCategoryData.map((entry, idx) => (
                <Cell key={idx} fill={entry.isTop80 ? CHART_COLORS.danger : CHART_COLORS.muted} />
              ))}
            </Bar>

            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cumulativePct"
              name="Cumulative %"
              stroke={CHART_COLORS.secondary}
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  </Card>
)}


            {/* Bottlenecks */}
            {bottleneckData.length > 0 && (
              <Card theme={theme} className="p-5 border-red-200">
                <div className="text-base font-black">Bottleneck Stages</div>
                <div className="text-xs font-semibold mt-1" style={{ color: subText }}>
                  Stages with &gt; 50% pending items.
                </div>

                <div className="grid gap-3 md:grid-cols-3 mt-4">
                  {bottleneckData.map((s, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border p-4"
                      style={{
                        borderColor: theme === "dark" ? "#334155" : "#e2e8f0",
                        background: theme === "dark" ? "rgba(2,6,23,0.45)" : "rgba(248,250,252,0.95)",
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="font-black">{s.stage}</div>
                        <div className="text-xl font-black" style={{ color: CHART_COLORS.danger }}>
                          {s.bottleneckScore}%
                        </div>
                      </div>
                      <div className="text-xs font-semibold mt-2" style={{ color: subText }}>
                        Pending {fmtInt(s.pendingItems)} / {fmtInt(s.totalItems)}
                      </div>
                      <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ background: theme === "dark" ? "#0f172a" : "#e2e8f0" }}>
                        <div className="h-full" style={{ width: `${s.bottleneckScore}%`, background: CHART_COLORS.danger }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Recent activity */}
            {/* {recentActivity && (
              <div className="grid gap-4 md:grid-cols-4">
                {[
                  { label: "Total Activity (7d)", value: recentActivity.total },
                  { label: "Completed", value: recentActivity.counts.completed || 0 },
                  { label: "Pending Checker", value: recentActivity.counts.pending_checker || 0 },
{ label: "Pending For Checker", value: recentActivity.counts.pending_for_inspector || 0 },
                ].map((x, idx) => (
                  <Card theme={theme} className="p-5" key={idx}>
                    <div className="text-[11px] font-bold uppercase" style={{ color: subText }}>
                      {x.label}
                    </div>
                    <div className="text-3xl font-black mt-1">{fmtInt(x.value)}</div>
                  </Card>
                ))}
              </div>
              
            )} */}
            

            {/* Flat hotspots */}
            {locationHotspots.length > 0 && (
              <Card theme={theme} className="p-5">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <div className="text-base font-black">Flat Hotspots</div>
                    <div className="text-xs font-semibold mt-1" style={{ color: subText }}>
                      Top flats with open issues (click to open report).
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3 mt-4">
                  {locationHotspots.map((f) => {
                    const meta = f.meta || {};
                    const label = meta.number || meta.typeName
                      ? `Flat ${meta.number || f.flatId}${meta.typeName ? ` • ${meta.typeName}` : ""}`
                      : `Flat #${f.flatId}`;

                    const completionPct =
                      f.total > 0 ? Math.round((safeNumber(f.completed) / safeNumber(f.total)) * 100) : 0;

                    return (
                      <button
                        key={f.flatId}
                        type="button"
                        onClick={() => handleOpenFlatReport(f.flatId, f.meta || null)}
                        className="text-left rounded-xl border p-4 hover:shadow-md transition-all"
                        style={{
                          borderColor: theme === "dark" ? "#334155" : "#e2e8f0",
                          background: theme === "dark" ? "rgba(2,6,23,0.45)" : "rgba(248,250,252,0.95)",
                        }}
                      >
                        <div className="font-black">{label}</div>
                        {meta.levelName && (
                          <div className="text-xs font-semibold mt-1" style={{ color: subText }}>
                            {meta.levelName}
                          </div>
                        )}
                        <div className="text-xs font-semibold mt-2" style={{ color: subText }}>
                          Total {fmtInt(f.total)} • Open {fmtInt(f.openIssues)}
                        </div>

                        <div className="mt-3">
                          <div className="flex justify-between text-xs font-semibold" style={{ color: subText }}>
                            <span>Completion</span>
                            <span style={{ color: textColor }}>{completionPct}%</span>
                          </div>
                          <div className="mt-1 h-2 rounded-full overflow-hidden" style={{ background: theme === "dark" ? "#0f172a" : "#e2e8f0" }}>
                            <div className="h-full" style={{ width: `${completionPct}%`, background: CHART_COLORS.success }} />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Question hotspots */}
            <Card theme={theme} className="p-5">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="text-base font-black">Question Hotspots (Slice-wise)</div>
                  <div className="text-xs font-semibold mt-1" style={{ color: subText }}>
                    Stage + Checklist + Building + Floor + Room + Status Bucket
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setQuestionFilters({
                      stageId: "",
                      categoryId: "",
                      buildingId: "",
                      floorId: "",
                      roomCategory: "",
                      statusBucket: "open",
                    })
                  }
                  className="px-3 py-2 rounded-xl text-xs font-black border"
                  style={{
                    borderColor: theme === "dark" ? "#334155" : "#e2e8f0",
                    color: subText,
                    background: theme === "dark" ? "rgba(2,6,23,0.4)" : "rgba(248,250,252,0.95)",
                  }}
                >
                  Clear filters
                </button>
              </div>

              <div className="grid gap-3 mt-4 md:grid-cols-6">
                <div>
                  <Label theme={theme}>Stage</Label>
                  <Select
                    theme={theme}
                    value={questionFilters.stageId}
                    onChange={(e) => setQuestionFilters((p) => ({ ...p, stageId: e.target.value }))}
                  >
                    <option value="">All</option>
                    {Object.entries(stageMap).map(([sid, label]) => (
                      <option key={sid} value={sid}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label theme={theme}>Checklist title</Label>
                  <Select
                    theme={theme}
                    value={questionFilters.categoryId}
                    onChange={(e) => setQuestionFilters((p) => ({ ...p, categoryId: e.target.value }))}
                  >
                    <option value="">All</option>
                    {checklistCategoryOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label theme={theme}>Building</Label>
                  <Select
                    theme={theme}
                    value={questionFilters.buildingId}
                    onChange={(e) =>
                      setQuestionFilters((p) => ({
                        ...p,
                        buildingId: e.target.value,
                        floorId: "",
                      }))
                    }
                  >
                    <option value="">All</option>
                    {buildingOptions.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label theme={theme}>Floor</Label>
                  <Select
                    theme={theme}
                    value={questionFilters.floorId}
                    onChange={(e) => setQuestionFilters((p) => ({ ...p, floorId: e.target.value }))}
                  >
                    <option value="">All</option>
                    {questionFloorOptions.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label theme={theme}>Room</Label>
                  <Select
                    theme={theme}
                    value={questionFilters.roomCategory}
                    onChange={(e) => setQuestionFilters((p) => ({ ...p, roomCategory: e.target.value }))}
                  >
                    <option value="">All</option>
                    {roomCategoryOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label theme={theme}>Status bucket</Label>
                  <Select
                    theme={theme}
                    value={questionFilters.statusBucket}
                    onChange={(e) => setQuestionFilters((p) => ({ ...p, statusBucket: e.target.value }))}
                  >
                    <option value="open">Open only</option>
                    <option value="closed">Completed only</option>
                    <option value="all">All statuses</option>
                  </Select>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {questionStatusData.length === 0 ? (
                  <div className="text-sm font-semibold" style={{ color: subText }}>
                    No questions match the current filters.
                  </div>
                ) : (
                  questionStatusData.map((q, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border p-4"
                      style={{
                        borderColor: theme === "dark" ? "#334155" : "#e2e8f0",
                        background: theme === "dark" ? "rgba(2,6,23,0.45)" : "rgba(248,250,252,0.95)",
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="font-black">{q.question}</div>
                          {q.categoryLabel && (
                            <div className="text-xs font-semibold mt-1" style={{ color: subText }}>
                              Category: {q.categoryLabel}
                            </div>
                          )}
                        </div>
                        <div className="text-right text-xs font-black">
                          <div>Total: {fmtInt(q.total)}</div>
                          <div style={{ color: CHART_COLORS.danger }}>
                            Open: {fmtInt(q.openCount)} ({q.openPct}%)
                          </div>
                          <div style={{ color: CHART_COLORS.success }}>
                            Done: {fmtInt(q.completed)} ({q.completedPct}%)
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: theme === "dark" ? "#0f172a" : "#e2e8f0" }}>
                        <div className="h-full" style={{ width: `${q.openPct}%`, background: CHART_COLORS.danger }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Roles & Access Overview */}
            {/* {(configAndActivity.coverageList?.length ||
              configAndActivity.inactiveAssignments?.length ||
              configAndActivity.unconfiguredActivity?.length ||
              configByUser.length) && (
              <div className="grid gap-4 lg:grid-cols-2">
                {configAndActivity.coverageList?.length > 0 && (
                  <Card theme={theme} className="p-5">
                    <div className="text-base font-black mb-3">Stage & Role Coverage (Config)</div>
                    <div className="space-y-3 max-h-[360px] overflow-auto pr-1">
                      {configAndActivity.coverageList.map((entry) => (
                        <div
                          key={entry.stageId}
                          className="rounded-xl border p-4"
                          style={{
                            borderColor: theme === "dark" ? "#334155" : "#e2e8f0",
                            background: theme === "dark" ? "rgba(2,6,23,0.45)" : "rgba(248,250,252,0.95)",
                          }}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="font-black">{entry.stageLabel}</div>
                            <div className="text-[11px] font-bold" style={{ color: subText }}>
                              {entry.roles.reduce((s, r) => s + r.userCount, 0)} users mapped
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {entry.roles.map((r) => (
                              <span
                                key={r.roleName}
                                className="px-3 py-1 rounded-full text-xs font-bold border"
                                style={{
                                  borderColor: theme === "dark" ? "#334155" : "#e2e8f0",
                                  color: textColor,
                                }}
                              >
                                {r.roleName} • {r.userCount}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {configByUser.length > 0 && (
                  <Card theme={theme} className="p-5">
                    <div className="text-base font-black mb-3">Per-user Configuration</div>
                    <div className="space-y-3 max-h-[360px] overflow-auto pr-1">
                      {configByUser.map((u) => (
                        <div
                          key={u.userId}
                          className="rounded-xl border p-4"
                          style={{
                            borderColor: theme === "dark" ? "#334155" : "#e2e8f0",
                            background: theme === "dark" ? "rgba(2,6,23,0.45)" : "rgba(248,250,252,0.95)",
                          }}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="font-black">{u.userName}</div>
                            <div className="text-[11px] font-bold" style={{ color: subText }}>
                              {u.accesses.length} access
                            </div>
                          </div>
                          <div className="mt-2 text-xs font-semibold space-y-1" style={{ color: subText }}>
                            {u.accesses.slice(0, 4).map((acc, idx) => (
                              <div key={idx}>
                                <span className="font-bold">{(acc.roleNames || []).join(", ") || "Role"}</span>{" "}
                                on{" "}
                                <span>
                                  {stageMap[acc.stageId] || (acc.stageId ? `Stage #${acc.stageId}` : "-")}
                                </span>
                              </div>
                            ))}
                            {u.accesses.length > 4 && <div className="opacity-70">+{u.accesses.length - 4} more…</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )} */}

            {/* Detailed Item View */}
            <Card theme={theme} className="overflow-hidden">
              <div className="p-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <div className="text-base font-black">Detailed Item View</div>
                  <div className="text-xs font-semibold mt-1" style={{ color: subText }}>
                    Scroll table for full list.
                  </div>
                </div>
              </div>

              <div className="max-h-[520px] overflow-auto">
                <table className="min-w-full text-sm">
                  <thead
                    className="sticky top-0 z-10"
                    style={{ background: theme === "dark" ? "#0f172a" : "#f1f5f9" }}
                  >
                    <tr>
                      <th className="text-left px-5 py-3 font-black">Item</th>
                      <th className="text-left px-5 py-3 font-black">Status</th>
                      <th className="text-left px-5 py-3 font-black">Location</th>
                      <th className="text-left px-5 py-3 font-black">Team</th>
                      <th className="text-left px-5 py-3 font-black">Activity</th>
                    </tr>
                  </thead>

                  <tbody>
                    {(workingItems || []).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-10 text-center font-bold" style={{ color: subText }}>
                          No items for current filters.
                        </td>
                      </tr>
                    ) : (
                      (workingItems || []).map((item) => {
                        const col = statusColor(item.item_status);
                        const latest = item.latest_submission || {};
                        const lastTime = latest.checked_at || latest.supervised_at || latest.maker_at || null;

                        const stageId = item.checklist?.stage_id;
                        const stageLabel = (stageId && stageMap[stageId]) || (stageId ? `Stage #${stageId}` : "-");

                        return (
                          <tr
                            key={item.item_id}
                            className="border-t"
                            style={{ borderColor: theme === "dark" ? "#1f2937" : "#e2e8f0" }}
                          >
                            <td className="px-5 py-3 align-top">
                              <div className="font-black">{item.item_title}</div>
                              <div className="text-xs font-semibold mt-1" style={{ color: subText }}>
                                Checklist {item.checklist?.id} • {stageLabel}
                              </div>
                            </td>

                            <td className="px-5 py-3 align-top">
                              <span
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black border"
                                style={{
                                  borderColor: theme === "dark" ? "#334155" : "#e2e8f0",
                                  color: col.text,
                                  background: theme === "dark" ? "rgba(2,6,23,0.35)" : "rgba(248,250,252,0.95)",
                                }}
                              >
                                {titleCaseStatus(item.item_status)}
                              </span>
                            </td>

                            <td className="px-5 py-3 align-top">
                              <div className="text-xs font-semibold" style={{ color: subText }}>
                                {buildLocationLabel(item.location, flatLookup)}
                              </div>
                              {(() => {
                                const loc = item.location || {};
                                const roomCat = loc.room_category || loc.room_type || loc.room || null;
                                return roomCat ? (
                                  <div className="text-[11px] mt-1" style={{ color: subText }}>
                                    Room: {roomCat}
                                  </div>
                                ) : null;
                              })()}
                            </td>

                            <td className="px-5 py-3 align-top">
                              <div className="flex flex-col gap-1 text-xs font-semibold">
                                {["maker", "supervisor", "checker"].map((rKey) => {
                                  const rBlock = item.roles && item.roles[rKey];
                                  if (!rBlock || !rBlock.user_id) return null;
                                  const name = resolveUserName(rBlock.user_id);
                                  return (
                                    <div key={rKey} style={{ color: subText }}>
                                      <span className="uppercase font-black">
                                        {rKey.charAt(0).toUpperCase() + rKey.slice(1)}:
                                      </span>{" "}
                                      <span style={{ color: textColor }}>{name}</span>
                                    </div>
                                  );
                                })}
                                {!item.roles && <span style={{ color: subText }}>No team assigned</span>}
                              </div>
                            </td>

                            <td className="px-5 py-3 align-top">
                              <div className="text-xs font-semibold" style={{ color: subText }}>
                                {formatDateTime(lastTime)}
                              </div>
                              {latest.attempts ? (
                                <div className="text-xs font-black mt-1">Attempts: {latest.attempts}</div>
                              ) : null}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectOverview;
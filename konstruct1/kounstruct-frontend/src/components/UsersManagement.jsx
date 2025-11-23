// import React, { useEffect, useState } from "react";
// import Layout1 from "../components/Layout1";
// import axiosInstance from "../api/axiosInstance";
// import { projectInstance,checklistInstance  } from '../api/axiosInstance';
// import { useTheme } from "../ThemeContext";
// import axios from "axios";


// function UsersManagement() {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Filter and search state
//   const [searchTerm, setSearchTerm] = useState("");
//   const [roleFilter, setRoleFilter] = useState("all");
//   const [projectFilter, setProjectFilter] = useState("all");
//   const [expandedRows, setExpandedRows] = useState({});

//   const { theme } = useTheme();

//   const palette =
//     theme === "dark"
//       ? {
//           card: "bg-slate-800 border-slate-700 text-slate-100",
//           border: "border-slate-700",
//           text: "text-slate-100",
//           subtext: "text-slate-300",
//           shadow: "shadow-xl",
//           input: "bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-400",
//         }
//       : {
//           card: "bg-white border-gray-200 text-gray-900",
//           border: "border-gray-200",
//           text: "text-gray-900",
//           subtext: "text-gray-600",
//           shadow: "shadow",
//           input: "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400",
//         };



//         // dropdown option lists
// const [options, setOptions] = useState({
//   projects: [],
//   buildings: [],
//   zones: [],
//   flats: [],
//   categories: [],
//   purposes: [],
//   phases: [],
//   stages: [],
// });
// const [loadingOptions, setLoadingOptions] = useState(false);

// // edit modal state
// const [editing, setEditing] = useState({
//   open: false,
//   user: null,
//   form: {
//     // user fields
//     first_name: "",
//     last_name: "",
//     email: "",
//     phone_number: "",
//     password: "",

//     // access fields
//     project_id: "",
//     active: true,
//     roles: [],

//     // EXTRA access fields
//     building_id: "",
//     zone_id: "",
//     flat_id: "",
//     category: "",
//     purpose_id: "",
//     phase_id: "",
//     stage_id: "",
//   },
// });


// // delete confirm modal
// const [confirm, setConfirm] = useState({ open: false, user: null });


// // turn axios response into list (supports array OR {results: [...]})
// const asList = (res) =>
//   Array.isArray(res?.data) ? res.data : (res?.data?.results || []);

// // swallow errors -> empty list
// const safeGet = async (promise) => {
//   try {
//     return await promise;
//   } catch (e) {
//     return { data: [] };
//   }
// };
// if (projectId) {
//     // purposes by project => normalize to {id, name}
//     const purposesRes = await safeGet(
//       projectInstance.get(`purpose/get-purpose-details-by-project-id/${projectId}/`)
//     );
   
//     purposes = rawPurposes.map((row) => {
//       // row.purpose might be an object; use that if present
//       if (row?.purpose && typeof row.purpose === "object") {
//         return { id: row.purpose.id, name: nameOf(row.purpose, "Purpose") };
//       }
//       // otherwise fall back to row itself
//       return { id: row.id, name: nameOf(row, "Purpose") };
//     });
// // human label for options (best-effort across your APIs)
// const labelOf = (obj, fallbackPrefix = "Item") =>
//   obj?.name ||
//   obj?.title ||
//   obj?.flat_number ||
//   obj?.flat_no ||
//   obj?.rooms ||
//   `${fallbackPrefix} ${obj?.id ?? ""}`;
//  const rawPurposes = asList(purposesRes);
//     const normalizedPurposes = rawPurposes.map((row) =>
//     row?.purpose && typeof row.purpose === "object"
//     ? { id: row.purpose.id, name: row.purpose.name }
//     : { id: row.id, name: row.name || `Purpose ${row.id}` }
// );
// // When PROJECT changes → reload purposes, categories, buildings, zones, flats; reset purpose/phase/stage
// useEffect(() => {
//   if (!editing.open) return;
//   const pid = editing.form.project_id;
//   if (!pid) {
//     setOptions((o) => ({
//       ...o,
//       purposes: [],
//       phases: [],
//       stages: [],
//       categories: [],
//       buildings: [],
//       zones: [],
//       flats: [],
//     }));
//     return;
//   }
//   (async () => {
//     setLoadingOptions(true);
//     const [purposesRes, catRes, bRes, zRes, fRes] = await Promise.all([
//       safeGet(
//         projectInstance.get(
//           `purpose/get-purpose-details-by-project-id/${pid}/`
//         )
//       ),
//       safeGet(projectInstance.get(`category-tree-by-project/?project=${pid}`)),
//       safeGet(projectInstance.get(`buildings/?project=${pid}`)),
//       safeGet(projectInstance.get(`zones/?project=${pid}`)),
//       safeGet(projectInstance.get(`flats/?project=${pid}`)),
//     ]);
//     setOptions((o) => ({
//       ...o,
//       purposes: normalizedPurposes,
//       categories: flattenCategoryTree(catRes?.data || []),
//       buildings: asList(bRes),
//       zones: asList(zRes),
//       flats: asList(fRes),
//       phases: [],
//       stages: [],
//     }));
//     // When PURPOSE changes
// setEditing((s) => ({
//   ...s,
//   form: { ...s.form, purpose_id: "", phase_id: "", stage_id: "" },
// }));
//     setLoadingOptions(false);
//   })();
// }, [editing.open, editing.form.project_id]);

// // When PURPOSE changes → reload phases; reset phase/stage
// useEffect(() => {
//   if (!editing.open) return;
//   const purposeId = editing.form.purpose_id;
//   if (!purposeId) {
//     setOptions((o) => ({ ...o, phases: [], stages: [] }));
//     return;
//   }
//   (async () => {
//     setLoadingOptions(true);
//     const phRes = await safeGet(
//       projectInstance.get(`phases/by-purpose/${purposeId}/`)
//     );
//     setOptions((o) => ({ ...o, phases: asList(phRes), stages: [] }));
//     // When PHASE changes
// setEditing((s) => ({
//   ...s,
//   form: { ...s.form, phase_id: toId(s.form.phase_id), stage_id: "" },
// }));
//     setLoadingOptions(false);
//   })();
// }, [editing.open, editing.form.purpose_id]);

// // When PHASE changes → reload stages; reset stage
// useEffect(() => {
//   if (!editing.open) return;
//   const phaseId = editing.form.phase_id;
//   if (!phaseId) {
//     setOptions((o) => ({ ...o, stages: [] }));
//     return;
//   }
//   (async () => {
//     setLoadingOptions(true);
//     const stRes = await safeGet(
//       projectInstance.get(`stages/by_phase/${phaseId}/`)
//     );
//     setOptions((o) => ({ ...o, stages: asList(stRes) }));
//     setEditing((s) => ({ ...s, form: { ...s.form, stage_id: "" } }));
//     setLoadingOptions(false);
//   })();
// }, [editing.open, editing.form.phase_id]);

// const loadAllOptionsForEdit = async (userOrForm) => {
//   setLoadingOptions(true);

//   const a = userOrForm?.accesses?.[0] || editing?.form || {};
//   const projectId = a.project_id || "";

//   const projectsRes = await safeGet(projectInstance.get("projects/"));

//   let purposes = [];
//   let categories = [];
//   let buildings = [];
//   let zones = [];
//   let flats = [];

  

//     // category tree => flatten to [{id,label}]
//     const catRes = await safeGet(
//       projectInstance.get(`category-tree-by-project/?project=${projectId}`)
//     );
//     categories = flattenCategoryTree(catRes?.data || []);

//     // building/zone/flat scoped to project (adjust URLs if yours differ)
//     const [bRes, zRes, fRes] = await Promise.all([
//       safeGet(projectInstance.get(`buildings/?project=${projectId}`)),
//       safeGet(projectInstance.get(`zones/?project=${projectId}`)),
//       safeGet(projectInstance.get(`flats/?project=${projectId}`)),
//     ]);
//     buildings = asList(bRes);
//     zones = asList(zRes);
//     flats = asList(fRes);
//   }

//   // phases by purpose
//   let phases = [];
//   if (a.purpose_id) {
//     const phRes = await safeGet(
//       projectInstance.get(`phases/by-purpose/${a.purpose_id}/`)
//     );
//     phases = asList(phRes);
//   }

//   // stages by phase
//   let stages = [];
//   if (a.phase_id) {
//     const stRes = await safeGet(
//       projectInstance.get(`stages/by_phase/${a.phase_id}/`)
//     );
//     stages = asList(stRes);
//   }

//   setOptions({
//     projects: asList(projectsRes),
//     purposes,   // <- normalized
//     phases,
//     stages,
//     categories, // [{id,label}]
//     buildings,
//     zones,
//     flats,
//   });

//   setLoadingOptions(false);
// };



//   // Fetch users created by current user
//   const fetchUsers = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await axiosInstance.get("users-by-creator/");
//       setUsers(res.data);
//     } catch (err) {
//       setError("Failed to load users");
//       setUsers([]);
//     } finally {
//       setLoading(false);
//     }
//   };
//   const [isSuperAdmin, setIsSuperAdmin] = useState(false);


//   useEffect(() => {
//     fetchUsers();
//   }, []);
// useEffect(() => {
//   if (!users?.length) return;
//   const ids = new Set();
//   users.forEach(u => u.accesses?.forEach(a => {
//     if (a.project_id && !projectNameCache[a.project_id]) ids.add(a.project_id);
//   }));
//   ids.forEach(id => fetchProjectName(id));
//   // eslint-disable-next-line react-hooks/exhaustive-deps
// }, [users]);

//   const getUniqueRoles = () => {
//     const roles = new Set();
//     users.forEach((user) => {
//       user.accesses?.forEach((access) => {
//         access.roles?.forEach((role) => {
//           roles.add(role.role);
//         });
//       });
//     });
//     return Array.from(roles);
//   };
//   useEffect(() => {
//   let userData = null;
//   try {
//     const s = localStorage.getItem("USER_DATA");
//     if (s) userData = JSON.parse(s);
//   } catch {}

//   if (!userData) {
//     const token =
//       localStorage.getItem("ACCESS_TOKEN") ||
//       localStorage.getItem("TOKEN") ||
//       localStorage.getItem("token");
//     if (token) userData = decodeJWT(token);
//   }

//   const rolee =
//     localStorage.getItem("ROLE") ||
//     userData?.role ||
//     userData?.roles?.[0] ||
//     "";

//   const isSA =
//     (typeof rolee === "string" &&
//       rolee.toLowerCase().includes("super admin")) ||
//     userData?.superadmin === true ||
//     userData?.is_superadmin === true ||
//     userData?.is_staff === true;

//   setIsSuperAdmin(!!isSA);
// }, []);


//   const getUniqueProjects = () => {
//   const ids = new Set();
//   users.forEach((user) => {
//     user.accesses?.forEach((access) => {
//       if (access.project_id) ids.add(access.project_id);
//     });
//   });

//   return Array.from(ids)
//     .map((id) => ({
//       id,
//       name: projectNameCache[id] || `Project ${id}`,
//     }))
//     .sort((a, b) => a.name.localeCompare(b.name));
// };

//   const filteredUsers = users.filter((user) => {
//   const term = searchTerm.toLowerCase();

//   const matchesSearch =
//     user.username.toLowerCase().includes(term) ||
//     user.email?.toLowerCase().includes(term) ||
//     user.id.toString().includes(term) ||
//     // 🟢 also match project NAMES
//     user.accesses?.some((a) =>
//       (projectNameCache[a.project_id] || "").toLowerCase().includes(term)
//     );

//   const matchesRole =
//     roleFilter === "all" ||
//     user.accesses?.some((access) =>
//       access.roles?.some((role) => role.role === roleFilter)
//     );

//   const matchesProject =
//     projectFilter === "all" ||
//     user.accesses?.some(
//       (access) => String(access.project_id) === String(projectFilter)
//     );

//   return matchesSearch && matchesRole && matchesProject;
// });


//   const getRoleColor = (role) => {
//     switch (role.toLowerCase()) {
//       case "maker":
//         return theme === "dark"
//           ? "bg-green-900 text-green-300"
//           : "bg-green-100 text-green-700";
//       case "inspector":
//         return theme === "dark"
//           ? "bg-blue-900 text-blue-300"
//           : "bg-blue-100 text-blue-700";
//       case "checker":
//         return theme === "dark"
//           ? "bg-orange-900 text-orange-300"
//           : "bg-orange-100 text-orange-700";
//       case "supervisor":
//         return theme === "dark"
//           ? "bg-purple-900 text-purple-300"
//           : "bg-purple-100 text-purple-700";
//       case "admin":
//         return theme === "dark"
//           ? "bg-red-900 text-red-300"
//           : "bg-red-100 text-red-700";
//       default:
//         return theme === "dark"
//           ? "bg-slate-700 text-slate-200"
//           : "bg-gray-100 text-gray-700";
//     }
//   };


//   const [projectNameCache, setProjectNameCache] = useState({}); // { [id]: "Project Name" }

// const getProjectNameById = (id) =>
//   projectNameCache[id] ? projectNameCache[id] : `Project ${id}`;

// // const fetchProjectName = async (id) => {
// //   if (!id || projectNameCache[id]) return; // already cached or bad id
// //   try {
// //     // ✅ use HTTPS and the /projects/projects/ path
// //     const res = await axios.get(`https://konstruct.world/projects/projects/${id}/`, {
// //       headers: {
// //         Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN") || ""}`,
// //       },
// //     });
// //     const name = res.data?.name || `Project ${id}`;
// //     setProjectNameCache((prev) => ({ ...prev, [id]: name }));
// //   } catch {
// //     // cache a readable fallback so we don't refetch forever
// //     setProjectNameCache((prev) => ({ ...prev, [id]: `Project ${id}` }));
// //   }
// // };
// // Flatten category tree into {id,label} like "Root › Child › Leaf"
// const flattenCategoryTree = (nodes, prefix = "") => {
//   if (!Array.isArray(nodes)) return [];
//   const out = [];
//   nodes.forEach((n) => {
//     const name = n?.name || n?.title || `Category ${n?.id ?? ""}`;
//     const label = prefix ? `${prefix} › ${name}` : name;
//     if (n?.id != null) out.push({ id: n.id, label });
//     const children =
//       n.children ||
//       n.subcategories ||
//       n.nodes ||
//       n.items ||
//       n.children_categories ||
//       [];
//     if (Array.isArray(children) && children.length) {
//       out.push(...flattenCategoryTree(children, label));
//     }
//   });
//   return out;
// };


// const fetchProjectName = async (id) => {
//   if (!id || projectNameCache[id]) return; // already cached or bad id
//   try {
//     const res = await projectInstance.get(`projects/${id}/`);
//     const name = res.data?.name || `Project ${id}`;
//     setProjectNameCache((prev) => ({ ...prev, [id]: name }));
//   } catch {
//     setProjectNameCache((prev) => ({ ...prev, [id]: `Project ${id}` }));
//   }
// };

//   const toggleRowExpansion = (userId) => {
//     setExpandedRows((prev) => ({
//       ...prev,
//       [userId]: !prev[userId],
//     }));
//   };

//   const showAccessRoles = !isSuperAdmin;
// const [deletingId, setDeletingId] = useState(null);


// const askDeleteUser = (user) =>
//   setConfirm({ open: true, user });

// const handleDeleteUser = async (userId) => {
//   const user = users.find(u => u.id === userId);
//   const name = user?.username || `User ${userId}`;
//   if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;

//   try {
//     setDeletingId(userId);
//     await axiosInstance.delete(`users/${userId}/`);
//     // remove locally or refetch:
//     setUsers(prev => prev.filter(u => u.id !== userId));
//     // or: await fetchUsers();
//   } catch (e) {
//     const msg = e?.response?.data ? JSON.stringify(e.response.data) : e.message;
//     alert(`Delete failed: ${msg}`);
//   } finally {
//     setDeletingId(null);
//   }
// };

//   const handleEditUser = async (userId) => {
//   const u = users.find((x) => x.id === userId);
//   if (!u) return;
//   const a = u.accesses?.[0] || {};
//   const roles = (a.roles || []).map((r) => r.role);

//   setEditing({
//     open: true,
//     user: u,
//     form: {
//       first_name: u.first_name || "",
//       last_name: u.last_name || "",
//       email: u.email || "",
//       phone_number: u.phone_number || "",
//       password: "",

//       project_id: a.project_id ?? a.project?.id ?? "",
//       active: a.active ?? true,
//       roles,

//       building_id: a.building_id ?? a.building?.id ?? "",
//       zone_id: a.zone_id ?? a.zone?.id ?? "",
//       flat_id: a.flat_id ?? a.flat?.id ?? "",
//       category: a.category ?? a.category_id ?? a.category?.id ?? "",

//       // IMPORTANT: ensure these are IDs, not objects
//       purpose_id: a.purpose_id ?? a.purpose?.id ?? "",
//       phase_id: a.phase_id ?? a.phase?.id ?? "",
//       stage_id: a.stage_id ?? a.stage?.id ?? "",
//     },
//   });

//   await loadAllOptionsForEdit(u);
// };

// // Pick a nice display name from an object
// const nameOf = (obj, fallbackPrefix = "Item") =>
//   obj?.name || obj?.title || obj?.label || obj?.flat_number || obj?.rooms || `${fallbackPrefix} ${obj?.id ?? ""}`;

// // Ensure a select value is an ID (number) or "" for empty
// const toId = (v) => (v === "" || v === null || v === undefined ? "" : Number(v));


//   // const handleDeleteUser = (userId) => {
//   //   if (window.confirm("Are you sure you want to delete this user?")) {
//   //     alert(`Delete user ${userId} - Feature to be implemented`);
//   //   }
//   // };
// // const saveAccessFullPatch = async (userId, form) => {
// //   const payload = {
// //     user: {
// //       first_name: form.first_name ?? undefined,
// //       last_name: form.last_name ?? undefined,
// //       email: form.email ?? undefined,
// //       phone_number: form.phone_number ?? undefined,
// //       password: form.password ?? undefined, // optional
// //     },
// //     access: {
// //       project_id: form.project_id,
// //       building_id: form.building_id ?? null,
// //       zone_id: form.zone_id ?? null,
// //       flat_id: form.flat_id ?? null,
// //       active: form.active ?? true,
// //       category: form.category ?? null,
// //       purpose_id: form.purpose_id ?? null,
// //       phase_id: form.phase_id ?? null,
// //       stage_id: form.stage_id ?? null,
// //       All_checklist: form.All_checklist ?? false,
// //       CategoryLevel1: form.CategoryLevel1 ?? null,
// //       CategoryLevel2: form.CategoryLevel2 ?? null,
// //       CategoryLevel3: form.CategoryLevel3 ?? null,
// //       CategoryLevel4: form.CategoryLevel4 ?? null,
// //       CategoryLevel5: form.CategoryLevel5 ?? null,
// //       CategoryLevel6: form.CategoryLevel6 ?? null,
// //     },
// //     roles: (form.roles || []).map(r => ({ role: r })), // e.g. ["SUPERVISOR"]
// //   };

// //   await axiosInstance.patch(`users/access-full-patch/${userId}/`, payload);
// //   await fetchUsers(); // refresh the table
// // };
// const saveAccessFullPatch = async (userId, form) => {
//   const payload = {
//     user: {
//       first_name: form.first_name ?? undefined,
//       last_name: form.last_name ?? undefined,
//       email: form.email ?? undefined,
//       phone_number: form.phone_number ?? undefined,
//       password: form.password ?? undefined, // optional
//     },
//     access: {
//       project_id: form.project_id,
//       building_id: form.building_id ?? null,
//       zone_id: form.zone_id ?? null,
//       flat_id: form.flat_id ?? null,
//       active: form.active ?? true,
//       category: form.category ?? null,
//       purpose_id: form.purpose_id ?? null,
//       phase_id: form.phase_id ?? null,
//       stage_id: form.stage_id ?? null,
//       All_checklist: form.All_checklist ?? false,
//       CategoryLevel1: form.CategoryLevel1 ?? null,
//       CategoryLevel2: form.CategoryLevel2 ?? null,
//       CategoryLevel3: form.CategoryLevel3 ?? null,
//       CategoryLevel4: form.CategoryLevel4 ?? null,
//       CategoryLevel5: form.CategoryLevel5 ?? null,
//       CategoryLevel6: form.CategoryLevel6 ?? null,
//     },
//     roles: (form.roles || []).map(r => ({ role: r })), // e.g. ["SUPERVISOR"]
//  };

//   try {
//     await axiosInstance.patch(`users/access-full-patch/${userId}/`, payload);
//     await fetchUsers();
//     alert("Access updated");
//   } catch (e) {
//     const msg = e?.response?.data ? JSON.stringify(e.response.data) : e.message;
//     alert(`Access update failed: ${msg}`);
//     throw e;
//   }
// };
//   const handleManageAccess = async (userId) => {
//   const projectId = window.prompt("Project ID?");
//   const role = window.prompt("Role? (e.g., SUPERVISOR)");
//   if (!projectId || !role) return;

//   await saveAccessFullPatch(userId, {
//     project_id: Number(projectId),
//     roles: [role],
//     active: true,
//   });
// };


//   // --- Helper for JWT decode (same as in your other file) ---
// function decodeJWT(token) {
//   try {
//     const base64Url = token.split(".")[1];
//     const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
//     const jsonPayload = decodeURIComponent(
//       atob(base64)
//         .split("")
//         .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
//         .join("")
//     );
//     return JSON.parse(jsonPayload);
//   } catch {
//     return null;
//   }
  
// }


//   return (
//     <>
//       {/* Main content - fills the space, no max-w or mx-auto */}
//       <main className="w-full min-h-[calc(100vh-64px)] p-6 bg-transparent">
//         <h2 className={`text-2xl font-bold mb-6 ${palette.text}`}>Users Management</h2>

//         {/* Header Stats */}
//         <div className={`rounded-lg ${palette.card} ${palette.shadow} p-4 mb-6 ${palette.border} border`}>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className={`text-center p-3 rounded-lg ${theme === "dark" ? "bg-blue-900" : "bg-blue-50"}`}>
//               <div className="text-2xl font-bold text-blue-600">{users.length}</div>
//               <div className={`text-sm ${palette.subtext}`}>Total Users Created</div>
//             </div>
//             <div className={`text-center p-3 rounded-lg ${theme === "dark" ? "bg-green-900" : "bg-green-50"}`}>
//               <div className="text-2xl font-bold text-green-600">
//                 {users.filter((u) => u.accesses?.length > 0).length}
//               </div>
//               <div className={`text-sm ${palette.subtext}`}>Users with Access</div>
//             </div>
//             <div className={`text-center p-3 rounded-lg ${theme === "dark" ? "bg-purple-900" : "bg-purple-50"}`}>
//               <div className="text-2xl font-bold text-purple-600">
//                 {getUniqueProjects().length}
//               </div>
//               <div className={`text-sm ${palette.subtext}`}>Projects Assigned</div>
//             </div>
//           </div>
//         </div>

//         {/* Search and Filters */}
//         <div className={`rounded-lg ${palette.card} ${palette.shadow} p-6 mb-6 ${palette.border} border`}>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             {/* Search */}
//             <div>
//               <label className={`block text-sm font-medium mb-2 ${palette.text}`}>Search Users</label>
//               <input
//                 type="text"
//                 placeholder="Search by username, email, or ID..."
//                 className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${palette.input} ${palette.border} border`}
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>
//             {/* Role Filter */}
//             <div>
//               <label className={`block text-sm font-medium mb-2 ${palette.text}`}>Filter by Role</label>
//               <select
//                 className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${palette.input} ${palette.border} border`}
//                 value={roleFilter}
//                 onChange={(e) => setRoleFilter(e.target.value)}
//               >
//                 <option value="all">All Roles</option>
//                 {getUniqueRoles().map((role) => (
//                   <option key={role} value={role}>
//                     {role.charAt(0).toUpperCase() + role.slice(1)}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             {/* Project Filter */}
//             <div>
//               <label className={`block text-sm font-medium mb-2 ${palette.text}`}>Filter by Project</label>
//               <select
//   className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${palette.input} ${palette.border} border`}
//   value={projectFilter}
//   onChange={(e) => setProjectFilter(e.target.value)}
// >
//   <option value="all">All Projects</option>
//   {getUniqueProjects().map((p) => (
//     <option key={p.id} value={String(p.id)}>
//       {p.name}
//     </option>
//   ))}
// </select>
//             </div>
//           </div>
//           {/* Active Filters Display */}
//           {(searchTerm || roleFilter !== "all" || projectFilter !== "all") && (
//             <div className="mt-4 flex flex-wrap gap-2">
//               <span className={`text-sm ${palette.subtext}`}>Active filters:</span>
//               {searchTerm && (
//                 <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
//                   Search: "{searchTerm}"
//                 </span>
//               )}
//               {roleFilter !== "all" && (
//                 <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">
//                   Role: {roleFilter}
//                 </span>
//               )}
//              {projectFilter !== "all" && (
//   <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm">
//     Project: {projectNameCache[projectFilter] || `Project ${projectFilter}`}
//   </span>
// )}
//               <button
//                 onClick={() => {
//                   setSearchTerm("");
//                   setRoleFilter("all");
//                   setProjectFilter("all");
//                 }}
//                 className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm hover:bg-gray-200"
//               >
//                 Clear All
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Users Table */}
//         <div className={`rounded-lg ${palette.card} ${palette.shadow} overflow-hidden ${palette.border} border`}>
//           {loading ? (
//             <div className="flex items-center justify-center py-12">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
//               <span className={palette.subtext}>Loading users...</span>
//             </div>
//           ) : error ? (
//             <div className="text-center py-12">
//               <p className="text-red-500 mb-4">{error}</p>
//               <button
//                 onClick={fetchUsers}
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
//               >
//                 Try Again
//               </button>
//             </div>
//           ) : filteredUsers.length === 0 ? (
//             <div className="text-center py-12">
//               <p className={palette.subtext}>
//                 {users.length === 0
//                   ? "No users created yet."
//                   : "No users match the current filters."}
//               </p>
//             </div>
//           ) : (
//             <>
//               {/* Desktop Table */}
//               <div className="hidden lg:block overflow-x-auto">
//                 <table className={`min-w-full divide-y ${palette.border} border`}>
//                   <thead className={theme === "dark" ? "bg-slate-900" : "bg-gray-50"}>
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">User Details</th>
//                           {showAccessRoles && (

//                       <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Access & Projects</th>
//                           )}

//                               {showAccessRoles && (

//                       <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Roles</th>
//                               )}
//                       <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
//                       <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody className={theme === "dark" ? "bg-slate-800" : "bg-white"}>
//                     {filteredUsers.map((user) => (
//                       <tr key={user.id} className={theme === "dark" ? "hover:bg-slate-700" : "hover:bg-gray-50"}>
//                         {/* User Details */}
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="flex items-center">
//                             <div className="flex-shrink-0 h-10 w-10">
//                               <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
//                                 {user.username.charAt(0).toUpperCase()}
//                               </div>
//                             </div>
//                             <div className="ml-4">
//                               <div className={`text-sm font-medium ${palette.text}`}>
//                                 {user.username}
//                               </div>
//                               {/* <div className="text-sm text-gray-500">
//                                 ID: {user.id}
//                               </div> */}
//                               {user.email && (
//                                 <div className="text-sm text-gray-500">
//                                   {user.email}
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         </td>
//                         {/* Access & Projects */}
//                               {showAccessRoles &&(

//                         <td className="px-6 py-4">
//                           {user.accesses && user.accesses.length > 0 ? (
//                             <div className="space-y-1">
//                               {user.accesses
//                                 .slice(0, 2)
//                                 .map((access, index) => (
//                                   <div key={index} className="text-sm">
//                                     <span className="font-medium text-gray-900">
//   {access.project_name || getProjectNameById(access.project_id)}
//                                     </span>
//                                     <div className="text-xs text-gray-500">
//                                       {access.building_id &&
//                                         `Building: ${access.building_id}`}
//                                       {access.zone_id &&
//                                         ` | Zone: ${access.zone_id}`}
//                                       {access.flat_id &&
//                                         ` | Flat: ${access.flat_id}`}
//                                     </div>
//                                   </div>
//                                 ))}
//                               {user.accesses.length > 2 && (
//                                 <div className="text-xs text-blue-600">
//                                   +{user.accesses.length - 2} more
//                                 </div>
//                               )}
//                             </div>
//                           ) : (
//                             <span className="text-sm text-gray-500">
//                               No access assigned
//                             </span>
//                           )}
//                         </td>
//                               )}
//                         {/* Roles */}
//                               {showAccessRoles &&(

//                         <td className="px-6 py-4">
//                           <div className="flex flex-wrap gap-1">
//                             {user.accesses && user.accesses.length > 0 ? (
//                               (() => {
//                                 const allRoles = new Set();
//                                 user.accesses.forEach((access) => {
//                                   access.roles?.forEach((role) => {
//                                     allRoles.add(role.role);
//                                   });
//                                 });
//                                 return Array.from(allRoles)
//                                   .slice(0, 3)
//                                   .map((role) => (
//                                     <span
//                                       key={role}
//                                       className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
//                                         role
//                                       )}`}
//                                     >
//                                       {role}
//                                     </span>
//                                   ));
//                               })()
//                             ) : (
//                               <span className="text-sm text-gray-500">
//                                 No roles
//                               </span>
//                             )}
//                           </div>
//                         </td>
//                               )}
//                         {/* Status */}
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span
//                             className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                               user.has_access
//                                 ? theme === "dark"
//                                   ? "bg-green-900 text-green-300"
//                                   : "bg-green-100 text-green-800"
//                                 : theme === "dark"
//                                 ? "bg-red-900 text-red-300"
//                                 : "bg-red-100 text-red-800"
//                             }`}
//                           >
//                             {user.has_access ? "Active" : "Inactive"}
//                           </span>
//                         </td>
//                         {/* Actions */}
//                         <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                           <div className="flex justify-end gap-2">
//                            <button
//   onClick={() => handleEditUser(user.id)}
//   className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded text-xs"
// >
//   Edit
// </button>
// <button
// onClick={() => askDeleteUser(user)}
//   disabled={deletingId === user.id}
//   className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-2 py-1 rounded text-xs disabled:opacity-60"
// >
//   {deletingId === user.id ? "Deleting..." : "Delete"}
// </button>


//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//               {/* Mobile Cards */}
//               <div className="lg:hidden">
//                 {filteredUsers.map((user) => (
//                   <div
//                     key={user.id}
//                     className={`border-b ${palette.border} p-4`}
//                   >
//                     <div className="flex items-center justify-between mb-3">
//                       <div className="flex items-center">
//                         <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold mr-3">
//                           {user.username.charAt(0).toUpperCase()}
//                         </div>
//                         <div>
//                           <div className={`font-medium ${palette.text}`}>
//                             {user.username}
//                           </div>
//                           <div className="text-sm text-gray-500">
//                             ID: {user.id}
//                           </div>
//                         </div>
//                       </div>
//                       <button
//                         onClick={() => toggleRowExpansion(user.id)}
//                         className="text-blue-600 hover:text-blue-800"
//                       >
//                         {expandedRows[user.id] ? "▲" : "▼"}
//                       </button>
//                     </div>
//                     {/* Roles Preview */}
//                     {!isSuperAdmin && (

//                     <div className="flex flex-wrap gap-1 mb-3">
//                       {user.accesses && user.accesses.length > 0 ? (
//                         (() => {
//                           const allRoles = new Set();
//                           user.accesses.forEach((access) => {
//                             access.roles?.forEach((role) => {
//                               allRoles.add(role.role);
//                             });
//                           });
//                           return Array.from(allRoles)
//                             .slice(0, 2)
//                             .map((role) => (
//                               <span
//                                 key={role}
//                                 className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
//                                   role
//                                 )}`}
//                               >
//                                 {role}
//                               </span>
//                             ));
//                         })()
//                       ) : (
//                         <span className="text-sm text-gray-500">No roles</span>
//                       )}
//                     </div>
//                     )}
//                     {/* Expanded Details */}
//                     {expandedRows[user.id] && (
//                       <div className="mt-3 pt-3 border-t border-gray-100">
//                         {user.email && (
//                           <div className="mb-2">
//                             <span className="text-sm font-medium">
//                               Email:{" "}
//                             </span>
//                             <span className="text-sm text-gray-600">
//                               {user.email}
//                             </span>
//                           </div>
//                         )}
//                         <div className="mb-2">
//                           <span className="text-sm font-medium">Status: </span>
//                           <span
//                             className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
//                               user.has_access
//                                 ? theme === "dark"
//                                   ? "bg-green-900 text-green-300"
//                                   : "bg-green-100 text-green-800"
//                                 : theme === "dark"
//                                 ? "bg-red-900 text-red-300"
//                                 : "bg-red-100 text-red-800"
//                             }`}
//                           >
//                             {user.has_access ? "Active" : "Inactive"}
//                           </span>
//                         </div>
//                         {!isSuperAdmin&&user.accesses && user.accesses.length > 0 && (
//                           <div className="mb-3">
//                             <div className="text-sm font-medium mb-1">
//                               Project Access:
//                             </div>
//                             {user.accesses.map((access, index) => (
//                               <div
//                                 key={index}
//                                 className="text-sm text-gray-600 ml-2"
//                               >
// • {access.project_name || getProjectNameById(access.project_id)}
//                                 {access.building_id &&
//                                   ` (Building: ${access.building_id})`}
//                                 {access.zone_id &&
//                                   ` (Zone: ${access.zone_id})`}
//                                 {access.flat_id &&
//                                   ` (Flat: ${access.flat_id})`}
//                               </div>
//                             ))}
//                           </div>
//                         )}
//                         {/* Actions */}
//                         <div className="flex gap-2">
//                           <button
//   onClick={() => handleEditUser(user.id)}
//   className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
// >
//   Edit
// </button>
// <button
// onClick={() => askDeleteUser(user)}
//   className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm"
// >
//   Delete
// </button>

//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </>
//           )}
//         </div>
//         {/* Results Summary */}
//         {!loading && !error && (
//           <div className={`mt-4 text-sm ${palette.subtext} text-center`}>
//             Showing {filteredUsers.length} of {users.length} users
//           </div>
//         )}
//         {/* Delete confirmation modal */}
// {confirm.open && (
//   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
//     <div className={`w-full max-w-md rounded-xl ${palette.card} ${palette.border} border p-6`}>
//       <h3 className="text-lg font-semibold mb-2">Delete user</h3>
//       <p className={`${palette.subtext} mb-6`}>
//         Are you sure you want to delete{" "}
//         <span className="font-medium">{confirm.user?.username}</span>? This cannot be undone.
//       </p>
//       <div className="flex justify-end gap-2">
//         <button
//           onClick={() => setConfirm({ open: false, user: null })}
//           className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-800"
//         >
//           Cancel
//         </button>
//         <button
//           onClick={async () => {
//             if (!confirm.user) return;
//             setDeletingId(confirm.user.id);
//             try {
//               await axiosInstance.delete(`users/${confirm.user.id}/`);
//               setUsers((prev) => prev.filter((u) => u.id !== confirm.user.id));
//               setConfirm({ open: false, user: null });
//             } catch (e) {
//               const msg = e?.response?.data ? JSON.stringify(e.response.data) : e.message;
//               alert(`Delete failed: ${msg}`);
//             } finally {
//               setDeletingId(null);
//             }
//           }}
//           disabled={deletingId === confirm.user?.id}
//           className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
//         >
//           {deletingId === confirm.user?.id ? "Deleting..." : "Delete"}
//         </button>
//       </div>
//     </div>
//   </div>
// )}
// {/* Edit user modal */}
// {editing.open && (
//   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
//     <div className={`w-full max-w-3xl rounded-xl ${palette.card} ${palette.border} border p-6`}>
//       <div className="flex items-start justify-between mb-4">
//         <h3 className="text-lg font-semibold">Edit User & Access</h3>
//         <button
//           onClick={() => setEditing((s) => ({ ...s, open: false }))}
//           className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
//         >
//           ✕
//         </button>
//       </div>

//       {/* Form */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {/* User fields */}
//         <div>
//           <label className="block text-sm font-medium mb-1">First name</label>
//           <input
//             value={editing.form.first_name}
//             onChange={(e) =>
//               setEditing((s) => ({ ...s, form: { ...s.form, first_name: e.target.value } }))
//             }
//             className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
//             placeholder="First name"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium mb-1">Last name</label>
//           <input
//             value={editing.form.last_name}
//             onChange={(e) =>
//               setEditing((s) => ({ ...s, form: { ...s.form, last_name: e.target.value } }))
//             }
//             className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
//             placeholder="Last name"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium mb-1">Email</label>
//           <input
//             value={editing.form.email}
//             onChange={(e) =>
//               setEditing((s) => ({ ...s, form: { ...s.form, email: e.target.value } }))
//             }
//             className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
//             placeholder="Email"
//             type="email"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium mb-1">Phone</label>
//           <input
//             value={editing.form.phone_number}
//             onChange={(e) =>
//               setEditing((s) => ({ ...s, form: { ...s.form, phone_number: e.target.value } }))
//             }
//             className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
//             placeholder="Phone"
//           />
//         </div>
//         <div className="md:col-span-2">
//           <label className="block text-sm font-medium mb-1">Password (optional)</label>
//           <input
//             value={editing.form.password}
//             onChange={(e) =>
//               setEditing((s) => ({ ...s, form: { ...s.form, password: e.target.value } }))
//             }
//             className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
//             placeholder="Set new password"
//             type="password"
//           />
//         </div>

//         {/* Access */}
//         <div className="md:col-span-2 border-t pt-4">
//           <div className="flex items-center gap-4 mb-3">
//             <label className="text-sm font-medium">Active</label>
//             <input
//               type="checkbox"
//               checked={!!editing.form.active}
//               onChange={(e) =>
//                 setEditing((s) => ({ ...s, form: { ...s.form, active: e.target.checked } }))
//               }
//             />
//           </div>

//           {/* Roles (simple multi-select checkboxes) */}
//           <div className="mb-4">
//             <label className="block text-sm font-medium mb-2">Roles</label>
//             <div className="flex flex-wrap gap-2">
//               {["MAKER", "INSPECTOR", "CHECKER", "SUPERVISOR", "ADMIN"].map((r) => {
//                 const checked = editing.form.roles?.includes(r);
//                 return (
//                   <label key={r} className="flex items-center gap-2 px-2 py-1 rounded border cursor-pointer">
//                     <input
//                       type="checkbox"
//                       checked={checked}
//                       onChange={(e) => {
//                         setEditing((s) => {
//                           const set = new Set(s.form.roles || []);
//                           e.target.checked ? set.add(r) : set.delete(r);
//                           return { ...s, form: { ...s.form, roles: Array.from(set) } };
//                         });
//                       }}
//                     />
//                     <span className="text-sm">{r}</span>
//                   </label>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Project */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium mb-1">Project</label>
//               <select
//                 disabled={loadingOptions}
//                 className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
//                 value={editing.form.project_id || ""}
//                 onChange={(e) => {
//                   const pid = e.target.value;
//                  // When PROJECT changes
// setEditing((s) => ({
//   ...s,
//   form: {
//     ...s.form,
//     project_id: toId(e.target.value),
//     purpose_id: "",
//     phase_id: "",
//     stage_id: "",
//     building_id: "",
//     zone_id: "",
//     flat_id: "",
//     category: "",
//   },
// }));
//                 }}
//               >
//                 <option value="">Select project</option>
//                 {options.projects.map((p) => (
//                   <option key={p.id} value={p.id}>
//                     {labelOf(p, "Project")}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Category */}
//             <div>
//               <label className="block text-sm font-medium mb-1">Category</label>
//               <select
//                 disabled={loadingOptions || !editing.form.project_id}
//                 className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
//                 value={editing.form.category || ""}
//                 onChange={(e) =>
//                   setEditing((s) => ({ ...s, form: { ...s.form, category: e.target.value } }))
//                 }
//               >
//                 <option value="">—</option>
//                 {options.categories.map((c) => (
//                   <option key={c.id} value={c.id}>
//                     {c.label}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Building / Zone / Flat */}
//             <div>
//               <label className="block text-sm font-medium mb-1">Building</label>
//               <select
//                 disabled={loadingOptions || !editing.form.project_id}
//                 className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
//                 value={editing.form.building_id || ""}
//                 onChange={(e) =>
//                   setEditing((s) => ({ ...s, form: { ...s.form, building_id: e.target.value } }))
//                 }
//               >
//                 <option value="">—</option>
//                 {options.buildings.map((b) => (
//                   <option key={b.id} value={b.id}>
//                     {labelOf(b, "Building")}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Zone</label>
//               <select
//                 disabled={loadingOptions || !editing.form.project_id}
//                 className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
//                 value={editing.form.zone_id || ""}
//                 onChange={(e) =>
//                   setEditing((s) => ({ ...s, form: { ...s.form, zone_id: e.target.value } }))
//                 }
//               >
//                 <option value="">—</option>
//                 {options.zones.map((z) => (
//                   <option key={z.id} value={z.id}>
//                     {labelOf(z, "Zone")}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Flat</label>
//               <select
//                 disabled={loadingOptions || !editing.form.project_id}
//                 className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
//                 value={editing.form.flat_id || ""}
//                 onChange={(e) =>
//                   setEditing((s) => ({ ...s, form: { ...s.form, flat_id: e.target.value } }))
//                 }
//               >
//                 <option value="">—</option>
//                 {options.flats.map((f) => (
//                   <option key={f.id} value={f.id}>
//                     {labelOf(f, "Flat")}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Purpose / Phase / Stage */}
//             {/* Purpose */}
// <div>
//   <label className="block text-sm font-medium mb-1">Purpose</label>
//   <select
//     disabled={loadingOptions || !editing.form.project_id}
//     className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
//     value={editing.form.purpose_id || ""}
//     onChange={(e) =>
//       setEditing((s) => ({ ...s, form: { ...s.form, purpose_id: toId(e.target.value) } }))
//     }
//   >
//     <option value="">—</option>
//     {options.purposes.map((p) => (
//       <option key={p.id} value={p.id}>
//         {nameOf(p, "Purpose")}
//       </option>
//     ))}
//   </select>
// </div>
//           {/* Phase */}
// <div>
//   <label className="block text-sm font-medium mb-1">Phase</label>
//   <select
//     disabled={loadingOptions || !editing.form.purpose_id}
//     className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
//     value={editing.form.phase_id || ""}
//     onChange={(e) =>
//       setEditing((s) => ({ ...s, form: { ...s.form, phase_id: toId(e.target.value) } }))
//     }
//   >
//     <option value="">—</option>
//     {options.phases.map((ph) => (
//       <option key={ph.id} value={ph.id}>
//         {nameOf(ph, "Phase")}
//       </option>
//     ))}
//   </select>
// </div>
//             {/* Stage */}
// <div>
//   <label className="block text-sm font-medium mb-1">Stage</label>
//   <select
//     disabled={loadingOptions || !editing.form.phase_id}
//     className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
//     value={editing.form.stage_id || ""}
//     onChange={(e) =>
//       setEditing((s) => ({ ...s, form: { ...s.form, stage_id: toId(e.target.value) } }))
//     }
//   >
//     <option value="">—</option>
//     {options.stages.map((st) => (
//       <option key={st.id} value={st.id}>
//         {nameOf(st, "Stage")}
//       </option>
//     ))}
//   </select>
// </div>
//           </div>
//         </div>
//       </div>

//       {/* Footer */}
//       <div className="mt-6 flex justify-end gap-2">
//         <button
//           onClick={() => setEditing((s) => ({ ...s, open: false }))}
//           className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-800"
//         >
//           Cancel
//         </button>
//         <button
//           onClick={async () => {
//             try {
//               await saveAccessFullPatch(editing.user.id, editing.form);
//               setEditing((s) => ({ ...s, open: false }));
//             } catch {
//               // saveAccessFullPatch already alerts on error
//             }
//           }}
//           disabled={loadingOptions}
//           className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
//         >
//           Save
//         </button>
//       </div>
//     </div>
//   </div>
// )}


//       </main>
//     </>
//   );
// }

// export default UsersManagement;



// import React, { useEffect, useState } from "react";
// import axiosInstance from "../api/axiosInstance";
// import { projectInstance } from "../api/axiosInstance";
// import { useTheme } from "../ThemeContext";

// /**
//  * Helpers
//  */

// // turn axios response into list (supports array OR {results: [...]})
// const asList = (res) => {
//   const d = res?.data;
//   if (Array.isArray(d)) return d;
//   if (Array.isArray(d?.results)) return d.results;
//   if (d && typeof d === "object") {
//     const arr = Object.values(d).find(Array.isArray);
//     if (Array.isArray(arr)) return arr;
//   }
//   return [];
// };

// const purposeNameOf = (row) => {
//   if (row && typeof row.name === "string") return row.name;
//   if (row?.purpose?.name) return row.purpose.name;
//   if (row?.name?.purpose?.name) return row.name.purpose.name;
//   if (row?.purpose_name) return row.purpose_name;
//   if (typeof row?.name === "string") return row.name;
//   return `Purpose ${row?.id ?? row?.purpose?.id ?? ""}`;
// };

// const normalizePurposesList = (rows) =>
//   (rows || [])
//     .map((row) => {
//       const id =
//         row?.purpose?.id ??
//         row?.purpose_id ??
//         row?.id ??
//         row?.name?.id ??
//         row?.name?.purpose?.id;

//       const name = purposeNameOf(row?.purpose || row);
//       return id != null ? { id, name } : null;
//     })
//     .filter(Boolean);

// // swallow errors -> empty list response shape
// const safeGet = async (promise) => {
//   try {
//     return await promise;
//   } catch {
//     return { data: [] };
//   }
// };
// // Force any value to a string for rendering
// const safeText = (v, fallback = "") =>
//   (typeof v === "string" || typeof v === "number") ? String(v) : fallback;

// // Pick a nice display name from an object
// // Safer label getter that also understands nested purpose/phase/stage objects
// const nameOf = (obj, fallbackPrefix = "Item") => {
//   if (!obj || typeof obj !== "object") return safeText(obj, `${fallbackPrefix}`);
//   const direct =
//     obj.name ??
//     obj.title ??
//     obj.label ??
//     obj.flat_number ??
//     obj.flat_no ??
//     obj.rooms ??
//     (obj.purpose && obj.purpose.name) ??   // 👈 important for your APIs
//     (obj.phase && obj.phase.name) ??
//     (obj.stage && obj.stage.name);

//   return safeText(direct, `${fallbackPrefix} ${obj.id ?? ""}`);
// };

// // label for general options
// const labelOf = (obj, fallbackPrefix = "Item") => nameOf(obj, fallbackPrefix);

// // Ensure a select value is an ID (number) or "" for empty
// const toId = (v) => (v === "" || v === null || v === undefined ? "" : Number(v));

// // Flatten category tree into {id,label} like "Root › Child › Leaf"
// const flattenCategoryTree = (nodes, prefix = "") => {
//   if (!Array.isArray(nodes)) return [];
//   const out = [];
//   nodes.forEach((n) => {
//     const nm = n?.name || n?.title || `Category ${n?.id ?? ""}`;
//     const label = prefix ? `${prefix} › ${nm}` : nm;
//     if (n?.id != null) out.push({ id: n.id, label });
//     const children =
//       n.children ||
//       n.subcategories ||
//       n.nodes ||
//       n.items ||
//       n.children_categories ||
//       [];
//     if (Array.isArray(children) && children.length) {
//       out.push(...flattenCategoryTree(children, label));
//     }
//   });
//   return out;
// };

// // --- Helper for JWT decode (same as your other file) ---
// function decodeJWT(token) {
//   try {
//     const base64Url = token.split(".")[1];
//     const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
//     const jsonPayload = decodeURIComponent(
//       atob(base64)
//         .split("")
//         .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
//         .join("")
//     );
//     return JSON.parse(jsonPayload);
//   } catch {
//     return null;
//   }
// }

// function UsersManagement() {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Filter and search state
//   const [searchTerm, setSearchTerm] = useState("");
//   const [roleFilter, setRoleFilter] = useState("all");
//   const [projectFilter, setProjectFilter] = useState("all");
//   const [expandedRows, setExpandedRows] = useState({});

//   const { theme } = useTheme();

//   const palette =
//     theme === "dark"
//       ? {
//           card: "bg-slate-800 border-slate-700 text-slate-100",
//           border: "border-slate-700",
//           text: "text-slate-100",
//           subtext: "text-slate-300",
//           shadow: "shadow-xl",
//           input:
//             "bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-400",
//         }
//       : {
//           card: "bg-white border-gray-200 text-gray-900",
//           border: "border-gray-200",
//           text: "text-gray-900",
//           subtext: "text-gray-600",
//           shadow: "shadow",
//           input:
//             "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400",
//         };

//   // dropdown option lists
//   const [options, setOptions] = useState({
//     projects: [],
//     buildings: [],
//     zones: [],
//     flats: [],
//     categories: [],
//     purposes: [], // normalized to [{id,name}]
//     phases: [],
//     stages: [],
//   });
//   const [loadingOptions, setLoadingOptions] = useState(false);

//   // edit modal state
//   const [editing, setEditing] = useState({
//     open: false,
//     user: null,
//     form: {
//       // user fields
//       first_name: "",
//       last_name: "",
//       email: "",
//       phone_number: "",
//       password: "",

//       // access fields
//       project_id: "",
//       active: true,
//       roles: [],

//       // EXTRA access fields
//       building_id: "",
//       zone_id: "",
//       flat_id: "",
//       category: "",
//       purpose_id: "",
//       phase_id: "",
//       stage_id: "",
//     },
//   });

//   // delete confirm modal
//   const [confirm, setConfirm] = useState({ open: false, user: null });

//   // Fetch users created by current user
//   const fetchUsers = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await axiosInstance.get("users-by-creator/");
//       setUsers(res.data || []);
//     } catch (err) {
//       setError("Failed to load users");
//       setUsers([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const [isSuperAdmin, setIsSuperAdmin] = useState(false);

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   // preload project names used for filters/table
//   const [projectNameCache, setProjectNameCache] = useState({}); // { [id]: "Project Name" }
//   const fetchProjectName = async (id) => {
//     if (!id || projectNameCache[id]) return;
//     try {
//       const res = await projectInstance.get(`projects/${id}/`);
//       const name = res.data?.name || `Project ${id}`;
//       setProjectNameCache((prev) => ({ ...prev, [id]: name }));
//     } catch {
//       setProjectNameCache((prev) => ({ ...prev, [id]: `Project ${id}` }));
//     }
//   };
//   const getProjectNameById = (id) =>
//     projectNameCache[id] ? projectNameCache[id] : `Project ${id}`;

//   useEffect(() => {
//     if (!users?.length) return;
//     const ids = new Set();
//     users.forEach((u) =>
//       u.accesses?.forEach((a) => {
//         if (a.project_id && !projectNameCache[a.project_id]) ids.add(a.project_id);
//       })
//     );
//     ids.forEach((id) => fetchProjectName(id));
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [users]);

//   const getUniqueRoles = () => {
//     const roles = new Set();
//     users.forEach((user) => {
//       user.accesses?.forEach((access) => {
//         access.roles?.forEach((role) => {
//           roles.add(role.role);
//         });
//       });
//     });
//     return Array.from(roles);
//   };

//   useEffect(() => {
//     let userData = null;
//     try {
//       const s = localStorage.getItem("USER_DATA");
//       if (s) userData = JSON.parse(s);
//     } catch {}
//     if (!userData) {
//       const token =
//         localStorage.getItem("ACCESS_TOKEN") ||
//         localStorage.getItem("TOKEN") ||
//         localStorage.getItem("token");
//       if (token) userData = decodeJWT(token);
//     }
//     const rolee =
//       localStorage.getItem("ROLE") ||
//       userData?.role ||
//       userData?.roles?.[0] ||
//       "";

//     const isSA =
//       (typeof rolee === "string" &&
//         rolee.toLowerCase().includes("super admin")) ||
//       userData?.superadmin === true ||
//       userData?.is_superadmin === true ||
//       userData?.is_staff === true;

//     setIsSuperAdmin(!!isSA);
//   }, []);

//   const getUniqueProjects = () => {
//     const ids = new Set();
//     users.forEach((user) => {
//       user.accesses?.forEach((access) => {
//         if (access.project_id) ids.add(access.project_id);
//       });
//     });
//     return Array.from(ids)
//       .map((id) => ({
//         id,
//         name: projectNameCache[id] || `Project ${id}`,
//       }))
//       .sort((a, b) => a.name.localeCompare(b.name));
//   };

//   const filteredUsers = users.filter((user) => {
//     const term = searchTerm.toLowerCase();

//     const matchesSearch =
//       user.username.toLowerCase().includes(term) ||
//       user.email?.toLowerCase().includes(term) ||
//       user.id.toString().includes(term) ||
//       user.accesses?.some((a) =>
//         (projectNameCache[a.project_id] || "").toLowerCase().includes(term)
//       );

//     const matchesRole =
//       roleFilter === "all" ||
//       user.accesses?.some((access) =>
//         access.roles?.some((role) => role.role === roleFilter)
//       );

//     const matchesProject =
//       projectFilter === "all" ||
//       user.accesses?.some(
//         (access) => String(access.project_id) === String(projectFilter)
//       );

//     return matchesSearch && matchesRole && matchesProject;
//   });

//   const getRoleColor = (role) => {
//     switch (role.toLowerCase()) {
//       case "maker":
//         return theme === "dark"
//           ? "bg-green-900 text-green-300"
//           : "bg-green-100 text-green-700";
//       case "inspector":
//         return theme === "dark"
//           ? "bg-blue-900 text-blue-300"
//           : "bg-blue-100 text-blue-700";
//       case "checker":
//         return theme === "dark"
//           ? "bg-orange-900 text-orange-300"
//           : "bg-orange-100 text-orange-700";
//       case "supervisor":
//         return theme === "dark"
//           ? "bg-purple-900 text-purple-300"
//           : "bg-purple-100 text-purple-700";
//       case "admin":
//         return theme === "dark"
//           ? "bg-red-900 text-red-300"
//           : "bg-red-100 text-red-700";
//       default:
//         return theme === "dark"
//           ? "bg-slate-700 text-slate-200"
//           : "bg-gray-100 text-gray-700";
//     }
//   };

//   const toggleRowExpansion = (userId) => {
//     setExpandedRows((prev) => ({
//       ...prev,
//       [userId]: !prev[userId],
//     }));
//   };

//   const showAccessRoles = !isSuperAdmin;
//   const [deletingId, setDeletingId] = useState(null);
// // PURPOSE rows can be either {id,name} or {id, client_id, purpose:{id,name}, ...}
// const normalizePurposesList = (rows) =>
//   (rows || []).map((row) =>
//     row?.purpose && typeof row.purpose === "object"
//       ? { id: row.purpose.id, name: row.purpose.name || `Purpose ${row.purpose.id}` }
//       : { id: row.id, name: row.name || `Purpose ${row.id}` }
//   );

//   const askDeleteUser = (user) => setConfirm({ open: true, user });

//   // --- EDIT FLOW ---

//   // When PROJECT changes → reload purposes, categories, buildings, zones, flats; reset purpose/phase/stage
//  useEffect(() => {
//   if (!editing.open) return;
//   const pid = editing.form.project_id;
//   if (!pid) {
//     setOptions(o => ({
//       ...o,
//       purposes: [],
//       phases: [],
//       stages: [],
//       categories: [],
//       buildings: [],
//       zones: [],
//       flats: [],
//     }));
//     return;
//   }

//   (async () => {
//     setLoadingOptions(true);

//     const [purposesRes, catRes, bRes, zRes, fRes] = await Promise.all([
//       safeGet(projectInstance.get(`purpose/get-purpose-details-by-project-id/${pid}/`)),
//       safeGet(projectInstance.get(`category-tree-by-project/?project=${pid}`)),
//       safeGet(projectInstance.get(`buildings/?project=${pid}`)),
//       safeGet(projectInstance.get(`zones/?project=${pid}`)),
//       safeGet(projectInstance.get(`flats/?project=${pid}`)),
//     ]);

//     const normalizedPurposes = normalizePurposesList(asList(purposesRes));

//     setOptions(o => ({
//       ...o,
//       purposes: normalizedPurposes,
//       categories: flattenCategoryTree(catRes?.data || []),
//       buildings: asList(bRes),
//       zones: asList(zRes),
//       flats: asList(fRes),
//       phases: [],
//       stages: [],
//     }));

//     // reset dependent fields
//     setEditing(s => ({
//       ...s,
//       form: { ...s.form, purpose_id: "", phase_id: "", stage_id: "" },
//     }));

//     setLoadingOptions(false);
//   })();
// }, [editing.open, editing.form.project_id]);



//   // When PURPOSE changes → reload phases; reset phase/stage
//   useEffect(() => {
//   if (!editing.open) return;
//   const purposeId = editing.form.purpose_id;
//   if (!purposeId) {
//     setOptions((o) => ({ ...o, phases: [], stages: [] }));
//     return;
//   }
//   (async () => {
//     setLoadingOptions(true);
//     const phRes = await safeGet(projectInstance.get(`phases/by-purpose/${purposeId}/`));
//     setOptions((o) => ({ ...o, phases: asList(phRes), stages: [] }));
//     setEditing((s) => ({ ...s, form: { ...s.form, phase_id: "", stage_id: "" } }));
//     setLoadingOptions(false);
//   })();
// }, [editing.open, editing.form.purpose_id]);


//   // When PHASE changes → reload stages; reset stage
//  useEffect(() => {
//   if (!editing.open) return;
//   const phaseId = editing.form.phase_id;
//   if (!phaseId) {
//     setOptions((o) => ({ ...o, stages: [] }));
//     return;
//   }
//   (async () => {
//     setLoadingOptions(true);
//     const stRes = await safeGet(projectInstance.get(`stages/by_phase/${phaseId}/`));
//     setOptions((o) => ({ ...o, stages: asList(stRes) }));
//     setEditing((s) => ({ ...s, form: { ...s.form, stage_id: "" } }));
//     setLoadingOptions(false);
//   })();
// }, [editing.open, editing.form.phase_id]);


//  const loadAllOptionsForEdit = async (userOrForm) => {
//   setLoadingOptions(true);

//   const a = userOrForm?.accesses?.[0] || editing?.form || {};
//   const projectId = a.project_id || "";

//   const projectsRes = await safeGet(projectInstance.get("projects/"));

//   let purposes = [];
//   let categories = [];
//   let buildings = [];
//   let zones = [];
//   let flats = [];

//   if (projectId) {
//     const purposesRes = await safeGet(
//       projectInstance.get(`purpose/get-purpose-details-by-project-id/${projectId}/`)
//     );
    
// const purposes = normalizePurposesList(asList(purposesRes));

//     const catRes = await safeGet(
//       projectInstance.get(`category-tree-by-project/?project=${projectId}`)
//     );
//     categories = flattenCategoryTree(catRes?.data || []);

//     const [bRes, zRes, fRes] = await Promise.all([
//       safeGet(projectInstance.get(`buildings/?project=${projectId}`)),
//       safeGet(projectInstance.get(`zones/?project=${projectId}`)),
//       safeGet(projectInstance.get(`flats/?project=${projectId}`)),
//     ]);
//     buildings = asList(bRes);
//     zones = asList(zRes);
//     flats = asList(fRes);
//   }

//   let phases = [];
//   if (a.purpose_id) {
//     const phRes = await safeGet(projectInstance.get(`phases/by-purpose/${a.purpose_id}/`));
//     phases = asList(phRes);
//   }

//   let stages = [];
//   if (a.phase_id) {
//     const stRes = await safeGet(projectInstance.get(`stages/by_phase/${a.phase_id}/`));
//     stages = asList(stRes);
//   }

//   setOptions({
//     projects: asList(projectsRes),
//     purposes,   // always {id,name}
//     phases,
//     stages,
//     categories,
//     buildings,
//     zones,
//     flats,
//   });

//   setLoadingOptions(false);
// };


//   const handleEditUser = async (userId) => {
//     const u = users.find((x) => x.id === userId);
//     if (!u) return;
//     const a = u.accesses?.[0] || {};
//     const roles = (a.roles || []).map((r) => r.role);

//     setEditing({
//       open: true,
//       user: u,
//       form: {
//         first_name: u.first_name || "",
//         last_name: u.last_name || "",
//         email: u.email || "",
//         phone_number: u.phone_number || "",
//         password: "",

//         project_id: a.project_id ?? a.project?.id ?? "",
//         active: a.active ?? true,
//         roles,

//         building_id: a.building_id ?? a.building?.id ?? "",
//         zone_id: a.zone_id ?? a.zone?.id ?? "",
//         flat_id: a.flat_id ?? a.flat?.id ?? "",
//         category: a.category ?? a.category_id ?? a.category?.id ?? "",

//         // ensure IDs, not objects
//         purpose_id: a.purpose_id ?? a.purpose?.id ?? "",
//         phase_id: a.phase_id ?? a.phase?.id ?? "",
//         stage_id: a.stage_id ?? a.stage?.id ?? "",
//       },
//     });

//     await loadAllOptionsForEdit(u);
//   };
// const purposes = options?.purposes ?? [];

//   const saveAccessFullPatch = async (userId, form) => {
//     const payload = {
//       user: {
//         first_name: form.first_name ?? undefined,
//         last_name: form.last_name ?? undefined,
//         email: form.email ?? undefined,
//         phone_number: form.phone_number ?? undefined,
//         password: form.password ?? undefined, // optional
//       },
//       access: {
//         project_id: form.project_id,
//         building_id: form.building_id ?? null,
//         zone_id: form.zone_id ?? null,
//         flat_id: form.flat_id ?? null,
//         active: form.active ?? true,
//         category: form.category ?? null,
//         purpose_id: form.purpose_id ?? null,
//         phase_id: form.phase_id ?? null,
//         stage_id: form.stage_id ?? null,
//         All_checklist: form.All_checklist ?? false,
//         CategoryLevel1: form.CategoryLevel1 ?? null,
//         CategoryLevel2: form.CategoryLevel2 ?? null,
//         CategoryLevel3: form.CategoryLevel3 ?? null,
//         CategoryLevel4: form.CategoryLevel4 ?? null,
//         CategoryLevel5: form.CategoryLevel5 ?? null,
//         CategoryLevel6: form.CategoryLevel6 ?? null,
//       },
//       roles: (form.roles || []).map((r) => ({ role: r })), // e.g. ["SUPERVISOR"]
//     };

//     try {
//       await axiosInstance.patch(`users/access-full-patch/${userId}/`, payload);
//       await fetchUsers();
//       alert("Access updated");
//     } catch (e) {
//       const msg = e?.response?.data ? JSON.stringify(e.response.data) : e.message;
//       alert(`Access update failed: ${msg}`);
//       throw e;
//     }
//   };
// const purposeNameOf = (p) =>
//   p?.purpose?.name ||
//   p?.name?.purpose?.name ||
//   p?.name?.name ||
//   p?.purpose_name ||
//   p?.name ||
//   `Purpose ${p?.id ?? ""}`;

// // state
// // const [selectedPurpose, setSelectedPurpose] = useState("");      // holds the NAME
// // const [selectedPurposeId, setSelectedPurposeId] = useState(null); // optional: holds the ID

// const handlePurposeChange = (e) => {
//   setSelectedPurpose(e.target.value); // name
//   const id = e.target.selectedOptions?.[0]?.dataset?.id;
//   setSelectedPurposeId(id ? Number(id) : null); // keep the id too (if you need it)
// };
//   return (
//     <>
//       <main className="w-full min-h-[calc(100vh-64px)] p-6 bg-transparent ">
//         <h2 className={`text-2xl font-bold mb-6 ${palette.text}`}>Users Management</h2>

//         {/* Header Stats */}
//         <div className={`rounded-lg ${palette.card} ${palette.shadow} p-4 mb-6 ${palette.border} border`}>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className={`text-center p-3 rounded-lg ${theme === "dark" ? "bg-blue-900" : "bg-blue-50"}`}>
//               <div className="text-2xl font-bold text-blue-600">{users.length}</div>
//               <div className={`text-sm ${palette.subtext}`}>Total Users Created</div>
//             </div>
//             <div className={`text-center p-3 rounded-lg ${theme === "dark" ? "bg-green-900" : "bg-green-50"}`}>
//               <div className="text-2xl font-bold text-green-600">
//                 {users.filter((u) => u.accesses?.length > 0).length}
//               </div>
//               <div className={`text-sm ${palette.subtext}`}>Users with Access</div>
//             </div>
//             <div className={`text-center p-3 rounded-lg ${theme === "dark" ? "bg-purple-900" : "bg-purple-50"}`}>
//               <div className="text-2xl font-bold text-purple-600">
//                 {getUniqueProjects().length}
//               </div>
//               <div className={`text-sm ${palette.subtext}`}>Projects Assigned</div>
//             </div>
//           </div>
//         </div>

//         {/* Search and Filters */}
//         <div className={`rounded-lg ${palette.card} ${palette.shadow} p-6 mb-6 ${palette.border} border`}>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             {/* Search */}
//             <div>
//               <label className={`block text-sm font-medium mb-2 ${palette.text}`}>Search Users</label>
//               <input
//                 type="text"
//                 placeholder="Search by username, email, or ID..."
//                 className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${palette.input} ${palette.border} border`}
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>
//             {/* Role Filter */}
//             <div>
//               <label className={`block text-sm font-medium mb-2 ${palette.text}`}>Filter by Role</label>
//               <select
//                 className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${palette.input} ${palette.border} border`}
//                 value={roleFilter}
//                 onChange={(e) => setRoleFilter(e.target.value)}
//               >
//                 <option value="all">All Roles</option>
//                 {getUniqueRoles().map((role) => (
//                   <option key={role} value={role}>
//                     {role.charAt(0).toUpperCase() + role.slice(1)}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             {/* Project Filter */}
//             <div>
//               <label className={`block text-sm font-medium mb-2 ${palette.text}`}>Filter by Project</label>
//               <select
//                 className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${palette.input} ${palette.border} border`}
//                 value={projectFilter}
//                 onChange={(e) => setProjectFilter(e.target.value)}
//               >
//                 <option value="all">All Projects</option>
//                 {getUniqueProjects().map((p) => (
//                   <option key={p.id} value={String(p.id)}>
//                     {p.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//           {/* Active Filters Display */}
//           {(searchTerm || roleFilter !== "all" || projectFilter !== "all") && (
//             <div className="mt-4 flex flex-wrap gap-2">
//               <span className={`text-sm ${palette.subtext}`}>Active filters:</span>
//               {searchTerm && (
//                 <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
//                   Search: "{searchTerm}"
//                 </span>
//               )}
//               {roleFilter !== "all" && (
//                 <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">
//                   Role: {roleFilter}
//                 </span>
//               )}
//               {projectFilter !== "all" && (
//                 <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm">
//                   Project: {projectNameCache[projectFilter] || `Project ${projectFilter}`}
//                 </span>
//               )}
//               <button
//                 onClick={() => {
//                   setSearchTerm("");
//                   setRoleFilter("all");
//                   setProjectFilter("all");
//                 }}
//                 className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm hover:bg-gray-200"
//               >
//                 Clear All
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Users Table */}
//         <div className={`rounded-lg ${palette.card} ${palette.shadow} overflow-hidden ${palette.border} border`}>
//           {loading ? (
//             <div className="flex items-center justify-center py-12">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
//               <span className={palette.subtext}>Loading users...</span>
//             </div>
//           ) : error ? (
//             <div className="text-center py-12">
//               <p className="text-red-500 mb-4">{error}</p>
//               <button
//                 onClick={fetchUsers}
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
//               >
//                 Try Again
//               </button>
//             </div>
//           ) : filteredUsers.length === 0 ? (
//             <div className="text-center py-12">
//               <p className={palette.subtext}>
//                 {users.length === 0 ? "No users created yet." : "No users match the current filters."}
//               </p>
//             </div>
//           ) : (
//             <>
//               {/* Desktop Table */}
//               <div className="hidden lg:block overflow-x-auto">
//                 <table className={`min-w-full divide-y ${palette.border} border`}>
//                   <thead className={theme === "dark" ? "bg-slate-900" : "bg-gray-50"}>
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">User Details</th>
//                       {showAccessRoles && (
//                         <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Access & Projects</th>
//                       )}
//                       {showAccessRoles && (
//                         <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Roles</th>
//                       )}
//                       <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
//                       <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody className={theme === "dark" ? "bg-slate-800" : "bg-white"}>
//                     {filteredUsers.map((user) => (
//                       <tr key={user.id} className={theme === "dark" ? "hover:bg-slate-700" : "hover:bg-gray-50"}>
//                         {/* User Details */}
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="flex items-center">
//                             <div className="flex-shrink-0 h-10 w-10">
//                               <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
//                                 {user.username.charAt(0).toUpperCase()}
//                               </div>
//                             </div>
//                             <div className="ml-4">
//                               <div className={`text-sm font-medium ${palette.text}`}>{user.username}</div>
//                               {user.email && <div className="text-sm text-gray-500">{user.email}</div>}
//                             </div>
//                           </div>
//                         </td>

//                         {/* Access & Projects */}
//                         {showAccessRoles && (
//                           <td className="px-6 py-4">
//                             {user.accesses && user.accesses.length > 0 ? (
//                               <div className="space-y-1">
//                                 {user.accesses.slice(0, 2).map((access, index) => (
//                                   <div key={index} className="text-sm">
//                                     <span className="font-medium text-gray-900">
//                                       {access.project_name || getProjectNameById(access.project_id)}
//                                     </span>
//                                     {/* <div className="text-xs text-gray-500">
//                                       {access.building_id && `Building12: ${access.building_id}`}
//                                       {access.zone_id && ` | Zone: ${access.zone_id}`}
//                                       {access.flat_id && ` | Flat: ${access.flat_id}`}
//                                     </div> */}
//                                   </div>
//                                 ))}
//                                 {user.accesses.length > 2 && (
//                                   <div className="text-xs text-blue-600">+{user.accesses.length - 2} more</div>
//                                 )}
//                               </div>
//                             ) : (
//                               <span className="text-sm text-gray-500">No access assigned</span>
//                             )}
//                           </td>
//                         )}

//                         {/* Roles */}
//                         {showAccessRoles && (
//                           <td className="px-6 py-4">
//                             <div className="flex flex-wrap gap-1">
//                               {user.accesses && user.accesses.length > 0 ? (
//                                 (() => {
//                                   const allRoles = new Set();
//                                   user.accesses.forEach((access) => {
//                                     access.roles?.forEach((role) => {
//                                       allRoles.add(role.role);
//                                     });
//                                   });
//                                   return Array.from(allRoles)
//                                     .slice(0, 3)
//                                     .map((role) => (
//                                       <span
//                                         key={role}
//                                         className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
//                                           role
//                                         )}`}
//                                       >
//                                         {role}
//                                       </span>
//                                     ));
//                                 })()
//                               ) : (
//                                 <span className="text-sm text-gray-500">No roles</span>
//                               )}
//                             </div>
//                           </td>
//                         )}

//                         {/* Status */}
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span
//                             className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                               user.has_access
//                                 ? theme === "dark"
//                                   ? "bg-green-900 text-green-300"
//                                   : "bg-green-100 text-green-800"
//                                 : theme === "dark"
//                                 ? "bg-red-900 text-red-300"
//                                 : "bg-red-100 text-red-800"
//                             }`}
//                           >
//                             {user.has_access ? "Active" : "Inactive"}
//                           </span>
//                         </td>

//                         {/* Actions */}
//                         <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                           <div className="flex justify-end gap-2">
//                             <button
//                               onClick={() => handleEditUser(user.id)}
//                               className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded text-xs"
//                             >
//                               Edit
//                             </button>
//                             <button
//                               onClick={() => askDeleteUser(user)}
//                               disabled={deletingId === user.id}
//                               className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-2 py-1 rounded text-xs disabled:opacity-60"
//                             >
//                               {deletingId === user.id ? "Deleting..." : "Delete"}
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Mobile Cards */}
//               <div className="lg:hidden">
//                 {filteredUsers.map((user) => (
//                   <div key={user.id} className={`border-b ${palette.border} p-4`}>
//                     <div className="flex items-center justify-between mb-3">
//                       <div className="flex items-center">
//                         <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold mr-3">
//                           {user.username.charAt(0).toUpperCase()}
//                         </div>
//                         <div>
//                           <div className={`font-medium ${palette.text}`}>{user.username}</div>
//                           <div className="text-sm text-gray-500">ID: {user.id}</div>
//                         </div>
//                       </div>
//                       <button onClick={() => toggleRowExpansion(user.id)} className="text-blue-600 hover:text-blue-800">
//                         {expandedRows[user.id] ? "▲" : "▼"}
//                       </button>
//                     </div>

//                     {!isSuperAdmin && (
//                       <div className="flex flex-wrap gap-1 mb-3">
//                         {user.accesses && user.accesses.length > 0 ? (
//                           (() => {
//                             const allRoles = new Set();
//                             user.accesses.forEach((access) => {
//                               access.roles?.forEach((role) => {
//                                 allRoles.add(role.role);
//                               });
//                             });
//                             return Array.from(allRoles)
//                               .slice(0, 2)
//                               .map((role) => (
//                                 <span
//                                   key={role}
//                                   className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
//                                     role
//                                   )}`}
//                                 >
//                                   {role}
//                                 </span>
//                               ));
//                           })()
//                         ) : (
//                           <span className="text-sm text-gray-500">No roles</span>
//                         )}
//                       </div>
//                     )}

//                     {expandedRows[user.id] && (
//                       <div className="mt-3 pt-3 border-t border-gray-100">
//                         {user.email && (
//                           <div className="mb-2">
//                             <span className="text-sm font-medium">Email: </span>
//                             <span className="text-sm text-gray-600">{user.email}</span>
//                           </div>
//                         )}
//                         <div className="mb-2">
//                           <span className="text-sm font-medium">Status: </span>
//                           <span
//                             className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
//                               user.has_access
//                                 ? theme === "dark"
//                                   ? "bg-green-900 text-green-300"
//                                   : "bg-green-100 text-green-800"
//                                 : theme === "dark"
//                                 ? "bg-red-900 text-red-300"
//                                 : "bg-red-100 text-red-800"
//                             }`}
//                           >
//                             {user.has_access ? "Active" : "Inactive"}
//                           </span>
//                         </div>
//                         {!isSuperAdmin && user.accesses && user.accesses.length > 0 && (
//                           <div className="mb-3">
//                             <div className="text-sm font-medium mb-1">Project Access:</div>
//                             {user.accesses.map((access, index) => (
//                               <div key={index} className="text-sm text-gray-600 ml-2">
//                                 • {access.project_name || getProjectNameById(access.project_id)}
//                                 {access.building_id && ` (Building: ${access.building_id})`}
//                                 {access.zone_id && ` (Zone: ${access.zone_id})`}
//                                 {access.flat_id && ` (Flat: ${access.flat_id})`}
//                               </div>
//                             ))}
//                           </div>
//                         )}
//                         <div className="flex gap-2">
//                           <button
//                             onClick={() => handleEditUser(user.id)}
//                             className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
//                           >
//                             Edit
//                           </button>
//                           <button
//                             onClick={() => askDeleteUser(user)}
//                             className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm"
//                           >
//                             Delete
//                           </button>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </>
//           )}
//         </div>

//         {/* Results Summary */}
//         {!loading && !error && (
//           <div className={`mt-4 text-sm ${palette.subtext} text-center`}>
//             Showing {filteredUsers.length} of {users.length} users
//           </div>
//         )}

//         {/* Delete confirmation modal */}
//         {confirm.open && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
//             <div className={`w-full max-w-md rounded-xl ${palette.card} ${palette.border} border p-6`}>
//               <h3 className="text-lg font-semibold mb-2">Delete user</h3>
//               <p className={`${palette.subtext} mb-6`}>
//                 Are you sure you want to delete{" "}
//                 <span className="font-medium">{confirm.user?.username}</span>? This cannot be undone.
//               </p>
//               <div className="flex justify-end gap-2">
//                 <button
//                   onClick={() => setConfirm({ open: false, user: null })}
//                   className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-800"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={async () => {
//                     if (!confirm.user) return;
//                     setDeletingId(confirm.user.id);
//                     try {
//                       await axiosInstance.delete(`users/${confirm.user.id}/`);
//                       setUsers((prev) => prev.filter((u) => u.id !== confirm.user.id));
//                       setConfirm({ open: false, user: null });
//                     } catch (e) {
//                       const msg = e?.response?.data ? JSON.stringify(e.response.data) : e.message;
//                       alert(`Delete failed: ${msg}`);
//                     } finally {
//                       setDeletingId(null);
//                     }
//                   }}
//                   disabled={deletingId === confirm.user?.id}
//                   className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
//                 >
//                   {deletingId === confirm.user?.id ? "Deleting..." : "Delete"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Edit user modal */}
//         {editing.open && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
//             <div className={`w-full max-w-2xl rounded-xl ${palette.card} ${palette.border} border p-0 max-h-[85vh] overflow-y-auto`}>
//               <div className="flex items-start justify-between mb-4">
//                 <h3 className="text-lg font-semibold">Edit User & Access</h3>
//                 <button
//                   onClick={() => setEditing((s) => ({ ...s, open: false }))}
//                   className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
//                 >
//                   ✕
//                 </button>
//               </div>

//               {/* Form */}
//               <div className="px-4 pb-4 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {/* User fields */}
//                 <div>
//                   <label className="block text-sm font-medium mb-1">First name</label>
//                   <input
//                     value={editing.form.first_name}
//                     onChange={(e) =>
//                       setEditing((s) => ({ ...s, form: { ...s.form, first_name: e.target.value } }))
//                     }
//                     className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
//                     placeholder="First name"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium mb-1">Last name</label>
//                   <input
//                     value={editing.form.last_name}
//                     onChange={(e) =>
//                       setEditing((s) => ({ ...s, form: { ...s.form, last_name: e.target.value } }))
//                     }
//                     className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
//                     placeholder="Last name"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium mb-1">Email</label>
//                   <input
//                     value={editing.form.email}
//                     onChange={(e) =>
//                       setEditing((s) => ({ ...s, form: { ...s.form, email: e.target.value } }))
//                     }
//                     className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
//                     placeholder="Email"
//                     type="email"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium mb-1">Phone</label>
//                   <input
//                     value={editing.form.phone_number}
//                     onChange={(e) =>
//                       setEditing((s) => ({ ...s, form: { ...s.form, phone_number: e.target.value } }))
//                     }
//                     className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
//                     placeholder="Phone"
//                   />
//                 </div>
//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium mb-1">Password (optional)</label>
//                   <input
//                     value={editing.form.password}
//                     onChange={(e) =>
//                       setEditing((s) => ({ ...s, form: { ...s.form, password: e.target.value } }))
//                     }
//                     className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
//                     placeholder="Set new password"
//                     type="password"
//                   />
//                 </div>

//                 {/* Access */}
//                 <div className="md:col-span-2 border-t pt-4">
//                   <div className="flex items-center gap-4 mb-3">
//                     <label className="text-sm font-medium">Active</label>
//                     <input
//                       type="checkbox"
//                       checked={!!editing.form.active}
//                       onChange={(e) =>
//                         setEditing((s) => ({ ...s, form: { ...s.form, active: e.target.checked } }))
//                       }
//                     />
//                   </div>

//                   {/* Roles */}
//                   <div className="mb-4">
//                     <label className="block text-sm font-medium mb-2">Roles</label>
//                     <div className="flex flex-wrap gap-2">
//                       {["MAKER", "INSPECTOR", "CHECKER", "SUPERVISOR", "ADMIN"].map((r) => {
//                         const checked = editing.form.roles?.includes(r);
//                         return (
//                           <label key={r} className="flex items-center gap-2 px-2 py-1 rounded border cursor-pointer">
//                             <input
//                               type="checkbox"
//                               checked={checked}
//                               onChange={(e) => {
//                                 setEditing((s) => {
//                                   const set = new Set(s.form.roles || []);
//                                   e.target.checked ? set.add(r) : set.delete(r);
//                                   return { ...s, form: { ...s.form, roles: Array.from(set) } };
//                                 });
//                               }}
//                             />
//                             <span className="text-sm">{r}</span>
//                           </label>
//                         );
//                       })}
//                     </div>
//                   </div>

//                   {/* Project + dependent fields */}
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {/* Project */}
//                     <div>
//                       <label className="block text-sm font-medium mb-1">Project</label>
//                       <select
//                         disabled={loadingOptions}
//                         className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
//                         value={editing.form.project_id || ""}
//                        onChange={(e) => {
//   const pid = e.target.value;
//   setEditing((s) => ({
//     ...s,
//     form: {
//       ...s.form,
//       project_id: toId(pid),
//       purpose_id: "",
//       phase_id: "",
//       stage_id: "",
//       building_id: "",
//       zone_id: "",
//       flat_id: "",
//       category: "",
//     },
//   }));
// }}
//                       >
//                         <option value="">Select project</option>
//                         {options.projects.map((p) => (
//                           <option key={p.id} value={p.id}>
//                             {labelOf(p, "Project")}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     {/* Category */}
//                     <div>
//                       <label className="block text-sm font-medium mb-1">Category</label>
//                       <select
//                         disabled={loadingOptions || !editing.form.project_id}
//                         className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
//                         value={editing.form.category || ""}
//                         onChange={(e) =>
//                           setEditing((s) => ({ ...s, form: { ...s.form, category: toId(e.target.value) } }))
//                         }
//                       >
//                         <option value="">—</option>
//                         {options.categories.map((c) => (
//                           <option key={c.id} value={c.id}>
//                             {c.label}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     {/* Building / Zone / Flat */}
//                     <div>
//                       <label className="block text-sm font-medium mb-1">Building</label>
//                       <select
//                         disabled={loadingOptions || !editing.form.project_id}
//                         className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
//                         value={editing.form.building_id || ""}
//                         onChange={(e) =>
//                           setEditing((s) => ({ ...s, form: { ...s.form, building_id: toId(e.target.value) } }))
//                         }
//                       >
//                         <option value="">—</option>
//                         {options.buildings.map((b) => (
//                           <option key={b.id} value={b.id}>
//                             {labelOf(b, "Building")}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium mb-1">Zone</label>
//                       <select
//                         disabled={loadingOptions || !editing.form.project_id}
//                         className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
//                         value={editing.form.zone_id || ""}
//                         onChange={(e) =>
//                           setEditing((s) => ({ ...s, form: { ...s.form, zone_id: toId(e.target.value) } }))
//                         }
//                       >
//                         <option value="">—</option>
//                         {options.zones.map((z) => (
//                           <option key={z.id} value={z.id}>
//                             {labelOf(z, "Zone")}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium mb-1">Flat</label>
//                       <select
//                         disabled={loadingOptions || !editing.form.project_id}
//                         className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
//                         value={editing.form.flat_id || ""}
//                         onChange={(e) =>
//                           setEditing((s) => ({ ...s, form: { ...s.form, flat_id: toId(e.target.value) } }))
//                         }
//                       >
//                         <option value="">—</option>
//                         {options.flats.map((f) => (
//                           <option key={f.id} value={f.id}>
//                             {labelOf(f, "Flat")}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     {/* Purpose / Phase / Stage */}
//                     <div>
                      
//                       <label className="block text-sm font-medium mb-1">Purpose</label>
                      
//                       <select
//   className="col-span-2 w-full p-2 border rounded"
//   value={selectedPurpose}
//   onChange={handlePurposeChange}
//   required
// >
//   <option value="">Select Purpose</option>
//   {purposes.map((p) => {
//     const name = purposeNameOf(p);
//     return (
//       <option key={p.id} value={name} data-id={p.id}>
//         {name}
//       </option>
//     );
//   })}
// </select>

//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium mb-1">Phase</label>
//                       <select
//     disabled={loadingOptions || !editing.form.purpose_id}
//     className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
//     value={editing.form.phase_id || ""}
//     onChange={(e) =>
//       setEditing(s => ({ ...s, form: { ...s.form, phase_id: toId(e.target.value) } }))
//     }
//   >
//     <option value="">—</option>
//     {options.phases.map((ph) => {
//       const label = nameOf(ph, "Phase"); // already safe
//       return (
//         <option key={ph.id} value={ph.id}>
//           {label}
//         </option>
//       );
//     })}
//   </select>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium mb-1">Stage</label>
//                      <select
//     disabled={loadingOptions || !editing.form.phase_id}
//     className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
//     value={editing.form.stage_id || ""}
//     onChange={(e) =>
//       setEditing(s => ({ ...s, form: { ...s.form, stage_id: toId(e.target.value) } }))
//     }
//   >
//     <option value="">—</option>
//     {options.stages.map((st) => {
//       const label = nameOf(st, "Stage"); // already safe
//       return (
//         <option key={st.id} value={st.id}>
//           {label}
//         </option>
//       );
//     })}
//   </select>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Footer */}
//               <div className="mt-6 flex justify-end gap-2">
//                 <button
//                   onClick={() => setEditing((s) => ({ ...s, open: false }))}
//                   className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-800"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={async () => {
//                     try {
//                       await saveAccessFullPatch(editing.user.id, editing.form);
//                       setEditing((s) => ({ ...s, open: false }));
//                     } catch {
//                       /* already alerted */
//                     }
//                   }}
//                   disabled={loadingOptions}
//                   className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
//                 >
//                   Save
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </main>
//     </>
//   );
// }

// export default UsersManagement;







import React, { useEffect, useState } from "react";
import Layout1 from "../components/Layout1";
import axiosInstance from "../api/axiosInstance";
import  projectInstance  from '../api/axiosInstance';
import { useTheme } from "../ThemeContext";
import axios from "axios";


function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [expandedRows, setExpandedRows] = useState({});

  const { theme } = useTheme();

  const palette =
    theme === "dark"
      ? {
          card: "bg-slate-800 border-slate-700 text-slate-100",
          border: "border-slate-700",
          text: "text-slate-100",
          subtext: "text-slate-300",
          shadow: "shadow-xl",
          input: "bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-400",
        }
      : {
          card: "bg-white border-gray-200 text-gray-900",
          border: "border-gray-200",
          text: "text-gray-900",
          subtext: "text-gray-600",
          shadow: "shadow",
          input: "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400",
        };

  // Fetch users created by current user
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/users-by-creator/");
      setUsers(res.data);
    } catch (err) {
      setError("Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);


  useEffect(() => {
    fetchUsers();
  }, []);
useEffect(() => {
  if (!users?.length) return;
  const ids = new Set();
  users.forEach(u => u.accesses?.forEach(a => {
    if (a.project_id && !projectNameCache[a.project_id]) ids.add(a.project_id);
  }));
  ids.forEach(id => fetchProjectName(id));
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [users]);

  const getUniqueRoles = () => {
    const roles = new Set();
    users.forEach((user) => {
      user.accesses?.forEach((access) => {
        access.roles?.forEach((role) => {
          roles.add(role.role);
        });
      });
    });
    return Array.from(roles);
  };
  useEffect(() => {
  let userData = null;
  try {
    const s = localStorage.getItem("USER_DATA");
    if (s) userData = JSON.parse(s);
  } catch {}

  if (!userData) {
    const token =
      localStorage.getItem("ACCESS_TOKEN") ||
      localStorage.getItem("TOKEN") ||
      localStorage.getItem("token");
    if (token) userData = decodeJWT(token);
  }

  const rolee =
    localStorage.getItem("ROLE") ||
    userData?.role ||
    userData?.roles?.[0] ||
    "";

  const isSA =
    (typeof rolee === "string" &&
      rolee.toLowerCase().includes("super admin")) ||
    userData?.superadmin === true ||
    userData?.is_superadmin === true ||
    userData?.is_staff === true;

  setIsSuperAdmin(!!isSA);
}, []);


  const getUniqueProjects = () => {
  const ids = new Set();
  users.forEach((user) => {
    user.accesses?.forEach((access) => {
      if (access.project_id) ids.add(access.project_id);
    });
  });

  return Array.from(ids)
    .map((id) => ({
      id,
      name: projectNameCache[id] || `Project ${id}`,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

  const filteredUsers = users.filter((user) => {
  const term = searchTerm.toLowerCase();

  const matchesSearch =
    user.username.toLowerCase().includes(term) ||
    user.email?.toLowerCase().includes(term) ||
    user.id.toString().includes(term) ||
    // 🟢 also match project NAMES
    user.accesses?.some((a) =>
      (projectNameCache[a.project_id] || "").toLowerCase().includes(term)
    );

  const matchesRole =
    roleFilter === "all" ||
    user.accesses?.some((access) =>
      access.roles?.some((role) => role.role === roleFilter)
    );

  const matchesProject =
    projectFilter === "all" ||
    user.accesses?.some(
      (access) => String(access.project_id) === String(projectFilter)
    );

  return matchesSearch && matchesRole && matchesProject;
});


  const getRoleColor = (role) => {
    switch (role.toLowerCase()) {
      case "maker":
        return theme === "dark"
          ? "bg-green-900 text-green-300"
          : "bg-green-100 text-green-700";
      case "inspector":
        return theme === "dark"
          ? "bg-blue-900 text-blue-300"
          : "bg-blue-100 text-blue-700";
      case "checker":
        return theme === "dark"
          ? "bg-orange-900 text-orange-300"
          : "bg-orange-100 text-orange-700";
      case "supervisor":
        return theme === "dark"
          ? "bg-purple-900 text-purple-300"
          : "bg-purple-100 text-purple-700";
      case "admin":
        return theme === "dark"
          ? "bg-red-900 text-red-300"
          : "bg-red-100 text-red-700";
      default:
        return theme === "dark"
          ? "bg-slate-700 text-slate-200"
          : "bg-gray-100 text-gray-700";
    }
  };


  const [projectNameCache, setProjectNameCache] = useState({}); // { [id]: "Project Name" }

const getProjectNameById = (id) =>
  projectNameCache[id] ? projectNameCache[id] : `Project ${id}`;

const fetchProjectName = async (id) => {
  if (!id || projectNameCache[id]) return; // already cached or bad id
  try {
    // ✅ use HTTPS and the /projects/projects/ path
    const res = await axios.get(`https://konstruct.world/projects/projects/${id}/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN") || ""}`,
      },
    });
    const name = res.data?.name || `Project ${id}`;
    setProjectNameCache((prev) => ({ ...prev, [id]: name }));
  } catch {
    // cache a readable fallback so we don't refetch forever
    setProjectNameCache((prev) => ({ ...prev, [id]: `Project ${id}` }));
  }
};

  const toggleRowExpansion = (userId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const showAccessRoles = !isSuperAdmin;

  const handleEditUser = (userId) => {
    alert(`Edit user ${userId} - Feature to be implemented`);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      alert(`Delete user ${userId} - Feature to be implemented`);
    }
  };

  const handleManageAccess = (userId) => {
    alert(`Manage access for user ${userId} - Feature to be implemented`);
  };


  // --- Helper for JWT decode (same as in your other file) ---
function decodeJWT(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}


  return (
    <>
      {/* Main content - fills the space, no max-w or mx-auto */}
      <main className="w-full min-h-[calc(100vh-64px)] p-6 bg-transparent">
        <h2 className={`text-2xl font-bold mb-6 ${palette.text}`}>Users Management</h2>

        {/* Header Stats */}
        <div className={`rounded-lg ${palette.card} ${palette.shadow} p-4 mb-6 ${palette.border} border`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`text-center p-3 rounded-lg ${theme === "dark" ? "bg-blue-900" : "bg-blue-50"}`}>
              <div className="text-2xl font-bold text-blue-600">{users.length}</div>
              <div className={`text-sm ${palette.subtext}`}>Total Users Created</div>
            </div>
            <div className={`text-center p-3 rounded-lg ${theme === "dark" ? "bg-green-900" : "bg-green-50"}`}>
              <div className="text-2xl font-bold text-green-600">
                {users.filter((u) => u.accesses?.length > 0).length}
              </div>
              <div className={`text-sm ${palette.subtext}`}>Users with Access</div>
            </div>
            <div className={`text-center p-3 rounded-lg ${theme === "dark" ? "bg-purple-900" : "bg-purple-50"}`}>
              <div className="text-2xl font-bold text-purple-600">
                {getUniqueProjects().length}
              </div>
              <div className={`text-sm ${palette.subtext}`}>Projects Assigned</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className={`rounded-lg ${palette.card} ${palette.shadow} p-6 mb-6 ${palette.border} border`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${palette.text}`}>Search Users</label>
              <input
                type="text"
                placeholder="Search by username, email, or ID..."
                className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${palette.input} ${palette.border} border`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Role Filter */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${palette.text}`}>Filter by Role</label>
              <select
                className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${palette.input} ${palette.border} border`}
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                {getUniqueRoles().map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            {/* Project Filter */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${palette.text}`}>Filter by Project</label>
              <select
  className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${palette.input} ${palette.border} border`}
  value={projectFilter}
  onChange={(e) => setProjectFilter(e.target.value)}
>
  <option value="all">All Projects</option>
  {getUniqueProjects().map((p) => (
    <option key={p.id} value={String(p.id)}>
      {p.name}
    </option>
  ))}
</select>
            </div>
          </div>
          {/* Active Filters Display */}
          {(searchTerm || roleFilter !== "all" || projectFilter !== "all") && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className={`text-sm ${palette.subtext}`}>Active filters:</span>
              {searchTerm && (
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                  Search: "{searchTerm}"
                </span>
              )}
              {roleFilter !== "all" && (
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">
                  Role: {roleFilter}
                </span>
              )}
             {projectFilter !== "all" && (
  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm">
    Project: {projectNameCache[projectFilter] || `Project ${projectFilter}`}
  </span>
)}
              <button
                onClick={() => {
                  setSearchTerm("");
                  setRoleFilter("all");
                  setProjectFilter("all");
                }}
                className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm hover:bg-gray-200"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className={`rounded-lg ${palette.card} ${palette.shadow} overflow-hidden ${palette.border} border`}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
              <span className={palette.subtext}>Loading users...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={fetchUsers}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Try Again
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className={palette.subtext}>
                {users.length === 0
                  ? "No users created yet."
                  : "No users match the current filters."}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className={`min-w-full divide-y ${palette.border} border`}>
                  <thead className={theme === "dark" ? "bg-slate-900" : "bg-gray-50"}>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">User Details</th>
                          {showAccessRoles && (

                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Access & Projects</th>
                          )}

                              {showAccessRoles && (

                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Roles</th>
                              )}
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={theme === "dark" ? "bg-slate-800" : "bg-white"}>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className={theme === "dark" ? "hover:bg-slate-700" : "hover:bg-gray-50"}>
                        {/* User Details */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                                {user.username.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className={`text-sm font-medium ${palette.text}`}>
                                {user.username}
                              </div>
                              {/* <div className="text-sm text-gray-500">
                                ID: {user.id}
                              </div> */}
                              {user.email && (
                                <div className="text-sm text-gray-500">
                                  {user.email}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        {/* Access & Projects */}
                              {showAccessRoles &&(

                        <td className="px-6 py-4">
                          {user.accesses && user.accesses.length > 0 ? (
                            <div className="space-y-1">
                              {user.accesses
                                .slice(0, 2)
                                .map((access, index) => (
                                  <div key={index} className="text-sm">
                                    <span className="font-medium text-gray-900">
  {access.project_name || getProjectNameById(access.project_id)}
                                    </span>
                                    <div className="text-xs text-gray-500">
                                      {access.building_id &&
                                        `Building: ${access.building_id}`}
                                      {access.zone_id &&
                                        ` | Zone: ${access.zone_id}`}
                                      {access.flat_id &&
                                        ` | Flat: ${access.flat_id}`}
                                    </div>
                                  </div>
                                ))}
                              {user.accesses.length > 2 && (
                                <div className="text-xs text-blue-600">
                                  +{user.accesses.length - 2} more
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">
                              No access assigned
                            </span>
                          )}
                        </td>
                              )}
                        {/* Roles */}
                              {showAccessRoles &&(

                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {user.accesses && user.accesses.length > 0 ? (
                              (() => {
                                const allRoles = new Set();
                                user.accesses.forEach((access) => {
                                  access.roles?.forEach((role) => {
                                    allRoles.add(role.role);
                                  });
                                });
                                return Array.from(allRoles)
                                  .slice(0, 3)
                                  .map((role) => (
                                    <span
                                      key={role}
                                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
                                        role
                                      )}`}
                                    >
                                      {role}
                                    </span>
                                  ));
                              })()
                            ) : (
                              <span className="text-sm text-gray-500">
                                No roles
                              </span>
                            )}
                          </div>
                        </td>
                              )}
                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.has_access
                                ? theme === "dark"
                                  ? "bg-green-900 text-green-300"
                                  : "bg-green-100 text-green-800"
                                : theme === "dark"
                                ? "bg-red-900 text-red-300"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.has_access ? "Active" : "Inactive"}
                          </span>
                        </td>
                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEditUser(user.id)}
                              className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded text-xs"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleManageAccess(user.id)}
                              className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-2 py-1 rounded text-xs"
                            >
                              Access
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-2 py-1 rounded text-xs"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile Cards */}
              <div className="lg:hidden">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`border-b ${palette.border} p-4`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold mr-3">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className={`font-medium ${palette.text}`}>
                            {user.username}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {user.id}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleRowExpansion(user.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {expandedRows[user.id] ? "▲" : "▼"}
                      </button>
                    </div>
                    {/* Roles Preview */}
                    {!isSuperAdmin && (

                    <div className="flex flex-wrap gap-1 mb-3">
                      {user.accesses && user.accesses.length > 0 ? (
                        (() => {
                          const allRoles = new Set();
                          user.accesses.forEach((access) => {
                            access.roles?.forEach((role) => {
                              allRoles.add(role.role);
                            });
                          });
                          return Array.from(allRoles)
                            .slice(0, 2)
                            .map((role) => (
                              <span
                                key={role}
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                                  role
                                )}`}
                              >
                                {role}
                              </span>
                            ));
                        })()
                      ) : (
                        <span className="text-sm text-gray-500">No roles</span>
                      )}
                    </div>
                    )}
                    {/* Expanded Details */}
                    {expandedRows[user.id] && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        {user.email && (
                          <div className="mb-2">
                            <span className="text-sm font-medium">
                              Email:{" "}
                            </span>
                            <span className="text-sm text-gray-600">
                              {user.email}
                            </span>
                          </div>
                        )}
                        <div className="mb-2">
                          <span className="text-sm font-medium">Status: </span>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              user.has_access
                                ? theme === "dark"
                                  ? "bg-green-900 text-green-300"
                                  : "bg-green-100 text-green-800"
                                : theme === "dark"
                                ? "bg-red-900 text-red-300"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.has_access ? "Active" : "Inactive"}
                          </span>
                        </div>
                        {!isSuperAdmin&&user.accesses && user.accesses.length > 0 && (
                          <div className="mb-3">
                            <div className="text-sm font-medium mb-1">
                              Project Access:
                            </div>
                            {user.accesses.map((access, index) => (
                              <div
                                key={index}
                                className="text-sm text-gray-600 ml-2"
                              >
• {access.project_name || getProjectNameById(access.project_id)}
                                {access.building_id &&
                                  ` (Building: ${access.building_id})`}
                                {access.zone_id &&
                                  ` (Zone: ${access.zone_id})`}
                                {access.flat_id &&
                                  ` (Flat: ${access.flat_id})`}
                              </div>
                            ))}
                          </div>
                        )}
                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditUser(user.id)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleManageAccess(user.id)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm"
                          >
                            Manage Access
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        {/* Results Summary */}
        {!loading && !error && (
          <div className={`mt-4 text-sm ${palette.subtext} text-center`}>
            Showing {filteredUsers.length} of {users.length} users
          </div>
        )}
      </main>
    </>
  );
}

export default UsersManagement;
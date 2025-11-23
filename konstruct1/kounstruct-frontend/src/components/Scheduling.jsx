// // Scheduling.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import { Plus, X } from "lucide-react";
// import toast from "react-hot-toast";
// import {
//   getSchedulingSetup,
//   createProjectSchedules,
//   listProjectSchedules,
//   myProjectSchedules,
//   Allprojects,
//   getProjectUserDetails,
//   getProjectsByOwnership,
// } from "../api";


// function useActiveProjectId() {
//   try {
//     const urlParams = new URLSearchParams(window.location.search);
//     const q = urlParams.get("project_id");
//     if (q) return Number(q);
//   } catch {}
//   const ls =
//     localStorage.getItem("ACTIVE_PROJECT_ID") ||
//     localStorage.getItem("PROJECT_ID");
//   return ls ? Number(ls) : null;
// }
// // put near other state hooks
// const MAX_REMIND_DAYS = 31;

// // days allowed = difference in days between start & end (non-negative), capped at 31


// // if current remind exceeds new max, clamp it


// const Scheduling = () => {
//   // ---- Project selection (role-aware) ----
//   const [projectId, setProjectId] = useState(useActiveProjectId());
//   const [projects, setProjects] = useState([]);

//   const setActiveProject = (idOrEmpty) => {
//     const id = idOrEmpty ? Number(idOrEmpty) : null;
//     setProjectId(id);
//     const url = new URL(window.location.href);
//     if (id) url.searchParams.set("project_id", String(id));
//     else url.searchParams.delete("project_id");
//     window.history.replaceState({}, "", url.toString());
//     if (id) {
//       localStorage.setItem("ACTIVE_PROJECT_ID", String(id));
//       localStorage.setItem("PROJECT_ID", String(id));
//     } else {
//       localStorage.removeItem("ACTIVE_PROJECT_ID");
//       localStorage.removeItem("PROJECT_ID");
//     }
//   };

//   useEffect(() => {
//   const loadProjects = async () => {
//     try {
//       const role = (localStorage.getItem("ROLE") || "").toLowerCase();
//       const userStr = localStorage.getItem("USER_DATA");
//       const user = userStr && userStr !== "undefined" ? JSON.parse(userStr) : null;

//       let resp = null;

//       if (role === "super admin") {
//         // all projects
//         resp = await Allprojects();
//       } else if (role === "manager") {
//         // ✅ Manager → ORGANIZATION-LEVEL projects
//         const orgId = user?.org || user?.organization_id;
//         if (!orgId) {
//           console.warn("[Scheduling] No organization_id on user; cannot fetch org projects.");
//           setProjects([]);
//           return;
//         }
//         resp = await getProjectsByOwnership({
//           organization_id: orgId,
//           company_id: null,
//           entity_id: null,
//         });
//       } else if (role === "admin") {
//         // ✅ Admin → also org-level list (same endpoint)
//         const orgId = user?.org || user?.organization_id;
//         if (!orgId) {
//           setProjects([]);
//           return;
//         }
//         resp = await getProjectsByOwnership({
//           organization_id: orgId,
//           company_id: null,
//           entity_id: null,
//         });
//       } else if (user) {
//         // Fallback: prefer org, otherwise company, otherwise entity
//         const orgId = user?.org || user?.organization_id || null;
//         const companyId = orgId ? null : user?.company_id || null;
//         const entityId = orgId || companyId ? null : user?.entity_id || null;

//         resp = await getProjectsByOwnership({
//           organization_id: orgId,
//           company_id: companyId,
//           entity_id: entityId,
//         });
//       }

//       const list = Array.isArray(resp?.data)
//         ? resp.data
//         : Array.isArray(resp?.data?.results)
//         ? resp.data.results
//         : resp?.data || [];

//       console.log("[Scheduling] projects:", list);
//       setProjects(list);

//       if (!projectId && list.length === 1) {
//         setActiveProject(list[0].id);
//       }
//     } catch (e) {
//       console.error("[Scheduling] loadProjects failed", e);
//       setProjects([]);
//       toast.error("Failed to fetch projects");
//     }
//   };

//   loadProjects();
//   // eslint-disable-next-line react-hooks/exhaustive-deps
// }, []);

//   // ---- Scheduling setup/list state ----
//   const [setupLoading, setSetupLoading] = useState(false);
//   const [setup, setSetup] = useState(null);
//   const [open, setOpen] = useState(false);

//   // form state
//   const [selectedStageId, setSelectedStageId] = useState("");
//   const [selectedMeta, setSelectedMeta] = useState({
//     phase_id: null,
//     purpose_id: null,
//   });

//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [remindDays, setRemindDays] = useState(0);
//   const [assignees, setAssignees] = useState([]);










// const allowedRemindMax = React.useMemo(() => {
//   if (!startDate || !endDate) return 0;
//   const s = new Date(startDate + "T00:00:00");
//   const e = new Date(endDate + "T00:00:00");
//   const diff = Math.floor((e - s) / 86400000); // ms → days
//   return Math.max(0, Math.min(MAX_REMIND_DAYS, diff));
// }, [startDate, endDate]);
// useEffect(() => {
//   if (remindDays > allowedRemindMax) {
//     setRemindDays(allowedRemindMax);
//   }
// }, [allowedRemindMax, remindDays]);
//   // selection state
//   const [activeBuildingId, setActiveBuildingId] = useState(null);
//   const [selectedBuildings, setSelectedBuildings] = useState(new Set());
//   const [selectedFloorsByBuilding, setSelectedFloorsByBuilding] = useState({});
//   const [activeLevelId, setActiveLevelId] = useState(null);
//   const [selectedFlatsByLevel, setSelectedFlatsByLevel] = useState({});

//   // lists
//   const [listLoading, setListLoading] = useState(false);
//   const [schedulesList, setSchedulesList] = useState(null);
//   const [myList, setMyList] = useState(null);
//   const [tab, setTab] = useState("all"); // "all" | "my"

//   // ---- Load setup ----
//   useEffect(() => {
//     if (!projectId) return;
//     const load = async () => {
//       try {
//         setSetupLoading(true);
//         const { data } = await getSchedulingSetup(projectId);
//         setSetup(data);
//       } catch (e) {
//         console.error(e);
//         toast.error("Failed to load scheduling setup");
//       } finally {
//         setSetupLoading(false);
//       }
//     };
//     load();
//   }, [projectId]);

//   // ---- Load lists ----
//  // ---- Load lists (tab-aware) ----
// const fetchActiveTab = async () => {
//   if (!projectId) return;
//   try {
//     setListLoading(true);
//     if (tab === "all") {
//       const { data } = await listProjectSchedules(projectId);
//       setSchedulesList(data);
//     } else {
//       const { data } = await myProjectSchedules(projectId); // ✅ /v2/scheduling/my/
//       setMyList(data);
//     }
//   } catch (e) {
//     console.error(e);
//     toast.error("Failed to load schedules");
//   } finally {
//     setListLoading(false);
//   }
// };


//  useEffect(() => {
//   console.log("[Scheduling] projectId =", projectId, "tab =", tab);
//   fetchActiveTab();
//   // eslint-disable-next-line react-hooks/exhaustive-deps
// }, [projectId, tab]);


//   // ---- Derived options ----
//   const stageOptions = useMemo(() => {
//     if (!setup?.purposes?.length) return [];
//     const opts = [];
//     setup.purposes.forEach((p) => {
//       p.phases?.forEach((ph) => {
//         ph.stages?.forEach((st) => {
//           opts.push({
//             value: String(st.id),
//             label: `${ph.name} — ${st.name}`,
//             phase_id: ph.id,
//             purpose_id: p.id,
//           });
//         });
//       });
//     });
//     return opts.sort((a, b) => a.label.localeCompare(b.label));
//   }, [setup]);
//   const normRole = (r) =>
//   String(typeof r === "string" ? r : r?.role || r?.name || "")
//     .trim()
//     .toLowerCase()
//     .replace(/\s+/g, "_");

// const isExcludedUser = (u) => {
//   const roles = Array.isArray(u?.roles) ? u.roles : [];
//   return roles.some((r) => {
//     const n = normRole(r);
//     return n === "staff" || n === "security_guard";
//   });
// };



// const users = useMemo(() => {
//   const list = Array.isArray(setup?.users) ? setup.users : [];
//   return list.filter((u) => !isExcludedUser(u));
// }, [setup]);
//   const buildings = useMemo(() => setup?.structure?.buildings || [], [setup]);

//   // ---- Helpers for structure navigation ----
//   const activeBuilding = useMemo(
//     () => buildings.find((b) => b.id === activeBuildingId) || null,
//     [buildings, activeBuildingId]
//   );


//   // --- helpers to sort floors numerically: B2 < B1 < G(0) < 1 < 2 < 3 ...
// const floorNumberFromLevel = (lvl) => {
//   // prefer explicit numeric fields if backend provides them
//   const numericFields = [
//     lvl.order,
//     lvl.sequence,
//     lvl.seq,
//     lvl.index,
//     lvl.position,
//     lvl.level_no,
//     lvl.level_number,
//     lvl.number,
//     lvl.floor_no,
//     lvl.floor_number,
//   ];
//   for (const v of numericFields) {
//     const n = Number(v);
//     if (Number.isFinite(n)) return n;
//   }

//   // fallback: parse from name like "Floor 12", "Level 3", "B2", "G", "Ground"
//   const name = String(lvl?.name || "").trim().toLowerCase();

//   // Ground/G
//   if (/^(g|ground)\b/.test(name)) return 0;

//   // Basement: B2, Basement 1, etc. (make basements negative for correct ordering)
//   const mb = name.match(/^b(?:asement)?\s*(\d+)/);
//   if (mb) return -Number(mb[1]);

//   // Any first signed/unsigned integer in the name
//   const m = name.match(/-?\d+/);
//   if (m) return Number(m[0]);

//   // Unknown → push to the end
//   return Number.MAX_SAFE_INTEGER;
// };

// const byFloorAsc = (a, b) => floorNumberFromLevel(a) - floorNumberFromLevel(b);

//   const activeFloors = useMemo(() => {
//    const arr = activeBuilding?.levels || [];
//    return [...arr].sort(byFloorAsc);
//  }, [activeBuilding]);
//   const activeLevel = useMemo(
//     () => activeFloors.find((l) => l.id === activeLevelId) || null,
//     [activeFloors, activeLevelId]
//   );
//   const activeFlats = useMemo(
//     () => activeLevel?.level_orphan_flats || [],
//     [activeLevel]
//   );

//   // ---- Selection handlers ----
//   const toggleBuilding = (bId) => {
//     setActiveBuildingId(bId);
//     setActiveLevelId(null);
//     setSelectedFlatsByLevel((prev) => ({ ...prev })); // keep existing

//     setSelectedBuildings((prev) => {
//       const next = new Set(prev);
//       next.has(bId) ? next.delete(bId) : next.add(bId);
//       return next;
//     });
//   };

//   const isLevelSelected = (bId, levelId) =>
//     (selectedFloorsByBuilding[bId]?.has(levelId)) || false;

//   const toggleLevel = (bId, levelId) => {
//     setActiveLevelId(levelId);
//     setSelectedFloorsByBuilding((prev) => {
//       const prevSet = prev[bId] ? new Set(prev[bId]) : new Set();
//       prevSet.has(levelId) ? prevSet.delete(levelId) : prevSet.add(levelId);
//       return { ...prev, [bId]: prevSet };
//     });
//   };





// // normalize a role coming as "STAFF", "security guard", {role:"SECURITY_GUARD"}, etc.




  
//   const selectAllFloorsForActiveBuilding = (checked) => {
//     if (!activeBuilding) return;
//     setSelectedFloorsByBuilding((prev) => {
//       if (checked) {
//         return {
//           ...prev,
//           [activeBuilding.id]: new Set(activeFloors.map((f) => f.id)),
//         };
//       }
//       return { ...prev, [activeBuilding.id]: new Set() };
//     });
//   };

//   const isFlatSelected = (levelId, flatId) =>
//     (selectedFlatsByLevel[levelId]?.has(flatId)) || false;

//   const toggleFlat = (levelId, flatId) => {
//     setSelectedFlatsByLevel((prev) => {
//       const prevSet = prev[levelId] ? new Set(prev[levelId]) : new Set();
//       prevSet.has(flatId) ? prevSet.delete(flatId) : prevSet.add(flatId);
//       return { ...prev, [levelId]: prevSet };
//     });
//   };

//   const selectAllFlatsForActiveLevel = (checked) => {
//     if (!activeLevel) return;
//     setSelectedFlatsByLevel((prev) => {
//       if (checked) {
//         return {
//           ...prev,
//           [activeLevel.id]: new Set(activeFlats.map((f) => f.id)),
//         };
//       }
//       return { ...prev, [activeLevel.id]: new Set() };
//     });
//   };

//   // ---- Preview mapping ----
//   const mappingsPreview = useMemo(() => {
//     const rows = [];
//     selectedBuildings.forEach((bId) => {
//       const building = buildings.find((b) => b.id === bId);
//       if (!building) return;
//       const selectedLevels = Array.from(selectedFloorsByBuilding[bId] || []);
//       selectedLevels.forEach((lvlId) => {
//         const level = building.levels.find((l) => l.id === lvlId);
//         if (!level) return;

//         const pickedFlats = Array.from(selectedFlatsByLevel[lvlId] || []);
//         const flats =
//           pickedFlats.length > 0
//             ? level.level_orphan_flats.filter((f) => pickedFlats.includes(f.id))
//             : level.level_orphan_flats;

//         rows.push({
//           building_id: building.id,
//           building_name: building.name,
//           level_id: level.id,
//           level_name: level.name,
//           flats: flats.map((f) => ({ flat_id: f.id, number: f.number })),
//         });
//       });
//     });
//     return rows;
//   }, [
//     selectedBuildings,
//     buildings,
//     selectedFloorsByBuilding,
//     selectedFlatsByLevel,
//   ]);

//   // ---- Submit ----
//   const onSubmit = async () => {
//     if (!projectId) return toast.error("No project selected");
//     if (!selectedStageId) return toast.error("Please select a Stage");
//     if (!startDate || !endDate)
//       return toast.error("Please set Start & End dates");
//     if (new Date(endDate) < new Date(startDate))
//       return toast.error("End Date cannot be before Start Date");
//     if (mappingsPreview.length === 0)
//       return toast.error(
//         "Please select at least one Floor (and Flats if needed)"
//       );
    

//     const stageMeta = stageOptions.find(
//       (s) => s.value === String(selectedStageId)
//     );
//     if (!stageMeta) return toast.error("Stage selection invalid");

//     const mappings = mappingsPreview.map((row) => ({
//       scope: { building_id: row.building_id, level_id: row.level_id },
//       targets: row.flats.map((f) => ({ flat_id: f.flat_id })),
//       meta: {
//         batch: `${row.building_name}-${row.level_name} (${row.flats.length})`,
//       },
//     }));

//     const payload = {
//       schedules: [
//         {
//           project_id: projectId,
//           purpose_id: stageMeta.purpose_id,
//           phase_id: stageMeta.phase_id,
//           stage_id: Number(selectedStageId),
//           start_date: startDate,
//           end_date: endDate,
//           remind_before_days: Number(remindDays || 0),
//           is_active: true,
//           assignees: assignees.map(Number),
//           mappings,
//         },
//       ],
//     };

//     try {
//       await createProjectSchedules(payload);
//       toast.success("Schedule created");
//       setOpen(false);
//       fetchActiveTab();
//     } catch (e) {
//       console.error(e);
//       toast.error(e?.response?.data?.detail || "Failed to create schedule");
//     }
//   };

//   // ---- UI ----
//   const headerStyle =
//     "text-[13px] font-semibold tracking-wide text-purple-800 mb-2";
//   const boxStyle =
//     "rounded-lg p-3 bg-purple-50/50 border border-purple-100 h-[340px] overflow-auto";

//   return (
//     <div className="p-4 md:p-6">
//       <div className="flex items-center justify-between mb-4">
//         <div className="flex flex-col gap-2">
//           <h1 className="text-2xl font-semibold">Scheduling</h1>
//           <div className="flex items-center gap-2">
//             <label className="text-sm opacity-70">Project</label>
//             <select
//               className="border rounded-md px-3 py-2"
//               value={projectId ?? ""}
//               onChange={(e) => setActiveProject(e.target.value)}
//             >
//               <option value="">Select a project…</option>
//               {projects.map((p) => (
//                 <option key={p.id} value={p.id}>
//                   {p.name}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         <button
//           onClick={() => setOpen(true)}
//           className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-purple-700 text-white hover:bg-purple-600 transition"
//           disabled={!projectId || setupLoading}
//         >
//           <Plus className="w-4 h-4" />
//           Add Schedule
//         </button>
//       </div>

//       {/* Modal */}
//       {open && (
//         <div className="fixed inset-0 z-[1000]">
//           <div
//             className="absolute inset-0 bg-black/40"
//             onClick={() => setOpen(false)}
//           />
//           <div className="absolute left-1/2 top-6 -translate-x-1/2 w-[95vw] max-w-6xl bg-white rounded-xl shadow-2xl border">
//             <div className="flex items-center justify-between px-5 py-4 border-b">
//               <h2 className="text-xl font-semibold">Add Schedule</h2>
//               <button
//                 onClick={() => setOpen(false)}
//                 className="p-1 hover:bg-black/5 rounded"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             <div className="px-5 py-4 space-y-4">
//               {/* Top row: stage/dates/remind/assignees */}
//               <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
//                 {/* Stage */}
//                 <div className="flex flex-col">
//                   <label className="text-sm font-medium mb-1">Stage</label>
//                   <select
//                     className="border rounded-md px-3 py-2"
//                     value={selectedStageId}
//                     onChange={(e) => {
//                       const val = e.target.value;
//                       setSelectedStageId(val);
//                       const m = stageOptions.find((s) => s.value === val);
//                       setSelectedMeta({
//                         phase_id: m?.phase_id || null,
//                         purpose_id: m?.purpose_id || null,
//                       });
//                     }}
//                   >
//                     <option value="">Select Stage</option>
//                     {stageOptions.map((opt) => (
//                       <option key={opt.value} value={opt.value}>
//                         {opt.label}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Start Date
//                 <div className="flex flex-col">
//                   <label className="text-sm font-medium mb-1">Start Date</label>
//                   <input
//                     type="date"
//                     className="border rounded-md px-3 py-2"
//                     value={startDate}
//                     onChange={(e) => setStartDate(e.target.value)}
//                   />
//                 </div> */}
//                 {/* Start Date */}
// <div className="flex flex-col">
//   <label className="text-sm font-medium mb-1">Start Date</label>
//   <input
//     type="date"
//     className="border rounded-md px-3 py-2"
//     value={startDate}
//     onChange={(e) => {
//       const val = e.target.value;
//       setStartDate(val);
//       // if end < new start, clear end & reset remind
//       if (endDate && new Date(endDate) < new Date(val)) {
//         setEndDate("");
//         setRemindDays(0);
//         toast.error("End Date cannot be before Start Date");
//       }
//     }}
//   />
// </div>


//                 {/* End Date */}
//                 {/* <div className="flex flex-col">
//                   <label className="text-sm font-medium mb-1">End Date</label>
//                   <input
//                     type="date"
//                     className="border rounded-md px-3 py-2"
//                     value={endDate}
//                     onChange={(e) => setEndDate(e.target.value)}
//                   />
//                 </div> */}
//                 {/* End Date */}
// <div className="flex flex-col">
//   <label className="text-sm font-medium mb-1">End Date</label>
//   <input
//     type="date"
//     className="border rounded-md px-3 py-2"
//     value={endDate}
//     min={startDate || undefined}  // ⬅️ blocks picking before start
//     onChange={(e) => {
//       const val = e.target.value;
//       if (startDate && new Date(val) < new Date(startDate)) {
//         toast.error("End Date cannot be before Start Date");
//         return;
//       }
//       setEndDate(val);
//     }}
//   />
// </div>


//                 {/* Remind */}
//                 {/* <div className="flex flex-col">
//                   <label className="text-sm font-medium mb-1">
//                     Remind Days Before
//                   </label>
//                   <input
//                     type="number"
//                     min={0}
//                     className="border rounded-md px-3 py-2"
//                     placeholder="0"
//                     value={remindDays}
//                     onChange={(e) => setRemindDays(e.target.value)}
//                   />
//                 </div> */}
//                 {/* Remind */}
// <div className="flex flex-col">
//   <label className="text-sm font-medium mb-1">
//     Remind Days Before
//     <span className="opacity-60"> (0–{allowedRemindMax})</span>
//   </label>
//   <select
//     className="border rounded-md px-3 py-2"
//     value={String(remindDays)}
//     disabled={!startDate || !endDate}   // need dates first
//     onChange={(e) => setRemindDays(Number(e.target.value))}
//   >
//     {Array.from({ length: allowedRemindMax + 1 }, (_, i) => (
//       <option key={i} value={i}>{i}</option>
//     ))}
//   </select>
//   <p className="text-xs opacity-70 mt-1">
//     Only within the selected date range (max {MAX_REMIND_DAYS}).
//   </p>
// </div>


//                 {/* Assignees */}
//                {/* Assignees */}
// <div className="flex flex-col">
//   <label className="text-sm font-medium mb-1">Assignees</label>
//   <AssigneeDropdown
//     users={users}
//     value={assignees}
//     onChange={(arr) => setAssignees(arr)}
//   />
// </div>


//               </div>

//               {/* 4 columns */}
//               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                 {/* TOWERS */}
//                 <div>
//                   <div className={headerStyle}>SELECT TOWER</div>
//                   <div className={boxStyle}>
//                     {buildings.map((b) => {
//                       const active = selectedBuildings.has(b.id);
//                       return (
//                         <button
//                           key={b.id}
//                           onClick={() => toggleBuilding(b.id)}
//                           className={`w-full text-left px-3 py-2 rounded mb-2 border ${
//                             active
//                               ? "bg-purple-200 border-purple-400"
//                               : "bg-white hover:bg-purple-50"
//                           }`}
//                         >
//                           {b.name}
//                         </button>
//                       );
//                     })}
//                     {buildings.length === 0 && (
//                       <div className="text-sm opacity-60">No towers</div>
//                     )}
//                   </div>
//                 </div>

//                 {/* FLOORS */}
//                 <div>
//                   <div className="flex items-center gap-2">
//                     <input
//                       id="selectAllFloors"
//                       type="checkbox"
//                       className="h-4 w-4"
//                       onChange={(e) =>
//                         selectAllFloorsForActiveBuilding(e.target.checked)
//                       }
//                       disabled={!activeBuilding}
//                     />
//                     <label htmlFor="selectAllFloors" className={headerStyle}>
//                       SELECT FLOOR
//                     </label>
//                   </div>
//                   <div className={boxStyle}>
//                     {!activeBuilding && (
//                       <div className="text-sm opacity-60">
//                         Select a tower to load floors.
//                       </div>
//                     )}
//                     {activeBuilding &&
//                       activeFloors.map((lvl) => {
//                         const selected = isLevelSelected(
//                           activeBuilding.id,
//                           lvl.id
//                         );
//                         return (
//                           <button
//                             key={lvl.id}
//                             onClick={() =>
//                               toggleLevel(activeBuilding.id, lvl.id)
//                             }
//                             className={`w-full text-left px-3 py-2 rounded mb-2 border ${
//                               selected
//                                 ? "bg-purple-200 border-purple-400"
//                                 : "bg-white hover:bg-purple-50"
//                             }`}
//                           >
//                             {lvl.name}
//                           </button>
//                         );
//                       })}
//                   </div>
//                 </div>

//                 {/* FLATS */}
//                 <div>
//                   <div className="flex items-center gap-2">
//                     <input
//                       id="selectAllFlats"
//                       type="checkbox"
//                       className="h-4 w-4"
//                       onChange={(e) =>
//                         selectAllFlatsForActiveLevel(e.target.checked)
//                       }
//                       disabled={!activeLevel}
//                     />
//                     <label htmlFor="selectAllFlats" className={headerStyle}>
//                       SELECT FLAT
//                     </label>
//                   </div>
//                   <div className={boxStyle}>
//                     {!activeLevel && (
//                       <div className="text-sm opacity-60">
//                         Select a floor to load flats.
//                       </div>
//                     )}
//                     {activeLevel &&
//                       activeFlats.map((f) => {
//                         const selected = isFlatSelected(activeLevel.id, f.id);
//                         return (
//                           <label
//                             key={f.id}
//                             className={`flex items-center gap-2 px-3 py-2 rounded mb-2 border cursor-pointer ${
//                               selected
//                                 ? "bg-purple-200 border-purple-400"
//                                 : "bg-white hover:bg-purple-50"
//                             }`}
//                           >
//                             <input
//                               type="checkbox"
//                               checked={selected}
//                               onChange={() => toggleFlat(activeLevel.id, f.id)}
//                             />
//                             <span>{f.number}</span>
//                           </label>
//                         );
//                       })}
//                   </div>
//                 </div>

//                 {/* PREVIEW */}
//                 <div>
//                   <div className={headerStyle}>PREVIEW</div>
//                   <div className={boxStyle}>
//                     {mappingsPreview.length === 0 && (
//                       <div className="text-sm opacity-60">
//                         Your selection will appear here.
//                       </div>
//                     )}
//                     <ul className="space-y-2 text-sm">
//                       {mappingsPreview.map((row, idx) => (
//                         <li
//                           key={`${row.building_id}-${row.level_id}-${idx}`}
//                           className="bg-white rounded border p-2"
//                         >
//                           <div className="font-medium">
//                             {row.building_name} → {row.level_name}
//                           </div>
//                           <div className="opacity-70">
//                             Flats:{" "}
//                             {row.flats.length > 0
//                               ? row.flats.map((f) => f.number).join(", ")
//                               : "All"}
//                           </div>
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                 </div>
//               </div>

//               {/* Footer */}
//               <div className="flex justify-end pt-2">
//                 <button
//                   onClick={onSubmit}
//                   className="px-5 py-2 rounded-md bg-purple-800 text-white hover:bg-purple-700"
//                 >
//                   SET SCHEDULE
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Lists */}
//       <div className="mt-6">
//         <div className="flex items-center gap-2 mb-3">
//           <button
//             onClick={() => setTab("all")}
//             className={`px-3 py-1.5 rounded border ${
//               tab === "all"
//                 ? "bg-purple-700 text-white border-purple-700"
//                 : "bg-white"
//             }`}
//           >
//             All Schedules
//           </button>
//           <button
//             onClick={() => setTab("my")}
//             className={`px-3 py-1.5 rounded border ${
//               tab === "my"
//                 ? "bg-purple-700 text-white border-purple-700"
//                 : "bg-white"
//             }`}
//           >
//             My Schedules
//           </button>
//           <button
//             onClick={fetchActiveTab}
//             className="ml-auto px-3 py-1.5 rounded border hover:bg-purple-50"
//             disabled={listLoading}
//           >
//             Refresh
//           </button>
//         </div>

//         <div className="rounded-lg border bg-white">
//           {listLoading ? (
//             <div className="p-4 text-sm opacity-70">Loading…</div>
//           ) : (
//             <div className="p-0">
//               <ScheduleListSmart data={tab === "all" ? schedulesList : myList} />
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // Table renderer / fallback
// function ScheduleListSmart({ data }) {
//   if (!data) {
//     return <div className="p-4 text-sm opacity-70">No data</div>;
//   }

//   const arr = Array.isArray(data)
//     ? data
//     : Array.isArray(data?.results)
//     ? data.results
//     : data?.schedules || data?.items || [];

// //   if (!Array.isArray(arr) || arr.length === 0) {
// //     return (
// //       <pre className="p-4 text-xs overflow-auto">
// //         {JSON.stringify(data, null, 2)}
// //       </pre>
// //     );
// //   }

//   return (
//     <div className="overflow-auto">
//       <table className="min-w-full text-sm">
//         <thead className="bg-purple-50">
//           <tr>
//             <th className="text-left px-3 py-2">Stage</th>
//             <th className="text-left px-3 py-2">Dates</th>
//             <th className="text-left px-3 py-2">Remind</th>
//             <th className="text-left px-3 py-2">Assignees</th>
//             <th className="text-left px-3 py-2">Mappings</th>
//           </tr>
//         </thead>
//         <tbody>
//           {arr.map((row, i) => (
//             <tr key={row.id || i} className="border-t">
//               <td className="px-3 py-2">
//                 {row?.stage?.name || row?.stage_name || row?.stage_id || "-"}
//               </td>
//               <td className="px-3 py-2">
//                 {(row?.start_date || row?.start) ?? "-"} →{" "}
//                 {(row?.end_date || row?.end) ?? "-"}
//               </td>
//               <td className="px-3 py-2">{row?.remind_before_days ?? "-"}</td>
//               <td className="px-3 py-2">
//                 {Array.isArray(row?.assignees) ? row.assignees.length : "-"}
//               </td>
//               <td className="px-3 py-2">
//                 {Array.isArray(row?.mappings) ? row.mappings.length : "-"}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }



// function AssigneeDropdown({ users = [], value = [], onChange }) {
//   const [open, setOpen] = React.useState(false);
//   const [q, setQ] = React.useState("");
//   const ref = React.useRef(null);

//   // close on outside click
//   React.useEffect(() => {
//     const onDoc = (e) => {
//       if (ref.current && !ref.current.contains(e.target)) setOpen(false);
//     };
//     document.addEventListener("mousedown", onDoc);
//     return () => document.removeEventListener("mousedown", onDoc);
//   }, []);

//   const filtered = React.useMemo(() => {
//     const needle = q.trim().toLowerCase();
//     if (!needle) return users;
//     return users.filter((u) => {
//       const roles = Array.isArray(u.roles) ? u.roles.join(", ") : "";
//       return (
//         (u.name || "").toLowerCase().includes(needle) ||
//         String(u.user_id).includes(needle) ||
//         roles.toLowerCase().includes(needle)
//       );
//     });
//   }, [users, q]);

//   const filteredIds = React.useMemo(
//     () => filtered.map((u) => Number(u.user_id)),
//     [filtered]
//   );
//   const allFilteredSelected =
//     filteredIds.length > 0 &&
//     filteredIds.every((id) => value.includes(Number(id)));

//   const toggle = (id) => {
//     const idN = Number(id);
//     const has = value.includes(idN);
//     if (has) onChange(value.filter((v) => v !== idN));
//     else onChange([...value, idN]);
//   };

//   const selectAllFiltered = () => {
//     if (allFilteredSelected) {
//       // unselect all currently filtered
//       onChange(value.filter((v) => !filteredIds.includes(Number(v))));
//     } else {
//       // add all filtered
//       const merged = new Set([...value, ...filteredIds]);
//       onChange(Array.from(merged));
//     }
//   };

//   const clearAll = () => onChange([]);

//   const summary = React.useMemo(() => {
//     if (!value.length) return "Select assignees…";
//     const names = users
//       .filter((u) => value.includes(Number(u.user_id)))
//       .map((u) => u.name);
//     if (names.length <= 2) return names.join(", ");
//     return `${names.slice(0, 2).join(", ")} +${names.length - 2} more`;
//   }, [users, value]);

//   return (
//     <div ref={ref} className="relative">
//       <button
//         type="button"
//         onClick={() => setOpen((v) => !v)}
//         className="w-full border rounded-md px-3 py-2 text-left flex items-center justify-between hover:bg-purple-50"
//       >
//         <span className={`${value.length ? "" : "opacity-60"}`}>{summary}</span>
//         <svg className="w-4 h-4 opacity-60" viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z"/></svg>
//       </button>

//       {open && (
//         <div className="absolute z-[1100] mt-1 w-full bg-white border rounded-md shadow-xl">
//           <div className="p-2 border-b flex items-center gap-2">
//             <input
//               value={q}
//               onChange={(e) => setQ(e.target.value)}
//               placeholder="Search name/role…"
//               className="w-full border rounded px-2 py-1 text-sm"
//             />
//             <button
//               type="button"
//               onClick={selectAllFiltered}
//               className="text-xs px-2 py-1 rounded border hover:bg-purple-50"
//             >
//               {allFilteredSelected ? "Unselect filtered" : "Select all"}
//             </button>
//             <button
//               type="button"
//               onClick={clearAll}
//               className="text-xs px-2 py-1 rounded border hover:bg-purple-50"
//             >
//               Clear
//             </button>
//           </div>

//           <div className="max-h-64 overflow-auto py-1">
//             {filtered.length === 0 && (
//               <div className="px-3 py-2 text-sm opacity-60">No matches</div>
//             )}
//             {filtered.map((u) => {
//               const idN = Number(u.user_id);
//               const checked = value.includes(idN);
//               const roles = Array.isArray(u.roles) ? u.roles.join(", ") : "";
//               return (
//                 <label
//                   key={idN}
//                   className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-purple-50 ${
//                     checked ? "bg-purple-50" : ""
//                   }`}
//                   onClick={() => toggle(idN)}
//                 >
//                   <input
//                     type="checkbox"
//                     className="h-4 w-4"
//                     checked={checked}
//                     onChange={() => {}}
//                   />
//                   <span className="flex-1">
//                     {u.name}{" "}
//                     <span className="opacity-60">
//                       {roles ? `(${roles})` : ""}
//                     </span>
//                   </span>
//                 </label>
//               );
//             })}
//           </div>

//           <div className="p-2 border-t text-xs opacity-70">
//             Selected: {value.length} / {users.length}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



// export default Scheduling;


// Scheduling.jsx — UI from the styled version, real APIs from your app
import React, { useEffect, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "../ThemeContext";
import {
  getSchedulingSetup,
  createProjectSchedules,
  listProjectSchedules,
  myProjectSchedules,
  Allprojects,
  getProjectsByOwnership,
} from "../api";

function useActiveProjectId() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get("project_id");
    if (q) return Number(q);
  } catch {}
  const ls =
    localStorage.getItem("ACTIVE_PROJECT_ID") ||
    localStorage.getItem("PROJECT_ID");
  return ls ? Number(ls) : null;
}

const MAX_REMIND_DAYS = 31;

const Scheduling = () => {
  const { theme } = useTheme();

  // THEME palette (matching GuardAttendance)
  const ORANGE = "#ffbe63";
  const BG_OFFWHITE = "#fcfaf7";
  const bgColor = theme === "dark" ? "#191922" : BG_OFFWHITE;
  const cardColor = theme === "dark" ? "#23232c" : "#fff";
  const textColor = theme === "dark" ? "#fff" : "#222";
  const iconColor = ORANGE;

  // ---- Project selection (role-aware) ----
  const [projectId, setProjectId] = useState(useActiveProjectId());
  const [projects, setProjects] = useState([]);

  const setActiveProject = (idOrEmpty) => {
    const id = idOrEmpty ? Number(idOrEmpty) : null;
    setProjectId(id);
    const url = new URL(window.location.href);
    if (id) url.searchParams.set("project_id", String(id));
    else url.searchParams.delete("project_id");
    window.history.replaceState({}, "", url.toString());
    if (id) {
      localStorage.setItem("ACTIVE_PROJECT_ID", String(id));
      localStorage.setItem("PROJECT_ID", String(id));
    } else {
      localStorage.removeItem("ACTIVE_PROJECT_ID");
      localStorage.removeItem("PROJECT_ID");
    }
  };

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const role = (localStorage.getItem("ROLE") || "").toLowerCase();
        const userStr = localStorage.getItem("USER_DATA");
        const user = userStr && userStr !== "undefined" ? JSON.parse(userStr) : null;

        let resp = null;

        if (role === "super admin") {
          // all projects
          resp = await Allprojects();
        } else if (role === "manager") {
          // Manager → ORGANIZATION-LEVEL projects
          const orgId = user?.org || user?.organization_id;
          if (!orgId) {
            setProjects([]);
            return;
          }
          resp = await getProjectsByOwnership({
            organization_id: orgId,
            company_id: null,
            entity_id: null,
          });
        } else if (role === "admin") {
          // Admin → also org-level list
          const orgId = user?.org || user?.organization_id;
          if (!orgId) {
            setProjects([]);
            return;
          }
          resp = await getProjectsByOwnership({
            organization_id: orgId,
            company_id: null,
            entity_id: null,
          });
        } else if (user) {
          // Fallback: prefer org, otherwise company, otherwise entity
          const orgId = user?.org || user?.organization_id || null;
          const companyId = orgId ? null : user?.company_id || null;
          const entityId = orgId || companyId ? null : user?.entity_id || null;

          resp = await getProjectsByOwnership({
            organization_id: orgId,
            company_id: companyId,
            entity_id: entityId,
          });
        }

        const list = Array.isArray(resp?.data)
          ? resp.data
          : Array.isArray(resp?.data?.results)
          ? resp.data.results
          : resp?.data || [];

        setProjects(list);

        // auto-select if a single project is available
        if (!projectId && list.length === 1) {
          setActiveProject(list[0].id);
        }
      } catch (e) {
        console.error("[Scheduling] loadProjects failed", e);
        setProjects([]);
        toast.error("Failed to fetch projects");
      }
    };

    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Scheduling setup/list state ----
  const [setupLoading, setSetupLoading] = useState(false);
  const [setup, setSetup] = useState(null);
  const [open, setOpen] = useState(false);

  // form state
  const [selectedStageId, setSelectedStageId] = useState("");
  const [selectedMeta, setSelectedMeta] = useState({
    phase_id: null,
    purpose_id: null,
  });

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [remindDays, setRemindDays] = useState(0);
  const [assignees, setAssignees] = useState([]);

  // selection state
  const [activeBuildingId, setActiveBuildingId] = useState(null);
  const [selectedBuildings, setSelectedBuildings] = useState(new Set());
  const [selectedFloorsByBuilding, setSelectedFloorsByBuilding] = useState({});
  const [activeLevelId, setActiveLevelId] = useState(null);
  const [selectedFlatsByLevel, setSelectedFlatsByLevel] = useState({});

  // lists
  const [listLoading, setListLoading] = useState(false);
  const [schedulesList, setSchedulesList] = useState(null);
  const [myList, setMyList] = useState(null);
  const [tab, setTab] = useState("all"); // "all" | "my"

  // ---- Load setup ----
  useEffect(() => {
    if (!projectId) return;
    const load = async () => {
      try {
        setSetupLoading(true);
        const { data } = await getSchedulingSetup(projectId);
        setSetup(data);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load scheduling setup");
      } finally {
        setSetupLoading(false);
      }
    };
    load();
  }, [projectId]);

  // ---- Load lists (tab-aware) ----
  const fetchActiveTab = async () => {
    if (!projectId) return;
    try {
      setListLoading(true);
      if (tab === "all") {
        const { data } = await listProjectSchedules(projectId);
        setSchedulesList(data);
      } else {
        const { data } = await myProjectSchedules(projectId);
        setMyList(data);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load schedules");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveTab();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, tab]);

  // ---- Derived options ----
  const stageOptions = useMemo(() => {
    if (!setup?.purposes?.length) return [];
    const opts = [];
    setup.purposes.forEach((p) => {
      p.phases?.forEach((ph) => {
        ph.stages?.forEach((st) => {
          opts.push({
            value: String(st.id),
            label: `${ph.name} — ${st.name}`,
            phase_id: ph.id,
            purpose_id: p.id,
          });
        });
      });
    });
    return opts.sort((a, b) => a.label.localeCompare(b.label));
  }, [setup]);

  // normalize roles
  const normRole = (r) =>
    String(typeof r === "string" ? r : r?.role || r?.name || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");

  const isExcludedUser = (u) => {
    const roles = Array.isArray(u?.roles) ? u.roles : [];
    return roles.some((r) => {
      const n = normRole(r);
      return n === "staff" || n === "security_guard";
    });
  };

  const users = useMemo(() => {
    const list = Array.isArray(setup?.users) ? setup.users : [];
    return list.filter((u) => !isExcludedUser(u));
  }, [setup]);

  const buildings = useMemo(() => setup?.structure?.buildings || [], [setup]);

  const activeBuilding = useMemo(
    () => buildings.find((b) => b.id === activeBuildingId) || null,
    [buildings, activeBuildingId]
  );

  // sort floors numerically: B2 < B1 < G(0) < 1 < 2 ...
  const floorNumberFromLevel = (lvl) => {
    const numericFields = [
      lvl.order,
      lvl.sequence,
      lvl.seq,
      lvl.index,
      lvl.position,
      lvl.level_no,
      lvl.level_number,
      lvl.number,
      lvl.floor_no,
      lvl.floor_number,
    ];
    for (const v of numericFields) {
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
    const name = String(lvl?.name || "").trim().toLowerCase();
    if (/^(g|ground)\b/.test(name)) return 0;
    const mb = name.match(/^b(?:asement)?\s*(\d+)/);
    if (mb) return -Number(mb[1]);
    const m = name.match(/-?\d+/);
    if (m) return Number(m[0]);
    return Number.MAX_SAFE_INTEGER;
  };
  const byFloorAsc = (a, b) => floorNumberFromLevel(a) - floorNumberFromLevel(b);

  const activeFloors = useMemo(() => {
    const arr = activeBuilding?.levels || [];
    return [...arr].sort(byFloorAsc);
  }, [activeBuilding]);

  const activeLevel = useMemo(
    () => activeFloors.find((l) => l.id === activeLevelId) || null,
    [activeFloors, activeLevelId]
  );
  const activeFlats = useMemo(
    () => activeLevel?.level_orphan_flats || [],
    [activeLevel]
  );

  const allowedRemindMax = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate + "T00:00:00");
    const e = new Date(endDate + "T00:00:00");
    const diff = Math.floor((e - s) / 86400000);
    return Math.max(0, Math.min(MAX_REMIND_DAYS, diff));
  }, [startDate, endDate]);

  useEffect(() => {
    if (remindDays > allowedRemindMax) {
      setRemindDays(allowedRemindMax);
    }
  }, [allowedRemindMax, remindDays]);

  // ---- Selection handlers ----
  const toggleBuilding = (bId) => {
    setActiveBuildingId(bId);
    setActiveLevelId(null);
    setSelectedBuildings((prev) => {
      const next = new Set(prev);
      next.has(bId) ? next.delete(bId) : next.add(bId);
      return next;
    });
  };

  const isLevelSelected = (bId, levelId) =>
    (selectedFloorsByBuilding[bId]?.has(levelId)) || false;

  const toggleLevel = (bId, levelId) => {
    setActiveLevelId(levelId);
    setSelectedFloorsByBuilding((prev) => {
      const prevSet = prev[bId] ? new Set(prev[bId]) : new Set();
      prevSet.has(levelId) ? prevSet.delete(levelId) : prevSet.add(levelId);
      return { ...prev, [bId]: prevSet };
    });
  };

  const selectAllFloorsForActiveBuilding = (checked) => {
    if (!activeBuilding) return;
    setSelectedFloorsByBuilding((prev) => {
      if (checked) {
        return {
          ...prev,
          [activeBuilding.id]: new Set(activeFloors.map((f) => f.id)),
        };
      }
      return { ...prev, [activeBuilding.id]: new Set() };
    });
  };

  const isFlatSelected = (levelId, flatId) =>
    (selectedFlatsByLevel[levelId]?.has(flatId)) || false;

  const toggleFlat = (levelId, flatId) => {
    setSelectedFlatsByLevel((prev) => {
      const prevSet = prev[levelId] ? new Set(prev[levelId]) : new Set();
      prevSet.has(flatId) ? prevSet.delete(flatId) : prevSet.add(flatId);
      return { ...prev, [levelId]: prevSet };
    });
  };

  const selectAllFlatsForActiveLevel = (checked) => {
    if (!activeLevel) return;
    setSelectedFlatsByLevel((prev) => {
      if (checked) {
        return {
          ...prev,
          [activeLevel.id]: new Set(activeFlats.map((f) => f.id)),
        };
      }
      return { ...prev, [activeLevel.id]: new Set() };
    });
  };

  // ---- Preview mapping ----
  const mappingsPreview = useMemo(() => {
    const rows = [];
    selectedBuildings.forEach((bId) => {
      const building = buildings.find((b) => b.id === bId);
      if (!building) return;
      const selectedLevels = Array.from(selectedFloorsByBuilding[bId] || []);
      selectedLevels.forEach((lvlId) => {
        const level = building.levels.find((l) => l.id === lvlId);
        if (!level) return;

        const pickedFlats = Array.from(selectedFlatsByLevel[lvlId] || []);
        const flats =
          pickedFlats.length > 0
            ? level.level_orphan_flats.filter((f) => pickedFlats.includes(f.id))
            : level.level_orphan_flats;

        rows.push({
          building_id: building.id,
          building_name: building.name,
          level_id: level.id,
          level_name: level.name,
          flats: flats.map((f) => ({ flat_id: f.id, number: f.number })),
        });
      });
    });
    return rows;
  }, [
    selectedBuildings,
    buildings,
    selectedFloorsByBuilding,
    selectedFlatsByLevel,
  ]);

  // ---- Submit ----
  const onSubmit = async () => {
    if (!projectId) return toast.error("No project selected");
    if (!selectedStageId) return toast.error("Please select a Stage");
    if (!startDate || !endDate) return toast.error("Please set Start & End dates");
    if (new Date(endDate) < new Date(startDate))
      return toast.error("End Date cannot be before Start Date");
    if (mappingsPreview.length === 0)
      return toast.error("Please select at least one Floor (and Flats if needed)");

    const stageMeta = stageOptions.find(
      (s) => s.value === String(selectedStageId)
    );
    if (!stageMeta) return toast.error("Stage selection invalid");

    const mappings = mappingsPreview.map((row) => ({
      scope: { building_id: row.building_id, level_id: row.level_id },
      targets: row.flats.map((f) => ({ flat_id: f.flat_id })),
      meta: {
        batch: `${row.building_name}-${row.level_name} (${row.flats.length})`,
      },
    }));

    const payload = {
      schedules: [
        {
          project_id: projectId,
          purpose_id: stageMeta.purpose_id,
          phase_id: stageMeta.phase_id,
          stage_id: Number(selectedStageId),
          start_date: startDate,
          end_date: endDate,
          remind_before_days: Number(remindDays || 0),
          is_active: true,
          assignees: assignees.map(Number),
          mappings,
        },
      ],
    };

    try {
      await createProjectSchedules(payload);
      toast.success("Schedule created");
      setOpen(false);
      fetchActiveTab();
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.detail || "Failed to create schedule");
    }
  };

  // ---- UI ----
  return (
    <>
      <style>{`
        .scheduling-page input, .scheduling-page select, .scheduling-page button, .scheduling-page textarea {
          color: ${textColor};
          font-size: 14px;
        }
        .scheduling-card {
          background: ${cardColor};
          border: 1px solid ${theme === "dark" ? "rgba(255,190,99,.25)" : "rgba(255,190,99,.2)"};
          box-shadow: 0 2px 8px ${theme === "dark" ? "rgba(0,0,0,.3)" : "rgba(0,0,0,.06)"};
        }
        .scheduling-accent { color: ${iconColor}; }

        .scheduling-input {
          background: ${cardColor};
          border: 1px solid ${theme === "dark" ? "rgba(255,190,99,.35)" : "rgba(255,190,99,.3)"};
          border-radius: 8px;
          transition: all 0.2s ease;
          font-size: 14px;
          padding: 10px 12px;
        }
        .scheduling-input:hover {
          border-color: ${theme === "dark" ? "rgba(255,190,99,.5)" : "rgba(255,190,99,.45)"};
        }
        .scheduling-input:focus {
          outline: none;
          border-color: ${iconColor};
          box-shadow: 0 0 0 3px ${theme === "dark" ? "rgba(255,190,99,.15)" : "rgba(255,190,99,.1)"};
        }
        .scheduling-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .scheduling-primary { 
          background: ${iconColor}; 
          color: #222; 
          font-weight: 600;
          border-radius: 8px;
          padding: 12px 24px;
          transition: all 0.2s ease;
          border: none;
        }
        .scheduling-primary:hover:not(:disabled) { 
          filter: brightness(1.05);
          box-shadow: 0 4px 12px rgba(255,190,99,.3);
        }
        .scheduling-primary:active:not(:disabled) {
          transform: translateY(1px);
        }
        
        .scheduling-outline { 
          border: 1px solid ${theme === "dark" ? "rgba(255,190,99,.4)" : "rgba(255,190,99,.35)"}; 
          color: ${textColor}; 
          background: transparent;
          border-radius: 8px;
          padding: 8px 16px;
          font-weight: 500;
          transition: all 0.2s ease;
          font-size: 14px;
        }
        .scheduling-outline:hover:not(:disabled) {
          background: ${theme === "dark" ? "rgba(255,190,99,.08)" : "rgba(255,190,99,.06)"};
          border-color: ${iconColor};
        }
        .scheduling-outline:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .scheduling-table { 
          border-collapse: separate;
          border-spacing: 0;
        }
        .scheduling-table th { 
          border-bottom: 2px solid ${theme === "dark" ? "rgba(255,190,99,.25)" : "rgba(255,190,99,.2)"};
          padding: 12px 16px;
          font-weight: 600;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: ${theme === "dark" ? "rgba(255,255,255,.7)" : "rgba(0,0,0,.6)"};
        }
        .scheduling-table td {
          border-bottom: 1px solid ${theme === "dark" ? "rgba(255,190,99,.12)" : "rgba(255,190,99,.1)"};
          padding: 14px 16px;
          font-size: 14px;
        }
        .scheduling-table tbody tr:hover {
          background: ${theme === "dark" ? "rgba(255,190,99,.04)" : "rgba(255,190,99,.03)"};
        }

        .scheduling-label {
          font-weight: 600;
          font-size: 13px;
          margin-bottom: 6px;
          display: block;
          letter-spacing: 0.3px;
        }

        .scheduling-section-title {
          font-weight: 600;
          font-size: 15px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          letter-spacing: 0.3px;
        }

        .scheduling-shell {
          min-height: calc(100vh - 32px);
          padding: 32px 24px 48px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }

        .scheduling-badge {
          display: inline-block;
          background: ${theme === "dark" ? "rgba(255,190,99,.15)" : "rgba(255,190,99,.12)"};
          color: ${iconColor};
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .scheduling-box {
          border-radius: 10px;
          padding: 12px;
          background: ${theme === "dark" ? "rgba(255,190,99,.05)" : "rgba(255,190,99,.04)"};
          border: 1px solid ${theme === "dark" ? "rgba(255,190,99,.15)" : "rgba(255,190,99,.12)"};
          height: 340px;
          overflow-y: auto;
        }

        .scheduling-box-item {
          width: 100%;
          text-align: left;
          padding: 10px 12px;
          border-radius: 6px;
          margin-bottom: 8px;
          border: 1px solid ${theme === "dark" ? "rgba(255,190,99,.2)" : "rgba(255,190,99,.15)"};
          background: ${cardColor};
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .scheduling-box-item:hover {
          border-color: ${iconColor};
          background: ${theme === "dark" ? "rgba(255,190,99,.08)" : "rgba(255,190,99,.06)"};
        }
        .scheduling-box-item.active {
          background: ${theme === "dark" ? "rgba(255,190,99,.15)" : "rgba(255,190,99,.12)"};
          border-color: ${iconColor};
        }

        .scheduling-tab {
          padding: 10px 20px;
          border-radius: 8px;
          border: 1px solid ${theme === "dark" ? "rgba(255,190,99,.3)" : "rgba(255,190,99,.25)"};
          background: transparent;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        .scheduling-tab.active {
          background: ${iconColor};
          color: #222;
          border-color: ${iconColor};
        }
        .scheduling-tab:not(.active):hover {
          background: ${theme === "dark" ? "rgba(255,190,99,.08)" : "rgba(255,190,99,.06)"};
        }
      `}</style>

      <div className="scheduling-page" style={{ background: bgColor }}>
        <div className="scheduling-shell">
          {/* Header */}
          <div className="text-center max-w-6xl w-full">
            <div className="scheduling-badge mb-3">Project Management</div>
            <h1 className="text-4xl font-bold" style={{ color: textColor }}>
              Scheduling System
            </h1>
            <p className="mt-3 text-base" style={{ color: textColor, opacity: 0.7 }}>
              Create and manage project schedules with tower, floor, and flat assignments
            </p>
          </div>

          {/* Main Card */}
          <div className="scheduling-card rounded-xl p-8 space-y-8 max-w-6xl w-full">
            {/* Project Selection */}
            <div>
              <h2 className="scheduling-section-title" style={{ color: textColor }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                Project Selection
              </h2>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex-1">
                  <label className="scheduling-label" style={{ color: textColor }}>
                    Select Project <span className="scheduling-accent">*</span>
                  </label>
                  <select
                    className="scheduling-input w-full"
                    value={projectId ?? ""}
                    onChange={(e) => setActiveProject(e.target.value)}
                  >
                    <option value="">Choose a project...</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => setOpen(true)}
                  className="scheduling-primary mt-6"
                  disabled={!projectId || setupLoading}
                  style={{ opacity: !projectId || setupLoading ? 0.5 : 1 }}
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add Schedule
                </button>
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${theme === "dark" ? "rgba(255,190,99,.15)" : "rgba(255,190,99,.12)"}` }} />

            {/* Schedules List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="scheduling-section-title" style={{ color: textColor, marginBottom: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  Schedule Records
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setTab("all")}
                    className={`scheduling-tab ${tab === "all" ? "active" : ""}`}
                  >
                    All Schedules
                  </button>
                  <button
                    onClick={() => setTab("my")}
                    className={`scheduling-tab ${tab === "my" ? "active" : ""}`}
                  >
                    My Schedules
                  </button>
                  <button className="scheduling-outline" onClick={fetchActiveTab} disabled={listLoading}>
                    {listLoading ? "Refreshing..." : "Refresh"}
                  </button>
                </div>
              </div>

              <div
                className="overflow-x-auto rounded-lg"
                style={{ border: `1px solid ${theme === "dark" ? "rgba(255,190,99,.15)" : "rgba(255,190,99,.12)"}` }}
              >
                <table className="min-w-full scheduling-table" style={{ color: textColor }}>
                  <thead>
                    <tr className="text-left">
                      <th>Stage</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Remind Days</th>
                      <th>Assignees</th>
                      <th>Mappings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const data = tab === "all" ? schedulesList : myList;
                      const arr = Array.isArray(data)
                        ? data
                        : Array.isArray(data?.results)
                        ? data.results
                        : data?.schedules || data?.items || [];

                      if (arr.length === 0) {
                        return (
                          <tr>
                            <td className="text-center" colSpan={6} style={{ opacity: 0.6, padding: "32px" }}>
                              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{margin: "0 auto 12px", opacity: 0.3}}>
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="8" x2="12" y2="12"/>
                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                              </svg>
                              <div>No schedules found</div>
                              <div className="text-xs mt-1" style={{opacity: 0.5}}>Create a new schedule to get started</div>
                            </td>
                          </tr>
                        );
                      }

                      return arr.map((row, i) => (
                        <tr key={row.id || i}>
                          <td>{row?.stage?.name || row?.stage_name || row?.stage_id || "—"}</td>
                          <td>{row?.start_date || row?.start || "—"}</td>
                          <td>{row?.end_date || row?.end || "—"}</td>
                          <td>{row?.remind_before_days ?? "—"}</td>
                          <td>{Array.isArray(row?.assignees) ? row.assignees.length : "—"}</td>
                          <td>{Array.isArray(row?.mappings) ? row.mappings.length : "—"}</td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {open && (
  <div className="fixed inset-0 z-[1200]" style={{ backdropFilter: "blur(4px)" }}>
    <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />

    <div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                 w-[95vw] max-w-7xl max-h-[90vh] rounded-xl
                 overflow-hidden"
      style={{
        background: cardColor,
        border: `1px solid ${theme === "dark" ? "rgba(255,190,99,.25)" : "rgba(255,190,99,.2)"}`,
        boxShadow: "0 20px 60px rgba(0,0,0,.3)",
      }}
    >
            <div
              className="flex items-center justify-between p-6 border-b"
              style={{ borderColor: theme === "dark" ? "rgba(255,190,99,.15)" : "rgba(255,190,99,.12)" }}
            >
              <div>
                <h3 className="text-xl font-semibold" style={{ color: textColor }}>Create New Schedule</h3>
                <p className="text-sm mt-1" style={{ color: textColor, opacity: 0.6 }}>
                  Configure schedule details and select locations
                </p>
              </div>
              <button className="scheduling-outline" onClick={() => setOpen(false)}>
                <X className="w-4 h-4 inline mr-1" />
                Close
              </button>
            </div>

            <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(90vh - 140px)" }}>
              <div className="space-y-6">
                {/* Schedule Configuration */}
                <div>
                  <h3 className="scheduling-section-title" style={{ color: textColor }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    Schedule Configuration
                  </h3>
                  <div className="grid md:grid-cols-5 gap-4 mt-4">
                    <div>
                      <label className="scheduling-label" style={{ color: textColor }}>
                        Stage <span className="scheduling-accent">*</span>
                      </label>
                      <select
                        className="scheduling-input w-full"
                        value={selectedStageId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSelectedStageId(val);
                          const m = stageOptions.find((s) => s.value === val);
                          setSelectedMeta({
                            phase_id: m?.phase_id || null,
                            purpose_id: m?.purpose_id || null,
                          });
                        }}
                      >
                        <option value="">Select Stage</option>
                        {stageOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="scheduling-label" style={{ color: textColor }}>
                        Start Date <span className="scheduling-accent">*</span>
                      </label>
                      <input
                        type="date"
                        className="scheduling-input w-full"
                        value={startDate}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStartDate(val);
                          if (endDate && new Date(endDate) < new Date(val)) {
                            setEndDate("");
                            setRemindDays(0);
                            toast.error("End Date cannot be before Start Date");
                          }
                        }}
                      />
                    </div>

                    <div>
                      <label className="scheduling-label" style={{ color: textColor }}>
                        End Date <span className="scheduling-accent">*</span>
                      </label>
                      <input
                        type="date"
                        className="scheduling-input w-full"
                        value={endDate}
                        min={startDate || undefined}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (startDate && new Date(val) < new Date(startDate)) {
                            toast.error("End Date cannot be before Start Date");
                            return;
                          }
                          setEndDate(val);
                        }}
                      />
                    </div>

                    <div>
                      <label className="scheduling-label" style={{ color: textColor }}>
                        Remind Days Before
                        <span className="scheduling-accent ml-1">(0–{allowedRemindMax})</span>
                      </label>
                      <select
                        className="scheduling-input w-full"
                        value={String(remindDays)}
                        disabled={!startDate || !endDate}
                        onChange={(e) => setRemindDays(Number(e.target.value))}
                      >
                        {Array.from({ length: allowedRemindMax + 1 }, (_, i) => (
                          <option key={i} value={i}>{i}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="scheduling-label" style={{ color: textColor }}>
                        Assignees
                      </label>
                      <AssigneeDropdown
                        users={users}
                        value={assignees}
                        onChange={(arr) => setAssignees(arr)}
                        theme={theme}
                        iconColor={iconColor}
                        cardColor={cardColor}
                        textColor={textColor}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: `1px solid ${theme === "dark" ? "rgba(255,190,99,.15)" : "rgba(255,190,99,.12)"}` }} />

                {/* Location Selection */}
                <div>
                  <h3 className="scheduling-section-title" style={{ color: textColor }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    Location Selection
                  </h3>
                  <div className="grid md:grid-cols-4 gap-4 mt-4">
                    {/* Towers */}
                    <div>
                      <label className="scheduling-label" style={{ color: textColor }}>
                        Select Tower
                      </label>
                      <div className="scheduling-box">
                        {buildings.length === 0 ? (
                          <div className="text-sm text-center py-8" style={{ color: textColor, opacity: 0.6 }}>
                            No towers available
                          </div>
                        ) : (
                          buildings.map((b) => (
                            <button
                              key={b.id}
                              onClick={() => toggleBuilding(b.id)}
                              className={`scheduling-box-item ${selectedBuildings.has(b.id) ? "active" : ""}`}
                            >
                              {b.name}
                            </button>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Floors */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          id="selectAllFloors"
                          type="checkbox"
                          className="h-4 w-4"
                          onChange={(e) => selectAllFloorsForActiveBuilding(e.target.checked)}
                          disabled={!activeBuilding}
                        />
                        <label htmlFor="selectAllFloors" className="scheduling-label" style={{ marginBottom: 0 }}>
                          Select Floor
                        </label>
                      </div>
                      <div className="scheduling-box">
                        {!activeBuilding ? (
                          <div className="text-sm text-center py-8" style={{ color: textColor, opacity: 0.6 }}>
                            Select a tower first
                          </div>
                        ) : (
                          activeFloors.map((lvl) => (
                            <button
                              key={lvl.id}
                              onClick={() => toggleLevel(activeBuilding.id, lvl.id)}
                              className={`scheduling-box-item ${isLevelSelected(activeBuilding.id, lvl.id) ? "active" : ""}`}
                            >
                              {lvl.name}
                            </button>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Flats */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          id="selectAllFlats"
                          type="checkbox"
                          className="h-4 w-4"
                          onChange={(e) => selectAllFlatsForActiveLevel(e.target.checked)}
                          disabled={!activeLevel}
                        />
                        <label htmlFor="selectAllFlats" className="scheduling-label" style={{ marginBottom: 0 }}>
                          Select Flat
                        </label>
                      </div>
                      <div className="scheduling-box">
                        {!activeLevel ? (
                          <div className="text-sm text-center py-8" style={{ color: textColor, opacity: 0.6 }}>
                            Select a floor first
                          </div>
                        ) : activeFlats.length === 0 ? (
                          <div className="text-sm text-center py-8" style={{ color: textColor, opacity: 0.6 }}>
                            No flats available
                          </div>
                        ) : (
                          activeFlats.map((f) => (
                            <label
                              key={f.id}
                              className={`scheduling-box-item flex items-center gap-2 ${isFlatSelected(activeLevel.id, f.id) ? "active" : ""}`}
                            >
                              <input
                                type="checkbox"
                                checked={isFlatSelected(activeLevel.id, f.id)}
                                onChange={() => toggleFlat(activeLevel.id, f.id)}
                              />
                              <span>{f.number}</span>
                            </label>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Preview */}
                    <div>
                      <label className="scheduling-label" style={{ color: textColor }}>
                        Preview
                      </label>
                      <div className="scheduling-box">
                        {mappingsPreview.length === 0 ? (
                          <div className="text-sm text-center py-8" style={{ color: textColor, opacity: 0.6 }}>
                            Your selection will appear here
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {mappingsPreview.map((row, idx) => (
                              <div
                                key={`${row.building_id}-${row.level_id}-${idx}`}
                                className="scheduling-box-item"
                                style={{ cursor: "default" }}
                              >
                                <div className="font-semibold text-sm">
                                  {row.building_name} → {row.level_name}
                                </div>
                                <div className="text-xs mt-1" style={{ opacity: 0.7 }}>
                                  Flats: {row.flats.length > 0 ? row.flats.map((f) => f.number).join(", ") : "All"}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
             <div
          className="sticky bottom-0 flex justify-end gap-3 p-6 border-t"
          style={{
            borderColor: theme === "dark" ? "rgba(255,190,99,.15)" : "rgba(255,190,99,.12)",
            background: cardColor, // to cover content under while scrolling
          }}
        >
          <button onClick={() => setOpen(false)} className="scheduling-outline">Cancel</button>
          <button onClick={onSubmit} className="scheduling-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="2" style={{ display: "inline", marginRight: 8 }}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Create Schedule
          </button>
        </div>
          </div>
        </div>
      )}
    </>
  );
};

function AssigneeDropdown({ users = [], value = [], onChange, theme, iconColor, cardColor, textColor }) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const ref = React.useRef(null);

  React.useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return users;
    return users.filter((u) => {
      const roles = Array.isArray(u.roles) ? u.roles.join(", ") : "";
      return (
        (u.name || "").toLowerCase().includes(needle) ||
        String(u.user_id).includes(needle) ||
        roles.toLowerCase().includes(needle)
      );
    });
  }, [users, q]);

  const filteredIds = React.useMemo(
    () => filtered.map((u) => Number(u.user_id)),
    [filtered]
  );

  const allFilteredSelected =
    filteredIds.length > 0 &&
    filteredIds.every((id) => value.includes(Number(id)));

  const toggle = (id) => {
    const idN = Number(id);
    const has = value.includes(idN);
    if (has) onChange(value.filter((v) => v !== idN));
    else onChange([...value, idN]);
  };

  const selectAllFiltered = () => {
    if (allFilteredSelected) {
      onChange(value.filter((v) => !filteredIds.includes(Number(v))));
    } else {
      const merged = new Set([...value, ...filteredIds]);
      onChange(Array.from(merged));
    }
  };

  const clearAll = () => onChange([]);

  const summary = React.useMemo(() => {
    if (!value.length) return "Select assignees…";
    const names = users
      .filter((u) => value.includes(Number(u.user_id)))
      .map((u) => u.name);
    if (names.length <= 2) return names.join(", ");
    return `${names.slice(0, 2).join(", ")} +${names.length - 2} more`;
  }, [users, value]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="scheduling-input w-full text-left flex items-center justify-between"
      >
        <span style={{ opacity: value.length ? 1 : 0.6 }}>{summary}</span>
        <svg className="w-4 h-4" style={{ opacity: 0.6 }} viewBox="0 0 20 20" fill="currentColor">
          <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z"/>
        </svg>
      </button>

      {open && (
        <div
          className="absolute z-[1300] mt-2 w-full rounded-lg shadow-xl"
          style={{
            background: cardColor,
            border: `1px solid ${theme === "dark" ? "rgba(255,190,99,.25)" : "rgba(255,190,99,.2)"}`,
          }}
        >
          <div
            className="p-3 border-b flex items-center gap-2"
            style={{ borderColor: theme === "dark" ? "rgba(255,190,99,.15)" : "rgba(255,190,99,.12)" }}
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name/role…"
              className="scheduling-input flex-1 text-sm"
            />
            <button
              type="button"
              onClick={selectAllFiltered}
              className="scheduling-outline text-xs px-3 py-1"
            >
              {allFilteredSelected ? "Unselect" : "All"}
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="scheduling-outline text-xs px-3 py-1"
            >
              Clear
            </button>
          </div>

          <div className="max-h-64 overflow-auto py-1">
            {filtered.length === 0 && (
              <div className="px-4 py-3 text-sm" style={{ color: textColor, opacity: 0.6 }}>
                No matches
              </div>
            )}
            {filtered.map((u) => {
              const idN = Number(u.user_id);
              const checked = value.includes(idN);
              const roles = Array.isArray(u.roles) ? u.roles.join(", ") : "";
              return (
                <label
                  key={idN}
                  className="flex items-center gap-3 px-4 py-2 text-sm cursor-pointer"
                  style={{
                    background: checked ? (theme === "dark" ? "rgba(255,190,99,.08)" : "rgba(255,190,99,.06)") : "transparent",
                    color: textColor,
                  }}
                  onClick={() => toggle(idN)}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={checked}
                    onChange={() => {}}
                  />
                  <span className="flex-1">
                    {u.name}{" "}
                    <span style={{ opacity: 0.6 }}>
                      {roles ? `(${roles})` : ""}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>

          <div
            className="p-3 border-t text-xs"
            style={{
              color: textColor,
              opacity: 0.7,
              borderColor: theme === "dark" ? "rgba(255,190,99,.15)" : "rgba(255,190,99,.12)",
            }}
          >
            Selected: {value.length} / {users.length}
          </div>
        </div>
      )}
    </div>
  );
}

export default Scheduling;

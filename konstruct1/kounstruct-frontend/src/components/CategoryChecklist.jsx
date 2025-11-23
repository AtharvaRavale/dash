// import React, { useState, useEffect } from "react";
// import SideBarSetup from "./SideBarSetup";
// import { getProjectsByOwnership } from "../api";
// import { projectInstance } from "../api/axiosInstance";
// import { toast } from "react-hot-toast";
// import { useSelector } from "react-redux";
// import { useTheme } from "../ThemeContext";

// // Orange Palette Tokens
// const ORANGE = "#ffbe63";
// const BG_OFFWHITE = "#fcfaf7";
// const bgColorDark = "#191922";
// const cardColorDark = "#23232c";
// const textColorDark = "#fff";
// const textColorLight = "#222";
// const cardColorLight = "#fff";
// const borderColor = ORANGE;
// const accentBg = ORANGE;
// const thColor = "#ffe0b3";
// const badgeTextDark = "#ad5700";
// const badgeTextLight = "#fff";
// const badgeBgLight = ORANGE;
// const badgeBgDark = "#fff6ea";

// const CATEGORY_LEVELS = [
//   {
//     id: 1,
//     label: "Category 1",
//     icon: "📋",
//     parentKey: "project",
//     parentLabel: "Project",
//     listApi: () => `/categories-simple/`,
//     createApi: `/categories-simple/`,
//     entryParentField: "project",
//   },
//   {
//     id: 2,
//     label: "Category 2",
//     icon: "📁",
//     parentKey: "category",
//     parentLabel: "Category 1",
//     listApi: () => `/category-level1-simple/`,
//     createApi: `/category-level1-simple/`,
//     entryParentField: "category",
//   },
//   {
//     id: 3,
//     label: "Category 3",
//     icon: "📂",
//     parentKey: "category_level1",
//     parentLabel: "Category 2",
//     listApi: () => `/category-level2-simple/`,
//     createApi: `/category-level2-simple/`,
//     entryParentField: "category_level1",
//   },
//   {
//     id: 4,
//     label: "Category 4",
//     icon: "🗂️",
//     parentKey: "category_level2",
//     parentLabel: "Category 3",
//     listApi: () => `/category-level3-simple/`,
//     createApi: `/category-level3-simple/`,
//     entryParentField: "category_level2",
//   },
//   {
//     id: 5,
//     label: "Category 5",
//     icon: "📑",
//     parentKey: "category_level3",
//     parentLabel: "Category 4",
//     listApi: () => `/category-level4-simple/`,
//     createApi: `/category-level4-simple/`,
//     entryParentField: "category_level3",
//   },
//   {
//     id: 6,
//     label: "Category 6",
//     icon: "📄",
//     parentKey: "category_level4",
//     parentLabel: "Category 5",
//     listApi: () => `/category-level5-simple/`,
//     createApi: `/category-level5-simple/`,
//     entryParentField: "category_level4",
//   },
// ];

// function CategoryChecklist() {
//   const userId = useSelector((state) => state.user.user.id);
//   const { theme } = useTheme();

//   // Orange Theme Palette (light/dark)
//   const palette = theme === "dark"
//     ? {
//         bg: bgColorDark,
//         card: cardColorDark,
//         text: textColorDark,
//         border: borderColor,
//         thBg: thColor,
//         badgeBg: badgeBgDark,
//         badgeText: badgeTextDark,
//         input: "#23232c",
//         select: "#23232c",
//         tableRowHover: "#2a2a36",
//         tableHeader: "#fff3db",
//         shadow: "0 8px 32px rgba(255, 190, 99, 0.08)",
//       }
//     : {
//         bg: BG_OFFWHITE,
//         card: cardColorLight,
//         text: textColorLight,
//         border: borderColor,
//         thBg: thColor,
//         badgeBg: badgeBgLight,
//         badgeText: badgeTextLight,
//         input: "#fff",
//         select: "#fff",
//         tableRowHover: "#fff7ea",
//         tableHeader: "#fff3db",
//         shadow: "0 2px 18px rgba(255, 190, 99, 0.08)",
//       };

//   const [projects, setProjects] = useState([]);
//   const [chain, setChain] = useState({
//     project: "",
//     category: "",
//     category_level1: "",
//     category_level2: "",
//     category_level3: "",
//     category_level4: "",
//   });
//   const [options, setOptions] = useState({
//     project: [],
//     category: [],
//     category_level1: [],
//     category_level2: [],
//     category_level3: [],
//     category_level4: [],
//   });
//   const [entries, setEntries] = useState([]);
//   const [inputValue, setInputValue] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [selectedLevel, setSelectedLevel] = useState(CATEGORY_LEVELS[0]);

//   useEffect(() => {
//     (async () => {
//       try {
//         let user = null;
//         try {
//           user = JSON.parse(localStorage.getItem("USER_DATA"));
//         } catch {}
//         let params = {};
//         if (user?.entity_id || user?.entity)
//           params.entity_id = user.entity_id || user.entity;
//         else if (user?.company_id || user?.company)
//           params.company_id = user.company_id || user.company;
//         else if (user?.org || user?.organization_id)
//           params.organization_id = user.org || user.organization_id;
//         if (Object.keys(params).length === 0) {
//           setProjects([]);
//           setOptions((prev) => ({ ...prev, project: [] }));
//           toast.error("No organization/company/entity found.");
//           return;
//         }
//         const res = await getProjectsByOwnership(params);
//         setProjects(res.data || []);
//         setOptions((prev) => ({ ...prev, project: res.data || [] }));
//       } catch {
//         toast.error("Failed to fetch user projects");
//       }
//     })();
//   }, []);

//   // --- RESET LOWER CHAINS/OPTIONS WHEN LEVEL CHANGES ---
//   useEffect(() => {
//     const chainCopy = { ...chain };
//     const optionsCopy = { ...options };
//     let cutoff = CATEGORY_LEVELS[selectedLevel.id - 1]?.parentKey || "project";
//     let found = false;
//     for (const key of Object.keys(chainCopy)) {
//       if (key === cutoff) {
//         found = true;
//         continue;
//       }
//       if (found) {
//         chainCopy[key] = "";
//         optionsCopy[key] = [];
//       }
//     }
//     setChain(chainCopy);
//     setOptions(optionsCopy);
//     setEntries([]);
//     setInputValue("");
//   }, [selectedLevel]);

//   // --- HANDLE PARENT CHANGE ---
//   const handleParentChange = (key, value) => {
//     const newChain = { ...chain, [key]: value };
//     const newOptions = { ...options };
//     let found = false;
//     for (const k of Object.keys(chain)) {
//       if (k === key) {
//         found = true;
//         continue;
//       }
//       if (found) {
//         newChain[k] = "";
//         newOptions[k] = [];
//       }
//     }
//     setChain(newChain);
//     setOptions(newOptions);
//     setInputValue("");
//   };

//   // --- FETCH CHILD DROPDOWN OPTIONS (next level) ---
//   useEffect(() => {
//     if (selectedLevel.id === 1) return;
//     const prevLevelIdx = selectedLevel.id - 2;
//     const prevLevel = CATEGORY_LEVELS[prevLevelIdx];
//     const parentKey = prevLevel.parentKey;
//     const parentId = chain[parentKey];
//     if (!parentId) {
//       setOptions((prev) => ({ ...prev, [selectedLevel.parentKey]: [] }));
//       return;
//     }
//     setLoading(true);
//     projectInstance
//       .get(prevLevel.listApi())
//       .then((res) => {
//         const filtered = (res.data || []).filter(
//           (item) =>
//             String(item[prevLevel.entryParentField]) === String(parentId)
//         );
//         setOptions((prev) => ({
//           ...prev,
//           [selectedLevel.parentKey]: filtered,
//         }));
//       })
//       .catch(() => {
//         setOptions((prev) => ({ ...prev, [selectedLevel.parentKey]: [] }));
//       })
//       .finally(() => setLoading(false));
//   }, [selectedLevel, ...Object.values(chain).slice(0, -1)]);

//   // --- FETCH TABLE ENTRIES for current parent selection at this level ---
//   useEffect(() => {
//     if (!chain[selectedLevel.parentKey]) {
//       setEntries([]);
//       return;
//     }
//     setLoading(true);
//     projectInstance
//       .get(selectedLevel.listApi())
//       .then((res) => {
//         const filtered = (res.data || []).filter(
//           (item) =>
//             String(item[selectedLevel.entryParentField]) ===
//             String(chain[selectedLevel.parentKey])
//         );
//         setEntries(filtered);
//       })
//       .catch(() => setEntries([]))
//       .finally(() => setLoading(false));
//   }, [selectedLevel, chain[selectedLevel.parentKey]]);

//   // --- ADD NEW ENTRY ---
//   const handleAdd = async (e) => {
//     e.preventDefault();
//     const val = inputValue.trim();
//     if (!chain[selectedLevel.parentKey] || !val) {
//       toast.error("Select parent and enter name");
//       return;
//     }
//     setLoading(true);
//     try {
//       const payload = {
//         name: val,
//         [selectedLevel.parentKey]: chain[selectedLevel.parentKey],
//         created_by: userId,
//       };
//       await projectInstance.post(selectedLevel.createApi, payload);
//       toast.success("Added successfully");
//       setInputValue("");
//       setChain((prev) => ({ ...prev })); // Triggers table reload
//     } catch (err) {
//       toast.error("API error");
//     }
//     setLoading(false);
//   };

//   return (
//     <div
//       className="flex min-h-screen"
//       style={{
//         background: palette.bg,
//       }}
//     >
//       <SideBarSetup />
//       <div className="flex-1 ml-[16%] mr-4 my-8">
//         <div className="max-w-4xl mx-auto">
//           {/* Header */}
//           <div className="mb-8">
//             <h1
//               className="text-2xl md:text-3xl font-semibold mb-2 tracking-tight"
//               style={{ color: palette.text }}
//             >
//               Category Management
//             </h1>
//             <p
//               className="text-base md:text-lg opacity-80"
//               style={{ color: palette.text }}
//             >
//               Organize and manage your project categories efficiently
//             </p>
//           </div>
//           {/* Category Level Selector */}
//           <div
//             className="rounded-xl p-6 mb-8"
//             style={{
//               background: palette.card,
//               border: `2px solid ${palette.border}`,
//               boxShadow: palette.shadow,
//             }}
//           >
//             <h2
//               className="text-lg font-semibold mb-4"
//               style={{ color: palette.text }}
//             >
//               Select Category Level
//             </h2>
//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
//               {CATEGORY_LEVELS.map((cat) => (
//                 <button
//                   key={cat.id}
//                   type="button"
//                   className={`py-4 px-2 rounded-lg border transition text-center duration-200 text-base font-medium ${
//                     selectedLevel.id === cat.id
//                       ? "shadow"
//                       : "hover:bg-[#fff6ea] hover:border-[#ffbe63a8]"
//                   }`}
//                   style={{
//                     background:
//                       selectedLevel.id === cat.id
//                         ? "#fff6ea"
//                         : palette.card,
//                     color:
//                       selectedLevel.id === cat.id
//                         ? "#c26600"
//                         : palette.text,
//                     border: `2px solid ${palette.border}`,
//                   }}
//                   onClick={() => setSelectedLevel(cat)}
//                 >
//                   <div className="mb-1 text-xl">{cat.icon}</div>
//                   <span>{cat.label}</span>
//                 </button>
//               ))}
//             </div>
//           </div>
//           {/* All Parent Dropdowns up to selected level */}
//           <div
//             className="rounded-xl p-6 mb-8"
//             style={{
//               background: palette.card,
//               border: `2px solid ${palette.border}`,
//               boxShadow: palette.shadow,
//             }}
//           >
//             {[...Array(selectedLevel.id)].map((_, idx) => {
//               const config = CATEGORY_LEVELS[idx];
//               const label = config.parentLabel;
//               const key = config.parentKey;
//               if (idx === 0) {
//                 return (
//                   <div className="mb-6" key={key}>
//                     <label className="block mb-2 font-semibold" style={{ color: palette.text }}>
//                       Select Project
//                     </label>
//                     <select
//                       value={chain.project}
//                       onChange={(e) => handleParentChange("project", e.target.value)}
//                       className="w-full p-4 border rounded-lg"
//                       style={{
//                         background: palette.input,
//                         color: palette.text,
//                         border: `1.5px solid ${palette.border}`,
//                       }}
//                     >
//                       <option value="">Choose Project</option>
//                       {projects.map((proj) => (
//                         <option key={proj.id.id} value={proj.id.id}>
//                           {proj.name}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 );
//               }
//               if (chain[CATEGORY_LEVELS[idx - 1].parentKey]) {
//                 return (
//                   <div className="mb-6" key={key}>
//                     <label className="block mb-2 font-semibold" style={{ color: palette.text }}>
//                       Select {label}
//                     </label>
//                     <select
//                       value={chain[key]}
//                       onChange={(e) => handleParentChange(key, e.target.value)}
//                       className="w-full p-4 border rounded-lg"
//                       style={{
//                         background: palette.input,
//                         color: palette.text,
//                         border: `1.5px solid ${palette.border}`,
//                       }}
//                     >
//                       <option value="">Choose {label}</option>
//                       {(options[key] || []).map((p) => (
//                         <option key={p.id} value={p.id}>
//                           {p.name}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 );
//               }
//               return null;
//             })}
//           </div>
//           {/* Add New Entry */}
//           {chain[selectedLevel.parentKey] && (
//             <div
//               className="rounded-xl p-6 mb-8"
//               style={{
//                 background: palette.card,
//                 border: `2px solid ${palette.border}`,
//                 boxShadow: palette.shadow,
//               }}
//             >
//               <h2 className="text-lg font-semibold mb-4" style={{ color: palette.text }}>
//                 Add New {selectedLevel.label}
//               </h2>
//               <div className="flex gap-3">
//                 <input
//                   value={inputValue}
//                   onChange={(e) => setInputValue(e.target.value)}
//                   onKeyPress={(e) => e.key === "Enter" && handleAdd(e)}
//                   placeholder={`Enter name for ${selectedLevel.label}`}
//                   className="flex-1 p-4 border rounded-lg text-base"
//                   style={{
//                     background: palette.input,
//                     color: palette.text,
//                     border: `1.5px solid ${palette.border}`,
//                   }}
//                 />
//                 <button
//                   type="button"
//                   onClick={handleAdd}
//                   disabled={loading}
//                   className="px-8 py-4 rounded-lg font-semibold transition"
//                   style={{
//                     background: loading
//                       ? "#ffe0b3"
//                       : "#ffbe63",
//                     color: loading ? "#d4ad7c" : "#ad5700",
//                     cursor: loading ? "not-allowed" : "pointer",
//                   }}
//                 >
//                   {loading ? "Adding..." : "+ Add"}
//                 </button>
//               </div>
//             </div>
//           )}
//           {/* Entries Table */}
//           {chain[selectedLevel.parentKey] && (
//             <div
//               className="rounded-xl"
//               style={{
//                 background: palette.card,
//                 border: `2px solid ${palette.border}`,
//                 boxShadow: palette.shadow,
//               }}
//             >
//               <div className="px-6 py-4" style={{ borderBottom: "1.5px solid #ffbe6320" }}>
//                 <h2 className="text-lg font-semibold" style={{ color: palette.text }}>
//                   {selectedLevel.label} List
//                 </h2>
//                 <p className="text-xs mt-1 opacity-70" style={{ color: palette.text }}>
//                   {entries.length} {entries.length === 1 ? "item" : "items"} found
//                 </p>
//               </div>
//               {loading ? (
//                 <div className="py-10 text-center">
//                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ffbe63] mx-auto mb-2"></div>
//                   <p className="text-base" style={{ color: "#d8b57a" }}>Loading...</p>
//                 </div>
//               ) : entries.length === 0 ? (
//                 <div className="py-12 text-center" style={{ color: "#ffbe63" }}>
//                   No entries yet. Add your first {selectedLevel.label.toLowerCase()}!
//                 </div>
//               ) : (
//                 <div className="overflow-x-auto">
//                   <table className="w-full text-left">
//                     <thead style={{ background: palette.tableHeader }}>
//                       <tr>
//                         <th className="px-6 py-4 font-medium" style={{ color: "#d17800" }}>
//                           Name
//                         </th>
//                         <th className="px-6 py-4 font-medium" style={{ color: "#d17800" }}>
//                           ID
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {entries.map((item, index) => (
//                         <tr
//                           key={item.id}
//                           style={{
//                             background: index % 2 === 1 ? palette.tableRowHover : "transparent",
//                           }}
//                         >
//                           <td className="px-6 py-4 font-medium" style={{ color: palette.text }}>
//                             {item.name}
//                           </td>
//                           <td className="px-6 py-4" style={{ color: palette.text }}>
//                             #{item.id}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default CategoryChecklist;



// import React, { useState, useEffect } from "react";
// import SideBarSetup from "./SideBarSetup";
// import { getProjectsByOwnership } from "../api"; // <-- Make sure this is imported
// import { projectInstance } from "../api/axiosInstance";
// import { toast } from "react-hot-toast";
// import { useSelector } from "react-redux";
// import { useTheme } from "../ThemeContext";

// const CATEGORY_LEVELS = [
//   {
//     id: 1,
//     label: "Category 1",
//     icon: "📋",
//     parentKey: "project",
//     parentLabel: "Project",
//     listApi: () => `/categories-simple/`,
//     createApi: `/categories-simple/`,
//     entryParentField: "project",
//   },
//   {
//     id: 2,
//     label: "Category 2",
//     icon: "📁",
//     parentKey: "category",
//     parentLabel: "Category 1",
//     listApi: () => `/category-level1-simple/`,
//     createApi: `/category-level1-simple/`,
//     entryParentField: "category",
//   },
//   {
//     id: 3,
//     label: "Category 3",
//     icon: "📂",
//     parentKey: "category_level1",
//     parentLabel: "Category 2",
//     listApi: () => `/category-level2-simple/`,
//     createApi: `/category-level2-simple/`,
//     entryParentField: "category_level1",
//   },
//   {
//     id: 4,
//     label: "Category 4",
//     icon: "🗂️",
//     parentKey: "category_level2",
//     parentLabel: "Category 3",
//     listApi: () => `/category-level3-simple/`,
//     createApi: `/category-level3-simple/`,
//     entryParentField: "category_level2",
//   },
//   {
//     id: 5,
//     label: "Category 5",
//     icon: "📑",
//     parentKey: "category_level3",
//     parentLabel: "Category 4",
//     listApi: () => `/category-level4-simple/`,
//     createApi: `/category-level4-simple/`,
//     entryParentField: "category_level3",
//   },
//   {
//     id: 6,
//     label: "Category 6",
//     icon: "📄",
//     parentKey: "category_level4",
//     parentLabel: "Category 5",
//     listApi: () => `/category-level5-simple/`,
//     createApi: `/category-level5-simple/`,
//     entryParentField: "category_level4",
//   },
// ];

// function CategoryChecklist() {
//   const userId = useSelector((state) => state.user.user.id);
//   const { theme } = useTheme();

//   // --- THEME PALETTE ---
//   const palette =
//     theme === "dark"
//       ? {
//           bg: "#191921",
//           card: "bg-[#23232e]",
//           text: "text-amber-200",
//           border: "border-[#facc1530]",
//           input: "bg-[#181820] text-amber-200",
//           select: "bg-[#23232e] text-amber-200",
//           th: "bg-[#181820] text-[#facc15]",
//           trHover: "hover:bg-[#23232e]",
//           shadow: "shadow-lg",
//           badge: "bg-[#fde047] text-[#181820]",
//         }
//       : {
//           bg: "#f7f8fa",
//           card: "bg-white",
//           text: "text-[#22223b]",
//           border: "border-[#ececf0]",
//           input: "bg-white text-[#22223b]",
//           select: "bg-white text-[#22223b]",
//           th: "bg-[#f6f8fd] text-[#9aa2bc]",
//           trHover: "hover:bg-[#f6f8fd]",
//           shadow: "shadow-sm",
//           badge: "bg-[#4375e8] text-white",
//         };

//   const [projects, setProjects] = useState([]);
//   const [chain, setChain] = useState({
//     project: "",
//     category: "",
//     category_level1: "",
//     category_level2: "",
//     category_level3: "",
//     category_level4: "",
//   });
//   const [options, setOptions] = useState({
//     project: [],
//     category: [],
//     category_level1: [],
//     category_level2: [],
//     category_level3: [],
//     category_level4: [],
//   });
//   const [entries, setEntries] = useState([]);
//   const [inputValue, setInputValue] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [selectedLevel, setSelectedLevel] = useState(CATEGORY_LEVELS[0]);

//   useEffect(() => {
//     (async () => {
//       try {
//         let user = null;
//         try {
//           user = JSON.parse(localStorage.getItem("USER_DATA"));
//           console.log(user);
          
//         } catch {}
//         let params = {};
//         if (user?.entity_id || user?.entity)
//           params.entity_id = user.entity_id || user.entity;
//         else if (user?.company_id || user?.company)
//           params.company_id = user.company_id || user.company;
//         else if (user?.org || user?.organization_id)
//           params.organization_id = user.org || user.organization_id;
//         if (Object.keys(params).length === 0) {
//           setProjects([]);
//           setOptions((prev) => ({ ...prev, project: [] }));
//           toast.error("No organization/company/entity found.");
//           return;
//         }
//         const res = await getProjectsByOwnership(params);
//         setProjects(res.data || []);
//         setOptions((prev) => ({ ...prev, project: res.data || [] }));
//       } catch {
//         toast.error("Failed to fetch user projects");
//       }
//     })();
//   }, []);

//   useEffect(() => {
//     const chainCopy = { ...chain };
//     const optionsCopy = { ...options };
//     let cutoff = CATEGORY_LEVELS[selectedLevel.id - 1]?.parentKey || "project";
//     let found = false;
//     for (const key of Object.keys(chainCopy)) {
//       if (key === cutoff) {
//         found = true;
//         continue;
//       }
//       if (found) {
//         chainCopy[key] = "";
//         optionsCopy[key] = [];
//       }
//     }
//     setChain(chainCopy);
//     setOptions(optionsCopy);
//     setEntries([]);
//     setInputValue("");
//   }, [selectedLevel]);

//   // --- HANDLE PARENT CHANGE ---
//   const handleParentChange = (key, value) => {
//     const newChain = { ...chain, [key]: value };
//     const newOptions = { ...options };
//     let found = false;
//     for (const k of Object.keys(chain)) {
//       if (k === key) {
//         found = true;
//         continue;
//       }
//       if (found) {
//         newChain[k] = "";
//         newOptions[k] = [];
//       }
//     }
//     setChain(newChain);
//     setOptions(newOptions);
//     setInputValue("");
//   };

//   // --- FETCH CHILD DROPDOWN OPTIONS (next level) ---
//   useEffect(() => {
//     if (selectedLevel.id === 1) return;
//     const prevLevelIdx = selectedLevel.id - 2;
//     const prevLevel = CATEGORY_LEVELS[prevLevelIdx];
//     const parentKey = prevLevel.parentKey;
//     const parentId = chain[parentKey];
//     if (!parentId) {
//       setOptions((prev) => ({ ...prev, [selectedLevel.parentKey]: [] }));
//       return;
//     }
//     setLoading(true);
//     projectInstance
//       .get(prevLevel.listApi())
//       .then((res) => {
//         const filtered = (res.data || []).filter(
//           (item) =>
//             String(item[prevLevel.entryParentField]) === String(parentId)
//         );
//         setOptions((prev) => ({
//           ...prev,
//           [selectedLevel.parentKey]: filtered,
//         }));
//       })
//       .catch(() => {
//         setOptions((prev) => ({ ...prev, [selectedLevel.parentKey]: [] }));
//       })
//       .finally(() => setLoading(false));
//   }, [selectedLevel, ...Object.values(chain).slice(0, -1)]);

//   // --- FETCH TABLE ENTRIES for current parent selection at this level ---
//   useEffect(() => {
//     if (!chain[selectedLevel.parentKey]) {
//       setEntries([]);
//       return;
//     }
//     setLoading(true);
//     projectInstance
//       .get(selectedLevel.listApi())
//       .then((res) => {
//         const filtered = (res.data || []).filter(
//           (item) =>
//             String(item[selectedLevel.entryParentField]) ===
//             String(chain[selectedLevel.parentKey])
//         );
//         setEntries(filtered);
//       })
//       .catch(() => setEntries([]))
//       .finally(() => setLoading(false));
//   }, [selectedLevel, chain[selectedLevel.parentKey]]);

//   // --- ADD NEW ENTRY ---
//   const handleAdd = async (e) => {
//     e.preventDefault();
//     const val = inputValue.trim();
//     if (!chain[selectedLevel.parentKey] || !val) {
//       toast.error("Select parent and enter name");
//       return;
//     }
//     setLoading(true);
//     try {
//       const payload = {
//         name: val,
//         [selectedLevel.parentKey]: chain[selectedLevel.parentKey],
//         created_by: userId,
//       };
//       await projectInstance.post(selectedLevel.createApi, payload);
//       toast.success("Added successfully");
//       setInputValue("");
//       setChain((prev) => ({ ...prev })); // Triggers table reload
//     } catch (err) {
//       toast.error("API error");
//     }
//     setLoading(false);
//   };

//   return (
//     <div className={`flex min-h-screen`} style={{ background: palette.bg }}>
//       <SideBarSetup />
//       <div className="flex-1 ml-[16%] mr-4 my-8">
//         <div className="max-w-4xl mx-auto">
//           {/* Header */}
//           <div className="mb-8">
//             <h1
//               className={`text-2xl md:text-3xl font-semibold mb-2 tracking-tight ${palette.text}`}
//             >
//               Category Management
//             </h1>
//             <p className={`text-base md:text-lg ${palette.text} opacity-80`}>
//               Organize and manage your project categories efficiently
//             </p>
//           </div>
//           {/* Category Level Selector */}
//           <div
//             className={`${palette.card} rounded-xl ${palette.border} p-6 mb-8 ${palette.shadow}`}
//           >
//             <h2 className={`text-lg font-semibold mb-4 ${palette.text}`}>
//               Select Category Level
//             </h2>
//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
//               {CATEGORY_LEVELS.map((cat) => (
//                 <button
//                   key={cat.id}
//                   type="button"
//                   className={`py-4 px-2 rounded-lg border transition text-center duration-200 text-base font-medium
//                   ${
//                     selectedLevel.id === cat.id
//                       ? `${palette.border} bg-[#f6f8fd] text-[#1e2a44] shadow`
//                       : `${palette.border} ${palette.card} ${palette.text} hover:bg-[#f6f8fd] hover:border-[#b4c0e6]`
//                   }
//                 `}
//                   onClick={() => setSelectedLevel(cat)}
//                 >
//                   <div className="mb-1 text-xl">{cat.icon}</div>
//                   <span>{cat.label}</span>
//                 </button>
//               ))}
//             </div>
//           </div>
//           {/* All Parent Dropdowns up to selected level */}
//           <div
//             className={`${palette.card} rounded-xl ${palette.border} p-6 mb-8 ${palette.shadow}`}
//           >
//             {[...Array(selectedLevel.id)].map((_, idx) => {
//               const config = CATEGORY_LEVELS[idx];
//               const label = config.parentLabel;
//               const key = config.parentKey;
//               if (idx === 0) {
//                 return (
//                   <div className="mb-6" key={key}>
//                     <label
//                       className={`block mb-2 font-semibold ${palette.text}`}
//                     >
//                       Select Project
//                     </label>
//                     <select
//                       value={chain.project}
//                       onChange={(e) =>
//                         handleParentChange("project", e.target.value)
//                       }
//                       className={`w-full p-4 border rounded-lg ${palette.select} ${palette.border} focus:ring-2 focus:ring-[#b4c0e6] focus:border-[#b4c0e6] transition`}
//                     >
//                       <option value="">Choose Project</option>
//                       {projects.map((proj) => (
//                         <option key={proj.id} value={proj.id}>
//                           {proj.name}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 );
//               }
//               if (chain[CATEGORY_LEVELS[idx - 1].parentKey]) {
//                 return (
//                   <div className="mb-6" key={key}>
//                     <label
//                       className={`block mb-2 font-semibold ${palette.text}`}
//                     >
//                       Select {label}
//                     </label>
//                     <select
//                       value={chain[key]}
//                       onChange={(e) => handleParentChange(key, e.target.value)}
//                       className={`w-full p-4 border rounded-lg ${palette.select} ${palette.border} focus:ring-2 focus:ring-[#b4c0e6] focus:border-[#b4c0e6] transition`}
//                     >
//                       <option value="">Choose {label}</option>
//                       {(options[key] || []).map((p) => (
//                         <option key={p.id} value={p.id}>
//                           {p.name}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 );
//               }
//               return null;
//             })}
//           </div>
//           {/* Add New Entry */}
//           {chain[selectedLevel.parentKey] && (
//             <div
//               className={`${palette.card} rounded-xl ${palette.border} p-6 mb-8 ${palette.shadow}`}
//             >
//               <h2 className={`text-lg font-semibold mb-4 ${palette.text}`}>
//                 Add New {selectedLevel.label}
//               </h2>
//               <div className="flex gap-3">
//                 <input
//                   value={inputValue}
//                   onChange={(e) => setInputValue(e.target.value)}
//                   onKeyPress={(e) => e.key === "Enter" && handleAdd(e)}
//                   placeholder={`Enter name for ${selectedLevel.label}`}
//                   className={`flex-1 p-4 border rounded-lg ${palette.input} ${palette.border} text-base`}
//                 />
//                 <button
//                   type="button"
//                   onClick={handleAdd}
//                   disabled={loading}
//                   className={`px-8 py-4 rounded-lg text-white font-semibold transition 
//                     ${
//                       loading
//                         ? "bg-[#b4c0e6] cursor-not-allowed"
//                         : "bg-[#4375e8] hover:bg-[#1e4fb2]"
//                     }`}
//                 >
//                   {loading ? "Adding..." : "+ Add"}
//                 </button>
//               </div>
//             </div>
//           )}
//           {/* Entries Table */}
//           {chain[selectedLevel.parentKey] && (
//             <div
//               className={`${palette.card} rounded-xl ${palette.border} ${palette.shadow}`}
//             >
//               <div className="px-6 py-4 border-b border-[#f1f2f6]">
//                 <h2 className={`text-lg font-semibold ${palette.text}`}>
//                   {selectedLevel.label} List
//                 </h2>
//                 <p className="text-xs mt-1 opacity-70">
//                   {entries.length} {entries.length === 1 ? "item" : "items"}{" "}
//                   found
//                 </p>
//               </div>
//               {loading ? (
//                 <div className="py-10 text-center">
//                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4375e8] mx-auto mb-2"></div>
//                   <p className="text-base text-[#b4c0e6]">Loading...</p>
//                 </div>
//               ) : entries.length === 0 ? (
//                 <div className="py-12 text-center text-[#b4c0e6]">
//                   No entries yet. Add your first{" "}
//                   {selectedLevel.label.toLowerCase()}!
//                 </div>
//               ) : (
//                 <div className="overflow-x-auto">
//                   <table className="w-full text-left">
//                     <thead className={`${palette.th}`}>
//                       <tr>
//                         <th className="px-6 py-4 font-medium">Name</th>
//                         <th className="px-6 py-4 font-medium">ID</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-[#ececf0]">
//                       {entries.map((item, index) => (
//                         <tr key={item.id} className={palette.trHover}>
//                           <td
//                             className={`px-6 py-4 font-medium ${palette.text}`}
//                           >
//                             {item.name}
//                           </td>
//                           <td className={`px-6 py-4 ${palette.text}`}>
//                             #{item.id}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default CategoryChecklist;


import React, { useState, useEffect } from "react";
import SideBarSetup from "./SideBarSetup";
import { getProjectsByOwnership } from "../api";
import { projectInstance } from "../api/axiosInstance";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useTheme } from "../ThemeContext";

const CATEGORY_LEVELS = [
  {
    id: 1,
    label: "Category 1",
    icon: "📋",
    parentKey: "project",
    parentLabel: "Project",
    listApi: () => `/categories-simple/`,
    createApi: `/categories-simple/`,
    entryParentField: "project",
  },
  {
    id: 2,
    label: "Category 2",
    icon: "📁",
    parentKey: "category",
    parentLabel: "Category 1",
    listApi: () => `/category-level1-simple/`,
    createApi: `/category-level1-simple/`,
    entryParentField: "category",
  },
  {
    id: 3,
    label: "Category 3",
    icon: "📂",
    parentKey: "category_level1",
    parentLabel: "Category 2",
    listApi: () => `/category-level2-simple/`,
    createApi: `/category-level2-simple/`,
    entryParentField: "category_level1",
  },
  {
    id: 4,
    label: "Category 4",
    icon: "🗂️",
    parentKey: "category_level2",
    parentLabel: "Category 3",
    listApi: () => `/category-level3-simple/`,
    createApi: `/category-level3-simple/`,
    entryParentField: "category_level2",
  },
  {
    id: 5,
    label: "Category 5",
    icon: "📑",
    parentKey: "category_level3",
    parentLabel: "Category 4",
    listApi: () => `/category-level4-simple/`,
    createApi: `/category-level4-simple/`,
    entryParentField: "category_level3",
  },
  {
    id: 6,
    label: "Category 6",
    icon: "📄",
    parentKey: "category_level4",
    parentLabel: "Category 5",
    listApi: () => `/category-level5-simple/`,
    createApi: `/category-level5-simple/`,
    entryParentField: "category_level4",
  },
];

const SIDEBAR_WIDTH = 0; // Change if your sidebar is a different width

function CategoryChecklist() {
  const userId = useSelector((state) => state.user.user.id);
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // --- PALETTE ---
  const ORANGE = "#ffbe63";
  const BG_OFFWHITE = "#fcfaf7";
  const bgColor = theme === "dark" ? "#191922" : BG_OFFWHITE;
  const cardColor = theme === "dark" ? "#23232c" : "#fff";
  const borderColor = ORANGE;
  const textColor = theme === "dark" ? "#fff" : "#222";
  const iconColor = ORANGE;
  const thBg = theme === "dark" ? "#181820" : "#f6f8fd";
  const thText = theme === "dark" ? "#ffbe63" : "#9aa2bc";
  const trHover = theme === "dark" ? "#23232c" : "#f6f8fd";
  const badgeBg = theme === "dark" ? "#ffbe63" : "#4375e8";
  const badgeText = theme === "dark" ? "#181820" : "#fff";
  const inputBg = theme === "dark" ? "#23232c" : "#fff";
  const inputText = theme === "dark" ? "#fff" : "#222";
  const selectBg = theme === "dark" ? "#23232c" : "#fff";
  const selectText = theme === "dark" ? "#fff" : "#222";
  const shadow =
    theme === "dark"
      ? "0 4px 24px 0 rgba(255, 190, 99, 0.08)"
      : "0 4px 24px 0 rgba(255, 190, 99, 0.04)";

  // Hamburger margin logic
  const contentMarginLeft = sidebarOpen ? SIDEBAR_WIDTH : 0;

  // Rest of your states...
  const [projects, setProjects] = useState([]);
  const [chain, setChain] = useState({
    project: "",
    category: "",
    category_level1: "",
    category_level2: "",
    category_level3: "",
    category_level4: "",
  });
  const [options, setOptions] = useState({
    project: [],
    category: [],
    category_level1: [],
    category_level2: [],
    category_level3: [],
    category_level4: [],
  });
  const [entries, setEntries] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(CATEGORY_LEVELS[0]);

  // Project fetch
  useEffect(() => {
    (async () => {
      try {
        let user = null;
        try {
          user = JSON.parse(localStorage.getItem("USER_DATA"));
        } catch {}
        let params = {};
        if (user?.entity_id || user?.entity)
          params.entity_id = user.entity_id || user.entity;
        else if (user?.company_id || user?.company)
          params.company_id = user.company_id || user.company;
        else if (user?.org || user?.organization_id)
          params.organization_id = user.org || user.organization_id;
        if (Object.keys(params).length === 0) {
          setProjects([]);
          setOptions((prev) => ({ ...prev, project: [] }));
          toast.error("No organization/company/entity found.");
          return;
        }
        const res = await getProjectsByOwnership(params);
        setProjects(res.data || []);
        setOptions((prev) => ({ ...prev, project: res.data || [] }));
      } catch {
        toast.error("Failed to fetch user projects");
      }
    })();
  }, []);

  // Chain & level reset
  useEffect(() => {
    const chainCopy = { ...chain };
    const optionsCopy = { ...options };
    let cutoff = CATEGORY_LEVELS[selectedLevel.id - 1]?.parentKey || "project";
    let found = false;
    for (const key of Object.keys(chainCopy)) {
      if (key === cutoff) {
        found = true;
        continue;
      }
      if (found) {
        chainCopy[key] = "";
        optionsCopy[key] = [];
      }
    }
    setChain(chainCopy);
    setOptions(optionsCopy);
    setEntries([]);
    setInputValue("");
  }, [selectedLevel]);

  // Handle parent change
  const handleParentChange = (key, value) => {
    const newChain = { ...chain, [key]: value };
    const newOptions = { ...options };
    let found = false;
    for (const k of Object.keys(chain)) {
      if (k === key) {
        found = true;
        continue;
      }
      if (found) {
        newChain[k] = "";
        newOptions[k] = [];
      }
    }
    setChain(newChain);
    setOptions(newOptions);
    setInputValue("");
  };

  // Child dropdown options (next level)
  useEffect(() => {
    if (selectedLevel.id === 1) return;
    const prevLevelIdx = selectedLevel.id - 2;
    const prevLevel = CATEGORY_LEVELS[prevLevelIdx];
    const parentKey = prevLevel.parentKey;
    const parentId = chain[parentKey];
    if (!parentId) {
      setOptions((prev) => ({ ...prev, [selectedLevel.parentKey]: [] }));
      return;
    }
    setLoading(true);
    projectInstance
      .get(prevLevel.listApi())
      .then((res) => {
        const filtered = (res.data || []).filter(
          (item) =>
            String(item[prevLevel.entryParentField]) === String(parentId)
        );
        setOptions((prev) => ({
          ...prev,
          [selectedLevel.parentKey]: filtered,
        }));
      })
      .catch(() => {
        setOptions((prev) => ({ ...prev, [selectedLevel.parentKey]: [] }));
      })
      .finally(() => setLoading(false));
  }, [selectedLevel, ...Object.values(chain).slice(0, -1)]);

  // Table entries
  useEffect(() => {
    if (!chain[selectedLevel.parentKey]) {
      setEntries([]);
      return;
    }
    setLoading(true);
    projectInstance
      .get(selectedLevel.listApi())
      .then((res) => {
        const filtered = (res.data || []).filter(
          (item) =>
            String(item[selectedLevel.entryParentField]) ===
            String(chain[selectedLevel.parentKey])
        );
        setEntries(filtered);
      })
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [selectedLevel, chain[selectedLevel.parentKey]]);

  // Add new entry
  const handleAdd = async (e) => {
    e.preventDefault();
    const val = inputValue.trim();
    if (!chain[selectedLevel.parentKey] || !val) {
      toast.error("Select parent and enter name");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: val,
        [selectedLevel.parentKey]: chain[selectedLevel.parentKey],
        created_by: userId,
      };
      await projectInstance.post(selectedLevel.createApi, payload);
      toast.success("Added successfully");
      setInputValue("");
      setChain((prev) => ({ ...prev })); // Triggers table reload
    } catch (err) {
      toast.error("API error");
    }
    setLoading(false);
  };

  // --- RENDER ---
  return (
    <div className="flex min-h-screen" style={{ background: bgColor }}>
      {/* Hamburger */}
      <button
        aria-label="Toggle Sidebar"
        onClick={() => setSidebarOpen((v) => !v)}
        style={{
          position: "fixed",
          top: 18,
          left: 16,
          zIndex: 100,
          background: cardColor,
          color: iconColor,
          border: `2px solid ${borderColor}`,
          borderRadius: 8,
          padding: 10,
          boxShadow: shadow,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="24"
          height="24"
          fill="none"
          stroke={iconColor}
          strokeWidth={2}
        >
          <rect x="4" y="6" width="16" height="2" rx="1" />
          <rect x="4" y="11" width="16" height="2" rx="1" />
          <rect x="4" y="16" width="16" height="2" rx="1" />
        </svg>
      </button>

      {/* Sidebar */}
      <SideBarSetup sidebarOpen={sidebarOpen} />

      {/* Main Content */}
      <div
        className="flex-1 mr-4 my-8 transition-all duration-300"
        style={{
          marginLeft: contentMarginLeft,
          transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 600,
                marginBottom: 8,
                letterSpacing: "-0.01em",
                color: textColor,
              }}
            >
              Category Management
            </h1>
            <p style={{ fontSize: 17, color: textColor, opacity: 0.8 }}>
              Organize and manage your project categories efficiently
            </p>
          </div>

          {/* Category Level Selector */}
          <div
            style={{
              background: cardColor,
              borderRadius: 18,
              border: `2px solid ${borderColor}`,
              padding: 24,
              marginBottom: 32,
              boxShadow: shadow,
            }}
          >
            <h2
              style={{
                fontWeight: 600,
                fontSize: 18,
                marginBottom: 16,
                color: textColor,
              }}
            >
              Select Category Level
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
                gap: 10,
              }}
            >
              {CATEGORY_LEVELS.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  style={{
                    padding: "16px 8px",
                    borderRadius: 12,
                    border: `2px solid ${borderColor}`,
                    background:
                      selectedLevel.id === cat.id ? BG_OFFWHITE : cardColor,
                    color: selectedLevel.id === cat.id ? "#1e2a44" : textColor,
                    boxShadow: selectedLevel.id === cat.id ? shadow : "none",
                    fontWeight: 500,
                    fontSize: 15,
                    marginBottom: 0,
                    transition: "all 0.2s",
                    cursor: "pointer",
                  }}
                  onClick={() => setSelectedLevel(cat)}
                >
                  <div style={{ fontSize: 22, marginBottom: 4 }}>
                    {cat.icon}
                  </div>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Parent Dropdowns up to selected level */}
          <div
            style={{
              background: cardColor,
              borderRadius: 18,
              border: `2px solid ${borderColor}`,
              padding: 24,
              marginBottom: 32,
              boxShadow: shadow,
            }}
          >
            {[...Array(selectedLevel.id)].map((_, idx) => {
              const config = CATEGORY_LEVELS[idx];
              const label = config.parentLabel;
              const key = config.parentKey;
              if (idx === 0) {
                return (
                  <div style={{ marginBottom: 24 }} key={key}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: 8,
                        fontWeight: 600,
                        color: textColor,
                      }}
                    >
                      Select Project
                    </label>
                    <select
                      value={chain.project}
                      onChange={(e) =>
                        handleParentChange("project", e.target.value)
                      }
                      style={{
                        width: "100%",
                        padding: 16,
                        borderRadius: 12,
                        border: `2px solid ${borderColor}`,
                        background: selectBg,
                        color: selectText,
                        fontWeight: 500,
                        fontSize: 16,
                        marginBottom: 0,
                        outline: "none",
                        transition: "border 0.2s",
                      }}
                    >
                      <option value="">Choose Project</option>
                      {projects.map((proj) => (
                        <option key={proj.id} value={proj.id}>
                          {proj.name}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }
              if (chain[CATEGORY_LEVELS[idx - 1].parentKey]) {
                return (
                  <div style={{ marginBottom: 24 }} key={key}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: 8,
                        fontWeight: 600,
                        color: textColor,
                      }}
                    >
                      Select {label}
                    </label>
                    <select
                      value={chain[key]}
                      onChange={(e) => handleParentChange(key, e.target.value)}
                      style={{
                        width: "100%",
                        padding: 16,
                        borderRadius: 12,
                        border: `2px solid ${borderColor}`,
                        background: selectBg,
                        color: selectText,
                        fontWeight: 500,
                        fontSize: 16,
                        marginBottom: 0,
                        outline: "none",
                        transition: "border 0.2s",
                      }}
                    >
                      <option value="">Choose {label}</option>
                      {(options[key] || []).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }
              return null;
            })}
          </div>

          {/* Add New Entry */}
          {chain[selectedLevel.parentKey] && (
            <div
              style={{
                background: cardColor,
                borderRadius: 18,
                border: `2px solid ${borderColor}`,
                padding: 24,
                marginBottom: 32,
                boxShadow: shadow,
              }}
            >
              <h2
                style={{
                  fontWeight: 600,
                  fontSize: 18,
                  marginBottom: 16,
                  color: textColor,
                }}
              >
                Add New {selectedLevel.label}
              </h2>
              <div style={{ display: "flex", gap: 12 }}>
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAdd(e)}
                  placeholder={`Enter name for ${selectedLevel.label}`}
                  style={{
                    flex: 1,
                    padding: 16,
                    borderRadius: 12,
                    border: `2px solid ${borderColor}`,
                    background: inputBg,
                    color: inputText,
                    fontSize: 16,
                  }}
                />
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={loading}
                  style={{
                    padding: "0 32px",
                    borderRadius: 12,
                    fontWeight: 600,
                    fontSize: 16,
                    background: badgeBg,
                    color: badgeText,
                    border: "none",
                    transition: "background 0.2s",
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Adding..." : "+ Add"}
                </button>
              </div>
            </div>
          )}

          {/* Entries Table */}
          {chain[selectedLevel.parentKey] && (
            <div
              style={{
                background: cardColor,
                borderRadius: 18,
                border: `2px solid ${borderColor}`,
                boxShadow: shadow,
              }}
            >
              <div
                style={{
                  padding: "20px 24px",
                  borderBottom: `1px solid #ececf0`,
                }}
              >
                <h2 style={{ fontWeight: 600, fontSize: 18, color: textColor }}>
                  {selectedLevel.label} List
                </h2>
                <p style={{ fontSize: 12, marginTop: 4, opacity: 0.7 }}>
                  {entries.length} {entries.length === 1 ? "item" : "items"}{" "}
                  found
                </p>
              </div>
              {loading ? (
                <div style={{ padding: "40px 0", textAlign: "center" }}>
                  <div
                    style={{
                      animation: "spin 1s linear infinite",
                      borderRadius: "50%",
                      height: 32,
                      width: 32,
                      borderBottom: `3px solid ${badgeBg}`,
                      margin: "0 auto 8px",
                    }}
                  />
                  <p style={{ color: badgeBg }}>Loading...</p>
                </div>
              ) : entries.length === 0 ? (
                <div
                  style={{
                    padding: "48px 0",
                    textAlign: "center",
                    color: badgeBg,
                  }}
                >
                  No entries yet. Add your first{" "}
                  {selectedLevel.label.toLowerCase()}!
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", textAlign: "left" }}>
                    <thead>
                      <tr>
                        <th
                          style={{
                            padding: "16px 24px",
                            fontWeight: 500,
                            background: thBg,
                            color: thText,
                            fontSize: 16,
                          }}
                        >
                          Name
                        </th>
                        <th
                          style={{
                            padding: "16px 24px",
                            fontWeight: 500,
                            background: thBg,
                            color: thText,
                            fontSize: 16,
                          }}
                        >
                          ID
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((item, index) => (
                        <tr
                          key={item.id}
                          style={{
                            background: index % 2 === 1 ? trHover : cardColor,
                            transition: "background 0.2s",
                          }}
                        >
                          <td
                            style={{
                              padding: "16px 24px",
                              color: textColor,
                              fontWeight: 500,
                            }}
                          >
                            {item.name}
                          </td>
                          <td
                            style={{ padding: "16px 24px", color: textColor }}
                          >
                            #{item.id}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CategoryChecklist;

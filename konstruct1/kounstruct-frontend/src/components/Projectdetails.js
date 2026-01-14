// import React, { useEffect, useState } from "react";
// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import projectImage from "../Images/Project.png";
// import { getProjectLevelDetails } from "../api";
// import toast from "react-hot-toast";
// import SiteBarHome from "./SiteBarHome";
// import axios from "axios";
// import { useTheme } from "../ThemeContext";
// import { projectInstance } from '../api/axiosInstance';

// const ProjectDetailsPage = () => {
//   const { theme } = useTheme();

//   // Theme palette
//   const palette =
//     theme === "dark"
//       ? {
//           bg: "bg-slate-900",
//           card: "bg-slate-800 border-slate-700 text-slate-100",
//           border: "border-slate-700",
//           text: "text-slate-100",
//           heading: "text-purple-300",
//           shadow: "shadow-2xl",
//           imgOverlay: "bg-slate-900 bg-opacity-60 text-slate-100",
//         }
//       : {
//           bg: "bg-gray-100",
//           card: "bg-white border-gray-200 text-gray-900",
//           border: "border-gray-200",
//           text: "text-gray-900",
//           heading: "text-purple-800",
//           shadow: "shadow-lg",
//           imgOverlay: "bg-gray-800 bg-opacity-50 text-white",
//         };

//   const { id: projectIdFromUrl } = useParams();
//   const location = useLocation();
//   const navigate = useNavigate();

//   const projectFromState = location.state?.project;
//   const projectId =
//     projectFromState?.id || projectFromState?.project_id || projectIdFromUrl;

//   const projectImg = projectFromState?.image_url || projectImage;
//   const [projectLevelData, setProjectLevelData] = useState([]);

//   // NEW: Project name state (get from state, else fallback)
//   const [projectName, setProjectName] = useState(
//     projectFromState?.name || 
//     projectFromState?.project_name || 
//     ""
//   );

//   // 1. Fetch project levels (unchanged)
//   useEffect(() => {
//     if (!projectId) {
//       navigate("/");
//       return;
//     }
//     const fetchProjectTower = async () => {
//       try {
//         const token = localStorage.getItem("ACCESS_TOKEN");
//         const response = await projectInstance.get(
//           `/buildings/by_project/${projectId}/`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );
//         if (response.status === 200 && Array.isArray(response.data)) {
//           setProjectLevelData(response.data);
//         } else {
//           setProjectLevelData([]);
//           toast.error("Invalid or empty response from server.");
//         }
//       } catch (error) {
//         setProjectLevelData([]);
//         toast.error("Something went wrong while fetching project levels.");
//       }
//     };
//     fetchProjectTower();
//   }, [projectId, navigate]);

//   // 2. Fetch project name if not present
//   useEffect(() => {
//     if (!projectName && projectId) {
//       const fetchProjectName = async () => {
//         try {
//           const token = localStorage.getItem("ACCESS_TOKEN");
//           const response = await projectInstance.get(
//             `/projects/${projectId}/`,
//             {
//               headers: {
//                 Authorization: `Bearer ${token}`,
//                 "Content-Type": "application/json",
//               },
//             }
//           );
//           if (response.status === 200 && response.data?.name) {
//             setProjectName(response.data.name);
//           } else {
//             setProjectName(`Project ${projectId}`);
//           }
//         } catch {
//           setProjectName(`Project ${projectId}`);
//         }
//       };
//       fetchProjectName();
//     }
//   }, [projectId, projectName]);

//   const handleImageClick = (proj) => {
//     navigate(`/Level/${proj}`, {
//       state: { 
//         projectLevelData,
//         projectId: projectId
//       },
//     });
//   };

//   const handleBack = () => {
//     navigate(-1);
//   };

//   return (
//     <div className={`flex ${palette.bg} min-h-screen`}>
//       {/* <SiteBarHome /> */}
// <div className="my-5 w-full max-w-7xl mt-5 mx-auto">
//         <div className={`pt-3 px-5 pb-8 rounded ${palette.card} ${palette.shadow} ${palette.border} border`}>
//           <div className="mb-8">
//             {/* USE PROJECT NAME, fall back to 'Project {id}' */}
//             <h2 className={`text-4xl font-bold text-center mb-4 ${palette.heading}`}>
//               {projectName || `Project ${projectId}`}
//             </h2>
//           </div>
//           <div>
//             {projectLevelData && projectLevelData.length > 0 ? (
//               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
//                 {projectLevelData.map((proj) => (
//                   <div
//                     key={proj.id}
//                     className={`relative rounded-xl overflow-hidden cursor-pointer transition transform hover:scale-105 ${palette.card} ${palette.shadow} ${palette.border} border`}
//                     onClick={() => handleImageClick(proj.id)}
//                   >
//                     <img
//                       src={projectImg}
//                       alt={`${
//                         proj.name || proj.naming_convention || "Project"
//                       } Background`}
//                       className="w-full h-80 object-cover"
//                     />
//                     <div className={`absolute bottom-0 left-0 right-0 p-2 text-sm font-semibold ${palette.imgOverlay}`}>
//                       {proj.name}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className={`text-center ${palette.text} text-lg font-semibold mt-10`}>
//                 No projects available
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };




















































// import React, { useEffect, useState } from "react";
// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import projectImage from "../Images/Project.png";
// import { getProjectLevelDetails } from "../api";
// import toast from "react-hot-toast";
// import SiteBarHome from "./SiteBarHome";
// import axios from "axios";
// import { useTheme } from "../ThemeContext";
// import { projectInstance } from '../api/axiosInstance';

// // Helper to check sidebar visibility
// function isSidebarVisible() {
//   const role = (localStorage.getItem("ROLE") || "").trim().toUpperCase();
//   const HIDE_SIDEBAR_ROLES = [
//     "INTIALIZER",
//     "INITIALIZER",
//     "CHECKER",
//     "MAKER",
//     "INSPECTOR",
//     "SUPERVISOR"
//   ];
//   return !HIDE_SIDEBAR_ROLES.includes(role);
// }

// const ProjectDetailsPage = () => {
//   const { theme } = useTheme();
//   const sidebarVisible = isSidebarVisible();

//   // --- Theme palette ---
//   const palette =
//     theme === "dark"
//       ? {
//           bg: "bg-slate-900",
//           card: "bg-slate-800 border-slate-700 text-slate-100",
//           border: "border-slate-700",
//           text: "text-slate-100",
//           heading: "text-purple-300",
//           shadow: "shadow-2xl",
//           imgOverlay: "bg-slate-900 bg-opacity-60 text-slate-100",
//         }
//       : {
//           bg: "bg-gray-100",
//           card: "bg-white border-gray-200 text-gray-900",
//           border: "border-gray-200",
//           text: "text-gray-900",
//           heading: "text-purple-800",
//           shadow: "shadow-lg",
//           imgOverlay: "bg-gray-800 bg-opacity-50 text-white",
//         };

//   const { id: projectIdFromUrl } = useParams();
//   const location = useLocation();
//   const navigate = useNavigate();

//   const projectFromState = location.state?.project;
//   const projectId =
//     projectFromState?.id || projectFromState?.project_id || projectIdFromUrl;

//   const projectImg = projectFromState?.image_url || projectImage;
//   const [projectLevelData, setProjectLevelData] = useState([]);
//   // NEW: State to hold the project name
//   const [projectName, setProjectName] = useState(
//     projectFromState?.project_name || ""
//   );

//   useEffect(() => {
//     if (!projectId) {
//       navigate("/");
//       return;
//     }
//     // Fetch the list of towers/buildings for this project
//     const fetchProjectTower = async () => {
//       try {
//         const token = localStorage.getItem("ACCESS_TOKEN");
//         const response = await projectInstance.get(
//           `/buildings/by_project/${projectId}/`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );
//         if (response.status === 200 && Array.isArray(response.data)) {
//           setProjectLevelData(response.data);
//         } else {
//           setProjectLevelData([]);
//           toast.error("Invalid or empty response from server.");
//         }
//       } catch (error) {
//         setProjectLevelData([]);
//         toast.error("Something went wrong while fetching project levels.");
//       }
//     };
//     fetchProjectTower();

//     // Fetch project name from backend if not available in state
//     if (!projectName && projectId) {
//       const fetchProject = async () => {
//         try {
//           const token = localStorage.getItem("ACCESS_TOKEN");
//           const response = await projectInstance.get(
//             `/projects/${projectId}/`,
//             {
//               headers: {
//                 Authorization: `Bearer ${token}`,
//                 "Content-Type": "application/json",
//               },
//             }
//           );
//           if (response.status === 200 && response.data?.name) {
//             setProjectName(response.data.name);
//           } else {
//             setProjectName(`Project ${projectId}`);
//           }
//         } catch (error) {
//           setProjectName(`Project ${projectId}`);
//         }
//       };
//       fetchProject();
//     }
//   }, [projectId, navigate, projectName]);

//   const handleImageClick = (proj) => {
//     navigate(`/Level/${proj}`, {
//       state: { 
//         projectLevelData,
//         projectId: projectId
//       },
//     });
//   };

//   // Optional: "Back" button if you want it
//   // const handleBack = () => {
//   //   navigate(-1);
//   // };

//   return (
//     <div className={`flex ${palette.bg} min-h-screen`}>
//       {sidebarVisible && <SiteBarHome />}
//       <div
//         className={`my-5 ${
//           sidebarVisible
//             ? "w-[85%] mt-5 ml-[16%] mr-[1%]"
//             : "w-full mt-5 ml-0 mr-0"
//         }`}
//       >
//         <div className={`max-w-7xl mx-auto pt-3 px-5 pb-8 rounded ${palette.card} ${palette.shadow} ${palette.border} border`}>
//           <div className="mb-8">
//             <h2 className={`text-4xl font-bold text-center mb-4 ${palette.heading}`}>
//               {projectName || `Project ${projectId}`}
//             </h2>
//           </div>
//           <div>
//             {projectLevelData && projectLevelData.length > 0 ? (
//               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
//                 {projectLevelData.map((proj) => (
//                   <div
//                     key={proj.id}
//                     className={`relative rounded-xl overflow-hidden cursor-pointer transition transform hover:scale-105 ${palette.card} ${palette.shadow} ${palette.border} border`}
//                     onClick={() => handleImageClick(proj.id)}
//                   >
//                     <img
//                       src={projectImg}
//                       alt={`${
//                         proj.name || proj.naming_convention || "Project"
//                       } Background`}
//                       className="w-full h-80 object-cover"
//                     />
//                     <div className={`absolute bottom-0 left-0 right-0 p-2 text-sm font-semibold ${palette.imgOverlay}`}>
//                       {proj.name}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className={`text-center ${palette.text} text-lg font-semibold mt-10`}>
//                 No projects available
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProjectDetailsPage;


// import React, { useEffect, useState } from "react";
// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import projectImage from "../Images/Project.png";
// import toast from "react-hot-toast";
// import SiteBarHome from "./SiteBarHome";
// import { useTheme } from "../ThemeContext";
// import { projectInstance } from '../api/axiosInstance';

// // --- Helper: Detect if sidebar should show ---
// function isSidebarVisible() {
//   const role = (localStorage.getItem("ROLE") || "").trim().toUpperCase();
//   const HIDE_SIDEBAR_ROLES = [
//     "INTIALIZER",
//     "INITIALIZER",
//     "CHECKER",
//     "MAKER",
//     "INSPECTOR",
//     "SUPERVISOR"
//   ];
//   return !HIDE_SIDEBAR_ROLES.includes(role);
// }

// // --- Helper: Detect MANAGER role ---
// function isManager() {
//   const role = (localStorage.getItem("ROLE") || "").trim().toUpperCase();
//   return role === "MANAGER";
// }

// const ProjectDetailsPage = () => {
//   const { theme } = useTheme();
//   const sidebarVisible = isSidebarVisible();

//   // --- Theme palette ---
//   const palette =
//     theme === "dark"
//       ? {
//           bg: "bg-slate-900",
//           card: "bg-slate-800 border-slate-700 text-slate-100",
//           border: "border-slate-700",
//           text: "text-slate-100",
//           heading: "text-purple-300",
//           shadow: "shadow-2xl",
//           imgOverlay: "bg-slate-900 bg-opacity-60 text-slate-100",
//         }
//       : {
//           bg: "bg-gray-100",
//           card: "bg-white border-gray-200 text-gray-900",
//           border: "border-gray-200",
//           text: "text-gray-900",
//           heading: "text-purple-800",
//           shadow: "shadow-lg",
//           imgOverlay: "bg-gray-800 bg-opacity-50 text-white",
//         };

//   const { id: projectIdFromUrl } = useParams();
//   const location = useLocation();
//   const navigate = useNavigate();

//   const projectFromState = location.state?.project;
//   const projectId =
//     projectFromState?.id || projectFromState?.project_id || projectIdFromUrl;

//   const projectImg = projectFromState?.image_url || projectImage;
//   const [projectLevelData, setProjectLevelData] = useState([]);
//   const [projectName, setProjectName] = useState(
//     projectFromState?.project_name || ""
//   );
//   const [showNoAccess, setShowNoAccess] = useState(false);

//   useEffect(() => {
//     if (!projectId) {
//       navigate("/");
//       return;
//     }
//     // Fetch the list of towers/buildings for this project
//     const fetchProjectTower = async () => {
//       try {
//         const token = localStorage.getItem("ACCESS_TOKEN");
//         const response = await projectInstance.get(
//           `/buildings/by_project/${projectId}/`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );
//         if (response.status === 200 && Array.isArray(response.data)) {
//           setProjectLevelData(response.data);
//         } else {
//           setProjectLevelData([]);
//           toast.error("Invalid or empty response from server.");
//         }
//       } catch (error) {
//         setProjectLevelData([]);
//         toast.error("Something went wrong while fetching project levels.");
//       }
//     };
//     fetchProjectTower();

//     // Fetch project name from backend if not available in state
//     if (!projectName && projectId) {
//       const fetchProject = async () => {
//         try {
//           const token = localStorage.getItem("ACCESS_TOKEN");
//           const response = await projectInstance.get(
//             `/projects/${projectId}/`,
//             {
//               headers: {
//                 Authorization: `Bearer ${token}`,
//                 "Content-Type": "application/json",
//               },
//             }
//           );
//           if (response.status === 200 && response.data?.name) {
//             setProjectName(response.data.name);
//           } else {
//             setProjectName(`Project ${projectId}`);
//           }
//         } catch (error) {
//           setProjectName(`Project ${projectId}`);
//         }
//       };
//       fetchProject();
//     }
//   }, [projectId, navigate, projectName]);

//   const handleImageClick = (projId) => {
//     if (isManager()) {
//       setShowNoAccess(true);
//       return;
//     }
//     navigate(`/Level/${projId}`, {
//       state: { 
//         projectLevelData,
//         projectId: projectId
//       },
//     });
//   };

//   return (
//     <div className={`flex ${palette.bg} min-h-screen`}>
//       {sidebarVisible && <SiteBarHome />}
//       {/* Modal for "No Access" */}
//       {showNoAccess && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
//           <div className="bg-white rounded-xl p-8 shadow-lg max-w-md text-center">
//             <h3 className="text-2xl font-bold mb-4 text-red-600">No Access</h3>
//             <p className="mb-6 text-gray-700">You do not have permission to view project details.</p>
//             <button
//               onClick={() => setShowNoAccess(false)}
//               className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-xl transition"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       )}
//       <div
//         className={`my-5 ${
//           sidebarVisible
//             ? "w-[85%] mt-5 ml-[16%] mr-[1%]"
//             : "w-full mt-5 ml-0 mr-0"
//         }`}
//       >
//         <div className={`max-w-7xl mx-auto pt-3 px-5 pb-8 rounded ${palette.card} ${palette.shadow} ${palette.border} border`}>
//           <div className="mb-8">
//             <h2 className={`text-4xl font-bold text-center mb-4 ${palette.heading}`}>
//               {projectName || `Project ${projectId}`}
//             </h2>
//           </div>
//           <div>
//             {projectLevelData && projectLevelData.length > 0 ? (
//               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
//                 {projectLevelData.map((proj) => (
//                   <div
//                     key={proj.id}
//                     className={
//                       `relative rounded-xl overflow-hidden transition transform hover:scale-105 ${palette.card} ${palette.shadow} ${palette.border} border` +
//                       (isManager() ? ' opacity-60 cursor-not-allowed pointer-events-auto' : ' cursor-pointer')
//                     }
//                     onClick={() => handleImageClick(proj.id)}
//                     style={isManager() ? { pointerEvents: "auto" } : {}}
//                   >
//                     <img
//                       src={projectImg}
//                       alt={`${proj.name || proj.naming_convention || "Project"} Background`}
//                       className="w-full h-80 object-cover"
//                       style={isManager() ? { filter: "grayscale(0.7)" } : {}}
//                     />
//                     <div className={`absolute bottom-0 left-0 right-0 p-2 text-sm font-semibold ${palette.imgOverlay}`}>
//                       {proj.name}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className={`text-center ${palette.text} text-lg font-semibold mt-10`}>
//                 No projects available
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProjectDetailsPage;




// // ProjectDetailsPage.jsx — ✅ Tower checklist badge + ✅ Modal + ✅ "Initialize Checklist" button (READY TO PASTE)
// import React, { useEffect, useMemo, useState } from "react";
// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import projectImage from "../Images/Project.png";
// import toast from "react-hot-toast";
// import axios from "axios";
// import { useTheme } from "../ThemeContext";
// import { projectInstance } from "../api/axiosInstance";

// const ProjectDetailsPage = () => {
//   const { theme } = useTheme();

//   // THEME palette
//   const ORANGE = "#ffbe63";
//   const BG_OFFWHITE = "#fcfaf7";
//   const bgColor = theme === "dark" ? "#191922" : BG_OFFWHITE;
//   const cardColor = theme === "dark" ? "#23232c" : "#fff";
//   const borderColor = ORANGE;
//   const textColor = theme === "dark" ? "#fff" : "#222";

//   // ✅ APIs
//   const CHECKLIST_API_URL = "https://konstruct.world/checklists/transfer-getchchklist/";
//   const START_CHECKLIST_API_BASE = "https://konstruct.world/checklists/start-checklist/"; // + {id}/

//   const { id: projectIdFromUrl } = useParams();
//   const location = useLocation();
//   const navigate = useNavigate();

//   const projectFromState = location.state?.project;
//   const projectId =
//     projectFromState?.id || projectFromState?.project_id || projectIdFromUrl;

//   const projectImg = projectFromState?.image_url || projectImage;
//   const [projectLevelData, setProjectLevelData] = useState([]);

//   // Project name
//   const [projectName, setProjectName] = useState(
//     projectFromState?.name || projectFromState?.project_name || ""
//   );

//   // per tower meta for badge
//   const [towerChecklistMeta, setTowerChecklistMeta] = useState({});

//   // cache full details per tower (for modal)
//   const [towerChecklistDetails, setTowerChecklistDetails] = useState({});

//   // modal state
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [activeTower, setActiveTower] = useState(null); // tower object
//   const [modalLoading, setModalLoading] = useState(false);
//   const [modalError, setModalError] = useState("");
//   const [modalData, setModalData] = useState(null);

//   // ✅ per-checklist "starting" state
//   const [startingById, setStartingById] = useState({});

//   // token + headers
//   const token = localStorage.getItem("ACCESS_TOKEN");
//   const authHeaders = useMemo(() => {
//     if (!token) return {};
//     return {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     };
//   }, [token]);

//   const fmtDateTime = (v) => {
//     if (!v) return "-";
//     try {
//       return new Date(v).toLocaleString("en-IN");
//     } catch {
//       return String(v);
//     }
//   };

//   const flattenChecklists = (apiData) => {
//   const results = Array.isArray(apiData?.results) ? apiData.results : [];
//   const flattened = [];

//   for (const r of results) {
//     const legacy = Array.isArray(r?.checklists) ? r.checklists : [];
//     const available = Array.isArray(r?.available_for_me) ? r.available_for_me : [];
//     const assigned = Array.isArray(r?.assigned_to_me) ? r.assigned_to_me : [];

//     for (const c of [...available, ...assigned, ...legacy]) {
//       if (c && c.id != null) flattened.push(c);
//     }
//   }

//   return flattened;
// };


//   const applyChecklistUpdateIntoTransferResponse = (data, updatedChecklist) => {
//   if (!data || !updatedChecklist?.id) return data;

//   const next = { ...data };
//   if (!Array.isArray(next.results)) return next;

//   const patchArr = (arr) =>
//     Array.isArray(arr)
//       ? arr.map((c) =>
//           c?.id === updatedChecklist.id ? { ...c, ...updatedChecklist } : c
//         )
//       : arr;

//   next.results = next.results.map((group) => {
//     if (!group || typeof group !== "object") return group;

//     return {
//       ...group,
//       // ✅ support new response shape
//       available_for_me: patchArr(group.available_for_me),
//       assigned_to_me: patchArr(group.assigned_to_me),

//       // ✅ backward compatibility (old)
//       checklists: patchArr(group.checklists),
//     };
//   });

//   return next;
// };

//   // 1) Fetch towers/buildings for project
//   useEffect(() => {
//     if (!projectId) {
//       navigate("/");
//       return;
//     }

//     const fetchProjectTower = async () => {
//       try {
//         if (!token) {
//           toast.error("Token missing. Please login again.");
//           return;
//         }
//         const response = await projectInstance.get(
//           `/buildings/by_project/${projectId}/`,
//           { headers: authHeaders }
//         );

//         if (response.status === 200 && Array.isArray(response.data)) {
//           setProjectLevelData(response.data);
//         } else {
//           setProjectLevelData([]);
//           toast.error("Invalid or empty response from server.");
//         }
//       } catch {
//         setProjectLevelData([]);
//         toast.error("Something went wrong while fetching project levels.");
//       }
//     };

//     fetchProjectTower();
//   }, [projectId, navigate, token, authHeaders]);

//   // 2) Fetch project name if not present
//   useEffect(() => {
//     if (!projectName && projectId) {
//       const fetchProjectName = async () => {
//         try {
//           if (!token) return;
//           const response = await projectInstance.get(`/projects/${projectId}/`, {
//             headers: authHeaders,
//           });
//           if (response.status === 200 && response.data?.name) {
//             setProjectName(response.data.name);
//           } else {
//             setProjectName(`Project ${projectId}`);
//           }
//         } catch {
//           setProjectName(`Project ${projectId}`);
//         }
//       };
//       fetchProjectName();
//     }
//   }, [projectId, projectName, token, authHeaders]);

//   // 3) Fetch checklist meta per tower to show badge
//   useEffect(() => {
//     if (!projectId || !projectLevelData?.length || !token) return;

//     let cancelled = false;

//     const init = {};
//     projectLevelData.forEach((t) => {
//       init[t.id] = { loading: true, count: 0, hasChecklist: false, error: false };
//     });
//     setTowerChecklistMeta(init);

//     const fetchMeta = async (towerId) => {
//       try {
//         const res = await axios.get(CHECKLIST_API_URL, {
//           params: {
//             project_id: projectId,
//             tower_id: towerId,
//             building_id: towerId,
//             limit: 1,
//             offset: 0,
//           },
//           headers: authHeaders,
//         });
//         const d = res?.data || {};
//         const count = Number(d?.count || 0);
//         return { loading: false, count, hasChecklist: count > 0, error: false };
//       } catch {
//         return { loading: false, count: 0, hasChecklist: false, error: true };
//       }
//     };

//     const runWithConcurrency = async (items, limit) => {
//       let idx = 0;
//       const runners = new Array(Math.min(limit, items.length)).fill(0).map(async () => {
//         while (idx < items.length && !cancelled) {
//           const currentIndex = idx++;
//           const tower = items[currentIndex];
//           const meta = await fetchMeta(tower.id);
//           if (cancelled) return;
//           setTowerChecklistMeta((prev) => ({ ...prev, [tower.id]: meta }));
//         }
//       });
//       await Promise.all(runners);
//     };

//     runWithConcurrency(projectLevelData, 6);

//     return () => {
//       cancelled = true;
//     };
//   }, [projectId, projectLevelData, token, authHeaders]);

//   const handleImageClick = (towerId) => {
//     navigate(`/Level/${towerId}`, {
//       state: {
//         projectLevelData,
//         projectId: projectId,
//       },
//     });
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setActiveTower(null);
//     setModalLoading(false);
//     setModalError("");
//     setModalData(null);
//     setStartingById({});
//   };

//   const openChecklistModal = async (towerObj) => {
//     if (!towerObj?.id) return;
//     if (!token) {
//       toast.error("Token missing. Please login again.");
//       return;
//     }

//     setIsModalOpen(true);
//     setActiveTower(towerObj);
//     setModalError("");

//     // cached?
//     const cached = towerChecklistDetails[towerObj.id];
//     if (cached?.raw) {
//       setModalData(cached.raw);
//       return;
//     }

//     setModalLoading(true);
//     try {
//       const res = await axios.get(CHECKLIST_API_URL, {
//         params: {
//           project_id: projectId,
//           tower_id: towerObj.id,
//           building_id: towerObj.id,
//           limit: 50,
//           offset: 0,
//         },
//         headers: authHeaders,
//       });

//       const data = res?.data || {};
//       const flattened = flattenChecklists(data);

//       setTowerChecklistDetails((prev) => ({
//         ...prev,
//         [towerObj.id]: {
//           fetchedAt: Date.now(),
//           raw: data,
//           flattenedChecklists: flattened,
//           stage_history: data?.stage_history || [],
//         },
//       }));

//       setModalData(data);
//     } catch {
//       setModalError("Could not load checklist details.");
//     } finally {
//       setModalLoading(false);
//     }
//   };

//   // ✅ START / INITIALIZE checklist
//   const startChecklist = async (checklistId) => {
//     if (!checklistId) return;
//     if (!token) {
//       toast.error("Token missing. Please login again.");
//       return;
//     }

//     setStartingById((prev) => ({ ...prev, [checklistId]: true }));

//     try {
//       // ✅ Most likely POST (initialize action)
//       const res = await axios.post(
//         `${START_CHECKLIST_API_BASE}${checklistId}/`,
//         {},
//         { headers: authHeaders }
//       );

//       const payload = res?.data || {};
//       const updated = payload?.checklist;

//       if (!updated?.id) {
//         toast.error("Initialized, but response is missing checklist data.");
//         return;
//       }

//       toast.success("Checklist initialized ✅");

//       // update modalData
//       setModalData((prev) => applyChecklistUpdateIntoTransferResponse(prev, updated));

//       // update cache for this tower as well
//       if (activeTower?.id) {
//         setTowerChecklistDetails((prev) => {
//           const current = prev[activeTower.id]?.raw || modalData;
//           const nextRaw = applyChecklistUpdateIntoTransferResponse(current, updated);
//           return {
//             ...prev,
//             [activeTower.id]: {
//               fetchedAt: Date.now(),
//               raw: nextRaw,
//               flattenedChecklists: flattenChecklists(nextRaw),
//               stage_history: nextRaw?.stage_history || [],
//             },
//           };
//         });
//       }
//     } catch (e) {
//       const msg =
//         e?.response?.data?.detail ||
//         e?.response?.data?.error ||
//         e?.message ||
//         "Failed to initialize checklist.";
//       toast.error(String(msg));
//     } finally {
//       setStartingById((prev) => ({ ...prev, [checklistId]: false }));
//     }
//   };

//   return (
//     <div
//       className="flex min-h-screen transition-colors duration-300"
//       style={{ backgroundColor: bgColor }}
//     >
//       <div className="my-8 w-full max-w-7xl mt-8 mx-auto px-4">
//         <div
//           className="relative pt-8 px-8 pb-10 rounded-2xl transition-all duration-300 hover:shadow-2xl"
//           style={{
//             backgroundColor: cardColor,
//             border: `2px solid ${borderColor}`,
//             boxShadow:
//               theme === "dark"
//                 ? `0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 8px 32px rgba(255, 190, 99, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)`
//                 : `0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 8px 32px rgba(255, 190, 99, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8)`,
//             backdropFilter: "blur(20px)",
//             WebkitBackdropFilter: "blur(20px)",
//           }}
//         >
//           {/* Decorative Background Elements */}
//           <div
//             className="absolute top-0 left-0 w-32 h-32 rounded-full opacity-10 blur-3xl"
//             style={{ backgroundColor: borderColor }}
//           />
//           <div
//             className="absolute bottom-0 right-0 w-24 h-24 rounded-full opacity-10 blur-2xl"
//             style={{ backgroundColor: borderColor }}
//           />

//           {/* Header */}
//           <div className="mb-12 relative z-10">
//             <div className="text-center">
//               <div
//                 className="w-20 h-1 mx-auto mb-6 rounded-full"
//                 style={{ backgroundColor: borderColor }}
//               />
//               <h2
//                 className="text-5xl font-bold mb-6 tracking-tight relative inline-block"
//                 style={{
//                   color: textColor,
//                   textShadow:
//                     theme === "dark"
//                       ? `0 2px 8px rgba(255, 190, 99, 0.3)`
//                       : `0 2px 8px rgba(0, 0, 0, 0.1)`,
//                 }}
//               >
//                 {projectName || `Project ${projectId}`}
//               </h2>
//               <p
//                 className="text-lg font-medium opacity-80"
//                 style={{ color: textColor }}
//               >
//                 Explore project buildings and levels
//               </p>
//             </div>
//           </div>

//           {/* Content */}
//           <div className="relative z-10">
//             {projectLevelData && projectLevelData.length > 0 ? (
//               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
//                 {projectLevelData.map((proj, index) => {
//                   const meta = towerChecklistMeta?.[proj.id];
//                   const showBadge = !!meta?.hasChecklist;

//                   return (
//                     <div
//                       key={proj.id}
//                       className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform-gpu"
//                       style={{
//                         backgroundColor: cardColor,
//                         border: `2px solid ${
//                           theme === "dark" ? "#ffffff15" : "#00000010"
//                         }`,
//                         boxShadow:
//                           theme === "dark"
//                             ? `0 10px 30px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(255, 190, 99, 0.1)`
//                             : `0 10px 30px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(255, 190, 99, 0.15)`,
//                         animationDelay: `${index * 0.1}s`,
//                       }}
//                       onClick={() => handleImageClick(proj.id)}
//                     >
//                       {/* Image */}
//                       <div className="relative overflow-hidden">
//                         <img
//                           src={projectImg}
//                           alt={`${proj.name || "Project"} Background`}
//                           className="w-full h-72 object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
//                         />

//                         {/* Gradient Overlay */}
//                         <div
//                           className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
//                           style={{
//                             background: `linear-gradient(135deg, ${borderColor}20 0%, ${borderColor}40 50%, ${borderColor}20 100%)`,
//                           }}
//                         />

//                         {/* Checklist Badge (click => modal) */}
//                         {meta?.loading ? (
//                           <div
//                             className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold"
//                             style={{
//                               backgroundColor:
//                                 theme === "dark" ? "#ffffff12" : "#00000010",
//                               color: textColor,
//                               border: `1px solid ${borderColor}55`,
//                               backdropFilter: "blur(8px)",
//                             }}
//                           >
//                             Loading…
//                           </div>
//                         ) : showBadge ? (
//                           <button
//                             type="button"
//                             onClick={(e) => {
//                               e.preventDefault();
//                               e.stopPropagation();
//                               openChecklistModal(proj);
//                             }}
//                             className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold"
//                             title="Click to view checklist details"
//                             style={{
//                               backgroundColor: borderColor,
//                               color: "#1b1b1b",
//                               boxShadow: `0 6px 18px rgba(255, 190, 99, 0.35)`,
//                             }}
//                           >
//                             🔔 Available Checklist {meta?.count ? `(${meta.count})` : ""}
//                           </button>
//                         ) : meta?.error ? (
//                           <div
//                             className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold"
//                             style={{
//                               backgroundColor:
//                                 theme === "dark" ? "#ffffff12" : "#00000010",
//                               color: textColor,
//                               border: `1px solid ${borderColor}55`,
//                               backdropFilter: "blur(8px)",
//                             }}
//                           >
//                             Checklist: error
//                           </div>
//                         ) : null}
//                       </div>

//                       {/* Bottom Title */}
//                       <div
//                         className="absolute bottom-0 left-0 right-0 p-4 transition-all duration-500"
//                         style={{
//                           background:
//                             theme === "dark"
//                               ? `linear-gradient(to top, rgba(35, 35, 44, 0.95) 0%, rgba(35, 35, 44, 0.8) 70%, transparent 100%)`
//                               : `linear-gradient(to top, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 70%, transparent 100%)`,
//                           backdropFilter: "blur(10px)",
//                         }}
//                       >
//                         <h3
//                           className="text-lg font-bold mb-1 group-hover:scale-105 transition-transform duration-300"
//                           style={{ color: textColor }}
//                         >
//                           {proj.name}
//                         </h3>
//                         <div
//                           className="h-1 rounded-full transition-all duration-500 group-hover:w-full"
//                           style={{ backgroundColor: borderColor, width: "30%" }}
//                         />
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             ) : (
//               <div className="text-center py-20">
//                 <h3 className="text-2xl font-bold mb-3" style={{ color: textColor }}>
//                   No Projects Available
//                 </h3>
//                 <p className="text-lg opacity-70" style={{ color: textColor }}>
//                   There are currently no projects to display
//                 </p>
//               </div>
//             )}
//           </div>

//           {/* ✅ MODAL */}
//           {isModalOpen && (
//             <div
//               className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
//               onClick={closeModal}
//               style={{
//                 backgroundColor: "rgba(0,0,0,0.55)",
//                 backdropFilter: "blur(6px)",
//               }}
//             >
//               <div
//                 className="w-full max-w-4xl rounded-2xl overflow-hidden"
//                 onClick={(e) => e.stopPropagation()}
//                 style={{
//                   backgroundColor: cardColor,
//                   border: `2px solid ${borderColor}`,
//                   boxShadow:
//                     theme === "dark"
//                       ? `0 30px 70px rgba(0,0,0,0.6)`
//                       : `0 30px 70px rgba(0,0,0,0.25)`,
//                 }}
//               >
//                 {/* Modal Header */}
//                 <div
//                   className="px-6 py-4 flex items-center justify-between"
//                   style={{
//                     borderBottom: `1px solid ${theme === "dark" ? "#ffffff18" : "#00000010"}`,
//                   }}
//                 >
//                   <div>
//                     <div className="text-sm opacity-80" style={{ color: textColor }}>
//                       Tower / Building
//                     </div>
//                     <div className="text-2xl font-extrabold" style={{ color: textColor }}>
//                       {activeTower?.name || `Tower ${activeTower?.id || ""}`}
//                     </div>
//                     <div className="text-sm opacity-80 mt-1" style={{ color: textColor }}>
//                       Project: {projectName || `Project ${projectId}`}
//                     </div>
//                   </div>

//                   <button
//                     type="button"
//                     onClick={closeModal}
//                     className="px-4 py-2 rounded-xl font-bold"
//                     style={{
//                       backgroundColor: theme === "dark" ? "#ffffff10" : "#00000008",
//                       color: textColor,
//                       border: `1px solid ${borderColor}55`,
//                     }}
//                   >
//                     ✕ Close
//                   </button>
//                 </div>

//                 {/* Modal Body */}
//                 <div className="px-6 py-5 max-h-[70vh] overflow-auto">
//                   {modalLoading ? (
//                     <div className="py-10 text-center">
//                       <div className="text-lg font-bold" style={{ color: textColor }}>
//                         Loading checklist details…
//                       </div>
//                     </div>
//                   ) : modalError ? (
//                     <div
//                       className="p-4 rounded-xl"
//                       style={{
//                         backgroundColor: theme === "dark" ? "#ffffff0c" : "#00000006",
//                         border: `1px solid ${borderColor}55`,
//                         color: textColor,
//                       }}
//                     >
//                       {modalError}
//                     </div>
//                   ) : modalData ? (
//                     <>
//                       {/* Stage History */}
//                       {Array.isArray(modalData?.stage_history) && modalData.stage_history.length > 0 && (
//                         <div
//                           className="p-4 rounded-2xl mb-5"
//                           style={{
//                             backgroundColor: theme === "dark" ? "#ffffff0c" : "#00000006",
//                             border: `1px solid ${borderColor}55`,
//                           }}
//                         >
//                           <div className="text-lg font-extrabold mb-2" style={{ color: textColor }}>
//                             Current Stage History
//                           </div>
//                           {modalData.stage_history.slice(0, 3).map((sh) => (
//                             <div
//                               key={sh.id}
//                               className="rounded-xl p-3 mb-2"
//                               style={{
//                                 backgroundColor: theme === "dark" ? "#ffffff08" : "#ffffff",
//                                 border: `1px solid ${theme === "dark" ? "#ffffff10" : "#00000010"}`,
//                               }}
//                             >
//                               <div className="flex flex-wrap gap-3 text-sm" style={{ color: textColor }}>
//                                 <span><b>ID:</b> {sh.id}</span>
//                                 <span><b>Stage:</b> {sh.stage}</span>
//                                 <span><b>Phase:</b> {sh.phase_id}</span>
//                                 <span><b>Status:</b> {sh.status}</span>
//                                 <span><b>Started:</b> {fmtDateTime(sh.started_at)}</span>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       )}

//                       {/* Checklists */}
//                       <div className="flex items-center justify-between mb-3">
//                         <div className="text-xl font-extrabold" style={{ color: textColor }}>
//                           Available Checklists
//                         </div>
//                         <div
//                           className="px-3 py-1 rounded-full text-sm font-bold"
//                           style={{ backgroundColor: borderColor, color: "#1b1b1b" }}
//                         >
//                           Total: {modalData?.count ?? 0}
//                         </div>
//                       </div>

//                       {(() => {
//                         const flattened = flattenChecklists(modalData);
//                         if (!flattened.length) {
//                           return (
//                             <div
//                               className="p-4 rounded-2xl"
//                               style={{
//                                 backgroundColor: theme === "dark" ? "#ffffff0c" : "#00000006",
//                                 border: `1px solid ${borderColor}55`,
//                                 color: textColor,
//                               }}
//                             >
//                               No checklists found for this tower.
//                             </div>
//                           );
//                         }

//                         return flattened.map((cl) => {
//                           const statusLower = String(cl?.status || "").toLowerCase();
//                           const isInitialized = !!cl?.initialized_at || statusLower === "in_progress";
//                           const isStarting = !!startingById[cl.id];

//                           return (
//                             <div
//                               key={cl.id}
//                               className="rounded-2xl p-4 mb-4"
//                               style={{
//                                 backgroundColor: theme === "dark" ? "#ffffff0c" : "#00000006",
//                                 border: `1px solid ${borderColor}55`,
//                               }}
//                             >
//                               <div className="flex flex-wrap items-center justify-between gap-3">
//                                 <div>
//                                   <div className="text-lg font-extrabold" style={{ color: textColor }}>
//                                     {cl.name || `Checklist #${cl.id}`}
//                                   </div>
//                                   <div className="text-sm opacity-80 mt-1" style={{ color: textColor }}>
//                                     <b>ID:</b> {cl.id} &nbsp; | &nbsp;
//                                     <b>Status:</b> {cl.status} &nbsp; | &nbsp;
//                                     <b>Created:</b> {fmtDateTime(cl.created_at)}
//                                   </div>
//                                   {cl.initialized_at && (
//                                     <div className="text-sm opacity-80 mt-1" style={{ color: textColor }}>
//                                       <b>Initialized:</b> {fmtDateTime(cl.initialized_at)}
//                                     </div>
//                                   )}
//                                 </div>

//                                 {/* ✅ Initialize Button */}
//                                 <div className="flex items-center gap-2">
//                                   <span
//                                     className="px-3 py-1 rounded-full text-xs font-bold"
//                                     style={{
//                                       backgroundColor: theme === "dark" ? "#ffffff10" : "#ffffff",
//                                       color: textColor,
//                                       border: `1px solid ${borderColor}55`,
//                                     }}
//                                   >
//                                     Items: {Array.isArray(cl.items) ? cl.items.length : 0}
//                                   </span>

//                                   <button
//                                     type="button"
//                                     disabled={isInitialized || isStarting}
//                                     onClick={() => startChecklist(cl.id)}
//                                     className="px-4 py-2 rounded-xl font-extrabold text-sm transition-all"
//                                     style={{
//                                       backgroundColor: isInitialized
//                                         ? (theme === "dark" ? "#ffffff10" : "#00000010")
//                                         : borderColor,
//                                       color: isInitialized ? textColor : "#1b1b1b",
//                                       border: `1px solid ${borderColor}55`,
//                                       opacity: isInitialized ? 0.7 : 1,
//                                       cursor: isInitialized ? "not-allowed" : "pointer",
//                                       boxShadow: isInitialized
//                                         ? "none"
//                                         : `0 8px 22px rgba(255, 190, 99, 0.35)`,
//                                     }}
//                                     title={
//                                       isInitialized
//                                         ? "Already initialized"
//                                         : "Initialize this checklist"
//                                     }
//                                   >
//                                     {isStarting
//                                       ? "Initializing..."
//                                       : isInitialized
//                                       ? "Initialized ✅"
//                                       : "Start / Initialize"}
//                                   </button>
//                                 </div>
//                               </div>

//                               {/* Items */}
//                               <div className="mt-4 space-y-3">
//                                 {(Array.isArray(cl.items) ? cl.items : []).map((it) => (
//                                   <div
//                                     key={it.id}
//                                     className="rounded-xl p-3"
//                                     style={{
//                                       backgroundColor: theme === "dark" ? "#ffffff08" : "#ffffff",
//                                       border: `1px solid ${theme === "dark" ? "#ffffff10" : "#00000010"}`,
//                                     }}
//                                   >
//                                     <div className="flex flex-wrap items-center justify-between gap-2">
//                                       <div>
//                                         <div className="font-bold" style={{ color: textColor }}>
//                                           {it.title || `Item #${it.id}`}
//                                         </div>
//                                         <div className="text-sm opacity-80 mt-1" style={{ color: textColor }}>
//                                           <b>Status:</b> {it.status}
//                                           {it.photo_required ? " | 📷 Photo required" : ""}
//                                           {it.ignore_now ? " | (ignored)" : ""}
//                                         </div>
//                                       </div>

//                                       <div
//                                         className="px-3 py-1 rounded-full text-xs font-bold"
//                                         style={{
//                                           backgroundColor: theme === "dark" ? "#ffffff10" : "#00000008",
//                                           color: textColor,
//                                           border: `1px solid ${borderColor}55`,
//                                         }}
//                                       >
//                                         Options: {Array.isArray(it.options) ? it.options.length : 0}
//                                       </div>
//                                     </div>

//                                     {/* Options */}
//                                     {Array.isArray(it.options) && it.options.length > 0 && (
//                                       <div className="mt-2 flex flex-wrap gap-2">
//                                         {it.options.map((op) => (
//                                           <span
//                                             key={op.id}
//                                             className="px-3 py-1 rounded-full text-xs font-bold"
//                                             style={{
//                                               backgroundColor: borderColor,
//                                               color: "#1b1b1b",
//                                             }}
//                                           >
//                                             {op.name}
//                                           </span>
//                                         ))}
//                                       </div>
//                                     )}
//                                   </div>
//                                 ))}
//                               </div>
//                             </div>
//                           );
//                         });
//                       })()}
//                     </>
//                   ) : (
//                     <div className="text-center py-10 opacity-80" style={{ color: textColor }}>
//                       No data
//                     </div>
//                   )}
//                 </div>

//                 {/* Modal Footer */}
//                 <div
//                   className="px-6 py-4 flex items-center justify-end gap-3"
//                   style={{
//                     borderTop: `1px solid ${theme === "dark" ? "#ffffff18" : "#00000010"}`,
//                   }}
//                 >
//                   <button
//                     type="button"
//                     onClick={closeModal}
//                     className="px-5 py-2 rounded-xl font-bold"
//                     style={{
//                       backgroundColor: theme === "dark" ? "#ffffff10" : "#00000008",
//                       color: textColor,
//                       border: `1px solid ${borderColor}55`,
//                     }}
//                   >
//                     Close
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//           {/* ✅ END MODAL */}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProjectDetailsPage;



// // ProjectDetailsPage.jsx — ✅ Tower checklist badge + ✅ Modal + ✅ Initialize + ✅ YES/NO → Verify API (READY TO PASTE)
// import React, { useEffect, useMemo, useState } from "react";
// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import projectImage from "../Images/Project.png";
// import toast from "react-hot-toast";
// import axios from "axios";
// import { useTheme } from "../ThemeContext";
// import { projectInstance } from "../api/axiosInstance";

// const ProjectDetailsPage = () => {
//   const { theme } = useTheme();

//   // THEME palette
//   const ORANGE = "#ffbe63";
//   const BG_OFFWHITE = "#fcfaf7";
//   const bgColor = theme === "dark" ? "#191922" : BG_OFFWHITE;
//   const cardColor = theme === "dark" ? "#23232c" : "#fff";
//   const borderColor = ORANGE;
//   const textColor = theme === "dark" ? "#fff" : "#222";

//   // ✅ APIs
//   const CHECKLIST_API_URL =
//     "https://konstruct.world/checklists/transfer-getchchklist/";
//   const START_CHECKLIST_API_BASE =
//     "https://konstruct.world/checklists/start-checklist/"; // + {id}/

//   // ✅ YES/NO verify API (PATCH)
//   // ⚠️ IMPORTANT: if your backend url is different, change ONLY this constant.
//   const VERIFY_ITEM_API_URL =
//     "https://konstruct.world/checklists/Decsion-makeing-forSuer-Inspector/"; // PATCH

//   const { id: projectIdFromUrl } = useParams();
//   const location = useLocation();
//   const navigate = useNavigate();

//   const projectFromState = location.state?.project;
//   const projectId =
//     projectFromState?.id || projectFromState?.project_id || projectIdFromUrl;

//   const projectImg = projectFromState?.image_url || projectImage;
//   const [projectLevelData, setProjectLevelData] = useState([]);

//   // Project name
//   const [projectName, setProjectName] = useState(
//     projectFromState?.name || projectFromState?.project_name || ""
//   );

//   // per tower meta for badge
//   const [towerChecklistMeta, setTowerChecklistMeta] = useState({});

//   // cache full details per tower (for modal)
//   const [towerChecklistDetails, setTowerChecklistDetails] = useState({});

//   // modal state
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [activeTower, setActiveTower] = useState(null); // tower object
//   const [modalLoading, setModalLoading] = useState(false);
//   const [modalError, setModalError] = useState("");
//   const [modalData, setModalData] = useState(null);

//   // ✅ per-checklist "starting" state
//   const [startingById, setStartingById] = useState({});

//   // ✅ Role for YES/NO verify (checker/supervisor)
//   const [activeRoleId, setActiveRoleId] = useState("checker"); // "checker" | "supervisor"

//   // ✅ Optional remarks per item
//   const [remarkByItemId, setRemarkByItemId] = useState({});

//   // ✅ Loading per item+option click
//   const [verifyingKey, setVerifyingKey] = useState({});

//   // token + headers
//   const token = localStorage.getItem("ACCESS_TOKEN");
//   const authHeaders = useMemo(() => {
//     if (!token) return {};
//     return {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     };
//   }, [token]);

//   const fmtDateTime = (v) => {
//     if (!v) return "-";
//     try {
//       return new Date(v).toLocaleString("en-IN");
//     } catch {
//       return String(v);
//     }
//   };

//   const flattenChecklists = (apiData) => {
//     const results = Array.isArray(apiData?.results) ? apiData.results : [];
//     const flattened = [];

//     for (const r of results) {
//       const legacy = Array.isArray(r?.checklists) ? r.checklists : [];
//       const available = Array.isArray(r?.available_for_me)
//         ? r.available_for_me
//         : [];
//       const assigned = Array.isArray(r?.assigned_to_me) ? r.assigned_to_me : [];

//       for (const c of [...available, ...assigned, ...legacy]) {
//         if (c && c.id != null) flattened.push(c);
//       }
//     }

//     return flattened;
//   };

//   const applyChecklistUpdateIntoTransferResponse = (data, updatedChecklist) => {
//     if (!data || !updatedChecklist?.id) return data;

//     const next = { ...data };
//     if (!Array.isArray(next.results)) return next;

//     const patchArr = (arr) =>
//       Array.isArray(arr)
//         ? arr.map((c) =>
//             c?.id === updatedChecklist.id ? { ...c, ...updatedChecklist } : c
//           )
//         : arr;

//     next.results = next.results.map((group) => {
//       if (!group || typeof group !== "object") return group;

//       return {
//         ...group,
//         // ✅ support new response shape
//         available_for_me: patchArr(group.available_for_me),
//         assigned_to_me: patchArr(group.assigned_to_me),

//         // ✅ backward compatibility (old)
//         checklists: patchArr(group.checklists),
//       };
//     });

//     return next;
//   };

//   // ✅ Update item status + checklist status in modalData (after verify API)
//   const applyItemUpdateIntoTransferResponse = (data, patch) => {
//     if (!data || !patch?.item_id) return data;

//     const next = { ...data };
//     if (!Array.isArray(next.results)) return next;

//     const patchItemsArr = (items) =>
//       Array.isArray(items)
//         ? items.map((it) =>
//             it?.id === patch.item_id ? { ...it, status: patch.item_status } : it
//           )
//         : items;

//     const patchChecklist = (cl) => {
//       if (!cl || typeof cl !== "object") return cl;

//       const newCl = {
//         ...cl,
//         status: patch.checklist_status ?? cl.status,
//       };

//       if (Array.isArray(newCl.items)) {
//         newCl.items = patchItemsArr(newCl.items);
//       }
//       return newCl;
//     };

//     const patchArr = (arr) => (Array.isArray(arr) ? arr.map(patchChecklist) : arr);

//     next.results = next.results.map((group) => {
//       if (!group || typeof group !== "object") return group;
//       return {
//         ...group,
//         available_for_me: patchArr(group.available_for_me),
//         assigned_to_me: patchArr(group.assigned_to_me),
//         checklists: patchArr(group.checklists), // backward
//       };
//     });

//     return next;
//   };

//   // 1) Fetch towers/buildings for project
//   useEffect(() => {
//     if (!projectId) {
//       navigate("/");
//       return;
//     }

//     const fetchProjectTower = async () => {
//       try {
//         if (!token) {
//           toast.error("Token missing. Please login again.");
//           return;
//         }
//         const response = await projectInstance.get(
//           `/buildings/by_project/${projectId}/`,
//           { headers: authHeaders }
//         );

//         if (response.status === 200 && Array.isArray(response.data)) {
//           setProjectLevelData(response.data);
//         } else {
//           setProjectLevelData([]);
//           toast.error("Invalid or empty response from server.");
//         }
//       } catch {
//         setProjectLevelData([]);
//         toast.error("Something went wrong while fetching project levels.");
//       }
//     };

//     fetchProjectTower();
//   }, [projectId, navigate, token, authHeaders]);

//   // 2) Fetch project name if not present
//   useEffect(() => {
//     if (!projectName && projectId) {
//       const fetchProjectName = async () => {
//         try {
//           if (!token) return;
//           const response = await projectInstance.get(`/projects/${projectId}/`, {
//             headers: authHeaders,
//           });
//           if (response.status === 200 && response.data?.name) {
//             setProjectName(response.data.name);
//           } else {
//             setProjectName(`Project ${projectId}`);
//           }
//         } catch {
//           setProjectName(`Project ${projectId}`);
//         }
//       };
//       fetchProjectName();
//     }
//   }, [projectId, projectName, token, authHeaders]);

//   // 3) Fetch checklist meta per tower to show badge
//   useEffect(() => {
//     if (!projectId || !projectLevelData?.length || !token) return;

//     let cancelled = false;

//     const init = {};
//     projectLevelData.forEach((t) => {
//       init[t.id] = { loading: true, count: 0, hasChecklist: false, error: false };
//     });
//     setTowerChecklistMeta(init);

//     const fetchMeta = async (towerId) => {
//       try {
//         const res = await axios.get(CHECKLIST_API_URL, {
//           params: {
//             project_id: projectId,
//             tower_id: towerId,
//             building_id: towerId,
//             limit: 1,
//             offset: 0,
//           },
//           headers: authHeaders,
//         });
//         const d = res?.data || {};
//         const count = Number(d?.count || 0);
//         return { loading: false, count, hasChecklist: count > 0, error: false };
//       } catch {
//         return { loading: false, count: 0, hasChecklist: false, error: true };
//       }
//     };

//     const runWithConcurrency = async (items, limit) => {
//       let idx = 0;
//       const runners = new Array(Math.min(limit, items.length)).fill(0).map(async () => {
//         while (idx < items.length && !cancelled) {
//           const currentIndex = idx++;
//           const tower = items[currentIndex];
//           const meta = await fetchMeta(tower.id);
//           if (cancelled) return;
//           setTowerChecklistMeta((prev) => ({ ...prev, [tower.id]: meta }));
//         }
//       });
//       await Promise.all(runners);
//     };

//     runWithConcurrency(projectLevelData, 6);

//     return () => {
//       cancelled = true;
//     };
//   }, [projectId, projectLevelData, token, authHeaders]);

//   const handleImageClick = (towerId) => {
//     navigate(`/Level/${towerId}`, {
//       state: {
//         projectLevelData,
//         projectId: projectId,
//       },
//     });
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setActiveTower(null);
//     setModalLoading(false);
//     setModalError("");
//     setModalData(null);
//     setStartingById({});
//     setActiveRoleId("checker");
//     setRemarkByItemId({});
//     setVerifyingKey({});
//   };

//   const openChecklistModal = async (towerObj) => {
//     if (!towerObj?.id) return;
//     if (!token) {
//       toast.error("Token missing. Please login again.");
//       return;
//     }

//     setIsModalOpen(true);
//     setActiveTower(towerObj);
//     setModalError("");

//     // cached?
//     const cached = towerChecklistDetails[towerObj.id];
//     if (cached?.raw) {
//       setModalData(cached.raw);
//       return;
//     }

//     setModalLoading(true);
//     try {
//       const res = await axios.get(CHECKLIST_API_URL, {
//         params: {
//           project_id: projectId,
//           tower_id: towerObj.id,
//           building_id: towerObj.id,
//           limit: 50,
//           offset: 0,
//         },
//         headers: authHeaders,
//       });

//       const data = res?.data || {};
//       const flattened = flattenChecklists(data);

//       setTowerChecklistDetails((prev) => ({
//         ...prev,
//         [towerObj.id]: {
//           fetchedAt: Date.now(),
//           raw: data,
//           flattenedChecklists: flattened,
//           stage_history: data?.stage_history || [],
//         },
//       }));

//       setModalData(data);
//     } catch {
//       setModalError("Could not load checklist details.");
//     } finally {
//       setModalLoading(false);
//     }
//   };

//   // ✅ START / INITIALIZE checklist
//   const startChecklist = async (checklistId) => {
//     if (!checklistId) return;
//     if (!token) {
//       toast.error("Token missing. Please login again.");
//       return;
//     }

//     setStartingById((prev) => ({ ...prev, [checklistId]: true }));

//     try {
//       const res = await axios.post(
//         `${START_CHECKLIST_API_BASE}${checklistId}/`,
//         {},
//         { headers: authHeaders }
//       );

//       const payload = res?.data || {};
//       const updated = payload?.checklist;

//       if (!updated?.id) {
//         toast.error("Initialized, but response is missing checklist data.");
//         return;
//       }

//       toast.success("Checklist initialized ✅");

//       // update modalData
//       setModalData((prev) => applyChecklistUpdateIntoTransferResponse(prev, updated));

//       // update cache for this tower as well
//       if (activeTower?.id) {
//         setTowerChecklistDetails((prev) => {
//           const current = prev[activeTower.id]?.raw || modalData;
//           const nextRaw = applyChecklistUpdateIntoTransferResponse(current, updated);
//           return {
//             ...prev,
//             [activeTower.id]: {
//               fetchedAt: Date.now(),
//               raw: nextRaw,
//               flattenedChecklists: flattenChecklists(nextRaw),
//               stage_history: nextRaw?.stage_history || [],
//             },
//           };
//         });
//       }
//     } catch (e) {
//       const msg =
//         e?.response?.data?.detail ||
//         e?.response?.data?.error ||
//         e?.message ||
//         "Failed to initialize checklist.";
//       toast.error(String(msg));
//     } finally {
//       setStartingById((prev) => ({ ...prev, [checklistId]: false }));
//     }
//   };

//   // ✅ YES/NO → Verify item (PATCH)
//   const verifyChecklistItem = async ({ checklistItemId, option, item }) => {
//     if (!checklistItemId || !option?.id) return;
//     if (!token) {
//       toast.error("Token missing. Please login again.");
//       return;
//     }

//     // Only YES/NO (P/N). If your options are different, adjust this check.
//     const choice = String(option?.choice || "").toUpperCase();
//     if (choice !== "P" && choice !== "N") {
//       toast.error("This option is not a YES/NO action.");
//       return;
//     }

//     // prevent double click
//     const key = `${checklistItemId}:${option.id}:${activeRoleId}`;
//     if (verifyingKey[key]) return;

//     // optional: if already completed, block
//     const itemStatus = String(item?.status || "").toLowerCase();
//     if (itemStatus === "completed") {
//       toast.success("Already completed ✅");
//       return;
//     }

//     setVerifyingKey((p) => ({ ...p, [key]: true }));

//     try {
//       const remark = (remarkByItemId[checklistItemId] || "").trim();

//       const body = {
//         checklist_item_id: checklistItemId,
//         role_id: activeRoleId, // "checker" | "supervisor"
//         option_id: option.id,
//       };

//       // backend expects different remark keys based on role
//       if (activeRoleId === "checker") {
//         body.check_remark = remark;
//       } else if (activeRoleId === "supervisor") {
//         body.supervisor_remarks = remark;
//       }

//       const res = await axios.patch(VERIFY_ITEM_API_URL, body, {
//         headers: authHeaders,
//       });

//       const payload = res?.data || {};

//       // UI toast
//       if (choice === "P") toast.success("Approved ✅");
//       else toast.success("Rejected ✅");

//       // update modal data (item status + checklist status if returned)
//       setModalData((prev) => applyItemUpdateIntoTransferResponse(prev, payload));

//       // update cache too
//       if (activeTower?.id) {
//         setTowerChecklistDetails((prev) => {
//           const current = prev[activeTower.id]?.raw || modalData;
//           const nextRaw = applyItemUpdateIntoTransferResponse(current, payload);
//           return {
//             ...prev,
//             [activeTower.id]: {
//               fetchedAt: Date.now(),
//               raw: nextRaw,
//               flattenedChecklists: flattenChecklists(nextRaw),
//               stage_history: nextRaw?.stage_history || [],
//             },
//           };
//         });
//       }
//     } catch (e) {
//       const msg =
//         e?.response?.data?.detail ||
//         e?.response?.data?.error ||
//         e?.message ||
//         "Failed to verify item.";
//       toast.error(String(msg));
//     } finally {
//       setVerifyingKey((p) => ({ ...p, [key]: false }));
//     }
//   };

//   const isYesNoOption = (op) => {
//     const c = String(op?.choice || "").toUpperCase();
//     return c === "P" || c === "N";
//   };

//   const yesNoLabel = (op) => {
//     const c = String(op?.choice || "").toUpperCase();
//     if (c === "P") return "YES";
//     if (c === "N") return "NO";
//     return op?.name || "Option";
//   };

//   return (
//     <div
//       className="flex min-h-screen transition-colors duration-300"
//       style={{ backgroundColor: bgColor }}
//     >
//       <div className="my-8 w-full max-w-7xl mt-8 mx-auto px-4">
//         <div
//           className="relative pt-8 px-8 pb-10 rounded-2xl transition-all duration-300 hover:shadow-2xl"
//           style={{
//             backgroundColor: cardColor,
//             border: `2px solid ${borderColor}`,
//             boxShadow:
//               theme === "dark"
//                 ? `0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 8px 32px rgba(255, 190, 99, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)`
//                 : `0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 8px 32px rgba(255, 190, 99, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8)`,
//             backdropFilter: "blur(20px)",
//             WebkitBackdropFilter: "blur(20px)",
//           }}
//         >
//           {/* Decorative Background Elements */}
//           <div
//             className="absolute top-0 left-0 w-32 h-32 rounded-full opacity-10 blur-3xl"
//             style={{ backgroundColor: borderColor }}
//           />
//           <div
//             className="absolute bottom-0 right-0 w-24 h-24 rounded-full opacity-10 blur-2xl"
//             style={{ backgroundColor: borderColor }}
//           />

//           {/* Header */}
//           <div className="mb-12 relative z-10">
//             <div className="text-center">
//               <div
//                 className="w-20 h-1 mx-auto mb-6 rounded-full"
//                 style={{ backgroundColor: borderColor }}
//               />
//               <h2
//                 className="text-5xl font-bold mb-6 tracking-tight relative inline-block"
//                 style={{
//                   color: textColor,
//                   textShadow:
//                     theme === "dark"
//                       ? `0 2px 8px rgba(255, 190, 99, 0.3)`
//                       : `0 2px 8px rgba(0, 0, 0, 0.1)`,
//                 }}
//               >
//                 {projectName || `Project ${projectId}`}
//               </h2>
//               <p className="text-lg font-medium opacity-80" style={{ color: textColor }}>
//                 Explore project buildings and levels
//               </p>
//             </div>
//           </div>

//           {/* Content */}
//           <div className="relative z-10">
//             {projectLevelData && projectLevelData.length > 0 ? (
//               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
//                 {projectLevelData.map((proj, index) => {
//                   const meta = towerChecklistMeta?.[proj.id];
//                   const showBadge = !!meta?.hasChecklist;

//                   return (
//                     <div
//                       key={proj.id}
//                       className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform-gpu"
//                       style={{
//                         backgroundColor: cardColor,
//                         border: `2px solid ${theme === "dark" ? "#ffffff15" : "#00000010"}`,
//                         boxShadow:
//                           theme === "dark"
//                             ? `0 10px 30px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(255, 190, 99, 0.1)`
//                             : `0 10px 30px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(255, 190, 99, 0.15)`,
//                         animationDelay: `${index * 0.1}s`,
//                       }}
//                       onClick={() => handleImageClick(proj.id)}
//                     >
//                       {/* Image */}
//                       <div className="relative overflow-hidden">
//                         <img
//                           src={projectImg}
//                           alt={`${proj.name || "Project"} Background`}
//                           className="w-full h-72 object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
//                         />

//                         {/* Gradient Overlay */}
//                         <div
//                           className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
//                           style={{
//                             background: `linear-gradient(135deg, ${borderColor}20 0%, ${borderColor}40 50%, ${borderColor}20 100%)`,
//                           }}
//                         />

//                         {/* Checklist Badge (click => modal) */}
//                         {meta?.loading ? (
//                           <div
//                             className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold"
//                             style={{
//                               backgroundColor: theme === "dark" ? "#ffffff12" : "#00000010",
//                               color: textColor,
//                               border: `1px solid ${borderColor}55`,
//                               backdropFilter: "blur(8px)",
//                             }}
//                           >
//                             Loading…
//                           </div>
//                         ) : showBadge ? (
//                           <button
//                             type="button"
//                             onClick={(e) => {
//                               e.preventDefault();
//                               e.stopPropagation();
//                               openChecklistModal(proj);
//                             }}
//                             className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold"
//                             title="Click to view checklist details"
//                             style={{
//                               backgroundColor: borderColor,
//                               color: "#1b1b1b",
//                               boxShadow: `0 6px 18px rgba(255, 190, 99, 0.35)`,
//                             }}
//                           >
//                             🔔 Available Checklist {meta?.count ? `(${meta.count})` : ""}
//                           </button>
//                         ) : meta?.error ? (
//                           <div
//                             className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold"
//                             style={{
//                               backgroundColor: theme === "dark" ? "#ffffff12" : "#00000010",
//                               color: textColor,
//                               border: `1px solid ${borderColor}55`,
//                               backdropFilter: "blur(8px)",
//                             }}
//                           >
//                             Checklist: error
//                           </div>
//                         ) : null}
//                       </div>

//                       {/* Bottom Title */}
//                       <div
//                         className="absolute bottom-0 left-0 right-0 p-4 transition-all duration-500"
//                         style={{
//                           background:
//                             theme === "dark"
//                               ? `linear-gradient(to top, rgba(35, 35, 44, 0.95) 0%, rgba(35, 35, 44, 0.8) 70%, transparent 100%)`
//                               : `linear-gradient(to top, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 70%, transparent 100%)`,
//                           backdropFilter: "blur(10px)",
//                         }}
//                       >
//                         <h3
//                           className="text-lg font-bold mb-1 group-hover:scale-105 transition-transform duration-300"
//                           style={{ color: textColor }}
//                         >
//                           {proj.name}
//                         </h3>
//                         <div
//                           className="h-1 rounded-full transition-all duration-500 group-hover:w-full"
//                           style={{ backgroundColor: borderColor, width: "30%" }}
//                         />
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             ) : (
//               <div className="text-center py-20">
//                 <h3 className="text-2xl font-bold mb-3" style={{ color: textColor }}>
//                   No Projects Available
//                 </h3>
//                 <p className="text-lg opacity-70" style={{ color: textColor }}>
//                   There are currently no projects to display
//                 </p>
//               </div>
//             )}
//           </div>

//           {/* ✅ MODAL */}
//           {isModalOpen && (
//             <div
//               className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
//               onClick={closeModal}
//               style={{
//                 backgroundColor: "rgba(0,0,0,0.55)",
//                 backdropFilter: "blur(6px)",
//               }}
//             >
//               <div
//                 className="w-full max-w-4xl rounded-2xl overflow-hidden"
//                 onClick={(e) => e.stopPropagation()}
//                 style={{
//                   backgroundColor: cardColor,
//                   border: `2px solid ${borderColor}`,
//                   boxShadow:
//                     theme === "dark"
//                       ? `0 30px 70px rgba(0,0,0,0.6)`
//                       : `0 30px 70px rgba(0,0,0,0.25)`,
//                 }}
//               >
//                 {/* Modal Header */}
//                 <div
//                   className="px-6 py-4 flex items-center justify-between flex-wrap gap-3"
//                   style={{
//                     borderBottom: `1px solid ${theme === "dark" ? "#ffffff18" : "#00000010"}`,
//                   }}
//                 >
//                   <div>
//                     <div className="text-sm opacity-80" style={{ color: textColor }}>
//                       Tower / Building
//                     </div>
//                     <div className="text-2xl font-extrabold" style={{ color: textColor }}>
//                       {activeTower?.name || `Tower ${activeTower?.id || ""}`}
//                     </div>
//                     <div className="text-sm opacity-80 mt-1" style={{ color: textColor }}>
//                       Project: {projectName || `Project ${projectId}`}
//                     </div>
//                   </div>

//                   {/* ✅ Role selector for YES/NO verify */}
//                   <div className="flex items-center gap-2">
//                     <div
//                       className="px-3 py-1 rounded-full text-xs font-bold"
//                       style={{
//                         backgroundColor: theme === "dark" ? "#ffffff10" : "#00000008",
//                         color: textColor,
//                         border: `1px solid ${borderColor}55`,
//                       }}
//                       title="Select role for Yes/No action"
//                     >
//                       Role:
//                       <select
//                         value={activeRoleId}
//                         onChange={(e) => setActiveRoleId(e.target.value)}
//                         style={{
//                           marginLeft: 8,
//                           background: "transparent",
//                           color: textColor,
//                           outline: "none",
//                         }}
//                       >
//                         <option value="checker">checker</option>
//                         <option value="supervisor">supervisor</option>
//                       </select>
//                     </div>

//                     <button
//                       type="button"
//                       onClick={closeModal}
//                       className="px-4 py-2 rounded-xl font-bold"
//                       style={{
//                         backgroundColor: theme === "dark" ? "#ffffff10" : "#00000008",
//                         color: textColor,
//                         border: `1px solid ${borderColor}55`,
//                       }}
//                     >
//                       ✕ Close
//                     </button>
//                   </div>
//                 </div>

//                 {/* Modal Body */}
//                 <div className="px-6 py-5 max-h-[70vh] overflow-auto">
//                   {modalLoading ? (
//                     <div className="py-10 text-center">
//                       <div className="text-lg font-bold" style={{ color: textColor }}>
//                         Loading checklist details…
//                       </div>
//                     </div>
//                   ) : modalError ? (
//                     <div
//                       className="p-4 rounded-xl"
//                       style={{
//                         backgroundColor: theme === "dark" ? "#ffffff0c" : "#00000006",
//                         border: `1px solid ${borderColor}55`,
//                         color: textColor,
//                       }}
//                     >
//                       {modalError}
//                     </div>
//                   ) : modalData ? (
//                     <>
//                       {/* Stage History */}
//                       {Array.isArray(modalData?.stage_history) &&
//                         modalData.stage_history.length > 0 && (
//                           <div
//                             className="p-4 rounded-2xl mb-5"
//                             style={{
//                               backgroundColor: theme === "dark" ? "#ffffff0c" : "#00000006",
//                               border: `1px solid ${borderColor}55`,
//                             }}
//                           >
//                             <div
//                               className="text-lg font-extrabold mb-2"
//                               style={{ color: textColor }}
//                             >
//                               Current Stage History
//                             </div>
//                             {modalData.stage_history.slice(0, 3).map((sh) => (
//                               <div
//                                 key={sh.id}
//                                 className="rounded-xl p-3 mb-2"
//                                 style={{
//                                   backgroundColor: theme === "dark" ? "#ffffff08" : "#ffffff",
//                                   border: `1px solid ${
//                                     theme === "dark" ? "#ffffff10" : "#00000010"
//                                   }`,
//                                 }}
//                               >
//                                 <div className="flex flex-wrap gap-3 text-sm" style={{ color: textColor }}>
//                                   <span>
//                                     <b>ID:</b> {sh.id}
//                                   </span>
//                                   <span>
//                                     <b>Stage:</b> {sh.stage}
//                                   </span>
//                                   <span>
//                                     <b>Phase:</b> {sh.phase_id}
//                                   </span>
//                                   <span>
//                                     <b>Status:</b> {sh.status}
//                                   </span>
//                                   <span>
//                                     <b>Started:</b> {fmtDateTime(sh.started_at)}
//                                   </span>
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                         )}

//                       {/* Checklists */}
//                       <div className="flex items-center justify-between mb-3">
//                         <div className="text-xl font-extrabold" style={{ color: textColor }}>
//                           Available Checklists
//                         </div>
//                         <div
//                           className="px-3 py-1 rounded-full text-sm font-bold"
//                           style={{ backgroundColor: borderColor, color: "#1b1b1b" }}
//                         >
//                           Total: {modalData?.count ?? 0}
//                         </div>
//                       </div>

//                       {(() => {
//                         const flattened = flattenChecklists(modalData);
//                         if (!flattened.length) {
//                           return (
//                             <div
//                               className="p-4 rounded-2xl"
//                               style={{
//                                 backgroundColor: theme === "dark" ? "#ffffff0c" : "#00000006",
//                                 border: `1px solid ${borderColor}55`,
//                                 color: textColor,
//                               }}
//                             >
//                               No checklists found for this tower.
//                             </div>
//                           );
//                         }

//                         return flattened.map((cl) => {
//                           const statusLower = String(cl?.status || "").toLowerCase();
//                           const isInitialized =
//                             !!cl?.initialized_at || statusLower === "in_progress";
//                           const isStarting = !!startingById[cl.id];

//                           return (
//                             <div
//                               key={cl.id}
//                               className="rounded-2xl p-4 mb-4"
//                               style={{
//                                 backgroundColor: theme === "dark" ? "#ffffff0c" : "#00000006",
//                                 border: `1px solid ${borderColor}55`,
//                               }}
//                             >
//                               <div className="flex flex-wrap items-center justify-between gap-3">
//                                 <div>
//                                   <div className="text-lg font-extrabold" style={{ color: textColor }}>
//                                     {cl.name || `Checklist #${cl.id}`}
//                                   </div>
//                                   <div className="text-sm opacity-80 mt-1" style={{ color: textColor }}>
//                                     <b>ID:</b> {cl.id} &nbsp; | &nbsp;
//                                     <b>Status:</b> {cl.status} &nbsp; | &nbsp;
//                                     <b>Created:</b> {fmtDateTime(cl.created_at)}
//                                   </div>
//                                   {cl.initialized_at && (
//                                     <div className="text-sm opacity-80 mt-1" style={{ color: textColor }}>
//                                       <b>Initialized:</b> {fmtDateTime(cl.initialized_at)}
//                                     </div>
//                                   )}
//                                 </div>

//                                 {/* ✅ Initialize Button */}
//                                 <div className="flex items-center gap-2">
//                                   <span
//                                     className="px-3 py-1 rounded-full text-xs font-bold"
//                                     style={{
//                                       backgroundColor: theme === "dark" ? "#ffffff10" : "#ffffff",
//                                       color: textColor,
//                                       border: `1px solid ${borderColor}55`,
//                                     }}
//                                   >
//                                     Items: {Array.isArray(cl.items) ? cl.items.length : 0}
//                                   </span>

//                                   <button
//                                     type="button"
//                                     disabled={isInitialized || isStarting}
//                                     onClick={() => startChecklist(cl.id)}
//                                     className="px-4 py-2 rounded-xl font-extrabold text-sm transition-all"
//                                     style={{
//                                       backgroundColor: isInitialized
//                                         ? theme === "dark"
//                                           ? "#ffffff10"
//                                           : "#00000010"
//                                         : borderColor,
//                                       color: isInitialized ? textColor : "#1b1b1b",
//                                       border: `1px solid ${borderColor}55`,
//                                       opacity: isInitialized ? 0.7 : 1,
//                                       cursor: isInitialized ? "not-allowed" : "pointer",
//                                       boxShadow: isInitialized
//                                         ? "none"
//                                         : `0 8px 22px rgba(255, 190, 99, 0.35)`,
//                                     }}
//                                     title={isInitialized ? "Already initialized" : "Initialize this checklist"}
//                                   >
//                                     {isStarting
//                                       ? "Initializing..."
//                                       : isInitialized
//                                       ? "Initialized ✅"
//                                       : "Start / Initialize"}
//                                   </button>
//                                 </div>
//                               </div>

//                               {/* Items */}
//                               <div className="mt-4 space-y-3">
//                                 {(Array.isArray(cl.items) ? cl.items : []).map((it) => {
//                                   const itStatus = String(it?.status || "").toLowerCase();
//                                   const itemDisabled = itStatus === "completed";

//                                   return (
//                                     <div
//                                       key={it.id}
//                                       className="rounded-xl p-3"
//                                       style={{
//                                         backgroundColor: theme === "dark" ? "#ffffff08" : "#ffffff",
//                                         border: `1px solid ${
//                                           theme === "dark" ? "#ffffff10" : "#00000010"
//                                         }`,
//                                       }}
//                                     >
//                                       <div className="flex flex-wrap items-center justify-between gap-2">
//                                         <div>
//                                           <div className="font-bold" style={{ color: textColor }}>
//                                             {it.title || `Item #${it.id}`}
//                                           </div>
//                                           <div className="text-sm opacity-80 mt-1" style={{ color: textColor }}>
//                                             <b>Status:</b> {it.status}
//                                             {it.photo_required ? " | 📷 Photo required" : ""}
//                                             {it.ignore_now ? " | (ignored)" : ""}
//                                           </div>

//                                           {/* ✅ remark input (optional) */}
//                                           <div className="mt-2">
//                                             <input
//                                               value={remarkByItemId[it.id] || ""}
//                                               onChange={(e) =>
//                                                 setRemarkByItemId((p) => ({
//                                                   ...p,
//                                                   [it.id]: e.target.value,
//                                                 }))
//                                               }
//                                               placeholder="Optional remark…"
//                                               className="w-full px-3 py-2 rounded-xl text-sm"
//                                               style={{
//                                                 backgroundColor:
//                                                   theme === "dark" ? "#ffffff10" : "#00000008",
//                                                 color: textColor,
//                                                 border: `1px solid ${borderColor}55`,
//                                                 outline: "none",
//                                               }}
//                                             />
//                                           </div>
//                                         </div>

//                                         <div
//                                           className="px-3 py-1 rounded-full text-xs font-bold"
//                                           style={{
//                                             backgroundColor: theme === "dark" ? "#ffffff10" : "#00000008",
//                                             color: textColor,
//                                             border: `1px solid ${borderColor}55`,
//                                           }}
//                                         >
//                                           Options: {Array.isArray(it.options) ? it.options.length : 0}
//                                         </div>
//                                       </div>

//                                       {/* Options */}
//                                       {Array.isArray(it.options) && it.options.length > 0 && (
//                                         <div className="mt-3 flex flex-wrap gap-2">
//                                           {it.options.map((op) => {
//                                             const isYN = isYesNoOption(op);
//                                             const k = `${it.id}:${op.id}:${activeRoleId}`;
//                                             const isVerifying = !!verifyingKey[k];

//                                             return (
//                                               <button
//                                                 key={op.id}
//                                                 type="button"
//                                                 disabled={!isYN || itemDisabled || isVerifying}
//                                                 onClick={() =>
//                                                   verifyChecklistItem({
//                                                     checklistItemId: it.id,
//                                                     option: op,
//                                                     item: it,
//                                                   })
//                                                 }
//                                                 className="px-3 py-2 rounded-full text-xs font-extrabold transition-all"
//                                                 title={
//                                                   !isYN
//                                                     ? "Only YES/NO options are clickable"
//                                                     : itemDisabled
//                                                     ? "Item already completed"
//                                                     : "Click to submit YES/NO"
//                                                 }
//                                                 style={{
//                                                   backgroundColor: !isYN
//                                                     ? theme === "dark"
//                                                       ? "#ffffff10"
//                                                       : "#00000010"
//                                                     : String(op.choice || "").toUpperCase() === "P"
//                                                     ? borderColor
//                                                     : theme === "dark"
//                                                     ? "#ff6b6b"
//                                                     : "#ff6b6b",
//                                                   color: !isYN ? textColor : "#1b1b1b",
//                                                   border: `1px solid ${borderColor}55`,
//                                                   opacity: !isYN || itemDisabled ? 0.6 : 1,
//                                                   cursor: !isYN || itemDisabled ? "not-allowed" : "pointer",
//                                                   boxShadow: !isYN || itemDisabled ? "none" : `0 8px 18px rgba(0,0,0,0.15)`,
//                                                 }}
//                                               >
//                                                 {isVerifying
//                                                   ? "Submitting..."
//                                                   : isYN
//                                                   ? yesNoLabel(op)
//                                                   : op.name}
//                                               </button>
//                                             );
//                                           })}
//                                         </div>
//                                       )}
//                                     </div>
//                                   );
//                                 })}
//                               </div>
//                             </div>
//                           );
//                         });
//                       })()}
//                     </>
//                   ) : (
//                     <div className="text-center py-10 opacity-80" style={{ color: textColor }}>
//                       No data
//                     </div>
//                   )}
//                 </div>

//                 {/* Modal Footer */}
//                 <div
//                   className="px-6 py-4 flex items-center justify-end gap-3"
//                   style={{
//                     borderTop: `1px solid ${theme === "dark" ? "#ffffff18" : "#00000010"}`,
//                   }}
//                 >
//                   <button
//                     type="button"
//                     onClick={closeModal}
//                     className="px-5 py-2 rounded-xl font-bold"
//                     style={{
//                       backgroundColor: theme === "dark" ? "#ffffff10" : "#00000008",
//                       color: textColor,
//                       border: `1px solid ${borderColor}55`,
//                     }}
//                   >
//                     Close
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//           {/* ✅ END MODAL */}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProjectDetailsPage;



// // ProjectDetailsPage.jsx — ✅ Tower checklist badge + ✅ Modal + ✅ Initialize
// // ✅ YES/NO → Verify API (checker/supervisor)
// // ✅ Maker Submit → done-maker API (READY TO PASTE)

// import React, { useEffect, useMemo, useState } from "react";
// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import projectImage from "../Images/Project.png";
// import toast from "react-hot-toast";
// import axios from "axios";
// import { useTheme } from "../ThemeContext";
// import { projectInstance } from "../api/axiosInstance";

// const ProjectDetailsPage = () => {
//   const { theme } = useTheme();

//   // THEME palette
//   const ORANGE = "#ffbe63";
//   const BG_OFFWHITE = "#fcfaf7";
//   const bgColor = theme === "dark" ? "#191922" : BG_OFFWHITE;
//   const cardColor = theme === "dark" ? "#23232c" : "#fff";
//   const borderColor = ORANGE;
//   const textColor = theme === "dark" ? "#fff" : "#222";

//   // ✅ APIs
//   const CHECKLIST_API_URL =
//     "https://konstruct.world/checklists/transfer-getchchklist/";
//   const START_CHECKLIST_API_BASE =
//     "https://konstruct.world/checklists/start-checklist/"; // + {id}/

//   // ✅ YES/NO verify API (PATCH) — checker/supervisor
//   const VERIFY_ITEM_API_URL =
//     "https://konstruct.world/checklists/Decsion-makeing-forSuer-Inspector/"; // PATCH

//   // ✅ Maker submit API (POST multipart)
//   const DONE_MAKER_API_URL = "https://konstruct.world/checklists/done-maker/"; // POST

//   const { id: projectIdFromUrl } = useParams();
//   const location = useLocation();
//   const navigate = useNavigate();

//   const projectFromState = location.state?.project;
//   const projectId =
//     projectFromState?.id || projectFromState?.project_id || projectIdFromUrl;

//   const projectImg = projectFromState?.image_url || projectImage;
//   const [projectLevelData, setProjectLevelData] = useState([]);

//   // Project name
//   const [projectName, setProjectName] = useState(
//     projectFromState?.name || projectFromState?.project_name || ""
//   );

//   // per tower meta for badge
//   const [towerChecklistMeta, setTowerChecklistMeta] = useState({});

//   // cache full details per tower (for modal)
//   const [towerChecklistDetails, setTowerChecklistDetails] = useState({});

//   // modal state
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [activeTower, setActiveTower] = useState(null);
//   const [modalLoading, setModalLoading] = useState(false);
//   const [modalError, setModalError] = useState("");
//   const [modalData, setModalData] = useState(null);

//   // ✅ per-checklist "starting" state
//   const [startingById, setStartingById] = useState({});

//   // ✅ Role for actions
//   // maker => only Submit (done-maker)
//   // checker/supervisor => YES/NO via verify API
//   const [activeRoleId, setActiveRoleId] = useState("checker"); // "maker" | "checker" | "supervisor"

//   // ✅ Optional remarks per item
//   const [remarkByItemId, setRemarkByItemId] = useState({});

//   // ✅ Loading per item+option click (verify)
//   const [verifyingKey, setVerifyingKey] = useState({});

//   // ✅ Maker: files per item + loading per item
//   const [makerFilesByItemId, setMakerFilesByItemId] = useState({});
//   const [makerSubmittingByItemId, setMakerSubmittingByItemId] = useState({});

//   // token + headers
//   const token = localStorage.getItem("ACCESS_TOKEN");
//   const authHeaders = useMemo(() => {
//     if (!token) return {};
//     return {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     };
//   }, [token]);

//   const authOnlyHeaders = useMemo(() => {
//     if (!token) return {};
//     return { Authorization: `Bearer ${token}` };
//   }, [token]);

//   const fmtDateTime = (v) => {
//     if (!v) return "-";
//     try {
//       return new Date(v).toLocaleString("en-IN");
//     } catch {
//       return String(v);
//     }
//   };

//   const flattenChecklists = (apiData) => {
//     const results = Array.isArray(apiData?.results) ? apiData.results : [];
//     const flattened = [];

//     for (const r of results) {
//       const legacy = Array.isArray(r?.checklists) ? r.checklists : [];
//       const available = Array.isArray(r?.available_for_me)
//         ? r.available_for_me
//         : [];
//       const assigned = Array.isArray(r?.assigned_to_me) ? r.assigned_to_me : [];

//       for (const c of [...available, ...assigned, ...legacy]) {
//         if (c && c.id != null) flattened.push(c);
//       }
//     }

//     return flattened;
//   };

//   const applyChecklistUpdateIntoTransferResponse = (data, updatedChecklist) => {
//     if (!data || !updatedChecklist?.id) return data;

//     const next = { ...data };
//     if (!Array.isArray(next.results)) return next;

//     const patchArr = (arr) =>
//       Array.isArray(arr)
//         ? arr.map((c) =>
//             c?.id === updatedChecklist.id ? { ...c, ...updatedChecklist } : c
//           )
//         : arr;

//     next.results = next.results.map((group) => {
//       if (!group || typeof group !== "object") return group;

//       return {
//         ...group,
//         available_for_me: patchArr(group.available_for_me),
//         assigned_to_me: patchArr(group.assigned_to_me),
//         checklists: patchArr(group.checklists),
//       };
//     });

//     return next;
//   };

//   // ✅ Update item status + checklist status in modalData (after verify API)
//   const applyItemUpdateIntoTransferResponse = (data, patch) => {
//     if (!data || !patch?.item_id) return data;

//     const next = { ...data };
//     if (!Array.isArray(next.results)) return next;

//     const patchItemsArr = (items) =>
//       Array.isArray(items)
//         ? items.map((it) =>
//             it?.id === patch.item_id ? { ...it, status: patch.item_status } : it
//           )
//         : items;

//     const patchChecklist = (cl) => {
//       if (!cl || typeof cl !== "object") return cl;

//       const newCl = {
//         ...cl,
//         status: patch.checklist_status ?? cl.status,
//       };

//       if (Array.isArray(newCl.items)) {
//         newCl.items = patchItemsArr(newCl.items);
//       }
//       return newCl;
//     };

//     const patchArr = (arr) => (Array.isArray(arr) ? arr.map(patchChecklist) : arr);

//     next.results = next.results.map((group) => {
//       if (!group || typeof group !== "object") return group;
//       return {
//         ...group,
//         available_for_me: patchArr(group.available_for_me),
//         assigned_to_me: patchArr(group.assigned_to_me),
//         checklists: patchArr(group.checklists),
//       };
//     });

//     return next;
//   };

//   // ✅ Maker done-maker response patch
//   // backend returns: { item: {...}, submission: {...}, detail: ... }
//   const applyMakerDoneIntoTransferResponse = (data, payload) => {
//     const item = payload?.item;
//     if (!data || !item?.id) return data;

//     const next = { ...data };
//     if (!Array.isArray(next.results)) return next;

//     const patchItemsArr = (items) =>
//       Array.isArray(items)
//         ? items.map((it) => (it?.id === item.id ? { ...it, status: item.status } : it))
//         : items;

//     const patchChecklist = (cl) => {
//       if (!cl || typeof cl !== "object") return cl;

//       // if checklist id matches, patch items inside
//       // (item.checklist is checklist id)
//       if (cl?.id === item.checklist) {
//         const newCl = { ...cl };
//         if (Array.isArray(newCl.items)) newCl.items = patchItemsArr(newCl.items);
//         // optionally patch checklist status if backend gives it
//         if (payload?.checklist_status) newCl.status = payload.checklist_status;
//         return newCl;
//       }

//       // otherwise still try patch items (in case response shape differs)
//       const newCl = { ...cl };
//       if (Array.isArray(newCl.items)) newCl.items = patchItemsArr(newCl.items);
//       if (payload?.checklist_status) newCl.status = payload.checklist_status;
//       return newCl;
//     };

//     const patchArr = (arr) => (Array.isArray(arr) ? arr.map(patchChecklist) : arr);

//     next.results = next.results.map((group) => {
//       if (!group || typeof group !== "object") return group;
//       return {
//         ...group,
//         available_for_me: patchArr(group.available_for_me),
//         assigned_to_me: patchArr(group.assigned_to_me),
//         checklists: patchArr(group.checklists),
//       };
//     });

//     return next;
//   };

//   // 1) Fetch towers/buildings for project
//   useEffect(() => {
//     if (!projectId) {
//       navigate("/");
//       return;
//     }

//     const fetchProjectTower = async () => {
//       try {
//         if (!token) {
//           toast.error("Token missing. Please login again.");
//           return;
//         }
//         const response = await projectInstance.get(
//           `/buildings/by_project/${projectId}/`,
//           { headers: authHeaders }
//         );

//         if (response.status === 200 && Array.isArray(response.data)) {
//           setProjectLevelData(response.data);
//         } else {
//           setProjectLevelData([]);
//           toast.error("Invalid or empty response from server.");
//         }
//       } catch {
//         setProjectLevelData([]);
//         toast.error("Something went wrong while fetching project levels.");
//       }
//     };

//     fetchProjectTower();
//   }, [projectId, navigate, token, authHeaders]);

//   // 2) Fetch project name if not present
//   useEffect(() => {
//     if (!projectName && projectId) {
//       const fetchProjectName = async () => {
//         try {
//           if (!token) return;
//           const response = await projectInstance.get(`/projects/${projectId}/`, {
//             headers: authHeaders,
//           });
//           if (response.status === 200 && response.data?.name) {
//             setProjectName(response.data.name);
//           } else {
//             setProjectName(`Project ${projectId}`);
//           }
//         } catch {
//           setProjectName(`Project ${projectId}`);
//         }
//       };
//       fetchProjectName();
//     }
//   }, [projectId, projectName, token, authHeaders]);

//   // 3) Fetch checklist meta per tower to show badge
//   useEffect(() => {
//     if (!projectId || !projectLevelData?.length || !token) return;

//     let cancelled = false;

//     const init = {};
//     projectLevelData.forEach((t) => {
//       init[t.id] = { loading: true, count: 0, hasChecklist: false, error: false };
//     });
//     setTowerChecklistMeta(init);

//     const fetchMeta = async (towerId) => {
//       try {
//         const res = await axios.get(CHECKLIST_API_URL, {
//           params: {
//             project_id: projectId,
//             tower_id: towerId,
//             building_id: towerId,
//             limit: 1,
//             offset: 0,
//           },
//           headers: authHeaders,
//         });
//         const d = res?.data || {};
//         const count = Number(d?.count || 0);
//         return { loading: false, count, hasChecklist: count > 0, error: false };
//       } catch {
//         return { loading: false, count: 0, hasChecklist: false, error: true };
//       }
//     };

//     const runWithConcurrency = async (items, limit) => {
//       let idx = 0;
//       const runners = new Array(Math.min(limit, items.length))
//         .fill(0)
//         .map(async () => {
//           while (idx < items.length && !cancelled) {
//             const currentIndex = idx++;
//             const tower = items[currentIndex];
//             const meta = await fetchMeta(tower.id);
//             if (cancelled) return;
//             setTowerChecklistMeta((prev) => ({ ...prev, [tower.id]: meta }));
//           }
//         });
//       await Promise.all(runners);
//     };

//     runWithConcurrency(projectLevelData, 6);

//     return () => {
//       cancelled = true;
//     };
//   }, [projectId, projectLevelData, token, authHeaders]);

//   const handleImageClick = (towerId) => {
//     navigate(`/Level/${towerId}`, {
//       state: {
//         projectLevelData,
//         projectId: projectId,
//       },
//     });
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setActiveTower(null);
//     setModalLoading(false);
//     setModalError("");
//     setModalData(null);
//     setStartingById({});
//     setActiveRoleId("checker");
//     setRemarkByItemId({});
//     setVerifyingKey({});
//     setMakerFilesByItemId({});
//     setMakerSubmittingByItemId({});
//   };

//   const openChecklistModal = async (towerObj) => {
//     if (!towerObj?.id) return;
//     if (!token) {
//       toast.error("Token missing. Please login again.");
//       return;
//     }

//     setIsModalOpen(true);
//     setActiveTower(towerObj);
//     setModalError("");

//     const cached = towerChecklistDetails[towerObj.id];
//     if (cached?.raw) {
//       setModalData(cached.raw);
//       return;
//     }

//     setModalLoading(true);
//     try {
//       const res = await axios.get(CHECKLIST_API_URL, {
//         params: {
//           project_id: projectId,
//           tower_id: towerObj.id,
//           building_id: towerObj.id,
//           limit: 50,
//           offset: 0,
//         },
//         headers: authHeaders,
//       });

//       const data = res?.data || {};
//       const flattened = flattenChecklists(data);

//       setTowerChecklistDetails((prev) => ({
//         ...prev,
//         [towerObj.id]: {
//           fetchedAt: Date.now(),
//           raw: data,
//           flattenedChecklists: flattened,
//           stage_history: data?.stage_history || [],
//         },
//       }));

//       setModalData(data);
//     } catch {
//       setModalError("Could not load checklist details.");
//     } finally {
//       setModalLoading(false);
//     }
//   };

//   // ✅ START / INITIALIZE checklist
//   const startChecklist = async (checklistId) => {
//     if (!checklistId) return;
//     if (!token) {
//       toast.error("Token missing. Please login again.");
//       return;
//     }

//     setStartingById((prev) => ({ ...prev, [checklistId]: true }));

//     try {
//       const res = await axios.post(
//         `${START_CHECKLIST_API_BASE}${checklistId}/`,
//         {},
//         { headers: authHeaders }
//       );

//       const payload = res?.data || {};
//       const updated = payload?.checklist;

//       if (!updated?.id) {
//         toast.error("Initialized, but response is missing checklist data.");
//         return;
//       }

//       toast.success("Checklist initialized ✅");

//       setModalData((prev) =>
//         applyChecklistUpdateIntoTransferResponse(prev, updated)
//       );

//       if (activeTower?.id) {
//         setTowerChecklistDetails((prev) => {
//           const current = prev[activeTower.id]?.raw || modalData;
//           const nextRaw = applyChecklistUpdateIntoTransferResponse(current, updated);
//           return {
//             ...prev,
//             [activeTower.id]: {
//               fetchedAt: Date.now(),
//               raw: nextRaw,
//               flattenedChecklists: flattenChecklists(nextRaw),
//               stage_history: nextRaw?.stage_history || [],
//             },
//           };
//         });
//       }
//     } catch (e) {
//       const msg =
//         e?.response?.data?.detail ||
//         e?.response?.data?.error ||
//         e?.message ||
//         "Failed to initialize checklist.";
//       toast.error(String(msg));
//     } finally {
//       setStartingById((prev) => ({ ...prev, [checklistId]: false }));
//     }
//   };

//   // ✅ YES/NO → Verify item (PATCH) (checker/supervisor)
//   const verifyChecklistItem = async ({ checklistItemId, option, item }) => {
//     if (!checklistItemId || !option?.id) return;
//     if (!token) {
//       toast.error("Token missing. Please login again.");
//       return;
//     }

//     const choice = String(option?.choice || "").toUpperCase();
//     if (choice !== "P" && choice !== "N") {
//       toast.error("This option is not a YES/NO action.");
//       return;
//     }

//     const key = `${checklistItemId}:${option.id}:${activeRoleId}`;
//     if (verifyingKey[key]) return;

//     const itemStatus = String(item?.status || "").toLowerCase();
//     if (itemStatus === "completed") {
//       toast.success("Already completed ✅");
//       return;
//     }

//     setVerifyingKey((p) => ({ ...p, [key]: true }));

//     try {
//       const remark = (remarkByItemId[checklistItemId] || "").trim();

//       const body = {
//         checklist_item_id: checklistItemId,
//         role_id: activeRoleId, // "checker" | "supervisor"
//         option_id: option.id,
//       };

//       if (activeRoleId === "checker") body.check_remark = remark;
//       else if (activeRoleId === "supervisor") body.supervisor_remarks = remark;

//       const res = await axios.patch(VERIFY_ITEM_API_URL, body, {
//         headers: authHeaders,
//       });

//       const payload = res?.data || {};

//       if (choice === "P") toast.success("Approved ✅");
//       else toast.success("Rejected ✅");

//       setModalData((prev) => applyItemUpdateIntoTransferResponse(prev, payload));

//       if (activeTower?.id) {
//         setTowerChecklistDetails((prev) => {
//           const current = prev[activeTower.id]?.raw || modalData;
//           const nextRaw = applyItemUpdateIntoTransferResponse(current, payload);
//           return {
//             ...prev,
//             [activeTower.id]: {
//               fetchedAt: Date.now(),
//               raw: nextRaw,
//               flattenedChecklists: flattenChecklists(nextRaw),
//               stage_history: nextRaw?.stage_history || [],
//             },
//           };
//         });
//       }
//     } catch (e) {
//       const msg =
//         e?.response?.data?.detail ||
//         e?.response?.data?.error ||
//         e?.message ||
//         "Failed to verify item.";
//       toast.error(String(msg));
//     } finally {
//       setVerifyingKey((p) => ({ ...p, [key]: false }));
//     }
//   };

//   // ✅ Maker Submit (POST multipart) → done-maker
//   const submitMakerDone = async ({ item }) => {
//     const checklistItemId = item?.id;
//     if (!checklistItemId) return;

//     if (!token) {
//       toast.error("Token missing. Please login again.");
//       return;
//     }

//     // Maker should only submit on rejected items (usually pending_for_maker / tetmpory_maker)
//     const st = String(item?.status || "").toLowerCase();
//     const makerAllowed =
//       st === "pending_for_maker" ||
//       st === "tetmpory_maker" ||
//       st === "temporary_maker" ||
//       st === "rejected_by_checker"; // just in case

//     if (!makerAllowed) {
//       toast.error("This item is not pending for maker.");
//       return;
//     }

//     if (makerSubmittingByItemId[checklistItemId]) return;

//     const remark = (remarkByItemId[checklistItemId] || "").trim();
//     const files = makerFilesByItemId[checklistItemId] || [];

//     // photo required => enforce at least 1 photo
//     if (item?.photo_required && (!files || files.length === 0)) {
//       toast.error("Photo required. Please attach at least 1 image.");
//       return;
//     }

//     setMakerSubmittingByItemId((p) => ({ ...p, [checklistItemId]: true }));

//     try {
//       const fd = new FormData();

//       // Most backends accept checklist_item_id
//       fd.append("checklist_item_id", String(checklistItemId));

//       // maker remark keys vary; sending both is safe
//       if (remark) {
//         fd.append("maker_remarks", remark);
//         fd.append("remark", remark);
//       }

//       // attach multiple images
//       // backend response shows maker_media_multi => use same key
//       for (const f of files) {
//         fd.append("maker_media_multi", f);
//       }

//       const res = await axios.post(DONE_MAKER_API_URL, fd, {
//         headers: {
//           ...authOnlyHeaders, // IMPORTANT: don't set Content-Type manually
//         },
//       });

//       const payload = res?.data || {};
//       toast.success(payload?.detail || "Submitted to checker ✅");

//       // update modalData + cache using payload.item
//       setModalData((prev) => applyMakerDoneIntoTransferResponse(prev, payload));

//       if (activeTower?.id) {
//         setTowerChecklistDetails((prev) => {
//           const current = prev[activeTower.id]?.raw || modalData;
//           const nextRaw = applyMakerDoneIntoTransferResponse(current, payload);
//           return {
//             ...prev,
//             [activeTower.id]: {
//               fetchedAt: Date.now(),
//               raw: nextRaw,
//               flattenedChecklists: flattenChecklists(nextRaw),
//               stage_history: nextRaw?.stage_history || [],
//             },
//           };
//         });
//       }

//       // clear maker input after submit
//       setRemarkByItemId((p) => ({ ...p, [checklistItemId]: "" }));
//       setMakerFilesByItemId((p) => ({ ...p, [checklistItemId]: [] }));
//     } catch (e) {
//       const msg =
//         e?.response?.data?.detail ||
//         e?.response?.data?.error ||
//         e?.message ||
//         "Failed to submit item by maker.";
//       toast.error(String(msg));
//     } finally {
//       setMakerSubmittingByItemId((p) => ({ ...p, [checklistItemId]: false }));
//     }
//   };

//   const isYesNoOption = (op) => {
//     const c = String(op?.choice || "").toUpperCase();
//     return c === "P" || c === "N";
//   };

//   const yesNoLabel = (op) => {
//     const c = String(op?.choice || "").toUpperCase();
//     if (c === "P") return "YES";
//     if (c === "N") return "NO";
//     return op?.name || "Option";
//   };

//   const makerCanSubmitItem = (it) => {
//     const st = String(it?.status || "").toLowerCase();
//     return (
//       st === "pending_for_maker" ||
//       st === "tetmpory_maker" ||
//       st === "temporary_maker" ||
//       st === "rejected_by_checker"
//     );
//   };

//   return (
//     <div
//       className="flex min-h-screen transition-colors duration-300"
//       style={{ backgroundColor: bgColor }}
//     >
//       <div className="my-8 w-full max-w-7xl mt-8 mx-auto px-4">
//         <div
//           className="relative pt-8 px-8 pb-10 rounded-2xl transition-all duration-300 hover:shadow-2xl"
//           style={{
//             backgroundColor: cardColor,
//             border: `2px solid ${borderColor}`,
//             boxShadow:
//               theme === "dark"
//                 ? `0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 8px 32px rgba(255, 190, 99, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)`
//                 : `0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 8px 32px rgba(255, 190, 99, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8)`,
//             backdropFilter: "blur(20px)",
//             WebkitBackdropFilter: "blur(20px)",
//           }}
//         >
//           {/* Decorative Background Elements */}
//           <div
//             className="absolute top-0 left-0 w-32 h-32 rounded-full opacity-10 blur-3xl"
//             style={{ backgroundColor: borderColor }}
//           />
//           <div
//             className="absolute bottom-0 right-0 w-24 h-24 rounded-full opacity-10 blur-2xl"
//             style={{ backgroundColor: borderColor }}
//           />

//           {/* Header */}
//           <div className="mb-12 relative z-10">
//             <div className="text-center">
//               <div
//                 className="w-20 h-1 mx-auto mb-6 rounded-full"
//                 style={{ backgroundColor: borderColor }}
//               />
//               <h2
//                 className="text-5xl font-bold mb-6 tracking-tight relative inline-block"
//                 style={{
//                   color: textColor,
//                   textShadow:
//                     theme === "dark"
//                       ? `0 2px 8px rgba(255, 190, 99, 0.3)`
//                       : `0 2px 8px rgba(0, 0, 0, 0.1)`,
//                 }}
//               >
//                 {projectName || `Project ${projectId}`}
//               </h2>
//               <p
//                 className="text-lg font-medium opacity-80"
//                 style={{ color: textColor }}
//               >
//                 Explore project buildings and levels
//               </p>
//             </div>
//           </div>

//           {/* Content */}
//           <div className="relative z-10">
//             {projectLevelData && projectLevelData.length > 0 ? (
//               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
//                 {projectLevelData.map((proj, index) => {
//                   const meta = towerChecklistMeta?.[proj.id];
//                   const showBadge = !!meta?.hasChecklist;

//                   return (
//                     <div
//                       key={proj.id}
//                       className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform-gpu"
//                       style={{
//                         backgroundColor: cardColor,
//                         border: `2px solid ${
//                           theme === "dark" ? "#ffffff15" : "#00000010"
//                         }`,
//                         boxShadow:
//                           theme === "dark"
//                             ? `0 10px 30px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(255, 190, 99, 0.1)`
//                             : `0 10px 30px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(255, 190, 99, 0.15)`,
//                         animationDelay: `${index * 0.1}s`,
//                       }}
//                       onClick={() => handleImageClick(proj.id)}
//                     >
//                       {/* Image */}
//                       <div className="relative overflow-hidden">
//                         <img
//                           src={projectImg}
//                           alt={`${proj.name || "Project"} Background`}
//                           className="w-full h-72 object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
//                         />

//                         {/* Gradient Overlay */}
//                         <div
//                           className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
//                           style={{
//                             background: `linear-gradient(135deg, ${borderColor}20 0%, ${borderColor}40 50%, ${borderColor}20 100%)`,
//                           }}
//                         />

//                         {/* Checklist Badge (click => modal) */}
//                         {meta?.loading ? (
//                           <div
//                             className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold"
//                             style={{
//                               backgroundColor:
//                                 theme === "dark" ? "#ffffff12" : "#00000010",
//                               color: textColor,
//                               border: `1px solid ${borderColor}55`,
//                               backdropFilter: "blur(8px)",
//                             }}
//                           >
//                             Loading…
//                           </div>
//                         ) : showBadge ? (
//                           <button
//                             type="button"
//                             onClick={(e) => {
//                               e.preventDefault();
//                               e.stopPropagation();
//                               openChecklistModal(proj);
//                             }}
//                             className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold"
//                             title="Click to view checklist details"
//                             style={{
//                               backgroundColor: borderColor,
//                               color: "#1b1b1b",
//                               boxShadow: `0 6px 18px rgba(255, 190, 99, 0.35)`,
//                             }}
//                           >
//                             🔔 Available Checklist{" "}
//                             {meta?.count ? `(${meta.count})` : ""}
//                           </button>
//                         ) : meta?.error ? (
//                           <div
//                             className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold"
//                             style={{
//                               backgroundColor:
//                                 theme === "dark" ? "#ffffff12" : "#00000010",
//                               color: textColor,
//                               border: `1px solid ${borderColor}55`,
//                               backdropFilter: "blur(8px)",
//                             }}
//                           >
//                             Checklist: error
//                           </div>
//                         ) : null}
//                       </div>

//                       {/* Bottom Title */}
//                       <div
//                         className="absolute bottom-0 left-0 right-0 p-4 transition-all duration-500"
//                         style={{
//                           background:
//                             theme === "dark"
//                               ? `linear-gradient(to top, rgba(35, 35, 44, 0.95) 0%, rgba(35, 35, 44, 0.8) 70%, transparent 100%)`
//                               : `linear-gradient(to top, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 70%, transparent 100%)`,
//                           backdropFilter: "blur(10px)",
//                         }}
//                       >
//                         <h3
//                           className="text-lg font-bold mb-1 group-hover:scale-105 transition-transform duration-300"
//                           style={{ color: textColor }}
//                         >
//                           {proj.name}
//                         </h3>
//                         <div
//                           className="h-1 rounded-full transition-all duration-500 group-hover:w-full"
//                           style={{ backgroundColor: borderColor, width: "30%" }}
//                         />
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             ) : (
//               <div className="text-center py-20">
//                 <h3
//                   className="text-2xl font-bold mb-3"
//                   style={{ color: textColor }}
//                 >
//                   No Projects Available
//                 </h3>
//                 <p className="text-lg opacity-70" style={{ color: textColor }}>
//                   There are currently no projects to display
//                 </p>
//               </div>
//             )}
//           </div>

//           {/* ✅ MODAL */}
//           {isModalOpen && (
//             <div
//               className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
//               onClick={closeModal}
//               style={{
//                 backgroundColor: "rgba(0,0,0,0.55)",
//                 backdropFilter: "blur(6px)",
//               }}
//             >
//               <div
//                 className="w-full max-w-4xl rounded-2xl overflow-hidden"
//                 onClick={(e) => e.stopPropagation()}
//                 style={{
//                   backgroundColor: cardColor,
//                   border: `2px solid ${borderColor}`,
//                   boxShadow:
//                     theme === "dark"
//                       ? `0 30px 70px rgba(0,0,0,0.6)`
//                       : `0 30px 70px rgba(0,0,0,0.25)`,
//                 }}
//               >
//                 {/* Modal Header */}
//                 <div
//                   className="px-6 py-4 flex items-center justify-between flex-wrap gap-3"
//                   style={{
//                     borderBottom: `1px solid ${
//                       theme === "dark" ? "#ffffff18" : "#00000010"
//                     }`,
//                   }}
//                 >
//                   <div>
//                     <div className="text-sm opacity-80" style={{ color: textColor }}>
//                       Tower / Building
//                     </div>
//                     <div
//                       className="text-2xl font-extrabold"
//                       style={{ color: textColor }}
//                     >
//                       {activeTower?.name || `Tower ${activeTower?.id || ""}`}
//                     </div>
//                     <div className="text-sm opacity-80 mt-1" style={{ color: textColor }}>
//                       Project: {projectName || `Project ${projectId}`}
//                     </div>
//                   </div>

//                   {/* ✅ Role selector */}
//                   <div className="flex items-center gap-2">
//                     <div
//                       className="px-3 py-1 rounded-full text-xs font-bold"
//                       style={{
//                         backgroundColor: theme === "dark" ? "#ffffff10" : "#00000008",
//                         color: textColor,
//                         border: `1px solid ${borderColor}55`,
//                       }}
//                       title="Select role for actions"
//                     >
//                       Role:
//                       <select
//                         value={activeRoleId}
//                         onChange={(e) => setActiveRoleId(e.target.value)}
//                         style={{
//                           marginLeft: 8,
//                           background: "transparent",
//                           color: textColor,
//                           outline: "none",
//                         }}
//                       >
//                         <option value="maker">maker</option>
//                         <option value="checker">checker</option>
//                         <option value="supervisor">supervisor</option>
//                       </select>
//                     </div>

//                     <button
//                       type="button"
//                       onClick={closeModal}
//                       className="px-4 py-2 rounded-xl font-bold"
//                       style={{
//                         backgroundColor: theme === "dark" ? "#ffffff10" : "#00000008",
//                         color: textColor,
//                         border: `1px solid ${borderColor}55`,
//                       }}
//                     >
//                       ✕ Close
//                     </button>
//                   </div>
//                 </div>

//                 {/* Modal Body */}
//                 <div className="px-6 py-5 max-h-[70vh] overflow-auto">
//                   {modalLoading ? (
//                     <div className="py-10 text-center">
//                       <div className="text-lg font-bold" style={{ color: textColor }}>
//                         Loading checklist details…
//                       </div>
//                     </div>
//                   ) : modalError ? (
//                     <div
//                       className="p-4 rounded-xl"
//                       style={{
//                         backgroundColor: theme === "dark" ? "#ffffff0c" : "#00000006",
//                         border: `1px solid ${borderColor}55`,
//                         color: textColor,
//                       }}
//                     >
//                       {modalError}
//                     </div>
//                   ) : modalData ? (
//                     <>
//                       {/* Stage History */}
//                       {Array.isArray(modalData?.stage_history) &&
//                         modalData.stage_history.length > 0 && (
//                           <div
//                             className="p-4 rounded-2xl mb-5"
//                             style={{
//                               backgroundColor: theme === "dark" ? "#ffffff0c" : "#00000006",
//                               border: `1px solid ${borderColor}55`,
//                             }}
//                           >
//                             <div
//                               className="text-lg font-extrabold mb-2"
//                               style={{ color: textColor }}
//                             >
//                               Current Stage History
//                             </div>
//                             {modalData.stage_history.slice(0, 3).map((sh) => (
//                               <div
//                                 key={sh.id}
//                                 className="rounded-xl p-3 mb-2"
//                                 style={{
//                                   backgroundColor:
//                                     theme === "dark" ? "#ffffff08" : "#ffffff",
//                                   border: `1px solid ${
//                                     theme === "dark" ? "#ffffff10" : "#00000010"
//                                   }`,
//                                 }}
//                               >
//                                 <div
//                                   className="flex flex-wrap gap-3 text-sm"
//                                   style={{ color: textColor }}
//                                 >
//                                   <span>
//                                     <b>ID:</b> {sh.id}
//                                   </span>
//                                   <span>
//                                     <b>Stage:</b> {sh.stage}
//                                   </span>
//                                   <span>
//                                     <b>Phase:</b> {sh.phase_id}
//                                   </span>
//                                   <span>
//                                     <b>Status:</b> {sh.status}
//                                   </span>
//                                   <span>
//                                     <b>Started:</b> {fmtDateTime(sh.started_at)}
//                                   </span>
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                         )}

//                       {/* Checklists */}
//                       <div className="flex items-center justify-between mb-3">
//                         <div className="text-xl font-extrabold" style={{ color: textColor }}>
//                           Available Checklists
//                         </div>
//                         <div
//                           className="px-3 py-1 rounded-full text-sm font-bold"
//                           style={{ backgroundColor: borderColor, color: "#1b1b1b" }}
//                         >
//                           Total: {modalData?.count ?? 0}
//                         </div>
//                       </div>

//                       {(() => {
//                         const flattened = flattenChecklists(modalData);
//                         if (!flattened.length) {
//                           return (
//                             <div
//                               className="p-4 rounded-2xl"
//                               style={{
//                                 backgroundColor: theme === "dark" ? "#ffffff0c" : "#00000006",
//                                 border: `1px solid ${borderColor}55`,
//                                 color: textColor,
//                               }}
//                             >
//                               No checklists found for this tower.
//                             </div>
//                           );
//                         }

//                         return flattened.map((cl) => {
//                           const statusLower = String(cl?.status || "").toLowerCase();
//                           const isInitialized =
//                             !!cl?.initialized_at || statusLower === "in_progress";
//                           const isStarting = !!startingById[cl.id];

//                           return (
//                             <div
//                               key={cl.id}
//                               className="rounded-2xl p-4 mb-4"
//                               style={{
//                                 backgroundColor: theme === "dark" ? "#ffffff0c" : "#00000006",
//                                 border: `1px solid ${borderColor}55`,
//                               }}
//                             >
//                               <div className="flex flex-wrap items-center justify-between gap-3">
//                                 <div>
//                                   <div className="text-lg font-extrabold" style={{ color: textColor }}>
//                                     {cl.name || `Checklist #${cl.id}`}
//                                   </div>
//                                   <div className="text-sm opacity-80 mt-1" style={{ color: textColor }}>
//                                     <b>ID:</b> {cl.id} &nbsp; | &nbsp;
//                                     <b>Status:</b> {cl.status} &nbsp; | &nbsp;
//                                     <b>Created:</b> {fmtDateTime(cl.created_at)}
//                                   </div>
//                                   {cl.initialized_at && (
//                                     <div className="text-sm opacity-80 mt-1" style={{ color: textColor }}>
//                                       <b>Initialized:</b> {fmtDateTime(cl.initialized_at)}
//                                     </div>
//                                   )}
//                                 </div>

//                                 {/* ✅ Initialize Button */}
//                                 <div className="flex items-center gap-2">
//                                   <span
//                                     className="px-3 py-1 rounded-full text-xs font-bold"
//                                     style={{
//                                       backgroundColor: theme === "dark" ? "#ffffff10" : "#ffffff",
//                                       color: textColor,
//                                       border: `1px solid ${borderColor}55`,
//                                     }}
//                                   >
//                                     Items: {Array.isArray(cl.items) ? cl.items.length : 0}
//                                   </span>

//                                   <button
//                                     type="button"
//                                     disabled={isInitialized || isStarting}
//                                     onClick={() => startChecklist(cl.id)}
//                                     className="px-4 py-2 rounded-xl font-extrabold text-sm transition-all"
//                                     style={{
//                                       backgroundColor: isInitialized
//                                         ? theme === "dark"
//                                           ? "#ffffff10"
//                                           : "#00000010"
//                                         : borderColor,
//                                       color: isInitialized ? textColor : "#1b1b1b",
//                                       border: `1px solid ${borderColor}55`,
//                                       opacity: isInitialized ? 0.7 : 1,
//                                       cursor: isInitialized ? "not-allowed" : "pointer",
//                                       boxShadow: isInitialized
//                                         ? "none"
//                                         : `0 8px 22px rgba(255, 190, 99, 0.35)`,
//                                     }}
//                                     title={isInitialized ? "Already initialized" : "Initialize this checklist"}
//                                   >
//                                     {isStarting
//                                       ? "Initializing..."
//                                       : isInitialized
//                                       ? "Initialized ✅"
//                                       : "Start / Initialize"}
//                                   </button>
//                                 </div>
//                               </div>

//                               {/* Items */}
//                               <div className="mt-4 space-y-3">
//                                 {(Array.isArray(cl.items) ? cl.items : []).map((it) => {
//                                   const itStatus = String(it?.status || "").toLowerCase();
//                                   const itemCompleted = itStatus === "completed";

//                                   const makerAllowed = makerCanSubmitItem(it);
//                                   const makerSubmitting = !!makerSubmittingByItemId[it.id];

//                                   return (
//                                     <div
//                                       key={it.id}
//                                       className="rounded-xl p-3"
//                                       style={{
//                                         backgroundColor: theme === "dark" ? "#ffffff08" : "#ffffff",
//                                         border: `1px solid ${
//                                           theme === "dark" ? "#ffffff10" : "#00000010"
//                                         }`,
//                                       }}
//                                     >
//                                       <div className="flex flex-wrap items-center justify-between gap-2">
//                                         <div>
//                                           <div className="font-bold" style={{ color: textColor }}>
//                                             {it.title || `Item #${it.id}`}
//                                           </div>
//                                           <div className="text-sm opacity-80 mt-1" style={{ color: textColor }}>
//                                             <b>Status:</b> {it.status}
//                                             {it.photo_required ? " | 📷 Photo required" : ""}
//                                             {it.ignore_now ? " | (ignored)" : ""}
//                                           </div>

//                                           {/* ✅ remark input */}
//                                           <div className="mt-2">
//                                             <input
//                                               value={remarkByItemId[it.id] || ""}
//                                               onChange={(e) =>
//                                                 setRemarkByItemId((p) => ({
//                                                   ...p,
//                                                   [it.id]: e.target.value,
//                                                 }))
//                                               }
//                                               placeholder={
//                                                 activeRoleId === "maker"
//                                                   ? "Maker remarks…"
//                                                   : "Optional remark…"
//                                               }
//                                               className="w-full px-3 py-2 rounded-xl text-sm"
//                                               style={{
//                                                 backgroundColor:
//                                                   theme === "dark" ? "#ffffff10" : "#00000008",
//                                                 color: textColor,
//                                                 border: `1px solid ${borderColor}55`,
//                                                 outline: "none",
//                                               }}
//                                             />
//                                           </div>

//                                           {/* ✅ Maker: file picker */}
//                                           {activeRoleId === "maker" && (
//                                             <div className="mt-2">
//                                               <input
//                                                 type="file"
//                                                 multiple
//                                                 accept="image/*"
//                                                 onChange={(e) => {
//                                                   const files = Array.from(e.target.files || []);
//                                                   setMakerFilesByItemId((p) => ({
//                                                     ...p,
//                                                     [it.id]: files,
//                                                   }));
//                                                 }}
//                                                 className="w-full text-sm"
//                                                 style={{
//                                                   color: textColor,
//                                                 }}
//                                               />
//                                               <div
//                                                 className="text-xs mt-1 opacity-80"
//                                                 style={{ color: textColor }}
//                                               >
//                                                 Selected:{" "}
//                                                 {(makerFilesByItemId[it.id] || []).length}
//                                               </div>
//                                             </div>
//                                           )}
//                                         </div>

//                                         <div
//                                           className="px-3 py-1 rounded-full text-xs font-bold"
//                                           style={{
//                                             backgroundColor: theme === "dark" ? "#ffffff10" : "#00000008",
//                                             color: textColor,
//                                             border: `1px solid ${borderColor}55`,
//                                           }}
//                                         >
//                                           Options: {Array.isArray(it.options) ? it.options.length : 0}
//                                         </div>
//                                       </div>

//                                       {/* Actions */}
//                                       <div className="mt-3">
//                                         {/* ✅ MAKER VIEW: Submit only */}
//                                         {activeRoleId === "maker" ? (
//                                           <div className="flex flex-wrap gap-2 items-center">
//                                             <button
//                                               type="button"
//                                               disabled={!makerAllowed || itemCompleted || makerSubmitting}
//                                               onClick={() => submitMakerDone({ item: it })}
//                                               className="px-4 py-2 rounded-full text-xs font-extrabold transition-all"
//                                               title={
//                                                 !makerAllowed
//                                                   ? "This item is not pending for maker"
//                                                   : itemCompleted
//                                                   ? "Already completed"
//                                                   : "Submit to checker"
//                                               }
//                                               style={{
//                                                 backgroundColor:
//                                                   !makerAllowed || itemCompleted
//                                                     ? theme === "dark"
//                                                       ? "#ffffff10"
//                                                       : "#00000010"
//                                                     : borderColor,
//                                                 color:
//                                                   !makerAllowed || itemCompleted ? textColor : "#1b1b1b",
//                                                 border: `1px solid ${borderColor}55`,
//                                                 opacity: !makerAllowed || itemCompleted ? 0.6 : 1,
//                                                 cursor:
//                                                   !makerAllowed || itemCompleted ? "not-allowed" : "pointer",
//                                                 boxShadow:
//                                                   !makerAllowed || itemCompleted
//                                                     ? "none"
//                                                     : `0 8px 18px rgba(0,0,0,0.15)`,
//                                               }}
//                                             >
//                                               {makerSubmitting ? "Submitting..." : "Submit"}
//                                             </button>

//                                             <span
//                                               className="text-xs opacity-80"
//                                               style={{ color: textColor }}
//                                             >
//                                               (Maker only submits rejected items)
//                                             </span>
//                                           </div>
//                                         ) : (
//                                           // ✅ CHECKER/SUPERVISOR VIEW: YES/NO
//                                           Array.isArray(it.options) &&
//                                           it.options.length > 0 && (
//                                             <div className="flex flex-wrap gap-2">
//                                               {it.options.map((op) => {
//                                                 const isYN = isYesNoOption(op);
//                                                 const k = `${it.id}:${op.id}:${activeRoleId}`;
//                                                 const isVerifying = !!verifyingKey[k];

//                                                 return (
//                                                   <button
//                                                     key={op.id}
//                                                     type="button"
//                                                     disabled={
//                                                       !isYN || itemCompleted || isVerifying
//                                                     }
//                                                     onClick={() =>
//                                                       verifyChecklistItem({
//                                                         checklistItemId: it.id,
//                                                         option: op,
//                                                         item: it,
//                                                       })
//                                                     }
//                                                     className="px-3 py-2 rounded-full text-xs font-extrabold transition-all"
//                                                     title={
//                                                       !isYN
//                                                         ? "Only YES/NO options are clickable"
//                                                         : itemCompleted
//                                                         ? "Item already completed"
//                                                         : "Click to submit YES/NO"
//                                                     }
//                                                     style={{
//                                                       backgroundColor: !isYN
//                                                         ? theme === "dark"
//                                                           ? "#ffffff10"
//                                                           : "#00000010"
//                                                         : String(op.choice || "").toUpperCase() === "P"
//                                                         ? borderColor
//                                                         : "#ff6b6b",
//                                                       color: !isYN ? textColor : "#1b1b1b",
//                                                       border: `1px solid ${borderColor}55`,
//                                                       opacity: !isYN || itemCompleted ? 0.6 : 1,
//                                                       cursor:
//                                                         !isYN || itemCompleted
//                                                           ? "not-allowed"
//                                                           : "pointer",
//                                                       boxShadow:
//                                                         !isYN || itemCompleted
//                                                           ? "none"
//                                                           : `0 8px 18px rgba(0,0,0,0.15)`,
//                                                     }}
//                                                   >
//                                                     {isVerifying
//                                                       ? "Submitting..."
//                                                       : isYN
//                                                       ? yesNoLabel(op)
//                                                       : op.name}
//                                                   </button>
//                                                 );
//                                               })}
//                                             </div>
//                                           )
//                                         )}
//                                       </div>
//                                     </div>
//                                   );
//                                 })}
//                               </div>
//                             </div>
//                           );
//                         });
//                       })()}
//                     </>
//                   ) : (
//                     <div className="text-center py-10 opacity-80" style={{ color: textColor }}>
//                       No data
//                     </div>
//                   )}
//                 </div>

//                 {/* Modal Footer */}
//                 <div
//                   className="px-6 py-4 flex items-center justify-end gap-3"
//                   style={{
//                     borderTop: `1px solid ${
//                       theme === "dark" ? "#ffffff18" : "#00000010"
//                     }`,
//                   }}
//                 >
//                   <button
//                     type="button"
//                     onClick={closeModal}
//                     className="px-5 py-2 rounded-xl font-bold"
//                     style={{
//                       backgroundColor: theme === "dark" ? "#ffffff10" : "#00000008",
//                       color: textColor,
//                       border: `1px solid ${borderColor}55`,
//                     }}
//                   >
//                     Close
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//           {/* ✅ END MODAL */}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProjectDetailsPage;



// ProjectDetailsPage.jsx — ✅ Tower checklist badge + ✅ Modal + ✅ Initialize
// ✅ YES/NO → Verify API (checker/supervisor)
// ✅ Maker Submit → done-maker API (READY TO PASTE)
// ✅ NEW: Role dropdown removed → role is read from localStorage (FLOW_ROLE / ROLE / USER_DATA / persist:root)

import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import projectImage from "../Images/Project.png";
import toast from "react-hot-toast";
import axios from "axios";
import { useTheme } from "../ThemeContext";
import { projectInstance } from "../api/axiosInstance";

const ProjectDetailsPage = () => {
  const { theme } = useTheme();

  // THEME palette
  const ORANGE = "#ffbe63";
  const BG_OFFWHITE = "#fcfaf7";
  const bgColor = theme === "dark" ? "#191922" : BG_OFFWHITE;
  const cardColor = theme === "dark" ? "#23232c" : "#fff";
  const borderColor = ORANGE;
  const textColor = theme === "dark" ? "#fff" : "#222";

  // ✅ APIs
  const CHECKLIST_API_URL =
    "https://konstruct.world/checklists/transfer-getchchklist/";
  const START_CHECKLIST_API_BASE =
    "https://konstruct.world/checklists/start-checklist/"; // + {id}/

  // ✅ YES/NO verify API (PATCH) — checker/supervisor
  const VERIFY_ITEM_API_URL =
    "https://konstruct.world/checklists/Decsion-makeing-forSuer-Inspector/"; // PATCH

  // ✅ Maker submit API (POST multipart)
  const DONE_MAKER_API_URL = "https://konstruct.world/checklists/done-maker/"; // POST

  const { id: projectIdFromUrl } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const projectFromState = location.state?.project;
  const projectId =
    projectFromState?.id || projectFromState?.project_id || projectIdFromUrl;

  const projectImg = projectFromState?.image_url || projectImage;
  const [projectLevelData, setProjectLevelData] = useState([]);

  // Project name
  const [projectName, setProjectName] = useState(
    projectFromState?.name || projectFromState?.project_name || ""
  );

  // per tower meta for badge
  const [towerChecklistMeta, setTowerChecklistMeta] = useState({});

  // cache full details per tower (for modal)
  const [towerChecklistDetails, setTowerChecklistDetails] = useState({});

  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTower, setActiveTower] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [modalData, setModalData] = useState(null);

  // ✅ per-checklist "starting" state
  const [startingById, setStartingById] = useState({});

  // ✅ Optional remarks per item
  const [remarkByItemId, setRemarkByItemId] = useState({});

  // ✅ Loading per item+option click (verify)
  const [verifyingKey, setVerifyingKey] = useState({});

  // ✅ Maker: files per item + loading per item
  const [makerFilesByItemId, setMakerFilesByItemId] = useState({});
  const [makerSubmittingByItemId, setMakerSubmittingByItemId] = useState({});

  // -----------------------------
  // ✅ ACTIVE ROLE from localStorage
  // -----------------------------
  const safeJsonParse = (s) => {
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  };

  const normalizeRole = (raw) => {
    const s = String(raw || "").trim();
    if (!s) return "";
    const up = s.toUpperCase();

    if (up === "MAKER") return "maker";
    if (up === "CHECKER") return "checker";
    if (up === "INSPECTOR") return "checker"; // many places call it inspector but actions are "checker"
    if (up === "SUPERVISOR") return "supervisor";
    if (up === "INITIALIZER" || up === "INITIALISER") return "initializer";

    // if someone saved lowercase already
    const low = s.toLowerCase();
    if (["maker", "checker", "supervisor", "initializer"].includes(low)) return low;

    return "";
  };

  const getActiveRoleFromStorage = () => {
    // 1) direct keys (best)
    const r1 = normalizeRole(localStorage.getItem("FLOW_ROLE"));
    if (r1) return r1;

    const r2 = normalizeRole(localStorage.getItem("ROLE"));
    if (r2) return r2;

    // 2) USER_DATA (often stored)
    const userData = safeJsonParse(localStorage.getItem("USER_DATA"));
    const r3 = normalizeRole(userData?.roles?.[0]);
    if (r3) return r3;

    // 3) redux persist root -> user is usually a JSON string inside
    const pr = safeJsonParse(localStorage.getItem("persist:root"));
    const userState = safeJsonParse(pr?.user); // user is stringified json
    const roles =
      userState?.user?.roles ||
      userState?.roles ||
      userState?.user?.user?.roles ||
      userState?.user?.user?.roles;

    const r4 = normalizeRole(Array.isArray(roles) ? roles[0] : roles);
    if (r4) return r4;

    // fallback
    return "checker";
  };

  const [activeRoleId, setActiveRoleId] = useState(() =>
    getActiveRoleFromStorage()
  );

  // if role changes in localStorage while app running, you can refresh on modal open
  const refreshRoleFromStorage = () => {
    setActiveRoleId(getActiveRoleFromStorage());
  };

  // token + headers
  const token = localStorage.getItem("ACCESS_TOKEN");
  const authHeaders = useMemo(() => {
    if (!token) return {};
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }, [token]);

  const authOnlyHeaders = useMemo(() => {
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  }, [token]);

  const fmtDateTime = (v) => {
    if (!v) return "-";
    try {
      return new Date(v).toLocaleString("en-IN");
    } catch {
      return String(v);
    }
  };

  const flattenChecklists = (apiData) => {
    const results = Array.isArray(apiData?.results) ? apiData.results : [];
    const flattened = [];

    for (const r of results) {
      const legacy = Array.isArray(r?.checklists) ? r.checklists : [];
      const available = Array.isArray(r?.available_for_me)
        ? r.available_for_me
        : [];
      const assigned = Array.isArray(r?.assigned_to_me) ? r.assigned_to_me : [];

      for (const c of [...available, ...assigned, ...legacy]) {
        if (c && c.id != null) flattened.push(c);
      }
    }

    return flattened;
  };

  const applyChecklistUpdateIntoTransferResponse = (data, updatedChecklist) => {
    if (!data || !updatedChecklist?.id) return data;

    const next = { ...data };
    if (!Array.isArray(next.results)) return next;

    const patchArr = (arr) =>
      Array.isArray(arr)
        ? arr.map((c) =>
            c?.id === updatedChecklist.id ? { ...c, ...updatedChecklist } : c
          )
        : arr;

    next.results = next.results.map((group) => {
      if (!group || typeof group !== "object") return group;

      return {
        ...group,
        available_for_me: patchArr(group.available_for_me),
        assigned_to_me: patchArr(group.assigned_to_me),
        checklists: patchArr(group.checklists),
      };
    });

    return next;
  };

  // ✅ Update item status + checklist status in modalData (after verify API)
  const applyItemUpdateIntoTransferResponse = (data, patch) => {
    if (!data || !patch?.item_id) return data;

    const next = { ...data };
    if (!Array.isArray(next.results)) return next;

    const patchItemsArr = (items) =>
      Array.isArray(items)
        ? items.map((it) =>
            it?.id === patch.item_id ? { ...it, status: patch.item_status } : it
          )
        : items;

    const patchChecklist = (cl) => {
      if (!cl || typeof cl !== "object") return cl;

      const newCl = {
        ...cl,
        status: patch.checklist_status ?? cl.status,
      };

      if (Array.isArray(newCl.items)) {
        newCl.items = patchItemsArr(newCl.items);
      }
      return newCl;
    };

    const patchArr = (arr) => (Array.isArray(arr) ? arr.map(patchChecklist) : arr);

    next.results = next.results.map((group) => {
      if (!group || typeof group !== "object") return group;
      return {
        ...group,
        available_for_me: patchArr(group.available_for_me),
        assigned_to_me: patchArr(group.assigned_to_me),
        checklists: patchArr(group.checklists),
      };
    });

    return next;
  };

  // ✅ Maker done-maker response patch
  // backend returns: { item: {...}, submission: {...}, detail: ... }
  const applyMakerDoneIntoTransferResponse = (data, payload) => {
    const item = payload?.item;
    if (!data || !item?.id) return data;

    const next = { ...data };
    if (!Array.isArray(next.results)) return next;

    const patchItemsArr = (items) =>
      Array.isArray(items)
        ? items.map((it) => (it?.id === item.id ? { ...it, status: item.status } : it))
        : items;

    const patchChecklist = (cl) => {
      if (!cl || typeof cl !== "object") return cl;

      if (cl?.id === item.checklist) {
        const newCl = { ...cl };
        if (Array.isArray(newCl.items)) newCl.items = patchItemsArr(newCl.items);
        if (payload?.checklist_status) newCl.status = payload.checklist_status;
        return newCl;
      }

      const newCl = { ...cl };
      if (Array.isArray(newCl.items)) newCl.items = patchItemsArr(newCl.items);
      if (payload?.checklist_status) newCl.status = payload.checklist_status;
      return newCl;
    };

    const patchArr = (arr) => (Array.isArray(arr) ? arr.map(patchChecklist) : arr);

    next.results = next.results.map((group) => {
      if (!group || typeof group !== "object") return group;
      return {
        ...group,
        available_for_me: patchArr(group.available_for_me),
        assigned_to_me: patchArr(group.assigned_to_me),
        checklists: patchArr(group.checklists),
      };
    });

    return next;
  };

  // 1) Fetch towers/buildings for project
  useEffect(() => {
    if (!projectId) {
      navigate("/");
      return;
    }

    const fetchProjectTower = async () => {
      try {
        if (!token) {
          toast.error("Token missing. Please login again.");
          return;
        }
        const response = await projectInstance.get(
          `/buildings/by_project/${projectId}/`,
          { headers: authHeaders }
        );

        if (response.status === 200 && Array.isArray(response.data)) {
          setProjectLevelData(response.data);
        } else {
          setProjectLevelData([]);
          toast.error("Invalid or empty response from server.");
        }
      } catch {
        setProjectLevelData([]);
        toast.error("Something went wrong while fetching project levels.");
      }
    };

    fetchProjectTower();
  }, [projectId, navigate, token, authHeaders]);

  // 2) Fetch project name if not present
  useEffect(() => {
    if (!projectName && projectId) {
      const fetchProjectName = async () => {
        try {
          if (!token) return;
          const response = await projectInstance.get(`/projects/${projectId}/`, {
            headers: authHeaders,
          });
          if (response.status === 200 && response.data?.name) {
            setProjectName(response.data.name);
          } else {
            setProjectName(`Project ${projectId}`);
          }
        } catch {
          setProjectName(`Project ${projectId}`);
        }
      };
      fetchProjectName();
    }
  }, [projectId, projectName, token, authHeaders]);

  // 3) Fetch checklist meta per tower to show badge
  useEffect(() => {
    if (!projectId || !projectLevelData?.length || !token) return;

    let cancelled = false;

    const init = {};
    projectLevelData.forEach((t) => {
      init[t.id] = { loading: true, count: 0, hasChecklist: false, error: false };
    });
    setTowerChecklistMeta(init);

    const fetchMeta = async (towerId) => {
      try {
        const res = await axios.get(CHECKLIST_API_URL, {
          params: {
            project_id: projectId,
            tower_id: towerId,
            building_id: towerId,
            limit: 1,
            offset: 0,
          },
          headers: authHeaders,
        });
        const d = res?.data || {};
        const count = Number(d?.count || 0);
        return { loading: false, count, hasChecklist: count > 0, error: false };
      } catch {
        return { loading: false, count: 0, hasChecklist: false, error: true };
      }
    };

    const runWithConcurrency = async (items, limit) => {
      let idx = 0;
      const runners = new Array(Math.min(limit, items.length))
        .fill(0)
        .map(async () => {
          while (idx < items.length && !cancelled) {
            const currentIndex = idx++;
            const tower = items[currentIndex];
            const meta = await fetchMeta(tower.id);
            if (cancelled) return;
            setTowerChecklistMeta((prev) => ({ ...prev, [tower.id]: meta }));
          }
        });
      await Promise.all(runners);
    };

    runWithConcurrency(projectLevelData, 6);

    return () => {
      cancelled = true;
    };
  }, [projectId, projectLevelData, token, authHeaders]);

  const handleImageClick = (towerId) => {
    navigate(`/Level/${towerId}`, {
      state: {
        projectLevelData,
        projectId: projectId,
      },
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveTower(null);
    setModalLoading(false);
    setModalError("");
    setModalData(null);
    setStartingById({});
    // ✅ role dropdown removed; just re-read role from storage
    refreshRoleFromStorage();
    setRemarkByItemId({});
    setVerifyingKey({});
    setMakerFilesByItemId({});
    setMakerSubmittingByItemId({});
  };

  const openChecklistModal = async (towerObj) => {
    if (!towerObj?.id) return;
    if (!token) {
      toast.error("Token missing. Please login again.");
      return;
    }

    // ✅ refresh role whenever modal opens (so it always matches localStorage)
    refreshRoleFromStorage();

    setIsModalOpen(true);
    setActiveTower(towerObj);
    setModalError("");

    const cached = towerChecklistDetails[towerObj.id];
    if (cached?.raw) {
      setModalData(cached.raw);
      return;
    }

    setModalLoading(true);
    try {
      const res = await axios.get(CHECKLIST_API_URL, {
        params: {
          project_id: projectId,
          tower_id: towerObj.id,
          building_id: towerObj.id,
          limit: 50,
          offset: 0,
        },
        headers: authHeaders,
      });

      const data = res?.data || {};
      const flattened = flattenChecklists(data);

      setTowerChecklistDetails((prev) => ({
        ...prev,
        [towerObj.id]: {
          fetchedAt: Date.now(),
          raw: data,
          flattenedChecklists: flattened,
          stage_history: data?.stage_history || [],
        },
      }));

      setModalData(data);
    } catch {
      setModalError("Could not load checklist details.");
    } finally {
      setModalLoading(false);
    }
  };

  // ✅ START / INITIALIZE checklist
  const startChecklist = async (checklistId) => {
    if (!checklistId) return;
    if (!token) {
      toast.error("Token missing. Please login again.");
      return;
    }

    setStartingById((prev) => ({ ...prev, [checklistId]: true }));

    try {
      const res = await axios.post(
        `${START_CHECKLIST_API_BASE}${checklistId}/`,
        {},
        { headers: authHeaders }
      );

      const payload = res?.data || {};
      const updated = payload?.checklist;

      if (!updated?.id) {
        toast.error("Initialized, but response is missing checklist data.");
        return;
      }

      toast.success("Checklist initialized ✅");

      setModalData((prev) =>
        applyChecklistUpdateIntoTransferResponse(prev, updated)
      );

      if (activeTower?.id) {
        setTowerChecklistDetails((prev) => {
          const current = prev[activeTower.id]?.raw || modalData;
          const nextRaw = applyChecklistUpdateIntoTransferResponse(current, updated);
          return {
            ...prev,
            [activeTower.id]: {
              fetchedAt: Date.now(),
              raw: nextRaw,
              flattenedChecklists: flattenChecklists(nextRaw),
              stage_history: nextRaw?.stage_history || [],
            },
          };
        });
      }
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.error ||
        e?.message ||
        "Failed to initialize checklist.";
      toast.error(String(msg));
    } finally {
      setStartingById((prev) => ({ ...prev, [checklistId]: false }));
    }
  };

  // ✅ YES/NO → Verify item (PATCH) (checker/supervisor)
  const verifyChecklistItem = async ({ checklistItemId, option, item }) => {
    if (!checklistItemId || !option?.id) return;
    if (!token) {
      toast.error("Token missing. Please login again.");
      return;
    }

    // ✅ only checker/supervisor should verify
    if (activeRoleId !== "checker" && activeRoleId !== "supervisor") {
      toast.error("You are not allowed to verify in this role.");
      return;
    }

    const choice = String(option?.choice || "").toUpperCase();
    if (choice !== "P" && choice !== "N") {
      toast.error("This option is not a YES/NO action.");
      return;
    }

    const key = `${checklistItemId}:${option.id}:${activeRoleId}`;
    if (verifyingKey[key]) return;

    const itemStatus = String(item?.status || "").toLowerCase();
    if (itemStatus === "completed") {
      toast.success("Already completed ✅");
      return;
    }

    setVerifyingKey((p) => ({ ...p, [key]: true }));

    try {
      const remark = (remarkByItemId[checklistItemId] || "").trim();

      const body = {
        checklist_item_id: checklistItemId,
        role_id: activeRoleId, // "checker" | "supervisor"
        option_id: option.id,
      };

      if (activeRoleId === "checker") body.check_remark = remark;
      else if (activeRoleId === "supervisor") body.supervisor_remarks = remark;

      const res = await axios.patch(VERIFY_ITEM_API_URL, body, {
        headers: authHeaders,
      });

      const payload = res?.data || {};

      if (choice === "P") toast.success("Approved ✅");
      else toast.success("Rejected ✅");

      setModalData((prev) => applyItemUpdateIntoTransferResponse(prev, payload));

      if (activeTower?.id) {
        setTowerChecklistDetails((prev) => {
          const current = prev[activeTower.id]?.raw || modalData;
          const nextRaw = applyItemUpdateIntoTransferResponse(current, payload);
          return {
            ...prev,
            [activeTower.id]: {
              fetchedAt: Date.now(),
              raw: nextRaw,
              flattenedChecklists: flattenChecklists(nextRaw),
              stage_history: nextRaw?.stage_history || [],
            },
          };
        });
      }
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.error ||
        e?.message ||
        "Failed to verify item.";
      toast.error(String(msg));
    } finally {
      setVerifyingKey((p) => ({ ...p, [key]: false }));
    }
  };

  // ✅ Maker Submit (POST multipart) → done-maker
  const submitMakerDone = async ({ item }) => {
    const checklistItemId = item?.id;
    if (!checklistItemId) return;

    if (!token) {
      toast.error("Token missing. Please login again.");
      return;
    }

    if (activeRoleId !== "maker") {
      toast.error("Only MAKER can submit in this screen.");
      return;
    }

    // Maker should only submit on rejected items (usually pending_for_maker / tetmpory_maker)
    const st = String(item?.status || "").toLowerCase();
    const makerAllowed =
      st === "pending_for_maker" ||
      st === "tetmpory_maker" ||
      st === "temporary_maker" ||
      st === "rejected_by_checker"; // just in case

    if (!makerAllowed) {
      toast.error("This item is not pending for maker.");
      return;
    }

    if (makerSubmittingByItemId[checklistItemId]) return;

    const remark = (remarkByItemId[checklistItemId] || "").trim();
    const files = makerFilesByItemId[checklistItemId] || [];

    // photo required => enforce at least 1 photo
    if (item?.photo_required && (!files || files.length === 0)) {
      toast.error("Photo required. Please attach at least 1 image.");
      return;
    }

    setMakerSubmittingByItemId((p) => ({ ...p, [checklistItemId]: true }));

    try {
      const fd = new FormData();

      fd.append("checklist_item_id", String(checklistItemId));

      // maker remark keys vary; sending both is safe
      if (remark) {
        fd.append("maker_remarks", remark);
        fd.append("remark", remark);
      }

      // attach multiple images
      for (const f of files) {
        fd.append("maker_media_multi", f);
      }

      const res = await axios.post(DONE_MAKER_API_URL, fd, {
        headers: {
          ...authOnlyHeaders, // IMPORTANT: don't set Content-Type manually
        },
      });

      const payload = res?.data || {};
      toast.success(payload?.detail || "Submitted to checker ✅");

      setModalData((prev) => applyMakerDoneIntoTransferResponse(prev, payload));

      if (activeTower?.id) {
        setTowerChecklistDetails((prev) => {
          const current = prev[activeTower.id]?.raw || modalData;
          const nextRaw = applyMakerDoneIntoTransferResponse(current, payload);
          return {
            ...prev,
            [activeTower.id]: {
              fetchedAt: Date.now(),
              raw: nextRaw,
              flattenedChecklists: flattenChecklists(nextRaw),
              stage_history: nextRaw?.stage_history || [],
            },
          };
        });
      }

      // clear maker input after submit
      setRemarkByItemId((p) => ({ ...p, [checklistItemId]: "" }));
      setMakerFilesByItemId((p) => ({ ...p, [checklistItemId]: [] }));
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.error ||
        e?.message ||
        "Failed to submit item by maker.";
      toast.error(String(msg));
    } finally {
      setMakerSubmittingByItemId((p) => ({ ...p, [checklistItemId]: false }));
    }
  };

  const isYesNoOption = (op) => {
    const c = String(op?.choice || "").toUpperCase();
    return c === "P" || c === "N";
  };

  const yesNoLabel = (op) => {
    const c = String(op?.choice || "").toUpperCase();
    if (c === "P") return "YES";
    if (c === "N") return "NO";
    return op?.name || "Option";
  };

  const makerCanSubmitItem = (it) => {
    const st = String(it?.status || "").toLowerCase();
    return (
      st === "pending_for_maker" ||
      st === "tetmpory_maker" ||
      st === "temporary_maker" ||
      st === "rejected_by_checker"
    );
  };

  return (
    <div
      className="flex min-h-screen transition-colors duration-300"
      style={{ backgroundColor: bgColor }}
    >
      <div className="my-8 w-full max-w-7xl mt-8 mx-auto px-4">
        <div
          className="relative pt-8 px-8 pb-10 rounded-2xl transition-all duration-300 hover:shadow-2xl"
          style={{
            backgroundColor: cardColor,
            border: `2px solid ${borderColor}`,
            boxShadow:
              theme === "dark"
                ? `0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 8px 32px rgba(255, 190, 99, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)`
                : `0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 8px 32px rgba(255, 190, 99, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8)`,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          {/* Decorative Background Elements */}
          <div
            className="absolute top-0 left-0 w-32 h-32 rounded-full opacity-10 blur-3xl"
            style={{ backgroundColor: borderColor }}
          />
          <div
            className="absolute bottom-0 right-0 w-24 h-24 rounded-full opacity-10 blur-2xl"
            style={{ backgroundColor: borderColor }}
          />

          {/* Header */}
          <div className="mb-12 relative z-10">
            <div className="text-center">
              <div
                className="w-20 h-1 mx-auto mb-6 rounded-full"
                style={{ backgroundColor: borderColor }}
              />
              <h2
                className="text-5xl font-bold mb-6 tracking-tight relative inline-block"
                style={{
                  color: textColor,
                  textShadow:
                    theme === "dark"
                      ? `0 2px 8px rgba(255, 190, 99, 0.3)`
                      : `0 2px 8px rgba(0, 0, 0, 0.1)`,
                }}
              >
                {projectName || `Project ${projectId}`}
              </h2>
              <p className="text-lg font-medium opacity-80" style={{ color: textColor }}>
                Explore project buildings and levels
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10">
            {projectLevelData && projectLevelData.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {projectLevelData.map((proj, index) => {
                  const meta = towerChecklistMeta?.[proj.id];
                  const showBadge = !!meta?.hasChecklist;

                  return (
                    <div
                      key={proj.id}
                      className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform-gpu"
                      style={{
                        backgroundColor: cardColor,
                        border: `2px solid ${theme === "dark" ? "#ffffff15" : "#00000010"}`,
                        boxShadow:
                          theme === "dark"
                            ? `0 10px 30px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(255, 190, 99, 0.1)`
                            : `0 10px 30px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(255, 190, 99, 0.15)`,
                        animationDelay: `${index * 0.1}s`,
                      }}
                      onClick={() => handleImageClick(proj.id)}
                    >
                      {/* Image */}
                      <div className="relative overflow-hidden">
                        <img
                          src={projectImg}
                          alt={`${proj.name || "Project"} Background`}
                          className="w-full h-72 object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                        />

                        {/* Gradient Overlay */}
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          style={{
                            background: `linear-gradient(135deg, ${borderColor}20 0%, ${borderColor}40 50%, ${borderColor}20 100%)`,
                          }}
                        />

                        {/* Checklist Badge (click => modal) */}
                        {meta?.loading ? (
                          <div
                            className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold"
                            style={{
                              backgroundColor: theme === "dark" ? "#ffffff12" : "#00000010",
                              color: textColor,
                              border: `1px solid ${borderColor}55`,
                              backdropFilter: "blur(8px)",
                            }}
                          >
                            Loading…
                          </div>
                        ) : showBadge ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              openChecklistModal(proj);
                            }}
                            className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold"
                            title="Click to view checklist details"
                            style={{
                              backgroundColor: borderColor,
                              color: "#1b1b1b",
                              boxShadow: `0 6px 18px rgba(255, 190, 99, 0.35)`,
                            }}
                          >
                            🔔 Available Checklist {meta?.count ? `(${meta.count})` : ""}
                          </button>
                        ) : meta?.error ? (
                          <div
                            className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold"
                            style={{
                              backgroundColor: theme === "dark" ? "#ffffff12" : "#00000010",
                              color: textColor,
                              border: `1px solid ${borderColor}55`,
                              backdropFilter: "blur(8px)",
                            }}
                          >
                            Checklist: error
                          </div>
                        ) : null}
                      </div>

                      {/* Bottom Title */}
                      <div
                        className="absolute bottom-0 left-0 right-0 p-4 transition-all duration-500"
                        style={{
                          background:
                            theme === "dark"
                              ? `linear-gradient(to top, rgba(35, 35, 44, 0.95) 0%, rgba(35, 35, 44, 0.8) 70%, transparent 100%)`
                              : `linear-gradient(to top, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 70%, transparent 100%)`,
                          backdropFilter: "blur(10px)",
                        }}
                      >
                        <h3
                          className="text-lg font-bold mb-1 group-hover:scale-105 transition-transform duration-300"
                          style={{ color: textColor }}
                        >
                          {proj.name}
                        </h3>
                        <div
                          className="h-1 rounded-full transition-all duration-500 group-hover:w-full"
                          style={{ backgroundColor: borderColor, width: "30%" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <h3 className="text-2xl font-bold mb-3" style={{ color: textColor }}>
                  No Projects Available
                </h3>
                <p className="text-lg opacity-70" style={{ color: textColor }}>
                  There are currently no projects to display
                </p>
              </div>
            )}
          </div>

          {/* ✅ MODAL */}
          {isModalOpen && (
            <div
              className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
              onClick={closeModal}
              style={{
                backgroundColor: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(6px)",
              }}
            >
              <div
                className="w-full max-w-4xl rounded-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                style={{
                  backgroundColor: cardColor,
                  border: `2px solid ${borderColor}`,
                  boxShadow:
                    theme === "dark"
                      ? `0 30px 70px rgba(0,0,0,0.6)`
                      : `0 30px 70px rgba(0,0,0,0.25)`,
                }}
              >
                {/* Modal Header */}
                <div
                  className="px-6 py-4 flex items-center justify-between flex-wrap gap-3"
                  style={{
                    borderBottom: `1px solid ${theme === "dark" ? "#ffffff18" : "#00000010"}`,
                  }}
                >
                  <div>
                    <div className="text-sm opacity-80" style={{ color: textColor }}>
                      Tower / Building
                    </div>
                    <div className="text-2xl font-extrabold" style={{ color: textColor }}>
                      {activeTower?.name || `Tower ${activeTower?.id || ""}`}
                    </div>
                    <div className="text-sm opacity-80 mt-1" style={{ color: textColor }}>
                      Project: {projectName || `Project ${projectId}`}
                    </div>
                  </div>

                  {/* ✅ Role badge (NO dropdown now) */}
                  <div className="flex items-center gap-2">
                    <div
                      className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{
                        backgroundColor: theme === "dark" ? "#ffffff10" : "#00000008",
                        color: textColor,
                        border: `1px solid ${borderColor}55`,
                      }}
                      title="Role is taken from localStorage (FLOW_ROLE / ROLE)"
                    >
                      Role: {String(activeRoleId || "").toUpperCase()}
                    </div>

                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 rounded-xl font-bold"
                      style={{
                        backgroundColor: theme === "dark" ? "#ffffff10" : "#00000008",
                        color: textColor,
                        border: `1px solid ${borderColor}55`,
                      }}
                    >
                      ✕ Close
                    </button>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="px-6 py-5 max-h-[70vh] overflow-auto">
                  {modalLoading ? (
                    <div className="py-10 text-center">
                      <div className="text-lg font-bold" style={{ color: textColor }}>
                        Loading checklist details…
                      </div>
                    </div>
                  ) : modalError ? (
                    <div
                      className="p-4 rounded-xl"
                      style={{
                        backgroundColor: theme === "dark" ? "#ffffff0c" : "#00000006",
                        border: `1px solid ${borderColor}55`,
                        color: textColor,
                      }}
                    >
                      {modalError}
                    </div>
                  ) : modalData ? (
                    <>
                      {/* Stage History */}
                      {Array.isArray(modalData?.stage_history) &&
                        modalData.stage_history.length > 0 && (
                          <div
                            className="p-4 rounded-2xl mb-5"
                            style={{
                              backgroundColor: theme === "dark" ? "#ffffff0c" : "#00000006",
                              border: `1px solid ${borderColor}55`,
                            }}
                          >
                            <div className="text-lg font-extrabold mb-2" style={{ color: textColor }}>
                              Current Stage History
                            </div>
                            {modalData.stage_history.slice(0, 3).map((sh) => (
                              <div
                                key={sh.id}
                                className="rounded-xl p-3 mb-2"
                                style={{
                                  backgroundColor: theme === "dark" ? "#ffffff08" : "#ffffff",
                                  border: `1px solid ${theme === "dark" ? "#ffffff10" : "#00000010"}`,
                                }}
                              >
                                <div className="flex flex-wrap gap-3 text-sm" style={{ color: textColor }}>
                                  <span>
                                    <b>ID:</b> {sh.id}
                                  </span>
                                  <span>
                                    <b>Stage:</b> {sh.stage}
                                  </span>
                                  <span>
                                    <b>Phase:</b> {sh.phase_id}
                                  </span>
                                  <span>
                                    <b>Status:</b> {sh.status}
                                  </span>
                                  <span>
                                    <b>Started:</b> {fmtDateTime(sh.started_at)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                      {/* Checklists */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xl font-extrabold" style={{ color: textColor }}>
                          Available Checklists
                        </div>
                        <div
                          className="px-3 py-1 rounded-full text-sm font-bold"
                          style={{ backgroundColor: borderColor, color: "#1b1b1b" }}
                        >
                          Total: {modalData?.count ?? 0}
                        </div>
                      </div>

                      {(() => {
                        const flattened = flattenChecklists(modalData);
                        if (!flattened.length) {
                          return (
                            <div
                              className="p-4 rounded-2xl"
                              style={{
                                backgroundColor: theme === "dark" ? "#ffffff0c" : "#00000006",
                                border: `1px solid ${borderColor}55`,
                                color: textColor,
                              }}
                            >
                              No checklists found for this tower.
                            </div>
                          );
                        }

                        return flattened.map((cl) => {
                          const statusLower = String(cl?.status || "").toLowerCase();
                          const isInitialized =
                            !!cl?.initialized_at ||
                            statusLower === "in_progress" ||
                            statusLower === "work_in_progress";

                          const isStarting = !!startingById[cl.id];

                          return (
                            <div
                              key={cl.id}
                              className="rounded-2xl p-4 mb-4"
                              style={{
                                backgroundColor: theme === "dark" ? "#ffffff0c" : "#00000006",
                                border: `1px solid ${borderColor}55`,
                              }}
                            >
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <div className="text-lg font-extrabold" style={{ color: textColor }}>
                                    {cl.name || `Checklist #${cl.id}`}
                                  </div>
                                  <div className="text-sm opacity-80 mt-1" style={{ color: textColor }}>
                                    <b>ID:</b> {cl.id} &nbsp; | &nbsp;
                                    <b>Status:</b> {cl.status} &nbsp; | &nbsp;
                                    <b>Created:</b> {fmtDateTime(cl.created_at)}
                                  </div>
                                  {cl.initialized_at && (
                                    <div className="text-sm opacity-80 mt-1" style={{ color: textColor }}>
                                      <b>Initialized:</b> {fmtDateTime(cl.initialized_at)}
                                    </div>
                                  )}
                                </div>

                                {/* ✅ Initialize Button */}
                                <div className="flex items-center gap-2">
                                  <span
                                    className="px-3 py-1 rounded-full text-xs font-bold"
                                    style={{
                                      backgroundColor: theme === "dark" ? "#ffffff10" : "#ffffff",
                                      color: textColor,
                                      border: `1px solid ${borderColor}55`,
                                    }}
                                  >
                                    Items: {Array.isArray(cl.items) ? cl.items.length : 0}
                                  </span>

                                  <button
                                    type="button"
                                    disabled={isInitialized || isStarting}
                                    onClick={() => startChecklist(cl.id)}
                                    className="px-4 py-2 rounded-xl font-extrabold text-sm transition-all"
                                    style={{
                                      backgroundColor: isInitialized
                                        ? theme === "dark"
                                          ? "#ffffff10"
                                          : "#00000010"
                                        : borderColor,
                                      color: isInitialized ? textColor : "#1b1b1b",
                                      border: `1px solid ${borderColor}55`,
                                      opacity: isInitialized ? 0.7 : 1,
                                      cursor: isInitialized ? "not-allowed" : "pointer",
                                      boxShadow: isInitialized
                                        ? "none"
                                        : `0 8px 22px rgba(255, 190, 99, 0.35)`,
                                    }}
                                    title={isInitialized ? "Already initialized" : "Initialize this checklist"}
                                  >
                                    {isStarting
                                      ? "Initializing..."
                                      : isInitialized
                                      ? "Initialized ✅"
                                      : "Start / Initialize"}
                                  </button>
                                </div>
                              </div>

                              {/* Items */}
                              <div className="mt-4 space-y-3">
                                {(Array.isArray(cl.items) ? cl.items : []).map((it) => {
                                  const itStatus = String(it?.status || "").toLowerCase();
                                  const itemCompleted = itStatus === "completed";

                                  const makerAllowed = makerCanSubmitItem(it);
                                  const makerSubmitting = !!makerSubmittingByItemId[it.id];

                                  return (
                                    <div
                                      key={it.id}
                                      className="rounded-xl p-3"
                                      style={{
                                        backgroundColor: theme === "dark" ? "#ffffff08" : "#ffffff",
                                        border: `1px solid ${
                                          theme === "dark" ? "#ffffff10" : "#00000010"
                                        }`,
                                      }}
                                    >
                                      <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div>
                                          <div className="font-bold" style={{ color: textColor }}>
                                            {it.title || `Item #${it.id}`}
                                          </div>
                                          <div className="text-sm opacity-80 mt-1" style={{ color: textColor }}>
                                            <b>Status:</b> {it.status}
                                            {it.photo_required ? " | 📷 Photo required" : ""}
                                            {it.ignore_now ? " | (ignored)" : ""}
                                          </div>

                                          {/* ✅ remark input */}
                                          <div className="mt-2">
                                            <input
                                              value={remarkByItemId[it.id] || ""}
                                              onChange={(e) =>
                                                setRemarkByItemId((p) => ({
                                                  ...p,
                                                  [it.id]: e.target.value,
                                                }))
                                              }
                                              placeholder={
                                                activeRoleId === "maker"
                                                  ? "Maker remarks…"
                                                  : activeRoleId === "checker"
                                                  ? "Checker remark (optional)…"
                                                  : activeRoleId === "supervisor"
                                                  ? "Supervisor remark (optional)…"
                                                  : "Optional remark…"
                                              }
                                              className="w-full px-3 py-2 rounded-xl text-sm"
                                              style={{
                                                backgroundColor: theme === "dark" ? "#ffffff10" : "#00000008",
                                                color: textColor,
                                                border: `1px solid ${borderColor}55`,
                                                outline: "none",
                                              }}
                                            />
                                          </div>

                                          {/* ✅ Maker: file picker */}
                                          {activeRoleId === "maker" && (
                                            <div className="mt-2">
                                              <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={(e) => {
                                                  const files = Array.from(e.target.files || []);
                                                  setMakerFilesByItemId((p) => ({
                                                    ...p,
                                                    [it.id]: files,
                                                  }));
                                                }}
                                                className="w-full text-sm"
                                                style={{ color: textColor }}
                                              />
                                              <div className="text-xs mt-1 opacity-80" style={{ color: textColor }}>
                                                Selected: {(makerFilesByItemId[it.id] || []).length}
                                              </div>
                                            </div>
                                          )}
                                        </div>

                                        <div
                                          className="px-3 py-1 rounded-full text-xs font-bold"
                                          style={{
                                            backgroundColor: theme === "dark" ? "#ffffff10" : "#00000008",
                                            color: textColor,
                                            border: `1px solid ${borderColor}55`,
                                          }}
                                        >
                                          Options: {Array.isArray(it.options) ? it.options.length : 0}
                                        </div>
                                      </div>

                                      {/* Actions */}
                                      <div className="mt-3">
                                        {/* ✅ MAKER VIEW: Submit only */}
                                        {activeRoleId === "maker" ? (
                                          <div className="flex flex-wrap gap-2 items-center">
                                            <button
                                              type="button"
                                              disabled={!makerAllowed || itemCompleted || makerSubmitting}
                                              onClick={() => submitMakerDone({ item: it })}
                                              className="px-4 py-2 rounded-full text-xs font-extrabold transition-all"
                                              title={
                                                !makerAllowed
                                                  ? "This item is not pending for maker"
                                                  : itemCompleted
                                                  ? "Already completed"
                                                  : "Submit to checker"
                                              }
                                              style={{
                                                backgroundColor:
                                                  !makerAllowed || itemCompleted
                                                    ? theme === "dark"
                                                      ? "#ffffff10"
                                                      : "#00000010"
                                                    : borderColor,
                                                color: !makerAllowed || itemCompleted ? textColor : "#1b1b1b",
                                                border: `1px solid ${borderColor}55`,
                                                opacity: !makerAllowed || itemCompleted ? 0.6 : 1,
                                                cursor:
                                                  !makerAllowed || itemCompleted ? "not-allowed" : "pointer",
                                                boxShadow:
                                                  !makerAllowed || itemCompleted
                                                    ? "none"
                                                    : `0 8px 18px rgba(0,0,0,0.15)`,
                                              }}
                                            >
                                              {makerSubmitting ? "Submitting..." : "Submit"}
                                            </button>

                                            <span className="text-xs opacity-80" style={{ color: textColor }}>
                                              (Maker only submits rejected items)
                                            </span>
                                          </div>
                                        ) : activeRoleId === "checker" || activeRoleId === "supervisor" ? (
                                          // ✅ CHECKER/SUPERVISOR VIEW: YES/NO
                                          Array.isArray(it.options) &&
                                          it.options.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                              {it.options.map((op) => {
                                                const isYN = isYesNoOption(op);
                                                const k = `${it.id}:${op.id}:${activeRoleId}`;
                                                const isVerifying = !!verifyingKey[k];

                                                return (
                                                  <button
                                                    key={op.id}
                                                    type="button"
                                                    disabled={!isYN || itemCompleted || isVerifying}
                                                    onClick={() =>
                                                      verifyChecklistItem({
                                                        checklistItemId: it.id,
                                                        option: op,
                                                        item: it,
                                                      })
                                                    }
                                                    className="px-3 py-2 rounded-full text-xs font-extrabold transition-all"
                                                    title={
                                                      !isYN
                                                        ? "Only YES/NO options are clickable"
                                                        : itemCompleted
                                                        ? "Item already completed"
                                                        : "Click to submit YES/NO"
                                                    }
                                                    style={{
                                                      backgroundColor: !isYN
                                                        ? theme === "dark"
                                                          ? "#ffffff10"
                                                          : "#00000010"
                                                        : String(op.choice || "").toUpperCase() === "P"
                                                        ? borderColor
                                                        : "#ff6b6b",
                                                      color: !isYN ? textColor : "#1b1b1b",
                                                      border: `1px solid ${borderColor}55`,
                                                      opacity: !isYN || itemCompleted ? 0.6 : 1,
                                                      cursor:
                                                        !isYN || itemCompleted ? "not-allowed" : "pointer",
                                                      boxShadow:
                                                        !isYN || itemCompleted
                                                          ? "none"
                                                          : `0 8px 18px rgba(0,0,0,0.15)`,
                                                    }}
                                                  >
                                                    {isVerifying ? "Submitting..." : isYN ? yesNoLabel(op) : op.name}
                                                  </button>
                                                );
                                              })}
                                            </div>
                                          )
                                        ) : (
                                          <div
                                            className="text-xs opacity-80"
                                            style={{ color: textColor }}
                                          >
                                            (No actions available for role:{" "}
                                            {String(activeRoleId || "").toUpperCase()})
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </>
                  ) : (
                    <div className="text-center py-10 opacity-80" style={{ color: textColor }}>
                      No data
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div
                  className="px-6 py-4 flex items-center justify-end gap-3"
                  style={{
                    borderTop: `1px solid ${theme === "dark" ? "#ffffff18" : "#00000010"}`,
                  }}
                >
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-5 py-2 rounded-xl font-bold"
                    style={{
                      backgroundColor: theme === "dark" ? "#ffffff10" : "#00000008",
                      color: textColor,
                      border: `1px solid ${borderColor}55`,
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* ✅ END MODAL */}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;

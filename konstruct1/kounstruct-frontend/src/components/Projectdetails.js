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

// export default ProjectDetailsPage;

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import projectImage from "../Images/Project.png";
import { getProjectLevelDetails } from "../api";
import toast from "react-hot-toast";
import SiteBarHome from "./SiteBarHome";
import axios from "axios";
import { useTheme } from "../ThemeContext";
import { projectInstance } from '../api/axiosInstance';

const ProjectDetailsPage = () => {
  const { theme } = useTheme();

  // THEME palette
  const ORANGE = "#ffbe63";
  const BG_OFFWHITE = "#fcfaf7";
  const bgColor = theme === "dark" ? "#191922" : BG_OFFWHITE;
  const cardColor = theme === "dark" ? "#23232c" : "#fff";
  const borderColor = ORANGE;
  const textColor = theme === "dark" ? "#fff" : "#222";
  const iconColor = ORANGE;

  const { id: projectIdFromUrl } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const projectFromState = location.state?.project;
  const projectId =
    projectFromState?.id || projectFromState?.project_id || projectIdFromUrl;

  const projectImg = projectFromState?.image_url || projectImage;
  const [projectLevelData, setProjectLevelData] = useState([]);

  // NEW: Project name state (get from state, else fallback)
  const [projectName, setProjectName] = useState(
    projectFromState?.name || 
    projectFromState?.project_name || 
    ""
  );

  // 1. Fetch project levels (unchanged)
  useEffect(() => {
    if (!projectId) {
      navigate("/");
      return;
    }
    const fetchProjectTower = async () => {
      try {
        const token = localStorage.getItem("ACCESS_TOKEN");
        const response = await projectInstance.get(
          `/buildings/by_project/${projectId}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.status === 200 && Array.isArray(response.data)) {
          setProjectLevelData(response.data);
        } else {
          setProjectLevelData([]);
          toast.error("Invalid or empty response from server.");
        }
      } catch (error) {
        setProjectLevelData([]);
        toast.error("Something went wrong while fetching project levels.");
      }
    };
    fetchProjectTower();
  }, [projectId, navigate]);

  // 2. Fetch project name if not present
  useEffect(() => {
    if (!projectName && projectId) {
      const fetchProjectName = async () => {
        try {
          const token = localStorage.getItem("ACCESS_TOKEN");
          const response = await projectInstance.get(
            `/projects/${projectId}/`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
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
  }, [projectId, projectName]);

  const handleImageClick = (proj) => {
    navigate(`/Level/${proj}`, {
      state: { 
        projectLevelData,
        projectId: projectId
      },
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div 
      className="flex min-h-screen transition-colors duration-300"
      style={{ backgroundColor: bgColor }}
    >
      {/* <SiteBarHome /> */}
      <div className="my-8 w-full max-w-7xl mt-8 mx-auto px-4">
        <div 
          className="relative pt-8 px-8 pb-10 rounded-2xl transition-all duration-300 hover:shadow-2xl"
          style={{
            backgroundColor: cardColor,
            border: `2px solid ${borderColor}`,
            boxShadow: theme === "dark" 
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
          
          {/* Header Section */}
          <div className="mb-12 relative z-10">
            <div className="text-center">
              {/* Decorative Line */}
              <div 
                className="w-20 h-1 mx-auto mb-6 rounded-full"
                style={{ backgroundColor: borderColor }}
              />
              
              {/* Project Title */}
              <h2 
                className="text-5xl font-bold mb-6 tracking-tight relative inline-block"
                style={{ 
                  color: textColor,
                  textShadow: theme === "dark" 
                    ? `0 2px 8px rgba(255, 190, 99, 0.3)` 
                    : `0 2px 8px rgba(0, 0, 0, 0.1)`,
                }}
              >
                {projectName || `Project ${projectId}`}
                
                {/* Animated Underline */}
                {/* <div 
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1 rounded-full transition-all duration-500 group-hover:w-full"
                  style={{ 
                    backgroundColor: borderColor,
                    width: '60%',
                    background: `linear-gradient(90deg, transparent 0%, ${borderColor} 20%, ${borderColor} 80%, transparent 100%)`,
                  }}
                /> */}
              </h2>
              
              {/* Subtitle */}
              <p 
                className="text-lg font-medium opacity-80"
                style={{ color: textColor }}
              >
                Explore project buildings and levels
              </p>
            </div>
          </div>

          {/* Content Section */}
          <div className="relative z-10">
            {projectLevelData && projectLevelData.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {projectLevelData.map((proj, index) => (
                  <div
                    key={proj.id}
                    className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform-gpu"
                    style={{
                      backgroundColor: cardColor,
                      border: `2px solid ${theme === "dark" ? "#ffffff15" : "#00000010"}`,
                      boxShadow: theme === "dark" 
                        ? `0 10px 30px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(255, 190, 99, 0.1)` 
                        : `0 10px 30px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(255, 190, 99, 0.15)`,
                      animationDelay: `${index * 0.1}s`,
                    }}
                    onClick={() => handleImageClick(proj.id)}
                  >
                    {/* Image Container */}
                    <div className="relative overflow-hidden">
                      <img
                        src={projectImg}
                        alt={`${proj.name || proj.naming_convention || "Project"} Background`}
                        className="w-full h-72 object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                      />
                      
                      {/* Gradient Overlay */}
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          background: `linear-gradient(135deg, ${borderColor}20 0%, ${borderColor}40 50%, ${borderColor}20 100%)`,
                        }}
                      />
                      
                      {/* Hover Icon */}
                      <div className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-0 group-hover:scale-100"
                        style={{
                          backgroundColor: borderColor,
                          boxShadow: `0 4px 12px rgba(255, 190, 99, 0.4)`,
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15,3 21,3 21,9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                      </div>
                    </div>

                    {/* Content Container */}
                    <div 
                      className="absolute bottom-0 left-0 right-0 p-4 transition-all duration-500"
                      style={{
                        background: theme === "dark" 
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
                      
                      {/* Animated Bottom Border */}
                      <div 
                        className="h-1 rounded-full transition-all duration-500 group-hover:w-full"
                        style={{ 
                          backgroundColor: borderColor,
                          width: '30%',
                        }}
                      />
                    </div>

                    {/* Corner Accent */}
                    <div 
                      className="absolute top-0 left-0 w-0 h-0 border-l-[20px] border-t-[20px] border-r-0 border-b-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        borderLeftColor: 'transparent',
                        borderTopColor: borderColor,
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div 
                  className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
                  style={{ 
                    backgroundColor: theme === "dark" ? "#ffffff10" : "#00000005",
                    border: `2px dashed ${borderColor}40`,
                  }}
                >
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={borderColor} strokeWidth="1.5">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 
                  className="text-2xl font-bold mb-3"
                  style={{ color: textColor }}
                >
                  No Projects Available
                </h3>
                <p 
                  className="text-lg opacity-70"
                  style={{ color: textColor }}
                >
                  There are currently no projects to display
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;


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

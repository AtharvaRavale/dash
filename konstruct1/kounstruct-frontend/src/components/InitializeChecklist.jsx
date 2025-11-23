// import React, { useEffect, useState } from "react";
// import SiteBarHome from "./SiteBarHome";
// import { projectInstance, NEWchecklistInstance } from "../api/axiosInstance";

// function InitializeChecklist() {
//   const [projects, setProjects] = useState([]);
//   const [selectedProjectId, setSelectedProjectId] = useState("");
//   const [loadingProjects, setLoadingProjects] = useState(true);
//   const [error, setError] = useState(null);

//   // Checklists state
//   const [checklists, setChecklists] = useState([]);
//   const [loadingChecklists, setLoadingChecklists] = useState(false);
//   const [checklistError, setChecklistError] = useState(null);

//   // Get user/checker accesses from localStorage
//   const userStr = localStorage.getItem("user");

//   const accessesStr = localStorage.getItem("ACCESSES");
//   const accesses = accessesStr ? JSON.parse(accessesStr) : [];
//   console.log("Current accesses:", accesses);

//   // Function to refresh checklists
//   const refreshChecklists = async () => {
//     if (!selectedProjectId) {
//       setChecklists([]);
//       return;
//     }

//     console.log("Fetching checklists for project:", selectedProjectId);
//     setLoadingChecklists(true);
//     setChecklistError(null);
//     try {
//       const res = await NEWchecklistInstance.get(
//         `/initializer-accessible-checklists/`,
//         {
//           params: { project_id: selectedProjectId },
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("access")}`,
//           },
//         }
//       );

//       console.log("Checklists response:", res.data);
//       console.log("Is array?", Array.isArray(res.data));
//       console.log("Data length:", res.data?.length);

//       const checklistData = Array.isArray(res.data) ? res.data : [];
//       console.log("Setting checklists:", checklistData);
//       setChecklists(checklistData);
//     } catch (err) {
//       console.error("Checklist fetch error:", err);
//       setChecklistError("Failed to load checklists");
//       setChecklists([]);
//     } finally {
//       setLoadingChecklists(false);
//     }
//   };

//   // Initialize checklist function
//   const handleInitializeChecklist = async (checklistId) => {
//     try {
//       console.log("Initializing checklist:", checklistId);

//       // Hit the start-checklist API
//       await NEWchecklistInstance.post(
//         `/start-checklist/${checklistId}/`,
//         {},
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("access")}`,
//           },
//         }
//       );

//       console.log("Checklist initialized successfully:", checklistId);
//       alert("Checklist initialized successfully!");

//       // Refresh the checklist list to remove the initialized checklist
//       await refreshChecklists();
//     } catch (err) {
//       console.error("Initialize checklist error:", err);
//       alert("Failed to initialize checklist. Please try again.");
//     }
//   };

//   // Fetch projects
//   useEffect(() => {
//     async function fetchProjects() {
//       setLoadingProjects(true);
//       setError(null);
//       try {
//         // Filter projects where user has access (you can modify the role filter as needed)
//         const userProjects = accesses
//           .filter((a) => a.active) // Add specific role filter here if needed
//           .map((a) => Number(a.project_id));

//         const res = await projectInstance.get("/projects/", {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("access")}`,
//           },
//         });

//         const allProjects = Array.isArray(res.data)
//           ? res.data
//           : res.data.results;
//         console.log("all projects:", allProjects);

//         const filtered = allProjects.filter((p) => userProjects.includes(p.id));

//         setProjects(filtered);
//         if (filtered.length > 0 && !selectedProjectId) {
//           setSelectedProjectId(filtered[0].id);
//         }
//       } catch (err) {
//         setError("Failed to load projects");
//         setProjects([]);
//       } finally {
//         setLoadingProjects(false);
//       }
//     }

//     if (accesses.length > 0) {
//       fetchProjects();
//     }
//   }, []); // Remove userStr dependency to prevent re-renders

//   // Fetch checklists when project is selected
//   useEffect(() => {
//     refreshChecklists();
//   }, [selectedProjectId]);

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       <SiteBarHome />
//       <main className="ml-[15%] w-full p-6">
//         <h2 className="text-2xl font-bold mb-4">Initialize Checklist</h2>

//         {/* Project Dropdown */}
//         <div className="mb-6">
//           <label className="block mb-2 font-semibold">Select Project:</label>
//           {loadingProjects ? (
//             <p>Loading projects...</p>
//           ) : error ? (
//             <p className="text-red-500">{error}</p>
//           ) : (
//             <select
//               className="p-2 border rounded"
//               value={selectedProjectId}
//               onChange={(e) => setSelectedProjectId(Number(e.target.value))}
//               disabled={projects.length === 0}
//             >
//               {projects.length === 0 && <option>No projects</option>}
//               {projects.map((p) => (
//                 <option key={p.id} value={p.id}>
//                   {p.name || `Project #${p.id}`}
//                 </option>
//               ))}
//             </select>
//           )}
//         </div>

//         {/* Selected Project Info */}
//         {selectedProjectId && (
//           <div className="bg-white rounded-lg shadow p-4 mb-6">
//             <h3 className="font-semibold mb-2">Selected Project:</h3>
//             <p>Project ID: {selectedProjectId}</p>
//             <p>
//               Project Name:{" "}
//               {projects.find((p) => p.id === selectedProjectId)?.name || "N/A"}
//             </p>
//           </div>
//         )}

//         {/* Checklists Section */}
//         <div className="bg-white rounded-lg shadow p-6">
//           <h3 className="text-xl font-semibold mb-4">
//             Available Checklists to Initialize
//           </h3>

//           {/* Debug info */}
//           <div className="mb-4 p-2 bg-gray-100 rounded text-sm">
//             <p>Loading: {loadingChecklists.toString()}</p>
//             <p>Error: {checklistError || "None"}</p>
//             <p>Checklists count: {checklists.length}</p>
//           </div>

//           {loadingChecklists ? (
//             <p>Loading checklists...</p>
//           ) : checklistError ? (
//             <p className="text-red-500">{checklistError}</p>
//           ) : !checklists.length ? (
//             <p className="text-gray-600">
//               No checklists available to initialize for this project.
//             </p>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {checklists.map((checklist) => (
//                 <div
//                   key={checklist.id}
//                   className="border rounded-lg p-4 hover:shadow-md transition-shadow"
//                 >
//                   <div className="flex justify-between items-start mb-2">
//                     <h4 className="font-semibold text-lg">{checklist.name}</h4>
//                     <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
//                       ID: {checklist.id}
//                     </span>
//                   </div>

//                   <div className="text-sm text-gray-600 mb-3">
//                     <p>Category: {checklist.category || "--"}</p>
//                     <p>Building: {checklist.building_id || "--"}</p>
//                     <p>Zone: {checklist.zone_id || "--"}</p>
//                     <p>Flat: {checklist.flat_id || "--"}</p>
//                     <p>Items: {checklist.items?.length || 0}</p>
//                     <p>
//                       Status:{" "}
//                       <span className="font-medium text-orange-600">
//                         {checklist.status}
//                       </span>
//                     </p>
//                   </div>

//                   <button
//                     className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition-colors"
//                     onClick={() => handleInitializeChecklist(checklist.id)}
//                   >
//                     Initialize Checklist
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }

// export default InitializeChecklist;

import React, { useEffect, useState } from "react";
import SiteBarHome from "./SiteBarHome";
import { projectInstance, NEWchecklistInstance } from "../api/axiosInstance";
import { useTheme } from "../ThemeContext";

// UTILITY: Detect if current user is Initializer
function isInitializerRole() {
  try {
    const userStr = localStorage.getItem("USER_DATA");
    if (!userStr || userStr === "undefined") return false;
    const userData = JSON.parse(userStr);

    if (userData.role === "Intializer") return true;
    if (Array.isArray(userData.roles)) {
      if (
        userData.roles.some(
          (r) =>
            (typeof r === "string" && r === "Intializer") ||
            (typeof r === "object" && r && r.role === "Intializer")
        )
      )
        return true;
    }
    if (Array.isArray(userData.accesses)) {
      for (let a of userData.accesses) {
        if (
          Array.isArray(a.roles) &&
          a.roles.some(
            (r) =>
              (typeof r === "string" && r === "Intializer") ||
              (typeof r === "object" && r && r.role === "Intializer")
          )
        )
          return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

function InitializeChecklist() {
  const { theme, toggleTheme } = useTheme();
  const isInitializer = isInitializerRole();

  // --- Clean palette, use everywhere below ---
  const palette = theme === "dark"
    ? {
        pageBg: "bg-[#181820]",
        card: "bg-[#23232e] border border-yellow-400/30 shadow-lg",
        section: "bg-[#23232e]",
        text: "text-yellow-100",
        textHead: "text-yellow-300",
        textDim: "text-yellow-400",
        border: "border-yellow-400/50",
        select: "bg-[#191921] text-yellow-100 border-yellow-400/30",
        button: "bg-yellow-400 hover:bg-yellow-300 text-black font-semibold",
        buttonAlt: "bg-[#222] hover:bg-yellow-700 text-yellow-200",
        input: "bg-[#23232e] text-yellow-100 border-yellow-400/30",
        badge: "bg-yellow-800 text-yellow-200"
      }
    : {
        pageBg: "bg-gray-50",
        card: "bg-white border border-orange-200 shadow",
        section: "bg-white",
        text: "text-gray-800",
        textHead: "text-orange-600",
        textDim: "text-gray-500",
        border: "border-orange-300",
        select: "bg-white text-gray-800 border-orange-300",
        button: "bg-orange-500 hover:bg-orange-600 text-white font-semibold",
        buttonAlt: "bg-gray-200 hover:bg-orange-300 text-orange-800",
        input: "bg-white text-gray-800 border-orange-300",
        badge: "bg-orange-100 text-orange-700"
      };

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState(null);

  const [checklists, setChecklists] = useState([]);
  const [loadingChecklists, setLoadingChecklists] = useState(false);
  const [checklistError, setChecklistError] = useState(null);

  const [checklistItems, setChecklistItems] = useState([]);
  const [loadingChecklistItems, setLoadingChecklistItems] = useState(false);
  const [viewedChecklistName, setViewedChecklistName] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isViewingItems, setIsViewingItems] = useState(false);

  const accessesStr = localStorage.getItem("ACCESSES");
  const accesses = accessesStr ? JSON.parse(accessesStr) : [];

  const refreshChecklists = async () => {
    if (!selectedProjectId) {
      setChecklists([]);
      return;
    }
    setLoadingChecklists(true);
    setChecklistError(null);
    try {
      const res = await NEWchecklistInstance.get(
        `/initializer-accessible-checklists/`,
        {
          params: { project_id: selectedProjectId },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      const checklistData = Array.isArray(res.data) ? res.data : [];
      setChecklists(checklistData);
    } catch (err) {
      setChecklistError("Failed to load checklists");
      setChecklists([]);
    } finally {
      setLoadingChecklists(false);
    }
  };

  const handleInitializeChecklist = async (checklistId) => {
    try {
      await NEWchecklistInstance.post(
        `/start-checklist/${checklistId}/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      alert("Checklist initialized successfully!");
      await refreshChecklists();
    } catch (err) {
      alert("Failed to initialize checklist. Please try again.");
    }
  };

  const handleViewChecklist = async (checklistId) => {
    try {
      setLoadingChecklistItems(true);
      setIsViewingItems(true);
      const response = await NEWchecklistInstance.get(
        `/checklist-items/${checklistId}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      const checklist = checklists.find((c) => c.id === checklistId);
      setViewedChecklistName(checklist?.name || `Checklist #${checklistId}`);
      setChecklistItems(response.data);
    } catch (err) {
      setChecklistItems([]);
      setIsViewingItems(false);
      alert("Failed to load checklist. Please try again.");
    } finally {
      setLoadingChecklistItems(false);
    }
  };

  const handleGoBack = () => {
    setIsViewingItems(false);
    setChecklistItems([]);
    setViewedChecklistName("");
  };

  const filteredChecklists =
    statusFilter === "all"
      ? checklists
      : checklists.filter((checklist) => checklist.status === statusFilter);

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "not_started", label: "Not Started" },
    { value: "in_progress", label: "In Progress" },
    { value: "work_in_progress", label: "Work in Progress" },
    { value: "completed", label: "Completed" },
  ];

  // Badge color by status (yellow for in_progress/work_in_progress)
  const getStatusColor = (status) => {
    switch (status) {
      case "not_started":
        return palette.badge;
      case "in_progress":
        return theme === "dark"
          ? "bg-yellow-400 text-black"
          : "bg-orange-200 text-orange-900";
      case "work_in_progress":
        return theme === "dark"
          ? "bg-yellow-500 text-black"
          : "bg-orange-300 text-orange-900";
      case "completed":
        return "bg-green-200 text-green-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  useEffect(() => {
    if (isViewingItems) {
      setIsViewingItems(false);
      setChecklistItems([]);
      setViewedChecklistName("");
    }
    // eslint-disable-next-line
  }, [statusFilter]);

  useEffect(() => {
    async function fetchProjects() {
      setLoadingProjects(true);
      setError(null);
      try {
        const userProjects = accesses
          .filter((a) => a.active)
          .map((a) => Number(a.project_id));
        const res = await projectInstance.get("/projects/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        });
        const allProjects = Array.isArray(res.data)
          ? res.data
          : res.data.results;
        const filtered = allProjects.filter((p) =>
          userProjects.includes(p.id)
        );
        setProjects(filtered);
        if (filtered.length > 0 && !selectedProjectId) {
          setSelectedProjectId(filtered[0].id);
        }
      } catch (err) {
        setError("Failed to load projects");
        setProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    }

    if (accesses.length > 0) {
      fetchProjects();
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    refreshChecklists();
    // eslint-disable-next-line
  }, [selectedProjectId]);

  // --- THEME TOGGLE BUTTON (only for Initializer)
  // const ThemeToggle = () =>
  //   isInitializer ? (
  //     // <button
  //     //   className={`
  //     //     fixed top-5 right-7 z-50 px-4 py-2 rounded-xl shadow-md font-semibold text-sm
  //     //     ${palette.button}
  //     //   `}
  //     //   style={{
  //     //     border: theme === "dark" ? "2px solid #facc15" : "2px solid #ffa726",
  //     //   }}
  //     //   onClick={toggleTheme}
  //     // >
  //     //   {theme === "dark" ? "Light Mode" : "Dark Mode"}
  //     // </button>
  //   ) : null;

  return (
    <div className={`flex min-h-screen ${palette.pageBg}`}>
      <SiteBarHome />
      {/* <ThemeToggle /> */}
      <main className="ml-[15%] w-full p-6">
        {/* MAIN CHECKLIST ITEMS VIEW */}
        {isViewingItems ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <button
                  onClick={handleGoBack}
                  className={`mr-4 px-4 py-2 rounded-lg font-medium shadow-sm border ${palette.buttonAlt}`}
                  style={{ borderColor: "#fff2", minWidth: 110 }}
                >
                  ← Go Back
                </button>
                <h2 className={`text-2xl font-bold ${palette.textHead}`}>
                  {viewedChecklistName}
                </h2>
              </div>
            </div>
            <div className={`${palette.card} rounded-lg p-6`}>
              {loadingChecklistItems ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400 mr-3"></div>
                  <span className={`${palette.text} text-lg`}>
                    Loading checklist items...
                  </span>
                </div>
              ) : checklistItems.length === 0 ? (
                <div className="text-center py-12">
                  <p className={`${palette.textDim} text-lg`}>
                    No items found for this checklist.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="mb-6">
                    <h3 className={`text-lg font-semibold ${palette.textHead} mb-2`}>
                      Checklist Items ({checklistItems.length})
                    </h3>
                    <p className={`${palette.textDim} text-sm`}>
                      Review and manage the items in this checklist
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {checklistItems.map((item) => (
                      <div
                        key={item.id}
                        className={`${palette.card} border rounded-lg p-6 hover:shadow-md transition-shadow`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h4 className={`font-semibold text-lg ${palette.text}`}>
                            {item.title}
                          </h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            ID: {item.id}
                          </span>
                        </div>
                        {item.description && (
                          <div className="mb-4">
                            <p className={`${palette.textDim} text-sm bg-transparent p-3 rounded border`}>
                              {item.description}
                            </p>
                          </div>
                        )}
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between">
                            <span className={`font-medium text-sm ${palette.textDim}`}>
                              Status:
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                              {item.status.replace("_", " ").toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className={`font-medium text-sm ${palette.textDim}`}>
                              Photo Required:
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.photo_required ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>
                              {item.photo_required ? "Yes" : "No"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className={`font-medium text-sm ${palette.textDim}`}>
                              Ignore Now:
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.ignore_now ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>
                              {item.ignore_now ? "Yes" : "No"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // MAIN VIEW (Project Selection, Filters, Checklists)
          <div>
            <h2 className={`text-2xl font-bold mb-6 ${palette.textHead}`}>Initialize Checklist</h2>
            {/* Project Selection and Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className={`${palette.card} rounded-lg p-4`}>
                <label className={`block mb-2 font-semibold ${palette.textHead}`}>
                  Select Project:
                </label>
                {loadingProjects ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400 mr-2"></div>
                    <span className={`${palette.textDim}`}>Loading projects...</span>
                  </div>
                ) : error ? (
                  <p className="text-red-500 text-sm">{error}</p>
                ) : (
                  <select
                    className={`w-full p-3 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent border-2 ${palette.select}`}
                    value={selectedProjectId}
                    onChange={(e) =>
                      setSelectedProjectId(Number(e.target.value))
                    }
                    disabled={projects.length === 0}
                  >
                    {projects.length === 0 && (
                      <option>No projects available</option>
                    )}
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name || `Project #${p.id}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              {/* Selected Project Info */}
              {selectedProjectId && (
                <div className={`${palette.card} rounded-lg p-4`}>
                  <h3 className={`font-semibold mb-2 ${palette.textHead}`}>
                    Selected Project Details:
                  </h3>
                  <div className={`text-sm ${palette.textDim}`}>
                    <p>
                      <span className="font-medium">ID:</span>{" "}
                      {selectedProjectId}
                    </p>
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {projects.find((p) => p.id === selectedProjectId)?.name ||
                        "N/A"}
                    </p>
                  </div>
                </div>
              )}
            </div>
            {/* Status Filter */}
            <div className={`${palette.card} rounded-lg p-6 mb-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${palette.textHead}`}>
                Filter by Status
              </h3>
              <div className="flex flex-wrap gap-3">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setStatusFilter(option.value)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      statusFilter === option.value
                        ? `${palette.button} shadow-md`
                        : `${palette.buttonAlt}`
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {statusFilter !== "all" && (
                <p className={`${palette.textDim} text-sm mt-2`}>
                  Currently showing:{" "}
                  {
                    statusOptions.find((opt) => opt.value === statusFilter)
                      ?.label
                  }
                </p>
              )}
            </div>
            {/* Checklists */}
            <div className={`${palette.card} rounded-lg p-6`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-xl font-semibold ${palette.textHead}`}>
                  Available Checklists
                </h3>
                {filteredChecklists.length > 0 && (
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                    {filteredChecklists.length} checklist
                    {filteredChecklists.length !== 1 ? "s" : ""} found
                  </span>
                )}
              </div>
              {loadingChecklists ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mr-3"></div>
                  <span className={`${palette.textDim}`}>Loading checklists...</span>
                </div>
              ) : checklistError ? (
                <div className="text-center py-8">
                  <p className="text-red-500 mb-2">{checklistError}</p>
                  <button
                    onClick={refreshChecklists}
                    className={`${palette.button} px-4 py-2 rounded-lg font-medium mt-2`}
                  >
                    Try Again
                  </button>
                </div>
              ) : !filteredChecklists.length ? (
                <div className="text-center py-8">
                  <p className={`${palette.textDim}`}>
                    {statusFilter === "all"
                      ? "No checklists available for this project."
                      : `No checklists found with status: ${
                          statusOptions.find(
                            (opt) => opt.value === statusFilter
                          )?.label
                        }`}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredChecklists.map((checklist) => (
                    <div
                      key={checklist.id}
                      className={`${palette.card} border rounded-lg p-4 hover:shadow-md transition-shadow`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className={`font-semibold text-lg ${palette.text}`}>
                          {checklist.name}
                        </h4>
                        <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">
                          #{checklist.id}
                        </span>
                      </div>
                      <div className={`text-sm ${palette.textDim} mb-3 space-y-1`}>
                        <p>
                          <span className="font-medium">Category:</span>{" "}
                          {checklist.category || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Building:</span>{" "}
                          {checklist.building_id || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Zone:</span>{" "}
                          {checklist.zone_id || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Flat:</span>{" "}
                          {checklist.flat_id || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Items:</span>{" "}
                          {checklist.items?.length || 0}
                        </p>
                      </div>
                      <div className="mb-3">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(checklist.status)}`}>
                          {checklist.status.replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {checklist.status === "not_started" && (
                          <button
                            className={`flex-1 ${palette.button} py-2 px-4 rounded transition-colors`}
                            onClick={() =>
                              handleInitializeChecklist(checklist.id)
                            }
                          >
                            Initialize
                          </button>
                        )}
                        <button
                          className={`flex-1 ${palette.buttonAlt} py-2 px-4 rounded transition-colors`}
                          onClick={() => handleViewChecklist(checklist.id)}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default InitializeChecklist;

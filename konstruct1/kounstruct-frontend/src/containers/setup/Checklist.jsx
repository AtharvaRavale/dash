// import { useState, useEffect } from "react";
// import ChecklistForm from "./ChecklistForm";
// import Checklistdetails from "./ChecklistDetails";
// import SideBarSetup from "../../components/SideBarSetup";
// import UserSelectionTable from "../../components/UserSelectionTable";

// import {
//   getProjectsByOwnership,
//   getProjectUserDetails,
//   Allprojects,
//   getMyChecklists,
//   deleteChecklistById,
// } from "../../api";
// import { showToast } from "../../utils/toast";
// import { useTheme } from "../../ThemeContext";

// const Checklist = () => {
//   const { theme } = useTheme();

//   // Color palette
//   const palette =
//     theme === "dark"
//       ? {
//           selectText: "text-yellow-300", // More visible yellow
//           selectBg: "bg-[#191919]",
//           bg: "#0a0a0f",
//           card: "bg-gradient-to-br from-[#191919] to-[#181820]",
//           text: "text-yellow-100",
//           textSecondary: "text-yellow-200/70",
//           border: "border-yellow-600/30",
//           tableHead: "bg-[#191919] text-yellow-300 border-yellow-600/30",
//           tableRow: "hover:bg-yellow-900/5 border-yellow-600/10",
//           shadow: "shadow-2xl shadow-yellow-900/20",
//           primary:
//             "bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold hover:from-yellow-600 hover:to-yellow-700",
//           secondary:
//             "bg-gradient-to-r from-yellow-900 to-yellow-800 text-yellow-100 hover:from-yellow-800 hover:to-yellow-700",
//           badge:
//             "bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500",
//           badgeText: "text-yellow-900 font-bold",
//           success:
//             "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800",
//           warning:
//             "bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:from-amber-700 hover:to-amber-800",
//           danger:
//             "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800",
//           info: "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800",
//         }
//       : {
//           selectText: "text-gray-900", // Dark text for light theme
//           selectBg: "bg-white",
//           bg: "#faf9f7",
//           card: "bg-gradient-to-br from-white to-orange-50/30",
//           text: "text-orange-900",
//           textSecondary: "text-orange-700/70",
//           border: "border-orange-300/60",
//           tableHead: "bg-orange-50 text-orange-700 border-orange-300/60",
//           tableRow: "hover:bg-orange-50 border-orange-100/30",
//           shadow: "shadow-xl shadow-orange-200/30",
//           primary:
//             "bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold hover:from-orange-600 hover:to-orange-700",
//           secondary:
//             "bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600",
//           badge:
//             "bg-gradient-to-r from-orange-300 via-orange-400 to-orange-500",
//           badgeText: "text-orange-900 font-bold",
//           success:
//             "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700",
//           warning:
//             "bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700",
//           danger:
//             "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700",
//           info: "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700",
//         };

//   // State
//   const [userData, setUserData] = useState(null);
//   const [projects, setProjects] = useState([]);
//   const [selectedProjectId, setSelectedProjectId] = useState("");
//   const [checklistData, setChecklistData] = useState([]);
//   const [showForm, setShowForm] = useState(false);
//   const [detailForm, setDetailForm] = useState(false);
//   const [selectedChecklist, setSelectedChecklist] = useState(null);

//   const [showUserSelection, setShowUserSelection] = useState(false);
//   const [userAccessProjectId, setUserAccessProjectId] = useState(null);
//   const [userAccessCategoryId, setUserAccessCategoryId] = useState(null);
//   const [currentChecklistId, setCurrentChecklistId] = useState(null);
//   const [refreshTrigger, setRefreshTrigger] = useState(0);
// const [isButtonDisabled, setIsButtonDisabled] = useState(false);

//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
//   const [checklistToDelete, setChecklistToDelete] = useState(null);
//   const [isDeleting, setIsDeleting] = useState(false);

//   // Quick preview state
//   const [showQuickPreview, setShowQuickPreview] = useState(false);
//   const [previewChecklist, setPreviewChecklist] = useState(null);

//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;

//   const filteredChecklistData = selectedProjectId
//     ? checklistData.filter(
//         (item) => String(item.project_id) === String(selectedProjectId)
//       )
//     : checklistData;
// console.log();

//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = filteredChecklistData.slice(
//     indexOfFirstItem,
//     indexOfLastItem
//   );
//   const totalPages = Math.ceil(filteredChecklistData.length / itemsPerPage);
// console.log(currentItems,'current');

//   // Fetch user and project
//   useEffect(() => {
//     const role = localStorage.getItem("ROLE");
//     const userString = localStorage.getItem("USER_DATA");
//     const userData =
//       userString && userString !== "undefined" ? JSON.parse(userString) : null;
//     setUserData(userData);

//     if (!userData) {
//       setProjects([]);
//       return;
//     }

//     const fetchProjects = async () => {
//       try {
//         let response = null;
//         if (role === "Super Admin") {
//           response = await Allprojects();
//         } else if (role === "Admin") {
//           response = await getProjectUserDetails();
//         } else {
//           const entity_id = userData.entity_id || null;
//           const company_id = userData.company_id || null;
//           const organization_id =
//             userData.org || userData.organization_id || null;
//           if (!entity_id && !company_id && !organization_id) {
//             setProjects([]);
//             return;
//           }
//           response = await getProjectsByOwnership({
//             entity_id,
//             company_id,
//             organization_id,
//           });
//         }
//         if (response && response.status === 200) {
//           setProjects(response.data || []);
//         } else {
//           setProjects([]);
//           showToast("Failed to fetch projects.", "error");
//         }
//       } catch (err) {
//         setProjects([]);
//         showToast("Failed to fetch projects.", "error");
//       }
//     };
//     fetchProjects();
//   }, []);

//   useEffect(() => {
//     if (!selectedProjectId) {
//       const fetchMyChecklists = async () => {
//         try {
//           const response = await getMyChecklists();
//           if (response.status === 200) {
//             setChecklistData(response.data || []);
//           } else {
//             setChecklistData([]);
//             showToast("Failed to fetch your checklists.", "error");
//           }
//         } catch (err) {
//           setChecklistData([]);
//           showToast("Failed to fetch your checklists.", "error");
//         }
//       };
//       fetchMyChecklists();
//     }
//   }, [selectedProjectId]);

//   const handleChecklistCreated = (newChecklist) => {
//     if (
//       newChecklist.project_id &&
//       newChecklist.category_id &&
//       newChecklist.id
//     ) {
//       setUserAccessProjectId(newChecklist.project_id);
//       setUserAccessCategoryId(newChecklist.category_id);
//       setCurrentChecklistId(newChecklist.id);
//       setShowUserSelection(true);
//       setRefreshTrigger((prev) => prev + 1);
//       showToast(
//         "Checklist created! Assign users to this checklist.",
//         "success"
//       );
//     }
//   };
//   const hideUserSelection = () => {
//     setShowUserSelection(false);
//     setUserAccessProjectId(null);
//     setUserAccessCategoryId(null);
//     setCurrentChecklistId(null);
//   };
//   const handleSendUsers = async (selectedUserIds, usersByRole, checklistId) => {
//     showToast(
//       `Successfully assigned ${selectedUserIds.length} users to checklist!`,
//       "success"
//     );
//   };
//   const handleQuickPreview = (checklist) => {
//     setPreviewChecklist(checklist);
//     setShowQuickPreview(true);
//   };

//   const renderPagination = () => {
//     const pageNumbers = [];
//     for (let i = 1; i <= totalPages; i++) {
//       pageNumbers.push(
//         <button
//           key={i}
//           onClick={() => setCurrentPage(i)}
//           className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
//             i === currentPage
//               ? `${palette.primary} transform scale-105`
//               : `bg-slate-200 hover:bg-slate-300 text-slate-700 hover:scale-105`
//           }`}
//         >
//           {i}
//         </button>
//       );
//     }
//     return pageNumbers;
//   };

//   if (!userData)
//     return (
//       <div
//         className="flex items-center justify-center min-h-screen"
//         style={{ background: palette.bg }}
//       >
//         <div className="flex items-center space-x-4">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
//           <span className={`text-lg font-medium ${palette.text}`}>
//             Loading...
//           </span>
//         </div>
//       </div>
//     );

//   if (showForm) {
//     return (
//       <ChecklistForm
//         setShowForm={setShowForm}
//         checklist={selectedChecklist}
//         projectOptions={projects}
//         onChecklistCreated={handleChecklistCreated}
//       />
//     );
//   } else if (detailForm && selectedChecklist) {
//     return (
//       <Checklistdetails
//         setShowForm={setShowForm}
//         setDetailForm={setDetailForm}
//         checklist={selectedChecklist}
//         projectId={selectedProjectId}
//       />
//     );
//   }

//   const handleDeleteClick = (checklist) => {
//     setChecklistToDelete(checklist);
//     setShowDeleteConfirm(true);
//   };
//   const handleDeleteConfirm = async () => {
//     if (!checklistToDelete) return;
//     setIsDeleting(true);
//     try {
//       await deleteChecklistById(checklistToDelete.id);
//       setChecklistData((prev) =>
//         prev.filter((item) => item.id !== checklistToDelete.id)
//       );
//       showToast(
//         `Checklist "${checklistToDelete.name}" deleted successfully!`,
//         "success"
//       );
//       setShowDeleteConfirm(false);
//       setChecklistToDelete(null);
//     } catch (error) {
//       const errorMessage =
//         error.response?.data?.message || "Failed to delete checklist";
//       showToast(errorMessage, "error");
//     } finally {
//       setIsDeleting(false);
//     }
//   };
//   const handleDeleteCancel = () => {
//     setShowDeleteConfirm(false);
//     setChecklistToDelete(null);
//   };

//   // ---- RENDER -----
//   return (
//     <div className="flex min-h-screen" style={{ background: palette.bg }}>
//       <SideBarSetup />
//       <div className="flex-1 p-4 lg:p-8 ml-[250px] lg:ml-[16%]">
//         <div
//           className={`w-full max-w-7xl mx-auto p-4 lg:p-8 rounded-2xl ${palette.card} ${palette.shadow} border ${palette.border}`}
//         >
//           {/* Header */}
//           <div className="mb-8">
//             <div className="flex items-center space-x-4 mb-3">
//               <div className={`p-3 rounded-xl ${palette.primary}`}>
//                 <svg
//                   className="w-7 h-7 text-white"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
//                   />
//                 </svg>
//               </div>
//               <div>
//                 <h1 className={`text-3xl font-bold ${palette.text}`}>
//                   Checklist Management
//                 </h1>
//                 <p className={`${palette.textSecondary} text-lg mt-1`}>
//                   Create, manage, and assign checklists to your team
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Controls */}
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
//             <div className="lg:col-span-2">
//               <label
//                 className={`block text-lg font-semibold mb-3 ${palette.text} flex items-center space-x-3`}
//               >
//                 <svg
//                   className="w-5 h-5"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0V9a1 1 0 011-1h4a1 1 0 011 1v12"
//                   />
//                 </svg>
//                 <span>Select Project</span>
//               </label>
//               <select
//                 className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 ${palette.selectBg} ${palette.selectText} ${palette.border} font-medium`}
//                 value={selectedProjectId}
//                 onChange={(e) => setSelectedProjectId(e.target.value)}
//               >
//                 <option value="">All Projects</option>
//                 {projects.map((proj) => (
//                   <option key={proj.id} value={proj.id}>
//                     {proj.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div className="flex flex-col justify-end">
//               <button
//                 disabled={isButtonDisabled}
//                 className={`px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 
//     ${palette.primary} flex items-center justify-center space-x-3 
//     ${isButtonDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
//                 onClick={() => {
//                   setIsButtonDisabled(true); // Disable after click
//                   setSelectedChecklist(null);
//                   setShowForm(true);
//                   hideUserSelection();
//                 }}
//               >
//                 <svg
//                   className="w-5 h-5"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M12 4v16m8-8H4"
//                   />
//                 </svg>
//                 <span>Create Checklist</span>
//               </button>
//             </div>
//           </div>

//           {/* Hide User Selection Button */}
//           {showUserSelection && (
//             <div className="mb-6">
//               <button
//                 className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 ${palette.secondary}`}
//                 onClick={hideUserSelection}
//               >
//                 Hide User Assignment
//               </button>
//             </div>
//           )}

//           {/* User Selection Table */}
//           {showUserSelection &&
//             userAccessProjectId &&
//             userAccessCategoryId &&
//             currentChecklistId && (
//               <div className="mb-8">
//                 <div className="border-2 border-emerald-500/30 rounded-xl p-6 mb-6 bg-gradient-to-r from-emerald-50 to-green-50">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center space-x-4">
//                       <div className="p-2 bg-emerald-500 rounded-full">
//                         <svg
//                           className="w-6 h-6 text-white"
//                           fill="none"
//                           stroke="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M5 13l4 4L19 7"
//                           />
//                         </svg>
//                       </div>
//                       <div>
//                         <h3 className="text-emerald-800 font-semibold text-lg">
//                           Checklist Created Successfully!
//                         </h3>
//                         <p className="text-emerald-700 text-sm">
//                           Assign team members to this checklist below
//                         </p>
//                       </div>
//                     </div>
//                     <button
//                       onClick={hideUserSelection}
//                       className="text-emerald-600 hover:text-emerald-800 text-2xl font-bold transition-colors duration-200"
//                     >
//                       <svg
//                         className="w-6 h-6"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M6 18L18 6M6 6l12 12"
//                         />
//                       </svg>
//                     </button>
//                   </div>
//                 </div>
//                 <UserSelectionTable
//                   projectId={userAccessProjectId}
//                   categoryId={userAccessCategoryId}
//                   checklistId={currentChecklistId}
//                   refreshTrigger={refreshTrigger}
//                   onSendUsers={handleSendUsers}
//                 />
//               </div>
//             )}

//           {/* Table */}
//           <div
//             className="overflow-hidden rounded-xl border-2 shadow-lg"
//             style={{ borderColor: theme === "dark" ? "#fde047" : "#fdba74" }}
//           >
//             <div className="overflow-x-auto min-w-full">
//               <table className="w-full min-w-[800px]">
//                 <thead
//                   className={`${palette.tableHead} border-b-2 ${palette.border}`}
//                 >
//                   <tr>
//                     <th className="font-bold p-4 text-left text-sm uppercase tracking-wider">
//                       <div className="flex items-center space-x-2">
//                         <svg
//                           className="w-4 h-4"
//                           fill="none"
//                           stroke="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
//                           />
//                         </svg>
//                         <span>ID</span>
//                       </div>
//                     </th>
//                     <th className="font-bold p-4 text-left text-sm uppercase tracking-wider">
//                       <div className="flex items-center space-x-2">
//                         <svg
//                           className="w-4 h-4"
//                           fill="none"
//                           stroke="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
//                           />
//                         </svg>
//                         <span>Checklist Name</span>
//                       </div>
//                     </th>
//                     <th className="font-bold p-4 text-left text-sm uppercase tracking-wider">
//                       <div className="flex items-center space-x-2">
//                         <svg
//                           className="w-4 h-4"
//                           fill="none"
//                           stroke="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                           />
//                         </svg>
//                         <span>Questions</span>
//                       </div>
//                     </th>
//                     <th className="font-bold p-4 text-center text-sm uppercase tracking-wider">
//                       <div className="flex items-center justify-center space-x-2">
//                         <svg
//                           className="w-4 h-4"
//                           fill="none"
//                           stroke="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
//                           />
//                         </svg>
//                         <span>Actions</span>
//                       </div>
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {currentItems.length > 0 ? (
//                     currentItems.map((item) => (
//                       <tr
//                         key={item.id}
//                         className={`${palette.tableRow} border-b ${palette.border} transition-all duration-200`}
//                       >
//                         <td className={`p-4 ${palette.text} font-semibold`}>
//                           <div
//                             className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${palette.badge} ${palette.badgeText} text-xs font-bold`}
//                           >
//                             {item.id}
//                           </div>
//                         </td>
//                         <td className={`p-4 ${palette.text}`}>
//                           <div className="flex flex-col">
//                             <span className="font-semibold text-lg">
//                               {item.name ||
//                                 item.random_num ||
//                                 `Checklist ${item.id}`}
//                             </span>
//                             <span
//                               className={`text-sm ${palette.textSecondary}`}
//                             >
//                               Created • ID: {item.id}
//                             </span>
//                           </div>
//                         </td>
//                         <td className={`p-4`}>
//                           <div
//                             className={`px-3 py-1 rounded-full text-sm font-semibold ${palette.badge} ${palette.badgeText}`}
//                           >
//                             {item.items?.length || 0} Questions
//                           </div>
//                         </td>
//                         <td className="p-4">
//                           <div className="flex items-center justify-center space-x-1 flex-wrap gap-1">
//                             <button
//                               className={`p-3 rounded-lg transition-all duration-200 hover:scale-110 bg-white hover:bg-gray-50 border border-gray-200 group relative`}
//                               onClick={() => handleQuickPreview(item)}
//                               title="Quick Actions"
//                             >
//                               <svg
//                                 className="w-4 h-4 text-black"
//                                 fill="none"
//                                 stroke="currentColor"
//                                 viewBox="0 0 24 24"
//                               >
//                                 <path
//                                   strokeLinecap="round"
//                                   strokeLinejoin="round"
//                                   strokeWidth={2}
//                                   d="M4 6h16M4 12h16M4 18h16"
//                                 />
//                               </svg>
//                               <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
//                                 Quick Actions
//                               </span>
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan={4} className="text-center py-16">
//                         <div className="flex flex-col items-center space-y-4">
//                           <div className="p-6 rounded-full bg-yellow-100">
//                             <svg
//                               className="w-16 h-16 text-yellow-400"
//                               fill="none"
//                               stroke="currentColor"
//                               viewBox="0 0 24 24"
//                             >
//                               <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeWidth={2}
//                                 d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
//                               />
//                             </svg>
//                           </div>
//                           <div className="text-center">
//                             <h3
//                               className={`text-xl font-semibold ${palette.text} mb-2`}
//                             >
//                               No checklists found
//                             </h3>
//                             <p className={`${palette.textSecondary} mb-6`}>
//                               Get started by creating your first checklist
//                             </p>
//                             <button
//                               className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 ${palette.primary}`}
//                               onClick={() => {
//                                 setSelectedChecklist(null);
//                                 setShowForm(true);
//                                 hideUserSelection();
//                               }}
//                             >
//                               <div className="flex items-center space-x-2">
//                                 <svg
//                                   className="w-5 h-5"
//                                   fill="none"
//                                   stroke="currentColor"
//                                   viewBox="0 0 24 24"
//                                 >
//                                   <path
//                                     strokeLinecap="round"
//                                     strokeLinejoin="round"
//                                     strokeWidth={2}
//                                     d="M12 4v16m8-8H4"
//                                   />
//                                 </svg>
//                                 <span>Create First Checklist</span>
//                               </div>
//                             </button>
//                           </div>
//                         </div>
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {/* Pagination */}
//           {totalPages > 1 && (
//             <div className="mt-6 lg:mt-8 flex flex-col lg:flex-row items-center justify-between gap-4">
//               <div
//                 className={`text-sm ${palette.textSecondary} text-center lg:text-left`}
//               >
//                 Showing{" "}
//                 <span className="font-semibold">{indexOfFirstItem + 1}</span> to{" "}
//                 <span className="font-semibold">
//                   {Math.min(indexOfLastItem, filteredChecklistData.length)}
//                 </span>{" "}
//                 of{" "}
//                 <span className="font-semibold">
//                   {filteredChecklistData.length}
//                 </span>{" "}
//                 results
//               </div>
//               <div className="flex items-center space-x-2 flex-wrap justify-center">
//                 <button
//                   onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
//                   disabled={currentPage === 1}
//                   className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
//                     currentPage === 1
//                       ? "opacity-50 cursor-not-allowed bg-slate-200 text-slate-400"
//                       : `${palette.secondary} hover:scale-105`
//                   }`}
//                 >
//                   <svg
//                     className="w-4 h-4"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M15 19l-7-7 7-7"
//                     />
//                   </svg>
//                   <span>Previous</span>
//                 </button>
//                 <div className="flex space-x-1">{renderPagination()}</div>
//                 <button
//                   onClick={() =>
//                     setCurrentPage(Math.min(totalPages, currentPage + 1))
//                   }
//                   disabled={currentPage === totalPages}
//                   className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
//                     currentPage === totalPages
//                       ? "opacity-50 cursor-not-allowed bg-slate-200 text-slate-400"
//                       : `${palette.secondary} hover:scale-105`
//                   }`}
//                 >
//                   <span>Next</span>
//                   <svg
//                     className="w-4 h-4"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M9 5l7 7-7 7"
//                     />
//                   </svg>
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Quick Preview Modal */}
//           {showQuickPreview && previewChecklist && (
//             <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//               <div
//                 className={`${palette.card} rounded-2xl p-8 max-w-2xl w-full mx-4 ${palette.shadow} border-2 ${palette.border}`}
//               >
//                 <div className="flex items-center justify-between mb-6">
//                   <div className="flex items-center space-x-3">
//                     <div className={`p-2 rounded-lg ${palette.info}`}>
//                       <svg
//                         className="w-6 h-6 text-white"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
//                         />
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
//                         />
//                       </svg>
//                     </div>
//                     <h3 className={`text-2xl font-bold ${palette.text}`}>
//                       Quick Preview
//                     </h3>
//                   </div>
//                   <button
//                     onClick={() => setShowQuickPreview(false)}
//                     className={`p-2 rounded-lg ${palette.secondary} transition-colors duration-200`}
//                   >
//                     <svg
//                       className="w-5 h-5"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M6 18L18 6M6 6l12 12"
//                       />
//                     </svg>
//                   </button>
//                 </div>
//                 <div className="space-y-4">
//                   <div>
//                     <h4
//                       className={`text-xl font-semibold ${palette.text} mb-2`}
//                     >
//                       {previewChecklist.name ||
//                         previewChecklist.random_num ||
//                         `Checklist ${previewChecklist.id}`}
//                     </h4>
//                     <div className="flex items-center space-x-4 text-sm">
//                       <span className={`${palette.textSecondary}`}>
//                         ID: {previewChecklist.id}
//                       </span>
//                       <span
//                         className={`px-2 py-1 rounded ${palette.badge} ${palette.badgeText}`}
//                       >
//                         {previewChecklist.items?.length || 0} Questions
//                       </span>
//                     </div>
//                   </div>
//                   <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
//                     <button
//                       onClick={() => {
//                         setShowQuickPreview(false);
//                         setSelectedChecklist(previewChecklist);
//                         setDetailForm(true);
//                       }}
//                       className={`p-4 rounded-lg ${palette.info} text-white transition-all duration-200 hover:scale-105`}
//                     >
//                       <div className="flex flex-col items-center space-y-2">
//                         <svg
//                           className="w-6 h-6"
//                           fill="none"
//                           stroke="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
//                           />
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
//                           />
//                         </svg>
//                         <span className="font-medium">View Details</span>
//                       </div>
//                     </button>
//                     <button
//                       onClick={() => {
//                         setShowQuickPreview(false);
//                         setSelectedChecklist(previewChecklist);
//                         setShowForm(true);
//                       }}
//                       className={`p-4 rounded-lg ${palette.success} text-white transition-all duration-200 hover:scale-105`}
//                     >
//                       <div className="flex flex-col items-center space-y-2">
//                         <svg
//                           className="w-6 h-6"
//                           fill="none"
//                           stroke="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
//                           />
//                         </svg>
//                         <span className="font-medium">Edit Checklist</span>
//                       </div>
//                     </button>
//                     {/* <button
//                       onClick={() => {
//                         setShowQuickPreview(false);
//                         if (
//                           previewChecklist.project_id &&
//                           previewChecklist.category_id
//                         ) {
//                           setUserAccessProjectId(previewChecklist.project_id);
//                           setUserAccessCategoryId(previewChecklist.category_id);
//                           setCurrentChecklistId(previewChecklist.id);
//                           setShowUserSelection(true);
//                           setRefreshTrigger((prev) => prev + 1);
//                         }
//                       }}
//                       className={`p-4 rounded-lg ${palette.warning} text-white transition-all duration-200 hover:scale-105`}
//                     >
//                       <div className="flex flex-col items-center space-y-2">
//                         <svg
//                           className="w-6 h-6"
//                           fill="none"
//                           stroke="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
//                           />
//                         </svg>
//                         <span className="font-medium">Assign Users</span>
//                       </div>
//                     </button> */}
//                     <button
//                       onClick={() => {
//                         setShowQuickPreview(false);
//                         handleDeleteClick(previewChecklist);
//                       }}
//                       className={`p-4 rounded-lg ${palette.danger} text-white transition-all duration-200 hover:scale-105`}
//                     >
//                       <div className="flex flex-col items-center space-y-2">
//                         <svg
//                           className="w-6 h-6"
//                           fill="none"
//                           stroke="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
//                           />
//                         </svg>
//                         <span className="font-medium">Delete</span>
//                       </div>
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Delete Modal */}
//           {showDeleteConfirm && (
//             <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//               <div
//                 className={`${palette.card} rounded-2xl p-8 max-w-md w-full mx-4 ${palette.shadow} border-2 ${palette.border}`}
//               >
//                 <div className="text-center">
//                   <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-yellow-100 to-yellow-200 mb-6">
//                     <svg
//                       className="h-8 w-8 text-yellow-600"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
//                       />
//                     </svg>
//                   </div>
//                   <h3 className={`text-2xl font-bold ${palette.text} mb-3`}>
//                     Confirm Deletion
//                   </h3>
//                   <p className={`text-lg ${palette.textSecondary} mb-4`}>
//                     Are you sure you want to permanently delete this checklist?
//                   </p>
//                   {checklistToDelete && (
//                     <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-xl p-4 mb-6">
//                       <div className="flex items-center space-x-3">
//                         <div className="p-2 bg-yellow-500 rounded-full">
//                           <svg
//                             className="w-4 h-4 text-white"
//                             fill="none"
//                             stroke="currentColor"
//                             viewBox="0 0 24 24"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
//                             />
//                           </svg>
//                         </div>
//                         <div className="text-left">
//                           <p className="text-yellow-800 font-bold text-lg">
//                             "
//                             {checklistToDelete.name ||
//                               `Checklist ${checklistToDelete.id}`}
//                             "
//                           </p>
//                           <p className="text-yellow-600 text-sm">
//                             {checklistToDelete.items?.length || 0} questions
//                             will be permanently removed
//                           </p>
//                         </div>
//                       </div>
//                       <div className="mt-3 p-3 bg-yellow-200/50 rounded-lg">
//                         <p className="text-yellow-700 text-sm font-medium">
//                           This action cannot be undone. All questions and data
//                           will be permanently removed.
//                         </p>
//                       </div>
//                     </div>
//                   )}
//                   <div className="flex gap-4 justify-center">
//                     <button
//                       onClick={handleDeleteCancel}
//                       disabled={isDeleting}
//                       className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 ${palette.secondary} disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2`}
//                     >
//                       <svg
//                         className="w-4 h-4"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M6 18L18 6M6 6l12 12"
//                         />
//                       </svg>
//                       <span>Cancel</span>
//                     </button>
//                     <button
//                       onClick={handleDeleteConfirm}
//                       disabled={isDeleting}
//                       className={`px-6 py-3 rounded-xl font-semibold ${palette.danger} transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2`}
//                     >
//                       {isDeleting ? (
//                         <>
//                           <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                           <span>Deleting...</span>
//                         </>
//                       ) : (
//                         <>
//                           <svg
//                             className="w-4 h-4"
//                             fill="none"
//                             stroke="currentColor"
//                             viewBox="0 0 24 24"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
//                             />
//                           </svg>
//                           <span>Confirm Delete</span>
//                         </>
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Checklist;

// import { useState, useEffect } from "react";
// import ChecklistForm from "./ChecklistForm";
// import Checklistdetails from "./ChecklistDetails";
// import UserSelectionTable from "../../components/UserSelectionTable";
// import {
//   getProjectsByOwnership,
//   getProjectUserDetails,
//   Allprojects,
//   getMyChecklists,
//   deleteChecklistById,
// } from "../../api";
// import { showToast } from "../../utils/toast";
// import { useTheme } from "../../ThemeContext";
// import { useSidebar } from "../../components/SidebarContext";

// // Palette setup
// const ORANGE = "#ffbe63";
// const BG_OFFWHITE = "#fcfaf7";
// const SIDEBAR_WIDTH = 0;

// const getPalette = (theme) => ({
//   bg: theme === "dark" ? "#191922" : BG_OFFWHITE,
//   card: theme === "dark" ? "#23232c" : "#fff",
//   border: ORANGE,
//   text: theme === "dark" ? "#fff" : "#222",
//   textSecondary: theme === "dark" ? "#ffbe63b3" : "#b54b13b3",
//   badge: ORANGE,
//   badgeText: theme === "dark" ? "#23232c" : "#fff",
//   shadow:
//     theme === "dark"
//       ? "0 4px 24px 0 rgba(255, 190, 99, 0.18)"
//       : "0 4px 24px 0 rgba(255,190,99,0.12)",
//   primaryBtn: {
//     background: ORANGE,
//     color: "#23232c",
//     border: `2px solid ${ORANGE}`,
//     fontWeight: 600,
//   },
//   secondaryBtn: {
//     background: "#fff",
//     color: "#b54b13",
//     border: `2px solid ${ORANGE}`,
//     fontWeight: 600,
//   },
//   dangerBtn: {
//     background: "#ef4444",
//     color: "#fff",
//     border: `2px solid #ef4444`,
//     fontWeight: 600,
//   },
//   successBtn: {
//     background: "#10b981",
//     color: "#fff",
//     border: `2px solid #10b981`,
//     fontWeight: 600,
//   },
//   infoBtn: {
//     background: "#2563eb",
//     color: "#fff",
//     border: `2px solid #2563eb`,
//     fontWeight: 600,
//   },
//   tableHeadBg: theme === "dark" ? "#191919" : "#fff7ea",
//   tableHeadText: theme === "dark" ? "#ffbe63" : "#b54b13",
//   tableRowBg: theme === "dark" ? "#23232c" : "#fff",
//   icon: ORANGE,
//   tableNoDataBg: theme === "dark" ? "#23232c" : "#fff7ea",
// });

// const Checklist = () => {
//   const { theme } = useTheme();
//   const palette = getPalette(theme);
//   const { sidebarOpen } = useSidebar();

//   // State
//   const [userData, setUserData] = useState(null);
//   const [projects, setProjects] = useState([]);
//   const [selectedProjectId, setSelectedProjectId] = useState("");
//   const [checklistData, setChecklistData] = useState([]);
//   const [showForm, setShowForm] = useState(false);
//   const [detailForm, setDetailForm] = useState(false);
//   const [selectedChecklist, setSelectedChecklist] = useState(null);

//   const [showUserSelection, setShowUserSelection] = useState(false);
//   const [userAccessProjectId, setUserAccessProjectId] = useState(null);
//   const [userAccessCategoryId, setUserAccessCategoryId] = useState(null);
//   const [currentChecklistId, setCurrentChecklistId] = useState(null);
//   const [refreshTrigger, setRefreshTrigger] = useState(0);
//   const [isButtonDisabled, setIsButtonDisabled] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");

//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
//   const [checklistToDelete, setChecklistToDelete] = useState(null);
//   const [isDeleting, setIsDeleting] = useState(false);

//   // Quick preview state
//   const [showQuickPreview, setShowQuickPreview] = useState(false);
//   const [previewChecklist, setPreviewChecklist] = useState(null);

//   // Pagination
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;

//   // Sidebar movement
//   const contentMarginLeft = sidebarOpen ? SIDEBAR_WIDTH : 0;

//   const filteredChecklistData = selectedProjectId
//     ? checklistData.filter(
//         (item) => String(item.project_id) === String(selectedProjectId)
//       )
//     : checklistData;

//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = filteredChecklistData.slice(
//     indexOfFirstItem,
//     indexOfLastItem
//   );
//   const totalPages = Math.ceil(filteredChecklistData.length / itemsPerPage);

//   // Fetch user and project
//   useEffect(() => {
//     const role = localStorage.getItem("ROLE");
//     const userString = localStorage.getItem("USER_DATA");
//     const userData =
//       userString && userString !== "undefined" ? JSON.parse(userString) : null;
//     setUserData(userData);

//     if (!userData) {
//       setProjects([]);
//       return;
//     }

//     const fetchProjects = async () => {
//       try {
//         let response = null;
//         if (role === "Super Admin") {
//           response = await Allprojects();
//         } else if (role === "Admin") {
//           response = await getProjectUserDetails();
//         } else {
//           const entity_id = userData.entity_id || null;
//           const company_id = userData.company_id || null;
//           const organization_id =
//             userData.org || userData.organization_id || null;
//           if (!entity_id && !company_id && !organization_id) {
//             setProjects([]);
//             return;
//           }
//           response = await getProjectsByOwnership({
//             entity_id,
//             company_id,
//             organization_id,
//           });
//         }
//         if (response && response.status === 200) {
//           setProjects(response.data || []);
//         } else {
//           setProjects([]);
//           showToast("Failed to fetch projects.", "error");
//         }
//       } catch (err) {
//         setProjects([]);
//         showToast("Failed to fetch projects.", "error");
//       }
//     };
//     fetchProjects();
//   }, []);

//   useEffect(() => {
//     if (!selectedProjectId) {
//       const fetchMyChecklists = async () => {
//         try {
//           const response = await getMyChecklists();
//           if (response.status === 200) {
//             setChecklistData(response.data || []);
//           } else {
//             setChecklistData([]);
//             showToast("Failed to fetch your checklists.", "error");
//           }
//         } catch (err) {
//           setChecklistData([]);
//           showToast("Failed to fetch your checklists.", "error");
//         }
//       };
//       fetchMyChecklists();
//     }
//   }, [selectedProjectId]);

//   const handleChecklistCreated = (newChecklist) => {
//     if (
//       newChecklist.project_id &&
//       newChecklist.category_id &&
//       newChecklist.id
//     ) {
//       setUserAccessProjectId(newChecklist.project_id);
//       setUserAccessCategoryId(newChecklist.category_id);
//       setCurrentChecklistId(newChecklist.id);
//       setShowUserSelection(true);
//       setRefreshTrigger((prev) => prev + 1);
//       showToast(
//         "Checklist created! Assign users to this checklist.",
//         "success"
//       );
//     }
//     setShowForm(false);
//     setIsButtonDisabled(false);
//   };

//   const hideUserSelection = () => {
//     setShowUserSelection(false);
//     setUserAccessProjectId(null);
//     setUserAccessCategoryId(null);
//     setCurrentChecklistId(null);
//   };

//   const handleQuickPreview = (checklist) => {
//     setPreviewChecklist(checklist);
//     setShowQuickPreview(true);
//   };

//   const handleDeleteClick = (checklist) => {
//     setChecklistToDelete(checklist);
//     setShowDeleteConfirm(true);
//   };
//   const handleDeleteConfirm = async () => {
//     if (!checklistToDelete) return;
//     setIsDeleting(true);
//     try {
//       await deleteChecklistById(checklistToDelete.id);
//       setChecklistData((prev) =>
//         prev.filter((item) => item.id !== checklistToDelete.id)
//       );
//       showToast(
//         `Checklist "${checklistToDelete.name}" deleted successfully!`,
//         "success"
//       );
//       setShowDeleteConfirm(false);
//       setChecklistToDelete(null);
//     } catch (error) {
//       const errorMessage =
//         error.response?.data?.message || "Failed to delete checklist";
//       showToast(errorMessage, "error");
//     } finally {
//       setIsDeleting(false);
//     }
//   };
//   const handleDeleteCancel = () => {
//     setShowDeleteConfirm(false);
//     setChecklistToDelete(null);
//   };

//   // Pagination (palette only)
//   const renderPagination = () => {
//     if (totalPages <= 1) return null;
//     const arr = [];
//     const DOTS = (
//       <span style={{ color: palette.border, fontWeight: 700 }}>…</span>
//     );
//     for (let i = 1; i <= totalPages; i++) {
//       if (
//         i === 1 ||
//         i === totalPages ||
//         (i >= currentPage - 1 && i <= currentPage + 1)
//       ) {
//         arr.push(
//           <button
//             key={i}
//             onClick={() => setCurrentPage(i)}
//             style={{
//               padding: "0.45rem 1rem",
//               margin: "0 0.22rem",
//               borderRadius: 10,
//               background: i === currentPage ? palette.badge : "transparent",
//               color: i === currentPage ? palette.badgeText : palette.text,
//               border:
//                 i === currentPage ? `2px solid ${palette.border}` : "none",
//               fontWeight: i === currentPage ? 700 : 500,
//               fontSize: 15,
//               boxShadow: i === currentPage ? palette.shadow : "none",
//               cursor: i === currentPage ? "default" : "pointer",
//               transition: "background .18s,border .18s",
//             }}
//             disabled={i === currentPage}
//           >
//             {i}
//           </button>
//         );
//       } else if (
//         (i === 2 && currentPage > 3) ||
//         (i === totalPages - 1 && currentPage < totalPages - 2)
//       ) {
//         arr.push(<span key={i}>{DOTS}</span>);
//       }
//     }
//     return arr;
//   };

//   if (!userData)
//     return (
//       <div
//         className="flex items-center justify-center min-h-screen"
//         style={{ background: palette.bg }}
//       >
//         <div className="flex items-center space-x-4">
//           <div
//             className="animate-spin rounded-full h-8 w-8"
//             style={{ borderBottom: `2px solid ${palette.border}` }}
//           ></div>
//           <span className="text-lg font-medium" style={{ color: palette.text }}>
//             Loading...
//           </span>
//         </div>
//       </div>
//     );

//   if (showForm) {
//     return (
//       <ChecklistForm
//         setShowForm={setShowForm}
//         checklist={selectedChecklist}
//         projectOptions={projects}
//         onChecklistCreated={handleChecklistCreated}
//       />
//     );
//   } else if (detailForm && selectedChecklist) {
//     return (
//       <Checklistdetails
//         setShowForm={setShowForm}
//         setDetailForm={setDetailForm}
//         checklist={selectedChecklist}
//         projectId={selectedProjectId}
//       />
//     );
//   }

//   return (
//     <div
//       style={{
//         background: palette.bg,
//         minHeight: "100vh",
//         marginLeft: contentMarginLeft,
//         transition: "margin-left 0.35s cubic-bezier(.6,-0.17,.22,1.08)",
//         padding: 16,
//       }}
//     >
//       <div
//         className="max-w-7xl mx-auto p-4 lg:p-8 rounded-2xl"
//         style={{
//           background: palette.card,
//           border: `2px solid ${palette.border}`,
//           boxShadow: palette.shadow,
//         }}
//       >
//         {/* Header */}
//         <div className="mb-8 flex items-center">
//           <div
//             className="p-3 rounded-xl flex items-center justify-center"
//             style={{ background: palette.badge, color: palette.badgeText }}
//           >
//             <svg
//               width="28"
//               height="28"
//               fill="none"
//               stroke={palette.icon}
//               strokeWidth="2.2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               viewBox="0 0 24 24"
//             >
//               <rect width="24" height="24" rx="6" fill={palette.badge}></rect>
//               <path d="M9 5H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2 2h2a2 2 0 0 1 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
//             </svg>
//           </div>
//           <div className="ml-4">
//             <h1 className="text-3xl font-bold" style={{ color: palette.text }}>
//               Checklist Management
//             </h1>
//             <p
//               className="text-lg mt-1"
//               style={{ color: palette.textSecondary }}
//             >
//               Create, manage, and assign checklists to your team
//             </p>
//           </div>
//         </div>

//         {/* Controls */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
//           <div className="lg:col-span-2">
//             <label
//               className="block text-lg font-semibold mb-3 flex items-center"
//               style={{ color: palette.text }}
//             >
//               <svg
//                 width="20"
//                 height="20"
//                 fill="none"
//                 stroke={palette.icon}
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 viewBox="0 0 24 24"
//               >
//                 <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0V9a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v12" />
//               </svg>
//               <span className="ml-2">Select Project</span>
//             </label>
//             <select
//               className="w-full p-4 rounded-xl font-medium"
//               style={{
//                 background: palette.card,
//                 color: palette.text,
//                 border: `2px solid ${palette.border}`,
//                 fontWeight: 500,
//               }}
//               value={selectedProjectId}
//               onChange={(e) => setSelectedProjectId(e.target.value)}
//             >
//               <option value="">All Projects</option>
//               {projects.map((proj) => (
//                 <option key={proj.id} value={proj.id}>
//                   {proj.name}
//                 </option>
//               ))}
//             </select>
//           </div>
//           {/* Search Bar above Create Checklist Button */}
//           <div className="mb-4 flex justify-end">
//             <div
//               className="flex items-center rounded-xl px-3"
//               style={{
//                 background: palette.card,
//                 border: `2px solid ${palette.border}`,
//                 boxShadow: "0 1px 4px rgba(60,60,60,0.08)",
//                 width: 280,
//                 maxWidth: "100%",
//               }}
//             >
//               <svg
//                 width="19"
//                 height="19"
//                 fill="none"
//                 stroke={palette.icon}
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 style={{ marginRight: 8 }}
//                 viewBox="0 0 24 24"
//               >
//                 <circle cx="11" cy="11" r="8" />
//                 <line x1="21" y1="21" x2="16.65" y2="16.65" />
//               </svg>
//               <input
//                 type="text"
//                 className="flex-1 py-2 px-1 bg-transparent outline-none text-base"
//                 style={{
//                   color: palette.text,
//                   background: "none",
//                   border: "none",
//                 }}
//                 placeholder="Search checklists…"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 // onKeyDown={e => e.key === "Enter" && onSearch?.(searchQuery)}
//               />
//             </div>
//           </div>

//           <div className="flex flex-col justify-end">
//             <button
//               disabled={isButtonDisabled}
//               className="px-6 py-4 rounded-xl font-semibold text-lg flex items-center justify-center"
//               style={{
//                 ...palette.primaryBtn,
//                 opacity: isButtonDisabled ? 0.5 : 1,
//                 cursor: isButtonDisabled ? "not-allowed" : "pointer",
//                 transition: "all .18s",
//               }}
//               onClick={() => {
//                 setIsButtonDisabled(true);
//                 setSelectedChecklist(null);
//                 setShowForm(true);
//                 hideUserSelection();
//               }}
//             >
//               <svg
//                 width="22"
//                 height="22"
//                 fill="none"
//                 stroke="#23232c"
//                 strokeWidth="2.2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 viewBox="0 0 24 24"
//                 className="mr-2"
//               >
//                 <path d="M12 4v16m8-8H4" />
//               </svg>
//               <span>Create Checklist</span>
//             </button>
//           </div>
//         </div>

//         {/* Show UserSelectionTable after create */}
//         {showUserSelection &&
//           userAccessProjectId &&
//           userAccessCategoryId &&
//           currentChecklistId && (
//             <div className="mb-8">
//               <div
//                 style={{
//                   border: "2px solid #10b981",
//                   borderRadius: 16,
//                   background: "#e7fbe7",
//                   marginBottom: 16,
//                   padding: 18,
//                   fontWeight: 600,
//                   color: "#065f46",
//                 }}
//               >
//                 Checklist created! Assign users to this checklist below.
//                 <button
//                   onClick={hideUserSelection}
//                   style={{
//                     float: "right",
//                     background: palette.dangerBtn.background,
//                     color: palette.dangerBtn.color,
//                     border: palette.dangerBtn.border,
//                     borderRadius: 8,
//                     padding: "4px 14px",
//                     marginLeft: 16,
//                     fontWeight: 600,
//                     cursor: "pointer",
//                   }}
//                 >
//                   Close
//                 </button>
//               </div>
//               <UserSelectionTable
//                 projectId={userAccessProjectId}
//                 categoryId={userAccessCategoryId}
//                 checklistId={currentChecklistId}
//                 refreshTrigger={refreshTrigger}
//                 onSendUsers={() => showToast("Users assigned!", "success")}
//               />
//             </div>
//           )}

//         {/* Table */}
//         <div
//           className="overflow-hidden rounded-xl border-2"
//           style={{
//             borderColor: palette.border,
//             boxShadow: palette.shadow,
//             background: palette.card,
//             marginBottom: 16,
//           }}
//         >
//           <div className="overflow-x-auto min-w-full">
//             <table className="w-full min-w-[800px]">
//               <thead
//                 style={{
//                   background: palette.tableHeadBg,
//                   color: palette.tableHeadText,
//                   borderBottom: `2px solid ${palette.border}`,
//                 }}
//               >
//                 <tr>
//                   <th className="font-bold p-4 text-left text-sm uppercase tracking-wider">
//                     ID
//                   </th>
//                   <th className="font-bold p-4 text-left text-sm uppercase tracking-wider">
//                     Checklist Name
//                   </th>
//                   <th className="font-bold p-4 text-left text-sm uppercase tracking-wider">
//                     Questions
//                   </th>
//                   <th className="font-bold p-4 text-center text-sm uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {currentItems.length > 0 ? (
//                   currentItems.map((item) => (
//                     <tr
//                       key={item.id}
//                       style={{
//                         background: palette.tableRowBg,
//                         color: palette.text,
//                         borderBottom: `1px solid ${palette.border}`,
//                         transition: "background .12s",
//                       }}
//                     >
//                       <td className="p-4 font-semibold">
//                         <div
//                           style={{
//                             background: palette.badge,
//                             color: palette.badgeText,
//                             borderRadius: 8,
//                             width: 32,
//                             height: 32,
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                             fontWeight: 700,
//                           }}
//                         >
//                           {item.id}
//                         </div>
//                       </td>
//                       <td className="p-4">
//                         <div className="flex flex-col">
//                           <span className="font-semibold text-lg">
//                             {item.name || `Checklist ${item.id}`}
//                           </span>
//                           <span
//                             style={{
//                               color: palette.textSecondary,
//                               fontSize: 14,
//                             }}
//                           >
//                             Created • ID: {item.id}
//                           </span>
//                         </div>
//                       </td>
//                       <td className="p-4">
//                         <div
//                           style={{
//                             background: palette.badge,
//                             color: palette.badgeText,
//                             borderRadius: 12,
//                             padding: "2px 16px",
//                             fontWeight: 600,
//                             fontSize: 14,
//                             display: "inline-block",
//                           }}
//                         >
//                           {item.items?.length || 0} Questions
//                         </div>
//                       </td>
//                       <td className="p-4 text-center">
//                         {/* <button
//                           style={{
//                             background: "#fff",
//                             color: "#23232c",
//                             border: `2px solid ${palette.border}`,
//                             borderRadius: 8,
//                             padding: "8px 16px",
//                             fontWeight: 600,
//                             cursor: "pointer",
//                             marginRight: 8,
//                           }}
//                           onClick={() => {
//                             setSelectedChecklist(item);
//                             setDetailForm(true);
//                           }}
//                         >
//                           View
//                         </button> */}
//                         {/* <button
//                           style={{
//                             background: palette.infoBtn.background,
//                             color: palette.infoBtn.color,
//                             border: palette.infoBtn.border,
//                             borderRadius: 8,
//                             padding: "8px 16px",
//                             fontWeight: 600,
//                             cursor: "pointer",
//                             marginRight: 8,
//                           }}
//                           onClick={() => handleQuickPreview(item)}
//                         >
//                           Quick Preview
//                         </button> */}
//                         <button
//                           style={{
//                             color: "#222",
//                             border: "#222",
//                             borderRadius: 8,
//                             padding: "8px 16px",
//                             fontWeight: 600,
//                             cursor: "pointer",
//                             marginRight: 8,
//                             // display: "flex",
//                             // alignItems: "center",
//                             // gap: 8,
//                           }}
//                           onClick={() => handleQuickPreview(item)}
//                         >
//                           <svg
//                             width="18"
//                             height="18"
//                             fill="none"
//                             stroke="currentColor"
//                             strokeWidth="2"
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             style={{ marginRight: 6 }}
//                             viewBox="0 0 24 24"
//                           >
//                             <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
//                             <circle cx="12" cy="12" r="3" />
//                           </svg>
//                         </button>

//                         {/* <button
//                           style={{
//                             background: palette.dangerBtn.background,
//                             color: palette.dangerBtn.color,
//                             border: palette.dangerBtn.border,
//                             borderRadius: 8,
//                             padding: "8px 16px",
//                             fontWeight: 600,
//                             cursor: "pointer",
//                           }}
//                           onClick={() => handleDeleteClick(item)}
//                         >
//                           Delete
//                         </button> */}
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td
//                       colSpan={4}
//                       className="text-center py-16"
//                       style={{
//                         color: palette.text,
//                         background: palette.tableNoDataBg,
//                       }}
//                     >
//                       No checklists found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Pagination */}
//         <div className="mt-8 flex justify-center">{renderPagination()}</div>
//       </div>

//       {/* Quick Preview Modal */}
//       {showQuickPreview && previewChecklist && (
//         <div
//           style={{
//             position: "fixed",
//             inset: 0,
//             zIndex: 50,
//             background: "rgba(0,0,0,0.45)",
//             backdropFilter: "blur(3px)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             padding: 16,
//           }}
//         >
//           <div
//             style={{
//               background: palette.card,
//               borderRadius: 18,
//               padding: 32,
//               maxWidth: 520,
//               width: "100%",
//               boxShadow: palette.shadow,
//               border: `2px solid ${palette.border}`,
//             }}
//           >
//             <div
//               style={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//                 marginBottom: 18,
//               }}
//             >
//               <div style={{ display: "flex", alignItems: "center" }}>
//                 <div
//                   style={{
//                     background: palette.infoBtn.background,
//                     color: palette.infoBtn.color,
//                     borderRadius: 12,
//                     padding: 8,
//                     marginRight: 8,
//                   }}
//                 >
//                   <svg
//                     width={26}
//                     height={26}
//                     fill="none"
//                     stroke="#fff"
//                     strokeWidth="2.1"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     viewBox="0 0 24 24"
//                   >
//                     <circle cx={12} cy={12} r={10} />
//                     <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                   </svg>
//                 </div>
//                 <h3
//                   style={{ fontSize: 22, fontWeight: 700, color: palette.text }}
//                 >
//                   Quick Preview
//                 </h3>
//               </div>
//               <button
//                 onClick={() => setShowQuickPreview(false)}
//                 style={{
//                   background: palette.dangerBtn.background,
//                   color: palette.dangerBtn.color,
//                   border: palette.dangerBtn.border,
//                   borderRadius: 8,
//                   padding: 6,
//                   fontWeight: 700,
//                   fontSize: 17,
//                   cursor: "pointer",
//                 }}
//               >
//                 X
//               </button>
//             </div>
//             <div>
//               <div
//                 style={{
//                   fontWeight: 700,
//                   fontSize: 18,
//                   color: palette.text,
//                   marginBottom: 8,
//                 }}
//               >
//                 {previewChecklist.name || `Checklist ${previewChecklist.id}`}
//               </div>
//               <div
//                 style={{
//                   color: palette.textSecondary,
//                   fontSize: 15,
//                   marginBottom: 18,
//                 }}
//               >
//                 ID: {previewChecklist.id} •{" "}
//                 {previewChecklist.items?.length || 0} Questions
//               </div>
//               <button
//                 onClick={() => {
//                   setShowQuickPreview(false);
//                   setSelectedChecklist(previewChecklist);
//                   setDetailForm(true);
//                 }}
//                 style={{
//                   ...palette.infoBtn,
//                   borderRadius: 10,
//                   padding: "12px 28px",
//                   marginRight: 12,
//                   fontWeight: 700,
//                   cursor: "pointer",
//                 }}
//               >
//                 View Details
//               </button>
//               <button
//                 onClick={() => {
//                   setShowQuickPreview(false);
//                   setSelectedChecklist(previewChecklist);
//                   setShowForm(true);
//                 }}
//                 style={{
//                   ...palette.successBtn,
//                   borderRadius: 10,
//                   padding: "12px 28px",
//                   marginRight: 12,
//                   fontWeight: 700,
//                   cursor: "pointer",
//                 }}
//               >
//                 Edit Checklist
//               </button>
//               <button
//                 onClick={() => {
//                   setShowQuickPreview(false);
//                   handleDeleteClick(previewChecklist);
//                 }}
//                 style={{
//                   ...palette.dangerBtn,
//                   borderRadius: 10,
//                   padding: "12px 28px",
//                   fontWeight: 700,
//                   cursor: "pointer",
//                 }}
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Modal */}
//       {showDeleteConfirm && (
//         <div
//           style={{
//             position: "fixed",
//             inset: 0,
//             zIndex: 50,
//             background: "rgba(0,0,0,0.45)",
//             backdropFilter: "blur(3px)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             padding: 16,
//           }}
//         >
//           <div
//             style={{
//               background: palette.card,
//               borderRadius: 18,
//               padding: 32,
//               maxWidth: 420,
//               width: "100%",
//               boxShadow: palette.shadow,
//               border: `2px solid ${palette.border}`,
//             }}
//           >
//             <div style={{ textAlign: "center", marginBottom: 22 }}>
//               <div
//                 style={{
//                   background: "#fffbe8",
//                   borderRadius: "50%",
//                   width: 66,
//                   height: 66,
//                   margin: "0 auto 18px auto",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                 }}
//               >
//                 <svg
//                   width={34}
//                   height={34}
//                   fill="none"
//                   stroke="#b54b13"
//                   strokeWidth={2.2}
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   viewBox="0 0 24 24"
//                 >
//                   <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
//                 </svg>
//               </div>
//               <h3
//                 style={{
//                   fontSize: 22,
//                   fontWeight: 800,
//                   color: palette.text,
//                   marginBottom: 10,
//                 }}
//               >
//                 Confirm Deletion
//               </h3>
//               <div
//                 style={{
//                   color: palette.textSecondary,
//                   fontSize: 16,
//                   marginBottom: 18,
//                 }}
//               >
//                 Are you sure you want to permanently delete this checklist?
//               </div>
//               {checklistToDelete && (
//                 <div
//                   style={{
//                     background: "#fffbe8",
//                     border: "2px solid #ffe49b",
//                     borderRadius: 12,
//                     padding: 12,
//                     marginBottom: 18,
//                   }}
//                 >
//                   <div
//                     style={{ color: "#b54b13", fontWeight: 700, fontSize: 17 }}
//                   >
//                     "
//                     {checklistToDelete.name ||
//                       `Checklist ${checklistToDelete.id}`}
//                     "
//                   </div>
//                   <div style={{ color: "#b54b13bb", fontSize: 13 }}>
//                     {checklistToDelete.items?.length || 0} questions will be
//                     permanently removed.
//                   </div>
//                 </div>
//               )}
//               <div
//                 style={{ display: "flex", justifyContent: "center", gap: 18 }}
//               >
//                 <button
//                   onClick={handleDeleteCancel}
//                   disabled={isDeleting}
//                   style={{
//                     ...palette.secondaryBtn,
//                     borderRadius: 9,
//                     padding: "10px 30px",
//                     fontWeight: 700,
//                     fontSize: 16,
//                     cursor: isDeleting ? "not-allowed" : "pointer",
//                   }}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleDeleteConfirm}
//                   disabled={isDeleting}
//                   style={{
//                     ...palette.dangerBtn,
//                     borderRadius: 9,
//                     padding: "10px 30px",
//                     fontWeight: 700,
//                     fontSize: 16,
//                     cursor: isDeleting ? "not-allowed" : "pointer",
//                   }}
//                 >
//                   {isDeleting ? "Deleting..." : "Confirm Delete"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Checklist;




// import { useState, useEffect } from "react";
// import ChecklistForm from "./ChecklistForm";
// import Checklistdetails from "./ChecklistDetails";
// import UserSelectionTable from "../../components/UserSelectionTable";
// import {
//   getProjectsByOwnership,
//   getProjectUserDetails,
//   Allprojects,
//   getMyChecklists,
//   deleteChecklistById,
// } from "../../api";
// import { showToast } from "../../utils/toast";
// import { useTheme } from "../../ThemeContext";
// import { useSidebar } from "../../components/SidebarContext";

// // Palette setup
// const ORANGE = "#ffbe63";
// const BG_OFFWHITE = "#fcfaf7";
// const SIDEBAR_WIDTH = 0;

// const getPalette = (theme) => ({
//   bg: theme === "dark" ? "#191922" : BG_OFFWHITE,
//   card: theme === "dark" ? "#23232c" : "#fff",
//   border: ORANGE,
//   text: theme === "dark" ? "#fff" : "#222",
//   textSecondary: theme === "dark" ? "#ffbe63b3" : "#b54b13b3",
//   badge: ORANGE,
//   badgeText: theme === "dark" ? "#23232c" : "#fff",
//   shadow:
//     theme === "dark"
//       ? "0 4px 24px 0 rgba(255, 190, 99, 0.18)"
//       : "0 4px 24px 0 rgba(255,190,99,0.12)",
//   primaryBtn: {
//     background: ORANGE,
//     color: "#23232c",
//     border: `2px solid ${ORANGE}`,
//     fontWeight: 600,
//   },
//   secondaryBtn: {
//     background: "#fff",
//     color: "#b54b13",
//     border: `2px solid ${ORANGE}`,
//     fontWeight: 600,
//   },
//   dangerBtn: {
//     background: "#ef4444",
//     color: "#fff",
//     border: `2px solid #ef4444`,
//     fontWeight: 600,
//   },
//   successBtn: {
//     background: "#10b981",
//     color: "#fff",
//     border: `2px solid #10b981`,
//     fontWeight: 600,
//   },
//   infoBtn: {
//     background: "#2563eb",
//     color: "#fff",
//     border: `2px solid #2563eb`,
//     fontWeight: 600,
//   },
//   tableHeadBg: theme === "dark" ? "#191919" : "#fff7ea",
//   tableHeadText: theme === "dark" ? "#ffbe63" : "#b54b13",
//   tableRowBg: theme === "dark" ? "#23232c" : "#fff",
//   icon: ORANGE,
//   tableNoDataBg: theme === "dark" ? "#23232c" : "#fff7ea",
// });

// const Checklist = () => {
//   const { theme } = useTheme();
//   const palette = getPalette(theme);
//   const { sidebarOpen } = useSidebar();

//   // State
//   const [userData, setUserData] = useState(null);
//   const [projects, setProjects] = useState([]);
//   const [selectedProjectId, setSelectedProjectId] = useState("");
//   const [checklistData, setChecklistData] = useState([]);
//   const [showForm, setShowForm] = useState(false);
//   const [detailForm, setDetailForm] = useState(false);
//   const [selectedChecklist, setSelectedChecklist] = useState(null);

//   const [showUserSelection, setShowUserSelection] = useState(false);
//   const [userAccessProjectId, setUserAccessProjectId] = useState(null);
//   const [userAccessCategoryId, setUserAccessCategoryId] = useState(null);
//   const [currentChecklistId, setCurrentChecklistId] = useState(null);
//   const [refreshTrigger, setRefreshTrigger] = useState(0);
//   const [isButtonDisabled, setIsButtonDisabled] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");

//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
//   const [checklistToDelete, setChecklistToDelete] = useState(null);
//   const [isDeleting, setIsDeleting] = useState(false);

//   // Quick preview state
//   const [showQuickPreview, setShowQuickPreview] = useState(false);
//   const [previewChecklist, setPreviewChecklist] = useState(null);

//   // Pagination
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;

//   // Sidebar movement
//   const contentMarginLeft = sidebarOpen ? SIDEBAR_WIDTH : 0;

//   // Filtering by project
//   const byProject = selectedProjectId
//     ? checklistData.filter(
//         (item) => String(item.project_id) === String(selectedProjectId)
//       )
//     : checklistData;

//   // Filtering by search query (name or ID)
//   const filteredChecklistData = searchQuery.trim()
//     ? byProject.filter((item) => {
//         const q = searchQuery.trim().toLowerCase();
//         return (
//           (item.name && item.name.toLowerCase().includes(q)) ||
//           String(item.id).includes(q)
//         );
//       })
//     : byProject;

//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = filteredChecklistData.slice(
//     indexOfFirstItem,
//     indexOfLastItem
//   );
//   const totalPages = Math.ceil(filteredChecklistData.length / itemsPerPage);

//   // Fetch user and project
//   useEffect(() => {
//     const role = localStorage.getItem("ROLE");
//     const userString = localStorage.getItem("USER_DATA");
//     const userData =
//       userString && userString !== "undefined" ? JSON.parse(userString) : null;
//     setUserData(userData);

//     if (!userData) {
//       setProjects([]);
//       return;
//     }

//     const fetchProjects = async () => {
//       try {
//         let response = null;
//         if (role === "Super Admin") {
//           response = await Allprojects();
//         } else if (role === "Admin") {
//           response = await getProjectUserDetails();
//         } else {
//           const entity_id = userData.entity_id || null;
//           const company_id = userData.company_id || null;
//           const organization_id =
//             userData.org || userData.organization_id || null;
//           if (!entity_id && !company_id && !organization_id) {
//             setProjects([]);
//             return;
//           }
//           response = await getProjectsByOwnership({
//             entity_id,
//             company_id,
//             organization_id,
//           });
//         }
//         if (response && response.status === 200) {
//           setProjects(response.data || []);
//         } else {
//           setProjects([]);
//           showToast("Failed to fetch projects.", "error");
//         }
//       } catch (err) {
//         setProjects([]);
//         showToast("Failed to fetch projects.", "error");
//       }
//     };
//     fetchProjects();
//   }, []);

//   useEffect(() => {
//     if (!selectedProjectId) {
//       const fetchMyChecklists = async () => {
//         try {
//           const response = await getMyChecklists();
//           if (response.status === 200) {
//             setChecklistData(response.data || []);
//           } else {
//             setChecklistData([]);
//             showToast("Failed to fetch your checklists.", "error");
//           }
//         } catch (err) {
//           setChecklistData([]);
//           showToast("Failed to fetch your checklists.", "error");
//         }
//       };
//       fetchMyChecklists();
//     }
//   }, [selectedProjectId]);

//   const handleChecklistCreated = (newChecklist) => {
//     if (
//       newChecklist.project_id &&
//       newChecklist.category_id &&
//       newChecklist.id
//     ) {
//       setUserAccessProjectId(newChecklist.project_id);
//       setUserAccessCategoryId(newChecklist.category_id);
//       setCurrentChecklistId(newChecklist.id);
//       setShowUserSelection(true);
//       setRefreshTrigger((prev) => prev + 1);
//       showToast(
//         "Checklist created! Assign users to this checklist.",
//         "success"
//       );
//     }
//     setShowForm(false);
//     setIsButtonDisabled(false);
//   };

//   const hideUserSelection = () => {
//     setShowUserSelection(false);
//     setUserAccessProjectId(null);
//     setUserAccessCategoryId(null);
//     setCurrentChecklistId(null);
//   };

//   const handleQuickPreview = (checklist) => {
//     setPreviewChecklist(checklist);
//     setShowQuickPreview(true);
//   };

//   const handleDeleteClick = (checklist) => {
//     setChecklistToDelete(checklist);
//     setShowDeleteConfirm(true);
//   };
//   const handleDeleteConfirm = async () => {
//     if (!checklistToDelete) return;
//     setIsDeleting(true);
//     try {
//       await deleteChecklistById(checklistToDelete.id);
//       setChecklistData((prev) =>
//         prev.filter((item) => item.id !== checklistToDelete.id)
//       );
//       showToast(
//         `Checklist "${checklistToDelete.name}" deleted successfully!`,
//         "success"
//       );
//       setShowDeleteConfirm(false);
//       setChecklistToDelete(null);
//     } catch (error) {
//       const errorMessage =
//         error.response?.data?.message || "Failed to delete checklist";
//       showToast(errorMessage, "error");
//     } finally {
//       setIsDeleting(false);
//     }
//   };
//   const handleDeleteCancel = () => {
//     setShowDeleteConfirm(false);
//     setChecklistToDelete(null);
//   };

//   // Pagination (palette only)
//   const renderPagination = () => {
//     if (totalPages <= 1) return null;
//     const arr = [];
//     const DOTS = (
//       <span style={{ color: palette.border, fontWeight: 700 }}>…</span>
//     );
//     for (let i = 1; i <= totalPages; i++) {
//       if (
//         i === 1 ||
//         i === totalPages ||
//         (i >= currentPage - 1 && i <= currentPage + 1)
//       ) {
//         arr.push(
//           <button
//             key={i}
//             onClick={() => setCurrentPage(i)}
//             style={{
//               padding: "0.45rem 1rem",
//               margin: "0 0.22rem",
//               borderRadius: 10,
//               background: i === currentPage ? palette.badge : "transparent",
//               color: i === currentPage ? palette.badgeText : palette.text,
//               border:
//                 i === currentPage ? `2px solid ${palette.border}` : "none",
//               fontWeight: i === currentPage ? 700 : 500,
//               fontSize: 15,
//               boxShadow: i === currentPage ? palette.shadow : "none",
//               cursor: i === currentPage ? "default" : "pointer",
//               transition: "background .18s,border .18s",
//             }}
//             disabled={i === currentPage}
//           >
//             {i}
//           </button>
//         );
//       } else if (
//         (i === 2 && currentPage > 3) ||
//         (i === totalPages - 1 && currentPage < totalPages - 2)
//       ) {
//         arr.push(<span key={i}>{DOTS}</span>);
//       }
//     }
//     return arr;
//   };

//   if (!userData)
//     return (
//       <div
//         className="flex items-center justify-center min-h-screen"
//         style={{ background: palette.bg }}
//       >
//         <div className="flex items-center space-x-4">
//           <div
//             className="animate-spin rounded-full h-8 w-8"
//             style={{ borderBottom: `2px solid ${palette.border}` }}
//           ></div>
//           <span className="text-lg font-medium" style={{ color: palette.text }}>
//             Loading...
//           </span>
//         </div>
//       </div>
//     );

//   if (showForm) {
//     return (
//       <ChecklistForm
//         setShowForm={setShowForm}
//         checklist={selectedChecklist}
//         projectOptions={projects}
//         onChecklistCreated={handleChecklistCreated}
//       />
//     );
//   } else if (detailForm && selectedChecklist) {
//     return (
//       <Checklistdetails
//         setShowForm={setShowForm}
//         setDetailForm={setDetailForm}
//         checklist={selectedChecklist}
//         projectId={selectedProjectId}
//       />
//     );
//   }

//   return (
//     <div
//       style={{
//         background: palette.bg,
//         minHeight: "100vh",
//         marginLeft: contentMarginLeft,
//         transition: "margin-left 0.35s cubic-bezier(.6,-0.17,.22,1.08)",
//         padding: 16,
//       }}
//     >
//       <div
//         className="max-w-7xl mx-auto p-4 lg:p-8 rounded-2xl"
//         style={{
//           background: palette.card,
//           border: `2px solid ${palette.border}`,
//           boxShadow: palette.shadow,
//         }}
//       >
//         {/* Header */}
//         <div className="mb-8 flex items-center">
//           <div
//             className="p-3 rounded-xl flex items-center justify-center"
//             style={{ background: palette.badge, color: palette.badgeText }}
//           >
//             <svg
//               width="28"
//               height="28"
//               fill="none"
//               stroke={palette.icon}
//               strokeWidth="2.2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               viewBox="0 0 24 24"
//             >
//               <rect width="24" height="24" rx="6" fill={palette.badge}></rect>
//               <path d="M9 5H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2 2h2a2 2 0 0 1 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
//             </svg>
//           </div>
//           <div className="ml-4">
//             <h1 className="text-3xl font-bold" style={{ color: palette.text }}>
//               Checklist Management
//             </h1>
//             <p
//               className="text-lg mt-1"
//               style={{ color: palette.textSecondary }}
//             >
//               Create, manage, and assign checklists to your team
//             </p>
//           </div>
//         </div>

//         {/* Controls Row */}
//         <div className="flex flex-col gap-4 mb-8 lg:flex-row lg:items-end">
//           {/* Project Dropdown */}
//           <div className="w-full lg:w-1/3 flex flex-col">
//             <label
//               className="block text-lg font-semibold mb-3 flex items-center"
//               style={{ color: palette.text }}
//             >
//               <svg
//                 width="20"
//                 height="20"
//                 fill="none"
//                 stroke={palette.icon}
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 viewBox="0 0 24 24"
//               >
//                 <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0V9a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v12" />
//               </svg>
//               <span className="ml-2">Select Project</span>
//             </label>
//             <select
//               className="w-full p-4 rounded-xl font-medium"
//               style={{
//                 background: palette.card,
//                 color: palette.text,
//                 border: `2px solid ${palette.border}`,
//                 fontWeight: 500,
//               }}
//               value={selectedProjectId}
//               onChange={(e) => setSelectedProjectId(e.target.value)}
//             >
//               <option value="">All Projects</option>
//               {projects.map((proj) => (
//                 <option key={proj.id} value={proj.id}>
//                   {proj.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Search Bar - Center */}
//           <div className="w-full lg:w-1/3 flex flex-col justify-end items-center">
//             <div
//               className="flex items-center rounded-xl px-3 w-full"
//               style={{
//                 background: palette.card,
//                 border: `2px solid ${palette.border}`,
//                 boxShadow: "0 1px 4px rgba(60,60,60,0.08)",
//                 minWidth: 280,
//                 maxWidth: 420,
//               }}
//             >
//               <svg
//                 width="20"
//                 height="20"
//                 fill="none"
//                 stroke={palette.icon}
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 style={{ marginRight: 8 }}
//                 viewBox="0 0 24 24"
//               >
//                 <circle cx="11" cy="11" r="8" />
//                 <line x1="21" y1="21" x2="16.65" y2="16.65" />
//               </svg>
//               <input
//                 type="text"
//                 className="flex-1 py-2 px-1 bg-transparent outline-none text-base"
//                 style={{
//                   color: palette.text,
//                   background: "none",
//                   border: "none",
//                 }}
//                 placeholder="Search checklists…"
//                 value={searchQuery}
//                 onChange={(e) => {
//                   setSearchQuery(e.target.value);
//                   setCurrentPage(1);
//                 }}
//               />
//             </div>
//           </div>

//           {/* Create Checklist Button */}
//           <div className="w-full lg:w-1/3 flex flex-col justify-end">
//             <button
//               disabled={isButtonDisabled}
//               className="px-6 py-4 rounded-xl font-semibold text-lg flex items-center justify-center"
//               style={{
//                 ...palette.primaryBtn,
//                 opacity: isButtonDisabled ? 0.5 : 1,
//                 cursor: isButtonDisabled ? "not-allowed" : "pointer",
//                 transition: "all .18s",
//               }}
//               onClick={() => {
//                 setIsButtonDisabled(true);
//                 setSelectedChecklist(null);
//                 setShowForm(true);
//                 hideUserSelection();
//               }}
//             >
//               <svg
//                 width="22"
//                 height="22"
//                 fill="none"
//                 stroke="#23232c"
//                 strokeWidth="2.2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 viewBox="0 0 24 24"
//                 className="mr-2"
//               >
//                 <path d="M12 4v16m8-8H4" />
//               </svg>
//               <span>Create Checklist</span>
//             </button>
//           </div>
//         </div>

//         {/* Show UserSelectionTable after create */}
//         {showUserSelection &&
//           userAccessProjectId &&
//           userAccessCategoryId &&
//           currentChecklistId && (
//             <div className="mb-8">
//               <div
//                 style={{
//                   border: "2px solid #10b981",
//                   borderRadius: 16,
//                   background: "#e7fbe7",
//                   marginBottom: 16,
//                   padding: 18,
//                   fontWeight: 600,
//                   color: "#065f46",
//                 }}
//               >
//                 Checklist created! Assign users to this checklist below.
//                 <button
//                   onClick={hideUserSelection}
//                   style={{
//                     float: "right",
//                     background: palette.dangerBtn.background,
//                     color: palette.dangerBtn.color,
//                     border: palette.dangerBtn.border,
//                     borderRadius: 8,
//                     padding: "4px 14px",
//                     marginLeft: 16,
//                     fontWeight: 600,
//                     cursor: "pointer",
//                   }}
//                 >
//                   Close
//                 </button>
//               </div>
//               <UserSelectionTable
//                 projectId={userAccessProjectId}
//                 categoryId={userAccessCategoryId}
//                 checklistId={currentChecklistId}
//                 refreshTrigger={refreshTrigger}
//                 onSendUsers={() => showToast("Users assigned!", "success")}
//               />
//             </div>
//           )}

//         {/* Table */}
//         <div
//           className="overflow-hidden rounded-xl border-2"
//           style={{
//             borderColor: palette.border,
//             boxShadow: palette.shadow,
//             background: palette.card,
//             marginBottom: 16,
//           }}
//         >
//           <div className="overflow-x-auto min-w-full">
//             <table className="w-full min-w-[800px]">
//               <thead
//                 style={{
//                   background: palette.tableHeadBg,
//                   color: palette.tableHeadText,
//                   borderBottom: `2px solid ${palette.border}`,
//                 }}
//               >
//                 <tr>
//                   <th className="font-bold p-4 text-left text-sm uppercase tracking-wider">
//                     ID
//                   </th>
//                   <th className="font-bold p-4 text-left text-sm uppercase tracking-wider">
//                     Checklist Name
//                   </th>
//                   <th className="font-bold p-4 text-left text-sm uppercase tracking-wider">
//                     Questions
//                   </th>
//                   <th className="font-bold p-4 text-center text-sm uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {currentItems.length > 0 ? (
//                   currentItems.map((item) => (
//                     <tr
//                       key={item.id}
//                       style={{
//                         background: palette.tableRowBg,
//                         color: palette.text,
//                         borderBottom: `1px solid ${palette.border}`,
//                         transition: "background .12s",
//                       }}
//                     >
//                       <td className="p-4 font-semibold">
//                         <div
//                           style={{
//                             background: palette.badge,
//                             color: palette.badgeText,
//                             borderRadius: 8,
//                             width: 32,
//                             height: 32,
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                             fontWeight: 700,
//                           }}
//                         >
//                           {item.id}
//                         </div>
//                       </td>
//                       <td className="p-4">
//                         <div className="flex flex-col">
//                           <span className="font-semibold text-lg">
//                             {item.name || `Checklist ${item.id}`}
//                           </span>
//                           <span
//                             style={{
//                               color: palette.textSecondary,
//                               fontSize: 14,
//                             }}
//                           >
//                             Created • ID: {item.id}
//                           </span>
//                         </div>
//                       </td>
//                       <td className="p-4">
//                         <div
//                           style={{
//                             background: palette.badge,
//                             color: palette.badgeText,
//                             borderRadius: 12,
//                             padding: "2px 16px",
//                             fontWeight: 600,
//                             fontSize: 14,
//                             display: "inline-block",
//                           }}
//                         >
//                           {item.items?.length || 0} Questions
//                         </div>
//                       </td>
//                       <td className="p-4 text-center">
//                         <button
//                           style={{
//                             color: "#222",
//                             border: "#222",
//                             borderRadius: 8,
//                             padding: "8px 16px",
//                             fontWeight: 600,
//                             cursor: "pointer",
//                             marginRight: 8,
//                           }}
//                           onClick={() => handleQuickPreview(item)}
//                         >
//                           <svg
//                             width="18"
//                             height="18"
//                             fill="none"
//                             stroke="currentColor"
//                             strokeWidth="2"
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             style={{ marginRight: 6 }}
//                             viewBox="0 0 24 24"
//                           >
//                             <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
//                             <circle cx="12" cy="12" r="3" />
//                           </svg>
//                         </button>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td
//                       colSpan={4}
//                       className="text-center py-16"
//                       style={{
//                         color: palette.text,
//                         background: palette.tableNoDataBg,
//                         fontWeight: 600,
//                         fontSize: 20,
//                       }}
//                     >
//                       {searchQuery.trim()
//                         ? "No checklists available for your search."
//                         : "No checklists found."}
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Pagination */}
//         <div className="mt-8 flex justify-center">{renderPagination()}</div>
//       </div>

//       {/* Quick Preview Modal */}
//       {showQuickPreview && previewChecklist && (
//         <div
//           style={{
//             position: "fixed",
//             inset: 0,
//             zIndex: 50,
//             background: "rgba(0,0,0,0.45)",
//             backdropFilter: "blur(3px)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             padding: 16,
//           }}
//         >
//           <div
//             style={{
//               background: palette.card,
//               borderRadius: 18,
//               padding: 32,
//               maxWidth: 520,
//               width: "100%",
//               boxShadow: palette.shadow,
//               border: `2px solid ${palette.border}`,
//             }}
//           >
//             <div
//               style={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//                 marginBottom: 18,
//               }}
//             >
//               <div style={{ display: "flex", alignItems: "center" }}>
//                 <div
//                   style={{
//                     background: palette.infoBtn.background,
//                     color: palette.infoBtn.color,
//                     borderRadius: 12,
//                     padding: 8,
//                     marginRight: 8,
//                   }}
//                 >
//                   <svg
//                     width={26}
//                     height={26}
//                     fill="none"
//                     stroke="#fff"
//                     strokeWidth="2.1"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     viewBox="0 0 24 24"
//                   >
//                     <circle cx={12} cy={12} r={10} />
//                     <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                   </svg>
//                 </div>
//                 <h3
//                   style={{ fontSize: 22, fontWeight: 700, color: palette.text }}
//                 >
//                   Quick Preview
//                 </h3>
//               </div>
//               <button
//                 onClick={() => setShowQuickPreview(false)}
//                 style={{
//                   background: palette.dangerBtn.background,
//                   color: palette.dangerBtn.color,
//                   border: palette.dangerBtn.border,
//                   borderRadius: 8,
//                   padding: 6,
//                   fontWeight: 700,
//                   fontSize: 17,
//                   cursor: "pointer",
//                 }}
//               >
//                 X
//               </button>
//             </div>
//             <div>
//               <div
//                 style={{
//                   fontWeight: 700,
//                   fontSize: 18,
//                   color: palette.text,
//                   marginBottom: 8,
//                 }}
//               >
//                 {previewChecklist.name || `Checklist ${previewChecklist.id}`}
//               </div>
//               <div
//                 style={{
//                   color: palette.textSecondary,
//                   fontSize: 15,
//                   marginBottom: 18,
//                 }}
//               >
//                 ID: {previewChecklist.id} •{" "}
//                 {previewChecklist.items?.length || 0} Questions
//               </div>
//               <button
//                 onClick={() => {
//                   setShowQuickPreview(false);
//                   setSelectedChecklist(previewChecklist);
//                   setDetailForm(true);
//                 }}
//                 style={{
//                   ...palette.infoBtn,
//                   borderRadius: 10,
//                   padding: "12px 28px",
//                   marginRight: 12,
//                   fontWeight: 700,
//                   cursor: "pointer",
//                 }}
//               >
//                 View Details
//               </button>
//               <button
//                 onClick={() => {
//                   setShowQuickPreview(false);
//                   setSelectedChecklist(previewChecklist);
//                   setShowForm(true);
//                 }}
//                 style={{
//                   ...palette.successBtn,
//                   borderRadius: 10,
//                   padding: "12px 28px",
//                   marginRight: 12,
//                   fontWeight: 700,
//                   cursor: "pointer",
//                 }}
//               >
//                 Edit Checklist
//               </button>
//               <button
//                 onClick={() => {
//                   setShowQuickPreview(false);
//                   handleDeleteClick(previewChecklist);
//                 }}
//                 style={{
//                   ...palette.dangerBtn,
//                   borderRadius: 10,
//                   padding: "12px 28px",
//                   fontWeight: 700,
//                   cursor: "pointer",
//                 }}
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Modal */}
//       {showDeleteConfirm && (
//         <div
//           style={{
//             position: "fixed",
//             inset: 0,
//             zIndex: 50,
//             background: "rgba(0,0,0,0.45)",
//             backdropFilter: "blur(3px)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             padding: 16,
//           }}
//         >
//           <div
//             style={{
//               background: palette.card,
//               borderRadius: 18,
//               padding: 32,
//               maxWidth: 420,
//               width: "100%",
//               boxShadow: palette.shadow,
//               border: `2px solid ${palette.border}`,
//             }}
//           >
//             <div style={{ textAlign: "center", marginBottom: 22 }}>
//               <div
//                 style={{
//                   background: "#fffbe8",
//                   borderRadius: "50%",
//                   width: 66,
//                   height: 66,
//                   margin: "0 auto 18px auto",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                 }}
//               >
//                 <svg
//                   width={34}
//                   height={34}
//                   fill="none"
//                   stroke="#b54b13"
//                   strokeWidth={2.2}
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   viewBox="0 0 24 24"
//                 >
//                   <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
//                 </svg>
//               </div>
//               <h3
//                 style={{
//                   fontSize: 22,
//                   fontWeight: 800,
//                   color: palette.text,
//                   marginBottom: 10,
//                 }}
//               >
//                 Confirm Deletion
//               </h3>
//               <div
//                 style={{
//                   color: palette.textSecondary,
//                   fontSize: 16,
//                   marginBottom: 18,
//                 }}
//               >
//                 Are you sure you want to permanently delete this checklist?
//               </div>
//               {checklistToDelete && (
//                 <div
//                   style={{
//                     background: "#fffbe8",
//                     border: "2px solid #ffe49b",
//                     borderRadius: 12,
//                     padding: 12,
//                     marginBottom: 18,
//                   }}
//                 >
//                   <div
//                     style={{ color: "#b54b13", fontWeight: 700, fontSize: 17 }}
//                   >
//                     "
//                     {checklistToDelete.name ||
//                       `Checklist ${checklistToDelete.id}`}
//                     "
//                   </div>
//                   <div style={{ color: "#b54b13bb", fontSize: 13 }}>
//                     {checklistToDelete.items?.length || 0} questions will be
//                     permanently removed.
//                   </div>
//                 </div>
//               )}
//               <div
//                 style={{ display: "flex", justifyContent: "center", gap: 18 }}
//               >
//                 <button
//                   onClick={handleDeleteCancel}
//                   disabled={isDeleting}
//                   style={{
//                     ...palette.secondaryBtn,
//                     borderRadius: 9,
//                     padding: "10px 30px",
//                     fontWeight: 700,
//                     fontSize: 16,
//                     cursor: isDeleting ? "not-allowed" : "pointer",
//                   }}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleDeleteConfirm}
//                   disabled={isDeleting}
//                   style={{
//                     ...palette.dangerBtn,
//                     borderRadius: 9,
//                     padding: "10px 30px",
//                     fontWeight: 700,
//                     fontSize: 16,
//                     cursor: isDeleting ? "not-allowed" : "pointer",
//                   }}
//                 >
//                   {isDeleting ? "Deleting..." : "Confirm Delete"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Checklist;



import { useState, useEffect } from "react";
import ChecklistForm from "./ChecklistForm";
import Checklistdetails from "./ChecklistDetails";
import UserSelectionTable from "../../components/UserSelectionTable";
import {
  getProjectsByOwnership,
  getProjectUserDetails,
  Allprojects,
  getMyChecklists,
  deleteChecklistById,
} from "../../api";
import { showToast } from "../../utils/toast";
import { useTheme } from "../../ThemeContext";
import { useSidebar } from "../../components/SidebarContext";

// Palette setup
const ORANGE = "#ffbe63";
const BG_OFFWHITE = "#fcfaf7";
const SIDEBAR_WIDTH = 0;

const getPalette = (theme) => ({
  bg: theme === "dark" ? "#191922" : BG_OFFWHITE,
  card: theme === "dark" ? "#23232c" : "#fff",
  border: ORANGE,
  text: theme === "dark" ? "#fff" : "#222",
  textSecondary: theme === "dark" ? "#ffbe63b3" : "#b54b13b3",
  badge: ORANGE,
  badgeText: theme === "dark" ? "#23232c" : "#fff",
  shadow:
    theme === "dark"
      ? "0 4px 24px 0 rgba(255, 190, 99, 0.18)"
      : "0 4px 24px 0 rgba(255,190,99,0.12)",
  primaryBtn: {
    background: ORANGE,
    color: "#23232c",
    border: `2px solid ${ORANGE}`,
    fontWeight: 600,
  },
  secondaryBtn: {
    background: "#fff",
    color: "#b54b13",
    border: `2px solid ${ORANGE}`,
    fontWeight: 600,
  },
  dangerBtn: {
    background: "#ef4444",
    color: "#fff",
    border: `2px solid #ef4444`,
    fontWeight: 600,
  },
  successBtn: {
    background: "#10b981",
    color: "#fff",
    border: `2px solid #10b981`,
    fontWeight: 600,
  },
  infoBtn: {
    background: "#2563eb",
    color: "#fff",
    border: `2px solid #2563eb`,
    fontWeight: 600,
  },
  tableHeadBg: theme === "dark" ? "#191919" : "#fff7ea",
  tableHeadText: theme === "dark" ? "#ffbe63" : "#b54b13",
  tableRowBg: theme === "dark" ? "#23232c" : "#fff",
  icon: ORANGE,
  tableNoDataBg: theme === "dark" ? "#23232c" : "#fff7ea",
});

const Checklist = () => {
  const { theme } = useTheme();
  const palette = getPalette(theme);
  const { sidebarOpen } = useSidebar();

  // State
  const [userData, setUserData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [checklistData, setChecklistData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [detailForm, setDetailForm] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState(null);

  const [showUserSelection, setShowUserSelection] = useState(false);
  const [userAccessProjectId, setUserAccessProjectId] = useState(null);
  const [userAccessCategoryId, setUserAccessCategoryId] = useState(null);
  const [currentChecklistId, setCurrentChecklistId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [checklistToDelete, setChecklistToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quick preview state
  const [showQuickPreview, setShowQuickPreview] = useState(false);
  const [previewChecklist, setPreviewChecklist] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sidebar movement
  const contentMarginLeft = sidebarOpen ? SIDEBAR_WIDTH : 0;

  // Filtering by project
  const byProject = selectedProjectId
    ? checklistData.filter(
        (item) => String(item.project_id) === String(selectedProjectId)
      )
    : checklistData;

  // Filtering by search query (name or ID)
  const filteredChecklistData = searchQuery.trim()
    ? byProject.filter((item) => {
        const q = searchQuery.trim().toLowerCase();
        return (
          (item.name && item.name.toLowerCase().includes(q)) ||
          String(item.id).includes(q)
        );
      })
    : byProject;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredChecklistData.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredChecklistData.length / itemsPerPage);

  // Fetch user and project
  useEffect(() => {
    const role = localStorage.getItem("ROLE");
    const userString = localStorage.getItem("USER_DATA");
    const userData =
      userString && userString !== "undefined" ? JSON.parse(userString) : null;
    setUserData(userData);

    if (!userData) {
      setProjects([]);
      return;
    }

    const fetchProjects = async () => {
      try {
        let response = null;
        if (role === "Super Admin") {
          response = await Allprojects();
        } else if (role === "Admin") {
          response = await getProjectUserDetails();
        } else {
          const entity_id = userData.entity_id || null;
          const company_id = userData.company_id || null;
          const organization_id =
            userData.org || userData.organization_id || null;
          if (!entity_id && !company_id && !organization_id) {
            setProjects([]);
            return;
          }
          response = await getProjectsByOwnership({
            entity_id,
            company_id,
            organization_id,
          });
        }
        if (response && response.status === 200) {
          setProjects(response.data || []);
        } else {
          setProjects([]);
          showToast("Failed to fetch projects.", "error");
        }
      } catch (err) {
        setProjects([]);
        showToast("Failed to fetch projects.", "error");
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (!selectedProjectId) {
      const fetchMyChecklists = async () => {
        try {
          const response = await getMyChecklists();
          if (response.status === 200) {
            setChecklistData(response.data || []);
          } else {
            setChecklistData([]);
            showToast("Failed to fetch your checklists.", "error");
          }
        } catch (err) {
          setChecklistData([]);
          showToast("Failed to fetch your checklists.", "error");
        }
      };
      fetchMyChecklists();
    }
  }, [selectedProjectId]);

  const handleChecklistCreated = (newChecklist) => {
    if (
      newChecklist.project_id &&
      newChecklist.category_id &&
      newChecklist.id
    ) {
      setUserAccessProjectId(newChecklist.project_id);
      setUserAccessCategoryId(newChecklist.category_id);
      setCurrentChecklistId(newChecklist.id);
      setShowUserSelection(true);
      setRefreshTrigger((prev) => prev + 1);
      showToast(
        "Checklist created! Assign users to this checklist.",
        "success"
      );
    }
    setShowForm(false);
    setIsButtonDisabled(false);
  };

  const hideUserSelection = () => {
    setShowUserSelection(false);
    setUserAccessProjectId(null);
    setUserAccessCategoryId(null);
    setCurrentChecklistId(null);
  };

  const handleQuickPreview = (checklist) => {
    setPreviewChecklist(checklist);
    setShowQuickPreview(true);
  };

  const handleDeleteClick = (checklist) => {
    setChecklistToDelete(checklist);
    setShowDeleteConfirm(true);
  };
  const handleDeleteConfirm = async () => {
    if (!checklistToDelete) return;
    setIsDeleting(true);
    try {
      await deleteChecklistById(checklistToDelete.id);
      setChecklistData((prev) =>
        prev.filter((item) => item.id !== checklistToDelete.id)
      );
      showToast(
        `Checklist "${checklistToDelete.name}" deleted successfully!`,
        "success"
      );
      setShowDeleteConfirm(false);
      setChecklistToDelete(null);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete checklist";
      showToast(errorMessage, "error");
    } finally {
      setIsDeleting(false);
    }
  };
  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setChecklistToDelete(null);
  };

  // Pagination (palette only)
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const arr = [];
    const DOTS = (
      <span style={{ color: palette.border, fontWeight: 700 }}>…</span>
    );
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        arr.push(
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            style={{
              padding: "0.45rem 1rem",
              margin: "0 0.22rem",
              borderRadius: 10,
              background: i === currentPage ? palette.badge : "transparent",
              color: i === currentPage ? palette.badgeText : palette.text,
              border:
                i === currentPage ? `2px solid ${palette.border}` : "none",
              fontWeight: i === currentPage ? 700 : 500,
              fontSize: 15,
              boxShadow: i === currentPage ? palette.shadow : "none",
              cursor: i === currentPage ? "default" : "pointer",
              transition: "background .18s,border .18s",
            }}
            disabled={i === currentPage}
          >
            {i}
          </button>
        );
      } else if (
        (i === 2 && currentPage > 3) ||
        (i === totalPages - 1 && currentPage < totalPages - 2)
      ) {
        arr.push(<span key={i}>{DOTS}</span>);
      }
    }
    return arr;
  };

  if (!userData)
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: palette.bg }}
      >
        <div className="flex items-center space-x-4">
          <div
            className="animate-spin rounded-full h-8 w-8"
            style={{ borderBottom: `2px solid ${palette.border}` }}
          ></div>
          <span className="text-lg font-medium" style={{ color: palette.text }}>
            Loading...
          </span>
        </div>
      </div>
    );

  if (showForm) {
    return (
      <ChecklistForm
        setShowForm={setShowForm}
        checklist={selectedChecklist}
        projectOptions={projects}
        onChecklistCreated={handleChecklistCreated}
      />
    );
  } else if (detailForm && selectedChecklist) {
    return (
      <Checklistdetails
        setShowForm={setShowForm}
        setDetailForm={setDetailForm}
        checklist={selectedChecklist}
        projectId={selectedProjectId}
      />
    );
  }

  return (
    <div
      style={{
        background: palette.bg,
        minHeight: "100vh",
        marginLeft: contentMarginLeft,
        transition: "margin-left 0.35s cubic-bezier(.6,-0.17,.22,1.08)",
        padding: 16,
      }}
    >
      <div
        className="max-w-7xl mx-auto p-4 lg:p-8 rounded-2xl"
        style={{
          background: palette.card,
          border: `2px solid ${palette.border}`,
          boxShadow: palette.shadow,
        }}
      >
        {/* Header */}
        <div className="mb-8 flex items-center">
          <div
            className="p-3 rounded-xl flex items-center justify-center"
            style={{ background: palette.badge, color: palette.badgeText }}
          >
            <svg
              width="28"
              height="28"
              fill="none"
              stroke={palette.icon}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <rect width="24" height="24" rx="6" fill={palette.badge}></rect>
              <path d="M9 5H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2 2h2a2 2 0 0 1 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div className="ml-4">
            <h1 className="text-3xl font-bold" style={{ color: palette.text }}>
              Checklist Management
            </h1>
            <p
              className="text-lg mt-1"
              style={{ color: palette.textSecondary }}
            >
              Create, manage, and assign checklists to your team
            </p>
          </div>
        </div>

        {/* Controls - 3 equal columns, no block logic */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {/* Project Dropdown */}
          <div className="flex flex-col justify-end">
            <label
              className="block text-lg font-semibold mb-3 flex items-center"
              style={{ color: palette.text }}
            >
              <svg
                width="20"
                height="20"
                fill="none"
                stroke={palette.icon}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0V9a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v12" />
              </svg>
              <span className="ml-2">Select Project</span>
            </label>
            <select
              className="w-full p-4 rounded-xl font-medium"
              style={{
                background: palette.card,
                color: palette.text,
                border: `2px solid ${palette.border}`,
                fontWeight: 500,
              }}
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              <option value="">All Projects</option>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col justify-end">
            <div
              className="flex items-center rounded-xl px-3"
              style={{
                background: palette.card,
                border: `2px solid ${palette.border}`,
                boxShadow: "0 1px 4px rgba(60,60,60,0.08)",
                width: "100%",
                maxWidth: "100%",
                minHeight: 56,
              }}
            >
              <svg
                width="19"
                height="19"
                fill="none"
                stroke={palette.icon}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginRight: 8 }}
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="flex-1 py-2 px-1 bg-transparent outline-none text-base"
                style={{
                  color: palette.text,
                  background: "none",
                  border: "none",
                }}
                placeholder="Search checklists…"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Always reset to page 1 on search
                }}
              />
            </div>
          </div>

          {/* Create Checklist Button */}
          <div className="flex flex-col justify-end">
            <button
              disabled={isButtonDisabled}
              className="px-6 py-4 rounded-xl font-semibold text-lg flex items-center justify-center"
              style={{
                ...palette.primaryBtn,
                opacity: isButtonDisabled ? 0.5 : 1,
                cursor: isButtonDisabled ? "not-allowed" : "pointer",
                transition: "all .18s",
                minWidth: "100%", // take full width of column
                minHeight: 56,
              }}
              onClick={() => {
                // Removed block logic, only opens the form
                setSelectedChecklist(null);
                setShowForm(true);
                hideUserSelection();
              }}
            >
              <svg
                width="22"
                height="22"
                fill="none"
                stroke="#23232c"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
                className="mr-2"
              >
                <path d="M12 4v16m8-8H4" />
              </svg>
              <span>Create Checklist</span>
            </button>
          </div>
        </div>
        {/* ...rest of your file, unchanged... */}
        {/* Show UserSelectionTable after create */}
        {/* {showUserSelection &&
          userAccessProjectId &&
          userAccessCategoryId &&
          currentChecklistId && (
            <div className="mb-8">
              <div
                style={{
                  border: "2px solid #10b981",
                  borderRadius: 16,
                  background: "#e7fbe7",
                  marginBottom: 16,
                  padding: 18,
                  fontWeight: 600,
                  color: "#065f46",
                }}
              >
                Checklist created! Assign users to this checklist below.
                <button
                  onClick={hideUserSelection}
                  style={{
                    float: "right",
                    background: palette.dangerBtn.background,
                    color: palette.dangerBtn.color,
                    border: palette.dangerBtn.border,
                    borderRadius: 8,
                    padding: "4px 14px",
                    marginLeft: 16,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
              <UserSelectionTable
                projectId={userAccessProjectId}
                categoryId={userAccessCategoryId}
                checklistId={currentChecklistId}
                refreshTrigger={refreshTrigger}
                onSendUsers={() => showToast("Users assigned!", "success")}
              />
            </div>
          )} */}

        {/* Table */}
        <div
          className="overflow-hidden rounded-xl border-2"
          style={{
            borderColor: palette.border,
            boxShadow: palette.shadow,
            background: palette.card,
            marginBottom: 16,
          }}
        >
          <div className="overflow-x-auto min-w-full">
            <table className="w-full min-w-[800px]">
              <thead
                style={{
                  background: palette.tableHeadBg,
                  color: palette.tableHeadText,
                  borderBottom: `2px solid ${palette.border}`,
                }}
              >
                <tr>
                  {/* <th className="font-bold p-4 text-left text-sm uppercase tracking-wider">
                    ID
                  </th> */}
                  <th className="font-bold p-4 text-left text-sm uppercase tracking-wider">
                    Checklist Name
                  </th>
                  <th className="font-bold p-4 text-left text-sm uppercase tracking-wider">
                    Questions
                  </th>
                  <th className="font-bold p-4 text-center text-sm uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((item) => (
                    <tr
                      key={item.id}
                      style={{
                        background: palette.tableRowBg,
                        color: palette.text,
                        borderBottom: `1px solid ${palette.border}`,
                        transition: "background .12s",
                      }}
                    >
                      {/* <td className="p-4 font-semibold">
                        <div
                          style={{
                            background: palette.badge,
                            color: palette.badgeText,
                            borderRadius: 8,
                            width: 32,
                            height: 32,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                          }}
                        >
                          {item.id}
                        </div>
                      </td> */}
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-lg">
                            {item.name || `Checklist ${item.id}`}
                          </span>
                          {/* <span
                            style={{
                              color: palette.textSecondary,
                              fontSize: 14,
                            }}
                          >
                            Created • ID: {item.id}
                          </span> */}
                        </div>
                      </td>
                      <td className="p-4">
                        <div
                          style={{
                            background: palette.badge,
                            color: palette.badgeText,
                            borderRadius: 12,
                            padding: "2px 16px",
                            fontWeight: 600,
                            fontSize: 14,
                            display: "inline-block",
                          }}
                        >
                          {item.items?.length || 0} Questions
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          style={{
                            color: "#222",
                            border: "#222",
                            borderRadius: 8,
                            padding: "8px 16px",
                            fontWeight: 600,
                            cursor: "pointer",
                            marginRight: 8,
                          }}
                          onClick={() => handleQuickPreview(item)}
                        >
                          <svg
                            width="18"
                            height="18"
                            fill="none"
                            stroke={palette.icon}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ marginRight: 6 }}
                            viewBox="0 0 24 24"
                          >
                            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-16"
                      style={{
                        color: palette.text,
                        background: palette.tableNoDataBg,
                        fontWeight: 600,
                        fontSize: 20,
                      }}
                    >
                      {searchQuery.trim()
                        ? "No checklists available for your search."
                        : "No checklists found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-8 flex justify-center">{renderPagination()}</div>
      </div>

      {/* Quick Preview Modal */}
      {showQuickPreview && previewChecklist && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(3px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              background: palette.card,
              borderRadius: 18,
              padding: 32,
              maxWidth: 520,
              width: "100%",
              boxShadow: palette.shadow,
              border: `2px solid ${palette.border}`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    background: palette.infoBtn.background,
                    color: palette.infoBtn.color,
                    borderRadius: 12,
                    padding: 8,
                    marginRight: 8,
                  }}
                >
                  <svg
                    width={26}
                    height={26}
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2.1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <circle cx={12} cy={12} r={10} />
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3
                  style={{ fontSize: 22, fontWeight: 700, color: palette.text }}
                >
                  Quick Preview
                </h3>
              </div>
              <button
                onClick={() => setShowQuickPreview(false)}
                style={{
                  background: palette.dangerBtn.background,
                  color: palette.dangerBtn.color,
                  border: palette.dangerBtn.border,
                  borderRadius: 8,
                  padding: 6,
                  fontWeight: 700,
                  fontSize: 17,
                  cursor: "pointer",
                }}
              >
                X
              </button>
            </div>
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 18,
                  color: palette.text,
                  marginBottom: 8,
                }}
              >
                {previewChecklist.name || `Checklist ${previewChecklist.id}`}
              </div>
              <div
                style={{
                  color: palette.textSecondary,
                  fontSize: 15,
                  marginBottom: 18,
                }}
              >
                ID: {previewChecklist.id} •{" "}
                {previewChecklist.items?.length || 0} Questions
              </div>
              <button
                onClick={() => {
                  setShowQuickPreview(false);
                  setSelectedChecklist(previewChecklist);
                  setDetailForm(true);
                }}
                style={{
                  ...palette.infoBtn,
                  borderRadius: 10,
                  padding: "12px 28px",
                  marginRight: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                View Details
              </button>
              <button
                onClick={() => {
                  setShowQuickPreview(false);
                  setSelectedChecklist(previewChecklist);
                  setShowForm(true);
                }}
                style={{
                  ...palette.successBtn,
                  borderRadius: 10,
                  padding: "12px 28px",
                  marginRight: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Edit Checklist
              </button>
              <button
                onClick={() => {
                  setShowQuickPreview(false);
                  handleDeleteClick(previewChecklist);
                }}
                style={{
                  ...palette.dangerBtn,
                  borderRadius: 10,
                  padding: "12px 28px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(3px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              background: palette.card,
              borderRadius: 18,
              padding: 32,
              maxWidth: 420,
              width: "100%",
              boxShadow: palette.shadow,
              border: `2px solid ${palette.border}`,
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 22 }}>
              <div
                style={{
                  background: "#fffbe8",
                  borderRadius: "50%",
                  width: 66,
                  height: 66,
                  margin: "0 auto 18px auto",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width={34}
                  height={34}
                  fill="none"
                  stroke="#b54b13"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: palette.text,
                  marginBottom: 10,
                }}
              >
                Confirm Deletion
              </h3>
              <div
                style={{
                  color: palette.textSecondary,
                  fontSize: 16,
                  marginBottom: 18,
                }}
              >
                Are you sure you want to permanently delete this checklist?
              </div>
              {checklistToDelete && (
                <div
                  style={{
                    background: "#fffbe8",
                    border: "2px solid #ffe49b",
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 18,
                  }}
                >
                  <div
                    style={{ color: "#b54b13", fontWeight: 700, fontSize: 17 }}
                  >
                    "
                    {checklistToDelete.name ||
                      `Checklist ${checklistToDelete.id}`}
                    "
                  </div>
                  <div style={{ color: "#b54b13bb", fontSize: 13 }}>
                    {checklistToDelete.items?.length || 0} questions will be
                    permanently removed.
                  </div>
                </div>
              )}
              <div
                style={{ display: "flex", justifyContent: "center", gap: 18 }}
              >
                <button
                  onClick={handleDeleteCancel}
                  disabled={isDeleting}
                  style={{
                    ...palette.secondaryBtn,
                    borderRadius: 9,
                    padding: "10px 30px",
                    fontWeight: 700,
                    fontSize: 16,
                    cursor: isDeleting ? "not-allowed" : "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  style={{
                    ...palette.dangerBtn,
                    borderRadius: 9,
                    padding: "10px 30px",
                    fontWeight: 700,
                    fontSize: 16,
                    cursor: isDeleting ? "not-allowed" : "pointer",
                  }}
                >
                  {isDeleting ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checklist;

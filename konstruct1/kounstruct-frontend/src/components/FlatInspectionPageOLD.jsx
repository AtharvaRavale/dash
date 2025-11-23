// import React, { useEffect, useState } from "react";
// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import SiteBarHome from "./SiteBarHome";
// import { useTheme } from "../ThemeContext";
// import axios from "axios";
// import toast from "react-hot-toast";
// import { checklistInstance } from '../api/axiosInstance';

// const FlatInspectionPage = () => {
//   const { theme } = useTheme();
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { flatId } = useParams();

//   // Get data from navigation state
//   const { projectId, flatNumber, flatType } = location.state || {};

//   // State management
//   const [checklistData, setChecklistData] = useState([]);
//   const [rooms, setRooms] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [roomsLoading, setRoomsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [showRoomsModal, setShowRoomsModal] = useState(false);
//   const [selectedRoom, setSelectedRoom] = useState(null);
//   const [expandedItems, setExpandedItems] = useState({});

//   // Theme configuration
//   const themeConfig = {
//     dark: {
//       pageBg: "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
//       cardBg: "bg-slate-800/90 border-slate-700",
//       textPrimary: "text-slate-100",
//       textSecondary: "text-slate-300",
//       accent: "text-blue-400",
//       headerBg: "bg-slate-700/50",
//     },
//     light: {
//       pageBg: "bg-gradient-to-br from-blue-50 via-white to-indigo-50",
//       cardBg: "bg-white/90 border-gray-200",
//       textPrimary: "text-gray-900",
//       textSecondary: "text-gray-600",
//       accent: "text-blue-600",
//       headerBg: "bg-blue-50/50",
//     },
//   };
//   const currentTheme = themeConfig[theme] || themeConfig.light;

//   // Extract room IDs from checklist data and fetch room details
//   // const fetchRoomDetails = async (roomIds) => {
//   //   if (!roomIds.length) {
//   //     console.log("⚠️ No room IDs to fetch");
//   //     return;
//   //   }

//   //   console.log("🔄 Fetching room details for IDs:", roomIds);
//   //   setRoomsLoading(true);

//   //   try {
//   //     const token = localStorage.getItem("ACCESS_TOKEN");

//   //     // Use the by_project endpoint instead of individual room calls
//   //     const response = await axios.get(
//   //       "https://konstruct.world/rooms/by_project/",
//   //       {
//   //         params: { project_id: projectId },
//   //         headers: { Authorization: `Bearer ${token}` },
//   //       }
//   //     );

//   //     // Filter rooms by the IDs we need
//   //     const allRooms = response.data || [];
//   //     const roomDetails = allRooms.filter((room) => roomIds.includes(room.id));

//   //     console.log("🏠 Room details fetched:", roomDetails);
//   //     setRooms(roomDetails);
//   //   } catch (err) {
//   //     console.error("❌ Failed to fetch room details:", err);
//   //     toast.error("Failed to load room details");
//   //   } finally {
//   //     setRoomsLoading(false);
//   //   }
//   // };

//   const fetchRoomDetails = async (roomIds) => {
//     if (!roomIds.length) {
//       console.log("⚠️ No room IDs to fetch");
//       return;
//     }

//     console.log("🔄 Fetching room details for IDs:", roomIds);
//     setRoomsLoading(true);

//     try {
//       const token = localStorage.getItem("ACCESS_TOKEN");

//       // Fetch each room individually
//       const roomPromises = roomIds.map(async (roomId) => {
//         console.log(`📡 Fetching room ${roomId}`);
//         const response = await checklistInstance.get(
//           `/rooms/${roomId}/`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );
//         return response.data;
//       });

//       const roomDetails = await Promise.all(roomPromises);
//       console.log("🏠 Room details fetched:", roomDetails);
//       setRooms(roomDetails);
//     } catch (err) {
//       console.error("❌ Failed to fetch room details:", err);
//       toast.error("Failed to load room details");
//     } finally {
//       setRoomsLoading(false);
//     }
//   };

//   // Fetch checklists on component mount
//   useEffect(() => {
//     console.log("🚀 useEffect triggered with:", { projectId, flatId });

//     const fetchChecklists = async () => {
//       if (!projectId || !flatId) {
//         console.error("❌ Missing required data:", { projectId, flatId });
//         setError("Missing project or flat information");
//         setLoading(false);
//         return;
//       }

//       console.log("📡 Starting API call...");

//       try {
//         setLoading(true);
//         setError(null);

//         const token = localStorage.getItem("ACCESS_TOKEN");
//         console.log("🔑 Token exists:", !!token);

//         const apiUrl = "/initializer-accessible-checklists/";
//         const params = {
//           project_id: projectId,
//           flat_id: flatId,
//         };

//         console.log("📤 Making request to:", apiUrl);
//         console.log("📤 With params:", params);
//         console.log("📤 With headers:", {
//           Authorization: token ? "Bearer [TOKEN_EXISTS]" : "NO_TOKEN",
//           "Content-Type": "application/json",
//         });

//         const response = await checklistInstance.get(apiUrl, {
//           params: params,
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//           timeout: 10000,
//         });

//         console.log("📥 Response status:", response.status);
//         console.log("📥 Response headers:", response.headers);
//         console.log("📥 Full response object:", response);

//         if (response.status === 200) {
//           const data = response.data || [];
//           console.log("✅ Raw API Response:", data);
//           console.log("📦 Response type:", typeof data);
//           console.log("📦 Is Array:", Array.isArray(data));
//           console.log("📦 Number of rooms:", data.length);

//           if (Array.isArray(data) && data.length > 0) {
//             data.forEach((room, index) => {
//               console.log(`🏠 Room ${index + 1}:`, {
//                 room_id: room.room_id,
//                 count: room.count,
//                 checklists_count: room.checklists?.length || 0,
//               });
//             });
//           } else {
//             console.log("⚠️ Data is empty or not an array");
//           }

//           setChecklistData(data);

//           // Extract unique room IDs from the response
//           const roomIds = [
//             ...new Set(data.map((item) => item.room_id).filter(Boolean)),
//           ];
//           console.log("🔑 Extracted room IDs:", roomIds);

//           if (roomIds.length > 0) {
//             fetchRoomDetails(roomIds);
//           } else {
//             console.log("⚠️ No room IDs found to fetch details");
//           }
//         } else {
//           console.error("❌ Unexpected status code:", response.status);
//           throw new Error(`Failed to fetch checklists: ${response.status}`);
//         }
//       } catch (err) {
//         console.error("❌ API Error:", err);
//         console.error("❌ Error message:", err.message);
//         console.error("❌ Error response:", err.response?.data);
//         console.error("❌ Error status:", err.response?.status);

//         setError(err.message || "Failed to fetch checklist data");
//         toast.error("Failed to load checklists");
//         setChecklistData([]);
//       } finally {
//         console.log("🏁 API call completed");
//         setLoading(false);
//       }
//     };

//     fetchChecklists();
//   }, [projectId, flatId]);

//   // Get status color and badge
//   const getStatusBadge = (status) => {
//     const statusConfig = {
//       completed: {
//         bg: "bg-green-100",
//         text: "text-green-800",
//         label: "Completed",
//       },
//       in_progress: {
//         bg: "bg-yellow-100",
//         text: "text-yellow-800",
//         label: "In Progress",
//       },
//       not_started: {
//         bg: "bg-gray-100",
//         text: "text-gray-800",
//         label: "Not Started",
//       },
//       on_hold: { bg: "bg-red-100", text: "text-red-800", label: "On Hold" },
//     };

//     const config = statusConfig[status] || statusConfig.not_started;
//     return (
//       <span
//         className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
//       >
//         {config.label}
//       </span>
//     );
//   };

//   // Calculate statistics from the new data structure
//   const stats = React.useMemo(() => {
//     console.log("🔍 Calculating stats from checklistData:", checklistData);

//     const allItems = checklistData.flatMap(
//       (room) =>
//         room.checklists?.flatMap((checklist) => checklist.items || []) || []
//     );

//     console.log("📊 All items found:", allItems.length);

//     const total = allItems.length;
//     const completed = allItems.filter(
//       (item) => item.status === "completed"
//     ).length;
//     const inProgress = allItems.filter(
//       (item) => item.status === "in_progress"
//     ).length;
//     const notStarted = allItems.filter(
//       (item) => item.status === "not_started"
//     ).length;

//     const stats = {
//       total,
//       completed,
//       inProgress,
//       notStarted,
//       completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
//     };

//     console.log("📈 Calculated stats:", stats);
//     return stats;
//   }, [checklistData]);

//   const handleBack = () => {
//     navigate(-1);
//   };

//   const toggleItemExpansion = (checklistId, itemId) => {
//     const key = `${checklistId}-${itemId}`;
//     setExpandedItems((prev) => ({
//       ...prev,
//       [key]: !prev[key],
//     }));
//   };

//   const handleRoomClick = (room) => {
//     setSelectedRoom(room);
//     setShowRoomsModal(true);
//   };

//   if (loading) {
//     return (
//       <div className={`flex ${currentTheme.pageBg} min-h-screen`}>
//         <SiteBarHome />
//         <div className="ml-[220px] p-8 flex items-center justify-center">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
//             <p className={`${currentTheme.textPrimary} text-lg`}>
//               Loading inspection data...
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className={`flex ${currentTheme.pageBg} min-h-screen`}>
//         <SiteBarHome />
//         <div className="ml-[220px] p-8 flex items-center justify-center">
//           <div
//             className={`${currentTheme.cardBg} border rounded-lg p-8 text-center max-w-md`}
//           >
//             <div className="text-red-500 text-4xl mb-4">⚠️</div>
//             <h3
//               className={`${currentTheme.textPrimary} text-lg font-semibold mb-2`}
//             >
//               Error Loading Data
//             </h3>
//             <p className={currentTheme.textSecondary}>{error}</p>
//             <div className="flex gap-2 mt-4">
//               <button
//                 onClick={() => window.location.reload()}
//                 className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
//               >
//                 Retry
//               </button>
//               <button
//                 onClick={handleBack}
//                 className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
//               >
//                 Go Back
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={`flex ${currentTheme.pageBg} min-h-screen`}>
//       <SiteBarHome />
//       <main className="flex-1 ml-[220px] py-6 px-6 w-full min-w-0">
//         {/* Header Section */}
//         <div
//           className={`${currentTheme.cardBg} border rounded-xl p-6 mb-6 shadow-lg`}
//         >
//           <div className="flex items-center justify-between mb-4">
//             <div>
//               <h1 className={`text-2xl font-bold ${currentTheme.accent} mb-2`}>
//                 Unit {flatNumber} Inspection
//               </h1>
//               <div className="flex items-center gap-4 text-sm">
//                 <span className={currentTheme.textSecondary}>
//                   Type: {flatType || "N/A"}
//                 </span>
//                 <span className={currentTheme.textSecondary}>
//                   Unit ID: {flatId}
//                 </span>
//                 <span className={currentTheme.textSecondary}>
//                   Project ID: {projectId}
//                 </span>
//               </div>
//             </div>
//             <div className="flex gap-2">
//               {rooms.length > 0 && (
//                 <button
//                   onClick={() => setShowRoomsModal(true)}
//                   className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
//                   disabled={roomsLoading}
//                 >
//                   {roomsLoading ? "Loading..." : "View Rooms"}
//                 </button>
//               )}
//               <button
//                 onClick={handleBack}
//                 className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
//               >
//                 ← Back
//               </button>
//             </div>
//           </div>

//           {/* Statistics Cards */}
//           <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
//             <div className="bg-blue-50 rounded-lg p-3 text-center">
//               <div className="text-2xl font-bold text-blue-700">
//                 {stats.total}
//               </div>
//               <div className="text-xs text-blue-600">Total</div>
//             </div>
//             <div className="bg-green-50 rounded-lg p-3 text-center">
//               <div className="text-2xl font-bold text-green-700">
//                 {stats.completed}
//               </div>
//               <div className="text-xs text-green-600">Completed</div>
//             </div>
//             <div className="bg-yellow-50 rounded-lg p-3 text-center">
//               <div className="text-2xl font-bold text-yellow-700">
//                 {stats.inProgress}
//               </div>
//               <div className="text-xs text-yellow-600">In Progress</div>
//             </div>
//             <div className="bg-gray-50 rounded-lg p-3 text-center">
//               <div className="text-2xl font-bold text-gray-700">
//                 {stats.notStarted}
//               </div>
//               <div className="text-xs text-gray-600">Not Started</div>
//             </div>
//             <div className="bg-indigo-50 rounded-lg p-3 text-center">
//               <div className="text-2xl font-bold text-indigo-700">
//                 {stats.completionRate}%
//               </div>
//               <div className="text-xs text-indigo-600">Complete</div>
//             </div>
//           </div>
//         </div>

//         {/* Room-wise Checklists Section */}
//         <div
//           className={`${currentTheme.cardBg} border rounded-xl p-6 shadow-lg`}
//         >
//           <h2
//             className={`text-xl font-semibold ${currentTheme.textPrimary} mb-4`}
//           >
//             Room Inspection Checklists
//           </h2>

//           {checklistData.length === 0 ? (
//             <div className="text-center py-12">
//               <div className="text-6xl mb-4">📋</div>
//               <h3
//                 className={`${currentTheme.textPrimary} text-lg font-semibold mb-2`}
//               >
//                 No Checklists Found
//               </h3>
//               <p className={currentTheme.textSecondary}>
//                 No inspection checklists are available for this unit.
//               </p>
//             </div>
//           ) : (
//             <div className="space-y-6">
//               {checklistData.map((roomData) => {
//                 const roomDetail = rooms.find((r) => r.id === roomData.room_id);
//                 return (
//                   <div key={roomData.room_id} className="border rounded-lg p-4">
//                     {/* Room Header */}
//                     <div
//                       className={`${currentTheme.headerBg} border rounded-lg p-4 mb-4 cursor-pointer hover:shadow-md transition-all`}
//                       onClick={() => roomDetail && handleRoomClick(roomDetail)}
//                     >
//                       <div className="flex justify-between items-center">
//                         <div>
//                           <h3
//                             className={`text-lg font-semibold ${currentTheme.textPrimary}`}
//                           >
//                             {roomDetail?.rooms || `Room ${roomData.room_id}`}
//                           </h3>
//                           <p
//                             className={`${currentTheme.textSecondary} text-sm`}
//                           >
//                             {roomData.count} checklist
//                             {roomData.count !== 1 ? "s" : ""} •
//                             {roomDetail
//                               ? ` ${roomDetail.rooms}`
//                               : " Click to load details"}
//                           </p>
//                         </div>
//                         <div className="text-right">
//                           <div
//                             className={`text-sm ${currentTheme.textSecondary}`}
//                           >
//                             Room ID: {roomData.room_id}
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Checklists for this room */}
//                     <div className="space-y-4 ml-4">
//                       {roomData.checklists.map((checklist) => (
//                         <div
//                           key={checklist.id}
//                           className={`${currentTheme.cardBg} border rounded-lg p-4`}
//                         >
//                           <div className="flex items-start justify-between mb-3">
//                             <div className="flex-1">
//                               <h4
//                                 className={`font-semibold ${currentTheme.textPrimary} mb-1`}
//                               >
//                                 {checklist.name}
//                               </h4>
//                               {checklist.description && (
//                                 <p
//                                   className={`${currentTheme.textSecondary} text-sm mb-2`}
//                                 >
//                                   {checklist.description}
//                                 </p>
//                               )}
//                             </div>
//                             {getStatusBadge(checklist.status)}
//                           </div>

//                           {/* Checklist Items */}
//                           {checklist.items && checklist.items.length > 0 && (
//                             <div className="mt-4">
//                               <h5
//                                 className={`${currentTheme.textPrimary} font-medium text-sm mb-3`}
//                               >
//                                 Inspection Items ({checklist.items.length})
//                               </h5>
//                               <div className="space-y-2">
//                                 {checklist.items.map((item) => {
//                                   const isExpanded =
//                                     expandedItems[`${checklist.id}-${item.id}`];
//                                   return (
//                                     <div
//                                       key={item.id}
//                                       className={`${currentTheme.headerBg} border rounded-lg p-3`}
//                                     >
//                                       <div
//                                         className="flex justify-between items-center cursor-pointer"
//                                         onClick={() =>
//                                           toggleItemExpansion(
//                                             checklist.id,
//                                             item.id
//                                           )
//                                         }
//                                       >
//                                         <div className="flex-1">
//                                           <h6
//                                             className={`${currentTheme.textPrimary} font-medium text-sm`}
//                                           >
//                                             {item.title}
//                                           </h6>
//                                           <div className="flex items-center gap-4 mt-1 text-xs">
//                                             {getStatusBadge(item.status)}
//                                             {item.photo_required && (
//                                               <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
//                                                 📷 Photo Required
//                                               </span>
//                                             )}
//                                           </div>
//                                         </div>
//                                         <div
//                                           className={`${currentTheme.textSecondary} text-sm`}
//                                         >
//                                           {isExpanded ? "▼" : "▶"}
//                                         </div>
//                                       </div>

//                                       {/* Expanded Item Details */}
//                                       {isExpanded && (
//                                         <div className="mt-3 pt-3 border-t border-gray-200">
//                                           <p
//                                             className={`${currentTheme.textSecondary} text-sm mb-3`}
//                                           >
//                                             {item.description}
//                                           </p>

//                                           {/* Options */}
//                                           <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
//                                             {item.options.map((option) => (
//                                               <div
//                                                 key={option.id}
//                                                 className={`p-2 rounded border cursor-pointer transition-colors ${
//                                                   option.choice === "P"
//                                                     ? "bg-green-50 border-green-200 hover:bg-green-100"
//                                                     : "bg-red-50 border-red-200 hover:bg-red-100"
//                                                 }`}
//                                               >
//                                                 <div className="flex items-center justify-between">
//                                                   <span
//                                                     className={`text-sm font-medium ${
//                                                       option.choice === "P"
//                                                         ? "text-green-800"
//                                                         : "text-red-800"
//                                                     }`}
//                                                   >
//                                                     {option.name}
//                                                   </span>
//                                                   <span
//                                                     className={`text-xs px-2 py-1 rounded ${
//                                                       option.choice === "P"
//                                                         ? "bg-green-200 text-green-800"
//                                                         : "bg-red-200 text-red-800"
//                                                     }`}
//                                                   >
//                                                     {option.choice === "P"
//                                                       ? "Pass"
//                                                       : "Fail"}
//                                                   </span>
//                                                 </div>
//                                               </div>
//                                             ))}
//                                           </div>
//                                         </div>
//                                       )}
//                                     </div>
//                                   );
//                                 })}
//                               </div>
//                             </div>
//                           )}

//                           {/* Checklist Metadata */}
//                           <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
//                             <div>
//                               <span
//                                 className={`${currentTheme.textSecondary} font-medium`}
//                               >
//                                 Purpose:
//                               </span>
//                               <span
//                                 className={`${currentTheme.textPrimary} ml-1`}
//                               >
//                                 {checklist.purpose_id}
//                               </span>
//                             </div>
//                             <div>
//                               <span
//                                 className={`${currentTheme.textSecondary} font-medium`}
//                               >
//                                 Category:
//                               </span>
//                               <span
//                                 className={`${currentTheme.textPrimary} ml-1`}
//                               >
//                                 {checklist.category}
//                               </span>
//                             </div>
//                             <div>
//                               <span
//                                 className={`${currentTheme.textSecondary} font-medium`}
//                               >
//                                 Created:
//                               </span>
//                               <span
//                                 className={`${currentTheme.textPrimary} ml-1`}
//                               >
//                                 {new Date(
//                                   checklist.created_at
//                                 ).toLocaleDateString()}
//                               </span>
//                             </div>
//                             <div>
//                               <span
//                                 className={`${currentTheme.textSecondary} font-medium`}
//                               >
//                                 Updated:
//                               </span>
//                               <span
//                                 className={`${currentTheme.textPrimary} ml-1`}
//                               >
//                                 {new Date(
//                                   checklist.updated_at
//                                 ).toLocaleDateString()}
//                               </span>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>

//         {/* Rooms Modal */}
//         {showRoomsModal && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//             <div
//               className={`${currentTheme.cardBg} border rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto`}
//             >
//               <div className="flex justify-between items-center mb-4">
//                 <h2
//                   className={`text-xl font-semibold ${currentTheme.textPrimary}`}
//                 >
//                   {selectedRoom
//                     ? `${selectedRoom.rooms} Details`
//                     : "Project Rooms"}
//                 </h2>
//                 <button
//                   onClick={() => {
//                     setShowRoomsModal(false);
//                     setSelectedRoom(null);
//                   }}
//                   className="text-gray-500 hover:text-gray-700 text-2xl"
//                 >
//                   ×
//                 </button>
//               </div>

//               {selectedRoom ? (
//                 // Single room details
//                 <div
//                   className={`${currentTheme.headerBg} border rounded-lg p-6`}
//                 >
//                   <h3
//                     className={`text-lg font-semibold ${currentTheme.textPrimary} mb-4`}
//                   >
//                     {selectedRoom.rooms}
//                   </h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//                     <div>
//                       <span
//                         className={`${currentTheme.textSecondary} font-medium`}
//                       >
//                         Room Type:
//                       </span>
//                       <span className={`${currentTheme.textPrimary} ml-2`}>
//                         {selectedRoom.room_type || "N/A"}
//                       </span>
//                     </div>
//                     <div>
//                       <span
//                         className={`${currentTheme.textSecondary} font-medium`}
//                       >
//                         Capacity:
//                       </span>
//                       <span className={`${currentTheme.textPrimary} ml-2`}>
//                         {selectedRoom.capacity || "N/A"}
//                       </span>
//                     </div>
//                     <div>
//                       <span
//                         className={`${currentTheme.textSecondary} font-medium`}
//                       >
//                         Location:
//                       </span>
//                       <span className={`${currentTheme.textPrimary} ml-2`}>
//                         {selectedRoom.location || "N/A"}
//                       </span>
//                     </div>
//                     <div>
//                       <span
//                         className={`${currentTheme.textSecondary} font-medium`}
//                       >
//                         Room ID:
//                       </span>
//                       <span className={`${currentTheme.textPrimary} ml-2`}>
//                         {selectedRoom.id}
//                       </span>
//                     </div>
//                   </div>
//                   {selectedRoom.description && (
//                     <div className="mt-4">
//                       <span
//                         className={`${currentTheme.textSecondary} font-medium`}
//                       >
//                         Description:
//                       </span>
//                       <p className={`${currentTheme.textPrimary} mt-1`}>
//                         {selectedRoom.description}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 // All rooms grid
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                   {rooms.map((room) => (
//                     <div
//                       key={room.id}
//                       onClick={() => setSelectedRoom(room)}
//                       className={`${currentTheme.headerBg} border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all hover:scale-105`}
//                     >
//                       <h3
//                         className={`font-semibold ${currentTheme.textPrimary} mb-2`}
//                       >
//                         {room.rooms || `Room ${room.id}`}
//                       </h3>
//                       <div className="space-y-1 text-sm">
//                         <p className={currentTheme.textSecondary}>
//                           Type: {room.room_type || "N/A"}
//                         </p>
//                         <p className={currentTheme.textSecondary}>
//                           Capacity: {room.capacity || "N/A"}
//                         </p>
//                         <p className={currentTheme.textSecondary}>
//                           Location: {room.location || "N/A"}
//                         </p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Footer */}
//         <div className="mt-6 text-center">
//           <p className={`${currentTheme.textSecondary} text-sm`}>
//             Last updated: {new Date().toLocaleString()}
//           </p>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default FlatInspectionPage;


import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import SiteBarHome from "./SiteBarHome";
import { useTheme } from "../ThemeContext";
import axios from "axios";
import toast from "react-hot-toast";
import { checklistInstance, projectInstance } from '../api/axiosInstance';

// Helper function to get current user role
const getCurrentUserRole = () => {
    try {
        const userString = localStorage.getItem("USER_DATA");
        const accessString = localStorage.getItem("ACCESSES");

        if (!userString || userString === "undefined") return null;

        const userData = JSON.parse(userString);
        let accesses = [];

        if (accessString && accessString !== "undefined") {
            try {
                accesses = JSON.parse(accessString);
            } catch {
                accesses = [];
            }
        }

        let allRoles = [];
        if (Array.isArray(accesses)) {
            accesses.forEach((access) => {
                if (access.roles && Array.isArray(access.roles)) {
                    access.roles.forEach((role) => {
                        const roleStr = typeof role === "string" ? role : role?.role;
                        if (roleStr && !allRoles.includes(roleStr)) {
                            allRoles.push(roleStr);
                        }
                    });
                }
            });
        }

        // Check for workflow roles in priority order
        if (allRoles.includes('CHECKER')) return 'CHECKER';
        if (allRoles.includes('Checker')) return 'CHECKER';
        if (allRoles.includes('SUPERVISOR')) return 'SUPERVISOR';
        if (allRoles.includes('Supervisor')) return 'SUPERVISOR';
        if (allRoles.includes('MAKER')) return 'MAKER';
        if (allRoles.includes('Maker')) return 'MAKER';
        if (allRoles.includes('Intializer')) return 'INITIALIZER';
        if (allRoles.includes('INITIALIZER')) return 'INITIALIZER';

        // Admin fallback
        if (userData?.superadmin || userData?.is_staff) return 'CHECKER';
        if (userData?.is_client) return 'SUPERVISOR';
        if (userData?.is_manager) return 'SUPERVISOR';
        if (allRoles.includes('ADMIN')) return 'SUPERVISOR';

        return null;
    } catch (error) {
        console.error("Error getting user role:", error);
        return null;
    }
};

const FlatInspectionPage = () => {
    const { theme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const { flatId } = useParams();

    // Get data from navigation state
    const { projectId, flatNumber, flatType } = location.state || {};

    // State management
    const [checklistData, setChecklistData] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roomsLoading, setRoomsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showRoomsModal, setShowRoomsModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [expandedItems, setExpandedItems] = useState({});
    const [userRole, setUserRole] = useState(null);
    const [paginationInfo, setPaginationInfo] = useState({
        count: 0,
        next: null,
        previous: null
    });

    // New states for initialization
    const [initializingChecklists, setInitializingChecklists] = useState(new Set());
    const [selectedForBulk, setSelectedForBulk] = useState(new Set());
    const [bulkInitializing, setBulkInitializing] = useState(false);

    // Add these new states for MAKER modal
    const [showMakerModal, setShowMakerModal] = useState(false);
    const [selectedItemForMaker, setSelectedItemForMaker] = useState(null);
    const [makerRemark, setMakerRemark] = useState('');
    const [makerPhotos, setMakerPhotos] = useState([]);
    const [submittingMaker, setSubmittingMaker] = useState(false);
    // History modal states
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedItemForHistory, setSelectedItemForHistory] = useState(null);

    // Tab management for INITIALIZER dashboard
    const [activeTab, setActiveTab] = useState('ready-to-start');
    const [tabData, setTabData] = useState({
        'ready-to-start': [],
        'actively-working': [],
        'finished-items': []
    });

    const [tabLoading, setTabLoading] = useState({
        'ready-to-start': false,
        'actively-working': false,
        'finished-items': false
    });

    // MAKER tab states
    const [makerActiveTab, setMakerActiveTab] = useState('available-work');
    const [makerTabData, setMakerTabData] = useState({
        'available-work': [],
        'my-assignments': []
    });
    const [makerTabLoading, setMakerTabLoading] = useState({
        'available-work': false,
        'my-assignments': false
    });

    // Enhanced Theme Configuration
    const ORANGE = "#ffbe63";
    const BG_OFFWHITE = "#fcfaf7";
    const bgColor = theme === "dark" ? "#191922" : BG_OFFWHITE;
    const cardColor = theme === "dark" ? "#23232c" : "#fff";
    const borderColor = ORANGE;
    const textColor = theme === "dark" ? "#fff" : "#222";
    const iconColor = ORANGE;



    // const updateChecklistAfterInitialization = (checklistId, delay = 0) => {
    //     // Add whoosh animation first
    //     const checklistElement = document.querySelector(`[data-checklist-id="${checklistId}"]`);
    //     if (checklistElement) {
    //         setTimeout(() => {
    //             checklistElement.classList.add('whoosh-out');
    //         }, delay);
    //     }

    //     // Update tab data after animation
    //     setTimeout(() => {
    //         if (userRole === 'INITIALIZER') {
    //             // Remove from 'ready-to-start' tab
    //             setTabData(prev => ({
    //                 ...prev,
    //                 'ready-to-start': prev['ready-to-start'].map(roomData => ({
    //                     ...roomData,
    //                     checklists: roomData.checklists?.filter(checklist => checklist.id !== checklistId) || []
    //                 }))
    //             }));

    //             // Auto-switch to actively-working tab and refresh it
    //             setTimeout(() => {
    //                 handleTabSwitch('actively-working');
    //             }, 200);
    //         } else {
    //             // For other roles, use existing logic
    //             setChecklistData(prevData =>
    //                 prevData.map(roomData => ({
    //                     ...roomData,
    //                     assigned_to_me: roomData.assigned_to_me?.map(checklist =>
    //                         checklist.id === checklistId
    //                             ? { ...checklist, status: "in_progress" }
    //                             : checklist
    //                     ) || [],
    //                     available_for_me: roomData.available_for_me?.map(checklist =>
    //                         checklist.id === checklistId
    //                             ? { ...checklist, status: "in_progress" }
    //                             : checklist
    //                     ) || []
    //                 }))
    //             );
    //         }
    //     }, delay + 500);
    // };

    // Bulk update function


    const updateChecklistAfterInitialization = (checklistId, delay = 0) => {
        // Add whoosh animation first
        const checklistElement = document.querySelector(`[data-checklist-id="${checklistId}"]`);
        if (checklistElement) {
            setTimeout(() => {
                checklistElement.classList.add('whoosh-out');
            }, delay);
        }

        // Update tab data after animation
        setTimeout(() => {
            if (userRole === 'INITIALIZER') {
                // Remove from 'ready-to-start' tab
                setTabData(prev => ({
                    ...prev,
                    'ready-to-start': prev['ready-to-start'].map(roomData => ({
                        ...roomData,
                        checklists: roomData.checklists?.filter(checklist => checklist.id !== checklistId) || []
                    }))
                }));

                // Force refresh the actively-working tab to show the moved item
                setTimeout(async () => {
                    await fetchTabData('actively-working');
                    // Auto-switch to actively-working tab
                    setActiveTab('actively-working');
                }, 500);
            } else {
                // For other roles, use existing logic
                setChecklistData(prevData =>
                    prevData.map(roomData => ({
                        ...roomData,
                        assigned_to_me: roomData.assigned_to_me?.map(checklist =>
                            checklist.id === checklistId
                                ? { ...checklist, status: "in_progress" }
                                : checklist
                        ) || [],
                        available_for_me: roomData.available_for_me?.map(checklist =>
                            checklist.id === checklistId
                                ? { ...checklist, status: "in_progress" }
                                : checklist
                        ) || []
                    }))
                );
            }
        }, delay + 500);
    };


    const updateMultipleChecklists = (checklistIds) => {
        checklistIds.forEach((checklistId, index) => {
            updateChecklistAfterInitialization(checklistId, index * 100); // Stagger animations
        });
    };


    const themeConfig = {
        pageBg: bgColor,
        cardBg: cardColor,
        textPrimary: textColor,
        textSecondary: theme === "dark" ? "#a0a0a0" : "#666",
        accent: ORANGE,
        border: borderColor,
        icon: iconColor,
        headerBg: theme === "dark" ? "#2a2a35" : "#f8f6f3",
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
    };
    // Tab configuration for INITIALIZER
    const initializerTabs = [
        {
            key: 'ready-to-start',
            label: 'Ready to Start',
            icon: '',
            color: themeConfig.accent, // Use orange from theme
            description: 'Items waiting for initialization',
            apiStatus: 'not_started'
        },
        {
            key: 'actively-working',
            label: 'Actively Working',
            icon: '',
            color: themeConfig.warning, // Use theme warning color
            description: 'Items currently in progress',
            apiStatus: 'in_progress'
        },
        {
            key: 'finished-items',
            label: 'Finished Items',
            icon: '',
            color: themeConfig.textSecondary, // Use theme secondary color instead of green
            description: 'Completed workflow items',
            apiStatus: 'completed'
        }
    ];

    // Tab configuration for MAKER
    const makerTabs = [
        {
            key: 'available-work',
            label: 'Available Work',
            icon: '📋',
            color: themeConfig.accent,
            description: 'New items ready for work',
            dataSource: 'available_for_me'
        },
        {
            key: 'my-assignments',
            label: 'My Assignments',
            icon: '🔧',
            color: themeConfig.warning,
            description: 'Items assigned to me / rework',
            dataSource: 'assigned_to_me'
        }
    ];

    // Fetch data for specific tab
    const fetchTabData = async (tabKey) => {
        const tabConfig = initializerTabs.find(tab => tab.key === tabKey);
        if (!tabConfig) return;

        setTabLoading(prev => ({ ...prev, [tabKey]: true }));

        try {
            const token = localStorage.getItem("ACCESS_TOKEN");
            const apiUrl = '/Transafer-Rule-getchchklist/';
            const params = {
                project_id: projectId,
                flat_id: flatId,
                status: tabConfig.apiStatus
            };

            console.log(`🔍 FETCHING TAB DATA - Tab: ${tabKey}, Status: ${tabConfig.apiStatus}`);

            const response = await checklistInstance.get(apiUrl, {
                params: params,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                timeout: 10000,
            });

            if (response.status === 200) {
                const responseData = response.data || {};
                let data = responseData.results || responseData || [];

                if (!Array.isArray(data)) {
                    data = [data];
                }

                setTabData(prev => ({
                    ...prev,
                    [tabKey]: data
                }));

                console.log(`✅ TAB DATA LOADED - Tab: ${tabKey}, Count: ${data.length}`);
            }
        } catch (err) {
            console.error(`❌ Failed to fetch tab data for ${tabKey}:`, err);
            toast.error(`Failed to load ${tabConfig.label}`, {
                style: { background: themeConfig.error, color: 'white', borderRadius: '12px' }
            });
        } finally {
            setTabLoading(prev => ({ ...prev, [tabKey]: false }));
        }
    };

    // Handle tab switching with on-demand loading
    const handleTabSwitch = async (tabKey) => {
        setActiveTab(tabKey);

        // Load data if not already loaded
        if (!tabData[tabKey] || tabData[tabKey].length === 0) {
            await fetchTabData(tabKey);
        }
    };

    // ADD THIS RIGHT AFTER updateMultipleChecklists function
    const additionalStyles = `
.whoosh-out {
    animation: whooshOut 0.5s ease-in-out forwards;
    transform-origin: center;
}

@keyframes whooshOut {
    0% {
        opacity: 1;
        transform: scale(1) translateX(0);
    }
    50% {
        opacity: 0.7;
        transform: scale(1.05) translateX(10px);
    }
    100% {
        opacity: 0;
        transform: scale(0.8) translateX(100px);
        height: 0;
        margin: 0;
        padding: 0;
    }
}

.checklist-card {
    transition: all 0.3s ease;
}
`;

    useEffect(() => {
        const styleElement = document.createElement('style');
        styleElement.innerHTML = additionalStyles;
        document.head.appendChild(styleElement);

        return () => {
            document.head.removeChild(styleElement);
        };
    }, []);


    // Initialize single checklist
    const handleInitializeChecklist = async (checklistId) => {
        setInitializingChecklists(prev => new Set([...prev, checklistId]));

        try {
            const token = localStorage.getItem("ACCESS_TOKEN");

            console.log("📡 API CALL: handleInitializeChecklist - Request URL:", `/start-checklist/${checklistId}/`);
            console.log("📡 API CALL: handleInitializeChecklist - Checklist ID:", checklistId);

            const response = await checklistInstance.post(
                `/start-checklist/${checklistId}/`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            console.log("📡 API RESPONSE: handleInitializeChecklist - Response:", response.data);
            console.log("📡 API RESPONSE: handleInitializeChecklist - Status:", response.status);

            if (response.status === 200) {
                // Immediate UI update with whoosh effect
                updateChecklistAfterInitialization(checklistId);

                // toast.success(
                //     `✅ Checklist initialized successfully! ${response.data.items_updated_count} items updated.`,
                //     {
                //         duration: 4000,
                //         style: {
                //             background: themeConfig.success,
                //             color: 'white',
                //             borderRadius: '12px',
                //             padding: '16px',
                //         },
                //     }
                // );
                setTimeout(() => {
                    fetchTabData(activeTab);
                }, 1000);
            }
        } catch (err) {
            console.error("❌ Failed to initialize checklist:", err);
            const errorMessage = err.response?.data?.error || "Failed to initialize checklist";

            toast.error(`❌ ${errorMessage}`, {
                duration: 4000,
                style: {
                    background: themeConfig.error,
                    color: 'white',
                    borderRadius: '12px',
                    padding: '16px',
                },
            });
        } finally {
            setInitializingChecklists(prev => {
                const newSet = new Set(prev);
                newSet.delete(checklistId);
                return newSet;
            });
        }
    };

    // Initialize multiple checklists
    const handleBulkInitialize = async () => {
        if (selectedForBulk.size === 0) {
            toast.error("Please select at least one checklist to initialize", {
                style: { background: themeConfig.warning, color: 'white', borderRadius: '12px' }
            });
            return;
        }

        setBulkInitializing(true);
        const selectedIds = Array.from(selectedForBulk);
        let successCount = 0;
        let failCount = 0;

        try {
            // Process each checklist sequentially for better UX
            for (const checklistId of selectedIds) {
                try {
                    const token = localStorage.getItem("ACCESS_TOKEN");

                    const response = await checklistInstance.post(
                        `/start-checklist/${checklistId}/`,
                        {},
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        }
                    );

                    if (response.status === 200) {
                        successCount++;
                        // Update the checklist data in real-time
                        setChecklistData(prevData =>
                            prevData.map(roomData => ({
                                ...roomData,
                                checklists: roomData.checklists.map(checklist =>
                                    checklist.id === checklistId
                                        ? { ...checklist, status: "in_progress" }
                                        : checklist
                                )
                            }))
                        );
                    }
                } catch (err) {
                    failCount++;
                    console.error(`Failed to initialize checklist ${checklistId}:`, err);
                }
            }

            // Show summary toast
            if (successCount > 0) {
                // Get successfully initialized checklist IDs
                const successfulIds = Array.from(selectedForBulk).slice(0, successCount);

                // Apply whoosh effect to all successful items
                updateMultipleChecklists(successfulIds);

                // Show summary toast
                if (failCount === 0) {
                    toast.success(`🎉 All ${successCount} checklists initialized successfully!`, {
                        duration: 5000,
                        style: { background: themeConfig.success, color: 'white', borderRadius: '12px', padding: '16px' }
                    });
                } else {
                    toast.success(`⚠️ ${successCount} checklists initialized, ${failCount} failed.`, {
                        duration: 5000,
                        style: { background: themeConfig.warning, color: 'white', borderRadius: '12px', padding: '16px' }
                    });
                }

                // Clear selection after animation
                setTimeout(() => {
                    setSelectedForBulk(new Set());
                }, 1000);
            } else {
                toast.error("❌ Failed to initialize all selected checklists.", {
                    duration: 4000,
                    style: { background: themeConfig.error, color: 'white', borderRadius: '12px', padding: '16px' }
                });
            }

        } finally {
            setBulkInitializing(false);
        }
    };

    // Toggle checklist selection for bulk operations
    const toggleChecklistSelection = (checklistId) => {
        setSelectedForBulk(prev => {
            const newSet = new Set(prev);
            if (newSet.has(checklistId)) {
                newSet.delete(checklistId);
            } else {
                newSet.add(checklistId);
            }
            return newSet;
        });
    };

    // Select all not_started checklists
    const selectAllNotStarted = () => {
        const notStartedIds = userRole === 'INITIALIZER'
            ? (tabData['ready-to-start'] || [])
                .flatMap(roomData => roomData.checklists || [])
                .filter(checklist => checklist && checklist.status === "not_started")
                .map(checklist => checklist.id)
            : checklistData
                .flatMap(roomData => [
                    ...(roomData.assigned_to_me || []),
                    ...(roomData.available_for_me || [])
                ])
                .filter(checklist => checklist && checklist.status === "not_started")
                .map(checklist => checklist.id);

        setSelectedForBulk(new Set(notStartedIds));
    };

    // Get role-based action buttons
    const getRoleBasedActions = (checklist, item = null) => {
        if (!userRole) return null;

        switch (userRole) {
            case 'INITIALIZER':
                return getInitializeButton(checklist);

            case 'CHECKER':
                if (!item) return null;
                const isPreScreening = !item.submissions || item.submissions.length === 0;
                return (
                    <div className="flex gap-2">
                        <button
                            className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
                            style={{
                                background: themeConfig.success,
                                color: 'white'
                            }}
                        >
                            {isPreScreening ? 'Accept for Workflow' : 'Approve Final'}
                        </button>
                        <button
                            className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
                            style={{
                                background: themeConfig.error,
                                color: 'white'
                            }}
                        >
                            {isPreScreening ? 'Mark Complete' : 'Send for Rework'}
                        </button>
                    </div>
                );

            case 'SUPERVISOR':
                if (!item) {
                    return (
                        <button
                            onClick={() => {
                                // SUPERVISOR has different data structure - items are in available_for_me
                                // For SUPERVISOR, the checklist IS the item - it comes from available_for_me array
                                console.log("🔍 DEBUG: Full checklist object for SUPERVISOR:", checklist);
                                console.log("🔍 DEBUG: Checklist structure:", checklist);

                                // SUPERVISOR works with the checklist object directly, not checklist.items
                                const itemsForReview = checklist.pending_for_me || [];// The checklist itself is the reviewable item
                                console.log("🔍 DEBUG: All items for SUPERVISOR:", itemsForReview);
                                console.log("🔍 DEBUG: Item statuses for SUPERVISOR:", itemsForReview.map(item => item.status));

                                // For now, let SUPERVISOR review any item that's not completed
                                const filteredItems = itemsForReview.filter(item =>
                                    item.status !== 'completed' && item.status !== 'not_started'
                                );

                                setSelectedItemForMaker(checklist);
                                setShowMakerModal(true);
                                if (itemsForReview.length > 0) {
                                    setSelectedItemForMaker(itemsForReview[0]); // Reuse same modal state
                                    setShowMakerModal(true); // Reuse same modal
                                } else {
                                    toast.success("No items requiring your review in this checklist");
                                }
                            }}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                            style={{
                                background: themeConfig.warning,
                                color: 'white'
                            }}
                        >
                            Review MAKER Work
                        </button>
                    );
                }
                return (
                    <button
                        onClick={() => {
                            setSelectedItemForMaker(item);
                            setShowMakerModal(true);
                        }}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        style={{
                            background: themeConfig.warning,
                            color: 'white'
                        }}
                    >
                        Review Work
                    </button>
                );

            case 'MAKER':
                if (!item) {
                    // Show button at checklist level for MAKER
                    return (
                        <button
                            onClick={() => {
                                // Find items that need MAKER attention
                                // const itemsNeedingWork = checklist.items?.filter(item => 
                                //   item.status === 'pending_for_maker' || item.status === 'in_progress'
                                // ) || [];

                                // Since items array is empty, let's check if there are any items at all
                                const itemsNeedingWork = checklist.items || [];
                                console.log("🔍 DEBUG: All items for MAKER:", itemsNeedingWork);
                                console.log("🔍 DEBUG: Checklist object:", checklist);

                                // If no items in checklist.items, just open modal anyway for testing
                                if (itemsNeedingWork.length === 0) {
                                    // Create a mock item for testing
                                    const mockItem = {
                                        id: checklist.id,
                                        title: `Work on ${checklist.name}`,
                                        status: 'pending_for_maker',
                                        description: 'Complete work for this checklist'
                                    };
                                    setSelectedItemForMaker(mockItem);
                                    setShowMakerModal(true);
                                    return;
                                }


                                console.log("🔍 DEBUG: All items for MAKER:", itemsNeedingWork);
                                console.log("🔍 DEBUG: Item statuses:", itemsNeedingWork.map(item => item.status));

                                // For now, let MAKER work on any item that's not completed
                                const filteredItems = itemsNeedingWork.filter(item =>
                                    item.status !== 'completed'
                                );

                                if (itemsNeedingWork.length > 0) {
                                    setSelectedItemForMaker(itemsNeedingWork[0]);
                                    setShowMakerModal(true);
                                } else {
                                    toast.success("No items requiring your attention in this checklist");
                                }
                            }}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                            style={{
                                background: themeConfig.accent,
                                color: 'white'
                            }}
                        >
                            View Items to Complete
                        </button>
                    );
                }
                return (
                    <button
                        onClick={() => {
                            setSelectedItemForMaker(item);
                            setMakerRemark('');
                            setMakerPhotos([]);
                            setShowMakerModal(true);
                        }}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        style={{
                            background: themeConfig.accent,
                            color: 'white'
                        }}
                    >
                        Complete Work
                    </button>
                );
            default:
                return null;
        }
    };

    // Get initialization button component
    const getInitializeButton = (checklist) => {
        const isInitializing = initializingChecklists.has(checklist.id);
        const canInitialize = checklist.status === "not_started";
        const isSelected = selectedForBulk.has(checklist.id);

        if (!canInitialize) {
            return null;
        }

        return (
            <div className="flex items-center gap-2">
                {/* Bulk selection checkbox */}
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleChecklistSelection(checklist.id)}
                        className="w-4 h-4 rounded border-2 focus:ring-2"
                        style={{
                            accentColor: themeConfig.accent,
                            borderColor: themeConfig.border
                        }}
                    />
                </div>

                {/* Initialize button */}
                <button
                    onClick={() => handleInitializeChecklist(checklist.id)}
                    disabled={isInitializing}
                    className={`
            relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform
            ${isInitializing
                            ? 'opacity-75 cursor-not-allowed scale-95'
                            : 'hover:scale-105 hover:shadow-lg active:scale-95'
                        }
          `}
                    style={{
                        background: isInitializing
                            ? `linear-gradient(135deg, ${themeConfig.accent}80, ${themeConfig.accent}60)`
                            : `linear-gradient(135deg, ${themeConfig.accent}, ${themeConfig.accent}dd)`,
                        color: 'white',
                        border: `2px solid ${themeConfig.accent}`,
                        boxShadow: isInitializing ? 'none' : `0 4px 12px ${themeConfig.accent}30`,
                    }}
                >
                    {isInitializing ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Initializing...</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span>🚀</span>
                            <span>Initialize</span>
                        </div>
                    )}
                </button>
            </div>
        );
    };

    // Get bulk action bar
    const getBulkActionBar = () => {
        // Only show bulk actions for INITIALIZER role
        if (userRole !== 'INITIALIZER') {
            return null;
        }

        const notStartedChecklists = userRole === 'INITIALIZER'
            ? (tabData['ready-to-start'] || [])
                .flatMap(roomData => roomData.checklists || [])
                .filter(checklist => checklist && checklist.status === "not_started")
            : checklistData
                .flatMap(roomData => [
                    ...(roomData.assigned_to_me || []),
                    ...(roomData.available_for_me || [])
                ])
                .filter(checklist => checklist && checklist.status === "not_started");

        if (notStartedChecklists.length === 0) {
            return null;
        }

        // Handle photo upload for MAKER

        return (
            <div
                className="sticky top-0 z-10 p-4 rounded-xl mb-6 shadow-lg backdrop-blur-sm"
                style={{
                    background: `${themeConfig.cardBg}f0`,
                    border: `1px solid ${themeConfig.border}40`,
                }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={selectedForBulk.size === notStartedChecklists.length && notStartedChecklists.length > 0}
                                onChange={selectAllNotStarted}
                                className="w-5 h-5 rounded border-2 focus:ring-2"
                                style={{
                                    accentColor: themeConfig.accent,
                                    borderColor: themeConfig.border
                                }}
                            />
                            <span className="font-medium" style={{ color: themeConfig.textPrimary }}>
                                Select All ({notStartedChecklists.length} available)
                            </span>
                        </div>

                        {selectedForBulk.size > 0 && (
                            <span
                                className="px-3 py-1 rounded-full text-sm font-medium"
                                style={{
                                    background: `${themeConfig.accent}20`,
                                    color: themeConfig.accent
                                }}
                            >
                                {selectedForBulk.size} selected
                            </span>
                        )}
                    </div>

                    {selectedForBulk.size > 0 && (
                        <button
                            onClick={handleBulkInitialize}
                            disabled={bulkInitializing}
                            className={`
                px-6 py-2 rounded-lg font-medium transition-all duration-300 transform
                ${bulkInitializing
                                    ? 'opacity-75 cursor-not-allowed scale-95'
                                    : 'hover:scale-105 hover:shadow-lg active:scale-95'
                                }
              `}
                            style={{
                                background: bulkInitializing
                                    ? `linear-gradient(135deg, ${themeConfig.accent}80, ${themeConfig.accent}60)`
                                    : `linear-gradient(135deg, ${themeConfig.accent}, ${themeConfig.accent}dd)`,
                                color: 'white',
                                border: `2px solid ${themeConfig.accent}`,
                                boxShadow: bulkInitializing ? 'none' : `0 4px 16px ${themeConfig.accent}40`,
                            }}
                        >
                            {bulkInitializing ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Initializing {selectedForBulk.size} items...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span>🚀</span>
                                    <span>Initialize Selected ({selectedForBulk.size})</span>
                                </div>
                            )}
                        </button>
                    )}
                </div>
            </div>
        );
    };

    // Fetch room details
    const fetchRoomDetails = async (roomIds) => {
        if (!roomIds.length) {
            console.log("⚠️ No room IDs to fetch");
            return;
        }

        console.log("🔄 Fetching room details for IDs:", roomIds);
        console.log("📡 API CALL: fetchRoomDetails - Request payload:", { roomIds });
        setRoomsLoading(true);

        try {
            const token = localStorage.getItem("ACCESS_TOKEN");

            const roomPromises = roomIds.map(async (roomId) => {
                console.log(`📡 Fetching room ${roomId}`);
                const response = await projectInstance.get(
                    `/rooms/${roomId}/`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                return response.data;
            });

            const roomDetails = await Promise.all(roomPromises);
            console.log("🏠 Room details fetched:", roomDetails);
            console.log("📡 API RESPONSE: fetchRoomDetails - Response data:", roomDetails);
            setRooms(roomDetails);
        } catch (err) {
            console.error("❌ Failed to fetch room details:", err);
            toast.error("Failed to load room details");
        } finally {
            setRoomsLoading(false);
        }
    };

    // useEffect(() => {
    //     console.log("🚀 useEffect triggered with:", { projectId, flatId });

    //     const fetchChecklists = async () => {
    //         if (!projectId || !flatId) {
    //             console.error("❌ Missing required data:", { projectId, flatId });
    //             setError("Missing project or flat information");
    //             setLoading(false);
    //             return;
    //         }

    //         try {
    //             setLoading(true);
    //             setError(null);

    //             const token = localStorage.getItem("ACCESS_TOKEN");
    //             const detectedRole = getCurrentUserRole();
    //             setUserRole(detectedRole);

    //             console.log("🔍 ROLE DEBUG - Detected Role:", detectedRole);
    //             console.log("🔍 ROLE DEBUG - USER_DATA:", localStorage.getItem("USER_DATA"));
    //             console.log("🔍 ROLE DEBUG - ACCESSES:", localStorage.getItem("ACCESSES"));

    //             // Role-based API endpoints
    //             // Single endpoint - backend returns role-specific data
    //             const apiUrl = '/Transafer-Rule-getchchklist/';
    //             const params = { project_id: projectId, flat_id: flatId };

    //             console.log("🔍 User Role Detected:", detectedRole);
    //             console.log("📡 API Endpoint Selected:", apiUrl);
    //             console.log("📡 API CALL: fetchChecklists - Request URL:", apiUrl);
    //             console.log("📡 API CALL: fetchChecklists - Request params:", params);

    //             const response = await checklistInstance.get(apiUrl, {
    //                 params: params,
    //                 headers: {
    //                     Authorization: `Bearer ${token}`,
    //                     "Content-Type": "application/json",
    //                 },
    //                 timeout: 10000,
    //             });

    //             if (response.status === 200) {
    //                 const responseData = response.data || {};
    //                 console.log("📡 API RESPONSE: fetchChecklists - Response data:", responseData);
    //                 console.log("🔍 DATA DEBUG - Full Response Structure:", JSON.stringify(responseData, null, 2));
    //                 console.log("🔍 DATA DEBUG - Response Type:", typeof responseData);
    //                 console.log("🔍 DATA DEBUG - Is Array:", Array.isArray(responseData));
    //                 console.log("🔍 DATA DEBUG - Response Keys:", Object.keys(responseData));
    //                 console.log("📡 API RESPONSE: fetchChecklists - Response status:", response.status);

    //                 // Extract actual data from paginated response
    //                 // Extract actual data from paginated response
    //                 console.log("🔍 DEBUG: Full API Response for SUPERVISOR:", responseData);
    //                 console.log("🔍 DEBUG: responseData.results:", responseData.results);
    //                 console.log("🔍 DEBUG: Type of responseData:", typeof responseData);
    //                 console.log("🔍 DEBUG: Is responseData an array?", Array.isArray(responseData));

    //                 let data;
    //                 if (responseData.results && Array.isArray(responseData.results)) {
    //                     data = responseData.results;
    //                 } else if (Array.isArray(responseData)) {
    //                     data = responseData;
    //                 } else if (responseData && typeof responseData === 'object') {
    //                     // If it's an object, wrap it in an array
    //                     data = [responseData];
    //                 } else {
    //                     data = [];
    //                 }

    //                 console.log("🔍 DEBUG: Final processed data:", data);
    //                 console.log("🔍 DEBUG: Is final data an array?", Array.isArray(data));
    //                 console.log("📡 EXTRACTED DATA: Actual checklist data:", data);
    //                 console.log("📡 PAGINATION INFO: Count:", responseData.count, "Next:", responseData.next);

    //                 // Debug the structure for CHECKER role
    //                 console.log("🔍 DEBUG: First room data:", data[0]);
    //                 if (data[0] && data[0].checklists) {
    //                     console.log("🔍 DEBUG: First checklist:", data[0].checklists[0]);
    //                     if (data[0].checklists[0] && data[0].checklists[0].items) {
    //                         console.log("🔍 DEBUG: First item:", data[0].checklists[0].items[0]);
    //                     }
    //                 }


    //                 console.log("🔍 PROCESSED DEBUG - Final Data for Role:", detectedRole);
    //                 console.log("🔍 PROCESSED DEBUG - Data Length:", data.length);
    //                 console.log("🔍 PROCESSED DEBUG - First Item:", JSON.stringify(data[0], null, 2));
    //                 if (data[0]) {
    //                     console.log("🔍 PROCESSED DEBUG - First Item Keys:", Object.keys(data[0]));
    //                     console.log("🔍 PROCESSED DEBUG - Checklists:", data[0].checklists);
    //                     console.log("🔍 PROCESSED DEBUG - Assigned to Me:", data[0].assigned_to_me);
    //                     console.log("🔍 PROCESSED DEBUG - Available for Me:", data[0].available_for_me);
    //                     console.log("🔍 PROCESSED DEBUG - Pending for Me:", data[0].pending_for_me);
    //                 }
    //                 setChecklistData(data);

    //                 // Store pagination info for future use
    //                 setPaginationInfo({
    //                     count: responseData.count || 0,
    //                     next: responseData.next || null,
    //                     previous: responseData.previous || null
    //                 });

    //                 const roomIds = [...new Set(data.map((item) => item.room_id).filter(Boolean))];
    //                 if (roomIds.length > 0) {
    //                     fetchRoomDetails(roomIds);
    //                 }
    //             }
    //         } catch (err) {
    //             console.error("❌ API Error:", err);
    //             setError(err.message || "Failed to fetch checklist data");
    //             toast.error("Failed to load checklists");
    //             setChecklistData([]);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchChecklists();
    // }, [projectId, flatId]);



    // Get status badge


    useEffect(() => {
        console.log("🚀 useEffect triggered with:", { projectId, flatId });

        const fetchInitialData = async () => {
            if (!projectId || !flatId) {
                console.error("❌ Missing required data:", { projectId, flatId });
                setError("Missing project or flat information");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const detectedRole = getCurrentUserRole();
                setUserRole(detectedRole);

                if (detectedRole === 'INITIALIZER') {
                    // For INITIALIZER, load default tab data
                    await fetchTabData('ready-to-start');
                    setChecklistData([]); // Clear old format data
                } else if (detectedRole === 'MAKER') {
                    // For MAKER, load work items and organize into tabs
                    const token = localStorage.getItem("ACCESS_TOKEN");
                    const apiUrl = '/Transafer-Rule-getchchklist/';
                    const params = { project_id: projectId, flat_id: flatId };

                    const response = await checklistInstance.get(apiUrl, {
                        params: params,
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                        timeout: 10000,
                    });

                    if (response.status === 200) {
                        const responseData = response.data || {};
                        let data = responseData.results || responseData || [];
                        if (!Array.isArray(data)) data = [data];

                        // Organize MAKER data into tabs
                        setMakerTabData({
                            'available-work': data,
                            'my-assignments': data
                        });
                        setChecklistData([]); // Clear old format
                    }
                } else {
                    // For other roles, use existing logic
                    // For other roles, use existing logic
                    const token = localStorage.getItem("ACCESS_TOKEN");
                    const apiUrl = '/Transafer-Rule-getchchklist/';
                    const params = { project_id: projectId, flat_id: flatId };

                    const response = await checklistInstance.get(apiUrl, {
                        params: params,
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                        timeout: 10000,
                    });

                    if (response.status === 200) {
                        const responseData = response.data || {};
                        let data = responseData.results || responseData || [];
                        if (!Array.isArray(data)) data = [data];

                        setChecklistData(data);

                        const roomIds = [...new Set(data.map((item) => item.room_id).filter(Boolean))];
                        if (roomIds.length > 0) {
                            fetchRoomDetails(roomIds);
                        }
                    }
                }
            } catch (err) {
                console.error("❌ API Error:", err);
                setError(err.message || "Failed to fetch data");
                toast.error("Failed to load data");
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [projectId, flatId]);


    const getStatusBadge = (status) => {
        const statusConfig = {
            completed: { bg: `${themeConfig.success}20`, text: themeConfig.success, label: "Completed" },
            in_progress: { bg: `${themeConfig.warning}20`, text: themeConfig.warning, label: "In Progress" },
            work_in_progress: { bg: `${themeConfig.warning}20`, text: themeConfig.warning, label: "Work In Progress" },
            not_started: { bg: `${themeConfig.textSecondary}20`, text: themeConfig.textSecondary, label: "Not Started" },
            on_hold: { bg: `${themeConfig.error}20`, text: themeConfig.error, label: "On Hold" },
            pending_for_inspector: { bg: `${themeConfig.accent}20`, text: themeConfig.accent, label: "Pending Inspector" },
            pending_for_supervisor: { bg: `${themeConfig.warning}20`, text: themeConfig.warning, label: "Pending Supervisor" },
            pending_for_maker: { bg: `${themeConfig.info}20`, text: themeConfig.info, label: "Pending Maker" },
        };

        // Safety check for undefined status
        const safeStatus = status || 'not_started';
        const config = statusConfig[safeStatus] || statusConfig.not_started;
        return (
            <span
                className="px-3 py-1 rounded-full text-xs font-medium transition-all duration-200"
                style={{ background: config.bg, color: config.text }}
            >
                {config.label}
            </span>
        );
    };

    const stats = React.useMemo(() => {
        let allItems = [];

        if (userRole === 'INITIALIZER') {
            // For INITIALIZER, get data from all tabs
            allItems = Object.values(tabData).flatMap(tabRooms =>
                tabRooms.flatMap(room =>
                    (room.checklists || []).flatMap(checklist =>
                        (checklist && checklist.items) || []
                    )
                )
            );
        } else {
            // For other roles, use existing logic
            allItems = checklistData.flatMap((room) => {
                const checklists = [
                    ...(room.assigned_to_me || []),
                    ...(room.available_for_me || [])
                ];
                return checklists.flatMap((checklist) => (checklist && checklist.items) || []);
            });
        }

        const total = allItems.length;
        const completed = allItems.filter((item) => item.status === "completed").length;
        const inProgress = allItems.filter((item) => item.status === "in_progress").length;
        const notStarted = allItems.filter((item) => item.status === "not_started").length;

        return {
            total,
            completed,
            inProgress,
            notStarted,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
    }, [checklistData, tabData, userRole]);

    const handleBack = () => navigate(-1);
    const toggleItemExpansion = (checklistId, itemId) => {
        const key = `${checklistId}-${itemId}`;
        setExpandedItems((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    // Room Section Component
    const RoomSection = ({ roomName, roomId, checklists, userRole, themeConfig, roomDetail, handleRoomClick }) => {
        const [isRoomExpanded, setIsRoomExpanded] = useState(false);

        return (
            <div className="border rounded-lg p-4 mb-4" style={{ borderColor: themeConfig.border }}>
                {/* Room Header - Clickable */}
                <div
                    className="cursor-pointer hover:shadow-md transition-all p-4 rounded-lg"
                    style={{
                        background: isRoomExpanded ? `${themeConfig.accent}10` : themeConfig.headerBg,
                        borderColor: themeConfig.border
                    }}
                    onClick={() => setIsRoomExpanded(!isRoomExpanded)}
                >
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            {/* Room Icon */}
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                                style={{
                                    background: `linear-gradient(135deg, ${themeConfig.accent}, ${themeConfig.accent}dd)`,
                                }}
                            >
                                {roomName.charAt(0).toUpperCase()}
                            </div>

                            <div>
                                <h3 className="text-xl font-bold" style={{ color: themeConfig.textPrimary }}>
                                    {roomName.toUpperCase()}
                                </h3>
                                <p className="text-sm" style={{ color: themeConfig.textSecondary }}>
                                    {checklists.length} checklist{checklists.length !== 1 ? "s" : ""} available
                                    {roomId && ` • Room ID: ${roomId}`}
                                </p>
                            </div>
                        </div>

                        {/* Expand/Collapse Arrow */}
                        <div
                            className={`transform transition-all duration-300 ${isRoomExpanded ? "rotate-90" : ""
                                } p-2 rounded-full`}
                            style={{
                                color: themeConfig.accent,
                                backgroundColor: `${themeConfig.accent}15`,
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
                            </svg>
                        </div>
                    </div>
                </div>


                {/* 👆 ADD THE ROOM-LEVEL BUTTON RIGHT HERE 👆 */}
                {/* Room-Level Initialize All Button for INITIALIZER */}
                {userRole === 'INITIALIZER' && (
                    <div className="mt-4 ml-16">
                        <button
                            onClick={async () => {
                                // Get all not_started checklists in this room
                                const roomChecklistIds = checklists
                                    .filter(checklist => checklist.status === "not_started")
                                    .map(checklist => checklist.id);

                                if (roomChecklistIds.length === 0) {
                                    toast.success("No checklists to initialize in this room");
                                    return;
                                }

                                // Initialize all checklists in this room
                                setBulkInitializing(true);

                                try {
                                    for (const checklistId of roomChecklistIds) {
                                        await handleInitializeChecklist(checklistId);
                                    }

                                    toast.success(`🎉 All ${roomChecklistIds.length} checklists in ${roomName} initialized!`, {
                                        duration: 4000,
                                        style: { background: themeConfig.success, color: 'white', borderRadius: '12px' }
                                    });
                                } finally {
                                    setBulkInitializing(false);
                                }
                            }}
                            disabled={bulkInitializing || checklists.filter(c => c.status === "not_started").length === 0}
                            className="px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105"
                            style={{
                                background: checklists.filter(c => c.status === "not_started").length === 0
                                    ? `${themeConfig.textSecondary}60`
                                    : `linear-gradient(135deg, ${themeConfig.accent}, ${themeConfig.accent}dd)`,
                                color: 'white',
                                border: `2px solid ${themeConfig.accent}`,
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <span>🏠</span>
                                <span>Initialize All in {roomName} ({checklists.filter(c => c.status === "not_started").length})</span>
                            </div>
                        </button>
                    </div>
                )}


                {/* Expanded Checklists Content */}
                <div
                    className={`transition-all duration-500 ease-out overflow-hidden ${isRoomExpanded ? "max-h-[2000px] opacity-100 mt-4" : "max-h-0 opacity-0"
                        }`}
                >
                    <div className="ml-6 space-y-4">
                        {checklists.map((checklist) => (
                            <ChecklistCard
                                key={checklist.id}
                                checklist={checklist}
                                userRole={userRole}
                                themeConfig={themeConfig}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    };



    const ChecklistCard = ({ checklist, userRole, themeConfig }) => {
        const [isChecklistExpanded, setIsChecklistExpanded] = useState(false);

        return (
            <div
                data-checklist-id={checklist.id}
                className="border rounded-lg p-4 transition-all duration-300 hover:shadow-md checklist-card"
                style={{ background: themeConfig.cardBg, borderColor: themeConfig.border }}
            >
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h4 className="font-semibold mb-1" style={{ color: themeConfig.textPrimary }}>
                            {checklist.name}
                        </h4>
                        {checklist.description && (
                            <p className="text-sm mb-2" style={{ color: themeConfig.textSecondary }}>
                                {checklist.description}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        {getStatusBadge(checklist.status)}
                        {getRoleBasedActions(checklist, null)}
                    </div>
                </div>

                {/* Clickable Items Section */}
                {checklist.items && checklist.items.length > 0 && (
                    <div className="mt-3">
                        <div
                            className="p-3 rounded-lg cursor-pointer hover:shadow-sm transition-all duration-200"
                            style={{ background: `${themeConfig.accent}08` }}
                            onClick={() => setIsChecklistExpanded(!isChecklistExpanded)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">📋</span>
                                    <span className="font-medium" style={{ color: themeConfig.textPrimary }}>
                                        {checklist.items.length} Inspection Items
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs px-2 py-1 rounded-full" style={{
                                        background: `${themeConfig.accent}20`,
                                        color: themeConfig.accent
                                    }}>
                                        Read-only for {userRole}
                                    </span>
                                    <div
                                        className={`transform transition-all duration-300 ${isChecklistExpanded ? "rotate-90" : ""
                                            }`}
                                        style={{ color: themeConfig.accent }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Expanded Items List */}
                        <div
                            className={`transition-all duration-500 ease-out overflow-hidden ${isChecklistExpanded ? "max-h-[2000px] opacity-100 mt-4" : "max-h-0 opacity-0"
                                }`}
                        >
                            <div className="space-y-3">
                                {checklist.items.map((item, itemIndex) => (
                                    <InspectionItem
                                        key={item.id}
                                        item={item}
                                        itemIndex={itemIndex}
                                        userRole={userRole}
                                        themeConfig={themeConfig}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };


    // MAKER Item Card Component
    const MakerItemCard = ({ item, userRole, themeConfig }) => {
        const [isExpanded, setIsExpanded] = useState(false);

        return (
            <div
                className="border rounded-lg p-4 transition-all duration-300 hover:shadow-md"
                style={{ background: themeConfig.cardBg, borderColor: themeConfig.border }}
            >
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span
                                className="text-sm font-bold px-2 py-1 rounded-full"
                                style={{
                                    background: `${themeConfig.accent}20`,
                                    color: themeConfig.accent
                                }}
                            >
                                #{item.id}
                            </span>
                            <h4 className="font-semibold" style={{ color: themeConfig.textPrimary }}>
                                {item.title}
                            </h4>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap mb-2">
                            {getStatusBadge(item.status)}

                            {item.photo_required && (
                                <span
                                    className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                                    style={{
                                        background: `${themeConfig.accent}20`,
                                        color: themeConfig.accent
                                    }}
                                >
                                    <span>📷</span>
                                    Photo Required
                                </span>
                            )}

                            <button
                                onClick={() => {
                                    setSelectedItemForHistory(item);
                                    setShowHistoryModal(true);
                                }}
                                className="text-xs px-2 py-1 rounded-full hover:scale-105 transition-all cursor-pointer"
                                style={{
                                    background: `${themeConfig.accent}20`,
                                    color: themeConfig.accent,
                                    border: `1px solid ${themeConfig.accent}40`
                                }}
                            >
                                📋 History ({item.latest_submission?.attempts || 1} attempts)
                            </button>
                        </div>

                        {item.description && (
                            <p className="text-sm" style={{ color: themeConfig.textSecondary }}>
                                {item.description}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                setSelectedItemForMaker(item);
                                setMakerRemark('');
                                setMakerPhotos([]);
                                setShowMakerModal(true);
                            }}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                            style={{
                                background: themeConfig.accent,
                                color: 'white'
                            }}
                        >
                            Complete Work
                        </button>
                    </div>
                </div>

                {/* Expandable Options Section */}
                {item.options && item.options.length > 0 && (
                    <div className="mt-3">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center gap-2 text-sm font-medium"
                            style={{ color: themeConfig.accent }}
                        >
                            <span>View Options ({item.options.length})</span>
                            <span className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
                        </button>

                        {isExpanded && (
                            <div className="mt-3 space-y-2">
                                {item.options.map((option, index) => (
                                    <div
                                        key={option.id}
                                        className="p-3 rounded-lg"
                                        style={{
                                            background: option.choice === 'P'
                                                ? `${themeConfig.success}15`
                                                : `${themeConfig.error}15`,
                                            border: `1px solid ${option.choice === 'P'
                                                ? themeConfig.success + '30'
                                                : themeConfig.error + '30'}`
                                        }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium" style={{ color: themeConfig.textPrimary }}>
                                                {option.name}
                                            </span>
                                            <span
                                                className="text-xs px-2 py-1 rounded-full font-bold"
                                                style={{
                                                    background: option.choice === 'P' ? themeConfig.success : themeConfig.error,
                                                    color: 'white'
                                                }}
                                            >
                                                {option.choice === 'P' ? '✓ PASS' : '✗ FAIL'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };


    // History Modal Component
    const HistoryModal = () => {
        if (!showHistoryModal || !selectedItemForHistory) return null;

        const submission = selectedItemForHistory.latest_submission;
        const attempts = submission?.attempts || 1;

        // Create timeline based on submission data
        const getTimeline = () => {
            const timeline = [];

            for (let i = 1; i <= attempts; i++) {
                if (i < attempts) {
                    // Previous attempts (completed but rejected)
                    timeline.push({
                        attempt: i,
                        status: 'MAKER → SUPERVISOR (rejected)',
                        icon: '❌',
                        color: themeConfig.error,
                        description: 'Work completed but rejected by supervisor'
                    });
                } else {
                    // Current attempt
                    const currentStatus = submission?.status === 'created'
                        ? 'MAKER (in progress)'
                        : submission?.supervisor_id
                            ? 'SUPERVISOR (reviewing)'
                            : 'MAKER (current)';

                    timeline.push({
                        attempt: i,
                        status: currentStatus,
                        icon: '🔄',
                        color: themeConfig.warning,
                        description: 'Current work in progress'
                    });
                }
            }

            return timeline;
        };

        const timeline = getTimeline();

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div
                    className="max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-xl shadow-2xl"
                    style={{ background: themeConfig.cardBg }}
                >
                    {/* Modal Header */}
                    <div
                        className="sticky top-0 p-6 border-b"
                        style={{
                            background: themeConfig.headerBg,
                            borderColor: themeConfig.border
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold" style={{ color: themeConfig.textPrimary }}>
                                    Work History
                                </h3>
                                <p className="text-sm mt-1" style={{ color: themeConfig.textSecondary }}>
                                    {selectedItemForHistory.title}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowHistoryModal(false)}
                                className="p-2 rounded-lg hover:bg-opacity-80 transition-all"
                                style={{ background: `${themeConfig.error}20`, color: themeConfig.error }}
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Item Details */}
                        <div
                            className="p-4 rounded-xl mb-6"
                            style={{ background: `${themeConfig.accent}10`, border: `1px solid ${themeConfig.accent}30` }}
                        >
                            <h4 className="font-medium mb-2" style={{ color: themeConfig.textPrimary }}>
                                📋 Item Details
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span style={{ color: themeConfig.textSecondary }}>Item ID:</span>
                                    <span className="ml-2 font-mono" style={{ color: themeConfig.textPrimary }}>
                                        {selectedItemForHistory.id}
                                    </span>
                                </div>
                                <div>
                                    <span style={{ color: themeConfig.textSecondary }}>Photo Required:</span>
                                    <span className="ml-2" style={{ color: themeConfig.textPrimary }}>
                                        {selectedItemForHistory.photo_required ? 'Yes' : 'No'}
                                    </span>
                                </div>
                                <div>
                                    <span style={{ color: themeConfig.textSecondary }}>Current Status:</span>
                                    <span className="ml-2" style={{ color: themeConfig.textPrimary }}>
                                        {selectedItemForHistory.status}
                                    </span>
                                </div>
                                <div>
                                    <span style={{ color: themeConfig.textSecondary }}>Total Attempts:</span>
                                    <span className="ml-2 font-bold" style={{ color: themeConfig.accent }}>
                                        {attempts}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div
                            className="p-4 rounded-xl"
                            style={{ background: `${themeConfig.textSecondary}08`, border: `1px solid ${themeConfig.textSecondary}20` }}
                        >
                            <h4 className="font-medium mb-4" style={{ color: themeConfig.textPrimary }}>
                                🕒 Work Timeline
                            </h4>

                            <div className="space-y-4">
                                {timeline.map((entry, index) => (
                                    <div key={index} className="flex items-start gap-4">
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                                            style={{ background: entry.color, color: 'white' }}
                                        >
                                            {entry.attempt}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-lg">{entry.icon}</span>
                                                <span className="font-medium" style={{ color: themeConfig.textPrimary }}>
                                                    Attempt {entry.attempt}: {entry.status}
                                                </span>
                                            </div>
                                            <p className="text-sm" style={{ color: themeConfig.textSecondary }}>
                                                {entry.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submission Details */}
                        {submission && (
                            <div
                                className="mt-6 p-4 rounded-xl"
                                style={{ background: `${themeConfig.success}10`, border: `1px solid ${themeConfig.success}30` }}
                            >
                                <h4 className="font-medium mb-4" style={{ color: themeConfig.textPrimary }}>
                                    📝 Current Submission Details
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span style={{ color: themeConfig.textSecondary }}>Submission ID:</span>
                                        <span className="ml-2 font-mono" style={{ color: themeConfig.textPrimary }}>
                                            {submission.id}
                                        </span>
                                    </div>
                                    <div>
                                        <span style={{ color: themeConfig.textSecondary }}>Created:</span>
                                        <span className="ml-2" style={{ color: themeConfig.textPrimary }}>
                                            {new Date(submission.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <div>
                                        <span style={{ color: themeConfig.textSecondary }}>MAKER ID:</span>
                                        <span className="ml-2" style={{ color: themeConfig.textPrimary }}>
                                            {submission.maker_id || 'Not assigned'}
                                        </span>
                                    </div>
                                    <div>
                                        <span style={{ color: themeConfig.textSecondary }}>CHECKER ID:</span>
                                        <span className="ml-2" style={{ color: themeConfig.textPrimary }}>
                                            {submission.checker_id || 'Not assigned'}
                                        </span>
                                    </div>
                                </div>

                                {submission.maker_remarks && (
                                    <div className="mt-4">
                                        <span className="font-medium" style={{ color: themeConfig.textSecondary }}>
                                            MAKER Remarks:
                                        </span>
                                        <p className="mt-1 p-3 rounded-lg" style={{
                                            background: themeConfig.cardBg,
                                            color: themeConfig.textPrimary,
                                            border: `1px solid ${themeConfig.border}`
                                        }}>
                                            {submission.maker_remarks}
                                        </p>
                                    </div>
                                )}

                                {submission.supervisor_remarks && (
                                    <div className="mt-4">
                                        <span className="font-medium" style={{ color: themeConfig.textSecondary }}>
                                            SUPERVISOR Remarks:
                                        </span>
                                        <p className="mt-1 p-3 rounded-lg" style={{
                                            background: themeConfig.cardBg,
                                            color: themeConfig.textPrimary,
                                            border: `1px solid ${themeConfig.border}`
                                        }}>
                                            {submission.supervisor_remarks}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };


    // Inspection Item Component
    const InspectionItem = ({ item, itemIndex, userRole, themeConfig }) => {
        const [isItemExpanded, setIsItemExpanded] = useState(false);
        const [selectedOptionId, setSelectedOptionId] = useState(null);
        const [remark, setRemark] = useState('');
        const [isSubmitting, setIsSubmitting] = useState(false);

        // Check if this role can make decisions
        const canMakeDecisions = ['CHECKER', 'SUPERVISOR', 'MAKER'].includes(userRole);

        // Handle option selection
        const handleOptionSelect = (optionId) => {
            if (!canMakeDecisions) return;
            setSelectedOptionId(optionId);
        };

        // Submit decision to API
        const handleSubmitDecision = async () => {
            if (!canMakeDecisions) {
                toast.error("You don't have permission to make decisions", {
                    style: { background: themeConfig.warning, color: 'white', borderRadius: '12px' }
                });
                return;
            }

            // Different validation for different roles
            if (userRole === 'MAKER') {
                // MAKER doesn't need to select options, just marks as done
            } else {
                // CHECKER/SUPERVISOR must select an option
                if (!selectedOptionId) {
                    toast.error("Please select an option before submitting", {
                        style: { background: themeConfig.warning, color: 'white', borderRadius: '12px' }
                    });
                    return;
                }
            }

            setIsSubmitting(true);

            try {
                const token = localStorage.getItem("ACCESS_TOKEN");

                let apiEndpoint, payload;

                if (userRole === 'MAKER') {
                    // MAKER workflow - simpler API
                    apiEndpoint = '/mark-as-done-maker/';
                    payload = {
                        checklist_item_id: item.id
                    };
                } else {
                    // CHECKER/SUPERVISOR workflow - decision making API
                    apiEndpoint = '/Decsion-makeing-forSuer-Inspector/';
                    payload = {
                        checklist_item_id: item.id,
                        role: userRole.toLowerCase(),
                        option_id: selectedOptionId,
                        check_remark: remark
                    };
                }

                console.log(`📡 API CALL: ${userRole} Decision - Endpoint:`, apiEndpoint);
                console.log(`📡 API CALL: ${userRole} Decision - Payload:`, payload);

                const response = await checklistInstance.patch(
                    apiEndpoint,
                    payload,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                console.log(`📡 API RESPONSE: ${userRole} Decision - Response:`, response.data);

                if (response.status === 200) {
                    const successMessage = userRole === 'MAKER'
                        ? "✅ Item marked as done and sent for review!"
                        : `✅ ${response.data.detail}`;

                    toast.success(successMessage, {
                        duration: 4000,
                        style: {
                            background: themeConfig.success,
                            color: 'white',
                            borderRadius: '12px',
                            padding: '16px',
                        },
                    });

                    // Reset form
                    setSelectedOptionId(null);
                    setRemark('');

                    // TODO: Update item status in real-time based on response
                    // You might want to refresh the data or update local state
                }

            } catch (err) {
                console.error(`❌ Failed to submit ${userRole} decision:`, err);
                const errorMessage = err.response?.data?.detail || `Failed to submit ${userRole.toLowerCase()} decision`;

                toast.error(`❌ ${errorMessage}`, {
                    duration: 4000,
                    style: {
                        background: themeConfig.error,
                        color: 'white',
                        borderRadius: '12px',
                        padding: '16px',
                    },
                });
            } finally {
                setIsSubmitting(false);
            }
        };

        return (
            <div
                className="border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md"
                style={{
                    background: themeConfig.headerBg,
                    borderColor: themeConfig.border,
                    boxShadow: isItemExpanded ? `0 4px 12px ${themeConfig.accent}10` : 'none'
                }}
            >
                {/* Item Header - Clickable */}
                <div
                    className="p-4 cursor-pointer transition-all duration-200 hover:bg-opacity-80"
                    onClick={() => setIsItemExpanded(!isItemExpanded)}
                    style={{ background: isItemExpanded ? `${themeConfig.accent}08` : 'transparent' }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span
                                    className="text-sm font-bold px-2 py-1 rounded-full"
                                    style={{
                                        background: `${themeConfig.accent}20`,
                                        color: themeConfig.accent
                                    }}
                                >
                                    #{itemIndex + 1}
                                </span>
                                <h6 className="font-semibold text-base" style={{ color: themeConfig.textPrimary }}>
                                    {item.title}
                                </h6>
                            </div>

                            <div className="flex items-center gap-3 flex-wrap">
                                {getStatusBadge(item.status)}

                                {item.photo_required && (
                                    <span
                                        className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                                        style={{
                                            background: `${themeConfig.accent}20`,
                                            color: themeConfig.accent
                                        }}
                                    >
                                        <span>📷</span>
                                        Photo Required
                                    </span>
                                )}

                                <span
                                    className="text-xs px-2 py-1 rounded-full"
                                    style={{
                                        background: `${themeConfig.textSecondary}15`,
                                        color: themeConfig.textSecondary
                                    }}
                                >
                                    {item.options?.length || 0} Options
                                </span>

                                {canMakeDecisions && (
                                    <span
                                        className="text-xs px-2 py-1 rounded-full font-medium"
                                        style={{
                                            background: `${themeConfig.success}15`,
                                            color: themeConfig.success
                                        }}
                                    >
                                        Interactive for {userRole}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span
                                className={`text-lg transition-transform duration-200 ${isItemExpanded ? 'rotate-90' : ''}`}
                                style={{ color: themeConfig.accent }}
                            >
                                ▶
                            </span>
                        </div>
                    </div>
                </div>

                {/* Expanded Item Details */}
                <div
                    className={`transition-all duration-300 ease-in-out ${isItemExpanded
                        ? 'max-h-[2000px] opacity-100'
                        : 'max-h-0 opacity-0 overflow-hidden'
                        }`}
                >
                    <div className="px-4 pb-4">
                        {/* Item Description */}
                        {item.description && (
                            <div
                                className="p-4 rounded-xl mb-4"
                                style={{
                                    background: `${themeConfig.textSecondary}08`,
                                    border: `1px solid ${themeConfig.textSecondary}20`
                                }}
                            >
                                <h6
                                    className="font-medium text-sm mb-2 flex items-center gap-2"
                                    style={{ color: themeConfig.textPrimary }}
                                >
                                    <span>📝</span>
                                    Description
                                </h6>
                                <p className="text-sm" style={{ color: themeConfig.textSecondary }}>
                                    {item.description}
                                </p>
                            </div>
                        )}

                        {/* Options Section */}
                        {item.options && item.options.length > 0 && (
                            <div>
                                <h6
                                    className="font-semibold text-sm mb-3 flex items-center gap-2"
                                    style={{ color: themeConfig.textPrimary }}
                                >
                                    <span>⚡</span>
                                    Answer Options ({item.options.length})
                                    {canMakeDecisions && (
                                        <span className="text-xs px-2 py-1 rounded-full" style={{
                                            background: `${themeConfig.accent}15`,
                                            color: themeConfig.accent
                                        }}>
                                            Click to Select
                                        </span>
                                    )}
                                </h6>

                                <div className="grid grid-cols-1 gap-3">
                                    {item.options.map((option, optionIndex) => {
                                        const isPassOption = option.choice === "P";
                                        const isSelected = selectedOptionId === option.id;

                                        // Enhanced color scheme for selected/unselected states
                                        const optionBgColor = isSelected
                                            ? (isPassOption ? `${themeConfig.accent}25` : `${themeConfig.textSecondary}25`)
                                            : (isPassOption ? `${themeConfig.accent}12` : `${themeConfig.textSecondary}12`);

                                        const optionBorderColor = isSelected
                                            ? (isPassOption ? `${themeConfig.accent}80` : `${themeConfig.textSecondary}80`)
                                            : (isPassOption ? `${themeConfig.accent}40` : `${themeConfig.textSecondary}40`);

                                        const optionTextColor = isPassOption ? themeConfig.accent : themeConfig.textSecondary;
                                        const statusBgColor = isPassOption ? themeConfig.accent : themeConfig.textSecondary;

                                        return (
                                            <div
                                                key={option.id}
                                                className={`p-4 rounded-xl border-2 transition-all duration-200 ${canMakeDecisions
                                                    ? 'cursor-pointer hover:shadow-md hover:scale-[1.02]'
                                                    : 'hover:shadow-sm hover:scale-[1.01]'
                                                    } ${isSelected ? 'shadow-lg' : ''}`}
                                                style={{
                                                    background: optionBgColor,
                                                    borderColor: optionBorderColor,
                                                    transform: isSelected ? 'scale(1.02)' : 'scale(1)'
                                                }}
                                                onClick={() => handleOptionSelect(option.id)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {/* Interactive/Static Checkbox */}
                                                    <div className="flex-shrink-0">
                                                        <div
                                                            className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200"
                                                            style={{
                                                                borderColor: optionTextColor,
                                                                background: isSelected
                                                                    ? optionTextColor
                                                                    : (isPassOption ? `${themeConfig.accent}15` : `${themeConfig.textSecondary}15`)
                                                            }}
                                                        >
                                                            {isSelected ? (
                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                                                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                                                </svg>
                                                            ) : (
                                                                <div
                                                                    className="w-2.5 h-2.5 rounded-sm"
                                                                    style={{ background: optionTextColor }}
                                                                ></div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Option Content */}
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span
                                                                className="font-semibold text-sm"
                                                                style={{ color: optionTextColor }}
                                                            >
                                                                Option {optionIndex + 1}: {option.name}
                                                            </span>

                                                            <div className="flex items-center gap-2">
                                                                <span
                                                                    className="text-xs px-3 py-1 rounded-full font-bold tracking-wide"
                                                                    style={{
                                                                        background: statusBgColor,
                                                                        color: 'white',
                                                                        boxShadow: `0 2px 8px ${statusBgColor}30`
                                                                    }}
                                                                >
                                                                    {isPassOption ? '✓ PASS' : '✗ FAIL'}
                                                                </span>
                                                                {isSelected && (
                                                                    <span
                                                                        className="text-xs px-2 py-1 rounded-full font-bold"
                                                                        style={{
                                                                            background: themeConfig.success,
                                                                            color: 'white'
                                                                        }}
                                                                    >
                                                                        SELECTED
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Option Description if available */}
                                                        {option.description && (
                                                            <p
                                                                className="text-xs mt-1 opacity-75 leading-relaxed"
                                                                style={{ color: optionTextColor }}
                                                            >
                                                                {option.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Decision Making Section for Active Roles */}
                        {canMakeDecisions && (
                            <div
                                className="mt-4 p-4 rounded-xl"
                                style={{
                                    background: `${themeConfig.accent}08`,
                                    border: `1px solid ${themeConfig.accent}30`
                                }}
                            >
                                <h6
                                    className="font-medium text-sm mb-3 flex items-center gap-2"
                                    style={{ color: themeConfig.textPrimary }}
                                >
                                    <span>💬</span>
                                    {userRole} {userRole === 'MAKER' ? 'Submission' : 'Decision'}
                                </h6>

                                {/* MAKER specific message */}
                                {userRole === 'MAKER' && (
                                    <div
                                        className="mb-4 p-3 rounded-lg"
                                        style={{
                                            background: `${themeConfig.info}15`,
                                            border: `1px solid ${themeConfig.info}40`
                                        }}
                                    >
                                        <p className="text-sm" style={{ color: themeConfig.textPrimary }}>
                                            As a MAKER, you can mark this item as completed. No option selection required -
                                            just add remarks and submit for review.
                                        </p>
                                    </div>
                                )}

                                {/* CHECKER/SUPERVISOR specific message */}
                                {['CHECKER', 'SUPERVISOR'].includes(userRole) && !selectedOptionId && (
                                    <div
                                        className="mb-4 p-3 rounded-lg"
                                        style={{
                                            background: `${themeConfig.warning}15`,
                                            border: `1px solid ${themeConfig.warning}40`
                                        }}
                                    >
                                        <p className="text-sm" style={{ color: themeConfig.textPrimary }}>
                                            Please select a PASS or FAIL option above before submitting your {userRole.toLowerCase()} decision.
                                        </p>
                                    </div>
                                )}

                                {/* Remark Input */}
                                <div className="mb-4">
                                    <label
                                        className="block text-xs font-medium mb-2"
                                        style={{ color: themeConfig.textSecondary }}
                                    >
                                        Remark {userRole === 'MAKER' ? '(Optional)' : '(Optional)'}
                                    </label>
                                    <textarea
                                        value={remark}
                                        onChange={(e) => setRemark(e.target.value)}
                                        placeholder={userRole === 'MAKER'
                                            ? "Add your work completion notes here..."
                                            : `Add your ${userRole.toLowerCase()} comments here...`
                                        }
                                        className="w-full p-3 rounded-lg border-2 text-sm"
                                        style={{
                                            background: themeConfig.cardBg,
                                            borderColor: `${themeConfig.border}60`,
                                            color: themeConfig.textPrimary,
                                            minHeight: '80px'
                                        }}
                                        rows="3"
                                    />
                                </div>

                                {/* Submit Decision Button */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {userRole !== 'MAKER' && selectedOptionId && (
                                            <span className="text-xs" style={{ color: themeConfig.textSecondary }}>
                                                Selected Option ID: {selectedOptionId}
                                            </span>
                                        )}
                                        {userRole === 'MAKER' && (
                                            <span className="text-xs" style={{ color: themeConfig.textSecondary }}>
                                                Item ID: {item.id}
                                            </span>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleSubmitDecision}
                                        disabled={(userRole !== 'MAKER' && !selectedOptionId) || isSubmitting}
                                        className={`
                      px-6 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform
                      ${((userRole !== 'MAKER' && !selectedOptionId) || isSubmitting)
                                                ? 'opacity-50 cursor-not-allowed'
                                                : 'hover:scale-105 hover:shadow-lg active:scale-95'
                                            }
                    `}
                                        style={{
                                            background: ((userRole !== 'MAKER' && !selectedOptionId) || isSubmitting)
                                                ? `${themeConfig.textSecondary}60`
                                                : userRole === 'MAKER'
                                                    ? `linear-gradient(135deg, ${themeConfig.accent}, ${themeConfig.accent}dd)`
                                                    : `linear-gradient(135deg, ${themeConfig.success}, ${themeConfig.success}dd)`,
                                            color: 'white',
                                            border: `2px solid ${((userRole !== 'MAKER' && !selectedOptionId) || isSubmitting)
                                                ? themeConfig.textSecondary
                                                : userRole === 'MAKER'
                                                    ? themeConfig.accent
                                                    : themeConfig.success}`,
                                        }}
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Submitting...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span>{userRole === 'MAKER' ? '✅' : '🔍'}</span>
                                                <span>
                                                    {userRole === 'MAKER'
                                                        ? 'Mark as Done'
                                                        : `Submit ${userRole} Decision`
                                                    }
                                                </span>
                                            </div>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Additional Item Metadata */}
                        <div
                            className="mt-4 p-3 rounded-xl"
                            style={{
                                background: `${themeConfig.textSecondary}08`,
                                border: `1px solid ${themeConfig.textSecondary}15`
                            }}
                        >
                            <h6
                                className="font-medium text-xs mb-2 flex items-center gap-2"
                                style={{ color: themeConfig.textPrimary }}
                            >
                                <span>ℹ️</span>
                                Item Details
                            </h6>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                <div>
                                    <span style={{ color: themeConfig.textSecondary }}>Item ID:</span>
                                    <span
                                        className="ml-1 font-mono"
                                        style={{ color: themeConfig.textPrimary }}
                                    >
                                        {item.id}
                                    </span>
                                </div>

                                <div>
                                    <span style={{ color: themeConfig.textSecondary }}>Status:</span>
                                    <span
                                        className="ml-1 font-medium"
                                        style={{ color: themeConfig.textPrimary }}
                                    >
                                        {item.status.replace('_', ' ')}
                                    </span>
                                </div>

                                <div>
                                    <span style={{ color: themeConfig.textSecondary }}>Photo:</span>
                                    <span
                                        className="ml-1"
                                        style={{ color: item.photo_required ? themeConfig.accent : themeConfig.textSecondary }}
                                    >
                                        {item.photo_required ? 'Required' : 'Optional'}
                                    </span>
                                </div>

                                <div>
                                    <span style={{ color: themeConfig.textSecondary }}>Role:</span>
                                    <span
                                        className="ml-1 font-medium"
                                        style={{ color: canMakeDecisions ? themeConfig.success : themeConfig.textSecondary }}
                                    >
                                        {canMakeDecisions ? 'Interactive' : 'Read-only'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Handle photo upload for MAKER
    const handleMakerPhotoUpload = (event) => {
        const file = event.target.files[0]; // Single file only
        if (file) {
            const newPhoto = {
                file,
                preview: URL.createObjectURL(file),
                name: file.name
            };
            setMakerPhotos([newPhoto]); // Replace existing photo
        }
    };

    // Remove photo
    const removeMakerPhoto = (index) => {
        setMakerPhotos(prev => prev.filter((_, i) => i !== index));
    };

    // Submit MAKER work
    const handleMakerSubmit = async () => {
        if (!selectedItemForMaker) return;

        setSubmittingMaker(true);

        try {
            const token = localStorage.getItem("ACCESS_TOKEN");

            // Create FormData for photos
            const formData = new FormData();
            formData.append('checklist_item_id', selectedItemForMaker.id);
            formData.append('maker_remark', makerRemark);

            // Add single photo
            if (makerPhotos.length > 0) {
                formData.append('maker_media', makerPhotos[0].file); // Single photo as maker_media
            }

            console.log("📡 API CALL: MAKER Submit - Endpoint:", '/mark-as-done-maker/');
            console.log("📡 API CALL: MAKER Submit - Item ID:", selectedItemForMaker.id);

            const response = await checklistInstance.post(
                '/mark-as-done-maker/',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    },
                }
            );

            console.log("📡 API RESPONSE: MAKER Submit - Response:", response.data);

            if (response.status === 200) {
                toast.success("✅ Work completed and submitted for review!", {
                    duration: 4000,
                    style: {
                        background: themeConfig.success,
                        color: 'white',
                        borderRadius: '12px',
                        padding: '16px',
                    },
                });

                // Remove item from current tab immediately
                const submittedItemId = selectedItemForMaker.id;
                setMakerTabData(prev => ({
                    ...prev,
                    [makerActiveTab]: prev[makerActiveTab].map(roomData => ({
                        ...roomData,
                        [makerTabs.find(tab => tab.key === makerActiveTab).dataSource]:
                            roomData[makerTabs.find(tab => tab.key === makerActiveTab).dataSource]
                                ?.filter(item => item.id !== submittedItemId) || []
                    }))
                }));

                // Close modal and reset
                setShowMakerModal(false);
                setSelectedItemForMaker(null);
                setMakerRemark('');
                setMakerPhotos([]);
            }

        } catch (err) {
            console.error("❌ Failed to submit MAKER work:", err);
            const errorMessage = err.response?.data?.detail || "Failed to submit work";

            toast.error(`❌ ${errorMessage}`, {
                duration: 4000,
                style: {
                    background: themeConfig.error,
                    color: 'white',
                    borderRadius: '12px',
                    padding: '16px',
                },
            });
        } finally {
            setSubmittingMaker(false);
        }
    };

    const handleRoomClick = (room) => {
        setSelectedRoom(room);
        setShowRoomsModal(true);
    };


    // Tab Navigation Component for INITIALIZER
    const TabNavigation = () => {
        if (userRole !== 'INITIALIZER') return null;

        return (
            <div className="mb-6">
                <div
                    className="flex gap-2 p-2 rounded-xl"
                    style={{ background: `${themeConfig.accent}10` }}
                >
                    {initializerTabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => handleTabSwitch(tab.key)}
                            className={`
                            flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg 
                            font-medium transition-all duration-300 transform hover:scale-105
                            ${activeTab === tab.key ? 'shadow-lg' : 'hover:shadow-md'}
                        `}
                            style={{
                                background: activeTab === tab.key
                                    ? `linear-gradient(135deg, ${tab.color}, ${tab.color}dd)`
                                    : `${tab.color}15`,
                                color: activeTab === tab.key ? 'white' : tab.color,
                                border: `2px solid ${activeTab === tab.key ? tab.color : 'transparent'}`
                            }}
                        >
                            <span className="text-xl">{tab.icon}</span>
                            <div className="text-left">
                                <div className="font-bold">{tab.label}</div>
                                <div className="text-xs opacity-80">{tab.description}</div>
                            </div>
                            {tabLoading[tab.key] && (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            )}
                            <div
                                className="px-2 py-1 rounded-full text-xs font-bold"
                                style={{
                                    background: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : `${tab.color}30`,
                                    color: activeTab === tab.key ? 'white' : tab.color
                                }}
                            >
                                {tabData[tab.key]?.reduce((count, room) =>
                                    count + (room.checklists?.length || 0), 0
                                ) || 0}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    };


    // MAKER Tab Navigation Component
    const MakerTabNavigation = () => {
        if (userRole !== 'MAKER') return null;

        return (
            <div className="mb-6">
                <div
                    className="flex gap-2 p-2 rounded-xl"
                    style={{ background: `${themeConfig.accent}10` }}
                >
                    {makerTabs.map((tab) => {
                        const itemCount = makerTabData[tab.key]?.reduce((count, room) =>
                            count + (room[tab.dataSource]?.length || 0), 0
                        ) || 0;

                        return (
                            <button
                                key={tab.key}
                                onClick={() => setMakerActiveTab(tab.key)}
                                className={`
                                flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg 
                                font-medium transition-all duration-300 transform hover:scale-105
                                ${makerActiveTab === tab.key ? 'shadow-lg' : 'hover:shadow-md'}
                            `}
                                style={{
                                    background: makerActiveTab === tab.key
                                        ? `linear-gradient(135deg, ${tab.color}, ${tab.color}dd)`
                                        : `${tab.color}15`,
                                    color: makerActiveTab === tab.key ? 'white' : tab.color,
                                    border: `2px solid ${makerActiveTab === tab.key ? tab.color : 'transparent'}`
                                }}
                            >
                                <span className="text-xl">{tab.icon}</span>
                                <div className="text-left">
                                    <div className="font-bold">{tab.label}</div>
                                    <div className="text-xs opacity-80">{tab.description}</div>
                                </div>
                                <div
                                    className="px-2 py-1 rounded-full text-xs font-bold"
                                    style={{
                                        background: makerActiveTab === tab.key ? 'rgba(255,255,255,0.2)' : `${tab.color}30`,
                                        color: makerActiveTab === tab.key ? 'white' : tab.color
                                    }}
                                >
                                    {itemCount}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex min-h-screen" style={{ background: themeConfig.pageBg }}>
                <SiteBarHome />
                <div className="ml-[220px] p-8 flex items-center justify-center">
                    <div className="text-center">
                        <div
                            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
                            style={{ borderColor: themeConfig.accent }}
                        ></div>
                        <p className="text-lg" style={{ color: themeConfig.textPrimary }}>
                            Loading inspection data...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen" style={{ background: themeConfig.pageBg }}>
                <SiteBarHome />
                <div className="ml-[220px] p-8 flex items-center justify-center">
                    <div
                        className="border rounded-lg p-8 text-center max-w-md"
                        style={{ background: themeConfig.cardBg, borderColor: themeConfig.border }}
                    >
                        <div className="text-4xl mb-4" style={{ color: themeConfig.error }}>⚠️</div>
                        <h3 className="text-lg font-semibold mb-2" style={{ color: themeConfig.textPrimary }}>
                            Error Loading Data
                        </h3>
                        <p style={{ color: themeConfig.textSecondary }}>{error}</p>
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 rounded-lg transition-colors text-sm"
                                style={{
                                    background: themeConfig.accent,
                                    color: 'white',
                                    border: `1px solid ${themeConfig.accent}`
                                }}
                            >
                                Retry
                            </button>
                            <button
                                onClick={handleBack}
                                className="px-4 py-2 rounded-lg transition-colors text-sm"
                                style={{
                                    background: themeConfig.textSecondary,
                                    color: 'white',
                                    border: `1px solid ${themeConfig.textSecondary}`
                                }}
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen" style={{ background: themeConfig.pageBg }}>
            <SiteBarHome />
            <main className="flex-1 ml-[220px] py-6 px-6 w-full min-w-0">
                {/* Header Section */}
                <div
                    className="border rounded-xl p-6 mb-6 shadow-lg"
                    style={{ background: themeConfig.cardBg, borderColor: themeConfig.border }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold mb-2" style={{ color: themeConfig.accent }}>
                                Unit {flatNumber} - {userRole || 'Loading...'} Dashboard
                            </h1>
                            <div className="flex items-center gap-4 text-sm">
                                <span style={{ color: themeConfig.textSecondary }}>Type: {flatType || "N/A"}</span>
                                <span style={{ color: themeConfig.textSecondary }}>Unit ID: {flatId}</span>
                                <span style={{ color: themeConfig.textSecondary }}>Project ID: {projectId}</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {rooms.length > 0 && (
                                <button
                                    onClick={() => setShowRoomsModal(true)}
                                    disabled={roomsLoading}
                                    className="px-4 py-2 rounded-lg transition-colors text-sm"
                                    style={{
                                        background: themeConfig.accent,
                                        color: 'white',
                                        border: `1px solid ${themeConfig.accent}`
                                    }}
                                >
                                    {roomsLoading ? "Loading..." : "View Rooms"}
                                </button>
                            )}
                            <button
                                onClick={handleBack}
                                className="px-4 py-2 rounded-lg transition-colors text-sm"
                                style={{
                                    background: themeConfig.textSecondary,
                                    color: 'white',
                                    border: `1px solid ${themeConfig.textSecondary}`
                                }}
                            >
                                ← Back
                            </button>
                        </div>
                    </div>

                    {/* TEMPORARY ROLE DEBUG - Remove in production */}
                    {userRole && (
                        <div
                            className="mb-4 p-3 rounded-lg"
                            style={{
                                background: `${themeConfig.info}20`,
                                border: `1px solid ${themeConfig.info}`,
                                color: themeConfig.textPrimary
                            }}
                        >
                            <div className="text-sm">
                                <strong>Active Role:</strong> {userRole} |
                                <strong> API Endpoint:</strong> /initializer-accessible-checklists/ (Role: {userRole})
                            </div>
                        </div>
                    )}
                </div>

                {/* Bulk Action Bar */}
                {getBulkActionBar()}

                {/* Tab Navigation for INITIALIZER */}
                <TabNavigation />

                <MakerTabNavigation />

                {/* Room-wise Checklists Section */}
                <div
                    className="border rounded-xl p-6 shadow-lg"
                    style={{ background: themeConfig.cardBg, borderColor: themeConfig.border }}
                >
                    <h2 className="text-xl font-semibold mb-4" style={{ color: themeConfig.textPrimary }}>
                        Room Inspection Checklists
                    </h2>

                    {userRole === 'INITIALIZER' ? (
                        // INITIALIZER Tab-based rendering
                        tabData[activeTab]?.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">
                                    {initializerTabs.find(tab => tab.key === activeTab)?.icon}
                                </div>
                                <h3 className="text-lg font-semibold mb-2" style={{ color: themeConfig.textPrimary }}>
                                    No {initializerTabs.find(tab => tab.key === activeTab)?.label}
                                </h3>
                                <p style={{ color: themeConfig.textSecondary }}>
                                    {initializerTabs.find(tab => tab.key === activeTab)?.description}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {tabData[activeTab]?.map((roomData, index) => {
                                    const roomDetail = rooms.find((r) => r.id === roomData.room_id);
                                    const roomKey = roomData.room_id || index;
                                    const firstChecklist = roomData.checklists?.[0];
                                    const roomName = firstChecklist?.room_details?.rooms ||
                                        roomDetail?.rooms ||
                                        `Room ${roomData.room_id}` ||
                                        "Unknown Room";
                                    const allChecklists = roomData.checklists || [];

                                    return (
                                        <RoomSection
                                            key={roomKey}
                                            roomName={roomName}
                                            roomId={roomData.room_id}
                                            checklists={allChecklists}
                                            userRole={userRole}
                                            themeConfig={themeConfig}
                                            roomDetail={roomDetail}
                                            handleRoomClick={handleRoomClick}
                                        />
                                    );
                                })}
                            </div>
                        )
                    ) : userRole === 'MAKER' ? (
                        // MAKER Tab-based rendering
                        makerTabData[makerActiveTab]?.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">
                                    {makerTabs.find(tab => tab.key === makerActiveTab)?.icon}
                                </div>
                                <h3 className="text-lg font-semibold mb-2" style={{ color: themeConfig.textPrimary }}>
                                    No {makerTabs.find(tab => tab.key === makerActiveTab)?.label}
                                </h3>
                                <p style={{ color: themeConfig.textSecondary }}>
                                    {makerTabs.find(tab => tab.key === makerActiveTab)?.description}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {makerTabData[makerActiveTab]?.map((roomData, index) => {
                                    const roomKey = roomData.room_id || index;
                                    const roomName = roomData.room_details?.rooms || `Room ${roomData.room_id}` || "Unknown Room";
                                    const currentTabConfig = makerTabs.find(tab => tab.key === makerActiveTab);
                                    const roomItems = roomData[currentTabConfig.dataSource] || [];

                                    return (
                                        <div key={roomKey} className="border rounded-lg p-4 mb-4" style={{ borderColor: themeConfig.border }}>
                                            {/* Room Header */}
                                            <div className="flex items-center gap-3 mb-4">
                                                <div
                                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                                                    style={{
                                                        background: `linear-gradient(135deg, ${themeConfig.accent}, ${themeConfig.accent}dd)`,
                                                    }}
                                                >
                                                    {roomName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold" style={{ color: themeConfig.textPrimary }}>
                                                        {roomName.toUpperCase()}
                                                    </h3>
                                                    <p className="text-sm" style={{ color: themeConfig.textSecondary }}>
                                                        {roomItems.length} item{roomItems.length !== 1 ? "s" : ""} for work
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Items List */}
                                            <div className="space-y-4">
                                                {roomItems.map((item) => (
                                                    <MakerItemCard
                                                        key={item.id}
                                                        item={item}
                                                        userRole={userRole}
                                                        themeConfig={themeConfig}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    ) : (
                        // Other roles - existing logic
                        checklistData.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📋</div>
                                <h3 className="text-lg font-semibold mb-2" style={{ color: themeConfig.textPrimary }}>
                                    No Checklists Found
                                </h3>
                                <p style={{ color: themeConfig.textSecondary }}>
                                    No inspection checklists are available for this unit.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {checklistData.map((roomData, index) => {
                                    const roomDetail = rooms.find((r) => r.id === roomData.room_id);
                                    let allChecklists = [];
                                    let roomKey = roomData.room_id || index;
                                    let roomName = "Unknown Room";

                                    allChecklists = [
                                        ...(roomData.assigned_to_me || []),
                                        ...(roomData.available_for_me || []),
                                        ...(roomData.pending_for_me || [])
                                    ];
                                    roomName = roomDetail?.rooms || `Room ${roomData.room_id}` || "MASTER";

                                    return (
                                        <RoomSection
                                            key={roomKey}
                                            roomName={roomName}
                                            roomId={roomData.room_id}
                                            checklists={allChecklists}
                                            userRole={userRole}
                                            themeConfig={themeConfig}
                                            roomDetail={roomDetail}
                                            handleRoomClick={handleRoomClick}
                                        />
                                    );
                                })}
                            </div>
                        )
                    )}
                </div>

                {/* Footer */}
                <div className="mt-6 text-center">
                    <p className="text-sm" style={{ color: themeConfig.textSecondary }}>
                        Last updated: {new Date().toLocaleString()}
                    </p>
                </div>
            </main>
            {/* MAKER Work Modal */}
            {showMakerModal && selectedItemForMaker && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div
                        className="max-w-4xl w-full max-h-[90vh] mx-4 overflow-y-auto rounded-xl shadow-2xl"
                        style={{ background: themeConfig.cardBg }}
                    >
                        {/* Modal Header */}
                        <div
                            className="sticky top-0 p-6 border-b"
                            style={{
                                background: themeConfig.headerBg,
                                borderColor: themeConfig.border
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold" style={{ color: themeConfig.textPrimary }}>
                                        Complete Work Item
                                    </h3>
                                    <p className="text-sm mt-1" style={{ color: themeConfig.textSecondary }}>
                                        {selectedItemForMaker.title}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowMakerModal(false)}
                                    className="p-2 rounded-lg hover:bg-opacity-80 transition-all"
                                    style={{ background: `${themeConfig.error}20`, color: themeConfig.error }}
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                            {/* Previous Remarks */}
                            <div
                                className="p-4 rounded-xl"
                                style={{ background: `${themeConfig.warning}10`, border: `1px solid ${themeConfig.warning}30` }}
                            >
                                <h4 className="font-medium mb-3" style={{ color: themeConfig.textPrimary }}>
                                    💬 Previous Remarks
                                </h4>

                                {selectedItemForMaker.submissions && selectedItemForMaker.submissions.length > 0 ? (
                                    <div className="space-y-3">
                                        {selectedItemForMaker.submissions.map((submission, index) => (
                                            <div
                                                key={index}
                                                className="p-3 rounded-lg"
                                                style={{ background: themeConfig.cardBg, border: `1px solid ${themeConfig.border}` }}
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xs px-2 py-1 rounded-full" style={{
                                                        background: `${themeConfig.info}20`,
                                                        color: themeConfig.info
                                                    }}>
                                                        {submission.role?.toUpperCase() || 'REVIEWER'}
                                                    </span>
                                                    <span className="text-xs" style={{ color: themeConfig.textSecondary }}>
                                                        {submission.created_at ? new Date(submission.created_at).toLocaleString() : 'Unknown time'}
                                                    </span>
                                                </div>
                                                <p className="text-sm" style={{ color: themeConfig.textPrimary }}>
                                                    {submission.remark || submission.check_remark || "No remarks provided"}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm" style={{ color: themeConfig.textSecondary }}>
                                        No previous remarks available
                                    </p>
                                )}
                            </div>

                            {/* MAKER's Work Section */}
                            <div
                                className="p-4 rounded-xl"
                                style={{ background: `${themeConfig.success}10`, border: `1px solid ${themeConfig.success}30` }}
                            >
                                <h4 className="font-medium mb-4" style={{ color: themeConfig.textPrimary }}>
                                    🔧 Your Work Completion
                                </h4>

                                {/* MAKER Remark */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2" style={{ color: themeConfig.textPrimary }}>
                                        Work Completion Remarks
                                    </label>
                                    <textarea
                                        value={makerRemark}
                                        onChange={(e) => setMakerRemark(e.target.value)}
                                        placeholder="Describe the work completed, any issues faced, or additional notes..."
                                        className="w-full p-3 rounded-lg border-2 text-sm"
                                        style={{
                                            background: themeConfig.cardBg,
                                            borderColor: `${themeConfig.border}60`,
                                            color: themeConfig.textPrimary,
                                            minHeight: '100px'
                                        }}
                                        rows="4"
                                    />
                                </div>

                                {/* Photo Upload */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2" style={{ color: themeConfig.textPrimary }}>
                                        Upload Work Photos
                                    </label>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleMakerPhotoUpload}
                                        className="w-full p-3 rounded-lg border-2 text-sm"
                                        style={{
                                            background: themeConfig.cardBg,
                                            borderColor: `${themeConfig.border}60`,
                                            color: themeConfig.textPrimary
                                        }}
                                    />
                                </div>

                                {/* Photo Previews */}
                                {makerPhotos.length > 0 && (
                                    <div className="mb-4">
                                        <h5 className="text-sm font-medium mb-2" style={{ color: themeConfig.textPrimary }}>
                                            Photo Preview
                                        </h5>
                                        <div className="max-w-sm">                                            {makerPhotos.map((photo, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={photo.preview}
                                                    alt={`Upload preview ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg"
                                                />
                                                <button
                                                    onClick={() => removeMakerPhoto(index)}
                                                    className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-all"
                                                    style={{ background: themeConfig.error }}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            {/* Submit Button - Role-based Actions */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: themeConfig.border }}>
                                <button
                                    onClick={() => setShowMakerModal(false)}
                                    className="px-6 py-2 rounded-lg font-medium text-sm transition-all"
                                    style={{
                                        background: themeConfig.textSecondary,
                                        color: 'white'
                                    }}
                                >
                                    Cancel
                                </button>

                                {/* SUPERVISOR Actions */}
                                {/* SUPERVISOR Actions */}
                                {userRole === 'SUPERVISOR' && (
                                    <>
                                        <button
                                            onClick={async () => {
                                                // SUPERVISOR REJECT - Call same API as CHECKER but with role: supervisor
                                                setSubmittingMaker(true);
                                                try {
                                                    const token = localStorage.getItem("ACCESS_TOKEN");

                                                    // Use a FAIL option (choice: "N") for rejection
                                                    const failOption = selectedItemForMaker.options?.find(opt => opt.choice === "N");
                                                    if (!failOption) {
                                                        toast.error("No FAIL option found for rejection");
                                                        return;
                                                    }

                                                    const payload = {
                                                        checklist_item_id: selectedItemForMaker.id,
                                                        role: "supervisor",
                                                        option_id: failOption.id,
                                                        check_remark: makerRemark || "Rejected by supervisor"
                                                    };

                                                    console.log("📡 API CALL: SUPERVISOR REJECT - Payload:", payload);

                                                    const response = await checklistInstance.patch(
                                                        '/Decsion-makeing-forSuer-Inspector/',
                                                        payload,
                                                        {
                                                            headers: { Authorization: `Bearer ${token}` },
                                                        }
                                                    );

                                                    console.log("📡 API RESPONSE: SUPERVISOR REJECT - Response:", response.data);

                                                    if (response.status === 200) {
                                                        toast.success("✅ Work rejected and sent back to MAKER!", {
                                                            duration: 4000,
                                                            style: {
                                                                background: themeConfig.error,
                                                                color: 'white',
                                                                borderRadius: '12px',
                                                                padding: '16px',
                                                            },
                                                        });
                                                        setShowMakerModal(false);
                                                        setMakerRemark('');
                                                    }
                                                } catch (err) {
                                                    console.error("❌ Failed SUPERVISOR reject:", err);
                                                    const errorMessage = err.response?.data?.detail || "Failed to reject work";
                                                    toast.error(`❌ ${errorMessage}`, {
                                                        style: { background: themeConfig.error, color: 'white', borderRadius: '12px' }
                                                    });
                                                } finally {
                                                    setSubmittingMaker(false);
                                                }
                                            }}
                                            disabled={submittingMaker}
                                            className="px-6 py-3 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105"
                                            style={{
                                                background: `linear-gradient(135deg, ${themeConfig.error}, ${themeConfig.error}dd)`,
                                                color: 'white',
                                                border: `2px solid ${themeConfig.error}`,
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span>❌</span>
                                                <span>Reject & Return to MAKER</span>
                                            </div>
                                        </button>

                                        <button
                                            onClick={async () => {
                                                // SUPERVISOR APPROVE - Call same API as CHECKER but with role: supervisor
                                                setSubmittingMaker(true);
                                                try {
                                                    const token = localStorage.getItem("ACCESS_TOKEN");

                                                    // Use a PASS option (choice: "P") for approval
                                                    const passOption = selectedItemForMaker.options?.find(opt => opt.choice === "P");
                                                    if (!passOption) {
                                                        toast.error("No PASS option found for approval");
                                                        return;
                                                    }

                                                    const payload = {
                                                        checklist_item_id: selectedItemForMaker.id,
                                                        role: "supervisor",
                                                        option_id: passOption.id,
                                                        check_remark: makerRemark || "Approved by supervisor"
                                                    };

                                                    console.log("📡 API CALL: SUPERVISOR APPROVE - Payload:", payload);

                                                    const response = await checklistInstance.patch(
                                                        '/Decsion-makeing-forSuer-Inspector/',
                                                        payload,
                                                        {
                                                            headers: { Authorization: `Bearer ${token}` },
                                                        }
                                                    );

                                                    console.log("📡 API RESPONSE: SUPERVISOR APPROVE - Response:", response.data);

                                                    if (response.status === 200) {
                                                        toast.success("✅ Work approved and sent to CHECKER!", {
                                                            duration: 4000,
                                                            style: {
                                                                background: themeConfig.success,
                                                                color: 'white',
                                                                borderRadius: '12px',
                                                                padding: '16px',
                                                            },
                                                        });
                                                        setShowMakerModal(false);
                                                        setMakerRemark('');
                                                    }
                                                } catch (err) {
                                                    console.error("❌ Failed SUPERVISOR approve:", err);
                                                    const errorMessage = err.response?.data?.detail || "Failed to approve work";
                                                    toast.error(`❌ ${errorMessage}`, {
                                                        style: { background: themeConfig.error, color: 'white', borderRadius: '12px' }
                                                    });
                                                } finally {
                                                    setSubmittingMaker(false);
                                                }
                                            }}
                                            disabled={submittingMaker}
                                            className="px-6 py-3 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105"
                                            style={{
                                                background: `linear-gradient(135deg, ${themeConfig.success}, ${themeConfig.success}dd)`,
                                                color: 'white',
                                                border: `2px solid ${themeConfig.success}`,
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span>✅</span>
                                                <span>Approve to CHECKER</span>
                                            </div>
                                        </button>
                                    </>
                                )}


                                {/* MAKER Actions */}
                                {userRole === 'MAKER' && (
                                    <button
                                        onClick={handleMakerSubmit}
                                        disabled={submittingMaker}
                                        className={`
        px-6 py-3 rounded-lg font-medium text-sm transition-all duration-300 transform
        ${submittingMaker
                                                ? 'opacity-75 cursor-not-allowed scale-95'
                                                : 'hover:scale-105 hover:shadow-lg active:scale-95'
                                            }
      `}
                                        style={{
                                            background: submittingMaker
                                                ? `${themeConfig.success}80`
                                                : `linear-gradient(135deg, ${themeConfig.success}, ${themeConfig.success}dd)`,
                                            color: 'white',
                                            border: `2px solid ${themeConfig.success}`,
                                        }}
                                    >
                                        {submittingMaker ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Submitting Work...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span>✅</span>
                                                <span>Submit Completed Work</span>
                                            </div>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <HistoryModal />
        </div>
    );
};
export default FlatInspectionPage;
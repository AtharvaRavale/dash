// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import SiteBarSetup from "./SideBarSetup";
// import { useTheme } from "../ThemeContext";
// import { projectInstance } from '../api/axiosInstance';
// import axiosInstance from '../api/axiosInstance';

// // --- COLOR PALETTE ---
// const ORANGE = "#ffbe63";
// const BG_OFFWHITE = "#fcfaf7";

// function PurposeCenter() {
//   const { theme } = useTheme();
//   const bgColor = theme === "dark" ? "#191922" : BG_OFFWHITE;
//   const cardColor = theme === "dark" ? "#23232c" : "#fff";
//   const borderColor = ORANGE;
//   const textColor = theme === "dark" ? "#fff" : "#222";
//   const accentBg = ORANGE;
//   const accentText = theme === "dark" ? "#ffbe63" : "#ea580c";
//   const cardAlt = theme === "dark" ? "#23232e" : "#fff7ed";
//   const textMuted = theme === "dark" ? "#b6b6c6" : "#a3a3a3";
//   const textSecondary = theme === "dark" ? "#ffe49c" : "#9a3412";

//   // API endpoints (edit as per your backend)
//   // const API_URL = "https://konstruct.world/projects/all-purposes/";
//   const API_URL = "/all-purposes/";
//   // const CLIENT_USERS_URL = "https://konstruct.world/users/clients/";
//   const CLIENT_USERS_URL = "/clients/";
//   // const CLIENT_PURPOSE_URL = "https://konstruct.world/projects/client-purpose/";
//   const CLIENT_PURPOSE_URL = "/client-purpose/";
//   // const CLIENT_PURPOSE_DETAIL_URL = (userId) =>
//   //   `https://konstruct.world/projects/client-purpose/${userId}/`;
//   const CLIENT_PURPOSE_DETAIL_URL = (userId) => `/client-purpose/${userId}/`;
//   // const CLIENT_PURPOSE_SOFT_DELETE_URL = (assignmentId) =>
//   //   `https://konstruct.world/projects/client-purpose/${assignmentId}/soft-delete/`;
//   const CLIENT_PURPOSE_SOFT_DELETE_URL = (assignmentId) => `/client-purpose/${assignmentId}/soft-delete/`;

//   const [tab, setTab] = useState("manage");

//   // Purposes
//   const [purposes, setPurposes] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [addLoading, setAddLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [name, setName] = useState("");
//   const [success, setSuccess] = useState("");

//   // Mapping
//   const [users, setUsers] = useState([]);
//   const [mapLoading, setMapLoading] = useState(false);
//   const [assignStatus, setAssignStatus] = useState({});
//   const [selectedPurposes, setSelectedPurposes] = useState({});
//   const [assignedPurposes, setAssignedPurposes] = useState({});
//   const [viewingUserId, setViewingUserId] = useState(null);

//   // Fetch all purposes
//   const fetchPurposes = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const token = localStorage.getItem("ACCESS_TOKEN");
//       const res = await projectInstance.get(API_URL, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setPurposes(res.data);
//     } catch (e) {
//       setError("Failed to load purposes.");
//     }
//     setLoading(false);
//   };

//   // Fetch client users
//   const fetchClientUsers = async () => {
//     setMapLoading(true);
//     setError("");
//     try {
//       const token = localStorage.getItem("ACCESS_TOKEN");
//       const res = await axiosInstance.get(CLIENT_USERS_URL, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setUsers(res.data);
//     } catch (e) {
//       setError("Failed to load users.");
//     }
//     setMapLoading(false);
//   };

//   // Fetch assigned purposes for a client
//   const fetchAssignedPurposes = async (userId) => {
//     try {
//       const token = localStorage.getItem("ACCESS_TOKEN");
//       const res = await projectInstance.get(CLIENT_PURPOSE_DETAIL_URL(userId), {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setAssignedPurposes((prev) => ({
//         ...prev,
//         [userId]: res.data,
//       }));
//     } catch (e) {
//       setAssignedPurposes((prev) => ({
//         ...prev,
//         [userId]: [],
//       }));
//     }
//   };

//   useEffect(() => {
//     if (tab === "manage") fetchPurposes();
//     if (tab === "map") fetchClientUsers();
//     // eslint-disable-next-line
//   }, [tab]);

//   // Add new purpose
//   const handleAddPurpose = async (e) => {
//     e.preventDefault();
//     if (!name.trim()) return;
//     setAddLoading(true);
//     setError("");
//     setSuccess("");
//     try {
//       const token = localStorage.getItem("ACCESS_TOKEN");
//       await projectInstance.post(API_URL, { name }, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setSuccess("Purpose added successfully!");
//       setName("");
//       fetchPurposes();
//     } catch (e) {
//       if (
//         e.response &&
//         e.response.status === 400 &&
//         e.response.data?.name?.[0]
//       ) {
//         setError(e.response.data.name[0]);
//       } else {
//         setError("Failed to add purpose.");
//       }
//     }
//     setAddLoading(false);
//   };

//   // Multi-select for mapping
//   const handleSelectChange = (userId, selectedOptions) => {
//     setSelectedPurposes((prev) => ({
//       ...prev,
//       [userId]: Array.from(selectedOptions, (option) => Number(option.value)),
//     }));
//   };

//   // Assign purposes to user
//   const handleAssign = async (userId) => {
//     const purposeIds = selectedPurposes[userId];
//     if (!purposeIds || purposeIds.length === 0) return;
//     setAssignStatus((prev) => ({ ...prev, [userId]: "assigning" }));
//     setError("");
//     try {
//       const token = localStorage.getItem("ACCESS_TOKEN");
//       const promises = purposeIds.map((purposeId) =>
//         projectInstance.post(
//           CLIENT_PURPOSE_URL,
//           { client_id: userId, purpose_id: purposeId },
//           { headers: { Authorization: `Bearer ${token}` } }
//         )
//       );
//       await Promise.all(promises);
//       setAssignStatus((prev) => ({ ...prev, [userId]: "success" }));
//       fetchAssignedPurposes(userId);
//       setTimeout(() => {
//         setAssignStatus((prev) => ({ ...prev, [userId]: undefined }));
//       }, 3000);
//     } catch (e) {
//       setAssignStatus((prev) => ({ ...prev, [userId]: "error" }));
//     }
//   };

//   // Remove assigned purpose by assignmentId
//   const handleRemovePurpose = async (userId, assignmentId) => {
//     if (!window.confirm("Remove this purpose from client?")) return;
//     try {
//       const token = localStorage.getItem("ACCESS_TOKEN");
//       await axiosInstance.patch(
//         CLIENT_PURPOSE_SOFT_DELETE_URL(assignmentId),
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       fetchAssignedPurposes(userId);
//     } catch (e) {
//       alert("Failed to remove purpose.");
//     }
//   };

//   return (
//     <div style={{ background: bgColor, minHeight: "100vh" }} className="flex">
//       <SiteBarSetup />
//       <div className="flex-1 flex flex-col mt-5 ml-[16%] px-6 w-[84%]">
//         <div className="max-w-4xl mx-auto pt-2">

//           {/* --- Tabs --- */}
//           <div className="flex gap-2 mb-10 justify-center">
//             <button
//               style={{
//                 background: tab === "manage" ? "#fff" : "#fff7ed",
//                 color: tab === "manage" ? accentText : textMuted,
//                 borderBottom: tab === "manage"
//                   ? `2px solid ${borderColor}`
//                   : "2px solid transparent",
//               }}
//               className="px-7 py-3 text-lg rounded-t-xl font-semibold border-b-2 transition-all"
//               onClick={() => setTab("manage")}
//             >
//               🎯 Purpose Management
//             </button>
//             <button
//               style={{
//                 background: tab === "map" ? "#fff" : "#fff7ed",
//                 color: tab === "map" ? accentText : textMuted,
//                 borderBottom: tab === "map"
//                   ? `2px solid ${borderColor}`
//                   : "2px solid transparent",
//               }}
//               className="px-7 py-3 text-lg rounded-t-xl font-semibold border-b-2 transition-all"
//               onClick={() => setTab("map")}
//             >
//               🔗 Purpose Mapping
//             </button>
//           </div>

//           {/* --- Purpose Management Tab --- */}
//           {tab === "manage" && (
//             <div
//               className="rounded-2xl shadow-xl p-8 border"
//               style={{
//                 background: cardColor,
//                 borderColor,
//                 color: textColor,
//               }}
//             >
//               <div className="flex items-center gap-3 mb-6">
//                 <div
//                   style={{
//                     width: 12,
//                     height: 12,
//                     background: accentBg,
//                     borderRadius: "9999px",
//                   }}
//                 ></div>
//                 <h2 style={{ color: accentText, fontWeight: 700, fontSize: "1.5rem" }}>
//                   Create New Purpose
//                 </h2>
//               </div>
//               <form className="space-y-4" onSubmit={handleAddPurpose}>
//                 <div className="flex flex-col sm:flex-row gap-4">
//                   <div className="flex-1">
//                     <label
//                       style={{
//                         color: textSecondary,
//                         fontWeight: 500,
//                         fontSize: "0.95rem",
//                       }}
//                       className="block mb-2"
//                     >
//                       Purpose Name
//                     </label>
//                     <input
//                       type="text"
//                       value={name}
//                       onChange={(e) => setName(e.target.value)}
//                       placeholder="Enter purpose name"
//                       className="w-full px-4 py-3 rounded-xl border focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none"
//                       style={{
//                         background: cardColor,
//                         borderColor,
//                         color: textColor,
//                       }}
//                       required
//                       disabled={addLoading}
//                     />
//                   </div>
//                   <div className="sm:flex-shrink-0 sm:self-end">
//                     <button
//                       type="submit"
//                       disabled={addLoading || !name.trim()}
//                       className="w-full sm:w-auto px-8 py-3 rounded-xl text-white font-semibold shadow-lg"
//                       style={{
//                         background: accentBg,
//                         color: "#222",
//                         opacity: addLoading || !name.trim() ? 0.6 : 1,
//                         cursor: addLoading || !name.trim() ? "not-allowed" : "pointer",
//                       }}
//                     >
//                       {addLoading ? "Adding..." : <>➕ Add Purpose</>}
//                     </button>
//                   </div>
//                 </div>
//                 {error && (
//                   <div
//                     style={{
//                       background: "#fff0f0",
//                       border: "1px solid #fecaca",
//                       color: "#b91c1c",
//                     }}
//                     className="rounded-lg p-4 flex items-center gap-3"
//                   >
//                     <span className="text-lg">⚠️</span>
//                     <span>{error}</span>
//                   </div>
//                 )}
//                 {success && (
//                   <div
//                     style={{
//                       background: "#eafbe7",
//                       border: "1px solid #22c55e",
//                       color: "#15803d",
//                     }}
//                     className="rounded-lg p-4 flex items-center gap-3"
//                   >
//                     <span className="text-lg">✅</span>
//                     <span>{success}</span>
//                   </div>
//                 )}
//               </form>

//               {/* Purpose List */}
//               <div className="mt-8">
//                 <div className="flex items-center gap-3 mb-4">
//                   <div
//                     style={{
//                       width: 8,
//                       height: 8,
//                       background: accentBg,
//                       borderRadius: "9999px",
//                     }}
//                   ></div>
//                   <h3 style={{ color: accentText, fontWeight: 600, fontSize: "1.15rem" }}>
//                     Existing Purposes ({purposes.length})
//                   </h3>
//                 </div>
//                 {loading ? (
//                   <div className="py-8 text-center" style={{ color: textMuted }}>
//                     Loading...
//                   </div>
//                 ) : (
//                   <div
//                     className="rounded-xl overflow-hidden border"
//                     style={{ background: cardAlt, borderColor }}
//                   >
//                     {purposes.length === 0 ? (
//                       <div className="text-center py-12">
//                         <div style={{ fontSize: 48, color: textMuted, marginBottom: 12 }}>
//                           📋
//                         </div>
//                         <p style={{ color: textMuted, fontSize: 18 }}>
//                           No purposes created yet
//                         </p>
//                         <p style={{ color: textMuted, fontSize: 14, marginTop: 8 }}>
//                           Add your first purpose above to get started
//                         </p>
//                       </div>
//                     ) : (
//                       <div className="overflow-x-auto">
//                         <table className="w-full">
//                           <thead>
//                             <tr
//                               className="border-b"
//                               style={{ background: cardColor, borderColor }}
//                             >
//                               <th
//                                 className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider"
//                                 style={{ color: textSecondary }}
//                               >
//                                 #
//                               </th>
//                               <th
//                                 className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider"
//                                 style={{ color: textSecondary }}
//                               >
//                                 Purpose Name
//                               </th>
//                               <th
//                                 className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider"
//                                 style={{ color: textSecondary }}
//                               >
//                                 Created Date
//                               </th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {purposes.map((purpose, idx) => (
//                               <tr
//                                 key={purpose.id}
//                                 className="transition-colors"
//                                 style={{ background: idx % 2 ? cardAlt : "#fff" }}
//                               >
//                                 <td className="py-4 px-6" style={{ color: textMuted }}>
//                                   {String(idx + 1).padStart(2, "0")}
//                                 </td>
//                                 <td className="py-4 px-6">
//                                   <span
//                                     style={{ color: textColor, fontWeight: 500 }}
//                                   >
//                                     {purpose.name}
//                                   </span>
//                                 </td>
//                                 <td className="py-4 px-6" style={{ color: textSecondary }}>
//                                   {new Date(purpose.created_at).toLocaleDateString(
//                                     "en-US",
//                                     {
//                                       year: "numeric",
//                                       month: "short",
//                                       day: "numeric",
//                                       hour: "2-digit",
//                                       minute: "2-digit",
//                                     }
//                                   )}
//                                 </td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* --- Purpose Mapping Tab --- */}
//           {tab === "map" && (
//             <div
//               className="rounded-2xl shadow-xl p-8 border"
//               style={{
//                 background: cardColor,
//                 borderColor,
//                 color: textColor,
//               }}
//             >
//               <div className="flex items-center gap-3 mb-6">
//                 <div
//                   style={{
//                     width: 12,
//                     height: 12,
//                     background: accentBg,
//                     borderRadius: "9999px",
//                   }}
//                 ></div>
//                 <h2 style={{ color: accentText, fontWeight: 700, fontSize: "1.5rem" }}>
//                   Assign and Manage Purposes for Clients
//                 </h2>
//               </div>
//               {mapLoading ? (
//                 <div className="flex items-center justify-center py-12">
//                   <div
//                     className="animate-spin"
//                     style={{
//                       width: 32,
//                       height: 32,
//                       border: "3px solid #3b82f6",
//                       borderTop: "3px solid transparent",
//                       borderRadius: "50%",
//                     }}
//                   ></div>
//                   <span style={{ marginLeft: 12, color: textSecondary }}>
//                     Loading clients...
//                   </span>
//                 </div>
//               ) : users.length === 0 ? (
//                 <div className="text-center py-12">
//                   <div style={{ fontSize: 48, color: textMuted, marginBottom: 12 }}>
//                     👥
//                   </div>
//                   <p style={{ color: textMuted, fontSize: 18 }}>No clients found</p>
//                   <p style={{ color: textMuted, fontSize: 14, marginTop: 8 }}>
//                     Add clients to start assigning purposes
//                   </p>
//                 </div>
//               ) : (
//                 <div
//                   className="rounded-xl overflow-hidden border"
//                   style={{ background: cardAlt, borderColor }}
//                 >
//                   <div className="overflow-x-auto">
//                     <table className="w-full">
//                       <thead>
//                         <tr className="border-b" style={{ background: cardColor, borderColor }}>
//                           <th
//                             className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider"
//                             style={{ color: textSecondary }}
//                           >
//                             Client
//                           </th>
//                           <th
//                             className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider"
//                             style={{ color: textSecondary }}
//                           >
//                             Map Purposes
//                           </th>
//                           <th
//                             className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider"
//                             style={{ color: textSecondary }}
//                           >
//                             Actions
//                           </th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {users.map((user) => (
//                           <tr
//                             key={user.id}
//                             className="transition-colors"
//                             style={{ background: cardAlt }}
//                           >
//                             <td className="py-6 px-6">
//                               <div className="flex items-center gap-3">
//                                 <div
//                                   style={{
//                                     width: 40,
//                                     height: 40,
//                                     background: `linear-gradient(135deg, #ffa726, #ffd54f)`,
//                                     borderRadius: "9999px",
//                                     display: "flex",
//                                     alignItems: "center",
//                                     justifyContent: "center",
//                                     color: "#fff",
//                                     fontWeight: "bold",
//                                     fontSize: 20,
//                                   }}
//                                 >
//                                   {(user.username ||
//                                     user.email ||
//                                     user.name ||
//                                     "U"
//                                   )
//                                     .charAt(0)
//                                     .toUpperCase()}
//                                 </div>
//                                 <div>
//                                   <div
//                                     style={{
//                                       fontWeight: 600,
//                                       color: textColor,
//                                     }}
//                                   >
//                                     {user.username || user.name || "Unknown User"}
//                                   </div>
//                                   {user.email && (
//                                     <div
//                                       style={{
//                                         color: textMuted,
//                                         fontSize: 14,
//                                       }}
//                                     >
//                                       {user.email}
//                                     </div>
//                                   )}
//                                 </div>
//                               </div>
//                             </td>
//                             <td className="py-6 px-6">
//                               <select
//                                 multiple
//                                 className="w-full p-2 border rounded"
//                                 style={{
//                                   minHeight: 80,
//                                   background: theme === "dark" ? "#23232e" : "#fff",
//                                   color: textColor,
//                                   borderColor,
//                                 }}
//                                 value={selectedPurposes[user.id] || []}
//                                 onChange={(e) =>
//                                   handleSelectChange(user.id, e.target.selectedOptions)
//                                 }
//                               >
//                                 {purposes.map((purpose) => (
//                                   <option key={purpose.id} value={purpose.id}>
//                                     {purpose.name}
//                                   </option>
//                                 ))}
//                               </select>
//                               <div style={{ fontSize: 12, color: textMuted, marginTop: 4 }}>
//                                 Hold <b>Ctrl</b> (Windows) or <b>Cmd</b> (Mac) to select multiple
//                               </div>
//                               {(selectedPurposes[user.id] || []).length > 0 && (
//                                 <div style={{ marginTop: 8, fontSize: 12, color: "#16a34a" }}>
//                                   {selectedPurposes[user.id].length} purpose(s) selected
//                                 </div>
//                               )}
//                             </td>
//                             <td className="py-6 px-6" style={{ minWidth: 180 }}>
//                               <button
//                                 disabled={
//                                   !(
//                                     selectedPurposes[user.id] &&
//                                     selectedPurposes[user.id].length > 0
//                                   ) || assignStatus[user.id] === "assigning"
//                                 }
//                                 onClick={() => handleAssign(user.id)}
//                                 style={{
//                                   padding: "8px 18px",
//                                   borderRadius: 10,
//                                   fontWeight: 600,
//                                   marginBottom: 6,
//                                   marginRight: 8,
//                                   background:
//                                     assignStatus[user.id] === "assigning"
//                                       ? "#fde047"
//                                       : assignStatus[user.id] === "success"
//                                       ? "#22c55e"
//                                       : assignStatus[user.id] === "error"
//                                       ? "#ef4444"
//                                       : (selectedPurposes[user.id] &&
//                                           selectedPurposes[user.id].length > 0)
//                                       ? ORANGE
//                                       : "#e5e7eb",
//                                   color:
//                                     assignStatus[user.id] === "error"
//                                       ? "#fff"
//                                       : "#222",
//                                   opacity:
//                                     assignStatus[user.id] === "assigning" ||
//                                     !(selectedPurposes[user.id] &&
//                                       selectedPurposes[user.id].length > 0)
//                                       ? 0.7
//                                       : 1,
//                                   cursor:
//                                     assignStatus[user.id] === "assigning" ||
//                                     !(selectedPurposes[user.id] &&
//                                       selectedPurposes[user.id].length > 0)
//                                       ? "not-allowed"
//                                       : "pointer",
//                                   transition: "all .15s",
//                                 }}
//                               >
//                                 {assignStatus[user.id] === "assigning"
//                                   ? "Assigning..."
//                                   : assignStatus[user.id] === "success"
//                                   ? "✅ Assigned"
//                                   : assignStatus[user.id] === "error"
//                                   ? "❌ Error"
//                                   : `🎯 Assign (${(selectedPurposes[user.id] || []).length})`}
//                               </button>
//                               <button
//                                 style={{
//                                   fontSize: 14,
//                                   color: "#2563eb",
//                                   textDecoration: "underline",
//                                   background: "transparent",
//                                   marginTop: 6,
//                                   cursor: "pointer",
//                                 }}
//                                 onClick={() => {
//                                   setViewingUserId(
//                                     viewingUserId === user.id ? null : user.id
//                                   );
//                                   if (viewingUserId !== user.id)
//                                     fetchAssignedPurposes(user.id);
//                                 }}
//                               >
//                                 {viewingUserId === user.id
//                                   ? "Hide Assigned"
//                                   : "View Assigned"}
//                               </button>
//                               {viewingUserId === user.id && (
//                                 <div
//                                   style={{
//                                     marginTop: 10,
//                                     borderRadius: 7,
//                                     border: "1px solid #ffbe63",
//                                     background: "#fff7ed",
//                                     padding: 10,
//                                     fontSize: 14,
//                                   }}
//                                 >
//                                   <div
//                                     style={{
//                                       fontWeight: 600,
//                                       marginBottom: 5,
//                                       color: accentText,
//                                     }}
//                                   >
//                                     Assigned Purposes:
//                                   </div>
//                                   {Array.isArray(assignedPurposes[user.id]) &&
//                                   assignedPurposes[user.id].length === 0 ? (
//                                     <div style={{ color: textMuted, fontSize: 13 }}>
//                                       No purposes assigned
//                                     </div>
//                                   ) : (
//                                     <ul style={{ fontSize: 13 }}>
//                                       {assignedPurposes[user.id]?.map((ap) => (
//                                         <li
//                                           key={ap.id}
//                                           style={{
//                                             display: "flex",
//                                             alignItems: "center",
//                                             justifyContent: "space-between",
//                                             marginBottom: 3,
//                                           }}
//                                         >
//                                           <span>{ap.purpose_name || ap.name}</span>
//                                           <button
//                                             style={{
//                                               marginLeft: 6,
//                                               background: "#fee2e2",
//                                               color: "#b91c1c",
//                                               borderRadius: 5,
//                                               fontSize: 12,
//                                               padding: "2px 8px",
//                                               border: "none",
//                                               cursor: "pointer",
//                                             }}
//                                             onClick={() =>
//                                               handleRemovePurpose(user.id, ap.id)
//                                             }
//                                           >
//                                             Remove
//                                           </button>
//                                         </li>
//                                       ))}
//                                     </ul>
//                                   )}
//                                 </div>
//                               )}
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default PurposeCenter;


import React, { useEffect, useState } from "react";
import SiteBarSetup from "./SideBarSetup";
import { useTheme } from "../ThemeContext";
import { projectInstance } from "../api/axiosInstance";
import axiosInstance from "../api/axiosInstance";

// PALETTE
const ORANGE = "#ffbe63";
const BG_BLACK = "#000";
const CARD_BG = "#111";
const BORDER_COLOR = ORANGE;
const TEXT_ORANGE = ORANGE;

function PurposeCenter() {
  const { theme } = useTheme();

  // Colors
  const bgColor = theme === "dark" ? BG_BLACK : "#fcfaf7";
  const cardColor = theme === "dark" ? CARD_BG : "#fff";
  const borderColor = BORDER_COLOR;
  const textColor = theme === "dark" ? TEXT_ORANGE : "#222";
  const buttonBg = ORANGE;
  const buttonText = "#000";
  const inputBg = theme === "dark" ? "#191919" : "#fff";
  const inputText = theme === "dark" ? TEXT_ORANGE : "#222";
  const tableHeaderBg = theme === "dark" ? "#000" : "#fff7ea";
  const tableRowBg = theme === "dark" ? "#111" : "#fff";
  const tabActiveBg = theme === "dark" ? "#000" : "#fff";
  const tabInactiveBg = theme === "dark" ? "#111" : "#fff7ed";
  const tabActiveText = textColor;
  const tabInactiveText = textColor;
  const errorBg = "#1a0903";
  const errorText = "#ffbe63";
  const successBg = "#15301a";
  const successText = "#ffbe63";

  // API endpoints
  const API_URL = "/all-purposes/";
  const CLIENT_USERS_URL = "/clients/";
  const CLIENT_PURPOSE_URL = "/client-purpose/";
  const CLIENT_PURPOSE_DETAIL_URL = (userId) => `/client-purpose/${userId}/`;
  const CLIENT_PURPOSE_SOFT_DELETE_URL = (assignmentId) =>
    `/client-purpose/${assignmentId}/soft-delete/`;

  const [tab, setTab] = useState("manage");
  const [purposes, setPurposes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [success, setSuccess] = useState("");
  const [users, setUsers] = useState([]);
  const [mapLoading, setMapLoading] = useState(false);
  const [assignStatus, setAssignStatus] = useState({});
  const [selectedPurposes, setSelectedPurposes] = useState({});
  const [assignedPurposes, setAssignedPurposes] = useState({});
  const [viewingUserId, setViewingUserId] = useState(null);

  // Fetch all purposes
  const fetchPurposes = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("ACCESS_TOKEN");
      const res = await projectInstance.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPurposes(res.data);
    } catch (e) {
      setError("Failed to load purposes.");
    }
    setLoading(false);
  };

  // Fetch client users
  const fetchClientUsers = async () => {
    setMapLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("ACCESS_TOKEN");
      const res = await axiosInstance.get(CLIENT_USERS_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (e) {
      setError("Failed to load users.");
    }
    setMapLoading(false);
  };

  // Fetch assigned purposes for a client
  const fetchAssignedPurposes = async (userId) => {
    try {
      const token = localStorage.getItem("ACCESS_TOKEN");
      const res = await projectInstance.get(CLIENT_PURPOSE_DETAIL_URL(userId), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssignedPurposes((prev) => ({
        ...prev,
        [userId]: res.data,
      }));
    } catch (e) {
      setAssignedPurposes((prev) => ({
        ...prev,
        [userId]: [],
      }));
    }
  };

  useEffect(() => {
    if (tab === "manage") fetchPurposes();
    if (tab === "map") fetchClientUsers();
    // eslint-disable-next-line
  }, [tab]);

  // Add new purpose
  const handleAddPurpose = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setAddLoading(true);
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("ACCESS_TOKEN");
      await projectInstance.post(
        API_URL,
        { name },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess("Purpose added successfully!");
      setName("");
      fetchPurposes();
    } catch (e) {
      if (
        e.response &&
        e.response.status === 400 &&
        e.response.data?.name?.[0]
      ) {
        setError(e.response.data.name[0]);
      } else {
        setError("Failed to add purpose.");
      }
    }
    setAddLoading(false);
  };

  // Multi-select for mapping
  const handleSelectChange = (userId, selectedOptions) => {
    setSelectedPurposes((prev) => ({
      ...prev,
      [userId]: Array.from(selectedOptions, (option) => Number(option.value)),
    }));
  };

  // Assign purposes to user
  const handleAssign = async (userId) => {
    const purposeIds = selectedPurposes[userId];
    if (!purposeIds || purposeIds.length === 0) return;
    setAssignStatus((prev) => ({ ...prev, [userId]: "assigning" }));
    setError("");
    try {
      const token = localStorage.getItem("ACCESS_TOKEN");
      const promises = purposeIds.map((purposeId) =>
        projectInstance.post(
          CLIENT_PURPOSE_URL,
          { client_id: userId, purpose_id: purposeId },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );
      await Promise.all(promises);
      setAssignStatus((prev) => ({ ...prev, [userId]: "success" }));
      fetchAssignedPurposes(userId);
      setTimeout(() => {
        setAssignStatus((prev) => ({ ...prev, [userId]: undefined }));
      }, 3000);
    } catch (e) {
      setAssignStatus((prev) => ({ ...prev, [userId]: "error" }));
    }
  };

  // Remove assigned purpose by assignmentId
  const handleRemovePurpose = async (userId, assignmentId) => {
    if (!window.confirm("Remove this purpose from client?")) return;
    try {
      const token = localStorage.getItem("ACCESS_TOKEN");
      await axiosInstance.patch(
        CLIENT_PURPOSE_SOFT_DELETE_URL(assignmentId),
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAssignedPurposes(userId);
    } catch (e) {
      alert("Failed to remove purpose.");
    }
  };

  return (
    <div style={{ background: bgColor, minHeight: "100vh" }} className="flex">
      {/* SideBar shift logic */}
      {/* <SiteBarSetup /> */}
      {/* <div className="flex-1 flex flex-col mt-5 ml-[16%] px-6 w-[84%]"> */}
      <div className="max-w-4xl mx-auto pt-2">
        {/* Tabs */}
        <div className="flex gap-2 mb-10 justify-center">
          <button
            style={{
              background: tab === "manage" ? tabActiveBg : tabInactiveBg,
              color: tab === "manage" ? tabActiveText : tabInactiveText,
              borderBottom:
                tab === "manage"
                  ? `2px solid ${borderColor}`
                  : "2px solid transparent",
              fontWeight: 700,
              opacity: tab === "manage" ? 1 : 0.55,
              padding: "1rem 2.2rem",
              borderRadius: "18px 18px 0 0",
              fontSize: 18,
            }}
            onClick={() => setTab("manage")}
          >
            🎯 Purpose Management
          </button>
          <button
            style={{
              background: tab === "map" ? tabActiveBg : tabInactiveBg,
              color: tab === "map" ? tabActiveText : tabInactiveText,
              borderBottom:
                tab === "map"
                  ? `2px solid ${borderColor}`
                  : "2px solid transparent",
              fontWeight: 700,
              opacity: tab === "map" ? 1 : 0.55,
              padding: "1rem 2.2rem",
              borderRadius: "18px 18px 0 0",
              fontSize: 18,
            }}
            onClick={() => setTab("map")}
          >
            🔗 Purpose Mapping
          </button>
        </div>

        {/* --- Purpose Management Tab --- */}
        {tab === "manage" && (
          <div
            className="rounded-2xl shadow-xl p-8 border"
            style={{
              background: cardColor,
              borderColor,
              color: textColor,
              borderWidth: 2,
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                style={{
                  width: 14,
                  height: 14,
                  background: borderColor,
                  borderRadius: "9999px",
                }}
              ></div>
              <h2
                style={{
                  color: textColor,
                  fontWeight: 900,
                  fontSize: "2rem",
                }}
              >
                Create New Purpose
              </h2>
            </div>
            <form className="space-y-4" onSubmit={handleAddPurpose}>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label
                    style={{
                      color: textColor,
                      fontWeight: 600,
                      fontSize: "1.1rem",
                    }}
                    className="block mb-2"
                  >
                    Purpose Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter purpose name"
                    className="w-full px-4 py-3 rounded-xl border outline-none"
                    style={{
                      background: inputBg,
                      borderColor: borderColor,
                      color: inputText,
                      fontWeight: 600,
                      fontSize: 18,
                    }}
                    required
                    disabled={addLoading}
                  />
                </div>
                <div className="sm:flex-shrink-0 sm:self-end flex items-end">
                  <button
                    type="submit"
                    disabled={addLoading || !name.trim()}
                    className="w-full sm:w-auto px-8 py-3 rounded-xl shadow-lg"
                    style={{
                      background: buttonBg,
                      color: buttonText,
                      fontWeight: 800,
                      fontSize: 18,
                      opacity: addLoading || !name.trim() ? 0.6 : 1,
                      cursor:
                        addLoading || !name.trim() ? "not-allowed" : "pointer",
                      border: "none",
                      transition: "all .16s",
                    }}
                  >
                    {addLoading ? "Adding..." : <>+ Add Purpose</>}
                  </button>
                </div>
              </div>
              {error && (
                <div
                  className="rounded-lg p-4 flex items-center gap-3"
                  style={{
                    background: errorBg,
                    color: errorText,
                    border: `1.5px solid ${borderColor}`,
                    fontWeight: 700,
                  }}
                >
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div
                  className="rounded-lg p-4 flex items-center gap-3"
                  style={{
                    background: successBg,
                    color: successText,
                    border: `1.5px solid #22c55e`,
                    fontWeight: 700,
                  }}
                >
                  <span>✅</span>
                  <span>{success}</span>
                </div>
              )}
            </form>

            {/* Purpose List */}
            <div className="mt-8">
              <div className="flex items-center gap-3 mb-4">
                <div
                  style={{
                    width: 8,
                    height: 8,
                    background: borderColor,
                    borderRadius: "9999px",
                  }}
                ></div>
                <h3
                  style={{
                    color: textColor,
                    fontWeight: 900,
                    fontSize: "1.4rem",
                  }}
                >
                  Existing Purposes ({purposes.length})
                </h3>
              </div>
              {loading ? (
                <div className="py-8 text-center" style={{ color: textColor }}>
                  Loading...
                </div>
              ) : (
                <div
                  className="rounded-xl overflow-hidden border"
                  style={{ background: cardColor, borderColor }}
                >
                  {purposes.length === 0 ? (
                    <div
                      className="text-center py-12"
                      style={{ color: textColor }}
                    >
                      <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                      <p style={{ fontSize: 18 }}>No purposes created yet</p>
                      <p style={{ fontSize: 14, marginTop: 8 }}>
                        Add your first purpose above to get started
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full" style={{ borderColor }}>
                        <thead>
                          <tr style={{ background: tableHeaderBg }}>
                            <th
                              className="py-4 px-6 text-left text-sm font-extrabold uppercase tracking-wider"
                              style={{
                                color: textColor,
                                borderColor,
                                borderBottom: `1.5px solid ${borderColor}`,
                              }}
                            >
                              #
                            </th>
                            <th
                              className="py-4 px-6 text-left text-sm font-extrabold uppercase tracking-wider"
                              style={{
                                color: textColor,
                                borderColor,
                                borderBottom: `1.5px solid ${borderColor}`,
                              }}
                            >
                              Purpose Name
                            </th>
                            <th
                              className="py-4 px-6 text-left text-sm font-extrabold uppercase tracking-wider"
                              style={{
                                color: textColor,
                                borderColor,
                                borderBottom: `1.5px solid ${borderColor}`,
                              }}
                            >
                              Created Date
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {purposes.map((purpose, idx) => (
                            <tr
                              key={purpose.id}
                              style={{
                                background: tableRowBg,
                                color: textColor,
                                borderBottom: `1.5px solid ${borderColor}`,
                                fontWeight: 700,
                              }}
                            >
                              <td
                                className="py-4 px-6"
                                style={{ color: textColor }}
                              >
                                {String(idx + 1).padStart(2, "0")}
                              </td>
                              <td
                                className="py-4 px-6"
                                style={{ color: textColor }}
                              >
                                {purpose.name}
                              </td>
                              <td
                                className="py-4 px-6"
                                style={{ color: textColor }}
                              >
                                {new Date(
                                  purpose.created_at
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
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
        )}

        {/* --- Purpose Mapping Tab --- */}
        {tab === "map" && (
          <div
            className="rounded-2xl shadow-xl p-8 border"
            style={{
              background: cardColor,
              borderColor,
              color: textColor,
              borderWidth: 2,
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                style={{
                  width: 14,
                  height: 14,
                  background: borderColor,
                  borderRadius: "9999px",
                }}
              ></div>
              <h2
                style={{
                  color: textColor,
                  fontWeight: 900,
                  fontSize: "2rem",
                }}
              >
                Assign and Manage Purposes for Clients
              </h2>
            </div>
            {mapLoading ? (
              <div
                className="flex items-center justify-center py-12"
                style={{ color: textColor }}
              >
                <div
                  className="animate-spin"
                  style={{
                    width: 32,
                    height: 32,
                    border: `3px solid ${borderColor}`,
                    borderTop: "3px solid transparent",
                    borderRadius: "50%",
                  }}
                ></div>
                <span style={{ marginLeft: 12 }}>Loading clients...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12" style={{ color: textColor }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
                <p style={{ fontSize: 18 }}>No clients found</p>
                <p style={{ fontSize: 14, marginTop: 8 }}>
                  Add clients to start assigning purposes
                </p>
              </div>
            ) : (
              <div
                className="rounded-xl overflow-hidden border"
                style={{ background: cardColor, borderColor }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full" style={{ borderColor }}>
                    <thead>
                      <tr style={{ background: tableHeaderBg }}>
                        <th
                          className="py-4 px-6 text-left text-sm font-extrabold uppercase tracking-wider"
                          style={{
                            color: textColor,
                            borderColor,
                            borderBottom: `1.5px solid ${borderColor}`,
                          }}
                        >
                          Client
                        </th>
                        <th
                          className="py-4 px-6 text-left text-sm font-extrabold uppercase tracking-wider"
                          style={{
                            color: textColor,
                            borderColor,
                            borderBottom: `1.5px solid ${borderColor}`,
                          }}
                        >
                          Map Purposes
                        </th>
                        <th
                          className="py-4 px-6 text-left text-sm font-extrabold uppercase tracking-wider"
                          style={{
                            color: textColor,
                            borderColor,
                            borderBottom: `1.5px solid ${borderColor}`,
                          }}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr
                          key={user.id}
                          style={{
                            background: tableRowBg,
                            color: textColor,
                            borderBottom: `1.5px solid ${borderColor}`,
                            fontWeight: 700,
                          }}
                        >
                          <td
                            className="py-6 px-6"
                            style={{ color: textColor }}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                style={{
                                  width: 40,
                                  height: 40,
                                  background: `linear-gradient(135deg, #ffbe63, #ffaa00)`,
                                  borderRadius: "9999px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#000",
                                  fontWeight: "bold",
                                  fontSize: 20,
                                }}
                              >
                                {(
                                  user.username ||
                                  user.email ||
                                  user.name ||
                                  "U"
                                )
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                              <div>
                                <div
                                  style={{
                                    fontWeight: 700,
                                    color: textColor,
                                  }}
                                >
                                  {user.username || user.name || "Unknown User"}
                                </div>
                                {user.email && (
                                  <div
                                    style={{ color: textColor, fontSize: 14 }}
                                  >
                                    {user.email}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td
                            className="py-6 px-6"
                            style={{ color: textColor }}
                          >
                            <select
                              multiple
                              className="w-full p-2 border rounded"
                              style={{
                                minHeight: 80,
                                background: cardColor,
                                color: textColor,
                                borderColor,
                                fontWeight: 700,
                                fontSize: 16,
                              }}
                              value={selectedPurposes[user.id] || []}
                              onChange={(e) =>
                                handleSelectChange(
                                  user.id,
                                  e.target.selectedOptions
                                )
                              }
                            >
                              {purposes.map((purpose) => (
                                <option key={purpose.id} value={purpose.id}>
                                  {purpose.name}
                                </option>
                              ))}
                            </select>
                            {(selectedPurposes[user.id] || []).length > 0 && (
                              <div
                                style={{
                                  marginTop: 8,
                                  fontSize: 13,
                                  color: ORANGE,
                                }}
                              >
                                {selectedPurposes[user.id].length} purpose(s)
                                selected
                              </div>
                            )}
                          </td>
                          <td className="py-6 px-6" style={{ minWidth: 180 }}>
                            <button
                              disabled={
                                !(
                                  selectedPurposes[user.id] &&
                                  selectedPurposes[user.id].length > 0
                                ) || assignStatus[user.id] === "assigning"
                              }
                              onClick={() => handleAssign(user.id)}
                              style={{
                                padding: "8px 18px",
                                borderRadius: 10,
                                fontWeight: 900,
                                background:
                                  assignStatus[user.id] === "assigning"
                                    ? "#444"
                                    : assignStatus[user.id] === "success"
                                    ? "#15301a"
                                    : assignStatus[user.id] === "error"
                                    ? "#1a0903"
                                    : selectedPurposes[user.id] &&
                                      selectedPurposes[user.id].length > 0
                                    ? buttonBg
                                    : "#222",
                                color: assignStatus[user.id]
                                  ? ORANGE
                                  : buttonText,
                                opacity:
                                  assignStatus[user.id] === "assigning" ||
                                  !(
                                    selectedPurposes[user.id] &&
                                    selectedPurposes[user.id].length > 0
                                  )
                                    ? 0.7
                                    : 1,
                                cursor:
                                  assignStatus[user.id] === "assigning" ||
                                  !(
                                    selectedPurposes[user.id] &&
                                    selectedPurposes[user.id].length > 0
                                  )
                                    ? "not-allowed"
                                    : "pointer",
                                border: "none",
                                fontSize: 15,
                              }}
                            >
                              {assignStatus[user.id] === "assigning"
                                ? "Assigning..."
                                : assignStatus[user.id] === "success"
                                ? "✅ Assigned"
                                : assignStatus[user.id] === "error"
                                ? "❌ Error"
                                : `🎯 Assign (${
                                    (selectedPurposes[user.id] || []).length
                                  })`}
                            </button>
                            <button
                              style={{
                                fontSize: 14,
                                color: ORANGE,
                                background: "transparent",
                                marginTop: 10,
                                cursor: "pointer",
                                border: "none",
                                textDecoration: "underline",
                                fontWeight: 800,
                              }}
                              onClick={() => {
                                setViewingUserId(
                                  viewingUserId === user.id ? null : user.id
                                );
                                if (viewingUserId !== user.id)
                                  fetchAssignedPurposes(user.id);
                              }}
                            >
                              {viewingUserId === user.id
                                ? "Hide Assigned"
                                : "View Assigned"}
                            </button>
                            {viewingUserId === user.id && (
                              <div
                                style={{
                                  marginTop: 10,
                                  borderRadius: 7,
                                  border: `1.5px solid ${borderColor}`,
                                  background: "#fffbe8",
                                  padding: 10,
                                  fontSize: 14,
                                  color: textColor,
                                }}
                              >
                                <div
                                  style={{
                                    fontWeight: 800,
                                    marginBottom: 5,
                                    color: ORANGE,
                                    fontSize: 16,
                                  }}
                                >
                                  Assigned Purposes:
                                </div>
                                {Array.isArray(assignedPurposes[user.id]) &&
                                assignedPurposes[user.id].length === 0 ? (
                                  <div
                                    style={{ color: textColor, fontSize: 13 }}
                                  >
                                    No purposes assigned
                                  </div>
                                ) : (
                                  <ul style={{ fontSize: 13 }}>
                                    {assignedPurposes[user.id]?.map((ap) => (
                                      <li
                                        key={ap.id}
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "space-between",
                                          marginBottom: 3,
                                          color: textColor,
                                        }}
                                      >
                                        <span>
                                          {ap.purpose_name || ap.name}
                                        </span>
                                        <button
                                          style={{
                                            marginLeft: 6,
                                            background: "#1a0903",
                                            color: ORANGE,
                                            borderRadius: 5,
                                            fontSize: 12,
                                            padding: "2px 8px",
                                            border: "none",
                                            fontWeight: 900,
                                            cursor: "pointer",
                                          }}
                                          onClick={() =>
                                            handleRemovePurpose(user.id, ap.id)
                                          }
                                        >
                                          Remove
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    // </div>
  );
}

export default PurposeCenter;

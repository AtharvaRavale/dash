// import React, { useEffect, useState } from "react";
// import {
//   createPhase,
//   createPurpose,
//   createStage,
//   editStage,
//   deleteStage,
//   editPurpose,
//   deletePurpose,
//   editPhase,
//   deletePhase,
// } from "../../api";
// import { showToast } from "../../utils/toast";
// import { useSelector, useDispatch } from "react-redux";
// import { setPurposes, setPhases, setStages } from "../../store/userSlice";
// import { Check, Edit3, Trash2, Plus, X } from "lucide-react";
// import { useTheme } from "../../ThemeContext";
// import { projectInstance } from '../../api/axiosInstance';

// const TABS = [
//   { key: "Purpose", label: "Purpose" },
//   { key: "Phases", label: "Phases" },
//   { key: "Stages", label: "Stages" },
// ];

// const showApiErrors = (error, fallbackMsg = "An error occurred.") => {
//   const apiErrors = error?.response?.data;
//   if (apiErrors && typeof apiErrors === "object") {
//     Object.values(apiErrors).forEach((errArr) => {
//       if (Array.isArray(errArr)) {
//         errArr.forEach((msg) => showToast(String(msg)));
//       } else if (typeof errArr === "string" || typeof errArr === "number") {
//         showToast(String(errArr));
//       } else {
//         showToast(JSON.stringify(errArr));
//       }
//     });
//   } else {
//     showToast(fallbackMsg);
//   }
// };

// function Stages({ nextStep, previousStep }) {
//   const dispatch = useDispatch();
//   const projectId = useSelector((state) => state.user.selectedProject.id);
//   const { theme } = useTheme(); // get current theme

//   // Define palette based on theme
//   const palette =
//     theme === "dark"
//       ? {
//           ORANGE: "#fbbf24",
//           ORANGE_DARK: "#ca8a04",
//           ORANGE_LIGHT: "#403d39",
//           BG_GRAY: "#181820",
//           BORDER_GRAY: "#57514f",
//           TEXT_GRAY: "#e4e1de",
//           BG_WHITE: "#23232e",
//           INPUT_BG: "#2f2f38",
//           INPUT_BORDER: "#ca8a04",
//         }
//       : {
//           ORANGE: "#b54b13",
//           ORANGE_DARK: "#882c10",
//           ORANGE_LIGHT: "#ede1d3",
//           BG_GRAY: "#e6e3df",
//           BORDER_GRAY: "#a29991",
//           TEXT_GRAY: "#29252c",
//           BG_WHITE: "#fff",
//           INPUT_BG: "#fff",
//           INPUT_BORDER: "#b54b13",
//         };

//   // Main state
//   const [isCreateStage, setIsCreateStage] = useState(false);
//   const [purposeData, setPurposeData] = useState([]);
//   const [clientPurposes, setClientPurposes] = useState([]);
//   const [phasesData, setPhasesData] = useState([]);
//   const [stagesData, setStagesData] = useState([]);

//   // Creation form state
//   const [selectedPurpose, setSelectedPurpose] = useState("");
//   const [phaseName, setPhaseName] = useState("");
//   const [newPurpose, setNewPurpose] = useState("");
//   const [selectedPhase, setSelectedPhase] = useState("");
//   const [stageName, setStageName] = useState("");
//   const [activeSection, setActiveSection] = useState("Purpose");

//   // Edit state - Purpose
//   const [editPurposeId, setEditPurposeId] = useState(null);
//   const [editPurposeName, setEditPurposeName] = useState("");

//   // Edit state - Phase
//   const [editPhaseId, setEditPhaseId] = useState(null);
//   const [editPhaseName, setEditPhaseName] = useState("");
//   const [editPhasePurpose, setEditPhasePurpose] = useState("");

//   // Edit state - Stage
//   const [editIndex, setEditIndex] = useState(null);
//   const [editedStageName, setEditedStageName] = useState("");
//   const [editedSequence, setEditedSequence] = useState(1);
//   const [isSaving, setIsSaving] = useState(false);
//   // const [userData, setUserData] = useState(null);
//   // useEffect(() => {
//   //   const userString = localStorage.getItem("USER_DATA");
//   //   if (userString && userString !== "undefined") {
//   //     const parsedUserData = JSON.parse(userString);
//   //     setUserData(parsedUserData);
//   //   }
//   // }, []);

//   // const userId = userData?.user_id; // Add optional chaining
//   // console.log("this is user identity",userId)
//   const [userData, setUserData] = useState(null);
//   useEffect(() => {
//     const userString = localStorage.getItem("USER_DATA");
//     if (userString && userString !== "undefined") {
//       const parsedUserData = JSON.parse(userString);
//       setUserData(parsedUserData);
//     }
//   }, []);

//   useEffect(() => {
//     if (userData?.user_id) {
//       getClientPurposes();
//     }
//   }, [userData]);

//   const userId = userData?.user_id; // Add optional chaining
//   console.log("this is user identity", userId);

//   // --- Fetch helpers ---
//   // --- Fetch helpers ---
//   const getClientPurposes = async () => {
//     try {
//       if (!userId) return [];

//       console.log("Fetching client purposes for user:", userId);
//       const token = localStorage.getItem("ACCESS_TOKEN");
//       const response = await projectInstance.get(
//         `/client-purpose/${userId}/`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       console.log("Client purposes response:", response.data);
//       console.log(
//         "Client purposes detailed:",
//         JSON.stringify(response.data, null, 2)
//       );
//       if (response.status === 200) {
//         setClientPurposes(response.data || []);
//         return response.data || [];
//       }
//     } catch (error) {
//       console.error("Client purposes error:", error);
//       showApiErrors(error, "Failed to fetch client purposes");
//       setClientPurposes([]);
//       return [];
//     }
//   };

//   const getPurposes = async () => {
//     if (projectId) {
//       try {
//         const response = await projectInstance.get(
//           `/purpose/get-purpose-details-by-project-id/${projectId.id}/`,
//           {
//             headers: {
//               Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
//             },
//           }
//         );
//         // const response = await getPurposeByProjectId(projectId);
//         if (response.status === 200) {
//           setPurposeData(response.data);
//           console.log(response.data, "this is my data");
//           dispatch(setPurposes({ project_id: projectId.id, data: response.data }));
//           return response.data;
//         }
//       } catch (error) {
//         showApiErrors(error, "Failed to fetch purposes");
//       }
//     }
//     return [];
//   };

//   const getPhases = async (purposesData = null) => {
//     if (!projectId) return;
//     try {
//       const response = await projectInstance.get(
//         `/phases/by-project/${projectId.id}/`,
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
//           },
//         }
//       );
//       if (response.status === 200) {
//         const phases = response.data;
//         const currentPurposes = purposesData || purposeData;
//         const formattedPhases = phases.map((phase) => ({
//           purpose:
//             currentPurposes.find((p) => p.id === phase.purpose.id)?.name?.purpose
//               ?.name || // ✅ Fixed: proper nested access
//             "Unknown",
//           phase: phase.name,
//           id: phase.id,
//           purpose_id: phase.purpose.id, // ✅ Fixed: get the actual Purpose ID
//         }));
//         setPhasesData(formattedPhases);
//         dispatch(setPhases({ project_id: projectId.id, data: formattedPhases }));
//         return formattedPhases;
//       }
//     } catch (error) {
//       showApiErrors(error, "Failed to fetch phases");
//     }
//     return [];
//   };
//   const getStages = async (
//     phasesDataParam = null,
//     purposesDataParam = null
//   ) => {
//     if (!projectId) return;
//     try {
//       const response = await projectInstance.get(
//         `/get-stage-details-by-project-id/${projectId.id}/`,
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
//           },
//         }
//       );
//       if (response.status === 200) {
//         const stages = response.data;
//         // ✅ Fixed the variable references
//         const currentPhases = phasesDataParam || phasesData;
//         const currentPurposes = purposesDataParam || purposeData;

//         // ✅ Add safety checks for arrays
//     const formattedStages = Array.isArray(stages)
//       ? stages.map((stage) => ({
//           purpose:
//             (Array.isArray(currentPurposes) ? currentPurposes : []).find(
//               (p) => p.id === stage.purpose // Keep this as is - stage.purpose is just an ID
//             )?.name?.purpose?.name || "Unknown", // ✅ Fixed: proper nested access
//           phase:
//             (Array.isArray(currentPhases) ? currentPhases : []).find(
//               (ph) => ph.id === stage.phase // Keep this as is - stage.phase is just an ID
//             )?.phase || "Unknown",
//           stage: stage.name,
//           id: stage.id,
//           sequence: stage.sequence || 1,
//         }))
//       : [];

//         setStagesData(formattedStages);
//         dispatch(setStages({ project_id: projectId, data: formattedStages }));
//       }
//     } catch (error) {
//       showApiErrors(error, "Failed to fetch stages");
//     }
//   };

// const fetchAllData = async () => {
//   if (projectId) {
//     await getClientPurposes();
//     const purposes = await getPurposes();
//     const phases = await getPhases(purposes);
//     await getStages(phases, purposes);
//   }
// };

//   useEffect(() => {
//     if (projectId && userId) fetchAllData();
//     // eslint-disable-next-line
//   }, [projectId, userId]);

//   const getPurposeId = (name) =>
//     purposeData.find((p) => (p.name?.purpose?.name || p.name) === name)?.id;
//   const getPhaseId = (name) => phasesData.find((ph) => ph.phase === name)?.id;

//   // // CREATE Purpose
//   // const handleCreatePurpose = async () => {
//   //   if (!newPurpose.trim()) {
//   //     showToast("Purpose name cannot be empty");
//   //     return;
//   //   }
//   //   try {
//   //     const response = await createPurpose({
//   //       name: newPurpose.trim(),
//   //       project: projectId,
//   //     });
//   //     if (response.status === 201 || response.status === 200) {
//   //       showToast("Purpose created!");
//   //       setNewPurpose("");
//   //       await fetchAllData();
//   //     }
//   //   } catch (error) {
//   //     showApiErrors(error, "Failed to create purpose.");
//   //   }
//   // };
// console.log(
//   "🔍 COMPONENT RENDER - clientPurposes:",
//   JSON.stringify(clientPurposes, null, 2)
// );
// console.log(
//   "🔍 COMPONENT RENDER - purposeData:",
//   JSON.stringify(purposeData, null, 2)
// );
// const handleCreatePurpose = async () => {
//   console.log("=== DEBUG CREATE PURPOSE ===");
//   console.log("newPurpose value:", newPurpose);
//   console.log("newPurpose trimmed:", newPurpose.trim());
//   console.log("projectId:", projectId);
//   console.log("🔍 DEBUGGING OBJECT RENDER ERROR:");
//   console.log("clientPurposes:", JSON.stringify(clientPurposes, null, 2));
//   console.log("purposeData:", JSON.stringify(purposeData, null, 2));
//   console.log("newPurpose:", typeof newPurpose, newPurpose);

//   if (!newPurpose.trim()) {
//     console.log("❌ Purpose name is empty");
//     showToast("Purpose name cannot be empty");
//     return;
//   }

// const selectedClientPurpose = clientPurposes.find(
//   (cp) => cp.purpose.name === newPurpose
// );

// console.log("🔍 DEBUGGING CLIENT PURPOSE MISMATCH:");
// console.log("Looking for purpose name:", newPurpose);
// console.log("All clientPurposes:", clientPurposes);
// console.log("selectedClientPurpose:", selectedClientPurpose);
// console.log(
//   "Client ID from selectedClientPurpose:",
//   selectedClientPurpose?.client_id
// );
// console.log("Purpose ID being sent:", selectedClientPurpose?.purpose?.id);
// console.log("User ID:", userId);

//   if (!selectedClientPurpose) {
//     console.log("❌ Client purpose not found");
//     showToast("Selected purpose not found");
//     return;
//   }

//  const payload = {
//    name_id: selectedClientPurpose.id, // ✅ This is ClientPurpose ID (10)
//    project: projectId.id,
//  };

//   console.log("Selected client purpose:", selectedClientPurpose);
//   console.log("Purpose ID being sent:",  selectedClientPurpose.id);
//   console.log("✅ Payload to send:", payload);

//   try {
//     console.log("📡 Calling createPurpose API...",payload);
//     const response = await createPurpose(payload);
//     console.log("📥 API Response:", response);
//     console.log("📊 Response status:", response.status);
//     console.log("📦 Response data:", response.data);

//    if (response.status === 201 || response.status === 200) {
//      console.log("✅ Purpose created successfully!");
//      console.log(
//        "🔍 BEFORE fetchAllData - purposeData:",
//        JSON.stringify(purposeData, null, 2)
//      );
//      showToast("Purpose created!");
//      setNewPurpose("");
//      await fetchAllData();
//      console.log(
//        "🔍 AFTER fetchAllData - purposeData:",
//        JSON.stringify(purposeData, null, 2)
//      );
//    }
//   }
//     catch (error) {
//     console.error("❌ CREATE PURPOSE ERROR:");
//     console.error("Full error object:", error);
//     console.error("Error message:", error.message);
//     console.error("Error response:", error.response);
//     console.error("Error response data:", error.response?.data);
//     console.error("Error response status:", error.response?.status);
//     console.error(
//       "Detailed error messages:",
//       JSON.stringify(error.response?.data, null, 2)
//     );
//     showApiErrors(error, "Failed to create purpose.");
//   }
// };

//   // EDIT/DELETE Purpose
//   const handleEditPurpose = (purpose) => {
//     setEditPurposeId(purpose.id);
//     setEditPurposeName(purpose.name);
//   };

//   const handleSavePurpose = async (purposeId) => {
//     if (!editPurposeName.trim()) {
//       showToast("Purpose name cannot be empty");
//       return;
//     }
//     try {
//       await editPurpose(purposeId, { name: editPurposeName });
//       showToast("Purpose updated!");
//       setEditPurposeId(null);
//       setEditPurposeName("");
//       await fetchAllData();
//     } catch (error) {
//       showApiErrors(error, "Failed to update purpose.");
//     }
//   };

//   const handleDeletePurpose = async (purposeId) => {
//     if (!window.confirm("Are you sure you want to delete this purpose?"))
//       return;
//     try {
//       await deletePurpose(purposeId);
//       showToast("Purpose deleted!");
//       await fetchAllData();
//     } catch (error) {
//       showApiErrors(error, "Failed to delete purpose.");
//     }
//   };

//   // CREATE Phase
//   // const handleCreatePhase = async () => {
//   //   if (!selectedPurpose || !phaseName.trim()) {
//   //     showToast("Please select purpose and enter phase name");
//   //     return;
//   //   }
//   //   try {
//   //     const purposeId = clientPurposes.find(
//   //       (cp) => cp.purpose.name === selectedPurpose
//   //     )?.purpose.id;

//   //      console.log("Selected Purpose:", selectedPurpose);
//   //      console.log("Found Purpose ID:", purposeId);
//   //      console.log("Client Purposes:", clientPurposes);
//   //     // ... rest of function stays same
//   //     const response = await createPhase({
//   //       project: projectId,
//   //       purpose: purposeId,
//   //       name: phaseName.trim(),
//   //     });
//   //     if (response.status === 200 || response.status === 201) {
//   //       showToast("Phase created successfully!");
//   //       setSelectedPurpose("");
//   //       setPhaseName("");
//   //       await fetchAllData();
//   //     }
//   //   } catch (error) {
//   //     showApiErrors(error, "Failed to create phase.");
//   //   }
//   // };

// const handleCreatePhase = async () => {
//   if (!selectedPurpose || !phaseName.trim()) {
//     showToast("Please select purpose and enter phase name");
//     return;
//   }
//   try {
//     const purposeId = purposeData.find(
//       (p) => (p.name?.purpose?.name || p.name) === selectedPurpose
//     )?.id;

//     if (!purposeId) {
//       showToast("Purpose not found");
//       return;
//     }
//     console.log({
//       project: projectId.id,
//       purpose: purposeId,
//       name: phaseName.trim(),
//     },"yhos is payload");
    
//     const response = await createPhase({
//       project: projectId.id,
//       purpose_id: purposeId,
//       name: phaseName.trim(),   
//     });

//     if (response.status === 200 || response.status === 201) {
//       showToast("Phase created successfully!");
//       setSelectedPurpose("");
//       setPhaseName("");
//       await fetchAllData();
//     }
//   } catch (error) {
//     showApiErrors(error, "Failed to create phase.");
//   }
// };

//   // EDIT/DELETE Phase
//   const handleEditPhase = (phase) => {
//     setEditPhaseId(phase.id);
//     setEditPhaseName(phase.phase);
//     setEditPhasePurpose(phase.purpose);
//   };

// const handleSavePhase = async (phaseId) => {
//   const purposeId = purposeData.find(
//     (p) => (p.name?.purpose?.name || p.name) === editPhasePurpose
//   )?.id;
//   if (!editPhaseName.trim() || !purposeId) {
//     showToast("Please select purpose and enter phase name");
//     return;
//   }
//   try {
//     await editPhase(phaseId, { name: editPhaseName, purpose: purposeId });
//     showToast("Phase updated!");
//     setEditPhaseId(null);
//     setEditPhaseName("");
//     setEditPhasePurpose("");
//     await fetchAllData();
//   } catch (error) {
//     showApiErrors(error, "Failed to update phase.");
//   }
// };

//   const handleDeletePhase = async (phaseId) => {
//     if (!window.confirm("Are you sure you want to delete this phase?")) return;
//     try {
//       await deletePhase(phaseId);
//       showToast("Phase deleted!", "success");
//       await fetchAllData();
//     } catch (error) {
//       showApiErrors(error, "Failed to delete phase.");
//     }
//   };

//   // CREATE Stage
//   const handleCreateStage = async () => {
//     if (!selectedPhase || !stageName.trim()) {
//       showToast("Please select phase and enter stage name");
//       return;
//     }
//     try {
//       const [purposeName, phaseNameStr] = selectedPhase.split(":");
//       const purposeId = getPurposeId(purposeName);
//       const phaseId = getPhaseId(phaseNameStr);

//       if (!purposeId || !phaseId) {
//         showToast("Invalid purpose or phase selection");
//         return;
//       }
//       const sequence =
//         Math.max(...stagesData.map((s) => s.sequence || 0), 0) + 1;

//       const payload = {
//         project: projectId.id,
//         purpose_id: purposeId,
//         phase: phaseId,
//         name: stageName.trim(),
//         sequence: sequence,
//       };
      
      
      
      
//       const response = await createStage(payload);
//       console.log(payload,'this is my payload');
//       if (response.status === 200 || response.status === 201) {
//         showToast("Stage created successfully!");
//         setSelectedPhase("");
//         setStageName("");
//         setIsCreateStage(false);
//         await fetchAllData();
//       }
//     } catch (error) {
//       showApiErrors(error, "Failed to create stage.");
//     }
//   };

//   // EDIT/DELETE Stage
//   const handleEditClick = (index) => {
//     setEditIndex(index);
//     setEditedStageName(stagesData[index].stage);
//     setEditedSequence(stagesData[index].sequence || 1);
//   };

//   const handleSaveClick = async () => {
//     if (editIndex === null) return;
//     setIsSaving(true);
//     try {
//       const stageToUpdate = stagesData[editIndex];
//       const payload = {
//         stage_id: stageToUpdate.id,
//         name: editedStageName.trim(),
//         sequence: editedSequence,
//       };
//       await editStage(payload);
//       showToast("Stage updated successfully!");
//       setEditIndex(null);
//       setEditedStageName("");
//       setEditedSequence(1);
//       await fetchAllData();
//     } catch (error) {
//       showApiErrors(error, "Failed to update stage.");
//     }
//     setIsSaving(false);
//   };

//   const handleDeleteStage = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this stage?")) return;
//     try {
//       await deleteStage(id);
//       showToast("Stage deleted successfully!");
//       await fetchAllData();
//     } catch (error) {
//       showApiErrors(error, "Failed to delete stage.");
//     }
//   };

//   return (
//     <div
//       className="w-full max-w-7xl mx-auto px-2 py-8 rounded-2xl shadow-2xl"
//       style={{
//         background: palette.BG_GRAY,
//         border: `1.5px solid ${palette.BORDER_GRAY}`,
//         color: palette.TEXT_GRAY,
//       }}
//     >
//       {/* Tabs */}
//       <div className="flex items-center justify-center gap-0 mb-10">
//         {TABS.map((tab, idx) => (
//           <React.Fragment key={tab.key}>
//             <button
//               className={`px-7 py-3 rounded-t-xl font-semibold text-base tracking-wide transition-all duration-200 focus:outline-none
//                 ${activeSection === tab.key ? "shadow-xl scale-105" : ""}
//               `}
//               style={{
//                 minWidth: 130,
//                 color: activeSection === tab.key ? "#fff" : palette.ORANGE,
//                 background:
//                   activeSection === tab.key
//                     ? `linear-gradient(90deg, ${palette.ORANGE} 60%, ${palette.ORANGE_DARK} 100%)`
//                     : "transparent",
//                 border:
//                   activeSection === tab.key
//                     ? `1.5px solid ${palette.ORANGE}`
//                     : `1.5px solid ${palette.BORDER_GRAY}`,
//                 fontWeight: "bold",
//                 boxShadow:
//                   activeSection === tab.key ? "0 4px 24px #d67c3c55" : "none",
//                 zIndex: 1,
//               }}
//               onClick={() => setActiveSection(tab.key)}
//             >
//               {tab.label}
//             </button>
//             {idx < TABS.length - 1 && (
//               <div className="w-3 h-1 bg-orange-200 rounded-full mx-2" />
//             )}
//           </React.Fragment>
//         ))}
//       </div>
//       {/* PURPOSE */}
//       {/* {activeSection === "Purpose" && (
//         <div
//           className="p-8 rounded-2xl mb-6 shadow"
//           style={{
//             background: palette.BG_WHITE,
//             border: `1px solid ${palette.BORDER_GRAY}`,
//           }}
//         >
//           <h3
//             className="text-xl font-bold mb-5"
//             style={{ color: palette.ORANGE_DARK }}
//           >
//             Purpose Management
//           </h3>
//           <div className="flex gap-2 mb-6">
//             <input
//               value={newPurpose}
//               onChange={(e) => setNewPurpose(e.target.value)}
//               onKeyPress={(e) => e.key === "Enter" && handleCreatePurpose()}
//               type="text"
//               className="flex-1 px-4 py-3 border rounded-xl focus:outline-none text-base"
//               style={{
//                 borderColor: palette.ORANGE,
//                 color: palette.TEXT_GRAY,
//                 background: palette.ORANGE_LIGHT,
//               }}
//               placeholder="Enter new purpose"
//             />
//             <button
//               onClick={handleCreatePurpose}
//               className="px-7 py-3 rounded-xl font-semibold flex items-center gap-2"
//               style={{
//                 background: `linear-gradient(90deg, ${palette.ORANGE} 60%, ${palette.ORANGE_DARK} 100%)`,
//                 color: "#fff",
//               }}
//             >
//               <Plus size={20} /> Add Purpose
//             </button>
//           </div>

//           {purposeData.length > 0 ? (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {purposeData.map((purpose) => (
//                 <div
//                   key={purpose.id}
//                   className="p-5 rounded-xl flex items-center justify-between gap-4 shadow group"
//                   style={{
//                     background: palette.BG_WHITE,
//                     border: `1px solid ${palette.BORDER_GRAY}`,
//                     color: palette.TEXT_GRAY,
//                   }}
//                 >
//                   {editPurposeId === purpose.id ? (
//                     <>
//                       <input
//                         className="flex-1 border px-3 py-2 rounded-lg text-base"
//                         value={editPurposeName}
//                         onChange={(e) => setEditPurposeName(e.target.value)}
//                         style={{
//                           borderColor: palette.ORANGE,
//                           color: palette.TEXT_GRAY,
//                           background: palette.ORANGE_LIGHT,
//                         }}
//                       />
//                       <button
//                         className="ml-2 px-4 py-2 rounded-lg"
//                         style={{ background: palette.ORANGE, color: "#fff" }}
//                         onClick={() => handleSavePurpose(purpose.id)}
//                       >
//                         <Check size={20} />
//                       </button>
//                       <button
//                         className="ml-2 px-4 py-2 rounded-lg"
//                         style={{
//                           background: "#f4f4f4",
//                           color: palette.TEXT_GRAY,
//                         }}
//                         onClick={() => setEditPurposeId(null)}
//                       >
//                         <X size={20} />
//                       </button>
//                     </>
//                   ) : (
//                     <>
//                       <span
//                         className="capitalize text-lg font-medium"
//                         style={{ color: palette.TEXT_GRAY }}
//                       >
//                         {purpose.name?.purpose?.name || purpose.name}
//                       </span>
//                       <button
//                         className="px-3 py-1 rounded-lg"
//                         style={{ background: "#f5e6de", color: palette.ORANGE }}
//                         onClick={() => handleEditPurpose(purpose)}
//                       >
//                         <Edit3 size={18} />
//                       </button>
//                       <button
//                         className="px-3 py-1 rounded-lg"
//                         style={{
//                           background: "#fae7e3",
//                           color: palette.ORANGE_DARK,
//                         }}
//                         onClick={() => handleDeletePurpose(purpose.id)}
//                       >
//                         <Trash2 size={18} />
//                       </button>
//                     </>
//                   )}
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p className="text-gray-400 text-center py-6 text-base">
//               No purposes created yet
//             </p>
//           )}
//         </div>
//       )} */}

//       {/* PURPOSE MANAGEMENT WITH CLIENT PURPOSES DROPDOWN */}
//       {activeSection === "Purpose" && (
//         <div
//           className="p-8 rounded-2xl mb-6 shadow"
//           style={{
//             background: palette.BG_WHITE,
//             border: `1px solid ${palette.BORDER_GRAY}`,
//           }}
//         >
//           <h3
//             className="text-xl font-bold mb-5"
//             style={{ color: palette.ORANGE_DARK }}
//           >
//             Purpose Management
//           </h3>

//           {/* Available Client Purposes */}
//           {Array.isArray(clientPurposes) && clientPurposes.length > 0 && (
//             <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
//               <h4 className="text-sm font-semibold text-blue-800 mb-2">
//                 Available Client Purposes:
//               </h4>
//               <div className="flex gap-2 flex-wrap">
//                 {clientPurposes.map((cp) => (
//                   <button
//                     key={cp.id}
//                     onClick={() => setNewPurpose(cp.purpose?.name || "")}
//                     className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded-lg border border-blue-300 text-blue-800 transition-colors"
//                   >
//                     Copy: {String(cp.purpose?.name || "Unknown")}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Create Purpose Form */}
//           <div className="flex gap-2 mb-6">
//             <select
//               value={newPurpose}
//               onChange={(e) => setNewPurpose(e.target.value)}
//               className="flex-1 px-4 py-3 border rounded-xl focus:outline-none text-base"
//               style={{
//                 borderColor: palette.ORANGE,
//                 color: palette.TEXT_GRAY,
//                 background: palette.ORANGE_LIGHT,
//               }}
//             >
//               <option value="">Select Client Purpose to Add to Project</option>
//               {Array.isArray(clientPurposes) &&
//                 clientPurposes.map((cp) => (
//                   <option key={cp.id} value={cp.purpose?.name || ""}>
//                     {String(cp.purpose?.name || "Unknown Purpose")}
//                   </option>
//                 ))}
//             </select>
//             <button
//               onClick={handleCreatePurpose}
//               className="px-7 py-3 rounded-xl font-semibold flex items-center gap-2"
//               style={{
//                 background: `linear-gradient(90deg, ${palette.ORANGE} 60%, ${palette.ORANGE_DARK} 100%)`,
//                 color: "#fff",
//               }}
//             >
//               <Plus size={20} /> Add Purpose
//             </button>
//           </div>

//           {/* Existing Project Purposes */}
//           {Array.isArray(purposeData) && purposeData.length > 0 ? (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {purposeData.map((purpose) => (
//                 <div
//                   key={purpose.id}
//                   className="p-5 rounded-xl flex items-center justify-between gap-4 shadow group"
//                   style={{
//                     background: palette.BG_WHITE,
//                     border: `1px solid ${palette.BORDER_GRAY}`,
//                     color: palette.TEXT_GRAY,
//                   }}
//                 >
//                   {editPurposeId === purpose.id ? (
//                     <>
//                       <input
//                         className="flex-1 border px-3 py-2 rounded-lg text-base"
//                         value={editPurposeName}
//                         onChange={(e) => setEditPurposeName(e.target.value)}
//                         style={{
//                           borderColor: palette.ORANGE,
//                           color: palette.TEXT_GRAY,
//                           background: palette.ORANGE_LIGHT,
//                         }}
//                       />
//                       <button
//                         className="ml-2 px-4 py-2 rounded-lg"
//                         style={{ background: palette.ORANGE, color: "#fff" }}
//                         onClick={() => handleSavePurpose(purpose.id)}
//                       >
//                         <Check size={20} />
//                       </button>
//                       <button
//                         className="ml-2 px-4 py-2 rounded-lg"
//                         style={{
//                           background: "#f4f4f4",
//                           color: palette.TEXT_GRAY,
//                         }}
//                         onClick={() => setEditPurposeId(null)}
//                       >
//                         <X size={20} />
//                       </button>
//                     </>
//                   ) : (
//                     <>
//                       <span
//                         className="capitalize text-lg font-medium"
//                         style={{ color: palette.TEXT_GRAY }}
//                       >
//                         {purpose.name?.purpose?.name || "Unknown Purpose"}
//                       </span>
//                       <button
//                         className="px-3 py-1 rounded-lg"
//                         style={{ background: "#f5e6de", color: palette.ORANGE }}
//                         onClick={() => handleEditPurpose(purpose)}
//                       >
//                         <Edit3 size={18} />
//                       </button>
//                       <button
//                         className="px-3 py-1 rounded-lg"
//                         style={{
//                           background: "#fae7e3",
//                           color: palette.ORANGE_DARK,
//                         }}
//                         onClick={() => handleDeletePurpose(purpose.id)}
//                       >
//                         <Trash2 size={18} />
//                       </button>
//                     </>
//                   )}
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p className="text-gray-400 text-center py-6 text-base">
//               No purposes created yet. Copy from available client purposes above
//               or create new ones.
//             </p>
//           )}
//         </div>
//       )}

//       {/* PHASES */}
//       {activeSection === "Phases" && (
//         <div
//           className="p-8 rounded-2xl mb-6 shadow"
//           style={{
//             background: palette.BG_WHITE,
//             border: `1px solid ${palette.BORDER_GRAY}`,
//           }}
//         >
//           <div className="flex flex-col lg:flex-row gap-10">
//             {/* Create Phase Card */}
//             <div
//               className="border-2 rounded-2xl p-6 min-w-[340px] w-full max-w-md shadow"
//               style={{
//                 background: palette.BG_WHITE,
//                 borderColor: palette.ORANGE,
//                 color: palette.TEXT_GRAY,
//               }}
//             >
//               <h4
//                 className="font-bold mb-4 text-lg"
//                 style={{ color: palette.ORANGE_DARK }}
//               >
//                 Create Phase
//               </h4>
//               <div className="space-y-4">
//                 <div>
//                   <label
//                     className="block font-medium mb-1"
//                     style={{ color: palette.TEXT_GRAY }}
//                   >
//                     Purpose
//                   </label>
//                   <select
//                     value={selectedPurpose}
//                     onChange={(e) => setSelectedPurpose(e.target.value)}
//                     className="w-full px-3 py-2 border rounded-lg focus:outline-none text-base"
//                     style={{
//                       borderColor: palette.ORANGE,
//                       color: palette.TEXT_GRAY,
//                       background: palette.ORANGE_LIGHT,
//                     }}
//                   >
//                     <option value="">Select Purpose *</option>
//                     {Array.isArray(purposeData) &&
//                       purposeData.map((purpose) => (
//                         <option
//                           key={purpose.id}
//                           value={purpose.name?.purpose?.name || purpose.name}
//                           className="capitalize"
//                         >
//                           {purpose.name?.purpose?.name || purpose.name}
//                         </option>
//                       ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label
//                     className="block font-medium mb-1"
//                     style={{ color: palette.TEXT_GRAY }}
//                   >
//                     Phase Name
//                   </label>
//                   <input
//                     value={phaseName}
//                     onChange={(e) => setPhaseName(e.target.value)}
//                     type="text"
//                     className="w-full px-3 py-2 border rounded-lg focus:outline-none text-base"
//                     style={{
//                       borderColor: palette.ORANGE,
//                       color: palette.TEXT_GRAY,
//                       background: palette.ORANGE_LIGHT,
//                     }}
//                     placeholder="Enter phase name"
//                   />
//                 </div>
//                 <div className="flex gap-2">
//                   <button
//                     onClick={handleCreatePhase}
//                     className="flex-1 rounded-lg font-medium"
//                     style={{ background: palette.ORANGE, color: "#fff" }}
//                   >
//                     Create
//                   </button>
//                   <button
//                     onClick={() => {
//                       setSelectedPurpose("");
//                       setPhaseName("");
//                     }}
//                     className="px-4 py-2 border rounded-lg font-medium"
//                     style={{
//                       borderColor: palette.ORANGE,
//                       color: palette.ORANGE,
//                       background: "#f4f4f4",
//                     }}
//                   >
//                     Clear
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Existing Phases */}
//             <div className="flex-1">
//               <h3
//                 className="text-xl font-bold mb-4"
//                 style={{ color: palette.ORANGE_DARK }}
//               >
//                 Existing Phases
//               </h3>
//               {phasesData.length > 0 ? (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   {Array.isArray(phasesData) &&
//                     phasesData.map((phase) => (
//                       <div
//                         key={phase.id}
//                         className="border rounded-2xl p-5 shadow group"
//                         style={{
//                           background: palette.BG_WHITE,
//                           borderColor: palette.ORANGE,
//                           color: palette.TEXT_GRAY,
//                         }}
//                       >
//                         {editPhaseId === phase.id ? (
//                           <div className="space-y-3">
//                             <div>
//                               <label
//                                 className="block text-xs font-medium mb-1"
//                                 style={{ color: palette.TEXT_GRAY }}
//                               >
//                                 Purpose
//                               </label>
//                               <select
//                                 className="w-full border px-3 py-2 rounded-lg"
//                                 style={{
//                                   borderColor: palette.ORANGE,
//                                   color: palette.TEXT_GRAY,
//                                   background: palette.ORANGE_LIGHT,
//                                 }}
//                                 value={editPhasePurpose}
//                                 onChange={(e) =>
//                                   setEditPhasePurpose(e.target.value)
//                                 }
//                               >
//                                 {Array.isArray(purposeData) &&
//                                   purposeData.map((purpose) => (
//                                     <option
//                                       key={purpose.id}
//                                       value={purpose.name?.purpose?.name || purpose.name}
//                                     >
//                                       {purpose.name?.purpose?.name || purpose.name}
//                                     </option>
//                                   ))}
//                               </select>
//                             </div>
//                             <div>
//                               <label
//                                 className="block text-xs font-medium mb-1"
//                                 style={{ color: palette.TEXT_GRAY }}
//                               >
//                                 Phase Name
//                               </label>
//                               <input
//                                 className="w-full border px-3 py-2 rounded-lg"
//                                 style={{
//                                   borderColor: palette.ORANGE,
//                                   color: palette.TEXT_GRAY,
//                                   background: palette.ORANGE_LIGHT,
//                                 }}
//                                 value={editPhaseName}
//                                 onChange={(e) =>
//                                   setEditPhaseName(e.target.value)
//                                 }
//                               />
//                             </div>
//                             <div className="flex gap-2 pt-2">
//                               <button
//                                 className="flex-1 rounded-lg font-medium"
//                                 style={{
//                                   background: palette.ORANGE,
//                                   color: "#fff",
//                                 }}
//                                 onClick={() => handleSavePhase(phase.id)}
//                               >
//                                 <Check size={18} /> Save
//                               </button>
//                               <button
//                                 className="flex-1 border px-3 py-2 rounded-lg font-medium"
//                                 style={{
//                                   borderColor: palette.ORANGE,
//                                   color: palette.ORANGE,
//                                   background: "#f4f4f4",
//                                 }}
//                                 onClick={() => setEditPhaseId(null)}
//                               >
//                                 <X size={18} /> Cancel
//                               </button>
//                             </div>
//                           </div>
//                         ) : (
//                           <div className="space-y-3">
//                             <div>
//                               <label
//                                 className="block text-xs font-medium mb-1"
//                                 style={{ color: palette.TEXT_GRAY }}
//                               >
//                                 Purpose
//                               </label>
//                               <div
//                                 className="px-3 py-2 rounded text-base capitalize"
//                                 style={{
//                                   background: palette.ORANGE_LIGHT,
//                                   color: palette.TEXT_GRAY,
//                                 }}
//                               >
//                                 {phase.purpose}
//                               </div>
//                             </div>
//                             <div>
//                               <label
//                                 className="block text-xs font-medium mb-1"
//                                 style={{ color: palette.TEXT_GRAY }}
//                               >
//                                 Phase Name
//                               </label>
//                               <div
//                                 className="px-3 py-2 rounded text-base capitalize"
//                                 style={{
//                                   background: palette.ORANGE_LIGHT,
//                                   color: palette.TEXT_GRAY,
//                                 }}
//                               >
//                                 {phase.phase}
//                               </div>
//                             </div>
//                             <div className="flex gap-2 pt-2">
//                               <button
//                                 className="flex-1 rounded-lg font-medium"
//                                 style={{
//                                   background: palette.ORANGE,
//                                   color: "#fff",
//                                 }}
//                                 onClick={() => handleEditPhase(phase)}
//                               >
//                                 <Edit3 size={18} /> Edit
//                               </button>
//                               <button
//                                 className="rounded-lg font-medium"
//                                 style={{
//                                   background: "#fae7e3",
//                                   color: palette.ORANGE_DARK,
//                                 }}
//                                 onClick={() => handleDeletePhase(phase.id)}
//                               >
//                                 <Trash2 size={18} /> Delete
//                               </button>
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                 </div>
//               ) : (
//                 <p className="text-gray-400 text-center py-10">
//                   No phases created yet
//                 </p>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//       {/* STAGES */}
//       {activeSection === "Stages" && (
//         <div
//           className="p-8 rounded-2xl mb-6 shadow"
//           style={{
//             background: palette.BG_WHITE,
//             border: `1px solid ${palette.BORDER_GRAY}`,
//             color: palette.TEXT_GRAY,
//           }}
//         >
//           <div className="flex items-center gap-4 mb-6">
//             <button
//               className="px-5 py-3 rounded-xl font-semibold flex items-center gap-2 shadow"
//               style={{
//                 background: palette.ORANGE,
//                 color: "#fff",
//               }}
//               onClick={() => setIsCreateStage((v) => !v)}
//             >
//               <Plus size={22} /> {isCreateStage ? "Cancel" : "Create Stage"}
//             </button>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
//             {/* Create Stage Card */}
//             {isCreateStage && (
//               <div
//                 className="border-2 rounded-2xl p-6 shadow-xl flex flex-col gap-5 min-w-[320px]"
//                 style={{
//                   background: palette.BG_WHITE,
//                   borderColor: palette.ORANGE,
//                   color: palette.TEXT_GRAY,
//                 }}
//               >
//                 <h4
//                   className="font-bold text-lg mb-2"
//                   style={{ color: palette.ORANGE_DARK }}
//                 >
//                   New Stage
//                 </h4>
//                 <div>
//                   <label
//                     className="block font-medium mb-1"
//                     style={{ color: palette.TEXT_GRAY }}
//                   >
//                     Phase
//                   </label>
//                   <select
//                     value={selectedPhase}
//                     onChange={(e) => setSelectedPhase(e.target.value)}
//                     className="w-full px-3 py-2 border rounded-lg focus:outline-none text-base"
//                     style={{
//                       borderColor: palette.ORANGE,
//                       color: palette.TEXT_GRAY,
//                       background: palette.ORANGE_LIGHT,
//                     }}
//                   >
//                     <option value="">Select Phase</option>
//                     {phasesData.map((phase) => (
//                       <option
//                         key={phase.id}
//                         value={`${phase.purpose}:${phase.phase}`}
//                       >
//                         {phase.purpose} - {phase.phase}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label
//                     className="block font-medium mb-1"
//                     style={{ color: palette.TEXT_GRAY }}
//                   >
//                     Stage Name
//                   </label>
//                   <input
//                     value={stageName}
//                     onChange={(e) => setStageName(e.target.value)}
//                     type="text"
//                     className="w-full px-3 py-2 border rounded-lg focus:outline-none text-base"
//                     style={{
//                       borderColor: palette.ORANGE,
//                       color: palette.TEXT_GRAY,
//                       background: palette.ORANGE_LIGHT,
//                     }}
//                     placeholder="Enter stage name"
//                   />
//                 </div>
//                 <div className="flex gap-2 pt-2">
//                   <button
//                     onClick={handleCreateStage}
//                     className="flex-1 rounded-lg font-medium"
//                     style={{ background: palette.ORANGE, color: "#fff" }}
//                   >
//                     Create
//                   </button>
//                   <button
//                     onClick={() => {
//                       setIsCreateStage(false);
//                       setSelectedPhase("");
//                       setStageName("");
//                     }}
//                     className="px-4 py-2 border rounded-lg font-medium"
//                     style={{
//                       borderColor: palette.ORANGE,
//                       color: palette.ORANGE,
//                       background: "#f4f4f4",
//                     }}
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* Existing Stages */}
//             {Array.isArray(stagesData) &&
//               stagesData.map((stage, index) => (
//                 <div
//                   key={stage.id}
//                   className="border rounded-2xl p-5 shadow-xl group flex flex-col gap-2"
//                   style={{
//                     background: palette.BG_WHITE,
//                     borderColor: palette.ORANGE,
//                     color: palette.TEXT_GRAY,
//                   }}
//                 >
//                   <div>
//                     <label
//                       className="block text-xs font-medium mb-1"
//                       style={{ color: palette.TEXT_GRAY }}
//                     >
//                       Purpose
//                     </label>
//                     <div
//                       className="px-3 py-2 rounded text-base capitalize"
//                       style={{
//                         background: palette.ORANGE_LIGHT,
//                         color: palette.TEXT_GRAY,
//                       }}
//                     >
//                       {stage.purpose}
//                     </div>
//                   </div>
//                   <div>
//                     <label
//                       className="block text-xs font-medium mb-1"
//                       style={{ color: palette.TEXT_GRAY }}
//                     >
//                       Phase
//                     </label>
//                     <div
//                       className="px-3 py-2 rounded text-base capitalize"
//                       style={{
//                         background: palette.ORANGE_LIGHT,
//                         color: palette.TEXT_GRAY,
//                       }}
//                     >
//                       {stage.phase}
//                     </div>
//                   </div>
//                   <div>
//                     <label
//                       className="block text-xs font-medium mb-1"
//                       style={{ color: palette.TEXT_GRAY }}
//                     >
//                       Stage Name
//                     </label>
//                     {editIndex === index ? (
//                       <input
//                         type="text"
//                         value={editedStageName}
//                         onChange={(e) => setEditedStageName(e.target.value)}
//                         className="w-full px-3 py-2 border rounded-lg focus:outline-none text-base"
//                         style={{
//                           borderColor: palette.ORANGE,
//                           color: palette.TEXT_GRAY,
//                           background: palette.ORANGE_LIGHT,
//                         }}
//                       />
//                     ) : (
//                       <div
//                         className="px-3 py-2 rounded text-base capitalize"
//                         style={{
//                           background: palette.ORANGE_LIGHT,
//                           color: palette.TEXT_GRAY,
//                         }}
//                       >
//                         {stage.stage}
//                       </div>
//                     )}
//                   </div>
//                   <div>
//                     <label
//                       className="block text-xs font-medium mb-1"
//                       style={{ color: palette.TEXT_GRAY }}
//                     >
//                       Sequence
//                     </label>
//                     {editIndex === index ? (
//                       <input
//                         type="number"
//                         min={1}
//                         value={editedSequence}
//                         onChange={(e) =>
//                           setEditedSequence(Number(e.target.value))
//                         }
//                         className="w-full px-3 py-2 border rounded-lg focus:outline-none text-base"
//                         style={{
//                           borderColor: palette.ORANGE,
//                           color: palette.TEXT_GRAY,
//                           background: palette.ORANGE_LIGHT,
//                         }}
//                       />
//                     ) : (
//                       <div
//                         className="px-3 py-2 rounded text-base text-center"
//                         style={{
//                           background: palette.ORANGE_LIGHT,
//                           color: palette.TEXT_GRAY,
//                         }}
//                       >
//                         {stage.sequence}
//                       </div>
//                     )}
//                   </div>
//                   <div className="flex gap-2 pt-2">
//                     {editIndex === index ? (
//                       <>
//                         <button
//                           onClick={handleSaveClick}
//                           disabled={isSaving}
//                           className="flex-1 rounded-lg font-medium"
//                           style={{ background: palette.ORANGE, color: "#fff" }}
//                         >
//                           {isSaving ? (
//                             "Saving..."
//                           ) : (
//                             <>
//                               <Check size={18} /> Save
//                             </>
//                           )}
//                         </button>
//                         <button
//                           onClick={() => setEditIndex(null)}
//                           className="flex-1 border px-3 py-2 rounded-lg font-medium"
//                           style={{
//                             borderColor: palette.ORANGE,
//                             color: palette.ORANGE,
//                             background: "#f4f4f4",
//                           }}
//                         >
//                           <X size={18} /> Cancel
//                         </button>
//                       </>
//                     ) : (
//                       <>
//                         <button
//                           onClick={() => handleEditClick(index)}
//                           className="flex-1 rounded-lg font-medium"
//                           style={{ background: palette.ORANGE, color: "#fff" }}
//                         >
//                           <Edit3 size={18} /> Edit
//                         </button>
//                         <button
//                           onClick={() => handleDeleteStage(stage.id)}
//                           className="rounded-lg font-medium"
//                           style={{
//                             background: "#fae7e3",
//                             color: palette.ORANGE_DARK,
//                           }}
//                         >
//                           <Trash2 size={18} /> Delete
//                         </button>
//                       </>
//                     )}
//                   </div>
//                 </div>
//               ))}
//           </div>
//           {stagesData.length === 0 && !isCreateStage && (
//             <p className="text-gray-400 text-center py-8">
//               No stages created yet
//             </p>
//           )}
//         </div>
//       )}
//       {/* Next/Previous controls */}
//       <div className="flex justify-between mt-10">
//         <button
//           className="px-8 py-3 rounded-xl font-semibold"
//           style={{ background: palette.BORDER_GRAY, color: palette.TEXT_GRAY }}
//           onClick={previousStep}
//         >
//           Previous
//         </button>
//         <button
//           className="px-8 py-3 rounded-xl font-semibold"
//           style={{
//             background: `linear-gradient(90deg, ${palette.ORANGE} 60%, ${palette.ORANGE_DARK} 100%)`,
//             color: "#fff",
//           }}
//           onClick={nextStep}
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// }

// export default Stages;

import React, { useEffect, useState } from "react";
import {
  createPhase,
  createPurpose,
  createStage,
  editStage,
  deleteStage,
  editPurpose,
  deletePurpose,
  editPhase,
  deletePhase,
} from "../../api";
import { showToast } from "../../utils/toast";
import { useSelector, useDispatch } from "react-redux";
import { setPurposes, setPhases, setStages } from "../../store/userSlice";
import { Check, Edit3, Trash2, Plus, X } from "lucide-react";
import { useTheme } from "../../ThemeContext";
import axios from "axios";

const TABS = [
  { key: "Purpose", label: "Purpose" },
  { key: "Phases", label: "Phases" },
  { key: "Stages", label: "Stages" },
];

const PAGE_SIZE = 6;

const showApiErrors = (error, fallbackMsg = "An error occurred.") => {
  const apiErrors = error?.response?.data;
  if (apiErrors && typeof apiErrors === "object") {
    Object.values(apiErrors).forEach((errArr) => {
      if (Array.isArray(errArr)) {
        errArr.forEach((msg) => showToast(String(msg)));
      } else if (typeof errArr === "string" || typeof errArr === "number") {
        showToast(String(errArr));
      } else {
        showToast(JSON.stringify(errArr));
      }
    });
  } else {
    showToast(fallbackMsg);
  }
};

function paginate(arr, page, pageSize) {
  const start = (page - 1) * pageSize;
  return arr.slice(start, start + pageSize);
}

function Stages({ nextStep, previousStep }) {
  const dispatch = useDispatch();
  const projectId = useSelector((state) => state.user.selectedProject.id);
  const { theme } = useTheme();

  // --- THEME palette ---
  const ORANGE = "#ffbe63";
  const BG_OFFWHITE = "#fcfaf7";
  const bgColor = theme === "dark" ? "#191922" : BG_OFFWHITE;
  const cardColor = theme === "dark" ? "#23232c" : "#fff";
  const borderColor = ORANGE;
  const textColor = theme === "dark" ? "#000" : "#222";
  const iconColor = ORANGE;

  // State for tabs and modals
  const [activeSection, setActiveSection] = useState("Purpose");
  const [purposeModal, setPurposeModal] = useState(false);
  const [phaseModal, setPhaseModal] = useState(false);
  const [stageModal, setStageModal] = useState(false);

  // Pagination for modals
  const [purposePage, setPurposePage] = useState(1);
  const [phasePage, setPhasePage] = useState(1);
  const [stagePage, setStagePage] = useState(1);
const [activePurposeId, setActivePurposeId] = useState(null);
const [activatingPurposeId, setActivatingPurposeId] = useState(null);

  // Data
  const [isCreateStage, setIsCreateStage] = useState(false);
  const [purposeData, setPurposeData] = useState([]);
  const [clientPurposes, setClientPurposes] = useState([]);
  const [phasesData, setPhasesData] = useState([]);
  const [stagesData, setStagesData] = useState([]);
  const [selectedPurpose, setSelectedPurpose] = useState("");
  const [phaseName, setPhaseName] = useState("");
  const [newPurpose, setNewPurpose] = useState("");
  const [selectedPhase, setSelectedPhase] = useState("");
  const [stageName, setStageName] = useState("");
  const [editPurposeId, setEditPurposeId] = useState(null);
  const [editPurposeName, setEditPurposeName] = useState("");
  const [editPhaseId, setEditPhaseId] = useState(null);
  const [editPhaseName, setEditPhaseName] = useState("");
  const [editPhasePurpose, setEditPhasePurpose] = useState("");
  const [editStageId, setEditStageId] = useState(null);
  const [editedStageName, setEditedStageName] = useState("");
  const [editedSequence, setEditedSequence] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState(null);

  // Pagination reset on modal open
  useEffect(() => setPurposePage(1), [purposeModal]);
  useEffect(() => setPhasePage(1), [phaseModal]);
  useEffect(() => setStagePage(1), [stageModal]);

  useEffect(() => {
    const userString = localStorage.getItem("USER_DATA");
    if (userString && userString !== "undefined") {
      const parsedUserData = JSON.parse(userString);
      setUserData(parsedUserData);
    }
  }, []);

  useEffect(() => {
    if (userData?.user_id) getClientPurposes();
  }, [userData]);

  const userId = userData?.user_id;

  // --- Fetch helpers ---
  const getClientPurposes = async () => {
    try {
      if (!userId) return [];
      const token = localStorage.getItem("ACCESS_TOKEN");
      const response = await axios.get(
        `https://konstruct.world/projects/client-purpose/${userId}/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        setClientPurposes(response.data || []);
        return response.data || [];
      }
    } catch (error) {
      showApiErrors(error, "Failed to fetch client purposes");
      setClientPurposes([]);
      return [];
    }
  };

  const getPurposes = async () => {
    if (projectId) {
      try {
        const response = await axios.get(
          `https://konstruct.world/projects/purpose/get-purpose-details-by-project-id/${projectId.id}/`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
            },
          }
        );
        if (response.status === 200) {
          setPurposeData(response.data);
          dispatch(
            setPurposes({ project_id: projectId.id, data: response.data })
          );
          return response.data;
        }
      } catch (error) {
        showApiErrors(error, "Failed to fetch purposes");
      }
    }
    return [];
  };

  // const getPhases = async (purposesData = null) => {
  //   if (!projectId) return;
  //   try {
  //     const response = await axios.get(
  //       `https://konstruct.world/projects/phases/by-project/${projectId.id}/`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
  //         },
  //       }
  //     );
  //     if (response.status === 200) {
  //       const phases = response.data;
  //       const currentPurposes = purposesData || purposeData;
  //       const formattedPhases = phases.map((phase) => ({
  //         purpose:
  //           currentPurposes.find((p) => p.id === phase.purpose.id)?.name
  //             ?.purpose?.name || "Unknown",
  //         phase: phase.name,
  //         id: phase.id,
  //         purpose_id: phase.purpose.id,
  //         sequence: purposeObj?.sequence ?? 1, // <--- GET THE SEQUENCE

  //       }));
  //       setPhasesData(formattedPhases);
  //       dispatch(
  //         setPhases({ project_id: projectId.id, data: formattedPhases })
  //       );
  //       return formattedPhases;
  //     }
  //   } catch (error) {
  //     showApiErrors(error, "Failed to fetch phases");
  //   }
  //   return [];
  // };

 const getPhases = async (purposesData = null) => {
  if (!projectId) return;
  try {
    const response = await axios.get(
      `https://konstruct.world/projects/phases/by-project/${projectId.id}/`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
        },
      }
    );
    if (response.status === 200) {
      const phases = response.data;
      const currentPurposes = purposesData || purposeData;
      const formattedPhases = phases.map((phase) => {
        const purposeObj = currentPurposes.find((p) => p.id === phase.purpose.id);
        return {
          purpose: purposeObj?.name?.purpose?.name || "Unknown",
          phase: phase.name,
          id: phase.id,
          purpose_id: phase.purpose.id,
          sequence: phase.sequence, // <-- Correct!
        };
      });
      setPhasesData(formattedPhases);
      dispatch(
        setPhases({ project_id: projectId.id, data: formattedPhases })
      );
      return formattedPhases;
    }
  } catch (error) {
    showApiErrors(error, "Failed to fetch phases");
  }
  return [];
};



  // Show correct purpose in stages
  const getStages = async (
    phasesDataParam = null,
    purposesDataParam = null
  ) => {
    if (!projectId) return;
    try {
      const response = await axios.get(
        `https://konstruct.world/projects/get-stage-details-by-project-id/${projectId.id}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
          },
        }
      );
      if (response.status === 200) {
        const stages = response.data;
        const currentPhases = phasesDataParam || phasesData;
        const currentPurposes = purposesDataParam || purposeData;
        const formattedStages = Array.isArray(stages)
          ? stages.map((stage) => {
              // Find the phase for this stage
              const phaseObj = (
                Array.isArray(currentPhases) ? currentPhases : []
              ).find((ph) => ph.id === stage.phase);
              // Find the purpose for this stage
              let purposeObj = null;
              if (phaseObj && phaseObj.purpose_id) {
                purposeObj = (
                  Array.isArray(currentPurposes) ? currentPurposes : []
                ).find((p) => p.id === phaseObj.purpose_id);
              } else {
                // fallback
                purposeObj = (
                  Array.isArray(currentPurposes) ? currentPurposes : []
                ).find((p) => p.id === stage.purpose);
              }
              return {
                purpose: purposeObj?.name?.purpose?.name || "Unknown",
                phase: phaseObj?.phase || "Unknown",
                stage: stage.name,
                id: stage.id,
                sequence: stage.sequence || 1,
              };
            })
          : [];
        setStagesData(formattedStages);
        dispatch(setStages({ project_id: projectId, data: formattedStages }));
      }
    } catch (error) {
      showApiErrors(error, "Failed to fetch stages");
    }
  };

  const fetchAllData = async () => {
    if (projectId) {
      await getClientPurposes();
      const purposes = await getPurposes();
      const phases = await getPhases(purposes);
      await getStages(phases, purposes);
    }
  };

  useEffect(() => {
    if (projectId && userId) fetchAllData();
    // eslint-disable-next-line
  }, [projectId, userId]);

  const getPurposeId = (name) =>
    purposeData.find((p) => (p.name?.purpose?.name || p.name) === name)?.id;
  const getPhaseId = (name) => phasesData.find((ph) => ph.phase === name)?.id;

  // Purpose Handlers (unchanged)
  const handleCreatePurpose = async () => {
    if (!newPurpose.trim()) {
      showToast("Purpose name cannot be empty");
      return;
    }
    const selectedClientPurpose = clientPurposes.find(
      (cp) => cp.purpose.name === newPurpose
    );
    if (!selectedClientPurpose) {
      showToast("Selected purpose not found");
      return;
    }
    const payload = {
      name_id: selectedClientPurpose.id,
      project: projectId.id,
    };
    try {
      const response = await createPurpose(payload);
      if (response.status === 201 || response.status === 200) {
        showToast("Purpose created!");
        setNewPurpose("");
        await fetchAllData();
      }
    } catch (error) {
      showApiErrors(error, "Failed to create purpose.");
    }
  };

  const handleEditPurpose = (purpose) => {
    setEditPurposeId(purpose.id);
    setEditPurposeName(purpose.name?.purpose?.name || purpose.name);
  };

  const handleSavePurpose = async (purposeId) => {
    if (!editPurposeName.trim()) {
      showToast("Purpose name cannot be empty");
      return;
    }
    try {
      await editPurpose(purposeId, { name: editPurposeName });
      showToast("Purpose updated!");
      setEditPurposeId(null);
      setEditPurposeName("");
      await fetchAllData();
    } catch (error) {
      showApiErrors(error, "Failed to update purpose.");
    }
  };

  const handleDeletePurpose = async (purposeId) => {
    if (!window.confirm("Are you sure you want to delete this purpose?"))
      return;
    try {
      await deletePurpose(purposeId);
      showToast("Purpose deleted!");
      await fetchAllData();
    } catch (error) {
      showApiErrors(error, "Failed to delete purpose.");
    }
  };

  // Phase Handlers
  // const handleCreatePhase = async () => {
  //   if (!selectedPurpose || !phaseName.trim()) {
  //     showToast("Please select purpose and enter phase name");
  //     return;
  //   }
  //   const purposeId = purposeData.find(
  //     (p) => (p.name?.purpose?.name || p.name) === selectedPurpose
  //   )?.id;
  //   if (!purposeId) {
  //     showToast("Purpose not found");
  //     return;
  //   }
  //   const response = await createPhase({
  //     project: projectId.id,
  //     purpose_id: purposeId,
  //     name: phaseName.trim(),

  //   });

  //   if (response.status === 200 || response.status === 201) {
  //     showToast("Phase created successfully!");
  //     setSelectedPurpose("");
  //     setPhaseName("");
  //     await fetchAllData();
  //   }
  // };


  const handleCreatePhase = async () => {
  if (!selectedPurpose || !phaseName.trim()) {
    showToast("Please select purpose and enter phase name");
    return;
  }
  const purposeId = purposeData.find(
    (p) => (p.name?.purpose?.name || p.name) === selectedPurpose
  )?.id;
  if (!purposeId) {
    showToast("Purpose not found");
    return;
  }

  // Find max sequence for this purpose
  const phasesForPurpose = phasesData.filter((p) => p.purpose_id === purposeId);
  const maxSeq = phasesForPurpose.length
    ? Math.max(...phasesForPurpose.map((p) => p.sequence || 1))
    : 0;
  const nextSequence = maxSeq + 1;

  const response = await createPhase({
    project: projectId.id,
    purpose_id: purposeId,
    name: phaseName.trim(),
    sequence: nextSequence,   // <-- add this line
  });

  if (response.status === 200 || response.status === 201) {
    showToast("Phase created successfully!");
    setSelectedPurpose("");
    setPhaseName("");
    await fetchAllData();
  }
};


  const handleEditPhase = (phase) => {
    setEditPhaseId(phase.id);
    setEditPhaseName(phase.phase);
    setEditPhasePurpose(phase.purpose);
  };

  const handleSavePhase = async (phaseId) => {
    const purposeId = purposeData.find(
      (p) => (p.name?.purpose?.name || p.name) === editPhasePurpose
    )?.id;
    if (!editPhaseName.trim() || !purposeId) {
      showToast("Please select purpose and enter phase name");
      return;
    }
    try {
      await editPhase(phaseId, { name: editPhaseName, purpose: purposeId });
      showToast("Phase updated!");
      setEditPhaseId(null);
      setEditPhaseName("");
      setEditPhasePurpose("");
      await fetchAllData();
    } catch (error) {
      showApiErrors(error, "Failed to update phase.");
    }
  };

  const handleDeletePhase = async (phaseId) => {
    if (!window.confirm("Are you sure you want to delete this phase?")) return;
    try {
      await deletePhase(phaseId);
      showToast("Phase deleted!", "success");
      await fetchAllData();
    } catch (error) {
      showApiErrors(error, "Failed to delete phase.");
    }
  };

  // Stage Handlers
  const handleCreateStage = async () => {
    if (!selectedPhase || !stageName.trim()) {
      showToast("Please select phase and enter stage name");
      return;
    }
    const [purposeName, phaseNameStr] = selectedPhase.split(":");
    const purposeId = getPurposeId(purposeName);
    const phaseId = getPhaseId(phaseNameStr);
    if (!purposeId || !phaseId) {
      showToast("Invalid purpose or phase selection");
      return;
    }
    const sequence = Math.max(...stagesData.map((s) => s.sequence || 0), 0) + 1;
    const payload = {
      project: projectId.id,
      purpose_id: purposeId,
      phase: phaseId,
      name: stageName.trim(),
      sequence: sequence,
    };
    const response = await createStage(payload);
    if (response.status === 200 || response.status === 201) {
      showToast("Stage created successfully!");
      setSelectedPhase("");
      setStageName("");
      setIsCreateStage(false);
      await fetchAllData();
    }
  };

  const handleEditStage = (stage) => {
    setEditStageId(stage.id);
    setEditedStageName(stage.stage);
    setEditedSequence(stage.sequence);
  };

  const handleSaveStage = async () => {
    if (editStageId === null) return;
    setIsSaving(true);
    try {
      const stageToUpdate = stagesData.find((s) => s.id === editStageId);
      const payload = {
        stage_id: stageToUpdate.id,
        name: editedStageName.trim(),
        sequence: editedSequence,
      };
      await editStage(payload);
      showToast("Stage updated successfully!");
      setEditStageId(null);
      setEditedStageName("");
      setEditedSequence(1);
      await fetchAllData();
    } catch (error) {
      showApiErrors(error, "Failed to update stage.");
    }
    setIsSaving(false);
  };

  const handleDeleteStage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this stage?")) return;
    try {
      await deleteStage(id);
      showToast("Stage deleted successfully!");
      await fetchAllData();
    } catch (error) {
      showApiErrors(error, "Failed to delete stage.");
    }
  };
  useEffect(() => {
  const current = purposeData.find((p) => p.is_current); // Use your actual key!
  setActivePurposeId(current?.id || null);
}, [purposeData]);

  // Pagination for modals
  const paginateModal = (arr, page) => paginate(arr, page, PAGE_SIZE);

  // --- UI ---
  return (
    <div
      className="w-full mx-auto px-3 py-3"
      style={{
        background: bgColor,
        border: `2px solid ${borderColor}`,
        color: textColor,
        borderRadius: 16,
        boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
        height: 600,
        maxWidth: "1300px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Compact Header with Tabs */}
      <div className="flex flex-col items-center mb-4">
        <h2 className="text-lg font-bold mb-3" style={{ color: iconColor }}>
          Project Management
        </h2>
        {/* Tab Navigation */}
        <div
          className="flex items-center justify-center gap-1 p-1"
          style={{
            background: `linear-gradient(135deg, ${ORANGE}15, ${ORANGE}08)`,
            borderRadius: 12,
            border: `1px solid ${borderColor}25`,
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`px-6 py-2 font-bold text-sm tracking-wide transition-all duration-200 focus:outline-none`}
              style={{
                minWidth: 110,
                color: activeSection === tab.key ? "#fff" : iconColor,
                background:
                  activeSection === tab.key
                    ? `linear-gradient(135deg, ${ORANGE}, ${ORANGE}dd)`
                    : "transparent",
                border:
                  activeSection === tab.key
                    ? `1px solid ${ORANGE}`
                    : `1px solid transparent`,
                borderRadius: 8,
                boxShadow:
                  activeSection === tab.key
                    ? "0 3px 12px rgba(255, 190, 99, 0.3)"
                    : "none",
              }}
              onClick={() => setActiveSection(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {/* PURPOSE */}
        {activeSection === "Purpose" && (
          <div
            className="flex flex-col h-full overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${cardColor}, ${cardColor}f5)`,
              border: `1px solid ${borderColor}30`,
              borderRadius: 12,
              boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
              padding: 24,
              position: "relative",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold" style={{ color: iconColor }}>
                🎯 Purpose Management
              </h3>
              <button
                onClick={() => setPurposeModal(true)}
                className="px-4 py-2 font-bold rounded-md text-sm"
                style={{
                  background: "#e0e7ff",
                  color: "#312e81",
                  border: "1px solid #a5b4fc",
                }}
              >
                Show All Purposes
              </button>
            </div>
            {/* Create Purpose */}
            <div className="flex gap-2 mb-3">
              <select
                value={newPurpose}
                onChange={(e) => setNewPurpose(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border rounded-lg"
                style={{
                  borderColor: borderColor,
                  color: textColor,
                  background: "#fffbe8",
                }}
              >
                <option value="">Select Client Purpose</option>
                {Array.isArray(clientPurposes) &&
                  clientPurposes.map((cp) => (
                    <option key={cp.id} value={cp.purpose?.name || ""}>
                      {String(cp.purpose?.name || "Unknown Purpose")}
                    </option>
                  ))}
              </select>
              <button
                onClick={handleCreatePurpose}
                className="px-4 py-2 font-bold text-sm flex items-center gap-1 rounded-lg"
                style={{
                  background: ORANGE,
                  color: "#fff",
                }}
              >
                <Plus size={16} /> Add
              </button>
            </div>
            {/* Edit Form if any */}
            {editPurposeId && (
              <div className="flex gap-2 mb-3">
                <input
                  className="flex-1 px-2 py-1 text-sm border rounded"
                  value={editPurposeName}
                  onChange={(e) => setEditPurposeName(e.target.value)}
                  style={{
                    borderColor: borderColor,
                    color: textColor,
                    background: "#fff",
                  }}
                />
                <button
                  className="px-3 py-1 rounded text-xs font-bold"
                  style={{ background: ORANGE, color: "#fff" }}
                  onClick={() => handleSavePurpose(editPurposeId)}
                >
                  <Check size={14} />
                </button>
                <button
                  className="px-3 py-1 rounded text-xs font-bold"
                  style={{ background: "#f4f4f4", color: textColor }}
                  onClick={() => setEditPurposeId(null)}
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* PHASES */}
        {activeSection === "Phases" && (
          <div
            className="flex flex-col h-full"
            style={{
              background: `linear-gradient(135deg, ${cardColor}, ${cardColor}f0)`,
              border: `2px solid ${borderColor}40`,
              borderRadius: 16,
              boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
              padding: 24,
              position: "relative",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold" style={{ color: iconColor }}>
                🔄 Phase Management
              </h3>
              <button
                onClick={() => setPhaseModal(true)}
                className="px-4 py-2 font-bold rounded-md text-sm"
                style={{
                  background: "#e0e7ff",
                  color: "#312e81",
                  border: "1px solid #a5b4fc",
                }}
              >
                Show All Phases
              </button>
            </div>
            {/* Create Phase */}
            <div className="flex gap-3 mb-3">
              {/* <select
                value={selectedPurpose}
                onChange={(e) => setSelectedPurpose(e.target.value)}
                className="w-1/3 px-3 py-2 text-sm border rounded-lg"
                style={{
                  borderColor: borderColor,
                  color: textColor,
                  background: "#fff",
                }}
              >
                <option value="">Select Purpose *</option>
                {Array.isArray(purposeData) &&
                  purposeData.map((purpose) => (
                    <option
                      key={purpose.id}
                      value={purpose.name?.purpose?.name || purpose.name}
                    >
                      {purpose.name?.purpose?.name || purpose.name}
                    </option>
                  ))}
              </select> */}
              <select
  value={selectedPurpose}
  onChange={(e) => setSelectedPurpose(e.target.value)}
  className="w-1/3 px-3 py-2 text-sm border rounded-lg"
  style={{
    borderColor: borderColor,
    color: textColor,
    background: "#fff",
  }}
>
  <option value="">Select Purpose *</option>
  {Array.isArray(purposeData) &&
    purposeData.map((purpose) => (
      <option
        key={purpose.id}
        value={purpose.name?.purpose?.name || purpose.name}
      >
        {purpose.sequence ? `[${purpose.sequence}] ` : ""}
        {purpose.name?.purpose?.name || purpose.name}
      </option>
    ))}
</select>

              <input
                value={phaseName}
                onChange={(e) => setPhaseName(e.target.value)}
                type="text"
                className="flex-1 px-3 py-2 border-2 text-sm font-medium rounded-lg"
                style={{
                  borderColor: borderColor,
                  color: textColor,
                  background: "#fff",
                }}
                placeholder="Enter phase name"
              />
              <button
                onClick={handleCreatePhase}
                className="px-4 py-2 font-bold rounded-lg"
                style={{
                  background: ORANGE,
                  color: "#fff",
                }}
              >
                <Plus size={16} /> Add
              </button>
            </div>
            {/* Edit Phase */}
            {editPhaseId && (
              <div className="flex gap-2 mb-3">
                <select
                  className="w-1/3 border-2 px-3 py-2 rounded-lg font-medium"
                  style={{
                    borderColor: borderColor,
                    color: textColor,
                    background: "#fff",
                  }}
                  value={editPhasePurpose}
                  onChange={(e) => setEditPhasePurpose(e.target.value)}
                >
                  {Array.isArray(purposeData) &&
                    purposeData.map((purpose) => (
                      <option
                        key={purpose.id}
                        value={purpose.name?.purpose?.name || purpose.name}
                      >
                        {purpose.name?.purpose?.name || purpose.name}
                      </option>
                    ))}
                </select>
                <input
                  className="flex-1 border-2 px-3 py-2 rounded-lg font-medium"
                  style={{
                    borderColor: borderColor,
                    color: textColor,
                    background: "#fff",
                  }}
                  value={editPhaseName}
                  onChange={(e) => setEditPhaseName(e.target.value)}
                />
                <button
                  className="px-3 py-1 rounded text-xs font-bold"
                  style={{ background: ORANGE, color: "#fff" }}
                  onClick={() => handleSavePhase(editPhaseId)}
                >
                  <Check size={14} />
                </button>
                <button
                  className="px-3 py-1 rounded text-xs font-bold"
                  style={{ background: "#f4f4f4", color: textColor }}
                  onClick={() => setEditPhaseId(null)}
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* STAGES */}
        {activeSection === "Stages" && (
          <div
            className="flex flex-col h-full"
            style={{
              background: `linear-gradient(135deg, ${cardColor}, ${cardColor}f0)`,
              border: `2px solid ${borderColor}40`,
              borderRadius: 16,
              boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
              padding: 24,
              position: "relative",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold" style={{ color: iconColor }}>
                Stage Management
              </h3>
              <button
                onClick={() => setStageModal(true)}
                className="px-4 py-2 font-bold rounded-md text-sm"
                style={{
                  background: "#e0e7ff",
                  color: "#312e81",
                  border: "1px solid #a5b4fc",
                }}
              >
                Show All Stages
              </button>
            </div>
            {/* Create Stage Form */}
            <div className="flex gap-3 mb-3">
              <select
                value={selectedPhase}
                onChange={(e) => setSelectedPhase(e.target.value)}
                className="w-1/3 px-3 py-2 text-sm border rounded-lg"
                style={{
                  borderColor: borderColor,
                  color: textColor,
                  background: "#fff",
                }}
              >
                <option value="">Select Phase</option>
                {phasesData.map((phase) => (
                  <option
                    key={phase.id}
                    value={`${phase.purpose}:${phase.phase}`}
                  >
                    {phase.purpose} - {phase.phase}
                  </option>
                ))}
              </select>
              <input
                value={stageName}
                onChange={(e) => setStageName(e.target.value)}
                type="text"
                className="flex-1 px-3 py-2 border-2 text-sm font-medium rounded-lg"
                style={{
                  borderColor: borderColor,
                  color: textColor,
                  background: "#fff",
                }}
                placeholder="Enter stage name"
              />
              <button
                onClick={handleCreateStage}
                className="px-4 py-2 font-bold rounded-lg"
                style={{
                  background: ORANGE,
                  color: "#fff",
                }}
              >
                <Plus size={16} /> Add
              </button>
            </div>
            {/* Edit Stage */}
            {editStageId && (
              <div className="flex gap-2 mb-3">
                <input
                  className="flex-1 px-3 py-2 border-2 text-sm font-medium rounded-lg"
                  style={{
                    borderColor: borderColor,
                    color: textColor,
                    background: "#fff",
                  }}
                  value={editedStageName}
                  onChange={(e) => setEditedStageName(e.target.value)}
                />
                <input
                  type="number"
                  min={1}
                  value={editedSequence}
                  onChange={(e) => setEditedSequence(Number(e.target.value))}
                  className="w-24 px-2 py-2 border-2 text-sm font-medium rounded-lg"
                  style={{
                    borderColor: borderColor,
                    color: textColor,
                    background: "#fff",
                  }}
                />
                <button
                  className="px-3 py-1 rounded text-xs font-bold"
                  style={{ background: ORANGE, color: "#fff" }}
                  onClick={handleSaveStage}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : <Check size={14} />}
                </button>
                <button
                  className="px-3 py-1 rounded text-xs font-bold"
                  style={{ background: "#f4f4f4", color: textColor }}
                  onClick={() => setEditStageId(null)}
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* PURPOSE MODAL */}
        {purposeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-2xl shadow-2xl p-6 min-w-[350px] max-w-lg w-full relative">
              <button
                onClick={() => setPurposeModal(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl font-bold"
              >
                ×
              </button>
              <h3 className="text-xl font-semibold mb-4 text-center">
                All Purposes
              </h3>


              {paginateModal(purposeData, purposePage).map((purpose) => (
  <div
    key={purpose.id}
    className="flex justify-between items-center border-b py-2"
  >
    <div>
      <span className="font-bold">
        {purpose.name?.purpose?.name || "Unknown Purpose"}
      </span>
    </div>
    <div className="flex gap-1">
      <button
        className="px-2 py-1 rounded bg-yellow-100 text-yellow-700"
        onClick={() => {
          handleEditPurpose(purpose);
          setPurposeModal(false);
        }}
      >
        Edit
      </button>
      <button
        className="px-2 py-1 rounded bg-red-100 text-red-700"
        onClick={() => handleDeletePurpose(purpose.id)}
      >
        Delete
      </button>
      <button
        className={`
          px-2 py-1 rounded text-white font-bold
          ${purpose.id === activePurposeId ? 'bg-green-500' : 'bg-blue-400'}
        `}
        disabled={activatingPurposeId !== null || purpose.id === activePurposeId}
        onClick={async () => {
          setActivatingPurposeId(purpose.id);
          try {
            const resp = await axios.post(
              `https://konstruct.world/projects/projects/${projectId.id}/activate-purpose/`,
              { purpose_id: purpose.id },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
                },
              }
            );
            if (resp.status === 200 || resp.status === 201) {
              setActivePurposeId(purpose.id);
              showToast("Purpose activated!");
              await fetchAllData();
            }
          } catch (err) {
            showToast("Failed to activate purpose!");
          }
          setActivatingPurposeId(null);
        }}
      >
        {purpose.id === activePurposeId ? "Activated" : "Activate"}
      </button>
    </div>
  </div>
))}

              {purposeData.length > PAGE_SIZE && (
                <div className="flex justify-center gap-1 mt-4">
                  {[...Array(Math.ceil(purposeData.length / PAGE_SIZE))].map(
                    (_, i) => (
                      <button
                        key={i}
                        className={`w-7 h-7 rounded-full ${
                          purposePage === i + 1
                            ? "bg-blue-300 text-white"
                            : "bg-gray-100 text-gray-700"
                        }`}
                        onClick={() => setPurposePage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        )}






       {phaseModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
    <div className="bg-white rounded-2xl shadow-2xl p-6 min-w-[350px] max-w-lg w-full relative">
      <button
        onClick={() => setPhaseModal(false)}
        className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl font-bold"
      >
        ×
      </button>
      <h3 className="text-xl font-semibold mb-4 text-center">
        All Phases
      </h3>
      {paginateModal(phasesData, phasePage).map((phase) => (
        <div
          key={phase.id}
          className="flex justify-between items-center border-b py-2"
        >
          <div>
            <span className="font-bold">
              {phase.purpose} / {phase.phase}
            </span>
            <span className="block text-xs text-gray-700">
              Seq: {phase.sequence}
            </span>
          </div>
          <div className="flex gap-1">
            <button
              className="px-2 py-1 rounded bg-yellow-100 text-yellow-700"
              onClick={() => {
                handleEditPhase(phase);
                setPhaseModal(false);
              }}
            >
              Edit
            </button>
            <button
              className="px-2 py-1 rounded bg-red-100 text-red-700"
              onClick={() => handleDeletePhase(phase.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
      {phasesData.length > PAGE_SIZE && (
        <div className="flex justify-center gap-1 mt-4">
          {[...Array(Math.ceil(phasesData.length / PAGE_SIZE))].map(
            (_, i) => (
              <button
                key={i}
                className={`w-7 h-7 rounded-full ${
                  phasePage === i + 1
                    ? "bg-blue-300 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
                onClick={() => setPhasePage(i + 1)}
              >
                {i + 1}
              </button>
            )
          )}
        </div>
      )}
    </div>
  </div>
)}


        {/* STAGE MODAL */}
        {stageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-2xl shadow-2xl p-6 min-w-[350px] max-w-lg w-full relative">
              <button
                onClick={() => setStageModal(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl font-bold"
              >
                ×
              </button>
              <h3 className="text-xl font-semibold mb-4 text-center">
                All Stages
              </h3>
              {paginateModal(stagesData, stagePage).map((stage) => (
                <div
                  key={stage.id}
                  className="flex justify-between items-center border-b py-2"
                >
                  <div>
                    <span className="font-bold">
                      {stage.purpose} / {stage.phase}
                    </span>
                    <span className="block text-xs text-gray-700">
                      Stage: {stage.stage} | Seq: {stage.sequence}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      className="px-2 py-1 rounded bg-yellow-100 text-yellow-700"
                      onClick={() => {
                        handleEditStage(stage);
                        setStageModal(false);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="px-2 py-1 rounded bg-red-100 text-red-700"
                      onClick={() => handleDeleteStage(stage.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {stagesData.length > PAGE_SIZE && (
                <div className="flex justify-center gap-1 mt-4">
                  {[...Array(Math.ceil(stagesData.length / PAGE_SIZE))].map(
                    (_, i) => (
                      <button
                        key={i}
                        className={`w-7 h-7 rounded-full ${
                          stagePage === i + 1
                            ? "bg-blue-300 text-white"
                            : "bg-gray-100 text-gray-700"
                        }`}
                        onClick={() => setStagePage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* NAVIGATION */}
      <div
        className="flex justify-between items-center p-6 mt-6 border-t"
        style={{ borderColor: `${borderColor}30` }}
      >
        <button
          className="px-8 py-3 font-bold flex items-center gap-2 rounded-xl transition-all duration-200 hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${borderColor}dd, ${borderColor})`,
            color: "#fff",
            boxShadow: `0 6px 20px ${borderColor}40`,
          }}
          onClick={previousStep}
        >
          ⬅️ Previous Step
        </button>
        <div className="text-center">
          {/* <p className="text-sm font-medium" style={{ color: textColor }}>
            Step 3 of 5 - Configure your project structure
          </p> */}
        </div>
        <button
          className="px-8 py-3 font-bold flex items-center gap-2 rounded-xl transition-all duration-200 hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE}dd)`,
            color: "#fff",
            boxShadow: `0 6px 20px ${ORANGE}40`,
          }}
          onClick={nextStep}
        >
          Next Step ➡️
        </button>
      </div>
    </div>
  );
}

export default Stages;

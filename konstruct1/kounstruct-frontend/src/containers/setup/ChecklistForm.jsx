// import React, { useState, useEffect } from "react";
// import { MdDelete, MdAdd } from "react-icons/md";
// import {
//   createChecklist,
//   allinfobuildingtoflat,
//   getPurposeByProjectId,
//   getPhaseByPurposeId,
//   GetstagebyPhaseid,
//   getCategoryTreeByProject,
//   createChecklistQuestion,
//   createChecklistItemOPTIONSS,
//   getChecklistById,
//   updateChecklistById,
//   deleteChecklistItem,
//   deleteChecklistItemOption,
// } from "../../api";
// import { showToast } from "../../utils/toast";
// import * as XLSX from "xlsx";
// import axios from "axios";
// import SideBarSetup from "../../components/SideBarSetup";
// import { useTheme } from "../../ThemeContext";
// import { checklistInstance, projectInstance } from '../../api/axiosInstance';

// import { useSidebar } from "../../components/SidebarContext";


// const ChecklistForm = ({
//   setShowForm,
//   checklist,
//   projectOptions = [],
//   onChecklistCreated,
// }) => {
//   const { theme } = useTheme();
//   const { sidebarOpen } = useSidebar();
  

//   // Color palette - exact same as main component
//   const palette =
//     theme === "dark"
//       ? {
//           selectText: "text-yellow-300",
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
//           selectText: "text-gray-900",
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
// //   const palette = {
// //   orange: "#ffbe63",
// //   offwhite: "#fcfaf7",
// //   bg: theme === "dark" ? "#191922" : "#fcfaf7",
// //   card: theme === "dark" ? "#23232c" : "#fff",
// //   border: "#ffbe63",
// //   text: theme === "dark" ? "#fff" : "#222",
// //   icon: "#ffbe63",
// // };

// const SIDEBAR_WIDTH = 0;

//   // ALL EXISTING STATE - NO CHANGES
//   const [projectId, setProjectId] = useState("");
//   const [buildings, setBuildings] = useState([]);
//   const [levels, setLevels] = useState([]);
//   const [zones, setZones] = useState([]);
//   const [flats, setFlats] = useState([]);
//   const [selectedBuilding, setSelectedBuilding] = useState("");
//   const [selectedLevel, setSelectedLevel] = useState("");
//   const [selectedZone, setSelectedZone] = useState("");
//   const [selectedFlat, setSelectedFlat] = useState("");
//   const [userData, setUserData] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const contentMarginLeft = sidebarOpen ? SIDEBAR_WIDTH : 0;

//   const [purposes, setPurposes] = useState([]);
//   const [phases, setPhases] = useState([]);
//   const [stages, setStages] = useState([]);
//   const [selectedPurpose, setSelectedPurpose] = useState("");
//   const [selectedPhase, setSelectedPhase] = useState("");
//   const [selectedStage, setSelectedStage] = useState("");
//   const [skipInitializer, setSkipInitializer] = useState(false);

//   const [categoryTree, setCategoryTree] = useState([]);
//   const [category, setCategory] = useState("");
//   const [cat1, setCat1] = useState("");
//   const [cat2, setCat2] = useState("");
//   const [cat3, setCat3] = useState("");
//   const [cat4, setCat4] = useState("");
//   const [cat5, setCat5] = useState("");
//   const [cat6, setCat6] = useState("");
//   // const [sendAllUnits, setSendAllUnits] = useState(false);

//   const [options, setOptions] = useState([{ value: "", submission: "P" }]);
//   const [questions, setQuestions] = useState([
//     { question: "", options: [], photo_required: false },
//   ]);

//   const [numOfQuestions, setNumOfQuestions] = useState(1);
//   const isEdit = !!checklist;
//   const [checklistName, setChecklistName] = useState("");

//   const selectedFlatObj = flats.find(
//     (f) => String(f.id) === String(selectedFlat)
//   );

//   // ADD THESE LINES:
//   const [rooms, setRooms] = useState([]);
//   const [selectedRoom, setSelectedRoom] = useState("");
//   // ADD THIS DEBUG LOG RIGHT AFTER STATE DECLARATIONS
//   console.log("🔥 Component render - projectId:", projectId);
//   console.log("🔥 Component render - projectId type:", typeof projectId);
//   const [selectedRooms, setSelectedRooms] = useState([]);
//   const [showRoomsModal, setShowRoomsModal] = useState(false);

//   console.log("🔍 DEBUG 1 - State Values Check:");
//   console.log("projectOptions:", projectOptions);
//   console.log("buildings:", buildings);
//   console.log("levels:", levels);
//   console.log("zones:", zones);
//   console.log("flats:", flats);
//   console.log("rooms:", rooms);
//   console.log("purposes:", purposes);
//   console.log("phases:", phases);
//   console.log("stages:", stages);
//   console.log("categoryTree:", categoryTree);
//   console.log("questions:", questions);

//   // Remove a question (ChecklistItem)
//   const handleRemoveQuestion = async (qIdx, questionId) => {
//     console.log("🗑️ Attempting to delete question:", { qIdx, questionId });

//     if (questionId) {
//       try {
//         if (selectedRooms.length > 0) {
//           const confirmDelete = window.confirm(
//             "This will delete the question from ALL room checklists. Continue?"
//           );
//           if (!confirmDelete) return;
//         }

//         console.log(
//           `🗑️ DELETE URL: https://konstruct.world/checklists/items/${questionId}/`
//         );

//         // Use correct API endpoint
//         await checklistInstance.delete(
//           `/items/${questionId}/`,
//           {
//             headers: {
//               Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );
//         console.log("✅ Question deleted successfully");
//         showToast("Question deleted successfully!");
//       } catch (err) {
//         console.error("❌ Delete question error:", err);
//         console.error("❌ Error response:", err.response?.data);
//         showToast("Failed to delete question", "error");
//         return;
//       }
//     } else {
//       console.log("🗑️ No question ID provided, only removing from UI");
//     }
//     // Remove from UI (local state)
//     setQuestions((prev) => prev.filter((_, idx) => idx !== qIdx));
//   };

//   // Remove an option (ChecklistItemOption)
//   const handleRemoveOption = async (qIdx, optIdx, optionId) => {
//     console.log("🗑️ Attempting to delete option:", { qIdx, optIdx, optionId });

//     if (optionId) {
//       try {
//         console.log(
//           `🗑️ DELETE URL: https://konstruct.world/checklists/options/${optionId}/`
//         );

//         // Use correct API endpoint
//         await checklistInstance.delete(
//           `/options/${optionId}/`,
//           {
//             headers: {
//               Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );
//         console.log("✅ Option deleted successfully");
//         showToast("Option deleted successfully!");
//       } catch (err) {
//         console.error("❌ Delete option error:", err);
//         console.error("❌ Error response:", err.response?.data);
//         showToast("Failed to delete option", "error");
//         return;
//       }
//     } else {
//       console.log("🗑️ No option ID provided, only removing from UI");
//     }
//     // Remove from UI (local state)
//     setQuestions((prev) => {
//       const updated = [...prev];
//       updated[qIdx].options = updated[qIdx].options.filter(
//         (_, i) => i !== optIdx
//       );
//       return updated;
//     });
//   };

//   // ALL EXISTING useEffect HOOKS - NO CHANGES
//   useEffect(() => {
//     if (checklist) {
//       setProjectId(checklist.project || "");
//       setChecklistName(checklist.name || "");
//       setCategory(checklist.category || "");
//       setCat1(checklist.CategoryLevel1 || "");
//       setCat2(checklist.CategoryLevel2 || "");
//       setCat3(checklist.CategoryLevel3 || "");
//       setCat4(checklist.CategoryLevel4 || "");
//       setCat5(checklist.CategoryLevel5 || "");
//       setCat6(checklist.CategoryLevel6 || "");
//       setQuestions(
//         checklist.questions || [
//           { question: "", options: [], photo_required: false },
//         ]
//       );
//       setSelectedBuilding(checklist.building || "");
//       setSelectedLevel(checklist.level || "");
//       setSelectedZone(checklist.zone || "");
//       setSelectedFlat(checklist.flat || "");
//       setSelectedPurpose(checklist.purpose || "");
//       setSelectedPhase(checklist.phase || "");
//       setSelectedStage(checklist.stage || "");
//     }
//   }, [checklist]);

//   useEffect(() => {
//     if (!projectId) {
//       setCategoryTree([]);
//       setCategory("");
//       setCat1("");
//       setCat2("");
//       setCat3("");
//       setCat4("");
//       setCat5("");
//       setCat6("");
//       return;
//     }
//     getCategoryTreeByProject(projectId)
//       .then((res) => setCategoryTree(res.data || []))
//       .catch(() => {
//         setCategoryTree([]);
//         showToast("Failed to load categories", "error");
//       });
//   }, [projectId]);

//   useEffect(() => {
//     console.log("🔥 useEffect triggered with projectId:", projectId);
//     console.log("🔥 projectId type:", typeof projectId);
//     console.log("🔥 projectId truthy?", !!projectId);
//     if (!projectId) {
//       console.log("🔥 Early return - no projectId");
//       setBuildings([]);
//       setLevels([]);
//       setZones([]);
//       setFlats([]);
//       setPurposes([]);
//       setPhases([]);
//       setStages([]);
//       setRooms([]);
//       setSelectedBuilding("");
//       setSelectedLevel("");
//       setSelectedZone("");
//       setSelectedFlat("");
//       setSelectedPurpose("");
//       setSelectedPhase("");
//       setSelectedStage("");
//       setSelectedRoom("");
//       return;
//     }
//     console.log("🔥 Past the early return, will execute API calls");
//     allinfobuildingtoflat(projectId)
//       .then((res) => {
//         console.log("Buildings fetched:", res.data);
//         setBuildings(Array.isArray(res.data) ? res.data : []);
//       })
//       .catch(() => {
//         showToast("Failed to load buildings", "error");
//         setBuildings([]);
//       });
//     console.log(buildings, "this si response");

//     // axios
//     //   .get(
//     //     `https://konstruct.world/projects/purpose/get-purpose-details-by-project-id/${projectId}/`,
//     //     {
//     //       headers: {
//     //         Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
//     //         "Content-Type": "application/json",
//     //       },
//     //     }
//     //   )
//     //   .then((res) => setPurposes(Array.isArray(res.data) ? res.data : []))
//     //   .catch(() => {
//     //     showToast("Failed to load purposes", "error");
//     //     setPurposes([]);
//     //   });

//     // axios
//     //   .get(
//     //     `https://konstruct.world/projects/purpose/get-purpose-details-by-project-id/${projectId}/`,
//     //     {
//     //       headers: {
//     //         Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
//     //         "Content-Type": "application/json",
//     //       },
//     //     },
//     //     console.log(
//     //       "we are in mdrchod https://konstruct.world/projects/purpose/get-purpose-details-by-project-id"
//     //     )
//     //   )
//     //   .then((res) => {
//     //     console.log("🚨 PURPOSES API RAW RESPONSE:", res.data);
//     //     console.log("🚨 PURPOSES API RESPONSE TYPE:", typeof res.data);
//     //     console.log("🚨 PURPOSES API IS ARRAY:", Array.isArray(res.data));

//     //     if (Array.isArray(res.data)) {
//     //       res.data.forEach((purpose, index) => {
//     //         console.log(`🚨 Purpose ${index}:`, purpose);
//     //         console.log(`🚨 Purpose ${index} keys:`, Object.keys(purpose));
//     //         console.log(`🚨 Purpose ${index} id:`, purpose.id, typeof purpose.id);
//     //         console.log(`🚨 Purpose ${index} name object:`, purpose.name);
//     //         console.log(
//     //           `🚨 Purpose ${index} actual name:`,
//     //           purpose.name?.purpose?.name
//     //         );
//     //         console.log(
//     //           `🚨 Purpose ${index} client_id:`,
//     //           purpose.name?.client_id
//     //         );
//     //         console.log(
//     //           `🚨 Purpose ${index} assigned_by:`,
//     //           purpose.name?.assigned_by
//     //         );
//     //         console.log(
//     //           `🚨 Purpose ${index} assigned_at:`,
//     //           purpose.name?.assigned_at
//     //         );
//     //       });
//     //     }

//     //     const purposesData = Array.isArray(res.data) ? res.data : [];
//     //     setPurposes(purposesData);

//     //     // IMMEDIATE DEBUG AFTER SETTING STATE
//     //     console.log("🎯 SETTING PURPOSES TO:", purposesData);
//     //     console.log("🎯 PURPOSES DATA LENGTH:", purposesData.length);

//     //     // Use setTimeout to check state after it's updated
//     //     setTimeout(() => {
//     //       console.log("🎯 PURPOSES STATE AFTER UPDATE:", purposes);
//     //     }, 100);
//     //   })
//     //   .catch(() => {
//     //     showToast("Failed to load purposes", "error");
//     //     setPurposes([]);
//     //   });

//     // REPLACE YOUR PURPOSES API CALL WITH THIS ENHANCED VERSION:

//     // projectInstance.get(
//     //   `/purpose/get-purpose-details-by-project-id/${projectId}/`,
//     //   {
//     //     headers: {
//     //       Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
//     //       "Content-Type": "application/json",
//     //     },
//     //   }
//     // )
//     axios
//       .get(
//         `https://konstruct.world/projects/purpose/get-purpose-details-by-project-id/${projectId}/`,
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
//             "Content-Type": "application/json",
//           },
//         }
//       )
//       .then((res) => {
//         console.log("🚨 PURPOSES API RAW RESPONSE:", res.data);
//         console.log("🚨 PURPOSES API RESPONSE TYPE:", typeof res.data);
//         console.log("🚨 PURPOSES API IS ARRAY:", Array.isArray(res.data));

//         if (Array.isArray(res.data)) {
//           console.log("🚨 PURPOSES COUNT:", res.data.length);

//           res.data.forEach((purpose, index) => {
//             console.log(`🚨 Purpose ${index}:`, purpose);
//             console.log(
//               `🚨 Purpose ${index} id:`,
//               purpose.id,
//               typeof purpose.id
//             );
//             console.log(`🚨 Purpose ${index} name object:`, purpose.name);

//             // ✅ CHECK ALL POSSIBLE NAME PATHS
//             console.log(
//               `🚨 Purpose ${index} name.purpose.name:`,
//               purpose.name?.purpose?.name
//             );
//             console.log(`🚨 Purpose ${index} name.name:`, purpose.name?.name);
//             console.log(
//               `🚨 Purpose ${index} purpose.name:`,
//               purpose.purpose?.name
//             );
//             console.log(`🚨 Purpose ${index} title:`, purpose.title);

//             // ✅ FINAL RESOLVED NAME
//             const resolvedName =
//               purpose.name?.purpose?.name ||
//               purpose.name?.name ||
//               purpose.purpose?.name ||
//               purpose.title ||
//               `Purpose ${purpose.id}`;
//             console.log(`🎯 FINAL RESOLVED NAME for ${index}:`, resolvedName);
//           });
//         }

//         const purposesData = Array.isArray(res.data) ? res.data : [];
//         setPurposes(purposesData);

//         console.log("🎯 SETTING PURPOSES TO:", purposesData);
//         console.log("🎯 PURPOSES WILL BE LENGTH:", purposesData.length);

//         // ✅ VERIFY STATE UPDATE
//         setTimeout(() => {
//           console.log("🔍 PURPOSES STATE AFTER UPDATE:", purposes);
//           console.log("🔍 PURPOSES LENGTH AFTER UPDATE:", purposes.length);
//         }, 100);
//       })
//       .catch((error) => {
//         console.error("❌ PURPOSES API ERROR:", error);
//         showToast("Failed to load purposes", "error");
//         setPurposes([]);
//       });

//     console.log("🚀 About to call rooms API with projectId:", projectId);
//     console.log(
//       "🚀 Rooms API URL:",
//       `https://konstruct.world/projects/rooms/by_project/?project_id=${projectId}`
//     );

//     axios.get(
//       `https://konstruct.world/projects/rooms/by_project/?project_id=${projectId}`,
//       {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
//           "Content-Type": "application/json",
//         },
//       }
//     )
//       .then((res) => {
//         console.log("🏠 Rooms API Response:", res.data);
//         console.log(
//           "🏠 Rooms count:",
//           Array.isArray(res.data) ? res.data.length : 0
//         );
//         console.log("🏠 Sample room:", res.data?.[0]);
//         setRooms(Array.isArray(res.data) ? res.data : []);
//       })
//       .catch((error) => {
//         console.error("🏠 Rooms API Error:", error);
//         showToast("Failed to load rooms", "error");
//         setRooms([]);
//       });
//     setLevels([]);
//     setZones([]);
//     setFlats([]);
//     setPhases([]);
//     setStages([]);
//     setSelectedBuilding("");
//     setSelectedLevel("");
//     setSelectedZone("");
//     setSelectedFlat("");
//     setSelectedPurpose("");
//     setSelectedPhase("");
//     setSelectedStage("");
//     console.log("🔥 Past the early return, will execute API calls");
//   }, [projectId]);

// useEffect(() => {
//   if (isEdit && checklist?.id) {
//     const fetchChecklistDetails = async () => {
//       try {
//         const response = await getChecklistById(checklist.id);
//         const checklistData = response.data;

//         setChecklistName(checklistData.name || "");
//         setSkipInitializer(checklistData.not_initialized || false);

//         setProjectId(checklistData.project_id || "");

//         setTimeout(() => {
//           setSelectedPurpose(checklistData.purpose_id || "");
//           setSelectedPhase(checklistData.phase_id || "");
//           setSelectedStage(checklistData.stage_id || "");
//           setCategory(checklistData.category || "");
//           setCat1(checklistData.category_level1 || "");
//           setCat2(checklistData.category_level2 || "");
//           setCat3(checklistData.category_level3 || "");
//           setCat4(checklistData.category_level4 || "");
//           setCat5(checklistData.category_level5 || "");
//           setCat6(checklistData.category_level6 || "");
//           setSelectedBuilding(checklistData.building_id || "");
//           setSelectedZone(checklistData.zone_id || "");
//           setSelectedFlat(checklistData.flat_id || "");
//           setSelectedRooms(
//             checklistData.rooms && checklistData.rooms.length > 0
//               ? checklistData.rooms.map((r) =>
//                   typeof r === "object" ? r.id : r
//                 )
//               : []
//           );
//         }, 500); 

//         if (checklistData.items && checklistData.items.length > 0) {
//           const formattedQuestions = checklistData.items.map((item) => ({
//             id: item.id, // ✅ Preserve question ID
//             question: item.title,
//             options: item.options
//               ? item.options.map((opt) => ({
//                   id: opt.id, // ✅ Preserve option ID
//                   value: opt.name,
//                   submission: opt.choice,
//                 }))
//               : [],
//             photo_required: item.photo_required || false,
//           }));
//           setQuestions(formattedQuestions);
//         }
//       } catch (error) {
//         showToast("Failed to load checklist details", "error");
//       }
//     };

//     fetchChecklistDetails();
//   }
// }, [isEdit, checklist?.id]);

//   useEffect(() => {
//     if (!selectedBuilding) {
//       setLevels([]);
//       setZones([]);
//       setFlats([]);
//       setSelectedLevel("");
//       setSelectedZone("");
//       setSelectedFlat("");
//       return;
//     }
//     const b = buildings.find((x) => String(x.id) === String(selectedBuilding));
//     setLevels(b?.levels || []);
//     setSelectedLevel("");
//     setSelectedZone("");
//     setSelectedFlat("");
//     console.log("Levels for building", selectedBuilding, b?.levels || []);
//   }, [selectedBuilding, buildings]);

//   useEffect(() => {
//     if (!selectedLevel) {
//       setZones([]);
//       setFlats([]);
//       setSelectedZone("");
//       setSelectedFlat("");
//       return;
//     }
//     const l = levels.find((x) => String(x.id) === String(selectedLevel));
//     setZones(l?.zones || []);
//     setSelectedZone("");
//     setSelectedFlat("");
//     console.log("Zones for level", selectedLevel, l?.zones || []);
//   }, [selectedLevel, levels]);

//   useEffect(() => {
//     if (!selectedZone) {
//       setFlats([]);
//       setSelectedFlat("");
//       return;
//     }
//     const z = zones.find((x) => String(x.id) === String(selectedZone));
//     setFlats(z?.flats || []);
//     setSelectedFlat("");
//     console.log("Flats for zone", selectedZone, z?.flats || []);
//   }, [selectedZone, zones]);

//   useEffect(() => {
//     if (!selectedPurpose) {
//       setPhases([]);
//       setStages([]);
//       setSelectedPhase("");
//       setSelectedStage("");
//       return;
//     }
//     getPhaseByPurposeId(selectedPurpose)
//       .then((res) => setPhases(res.data || []))
//       .catch(() => {
//         showToast("Failed to load phases", "error");
//         setPhases([]);
//       });
//     setStages([]);
//     setSelectedPhase("");
//     setSelectedStage("");
//   }, [selectedPurpose]);

//   useEffect(() => {
//     if (!selectedPhase) {
//       setStages([]);
//       setSelectedStage("");
//       return;
//     }
//     GetstagebyPhaseid(selectedPhase)
//       .then((res) => setStages(res.data || []))
//       .catch(() => {
//         showToast("Failed to load stages");
//         setStages([]);
//       });
//     setSelectedStage("");
//   }, [selectedPhase]);

//   // ALL EXISTING FUNCTIONS - NO CHANGES
//   const handleQuestionOptionAdd = (qIdx) => {
//     setQuestions((prev) => {
//       const updated = [...prev];
//       if (!updated[qIdx].options) {
//         updated[qIdx].options = [];
//       }
//       updated[qIdx].options.push({ value: "", submission: "P" });
//       return updated;
//     });
//   };

//   const handleQuestionOptionChange = (qIdx, key, value, optIdx) => {
//     setQuestions((prev) => {
//       const updated = [...prev];
//       if (!updated[qIdx].options) {
//         updated[qIdx].options = [];
//       }
//       if (!updated[qIdx].options[optIdx]) {
//         updated[qIdx].options[optIdx] = { value: "", submission: "P" };
//       }
//       updated[qIdx].options[optIdx][key] = value;
//       return updated;
//     });
//   };

//   const handleQuestionOptionRemove = (qIdx, optIdx) => {
//     setQuestions((prev) => {
//       const updated = [...prev];
//       if (updated[qIdx].options && updated[qIdx].options.length > optIdx) {
//         updated[qIdx].options = updated[qIdx].options.filter(
//           (_, idx) => idx !== optIdx
//         );
//       }
//       return updated;
//     });
//   };

//   const handleAddMoreQuestions = () => {
//     const toAdd = [];
//     for (let i = 0; i < numOfQuestions; i++) {
//       toAdd.push({
//         question: "",
//         options: [],
//         photo_required: false,
//       });
//     }
//     setQuestions([...questions, ...toAdd]);
//   };

//   const getLevelOptions = (levelKey) => {
//     if (levelKey === 1) {
//       return categoryTree;
//     }
//     if (levelKey === 2 && category) {
//       return (
//         categoryTree.find((cat) => String(cat.id) === String(category))
//           ?.level1 || []
//       );
//     }
//     if (levelKey === 3 && cat1) {
//       const catObj = categoryTree.find(
//         (cat) => String(cat.id) === String(category)
//       );
//       return (
//         catObj?.level1.find((l1) => String(l1.id) === String(cat1))?.level2 ||
//         []
//       );
//     }
//     if (levelKey === 4 && cat2) {
//       const catObj = categoryTree.find(
//         (cat) => String(cat.id) === String(category)
//       );
//       const cat1Obj = catObj?.level1.find(
//         (l1) => String(l1.id) === String(cat1)
//       );
//       return (
//         cat1Obj?.level2.find((l2) => String(l2.id) === String(cat2))?.level3 ||
//         []
//       );
//     }
//     if (levelKey === 5 && cat3) {
//       const catObj = categoryTree.find(
//         (cat) => String(cat.id) === String(category)
//       );
//       const cat1Obj = catObj?.level1.find(
//         (l1) => String(l1.id) === String(cat1)
//       );
//       const cat2Obj = cat1Obj?.level2.find(
//         (l2) => String(l2.id) === String(cat2)
//       );
//       return (
//         cat2Obj?.level3.find((l3) => String(l3.id) === String(cat3))?.level4 ||
//         []
//       );
//     }
//     if (levelKey === 6 && cat4) {
//       const catObj = categoryTree.find(
//         (cat) => String(cat.id) === String(category)
//       );
//       const cat1Obj = catObj?.level1.find(
//         (l1) => String(l1.id) === String(cat1)
//       );
//       const cat2Obj = cat1Obj?.level2.find(
//         (l2) => String(l2.id) === String(cat2)
//       );
//       const cat3Obj = cat2Obj?.level3.find(
//         (l3) => String(l3.id) === String(cat3)
//       );
//       return (
//         cat3Obj?.level4.find((l4) => String(l4.id) === String(cat4))?.level5 ||
//         []
//       );
//     }
//     return [];
//   };

//   const handleCategoryChange = (e) => {
//     setCategory(e.target.value);
//     setCat1("");
//     setCat2("");
//     setCat3("");
//     setCat4("");
//     setCat5("");
//     setCat6("");
//   };
//   const handleCat1Change = (e) => {
//     setCat1(e.target.value);
//     setCat2("");
//     setCat3("");
//     setCat4("");
//     setCat5("");
//     setCat6("");
//   };
//   const handleCat2Change = (e) => {
//     setCat2(e.target.value);
//     setCat3("");
//     setCat4("");
//     setCat5("");
//     setCat6("");
//   };
//   const handleCat3Change = (e) => {
//     setCat3(e.target.value);
//     setCat4("");
//     setCat5("");
//     setCat6("");
//   };
//   const handleCat4Change = (e) => {
//     setCat4(e.target.value);
//     setCat5("");
//     setCat6("");
//   };
//   const handleCat5Change = (e) => {
//     setCat5(e.target.value);
//     setCat6("");
//   };
//   const handleCat6Change = (e) => {
//     setCat6(e.target.value);
//   };

//   const handleRoomSelection = (roomId, isSelected) => {
//     if (isSelected) {
//       setSelectedRooms([...selectedRooms, roomId]);
//     } else {
//       setSelectedRooms(selectedRooms.filter((id) => id !== roomId));
//     }
//   };

//   const handleSelectAllRooms = () => {
//     setSelectedRooms(rooms.map((room) => room.id));
//   };

//   const handleClearAllRooms = () => {
//     setSelectedRooms([]);
//   };

//   useEffect(() => {
//     const userString = localStorage.getItem("USER_DATA");
//     if (userString && userString !== "undefined") {
//       const parsedUserData = JSON.parse(userString);
//       setUserData(parsedUserData);
//     }
//   }, []);
//   const handleCreateChecklist = async () => {
//     if (isSubmitting) return; // Prevent double submit
//     setIsSubmitting(true);
//     if (!checklistName.trim()) return showToast("Checklist name required!");
//     if (!projectId || projectId === "") return showToast("Select a project");
//     if (!selectedPurpose || selectedPurpose === "")
//       return showToast("Select a purpose");
//     if (!category || category === "") return showToast("Select a category");
//     if (!questions.length) return showToast("Add at least one question");
//     // Room validation - if rooms exist but none selected, warn user
//     if (rooms.length > 0 && selectedRooms.length === 0) {
//       const shouldProceed = window.confirm(
//         "Rooms are available but none selected. This will create a single checklist without room assignment. Do you want to continue?"
//       );
//       if (!shouldProceed) return;
//     }

//     const parsedProjectId = parseInt(projectId);
//     const parsedPurposeId = parseInt(selectedPurpose);
//     const parsedCategoryId = parseInt(category);

//     if (isNaN(parsedProjectId)) return showToast("Invalid project selected");
//     if (isNaN(parsedPurposeId)) return showToast("Invalid purpose selected");
//     if (isNaN(parsedCategoryId)) return showToast("Invalid category selected");

//     console.log("Project ID:", parsedProjectId);

//     const checklistPayload = {
//       name: checklistName,
//       project_id: parsedProjectId,
//       purpose_id: parsedPurposeId,
//       phase_id:
//         selectedPhase && selectedPhase !== "" ? parseInt(selectedPhase) : null,
//       stage_id:
//         selectedStage && selectedStage !== "" ? parseInt(selectedStage) : null,
//       category: parsedCategoryId,
//       category_level1: cat1 && cat1 !== "" ? parseInt(cat1) : null,
//       category_level2: cat2 && cat2 !== "" ? parseInt(cat2) : null,
//       category_level3: cat3 && cat3 !== "" ? parseInt(cat3) : null,
//       category_level4: cat4 && cat4 !== "" ? parseInt(cat4) : null,
//       category_level5: cat5 && cat5 !== "" ? parseInt(cat5) : null,
//       category_level6: cat6 && cat6 !== "" ? parseInt(cat6) : null,
//       building_id:
//         selectedBuilding && selectedBuilding !== ""
//           ? parseInt(selectedBuilding)
//           : null,
//       zone_id:
//         selectedZone && selectedZone !== "" ? parseInt(selectedZone) : null,
//       flat_id:
//         selectedFlat && selectedFlat !== "" ? parseInt(selectedFlat) : null,
//       remarks: "",
//       not_initialized: skipInitializer,
//     };

//     console.log("=== CHECKLIST CREATION DEBUG ===");
//     // console.log("sendAllUnits:", sendAllUnits);
//     console.log("isEdit:", isEdit);
//     console.log("checklistPayload:", checklistPayload);

//     try {
//       console.log("Payload being sent:", checklistPayload);

//       let checklistRes;
//       let checklistId;

//       if (isEdit && checklist?.id) {
//         if (selectedRooms.length > 0) {
//           // BULK UPDATE: Delete old + Recreate strategy
//           console.log("🔄 BULK UPDATE MODE - Delete + Recreate");

//           // First, delete the old checklist
//           // First, delete the old checklist
//           try {
//             await axios.delete(
//           `https://konstruct.world/checklists/checklists/${checklist.id}/`, {
//               headers: {
//                 Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
//                 "Content-Type": "application/json",
//               },
//             });
//             console.log("✅ Old checklist deleted successfully");
//           } catch (deleteError) {
//             console.error("❌ Delete error:", deleteError);
//             showToast("Failed to delete old checklist", "error");
//             return;
//           }

//           // Then create new bulk checklists
//           const bulkPayload = {
//             ...checklistPayload,
//             description: checklistPayload.remarks || "Bulk checklist creation",
//             created_by_id: userData.user_id,
//             rooms: selectedRooms,
//             items: questions.map((q) => ({
//               title: q.question,
//               description: q.question,
//               status: "not_started",
//               ignore_now: false,
//               photo_required: q.photo_required || false,
//               options: (q.options || [])
//                 .filter((opt) => opt.value && opt.value.trim() !== "")
//                 .map((opt) => ({
//                   name: opt.value,
//                   choice: opt.submission,
//                 })),
//             })),
//           };

//           checklistRes = await checklistInstance.post(
//             "/create/unit-chechklist/",
//             bulkPayload,
//             {
//               headers: {
//                 Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
//                 "Content-Type": "application/json",
//               },
//             }
//           );

//           showToast("Bulk checklist updated successfully!", "success");
//         } else {
//           console.log("🔄 SINGLE UPDATE MODE");
//           checklistRes = await updateChecklistById(
//             checklist.id,
//             checklistPayload
//           );
//           checklistId = checklist.id;
//           showToast("Checklist updated successfully!", "success");
//         }
//       } else {
//         console.log("🔍 Let's check what URL createChecklist function uses...");
//         console.log(
//           "🔍 Look in Network tab when creating single checklist to see the exact URL"
//         );
//         //   if (sendAllUnits) {
//         //     console.log("🚀 BULK CREATION MODE ACTIVATED");
//         //     const bulkPayload = {
//         //       ...checklistPayload,
//         //       description: checklistPayload.remarks || "Bulk checklist creation",
//         //       created_by_id: 1,
//         //       rooms: selectedRooms, // ✅ ADD THIS LINE
//         //       items: questions.map((q) => ({
//         //         title: q.question,
//         //         description: q.question,
//         //         status: "not_started",
//         //         ignore_now: false,
//         //         photo_required: q.photo_required || false,
//         //         options: (q.options || [])
//         //           .filter((opt) => opt.value && opt.value.trim() !== "")
//         //           .map((opt) => ({
//         //             name: opt.value,
//         //             choice: opt.submission,
//         //           })),
//         //       })),
//         //     };
//         //     console.log("📦 Bulk Payload being sent:", bulkPayload);
//         //     console.log("📦 Items count:", bulkPayload.items.length);
//         //     console.log("📦 First item options:", bulkPayload.items[0]?.options);

//         //     checklistRes = await axios.post(
//         //       "https://konstruct.world/checklists/create/unit-chechklist/",
//         //       bulkPayload,
//         //       {
//         //         headers: {
//         //           Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
//         //           "Content-Type": "application/json",
//         //         },
//         //       }
//         //     );
//         //     console.log("✅ Bulk API Response:", checklistRes.data);
//         //     console.log(
//         //       "✅ Created checklist IDs:",
//         //       checklistRes.data.checklist_ids
//         //     );
//         //     showToast(
//         //       `Checklists created for all units successfully! Created ${
//         //         checklistRes.data.checklist_ids?.length || 0
//         //       } checklists`,
//         //       "success"
//         //     );
//         //   } else {
//         //     console.log("🎯 SINGLE CREATION MODE");
//         //     checklistRes = await createChecklist(checklistPayload);
//         //     checklistId =
//         //       checklistRes.data?.id ||
//         //       checklistRes.data?.pk ||
//         //       checklistRes.data?.ID;
//         //     showToast("Checklist created successfully!", "success");
//         //   }
//         // }

//         if (selectedRooms.length > 0) {
//           console.log("🚀 BULK CREATION MODE - ROOMS SELECTED");
//           const bulkPayload = {
//             ...checklistPayload,
//             description: checklistPayload.remarks || "Bulk checklist creation",
//             created_by_id: userData.user_id,
//             rooms: selectedRooms,
//             items: questions.map((q) => ({
//               title: q.question,
//               description: q.question,
//               status: "not_started",
//               ignore_now: false,
//               photo_required: q.photo_required || false,
//               options: (q.options || [])
//                 .filter((opt) => opt.value && opt.value.trim() !== "")
//                 .map((opt) => ({
//                   name: opt.value,
//                   choice: opt.submission,
//                 })),
//             })),
//           };
//           console.log("📦 Bulk Payload being sent:", bulkPayload);

//           checklistRes = await checklistInstance.post(
//             "/create/unit-chechklist/",
//             bulkPayload,
//             {
//               headers: {
//                 Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
//                 "Content-Type": "application/json",
//               },
//             }
//           );
//           console.log("✅ Bulk API Response:", checklistRes.data);
//           showToast(
//             `Checklists created for selected rooms successfully! Created ${
//               checklistRes.data.checklist_ids?.length || 0
//             } checklists`,
//             "success"
//           );
//         } else {
//           console.log("🎯 SINGLE CREATION MODE - NO ROOMS");
//           checklistRes = await createChecklist(checklistPayload);
//           checklistId =
//             checklistRes.data?.id ||
//             checklistRes.data?.pk ||
//             checklistRes.data?.ID;
//           showToast("Checklist created successfully!", "success");
//         }
//       }

//       if (
//         checklistRes.status === 201 ||
//         checklistRes.status === 200 ||
//         checklistRes.data?.id ||
//         checklistRes.data?.checklist_ids
//       ) {
//         console.log("🎉 SUCCESS CONDITION MET");
//         console.log("Response status:", checklistRes.status);
//         console.log("Has single ID:", !!checklistRes.data?.id);
//         console.log("Has bulk IDs:", !!checklistRes.data?.checklist_ids);

//         if (selectedRooms.length === 0 && !isEdit) {
//           for (let i = 0; i < questions.length; i++) {
//             const q = questions[i];

//             const itemRes = await createChecklistQuestion({
//               checklist: checklistId,
//               title: q.question,
//               photo_required: q.photo_required || false,
//               is_done: false,
//             });

//             const checklistItemId = itemRes.data?.id;

//             if (checklistItemId && q.options?.length) {
//               for (let option of q.options) {
//                 if (option.value && option.value.trim() !== "") {
//                   await createChecklistItemOPTIONSS({
//                     checklist_item: checklistItemId,
//                     name: option.value,
//                     choice: option.submission,
//                   });
//                 }
//               }
//             }
//           }
//         }

//         if (
//           !isEdit &&
//           onChecklistCreated &&
//           typeof onChecklistCreated === "function"
//         ) {
//           if (selectedRooms.length > 0) {
//             console.log("📤 Calling callback for BULK creation");
//             const createdChecklistData = {
//               ...checklistPayload,
//               id: checklistRes.data?.checklist_ids?.[0] || null,
//               project_id: parsedProjectId,
//               category_id: parsedCategoryId,
//               is_bulk: true,
//               checklist_count: checklistRes.data?.checklist_ids?.length || 0,
//             };
//             console.log("📤 Bulk callback data:", createdChecklistData);
//             onChecklistCreated(createdChecklistData);
//           } else {
//             const createdChecklistData = {
//               ...checklistPayload,
//               id: checklistId,
//               project_id: parsedProjectId,
//               category_id: parsedCategoryId,
//             };
//             console.log("📤 Single callback data:", createdChecklistData);
//             onChecklistCreated(createdChecklistData);
//           }
//         }

//         setShowForm(false);
//       } else {
//         console.error("Checklist creation failed:", checklistRes);
//         showToast(
//           checklistRes.data?.message || "Failed to create checklist",
//           "error"
//         );
//       }
//     } catch (error) {
//       console.error("Error creating checklist:", "error");

//       if (error.response) {
//         console.error("Error response:", error.response.data);
//         const errorMessage =
//           error.response.data?.message ||
//           error.response.data?.detail ||
//           `Server error: ${error.response.status}`;
//         showToast(errorMessage);
//       } else {
//         showToast(
//           "Failed to create checklist and questions. Please try again.",
//           "error"
//         );
//       }
//     }
//     setIsSubmitting(false); // Always re-enable after operation
//   };

//   // EXACT SAME BULK UPLOAD FUNCTION
//   const handleBulkUpload = (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (e) => {
//       try {
//         const data = new Uint8Array(e.target.result);
//         const workbook = XLSX.read(data, { type: "array" });
//         const sheetName = workbook.SheetNames[0];
//         const worksheet = workbook.Sheets[sheetName];
//         const jsonData = XLSX.utils.sheet_to_json(worksheet);

//         const bulkQuestions = [];

//         jsonData.forEach((row) => {
//           const question = row["Question"] || row["question"] || "";
//           const optionsString = row["Options"] || row["options"] || "";
//           const photoRequired =
//             row["PhotoRequired"] || row["photo_required"] || false;

//           const options = [];
//           if (optionsString) {
//             const optionPairs = optionsString.split("|");
//             optionPairs.forEach((pair) => {
//               const match = pair.match(/^(.+)\(([PN])\)$/);
//               if (match) {
//                 options.push({
//                   value: match[1].trim(),
//                   submission: match[2],
//                 });
//               }
//             });
//           }

//           if (question.trim()) {
//             bulkQuestions.push({
//               question: question.trim(),
//               options: options,
//               photo_required:
//                 photoRequired === true ||
//                 photoRequired === "true" ||
//                 photoRequired === "True",
//             });
//           }
//         });

//         if (bulkQuestions.length > 0) {
//           setQuestions([...questions, ...bulkQuestions]);
//           showToast(
//             `${bulkQuestions.length} questions uploaded successfully!`,
//             "success"
//           );
//         } else {
//           showToast("No valid questions found in the file", "error");
//         }

//         event.target.value = "";
//       } catch (error) {
//         showToast("Error reading file. Please check the format.", "error");
//       }
//     };
//     reader.readAsArrayBuffer(file);
//   };
//   // REPLACE WITH THIS:
//   console.log("🔍 DEBUG 8 - Final Render Check:");
//   console.log("All arrays are properly structured:", {
//   projectOptions: Array.isArray(projectOptions),
//   buildings: Array.isArray(buildings),
//   levels: Array.isArray(levels),
//   zones: Array.isArray(zones),
//   flats: Array.isArray(flats),
//   rooms: Array.isArray(rooms),
//   purposes: Array.isArray(purposes),
//   phases: Array.isArray(phases),
//   stages: Array.isArray(stages),
//   questions:Array.isArray(questions)
// });
// return (
//   <div className="flex min-h-screen" style={{ background: palette.bg }}>
//     {/* <SideBarSetup /> */}
//  <div className="flex-1 p-4 lg:p-8 transition-all duration-300"
//   style={{
//     marginLeft: sidebarOpen ? 0 : 0, // 250 if sidebar open, 0 if closed
//     // Or use sidebar width variable if your sidebar can change size
//   }}
// >      <div
//         className="w-full max-w-7xl mx-auto p-4 lg:p-8 rounded-2xl" style={{ background: palette.card, color: palette.text,borderColor: palette.border }}
// //  ${palette.shadow} border ${palette.border}`}
//       >
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex items-center justify-between mb-6">
//             <div className="flex items-center space-x-4">
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
//                   {isEdit ? "Edit Checklist" : "Create New Checklist"}
//                 </h1>
//                 <p className={`${palette.textSecondary} text-lg mt-1`}>
//                   {isEdit
//                     ? "Update checklist details and questions"
//                     : "Build comprehensive checklists for your projects"}
//                 </p>
//               </div>
//             </div>
//             <button
//               className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 ${palette.secondary} flex items-center space-x-2`}
//               onClick={() => setShowForm(false)}
//             >
//               <svg
//                 className="w-5 h-5"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M10 19l-7-7m0 0l7-7m-7 7h18"
//                 />
//               </svg>
//               <span>Back</span>
//             </button>
//           </div>
//         </div>
//         {/* Apply to All Units & Template & Skip Initializer - IN SAME LINE */}
//         <div className="mb-8 flex flex-col lg:flex-row gap-4">
//           {/* Apply to All Units Toggle */}
//           {/* <div
//             className={`flex-1 p-6 rounded-xl border-2 transition-all duration-300 ${palette.card} ${palette.border}`}
//           > */}
//             {/* <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-4">
//                   <div className={`p-3 rounded-full ${palette.primary}`}>
//                     <svg
//                       className="w-6 h-6 text-white"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0V9a1 1 0 011-1h4a1 1 0 011 1v12"
//                       />
//                     </svg>
//                   </div>
//                   <div>
//                     <h3 className={`${palette.text} font-bold text-xl`}>
//                       Apply to All Units
//                     </h3>
//                   </div>
//                 </div>
//                 <button
//                   className={`px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 flex items-center space-x-3 ${
//                     sendAllUnits ? palette.success : palette.primary
//                   }`}
//                   type="button"
//                   onClick={() => {
//                     console.log(
//                       "🎯 Apply to All Units button clicked. Current state:",
//                       sendAllUnits
//                     );
//                     setSendAllUnits(!sendAllUnits);
//                     console.log("🎯 New state will be:", !sendAllUnits);
//                   }}
//                 >
//                   {sendAllUnits ? (
//                     <>
//                       <svg
//                         className="w-5 h-5"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M5 13l4 4L19 7"
//                         />
//                       </svg>
//                       <span>✓ Enabled</span>
//                     </>
//                   ) : (
//                     <>
//                       <svg
//                         className="w-5 h-5"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0V9a1 1 0 011-1h4a1 1 0 011 1v12"
//                         />
//                       </svg>
//                       <span>Enable</span>
//                     </>
//                   )}
//                 </button>
//               </div> */}
//           {/* </div> */}

//           {/* Template Download */}
//           <div
//             className="flex-1 p-6 rounded-xl border-2 transition-all duration-300" style={{ borderColor: palette.border }}

//             //  ${palette.card} ${palette.border}`}
//           >
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-4">
//                 <div className={`p-3 rounded-full ${palette.info}`}>
//                   <svg
//                     className="w-6 h-6 text-white"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
//                     />
//                   </svg>
//                 </div>
//                 <div>
//                   <h3 className={`${palette.text} font-bold text-xl`}>
//                     Questions Template
//                   </h3>
//                 </div>
//               </div>
//               <button
//                 onClick={() => {
//                   const link = document.createElement("a");
//                   link.href =
//                     'data:text/plain;charset=utf-8,Question,Options,PhotoRequired\n"What is the quality?","Good(P)|Bad(N)|Average(P)",false\n"Check alignment","Aligned(P)|Not Aligned(N)",true';
//                   link.download = "questions_template.csv";
//                   link.click();
//                 }}
//                 className={`px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 flex items-center space-x-3 ${palette.info}`}
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
//                     d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
//                   />
//                 </svg>
//                 <span>Download</span>
//               </button>
//             </div>
//           </div>

//           {/* Skip Initializer */}
//           <div
//             className={`flex-1 p-6 rounded-xl border-2 transition-all duration-300 ${palette.card} ${palette.border}`}
//           >
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-4">
//                 <div className={`p-3 rounded-full ${palette.warning}`}>
//                   <svg
//                     className="w-6 h-6 text-white"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M13 10V3L4 14h7v7l9-11h-7z"
//                     />
//                   </svg>
//                 </div>
//                 <div>
//                   <h3 className={`${palette.text} font-bold text-xl`}>
//                     Skip Initializer
//                   </h3>
//                 </div>
//               </div>
//               <button
//                 className={`px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 flex items-center space-x-3 ${
//                   skipInitializer ? palette.success : palette.warning
//                 }`}
//                 type="button"
//                 onClick={() => setSkipInitializer(!skipInitializer)}
//               >
//                 {skipInitializer ? (
//                   <>
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
//                         d="M5 13l4 4L19 7"
//                       />
//                     </svg>
//                     <span>✓ Enabled</span>
//                   </>
//                 ) : (
//                   <>
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
//                         d="M13 10V3L4 14h7v7l9-11h-7z"
//                       />
//                     </svg>
//                     <span>Enable</span>
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Checklist Name Input */}
//         <div className="mb-8">
//           <label
//             className={`block font-bold text-xl mb-3 ${palette.text} flex items-center space-x-3`}
//           >
//             <svg
//               className="w-6 h-6"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
//               />
//             </svg>
//             <span>
//               Checklist Name <span className="text-red-500">*</span>
//             </span>
//           </label>
//           <input
//             type="text"
//             className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 ${palette.selectBg} ${palette.selectText} ${palette.border} font-medium text-lg`}
//             placeholder="Enter a descriptive name for your checklist"
//             value={checklistName}
//             onChange={(e) => setChecklistName(e.target.value)}
//             required
//           />
//         </div>

//         {/* Show the checklist name as heading if filled */}
//         {checklistName && (
//           <div
//             className={`mb-6 p-4 rounded-xl border-2 text-xl font-bold text-center ${palette.badge} ${palette.badgeText} border-current`}
//           >
//             📋 {checklistName}
//           </div>
//         )}

//         {/* Flat name display */}
//         {selectedFlatObj && (
//           <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-blue-300 text-lg font-bold text-blue-800 text-center">
//             🏠 Selected Flat: {selectedFlatObj.number}
//           </div>
//         )}

//         {/* Project & Hierarchy Form */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//           {/* Project Dropdown */}
//           <div>
//             <label
//               className={`block text-lg font-semibold mb-3 ${palette.text} flex items-center space-x-3`}
//             >
//               <svg
//                 className="w-5 h-5"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0V9a1 1 0 011-1h4a1 1 0 011 1v12"
//                 />
//               </svg>
//               <span>
//                 Project <span className="text-red-500">*</span>
//               </span>
//             </label>
//             <select
//               className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 ${palette.selectBg} ${palette.selectText} ${palette.border} font-medium`}
//               value={projectId}
//               onChange={(e) => {
//                 console.log("🎯 Project dropdown changed!");
//                 console.log("🎯 Old projectId:", projectId);
//                 console.log("🎯 New value:", e.target.value);
//                 console.log("🎯 Setting projectId to:", e.target.value);
//                 setProjectId(e.target.value);
//               }}
//             >
//               {(() => {
//                 console.log("🔍 DEBUG 2 - Project Options Render Check:");
//                 console.log("projectOptions type:", typeof projectOptions);
//                 console.log(
//                   "projectOptions isArray:",
//                   Array.isArray(projectOptions)
//                 );
//                 if (Array.isArray(projectOptions)) {
//                   projectOptions.forEach((proj, index) => {
//                     console.log(`Project ${index}:`, proj);
//                     console.log(
//                       `Project ${index} id:`,
//                       proj.id,
//                       typeof proj.id
//                     );
//                     console.log(
//                       `Project ${index} name:`,
//                       proj.name,
//                       typeof proj.name
//                     );
//                   });
//                 }
//                 return null;
//               })()}
//               <option value="">Select Project</option>
//               {(Array.isArray(projectOptions) ? projectOptions : []).map(
//                 (proj) => (
//                   <option key={proj.id} value={proj.id}>
//                     {proj.name}
//                   </option>
//                 )
//               )}
//             </select>
//           </div>

//           {/* Building Dropdown */}
//           {buildings.length > 0 && (
//             <div>
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
//                     d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
//                   />
//                 </svg>
//                 <span>Tower / Building</span>
//               </label>
//               <select
//                 className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 ${palette.selectBg} ${palette.selectText} ${palette.border} font-medium`}
//                 value={selectedBuilding}
//                 onChange={(e) => {
//                   setSelectedBuilding(e.target.value);
//                   console.log("Building selected:", e.target.value);
//                 }}
//               >
//                 {(() => {
//                   console.log("🔍 DEBUG 3 - Buildings Render Check:");
//                   console.log("buildings type:", typeof buildings);
//                   console.log("buildings isArray:", Array.isArray(buildings));
//                   if (Array.isArray(buildings)) {
//                     buildings.forEach((b, index) => {
//                       console.log(`Building ${index}:`, b);
//                       console.log(`Building ${index} id:`, b.id, typeof b.id);
//                       console.log(
//                         `Building ${index} name:`,
//                         b.name,
//                         typeof b.name
//                       );
//                     });
//                   }
//                   return null;
//                 })()}
//                 <option value="">Select Building</option>
//                 {(Array.isArray(buildings) ? buildings : []).map((b) => (
//                   <option key={b.id} value={b.id}>
//                     {b.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           )}

//           {/* Level Dropdown */}
//           {levels.length > 0 && (
//             <div>
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
//                     d="M7 16V4m0 0L3 8l4-4 4 4m-4-4v12"
//                   />
//                 </svg>
//                 <span>Level</span>
//               </label>
//               <select
//                 className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 ${palette.selectBg} ${palette.selectText} ${palette.border} font-medium`}
//                 value={selectedLevel}
//                 onChange={(e) => {
//                   setSelectedLevel(e.target.value);
//                   console.log("Level selected:", e.target.value);
//                 }}
//               >
//                 <option value="">Select Level</option>
//                 {levels.map((l) => (
//                   <option key={l.id} value={l.id}>
//                     {l.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           )}

//           {/* Zone Dropdown */}
//           {zones.length > 0 && (
//             <div>
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
//                     d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
//                   />
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
//                   />
//                 </svg>
//                 <span>Zone</span>
//               </label>
//               <select
//                 className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 ${palette.selectBg} ${palette.selectText} ${palette.border} font-medium`}
//                 value={selectedZone}
//                 onChange={(e) => {
//                   setSelectedZone(e.target.value);
//                   console.log("Zone selected:", e.target.value);
//                 }}
//               >
//                 <option value="">Select Zone</option>
//                 {zones.map((z) => (
//                   <option key={z.id} value={z.id}>
//                     {z.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           )}

//           {/* Flat Dropdown */}
//           {flats.length > 0 && (
//             <div>
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
//                     d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
//                   />
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M8 21v-4a2 2 0 012-2h4a2 2 0 012 2v4"
//                   />
//                 </svg>
//                 <span>Flat</span>
//               </label>
//               <select
//                 className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 ${palette.selectBg} ${palette.selectText} ${palette.border} font-medium`}
//                 value={selectedFlat}
//                 onChange={(e) => {
//                   setSelectedFlat(e.target.value);
//                   console.log("Flat selected:", e.target.value);
//                 }}
//               >
//                 <option value="">Select Flat</option>
//                 {flats.map((f) => (
//                   <option key={f.id} value={f.id}>
//                     {f.number}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           )}

//           {/* Rooms Selection Button */}
//           {rooms.length > 0 && (
//             <div>
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
//                     d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
//                   />
//                 </svg>
//                 <span>Rooms ({selectedRooms.length} selected)</span>
//               </label>
//               <button
//                 type="button"
//                 onClick={() => setShowRoomsModal(true)}
//                 className={`w-full p-4 border-2 rounded-xl transition-all duration-300 hover:scale-105 ${palette.primary} font-medium text-left flex items-center justify-between`}
//               >
//                 <span>
//                   {selectedRooms.length === 0
//                     ? "Select Rooms"
//                     : `${selectedRooms.length} room(s) selected`}
//                 </span>
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
//                     d="M19 9l-7 7-7-7"
//                   />
//                 </svg>
//               </button>
//             </div>
//           )}

//           {/* Purpose Dropdown */}
//           {/* {purposes > 0 && (
//               <div>
//                 <label
//                   className={`block text-lg font-semibold mb-3 ${palette.text} flex items-center space-x-3`}
//                 >
//                   <svg
//                     className="w-5 h-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
//                     />
//                   </svg>
//                   <span>
//                     Purpose <span className="text-red-500">*</span>
//                   </span>
//                 </label>
//                 <select
//                   className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 ${palette.selectBg} ${palette.selectText} ${palette.border} font-medium`}
//                   value={selectedPurpose}
//                   onChange={(e) => setSelectedPurpose(e.target.value)}
//                 >
//                   {(() => {
//                     console.log("🔍 DEBUG 4 - Purposes Render Check:");
//                     console.log("purposes type:", typeof purposes);
//                     console.log("purposes isArray:", Array.isArray(purposes));
//                     if (Array.isArray(purposes)) {
//                       purposes.forEach((p, index) => {
//                         console.log(`Purpose ${index}:`, p);
//                         console.log(`Purpose ${index} id:`, p.id, typeof p.id);
//                         console.log(
//                           `Purpose ${index} name:`,
//                           p.name,
//                           typeof p.name
//                         );
//                       });
//                     }
//                     return null;
//                   })()}
//                   <option value="">Select Purpose</option>
//                   {purposes.map((p) => {
//                     console.log("🎯 Rendering Purpose:", p);
//                     console.log("🎯 Purpose ID:", p.id);
//                     console.log("🎯 Purpose Name Object:", p.name);
//                     console.log(
//                       "🎯 Actual Purpose Name:",
//                       p.name?.purpose?.name
//                     );

//                     return (
//                       <option key={p.id} value={p.id}>
//                         {p.name?.purpose?.name || `Purpose ID: ${p.id}`}
//                       </option>
//                     );
//                   })}
//                 </select>
//               </div>
//             )} */}

//           {/* Purpose Dropdown - FIXED CONDITION */}
//           {purposes.length > 0 && ( // ✅ CHANGED FROM: {purposes > 0 &&
//             <div>
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
//                     d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
//                   />
//                 </svg>
//                 <span>
//                   Purpose <span className="text-red-500">*</span>
//                 </span>
//               </label>
//               <select
//                 className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 ${palette.selectBg} ${palette.selectText} ${palette.border} font-medium`}
//                 value={selectedPurpose}
//                 onChange={(e) => setSelectedPurpose(e.target.value)}
//               >
//                 <option value="">Select Purpose</option>
//                 {purposes.map((p) => {
//                   // ✅ ROBUST RENDERING LOGIC
//                   const purposeName =
//                     p.name?.purpose?.name || p.name?.name || `Purpose ${p.id}`;

//                   console.log("🎯 Rendering Purpose:", p);
//                   console.log("🎯 Purpose ID:", p.id);
//                   console.log("🎯 Resolved Purpose Name:", purposeName);

//                   return (
//                     <option key={p.id} value={p.id}>
//                       {purposeName}
//                     </option>
//                   );
//                 })}
//               </select>
//             </div>
//           )}

//           {/* Phase Dropdown */}
//           {phases.length > 0 && (
//             <div>
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
//                     d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
//                   />
//                 </svg>
//                 <span>Phase</span>
//               </label>
//               <select
//                 className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 ${palette.selectBg} ${palette.selectText} ${palette.border} font-medium`}
//                 value={selectedPhase}
//                 onChange={(e) => setSelectedPhase(e.target.value)}
//               >
//                 <option value="">Select Phase</option>
//                 {phases.map((ph) => (
//                   <option key={ph.id} value={ph.id}>
//                     {ph.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           )}

//           {/* Stage Dropdown */}
//           {stages.length > 0 && (
//             <div>
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
//                     d="M13 10V3L4 14h7v7l9-11h-7z"
//                   />
//                 </svg>
//                 <span>Stage</span>
//               </label>
//               <select
//                 className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 ${palette.selectBg} ${palette.selectText} ${palette.border} font-medium`}
//                 value={selectedStage}
//                 onChange={(e) => setSelectedStage(e.target.value)}
//               >
//                 <option value="">Select Stage</option>
//                 {stages.map((st) => (
//                   <option key={st.id} value={st.id}>
//                     {st.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           )}

//           {/* Category Level 1 */}
//           <div>
//             <label
//               className={`block text-lg font-semibold mb-3 ${palette.text} flex items-center space-x-3`}
//             >
//               <svg
//                 className="w-5 h-5"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
//                 />
//               </svg>
//               <span>
//                 Category <span className="text-red-500">*</span>
//               </span>
//             </label>
//             <select
//               className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 ${palette.selectBg} ${palette.selectText} ${palette.border} font-medium`}
//               value={category}
//               onChange={handleCategoryChange}
//             >
//               {(() => {
//                 console.log("🔍 DEBUG 5 - Category Options Render Check:");
//                 const levelOptions = getLevelOptions(1);
//                 console.log("Category levelOptions:", levelOptions);
//                 console.log("Category levelOptions type:", typeof levelOptions);
//                 console.log(
//                   "Category levelOptions isArray:",
//                   Array.isArray(levelOptions)
//                 );
//                 if (Array.isArray(levelOptions)) {
//                   levelOptions.forEach((opt, index) => {
//                     console.log(`Category ${index}:`, opt);
//                     console.log(`Category ${index} id:`, opt.id, typeof opt.id);
//                     console.log(
//                       `Category ${index} name:`,
//                       opt.name,
//                       typeof opt.name
//                     );
//                   });
//                 }
//                 return null;
//               })()}
//               <option value="">Select Category</option>
//               {getLevelOptions(1).map((opt) => (
//                 <option key={opt.id} value={opt.id}>
//                   {opt.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Category Level 2 */}
//           {getLevelOptions(2).length > 0 && (
//             <div>
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
//                     d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
//                   />
//                 </svg>
//                 <span>Category Level 4</span>
//               </label>
//               <select
//                 className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 ${palette.selectBg} ${palette.selectText} ${palette.border} font-medium`}
//                 value={cat3}
//                 onChange={handleCat3Change}
//               >
//                 <option value="">Select Level 4</option>
//                 {getLevelOptions(4).map((opt) => (
//                   <option key={opt.id} value={opt.id}>
//                     {opt.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           )}

//           {/* Category Level 5 */}
//           {getLevelOptions(5).length > 0 && (
//             <div>
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
//                     d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
//                   />
//                 </svg>
//                 <span>Category Level 5</span>
//               </label>
//               <select
//                 className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 ${palette.selectBg} ${palette.selectText} ${palette.border} font-medium`}
//                 value={cat4}
//                 onChange={handleCat4Change}
//               >
//                 <option value="">Select Level 5</option>
//                 {getLevelOptions(5).map((opt) => (
//                   <option key={opt.id} value={opt.id}>
//                     {opt.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           )}

//           {/* Category Level 6 */}
//           {getLevelOptions(6).length > 0 && (
//             <div>
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
//                     d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
//                   />
//                 </svg>
//                 <span>Category Level 6</span>
//               </label>
//               <select
//                 className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 ${palette.selectBg} ${palette.selectText} ${palette.border} font-medium`}
//                 value={cat5}
//                 onChange={handleCat5Change}
//               >
//                 <option value="">Select Level 6</option>
//                 {getLevelOptions(6).map((opt) => (
//                   <option key={opt.id} value={opt.id}>
//                     {opt.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           )}
//         </div>

//         {/* Questions Section */}
//         <div className="mb-8">
//           <div className="mb-6">
//             <h2
//               className={`text-2xl font-bold mb-4 ${palette.text} flex items-center space-x-3`}
//             >
//               <div className={`p-3 rounded-xl ${palette.primary}`}>
//                 <svg
//                   className="w-6 h-6 text-white"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                   />
//                 </svg>
//               </div>
//               <span>Questions & Options</span>
//             </h2>
//           </div>

//           {/* Add Questions Controls */}
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
//             <div className="lg:col-span-1">
//               <label
//                 className={`block text-lg font-semibold mb-3 ${palette.text}`}
//               >
//                 Add Questions
//               </label>
//               <div className="flex items-center space-x-3">
//                 <input
//                   type="number"
//                   className={`w-full p-3 border-2 rounded-xl transition-all duration-300 focus:ring-4 ${palette.selectBg} ${palette.selectText} ${palette.border} font-medium`}
//                   min={1}
//                   value={numOfQuestions}
//                   onChange={(e) => setNumOfQuestions(Number(e.target.value))}
//                 />
//                 <button
//                   onClick={handleAddMoreQuestions}
//                   className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 ${palette.success} flex items-center space-x-2`}
//                 >
//                   <MdAdd size={20} />
//                   <span>Add</span>
//                 </button>
//               </div>
//             </div>

//             {/* Bulk Upload */}
//             <div className="lg:col-span-2">
//               <label
//                 className={`block text-lg font-semibold mb-3 ${palette.text}`}
//               >
//                 Bulk Upload Questions
//               </label>
//               <input
//                 type="file"
//                 accept=".xlsx,.xls,.csv"
//                 onChange={handleBulkUpload}
//                 className={`w-full p-3 border-2 rounded-xl transition-all duration-300 focus:ring-4 ${palette.selectBg} ${palette.selectText} ${palette.border} font-medium`}
//               />
//             </div>
//           </div>

//           {/* Questions List */}
//           <div className="space-y-6">
//             {questions.map((q, qIdx) => (
//               <div
//                 key={qIdx}
//                 className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] ${palette.card} ${palette.border} ${palette.shadow}`}
//                 style={{
//                   borderLeft: `6px solid ${
//                     theme === "dark" ? "#fbbf24" : "#f97316"
//                   }`,
//                 }}
//               >
//                 {/* DEBUG CHECKPOINT 6 - MOVED INSIDE THE DIV */}
//                 {(() => {
//                   console.log(
//                     "🔍 DEBUG 6 - Question Render Check for index:",
//                     qIdx
//                   );
//                   console.log(`Question ${qIdx}:`, q);
//                   console.log(
//                     `Question ${qIdx} question:`,
//                     q.question,
//                     typeof q.question
//                   );
//                   console.log(`Question ${qIdx} options:`, q.options);
//                   console.log(
//                     `Question ${qIdx} options isArray:`,
//                     Array.isArray(q.options)
//                   );
//                   console.log(`Question ${qIdx} id:`, q.id, typeof q.id);
//                   console.log(
//                     `Question ${qIdx} photo_required:`,
//                     q.photo_required,
//                     typeof q.photo_required
//                   );

//                   if (q.options && Array.isArray(q.options)) {
//                     q.options.forEach((opt, optIdx) => {
//                       console.log(`Question ${qIdx} Option ${optIdx}:`, opt);
//                       console.log(
//                         `Question ${qIdx} Option ${optIdx} id:`,
//                         opt.id,
//                         typeof opt.id
//                       );
//                       console.log(
//                         `Question ${qIdx} Option ${optIdx} value:`,
//                         opt.value,
//                         typeof opt.value
//                       );
//                       console.log(
//                         `Question ${qIdx} Option ${optIdx} submission:`,
//                         opt.submission,
//                         typeof opt.submission
//                       );
//                     });
//                   }
//                   return null;
//                 })()}
//                 <div className="flex items-center gap-6 mb-4">
//                   <div
//                     className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${palette.badge} ${palette.badgeText}`}
//                   >
//                     {qIdx + 1}
//                   </div>
//                   <input
//                     type="text"
//                     placeholder={`Enter your question ${qIdx + 1}`}
//                     className={`flex-1 p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 ${palette.selectBg} ${palette.selectText} ${palette.border} font-medium text-lg`}
//                     value={q.question}
//                     onChange={(e) =>
//                       setQuestions((prev) => {
//                         const updated = [...prev];
//                         updated[qIdx] = {
//                           ...updated[qIdx],
//                           question: e.target.value,
//                         };
//                         return updated;
//                       })
//                     }
//                   />

//                   {/* Photo Required Toggle */}
//                   <label className="flex items-center space-x-3 cursor-pointer">
//                     <input
//                       type="checkbox"
//                       checked={!!q.photo_required}
//                       onChange={(e) =>
//                         setQuestions((prev) => {
//                           const updated = [...prev];
//                           updated[qIdx] = {
//                             ...updated[qIdx],
//                             photo_required: e.target.checked,
//                           };
//                           return updated;
//                         })
//                       }
//                       className="w-5 h-5 text-purple-600 bg-white border-2 border-purple-300 rounded focus:ring-purple-500 focus:ring-2"
//                     />
//                     <div className="flex items-center space-x-2">
//                       <svg
//                         className="w-5 h-5 text-purple-600"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
//                         />
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
//                         />
//                       </svg>
//                       <span className="font-semibold text-purple-800">
//                         Photo Required
//                       </span>
//                     </div>
//                   </label>

//                   <button
//                     className={`p-3 rounded-xl transition-all duration-200 hover:scale-110 ${palette.danger}`}
//                     onClick={() => {
//                       if (questions.length === 1) {
//                         showToast("At least one question is required", "error");
//                         return;
//                       }
//                       handleRemoveQuestion(qIdx, q.id); // ✅ Pass question ID
//                     }}
//                     title="Remove Question"
//                   >
//                     <MdDelete size={20} />
//                   </button>
//                 </div>

//                 {/* Options */}
//                 <div className="ml-18 space-y-3">
//                   <div className="flex flex-wrap gap-3">
//                     {(q.options || []).map((option, optIdx) => (
//                       <div
//                         key={option.id || optIdx}
//                         className="flex items-center gap-3 p-3 border-2 border-gray-300 rounded-xl bg-white"
//                       >
//                         <input
//                           type="text"
//                           placeholder="Add Option"
//                           className="flex-1 outline-none border-none font-medium"
//                           value={option.value || ""}
//                           onChange={(e) =>
//                             handleQuestionOptionChange(
//                               qIdx,
//                               "value",
//                               e.target.value,
//                               optIdx
//                             )
//                           }
//                         />
//                         <select
//                           value={option.submission || "P"}
//                           onChange={(e) =>
//                             handleQuestionOptionChange(
//                               qIdx,
//                               "submission",
//                               e.target.value,
//                               optIdx
//                             )
//                           }
//                           className={`px-3 py-2 rounded-lg font-bold text-white border-none ${
//                             option.submission === "P"
//                               ? "bg-green-500"
//                               : "bg-red-500"
//                           }`}
//                         >
//                           <option value="P">P</option>
//                           <option value="N">N</option>
//                         </select>
//                         <button
//                           className="text-red-600 hover:text-red-800 p-1"
//                           onClick={() =>
//                             handleQuestionOptionRemove(qIdx, optIdx, option.id)
//                           }
//                           title="Remove Option"
//                         >
//                           <MdDelete size={18} />
//                         </button>
//                       </div>
//                     ))}
//                     <button
//                       className={`px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 ${palette.primary} flex items-center space-x-2`}
//                       onClick={() => handleQuestionOptionAdd(qIdx)}
//                       type="button"
//                     >
//                       <MdAdd size={18} />
//                       <span>Add Option</span>
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Create Button */}
//         {/* Create Button */}
//         <div className="flex justify-center">
//           <button
//             onClick={handleCreateChecklist}
//             disabled={isSubmitting}
//             className={`px-12 py-4 rounded-xl font-bold text-xl transition-all duration-300 flex items-center space-x-4 shadow-lg ${
//               palette.primary
//             } ${
//               isSubmitting
//                 ? "opacity-60 cursor-not-allowed pointer-events-none"
//                 : ""
//             }`}
//             style={{
//               pointerEvents: isSubmitting ? "none" : "auto",
//             }}
//           >
//             <svg
//               className="w-6 h-6"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
//               />
//             </svg>
//             <span>
//               {isSubmitting
//                 ? isEdit
//                   ? "Updating..."
//                   : "Creating..."
//                 : isEdit
//                 ? "Update Checklist"
//                 : "Create Checklist"}
//             </span>
//           </button>
//         </div>

//         {/* Bulk Creation Overlay Notification */}
//         {/* {sendAllUnits && (
//             <div className="fixed top-4 right-4 z-50 animate-pulse">
//               <div
//                 className={`p-4 rounded-xl border-2 transition-all duration-300 ${
//                   theme === "dark"
//                     ? "bg-emerald-900/90 border-emerald-500/50 text-emerald-200"
//                     : "bg-emerald-50/90 border-emerald-300 text-emerald-800"
//                 } backdrop-blur-sm shadow-lg`}
//               >
//                 <div className="flex items-center space-x-3">
//                   <div
//                     className={`p-2 rounded-full ${
//                       palette.success.split(" ")[0]
//                     } ${palette.success.split(" ")[1]}`}
//                   >
//                     <svg
//                       className="w-4 h-4 text-white"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                       />
//                     </svg>
//                   </div>
//                   <div>
//                     <p className="font-semibold">Bulk Creation Mode Enabled</p>
//                     <p className="text-sm opacity-80">
//                       Will create for all units at selected level
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )} */}
//         {/* Rooms Selection Modal */}
//         {showRoomsModal && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//             <div
//               className={`w-full max-w-2xl rounded-2xl ${palette.card} ${palette.shadow} border ${palette.border} max-h-[80vh] overflow-hidden`}
//             >
//               {/* Modal Header */}
//               <div
//                 className={`p-6 border-b ${palette.border} flex items-center justify-between`}
//               >
//                 <div className="flex items-center space-x-3">
//                   <div className={`p-3 rounded-xl ${palette.primary}`}>
//                     <svg
//                       className="w-6 h-6 text-white"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
//                       />
//                     </svg>
//                   </div>
//                   <div>
//                     <h3 className={`text-2xl font-bold ${palette.text}`}>
//                       Select Rooms
//                     </h3>
//                     <p className={`${palette.textSecondary}`}>
//                       Choose multiple rooms for this checklist
//                     </p>
//                   </div>
//                 </div>
//                 <button
//                   onClick={() => setShowRoomsModal(false)}
//                   className={`p-2 rounded-xl transition-all duration-200 hover:scale-110 ${palette.danger}`}
//                 >
//                   <svg
//                     className="w-6 h-6"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M6 18L18 6M6 6l12 12"
//                     />
//                   </svg>
//                 </button>
//               </div>

//               {/* Modal Content */}
//               <div className="p-6 overflow-y-auto max-h-96">
//                 {/* Action Buttons */}
//                 <div className="flex gap-3 mb-6">
//                   <button
//                     onClick={handleSelectAllRooms}
//                     className={`px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105 ${palette.success} flex items-center space-x-2`}
//                   >
//                     <svg
//                       className="w-4 h-4"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M5 13l4 4L19 7"
//                       />
//                     </svg>
//                     <span>Select All</span>
//                   </button>
//                   <button
//                     onClick={handleClearAllRooms}
//                     className={`px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105 ${palette.secondary} flex items-center space-x-2`}
//                   >
//                     <svg
//                       className="w-4 h-4"
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
//                     <span>Clear All</span>
//                   </button>
//                 </div>

//                 {/* Rooms Grid */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   {rooms.map((room) => (
//                     <label
//                       key={room.id}
//                       className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
//                         selectedRooms.includes(room.id)
//                           ? `${palette.success} border-current`
//                           : `${palette.card} ${palette.border} hover:border-current`
//                       }`}
//                     >
//                       <div className="flex items-center space-x-3">
//                         <input
//                           type="checkbox"
//                           checked={selectedRooms.includes(room.id)}
//                           onChange={(e) =>
//                             handleRoomSelection(room.id, e.target.checked)
//                           }
//                           className="w-5 h-5 text-emerald-600 bg-white border-2 border-emerald-300 rounded focus:ring-emerald-500 focus:ring-2"
//                         />
//                         <div className="flex-1">
//                           <span className={`font-semibold ${palette.text}`}>
//                             {room.rooms}
//                           </span>
//                           <p className={`text-sm ${palette.textSecondary}`}>
//                             Room ID: {room.id}
//                           </p>
//                         </div>
//                         {selectedRooms.includes(room.id) && (
//                           <svg
//                             className="w-5 h-5 text-emerald-600"
//                             fill="none"
//                             stroke="currentColor"
//                             viewBox="0 0 24 24"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M5 13l4 4L19 7"
//                             />
//                           </svg>
//                         )}
//                       </div>
//                       {(() => {
//                         console.log("🔍 DEBUG 7 - Room Render Check:");
//                         console.log(`Room:`, room);
//                         console.log(`Room id:`, room.id, typeof room.id);
//                         console.log(
//                           `Room rooms:`,
//                           room.rooms,
//                           typeof room.rooms
//                         );
//                         return null;
//                       })()}
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               <div
//                 className={`p-6 border-t ${palette.border} flex justify-between items-center`}
//               >
//                 <span className={`${palette.textSecondary}`}>
//                   {selectedRooms.length} of {rooms.length} rooms selected
//                 </span>
//                 <button
//                   onClick={() => setShowRoomsModal(false)}
//                   className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 ${palette.primary} flex items-center space-x-2`}
//                 >
//                   <svg
//                     className="w-5 h-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M5 13l4 4L19 7"
//                     />
//                   </svg>
//                   <span>Done</span>
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   </div>
// );
// };

// export default ChecklistForm;


// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import * as XLSX from "xlsx";
// import LocationHierarchySelector from "./LocationHierarchySelector";
// import { showToast } from "../../utils/toast";
// import {
//   createChecklist,
//   updateChecklist,
//   createChecklistQuestion,
//   createChecklistItemOPTIONSS,
//   getChecklistById,
// } from "../../api"; // Adjust these imports to your API setup!

// const ChecklistForm = ({
//   projectId,
//   checklistId,        // if editing, pass checklistId, else undefined
//   setShowForm,
//   onChecklistSaved,    // callback(checklistData) on success
// }) => {
//   // Hierarchy data (buildings, levels, flats, rooms, etc.)
//   const [hierarchyData, setHierarchyData] = useState(null);
//   const [selectedLocation, setSelectedLocation] = useState({
//     buildingId: "",
//     levelId: "",
//     zoneId: "",
//     flatId: "",
//     roomIds: [],
//   });

//   // Checklist fields
//   const [name, setName] = useState("");
//   const [questions, setQuestions] = useState([
//     { question: "", options: [{ value: "", submission: "P" }], photo_required: false }
//   ]);
//   const [numOfQuestions, setNumOfQuestions] = useState(1);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // Load hierarchy from nested API
//   useEffect(() => {
//     if (!projectId) return;
//     axios
//       .get(`/api/projects/${projectId}/nested/`, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
//         },
//       })
//       .then((res) => setHierarchyData(res.data))
//       .catch(() => {
//         setHierarchyData(null);
//         showToast("Failed to load hierarchy", "error");
//       });
//   }, [projectId]);

//   // If editing: fetch checklist details and populate form
//   useEffect(() => {
//     if (checklistId) {
//       getChecklistById(checklistId)
//         .then((res) => {
//           const data = res.data;
//           setName(data.name || "");
//           setSelectedLocation({
//             buildingId: data.building_id || "",
//             levelId: data.level_id || "",
//             zoneId: data.zone_id || "",
//             flatId: data.flat_id || "",
//             roomIds: data.rooms || [],
//           });
//           setQuestions(
//             (data.items || []).map((item) => ({
//               question: item.title,
//               options: (item.options || []).map((opt) => ({
//                 value: opt.name,
//                 submission: opt.choice,
//               })),
//               photo_required: item.photo_required,
//             }))
//           );
//         })
//         .catch(() => showToast("Failed to load checklist details", "error"));
//     }
//   }, [checklistId]);

//   // CSV/Excel Bulk Upload handler
//   const handleBulkUpload = (event) => {
//     const file = event.target.files[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       try {
//         const data = new Uint8Array(e.target.result);
//         const workbook = XLSX.read(data, { type: "array" });
//         const sheetName = workbook.SheetNames[0];
//         const worksheet = workbook.Sheets[sheetName];
//         const jsonData = XLSX.utils.sheet_to_json(worksheet);

//         const bulkQuestions = [];
//         jsonData.forEach((row) => {
//           const question = row["Question"] || row["question"] || "";
//           const optionsString = row["Options"] || row["options"] || "";
//           const photoRequired =
//             row["PhotoRequired"] || row["photo_required"] || false;

//           const options = [];
//           if (optionsString) {
//             const optionPairs = optionsString.split("|");
//             optionPairs.forEach((pair) => {
//               const match = pair.match(/^(.+)\(([PN])\)$/);
//               if (match) {
//                 options.push({
//                   value: match[1].trim(),
//                   submission: match[2],
//                 });
//               }
//             });
//           }
//           if (question.trim()) {
//             bulkQuestions.push({
//               question: question.trim(),
//               options: options,
//               photo_required:
//                 photoRequired === true ||
//                 photoRequired === "true" ||
//                 photoRequired === "True",
//             });
//           }
//         });
//         if (bulkQuestions.length > 0) {
//           setQuestions([...questions, ...bulkQuestions]);
//           showToast(
//             `${bulkQuestions.length} questions uploaded successfully!`,
//             "success"
//           );
//         } else {
//           showToast("No valid questions found in the file", "error");
//         }
//         event.target.value = "";
//       } catch (error) {
//         showToast("Error reading file. Please check the format.", "error");
//       }
//     };
//     reader.readAsArrayBuffer(file);
//   };

//   // Add/remove questions and options
//   const handleAddMoreQuestions = () => {
//     const toAdd = [];
//     for (let i = 0; i < numOfQuestions; i++) {
//       toAdd.push({
//         question: "",
//         options: [{ value: "", submission: "P" }],
//         photo_required: false,
//       });
//     }
//     setQuestions([...questions, ...toAdd]);
//   };
//   const handleQuestionOptionAdd = (qIdx) => {
//     setQuestions((prev) => {
//       const updated = [...prev];
//       updated[qIdx].options.push({ value: "", submission: "P" });
//       return updated;
//     });
//   };
//   const handleQuestionOptionChange = (qIdx, key, value, optIdx) => {
//     setQuestions((prev) => {
//       const updated = [...prev];
//       updated[qIdx].options[optIdx][key] = value;
//       return updated;
//     });
//   };
//   const handleQuestionOptionRemove = (qIdx, optIdx) => {
//     setQuestions((prev) => {
//       const updated = [...prev];
//       updated[qIdx].options = updated[qIdx].options.filter((_, idx) => idx !== optIdx);
//       return updated;
//     });
//   };

//   // Save checklist (create or update)
//   const handleSaveChecklist = async () => {
//     if (isSubmitting) return;
//     if (!name.trim()) return showToast("Checklist name required!");
//     if (!selectedLocation.buildingId || !selectedLocation.flatId)
//       return showToast("Please select full location (building and flat)");

//     setIsSubmitting(true);

//     const checklistPayload = {
//       name,
//       project_id: Number(projectId),
//       building_id: Number(selectedLocation.buildingId),
//       level_id: Number(selectedLocation.levelId) || null,
//       zone_id: Number(selectedLocation.zoneId) || null,
//       flat_id: Number(selectedLocation.flatId),
//       rooms: selectedLocation.roomIds,
//     };

//     try {
//       let checklistRes, checklistId;
//       if (checklistId) {
//         checklistRes = await updateChecklist(checklistId, checklistPayload);
//         checklistId = checklistId;
//       } else {
//         checklistRes = await createChecklist(checklistPayload);
//         checklistId = checklistRes.data?.id;
//       }

//       // Now create/update questions and options
//       for (let i = 0; i < questions.length; i++) {
//         const q = questions[i];
//         const itemRes = await createChecklistQuestion({
//           checklist: checklistId,
//           title: q.question,
//           photo_required: !!q.photo_required,
//           is_done: false,
//         });
//         const checklistItemId = itemRes.data?.id;
//         if (checklistItemId && q.options?.length) {
//           for (let option of q.options) {
//             if (option.value && option.value.trim() !== "") {
//               await createChecklistItemOPTIONSS({
//                 checklist_item: checklistItemId,
//                 name: option.value,
//                 choice: option.submission,
//               });
//             }
//           }
//         }
//       }
//       showToast(
//         checklistId ? "Checklist updated successfully!" : "Checklist created successfully!",
//         "success"
//       );
//       if (onChecklistSaved) onChecklistSaved(checklistId);
//       setShowForm(false);
//     } catch (err) {
//       showToast("Checklist save failed", "error");
//     }
//     setIsSubmitting(false);
//   };

//   return (
//     <div className="p-8 max-w-4xl mx-auto">
//       <h2 className="text-2xl font-bold mb-4">{checklistId ? "Edit" : "Create"} Checklist</h2>

//       {/* Location Selector */}
//       <div className="mb-4">
//         <LocationHierarchySelector
//           hierarchyData={hierarchyData}
//           selected={selectedLocation}
//           onChange={setSelectedLocation}
//         />
//       </div>

//       {/* Checklist Name */}
//       <div className="mb-4">
//         <label className="block font-semibold mb-1">
//           Checklist Name <span className="text-red-500">*</span>
//         </label>
//         <input
//           className="w-full border p-3 rounded"
//           placeholder="Enter checklist name"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           required
//         />
//       </div>

//       {/* Questions Section & Bulk Upload */}
//       <div className="flex items-end gap-6 mb-6">
//         <div>
//           <label className="font-semibold block mb-1">Add Questions</label>
//           <div className="flex items-center gap-2">
//             <input
//               type="number"
//               min={1}
//               value={numOfQuestions}
//               onChange={(e) => setNumOfQuestions(Number(e.target.value))}
//               className="w-20 border p-2 rounded"
//             />
//             <button
//               type="button"
//               className="px-4 py-2 bg-blue-600 text-white rounded"
//               onClick={handleAddMoreQuestions}
//             >
//               Add
//             </button>
//           </div>
//         </div>
//         <div>
//           <label className="font-semibold block mb-1">Bulk Upload (Excel/CSV)</label>
//           <input
//             type="file"
//             accept=".xlsx,.xls,.csv"
//             onChange={handleBulkUpload}
//             className="border p-2 rounded"
//           />
//         </div>
//       </div>

//       {/* Questions List */}
//       <div className="space-y-6 mb-8">
//         {questions.map((q, qIdx) => (
//           <div key={qIdx} className="p-4 border rounded-xl">
//             <div className="flex items-center gap-4 mb-3">
//               <div className="text-lg font-bold">{qIdx + 1}</div>
//               <input
//                 type="text"
//                 className="flex-1 border p-2 rounded"
//                 placeholder={`Enter question ${qIdx + 1}`}
//                 value={q.question}
//                 onChange={(e) =>
//                   setQuestions((prev) => {
//                     const updated = [...prev];
//                     updated[qIdx].question = e.target.value;
//                     return updated;
//                   })
//                 }
//               />
//               <label className="flex items-center gap-1 text-sm font-medium ml-2">
//                 <input
//                   type="checkbox"
//                   checked={!!q.photo_required}
//                   onChange={(e) =>
//                     setQuestions((prev) => {
//                       const updated = [...prev];
//                       updated[qIdx].photo_required = e.target.checked;
//                       return updated;
//                     })
//                   }
//                 />
//                 Photo Required
//               </label>
//             </div>
//             <div className="flex flex-wrap gap-2 mb-2">
//               {(q.options || []).map((option, optIdx) => (
//                 <div
//                   key={optIdx}
//                   className="flex items-center gap-1 bg-gray-50 border rounded p-2"
//                 >
//                   <input
//                     type="text"
//                     className="border rounded px-2 py-1"
//                     placeholder="Option"
//                     value={option.value}
//                     onChange={(e) =>
//                       handleQuestionOptionChange(qIdx, "value", e.target.value, optIdx)
//                     }
//                   />
//                   <select
//                     className="border rounded px-2 py-1"
//                     value={option.submission}
//                     onChange={(e) =>
//                       handleQuestionOptionChange(qIdx, "submission", e.target.value, optIdx)
//                     }
//                   >
//                     <option value="P">P</option>
//                     <option value="N">N</option>
//                   </select>
//                   <button
//                     type="button"
//                     className="text-red-600"
//                     onClick={() => handleQuestionOptionRemove(qIdx, optIdx)}
//                   >
//                     ×
//                   </button>
//                 </div>
//               ))}
//               <button
//                 type="button"
//                 className="px-2 py-1 border rounded bg-blue-100"
//                 onClick={() => handleQuestionOptionAdd(qIdx)}
//               >
//                 + Add Option
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Save Button */}
//       <div className="flex justify-end">
//         <button
//           type="button"
//           className={`px-8 py-3 rounded font-bold ${
//             isSubmitting ? "bg-gray-400" : "bg-green-600 text-white"
//           }`}
//           onClick={handleSaveChecklist}
//           disabled={isSubmitting}
//         >
//           {isSubmitting
//             ? checklistId
//               ? "Updating..."
//               : "Creating..."
//             : checklistId
//             ? "Update Checklist"
//             : "Create Checklist"}
//         </button>
//       </div>
//     </div>
//   );
// };
// export default ChecklistForm;
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import React, { useState, useEffect } from "react";
import { MdDelete, MdAdd } from "react-icons/md";
import {
  createChecklist,
  allinfobuildingtoflat,
  getPurposeByProjectId,
  getPhaseByPurposeId,
  GetstagebyPhaseid,
  getCategoryTreeByProject,
  createChecklistQuestion,
  createChecklistItemOPTIONSS,
  getChecklistById,
  updateChecklistById,
  deleteChecklistItem,
  deleteChecklistItemOption,
} from "../../api";
import { showToast } from "../../utils/toast";
import * as XLSX from "xlsx";
import axios from "axios";
import SideBarSetup from "../../components/SideBarSetup";
import { useTheme } from "../../ThemeContext";
import { checklistInstance, projectInstance } from '../../api/axiosInstance';
import { useSidebar } from "../../components/SidebarContext";

const ChecklistForm = ({
  setShowForm,
  checklist,
  projectOptions = [],
  onChecklistCreated,
}) => {
  const { theme } = useTheme();
  const { sidebarOpen } = useSidebar();

  // Color palette - exact same as main component
  const palette =
    theme === "dark"
      ? {
          selectText: "text-yellow-300",
          selectBg: "bg-[#191919]",
          bg: "#0a0a0f",
          card: "bg-gradient-to-br from-[#191919] to-[#181820]",
          text: "text-yellow-100",
          textSecondary: "text-yellow-200/70",
          border: "border-yellow-600/30",
          tableHead: "bg-[#191919] text-yellow-300 border-yellow-600/30",
          tableRow: "hover:bg-yellow-900/5 border-yellow-600/10",
          shadow: "shadow-2xl shadow-yellow-900/20",
          primary:
            "bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold hover:from-yellow-600 hover:to-yellow-700",
          secondary:
            "bg-gradient-to-r from-yellow-900 to-yellow-800 text-yellow-100 hover:from-yellow-800 hover:to-yellow-700",
          badge:
            "bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500",
          badgeText: "text-yellow-900 font-bold",
          success:
            "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800",
          warning:
            "bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:from-amber-700 hover:to-amber-800",
          danger:
            "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800",
          info: "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800",
        }
      : {
          selectText: "text-gray-900",
          selectBg: "bg-white",
          bg: "#faf9f7",
          card: "bg-gradient-to-br from-white to-orange-50/30",
          text: "text-orange-900",
          textSecondary: "text-orange-700/70",
          border: "border-orange-300/60",
          tableHead: "bg-orange-50 text-orange-700 border-orange-300/60",
          tableRow: "hover:bg-orange-50 border-orange-100/30",
          shadow: "shadow-xl shadow-orange-200/30",
          primary:
            "bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold hover:from-orange-600 hover:to-orange-700",
          secondary:
            "bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600",
          badge:
            "bg-gradient-to-r from-orange-300 via-orange-400 to-orange-500",
          badgeText: "text-orange-900 font-bold",
          success:
            "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700",
          warning:
            "bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700",
          danger:
            "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700",
          info: "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700",
        };

  const SIDEBAR_WIDTH = 0;

  // State variables




  
  const [projectId, setProjectId] = useState("");
  const [buildings, setBuildings] = useState([]);
  const [levels, setLevels] = useState([]);
  const [zones, setZones] = useState([]);
  const [subzones, setSubzones] = useState([]); // NEW: Added subzones state
  const [flats, setFlats] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedSubzone, setSelectedSubzone] = useState(""); // NEW: Added subzone selection
  const [selectedFlat, setSelectedFlat] = useState("");
  const [userData, setUserData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const contentMarginLeft = sidebarOpen ? SIDEBAR_WIDTH : 0;

  const [purposes, setPurposes] = useState([]);
  const [phases, setPhases] = useState([]);
  const [stages, setStages] = useState([]);
  const [selectedPurpose, setSelectedPurpose] = useState("");
  const [selectedPhase, setSelectedPhase] = useState("");
  const [selectedStage, setSelectedStage] = useState("");
  const [skipInitializer, setSkipInitializer] = useState(false);

  const [categoryTree, setCategoryTree] = useState([]);
  const [category, setCategory] = useState("");
  const [cat1, setCat1] = useState("");
  const [cat2, setCat2] = useState("");
  const [cat3, setCat3] = useState("");
  const [cat4, setCat4] = useState("");
  const [cat5, setCat5] = useState("");
  const [cat6, setCat6] = useState("");

  const [options, setOptions] = useState([{ value: "", submission: "P" }]);
  const [questions, setQuestions] = useState([
    { question: "", options: [], photo_required: false },
  ]);

  const [numOfQuestions, setNumOfQuestions] = useState(1);
  const isEdit = !!checklist;
  const [checklistName, setChecklistName] = useState("");

  const selectedFlatObj = flats.find(
    (f) => String(f.id) === String(selectedFlat)
  );

  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [showRoomsModal, setShowRoomsModal] = useState(false);

  // NEW: Function to fetch nested project data
  const fetchNestedProjectData = async (projectId) => {
    try {
      console.log("🏗️ Fetching nested project data for projectId:", projectId);
      
      const response = await axios.get(
        `https://konstruct.world/projects/projects/${projectId}/nested/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("🏗️ Nested API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching nested project data:", error);
      throw error;
    }
  };

  // NEW: Function to process nested data into the existing format
  const processNestedData = (nestedData) => {
    console.log("🔄 Processing nested data:", nestedData);
    
    // Extract buildings from nested structure
    const processedBuildings = (nestedData.buildings || []).map(building => ({
      id: building.id,
      name: building.name,
      levels: building.levels || []
    }));

    console.log("🏢 Processed buildings:", processedBuildings);
    return processedBuildings;
  };

  // Remove a question (ChecklistItem)
  const handleRemoveQuestion = async (qIdx, questionId) => {
    console.log("🗑️ Attempting to delete question:", { qIdx, questionId });

    if (questionId) {
      try {
        if (selectedRooms.length > 0) {
          const confirmDelete = window.confirm(
            "This will delete the question from ALL room checklists. Continue?"
          );
          if (!confirmDelete) return;
        }

        console.log(
          `🗑️ DELETE URL: https://konstruct.world/checklists/items/${questionId}/`
        );
        console.log("Rooms data:", rooms);


        await checklistInstance.delete(
          `/items/${questionId}/`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log("✅ Question deleted successfully");
        showToast("Question deleted successfully!");
      } catch (err) {
        console.error("❌ Delete question error:", err);
        console.error("❌ Error response:", err.response?.data);
        showToast("Failed to delete question", "error");
        return;
      }
    } else {
      console.log("🗑️ No question ID provided, only removing from UI");
    }
    setQuestions((prev) => prev.filter((_, idx) => idx !== qIdx));
  };

  // Remove an option (ChecklistItemOption)
  const handleRemoveOption = async (qIdx, optIdx, optionId) => {
    console.log("🗑️ Attempting to delete option:", { qIdx, optIdx, optionId });

    if (optionId) {
      try {
        console.log(
          `🗑️ DELETE URL: https://konstruct.world/checklists/options/${optionId}/`
        );

        await checklistInstance.delete(
          `/options/${optionId}/`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log("✅ Option deleted successfully");
        showToast("Option deleted successfully!");
      } catch (err) {
        console.error("❌ Delete option error:", err);
        console.error("❌ Error response:", err.response?.data);
        showToast("Failed to delete option", "error");
        return;
      }
    } else {
      console.log("🗑️ No option ID provided, only removing from UI");
    }
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIdx].options = updated[qIdx].options.filter(
        (_, i) => i !== optIdx
      );
      return updated;
    });
  };

  // useEffect for checklist data initialization
  useEffect(() => {
    if (checklist) {
      setProjectId(checklist.project || "");
      setChecklistName(checklist.name || "");
      setCategory(checklist.category || "");
      setCat1(checklist.CategoryLevel1 || "");
      setCat2(checklist.CategoryLevel2 || "");
      setCat3(checklist.CategoryLevel3 || "");
      setCat4(checklist.CategoryLevel4 || "");
      setCat5(checklist.CategoryLevel5 || "");
      setCat6(checklist.CategoryLevel6 || "");
      setQuestions(
        checklist.questions || [
          { question: "", options: [], photo_required: false },
        ]
      );
      setSelectedBuilding(checklist.building || "");
      setSelectedLevel(checklist.level || "");
      setSelectedZone(checklist.zone || "");
      setSelectedFlat(checklist.flat || "");
      setSelectedPurpose(checklist.purpose || "");
      setSelectedPhase(checklist.phase || "");
      setSelectedStage(checklist.stage || "");
    }
  }, [checklist]);

  // useEffect for category tree
  useEffect(() => {
    if (!projectId) {
      setCategoryTree([]);
      setCategory("");
      setCat1("");
      setCat2("");
      setCat3("");
      setCat4("");
      setCat5("");
      setCat6("");
      return;
    }
    getCategoryTreeByProject(projectId)
      .then((res) => setCategoryTree(res.data || []))
      .catch(() => {
        setCategoryTree([]);
        showToast("Failed to load categories", "error");
      });
  }, [projectId]);

  // UPDATED: Main useEffect for project data fetching
  useEffect(() => {
    console.log("🔥 useEffect triggered with projectId:", projectId);
    
    if (!projectId) {
      console.log("🔥 Early return - no projectId");
      setBuildings([]);
      setLevels([]);
      setZones([]);
      setSubzones([]);
      setFlats([]);
      setPurposes([]);
      setPhases([]);
      setStages([]);
      setRooms([]);
      setSelectedBuilding("");
      setSelectedLevel("");
      setSelectedZone("");
      setSelectedSubzone("");
      setSelectedFlat("");
      setSelectedPurpose("");
      setSelectedPhase("");
      setSelectedStage("");
      setSelectedRoom("");
      return;
    }

    // UPDATED: Use new nested API instead of allinfobuildingtoflat
    fetchNestedProjectData(projectId)
      .then((nestedData) => {
        console.log("🏗️ Nested data received:", nestedData);
        const processedBuildings = processNestedData(nestedData);
        setBuildings(processedBuildings);
      })
      .catch((error) => {
        console.error("❌ Failed to load nested project data:", error);
        showToast("Failed to load buildings", "error");
        setBuildings([]);
      });

    // Fetch purposes
    axios
      .get(
        `https://konstruct.world/projects/purpose/get-purpose-details-by-project-id/${projectId}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        console.log("🚨 PURPOSES API RAW RESPONSE:", res.data);
        const purposesData = Array.isArray(res.data) ? res.data : [];
        setPurposes(purposesData);
      })
      .catch((error) => {
        console.error("❌ PURPOSES API ERROR:", error);
        showToast("Failed to load purposes", "error");
        setPurposes([]);
      });

    // Fetch rooms
    axios.get(
      `https://konstruct.world/projects/rooms/by_project/?project_id=${projectId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => {
        console.log("🏠 Rooms API Response:", res.data);
        setRooms(Array.isArray(res.data) ? res.data : []);
      })
      .catch((error) => {
        console.error("🏠 Rooms API Error:", error);
        showToast("Failed to load rooms", "error");
        setRooms([]);
      });
      console.log("Rooms data:", rooms);


    // Reset other states
    setLevels([]);
    setZones([]);
    setSubzones([]);
    setFlats([]);
    setPhases([]);
    setStages([]);
    setSelectedBuilding("");
    setSelectedLevel("");
    setSelectedZone("");
    setSelectedSubzone("");
    setSelectedFlat("");
    setSelectedPurpose("");
    setSelectedPhase("");
    setSelectedStage("");
  }, [projectId]);
  console.log("Rooms data:", rooms);


  // UPDATED: useEffect for building selection
  // useEffect(() => {
  //   if (!selectedBuilding) {
  //     setLevels([]);
  //     setZones([]);
  //     setSubzones([]);
  //     setFlats([]);
  //     setSelectedLevel("");
  //     setSelectedZone("");
  //     setSelectedSubzone("");
  //     setSelectedFlat("");
  //     return;
  //   }
    
  //   const building = buildings.find((x) => String(x.id) === String(selectedBuilding));
  //   const buildingLevels = building?.levels || [];
  //   setLevels(buildingLevels);
  //   setSelectedLevel("");
  //   setSelectedZone("");
  //   setSelectedSubzone("");
  //   setSelectedFlat("");
  //   console.log("🏢 Levels for building", selectedBuilding, buildingLevels);
  // }, [selectedBuilding, buildings]);
  // console.log("Rooms data:", rooms);
  useEffect(() => {
  if (!selectedBuilding) {
    setLevels([]);
    setSelectedLevel("");
    setZones([]);
    setSelectedZone("");
    setSubzones([]);
    setSelectedSubzone("");
    setFlats([]);
    setSelectedFlat("");
    return;
  }
  const building = buildings.find((x) => String(x.id) === String(selectedBuilding));
  const buildingLevels = building?.levels || [];
  setLevels(buildingLevels);
  // Reset just the children!
  setSelectedLevel("");
  setZones([]);
  setSelectedZone("");
  setSubzones([]);
  setSelectedSubzone("");
  setFlats([]);
  setSelectedFlat("");
}, [selectedBuilding, buildings]);


  // UPDATED: useEffect for level selection
  // useEffect(() => {
  //   if (!selectedLevel) {
  //     setZones([]);
  //     setSubzones([]);
  //     setFlats([]);
  //     setSelectedZone("");
  //     setSelectedSubzone("");
  //     setSelectedFlat("");
  //     return;
  //   }
//  useEffect(() => {
//   if (!selectedLevel) {
//     setZones([]);
//     setSubzones([]);
//     setFlats([]);
//     setSelectedZone("");
//     setSelectedSubzone("");
//     setSelectedFlat("");  // Only reset flat if parent is changed
//     return;
//   }
    
//     const level = levels.find((x) => String(x.id) === String(selectedLevel));
//     const levelZones = level?.zones || [];
//     const levelFlats = level?.flats || [];
    
//     setZones(levelZones);
//     setFlats(levelFlats); // Set flats that are directly at level
//     setSelectedZone("");
//     setSelectedSubzone("");
//     setSelectedFlat("");
    
//     console.log("🏗️ Level data:", {
//       selectedLevel,
//       zones: levelZones,
//       flatsAtLevel: levelFlats
//     });
//   }, [selectedLevel, levels]);

useEffect(() => {
  if (!selectedLevel) {
    setZones([]);
    setSubzones([]);
    setFlats([]);
    setSelectedZone("");
    setSelectedSubzone("");
    setSelectedFlat("");
    return;
  }
  const level = levels.find(l => String(l.id) === String(selectedLevel));
  setZones(level?.zones || []);
  setFlats(level?.flats || []); // Level flats always visible initially
  setSelectedZone("");
  setSelectedSubzone("");
  setSelectedFlat("");
}, [selectedLevel, levels]);


  // UPDATED: useEffect for zone selection
  // useEffect(() => {
  //   if (!selectedZone) {
  //     setSubzones([]);
  //     // Keep level flats if no zone is selected
  //     const level = levels.find((x) => String(x.id) === String(selectedLevel));
  //     setFlats(level?.flats || []);
  //     setSelectedSubzone("");
  //     setSelectedFlat("");
  //     return;
  //   }
    
  //   const zone = zones.find((x) => String(x.id) === String(selectedZone));
  //   const zoneSubzones = zone?.subzones || [];
  //   const zoneFlats = zone?.flats || [];
    
  //   setSubzones(zoneSubzones);
  //   setFlats(zoneFlats); // Set flats that are directly at zone
  //   setSelectedSubzone("");
  //   setSelectedFlat("");
    
  //   console.log("🎯 Zone data:", {
  //     selectedZone,
  //     subzones: zoneSubzones,
  //     flatsAtZone: zoneFlats
  //   });
  // }, [selectedZone, zones, selectedLevel, levels]);
 useEffect(() => {
  if (!selectedZone) {
    // If no zone, always fallback to level flats
    const level = levels.find(l => String(l.id) === String(selectedLevel));
    setFlats(level?.flats || []);
    setSubzones([]);
    setSelectedSubzone("");
    setSelectedFlat("");
    return;
  }
  const zone = zones.find(z => String(z.id) === String(selectedZone));
  setSubzones(zone?.subzones || []);
  // If zone flats exist, use them, else fallback to level flats
  setFlats(zone?.flats?.length ? zone.flats : (levels.find(l => String(l.id) === String(selectedLevel))?.flats || []));
  setSelectedSubzone("");
  setSelectedFlat("");
}, [selectedZone, zones, selectedLevel, levels]);


  // NEW: useEffect for subzone selection
  // useEffect(() => {
  //   if (!selectedSubzone) {
  //     // Keep zone flats if no subzone is selected
  //     const zone = zones.find((x) => String(x.id) === String(selectedZone));
  //     setFlats(zone?.flats || []);
  //     setSelectedFlat("");
  //     return;
  //   }
    
  //   const subzone = subzones.find((x) => String(x.id) === String(selectedSubzone));
  //   const subzoneFlats = subzone?.flats || [];
    
  //   setFlats(subzoneFlats); // Set flats that are at subzone
  //   setSelectedFlat("");
    
  //   console.log("🎪 Subzone data:", {
  //     selectedSubzone,
  //     flatsAtSubzone: subzoneFlats
  //   });
  // }, [selectedSubzone, subzones, selectedZone, zones]);
  useEffect(() => {
  if (!selectedSubzone) {
    // If no subzone, fallback to zone flats, or if empty, fallback to level flats
    const zone = zones.find(z => String(z.id) === String(selectedZone));
    if (zone?.flats?.length) {
      setFlats(zone.flats);
    } else {
      const level = levels.find(l => String(l.id) === String(selectedLevel));
      setFlats(level?.flats || []);
    }
    setSelectedFlat("");
    return;
  }
  const subzone = subzones.find(sz => String(sz.id) === String(selectedSubzone));
  // If subzone flats exist, use them, else fallback to zone or level
  if (subzone?.flats?.length) {
    setFlats(subzone.flats);
  } else {
    const zone = zones.find(z => String(z.id) === String(selectedZone));
    if (zone?.flats?.length) {
      setFlats(zone.flats);
    } else {
      const level = levels.find(l => String(l.id) === String(selectedLevel));
      setFlats(level?.flats || []);
    }
  }
  setSelectedFlat("");
}, [selectedSubzone, subzones, selectedZone, zones, selectedLevel, levels]);


  // useEffect for edit mode data loading
  useEffect(() => {
    if (isEdit && checklist?.id) {
      const fetchChecklistDetails = async () => {
        try {
          const response = await getChecklistById(checklist.id);
          const checklistData = response.data;

          setChecklistName(checklistData.name || "");
          setSkipInitializer(checklistData.not_initialized || false);
          setProjectId(checklistData.project_id || "");

          setTimeout(() => {
            setSelectedPurpose(checklistData.purpose_id || "");
            setSelectedPhase(checklistData.phase_id || "");
            setSelectedStage(checklistData.stage_id || "");
            setCategory(checklistData.category || "");
            setCat1(checklistData.category_level1 || "");
            setCat2(checklistData.category_level2 || "");
            setCat3(checklistData.category_level3 || "");
            setCat4(checklistData.category_level4 || "");
            setCat5(checklistData.category_level5 || "");
            setCat6(checklistData.category_level6 || "");
            setSelectedBuilding(checklistData.building_id || "");
            setSelectedZone(checklistData.zone_id || "");
            setSelectedFlat(checklistData.flat_id || "");
            setSelectedRooms(
              checklistData.rooms && checklistData.rooms.length > 0
                ? checklistData.rooms.map((r) =>
                    typeof r === "object" ? r.id : r
                  )
                : []
            );
          }, 500);

          if (checklistData.items && checklistData.items.length > 0) {
            const formattedQuestions = checklistData.items.map((item) => ({
              id: item.id,
              question: item.title,
              options: item.options
                ? item.options.map((opt) => ({
                    id: opt.id,
                    value: opt.name,
                    submission: opt.choice,
                  }))
                : [],
              photo_required: item.photo_required || false,
            }));
            setQuestions(formattedQuestions);
          }
        } catch (error) {
          showToast("Failed to load checklist details", "error");
        }
      };

      fetchChecklistDetails();
    }
  }, [isEdit, checklist?.id]);

  // useEffect for purpose/phase/stage relationships
  useEffect(() => {
    if (!selectedPurpose) {
      setPhases([]);
      setStages([]);
      setSelectedPhase("");
      setSelectedStage("");
      return;
    }
    getPhaseByPurposeId(selectedPurpose)
      .then((res) => setPhases(res.data || []))
      .catch(() => {
        showToast("Failed to load phases", "error");
        setPhases([]);
      });
    setStages([]);
    setSelectedPhase("");
    setSelectedStage("");
  }, [selectedPurpose]);

  useEffect(() => {
    if (!selectedPhase) {
      setStages([]);
      setSelectedStage("");
      return;
    }
    GetstagebyPhaseid(selectedPhase)
      .then((res) => setStages(res.data || []))
      .catch(() => {
        showToast("Failed to load stages");
        setStages([]);
      });
    setSelectedStage("");
  }, [selectedPhase]);

  // Helper functions for questions and options
  const handleQuestionOptionAdd = (qIdx) => {
    setQuestions((prev) => {
      const updated = [...prev];
      if (!updated[qIdx].options) {
        updated[qIdx].options = [];
      }
      updated[qIdx].options.push({ value: "", submission: "P" });
      return updated;
    });
  };

  const handleQuestionOptionChange = (qIdx, key, value, optIdx) => {
    setQuestions((prev) => {
      const updated = [...prev];
      if (!updated[qIdx].options) {
        updated[qIdx].options = [];
      }
      if (!updated[qIdx].options[optIdx]) {
        updated[qIdx].options[optIdx] = { value: "", submission: "P" };
      }
      updated[qIdx].options[optIdx][key] = value;
      return updated;
    });
  };

  const handleQuestionOptionRemove = (qIdx, optIdx) => {
    setQuestions((prev) => {
      const updated = [...prev];
      if (updated[qIdx].options && updated[qIdx].options.length > optIdx) {
        updated[qIdx].options = updated[qIdx].options.filter(
          (_, idx) => idx !== optIdx
        );
      }
      return updated;
    });
  };

  const handleAddMoreQuestions = () => {
    const toAdd = [];
    for (let i = 0; i < numOfQuestions; i++) {
      toAdd.push({
        question: "",
        options: [],
        photo_required: false,
      });
    }
    setQuestions([...questions, ...toAdd]);
  };

  // Category helper functions
  const getLevelOptions = (levelKey) => {
    if (levelKey === 1) {
      return categoryTree;
    }
    if (levelKey === 2 && category) {
      return (
        categoryTree.find((cat) => String(cat.id) === String(category))
          ?.level1 || []
      );
    }
    if (levelKey === 3 && cat1) {
      const catObj = categoryTree.find(
        (cat) => String(cat.id) === String(category)
      );
      return (
        catObj?.level1.find((l1) => String(l1.id) === String(cat1))?.level2 ||
        []
      );
    }
    if (levelKey === 4 && cat2) {
      const catObj = categoryTree.find(
        (cat) => String(cat.id) === String(category)
      );
      const cat1Obj = catObj?.level1.find(
        (l1) => String(l1.id) === String(cat1)
      );
      return (
        cat1Obj?.level2.find((l2) => String(l2.id) === String(cat2))?.level3 ||
        []
      );
    }
    if (levelKey === 5 && cat3) {
      const catObj = categoryTree.find(
        (cat) => String(cat.id) === String(category)
      );
      const cat1Obj = catObj?.level1.find(
        (l1) => String(l1.id) === String(cat1)
      );
      const cat2Obj = cat1Obj?.level2.find(
        (l2) => String(l2.id) === String(cat2)
      );
      return (
        cat2Obj?.level3.find((l3) => String(l3.id) === String(cat3))?.level4 ||
        []
      );
    }
    if (levelKey === 6 && cat4) {
      const catObj = categoryTree.find(
        (cat) => String(cat.id) === String(category)
      );
      const cat1Obj = catObj?.level1.find(
        (l1) => String(l1.id) === String(cat1)
      );
      const cat2Obj = cat1Obj?.level2.find(
        (l2) => String(l2.id) === String(cat2)
      );
      const cat3Obj = cat2Obj?.level3.find(
        (l3) => String(l3.id) === String(cat3)
      );
      return (
        cat3Obj?.level4.find((l4) => String(l4.id) === String(cat4))?.level5 ||
        []
      );
    }
    return [];
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setCat1("");
    setCat2("");
    setCat3("");
    setCat4("");
    setCat5("");
    setCat6("");
  };
  
  const handleCat1Change = (e) => {
    setCat1(e.target.value);
    setCat2("");
    setCat3("");
    setCat4("");
    setCat5("");
    setCat6("");
  };
  
  const handleCat2Change = (e) => {
    setCat2(e.target.value);
    setCat3("");
    setCat4("");
    setCat5("");
    setCat6("");
  };
  
  const handleCat3Change = (e) => {
    setCat3(e.target.value);
    setCat4("");
    setCat5("");
    setCat6("");
  };
  
  const handleCat4Change = (e) => {
    setCat4(e.target.value);
    setCat5("");
    setCat6("");
  };
  
  const handleCat5Change = (e) => {
    setCat5(e.target.value);
    setCat6("");
  };
  
  const handleCat6Change = (e) => {
    setCat6(e.target.value);
  };

  // Room selection handlers
  const handleRoomSelection = (roomId, isSelected) => {
    if (isSelected) {
      setSelectedRooms([...selectedRooms, roomId]);
    } else {
      setSelectedRooms(selectedRooms.filter((id) => id !== roomId));
    }
  };

  const handleSelectAllRooms = () => {
    setSelectedRooms(rooms.map((room) => room.id));
  };

  const handleClearAllRooms = () => {
    setSelectedRooms([]);
  };

  // User data initialization
  useEffect(() => {
    const userString = localStorage.getItem("USER_DATA");
    if (userString && userString !== "undefined") {
      const parsedUserData = JSON.parse(userString);
      setUserData(parsedUserData);
    }
  }, []);

  // Main create/update checklist function
  const handleCreateChecklist = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    if (!checklistName.trim()) {
      setIsSubmitting(false);
      return showToast("Checklist name required!");
    }
    if (!projectId || projectId === "") {
      setIsSubmitting(false);
      return showToast("Select a project");
    }
    if (!selectedPurpose || selectedPurpose === "") {
      setIsSubmitting(false);
      return showToast("Select a purpose");
    }
    if (!category || category === "") {
      setIsSubmitting(false);
      return showToast("Select a category");
    }
    if (!questions.length) {
      setIsSubmitting(false);
      return showToast("Add at least one question");
    }

    // Room validation
    if (rooms.length > 0 && selectedRooms.length === 0) {
      const shouldProceed = window.confirm(
        "Rooms are available but none selected. This will create a single checklist without room assignment. Do you want to continue?"
      );
      if (!shouldProceed) {
        setIsSubmitting(false);
        return;
      }
    }

    const parsedProjectId = parseInt(projectId);
    const parsedPurposeId = parseInt(selectedPurpose);
    const parsedCategoryId = parseInt(category);

    if (isNaN(parsedProjectId)) {
      setIsSubmitting(false);
      return showToast("Invalid project selected");
    }
    if (isNaN(parsedPurposeId)) {
      setIsSubmitting(false);
      return showToast("Invalid purpose selected");
    }
    if (isNaN(parsedCategoryId)) {
      setIsSubmitting(false);
      return showToast("Invalid category selected");
    }

    const checklistPayload = {
      name: checklistName,
      project_id: parsedProjectId,
      purpose_id: parsedPurposeId,
      phase_id:
        selectedPhase && selectedPhase !== "" ? parseInt(selectedPhase) : null,
      stage_id:
        selectedStage && selectedStage !== "" ? parseInt(selectedStage) : null,
      category: parsedCategoryId,
      category_level1: cat1 && cat1 !== "" ? parseInt(cat1) : null,
      category_level2: cat2 && cat2 !== "" ? parseInt(cat2) : null,
      category_level3: cat3 && cat3 !== "" ? parseInt(cat3) : null,
      category_level4: cat4 && cat4 !== "" ? parseInt(cat4) : null,
      category_level5: cat5 && cat5 !== "" ? parseInt(cat5) : null,
      category_level6: cat6 && cat6 !== "" ? parseInt(cat6) : null,
      building_id:
        selectedBuilding && selectedBuilding !== ""
          ? parseInt(selectedBuilding)
          : null,
      zone_id:
        selectedZone && selectedZone !== "" ? parseInt(selectedZone) : null,
      subzone_id:
        selectedSubzone && selectedSubzone !== "" ? parseInt(selectedSubzone) : null, // NEW: Added subzone support
      flat_id:
        selectedFlat && selectedFlat !== "" ? parseInt(selectedFlat) : null,
      remarks: "",
      not_initialized: skipInitializer,
    };

    console.log("=== CHECKLIST CREATION DEBUG ===");
    console.log("isEdit:", isEdit);
    console.log("checklistPayload:", checklistPayload);

    try {
      let checklistRes;
      let checklistId;

      if (isEdit && checklist?.id) {
        if (selectedRooms.length > 0) {
          console.log("🔄 BULK UPDATE MODE - Delete + Recreate");

          try {
            await axios.delete(
              `https://konstruct.world/checklists/checklists/${checklist.id}/`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
                  "Content-Type": "application/json",
                },
              }
            );
            console.log("✅ Old checklist deleted successfully");
          } catch (deleteError) {
            console.error("❌ Delete error:", deleteError);
            showToast("Failed to delete old checklist", "error");
            setIsSubmitting(false);
            return;
          }

          const bulkPayload = {
            ...checklistPayload,
            description: checklistPayload.remarks || "Bulk checklist creation",
            created_by_id: userData.user_id,
            rooms: selectedRooms,
            items: questions.map((q) => ({
              title: q.question,
              description: q.question,
              status: "not_started",
              ignore_now: false,
              photo_required: q.photo_required || false,
              options: (q.options || [])
                .filter((opt) => opt.value && opt.value.trim() !== "")
                .map((opt) => ({
                  name: opt.value,
                  choice: opt.submission,
                })),
            })),
          };

          checklistRes = await checklistInstance.post(
            "/create/unit-chechklist/",
            bulkPayload,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
                "Content-Type": "application/json",
              },
            }
          );

          showToast("Bulk checklist updated successfully!", "success");
        } else {
          console.log("🔄 SINGLE UPDATE MODE");
          checklistRes = await updateChecklistById(
            checklist.id,
            checklistPayload
          );
          checklistId = checklist.id;
          showToast("Checklist updated successfully!", "success");
        }
      } else {
        if (selectedRooms.length > 0) {
          console.log("🚀 BULK CREATION MODE - ROOMS SELECTED");
          const bulkPayload = {
            ...checklistPayload,
            description: checklistPayload.remarks || "Bulk checklist creation",
            created_by_id: userData.user_id,
            rooms: selectedRooms,
            items: questions.map((q) => ({
              title: q.question,
              description: q.question,
              status: "not_started",
              ignore_now: false,
              photo_required: q.photo_required || false,
              options: (q.options || [])
                .filter((opt) => opt.value && opt.value.trim() !== "")
                .map((opt) => ({
                  name: opt.value,
                  choice: opt.submission,
                })),
            })),
          };
          console.log("📦 Bulk Payload being sent:", bulkPayload);

          checklistRes = await checklistInstance.post(
            "/create/unit-chechklist/",
            bulkPayload,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
                "Content-Type": "application/json",
              },
            }
          );
          console.log("✅ Bulk API Response:", checklistRes.data);
          showToast(
            `Checklists created for selected rooms successfully! Created ${
              checklistRes.data.checklist_ids?.length || 0
            } checklists`,
            "success"
          );
        } else {
          console.log("🎯 SINGLE CREATION MODE - NO ROOMS");
          checklistRes = await createChecklist(checklistPayload);
          checklistId =
            checklistRes.data?.id ||
            checklistRes.data?.pk ||
            checklistRes.data?.ID;
          showToast("Checklist created successfully!", "success");
        }
      }

      if (
        checklistRes.status === 201 ||
        checklistRes.status === 200 ||
        checklistRes.data?.id ||
        checklistRes.data?.checklist_ids
      ) {
        console.log("🎉 SUCCESS CONDITION MET");

        if (selectedRooms.length === 0 && !isEdit) {
          for (let i = 0; i < questions.length; i++) {
            const q = questions[i];

            const itemRes = await createChecklistQuestion({
              checklist: checklistId,
              title: q.question,
              photo_required: q.photo_required || false,
              is_done: false,
            });

            const checklistItemId = itemRes.data?.id;

            if (checklistItemId && q.options?.length) {
              for (let option of q.options) {
                if (option.value && option.value.trim() !== "") {
                  await createChecklistItemOPTIONSS({
                    checklist_item: checklistItemId,
                    name: option.value,
                    choice: option.submission,
                  });
                }
              }
            }
          }
        }

        if (
          !isEdit &&
          onChecklistCreated &&
          typeof onChecklistCreated === "function"
        ) {
          if (selectedRooms.length > 0) {
            console.log("📤 Calling callback for BULK creation");
            const createdChecklistData = {
              ...checklistPayload,
              id: checklistRes.data?.checklist_ids?.[0] || null,
              project_id: parsedProjectId,
              category_id: parsedCategoryId,
              is_bulk: true,
              checklist_count: checklistRes.data?.checklist_ids?.length || 0,
            };
            console.log("📤 Bulk callback data:", createdChecklistData);
            onChecklistCreated(createdChecklistData);
          } else {
            const createdChecklistData = {
              ...checklistPayload,
              id: checklistId,
              project_id: parsedProjectId,
              category_id: parsedCategoryId,
            };
            console.log("📤 Single callback data:", createdChecklistData);
            onChecklistCreated(createdChecklistData);
          }
        }

        setShowForm(false);
      } else {
        console.error("Checklist creation failed:", checklistRes);
        showToast(
          checklistRes.data?.message || "Failed to create checklist",
          "error"
        );
      }
    } catch (error) {
      console.error("Error creating checklist:", error);

      if (error.response) {
        console.error("Error response:", error.response.data);
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.detail ||
          `Server error: ${error.response.status}`;
        showToast(errorMessage, "error");
      } else {
        showToast(
          "Failed to create checklist and questions. Please try again.",
          "error"
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bulk upload function
  const handleBulkUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const bulkQuestions = [];

        jsonData.forEach((row) => {
          const question = row["Question"] || row["question"] || "";
          const optionsString = row["Options"] || row["options"] || "";
          const photoRequired =
            row["PhotoRequired"] || row["photo_required"] || false;

          const options = [];
          if (optionsString) {
            const optionPairs = optionsString.split("|");
            optionPairs.forEach((pair) => {
              const match = pair.match(/^(.+)\(([PN])\)$/);
              if (match) {
                options.push({
                  value: match[1].trim(),
                  submission: match[2],
                });
              }
            });
          }

          if (question.trim()) {
            bulkQuestions.push({
              question: question.trim(),
              options: options,
              photo_required:
                photoRequired === true ||
                photoRequired === "true" ||
                photoRequired === "True",
            });
          }
        });

        if (bulkQuestions.length > 0) {
          setQuestions([...questions, ...bulkQuestions]);
          showToast(
            `${bulkQuestions.length} questions uploaded successfully!`,
            "success"
          );
        } else {
          showToast("No valid questions found in the file", "error");
        }

        event.target.value = "";
      } catch (error) {
        showToast("Error reading file. Please check the format.", "error");
      }
    };
    reader.readAsArrayBuffer(file);
  };
  // Utility outside your component
function sortLevels(levels) {
    const floorRegex = /^Floor (\d+)$/i;
    const numbered = [];
    const nonNumbered = [];
    levels.forEach(level => {
        const match = floorRegex.exec(level.name);
        if (match) {
            numbered.push({ ...level, floorNumber: parseInt(match[1], 10) });
        } else {
            nonNumbered.push(level);
        }
    });
    numbered.sort((a, b) => a.floorNumber - b.floorNumber);
    nonNumbered.sort((a, b) => a.name.localeCompare(b.name));
    return [...numbered.map(({ floorNumber, ...l }) => l), ...nonNumbered];
}


  return (
    <div className="flex min-h-screen" style={{ background: palette.bg }}>
      <div
        className="flex-1 p-4 lg:p-8 transition-all duration-300"
        style={{
          marginLeft: sidebarOpen ? 0 : 0,
        }}
      >
        <div
          className="w-full max-w-7xl mx-auto p-4 lg:p-8 rounded-2xl"
          style={{
            background: palette.card,
            color: palette.text,
            borderColor: palette.border,
          }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${palette.primary}`}>
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className={`text-3xl font-bold ${palette.text}`}>
                    {isEdit ? "Edit Checklist" : "Create New Checklist"}
                  </h1>
                  <p className={`${palette.textSecondary} text-lg mt-1`}>
                    {isEdit
                      ? "Update checklist details and questions"
                      : "Build comprehensive checklists for your projects"}
                  </p>
                </div>
              </div>
              <button
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 ${palette.secondary} flex items-center space-x-2`}
                onClick={() => setShowForm(false)}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span>Back</span>
              </button>
            </div>
          </div>

          {/* Template & Skip Initializer Controls */}
          <div className="mb-8 flex flex-col lg:flex-row gap-4">
            {/* Template Download */}
            <div
              className="flex-1 p-6 rounded-xl border-2 transition-all duration-300"
              style={{ borderColor: palette.border }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${palette.info}`}>
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className={`${palette.text} font-bold text-xl`}>
                      Questions Template
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href =
                      'data:text/plain;charset=utf-8,Question,Options,PhotoRequired\n"What is the quality?","Good(P)|Bad(N)|Average(P)",false\n"Check alignment","Aligned(P)|Not Aligned(N)",true';
                    link.download = "questions_template.csv";
                    link.click();
                  }}
                  className={`px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 flex items-center space-x-3 ${palette.info}`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Skip Initializer */}
            <div
              className={`flex-1 p-6 rounded-xl border-2 transition-all duration-300`}
              style={{ borderColor: palette.border }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${palette.warning}`}>
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className={`${palette.text} font-bold text-xl`}>
                      Skip Initializer
                    </h3>
                  </div>
                </div>
                <button
                  className={`px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 flex items-center space-x-3 ${
                    skipInitializer ? palette.success : palette.warning
                  }`}
                  type="button"
                  onClick={() => setSkipInitializer(!skipInitializer)}
                >
                  {skipInitializer ? (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>✓ Enabled</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      <span>Enable</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Checklist Name Input */}
          <div className="mb-8">
            <label
              className={`block font-bold text-xl mb-3 ${palette.text} flex items-center space-x-3`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              <span>
                Checklist Name <span className="text-red-500">*</span>
              </span>
            </label>
            <input
              type="text"
              className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 ${palette.selectBg} ${palette.selectText} font-medium text-lg`}
              style={{ borderColor: palette.border }}
              placeholder="Enter a descriptive name for your checklist"
              value={checklistName}
              onChange={(e) => setChecklistName(e.target.value)}
              required
            />
          </div>

          {/* Show the checklist name as heading if filled */}
          {checklistName && (
            <div
              className={`mb-6 p-4 rounded-xl border-2 text-xl font-bold text-center ${palette.badge} ${palette.badgeText} border-current`}
            >
              📋 {checklistName}
            </div>
          )}

          {/* Flat name display */}
          {selectedFlatObj && (
            <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-blue-300 text-lg font-bold text-blue-800 text-center">
              🏠 Selected Flat: {selectedFlatObj.number}
            </div>
          )}

          {/* Project & Hierarchy Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Project Dropdown */}
            <div>
              <label
                className={`block text-lg font-semibold mb-3 ${palette.text} flex items-center space-x-3`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0V9a1 1 0 011-1h4a1 1 0 011 1v12"
                  />
                </svg>
                <span>
                  Project <span className="text-red-500">*</span>
                </span>
              </label>
              <select
                className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 ${palette.selectBg} ${palette.selectText} font-medium`}
                style={{ borderColor: palette.border }}
                value={projectId}
                onChange={(e) => {
                  console.log("🎯 Project dropdown changed to:", e.target.value);
                  setProjectId(e.target.value);
                }}
              >
                <option value="">Select Project</option>
                {(Array.isArray(projectOptions) ? projectOptions : []).map(
                  (proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.name}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Building Dropdown */}
            {buildings.length > 0 && (
              <div>
                <label
                  className={`block text-lg font-semibold mb-3 ${palette.text} flex items-center space-x-3`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                    />
                  </svg>
                  <span>Tower / Building</span>
                </label>
                <select
                  className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 ${palette.selectBg} ${palette.selectText} font-medium`}
                  style={{ borderColor: palette.border }}
                  value={selectedBuilding}
                  onChange={(e) => {
                    setSelectedBuilding(e.target.value);
                    console.log("Building selected:", e.target.value);
                  }}
                >
                  <option value="">Select Building</option>
                  {(Array.isArray(buildings) ? buildings : []).map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            

            {/* Level Dropdown */}
            {levels.length > 0 && (
              <div>
                <label
                  className={`block text-lg font-semibold mb-3 ${palette.text} flex items-center space-x-3`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16V4m0 0L3 8l4-4 4 4m-4-4v12"
                    />
                  </svg>
                  <span>Level</span>
                </label>
                <select
                  className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 ${palette.selectBg} ${palette.selectText} font-medium`}
                  style={{ borderColor: palette.border }}
                  value={selectedLevel}
                  onChange={(e) => {
                    setSelectedLevel(e.target.value);
                    console.log("Level selected:", e.target.value);
                  }}
                >
                  <option value="">Select Level</option>
                  {sortLevels(levels).map(l => (
    <option key={l.id} value={l.id}>{l.name}</option>
  ))}
                </select>
                {/* <select
  className="..."
  value={selectedLevel}
  onChange={(e) => setSelectedLevel(e.target.value)}
>
  <option value="">Select Level</option>
  {sortLevels(levels).map(l => (
    <option key={l.id} value={l.id}>{l.name}</option>
  ))}
</select> */}
              </div>
            )}

            {/* Zone Dropdown */}
            {zones.length > 0 && (
              <div>
                <label
                  className={`block text-lg font-semibold mb-3 ${palette.text} flex items-center space-x-3`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>Zone</span>
                </label>
                 <select
                  className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 ${palette.selectBg} ${palette.selectText} font-medium`}
                  style={{ borderColor: palette.border }}
                  value={selectedZone}
                  onChange={(e) => {
                    setSelectedZone(e.target.value);
                    console.log("Zone selected:", e.target.value);
                  }}
                >
                  <option value="">Select Zone</option>
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Subzone Dropdown */}
            {subzones.length > 0 && (
              <div>
                <label
                  className={`block text-lg font-semibold mb-3 ${palette.text} flex items-center space-x-3`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                  <span>Subzone</span>
                </label>
                <select
                  className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 ${palette.selectBg} ${palette.selectText} font-medium`}
                  style={{ borderColor: palette.border }}
                  value={selectedSubzone}
                  onChange={(e) => {
                    setSelectedSubzone(e.target.value);
                    console.log("Subzone selected:", e.target.value);
                  }}
                >
                  <option value="">Select Subzone</option>
                  {subzones.map((sz) => (
                    <option key={sz.id} value={sz.id}>
                      {sz.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Flat Dropdown */}
            {/* {flats.length > 0 && (
              <div>
                <label
                  className={`block text-lg font-semibold mb-3 ${palette.text} flex items-center space-x-3`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v0a2 2 0 012-2h.621a2 2 0 011.414.586L9.5 6A2 2 0 0010.914 6.5H19a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                    />
                  </svg>
                  <span>Unit / Flat</span>
                </label>
                <select
                  className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 ${palette.selectBg} ${palette.selectText} font-medium`}
                  style={{ borderColor: palette.border }}
                  value={selectedFlat}
                  onChange={(e) => setSelectedFlat(e.target.value)}
                >
                  <option value="">Select Flat</option>
                  {flats.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.number}
                    </option>
                  ))}
                </select>
              </div>
            )} */}

            {flats.length > 0 && (
             <div>
               <label
                 className={`block text-lg font-semibold mb-3 ${palette.text} flex items-center space-x-3`}
               >
                 <svg
                   className="w-5 h-5"
                   fill="none"
                   stroke="currentColor"
                   viewBox="0 0 24 24"
                 >
                   <path
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeWidth={2}
                     d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                   />
                   <path
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeWidth={2}
                     d="M8 21v-4a2 2 0 012-2h4a2 2 0 012 2v4"
                   />
                 </svg>
                 <span>Flat</span>
               </label>
               <select
                 className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 ${palette.selectBg} ${palette.selectText} ${palette.border} font-medium`}
                 value={selectedFlat}
                 onChange={(e) => {
                   setSelectedFlat(e.target.value);
                   console.log("Flat selected:", e.target.value);
                 }}
               >
                 <option value="">Select Flat</option>
                 {flats.map((f) => (
                   <option key={f.id} value={f.id}>
                     {f.number}
                   </option>
                 ))}
               </select>
             </div>
           )}

            {/* Purpose Dropdown */}
            <div>
              <label
                className={`block text-lg font-semibold mb-3 ${palette.text} flex items-center space-x-3`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
                <span>
                  Purpose <span className="text-red-500">*</span>
                </span>
              </label>
              {/* <select
                className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 ${palette.selectBg} ${palette.selectText} font-medium`}
                style={{ borderColor: palette.border }}
                value={selectedPurpose}
                onChange={(e) => setSelectedPurpose(e.target.value)}
              >
                <option value="">Select Purpose</option>
                {purposes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.purpose}
                  </option>
                ))}
              </select> */}
               <select
               className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 ${palette.selectBg} ${palette.selectText} ${palette.border} font-medium`}
                 value={selectedPurpose}
                 onChange={(e) => setSelectedPurpose(e.target.value)}
               >
                 <option value="">Select Purpose</option>
                 {purposes.map((p) => {
                   // ✅ ROBUST RENDERING LOGIC
                   const purposeName =
                     p.name?.purpose?.name || p.name?.name || `Purpose ${p.id}`;

                   console.log("🎯 Rendering Purpose:", p);
                   console.log("🎯 Purpose ID:", p.id);
                   console.log("🎯 Resolved Purpose Name:", purposeName);

                   return (
                     <option key={p.id} value={p.id}>
                       {purposeName}
                     </option>
                   );
                 })}
               </select>
            </div>

            {/* Phase Dropdown */}
            {phases.length > 0 && (
              <div>
                <label
                  className={`block text-lg font-semibold mb-3 ${palette.text} flex items-center space-x-3`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <span>Phase
                    <span className="text-red-500">*</span>
                  </span>
                </label>
                {/* <select
                  className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 ${palette.selectBg} ${palette.selectText} font-medium`}
                  style={{ borderColor: palette.border }}
                  value={selectedPhase}
                  onChange={(e) => setSelectedPhase(e.target.value)}
                >
                  <option value="">Select Phase</option>
                  {phases.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.phase}
                    </option>
                  ))}
                </select> */}
                <select
                   className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 font-medium`}
                   style={{
                     background: palette.selectBg,
                     color: palette.selectText,
                     borderColor: palette.selectText
                   }}
                   value={selectedPhase}
                   onChange={(e) => setSelectedPhase(e.target.value)}
                 >
                   <option value="">Select Phase
                    
                   </option>
                   {phases.map((ph) => (
                     <option key={ph.id} value={ph.id}>
                       {ph.name}
                     </option>
                   ))}
                 </select>
              </div>
            )}

            {/* Stage Dropdown */}
            {stages.length > 0 && (
              <div>
                <label
                  className={`block text-lg font-semibold mb-3 ${palette.text} flex items-center space-x-3`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <span>Stage<span className="text-red-500">*</span></span>
                </label>
                {/* <select
                  className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 ${palette.selectBg} ${palette.selectText} font-medium`}
                  style={{ borderColor: palette.border }}
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                >
                  <option value="">Select Stage</option>
                  {stages.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.stage}
                    </option>
                  ))}
                </select> */}

                 <select
                   className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 font-medium`}
                   style={{
                     background: palette.selectBg,
                     color: palette.selectText,
                     borderColor:  palette.selectBg
                   }}
                   value={selectedStage}
                   onChange={(e) => setSelectedStage(e.target.value)}
                 >
                   <option value="">Select Stage</option>
                   {stages.map((st) => (
                     <option key={st.id} value={st.id}>
                       {st.name}
                     </option>
                   ))}
                 </select>
              </div>
            )}
          </div>

          {/* Category Section */}
          <div className="mb-8">
            <div className="mb-6">
              <h2 className={`text-2xl font-bold ${palette.text} mb-4 flex items-center space-x-3`}>
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <span>
                  Category Selection <span className="text-red-500">*</span>
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Category Level 0 */}
              <div>
                <label
                  className={`block text-lg font-semibold mb-3 ${palette.text}`}
                >
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 ${palette.selectBg} ${palette.selectText} font-medium`}
                  style={{ borderColor: palette.border }}
                  value={category}
                  onChange={handleCategoryChange}
                >
                  <option value="">Select Category</option>
                  {getLevelOptions(1).map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Level 1 */}
              {getLevelOptions(2).length > 0 && (
                <div>
                  <label
                    className={`block text-lg font-semibold mb-3 ${palette.text}`}
                  >
                    Category Level 1
                  </label>
                  <select
                    className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 ${palette.selectBg} ${palette.selectText} font-medium`}
                    style={{ borderColor: palette.border }}
                    value={cat1}
                    onChange={handleCat1Change}
                  >
                    <option value="">Select Level 1</option>
                    {getLevelOptions(2).map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Category Level 2 */}
              {getLevelOptions(3).length > 0 && (
                <div>
                  <label
                    className={`block text-lg font-semibold mb-3 ${palette.text}`}
                  >
                    Category Level 2
                  </label>
                  <select
                    className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 ${palette.selectBg} ${palette.selectText} font-medium`}
                    style={{ borderColor: palette.border }}
                    value={cat2}
                    onChange={handleCat2Change}
                  >
                    <option value="">Select Level 2</option>
                    {getLevelOptions(3).map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Category Level 3 */}
              {getLevelOptions(4).length > 0 && (
                <div>
                  <label
                    className={`block text-lg font-semibold mb-3 ${palette.text}`}
                  >
                    Category Level 3
                  </label>
                  <select
                    className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 ${palette.selectBg} ${palette.selectText} font-medium`}
                    style={{ borderColor: palette.border }}
                    value={cat3}
                    onChange={handleCat3Change}
                  >
                    <option value="">Select Level 3</option>
                    {getLevelOptions(4).map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Category Level 4 */}
              {getLevelOptions(5).length > 0 && (
                <div>
                  <label
                    className={`block text-lg font-semibold mb-3 ${palette.text}`}
                  >
                    Category Level 4
                  </label>
                  <select
                    className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 ${palette.selectBg} ${palette.selectText} font-medium`}
                    style={{ borderColor: palette.border }}
                    value={cat4}
                    onChange={handleCat4Change}
                  >
                    <option value="">Select Level 4</option>
                    {getLevelOptions(5).map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Category Level 5 */}
              {getLevelOptions(6).length > 0 && (
                <div>
                  <label
                    className={`block text-lg font-semibold mb-3 ${palette.text}`}
                  >
                    Category Level 5
                  </label>
                  <select
                    className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 ${palette.selectBg} ${palette.selectText} font-medium`}
                    style={{ borderColor: palette.border }}
                    value={cat5}
                    onChange={handleCat5Change}
                  >
                    <option value="">Select Level 5</option>
                    {getLevelOptions(6).map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Room Selection Section */}
          {rooms.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${palette.text} flex items-center space-x-3`}>
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v0a2 2 0 012-2h.621a2 2 0 011.414.586L9.5 6A2 2 0 0010.914 6.5H19a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                    />
                  </svg>
                  <span>Room Selection ({selectedRooms.length} selected)</span>
                </h2>
                <button
                  type="button"
                  onClick={() => setShowRoomsModal(true)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 ${palette.secondary} flex items-center space-x-2`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span>Select Rooms</span>
                </button>
              </div>

              {/* Room Display */}
              {selectedRooms.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedRooms.map((roomId) => {
                    const room = rooms.find((r) => r.id === roomId);
                    return (
                      <span
                        key={roomId}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${palette.badge} ${palette.badgeText} flex items-center space-x-2`}
                      >
                        <span>{room?.rooms || `Room ${roomId}`}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedRooms(
                              selectedRooms.filter((id) => id !== roomId)
                            )
                          }
                          className="ml-1 hover:text-red-600"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Room Selection Modal */}
              {showRoomsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div
                    className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto"
                    style={{ background: palette.card }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className={`text-xl font-bold ${palette.text}`}>
                        Select Rooms
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowRoomsModal(false)}
                        className={`p-2 rounded-full ${palette.danger}`}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="flex gap-2 mb-4">
                      <button
                        type="button"
                        onClick={handleSelectAllRooms}
                        className={`px-4 py-2 rounded-lg ${palette.success} text-sm font-medium`}
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={handleClearAllRooms}
                        className={`px-4 py-2 rounded-lg ${palette.warning} text-sm font-medium`}
                      >
                        Clear All
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {rooms.map((room) => (
                        <label
                          key={room.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                            selectedRooms.includes(room.id)
                              ? `${palette.badge} border-current`
                              : `hover:bg-gray-50 ${palette.border}`
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedRooms.includes(room.id)}
                            onChange={(e) =>
                              handleRoomSelection(room.id, e.target.checked)
                            }
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                         <span
  className={`font-medium ${
    selectedRooms.includes(room.id)
      ? palette.badgeText
      : palette.text
  }`}
>
  {room.rooms}
</span>

                        </label>
                      ))}
                    </div>

                    <div className="flex justify-end mt-6">
                      <button
                        type="button"
                        onClick={() => setShowRoomsModal(false)}
                        className={`px-6 py-3 rounded-xl font-semibold ${palette.primary}`}
                      >
                        Done ({selectedRooms.length} selected)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}


           {/* {rooms.length > 0 && (
               <div>
                 <label
                   className={`block text-lg font-semibold mb-3 flex items-center space-x-3`}
                   style={{ color: palette.text }}
                 >
                   <svg
                     className="w-5 h-5"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                   >
                     <path
                       strokeLinecap="round"
                       strokeLinejoin="round"
                       strokeWidth={2}
                       d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                     />
                   </svg>
                   <span>Rooms ({selectedRooms.length} selected)</span>
                 </label>
                 <button
                   type="button"
                   onClick={() => setShowRoomsModal(true)}
                   className={`w-full p-4 border-2 rounded-xl transition-all duration-300 hover:scale-105 font-medium text-left flex items-center justify-between`}
                   style={{
                     background: ORANGE,
                     color: "white",
                     borderColor: ORANGE
                   }}
                 >
                   <span>
                     {selectedRooms.length === 0
                       ? "Select Rooms"
                       : `${selectedRooms.length} room(s) selected`}
                   </span>
                   <svg
                     className="w-5 h-5"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                   >
                     <path
                       strokeLinecap="round"
                       strokeLinejoin="round"
                       strokeWidth={2}
                       d="M19 9l-7 7-7-7"
                     />
                   </svg>
                 </button>
               </div>
             )} */}

          {/* Questions Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${palette.text} flex items-center space-x-3`}>
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Questions ({questions.length})</span>
              </h2>
              
              <div className="flex gap-3">
                {/* Bulk Upload */}
                <div className="relative">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleBulkUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <button
                    type="button"
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 ${palette.info} flex items-center space-x-2`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <span>Bulk Upload</span>
                  </button>
                </div>

                {/* Add Questions */}
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={numOfQuestions}
                    onChange={(e) => setNumOfQuestions(parseInt(e.target.value) || 1)}
                    className={`w-20 p-2 border-2 rounded-lg text-center font-medium ${palette.selectBg} ${palette.selectText}`}
                    style={{ borderColor: palette.border }}
                  />
                  <button
                    type="button"
                    onClick={handleAddMoreQuestions}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 ${palette.success} flex items-center space-x-2`}
                  >
                    <MdAdd className="w-5 h-5" />
                    <span>Add Questions</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-6">
              {questions.map((q, qIdx) => (
                <div
                  key={qIdx}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 ${palette.card}`}
                  style={{ borderColor: palette.border }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-bold ${palette.text}`}>
                      Question {qIdx + 1}
                    </h3>
                    <div className="flex items-center space-x-3">
                      {/* Photo Required Toggle */}
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={q.photo_required || false}
                          onChange={(e) => {
                            setQuestions((prev) => {
                              const updated = [...prev];
                              updated[qIdx].photo_required = e.target.checked;
                              return updated;
                            });
                          }}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className={`text-sm font-medium ${palette.textSecondary}`}>
                          Photo Required
                        </span>
                      </label>

                      {/* Delete Question */}
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(qIdx, q.id)}
                        className={`p-2 rounded-lg ${palette.danger} transition-all duration-200 hover:scale-110`}
                      >
                        <MdDelete className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Question Input */}
                  <div className="mb-4">
                    <textarea
                      placeholder={`Enter question ${qIdx + 1}...`}
                      value={q.question}
                      onChange={(e) => {
                        setQuestions((prev) => {
                          const updated = [...prev];
                          updated[qIdx].question = e.target.value;
                          return updated;
                        });
                      }}
                      className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 ${palette.selectBg} ${palette.selectText} font-medium resize-none`}
                      style={{ borderColor: palette.border }}
                      rows="3"
                    />
                  </div>

                  {/* Options */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`font-semibold ${palette.text}`}>
                        Options ({(q.options || []).length})
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleQuestionOptionAdd(qIdx)}
                        className={`px-4 py-2 rounded-lg ${palette.success} text-sm font-medium flex items-center space-x-2`}
                      >
                        <MdAdd className="w-4 h-4" />
                        <span>Add Option</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(q.options || []).map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <input
                            type="text"
                            placeholder={`Option ${optIdx + 1}`}
                            value={opt.value || ""}
                            onChange={(e) =>
                              handleQuestionOptionChange(
                                qIdx,
                                "value",
                                e.target.value,
                                optIdx
                              )
                            }
                            className={`flex-1 p-3 border-2 rounded-lg ${palette.selectBg} ${palette.selectText} font-medium`}
                            style={{ borderColor: palette.border }}
                          />
                          <select
                            value={opt.submission || "P"}
                            onChange={(e) =>
                              handleQuestionOptionChange(
                                qIdx,
                                "submission",
                                e.target.value,
                                optIdx
                              )
                            }
                            className={`p-3 border-2 rounded-lg ${palette.selectBg} ${palette.selectText} font-medium`}
                            style={{ borderColor: palette.border }}
                          >
                            <option value="P">Pass (P)</option>
                            <option value="N">Fail (N)</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(qIdx, optIdx, opt.id)}
                            className={`p-2 rounded-lg ${palette.danger} transition-all duration-200 hover:scale-110`}
                          >
                            <MdDelete className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {questions.length === 0 && (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className={`text-lg font-medium ${palette.text} mb-2`}>
                  No questions added yet
                </h3>
                <p className={`${palette.textSecondary} mb-4`}>
                  Start by adding some questions or upload them in bulk
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuestions([
                      { question: "", options: [], photo_required: false },
                    ]);
                  }}
                  className={`px-6 py-3 rounded-xl font-semibold ${palette.primary}`}
                >
                  Add First Question
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 ${palette.secondary} flex items-center justify-center space-x-3`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span>Cancel</span>
            </button>

            <button
              type="button"
              onClick={handleCreateChecklist}
              disabled={ isSubmitting ||
  !selectedPurpose ||
  !selectedPhase ||
  !selectedStage}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${palette.primary} flex items-center justify-center space-x-3`}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="w-5 h-5 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span>
                    {isEdit ? "Updating..." : "Creating..."}
                  </span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>
                    {isEdit ? "Update Checklist" : "Create Checklist"}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Summary Card */}
          {(checklistName || selectedRooms.length > 0 || questions.length > 0) && (
            <div
              className={`mt-8 p-6 rounded-xl border-2 ${palette.card}`}
              style={{ borderColor: palette.border }}
            >
              <h3 className={`text-xl font-bold ${palette.text} mb-4 flex items-center space-x-3`}>
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>Checklist Summary</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${palette.text}`}>
                    {questions.length}
                  </div>
                  <div className={`text-sm ${palette.textSecondary}`}>
                    Questions
                  </div>
                </div>
                
                <div className="text-center">
                  <div className={`text-3xl font-bold ${palette.text}`}>
                    {questions.reduce((acc, q) => acc + (q.options?.length || 0), 0)}
                  </div>
                  <div className={`text-sm ${palette.textSecondary}`}>
                    Total Options
                  </div>
                </div>
                
                <div className="text-center">
                  <div className={`text-3xl font-bold ${palette.text}`}>
                    {selectedRooms.length || 1}
                  </div>
                  <div className={`text-sm ${palette.textSecondary}`}>
                    {selectedRooms.length > 0 ? "Room Checklists" : "Checklist"}
                  </div>
                </div>
              </div>

              {checklistName && (
                <div className="mt-4 text-center">
                  <span className={`text-lg font-medium ${palette.textSecondary}`}>
                    Creating: "{checklistName}"
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChecklistForm;
                  





// import React, { useState, useEffect } from "react";
// import { MdDelete, MdAdd } from "react-icons/md";
// import {
//   createChecklist,
//   allinfobuildingtoflat,
//   getPurposeByProjectId,
//   getPhaseByPurposeId,
//   GetstagebyPhaseid,
//   getCategoryTreeByProject,
//   createChecklistQuestion,
//   createChecklistItemOPTIONSS,
//   getChecklistById,
//   updateChecklistById,
//   deleteChecklistItem,
//   deleteChecklistItemOption,
// } from "../../api";
// import { showToast } from "../../utils/toast";
// import * as XLSX from "xlsx";
// import axios from "axios";
// import SideBarSetup from "../../components/SideBarSetup";
// import { useTheme } from "../../ThemeContext";
// import { checklistInstance, projectInstance } from '../../api/axiosInstance';

// const ChecklistForm = ({
//   setShowForm,
//   checklist,
//   projectOptions = [],
//   onChecklistCreated,
//   sidebarOpen = true, // Add this prop for sidebar state
// }) => {
//   const { theme } = useTheme();

//   // Orange color palette
//   const ORANGE = "#ffbe63";
//   const BG_OFFWHITE = "#fcfaf7";
//   const SIDEBAR_WIDTH = 250; // Define sidebar width
  
//   const palette = {
//     bg: theme === "dark" ? "#191922" : BG_OFFWHITE,
//     card: theme === "dark" ? "#23232c" : "#fff",
//     text: theme === "dark" ? "#fff" : "#222",
//     textSecondary: theme === "dark" ? "#ccc" : "#666",
//     border: `border-[${ORANGE}]`,
//     primary: `bg-[${ORANGE}] text-white hover:bg-[#ff9500]`,
//     secondary: `bg-gray-500 text-white hover:bg-gray-600`,
//     success: "bg-green-500 text-white hover:bg-green-600",
//     warning: "bg-yellow-500 text-white hover:bg-yellow-600",
//     danger: "bg-red-500 text-white hover:bg-red-600",
//     info: "bg-blue-500 text-white hover:bg-blue-600",
//     selectText: theme === "dark" ? "text-white" : "text-[#222]",
//     selectBg: theme === "dark" ? "bg-[#23232c]" : "bg-white",
//     tableHead: theme === "dark" ? "bg-[#23232c]" : "bg-gray-50",
//     tableRow: theme === "dark" ? "hover:bg-[#2a2a35]" : "hover:bg-gray-50",
//     shadow: "shadow-lg",
//     badge: `bg-[${ORANGE}]`,
//     badgeText: "text-white",
//   };

//   // Content margin based on sidebar state
//   const contentMarginLeft = sidebarOpen ? SIDEBAR_WIDTH : 0;

//   // ALL EXISTING STATE - NO CHANGES
//   const [projectId, setProjectId] = useState("");
//   const [buildings, setBuildings] = useState([]);
//   const [levels, setLevels] = useState([]);
//   const [zones, setZones] = useState([]);
//   const [flats, setFlats] = useState([]);
//   const [selectedBuilding, setSelectedBuilding] = useState("");
//   const [selectedLevel, setSelectedLevel] = useState("");
//   const [selectedZone, setSelectedZone] = useState("");
//   const [selectedFlat, setSelectedFlat] = useState("");
//   const [userData, setUserData] = useState(null);

//   const [purposes, setPurposes] = useState([]);
//   const [phases, setPhases] = useState([]);
//   const [stages, setStages] = useState([]);
//   const [selectedPurpose, setSelectedPurpose] = useState("");
//   const [selectedPhase, setSelectedPhase] = useState("");
//   const [selectedStage, setSelectedStage] = useState("");
//   const [skipInitializer, setSkipInitializer] = useState(false);

//   const [categoryTree, setCategoryTree] = useState([]);
//   const [category, setCategory] = useState("");
//   const [cat1, setCat1] = useState("");
//   const [cat2, setCat2] = useState("");
//   const [cat3, setCat3] = useState("");
//   const [cat4, setCat4] = useState("");
//   const [cat5, setCat5] = useState("");
//   const [cat6, setCat6] = useState("");

//   const [options, setOptions] = useState([{ value: "", submission: "P" }]);
//   const [questions, setQuestions] = useState([
//     { question: "", options: [], photo_required: false },
//   ]);

//   const [numOfQuestions, setNumOfQuestions] = useState(1);
//   const isEdit = !!checklist;
//   const [checklistName, setChecklistName] = useState("");

//   const selectedFlatObj = flats.find(
//     (f) => String(f.id) === String(selectedFlat)
//   );

//   const [rooms, setRooms] = useState([]);
//   const [selectedRoom, setSelectedRoom] = useState("");
//   console.log("🔥 Component render - projectId:", projectId);
//   console.log("🔥 Component render - projectId type:", typeof projectId);
//   const [selectedRooms, setSelectedRooms] = useState([]);
//   const [showRoomsModal, setShowRoomsModal] = useState(false);

//   console.log("🔍 DEBUG 1 - State Values Check:");
//   console.log("projectOptions:", projectOptions);
//   console.log("buildings:", buildings);
//   console.log("levels:", levels);
//   console.log("zones:", zones);
//   console.log("flats:", flats);
//   console.log("rooms:", rooms);
//   console.log("purposes:", purposes);
//   console.log("phases:", phases);
//   console.log("stages:", stages);
//   console.log("categoryTree:", categoryTree);
//   console.log("questions:", questions);

//   // Remove a question (ChecklistItem)
//   const handleRemoveQuestion = async (qIdx, questionId) => {
//     console.log("🗑️ Attempting to delete question:", { qIdx, questionId });

//     if (questionId) {
//       try {
//         if (selectedRooms.length > 0) {
//           const confirmDelete = window.confirm(
//             "This will delete the question from ALL room checklists. Continue?"
//           );
//           if (!confirmDelete) return;
//         }

//         console.log(
//           `🗑️ DELETE URL: https://konstruct.world/checklists/items/${questionId}/`
//         );

//         await checklistInstance.delete(
//           `/items/${questionId}/`,
//           {
//             headers: {
//               Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );
//         console.log("✅ Question deleted successfully");
//         showToast("Question deleted successfully!");
//       } catch (err) {
//         console.error("❌ Delete question error:", err);
//         console.error("❌ Error response:", err.response?.data);
//         showToast("Failed to delete question", "error");
//         return;
//       }
//     } else {
//       console.log("🗑️ No question ID provided, only removing from UI");
//     }
//     setQuestions((prev) => prev.filter((_, idx) => idx !== qIdx));
//   };

//   // Remove an option (ChecklistItemOption)
//   const handleRemoveOption = async (qIdx, optIdx, optionId) => {
//     console.log("🗑️ Attempting to delete option:", { qIdx, optIdx, optionId });

//     if (optionId) {
//       try {
//         console.log(
//           `🗑️ DELETE URL: https://konstruct.world/checklists/options/${optionId}/`
//         );

//         await checklistInstance.delete(
//           `/options/${optionId}/`,
//           {
//             headers: {
//               Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );
//         console.log("✅ Option deleted successfully");
//         showToast("Option deleted successfully!");
//       } catch (err) {
//         console.error("❌ Delete option error:", err);
//         console.error("❌ Error response:", err.response?.data);
//         showToast("Failed to delete option", "error");
//         return;
//       }
//     } else {
//       console.log("🗑️ No option ID provided, only removing from UI");
//     }
//     setQuestions((prev) => {
//       const updated = [...prev];
//       updated[qIdx].options = updated[qIdx].options.filter(
//         (_, i) => i !== optIdx
//       );
//       return updated;
//     });
//   };

//   // ALL EXISTING useEffect HOOKS - NO CHANGES
//   useEffect(() => {
//     if (checklist) {
//       setProjectId(checklist.project || "");
//       setChecklistName(checklist.name || "");
//       setCategory(checklist.category || "");
//       setCat1(checklist.CategoryLevel1 || "");
//       setCat2(checklist.CategoryLevel2 || "");
//       setCat3(checklist.CategoryLevel3 || "");
//       setCat4(checklist.CategoryLevel4 || "");
//       setCat5(checklist.CategoryLevel5 || "");
//       setCat6(checklist.CategoryLevel6 || "");
//       setQuestions(
//         checklist.questions || [
//           { question: "", options: [], photo_required: false },
//         ]
//       );
//       setSelectedBuilding(checklist.building || "");
//       setSelectedLevel(checklist.level || "");
//       setSelectedZone(checklist.zone || "");
//       setSelectedFlat(checklist.flat || "");
//       setSelectedPurpose(checklist.purpose || "");
//       setSelectedPhase(checklist.phase || "");
//       setSelectedStage(checklist.stage || "");
//     }
//   }, [checklist]);

//   useEffect(() => {
//     if (!projectId) {
//       setCategoryTree([]);
//       setCategory("");
//       setCat1("");
//       setCat2("");
//       setCat3("");
//       setCat4("");
//       setCat5("");
//       setCat6("");
//       return;
//     }
//     getCategoryTreeByProject(projectId)
//       .then((res) => setCategoryTree(res.data || []))
//       .catch(() => {
//         setCategoryTree([]);
//         showToast("Failed to load categories", "error");
//       });
//   }, [projectId]);

//   useEffect(() => {
//     console.log("🔥 useEffect triggered with projectId:", projectId);
//     console.log("🔥 projectId type:", typeof projectId);
//     console.log("🔥 projectId truthy?", !!projectId);
//     if (!projectId) {
//       console.log("🔥 Early return - no projectId");
//       setBuildings([]);
//       setLevels([]);
//       setZones([]);
//       setFlats([]);
//       setPurposes([]);
//       setPhases([]);
//       setStages([]);
//       setRooms([]);
//       setSelectedBuilding("");
//       setSelectedLevel("");
//       setSelectedZone("");
//       setSelectedFlat("");
//       setSelectedPurpose("");
//       setSelectedPhase("");
//       setSelectedStage("");
//       setSelectedRoom("");
//       return;
//     }
//     console.log("🔥 Past the early return, will execute API calls");
//     allinfobuildingtoflat(projectId)
//       .then((res) => {
//         console.log("Buildings fetched:", res.data);
//         setBuildings(Array.isArray(res.data) ? res.data : []);
//       })
//       .catch(() => {
//         showToast("Failed to load buildings", "error");
//         setBuildings([]);
//       });
//     console.log(buildings, "this si response");

//     projectInstance.get(
//       `/purpose/get-purpose-details-by-project-id/${projectId}/`,
//       {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
//           "Content-Type": "application/json",
//         },
//       }
//     )
//       .then((res) => {
//         console.log("🚨 PURPOSES API RAW RESPONSE:", res.data);
//         console.log("🚨 PURPOSES API RESPONSE TYPE:", typeof res.data);
//         console.log("🚨 PURPOSES API IS ARRAY:", Array.isArray(res.data));

//         if (Array.isArray(res.data)) {
//           console.log("🚨 PURPOSES COUNT:", res.data.length);

//           res.data.forEach((purpose, index) => {
//             console.log(`🚨 Purpose ${index}:`, purpose);
//             console.log(
//               `🚨 Purpose ${index} id:`,
//               purpose.id,
//               typeof purpose.id
//             );
//             console.log(`🚨 Purpose ${index} name object:`, purpose.name);

//             console.log(
//               `🚨 Purpose ${index} name.purpose.name:`,
//               purpose.name?.purpose?.name
//             );
//             console.log(`🚨 Purpose ${index} name.name:`, purpose.name?.name);
//             console.log(
//               `🚨 Purpose ${index} purpose.name:`,
//               purpose.purpose?.name
//             );
//             console.log(`🚨 Purpose ${index} title:`, purpose.title);

//             const resolvedName =
//               purpose.name?.purpose?.name ||
//               purpose.name?.name ||
//               purpose.purpose?.name ||
//               purpose.title ||
//               `Purpose ${purpose.id}`;
//             console.log(`🎯 FINAL RESOLVED NAME for ${index}:`, resolvedName);
//           });
//         }

//         const purposesData = Array.isArray(res.data) ? res.data : [];
//         setPurposes(purposesData);

//         console.log("🎯 SETTING PURPOSES TO:", purposesData);
//         console.log("🎯 PURPOSES WILL BE LENGTH:", purposesData.length);

//         setTimeout(() => {
//           console.log("🔍 PURPOSES STATE AFTER UPDATE:", purposes);
//           console.log("🔍 PURPOSES LENGTH AFTER UPDATE:", purposes.length);
//         }, 100);
//       })
//       .catch((error) => {
//         console.error("❌ PURPOSES API ERROR:", error);
//         showToast("Failed to load purposes", "error");
//         setPurposes([]);
//       });

//     console.log("🚀 About to call rooms API with projectId:", projectId);
//     console.log(
//       "🚀 Rooms API URL:",
//       `https://konstruct.world/projects/rooms/by_project/?project_id=${projectId}`
//     );
//     projectInstance.get(
//       `/rooms/by_project/?project_id=${projectId}`,
//       {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
//           "Content-Type": "application/json",
//         },
//       }
//     )
//       .then((res) => {
//         console.log("🏠 Rooms API Response:", res.data);
//         console.log(
//           "🏠 Rooms count:",
//           Array.isArray(res.data) ? res.data.length : 0
//         );
//         console.log("🏠 Sample room:", res.data?.[0]);
//         setRooms(Array.isArray(res.data) ? res.data : []);
//       })
//       .catch((error) => {
//         console.error("🏠 Rooms API Error:", error);
//         showToast("Failed to load rooms", "error");
//         setRooms([]);
//       });
//     setLevels([]);
//     setZones([]);
//     setFlats([]);
//     setPhases([]);
//     setStages([]);
//     setSelectedBuilding("");
//     setSelectedLevel("");
//     setSelectedZone("");
//     setSelectedFlat("");
//     setSelectedPurpose("");
//     setSelectedPhase("");
//     setSelectedStage("");
//     console.log("🔥 Past the early return, will execute API calls");
//   }, [projectId]);

// useEffect(() => {
//   if (isEdit && checklist?.id) {
//     const fetchChecklistDetails = async () => {
//       try {
//         const response = await getChecklistById(checklist.id);
//         const checklistData = response.data;

//         setChecklistName(checklistData.name || "");
//         setSkipInitializer(checklistData.not_initialized || false);

//         setProjectId(checklistData.project_id || "");

//         setTimeout(() => {
//           setSelectedPurpose(checklistData.purpose_id || "");
//           setSelectedPhase(checklistData.phase_id || "");
//           setSelectedStage(checklistData.stage_id || "");
//           setCategory(checklistData.category || "");
//           setCat1(checklistData.category_level1 || "");
//           setCat2(checklistData.category_level2 || "");
//           setCat3(checklistData.category_level3 || "");
//           setCat4(checklistData.category_level4 || "");
//           setCat5(checklistData.category_level5 || "");
//           setCat6(checklistData.category_level6 || "");
//           setSelectedBuilding(checklistData.building_id || "");
//           setSelectedZone(checklistData.zone_id || "");
//           setSelectedFlat(checklistData.flat_id || "");
//           setSelectedRooms(
//             checklistData.rooms && checklistData.rooms.length > 0
//               ? checklistData.rooms.map((r) =>
//                   typeof r === "object" ? r.id : r
//                 )
//               : []
//           );
//         }, 500); 

//         if (checklistData.items && checklistData.items.length > 0) {
//           const formattedQuestions = checklistData.items.map((item) => ({
//             id: item.id,
//             question: item.title,
//             options: item.options
//               ? item.options.map((opt) => ({
//                   id: opt.id,
//                   value: opt.name,
//                   submission: opt.choice,
//                 }))
//               : [],
//             photo_required: item.photo_required || false,
//           }));
//           setQuestions(formattedQuestions);
//         }
//       } catch (error) {
//         showToast("Failed to load checklist details", "error");
//       }
//     };

//     fetchChecklistDetails();
//   }
// }, [isEdit, checklist?.id]);

//   useEffect(() => {
//     if (!selectedBuilding) {
//       setLevels([]);
//       setZones([]);
//       setFlats([]);
//       setSelectedLevel("");
//       setSelectedZone("");
//       setSelectedFlat("");
//       return;
//     }
//     const b = buildings.find((x) => String(x.id) === String(selectedBuilding));
//     setLevels(b?.levels || []);
//     setSelectedLevel("");
//     setSelectedZone("");
//     setSelectedFlat("");
//     console.log("Levels for building", selectedBuilding, b?.levels || []);
//   }, [selectedBuilding, buildings]);

//   useEffect(() => {
//     if (!selectedLevel) {
//       setZones([]);
//       setFlats([]);
//       setSelectedZone("");
//       setSelectedFlat("");
//       return;
//     }
//     const l = levels.find((x) => String(x.id) === String(selectedLevel));
//     setZones(l?.zones || []);
//     setSelectedZone("");
//     setSelectedFlat("");
//     console.log("Zones for level", selectedLevel, l?.zones || []);
//   }, [selectedLevel, levels]);

//   useEffect(() => {
//     if (!selectedZone) {
//       setFlats([]);
//       setSelectedFlat("");
//       return;
//     }
//     const z = zones.find((x) => String(x.id) === String(selectedZone));
//     setFlats(z?.flats || []);
//     setSelectedFlat("");
//     console.log("Flats for zone", selectedZone, z?.flats || []);
//   }, [selectedZone, zones]);

//   useEffect(() => {
//     if (!selectedPurpose) {
//       setPhases([]);
//       setStages([]);
//       setSelectedPhase("");
//       setSelectedStage("");
//       return;
//     }
//     getPhaseByPurposeId(selectedPurpose)
//       .then((res) => setPhases(res.data || []))
//       .catch(() => {
//         showToast("Failed to load phases", "error");
//         setPhases([]);
//       });
//     setStages([]);
//     setSelectedPhase("");
//     setSelectedStage("");
//   }, [selectedPurpose]);

//   useEffect(() => {
//     if (!selectedPhase) {
//       setStages([]);
//       setSelectedStage("");
//       return;
//     }
//     GetstagebyPhaseid(selectedPhase)
//       .then((res) => setStages(res.data || []))
//       .catch(() => {
//         showToast("Failed to load stages");
//         setStages([]);
//       });
//     setSelectedStage("");
//   }, [selectedPhase]);

//   // ALL EXISTING FUNCTIONS - NO CHANGES
//   const handleQuestionOptionAdd = (qIdx) => {
//     setQuestions((prev) => {
//       const updated = [...prev];
//       if (!updated[qIdx].options) {
//         updated[qIdx].options = [];
//       }
//       updated[qIdx].options.push({ value: "", submission: "P" });
//       return updated;
//     });
//   };

//   const handleQuestionOptionChange = (qIdx, key, value, optIdx) => {
//     setQuestions((prev) => {
//       const updated = [...prev];
//       if (!updated[qIdx].options) {
//         updated[qIdx].options = [];
//       }
//       if (!updated[qIdx].options[optIdx]) {
//         updated[qIdx].options[optIdx] = { value: "", submission: "P" };
//       }
//       updated[qIdx].options[optIdx][key] = value;
//       return updated;
//     });
//   };

//   const handleQuestionOptionRemove = (qIdx, optIdx) => {
//     setQuestions((prev) => {
//       const updated = [...prev];
//       if (updated[qIdx].options && updated[qIdx].options.length > optIdx) {
//         updated[qIdx].options = updated[qIdx].options.filter(
//           (_, idx) => idx !== optIdx
//         );
//       }
//       return updated;
//     });
//   };

//   const handleAddMoreQuestions = () => {
//     const toAdd = [];
//     for (let i = 0; i < numOfQuestions; i++) {
//       toAdd.push({
//         question: "",
//         options: [],
//         photo_required: false,
//       });
//     }
//     setQuestions([...questions, ...toAdd]);
//   };

//   const getLevelOptions = (levelKey) => {
//     if (levelKey === 1) {
//       return categoryTree;
//     }
//     if (levelKey === 2 && category) {
//       return (
//         categoryTree.find((cat) => String(cat.id) === String(category))
//           ?.level1 || []
//       );
//     }
//     if (levelKey === 3 && cat1) {
//       const catObj = categoryTree.find(
//         (cat) => String(cat.id) === String(category)
//       );
//       return (
//         catObj?.level1.find((l1) => String(l1.id) === String(cat1))?.level2 ||
//         []
//       );
//     }
//     if (levelKey === 4 && cat2) {
//       const catObj = categoryTree.find(
//         (cat) => String(cat.id) === String(category)
//       );
//       const cat1Obj = catObj?.level1.find(
//         (l1) => String(l1.id) === String(cat1)
//       );
//       return (
//         cat1Obj?.level2.find((l2) => String(l2.id) === String(cat2))?.level3 ||
//         []
//       );
//     }
//     if (levelKey === 5 && cat3) {
//       const catObj = categoryTree.find(
//         (cat) => String(cat.id) === String(category)
//       );
//       const cat1Obj = catObj?.level1.find(
//         (l1) => String(l1.id) === String(cat1)
//       );
//       const cat2Obj = cat1Obj?.level2.find(
//         (l2) => String(l2.id) === String(cat2)
//       );
//       return (
//         cat2Obj?.level3.find((l3) => String(l3.id) === String(cat3))?.level4 ||
//         []
//       );
//     }
//     if (levelKey === 6 && cat4) {
//       const catObj = categoryTree.find(
//         (cat) => String(cat.id) === String(category)
//       );
//       const cat1Obj = catObj?.level1.find(
//         (l1) => String(l1.id) === String(cat1)
//       );
//       const cat2Obj = cat1Obj?.level2.find(
//         (l2) => String(l2.id) === String(cat2)
//       );
//       const cat3Obj = cat2Obj?.level3.find(
//         (l3) => String(l3.id) === String(cat3)
//       );
//       return (
//         cat3Obj?.level4.find((l4) => String(l4.id) === String(cat4))?.level5 ||
//         []
//       );
//     }
//     return [];
//   };

//   const handleCategoryChange = (e) => {
//     setCategory(e.target.value);
//     setCat1("");
//     setCat2("");
//     setCat3("");
//     setCat4("");
//     setCat5("");
//     setCat6("");
//   };
//   const handleCat1Change = (e) => {
//     setCat1(e.target.value);
//     setCat2("");
//     setCat3("");
//     setCat4("");
//     setCat5("");
//     setCat6("");
//   };
//   const handleCat2Change = (e) => {
//     setCat2(e.target.value);
//     setCat3("");
//     setCat4("");
//     setCat5("");
//     setCat6("");
//   };
//   const handleCat3Change = (e) => {
//     setCat3(e.target.value);
//     setCat4("");
//     setCat5("");
//     setCat6("");
//   };
//   const handleCat4Change = (e) => {
//     setCat4(e.target.value);
//     setCat5("");
//     setCat6("");
//   };
//   const handleCat5Change = (e) => {
//     setCat5(e.target.value);
//     setCat6("");
//   };
//   const handleCat6Change = (e) => {
//     setCat6(e.target.value);
//   };

//   const handleRoomSelection = (roomId, isSelected) => {
//     if (isSelected) {
//       setSelectedRooms([...selectedRooms, roomId]);
//     } else {
//       setSelectedRooms(selectedRooms.filter((id) => id !== roomId));
//     }
//   };

//   const handleSelectAllRooms = () => {
//     setSelectedRooms(rooms.map((room) => room.id));
//   };

//   const handleClearAllRooms = () => {
//     setSelectedRooms([]);
//   };

//   useEffect(() => {
//     const userString = localStorage.getItem("USER_DATA");
//     if (userString && userString !== "undefined") {
//       const parsedUserData = JSON.parse(userString);
//       setUserData(parsedUserData);
//     }
//   }, []);
  
//   const handleCreateChecklist = async () => {
//     if (!checklistName.trim()) return showToast("Checklist name required!");
//     if (!projectId || projectId === "") return showToast("Select a project");
//     if (!selectedPurpose || selectedPurpose === "")
//       return showToast("Select a purpose");
//     if (!category || category === "") return showToast("Select a category");
//     if (!questions.length) return showToast("Add at least one question");
    
//     if (rooms.length > 0 && selectedRooms.length === 0) {
//       const shouldProceed = window.confirm(
//         "Rooms are available but none selected. This will create a single checklist without room assignment. Do you want to continue?"
//       );
//       if (!shouldProceed) return;
//     }

//     const parsedProjectId = parseInt(projectId);
//     const parsedPurposeId = parseInt(selectedPurpose);
//     const parsedCategoryId = parseInt(category);

//     if (isNaN(parsedProjectId)) return showToast("Invalid project selected");
//     if (isNaN(parsedPurposeId)) return showToast("Invalid purpose selected");
//     if (isNaN(parsedCategoryId)) return showToast("Invalid category selected");

//     console.log("Project ID:", parsedProjectId);

//     const checklistPayload = {
//       name: checklistName,
//       project_id: parsedProjectId,
//       purpose_id: parsedPurposeId,
//       phase_id:
//         selectedPhase && selectedPhase !== "" ? parseInt(selectedPhase) : null,
//       stage_id:
//         selectedStage && selectedStage !== "" ? parseInt(selectedStage) : null,
//       category: parsedCategoryId,
//       category_level1: cat1 && cat1 !== "" ? parseInt(cat1) : null,
//       category_level2: cat2 && cat2 !== "" ? parseInt(cat2) : null,
//       category_level3: cat3 && cat3 !== "" ? parseInt(cat3) : null,
//       category_level4: cat4 && cat4 !== "" ? parseInt(cat4) : null,
//       category_level5: cat5 && cat5 !== "" ? parseInt(cat5) : null,
//       category_level6: cat6 && cat6 !== "" ? parseInt(cat6) : null,
//       building_id:
//         selectedBuilding && selectedBuilding !== ""
//           ? parseInt(selectedBuilding)
//           : null,
//       zone_id:
//         selectedZone && selectedZone !== "" ? parseInt(selectedZone) : null,
//       flat_id:
//         selectedFlat && selectedFlat !== "" ? parseInt(selectedFlat) : null,
//       remarks: "",
//       not_initialized: skipInitializer,
//     };

//     console.log("=== CHECKLIST CREATION DEBUG ===");
//     console.log("isEdit:", isEdit);
//     console.log("checklistPayload:", checklistPayload);

//     try {
//       console.log("Payload being sent:", checklistPayload);

//       let checklistRes;
//       let checklistId;

// if (isEdit && checklist?.id) {
//   if (selectedRooms.length > 0) {
//     console.log("🔄 BULK UPDATE MODE - Delete + Recreate");

//     try {
//       await checklistInstance.delete(
//         `/checklists/${checklist.id}/`,
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );
//       console.log("✅ Old checklist deleted successfully");
//     } catch (deleteError) {
//       console.error("❌ Delete error:", deleteError);
//       showToast("Failed to delete old checklist", "error");
//       return;
//     }

//     const bulkPayload = {
//       ...checklistPayload,
//       description: checklistPayload.remarks || "Bulk checklist creation",
//       created_by_id: userData.user_id,
//       rooms: selectedRooms,
//       items: questions.map((q) => ({
//         title: q.question,
//         description: q.question,
//         status: "not_started",
//         ignore_now: false,
//         photo_required: q.photo_required || false,
//         options: (q.options || [])
//           .filter((opt) => opt.value && opt.value.trim() !== "")
//           .map((opt) => ({
//             name: opt.value,
//             choice: opt.submission,
//           })),
//       })),
//     };

//     checklistRes = await checklistInstance.post(
//       "/create/unit-chechklist/",
//       bulkPayload,
//       {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     showToast("Bulk checklist updated successfully!", "success");
//   } else {
//     console.log("🔄 SINGLE UPDATE MODE");
//     checklistRes = await updateChecklistById(
//       checklist.id,
//       checklistPayload
//     );
//     checklistId = checklist.id;
//     showToast("Checklist updated successfully!", "success");
//   }
// } else  {
//         console.log("🔍 Let's check what URL createChecklist function uses...");
//         console.log(
//           "🔍 Look in Network tab when creating single checklist to see the exact URL"
//         );

//       if (selectedRooms.length > 0) {

//   console.log("🚀 BULK CREATION MODE - ROOMS SELECTED");
//   const bulkPayload = {
//     ...checklistPayload,
//     description: checklistPayload.remarks || "Bulk checklist creation",
//     created_by_id: userData.user_id,
//     rooms: selectedRooms, 
//     items: questions.map((q) => ({
//       title: q.question,
//       description: q.question,
//       status: "not_started",
//       ignore_now: false,
//       photo_required: q.photo_required || false,
//       options: (q.options || [])
//         .filter((opt) => opt.value && opt.value.trim() !== "")
//         .map((opt) => ({
//           name: opt.value,
//           choice: opt.submission,
//         })),
//     })),
//   };
//   console.log("📦 Bulk Payload being sent:", bulkPayload);

//   checklistRes = await checklistInstance.post(
//     "/create/unit-chechklist/",
//     bulkPayload,
//     {
//       headers: {
//         Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
//         "Content-Type": "application/json",
//       },
//     }
//   );
//   console.log("✅ Bulk API Response:", checklistRes.data);
//   showToast(
//     `Checklists created for selected rooms successfully! Created ${
//       checklistRes.data.checklist_ids?.length || 0
//     } checklists`,
//     "success"
//   );
// } else {
//   console.log("🎯 SINGLE CREATION MODE - NO ROOMS");
//   checklistRes = await createChecklist(checklistPayload);
//   checklistId =
//     checklistRes.data?.id ||
//     checklistRes.data?.pk ||
//     checklistRes.data?.ID;
//   showToast("Checklist created successfully!", "success");
// }
//     }

//       if (
//         checklistRes.status === 201 ||
//         checklistRes.status === 200 ||
//         checklistRes.data?.id ||
//         checklistRes.data?.checklist_ids
//       ) {
//         console.log("🎉 SUCCESS CONDITION MET");
//         console.log("Response status:", checklistRes.status);
//         console.log("Has single ID:", !!checklistRes.data?.id);
//         console.log("Has bulk IDs:", !!checklistRes.data?.checklist_ids);

//         if (selectedRooms.length === 0 && !isEdit) {
//             for (let i = 0; i < questions.length; i++) {
//             const q = questions[i];

//             const itemRes = await createChecklistQuestion({
//               checklist: checklistId,
//               title: q.question,
//               photo_required: q.photo_required || false,
//               is_done: false,
//             });

//             const checklistItemId = itemRes.data?.id;

//             if (checklistItemId && q.options?.length) {
//               for (let option of q.options) {
//                 if (option.value && option.value.trim() !== "") {
//                   await createChecklistItemOPTIONSS({
//                     checklist_item: checklistItemId,
//                     name: option.value,
//                     choice: option.submission,
//                   });
//                 }
//               }
//             }
//           }
//         }

//         if (
//           !isEdit &&
//           onChecklistCreated &&
//           typeof onChecklistCreated === "function"
//         ) {
//           if (selectedRooms.length > 0) {
//             console.log("📤 Calling callback for BULK creation");
//             const createdChecklistData = {
//               ...checklistPayload,
//               id: checklistRes.data?.checklist_ids?.[0] || null,
//               project_id: parsedProjectId,
//               category_id: parsedCategoryId,
//               is_bulk: true,
//               checklist_count: checklistRes.data?.checklist_ids?.length || 0,
//             };
//             console.log("📤 Bulk callback data:", createdChecklistData);
//             onChecklistCreated(createdChecklistData);
//           } else {
//             const createdChecklistData = {
//               ...checklistPayload,
//               id: checklistId,
//               project_id: parsedProjectId,
//               category_id: parsedCategoryId,
//             };
//             console.log("📤 Single callback data:", createdChecklistData);
//             onChecklistCreated(createdChecklistData);
//           }
//         }

//         setShowForm(false);
//       } else {
//         console.error("Checklist creation failed:", checklistRes);
//         showToast(
//           checklistRes.data?.message || "Failed to create checklist",
//           "error"
//         );
//       }
//     } catch (error) {
//       console.error("Error creating checklist:", "error");

//       if (error.response) {
//         console.error("Error response:", error.response.data);
//         const errorMessage =
//           error.response.data?.message ||
//           error.response.data?.detail ||
//           `Server error: ${error.response.status}`;
//         showToast(errorMessage);
//       } else {
//         showToast(
//           "Failed to create checklist and questions. Please try again.",
//           "error"
//         );
//       }
//     }
//   };

//   // EXACT SAME BULK UPLOAD FUNCTION
//   const handleBulkUpload = (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (e) => {
//       try {
//         const data = new Uint8Array(e.target.result);
//         const workbook = XLSX.read(data, { type: "array" });
//         const sheetName = workbook.SheetNames[0];
//         const worksheet = workbook.Sheets[sheetName];
//         const jsonData = XLSX.utils.sheet_to_json(worksheet);

//         const bulkQuestions = [];

//         jsonData.forEach((row) => {
//           const question = row["Question"] || row["question"] || "";
//           const optionsString = row["Options"] || row["options"] || "";
//           const photoRequired =
//             row["PhotoRequired"] || row["photo_required"] || false;

//           const options = [];
//           if (optionsString) {
//             const optionPairs = optionsString.split("|");
//             optionPairs.forEach((pair) => {
//               const match = pair.match(/^(.+)\(([PN])\)$/);
//               if (match) {
//                 options.push({
//                   value: match[1].trim(),
//                   submission: match[2],
//                 });
//               }
//             });
//           }

//           if (question.trim()) {
//             bulkQuestions.push({
//               question: question.trim(),
//               options: options,
//               photo_required:
//                 photoRequired === true ||
//                 photoRequired === "true" ||
//                 photoRequired === "True",
//             });
//           }
//         });

//         if (bulkQuestions.length > 0) {
//           setQuestions([...questions, ...bulkQuestions]);
//           showToast(
//             `${bulkQuestions.length} questions uploaded successfully!`,
//             "success"
//           );
//         } else {
//           showToast("No valid questions found in the file", "error");
//         }

//         event.target.value = "";
//       } catch (error) {
//         showToast("Error reading file. Please check the format.", "error");
//       }
//     };
//     reader.readAsArrayBuffer(file);
//   };
  
//   console.log("🔍 DEBUG 8 - Final Render Check:");
//   console.log("All arrays are properly structured:", {
//   projectOptions: Array.isArray(projectOptions),
//   buildings: Array.isArray(buildings),
//   levels: Array.isArray(levels),
//   zones: Array.isArray(zones),
//   flats: Array.isArray(flats),
//   rooms: Array.isArray(rooms),
//   purposes: Array.isArray(purposes),
//   phases: Array.isArray(phases),
//   stages: Array.isArray(stages),
//   questions:Array.isArray(questions)
// });

// return (
//     <div className="flex min-h-screen" style={{ background: palette.bg }}>
//       <SideBarSetup />
//       <div 
//         className="flex-1 p-4 lg:p-8 transition-all duration-300"
//         style={{ marginLeft: `${contentMarginLeft}px` }}
//       >
//         <div
//           className={`w-full max-w-7xl mx-auto p-4 lg:p-8 rounded-2xl ${palette.shadow}`}
//           style={{ 
//             background: palette.card,
//             border: `2px solid ${ORANGE}`
//           }}
//         >
//           {/* Header */}
//           <div className="mb-8">
//             <div className="flex items-center justify-between mb-6">
//               <div className="flex items-center space-x-4">
//                 <div 
//                   className="p-3 rounded-xl"
//                   style={{ background: ORANGE }}
//                 >
//                   <svg
//                     className="w-7 h-7 text-white"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
//                     />
//                   </svg>
//                 </div>
//                 <div>
//                   <h1 className={`text-3xl font-bold`} style={{ color: palette.text }}>
//                     {isEdit ? "Edit Checklist" : "Create New Checklist"}
//                   </h1>
//                   <p className={`text-lg mt-1`} style={{ color: palette.textSecondary }}>
//                     {isEdit
//                       ? "Update checklist details and questions"
//                       : "Build comprehensive checklists for your projects"}
//                   </p>
//                 </div>
//               </div>
//               <button
//                 className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 ${palette.secondary} flex items-center space-x-2`}
//                 onClick={() => setShowForm(false)}
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
//                     d="M10 19l-7-7m0 0l7-7m-7 7h18"
//                   />
//                 </svg>
//                 <span>Back</span>
//               </button>
//             </div>
//           </div>
          
//           {/* Skip Initializer & Template Controls */}
//           <div className="mb-8 flex flex-col lg:flex-row gap-4">
//             {/* Template Download */}
//             <div
//               className={`flex-1 p-6 rounded-xl border-2 transition-all duration-300`}
//               style={{ 
//                 background: palette.card,
//                 borderColor: ORANGE
//               }}
//             >
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-4">
//                   <div 
//                     className="p-3 rounded-full"
//                     style={{ background: palette.info.split(' ')[0].replace('bg-', '') }}
//                   >
//                     <svg
//                       className="w-6 h-6 text-white"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
//                       />
//                     </svg>
//                   </div>
//                   <div>
//                     <h3 className={`font-bold text-xl`} style={{ color: palette.text }}>
//                       Questions Template
//                     </h3>
//                   </div>
//                 </div>
//                 <button
//                   onClick={() => {
//                     const link = document.createElement("a");
//                     link.href =
//                       'data:text/plain;charset=utf-8,Question,Options,PhotoRequired\n"What is the quality?","Good(P)|Bad(N)|Average(P)",false\n"Check alignment","Aligned(P)|Not Aligned(N)",true';
//                     link.download = "questions_template.csv";
//                     link.click();
//                   }}
//                   className={`px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 flex items-center space-x-3 ${palette.info}`}
//                 >
//                   <svg
//                     className="w-5 h-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
//                     />
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M8 21v-4a2 2 0 012-2h4a2 2 0 012 2v4"
//                     />
//                   </svg>
//                   <span>Flat</span>
//                 </label>
//                 <select
//                   className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 font-medium`}
//                   style={{
//                     background: palette.selectBg,
//                     color: palette.selectText,
//                     borderColor: ORANGE
//                   }}
//                   value={selectedFlat}
//                   onChange={(e) => {
//                     setSelectedFlat(e.target.value);
//                     console.log("Flat selected:", e.target.value);
//                   }}
//                 >
//                   <option value="">Select Flat</option>
//                   {flats.map((f) => (
//                     <option key={f.id} value={f.id}>
//                       {f.number}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             )}

//             {/* Rooms Selection Button */}
//             {rooms.length > 0 && (
//               <div>
//                 <label
//                   className={`block text-lg font-semibold mb-3 flex items-center space-x-3`}
//                   style={{ color: palette.text }}
//                 >
//                   <svg
//                     className="w-5 h-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
//                     />
//                   </svg>
//                   <span>Rooms ({selectedRooms.length} selected)</span>
//                 </label>
//                 <button
//                   type="button"
//                   onClick={() => setShowRoomsModal(true)}
//                   className={`w-full p-4 border-2 rounded-xl transition-all duration-300 hover:scale-105 font-medium text-left flex items-center justify-between`}
//                   style={{
//                     background: ORANGE,
//                     color: "white",
//                     borderColor: ORANGE
//                   }}
//                 >
//                   <span>
//                     {selectedRooms.length === 0
//                       ? "Select Rooms"
//                       : `${selectedRooms.length} room(s) selected`}
//                   </span>
//                   <svg
//                     className="w-5 h-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M19 9l-7 7-7-7"
//                     />
//                   </svg>
//                 </button>
//               </div>
//             )}

//             {/* Purpose Dropdown - FIXED CONDITION */}
//             {purposes.length > 0 && (
//               <div>
//                 <label
//                   className={`block text-lg font-semibold mb-3 flex items-center space-x-3`}
//                   style={{ color: palette.text }}
//                 >
//                   <svg
//                     className="w-5 h-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
//                     />
//                   </svg>
//                   <span>
//                     Purpose <span className="text-red-500">*</span>
//                   </span>
//                 </label>
//                 <select
//                   className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 font-medium`}
//                   style={{
//                     background: palette.selectBg,
//                     color: palette.selectText,
//                     borderColor: ORANGE
//                   }}
//                   value={selectedPurpose}
//                   onChange={(e) => setSelectedPurpose(e.target.value)}
//                 >
//                   <option value="">Select Purpose</option>
//                   {purposes.map((p) => {
//                     const purposeName =
//                       p.name?.purpose?.name ||
//                       p.name?.name ||
//                       `Purpose ${p.id}`;

//                     console.log("🎯 Rendering Purpose:", p);
//                     console.log("🎯 Purpose ID:", p.id);
//                     console.log("🎯 Resolved Purpose Name:", purposeName);

//                     return (
//                       <option key={p.id} value={p.id}>
//                         {purposeName}
//                       </option>
//                     );
//                   })}
//                 </select>
//               </div>
//             )}

//             {/* Phase Dropdown */}
//             {phases.length > 0 && (
//               <div>
//                 <label
//                   className={`block text-lg font-semibold mb-3 flex items-center space-x-3`}
//                   style={{ color: palette.text }}
//                 >
//                   <svg
//                     className="w-5 h-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
//                     />
//                   </svg>
//                   <span>Phase</span>
//                 </label>
//                 <select
//                   className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 font-medium`}
//                   style={{
//                     background: palette.selectBg,
//                     color: palette.selectText,
//                     borderColor: ORANGE
//                   }}
//                   value={selectedPhase}
//                   onChange={(e) => setSelectedPhase(e.target.value)}
//                 >
//                   <option value="">Select Phase</option>
//                   {phases.map((ph) => (
//                     <option key={ph.id} value={ph.id}>
//                       {ph.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             )}

//             {/* Stage Dropdown */}
//             {stages.length > 0 && (
//               <div>
//                 <label
//                   className={`block text-lg font-semibold mb-3 flex items-center space-x-3`}
//                   style={{ color: palette.text }}
//                 >
//                   <svg
//                     className="w-5 h-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M13 10V3L4 14h7v7l9-11h-7z"
//                     />
//                   </svg>
//                   <span>Stage</span>
//                 </label>
//                 <select
//                   className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 font-medium`}
//                   style={{
//                     background: palette.selectBg,
//                     color: palette.selectText,
//                     borderColor: ORANGE
//                   }}
//                   value={selectedStage}
//                   onChange={(e) => setSelectedStage(e.target.value)}
//                 >
//                   <option value="">Select Stage</option>
//                   {stages.map((st) => (
//                     <option key={st.id} value={st.id}>
//                       {st.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             )}

//             {/* Category Level 1 */}
//             <div>
//               <label
//                 className={`block text-lg font-semibold mb-3 flex items-center space-x-3`}
//                 style={{ color: palette.text }}
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
//                     d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
//                   />
//                 </svg>
//                 <span>
//                   Category <span className="text-red-500">*</span>
//                 </span>
//               </label>
//               <select
//                 className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 font-medium`}
//                 style={{
//                   background: palette.selectBg,
//                   color: palette.selectText,
//                   borderColor: ORANGE
//                 }}
//                 value={category}
//                 onChange={handleCategoryChange}
//               >
//                 {(() => {
//                   console.log("🔍 DEBUG 5 - Category Options Render Check:");
//                   const levelOptions = getLevelOptions(1);
//                   console.log("Category levelOptions:", levelOptions);
//                   console.log(
//                     "Category levelOptions type:",
//                     typeof levelOptions
//                   );
//                   console.log(
//                     "Category levelOptions isArray:",
//                     Array.isArray(levelOptions)
//                   );
//                   if (Array.isArray(levelOptions)) {
//                     levelOptions.forEach((opt, index) => {
//                       console.log(`Category ${index}:`, opt);
//                       console.log(
//                         `Category ${index} id:`,
//                         opt.id,
//                         typeof opt.id
//                       );
//                       console.log(
//                         `Category ${index} name:`,
//                         opt.name,
//                         typeof opt.name
//                       );
//                     });
//                   }
//                   return null;
//                 })()}
//                 <option value="">Select Category</option>
//                 {getLevelOptions(1).map((opt) => (
//                   <option key={opt.id} value={opt.id}>
//                     {opt.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Category Level 2 */}
//             {getLevelOptions(2).length > 0 && (
//               <div>
//                 <label
//                   className={`block text-lg font-semibold mb-3 flex items-center space-x-3`}
//                   style={{ color: palette.text }}
//                 >
//                   <svg
//                     className="w-5 h-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
//                     />
//                   </svg>
//                   <span>Category Level 2</span>
//                 </label>
//                 <select
//                   className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 font-medium`}
//                   style={{
//                     background: palette.selectBg,
//                     color: palette.selectText,
//                     borderColor: ORANGE
//                   }}
//                   value={cat1}
//                   onChange={handleCat1Change}
//                 >
//                   <option value="">Select Level 2</option>
//                   {getLevelOptions(2).map((opt) => (
//                     <option key={opt.id} value={opt.id}>
//                       {opt.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             )}

//             {/* Category Level 3 */}
//             {getLevelOptions(3).length > 0 && (
//               <div>
//                 <label
//                   className={`block text-lg font-semibold mb-3 flex items-center space-x-3`}
//                   style={{ color: palette.text }}
//                 >
//                   <svg
//                     className="w-5 h-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
//                     />
//                   </svg>
//                   <span>Category Level 3</span>
//                 </label>
//                 <select
//                   className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 font-medium`}
//                   style={{
//                     background: palette.selectBg,
//                     color: palette.selectText,
//                     borderColor: ORANGE
//                   }}
//                   value={cat2}
//                   onChange={handleCat2Change}
//                 >
//                   <option value="">Select Level 3</option>
//                   {getLevelOptions(3).map((opt) => (
//                     <option key={opt.id} value={opt.id}>
//                       {opt.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             )}

//             {/* Category Level 4 */}
//             {getLevelOptions(4).length > 0 && (
//               <div>
//                 <label
//                   className={`block text-lg font-semibold mb-3 flex items-center space-x-3`}
//                   style={{ color: palette.text }}
//                 >
//                   <svg
//                     className="w-5 h-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
//                     />
//                   </svg>
//                   <span>Category Level 4</span>
//                 </label>
//                 <select
//                   className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 font-medium`}
//                   style={{
//                     background: palette.selectBg,
//                     color: palette.selectText,
//                     borderColor: ORANGE
//                   }}
//                   value={cat3}
//                   onChange={handleCat3Change}
//                 >
//                   <option value="">Select Level 4</option>
//                   {getLevelOptions(4).map((opt) => (
//                     <option key={opt.id} value={opt.id}>
//                       {opt.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             )}

//             {/* Category Level 5 */}
//             {getLevelOptions(5).length > 0 && (
//               <div>
//                 <label
//                   className={`block text-lg font-semibold mb-3 flex items-center space-x-3`}
//                   style={{ color: palette.text }}
//                 >
//                   <svg
//                     className="w-5 h-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 713 12V7a4 4 0 014-4z"
//                     />
//                   </svg>
//                   <span>Category Level 5</span>
//                 </label>
//                 <select
//                   className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 font-medium`}
//                   style={{
//                     background: palette.selectBg,
//                     color: palette.selectText,
//                     borderColor: ORANGE
//                   }}
//                   value={cat4}
//                   onChange={handleCat4Change}
//                 >
//                   <option value="">Select Level 5</option>
//                   {getLevelOptions(5).map((opt) => (
//                     <option key={opt.id} value={opt.id}>
//                       {opt.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             )}

//             {/* Category Level 6 */}
//             {getLevelOptions(6).length > 0 && (
//               <div>
//                 <label
//                   className={`block text-lg font-semibold mb-3 flex items-center space-x-3`}
//                   style={{ color: palette.text }}
//                 >
//                   <svg
//                     className="w-5 h-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 713 12V7a4 4 0 714-4z"
//                     />
//                   </svg>
//                   <span>Category Level 6</span>
//                 </label>
//                 <select
//                   className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 font-medium`}
//                   style={{
//                     background: palette.selectBg,
//                     color: palette.selectText,
//                     borderColor: ORANGE
//                   }}
//                   value={cat5}
//                   onChange={handleCat5Change}
//                 >
//                   <option value="">Select Level 6</option>
//                   {getLevelOptions(6).map((opt) => (
//                     <option key={opt.id} value={opt.id}>
//                       {opt.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             )}
//           </div>

//           {/* Questions Section */}
//           <div className="mb-8">
//             <div className="mb-6">
//               <h2
//                 className={`text-2xl font-bold mb-4 flex items-center space-x-3`}
//                 style={{ color: palette.text }}
//               >
//                 <div 
//                   className="p-3 rounded-xl"
//                   style={{ background: ORANGE }}
//                 >
//                   <svg
//                     className="w-6 h-6 text-white"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                     />
//                   </svg>
//                 </div>
//                 <span>Questions & Options</span>
//               </h2>
//             </div>

//             {/* Add Questions Controls */}
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
//               <div className="lg:col-span-1">
//                 <label
//                   className={`block text-lg font-semibold mb-3`}
//                   style={{ color: palette.text }}
//                 >
//                   Add Questions
//                 </label>
//                 <div className="flex items-center space-x-3">
//                   <input
//                     type="number"
//                     className={`w-full p-3 border-2 rounded-xl transition-all duration-300 focus:ring-4 font-medium`}
//                     style={{
//                       background: palette.selectBg,
//                       color: palette.selectText,
//                       borderColor: ORANGE
//                     }}
//                     min={1}
//                     value={numOfQuestions}
//                     onChange={(e) => setNumOfQuestions(Number(e.target.value))}
//                   />
//                   <button
//                     onClick={handleAddMoreQuestions}
//                     className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 ${palette.success} flex items-center space-x-2`}
//                   >
//                     <MdAdd size={20} />
//                     <span>Add</span>
//                   </button>
//                 </div>
//               </div>

//               {/* Bulk Upload */}
//               <div className="lg:col-span-2">
//                 <label
//                   className={`block text-lg font-semibold mb-3`}
//                   style={{ color: palette.text }}
//                 >
//                   Bulk Upload Questions
//                 </label>
//                 <input
//                   type="file"
//                   accept=".xlsx,.xls,.csv"
//                   onChange={handleBulkUpload}
//                   className={`w-full p-3 border-2 rounded-xl transition-all duration-300 focus:ring-4 font-medium`}
//                   style={{
//                     background: palette.selectBg,
//                     color: palette.selectText,
//                     borderColor: ORANGE
//                   }}
//                 />
//               </div>
//             </div>

//             {/* Questions List */}
//             <div className="space-y-6">
//               {questions.map((q, qIdx) => (
//                 <div
//                   key={qIdx}
//                   className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] ${palette.shadow}`}
//                   style={{
//                     background: palette.card,
//                     borderColor: ORANGE,
//                     borderLeft: `6px solid ${ORANGE}`,
//                   }}
//                 >
//                   {/* DEBUG CHECKPOINT 6 - MOVED INSIDE THE DIV */}
//                   {(() => {
//                     console.log(
//                       "🔍 DEBUG 6 - Question Render Check for index:",
//                       qIdx
//                     );
//                     console.log(`Question ${qIdx}:`, q);
//                     console.log(
//                       `Question ${qIdx} question:`,
//                       q.question,
//                       typeof q.question
//                     );
//                     console.log(`Question ${qIdx} options:`, q.options);
//                     console.log(
//                       `Question ${qIdx} options isArray:`,
//                       Array.isArray(q.options)
//                     );
//                     console.log(`Question ${qIdx} id:`, q.id, typeof q.id);
//                     console.log(
//                       `Question ${qIdx} photo_required:`,
//                       q.photo_required,
//                       typeof q.photo_required
//                     );

//                     if (q.options && Array.isArray(q.options)) {
//                       q.options.forEach((opt, optIdx) => {
//                         console.log(`Question ${qIdx} Option ${optIdx}:`, opt);
//                         console.log(
//                           `Question ${qIdx} Option ${optIdx} id:`,
//                           opt.id,
//                           typeof opt.id
//                         );
//                         console.log(
//                           `Question ${qIdx} Option ${optIdx} value:`,
//                           opt.value,
//                           typeof opt.value
//                         );
//                         console.log(
//                           `Question ${qIdx} Option ${optIdx} submission:`,
//                           opt.submission,
//                           typeof opt.submission
//                         );
//                       });
//                     }
//                     return null;
//                   })()}
//                   <div className="flex items-center gap-6 mb-4">
//                     <div
//                       className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl text-white`}
//                       style={{ background: ORANGE }}
//                     >
//                       {qIdx + 1}
//                     </div>
//                     <input
//                       type="text"
//                       placeholder={`Enter your question ${qIdx + 1}`}
//                       className={`flex-1 p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 font-medium text-lg`}
//                       style={{
//                         background: palette.selectBg,
//                         color: palette.selectText,
//                         borderColor: ORANGE
//                       }}
//                       value={q.question}
//                       onChange={(e) =>
//                         setQuestions((prev) => {
//                           const updated = [...prev];
//                           updated[qIdx] = {
//                             ...updated[qIdx],
//                             question: e.target.value,
//                           };
//                           return updated;
//                         })
//                       }
//                     />

//                     {/* Photo Required Toggle */}
//                     <label className="flex items-center space-x-3 cursor-pointer">
//                       <input
//                         type="checkbox"
//                         checked={!!q.photo_required}
//                         onChange={(e) =>
//                           setQuestions((prev) => {
//                             const updated = [...prev];
//                             updated[qIdx] = {
//                               ...updated[qIdx],
//                               photo_required: e.target.checked,
//                             };
//                             return updated;
//                           })
//                         }
//                         className="w-5 h-5 text-purple-600 bg-white border-2 border-purple-300 rounded focus:ring-purple-500 focus:ring-2"
//                       />
//                       <div className="flex items-center space-x-2">
//                         <svg
//                           className="w-5 h-5 text-purple-600"
//                           fill="none"
//                           stroke="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
//                           />
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
//                           />
//                         </svg>
//                         <span className="font-semibold text-purple-800">
//                           Photo Required
//                         </span>
//                       </div>
//                     </label>

//                     <button
//                       className={`p-3 rounded-xl transition-all duration-200 hover:scale-110 ${palette.danger}`}
//                       onClick={() => {
//                         if (questions.length === 1) {
//                           showToast(
//                             "At least one question is required",
//                             "error"
//                           );
//                           return;
//                         }
//                         handleRemoveQuestion(qIdx, q.id);
//                       }}
//                       title="Remove Question"
//                     >
//                       <MdDelete size={20} />
//                     </button>
//                   </div>

//                   {/* Options */}
//                   <div className="ml-18 space-y-3">
//                     <div className="flex flex-wrap gap-3">
//                       {(q.options || []).map((option, optIdx) => (
//                         <div
//                           key={option.id || optIdx}
//                           className="flex items-center gap-3 p-3 border-2 rounded-xl bg-white"
//                           style={{ borderColor: ORANGE }}
//                         >
//                           <input
//                             type="text"
//                             placeholder="Add Option"
//                             className="flex-1 outline-none border-none font-medium"
//                             value={option.value || ""}
//                             onChange={(e) =>
//                               handleQuestionOptionChange(
//                                 qIdx,
//                                 "value",
//                                 e.target.value,
//                                 optIdx
//                               )
//                             }
//                           />
//                           <select
//                             value={option.submission || "P"}
//                             onChange={(e) =>
//                               handleQuestionOptionChange(
//                                 qIdx,
//                                 "submission",
//                                 e.target.value,
//                                 optIdx
//                               )
//                             }
//                             className={`px-3 py-2 rounded-lg font-bold text-white border-none ${
//                               option.submission === "P"
//                                 ? "bg-green-500"
//                                 : "bg-red-500"
//                             }`}
//                           >
//                             <option value="P">P</option>
//                             <option value="N">N</option>
//                           </select>
//                           <button
//                             className="text-red-600 hover:text-red-800 p-1"
//                             onClick={() =>
//                               handleRemoveOption(
//                                 qIdx,
//                                 optIdx,
//                                 option.id
//                               )
//                             }
//                             title="Remove Option"
//                           >
//                             <MdDelete size={18} />
//                           </button>
//                         </div>
//                       ))}
//                       <button
//                         className={`px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 flex items-center space-x-2`}
//                         style={{
//                           background: ORANGE,
//                           color: "white"
//                         }}
//                         onClick={() => handleQuestionOptionAdd(qIdx)}
//                         type="button"
//                       >
//                         <MdAdd size={18} />
//                         <span>Add Option</span>
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Create Button */}
//           <div className="flex justify-center">
//             <button
//               className={`px-12 py-4 rounded-xl font-bold text-xl transition-all duration-300 hover:scale-105 flex items-center space-x-4 shadow-lg`}
//               style={{
//                 background: ORANGE,
//                 color: "white"
//               }}
//               onClick={handleCreateChecklist}
//             >
//               <svg
//                 className="w-6 h-6"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
//                 />
//               </svg>
//               <span>{isEdit ? "Update Checklist" : "Create Checklist"}</span>
//             </button>
//           </div>

//           {/* Rooms Selection Modal */}
//           {showRoomsModal && (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//               <div
//                 className={`w-full max-w-2xl rounded-2xl ${palette.shadow} border-2 max-h-[80vh] overflow-hidden`}
//                 style={{
//                   background: palette.card,
//                   borderColor: ORANGE
//                 }}
//               >
//                 {/* Modal Header */}
//                 <div
//                   className={`p-6 border-b-2 flex items-center justify-between`}
//                   style={{ borderColor: ORANGE }}
//                 >
//                   <div className="flex items-center space-x-3">
//                     <div 
//                       className="p-3 rounded-xl"
//                       style={{ background: ORANGE }}
//                     >
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
//                           d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
//                         />
//                       </svg>
//                     </div>
//                     <div>
//                       <h3 className={`text-2xl font-bold`} style={{ color: palette.text }}>
//                         Select Rooms
//                       </h3>
//                       <p style={{ color: palette.textSecondary }}>
//                         Choose multiple rooms for this checklist
//                       </p>
//                     </div>
//                   </div>
//                   <button
//                     onClick={() => setShowRoomsModal(false)}
//                     className={`p-2 rounded-xl transition-all duration-200 hover:scale-110 ${palette.danger}`}
//                   >
//                     <svg
//                       className="w-6 h-6"
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

//                 {/* Modal Content */}
//                 <div className="p-6 overflow-y-auto max-h-96">
//                   {/* Action Buttons */}
//                   <div className="flex gap-3 mb-6">
//                     <button
//                       onClick={handleSelectAllRooms}
//                       className={`px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105 ${palette.success} flex items-center space-x-2`}
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
//                           d="M5 13l4 4L19 7"
//                         />
//                       </svg>
//                       <span>Select All</span>
//                     </button>
//                     <button
//                       onClick={handleClearAllRooms}
//                       className={`px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105 ${palette.secondary} flex items-center space-x-2`}
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
//                       <span>Clear All</span>
//                     </button>
//                   </div>

//                   {/* Rooms Grid */}
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {rooms.map((room) => (
//                       <label
//                         key={room.id}
//                         className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105`}
//                         style={{
//                           background: selectedRooms.includes(room.id) 
//                             ? `${ORANGE}20` 
//                             : palette.card,
//                           borderColor: selectedRooms.includes(room.id) 
//                             ? ORANGE 
//                             : '#ddd'
//                         }}
//                       >
//                         <div className="flex items-center space-x-3">
//                           <input
//                             type="checkbox"
//                             checked={selectedRooms.includes(room.id)}
//                             onChange={(e) =>
//                               handleRoomSelection(room.id, e.target.checked)
//                             }
//                             className="w-5 h-5 text-emerald-600 bg-white border-2 border-emerald-300 rounded focus:ring-emerald-500 focus:ring-2"
//                           />
//                           <div className="flex-1">
//                             <span className={`font-semibold`} style={{ color: palette.text }}>
//                               {room.rooms}
//                             </span>
//                             <p className={`text-sm`} style={{ color: palette.textSecondary }}>
//                               Room ID: {room.id}
//                             </p>
//                           </div>
//                           {selectedRooms.includes(room.id) && (
//                             <svg
//                               className="w-5 h-5"
//                               style={{ color: ORANGE }}
//                               fill="none"
//                               stroke="currentColor"
//                               viewBox="0 0 24 24"
//                             >
//                               <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeWidth={2}
//                                 d="M5 13l4 4L19 7"
//                               />
//                             </svg>
//                           )}
//                         </div>
//                         {(() => {
//                           console.log("🔍 DEBUG 7 - Room Render Check:");
//                           console.log(`Room:`, room);
//                           console.log(`Room id:`, room.id, typeof room.id);
//                           console.log(
//                             `Room rooms:`,
//                             room.rooms,
//                             typeof room.rooms
//                           );
//                           return null;
//                         })()}
//                       </label>
//                     ))}
//                   </div>
//                 </div>

//                 <div
//                   className={`p-6 border-t-2 flex justify-between items-center`}
//                   style={{ borderColor: ORANGE }}
//                 >
//                   <span style={{ color: palette.textSecondary }}>
//                     {selectedRooms.length} of {rooms.length} rooms selected
//                   </span>
//                   <button
//                     onClick={() => setShowRoomsModal(false)}
//                     className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 flex items-center space-x-2`}
//                     style={{
//                       background: ORANGE,
//                       color: "white"
//                     }}
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
//                         d="M5 13l4 4L19 7"
//                       />
//                     </svg>
//                     <span>Done</span>
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChecklistForm; 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
//                     />
//                   </svg>
//                   <span>Download</span>
//                 </button>
//               </div>
//             </div>

//             {/* Skip Initializer */}
//             <div
//               className={`flex-1 p-6 rounded-xl border-2 transition-all duration-300`}
//               style={{ 
//                 background: palette.card,
//                 borderColor: ORANGE
//               }}
//             >
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-4">
//                   <div 
//                     className="p-3 rounded-full"
//                     style={{ background: palette.warning.split(' ')[0].replace('bg-', '') }}
//                   >
//                     <svg
//                       className="w-6 h-6 text-white"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M13 10V3L4 14h7v7l9-11h-7z"
//                       />
//                     </svg>
//                   </div>
//                   <div>
//                     <h3 className={`font-bold text-xl`} style={{ color: palette.text }}>
//                       Skip Initializer
//                     </h3>
//                   </div>
//                 </div>
//                 <button
//                   className={`px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 flex items-center space-x-3 ${
//                     skipInitializer ? palette.success : palette.warning
//                   }`}
//                   type="button"
//                   onClick={() => setSkipInitializer(!skipInitializer)}
//                 >
//                   {skipInitializer ? (
//                     <>
//                       <svg
//                         className="w-5 h-5"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M5 13l4 4L19 7"
//                         />
//                       </svg>
//                       <span>✓ Enabled</span>
//                     </>
//                   ) : (
//                     <>
//                       <svg
//                         className="w-5 h-5"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M13 10V3L4 14h7v7l9-11h-7z"
//                         />
//                       </svg>
//                       <span>Enable</span>
//                     </>
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Checklist Name Input */}
//           <div className="mb-8">
//             <label
//               className={`block font-bold text-xl mb-3 flex items-center space-x-3`}
//               style={{ color: palette.text }}
//             >
//               <svg
//                 className="w-6 h-6"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
//                 />
//               </svg>
//               <span>
//                 Checklist Name <span className="text-red-500">*</span>
//               </span>
//             </label>
//             <input
//               type="text"
//               className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 font-medium text-lg`}
//               style={{
//                 background: palette.selectBg,
//                 color: palette.selectText,
//                 borderColor: ORANGE
//               }}
//               placeholder="Enter a descriptive name for your checklist"
//               value={checklistName}
//               onChange={(e) => setChecklistName(e.target.value)}
//               required
//             />
//           </div>

//           {/* Show the checklist name as heading if filled */}
//           {checklistName && (
//             <div
//               className={`mb-6 p-4 rounded-xl border-2 text-xl font-bold text-center`}
//               style={{
//                 background: ORANGE,
//                 color: "white",
//                 borderColor: ORANGE
//               }}
//             >
//               📋 {checklistName}
//             </div>
//           )}

//           {/* Flat name display */}
//           {selectedFlatObj && (
//             <div 
//               className="mb-6 p-4 rounded-xl border-2 text-lg font-bold text-center"
//               style={{
//                 background: `${ORANGE}20`,
//                 borderColor: ORANGE,
//                 color: palette.text
//               }}
//             >
//               🏠 Selected Flat: {selectedFlatObj.number}
//             </div>
//           )}

//           {/* Project & Hierarchy Form */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//             {/* Project Dropdown */}
//             <div>
//               <label
//                 className={`block text-lg font-semibold mb-3 flex items-center space-x-3`}
//                 style={{ color: palette.text }}
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
//                 <span>
//                   Project <span className="text-red-500">*</span>
//                 </span>
//               </label>
//               <select
//                 className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 font-medium`}
//                 style={{
//                   background: palette.selectBg,
//                   color: palette.selectText,
//                   borderColor: ORANGE
//                 }}
//                 value={projectId}
//                 onChange={(e) => {
//                   console.log("🎯 Project dropdown changed!");
//                   console.log("🎯 Old projectId:", projectId);
//                   console.log("🎯 New value:", e.target.value);
//                   console.log("🎯 Setting projectId to:", e.target.value);
//                   setProjectId(e.target.value);
//                 }}
//               >
//                 {(() => {
//                   console.log("🔍 DEBUG 2 - Project Options Render Check:");
//                   console.log("projectOptions type:", typeof projectOptions);
//                   console.log(
//                     "projectOptions isArray:",
//                     Array.isArray(projectOptions)
//                   );
//                   if (Array.isArray(projectOptions)) {
//                     projectOptions.forEach((proj, index) => {
//                       console.log(`Project ${index}:`, proj);
//                       console.log(
//                         `Project ${index} id:`,
//                         proj.id,
//                         typeof proj.id
//                       );
//                       console.log(
//                         `Project ${index} name:`,
//                         proj.name,
//                         typeof proj.name
//                       );
//                     });
//                   }
//                   return null;
//                 })()}
//                 <option value="">Select Project</option>
//                 {(Array.isArray(projectOptions) ? projectOptions : []).map(
//                   (proj) => (
//                     <option key={proj.id} value={proj.id}>
//                       {proj.name}
//                     </option>
//                   )
//                 )}
//               </select>
//             </div>

//             {/* Building Dropdown */}
//             {buildings.length > 0 && (
//               <div>
//                 <label
//                   className={`block text-lg font-semibold mb-3 flex items-center space-x-3`}
//                   style={{ color: palette.text }}
//                 >
//                   <svg
//                     className="w-5 h-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
//                     />
//                   </svg>
//                   <span>Tower / Building</span>
//                 </label>
//                 <select
//                   className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 font-medium`}
//                   style={{
//                     background: palette.selectBg,
//                     color: palette.selectText,
//                     borderColor: ORANGE
//                   }}
//                   value={selectedBuilding}
//                   onChange={(e) => {
//                     setSelectedBuilding(e.target.value);
//                     console.log("Building selected:", e.target.value);
//                   }}
//                 >
//                   {(() => {
//                     console.log("🔍 DEBUG 3 - Buildings Render Check:");
//                     console.log("buildings type:", typeof buildings);
//                     console.log("buildings isArray:", Array.isArray(buildings));
//                     if (Array.isArray(buildings)) {
//                       buildings.forEach((b, index) => {
//                         console.log(`Building ${index}:`, b);
//                         console.log(`Building ${index} id:`, b.id, typeof b.id);
//                         console.log(
//                           `Building ${index} name:`,
//                           b.name,
//                           typeof b.name
//                         );
//                       });
//                     }
//                     return null;
//                   })()}
//                   <option value="">Select Building</option>
//                   {(Array.isArray(buildings) ? buildings : []).map((b) => (
//                     <option key={b.id} value={b.id}>
//                       {b.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             )}

//             {/* Level Dropdown */}
//             {levels.length > 0 && (
//               <div>
//                 <label
//                   className={`block text-lg font-semibold mb-3 flex items-center space-x-3`}
//                   style={{ color: palette.text }}
//                 >
//                   <svg
//                     className="w-5 h-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M7 16V4m0 0L3 8l4-4 4 4m-4-4v12"
//                     />
//                   </svg>
//                   <span>Level</span>
//                 </label>
//                 <select
//                   className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 font-medium`}
//                   style={{
//                     background: palette.selectBg,
//                     color: palette.selectText,
//                     borderColor: ORANGE
//                   }}
//                   value={selectedLevel}
//                   onChange={(e) => {
//                     setSelectedLevel(e.target.value);
//                     console.log("Level selected:", e.target.value);
//                   }}
//                 >
//                   <option value="">Select Level</option>
//                   {levels.map((l) => (
//                     <option key={l.id} value={l.id}>
//                       {l.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             )}

//             {/* Zone Dropdown */}
//             {zones.length > 0 && (
//               <div>
//                 <label
//                   className={`block text-lg font-semibold mb-3 flex items-center space-x-3`}
//                   style={{ color: palette.text }}
//                 >
//                   <svg
//                     className="w-5 h-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
//                     />
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
//                     />
//                   </svg>
//                   <span>Zone</span>
//                 </label>
//                 <select
//                   className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 font-medium`}
//                   style={{
//                     background: palette.selectBg,
//                     color: palette.selectText,
//                     borderColor: ORANGE
//                   }}
//                   value={selectedZone}
//                   onChange={(e) => {
//                     setSelectedZone(e.target.value);
//                     console.log("Zone selected:", e.target.value);
//                   }}
//                 >
//                   <option value="">Select Zone</option>
//                   {zones.map((z) => (
//                     <option key={z.id} value={z.id}>
//                       {z.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             )}

//             {/* Flat Dropdown */}
//             {flats.length > 0 && (
//               <div>
//                 <label
//                   className={`block text-lg font-semibold mb-3 flex items-center space-x-3`}
//                   style={{ color: palette.text }}
//                 >
//                   <svg
//                     className="w-5 h-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
//                     />
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M8 21v-4a2 2 0 012-2h4a2 2 0 012 2v4"
//                     />
//                   </svg>
//                   <span>Flat</span>
//                 </label>
//                 <select
//                   className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 font-medium`}
//                   style={{
//                     background: palette.selectBg,
//                     color: palette.selectText,
//                     borderColor: ORANGE
//                   }}
//                   value={selectedFlat}
//                   onChange={(e) => {
//                     setSelectedFlat(e.target.value);
//                     console.log("Flat selected:", e.target.value);
//                   }}
//                 >
//                   <option value="">Select Flat</option>
//                   {flats.map((f) => (
//                     <option key={f.id} value={f.id}>
//                       {f.number}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             )}

//             {/* Rooms Selection Button */}
//             {rooms.length > 0 && (
//               <div>
//                 <label
//                   className={`block text-lg font-semibold mb-3 flex items-center space-x-3`}
//                   style={{ color: palette.text }}
//                 >
//                   <svg
//                     className="w-5 h-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
//                     />
//                   </svg>
//                   <span>Rooms ({selectedRooms.length} selected)</span>
//                 </label>
//                 <button
//                   type="button"
//                   onClick={() => setShowRoomsModal(true)}
//                   className={`w-full p-4 border-2 rounded-xl transition-all duration-300 hover:scale-105 font-medium text-left flex items-center justify-between`}
//                   style={{
//                     background: ORANGE,
//                     color: "white",
//                     borderColor: ORANGE
//                   }}
//                 >
//                   <span>
//                     {selectedRooms.length === 0
//                       ? "Select Rooms"
//                       : `${selectedRooms.length} room(s) selected`}
//                   </span>
//                   <svg
//                     className="w-5 h-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M19 9l-7 7-7-7"
//                     />
//                   </svg>
//                 </button>
//               </div>
//             )}

//             {/* Purpose Dropdown - FIXED CONDITION */}
//             {purposes.length > 0 && (
//               <div>
//                 <label
//                   className={`block text-lg font-semibold mb-3 flex items-center space-x-3`}
//                   style={{ color: palette.text }}
//                 >
//                   <svg
//                     className="w-5 h-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
//                     />
//                   </svg>
//                   <span>
//                     Purpose <span className="text-red-500">*</span>
//                   </span>
//                 </label>
//                 <select
//                   className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 font-medium`}
//                   style={{
//                     background: palette.selectBg,
//                     color: palette.selectText,
//                     borderColor: ORANGE
//                   }}
//                   value={selectedPurpose}
//                   onChange={(e) => setSelectedPurpose(e.target.value)}
//                 >
//                   <option value="">Select Purpose</option>
//                   {purposes.map((p) => {
//                     const purposeName =
//                       p.name?.purpose?.name ||
//                       p.name?.name ||
//                       `Purpose ${p.id}`;

//                     console.log("🎯 Rendering Purpose:", p);
//                     console.log("🎯 Purpose ID:", p.id);
//                     console.log("🎯 Resolved Purpose Name:", purposeName);

//                     return (
//                       <option key={p.id} value={p.id}>
//                         {purposeName}
//                       </option>
//                     );
//                   })}
//                 </select>
//               </div>
//             )}

//             {/* Phase Dropdown */}
//             {phases.length > 0 && (
//               <div>
//                 <label
//                   className={`block text-lg font-semibold mb-3 flex items-center space-x-3`}
//                   style={{ color: palette.text }}
//                 >
//                   <svg
//                     className="w-5 h-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
//                     />
//                   </svg>
//                   <span>Phase</span>
//                 </label>
//                 <select
//                   className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 font-medium`}
//                   style={{
//                     background: palette.selectBg,
//                     color: palette.selectText,
//                     borderColor: ORANGE
//                   }}
//                   value={selectedPhase}
//                   onChange={(e) => setSelectedPhase(e.target.value)}
//                 >
//                   <option value="">Select Phase</option>
//                   {phases.map((ph) => (
//                     <option key={ph.id} value={ph.id}>
//                       {ph.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             )}

//             {/* Stage Dropdown */}
//             {stages.length > 0 && (
//               <div>
//                 <label
//                   className={`block text-lg font-semibold mb-3 flex items-center space-x-3`}
//                   style={{ color: palette.text }}
//                 >
//                   <svg
//                     className="w-5 h-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M13 10V3L4 14h7v7l9-11h-7z"
//                     />
//                   </svg>
//                   <span>Stage</span>
//                 </label>
//                 <select
//                   className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 font-medium`}
//                   style={{
//                     background: palette.selectBg,
//                     color: palette.selectText,
//                     borderColor: ORANGE
//                   }}
//                   value={selectedStage}
//                   onChange={(e) => setSelectedStage(e.target.value)}
//                 >
//                   <option value="">Select Stage</option>
//                   {stages.map((st) => (
//                     <option key={st.id} value={st.id}>
//                       {st.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             )}

//             {/* Category Level 1 */}
//             <div>
//               <label
//                 className={`block text-lg font-semibold mb-3 flex items-center space-x-3`}
//                 style={{ color: palette.text }}
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
//                     d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
//                   />
//                 </svg>
//                 <span>
//                   Category <span className="text-red-500">*</span>
//                 </span>
//               </label>
//               <select
//                 className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 font-medium`}
//                 style={{
//                   background: palette.selectBg,
//                   color: palette.selectText,
//                   borderColor: ORANGE
//                 }}
//                 value={category}
//                 onChange={handleCategoryChange}
//               >
//                 {(() => {
//                   console.log("🔍 DEBUG 5 - Category Options Render Check:");
//                   const levelOptions = getLevelOptions(1);
//                   console.log("Category levelOptions:", levelOptions);
//                   console.log(
//                     "Category levelOptions type:",
//                     typeof levelOptions
//                   );
//                   console.log(
//                     "Category levelOptions isArray:",
//                     Array.isArray(levelOptions)
//                   );
//                   if (Array.isArray(levelOptions)) {
//                     levelOptions.forEach((opt, index) => {
//                       console.log(`Category ${index}:`, opt);
//                       console.log(
//                         `Category ${index} id:`,
//                         opt.id,
//                         typeof opt.id
//                       );
//                       console.log(
//                         `Category ${index} name:`,
//                         opt.name,
//                         typeof opt.name
//                       );
//                     });
//                   }
//                   return null;
//                 })()}
//                 <option value="">Select Category</option>
//                 {getLevelOptions(1).map((opt) => (
//                   <option key={opt.id} value={opt.id}>
//                     {opt.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Category Level 2 */}
//             {getLevelOptions(2).length > 0 && (
//               <div>
//                 <label
//                   className={`block text-lg font-semibold mb-3 flex items-center space-x-3`}
//                   style={{ color: palette.text }}
//                 >
//                   <svg
//                     className="w-5 h-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
//                     />
//                   </svg>
//                   <span>Category Level 2</span>
//                 </label>
//                 <select
//                   className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 font-medium`}
//                   style={{
//                     background: palette.selectBg,
//                     color: palette.selectText,
//                     borderColor: ORANGE
//                   }}
//                   value={cat1}
//                   onChange={handleCat1Change}
//                 >
//                   <option value="">Select Level 2</option>
//                   {getLevelOptions(2).map((opt) => (
//                     <option key={opt.id} value={opt.id}>
//                       {opt.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             )}

//             {/* Category Level 3 */}
//             {getLevelOptions(3).length > 0 && (
//               <div>
//                 <label
//                   className={`block text-lg font-semibold mb-3 flex items-center space-x-3`}
//                   style={{ color: palette.text }}
//                 >
//                   <svg
//                     className="w-5 h-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 713 12V7a4 4 0 014-4z"
//                     />
//                   </svg>
//                   <span>Category Level 3</span>
//                 </label>
//                 <select
//                   className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 font-medium`}
//                   style={{
//                     background: palette.selectBg,
//                     color: palette.selectText,
//                     borderColor: ORANGE
//                   }}
//                   value={cat2}
//                   onChange={handleCat2Change}
//                 >
//                   <option value="">Select Level 3</option>
//                   {getLevelOptions(3).map((opt) => (
//                     <option key={opt.id} value={opt.id}>
//                       {opt.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             )}

//             {/* Category Level 4 */}
//             {getLevelOptions(4).length > 0 && (
//               <div>
//                 <label
//                   className={`block text-lg font-semibold mb-3 flex items-center space-x-3`}
//                   style={{ color: palette.text }}
//                 >
//                   <svg
//                     className="w-5 h-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 713 12V7a4 4 0 714-4z"
//                     />
//                   </svg>
//                   <span>Category Level 4</span>
//                 </label>
//                 <select
//                   className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 font-medium`}
//                   style={{
//                     background: palette.selectBg,
//                     color: palette.selectText,
//                     borderColor: ORANGE
//                   }}
//                   value={cat3}
//                   onChange={handleCat3Change}
//                 >
//                   <option value="">Select Level 4</option>
//                   {getLevelOptions(4).map((opt) => (
//                     <option key={opt.id} value={opt.id}>
//                       {opt.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             )}

//             {/* Category Level 5 */}
//             {getLevelOptions(5).length > 0 && (
//               <div>
//                 <label
//                   className={`block text-lg font-semibold mb-3 flex items-center space-x-3`}
//                   style={{ color: palette.text }}
//                 >
//                   <svg
//                     className="w-5 h-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 713 12V7a4 4 0 714-4z"
//                     />
//                   </svg>
//                   <span>Category Level 5</span>
//                 </label>
//                 <select
//                   className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 font-medium`}
//                   style={{
//                     background: palette.selectBg,
//                     color: palette.selectText,
//                     borderColor: ORANGE
//                   }}
//                   value={cat4}
//                   onChange={handleCat4Change}
//                 >
//                   <option value="">Select Level 5</option>
//                   {getLevelOptions(5).map((opt) => (
//                     <option key={opt.id} value={opt.id}>
//                       {opt.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             )}

//             {/* Category Level 6 */}
//             {getLevelOptions(6).length > 0 && (
//               <div>
//                 <label
//                   className={`block text-lg font-semibold mb-3 flex items-center space-x-3`}
//                   style={{ color: palette.text }}
//                 >
//                   <svg
//                     className="w-5 h-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 713 12V7a4 4 0 714-4z"
//                     />
//                   </svg>
//                   <span>Category Level 6</span>
//                 </label>
//                 <select
//                   className={`w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 font-medium`}
//                   style={{
//                     background: palette.selectBg,
//                     color: palette.selectText,
//                     borderColor: ORANGE
//                   }}
//                   value={cat5}
//                   onChange={handleCat5Change}
//                 >
//                   <option value="">Select Level 6</option>
//                   {getLevelOptions(6).map((opt) => (
//                     <option key={opt.id} value={opt.id}>
//                       {opt.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             )}
//           </div>

//           {/* Questions Section */}
//           <div className="mb-8">
//             <div className="mb-6">
//               <h2
//                 className={`text-2xl font-bold mb-4 flex items-center space-x-3`}
//                 style={{ color: palette.text }}
//               >
//                 <div 
//                   className="p-3 rounded-xl"
//                   style={{ background: ORANGE }}
//                 >
//                   <svg
//                     className="w-6 h-6 text-white"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                     />
//                   </svg>
//                 </div>
//                 <span>Questions & Options</span>
//               </h2>
//             </div>

//             {/* Add Questions Controls */}
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
//               <div className="lg:col-span-1">
//                 <label
//                   className={`block text-lg font-semibold mb-3`}
//                   style={{ color: palette.text }}
//                 >
//                   Add Questions
//                 </label>
//                 <div className="flex items-center space-x-3">
//                   <input
//                     type="number"
//                     className={`w-full p-3 border-2 rounded-xl transition-all duration-300 focus:ring-4 font-medium`}
//                     style={{
//                       background: palette.selectBg,
//                       color: palette.selectText,
//                       borderColor: ORANGE
//                     }}
//                     min={1}
//                     value={numOfQuestions}
//                     onChange={(e) => setNumOfQuestions(Number(e.target.value))}
//                   />
//                   <button
//                     onClick={handleAddMoreQuestions}
//                     className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 ${palette.success} flex items-center space-x-2`}
//                   >
//                     <MdAdd size={20} />
//                     <span>Add</span>
//                   </button>
//                 </div>
//               </div>

//               {/* Bulk Upload */}
//               <div className="lg:col-span-2">
//                 <label
//                   className={`block text-lg font-semibold mb-3`}
//                   style={{ color: palette.text }}
//                 >
//                   Bulk Upload Questions
//                 </label>
//                 <input
//                   type="file"
//                   accept=".xlsx,.xls,.csv"
//                   onChange={handleBulkUpload}
//                   className={`w-full p-3 border-2 rounded-xl transition-all duration-300 focus:ring-4 font-medium`}
//                   style={{
//                     background: palette.selectBg,
//                     color: palette.selectText,
//                     borderColor: ORANGE
//                   }}
//                 />
//               </div>
//             </div>

//             {/* Questions List */}
//             <div className="space-y-6">
//               {questions.map((q, qIdx) => (
//                 <div
//                   key={qIdx}
//                   className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] ${palette.shadow}`}
//                   style={{
//                     background: palette.card,
//                     borderColor: ORANGE,
//                     borderLeft: `6px solid ${ORANGE}`,
//                   }}
//                 >
//                   {/* DEBUG CHECKPOINT 6 - MOVED INSIDE THE DIV */}
//                   {(() => {
//                     console.log(
//                       "🔍 DEBUG 6 - Question Render Check for index:",
//                       qIdx
//                     );
//                     console.log(`Question ${qIdx}:`, q);
//                     console.log(
//                       `Question ${qIdx} question:`,
//                       q.question,
//                       typeof q.question
//                     );
//                     console.log(`Question ${qIdx} options:`, q.options);
//                     console.log(
//                       `Question ${qIdx} options isArray:`,
//                       Array.isArray(q.options)
//                     );
//                     console.log(`Question ${qIdx} id:`, q.id, typeof q.id);
//                     console.log(
//                       `Question ${qIdx} photo_required:`,
//                       q.photo_required,
//                       typeof q.photo_required
//                     );

//                     if (q.options && Array.isArray(q.options)) {
//                       q.options.forEach((opt, optIdx) => {
//                         console.log(`Question ${qIdx} Option ${optIdx}:`, opt);
//                         console.log(
//                           `Question ${qIdx} Option ${optIdx} id:`,
//                           opt.id,
//                           typeof opt.id
//                         );
//                         console.log(
//                           `Question ${qIdx} Option ${optIdx} value:`,
//                           opt.value,
//                           typeof opt.value
//                         );
//                         console.log(
//                           `Question ${qIdx} Option ${optIdx} submission:`,
//                           opt.submission,
//                           typeof opt.submission
//                         );
//                       });
//                     }
//                     return null;
//                   })()}
//                   <div className="flex items-center gap-6 mb-4">
//                     <div
//                       className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl text-white`}
//                       style={{ background: ORANGE }}
//                     >
//                       {qIdx + 1}
//                     </div>
//                     <input
//                       type="text"
//                       placeholder={`Enter your question ${qIdx + 1}`}
//                       className={`flex-1 p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 font-medium text-lg`}
//                       style={{
//                         background: palette.selectBg,
//                         color: palette.selectText,
//                         borderColor: ORANGE
//                       }}
//                       value={q.question}
//                       onChange={(e) =>
//                         setQuestions((prev) => {
//                           const updated = [...prev];
//                           updated[qIdx] = {
//                             ...updated[qIdx],
//                             question: e.target.value,
//                           };
//                           return updated;
//                         })
//                       }
//                     />

//                     {/* Photo Required Toggle */}
//                     <label className="flex items-center space-x-3 cursor-pointer">
//                       <input
//                         type="checkbox"
//                         checked={!!q.photo_required}
//                         onChange={(e) =>
//                           setQuestions((prev) => {
//                             const updated = [...prev];
//                             updated[qIdx] = {
//                               ...updated[qIdx],
//                               photo_required: e.target.checked,
//                             };
//                             return updated;
//                           })
//                         }
//                         className="w-5 h-5 text-purple-600 bg-white border-2 border-purple-300 rounded focus:ring-purple-500 focus:ring-2"
//                       />
//                       <div className="flex items-center space-x-2">
//                         <svg
//                           className="w-5 h-5 text-purple-600"
//                           fill="none"
//                           stroke="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
//                           />
//                         </svg>
//                         <span className="font-semibold text-purple-800">
//                           Photo Required
//                         </span>
//                       </div>
//                     </label>

//                     <button
//                       className={`p-3 rounded-xl transition-all duration-200 hover:scale-110 ${palette.danger}`}
//                       onClick={() => {
//                         if (questions.length === 1) {
//                           showToast(
//                             "At least one question is required",
//                             "error"
//                           );
//                           return;
//                         }
//                         handleRemoveQuestion(qIdx, q.id);
//                       }}
//                       title="Remove Question"
//                     >
//                       <MdDelete size={20} />
//                     </button>
//                   </div>

//                   {/* Options */}
//                   <div className="ml-18 space-y-3">
//                     <div className="flex flex-wrap gap-3">
//                       {(q.options || []).map((option, optIdx) => (
//                         <div
//                           key={option.id || optIdx}
//                           className="flex items-center gap-3 p-3 border-2 rounded-xl bg-white"
//                           style={{ borderColor: ORANGE }}
//                         >
//                           <input
//                             type="text"
//                             placeholder="Add Option"
//                             className="flex-1 outline-none border-none font-medium"
//                             value={option.value || ""}
//                             onChange={(e) =>
//                               handleQuestionOptionChange(
//                                 qIdx,
//                                 "value",
//                                 e.target.value,
//                                 optIdx
//                               )
//                             }
//                           />
//                           <select
//                             value={option.submission || "P"}
//                             onChange={(e) =>
//                               handleQuestionOptionChange(
//                                 qIdx,
//                                 "submission",
//                                 e.target.value,
//                                 optIdx
//                               )
//                             }
//                             className={`px-3 py-2 rounded-lg font-bold text-white border-none ${
//                               option.submission === "P"
//                                 ? "bg-green-500"
//                                 : "bg-red-500"
//                             }`}
//                           >
//                             <option value="P">P</option>
//                             <option value="N">N</option>
//                           </select>
//                           <button
//                             className="text-red-600 hover:text-red-800 p-1"
//                             onClick={() =>
//                               handleRemoveOption(
//                                 qIdx,
//                                 optIdx,
//                                 option.id
//                               )
//                             }
//                             title="Remove Option"
//                           >
//                             <MdDelete size={18} />
//                           </button>
//                         </div>
//                       ))}
//                       <button
//                         className={`px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 flex items-center space-x-2`}
//                         style={{
//                           background: ORANGE,
//                           color: "white"
//                         }}
//                         onClick={() => handleQuestionOptionAdd(qIdx)}
//                         type="button"
//                       >
//                         <MdAdd size={18} />
//                         <span>Add Option</span>
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Create Button */}
//           <div className="flex justify-center">
//             <button
//               className={`px-12 py-4 rounded-xl font-bold text-xl transition-all duration-300 hover:scale-105 flex items-center space-x-4 shadow-lg`}
//               style={{
//                 background: ORANGE,
//                 color: "white"
//               }}
//               onClick={handleCreateChecklist}
//             >
//               <svg
//                 className="w-6 h-6"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
//                 />
//               </svg>
//               <span>{isEdit ? "Update Checklist" : "Create Checklist"}</span>
//             </button>
//           </div>

//           {/* Rooms Selection Modal */}
//           {showRoomsModal && (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//               <div
//                 className={`w-full max-w-2xl rounded-2xl ${palette.shadow} border-2 max-h-[80vh] overflow-hidden`}
//                 style={{
//                   background: palette.card,
//                   borderColor: ORANGE
//                 }}
//               >
//                 {/* Modal Header */}
//                 <div
//                   className={`p-6 border-b-2 flex items-center justify-between`}
//                   style={{ borderColor: ORANGE }}
//                 >
//                   <div className="flex items-center space-x-3">
//                     <div 
//                       className="p-3 rounded-xl"
//                       style={{ background: ORANGE }}
//                     >
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
//                           d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
//                         />
//                       </svg>
//                     </div>
//                     <div>
//                       <h3 className={`text-2xl font-bold`} style={{ color: palette.text }}>
//                         Select Rooms
//                       </h3>
//                       <p style={{ color: palette.textSecondary }}>
//                         Choose multiple rooms for this checklist
//                       </p>
//                     </div>
//                   </div>
//                   <button
//                     onClick={() => setShowRoomsModal(false)}
//                     className={`p-2 rounded-xl transition-all duration-200 hover:scale-110 ${palette.danger}`}
//                   >
//                     <svg
//                       className="w-6 h-6"
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

//                 {/* Modal Content */}
//                 <div className="p-6 overflow-y-auto max-h-96">
//                   {/* Action Buttons */}
//                   <div className="flex gap-3 mb-6">
//                     <button
//                       onClick={handleSelectAllRooms}
//                       className={`px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105 ${palette.success} flex items-center space-x-2`}
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
//                           d="M5 13l4 4L19 7"
//                         />
//                       </svg>
//                       <span>Select All</span>
//                     </button>
//                     <button
//                       onClick={handleClearAllRooms}
//                       className={`px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105 ${palette.secondary} flex items-center space-x-2`}
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
//                       <span>Clear All</span>
//                     </button>
//                   </div>

//                   {/* Rooms Grid */}
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {rooms.map((room) => (
//                       <label
//                         key={room.id}
//                         className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105`}
//                         style={{
//                           background: selectedRooms.includes(room.id) 
//                             ? `${ORANGE}20` 
//                             : palette.card,
//                           borderColor: selectedRooms.includes(room.id) 
//                             ? ORANGE 
//                             : '#ddd'
//                         }}
//                       >
//                         <div className="flex items-center space-x-3">
//                           <input
//                             type="checkbox"
//                             checked={selectedRooms.includes(room.id)}
//                             onChange={(e) =>
//                               handleRoomSelection(room.id, e.target.checked)
//                             }
//                             className="w-5 h-5 text-emerald-600 bg-white border-2 border-emerald-300 rounded focus:ring-emerald-500 focus:ring-2"
//                           />
//                           <div className="flex-1">
//                             <span className={`font-semibold`} style={{ color: palette.text }}>
//                               {room.rooms}
//                             </span>
//                             <p className={`text-sm`} style={{ color: palette.textSecondary }}>
//                               Room ID: {room.id}
//                             </p>
//                           </div>
//                           {selectedRooms.includes(room.id) && (
//                             <svg
//                               className="w-5 h-5"
//                               style={{ color: ORANGE }}
//                               fill="none"
//                               stroke="currentColor"
//                               viewBox="0 0 24 24"
//                             >
//                               <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeWidth={2}
//                                 d="M5 13l4 4L19 7"
//                               />
//                             </svg>
//                           )}
//                         </div>
//                         {(() => {
//                           console.log("🔍 DEBUG 7 - Room Render Check:");
//                           console.log(`Room:`, room);
//                           console.log(`Room id:`, room.id, typeof room.id);
//                           console.log(
//                             `Room rooms:`,
//                             room.rooms,
//                             typeof room.rooms
//                           );
//                           return null;
//                         })()}
//                       </label>
//                     ))}
//                   </div>
//                 </div>

//                 <div
//                   className={`p-6 border-t-2 flex justify-between items-center`}
//                   style={{ borderColor: ORANGE }}
//                 >
//                   <span style={{ color: palette.textSecondary }}>
//                     {selectedRooms.length} of {rooms.length} rooms selected
//                   </span>
//                   <button
//                     onClick={() => setShowRoomsModal(false)}
//                     className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 flex items-center space-x-2`}
//                     style={{
//                       background: ORANGE,
//                       color: "white"
//                     }}
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
//                         d="M5 13l4 4L19 7"
//                       />
//                     </svg>
//                     <span>Done</span>
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChecklistForm;
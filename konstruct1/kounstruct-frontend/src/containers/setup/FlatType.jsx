// import React, { useState, useEffect, useRef } from "react";
// import { IoMdAdd } from "react-icons/io";
// import Select from "react-select";
// import { showToast } from "../../utils/toast";

// import {
//   createRoom,
//   getRoomsByProject,
//   createFlatType,
//   getFlatTypes,
//   updateFlatType,
// } from "../../api";
// import { useSelector, useDispatch } from "react-redux";
// import { setRoomTypes, setFlatTypes } from "../../store/userSlice";
// import { useTheme } from "../../ThemeContext";

// // --- COLOR PALETTE ---
// const COLORS = {
//   light: {
//     ORANGE: "#b54b13",
//     ORANGE_DARK: "#882c10",
//     ORANGE_LIGHT: "#ede1d3",
//     BG_GRAY: "#e6e3df",
//     BORDER_GRAY: "#a29991",
//     TEXT_GRAY: "#29252c",
//     ERROR: "#ea4343",
//     INPUT_BG: "#f9f6f3",
//     DISABLED: "#e2d6cf",
//     PURPLE: "#d2b1fd",
//     WHITE: "#fff",
//   },
//   dark: {
//     ORANGE: "#ffbe63",
//     ORANGE_DARK: "#f4b95e",
//     ORANGE_LIGHT: "#1b1c23",
//     BG_GRAY: "#17171d",
//     BORDER_GRAY: "#383846",
//     TEXT_GRAY: "#f5f2e5",
//     ERROR: "#ff7676",
//     INPUT_BG: "#252530",
//     DISABLED: "#292934",
//     PURPLE: "#7a5ec6",
//     WHITE: "#181820",
//   },
// };

// const getAuthToken = () =>
//   localStorage.getItem("token") || sessionStorage.getItem("token") || "";

// function FlatType({ nextStep, previousStep }) {
//   const dispatch = useDispatch();
//   const { theme } = useTheme(); // 'light' or 'dark'
//   const c = COLORS[theme === "dark" ? "dark" : "light"];
// const selectedProject = useSelector((state) => state.user.selectedProject);
// const projectId = selectedProject ? selectedProject.id : null;

//   const flatTypesRedux = useSelector(
//     (state) => state.user.flatTypes?.[projectId] || []
//   );

//   // State declarations...
//   const [projectRooms, setProjectRooms] = useState([]);
//   const [roomOptions, setRoomOptions] = useState([]);
//   const [newRoom, setNewRoom] = useState("");
//   const [createNewRoom, setCreateNewRoom] = useState(false);
//   const [flatTypeDetails, setFlatTypeDetails] = useState({
//     flat_type: "",
//     is_common: false,
//     room_ids: [],
//   });
//   const [flatTypeList, setFlatTypeList] = useState([]);
//   const [isFlatType, setIsFlatType] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isEditFlatType, setIsEditFlatType] = useState(-1);
//   const [editFlatType, setEditFlatType] = useState({
//     flat_type: "",
//     is_common: false,
//     room_ids: [],
//     id: "",
//   });
//   const [showAll, setShowAll] = useState(false);
//   const containerRef = useRef(null);
//   const [visibleRooms, setVisibleRooms] = useState([]);

//   // API wrappers...
//   const safeApiCall = async (apiFunc, ...args) => {
//     try {
//       const token = getAuthToken();
//       const res = await apiFunc(...args, token);
//       return res;
//     } catch (err) {
//       if (err.response?.status === 401) {
//         showToast("Session expired. Please login again.","error");
//       }
//       return {
//         status: err.response?.status || 500,
//         data: err.response?.data || null,
//       };
//     }
//   };

//   // Fetch Rooms by Project
//   const fetchRooms = async () => {
//     if (!projectId) return;
//     const res = await safeApiCall(getRoomsByProject, projectId.id);
//     if (res.status === 200) {
//       const rooms = res.data || [];
//       setProjectRooms(rooms);
//       setRoomOptions(rooms);
//       dispatch(setRoomTypes(rooms));
//     } else {
//       setProjectRooms([]);
//       setRoomOptions([]);
//     }
//   };
  

//   // Fetch FlatTypes by Project
//   const fetchFlatTypes = async () => {
//     if (!projectId) return;
//     setIsLoading(true);
//     const res = await safeApiCall(getFlatTypes, projectId.id);
//     console.log(res.data,'this is data');
//     let flatTypes = [];
//     if (res.status === 200) {
//       if (Array.isArray(res.data)) {
//         flatTypes = res.data;
//       } else if (res.data && Array.isArray(res.data.data)) {
//         flatTypes = res.data.data;
//       } else if (
//         res.data &&
//         res.data.results &&
//         Array.isArray(res.data.results)
//       ) {
//         flatTypes = res.data.results;
//       }
//       setFlatTypeList(flatTypes);
//       dispatch(setFlatTypes({ project_id: projectId.id, data: flatTypes }));
//     } else {
//       setFlatTypeList([]);
//     }
//     setIsLoading(false);
//   };

//   useEffect(() => {
//     if (projectId) {
//       fetchRooms();
//       fetchFlatTypes();
//     } else {
//       setFlatTypeList([]);
//       setProjectRooms([]);
//       setRoomOptions([]);
//     }
//   }, [projectId]);
// console.log("FlatTypes loaded:", flatTypeList);
// console.log("Rooms loaded:", projectRooms);


// console.log("projectId changed:", projectId);
//   // useEffect(() => {
//   //   if (Array.isArray(flatTypesRedux)) setFlatTypeList(flatTypesRedux);
//   // }, [flatTypesRedux]);

//   // Room create
//   const handleAddRoom = async () => {
//     if (!newRoom.trim()) {
//       showToast("Room name is required","error");
//       return;
//     }
//     if (
//       (roomOptions || []).some(
//         (room) => room?.rooms?.toLowerCase() === newRoom.toLowerCase()
//       )
//     ) {
//       showToast("Room already exists","error");
//       return;
//     }
//     const res = await safeApiCall(createRoom, {
//       Project: projectId.id,
//       rooms: newRoom.trim(),
//     });
//     if (res.status === 201 || res.status === 200) {
//       showToast("Room added successfully","success");
//       setNewRoom("");
//       setCreateNewRoom(false);
//       await fetchRooms();
//       console.log("After adding room, projectRooms:", projectRooms);

//     } else {
//       showToast(res.data?.message || "Failed to add room","error");
//     }
//   };

//   // Room options for select
//   const formattedRoomOptions = (projectRooms || []).map((room) => ({
//     value: room.id,
//     label: room.rooms,
//   }));

//   // FlatType logic
//   const handleFlatTypeChange = (field, value) => {
//     setFlatTypeDetails({
//       ...flatTypeDetails,
//       [field]: value,
//     });
//   };

//   const validateCreateFlatType = () => {
//     if (!flatTypeDetails.flat_type.trim()) {
//       showToast("Flat Type name is required","error");
//       return false;
//     }
//     if ((flatTypeDetails.room_ids || []).length === 0) {
//       showToast("At least one room is required","error");
//       return false;
//     }
//     const isFlatTypeExists = (flatTypeList || []).find(
//       (item) =>
//         item.type_name?.toLowerCase() ===
//         flatTypeDetails.flat_type.toLowerCase()
//     );
//     if (isFlatTypeExists) {
//       showToast("Flat Type already exists","error");
//       return false;
//     }
//     return true;
//   };

//   const handleCreateFlatType = async () => {
//     if (!validateCreateFlatType()) return;
//     setIsLoading(true);
//     const res = await safeApiCall(createFlatType, {
//       project: projectId.id,
//       type_name: flatTypeDetails.flat_type.trim(),
//       rooms: (flatTypeDetails.room_ids || []).map((item) => item.value),
//     });
//     if (res.status === 201 || res.status === 200) {
//       showToast(res.data?.message || "Flat Type Created Successfully","success");
//       setFlatTypeDetails({
//         flat_type: "",
//         is_common: false,
//         room_ids: [],
//       });
//       setIsFlatType(false);
//       await fetchFlatTypes();
//       console.log("After adding flat type, flatTypeList:", flatTypeList);
//       console.log("fetchFlatTypes response:", res);


//     } else {
//       showToast(res.data?.message || "Error creating flat type","error");
//     }
//     setIsLoading(false);
//   };

//   // Edit logic
//   const handleEditFlatType = (index) => {
//     setIsEditFlatType(index);
//     const flat = flatTypeList[index];
//     setEditFlatType({
//       id: flat.id || flat.flat_type_id,
//       flat_type: flat.type_name,
//       is_common: flat.is_common || false,
//       room_ids: formattedRoomOptions.filter((item) =>
//         (flat.rooms || []).includes(item.value)
//       ),
//     });
//   };

//   const handleUpdateFlatType = (field, value) => {
//     setEditFlatType({
//       ...editFlatType,
//       [field]: value,
//     });
//   };

//   const handleSaveFlatType = async () => {
//     if (!editFlatType.flat_type.trim()) {
//       showToast("Flat Type name is required","error");
//       return;
//     }
//     if ((editFlatType.room_ids || []).length === 0) {
//       showToast("At least one room is required","error");
//       return;
//     }

//     setIsLoading(true);
//     const res = await safeApiCall(updateFlatType, {
//       project: projectId.id,
//       flat_type_id: editFlatType.id,
//       type_name: editFlatType.flat_type.trim(),
//       rooms: (editFlatType.room_ids || []).map((item) => item.value),
//     });
//     if (res.status === 200) {
//       showToast(res.data?.message || "Flat Type updated successfully","success");
//       setIsEditFlatType(-1);
//       await fetchFlatTypes();
//       console.log("fetchFlatTypes response:", res);

//     } else {
//       showToast(res.data?.message || "Error updating flat type","error");
//     }
//     setIsLoading(false);
//   };

//   // Cancel edit
//   const handleCancelEdit = () => {
//     setIsEditFlatType(-1);
//     setEditFlatType({
//       flat_type: "",
//       is_common: false,
//       room_ids: [],
//       id: "",
//     });
//   };

//   useEffect(() => {
//     if (!showAll && containerRef.current) {
//       const container = containerRef.current;
//       const children = Array.from(container.children);
//       let totalWidth = 0;
//       let fitCount = 0;
//       for (let child of children) {
//         const style = window.getComputedStyle(child);
//         const width = child.offsetWidth + parseFloat(style.marginRight || 0);
//         if (totalWidth + width <= container.offsetWidth) {
//           totalWidth += width;
//           fitCount++;
//         } else {
//           break;
//         }
//       }
//       setVisibleRooms((roomOptions || []).slice(0, fitCount));
//     } else {
//       setVisibleRooms(roomOptions || []);
//     }
//   }, [showAll, roomOptions]);
//   useEffect(() => {
//   console.log("FlatTypes loaded:", flatTypeList);
// }, [flatTypeList]);
// useEffect(() => {
//   console.log("Rooms loaded:", projectRooms);
// }, [projectRooms]);


//   return (
//     <div
//       className="max-w-7xl h-dvh my-1 mx-auto px-6 py-3 rounded-lg shadow-md"
//       style={{
//         background: c.BG_GRAY,
//         border: `1.5px solid ${c.BORDER_GRAY}`,
//         color: c.TEXT_GRAY,
//         minHeight: "100vh",
//       }}
//     >
//       {/* Status Bar */}
//       <div
//         className="mb-4 flex items-center justify-between rounded-lg p-3 border"
//         style={{
//           background: `linear-gradient(90deg, ${c.ORANGE_LIGHT} 80%, ${c.WHITE})`,
//           borderColor: c.ORANGE,
//         }}
//       >
//         <div className="flex items-center space-x-4">
//           <div className="flex items-center space-x-2">
//             <div
//               className="w-2 h-2"
//               style={{ background: c.ORANGE, borderRadius: 99 }}
//             ></div>
//             <span style={{ color: c.TEXT_GRAY }} className="text-sm font-medium">
//               Project {projectId.id}
//             </span>
//           </div>
//           <div className="text-sm" style={{ color: c.ORANGE_DARK }}>
//             {(flatTypeList || []).length} Flat Types • {(projectRooms || []).length} Rooms
//           </div>
//         </div>
//         {isLoading && (
//           <div className="flex items-center space-x-2">
//             <div
//               className="animate-spin rounded-full h-4 w-4 border-b-2"
//               style={{ borderColor: c.ORANGE }}
//             ></div>
//             <span style={{ color: c.ORANGE_DARK }} className="text-sm">Loading...</span>
//           </div>
//         )}
//       </div>

//       {/* Room selection */}
//       <div
//         className="w-full mb-2 rounded-md p-3"
//         style={{ background: c.ORANGE_LIGHT }}
//       >
//         <div className="flex items-center w-full">
//           <div
//             ref={containerRef}
//             className="flex gap-2 items-center transition-all duration-300 flex-wrap"
//             style={{
//               width: "90%",
//               overflowY: showAll ? "auto" : "hidden",
//               maxHeight: showAll ? "180px" : "120px",
//             }}
//           >
//             {(visibleRooms || []).map((option) => (
//               <button
//                 key={option?.id}
//                 className="border rounded-md px-4 py-2 whitespace-nowrap"
//                 style={{
//                   background: c.WHITE,
//                   color: c.ORANGE,
//                   borderColor: c.ORANGE,
//                 }}
//                 disabled
//               >
//                 {option?.rooms || ""}
//               </button>
//             ))}
//             {(visibleRooms || []).length === 0 && (
//               <span style={{ color: c.BORDER_GRAY }}>No rooms available</span>
//             )}
//           </div>
//           <div
//             className="flex justify-end items-start pl-2"
//             style={{ width: "10%" }}
//           >
//             {(roomOptions || []).length > (visibleRooms || []).length && (
//               <button
//                 className="text-sm underline whitespace-nowrap mx-5"
//                 style={{ color: c.ORANGE_DARK }}
//                 onClick={() => setShowAll((prev) => !prev)}
//               >
//                 {showAll ? "View Less" : "View More"}
//               </button>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Action Buttons */}
//       <div className="flex gap-3 mb-6">
//         <button
//           className="border-2 rounded-lg px-4 py-2.5 flex items-center gap-2 shadow-sm transition-all duration-200"
//           style={{
//             color: c.ORANGE_DARK,
//             borderColor: c.ORANGE,
//             background: c.WHITE,
//           }}
//           onClick={() => setCreateNewRoom(!createNewRoom)}
//         >
//           <IoMdAdd className="text-lg" />
//           <span className="font-medium">New Room</span>
//         </button>
//         <button
//           className="rounded-lg px-4 py-2.5 flex items-center gap-2 shadow-sm transition-all duration-200"
//           style={{
//             background: c.ORANGE,
//             color: c.WHITE,
//           }}
//           onClick={() => setIsFlatType(!isFlatType)}
//         >
//           <IoMdAdd className="text-lg" />
//           <span className="font-medium">New Flat Type</span>
//         </button>
//       </div>

//       {/* Room creation input */}
//       {createNewRoom && (
//         <div className="w-full max-w-md mb-6 rounded-lg p-4 border"
//           style={{ background: c.ORANGE_LIGHT, borderColor: c.ORANGE }}>
//           <h4 style={{ color: c.ORANGE_DARK }} className="text-sm font-medium mb-3">
//             Add New Room
//           </h4>
//           <div className="flex items-center gap-3">
//             <input
//               type="text"
//               value={newRoom}
//               onChange={(e) => setNewRoom(e.target.value)}
//               placeholder="Enter room name"
//               className="border rounded-lg p-2.5 flex-1"
//               style={{
//                 borderColor: c.ORANGE,
//                 background: c.WHITE,
//                 color: c.TEXT_GRAY,
//               }}
//               onKeyPress={(e) => e.key === "Enter" && handleAddRoom()}
//             />
//             <button
//               onClick={handleAddRoom}
//               className="rounded-lg"
//               style={{
//                 background: c.ORANGE,
//                 color: c.WHITE,
//                 padding: "10px 24px",
//               }}
//               disabled={isLoading}
//             >
//               Save
//             </button>
//             <button
//               onClick={() => {
//                 setCreateNewRoom(false);
//                 setNewRoom("");
//               }}
//               className="border font-medium py-2.5 px-4 rounded-lg"
//               style={{
//                 borderColor: c.ORANGE,
//                 background: c.WHITE,
//                 color: c.TEXT_GRAY,
//               }}
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Flat Types Section Header */}
//       <div className="mb-6">
//         <h2 style={{ color: c.ORANGE_DARK }} className="text-xl font-semibold mb-2">Flat Types</h2>
//         <p style={{ color: c.ORANGE }} className="text-sm">
//           Manage your project's flat configurations and room assignments
//         </p>
//       </div>

//       {/* FlatType create form */}
//       {isFlatType && (
//         <div className="border-2 border-dashed rounded-lg p-6 mb-6"
//           style={{
//             background: c.WHITE,
//             borderColor: c.ORANGE,
//           }}>
//           <h3 className="text-lg font-semibold mb-4" style={{ color: c.ORANGE_DARK }}>
//             Create New Flat Type
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//             <div>
//               <label className="block text-sm font-medium mb-1" style={{ color: c.TEXT_GRAY }}>
//                 Flat Type Name
//               </label>
//               <input
//                 type="text"
//                 value={flatTypeDetails.flat_type}
//                 onChange={(e) =>
//                   handleFlatTypeChange("flat_type", e.target.value)
//                 }
//                 className="border rounded-lg w-full p-2.5"
//                 style={{
//                   borderColor: c.ORANGE,
//                   background: c.WHITE,
//                   color: c.TEXT_GRAY,
//                 }}
//                 placeholder="e.g., 2BHK, 3BHK"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1" style={{ color: c.TEXT_GRAY }}>
//                 Select Rooms
//               </label>
//               <Select
//                 isMulti
//                 options={formattedRoomOptions}
//                 value={flatTypeDetails.room_ids}
//                 onChange={(e) => handleFlatTypeChange("room_ids", e)}
//                 placeholder="Choose rooms"
//                 className="basic-multi-select"
//                 classNamePrefix="select"
//                 closeMenuOnSelect={false}
//                 maxMenuHeight={150}
//                 styles={{
//                   control: (base) => ({
//                     ...base,
//                     backgroundColor: c.INPUT_BG,
//                     color: c.TEXT_GRAY,
//                   }),
//                   menu: (base) => ({
//                     ...base,
//                     backgroundColor: c.WHITE,
//                   }),
//                   multiValue: (base) => ({
//                     ...base,
//                     backgroundColor: c.ORANGE_LIGHT,
//                   }),
//                   option: (base, state) => ({
//                     ...base,
//                     backgroundColor: state.isSelected
//                       ? c.ORANGE_LIGHT
//                       : c.WHITE,
//                     color: c.TEXT_GRAY,
//                   }),
//                 }}
//               />
//             </div>
//             <div className="flex items-end gap-3">
//               <div className="flex items-center space-x-2">
//                 <input
//                   type="checkbox"
//                   id="customCheckbox"
//                   className="w-4 h-4 border rounded"
//                   style={{
//                     borderColor: c.ORANGE,
//                     accentColor: c.ORANGE,
//                   }}
//                   checked={flatTypeDetails.is_common}
//                   onChange={() =>
//                     handleFlatTypeChange(
//                       "is_common",
//                       !flatTypeDetails.is_common
//                     )
//                   }
//                 />
//                 <label
//                   htmlFor="customCheckbox"
//                   className="text-sm font-medium"
//                   style={{ color: c.TEXT_GRAY }}
//                 >
//                   Common Area
//                 </label>
//               </div>
//             </div>
//           </div>
//           <div className="flex gap-3">
//             <button
//               className="font-semibold px-6 py-2.5 rounded-lg disabled:opacity-50"
//               style={{
//                 background: c.ORANGE,
//                 color: c.WHITE,
//               }}
//               onClick={handleCreateFlatType}
//               disabled={isLoading}
//             >
//               {isLoading ? "Creating..." : "Create Flat Type"}
//             </button>
//             <button
//               className="border font-medium px-4 py-2.5 rounded-lg"
//               style={{
//                 borderColor: c.ORANGE,
//                 color: c.ORANGE,
//                 background: c.WHITE,
//               }}
//               onClick={() => {
//                 setIsFlatType(false);
//                 setFlatTypeDetails({
//                   flat_type: "",
//                   is_common: false,
//                   room_ids: [],
//                 });
//               }}
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Flat Types Table */}
//       {(flatTypeList || []).length > 0 && (
//         <div
//           className="border rounded-lg shadow-sm overflow-hidden"
//           style={{
//             background: c.WHITE,
//             borderColor: c.ORANGE,
//           }}
//         >
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y" style={{ borderColor: c.ORANGE }}>
//               <thead style={{ background: c.ORANGE_LIGHT }}>
//                 <tr>
//                   <th
//                     className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
//                     style={{ color: c.ORANGE_DARK }}
//                   >
//                     Flat Type
//                   </th>
//                   <th
//                     className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
//                     style={{ color: c.ORANGE_DARK }}
//                   >
//                     Rooms
//                   </th>
//                   <th
//                     className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
//                     style={{ color: c.ORANGE_DARK }}
//                   >
//                     Type
//                   </th>
//                   <th
//                     className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
//                     style={{ color: c.ORANGE_DARK }}
//                   >
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {(flatTypeList || []).map((flatType, index) => (
//                   <tr
//                     key={flatType.id || flatType.flat_type_id}
//                     className="hover:bg-orange-50"
//                   >
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       {isEditFlatType === index ? (
//                         <input
//                           type="text"
//                           value={editFlatType.flat_type}
//                           onChange={(e) =>
//                             handleUpdateFlatType("flat_type", e.target.value)
//                           }
//                           className="border rounded-lg px-3 py-2 w-full"
//                           style={{ borderColor: c.ORANGE }}
//                           placeholder="Enter flat type name"
//                         />
//                       ) : (
//                         <div
//                           style={{ color: c.ORANGE_DARK }}
//                           className="text-sm font-medium"
//                         >
//                           {flatType.type_name || "Unnamed"}
//                         </div>
//                       )}
//                     </td>
//                     <td className="px-6 py-4">
//                       {isEditFlatType === index ? (
//                         <Select
//                           isMulti
//                           options={formattedRoomOptions}
//                           value={editFlatType.room_ids}
//                           onChange={(e) => handleUpdateFlatType("room_ids", e)}
//                           placeholder="Choose rooms"
//                           className="min-w-[200px]"
//                           classNamePrefix="select"
//                           closeMenuOnSelect={false}
//                           maxMenuHeight={150}
//                           styles={{
//                             control: (base) => ({
//                               ...base,
//                               backgroundColor: c.INPUT_BG,
//                               color: c.TEXT_GRAY,
//                             }),
//                             menu: (base) => ({
//                               ...base,
//                               backgroundColor: c.WHITE,
//                             }),
//                             multiValue: (base) => ({
//                               ...base,
//                               backgroundColor: c.ORANGE_LIGHT,
//                             }),
//                             option: (base, state) => ({
//                               ...base,
//                               backgroundColor: state.isSelected
//                                 ? c.ORANGE_LIGHT
//                                 : c.WHITE,
//                               color: c.TEXT_GRAY,
//                             }),
//                           }}
//                         />
//                       ) : (
//                         <div className="flex flex-wrap gap-1">
//                           {(flatType.rooms || []).map((roomId, idx) => {
//                             const roomLabel =
//                               formattedRoomOptions.find(
//                                 (item) => item.value === roomId
//                               )?.label || `Room ${roomId}`;
//                             return (
//                               <span
//                                 key={`${roomId}-${idx}`}
//                                 className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
//                                 style={{
//                                   background: c.ORANGE_LIGHT,
//                                   color: c.ORANGE_DARK,
//                                   border: `1px solid ${c.ORANGE}`,
//                                 }}
//                               >
//                                 {roomLabel}
//                               </span>
//                             );
//                           })}
//                           {(!flatType.rooms || flatType.rooms.length === 0) && (
//                             <span className="text-sm" style={{ color: c.BORDER_GRAY }}>
//                               No rooms assigned
//                             </span>
//                           )}
//                         </div>
//                       )}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       {isEditFlatType === index ? (
//                         <div className="flex items-center space-x-2">
//                           <input
//                             type="checkbox"
//                             id={`editCheckbox-${index}`}
//                             className="w-4 h-4 border rounded"
//                             style={{
//                               borderColor: c.ORANGE,
//                               accentColor: c.ORANGE,
//                             }}
//                             checked={editFlatType.is_common}
//                             onChange={() =>
//                               handleUpdateFlatType(
//                                 "is_common",
//                                 !editFlatType.is_common
//                               )
//                             }
//                           />
//                           <label
//                             htmlFor={`editCheckbox-${index}`}
//                             className="text-sm font-medium"
//                             style={{ color: c.TEXT_GRAY }}
//                           >
//                             Common Area
//                           </label>
//                         </div>
//                       ) : (
//                         <span
//                           className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
//                           style={{
//                             background: flatType.is_common ? c.PURPLE : "#eee",
//                             color: flatType.is_common ? c.ORANGE_DARK : c.BORDER_GRAY,
//                           }}
//                         >
//                           {flatType.is_common ? "Common Area" : "Regular"}
//                         </span>
//                       )}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                       {isEditFlatType === index ? (
//                         <div className="flex gap-2">
//                           <button
//                             onClick={handleSaveFlatType}
//                             className="px-4 py-2 rounded-lg"
//                             style={{
//                               background: c.ORANGE,
//                               color: c.WHITE,
//                             }}
//                             disabled={isLoading}
//                           >
//                             {isLoading ? "Saving..." : "Save"}
//                           </button>
//                           <button
//                             onClick={handleCancelEdit}
//                             className="border px-4 py-2 rounded-lg"
//                             style={{
//                               borderColor: c.ORANGE,
//                               color: c.ORANGE_DARK,
//                               background: c.WHITE,
//                             }}
//                           >
//                             Cancel
//                           </button>
//                         </div>
//                       ) : (
//                         <button
//                           onClick={() => handleEditFlatType(index)}
//                           className="font-medium"
//                           style={{ color: c.ORANGE }}
//                         >
//                           Edit
//                         </button>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* Empty state */}
//       {!isLoading && (flatTypeList || []).length === 0 && (
//         <div className="text-center py-12">
//           <div
//             className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-4"
//             style={{ background: c.ORANGE_LIGHT }}
//           >
//             <svg
//               className="w-12 h-12"
//               fill="none"
//               stroke={c.ORANGE}
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={1.5}
//                 d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
//               />
//             </svg>
//           </div>
//           <h3 className="text-lg font-medium mb-2" style={{ color: c.ORANGE_DARK }}>
//             No flat types yet
//           </h3>
//           <p style={{ color: c.BORDER_GRAY }} className="mb-4">
//             Get started by creating your first flat type configuration
//           </p>
//           <button
//             onClick={() => setIsFlatType(true)}
//             className="px-6 py-2.5 rounded-lg inline-flex items-center gap-2"
//             style={{
//               background: c.ORANGE,
//               color: c.WHITE,
//             }}
//           >
//             <IoMdAdd className="text-lg" />
//             Create Flat Type
//           </button>
//         </div>
//       )}

//       {/* Navigation */}
//       <div
//         className="flex justify-between mt-8 pt-6"
//         style={{ borderTop: `1px solid ${c.BORDER_GRAY}` }}
//       >
//         <button
//           className="px-6 py-2.5 rounded-lg font-medium"
//           style={{
//             background: c.BORDER_GRAY,
//             color: c.WHITE,
//           }}
//           onClick={previousStep}
//         >
//           ← Previous
//         </button>
//         <button
//           className="px-6 py-2.5 rounded-lg font-medium"
//           style={{
//             background: c.ORANGE,
//             color: c.WHITE,
//           }}
//           onClick={nextStep}
//         >
//           Save & Continue →
//         </button>
//       </div>
//     </div>
//   );
// }

// export default FlatType;

import React, { useState, useEffect, useRef } from "react";
import { IoMdAdd } from "react-icons/io";
import Select from "react-select";
import { showToast } from "../../utils/toast";

import {
  createRoom,
  getRoomsByProject,
  createFlatType,
  getFlatTypes,
} from "../../api";
import { useSelector, useDispatch } from "react-redux";
import { setRoomTypes, setFlatTypes } from "../../store/userSlice";
import { useTheme } from "../../ThemeContext";

// THEME palette
const ORANGE = "#ffbe63";
const BG_OFFWHITE = "#fcfaf7";

function FlatType({ nextStep, previousStep }) {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const bgColor = theme === "dark" ? "#191922" : BG_OFFWHITE;
  const cardColor = theme === "dark" ? "#23232c" : "#fff";
  const borderColor = ORANGE;
  const textColor = theme === "dark" ? "#e2e8f0" : "#222";
  const iconColor = ORANGE;
  const darkAccentBg = theme === "dark" ? "#3a3f4e" : "#fdf3e4";
  const darkGradientBg =
    theme === "dark"
      ? "linear-gradient(135deg, #2a2d3a 0%, #353844 100%)"
      : "linear-gradient(135deg, #fdf3e4 0%, #fff7ed 100%)";

  const selectedProject = useSelector((state) => state.user.selectedProject);
  const projectId =
    typeof selectedProject === "object"
      ? selectedProject?.id || selectedProject?.project_id || "-"
      : selectedProject || "-";

  // State
  const [projectRooms, setProjectRooms] = useState([]);
  const [roomOptions, setRoomOptions] = useState([]);
  const [newRoom, setNewRoom] = useState("");
  const [createNewRoom, setCreateNewRoom] = useState(false);
  const [flatTypeDetails, setFlatTypeDetails] = useState({
    flat_type: "",
    is_common: false,
    room_ids: [],
  });
  const [flatTypeList, setFlatTypeList] = useState([]);
  const [isFlatType, setIsFlatType] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [showAll, setShowAll] = useState(false);
  const containerRef = useRef(null);
  const [visibleRooms, setVisibleRooms] = useState([]);

  // API WRAPPERS
  const getAuthToken = () =>
    localStorage.getItem("token") || sessionStorage.getItem("token") || "";

  const safeApiCall = async (apiFunc, ...args) => {
    try {
      const token = getAuthToken();
      const res = await apiFunc(...args, token);
      return res;
    } catch (err) {
      if (err.response?.status === 401) {
        showToast("Session expired. Please login again", "error");
      }
      return {
        status: err.response?.status || 500,
        data: err.response?.data || null,
      };
    }
  };

  // FETCH
  const fetchRooms = async () => {
    if (!projectId || projectId === "-") return;
    const res = await safeApiCall(getRoomsByProject, projectId.id);
    if (res.status === 200) {
      const rooms = res.data || [];
      setProjectRooms(rooms);
      setRoomOptions(rooms);
      dispatch(setRoomTypes(rooms));
    } else {
      setProjectRooms([]);
      setRoomOptions([]);
    }
  };

  const fetchFlatTypes = async () => {
    if (!projectId || projectId === "-") return;
    setIsLoading(true);
    const res = await safeApiCall(getFlatTypes, projectId.id);
    let flatTypes = [];
    if (res.status === 200) {
      if (Array.isArray(res.data)) flatTypes = res.data;
      else if (res.data && Array.isArray(res.data.data))
        flatTypes = res.data.data;
      else if (res.data && res.data.results && Array.isArray(res.data.results))
        flatTypes = res.data.results;
      setFlatTypeList(flatTypes);
      dispatch(setFlatTypes({ project_id: projectId.id, data: flatTypes }));
    } else {
      setFlatTypeList([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (projectId && projectId !== "-") {
      fetchRooms();
      fetchFlatTypes();
    } else {
      setFlatTypeList([]);
      setProjectRooms([]);
      setRoomOptions([]);
    }
    // eslint-disable-next-line
  }, [projectId]);

  // ROOM OPTIONS
  const formattedRoomOptions = (projectRooms || []).map((room) => ({
    value: room.id,
    label: typeof room.rooms === "string" ? room.rooms : String(room.rooms),
    id: room.id,
  }));

  // ROOM CREATE
  const handleAddRoom = async () => {
    if (!newRoom.trim()) {
      showToast("Room name is required", "error");
      return;
    }
    if (
      (roomOptions || []).some(
        (room) =>
          typeof room?.rooms === "string" &&
          room?.rooms.toLowerCase() === newRoom.toLowerCase()
      )
    ) {
      showToast("Room already exists", "error");
      return;
    }
    const res = await safeApiCall(createRoom, {
      Project: projectId.id,
      rooms: newRoom.trim(),
    });
    if (res.status === 201 || res.status === 200) {
      showToast("Room added successfully", "success");
      setNewRoom("");
      setCreateNewRoom(false);
      await fetchRooms();
    } else {
      showToast(res.data?.message || "Failed to add room", "error");
    }
  };

  // CREATE FLAT TYPE
  const handleFlatTypeChange = (field, value) => {
    setFlatTypeDetails({
      ...flatTypeDetails,
      [field]: value,
    });
  };

  const validateCreateFlatType = () => {
    if (!flatTypeDetails.flat_type.trim()) {
      showToast("Flat Type name is required", "error");
      return false;
    }
    if ((flatTypeDetails.room_ids || []).length === 0) {
      showToast("At least one room is required", "error");
      return false;
    }
    const isFlatTypeExists = (flatTypeList || []).find(
      (item) =>
        item.type_name?.toLowerCase() ===
        flatTypeDetails.flat_type.toLowerCase()
    );
    if (isFlatTypeExists) {
      showToast("Flat Type already exists", "error");
      return false;
    }
    return true;
  };

  const handleCreateFlatType = async () => {
    if (!validateCreateFlatType()) return;
    setIsLoading(true);
    const res = await safeApiCall(createFlatType, {
      project: projectId.id,
      type_name: flatTypeDetails.flat_type.trim(),
      rooms: (flatTypeDetails.room_ids || []).map((item) => item.value),
    });
    if (res.status === 201 || res.status === 200) {
      showToast(
        res.data?.message || "Flat Type Created Successfully",
        "success"
      );
      setFlatTypeDetails({ flat_type: "", is_common: false, room_ids: [] });
      setIsFlatType(false);
      await fetchFlatTypes();
    } else {
      showToast(res.data?.message || "Error creating flat type", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!showAll && containerRef.current) {
      const container = containerRef.current;
      const children = Array.from(container.children);
      let totalWidth = 0;
      let fitCount = 0;
      for (let child of children) {
        const style = window.getComputedStyle(child);
        const width = child.offsetWidth + parseFloat(style.marginRight || 0);
        if (totalWidth + width <= container.offsetWidth) {
          totalWidth += width;
          fitCount++;
        } else {
          break;
        }
      }
      setVisibleRooms((roomOptions || []).slice(0, fitCount));
    } else {
      setVisibleRooms(roomOptions || []);
    }
    // eslint-disable-next-line
  }, [showAll, roomOptions]);

  return (
    <div
      className="w-full max-w-7xl mx-auto rounded-2xl shadow-lg flex flex-col"
      style={{
        background: cardColor,
        border: `1.5px dotted ${borderColor}`,
        color: textColor,
        minHeight: "80vh",
        height: "calc(100vh - 2rem)",
        maxHeight: "calc(100vh - 2rem)",
        position: "relative",
        display: "flex",
        overflow: "hidden",
      }}
    >
      {/* SCROLLABLE CONTENT AREA */}
      <div
        className="flex-1 px-6 pb-2 content-scroll-area"
        style={{
          flex: "1 1 auto",
          overflowY: "auto",
          overflowX: "hidden",
          minHeight: 0,
          maxHeight: "100%",
        }}
      >
        {/* Status Bar */}
        <div
          className="mb-6 flex items-center justify-between rounded-xl p-4 border shadow-sm transition-all duration-300 hover:shadow-md"
          style={{
            background:
              theme === "dark"
                ? darkGradientBg
                : `linear-gradient(135deg, #fdf3e4 0%, #fff7ed 100%)`,
            borderColor: borderColor,
          }}
        >
          <div className="flex items-center space-x-6">
            {/* <div className="flex items-center space-x-3">
              <div
                className="w-3 h-3 animate-pulse"
                style={{ background: iconColor, borderRadius: 99 }}
              ></div>
              <span
                style={{ color: textColor }}
                className="text-base font-semibold"
              >
                {selectedProject?.name ||
                  selectedProject?.project_name ||
                  projectId.id ||
                  "No Project Selected"}
              </span>
            </div> */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="text-sm font-medium" style={{ color: ORANGE }}>
                  <span className="text-lg font-bold">
                    {(flatTypeList || []).length}
                  </span>
                  <span className="ml-1">Flat Types</span>
                </div>
                <span style={{ color: textColor }}>•</span>
                <div className="text-sm font-medium" style={{ color: ORANGE }}>
                  <span className="text-lg font-bold">
                    {(projectRooms || []).length}
                  </span>
                  <span className="ml-1">Rooms</span>
                </div>
              </div>
            </div>
          </div>
          {isLoading && (
            <div className="flex items-center space-x-3 bg-white bg-opacity-70 rounded-lg px-3 py-2">
              <div
                className="animate-spin rounded-full h-5 w-5 border-b-2"
                style={{ borderColor: ORANGE }}
              ></div>
              <span style={{ color: ORANGE }} className="text-sm font-medium">
                Processing...
              </span>
            </div>
          )}
        </div>

        {/* Rooms display */}
        <div
          className="w-full mb-6 rounded-xl p-4 shadow-sm border"
          style={{
            background:
              theme === "dark"
                ? darkGradientBg
                : "linear-gradient(135deg, #fdf3e4 0%, #fff7ed 100%)",
            borderColor: theme === "dark" ? "#4a5568" : "#f5d299",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3
              style={{ color: ORANGE }}
              className="text-sm font-semibold uppercase tracking-wide"
            >
              Available Rooms
            </h3>
            {(roomOptions || []).length > 0 && (
              <span
                className="text-xs font-medium px-2 py-1 rounded-full"
                style={{
                  background: ORANGE,
                  color: "white",
                }}
              >
                {(roomOptions || []).length} Total
              </span>
            )}
          </div>
          <div className="flex items-center w-full">
            <div
              ref={containerRef}
              className="flex gap-3 items-center transition-all duration-500 ease-in-out flex-wrap"
              style={{
                width: "90%",
                overflowY: showAll ? "auto" : "hidden",
                maxHeight: showAll ? "200px" : "120px",
              }}
            >
              {(visibleRooms || []).map((option, index) => (
                <div
                  key={option?.id || option?.value}
                  className="group border rounded-lg px-4 py-2.5 whitespace-nowrap transition-all duration-200 hover:scale-105 shadow-sm"
                  style={{
                    background: cardColor,
                    color: ORANGE,
                    borderColor: borderColor,
                    animation: `fadeInUp 0.3s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: ORANGE }}
                    ></div>
                    <span className="font-medium">
                      {typeof option?.rooms === "string"
                        ? option.rooms
                        : typeof option?.label === "string"
                        ? option.label
                        : ""}
                    </span>
                  </div>
                </div>
              ))}
              {(visibleRooms || []).length === 0 && (
                <div className="flex items-center justify-center w-full py-8">
                  <div className="text-center">
                    <div
                      className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center"
                      style={{ background: "#fff7ed" }}
                    >
                      <svg
                        className="w-8 h-8"
                        fill="none"
                        stroke={ORANGE}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <span
                      style={{ color: borderColor }}
                      className="text-sm font-medium"
                    >
                      No rooms available
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div
              className="flex justify-end items-center pl-4"
              style={{ width: "10%" }}
            >
              {(roomOptions || []).length > (visibleRooms || []).length && (
                <button
                  className="text-sm font-medium px-3 py-1 rounded-full transition-all duration-200 hover:scale-105"
                  style={{
                    color: ORANGE,
                    background: "rgba(255, 190, 99, 0.1)",
                    border: `1px solid ${ORANGE}`,
                  }}
                  onClick={() => setShowAll((prev) => !prev)}
                >
                  {showAll ? "Show Less" : "Show More"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Add Room & Flat Type buttons */}
        <div className="flex gap-4 mb-4">
          <button
            className="group border-2 rounded-xl px-6 py-3 flex items-center gap-3 shadow-sm transition-all duration-200 hover:shadow-lg hover:scale-105"
            style={{
              color: ORANGE,
              borderColor: borderColor,
              background: cardColor,
            }}
            onClick={() => setCreateNewRoom(!createNewRoom)}
          >
            <IoMdAdd className="text-xl group-hover:rotate-90 transition-transform duration-200" />
            <span className="font-semibold">Add New Room</span>
          </button>
          <button
            className="group rounded-xl px-6 py-3 flex items-center gap-3 shadow-sm transition-all duration-200 hover:shadow-lg hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${ORANGE} 0%, #f5a623 100%)`,
              color: "#fff",
            }}
            onClick={() => setIsFlatType(!isFlatType)}
          >
            <IoMdAdd className="text-xl group-hover:rotate-90 transition-transform duration-200" />
            <span className="font-semibold">Create Flat Type</span>
          </button>
        </div>

        {/* Add Room input */}
        {createNewRoom && (
          <div
            className="w-full max-w-lg mb-8 rounded-xl p-6 border shadow-lg animate-slideDown mx-auto"
            style={{
              background:
                theme === "dark"
                  ? darkGradientBg
                  : "linear-gradient(135deg, #fdf3e4 0%, #fff7ed 100%)",
              borderColor: borderColor,
            }}
          >
            <div className="flex items-center space-x-2 mb-4">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: ORANGE }}
              >
                <IoMdAdd className="text-white text-sm" />
              </div>
              <h4 style={{ color: ORANGE }} className="text-lg font-semibold">
                Add New Room
              </h4>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={newRoom}
                onChange={(e) => setNewRoom(e.target.value)}
                placeholder="Enter room name (e.g., Living Room, Kitchen)"
                className="border-2 rounded-lg p-3 flex-1 transition-all duration-200 focus:scale-105"
                style={{
                  borderColor: borderColor,
                  background: cardColor,
                  color: textColor,
                }}
                onKeyPress={(e) => e.key === "Enter" && handleAddRoom()}
              />
              <button
                onClick={handleAddRoom}
                className="rounded-lg font-semibold transition-all duration-200 hover:scale-105"
                style={{
                  background: ORANGE,
                  color: "#fff",
                  padding: "12px 28px",
                }}
                disabled={isLoading}
              >
                {isLoading ? "Adding..." : "Add"}
              </button>
              <button
                onClick={() => {
                  setCreateNewRoom(false);
                  setNewRoom("");
                }}
                className="border-2 font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105"
                style={{
                  borderColor: borderColor,
                  background: cardColor,
                  color: textColor,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Flat Type Create form */}
        {isFlatType && (
          <div
            className="border-2 border-dashed rounded-xl p-8 mb-8 shadow-lg animate-slideDown mx-auto"
            style={{
              background:
                theme === "dark"
                  ? darkGradientBg
                  : `linear-gradient(135deg, ${cardColor} 0%, #fafafa 100%)`,
              borderColor: borderColor,
            }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: ORANGE }}
              >
                <IoMdAdd className="text-white text-lg" />
              </div>
              <h3 className="text-xl font-bold" style={{ color: ORANGE }}>
                Create New Flat Type
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="space-y-2">
                <label
                  className="block text-sm font-semibold"
                  style={{ color: textColor }}
                >
                  Flat Type Name *
                </label>
                <input
                  type="text"
                  value={flatTypeDetails.flat_type}
                  onChange={(e) =>
                    handleFlatTypeChange("flat_type", e.target.value)
                  }
                  className="border-2 rounded-lg w-full p-3 transition-all duration-200 focus:scale-105"
                  style={{
                    borderColor: borderColor,
                    background: cardColor,
                    color: textColor,
                  }}
                  placeholder="e.g., 2BHK, 3BHK, Studio"
                />
              </div>
              <div className="space-y-2">
                <label
                  className="block text-sm font-semibold"
                  style={{ color: textColor }}
                >
                  Select Rooms *
                </label>
                <Select
                  isMulti
                  options={formattedRoomOptions}
                  value={flatTypeDetails.room_ids}
                  onChange={(e) => handleFlatTypeChange("room_ids", e)}
                  placeholder="Choose rooms for this flat type"
                  className="basic-multi-select"
                  classNamePrefix="select"
                  closeMenuOnSelect={false}
                  maxMenuHeight={200}
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      backgroundColor: "#fcf2e7",
                      color: textColor,
                      borderColor: state.isFocused ? ORANGE : borderColor,
                      borderWidth: "2px",
                      transform: state.isFocused ? "scale(1.02)" : "scale(1)",
                      transition: "all 0.2s",
                    }),
                    menu: (base) => ({
                      ...base,
                      backgroundColor: cardColor,
                      boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                    }),
                    multiValue: (base) => ({
                      ...base,
                      backgroundColor: "#fdf3e4",
                      border: `1px solid ${ORANGE}`,
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected
                        ? "#fdf3e4"
                        : state.isFocused
                        ? "#fff7ed"
                        : cardColor,
                      color: textColor,
                    }),
                  }}
                />
              </div>
              {/* <div className="flex items-end">
                <div
                  className="flex items-center space-x-3 p-4 rounded-lg"
                  style={{
                    background: theme === "dark" ? darkAccentBg : "#fdf3e4",
                  }}
                >
                  <input
                    type="checkbox"
                    id="customCheckbox"
                    className="w-5 h-5 border-2 rounded transition-all duration-200"
                    style={{
                      borderColor: borderColor,
                      accentColor: ORANGE,
                    }}
                    checked={flatTypeDetails.is_common}
                    onChange={() =>
                      handleFlatTypeChange(
                        "is_common",
                        !flatTypeDetails.is_common
                      )
                    }
                  />
                  <label
                    htmlFor="customCheckbox"
                    className="text-sm font-semibold cursor-pointer"
                    style={{ color: textColor }}
                  >
                    Mark as Common Area
                  </label>
                </div>
              </div> */}
            </div>
            <div className="flex gap-4">
              <button
                className="font-bold px-8 py-3 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${ORANGE} 0%, #f5a623 100%)`,
                  color: "#fff",
                }}
                onClick={handleCreateFlatType}
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Flat Type"}
              </button>
              <button
                className="border-2 font-semibold px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105"
                style={{
                  borderColor: borderColor,
                  color: ORANGE,
                  background: cardColor,
                }}
                onClick={() => {
                  setIsFlatType(false);
                  setFlatTypeDetails({
                    flat_type: "",
                    is_common: false,
                    room_ids: [],
                  });
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* --- Cards Section --- */}
        {(flatTypeList || []).length > 0 && (
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(flatTypeList || []).map((flatType, index) => {
                const displayData = flatType;
                return (
                  <div
                    key={flatType.id || flatType.flat_type_id || index}
                    className="group rounded-xl shadow-md border-2 overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105"
                    style={{
                      background:
                        theme === "dark"
                          ? darkGradientBg
                          : `linear-gradient(135deg, ${cardColor} 0%, #fafafa 100%)`,
                      borderColor: borderColor,
                      animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                    }}
                  >
                    <div
                      className="p-4 border-b"
                      style={{
                        background:
                          theme === "dark"
                            ? darkGradientBg
                            : "linear-gradient(135deg, #fdf3e4 0%, #fff7ed 100%)",
                        borderColor: theme === "dark" ? "#4a5568" : "#f5d299",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <h3
                          style={{ color: ORANGE }}
                          className="text-lg font-bold"
                        >
                          {displayData.flat_type ||
                            displayData.type_name ||
                            "Unnamed"}
                        </h3>
                        {/* <span
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
                          style={{
                            background: displayData.is_common
                              ? "#e6f3ff"
                              : "#f0f9ff",
                            color: displayData.is_common
                              ? "#0066cc"
                              : "#0080ff",
                            border: `1px solid ${
                              displayData.is_common ? "#0066cc" : "#0080ff"
                            }`,
                          }}
                        >
                          {displayData.is_common ? "Common Area" : "Regular"}
                        </span> */}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="mb-3">
                        <h4
                          className="text-sm font-semibold mb-2"
                          style={{ color: textColor }}
                        >
                          Assigned Rooms (
                          {
                            (displayData.rooms || displayData.room_ids || [])
                              .length
                          }
                          )
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {(
                            displayData.room_ids ||
                            displayData.rooms ||
                            []
                          ).map((roomObj, idx) => {
                            const roomId =
                              typeof roomObj === "object"
                                ? roomObj.value
                                : roomObj;
                            const roomLabel =
                              formattedRoomOptions.find(
                                (item) => item.value === roomId
                              )?.label || `Room ${roomId}`;
                            return (
                              <span
                                key={`${roomId}-${idx}`}
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm"
                                style={{
                                  background:
                                    theme === "dark" ? "#4a5568" : "#fff7ed",
                                  color: ORANGE,
                                  border: `1px solid ${ORANGE}`,
                                }}
                              >
                                {typeof roomLabel === "string"
                                  ? roomLabel
                                  : String(roomLabel)}
                              </span>
                            );
                          })}
                          {!displayData.room_ids &&
                            (!displayData.rooms ||
                              displayData.rooms.length === 0) && (
                              <span
                                className="text-sm italic"
                                style={{ color: "#999" }}
                              >
                                No rooms assigned
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                    <div
                      className="px-4 py-2 text-xs"
                      style={{
                        background:
                          theme === "dark"
                            ? "rgba(255, 190, 99, 0.1)"
                            : "rgba(255, 190, 99, 0.05)",
                        color: theme === "dark" ? "#a0aec0" : "#666",
                      }}
                    >
                      {/* <div className="flex items-center justify-between">
                        <span>
                          Flat Type ID:{" "}
                          {flatType.id || flatType.flat_type_id || "N/A"}
                        </span>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 rounded-full bg-green-400"></div>
                          <span>Active</span>
                        </div>
                      </div> */}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && (flatTypeList || []).length === 0 && (
          <div className="text-center py-16 mb-8">
            <div
              className="mx-auto w-32 h-32 rounded-full flex items-center justify-center mb-6 shadow-lg"
              style={{
                background:
                  theme === "dark"
                    ? darkGradientBg
                    : "linear-gradient(135deg, #fdf3e4 0%, #fff7ed 100%)",
              }}
            >
              <svg
                className="w-16 h-16"
                fill="none"
                stroke={ORANGE}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-3" style={{ color: ORANGE }}>
              No Flat Types Created Yet
            </h3>
            <p
              style={{ color: textColor }}
              className="mb-6 text-lg opacity-75 max-w-md mx-auto"
            >
              Start building your project by creating your first flat type
              configuration with room assignments
            </p>
            <button
              onClick={() => setIsFlatType(true)}
              className="px-8 py-4 rounded-xl inline-flex items-center gap-3 font-bold text-lg shadow-lg transition-all duration-200 hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${ORANGE} 0%, #f5a623 100%)`,
                color: "#fff",
              }}
            >
              <IoMdAdd className="text-xl" />
              Create Your First Flat Type
            </button>
          </div>
        )}
      </div>
      {/* Sticky Navigation */}
      <div
        className="flex justify-between items-center px-8 py-6 mt-0 shadow-lg"
        style={{
          borderTop: `2px solid ${borderColor}`,
          background:
            theme === "dark"
              ? darkGradientBg
              : `linear-gradient(135deg, ${cardColor} 0%, #fafafa 100%)`,
          position: "sticky",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
        }}
      >
        <button
          className="group px-8 py-3 rounded-xl font-bold text-lg shadow-md transition-all duration-200 hover:scale-105 disabled:opacity-50"
          style={{
            background: "#94a3b8",
            color: "#fff",
          }}
          onClick={previousStep}
          disabled={isLoading}
        >
          <span className="flex items-center space-x-2">
            <svg
              className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>Previous Step</span>
          </span>
        </button>
        <div className="flex items-center space-x-3">
          <div className="text-sm font-medium" style={{ color: textColor }}>
            Ready to continue?
          </div>
          <button
            className="group px-8 py-3 rounded-xl font-bold text-lg shadow-md transition-all duration-200 hover:scale-105 disabled:opacity-50"
            style={{
              background: `linear-gradient(135deg, ${ORANGE} 0%, #f5a623 100%)`,
              color: "#fff",
            }}
            onClick={nextStep}
            disabled={isLoading}
          >
            <span className="flex items-center space-x-2">
              <span>{isLoading ? "Processing..." : "Continue"}</span>
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </button>
        </div>
      </div>
      <style jsx>{`
        .content-scroll-area {
          scrollbar-width: thin;
          scrollbar-color: ${ORANGE} #f1f1f1;
        }
        .content-scroll-area::-webkit-scrollbar {
          width: 7px;
        }
        .content-scroll-area::-webkit-scrollbar-thumb {
          background: ${ORANGE};
          border-radius: 3px;
        }
        .content-scroll-area::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default FlatType;

// import React, { useState, useMemo } from "react";

// const palette = {
//   card: "bg-white",
//   border: "border-gray-300",
//   primary: "bg-orange-500 text-white",
//   secondary: "bg-orange-100 text-orange-700",
//   shadow: "shadow-md",
//   badge: "bg-orange-200 text-orange-900 font-bold",
// };

// export default function LocationHierarchySelector({
//   hierarchyData,
//   selected,
//   onChange,
//   modal = false,
//   onClose,
// }) {
//   // selected = { buildingId, levelId, zoneId, flatId, roomIds: [] }
//   // onChange receives new selected object

//   const [localSelected, setLocalSelected] = useState(
//     selected || {
//       buildingId: "",
//       levelId: "",
//       zoneId: "",
//       flatId: "",
//       roomIds: [],
//     }
//   );

//   // Utility: Find objects by id
//   const selectedBuilding = useMemo(
//     () => hierarchyData?.buildings?.find((b) => b.id === Number(localSelected.buildingId)),
//     [hierarchyData, localSelected.buildingId]
//   );
//   const selectedLevel = useMemo(
//     () => selectedBuilding?.levels?.find((l) => l.id === Number(localSelected.levelId)),
//     [selectedBuilding, localSelected.levelId]
//   );
//   const selectedZone = useMemo(
//     () => selectedLevel?.zones?.find((z) => z.id === Number(localSelected.zoneId)),
//     [selectedLevel, localSelected.zoneId]
//   );
//   const selectedFlat = useMemo(
//     () => selectedZone?.flats?.find((f) => f.id === Number(localSelected.flatId)),
//     [selectedZone, localSelected.flatId]
//   );

//   // Clear child selections when parent changes
//   function handleSelect(key, value) {
//     let newSelected = { ...localSelected, [key]: value };
//     // Clear children if parent changes
//     if (key === "buildingId") {
//       newSelected.levelId = "";
//       newSelected.zoneId = "";
//       newSelected.flatId = "";
//       newSelected.roomIds = [];
//     }
//     if (key === "levelId") {
//       newSelected.zoneId = "";
//       newSelected.flatId = "";
//       newSelected.roomIds = [];
//     }
//     if (key === "zoneId") {
//       newSelected.flatId = "";
//       newSelected.roomIds = [];
//     }
//     if (key === "flatId") {
//       newSelected.roomIds = [];
//     }
//     setLocalSelected(newSelected);
//     if (onChange) onChange(newSelected);
//   }

//   // Room multi-select
//   function handleRoomToggle(roomId) {
//     let ids = localSelected.roomIds || [];
//     if (ids.includes(roomId)) {
//       ids = ids.filter((id) => id !== roomId);
//     } else {
//       ids = [...ids, roomId];
//     }
//     const newSelected = { ...localSelected, roomIds: ids };
//     setLocalSelected(newSelected);
//     if (onChange) onChange(newSelected);
//   }

//   function selectAllRooms() {
//     if (!selectedFlat?.rooms?.length) return;
//     const ids = selectedFlat.rooms.map((r) => r.id);
//     const newSelected = { ...localSelected, roomIds: ids };
//     setLocalSelected(newSelected);
//     if (onChange) onChange(newSelected);
//   }

//   function clearAllRooms() {
//     const newSelected = { ...localSelected, roomIds: [] };
//     setLocalSelected(newSelected);
//     if (onChange) onChange(newSelected);
//   }

//   // UI
//   const content = (
//     <div className={`rounded-xl p-6 border ${palette.card} ${palette.border} ${palette.shadow} w-full`}>
//       {/* Building */}
//       <div className="mb-4">
//         <label className="font-semibold mb-2 block">Building</label>
//         <select
//           className="w-full p-3 border rounded-xl"
//           value={localSelected.buildingId}
//           onChange={(e) => handleSelect("buildingId", e.target.value)}
//         >
//           <option value="">Select Building</option>
//           {(hierarchyData?.buildings || []).map((b) => (
//             <option key={b.id} value={b.id}>{b.name}</option>
//           ))}
//         </select>
//       </div>

//       {/* Level */}
//       {selectedBuilding?.levels?.length > 0 && (
//         <div className="mb-4">
//           <label className="font-semibold mb-2 block">Level</label>
//           <select
//             className="w-full p-3 border rounded-xl"
//             value={localSelected.levelId}
//             onChange={(e) => handleSelect("levelId", e.target.value)}
//           >
//             <option value="">Select Level</option>
//             {selectedBuilding.levels.map((l) => (
//               <option key={l.id} value={l.id}>{l.name}</option>
//             ))}
//           </select>
//         </div>
//       )}

//       {/* Zone */}
//       {selectedLevel?.zones?.length > 0 && (
//         <div className="mb-4">
//           <label className="font-semibold mb-2 block">Zone</label>
//           <select
//             className="w-full p-3 border rounded-xl"
//             value={localSelected.zoneId}
//             onChange={(e) => handleSelect("zoneId", e.target.value)}
//           >
//             <option value="">Select Zone</option>
//             {selectedLevel.zones.map((z) => (
//               <option key={z.id} value={z.id}>{z.name}</option>
//             ))}
//           </select>
//         </div>
//       )}

//       {/* Flat */}
//       {selectedZone?.flats?.length > 0 && (
//         <div className="mb-4">
//           <label className="font-semibold mb-2 block">Flat</label>
//           <select
//             className="w-full p-3 border rounded-xl"
//             value={localSelected.flatId}
//             onChange={(e) => handleSelect("flatId", e.target.value)}
//           >
//             <option value="">Select Flat</option>
//             {selectedZone.flats.map((f) => (
//               <option key={f.id} value={f.id}>{f.number}</option>
//             ))}
//           </select>
//         </div>
//       )}

//       {/* Rooms (multi-select) */}
//       {selectedFlat?.rooms?.length > 0 && (
//         <div className="mb-4">
//           <label className="font-semibold mb-2 block">Rooms</label>
//           <div className="flex gap-2 mb-2">
//             <button
//               type="button"
//               className={`px-4 py-2 rounded-xl ${palette.primary}`}
//               onClick={selectAllRooms}
//             >Select All</button>
//             <button
//               type="button"
//               className={`px-4 py-2 rounded-xl ${palette.secondary}`}
//               onClick={clearAllRooms}
//             >Clear All</button>
//           </div>
//           <div className="grid grid-cols-2 gap-2">
//             {selectedFlat.rooms.map((room) => (
//               <label
//                 key={room.id}
//                 className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer ${
//                   localSelected.roomIds.includes(room.id)
//                     ? "bg-orange-100 border-orange-400"
//                     : "border-gray-200"
//                 }`}
//               >
//                 <input
//                   type="checkbox"
//                   checked={localSelected.roomIds.includes(room.id)}
//                   onChange={() => handleRoomToggle(room.id)}
//                   className="w-4 h-4"
//                 />
//                 <span>{room.rooms}</span>
//               </label>
//             ))}
//           </div>
//         </div>
//       )}
//       {/* Done button if modal */}
//       {modal && (
//         <div className="flex justify-end mt-6">
//           <button
//             type="button"
//             className={`px-8 py-3 rounded-xl font-semibold ${palette.primary}`}
//             onClick={onClose}
//           >Done</button>
//         </div>
//       )}
//     </div>
//   );

//   return modal ? (
//     <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
//       <div className="w-full max-w-xl">{content}</div>
//     </div>
//   ) : (
//     content
//   );
// }



import React, { useMemo } from "react";

/**
 * hierarchyData sample structure:
 * {
 *   buildings: [
 *     { id, name, levels: [
 *         { id, name, zones: [
 *             { id, name, flats: [
 *                 { id, number, rooms: [ { id, rooms }, ... ] }
 *               ] }
 *           ] }
 *       ] }
 *   ]
 * }
 */

export default function LocationHierarchySelector({
  hierarchyData,
  selected,
  onChange,
}) {
  // Memoized levels/zones/flats/rooms based on selection
  const levels = useMemo(() => {
    const b = hierarchyData?.buildings?.find(
      (b) => String(b.id) === String(selected.buildingId)
    );
    return b?.levels || [];
  }, [hierarchyData, selected.buildingId]);

  const zones = useMemo(() => {
    const l = levels.find((l) => String(l.id) === String(selected.levelId));
    return l?.zones || [];
  }, [levels, selected.levelId]);

  const flats = useMemo(() => {
    const z = zones.find((z) => String(z.id) === String(selected.zoneId));
    return z?.flats || [];
  }, [zones, selected.zoneId]);

  // Room list for selected flat
  const rooms = useMemo(() => {
    const f = flats.find((f) => String(f.id) === String(selected.flatId));
    return f?.rooms || [];
  }, [flats, selected.flatId]);

  // --- Handlers
  const handleBuilding = (e) => {
    onChange({
      buildingId: e.target.value,
      levelId: "",
      zoneId: "",
      flatId: "",
      roomIds: [],
    });
  };
  const handleLevel = (e) => {
    onChange({
      ...selected,
      levelId: e.target.value,
      zoneId: "",
      flatId: "",
      roomIds: [],
    });
  };
  const handleZone = (e) => {
    onChange({
      ...selected,
      zoneId: e.target.value,
      flatId: "",
      roomIds: [],
    });
  };
  const handleFlat = (e) => {
    onChange({
      ...selected,
      flatId: e.target.value,
      roomIds: [],
    });
  };

  // Multi-select rooms
  const handleRoomToggle = (roomId) => {
    let roomIds = selected.roomIds || [];
    if (roomIds.includes(roomId)) {
      roomIds = roomIds.filter((id) => id !== roomId);
    } else {
      roomIds = [...roomIds, roomId];
    }
    onChange({
      ...selected,
      roomIds,
    });
  };

  const handleSelectAllRooms = () => {
    onChange({
      ...selected,
      roomIds: rooms.map((r) => r.id),
    });
  };
  const handleClearRooms = () => {
    onChange({
      ...selected,
      roomIds: [],
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {/* Building */}
      <div>
        <label className="font-semibold block mb-1">Building</label>
        <select
          className="w-full p-2 border rounded"
          value={selected.buildingId}
          onChange={handleBuilding}
        >
          <option value="">Select</option>
          {hierarchyData?.buildings?.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>
      {/* Level */}
      <div>
        <label className="font-semibold block mb-1">Level</label>
        <select
          className="w-full p-2 border rounded"
          value={selected.levelId}
          onChange={handleLevel}
          disabled={!levels.length}
        >
          <option value="">Select</option>
          {levels.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </div>
      {/* Zone */}
      <div>
        <label className="font-semibold block mb-1">Zone</label>
        <select
          className="w-full p-2 border rounded"
          value={selected.zoneId}
          onChange={handleZone}
          disabled={!zones.length}
        >
          <option value="">Select</option>
          {zones.map((z) => (
            <option key={z.id} value={z.id}>
              {z.name}
            </option>
          ))}
        </select>
      </div>
      {/* Flat */}
      <div>
        <label className="font-semibold block mb-1">Flat</label>
        <select
          className="w-full p-2 border rounded"
          value={selected.flatId}
          onChange={handleFlat}
          disabled={!flats.length}
        >
          <option value="">Select</option>
          {flats.map((f) => (
            <option key={f.id} value={f.id}>
              {f.number}
            </option>
          ))}
        </select>
      </div>
      {/* Rooms - Multi-select */}
      <div>
        <label className="font-semibold block mb-1">
          Rooms {rooms.length > 0 && <span className="ml-1 text-xs text-gray-500">({rooms.length})</span>}
        </label>
        <div className="flex flex-wrap gap-2">
          {rooms.length === 0 && (
            <span className="text-gray-400 text-xs">Select a flat</span>
          )}
          {rooms.length > 0 && (
            <>
              <button
                type="button"
                className="text-green-600 underline text-xs"
                onClick={handleSelectAllRooms}
              >
                All
              </button>
              <button
                type="button"
                className="text-blue-600 underline text-xs"
                onClick={handleClearRooms}
              >
                None
              </button>
              {rooms.map((r) => (
                <label
                  key={r.id}
                  className={`border rounded px-2 py-1 cursor-pointer text-xs ${selected.roomIds.includes(r.id) ? "bg-green-100 border-green-500 font-bold" : ""}`}
                >
                  <input
                    type="checkbox"
                    className="mr-1"
                    checked={selected.roomIds.includes(r.id)}
                    onChange={() => handleRoomToggle(r.id)}
                  />
                  {r.rooms}
                </label>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import { MdDelete, MdModeEdit } from "react-icons/md";
import { useSelector, useDispatch } from "react-redux";
import {
  getBuildingnlevel,
  createLevel,
  updateLevel,
  deleteLevel,
} from "../../api";
import { showToast } from "../../utils/toast";

import { setLevels } from "../../store/userSlice";
import { useTheme } from "../../ThemeContext"; // your theme hook

// Colors for light theme
const ORANGE = "#b54b13";
const ORANGE_DARK = "#882c10";
const ORANGE_LIGHT = "#f5ede6";
const BG_GRAY_LIGHT = "#efe9e3";

// Colors for dark theme
const DARK_BG = "#181820";
const DARK_ORANGE = "#facc15";
const DARK_ORANGE_DARK = "#b57f0f";

const additionalFloorTypes = [
  "Basement",
  "Parking",
  "Podium",
  "Terrace",
  "Ground",
];

// Utility to generate next floor name
function getNextFloorName(existingNames, baseName) {
  const regex = new RegExp(`^${baseName}(?:\\s(\\d+))?$`, "i");
  const numbers = existingNames
    .map((name) => {
      const match = name.match(regex);
      return match ? (match[1] ? parseInt(match[1]) : 1) : null;
    })
    .filter(Boolean);
  if (numbers.length === 0) return baseName;
  return `${baseName} ${Math.max(...numbers) + 1}`;
}

function Level({ nextStep, previousStep }) {
  const dispatch = useDispatch();
  const projectId = useSelector((state) => state.user.selectedProject.id);
  const { theme } = useTheme();

  const [towerDetails, setTowerDetails] = useState({});
  const [currentTower, setCurrentTower] = useState(null);
  const [floorInput, setFloorInput] = useState("");
  const [selectedCommonFloors, setSelectedCommonFloors] = useState([]);
  const [editing, setEditing] = useState({
    tower_id: null,
    level_name: "",
    index: -1,
    level_id: -1,
  });
  const [refreshFlag, setRefreshFlag] = useState(0);

  const isDark = theme === "dark";

  // Theme-based style variables
  const background = isDark ? DARK_BG : BG_GRAY_LIGHT;
  const borderColor = isDark ? `rgba(250, 200, 21, 0.2)` : `${ORANGE}20`;
  const textColor = isDark ? DARK_ORANGE_DARK : ORANGE_DARK;
  const buttonBorder = isDark ? DARK_ORANGE_DARK : ORANGE_DARK;
  const cardBg = isDark ? "#2e2e3d" : ORANGE_LIGHT;
  const buttonBg = isDark
    ? `linear-gradient(90deg, ${DARK_ORANGE_DARK} 60%, ${DARK_ORANGE} 100%)`
    : `linear-gradient(90deg, ${ORANGE_DARK} 60%, ${ORANGE} 100%)`;
  const buttonTextColor = "#fff";

  // Load towers and their floors
  const loadTowersAndLevels = async () => {
    try {
      const response = await getBuildingnlevel(projectId);
      const towers = response.data;
      const obj = {};
      towers.forEach((tower) => {
        obj[tower.id] = {
          details: tower,
          floors: (tower.levels || []).sort((a, b) => {
            const matchA = a.name.match(/\d+/);
            const matchB = b.name.match(/\d+/);
            if (!matchA && !matchB) return a.name.localeCompare(b.name);
            if (!matchA) return 1;
            if (!matchB) return -1;
            return parseInt(matchA[0]) - parseInt(matchB[0]);
          }),
        };
      });
      setTowerDetails(obj);
      dispatch(setLevels({ project_id: projectId, data: obj }));
    } catch (err) {
      showToast("Failed to load towers and floors","error");
    }
  };

  useEffect(() => {
    if (projectId) loadTowersAndLevels();
    // eslint-disable-next-line
  }, [projectId, refreshFlag]);

  // Add floors to current tower
  const handleAddFloors = async () => {
    const numFloors = Number(floorInput);
    if ((!numFloors || numFloors < 1) && selectedCommonFloors.length === 0) {
      showToast("Please enter a number or select floor types",'error');
      return;
    }
    let requests = [];
    const existingFloorNames = (towerDetails[currentTower]?.floors || []).map(
      (f) => f.name
    );
    let maxFloorNum = 0;
    existingFloorNames.forEach((name) => {
      const match = name.match(/^Floor (\d+)$/);
      if (match) {
        const num = parseInt(match[1]);
        if (num > maxFloorNum) maxFloorNum = num;
      }
    });
    for (let i = 1; i <= numFloors; i++) {
      let floorNum = maxFloorNum + i;
      let uniqueName = `Floor ${floorNum}`;
      requests.push(
        createLevel({
          building: currentTower,
          name: uniqueName,
        })
      );
      existingFloorNames.push(uniqueName);
    }
    selectedCommonFloors.forEach((type) => {
      let uniqueName = getNextFloorName(existingFloorNames, type);
      requests.push(
        createLevel({
          building: currentTower,
          name: uniqueName,
        })
      );
      existingFloorNames.push(uniqueName);
    });
    try {
      await Promise.all(requests);
      showToast("Floors added successfully",'success');
      setCurrentTower(null);
      setFloorInput("");
      setSelectedCommonFloors([]);
      setRefreshFlag((f) => f + 1);
    } catch {
      showToast("Failed to add one or more floors",'error');
    }
  };

  // Edit floor
  const handleEditFloor = async () => {
    const { tower_id, level_name, level_id } = editing;
    if (!level_name.trim()) {
      showToast("Floor name cannot be empty",'error');
      return;
    }
    try {
      const response = await updateLevel({
        id: level_id,
        name: level_name,
        building: Number(tower_id),
      });
      if (response.status === 200) {
        showToast(response.data.message || "Floor updated!",'success');
        setEditing({
          tower_id: null,
          level_name: "",
          index: -1,
          level_id: -1,
        });
        setRefreshFlag((f) => f + 1);
      } else {
        showToast("Failed to update floor",'error');
      }
    } catch (error) {
      showToast("Update failed",'error');
    }
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditing({
      tower_id: null,
      level_name: "",
      index: -1,
      level_id: -1,
    });
  };

  // Delete floor
  const handleDeleteFloor = async (id) => {
    try {
      const response = await deleteLevel(id);
      if (response.status === 200 || response.status === 204) {
        showToast("Floor deleted!","success");
        setRefreshFlag((f) => f + 1);
      } else {
        showToast("Failed to delete floor",'error');
      }
    } catch (err) {
      showToast("Delete failed",'error');
    }
  };

  // Toggle floor type selection
  const handleToggleFloorType = (type) => {
    setSelectedCommonFloors((prev) =>
      prev.includes(type)
        ? prev.filter((item) => item !== type)
        : [...prev, type]
    );
  };

  // Delete helpers
  const deleteAllNumericFloors = async (towerId) => {
    const toDelete = (towerDetails[towerId]?.floors || []).filter((f) =>
      /^Floor \d+$/.test(f.name)
    );
    if (!toDelete.length) return showToast("No numeric floors to delete",'info');
    if (
      window.confirm(
        `Delete all numeric floors for ${towerDetails[towerId].details.name}?`
      )
    ) {
      await Promise.all(toDelete.map((f) => deleteLevel(f.id)));
      showToast("All numeric floors deleted",'success');
      setRefreshFlag((f) => f + 1);
    }
  };

  const deleteAllStaticFloors = async (towerId) => {
    const staticTypes = additionalFloorTypes;
    const staticRegex = new RegExp(
      `^(${staticTypes.join("|")})( \\d+)?$`,
      "i"
    );
    const toDelete = (towerDetails[towerId]?.floors || []).filter((f) =>
      staticRegex.test(f.name)
    );
    if (!toDelete.length) return showToast("No static type floors to delete",'info');
    if (
      window.confirm(
        `Delete all static type floors for ${towerDetails[towerId].details.name}?`
      )
    ) {
      await Promise.all(toDelete.map((f) => deleteLevel(f.id)));
      showToast("All static type floors deleted",'success');
      setRefreshFlag((f) => f + 1);
    }
  };

  const deleteAllOfType = async (towerId, type) => {
    const typeRegex = new RegExp(`^${type}( \\d+)?$`, "i");
    const toDelete = (towerDetails[towerId]?.floors || []).filter((f) =>
      typeRegex.test(f.name)
    );
    if (!toDelete.length) return showToast(`No ${type} floors to delete`,'error');
    if (
      window.confirm(
        `Delete all ${type} floors for ${towerDetails[towerId].details.name}?`
      )
    ) {
      await Promise.all(toDelete.map((f) => deleteLevel(f.id)));
      showToast(`All ${type} floors deleted`,'success');
      setRefreshFlag((f) => f + 1);
    }
  };

  return (
    <div
      className="max-w-7xl my-8 mx-auto p-6 rounded-2xl shadow-2xl"
      style={{ background, border: `2px solid ${borderColor}` }}
    >
      <h2
        className="text-2xl font-bold text-center mb-6"
        style={{ color: textColor, letterSpacing: "1.5px" }}
      >
        Add Floors to Towers
      </h2>

      {/* Tower cards */}
      <div className="w-full overflow-x-auto pb-6 flex justify-center">
        <div className="flex gap-7">
          {Object.keys(towerDetails).map((towerId) => (
            <div
              key={towerId}
              className="rounded-2xl border px-3 py-4 shadow-lg hover:shadow-2xl transition-shadow duration-300 min-w-[270px]"
              style={{
                borderColor: buttonBorder,
                background: cardBg,
                color: textColor,
              }}
            >
              <h3
                className="text-lg font-bold text-center mb-2"
                style={{ color: textColor }}
              >
                {towerDetails[towerId].details.name}
              </h3>

              <div className="flex flex-wrap gap-2 mb-2 justify-center">
                <button
                  className="text-xs px-3 py-1 rounded font-bold"
                  style={{
                    background: isDark ? "#523218" : "#e6c5b8",
                    color: textColor,
                    border: `1.5px solid ${buttonBorder}`,
                  }}
                  onClick={() => deleteAllNumericFloors(towerId)}
                >
                  Delete All Numeric
                </button>
                <button
                  className="text-xs px-3 py-1 rounded font-bold"
                  style={{
                    background: isDark ? "#60441f" : "#f1d8c6",
                    color: textColor,
                    border: `1.5px solid ${buttonBorder}`,
                  }}
                  onClick={() => deleteAllStaticFloors(towerId)}
                >
                  Delete All Static
                </button>
                {additionalFloorTypes.map((type) => (
                  <button
                    key={type}
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      background: isDark ? "#463512" : "#efe9e3",
                      color: textColor,
                      border: `1px solid ${buttonBorder}80`,
                    }}
                    onClick={() => deleteAllOfType(towerId, type)}
                  >
                    Delete {type}
                  </button>
                ))}
              </div>

              <ul className="mt-2 space-y-1 max-h-[350px] overflow-y-auto pr-2 py-2">
                {(towerDetails[towerId]?.floors || []).map((floor, i) => (
                  <li
                    key={floor.id}
                    className="flex justify-between items-center bg-white p-2 rounded-xl shadow"
                    style={{ color: textColor }}
                  >
                    {editing.level_id === floor.id ? (
                      <div className="flex w-full items-center gap-2">
                        <input
                          type="text"
                          value={editing.level_name}
                          onChange={(e) =>
                            setEditing((prev) => ({
                              ...prev,
                              level_name: e.target.value,
                            }))
                          }
                          className="flex-1 border rounded-xl px-2 py-1"
                          style={{
                            borderColor: buttonBorder,
                            color: textColor,
                            background: isDark ? DARK_BG : "#fff",
                          }}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleEditFloor();
                            if (e.key === "Escape") handleCancelEdit();
                          }}
                        />
                        <button
                          className="px-4 py-1 rounded-lg font-semibold"
                          style={{
                            background: buttonBg,
                            color: buttonTextColor,
                          }}
                          onClick={handleEditFloor}
                        >
                          Save
                        </button>
                        <button
                          className="px-4 py-1 rounded-lg font-semibold"
                          style={{
                            background: isDark ? DARK_BG : "#fff",
                            color: textColor,
                            border: `1px solid ${buttonBorder}`,
                          }}
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <span
                          className="px-2 text-sm"
                          style={{ fontWeight: 600 }}
                        >
                          {floor.name}
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDeleteFloor(floor.id)}
                            style={{ color: ORANGE_DARK }}
                            title="Delete"
                          >
                            <MdDelete />
                          </button>
                          <button
                            onClick={() =>
                              setEditing({
                                tower_id: towerId,
                                level_name: floor.name,
                                level_id: floor.id,
                                index: i,
                              })
                            }
                            style={{ color: ORANGE }}
                            title="Edit"
                          >
                            <MdModeEdit />
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>

              <div className="flex justify-center mt-3">
                <button
                  className="flex items-center px-4 py-2 rounded-xl font-semibold shadow"
                  style={{
                    background: buttonBg,
                    color: buttonTextColor,
                  }}
                  onClick={() => setCurrentTower(towerId)}
                >
                  <FaPlus className="mr-2" />
                  Add Floor
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for adding floors */}
      {currentTower && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div
            className="p-7 rounded-2xl shadow-2xl w-full max-w-md relative"
            style={{
              background: cardBg,
              border: `2px solid ${borderColor}`,
            }}
          >
            <h2
              className="text-xl font-bold mb-4"
              style={{ color: textColor }}
            >
              Add Floors to{" "}
              <span style={{ color: isDark ? DARK_ORANGE : ORANGE }}>
                {towerDetails[currentTower]?.details?.name || ""}
              </span>
            </h2>
            <div className="mb-3 flex items-center gap-2">
              <input
                type="number"
                value={floorInput}
                onChange={(e) => setFloorInput(e.target.value)}
                className="border rounded-xl px-3 py-2 flex-1"
                style={{
                  borderColor: buttonBorder,
                  background: isDark ? DARK_BG : "#fff",
                  color: textColor,
                }}
                placeholder="Number of Floors"
                min="1"
              />
              {/* <button
                className="px-3 py-2 rounded-xl font-bold text-white"
                style={{
                  background: buttonBg,
                }}
                onClick={() => setFloorInput(10)}
              >
                +10 Floors
              </button> */}
              <button
                className="px-2 py-2 rounded-xl font-bold text-xs"
                style={{
                  background: isDark ? DARK_BG : "#fff",
                  color: textColor,
                  border: `1px solid ${buttonBorder}`,
                }}
                onClick={() => setFloorInput("")}
              >
                Clear
              </button>
            </div>

            <h2
              className="text-md font-bold mb-2"
              style={{ color: textColor }}
            >
              Select Common Floor Types
            </h2>

            <div className="mb-2 flex flex-wrap gap-2">
              <button
                className={`px-3 py-2 rounded-xl font-semibold border ${
                  additionalFloorTypes.every((t) =>
                    selectedCommonFloors.includes(t)
                  )
                    ? "text-white"
                    : ""
                }`}
                style={
                  additionalFloorTypes.every((t) =>
                    selectedCommonFloors.includes(t)
                  )
                    ? { background: ORANGE_DARK, borderColor: ORANGE_DARK }
                    : {
                        background: isDark ? DARK_BG : "#fff",
                        color: textColor,
                        borderColor: buttonBorder,
                      }
                }
                onClick={() => {
                  if (
                    additionalFloorTypes.every((t) =>
                      selectedCommonFloors.includes(t)
                    )
                  ) {
                    setSelectedCommonFloors([]);
                  } else {
                    setSelectedCommonFloors([...additionalFloorTypes]);
                  }
                }}
              >
                {additionalFloorTypes.every((t) =>
                  selectedCommonFloors.includes(t)
                )
                  ? "Unselect All Static"
                  : "Select All Static"}
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {additionalFloorTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => handleToggleFloorType(type)}
                  className="px-3 py-2 rounded-xl font-semibold"
                  style={
                    selectedCommonFloors.includes(type)
                      ? { background: ORANGE_DARK, color: "#fff" }
                      : {
                          background: isDark ? DARK_BG : "#fff",
                          color: textColor,
                          border: `1px solid ${buttonBorder}`,
                        }
                  }
                >
                  {type}
                </button>
              ))}
            </div>

            <button
              className="py-3 px-6 rounded-xl font-bold w-full shadow-lg"
              style={{
                background: buttonBg,
                color: buttonTextColor,
              }}
              onClick={handleAddFloors}
            >
              Add Floors
            </button>

            <button
              onClick={() => setCurrentTower(null)}
              className="absolute top-2 right-2"
              style={{
                color: textColor,
                background: isDark ? DARK_ORANGE_DARK : "#fff",
                borderRadius: 999,
                padding: 5,
                cursor: "pointer",
              }}
              title="Close"
            >
              <FaTimes size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Bottom buttons */}
      <div className="flex justify-between mt-10">
        <button
          className="px-8 py-3 rounded-xl font-semibold"
          style={{
            background: isDark ? DARK_BG : "#eee",
            color: textColor,
            border: `1px solid ${buttonBorder}`,
          }}
          onClick={previousStep}
        >
          Previous
        </button>
        <button
          className="px-8 py-3 rounded-xl font-semibold"
          style={{
            background: buttonBg,
            color: buttonTextColor,
          }}
          onClick={nextStep}
        >
          Save & Proceed to Next Step
        </button>
      </div>
    </div>
  );
}

export default Level;

import React, { useState, useEffect } from "react";
import projectImage from "../../Images/Project.png";
import {
  createTower,
  fetchTowersByProject,
  updateTower,
  DeleteTowerByid,
} from "../../api";
import { useSelector, useDispatch } from "react-redux";
import { showToast } from "../../utils/toast";
import { setTower, setSelectedTowerId } from "../../store/userSlice";
import { Plus, Edit3, Trash2, Check, X } from "lucide-react";
import { useTheme } from "../../ThemeContext";

const ORANGE = "#b54b13";
const ORANGE_DARK = "#882c10";
const ORANGE_LIGHT = "#f5ede6";
const BG_GRAY = "#efe9e3";

const GOLD = "#fde047";
const GOLD_DARK = "#facc15";
const GOLD_LIGHT = "#fff9db";
const BG_DARK = "#181820";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function Tower({ nextStep, previousStep }) {
  const dispatch = useDispatch();
  const projectId = useSelector((state) => state.user.selectedProject.id);
  const { theme } = useTheme();

  const [towerData, setTowerData] = useState({
    prefix: "Tower",
    numTowers: 1,
    namingConvention: "numeric",
  });

  const [previewTowers, setPreviewTowers] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const [towerDetails, setTowerDetails] = useState([]);
  const [fetchError, setFetchError] = useState("");
  const [editingIndex, setEditingIndex] = useState(-1);
  const [tempName, setTempName] = useState("");

  const loadTowers = async () => {
    try {
      setFetchError("");
      const response = await fetchTowersByProject(projectId);
      setTowerDetails(response.data);
      dispatch(setTower({ project_id: projectId, data: response.data }));
    } catch (err) {
      setFetchError("Failed to fetch tower details. Please try again.");
      setTowerDetails([]);
    }
  };

  useEffect(() => {
    loadTowers();
    // eslint-disable-next-line
  }, [projectId]);

  const handleDeleteTower = async (towerId) => {
    if (!window.confirm("Delete this tower?")) return;
    try {
      await DeleteTowerByid(towerId);
      showToast("Tower deleted!");
      loadTowers();
    } catch (err) {
      showToast("Failed to delete tower");
    }
  };

  const handleEditTower = async (towerId, name) => {
    try {
      await updateTower(towerId, { name });
      showToast("Tower name updated!");
      setEditingIndex(-1);
      setTempName("");
      loadTowers();
    } catch (err) {
      showToast("Failed to update tower name");
    }
  };

  const handlePreviewTowers = (e) => {
    e.preventDefault();
    let towers = [];
    let { prefix, numTowers, namingConvention } = towerData;
    numTowers = Number(numTowers);

    if (!prefix || !numTowers || numTowers < 1) {
      showToast("Prefix and Number of Towers are required");
      return;
    }
    for (let i = 0; i < numTowers; i++) {
      let name =
        namingConvention === "numeric"
          ? `${prefix} ${i + 1}`
          : `${prefix} ${alphabet[i] || i + 1}`;
      towers.push({ name });
    }
    setPreviewTowers(towers);
    setShowPreview(true);
  };

  const handlePreviewNameChange = (idx, newName) => {
    setPreviewTowers((prev) =>
      prev.map((tw, i) => (i === idx ? { ...tw, name: newName } : tw))
    );
  };

  const handleSubmit = async () => {
    try {
      for (const tw of previewTowers) {
        const formData = new FormData();
        formData.append("project", projectId);
        formData.append("name", tw.name);
        await createTower(formData);
      }
      showToast("Towers added!","success");
      setShowPreview(false);
      setPreviewTowers([]);
      loadTowers();
    } catch (error) {
      showToast("Failed to create towers.");
    }
  };

  // Theme dependent styles
  const isDark = theme === "dark";

  // Colors based on theme
  const background = isDark ? BG_DARK : BG_GRAY;
  const borderColor = isDark ? `${GOLD_DARK}30` : `${ORANGE}20`;
  const textColor = isDark ? GOLD_DARK : ORANGE_DARK;
  const inputBg = isDark ? "#282832" : "#fff";
  const inputTextColor = isDark ? GOLD_DARK : ORANGE_DARK;
  const inputBorderColor = isDark ? GOLD_DARK : ORANGE;
  const buttonGradient = isDark
    ? `linear-gradient(90deg, ${GOLD_DARK} 60%, ${GOLD} 100%)`
    : `linear-gradient(90deg, ${ORANGE_DARK} 60%, ${ORANGE} 100%)`;
  const previewBg = isDark ? "#2e2e3d" : ORANGE_LIGHT;
  const previewBorder = isDark ? `${GOLD_DARK}40` : `${ORANGE}40`;
  const towerCardBg = isDark ? "#2e2e3d" : ORANGE_LIGHT;
  const towerCardBorder = isDark ? GOLD_DARK : ORANGE;

  return (
    <div
      className="max-w-7xl mx-auto my-6 rounded-2xl shadow-2xl px-4 py-8"
      style={{
        background,
        border: `2px solid ${borderColor}`,
        color: textColor,
      }}
    >
      <h2
        className="text-2xl font-bold text-center mb-5"
        style={{ color: textColor, letterSpacing: "1.5px" }}
      >
        How many Towers would you like to add?
      </h2>
      {/* Form */}
      <form
        className="flex flex-wrap justify-center gap-6 mb-8"
        onSubmit={handlePreviewTowers}
      >
        <div className="flex flex-col w-56">
          <label className="font-semibold mb-1" style={{ color: textColor }}>
            Prefix
          </label>
          <input
            type="text"
            value={towerData.prefix}
            onChange={(e) =>
              setTowerData({ ...towerData, prefix: e.target.value })
            }
            className="border rounded-xl px-3 py-2 text-lg focus:outline-none focus:ring-2"
            style={{
              borderColor: inputBorderColor,
              background: inputBg,
              color: inputTextColor,
            }}
          />
        </div>
        <div className="flex flex-col w-56">
          <label className="font-semibold mb-1" style={{ color: textColor }}>
            Naming Convention
          </label>
          <select
            value={towerData.namingConvention}
            onChange={(e) =>
              setTowerData({ ...towerData, namingConvention: e.target.value })
            }
            className="border rounded-xl px-3 py-2 text-lg focus:outline-none focus:ring-2"
            style={{
              borderColor: inputBorderColor,
              background: inputBg,
              color: inputTextColor,
            }}
          >
            <option value="numeric">Numeric</option>
            <option value="alphabetic">Alphabetic</option>
          </select>
        </div>
        <div className="flex flex-col w-44">
          <label className="font-semibold mb-1" style={{ color: textColor }}>
            No. of Towers
          </label>
          <input
            type="number"
            value={towerData.numTowers}
            min="1"
            onChange={(e) =>
              setTowerData({ ...towerData, numTowers: e.target.value })
            }
            className="border rounded-xl px-3 py-2 text-lg focus:outline-none focus:ring-2"
            style={{
              borderColor: inputBorderColor,
              background: inputBg,
              color: inputTextColor,
            }}
          />
        </div>
        <div className="flex flex-col justify-end">
          <button
            type="submit"
            className="font-bold py-2 px-8 rounded-xl mt-5 flex items-center gap-2 shadow transition"
            style={{
              background: buttonGradient,
              color: "#fff",
            }}
          >
            <Plus className="w-5 h-5" /> Preview
          </button>
        </div>
      </form>

      {/* Preview section */}
      {showPreview && previewTowers.length > 0 && (
        <div className="mt-8">
          <h3
            className="text-lg font-bold mb-4 text-center"
            style={{ color: textColor }}
          >
            Preview & Edit Tower Names
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {previewTowers.map((tw, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-4 py-2 rounded-xl shadow"
                style={{
                  background: previewBg,
                  border: `1.5px solid ${previewBorder}`,
                }}
              >
                <input
                  type="text"
                  value={tw.name}
                  onChange={(e) => handlePreviewNameChange(idx, e.target.value)}
                  className="rounded-lg px-3 py-2 border focus:outline-none focus:ring-2"
                  style={{
                    background: isDark ? "#3b3b50" : "#fff",
                    color: textColor,
                    borderColor: inputBorderColor,
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-3 mt-6">
            <button
              className="px-8 py-2 rounded-xl font-semibold shadow flex items-center gap-2"
              style={{
                background: buttonGradient,
                color: "#fff",
              }}
              onClick={handleSubmit}
              type="button"
            >
              <Check className="inline w-5 h-5 mr-1" /> Add Towers
            </button>
            <button
              className="px-8 py-2 rounded-xl font-semibold shadow flex items-center gap-2"
              style={{
                background: isDark ? "#3b3b50" : "#fff",
                color: textColor,
                border: `1.5px solid ${inputBorderColor}`,
              }}
              onClick={() => setShowPreview(false)}
              type="button"
            >
              <X className="inline w-5 h-5 mr-1" /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {fetchError && (
        <p className="text-red-600 text-center mt-6">{fetchError}</p>
      )}

      {/* Existing towers */}
      <div className="mt-10">
        <h3
          className="text-xl font-bold mb-4 text-center"
          style={{ color: textColor }}
        >
          Existing Towers
        </h3>
        <div className="flex flex-wrap justify-center gap-6">
          {towerDetails.map((tower, index) => (
            <div
              key={tower.id}
              className="relative rounded-2xl overflow-hidden shadow-xl hover:scale-105 transition-transform duration-300 w-56"
              style={{
                background: towerCardBg,
                border: `1.5px solid ${towerCardBorder}`,
              }}
            >
              <img
                src={projectImage}
                alt="Tower"
                className="w-full h-64 object-cover opacity-60 cursor-pointer"
                onClick={() => dispatch(setSelectedTowerId(tower.id))}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10 flex flex-col items-center justify-center gap-2">
                {editingIndex === index ? (
                  <>
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="text-center bg-white px-3 py-2 rounded-xl border focus:outline-none focus:ring-2"
                      style={{
                        borderColor: inputBorderColor,
                        color: inputTextColor,
                      }}
                      autoFocus
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        className="px-4 py-2 rounded-lg font-semibold flex items-center gap-1"
                        style={{
                          background: towerCardBorder,
                          color: "#fff",
                        }}
                        onClick={() => handleEditTower(tower.id, tempName)}
                      >
                        <Check className="w-5 h-5" /> Save
                      </button>
                      <button
                        className="px-4 py-2 rounded-lg font-semibold flex items-center gap-1"
                        style={{
                          background: "#fff",
                          color: towerCardBorder,
                          border: `1.5px solid ${towerCardBorder}`,
                        }}
                        onClick={() => setEditingIndex(-1)}
                      >
                        <X className="w-5 h-5" /> Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p
                      className="text-white text-lg font-bold cursor-pointer"
                      onClick={() => dispatch(setSelectedTowerId(tower.id))}
                    >
                      {tower.name}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <button
                        className="px-4 py-2 rounded-lg font-semibold flex items-center gap-1"
                        style={{
                          background: buttonGradient,
                          color: "#fff",
                        }}
                        onClick={() => {
                          setEditingIndex(index);
                          setTempName(tower.name);
                        }}
                      >
                        <Edit3 className="w-5 h-5" /> Edit
                      </button>
                      <button
                        className="px-4 py-2 rounded-lg font-semibold flex items-center gap-1"
                        style={{
                          background: "#bc2323",
                          color: "#fff",
                        }}
                        onClick={() => handleDeleteTower(tower.id)}
                      >
                        <Trash2 className="w-5 h-5" /> Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
          {towerDetails.length === 0 && (
            <div className="w-full text-center text-gray-400 py-10 text-lg">
              No towers added yet.
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-10 px-3">
        <button
          className="px-8 py-3 rounded-xl font-semibold"
          style={{
            background: isDark ? "#3b3b50" : "#fff",
            color: textColor,
            border: `1.5px solid ${inputBorderColor}`,
          }}
          onClick={previousStep}
        >
          Previous
        </button>
        <button
          className="px-8 py-3 rounded-xl font-semibold"
          style={{
            background: buttonGradient,
            color: "#fff",
          }}
          onClick={nextStep}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Tower;

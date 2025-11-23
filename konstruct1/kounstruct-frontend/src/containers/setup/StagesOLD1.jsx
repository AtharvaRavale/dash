import React, { useEffect, useState } from "react";
import {
  createPhase,
  createPurpose,
  getPurposeByProjectId,
  createStage,
  getPhaseDetailsByProjectId,
  getStageDetailsByProjectId,
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

const TABS = [
  { key: "Purpose", label: "Purpose" },
  { key: "Phases", label: "Phases" },
  { key: "Stages", label: "Stages" },
];

const showApiErrors = (error, fallbackMsg = "An error occurred.") => {
  const apiErrors = error?.response?.data;
  if (apiErrors && typeof apiErrors === "object") {
    Object.values(apiErrors).forEach((errArr) => {
      if (Array.isArray(errArr)) errArr.forEach((msg) => showToast(String(msg)));
      else showToast(String(errArr));
    });
  } else {
    showToast(fallbackMsg);
  }
};

function Stages({ nextStep, previousStep }) {
  const dispatch = useDispatch();
  const projectId = useSelector((state) => state.user.selectedProject.id);
  const { theme } = useTheme(); // get current theme

  // Define palette based on theme
  const palette = theme === "dark" ? {
    ORANGE: "#fbbf24",
    ORANGE_DARK: "#ca8a04",
    ORANGE_LIGHT: "#403d39",
    BG_GRAY: "#181820",
    BORDER_GRAY: "#57514f",
    TEXT_GRAY: "#e4e1de",
    BG_WHITE: "#23232e",
    INPUT_BG: "#2f2f38",
    INPUT_BORDER: "#ca8a04",
  } : {
    ORANGE: "#b54b13",
    ORANGE_DARK: "#882c10",
    ORANGE_LIGHT: "#ede1d3",
    BG_GRAY: "#e6e3df",
    BORDER_GRAY: "#a29991",
    TEXT_GRAY: "#29252c",
    BG_WHITE: "#fff",
    INPUT_BG: "#fff",
    INPUT_BORDER: "#b54b13",
  };

  // Main state
  const [isCreateStage, setIsCreateStage] = useState(false);
  const [purposeData, setPurposeData] = useState([]);
  const [phasesData, setPhasesData] = useState([]);
  const [stagesData, setStagesData] = useState([]);

  // Creation form state
  const [selectedPurpose, setSelectedPurpose] = useState("");
  const [phaseName, setPhaseName] = useState("");
  const [newPurpose, setNewPurpose] = useState("");
  const [selectedPhase, setSelectedPhase] = useState("");
  const [stageName, setStageName] = useState("");
  const [activeSection, setActiveSection] = useState("Purpose");

  // Edit state - Purpose
  const [editPurposeId, setEditPurposeId] = useState(null);
  const [editPurposeName, setEditPurposeName] = useState("");

  // Edit state - Phase
  const [editPhaseId, setEditPhaseId] = useState(null);
  const [editPhaseName, setEditPhaseName] = useState("");
  const [editPhasePurpose, setEditPhasePurpose] = useState("");

  // Edit state - Stage
  const [editIndex, setEditIndex] = useState(null);
  const [editedStageName, setEditedStageName] = useState("");
  const [editedSequence, setEditedSequence] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // --- Fetch helpers ---
  const getPurposes = async () => {
    if (projectId) {
      try {
        const response = await getPurposeByProjectId(projectId);
        if (response.status === 200) {
          setPurposeData(response.data);
          dispatch(setPurposes({ project_id: projectId, data: response.data }));
          return response.data;
        }
      } catch (error) {
        showApiErrors(error, "Failed to fetch purposes");
      }
    }
    return [];
  };

  const getPhases = async (purposesData = null) => {
    if (!projectId) return;
    try {
      const response = await getPhaseDetailsByProjectId(projectId);
      if (response.status === 200) {
        const phases = response.data;
        const currentPurposes = purposesData || purposeData;
        const formattedPhases = phases.map((phase) => ({
          purpose: currentPurposes.find((p) => p.id === phase.purpose)?.name || "Unknown",
          phase: phase.name,
          id: phase.id,
          purpose_id: phase.purpose,
        }));
        setPhasesData(formattedPhases);
        dispatch(setPhases({ project_id: projectId, data: formattedPhases }));
        return formattedPhases;
      }
    } catch (error) {
      showApiErrors(error, "Failed to fetch phases");
    }
    return [];
  };

  const getStages = async (phasesData = null, purposesData = null) => {
    if (!projectId) return;
    try {
      const response = await getStageDetailsByProjectId(projectId);
      if (response.status === 200) {
        const stages = response.data;
        const currentPhases = phasesData || phasesData;
        const currentPurposes = purposesData || purposeData;
        const formattedStages = stages.map((stage) => ({
          purpose: currentPurposes.find((p) => p.id === stage.purpose)?.name || "Unknown",
          phase: currentPhases.find((ph) => ph.id === stage.phase)?.phase || "Unknown",
          stage: stage.name,
          id: stage.id,
          sequence: stage.sequence || 1,
        }));
        setStagesData(formattedStages);
        dispatch(setStages({ project_id: projectId, data: formattedStages }));
      }
    } catch (error) {
      showApiErrors(error, "Failed to fetch stages");
    }
  };

  const fetchAllData = async () => {
    if (projectId) {
      const purposes = await getPurposes();
      const phases = await getPhases(purposes);
      await getStages(phases, purposes);
    }
  };

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line
  }, [projectId]);

  const getPurposeId = (name) => purposeData.find((p) => p.name === name)?.id;
  const getPhaseId = (name) => phasesData.find((ph) => ph.phase === name)?.id;

  // CREATE Purpose
  const handleCreatePurpose = async () => {
    if (!newPurpose.trim()) {
      showToast("Purpose name cannot be empty");
      return;
    }
    try {
      const response = await createPurpose({
        name: newPurpose.trim(),
        project: projectId,
      });
      if (response.status === 201 || response.status === 200) {
        showToast("Purpose created!");
        setNewPurpose("");
        await fetchAllData();
      }
    } catch (error) {
      showApiErrors(error, "Failed to create purpose.");
    }
  };

  // EDIT/DELETE Purpose
  const handleEditPurpose = (purpose) => {
    setEditPurposeId(purpose.id);
    setEditPurposeName(purpose.name);
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
    if (!window.confirm("Are you sure you want to delete this purpose?")) return;
    try {
      await deletePurpose(purposeId);
      showToast("Purpose deleted!");
      await fetchAllData();
    } catch (error) {
      showApiErrors(error, "Failed to delete purpose.");
    }
  };

  // CREATE Phase
  const handleCreatePhase = async () => {
    if (!selectedPurpose || !phaseName.trim()) {
      showToast("Please select purpose and enter phase name");
      return;
    }
    try {
      const purposeId = getPurposeId(selectedPurpose);
      const response = await createPhase({
        project: projectId,
        purpose: purposeId,
        name: phaseName.trim(),
      });
      if (response.status === 200 || response.status === 201) {
        showToast("Phase created successfully!");
        setSelectedPurpose("");
        setPhaseName("");
        await fetchAllData();
      }
    } catch (error) {
      showApiErrors(error, "Failed to create phase.");
    }
  };

  // EDIT/DELETE Phase
  const handleEditPhase = (phase) => {
    setEditPhaseId(phase.id);
    setEditPhaseName(phase.phase);
    setEditPhasePurpose(phase.purpose);
  };

  const handleSavePhase = async (phaseId) => {
    const purposeId = getPurposeId(editPhasePurpose);
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
      showToast("Phase deleted!","success");
      await fetchAllData();
    } catch (error) {
      showApiErrors(error, "Failed to delete phase.");
    }
  };

  // CREATE Stage
  const handleCreateStage = async () => {
    if (!selectedPhase || !stageName.trim()) {
      showToast("Please select phase and enter stage name");
      return;
    }
    try {
      const [purposeName, phaseNameStr] = selectedPhase.split(":");
      const purposeId = getPurposeId(purposeName);
      const phaseId = getPhaseId(phaseNameStr);

      if (!purposeId || !phaseId) {
        showToast("Invalid purpose or phase selection");
        return;
      }
      const sequence =
        Math.max(...stagesData.map((s) => s.sequence || 0), 0) + 1;

      const payload = {
        project: projectId,
        purpose: purposeId,
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
    } catch (error) {
      showApiErrors(error, "Failed to create stage.");
    }
  };

  // EDIT/DELETE Stage
  const handleEditClick = (index) => {
    setEditIndex(index);
    setEditedStageName(stagesData[index].stage);
    setEditedSequence(stagesData[index].sequence || 1);
  };

  const handleSaveClick = async () => {
    if (editIndex === null) return;
    setIsSaving(true);
    try {
      const stageToUpdate = stagesData[editIndex];
      const payload = {
        stage_id: stageToUpdate.id,
        name: editedStageName.trim(),
        sequence: editedSequence,
      };
      await editStage(payload);
      showToast("Stage updated successfully!");
      setEditIndex(null);
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

  return (
    <div
      className="w-full max-w-7xl mx-auto px-2 py-8 rounded-2xl shadow-2xl"
      style={{
        background: palette.BG_GRAY,
        border: `1.5px solid ${palette.BORDER_GRAY}`,
        color: palette.TEXT_GRAY,
      }}
    >
      {/* Tabs */}
      <div className="flex items-center justify-center gap-0 mb-10">
        {TABS.map((tab, idx) => (
          <React.Fragment key={tab.key}>
            <button
              className={`px-7 py-3 rounded-t-xl font-semibold text-base tracking-wide transition-all duration-200 focus:outline-none
                ${activeSection === tab.key ? "shadow-xl scale-105" : ""}
              `}
              style={{
                minWidth: 130,
                color: activeSection === tab.key ? "#fff" : palette.ORANGE,
                background:
                  activeSection === tab.key
                    ? `linear-gradient(90deg, ${palette.ORANGE} 60%, ${palette.ORANGE_DARK} 100%)`
                    : "transparent",
                border:
                  activeSection === tab.key
                    ? `1.5px solid ${palette.ORANGE}`
                    : `1.5px solid ${palette.BORDER_GRAY}`,
                fontWeight: "bold",
                boxShadow:
                  activeSection === tab.key ? "0 4px 24px #d67c3c55" : "none",
                zIndex: 1,
              }}
              onClick={() => setActiveSection(tab.key)}
            >
              {tab.label}
            </button>
            {idx < TABS.length - 1 && (
              <div className="w-3 h-1 bg-orange-200 rounded-full mx-2" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* PURPOSE */}
      {activeSection === "Purpose" && (
        <div
          className="p-8 rounded-2xl mb-6 shadow"
          style={{
            background: palette.BG_WHITE,
            border: `1px solid ${palette.BORDER_GRAY}`,
          }}
        >
          <h3 className="text-xl font-bold mb-5" style={{ color: palette.ORANGE_DARK }}>
            Purpose Management
          </h3>
          <div className="flex gap-2 mb-6">
            <input
              value={newPurpose}
              onChange={(e) => setNewPurpose(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleCreatePurpose()}
              type="text"
              className="flex-1 px-4 py-3 border rounded-xl focus:outline-none text-base"
              style={{
                borderColor: palette.ORANGE,
                color: palette.TEXT_GRAY,
                background: palette.ORANGE_LIGHT,
              }}
              placeholder="Enter new purpose"
            />
            <button
              onClick={handleCreatePurpose}
              className="px-7 py-3 rounded-xl font-semibold flex items-center gap-2"
              style={{
                background: `linear-gradient(90deg, ${palette.ORANGE} 60%, ${palette.ORANGE_DARK} 100%)`,
                color: "#fff",
              }}
            >
              <Plus size={20} /> Add Purpose
            </button>
          </div>

          {purposeData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {purposeData.map((purpose) => (
                <div
                  key={purpose.id}
                  className="p-5 rounded-xl flex items-center justify-between gap-4 shadow group"
                  style={{
                    background: palette.BG_WHITE,
                    border: `1px solid ${palette.BORDER_GRAY}`,
                    color: palette.TEXT_GRAY,
                  }}
                >
                  {editPurposeId === purpose.id ? (
                    <>
                      <input
                        className="flex-1 border px-3 py-2 rounded-lg text-base"
                        value={editPurposeName}
                        onChange={(e) => setEditPurposeName(e.target.value)}
                        style={{ borderColor: palette.ORANGE, color: palette.TEXT_GRAY, background: palette.ORANGE_LIGHT }}
                      />
                      <button
                        className="ml-2 px-4 py-2 rounded-lg"
                        style={{ background: palette.ORANGE, color: "#fff" }}
                        onClick={() => handleSavePurpose(purpose.id)}
                      >
                        <Check size={20} />
                      </button>
                      <button
                        className="ml-2 px-4 py-2 rounded-lg"
                        style={{ background: "#f4f4f4", color: palette.TEXT_GRAY }}
                        onClick={() => setEditPurposeId(null)}
                      >
                        <X size={20} />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="capitalize text-lg font-medium" style={{ color: palette.TEXT_GRAY }}>
                        {purpose.name}
                      </span>
                      <button
                        className="px-3 py-1 rounded-lg"
                        style={{ background: "#f5e6de", color: palette.ORANGE }}
                        onClick={() => handleEditPurpose(purpose)}
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        className="px-3 py-1 rounded-lg"
                        style={{ background: "#fae7e3", color: palette.ORANGE_DARK }}
                        onClick={() => handleDeletePurpose(purpose.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-6 text-base">
              No purposes created yet
            </p>
          )}
        </div>
      )}

      {/* PHASES */}
      {activeSection === "Phases" && (
        <div className="p-8 rounded-2xl mb-6 shadow" style={{ background: palette.BG_WHITE, border: `1px solid ${palette.BORDER_GRAY}` }}>
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Create Phase Card */}
            <div className="border-2 rounded-2xl p-6 min-w-[340px] w-full max-w-md shadow"
              style={{
                background: palette.BG_WHITE,
                borderColor: palette.ORANGE,
                color: palette.TEXT_GRAY,
              }}>
              <h4 className="font-bold mb-4 text-lg" style={{ color: palette.ORANGE_DARK }}>
                Create Phase
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block font-medium mb-1" style={{ color: palette.TEXT_GRAY }}>
                    Purpose
                  </label>
                  <select
                    value={selectedPurpose}
                    onChange={(e) => setSelectedPurpose(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none text-base"
                    style={{ borderColor: palette.ORANGE, color: palette.TEXT_GRAY, background: palette.ORANGE_LIGHT }}
                  >
                    <option value="">Select Purpose</option>
                    {purposeData.map((purpose) => (
                      <option key={purpose.id} value={purpose.name} className="capitalize">
                        {purpose.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1" style={{ color: palette.TEXT_GRAY }}>
                    Phase Name
                  </label>
                  <input
                    value={phaseName}
                    onChange={(e) => setPhaseName(e.target.value)}
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none text-base"
                    style={{ borderColor: palette.ORANGE, color: palette.TEXT_GRAY, background: palette.ORANGE_LIGHT }}
                    placeholder="Enter phase name"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCreatePhase}
                    className="flex-1 rounded-lg font-medium"
                    style={{ background: palette.ORANGE, color: "#fff" }}
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPurpose("");
                      setPhaseName("");
                    }}
                    className="px-4 py-2 border rounded-lg font-medium"
                    style={{ borderColor: palette.ORANGE, color: palette.ORANGE, background: "#f4f4f4" }}
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Existing Phases */}
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-4" style={{ color: palette.ORANGE_DARK }}>
                Existing Phases
              </h3>
              {(phasesData || [] ).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(phasesData || [] ).map((phase) => (
                    <div key={phase.id} className="border rounded-2xl p-5 shadow group"
                      style={{ background: palette.BG_WHITE, borderColor: palette.ORANGE, color: palette.TEXT_GRAY }}>
                      {editPhaseId === phase.id ? (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: palette.TEXT_GRAY }}>
                              Purpose
                            </label>
                            <select
                              className="w-full border px-3 py-2 rounded-lg"
                              style={{ borderColor: palette.ORANGE, color: palette.TEXT_GRAY, background: palette.ORANGE_LIGHT }}
                              value={editPhasePurpose}
                              onChange={(e) => setEditPhasePurpose(e.target.value)}
                            >
                              {purposeData.map((purpose) => (
                                <option key={purpose.id} value={purpose.name}>{purpose.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: palette.TEXT_GRAY }}>
                              Phase Name
                            </label>
                            <input
                              className="w-full border px-3 py-2 rounded-lg"
                              style={{ borderColor: palette.ORANGE, color: palette.TEXT_GRAY, background: palette.ORANGE_LIGHT }}
                              value={editPhaseName}
                              onChange={(e) => setEditPhaseName(e.target.value)}
                            />
                          </div>
                          <div className="flex gap-2 pt-2">
                            <button
                              className="flex-1 rounded-lg font-medium"
                              style={{ background: palette.ORANGE, color: "#fff" }}
                              onClick={() => handleSavePhase(phase.id)}
                            >
                              <Check size={18} /> Save
                            </button>
                            <button
                              className="flex-1 border px-3 py-2 rounded-lg font-medium"
                              style={{ borderColor: palette.ORANGE, color: palette.ORANGE, background: "#f4f4f4" }}
                              onClick={() => setEditPhaseId(null)}
                            >
                              <X size={18} /> Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: palette.TEXT_GRAY }}>
                              Purpose
                            </label>
                            <div className="px-3 py-2 rounded text-base capitalize" style={{ background: palette.ORANGE_LIGHT, color: palette.TEXT_GRAY }}>
                              {phase.purpose}
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: palette.TEXT_GRAY }}>
                              Phase Name
                            </label>
                            <div className="px-3 py-2 rounded text-base capitalize" style={{ background: palette.ORANGE_LIGHT, color: palette.TEXT_GRAY }}>
                              {phase.phase}
                            </div>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <button
                              className="flex-1 rounded-lg font-medium"
                              style={{ background: palette.ORANGE, color: "#fff" }}
                              onClick={() => handleEditPhase(phase)}
                            >
                              <Edit3 size={18} /> Edit
                            </button>
                            <button
                              className="rounded-lg font-medium"
                              style={{ background: "#fae7e3", color: palette.ORANGE_DARK }}
                              onClick={() => handleDeletePhase(phase.id)}
                            >
                              <Trash2 size={18} /> Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-10">No phases created yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STAGES */}
      {activeSection === "Stages" && (
        <div className="p-8 rounded-2xl mb-6 shadow" style={{ background: palette.BG_WHITE, border: `1px solid ${palette.BORDER_GRAY}`, color: palette.TEXT_GRAY }}>
          <div className="flex items-center gap-4 mb-6">
            <button
              className="px-5 py-3 rounded-xl font-semibold flex items-center gap-2 shadow"
              style={{
                background: palette.ORANGE,
                color: "#fff",
              }}
              onClick={() => setIsCreateStage((v) => !v)}
            >
              <Plus size={22} /> {isCreateStage ? "Cancel" : "Create Stage"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {/* Create Stage Card */}
            {isCreateStage && (
              <div className="border-2 rounded-2xl p-6 shadow-xl flex flex-col gap-5 min-w-[320px]"
                style={{ background: palette.BG_WHITE, borderColor: palette.ORANGE, color: palette.TEXT_GRAY }}>
                <h4 className="font-bold text-lg mb-2" style={{ color: palette.ORANGE_DARK }}>
                  New Stage
                </h4>
                <div>
                  <label className="block font-medium mb-1" style={{ color: palette.TEXT_GRAY }}>
                    Phase
                  </label>
                  <select
                    value={selectedPhase}
                    onChange={(e) => setSelectedPhase(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none text-base"
                    style={{ borderColor: palette.ORANGE, color: palette.TEXT_GRAY, background: palette.ORANGE_LIGHT }}
                  >
                    <option value="">Select Phase</option>
                    {phasesData.map((phase) => (
                      <option key={phase.id} value={`${phase.purpose}:${phase.phase}`}>
                        {phase.purpose} - {phase.phase}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1" style={{ color: palette.TEXT_GRAY }}>
                    Stage Name
                  </label>
                  <input
                    value={stageName}
                    onChange={(e) => setStageName(e.target.value)}
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none text-base"
                    style={{ borderColor: palette.ORANGE, color: palette.TEXT_GRAY, background: palette.ORANGE_LIGHT }}
                    placeholder="Enter stage name"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleCreateStage}
                    className="flex-1 rounded-lg font-medium"
                    style={{ background: palette.ORANGE, color: "#fff" }}
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setIsCreateStage(false);
                      setSelectedPhase("");
                      setStageName("");
                    }}
                    className="px-4 py-2 border rounded-lg font-medium"
                    style={{ borderColor: palette.ORANGE, color: palette.ORANGE, background: "#f4f4f4" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Existing Stages */}
            {stagesData?.map((stage, index) => (
              <div key={stage.id} className="border rounded-2xl p-5 shadow-xl group flex flex-col gap-2"
                style={{ background: palette.BG_WHITE, borderColor: palette.ORANGE, color: palette.TEXT_GRAY }}>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: palette.TEXT_GRAY }}>
                    Purpose
                  </label>
                  <div className="px-3 py-2 rounded text-base capitalize" style={{ background: palette.ORANGE_LIGHT, color: palette.TEXT_GRAY }}>
                    {stage.purpose}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: palette.TEXT_GRAY }}>
                    Phase
                  </label>
                  <div className="px-3 py-2 rounded text-base capitalize" style={{ background: palette.ORANGE_LIGHT, color: palette.TEXT_GRAY }}>
                    {stage.phase}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: palette.TEXT_GRAY }}>
                    Stage Name
                  </label>
                  {editIndex === index ? (
                    <input
                      type="text"
                      value={editedStageName}
                      onChange={(e) => setEditedStageName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none text-base"
                      style={{ borderColor: palette.ORANGE, color: palette.TEXT_GRAY, background: palette.ORANGE_LIGHT }}
                    />
                  ) : (
                    <div className="px-3 py-2 rounded text-base capitalize" style={{ background: palette.ORANGE_LIGHT, color: palette.TEXT_GRAY }}>
                      {stage.stage}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: palette.TEXT_GRAY }}>
                    Sequence
                  </label>
                  {editIndex === index ? (
                    <input
                      type="number"
                      min={1}
                      value={editedSequence}
                      onChange={(e) => setEditedSequence(Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none text-base"
                      style={{ borderColor: palette.ORANGE, color: palette.TEXT_GRAY, background: palette.ORANGE_LIGHT }}
                    />
                  ) : (
                    <div className="px-3 py-2 rounded text-base text-center" style={{ background: palette.ORANGE_LIGHT, color: palette.TEXT_GRAY }}>
                      {stage.sequence}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  {editIndex === index ? (
                    <>
                      <button
                        onClick={handleSaveClick}
                        disabled={isSaving}
                        className="flex-1 rounded-lg font-medium"
                        style={{ background: palette.ORANGE, color: "#fff" }}
                      >
                        {isSaving ? "Saving..." : <><Check size={18} /> Save</>}
                      </button>
                      <button
                        onClick={() => setEditIndex(null)}
                        className="flex-1 border px-3 py-2 rounded-lg font-medium"
                        style={{ borderColor: palette.ORANGE, color: palette.ORANGE, background: "#f4f4f4" }}
                      >
                        <X size={18} /> Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditClick(index)}
                        className="flex-1 rounded-lg font-medium"
                        style={{ background: palette.ORANGE, color: "#fff" }}
                      >
                        <Edit3 size={18} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteStage(stage.id)}
                        className="rounded-lg font-medium"
                        style={{ background: "#fae7e3", color: palette.ORANGE_DARK }}
                      >
                        <Trash2 size={18} /> Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          {stagesData.length === 0 && !isCreateStage && (
            <p className="text-gray-400 text-center py-8">No stages created yet</p>
          )}
        </div>
      )}

      {/* Next/Previous controls */}
      <div className="flex justify-between mt-10">
        <button
          className="px-8 py-3 rounded-xl font-semibold"
          style={{ background: palette.BORDER_GRAY, color: palette.TEXT_GRAY }}
          onClick={previousStep}
        >
          Previous
        </button>
        <button
          className="px-8 py-3 rounded-xl font-semibold"
          style={{
            background: `linear-gradient(90deg, ${palette.ORANGE} 60%, ${palette.ORANGE_DARK} 100%)`,
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

export default Stages;

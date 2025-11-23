import React, { useEffect, useState } from "react";
import SiteBarHome from "./SiteBarHome";
import { projectInstance, NEWchecklistInstance } from "../api/axiosInstance";
import { useTheme } from "../ThemeContext";

function PendingInspectorChecklists() {
  const { theme } = useTheme();
  // --- THEME PALETTE ---
  const palette = theme === "dark"
    ? {
        pageBg: "bg-[#181820]",
        card: "bg-[#23232e] border border-yellow-400/30 shadow-lg",
        section: "bg-[#23232e]",
        text: "text-yellow-500",
        textHead: "text-yellow-300",
        textDim: "text-yellow-400",
        border: "border-yellow-400/50",
        select: "bg-[#23232e] text-yellow-100 border-yellow-400/30",
        button: "bg-yellow-400 hover:bg-yellow-300 text-black font-semibold",
        buttonAlt: "bg-[#444] hover:bg-yellow-700 text-yellow-200",
        input: "bg-[#23232e] text-yellow-100 border-yellow-400/30",
        badge: "bg-yellow-700 text-yellow-100",
        highlight: "bg-yellow-200 text-yellow-900"
      }
    : {
        pageBg: "bg-gray-50",
        card: "bg-white border border-orange-200 shadow",
        section: "bg-white",
        text: "text-gray-800",
        textHead: "text-orange-600",
        textDim: "text-gray-500",
        border: "border-orange-300",
        select: "bg-white text-gray-800 border-orange-300",
        button: "bg-orange-500 hover:bg-orange-600 text-white font-semibold",
        buttonAlt: "bg-gray-200 hover:bg-orange-300 text-orange-800",
        input: "bg-white text-gray-800 border-orange-300",
        badge: "bg-orange-100 text-orange-700",
        highlight: "bg-orange-200 text-orange-900"
      };

  // --- STATE ---
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState(null);

  // Handle assigned & available checklists
  const [assignedChecklists, setAssignedChecklists] = useState([]);
  const [availableChecklists, setAvailableChecklists] = useState([]);
  const [loadingChecklists, setLoadingChecklists] = useState(false);
  const [checklistError, setChecklistError] = useState(null);

  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("assigned");
  const [currentView, setCurrentView] = useState("checklists");
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([
    { label: "Checklists", level: "checklists" }
  ]);
  const [itemStates, setItemStates] = useState({});

  // --- ACCESS DATA ---
  const accessesStr = localStorage.getItem("ACCESSES");
  const accesses = accessesStr ? JSON.parse(accessesStr) : [];

  // --- STATUS OPTIONS ---
  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "not_started", label: "Not Started" },
    { value: "in_progress", label: "In Progress" },
    { value: "work_in_progress", label: "Work in Progress" },
    { value: "completed", label: "Completed" }
  ];

  // --- PALETTE BADGE FOR STATUS ---
  const getStatusColor = (status) => {
    switch (status) {
      case "not_started":
        return palette.badge;
      case "in_progress":
        return theme === "dark"
          ? "bg-yellow-500 text-yellow-950"
          : "bg-orange-200 text-orange-900";
      case "work_in_progress":
        return theme === "dark"
          ? "bg-yellow-700 text-yellow-100"
          : "bg-orange-300 text-orange-900";
      case "completed":
        return "bg-green-200 text-green-800";
      case "pending_for_inspector":
        return theme === "dark"
          ? "bg-yellow-900 text-yellow-100"
          : "bg-orange-100 text-orange-700";
      case "pending_for_maker":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // --- GET CHECKLISTS BASED ON VIEW MODE ---
  const getCurrentChecklists = () => {
    switch (viewMode) {
      case "assigned": return assignedChecklists;
      case "available": return availableChecklists;
      case "all": return [...assignedChecklists, ...availableChecklists];
      default: return assignedChecklists;
    }
  };

  // --- INITIALIZE ITEM STATE ---
  const initializeItemStates = (items) => {
    const newStates = {};
    items.forEach((item) => {
      if (!itemStates[item.id]) {
        newStates[item.id] = {
          selection: null,
          optionId: null,
          remarks: "",
          photoFile: null,
          photoPreview: null,
          isSubmitting: false,
          submitted: false,
          error: null
        };
      }
    });
    setItemStates((prev) => ({ ...prev, ...newStates }));
  };

  // --- REFRESH CHECKLISTS (API) ---
  const refreshChecklists = async () => {
    if (!selectedProjectId) {
      setAssignedChecklists([]);
      setAvailableChecklists([]);
      return;
    }

    setLoadingChecklists(true);
    setChecklistError(null);
    try {
      const res = await NEWchecklistInstance.get(`/Chechker-New-checklist/`, {
        params: { project_id: selectedProjectId },
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });

      const assignedData = Array.isArray(res.data?.assigned_to_me) ? res.data.assigned_to_me : [];
      const availableData = Array.isArray(res.data?.available_for_me) ? res.data.available_for_me : [];

      setAssignedChecklists(assignedData);
      setAvailableChecklists(availableData);
    } catch (err) {
      setChecklistError("Failed to load pending checklists");
      setAssignedChecklists([]);
      setAvailableChecklists([]);
    } finally {
      setLoadingChecklists(false);
    }
  };

  // --- FILTERED CHECKLISTS BY STATUS ---
  const filteredChecklists = statusFilter === "all"
    ? getCurrentChecklists()
    : getCurrentChecklists().filter((checklist) => checklist.status === statusFilter);

  // --- RESET ITEMS WHEN FILTER CHANGES ---
  useEffect(() => {
    if (currentView !== "checklists") {
      setCurrentView("checklists");
      setSelectedChecklist(null);
      setBreadcrumbs([{ label: "Checklists", level: "checklists" }]);
      setItemStates({});
    }
  }, [statusFilter, viewMode]); // eslint-disable-line

  // --- FETCH PROJECTS ---
  useEffect(() => {
    async function fetchProjects() {
      setLoadingProjects(true);
      setError(null);
      try {
        const userProjects = accesses
          .filter((a) => a.active)
          .map((a) => Number(a.project_id));

        const res = await projectInstance.get("/projects/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        });

        const allProjects = Array.isArray(res.data) ? res.data : res.data.results;
        const filtered = allProjects.filter((p) => userProjects.includes(p.id));

        setProjects(filtered);
        if (filtered.length > 0 && !selectedProjectId) {
          setSelectedProjectId(filtered[0].id);
        }
      } catch (err) {
        setError("Failed to load projects");
        setProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    }

    if (accesses.length > 0) fetchProjects();
  }, []); // eslint-disable-line

  // --- FETCH CHECKLISTS WHEN PROJECT IS SELECTED ---
  useEffect(() => {
    refreshChecklists();
    setCurrentView("checklists");
    setSelectedChecklist(null);
    setBreadcrumbs([{ label: "Checklists", level: "checklists" }]);
    setItemStates({});
  }, [selectedProjectId]); // eslint-disable-line

  // --- NAVIGATION HANDLERS ---
  const navigateToChecklist = (checklist) => {
    setSelectedChecklist(checklist);
    setCurrentView("checklist");
    setBreadcrumbs([
      { label: "Checklists", level: "checklists" },
      { label: checklist.name, level: "checklist" },
    ]);
    if (checklist.items) initializeItemStates(checklist.items);
  };

  const navigateToLevel = (level) => {
    setCurrentView(level);
    if (level === "checklists") {
      setSelectedChecklist(null);
      setBreadcrumbs([{ label: "Checklists", level: "checklists" }]);
    }
  };

  // --- ITEM STATE HANDLERS ---
  const handleItemSelection = (itemId, option, item) => {
    const currentState = itemStates[itemId];
    const isDeselecting = currentState?.optionId === option.id;
    setItemStates((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        selection: isDeselecting ? null : option.choice,
        optionId: isDeselecting ? null : option.id,
      },
    }));
  };
  const handlePhotoUpload = (itemId, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setItemStates((prev) => ({
          ...prev,
          [itemId]: {
            ...prev[itemId],
            photoFile: file,
            photoPreview: reader.result,
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  const removePhoto = (itemId) => {
    setItemStates((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], photoFile: null, photoPreview: null },
    }));
  };
  const handleRemarksChange = (itemId, remarks) => {
    setItemStates((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], remarks: remarks },
    }));
  };

  // --- SUBMIT ITEM ---
  const submitItem = async (itemId) => {
    const itemState = itemStates[itemId];
    const item = selectedChecklist.items.find((i) => i.id === itemId);

    if (!itemState?.optionId) {
      setItemStates((prev) => ({
        ...prev,
        [itemId]: { ...prev[itemId], error: "Please select an option" },
      }));
      return;
    }
    if (item.photo_required && !itemState.photoFile) {
      setItemStates((prev) => ({
        ...prev,
        [itemId]: { ...prev[itemId], error: "Photo is required for this item" },
      }));
      return;
    }
    setItemStates((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], isSubmitting: true, error: null },
    }));

    try {
      const formData = new FormData();
      formData.append("checklist_item_id", itemId);
      formData.append("role", "checker");
      formData.append("option_id", itemState.optionId);
      formData.append("check_remark", itemState.remarks || "");
      if (itemState.photoFile) {
        formData.append("check_photo", itemState.photoFile);
      }

      await NEWchecklistInstance.patch(
        "/Decsion-makeing-forSuer-Inspector/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setItemStates((prev) => ({
        ...prev,
        [itemId]: { ...prev[itemId], isSubmitting: false, submitted: true, error: null },
      }));
      await refreshChecklists();
    } catch (error) {
      setItemStates((prev) => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          isSubmitting: false,
          error: error.response?.data?.detail || "Failed to submit. Please try again.",
        },
      }));
    }
  };

  // --- STATS ---
  const getSelectionStats = () => {
    if (!selectedChecklist?.items)
      return { total: 0, pending: 0, selected: 0, submitted: 0 };

    const total = selectedChecklist.items.length;
    const pendingItems = selectedChecklist.items.filter(
      (item) => item.status === "pending_for_inspector"
    );
    let selected = 0,
      submitted = 0;

    pendingItems.forEach((item) => {
      const state = itemStates[item.id];
      if (state?.submitted) submitted++;
      else if (state?.optionId) selected++;
    });

    return {
      total,
      pending: pendingItems.length,
      selected,
      submitted,
      readonly: total - pendingItems.length,
    };
  };
  const stats = getSelectionStats();

  // --- OVERALL STATS ---
  const getOverallStats = () => {
    const currentChecklists = getCurrentChecklists();
    return {
      assigned: assignedChecklists.length,
      available: availableChecklists.length,
      total: currentChecklists.length,
    };
  };
  const overallStats = getOverallStats();

  // --- RENDER ---
  return (
    <div className={`flex min-h-screen ${palette.pageBg}`}>
      <SiteBarHome />
      <main className="ml-[15%] w-full p-6">
        {currentView === "checklists" ? (
          // --- MAIN CHECKLISTS VIEW ---
          <div>
            <h2 className={`text-2xl font-bold mb-6 ${palette.textHead}`}>
              Pending Inspector Checklists
            </h2>
            {/* Project & Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className={`${palette.card} rounded-lg p-4`}>
                <label className={`block mb-2 font-semibold ${palette.textHead}`}>
                  Select Project:
                </label>
                {loadingProjects ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400 mr-2"></div>
                    <span className={palette.textDim}>Loading projects...</span>
                  </div>
                ) : error ? (
                  <p className="text-red-500 text-sm">{error}</p>
                ) : (
                  <select
                    className={`w-full p-3 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent border-2 ${palette.select}`}
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                    disabled={projects.length === 0}
                  >
                    {projects.length === 0 && (
                      <option>No projects available</option>
                    )}
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name || `Project #${p.id}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              {selectedProjectId && (
                <div className={`${palette.card} rounded-lg p-4`}>
                  <h3 className={`font-semibold mb-2 ${palette.text}`}>Selected Project Details:</h3>
                  <div className={`text-sm ${palette.textDim}`}>
                    <p>
                      <span className="font-medium">ID:</span> {selectedProjectId}
                    </p>
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {projects.find((p) => p.id === selectedProjectId)?.name || "N/A"}
                    </p>
                  </div>
                  <div className="mt-3">
                    <div className={`text-sm ${palette.highlight} rounded-lg px-3 py-2`}>
                      <span className="font-medium">Checklists: </span>
                      <span className="font-bold">{overallStats.assigned} assigned</span>
                      <span className="mx-1">|</span>
                      <span className="font-bold">{overallStats.available} available</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* View Mode + Status Filter */}
            <div className={`${palette.card} rounded-lg shadow p-6 mb-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${palette.text}`}>View Mode</h3>
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => setViewMode("assigned")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === "assigned" ? "bg-purple-600 text-white shadow-md" : palette.buttonAlt
                  }`}
                >
                  Assigned to Me ({assignedChecklists.length})
                </button>
                <button
                  onClick={() => setViewMode("available")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === "available" ? "bg-blue-600 text-white shadow-md" : palette.buttonAlt
                  }`}
                >
                  Available for Me ({availableChecklists.length})
                </button>
                <button
                  onClick={() => setViewMode("all")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === "all" ? "bg-green-600 text-white shadow-md" : palette.buttonAlt
                  }`}
                >
                  All Checklists ({assignedChecklists.length + availableChecklists.length})
                </button>
              </div>
              <h4 className={`text-md font-semibold mb-3 ${palette.text}`}>Filter by Status</h4>
              <div className="flex flex-wrap gap-3">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setStatusFilter(option.value)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      statusFilter === option.value
                        ? "bg-yellow-500 text-black shadow-md"
                        : palette.buttonAlt
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {statusFilter !== "all" && (
                <p className={`text-sm mt-2 ${palette.textDim}`}>
                  Currently showing:{" "}
                  {statusOptions.find((opt) => opt.value === statusFilter)?.label}
                </p>
              )}
            </div>
            {/* Checklists Section */}
            <div className={`${palette.card} rounded-lg shadow p-6`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-xl font-semibold ${palette.text}`}>
                  {viewMode === "assigned"
                    ? "Checklists Assigned to Me"
                    : viewMode === "available"
                    ? "Available Checklists"
                    : "All Checklists"}
                </h3>
                {filteredChecklists.length > 0 && (
                  <span className={`${palette.badge} px-3 py-1 rounded-full text-sm font-medium`}>
                    {filteredChecklists.length} checklist
                    {filteredChecklists.length !== 1 ? "s" : ""} found
                  </span>
                )}
              </div>
              {loadingChecklists ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mr-3"></div>
                  <span className={palette.textDim}>Loading checklists...</span>
                </div>
              ) : checklistError ? (
                <div className="text-center py-8">
                  <p className="text-red-500 mb-2">{checklistError}</p>
                  <button
                    onClick={refreshChecklists}
                    className="text-yellow-400 hover:text-yellow-200 font-medium"
                  >
                    Try Again
                  </button>
                </div>
              ) : !filteredChecklists.length ? (
                <div className="text-center py-8">
                  <p className={palette.textDim}>
                    {statusFilter === "all"
                      ? `No ${viewMode === "assigned" ? "assigned" : viewMode === "available" ? "available" : ""} checklists for this project.`
                      : `No checklists found with status: ${statusOptions.find((opt) => opt.value === statusFilter)?.label}`}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredChecklists.map((checklist) => {
                    const isAssigned = assignedChecklists.some(c => c.id === checklist.id);
                    const pendingForInspector = checklist.items?.filter(
                      (item) => item.status === "pending_for_inspector"
                    ).length || 0;

                    return (
                      <div
                        key={checklist.id}
                        className={`border-2 rounded-lg p-4 hover:shadow-md transition-shadow ${
                          isAssigned
                            ? "border-yellow-400 bg-yellow-900/10"
                            : "border-blue-200 bg-blue-50"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-1 rounded text-xs ${
                                isAssigned
                                  ? "bg-yellow-500 text-black"
                                  : "bg-blue-600 text-white"
                              }`}>
                                {isAssigned ? "Assigned to Me" : "Available"}
                              </span>
                            </div>
                            <h4 className={`font-semibold text-lg ${palette.text}`}>{checklist.name}</h4>
                          </div>
                          <span className="bg-yellow-500 text-yellow-900 px-2 py-1 rounded text-xs">
                            ID: {checklist.id}
                          </span>
                        </div>
                        <div className={`text-sm ${palette.textDim} mb-3 space-y-1`}>
                          <p>
                            <span className="font-medium">Project ID:</span> {checklist.project_id || "N/A"}
                          </p>
                          <p>
                            <span className="font-medium">Items:</span> {checklist.items?.length || 0}
                          </p>
                          <p>
                            <span className="font-medium">Pending for Inspector:</span>{" "}
                            <span className={pendingForInspector > 0 ? "text-yellow-400 font-bold" : ""}>
                              {pendingForInspector}
                            </span>
                          </p>
                          {checklist.description && (
                            <p>
                              <span className="font-medium">Description:</span> {checklist.description}
                            </p>
                          )}
                        </div>
                        <div className="mb-3">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(checklist.status)}`}
                          >
                            {checklist.status.replace("_", " ").toUpperCase()}
                          </span>
                        </div>
                        <button
                          className={`w-full mt-2 ${palette.button} py-2 px-4 rounded transition-colors`}
                          onClick={() => navigateToChecklist(checklist)}
                        >
                          📋 Start Inspection
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          // --- CHECKLIST DETAILS VIEW ---
          <div>
            {/* Header with Go Back */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <button
                  onClick={() => navigateToLevel("checklists")}
                  className={`mr-4 flex items-center px-4 py-2 rounded-lg font-medium ${palette.buttonAlt}`}
                >
                  ← Go Back
                </button>
                <h2 className={`text-2xl font-bold ${palette.textHead}`}>
                  📋 {selectedChecklist?.name}
                </h2>
              </div>
              <div className={`text-sm rounded-lg px-3 py-2 ${palette.highlight}`}>
                <span className="font-medium">Progress: </span>
                <span className="text-yellow-500 font-semibold">{stats.pending} pending</span>
                <span className="mx-1">|</span>
                <span className="text-blue-500 font-semibold">{stats.selected} selected</span>
                <span className="mx-1">|</span>
                <span className="text-green-500 font-semibold">{stats.submitted} submitted</span>
                <span className="mx-1">|</span>
                <span className={palette.textDim}>{stats.readonly} read-only</span>
                <span className="mx-1">of {stats.total}</span>
              </div>
            </div>
            {/* Checklist Info */}
            {selectedChecklist && (
              <div className={`${palette.section} rounded-lg p-4 mb-6`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    assignedChecklists.some(c => c.id === selectedChecklist.id)
                      ? "bg-yellow-400 text-black"
                      : "bg-blue-600 text-white"
                  }`}>
                    {assignedChecklists.some(c => c.id === selectedChecklist.id) ? "Assigned to Me" : "Available"}
                  </span>
                </div>
                <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 text-sm ${palette.textDim}`}>
                  <div><strong>ID:</strong> {selectedChecklist.id}</div>
                  <div>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedChecklist.status)}`}
                    >
                      {selectedChecklist.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                  <div><strong>Project ID:</strong> {selectedChecklist.project_id || "--"}</div>
                  <div><strong>Total Items:</strong> {selectedChecklist.items?.length || 0}</div>
                </div>
                {selectedChecklist.description && (
                  <div className={`mt-3 text-sm ${palette.text}`}>
                    <strong>Description:</strong> {selectedChecklist.description}
                  </div>
                )}
              </div>
            )}
            {/* Items */}
            {!selectedChecklist?.items?.length ? (
              <div className={`${palette.card} rounded-lg shadow p-6`}>
                <p className={`${palette.textDim} text-center`}>No items in this checklist.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedChecklist.items.map((item, index) => {
                  const itemState = itemStates[item.id] || {};
                  const isSubmitted = itemState.submitted;
                  const isPendingForInspector = item.status === "pending_for_inspector";
                  const yesOption = item.options?.find((opt) => opt.choice === "P");
                  const noOption = item.options?.find((opt) => opt.choice === "N");

                  return (
                    <div
                      key={item.id}
                      className={`border-2 rounded-lg p-4 transition-all ${
                        isSubmitted
                          ? "border-blue-300 bg-blue-50"
                          : isPendingForInspector
                          ? itemState.optionId === yesOption?.id
                            ? "border-green-300 bg-green-50"
                            : itemState.optionId === noOption?.id
                            ? "border-red-300 bg-red-50"
                            : "border-yellow-400 bg-yellow-900/10"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h5 className={`font-semibold text-lg flex items-center gap-2 ${palette.text}`}>
                            <span className={`bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs`}>
                              #{index + 1}
                            </span>
                            {item.title || `Item ${item.id}`}
                            {isSubmitted && (
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                                ✓ Submitted
                              </span>
                            )}
                            {!isPendingForInspector && (
                              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                                Read Only
                              </span>
                            )}
                          </h5>
                          <div className={`text-sm mt-1 ${palette.textDim}`}>
                            <span className={`font-medium ${getStatusColor(item.status)} px-2 py-1 rounded text-xs`}>
                              Status: {item.status.replace("_", " ").toUpperCase()}
                            </span>
                            <span className="mx-2">•</span>
                            <span>
                              Photo: <span className={item.photo_required ? "text-yellow-400 font-semibold" : ""}>
                                {item.photo_required ? "Required" : "Optional"}
                              </span>
                            </span>
                            <span className="mx-2">•</span>
                            <span>
                              Ignore: {item.ignore_now ? "Yes" : "No"}
                            </span>
                          </div>
                          {item.description && (
                            <p className={`text-sm mt-2 italic ${palette.textDim}`}>{item.description}</p>
                          )}
                        </div>
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs ml-4">
                          ID: {item.id}
                        </span>
                      </div>
                      {/* Previous submissions if any */}
                      {item.submissions && item.submissions.length > 0 && (
                        <div className="mb-3 p-3 bg-gray-100 rounded-lg">
                          <p className="text-sm font-medium mb-2 text-yellow-700">Submissions ({item.submissions.length}):</p>
                          <div className="text-xs text-gray-600 space-y-1">
                            {item.submissions
                              .slice(-2)
                              .map((submission) => (
                                <div key={submission.id} className="flex justify-between">
                                  <span>Attempt {submission.attempts}: {submission.status}</span>
                                  <span>
                                    {submission.checked_at
                                      ? new Date(submission.checked_at).toLocaleDateString()
                                      : "Pending"}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                      {/* Interactive Section */}
                      {isPendingForInspector && !isSubmitted ? (
                        <>
                          <div className="flex gap-3 mb-4">
                            {yesOption && (
                              <button
                                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                                  itemState.optionId === yesOption.id
                                    ? "bg-green-600 text-white shadow-lg"
                                    : "bg-green-100 text-green-700 hover:bg-green-200 border border-green-300"
                                }`}
                                onClick={() => handleItemSelection(item.id, yesOption, item)}
                              >
                                ✓ {yesOption.name}
                              </button>
                            )}
                            {noOption && (
                              <button
                                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                                  itemState.optionId === noOption.id
                                    ? "bg-red-600 text-white shadow-lg"
                                    : "bg-red-100 text-red-700 hover:bg-red-200 border border-red-300"
                                }`}
                                onClick={() => handleItemSelection(item.id, noOption, item)}
                              >
                                ✗ {noOption.name}
                              </button>
                            )}
                          </div>
                          <div className="mb-4">
                            <label className={`block text-sm font-medium mb-1 ${palette.text}`}>Remarks (Optional)</label>
                            <textarea
                              className={`w-full px-3 py-2 rounded-md focus:outline-none border focus:ring-2 focus:ring-yellow-500 ${palette.input}`}
                              rows="2"
                              placeholder="Add any comments or observations..."
                              value={itemState.remarks || ""}
                              onChange={(e) => handleRemarksChange(item.id, e.target.value)}
                            />
                          </div>
                          {item.photo_required && (
                            <div className="mb-4">
                              <label className={`block text-sm font-medium mb-1 ${palette.text}`}>
                                Photo <span className="text-yellow-400">*Required</span>
                              </label>
                              {!itemState.photoPreview ? (
                                <div className="border-2 border-dashed border-yellow-400 rounded-lg p-4 text-center">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                      handlePhotoUpload(item.id, e.target.files[0])
                                    }
                                    className="hidden"
                                    id={`photo-${item.id}`}
                                  />
                                  <label htmlFor={`photo-${item.id}`} className="cursor-pointer">
                                    <svg className="mx-auto h-12 w-12 text-yellow-400"
                                      stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <p className="mt-2 text-sm text-yellow-400">
                                      Click to upload photo
                                    </p>
                                  </label>
                                </div>
                              ) : (
                                <div className="relative">
                                  <img
                                    src={itemState.photoPreview}
                                    alt="Preview"
                                    className="w-full h-48 object-cover rounded-lg"
                                  />
                                  <button
                                    onClick={() => removePhoto(item.id)}
                                    className="absolute top-2 right-2 bg-yellow-600 text-white p-2 rounded-full hover:bg-yellow-700"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                          {itemState.error && (
                            <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-900 rounded-md">
                              {itemState.error}
                            </div>
                          )}
                          <div className="flex justify-end">
                            <button
                              onClick={() => submitItem(item.id)}
                              disabled={itemState.isSubmitting || !itemState.optionId}
                              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                                itemState.isSubmitting
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : !itemState.optionId
                                  ? "bg-gray-300 cursor-not-allowed"
                                  : palette.button
                              }`}
                            >
                              {itemState.isSubmitting ? (
                                <span className="flex items-center">
                                  <svg
                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle className="opacity-25" cx="12" cy="12" r="10"
                                      stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                  Submitting...
                                </span>
                              ) : (
                                "Submit Item"
                              )}
                            </button>
                          </div>
                        </>
                      ) : isSubmitted ? (
                        <div className="text-center py-4">
                          <div className="text-green-600 font-semibold text-lg mb-2">
                            ✓ Item Successfully Submitted
                          </div>
                          <p className={`text-sm ${palette.textDim}`}>
                            Selection:{" "}
                            {itemState.optionId === yesOption?.id
                              ? yesOption?.name
                              : noOption?.name}
                            {itemState.remarks && (
                              <span className="block mt-1">
                                Remarks: {itemState.remarks}
                              </span>
                            )}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <div className={`font-medium text-lg mb-2 ${palette.textDim}`}>
                            📋 Read-Only Item
                          </div>
                          <p className={`text-sm ${palette.textDim}`}>
                            Status: {item.status.replace("_", " ")}
                            <br />
                            This item is not pending for inspector review.
                          </p>
                          {/* Show available options for read-only items */}
                          {item.options && item.options.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs text-gray-500 mb-2">Available options:</p>
                              <div className="flex gap-2 justify-center">
                                {item.options.map((option) => (
                                  <span
                                    key={option.id}
                                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                                  >
                                    {option.name} ({option.choice === "P" ? "Yes" : "No"})
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {/* Summary */}
            {stats.total > 0 && (
              <div className={`mt-6 p-4 ${palette.highlight} rounded-lg`}>
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <strong>Summary:</strong> {stats.submitted} of {stats.pending} pending items submitted
                    {stats.readonly > 0 && ` • ${stats.readonly} read-only items`}
                    {stats.pending - stats.submitted > 0 && ` • ${stats.pending - stats.submitted} remaining`}
                  </div>
                  {stats.submitted === stats.pending && stats.pending > 0 && (
                    <div className="text-green-600 font-semibold">
                      ✓ All pending items have been submitted!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default PendingInspectorChecklists;

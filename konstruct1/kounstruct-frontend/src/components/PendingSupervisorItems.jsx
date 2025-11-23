import React, { useEffect, useState } from "react";
import SiteBarHome from "./SiteBarHome";
import { projectInstance, NEWchecklistInstance } from "../api/axiosInstance";
import { useTheme } from "../ThemeContext";

// THEME-AWARE PALETTE
const getPalette = (theme) => ({
  bg: theme === "dark" ? "bg-[#181826]" : "bg-gray-50",
  card: theme === "dark" ? "bg-[#23232e] border border-yellow-900 shadow" : "bg-white border border-purple-100 shadow",
  cardAlt: theme === "dark" ? "bg-yellow-900/20 border border-yellow-900" : "bg-purple-50 border border-purple-200",
  cardBlue: theme === "dark" ? "bg-blue-900/10 border border-blue-800" : "bg-blue-50 border border-blue-100",
  text: theme === "dark" ? "text-yellow-100" : "text-gray-900",
  textHead: theme === "dark" ? "text-yellow-400" : "text-purple-700",
  textDim: theme === "dark" ? "text-yellow-300/80" : "text-gray-600",
  button: theme === "dark" ? "bg-yellow-700 hover:bg-yellow-600 text-yellow-100" : "bg-purple-600 hover:bg-purple-700 text-white",
  buttonAlt: theme === "dark" ? "bg-yellow-900 hover:bg-yellow-800 text-yellow-200" : "bg-gray-600 hover:bg-gray-700 text-white",
  badge: theme === "dark" ? "bg-yellow-900 text-yellow-300" : "bg-purple-100 text-purple-700",
  badgeBlue: theme === "dark" ? "bg-blue-900 text-blue-300" : "bg-blue-100 text-blue-700",
  border: theme === "dark" ? "border-yellow-700" : "border-purple-200",
  input: theme === "dark" ? "bg-[#181826] text-yellow-100 border-yellow-900" : "bg-white text-gray-800 border-gray-300",
  status: {
    pending: theme === "dark" ? "bg-yellow-900 text-yellow-300" : "bg-purple-100 text-purple-700",
    inspector: theme === "dark" ? "bg-orange-900 text-orange-300" : "bg-orange-100 text-orange-700",
    completed: theme === "dark" ? "bg-green-900 text-green-300" : "bg-green-100 text-green-700",
    progress: theme === "dark" ? "bg-blue-900 text-blue-300" : "bg-blue-100 text-blue-700",
    default: theme === "dark" ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700",
  },
});

function PendingSupervisorItems() {
  const { theme } = useTheme();
  const palette = getPalette(theme);

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState(null);

  const [supervisorItems, setSupervisorItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [itemsError, setItemsError] = useState(null);

  const [statusFilter, setStatusFilter] = useState("all");
  const [currentView, setCurrentView] = useState("items");
  const [selectedItem, setSelectedItem] = useState(null);

  const [itemStates, setItemStates] = useState({});

  // ACCESS
  const accessesStr = localStorage.getItem("ACCESSES");
  const accesses = accessesStr ? JSON.parse(accessesStr) : [];

  // Initialize item states
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
          error: null,
        };
      }
    });
    setItemStates((prev) => ({ ...prev, ...newStates }));
  };

  // Items combine and filter
  const allItems = supervisorItems.pending_for_me || [];
  const availableItems = supervisorItems.available_for_me || [];
  const combinedItems = [...allItems, ...availableItems];
  const filteredItems =
    statusFilter === "all"
      ? combinedItems
      : combinedItems.filter((item) => item.status === statusFilter);

  // Filter options
  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "pending_for_supervisor", label: "Pending for Supervisor" },
    { value: "pending_for_inspector", label: "Pending for Inspector" },
    { value: "completed", label: "Completed" },
  ];

  // Status color
  const getStatusColor = (status) => {
    switch (status) {
      case "pending_for_supervisor":
        return palette.status.pending;
      case "pending_for_inspector":
        return palette.status.inspector;
      case "completed":
        return palette.status.completed;
      case "in_progress":
        return palette.status.progress;
      default:
        return palette.status.default;
    }
  };

  // Reset when filter changes
  useEffect(() => {
    if (currentView !== "items") {
      setCurrentView("items");
      setSelectedItem(null);
    }
  }, [statusFilter]);

  // Fetch supervisor items
  const fetchSupervisorItems = async () => {
    if (!selectedProjectId) {
      setSupervisorItems([]);
      return;
    }
    setLoadingItems(true);
    setItemsError(null);
    try {
      const res = await NEWchecklistInstance.get(`/Supervisor-Pending-work/`, {
        params: { project_id: selectedProjectId },
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });
      setSupervisorItems(res.data);
      const allItems = [
        ...(res.data.pending_for_me || []),
        ...(res.data.available_for_me || []),
      ];
      initializeItemStates(allItems);
    } catch (err) {
      setItemsError("Failed to load supervisor items");
      setSupervisorItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  // Fetch projects
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
        const allProjects = Array.isArray(res.data)
          ? res.data
          : res.data.results || [];
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
    if (accesses.length > 0) {
      fetchProjects();
    }
    // eslint-disable-next-line
  }, []);

  // Fetch supervisor items when project changes
  useEffect(() => {
    fetchSupervisorItems();
    setCurrentView("items");
    setSelectedItem(null);
    // eslint-disable-next-line
  }, [selectedProjectId]);

  // Navigation
  const navigateToItem = (item) => {
    setSelectedItem(item);
    setCurrentView("details");
  };
  const handleGoBack = () => {
    setCurrentView("items");
    setSelectedItem(null);
  };

  // Option select/remarks/photo
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
      [itemId]: {
        ...prev[itemId],
        photoFile: null,
        photoPreview: null,
      },
    }));
  };
  const handleRemarksChange = (itemId, remarks) => {
    setItemStates((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        remarks: remarks,
      },
    }));
  };

  // Submit individual item
  const submitItem = async (itemId) => {
    const itemState = itemStates[itemId];
    if (!itemState?.optionId) {
      setItemStates((prev) => ({
        ...prev,
        [itemId]: { ...prev[itemId], error: "Please select an option" },
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
      formData.append("role", "supervisor");
      formData.append("option_id", itemState.optionId);
      formData.append("check_remark", itemState.remarks || "");
      if (itemState.photoFile) formData.append("check_photo", itemState.photoFile);

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
        [itemId]: {
          ...prev[itemId],
          isSubmitting: false,
          submitted: true,
          error: null,
        },
      }));
      await fetchSupervisorItems();
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

  // Stats
  const getStats = () => {
    const assigned = supervisorItems.pending_for_me?.length || 0;
    const available = supervisorItems.available_for_me?.length || 0;
    const total = assigned + available;
    const pendingForSupervisor = filteredItems.filter(
      (item) => item.status === "pending_for_supervisor"
    ).length;
    const submitted = Object.values(itemStates).filter(
      (s) => s.submitted
    ).length;
    return {
      total,
      assigned,
      available,
      pendingForSupervisor,
      submitted,
      pending: pendingForSupervisor - submitted,
    };
  };

  const stats = getStats();

  // --- COMPONENT RENDER ---
  return (
    <div className={`flex min-h-screen ${palette.bg}`}>
      <SiteBarHome />
      <main className="ml-[15%] w-full p-6">
        {currentView === "items" ? (
          <div>
            <h2 className={`text-2xl font-bold mb-6 ${palette.textHead}`}>
              Supervisor - Pending Items Review
            </h2>
            {/* Project Selection and Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Project Dropdown */}
              <div className={`${palette.card} rounded-lg p-4`}>
                <label className={`block mb-2 font-semibold ${palette.textHead}`}>
                  Select Project:
                </label>
                {loadingProjects ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400 mr-2"></div>
                    <span className={palette.textDim}>Loading projects...</span>
                  </div>
                ) : error ? (
                  <p className="text-red-500 text-sm">{error}</p>
                ) : (
                  <select
                    className={`w-full p-3 rounded-lg border-2 ${palette.input} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
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
              {/* Selected Project Info */}
              {selectedProjectId && (
                <div className={`${palette.card} rounded-lg p-4`}>
                  <h3 className={`font-semibold mb-2 ${palette.text}`}>
                    Selected Project Details:
                  </h3>
                  <div className={`text-sm ${palette.textDim}`}>
                    <p>
                      <span className="font-medium">ID:</span> {selectedProjectId}
                    </p>
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {projects.find((p) => p.id === selectedProjectId)?.name || "N/A"}
                    </p>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="text-sm bg-purple-100 dark:bg-yellow-900/30 rounded-lg px-3 py-2">
                      <span className="font-medium">Assigned: </span>
                      <span className="text-purple-600 dark:text-yellow-400 font-bold">
                        {stats.assigned}
                      </span>
                    </div>
                    <div className="text-sm bg-blue-100 dark:bg-blue-900/20 rounded-lg px-3 py-2">
                      <span className="font-medium">Available: </span>
                      <span className="text-blue-600 dark:text-blue-400 font-bold">
                        {stats.available}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Status Filter */}
            <div className={`${palette.card} rounded-lg shadow p-6 mb-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${palette.text}`}>Filter by Status</h3>
              <div className="flex flex-wrap gap-3">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setStatusFilter(option.value)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      statusFilter === option.value
                        ? `${palette.button} shadow-md`
                        : theme === "dark"
                        ? "bg-[#181826] text-yellow-200 border border-yellow-900"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
            {/* Main Content */}
            {loadingItems ? (
              <div className={`${palette.card} rounded-lg shadow p-6`}>
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mr-3"></div>
                  <span className={palette.textDim}>
                    Loading supervisor items...
                  </span>
                </div>
              </div>
            ) : itemsError ? (
              <div className={`${palette.card} rounded-lg shadow p-6`}>
                <div className="text-center py-8">
                  <p className="text-red-500 mb-2">{itemsError}</p>
                  <button
                    onClick={fetchSupervisorItems}
                    className="text-purple-600 dark:text-yellow-300 hover:text-purple-800 font-medium"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className={`${palette.card} rounded-lg shadow p-6`}>
                <div className="text-center py-8">
                  <p className={palette.textDim}>
                    {statusFilter === "all"
                      ? "No supervisor items for this project."
                      : `No items found with status: ${
                          statusOptions.find(
                            (opt) => opt.value === statusFilter
                          )?.label
                        }`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {supervisorItems.pending_for_me &&
                  supervisorItems.pending_for_me.length > 0 && (
                    <div className={`${palette.cardAlt} rounded-lg shadow`}>
                      <div className="px-6 py-4 border-b bg-purple-50 dark:bg-yellow-900/30">
                        <h3 className="text-lg font-semibold text-purple-800 dark:text-yellow-400 flex items-center gap-2">
                          👤 Assigned to Me ({supervisorItems.pending_for_me.length})
                        </h3>
                      </div>
                      <div className="p-6 space-y-4">
                        {supervisorItems.pending_for_me
                          .filter(
                            (item) =>
                              statusFilter === "all" ||
                              item.status === statusFilter
                          )
                          .map((item, index) => (
                            <ItemCard
                              key={`assigned-${item.id}`}
                              item={item}
                              index={index}
                              itemStates={itemStates}
                              onNavigate={navigateToItem}
                              getStatusColor={getStatusColor}
                              type="assigned"
                            />
                          ))}
                      </div>
                    </div>
                  )}
                {supervisorItems.available_for_me &&
                  supervisorItems.available_for_me.length > 0 && (
                    <div className={`${palette.cardBlue} rounded-lg shadow`}>
                      <div className="px-6 py-4 border-b bg-blue-50 dark:bg-blue-900/20">
                        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-400 flex items-center gap-2">
                          📋 Available for Me ({supervisorItems.available_for_me.length})
                        </h3>
                      </div>
                      <div className="p-6 space-y-4">
                        {supervisorItems.available_for_me
                          .filter(
                            (item) =>
                              statusFilter === "all" ||
                              item.status === statusFilter
                          )
                          .map((item, index) => (
                            <ItemCard
                              key={`available-${item.id}`}
                              item={item}
                              index={index}
                              itemStates={itemStates}
                              onNavigate={navigateToItem}
                              getStatusColor={getStatusColor}
                              type="available"
                            />
                          ))}
                      </div>
                    </div>
                  )}
              </div>
            )}
            {/* Summary */}
            {stats.total > 0 && (
              <div className="mt-6 p-4 bg-purple-50 dark:bg-yellow-900/30 rounded-lg">
                <div className="flex justify-between items-center">
                  <div className={`text-sm ${theme === "dark" ? "text-yellow-200" : "text-gray-700"}`}>
                    <strong>Summary:</strong> {stats.submitted} of{" "}
                    {stats.pendingForSupervisor} pending items reviewed
                    {stats.pending > 0 && ` • ${stats.pending} remaining`}
                  </div>
                  {stats.submitted === stats.pendingForSupervisor &&
                    stats.pendingForSupervisor > 0 && (
                      <div className="text-green-600 dark:text-green-300 font-semibold">
                        ✓ All pending items have been reviewed!
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>
        ) : (
          // ITEM DETAILS VIEW
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <button
                  onClick={handleGoBack}
                  className={`${palette.buttonAlt} px-4 py-2 rounded-lg font-medium mr-4 transition-colors flex items-center`}
                >
                  ← Go Back
                </button>
                <h2 className={`text-2xl font-bold ${palette.text}`}>
                  👨‍💼 Review Item:{" "}
                  {selectedItem?.title || `Item ${selectedItem?.id}`}
                </h2>
              </div>
            </div>
            {selectedItem && (
              <SupervisorItemForm
                item={selectedItem}
                itemStates={itemStates}
                onSelectionChange={handleItemSelection}
                onRemarksChange={handleRemarksChange}
                onPhotoUpload={handlePhotoUpload}
                onRemovePhoto={removePhoto}
                onSubmit={submitItem}
                getStatusColor={getStatusColor}
                theme={theme}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// --- ITEM CARD COMPONENT ---
const ItemCard = ({
  item,
  index,
  itemStates,
  onNavigate,
  getStatusColor,
  type,
}) => {
  const itemState = itemStates[item.id] || {};
  const isSubmitted = itemState.submitted;
  const isPendingForSupervisor = item.status === "pending_for_supervisor";
  return (
    <div
      className={`border-2 rounded-lg p-4 transition-all hover:shadow-md ${
        isSubmitted
          ? "border-green-300 bg-green-50 dark:bg-green-900/20"
          : isPendingForSupervisor
          ? "border-purple-300 bg-purple-50 dark:bg-yellow-900/20"
          : "border-gray-200 bg-gray-50 dark:bg-[#23232e]"
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h5 className="font-semibold text-lg flex items-center gap-2">
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                type === "assigned"
                  ? "bg-purple-600 dark:bg-yellow-700 text-white"
                  : "bg-blue-600 dark:bg-blue-700 text-white"
              }`}
            >
              {type === "assigned" ? "Assigned" : "Available"}
            </span>
            {item.title || `Item ${item.id}`}
            {isSubmitted && (
              <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-1 rounded text-xs">
                ✓ Reviewed
              </span>
            )}
          </h5>
          <div className="text-sm text-gray-600 dark:text-yellow-300 mt-1">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                item.status
              )}`}
            >
              {item.status.replace("_", " ").toUpperCase()}
            </span>
            <span className="mx-2">•</span>
            <span>Checklist: {item.checklist}</span>
            {item.latest_submission && (
              <>
                <span className="mx-2">•</span>
                <span>Attempts: {item.latest_submission.attempts}</span>
              </>
            )}
          </div>
          {item.description && (
            <p className="text-sm text-gray-700 dark:text-yellow-200 mt-2 italic">{item.description}</p>
          )}
        </div>
        <div className="flex flex-col gap-2 ml-4">
          <span className="bg-gray-100 dark:bg-yellow-900 text-gray-700 dark:text-yellow-200 px-2 py-1 rounded text-xs">
            ID: {item.id}
          </span>
          <button
            onClick={() => onNavigate(item)}
            className="bg-purple-600 hover:bg-purple-700 dark:bg-yellow-700 dark:hover:bg-yellow-800 text-white text-xs px-3 py-1 rounded transition-colors"
          >
            Review
          </button>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        {isPendingForSupervisor && !isSubmitted && (
          <button
            onClick={() => onNavigate(item)}
            className="flex-1 bg-purple-600 hover:bg-purple-700 dark:bg-yellow-700 dark:hover:bg-yellow-800 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            👨‍💼 Review Item
          </button>
        )}
        <button
          onClick={() => onNavigate(item)}
          className="bg-gray-600 hover:bg-gray-700 dark:bg-yellow-900 dark:hover:bg-yellow-800 text-white font-semibold py-2 px-4 rounded transition-colors"
        >
          📋 View Details
        </button>
      </div>
    </div>
  );
};

// --- SUPERVISOR ITEM FORM ---
const SupervisorItemForm = ({
  item,
  itemStates,
  onSelectionChange,
  onRemarksChange,
  onPhotoUpload,
  onRemovePhoto,
  onSubmit,
  getStatusColor,
  theme,
}) => {
  const itemState = itemStates[item.id] || {};
  const isSubmitted = itemState.submitted;
  const isPendingForSupervisor = item.status === "pending_for_supervisor";
  const yesOption = item.options?.find((opt) => opt.choice === "P");
  const noOption = item.options?.find((opt) => opt.choice === "N");
  return (
    <div className="bg-white dark:bg-[#23232e] rounded-lg shadow p-6">
      <div
        className={`transition-all ${
          isSubmitted
            ? "bg-green-50 dark:bg-green-900/20"
            : isPendingForSupervisor
            ? "bg-purple-50 dark:bg-yellow-900/20"
            : "bg-gray-50 dark:bg-[#23232e]"
        } rounded-lg p-6`}
      >
        {/* Item Info */}
        <div className="mb-6 p-4 bg-white dark:bg-[#181826] rounded-lg border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <strong>ID:</strong> {item.id}
            </div>
            <div>
              <strong>Status:</strong>{" "}
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  item.status
                )}`}
              >
                {item.status.replace("_", " ").toUpperCase()}
              </span>
            </div>
            <div>
              <strong>Checklist:</strong> {item.checklist}
            </div>
            <div>
              <strong>Ignore:</strong> {item.ignore_now ? "Yes" : "No"}
            </div>
          </div>
          {item.description && (
            <div className="mt-3 text-sm">
              <strong>Description:</strong> {item.description}
            </div>
          )}
        </div>
        {/* Latest Submission Details */}
        {item.latest_submission && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <h6 className="font-semibold text-sm mb-2 text-yellow-800 dark:text-yellow-200">
              📋 Latest Submission Details:
            </h6>
            <div className="text-sm text-gray-700 dark:text-yellow-200 space-y-1">
              <p>
                <strong>Status:</strong> {item.latest_submission.status}
              </p>
              <p>
                <strong>Attempts:</strong> {item.latest_submission.attempts}
              </p>
              {item.latest_submission.remarks && (
                <p>
                  <strong>Remarks:</strong> {item.latest_submission.remarks}
                </p>
              )}
              {item.latest_submission.created_at && (
                <p>
                  <strong>Created:</strong>{" "}
                  {new Date(
                    item.latest_submission.created_at
                  ).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        )}
        {/* Interactive Section - Only for pending_for_supervisor */}
        {isPendingForSupervisor && !isSubmitted ? (
          <>
            {/* Dynamic Yes/No Selection from API options */}
            <div className="flex gap-3 mb-6">
              {yesOption && (
                <button
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                    itemState.optionId === yesOption.id
                      ? "bg-green-600 text-white shadow-lg"
                      : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-200 hover:bg-green-200 border border-green-300"
                  }`}
                  onClick={() => onSelectionChange(item.id, yesOption, item)}
                >
                  ✓ {yesOption.name}
                </button>
              )}
              {noOption && (
                <button
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                    itemState.optionId === noOption.id
                      ? "bg-red-600 text-white shadow-lg"
                      : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-200 hover:bg-red-200 border border-red-300"
                  }`}
                  onClick={() => onSelectionChange(item.id, noOption, item)}
                >
                  ✗ {noOption.name}
                </button>
              )}
            </div>
            {/* Remarks Field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-yellow-100 mb-2">
                Supervisor Remarks (Optional)
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 dark:border-yellow-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows="4"
                placeholder="Add any supervisor comments or observations..."
                value={itemState.remarks || ""}
                onChange={(e) => onRemarksChange(item.id, e.target.value)}
              />
            </div>
            {/* Photo Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-yellow-100 mb-2">
                Reviewer Photo (Optional)
              </label>
              {!itemState.photoPreview ? (
                <div className="border-2 border-dashed border-gray-300 dark:border-yellow-900 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onPhotoUpload(item.id, e.target.files[0])}
                    className="hidden"
                    id={`photo-${item.id}`}
                  />
                  <label
                    htmlFor={`photo-${item.id}`}
                    className="cursor-pointer"
                  >
                    <svg
                      className="mx-auto h-16 w-16 text-gray-400 dark:text-yellow-300"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="mt-3 text-lg text-gray-600 dark:text-yellow-100">
                      Click to upload reviewer photo
                    </p>
                    <p className="text-sm text-gray-500 dark:text-yellow-200">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={itemState.photoPreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => onRemovePhoto(item.id)}
                    className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
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
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            {/* Error Message */}
            {itemState.error && (
              <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {itemState.error}
                </div>
              </div>
            )}
            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 bg-gray-500 dark:bg-yellow-900 hover:bg-gray-600 dark:hover:bg-yellow-800 text-white font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => onSubmit(item.id)}
                disabled={itemState.isSubmitting || !itemState.optionId}
                className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                  itemState.isSubmitting
                    ? "bg-gray-400 dark:bg-yellow-700/20 cursor-not-allowed"
                    : !itemState.optionId
                    ? "bg-gray-300 dark:bg-yellow-700/10 cursor-not-allowed"
                    : "bg-purple-600 hover:bg-purple-700 dark:bg-yellow-700 dark:hover:bg-yellow-800 text-white shadow-lg"
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
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting Review...
                  </span>
                ) : (
                  "✅ Submit Supervisor Review"
                )}
              </button>
            </div>
          </>
        ) : isSubmitted ? (
          <div className="text-center py-8">
            <div className="text-green-600 dark:text-green-300 font-semibold text-2xl mb-3">
              ✅ Review Submitted Successfully
            </div>
            <p className="text-lg text-gray-600 dark:text-yellow-100 mb-4">
              This item has been reviewed and processed.
            </p>
            <div className="bg-white dark:bg-[#181826] p-4 rounded-lg border max-w-md mx-auto">
              <p className="text-sm text-gray-700 dark:text-yellow-100">
                <strong>Decision:</strong>
              </p>
              <p className="text-sm text-gray-600 dark:text-yellow-200 mt-1">
                {itemState.optionId === yesOption?.id
                  ? yesOption?.name
                  : noOption?.name}
              </p>
              {itemState.remarks && (
                <>
                  <p className="text-sm text-gray-700 dark:text-yellow-100 mt-2">
                    <strong>Remarks:</strong>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-yellow-200 mt-1">
                    {itemState.remarks}
                  </p>
                </>
              )}
            </div>
            <button
              onClick={() => window.history.back()}
              className="mt-6 bg-purple-600 hover:bg-purple-700 dark:bg-yellow-700 dark:hover:bg-yellow-800 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              ← Back to Items List
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-600 dark:text-yellow-100 font-medium text-lg mb-2">
              📋 Read-Only Item
            </div>
            <p className="text-sm text-gray-600 dark:text-yellow-100">
              Status: {item.status.replace("_", " ")}
              <br />
              This item is not pending for supervisor review.
            </p>
            {/* Show available options for read-only items */}
            {item.options && item.options.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 dark:text-yellow-200 mb-2">Available options:</p>
                <div className="flex gap-2 justify-center">
                  {item.options.map((option) => (
                    <span
                      key={option.id}
                      className="px-2 py-1 bg-gray-100 dark:bg-yellow-900 text-gray-600 dark:text-yellow-100 rounded text-xs"
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
    </div>
  );
};

export default PendingSupervisorItems;

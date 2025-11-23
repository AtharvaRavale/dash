import React, { useEffect, useState } from "react";
import SiteBarHome from "./SiteBarHome";
import { projectInstance, NEWchecklistInstance } from "../api/axiosInstance";
import { useTheme } from "../ThemeContext";

function PendingForMakerItems() {
  const { theme } = useTheme();
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

  // All state and logic below is unchanged (pasted as in your code)
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState(null);

  const [assignedItems, setAssignedItems] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [itemsError, setItemsError] = useState(null);

  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("assigned");
  const [currentView, setCurrentView] = useState("items");
  const [selectedItem, setSelectedItem] = useState(null);

  const [groupBy, setGroupBy] = useState("checklist");
  const [expandedGroups, setExpandedGroups] = useState({});
  const [itemStates, setItemStates] = useState({});

  const accessesStr = localStorage.getItem("ACCESSES");
  const accesses = accessesStr ? JSON.parse(accessesStr) : [];

  const getCurrentItems = () => {
    switch (viewMode) {
      case "assigned":
        return assignedItems;
      case "available":
        return availableItems;
      case "all":
        return [...assignedItems, ...availableItems];
      default:
        return assignedItems;
    }
  };

  const initializeItemStates = (items) => {
    const newStates = {};
    items.forEach((item) => {
      if (!itemStates[item.id]) {
        newStates[item.id] = {
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

  const filteredItems =
    statusFilter === "all"
      ? getCurrentItems()
      : getCurrentItems().filter((item) => item.status === statusFilter);

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "pending_for_maker", label: "Pending for Maker" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "pending_for_maker":
        return theme === "dark"
          ? "bg-yellow-900 text-yellow-100"
          : "bg-orange-100 text-orange-700";
      case "rejected_by_checker":
        return "bg-orange-100 text-orange-700";
      case "rejected_by_supervisor":
        return "bg-purple-100 text-purple-700";
      case "created":
        return theme === "dark"
          ? "bg-blue-900 text-blue-200"
          : "bg-blue-100 text-blue-700";
      case "in_progress":
        return theme === "dark"
          ? "bg-yellow-700 text-yellow-100"
          : "bg-yellow-100 text-yellow-700";
      case "completed":
        return "bg-green-200 text-green-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  useEffect(() => {
    if (currentView !== "items") {
      setCurrentView("items");
      setSelectedItem(null);
    }
  }, [statusFilter, viewMode]);

  const fetchPendingItems = async () => {
    if (!selectedProjectId) {
      setAssignedItems([]);
      setAvailableItems([]);
      return;
    }

    setLoadingItems(true);
    setItemsError(null);
    try {
      const res = await NEWchecklistInstance.get(`/pending-for-maker/`, {
        params: { project_id: selectedProjectId },
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });

      const assignedData = res.data?.assigned_to_me || [];
      const availableData = res.data?.available_for_me || [];

      setAssignedItems(assignedData);
      setAvailableItems(availableData);

      initializeItemStates([...assignedData, ...availableData]);
    } catch (err) {
      setItemsError("Failed to load pending items");
      setAssignedItems([]);
      setAvailableItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

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
  }, []);

  useEffect(() => {
    fetchPendingItems();
    setExpandedGroups({});
    setCurrentView("items");
    setSelectedItem(null);
    // eslint-disable-next-line
  }, [selectedProjectId]);

  const getGroupedItems = () => {
    if (groupBy === "none") {
      return { "All Items": filteredItems };
    }
    const grouped = {};
    filteredItems.forEach((item) => {
      let key;
      if (groupBy === "checklist") {
        key = `Checklist ${item.checklist}`;
      } else if (groupBy === "status") {
        key = item.status || "Unknown Status";
      }
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });
    return grouped;
  };

  const toggleGroup = (groupName) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const navigateToItem = (item) => {
    setSelectedItem(item);
    setCurrentView("details");
  };

  const handleGoBack = () => {
    setCurrentView("items");
    setSelectedItem(null);
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

  const submitItem = async (itemId) => {
    const itemState = itemStates[itemId];
    const item = [...assignedItems, ...availableItems].find(
      (i) => i.id === itemId
    );
    if (!itemState?.remarks?.trim()) {
      setItemStates((prev) => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          error: "Please provide fix description/remarks",
        },
      }));
      return;
    }
    setItemStates((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        isSubmitting: true,
        error: null,
      },
    }));
    try {
      const response = await NEWchecklistInstance.post(
        "/mark-as-done-maker/",
        {
          checklist_item_id: itemId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
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
      setTimeout(() => {
        fetchPendingItems();
      }, 2000);
    } catch (error) {
      setItemStates((prev) => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          isSubmitting: false,
          error:
            error.response?.data?.detail ||
            "Failed to submit. Please try again.",
        },
      }));
    }
  };

  const getStats = () => {
    const currentItems = getCurrentItems();
    const total = currentItems.length;
    const submitted = Object.values(itemStates).filter(
      (s) => s.submitted
    ).length;
    const withPhotos = Object.values(itemStates).filter(
      (s) => s.photoFile
    ).length;
    return {
      total,
      submitted,
      pending: total - submitted,
      withPhotos,
      assigned: assignedItems.length,
      available: availableItems.length,
    };
  };

  const stats = getStats();
  const groupedItems = getGroupedItems();

  return (
    <div className={`flex min-h-screen ${palette.pageBg}`}>
      <SiteBarHome />
      <main className="ml-[15%] w-full p-6">
        {currentView === "items" ? (
          <div>
            <h2 className={`text-2xl font-bold mb-6 ${palette.textHead}`}>
              Pending for Maker - Fix Required Items
            </h2>
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
                      <span className="font-medium">Items: </span>
                      <span className="font-bold">{stats.assigned} assigned</span>
                      <span className="mx-1">|</span>
                      <span className="font-bold">{stats.available} available</span>
                      {stats.submitted > 0 && (
                        <>
                          <span className="mx-1">|</span>
                          <span className="text-green-600">{stats.submitted} submitted</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className={`${palette.card} rounded-lg shadow p-6 mb-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${palette.text}`}>View Mode</h3>
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => setViewMode("assigned")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === "assigned" ? "bg-purple-600 text-white shadow-md" : palette.buttonAlt
                  }`}
                >
                  Assigned to Me ({assignedItems.length})
                </button>
                <button
                  onClick={() => setViewMode("available")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === "available" ? "bg-blue-600 text-white shadow-md" : palette.buttonAlt
                  }`}
                >
                  Available for Me ({availableItems.length})
                </button>
                <button
                  onClick={() => setViewMode("all")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === "all" ? "bg-green-600 text-white shadow-md" : palette.buttonAlt
                  }`}
                >
                  All Items ({assignedItems.length + availableItems.length})
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
            <div className={`${palette.card} rounded-lg shadow p-4 mb-6`}>
              <div className="flex items-center gap-4">
                <label className="font-medium">Group by:</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setGroupBy("checklist")}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                      groupBy === "checklist"
                        ? "bg-blue-600 text-white"
                        : palette.buttonAlt
                    }`}
                  >
                    Checklist
                  </button>
                  <button
                    onClick={() => setGroupBy("status")}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                      groupBy === "status"
                        ? "bg-blue-600 text-white"
                        : palette.buttonAlt
                    }`}
                  >
                    Status
                  </button>
                  <button
                    onClick={() => setGroupBy("none")}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                      groupBy === "none"
                        ? "bg-blue-600 text-white"
                        : palette.buttonAlt
                    }`}
                  >
                    No Grouping
                  </button>
                </div>
              </div>
            </div>

            {loadingItems ? (
              <div className={`${palette.card} rounded-lg shadow p-6`}>
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mr-3"></div>
                  <span className={palette.textDim}>Loading pending items...</span>
                </div>
              </div>
            ) : itemsError ? (
              <div className={`${palette.card} rounded-lg shadow p-6`}>
                <div className="text-center py-8">
                  <p className="text-red-500 mb-2">{itemsError}</p>
                  <button
                    onClick={fetchPendingItems}
                    className="text-yellow-400 hover:text-yellow-200 font-medium"
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
                      ? `No ${
                          viewMode === "assigned"
                            ? "assigned"
                            : viewMode === "available"
                            ? "available"
                            : ""
                        } items for this project.`
                      : `No items found with status: ${
                          statusOptions.find(
                            (opt) => opt.value === statusFilter
                          )?.label
                        }`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedItems).map(([groupName, items]) => (
                  <div key={groupName} className={`${palette.card} rounded-lg shadow`}>
                    {groupBy !== "none" && (
                      <div
                        className="px-6 py-4 border-b cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleGroup(groupName)}
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <svg
                              className={`w-5 h-5 transition-transform ${
                                expandedGroups[groupName] ? "rotate-90" : ""
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {groupName}
                          </h3>
                          <span className="text-sm">
                            {items.length} item{items.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    )}

                    {(groupBy === "none" || expandedGroups[groupName]) && (
                      <div className="p-6 space-y-4">
                        {items.map((item, index) => {
                          const itemState = itemStates[item.id] || {};
                          const isSubmitted = itemState.submitted;
                          const lastSubmission = item.latest_submission;
                          const isAssigned = assignedItems.some(
                            (i) => i.id === item.id
                          );

                          return (
                            <div
                              key={item.id}
                              className={`border-2 rounded-lg p-4 transition-all hover:shadow-md ${
                                isSubmitted
                                  ? "border-green-300 bg-green-50"
                                  : isAssigned
                                  ? "border-purple-300 bg-purple-50"
                                  : "border-blue-300 bg-blue-50"
                              }`}
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                  <h5 className={`font-semibold text-lg flex items-center gap-2 ${palette.text}`}>
                                    <span
                                      className={`px-2 py-1 rounded text-xs ${
                                        isAssigned
                                          ? "bg-purple-600 text-white"
                                          : "bg-blue-600 text-white"
                                      }`}
                                    >
                                      {isAssigned
                                        ? "Assigned to Me"
                                        : "Available"}
                                    </span>
                                    {item.title || `Item ${item.id}`}
                                    {isSubmitted && (
                                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                                        ✓ Fixed & Submitted
                                      </span>
                                    )}
                                  </h5>
                                  <div className={`text-sm mt-1 ${palette.textDim}`}>
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                        item.status
                                      )}`}
                                    >
                                      {item.status
                                        .replace("_", " ")
                                        .toUpperCase()}
                                    </span>
                                    <span className="mx-2">•</span>
                                    <span>
                                      Photo:{" "}
                                      <span
                                        className={
                                          item.photo_required
                                            ? "text-red-600 font-semibold"
                                            : ""
                                        }
                                      >
                                        {item.photo_required
                                          ? "Required"
                                          : "Optional"}
                                      </span>
                                    </span>
                                    <span className="mx-2">•</span>
                                    <span>Checklist: {item.checklist}</span>
                                  </div>
                                  {item.description && (
                                    <p className={`text-sm mt-2 italic ${palette.textDim}`}>
                                      {item.description}
                                    </p>
                                  )}
                                  {lastSubmission && (
                                    <div className="mt-2 text-xs bg-gray-100 p-2 rounded">
                                      <strong>Latest:</strong> Attempt #
                                      {lastSubmission.attempts} -{" "}
                                      {lastSubmission.status}
                                      {lastSubmission.created_at && (
                                        <span className="ml-2">
                                          (
                                          {new Date(
                                            lastSubmission.created_at
                                          ).toLocaleDateString()}
                                          )
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col gap-2 ml-4">
                                  <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">
                                    ID: {item.id}
                                  </span>
                                  <button
                                    onClick={() => navigateToItem(item)}
                                    className={`${palette.button} text-xs px-3 py-1 rounded transition-colors`}
                                  >
                                    View Details
                                  </button>
                                </div>
                              </div>
                              <div className="flex gap-2 pt-2">
                                {!isSubmitted && (
                                  <>
                                    <button
                                      onClick={() => navigateToItem(item)}
                                      className={`flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors`}
                                    >
                                      🔧 Fix Item
                                    </button>
                                    <button
                                      onClick={() => navigateToItem(item)}
                                      className={`bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded transition-colors`}
                                    >
                                      📋 View Details
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {stats.total > 0 && (
              <div className={`mt-6 p-4 ${palette.highlight} rounded-lg`}>
                <div className="flex justify-between items-center">
                  <div className={`text-sm ${palette.textDim}`}>
                    <strong>Summary:</strong> {stats.submitted} of {stats.total}{" "}
                    items fixed ({stats.assigned} assigned, {stats.available}{" "}
                    available)
                    {stats.pending > 0 && ` • ${stats.pending} remaining`}
                  </div>
                  {stats.submitted === stats.total && (
                    <div className="text-green-600 font-semibold">
                      ✓ All items have been fixed!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          // --- ITEM DETAILS VIEW ---
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <button
                  onClick={handleGoBack}
                  className={`bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium mr-4 transition-colors flex items-center`}
                >
                  ← Go Back
                </button>
                <h2 className={`text-2xl font-bold ${palette.textHead}`}>
                  🔧 Fix Item: {selectedItem?.title || `Item ${selectedItem?.id}`}
                </h2>
              </div>
            </div>
            {selectedItem && (
              <div className={`${palette.card} rounded-lg shadow p-6`}>
                {(() => {
                  const itemState = itemStates[selectedItem.id] || {};
                  const isSubmitted = itemState.submitted;
                  const lastSubmission = selectedItem.latest_submission;
                  const isAssigned = assignedItems.some(
                    (i) => i.id === selectedItem.id
                  );
                  return (
                    <div
                      className={`transition-all ${
                        isSubmitted
                          ? "bg-green-50"
                          : isAssigned
                          ? "bg-purple-50"
                          : "bg-blue-50"
                      } rounded-lg p-6`}
                    >
                      <div className={`${palette.card} mb-6 p-4 rounded-lg border`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              isAssigned
                                ? "bg-purple-600 text-white"
                                : "bg-blue-600 text-white"
                            }`}
                          >
                            {isAssigned ? "Assigned to Me" : "Available for Me"}
                          </span>
                        </div>
                        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 text-sm ${palette.textDim}`}>
                          <div>
                            <strong>ID:</strong> {selectedItem.id}
                          </div>
                          <div>
                            <strong>Status:</strong>{" "}
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                selectedItem.status
                              )}`}
                            >
                              {selectedItem.status
                                .replace("_", " ")
                                .toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <strong>Photo Required:</strong>{" "}
                            {selectedItem.photo_required ? "Yes" : "No"}
                          </div>
                          <div>
                            <strong>Checklist:</strong> {selectedItem.checklist}
                          </div>
                        </div>
                        {selectedItem.description && (
                          <div className={`mt-3 text-sm ${palette.text}`}>
                            <strong>Description:</strong>{" "}
                            {selectedItem.description}
                          </div>
                        )}
                      </div>
                      {lastSubmission && (
                        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <h6 className="font-semibold text-sm mb-2 text-yellow-800">
                            📋 Latest Submission Details:
                          </h6>
                          <div className="text-sm text-gray-700 space-y-1">
                            <p>
                              <strong>Status:</strong> {lastSubmission.status}
                            </p>
                            <p>
                              <strong>Attempts:</strong>{" "}
                              {lastSubmission.attempts}
                            </p>
                            {lastSubmission.remarks && (
                              <p>
                                <strong>Remarks:</strong>{" "}
                                {lastSubmission.remarks}
                              </p>
                            )}
                            {lastSubmission.created_at && (
                              <p>
                                <strong>Created:</strong>{" "}
                                {new Date(
                                  lastSubmission.created_at
                                ).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      {!isSubmitted ? (
                        <>
                          <div className="mb-6">
                            <label className={`block text-sm font-medium mb-2 ${palette.text}`}>
                              Fix Description / Remarks
                              <span className="text-red-600 ml-1">*</span>
                            </label>
                            <textarea
                              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${palette.input}`}
                              rows="4"
                              placeholder="Describe what you fixed or changed..."
                              value={itemState.remarks || ""}
                              onChange={(e) =>
                                handleRemarksChange(
                                  selectedItem.id,
                                  e.target.value
                                )
                              }
                              required
                            />
                          </div>
                          <div className="mb-6">
                            <label className={`block text-sm font-medium mb-2 ${palette.text}`}>
                              Photo of Fixed Work
                              {selectedItem.photo_required && (
                                <span className="text-red-600 ml-1">
                                  *Required
                                </span>
                              )}
                            </label>
                            {!itemState.photoPreview ? (
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handlePhotoUpload(
                                      selectedItem.id,
                                      e.target.files[0]
                                    )
                                  }
                                  className="hidden"
                                  id={`photo-${selectedItem.id}`}
                                />
                                <label
                                  htmlFor={`photo-${selectedItem.id}`}
                                  className="cursor-pointer"
                                >
                                  <svg
                                    className="mx-auto h-16 w-16 text-gray-400"
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
                                  <p className="mt-3 text-lg text-gray-600">
                                    Click to upload photo of fixed work
                                  </p>
                                  <p className="text-sm text-gray-500">
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
                                  onClick={() => removePhoto(selectedItem.id)}
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
                          {itemState.error && (
                            <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
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
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={handleGoBack}
                              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => submitItem(selectedItem.id)}
                              disabled={
                                itemState.isSubmitting ||
                                !itemState.remarks?.trim()
                              }
                              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                                itemState.isSubmitting
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : !itemState.remarks?.trim()
                                  ? "bg-gray-300 cursor-not-allowed"
                                  : "bg-green-600 hover:bg-green-700 text-white shadow-lg"
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
                                  Submitting Fix...
                                </span>
                              ) : (
                                "✅ Submit Fixed Item"
                              )}
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-green-600 font-semibold text-2xl mb-3">
                            ✅ Fix Submitted Successfully
                          </div>
                          <p className={`text-lg mb-4 ${palette.textDim}`}>
                            This issue has been fixed and resubmitted for review.
                          </p>
                          <div className={`bg-white p-4 rounded-lg border max-w-md mx-auto ${palette.card}`}>
                            <p className="text-sm font-bold">
                              Fix Description:
                            </p>
                            <p className="text-sm mt-1">
                              {itemState.remarks}
                            </p>
                          </div>
                          <button
                            onClick={handleGoBack}
                            className={`mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors`}
                          >
                            ← Back to Queries
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default PendingForMakerItems;

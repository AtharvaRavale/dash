import React, { useState, useEffect } from "react";
import {
  getProjectCategoryUserAccess,
  patchChecklistRoles,
} from "../api/index";


const UserSelectionTable = ({
  projectId,
  categoryId,
  refreshTrigger,
  onSendUsers,
  checklistId,
}) => {
  const [userAccessData, setUserAccessData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState({
    CHECKER: [],
    MAKER: [],
    SUPERVISOR: [],
  });
  const [sending, setSending] = useState(false);

  const fetchUserAccessData = async () => {
    console.log("Fetching user access data...");
    setLoading(true);
    setError(null);

    try {
      const data = await getProjectCategoryUserAccess(projectId, categoryId);
      setUserAccessData(data);
      console.log("Data loaded successfully");
    } catch (err) {
      console.error("Error loading data:", err);
      setError(err.message || "Failed to fetch user access data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId && categoryId) {
      fetchUserAccessData();
    }
  }, [projectId, categoryId, refreshTrigger]);

  // Handle individual user selection
  const handleUserSelect = (role, userId, isSelected) => {
    setSelectedUsers((prev) => ({
      ...prev,
      [role]: isSelected
        ? [...prev[role], userId]
        : prev[role].filter((id) => id !== userId),
    }));
  };

  // Handle select all for a role
  const handleSelectAllRole = (role, users) => {
    const allUserIds = users.map((user) => user.id);
    const isAllSelected = allUserIds.every((id) =>
      selectedUsers[role].includes(id)
    );

    setSelectedUsers((prev) => ({
      ...prev,
      [role]: isAllSelected ? [] : allUserIds,
    }));
  };

  // Get total selected count
  const getTotalSelected = () => {
    return Object.values(selectedUsers).flat().length;
  };

  // Handle send users - Updated to call PATCH API
  const handleSendUsers = async () => {
    const allSelectedIds = Object.values(selectedUsers).flat();
    if (allSelectedIds.length === 0) {
      alert("Please select at least one user");
      return;
    }

    if (!checklistId) {
      alert("No checklist ID provided");
      return;
    }

    setSending(true);
    try {
      // Prepare roles data for API
      const rolesData = {
        CHECKER: selectedUsers.CHECKER,
        MAKER: selectedUsers.MAKER,
        SUPERVISOR: selectedUsers.SUPERVISOR,
      };

      console.log("🚀 Sending roles to checklist:", { checklistId, rolesData });

      // Call the PATCH API
      const response = await patchChecklistRoles(checklistId, rolesData);

      console.log("✅ Checklist roles updated:", response);

      // Call the parent callback if provided
      if (onSendUsers) {
        await onSendUsers(allSelectedIds, selectedUsers, checklistId);
      }

      // Reset selections after successful send
      setSelectedUsers({
        CHECKER: [],
        MAKER: [],
        SUPERVISOR: [],
      });
    } catch (error) {
      console.error("❌ Error updating checklist roles:", error);
      alert("Failed to assign users to checklist. Please try again.");
    } finally {
      setSending(false);
    }
  };

  // Clear all selections
  const handleClearAll = () => {
    setSelectedUsers({
      CHECKER: [],
      MAKER: [],
      SUPERVISOR: [],
    });
  };

  const renderRoleSection = (role, users, roleColor) => {
    if (!users || users.length === 0) {
      return (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded ${roleColor}`}></div>
            <h3 className="font-semibold text-gray-600">{role}</h3>
            <span className="text-sm text-gray-500">(0 users)</span>
          </div>
          <p className="text-gray-400 text-sm mt-2 ml-7">
            No users assigned to this role
          </p>
        </div>
      );
    }

    const isAllSelected = users.every((user) =>
      selectedUsers[role].includes(user.id)
    );
    const selectedCount = selectedUsers[role].length;

    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Role Header */}
        <div className={`p-4 rounded-t-lg ${getRoleHeaderBg(role)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={() => handleSelectAllRole(role, users)}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <div className={`w-4 h-4 rounded ${roleColor}`}></div>
                <h3 className="font-bold text-gray-800">{role}</h3>
              </label>
              <span className="text-sm text-gray-600">
                ({selectedCount}/{users.length} selected)
              </span>
            </div>
            <button
              onClick={() => handleSelectAllRole(role, users)}
              className="text-sm text-purple-600 hover:text-purple-800 font-medium"
            >
              {isAllSelected ? "Deselect All" : "Select All"}
            </button>
          </div>
        </div>

        {/* Users List */}
        <div className="divide-y divide-gray-100">
          {users.map((user, index) => {
            const isSelected = selectedUsers[role].includes(user.id);
            return (
              <div
                key={user.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  isSelected ? "bg-purple-50 border-l-4 border-purple-500" : ""
                }`}
              >
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) =>
                      handleUserSelect(role, user.id, e.target.checked)
                    }
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-semibold text-sm">
                          {user.username?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.username}
                        </p>
                        <p className="text-sm text-gray-600">
                          {user.first_name} {user.last_name}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-11">
                      {user.email}
                    </p>
                    <p className="text-xs text-gray-400 ml-11">
                      Access ID: {user.access_id}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="text-purple-600">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </label>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getRoleHeaderBg = (role) => {
    switch (role) {
      case "CHECKER":
        return "bg-blue-50 border-b border-blue-200";
      case "MAKER":
        return "bg-green-50 border-b border-green-200";
      case "SUPERVISOR":
        return "bg-orange-50 border-b border-orange-200";
      default:
        return "bg-gray-50 border-b border-gray-200";
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "CHECKER":
        return "bg-blue-500";
      case "MAKER":
        return "bg-green-500";
      case "SUPERVISOR":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        <span className="ml-2 text-gray-600">Loading users...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
        <div className="flex items-center">
          <div className="text-red-500 mr-2">❌</div>
          <div>
            <h3 className="text-red-800 font-medium">Error Loading Users</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        </div>
        <button
          onClick={fetchUserAccessData}
          className="mt-3 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!userAccessData) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 m-4 text-center">
        <p className="text-gray-600">No user access data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden m-4">
      {/* Header */}
      <div className="bg-purple-50 px-6 py-4 border-b border-purple-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-purple-800">
              Assign Users to Checklist
            </h2>
            <p className="text-sm text-purple-600 mt-1">
              Project ID: {projectId} | Category ID: {categoryId} | Checklist
              ID: {checklistId}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-purple-700 font-medium">
              {getTotalSelected()} users selected
            </p>
            <button
              onClick={fetchUserAccessData}
              className="text-sm text-purple-600 hover:text-purple-800 underline"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Role Sections */}
      <div className="p-6 space-y-6">
        {renderRoleSection(
          "CHECKER",
          userAccessData.CHECKER,
          getRoleColor("CHECKER")
        )}
        {renderRoleSection(
          "MAKER",
          userAccessData.MAKER,
          getRoleColor("MAKER")
        )}
        {renderRoleSection(
          "SUPERVISOR",
          userAccessData.SUPERVISOR,
          getRoleColor("SUPERVISOR")
        )}
      </div>

      {/* Action Buttons */}
      <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {getTotalSelected() > 0 ? (
            <span>
              Ready to assign <strong>{getTotalSelected()}</strong> selected
              users to this checklist
            </span>
          ) : (
            <span>Select users to assign to this checklist</span>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleClearAll}
            disabled={getTotalSelected() === 0}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Clear All
          </button>

          <button
            onClick={handleSendUsers}
            disabled={getTotalSelected() === 0 || sending}
            className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {sending ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Assigning...
              </div>
            ) : (
              `Assign ${getTotalSelected()} Users`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSelectionTable;

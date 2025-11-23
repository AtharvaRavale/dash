import React, { useEffect, useState } from "react";
import SiteBarHome from "./SiteBarHome";
import axiosInstance from "../api/axiosInstance";

function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");

  // Expanded rows for mobile
  const [expandedRows, setExpandedRows] = useState({});

  // Fetch users created by current user
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/users-by-creator/");

      console.log("Users API Response:", res.data);
      setUsers(res.data);
    } catch (err) {
      console.error("Users fetch error:", err);
      setError("Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Get unique roles and projects for filters
  const getUniqueRoles = () => {
    const roles = new Set();
    users.forEach((user) => {
      user.accesses?.forEach((access) => {
        access.roles?.forEach((role) => {
          roles.add(role.role);
        });
      });
    });
    return Array.from(roles);
  };

  const getUniqueProjects = () => {
    const projects = new Set();
    users.forEach((user) => {
      user.accesses?.forEach((access) => {
        projects.add(access.project_id);
      });
    });
    return Array.from(projects);
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    // Search filter
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toString().includes(searchTerm);

    // Role filter
    const matchesRole =
      roleFilter === "all" ||
      user.accesses?.some((access) =>
        access.roles?.some((role) => role.role === roleFilter)
      );

    // Project filter
    const matchesProject =
      projectFilter === "all" ||
      user.accesses?.some(
        (access) => access.project_id.toString() === projectFilter
      );

    return matchesSearch && matchesRole && matchesProject;
  });

  // Get role badge color
  const getRoleColor = (role) => {
    switch (role.toLowerCase()) {
      case "maker":
        return "bg-green-100 text-green-700";
      case "inspector":
        return "bg-blue-100 text-blue-700";
      case "checker":
        return "bg-orange-100 text-orange-700";
      case "supervisor":
        return "bg-purple-100 text-purple-700";
      case "admin":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Toggle row expansion (mobile)
  const toggleRowExpansion = (userId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  // Handle user actions
  const handleEditUser = (userId) => {
    console.log("Edit user:", userId);
    // TODO: Implement edit user functionality
    alert(`Edit user ${userId} - Feature to be implemented`);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      console.log("Delete user:", userId);
      // TODO: Implement delete user functionality
      alert(`Delete user ${userId} - Feature to be implemented`);
    }
  };

  const handleManageAccess = (userId) => {
    console.log("Manage access for user:", userId);
    // TODO: Implement manage access functionality
    alert(`Manage access for user ${userId} - Feature to be implemented`);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SiteBarHome />
      <main className="ml-[15%] w-full p-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Users Management</h2>

          {/* Header Stats */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {users.length}
                </div>
                <div className="text-sm text-gray-600">Total Users Created</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {users.filter((u) => u.accesses?.length > 0).length}
                </div>
                <div className="text-sm text-gray-600">Users with Access</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {getUniqueProjects().length}
                </div>
                <div className="text-sm text-gray-600">Projects Assigned</div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Users
                </label>
                <input
                  type="text"
                  placeholder="Search by username, email, or ID..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Role Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Role
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  {getUniqueRoles().map((role) => (
                    <option key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Project Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Project
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                >
                  <option value="all">All Projects</option>
                  {getUniqueProjects().map((projectId) => (
                    <option key={projectId} value={projectId}>
                      Project {projectId}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters Display */}
            {(searchTerm ||
              roleFilter !== "all" ||
              projectFilter !== "all") && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                {searchTerm && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                    Search: "{searchTerm}"
                  </span>
                )}
                {roleFilter !== "all" && (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">
                    Role: {roleFilter}
                  </span>
                )}
                {projectFilter !== "all" && (
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm">
                    Project: {projectFilter}
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setRoleFilter("all");
                    setProjectFilter("all");
                  }}
                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm hover:bg-gray-200"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                <span className="text-gray-600">Loading users...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={fetchUsers}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Try Again
                </button>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">
                  {users.length === 0
                    ? "No users created yet."
                    : "No users match the current filters."}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Access & Projects
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Roles
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          {/* User Details */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                                  {user.username.charAt(0).toUpperCase()}
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.username}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {user.id}
                                </div>
                                {user.email && (
                                  <div className="text-sm text-gray-500">
                                    {user.email}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Access & Projects */}
                          <td className="px-6 py-4">
                            {user.accesses && user.accesses.length > 0 ? (
                              <div className="space-y-1">
                                {user.accesses
                                  .slice(0, 2)
                                  .map((access, index) => (
                                    <div key={index} className="text-sm">
                                      <span className="font-medium text-gray-900">
                                        Project {access.project_id}
                                      </span>
                                      <div className="text-xs text-gray-500">
                                        {access.building_id &&
                                          `Building: ${access.building_id}`}
                                        {access.zone_id &&
                                          ` | Zone: ${access.zone_id}`}
                                        {access.flat_id &&
                                          ` | Flat: ${access.flat_id}`}
                                      </div>
                                    </div>
                                  ))}
                                {user.accesses.length > 2 && (
                                  <div className="text-xs text-blue-600">
                                    +{user.accesses.length - 2} more
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">
                                No access assigned
                              </span>
                            )}
                          </td>

                          {/* Roles */}
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {user.accesses && user.accesses.length > 0 ? (
                                (() => {
                                  const allRoles = new Set();
                                  user.accesses.forEach((access) => {
                                    access.roles?.forEach((role) => {
                                      allRoles.add(role.role);
                                    });
                                  });
                                  return Array.from(allRoles)
                                    .slice(0, 3)
                                    .map((role) => (
                                      <span
                                        key={role}
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
                                          role
                                        )}`}
                                      >
                                        {role}
                                      </span>
                                    ));
                                })()
                              ) : (
                                <span className="text-sm text-gray-500">
                                  No roles
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.is_active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {user.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEditUser(user.id)}
                                className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded text-xs"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleManageAccess(user.id)}
                                className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-2 py-1 rounded text-xs"
                              >
                                Access
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-2 py-1 rounded text-xs"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="border-b border-gray-200 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold mr-3">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.username}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleRowExpansion(user.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {expandedRows[user.id] ? "▲" : "▼"}
                        </button>
                      </div>

                      {/* Roles Preview */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {user.accesses && user.accesses.length > 0 ? (
                          (() => {
                            const allRoles = new Set();
                            user.accesses.forEach((access) => {
                              access.roles?.forEach((role) => {
                                allRoles.add(role.role);
                              });
                            });
                            return Array.from(allRoles)
                              .slice(0, 2)
                              .map((role) => (
                                <span
                                  key={role}
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                                    role
                                  )}`}
                                >
                                  {role}
                                </span>
                              ));
                          })()
                        ) : (
                          <span className="text-sm text-gray-500">
                            No roles
                          </span>
                        )}
                      </div>

                      {/* Expanded Details */}
                      {expandedRows[user.id] && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          {user.email && (
                            <div className="mb-2">
                              <span className="text-sm font-medium">
                                Email:{" "}
                              </span>
                              <span className="text-sm text-gray-600">
                                {user.email}
                              </span>
                            </div>
                          )}

                          <div className="mb-2">
                            <span className="text-sm font-medium">
                              Status:{" "}
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                user.is_active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {user.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>

                          {user.accesses && user.accesses.length > 0 && (
                            <div className="mb-3">
                              <div className="text-sm font-medium mb-1">
                                Project Access:
                              </div>
                              {user.accesses.map((access, index) => (
                                <div
                                  key={index}
                                  className="text-sm text-gray-600 ml-2"
                                >
                                  • Project {access.project_id}
                                  {access.building_id &&
                                    ` (Building: ${access.building_id})`}
                                  {access.zone_id &&
                                    ` (Zone: ${access.zone_id})`}
                                  {access.flat_id &&
                                    ` (Flat: ${access.flat_id})`}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditUser(user.id)}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleManageAccess(user.id)}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm"
                            >
                              Manage Access
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Results Summary */}
          {!loading && !error && (
            <div className="mt-4 text-sm text-gray-600 text-center">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default UsersManagement;

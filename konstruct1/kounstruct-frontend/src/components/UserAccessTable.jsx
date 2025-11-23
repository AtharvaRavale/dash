import React, { useState, useEffect } from "react";
import { getProjectCategoryUserAccess } from  '../api/index';

const UserAccessTable = ({ projectId, categoryId, refreshTrigger }) => {
  const [userAccessData, setUserAccessData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const renderUserRow = (user, index, role) => {
    return (
      <tr key={`${role}-${user.id}-${index}`} className="border-b">
        <td className="px-4 py-2 font-medium">{role}</td>
        <td className="px-4 py-2">{user.username}</td>
        <td className="px-4 py-2">{`${user.first_name} ${user.last_name}`}</td>
        <td className="px-4 py-2">{user.email}</td>
        <td className="px-4 py-2">{user.access_id}</td>
        <td className="px-4 py-2">{user.project_id}</td>
        <td className="px-4 py-2">{user.category}</td>
      </tr>
    );
  };

  const renderRoleSection = (role, users) => {
    if (!users || users.length === 0) {
      return (
        <tr key={`${role}-empty`}>
          <td className="px-4 py-2 font-medium">{role}</td>
          <td className="px-4 py-2 text-gray-500" colSpan="6">
            No users assigned
          </td>
        </tr>
      );
    }

    return users.map((user, index) => renderUserRow(user, index, role));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading user access data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
        <div className="flex items-center">
          <div className="text-red-500 mr-2">❌</div>
          <div>
            <h3 className="text-red-800 font-medium">
              Error Loading User Access Data
            </h3>
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
      <div className="bg-gray-50 px-6 py-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            User Access Management
          </h2>
          <button
            onClick={fetchUserAccessData}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors text-sm"
          >
            Refresh
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Project ID: {projectId} | Category ID: {categoryId}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Full Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Access ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {renderRoleSection("CHECKER", userAccessData.CHECKER)}
            {renderRoleSection("MAKER", userAccessData.MAKER)}
            {renderRoleSection("SUPERVISOR", userAccessData.SUPERVISOR)}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserAccessTable;

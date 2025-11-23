import React from 'react';
import { useNavigate } from "react-router-dom";
import { FiMail, FiCalendar, FiRefreshCw } from 'react-icons/fi'; // Icons from react-icons library

const PropertyManagementSystem = () => {
  const navigate = useNavigate();
  
  // Handle email click action
  const handleEmailClick = () => {
    alert('Email sent to client!');
  };
  
  // Handle scheduling visit
  const handleScheduleVisit = () => {
    navigate('/UserHome'); // Navigate to /UserHome
  };
  
  return (
    <div className="w-full h-full p-6 bg-gray-100">
      {/* Request Management Section */}
      <div className="my-8 bg-white rounded-lg shadow-lg p-8">
        {/* Header Stats */}
        <div className="grid grid-cols-5 gap-6 mb-8">
          <div className="bg-yellow-100 p-6 rounded-lg text-center shadow-sm">
            <h3 className="text-3xl font-semibold text-yellow-600">1</h3>
            <p className="text-gray-600">Total Scheduled</p>
          </div>
          <div className="bg-green-100 p-6 rounded-lg text-center shadow-sm">
            <h3 className="text-3xl font-semibold text-green-600">0</h3>
            <p className="text-gray-600">Total Site Visited</p>
          </div>
          <div className="bg-orange-100 p-6 rounded-lg text-center shadow-sm">
            <h3 className="text-3xl font-semibold text-orange-600">0</h3>
            <p className="text-gray-600">Total Invite Requested</p>
          </div>
          <div className="bg-red-100 p-6 rounded-lg text-center shadow-sm">
            <h3 className="text-3xl font-semibold text-red-600">28</h3>
            <p className="text-gray-600">Total Cancelled</p>
          </div>
          <div className="bg-blue-100 p-6 rounded-lg text-center shadow-sm">
            <h3 className="text-3xl font-semibold text-blue-600">6</h3>
            <p className="text-gray-600">Total Handover Completed</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4">
            <button className="bg-blue-500 text-white px-5 py-3 rounded-lg hover:bg-blue-600 transition">
              Filters
            </button>
            <button className="bg-gray-500 text-white px-5 py-3 rounded-lg hover:bg-gray-600 transition">
              Export
            </button>
          </div>
          <div className="flex space-x-4 items-center">
            <button
              onClick={handleScheduleVisit}
              className="bg-green-500 text-white px-5 py-3 rounded-lg hover:bg-green-600 transition"
            >
              Schedule Visit
            </button>
            <input 
              type="text" 
              placeholder="Search" 
              className="px-5 py-3 border rounded-lg shadow-sm focus:ring focus:border-blue-300 transition"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto shadow-lg rounded-lg border border-gray-200">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Id</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Tower</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Flat</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Flat Type</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Payment Status</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Facility Management</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Master Status</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Account Team</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Project Team</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Current Status</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Email Sent By</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Email Sent At</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Site Visit</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Swap</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Invite</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-gray-50 transition">
                <td className="py-4 px-6">1</td>
                <td className="py-4 px-6">A</td>
                <td className="py-4 px-6">#001</td>
                <td className="py-4 px-6">2BHK</td>
                <td className="py-4 px-6 text-red-600">Payment Pending</td>
                <td className="py-4 px-6 text-yellow-600">Pending</td>
                <td className="py-4 px-6 text-yellow-600">Pending</td>
                <td className="py-4 px-6 text-green-600">Verified</td>
                <td className="py-4 px-6 text-yellow-600">Pending</td>
                <td className="py-4 px-6 text-yellow-600">Pending</td>
                <td className="py-4 px-6">John Doe</td>
                <td className="py-4 px-6">12.00</td>
                <td className="py-4 px-6">
                  <button className="p-3 rounded-full bg-green-100 hover:bg-green-200 transition">
                    <FiCalendar className="text-green-500" />
                  </button>
                </td>
                <td className="py-4 px-6">
                  <button className="p-3 rounded-full bg-orange-100 hover:bg-orange-200 transition">
                    <FiRefreshCw className="text-orange-500" />
                  </button>
                </td>
                <td className="py-4 px-6">
                  <button
                    className="p-3 rounded-full bg-blue-100 hover:bg-blue-200 transition"
                    onClick={handleEmailClick}
                  >
                    <FiMail className="text-blue-500" />
                  </button>
                </td>
              </tr>
              {/* Additional rows go here */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PropertyManagementSystem;

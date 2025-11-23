import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    status: 'Active',
    residentType: 'Owner',
    membershipType: 'Primary',
    birthDate: '',
    anniversary: '',
    familyMembers: '',
  });

  const [editingIndex, setEditingIndex] = useState(null);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Add or update user
  const handleAddOrUpdateUser = (e) => {
    e.preventDefault();

    if (editingIndex !== null) {
      // Edit existing user
      const updatedUsers = users.map((user, index) =>
        index === editingIndex ? formData : user
      );
      setUsers(updatedUsers);
      setEditingIndex(null);
    } else {
      // Add new user
      setUsers([...users, formData]);
    }

    // Reset form
    setFormData({
      title: '',
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      status: 'Active',
      residentType: 'Owner',
      membershipType: 'Primary',
      birthDate: '',
      anniversary: '',
      familyMembers: '',
    });
  };

  // Edit user
  const handleEditUser = (index) => {
    const userToEdit = users[index];
    setFormData(userToEdit);
    setEditingIndex(index);
  };

  // Delete user
  const handleDeleteUser = (index) => {
    const updatedUsers = users.filter((_, i) => i !== index);
    setUsers(updatedUsers);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* User Management Form */}
      <div className="mt-6 bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FontAwesomeIcon icon={faUser} className="mr-2" /> User Management
        </h2>
        <form className="grid grid-cols-3 gap-4" onSubmit={handleAddOrUpdateUser}>
          <div>
            <label className="block text-sm font-medium">Title</label>
            <select
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm"
            >
              <option>Select Title</option>
              <option>Mr.</option>
              <option>Ms.</option>
              <option>Mrs.</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm"
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>

          {/* Resident Type */}
          <div>
            <label className="block text-sm font-medium">Resident Type</label>
            <div className="mt-1 flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="residentType"
                  value="Owner"
                  checked={formData.residentType === 'Owner'}
                  onChange={handleChange}
                  className="mr-2"
                />
                Owner
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="residentType"
                  value="Tenant"
                  checked={formData.residentType === 'Tenant'}
                  onChange={handleChange}
                  className="mr-2"
                />
                Tenant
              </label>
            </div>
          </div>

          {/* Membership Type */}
          <div>
            <label className="block text-sm font-medium">Membership Type</label>
            <div className="mt-1 flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="membershipType"
                  value="Primary"
                  checked={formData.membershipType === 'Primary'}
                  onChange={handleChange}
                  className="mr-2"
                />
                Primary
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="membershipType"
                  value="Secondary"
                  checked={formData.membershipType === 'Secondary'}
                  onChange={handleChange}
                  className="mr-2"
                />
                Secondary
              </label>
            </div>
          </div>

          {/* Additional Info */}
          <div>
            <label className="block text-sm font-medium">Birth Date</label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Anniversary</label>
            <input
              type="date"
              name="anniversary"
              value={formData.anniversary}
              onChange={handleChange}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">No. of Family Members</label>
            <input
              type="number"
              name="familyMembers"
              value={formData.familyMembers}
              onChange={handleChange}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm"
            />
          </div>
          <div className="col-span-3 text-right">
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded mt-4"
            >
              {editingIndex !== null ? 'Update User' : 'Add User'}
            </button>
          </div>
        </form>
      </div>

      {/* User List Table */}
      <div className="mt-6 bg-white p-6 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">User List</h3>
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="border-b bg-gray-200">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Mobile</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Membership Type</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={index} className="border-b">
                <td className="p-2">{`${user.title} ${user.firstName} ${user.lastName}`}</td>
                <td className="p-2">{user.phone}</td>
                <td className="p-2">{user.email}</td>
                <td className="p-2">{user.status}</td>
                <td className="p-2">{user.membershipType}</td>
                <td className="p-2">
                  <button
                    className="mr-2 text-blue-500"
                    onClick={() => handleEditUser(index)}
                  >
                    <FontAwesomeIcon icon={faPen} />
                  </button>
                  <button
                    className="text-red-500"
                    onClick={() => handleDeleteUser(index)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserManagement;



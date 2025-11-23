// src/components/ProjectDetails.js

import React, { useState } from 'react';
import { FaBuilding } from 'react-icons/fa';

const ProjectDetails = () => {
  const [projectDetails, setProjectDetails] = useState({
    towers: '',
    towerNames: '',
    wings: '',
    flatsPerFloor: '',
    selectedCommonAreas: [],
  });

  const commonAreas = [
    { id: 'balcony', label: 'Balcony' },
    { id: 'refuge', label: 'Refuge Area' },
    { id: 'gym', label: 'Gym' },
    { id: 'pool', label: 'Swimming Pool' },
    { id: 'parking', label: 'Parking' },
  ];

  const handleCommonAreaChange = (areaId) => {
    setProjectDetails((prevDetails) => {
      const { selectedCommonAreas } = prevDetails;
      if (selectedCommonAreas.includes(areaId)) {
        return { ...prevDetails, selectedCommonAreas: selectedCommonAreas.filter(id => id !== areaId) };
      } else {
        return { ...prevDetails, selectedCommonAreas: [...selectedCommonAreas, areaId] };
      }
    });
  };

  const handleNextStep = () => {
    console.log("Proceeding to the next step with details:", projectDetails);
  };

  const handleBack = () => {
    console.log("Going back to the previous step");
  };

  return (
    <div className="p-6 border rounded-lg shadow-lg bg-white transition duration-300 hover:shadow-xl">
      <h2 className="text-2xl font-bold mb-4 flex items-center text-gray-800">
        <FaBuilding className="mr-2 text-blue-600" />
        Step 2: Specify Towers, Wings, and Flats
      </h2>

      <div className="mb-4">
        <label className="block text-gray-700 mb-1">Number of Towers:</label>
        <input
          type="number"
          value={projectDetails.towers}
          onChange={(e) => setProjectDetails({ ...projectDetails, towers: e.target.value })}
          className="border p-2 rounded-lg shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 mb-1">Tower Names (comma-separated):</label>
        <input
          type="text"
          value={projectDetails.towerNames}
          onChange={(e) => setProjectDetails({ ...projectDetails, towerNames: e.target.value })}
          className="border p-2 rounded-lg shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g. A, B, C"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 mb-1">Number of Wings:</label>
        <input
          type="number"
          value={projectDetails.wings}
          onChange={(e) => setProjectDetails({ ...projectDetails, wings: e.target.value })}
          className="border p-2 rounded-lg shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 mb-1">Flats per Floor:</label>
        <input
          type="number"
          value={projectDetails.flatsPerFloor}
          onChange={(e) =>
            setProjectDetails({ ...projectDetails, flatsPerFloor: e.target.value })
          }
          className="border p-2 rounded-lg shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <h3 className="text-lg font-semibold mb-2 text-gray-800">Select Common Areas:</h3>
      <div className="flex flex-auto  mb-2">
        {commonAreas.map((area) => (
          <label key={area.id} className="flex items-center mb-2 cursor-pointer">
            <input
              type="checkbox"
              checked={projectDetails.selectedCommonAreas.includes(area.id)}
              onChange={() => handleCommonAreaChange(area.id)}
              className="mr-2"
              style={{ display: 'none' }} // Hide default checkbox
            />
            <span
              className={`p-3 rounded-lg transition-colors duration-200 ml-2 mr-2 flex items-center justify-center border-2 ${
                projectDetails.selectedCommonAreas.includes(area.id)
                  ? 'bg-green-200 text-gary-500 border-green-200'
                  : 'bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300'
              }`}
            >
              {area.label}
            </span>
          </label>
        ))}
      </div>

      <div className="flex justify-between mt-4">
        <button
          onClick={handleBack}
          className="bg-gray-500 text-white py-2 px-4 rounded-lg shadow hover:bg-gray-600 transition"
        >
          Back
        </button>

        <button
          onClick={handleNextStep}
          className="bg-green-400 text-white py-2 px-4 rounded-lg shadow hover:bg-green-600 transition"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ProjectDetails;

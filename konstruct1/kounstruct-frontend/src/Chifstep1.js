import React, { useState } from 'react';
import { FaProjectDiagram } from 'react-icons/fa';
import DEFAULT_IMAGE from './Images/Project.png';

const HandoverForm = () => {
  const projectImages = {
    "Ganga": DEFAULT_IMAGE,
    "Jamuna": DEFAULT_IMAGE,
    "Krishna": DEFAULT_IMAGE,
    "Kaveri": DEFAULT_IMAGE,
  };

  const categories = [
    { name: 'Snagging', subCategories: ['Initial Inspection', 'Snagging Report', 'Final Approval'] },
    { name: 'Handover', subCategories: ['Customer Verification', 'Project Overview', 'Key Handover'] },
    { name: 'Quality Check', subCategories: ['Room Inspection', 'Utilities Check', 'Final Confirmation'] },
    { name: 'Final Approval', subCategories: ['Review Details', 'Sign Agreement'] },
  ];

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [projectImage, setProjectImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submittedProjects, setSubmittedProjects] = useState([]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedSubCategory(null);
  };

  const handleSubCategorySelect = (subCategory) => {
    setSelectedSubCategory(subCategory);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProjectImage(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = () => {
    if (selectedProject || projectName) {
      if (selectedCategory && selectedSubCategory) {
        setSubmittedProjects((prevProjects) => [
          ...prevProjects,
          {
            name: projectName || selectedProject,
            category: selectedCategory.name,
            subCategory: selectedSubCategory,
            image: projectImage ? URL.createObjectURL(projectImage) : null,
          },
        ]);
        alert(`You selected: ${projectName || selectedProject}, Category: ${selectedCategory.name}, Sub-category: ${selectedSubCategory}`);
      } else {
        alert('Please select both a category and a sub-category.');
      }
    } else {
      alert('Please select or create a project.');
    }
  };

  const handleProjectSelection = (value) => {
    setSelectedProject(value);
    setProjectName('');
    setProjectImage(null);
    setImagePreview(null);
  };

  return (
    <div className="p-8 max-w-full mx-auto bg-gradient-to-br from-blue-50 to-white shadow-lg rounded-xl">
      <div className="p-6 border border-gray-300 rounded-lg shadow-md bg-white">
        <h2 className="text-3xl font-semibold mb-6 flex items-center text-gray-800">
          <FaProjectDiagram className="mr-2 text-blue-600" />
          Step 1: Choose or Create a Project & Select Category
        </h2>

        {/* Project Selection */}
        <div className="mb-6">
          <label className="block mb-2 text-gray-700">Choose Existing Project:</label>
          <select
            onChange={(e) => handleProjectSelection(e.target.value)}
            className="border border-gray-300 p-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 w-full"
          >
            <option value="">Select Project</option>
            {Object.keys(projectImages).map((project) => (
              <option key={project} value={project}>{project}</option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-gray-700">Create New Project:</label>
          <input
            type="text"
            placeholder="New Project Name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="border border-gray-300 p-2 rounded-lg shadow-sm w-full mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
          />
        </div>

        {/* Image Upload */}
        <div className="mb-6">
          <label className="block mb-2 text-gray-700">Upload Project Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="border border-gray-300 p-2 rounded-lg shadow-sm w-full mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
          />
        </div>

        {/* Flex Container for Image Preview and Category/Sub-category Selection */}
        <div className="flex items-start justify-between mb-6">
          {/* Image Preview */}
          {imagePreview && (
            <div className="mb-6 w-1/3">
              <h2 className="text-lg font-semibold">New Project Image Preview:</h2>
              <img src={imagePreview} alt="Project Preview" className="w-3/4 h-3/4 object-cover rounded-lg mt-2 border border-gray-300 shadow-sm" />
            </div>
          )}

          {/* Category and Sub-category Selection */}
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-4">Select a Category</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {categories.map((category, index) => (
                <button
                  key={index}
                  className={`px-4 py-2 rounded-lg transition duration-200 transform ${
                    selectedCategory?.name === category.name ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                  onClick={() => handleCategorySelect(category)}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Sub-category Selection */}
            {selectedCategory && (
              <div>
                <h2 className="text-xl font-semibold ">
                  Select a Sub-Category from "{selectedCategory.name}"
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {selectedCategory.subCategories.map((subCategory, index) => (
                    <button
                      key={index}
                      className={`px-4 py-2 rounded-lg transition duration-200 transform ${
                        selectedSubCategory === subCategory ? 'bg-green-600 text-white shadow-lg' : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                      onClick={() => handleSubCategorySelect(subCategory)}
                    >
                      {subCategory}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center mb-6">
          <button
            className="bg-green-700 text-white px-6 py-2 rounded-lg shadow-lg transition duration-200 hover:bg-green-600"
            onClick={handleSubmit}
            disabled={
              (!selectedProject && !projectName) || !selectedCategory || !selectedSubCategory
            }
          >
            Configure Selection
          </button>
        </div>

        {/* Grid for Existing Project Images */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Existing Projects Images</h2>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(projectImages).map(([name, imgSrc]) => (
              <div key={name} className="flex flex-col items-center border rounded-lg shadow-md hover:shadow-lg transition duration-200">
                <img src={imgSrc} alt={name} className="w-40 h-60 object-cover rounded-t-lg" />
                <span className="mt-2 text-center text-gray-700">{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Submitted Projects Display */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Submitted Projects</h2>
          <div className="grid grid-cols-4 gap-4">
            {submittedProjects.map((project, index) => (
              <div key={index} className="flex flex-col items-center border rounded-lg shadow-md hover:shadow-lg transition duration-200">
                <img
                  src={project.image || DEFAULT_IMAGE}
                  alt={project.name}
                  className="w-50 h-60 object-cover rounded-t-lg"
                />
                <span className="mt-2 text-center text-gray-700 font-semibold">{project.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HandoverForm;
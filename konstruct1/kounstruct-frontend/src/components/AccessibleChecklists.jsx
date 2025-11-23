import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { getAccessibleChecklists, assignChecklistToUser }  from '../api/index';// ← Updated import
import axiosInstance from '../api/axiosInstance';
import { projectInstance } from '../api/axiosInstance';

const AccessibleChecklists = () => {
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState({});
  const [selectedProject, setSelectedProject] = useState('');
  
  // Checklist selection state
  const [selectedChecklistId, setSelectedChecklistId] = useState("");
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  
  // Assignment loading state
  const [assigningChecklistId, setAssigningChecklistId] = useState(null);

  // NEW: Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Get user and project data from Redux and JWT token
  const userId = useSelector((state) => state.user.user?.id);
  const selectedProjectId = useSelector((state) => state.user.selectedProject?.id);
  
  // Extract user accesses from JWT token
  const userAccesses = useMemo(() => {
    try {
      const token = localStorage.getItem('ACCESS_TOKEN');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('🔍 JWT Payload:', payload);
        console.log('🔍 JWT accesses:', payload.accesses);
        console.log('🔍 JWT accesses length:', payload.accesses?.length);
        if (payload.accesses) {
          payload.accesses.forEach((access, index) => {
            console.log(`🔍 Access ${index}:`, access);
            console.log(`🔍 Access ${index} project_id:`, access.project_id);
          });
        }
        return payload.accesses || [];
      }
    } catch (error) {
      console.error('Error parsing token:', error);
    }
    return [];
  }, []);

  // Get available project IDs from user accesses
  const availableProjectIds = useMemo(() => {
    return [...new Set(userAccesses.map(access => access.project_id).filter(Boolean))];
  }, [userAccesses]);

  // Use selected project from dropdown or first available project
  const effectiveProjectId = selectedProject || availableProjectIds[0];

  // NEW: Pagination calculations
  const totalPages = Math.ceil(checklists.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentChecklists = checklists.slice(startIndex, endIndex);

  // NEW: Reset pagination when checklists change
  useEffect(() => {
    setCurrentPage(1);
  }, [checklists]);

  // Fetch projects using real API
  const fetchProjects = async () => {
    console.log('🔍 fetchProjects called with availableProjectIds:', availableProjectIds);
    if (availableProjectIds.length === 0) {
      console.log('❌ No available project IDs');
      return;
    }
    
    try {
      // Try projectInstance with different possible endpoints
      console.log('📡 Trying projectInstance POST /projects/by-ids/');
      const response = await projectInstance.post('/projects/by-ids/', {
        ids: availableProjectIds
      });
      console.log('✅ Projects fetched successfully:', response.data);
      setProjects(response.data);
    } catch (error) {
      console.error('❌ Error from project service:', error);
      
      // Try GET endpoint for individual projects
      try {
        console.log('📡 Trying to fetch individual projects with GET');
        const projectPromises = availableProjectIds.map(id => 
          projectInstance.get(`/projects/${id}/`)
        );
        const responses = await Promise.all(projectPromises);
        
        const projectData = {};
        responses.forEach(response => {
          const project = response.data;
          projectData[project.id] = project;
        });
        
        console.log('✅ Projects fetched individually:', projectData);
        setProjects(projectData);
      } catch (error2) {
        console.error('❌ Error fetching individual projects:', error2);
        console.log('🤔 No project endpoints working. Check which endpoints exist on port 8001');
      }
    }
  };

  // Fetch projects when availableProjectIds changes
  useEffect(() => {
    console.log('🔄 useEffect triggered - availableProjectIds:', availableProjectIds);
    console.log('🔄 availableProjectIds length:', availableProjectIds.length);
    console.log('🔄 availableProjectIds values:', availableProjectIds);
    
    if (availableProjectIds.length > 0) {
      console.log('🚀 Starting fetchProjects...');
      fetchProjects();
    } else {
      console.log('⚠️ No available project IDs found - no projects to fetch');
    }
  }, [availableProjectIds]);

  // Add useEffect to log projects state changes
  useEffect(() => {
    console.log('📊 Projects state updated:', projects);
    console.log('📊 Projects keys:', Object.keys(projects));
    console.log('📊 Projects count:', Object.keys(projects).length);
  }, [projects]);

  const fetchAccessibleChecklists = async () => {
    console.log('=== DEBUGGING ACCESSIBLE CHECKLISTS ===');
    console.log('1. selectedProjectId:', selectedProjectId);
    console.log('2. userId:', userId);
    console.log('3. userAccesses from token:', userAccesses);
    console.log('4. availableProjectIds:', availableProjectIds);
    console.log('5. effectiveProjectId:', effectiveProjectId);
    
    if (!effectiveProjectId) {
      console.log('❌ No project ID available - stopping');
      toast.error('No accessible projects found');
      return;
    }

    // Check authentication
    const token = localStorage.getItem('ACCESS_TOKEN');
    console.log('3. Token exists:', !!token);
    console.log('4. Token preview:', token ? token.substring(0, 20) + '...' : 'No token');

    setLoading(true);
    setError(null);

    try {
      console.log('6. Making API call using getAccessibleChecklists');
      console.log('7. With project ID:', effectiveProjectId);
      console.log('8. With user ID:', userId);

      const response = await getAccessibleChecklists(effectiveProjectId, userId);

      console.log('8. ✅ API Response Status:', response.status);
      console.log('9. ✅ API Response Data:', response.data);
      console.log('10. ✅ Data type:', typeof response.data);
      console.log('11. ✅ Is array:', Array.isArray(response.data));
      console.log('12. ✅ Array length:', response.data?.length);
      
      setChecklists(response.data);
      
      // Reset checklist selection when checklists change
      setSelectedChecklistId("");
      setSelectedChecklist(null);
      
      if (response.data.length === 0) {
        console.log('13. ℹ️ No checklists returned');
        toast('No accessible checklists found for this project');
      } else {
        console.log('14. ✅ Success:', response.data.length, 'checklists found');
        toast.success(`Loaded ${response.data.length} accessible checklists`);
      }
    } catch (error) {
      console.log('❌ API ERROR DETAILS:');
      console.log('Error status:', error.response?.status);
      console.log('Error data:', error.response?.data);
      console.log('Error detail:', error.response?.data?.detail);
      console.log('Error message:', error.message);
      console.log('Full error:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to fetch accessible checklists';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch when component mounts or when effective project changes
  useEffect(() => {
    if (effectiveProjectId) {
      fetchAccessibleChecklists();
    }
  }, [effectiveProjectId]);

  // Handle checklist selection (View Questions - No Assignment)
  const handleChecklistSelect = (checklistId) => {
    setSelectedChecklistId(checklistId);
    
    if (checklistId === "") {
      setSelectedChecklist(null);
      return;
    }

    // Find the selected checklist
    const checklist = checklists.find(c => c.id === parseInt(checklistId));
    setSelectedChecklist(checklist);
    
    console.log("📋 Selected checklist for viewing:", checklist);
    console.log("❓ Questions in checklist:", checklist?.items || []);
  };

  // UPDATED: Handle checklist assignment with auto-removal
  const handleAssignChecklist = async (checklistId) => {
    try {
      setAssigningChecklistId(checklistId);
      
      console.log('🔄 Assigning checklist:', checklistId);
      console.log('👤 To user:', userId);

      // Use the new API function
      const response = await assignChecklistToUser(checklistId);

      console.log('✅ Assignment response:', response.data);
      
      // Find checklist name for success message
      const checklist = checklists.find(c => c.id === checklistId);
      const checklistName = checklist?.name || `Checklist #${checklistId}`;
      
      toast.success(`✅ "${checklistName}" assigned to you successfully!`);
      
      // ✨ Remove assigned checklist from the list
      setChecklists(prev => prev.filter(c => c.id !== checklistId));
      
      // If the removed checklist was currently selected, clear the selection
      if (selectedChecklist && selectedChecklist.id === checklistId) {
        setSelectedChecklist(null);
        setSelectedChecklistId("");
      }
      
    } catch (error) {
      console.error('❌ Assignment failed:', error);
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to assign checklist';
      
      toast.error(`❌ Assignment failed: ${errorMessage}`);
    } finally {
      setAssigningChecklistId(null);
    }
  };

  // NEW: Handle back button
  const handleBackToList = () => {
    setSelectedChecklist(null);
    setSelectedChecklistId("");
  };

  // NEW: Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefresh = () => {
    fetchAccessibleChecklists();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading accessible checklists...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Checklists</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Accessible Checklists</h1>
          <p className="text-gray-600 mt-1">
            Checklists you have access to based on your role and permissions
          </p>
        </div>
        <div className="flex gap-2">
          {/* NEW: Back Button (only show when viewing checklist details) */}
          {selectedChecklist && (
            <button
              onClick={handleBackToList}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to List
            </button>
          )}
          <button
            onClick={handleRefresh}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Project and Checklist Dropdowns Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        
        {/* Project Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Project:
          </label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <option value="">Select a project...</option>
            {Object.values(projects).map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <div className="mt-1 text-xs text-gray-500">
            {Object.keys(projects).length} projects available
          </div>
        </div>

        {/* Checklist Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Checklist:
          </label>
          <select
            value={selectedChecklistId}
            onChange={(e) => handleChecklistSelect(e.target.value)}
            disabled={checklists.length === 0}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">
              {checklists.length === 0 
                ? "No checklists available..." 
                : "Select a checklist..."
              }
            </option>
            {checklists.map((checklist) => (
              <option key={checklist.id} value={checklist.id}>
                {checklist.name || `Checklist #${checklist.id}`} ({checklist.items?.length || 0} questions)
              </option>
            ))}
          </select>
          <div className="mt-1 text-xs text-gray-500">
            {checklists.length} checklists available
          </div>
        </div>
      </div>

      {/* Selected Checklist Info */}
      {selectedChecklist && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            📋 {selectedChecklist.name || `Checklist #${selectedChecklist.id}`}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-blue-700">
            <div><strong>Questions:</strong> {selectedChecklist.items?.length || 0}</div>
            <div><strong>Status:</strong> {selectedChecklist.status}</div>
            <div><strong>Building ID:</strong> {selectedChecklist.building_id || 'All'}</div>
            <div><strong>Category:</strong> {selectedChecklist.category}</div>
          </div>
          
          {/* Assignment Button for Selected Checklist */}
          <div className="mt-4">
            <button
              onClick={() => handleAssignChecklist(selectedChecklist.id)}
              disabled={assigningChecklistId === selectedChecklist.id}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {assigningChecklistId === selectedChecklist.id ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Assigning...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Assign to Yourself
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Questions Display */}
      {selectedChecklist && selectedChecklist.items && selectedChecklist.items.length > 0 && (
        <div className="space-y-4 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
            Questions ({selectedChecklist.items.length}) - Preview Mode
          </h3>
          
          {selectedChecklist.items.map((question, index) => (
            <div 
              key={question.id} 
              className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              {/* Question Header */}
              <div className="flex items-center mb-3">
                <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                  {index + 1}
                </span>
                <h4 className="text-lg font-medium text-gray-800 flex-1">
                  {question.description}
                </h4>
                {question.photo_required && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                    📷 Photo Required
                  </span>
                )}
              </div>

              {/* Question Details */}
              <div className="ml-11 space-y-2">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div><strong>Sequence:</strong> {question.sequence}</div>
                  <div><strong>Status:</strong> {question.status}</div>
                  <div><strong>Done:</strong> {question.is_done ? 'Yes' : 'No'}</div>
                </div>

                {/* Options (if they exist) */}
                {question.options && question.options.length > 0 && (
                  <div className="mt-3">
                    <div className="text-sm font-medium text-gray-700 mb-2">Options:</div>
                    <div className="flex flex-wrap gap-2">
                      {question.options.map((option, optIndex) => (
                        <span 
                          key={optIndex}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            option.value === 'P' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {option.label} ({option.value})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Checklist Cards View (only show when no specific checklist is selected) */}
      {!selectedChecklist && (
        <>
          {checklists.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-50 rounded-lg p-8">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Accessible Checklists</h3>
                <p className="text-gray-600">
                  You don't have access to any checklists in this project, or none exist yet.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* NEW: Pagination Info */}
              {totalPages > 1 && (
                <div className="mb-4 flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1}-{Math.min(endIndex, checklists.length)} of {checklists.length} checklists
                  </div>
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </div>
                </div>
              )}

              {/* Checklist Cards Grid - Now shows currentChecklists (paginated) */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {currentChecklists.map((checklist) => (
                  <div key={checklist.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                        {checklist.name || `Checklist #${checklist.id}`}
                      </h3>
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                        ID: {checklist.id}
                      </span>
                    </div>
                    
                    {checklist.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {checklist.description}
                      </p>
                    )}

                    <div className="space-y-2 text-sm text-gray-500">
                      {checklist.category && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Category:</span>
                          <span>{checklist.category}</span>
                        </div>
                      )}
                      
                      {checklist.building_id && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Building:</span>
                          <span>{checklist.building_id}</span>
                        </div>
                      )}
                      
                      {checklist.zone_id && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Zone:</span>
                          <span>{checklist.zone_id}</span>
                        </div>
                      )}
                      
                      {checklist.flat_id && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Flat:</span>
                          <span>{checklist.flat_id}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <span className="font-medium">Questions:</span>
                        <span>{checklist.items?.length || 0}</span>
                      </div>
                    </div>

                    {/* Two Buttons */}
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                      <button 
                        onClick={() => handleChecklistSelect(checklist.id.toString())}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Questions
                      </button>
                      
                      <button 
                        onClick={() => handleAssignChecklist(checklist.id)}
                        disabled={assigningChecklistId === checklist.id}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {assigningChecklistId === checklist.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Assigning...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Assign to Yourself
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* NEW: Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center space-x-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === page
                          ? 'text-white bg-purple-600 border border-purple-600'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}

              {/* Total count */}
              <div className="mt-6 text-center text-gray-500">
                <p>Total: {checklists.length} accessible checklist{checklists.length !== 1 ? 's' : ''}</p>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AccessibleChecklists;
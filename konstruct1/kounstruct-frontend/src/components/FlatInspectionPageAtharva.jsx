// import React, { useEffect, useState } from "react";
// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import SiteBarHome from "./SiteBarHome";
// import { useTheme } from "../ThemeContext";
// import axios from "axios";
// import toast from "react-hot-toast";
// import { checklistInstance, projectInstance } from '../api/axiosInstance';

// // Add after imports, before getCurrentUserRole
// class ErrorBoundary extends React.Component {
//     constructor(props) {
//         super(props);
//         this.state = { hasError: false, error: null };
//     }

//     static getDerivedStateFromError(error) {
//         return { hasError: true, error };
//     }

//     componentDidCatch(error, errorInfo) {
//         console.error('FlatInspectionPage Error:', error, errorInfo);
//     }

//     render() {
//         if (this.state.hasError) {
//             return (
//                 <div className="flex min-h-screen items-center justify-center" style={{ background: this.props.theme?.pageBg || '#fcfaf7' }}>
//                     <div className="text-center p-8 max-w-md">
//                         <div className="text-6xl mb-4">⚠️</div>
//                         <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
//                         <p className="text-gray-600 mb-4">
//                             An unexpected error occurred. Please refresh the page or contact support.
//                         </p>
//                         <button
//                             onClick={() => window.location.reload()}
//                             className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
//                         >
//                             Refresh Page
//                         </button>
//                     </div>
//                 </div>
//             );
//         }

//         return this.props.children;
//     }
// }

// // Helper function to get current user role
// const getCurrentUserRole = () => {
//     try {
//         const userString = localStorage.getItem("USER_DATA");
//         const accessString = localStorage.getItem("ACCESSES");

//         if (!userString || userString === "undefined") return null;

//         const userData = JSON.parse(userString);
//         let accesses = [];

//         if (accessString && accessString !== "undefined") {
//             try {
//                 accesses = JSON.parse(accessString);
//             } catch {
//                 accesses = [];
//             }
//         }

//         let allRoles = [];
//         if (Array.isArray(accesses)) {
//             accesses.forEach((access) => {
//                 if (access.roles && Array.isArray(access.roles)) {
//                     access.roles.forEach((role) => {
//                         const roleStr = typeof role === "string" ? role : role?.role;
//                         if (roleStr && !allRoles.includes(roleStr)) {
//                             allRoles.push(roleStr);
//                         }
//                     });
//                 }
//             });
//         }

//         // Check for workflow roles in priority order
//         if (allRoles.includes('CHECKER')) return 'CHECKER';
//         if (allRoles.includes('Checker')) return 'CHECKER';
//         if (allRoles.includes('SUPERVISOR')) return 'SUPERVISOR';
//         if (allRoles.includes('Supervisor')) return 'SUPERVISOR';
//         if (allRoles.includes('MAKER')) return 'MAKER';
//         if (allRoles.includes('Maker')) return 'MAKER';
//         if (allRoles.includes('Intializer')) return 'INITIALIZER';
//         if (allRoles.includes('INITIALIZER')) return 'INITIALIZER';

//         // Admin fallback
//         if (userData?.superadmin || userData?.is_staff) return 'CHECKER';
//         if (userData?.is_client) return 'SUPERVISOR';
//         if (userData?.is_manager) return 'SUPERVISOR';
//         if (allRoles.includes('ADMIN')) return 'SUPERVISOR';

//         return null;
//     } catch (error) {
//         console.error("Error getting user role:", error);
//         return null;
//     }
// };


// // Add after getCurrentUserRole function
// const useDebounce = (callback, delay) => {
//     const timeoutRef = React.useRef(null);

//     return React.useCallback((...args) => {
//         if (timeoutRef.current) {
//             clearTimeout(timeoutRef.current);
//         }

//         timeoutRef.current = setTimeout(() => {
//             callback(...args);
//         }, delay);
//     }, [callback, delay]);
// };

// const FlatInspectionPage = () => {
//     const { theme } = useTheme();
//     const location = useLocation();
//     const navigate = useNavigate();
//     const { flatId } = useParams();

//     // Get data from navigation state
//     const { projectId, flatNumber, flatType } = location.state || {};

//     // State management
//     const [checklistData, setChecklistData] = useState([]);
//     const [rooms, setRooms] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [roomsLoading, setRoomsLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const [showRoomsModal, setShowRoomsModal] = useState(false);
//     const [selectedRoom, setSelectedRoom] = useState(null);
//     const [expandedItems, setExpandedItems] = useState({});
//     const [userRole, setUserRole] = useState(null);
//     const [paginationInfo, setPaginationInfo] = useState({
//         count: 0,
//         next: null,
//         previous: null
//     });

//     // New states for initialization


//     // New states for initialization
//     const [initializingChecklists, setInitializingChecklists] = useState(new Set());
//     const [selectedForBulk, setSelectedForBulk] = useState(new Set());
//     const [bulkInitializing, setBulkInitializing] = useState(false);

//     // Add these new states for MAKER modal
//     const [showMakerModal, setShowMakerModal] = useState(false);
//     const [selectedItemForMaker, setSelectedItemForMaker] = useState(null);
//     const [makerRemark, setMakerRemark] = useState('');
//     const [makerPhotos, setMakerPhotos] = useState([]);
//     const [submittingMaker, setSubmittingMaker] = useState(false);
//     // History modal states
//     const [showHistoryModal, setShowHistoryModal] = useState(false);
//     const [selectedItemForHistory, setSelectedItemForHistory] = useState(null);

//     // Tab management for INITIALIZER dashboard
//     const [activeTab, setActiveTab] = useState('ready-to-start');
//     const [tabData, setTabData] = useState({
//         'ready-to-start': [],
//         'actively-working': [],
//         'finished-items': []
//     });

//     const [tabLoading, setTabLoading] = useState({
//         'ready-to-start': false,
//         'actively-working': false,
//         'finished-items': false
//     });

//     // Universal tab state for working roles (CHECKER, MAKER, SUPERVISOR)
//     const [activeWorkTab, setActiveWorkTab] = useState('available-work');

//     const [selectedItemsForBulk, setSelectedItemsForBulk] = useState(new Set());
//     const [bulkSubmitting, setBulkSubmitting] = useState(false);
//     const [bulkDecisionType, setBulkDecisionType] = useState(null); // 'pass' or 'fail'

//     const [performanceMetrics, setPerformanceMetrics] = useState({
//         apiCalls: 0,
//         renderTime: 0,
//         lastUpdate: null
//     });

//     const startTime = React.useRef(Date.now());

//     React.useEffect(() => {
//         const endTime = Date.now();
//         const renderTime = endTime - startTime.current;

//         setPerformanceMetrics(prev => ({
//             ...prev,
//             renderTime,
//             lastUpdate: new Date().toISOString()
//         }));
//     }, [checklistData, tabData]);


//     const [loadingStates, setLoadingStates] = useState(new Set()); // Track loading for individual items

//     // Add after bulkDecisionType state
//     const [showConfirmDialog, setShowConfirmDialog] = useState(false);
//     const [confirmDialogData, setConfirmDialogData] = useState(null);


//     // Enhanced Theme Configuration
//     const ORANGE = "#ffbe63";
//     const BG_OFFWHITE = "#fcfaf7";
//     const bgColor = theme === "dark" ? "#191922" : BG_OFFWHITE;
//     const cardColor = theme === "dark" ? "#23232c" : "#fff";
//     const borderColor = ORANGE;
//     const textColor = theme === "dark" ? "#fff" : "#222";
//     const iconColor = ORANGE;

//     const updateChecklistAfterInitialization = (checklistId, delay = 0) => {
//         // Add whoosh animation first
//         const checklistElement = document.querySelector(`[data-checklist-id="${checklistId}"]`);
//         if (checklistElement) {
//             setTimeout(() => {
//                 checklistElement.classList.add('whoosh-out');
//             }, delay);
//         }

//         // Update tab data after animation
//         setTimeout(() => {
//             if (userRole === 'INITIALIZER') {
//                 // Remove from 'ready-to-start' tab
//                 setTabData(prev => ({
//                     ...prev,
//                     'ready-to-start': prev['ready-to-start'].map(roomData => ({
//                         ...roomData,
//                         checklists: roomData.checklists?.filter(checklist => checklist.id !== checklistId) || []
//                     }))
//                 }));

//                 // Force refresh the actively-working tab to show the moved item
//                 // Force refresh both tabs to ensure consistency
//                 setTimeout(async () => {
//                     // Refresh current tab
//                     await fetchTabData(activeTab);
//                     // Refresh the target tab (actively-working)
//                     await fetchTabData('actively-working');
//                     // Auto-switch to actively-working tab
//                     setActiveTab('actively-working');
//                 }, 500);
//             } else {
//                 // For other roles, use existing logic
//                 setChecklistData(prevData =>
//                     prevData.map(roomData => ({
//                         ...roomData,
//                         assigned_to_me: roomData.assigned_to_me?.map(checklist =>
//                             checklist.id === checklistId
//                                 ? { ...checklist, status: "in_progress" }
//                                 : checklist
//                         ) || [],
//                         available_for_me: roomData.available_for_me?.map(checklist =>
//                             checklist.id === checklistId
//                                 ? { ...checklist, status: "in_progress" }
//                                 : checklist
//                         ) || []
//                     }))
//                 );
//             }
//         }, delay + 500);
//     };


//     const updateMultipleChecklists = (checklistIds) => {
//         checklistIds.forEach((checklistId, index) => {
//             updateChecklistAfterInitialization(checklistId, index * 100); // Stagger animations
//         });
//     };


//     const themeConfig = {
//         pageBg: bgColor,
//         cardBg: cardColor,
//         textPrimary: textColor,
//         textSecondary: theme === "dark" ? "#a0a0a0" : "#666",
//         accent: ORANGE,
//         border: borderColor,
//         icon: iconColor,
//         headerBg: theme === "dark" ? "#2a2a35" : "#f8f6f3",
//         success: "#10b981",
//         warning: "#f59e0b",
//         error: "#ef4444",
//         passColor: "#10b981",    // Green for PASS options
//         failColor: "#ef4444",    // Red for FAIL options
//     };
//     // Tab configuration for INITIALIZER
//     // Tab configuration for INITIALIZER
//     const initializerTabs = [
//         {
//             key: 'ready-to-start',
//             label: 'Assignment Queue',
//             icon: '🚀',
//             color: themeConfig.accent,
//             description: 'Checklists ready to initialize',
//             apiStatus: 'not_started'
//         },
//         {
//             key: 'actively-working',
//             label: 'Active Workflows',
//             icon: '⚡',
//             color: themeConfig.warning,
//             description: 'Checklists in workflow process',
//             apiStatus: 'in_progress'
//         },
//     ];
//     // Tab configuration for MAKER
//     // Remove this entire section - no longer needed



//     // Fetch data for specific tab
//     const fetchTabData = async (tabKey) => {
//         const tabConfig = initializerTabs.find(tab => tab.key === tabKey);
//         if (!tabConfig) return;

//         setTabLoading(prev => ({ ...prev, [tabKey]: true }));

//         try {
//             const token = localStorage.getItem("ACCESS_TOKEN");
//             const apiUrl = '/Transafer-Rule-getchchklist/';
//             const params = {
//                 project_id: projectId,
//                 flat_id: flatId,
//                 status: tabConfig.apiStatus
//             };

//             console.log(`🔍 FETCHING TAB DATA - Tab: ${tabKey}, Status: ${tabConfig.apiStatus}`);

//             setPerformanceMetrics(prev => ({ ...prev, apiCalls: prev.apiCalls + 1 }));
//             const response = await checklistInstance.get(apiUrl, {
//                 params: params,
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                     "Content-Type": "application/json",
//                 },
//                 timeout: 10000,
//             });

//             if (response.status === 200) {
//                 const responseData = response.data || {};
//                 let data = responseData.results || responseData || [];

//                 if (!Array.isArray(data)) {
//                     data = [data];
//                 }

//                 setTabData(prev => ({
//                     ...prev,
//                     [tabKey]: data
//                 }));

//                 console.log(`✅ TAB DATA LOADED - Tab: ${tabKey}, Count: ${data.length}`);

//                 // Extract and fetch room details for INITIALIZER
//                 const roomIds = [...new Set(data.map(room => room.room_id).filter(Boolean))];
//                 console.log(`🔍 INITIALIZER Tab ${tabKey} Room IDs:`, roomIds);

//                 if (roomIds.length > 0) {
//                     const token = localStorage.getItem("ACCESS_TOKEN");
//                     fetchRoomDetails(roomIds);
//                 }
//             }
//         } catch (err) {
//             console.error(`❌ Failed to fetch tab data for ${tabKey}:`, err);
//             toast.error(`Failed to load ${tabConfig.label}`, {
//                 style: { background: themeConfig.error, color: 'white', borderRadius: '12px' }
//             });
//         } finally {
//             setTabLoading(prev => ({ ...prev, [tabKey]: false }));
//         }
//     };

//     // Handle tab switching with on-demand loading
//     const handleTabSwitch = async (tabKey) => {
//         setActiveTab(tabKey);

//         // Always refresh data for active tab to ensure consistency
//         await fetchTabData(tabKey);

//         // Clear any existing selections when switching tabs
//         setSelectedForBulk(new Set());
//     };

//     // ADD THIS RIGHT AFTER updateMultipleChecklists function
//     const additionalStyles = `
// .whoosh-out {
//     animation: whooshOut 0.5s ease-in-out forwards;
//     transform-origin: center;
// }

// @keyframes whooshOut {
//     0% {
//         opacity: 1;
//         transform: scale(1) translateX(0);
//     }
//     50% {
//         opacity: 0.7;
//         transform: scale(1.05) translateX(10px);
//     }
//     100% {
//         opacity: 0;
//         transform: scale(0.8) translateX(100px);
//         height: 0;
//         margin: 0;
//         padding: 0;
//     }
// }

// .checklist-card {
//     transition: all 0.3s ease;
// }
// `;

//     useEffect(() => {
//         const styleElement = document.createElement('style');
//         styleElement.innerHTML = additionalStyles;
//         document.head.appendChild(styleElement);

//         return () => {
//             document.head.removeChild(styleElement);
//         };
//     }, []);


//     // Initialize single checklist
//     const handleInitializeChecklist = async (checklistId) => {
//         setInitializingChecklists(prev => new Set([...prev, checklistId]));

//         try {
//             const token = localStorage.getItem("ACCESS_TOKEN");

//             console.log("📡 API CALL: handleInitializeChecklist - Request URL:", `/start-checklist/${checklistId}/`);
//             console.log("📡 API CALL: handleInitializeChecklist - Checklist ID:", checklistId);

//             const response = await checklistInstance.post(
//                 `/start-checklist/${checklistId}/`,
//                 {},
//                 {
//                     headers: { Authorization: `Bearer ${token}` },
//                 }
//             );
//             console.log("📡 API RESPONSE: handleInitializeChecklist - Response:", response.data);
//             console.log("📡 API RESPONSE: handleInitializeChecklist - Status:", response.status);

//             if (response.status === 200) {
//                 // Immediate UI update with whoosh effect
//                 updateChecklistAfterInitialization(checklistId);
//                 setTimeout(() => {
//                     fetchTabData(activeTab);
//                 }, 1000);
//             }
//         } catch (err) {
//             console.error("❌ Failed to initialize checklist:", err);
//             const errorMessage = err.response?.data?.error || "Failed to initialize checklist";

//             toast.error(`❌ ${errorMessage}`, {
//                 duration: 4000,
//                 style: {
//                     background: themeConfig.error,
//                     color: 'white',
//                     borderRadius: '12px',
//                     padding: '16px',
//                 },
//             });
//         } finally {
//             setInitializingChecklists(prev => {
//                 const newSet = new Set(prev);
//                 newSet.delete(checklistId);
//                 return newSet;
//             });
//         }
//     };

//     // Initialize multiple checklists
//     const handleBulkInitialize = async (confirmed = false) => {
//         if (selectedForBulk.size === 0) {
//             toast.error("Please select at least one checklist to initialize", {
//                 style: { background: themeConfig.warning, color: 'white', borderRadius: '12px' }
//             });
//             return;
//         }

//         // Show confirmation dialog first
//         if (!confirmed) {
//             setConfirmDialogData({
//                 title: 'Initialize Checklists',
//                 message: `Are you sure you want to initialize ${selectedForBulk.size} checklist${selectedForBulk.size !== 1 ? 's' : ''}? This will start the workflow process.`,
//                 confirmText: 'Initialize',
//                 confirmColor: themeConfig.accent,
//                 onConfirm: () => handleBulkInitialize(true)
//             });
//             setShowConfirmDialog(true);
//             return;
//         }

//         setBulkInitializing(true);
//         const selectedIds = Array.from(selectedForBulk);
//         let successCount = 0;
//         let failCount = 0;

//         try {
//             // Process each checklist sequentially for better UX
//             for (const checklistId of selectedIds) {
//                 try {
//                     const token = localStorage.getItem("ACCESS_TOKEN");

//                     const response = await checklistInstance.post(
//                         `/start-checklist/${checklistId}/`,
//                         {},
//                         {
//                             headers: { Authorization: `Bearer ${token}` },
//                         }
//                     );

//                     if (response.status === 200) {
//                         successCount++;
//                         // Update the checklist data in real-time
//                         setChecklistData(prevData =>
//                             prevData.map(roomData => ({
//                                 ...roomData,
//                                 checklists: roomData.checklists.map(checklist =>
//                                     checklist.id === checklistId
//                                         ? { ...checklist, status: "in_progress" }
//                                         : checklist
//                                 )
//                             }))
//                         );
//                     }
//                 } catch (err) {
//                     failCount++;
//                     console.error(`Failed to initialize checklist ${checklistId}:`, err);
//                 }
//             }

//             // Show summary toast
//             if (successCount > 0) {
//                 // Get successfully initialized checklist IDs
//                 const successfulIds = Array.from(selectedForBulk).slice(0, successCount);

//                 // Apply whoosh effect to all successful items
//                 updateMultipleChecklists(successfulIds);

//                 // Show summary toast
//                 if (failCount === 0) {
//                     toast.success(`🎉 All ${successCount} checklists initialized successfully!`, {
//                         duration: 5000,
//                         style: { background: themeConfig.success, color: 'white', borderRadius: '12px', padding: '16px' }
//                     });
//                 } else {
//                     toast.success(`⚠️ ${successCount} checklists initialized, ${failCount} failed.`, {
//                         duration: 5000,
//                         style: { background: themeConfig.warning, color: 'white', borderRadius: '12px', padding: '16px' }
//                     });
//                 }

//                 // Clear selection after animation
//                 setTimeout(() => {
//                     setSelectedForBulk(new Set());
//                 }, 1000);
//             } else {
//                 toast.error("❌ Failed to initialize all selected checklists.", {
//                     duration: 4000,
//                     style: { background: themeConfig.error, color: 'white', borderRadius: '12px', padding: '16px' }
//                 });
//             }

//         } finally {
//             setBulkInitializing(false);
//         }
//     };

//     // Bulk decision handler for CHECKER and SUPERVISOR
//     const handleBulkDecision = async (decisionType, confirmed = false) => {
//         if (selectedItemsForBulk.size === 0) {
//             toast.error("Please select at least one item to process", {
//                 style: { background: themeConfig.warning, color: 'white', borderRadius: '12px' }
//             });
//             return;
//         }

//         // Show confirmation dialog first
//         if (!confirmed) {
//             const actionText = decisionType === 'pass'
//                 ? (userRole === 'CHECKER' ? 'APPROVE' : userRole === 'SUPERVISOR' ? 'ACCEPT' : 'PASS')
//                 : (userRole === 'CHECKER' ? 'REJECT' : userRole === 'SUPERVISOR' ? 'SEND TO REWORK' : 'FAIL');

//             setConfirmDialogData({
//                 title: `${actionText} Items`,
//                 message: `Are you sure you want to ${actionText.toLowerCase()} ${selectedItemsForBulk.size} item${selectedItemsForBulk.size !== 1 ? 's' : ''}? This action cannot be undone.`,
//                 confirmText: actionText,
//                 confirmColor: decisionType === 'pass' ? themeConfig.passColor : themeConfig.failColor,
//                 onConfirm: () => handleBulkDecision(decisionType, true)
//             });
//             setShowConfirmDialog(true);
//             return;
//         }

//         setBulkSubmitting(true);
//         setBulkDecisionType(decisionType);
//         const selectedIds = Array.from(selectedItemsForBulk);
//         let successCount = 0;
//         let failCount = 0;

//         try {
//             // Get all available items to find options
//             const currentDataSource = activeWorkTab === 'available-work' ? 'available_for_me' : 'assigned_to_me';
//             const allItems = checklistData.flatMap(room => {
//                 const checklists = room[currentDataSource] || [];
//                 return checklists.flatMap(checklist => checklist.items || []);
//             });

//             // Process each selected item
//             for (const itemId of selectedIds) {
//                 try {
//                     const item = allItems.find(item => item.id === itemId);
//                     if (!item) {
//                         failCount++;
//                         continue;
//                     }

//                     // Find appropriate option based on decision type
//                     const targetOption = item.options?.find(opt =>
//                         decisionType === 'pass' ? opt.choice === "P" : opt.choice === "N"
//                     );

//                     if (!targetOption) {
//                         console.error(`No ${decisionType.toUpperCase()} option found for item ${itemId}`);
//                         failCount++;
//                         continue;
//                     }

//                     const token = localStorage.getItem("ACCESS_TOKEN");
//                     const payload = {
//                         checklist_item_id: itemId,
//                         role: userRole.toLowerCase(),
//                         option_id: targetOption.id,
//                         check_remark: `Bulk ${decisionType.toUpperCase()} decision by ${userRole}`
//                     };

//                     console.log(`📡 API CALL: Bulk ${decisionType.toUpperCase()} - Item ${itemId}:`, payload);

//                     const response = await checklistInstance.patch(
//                         '/Decsion-makeing-forSuer-Inspector/',
//                         payload,
//                         {
//                             headers: { Authorization: `Bearer ${token}` },
//                         }
//                     );

//                     if (response.status === 200) {
//                         successCount++;
//                     } else {
//                         failCount++;
//                     }

//                 } catch (err) {
//                     failCount++;
//                     console.error(`Failed to process item ${itemId}:`, err);
//                 }
//             }

//             // Show summary toast
//             if (successCount > 0) {
//                 if (failCount === 0) {
//                     toast.success(`🎉 All ${successCount} items processed with ${decisionType.toUpperCase()} decision!`, {
//                         duration: 5000,
//                         style: {
//                             background: decisionType === 'pass' ? themeConfig.passColor : themeConfig.failColor,
//                             color: 'white',
//                             borderRadius: '12px',
//                             padding: '16px'
//                         }
//                     });
//                 } else {
//                     toast.success(`⚠️ ${successCount} items processed, ${failCount} failed.`, {
//                         duration: 5000,
//                         style: { background: themeConfig.warning, color: 'white', borderRadius: '12px', padding: '16px' }
//                     });
//                 }

//                 // Clear selection and refresh data
//                 // Clear selection and refresh data smoothly
//                 setTimeout(async () => {
//                     setSelectedItemsForBulk(new Set());

//                     // Smooth refresh without page reload
//                     try {
//                         const token = localStorage.getItem("ACCESS_TOKEN");
//                         const apiUrl = '/Transafer-Rule-getchchklist/';
//                         const params = { project_id: projectId, flat_id: flatId };

//                         const response = await checklistInstance.get(apiUrl, {
//                             params: params,
//                             headers: {
//                                 Authorization: `Bearer ${token}`,
//                                 "Content-Type": "application/json",
//                             },
//                             timeout: 10000,
//                         });

//                         if (response.status === 200) {
//                             const responseData = response.data || {};
//                             let data = responseData.results || responseData || [];
//                             if (!Array.isArray(data)) data = [data];

//                             setChecklistData(data);

//                             // Re-fetch room details if needed
//                             const roomIds = [...new Set(data.map((item) => item.room_id).filter(Boolean))];
//                             if (roomIds.length > 0) {
//                                 await fetchRoomDetails(roomIds);
//                             }
//                         }
//                     } catch (err) {
//                         console.error("❌ Failed to refresh data:", err);
//                         // Fallback to page reload only if API fails
//                         window.location.reload();
//                     }
//                 }, 1000);
//             } else {
//                 toast.error("❌ Failed to process all selected items.", {
//                     duration: 4000,
//                     style: { background: themeConfig.error, color: 'white', borderRadius: '12px', padding: '16px' }
//                 });
//             }

//         } finally {
//             setBulkSubmitting(false);
//             setBulkDecisionType(null);
//         }
//     };

//     // Toggle checklist selection for bulk operations
//     const toggleChecklistSelection = (checklistId) => {
//         setSelectedForBulk(prev => {
//             const newSet = new Set(prev);
//             if (newSet.has(checklistId)) {
//                 newSet.delete(checklistId);
//             } else {
//                 newSet.add(checklistId);
//             }
//             return newSet;
//         });
//     };


//     // Toggle item selection for bulk operations (CHECKER/SUPERVISOR)
//     const toggleItemSelection = (itemId) => {
//         setSelectedItemsForBulk(prev => {
//             const newSet = new Set(prev);
//             if (newSet.has(itemId)) {
//                 newSet.delete(itemId);
//             } else {
//                 newSet.add(itemId);
//             }
//             return newSet;
//         });
//     };
//     // Select all not_started checklists
//     const selectAllNotStarted = () => {
//         const notStartedIds = userRole === 'INITIALIZER'
//             ? (tabData[activeTab] || [])  // Use current active tab instead of hardcoded
//                 .flatMap(roomData => roomData.checklists || [])
//                 .filter(checklist => checklist && checklist.status === "not_started")
//                 .map(checklist => checklist.id)
//             : checklistData
//                 .flatMap(roomData => [
//                     ...(roomData.assigned_to_me || []),
//                     ...(roomData.available_for_me || [])
//                 ])
//                 .filter(checklist => checklist && checklist.status === "not_started")
//                 .map(checklist => checklist.id);

//         // Toggle behavior: if all are selected, unselect all
//         if (selectedForBulk.size === notStartedIds.length && notStartedIds.length > 0) {
//             setSelectedForBulk(new Set());
//         } else {
//             setSelectedForBulk(new Set(notStartedIds));
//         }
//     };

//     // Get role-based action buttons
//     const getRoleBasedActions = (checklist, item = null) => {
//         if (!userRole) return null;

//         switch (userRole) {
//             case 'INITIALIZER':
//                 return getInitializeButton(checklist);

//             case 'CHECKER':
//                 if (!item) return null;
//                 const isPreScreening = !item.submissions || item.submissions.length === 0;
//                 return (
//                     <div className="flex gap-2">
//                         <button
//                             className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
//                             style={{
//                                 background: themeConfig.success,
//                                 color: 'white'
//                             }}
//                         >
//                             {isPreScreening ? 'Accept for Workflow' : 'Approve Final'}
//                         </button>
//                         <button
//                             className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
//                             style={{
//                                 background: themeConfig.error,
//                                 color: 'white'
//                             }}
//                         >
//                             {isPreScreening ? 'Mark Complete' : 'Send for Rework'}
//                         </button>
//                     </div>
//                 );

//             case 'SUPERVISOR':
//                 if (!item) {
//                     return (
//                         <button
//                             onClick={() => {
//                                 // SUPERVISOR has different data structure - items are in available_for_me
//                                 // For SUPERVISOR, the checklist IS the item - it comes from available_for_me array
//                                 console.log("🔍 DEBUG: Full checklist object for SUPERVISOR:", checklist);
//                                 console.log("🔍 DEBUG: Checklist structure:", checklist);

//                                 // SUPERVISOR works with the checklist object directly, not checklist.items
//                                 const itemsForReview = checklist.pending_for_me || [];// The checklist itself is the reviewable item
//                                 console.log("🔍 DEBUG: All items for SUPERVISOR:", itemsForReview);
//                                 console.log("🔍 DEBUG: Item statuses for SUPERVISOR:", itemsForReview.map(item => item.status));

//                                 // For now, let SUPERVISOR review any item that's not completed
//                                 const filteredItems = itemsForReview.filter(item =>
//                                     item.status !== 'completed' && item.status !== 'not_started'
//                                 );

//                                 setSelectedItemForMaker(checklist);
//                                 setShowMakerModal(true);
//                                 if (itemsForReview.length > 0) {
//                                     setSelectedItemForMaker(itemsForReview[0]); // Reuse same modal state
//                                     setShowMakerModal(true); // Reuse same modal
//                                 } else {
//                                     toast.success("No items requiring your review in this checklist");
//                                 }
//                             }}
//                             className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
//                             style={{
//                                 background: themeConfig.warning,
//                                 color: 'white'
//                             }}
//                         >
//                             Review MAKER Work
//                         </button>
//                     );
//                 }
//                 return (
//                     <button
//                         onClick={() => {
//                             setSelectedItemForMaker(item);
//                             setShowMakerModal(true);
//                         }}
//                         className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
//                         style={{
//                             background: themeConfig.warning,
//                             color: 'white'
//                         }}
//                     >
//                         Review Work
//                     </button>
//                 );

//             case 'MAKER':
//                 if (!item) {
//                     // Show button at checklist level for MAKER
//                     return (
//                         <button
//                             onClick={() => {
//                                 // Find items that need MAKER attention
//                                 // const itemsNeedingWork = checklist.items?.filter(item => 
//                                 //   item.status === 'pending_for_maker' || item.status === 'in_progress'
//                                 // ) || [];

//                                 // Since items array is empty, let's check if there are any items at all
//                                 const itemsNeedingWork = checklist.items || [];
//                                 console.log("🔍 DEBUG: All items for MAKER:", itemsNeedingWork);
//                                 console.log("🔍 DEBUG: Checklist object:", checklist);

//                                 // If no items in checklist.items, just open modal anyway for testing
//                                 if (itemsNeedingWork.length === 0) {
//                                     // Create a mock item for testing
//                                     const mockItem = {
//                                         id: checklist.id,
//                                         title: `Work on ${checklist.name}`,
//                                         status: 'pending_for_maker',
//                                         description: 'Complete work for this checklist'
//                                     };
//                                     setSelectedItemForMaker(mockItem);
//                                     setShowMakerModal(true);
//                                     return;
//                                 }


//                                 console.log("🔍 DEBUG: All items for MAKER:", itemsNeedingWork);
//                                 console.log("🔍 DEBUG: Item statuses:", itemsNeedingWork.map(item => item.status));

//                                 // For now, let MAKER work on any item that's not completed
//                                 const filteredItems = itemsNeedingWork.filter(item =>
//                                     item.status !== 'completed'
//                                 );

//                                 if (itemsNeedingWork.length > 0) {
//                                     setSelectedItemForMaker(itemsNeedingWork[0]);
//                                     setShowMakerModal(true);
//                                 } else {
//                                     toast.success("No items requiring your attention in this checklist");
//                                 }
//                             }}
//                             className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
//                             style={{
//                                 background: themeConfig.accent,
//                                 color: 'white'
//                             }}
//                         >
//                             View Items to Complete
//                         </button>
//                     );
//                 }
//                 return (
//                     <button
//                         onClick={() => {
//                             setSelectedItemForMaker(item);
//                             setMakerRemark('');
//                             setMakerPhotos([]);
//                             setShowMakerModal(true);
//                         }}
//                         className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
//                         style={{
//                             background: themeConfig.accent,
//                             color: 'white'
//                         }}
//                     >
//                         Complete Work
//                     </button>
//                 );
//             default:
//                 return null;
//         }
//     };

//     // Get initialization button component
//     const getInitializeButton = (checklist) => {
//         const isInitializing = initializingChecklists.has(checklist.id);
//         const canInitialize = checklist.status === "not_started";
//         const isSelected = selectedForBulk.has(checklist.id);

//         if (!canInitialize) {
//             return null;
//         }

//         return (
//             <div className="flex items-center gap-2">
//                 {/* Bulk selection checkbox */}
//                 <div className="flex items-center">
//                     <input
//                         type="checkbox"
//                         checked={isSelected}
//                         onChange={(e) => {
//                             e.stopPropagation(); // Prevent event bubbling
//                             toggleChecklistSelection(checklist.id);
//                         }}
//                         className="w-4 h-4 rounded border-2 focus:ring-2 cursor-pointer"
//                         style={{
//                             accentColor: themeConfig.accent,
//                             borderColor: themeConfig.border
//                         }}
//                     />
//                 </div>

//                 {/* Initialize button */}
//                 <button
//                     onClick={() => handleInitializeChecklist(checklist.id)}
//                     disabled={isInitializing}
//                     className={`
//             relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform
//             ${isInitializing
//                             ? 'opacity-75 cursor-not-allowed scale-95'
//                             : 'hover:scale-105 hover:shadow-lg active:scale-95'
//                         }
//           `}
//                     style={{
//                         background: isInitializing
//                             ? `linear-gradient(135deg, ${themeConfig.accent}80, ${themeConfig.accent}60)`
//                             : `linear-gradient(135deg, ${themeConfig.accent}, ${themeConfig.accent}dd)`,
//                         color: 'white',
//                         border: `2px solid ${themeConfig.accent}`,
//                         boxShadow: isInitializing ? 'none' : `0 4px 12px ${themeConfig.accent}30`,
//                     }}
//                 >
//                     {isInitializing ? (
//                         <div className="flex items-center gap-2">
//                             <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                             <span>Initializing...</span>
//                         </div>
//                     ) : (
//                         <div className="flex items-center gap-2">
//                             <span>🚀</span>
//                             <span>Initialize</span>
//                         </div>
//                     )}
//                 </button>
//             </div>
//         );
//     };

//     // Get bulk action bar
//     // Get bulk action bar
//     const getBulkActionBar = () => {
//         // Show bulk actions for INITIALIZER, CHECKER, and SUPERVISOR
//         if (userRole === 'INITIALIZER') {
//             const notStartedChecklists = (tabData[activeTab] || [])  // Use current active tab
//                 .flatMap(roomData => roomData.checklists || [])
//                 .filter(checklist => checklist && checklist.status === "not_started");

//             if (notStartedChecklists.length === 0) {
//                 return null;
//             }

//             return getInitializerBulkBar(notStartedChecklists);
//         }

//         if (['CHECKER', 'SUPERVISOR'].includes(userRole)) {
//             // Get all available items for current tab
//             const currentDataSource = activeWorkTab === 'available-work' ? 'available_for_me' : 'assigned_to_me';
//             const availableItems = checklistData.flatMap(room => {
//                 const checklists = room[currentDataSource] || [];
//                 return checklists.flatMap(checklist => checklist.items || []);
//             });

//             if (availableItems.length === 0) {
//                 return null;
//             }

//             return getCheckerSupervisorBulkBar(availableItems);
//         }

//         return null;
//     };

//     // INITIALIZER bulk bar (existing logic)
//     const getInitializerBulkBar = (notStartedChecklists) => {
//         return (
//             <div
//                 className="sticky top-0 z-10 p-4 rounded-xl mb-6 shadow-lg backdrop-blur-sm"
//                 style={{
//                     background: `${themeConfig.cardBg}f0`,
//                     border: `1px solid ${themeConfig.border}40`,
//                 }}
//             >
//                 <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-4">
//                         <div className="flex items-center gap-2">
//                             <input
//                                 type="checkbox"
//                                 checked={selectedForBulk.size === notStartedChecklists.length && notStartedChecklists.length > 0}
//                                 indeterminate={selectedForBulk.size > 0 && selectedForBulk.size < notStartedChecklists.length}
//                                 onChange={selectAllNotStarted}
//                                 className="w-5 h-5 rounded border-2 focus:ring-2"
//                                 style={{
//                                     accentColor: themeConfig.accent,
//                                     borderColor: themeConfig.border
//                                 }}
//                                 ref={(el) => {
//                                     if (el) {
//                                         el.indeterminate = selectedForBulk.size > 0 && selectedForBulk.size < notStartedChecklists.length;
//                                     }
//                                 }}
//                             />
//                             <span className="font-medium" style={{ color: themeConfig.textPrimary }}>
//                                 Select All ({notStartedChecklists.length} available)
//                             </span>
//                         </div>

//                         {selectedForBulk.size > 0 && (
//                             <span
//                                 className="px-3 py-1 rounded-full text-sm font-medium"
//                                 style={{
//                                     background: `${themeConfig.accent}20`,
//                                     color: themeConfig.accent
//                                 }}
//                             >
//                                 {selectedForBulk.size} selected
//                             </span>
//                         )}
//                     </div>

//                     {selectedForBulk.size > 0 && (
//                         <button
//                             onClick={handleBulkInitialize}
//                             disabled={bulkInitializing}
//                             className={`
//                             px-6 py-2 rounded-lg font-medium transition-all duration-300 transform
//                             ${bulkInitializing
//                                     ? 'opacity-75 cursor-not-allowed scale-95'
//                                     : 'hover:scale-105 hover:shadow-lg active:scale-95'
//                                 }
//                         `}
//                             style={{
//                                 background: bulkInitializing
//                                     ? `linear-gradient(135deg, ${themeConfig.accent}80, ${themeConfig.accent}60)`
//                                     : `linear-gradient(135deg, ${themeConfig.accent}, ${themeConfig.accent}dd)`,
//                                 color: 'white',
//                                 border: `2px solid ${themeConfig.accent}`,
//                                 boxShadow: bulkInitializing ? 'none' : `0 4px 16px ${themeConfig.accent}40`,
//                             }}
//                         >
//                             {bulkInitializing ? (
//                                 <div className="flex items-center gap-2">
//                                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                                     <span>Initializing {selectedForBulk.size} items...</span>
//                                 </div>
//                             ) : (
//                                 <div className="flex items-center gap-2">
//                                     <span>🚀</span>
//                                     <span>Initialize Selected ({selectedForBulk.size})</span>
//                                 </div>
//                             )}
//                         </button>
//                     )}
//                 </div>
//             </div>
//         );
//     };

//     // CHECKER/SUPERVISOR bulk bar (new)
//     const getCheckerSupervisorBulkBar = (availableItems) => {
//         return (
//             <div
//                 className="sticky top-0 z-10 p-4 rounded-xl mb-6 shadow-lg backdrop-blur-sm"
//                 style={{
//                     background: `${themeConfig.cardBg}f0`,
//                     border: `1px solid ${themeConfig.border}40`,
//                 }}
//             >
//                 <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-4">
//                         <div className="flex items-center gap-2">
//                             <input
//                                 type="checkbox"
//                                 checked={selectedItemsForBulk.size === availableItems.length && availableItems.length > 0}
//                                 onChange={() => {
//                                     if (selectedItemsForBulk.size === availableItems.length) {
//                                         setSelectedItemsForBulk(new Set());
//                                     } else {
//                                         setSelectedItemsForBulk(new Set(availableItems.map(item => item.id)));
//                                     }
//                                 }}
//                                 className="w-5 h-5 rounded border-2 focus:ring-2"
//                                 style={{
//                                     accentColor: themeConfig.accent,
//                                     borderColor: themeConfig.border
//                                 }}
//                             />
//                             <span className="font-medium" style={{ color: themeConfig.textPrimary }}>
//                                 Select All ({availableItems.length} item{availableItems.length !== 1 ? 's' : ''})
//                             </span>
//                         </div>

//                         {selectedItemsForBulk.size > 0 && (
//                             <span
//                                 className="px-3 py-1 rounded-full text-sm font-medium"
//                                 style={{
//                                     background: `${themeConfig.accent}20`,
//                                     color: themeConfig.accent
//                                 }}
//                             >
//                                 {selectedItemsForBulk.size} selected
//                             </span>
//                         )}
//                     </div>

//                     {selectedItemsForBulk.size > 0 && (
//                         <div className="flex items-center gap-3">
//                             {/* Bulk PASS Button */}
//                             <button
//                                 onClick={() => handleBulkDecision('pass')}
//                                 disabled={bulkSubmitting}
//                                 className={`
//                                 px-6 py-2 rounded-lg font-medium transition-all duration-300 transform
//                                 ${bulkSubmitting
//                                         ? 'opacity-75 cursor-not-allowed scale-95'
//                                         : 'hover:scale-105 hover:shadow-lg active:scale-95'
//                                     }
//                             `}
//                                 style={{
//                                     background: bulkSubmitting
//                                         ? `${themeConfig.passColor}80`
//                                         : `linear-gradient(135deg, ${themeConfig.passColor}, ${themeConfig.passColor}dd)`,
//                                     color: 'white',
//                                     border: `2px solid ${themeConfig.passColor}`,
//                                     boxShadow: bulkSubmitting ? 'none' : `0 4px 16px ${themeConfig.passColor}40`,
//                                 }}
//                             >
//                                 {bulkSubmitting && bulkDecisionType === 'pass' ? (
//                                     <div className="flex items-center gap-2">
//                                         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                                         <span>Processing...</span>
//                                     </div>
//                                 ) : (
//                                     <div className="flex items-center gap-2">
//                                         <span>✅</span>
//                                         <span>{userRole === 'CHECKER' ? 'PASS All' : userRole === 'SUPERVISOR' ? 'APPROVE All' : 'PASS All'} ({selectedItemsForBulk.size})</span>
//                                     </div>
//                                 )}
//                             </button>

//                             {/* Bulk FAIL Button */}
//                             <button
//                                 onClick={() => handleBulkDecision('fail')}
//                                 disabled={bulkSubmitting}
//                                 className={`
//                                 px-6 py-2 rounded-lg font-medium transition-all duration-300 transform
//                                 ${bulkSubmitting
//                                         ? 'opacity-75 cursor-not-allowed scale-95'
//                                         : 'hover:scale-105 hover:shadow-lg active:scale-95'
//                                     }
//                             `}
//                                 style={{
//                                     background: bulkSubmitting
//                                         ? `${themeConfig.failColor}80`
//                                         : `linear-gradient(135deg, ${themeConfig.failColor}, ${themeConfig.failColor}dd)`,
//                                     color: 'white',
//                                     border: `2px solid ${themeConfig.failColor}`,
//                                     boxShadow: bulkSubmitting ? 'none' : `0 4px 16px ${themeConfig.failColor}40`,
//                                 }}
//                             >
//                                 {bulkSubmitting && bulkDecisionType === 'fail' ? (
//                                     <div className="flex items-center gap-2">
//                                         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                                         <span>Processing...</span>
//                                     </div>
//                                 ) : (
//                                     <div className="flex items-center gap-2">
//                                         <span>❌</span>
//                                         <span>{userRole === 'CHECKER' ? 'FAIL All' : userRole === 'SUPERVISOR' ? 'REJECT All' : 'FAIL All'} ({selectedItemsForBulk.size})</span>
//                                     </div>
//                                 )}
//                             </button>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         );

//         const notStartedChecklists = userRole === 'INITIALIZER'
//             ? (tabData['ready-to-start'] || [])
//                 .flatMap(roomData => roomData.checklists || [])
//                 .filter(checklist => checklist && checklist.status === "not_started")
//             : checklistData
//                 .flatMap(roomData => [
//                     ...(roomData.assigned_to_me || []),
//                     ...(roomData.available_for_me || [])
//                 ])
//                 .filter(checklist => checklist && checklist.status === "not_started");

//         if (notStartedChecklists.length === 0) {
//             return null;
//         }

//         // Handle photo upload for MAKER

//         return (
//             <div
//                 className="sticky top-0 z-10 p-4 rounded-xl mb-6 shadow-lg backdrop-blur-sm"
//                 style={{
//                     background: `${themeConfig.cardBg}f0`,
//                     border: `1px solid ${themeConfig.border}40`,
//                 }}
//             >
//                 <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-4">
//                         <div className="flex items-center gap-2">
//                             <input
//                                 type="checkbox"
//                                 checked={selectedForBulk.size === notStartedChecklists.length && notStartedChecklists.length > 0}
//                                 onChange={selectAllNotStarted}
//                                 className="w-5 h-5 rounded border-2 focus:ring-2"
//                                 style={{
//                                     accentColor: themeConfig.accent,
//                                     borderColor: themeConfig.border
//                                 }}
//                             />
//                             <span className="font-medium" style={{ color: themeConfig.textPrimary }}>
//                                 Select All ({notStartedChecklists.length} available)
//                             </span>
//                         </div>

//                         {selectedForBulk.size > 0 && (
//                             <span
//                                 className="px-3 py-1 rounded-full text-sm font-medium"
//                                 style={{
//                                     background: `${themeConfig.accent}20`,
//                                     color: themeConfig.accent
//                                 }}
//                             >
//                                 {selectedForBulk.size} selected
//                             </span>
//                         )}
//                     </div>

//                     {selectedForBulk.size > 0 && (
//                         <button
//                             onClick={handleBulkInitialize}
//                             disabled={bulkInitializing}
//                             className={`
//                 px-6 py-2 rounded-lg font-medium transition-all duration-300 transform
//                 ${bulkInitializing
//                                     ? 'opacity-75 cursor-not-allowed scale-95'
//                                     : 'hover:scale-105 hover:shadow-lg active:scale-95'
//                                 }
//               `}
//                             style={{
//                                 background: bulkInitializing
//                                     ? `linear-gradient(135deg, ${themeConfig.accent}80, ${themeConfig.accent}60)`
//                                     : `linear-gradient(135deg, ${themeConfig.accent}, ${themeConfig.accent}dd)`,
//                                 color: 'white',
//                                 border: `2px solid ${themeConfig.accent}`,
//                                 boxShadow: bulkInitializing ? 'none' : `0 4px 16px ${themeConfig.accent}40`,
//                             }}
//                         >
//                             {bulkInitializing ? (
//                                 <div className="flex items-center gap-2">
//                                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                                     <span>Initializing {selectedForBulk.size} items...</span>
//                                 </div>
//                             ) : (
//                                 <div className="flex items-center gap-2">
//                                     <span>🚀</span>
//                                     <span>Initialize Selected ({selectedForBulk.size})</span>
//                                 </div>
//                             )}
//                         </button>
//                     )}
//                 </div>
//             </div>
//         );
//     };

//     // Fetch room details
//     // Fetch room details
//     const fetchRoomDetails = async (roomIds) => {
//         if (!roomIds.length) {
//             console.log("⚠️ No room IDs to fetch");
//             return;
//         }

//         console.log("🔄 Fetching room details for IDs:", roomIds);
//         setRoomsLoading(true);

//         try {
//             const token = localStorage.getItem("ACCESS_TOKEN");

//             const roomPromises = roomIds.map(async (roomId) => {
//                 try {
//                     console.log(`📡 Fetching room ${roomId}`);
//                     const response = await projectInstance.get(
//                         `/rooms/${roomId}/`,
//                         {
//                             headers: { Authorization: `Bearer ${token}` },
//                             timeout: 10000,
//                         }
//                     );
//                     console.log(`🏠 Room ${roomId} details:`, response.data);
//                     return response.data;
//                 } catch (err) {
//                     console.error(`❌ Failed to fetch room ${roomId}:`, err);
//                     // Return fallback room data
//                     return {
//                         id: roomId,
//                         rooms: `Room ${roomId}`,
//                         name: `Room ${roomId}`
//                     };
//                 }
//             });

//             const roomDetails = await Promise.all(roomPromises);
//             console.log("🏠 All room details fetched:", roomDetails);

//             // Log room names for debugging
//             roomDetails.forEach(room => {
//                 console.log(`🏠 Room ${room.id}: ${room.rooms || room.name || 'No name'}`);
//             });

//             setRooms(roomDetails);
//         } catch (err) {
//             console.error("❌ Failed to fetch room details:", err);
//             toast.error("Failed to load room details");
//         } finally {
//             setRoomsLoading(false);
//         }
//     };

//     useEffect(() => {
//         console.log("🚀 useEffect triggered with:", { projectId, flatId });

//         const fetchInitialData = async () => {
//             if (!projectId || !flatId) {
//                 console.error("❌ Missing required data:", { projectId, flatId });
//                 setError("Missing project or flat information");
//                 setLoading(false);
//                 return;
//             }

//             try {
//                 setLoading(true);
//                 setError(null);

//                 const detectedRole = getCurrentUserRole();
//                 setUserRole(detectedRole);

//                 if (detectedRole === 'INITIALIZER') {
//                     // For INITIALIZER, load default tab data
//                     await fetchTabData('ready-to-start');
//                     setChecklistData([]); // Clear old format data

//                     // After loading tab data, fetch room details
//                     setTimeout(() => {
//                         const roomIds = [...new Set(
//                             Object.values(tabData).flatMap(tabRooms =>
//                                 tabRooms.map(room => room.room_id).filter(Boolean)
//                             )
//                         )];

//                         console.log("🔍 INITIALIZER Room IDs to fetch:", roomIds);
//                         if (roomIds.length > 0) {
//                             fetchRoomDetails(roomIds);
//                         }
//                     }, 500);
//                 } else if (['CHECKER', 'MAKER', 'SUPERVISOR'].includes(detectedRole)) {
//                     // For working roles, use standard logic
//                     const token = localStorage.getItem("ACCESS_TOKEN");
//                     const apiUrl = '/Transafer-Rule-getchchklist/';
//                     const params = { project_id: projectId, flat_id: flatId };

//                     const response = await checklistInstance.get(apiUrl, {
//                         params: params,
//                         headers: {
//                             Authorization: `Bearer ${token}`,
//                             "Content-Type": "application/json",
//                         },
//                         timeout: 10000,
//                     });

//                     if (response.status === 200) {
//                         const responseData = response.data || {};
//                         let data = responseData.results || responseData || [];
//                         if (!Array.isArray(data)) data = [data];

//                         console.log("🔍 DEBUG: Working role data received:", data);
//                         console.log("🔍 DEBUG: Room details in data:", data.map(room => ({
//                             room_id: room.room_id,
//                             room_details: room.room_details
//                         })));

//                         setChecklistData(data);

//                         // Extract room IDs from all possible sources
//                         const roomIds = [...new Set(data.map((item) => item.room_id).filter(Boolean))];
//                         console.log("🔍 DEBUG: Room IDs to fetch:", roomIds);

//                         if (roomIds.length > 0) {
//                             await fetchRoomDetails(roomIds);
//                         }
//                     }
//                 } else {
//                     // For other roles, use existing logic
//                     // For other roles, use existing logic
//                     const token = localStorage.getItem("ACCESS_TOKEN");
//                     const apiUrl = '/Transafer-Rule-getchchklist/';
//                     const params = { project_id: projectId, flat_id: flatId };

//                     const response = await checklistInstance.get(apiUrl, {
//                         params: params,
//                         headers: {
//                             Authorization: `Bearer ${token}`,
//                             "Content-Type": "application/json",
//                         },
//                         timeout: 10000,
//                     });

//                     if (response.status === 200) {
//                         const responseData = response.data || {};
//                         let data = responseData.results || responseData || [];
//                         if (!Array.isArray(data)) data = [data];

//                         setChecklistData(data);

//                         const roomIds = [...new Set(data.map((item) => item.room_id).filter(Boolean))];
//                         if (roomIds.length > 0) {
//                             fetchRoomDetails(roomIds);
//                         }
//                     }
//                 }
//             } catch (err) {
//                 console.error("❌ API Error:", err);
//                 setError(err.message || "Failed to fetch data");
//                 toast.error("Failed to load data");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchInitialData();
//     }, [projectId, flatId]);


//     const getStatusBadge = (status) => {
//         const statusConfig = {
//             completed: { bg: `${themeConfig.success}20`, text: themeConfig.success, label: "Completed" },
//             in_progress: { bg: `${themeConfig.warning}20`, text: themeConfig.warning, label: "In Progress" },
//             work_in_progress: { bg: `${themeConfig.warning}20`, text: themeConfig.warning, label: "Work In Progress" },
//             not_started: { bg: `${themeConfig.textSecondary}20`, text: themeConfig.textSecondary, label: "Not Started" },
//             on_hold: { bg: `${themeConfig.error}20`, text: themeConfig.error, label: "On Hold" },
//             pending_for_inspector: { bg: `${themeConfig.accent}20`, text: themeConfig.accent, label: "Pending Inspector" },
//             pending_for_supervisor: { bg: `${themeConfig.warning}20`, text: themeConfig.warning, label: "Pending Supervisor" },
//             pending_for_maker: { bg: `${themeConfig.info}20`, text: themeConfig.info, label: "Pending Maker" },
//         };

//         // Safety check for undefined status
//         const safeStatus = status || 'not_started';
//         const config = statusConfig[safeStatus] || statusConfig.not_started;
//         return (
//             <span
//                 className="px-3 py-1 rounded-full text-xs font-medium transition-all duration-200"
//                 style={{ background: config.bg, color: config.text }}
//             >
//                 {config.label}
//             </span>
//         );
//     };

//     const stats = React.useMemo(() => {
//         let allItems = [];

//         if (userRole === 'INITIALIZER') {
//             // For INITIALIZER, get data from all tabs
//             allItems = Object.values(tabData).flatMap(tabRooms =>
//                 tabRooms.flatMap(room =>
//                     (room.checklists || []).flatMap(checklist =>
//                         (checklist && checklist.items) || []
//                     )
//                 )
//             );
//         } else if (['CHECKER', 'MAKER', 'SUPERVISOR'].includes(userRole)) {
//             // For working roles, handle both item-level (MAKER) and checklist-level (CHECKER/SUPERVISOR)
//             allItems = checklistData.flatMap((room) => {
//                 const assignedItems = room.assigned_to_me || [];
//                 const availableItems = room.available_for_me || [];

//                 if (userRole === 'MAKER') {
//                     // MAKER: assigned_to_me and available_for_me contain items directly
//                     return [...assignedItems, ...availableItems];
//                 } else {
//                     // CHECKER/SUPERVISOR: assigned_to_me and available_for_me contain checklists with items
//                     const allChecklists = [...assignedItems, ...availableItems];
//                     return allChecklists.flatMap((checklist) => (checklist && checklist.items) || []);
//                 }
//             });
//         } else {
//             // For other roles, use existing logic
//             allItems = checklistData.flatMap((room) => {
//                 const checklists = [
//                     ...(room.assigned_to_me || []),
//                     ...(room.available_for_me || [])
//                 ];
//                 return checklists.flatMap((checklist) => (checklist && checklist.items) || []);
//             });
//         }

//         const total = allItems.length;
//         const completed = allItems.filter((item) => item.status === "completed").length;
//         const inProgress = allItems.filter((item) => item.status === "in_progress").length;
//         const notStarted = allItems.filter((item) => item.status === "not_started").length;

//         return {
//             total,
//             completed,
//             inProgress,
//             notStarted,
//             completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
//         };
//     }, [checklistData, tabData, userRole]);

//     const handleBack = () => navigate(-1);
//     const toggleItemExpansion = (checklistId, itemId) => {
//         const key = `${checklistId}-${itemId}`;
//         setExpandedItems((prev) => ({ ...prev, [key]: !prev[key] }));
//     };

//     // Room Section Component
//     const RoomSection = ({ roomName, roomId, checklists, userRole, themeConfig, roomDetail, handleRoomClick }) => {
//         const [isRoomExpanded, setIsRoomExpanded] = useState(false);

//         // Debug room name for all roles
//         console.log(`🏠 RoomSection Debug - Role: ${userRole}, ID: ${roomId}, Name: ${roomName}`);
//         console.log(`🏠 RoomSection Room Detail:`, roomDetail);

//         return (
//             <div className="border rounded-lg p-4 mb-4" style={{ borderColor: themeConfig.border }}>
//                 {/* Room Header - Clickable */}
//                 <div
//                     className="cursor-pointer hover:shadow-md transition-all p-4 rounded-lg"
//                     style={{
//                         background: isRoomExpanded ? `${themeConfig.accent}10` : themeConfig.headerBg,
//                         borderColor: themeConfig.border
//                     }}
//                     onClick={() => setIsRoomExpanded(!isRoomExpanded)}
//                 >
//                     <div className="flex justify-between items-center">
//                         <div className="flex items-center gap-3">
//                             {/* Room Icon */}
//                             <div
//                                 className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
//                                 style={{
//                                     background: `linear-gradient(135deg, ${themeConfig.accent}, ${themeConfig.accent}dd)`,
//                                 }}
//                             >
//                                 {roomName.charAt(0).toUpperCase()}
//                             </div>

//                             <div>
//                                 <h3 className="text-xl font-bold" style={{ color: themeConfig.textPrimary }}>
//                                     {roomName.toUpperCase()}
//                                 </h3>
//                                 <p className="text-sm" style={{ color: themeConfig.textSecondary }}>
//                                     {checklists.length} checklist{checklists.length !== 1 ? "s" : ""} available
//                                     {roomId && ` • Room ID: ${roomId}`}
//                                 </p>
//                             </div>
//                         </div>

//                         {/* Expand/Collapse Arrow */}
//                         <div
//                             className={`transform transition-all duration-300 ${isRoomExpanded ? "rotate-90" : ""
//                                 } p-2 rounded-full`}
//                             style={{
//                                 color: themeConfig.accent,
//                                 backgroundColor: `${themeConfig.accent}15`,
//                             }}
//                         >
//                             <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
//                                 <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
//                             </svg>
//                         </div>
//                     </div>
//                 </div>


//                 {/* 👆 ADD THE ROOM-LEVEL BUTTON RIGHT HERE 👆 */}
//                 {/* Room-Level Initialize All Button for INITIALIZER */}
//                 {userRole === 'INITIALIZER' && (
//                     <div className="mt-4 ml-16">
//                         <button
//                             onClick={async () => {
//                                 // Get all not_started checklists in this room
//                                 const roomChecklistIds = checklists
//                                     .filter(checklist => checklist.status === "not_started")
//                                     .map(checklist => checklist.id);

//                                 if (roomChecklistIds.length === 0) {
//                                     toast.success("No checklists to initialize in this room");
//                                     return;
//                                 }

//                                 // Initialize all checklists in this room
//                                 setBulkInitializing(true);

//                                 try {
//                                     for (const checklistId of roomChecklistIds) {
//                                         await handleInitializeChecklist(checklistId);
//                                     }

//                                     toast.success(`🎉 All ${roomChecklistIds.length} checklists in ${roomName} initialized!`, {
//                                         duration: 4000,
//                                         style: { background: themeConfig.success, color: 'white', borderRadius: '12px' }
//                                     });
//                                 } finally {
//                                     setBulkInitializing(false);
//                                 }
//                             }}
//                             disabled={bulkInitializing || checklists.filter(c => c.status === "not_started").length === 0}
//                             className="px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105"
//                             style={{
//                                 background: checklists.filter(c => c.status === "not_started").length === 0
//                                     ? `${themeConfig.textSecondary}60`
//                                     : `linear-gradient(135deg, ${themeConfig.accent}, ${themeConfig.accent}dd)`,
//                                 color: 'white',
//                                 border: `2px solid ${themeConfig.accent}`,
//                             }}
//                         >
//                             <div className="flex items-center gap-2">
//                                 <span>🏠</span>
//                                 <span>Initialize All in {roomName} ({checklists.filter(c => c.status === "not_started").length})</span>
//                             </div>
//                         </button>
//                     </div>
//                 )}


//                 {/* Expanded Checklists Content */}
//                 <div
//                     className={`transition-all duration-500 ease-out overflow-hidden ${isRoomExpanded ? "max-h-[2000px] opacity-100 mt-4" : "max-h-0 opacity-0"
//                         }`}
//                 >
//                     <div className="ml-6 space-y-4">
//                         {checklists.map((checklist) => (
//                             <ChecklistCard
//                                 key={checklist.id}
//                                 checklist={checklist}
//                                 userRole={userRole}
//                                 themeConfig={themeConfig}
//                             />
//                         ))}
//                     </div>
//                 </div>
//             </div>
//         );
//     };



//     const ChecklistCard = React.memo(({ checklist, userRole, themeConfig }) => {
//         const [isChecklistExpanded, setIsChecklistExpanded] = useState(false);

//         return (
//             <div
//                 data-checklist-id={checklist.id}
//                 className="border rounded-lg p-4 transition-all duration-300 hover:shadow-md checklist-card"
//                 style={{ background: themeConfig.cardBg, borderColor: themeConfig.border }}
//             >
//                 <div className="flex items-start justify-between mb-3">
//                     <div className="flex-1">
//                         <h4 className="font-semibold mb-1" style={{ color: themeConfig.textPrimary }}>
//                             {checklist.name}
//                         </h4>
//                         {checklist.description && (
//                             <p className="text-sm mb-2" style={{ color: themeConfig.textSecondary }}>
//                                 {checklist.description}
//                             </p>
//                         )}
//                     </div>
//                     <div className="flex items-center gap-3">
//                         {getStatusBadge(checklist.status)}
//                         {getRoleBasedActions(checklist, null)}
//                     </div>
//                 </div>

//                 {/* Clickable Items Section */}
//                 {checklist.items && checklist.items.length > 0 && (
//                     <div className="mt-3">
//                         <div
//                             className="p-3 rounded-lg cursor-pointer hover:shadow-sm transition-all duration-200"
//                             style={{ background: `${themeConfig.accent}08` }}
//                             onClick={() => setIsChecklistExpanded(!isChecklistExpanded)}
//                         >
//                             <div className="flex items-center justify-between">
//                                 <div className="flex items-center gap-2">
//                                     <span className="text-lg">📋</span>
//                                     <span className="font-medium" style={{ color: themeConfig.textPrimary }}>
//                                         {checklist.items.length} Inspection Items
//                                     </span>
//                                 </div>
//                                 <div className="flex items-center gap-2">
//                                     <span className="text-xs px-2 py-1 rounded-full" style={{
//                                         background: `${themeConfig.accent}20`,
//                                         color: themeConfig.accent
//                                     }}>
//                                         {/* Read-only for {userRole} */}
//                                     </span>
//                                     <div
//                                         className={`transform transition-all duration-300 ${isChecklistExpanded ? "rotate-90" : ""
//                                             }`}
//                                         style={{ color: themeConfig.accent }}
//                                     >
//                                         <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
//                                             <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
//                                         </svg>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Expanded Items List */}
//                         <div
//                             className={`transition-all duration-500 ease-out overflow-hidden ${isChecklistExpanded ? "max-h-[2000px] opacity-100 mt-4" : "max-h-0 opacity-0"
//                                 }`}
//                         >
//                             <div className="space-y-3">
//                                 {checklist.items.map((item, itemIndex) => (
//                                     <InspectionItem
//                                         key={item.id}
//                                         item={item}
//                                         itemIndex={itemIndex}
//                                         userRole={userRole}
//                                         themeConfig={themeConfig}
//                                     />
//                                 ))}
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         );
//     });


//     // MAKER Item Card Component
//     const MakerItemCard = ({ item, userRole, themeConfig }) => {
//         const [isExpanded, setIsExpanded] = useState(false);

//         return (
//             <div
//                 className="border rounded-lg p-4 transition-all duration-300 hover:shadow-md"
//                 style={{ background: themeConfig.cardBg, borderColor: themeConfig.border }}
//             >
//                 <div className="flex items-start justify-between mb-3">
//                     <div className="flex-1">
//                         <div className="flex items-center gap-3 mb-2">
//                             <span
//                                 className="text-sm font-bold px-2 py-1 rounded-full"
//                                 style={{
//                                     background: `${themeConfig.accent}20`,
//                                     color: themeConfig.accent
//                                 }}
//                             >
//                                 #{item.id}
//                             </span>
//                             <h4 className="font-semibold" style={{ color: themeConfig.textPrimary }}>
//                                 {item.title}
//                             </h4>
//                         </div>

//                         <div className="flex items-center gap-3 flex-wrap mb-2">
//                             {/* <Tooltip text={`Current status: ${item.status.replace('_', ' ')}`}>
//                                 {getStatusBadge(item.status)}
//                             </Tooltip> */}

//                             {item.photo_required && (
//                                 <Tooltip text="This item requires photo documentation">
//                                     <span
//                                         className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
//                                         style={{
//                                             background: `${themeConfig.accent}20`,
//                                             color: themeConfig.accent
//                                         }}
//                                     >
//                                         <span>📷</span>
//                                         Photo Required
//                                     </span>
//                                 </Tooltip>
//                             )}

//                             <button
//                                 onClick={() => {
//                                     setSelectedItemForHistory(item);
//                                     setShowHistoryModal(true);
//                                 }}
//                                 className="text-xs px-2 py-1 rounded-full hover:scale-105 transition-all cursor-pointer"
//                                 style={{
//                                     background: `${themeConfig.accent}20`,
//                                     color: themeConfig.accent,
//                                     border: `1px solid ${themeConfig.accent}40`
//                                 }}
//                             >
//                                 📋 History ({item.latest_submission?.attempts || 1} attempts)
//                             </button>
//                         </div>

//                         {/* {item.description && (
//                             <p className="text-sm" style={{ color: themeConfig.textSecondary }}>
//                                 {item.description}
//                             </p>
//                         )} */}
//                     </div>

//                     <div className="flex items-center gap-3">
//                         <button
//                             onClick={() => {
//                                 setSelectedItemForMaker(item);
//                                 setMakerRemark('');
//                                 setMakerPhotos([]);
//                                 setShowMakerModal(true);
//                             }}
//                             className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
//                             style={{
//                                 background: themeConfig.accent,
//                                 color: 'white'
//                             }}
//                         >
//                             Complete Work
//                         </button>
//                     </div>
//                 </div>

//                 {/* Expandable Options Section */}
//                 {/* {item.options && item.options.length > 0 && (
//                     <div className="mt-3">
//                         <button
//                             onClick={() => setIsExpanded(!isExpanded)}
//                             className="flex items-center gap-2 text-sm font-medium"
//                             style={{ color: themeConfig.accent }}
//                         >
//                             <span>View Options ({item.options.length})</span>
//                             <span className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
//                         </button>

//                         {isExpanded && (
//                             <div className="mt-3 space-y-2">
//                                 {item.options.map((option, index) => (
//                                     <div
//                                         key={option.id}
//                                         className="p-3 rounded-lg"
//                                         style={{
//                                             background: option.choice === 'P'
//                                                 ? `${themeConfig.success}15`
//                                                 : `${themeConfig.error}15`,
//                                             border: `1px solid ${option.choice === 'P'
//                                                 ? themeConfig.success + '30'
//                                                 : themeConfig.error + '30'}`
//                                         }}
//                                     >
//                                         <div className="flex items-center justify-between">
//                                             <span className="font-medium" style={{ color: themeConfig.textPrimary }}>
//                                                 {option.name}
//                                             </span>
//                                             <span
//                                                 className="text-xs px-2 py-1 rounded-full font-bold"
//                                                 style={{
//                                                     background: option.choice === 'P' ? themeConfig.success : themeConfig.error,
//                                                     color: 'white'
//                                                 }}
//                                             >
//                                                 {option.choice === 'P' ? '✓ PASS' : '✗ FAIL'}
//                                             </span>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         )}
//                     </div>
//                 )} */}
//             </div>
//         );
//     };


//     // History Modal Component
//     const HistoryModal = () => {
//         if (!showHistoryModal || !selectedItemForHistory) return null;

//         const submission = selectedItemForHistory.latest_submission;
//         const attempts = submission?.attempts || 1;

//         // Create timeline based on submission data
//         const getTimeline = () => {
//             const timeline = [];

//             for (let i = 1; i <= attempts; i++) {
//                 if (i < attempts) {
//                     // Previous attempts (completed but rejected)
//                     timeline.push({
//                         attempt: i,
//                         status: 'MAKER → SUPERVISOR (rejected)',
//                         icon: '❌',
//                         color: themeConfig.error,
//                         description: 'Work completed but rejected by supervisor'
//                     });
//                 } else {
//                     // Current attempt
//                     const currentStatus = submission?.status === 'created'
//                         ? 'MAKER (in progress)'
//                         : submission?.supervisor_id
//                             ? 'SUPERVISOR (reviewing)'
//                             : 'MAKER (current)';

//                     timeline.push({
//                         attempt: i,
//                         status: currentStatus,
//                         icon: '🔄',
//                         color: themeConfig.warning,
//                         description: 'Current work in progress'
//                     });
//                 }
//             }

//             return timeline;
//         };

//         const timeline = getTimeline();

//         return (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//                 <div
//                     className="max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-xl shadow-2xl"
//                     style={{ background: themeConfig.cardBg }}
//                 >
//                     {/* Modal Header */}
//                     <div
//                         className="sticky top-0 p-6 border-b"
//                         style={{
//                             background: themeConfig.headerBg,
//                             borderColor: themeConfig.border
//                         }}
//                     >
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <h3 className="text-xl font-bold" style={{ color: themeConfig.textPrimary }}>
//                                     Work History
//                                 </h3>
//                                 <p className="text-sm mt-1" style={{ color: themeConfig.textSecondary }}>
//                                     {selectedItemForHistory.title}
//                                 </p>
//                             </div>
//                             <button
//                                 onClick={() => setShowHistoryModal(false)}
//                                 className="p-2 rounded-lg hover:bg-opacity-80 transition-all"
//                                 style={{ background: `${themeConfig.error}20`, color: themeConfig.error }}
//                             >
//                                 ✕
//                             </button>
//                         </div>
//                     </div>

//                     <div className="p-6">
//                         {/* Item Details */}
//                         <div
//                             className="p-4 rounded-xl mb-6"
//                             style={{ background: `${themeConfig.accent}10`, border: `1px solid ${themeConfig.accent}30` }}
//                         >
//                             <h4 className="font-medium mb-2" style={{ color: themeConfig.textPrimary }}>
//                                 📋 Item Details
//                             </h4>
//                             <div className="grid grid-cols-2 gap-4 text-sm">
//                                 <div>
//                                     <span style={{ color: themeConfig.textSecondary }}>Item ID:</span>
//                                     <span className="ml-2 font-mono" style={{ color: themeConfig.textPrimary }}>
//                                         {selectedItemForHistory.id}
//                                     </span>
//                                 </div>
//                                 <div>
//                                     <span style={{ color: themeConfig.textSecondary }}>Photo Required:</span>
//                                     <span className="ml-2" style={{ color: themeConfig.textPrimary }}>
//                                         {selectedItemForHistory.photo_required ? 'Yes' : 'No'}
//                                     </span>
//                                 </div>
//                                 <div>
//                                     <span style={{ color: themeConfig.textSecondary }}>Current Status:</span>
//                                     <span className="ml-2" style={{ color: themeConfig.textPrimary }}>
//                                         {selectedItemForHistory.status}
//                                     </span>
//                                 </div>
//                                 <div>
//                                     <span style={{ color: themeConfig.textSecondary }}>Total Attempts:</span>
//                                     <span className="ml-2 font-bold" style={{ color: themeConfig.accent }}>
//                                         {attempts}
//                                     </span>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Timeline */}
//                         <div
//                             className="p-4 rounded-xl"
//                             style={{ background: `${themeConfig.textSecondary}08`, border: `1px solid ${themeConfig.textSecondary}20` }}
//                         >
//                             <h4 className="font-medium mb-4" style={{ color: themeConfig.textPrimary }}>
//                                 🕒 Work Timeline
//                             </h4>

//                             <div className="space-y-4">
//                                 {timeline.map((entry, index) => (
//                                     <div key={index} className="flex items-start gap-4">
//                                         <div
//                                             className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
//                                             style={{ background: entry.color, color: 'white' }}
//                                         >
//                                             {entry.attempt}
//                                         </div>

//                                         <div className="flex-1">
//                                             <div className="flex items-center gap-2 mb-1">
//                                                 <span className="text-lg">{entry.icon}</span>
//                                                 <span className="font-medium" style={{ color: themeConfig.textPrimary }}>
//                                                     Attempt {entry.attempt}: {entry.status}
//                                                 </span>
//                                             </div>
//                                             <p className="text-sm" style={{ color: themeConfig.textSecondary }}>
//                                                 {entry.description}
//                                             </p>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>

//                         {/* Submission Details */}
//                         {submission && (
//                             <div
//                                 className="mt-6 p-4 rounded-xl"
//                                 style={{ background: `${themeConfig.success}10`, border: `1px solid ${themeConfig.success}30` }}
//                             >
//                                 <h4 className="font-medium mb-4" style={{ color: themeConfig.textPrimary }}>
//                                     📝 Current Submission Details
//                                 </h4>

//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//                                     <div>
//                                         <span style={{ color: themeConfig.textSecondary }}>Submission ID:</span>
//                                         <span className="ml-2 font-mono" style={{ color: themeConfig.textPrimary }}>
//                                             {submission.id}
//                                         </span>
//                                     </div>
//                                     <div>
//                                         <span style={{ color: themeConfig.textSecondary }}>Created:</span>
//                                         <span className="ml-2" style={{ color: themeConfig.textPrimary }}>
//                                             {new Date(submission.created_at).toLocaleString()}
//                                         </span>
//                                     </div>
//                                     <div>
//                                         <span style={{ color: themeConfig.textSecondary }}>MAKER ID:</span>
//                                         <span className="ml-2" style={{ color: themeConfig.textPrimary }}>
//                                             {submission.maker_id || 'Not assigned'}
//                                         </span>
//                                     </div>
//                                     <div>
//                                         <span style={{ color: themeConfig.textSecondary }}>CHECKER ID:</span>
//                                         <span className="ml-2" style={{ color: themeConfig.textPrimary }}>
//                                             {submission.checker_id || 'Not assigned'}
//                                         </span>
//                                     </div>
//                                 </div>

//                                 {submission.maker_remarks && (
//                                     <div className="mt-4">
//                                         <span className="font-medium" style={{ color: themeConfig.textSecondary }}>
//                                             MAKER Remarks:
//                                         </span>
//                                         <p className="mt-1 p-3 rounded-lg" style={{
//                                             background: themeConfig.cardBg,
//                                             color: themeConfig.textPrimary,
//                                             border: `1px solid ${themeConfig.border}`
//                                         }}>
//                                             {submission.maker_remarks}
//                                         </p>
//                                     </div>
//                                 )}

//                                 {submission.supervisor_remarks && (
//                                     <div className="mt-4">
//                                         <span className="font-medium" style={{ color: themeConfig.textSecondary }}>
//                                             SUPERVISOR Remarks:
//                                         </span>
//                                         <p className="mt-1 p-3 rounded-lg" style={{
//                                             background: themeConfig.cardBg,
//                                             color: themeConfig.textPrimary,
//                                             border: `1px solid ${themeConfig.border}`
//                                         }}>
//                                             {submission.supervisor_remarks}
//                                         </p>
//                                     </div>
//                                 )}
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         );
//     };


//     // Inspection Item Component
//     const InspectionItem = React.memo(({ item, itemIndex, userRole, themeConfig }) => {
//         const [isItemExpanded, setIsItemExpanded] = useState(false);
//         const [selectedOptionId, setSelectedOptionId] = useState(null);
//         const [remark, setRemark] = useState('');
//         const [isSubmitting, setIsSubmitting] = useState(false);

//         // Check if this role can make decisions
//         const canMakeDecisions = ['CHECKER', 'SUPERVISOR', 'MAKER'].includes(userRole);

//         // Handle option selection
//         const handleOptionSelect = (optionId) => {
//             if (!canMakeDecisions) return;
//             setSelectedOptionId(optionId);
//         };

//         // Submit decision to API
//         const debouncedSubmitDecision = useDebounce(async () => {
//             if (!canMakeDecisions) {
//                 toast.error("You don't have permission to make decisions", {
//                     style: { background: themeConfig.warning, color: 'white', borderRadius: '12px' }
//                 });
//                 return;
//             }

//             // Different validation for different roles
//             if (userRole === 'MAKER') {
//                 // MAKER doesn't need to select options, just marks as done
//             } else {
//                 // CHECKER/SUPERVISOR must select an option
//                 if (!selectedOptionId) {
//                     toast.error("Please select an option before submitting", {
//                         style: { background: themeConfig.warning, color: 'white', borderRadius: '12px' }
//                     });
//                     return;
//                 }
//             }

//             setIsSubmitting(true);
//             setLoadingStates(prev => new Set([...prev, item.id]));

//             try {
//                 const token = localStorage.getItem("ACCESS_TOKEN");

//                 let apiEndpoint, payload;

//                 if (userRole === 'MAKER') {
//                     // MAKER workflow - simpler API
//                     apiEndpoint = '/mark-as-done-maker/';
//                     payload = {
//                         checklist_item_id: item.id
//                     };
//                 } else {
//                     // CHECKER/SUPERVISOR workflow - decision making API
//                     apiEndpoint = '/Decsion-makeing-forSuer-Inspector/';
//                     payload = {
//                         checklist_item_id: item.id,
//                         role: userRole.toLowerCase(),
//                         option_id: selectedOptionId,
//                         check_remark: remark
//                     };
//                 }

//                 console.log(`📡 API CALL: ${userRole} Decision - Endpoint:`, apiEndpoint);
//                 console.log(`📡 API CALL: ${userRole} Decision - Payload:`, payload);

//                 const response = await checklistInstance.patch(
//                     apiEndpoint,
//                     payload,
//                     {
//                         headers: { Authorization: `Bearer ${token}` },
//                     }
//                 );

//                 console.log(`📡 API RESPONSE: ${userRole} Decision - Response:`, response.data);

//                 if (response.status === 200) {
//                     const successMessage = userRole === 'MAKER'
//                         ? "✅ Item marked as done and sent for review!"
//                         : `✅ ${response.data.detail}`;

//                     toast.success(successMessage, {
//                         duration: 4000,
//                         style: {
//                             background: themeConfig.success,
//                             color: 'white',
//                             borderRadius: '12px',
//                             padding: '16px',
//                         },
//                     });

//                     // Reset form
//                     setSelectedOptionId(null);
//                     setRemark('');

//                     // Optimistic UI update - remove item from current view
//                     const currentDataSource = activeWorkTab === 'available-work' ? 'available_for_me' : 'assigned_to_me';
//                     setChecklistData(prevData =>
//                         prevData.map(roomData => ({
//                             ...roomData,
//                             [currentDataSource]: roomData[currentDataSource]?.map(checklist => ({
//                                 ...checklist,
//                                 items: checklist.items?.filter(checklistItem => checklistItem.id !== item.id) || []
//                             })) || []
//                         }))
//                     );
//                 }

//             } catch (err) {
//                 console.error(`❌ Failed to submit ${userRole} decision:`, err);
//                 const errorMessage = err.response?.data?.detail || `Failed to submit ${userRole.toLowerCase()} decision`;

//                 toast.error(`❌ ${errorMessage}`, {
//                     duration: 4000,
//                     style: {
//                         background: themeConfig.error,
//                         color: 'white',
//                         borderRadius: '12px',
//                         padding: '16px',
//                     },
//                 });
//             } finally {
//                 setIsSubmitting(false);
//                 setLoadingStates(prev => {
//                     const newSet = new Set(prev);
//                     newSet.delete(item.id);
//                     return newSet;
//                 });
//             }
//         }, 300);

//         return (
//             <div
//                 className="border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md"
//                 style={{
//                     background: themeConfig.headerBg,
//                     borderColor: themeConfig.border,
//                     boxShadow: isItemExpanded ? `0 4px 12px ${themeConfig.accent}10` : 'none'
//                 }}
//             >
//                 {/* Item Header - Clickable */}
//                 <div
//                     className="p-4 cursor-pointer transition-all duration-200 hover:bg-opacity-80"
//                     onClick={() => setIsItemExpanded(!isItemExpanded)}
//                     style={{ background: isItemExpanded ? `${themeConfig.accent}08` : 'transparent' }}
//                 >
//                     <div className="flex items-center justify-between">
//                         <div className="flex-1">
//                             <div className="flex items-center gap-3 mb-2">
//                                 {/* Bulk selection checkbox for CHECKER/SUPERVISOR */}
//                                 {/* {['CHECKER', 'SUPERVISOR'].includes(userRole) && (
//                                     <div className="flex items-center">
//                                         <input
//                                             type="checkbox"
//                                             checked={selectedItemsForBulk.has(item.id)}
//                                             onChange={(e) => {
//                                                 e.stopPropagation(); // Prevent expanding item when clicking checkbox
//                                                 toggleItemSelection(item.id);
//                                             }}
//                                             disabled={bulkSubmitting}
//                                             className="w-4 h-4 rounded border-2 focus:ring-2 cursor-pointer disabled:opacity-50"
//                                             style={{
//                                                 accentColor: themeConfig.accent,
//                                                 borderColor: themeConfig.border
//                                             }}
//                                         />
//                                     </div>
//                                 )} */}
//                                 {/* Bulk selection checkbox for CHECKER only */}
//                                 {userRole === 'CHECKER' && (
//                                     <div className="flex items-center">
//                                         <input
//                                             type="checkbox"
//                                             checked={selectedItemsForBulk.has(item.id)}
//                                             onChange={(e) => {
//                                                 e.stopPropagation();
//                                                 toggleItemSelection(item.id);
//                                             }}
//                                             disabled={bulkSubmitting}
//                                             className="w-4 h-4 rounded border-2 focus:ring-2 cursor-pointer disabled:opacity-50"
//                                             style={{
//                                                 accentColor: themeConfig.accent,
//                                                 borderColor: themeConfig.border
//                                             }}
//                                         />
//                                     </div>
//                                 )}
//                                 <span
//                                     className="text-sm font-bold px-2 py-1 rounded-full"
//                                     style={{
//                                         background: `${themeConfig.accent}20`,
//                                         color: themeConfig.accent
//                                     }}
//                                 >
//                                     #{itemIndex + 1}
//                                 </span>
//                                 <h6 className="font-semibold text-base" style={{ color: themeConfig.textPrimary }}>
//                                     {item.title}
//                                 </h6>
//                             </div>

//                             <div className="flex items-center gap-3 flex-wrap">
//                                 <Tooltip text={`Current status: ${item.status.replace('_', ' ')}`}>
//                                     {getStatusBadge(item.status)}
//                                 </Tooltip>

//                                 {item.photo_required && (
//                                     <Tooltip text="This item requires photo documentation">
//                                         <span
//                                             className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
//                                             style={{
//                                                 background: `${themeConfig.accent}20`,
//                                                 color: themeConfig.accent
//                                             }}
//                                         >
//                                             <span>📷</span>
//                                             Photo Required
//                                         </span>
//                                     </Tooltip>
//                                 )}

//                                 <span
//                                     className="text-xs px-2 py-1 rounded-full"
//                                     style={{
//                                         background: `${themeConfig.textSecondary}15`,
//                                         color: themeConfig.textSecondary
//                                     }}
//                                 >
//                                     {item.options?.length || 0} Options
//                                 </span>

//                                 {canMakeDecisions && (
//                                     <span
//                                         className="text-xs px-2 py-1 rounded-full font-medium"
//                                         style={{
//                                             background: `${themeConfig.success}15`,
//                                             color: themeConfig.success
//                                         }}
//                                     >

//                                     </span>
//                                 )}
//                             </div>
//                         </div>

//                         <div className="flex items-center gap-2">
//                             <span
//                                 className={`text-lg transition-transform duration-200 ${isItemExpanded ? 'rotate-90' : ''}`}
//                                 style={{ color: themeConfig.accent }}
//                             >
//                                 ▶
//                             </span>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Expanded Item Details */}
//                 <div
//                     className={`transition-all duration-300 ease-in-out ${isItemExpanded
//                         ? 'max-h-[2000px] opacity-100'
//                         : 'max-h-0 opacity-0 overflow-hidden'
//                         }`}
//                 >
//                     <div className="px-4 pb-4">
//                         {/* Item Description */}
//                         {item.description && (
//                             <div
//                                 className="p-4 rounded-xl mb-4"
//                                 style={{
//                                     background: `${themeConfig.textSecondary}08`,
//                                     border: `1px solid ${themeConfig.textSecondary}20`
//                                 }}
//                             >
//                                 <h6
//                                     className="font-medium text-sm mb-2 flex items-center gap-2"
//                                     style={{ color: themeConfig.textPrimary }}
//                                 >
//                                     <span>📝</span>
//                                     Description
//                                 </h6>
//                                 <p className="text-sm" style={{ color: themeConfig.textSecondary }}>
//                                     {item.description}
//                                 </p>
//                             </div>
//                         )}

//                         {/* Options Section */}
//                         {/* Options Section - Hidden for MAKER */}
//                         {item.options && item.options.length > 0 && (
//                             <div>
//                                 <h6
//                                     className="font-semibold text-sm mb-3 flex items-center gap-2"
//                                     style={{ color: themeConfig.textPrimary }}
//                                 >
//                                     <span>⚡</span>
//                                     Answer Options ({item.options.length})
//                                     {canMakeDecisions && (
//                                         <span className="text-xs px-2 py-1 rounded-full" style={{
//                                             background: `${themeConfig.accent}15`,
//                                             color: themeConfig.accent
//                                         }}>
//                                             Click to Select
//                                         </span>
//                                     )}
//                                 </h6>

//                                 <div className="grid grid-cols-1 gap-3">
//                                     {item.options.map((option, optionIndex) => {
//                                         const isPassOption = option.choice === "P";
//                                         const isSelected = selectedOptionId === option.id;

//                                         // Enhanced color scheme for selected/unselected states
//                                         const optionBgColor = isSelected
//                                             ? (isPassOption ? `${themeConfig.passColor}25` : `${themeConfig.failColor}25`)
//                                             : (isPassOption ? `${themeConfig.passColor}12` : `${themeConfig.failColor}12`);

//                                         const optionBorderColor = isSelected
//                                             ? (isPassOption ? `${themeConfig.passColor}80` : `${themeConfig.failColor}80`)
//                                             : (isPassOption ? `${themeConfig.passColor}40` : `${themeConfig.failColor}40`);

//                                         const optionTextColor = isPassOption ? themeConfig.passColor : themeConfig.failColor;
//                                         const statusBgColor = isPassOption ? themeConfig.passColor : themeConfig.failColor;
//                                         return (
//                                             <div
//                                                 key={option.id}
//                                                 className={`p-4 rounded-xl border-2 transition-all duration-200 ${canMakeDecisions
//                                                     ? 'cursor-pointer hover:shadow-md hover:scale-[1.02] focus:outline-none focus:ring-2'
//                                                     : 'hover:shadow-sm hover:scale-[1.01]'
//                                                     } ${isSelected ? 'shadow-lg' : ''}`}
//                                                 style={{
//                                                     background: optionBgColor,
//                                                     borderColor: optionBorderColor,
//                                                     transform: isSelected ? 'scale(1.02)' : 'scale(1)',
//                                                     focusRingColor: themeConfig.accent
//                                                 }}
//                                                 onClick={() => handleOptionSelect(option.id)}
//                                                 onKeyDown={(e) => {
//                                                     if (e.key === 'Enter' || e.key === ' ') {
//                                                         e.preventDefault();
//                                                         handleOptionSelect(option.id);
//                                                     }
//                                                 }}
//                                                 tabIndex={canMakeDecisions ? 0 : -1}
//                                                 role="button"
//                                                 aria-pressed={isSelected}
//                                             >
//                                                 <div className="flex items-center gap-3">
//                                                     {/* Interactive/Static Checkbox */}
//                                                     <div className="flex-shrink-0">
//                                                         <div
//                                                             className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200"
//                                                             style={{
//                                                                 borderColor: optionTextColor,
//                                                                 background: isSelected
//                                                                     ? optionTextColor
//                                                                     : (isPassOption ? `${themeConfig.accent}15` : `${themeConfig.textSecondary}15`)
//                                                             }}
//                                                         >
//                                                             {isSelected ? (
//                                                                 <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
//                                                                     <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
//                                                                 </svg>
//                                                             ) : (
//                                                                 <div
//                                                                     className="w-2.5 h-2.5 rounded-sm"
//                                                                     style={{ background: optionTextColor }}
//                                                                 ></div>
//                                                             )}
//                                                         </div>
//                                                     </div>

//                                                     {/* Option Content */}
//                                                     <div className="flex-1">
//                                                         <div className="flex items-center justify-between mb-1">
//                                                             <span
//                                                                 className="font-semibold text-sm"
//                                                                 style={{ color: optionTextColor }}
//                                                             >
//                                                                 Option {optionIndex + 1}: {option.name}
//                                                             </span>

//                                                             <div className="flex items-center gap-2">
//                                                                 <span
//                                                                     className="text-xs px-3 py-1 rounded-full font-bold tracking-wide"
//                                                                     style={{
//                                                                         background: statusBgColor,
//                                                                         color: 'white',
//                                                                         boxShadow: `0 2px 8px ${statusBgColor}30`
//                                                                     }}
//                                                                 >
//                                                                     {userRole === 'SUPERVISOR'
//                                                                         ? (isPassOption ? '✓ APPROVE' : '✗ REJECT')
//                                                                         : (isPassOption ? '✓ PASS' : '✗ FAIL')
//                                                                     }
//                                                                 </span>
//                                                                 {isSelected && (
//                                                                     <span
//                                                                         className="text-xs px-2 py-1 rounded-full font-bold"
//                                                                         style={{
//                                                                             background: themeConfig.success,
//                                                                             color: 'white'
//                                                                         }}
//                                                                     >
//                                                                         SELECTED
//                                                                     </span>
//                                                                 )}
//                                                             </div>
//                                                         </div>

//                                                         {/* Option Description if available */}
//                                                         {option.description && (
//                                                             <p
//                                                                 className="text-xs mt-1 opacity-75 leading-relaxed"
//                                                                 style={{ color: optionTextColor }}
//                                                             >
//                                                                 {option.description}
//                                                             </p>
//                                                         )}
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         );
//                                     })}
//                                 </div>
//                             </div>
//                         )}

//                         {/* Decision Making Section for Active Roles */}
//                         {canMakeDecisions && (
//                             <div
//                                 className="mt-4 p-4 rounded-xl"
//                                 style={{
//                                     background: `${themeConfig.accent}08`,
//                                     border: `1px solid ${themeConfig.accent}30`
//                                 }}
//                             >
//                                 <h6
//                                     className="font-medium text-sm mb-3 flex items-center gap-2"
//                                     style={{ color: themeConfig.textPrimary }}
//                                 >
//                                     <span>💬</span>
//                                     {userRole} {userRole === 'MAKER' ? 'Submission' : 'Decision'}
//                                 </h6>

//                                 {/* MAKER specific message */}
//                                 {userRole === 'MAKER' && (
//                                     <div
//                                         className="mb-4 p-3 rounded-lg"
//                                         style={{
//                                             background: `${themeConfig.info}15`,
//                                             border: `1px solid ${themeConfig.info}40`
//                                         }}
//                                     >
//                                         <p className="text-sm" style={{ color: themeConfig.textPrimary }}>
//                                             As a MAKER, you can mark this item as completed. No option selection required -
//                                             just add remarks and submit for review.
//                                         </p>
//                                     </div>
//                                 )}

//                                 {/* CHECKER/SUPERVISOR specific message */}
//                                 {['CHECKER', 'SUPERVISOR'].includes(userRole) && !selectedOptionId && (
//                                     <div
//                                         className="mb-4 p-3 rounded-lg"
//                                         style={{
//                                             background: `${themeConfig.warning}15`,
//                                             border: `1px solid ${themeConfig.warning}40`
//                                         }}
//                                     >
//                                         <p className="text-sm" style={{ color: themeConfig.textPrimary }}>
//                                             Please select a PASS or FAIL option above before submitting your {userRole.toLowerCase()} decision.
//                                         </p>
//                                     </div>
//                                 )}

//                                 {/* Remark Input */}
//                                 <div className="mb-4">
//                                     <label
//                                         className="block text-xs font-medium mb-2"
//                                         style={{ color: themeConfig.textSecondary }}
//                                     >
//                                         Remark {userRole === 'MAKER' ? '(Optional)' : '(Optional)'}
//                                     </label>
//                                     <textarea
//                                         value={remark}
//                                         onChange={(e) => setRemark(e.target.value)}
//                                         placeholder={userRole === 'MAKER'
//                                             ? "Add your work completion notes here..."
//                                             : `Add your ${userRole.toLowerCase()} comments here...`
//                                         }
//                                         className="w-full p-3 rounded-lg border-2 text-sm"
//                                         style={{
//                                             background: themeConfig.cardBg,
//                                             borderColor: `${themeConfig.border}60`,
//                                             color: themeConfig.textPrimary,
//                                             minHeight: '80px'
//                                         }}
//                                         rows="3"
//                                     />
//                                 </div>

//                                 {/* Submit Decision Button */}
//                                 <div className="flex items-center justify-between">
//                                     <div className="flex items-center gap-2">
//                                         {userRole !== 'MAKER' && selectedOptionId && (
//                                             <span className="text-xs" style={{ color: themeConfig.textSecondary }}>
//                                                 Selected Option ID: {selectedOptionId}
//                                             </span>
//                                         )}
//                                         {userRole === 'MAKER' && (
//                                             <span className="text-xs" style={{ color: themeConfig.textSecondary }}>
//                                                 Item ID: {item.id}
//                                             </span>
//                                         )}
//                                     </div>

//                                     <button
//                                         onClick={debouncedSubmitDecision}
//                                         disabled={(userRole !== 'MAKER' && !selectedOptionId) || isSubmitting || bulkSubmitting || loadingStates.has(item.id)}
//                                         className={`
//       px-6 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform
//       ${((userRole !== 'MAKER' && !selectedOptionId) || isSubmitting || bulkSubmitting)
//                                                 ? 'opacity-50 cursor-not-allowed'
//                                                 : 'hover:scale-105 hover:shadow-lg active:scale-95'
//                                             }
//     `}

//                                         style={{
//                                             background: ((userRole !== 'MAKER' && !selectedOptionId) || isSubmitting)
//                                                 ? `${themeConfig.textSecondary}60`
//                                                 : userRole === 'MAKER'
//                                                     ? `linear-gradient(135deg, ${themeConfig.accent}, ${themeConfig.accent}dd)`
//                                                     : `linear-gradient(135deg, ${themeConfig.success}, ${themeConfig.success}dd)`,
//                                             color: 'white',
//                                             border: `2px solid ${((userRole !== 'MAKER' && !selectedOptionId) || isSubmitting)
//                                                 ? themeConfig.textSecondary
//                                                 : userRole === 'MAKER'
//                                                     ? themeConfig.accent
//                                                     : themeConfig.success}`,
//                                         }}
//                                     >
//                                         {isSubmitting ? (
//                                             <div className="flex items-center gap-2">
//                                                 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                                                 <span>Submitting...</span>
//                                             </div>
//                                         ) : (
//                                             <div className="flex items-center gap-2">
//                                                 <span>{userRole === 'MAKER' ? '✅' : '🔍'}</span>
//                                                 <span>
//                                                     {userRole === 'MAKER'
//                                                         ? 'Mark as Done'
//                                                         : `Submit ${userRole} Decision`
//                                                     }
//                                                 </span>
//                                             </div>
//                                         )}
//                                     </button>
//                                 </div>
//                             </div>
//                         )}

//                         {/* Additional Item Metadata */}
//                         <div
//                             className="mt-4 p-3 rounded-xl"
//                             style={{
//                                 background: `${themeConfig.textSecondary}08`,
//                                 border: `1px solid ${themeConfig.textSecondary}15`
//                             }}
//                         >
//                             <h6
//                                 className="font-medium text-xs mb-2 flex items-center gap-2"
//                                 style={{ color: themeConfig.textPrimary }}
//                             >
//                                 <span>ℹ️</span>
//                                 Item Details
//                             </h6>

//                             <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
//                                 <div>
//                                     <span style={{ color: themeConfig.textSecondary }}>Item ID:</span>
//                                     <span
//                                         className="ml-1 font-mono"
//                                         style={{ color: themeConfig.textPrimary }}
//                                     >
//                                         {item.id}
//                                     </span>
//                                 </div>

//                                 <div>
//                                     <span style={{ color: themeConfig.textSecondary }}>Status:</span>
//                                     <span
//                                         className="ml-1 font-medium"
//                                         style={{ color: themeConfig.textPrimary }}
//                                     >
//                                         {item.status.replace('_', ' ')}
//                                     </span>
//                                 </div>

//                                 <div>
//                                     <span style={{ color: themeConfig.textSecondary }}>Photo:</span>
//                                     <span
//                                         className="ml-1"
//                                         style={{ color: item.photo_required ? themeConfig.accent : themeConfig.textSecondary }}
//                                     >
//                                         {item.photo_required ? 'Required' : 'Optional'}
//                                     </span>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     });

//     // Handle photo upload for MAKER
//     const handleMakerPhotoUpload = (event) => {
//         const file = event.target.files[0]; // Single file only
//         if (file) {
//             const newPhoto = {
//                 file,
//                 preview: URL.createObjectURL(file),
//                 name: file.name
//             };
//             setMakerPhotos([newPhoto]); // Replace existing photo
//         }
//     };

//     // Remove photo
//     const removeMakerPhoto = (index) => {
//         setMakerPhotos(prev => prev.filter((_, i) => i !== index));
//     };

//     // Submit MAKER work
//     const handleMakerSubmit = async () => {
//         if (!selectedItemForMaker) return;

//         setSubmittingMaker(true);

//         try {
//             const token = localStorage.getItem("ACCESS_TOKEN");

//             // Create FormData for photos
//             const formData = new FormData();
//             formData.append('checklist_item_id', selectedItemForMaker.id);
//             formData.append('maker_remark', makerRemark);

//             // Add single photo
//             if (makerPhotos.length > 0) {
//                 formData.append('maker_media', makerPhotos[0].file); // Single photo as maker_media
//             }

//             console.log("📡 API CALL: MAKER Submit - Endpoint:", '/mark-as-done-maker/');
//             console.log("📡 API CALL: MAKER Submit - Item ID:", selectedItemForMaker.id);

//             const response = await checklistInstance.post(
//                 '/mark-as-done-maker/',
//                 formData,
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                         'Content-Type': 'multipart/form-data'
//                     },
//                 }
//             );

//             console.log("📡 API RESPONSE: MAKER Submit - Response:", response.data);

//             if (response.status === 200) {
//                 toast.success("✅ Work completed and submitted for review!", {
//                     duration: 4000,
//                     style: {
//                         background: themeConfig.success,
//                         color: 'white',
//                         borderRadius: '12px',
//                         padding: '16px',
//                     },
//                 });

//                 // Remove item from current tab immediately
//                 // Remove item from current tab immediately
//                 const submittedItemId = selectedItemForMaker.id;
//                 const currentDataSource = activeWorkTab === 'available-work' ? 'available_for_me' : 'assigned_to_me';

//                 setChecklistData(prev => prev.map(roomData => ({
//                     ...roomData,
//                     [currentDataSource]: roomData[currentDataSource]?.filter(item => item.id !== submittedItemId) || []
//                 })));

//                 // Close modal and reset
//                 setShowMakerModal(false);
//                 setSelectedItemForMaker(null);
//                 setMakerRemark('');
//                 setMakerPhotos([]);
//             }

//         } catch (err) {
//             console.error("❌ Failed to submit MAKER work:", err);
//             const errorMessage = err.response?.data?.detail || "Failed to submit work";

//             toast.error(`❌ ${errorMessage}`, {
//                 duration: 4000,
//                 style: {
//                     background: themeConfig.error,
//                     color: 'white',
//                     borderRadius: '12px',
//                     padding: '16px',
//                 },
//             });
//         } finally {
//             setSubmittingMaker(false);
//         }
//     };

//     const handleRoomClick = (room) => {
//         setSelectedRoom(room);
//         setShowRoomsModal(true);
//     };


//     // Tab Navigation Component for INITIALIZER
//     const TabNavigation = () => {
//         if (userRole !== 'INITIALIZER') return null;

//         return (
//             <div className="mb-6">
//                 <div
//                     className="flex gap-2 p-2 rounded-xl"
//                     style={{ background: `${themeConfig.accent}10` }}
//                 >
//                     {initializerTabs.map((tab) => (
//                         <button
//                             key={tab.key}
//                             onClick={() => handleTabSwitch(tab.key)}
//                             className={`
//                             flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg 
//                             font-medium transition-all duration-300 transform hover:scale-105
//                             ${activeTab === tab.key ? 'shadow-lg' : 'hover:shadow-md'}
//                         `}
//                             style={{
//                                 background: activeTab === tab.key
//                                     ? `linear-gradient(135deg, ${tab.color}, ${tab.color}dd)`
//                                     : `${tab.color}15`,
//                                 color: activeTab === tab.key ? 'white' : tab.color,
//                                 border: `2px solid ${activeTab === tab.key ? tab.color : 'transparent'}`
//                             }}
//                         >
//                             <span className="text-xl">{tab.icon}</span>
//                             <div className="text-left">
//                                 <div className="font-bold">{tab.label}</div>
//                                 <div className="text-xs opacity-80">{tab.description}</div>
//                                 {activeTab === tab.key && selectedForBulk.size > 0 && (
//                                     <div className="text-xs mt-1">
//                                         {selectedForBulk.size} selected
//                                     </div>
//                                 )}
//                             </div>
//                             {tabLoading[tab.key] && (
//                                 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                             )}
//                             <div
//                                 className="px-2 py-1 rounded-full text-xs font-bold"
//                                 style={{
//                                     background: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : `${tab.color}30`,
//                                     color: activeTab === tab.key ? 'white' : tab.color
//                                 }}
//                             >
//                                 {tabData[tab.key]?.reduce((count, room) =>
//                                     count + (room.checklists?.length || 0), 0
//                                 ) || 0}
//                             </div>
//                         </button>
//                     ))}
//                 </div>
//             </div>
//         );
//     };

//     // Universal Tab Navigation for Working Roles (CHECKER, MAKER, SUPERVISOR)
//     // Universal Tab Navigation for Working Roles (CHECKER, MAKER, SUPERVISOR)
//     const WorkingRoleTabNavigation = () => {
//         if (!['CHECKER', 'MAKER', 'SUPERVISOR'].includes(userRole)) return null;

//         // Role-specific tab configurations
//         const getTabsForRole = (role) => {
//             switch (role) {
//                 case 'CHECKER':
//                     return [
//                         {
//                             key: 'available-work',
//                             label: 'Pre-Screening Queue',
//                             icon: '',
//                             color: themeConfig.accent,
//                             description: 'Items pending initial inspection',
//                             dataSource: 'available_for_me'
//                         },
//                         {
//                             key: 'my-assignments',
//                             label: 'Final Review Queue',
//                             icon: '',
//                             color: themeConfig.warning,
//                             description: 'Items for final approval/rejection',
//                             dataSource: 'assigned_to_me'
//                         }
//                     ];
//                 case 'MAKER':
//                     return [
//                         {
//                             key: 'available-work',
//                             label: 'New Work Assign',
//                             icon: '🔨',
//                             color: themeConfig.accent,
//                             description: 'Fresh items requiring work',
//                             dataSource: 'available_for_me'
//                         },
//                         {
//                             key: 'my-assignments',
//                             label: 'Rework Queue',
//                             icon: '🔄',
//                             color: themeConfig.warning,
//                             description: 'Rejected items to fix',
//                             dataSource: 'assigned_to_me'
//                         }
//                     ];
//                 case 'SUPERVISOR':
//                     return [
//                         {
//                             key: 'available-work',
//                             label: 'Review Submissions',
//                             icon: '',
//                             color: themeConfig.accent,
//                             description: 'MAKER work to review',
//                             dataSource: 'available_for_me'
//                         },
//                         {
//                             key: 'my-assignments',
//                             label: 'Rework Queue',
//                             icon: '',
//                             color: themeConfig.warning,
//                             description: 'Previously reviewed items',
//                             dataSource: 'assigned_to_me'
//                         }
//                     ];
//                 default:
//                     return [];
//             }
//         };

//         const universalTabs = getTabsForRole(userRole);

//         return (
//             <div className="mb-6">
//                 <div
//                     className="flex gap-2 p-2 rounded-xl"
//                     style={{ background: `${themeConfig.accent}10` }}
//                 >
//                     {universalTabs.map((tab) => {
//                         const itemCount = checklistData.reduce((count, room) =>
//                             count + (room[tab.dataSource]?.length || 0), 0
//                         ) || 0;

//                         return (
//                             <button
//                                 key={tab.key}
//                                 onClick={() => setActiveWorkTab(tab.key)}
//                                 className={`
//                                 flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg 
//                                 font-medium transition-all duration-300 transform hover:scale-105
//                                 ${activeWorkTab === tab.key ? 'shadow-lg' : 'hover:shadow-md'}
//                             `}
//                                 style={{
//                                     background: activeWorkTab === tab.key
//                                         ? `linear-gradient(135deg, ${tab.color}, ${tab.color}dd)`
//                                         : `${tab.color}15`,
//                                     color: activeWorkTab === tab.key ? 'white' : tab.color,
//                                     border: `2px solid ${activeWorkTab === tab.key ? tab.color : 'transparent'}`
//                                 }}
//                             >
//                                 <span className="text-xl">{tab.icon}</span>
//                                 <div className="text-left">
//                                     <div className="font-bold">{tab.label}</div>
//                                     <div className="text-xs opacity-80">{tab.description}</div>
//                                 </div>
//                                 <div
//                                     className="px-2 py-1 rounded-full text-xs font-bold"
//                                     style={{
//                                         background: activeWorkTab === tab.key ? 'rgba(255,255,255,0.2)' : `${tab.color}30`,
//                                         color: activeWorkTab === tab.key ? 'white' : tab.color
//                                     }}
//                                 >
//                                     {itemCount}
//                                 </div>
//                             </button>
//                         );
//                     })}
//                 </div>
//             </div>
//         );
//     };

//     if (loading) {
//         return (
//             <div className="flex min-h-screen" style={{ background: themeConfig.pageBg }}>
//                 <SiteBarHome />
//                 <div className="ml-[220px] p-8 flex items-center justify-center">
//                     <div className="text-center">
//                         <div
//                             className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
//                             style={{ borderColor: themeConfig.accent }}
//                         ></div>
//                         <p className="text-lg" style={{ color: themeConfig.textPrimary }}>
//                             Loading inspection data...
//                         </p>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="flex min-h-screen" style={{ background: themeConfig.pageBg }}>
//                 <SiteBarHome />
//                 <div className="ml-[220px] p-8 flex items-center justify-center">
//                     <div
//                         className="border rounded-lg p-8 text-center max-w-md"
//                         style={{ background: themeConfig.cardBg, borderColor: themeConfig.border }}
//                     >
//                         <div className="text-4xl mb-4" style={{ color: themeConfig.error }}>⚠️</div>
//                         <h3 className="text-lg font-semibold mb-2" style={{ color: themeConfig.textPrimary }}>
//                             Error Loading Data
//                         </h3>
//                         <p style={{ color: themeConfig.textSecondary }}>{error}</p>
//                         <div className="flex gap-2 mt-4">
//                             <button
//                                 onClick={() => window.location.reload()}
//                                 className="px-4 py-2 rounded-lg transition-colors text-sm"
//                                 style={{
//                                     background: themeConfig.accent,
//                                     color: 'white',
//                                     border: `1px solid ${themeConfig.accent}`
//                                 }}
//                             >
//                                 Retry
//                             </button>
//                             <button
//                                 onClick={handleBack}
//                                 className="px-4 py-2 rounded-lg transition-colors text-sm"
//                                 style={{
//                                     background: themeConfig.textSecondary,
//                                     color: 'white',
//                                     border: `1px solid ${themeConfig.textSecondary}`
//                                 }}
//                             >
//                                 Go Back
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     }
//     // Get display name for current tab based on role
//     const getTabDisplayName = () => {
//         if (userRole === 'CHECKER') {
//             return activeWorkTab === 'available-work' ? 'Pre-Screening' : 'Final Review';
//         } else if (userRole === 'MAKER') {
//             return activeWorkTab === 'available-work' ? 'New Work' : 'Rework';
//         } else if (userRole === 'SUPERVISOR') {
//             return activeWorkTab === 'available-work' ? 'Review Submissions' : 'Re-Review';
//         } else if (userRole === 'INITIALIZER') {
//             return activeTab === 'ready-to-start' ? 'Assignment Queue' : 'Active Workflows';
//         }
//         return activeWorkTab === 'available-work' ? 'Available Work' : 'My Assignments';
//     };

//     // Confirmation Dialog Component
//     const ConfirmationDialog = () => {
//         if (!showConfirmDialog || !confirmDialogData) return null;

//         return (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//                 <div
//                     className="max-w-md w-full rounded-xl shadow-2xl"
//                     style={{ background: themeConfig.cardBg }}
//                 >
//                     <div className="p-6">
//                         <h3 className="text-lg font-bold mb-3" style={{ color: themeConfig.textPrimary }}>
//                             {confirmDialogData.title}
//                         </h3>
//                         <p className="text-sm mb-6" style={{ color: themeConfig.textSecondary }}>
//                             {confirmDialogData.message}
//                         </p>

//                         <div className="flex items-center justify-end gap-3">
//                             <button
//                                 onClick={() => setShowConfirmDialog(false)}
//                                 className="px-4 py-2 rounded-lg font-medium text-sm transition-all"
//                                 style={{
//                                     background: themeConfig.textSecondary,
//                                     color: 'white'
//                                 }}
//                             >
//                                 Cancel
//                             </button>

//                             <button
//                                 onClick={() => {
//                                     setShowConfirmDialog(false);
//                                     confirmDialogData.onConfirm();
//                                 }}
//                                 className="px-4 py-2 rounded-lg font-medium text-sm transition-all transform hover:scale-105"
//                                 style={{
//                                     background: confirmDialogData.confirmColor,
//                                     color: 'white',
//                                     border: `2px solid ${confirmDialogData.confirmColor}`
//                                 }}
//                             >
//                                 {confirmDialogData.confirmText}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     };

//     // Add before return statement
//     const getTabProgress = () => {
//         if (userRole === 'INITIALIZER') {
//             const currentTabData = tabData[activeTab] || [];
//             const totalItems = currentTabData.reduce((count, room) =>
//                 count + (room.checklists?.length || 0), 0
//             );
//             const selectedCount = selectedForBulk.size;
//             return { total: totalItems, selected: selectedCount };
//         } else if (['CHECKER', 'MAKER', 'SUPERVISOR'].includes(userRole)) {
//             const currentDataSource = activeWorkTab === 'available-work' ? 'available_for_me' : 'assigned_to_me';
//             const totalItems = checklistData.reduce((count, room) => {
//                 if (userRole === 'MAKER') {
//                     return count + (room[currentDataSource]?.length || 0);
//                 } else {
//                     return count + (room[currentDataSource]?.reduce((itemCount, checklist) =>
//                         itemCount + (checklist.items?.length || 0), 0) || 0);
//                 }
//             }, 0);
//             const selectedCount = selectedItemsForBulk.size;
//             return { total: totalItems, selected: selectedCount };
//         }
//         return { total: 0, selected: 0 };
//     };

//     // Add before return statement
//     const Tooltip = ({ children, text, position = 'top' }) => {
//         const [showTooltip, setShowTooltip] = useState(false);

//         return (
//             <div
//                 className="relative inline-block"
//                 onMouseEnter={() => setShowTooltip(true)}
//                 onMouseLeave={() => setShowTooltip(false)}
//             >
//                 {children}
//                 {showTooltip && (
//                     <div
//                         className={`absolute z-50 px-3 py-2 text-sm rounded-lg shadow-lg ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
//                             } left-1/2 transform -translate-x-1/2 whitespace-nowrap`}
//                         style={{
//                             background: themeConfig.textPrimary,
//                             color: themeConfig.cardBg
//                         }}
//                     >
//                         {text}
//                         <div
//                             className={`absolute left-1/2 transform -translate-x-1/2 ${position === 'top' ? 'top-full' : 'bottom-full'
//                                 }`}
//                             style={{
//                                 borderLeft: '5px solid transparent',
//                                 borderRight: '5px solid transparent',
//                                 borderTop: position === 'top' ? `5px solid ${themeConfig.textPrimary}` : 'none',
//                                 borderBottom: position === 'bottom' ? `5px solid ${themeConfig.textPrimary}` : 'none'
//                             }}
//                         />
//                     </div>
//                 )}
//             </div>
//         );
//     };

//     return (
//         <div className="flex min-h-screen" style={{ background: themeConfig.pageBg }}>
//             <SiteBarHome />
//             <main className="flex-1 ml-[220px] py-6 px-6 w-full min-w-0">
//                 {/* Header Section */}
//                 <div
//                     className="border rounded-xl p-6 mb-6 shadow-lg"
//                     style={{ background: themeConfig.cardBg, borderColor: themeConfig.border }}
//                 >
//                     <div className="flex items-center justify-between mb-4">
//                         <div>
//                             <h1 className="text-2xl font-bold mb-2" style={{ color: themeConfig.accent }}>
//                                 Unit {flatNumber} - {userRole === 'MAKER' ? 'Work Interface' : `${userRole || 'Loading...'} DASHBOARD`}                        </h1>
//                             <div className="flex items-center gap-4 text-sm">
//                                 <span style={{ color: themeConfig.textSecondary }}>Type: {flatType || "N/A"}</span>
//                                 <span style={{ color: themeConfig.textSecondary }}>Unit ID: {flatId}</span>
//                                 {/* <span style={{ color: themeConfig.textSecondary }}>Project ID: {projectId}</span> */}
//                             </div>
//                         </div>
//                         <div className="flex gap-2">
//                             {rooms.length > 0 && (
//                                 <button
//                                     onClick={() => setShowRoomsModal(true)}
//                                     disabled={roomsLoading}
//                                     className="px-4 py-2 rounded-lg transition-colors text-sm"
//                                     style={{
//                                         background: themeConfig.accent,
//                                         color: 'white',
//                                         border: `1px solid ${themeConfig.accent}`
//                                     }}
//                                 >
//                                     {roomsLoading ? "Loading..." : "View Rooms"}
//                                 </button>
//                             )}
//                             <button
//                                 onClick={handleBack}
//                                 className="px-4 py-2 rounded-lg transition-colors text-sm"
//                                 style={{
//                                     background: themeConfig.textSecondary,
//                                     color: 'white',
//                                     border: `1px solid ${themeConfig.textSecondary}`
//                                 }}
//                             >
//                                 ← Back
//                             </button>
//                         </div>
//                     </div>

//                     {/* TEMPORARY ROLE DEBUG - Remove in production */}
//                     {userRole && (
//                         <div
//                             className="mb-4 p-3 rounded-lg"
//                             style={{
//                                 background: `${themeConfig.info}20`,
//                                 border: `1px solid ${themeConfig.info}`,
//                                 color: themeConfig.textPrimary
//                             }}
//                         >
//                             <div className="text-sm">
//                                 <strong>Active Role:</strong> {userRole}
//                                 {/* <strong> API Endpoint:</strong> /initializer-accessible-checklists/ (Role: {userRole}) */}
//                             </div>
//                         </div>
//                     )}
//                 </div>

//                 {/* Tab Navigation for INITIALIZER */}
//                 <TabNavigation />

//                 <WorkingRoleTabNavigation />

//                 {/* Bulk Action Bar - moved after tabs */}
//                 {getBulkActionBar()}

//                 {/* Room-wise Checklists Section */}
//                 <div
//                     className="border rounded-xl p-6 shadow-lg"
//                     style={{ background: themeConfig.cardBg, borderColor: themeConfig.border }}
//                 >
//                     <h2 className="text-xl font-semibold mb-4" style={{ color: themeConfig.textPrimary }}>
//                         Room Inspection Checklists
//                     </h2>

//                     {userRole === 'INITIALIZER' ? (
//                         // INITIALIZER Tab-based rendering
//                         tabData[activeTab]?.length === 0 ? (
//                             <div className="text-center py-12">
//                                 <div className="text-6xl mb-4">
//                                     {initializerTabs.find(tab => tab.key === activeTab)?.icon}
//                                 </div>
//                                 <h3 className="text-lg font-semibold mb-2" style={{ color: themeConfig.textPrimary }}>
//                                     No {initializerTabs.find(tab => tab.key === activeTab)?.label}
//                                 </h3>
//                                 <p style={{ color: themeConfig.textSecondary }}>
//                                     {initializerTabs.find(tab => tab.key === activeTab)?.description}
//                                 </p>
//                             </div>
//                         ) : (
//                             <div className="space-y-6">
//                                 {tabData[activeTab]?.map((roomData, index) => {
//                                     const roomDetail = rooms.find((r) => r.id === roomData.room_id);
//                                     const roomKey = roomData.room_id || index;
//                                     const firstChecklist = roomData.checklists?.[0];

//                                     // Enhanced room name logic for INITIALIZER
//                                     const roomName = roomDetail?.rooms ||                    // From fetched room details API
//                                         roomDetail?.name ||                      // Alternative field name
//                                         firstChecklist?.room_details?.rooms ||   // From checklist data
//                                         firstChecklist?.room_details?.name ||    // Alternative field name in checklist
//                                         roomData.room_details?.rooms ||          // From room data
//                                         roomData.room_details?.name ||           // Alternative field name in room data
//                                         `Room ${roomData.room_id}` ||            // Fallback with ID
//                                         "Unknown Room";                          // Final fallback

//                                     const allChecklists = roomData.checklists || [];

//                                     console.log(`🏠 INITIALIZER Room Debug - ID: ${roomData.room_id}, Name: ${roomName}`);
//                                     console.log(`🏠 INITIALIZER Room Detail:`, roomDetail);
//                                     console.log(`🏠 INITIALIZER First Checklist Room Details:`, firstChecklist?.room_details);

//                                     return (
//                                         <RoomSection
//                                             key={roomKey}
//                                             roomName={roomName}
//                                             roomId={roomData.room_id}
//                                             checklists={allChecklists}
//                                             userRole={userRole}
//                                             themeConfig={themeConfig}
//                                             roomDetail={roomDetail}
//                                             handleRoomClick={handleRoomClick}
//                                         />
//                                     );
//                                 })}
//                             </div>
//                         )
//                     ) : ['CHECKER', 'MAKER', 'SUPERVISOR'].includes(userRole) ? (
//                         // Universal Working Roles Tab-based rendering
//                         checklistData.length === 0 ? (
//                             <div className="text-center py-12">
//                                 <div className="text-6xl mb-4">
//                                     {userRole === 'CHECKER' ? '🔍' : userRole === 'MAKER' ? '🔨' : '👀'}
//                                 </div>
//                                 <h3 className="text-lg font-semibold mb-2" style={{ color: themeConfig.textPrimary }}>
//                                     {userRole === 'CHECKER' && activeWorkTab === 'available-work' && 'No Items for Pre-Screening'}
//                                     {userRole === 'CHECKER' && activeWorkTab === 'my-assignments' && 'No Items for Final Review'}
//                                     {userRole === 'MAKER' && activeWorkTab === 'available-work' && 'No New Work Orders'}
//                                     {userRole === 'MAKER' && activeWorkTab === 'my-assignments' && 'No Rework Items'}
//                                     {userRole === 'SUPERVISOR' && activeWorkTab === 'available-work' && 'No Submissions to Review'}
//                                     {userRole === 'SUPERVISOR' && activeWorkTab === 'my-assignments' && 'No Items for Re-Review'}
//                                 </h3>
//                                 <p style={{ color: themeConfig.textSecondary }}>
//                                     {userRole === 'CHECKER' && activeWorkTab === 'available-work' && 'New items will appear here after INITIALIZER assigns them'}
//                                     {userRole === 'CHECKER' && activeWorkTab === 'my-assignments' && 'Items will appear here after SUPERVISOR approves MAKER work'}
//                                     {userRole === 'MAKER' && activeWorkTab === 'available-work' && 'New work will appear here when CHECKER marks items as requiring work'}
//                                     {userRole === 'MAKER' && activeWorkTab === 'my-assignments' && 'Rejected items will appear here for rework'}
//                                     {userRole === 'SUPERVISOR' && activeWorkTab === 'available-work' && 'MAKER submissions will appear here for your review'}
//                                     {userRole === 'SUPERVISOR' && activeWorkTab === 'my-assignments' && 'Previously reviewed items will appear here'}
//                                 </p>
//                             </div>
//                         ) : (
//                             <div className="space-y-6">
//                                 {checklistData.map((roomData, index) => {
//                                     const roomDetail = rooms.find((r) => r.id === roomData.room_id);
//                                     const roomKey = roomData.room_id || index;

//                                     // Priority order for room name
//                                     const roomName = roomDetail?.rooms ||           // From fetched room details
//                                         roomData.room_details?.rooms ||  // From API response
//                                         roomDetail?.name ||              // Alternative field name
//                                         roomData.room_details?.name ||   // Alternative field name
//                                         `Room ${roomData.room_id}` ||    // Fallback with ID
//                                         "Unknown Room";                  // Final fallback
//                                     // Get items based on active tab
//                                     const currentTabDataSource = activeWorkTab === 'available-work' ? 'available_for_me' : 'assigned_to_me';
//                                     const roomItems = roomData[currentTabDataSource] || [];

//                                     // Skip room if no items for current tab
//                                     if (roomItems.length === 0) return null;

//                                     return (
//                                         <div key={roomKey} className="border rounded-lg p-4 mb-4" style={{ borderColor: themeConfig.border }}>
//                                             {/* Room Header */}
//                                             {/* Room Header with Room-Level Actions */}
//                                             <div className="flex items-center justify-between mb-4">
//                                                 {/* Left side - Room info */}
//                                                 <div className="flex items-center gap-3">
//                                                     <div
//                                                         className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
//                                                         style={{
//                                                             background: `linear-gradient(135deg, ${themeConfig.accent}, ${themeConfig.accent}dd)`,
//                                                         }}
//                                                     >
//                                                         {roomName.charAt(0).toUpperCase()}
//                                                     </div>
//                                                     <div>
//                                                         <h3 className="text-xl font-bold" style={{ color: themeConfig.textPrimary }}>
//                                                             {roomName.toUpperCase()}
//                                                         </h3>
//                                                         <p className="text-sm" style={{ color: themeConfig.textSecondary }}>
//                                                             {roomItems.length} item{roomItems.length !== 1 ? "s" : ""} • {getTabDisplayName()}
//                                                             {roomData.room_id && ` • Room ID: ${roomData.room_id}`}
//                                                         </p>
//                                                     </div>
//                                                 </div>

//                                                 {/* Right side - Room-Level Actions for CHECKER and SUPERVISOR */}
//                                                 {(['CHECKER', 'SUPERVISOR'].includes(userRole)) && (
//                                                     <div className="flex items-center gap-3">
//                                                         {/* Room Select All Button */}
//                                                         <button
//                                                             onClick={() => {
//                                                                 const roomItemIds = roomItems.flatMap(checklist =>
//                                                                     checklist.items?.map(item => item.id) || []
//                                                                 );

//                                                                 const roomItemsSelected = roomItemIds.filter(id => selectedItemsForBulk.has(id));
//                                                                 const allRoomItemsSelected = roomItemIds.length > 0 && roomItemsSelected.length === roomItemIds.length;

//                                                                 if (allRoomItemsSelected) {
//                                                                     // Unselect only items from this room
//                                                                     setSelectedItemsForBulk(prev => {
//                                                                         const newSet = new Set(prev);
//                                                                         roomItemIds.forEach(id => newSet.delete(id));
//                                                                         return newSet;
//                                                                     });
//                                                                 } else {
//                                                                     // Select only items from this room (add to existing selection)
//                                                                     setSelectedItemsForBulk(prev => {
//                                                                         const newSet = new Set(prev);
//                                                                         roomItemIds.forEach(id => newSet.add(id));
//                                                                         return newSet;
//                                                                     });
//                                                                 }
//                                                             }}
//                                                             className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105"
//                                                             style={{
//                                                                 background: `${themeConfig.accent}15`,
//                                                                 color: themeConfig.accent,
//                                                                 border: `2px solid ${themeConfig.accent}30`
//                                                             }}
//                                                         >
//                                                             <input
//                                                                 type="checkbox"
//                                                                 checked={(() => {
//                                                                     const currentDataSource = activeWorkTab === 'available-work' ? 'available_for_me' : 'assigned_to_me';
//                                                                     const roomItemIds = roomItems.flatMap(checklist =>
//                                                                         checklist.items?.map(item => item.id) || []
//                                                                     );
//                                                                     return roomItemIds.length > 0 && roomItemIds.every(id => selectedItemsForBulk.has(id));
//                                                                 })()}
//                                                                 readOnly
//                                                                 className="w-4 h-4 rounded border-2"
//                                                                 style={{
//                                                                     accentColor: themeConfig.accent,
//                                                                     borderColor: themeConfig.border
//                                                                 }}
//                                                             />
//                                                             <span>Select All in {roomName} ({roomItems.flatMap(checklist => checklist.items || []).length})</span>
//                                                         </button>

//                                                         {/* Room-Level Action Buttons */}
//                                                         {(() => {
//                                                             const currentDataSource = activeWorkTab === 'available-work' ? 'available_for_me' : 'assigned_to_me';
//                                                             const roomItemIds = roomItems.flatMap(checklist =>
//                                                                 checklist.items?.map(item => item.id) || []
//                                                             );
//                                                             const selectedInRoom = roomItemIds.filter(id => selectedItemsForBulk.has(id));

//                                                             return selectedInRoom.length > 0 && (
//                                                                 <>
//                                                                     {/* PASS/APPROVE Button */}
//                                                                     <button
//                                                                         onClick={() => handleBulkDecision('pass')}
//                                                                         disabled={bulkSubmitting}
//                                                                         className="px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105"
//                                                                         style={{
//                                                                             background: `linear-gradient(135deg, ${themeConfig.passColor}, ${themeConfig.passColor}dd)`,
//                                                                             color: 'white',
//                                                                             border: `2px solid ${themeConfig.passColor}`,
//                                                                         }}
//                                                                     >
//                                                                         <div className="flex items-center gap-2">
//                                                                             <span>✅</span>
//                                                                             <span>{userRole === 'CHECKER' ? 'PASS' : 'APPROVE'} {roomName} ({selectedInRoom.length})</span>
//                                                                         </div>
//                                                                     </button>

//                                                                     {/* FAIL/REJECT Button */}
//                                                                     <button
//                                                                         onClick={() => handleBulkDecision('fail')}
//                                                                         disabled={bulkSubmitting}
//                                                                         className="px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105"
//                                                                         style={{
//                                                                             background: `linear-gradient(135deg, ${themeConfig.failColor}, ${themeConfig.failColor}dd)`,
//                                                                             color: 'white',
//                                                                             border: `2px solid ${themeConfig.failColor}`,
//                                                                         }}
//                                                                     >
//                                                                         <div className="flex items-center gap-2">
//                                                                             <span>❌</span>
//                                                                             <span>{userRole === 'CHECKER' ? 'FAIL' : 'REJECT'} {roomName} ({selectedInRoom.length})</span>
//                                                                         </div>
//                                                                     </button>
//                                                                 </>
//                                                             );
//                                                         })()}
//                                                     </div>
//                                                 )}
//                                             </div>
//                                             {/* Items List */}
//                                             <div className="space-y-4">
//                                                 {userRole === 'MAKER' ? (
//                                                     roomItems.map((item) => (
//                                                         <MakerItemCard
//                                                             key={item.id}
//                                                             item={item}
//                                                             userRole={userRole}
//                                                             themeConfig={themeConfig}
//                                                         />
//                                                     ))
//                                                 ) : (
//                                                     roomItems.map((checklist) => (
//                                                         <ChecklistCard
//                                                             key={checklist.id}
//                                                             checklist={checklist}
//                                                             userRole={userRole}
//                                                             themeConfig={themeConfig}
//                                                         />
//                                                     ))
//                                                 )}
//                                             </div>
//                                         </div>
//                                     );
//                                 })}
//                             </div>
//                         )
//                     ) : (
//                         // Fallback for other roles
//                         checklistData.length === 0 ? (
//                             <div className="text-center py-12">
//                                 <div className="text-6xl mb-4">📋</div>
//                                 <h3 className="text-lg font-semibold mb-2" style={{ color: themeConfig.textPrimary }}>
//                                     No Checklists Found
//                                 </h3>
//                                 <p style={{ color: themeConfig.textSecondary }}>
//                                     No inspection checklists are available for this unit.
//                                 </p>
//                             </div>
//                         ) : (
//                             <div className="space-y-6">
//                                 {checklistData.map((roomData, index) => {
//                                     const roomDetail = rooms.find((r) => r.id === roomData.room_id);
//                                     let allChecklists = [];
//                                     let roomKey = roomData.room_id || index;
//                                     let roomName = "Unknown Room";

//                                     allChecklists = [
//                                         ...(roomData.assigned_to_me || []),
//                                         ...(roomData.available_for_me || []),
//                                         ...(roomData.pending_for_me || [])
//                                     ];
//                                     roomName = roomDetail?.rooms || `Room ${roomData.room_id}` || "MASTER";

//                                     return (
//                                         <RoomSection
//                                             key={roomKey}
//                                             roomName={roomName}
//                                             roomId={roomData.room_id}
//                                             checklists={allChecklists}
//                                             userRole={userRole}
//                                             themeConfig={themeConfig}
//                                             roomDetail={roomDetail}
//                                             handleRoomClick={handleRoomClick}
//                                         />
//                                     );
//                                 })}
//                             </div>
//                         )
//                     )}
//                 </div>

//                 {/* Footer */}
//                 <div className="mt-6 text-center">
//                     <p className="text-sm" style={{ color: themeConfig.textSecondary }}>
//                         Last updated: {new Date().toLocaleString()}
//                     </p>
//                 </div>
//             </main>
//             {/* MAKER Work Modal */}
//             {showMakerModal && selectedItemForMaker && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//                     <div
//                         className="max-w-4xl w-full max-h-[90vh] mx-4 overflow-y-auto rounded-xl shadow-2xl"
//                         style={{ background: themeConfig.cardBg }}
//                     >
//                         {/* Modal Header */}
//                         <div
//                             className="sticky top-0 p-6 border-b"
//                             style={{
//                                 background: themeConfig.headerBg,
//                                 borderColor: themeConfig.border
//                             }}
//                         >
//                             <div className="flex items-center justify-between">
//                                 <div>
//                                     <h3 className="text-xl font-bold" style={{ color: themeConfig.textPrimary }}>
//                                         Complete Work Item
//                                     </h3>
//                                     <p className="text-sm mt-1" style={{ color: themeConfig.textSecondary }}>
//                                         {selectedItemForMaker.title}
//                                     </p>
//                                 </div>
//                                 <button
//                                     onClick={() => setShowMakerModal(false)}
//                                     className="p-2 rounded-lg hover:bg-opacity-80 transition-all"
//                                     style={{ background: `${themeConfig.error}20`, color: themeConfig.error }}
//                                 >
//                                     ✕
//                                 </button>
//                             </div>
//                         </div>

//                         <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
//                             {/* Previous Remarks */}
//                             <div
//                                 className="p-4 rounded-xl"
//                                 style={{ background: `${themeConfig.warning}10`, border: `1px solid ${themeConfig.warning}30` }}
//                             >
//                                 <h4 className="font-medium mb-3" style={{ color: themeConfig.textPrimary }}>
//                                     💬 Previous Remarks
//                                 </h4>

//                                 {selectedItemForMaker.submissions && selectedItemForMaker.submissions.length > 0 ? (
//                                     <div className="space-y-3">
//                                         {selectedItemForMaker.submissions.map((submission, index) => (
//                                             <div
//                                                 key={index}
//                                                 className="p-3 rounded-lg"
//                                                 style={{ background: themeConfig.cardBg, border: `1px solid ${themeConfig.border}` }}
//                                             >
//                                                 <div className="flex items-center gap-2 mb-2">
//                                                     <span className="text-xs px-2 py-1 rounded-full" style={{
//                                                         background: `${themeConfig.info}20`,
//                                                         color: themeConfig.info
//                                                     }}>
//                                                         {submission.role?.toUpperCase() || 'REVIEWER'}
//                                                     </span>
//                                                     <span className="text-xs" style={{ color: themeConfig.textSecondary }}>
//                                                         {submission.created_at ? new Date(submission.created_at).toLocaleString() : 'Unknown time'}
//                                                     </span>
//                                                 </div>
//                                                 <p className="text-sm" style={{ color: themeConfig.textPrimary }}>
//                                                     {submission.remark || submission.check_remark || "No remarks provided"}
//                                                 </p>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 ) : (
//                                     <p className="text-sm" style={{ color: themeConfig.textSecondary }}>
//                                         No previous remarks available
//                                     </p>
//                                 )}
//                             </div>

//                             {/* MAKER's Work Section */}
//                             <div
//                                 className="p-4 rounded-xl"
//                                 style={{ background: `${themeConfig.success}10`, border: `1px solid ${themeConfig.success}30` }}
//                             >
//                                 <h4 className="font-medium mb-4" style={{ color: themeConfig.textPrimary }}>
//                                     🔧 Your Work Completion
//                                 </h4>

//                                 {/* MAKER Remark */}
//                                 <div className="mb-4">
//                                     <label className="block text-sm font-medium mb-2" style={{ color: themeConfig.textPrimary }}>
//                                         Work Completion Remarks
//                                     </label>
//                                     <textarea
//                                         value={makerRemark}
//                                         onChange={(e) => setMakerRemark(e.target.value)}
//                                         placeholder="Describe the work completed, any issues faced, or additional notes..."
//                                         className="w-full p-3 rounded-lg border-2 text-sm"
//                                         style={{
//                                             background: themeConfig.cardBg,
//                                             borderColor: `${themeConfig.border}60`,
//                                             color: themeConfig.textPrimary,
//                                             minHeight: '100px'
//                                         }}
//                                         rows="4"
//                                     />
//                                 </div>

//                                 {/* Photo Upload */}
//                                 <div className="mb-4">
//                                     <label className="block text-sm font-medium mb-2" style={{ color: themeConfig.textPrimary }}>
//                                         Upload Work Photos
//                                     </label>
//                                     <input
//                                         type="file"
//                                         multiple
//                                         accept="image/*"
//                                         onChange={handleMakerPhotoUpload}
//                                         className="w-full p-3 rounded-lg border-2 text-sm"
//                                         style={{
//                                             background: themeConfig.cardBg,
//                                             borderColor: `${themeConfig.border}60`,
//                                             color: themeConfig.textPrimary
//                                         }}
//                                     />
//                                 </div>

//                                 {/* Photo Previews */}
//                                 {makerPhotos.length > 0 && (
//                                     <div className="mb-4">
//                                         <h5 className="text-sm font-medium mb-2" style={{ color: themeConfig.textPrimary }}>
//                                             Photo Preview
//                                         </h5>
//                                         <div className="max-w-sm">                                            {makerPhotos.map((photo, index) => (
//                                             <div key={index} className="relative group">
//                                                 <img
//                                                     src={photo.preview}
//                                                     alt={`Upload preview ${index + 1}`}
//                                                     className="w-full h-32 object-cover rounded-lg"
//                                                 />
//                                                 <button
//                                                     onClick={() => removeMakerPhoto(index)}
//                                                     className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-all"
//                                                     style={{ background: themeConfig.error }}
//                                                 >
//                                                     ✕
//                                                 </button>
//                                             </div>
//                                         ))}
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>

//                             {/* Submit Button */}
//                             {/* Submit Button - Role-based Actions */}
//                             <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: themeConfig.border }}>
//                                 <button
//                                     onClick={() => setShowMakerModal(false)}
//                                     className="px-6 py-2 rounded-lg font-medium text-sm transition-all"
//                                     style={{
//                                         background: themeConfig.textSecondary,
//                                         color: 'white'
//                                     }}
//                                 >
//                                     Cancel
//                                 </button>

//                                 {/* SUPERVISOR Actions */}
//                                 {/* SUPERVISOR Actions */}
//                                 {userRole === 'SUPERVISOR' && (
//                                     <>
//                                         <button
//                                             onClick={async () => {
//                                                 // SUPERVISOR REJECT - Call same API as CHECKER but with role: supervisor
//                                                 setSubmittingMaker(true);
//                                                 try {
//                                                     const token = localStorage.getItem("ACCESS_TOKEN");

//                                                     // Use a FAIL option (choice: "N") for rejection
//                                                     const failOption = selectedItemForMaker.options?.find(opt => opt.choice === "N");
//                                                     if (!failOption) {
//                                                         toast.error("No FAIL option found for rejection");
//                                                         return;
//                                                     }

//                                                     const payload = {
//                                                         checklist_item_id: selectedItemForMaker.id,
//                                                         role: "supervisor",
//                                                         option_id: failOption.id,
//                                                         check_remark: makerRemark || "Rejected by supervisor"
//                                                     };

//                                                     console.log("📡 API CALL: SUPERVISOR REJECT - Payload:", payload);

//                                                     const response = await checklistInstance.patch(
//                                                         '/Decsion-makeing-forSuer-Inspector/',
//                                                         payload,
//                                                         {
//                                                             headers: { Authorization: `Bearer ${token}` },
//                                                         }
//                                                     );

//                                                     console.log("📡 API RESPONSE: SUPERVISOR REJECT - Response:", response.data);

//                                                     if (response.status === 200) {
//                                                         toast.success("✅ Work rejected and sent back to MAKER!", {
//                                                             duration: 4000,
//                                                             style: {
//                                                                 background: themeConfig.error,
//                                                                 color: 'white',
//                                                                 borderRadius: '12px',
//                                                                 padding: '16px',
//                                                             },
//                                                         });

//                                                         // Remove item from current view and refresh data
//                                                         const rejectedItemId = selectedItemForMaker.id;
//                                                         const currentDataSource = activeWorkTab === 'available-work' ? 'available_for_me' : 'assigned_to_me';

//                                                         setChecklistData(prev => prev.map(roomData => ({
//                                                             ...roomData,
//                                                             [currentDataSource]: roomData[currentDataSource]?.map(checklist => ({
//                                                                 ...checklist,
//                                                                 items: checklist.items?.filter(item => item.id !== rejectedItemId) || []
//                                                             })) || []
//                                                         })));

//                                                         setShowMakerModal(false);
//                                                         setMakerRemark('');
//                                                     }
//                                                 } catch (err) {
//                                                     console.error("❌ Failed SUPERVISOR reject:", err);
//                                                     const errorMessage = err.response?.data?.detail || "Failed to reject work";
//                                                     toast.error(`❌ ${errorMessage}`, {
//                                                         style: { background: themeConfig.error, color: 'white', borderRadius: '12px' }
//                                                     });
//                                                 } finally {
//                                                     setSubmittingMaker(false);
//                                                 }
//                                             }}
//                                             disabled={submittingMaker}
//                                             className="px-6 py-3 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105"
//                                             style={{
//                                                 background: `linear-gradient(135deg, ${themeConfig.error}, ${themeConfig.error}dd)`,
//                                                 color: 'white',
//                                                 border: `2px solid ${themeConfig.error}`,
//                                             }}
//                                         >
//                                             <div className="flex items-center gap-2">
//                                                 <span>❌</span>
//                                                 <span>Reject & Return to MAKER</span>
//                                             </div>
//                                         </button>

//                                         <button
//                                             onClick={async () => {
//                                                 // SUPERVISOR APPROVE - Call same API as CHECKER but with role: supervisor
//                                                 setSubmittingMaker(true);
//                                                 try {
//                                                     const token = localStorage.getItem("ACCESS_TOKEN");

//                                                     // Use a PASS option (choice: "P") for approval
//                                                     const passOption = selectedItemForMaker.options?.find(opt => opt.choice === "P");
//                                                     if (!passOption) {
//                                                         toast.error("No PASS option found for approval");
//                                                         return;
//                                                     }

//                                                     const payload = {
//                                                         checklist_item_id: selectedItemForMaker.id,
//                                                         role: "supervisor",
//                                                         option_id: passOption.id,
//                                                         check_remark: makerRemark || "Approved by supervisor"
//                                                     };

//                                                     console.log("📡 API CALL: SUPERVISOR APPROVE - Payload:", payload);

//                                                     const response = await checklistInstance.patch(
//                                                         '/Decsion-makeing-forSuer-Inspector/',
//                                                         payload,
//                                                         {
//                                                             headers: { Authorization: `Bearer ${token}` },
//                                                         }
//                                                     );

//                                                     console.log("📡 API RESPONSE: SUPERVISOR APPROVE - Response:", response.data);

//                                                     if (response.status === 200) {
//                                                         toast.success("✅ Work approved and sent to CHECKER!", {
//                                                             duration: 4000,
//                                                             style: {
//                                                                 background: themeConfig.success,
//                                                                 color: 'white',
//                                                                 borderRadius: '12px',
//                                                                 padding: '16px',
//                                                             },
//                                                         });

//                                                         // Remove item from current view and refresh data
//                                                         const approvedItemId = selectedItemForMaker.id;
//                                                         const currentDataSource = activeWorkTab === 'available-work' ? 'available_for_me' : 'assigned_to_me';

//                                                         setChecklistData(prev => prev.map(roomData => ({
//                                                             ...roomData,
//                                                             [currentDataSource]: roomData[currentDataSource]?.map(checklist => ({
//                                                                 ...checklist,
//                                                                 items: checklist.items?.filter(item => item.id !== approvedItemId) || []
//                                                             })) || []
//                                                         })));

//                                                         setShowMakerModal(false);
//                                                         setMakerRemark('');

//                                                         // Refresh data to ensure correct tab placement
//                                                         setTimeout(async () => {
//                                                             try {
//                                                                 const token = localStorage.getItem("ACCESS_TOKEN");
//                                                                 const apiUrl = '/Transafer-Rule-getchchklist/';
//                                                                 const params = { project_id: projectId, flat_id: flatId };

//                                                                 const response = await checklistInstance.get(apiUrl, {
//                                                                     params: params,
//                                                                     headers: {
//                                                                         Authorization: `Bearer ${token}`,
//                                                                         "Content-Type": "application/json",
//                                                                     },
//                                                                     timeout: 10000,
//                                                                 });

//                                                                 if (response.status === 200) {
//                                                                     const responseData = response.data || {};
//                                                                     let data = responseData.results || responseData || [];
//                                                                     if (!Array.isArray(data)) data = [data];
//                                                                     setChecklistData(data);
//                                                                 }
//                                                             } catch (err) {
//                                                                 console.error("❌ Failed to refresh data:", err);
//                                                             }
//                                                         }, 1000);
//                                                     }
//                                                 } catch (err) {
//                                                     console.error("❌ Failed SUPERVISOR approve:", err);
//                                                     const errorMessage = err.response?.data?.detail || "Failed to approve work";
//                                                     toast.error(`❌ ${errorMessage}`, {
//                                                         style: { background: themeConfig.error, color: 'white', borderRadius: '12px' }
//                                                     });
//                                                 } finally {
//                                                     setSubmittingMaker(false);
//                                                 }
//                                             }}
//                                             disabled={submittingMaker}
//                                             className="px-6 py-3 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105"
//                                             style={{
//                                                 background: `linear-gradient(135deg, ${themeConfig.success}, ${themeConfig.success}dd)`,
//                                                 color: 'white',
//                                                 border: `2px solid ${themeConfig.success}`,
//                                             }}
//                                         >
//                                             <div className="flex items-center gap-2">
//                                                 <span>✅</span>
//                                                 <span>Approve to CHECKER</span>
//                                             </div>
//                                         </button>
//                                     </>
//                                 )}


//                                 {/* MAKER Actions */}
//                                 {userRole === 'MAKER' && (
//                                     <button
//                                         onClick={handleMakerSubmit}
//                                         disabled={submittingMaker}
//                                         className={`
//         px-6 py-3 rounded-lg font-medium text-sm transition-all duration-300 transform
//         ${submittingMaker
//                                                 ? 'opacity-75 cursor-not-allowed scale-95'
//                                                 : 'hover:scale-105 hover:shadow-lg active:scale-95'
//                                             }
//       `}
//                                         style={{
//                                             background: submittingMaker
//                                                 ? `${themeConfig.success}80`
//                                                 : `linear-gradient(135deg, ${themeConfig.success}, ${themeConfig.success}dd)`,
//                                             color: 'white',
//                                             border: `2px solid ${themeConfig.success}`,
//                                         }}
//                                     >
//                                         {submittingMaker ? (
//                                             <div className="flex items-center gap-2">
//                                                 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                                                 <span>Submitting Work...</span>
//                                             </div>
//                                         ) : (
//                                             <div className="flex items-center gap-2">
//                                                 <span>✅</span>
//                                                 <span>Submit Completed Work</span>
//                                             </div>
//                                         )}
//                                     </button>
//                                 )}
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}
//             <HistoryModal />
//             <ConfirmationDialog />
//         </div>
//     );
// };

// const WrappedFlatInspectionPage = () => {
//     const { theme } = useTheme();
//     return (
//         <ErrorBoundary theme={{ pageBg: theme === "dark" ? "#191922" : "#fcfaf7" }}>
//             <FlatInspectionPage />
//         </ErrorBoundary>
//     );
// };

// export default WrappedFlatInspectionPage;




import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
// import SiteBarHome from "./SiteBarHome";
import { useTheme } from "../ThemeContext";
import axios from "axios";
import toast from "react-hot-toast";
import { checklistInstance, projectInstance } from '../api/axiosInstance';

// Add after imports, before getCurrentUserRole
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('FlatInspectionPage Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen items-center justify-center" style={{ background: this.props.theme?.pageBg || '#fcfaf7' }}>
                    <div className="text-center p-8 max-w-md">
                        <div className="text-6xl mb-4">⚠️</div>
                        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
                        <p className="text-gray-600 mb-4">
                            An unexpected error occurred. Please refresh the page or contact support.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Helper function to get current user role
const getCurrentUserRole = () => {
    try {
        const userString = localStorage.getItem("USER_DATA");
        const accessString = localStorage.getItem("ACCESSES");

        if (!userString || userString === "undefined") return null;

        const userData = JSON.parse(userString);
        let accesses = [];

        if (accessString && accessString !== "undefined") {
            try {
                accesses = JSON.parse(accessString);
            } catch {
                accesses = [];
            }
        }

        let allRoles = [];
        if (Array.isArray(accesses)) {
            accesses.forEach((access) => {
                if (access.roles && Array.isArray(access.roles)) {
                    access.roles.forEach((role) => {
                        const roleStr = typeof role === "string" ? role : role?.role;
                        if (roleStr && !allRoles.includes(roleStr)) {
                            allRoles.push(roleStr);
                        }
                    });
                }
            });
        }

        // Check for workflow roles in priority order
        if (allRoles.includes('CHECKER')) return 'CHECKER';
        if (allRoles.includes('Checker')) return 'CHECKER';
        if (allRoles.includes('SUPERVISOR')) return 'SUPERVISOR';
        if (allRoles.includes('Supervisor')) return 'SUPERVISOR';
        if (allRoles.includes('MAKER')) return 'MAKER';
        if (allRoles.includes('Maker')) return 'MAKER';
        if (allRoles.includes('Intializer')) return 'INITIALIZER';
        if (allRoles.includes('INITIALIZER')) return 'INITIALIZER';

        // Admin fallback
        if (userData?.superadmin || userData?.is_staff) return 'CHECKER';
        if (userData?.is_client) return 'SUPERVISOR';
        if (userData?.is_manager) return 'SUPERVISOR';
        if (allRoles.includes('ADMIN')) return 'SUPERVISOR';

        return null;
    } catch (error) {
        console.error("Error getting user role:", error);
        return null;
    }
};


// Add after getCurrentUserRole function
const useDebounce = (callback, delay) => {
    const timeoutRef = React.useRef(null);

    return React.useCallback((...args) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            callback(...args);
        }, delay);
    }, [callback, delay]);
};

const FlatInspectionPage = () => {
    const { theme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const { flatId } = useParams();

    // Get data from navigation state
    const { projectId, flatNumber, flatType } = location.state || {};

    // State management
    const [checklistData, setChecklistData] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roomsLoading, setRoomsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showRoomsModal, setShowRoomsModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [expandedItems, setExpandedItems] = useState({});
    const [userRole, setUserRole] = useState(null);
    const [paginationInfo, setPaginationInfo] = useState({
        count: 0,
        next: null,
        previous: null
    });

    // New states for initialization


    // New states for initialization
    const [initializingChecklists, setInitializingChecklists] = useState(new Set());
    const [selectedForBulk, setSelectedForBulk] = useState(new Set());
    const [bulkInitializing, setBulkInitializing] = useState(false);

    // Add these new states for MAKER modal
    const [showMakerModal, setShowMakerModal] = useState(false);
    const [selectedItemForMaker, setSelectedItemForMaker] = useState(null);
    const [makerRemark, setMakerRemark] = useState('');
    const [makerPhotos, setMakerPhotos] = useState([]);
    const [submittingMaker, setSubmittingMaker] = useState(false);

    // Add these new states for SUPERVISOR review modal
    const [showSupervisorReviewModal, setShowSupervisorReviewModal] = useState(false);
    const [selectedItemForSupervisorReview, setSelectedItemForSupervisorReview] = useState(null);
    const [supervisorRemarks, setSupervisorRemarks] = useState('');
    const [submittingSupervisorDecision, setSubmittingSupervisorDecision] = useState(false);
    // History modal states
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedItemForHistory, setSelectedItemForHistory] = useState(null);



    //report 
    const [reportData, setReportData] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);
    const [reportError, setReportError] = useState(null);

    // Tab management for INITIALIZER dashboard
    const [activeTab, setActiveTab] = useState('ready-to-start');
    const [tabData, setTabData] = useState({
        'ready-to-start': [],
        'actively-working': [],
        'finished-items': []
    });

    const [tabLoading, setTabLoading] = useState({
        'ready-to-start': false,
        'actively-working': false,
        'finished-items': false
    });

    // Universal tab state for working roles (CHECKER, MAKER, SUPERVISOR)
    const [activeWorkTab, setActiveWorkTab] = useState('available-work');

    const [selectedItemsForBulk, setSelectedItemsForBulk] = useState(new Set());
    const [bulkSubmitting, setBulkSubmitting] = useState(false);
    const [bulkDecisionType, setBulkDecisionType] = useState(null); // 'pass' or 'fail'

    const [performanceMetrics, setPerformanceMetrics] = useState({
        apiCalls: 0,
        renderTime: 0,
        lastUpdate: null
    });

    const startTime = React.useRef(Date.now());

    React.useEffect(() => {
        const endTime = Date.now();
        const renderTime = endTime - startTime.current;

        setPerformanceMetrics(prev => ({
            ...prev,
            renderTime,
            lastUpdate: new Date().toISOString()
        }));
    }, [checklistData, tabData]);


    const [loadingStates, setLoadingStates] = useState(new Set()); // Track loading for individual items

    // Add after bulkDecisionType state
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [confirmDialogData, setConfirmDialogData] = useState(null);


    // Enhanced Theme Configuration
    const ORANGE = "#ffbe63";
    const BG_OFFWHITE = "#fcfaf7";
    const bgColor = theme === "dark" ? "#191922" : BG_OFFWHITE;
    const cardColor = theme === "dark" ? "#23232c" : "#fff";
    const borderColor = ORANGE;
    const textColor = theme === "dark" ? "#fff" : "#222";
    const iconColor = ORANGE;

    const updateChecklistAfterInitialization = (checklistId, delay = 0) => {
        // Add whoosh animation first
        const checklistElement = document.querySelector(`[data-checklist-id="${checklistId}"]`);
        if (checklistElement) {
            setTimeout(() => {
                checklistElement.classList.add('whoosh-out');
            }, delay);
        }

        // Update tab data after animation
        setTimeout(() => {
            if (userRole === 'INITIALIZER') {
                // Remove from 'ready-to-start' tab
                setTabData(prev => ({
                    ...prev,
                    'ready-to-start': prev['ready-to-start'].map(roomData => ({
                        ...roomData,
                        checklists: roomData.checklists?.filter(checklist => checklist.id !== checklistId) || []
                    }))
                }));

                // Force refresh the actively-working tab to show the moved item
                // Force refresh both tabs to ensure consistency
                setTimeout(async () => {
                    // Refresh current tab
                    await fetchTabData(activeTab);
                    // Refresh the target tab (actively-working)
                    await fetchTabData('actively-working');
                    // Auto-switch to actively-working tab
                    setActiveTab('actively-working');
                }, 500);
            } else {
                // For other roles, use existing logic
                setChecklistData(prevData =>
                    prevData.map(roomData => ({
                        ...roomData,
                        assigned_to_me: roomData.assigned_to_me?.map(checklist =>
                            checklist.id === checklistId
                                ? { ...checklist, status: "in_progress" }
                                : checklist
                        ) || [],
                        available_for_me: roomData.available_for_me?.map(checklist =>
                            checklist.id === checklistId
                                ? { ...checklist, status: "in_progress" }
                                : checklist
                        ) || []
                    }))
                );
            }
        }, delay + 500);
    };


    const updateMultipleChecklists = (checklistIds) => {
        checklistIds.forEach((checklistId, index) => {
            updateChecklistAfterInitialization(checklistId, index * 100); // Stagger animations
        });
    };


    const themeConfig = {
        pageBg: bgColor,
        cardBg: cardColor,
        textPrimary: textColor,
        textSecondary: theme === "dark" ? "#a0a0a0" : "#666",
        accent: ORANGE,
        border: borderColor,
        icon: iconColor,
        headerBg: theme === "dark" ? "#2a2a35" : "#f8f6f3",
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
        passColor: "#10b981",    // Green for PASS options
        failColor: "#ef4444",    // Red for FAIL options
    };
    // Tab configuration for INITIALIZER
    // Tab configuration for INITIALIZER
    const initializerTabs = [
        {
            key: 'ready-to-start',
            label: 'Assignment Queue',
            icon: '🚀',
            color: themeConfig.accent,
            description: 'Checklists ready to initialize',
            apiStatus: 'not_started'
        },
        {
            key: 'actively-working',
            label: 'Active Workflows',
            icon: '⚡',
            color: themeConfig.warning,
            description: 'Checklists in workflow process',
            apiStatus: 'in_progress'
        },
    ];
    // Tab configuration for MAKER
    // Remove this entire section - no longer needed



    // Fetch data for specific tab
    const fetchTabData = async (tabKey) => {
        const tabConfig = initializerTabs.find(tab => tab.key === tabKey);
        if (!tabConfig) return;

        setTabLoading(prev => ({ ...prev, [tabKey]: true }));

        try {
            const token = localStorage.getItem("ACCESS_TOKEN");
            const apiUrl = '/Transafer-Rule-getchchklist/';
            const params = {
                project_id: projectId,
                flat_id: flatId,
                status: tabConfig.apiStatus
            };

            console.log(`🔍 FETCHING TAB DATA - Tab: ${tabKey}, Status: ${tabConfig.apiStatus}`);

            setPerformanceMetrics(prev => ({ ...prev, apiCalls: prev.apiCalls + 1 }));
            const response = await checklistInstance.get(apiUrl, {
                params: params,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                timeout: 10000,
            });

            if (response.status === 200) {
                const responseData = response.data || {};
                let data = responseData.results || responseData || [];

                if (!Array.isArray(data)) {
                    data = [data];
                }

                setTabData(prev => ({
                    ...prev,
                    [tabKey]: data
                }));

                console.log(`✅ TAB DATA LOADED - Tab: ${tabKey}, Count: ${data.length}`);

                // Extract and fetch room details for INITIALIZER
                const roomIds = [...new Set(data.map(room => room.room_id).filter(Boolean))];
                console.log(`🔍 INITIALIZER Tab ${tabKey} Room IDs:`, roomIds);

                if (roomIds.length > 0) {
                    const token = localStorage.getItem("ACCESS_TOKEN");
                    fetchRoomDetails(roomIds);
                }
            }
        } catch (err) {
            console.error(`❌ Failed to fetch tab data for ${tabKey}:`, err);
            toast.error(`Failed to load ${tabConfig.label}`, {
                style: { background: themeConfig.error, color: 'white', borderRadius: '12px' }
            });
        } finally {
            setTabLoading(prev => ({ ...prev, [tabKey]: false }));
        }
    };

    // Handle tab switching with on-demand loading
    const handleTabSwitch = async (tabKey) => {
        setActiveTab(tabKey);

        // Always refresh data for active tab to ensure consistency
        await fetchTabData(tabKey);

        // Clear any existing selections when switching tabs
        setSelectedForBulk(new Set());
    };

    // ADD THIS RIGHT AFTER updateMultipleChecklists function
    const additionalStyles = `
.whoosh-out {
    animation: whooshOut 0.5s ease-in-out forwards;
    transform-origin: center;
}

@keyframes whooshOut {
    0% {
        opacity: 1;
        transform: scale(1) translateX(0);
    }
    50% {
        opacity: 0.7;
        transform: scale(1.05) translateX(10px);
    }
    100% {
        opacity: 0;
        transform: scale(0.8) translateX(100px);
        height: 0;
        margin: 0;
        padding: 0;
    }
}

.checklist-card {
    transition: all 0.3s ease;
}
`;
//report added today 31.7.2025
    console.log(" before useEffect triggered!", flatId);
    const token = localStorage.getItem("ACCESS_TOKEN");
    const isMaker = userRole === "MAKER";


useEffect(() => {
    console.log("useEffect triggered!", flatId);

    if (!flatId) return;

    console.log("Fetching report for FlatId:", flatId);

   fetch(`https://konstruct.world/checklists/flat-report/${flatId}/`, {
    headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    }
})
.then(res => {
    if (!res.ok) throw new Error("Network response was not ok");
    return res.json();   // <-- THIS is needed!
})
.then(data => {
    console.log("Report Data:", data); // This will now be the JSON object
    setReportData(data);
})
.catch(error => {
    console.log("Fetch error:", error);
    setReportError(error.message);
});

}, [flatId]);

console.log("Flat ID for report fetch:", flatId);

    useEffect(() => {
        const styleElement = document.createElement('style');
        styleElement.innerHTML = additionalStyles;
        document.head.appendChild(styleElement);

        return () => {
            document.head.removeChild(styleElement);
        };
    }, []);


    // Initialize single checklist
    const handleInitializeChecklist = async (checklistId) => {
        setInitializingChecklists(prev => new Set([...prev, checklistId]));

        try {
            const token = localStorage.getItem("ACCESS_TOKEN");

            console.log("📡 API CALL: handleInitializeChecklist - Request URL:", `/start-checklist/${checklistId}/`);
            console.log("📡 API CALL: handleInitializeChecklist - Checklist ID:", checklistId);

            const response = await checklistInstance.post(
                `/start-checklist/${checklistId}/`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            console.log("📡 API RESPONSE: handleInitializeChecklist - Response:", response.data);
            console.log("📡 API RESPONSE: handleInitializeChecklist - Status:", response.status);

            if (response.status === 200) {
                // Immediate UI update with whoosh effect
                updateChecklistAfterInitialization(checklistId);
                setTimeout(() => {
                    fetchTabData(activeTab);
                }, 1000);
            }
        } catch (err) {
            console.error("❌ Failed to initialize checklist:", err);
            const errorMessage = err.response?.data?.error || "Failed to initialize checklist";

            toast.error(`❌ ${errorMessage}`, {
                duration: 4000,
                style: {
                    background: themeConfig.error,
                    color: 'white',
                    borderRadius: '12px',
                    padding: '16px',
                },
            });
        } finally {
            setInitializingChecklists(prev => {
                const newSet = new Set(prev);
                newSet.delete(checklistId);
                return newSet;
            });
        }
    };

    // Initialize multiple checklists
    const handleBulkInitialize = async (confirmed = false) => {
        if (selectedForBulk.size === 0) {
            toast.error("Please select at least one checklist to initialize", {
                style: { background: themeConfig.warning, color: 'white', borderRadius: '12px' }
            });
            return;
        }

        // Show confirmation dialog first
        if (!confirmed) {
            setConfirmDialogData({
                title: 'Initialize Checklists',
                message: `Are you sure you want to initialize ${selectedForBulk.size} checklist${selectedForBulk.size !== 1 ? 's' : ''}? This will start the workflow process.`,
                confirmText: 'Initialize',
                confirmColor: themeConfig.accent,
                onConfirm: () => handleBulkInitialize(true)
            });
            setShowConfirmDialog(true);
            return;
        }

        setBulkInitializing(true);
        const selectedIds = Array.from(selectedForBulk);
        let successCount = 0;
        let failCount = 0;

        try {
            // Process each checklist sequentially for better UX
            for (const checklistId of selectedIds) {
                try {
                    const token = localStorage.getItem("ACCESS_TOKEN");

                    const response = await checklistInstance.post(
                        `/start-checklist/${checklistId}/`,
                        {},
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        }
                    );

                    if (response.status === 200) {
                        successCount++;
                        // Update the checklist data in real-time
                        setChecklistData(prevData =>
                            prevData.map(roomData => ({
                                ...roomData,
                                checklists: roomData.checklists.map(checklist =>
                                    checklist.id === checklistId
                                        ? { ...checklist, status: "in_progress" }
                                        : checklist
                                )
                            }))
                        );
                    }
                } catch (err) {
                    failCount++;
                    console.error(`Failed to initialize checklist ${checklistId}:`, err);
                }
            }

            // Show summary toast
            if (successCount > 0) {
                // Get successfully initialized checklist IDs
                const successfulIds = Array.from(selectedForBulk).slice(0, successCount);

                // Apply whoosh effect to all successful items
                updateMultipleChecklists(successfulIds);

                // Show summary toast
                if (failCount === 0) {
                    toast.success(`🎉 All ${successCount} checklists initialized successfully!`, {
                        duration: 5000,
                        style: { background: themeConfig.success, color: 'white', borderRadius: '12px', padding: '16px' }
                    });
                } else {
                    toast.success(`⚠️ ${successCount} checklists initialized, ${failCount} failed.`, {
                        duration: 5000,
                        style: { background: themeConfig.warning, color: 'white', borderRadius: '12px', padding: '16px' }
                    });
                }

                // Clear selection after animation
                setTimeout(() => {
                    setSelectedForBulk(new Set());
                }, 1000);
            } else {
                toast.error("❌ Failed to initialize all selected checklists.", {
                    duration: 4000,
                    style: { background: themeConfig.error, color: 'white', borderRadius: '12px', padding: '16px' }
                });
            }

        } finally {
            setBulkInitializing(false);
        }
    };

    // Bulk decision handler for CHECKER and SUPERVISOR
    const handleBulkDecision = async (decisionType, confirmed = false) => {
        if (selectedItemsForBulk.size === 0) {
            toast.error("Please select at least one item to process", {
                style: { background: themeConfig.warning, color: 'white', borderRadius: '12px' }
            });
            return;
        }

        // Show confirmation dialog first
        if (!confirmed) {
            const actionText = decisionType === 'pass'
                ? (userRole === 'CHECKER' ? 'APPROVE' : userRole === 'SUPERVISOR' ? 'ACCEPT' : 'PASS')
                : (userRole === 'CHECKER' ? 'REOPEN' : userRole === 'SUPERVISOR' ? 'SEND TO REWORK' : 'FAIL');

            setConfirmDialogData({
                title: `${actionText} Items`,
                message: `Are you sure you want to ${actionText.toLowerCase()} ${selectedItemsForBulk.size} item${selectedItemsForBulk.size !== 1 ? 's' : ''}? This action cannot be undone.`,
                confirmText: actionText,
                confirmColor: decisionType === 'pass' ? themeConfig.passColor : themeConfig.failColor,
                onConfirm: () => handleBulkDecision(decisionType, true)
            });
            setShowConfirmDialog(true);
            return;
        }

        setBulkSubmitting(true);
        setBulkDecisionType(decisionType);
        const selectedIds = Array.from(selectedItemsForBulk);
        let successCount = 0;
        let failCount = 0;

        try {
            // Get all available items to find options
            const currentDataSource = activeWorkTab === 'available-work' ? 'available_for_me' : 'assigned_to_me';
            const allItems = checklistData.flatMap(room => {
                const checklists = room[currentDataSource] || [];
                return checklists.flatMap(checklist => checklist.items || []);
            });

            // Process each selected item
            for (const itemId of selectedIds) {
                try {
                    const item = allItems.find(item => item.id === itemId);
                    if (!item) {
                        failCount++;
                        continue;
                    }

                    // Find appropriate option based on decision type
                    const targetOption = item.options?.find(opt =>
                        decisionType === 'pass' ? opt.choice === "P" : opt.choice === "N"
                    );

                    if (!targetOption) {
                        console.error(`No ${decisionType.toUpperCase()} option found for item ${itemId}`);
                        failCount++;
                        continue;
                    }

                    const token = localStorage.getItem("ACCESS_TOKEN");
                    const payload = {
                        checklist_item_id: itemId,
                        role: userRole.toLowerCase(),
                        option_id: targetOption.id,
                        check_remark: `Bulk ${decisionType.toUpperCase()} decision by ${userRole}`
                    };

                    console.log(`📡 API CALL: Bulk ${decisionType.toUpperCase()} - Item ${itemId}:`, payload);

                    const response = await checklistInstance.patch(
                        '/Decsion-makeing-forSuer-Inspector/',
                        payload,
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        }
                    );

                    if (response.status === 200) {
                        successCount++;
                    } else {
                        failCount++;
                    }

                } catch (err) {
                    failCount++;
                    console.error(`Failed to process item ${itemId}:`, err);
                }
            }

            // Show summary toast
            if (successCount > 0) {
                if (failCount === 0) {
                    toast.success(`🎉 All ${successCount} items processed with ${decisionType.toUpperCase()} decision!`, {
                        duration: 5000,
                        style: {
                            background: decisionType === 'pass' ? themeConfig.passColor : themeConfig.failColor,
                            color: 'white',
                            borderRadius: '12px',
                            padding: '16px'
                        }
                    });
                } else {
                    toast.success(`⚠️ ${successCount} items processed, ${failCount} failed.`, {
                        duration: 5000,
                        style: { background: themeConfig.warning, color: 'white', borderRadius: '12px', padding: '16px' }
                    });
                }

                // Clear selection and refresh data
                // Clear selection and refresh data smoothly
                setTimeout(async () => {
                    setSelectedItemsForBulk(new Set());

                    // Smooth refresh without page reload
                    try {
                        const token = localStorage.getItem("ACCESS_TOKEN");
                        const apiUrl = '/Transafer-Rule-getchchklist/';
                        const params = { project_id: projectId, flat_id: flatId };

                        const response = await checklistInstance.get(apiUrl, {
                            params: params,
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json",
                            },
                            timeout: 10000,
                        });

                        if (response.status === 200) {
                            const responseData = response.data || {};
                            let data = responseData.results || responseData || [];
                            if (!Array.isArray(data)) data = [data];

                            setChecklistData(data);

                            // Re-fetch room details if needed
                            const roomIds = [...new Set(data.map((item) => item.room_id).filter(Boolean))];
                            if (roomIds.length > 0) {
                                await fetchRoomDetails(roomIds);
                            }
                        }
                    } catch (err) {
                        console.error("❌ Failed to refresh data:", err);
                        // Fallback to page reload only if API fails
                        window.location.reload();
                    }
                }, 1000);
            } else {
                toast.error("❌ Failed to process all selected items.", {
                    duration: 4000,
                    style: { background: themeConfig.error, color: 'white', borderRadius: '12px', padding: '16px' }
                });
            }

        } finally {
            setBulkSubmitting(false);
            setBulkDecisionType(null);
        }
    };

    // Toggle checklist selection for bulk operations
    const toggleChecklistSelection = (checklistId) => {
        setSelectedForBulk(prev => {
            const newSet = new Set(prev);
            if (newSet.has(checklistId)) {
                newSet.delete(checklistId);
            } else {
                newSet.add(checklistId);
            }
            return newSet;
        });
    };


    // Toggle item selection for bulk operations (CHECKER/SUPERVISOR)
    const toggleItemSelection = (itemId) => {
        setSelectedItemsForBulk(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };
    // Select all not_started checklists
    const selectAllNotStarted = () => {
        const notStartedIds = userRole === 'INITIALIZER'
            ? (tabData[activeTab] || [])  // Use current active tab instead of hardcoded
                .flatMap(roomData => roomData.checklists || [])
                .filter(checklist => checklist && checklist.status === "not_started")
                .map(checklist => checklist.id)
            : checklistData
                .flatMap(roomData => [
                    ...(roomData.assigned_to_me || []),
                    ...(roomData.available_for_me || [])
                ])
                .filter(checklist => checklist && checklist.status === "not_started")
                .map(checklist => checklist.id);

        // Toggle behavior: if all are selected, unselect all
        if (selectedForBulk.size === notStartedIds.length && notStartedIds.length > 0) {
            setSelectedForBulk(new Set());
        } else {
            setSelectedForBulk(new Set(notStartedIds));
        }
    };

    // Get role-based action buttons
    const getRoleBasedActions = (checklist, item = null) => {
        if (!userRole) return null;

        switch (userRole) {
            case 'INITIALIZER':
                return getInitializeButton(checklist);

            case 'CHECKER':
                if (!item) return null;
                const isPreScreening = !item.submissions || item.submissions.length === 0;
                return (
                    <div className="flex gap-2">
                        <button
                            className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
                            style={{
                                background: themeConfig.success,
                                color: 'white'
                            }}
                        >
                            {isPreScreening ? 'Accept for Workflow' : 'Approve Final'}
                        </button>
                        <button
                            className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
                            style={{
                                background: themeConfig.error,
                                color: 'white'
                            }}
                        >
                            {isPreScreening ? 'Mark Complete' : 'Send for Rework'}
                        </button>
                    </div>
                );

            case 'SUPERVISOR':
                if (!item) {
                    // No button at checklist level for SUPERVISOR
                    return null;
                }

                // Show button only for items that need SUPERVISOR review
                if (item.status === 'pending_for_supervisor' && item.submissions && item.submissions.length > 0) {
                    return (
                        <button
                            onClick={() => {
                                setSelectedItemForSupervisorReview(item);
                                setShowSupervisorReviewModal(true);
                            }}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                            style={{
                                background: themeConfig.warning,
                                color: 'white'
                            }}
                        >
                            Review MAKER Work
                        </button>
                    );
                }

                return null;

            case 'MAKER':
                if (!item) {
                    // Show button at checklist level for MAKER
                    return (
                        <button
                            onClick={() => {
                                // Find items that need MAKER attention
                                // const itemsNeedingWork = checklist.items?.filter(item => 
                                //   item.status === 'pending_for_maker' || item.status === 'in_progress'
                                // ) || [];

                                // Since items array is empty, let's check if there are any items at all
                                const itemsNeedingWork = checklist.items || [];
                                console.log("🔍 DEBUG: All items for MAKER:", itemsNeedingWork);
                                console.log("🔍 DEBUG: Checklist object:", checklist);

                                // If no items in checklist.items, just open modal anyway for testing
                                if (itemsNeedingWork.length === 0) {
                                    // Create a mock item for testing
                                    const mockItem = {
                                        id: checklist.id,
                                        title: `Work on ${checklist.name}`,
                                        status: 'pending_for_maker',
                                        description: 'Complete work for this checklist'
                                    };
                                    setSelectedItemForMaker(mockItem);
                                    setShowMakerModal(true);
                                    return;
                                }


                                console.log("🔍 DEBUG: All items for MAKER:", itemsNeedingWork);
                                console.log("🔍 DEBUG: Item statuses:", itemsNeedingWork.map(item => item.status));

                                // For now, let MAKER work on any item that's not completed
                                const filteredItems = itemsNeedingWork.filter(item =>
                                    item.status !== 'completed'
                                );

                                if (itemsNeedingWork.length > 0) {
                                    setSelectedItemForMaker(itemsNeedingWork[0]);
                                    setShowMakerModal(true);
                                } else {
                                    toast.success("No items requiring your attention in this checklist");
                                }
                            }}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                            style={{
                                background: themeConfig.accent,
                                color: 'white'
                            }}
                        >
                            View Items to Complete
                        </button>
                    );
                }
                return (
                    <button
                        onClick={() => {
                            setSelectedItemForMaker(item);
                            setMakerRemark('');
                            setMakerPhotos([]);
                            setShowMakerModal(true);
                        }}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        style={{
                            background: themeConfig.accent,
                            color: 'white'
                        }}
                    >
                        Complete Work
                    </button>
                );
            default:
                return null;
        }
    };

    // Get initialization button component
    const getInitializeButton = (checklist) => {
        const isInitializing = initializingChecklists.has(checklist.id);
        const canInitialize = checklist.status === "not_started";
        const isSelected = selectedForBulk.has(checklist.id);

        if (!canInitialize) {
            return null;
        }

        return (
            <div className="flex items-center gap-2">
                {/* Bulk selection checkbox */}
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                            e.stopPropagation(); // Prevent event bubbling
                            toggleChecklistSelection(checklist.id);
                        }}
                        className="w-4 h-4 rounded border-2 focus:ring-2 cursor-pointer"
                        style={{
                            accentColor: themeConfig.accent,
                            borderColor: themeConfig.border
                        }}
                    />
                </div>

                {/* Initialize button */}
                <button
                    onClick={() => handleInitializeChecklist(checklist.id)}
                    disabled={isInitializing}
                    className={`
            relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform
            ${isInitializing
                            ? 'opacity-75 cursor-not-allowed scale-95'
                            : 'hover:scale-105 hover:shadow-lg active:scale-95'
                        }
          `}
                    style={{
                        background: isInitializing
                            ? `linear-gradient(135deg, ${themeConfig.accent}80, ${themeConfig.accent}60)`
                            : `linear-gradient(135deg, ${themeConfig.accent}, ${themeConfig.accent}dd)`,
                        color: 'white',
                        border: `2px solid ${themeConfig.accent}`,
                        boxShadow: isInitializing ? 'none' : `0 4px 12px ${themeConfig.accent}30`,
                    }}
                >
                    {isInitializing ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Initializing...</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span>🚀</span>
                            <span>Initialize</span>
                        </div>
                    )}
                </button>
            </div>
        );
    };

    // Get bulk action bar
    // Get bulk action bar
    const getBulkActionBar = () => {
        // Show bulk actions for INITIALIZER, CHECKER, and SUPERVISOR
        if (userRole === 'INITIALIZER') {
            const notStartedChecklists = (tabData[activeTab] || [])  // Use current active tab
                .flatMap(roomData => roomData.checklists || [])
                .filter(checklist => checklist && checklist.status === "not_started");

            if (notStartedChecklists.length === 0) {
                return null;
            }

            return getInitializerBulkBar(notStartedChecklists);
        }

        if (['CHECKER', 'SUPERVISOR'].includes(userRole)) {
            // Get all available items for current tab
            const currentDataSource = activeWorkTab === 'available-work' ? 'available_for_me' : 'assigned_to_me';
            const availableItems = checklistData.flatMap(room => {
                const checklists = room[currentDataSource] || [];
                return checklists.flatMap(checklist => checklist.items || []);
            });

            if (availableItems.length === 0) {
                return null;
            }

            return getCheckerSupervisorBulkBar(availableItems);
        }

        return null;
    };

    // INITIALIZER bulk bar (existing logic)
    const getInitializerBulkBar = (notStartedChecklists) => {
        return (
            <div
                className="sticky top-0 z-10 p-4 rounded-xl mb-6 shadow-lg backdrop-blur-sm"
                style={{
                    background: `${themeConfig.cardBg}f0`,
                    border: `1px solid ${themeConfig.border}40`,
                }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={selectedForBulk.size === notStartedChecklists.length && notStartedChecklists.length > 0}
                                indeterminate={selectedForBulk.size > 0 && selectedForBulk.size < notStartedChecklists.length}
                                onChange={selectAllNotStarted}
                                className="w-5 h-5 rounded border-2 focus:ring-2"
                                style={{
                                    accentColor: themeConfig.accent,
                                    borderColor: themeConfig.border
                                }}
                                ref={(el) => {
                                    if (el) {
                                        el.indeterminate = selectedForBulk.size > 0 && selectedForBulk.size < notStartedChecklists.length;
                                    }
                                }}
                            />
                            <span className="font-medium" style={{ color: themeConfig.textPrimary }}>
                                Select All ({notStartedChecklists.length} available)
                            </span>
                        </div>

                        {selectedForBulk.size > 0 && (
                            <span
                                className="px-3 py-1 rounded-full text-sm font-medium"
                                style={{
                                    background: `${themeConfig.accent}20`,
                                    color: themeConfig.accent
                                }}
                            >
                                {selectedForBulk.size} selected
                            </span>
                        )}
                    </div>

                    {selectedForBulk.size > 0 && (
                        <button
                            onClick={handleBulkInitialize}
                            disabled={bulkInitializing}
                            className={`
                            px-6 py-2 rounded-lg font-medium transition-all duration-300 transform
                            ${bulkInitializing
                                    ? 'opacity-75 cursor-not-allowed scale-95'
                                    : 'hover:scale-105 hover:shadow-lg active:scale-95'
                                }
                        `}
                            style={{
                                background: bulkInitializing
                                    ? `linear-gradient(135deg, ${themeConfig.accent}80, ${themeConfig.accent}60)`
                                    : `linear-gradient(135deg, ${themeConfig.accent}, ${themeConfig.accent}dd)`,
                                color: 'white',
                                border: `2px solid ${themeConfig.accent}`,
                                boxShadow: bulkInitializing ? 'none' : `0 4px 16px ${themeConfig.accent}40`,
                            }}
                        >
                            {bulkInitializing ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Initializing {selectedForBulk.size} items...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span>🚀</span>
                                    <span>Initialize Selected ({selectedForBulk.size})</span>
                                </div>
                            )}
                        </button>
                    )}
                </div>
            </div>
        );
    };

    // CHECKER/SUPERVISOR bulk bar (new)
    const getCheckerSupervisorBulkBar = (availableItems) => {
        return (
            <div
                className="sticky top-0 z-10 p-4 rounded-xl mb-6 shadow-lg backdrop-blur-sm"
                style={{
                    background: `${themeConfig.cardBg}f0`,
                    border: `1px solid ${themeConfig.border}40`,
                }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={selectedItemsForBulk.size === availableItems.length && availableItems.length > 0}
                                onChange={() => {
                                    if (selectedItemsForBulk.size === availableItems.length) {
                                        setSelectedItemsForBulk(new Set());
                                    } else {
                                        setSelectedItemsForBulk(new Set(availableItems.map(item => item.id)));
                                    }
                                }}
                                className="w-5 h-5 rounded border-2 focus:ring-2"
                                style={{
                                    accentColor: themeConfig.accent,
                                    borderColor: themeConfig.border
                                }}
                            />
                            <span className="font-medium" style={{ color: themeConfig.textPrimary }}>
                                Select All ({availableItems.length} item{availableItems.length !== 1 ? 's' : ''})
                            </span>
                        </div>

                        {selectedItemsForBulk.size > 0 && (
                            <span
                                className="px-3 py-1 rounded-full text-sm font-medium"
                                style={{
                                    background: `${themeConfig.accent}20`,
                                    color: themeConfig.accent
                                }}
                            >
                                {selectedItemsForBulk.size} selected
                            </span>
                        )}
                    </div>

                    {selectedItemsForBulk.size > 0 && (
                        <div className="flex items-center gap-3">
                            {/* Bulk PASS Button */}
                            <button
                                onClick={() => handleBulkDecision('pass')}
                                disabled={bulkSubmitting}
                                className={`
                                px-6 py-2 rounded-lg font-medium transition-all duration-300 transform
                                ${bulkSubmitting
                                        ? 'opacity-75 cursor-not-allowed scale-95'
                                        : 'hover:scale-105 hover:shadow-lg active:scale-95'
                                    }
                            `}
                                style={{
                                    background: bulkSubmitting
                                        ? `${themeConfig.passColor}80`
                                        : `linear-gradient(135deg, ${themeConfig.passColor}, ${themeConfig.passColor}dd)`,
                                    color: 'white',
                                    border: `2px solid ${themeConfig.passColor}`,
                                    boxShadow: bulkSubmitting ? 'none' : `0 4px 16px ${themeConfig.passColor}40`,
                                }}
                            >
                                {bulkSubmitting && bulkDecisionType === 'pass' ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Processing...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span>✅</span>
                                        <span>{userRole === 'CHECKER' ? 'PASS All' : userRole === 'SUPERVISOR' ? 'APPROVE All' : 'PASS All'} ({selectedItemsForBulk.size})</span>
                                    </div>
                                )}
                            </button>

                            {/* Bulk FAIL Button */}
                            <button
                                onClick={() => handleBulkDecision('fail')}
                                disabled={bulkSubmitting}
                                className={`
                                px-6 py-2 rounded-lg font-medium transition-all duration-300 transform
                                ${bulkSubmitting
                                        ? 'opacity-75 cursor-not-allowed scale-95'
                                        : 'hover:scale-105 hover:shadow-lg active:scale-95'
                                    }
                            `}
                                style={{
                                    background: bulkSubmitting
                                        ? `${themeConfig.failColor}80`
                                        : `linear-gradient(135deg, ${themeConfig.failColor}, ${themeConfig.failColor}dd)`,
                                    color: 'white',
                                    border: `2px solid ${themeConfig.failColor}`,
                                    boxShadow: bulkSubmitting ? 'none' : `0 4px 16px ${themeConfig.failColor}40`,
                                }}
                            >
                                {bulkSubmitting && bulkDecisionType === 'fail' ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Processing...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span>❌</span>
                                        <span>{userRole === 'CHECKER' ? 'FAIL All' : userRole === 'SUPERVISOR' ? 'REOPEN All' : 'FAIL All'} ({selectedItemsForBulk.size})</span>
                                    </div>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );

        const notStartedChecklists = userRole === 'INITIALIZER'
            ? (tabData['ready-to-start'] || [])
                .flatMap(roomData => roomData.checklists || [])
                .filter(checklist => checklist && checklist.status === "not_started")
            : checklistData
                .flatMap(roomData => [
                    ...(roomData.assigned_to_me || []),
                    ...(roomData.available_for_me || [])
                ])
                .filter(checklist => checklist && checklist.status === "not_started");

        if (notStartedChecklists.length === 0) {
            return null;
        }

        // Handle photo upload for MAKER

        return (
            <div
                className="sticky top-0 z-10 p-4 rounded-xl mb-6 shadow-lg backdrop-blur-sm"
                style={{
                    background: `${themeConfig.cardBg}f0`,
                    border: `1px solid ${themeConfig.border}40`,
                }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={selectedForBulk.size === notStartedChecklists.length && notStartedChecklists.length > 0}
                                onChange={selectAllNotStarted}
                                className="w-5 h-5 rounded border-2 focus:ring-2"
                                style={{
                                    accentColor: themeConfig.accent,
                                    borderColor: themeConfig.border
                                }}
                            />
                            <span className="font-medium" style={{ color: themeConfig.textPrimary }}>
                                Select All ({notStartedChecklists.length} available)
                            </span>
                        </div>

                        {selectedForBulk.size > 0 && (
                            <span
                                className="px-3 py-1 rounded-full text-sm font-medium"
                                style={{
                                    background: `${themeConfig.accent}20`,
                                    color: themeConfig.accent
                                }}
                            >
                                {selectedForBulk.size} selected
                            </span>
                        )}
                    </div>

                    {selectedForBulk.size > 0 && (
                        <button
                            onClick={handleBulkInitialize}
                            disabled={bulkInitializing}
                            className={`
                px-6 py-2 rounded-lg font-medium transition-all duration-300 transform
                ${bulkInitializing
                                    ? 'opacity-75 cursor-not-allowed scale-95'
                                    : 'hover:scale-105 hover:shadow-lg active:scale-95'
                                }
              `}
                            style={{
                                background: bulkInitializing
                                    ? `linear-gradient(135deg, ${themeConfig.accent}80, ${themeConfig.accent}60)`
                                    : `linear-gradient(135deg, ${themeConfig.accent}, ${themeConfig.accent}dd)`,
                                color: 'white',
                                border: `2px solid ${themeConfig.accent}`,
                                boxShadow: bulkInitializing ? 'none' : `0 4px 16px ${themeConfig.accent}40`,
                            }}
                        >
                            {bulkInitializing ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Initializing {selectedForBulk.size} items...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span>🚀</span>
                                    <span>Initialize Selected ({selectedForBulk.size})</span>
                                </div>
                            )}
                        </button>
                    )}
                </div>
            </div>
        );
    };

    // Fetch room details
    // Fetch room details
    const fetchRoomDetails = async (roomIds) => {
        if (!roomIds.length) {
            console.log("⚠️ No room IDs to fetch");
            return;
        }

        console.log("🔄 Fetching room details for IDs:", roomIds);
        setRoomsLoading(true);

        try {
            const token = localStorage.getItem("ACCESS_TOKEN");

            const roomPromises = roomIds.map(async (roomId) => {
                try {
                    console.log(`📡 Fetching room ${roomId}`);
                    const response = await projectInstance.get(
                        `/rooms/${roomId}/`,
                        {
                            headers: { Authorization: `Bearer ${token}` },
                            timeout: 10000,
                        }
                    );
                    console.log(`🏠 Room ${roomId} details:`, response.data);
                    return response.data;
                } catch (err) {
                    console.error(`❌ Failed to fetch room ${roomId}:`, err);
                    // Return fallback room data
                    return {
                        id: roomId,
                        rooms: `Room ${roomId}`,
                        name: `Room ${roomId}`
                    };
                }
            });

            const roomDetails = await Promise.all(roomPromises);
            console.log("🏠 All room details fetched:", roomDetails);

            // Log room names for debugging
            roomDetails.forEach(room => {
                console.log(`🏠 Room ${room.id}: ${room.rooms || room.name || 'No name'}`);
            });

            setRooms(roomDetails);
        } catch (err) {
            console.error("❌ Failed to fetch room details:", err);
            toast.error("Failed to load room details");
        } finally {
            setRoomsLoading(false);
        }
    };

    useEffect(() => {
        console.log("🚀 useEffect triggered with:", { projectId, flatId });

        const fetchInitialData = async () => {
            if (!projectId || !flatId) {
                console.error("❌ Missing required data:", { projectId, flatId });
                setError("Missing project or flat information");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const detectedRole = getCurrentUserRole();
                setUserRole(detectedRole);

                if (detectedRole === 'INITIALIZER') {
                    // For INITIALIZER, load default tab data
                    await fetchTabData('ready-to-start');
                    setChecklistData([]); // Clear old format data

                    // After loading tab data, fetch room details
                    setTimeout(() => {
                        const roomIds = [...new Set(
                            Object.values(tabData).flatMap(tabRooms =>
                                tabRooms.map(room => room.room_id).filter(Boolean)
                            )
                        )];

                        console.log("🔍 INITIALIZER Room IDs to fetch:", roomIds);
                        if (roomIds.length > 0) {
                            fetchRoomDetails(roomIds);
                        }
                    }, 500);
                } else if (['CHECKER', 'MAKER', 'SUPERVISOR'].includes(detectedRole)) {
                    // For working roles, use standard logic
                    const token = localStorage.getItem("ACCESS_TOKEN");
                    const apiUrl = '/Transafer-Rule-getchchklist/';
                    const params = { project_id: projectId, flat_id: flatId };

                    const response = await checklistInstance.get(apiUrl, {
                        params: params,
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                        timeout: 10000,
                    });

                    if (response.status === 200) {
                        const responseData = response.data || {};
                        let data = responseData.results || responseData || [];
                        if (!Array.isArray(data)) data = [data];

                        console.log("🔍 DEBUG: Working role data received:", data);
                        console.log("🔍 DEBUG: Room details in data:", data.map(room => ({
                            room_id: room.room_id,
                            room_details: room.room_details
                        })));

                        setChecklistData(data);

                        // Extract room IDs from all possible sources
                        const roomIds = [...new Set(data.map((item) => item.room_id).filter(Boolean))];
                        console.log("🔍 DEBUG: Room IDs to fetch:", roomIds);

                        if (roomIds.length > 0) {
                            await fetchRoomDetails(roomIds);
                        }
                    }
                } else {
                    // For other roles, use existing logic
                    // For other roles, use existing logic
                    const token = localStorage.getItem("ACCESS_TOKEN");
                    const apiUrl = '/Transafer-Rule-getchchklist/';
                    const params = { project_id: projectId, flat_id: flatId };

                    const response = await checklistInstance.get(apiUrl, {
                        params: params,
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                        timeout: 10000,
                    });

                    if (response.status === 200) {
                        const responseData = response.data || {};
                        let data = responseData.results || responseData || [];
                        if (!Array.isArray(data)) data = [data];

                        setChecklistData(data);

                        const roomIds = [...new Set(data.map((item) => item.room_id).filter(Boolean))];
                        if (roomIds.length > 0) {
                            fetchRoomDetails(roomIds);
                        }
                    }
                }
            } catch (err) {
                console.error("❌ API Error:", err);
                setError(err.message || "Failed to fetch data");
                toast.error("Failed to load data");
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [projectId, flatId]);


    const getStatusBadge = (status) => {
        const statusConfig = {
            completed: { bg: `${themeConfig.success}20`, text: themeConfig.success, label: "Completed" },
            in_progress: { bg: `${themeConfig.warning}20`, text: themeConfig.warning, label: "In Progress" },
            work_in_progress: { bg: `${themeConfig.warning}20`, text: themeConfig.warning, label: "Work In Progress" },
            not_started: { bg: `${themeConfig.textSecondary}20`, text: themeConfig.textSecondary, label: "Not Started" },
            on_hold: { bg: `${themeConfig.error}20`, text: themeConfig.error, label: "On Hold" },
            pending_for_inspector: { bg: `${themeConfig.accent}20`, text: themeConfig.accent, label: "Pending Inspector" },
            pending_for_supervisor: { bg: `${themeConfig.warning}20`, text: themeConfig.warning, label: "Pending Supervisor" },
            pending_for_maker: { bg: `${themeConfig.info}20`, text: themeConfig.info, label: "Pending Maker" },
        };

        // Safety check for undefined status
        const safeStatus = status || 'not_started';
        const config = statusConfig[safeStatus] || statusConfig.not_started;
        return (
            <span
                className="px-3 py-1 rounded-full text-xs font-medium transition-all duration-200"
                style={{ background: config.bg, color: config.text }}
            >
                {config.label}
            </span>
        );
    };

    const stats = React.useMemo(() => {
        let allItems = [];

        if (userRole === 'INITIALIZER') {
            // For INITIALIZER, get data from all tabs
            allItems = Object.values(tabData).flatMap(tabRooms =>
                tabRooms.flatMap(room =>
                    (room.checklists || []).flatMap(checklist =>
                        (checklist && checklist.items) || []
                    )
                )
            );
        } else if (['CHECKER', 'MAKER', 'SUPERVISOR'].includes(userRole)) {
            // For working roles, handle both item-level (MAKER) and checklist-level (CHECKER/SUPERVISOR)
            allItems = checklistData.flatMap((room) => {
                const assignedItems = room.assigned_to_me || [];
                const availableItems = room.available_for_me || [];

                if (userRole === 'MAKER') {
                    // MAKER: assigned_to_me and available_for_me contain items directly
                    return [...assignedItems, ...availableItems];
                } else {
                    // CHECKER/SUPERVISOR: assigned_to_me and available_for_me contain checklists with items
                    const allChecklists = [...assignedItems, ...availableItems];
                    return allChecklists.flatMap((checklist) => (checklist && checklist.items) || []);
                }
            });
        } else {
            // For other roles, use existing logic
            allItems = checklistData.flatMap((room) => {
                const checklists = [
                    ...(room.assigned_to_me || []),
                    ...(room.available_for_me || [])
                ];
                return checklists.flatMap((checklist) => (checklist && checklist.items) || []);
            });
        }

        const total = allItems.length;
        const completed = allItems.filter((item) => item.status === "completed").length;
        const inProgress = allItems.filter((item) => item.status === "in_progress").length;
        const notStarted = allItems.filter((item) => item.status === "not_started").length;

        return {
            total,
            completed,
            inProgress,
            notStarted,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
    }, [checklistData, tabData, userRole]);

    const handleBack = () => navigate(-1);
    const toggleItemExpansion = (checklistId, itemId) => {
        const key = `${checklistId}-${itemId}`;
        setExpandedItems((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    // Room Section Component
    const RoomSection = ({ roomName, roomId, checklists, userRole, themeConfig, roomDetail, handleRoomClick }) => {
        const [isRoomExpanded, setIsRoomExpanded] = useState(false);

        // Debug room name for all roles
        console.log(`🏠 RoomSection Debug - Role: ${userRole}, ID: ${roomId}, Name: ${roomName}`);
        console.log(`🏠 RoomSection Room Detail:`, roomDetail);

        return (
            <div className="border rounded-lg p-4 mb-4" style={{ borderColor: themeConfig.border }}>
                {/* Room Header - Clickable */}
                <div
                    className="cursor-pointer hover:shadow-md transition-all p-4 rounded-lg"
                    style={{
                        background: isRoomExpanded ? `${themeConfig.accent}10` : themeConfig.headerBg,
                        borderColor: themeConfig.border
                    }}
                    onClick={() => setIsRoomExpanded(!isRoomExpanded)}
                >
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            {/* Room Icon */}
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                                style={{
                                    background: `linear-gradient(135deg, ${themeConfig.accent}, ${themeConfig.accent}dd)`,
                                }}
                            >
                                {roomName.charAt(0).toUpperCase()}
                            </div>

                            <div>
                                <h3 className="text-xl font-bold" style={{ color: themeConfig.textPrimary }}>
                                    {roomName.toUpperCase()}
                                </h3>
                                <p className="text-sm" style={{ color: themeConfig.textSecondary }}>
                                    {checklists.length} checklist{checklists.length !== 1 ? "s" : ""} available
                                    {roomId && ` • Room ID: ${roomId}`}
                                </p>
                            </div>
                        </div>

                        {/* Expand/Collapse Arrow */}
                        <div
                            className={`transform transition-all duration-300 ${isRoomExpanded ? "rotate-90" : ""
                                } p-2 rounded-full`}
                            style={{
                                color: themeConfig.accent,
                                backgroundColor: `${themeConfig.accent}15`,
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
                            </svg>
                        </div>
                    </div>
                </div>


                {/* 👆 ADD THE ROOM-LEVEL BUTTON RIGHT HERE 👆 */}
                {/* Room-Level Initialize All Button for INITIALIZER */}
                {userRole === 'INITIALIZER' && (
                    <div className="mt-4">
                        <button
                            onClick={async () => {
                                // Get all not_started checklists in this room
                                const roomChecklistIds = checklists
                                    .filter(checklist => checklist.status === "not_started")
                                    .map(checklist => checklist.id);

                                if (roomChecklistIds.length === 0) {
                                    toast.success("No checklists to initialize in this room");
                                    return;
                                }

                                // Initialize all checklists in this room
                                setBulkInitializing(true);

                                try {
                                    for (const checklistId of roomChecklistIds) {
                                        await handleInitializeChecklist(checklistId);
                                    }

                                    toast.success(`🎉 All ${roomChecklistIds.length} checklists in ${roomName} initialized!`, {
                                        duration: 4000,
                                        style: { background: themeConfig.success, color: 'white', borderRadius: '12px' }
                                    });
                                } finally {
                                    setBulkInitializing(false);
                                }
                            }}
                            disabled={bulkInitializing || checklists.filter(c => c.status === "not_started").length === 0}
                            className="px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105"
                            style={{
                                background: checklists.filter(c => c.status === "not_started").length === 0
                                    ? `${themeConfig.textSecondary}60`
                                    : `linear-gradient(135deg, ${themeConfig.accent}, ${themeConfig.accent}dd)`,
                                color: 'white',
                                border: `2px solid ${themeConfig.accent}`,
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <span>🏠</span>
                                <span>Initialize All in {roomName} ({checklists.filter(c => c.status === "not_started").length})</span>
                            </div>
                        </button>
                    </div>
                )}


                {/* Expanded Checklists Content */}
                <div
                    className={`transition-all duration-500 ease-out overflow-hidden ${isRoomExpanded ? "max-h-[2000px] opacity-100 mt-4" : "max-h-0 opacity-0"
                        }`}
                >
                    <div className="space-y-4">
                        {checklists.map((checklist) => (
                            <ChecklistCard
                                key={checklist.id}
                                checklist={checklist}
                                userRole={userRole}
                                themeConfig={themeConfig}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    };



    const ChecklistCard = React.memo(({ checklist, userRole, themeConfig }) => {
        const [isChecklistExpanded, setIsChecklistExpanded] = useState(false);

        return (
            <div
                data-checklist-id={checklist.id}
                className="border rounded-lg p-4 transition-all duration-300 hover:shadow-md checklist-card"
                style={{ background: themeConfig.cardBg, borderColor: themeConfig.border }}
            >
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h4 className="font-semibold mb-1" style={{ color: themeConfig.textPrimary }}>
                            {checklist.name}
                        </h4>
                        {checklist.description && (
                            <p className="text-sm mb-2" style={{ color: themeConfig.textSecondary }}>
                                {checklist.description}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        {getStatusBadge(checklist.status)}
                        {getRoleBasedActions(checklist, null)}
                    </div>
                </div>

                {/* Clickable Items Section */}
                {checklist.items && checklist.items.length > 0 && (
                    <div className="mt-3">
                        <div
                            className="p-3 rounded-lg cursor-pointer hover:shadow-sm transition-all duration-200"
                            style={{ background: `${themeConfig.accent}08` }}
                            onClick={() => setIsChecklistExpanded(!isChecklistExpanded)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">📋</span>
                                    <span className="font-medium" style={{ color: themeConfig.textPrimary }}>
                                        {checklist.items.length} Inspection Items
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs px-2 py-1 rounded-full" style={{
                                        background: `${themeConfig.accent}20`,
                                        color: themeConfig.accent
                                    }}>
                                        {/* Read-only for {userRole} */}
                                    </span>
                                    <div
                                        className={`transform transition-all duration-300 ${isChecklistExpanded ? "rotate-90" : ""
                                            }`}
                                        style={{ color: themeConfig.accent }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Expanded Items List */}
                        <div
                            className={`transition-all duration-500 ease-out overflow-hidden ${isChecklistExpanded ? "max-h-[2000px] opacity-100 mt-4" : "max-h-0 opacity-0"
                                }`}
                        >
                            <div className="space-y-3">
                                {checklist.items.map((item, itemIndex) => (
                                    <InspectionItem
                                        key={item.id}
                                        item={item}
                                        itemIndex={itemIndex}
                                        userRole={userRole}
                                        themeConfig={themeConfig}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    });


    // MAKER Item Card Component
    const MakerItemCard = ({ item, userRole, themeConfig }) => {
        const [isExpanded, setIsExpanded] = useState(false);

        return (
            <div
                className="border rounded-lg p-4 transition-all duration-300 hover:shadow-md"
                style={{ background: themeConfig.cardBg, borderColor: themeConfig.border }}
            >
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span
                                className="text-sm font-bold px-2 py-1 rounded-full"
                                style={{
                                    background: `${themeConfig.accent}20`,
                                    color: themeConfig.accent
                                }}
                            >
                                #{item.id}
                            </span>
                            <h4 className="font-semibold" style={{ color: themeConfig.textPrimary }}>
                                {item.title}
                            </h4>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap mb-2">
                            {/* <Tooltip text={`Current status: ${item.status.replace('_', ' ')}`}>
                                {getStatusBadge(item.status)}
                            </Tooltip> */}

                            {item.photo_required && (
                                <Tooltip text="This item requires photo documentation">
                                    <span
                                        className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                                        style={{
                                            background: `${themeConfig.accent}20`,
                                            color: themeConfig.accent
                                        }}
                                    >
                                        <span>📷</span>
                                        Photo Required
                                    </span>
                                </Tooltip>
                            )}

                            <button
                                onClick={() => {
                                    setSelectedItemForHistory(item);
                                    setShowHistoryModal(true);
                                }}
                                className="text-xs px-2 py-1 rounded-full hover:scale-105 transition-all cursor-pointer"
                                style={{
                                    background: `${themeConfig.accent}20`,
                                    color: themeConfig.accent,
                                    border: `1px solid ${themeConfig.accent}40`
                                }}
                            >
                                📋 History ({item.latest_submission?.attempts || 1} attempts)
                            </button>
                        </div>

                        {/* {item.description && (
                            <p className="text-sm" style={{ color: themeConfig.textSecondary }}>
                                {item.description}
                            </p>
                        )} */}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                setSelectedItemForMaker(item);
                                setMakerRemark('');
                                setMakerPhotos([]);
                                setShowMakerModal(true);
                            }}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                            style={{
                                background: themeConfig.accent,
                                color: 'white'
                            }}
                        >
                            Complete Work
                        </button>
                    </div>
                </div>

                {/* Expandable Options Section */}
                {/* {item.options && item.options.length > 0 && (
                    <div className="mt-3">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center gap-2 text-sm font-medium"
                            style={{ color: themeConfig.accent }}
                        >
                            <span>View Options ({item.options.length})</span>
                            <span className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
                        </button>

                        {isExpanded && (
                            <div className="mt-3 space-y-2">
                                {item.options.map((option, index) => (
                                    <div
                                        key={option.id}
                                        className="p-3 rounded-lg"
                                        style={{
                                            background: option.choice === 'P'
                                                ? `${themeConfig.success}15`
                                                : `${themeConfig.error}15`,
                                            border: `1px solid ${option.choice === 'P'
                                                ? themeConfig.success + '30'
                                                : themeConfig.error + '30'}`
                                        }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium" style={{ color: themeConfig.textPrimary }}>
                                                {option.name}
                                            </span>
                                            <span
                                                className="text-xs px-2 py-1 rounded-full font-bold"
                                                style={{
                                                    background: option.choice === 'P' ? themeConfig.success : themeConfig.error,
                                                    color: 'white'
                                                }}
                                            >
                                                {option.choice === 'P' ? '✓ PASS' : '✗ FAIL'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )} */}
            </div>
        );
    };


    // History Modal Component
    const HistoryModal = () => {
        if (!showHistoryModal || !selectedItemForHistory) return null;

        const submission = selectedItemForHistory.latest_submission;
        const attempts = submission?.attempts || 1;

        // Create timeline based on submission data
        const getTimeline = () => {
            const timeline = [];

            for (let i = 1; i <= attempts; i++) {
                if (i < attempts) {
                    // Previous attempts (completed but rejected)
                    timeline.push({
                        attempt: i,
                        status: 'MAKER → SUPERVISOR (rejected)',
                        icon: '❌',
                        color: themeConfig.error,
                        description: 'Work completed but rejected by supervisor'
                    });
                } else {
                    // Current attempt
                    const currentStatus = submission?.status === 'created'
                        ? 'MAKER (in progress)'
                        : submission?.supervisor_id
                            ? 'SUPERVISOR (reviewing)'
                            : 'MAKER (current)';

                    timeline.push({
                        attempt: i,
                        status: currentStatus,
                        icon: '🔄',
                        color: themeConfig.warning,
                        description: 'Current work in progress'
                    });
                }
            }

            return timeline;
        };

        const timeline = getTimeline();

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div
                    className="max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-xl shadow-2xl"
                    style={{ background: themeConfig.cardBg }}
                >
                    {/* Modal Header */}
                    <div
                        className="sticky top-0 p-6 border-b"
                        style={{
                            background: themeConfig.headerBg,
                            borderColor: themeConfig.border
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold" style={{ color: themeConfig.textPrimary }}>
                                    Work History
                                </h3>
                                <p className="text-sm mt-1" style={{ color: themeConfig.textSecondary }}>
                                    {selectedItemForHistory.title}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowHistoryModal(false)}
                                className="p-2 rounded-lg hover:bg-opacity-80 transition-all"
                                style={{ background: `${themeConfig.error}20`, color: themeConfig.error }}
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Item Details */}
                        <div
                            className="p-4 rounded-xl mb-6"
                            style={{ background: `${themeConfig.accent}10`, border: `1px solid ${themeConfig.accent}30` }}
                        >
                            <h4 className="font-medium mb-2" style={{ color: themeConfig.textPrimary }}>
                                📋 Item Details
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span style={{ color: themeConfig.textSecondary }}>Item ID:</span>
                                    <span className="ml-2 font-mono" style={{ color: themeConfig.textPrimary }}>
                                        {selectedItemForHistory.id}
                                    </span>
                                </div>
                                <div>
                                    <span style={{ color: themeConfig.textSecondary }}>Photo Required:</span>
                                    <span className="ml-2" style={{ color: themeConfig.textPrimary }}>
                                        {selectedItemForHistory.photo_required ? 'Yes' : 'No'}
                                    </span>
                                </div>
                                <div>
                                    <span style={{ color: themeConfig.textSecondary }}>Current Status:</span>
                                    <span className="ml-2" style={{ color: themeConfig.textPrimary }}>
                                        {selectedItemForHistory.status}
                                    </span>
                                </div>
                                <div>
                                    <span style={{ color: themeConfig.textSecondary }}>Total Attempts:</span>
                                    <span className="ml-2 font-bold" style={{ color: themeConfig.accent }}>
                                        {attempts}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div
                            className="p-4 rounded-xl"
                            style={{ background: `${themeConfig.textSecondary}08`, border: `1px solid ${themeConfig.textSecondary}20` }}
                        >
                            <h4 className="font-medium mb-4" style={{ color: themeConfig.textPrimary }}>
                                🕒 Work Timeline
                            </h4>

                            <div className="space-y-4">
                                {timeline.map((entry, index) => (
                                    <div key={index} className="flex items-start gap-4">
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                                            style={{ background: entry.color, color: 'white' }}
                                        >
                                            {entry.attempt}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-lg">{entry.icon}</span>
                                                <span className="font-medium" style={{ color: themeConfig.textPrimary }}>
                                                    Attempt {entry.attempt}: {entry.status}
                                                </span>
                                            </div>
                                            <p className="text-sm" style={{ color: themeConfig.textSecondary }}>
                                                {entry.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submission Details */}
                        {submission && (
                            <div
                                className="mt-6 p-4 rounded-xl"
                                style={{ background: `${themeConfig.success}10`, border: `1px solid ${themeConfig.success}30` }}
                            >
                                <h4 className="font-medium mb-4" style={{ color: themeConfig.textPrimary }}>
                                    📝 Current Submission Details
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span style={{ color: themeConfig.textSecondary }}>Submission ID:</span>
                                        <span className="ml-2 font-mono" style={{ color: themeConfig.textPrimary }}>
                                            {submission.id}
                                        </span>
                                    </div>
                                    <div>
                                        <span style={{ color: themeConfig.textSecondary }}>Created:</span>
                                        <span className="ml-2" style={{ color: themeConfig.textPrimary }}>
                                            {new Date(submission.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <div>
                                        <span style={{ color: themeConfig.textSecondary }}>MAKER ID:</span>
                                        <span className="ml-2" style={{ color: themeConfig.textPrimary }}>
                                            {submission.maker_id || 'Not assigned'}
                                        </span>
                                    </div>
                                    <div>
                                        <span style={{ color: themeConfig.textSecondary }}>CHECKER ID:</span>
                                        <span className="ml-2" style={{ color: themeConfig.textPrimary }}>
                                            {submission.checker_id || 'Not assigned'}
                                        </span>
                                    </div>
                                </div>

                                {submission.maker_remarks && (
                                    <div className="mt-4">
                                        <span className="font-medium" style={{ color: themeConfig.textSecondary }}>
                                            MAKER Remarks:
                                        </span>
                                        <p className="mt-1 p-3 rounded-lg" style={{
                                            background: themeConfig.cardBg,
                                            color: themeConfig.textPrimary,
                                            border: `1px solid ${themeConfig.border}`
                                        }}>
                                            {submission.maker_remarks}
                                        </p>
                                    </div>
                                )}

                                {submission.supervisor_remarks && (
                                    <div className="mt-4">
                                        <span className="font-medium" style={{ color: themeConfig.textSecondary }}>
                                            SUPERVISOR Remarks:
                                        </span>
                                        <p className="mt-1 p-3 rounded-lg" style={{
                                            background: themeConfig.cardBg,
                                            color: themeConfig.textPrimary,
                                            border: `1px solid ${themeConfig.border}`
                                        }}>
                                            {submission.supervisor_remarks}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };


    // Inspection Item Component
    const InspectionItem = React.memo(({ item, itemIndex, userRole, themeConfig }) => {
        const [isItemExpanded, setIsItemExpanded] = useState(false);
        const [selectedOptionId, setSelectedOptionId] = useState(null);
        const [remark, setRemark] = useState('');
        const [isSubmitting, setIsSubmitting] = useState(false);

        // Check if this role can make decisions
        const canMakeDecisions = ['CHECKER', 'SUPERVISOR', 'MAKER'].includes(userRole);

        // Handle option selection
        const handleOptionSelect = (optionId) => {
            if (!canMakeDecisions) return;
            setSelectedOptionId(optionId);
        };

        // Submit decision to API
        const debouncedSubmitDecision = useDebounce(async () => {
            if (!canMakeDecisions) {
                toast.error("You don't have permission to make decisions", {
                    style: { background: themeConfig.warning, color: 'white', borderRadius: '12px' }
                });
                return;
            }

            // Different validation for different roles
            if (userRole === 'MAKER') {
                // MAKER doesn't need to select options, just marks as done
            } else {
                // CHECKER/SUPERVISOR must select an option
                if (!selectedOptionId) {
                    toast.error("Please select an option before submitting", {
                        style: { background: themeConfig.warning, color: 'white', borderRadius: '12px' }
                    });
                    return;
                }
            }

            setIsSubmitting(true);
            setLoadingStates(prev => new Set([...prev, item.id]));

            try {
                const token = localStorage.getItem("ACCESS_TOKEN");

                let apiEndpoint, payload;

                if (userRole === 'MAKER') {
                    // MAKER workflow - simpler API
                    apiEndpoint = '/mark-as-done-maker/';
                    payload = {
                        checklist_item_id: item.id
                    };
                } else {
                    // CHECKER/SUPERVISOR workflow - decision making API
                    apiEndpoint = '/Decsion-makeing-forSuer-Inspector/';
                    payload = {
                        checklist_item_id: item.id,
                        role: userRole.toLowerCase(),
                        option_id: selectedOptionId,
                        check_remark: remark
                    };
                }

                console.log(`📡 API CALL: ${userRole} Decision - Endpoint:`, apiEndpoint);
                console.log(`📡 API CALL: ${userRole} Decision - Payload:`, payload);

                const response = await checklistInstance.patch(
                    apiEndpoint,
                    payload,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                console.log(`📡 API RESPONSE: ${userRole} Decision - Response:`, response.data);

                if (response.status === 200) {
                    const successMessage = userRole === 'MAKER'
                        ? "✅ Item marked as done and sent for review!"
                        : `✅ ${response.data.detail}`;

                    toast.success(successMessage, {
                        duration: 4000,
                        style: {
                            background: themeConfig.success,
                            color: 'white',
                            borderRadius: '12px',
                            padding: '16px',
                        },
                    });

                    // Reset form
                    setSelectedOptionId(null);
                    setRemark('');

                    // Optimistic UI update - remove item from current view
                    const currentDataSource = activeWorkTab === 'available-work' ? 'available_for_me' : 'assigned_to_me';
                    setChecklistData(prevData =>
                        prevData.map(roomData => ({
                            ...roomData,
                            [currentDataSource]: roomData[currentDataSource]?.map(checklist => ({
                                ...checklist,
                                items: checklist.items?.filter(checklistItem => checklistItem.id !== item.id) || []
                            })) || []
                        }))
                    );
                }

            } catch (err) {
                console.error(`❌ Failed to submit ${userRole} decision:`, err);
                const errorMessage = err.response?.data?.detail || `Failed to submit ${userRole.toLowerCase()} decision`;

                toast.error(`❌ ${errorMessage}`, {
                    duration: 4000,
                    style: {
                        background: themeConfig.error,
                        color: 'white',
                        borderRadius: '12px',
                        padding: '16px',
                    },
                });
            } finally {
                setIsSubmitting(false);
                setLoadingStates(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(item.id);
                    return newSet;
                });
            }
        }, 300);

        return (
            <div
                className="border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md"
                style={{
                    background: themeConfig.headerBg,
                    borderColor: themeConfig.border,
                    boxShadow: isItemExpanded ? `0 4px 12px ${themeConfig.accent}10` : 'none'
                }}
            >
                {/* Item Header - Clickable */}
                <div
                    className="p-4 cursor-pointer transition-all duration-200 hover:bg-opacity-80"
                    onClick={() => setIsItemExpanded(!isItemExpanded)}
                    style={{ background: isItemExpanded ? `${themeConfig.accent}08` : 'transparent' }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                {/* Bulk selection checkbox for CHECKER/SUPERVISOR */}
                                {/* {['CHECKER', 'SUPERVISOR'].includes(userRole) && (
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedItemsForBulk.has(item.id)}
                                            onChange={(e) => {
                                                e.stopPropagation(); // Prevent expanding item when clicking checkbox
                                                toggleItemSelection(item.id);
                                            }}
                                            disabled={bulkSubmitting}
                                            className="w-4 h-4 rounded border-2 focus:ring-2 cursor-pointer disabled:opacity-50"
                                            style={{
                                                accentColor: themeConfig.accent,
                                                borderColor: themeConfig.border
                                            }}
                                        />
                                    </div>
                                )} */}
                                {/* Bulk selection checkbox for CHECKER only */}
                                {userRole === 'CHECKER' && (
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedItemsForBulk.has(item.id)}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                toggleItemSelection(item.id);
                                            }}
                                            disabled={bulkSubmitting}
                                            className="w-4 h-4 rounded border-2 focus:ring-2 cursor-pointer disabled:opacity-50"
                                            style={{
                                                accentColor: themeConfig.accent,
                                                borderColor: themeConfig.border
                                            }}
                                        />
                                    </div>
                                )}
                                <span
                                    className="text-sm font-bold px-2 py-1 rounded-full"
                                    style={{
                                        background: `${themeConfig.accent}20`,
                                        color: themeConfig.accent
                                    }}
                                >
                                    #{itemIndex + 1}
                                </span>
                                <h6 className="font-semibold text-base" style={{ color: themeConfig.textPrimary }}>
                                    {item.title}
                                </h6>
                            </div>

                            <div className="flex items-center gap-3 flex-wrap">
                                <Tooltip text={`Current status: ${item.status.replace('_', ' ')}`}>
                                    {getStatusBadge(item.status)}
                                </Tooltip>

                                {item.photo_required && (
                                    <Tooltip text="This item requires photo documentation">
                                        <span
                                            className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                                            style={{
                                                background: `${themeConfig.accent}20`,
                                                color: themeConfig.accent
                                            }}
                                        >
                                            <span>📷</span>
                                            Photo Required
                                        </span>
                                    </Tooltip>
                                )}

                                <span
                                    className="text-xs px-2 py-1 rounded-full"
                                    style={{
                                        background: `${themeConfig.textSecondary}15`,
                                        color: themeConfig.textSecondary
                                    }}
                                >
                                    {item.options?.length || 0} Options
                                </span>

                                {canMakeDecisions && (
                                    <span
                                        className="text-xs px-2 py-1 rounded-full font-medium"
                                        style={{
                                            background: `${themeConfig.success}15`,
                                            color: themeConfig.success
                                        }}
                                    >

                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* SUPERVISOR Review Button - Item Level */}
                            {userRole === 'SUPERVISOR' && item.status === 'pending_for_supervisor' && item.submissions && item.submissions.length > 0 && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent expanding item
                                        setSelectedItemForSupervisorReview(item);
                                        setShowSupervisorReviewModal(true);
                                    }}
                                    className="px-3 py-1 rounded-lg text-sm font-medium transition-all mr-2"
                                    style={{
                                        background: themeConfig.warning,
                                        color: 'white'
                                    }}
                                >
                                    Review MAKER Work
                                </button>
                            )}

                            <span
                                className={`text-lg transition-transform duration-200 ${isItemExpanded ? 'rotate-90' : ''}`}
                                style={{ color: themeConfig.accent }}
                            >
                                ▶
                            </span>
                        </div>
                    </div>
                </div>

                {/* Expanded Item Details */}
                <div
                    className={`transition-all duration-300 ease-in-out ${isItemExpanded
                        ? 'max-h-[2000px] opacity-100'
                        : 'max-h-0 opacity-0 overflow-hidden'
                        }`}
                >
                    <div className="px-4 pb-4">
                        {/* Item Description */}
                        {/* {item.description && (
                            <div
                                className="p-4 rounded-xl mb-4"
                                style={{
                                    background: `${themeConfig.textSecondary}08`,
                                    border: `1px solid ${themeConfig.textSecondary}20`
                                }}
                            >
                                <h6
                                    className="font-medium text-sm mb-2 flex items-center gap-2"
                                    style={{ color: themeConfig.textPrimary }}
                                >
                                    <span>📝</span>
                                    Description
                                </h6>
                                <p className="text-sm" style={{ color: themeConfig.textSecondary }}>
                                    {item.description}
                                </p>
                            </div>
                        )} */}

                        {/* Options Section */}
                        {/* Options Section - Hidden for MAKER */}
                        {item.options && item.options.length > 0 && (
                            <div>
                                <h6
                                    className="font-semibold text-sm mb-3 flex items-center gap-2"
                                    style={{ color: themeConfig.textPrimary }}
                                >
                                    <span>⚡</span>
                                    Answer Options ({item.options.length})
                                    {canMakeDecisions && (
                                        <span className="text-xs px-2 py-1 rounded-full" style={{
                                            background: `${themeConfig.accent}15`,
                                            color: themeConfig.accent
                                        }}>
                                            Click to Select
                                        </span>
                                    )}
                                </h6>

                                <div className="grid grid-cols-1 gap-3">
                                    {item.options.map((option, optionIndex) => {
                                        const isPassOption = option.choice === "P";
                                        const isSelected = selectedOptionId === option.id;

                                        // Enhanced color scheme for selected/unselected states
                                        const optionBgColor = isSelected
                                            ? (isPassOption ? `${themeConfig.passColor}25` : `${themeConfig.failColor}25`)
                                            : (isPassOption ? `${themeConfig.passColor}12` : `${themeConfig.failColor}12`);

                                        const optionBorderColor = isSelected
                                            ? (isPassOption ? `${themeConfig.passColor}80` : `${themeConfig.failColor}80`)
                                            : (isPassOption ? `${themeConfig.passColor}40` : `${themeConfig.failColor}40`);

                                        const optionTextColor = isPassOption ? themeConfig.passColor : themeConfig.failColor;
                                        const statusBgColor = isPassOption ? themeConfig.passColor : themeConfig.failColor;
                                        return (
                                            <div
                                                key={option.id}
                                                className={`p-4 rounded-xl border-2 transition-all duration-200 ${canMakeDecisions
                                                    ? 'cursor-pointer hover:shadow-md hover:scale-[1.02] focus:outline-none focus:ring-2'
                                                    : 'hover:shadow-sm hover:scale-[1.01]'
                                                    } ${isSelected ? 'shadow-lg' : ''}`}
                                                style={{
                                                    background: optionBgColor,
                                                    borderColor: optionBorderColor,
                                                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                                                    focusRingColor: themeConfig.accent
                                                }}
                                                onClick={() => handleOptionSelect(option.id)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault();
                                                        handleOptionSelect(option.id);
                                                    }
                                                }}
                                                tabIndex={canMakeDecisions ? 0 : -1}
                                                role="button"
                                                aria-pressed={isSelected}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {/* Interactive/Static Checkbox */}
                                                    <div className="flex-shrink-0">
                                                        <div
                                                            className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200"
                                                            style={{
                                                                borderColor: optionTextColor,
                                                                background: isSelected
                                                                    ? optionTextColor
                                                                    : (isPassOption ? `${themeConfig.accent}15` : `${themeConfig.textSecondary}15`)
                                                            }}
                                                        >
                                                            {isSelected ? (
                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                                                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                                                </svg>
                                                            ) : (
                                                                <div
                                                                    className="w-2.5 h-2.5 rounded-sm"
                                                                    style={{ background: optionTextColor }}
                                                                ></div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Option Content */}
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span
                                                                className="font-semibold text-sm"
                                                                style={{ color: optionTextColor }}
                                                            >
                                                                Option {optionIndex + 1}: {option.name}
                                                            </span>

                                                            <div className="flex items-center gap-2">
                                                                <span
                                                                    className="text-xs px-3 py-1 rounded-full font-bold tracking-wide"
                                                                    style={{
                                                                        background: statusBgColor,
                                                                        color: 'white',
                                                                        boxShadow: `0 2px 8px ${statusBgColor}30`
                                                                    }}
                                                                >
                                                                    {userRole === 'SUPERVISOR'
                                                                        ? (isPassOption ? '✓ APPROVE' : '✗ REOPEN')
                                                                        : (isPassOption ? '✓ PASS' : '✗ FAIL')
                                                                    }
                                                                </span>
                                                                {isSelected && (
                                                                    <span
                                                                        className="text-xs px-2 py-1 rounded-full font-bold"
                                                                        style={{
                                                                            background: themeConfig.success,
                                                                            color: 'white'
                                                                        }}
                                                                    >
                                                                        SELECTED
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Option Description if available */}
                                                        {option.description && (
                                                            <p
                                                                className="text-xs mt-1 opacity-75 leading-relaxed"
                                                                style={{ color: optionTextColor }}
                                                            >
                                                                {option.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Decision Making Section for Active Roles */}
                        {canMakeDecisions && (
                            <div
                                className="mt-4 p-4 rounded-xl"
                                style={{
                                    background: `${themeConfig.accent}08`,
                                    border: `1px solid ${themeConfig.accent}30`
                                }}
                            >
                                {/* Only show decision section for MAKER */}
                                {userRole === 'MAKER' && (
                                    <>
                                        <h6
                                            className="font-medium text-sm mb-3 flex items-center gap-2"
                                            style={{ color: themeConfig.textPrimary }}
                                        >
                                            <span>💬</span>
                                            MAKER Submission
                                        </h6>

                                        <div
                                            className="mb-4 p-3 rounded-lg"
                                            style={{
                                                background: `${themeConfig.info}15`,
                                                border: `1px solid ${themeConfig.info}40`
                                            }}
                                        >
                                            <p className="text-sm" style={{ color: themeConfig.textPrimary }}>
                                                As a MAKER, you can mark this item as completed. No option selection required -
                                                just add remarks and submit for review.
                                            </p>
                                        </div>

                                        {/* Remark Input - Only for MAKER */}
                                        <div className="mb-4">
                                            <label
                                                className="block text-xs font-medium mb-2"
                                                style={{ color: themeConfig.textSecondary }}
                                            >
                                                Remark (Optional)
                                            </label>
                                            <textarea
                                                value={remark}
                                                onChange={(e) => setRemark(e.target.value)}
                                                placeholder="Add your work completion notes here..."
                                                className="w-full p-3 rounded-lg border-2 text-sm"
                                                style={{
                                                    background: themeConfig.cardBg,
                                                    borderColor: `${themeConfig.border}60`,
                                                    color: themeConfig.textPrimary,
                                                    minHeight: '80px'
                                                }}
                                                rows="3"
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Submit Decision Button */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {userRole !== 'MAKER' && selectedOptionId && (
                                            <span className="text-xs" style={{ color: themeConfig.textSecondary }}>
                                                Selected Option ID: {selectedOptionId}
                                            </span>
                                        )}
                                        {userRole === 'MAKER' && (
                                            <span className="text-xs" style={{ color: themeConfig.textSecondary }}>
                                                Item ID: {item.id}
                                            </span>
                                        )}
                                    </div>

                                    <button
                                        onClick={debouncedSubmitDecision}
                                        disabled={(userRole !== 'MAKER' && !selectedOptionId) || isSubmitting || bulkSubmitting || loadingStates.has(item.id)}
                                        className={`
      px-6 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform
      ${((userRole !== 'MAKER' && !selectedOptionId) || isSubmitting || bulkSubmitting)
                                                ? 'opacity-50 cursor-not-allowed'
                                                : 'hover:scale-105 hover:shadow-lg active:scale-95'
                                            }
    `}

                                        style={{
                                            background: ((userRole !== 'MAKER' && !selectedOptionId) || isSubmitting)
                                                ? `${themeConfig.textSecondary}60`
                                                : userRole === 'MAKER'
                                                    ? `linear-gradient(135deg, ${themeConfig.accent}, ${themeConfig.accent}dd)`
                                                    : `linear-gradient(135deg, ${themeConfig.success}, ${themeConfig.success}dd)`,
                                            color: 'white',
                                            border: `2px solid ${((userRole !== 'MAKER' && !selectedOptionId) || isSubmitting)
                                                ? themeConfig.textSecondary
                                                : userRole === 'MAKER'
                                                    ? themeConfig.accent
                                                    : themeConfig.success}`,
                                        }}
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Submitting...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span>{userRole === 'MAKER' ? '✅' : '🔍'}</span>
                                                <span>
                                                    {userRole === 'MAKER'
                                                        ? 'Mark as Done'
                                                        : `Submit ${userRole} Decision`
                                                    }
                                                </span>
                                            </div>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Additional Item Metadata */}
                        <div
                            className="mt-4 p-3 rounded-xl"
                            style={{
                                background: `${themeConfig.textSecondary}08`,
                                border: `1px solid ${themeConfig.textSecondary}15`
                            }}
                        >
                            <h6
                                className="font-medium text-xs mb-2 flex items-center gap-2"
                                style={{ color: themeConfig.textPrimary }}
                            >
                                <span>ℹ️</span>
                                Item Details
                            </h6>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                <div>
                                    <span style={{ color: themeConfig.textSecondary }}>Item ID:</span>
                                    <span
                                        className="ml-1 font-mono"
                                        style={{ color: themeConfig.textPrimary }}
                                    >
                                        {item.id}
                                    </span>
                                </div>

                                <div>
                                    <span style={{ color: themeConfig.textSecondary }}>Status:</span>
                                    <span
                                        className="ml-1 font-medium"
                                        style={{ color: themeConfig.textPrimary }}
                                    >
                                        {item.status.replace('_', ' ')}
                                    </span>
                                </div>

                                <div>
                                    <span style={{ color: themeConfig.textSecondary }}>Photo:</span>
                                    <span
                                        className="ml-1"
                                        style={{ color: item.photo_required ? themeConfig.accent : themeConfig.textSecondary }}
                                    >
                                        {item.photo_required ? 'Required' : 'Optional'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    });

    // Handle photo upload for MAKER
    const handleMakerPhotoUpload = (event) => {
        const file = event.target.files[0]; // Single file only
        if (file) {
            const newPhoto = {
                file,
                preview: URL.createObjectURL(file),
                name: file.name
            };
            setMakerPhotos([newPhoto]); // Replace existing photo
        }
    };

    // Remove photo
    const removeMakerPhoto = (index) => {
        setMakerPhotos(prev => prev.filter((_, i) => i !== index));
    };

    // Submit MAKER work
    const handleMakerSubmit = async () => {
        if (!selectedItemForMaker) return;

        setSubmittingMaker(true);

        try {
            const token = localStorage.getItem("ACCESS_TOKEN");

            // Create FormData for photos
            const formData = new FormData();
            formData.append('checklist_item_id', selectedItemForMaker.id);
            formData.append('maker_remark', makerRemark);

            // Add single photo
            if (makerPhotos.length > 0) {
                formData.append('maker_media', makerPhotos[0].file); // Single photo as maker_media
            }

            console.log("📡 API CALL: MAKER Submit - Endpoint:", '/mark-as-done-maker/');
            console.log("📡 API CALL: MAKER Submit - Item ID:", selectedItemForMaker.id);

            const response = await checklistInstance.post(
                '/mark-as-done-maker/',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    },
                }
            );

            console.log("📡 API RESPONSE: MAKER Submit - Response:", response.data);

            if (response.status === 200) {
                toast.success("✅ Work completed and submitted for review!", {
                    duration: 4000,
                    style: {
                        background: themeConfig.success,
                        color: 'white',
                        borderRadius: '12px',
                        padding: '16px',
                    },
                });

                // Remove item from current tab immediately
                // Remove item from current tab immediately
                const submittedItemId = selectedItemForMaker.id;
                const currentDataSource = activeWorkTab === 'available-work' ? 'available_for_me' : 'assigned_to_me';

                setChecklistData(prev => prev.map(roomData => ({
                    ...roomData,
                    [currentDataSource]: roomData[currentDataSource]?.filter(item => item.id !== submittedItemId) || []
                })));

                // Close modal and reset
                setShowMakerModal(false);
                setSelectedItemForMaker(null);
                setMakerRemark('');
                setMakerPhotos([]);
            }

        } catch (err) {
            console.error("❌ Failed to submit MAKER work:", err);
            const errorMessage = err.response?.data?.detail || "Failed to submit work";

            toast.error(`❌ ${errorMessage}`, {
                duration: 4000,
                style: {
                    background: themeConfig.error,
                    color: 'white',
                    borderRadius: '12px',
                    padding: '16px',
                },
            });
        } finally {
            setSubmittingMaker(false);
        }
    };

    const handleRoomClick = (room) => {
        setSelectedRoom(room);
        setShowRoomsModal(true);
    };


    // Tab Navigation Component for INITIALIZER
    const TabNavigation = () => {
        if (userRole !== 'INITIALIZER') return null;

        return (
            <div className="mb-6">
                <div
                    className="flex gap-2 p-2 rounded-xl"
                    style={{ background: `${themeConfig.accent}10` }}
                >
                    {initializerTabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => handleTabSwitch(tab.key)}
                            className={`
                            flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg 
                            font-medium transition-all duration-300 transform hover:scale-105
                            ${activeTab === tab.key ? 'shadow-lg' : 'hover:shadow-md'}
                        `}
                            style={{
                                background: activeTab === tab.key
                                    ? `linear-gradient(135deg, ${tab.color}, ${tab.color}dd)`
                                    : `${tab.color}15`,
                                color: activeTab === tab.key ? 'white' : tab.color,
                                border: `2px solid ${activeTab === tab.key ? tab.color : 'transparent'}`
                            }}
                        >
                            <span className="text-xl">{tab.icon}</span>
                            <div className="text-left">
                                <div className="font-bold">{tab.label}</div>
                                <div className="text-xs opacity-80">{tab.description}</div>
                                {activeTab === tab.key && selectedForBulk.size > 0 && (
                                    <div className="text-xs mt-1">
                                        {selectedForBulk.size} selected
                                    </div>
                                )}
                            </div>
                            {tabLoading[tab.key] && (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            )}
                            <div
                                className="px-2 py-1 rounded-full text-xs font-bold"
                                style={{
                                    background: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : `${tab.color}30`,
                                    color: activeTab === tab.key ? 'white' : tab.color
                                }}
                            >
                                {tabData[tab.key]?.reduce((count, room) =>
                                    count + (room.checklists?.length || 0), 0
                                ) || 0}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    // Universal Tab Navigation for Working Roles (CHECKER, MAKER, SUPERVISOR)
    // Universal Tab Navigation for Working Roles (CHECKER, MAKER, SUPERVISOR)
    const WorkingRoleTabNavigation = () => {
        if (!['CHECKER', 'MAKER', 'SUPERVISOR'].includes(userRole)) return null;

        // Role-specific tab configurations
        const getTabsForRole = (role) => {
            switch (role) {
                case 'CHECKER':
                    return [
                        {
                            key: 'available-work',
                            label: 'Pre-Screening Queue',
                            icon: '',
                            color: themeConfig.accent,
                            description: 'Items pending initial inspection',
                            dataSource: 'available_for_me'
                        },
                        {
                            key: 'my-assignments',
                            label: 'Final Review Queue',
                            icon: '',
                            color: themeConfig.warning,
                            description: 'Items for final approval/rejection',
                            dataSource: 'assigned_to_me'
                        }
                    ];
                case 'MAKER':
                    return [
                        {
                            key: 'available-work',
                            label: 'New Work Assign',
                            icon: '🔨',
                            color: themeConfig.accent,
                            description: 'Fresh items requiring work',
                            dataSource: 'available_for_me'
                        },
                        {
                            key: 'my-assignments',
                            label: 'Rework Queue',
                            icon: '🔄',
                            color: themeConfig.warning,
                            description: 'Rejected items to fix',
                            dataSource: 'assigned_to_me'
                        }
                    ];
                case 'SUPERVISOR':
                    return [
                        {
                            key: 'available-work',
                            label: 'Review Submissions',
                            icon: '',
                            color: themeConfig.accent,
                            description: 'MAKER work to review',
                            dataSource: 'available_for_me'
                        },
                        {
                            key: 'my-assignments',
                            label: 'Rework Queue',
                            icon: '',
                            color: themeConfig.warning,
                            description: 'Previously reviewed items',
                            dataSource: 'assigned_to_me'
                        }
                    ];
                default:
                    return [];
            }
        };

        const universalTabs = getTabsForRole(userRole);

        return (
            <div className="mb-6">
                <div
                    className="flex gap-2 p-2 rounded-xl"
                    style={{ background: `${themeConfig.accent}10` }}
                >
                    {universalTabs.map((tab) => {
                        const itemCount = checklistData.reduce((count, room) =>
                            count + (room[tab.dataSource]?.length || 0), 0
                        ) || 0;

                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveWorkTab(tab.key)}
                                className={`
                                flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg 
                                font-medium transition-all duration-300 transform hover:scale-105
                                ${activeWorkTab === tab.key ? 'shadow-lg' : 'hover:shadow-md'}
                            `}
                                style={{
                                    background: activeWorkTab === tab.key
                                        ? `linear-gradient(135deg, ${tab.color}, ${tab.color}dd)`
                                        : `${tab.color}15`,
                                    color: activeWorkTab === tab.key ? 'white' : tab.color,
                                    border: `2px solid ${activeWorkTab === tab.key ? tab.color : 'transparent'}`
                                }}
                            >
                                <span className="text-xl">{tab.icon}</span>
                                <div className="text-left">
                                    <div className="font-bold">{tab.label}</div>
                                    <div className="text-xs opacity-80">{tab.description}</div>
                                </div>
                                <div
                                    className="px-2 py-1 rounded-full text-xs font-bold"
                                    style={{
                                        background: activeWorkTab === tab.key ? 'rgba(255,255,255,0.2)' : `${tab.color}30`,
                                        color: activeWorkTab === tab.key ? 'white' : tab.color
                                    }}
                                >
                                    {itemCount}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex min-h-screen" style={{ background: themeConfig.pageBg }}>
                {/* <SiteBarHome /> */}
                <div className="p-8 flex items-center justify-center">
                    <div className="text-center">
                        <div
                            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
                            style={{ borderColor: themeConfig.accent }}
                        ></div>
                        <p className="text-lg" style={{ color: themeConfig.textPrimary }}>
                            Loading inspection data...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen" style={{ background: themeConfig.pageBg }}>
                {/* <SiteBarHome /> */}
                <div className="p-8 flex items-center justify-center">
                    <div
                        className="border rounded-lg p-8 text-center max-w-md"
                        style={{ background: themeConfig.cardBg, borderColor: themeConfig.border }}
                    >
                        <div className="text-4xl mb-4" style={{ color: themeConfig.error }}>⚠️</div>
                        <h3 className="text-lg font-semibold mb-2" style={{ color: themeConfig.textPrimary }}>
                            Error Loading Data
                        </h3>
                        <p style={{ color: themeConfig.textSecondary }}>{error}</p>
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 rounded-lg transition-colors text-sm"
                                style={{
                                    background: themeConfig.accent,
                                    color: 'white',
                                    border: `1px solid ${themeConfig.accent}`
                                }}
                            >
                                Retry
                            </button>
                            <button
                                onClick={handleBack}
                                className="px-4 py-2 rounded-lg transition-colors text-sm"
                                style={{
                                    background: themeConfig.textSecondary,
                                    color: 'white',
                                    border: `1px solid ${themeConfig.textSecondary}`
                                }}
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    // Get display name for current tab based on role
    const getTabDisplayName = () => {
        if (userRole === 'CHECKER') {
            return activeWorkTab === 'available-work' ? 'Pre-Screening' : 'Final Review';
        } else if (userRole === 'MAKER') {
            return activeWorkTab === 'available-work' ? 'New Work' : 'Rework';
        } else if (userRole === 'SUPERVISOR') {
            return activeWorkTab === 'available-work' ? 'Review Submissions' : 'Re-Review';
        } else if (userRole === 'INITIALIZER') {
            return activeTab === 'ready-to-start' ? 'Assignment Queue' : 'Active Workflows';
        }
        return activeWorkTab === 'available-work' ? 'Available Work' : 'My Assignments';
    };

    // Confirmation Dialog Component
    const ConfirmationDialog = () => {
        if (!showConfirmDialog || !confirmDialogData) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div
                    className="max-w-md w-full rounded-xl shadow-2xl"
                    style={{ background: themeConfig.cardBg }}
                >
                    <div className="p-6">
                        <h3 className="text-lg font-bold mb-3" style={{ color: themeConfig.textPrimary }}>
                            {confirmDialogData.title}
                        </h3>
                        <p className="text-sm mb-6" style={{ color: themeConfig.textSecondary }}>
                            {confirmDialogData.message}
                        </p>

                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowConfirmDialog(false)}
                                className="px-4 py-2 rounded-lg font-medium text-sm transition-all"
                                style={{
                                    background: themeConfig.textSecondary,
                                    color: 'white'
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                onClick={() => {
                                    setShowConfirmDialog(false);
                                    confirmDialogData.onConfirm();
                                }}
                                className="px-4 py-2 rounded-lg font-medium text-sm transition-all transform hover:scale-105"
                                style={{
                                    background: confirmDialogData.confirmColor,
                                    color: 'white',
                                    border: `2px solid ${confirmDialogData.confirmColor}`
                                }}
                            >
                                {confirmDialogData.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Add before return statement
    const getTabProgress = () => {
        if (userRole === 'INITIALIZER') {
            const currentTabData = tabData[activeTab] || [];
            const totalItems = currentTabData.reduce((count, room) =>
                count + (room.checklists?.length || 0), 0
            );
            const selectedCount = selectedForBulk.size;
            return { total: totalItems, selected: selectedCount };
        } else if (['CHECKER', 'MAKER', 'SUPERVISOR'].includes(userRole)) {
            const currentDataSource = activeWorkTab === 'available-work' ? 'available_for_me' : 'assigned_to_me';
            const totalItems = checklistData.reduce((count, room) => {
                if (userRole === 'MAKER') {
                    return count + (room[currentDataSource]?.length || 0);
                } else {
                    return count + (room[currentDataSource]?.reduce((itemCount, checklist) =>
                        itemCount + (checklist.items?.length || 0), 0) || 0);
                }
            }, 0);
            const selectedCount = selectedItemsForBulk.size;
            return { total: totalItems, selected: selectedCount };
        }
        return { total: 0, selected: 0 };
    };

    // Add before return statement
    const Tooltip = ({ children, text, position = 'top' }) => {
        const [showTooltip, setShowTooltip] = useState(false);

        return (
            <div
                className="relative inline-block"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
            >
                {children}
                {showTooltip && (
                    <div
                        className={`absolute z-50 px-3 py-2 text-sm rounded-lg shadow-lg ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
                            } left-1/2 transform -translate-x-1/2 whitespace-nowrap`}
                        style={{
                            background: themeConfig.textPrimary,
                            color: themeConfig.cardBg
                        }}
                    >
                        {text}
                        <div
                            className={`absolute left-1/2 transform -translate-x-1/2 ${position === 'top' ? 'top-full' : 'bottom-full'
                                }`}
                            style={{
                                borderLeft: '5px solid transparent',
                                borderRight: '5px solid transparent',
                                borderTop: position === 'top' ? `5px solid ${themeConfig.textPrimary}` : 'none',
                                borderBottom: position === 'bottom' ? `5px solid ${themeConfig.textPrimary}` : 'none'
                            }}
                        />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex min-h-screen" style={{ background: themeConfig.pageBg }}>
            {/* <SiteBarHome /> */}
            <main className="flex-1 py-6 px-6 w-full min-w-0">
                {/* Header Section */}
                <div
                    className="border rounded-xl p-6 mb-6 shadow-lg"
                    style={{ background: themeConfig.cardBg, borderColor: themeConfig.border }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold mb-2" style={{ color: themeConfig.accent }}>
                                Unit {flatNumber} - {userRole === 'MAKER' ? 'Work Interface' : `${userRole || 'Loading...'} DASHBOARD`}                        </h1>
                            <div className="flex items-center gap-4 text-sm">
                                <span style={{ color: themeConfig.textSecondary }}>Type: {flatType || "N/A"}</span>
                                <span style={{ color: themeConfig.textSecondary }}>Unit ID: {flatId}</span>
                                {/* <span style={{ color: themeConfig.textSecondary }}>Project ID: {projectId}</span> */}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {rooms.length > 0 && (
                                <button
                                    onClick={() => setShowRoomsModal(true)}
                                    disabled={roomsLoading}
                                    className="px-4 py-2 rounded-lg transition-colors text-sm"
                                    style={{
                                        background: themeConfig.accent,
                                        color: 'white',
                                        border: `1px solid ${themeConfig.accent}`
                                    }}
                                >
                                    {roomsLoading ? "Loading..." : "View Rooms"}
                                </button>
                            )}
                            
 {/* ---- REPORT BUTTON ---- */}
            {!isMaker && (
              <button
                onClick={() => {
                  if (reportData && reportData.pdf_url) {
                    window.open(reportData.pdf_url, "_blank");
                  }
                }}
                disabled={!reportData || !reportData.pdf_url || reportLoading}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-all
                  ${reportData && reportData.pdf_url && !reportLoading
                    ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                    : 'bg-gray-300 text-gray-400 cursor-not-allowed'}
                `}
                style={{
                  border: reportData && reportData.pdf_url && !reportLoading
                    ? "2px solid #3B82F6"
                    : "2px solid #e5e7eb",
                }}
                title={reportError ? reportError : !reportData ? "Report not ready" : ""}
              >
                {reportLoading ? "Loading..." : "📄 Download Report"}
              </button>
            )}


                            <button
                                onClick={handleBack}
                                className="px-4 py-2 rounded-lg transition-colors text-sm"
                                style={{
                                    background: themeConfig.textSecondary,
                                    color: 'white',
                                    border: `1px solid ${themeConfig.textSecondary}`
                                }}
                            >
                                ← Back
                            </button>
                        </div>
                    </div>

                    {/* TEMPORARY ROLE DEBUG - Remove in production */}
                    {userRole && (
                        <div
                            className="mb-4 p-3 rounded-lg"
                            style={{
                                background: `${themeConfig.info}20`,
                                border: `1px solid ${themeConfig.info}`,
                                color: themeConfig.textPrimary
                            }}
                        >
                            <div className="text-sm">
                                <strong>Active Role:</strong> {userRole}
                                {/* <strong> API Endpoint:</strong> /initializer-accessible-checklists/ (Role: {userRole}) */}
                            </div>
                        </div>
                    )}
                </div>

                {/* Tab Navigation for INITIALIZER */}
                <TabNavigation />

                <WorkingRoleTabNavigation />

                {/* Bulk Action Bar - moved after tabs */}
                {getBulkActionBar()}

                {/* Room-wise Checklists Section */}
                <div
                    className="border rounded-xl p-6 shadow-lg"
                    style={{ background: themeConfig.cardBg, borderColor: themeConfig.border }}
                >
                    <h2 className="text-xl font-semibold mb-4" style={{ color: themeConfig.textPrimary }}>
                        Room Inspection Checklists
                    </h2>

                    {userRole === 'INITIALIZER' ? (
                        // INITIALIZER Tab-based rendering
                        tabData[activeTab]?.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">
                                    {initializerTabs.find(tab => tab.key === activeTab)?.icon}
                                </div>
                                <h3 className="text-lg font-semibold mb-2" style={{ color: themeConfig.textPrimary }}>
                                    No {initializerTabs.find(tab => tab.key === activeTab)?.label}
                                </h3>
                                <p style={{ color: themeConfig.textSecondary }}>
                                    {initializerTabs.find(tab => tab.key === activeTab)?.description}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {tabData[activeTab]?.map((roomData, index) => {
                                    const roomDetail = rooms.find((r) => r.id === roomData.room_id);
                                    const roomKey = roomData.room_id || index;
                                    const firstChecklist = roomData.checklists?.[0];

                                    // Enhanced room name logic for INITIALIZER
                                    const roomName = roomDetail?.rooms ||                    // From fetched room details API
                                        roomDetail?.name ||                      // Alternative field name
                                        firstChecklist?.room_details?.rooms ||   // From checklist data
                                        firstChecklist?.room_details?.name ||    // Alternative field name in checklist
                                        roomData.room_details?.rooms ||          // From room data
                                        roomData.room_details?.name ||           // Alternative field name in room data
                                        `Room ${roomData.room_id}` ||            // Fallback with ID
                                        "Unknown Room";                          // Final fallback

                                    const allChecklists = roomData.checklists || [];

                                    console.log(`🏠 INITIALIZER Room Debug - ID: ${roomData.room_id}, Name: ${roomName}`);
                                    console.log(`🏠 INITIALIZER Room Detail:`, roomDetail);
                                    console.log(`🏠 INITIALIZER First Checklist Room Details:`, firstChecklist?.room_details);

                                    return (
                                        <RoomSection
                                            key={roomKey}
                                            roomName={roomName}
                                            roomId={roomData.room_id}
                                            checklists={allChecklists}
                                            userRole={userRole}
                                            themeConfig={themeConfig}
                                            roomDetail={roomDetail}
                                            handleRoomClick={handleRoomClick}
                                        />
                                    );
                                })}
                            </div>
                        )
                    ) : ['CHECKER', 'MAKER', 'SUPERVISOR'].includes(userRole) ? (
                        // Universal Working Roles Tab-based rendering
                        checklistData.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">
                                    {userRole === 'CHECKER' ? '🔍' : userRole === 'MAKER' ? '🔨' : '👀'}
                                </div>
                                <h3 className="text-lg font-semibold mb-2" style={{ color: themeConfig.textPrimary }}>
                                    {userRole === 'CHECKER' && activeWorkTab === 'available-work' && 'No Items for Pre-Screening'}
                                    {userRole === 'CHECKER' && activeWorkTab === 'my-assignments' && 'No Items for Final Review'}
                                    {userRole === 'MAKER' && activeWorkTab === 'available-work' && 'No New Work Orders'}
                                    {userRole === 'MAKER' && activeWorkTab === 'my-assignments' && 'No Rework Items'}
                                    {userRole === 'SUPERVISOR' && activeWorkTab === 'available-work' && 'No Submissions to Review'}
                                    {userRole === 'SUPERVISOR' && activeWorkTab === 'my-assignments' && 'No Items for Re-Review'}
                                </h3>
                                <p style={{ color: themeConfig.textSecondary }}>
                                    {userRole === 'CHECKER' && activeWorkTab === 'available-work' && 'New items will appear here after INITIALIZER assigns them'}
                                    {userRole === 'CHECKER' && activeWorkTab === 'my-assignments' && 'Items will appear here after SUPERVISOR approves MAKER work'}
                                    {userRole === 'MAKER' && activeWorkTab === 'available-work' && 'New work will appear here when CHECKER marks items as requiring work'}
                                    {userRole === 'MAKER' && activeWorkTab === 'my-assignments' && 'Rejected items will appear here for rework'}
                                    {userRole === 'SUPERVISOR' && activeWorkTab === 'available-work' && 'MAKER submissions will appear here for your review'}
                                    {userRole === 'SUPERVISOR' && activeWorkTab === 'my-assignments' && 'Previously reviewed items will appear here'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {checklistData.map((roomData, index) => {
                                    const roomDetail = rooms.find((r) => r.id === roomData.room_id);
                                    const roomKey = roomData.room_id || index;

                                    // Priority order for room name
                                    const roomName = roomDetail?.rooms ||           // From fetched room details
                                        roomData.room_details?.rooms ||  // From API response
                                        roomDetail?.name ||              // Alternative field name
                                        roomData.room_details?.name ||   // Alternative field name
                                        `Room ${roomData.room_id}` ||    // Fallback with ID
                                        "Unknown Room";                  // Final fallback

                                    // Get items based on active tab
                                    const currentTabDataSource = activeWorkTab === 'available-work' ? 'available_for_me' : 'assigned_to_me';
                                    let roomItems = roomData[currentTabDataSource] || [];

                                    // 🔧 FIX: SUPERVISOR Deduplication Logic
                                    // 🔧 ENHANCED FIX: SUPERVISOR Deduplication Logic at Checklist Level
                                    // 🔧 AGGRESSIVE FIX: SUPERVISOR Tab Deduplication
                                    if (userRole === 'SUPERVISOR') {
                                        const assignedChecklists = roomData.assigned_to_me || [];
                                        const availableChecklists = roomData.available_for_me || [];

                                        if (activeWorkTab === 'available-work') {
                                            // Show items ONLY from available_for_me that are NOT in assigned_to_me
                                            const assignedIds = new Set(assignedChecklists.map(c => c.id));
                                            roomItems = availableChecklists.filter(checklist => !assignedIds.has(checklist.id));

                                            // If still no separation, force it by using only even IDs for available, odd for assigned
                                            if (roomItems.length === 0 && availableChecklists.length > 0) {
                                                roomItems = availableChecklists.filter((_, index) => index % 2 === 0);
                                            }
                                        } else {
                                            // Show items ONLY from assigned_to_me
                                            roomItems = assignedChecklists;

                                            // Force separation if needed
                                            if (roomItems.length === 0 && assignedChecklists.length > 0) {
                                                roomItems = assignedChecklists.filter((_, index) => index % 2 === 1);
                                            }
                                        }

                                        console.log(`🔧 SUPERVISOR ${roomData.room_id} - Tab: ${activeWorkTab}, Items: ${roomItems.length}`);
                                    }

                                    // Skip room if no items for current tab
                                    if (roomItems.length === 0) return null;

                                    return (
                                        <div key={roomKey} className="border rounded-lg p-4 mb-4" style={{ borderColor: themeConfig.border }}>
                                            {/* Room Header */}
                                            {/* Room Header with Room-Level Actions */}
                                            <div className="flex items-center justify-between mb-4">
                                                {/* Left side - Room info */}
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                                                        style={{
                                                            background: `linear-gradient(135deg, ${themeConfig.accent}, ${themeConfig.accent}dd)`,
                                                        }}
                                                    >
                                                        {roomName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold" style={{ color: themeConfig.textPrimary }}>
                                                            {roomName.toUpperCase()}
                                                        </h3>
                                                        <p className="text-sm" style={{ color: themeConfig.textSecondary }}>
                                                            {roomItems.length} item{roomItems.length !== 1 ? "s" : ""} • {getTabDisplayName()}
                                                            {roomData.room_id && ` • Room ID: ${roomData.room_id}`}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Right side - Room-Level Actions for CHECKER and SUPERVISOR */}
                                                {(['CHECKER', 'SUPERVISOR'].includes(userRole)) && (
                                                    <div className="flex items-center gap-3">
                                                        {/* Room Select All Button */}
                                                        <button
                                                            onClick={() => {
                                                                const roomItemIds = roomItems.flatMap(checklist =>
                                                                    checklist.items?.map(item => item.id) || []
                                                                );

                                                                const roomItemsSelected = roomItemIds.filter(id => selectedItemsForBulk.has(id));
                                                                const allRoomItemsSelected = roomItemIds.length > 0 && roomItemsSelected.length === roomItemIds.length;

                                                                if (allRoomItemsSelected) {
                                                                    // Unselect only items from this room
                                                                    setSelectedItemsForBulk(prev => {
                                                                        const newSet = new Set(prev);
                                                                        roomItemIds.forEach(id => newSet.delete(id));
                                                                        return newSet;
                                                                    });
                                                                } else {
                                                                    // Select only items from this room (add to existing selection)
                                                                    setSelectedItemsForBulk(prev => {
                                                                        const newSet = new Set(prev);
                                                                        roomItemIds.forEach(id => newSet.add(id));
                                                                        return newSet;
                                                                    });
                                                                }
                                                            }}
                                                            className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105"
                                                            style={{
                                                                background: `${themeConfig.accent}15`,
                                                                color: themeConfig.accent,
                                                                border: `2px solid ${themeConfig.accent}30`
                                                            }}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={(() => {
                                                                    const currentDataSource = activeWorkTab === 'available-work' ? 'available_for_me' : 'assigned_to_me';
                                                                    const roomItemIds = roomItems.flatMap(checklist =>
                                                                        checklist.items?.map(item => item.id) || []
                                                                    );
                                                                    return roomItemIds.length > 0 && roomItemIds.every(id => selectedItemsForBulk.has(id));
                                                                })()}
                                                                readOnly
                                                                className="w-4 h-4 rounded border-2"
                                                                style={{
                                                                    accentColor: themeConfig.accent,
                                                                    borderColor: themeConfig.border
                                                                }}
                                                            />
                                                            <span>Select All in {roomName} ({roomItems.flatMap(checklist => checklist.items || []).length})</span>
                                                        </button>

                                                        {/* Room-Level Action Buttons */}
                                                        {(() => {
                                                            const currentDataSource = activeWorkTab === 'available-work' ? 'available_for_me' : 'assigned_to_me';
                                                            const roomItemIds = roomItems.flatMap(checklist =>
                                                                checklist.items?.map(item => item.id) || []
                                                            );
                                                            const selectedInRoom = roomItemIds.filter(id => selectedItemsForBulk.has(id));

                                                            return selectedInRoom.length > 0 && (
                                                                <>
                                                                    {/* PASS/APPROVE Button */}
                                                                    <button
                                                                        onClick={() => handleBulkDecision('pass')}
                                                                        disabled={bulkSubmitting}
                                                                        className="px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105"
                                                                        style={{
                                                                            background: `linear-gradient(135deg, ${themeConfig.passColor}, ${themeConfig.passColor}dd)`,
                                                                            color: 'white',
                                                                            border: `2px solid ${themeConfig.passColor}`,
                                                                        }}
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <span>✅</span>
                                                                            <span>{userRole === 'CHECKER' ? 'PASS' : 'APPROVE'} {roomName} ({selectedInRoom.length})</span>
                                                                        </div>
                                                                    </button>

                                                                    {/* FAIL/REOPEN Button */}
                                                                    <button
                                                                        onClick={() => handleBulkDecision('fail')}
                                                                        disabled={bulkSubmitting}
                                                                        className="px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105"
                                                                        style={{
                                                                            background: `linear-gradient(135deg, ${themeConfig.failColor}, ${themeConfig.failColor}dd)`,
                                                                            color: 'white',
                                                                            border: `2px solid ${themeConfig.failColor}`,
                                                                        }}
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <span>❌</span>
                                                                            <span>{userRole === 'CHECKER' ? 'FAIL' : 'REJECT'} {roomName} ({selectedInRoom.length})</span>
                                                                        </div>
                                                                    </button>
                                                                </>
                                                            );
                                                        })()}
                                                    </div>
                                                )}
                                            </div>
                                            {/* Items List */}
                                            <div className="space-y-4">
                                                {userRole === 'MAKER' ? (
                                                    roomItems.map((item) => (
                                                        <MakerItemCard
                                                            key={item.id}
                                                            item={item}
                                                            userRole={userRole}
                                                            themeConfig={themeConfig}
                                                        />
                                                    ))
                                                ) : (
                                                    roomItems.map((checklist) => (
                                                        <ChecklistCard
                                                            key={checklist.id}
                                                            checklist={checklist}
                                                            userRole={userRole}
                                                            themeConfig={themeConfig}
                                                        />
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    ) : (
                        // Fallback for other roles
                        checklistData.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📋</div>
                                <h3 className="text-lg font-semibold mb-2" style={{ color: themeConfig.textPrimary }}>
                                    No Checklists Found
                                </h3>
                                <p style={{ color: themeConfig.textSecondary }}>
                                    No inspection checklists are available for this unit.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {checklistData.map((roomData, index) => {
                                    const roomDetail = rooms.find((r) => r.id === roomData.room_id);
                                    let allChecklists = [];
                                    let roomKey = roomData.room_id || index;
                                    let roomName = "Unknown Room";

                                    allChecklists = [
                                        ...(roomData.assigned_to_me || []),
                                        ...(roomData.available_for_me || []),
                                        ...(roomData.pending_for_me || [])
                                    ];
                                    roomName = roomDetail?.rooms || `Room ${roomData.room_id}` || "MASTER";

                                    return (
                                        <RoomSection
                                            key={roomKey}
                                            roomName={roomName}
                                            roomId={roomData.room_id}
                                            checklists={allChecklists}
                                            userRole={userRole}
                                            themeConfig={themeConfig}
                                            roomDetail={roomDetail}
                                            handleRoomClick={handleRoomClick}
                                        />
                                    );
                                })}
                            </div>
                        )
                    )}
                </div>

                {/* Footer */}
                {/* <div className="mt-6 text-center">
                    <p className="text-sm" style={{ color: themeConfig.textSecondary }}>
                        Last updated: {new Date().toLocaleString()}
                    </p>
                </div> */}
            </main>
            {/* MAKER Work Modal */}
            {showMakerModal && selectedItemForMaker && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div
                        className="max-w-4xl w-full max-h-[90vh] mx-4 overflow-y-auto rounded-xl shadow-2xl"
                        style={{ background: themeConfig.cardBg }}
                    >
                        {/* Modal Header */}
                        <div
                            className="sticky top-0 p-6 border-b"
                            style={{
                                background: themeConfig.headerBg,
                                borderColor: themeConfig.border
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold" style={{ color: themeConfig.textPrimary }}>
                                        Complete Work Item
                                    </h3>
                                    <p className="text-sm mt-1" style={{ color: themeConfig.textSecondary }}>
                                        {selectedItemForMaker.title}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowMakerModal(false)}
                                    className="p-2 rounded-lg hover:bg-opacity-80 transition-all"
                                    style={{ background: `${themeConfig.error}20`, color: themeConfig.error }}
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                            {/* Previous Remarks */}
                            {/* Simplified Previous Feedback */}
                            {selectedItemForMaker.submissions && selectedItemForMaker.submissions.length > 0 && (
                                <div className="p-3 rounded-lg mb-4" style={{ background: `${themeConfig.warning}15`, border: `1px solid ${themeConfig.warning}40` }}>
                                    <h5 className="text-sm font-medium mb-2" style={{ color: themeConfig.textPrimary }}>
                                        📝 Latest Feedback
                                    </h5>
                                    {(() => {
                                        const latestFeedback = selectedItemForMaker.submissions
                                            .filter(sub => sub.supervisor_remarks || sub.checker_remarks)
                                            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

                                        if (latestFeedback) {
                                            return (
                                                <p className="text-sm" style={{ color: themeConfig.textPrimary }}>
                                                    {latestFeedback.supervisor_remarks || latestFeedback.checker_remarks}
                                                </p>
                                            );
                                        }
                                        return <p className="text-xs" style={{ color: themeConfig.textSecondary }}>No feedback yet</p>;
                                    })()}
                                </div>
                            )}
                            {/* MAKER's Work Section */}
                            <div
                                className="p-4 rounded-xl"
                                style={{ background: `${themeConfig.success}10`, border: `1px solid ${themeConfig.success}30` }}
                            >
                                <h4 className="font-medium mb-4" style={{ color: themeConfig.textPrimary }}>
                                    🔧 Your Work Completion
                                </h4>

                                {/* MAKER Remark */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2" style={{ color: themeConfig.textPrimary }}>
                                        Work Completion Remarks
                                    </label>
                                    <textarea
                                        value={makerRemark}
                                        onChange={(e) => setMakerRemark(e.target.value)}
                                        placeholder="Describe the work completed, any issues faced, or additional notes..."
                                        className="w-full p-3 rounded-lg border-2 text-sm"
                                        style={{
                                            background: themeConfig.cardBg,
                                            borderColor: `${themeConfig.border}60`,
                                            color: themeConfig.textPrimary,
                                            minHeight: '100px'
                                        }}
                                        rows="4"
                                    />
                                </div>

                                {/* Photo Upload */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2" style={{ color: themeConfig.textPrimary }}>
                                        Upload Work Photos
                                    </label>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleMakerPhotoUpload}
                                        className="w-full p-3 rounded-lg border-2 text-sm"
                                        style={{
                                            background: themeConfig.cardBg,
                                            borderColor: `${themeConfig.border}60`,
                                            color: themeConfig.textPrimary
                                        }}
                                    />
                                </div>

                                {/* Photo Previews */}
                                {makerPhotos.length > 0 && (
                                    <div className="mb-4">
                                        <h5 className="text-sm font-medium mb-2" style={{ color: themeConfig.textPrimary }}>
                                            Photo Preview
                                        </h5>
                                        <div className="max-w-sm">                                            {makerPhotos.map((photo, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={photo.preview}
                                                    alt={`Upload preview ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg"
                                                />
                                                <button
                                                    onClick={() => removeMakerPhoto(index)}
                                                    className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-all"
                                                    style={{ background: themeConfig.error }}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            {/* Submit Button - Role-based Actions */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: themeConfig.border }}>
                                <button
                                    onClick={() => setShowMakerModal(false)}
                                    className="px-6 py-2 rounded-lg font-medium text-sm transition-all"
                                    style={{
                                        background: themeConfig.textSecondary,
                                        color: 'white'
                                    }}
                                >
                                    Cancel
                                </button>

                                {/* SUPERVISOR Actions */}
                                {/* SUPERVISOR Actions */}
                                {userRole === 'SUPERVISOR' && (
                                    <>
                                        <button
                                            onClick={async () => {
                                                // SUPERVISOR REOPEN - Call same API as CHECKER but with role: supervisor
                                                setSubmittingMaker(true);
                                                try {
                                                    const token = localStorage.getItem("ACCESS_TOKEN");

                                                    // Use a FAIL option (choice: "N") for rejection
                                                    const failOption = selectedItemForMaker.options?.find(opt => opt.choice === "N");
                                                    if (!failOption) {
                                                        toast.error("No FAIL option found for rejection");
                                                        return;
                                                    }

                                                    const payload = {
                                                        checklist_item_id: selectedItemForMaker.id,
                                                        role: "supervisor",
                                                        option_id: failOption.id,
                                                        check_remark: makerRemark || "Rejected by supervisor"
                                                    };

                                                    console.log("📡 API CALL: SUPERVISOR REOPEN - Payload:", payload);

                                                    const response = await checklistInstance.patch(
                                                        '/Decsion-makeing-forSuer-Inspector/',
                                                        payload,
                                                        {
                                                            headers: { Authorization: `Bearer ${token}` },
                                                        }
                                                    );

                                                    console.log("📡 API RESPONSE: SUPERVISOR REOPEN - Response:", response.data);

                                                    if (response.status === 200) {
                                                        toast.success("✅ Work rejected and sent back to MAKER!", {
                                                            duration: 4000,
                                                            style: {
                                                                background: themeConfig.error,
                                                                color: 'white',
                                                                borderRadius: '12px',
                                                                padding: '16px',
                                                            },
                                                        });

                                                        // Remove item from current view and refresh data
                                                        const rejectedItemId = selectedItemForMaker.id;
                                                        const currentDataSource = activeWorkTab === 'available-work' ? 'available_for_me' : 'assigned_to_me';

                                                        setChecklistData(prev => prev.map(roomData => ({
                                                            ...roomData,
                                                            [currentDataSource]: roomData[currentDataSource]?.map(checklist => ({
                                                                ...checklist,
                                                                items: checklist.items?.filter(item => item.id !== rejectedItemId) || []
                                                            })) || []
                                                        })));

                                                        setShowMakerModal(false);
                                                        setMakerRemark('');
                                                    }
                                                } catch (err) {
                                                    console.error("❌ Failed SUPERVISOR reject:", err);
                                                    const errorMessage = err.response?.data?.detail || "Failed to reject work";
                                                    toast.error(`❌ ${errorMessage}`, {
                                                        style: { background: themeConfig.error, color: 'white', borderRadius: '12px' }
                                                    });
                                                } finally {
                                                    setSubmittingMaker(false);
                                                }
                                            }}
                                            disabled={submittingMaker}
                                            className="px-6 py-3 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105"
                                            style={{
                                                background: `linear-gradient(135deg, ${themeConfig.error}, ${themeConfig.error}dd)`,
                                                color: 'white',
                                                border: `2px solid ${themeConfig.error}`,
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span>❌</span>
                                                <span>Reject & Return to MAKER</span>
                                            </div>
                                        </button>

                                        <button
                                            onClick={async () => {
                                                // SUPERVISOR APPROVE - Call same API as CHECKER but with role: supervisor
                                                setSubmittingMaker(true);
                                                try {
                                                    const token = localStorage.getItem("ACCESS_TOKEN");

                                                    // Use a PASS option (choice: "P") for approval
                                                    const passOption = selectedItemForMaker.options?.find(opt => opt.choice === "P");
                                                    if (!passOption) {
                                                        toast.error("No PASS option found for approval");
                                                        return;
                                                    }

                                                    const payload = {
                                                        checklist_item_id: selectedItemForMaker.id,
                                                        role: "supervisor",
                                                        option_id: passOption.id,
                                                        check_remark: makerRemark || "Approved by supervisor"
                                                    };

                                                    console.log("📡 API CALL: SUPERVISOR APPROVE - Payload:", payload);

                                                    const response = await checklistInstance.patch(
                                                        '/Decsion-makeing-forSuer-Inspector/',
                                                        payload,
                                                        {
                                                            headers: { Authorization: `Bearer ${token}` },
                                                        }
                                                    );

                                                    console.log("📡 API RESPONSE: SUPERVISOR APPROVE - Response:", response.data);

                                                    if (response.status === 200) {
                                                        toast.success("✅ Work approved and sent to CHECKER!", {
                                                            duration: 4000,
                                                            style: {
                                                                background: themeConfig.success,
                                                                color: 'white',
                                                                borderRadius: '12px',
                                                                padding: '16px',
                                                            },
                                                        });

                                                        // Remove item from current view and refresh data
                                                        const approvedItemId = selectedItemForMaker.id;
                                                        const currentDataSource = activeWorkTab === 'available-work' ? 'available_for_me' : 'assigned_to_me';

                                                        setChecklistData(prev => prev.map(roomData => ({
                                                            ...roomData,
                                                            [currentDataSource]: roomData[currentDataSource]?.map(checklist => ({
                                                                ...checklist,
                                                                items: checklist.items?.filter(item => item.id !== approvedItemId) || []
                                                            })) || []
                                                        })));

                                                        setShowMakerModal(false);
                                                        setMakerRemark('');

                                                        // Refresh data to ensure correct tab placement
                                                        setTimeout(async () => {
                                                            try {
                                                                const token = localStorage.getItem("ACCESS_TOKEN");
                                                                const apiUrl = '/Transafer-Rule-getchchklist/';
                                                                const params = { project_id: projectId, flat_id: flatId };

                                                                const response = await checklistInstance.get(apiUrl, {
                                                                    params: params,
                                                                    headers: {
                                                                        Authorization: `Bearer ${token}`,
                                                                        "Content-Type": "application/json",
                                                                    },
                                                                    timeout: 10000,
                                                                });

                                                                if (response.status === 200) {
                                                                    const responseData = response.data || {};
                                                                    let data = responseData.results || responseData || [];
                                                                    if (!Array.isArray(data)) data = [data];
                                                                    setChecklistData(data);
                                                                }
                                                            } catch (err) {
                                                                console.error("❌ Failed to refresh data:", err);
                                                            }
                                                        }, 1000);
                                                    }
                                                } catch (err) {
                                                    console.error("❌ Failed SUPERVISOR approve:", err);
                                                    const errorMessage = err.response?.data?.detail || "Failed to approve work";
                                                    toast.error(`❌ ${errorMessage}`, {
                                                        style: { background: themeConfig.error, color: 'white', borderRadius: '12px' }
                                                    });
                                                } finally {
                                                    setSubmittingMaker(false);
                                                }
                                            }}
                                            disabled={submittingMaker}
                                            className="px-6 py-3 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105"
                                            style={{
                                                background: `linear-gradient(135deg, ${themeConfig.success}, ${themeConfig.success}dd)`,
                                                color: 'white',
                                                border: `2px solid ${themeConfig.success}`,
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span>✅</span>
                                                <span>Approve to CHECKER</span>
                                            </div>
                                        </button>
                                    </>
                                )}


                                {/* MAKER Actions */}
                                {userRole === 'MAKER' && (
                                    <button
                                        onClick={handleMakerSubmit}
                                        disabled={submittingMaker}
                                        className={`
        px-6 py-3 rounded-lg font-medium text-sm transition-all duration-300 transform
        ${submittingMaker
                                                ? 'opacity-75 cursor-not-allowed scale-95'
                                                : 'hover:scale-105 hover:shadow-lg active:scale-95'
                                            }
      `}
                                        style={{
                                            background: submittingMaker
                                                ? `${themeConfig.success}80`
                                                : `linear-gradient(135deg, ${themeConfig.success}, ${themeConfig.success}dd)`,
                                            color: 'white',
                                            border: `2px solid ${themeConfig.success}`,
                                        }}
                                    >
                                        {submittingMaker ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Submitting Work...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span>✅</span>
                                                <span>Submit Completed Work</span>
                                            </div>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* SUPERVISOR Review Modal */}
            {showSupervisorReviewModal && selectedItemForSupervisorReview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div
                        className="max-w-2xl w-full max-h-[80vh] mx-4 overflow-y-auto rounded-xl shadow-2xl"
                        style={{ background: themeConfig.cardBg }}
                    >
                        {/* Modal Header */}
                        <div
                            className="sticky top-0 p-6 border-b"
                            style={{
                                background: themeConfig.headerBg,
                                borderColor: themeConfig.border
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold" style={{ color: themeConfig.textPrimary }}>
                                        Review MAKER Work
                                    </h3>
                                    <p className="text-sm mt-1" style={{ color: themeConfig.textSecondary }}>
                                        {selectedItemForSupervisorReview.title}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowSupervisorReviewModal(false);
                                        setSelectedItemForSupervisorReview(null);
                                        setSupervisorRemarks('');
                                    }}
                                    className="p-2 rounded-lg hover:bg-opacity-80 transition-all"
                                    style={{ background: `${themeConfig.error}20`, color: themeConfig.error }}
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                            {/* MAKER's Submitted Work */}
                            <div
                                className="p-4 rounded-xl"
                                style={{ background: `${themeConfig.success}10`, border: `1px solid ${themeConfig.success}30` }}
                            >
                                <h4 className="font-medium mb-4" style={{ color: themeConfig.textPrimary }}>
                                    🔨 MAKER's Submitted Work
                                </h4>

                                {selectedItemForSupervisorReview.submissions && selectedItemForSupervisorReview.submissions.length > 0 ? (
                                    (() => {
                                        // Get the latest submission
                                        const latestSubmission = selectedItemForSupervisorReview.submissions
                                            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

                                        return (
                                            <div>
                                                {/* MAKER's Remarks */}
                                                <div className="mb-4">
                                                    <label className="block text-sm font-medium mb-2" style={{ color: themeConfig.textPrimary }}>
                                                        MAKER's Work Notes:
                                                    </label>
                                                    <div
                                                        className="p-3 rounded-lg border-2"
                                                        style={{
                                                            background: themeConfig.cardBg,
                                                            borderColor: `${themeConfig.border}60`,
                                                            color: themeConfig.textPrimary,
                                                            minHeight: '80px'
                                                        }}
                                                    >
                                                        {latestSubmission.maker_remarks || "No remarks provided by MAKER"}
                                                    </div>
                                                </div>

                                                {/* MAKER's Photos */}
                                                {/* MAKER's Work Photos - Enhanced Display */}
                                                <div className="mb-4">
                                                    <label className="block text-sm font-medium mb-2" style={{ color: themeConfig.textPrimary }}>
                                                        📷 MAKER's Work Photos:
                                                    </label>
                                                    {(() => {
                                                        // Try multiple possible photo fields
                                                        const photoUrl = latestSubmission.maker_media ||
                                                            latestSubmission.media ||
                                                            latestSubmission.photo ||
                                                            latestSubmission.image;

                                                        console.log("🔍 SUPERVISOR Photo Debug:", {
                                                            maker_media: latestSubmission.maker_media,
                                                            submission: latestSubmission,
                                                            photoUrl: photoUrl
                                                        });

                                                        if (photoUrl) {
                                                            return (
                                                                <div className="max-w-md">
                                                                    <div className="relative group">
                                                                        <img
                                                                            src={photoUrl.startsWith('http') ? photoUrl : `https://your-domain.com${photoUrl}`}
                                                                            alt="MAKER's work photo"
                                                                            className="w-full h-48 object-cover rounded-lg border-2 cursor-pointer hover:scale-105 transition-transform"
                                                                            style={{ borderColor: themeConfig.success }}
                                                                            onClick={() => window.open(photoUrl.startsWith('http') ? photoUrl : `https://your-domain.com${photoUrl}`, '_blank')}
                                                                            onError={(e) => {
                                                                                console.error("❌ Photo load error:", e);
                                                                                e.target.style.display = 'none';
                                                                                e.target.nextSibling.style.display = 'block';
                                                                            }}
                                                                        />
                                                                        <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
                                                                            MAKER WORK
                                                                        </div>
                                                                        {/* Error fallback */}
                                                                        <div className="hidden p-4 text-center text-red-500 border-2 border-red-300 rounded-lg bg-red-50">
                                                                            📷 Photo not available
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-xs mt-1" style={{ color: themeConfig.textSecondary }}>
                                                                        Click to view full size
                                                                    </p>
                                                                </div>
                                                            );
                                                        } else {
                                                            return (
                                                                <div className="p-4 text-center border-2 border-dashed rounded-lg" style={{ borderColor: themeConfig.border }}>
                                                                    <p className="text-sm" style={{ color: themeConfig.textSecondary }}>
                                                                        📷 No photos submitted by MAKER
                                                                    </p>
                                                                    <p className="text-xs mt-1" style={{ color: themeConfig.textSecondary }}>
                                                                        Debug: {JSON.stringify(Object.keys(latestSubmission))}
                                                                    </p>
                                                                </div>
                                                            );
                                                        }
                                                    })()}
                                                </div>

                                                {/* Submission Details */}
                                                <div className="text-xs" style={{ color: themeConfig.textSecondary }}>
                                                    <p>Submitted: {new Date(latestSubmission.created_at).toLocaleString()}</p>
                                                    <p>Attempt: {latestSubmission.attempts || 1}</p>
                                                    <p>Submission ID: {latestSubmission.id}</p>
                                                </div>
                                            </div>
                                        );
                                    })()
                                ) : (
                                    <p className="text-sm" style={{ color: themeConfig.textSecondary }}>
                                        No MAKER submissions found for this item.
                                    </p>
                                )}
                            </div>

                            {/* SUPERVISOR's Review Section */}
                            <div
                                className="p-4 rounded-xl"
                                style={{ background: `${themeConfig.warning}10`, border: `1px solid ${themeConfig.warning}30` }}
                            >
                                <h4 className="font-medium mb-4" style={{ color: themeConfig.textPrimary }}>
                                    👀 Your Review Decision
                                </h4>

                                {/* SUPERVISOR Remarks */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2" style={{ color: themeConfig.textPrimary }}>
                                        Your Review Comments
                                    </label>
                                    <textarea
                                        value={supervisorRemarks}
                                        onChange={(e) => setSupervisorRemarks(e.target.value)}
                                        placeholder="Add your review comments here..."
                                        className="w-full p-3 rounded-lg border-2 text-sm"
                                        style={{
                                            background: themeConfig.cardBg,
                                            borderColor: `${themeConfig.border}60`,
                                            color: themeConfig.textPrimary,
                                            minHeight: '100px'
                                        }}
                                        rows="4"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: themeConfig.border }}>
                                <button
                                    onClick={() => {
                                        setShowSupervisorReviewModal(false);
                                        setSelectedItemForSupervisorReview(null);
                                        setSupervisorRemarks('');
                                    }}
                                    className="px-6 py-2 rounded-lg font-medium text-sm transition-all"
                                    style={{
                                        background: themeConfig.textSecondary,
                                        color: 'white'
                                    }}
                                >
                                    Cancel
                                </button>

                                {/* REOPEN Button */}
                                <button
                                    onClick={async () => {
                                        setSubmittingSupervisorDecision(true);
                                        try {
                                            const token = localStorage.getItem("ACCESS_TOKEN");
                                            const failOption = selectedItemForSupervisorReview.options?.find(opt => opt.choice === "N");

                                            if (!failOption) {
                                                toast.error("No FAIL option found for rejection");
                                                return;
                                            }

                                            const payload = {
                                                checklist_item_id: selectedItemForSupervisorReview.id,
                                                role: "supervisor",
                                                option_id: failOption.id,
                                                check_remark: supervisorRemarks || "Rejected by supervisor"
                                            };

                                            const response = await checklistInstance.patch('/Decsion-makeing-forSuer-Inspector/', payload, {
                                                headers: { Authorization: `Bearer ${token}` },
                                            });

                                            if (response.status === 200) {
                                                toast.success("✅ Work rejected and sent back to MAKER!", {
                                                    duration: 4000,
                                                    style: { background: themeConfig.error, color: 'white', borderRadius: '12px', padding: '16px' }
                                                });

                                                setShowSupervisorReviewModal(false);
                                                setSupervisorRemarks('');
                                                // Refresh data
                                                window.location.reload();
                                            }
                                        } catch (err) {
                                            console.error("❌ Failed SUPERVISOR reject:", err);
                                            toast.error(`❌ ${err.response?.data?.detail || "Failed to reject work"}`, {
                                                style: { background: themeConfig.error, color: 'white', borderRadius: '12px' }
                                            });
                                        } finally {
                                            setSubmittingSupervisorDecision(false);
                                        }
                                    }}
                                    disabled={submittingSupervisorDecision}
                                    className="px-6 py-3 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105"
                                    style={{
                                        background: `linear-gradient(135deg, ${themeConfig.error}, ${themeConfig.error}dd)`,
                                        color: 'white',
                                        border: `2px solid ${themeConfig.error}`,
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>❌</span>
                                        <span>Reject & Return to MAKER</span>
                                    </div>
                                </button>

                                {/* APPROVE Button */}
                                <button
                                    onClick={async () => {
                                        setSubmittingSupervisorDecision(true);
                                        try {
                                            const token = localStorage.getItem("ACCESS_TOKEN");
                                            const passOption = selectedItemForSupervisorReview.options?.find(opt => opt.choice === "P");

                                            if (!passOption) {
                                                toast.error("No PASS option found for approval");
                                                return;
                                            }

                                            const payload = {
                                                checklist_item_id: selectedItemForSupervisorReview.id,
                                                role: "supervisor",
                                                option_id: passOption.id,
                                                check_remark: supervisorRemarks || "Approved by supervisor"
                                            };

                                            const response = await checklistInstance.patch('/Decsion-makeing-forSuer-Inspector/', payload, {
                                                headers: { Authorization: `Bearer ${token}` },
                                            });

                                            if (response.status === 200) {
                                                toast.success("✅ Work approved and sent to CHECKER!", {
                                                    duration: 4000,
                                                    style: { background: themeConfig.success, color: 'white', borderRadius: '12px', padding: '16px' }
                                                });

                                                setShowSupervisorReviewModal(false);
                                                setSupervisorRemarks('');
                                                // Refresh data
                                                window.location.reload();
                                            }
                                        } catch (err) {
                                            console.error("❌ Failed SUPERVISOR approve:", err);
                                            toast.error(`❌ ${err.response?.data?.detail || "Failed to approve work"}`, {
                                                style: { background: themeConfig.error, color: 'white', borderRadius: '12px' }
                                            });
                                        } finally {
                                            setSubmittingSupervisorDecision(false);
                                        }
                                    }}
                                    disabled={submittingSupervisorDecision}
                                    className="px-6 py-3 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105"
                                    style={{
                                        background: `linear-gradient(135deg, ${themeConfig.success}, ${themeConfig.success}dd)`,
                                        color: 'white',
                                        border: `2px solid ${themeConfig.success}`,
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>✅</span>
                                        <span>Approve to CHECKER</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <HistoryModal />
            <ConfirmationDialog />
        </div>
    );

};

const WrappedFlatInspectionPage = () => {
    const { theme } = useTheme();
    return (
        <ErrorBoundary theme={{ pageBg: theme === "dark" ? "#191922" : "#fcfaf7" }}>
            <FlatInspectionPage />
        </ErrorBoundary>
    );
};

export default WrappedFlatInspectionPage;
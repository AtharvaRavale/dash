// // import React, {
// //   useState,
// //   useEffect,
// //   useMemo,
// //   useCallback,
// //   useRef,
// // } from "react";
// // // import { FaPlus, FaMoon, FaSun } from "react-icons/fa";
// // import { MdOutlineCancel } from "react-icons/md";
// // import SideBarSetup from "../../components/SideBarSetup";
// // import { showToast } from "../../utils/toast";
// // import { useTheme } from "../../ThemeContext";
// // import axios from "axios";
// // import {
// //   createUserDetails,
// //   allorgantioninfototalbyUser_id,
// //   getCategoryTreeByProject,
// //   getProjectsByOrganization,
// //   createUserAccessRole,
// // } from "../../api";
// // import { organnizationInstance } from '../../api/axiosInstance';
// // import { FaPlus } from "react-icons/fa";

// // const getPalette = (theme) =>
// //   theme === "dark"
// //     ? {
// //         bg: "#181820",
// //         card: "bg-[#23232e]",
// //         cardBorder: "border-[#facc1530]",
// //         text: "text-amber-200",
// //         badge: "bg-[#fde047] text-[#181820]",
// //         input: "bg-[#23232e] text-amber-100",
// //         select: "bg-[#23232e] text-amber-100",
// //         shadow: "shadow-lg",
// //         error: "bg-red-700 text-white",
// //         info: "bg-[#fde047] text-[#181820]",
// //         btn: "bg-purple-900 text-amber-200 hover:bg-purple-700",
// //         btnCancel: "bg-gray-700 text-gray-200 hover:bg-gray-600",
// //         modal: "bg-[#181820] border border-[#fde04770]",
// //       }
// //     : {
// //         bg: "#f7f8fa",
// //         card: "bg-white",
// //         cardBorder: "border-[#ececf0]",
// //         text: "text-[#22223b]",
// //         badge: "bg-[#4375e8] text-white",
// //         input: "bg-white text-[#22223b]",
// //         select: "bg-white text-[#22223b]",
// //         shadow: "shadow-sm",
// //         error: "bg-red-100 text-red-700",
// //         info: "bg-blue-100 text-blue-700",
// //         btn: "bg-purple-700 text-white hover:bg-purple-800",
// //         btnCancel: "bg-gray-300 text-gray-700 hover:bg-gray-400",
// //         modal: "bg-white border border-[#ececf0]",
// //       };

// // console.log("User.jsx RENDERED!!!");
// // function User() {
// //   const { theme, toggleTheme } = useTheme();
// //   const palette = getPalette(theme);
// //   const renderCount = useRef(0);
// //   renderCount.current += 1;

// //   // --- USER DATA, ROLES, FORM LOGIC ---
// //   const userData = useMemo(() => {
// //     try {
// //       const userString = localStorage.getItem("USER_DATA");
// //       if (userString && userString !== "undefined") {
// //         const parsed = JSON.parse(userString);
// //         if (!parsed.roles) {
// //           try {
// //             const token = localStorage.getItem("ACCESS_TOKEN");
// //             if (token) {
// //               const payload = JSON.parse(atob(token.split(".")[1]));
// //               parsed.roles = payload.roles || [];
// //             }
// //           } catch (error) {
// //             parsed.roles = [];
// //           }
// //         }
// //         return parsed || {};
// //       }
// //     } catch {
// //       return {};
// //     }
// //     return {};
// //   }, []);

// //   // const userId = userData?.user_id;
// //   // const isClient = userData?.is_client;
// //   // const is_manager = useMemo(
// //   //   () => !!userData.is_manager,
// //   //   [userData.is_manager]
// //   // );
// //   // const isStaff = userData?.is_staff;
// //   // const isSuperAdmin = userData?.superadmin;
// //   // const canCreateClient = isStaff || isSuperAdmin;
// //   // const canCreateManager = isClient;
// //   // const canCreateNormalUser = is_manager;

// //   const isSuperAdmin = !!userData?.superadmin;
// //   const isStaff = !!userData?.is_staff;
// //   const isClient = !isSuperAdmin && !isStaff && !!userData?.is_client;
// //   const is_manager =
// //     !isSuperAdmin && !isStaff && !isClient && !!userData?.is_manager;

// //   const canCreateClient = isStaff || isSuperAdmin;
// //   const canCreateManager = isClient;
// //   const canCreateNormalUser = is_manager;

// //   const userId = userData?.user_id;
// //   console.log("isSuperAdmin", isSuperAdmin);
// //   console.log("isStaff", isStaff);
// //   console.log("isClient", isClient);
// //   console.log("is_manager", is_manager);
// //   console.log("canCreateClient", canCreateClient);
// //   console.log("canCreateManager", canCreateManager);
// //   console.log("canCreateNormalUser", canCreateNormalUser);

// //   const org = useMemo(() => userData.org || "", [userData.org]);
// //   const userRole = useMemo(() => {
// //     if (userData.superadmin) return "ADMIN";
// //     else if (userData.is_staff) return "STAFF";
// //     else if (userData.roles && userData.roles.length > 0)
// //       return userData.roles[0];
// //     else if (userData.is_manager) return "Manager";
// //     else if (userData.is_client) return "Client";
// //     else return "User";
// //   }, [userData]);
// //   const creationCapability = useMemo(() => {
// //     if (canCreateClient) return "Can create client users";
// //     else if (canCreateManager) return "Can create manager users";
// //     else if (canCreateNormalUser) return "Can create normal users with roles";
// //     else return "No user creation permissions";
// //   }, [canCreateClient, canCreateManager, canCreateNormalUser]);

// //   console.log("USER_DATA", userData);
// //   console.log("superadmin", userData?.superadmin);
// //   console.log("is_staff", userData?.is_staff);

// //   // Org/project/category state (all logic as in your latest code)
// //   const [orgInfo, setOrgInfo] = useState({});
// //   const [orgInfoLoading, setOrgInfoLoading] = useState(false);
// //   const [isAdd, setAdd] = useState(false);
// //   const [userDataForm, setUserDataForm] = useState({
// //     username: "",
// //     first_name: "",
// //     last_name: "",
// //     email: "",
// //     mobile: "",
// //     password: "",
// //     role: "",
// //     organization_id: "",
// //     company_id: "",
// //     entity_id: "",
// //     project_id: "",
// //     building_id: "",
// //     zone_id: "",
// //   });

// //   const [selectedOrganization, setSelectedOrganization] = useState("");
// //   const [selectedCompany, setSelectedCompany] = useState("");
// //   const [selectedProject, setSelectedProject] = useState("");
// //   const [selectedBuilding, setSelectedBuilding] = useState("");
// //   const [availableCompanies, setAvailableCompanies] = useState([]);
// //   const [availableEntities, setAvailableEntities] = useState([]);
// //   const [availableProjects, setAvailableProjects] = useState([]);
// //   const [availableBuildings, setAvailableBuildings] = useState([]);
// //   const [availableZones, setAvailableZones] = useState([]);
// //   const [orgManagerTypes, setOrgManagerTypes] = useState([]);
// //   const [showManagerDropdown, setShowManagerDropdown] = useState(false);
// //   const [selectedManagerType, setSelectedManagerType] = useState("");
// //   const [projectsLoading, setProjectsLoading] = useState(false);
// //   const [categoryTree, setCategoryTree] = useState([]);
// //   const [categoryLoading, setCategoryLoading] = useState(false);
// //   const [selectedCategory, setSelectedCategory] = useState("");
// //   const [selectedLevel1, setSelectedLevel1] = useState("");
// //   const [selectedLevel2, setSelectedLevel2] = useState("");
// //   const [selectedLevel3, setSelectedLevel3] = useState("");
// //   const [selectedLevel4, setSelectedLevel4] = useState("");
// //   const [selectedLevel5, setSelectedLevel5] = useState("");
// //   const [selectedLevel6, setSelectedLevel6] = useState("");
// //   const [availableLevel1, setAvailableLevel1] = useState([]);
// //   const [availableLevel2, setAvailableLevel2] = useState([]);
// //   const [availableLevel3, setAvailableLevel3] = useState([]);
// //   const [availableLevel4, setAvailableLevel4] = useState([]);
// //   const [availableLevel5, setAvailableLevel5] = useState([]);
// //   const [availableLevel6, setAvailableLevel6] = useState([]);

// //   const resetCategorySelections = useCallback(() => {
// //     setSelectedCategory("");
// //     setSelectedLevel1("");
// //     setSelectedLevel2("");
// //     setSelectedLevel3("");
// //     setSelectedLevel4("");
// //     setSelectedLevel5("");
// //     setSelectedLevel6("");
// //     setAvailableLevel1([]);
// //     setAvailableLevel2([]);
// //     setAvailableLevel3([]);
// //     setAvailableLevel4([]);
// //     setAvailableLevel5([]);
// //     setAvailableLevel6([]);
// //   }, []);

// //   const fetchCategoryTree = useCallback(
// //     async (projectId) => {
// //       if (!projectId) return;
// //       setCategoryLoading(true);
// //       try {
// //         const response = await getCategoryTreeByProject(projectId);
// //         setCategoryTree(response.data || []);
// //         resetCategorySelections();
// //       } catch (error) {
// //         setCategoryTree([]);
// //         resetCategorySelections();
// //         showToast("Failed to load categories for this project", "error");
// //       } finally {
// //         setCategoryLoading(false);
// //       }
// //     },
// //     [resetCategorySelections]
// //   );

// //   const fetchProjectsForManager = useCallback(async () => {
// //     if ((is_manager || canCreateManager) && org) {
// //       setProjectsLoading(true);
// //       try {
// //         const res = await getProjectsByOrganization(org);
// //         let projects = [];
// //         if (Array.isArray(res.data)) projects = res.data;
// //         else if (res.data && res.data.projects) projects = res.data.projects;
// //         setAvailableProjects(projects);
// //         if ((is_manager || canCreateManager) && projects.length > 0) {
// //           setShowManagerDropdown(true);
// //           setOrgManagerTypes(
// //             res.data.manager_types || ["Project Manager", "Site Manager"]
// //           );
// //         }
// //       } catch (err) {
// //         setShowManagerDropdown(false);
// //         setOrgManagerTypes([]);
// //         setAvailableProjects([]);
// //         showToast("Failed to fetch projects. Please try again later.", "error");
// //       } finally {
// //         setProjectsLoading(false);
// //       }
// //     }
// //   }, [is_manager, canCreateManager, org]);

// //   useEffect(() => {
// //     if (isAdd && (is_manager || canCreateManager) && org) {
// //       fetchProjectsForManager();
// //     }
// //   }, [isAdd, is_manager, canCreateManager, org, fetchProjectsForManager]);

// //   const getRoleOptions = useCallback(() => {
// //     if (canCreateClient) return [];
// //     else if (canCreateManager) return [];
// //     else if (canCreateNormalUser) {
// //       return [
// //         { value: "SUPERVISOR", label: "SUPERVISOR" },
// //         { value: "CHECKER", label: "CHECKER" },
// //         { value: "MAKER", label: "MAKER" },
// //         { value: "Intializer", label: "Intializer" },
// //       ];
// //     }
// //     return [];
// //   }, [canCreateClient, canCreateManager, canCreateNormalUser]);

// //   const fetchOrgInfo = useCallback(async () => {
// //     if (!userId) {
// //       showToast("User ID not found", "error");
// //       return;
// //     }
// //     setOrgInfoLoading(true);
// //     try {
// //       const response = await organnizationInstance.get(
// //         `/user-orgnizationn-info/${userId}/`,
// //         {
// //           headers: {
// //             Authorization:` Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
// //           },
// //         }
// //       );
// //       setOrgInfo(response.data);
// //     } catch (error) {
// //       showToast("Failed to fetch organization info", "error");
// //     } finally {
// //       setOrgInfoLoading(false);
// //     }
// //   }, [userId]);

// //   const handleAdd = useCallback(() => {
// //     setAdd(true);
// //     fetchOrgInfo();
// //   }, [fetchOrgInfo]);

// //   const handleOrganizationChange = useCallback(
// //     async (e) => {
// //       const orgId = e.target.value;
// //       setSelectedOrganization(orgId);
// //       setSelectedCompany("");
// //       setSelectedProject("");
// //       setSelectedBuilding("");
// //       setUserDataForm((prev) => ({
// //         ...prev,
// //         organization_id: orgId,
// //         company_id: "",
// //         entity_id: "",
// //         project_id: "",
// //         building_id: "",
// //         zone_id: "",
// //       }));
// //       setAvailableCompanies([]);
// //       setAvailableEntities([]);
// //       setAvailableBuildings([]);
// //       setAvailableZones([]);
// //       if (orgId && orgInfo.companies) {
// //         const filteredCompanies = orgInfo.companies.filter(
// //           (company) => company.organization === parseInt(orgId)
// //         );
// //         setAvailableCompanies(filteredCompanies);
// //       }
// //       if (
// //         orgId &&
// //         (is_manager || canCreateManager) &&
// //         parseInt(orgId) !== parseInt(org)
// //       ) {
// //         setProjectsLoading(true);
// //         try {
// //           const res = await getProjectsByOrganization(orgId);
// //           let projects = [];
// //           if (Array.isArray(res.data)) projects = res.data;
// //           else if (res.data && res.data.projects) projects = res.data.projects;
// //           setAvailableProjects(projects);
// //         } catch (err) {
// //           setAvailableProjects([]);
// //           showToast(
// //             "Failed to fetch projects for selected organization",
// //             "error"
// //           );
// //         } finally {
// //           setProjectsLoading(false);
// //         }
// //       }
// //     },
// //     [orgInfo.companies, is_manager, canCreateManager, org]
// //   );

// //   const handleCompanyChange = useCallback(
// //     (e) => {
// //       const companyId = e.target.value;
// //       setSelectedCompany(companyId);
// //       setUserDataForm((prev) => ({
// //         ...prev,
// //         company_id: companyId,
// //         entity_id: "",
// //       }));
// //       if (companyId && orgInfo.entities) {
// //         const filteredEntities = orgInfo.entities.filter(
// //           (entity) => entity.company === parseInt(companyId)
// //         );
// //         setAvailableEntities(filteredEntities);
// //       } else {
// //         setAvailableEntities([]);
// //       }
// //     },
// //     [orgInfo.entities]
// //   );

// //   const handleEntityChange = useCallback((e) => {
// //     const entityId = e.target.value;
// //     setUserDataForm((prev) => ({
// //       ...prev,
// //       entity_id: entityId,
// //     }));
// //   }, []);

// //   const handleProjectChange = useCallback(
// //     (e) => {
// //       const projectId = e.target.value;
// //       setSelectedProject(projectId);
// //       setSelectedBuilding("");
// //       setUserDataForm((prev) => ({
// //         ...prev,
// //         project_id: projectId,
// //         building_id: "",
// //         zone_id: "",
// //       }));
// //       setAvailableBuildings([]);
// //       setAvailableZones([]);
// //       resetCategorySelections();
// //       if (projectId) fetchCategoryTree(projectId);
// //       else setCategoryTree([]);
// //       if (projectId) {
// //         const selectedProjectObj = availableProjects.find(
// //           (project) => project.id === parseInt(projectId)
// //         );
// //         if (selectedProjectObj && selectedProjectObj.buildings) {
// //           setAvailableBuildings(selectedProjectObj.buildings);
// //         }
// //       }
// //     },
// //     [availableProjects, resetCategorySelections, fetchCategoryTree]
// //   );

// //   const handleBuildingChange = useCallback(
// //     (e) => {
// //       const buildingId = e.target.value;
// //       setSelectedBuilding(buildingId);
// //       setUserDataForm((prev) => ({
// //         ...prev,
// //         building_id: buildingId,
// //         zone_id: "",
// //       }));
// //       setAvailableZones([]);
// //       if (buildingId) {
// //         const selectedBuildingObj = availableBuildings.find(
// //           (building) => building.id === parseInt(buildingId)
// //         );
// //         if (selectedBuildingObj && selectedBuildingObj.zones) {
// //           setAvailableZones(selectedBuildingObj.zones);
// //         }
// //       }
// //     },
// //     [availableBuildings]
// //   );

// //   const handleZoneChange = useCallback((e) => {
// //     const zoneId = e.target.value;
// //     setUserDataForm((prev) => ({
// //       ...prev,
// //       zone_id: zoneId,
// //     }));
// //   }, []);

// //   // Category selection handlers
// //   const handleCategoryChange = useCallback(
// //     (e) => {
// //       const categoryId = e.target.value;
// //       setSelectedCategory(categoryId);
// //       setSelectedLevel1("");
// //       setSelectedLevel2("");
// //       setSelectedLevel3("");
// //       setSelectedLevel4("");
// //       setSelectedLevel5("");
// //       setSelectedLevel6("");
// //       setAvailableLevel2([]);
// //       setAvailableLevel3([]);
// //       setAvailableLevel4([]);
// //       setAvailableLevel5([]);
// //       setAvailableLevel6([]);
// //       if (categoryId) {
// //         const selectedCategoryObj = categoryTree.find(
// //           (cat) => cat.id === parseInt(categoryId)
// //         );
// //         if (selectedCategoryObj && selectedCategoryObj.level1) {
// //           setAvailableLevel1(selectedCategoryObj.level1);
// //         } else {
// //           setAvailableLevel1([]);
// //         }
// //       } else {
// //         setAvailableLevel1([]);
// //       }
// //     },
// //     [categoryTree]
// //   );
// //   const handleLevel1Change = useCallback(
// //     (e) => {
// //       const level1Id = e.target.value;
// //       setSelectedLevel1(level1Id);
// //       setSelectedLevel2("");
// //       setSelectedLevel3("");
// //       setSelectedLevel4("");
// //       setSelectedLevel5("");
// //       setSelectedLevel6("");
// //       setAvailableLevel3([]);
// //       setAvailableLevel4([]);
// //       setAvailableLevel5([]);
// //       setAvailableLevel6([]);
// //       if (level1Id) {
// //         const selectedLevel1Obj = availableLevel1.find(
// //           (item) => item.id === parseInt(level1Id)
// //         );
// //         if (selectedLevel1Obj && selectedLevel1Obj.level2) {
// //           setAvailableLevel2(selectedLevel1Obj.level2);
// //         } else {
// //           setAvailableLevel2([]);
// //         }
// //       } else {
// //         setAvailableLevel2([]);
// //       }
// //     },
// //     [availableLevel1]
// //   );
// //   const handleLevel2Change = useCallback(
// //     (e) => {
// //       const level2Id = e.target.value;
// //       setSelectedLevel2(level2Id);
// //       setSelectedLevel3("");
// //       setSelectedLevel4("");
// //       setSelectedLevel5("");
// //       setSelectedLevel6("");
// //       setAvailableLevel4([]);
// //       setAvailableLevel5([]);
// //       setAvailableLevel6([]);
// //       if (level2Id) {
// //         const selectedLevel2Obj = availableLevel2.find(
// //           (item) => item.id === parseInt(level2Id)
// //         );
// //         if (selectedLevel2Obj && selectedLevel2Obj.level3) {
// //           setAvailableLevel3(selectedLevel2Obj.level3);
// //         } else {
// //           setAvailableLevel3([]);
// //         }
// //       } else {
// //         setAvailableLevel3([]);
// //       }
// //     },
// //     [availableLevel2]
// //   );
// //   const handleLevel3Change = useCallback(
// //     (e) => {
// //       const level3Id = e.target.value;
// //       setSelectedLevel3(level3Id);
// //       setSelectedLevel4("");
// //       setSelectedLevel5("");
// //       setSelectedLevel6("");
// //       setAvailableLevel5([]);
// //       setAvailableLevel6([]);
// //       if (level3Id) {
// //         const selectedLevel3Obj = availableLevel3.find(
// //           (item) => item.id === parseInt(level3Id)
// //         );
// //         if (selectedLevel3Obj && selectedLevel3Obj.level4) {
// //           setAvailableLevel4(selectedLevel3Obj.level4);
// //         } else {
// //           setAvailableLevel4([]);
// //         }
// //       } else {
// //         setAvailableLevel4([]);
// //       }
// //     },
// //     [availableLevel3]
// //   );
// //   const handleLevel4Change = useCallback(
// //     (e) => {
// //       const level4Id = e.target.value;
// //       setSelectedLevel4(level4Id);
// //       setSelectedLevel5("");
// //       setSelectedLevel6("");
// //       setAvailableLevel6([]);
// //       if (level4Id) {
// //         const selectedLevel4Obj = availableLevel4.find(
// //           (item) => item.id === parseInt(level4Id)
// //         );
// //         if (selectedLevel4Obj && selectedLevel4Obj.level5) {
// //           setAvailableLevel5(selectedLevel4Obj.level5);
// //         } else {
// //           setAvailableLevel5([]);
// //         }
// //       } else {
// //         setAvailableLevel5([]);
// //       }
// //     },
// //     [availableLevel4]
// //   );
// //   const handleLevel5Change = useCallback(
// //     (e) => {
// //       const level5Id = e.target.value;
// //       setSelectedLevel5(level5Id);
// //       setSelectedLevel6("");
// //       if (level5Id) {
// //         const selectedLevel5Obj = availableLevel5.find(
// //           (item) => item.id === parseInt(level5Id)
// //         );
// //         if (selectedLevel5Obj && selectedLevel5Obj.level6) {
// //           setAvailableLevel6(selectedLevel5Obj.level6);
// //         } else {
// //           setAvailableLevel6([]);
// //         }
// //       } else {
// //         setAvailableLevel6([]);
// //       }
// //     },
// //     [availableLevel5]
// //   );
// //   const handleLevel6Change = useCallback((e) => {
// //     const level6Id = e.target.value;
// //     setSelectedLevel6(level6Id);
// //   }, []);

// //   const isFormValid = useCallback(() => {
// //     const basicFields =
// //       userDataForm.username &&
// //       userDataForm.first_name &&
// //       userDataForm.last_name &&
// //       userDataForm.email &&
// //       userDataForm.password;
// //     if (canCreateClient) return basicFields;
// //     else if (canCreateManager)
// //       return basicFields && userDataForm.organization_id;
// //     else if (canCreateNormalUser)
// //       return basicFields && userDataForm.role && selectedCategory;
// //     return false;
// //   }, [
// //     userDataForm,
// //     selectedCategory,
// //     canCreateClient,
// //     canCreateManager,
// //     canCreateNormalUser,
// //   ]);

// //   const handleCreate = useCallback(
// //     async (e) => {
// //       e.preventDefault();
// //       if (!isFormValid()) {
// //         showToast("Please fill in all required fields", "error");
// //         return;
// //       }

// //       // For client users - simple creation with basic info only
// //       if (canCreateClient) {
// //         const clientPayload = {
// //           user: {
// //             username: userDataForm.username,
// //             first_name: userDataForm.first_name,
// //             last_name: userDataForm.last_name,
// //             email: userDataForm.email,
// //             phone_number: userDataForm.mobile || "",
// //             password: userDataForm.password,
// //             is_client: true,
// //             is_manager: false,
// //             has_access: true,
// //             org: null,
// //             company: null,
// //             entity: null,
// //           },
// //           access: {
// //             project_id: null,
// //             building_id: null,
// //             zone_id: null,
// //             flat_id: null,
// //             active: true,
// //             category: null,
// //             CategoryLevel1: null,
// //             CategoryLevel2: null,
// //             CategoryLevel3: null,
// //             CategoryLevel4: null,
// //             CategoryLevel5: null,
// //             CategoryLevel6: null,
// //           },
// //           roles: [], // Empty roles array for client users
// //         };

// //         try {
// //           const response = await createUserAccessRole(clientPayload);
// //           if (response.status === 201) {
// //             showToast("Client user created successfully", "success");
// //             resetForm();
// //           } else {
// //             showToast("Failed to create client user", "error");
// //           }
// //         } catch (error) {
// //           if (error.response && error.response.data) {
// //             const errorData = error.response.data;
// //             if (errorData.user && errorData.user.username) {
// //               showToast("Username already exists.", "error");
// //               return;
// //             }
// //             if (errorData.user && errorData.user.email) {
// //               showToast("Email already exists.", "error");
// //               return;
// //             }
// //           }
// //           showToast("Error creating client user. Please try again.", "error");
// //         }
// //         return;
// //       }

// //       // For manager and normal users - existing complex payload
// //       const completePayload = {
// //         user: {
// //           username: userDataForm.username,
// //           first_name: userDataForm.first_name,
// //           last_name: userDataForm.last_name,
// //           email: userDataForm.email,
// //           phone_number: userDataForm.mobile || "",
// //           password: userDataForm.password,
// //           org: userDataForm.organization_id
// //             ? parseInt(userDataForm.organization_id)
// //             : org
// //             ? parseInt(org)
// //             : null,
// //           company: userDataForm.company_id
// //             ? parseInt(userDataForm.company_id)
// //             : null,
// //           entity: userDataForm.entity_id
// //             ? parseInt(userDataForm.entity_id)
// //             : null,
// //           is_manager: canCreateManager ? true : false,
// //           is_client: false,
// //           has_access: true,
// //         },
// //         access: {
// //           project_id: userDataForm.project_id
// //             ? parseInt(userDataForm.project_id)
// //             : null,
// //           building_id: userDataForm.building_id
// //             ? parseInt(userDataForm.building_id)
// //             : null,
// //           zone_id: userDataForm.zone_id ? parseInt(userDataForm.zone_id) : null,
// //           flat_id: null,
// //           active: true,
// //           category: selectedCategory ? parseInt(selectedCategory) : null,
// //           CategoryLevel1: selectedLevel1 ? parseInt(selectedLevel1) : null,
// //           CategoryLevel2: selectedLevel2 ? parseInt(selectedLevel2) : null,
// //           CategoryLevel3: selectedLevel3 ? parseInt(selectedLevel3) : null,
// //           CategoryLevel4: selectedLevel4 ? parseInt(selectedLevel4) : null,
// //           CategoryLevel5: selectedLevel5 ? parseInt(selectedLevel5) : null,
// //           CategoryLevel6: selectedLevel6 ? parseInt(selectedLevel6) : null,
// //         },
// //         roles: [],
// //       };

// // if (canCreateManager) {
// //   // Do nothing here for roles!
// //   // Just make sure is_manager: true is in completePayload.user (it already is)
// // } else if (canCreateNormalUser) {
// //   if (userDataForm.role) {
// //     completePayload.roles.push({ role: userDataForm.role });
// //   }
// // }

// //       try {
// //         const response = await createUserAccessRole(completePayload);
// //         if (response.status === 201) {
// //           let successMessage = "User created successfully";
// //           if (canCreateManager) {
// //             successMessage = "Manager user created successfully";
// //           } else if (canCreateNormalUser) {
// //             successMessage = "User created successfully with role assigned";
// //           }
// //           showToast(successMessage, "success");
// //           resetForm();
// //         } else {
// //           showToast("Failed to create user", "error");
// //         }
// //       } catch (error) {
// //         if (error.response && error.response.data) {
// //           const errorData = error.response.data;
// //           if (errorData.user && errorData.user.username) {
// //             showToast("Username already exists.", "error");
// //             return;
// //           }
// //           if (errorData.user && errorData.user.email) {
// //             showToast("Email already exists.", "error");
// //             return;
// //           }
// //         }
// //         showToast("Error creating user. Please try again.", "error");
// //       }
// //     },
// //     [
// //       userDataForm,
// //       selectedCategory,
// //       selectedLevel1,
// //       selectedLevel2,
// //       selectedLevel3,
// //       selectedLevel4,
// //       selectedLevel5,
// //       selectedLevel6,
// //       canCreateClient,
// //       canCreateManager,
// //       canCreateNormalUser,
// //       org,
// //       isFormValid,
// //     ]
// //   );

// //   const resetForm = useCallback(() => {
// //     setUserDataForm({
// //       username: "",
// //       first_name: "",
// //       last_name: "",
// //       email: "",
// //       mobile: "",
// //       password: "",
// //       role: "",
// //       organization_id: "",
// //       company_id: "",
// //       entity_id: "",
// //       project_id: "",
// //       building_id: "",
// //       zone_id: "",
// //     });
// //     setSelectedOrganization("");
// //     setSelectedCompany("");
// //     setSelectedProject("");
// //     setSelectedBuilding("");
// //     setAvailableCompanies([]);
// //     setAvailableEntities([]);
// //     setAvailableProjects([]);
// //     setAvailableBuildings([]);
// //     setAvailableZones([]);
// //     setOrgManagerTypes([]);
// //     setShowManagerDropdown(false);
// //     setSelectedManagerType("");
// //     setAdd(false);
// //     setOrgInfo({});
// //     setProjectsLoading(false);
// //     setCategoryTree([]);
// //     setCategoryLoading(false);
// //     resetCategorySelections();
// //   }, [resetCategorySelections]);

// //   const submitButtonClassName = useMemo(() => {
// //     const baseClasses = "flex-1 py-2 px-4 rounded transition duration-200";
// //     const validClasses = palette.btn;
// //     const invalidClasses = "bg-gray-300 text-gray-500 cursor-not-allowed";
// //     const isValid = isFormValid();
// //     return `${baseClasses} ${isValid ? validClasses : invalidClasses}`;
// //   }, [isFormValid, palette.btn]);

// //   if (!canCreateClient && !canCreateManager && !canCreateNormalUser) {
// //     return (
// //       <div className="flex min-h-screen" style={{ background: palette.bg }}>
// //         <SideBarSetup />
// //         <div className="my-5 w-[85%] mt-5 ml-[16%] mr-[1%]">
// //           <div
// //             className={`px-6 py-5 max-w-7xl mx-auto rounded ${palette.card} ${palette.cardBorder} ${palette.shadow}`}
// //           >
// //             {/* ===== HEADER WITH THEME TOGGLE (NO RIGHTS CASE) ===== */}
// //             <div className="mb-6 flex items-center justify-between">
// //               <div>
// //                 <h1 className={`text-2xl font-bold ${palette.text}`}>
// //                   USER MANAGEMENT
// //                 </h1>
// //                 <p className={`${palette.text} opacity-80 mt-2`}>
// //                   User creation and management
// //                 </p>
// //                 <div className="mt-3">
// //                   <span
// //                     className={`inline-block px-3 py-1 rounded-full text-sm ${palette.error}`}
// //                   >
// //                     {userRole} - No user creation permissions
// //                   </span>
// //                 </div>
// //               </div>
// //               {/* <button
// //                 onClick={toggleTheme}
// //                 className="rounded-full p-2 bg-yellow-400 hover:bg-yellow-300 transition-colors shadow-md"
// //                 title="Toggle Theme"
// //                 style={{ border: "2px solid #fde047" }}
// //               >
// //                 {theme === "dark" ? (
// //                   <FaSun className="text-2xl text-gray-800" />
// //                 ) : (
// //                   <FaMoon className="text-2xl text-yellow-700" />
// //                 )}
// //               </button> */}
// //             </div>
// //             {/* ...rest unchanged */}
// //             <div
// //               className={`rounded-lg p-8 ${
// //                 theme === "dark" ? "bg-[#23232e]" : "bg-gray-50"
// //               }`}
// //             >
// //               <div className="text-center">
// //                 <div className="mb-6">
// //                   <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
// //                     <MdOutlineCancel className="text-red-600 text-2xl" />
// //                   </div>
// //                   <h2 className={`text-xl font-semibold ${palette.text} mb-2`}>
// //                     Access Restricted
// //                   </h2>
// //                   <p className={`${palette.text} opacity-70`}>
// //                     You do not have permissions to create users. Please contact
// //                     your administrator.
// //                   </p>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="flex min-h-screen" style={{ background: palette.bg }}>
// //       <SideBarSetup />
// //       <div className="my-5 w-[85%] mt-5 ml-[16%] mr-[1%]">
// //         <div
// //           className={`px-6 py-5 max-w-7xl mx-auto rounded ${palette.card} ${palette.cardBorder} ${palette.shadow}`}
// //         >
// //           {/* ===== HEADER WITH THEME TOGGLE ===== */}
// //           <div className="mb-6 flex items-center justify-between">
// //             <div>
// //               <h1 className={`text-2xl font-bold ${palette.text}`}>
// //                 USER MANAGEMENT
// //               </h1>
// //               <p className={`${palette.text} opacity-80 mt-2`}>
// //                 Create and manage users for your organization
// //               </p>
              
// //               <div className="mb-3">
// //                 <span
// //                   className={`inline-block px-3 py-1 rounded-full text-sm mr-2 ${palette.badge}`}
// //                 >
// //                   {userRole} Access (Render #{renderCount.current})
// //                 </span>
// //                 <span
// //                   className={`inline-block px-3 py-1 rounded-full text-sm ${palette.info}`}
// //                 >
// //                   {creationCapability}
// //                 </span>
// //               </div>
// //             </div>
// //             {/* <button
// //               onClick={toggleTheme}
// //               className="rounded-full p-2 bg-yellow-400 hover:bg-yellow-300 transition-colors shadow-md"
// //               title="Toggle Theme"
// //               style={{ border: "2px solid #fde047" }}
// //             >
// //               {theme === "dark" ? (
// //                 <FaSun className="text-2xl text-gray-800" />
// //               ) : (
// //                 <FaMoon className="text-2xl text-yellow-700" />
// //               )}
// //             </button> */}
// //           </div>
// //           <div
// //             className={`rounded-lg p-8 ${
// //               theme === "dark" ? "bg-[#23232e]" : "bg-gray-50"
// //             }`}
// //           >
// //             <div className="text-center">
// //               <div className="mb-6">
// //                 <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
// //                   <FaPlus className="text-purple-600 text-2xl" />
// //                 </div>
// //                 <h2 className={`text-xl font-semibold ${palette.text} mb-2`}>
// //                   Add New User
// //                 </h2>
// //                 <p className={`${palette.text} opacity-70`}>
// //                   {canCreateClient &&
// //                     "Create a new client user with organization access"}
// //                   {canCreateManager &&
// //                     "Create a new manager user for your organization"}
// //                   {canCreateNormalUser &&
// //                     "Create a new user with specific roles and permissions"}
// //                 </p>
// //               </div>
// //               <button
// //                 onClick={handleAdd}
// //                 className={`px-8 py-3 rounded-lg flex items-center gap-2 mx-auto font-semibold ${palette.btn}`}
// //               >
// //                 <FaPlus />
// //                 {canCreateClient && "Create Client User"}
// //                 {canCreateManager && "Create Manager User"}
// //                 {canCreateNormalUser && "Create New User"}
// //               </button>
// //             </div>
// //           </div>
// //           {/* Add User Modal */}
// //           {isAdd && (
// //             <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
// //               <div
// //                 className={`max-h-[90vh] w-full md:w-2/3 lg:w-1/2 rounded-lg shadow-2xl p-6 flex flex-col overflow-y-auto ${palette.modal}`}
// //               >
// //                 <div className="flex items-center justify-between mb-6">
// //                   <h1 className={`text-xl font-semibold ${palette.text}`}>
// //                     {canCreateClient && "Add New Client User"}
// //                     {canCreateManager && "Add New Manager User"}
// //                     {canCreateNormalUser && "Add New User"}
// //                   </h1>
// //                   <button
// //                     className="hover:scale-110 transition"
// //                     onClick={resetForm}
// //                   >
// //                     <MdOutlineCancel size={24} className={`${palette.text}`} />
// //                   </button>
// //                 </div>
// //                 {(orgInfoLoading || projectsLoading) && (
// //                   <div className="text-center py-4">
// //                     <span className="text-purple-600">
// //                       {orgInfoLoading
// //                         ? "Loading organizations..."
// //                         : "Loading projects..."}
// //                     </span>
// //                   </div>
// //                 )}
// //                 <div className="overflow-y-auto max-h-[70vh]">
// //                   {/* ==== FULL FORM FIELDS SECTION ==== */}
// //                   <form className="space-y-4" onSubmit={handleCreate}>
// //                     <div className="grid grid-cols-3 gap-3 items-center">
// //                       <label
// //                         className={`text-sm font-medium text-end ${palette.text}`}
// //                       >
// //                         Username<span className="text-red-500">*</span>
// //                       </label>
// //                       <input
// //                         type="text"
// //                         className={`col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 ${palette.input} ${palette.cardBorder}`}
// //                         value={userDataForm.username}
// //                         placeholder="Enter Username"
// //                         onChange={(e) =>
// //                           setUserDataForm((prev) => ({
// //                             ...prev,
// //                             username: e.target.value,
// //                           }))
// //                         }
// //                         required
// //                       />
// //                     </div>

// //                     {canCreateManager && (
// //                       <>
// //                         <div className="grid grid-cols-3 gap-3 items-center">
// //                           <label
// //                             className={`text-sm font-medium text-end ${palette.text}`}
// //                           >
// //                             Organization<span className="text-red-500">*</span>
// //                           </label>
// //                           <select
// //                             className={`col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 ${palette.select} ${palette.cardBorder}`}
// //                             value={selectedOrganization}
// //                             onChange={handleOrganizationChange}
// //                             required
// //                           >
// //                             <option value="">Select Organization</option>
// //                             {orgInfo.organizations?.map((org) => (
// //                               <option key={org.id} value={org.id}>
// //                                 {org.organization_name}
// //                               </option>
// //                             ))}
// //                           </select>
// //                         </div>
// //                         {selectedOrganization &&
// //                           availableCompanies.length > 0 && (
// //                             <div className="grid grid-cols-3 gap-3 items-center">
// //                               <label
// //                                 className={`text-sm font-medium text-end ${palette.text}`}
// //                               >
// //                                 Company
// //                               </label>
// //                               <select
// //                                 className={`col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 ${palette.select} ${palette.cardBorder}`}
// //                                 value={selectedCompany}
// //                                 onChange={handleCompanyChange}
// //                               >
// //                                 <option value="">
// //                                   Select Company (Optional)
// //                                 </option>
// //                                 {availableCompanies.map((company) => (
// //                                   <option key={company.id} value={company.id}>
// //                                     {company.name}
// //                                   </option>
// //                                 ))}
// //                               </select>
// //                             </div>
// //                           )}
// //                         {selectedCompany && availableEntities.length > 0 && (
// //                           <div className="grid grid-cols-3 gap-3 items-center">
// //                             <label
// //                               className={`text-sm font-medium text-end ${palette.text}`}
// //                             >
// //                               Entity
// //                             </label>
// //                             <select
// //                               className={`col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 ${palette.select} ${palette.cardBorder}`}
// //                               value={userDataForm.entity_id}
// //                               onChange={handleEntityChange}
// //                             >
// //                               <option value="">Select Entity (Optional)</option>
// //                               {availableEntities.map((entity) => (
// //                                 <option key={entity.id} value={entity.id}>
// //                                   {entity.name}
// //                                 </option>
// //                               ))}
// //                             </select>
// //                           </div>
// //                         )}
// //                         {availableProjects.length > 0 && (
// //                           <div className="grid grid-cols-3 gap-3 items-center">
// //                             <label
// //                               className={`text-sm font-medium text-end ${palette.text}`}
// //                             >
// //                               Project
// //                             </label>
// //                             <select
// //                               className={`col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 ${palette.select} ${palette.cardBorder}`}
// //                               value={selectedProject}
// //                               onChange={handleProjectChange}
// //                               disabled={projectsLoading}
// //                             >
// //                               <option value="">
// //                                 {projectsLoading
// //                                   ? "Loading projects..."
// //                                   : "Select Project (Optional)"}
// //                               </option>
// //                               {availableProjects.map((project, index) => (
// //                                 <option
// //                                   key={project.id || index}
// //                                   value={project.id}
// //                                 >
// //                                   {project.name || `Project ${index + 1}`}
// //                                 </option>
// //                               ))}
// //                             </select>
// //                           </div>
// //                         )}
// //                         {selectedProject && availableBuildings.length > 0 && (
// //                           <div className="grid grid-cols-3 gap-3 items-center">
// //                             <label
// //                               className={`text-sm font-medium text-end ${palette.text}`}
// //                             >
// //                               Building
// //                             </label>
// //                             <select
// //                               className={`col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 ${palette.select} ${palette.cardBorder}`}
// //                               value={selectedBuilding}
// //                               onChange={handleBuildingChange}
// //                             >
// //                               <option value="">
// //                                 Select Building (Optional)
// //                               </option>
// //                               {availableBuildings.map((building) => (
// //                                 <option key={building.id} value={building.id}>
// //                                   {building.name}
// //                                 </option>
// //                               ))}
// //                             </select>
// //                           </div>
// //                         )}
// //                         {selectedBuilding && availableZones.length > 0 && (
// //                           <div className="grid grid-cols-3 gap-3 items-center">
// //                             <label
// //                               className={`text-sm font-medium text-end ${palette.text}`}
// //                             >
// //                               Zone
// //                             </label>
// //                             <select
// //                               className={`col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 ${palette.select} ${palette.cardBorder}`}
// //                               value={userDataForm.zone_id}
// //                               onChange={handleZoneChange}
// //                             >
// //                               <option value="">Select Zone (Optional)</option>
// //                               {availableZones.map((zone) => (
// //                                 <option key={zone.id} value={zone.id}>
// //                                   {zone.name}
// //                                 </option>
// //                               ))}
// //                             </select>
// //                           </div>
// //                         )}
// //                       </>
// //                     )}

// //                     {canCreateNormalUser && (
// //                       <div className="grid grid-cols-3 gap-3 items-center">
// //                         <label
// //                           className={`text-sm font-medium text-end ${palette.text}`}
// //                         >
// //                           Role<span className="text-red-500">*</span>
// //                         </label>
// //                         <select
// //                           className={`col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 ${palette.select} ${palette.cardBorder}`}
// //                           value={userDataForm.role}
// //                           onChange={(e) =>
// //                             setUserDataForm((prev) => ({
// //                               ...prev,
// //                               role: e.target.value,
// //                             }))
// //                           }
// //                           required
// //                         >
// //                           <option value="">Select Role</option>
// //                           {getRoleOptions().map((option) => (
// //                             <option key={option.value} value={option.value}>
// //                               {option.label}
// //                             </option>
// //                           ))}
// //                         </select>
// //                       </div>
// //                     )}
// //                     {canCreateNormalUser && availableProjects.length > 0 && (
// //                       <div className="grid grid-cols-3 gap-3 items-center">
// //                         <label
// //                           className={`text-sm font-medium text-end ${palette.text}`}
// //                         >
// //                           Project
// //                         </label>
// //                         <select
// //                           className={`col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 ${palette.select} ${palette.cardBorder}`}
// //                           value={selectedProject}
// //                           onChange={handleProjectChange}
// //                           disabled={projectsLoading}
// //                         >
// //                           <option value="">
// //                             {projectsLoading
// //                               ? "Loading projects..."
// //                               : "Select Project (Optional)"}
// //                           </option>
// //                           {availableProjects.map((project, index) => (
// //                             <option
// //                               key={project.id || index}
// //                               value={project.id}
// //                             >
// //                               {project.name || `Project ${index + 1}`}
// //                             </option>
// //                           ))}
// //                         </select>
// //                       </div>
// //                     )}
// //                     {/* Category Selection for normal users */}
// //                     {canCreateNormalUser && selectedProject && (
// //                       <>
// //                         <div className="grid grid-cols-3 gap-3 items-center">
// //                           <label
// //                             className={`text-sm font-medium text-end ${palette.text}`}
// //                           >
// //                             Category<span className="text-red-500">*</span>
// //                           </label>
// //                           <select
// //                             className={`col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 ${palette.select} ${palette.cardBorder}`}
// //                             value={selectedCategory}
// //                             onChange={handleCategoryChange}
// //                             disabled={
// //                               categoryLoading || categoryTree.length === 0
// //                             }
// //                             required
// //                           >
// //                             <option value="">
// //                               {categoryLoading
// //                                 ? "Loading categories..."
// //                                 : categoryTree.length === 0
// //                                 ? "No categories available"
// //                                 : "Select Category"}
// //                             </option>
// //                             {categoryTree.map((category) => (
// //                               <option key={category.id} value={category.id}>
// //                                 {category.name}
// //                               </option>
// //                             ))}
// //                           </select>
// //                         </div>
// //                         {selectedCategory && availableLevel1.length > 0 && (
// //                           <div className="grid grid-cols-3 gap-3 items-center">
// //                             <label
// //                               className={`text-sm font-medium text-end ${palette.text}`}
// //                             >
// //                               Level 1
// //                             </label>
// //                             <select
// //                               className={`col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 ${palette.select} ${palette.cardBorder}`}
// //                               value={selectedLevel1}
// //                               onChange={handleLevel1Change}
// //                             >
// //                               <option value="">
// //                                 Select Level 1 (Optional)
// //                               </option>
// //                               {availableLevel1.map((item) => (
// //                                 <option key={item.id} value={item.id}>
// //                                   {item.name}
// //                                 </option>
// //                               ))}
// //                             </select>
// //                           </div>
// //                         )}
// //                         {selectedLevel1 && availableLevel2.length > 0 && (
// //                           <div className="grid grid-cols-3 gap-3 items-center">
// //                             <label
// //                               className={`text-sm font-medium text-end ${palette.text}`}
// //                             >
// //                               Level 2
// //                             </label>
// //                             <select
// //                               className={`col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 ${palette.select} ${palette.cardBorder}`}
// //                               value={selectedLevel2}
// //                               onChange={handleLevel2Change}
// //                             >
// //                               <option value="">
// //                                 Select Level 2 (Optional)
// //                               </option>
// //                               {availableLevel2.map((item) => (
// //                                 <option key={item.id} value={item.id}>
// //                                   {item.name}
// //                                 </option>
// //                               ))}
// //                             </select>
// //                           </div>
// //                         )}
// //                         {selectedLevel2 && availableLevel3.length > 0 && (
// //                           <div className="grid grid-cols-3 gap-3 items-center">
// //                             <label
// //                               className={`text-sm font-medium text-end ${palette.text}`}
// //                             >
// //                               Level 3
// //                             </label>
// //                             <select
// //                               className={`col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 ${palette.select} ${palette.cardBorder}`}
// //                               value={selectedLevel3}
// //                               onChange={handleLevel3Change}
// //                             >
// //                               <option value="">
// //                                 Select Level 3 (Optional)
// //                               </option>
// //                               {availableLevel3.map((item) => (
// //                                 <option key={item.id} value={item.id}>
// //                                   {item.name}
// //                                 </option>
// //                               ))}
// //                             </select>
// //                           </div>
// //                         )}
// //                         {selectedLevel3 && availableLevel4.length > 0 && (
// //                           <div className="grid grid-cols-3 gap-3 items-center">
// //                             <label
// //                               className={`text-sm font-medium text-end ${palette.text}`}
// //                             >
// //                               Level 4
// //                             </label>
// //                             <select
// //                               className={`col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 ${palette.select} ${palette.cardBorder}`}
// //                               value={selectedLevel4}
// //                               onChange={handleLevel4Change}
// //                             >
// //                               <option value="">
// //                                 Select Level 4 (Optional)
// //                               </option>
// //                               {availableLevel4.map((item) => (
// //                                 <option key={item.id} value={item.id}>
// //                                   {item.name}
// //                                 </option>
// //                               ))}
// //                             </select>
// //                           </div>
// //                         )}
// //                         {selectedLevel4 && availableLevel5.length > 0 && (
// //                           <div className="grid grid-cols-3 gap-3 items-center">
// //                             <label
// //                               className={`text-sm font-medium text-end ${palette.text}`}
// //                             >
// //                               Level 5
// //                             </label>
// //                             <select
// //                               className={`col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 ${palette.select} ${palette.cardBorder}`}
// //                               value={selectedLevel5}
// //                               onChange={handleLevel5Change}
// //                             >
// //                               <option value="">
// //                                 Select Level 5 (Optional)
// //                               </option>
// //                               {availableLevel5.map((item) => (
// //                                 <option key={item.id} value={item.id}>
// //                                   {item.name}
// //                                 </option>
// //                               ))}
// //                             </select>
// //                           </div>
// //                         )}
// //                         {selectedLevel5 && availableLevel6.length > 0 && (
// //                           <div className="grid grid-cols-3 gap-3 items-center">
// //                             <label
// //                               className={`text-sm font-medium text-end ${palette.text}`}
// //                             >
// //                               Level 6
// //                             </label>
// //                             <select
// //                               className={`col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 ${palette.select} ${palette.cardBorder}`}
// //                               value={selectedLevel6}
// //                               onChange={handleLevel6Change}
// //                             >
// //                               <option value="">
// //                                 Select Level 6 (Optional)
// //                               </option>
// //                               {availableLevel6.map((item) => (
// //                                 <option key={item.id} value={item.id}>
// //                                   {item.name}
// //                                 </option>
// //                               ))}
// //                             </select>
// //                           </div>
// //                         )}
// //                         {selectedProject && availableBuildings.length > 0 && (
// //                           <div className="grid grid-cols-3 gap-3 items-center">
// //                             <label
// //                               className={`text-sm font-medium text-end ${palette.text}`}
// //                             >
// //                               Building
// //                             </label>
// //                             <select
// //                               className={`col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 ${palette.select} ${palette.cardBorder}`}
// //                               value={selectedBuilding}
// //                               onChange={handleBuildingChange}
// //                             >
// //                               <option value="">
// //                                 Select Building (Optional)
// //                               </option>
// //                               {availableBuildings.map((building) => (
// //                                 <option key={building.id} value={building.id}>
// //                                   {building.name}
// //                                 </option>
// //                               ))}
// //                             </select>
// //                           </div>
// //                         )}
// //                         {selectedBuilding && availableZones.length > 0 && (
// //                           <div className="grid grid-cols-3 gap-3 items-center">
// //                             <label
// //                               className={`text-sm font-medium text-end ${palette.text}`}
// //                             >
// //                               Zone
// //                             </label>
// //                             <select
// //                               className={`col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 ${palette.select} ${palette.cardBorder}`}
// //                               value={userDataForm.zone_id}
// //                               onChange={handleZoneChange}
// //                             >
// //                               <option value="">Select Zone (Optional)</option>
// //                               {availableZones.map((zone) => (
// //                                 <option key={zone.id} value={zone.id}>
// //                                   {zone.name}
// //                                 </option>
// //                               ))}
// //                             </select>
// //                           </div>
// //                         )}
// //                       </>
// //                     )}
// //                     <div className="grid grid-cols-3 gap-3 items-center">
// //                       <label
// //                         className={`text-sm font-medium text-end ${palette.text}`}
// //                       >
// //                         First Name<span className="text-red-500">*</span>
// //                       </label>
// //                       <input
// //                         type="text"
// //                         className={`col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 ${palette.input} ${palette.cardBorder}`}
// //                         value={userDataForm.first_name}
// //                         placeholder="Enter First Name"
// //                         onChange={(e) =>
// //                           setUserDataForm((prev) => ({
// //                             ...prev,
// //                             first_name: e.target.value,
// //                           }))
// //                         }
// //                         required
// //                       />
// //                     </div>
// //                     <div className="grid grid-cols-3 gap-3 items-center">
// //                       <label
// //                         className={`text-sm font-medium text-end ${palette.text}`}
// //                       >
// //                         Last Name<span className="text-red-500">*</span>
// //                       </label>
// //                       <input
// //                         type="text"
// //                         className={`col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 ${palette.input} ${palette.cardBorder}`}
// //                         value={userDataForm.last_name}
// //                         placeholder="Enter Last Name"
// //                         onChange={(e) =>
// //                           setUserDataForm((prev) => ({
// //                             ...prev,
// //                             last_name: e.target.value,
// //                           }))
// //                         }
// //                         required
// //                       />
// //                     </div>
// //                     <div className="grid grid-cols-3 gap-3 items-center">
// //                       <label
// //                         className={`text-sm font-medium text-end ${palette.text}`}
// //                       >
// //                         Email<span className="text-red-500">*</span>
// //                       </label>
// //                       <input
// //                         type="email"
// //                         className={`col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 ${palette.input} ${palette.cardBorder}`}
// //                         value={userDataForm.email}
// //                         placeholder="Enter Email Address"
// //                         onChange={(e) =>
// //                           setUserDataForm((prev) => ({
// //                             ...prev,
// //                             email: e.target.value,
// //                           }))
// //                         }
// //                         required
// //                       />
// //                     </div>
// //                     <div className="grid grid-cols-3 gap-3 items-center">
// //                       <label
// //                         className={`text-sm font-medium text-end ${palette.text}`}
// //                       >
// //                         Mobile
// //                       </label>
// //                       <input
// //                         type="tel"
// //                         className={`col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 ${palette.input} ${palette.cardBorder}`}
// //                         value={userDataForm.mobile}
// //                         placeholder="Enter Mobile Number"
// //                         onChange={(e) =>
// //                           setUserDataForm((prev) => ({
// //                             ...prev,
// //                             mobile: e.target.value,
// //                           }))
// //                         }
// //                       />
// //                     </div>
// //                     <div className="grid grid-cols-3 gap-3 items-center">
// //                       <label
// //                         className={`text-sm font-medium text-end ${palette.text}`}
// //                       >
// //                         Password<span className="text-red-500">*</span>
// //                       </label>
// //                       <input
// //                         type="password"
// //                         className={`col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 ${palette.input} ${palette.cardBorder}`}
// //                         value={userDataForm.password}
// //                         placeholder="Enter Password"
// //                         onChange={(e) =>
// //                           setUserDataForm((prev) => ({
// //                             ...prev,
// //                             password: e.target.value,
// //                           }))
// //                         }
// //                         required
// //                       />
// //                     </div>
// //                     {/* Submit Buttons */}
// //                     <div className="flex gap-3 pt-4">
// //                       <button
// //                         type="button"
// //                         className={`flex-1 ${palette.btnCancel} py-2 px-4 rounded`}
// //                         onClick={resetForm}
// //                       >
// //                         Cancel
// //                       </button>
// //                       <button
// //                         type="submit"
// //                         className={submitButtonClassName}
// //                         disabled={
// //                           !isFormValid() || orgInfoLoading || projectsLoading
// //                         }
// //                       >
// //                         {orgInfoLoading || projectsLoading
// //                           ? "Loading..."
// //                           : canCreateClient
// //                           ? "Create Client"
// //                           : canCreateManager
// //                           ? "Create Manager"
// //                           : "Create User"}
// //                       </button>
// //                     </div>
// //                   </form>
// //                 </div>
// //               </div>
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // export default User;




// import React, {
//   useState,
//   useEffect,
//   useMemo,
//   useCallback,
//   useRef,
// } from "react";
// import { MdOutlineCancel } from "react-icons/md";
// import SideBarSetup from "../../components/SideBarSetup";
// import { showToast } from "../../utils/toast";
// import { useTheme } from "../../ThemeContext";
// import { useSidebar } from "../../components/SidebarContext";
// import axios from "axios";
// import {
//   createUserDetails,
//   allorgantioninfototalbyUser_id,
//   getCategoryTreeByProject,
//   getProjectsByOrganization,
//   createUserAccessRole,
// } from "../../api";
// import { FaPlus } from "react-icons/fa";

// const SIDEBAR_WIDTH = 125;

// function User() {
//   const { theme } = useTheme();
//   const { sidebarOpen } = useSidebar();

//   // THEME palette (your request)
//   const ORANGE = "#ffbe63";
//   const BG_OFFWHITE = "#fcfaf7";
//   const bgColor = theme === "dark" ? "#191922" : BG_OFFWHITE;
//   const cardColor = theme === "dark" ? "#23232c" : "#fff";
//   const borderColor = ORANGE;
//   const textColor = theme === "dark" ? "#fff" : "#222";
//   const iconColor = ORANGE;

//   // --- ALL LOGIC BELOW IS YOURS, unchanged except color classNames ---

//   const renderCount = useRef(0);
//   renderCount.current += 1;

//   const userData = useMemo(() => {
//     try {
//       const userString = localStorage.getItem("USER_DATA");
//       if (userString && userString !== "undefined") {
//         const parsed = JSON.parse(userString);
//         if (!parsed.roles) {
//           try {
//             const token = localStorage.getItem("ACCESS_TOKEN");
//             if (token) {
//               const payload = JSON.parse(atob(token.split(".")[1]));
//               parsed.roles = payload.roles || [];
//             }
//           } catch (error) {
//             parsed.roles = [];
//           }
//         }
//         return parsed || {};
//       }
//     } catch {
//       return {};
//     }
//     return {};
//   }, []);

//   const isSuperAdmin = !!userData?.superadmin;
//   const isStaff = !!userData?.is_staff;
//   const isClient = !isSuperAdmin && !isStaff && !!userData?.is_client;
//   const is_manager =
//     !isSuperAdmin && !isStaff && !isClient && !!userData?.is_manager;

//   const canCreateClient = isStaff || isSuperAdmin;
//   const canCreateManager = isClient;
//   const canCreateNormalUser = is_manager;

//   const userId = userData?.user_id;
//   const org = useMemo(() => userData.org || "", [userData.org]);
//   const userRole = useMemo(() => {
//     if (userData.superadmin) return "ADMIN";
//     else if (userData.is_staff) return "STAFF";
//     else if (userData.roles && userData.roles.length > 0)
//       return userData.roles[0];
//     else if (userData.is_manager) return "Manager";
//     else if (userData.is_client) return "Client";
//     else return "User";
//   }, [userData]);
//   const creationCapability = useMemo(() => {
//     if (canCreateClient) return "Can create client users";
//     else if (canCreateManager) return "Can create manager users";
//     else if (canCreateNormalUser) return "Can create normal users with roles";
//     else return "No user creation permissions";
//   }, [canCreateClient, canCreateManager, canCreateNormalUser]);

//   const [orgInfo, setOrgInfo] = useState({});
//   const [orgInfoLoading, setOrgInfoLoading] = useState(false);
//   const [isAdd, setAdd] = useState(false);
//   const [userDataForm, setUserDataForm] = useState({
//     username: "",
//     first_name: "",
//     last_name: "",
//     email: "",
//     mobile: "",
//     password: "",
//     role: "",
//     organization_id: "",
//     company_id: "",
//     entity_id: "",
//     project_id: "",
//     building_id: "",
//     zone_id: "",
//   });

//   const [selectedOrganization, setSelectedOrganization] = useState("");
//   const [selectedCompany, setSelectedCompany] = useState("");
//   const [selectedProject, setSelectedProject] = useState("");
//   const [selectedBuilding, setSelectedBuilding] = useState("");
//   const [availableCompanies, setAvailableCompanies] = useState([]);
//   const [availableEntities, setAvailableEntities] = useState([]);
//   const [availableProjects, setAvailableProjects] = useState([]);
//   const [availableBuildings, setAvailableBuildings] = useState([]);
//   const [availableZones, setAvailableZones] = useState([]);
//   const [orgManagerTypes, setOrgManagerTypes] = useState([]);
//   const [showManagerDropdown, setShowManagerDropdown] = useState(false);
//   const [selectedManagerType, setSelectedManagerType] = useState("");
//   const [projectsLoading, setProjectsLoading] = useState(false);
//   const [categoryTree, setCategoryTree] = useState([]);
//   const [categoryLoading, setCategoryLoading] = useState(false);
//   const [selectedCategory, setSelectedCategory] = useState("");
//   const [selectedLevel1, setSelectedLevel1] = useState("");
//   const [selectedLevel2, setSelectedLevel2] = useState("");
//   const [selectedLevel3, setSelectedLevel3] = useState("");
//   const [selectedLevel4, setSelectedLevel4] = useState("");
//   const [selectedLevel5, setSelectedLevel5] = useState("");
//   const [selectedLevel6, setSelectedLevel6] = useState("");
//   const [availableLevel1, setAvailableLevel1] = useState([]);
//   const [availableLevel2, setAvailableLevel2] = useState([]);
//   const [availableLevel3, setAvailableLevel3] = useState([]);
//   const [availableLevel4, setAvailableLevel4] = useState([]);
//   const [availableLevel5, setAvailableLevel5] = useState([]);
//   const [availableLevel6, setAvailableLevel6] = useState([]);

//   const resetCategorySelections = useCallback(() => {
//     setSelectedCategory("");
//     setSelectedLevel1("");
//     setSelectedLevel2("");
//     setSelectedLevel3("");
//     setSelectedLevel4("");
//     setSelectedLevel5("");
//     setSelectedLevel6("");
//     setAvailableLevel1([]);
//     setAvailableLevel2([]);
//     setAvailableLevel3([]);
//     setAvailableLevel4([]);
//     setAvailableLevel5([]);
//     setAvailableLevel6([]);
//   }, []);

//   const fetchCategoryTree = useCallback(
//     async (projectId) => {
//       if (!projectId) return;
//       setCategoryLoading(true);
//       try {
//         const response = await getCategoryTreeByProject(projectId);
//         setCategoryTree(response.data || []);
//         resetCategorySelections();
//       } catch (error) {
//         setCategoryTree([]);
//         resetCategorySelections();
//         showToast("Failed to load categories for this project", "error");
//       } finally {
//         setCategoryLoading(false);
//       }
//     },
//     [resetCategorySelections]
//   );

//   const fetchProjectsForManager = useCallback(async () => {
//     if ((is_manager || canCreateManager) && org) {
//       setProjectsLoading(true);
//       try {
//         const res = await getProjectsByOrganization(org);
//         let projects = [];
//         if (Array.isArray(res.data)) projects = res.data;
//         else if (res.data && res.data.projects) projects = res.data.projects;
//         setAvailableProjects(projects);
//         if ((is_manager || canCreateManager) && projects.length > 0) {
//           setShowManagerDropdown(true);
//           setOrgManagerTypes(
//             res.data.manager_types || ["Project Manager", "Site Manager"]
//           );
//         }
//       } catch (err) {
//         setShowManagerDropdown(false);
//         setOrgManagerTypes([]);
//         setAvailableProjects([]);
//         showToast("Failed to fetch projects. Please try again later.", "error");
//       } finally {
//         setProjectsLoading(false);
//       }
//     }
//   }, [is_manager, canCreateManager, org]);

//   useEffect(() => {
//     if (isAdd && (is_manager || canCreateManager) && org) {
//       fetchProjectsForManager();
//     }
//   }, [isAdd, is_manager, canCreateManager, org, fetchProjectsForManager]);

//   const getRoleOptions = useCallback(() => {
//     if (canCreateClient) return [];
//     else if (canCreateManager) return [];
//     else if (canCreateNormalUser) {
//       return [
//         { value: "SUPERVISOR", label: "SUPERVISOR" },
//         { value: "CHECKER", label: "CHECKER" },
//         { value: "MAKER", label: "MAKER" },
//         { value: "Intializer", label: "Intializer" },
//       ];
//     }
//     return [];
//   }, [canCreateClient, canCreateManager, canCreateNormalUser]);

//   const fetchOrgInfo = useCallback(async () => {
//     if (!userId) {
//       showToast("User ID not found", "error");
//       return;
//     }
//     setOrgInfoLoading(true);
//     try {
//       const response = await axios.get(
//         https://konstruct.world/organizations/user-orgnizationn-info/${userId}/,
//         {
//           headers: {
//             Authorization: Bearer ${localStorage.getItem("ACCESS_TOKEN")},
//           },
//         }
//       );
//       setOrgInfo(response.data);
//     } catch (error) {
//       showToast("Failed to fetch organization info", "error");
//     } finally {
//       setOrgInfoLoading(false);
//     }
//   }, [userId]);

//   const handleAdd = useCallback(() => {
//     setAdd(true);
//     fetchOrgInfo();
//   }, [fetchOrgInfo]);

//   const handleOrganizationChange = useCallback(
//     async (e) => {
//       const orgId = e.target.value;
//       setSelectedOrganization(orgId);
//       setSelectedCompany("");
//       setSelectedProject("");
//       setSelectedBuilding("");
//       setUserDataForm((prev) => ({
//         ...prev,
//         organization_id: orgId,
//         company_id: "",
//         entity_id: "",
//         project_id: "",
//         building_id: "",
//         zone_id: "",
//       }));
//       setAvailableCompanies([]);
//       setAvailableEntities([]);
//       setAvailableBuildings([]);
//       setAvailableZones([]);
//       if (orgId && orgInfo.companies) {
//         const filteredCompanies = orgInfo.companies.filter(
//           (company) => company.organization === parseInt(orgId)
//         );
//         setAvailableCompanies(filteredCompanies);
//       }
//       if (
//         orgId &&
//         (is_manager || canCreateManager) &&
//         parseInt(orgId) !== parseInt(org)
//       ) {
//         setProjectsLoading(true);
//         try {
//           const res = await getProjectsByOrganization(orgId);
//           let projects = [];
//           if (Array.isArray(res.data)) projects = res.data;
//           else if (res.data && res.data.projects) projects = res.data.projects;
//           setAvailableProjects(projects);
//         } catch (err) {
//           setAvailableProjects([]);
//           showToast(
//             "Failed to fetch projects for selected organization",
//             "error"
//           );
//         } finally {
//           setProjectsLoading(false);
//         }
//       }
//     },
//     [orgInfo.companies, is_manager, canCreateManager, org]
//   );

//   const handleCompanyChange = useCallback(
//     (e) => {
//       const companyId = e.target.value;
//       setSelectedCompany(companyId);
//       setUserDataForm((prev) => ({
//         ...prev,
//         company_id: companyId,
//         entity_id: "",
//       }));
//       if (companyId && orgInfo.entities) {
//         const filteredEntities = orgInfo.entities.filter(
//           (entity) => entity.company === parseInt(companyId)
//         );
//         setAvailableEntities(filteredEntities);
//       } else {
//         setAvailableEntities([]);
//       }
//     },
//     [orgInfo.entities]
//   );

//   const handleEntityChange = useCallback((e) => {
//     const entityId = e.target.value;
//     setUserDataForm((prev) => ({
//       ...prev,
//       entity_id: entityId,
//     }));
//   }, []);

//   const handleProjectChange = useCallback(
//     (e) => {
//       const projectId = e.target.value;
//       setSelectedProject(projectId);
//       setSelectedBuilding("");
//       setUserDataForm((prev) => ({
//         ...prev,
//         project_id: projectId,
//         building_id: "",
//         zone_id: "",
//       }));
//       setAvailableBuildings([]);
//       setAvailableZones([]);
//       resetCategorySelections();
//       if (projectId) fetchCategoryTree(projectId);
//       else setCategoryTree([]);
//       if (projectId) {
//         const selectedProjectObj = availableProjects.find(
//           (project) => project.id === parseInt(projectId)
//         );
//         if (selectedProjectObj && selectedProjectObj.buildings) {
//           setAvailableBuildings(selectedProjectObj.buildings);
//         }
//       }
//     },
//     [availableProjects, resetCategorySelections, fetchCategoryTree]
//   );

//   const handleBuildingChange = useCallback(
//     (e) => {
//       const buildingId = e.target.value;
//       setSelectedBuilding(buildingId);
//       setUserDataForm((prev) => ({
//         ...prev,
//         building_id: buildingId,
//         zone_id: "",
//       }));
//       setAvailableZones([]);
//       if (buildingId) {
//         const selectedBuildingObj = availableBuildings.find(
//           (building) => building.id === parseInt(buildingId)
//         );
//         if (selectedBuildingObj && selectedBuildingObj.zones) {
//           setAvailableZones(selectedBuildingObj.zones);
//         }
//       }
//     },
//     [availableBuildings]
//   );

//   const handleZoneChange = useCallback((e) => {
//     const zoneId = e.target.value;
//     setUserDataForm((prev) => ({
//       ...prev,
//       zone_id: zoneId,
//     }));
//   }, []);

//   // Category selection handlers
//   const handleCategoryChange = useCallback(
//     (e) => {
//       const categoryId = e.target.value;
//       setSelectedCategory(categoryId);
//       setSelectedLevel1("");
//       setSelectedLevel2("");
//       setSelectedLevel3("");
//       setSelectedLevel4("");
//       setSelectedLevel5("");
//       setSelectedLevel6("");
//       setAvailableLevel2([]);
//       setAvailableLevel3([]);
//       setAvailableLevel4([]);
//       setAvailableLevel5([]);
//       setAvailableLevel6([]);
//       if (categoryId) {
//         const selectedCategoryObj = categoryTree.find(
//           (cat) => cat.id === parseInt(categoryId)
//         );
//         if (selectedCategoryObj && selectedCategoryObj.level1) {
//           setAvailableLevel1(selectedCategoryObj.level1);
//         } else {
//           setAvailableLevel1([]);
//         }
//       } else {
//         setAvailableLevel1([]);
//       }
//     },
//     [categoryTree]
//   );
//   const handleLevel1Change = useCallback(
//     (e) => {
//       const level1Id = e.target.value;
//       setSelectedLevel1(level1Id);
//       setSelectedLevel2("");
//       setSelectedLevel3("");
//       setSelectedLevel4("");
//       setSelectedLevel5("");
//       setSelectedLevel6("");
//       setAvailableLevel3([]);
//       setAvailableLevel4([]);
//       setAvailableLevel5([]);
//       setAvailableLevel6([]);
//       if (level1Id) {
//         const selectedLevel1Obj = availableLevel1.find(
//           (item) => item.id === parseInt(level1Id)
//         );
//         if (selectedLevel1Obj && selectedLevel1Obj.level2) {
//           setAvailableLevel2(selectedLevel1Obj.level2);
//         } else {
//           setAvailableLevel2([]);
//         }
//       } else {
//         setAvailableLevel2([]);
//       }
//     },
//     [availableLevel1]
//   );
//   const handleLevel2Change = useCallback(
//     (e) => {
//       const level2Id = e.target.value;
//       setSelectedLevel2(level2Id);
//       setSelectedLevel3("");
//       setSelectedLevel4("");
//       setSelectedLevel5("");
//       setSelectedLevel6("");
//       setAvailableLevel4([]);
//       setAvailableLevel5([]);
//       setAvailableLevel6([]);
//       if (level2Id) {
//         const selectedLevel2Obj = availableLevel2.find(
//           (item) => item.id === parseInt(level2Id)
//         );
//         if (selectedLevel2Obj && selectedLevel2Obj.level3) {
//           setAvailableLevel3(selectedLevel2Obj.level3);
//         } else {
//           setAvailableLevel3([]);
//         }
//       } else {
//         setAvailableLevel3([]);
//       }
//     },
//     [availableLevel2]
//   );
//   const handleLevel3Change = useCallback(
//     (e) => {
//       const level3Id = e.target.value;
//       setSelectedLevel3(level3Id);
//       setSelectedLevel4("");
//       setSelectedLevel5("");
//       setSelectedLevel6("");
//       setAvailableLevel5([]);
//       setAvailableLevel6([]);
//       if (level3Id) {
//         const selectedLevel3Obj = availableLevel3.find(
//           (item) => item.id === parseInt(level3Id)
//         );
//         if (selectedLevel3Obj && selectedLevel3Obj.level4) {
//           setAvailableLevel4(selectedLevel3Obj.level4);
//         } else {
//           setAvailableLevel4([]);
//         }
//       } else {
//         setAvailableLevel4([]);
//       }
//     },
//     [availableLevel3]
//   );
//   const handleLevel4Change = useCallback(
//     (e) => {
//       const level4Id = e.target.value;
//       setSelectedLevel4(level4Id);
//       setSelectedLevel5("");
//       setSelectedLevel6("");
//       setAvailableLevel6([]);
//       if (level4Id) {
//         const selectedLevel4Obj = availableLevel4.find(
//           (item) => item.id === parseInt(level4Id)
//         );
//         if (selectedLevel4Obj && selectedLevel4Obj.level5) {
//           setAvailableLevel5(selectedLevel4Obj.level5);
//         } else {
//           setAvailableLevel5([]);
//         }
//       } else {
//         setAvailableLevel5([]);
//       }
//     },
//     [availableLevel4]
//   );
//   const handleLevel5Change = useCallback(
//     (e) => {
//       const level5Id = e.target.value;
//       setSelectedLevel5(level5Id);
//       setSelectedLevel6("");
//       if (level5Id) {
//         const selectedLevel5Obj = availableLevel5.find(
//           (item) => item.id === parseInt(level5Id)
//         );
//         if (selectedLevel5Obj && selectedLevel5Obj.level6) {
//           setAvailableLevel6(selectedLevel5Obj.level6);
//         } else {
//           setAvailableLevel6([]);
//         }
//       } else {
//         setAvailableLevel6([]);
//       }
//     },
//     [availableLevel5]
//   );
//   const handleLevel6Change = useCallback((e) => {
//     const level6Id = e.target.value;
//     setSelectedLevel6(level6Id);
//   }, []);

//   const isFormValid = useCallback(() => {
//     const basicFields =
//       userDataForm.username &&
//       userDataForm.first_name &&
//       userDataForm.last_name &&
//       userDataForm.email &&
//       userDataForm.password;
//     if (canCreateClient) return basicFields;
//     else if (canCreateManager)
//       return basicFields && userDataForm.organization_id;
//     else if (canCreateNormalUser)
//       return basicFields && userDataForm.role && selectedCategory;
//     return false;
//   }, [
//     userDataForm,
//     selectedCategory,
//     canCreateClient,
//     canCreateManager,
//     canCreateNormalUser,
//   ]);

//   const handleCreate = useCallback(
//     async (e) => {
//       e.preventDefault();
//       if (!isFormValid()) {
//         showToast("Please fill in all required fields", "error");
//         return;
//       }


//       // For client users - simple creation with basic info only
//       if (canCreateClient) {
//         const clientPayload = {
//           user: {
//             username: userDataForm.username,
//             first_name: userDataForm.first_name,
//             last_name: userDataForm.last_name,
//             email: userDataForm.email,
//             phone_number: userDataForm.mobile || "",
//             password: userDataForm.password,
//             is_client: true,
//             is_manager: false,
//             has_access: true,
//             org: null,
//             company: null,
//             entity: null,
//           },
//           access: {
//             project_id: null,
//             building_id: null,
//             zone_id: null,
//             flat_id: null,
//             active: true,
//             category: null,
//             CategoryLevel1: null,
//             CategoryLevel2: null,
//             CategoryLevel3: null,
//             CategoryLevel4: null,
//             CategoryLevel5: null,
//             CategoryLevel6: null,
//           },
//           roles: [], // Empty roles array for client users
//         };

//         try {
//           const response = await createUserAccessRole(clientPayload);
//           if (response.status === 201) {
//             showToast("Client user created successfully", "success");
//             resetForm();
//           } else {
//             showToast("Failed to create client user", "error");
//           }
//         } catch (error) {
//           if (error.response && error.response.data) {
//             const errorData = error.response.data;
//             if (errorData.user && errorData.user.username) {
//               showToast("Username already exists.", "error");
//               return;
//             }
//             if (errorData.user && errorData.user.email) {
//               showToast("Email already exists.", "error");
//               return;
//             }
//           }
//           showToast("Error creating client user. Please try again.", "error");
//         }
//         return;
//       }

//       // For manager and normal users - existing complex payload
//       const completePayload = {
//         user: {
//           username: userDataForm.username,
//           first_name: userDataForm.first_name,
//           last_name: userDataForm.last_name,
//           email: userDataForm.email,
//           phone_number: userDataForm.mobile || "",
//           password: userDataForm.password,
//           org: userDataForm.organization_id
//             ? parseInt(userDataForm.organization_id)
//             : org
//             ? parseInt(org)
//             : null,
//           company: userDataForm.company_id
//             ? parseInt(userDataForm.company_id)
//             : null,
//           entity: userDataForm.entity_id
//             ? parseInt(userDataForm.entity_id)
//             : null,
//           is_manager: canCreateManager ? true : false,
//           is_client: false,
//           has_access: true,
//         },
//         access: {
//           project_id: userDataForm.project_id
//             ? parseInt(userDataForm.project_id)
//             : null,
//           building_id: userDataForm.building_id
//             ? parseInt(userDataForm.building_id)
//             : null,
//           zone_id: userDataForm.zone_id ? parseInt(userDataForm.zone_id) : null,
//           flat_id: null,
//           active: true,
//           category: selectedCategory ? parseInt(selectedCategory) : null,
//           CategoryLevel1: selectedLevel1 ? parseInt(selectedLevel1) : null,
//           CategoryLevel2: selectedLevel2 ? parseInt(selectedLevel2) : null,
//           CategoryLevel3: selectedLevel3 ? parseInt(selectedLevel3) : null,
//           CategoryLevel4: selectedLevel4 ? parseInt(selectedLevel4) : null,
//           CategoryLevel5: selectedLevel5 ? parseInt(selectedLevel5) : null,
//           CategoryLevel6: selectedLevel6 ? parseInt(selectedLevel6) : null,
//         },
//         roles: [],
//       };

//       if (canCreateManager) {
//         // Do nothing here for roles!
//       } else if (canCreateNormalUser) {
//         if (userDataForm.role) {
//           completePayload.roles.push({ role: userDataForm.role });
//         }
//       }

//       try {
//         const response = await createUserAccessRole(completePayload);
//         if (response.status === 201) {
//           let successMessage = "User created successfully";
//           if (canCreateManager) {
//             successMessage = "Manager user created successfully";
//           } else if (canCreateNormalUser) {
//             successMessage = "User created successfully with role assigned";
//           }
//           showToast(successMessage, "success");
//           resetForm();
//         } else {
//           showToast("Failed to create user", "error");
//         }
//       } catch (error) {
//         if (error.response && error.response.data) {
//           const errorData = error.response.data;
//           if (errorData.user && errorData.user.username) {
//             showToast("Username already exists.", "error");
//             return;
//           }
//           if (errorData.user && errorData.user.email) {
//             showToast("Email already exists.", "error");
//             return;
//           }
//         }
//         showToast("Error creating user. Please try again.", "error");
//       }
//     },
//     [
//       userDataForm,
//       selectedCategory,
//       selectedLevel1,
//       selectedLevel2,
//       selectedLevel3,
//       selectedLevel4,
//       selectedLevel5,
//       selectedLevel6,
//       canCreateClient,
//       canCreateManager,
//       canCreateNormalUser,
//       org,
//       isFormValid,
//     ]
//   );

//   const resetForm = useCallback(() => {
//     setUserDataForm({
//       username: "",
//       first_name: "",
//       last_name: "",
//       email: "",
//       mobile: "",
//       password: "",
//       role: "",
//       organization_id: "",
//       company_id: "",
//       entity_id: "",
//       project_id: "",
//       building_id: "",
//       zone_id: "",
//     });
//     setSelectedOrganization("");
//     setSelectedCompany("");
//     setSelectedProject("");
//     setSelectedBuilding("");
//     setAvailableCompanies([]);
//     setAvailableEntities([]);
//     setAvailableProjects([]);
//     setAvailableBuildings([]);
//     setAvailableZones([]);
//     setOrgManagerTypes([]);
//     setShowManagerDropdown(false);
//     setSelectedManagerType("");
//     setAdd(false);
//     setOrgInfo({});
//     setProjectsLoading(false);
//     setCategoryTree([]);
//     setCategoryLoading(false);
//     resetCategorySelections();
//   }, [resetCategorySelections]);

//   const submitButtonClassName = useMemo(() => {
//     const baseClasses = "flex-1 py-2 px-4 rounded transition duration-200";
//     const validClasses = "bg-[#7c3aed] text-white hover:bg-[#713ae3]";
//     const invalidClasses = "bg-gray-300 text-gray-500 cursor-not-allowed";
//     const isValid = isFormValid();
//     return ${baseClasses} ${isValid ? validClasses : invalidClasses};
//   }, [isFormValid]);

//   // =========== RESTRICTED CASE (NO CREATE PERMS) ===========
//   if (!canCreateClient && !canCreateManager && !canCreateNormalUser) {
//     return (
//       <div className="flex min-h-screen" style={{ background: bgColor }}>
//         <SideBarSetup />
//         <div
//           className="my-5 w-[85%] mt-5 ml-[16%] mr-[1%]"
//           style={{
//             marginLeft: sidebarOpen ? SIDEBAR_WIDTH : 0,
//             transition: "margin-left 0.35s cubic-bezier(.6,-0.17,.22,1.08)",
//           }}
//         >
//           <div
//             className="px-6 py-5 max-w-7xl mx-auto rounded"
//             style={{
//               background: cardColor,
//               border: 1.5px solid ${borderColor},
//               color: textColor,
//               boxShadow:
//                 theme === "dark"
//                   ? "0 4px 24px 0 rgba(60,30,10,0.15)"
//                   : "0 2px 8px 0 rgba(100,70,10,0.09)",
//             }}
//           >
//             {/* ===== HEADER ===== */}
//             <div className="mb-6 flex items-center justify-between">
//               <div>
//                 <h1 className="text-2xl font-bold" style={{ color: textColor }}>
//                   USER MANAGEMENT
//                 </h1>
//                 <p
//                   className="opacity-80 mt-2"
//                   style={{ color: textColor }}
//                 >
//                   User creation and management
//                 </p>
//                 <div className="mt-3">
//                   <span
//                     className="inline-block px-3 py-1 rounded-full text-sm"
//                     style={{
//                       background: "#fca5a5",
//                       color: "#b91c1c",
//                       fontWeight: 600,
//                     }}
//                   >
//                     {userRole} - No user creation permissions
//                   </span>
//                 </div>
//               </div>
//             </div>
//             <div
//               className="rounded-lg p-8"
//               style={{
//                 background: theme === "dark" ? "#23232c" : "#f6f8fd",
//                 color: textColor,
//               }}
//             >
//               <div className="text-center">
//                 <div className="mb-6">
//                   <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
//                     <MdOutlineCancel className="text-red-600 text-2xl" />
//                   </div>
//                   <h2 className="text-xl font-semibold mb-2" style={{ color: textColor }}>
//                     Access Restricted
//                   </h2>
//                   <p className="opacity-70" style={{ color: textColor }}>
//                     You do not have permissions to create users. Please contact
//                     your administrator.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // =========== MAIN RENDER (CAN CREATE USERS) ===========
//   return (
//     <div className="flex min-h-screen" style={{ background: bgColor }}>
//   <SideBarSetup />
//   <div
//     className="flex-1 flex justify-center items-start"
//     style={{
//       minHeight: "100vh",
//       transition: "margin-left 0.35s cubic-bezier(.6,-0.17,.22,1.08)",
//     }}
//   >
//     <div
//       className="my-10 w-full max-w-5xl px-6 py-5 rounded"
//       style={{
//         background: cardColor,
//         border: 1.5px solid ${borderColor},
//         color: textColor,
//         boxShadow:
//           theme === "dark"
//             ? "0 4px 24px 0 rgba(60,30,10,0.15)"
//             : "0 2px 8px 0 rgba(100,70,10,0.09)",
//       }}
//     >
//           {/* ===== HEADER ===== */}
//           <div className="mb-6 flex items-center justify-between">
//             <div>
//               <h1 className="text-2xl font-bold" style={{ color: textColor }}>
//                 USER MANAGEMENT
//               </h1>
//               <p className="opacity-80 mt-2" style={{ color: textColor }}>
//                 Create and manage users for your organization
//               </p>
//               <div className="mb-3">
//                 <span
//                   className="inline-block px-3 py-1 rounded-full text-sm mr-2"
//                   style={{
//                     background: "#ffe9ba",
//                     color: "#b45309",
//                     fontWeight: 600,
//                   }}
//                 >
//                   {userRole} Access (Render #{renderCount.current})
//                 </span>
//                 <span
//                   className="inline-block px-3 py-1 rounded-full text-sm"
//                   style={{
//                     background: "#c7d2fe",
//                     color: "#1e293b",
//                     fontWeight: 600,
//                   }}
//                 >
//                   {creationCapability}
//                 </span>
//               </div>
//             </div>
//           </div>
//           {/* ===== FORM AREA ===== */}
//           <div
//             className="rounded-lg p-8"
//             style={{
//               background: theme === "dark" ? "#23232c" : "#f6f8fd",
//               color: textColor,
//             }}
//           >
//             <div className="text-center">
//               <div className="mb-6">
//                 <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
//                   <FaPlus className="text-purple-600 text-2xl" />
//                 </div>
//                 <h2 className="text-xl font-semibold mb-2" style={{ color: textColor }}>
//                   Add New User
//                 </h2>
//                 <p className="opacity-70" style={{ color: textColor }}>
//                   {canCreateClient &&
//                     "Create a new client user with organization access"}
//                   {canCreateManager &&
//                     "Create a new manager user for your organization"}
//                   {canCreateNormalUser &&
//                     "Create a new user with specific roles and permissions"}
//                 </p>
//               </div>
//               <button
//                 onClick={handleAdd}
//                 className="px-8 py-3 rounded-lg flex items-center gap-2 mx-auto font-semibold"
//                 style={{
//                   background: iconColor,
//                   color: "#23232c",
//                   fontWeight: 700,
//                   boxShadow: "0 2px 8px 0 rgba(100,70,10,0.09)",
//                 }}
//               >
//                 <FaPlus />
//                 {canCreateClient && "Create Client User"}
//                 {canCreateManager && "Create Manager User"}
//                 {canCreateNormalUser && "Create New User"}
//               </button>
//             </div>
//           </div>
//           {/* Add User Modal */}
//           {isAdd && (
//             <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
//               <div
//                 className="max-h-[90vh] w-full md:w-2/3 lg:w-1/2 rounded-lg shadow-2xl p-6 flex flex-col overflow-y-auto"
//                 style={{
//                   background: cardColor,
//                   border: 1.5px solid ${borderColor},
//                   color: textColor,
//                 }}
//               >
//                 <div className="flex items-center justify-between mb-6">
//                   <h1 className="text-xl font-semibold" style={{ color: textColor }}>
//                     {canCreateClient && "Add New Client User"}
//                     {canCreateManager && "Add New Manager User"}
//                     {canCreateNormalUser && "Add New User"}
//                   </h1>
//                   <button
//                     className="hover:scale-110 transition"
//                     onClick={resetForm}
//                   >
//                     <MdOutlineCancel size={24} style={{ color: textColor }} />
//                   </button>
//                 </div>
//                 {(orgInfoLoading || projectsLoading) && (
//                   <div className="text-center py-4">
//                     <span style={{ color: iconColor }}>
//                       {orgInfoLoading
//                         ? "Loading organizations..."
//                         : "Loading projects..."}
//                     </span>
//                   </div>
//                 )}
//                 <div className="overflow-y-auto max-h-[70vh]">
//                           <form className="space-y-4" onSubmit={handleCreate}>
//                     <div className="grid grid-cols-3 gap-3 items-center">
//                       <label
//                         className={text-sm font-medium text-end style={{ color: textColor }}}
//                       >
//                         Username<span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="text"
//                         className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500" 
//                         style={{
//     background: cardColor,
//     border: 1px solid ${borderColor},
//     color: textColor,
//   }}
  
//                         value={userDataForm.username}
//                         placeholder="Enter Username"
//                         onChange={(e) =>
//                           setUserDataForm((prev) => ({
//                             ...prev,
//                             username: e.target.value,
//                           }))
//                         }
//                         required
//                       />
//                     </div>

//                     {canCreateManager && (
//                       <>
//                         <div className="grid grid-cols-3 gap-3 items-center">
//                           <label
//                             className={text-sm font-medium text-end style={{ color: textColor }}}
//                           >
//                             Organization<span className="text-red-500">*</span>
//                           </label>
//                           <select
//                             className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500" 
//                              style={{
//     background: cardColor,
//     border: 1px solid ${borderColor},
//     color: textColor,
//   }}
//                             value={selectedOrganization}
//                             onChange={handleOrganizationChange}
//                             required
//                           >
//                             <option value="">Select Organization</option>
//                             {orgInfo.organizations?.map((org) => (
//                               <option key={org.id} value={org.id}>
//                                 {org.organization_name}
//                               </option>
//                             ))}
//                           </select>
//                         </div>
//                         {selectedOrganization &&
//                           availableCompanies.length > 0 && (
//                             <div className="grid grid-cols-3 gap-3 items-center">
//                               <label
//                                 className={text-sm font-medium text-end style={{ color: textColor }}}
//                               >
//                                 Company
//                               </label>
//                               <select
//                                 className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
//                                  style={{
//     background: cardColor,
//     border: 1px solid ${borderColor},
//     color: textColor,
//   }}
//                                 value={selectedCompany}
//                                 onChange={handleCompanyChange}
//                               >
//                                 <option value="">
//                                   Select Company (Optional)
//                                 </option>
//                                 {availableCompanies.map((company) => (
//                                   <option key={company.id} value={company.id}>
//                                     {company.name}
//                                   </option>
//                                 ))}
//                               </select>
//                             </div>
//                           )}
//                         {selectedCompany && availableEntities.length > 0 && (
//                           <div className="grid grid-cols-3 gap-3 items-center">
//                             <label
//                               className={text-sm font-medium text-end style={{ color: textColor }}}
//                             >
//                               Entity
//                             </label>
//                             <select
//                               className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500" 
// style={{
//     background: cardColor,
//     border: 1px solid ${borderColor},
//     color: textColor,
//   }}                              value={userDataForm.entity_id}
//                               onChange={handleEntityChange}
//                             >
//                               <option value="">Select Entity (Optional)</option>
//                               {availableEntities.map((entity) => (
//                                 <option key={entity.id} value={entity.id}>
//                                   {entity.name}
//                                 </option>
//                               ))}
//                             </select>
//                           </div>
//                         )}
//                         {availableProjects.length > 0 && (
//                           <div className="grid grid-cols-3 gap-3 items-center">
//                             <label
//                               className={text-sm font-medium text-end style={{ color: textColor }}}
//                             >
//                               Project
//                             </label>
//                             <select
//                               className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500" 
//  style={{
//     background: cardColor,
//     border: 1px solid ${borderColor},
//     color: textColor,
//   }}                              value={selectedProject}
//                               onChange={handleProjectChange}
//                               disabled={projectsLoading}
//                             >
//                               <option value="">
//                                 {projectsLoading
//                                   ? "Loading projects..."
//                                   : "Select Project (Optional)"}
//                               </option>
//                               {availableProjects.map((project, index) => (
//                                 <option
//                                   key={project.id || index}
//                                   value={project.id}
//                                 >
//                                   {project.name || Project ${index + 1}}
//                                 </option>
//                               ))}
//                             </select>
//                           </div>
//                         )}
//                         {selectedProject && availableBuildings.length > 0 && (
//                           <div className="grid grid-cols-3 gap-3 items-center">
//                             <label
//                               className={text-sm font-medium text-end style={{ color: textColor }}}
//                             >
//                               Building
//                             </label>
//                             <select
//                               className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
//  style={{
//     background: cardColor,
//     border: 1px solid ${borderColor},
//     color: textColor,
//   }}                              value={selectedBuilding}
//                               onChange={handleBuildingChange}
//                             >
//                               <option value="">
//                                 Select Building (Optional)
//                               </option>
//                               {availableBuildings.map((building) => (
//                                 <option key={building.id} value={building.id}>
//                                   {building.name}
//                                 </option>
//                               ))}
//                             </select>
//                           </div>
//                         )}
//                         {selectedBuilding && availableZones.length > 0 && (
//                           <div className="grid grid-cols-3 gap-3 items-center">
//                             <label
//                               className={text-sm font-medium text-end style={{ color: textColor }}}
//                             >
//                               Zone
//                             </label>
//                             <select
//                               className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500" 
//  style={{
//     background: cardColor,
//     border: 1px solid ${borderColor},
//     color: textColor,
//   }}                              value={userDataForm.zone_id}
//                               onChange={handleZoneChange}
//                             >
//                               <option value="">Select Zone (Optional)</option>
//                               {availableZones.map((zone) => (
//                                 <option key={zone.id} value={zone.id}>
//                                   {zone.name}
//                                 </option>
//                               ))}
//                             </select>
//                           </div>
//                         )}
//                       </>
//                     )}

//                     {canCreateNormalUser && (
//                       <div className="grid grid-cols-3 gap-3 items-center">
//                         <label
//                           className={text-sm font-medium text-end style={{ color: textColor }}}
//                         >
//                           Role<span className="text-red-500">*</span>
//                         </label>
//                         <select
//                           className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
//  style={{
//     background: cardColor,
//     border: 1px solid ${borderColor},
//     color: textColor,
//   }}                          value={userDataForm.role}
//                           onChange={(e) =>
//                             setUserDataForm((prev) => ({
//                               ...prev,
//                               role: e.target.value,
//                             }))
//                           }
//                           required
//                         >
//                           <option value="">Select Role</option>
//                           {getRoleOptions().map((option) => (
//                             <option key={option.value} value={option.value}>
//                               {option.label}
//                             </option>
//                           ))}
//                         </select>
//                       </div>
//                     )}
//                     {canCreateNormalUser && availableProjects.length > 0 && (
//                       <div className="grid grid-cols-3 gap-3 items-center">
//                         <label
//                           className={text-sm font-medium text-end style={{ color: textColor }}}
//                         >
//                           Project
//                         </label>
//                         <select
//                           className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500" 
//  style={{
//     background: cardColor,
//     border: 1px solid ${borderColor},
//     color: textColor,
//   }}                          value={selectedProject}
//                           onChange={handleProjectChange}
//                           disabled={projectsLoading}
//                         >
//                           <option value="">
//                             {projectsLoading
//                               ? "Loading projects..."
//                               : "Select Project (Optional)"}
//                           </option>
//                           {availableProjects.map((project, index) => (
//                             <option
//                               key={project.id || index}
//                               value={project.id}
//                             >
//                               {project.name || Project ${index + 1}}
//                             </option>
//                           ))}
//                         </select>
//                       </div>
//                     )}
//                     {/* Category Selection for normal users */}
//                     {canCreateNormalUser && selectedProject && (
//                       <>
//                         <div className="grid grid-cols-3 gap-3 items-center">
//                           <label
//                             className={text-sm font-medium text-end style={{ color: textColor }}}
//                           >
//                             Category<span className="text-red-500">*</span>
//                           </label>
//                           <select
//                             className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500" 
//  style={{
//     background: cardColor,
//     border: 1px solid ${borderColor},
//     color: textColor,
//   }}                            value={selectedCategory}
//                             onChange={handleCategoryChange}
//                             disabled={
//                               categoryLoading || categoryTree.length === 0
//                             }
//                             required
//                           >
//                             <option value="">
//                               {categoryLoading
//                                 ? "Loading categories..."
//                                 : categoryTree.length === 0
//                                 ? "No categories available"
//                                 : "Select Category"}
//                             </option>
//                             {categoryTree.map((category) => (
//                               <option key={category.id} value={category.id}>
//                                 {category.name}
//                               </option>
//                             ))}
//                           </select>
//                         </div>
//                         {selectedCategory && availableLevel1.length > 0 && (
//                           <div className="grid grid-cols-3 gap-3 items-center">
//                             <label
//                               className={text-sm font-medium text-end style={{ color: textColor }}}
//                             >
//                               Level 1
//                             </label>
//                             <select
//                               className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
//  style={{
//     background: cardColor,
//     border: 1px solid ${borderColor},
//     color: textColor,
//   }}                              value={selectedLevel1}
//                               onChange={handleLevel1Change}
//                             >
//                               <option value="">
//                                 Select Level 1 (Optional)
//                               </option>
//                               {availableLevel1.map((item) => (
//                                 <option key={item.id} value={item.id}>
//                                   {item.name}
//                                 </option>
//                               ))}
//                             </select>
//                           </div>
//                         )}
//                         {selectedLevel1 && availableLevel2.length > 0 && (
//                           <div className="grid grid-cols-3 gap-3 items-center">
//                             <label
//                               className={text-sm font-medium text-end style={{ color: textColor }}}
//                             >
//                               Level 2
//                             </label>
//                             <select
//                               className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500" style={{
//   background: cardColor,
//   border: 1px solid ${borderColor},
//   color: textColor,
// }}
//                               value={selectedLevel2}
//                               onChange={handleLevel2Change}
//                             >
//                               <option value="">
//                                 Select Level 2 (Optional)
//                               </option>
//                               {availableLevel2.map((item) => (
//                                 <option key={item.id} value={item.id}>
//                                   {item.name}
//                                 </option>
//                               ))}
//                             </select>
//                           </div>
//                         )}
//                         {selectedLevel2 && availableLevel3.length > 0 && (
//                           <div className="grid grid-cols-3 gap-3 items-center">
//                             <label
//                               className={text-sm font-medium text-end style={{ color: textColor }}}
//                             >
//                               Level 3
//                             </label>
//                             <select
//                               className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500" style={{
//   background: cardColor,
//   border: 1px solid ${borderColor},
//   color: textColor,
// }}
//                               value={selectedLevel3}
//                               onChange={handleLevel3Change}
//                             >
//                               <option value="">
//                                 Select Level 3 (Optional)
//                               </option>
//                               {availableLevel3.map((item) => (
//                                 <option key={item.id} value={item.id}>
//                                   {item.name}
//                                 </option>
//                               ))}
//                             </select>
//                           </div>
//                         )}
//                         {selectedLevel3 && availableLevel4.length > 0 && (
//                           <div className="grid grid-cols-3 gap-3 items-center">
//                             <label
//                               className={text-sm font-medium text-end style={{ color: textColor }}}
//                             >
//                               Level 4
//                             </label>
//                             <select
//                               className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"style={{
//   background: cardColor,
//   border: 1px solid ${borderColor},
//   color: textColor,
// }}
//                               value={selectedLevel4}
//                               onChange={handleLevel4Change}
//                             >
//                               <option value="">
//                                 Select Level 4 (Optional)
//                               </option>
//                               {availableLevel4.map((item) => (
//                                 <option key={item.id} value={item.id}>
//                                   {item.name}
//                                 </option>
//                               ))}
//                             </select>
//                           </div>
//                         )}
//                         {selectedLevel4 && availableLevel5.length > 0 && (
//                           <div className="grid grid-cols-3 gap-3 items-center">
//                             <label
//                               className={text-sm font-medium text-end style={{ color: textColor }}}
//                             >
//                               Level 5
//                             </label>
//                             <select
//                               className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500" style={{
//   background: cardColor,
//   border: 1px solid ${borderColor},
//   color: textColor,
// }}
//                               value={selectedLevel5}
//                               onChange={handleLevel5Change}
//                             >
//                               <option value="">
//                                 Select Level 5 (Optional)
//                               </option>
//                               {availableLevel5.map((item) => (
//                                 <option key={item.id} value={item.id}>
//                                   {item.name}
//                                 </option>
//                               ))}
//                             </select>
//                           </div>
//                         )}
//                         {selectedLevel5 && availableLevel6.length > 0 && (
//                           <div className="grid grid-cols-3 gap-3 items-center">
//                             <label
//                               className={text-sm font-medium text-end style={{ color: textColor }}}
//                             >
//                               Level 6
//                             </label>
//                             <select
//                               className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500" style={{
//   background: cardColor,
//   border: 1px solid ${borderColor},
//   color: textColor,
// }}
//                               value={selectedLevel6}
//                               onChange={handleLevel6Change}
//                             >
//                               <option value="">
//                                 Select Level 6 (Optional)
//                               </option>
//                               {availableLevel6.map((item) => (
//                                 <option key={item.id} value={item.id}>
//                                   {item.name}
//                                 </option>
//                               ))}
//                             </select>
//                           </div>
//                         )}
//                         {selectedProject && availableBuildings.length > 0 && (
//                           <div className="grid grid-cols-3 gap-3 items-center">
//                             <label
//                               className={text-sm font-medium text-end style={{ color: textColor }}}
//                             >
//                               Building
//                             </label>
//                             <select
//                               className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500" style={{
//   background: cardColor,
//   border: 1px solid ${borderColor},
//   color: textColor,
// }}
//                               value={selectedBuilding}
//                               onChange={handleBuildingChange}
//                             >
//                               <option value="">
//                                 Select Building (Optional)
//                               </option>
//                               {availableBuildings.map((building) => (
//                                 <option key={building.id} value={building.id}>
//                                   {building.name}
//                                 </option>
//                               ))}
//                             </select>
//                           </div>
//                         )}
//                         {selectedBuilding && availableZones.length > 0 && (
//                           <div className="grid grid-cols-3 gap-3 items-center">
//                             <label
//                               className={text-sm font-medium text-end style={{ color: textColor }}}
//                             >
//                               Zone
//                             </label>
//                             <select
//                               className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 "style={{
//   background: cardColor,
//   border: 1px solid ${borderColor},
//   color: textColor,
// }}
//                               value={userDataForm.zone_id}
//                               onChange={handleZoneChange}
//                             >
//                               <option value="">Select Zone (Optional)</option>
//                               {availableZones.map((zone) => (
//                                 <option key={zone.id} value={zone.id}>
//                                   {zone.name}
//                                 </option>
//                               ))}
//                             </select>
//                           </div>
//                         )}
//                       </>
//                     )}
//                     <div className="grid grid-cols-3 gap-3 items-center">
//                       <label
//                         className={text-sm font-medium text-end style={{ color: textColor }}}
//                       >
//                         First Name<span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="text"
//                         className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"  style={{
//     background: cardColor,
//     border: 1px solid ${borderColor},
//     color: textColor,
//   }}
//                         value={userDataForm.first_name}
//                         placeholder="Enter First Name"
//                         onChange={(e) =>
//                           setUserDataForm((prev) => ({
//                             ...prev,
//                             first_name: e.target.value,
//                           }))
//                         }
//                         required
//                       />
//                     </div>
//                     <div className="grid grid-cols-3 gap-3 items-center">
//                       <label
//                         className={text-sm font-medium text-end style={{ color: textColor }}}
//                       >
//                         Last Name<span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="text"
//                         className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"  style={{
//     background: cardColor,
//     border: 1px solid ${borderColor},
//     color: textColor,
//   }}
//                         value={userDataForm.last_name}
//                         placeholder="Enter Last Name"
//                         onChange={(e) =>
//                           setUserDataForm((prev) => ({
//                             ...prev,
//                             last_name: e.target.value,
//                           }))
//                         }
//                         required
//                       />
//                     </div>
//                     <div className="grid grid-cols-3 gap-3 items-center">
//                       <label
//                         className={text-sm font-medium text-end style={{ color: textColor }}}
//                       >
//                         Email<span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="email"
//                         className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"  style={{
//     background: cardColor,
//     border: 1px solid ${borderColor},
//     color: textColor,
//   }}
//                         value={userDataForm.email}
//                         placeholder="Enter Email Address"
//                         onChange={(e) =>
//                           setUserDataForm((prev) => ({
//                             ...prev,
//                             email: e.target.value,
//                           }))
//                         }
//                         required
//                       />
//                     </div>
//                     <div className="grid grid-cols-3 gap-3 items-center">
//                       <label
//                         className={text-sm font-medium text-end style={{ color: textColor }}}
//                       >
//                         Mobile
//                       </label>
//                       <input
//                         type="tel"
//                         className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 " style={{
//     background: cardColor,
//     border: 1px solid ${borderColor},
//     color: textColor,
//   }}
//                         value={userDataForm.mobile}
//                         placeholder="Enter Mobile Number"
//                         onChange={(e) =>
//                           setUserDataForm((prev) => ({
//                             ...prev,
//                             mobile: e.target.value,
//                           }))
//                         }
//                       />
//                     </div>
//                     <div className="grid grid-cols-3 gap-3 items-center">
//                       <label
//                         className={text-sm font-medium text-end style={{ color: textColor }}}
//                       >
//                         Password<span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="password"
//                         className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
//                         style={{
//     background: cardColor,
//     border: 1px solid ${borderColor},
//     color: textColor,
//   }} 
  
//                         value={userDataForm.password}
//                         placeholder="Enter Password"
//                         onChange={(e) =>
//                           setUserDataForm((prev) => ({
//                             ...prev,
//                             password: e.target.value,
//                           }))
//                         }
//                         required
//                       />
//                     </div>
//                     {/* Submit Buttons */}
//                     <div className="flex gap-3 pt-4">
//                       <button
//                         type="button"
//                         className="flex-1 py-2 px-4 rounded"
//                         style={{
//   background: theme === "dark" ? "#23232c" : "#ececf0",   // or use your BG_OFFWHITE if you want
//   color: theme === "dark" ? "#fff" : "#222",
//   border: 1px solid ${borderColor},
// }}
//                         onClick={resetForm}
//                       >
//                         Cancel
//                       </button>
//                       <button
//                         type="submit"
//                         className={submitButtonClassName}
//                         disabled={
//                           !isFormValid() || orgInfoLoading || projectsLoading
//                         }
//                       >
//                         {orgInfoLoading || projectsLoading
//                           ? "Loading..."
//                           : canCreateClient
//                           ? "Create Client"
//                           : canCreateManager
//                           ? "Create Manager"
//                           : "Create User"}
//                       </button>
//                     </div>
//                   </form>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default User;/






import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { MdOutlineCancel } from "react-icons/md";
import SideBarSetup from "../../components/SideBarSetup";
import { showToast } from "../../utils/toast";
import { useTheme } from "../../ThemeContext";
import { useSidebar } from "../../components/SidebarContext";
import axios from "axios";
import {
  createUserDetails,
  allorgantioninfototalbyUser_id,
  getCategoryTreeByProject,
  getProjectsByOrganization,
  createUserAccessRole,
} from "../../api";
import { FaPlus } from "react-icons/fa";

const SIDEBAR_WIDTH = 125;

function User() {
  const { theme } = useTheme();
  const { sidebarOpen } = useSidebar();

  // THEME palette (your request)
  const ORANGE = "#ffbe63";
  const BG_OFFWHITE = "#fcfaf7";
  const bgColor = theme === "dark" ? "#191922" : BG_OFFWHITE;
  const cardColor = theme === "dark" ? "#23232c" : "#fff";
  const borderColor = ORANGE;
  const textColor = theme === "dark" ? "#fff" : "#222";
  const iconColor = ORANGE;

  // --- ALL LOGIC BELOW IS YOURS, unchanged except color classNames ---

  const renderCount = useRef(0);
  renderCount.current += 1;

  const userData = useMemo(() => {
    try {
      const userString = localStorage.getItem("USER_DATA");
      if (userString && userString !== "undefined") {
        const parsed = JSON.parse(userString);
        if (!parsed.roles) {
          try {
            const token = localStorage.getItem("ACCESS_TOKEN");
            if (token) {
              const payload = JSON.parse(atob(token.split(".")[1]));
              parsed.roles = payload.roles || [];
            }
          } catch (error) {
            parsed.roles = [];
          }
        }
        return parsed || {};
      }
    } catch {
      return {};
    }
    return {};
  }, []);

  const isSuperAdmin = !!userData?.superadmin;
  const isStaff = !!userData?.is_staff;
  const isClient = !isSuperAdmin && !isStaff && !!userData?.is_client;
  const is_manager =
    !isSuperAdmin && !isStaff && !isClient && !!userData?.is_manager;

  const canCreateClient = isStaff || isSuperAdmin;
  const canCreateManager = isClient;
  const canCreateNormalUser = is_manager;
  const [isSubmitting, setIsSubmitting] = useState(false);




//newly added
// New states for Manager dropdowns
  const [purposes, setPurposes] = useState([]);
  const [phases, setPhases] = useState([]);
  const [stages, setStages] = useState([]);

  const [allCat, setAllCat] = useState(false);

  const [selectedPurpose, setSelectedPurpose] = useState("");
  const [selectedPhase, setSelectedPhase] = useState("");
  // const [selectedStage, setSelectedStage] = useState("");
  const [selectedStages, setSelectedStages] = useState([]);






// Fetch purposes by project
const fetchPurposes = async (projectId) => {
  try {
    const res = await axios.get(
      `https://konstruct.world/projects/purpose/get-purpose-details-by-project-id/${projectId}/`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
        },
      }
    );
    setPurposes(res.data || []);
  } catch (err) {
    showToast("Failed to fetch purposes", "error");
    setPurposes([]);
  }
};

// Fetch phases by purpose
const fetchPhases = async (purposeId) => {
  try {
    const res = await axios.get(
      `https://konstruct.world/projects/phases/by-purpose/${purposeId}/`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
        },
      }
    );
    setPhases(res.data || []);
  } catch (err) {
    showToast("Failed to fetch phases", "error");
    setPhases([]);
  }
};

// Fetch stages by phase
const fetchStages = async (phaseId) => {
  try {
    const res = await axios.get(
      `https://konstruct.world/projects/stages/by_phase/${phaseId}/`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
        },
      }
    );
    setStages(res.data || []);
  } catch (err) {
    showToast("Failed to fetch stages", "error");
    setStages([]);
  }
};

// const handlePurposeChange = (e) => {
//   const purposeId = e.target.value;
//   setSelectedPurpose(purposeId);
//   setSelectedPhase("");
//   setSelectedStage("");
//   setPhases([]);
//   setStages([]);
//   if (purposeId) fetchPhases(purposeId);
// };
const handlePurposeChange = (e) => {
  const purposeId = e.target.value;
  setSelectedPurpose(purposeId);
  setSelectedPhase("");
  setSelectedStages([]);
  setPhases([]);
  setStages([]);
  if (purposeId) fetchPhases(purposeId);
};


// const handlePhaseChange = (e) => {
//   const phaseId = e.target.value;
//   setSelectedPhase(phaseId);
//   setSelectedStage("");
//   setStages([]);
//   if (phaseId) fetchStages(phaseId);
// };
const handlePhaseChange = (e) => {
  const phaseId = e.target.value;
  setSelectedPhase(phaseId);
  setSelectedStages([]);
  setStages([]);
  if (phaseId) fetchStages(phaseId);
};

// const handleStageChange = (e) => {
//   setSelectedStage(e.target.value);
// };
const handleStageChange = (e) => {
  const values = Array.from(e.target.selectedOptions, (opt) => opt.value);
  setSelectedStages(values);
};


// const handlePurposeChange = (e) => {
//   const purposeId = e.target.value;
//   setSelectedPurpose(purposeId);
//   setSelectedPhase("");
//   setSelectedStage("");
//   if (purposeId) fetchPhases(purposeId);
// };

// const handlePhaseChange = (e) => {
//   const phaseId = e.target.value;
//   setSelectedPhase(phaseId);
//   setSelectedStage("");
//   if (phaseId) fetchStages(phaseId);
// };

// const handleStageChange = (e) => {
//   setSelectedStage(e.target.value);
// };


  const userId = userData?.user_id;
  const org = useMemo(() => userData.org || "", [userData.org]);
  const userRole = useMemo(() => {
    if (userData.superadmin) return "ADMIN";
    else if (userData.is_staff) return "STAFF";
    else if (userData.roles && userData.roles.length > 0)
      return userData.roles[0];
    else if (userData.is_manager) return "Manager";
    else if (userData.is_client) return "Client";
    else return "User";
  }, [userData]);
  const creationCapability = useMemo(() => {
    if (canCreateClient) return "Can create client users";
    else if (canCreateManager) return "Can create manager users";
    else if (canCreateNormalUser) return "Can create normal users with roles";
    else return "No user creation permissions";
  }, [canCreateClient, canCreateManager, canCreateNormalUser]);

  const [orgInfo, setOrgInfo] = useState({});
  const [orgInfoLoading, setOrgInfoLoading] = useState(false);
  const [isAdd, setAdd] = useState(false);
  const [userDataForm, setUserDataForm] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    password: "",
    role: "",
    organization_id: "",
    company_id: "",
    entity_id: "",
    project_id: "",
    building_id: "",
    zone_id: "",
  });
  const isInitializer = (userDataForm.role || "").toUpperCase() === "INTIALIZER";
  
const ROLE = (userDataForm.role || "").toUpperCase();
const isSecurityGuard = ROLE === "SECURITY_GUARD";

  const [selectedOrganization, setSelectedOrganization] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [availableEntities, setAvailableEntities] = useState([]);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [availableBuildings, setAvailableBuildings] = useState([]);
  const [availableZones, setAvailableZones] = useState([]);
  const [orgManagerTypes, setOrgManagerTypes] = useState([]);
  const [showManagerDropdown, setShowManagerDropdown] = useState(false);
  const [selectedManagerType, setSelectedManagerType] = useState("");
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [categoryTree, setCategoryTree] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLevel1, setSelectedLevel1] = useState("");
  const [selectedLevel2, setSelectedLevel2] = useState("");
  const [selectedLevel3, setSelectedLevel3] = useState("");
  const [selectedLevel4, setSelectedLevel4] = useState("");
  const [selectedLevel5, setSelectedLevel5] = useState("");
  const [selectedLevel6, setSelectedLevel6] = useState("");
  const [availableLevel1, setAvailableLevel1] = useState([]);
  const [availableLevel2, setAvailableLevel2] = useState([]);
  const [availableLevel3, setAvailableLevel3] = useState([]);
  const [availableLevel4, setAvailableLevel4] = useState([]);
  const [availableLevel5, setAvailableLevel5] = useState([]);
  const [availableLevel6, setAvailableLevel6] = useState([]);
  const showCategoryUI = canCreateNormalUser && selectedProject && !isInitializer && !isSecurityGuard;


  const resetCategorySelections = useCallback(() => {
    setSelectedCategory("");
    setSelectedLevel1("");
    setSelectedLevel2("");
    setSelectedLevel3("");
    setSelectedLevel4("");
    setSelectedLevel5("");
    setSelectedLevel6("");
    setAvailableLevel1([]);
    setAvailableLevel2([]);
    setAvailableLevel3([]);
    setAvailableLevel4([]);
    setAvailableLevel5([]);
    setAvailableLevel6([]);
  }, []);

  const fetchCategoryTree = useCallback(
    async (projectId) => {
      if (!projectId) return;
      setCategoryLoading(true);
      try {
        const response = await getCategoryTreeByProject(projectId);
        setCategoryTree(response.data || []);
        resetCategorySelections();
      } catch (error) {
        setCategoryTree([]);
        resetCategorySelections();
        showToast("Failed to load categories for this project", "error");
      } finally {
        setCategoryLoading(false);
      }
    },
    [resetCategorySelections]
  );

  const fetchProjectsForManager = useCallback(async () => {
    if ((is_manager || canCreateManager) && org) {
      setProjectsLoading(true);
      try {
        const res = await getProjectsByOrganization(org);
        let projects = [];
        if (Array.isArray(res.data)) projects = res.data;
        else if (res.data && res.data.projects) projects = res.data.projects;
        setAvailableProjects(projects);
        if ((is_manager || canCreateManager) && projects.length > 0) {
          setShowManagerDropdown(true);
          setOrgManagerTypes(
            res.data.manager_types || ["Project Manager", "Site Manager"]
          );
        }
      } catch (err) {
        setShowManagerDropdown(false);
        setOrgManagerTypes([]);
        setAvailableProjects([]);
        showToast("Failed to fetch projects. Please try again later.", "error");
      } finally {
        setProjectsLoading(false);
      }
    }
  }, [is_manager, canCreateManager, org]);

  useEffect(() => {
    if (isAdd && (is_manager || canCreateManager) && org) {
      fetchProjectsForManager();
    }
  }, [isAdd, is_manager, canCreateManager, org, fetchProjectsForManager]);

  const getRoleOptions = useCallback(() => {
    if (canCreateClient) return [];
    else if (canCreateManager) return [];
    else if (canCreateNormalUser) {
      return [
        { value: "SUPERVISOR", label: "SUPERVISOR" },
        { value: "CHECKER", label: "CHECKER" },
        { value: "MAKER", label: "MAKER" },
        { value: "SECURITY_GUARD", label: "SECURITY GUARD" },
        
        { value: "Intializer", label: "INITIALIZER" },
      ];
    }
    return [];
  }, [canCreateClient, canCreateManager, canCreateNormalUser]);


  useEffect(() => {
  if (isSecurityGuard) {
    setAllCat(false);
    resetCategorySelections();
  }
}, [isSecurityGuard, resetCategorySelections]);

  const fetchOrgInfo = useCallback(async () => {
    if (!userId) {
      showToast("User ID not found", "error");
      return;
    }
    setOrgInfoLoading(true);
    try {
      const response = await axios.get(
        `https://konstruct.world/organizations/user-orgnizationn-info/${userId}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
          },
        }
      );
      setOrgInfo(response.data);
    } catch (error) {
      showToast("Failed to fetch organization info", "error");
    } finally {
      setOrgInfoLoading(false);
    }
  }, [userId]);

  const handleAdd = useCallback(() => {
    setAdd(true);
    fetchOrgInfo();
  }, [fetchOrgInfo]);

  const handleOrganizationChange = useCallback(
    async (e) => {
      const orgId = e.target.value;
      setSelectedOrganization(orgId);
      setSelectedCompany("");
      setSelectedProject("");
      setSelectedBuilding("");
      setUserDataForm((prev) => ({
        ...prev,
        organization_id: orgId,
        company_id: "",
        entity_id: "",
        project_id: "",
        building_id: "",
        zone_id: "",
      }));
      setAvailableCompanies([]);
      setAvailableEntities([]);
      setAvailableBuildings([]);
      setAvailableZones([]);
      if (orgId && orgInfo.companies) {
        const filteredCompanies = orgInfo.companies.filter(
          (company) => company.organization === parseInt(orgId)
        );
        setAvailableCompanies(filteredCompanies);
      }
      if (
        orgId &&
        (is_manager || canCreateManager) &&
        parseInt(orgId) !== parseInt(org)
      ) {
        setProjectsLoading(true);
        try {
          const res = await getProjectsByOrganization(orgId);
          let projects = [];
          if (Array.isArray(res.data)) projects = res.data;
          else if (res.data && res.data.projects) projects = res.data.projects;
          setAvailableProjects(projects);
        } catch (err) {
          setAvailableProjects([]);
          showToast(
            "Failed to fetch projects for selected organization",
            "error"
          );
        } finally {
          setProjectsLoading(false);
        }
      }
    },
    [orgInfo.companies, is_manager, canCreateManager, org]
  );

  const handleCompanyChange = useCallback(
    (e) => {
      const companyId = e.target.value;
      setSelectedCompany(companyId);
      setUserDataForm((prev) => ({
        ...prev,
        company_id: companyId,
        entity_id: "",
      }));
      if (companyId && orgInfo.entities) {
        const filteredEntities = orgInfo.entities.filter(
          (entity) => entity.company === parseInt(companyId)
        );
        setAvailableEntities(filteredEntities);
      } else {
        setAvailableEntities([]);
      }
    },
    [orgInfo.entities]
  );

  const handleEntityChange = useCallback((e) => {
    const entityId = e.target.value;
    setUserDataForm((prev) => ({
      ...prev,
      entity_id: entityId,
    }));
  }, []);
const handleProjectChange = useCallback(
  (e) => {
    const projectId = e.target.value;
    setSelectedProject(projectId);
    setSelectedBuilding("");
    setUserDataForm((prev) => ({
      ...prev,
      project_id: projectId,
      building_id: "",
      zone_id: "",
    }));

    // reset downstream states
    setPurposes([]);
    setPhases([]);
    setStages([]);
    setSelectedPurpose("");
    setSelectedPhase("");
    // setSelectedStage("");
    setSelectedStages([]);

    setAvailableBuildings([]);
    setAvailableZones([]);
    resetCategorySelections();
    setAllCat(false);


    if (projectId) {
      fetchCategoryTree(projectId); // keep your old category call
      fetchPurposes(projectId);     // 🔽 NEW call for purposes
    } else {
      setCategoryTree([]);
    }

    if (projectId) {
      const selectedProjectObj = availableProjects.find(
        (project) => project.id === parseInt(projectId)
      );
      if (selectedProjectObj && selectedProjectObj.buildings) {
        setAvailableBuildings(selectedProjectObj.buildings);
      }
    }
  },
  [availableProjects, resetCategorySelections, fetchCategoryTree]
);
  // const handleProjectChange = useCallback(
  //   (e) => {
  //     const projectId = e.target.value;
  //     setSelectedProject(projectId);
  //     setSelectedBuilding("");
  //     setUserDataForm((prev) => ({
  //       ...prev,
  //       project_id: projectId,
  //       building_id: "",
  //       zone_id: "",
  //     }));
  //     setAvailableBuildings([]);
  //     setAvailableZones([]);
  //     resetCategorySelections();
  //     if (projectId) fetchCategoryTree(projectId);
  //     else setCategoryTree([]);
  //     if (projectId) {
  //       const selectedProjectObj = availableProjects.find(
  //         (project) => project.id === parseInt(projectId)
  //       );
  //       if (selectedProjectObj && selectedProjectObj.buildings) {
  //         setAvailableBuildings(selectedProjectObj.buildings);
  //       }
  //     }
  //   },
  //   [availableProjects, resetCategorySelections, fetchCategoryTree]
  // );

  const handleBuildingChange = useCallback(
    (e) => {
      const buildingId = e.target.value;
      setSelectedBuilding(buildingId);
      setUserDataForm((prev) => ({
        ...prev,
        building_id: buildingId,
        zone_id: "",
      }));
      setAvailableZones([]);
      if (buildingId) {
        const selectedBuildingObj = availableBuildings.find(
          (building) => building.id === parseInt(buildingId)
        );
        if (selectedBuildingObj && selectedBuildingObj.zones) {
          setAvailableZones(selectedBuildingObj.zones);
        }
      }
    },
    [availableBuildings]
  );

  const handleZoneChange = useCallback((e) => {
    const zoneId = e.target.value;
    setUserDataForm((prev) => ({
      ...prev,
      zone_id: zoneId,
    }));
  }, []);

  // Category selection handlers
  const handleCategoryChange = useCallback(
    (e) => {
      const categoryId = e.target.value;
      setSelectedCategory(categoryId);
      setSelectedLevel1("");
      setSelectedLevel2("");
      setSelectedLevel3("");
      setSelectedLevel4("");
      setSelectedLevel5("");
      setSelectedLevel6("");
      setAvailableLevel2([]);
      setAvailableLevel3([]);
      setAvailableLevel4([]);
      setAvailableLevel5([]);
      setAvailableLevel6([]);
      if (categoryId) {
        const selectedCategoryObj = categoryTree.find(
          (cat) => cat.id === parseInt(categoryId)
        );
        if (selectedCategoryObj && selectedCategoryObj.level1) {
          setAvailableLevel1(selectedCategoryObj.level1);
        } else {
          setAvailableLevel1([]);
        }
      } else {
        setAvailableLevel1([]);
      }
    },
    [categoryTree]
  );
  const handleLevel1Change = useCallback(
    (e) => {
      const level1Id = e.target.value;
      setSelectedLevel1(level1Id);
      setSelectedLevel2("");
      setSelectedLevel3("");
      setSelectedLevel4("");
      setSelectedLevel5("");
      setSelectedLevel6("");
      setAvailableLevel3([]);
      setAvailableLevel4([]);
      setAvailableLevel5([]);
      setAvailableLevel6([]);
      if (level1Id) {
        const selectedLevel1Obj = availableLevel1.find(
          (item) => item.id === parseInt(level1Id)
        );
        if (selectedLevel1Obj && selectedLevel1Obj.level2) {
          setAvailableLevel2(selectedLevel1Obj.level2);
        } else {
          setAvailableLevel2([]);
        }
      } else {
        setAvailableLevel2([]);
      }
    },
    [availableLevel1]
  );
  const handleLevel2Change = useCallback(
    (e) => {
      const level2Id = e.target.value;
      setSelectedLevel2(level2Id);
      setSelectedLevel3("");
      setSelectedLevel4("");
      setSelectedLevel5("");
      setSelectedLevel6("");
      setAvailableLevel4([]);
      setAvailableLevel5([]);
      setAvailableLevel6([]);
      if (level2Id) {
        const selectedLevel2Obj = availableLevel2.find(
          (item) => item.id === parseInt(level2Id)
        );
        if (selectedLevel2Obj && selectedLevel2Obj.level3) {
          setAvailableLevel3(selectedLevel2Obj.level3);
        } else {
          setAvailableLevel3([]);
        }
      } else {
        setAvailableLevel3([]);
      }
    },
    [availableLevel2]
  );
  const handleLevel3Change = useCallback(
    (e) => {
      const level3Id = e.target.value;
      setSelectedLevel3(level3Id);
      setSelectedLevel4("");
      setSelectedLevel5("");
      setSelectedLevel6("");
      setAvailableLevel5([]);
      setAvailableLevel6([]);
      if (level3Id) {
        const selectedLevel3Obj = availableLevel3.find(
          (item) => item.id === parseInt(level3Id)
        );
        if (selectedLevel3Obj && selectedLevel3Obj.level4) {
          setAvailableLevel4(selectedLevel3Obj.level4);
        } else {
          setAvailableLevel4([]);
        }
      } else {
        setAvailableLevel4([]);
      }
    },
    [availableLevel3]
  );
  const handleLevel4Change = useCallback(
    (e) => {
      const level4Id = e.target.value;
      setSelectedLevel4(level4Id);
      setSelectedLevel5("");
      setSelectedLevel6("");
      setAvailableLevel6([]);
      if (level4Id) {
        const selectedLevel4Obj = availableLevel4.find(
          (item) => item.id === parseInt(level4Id)
        );
        if (selectedLevel4Obj && selectedLevel4Obj.level5) {
          setAvailableLevel5(selectedLevel4Obj.level5);
        } else {
          setAvailableLevel5([]);
        }
      } else {
        setAvailableLevel5([]);
      }
    },
    [availableLevel4]
  );
  const handleLevel5Change = useCallback(
    (e) => {
      const level5Id = e.target.value;
      setSelectedLevel5(level5Id);
      setSelectedLevel6("");
      if (level5Id) {
        const selectedLevel5Obj = availableLevel5.find(
          (item) => item.id === parseInt(level5Id)
        );
        if (selectedLevel5Obj && selectedLevel5Obj.level6) {
          setAvailableLevel6(selectedLevel5Obj.level6);
        } else {
          setAvailableLevel6([]);
        }
      } else {
        setAvailableLevel6([]);
      }
    },
    [availableLevel5]
  );
  const handleLevel6Change = useCallback((e) => {
    const level6Id = e.target.value;
    setSelectedLevel6(level6Id);
  }, []);
  
 const isFormValid = useCallback(() => {
  const basicFields =
    userDataForm.username &&
    userDataForm.first_name &&
    userDataForm.last_name &&
    userDataForm.email &&
    userDataForm.password;

  if (canCreateClient) return basicFields;
  if (canCreateManager) return basicFields && userDataForm.organization_id;
  if (canCreateNormalUser) {
    // role must be chosen; category required unless "Intializer" OR "select all"
    const hasRole = !!userDataForm.role;
    const categoryOk = isInitializer|| isSecurityGuard || allCat || !!selectedCategory;
    return basicFields && hasRole && categoryOk;
  }

  return false;
}, [
  userDataForm,
  selectedCategory,
  allCat,
  isInitializer,
  canCreateClient,
  canCreateManager,
  canCreateNormalUser,
]);

  
  const resetForm = useCallback(() => {
    setUserDataForm({
      username: "",
      first_name: "",
      last_name: "",
      email: "",
      mobile: "",
      password: "",
      role: "",
      organization_id: "",
      company_id: "",
      entity_id: "",
      project_id: "",
      building_id: "",
      zone_id: "",
    });
    setSelectedOrganization("");
    setSelectedCompany("");
    setSelectedProject("");
    setSelectedBuilding("");
    setAvailableCompanies([]);
    setAvailableEntities([]);
    setAvailableProjects([]);
    setAvailableBuildings([]);
    setAvailableZones([]);
    setOrgManagerTypes([]);
    setShowManagerDropdown(false);
    setSelectedManagerType("");
    setAdd(false);
    setOrgInfo({});
    setProjectsLoading(false);
    setCategoryTree([]);
    setCategoryLoading(false);
    resetCategorySelections();
    setAllCat(false);

  }, [resetCategorySelections]);
  const handleCreate = useCallback(
  async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double submit

    setIsSubmitting(true);

    if (!isFormValid()) {
      showToast("Please fill in all required fields", "error");
      setIsSubmitting(false);
      return;
    }

    // For client users - simple creation with basic info only
    if (canCreateClient) {
      const clientPayload = {
        user: {
          username: userDataForm.username,
          first_name: userDataForm.first_name,
          last_name: userDataForm.last_name,
          email: userDataForm.email,
          phone_number: userDataForm.mobile || "",
          password: userDataForm.password,
          is_client: true,
          is_manager: false,
          has_access: true,
          org: null,
          company: null,
          entity: null,
        },
        access: {
  project_id: userDataForm.project_id ? parseInt(userDataForm.project_id) : null,
  building_id: userDataForm.building_id ? parseInt(userDataForm.building_id) : null,
  zone_id: userDataForm.zone_id ? parseInt(userDataForm.zone_id) : null,
  flat_id: null,
  active: true,

  // Only meaningful for normal users (not manager) and not Intializer
  all_cat: canCreateNormalUser && !isInitializer ? !!allCat : false,

  category:       canCreateNormalUser && !isInitializer && !allCat ? (selectedCategory ? parseInt(selectedCategory) : null) : null,
  CategoryLevel1: canCreateNormalUser && !isInitializer && !allCat ? (selectedLevel1 ? parseInt(selectedLevel1) : null) : null,
  CategoryLevel2: canCreateNormalUser && !isInitializer && !allCat ? (selectedLevel2 ? parseInt(selectedLevel2) : null) : null,
  CategoryLevel3: canCreateNormalUser && !isInitializer && !allCat ? (selectedLevel3 ? parseInt(selectedLevel3) : null) : null,
  CategoryLevel4: canCreateNormalUser && !isInitializer && !allCat ? (selectedLevel4 ? parseInt(selectedLevel4) : null) : null,
  CategoryLevel5: canCreateNormalUser && !isInitializer && !allCat ? (selectedLevel5 ? parseInt(selectedLevel5) : null) : null,
  CategoryLevel6: canCreateNormalUser && !isInitializer && !allCat ? (selectedLevel6 ? parseInt(selectedLevel6) : null) : null,

  purpose_id: selectedPurpose ? parseInt(selectedPurpose) : null,
  phase_id: selectedPhase ? parseInt(selectedPhase) : null,
  // stage_id: selectedStage ? parseInt(selectedStage) : null,
  stage_ids:
  selectedStages && selectedStages.length > 0
    ? selectedStages.map((id) => parseInt(id))
    : [],

},

        roles: [],
      };

      try {
        const response = await createUserAccessRole(clientPayload);
        if (response.status === 201) {
          showToast("Client user created successfully", "success");
          resetForm();
        } else {
          showToast("Failed to create client user", "error");
        }
      } catch (error) {
        if (error.response && error.response.data) {
          const errorData = error.response.data;
          if (errorData.user && errorData.user.username) {
            showToast("Username already exists.", "error");
            setIsSubmitting(false);
            return;
          }
          if (errorData.user && errorData.user.email) {
            showToast("Email already exists.", "error");
            setIsSubmitting(false);
            return;
          }
        }
        showToast("Error creating client user. Please try again.", "error");
      }
      setIsSubmitting(false);
      return;
    }


    // For manager and normal users
    const completePayload = {
      user: {
        username: userDataForm.username,
        first_name: userDataForm.first_name,
        last_name: userDataForm.last_name,
        email: userDataForm.email,
        phone_number: userDataForm.mobile || "",
        password: userDataForm.password,
        org: userDataForm.organization_id
          ? parseInt(userDataForm.organization_id)
          : org
          ? parseInt(org)
          : null,
        company: userDataForm.company_id
          ? parseInt(userDataForm.company_id)
          : null,
        entity: userDataForm.entity_id
          ? parseInt(userDataForm.entity_id)
          : null,
        is_manager: canCreateManager ? true : false,
        is_client: false,
        has_access: true,
      },
      access: {
        project_id: userDataForm.project_id
          ? parseInt(userDataForm.project_id)
          : null,
        building_id: userDataForm.building_id
          ? parseInt(userDataForm.building_id)
          : null,
        zone_id: userDataForm.zone_id
          ? parseInt(userDataForm.zone_id)
          : null,
        flat_id: null,
        active: true,
        all_cat: allCat === true,

    category: allCat ? null : (selectedCategory ? parseInt(selectedCategory) : null),
    CategoryLevel1: allCat ? null : (selectedLevel1 ? parseInt(selectedLevel1) : null),
    CategoryLevel2: allCat ? null : (selectedLevel2 ? parseInt(selectedLevel2) : null),
    CategoryLevel3: allCat ? null : (selectedLevel3 ? parseInt(selectedLevel3) : null),
    CategoryLevel4: allCat ? null : (selectedLevel4 ? parseInt(selectedLevel4) : null),
    CategoryLevel5: allCat ? null : (selectedLevel5 ? parseInt(selectedLevel5) : null),
    CategoryLevel6: allCat ? null : (selectedLevel6 ? parseInt(selectedLevel6) : null),

        purpose_id: selectedPurpose ? parseInt(selectedPurpose) : null,
phase_id: selectedPhase ? parseInt(selectedPhase) : null,
stage_id: selectedStages.length ? parseInt(selectedStages[0]) : null,
stage_ids: selectedStages.map((id) => parseInt(id)),
      },
      roles: [],
    };

    if (canCreateManager) {
      // No additional roles logic
    } else if (canCreateNormalUser) {
      if (userDataForm.role) {
        completePayload.roles.push({ role: userDataForm.role });
      }
    }

    try {
      const response = await createUserAccessRole(completePayload);
      if (response.status === 201) {
        let successMessage = "User created successfully";
        if (canCreateManager) {
          successMessage = "Manager user created successfully";
        } else if (canCreateNormalUser) {
          successMessage = "User created successfully with role assigned";
        }
        showToast(successMessage, "success");
        resetForm();
      } else {
        showToast("Failed to create user", "error");
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (errorData.user && errorData.user.username) {
          showToast("Username already exists.", "error");
          setIsSubmitting(false);
          return;
        }
        if (errorData.user && errorData.user.email) {
          showToast("Email already exists.", "error");
          setIsSubmitting(false);
          return;
        }
      }
      showToast("Error creating user. Please try again.", "error");
    }
    setIsSubmitting(false);
  },
  [
    userDataForm,
    selectedCategory,
    selectedLevel1,
    selectedLevel2,
    selectedLevel3,
    selectedLevel4,
    selectedLevel5,
    selectedLevel6,
    canCreateClient,
    canCreateManager,
    canCreateNormalUser,
    org,
    isFormValid,
    isSubmitting,
    resetForm,
    showToast,
  ]
);



  const submitButtonClassName = useMemo(() => {
    const baseClasses = "flex-1 py-2 px-4 rounded transition duration-200";
    const validClasses = "bg-[#7c3aed] text-white hover:bg-[#713ae3]";
    const invalidClasses = "bg-gray-300 text-gray-500 cursor-not-allowed";
    const isValid = isFormValid();
    return `${baseClasses} ${isValid ? validClasses : invalidClasses}`;
  }, [isFormValid]);

  // =========== RESTRICTED CASE (NO CREATE PERMS) ===========
  if (!canCreateClient && !canCreateManager && !canCreateNormalUser) {
    return (
      <div className="flex min-h-screen" style={{ background: bgColor }}>
        <SideBarSetup />
        <div
          className="my-5 w-[85%] mt-5 ml-[16%] mr-[1%]"
          style={{
            marginLeft: sidebarOpen ? SIDEBAR_WIDTH : 0,
            transition: "margin-left 0.35s cubic-bezier(.6,-0.17,.22,1.08)",
          }}
        >
          <div
            className="px-6 py-5 max-w-7xl mx-auto rounded"
            style={{
              background: cardColor,
              border: `1.5px solid ${borderColor}`,
              color: textColor,
              boxShadow:
                theme === "dark"
                  ? "0 4px 24px 0 rgba(60,30,10,0.15)"
                  : "0 2px 8px 0 rgba(100,70,10,0.09)",
            }}
          >
            {/* ===== HEADER ===== */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold" style={{ color: textColor }}>
                  USER MANAGEMENT
                </h1>
                <p className="opacity-80 mt-2" style={{ color: textColor }}>
                  User creation and management
                </p>
                <div className="mt-3">
                  <span
                    className="inline-block px-3 py-1 rounded-full text-sm"
                    style={{
                      background: "#fca5a5",
                      color: "#b91c1c",
                      fontWeight: 600,
                    }}
                  >
                    {userRole} - No user creation permissions
                  </span>
                </div>
              </div>
            </div>
            <div
              className="rounded-lg p-8"
              style={{
                background: theme === "dark" ? "#23232c" : "#f6f8fd",
                color: textColor,
              }}
            >
              <div className="text-center">
                <div className="mb-6">
                  <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <MdOutlineCancel className="text-red-600 text-2xl" />
                  </div>
                  <h2
                    className="text-xl font-semibold mb-2"
                    style={{ color: textColor }}
                  >
                    Access Restricted
                  </h2>
                  <p className="opacity-70" style={{ color: textColor }}>
                    You do not have permissions to create users. Please contact
                    your administrator.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========== MAIN RENDER (CAN CREATE USERS) ===========
  return (
    <div className="flex min-h-screen" style={{ background: bgColor }}>
      <SideBarSetup />
      <div
        className="flex-1 flex justify-center items-start"
        style={{
          minHeight: "100vh",
          transition: "margin-left 0.35s cubic-bezier(.6,-0.17,.22,1.08)",
        }}
      >
        <div
          className="my-10 w-full max-w-5xl px-6 py-5 rounded"
          style={{
            background: cardColor,
            border: `1.5px solid ${borderColor}`,
            color: textColor,
            boxShadow:
              theme === "dark"
                ? "0 4px 24px 0 rgba(60,30,10,0.15)"
                : "0 2px 8px 0 rgba(100,70,10,0.09)",
          }}
        >
          {/* ===== HEADER ===== */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: textColor }}>
                USER MANAGEMENT
              </h1>
              <p className="opacity-80 mt-2" style={{ color: textColor }}>
                Create and manage users for your organization
              </p>
              <div className="mb-3">
                <span
                  className="inline-block px-3 py-1 rounded-full text-sm mr-2"
                  style={{
                    background: "#ffe9ba",
                    color: "#b45309",
                    fontWeight: 600,
                  }}
                >
                  {userRole} Access (Render #{renderCount.current})
                </span>
                <span
                  className="inline-block px-3 py-1 rounded-full text-sm"
                  style={{
                    background: "#c7d2fe",
                    color: "#1e293b",
                    fontWeight: 600,
                  }}
                >
                  {creationCapability}
                </span>
              </div>
            </div>
          </div>
          {/* ===== FORM AREA ===== */}
          <div
            className="rounded-lg p-8"
            style={{
              background: theme === "dark" ? "#23232c" : "#f6f8fd",
              color: textColor,
            }}
          >
            <div className="text-center">
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <FaPlus className="text-purple-600 text-2xl" />
                </div>
                <h2
                  className="text-xl font-semibold mb-2"
                  style={{ color: textColor }}
                >
                  Add New User
                </h2>
                <p className="opacity-70" style={{ color: textColor }}>
                  {canCreateClient &&
                    "Create a new client user with organization access"}
                  {canCreateManager &&
                    "Create a new manager user for your organization"}
                  {canCreateNormalUser &&
                    "Create a new user with specific roles and permissions"}
                </p>
              </div>
              <button
                onClick={handleAdd}
                className="px-8 py-3 rounded-lg flex items-center gap-2 mx-auto font-semibold"
                style={{
                  background: iconColor,
                  color: "#23232c",
                  fontWeight: 700,
                  boxShadow: "0 2px 8px 0 rgba(100,70,10,0.09)",
                }}
              >
                <FaPlus />
                {canCreateClient && "Create Client User"}
                {canCreateManager && "Create Manager User"}
                {canCreateNormalUser && "Create New User"}
              </button>
            </div>
          </div>
          {/* Add User Modal */}
          {isAdd && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
              <div
                className="max-h-[90vh] w-full md:w-2/3 lg:w-1/2 rounded-lg shadow-2xl p-6 flex flex-col overflow-y-auto"
                style={{
                  background: cardColor,
                  border: `1.5px solid ${borderColor}`,
                  color: textColor,
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h1
                    className="text-xl font-semibold"
                    style={{ color: textColor }}
                  >
                    {canCreateClient && "Add New Client User"}
                    {canCreateManager && "Add New Manager User"}
                    {canCreateNormalUser && "Add New User"}
                  </h1>
                  <button
                    className="hover:scale-110 transition"
                    onClick={resetForm}
                  >
                    <MdOutlineCancel size={24} style={{ color: textColor }} />
                  </button>
                </div>
                {(orgInfoLoading || projectsLoading) && (
                  <div className="text-center py-4">
                    <span style={{ color: iconColor }}>
                      {orgInfoLoading
                        ? "Loading organizations..."
                        : "Loading projects..."}
                    </span>
                  </div>
                )}
                <div className="overflow-y-auto max-h-[70vh]">
                  <form className="space-y-4" onSubmit={handleCreate}>
                    <div className="grid grid-cols-3 gap-3 items-center">
                      <label
                        className={`text-sm font-medium text-end style={{ color: textColor }}`}
                      >
                        Username<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                        style={{
                          background: cardColor,
                          border: `1px solid ${borderColor}`,
                          color: textColor,
                        }}
                        value={userDataForm.username}
                        placeholder="Enter Username"
                        onChange={(e) =>
                          setUserDataForm((prev) => ({
                            ...prev,
                            username: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>

                    {canCreateManager && (
                      <>
                        <div className="grid grid-cols-3 gap-3 items-center">
                          <label
                            className={`text-sm font-medium text-end style={{ color: textColor }}`}
                          >
                            Organization<span className="text-red-500">*</span>
                          </label>
                          <select
                            className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                            style={{
                              background: cardColor,
                              border: `1px solid ${borderColor}`,
                              color: textColor,
                            }}
                            value={selectedOrganization}
                            onChange={handleOrganizationChange}
                            required
                          >
                            <option value="">Select Organization</option>
                            {orgInfo.organizations?.map((org) => (
                              <option key={org.id} value={org.id}>
                                {org.organization_name}
                              </option>
                            ))}
                          </select>
                        </div>
                        {selectedOrganization &&
                          availableCompanies.length > 0 && (
                            <div className="grid grid-cols-3 gap-3 items-center">
                              <label
                                className={`text-sm font-medium text-end style={{ color: textColor }}`}
                              >
                                Company
                              </label>
                              <select
                                className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                                style={{
                                  background: cardColor,
                                  border: `1px solid ${borderColor}`,
                                  color: textColor,
                                }}
                                value={selectedCompany}
                                onChange={handleCompanyChange}
                              >
                                <option value="">
                                  Select Company (Optional)
                                </option>
                                {availableCompanies.map((company) => (
                                  <option key={company.id} value={company.id}>
                                    {company.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        {selectedCompany && availableEntities.length > 0 && (
                          <div className="grid grid-cols-3 gap-3 items-center">
                            <label
                              className={`text-sm font-medium text-end style={{ color: textColor }}`}
                            >
                              Entity
                            </label>
                            <select
                              className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                              style={{
                                background: cardColor,
                                border: `1px solid ${borderColor}`,
                                color: textColor,
                              }}
                              value={userDataForm.entity_id}
                              onChange={handleEntityChange}
                            >
                              <option value="">Select Entity (Optional)</option>
                              {availableEntities.map((entity) => (
                                <option key={entity.id} value={entity.id}>
                                  {entity.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        {/* {availableProjects.length > 0 && (
                          <div className="grid grid-cols-3 gap-3 items-center">
                            <label
                              className={`text-sm font-medium text-end style={{ color: textColor }}`}
                            >
                              Project
                            </label>
                            <select
                              className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                              style={{
                                background: cardColor,
                                border: `1px solid ${borderColor}`,
                                color: textColor,
                              }}
                              value={selectedProject}
                              onChange={handleProjectChange}
                              disabled={projectsLoading}
                            >
                              <option value="">
                                {projectsLoading
                                  ? "Loading projects..."
                                  : "Select Project (Optional)"}
                              </option>
                              {availableProjects.map((project, index) => (
                                <option
                                  key={project.id || index}
                                  value={project.id}
                                >
                                  {project.name || `Project ${index + 1}`}
                                </option>
                              ))}
                            </select>
                          </div>
                        )} */}
                        {/* {selectedProject && availableBuildings.length > 0 && (
                          <div className="grid grid-cols-3 gap-3 items-center">
                            <label
                              className={`text-sm font-medium text-end style={{ color: textColor }}`}
                            >
                              Building
                            </label>
                            <select
                              className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                              style={{
                                background: cardColor,
                                border: `1px solid ${borderColor}`,
                                color: textColor,
                              }}
                              value={selectedBuilding}
                              onChange={handleBuildingChange}
                            >
                              <option value="">
                                Select Building (Optional)
                              </option>
                              {availableBuildings.map((building) => (
                                <option key={building.id} value={building.id}>
                                  {building.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )} */}
                        {selectedBuilding && availableZones.length > 0 && (
                          <div className="grid grid-cols-3 gap-3 items-center">
                            <label
                              className={`text-sm font-medium text-end style={{ color: textColor }}`}
                            >
                              Zone
                            </label>
                            <select
                              className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                              style={{
                                background: cardColor,
                                border: `1px solid ${borderColor}`,
                                color: textColor,
                              }}
                              value={userDataForm.zone_id}
                              onChange={handleZoneChange}
                            >
                              <option value="">Select Zone (Optional)</option>
                              {availableZones.map((zone) => (
                                <option key={zone.id} value={zone.id}>
                                  {zone.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </>
                    )}

                    {canCreateNormalUser && (
                      <div className="grid grid-cols-3 gap-3 items-center">
                        <label
                          className={`text-sm font-medium text-end style={{ color: textColor }}`}
                        >
                          Role<span className="text-red-500">*</span>
                        </label>
                        <select
                          className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                          style={{
                            background: cardColor,
                            border: `1px solid ${borderColor}`,
                            color: textColor,
                          }}
                          value={userDataForm.role}
                          onChange={(e) =>
                            setUserDataForm((prev) => ({
                              ...prev,
                              role: e.target.value,
                            }))
                          }
                          required
                        >
                          <option value="">Select Role</option>
                          {getRoleOptions().map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {canCreateNormalUser && availableProjects.length > 0 && (
                      <div className="grid grid-cols-3 gap-3 items-center">
                        <label
                          className={`text-sm font-medium text-end style={{ color: textColor }}`}
                        >
                          Project<span className="text-red-500">*</span>
                        </label>
                        <select
                          className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                          style={{
                            background: cardColor,
                            border: `1px solid ${borderColor}`,
                            color: textColor,
                          }}
                          value={selectedProject}
                          onChange={handleProjectChange}
                          disabled={projectsLoading}
                        >
                          <option value="">
                            {projectsLoading
                              ? "Loading projects..."
                              : "Select Project"}
                          </option>
                          {availableProjects.map((project, index) => (
                            <option
                              key={project.id || index}
                              value={project.id}
                            >
                              {project.name || `Project ${index + 1}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}


                    
{/* 🔽 ADD YOUR NEW DROPDOWNS HERE */}
{canCreateNormalUser && ["CHECKER", "MAKER", "SUPERVISOR"].includes(userDataForm.role) && (
  <>
    {/* Purpose */}
    <div className="grid grid-cols-3 gap-3 items-center">
      <label className="text-sm font-medium text-end">
        Purpose<span className="text-red-500">*</span>
      </label>
     <select
  className="col-span-2 w-full p-2 border rounded"
  value={selectedPurpose}
  onChange={handlePurposeChange}
  required
>
  <option value="">Select Purpose</option>
  {purposes.map((p) => {
    // 🔑 Try all possible nested shapes
    const purposeName =
      p.purpose?.name ||         // case: { purpose: { name: "X" } }
      p.name?.purpose?.name ||   // case: { name: { purpose: { name: "X" } } }
      p.name?.name ||            // case: { name: { name: "X" } }
      p.purpose_name ||          // case: { purpose_name: "X" }
      `Purpose ${p.id}`;         // fallback

    return (
      <option key={p.id} value={p.id}>
        {purposeName}
      </option>
    );
  })}
</select>
    </div>

    {/* Phase */}
    <div className="grid grid-cols-3 gap-3 items-center">
      <label className="text-sm font-medium text-end">
        Phase<span className="text-red-500">*</span>
      </label>
      <select
  className="col-span-2 w-full p-2 border rounded"
  value={selectedPhase}
  onChange={handlePhaseChange}
  required
>
  <option value="">Select Phase</option>
  {phases.map((ph) => (
    <option key={ph.id} value={ph.id}>
      {ph.name || ph.phase} {/* depends on API */}
    </option>
  ))}
</select>
    </div>

    {/* Stage */}
        {/* Stage - MULTI SELECT */}
    <div className="grid grid-cols-3 gap-3 items-center">
      <label className="text-sm font-medium text-end">
        Stage(s)<span className="text-red-500">*</span>
      </label>
      <select
        className="col-span-2 w-full p-2 border rounded"
        style={{
          background: cardColor,
          border: `1px solid ${borderColor}`,
          color: textColor,
        }}
        multiple  // 👈 IMPORTANT
        size={Math.min(6, stages.length || 4)} // shows multiple rows
        value={selectedStages}
        onChange={handleStageChange}
        required
      >
        {stages.length === 0 && (
          <option disabled>First select Purpose & Phase</option>
        )}
        {stages.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name || s.stage}
          </option>
        ))}
      </select>
      {/* Small hint line (optional) */}
      <p className="col-span-3 text-xs text-left ml-[34%] mt-1 opacity-70">
        Hold <strong>Ctrl</strong> (Cmd on Mac) to select multiple stages.
      </p>
    </div>

  </>
)}


{/* ===== Categories (only for normal user, not for Intializer, not for Manager) ===== */}
{showCategoryUI && (
  <>
    {/* Select All Categories */}
    <div className="grid grid-cols-3 gap-3 items-center">
      <label className="text-sm font-medium text-end">Select all categories</label>
      <div className="col-span-2 flex items-center gap-2">
        <input
          type="checkbox"
          className="h-4 w-4"
          checked={allCat}
          onChange={(e) => {
            const checked = e.target.checked;
            setAllCat(checked);
            if (checked) {
              // clear any previously chosen category levels
              setSelectedCategory("");
              setSelectedLevel1("");
              setSelectedLevel2("");
              setSelectedLevel3("");
              setSelectedLevel4("");
              setSelectedLevel5("");
              setSelectedLevel6("");
            }
          }}
        />
        <span className="text-sm" style={{ color: textColor }}>
          Apply to all categories
        </span>
      </div>
    </div>

    {/* Category (disabled when Select All is checked) */}
    <div className="grid grid-cols-3 gap-3 items-center">
      <label className="text-sm font-medium text-end">
        Category<span className="text-red-500">*</span>
      </label>
      <select
        className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
        style={{ background: cardColor, border: `1px solid ${borderColor}`, color: textColor }}
        value={selectedCategory}
        onChange={handleCategoryChange}
        disabled={allCat || categoryLoading || categoryTree.length === 0}
        required={!allCat}  // only required when not "select all"
      >
        <option value="">
          {categoryLoading
            ? "Loading categories..."
            : categoryTree.length === 0
            ? "No categories available"
            : "Select Category"}
        </option>
        {categoryTree.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </div>

    {/* Sub-Category 1 */}
    {selectedCategory && availableLevel1.length > 0 && (
      <div className="grid grid-cols-3 gap-3 items-center">
        <label className="text-sm font-medium text-end">Sub-Category 1</label>
        <select
          className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          style={{ background: cardColor, border: `1px solid ${borderColor}`, color: textColor }}
          value={selectedLevel1}
          onChange={handleLevel1Change}
          disabled={allCat}
        >
          <option value="">Select Sub-Category 1 (Optional)</option>
          {availableLevel1.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
    )}

    {/* Sub-Category 2 */}
    {selectedLevel1 && availableLevel2.length > 0 && (
      <div className="grid grid-cols-3 gap-3 items-center">
        <label className="text-sm font-medium text-end">Sub-Category 2</label>
        <select
          className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          style={{ background: cardColor, border: `1px solid ${borderColor}`, color: textColor }}
          value={selectedLevel2}
          onChange={handleLevel2Change}
          disabled={allCat}
        >
          <option value="">Select Sub-Category 2 (Optional)</option>
          {availableLevel2.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
    )}

    {/* Sub-Category 3 */}
    {selectedLevel2 && availableLevel3.length > 0 && (
      <div className="grid grid-cols-3 gap-3 items-center">
        <label className="text-sm font-medium text-end">Sub-Category 3</label>
        <select
          className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          style={{ background: cardColor, border: `1px solid ${borderColor}`, color: textColor }}
          value={selectedLevel3}
          onChange={handleLevel3Change}
          disabled={allCat}
        >
          <option value="">Select Sub-Category 3 (Optional)</option>
          {availableLevel3.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
    )}

    {/* Sub-Category 4 */}
    {selectedLevel3 && availableLevel4.length > 0 && (
      <div className="grid grid-cols-3 gap-3 items-center">
        <label className="text-sm font-medium text-end">Sub-Category 4</label>
        <select
          className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          style={{ background: cardColor, border: `1px solid ${borderColor}`, color: textColor }}
          value={selectedLevel4}
          onChange={handleLevel4Change}
          disabled={allCat}
        >
          <option value="">Select Sub-Category 4 (Optional)</option>
          {availableLevel4.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
    )}

    {/* Sub-Category 5 */}
    {selectedLevel4 && availableLevel5.length > 0 && (
      <div className="grid grid-cols-3 gap-3 items-center">
        <label className="text-sm font-medium text-end">Sub-Category 5</label>
        <select
          className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          style={{ background: cardColor, border: `1px solid ${borderColor}`, color: textColor }}
          value={selectedLevel5}
          onChange={handleLevel5Change}
          disabled={allCat}
        >
          <option value="">Select Sub-Category 5 (Optional)</option>
          {availableLevel5.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
    )}

    {/* Sub-Category 6 */}
    {selectedLevel5 && availableLevel6.length > 0 && (
      <div className="grid grid-cols-3 gap-3 items-center">
        <label className="text-sm font-medium text-end">Sub-Category 6</label>
        <select
          className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          style={{ background: cardColor, border: `1px solid ${borderColor}`, color: textColor }}
          value={selectedLevel6}
          onChange={handleLevel6Change}
          disabled={allCat}
        >
          <option value="">Select Sub-Category 6 (Optional)</option>
          {availableLevel6.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
    )}
  </>
)}

                        {selectedProject && availableBuildings.length > 0 && (
                          <div className="grid grid-cols-3 gap-3 items-center">
                            <label
                              className={`text-sm font-medium text-end style={{ color: textColor }}`}
                            >
                              Building
                            </label>
                            <select
                              className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                              style={{
                                background: cardColor,
                                border: `1px solid ${borderColor}`,
                                color: textColor,
                              }}
                              value={selectedBuilding}
                              onChange={handleBuildingChange}
                            >
                              <option value="">
                                Select Building (Optional)
                              </option>
                              {availableBuildings.map((building) => (
                                <option key={building.id} value={building.id}>
                                  {building.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        {selectedBuilding && availableZones.length > 0 && (
                          <div className="grid grid-cols-3 gap-3 items-center">
                            <label
                              className={`text-sm font-medium text-end style={{ color: textColor }}`}
                            >
                              Zone
                            </label>
                            <select
                              className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 "
                              style={{
                                background: cardColor,
                                border: `1px solid ${borderColor}`,
                                color: textColor,
                              }}
                              value={userDataForm.zone_id}
                              onChange={handleZoneChange}
                            >
                              <option value="">Select Zone (Optional)</option>
                              {availableZones.map((zone) => (
                                <option key={zone.id} value={zone.id}>
                                  {zone.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      
                    <div className="grid grid-cols-3 gap-3 items-center">
                      <label
                        className={`text-sm font-medium text-end style={{ color: textColor }}`}
                      >
                        First Name<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                        style={{
                          background: cardColor,
                          border: `1px solid ${borderColor}`,
                          color: textColor,
                        }}
                        value={userDataForm.first_name}
                        placeholder="Enter First Name"
                        onChange={(e) =>
                          setUserDataForm((prev) => ({
                            ...prev,
                            first_name: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3 items-center">
                      <label
                        className={`text-sm font-medium text-end style={{ color: textColor }}`}
                      >
                        Last Name<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                        style={{
                          background: cardColor,
                          border: `1px solid ${borderColor}`,
                          color: textColor,
                        }}
                        value={userDataForm.last_name}
                        placeholder="Enter Last Name"
                        onChange={(e) =>
                          setUserDataForm((prev) => ({
                            ...prev,
                            last_name: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3 items-center">
                      <label
                        className={`text-sm font-medium text-end style={{ color: textColor }}`}
                      >
                        Email<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                        style={{
                          background: cardColor,
                          border: `1px solid ${borderColor}`,
                          color: textColor,
                        }}
                        value={userDataForm.email}
                        placeholder="Enter Email Address"
                        onChange={(e) =>
                          setUserDataForm((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3 items-center">
                      <label
                        className={`text-sm font-medium text-end style={{ color: textColor }}`}
                      >
                        Mobile
                      </label>
                      <input
                        type="tel"
                        className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 "
                        style={{
                          background: cardColor,
                          border: `1px solid ${borderColor}`,
                          color: textColor,
                        }}
                        value={userDataForm.mobile}
                        placeholder="Enter Mobile Number"
                        onChange={(e) =>
                          setUserDataForm((prev) => ({
                            ...prev,
                            mobile: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3 items-center">
                      <label
                        className={`text-sm font-medium text-end style={{ color: textColor }}`}
                      >
                        Password<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                        style={{
                          background: cardColor,
                          border: `1px solid ${borderColor}`,
                          color: textColor,
                        }}
                        value={userDataForm.password}
                        placeholder="Enter Password"
                        onChange={(e) =>
                          setUserDataForm((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        className="flex-1 py-2 px-4 rounded"
                        style={{
                          background: theme === "dark" ? "#23232c" : "#ececf0", // or use your BG_OFFWHITE if you want
                          color: theme === "dark" ? "#fff" : "#222",
                          border: `1px solid ${borderColor}`,
                        }}
                        onClick={resetForm}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className={submitButtonClassName}
                        disabled={
                          !isFormValid() || orgInfoLoading || projectsLoading
                        }
                      >
                        {orgInfoLoading || projectsLoading
                          ? "Loading..."
                          : canCreateClient
                          ? "Create Client"
                          : canCreateManager
                          ? "Create Manager"
                          : "Create User"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default User;

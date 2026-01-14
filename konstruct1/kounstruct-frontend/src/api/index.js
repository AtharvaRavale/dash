
import axiosInstance from "./axiosInstance";
import {
  projectInstance,
  checklistInstance,
  NEWchecklistInstance,
} from "./axiosInstance";
import { organnizationInstance } from "./axiosInstance"
import axios from "axios";


const __isLoggingOut = () => localStorage.getItem("__LOGGING_OUT__") === "1";
const __hasAccess = () => !!localStorage.getItem("ACCESS_TOKEN");


// helper: get root domain from axiosInstance baseURL safely
const __getApiRoot = () => {
  try {
    const rawBase = axiosInstance?.defaults?.baseURL || "";
    // rawBase could be: "https://konstruct.world/api" OR "/api" OR "https://konstruct.world/users"
    const u = new URL(rawBase, window.location.origin);

    // remove trailing "/api" or "/users" if present
    u.pathname = u.pathname.replace(/\/(api|users)\/?$/, "/");
    const root = (u.origin + u.pathname).replace(/\/$/, "");
    return root || window.location.origin;
  } catch (e) {
    return window.location.origin;
  }
};

// helper: try multiple URLs (useful when env/baseURL differs)
const __postMultipartWithFallback = async (instance, urlList, formData, config = {}) => {
  let lastErr = null;

  for (const url of urlList) {
    try {
      // NOTE: Do NOT force Content-Type; let browser/axios set multipart boundary
      return await instance.post(url, formData, config);
    } catch (err) {
      lastErr = err;
      const status = err?.response?.status;

      // only fallback on 404 (route not found). Other errors should stop.
      if (status && status !== 404) throw err;

      // if no response (network error), also stop
      if (!err?.response) throw err;
    }
  }

  throw lastErr;
};




const __getBlobWithFallback = async (instance, urlList, config = {}) => {
  let lastErr = null;

  for (const url of urlList) {
    try {
      return await instance.get(url, config);
    } catch (err) {
      lastErr = err;
      const status = err?.response?.status;

      // only fallback on 404
      if (status && status !== 404) throw err;

      // no response = network error
      if (!err?.response) throw err;
    }
  }

  throw lastErr;
};


// export function downloadBlob(blob, filename = "file.pdf") {
//   const url = window.URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = filename;
//   document.body.appendChild(a);
//   a.click();
//   a.remove();
//   window.URL.revokeObjectURL(url);
// }
export function downloadBlob(blob, filename = "file.pdf") {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  // ✅ revoke after a bit (safer)
  setTimeout(() => window.URL.revokeObjectURL(url), 5000);
}

export function filenameFromDisposition(disposition) {
  if (!disposition) return null;
  // attachment; filename="WIR_123.pdf"
  const m = /filename\*=UTF-8''([^;]+)|filename="([^"]+)"|filename=([^;]+)/i.exec(disposition);
  const name = (m && (m[1] || m[2] || m[3])) ? decodeURIComponent(m[1] || m[2] || m[3]) : "";
  return (name || "").trim() || null;
}


export const login = async (data) =>
  axiosInstance.post("/token/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const deleteChecklistById = async (checklistId) =>
  NEWchecklistInstance.delete(`/checklists/${checklistId}/`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const createUser = async (data) =>
  axiosInstance.post("/user/create-user/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  // api.js

export const createRoom = async (data) =>
  projectInstance.post("/rooms/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });


export const getRoomsByProject = async (projectId) =>
    projectInstance.get(`/rooms/by_project/?project_id=${projectId}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  

export const createOrganization = async (data) =>
  organnizationInstance.post("/organizations/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  export const assignOrganizationToUser = async (user_id, organization_id) =>
  organnizationInstance.post('/assign-user-org/', { user_id, organization_id }, {
    headers: { "Content-Type": "application/json" }
  });

export const createCompany = async (data) =>
  organnizationInstance.post("/companies/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  export const createProject = async (data) =>
    projectInstance.post("/projects/", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

  export const GEtbyProjectID = async (id) =>
    projectInstance.get(`/projects/${id}`, {  // ✅ Use the id parameter
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

export const allorgantioninfototalbyUser_id = async (id) =>
  organnizationInstance.get(`/user-orgnizationn-info/${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const getUserDetailsById = async (id) =>
  axiosInstance.get(`users/${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  export const Allprojects = async () =>
    projectInstance.get(`/projects/`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  
export const createEntity = async (data) =>
  organnizationInstance.post(`/entities/`,data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const getOrganizationDetailsById = async (id) =>
  organnizationInstance.get(`/organizations/by-user/${id}/`, {
    headers: {
      "Content-Type": "application/json",
    },
  });


export const getCompanyDetailsById = async (id) =>
  organnizationInstance.get(
    `/company/get-company-details-by-organization-id/?organization_id=${id}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

export const getProjectDetailsById = async (id) => {
  console.log(id, "id project");
  return projectInstance.get(
    `/project/get-project-details-by-company-id/`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};


export const getPRojectbyYourPErmission = async () =>
  projectInstance.get("projects/by_user_scope/", {
    headers: {
      "Content-Type": "application/json",
    },
  });


export const getProjectDetails = async () =>
  projectInstance.get("/project/get-project-details/", {
    headers: {
      "Content-Type": "application/json",

    },
  });

export const createPurpose = async (data) =>
  projectInstance.post("purposes/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const getPurposeByProjectId = async (id) =>
  projectInstance.get(`purpose/get-purpose-details-by-project-id/${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  export const getMyChecklists= async () => 
    NEWchecklistInstance.get("checklists/my-checklists/",{
        headers: {
          "Content-Type": "application/json",
        },
      });
  


  export const createPhase = async (data) =>
    projectInstance.post("phase/create-phases/", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  

export const getPhaseDetailsByProjectId = async (id) =>
  projectInstance.get(`phases/by-project/${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const createStage = async (data) =>
  projectInstance.post("stages/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  export const GetstagebyPhaseid = async (id) =>
    projectInstance.get(`stages/by_phase/${id}/`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

  
export const deleteStage = async (id) => projectInstance.delete(`stages/${id}/`,{
  headers: {
    "Content-Type": "application/json",
  },
})

export const getStageDetailsByProjectId = async (id) =>
  projectInstance.get(`get-stage-details-by-project-id/${id}/`, {
    headers: {
      "Content-Type": "application/json",
    },
  });


export const createTower = async (data) =>
  projectInstance.post("/buildings/", data, {
    headers: {
      "Content-Type": "application/json",
      //   "Access-Control-Allow-Origin": "*",
    },
  });

  export const fetchTowersByProject = async (id) =>
    projectInstance.get(`/buildings/by_project/${id}/`, {
      headers: {
        "Content-Type": "application/json",
        //   "Access-Control-Allow-Origin": "*",
      },
    });

export const DeleteTowerByid = async (id) =>
      projectInstance.delete(`/buildings/${id}/`, {
        headers: {
          "Content-Type": "application/json",
          //   "Access-Control-Allow-Origin": "*",
        },
      });

export const getBuildingnlevel = async (id)=>
  projectInstance.get(`buildings/with-levels/by_project/${id}/`,{
    headers: {
      "Content-Type": "application/json",
      //   "Access-Control-Allow-Origin": "*",
    },
  })

export const updateTower = async (towerId, data) =>
        projectInstance.patch(`/buildings/${towerId}/`, data, {
          headers: {
            "Content-Type": "application/json",
          },
        });
      


// export const getTowerDetailsByProjectId = async (id) =>
//   axiosInstance.get(`/tower/get-tower-details-by-id/?project_id=${id}`, {
//     headers: {
//       "Content-Type": "application/json",
//     },
//   });


export const createLevel = async (data) =>
  projectInstance.post("/levels/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const getLevelsByTowerId = async (id) =>
  projectInstance.get(`/levels/by_building/${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
    
  });

  

export const getLevelsWithFlatsByBuilding = async (id) =>
  projectInstance.get(`/levels-with-flats/${id}/`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  export const getBuildingsById = async (id) =>
  projectInstance.get(`/levels-with-flats/${id}/`, {
    headers: {
      "Content-Type": "application/json",
    },
  });



export const updateLevel = async ({ id, name, building }) =>
  projectInstance.put(`/levels/${id}/`, { name, building }, {
    headers: { "Content-Type": "application/json" },
  });


export const deleteLevel = async (id) =>
  projectInstance.delete(`/levels/${id}/`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const NestedZonenSubzone=async (data)=>{
  projectInstance.post("buildings/with-levels-zones/bulk-create/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}


export const zonewithbluidlingwithlevel = async (id) =>
  projectInstance.get(
    `/buildings/with-levels-and-zones/by_project/${id}/`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );


// export const createRoom = async (data) =>
//   axiosInstance.post("/room/create-room/", data, {
//     headers: {
//       "Content-Type": "application/json",
//     },
//   });

export const getRooms = async (id) =>
  axiosInstance.get(`/room/get-room-details-by-company-id/?company_id=${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const createFlatType = async (data) =>
  projectInstance.post("/flattypes/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const getFlatTypes = async (id, token) =>
  projectInstance.get(`/flattypes/by_project/${id}/`, {
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${token}`,
    },
  });


export const updateFlatType = async (data) => {
  console.log(data, "DATA FLAT TYPE");
  return projectInstance.put(
    "/flat-type/update-room-type-by-flat-type/",
    data,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};


export const createUnit = async (data) =>
  projectInstance.post("/flats/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });


export const getUnits = async (id) =>
  projectInstance.get(`flats/by_project/${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });


export const allinfobuildingtoflat = async (id) =>
  projectInstance.get(`projects/${id}/buildings-details/`, {
    headers: {
      "Content-Type": "application/json",
    },
  });


export const updateUnit = async (data) =>
  projectInstance.put("/flats/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });


export const createTransferRule = async (data) =>
  projectInstance.post("/transfer-rules/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });


export const getTransferRules = async (id) => {
  return projectInstance.get(`/transfer-rules/?project_id=${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};


export const createChecklistCategory = async (data) =>
  checklistInstance.post("/category/create-category/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });


export const getChecklistCategories = async (id) =>
  checklistInstance.get(
    `/category/get-category-details-by-organization-id/?organization_id=${id}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

export const getchecklistbyProject = async (id) =>
  checklistInstance.get(`checklists/?project=${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });


export const createChecklistSubCategory = async (data) =>
  axiosInstance.post("/sub-category/create-sub-category/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });


export const getChecklistSubCategories = async (id) =>
  axiosInstance.get(
    `/sub-category/get-sub-category-details-by-organization-id/?organization_id=${id}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  export const getCategoriesSimpleByProject = async (projectId) =>
  projectInstance.get(`/categories-simple/?project=${projectId}`, {
    headers: { "Content-Type": "application/json" },
  });

  export const createCategorySimple = async (data) =>
  projectInstance.post(`/categories-simple/`, data, {
    headers: { "Content-Type": "application/json" },
  });


export const createChecklist = async (data) =>
  NEWchecklistInstance.post("/checklists/", data,
     {
    headers: {
      "Content-Type": "application/json",
    },
  });

  export const viewChecklist = async (checklistId) =>
    NEWchecklistInstance.get(`/checklist-items/${checklistId}/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access")}`,
      },
    });



  export const createChecklistItemOPTIONSS = async (data) =>
    NEWchecklistInstance.post("/options/", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });


export const createChecklistQuestion = async (data) =>
  NEWchecklistInstance.post("/items/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  


export const getChecklistDetails = async (id) =>
  axiosInstance.get(
    `/checklist-quest/get-checklist-details-by-organization-id/?organization_id=${id}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );


export const createChecklistMapping = async (data) =>
  axiosInstance.post(
    "/checklist-quest/mapping-data-with-category-checklist/",
    data,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
export const getChecklistMappingDetails = async (id) =>
  axiosInstance.get(`/checklist-quest/get-mapping-data/?project_id=${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const createUserDetails = async (data) =>
  axiosInstance.post("/users/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const updateChecklist = async (data) =>
  axiosInstance.put(
    "/checklist-quest/update-checklist-quest-by-checklist-id/",
    data,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

export const getUsersByOrganizationId = async (id) =>
  organnizationInstance.get(`/user-orgnizationn-info/${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });



export const updateUserDetails = async (data) =>
  axiosInstance.put("/user/update-user-details/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

// export const getAllProjectDetails = async () =>
//   axiosInstance.get("/project/get-project-details/", {
//     headers: {
//       "Content-Type": "application/json",
//       //   "Access-Control-Allow-Origin": "*",
//     },
//   });

export const getProjectLevelDetails = async (id) =>
  projectInstance.get(`/buildings/by_project/${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const getFloorDetails = async (id) =>
  projectInstance.get(`/levels/by_building/${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const getFloorTypeDetails = async (id, projectId) =>
  axiosInstance.get(
    `/room/get-rooms-checklist-by-flat-type/?unit_id=${id}&project_id=${projectId}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

export const getSubCategoryChecklist = async (id) =>
  axiosInstance.get(
    `/sub-category/get-checklist-sub-category-by-category/?category_id=${id}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

export const getRoomsWiseChecklist = async (checkListId, roomId) =>
  axiosInstance.get(
    `/room-map/get-rooms-wise-checklist/?checklist_id=${checkListId}&room_id=${roomId}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

export const getstageDetails = async (projectId) =>
  axiosInstance.get(
    `/stage/get-stage-details-by-project-id/?project_id=${projectId}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  
// export const getProjectUserDetails = async  =>
//   projectInstance.get(
//     // `/user-stage-role/get-projects-by-user/?user_id=${userId}`,
//     `/user-stage-role/get-projects-by-user/`,
//     {
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${localStorage.getItem('ACCESS_TOKEN')}`,
        
//       },
//     }
//   );

export const getProjectUserDetails = async () =>
  projectInstance.get(
    "/user-stage-role/get-projects-by-user/",
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${
          localStorage.getItem("ACCESS_TOKEN") || localStorage.getItem("access")
        }`,
      },
    }
  );



export const editStage = async (data) =>
  axiosInstance.put("/stage/update-stage-details/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });



export const getProjectsByOwnership = async ({ entity_id, company_id, organization_id }) => {
  let query = '';
  if (entity_id) query = `entity_id=${entity_id}`;
  else if (company_id) query = `company_id=${company_id}`;
  else if (organization_id) query = `organization_id=${organization_id}`;
if (!__hasAccess() || __isLoggingOut()) return { data: [] };
  return projectInstance.get(
    `/projects/by_ownership/?${query}`,
    {
      headers: {
        "Content-Type": "application/json",
      }
    }
  );
};



export const getProjectsByOrganization = async (organizationId) =>
  
  projectInstance.get(`/projects/by_organization/${organizationId}/`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const getCategoryTreeByProject = async (projectId) => 
  projectInstance.get(`/category-tree-by-project/?project=${projectId}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const createUserAccessRole = async (payload) => 
  axiosInstance.post(`/user-access-role/`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });


  export const getPhaseByPurposeId = async (purposeId) =>
    projectInstance.get(`phases/by-purpose/${purposeId}/`, {
      headers: { "Content-Type": "application/json" },
    });
  
  export const getStageByPhaseId = async (phaseId) =>
    projectInstance.get(`stages/by_phase/${phaseId}/`, {
      headers: { "Content-Type": "application/json" },
    });
  
export const getAccessibleChecklists = async (projectId, userId) =>
  checklistInstance.get(`/accessible-checklists/?project_id=${projectId}&user_id=${userId}`, {
    headers: {
      "Content-Type": "application/json",
    },
  })


export const assignChecklistToUser = async (checklistId) =>
  checklistInstance.post('/create-checklistitemsubmissions-assign/', {
    checklist_id: checklistId
  }, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Get hierarchical verifications for checker
export const getMyHierarchicalVerifications = async () =>
  checklistInstance.get('/my-hierarchical-verifications/', {
    headers: {
      "Content-Type": "application/json",
    },
  });

  // export const verifyChecklistItemSubmission = async (formData) =>
  //   checklistInstance.patch("/verify-checklist-item-submission/", formData, {
  //     headers: { "Content-Type": "multipart/form-data" },
  //   });
  export const verifyChecklistItemSubmission = async (formData) => {
  try {
    const flowRole = localStorage.getItem("FLOW_ROLE");
    if (flowRole && formData && typeof formData.append === "function") {
      const alreadyHasRole =
        typeof formData.has === "function" ? formData.has("role") : false;
      if (!alreadyHasRole) {
        formData.append("role", flowRole); // backend does .lower() so "CHECKER" is fine
      }
    }
  } catch (e) {
    console.warn("Could not attach FLOW_ROLE to formData", e);
  }

  return checklistInstance.patch("/verify-checklist-item-submission/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

  

    // by prathamesh

    // Get project category user access
export const getProjectCategoryUserAccess = async (projectId, categoryId) => {
  console.log("Fetching user access data...", { projectId, categoryId });
  
  try {
    const response = await axiosInstance.get("project-category-user-access/", {
      params: {
        project_id: projectId,
        category_id: categoryId
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    console.log("User access data fetched:", response.data);
    return response.data;
    
  } catch (error) {
    console.error("Error fetching user access:", error);
    throw error;
  }
};


export const sendNotificationToUsers = async (data) => {
  console.log("Sending notification to users...", data);

  try {
    const response = await axiosInstance.post("/send-notification/", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Notification sent successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending notification:", error);
    throw error;
  }
};


// Add this function to your index.js API file

export const patchChecklistRoles = async (checklistId, rolesData) => {
  console.log("Patching checklist roles...", { checklistId, rolesData });
  
  try {
    const response = await checklistInstance.patch(`/${checklistId}/patch-roles/`, {
      roles_json: rolesData
    }, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    console.log("Checklist roles updated successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating checklist roles:", error);
    throw error;
  }
};




// ORGANIZATION PATCH & DELETE
export const updateOrganization = async (id, data) =>
  organnizationInstance.patch(`/organizations/${id}/`, data, {
    headers: { "Content-Type": "application/json" },
  });

export const deleteOrganization = async (id) =>
  organnizationInstance.delete(`/organizations/${id}/`, {
    headers: { "Content-Type": "application/json" },
  });

// COMPANY PATCH & DELETE
export const updateCompany = async (id, data) =>
  organnizationInstance.patch(`/companies/${id}/`, data, {
    headers: { "Content-Type": "application/json" },
  });

export const deleteCompany = async (id) =>
  organnizationInstance.delete(`/companies/${id}/`, {
    headers: { "Content-Type": "application/json" },
  });

// ENTITY PATCH & DELETE
export const updateEntity = async (id, data) =>
  organnizationInstance.patch(`/entities/${id}/`, data, {
    headers: { "Content-Type": "application/json" },
  });

export const deleteEntity = async (id) =>
  organnizationInstance.delete(`/entities/${id}/`, {
    headers: { "Content-Type": "application/json" },
  });



export const editPurpose = (purposeId, payload) => {
  return projectInstance.patch(`/purposes/${purposeId}/`, payload, {
    headers: { "Content-Type": "application/json" }
  });
};

export const deletePurpose = (purposeId) => {
  return projectInstance.delete(`/purposes/${purposeId}/`, {
    headers: { "Content-Type": "application/json" }
  });
};


export const editPhase = (phaseId, payload) => {
  return projectInstance.patch(`/phases/${phaseId}/`, payload, {
    headers: { "Content-Type": "application/json" }
  });
};

export const deletePhase = (phaseId) => {
  return projectInstance.delete(`/phases/${phaseId}/`, {
    headers: { "Content-Type": "application/json" }
  });
};


export const patchStage = (id, payload) => {
  return projectInstance.patch(`/stages/${id}/`, payload, {
    headers: { "Content-Type": "application/json" }
  });
};



// Get user dashboard analytics
export const getUserDashboard = async () => {
  const token = localStorage.getItem("ACCESS_TOKEN");
  console.log(
    "Making API call to /user-dashboard/ with token:",
    token ? "Present" : "Missing"
  );

  try {
    const response = await axiosInstance.get("/user-dashboard/", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("API Response Status:", response.status);
    console.log("API Response Data:", response.data);
    return response;
  } catch (error) {
    console.error("API Error:", error.response?.status, error.response?.data);
    throw error;
  }
};

// Get specific role analytics (optional - for detailed view)
export const getChecklistRoleAnalytics = async (userId, projectId, role) =>
  axiosInstance.get("/checklist-role-analytics/", {
    params: { user_id: userId, project_id: projectId, role },
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
    },
  });

export const getChecklistById = async (checklistId) =>
  NEWchecklistInstance.get(`/checklists/${checklistId}/`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

// Update existing checklist using PATCH
export const updateChecklistById = async (checklistId, payload) =>
  NEWchecklistInstance.patch(`/checklists/${checklistId}/`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });















  // ==== SCHEDULING APIs ====

// export const getSchedulingSetup = async (projectId) =>
//   projectInstance.get(`/v2/scheduling/setup/`, {
//     params: { project_id: projectId },
//     headers: { "Content-Type": "application/json" },
//   });

export const createProjectSchedules = async (payload) =>
  projectInstance.post(`/v2/scheduling/`, payload, {
    headers: { "Content-Type": "application/json" },
  });

// export const listProjectSchedules = async (projectId) =>
//   projectInstance.get(`/v2/scheduling/list/`, {
//     params: { project_id: projectId },
//     headers: { "Content-Type": "application/json" },
//   });

// export const myProjectSchedules = async (projectId) =>
//   projectInstance.get(`/v2/scheduling/my/`, {
//     params: { project_id: projectId },
//     headers: { "Content-Type": "application/json" },
//   });

  // api.js
// export const myProjectSchedules = (project_id, extraParams = {}) =>
//   projectInstance.get("/v2/scheduling/my/", {
//     params: { project_id, ...extraParams },
//   });



  // api.js
// export const getProjectsForCurrentUser = async () => {
//   const roleRaw = localStorage.getItem("ROLE") || "";
//   const role = roleRaw.toLowerCase();
//   const userStr = localStorage.getItem("USER_DATA");
//   const user = userStr && userStr !== "undefined" ? JSON.parse(userStr) : null;

//   if (!user) return { data: [] };
//   if (!__hasAccess() || __isLoggingOut()) return { data: [] };


//   if (role === "super admin") return Allprojects(); // /projects/
//   if (role === "admin" || role === "manager") return getProjectUserDetails(); // /user-stage-role/get-projects-by-user/

//   // fallback: ownership-based for other roles
//   const entity_id = user.entity_id || null;
//   const company_id = user.company_id || null;
//   const organization_id = user.org || user.organization_id || null;
//   if (!entity_id && !company_id && !organization_id) return { data: [] };
//   return getProjectsByOwnership({ entity_id, company_id, organization_id }); // /projects/by_ownership/?...
// };

export const getProjectsForCurrentUser = async () => {
  const roleRaw = localStorage.getItem("ROLE") || "";
  const role = roleRaw.toLowerCase();
  const userStr = localStorage.getItem("USER_DATA");
  const user = userStr && userStr !== "undefined" ? JSON.parse(userStr) : null;

  if (!user) return { data: [] };
  if (!__hasAccess() || __isLoggingOut()) return { data: [] };

  // 1) SUPER ADMIN – see all projects
  if (role === "super admin") return Allprojects();

  // 2) ADMIN – stage-role based projects
  if (role === "admin") return getProjectUserDetails(); // /user-stage-role/get-projects-by-user/

  // 3) MANAGER + all other roles – ownership based
  const entity_id = user.entity_id || null;
  const company_id = user.company_id || null;
  const organization_id = user.org || user.organization_id || null;

  if (!entity_id && !company_id && !organization_id) return { data: [] };

  return getProjectsByOwnership({ entity_id, company_id, organization_id });
};



// api.js
export const getProjectsByOrgOwnership = async (organizationId) =>
  
  projectInstance.get(`/projects/by_ownership/`, {
    
    params: { organization_id: organizationId },   // -> https://konstruct.world/projects/projects/by_ownership/?organization_id=141
    headers: { "Content-Type": "application/json" },
  });



  // api.js
// import axios from "axios";

// const projectInstance = axios.create({
//   baseURL: import.meta.env.VITE_API_BASE_URL || "https://konstruct.world",
//   withCredentials: true,
// });

// (optional) auth header
// projectInstance.interceptors.request.use((cfg) => {
//   const token = localStorage.getItem("ACCESS_TOKEN") || localStorage.getItem("access");
//   if (token) cfg.headers.Authorization = `Bearer ${token}`;
//   return cfg;
// });

export const getSchedulingSetup = (project_id) =>
  projectInstance.get("/v2/scheduling/setup/", {
    params: { project_id }, // -> ?project_id=36
  });










//   /* ========= GUARD: STAFF & ATTENDANCE (v2) ========= */

// // 1) List STAFF for a project (search optional)
// // GET /v2/staff/?project_id=36[&q=raj]
// export const getStaffByProject = (projectId, q = "") =>
//   axiosInstance.get("/v2/staff/", {
//     params: { project_id: projectId, q },
//     headers: { "Content-Type": "application/json" },
//   });

// // 2) Onboard a STAFF (face template created server-side)
// // POST /v2/staffs/onboard/  (multipart/form-data)
// export const onboardStaff = ({
//   project_id,
//   first_name,
//   last_name = "",
//   phone_number,
//   adharcard_nummber = "",
//   photo, // File/Blob
// }) => {
//   const fd = new FormData();
//   fd.append("project_id", project_id);
//   fd.append("first_name", first_name);
//   if (last_name) fd.append("last_name", last_name);
//   fd.append("phone_number", phone_number);
//   if (adharcard_nummber) fd.append("adharcard_nummber", adharcard_nummber);
//   fd.append("photo", photo);
//   return axiosInstance.post("/v2/staffs/onboard/", fd, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
// };

// // 3) Mark attendance (auto IN/OUT unless force_action provided)
// // POST /v2/attendance/mark/  (multipart/form-data)
// export const markAttendance = ({
//   user_id,
//   project_id,
//   photo,                // File/Blob
//   lat = null,
//   lon = null,
//   force_action = null,  // "IN" | "OUT" | null
// }) => {
//   const fd = new FormData();
//   fd.append("user_id", user_id);
//   fd.append("project_id", project_id);
//   fd.append("photo", photo);
//   if (lat != null && lon != null) {
//     fd.append("lat", lat);
//     fd.append("lon", lon);
//   }
//   if (force_action) fd.append("force_action", force_action);
//   return axiosInstance.post("/v2/attendance/mark/", fd, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
// };

// // 4) List attendance for a user (by day or range)
// // GET /v2/attendance/?user_id=&project_id=&date=YYYY-MM-DD
// // or  /v2/attendance/?user_id=&project_id=&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
// export const listAttendanceByUser = ({
//   user_id,
//   project_id,
//   date,        // optional
//   start_date,  // optional (use with end_date)
//   end_date,    // optional
// }) =>
//   axiosInstance.get("/v2/attendance/", {
//     params: { user_id, project_id, date, start_date, end_date },
//     headers: { "Content-Type": "application/json" },
//   });



/* ========= GUARD: STAFF & ATTENDANCE (v2) ========= */

// 1) GET /v2/staff/?project_id=36[&q=raj]
export const getStaffByProject = (projectId, q = "") =>
  axiosInstance.get("/v2/staff/", {
    params: { project_id: projectId, q },   // if your API expects `search`, swap to { project_id, search: q }
    headers: { "Content-Type": "application/json" },
  });

// 2) POST /v2/staffs/onboard/  (multipart)
// api.js
export const onboardStaff = ({
  project_id,
  username,                 // NEW
  first_name,
  last_name = "",
  phone_number,
  adharcard_nummber = "",   // keep backend’s exact field name
  photo,                    // File/Blob
}) => {
  const fd = new FormData();
  fd.append("project_id", String(project_id));
  if (username && username.trim()) fd.append("username", username.trim()); // NEW
  fd.append("first_name", first_name.trim());
  if (last_name) fd.append("last_name", last_name.trim());
  fd.append("phone_number", phone_number.trim());
  if (adharcard_nummber) fd.append("adharcard_nummber", adharcard_nummber);

  if (photo) {
    // include a filename so Django/DRF saves with an extension
    const filename = typeof photo.name === "string" ? photo.name : "photo.jpg";
    fd.append("photo", photo, filename);
  }

  // Let Axios set the correct multipart boundary automatically
  return axiosInstance.post("/v2/staffs/onboard/", fd);
};

// export const onboardStaff = ({
//   project_id,
//   first_name,
//   last_name = "",
//   phone_number,
//   adharcard_nummber = "",   // keep backend’s exact field name
//   photo,                    // File/Blob
// }) => {
//   const fd = new FormData();
//   fd.append("project_id", project_id);
//   fd.append("first_name", first_name);
//   if (last_name) fd.append("last_name", last_name);
//   fd.append("phone_number", phone_number);
//   if (adharcard_nummber) fd.append("adharcard_nummber", adharcard_nummber);
//   fd.append("photo", photo);
//   return axiosInstance.post("/v2/staffs/onboard/", fd, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
// };

// 3) POST /v2/attendance/mark/  (multipart)
export const markAttendance = ({
  user_id,
  project_id,
  photo,                 // File/Blob
  lat = null,
  lon = null,
  force_action = null,   // "IN" | "OUT" | null
}) => {
  const fd = new FormData();
  fd.append("user_id", user_id);
  fd.append("project_id", project_id);
  fd.append("photo", photo);
  if (lat != null && lon != null) { fd.append("lat", lat); fd.append("lon", lon); }
  if (force_action) fd.append("force_action", force_action);
  return axiosInstance.post("/v2/attendance/mark/", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// 4) GET /v2/attendance/?user_id=&project_id=&date=YYYY-MM-DD
// or use start_date & end_date
export const listAttendanceByUser = ({ user_id, project_id, date, start_date, end_date }) =>
  axiosInstance.get("/v2/attendance/", {
    params: { user_id, project_id, date, start_date, end_date },
    headers: { "Content-Type": "application/json" },
  });








  // ---- ANALYTICS: Snag stats ----
// GET https://konstruct.world/checklists/stats/snags/?project_id=...
// export const getSnagStats = (project_id, extraParams = {}) =>
//   projectInstance.get("/checklists/stats/snags/", {
//     params: { project_id, ...extraParams }, // accepts optional phase_id, stage_id, date range, etc.
//   });

// // Small helper so both Header and pages resolve project id the same way
// export const resolveActiveProjectId = () => {
//   try {
//     const qp = new URLSearchParams(window.location.search).get("project_id");
//     if (qp) return Number(qp);
//   } catch {}
//   const ls =
//     localStorage.getItem("ACTIVE_PROJECT_ID") ||
//     localStorage.getItem("PROJECT_ID");
//   return Number(ls) || null; // no hardcoded fallback
// };


// ---- ANALYTICS: Snag stats (Checklist service) ----
// If NEWchecklistInstance baseURL is the domain root, keep the leading "/checklists" below.
// If its baseURL already includes "/checklists", change the path to just "/stats/snags/".

export const getSnagStats = (project_id, extraParams = {}) =>
  NEWchecklistInstance.get("/stats/snags/", {
    params: { project_id, ...extraParams },
  });

// Helper so Header and Analytics page resolve project consistently
export const resolveActiveProjectId = () => {
  try {
    const qp = new URLSearchParams(window.location.search).get("project_id");
    if (qp) return Number(qp);
  } catch {}
  const ls =
    localStorage.getItem("ACTIVE_PROJECT_ID") ||
    localStorage.getItem("PROJECT_ID");
  return Number(ls) || null;
};






// ==== FACE TEMPLATE (image enroll) ====
// POST /v2/face/enroll/  (multipart/form-data)
// Use replace=true to overwrite existing templates; omit/false to append.
export const enrollFaceTemplate = ({ user_id, photo, replace = false }) => {
  const fd = new FormData();
  fd.append("user_id", String(user_id));
  if (photo) {
    const filename = typeof photo?.name === "string" ? photo.name : "face.jpg";
    fd.append("photo", photo, filename);
  }
  if (replace) fd.append("replace", "true"); // backend treats presence as true

  // Let Axios set multipart boundary automatically
  return axiosInstance.post("/v2/face/enroll/", fd);
};










// --- USER ACCESS (roles per project) ---
export const getUserAccessForProject = (userId, projectId) =>
  axiosInstance.get("/user-access/", {
    params: { user_id: userId, project_id: projectId },
    headers: {
      "Content-Type": "application/json",
    },
  });



  export const getStagesByPhase = (phaseId) => {
  return projectInstance.get(`/stages/by_phase/${phaseId}/`);
};


export const getQuestionHotspots = (projectId, params = {}) =>
  NEWchecklistInstance.get("stats/questions/", {
    params: { project_id: projectId, ...params },
  });













  export function setActiveProjectId(projectId) {
  if (!projectId) return;
  localStorage.setItem("ACTIVE_PROJECT_ID", String(projectId));
}

// NEW: manager projects by ownership
export function getManagerOwnedProjects(organizationId) {
  return axiosInstance.get(
    "/projects/projects/by_ownership/",
    { params: { organization_id: organizationId } }
  );
}




// ==== MIR (Material Inspection Request) ====

// 1) Create MIR (DRAFT) – same jaisa tumne Postman me kiya
export const createMIR = async (data) =>
  axiosInstance.post("/mir/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

// 2) List MIRs (filters: project_id, only_assigned etc.)
export const listMIRs = async (params = {}) =>
  axiosInstance.get("/mir/", {
    params,
    headers: {
      "Content-Type": "application/json",
    },
  });

// 3) Get single MIR by id
export const getMIRById = async (id) =>
  axiosInstance.get(`/mir/${id}/`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

// 4) Update MIR (PATCH – partial update)
export const updateMIR = async (id, data) =>
  axiosInstance.patch(`/mir/${id}/`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });


export const getProjectUsersForMir = async (projectId) =>
  axiosInstance.get("/user-access-role/", {
    params: { project_id: projectId },
    headers: { "Content-Type": "application/json" },
  });

  // ---- MIR workflow: forward / accept / reject ----

// Forward MIR to another user
// payload = { to_user_id, comment }
export const forwardMIR = async (id, payload) =>
  axiosInstance.post(`/mir/${id}/forward/`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });

// Accept MIR (current_assignee hi kar sakta hai)
// payload optional = { comment }
export const acceptMIR = async (id, payload = {}) =>
  axiosInstance.post(`/mir/${id}/accept/`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });

// Reject MIR (current_assignee hi kar sakta hai)
// payload = { comment }
export const rejectMIR = async (id, payload = {}) =>
  axiosInstance.post(`/mir/${id}/reject/`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });


  export const getMIRDetail = (id) =>
  axiosInstance.get(`/mir/${id}/`, {
    headers: { "Content-Type": "application/json" },
  });


// 👇 MIR ke liye: current creator ke saare users
export const getUsersByCreator = async () =>
  axiosInstance.get("/users-by-creator/", {
    headers: {
      "Content-Type": "application/json",
    },
  });

  // ---- MIR digital signatures ----
// NOTE: formData = new FormData()
// formData.append("signature", file)
// formData.append("name", optionalName)
// formData.append("sign_date", "2025-12-01T10:15:00+05:30") // optional

export const signStoreMIR = async (id, formData) =>
  axiosInstance.post(`/mir/${id}/sign_store/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const signQcMIR = async (id, formData) =>
  axiosInstance.post(`/mir/${id}/sign_qc/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const signProjectInchargeMIR = async (id, formData) =>
  axiosInstance.post(`/mir/${id}/sign_project_incharge/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });





// MIR complete history / timeline
// GET /mir-actions/?mir_id=1
export const getMIRActions = async (mirId) =>
  axiosInstance.get("/mir-actions/", {
    params: { mir_id: mirId },
    headers: {
      "Content-Type": "application/json",
    },
  });






  // MIR ke liye: project ke users laane ka simple API
export const getUsersByProject = (projectId) =>
  axiosInstance.get("/by-project/", {
    params: { project_id: projectId },
    headers: {
      "Content-Type": "application/json",
    },
  });




export const getMyAssignedMIRs = (params = {}) =>
  axiosInstance.get("/mir/", {
    params: {
      only_assigned: 1,
      ...params, // future me pagination, project filter, etc.
    },
  });





export const uploadMIRMaterialImages = (mirId, formData) =>
  axiosInstance.post(`/mir/${mirId}/material-images/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  // ---- MIR SIGNATURE APIs ----
// POST /mir/{id}/sign_store/
export const signMIRStore = (mirId, { name, sign_date, file }) => {
  const fd = new FormData();
  if (file) fd.append("signature", file);        // 👈 file required
  if (name) fd.append("name", name);             // optional
  if (sign_date) fd.append("sign_date", sign_date); // "YYYY-MM-DD" bhi chalega

  return axiosInstance.post(`/mir/${mirId}/sign_store/`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// POST /mir/{id}/sign_qc/
export const signMIRQc = (mirId, { name, sign_date, file }) => {
  const fd = new FormData();
  if (file) fd.append("signature", file);
  if (name) fd.append("name", name);
  if (sign_date) fd.append("sign_date", sign_date);

  return axiosInstance.post(`/mir/${mirId}/sign_qc/`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// POST /mir/{id}/sign_project_incharge/
export const signMIRProjectIncharge = (mirId, { name, sign_date, file }) => {
  const fd = new FormData();
  if (file) fd.append("signature", file);
  if (name) fd.append("name", name);
  if (sign_date) fd.append("sign_date", sign_date);

  return axiosInstance.post(`/mir/${mirId}/sign_project_incharge/`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};







export const uploadMIRAttachments = (mirId, formData) =>
  axiosInstance.post(`/mir/${mirId}/attachments/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });






// Logo upload
export function uploadMIRLogo(mirId, formData) {
  return axiosInstance.post(`/mir/${mirId}/logo/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}



// api.js

export function createMIRFull(formData) {
  // POST /mir/full-create/
  return axiosInstance.post("/mir/full-create/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}


// ✅ MIR PDF export (server generated) with route fallbacks
// ✅ MIR PDF export (server generated) with route fallbacks
export const exportMIRPdf = async (mirId, includeAttachments = true) => {
  const token =
    localStorage.getItem("ACCESS_TOKEN") ||
    localStorage.getItem("access") ||
    localStorage.getItem("accessToken") ||
    "";

  const root = __getApiRoot();
  const qs = `?include_attachments=${includeAttachments ? 1 : 0}`;

  const baseUrls = [
    `${root}/users/mir/${mirId}/export-pdf/`,
    `${root}/api/mir/${mirId}/export-pdf/`,
    `/mir/${mirId}/export-pdf/`,
    `${root}/users/mir/${mirId}/export_pdf/`,
    `${root}/api/mir/${mirId}/export_pdf/`,
    `/mir/${mirId}/export_pdf/`,
  ];

  // ✅ append query to each
  const urls = baseUrls.map((u) => `${u}${qs}`);

  const res = await __getBlobWithFallback(axiosInstance, urls, {
    responseType: "blob",
    headers: token
      ? { Authorization: `Bearer ${token}`, Accept: "application/pdf" }
      : { Accept: "application/pdf" },
  });

  const contentType = res.headers?.["content-type"] || "";
  if (contentType.includes("application/json")) {
    const text = await res.data.text();
    let msg = "MIR PDF export failed";
    try {
      const j = JSON.parse(text);
      msg = j?.detail || j?.message || msg;
    } catch {}
    throw new Error(msg);
  }

  const dispo = res.headers?.["content-disposition"];
  const filename = filenameFromDisposition(dispo) || `MIR_${mirId}.pdf`;

  downloadBlob(res.data, filename);
  return true;
};

// export const exportMIRPdf = async (mirId) => {
//   const token =
//     localStorage.getItem("ACCESS_TOKEN") ||
//     localStorage.getItem("access") ||
//     localStorage.getItem("accessToken") ||
//     "";

//   const root = __getApiRoot();

//   // ✅ try multiple possible routes (because baseURL can be /users or /api)
//   const urls = [
//     `${root}/users/mir/${mirId}/export-pdf/`,
//     `${root}/api/mir/${mirId}/export-pdf/`,
//     `/mir/${mirId}/export-pdf/`,

//     // (optional fallback if someone used underscore in backend)
//     `${root}/users/mir/${mirId}/export_pdf/`,
//     `${root}/api/mir/${mirId}/export_pdf/`,
//     `/mir/${mirId}/export_pdf/`,
//   ];

//   const res = await __getBlobWithFallback(axiosInstance, urls, {
//     responseType: "blob",
//     headers: token ? { Authorization: `Bearer ${token}`, Accept: "application/pdf" } : { Accept: "application/pdf" },
//   });

//   // ✅ If backend returns JSON error inside blob
//   const contentType = res.headers?.["content-type"] || "";
//   if (contentType.includes("application/json")) {
//     const text = await res.data.text();
//     let msg = "MIR PDF export failed";
//     try {
//       const j = JSON.parse(text);
//       msg = j?.detail || j?.message || msg;
//     } catch {}
//     throw new Error(msg);
//   }

//   const dispo = res.headers?.["content-disposition"];
//   const filename = filenameFromDisposition(dispo) || `MIR_${mirId}.pdf`;

//   downloadBlob(res.data, filename);
//   return true;
// };




// ==== FORMS ENGINE (Dynamic Forms) ====

export const listFormTemplates = () =>
  axiosInstance.get("/forms/templates/", {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const createFormTemplate = (payload) =>
  axiosInstance.post("/forms/templates/", payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const updateFormTemplate = (id, payload) =>
  axiosInstance.patch(`/forms/templates/${id}/`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const createFormTemplateVersion = (payload) =>
  axiosInstance.post("/forms/template-versions/", payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });



  // NEW: Excel → schema preview
export const previewFormExcel = (file) => {
  const fd = new FormData();
  fd.append("file", file);
  return axiosInstance.post("/forms/excel/preview/", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};




// ---- Form Packs (bundles) ----

export const listFormPacks = () =>
  axiosInstance.get("/forms/packs/", {
    headers: { "Content-Type": "application/json" },
  });

export const createFormPack = (payload) =>
  axiosInstance.post("/forms/packs/", payload, {
    headers: { "Content-Type": "application/json" },
  });

export const updateFormPack = (id, payload) =>
  axiosInstance.patch(`/forms/packs/${id}/`, payload, {
    headers: { "Content-Type": "application/json" },
  });

export const deleteFormPack = (id) =>
  axiosInstance.delete(`/forms/packs/${id}/`, {
    headers: { "Content-Type": "application/json" },
  });

export const createFormPackItem = (payload) =>
  axiosInstance.post("/forms/pack-items/", payload, {
    headers: { "Content-Type": "application/json" },
  });

export const deleteFormPackItem = (id) =>
  axiosInstance.delete(`/forms/pack-items/${id}/`, {
    headers: { "Content-Type": "application/json" },
  });

// Apply packs → project
export const applyFormPacksToProject = (payload) =>
  axiosInstance.post("/forms/packs/apply-to-project/", payload, {
    headers: { "Content-Type": "application/json" },
  });

// Project ke liye assigned forms
// export const getAssignedFormsForProject = (projectId, usageType) =>
//   axiosInstance.get("/forms/assigned/", {
//     params: {
//       project_id: projectId,
//       ...(usageType ? { usage_type: usageType } : {}),
//     },
//     headers: { "Content-Type": "application/json" },
//   });

// ✅ replace old version with this:
// Project ke liye assigned forms
// extraParams me usage_type, assignment_id, etc sab bhej sakte ho
export const getAssignedFormsForProject = (projectId, extraParams = {}) =>
  axiosInstance.get("/forms/assigned/", {
    params: {
      project_id: projectId,
      ...extraParams,
    },
    headers: { "Content-Type": "application/json" },
  });


export const createFormResponse = (payload) =>
  axiosInstance.post("/forms/responses/", payload, {
    headers: { "Content-Type": "application/json" },
  });




  // GET /users/forms/responses/:id/
export const getFormResponse = (id) =>
  axiosInstance.get(`/forms/responses/${id}/`);

// POST /users/forms/responses/:id/forward/
export const forwardFormResponse = (id, payload) =>
  axiosInstance.post(`/forms/responses/${id}/forward/`, payload);


// GET /users/forms/responses/
export const listMyFormResponses = (params = {}) =>
  axiosInstance.get("/forms/responses/", {
    params,
    headers: { "Content-Type": "application/json" },
  });



  // api.js

export async function getFormTask(taskId) {
  const { data } = await axiosInstance.get(`/forms/tasks/${taskId}/`);
  return data;
}

export async function saveFormTask(taskId, payload) {
  // expects { data: {...} }
  const { data } = await axiosInstance.patch(`/forms/tasks/${taskId}/`, payload);
  return data;
}

export async function forwardFormTask(taskId, payload) {
  // expects { to_user_id: 123 }
  const { data } = await axiosInstance.post(`/forms/tasks/${taskId}/forward/`, payload);
  return data;
}

// GET /users/forms/tasks/
export const listFormTasks = (params = {}) =>
  axiosInstance.get("/forms/tasks/", { params });



// PATCH /users/forms/responses/:id/
export const updateFormResponse = (id, payload) =>
  axiosInstance.patch(`/forms/responses/${id}/`, payload, {
    headers: { "Content-Type": "application/json" },
  });









//wir
// ==== WIR (Work Inspection Request) ====

// Create WIR (basic JSON create)
export const createWIR = async (data) =>
  axiosInstance.post("/wir/", data, {
    headers: { "Content-Type": "application/json" },
  });

// List WIRs
export const listWIRs = async (params = {}) =>
  axiosInstance.get("/wir/", {
    params,
    headers: { "Content-Type": "application/json" },
  });

// Get WIR by id
export const getWIRById = async (id) =>
  axiosInstance.get(`/wir/${id}/`, {
    headers: { "Content-Type": "application/json" },
  });

// Update WIR
export const updateWIR = async (id, data) =>
  axiosInstance.patch(`/wir/${id}/`, data, {
    headers: { "Content-Type": "application/json" },
  });

// Forward / Accept / Reject (same pattern as MIR)
export const forwardWIR = async (id, payload) =>
  axiosInstance.post(`/wir/${id}/forward/`, payload, {
    headers: { "Content-Type": "application/json" },
  });

export const acceptWIR = async (id, payload = {}) =>
  axiosInstance.post(`/wir/${id}/accept/`, payload, {
    headers: { "Content-Type": "application/json" },
  });

export const rejectWIR = async (id, payload = {}) =>
  axiosInstance.post(`/wir/${id}/reject/`, payload, {
    headers: { "Content-Type": "application/json" },
  });

// Two signatures only
// export const signWIRContractor = (wirId, { name, sign_date, file }) => {
//   const fd = new FormData();
//   if (file) fd.append("signature", file);
//   if (name) fd.append("name", name);
//   if (sign_date) fd.append("sign_date", sign_date);

//   return axiosInstance.post(`/wir/${wirId}/sign_contractor/`, fd, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
// };
export const signWIRContractor = (wirId, { name, sign_date, file }) => {
  const fd = new FormData();

  // backend commonly expects "signature"
  if (file) {
    const filename = typeof file?.name === "string" ? file.name : "signature.png";
    fd.append("signature", file, filename);

    // (safe fallback) some backends may expect "file"
    // will not break if ignored
    fd.append("file", file, filename);
  }

  if (name) fd.append("name", name);
  if (sign_date) fd.append("sign_date", sign_date);

  const root = __getApiRoot();

  // ✅ try absolute routes first (bypass axios baseURL /api)
  const urls = [
    `${root}/users/wir/${wirId}/sign-contractor/`,
    `${root}/api/wir/${wirId}/sign-contractor/`, // just in case
    `/wir/${wirId}/sign-contractor/`,            // if axios baseURL already /users
  ];

  return __postMultipartWithFallback(axiosInstance, urls, fd);
};

export const signWIRInspector = (wirId, { name, sign_date, file }) => {
  const fd = new FormData();

  if (file) {
    const filename = typeof file?.name === "string" ? file.name : "signature.png";
    fd.append("signature", file, filename);
    fd.append("file", file, filename); // fallback
  }

  if (name) fd.append("name", name);
  if (sign_date) fd.append("sign_date", sign_date);

  const root = __getApiRoot();

  const urls = [
    `${root}/users/wir/${wirId}/sign-inspector/`,
    `${root}/api/wir/${wirId}/sign-inspector/`,
    `/wir/${wirId}/sign-inspector/`,
  ];

  return __postMultipartWithFallback(axiosInstance, urls, fd);
};

// export const signWIRInspector = (wirId, { name, sign_date, file }) => {
//   const fd = new FormData();
//   if (file) fd.append("signature", file);
//   if (name) fd.append("name", name);
//   if (sign_date) fd.append("sign_date", sign_date);

//   return axiosInstance.post(`/wir/${wirId}/sign_inspector/`, fd, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
// };

// Full create (data JSON + files)
export function createWIRFull(formData) {
  return axiosInstance.post("/wir/full-create/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}






// ==== WIR (Work Inspection Request) ====

// List my assigned WIRs (same pattern as MIR)
export const getMyAssignedWIRs = (params = {}) =>
  axiosInstance.get("/wir/", {
    params: { only_assigned: 1, ...params },
  });





  // ==== WIR ====



export const uploadWIRAttachments = (id, formData) =>
  axiosInstance.post(`/wir/${id}/attachments/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });



export const signWIRStore = (id, { name, sign_date, file }) => {
  const fd = new FormData();
  if (name) fd.append("name", name);
  if (sign_date) fd.append("sign_date", sign_date);
  fd.append("file", file);
  return axiosInstance.post(`/wir/${id}/sign-store/`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const signWIRQc = (id, { name, sign_date, file }) => {
  const fd = new FormData();
  if (name) fd.append("name", name);
  if (sign_date) fd.append("sign_date", sign_date);
  fd.append("file", file);
  return axiosInstance.post(`/wir/${id}/sign-qc/`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const signWIRProjectIncharge = (id, { name, sign_date, file }) => {
  const fd = new FormData();
  if (name) fd.append("name", name);
  if (sign_date) fd.append("sign_date", sign_date);
  fd.append("file", file);
  return axiosInstance.post(`/wir/${id}/sign-project-incharge/`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ✅ One endpoint, 3 fields supported: client_logo / pmc_logo / contractor_logo
export const uploadWIRLogos = (id, formData) =>
  axiosInstance.post(`/wir/${id}/logos/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });









export const exportWIRPdf = async (wirId, includeAttachments = true) => {
  const res = await axiosInstance.get(`/wir/${wirId}/export-pdf/`, {
    params: { include_attachments: includeAttachments ? 1 : 0 },
    responseType: "blob",
  });

  // agar backend error JSON bhej de blob me
  const contentType = res.headers?.["content-type"] || "";
  if (contentType.includes("application/json")) {
    const text = await res.data.text();
    let msg = "Export failed";
    try { msg = JSON.parse(text)?.detail || msg; } catch {}
    throw new Error(msg);
  }

  const dispo = res.headers?.["content-disposition"];
  const filename = filenameFromDisposition(dispo) || `WIR_${wirId}.pdf`;
  downloadBlob(res.data, filename);

  return true;
};








// ✅ DASHBOARD: Unit Stage Role Summary (Top counters)

const __pickToken = () =>
  localStorage.getItem("ACCESS_TOKEN") ||
  localStorage.getItem("access") ||
  localStorage.getItem("accessToken") ||
  "";

const __clean = (v) => {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  if (!s || ["null", "none", "undefined"].includes(s.toLowerCase())) return null;
  return v;
};

const __toCsv = (v) => {
  if (v === null || v === undefined) return null;
  if (Array.isArray(v)) {
    const arr = v
      .map((x) => __clean(x))
      .filter((x) => x !== null && x !== undefined)
      .map((x) => String(x).trim())
      .filter(Boolean);
    return arr.length ? arr.join(",") : null;
  }
  return __clean(v);
};

const __buildSummaryParams = (p = {}) => {
  // supports: project_id(s), stage_id(s), building_id(s)/tower_id(s), unit_id(s)/flat_id(s), pending_from
  const params = {};

  // mandatory
  const project = __toCsv(p.project_id ?? p.project_ids);
  if (!project) throw new Error("project_id is required");
  params.project_id = project;

  const stage = __toCsv(p.stage_id ?? p.stage_ids);
  if (stage) params.stage_id = stage;

  const building = __toCsv(
    p.building_id ?? p.building_ids ?? p.tower_id ?? p.tower_ids
  );
  if (building) params.building_id = building;

  const unit = __toCsv(p.unit_id ?? p.unit_ids ?? p.flat_id ?? p.flat_ids);
  if (unit) params.unit_id = unit;

  const pendingFrom = __toCsv(
    p.pending_from ?? p.pending_from_roles ?? p.role ?? p.roles
  );
  if (pendingFrom) params.pending_from = pendingFrom;

  // passthrough flags
  if (p.debug != null) params.debug = p.debug;
  if (p.export != null) params.export = p.export;

  return params;
};

// ✅ JSON fetch
export const getUnitStageRoleSummary = async (payload = {}) => {
  const token = __pickToken();
  const params = __buildSummaryParams(payload);

  return NEWchecklistInstance.get("/api/dashboard/unit-stage-role-summary/", {
    params,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
};

// ✅ Excel export download (direct)
export const exportUnitStageRoleSummaryExcel = async (
  payload = {},
  filename = "unit_stage_role_summary.xlsx"
) => {
  const token = __pickToken();
  const params = { ...__buildSummaryParams(payload), export: true };

  const res = await NEWchecklistInstance.get(
    "/api/dashboard/unit-stage-role-summary/",
    {
      params,
      responseType: "blob",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  );

  // try filename from header
  const dispo = res.headers?.["content-disposition"];
  const name =
    filenameFromDisposition(dispo) ||
    `unit_stage_role_summary_${new Date().toISOString().slice(0, 10)}.xlsx`;

  downloadBlob(res.data, name);
  return true;
};










// ✅ WIP Breakdown (counts + optional rows)
export const getUnitWorkInProgressBreakdown = (params = {}) =>
  NEWchecklistInstance.get("/api/unit-work-in-progress-breakdown/", { params });

// ✅ WIP Breakdown Excel export
export const exportUnitWorkInProgressBreakdownExcel = async (
  params = {},
  filename = "unit_work_in_progress_breakdown.xlsx"
) => {
  const res = await NEWchecklistInstance.get("/api/unit-work-in-progress-breakdown/", {
    params: { ...params, export: true },   // ✅ keep include_rows/limit from params
    responseType: "blob",
  });

  const dispo = res.headers?.["content-disposition"];
  const name =
    filenameFromDisposition(dispo) ||
    `unit_wip_breakdown_${new Date().toISOString().slice(0, 10)}.xlsx`;

  downloadBlob(res.data, name);
  return true;
};

// ✅ Unit Checklist Report (JSON)
export const getUnitChecklistReport = (params = {}) =>
  NEWchecklistInstance.get("/unit-checklist-report/", { params });

// ✅ Unit Checklist Report Excel export (server generated)
export const exportUnitChecklistReportExcel = async (params = {}) => {
  const token =
    localStorage.getItem("ACCESS_TOKEN") ||
    localStorage.getItem("access") ||
    localStorage.getItem("accessToken") ||
    "";

  const res = await NEWchecklistInstance.get("/unit-checklist-report/", {
    params: { ...params, export: true },
    responseType: "blob",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  // ✅ If backend returns JSON error inside blob
  const contentType = res.headers?.["content-type"] || "";
  if (contentType.includes("application/json")) {
    const text = await res.data.text();
    let msg = "Export failed";
    try {
      const j = JSON.parse(text);
      msg = j?.detail || j?.message || msg;
    } catch {}
    throw new Error(msg);
  }

  const dispo = res.headers?.["content-disposition"];
  const name =
    filenameFromDisposition(dispo) ||
    `unit_checklist_report_${new Date().toISOString().slice(0, 10)}.xlsx`;

  downloadBlob(res.data, name);
  return true;
};


export const exportFormResponsePdf = async (responseId, { mode = "grid" } = {}) => {
  const token =
    localStorage.getItem("ACCESS_TOKEN") ||
    localStorage.getItem("TOKEN") ||
    localStorage.getItem("token") ||
    "";

  const root = __getApiRoot();

  // ✅ try multiple possible routes (because your axios baseURL can be /users or /api)
  const urls = [
    `${root}/users/forms/responses/${responseId}/export-pdf/`,
    `${root}/api/forms/responses/${responseId}/export-pdf/`,
    `/forms/responses/${responseId}/export-pdf/`,
  ];

  const res = await __getBlobWithFallback(axiosInstance, urls, {
    params: { mode },
    responseType: "blob",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  // ✅ If backend returns JSON error inside blob
  const contentType = res.headers?.["content-type"] || "";
  if (contentType.includes("application/json")) {
    const text = await res.data.text();
    let msg = "PDF export failed";
    try {
      msg = JSON.parse(text)?.detail || JSON.parse(text)?.message || msg;
    } catch {}
    throw new Error(msg);
  }

  const dispo = res.headers?.["content-disposition"];
  const filename =
    filenameFromDisposition(dispo) || `response_${responseId}.pdf`;

  downloadBlob(res.data, filename);
  return true;
};


// ✅ FORMS: Export Response PDF (blob) with route fallbacks
// export const exportFormResponsePdf = async (responseId, params = {}) => {
//   const root = __getApiRoot();
//   const token = __pickToken();

//   // ✅ first try RELATIVE (because axiosInstance baseURL likely already /users)
//   const urls = [
//     `/forms/responses/${responseId}/export-pdf/`,
//     `/forms/responses/${responseId}/export_pdf/`,     // just in case backend uses underscore
//     `${root}/users/forms/responses/${responseId}/export-pdf/`,
//     `${root}/api/forms/responses/${responseId}/export-pdf/`,
//   ];

//   let lastErr = null;

//   for (const url of urls) {
//     try {
//       const res = await axiosInstance.get(url, {
//         params,                 // { mode: "grid" } etc
//         responseType: "blob",   // ✅ MUST
//         headers: {
//           ...(token ? { Authorization: `Bearer ${token}` } : {}),
//           Accept: "application/pdf",
//         },
//       });

//       // ✅ If backend returns JSON error inside blob
//       const contentType = res.headers?.["content-type"] || "";
//       if (contentType.includes("application/json")) {
//         const text = await res.data.text();
//         let msg = "Export failed";
//         try {
//           const j = JSON.parse(text);
//           msg = j?.detail || j?.message || msg;
//         } catch {}
//         throw new Error(msg);
//       }

//       const dispo = res.headers?.["content-disposition"];
//       const filename =
//         filenameFromDisposition(dispo) || `form_response_${responseId}.pdf`;

//       downloadBlob(res.data, filename);
//       return true;
//     } catch (err) {
//       lastErr = err;

//       const status = err?.response?.status;
//       // fallback only if route not found
//       if (status && status !== 404) throw err;
//       if (!err?.response) throw err; // network error -> stop
//     }
//   }

//   throw lastErr;
// };


// // --- ADD THIS IN api.js ---

// import axios from "axios";

// const CHECKLIST_BASE_URL = "https://konstruct.world/checklists";

// // small axios client for checklist service
// const checklistClient = axios.create({
//   baseURL: CHECKLIST_BASE_URL,
// });

// // attach token automatically
// checklistClient.interceptors.request.use((config) => {
//   const token =
//     localStorage.getItem("accessToken") ||
//     localStorage.getItem("ACCESS_TOKEN") ||
//     localStorage.getItem("token");

//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   config.headers.Accept = "application/json";
//   return config;
// });

// // helpers for download
// // const filenameFromDisposition = (dispo) => {
// //   try {
// //     if (!dispo) return null;
// //     const m = String(dispo).match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i);
// //     if (!m || !m[1]) return null;
// //     return decodeURIComponent(m[1]);
// //   } catch {
// //     return null;
// //   }
// // };

// // const downloadBlob = (blob, filename) => {
// //   const url = window.URL.createObjectURL(blob);
// //   const a = document.createElement("a");
// //   a.href = url;
// //   a.download = filename || "report.xlsx";
// //   document.body.appendChild(a);
// //   a.click();
// //   a.remove();
// //   window.URL.revokeObjectURL(url);
// // };

// // ✅ JSON response (optional use)
// export const getUnitChecklistReport = (params = {}) => {
//   return checklistClient.get("/api/unit-checklist-report/", { params });
// };

// // ✅ Excel download (this is what you need)
// export const exportUnitChecklistReportExcel = async (params = {}) => {
//   const res = await checklistClient.get("/api/unit-checklist-report/", {
//     params: { ...params, export: true },
//     responseType: "blob",
//   });

//   const dispo = res.headers?.["content-disposition"];
//   const name =
//     filenameFromDisposition(dispo) ||
//     `unit_checklist_report_${new Date().toISOString().slice(0, 10)}.xlsx`;

//   downloadBlob(res.data, name);
//   return true;
// };



const API_BASE = "https://konstruct.world/checklists";


const authHeaders = () => ({
  Authorization: `Bearer ${
    localStorage.getItem("ACCESS_TOKEN") ||
    localStorage.getItem("TOKEN") ||
    localStorage.getItem("token") ||
    ""
  }`,
});


// ✅ SCHEDULING (Checklist service)
// POST https://konstruct.world/checklists/api/scheduling/schedules/create/
export const createChecklistSchedule = (payload) =>
  NEWchecklistInstance.post("/scheduling/schedules/create/", payload, {
    headers: { "Content-Type": "application/json" },
  });


  export const myProjectSchedules = (projectId) => {
  return axios.get(`${API_BASE}/scheduling/my/`, {
    params: { project_id: projectId },
    headers: authHeaders(),
  });
};

// (optional) NEW List API: /api/scheduling/list/?project_id=118
export const listProjectSchedules = (projectId) => {
  return axios.get(`${API_BASE}/scheduling/list/`, {
    params: { project_id: projectId },
    headers: authHeaders(),
  });
};


// export const getSchedulingSetup = (projectId, params = {}) => {
//   return NEWchecklistInstance.get("/scheduling/setup/", {
//     params: { project_id: projectId, ...params },
//   });
// };
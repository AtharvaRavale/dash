// src/components/ProjectFormsAssignedPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  getAssignedFormsForProject,
  getProjectsForCurrentUser,
} from "../api";
import { useNavigate } from "react-router-dom";

// same logic as sidebar
function getAllUserRoles() {
  const userString = localStorage.getItem("USER_DATA");
  if (!userString || userString === "undefined") return [];
  try {
    const userData = JSON.parse(userString);
    let roles = [];

    if (typeof userData.role === "string") roles.push(userData.role);
    if (Array.isArray(userData.roles)) {
      userData.roles.forEach((r) => {
        if (typeof r === "string") roles.push(r);
        else if (r && typeof r === "object" && r.role) roles.push(r.role);
      });
    }
    if (Array.isArray(userData.accesses)) {
      userData.accesses.forEach((a) =>
        Array.isArray(a.roles) &&
        a.roles.forEach((r) => {
          if (typeof r === "string") roles.push(r);
          else if (r && typeof r === "object" && r.role) roles.push(r.role);
        })
      );
    }
    if (userData.superadmin) roles.push("Super Admin");
    if (userData.is_manager) roles.push("Manager");
    if (userData.is_client === false) roles.push("Admin");
    return [...new Set(roles)];
  } catch {
    return [];
  }
}

const ProjectFormsAssignedPage = () => {
  const navigate = useNavigate();

  const [projectId, setProjectId] = useState("");
  const [projectOptions, setProjectOptions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [filterUsageType, setFilterUsageType] = useState("");

  const userRoles = useMemo(
    () => getAllUserRoles().map((r) => String(r).toUpperCase()),
    []
  );

  // STEP 1: load projects for current user (admin/manager ko yahi se milega)
  useEffect(() => {
    const loadProjects = async () => {
      setProjectsLoading(true);
      try {
        const res = await getProjectsForCurrentUser();
        const raw = res.data || res;
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw.results)
          ? raw.results
          : [];

        const mapped = list.map((p) => ({
          id: p.id,
          name:
            p.name ||
            p.project_name ||
            p.project_title ||
            `Project #${p.id}`,
        }));

        setProjectOptions(mapped);
        if (mapped.length) {
          setProjectId(String(mapped[0].id));
        }
      } catch (err) {
        console.error("Failed to load projects (forms page)", err);
        toast.error("Failed to load projects");
      } finally {
        setProjectsLoading(false);
      }
    };

    loadProjects();
  }, []);

  // STEP 2: load assigned forms for selected project
  useEffect(() => {
    if (!projectId) {
      setAssignments([]);
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const res = await getAssignedFormsForProject(projectId);
        setAssignments(res.data || []);
      } catch (err) {
        console.error("Failed to load assigned forms", err);
        toast.error("Failed to load project forms");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [projectId]);

  const filteredAssignments = useMemo(() => {
    return (assignments || []).filter((a) => {
      if (!a.is_active) return false;
      if (filterUsageType && a.usage_type !== filterUsageType) return false;

      const allowedRoles = (a.visible_to_roles || []).map((r) =>
        String(r).toUpperCase()
      );
      if (!allowedRoles.length) return true; // visible to all

      return allowedRoles.some((r) => userRoles.includes(r));
    });
  }, [assignments, filterUsageType, userRoles]);

  const groupedByUsage = useMemo(() => {
    const groups = {};
    filteredAssignments.forEach((a) => {
      const key = a.usage_type || "GENERAL";
      if (!groups[key]) groups[key] = [];
      groups[key].push(a);
    });
    return groups;
  }, [filteredAssignments]);

  const usageTypes = useMemo(() => {
    const set = new Set();
    assignments.forEach((a) => {
      if (a.usage_type) set.add(a.usage_type);
    });
    return Array.from(set);
  }, [assignments]);

 const handleFillForm = (assignment) => {
  const tv = assignment.template_version_detail;
  navigate(
    `/project-forms/fill?project_id=${projectId}&assignment_id=${assignment.id}`,
    { state: { assignment, projectId } }   // ✅ fast path
  );
};

  // ------------- RENDER -------------

  if (projectsLoading) {
    return (
      <div className="p-4 text-sm text-gray-600">
        <h1 className="text-lg font-semibold mb-1">Project Forms</h1>
        <p>Loading your projects...</p>
      </div>
    );
  }

  if (!projectOptions.length) {
    return (
      <div className="p-4 text-sm text-gray-600">
        <h1 className="text-lg font-semibold mb-1">Project Forms</h1>
        <p>No projects available for your account.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header + project selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold">Project Forms</h1>
          <p className="text-xs text-gray-500">
            Forms assigned to this project via packs/manual assignments. Fill and
            manage as per your role.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500">Project:</span>
          <select
            className="border rounded px-2 py-1 text-xs bg-white"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            {projectOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (#{p.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between text-xs gap-2">
        <div>
          <span className="text-gray-500 mr-2">Filter by usage:</span>
          <select
            className="border rounded px-2 py-1 text-xs"
            value={filterUsageType}
            onChange={(e) => setFilterUsageType(e.target.value)}
          >
            <option value="">All</option>
            {usageTypes.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
        <div className="text-gray-500">
          Total forms visible for your roles:{" "}
          <strong>{filteredAssignments.length}</strong>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Loading forms...</div>
      ) : Object.keys(groupedByUsage).length === 0 ? (
        <div className="text-sm text-gray-500">
          No forms assigned to this project (or not visible for your roles).
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedByUsage).map(([usage, items]) => (
            <div key={usage} className="border rounded-md bg-white p-3">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-semibold">
                  {usage === "GENERAL" ? "General Forms" : `${usage} Forms`}
                </h2>
                <span className="text-[11px] text-gray-500">
                  {items.length} form{items.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {items.map((a) => {
                  const tv = a.template_version_detail || {};
                  const tpl = tv.template_detail || {};
                  const formName =
                    tpl.name || tv.title || `Form v${tv.version || "-"}`;
                  const formCode = tpl.code;

                  return (
                    <div
                      key={a.id}
                      className="border border-gray-100 rounded-md p-2 text-xs bg-gray-50"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <div className="font-semibold truncate">
                          {formName}
                        </div>
                        {formCode && (
                          <span className="ml-2 px-1.5 py-0.5 bg-white border rounded-full text-[10px]">
                            {formCode}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-500 mb-1">
                        Usage:{" "}
                        <span className="font-mono">
                          {a.usage_type || "GENERAL"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex flex-wrap gap-1">
                          {a.is_required ? (
                            <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px]">
                              Required
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px]">
                              Optional
                            </span>
                          )}
                          {(a.visible_to_roles || []).length ? (
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px]">
                              Roles: {a.visible_to_roles.join(", ")}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px]">
                              Visible to all roles
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => handleFillForm(a)}
                          className="text-[11px] text-blue-600 hover:underline"
                        >
                          Fill form
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectFormsAssignedPage;

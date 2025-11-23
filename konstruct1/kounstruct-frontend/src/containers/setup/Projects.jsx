import React, { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { showToast } from "../../utils/toast";
import projectImage from "../../Images/Project.png";
import AddProjectModal from "./AddProjectModal";
import {
  Allprojects,
  getProjectsByOwnership,
  getProjectUserDetails,
} from "../../api";
import { setProjects, setSelectedProject } from "../../store/userSlice";
import { useTheme } from "../../ThemeContext";

// Helper: Decode JWT
function decodeJWT(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

const PROJECTS_PER_PAGE = 5;

function Projects({ onProjectSetupComplete }) {
  const dispatch = useDispatch();
  const { theme } = useTheme();

  const [projects, setProjectsLocal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  // Only Super Admin can add project
  const role =
    localStorage.getItem("ROLE") ||
    (localStorage.getItem("USER_DATA") &&
      JSON.parse(localStorage.getItem("USER_DATA"))?.role) ||
    "";
  const canAddProject = role === "Super Admin" || role === "Admin";

  // THEME palette
  const palette =
    theme === "dark"
      ? {
          bg: "bg-[#181820]",
          card: "bg-[#23232e] border border-amber-400/40 shadow-xl",
          gridBg: "bg-[#23232e]",
          nameBg: "bg-amber-900/80 text-yellow-100",
          btnBorder: "border-yellow-400 text-yellow-400",
          btnText: "text-yellow-300",
          plusBorder: "border-yellow-400",
        }
      : {
          bg: "bg-white",
          card: "bg-white border border-orange-200 shadow-lg",
          gridBg: "bg-white",
          nameBg: "bg-gray-800 bg-opacity-50 text-white",
          btnBorder: "border-orange-300 text-orange-500",
          btnText: "text-orange-700",
          plusBorder: "border-red-500",
        };

  // Fetch projects (matches Configuration page)
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    let userData = null;
    try {
      const userDataStr = localStorage.getItem("USER_DATA");
      if (userDataStr) {
        userData = JSON.parse(userDataStr);
      } else {
        const token =
          localStorage.getItem("ACCESS_TOKEN") ||
          localStorage.getItem("TOKEN") ||
          localStorage.getItem("token");
        if (token) userData = decodeJWT(token);
      }
    } catch {}

    const rolee =
      localStorage.getItem("ROLE") ||
      userData?.role ||
      userData?.roles?.[0] ||
      "";

    const isManager = userData?.is_manager;

    try {
      let response = null;
      if (rolee === "Super Admin") {
        response = await Allprojects();
      } else if (rolee === "Admin") {
        response = await getProjectUserDetails();
      } else if (isManager) {
        if (userData.entity_id) {
          response = await getProjectsByOwnership({
            entity_id: userData.entity_id,
          });
        } else if (userData.company_id) {
          response = await getProjectsByOwnership({
            company_id: userData.company_id,
          });
        } else if (userData.org || userData.organization_id) {
          const orgId = userData.org || userData.organization_id;
          response = await getProjectsByOwnership({ organization_id: orgId });
        } else {
          showToast(
            "No entity, company, or organization found for this manager.",
            "error"
          );
          setProjectsLocal([]);
          setLoading(false);
          return;
        }
      }

      if (response && response.status === 200) {
        setProjectsLocal(
          Array.isArray(response.data)
            ? response.data
            : response.data.results || []
        );
        dispatch(
          setProjects(
            Array.isArray(response.data)
              ? response.data
              : response.data.results || []
          )
        );
      } else if (response) {
        showToast(
          response.data?.message || "Failed to fetch projects.",
          "error"
        );
        setProjectsLocal([]);
        dispatch(setProjects([]));
      } else {
        // Fallback for other users
        const token =
          localStorage.getItem("ACCESS_TOKEN") ||
          localStorage.getItem("TOKEN") ||
          localStorage.getItem("token");
        if (token) {
          const data = decodeJWT(token);
          if (data && Array.isArray(data.accesses)) {
            const uniqueProjects = [];
            const seenIds = new Set();
            data.accesses.forEach((access) => {
              if (access.project_id && !seenIds.has(access.project_id)) {
                uniqueProjects.push({
                  id: access.project_id,
                  project_name: access.project_name,
                  roles: access.roles,
                });
                seenIds.add(access.project_id);
              }
            });
            setProjectsLocal(uniqueProjects);
            dispatch(setProjects(uniqueProjects));
          } else {
            setProjectsLocal([]);
            dispatch(setProjects([]));
          }
        } else {
          setProjectsLocal([]);
          dispatch(setProjects([]));
        }
      }
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Error fetching projects.",
        "error"
      );
      setProjectsLocal([]);
      dispatch(setProjects([]));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  // Initial fetch
  useEffect(() => {
    fetchProjects();
    dispatch(setSelectedProject(null));
    setCurrentPage(1);
    // eslint-disable-next-line
  }, [fetchProjects]);

  // When a project is added, re-fetch projects and call onProjectSetupComplete
  const addProject = async (id) => {
    await fetchProjects();
    onProjectSetupComplete(id);
  };

  // ---- Filtered & Paginated Data ----
  const filteredProjects = projects.filter((project) => {
    const name = project?.name || project?.project_name || "";
    return name.toLowerCase().includes(search.toLowerCase());
  });
  const totalPages = Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * PROJECTS_PER_PAGE,
    currentPage * PROJECTS_PER_PAGE
  );

  // Reset page if search/filter makes current page out of bounds
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
    // eslint-disable-next-line
  }, [search, filteredProjects.length, totalPages]);

  return (
    <div
      className={`w-full rounded-md ${palette.bg} gap-4 flex items-start justify-between my-1 transition-colors duration-300`}
      style={{ minHeight: 0 }}
    >
      <div className="w-full p-5 rounded flex flex-col" style={{ minHeight: 0 }}>
        {/* --- Search Bar --- */}
        <div className="mb-5 flex items-center justify-between">
          <input
            className={`w-80 px-4 py-2 rounded-lg border ${
              theme === "dark"
                ? "bg-[#23232c] border-amber-400/40 text-yellow-100 placeholder:text-yellow-300"
                : "bg-white border-orange-200 text-gray-700 placeholder:text-orange-500"
            } focus:outline-none text-lg font-medium shadow`}
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            autoComplete="off"
          />
        </div>
        {/* Project Grid with pagination */}
        <div
          style={{
            borderRadius: 20,
            overflow: "hidden",
            background: palette.gridBg.includes("bg-") ? undefined : palette.gridBg,
            boxShadow: "0 6px 32px #0002",
            border: theme === "dark" ? "1px solid #444" : "1px solid #eee",
            width: "100%",
            minHeight: 320,
          }}
        >
          <div
            className="grid project-grid w-full"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1.5rem",
              background: "inherit",
              minHeight: 240,
              padding: "2rem 1rem"
            }}
          >
            {loading ? (
              <div className="flex justify-center items-center py-14 text-lg w-full">
                <svg
                  className="animate-spin h-8 w-8 text-purple-500 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Loading projects...
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-10 text-xl font-semibold text-red-400 w-full">
                No projects found.
              </div>
            ) : (
              <>
                {paginatedProjects.map((project) => (
                  <button
                    key={project?.id}
                    className={`relative ${palette.card} rounded-xl w-56 h-56 transition-all duration-300`}
                    onClick={() => onProjectSetupComplete(project)}
                    style={{ overflow: "hidden" }}
                  >
                    <img
                      src={project?.image_url || projectImage}
                      alt="project"
                      className="w-56 h-56 object-cover rounded-t-xl"
                      onError={e => { e.target.src = projectImage; }}
                      style={{
                        opacity: "0.92",
                        borderTopLeftRadius: "12px",
                        borderTopRightRadius: "12px"
                      }}
                    />
                    <div
                      className={`absolute bottom-0 left-0 right-0 w-full flex justify-start items-center px-4`}
                      style={{
                        minHeight: 44,
                        fontWeight: 700,
                        fontSize: "1.15rem",
                        letterSpacing: ".5px",
                        textShadow: "0 2px 6px #000c",
                        borderBottomLeftRadius: 12,
                        borderBottomRightRadius: 12,
                        textTransform: "capitalize",
                        zIndex: 2,
                        background: "rgba(36, 39, 50, 0.70)",
                        color: "#fff",
                        backdropFilter: "blur(4px)",
                        WebkitBackdropFilter: "blur(4px)",
                        boxSizing: "border-box",
                      }}
                    >
                      {project?.name || project?.project_name || `Project ${project.id}`}
                    </div>
                  </button>
                ))}
                {/* Add Project Card: Only for Super Admin */}
                {canAddProject && (
                  <div
                    className={`flex items-center justify-center ${palette.card} w-56 h-60 rounded-xl transition-all duration-300`}
                  >
                    <button
                      className={`text-xl font-bold flex flex-col items-center gap-2 ${palette.btnText}`}
                      onClick={() => setIsModalOpen(true)}
                    >
                      <span
                        className={`flex justify-center items-center w-10 h-10 border border-dashed ${palette.plusBorder} rounded-full text-2xl`}
                      >
                        +
                      </span>
                      Add Project
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        {/* Pagination controls */}
        {!loading && filteredProjects.length > PROJECTS_PER_PAGE && (
          <div className="flex justify-center items-center gap-2 mt-4 mb-0">
            <button
              className="px-2 py-1 rounded bg-gray-700 text-white font-bold disabled:opacity-40"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                className={`mx-1 px-3 py-1 rounded ${
                  currentPage === idx + 1
                    ? "bg-orange-500 text-white font-bold"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setCurrentPage(idx + 1)}
              >
                {idx + 1}
              </button>
            ))}
            <button
              className="px-2 py-1 rounded bg-gray-700 text-white font-bold disabled:opacity-40"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
        {isModalOpen && (
          <AddProjectModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={addProject}
          />
        )}
      </div>
    </div>
  );
}

export default Projects;

import React, { useEffect, useState } from "react";
import SiteBarHome from "./SiteBarHome";
import { projectInstance, checklistInstance } from "../api/axiosInstance";

const PAGE_SIZE = 10;

function CheckerInbox() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState(null);

  const [unreviewed, setUnreviewed] = useState([]);
  const [loadingUnreviewed, setLoadingUnreviewed] = useState(false);
  const [errUnreviewed, setErrUnreviewed] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Expand/collapse state
  const [expanded, setExpanded] = useState({});
  const toggleExpanded = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  // Assign loading state for each checklist
  const [assigning, setAssigning] = useState({}); // { [checklistId]: boolean }

  // Get user/checker accesses from localStorage
  const userStr = localStorage.getItem("user");
  
  const accessesStr = localStorage.getItem("ACCESSES");
  const accesses = accessesStr ? JSON.parse(accessesStr) : [];
  console.log("Current accesses:", accesses);
  
  

  // Fetch projects
  useEffect(() => {
    async function fetchProjects() {
      setLoadingProjects(true);
      setError(null);
      try {
        const checkerProjects = accesses
          .filter((a) => a.active && a.roles && a.roles.includes("CHECKER"))
          .map((a) => Number(a.project_id));      
        const res = await projectInstance.get("/projects/", {
          headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
        });
        const allProjects = Array.isArray(res.data) ? res.data : res.data.results;
        console.log('all',allProjects);
        
        
        const filtered = allProjects.filter((p) =>
          checkerProjects.includes(p.id)
        );
        setProjects(filtered);
        if (filtered.length > 0 && !selectedProjectId)
          setSelectedProjectId(filtered[0].id);
      } catch (err) {
        setError("Failed to load projects");
        setProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    }
    fetchProjects();
    // eslint-disable-next-line
  }, [userStr]);

  // Fetch unreviewed checklists/submissions for selected project
  useEffect(() => {
    if (!selectedProjectId) {
      setUnreviewed([]);
      return;
    }
    setLoadingUnreviewed(true);
    setErrUnreviewed(null);
    checklistInstance
      .get(`/accessible-checklists-unreviewed/?project_id=${selectedProjectId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      })
      .then((res) => {
        setUnreviewed(Array.isArray(res.data) ? res.data : []);
        setCurrentPage(1);
      })
      .catch(() => setErrUnreviewed("Could not fetch checklists"))
      .finally(() => setLoadingUnreviewed(false));
  }, [selectedProjectId]);

  // Only show checklists with at least 1 question/item
  const safeUnreviewed = Array.isArray(unreviewed) ? unreviewed : [];
  const checklistsWithQuestions = safeUnreviewed.filter(
    (cl) => cl.items && cl.items.length > 0
  );
  const totalPages =
    Math.ceil(checklistsWithQuestions.length / PAGE_SIZE) || 1;
  const paginatedUnreviewed = checklistsWithQuestions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Assign all submissions in a checklist to yourself
  const handleAssignToYourself = async (checklist) => {
    // Flatten all submission ids from all items
    const submissionIds = (checklist.items || [])
      .flatMap((item) =>
        Array.isArray(item.submissions)
          ? item.submissions.map((sub) => sub.id)
          : []
      )
      .filter(Boolean);

    if (!submissionIds.length) {
      window.alert("No submissions to assign.");
      return;
    }

    setAssigning((prev) => ({ ...prev, [checklist.id]: true }));

    try {
      await checklistInstance.patch(
        "/bulk-verify-submissions/",
        { submission_ids: submissionIds },
        {
          headers: { Authorization:` Bearer ${localStorage.getItem("access")}` },
        }
      );
      window.alert("Assigned all submissions to yourself!");
      // Remove this checklist from UI (from unreviewed)
      setUnreviewed((prev) => prev.filter((cl) => cl.id !== checklist.id));
    } catch (err) {
      window.alert(
        err?.response?.data?.detail ||
          "Assignment failed. Please try again."
      );
    } finally {
      setAssigning((prev) => ({ ...prev, [checklist.id]: false }));
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SiteBarHome />
      <main className="ml-[15%] w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Checker Inbox</h2>
        {/* Project Dropdown */}
        <div className="mb-6">
          <label className="block mb-2 font-semibold">Select Project:</label>
          {loadingProjects ? (
            <p>Loading projects...</p>
          ) : (
            <select
              className="p-2 border rounded"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(Number(e.target.value))}
              disabled={projects.length === 0}
            >
              {projects.length === 0 && <option>No projects</option>}
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name || `Project #${p.id}`}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Unreviewed Checklists/Submissions */}
        <div>
          {loadingUnreviewed ? (
            <p>Loading checklists...</p>
          ) : errUnreviewed ? (
            <p className="text-red-500">{errUnreviewed}</p>
          ) : !paginatedUnreviewed.length ? (
            <p>No checklists with unreviewed items.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {paginatedUnreviewed.map((cl) => (
                <div
                  key={cl.id}
                  className="bg-white rounded-2xl shadow p-6 border relative group transition-all"
                >
                  {/* Checklist Info */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-semibold text-lg">{cl.name}</div>
                      <div className="text-sm text-gray-500">
                        Category: {cl.category || "--"}
                        <br />
                        Building: {cl.building_id || "--"}
                        <br />
                        Zone: {cl.zone_id || "--"}
                        <br />
                        Questions: {cl.items ? cl.items.length : 0}
                      </div>
                    </div>
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-xl text-xs font-semibold absolute right-4 top-4 group-hover:shadow">
                      ID: {cl.id}
                    </span>
                  </div>
                  {/* View Questions Button */}
                  <button
                    className="w-full my-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2 transition-all"
                    onClick={() => toggleExpanded(cl.id)}
                  >
                    <span role="img" aria-label="questions">
                      👁
                    </span>
                    View Questions
                  </button>
                  {/* Assign to Yourself Button */}
                  <button
                    className={`w-full mb-2 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition-all ${
                      assigning[cl.id] ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                    disabled={assigning[cl.id]}
                    onClick={() => handleAssignToYourself(cl)}
                  >
                    {assigning[cl.id] ? "Assigning..." : "+ Assign to Yourself"}
                  </button>
                  {/* Questions Table (expand/collapse) */}
                  {expanded[cl.id] && (
                    <div className="mt-2">
                      <table className="w-full text-sm border">
                        <thead>
                          <tr>
                            <th className="px-2 py-1">Description</th>
                            <th className="px-2 py-1">Status</th>
                            <th className="px-2 py-1">Submissions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cl.items.map((item) => (
                            <tr key={item.id}>
                              <td className="px-2 py-1">{item.description}</td>
                              <td className="px-2 py-1">{item.status}</td>
                              <td className="px-2 py-1">
                                {item.submissions && item.submissions.length > 0 ? (
                                  <ul>
                                    {item.submissions.map((sub) => (
                                      <li key={sub.id}>
                                        ID: {sub.id}
                                        {sub.user && <> | User: {sub.user}</>}
                                        {sub.accepted_at && (
                                          <> | Accepted At: {new Date(sub.accepted_at).toLocaleString()}</>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <span>—</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Prev
              </button>
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx}
                  className={`px-3 py-1 rounded ${
                    currentPage === idx + 1
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                  onClick={() => handlePageChange(idx + 1)}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default CheckerInbox;
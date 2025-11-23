import React, { useState, useEffect } from "react";
import { checklistInstance } from "../api/axiosInstance";
import SiteBarHome from "./SiteBarHome";
import { toast } from "react-hot-toast";

function InspectorPending() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  // Build projects from ACCESSES in localStorage
  useEffect(() => {
    let accesses = [];
    try {
      accesses = JSON.parse(localStorage.getItem("ACCESSES") || "[]");
    } catch (e) {
      accesses = [];
    }
    const unique = {};
    accesses.forEach(acc => {
      if (acc.project_id) unique[acc.project_id] = true;
    });
    const projectList = Object.keys(unique).map(id => ({
      id,
      name: `Project ${id}`,
    }));
    setProjects(projectList);
  }, []);

  // Fetch submissions whenever project changes
  useEffect(() => {
    if (!selectedProject) {
      setSubmissions([]);
      return;
    }
    setLoading(true);
    checklistInstance
      .get(`/checker-verified-inspector-pending/?project_id=${selectedProject}`)
      .then((res) => setSubmissions(res.data || []))
      .catch(() => {
        setSubmissions([]);
        toast.error("Failed to fetch inspector pending items");
      })
      .finally(() => setLoading(false));
  }, [selectedProject]);

  // Get option id for value "P" (yes) or "N" (no)
  const getOptionId = (item, value) => {
      console.log("All options for checklist_item:", item.checklist_item?.options);

    if (!item.checklist_item || !item.checklist_item.options) return null;
    // Try by value, fallback by label (yes/no)
    let opt = item.checklist_item.options.find(o => o.value === value);
    if (!opt) {
      opt = item.checklist_item.options.find(o =>
        value === "P"
          ? o.label.toLowerCase() === "yes"
          : o.label.toLowerCase() === "no"
      );
    }
      console.log("Selected option for value", value, ":", opt);

    return opt?.id || null;
  };

  // Handle Yes/No click
  const handleVerify = async (submission, value) => {
    const option_id = getOptionId(submission, value);
    if (!option_id) {
      toast.error("Option not found for this checklist item.");
      return;
    }
    setActionLoading(l => ({ ...l, [submission.id]: true }));
    try {
      const formData = new FormData();
      formData.append("submission_id", submission.id);
      formData.append("role", "SUPERVISOR");
      formData.append("option_id", option_id);
      formData.append("check_remark", "");
      // No check_photo for button only, extend if you want file upload

      await checklistInstance.patch(
        "/verify-checklist-item-submission/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      toast.success("Submission updated!");
      // Remove row on success
      setSubmissions(submissions => submissions.filter(s => s.id !== submission.id));
    } catch (error) {
      const msg = error?.response?.data?.detail || "Failed to update submission";
      toast.error(msg);
    } finally {
      setActionLoading(l => ({ ...l, [submission.id]: false }));
    }
  };

  // Get all fields for columns
  const allFields = React.useMemo(() => {
    if (!submissions.length) return [];
    const keys = new Set();
    submissions.forEach(sub => {
      Object.keys(sub).forEach(key => keys.add(key));
    });
    return ["#", ...Array.from(keys)];
  }, [submissions]);

  const renderCell = (item, key) => {
    // Images
    if (
      ["maker_photo", "check_photo", "review_photo"].includes(key) &&
      item[key]
    ) {
      return (
        <a href={item[key]} target="_blank" rel="noopener noreferrer">
          <img
            src={item[key]}
            alt={key}
            className="w-10 h-10 object-cover rounded shadow"
          />
        </a>
      );
    }
    // Nested checklist_item (show description, options, status, etc.)
    if (key === "checklist_item" && typeof item[key] === "object" && item[key] !== null) {
      return (
        <div style={{ minWidth: 120 }}>
          <div>
            <b>ID:</b> {item[key].id}
          </div>
          <div>
            <b>Description:</b> {item[key].description}
          </div>
          <div>
            <b>Status:</b> {item[key].status}
          </div>
          <div>
            <b>Options:</b>{" "}
            <span style={{ fontSize: "11px" }}>
              {JSON.stringify(item[key].options)}
            </span>
          </div>
        </div>
      );
    }
    // Date formatting
    if (/_at$/.test(key) && item[key]) {
      try {
        return new Date(item[key]).toLocaleString();
      } catch {
        return item[key];
      }
    }
    return item[key] === null || item[key] === undefined
      ? "-"
      : String(item[key]);
  };

  return (
    <div className="flex min-h-screen bg-[#f7f8fa]">
      <SiteBarHome />
      <div className="flex-1 ml-[16%] mr-4 my-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-semibold text-[#22223b] mb-2 tracking-tight">
              Inspector Pending Items
            </h1>
            <p className="text-[#6c6f7e] text-base md:text-lg">
              View <b>all data</b> for checklist submissions verified by checker
              but pending inspection.
            </p>
          </div>

          {/* Project Dropdown */}
          <div className="bg-white rounded-xl border border-[#ececf0] p-6 mb-6 shadow-sm">
            <label className="block mb-2 text-[#343650] font-semibold">
              Select Project
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full p-4 border border-[#ececf0] rounded-lg bg-white text-[#2d3047]"
            >
              <option value="">Choose project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Table of submissions (all fields!) */}
          <div className="bg-white rounded-xl border border-[#489CE2] shadow-sm overflow-x-auto">
            <div className="px-6 py-4 border-b border-[#489CE2] flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#343650]">
                Pending Items (All Fields)
              </h2>
              <span className="text-xs text-[#8b8c97]">
                {submissions.length}{" "}
                {submissions.length === 1 ? "item" : "items"}
              </span>
            </div>
            {loading ? (
              <div className="py-10 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4375e8] mx-auto mb-2"></div>
                <p className="text-[#b4c0e6] text-base">Loading...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs md:text-sm border border-[#489CE2]">
                  <thead className="bg-[#e6f0fa] text-[#22223b] border-b-2 border-[#489CE2]">
                    <tr>
                      {allFields.map((key) => (
                        <th
                          key={key}
                          className="px-2 py-2 border border-[#489CE2] font-semibold whitespace-nowrap"
                        >
                          {key === "#"
                            ? "#"
                            : key.replace(/_/g, " ").toUpperCase()}
                        </th>
                      ))}
                      <th className="px-2 py-2 border border-[#489CE2] font-semibold whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.length === 0 ? (
                      <tr>
                        <td
                          colSpan={allFields.length + 1}
                          className="text-center text-[#b4c0e6] py-6 border border-[#489CE2]"
                        >
                          No pending items.
                        </td>
                      </tr>
                    ) : (
                      submissions.map((item, idx) => (
                        <tr
                          key={item.id}
                          className="hover:bg-[#e3f0ff] border border-[#489CE2]"
                        >
                          {allFields.map((key, colIdx) => (
                            <td
                              key={key}
                              className="px-2 py-2 border border-[#489CE2] max-w-xs whitespace-nowrap overflow-x-auto"
                            >
                              {key === "#" ? idx + 1 : renderCell(item, key)}
                            </td>
                          ))}
                          <td className="px-2 py-2 border border-[#489CE2] whitespace-nowrap">
                            <button
                              className="mr-1 bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded font-bold shadow disabled:bg-green-300"
                              disabled={!!actionLoading[item.id]}
                              onClick={() => handleVerify(item, "P")}
                            >
                              {actionLoading[item.id] ? "..." : "Yes"}
                            </button>
                            <button
                              className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded font-bold shadow disabled:bg-red-300"
                              disabled={!!actionLoading[item.id]}
                              onClick={() => handleVerify(item, "N")}
                            >
                              {actionLoading[item.id] ? "..." : "No"}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InspectorPending;
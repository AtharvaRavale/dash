import React, { useState, useEffect } from "react";
import SideBarSetup from "./SideBarSetup";
import { getProjectUserDetails } from "../api";
import { checklistInstance } from "../api/axiosInstance";
import { toast } from "react-hot-toast";
import { useTheme } from "../ThemeContext"; // Ensure this path is correct

function AllChecklists() {
  const { theme } = useTheme();
  const palette = theme === "dark"
    ? {
        bg: "#191921",
        card: "bg-[#23232e]",
        text: "text-amber-200",
        border: "border-[#facc1530]",
        input: "bg-[#181820] text-amber-200",
        tableHead: "bg-[#181820] text-[#facc15]",
        trHover: "hover:bg-[#23232e]",
        shadow: "shadow-xl",
        btn: "bg-[#4375e8] text-white hover:bg-[#1e4fb2]",
        btnSec: "bg-gray-600 text-amber-100 hover:bg-gray-700",
        badge: "bg-[#fde047] text-[#181820]"
      }
    : {
        bg: "#f7f8fa",
        card: "bg-white",
        text: "text-[#22223b]",
        border: "border-[#ececf0]",
        input: "bg-white text-[#22223b]",
        tableHead: "bg-[#f6f8fd] text-[#9aa2bc]",
        trHover: "hover:bg-[#f6f8fd]",
        shadow: "shadow",
        btn: "bg-[#4375e8] text-white hover:bg-[#1e4fb2]",
        btnSec: "bg-gray-500 text-white hover:bg-gray-600",
        badge: "bg-[#4375e8] text-white"
      };

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [checklists, setChecklists] = useState([]);
  const [selectedChecklist, setSelectedChecklist] = useState("");
  const [items, setItems] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [loading, setLoading] = useState(false);

  const [inlineAddBelowId, setInlineAddBelowId] = useState(null);
  const [inlineAddValue, setInlineAddValue] = useState("");

  // Fetch projects
  useEffect(() => {
    (async () => {
      try {
        const res = await getProjectUserDetails();
        setProjects(res.data || []);
      } catch {
        toast.error("Failed to fetch projects");
      }
    })();
  }, []);

  // Fetch checklists for selected project
  useEffect(() => {
    if (!selectedProject) {
      setChecklists([]);
      setSelectedChecklist("");
      return;
    }
    setLoading(true);
    checklistInstance
      .get(`/checklists/?project=${selectedProject}`)
      .then((res) => {
        setChecklists(res.data || []);
        setSelectedChecklist("");
      })
      .catch(() => {
        setChecklists([]);
        setSelectedChecklist("");
        toast.error("Failed to load checklists");
      })
      .finally(() => setLoading(false));
  }, [selectedProject]);

  // Fetch checklist items for selected checklist
  useEffect(() => {
    if (!selectedChecklist) {
      setItems([]);
      return;
    }
    setLoading(true);
    checklistInstance
      .get(`/items/by_checklist/?checklist_id=${selectedChecklist}`)
      .then((res) => setItems(res.data || []))
      .catch(() => {
        setItems([]);
        toast.error("Failed to load questions");
      })
      .finally(() => setLoading(false));
  }, [selectedChecklist]);

  // Add new question (bottom input)
  const handleAdd = async (e) => {
    e.preventDefault();
    const val = newQuestion.trim();
    if (!selectedChecklist || !val) {
      toast.error("Select checklist and enter question");
      return;
    }
    setLoading(true);
    try {
      await checklistInstance.post(`/items/`, {
        checklist: selectedChecklist,
        description: val,
        sequence: items.length + 1,
      });
      toast.success("Question added");
      setNewQuestion("");
      const res = await checklistInstance.get(`/items/by_checklist/?checklist_id=${selectedChecklist}`);
      setItems(res.data || []);
    } catch {
      toast.error("Failed to add question");
    }
    setLoading(false);
  };

  // Inline add question below row
  const handleInlineAdd = async (e, afterId) => {
    e.preventDefault();
    const val = inlineAddValue.trim();
    if (!selectedChecklist || !val) {
      toast.error("Enter question");
      return;
    }
    setLoading(true);
    try {
      await checklistInstance.post(`/items/`, {
        checklist: selectedChecklist,
        description: val,
        sequence: items.findIndex(i => i.id === afterId) + 2,
      });
      toast.success("Question added");
      setInlineAddValue("");
      setInlineAddBelowId(null);
      const res = await checklistInstance.get(`/items/by_checklist/?checklist_id=${selectedChecklist}`);
      setItems(res.data || []);
    } catch {
      toast.error("Failed to add question");
    }
    setLoading(false);
  };

  // Begin editing
  const startEdit = (item) => {
    setEditingId(item.id);
    setEditingValue(item.description);
  };

  // Save edit
  const handleSaveEdit = async (itemId) => {
    if (!editingValue.trim()) {
      toast.error("Question cannot be empty");
      return;
    }
    setLoading(true);
    try {
      await checklistInstance.patch(`/items/${itemId}/`, {
        description: editingValue.trim(),
      });
      toast.success("Question updated");
      setEditingId(null);
      setEditingValue("");
      const res = await checklistInstance.get(`/items/by_checklist/?checklist_id=${selectedChecklist}`);
      setItems(res.data || []);
    } catch {
      toast.error("Failed to update question");
    }
    setLoading(false);
  };

  // Delete question
  const handleDelete = async (itemId) => {
    if (!window.confirm("Delete this question?")) return;
    setLoading(true);
    try {
      await checklistInstance.delete(`/items/${itemId}/`);
      toast.success("Deleted");
      const res = await checklistInstance.get(`/items/by_checklist/?checklist_id=${selectedChecklist}`);
      setItems(res.data || []);
    } catch {
      toast.error("Failed to delete");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen" style={{ background: palette.bg }}>
      <SideBarSetup />
      <div className="flex-1 ml-[16%] mr-4 my-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-2xl md:text-3xl font-semibold mb-2 tracking-tight ${palette.text}`}>
              All Checklists
            </h1>
            <p className={`${palette.text} opacity-80 text-base md:text-lg`}>
              View and manage all checklist questions by project.
            </p>
          </div>

          {/* Project dropdown */}
          <div className={`${palette.card} rounded-xl ${palette.border} p-6 mb-6 ${palette.shadow}`}>
            <label className={`block mb-2 font-semibold ${palette.text}`}>Select Project</label>
            <select
              value={selectedProject}
              onChange={e => setSelectedProject(e.target.value)}
              className={`w-full p-4 border rounded-lg ${palette.input} ${palette.border} focus:ring-2 focus:ring-[#b4c0e6] focus:border-[#b4c0e6] transition`}
            >
              <option value="">Choose project</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Checklist dropdown */}
          {selectedProject && (
            <div className={`${palette.card} rounded-xl ${palette.border} p-6 mb-6 ${palette.shadow}`}>
              <label className={`block mb-2 font-semibold ${palette.text}`}>Select Checklist</label>
              <select
                value={selectedChecklist}
                onChange={e => setSelectedChecklist(e.target.value)}
                className={`w-full p-4 border rounded-lg ${palette.input} ${palette.border} focus:ring-2 focus:ring-[#b4c0e6] focus:border-[#b4c0e6] transition`}
              >
                <option value="">Choose checklist</option>
                {checklists.map(cl => (
                  <option key={cl.id} value={cl.id}>{cl.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Questions Table */}
          {selectedChecklist && (
            <div className={`${palette.card} rounded-xl ${palette.border} ${palette.shadow}`}>
              <div className="px-6 py-4 border-b border-[#f1f2f6] flex items-center justify-between">
                <h2 className={`text-lg font-semibold ${palette.text}`}>
                  Checklist Questions
                </h2>
                <span className="text-xs text-[#8b8c97]">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </span>
              </div>
              {loading ? (
                <div className="py-10 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4375e8] mx-auto mb-2"></div>
                  <p className="text-base text-[#b4c0e6]">Loading...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className={palette.tableHead}>
                      <tr>
                        <th className="px-6 py-4 font-medium">#</th>
                        <th className="px-6 py-4 font-medium">Question</th>
                        <th className="px-6 py-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ececf0]">
                      {items.map((item, idx) => (
                        <React.Fragment key={item.id}>
                          <tr className={palette.trHover}>
                            <td className={`px-6 py-4 ${palette.text}`}>{idx + 1}</td>
                            <td className={`px-6 py-4 ${palette.text}`}>
                              {editingId === item.id ? (
                                <input
                                  value={editingValue}
                                  onChange={e => setEditingValue(e.target.value)}
                                  onKeyDown={e => {
                                    if (e.key === "Enter") handleSaveEdit(item.id);
                                  }}
                                  className={`w-full border rounded px-2 py-1 ${palette.input} ${palette.border}`}
                                />
                              ) : (
                                item.description
                              )}
                            </td>
                            <td className="px-6 py-4 flex gap-2">
                              {editingId === item.id ? (
                                <>
                                  <button
                                    onClick={() => handleSaveEdit(item.id)}
                                    className="mr-2 bg-green-500 hover:bg-green-700 text-white px-3 py-1 rounded"
                                    disabled={loading}
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingId(null);
                                      setEditingValue("");
                                    }}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-3 py-1 rounded"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => startEdit(item)}
                                    className="mr-2 bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(item.id)}
                                    className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded"
                                    disabled={loading}
                                  >
                                    Delete
                                  </button>
                                  <button
                                    onClick={() => {
                                      setInlineAddBelowId(item.id);
                                      setInlineAddValue("");
                                    }}
                                    className={palette.btn}
                                    title="Add new question below"
                                  >
                                    ➕
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                          {/* Inline Add Row */}
                          {inlineAddBelowId === item.id && (
                            <tr>
                              <td />
                              <td colSpan={2}>
                                <form
                                  onSubmit={(e) => handleInlineAdd(e, item.id)}
                                  className="flex gap-2 mt-2"
                                >
                                  <input
                                    value={inlineAddValue}
                                    onChange={e => setInlineAddValue(e.target.value)}
                                    placeholder="New question"
                                    className={`flex-1 border rounded px-2 py-1 ${palette.input} ${palette.border}`}
                                    autoFocus
                                  />
                                  <button
                                    type="submit"
                                    className="bg-green-500 hover:bg-green-700 text-white px-3 py-1 rounded"
                                    disabled={loading}
                                  >
                                    Add
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setInlineAddBelowId(null)}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-3 py-1 rounded"
                                  >
                                    Cancel
                                  </button>
                                </form>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {/* Add new question form (bottom) */}
              <form onSubmit={handleAdd}>
                <div className="flex items-center gap-3 p-6 border-t border-[#ececf0]">
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={e => setNewQuestion(e.target.value)}
                    placeholder="Add a new question"
                    className={`flex-1 p-3 border rounded ${palette.input} ${palette.border}`}
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    className={`px-6 py-2 rounded-lg font-semibold ${palette.btn}`}
                    disabled={loading}
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AllChecklists;

import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  listFormPacks,
  createFormPack,
  updateFormPack,
  deleteFormPack,
  listFormTemplates,
  createFormPackItem,
  deleteFormPackItem,
  applyFormPacksToProject,
  getProjectsForCurrentUser,
} from "../api";

const FormPacksPage = () => {
  const [packs, setPacks] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [savingPack, setSavingPack] = useState(false);
  const [savingItem, setSavingItem] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const [selectedPackId, setSelectedPackId] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const [packForm, setPackForm] = useState({
    name: "",
    code: "",
    description: "",
  });

  const [itemForm, setItemForm] = useState({
    template: "",
    usage_type: "",
    is_required: false,
    visible_to_roles: "", // comma separated
  });

  // helpers
  const parseRoleList = (value) =>
    (value || "")
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);

  const selectedPack = useMemo(
    () => packs.find((p) => p.id === selectedPackId) || null,
    [packs, selectedPackId]
  );

  // Load packs + templates + projects
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [packsRes, templatesRes, projectsRes] = await Promise.all([
          listFormPacks(),
          listFormTemplates(),
          getProjectsForCurrentUser(),
        ]);

        setPacks(packsRes.data || []);
        setTemplates(templatesRes.data || []);
        setProjects(projectsRes.data || []);

        if (!selectedPackId && packsRes.data?.length) {
          setSelectedPackId(packsRes.data[0].id);
        }
      } catch (err) {
        console.error("Failed to load form packs data", err);
        toast.error("Failed to load form packs / templates.");
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync form with selected pack
  useEffect(() => {
    if (selectedPack) {
      setPackForm({
        name: selectedPack.name || "",
        code: selectedPack.code || "",
        description: selectedPack.description || "",
      });
    } else {
      setPackForm({ name: "", code: "", description: "" });
    }
  }, [selectedPack]);

  const handleNewPack = () => {
    setSelectedPackId(null);
    setPackForm({ name: "", code: "", description: "" });
  };

  const handlePackSubmit = async (e) => {
    e.preventDefault();
    if (!packForm.name || !packForm.code) {
      toast.error("Name & code are required");
      return;
    }
    try {
      setSavingPack(true);
      if (!selectedPackId) {
        // create
        const res = await createFormPack(packForm);
        const created = res.data;
        setPacks((prev) => [...prev, created]);
        setSelectedPackId(created.id);
        toast.success("Pack created");
      } else {
        // update
        const res = await updateFormPack(selectedPackId, packForm);
        const updated = res.data;
        setPacks((prev) =>
          prev.map((p) => (p.id === selectedPackId ? { ...p, ...updated } : p))
        );
        toast.success("Pack updated");
      }
    } catch (err) {
      console.error("Error saving pack", err);
      toast.error("Failed to save pack");
    } finally {
      setSavingPack(false);
    }
  };

  const handleDeletePack = async (id) => {
    if (!window.confirm("Delete this pack? Forms themselves will remain.")) {
      return;
    }
    try {
      await deleteFormPack(id);
      setPacks((prev) => prev.filter((p) => p.id !== id));
      if (selectedPackId === id) {
        setSelectedPackId(null);
      }
      toast.success("Pack deleted");
    } catch (err) {
      console.error("Error deleting pack", err);
      toast.error("Failed to delete pack");
    }
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPack) {
      toast.error("Select a pack first");
      return;
    }
    if (!itemForm.template) {
      toast.error("Select a form template");
      return;
    }
    try {
      setSavingItem(true);
      const payload = {
        pack: selectedPack.id,
        template: Number(itemForm.template),
        usage_type: itemForm.usage_type || "",
        is_required: !!itemForm.is_required,
        visible_to_roles: parseRoleList(itemForm.visible_to_roles),
      };
      const res = await createFormPackItem(payload);
      const createdItem = res.data;
      setPacks((prev) =>
        prev.map((p) =>
          p.id === selectedPack.id
            ? { ...p, items: [...(p.items || []), createdItem] }
            : p
        )
      );
      setItemForm({
        template: "",
        usage_type: "",
        is_required: false,
        visible_to_roles: "",
      });
      toast.success("Form added to pack");
    } catch (err) {
      console.error("Error adding pack item", err);
      toast.error("Failed to add form to pack");
    } finally {
      setSavingItem(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!selectedPack) return;
    if (!window.confirm("Remove this form from the pack?")) return;
    try {
      await deleteFormPackItem(itemId);
      setPacks((prev) =>
        prev.map((p) =>
          p.id === selectedPack.id
            ? {
                ...p,
                items: (p.items || []).filter((i) => i.id !== itemId),
              }
            : p
        )
      );
      toast.success("Form removed from pack");
    } catch (err) {
      console.error("Error deleting pack item", err);
      toast.error("Failed to remove form from pack");
    }
  };

  const handleApplyToProject = async () => {
    if (!selectedPack) {
      toast.error("Select a pack to apply");
      return;
    }
    if (!selectedProjectId) {
      toast.error("Select a project");
      return;
    }
    try {
      setAssigning(true);
      await applyFormPacksToProject({
        project_id: Number(selectedProjectId),
        client_id: null, // optional, you can wire real client later
        pack_ids: [selectedPack.id],
        replace: true, // override older assignments from this pack
      });
      toast.success("Pack applied to project");
    } catch (err) {
      console.error("Error applying pack to project", err);
      toast.error("Failed to apply pack");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Form Packs (Bundles)</h1>
          <p className="text-xs text-gray-500">
            Superadmin: group multiple forms into a pack and apply them to
            projects in one shot.
          </p>
        </div>
        <button
          onClick={handleNewPack}
          className="px-3 py-1.5 text-xs rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-300"
        >
          + New Pack
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Loading packs...</div>
      ) : (
        <div className="flex gap-4">
          {/* LEFT: Pack list */}
          <div className="w-64 shrink-0 space-y-2">
            {packs.length === 0 && (
              <div className="text-xs text-gray-500">
                No packs yet. Click &ldquo;+ New Pack&rdquo; to create first
                bundle.
              </div>
            )}

            {packs.map((pack) => (
              <div
                key={pack.id}
                className={`border rounded-md p-2 cursor-pointer text-xs mb-1 ${
                  pack.id === selectedPackId
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
                onClick={() => setSelectedPackId(pack.id)}
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="font-semibold truncate">{pack.name}</div>
                  <span className="ml-2 px-1.5 py-0.5 bg-gray-100 rounded text-[10px]">
                    {pack.code}
                  </span>
                </div>
                <div className="text-[11px] text-gray-500 line-clamp-2">
                  {pack.description || "No description"}
                </div>
                <div className="mt-1 text-[10px] text-gray-400 flex justify-between">
                  <span>{(pack.items || []).length} forms</span>
                  <button
                    className="text-red-500 hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePack(pack.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: Pack editor & apply */}
          <div className="flex-1 space-y-4">
            {/* Pack form */}
            <div className="border rounded-md bg-white p-3">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-semibold">
                  {selectedPackId ? "Edit Pack" : "Create Pack"}
                </h2>
                {selectedPack && (
                  <span className="text-[11px] text-gray-500">
                    ID #{selectedPack.id}
                  </span>
                )}
              </div>
              <form
                onSubmit={handlePackSubmit}
                className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs"
              >
                <div className="flex flex-col">
                  <label className="mb-1 text-[11px] text-gray-600">
                    Pack Name
                  </label>
                  <input
                    className="border rounded px-2 py-1 text-xs"
                    value={packForm.name}
                    onChange={(e) =>
                      setPackForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Residential Booking Pack"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="mb-1 text-[11px] text-gray-600">
                    Pack Code
                  </label>
                  <input
                    className="border rounded px-2 py-1 text-xs"
                    value={packForm.code}
                    onChange={(e) =>
                      setPackForm((f) => ({
                        ...f,
                        code: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="RESI_BOOKING"
                  />
                </div>
                <div className="flex flex-col md:col-span-1">
                  <label className="mb-1 text-[11px] text-gray-600">
                    Description
                  </label>
                  <input
                    className="border rounded px-2 py-1 text-xs"
                    value={packForm.description}
                    onChange={(e) =>
                      setPackForm((f) => ({
                        ...f,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Booking, KYC, receipts..."
                  />
                </div>
                <div className="md:col-span-3 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingPack}
                    className="px-3 py-1.5 rounded-full bg-blue-600 text-white text-xs disabled:opacity-60"
                  >
                    {savingPack
                      ? "Saving..."
                      : selectedPackId
                      ? "Update Pack"
                      : "Create Pack"}
                  </button>
                </div>
              </form>
            </div>

            {/* Pack items table */}
            <div className="border rounded-md bg-white p-3">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-semibold">Forms in this Pack</h2>
                <span className="text-[11px] text-gray-500">
                  {(selectedPack?.items || []).length} forms
                </span>
              </div>

              {!selectedPack ? (
                <div className="text-xs text-gray-500">
                  Select or create a pack from left side.
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto mb-3">
                    <table className="min-w-full text-[11px] border border-gray-100">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 py-1 text-left border-b">
                            Form
                          </th>
                          <th className="px-2 py-1 text-left border-b">
                            Usage type
                          </th>
                          <th className="px-2 py-1 text-left border-b">
                            Required
                          </th>
                          <th className="px-2 py-1 text-left border-b">
                            Visible roles
                          </th>
                          <th className="px-2 py-1 text-right border-b">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedPack.items || []).map((item) => {
                          const tpl = templates.find(
                            (t) => t.id === item.template
                          );
                          return (
                            <tr key={item.id} className="border-t">
                              <td className="px-2 py-1">
                                <div className="font-semibold">
                                  {tpl?.name || `Template #${item.template}`}
                                </div>
                                <div className="text-[10px] text-gray-500">
                                  {tpl?.code}
                                </div>
                              </td>
                              <td className="px-2 py-1">
                                {item.usage_type || "-"}
                              </td>
                              <td className="px-2 py-1">
                                {item.is_required ? (
                                  <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                                    Required
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-gray-50 text-gray-500">
                                    Optional
                                  </span>
                                )}
                              </td>
                              <td className="px-2 py-1">
                                {(item.visible_to_roles || []).length
                                  ? item.visible_to_roles.join(", ")
                                  : "All roles"}
                              </td>
                              <td className="px-2 py-1 text-right">
                                <button
                                  className="text-red-500 hover:underline"
                                  onClick={() => handleDeleteItem(item.id)}
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          );
                        })}

                        {(!selectedPack.items ||
                          selectedPack.items.length === 0) && (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-2 py-2 text-center text-gray-400"
                            >
                              No forms added yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Add new item */}
                  <form
                    onSubmit={handleItemSubmit}
                    className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs items-end"
                  >
                    <div className="flex flex-col">
                      <label className="mb-1 text-[11px] text-gray-600">
                        Form template
                      </label>
                      <select
                        className="border rounded px-2 py-1 text-xs"
                        value={itemForm.template}
                        onChange={(e) =>
                          setItemForm((f) => ({
                            ...f,
                            template: e.target.value,
                          }))
                        }
                      >
                        <option value="">Select form</option>
                        {templates.map((tpl) => (
                          <option key={tpl.id} value={tpl.id}>
                            {tpl.name} ({tpl.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col">
                      <label className="mb-1 text-[11px] text-gray-600">
                        Usage type
                      </label>
                      <input
                        className="border rounded px-2 py-1 text-xs"
                        value={itemForm.usage_type}
                        onChange={(e) =>
                          setItemForm((f) => ({
                            ...f,
                            usage_type: e.target.value.toUpperCase(),
                          }))
                        }
                        placeholder="BOOKING / KYC / HANDOVER"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="mb-1 text-[11px] text-gray-600">
                        Visible roles (comma)
                      </label>
                      <input
                        className="border rounded px-2 py-1 text-xs"
                        value={itemForm.visible_to_roles}
                        onChange={(e) =>
                          setItemForm((f) => ({
                            ...f,
                            visible_to_roles: e.target.value,
                          }))
                        }
                        placeholder="ADMIN, SALES_MANAGER"
                      />
                      <label className="mt-1 text-[11px] text-gray-600 flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={itemForm.is_required}
                          onChange={(e) =>
                            setItemForm((f) => ({
                              ...f,
                              is_required: e.target.checked,
                            }))
                          }
                        />
                        <span>Required form</span>
                      </label>
                    </div>

                    <div className="flex justify-end md:justify-start">
                      <button
                        type="submit"
                        disabled={savingItem}
                        className="px-3 py-1.5 rounded-full bg-gray-900 text-white text-xs mt-4 disabled:opacity-60"
                      >
                        {savingItem ? "Adding..." : "Add Form to Pack"}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>

            {/* Apply pack → project */}
            <div className="border rounded-md bg-white p-3">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-semibold">
                  Apply this pack to a project
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs items-center">
                <div className="flex flex-col">
                  <label className="mb-1 text-[11px] text-gray-600">
                    Project
                  </label>
                  <select
                    className="border rounded px-2 py-1 text-xs"
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                  >
                    <option value="">Select project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name || p.project_name || `Project #${p.id}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-[11px] text-gray-500 md:col-span-1">
                  <p>
                    This will create/refresh all{" "}
                    <strong>FormAssignment</strong> rows for this pack in the
                    selected project.
                  </p>
                  <p className="mt-1">
                    Existing assignments from this pack will be updated.
                  </p>
                </div>
                <div className="flex justify-end md:justify-start">
                  <button
                    type="button"
                    onClick={handleApplyToProject}
                    disabled={assigning || !selectedPack || !selectedProjectId}
                    className="px-3 py-1.5 rounded-full bg-emerald-600 text-white text-xs disabled:opacity-60"
                  >
                    {assigning ? "Applying..." : "Apply Pack to Project"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormPacksPage;

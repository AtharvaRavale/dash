// src/components/ProjectFormsManagerSetupPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

import axiosInstance, { projectInstance } from "../api/axiosInstance";

// existing helpers
import { getProjectsForCurrentUser, getAssignedFormsForProject } from "../api";

// ✅ NEW forms basket APIs (ensure these exist in ../api)
import {
  // decision
  managerDecideFormAssignments,

  // baskets
  listFormBaskets,
  createFormBasket,
  updateFormBasket,
  deleteFormBasket,

  // items
  listFormBasketItems,
  addFormBasketItems,

  // targets
  getFormBasketTargets,
  setFormBasketTargets,

  // flow
  getFormBasketFlow,
  saveFormBasketFlow,
} from "../api";

/* ---------------- helpers ---------------- */
const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);

const extractList = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (isObj(payload) && "data" in payload && !("success" in payload)) return extractList(payload.data);
  if (isObj(payload) && payload.success && "data" in payload) return extractList(payload.data);
  if (isObj(payload) && Array.isArray(payload.results)) return payload.results;
  if (isObj(payload) && Array.isArray(payload.items)) return payload.items;
  if (isObj(payload) && isObj(payload.data)) return extractList(payload.data);
  return [];
};

const toInt = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const uniq = (arr) => Array.from(new Set((arr || []).filter((x) => x != null)));
const normIdList = (arr) => uniq((arr || []).map(toInt)).filter((x) => x != null);

const safeText = (v) => String(v ?? "").trim();

const apiErrMsg = (e, fallback = "Something went wrong") => {
  const d = e?.response?.data;
  if (typeof d === "string") return d;
  if (d?.detail) return d.detail;
  if (d?.message) return d.message;
  if (isObj(d)) {
    const k = Object.keys(d)[0];
    const v = d?.[k];
    if (Array.isArray(v) && v[0]) return `${k}: ${v[0]}`;
    if (typeof v === "string") return `${k}: ${v}`;
  }
  return fallback;
};

const looksLikeMissingTable = (e) => {
  const msg = safeText(e?.response?.data?.detail || e?.response?.data?.message || "");
  const raw = safeText(e?.response?.data || "");
  return (
    msg.toLowerCase().includes("no such table") ||
    raw.toLowerCase().includes("no such table") ||
    safeText(e?.message || "").toLowerCase().includes("no such table")
  );
};

const tryPayloads = async (fn, payloads) => {
  let lastErr = null;
  for (const p of payloads) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await fn(p);
    } catch (e) {
      lastErr = e;
      const st = e?.response?.status;
      if (st && st !== 400) break; // non-validation -> stop trying
    }
  }
  throw lastErr || new Error("Request failed");
};

/* ---------------- labels ---------------- */
const pickAssignmentTitle = (a) => {
  const tv = a?.template_version_detail || {};
  const tpl = tv?.template_detail || {};
  return tpl?.name || tv?.title || a?.title || `Assignment #${a?.id ?? "-"}`;
};

const pickAssignmentCode = (a) => {
  const tv = a?.template_version_detail || {};
  const tpl = tv?.template_detail || {};
  return tpl?.code || a?.code || "";
};

/* ---------------- users helpers ---------------- */
const getDisplayName = (u) => {
  const fn = safeText(u?.first_name);
  const ln = safeText(u?.last_name);
  const full = safeText(`${fn} ${ln}`);
  return full || u?.username || u?.email || `User #${u?.id ?? "-"}`;
};

/* ---------------- UI bits ---------------- */
function Chip({ children }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px]">
      {children}
    </span>
  );
}

function SmallBtn({ children, className = "", ...props }) {
  return (
    <button
      type="button"
      className={`px-3 py-1.5 rounded border bg-white text-xs hover:bg-gray-50 disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function PrimaryBtn({ children, className = "", ...props }) {
  return (
    <button
      type="button"
      className={`px-3 py-1.5 rounded border bg-blue-600 text-white text-xs hover:bg-blue-700 disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-[94vw] max-w-4xl rounded-xl bg-white shadow-xl border">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="font-semibold text-sm">{title}</div>
          <button className="text-gray-500 hover:text-gray-900" onClick={onClose} type="button">
            ✕
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

/* ---------------- project stages (optional picker) ---------------- */
async function fetchPhasesForProject(projectId) {
  const pid = toInt(projectId);
  if (!pid) return [];

  const candidates = [
    `/phases/by_project/${pid}/`,
    `/phases/by_project/${pid}`,
    `/phases/?project_id=${pid}`,
    `/phases/?project=${pid}`,
  ];

  for (const url of candidates) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const res = await projectInstance.get(url);
      const list = extractList(res?.data ?? res);
      if (Array.isArray(list) && list.length) return list;
    } catch {
      // continue
    }
  }
  return [];
}

async function fetchStagesByPhase(phaseId) {
  const ph = toInt(phaseId);
  if (!ph) return [];

  const candidates = [`/stages/by_phase/${ph}/`, `/stages/by_phase/${ph}`];
  for (const url of candidates) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const res = await projectInstance.get(url);
      const list = extractList(res?.data ?? res);
      return (Array.isArray(list) ? list : []).filter((s) => s?.is_active !== false);
    } catch {
      // continue
    }
  }
  return [];
}

/* ---------------- optional: groups picker ---------------- */
async function fetchGroupsSmart() {
  const candidates = [
    
    "groups/",
    "/groups/",
  ];

  for (const url of candidates) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const res = await axiosInstance.get(url);
      const list = extractList(res?.data ?? res);
      if (Array.isArray(list)) return list;
    } catch {
      // keep trying
    }
  }
  return [];
}

const pickGroupLabel = (g) => g?.name || g?.title || g?.group_name || `Group #${g?.id ?? "-"}`;

/* ---------------- optional: remove basket item (best-effort) ---------------- */
async function removeBasketItemBestEffort(basketId, assignmentId) {
  const bid = toInt(basketId);
  const aid = toInt(assignmentId);
  if (!bid || !aid) throw new Error("Invalid ids");

  // try a few likely patterns (safe / best-effort)
  const candidates = [
    `/forms/baskets/${bid}/items/${aid}/`,
    `/forms/baskets/${bid}/items/${aid}`,
    `/forms/form-baskets/${bid}/items/${aid}/`,
    `/forms/form-baskets/${bid}/items/${aid}`,
    `/form-baskets/${bid}/items/${aid}/`,
    `/form-baskets/${bid}/items/${aid}`,
    `/form_baskets/${bid}/items/${aid}/`,
    `/form_baskets/${bid}/items/${aid}`,
  ];

  let lastErr = null;
  for (const url of candidates) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const res = await axiosInstance.delete(url);
      return res;
    } catch (e) {
      lastErr = e;
      const st = e?.response?.status;
      // 404 -> try next, 405 (method not allowed) -> try next
      if (st && ![404, 405].includes(st)) break;
    }
  }
  throw lastErr || new Error("Remove failed");
}

export default function ProjectFormsManagerSetupPage() {
  /* ---------------- base ---------------- */
  const [projectId, setProjectId] = useState("");
  const [projectOptions, setProjectOptions] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  /* ---------------- assignments ---------------- */
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [assignmentSearch, setAssignmentSearch] = useState("");

  /* ---------------- users for targets ---------------- */
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  /* ---------------- manager decision ---------------- */
  const [decision, setDecision] = useState("BASKETS"); // "BASKETS" | "DIRECT_ASSIGNMENTS"
  const [savingDecision, setSavingDecision] = useState(false);

  /* ---------------- stages (optional) ---------------- */
  const [phases, setPhases] = useState([]);
  const [phaseStagesMap, setPhaseStagesMap] = useState({});
  const [stagesLoading, setStagesLoading] = useState(false);

  /* ---------------- baskets ---------------- */
  const [baskets, setBaskets] = useState([]);
  const [basketsLoading, setBasketsLoading] = useState(false);
  const [selectedBasketId, setSelectedBasketId] = useState(null);

  // basket detail
  const [basketItems, setBasketItems] = useState([]);
  const [basketTargets, setBasketTargets] = useState({ user_ids: [], group_ids: [] });
  const [basketFlow, setBasketFlow] = useState({ nodes: [], edges: [] });
  const [detailLoading, setDetailLoading] = useState(false);

  /* ---------------- create basket modal ---------------- */
  const [openCreate, setOpenCreate] = useState(false);
  const [newBasketTitle, setNewBasketTitle] = useState("");
  const [newBasketDesc, setNewBasketDesc] = useState("");
  const [newBasketStageId, setNewBasketStageId] = useState(""); // optional
  const [creatingBasket, setCreatingBasket] = useState(false);

  /* ---------------- selection for adding items ---------------- */
  const [pickedAssignmentIds, setPickedAssignmentIds] = useState([]);

  /* ---------------- targets editor ---------------- */
  const [pickedTargetUserIds, setPickedTargetUserIds] = useState([]);
  const [pickedTargetGroupIdsArr, setPickedTargetGroupIdsArr] = useState([]);
  const [pickedTargetGroupIdsText, setPickedTargetGroupIdsText] = useState("");
  const [savingTargets, setSavingTargets] = useState(false);

  /* ---------------- groups picker (optional) ---------------- */
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupSearch, setGroupSearch] = useState("");
  const [openGroupsPicker, setOpenGroupsPicker] = useState(false);

  /* ---------------- flow steps editor ---------------- */
  const [flowSteps, setFlowSteps] = useState([]); // array of assignment_ids in order
  const [savingFlow, setSavingFlow] = useState(false);

  /* ---------------- basket draft (controlled inputs) ---------------- */
  const [basketDraftTitle, setBasketDraftTitle] = useState("");
  const [basketDraftDesc, setBasketDraftDesc] = useState("");
  const [basketDraftStageId, setBasketDraftStageId] = useState("");
  const lastDraftBasketIdRef = useRef(null);

  /* ---------------- load projects ---------------- */
  useEffect(() => {
    const loadProjects = async () => {
      setProjectsLoading(true);
      try {
        const res = await getProjectsForCurrentUser();
        const list = extractList(res?.data ?? res);
        const mapped = list.map((p) => ({
          id: p.id,
          name: p.name || p.project_name || p.project_title || `Project #${p.id}`,
        }));
        setProjectOptions(mapped);

        const stored = safeText(localStorage.getItem("pfmsp:lastProjectId"));
        const storedId = toInt(stored);
        const okStored = storedId && mapped.some((x) => toInt(x.id) === storedId);

        if (okStored) setProjectId(String(storedId));
        else if (mapped.length) setProjectId(String(mapped[0].id));
      } catch (e) {
        console.error(e);
        toast.error("Failed to load projects");
      } finally {
        setProjectsLoading(false);
      }
    };
    loadProjects();
  }, []);

  useEffect(() => {
    const pid = toInt(projectId);
    if (pid) localStorage.setItem("pfmsp:lastProjectId", String(pid));
  }, [projectId]);

  /* ---------------- load users (targets) ---------------- */
  useEffect(() => {
    const loadUsers = async () => {
      setUsersLoading(true);
      try {
        // IMPORTANT: no leading "/" so it stays under /users/
        const res = await axiosInstance.get("users-by-creator/");
        const list = extractList(res?.data ?? res);
        setUsers(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load users");
        setUsers([]);
      } finally {
        setUsersLoading(false);
      }
    };
    loadUsers();
  }, []);

  /* ---------------- load groups (optional) ---------------- */
  const loadGroups = async () => {
    setGroupsLoading(true);
    try {
      const list = await fetchGroupsSmart();
      setGroups(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error(e);
      setGroups([]);
    } finally {
      setGroupsLoading(false);
    }
  };

  useEffect(() => {
    // lazy: only fetch once (still safe if empty)
    loadGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- load assignments for project ---------------- */
  const refreshAssignments = async () => {
    if (!projectId) return;
    setLoadingAssignments(true);
    try {
      const res = await getAssignedFormsForProject(projectId);
      const list = extractList(res?.data ?? res);
      setAssignments(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load assigned forms");
      setAssignments([]);
    } finally {
      setLoadingAssignments(false);
    }
  };

  useEffect(() => {
    // reset on project change
    setSelectedBasketId(null);
    setBasketItems([]);
    setBasketTargets({ user_ids: [], group_ids: [] });
    setBasketFlow({ nodes: [], edges: [] });
    setFlowSteps([]);
    setPickedAssignmentIds([]);
    setAssignmentSearch("");

    // decision UI: remember per project locally (optional)
    const storedDecision = safeText(localStorage.getItem(`pfmsp:decision:${toInt(projectId) || "x"}`));
    if (storedDecision === "BASKETS" || storedDecision === "DIRECT_ASSIGNMENTS") {
      setDecision(storedDecision);
    }

    refreshAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  /* ---------------- load phases/stages (optional stage picker for basket) ---------------- */
  useEffect(() => {
    const pid = toInt(projectId);
    if (!pid) {
      setPhases([]);
      setPhaseStagesMap({});
      return;
    }

    const load = async () => {
      setStagesLoading(true);
      try {
        const phs = await fetchPhasesForProject(pid);
        const cleaned = (Array.isArray(phs) ? phs : [])
          .map((p) => ({
            id: toInt(p?.id ?? p?.phase_id),
            name: p?.name || p?.title || `Phase #${p?.id ?? "-"}`,
          }))
          .filter((x) => x.id != null);

        setPhases(cleaned);

        const map = {};
        await Promise.all(
          cleaned.map(async (ph) => {
            const stages = await fetchStagesByPhase(ph.id);
            map[String(ph.id)] = (Array.isArray(stages) ? stages : [])
              .map((s) => ({
                id: toInt(s?.id),
                name: s?.name || s?.stage_name || `Stage #${s?.id ?? "-"}`,
                sequence: toInt(s?.sequence ?? s?.stage_sequence ?? s?.seq),
              }))
              .filter((x) => x.id != null);
          })
        );
        setPhaseStagesMap(map);
      } catch (e) {
        console.error(e);
        setPhases([]);
        setPhaseStagesMap({});
      } finally {
        setStagesLoading(false);
      }
    };

    load();
  }, [projectId]);

  /* ---------------- baskets ---------------- */
  const refreshBaskets = async (opts = {}) => {
    const pid = toInt(projectId);
    if (!pid) return;

    setBasketsLoading(true);
    try {
      const res = await listFormBaskets({ project_id: pid });
      const list = extractList(res?.data ?? res);
      const arr = Array.isArray(list) ? list : [];
      setBaskets(arr);

      // auto-select first basket if none selected (unless caller disabled)
      if (!opts.no_autoselect && !toInt(selectedBasketId) && arr.length) {
        setSelectedBasketId(toInt(arr[0]?.id));
      }
    } catch (e) {
      console.error(e);
      if (looksLikeMissingTable(e)) toast.error("DB tables missing. Run forms_engine migrations first.");
      else toast.error(apiErrMsg(e, "Failed to load baskets"));
      setBaskets([]);
    } finally {
      setBasketsLoading(false);
    }
  };

  useEffect(() => {
    refreshBaskets({ no_autoselect: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const selectedBasket = useMemo(() => {
    const id = toInt(selectedBasketId);
    return (baskets || []).find((b) => toInt(b?.id) === id) || null;
  }, [baskets, selectedBasketId]);

  /* ---------------- sync basket draft when selection changes ---------------- */
  useEffect(() => {
    const bid = toInt(selectedBasketId);
    if (!bid || !selectedBasket) return;

    // only reset draft when basket changed
    if (lastDraftBasketIdRef.current !== bid) {
      lastDraftBasketIdRef.current = bid;
      setBasketDraftTitle(safeText(selectedBasket?.title || selectedBasket?.name || ""));
      setBasketDraftDesc(safeText(selectedBasket?.description || ""));
      setBasketDraftStageId(String(toInt(selectedBasket?.stage_id ?? selectedBasket?.min_stage_id) || ""));
    }
  }, [selectedBasketId, selectedBasket]);

  /* ---------------- load basket detail (items/targets/flow) ---------------- */
  const loadBasketDetail = async (basketId) => {
    const bid = toInt(basketId);
    if (!bid) return;

    setDetailLoading(true);
    try {
      const [itemsRes, targetsRes, flowRes] = await Promise.allSettled([
        listFormBasketItems(bid),
        getFormBasketTargets(bid),
        getFormBasketFlow(bid),
      ]);

      // items
      if (itemsRes.status === "fulfilled") {
        const list = extractList(itemsRes.value?.data ?? itemsRes.value);
        setBasketItems(Array.isArray(list) ? list : []);
      } else {
        setBasketItems([]);
      }

      // targets
      if (targetsRes.status === "fulfilled") {
        const d = targetsRes.value?.data ?? targetsRes.value;
        const t = d?.targets || d || {};
        const user_ids = normIdList(t?.user_ids);
        const group_ids = normIdList(t?.group_ids);

        setBasketTargets({ user_ids, group_ids });
        setPickedTargetUserIds(user_ids);
        setPickedTargetGroupIdsArr(group_ids);
        setPickedTargetGroupIdsText(group_ids.join(","));
      } else {
        setBasketTargets({ user_ids: [], group_ids: [] });
        setPickedTargetUserIds([]);
        setPickedTargetGroupIdsArr([]);
        setPickedTargetGroupIdsText("");
      }

      // flow
      if (flowRes.status === "fulfilled") {
        const d = flowRes.value?.data ?? flowRes.value;
        const f = d?.flow || d || {};
        const nodes = Array.isArray(f?.nodes) ? f.nodes : Array.isArray(d?.nodes) ? d.nodes : [];
        const edges = Array.isArray(f?.edges) ? f.edges : Array.isArray(d?.edges) ? d.edges : [];
        setBasketFlow({ nodes, edges });

        const steps = nodes.map((n) => toInt(n?.assignment_id)).filter((x) => x != null);
        setFlowSteps(steps);
      } else {
        setBasketFlow({ nodes: [], edges: [] });
        setFlowSteps([]);
      }
    } catch (e) {
      console.error(e);
      toast.error(apiErrMsg(e, "Failed to load basket detail"));
      setBasketItems([]);
      setBasketTargets({ user_ids: [], group_ids: [] });
      setBasketFlow({ nodes: [], edges: [] });
      setFlowSteps([]);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedBasketId) return;
    loadBasketDetail(selectedBasketId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBasketId]);

  /* ---------------- derived lists ---------------- */
  const filteredAssignments = useMemo(() => {
    const q = safeText(assignmentSearch).toLowerCase();
    const list = Array.isArray(assignments) ? assignments : [];
    if (!q) return list;

    return list.filter((a) => {
      const title = pickAssignmentTitle(a);
      const code = pickAssignmentCode(a);
      const hay = `${title} ${code} ${a?.usage_type || ""} ${a?.id || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [assignments, assignmentSearch]);

  const usersForPicker = useMemo(() => {
    const q = safeText(userSearch).toLowerCase();
    const list = Array.isArray(users) ? users : [];
    if (!q) return list;
    return list.filter((u) => {
      const hay = `${getDisplayName(u)} ${u?.email || ""} ${u?.username || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [users, userSearch]);

  const groupsForPicker = useMemo(() => {
    const q = safeText(groupSearch).toLowerCase();
    const list = Array.isArray(groups) ? groups : [];
    if (!q) return list;
    return list.filter((g) => {
      const hay = `${pickGroupLabel(g)} ${g?.id ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [groups, groupSearch]);

  const currentItemAssignmentIds = useMemo(() => {
    const ids = (basketItems || []).map((x) => toInt(x?.assignment_id ?? x?.assignment?.id ?? x?.id));
    return normIdList(ids);
  }, [basketItems]);

  const currentItemsPretty = useMemo(() => {
    const map = new Map();
    (assignments || []).forEach((a) => map.set(toInt(a?.id), a));
    return currentItemAssignmentIds.map((id) => map.get(id) || { id }).filter(Boolean);
  }, [assignments, currentItemAssignmentIds]);

  /* ---------------- actions ---------------- */
  const openCreateModal = () => {
    setNewBasketTitle("");
    setNewBasketDesc("");
    setNewBasketStageId("");
    setOpenCreate(true);
  };

  const doCreateBasket = async () => {
    const pid = toInt(projectId);
    if (!pid) return toast.error("Select project first");
    const title = safeText(newBasketTitle);
    if (!title) return toast.error("Basket title required");

    const stageId = toInt(newBasketStageId);

    setCreatingBasket(true);
    try {
      const tries = [
        { project_id: pid, title, description: safeText(newBasketDesc), stage_id: stageId || null },
        { project_id: pid, name: title, description: safeText(newBasketDesc), min_stage_id: stageId || null },
      ];

      let created = null;
      let lastErr = null;

      for (const payload of tries) {
        try {
          // eslint-disable-next-line no-await-in-loop
          const res = await createFormBasket(payload);
          created = res?.data ?? res;
          lastErr = null;
          break;
        } catch (e) {
          lastErr = e;
          const st = e?.response?.status;
          if (st && st !== 400) break;
        }
      }

      if (!created && lastErr) throw lastErr;

      toast.success("Basket created");
      setOpenCreate(false);

      await refreshBaskets({ no_autoselect: true });

      const bid = toInt(created?.id);
      if (bid) setSelectedBasketId(bid);
    } catch (e) {
      console.error(e);
      if (looksLikeMissingTable(e)) toast.error("DB tables missing. Run forms_engine migrations first.");
      else toast.error(apiErrMsg(e, "Failed to create basket"));
    } finally {
      setCreatingBasket(false);
    }
  };

  const doUpdateBasketSmart = async (patch) => {
    const bid = toInt(selectedBasketId);
    if (!bid) return;

    const payloads = [patch];

    // if title patch, also try name
    if (patch?.title && !patch?.name) payloads.push({ ...patch, name: patch.title });

    // if stage_id patch, also try min_stage_id
    if ("stage_id" in patch && !("min_stage_id" in patch)) payloads.push({ ...patch, min_stage_id: patch.stage_id });

    try {
      const res = await tryPayloads((p) => updateFormBasket(bid, p), payloads);
      const updated = res?.data ?? res;

      setBaskets((prev) => {
        const arr = Array.isArray(prev) ? [...prev] : [];
        const idx = arr.findIndex((b) => toInt(b?.id) === bid);
        if (idx >= 0) arr[idx] = { ...arr[idx], ...(updated || patch) };
        return arr;
      });

      toast.success("Basket updated");
      await loadBasketDetail(bid);
    } catch (e) {
      console.error(e);
      toast.error(apiErrMsg(e, "Failed to update basket"));
    }
  };

  const saveBasketInfo = async () => {
    const bid = toInt(selectedBasketId);
    if (!bid) return;

    const title = safeText(basketDraftTitle);
    if (!title) return toast.error("Title required");

    const description = safeText(basketDraftDesc);
    const stage_id = basketDraftStageId ? toInt(basketDraftStageId) : null;

    await doUpdateBasketSmart({ title, description, stage_id });
  };

  const doDeleteBasket = async () => {
    const bid = toInt(selectedBasketId);
    if (!bid) return;

    if (!window.confirm("Delete this basket?")) return;

    try {
      await deleteFormBasket(bid);
      toast.success("Basket deleted");
      setSelectedBasketId(null);
      setBasketItems([]);
      setBasketTargets({ user_ids: [], group_ids: [] });
      setBasketFlow({ nodes: [], edges: [] });
      setFlowSteps([]);
      lastDraftBasketIdRef.current = null;
      await refreshBaskets({ no_autoselect: false });
    } catch (e) {
      console.error(e);
      toast.error(apiErrMsg(e, "Failed to delete basket"));
    }
  };

  const togglePickAssignment = (id) => {
    const aid = toInt(id);
    if (!aid) return;
    setPickedAssignmentIds((prev) => {
      const arr = normIdList(prev);
      return arr.includes(aid) ? arr.filter((x) => x !== aid) : [...arr, aid];
    });
  };

  const addPickedItemsToBasket = async () => {
    const bid = toInt(selectedBasketId);
    if (!bid) return toast.error("Select a basket first");

    // avoid adding items already in basket
    const ids = normIdList(pickedAssignmentIds).filter((x) => !currentItemAssignmentIds.includes(x));
    if (!ids.length) return toast.error("Pick at least 1 NEW assignment");

    try {
      await addFormBasketItems(bid, { assignment_ids: ids });
      toast.success("Items added");
      setPickedAssignmentIds([]);
      await loadBasketDetail(bid);

      // if flow empty, seed it from all current items
      setFlowSteps((prev) => {
        const cur = normIdList(prev);
        if (cur.length) return cur;
        return normIdList([...currentItemAssignmentIds, ...ids]);
      });
    } catch (e) {
      console.error(e);
      toast.error(apiErrMsg(e, "Failed to add items"));
    }
  };

  const removeItem = async (assignmentId) => {
    const bid = toInt(selectedBasketId);
    const aid = toInt(assignmentId);
    if (!bid || !aid) return;

    if (!window.confirm("Remove this assignment from basket?")) return;

    try {
      await removeBasketItemBestEffort(bid, aid);
      toast.success("Item removed");
      await loadBasketDetail(bid);

      // also remove from flow steps if present
      setFlowSteps((prev) => (prev || []).filter((x) => x !== aid));
    } catch (e) {
      console.error(e);
      toast.error("Remove API not available. Add a delete-item endpoint on backend.");
    }
  };

  const syncGroupTextToArr = (text) => {
    const arr = normIdList(
      safeText(text)
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
    );
    setPickedTargetGroupIdsArr(arr);
    setPickedTargetGroupIdsText(arr.join(","));
  };

  const saveTargets = async () => {
    const bid = toInt(selectedBasketId);
    if (!bid) return toast.error("Select a basket first");

    const user_ids = normIdList(pickedTargetUserIds);

    // prefer array; fallback to text
    const group_ids =
      pickedTargetGroupIdsArr?.length > 0
        ? normIdList(pickedTargetGroupIdsArr)
        : normIdList(
            safeText(pickedTargetGroupIdsText)
              .split(",")
              .map((x) => x.trim())
              .filter(Boolean)
          );

    setSavingTargets(true);
    try {
      await setFormBasketTargets(bid, { user_ids, group_ids });
      toast.success("Targets saved");
      await loadBasketDetail(bid);
    } catch (e) {
      console.error(e);
      toast.error(apiErrMsg(e, "Failed to save targets"));
    } finally {
      setSavingTargets(false);
    }
  };

  const seedFlowFromItems = () => {
    const ids = normIdList(currentItemAssignmentIds);
    if (!ids.length) return toast.error("No items yet. Add items first.");
    setFlowSteps(ids);
  };

  const moveStep = (idx, dir) => {
    setFlowSteps((prev) => {
      const arr = [...(prev || [])];
      const j = idx + dir;
      if (j < 0 || j >= arr.length) return arr;
      const tmp = arr[idx];
      arr[idx] = arr[j];
      arr[j] = tmp;
      return arr;
    });
  };

  const removeStep = (aid) => {
    const id = toInt(aid);
    setFlowSteps((prev) => (prev || []).filter((x) => x !== id));
  };

  const saveFlow = async () => {
    const bid = toInt(selectedBasketId);
    if (!bid) return toast.error("Select a basket first");

    const steps = normIdList(flowSteps);
    if (!steps.length) return toast.error("Flow steps empty");

    // linear flow nodes/edges
    const nodes = steps.map((assignment_id, i) => ({
      id: `A${assignment_id}`,
      type: "ASSIGNMENT",
      assignment_id,
      label: `Assignment ${assignment_id}`,
      position: { x: 100 + i * 240, y: 120 },
    }));

    const edges = steps.slice(0, -1).map((a, i) => ({
      id: `E${a}_${steps[i + 1]}`,
      source: `A${a}`,
      target: `A${steps[i + 1]}`,
      type: "NEXT",
    }));

    setSavingFlow(true);
    try {
      await saveFormBasketFlow(bid, { nodes, edges });
      toast.success("Flow saved");
      await loadBasketDetail(bid);
    } catch (e) {
      console.error(e);
      toast.error(apiErrMsg(e, "Failed to save flow"));
    } finally {
      setSavingFlow(false);
    }
  };

  const saveManagerDecision = async () => {
    const pid = toInt(projectId);
    if (!pid) return;

    setSavingDecision(true);
    try {
      await tryPayloads(
        (payload) => managerDecideFormAssignments(payload),
        [{ project_id: pid, decision }, { project_id: pid, mode: decision }]
      );

      localStorage.setItem(`pfmsp:decision:${pid}`, decision);
      toast.success("Manager decision saved");
    } catch (e) {
      console.error(e);
      if (looksLikeMissingTable(e)) toast.error("DB tables missing. Run forms_engine migrations first.");
      else toast.error(apiErrMsg(e, "Failed to save decision"));
    } finally {
      setSavingDecision(false);
    }
  };

  /* ---------------- render guards ---------------- */
  if (projectsLoading) {
    return (
      <div className="p-4 text-sm text-gray-600">
        <div className="text-lg font-semibold">Manager • Form Baskets Setup</div>
        <div>Loading projects…</div>
      </div>
    );
  }

  if (!projectOptions.length) {
    return (
      <div className="p-4 text-sm text-gray-600">
        <div className="text-lg font-semibold">Manager • Form Baskets Setup</div>
        <div>No projects found for your account.</div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <div className="text-lg font-semibold">Manager • Form Baskets Setup</div>
          <div className="text-xs text-gray-500">
            Manager baskets banayega → items add karega → targets set karega → flow save karega.
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs flex-wrap">
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

          <SmallBtn onClick={refreshAssignments}>Refresh forms</SmallBtn>
          <SmallBtn onClick={() => refreshBaskets({ no_autoselect: false })}>Refresh baskets</SmallBtn>
          <SmallBtn onClick={openCreateModal}>+ New Basket</SmallBtn>
        </div>
      </div>

      {/* Manager Decision */}
      <div className="border rounded-md bg-white p-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <div className="text-sm font-semibold">Manager Decision</div>
            <div className="text-[11px] text-gray-500">Users ko kya dikhana hai: baskets ya direct assigned forms.</div>
          </div>

          <div className="flex items-center gap-3 text-xs flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="decision" checked={decision === "BASKETS"} onChange={() => setDecision("BASKETS")} />
              Show Baskets
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="decision"
                checked={decision === "DIRECT_ASSIGNMENTS"}
                onChange={() => setDecision("DIRECT_ASSIGNMENTS")}
              />
              Show Direct Assignments
            </label>

            <PrimaryBtn onClick={saveManagerDecision} disabled={savingDecision}>
              {savingDecision ? "Saving…" : "Save Decision"}
            </PrimaryBtn>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid lg:grid-cols-12 gap-4">
        {/* Left: Baskets list */}
        <div className="lg:col-span-4 border rounded-md bg-white p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Baskets</div>
              <div className="text-[11px] text-gray-500">Project ke baskets list.</div>
            </div>
            <div className="text-xs text-gray-500">{basketsLoading ? "Loading…" : `Total: ${baskets?.length || 0}`}</div>
          </div>

          {basketsLoading ? (
            <div className="mt-3 text-sm text-gray-500">Loading baskets…</div>
          ) : !baskets?.length ? (
            <div className="mt-3 text-sm text-gray-500">
              No baskets yet.{" "}
              <button className="underline" onClick={openCreateModal} type="button">
                Create one
              </button>
              .
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              {baskets.map((b) => {
                const bid = toInt(b?.id);
                const active = bid != null && bid === toInt(selectedBasketId);
                const title = b?.title || b?.name || `Basket #${b?.id ?? "-"}`;
                const stageId = toInt(b?.stage_id ?? b?.min_stage_id);

                return (
                  <button
                    key={bid}
                    type="button"
                    onClick={() => setSelectedBasketId(bid)}
                    className={`w-full text-left border rounded-md p-2 hover:bg-gray-50 ${
                      active ? "bg-blue-50 border-blue-200" : "bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate">{title}</div>
                        <div className="text-[11px] text-gray-500 truncate">{safeText(b?.description) || "—"}</div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <Chip>#{b?.id}</Chip>
                          {stageId ? <Chip>min stage #{stageId}</Chip> : <Chip>no stage gate</Chip>}
                          {b?.is_active === false ? <Chip>inactive</Chip> : <Chip>active</Chip>}
                        </div>
                      </div>
                      <div className="text-[11px] text-gray-400">›</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Basket editor */}
        <div className="lg:col-span-8 border rounded-md bg-white p-3">
          {!selectedBasket ? (
            <div className="text-sm text-gray-500">Select a basket to edit items, targets, and flow.</div>
          ) : (
            <div className="space-y-4">
              {/* Basket header */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-semibold">
                    {selectedBasket?.title || selectedBasket?.name || `Basket #${selectedBasket?.id}`}
                    <span className="text-gray-400 font-mono ml-2">#{selectedBasket?.id}</span>
                  </div>
                  <div className="text-[11px] text-gray-500">
                    {detailLoading ? "Loading basket detail…" : "Edit basket config below."}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <SmallBtn onClick={() => loadBasketDetail(selectedBasketId)}>Reload Detail</SmallBtn>
                  <SmallBtn className="text-red-600" onClick={doDeleteBasket}>
                    Delete
                  </SmallBtn>
                </div>
              </div>

              {/* Basket basic fields */}
              <div className="border rounded-md p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-semibold">Basket Info</div>
                  <div className="flex items-center gap-2">
                    <SmallBtn
                      onClick={() => {
                        // toggle active flag
                        const next = selectedBasket?.is_active === false;
                        doUpdateBasketSmart({ is_active: next });
                      }}
                      title="Toggle active/inactive"
                    >
                      {selectedBasket?.is_active === false ? "Set Active" : "Set Inactive"}
                    </SmallBtn>
                    <PrimaryBtn onClick={saveBasketInfo}>Save Info</PrimaryBtn>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3 mt-2">
                  <div>
                    <div className="text-[11px] text-gray-500 mb-1">Title</div>
                    <input
                      className="border rounded px-2 py-2 text-sm w-full"
                      value={basketDraftTitle}
                      onChange={(e) => setBasketDraftTitle(e.target.value)}
                      placeholder="Basket title"
                    />
                  </div>

                  <div>
                    <div className="text-[11px] text-gray-500 mb-1">Min Stage (optional)</div>
                    <select
                      className="border rounded px-2 py-2 text-sm w-full bg-white"
                      value={basketDraftStageId}
                      onChange={(e) => setBasketDraftStageId(e.target.value)}
                    >
                      <option value="">No stage gate</option>
                      {phases.map((ph) => (
                        <optgroup key={ph.id} label={`Phase: ${ph.name}`}>
                          {(phaseStagesMap[String(ph.id)] || []).map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} (seq {s.sequence ?? "-"})
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    {stagesLoading ? <div className="text-[10px] text-gray-400 mt-1">Loading stages…</div> : null}
                  </div>

                  <div className="md:col-span-2">
                    <div className="text-[11px] text-gray-500 mb-1">Description</div>
                    <textarea
                      className="border rounded px-2 py-2 text-sm w-full min-h-[70px]"
                      value={basketDraftDesc}
                      onChange={(e) => setBasketDraftDesc(e.target.value)}
                      placeholder="Basket description"
                    />
                  </div>
                </div>
              </div>

              {/* Current items snapshot */}
              <div className="border rounded-md p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold">Current Items</div>
                    <div className="text-[11px] text-gray-500">Basket me jo already assignments add hai.</div>
                  </div>
                  <div className="text-[11px] text-gray-500">
                    Total: <span className="font-mono">{currentItemsPretty.length}</span>
                  </div>
                </div>

                {!currentItemsPretty.length ? (
                  <div className="mt-2 text-sm text-gray-500">No items yet.</div>
                ) : (
                  <div className="mt-2 space-y-2">
                    {currentItemsPretty.map((a) => {
                      const aid = toInt(a?.id);
                      return (
                        <div key={aid} className="border rounded px-2 py-2 bg-gray-50 flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-[11px] font-semibold">
                              {a?.id ? pickAssignmentTitle(a) : `Assignment #${aid}`}{" "}
                              <span className="text-gray-400 font-mono">#{aid}</span>
                            </div>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {a?.id && pickAssignmentCode(a) ? <Chip>{pickAssignmentCode(a)}</Chip> : null}
                              {a?.usage_type ? <Chip>{a.usage_type}</Chip> : null}
                            </div>
                          </div>

                          <div className="shrink-0">
                            <SmallBtn className="text-red-600" onClick={() => removeItem(aid)} title="Remove from basket">
                              Remove
                            </SmallBtn>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Items picker */}
              <div className="border rounded-md p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold">Add Items (Assignments)</div>
                    <div className="text-[11px] text-gray-500">Is basket me kaunse assigned forms include honge.</div>
                  </div>
                  <div className="text-[11px] text-gray-500">
                    Current: <span className="font-mono">{currentItemAssignmentIds.length}</span>
                  </div>
                </div>

                <div className="mt-2 flex flex-col md:flex-row md:items-center gap-2">
                  <input
                    className="border rounded px-2 py-1.5 text-xs w-full md:w-80"
                    value={assignmentSearch}
                    onChange={(e) => setAssignmentSearch(e.target.value)}
                    placeholder="Search assignments…"
                  />

                  <PrimaryBtn onClick={addPickedItemsToBasket}>Add selected ({pickedAssignmentIds.length})</PrimaryBtn>
                </div>

                <div className="mt-2 max-h-72 overflow-auto border rounded">
                  {loadingAssignments ? (
                    <div className="p-3 text-sm text-gray-500">Loading assigned forms…</div>
                  ) : !filteredAssignments.length ? (
                    <div className="p-3 text-sm text-gray-500">No assignments found.</div>
                  ) : (
                    <div className="divide-y">
                      {filteredAssignments.map((a) => {
                        const aid = toInt(a?.id);
                        const title = pickAssignmentTitle(a);
                        const code = pickAssignmentCode(a);
                        const already = currentItemAssignmentIds.includes(aid);
                        const picked = pickedAssignmentIds.includes(aid);

                        return (
                          <div key={aid} className="px-3 py-2 flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-xs font-semibold truncate">
                                {title} <span className="text-gray-400 font-mono">#{aid}</span>
                              </div>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {code ? <Chip>{code}</Chip> : null}
                                <Chip>{a?.usage_type || "GENERAL"}</Chip>
                                {a?.is_required ? <Chip>required</Chip> : <Chip>optional</Chip>}
                                {already ? <Chip>in basket</Chip> : null}
                              </div>
                            </div>

                            <div className="shrink-0 flex items-center gap-2">
                              <label className="text-xs flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={picked}
                                  disabled={already}
                                  onChange={() => togglePickAssignment(aid)}
                                />
                                Pick
                              </label>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="mt-2 text-[11px] text-gray-500">Note: “in basket” items pick nahi honge (disabled).</div>
              </div>

              {/* Targets */}
              <div className="border rounded-md p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold">Targets</div>
                    <div className="text-[11px] text-gray-500">Kaunse users / groups ko basket dikhega.</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <SmallBtn onClick={() => setOpenGroupsPicker(true)}>Pick Groups</SmallBtn>
                    <PrimaryBtn onClick={saveTargets} disabled={savingTargets}>
                      {savingTargets ? "Saving…" : "Save Targets"}
                    </PrimaryBtn>
                  </div>
                </div>

                <div className="mt-2 grid md:grid-cols-2 gap-3">
                  {/* Users */}
                  <div className="border rounded p-2">
                    <div className="text-[11px] font-semibold mb-1">Users</div>

                    <input
                      className="border rounded px-2 py-1 text-xs w-full"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search users…"
                    />

                    <div className="mt-2 text-[11px] text-gray-500">
                      Selected: <span className="font-mono">{pickedTargetUserIds.length}</span>
                    </div>

                    <div className="mt-2 max-h-48 overflow-auto border rounded">
                      {usersLoading ? (
                        <div className="p-2 text-sm text-gray-500">Loading users…</div>
                      ) : (
                        <div className="divide-y">
                          {usersForPicker.map((u) => {
                            const uid = toInt(u?.id);
                            const checked = pickedTargetUserIds.includes(uid);
                            return (
                              <label key={uid} className="px-2 py-2 flex items-start gap-2 cursor-pointer hover:bg-gray-50">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => {
                                    setPickedTargetUserIds((prev) => {
                                      const arr = normIdList(prev);
                                      return arr.includes(uid) ? arr.filter((x) => x !== uid) : [...arr, uid];
                                    });
                                  }}
                                />
                                <div className="min-w-0">
                                  <div className="text-xs font-semibold truncate">
                                    {getDisplayName(u)} <span className="text-gray-400 font-mono">#{uid}</span>
                                  </div>
                                  <div className="text-[11px] text-gray-500 truncate">{u?.email || u?.username || "-"}</div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Groups */}
                  <div className="border rounded p-2">
                    <div className="text-[11px] font-semibold mb-1">Groups</div>
                    <div className="text-[11px] text-gray-500 mb-2">
                      Dropdown optional hai. IDs comma-separated bhi chalega.
                    </div>

                    <input
                      className="border rounded px-2 py-2 text-sm w-full"
                      value={pickedTargetGroupIdsText}
                      onChange={(e) => {
                        setPickedTargetGroupIdsText(e.target.value);
                        // don’t auto-parse on every keystroke; parse on blur
                      }}
                      onBlur={(e) => syncGroupTextToArr(e.target.value)}
                      placeholder="e.g. 12, 15, 99"
                    />

                    <div className="mt-2 flex flex-wrap gap-1">
                      {pickedTargetGroupIdsArr.map((gid) => {
                        const g = (groups || []).find((x) => toInt(x?.id) === gid);
                        return <Chip key={gid}>{g ? pickGroupLabel(g) : `Group #${gid}`}</Chip>;
                      })}
                      {!pickedTargetGroupIdsArr.length ? <span className="text-[11px] text-gray-400">No groups selected</span> : null}
                    </div>

                    <div className="mt-2 text-[11px] text-gray-500">
                      Current saved:{" "}
                      <span className="font-mono">
                        users {basketTargets.user_ids.length}, groups {basketTargets.group_ids.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Flow */}
              <div className="border rounded-md p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold">Flow</div>
                    <div className="text-[11px] text-gray-500">Linear flow: steps order = processing order.</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <SmallBtn onClick={seedFlowFromItems}>Seed from items</SmallBtn>
                    <PrimaryBtn onClick={saveFlow} disabled={savingFlow}>
                      {savingFlow ? "Saving…" : "Save Flow"}
                    </PrimaryBtn>
                  </div>
                </div>

                <div className="mt-2 text-[11px] text-gray-500">
                  Steps: <span className="font-mono">{flowSteps.length}</span>
                  {flowSteps.length === 0 ? <span className="ml-2">Tip: pehle items add karo, phir seed karo.</span> : null}
                </div>

                {flowSteps.length ? (
                  <div className="mt-2 space-y-2">
                    {flowSteps.map((aid, idx) => {
                      const a = (assignments || []).find((x) => toInt(x?.id) === aid);
                      return (
                        <div key={aid} className="flex items-center justify-between gap-2 border rounded bg-gray-50 px-2 py-2">
                          <div className="min-w-0">
                            <div className="text-xs font-semibold truncate">
                              {a ? pickAssignmentTitle(a) : `Assignment #${aid}`}{" "}
                              <span className="text-gray-400 font-mono">#{aid}</span>
                            </div>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {a && pickAssignmentCode(a) ? <Chip>{pickAssignmentCode(a)}</Chip> : null}
                              {a?.usage_type ? <Chip>{a.usage_type}</Chip> : null}
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-1">
                            <SmallBtn onClick={() => moveStep(idx, -1)} title="Move up">
                              ↑
                            </SmallBtn>
                            <SmallBtn onClick={() => moveStep(idx, +1)} title="Move down">
                              ↓
                            </SmallBtn>
                            <SmallBtn onClick={() => removeStep(aid)} title="Remove step" className="text-red-600">
                              Remove
                            </SmallBtn>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-gray-500">No flow steps yet.</div>
                )}

                {!!basketFlow?.nodes?.length && (
                  <div className="mt-3 text-[11px] text-gray-500">
                    Saved flow nodes: <span className="font-mono">{basketFlow.nodes.length}</span>, edges:{" "}
                    <span className="font-mono">{basketFlow.edges.length}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Basket Modal */}
      <Modal open={openCreate} title="Create New Basket" onClose={() => setOpenCreate(false)}>
        <div className="space-y-3">
          <div>
            <div className="text-[11px] text-gray-500 mb-1">Title</div>
            <input
              className="border rounded px-2 py-2 text-sm w-full"
              value={newBasketTitle}
              onChange={(e) => setNewBasketTitle(e.target.value)}
              placeholder="e.g. Structural QC Basket"
            />
          </div>

          <div>
            <div className="text-[11px] text-gray-500 mb-1">Description</div>
            <textarea
              className="border rounded px-2 py-2 text-sm w-full min-h-[80px]"
              value={newBasketDesc}
              onChange={(e) => setNewBasketDesc(e.target.value)}
              placeholder="Short description…"
            />
          </div>

          <div>
            <div className="text-[11px] text-gray-500 mb-1">Min Stage (optional)</div>
            <select
              className="border rounded px-2 py-2 text-sm w-full bg-white"
              value={newBasketStageId}
              onChange={(e) => setNewBasketStageId(e.target.value)}
            >
              <option value="">No stage gate</option>
              {phases.map((ph) => (
                <optgroup key={ph.id} label={`Phase: ${ph.name}`}>
                  {(phaseStagesMap[String(ph.id)] || []).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (seq {s.sequence ?? "-"})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {stagesLoading ? <div className="text-[10px] text-gray-400 mt-1">Loading stages…</div> : null}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <SmallBtn onClick={() => setOpenCreate(false)}>Cancel</SmallBtn>
            <PrimaryBtn onClick={doCreateBasket} disabled={creatingBasket}>
              {creatingBasket ? "Creating…" : "Create Basket"}
            </PrimaryBtn>
          </div>
        </div>
      </Modal>

      {/* Groups Picker Modal */}
      <Modal open={openGroupsPicker} title="Pick Groups" onClose={() => setOpenGroupsPicker(false)}>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <input
              className="border rounded px-2 py-2 text-sm w-full"
              value={groupSearch}
              onChange={(e) => setGroupSearch(e.target.value)}
              placeholder="Search groups…"
            />
            <SmallBtn onClick={loadGroups} disabled={groupsLoading}>
              {groupsLoading ? "Loading…" : "Refresh"}
            </SmallBtn>
          </div>

          <div className="text-[11px] text-gray-500">
            Selected: <span className="font-mono">{pickedTargetGroupIdsArr.length}</span>
          </div>

          <div className="max-h-72 overflow-auto border rounded">
            {groupsLoading ? (
              <div className="p-3 text-sm text-gray-500">Loading groups…</div>
            ) : !groupsForPicker.length ? (
              <div className="p-3 text-sm text-gray-500">
                No groups found (or groups API not connected). You can still paste IDs in the Groups field.
              </div>
            ) : (
              <div className="divide-y">
                {groupsForPicker.map((g) => {
                  const gid = toInt(g?.id);
                  const checked = pickedTargetGroupIdsArr.includes(gid);
                  return (
                    <label key={gid} className="px-3 py-2 flex items-start gap-2 cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setPickedTargetGroupIdsArr((prev) => {
                            const arr = normIdList(prev);
                            const next = arr.includes(gid) ? arr.filter((x) => x !== gid) : [...arr, gid];
                            setPickedTargetGroupIdsText(next.join(","));
                            return next;
                          });
                        }}
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate">
                          {pickGroupLabel(g)} <span className="text-gray-400 font-mono">#{gid}</span>
                        </div>
                        <div className="text-[11px] text-gray-500 truncate">{safeText(g?.description) || "—"}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <SmallBtn
              onClick={() => {
                setPickedTargetGroupIdsArr([]);
                setPickedTargetGroupIdsText("");
              }}
              className="text-red-600"
            >
              Clear
            </SmallBtn>
            <PrimaryBtn onClick={() => setOpenGroupsPicker(false)}>Done</PrimaryBtn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

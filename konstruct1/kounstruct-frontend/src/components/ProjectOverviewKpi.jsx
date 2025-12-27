// src/components/ProjectOverviewKpi.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  RefreshCcw,
  PlayCircle,
  Activity,
  ShieldCheck,
  X,
  Download,
  ExternalLink,
  ChevronDown,
  Search,
  CheckSquare,
  Square,
} from "lucide-react";

import {
  getUnitStageRoleSummary,
  fetchTowersByProject,
  getStageDetailsByProjectId,
  getLevelsWithFlatsByBuilding,
  getUnitChecklistReport,
  exportUnitChecklistReportExcel,
  getUnitWorkInProgressBreakdown,
} from "../api";

const API_BASE = "https://konstruct.world";

const authHeaders = () => ({
  Authorization: `Bearer ${
    localStorage.getItem("ACCESS_TOKEN") ||
    localStorage.getItem("TOKEN") ||
    localStorage.getItem("token") ||
    ""
  }`,
});

/* ---------------- helpers ---------------- */
const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const fmtInt = (v) => {
  const n = num(v);
  if (n === null) return "—";
  return n.toLocaleString("en-IN");
};

const titleize = (s) =>
  String(s || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());

const splitLabel = (label) => {
  const k = String(label || "").toLowerCase();
  if (k === "maker_pending") return "Maker Pending Unit";
  return titleize(label);
};

const roleLabel = (code) => {
  const c = String(code || "").toUpperCase();
  if (c === "MAKER") return "Maker";
  if (c === "INSPECTOR") return "Inspector";
  if (c === "CHECKER") return "Checker";
  if (c === "SUPERVISOR") return "Supervisor";
  return c || "—";
};

const pickRows = (data) => {
  if (!data || typeof data !== "object") return [];
  return (
    data.rows ||
    data.unit_rows ||
    data.results ||
    data.data?.rows ||
    data.data?.results ||
    []
  );
};

const pickMeta = (data) => {
  if (!data || typeof data !== "object") return {};
  return data.meta || data.data?.meta || data.result?.meta || {};
};

const pickColumns = (data, rowsFallback = []) => {
  const cols = data?.columns || data?.data?.columns;
  if (Array.isArray(cols) && cols.length) return cols;
  const first = rowsFallback?.[0];
  if (first && typeof first === "object") return Object.keys(first);
  return [];
};

const resolveProjectId = (routeParam) => {
  const rp = Number(routeParam);
  if (rp) return rp;

  try {
    const qp = new URLSearchParams(window.location.search).get("project_id");
    const qn = Number(qp);
    if (qn) return qn;
  } catch {}

  const ls =
    localStorage.getItem("ACTIVE_PROJECT_ID") ||
    localStorage.getItem("PROJECT_ID") ||
    localStorage.getItem("project_id");
  return Number(ls) || null;
};

const normalizeList = (res) => {
  const d = res?.data ?? res;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.results)) return d.results;
  if (Array.isArray(d?.data)) return d.data;
  return [];
};

const uniq = (arr) => Array.from(new Set((arr || []).filter(Boolean)));
const toCsv = (arr) => {
  const a = uniq(arr).map(String).filter(Boolean);
  return a.length ? a.join(",") : null;
};

const getFlatIdFromRow = (row) => {
  if (!row || typeof row !== "object") return null;
  return (
    row.flat_id ??
    row.flat ??
    row.unit_id ??
    row.unit ??
    row.id ??
    row.pk ??
    null
  );
};

const getNiceCellText = (v) => {
  if (v === null || v === undefined) return "—";
  if (typeof v === "object") return JSON.stringify(v);
  const s = String(v);
  return s === "" ? "—" : s;
};

const HIDE_COLS = new Set(["tower_id", "unit_id", "stage_id"]);
const PERCENT_COLS = new Set([
  "flat_readiness",
  "maker_percent_open",
  "maker_percent_close",
  "maker_flat_readiness_percent",
  "checker_percent_open",
  "checker_percent_close",
  "desnag_rejected_percent",
  "overall_percent",
]);

const RED_HIGHLIGHT_COLS = new Set([
  "flat_readiness",
  "maker_flat_readiness_percent",
]);
const DAYS_COUNT_COL = "no_of_days_count";

const fmtPercent = (v) => {
  const n = num(v);
  if (n === null) return "—";
  return `${Math.round(n)}%`;
};

const parseDateOnlyLocal = (ymd) => {
  const s = String(ymd || "").trim();
  if (!s) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(`${s}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
};

const daysDiff = (start, end) => {
  if (!start || !end) return null;
  const msPerDay = 24 * 60 * 60 * 1000;
  const diff = Math.floor((end.getTime() - start.getTime()) / msPerDay);
  return diff < 0 ? 0 : diff;
};

const computeDaysCount = (row) => {
  if (!row || typeof row !== "object") return null;

  const backendVal = row?.[DAYS_COUNT_COL];
  const backendNum = num(backendVal);
  if (backendNum !== null && String(backendVal).trim() !== "") {
    return Math.max(0, Math.floor(backendNum));
  }

  const s = parseDateOnlyLocal(row?.start_date);
  if (!s) return null;

  const e = parseDateOnlyLocal(row?.end_date);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = e || today;

  return daysDiff(s, end);
};

const formatCell = (colKey, value, row) => {
  const c = String(colKey || "");
  if (c === DAYS_COUNT_COL) {
    const d = computeDaysCount(row);
    return d === null ? "—" : String(d);
  }
  if (PERCENT_COLS.has(c)) return fmtPercent(value);
  return getNiceCellText(value);
};

function useDebouncedValue(value, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/* ---------------- UI components ---------------- */
const Card = ({ title, value, Icon, onClick }) => {
  const clickable = typeof onClick === "function";
  const Comp = clickable ? "button" : "div";
  return (
    <Comp
      type={clickable ? "button" : undefined}
      onClick={onClick}
      className={[
        "min-w-[220px] rounded-xl border bg-white px-4 py-3 shadow-sm text-left",
        "flex items-center justify-between gap-3",
        clickable ? "hover:bg-slate-50 cursor-pointer" : "",
      ].join(" ")}
    >
      <div className="min-w-0">
        <div className="text-[12px] font-medium text-slate-600">{title}</div>
        <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
      </div>
      <div className="shrink-0 rounded-lg border bg-slate-50 p-2 text-slate-700">
        <Icon size={18} />
      </div>
    </Comp>
  );
};

const MiniStat = ({ label, value }) => (
  <div className="rounded-lg border bg-white px-3 py-2">
    <div className="text-[11px] font-medium text-slate-600">{label}</div>
    <div className="mt-0.5 text-lg font-semibold text-slate-900">{value}</div>
  </div>
);

const ChipButton = ({ active, children, onClick, title }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={[
      "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
      active
        ? "border-slate-900 bg-slate-900 text-white"
        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    ].join(" ")}
  >
    {children}
  </button>
);

const FilterLabel = ({ children }) => (
  <div className="text-xs font-medium text-slate-600">{children}</div>
);

/** ✅ Multi-select dropdown with checkboxes + Search + Select All / Unselect All */
const MultiSelectDropdown = ({
  label,
  value = [],
  options = [],
  onChange,
  placeholder = "Select...",
  disabled = false,
  compact = false,
}) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const wrapRef = useRef(null);

  const selectedSet = useMemo(() => new Set((value || []).map(String)), [value]);

  const filtered = useMemo(() => {
    const s = String(q || "").trim().toLowerCase();
    if (!s) return options || [];
    return (options || []).filter((o) =>
      String(o?.label || "").toLowerCase().includes(s)
    );
  }, [q, options]);

  const selectedCount = (value || []).length;

  const buttonText = useMemo(() => {
    if (!selectedCount) return placeholder;
    if (selectedCount === 1) {
      const one = options.find((o) => String(o.value) === String(value[0]));
      return one?.label || "1 selected";
    }
    return `${selectedCount} selected`;
  }, [selectedCount, placeholder, options, value]);

  useEffect(() => {
    const onDown = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const toggleVal = (val) => {
    const v = String(val);
    const next = new Set((value || []).map(String));
    if (next.has(v)) next.delete(v);
    else next.add(v);
    onChange(Array.from(next));
  };

  const selectAllShown = () => {
    const next = new Set((value || []).map(String));
    filtered.forEach((o) => next.add(String(o.value)));
    onChange(Array.from(next));
  };

  const unselectAllShown = () => {
    const toRemove = new Set(filtered.map((o) => String(o.value)));
    const next = (value || []).map(String).filter((v) => !toRemove.has(v));
    onChange(next);
  };

  const clearAll = () => onChange([]);

  return (
    <div ref={wrapRef} className="relative">
      <FilterLabel>{label}</FilterLabel>

      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((s) => !s)}
        className={[
          "mt-1 w-full rounded-lg border bg-white px-3 py-2 text-left text-sm",
          "flex items-center justify-between gap-2",
          disabled ? "opacity-60 cursor-not-allowed" : "hover:bg-slate-50",
        ].join(" ")}
      >
        <span className={selectedCount ? "text-slate-900" : "text-slate-500"}>
          {buttonText}
        </span>
        <ChevronDown size={16} className="text-slate-500" />
      </button>

      {open ? (
        <div
          className={[
            "absolute z-30 mt-2 w-full rounded-xl border bg-white shadow-lg",
            compact ? "p-2" : "p-3",
          ].join(" ")}
        >
          <div className="flex items-center gap-2 rounded-lg border bg-white px-2 py-1.5">
            <Search size={14} className="text-slate-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={selectAllShown}
              className="rounded-lg border bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Select all
            </button>
            <button
              type="button"
              onClick={unselectAllShown}
              className="rounded-lg border bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Unselect all
            </button>
            {selectedCount ? (
              <button
                type="button"
                onClick={clearAll}
                className="ml-auto rounded-lg border bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Clear
              </button>
            ) : null}
          </div>

          <div className="mt-2 max-h-56 overflow-auto rounded-lg border">
            {filtered.length ? (
              filtered.map((o) => {
                const isOn = selectedSet.has(String(o.value));
                return (
                  <button
                    key={String(o.value)}
                    type="button"
                    onClick={() => toggleVal(o.value)}
                    className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 border-b last:border-0 hover:bg-slate-50"
                  >
                    {isOn ? (
                      <CheckSquare size={16} className="text-slate-900" />
                    ) : (
                      <Square size={16} className="text-slate-400" />
                    )}
                    <span className="text-slate-800">{o.label}</span>
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-3 text-sm text-slate-600">
                No options found.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

/* ---------------- Project name resolver ---------------- */
const safeJson = (s) => {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
};

const resolveProjectNameLocal = (projectId) => {
  const pid = String(projectId || "");

  // 1) direct keys
  const direct =
    localStorage.getItem("ACTIVE_PROJECT_NAME") ||
    localStorage.getItem("PROJECT_NAME") ||
    localStorage.getItem("project_name");
  if (direct && String(direct).trim()) return String(direct).trim();

  // 2) active object (common in many apps)
  const activeRaw = localStorage.getItem("active") || localStorage.getItem("ACTIVE_PROJECT");
  const active = safeJson(activeRaw);
  if (active && typeof active === "object") {
    // try common shapes
    const candidates = [
      active?.project_name,
      active?.projectName,
      active?.name,
      active?.title,
      active?.project?.name,
      active?.project?.project_name,
      active?.project?.title,
    ].filter(Boolean);

    if (candidates.length) return String(candidates[0]).trim();

    // sometimes active has id->name map
    if (active?.id && String(active.id) === pid) {
      const nm = active?.name || active?.project_name || active?.title;
      if (nm) return String(nm).trim();
    }
  }

  // 3) try a stored list
  const listRaw = localStorage.getItem("projects") || localStorage.getItem("PROJECTS");
  const list = safeJson(listRaw);
  if (Array.isArray(list)) {
    const found = list.find((x) => String(x?.id ?? x?.project_id ?? x?.pk) === pid);
    const nm = found?.name || found?.project_name || found?.title;
    if (nm) return String(nm).trim();
  }

  return "";
};

/**
 * ✅ New KPI Overview (top section)
 * + Project Name at top (ProjectOverview jaisa)
 */
export default function ProjectOverviewKpi({ projectId: projectIdProp = null }) {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const projectId = useMemo(() => {
    if (projectIdProp) return Number(projectIdProp) || projectIdProp;
    return resolveProjectId(params.projectId || params.id);
  }, [params, projectIdProp]);

  const [projectName, setProjectName] = useState("");

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [counts, setCounts] = useState({});
  const [meta, setMeta] = useState({});

  // filters (dropdown multi)
  const [stageIds, setStageIds] = useState([]);
  const [buildingIds, setBuildingIds] = useState([]);
  const [floorIds, setFloorIds] = useState([]);
  const [unitIds, setUnitIds] = useState([]);
  const [pendingFrom, setPendingFrom] = useState([]);

  // dropdown options
  const [stageOptions, setStageOptions] = useState([]);
  const [buildingOptions, setBuildingOptions] = useState([]);
  const [floorOptions, setFloorOptions] = useState([]);

  // keep all units + filtered units (by floor)
  const [unitAllOptions, setUnitAllOptions] = useState([]); // [{value,label,floorKey}]
  const [unitOptions, setUnitOptions] = useState([]); // filtered for dropdown UI

  /* ---------------- WIP MODAL STATES ---------------- */
  const [wipOpen, setWipOpen] = useState(false);

  const [wipLoading, setWipLoading] = useState(false);
  const [wipErr, setWipErr] = useState("");
  const [wipRows, setWipRows] = useState([]);
  const [wipMeta, setWipMeta] = useState({});
  const [wipCols, setWipCols] = useState([]);

  const [wipBreakdownLoading, setWipBreakdownLoading] = useState(false);
  const [wipBreakdownErr, setWipBreakdownErr] = useState("");
  const [wipBreakdown, setWipBreakdown] = useState(null);

  const [wipCtx, setWipCtx] = useState({
    stageId: null,
    towerId: null,
    flatCsv: null,
  });

  const [wipRole, setWipRole] = useState("");
  const debouncedWipRole = useDebouncedValue(wipRole, 250);

  const [openingFlatId, setOpeningFlatId] = useState(null);

  /* ---------------- anti-spam + strictmode guards ---------------- */
  const didInitRef = useRef({ projectId: null });
  const abortRef = useRef({
    summary: null,
    wipTable: null,
    wipBreakdown: null,
    flatPrefetch: null,
    projectName: null,
  });

  const newSignal = (key) => {
    try {
      abortRef.current[key]?.abort?.();
    } catch {}
    const ac = new AbortController();
    abortRef.current[key] = ac;
    return ac.signal;
  };

  useEffect(() => {
    return () => {
      Object.values(abortRef.current).forEach((ac) => {
        try {
          ac?.abort?.();
        } catch {}
      });
    };
  }, []);

  const stageNameById = useMemo(() => {
    const m = new Map();
    (stageOptions || []).forEach((o) => m.set(String(o.value), o.label));
    return m;
  }, [stageOptions]);

  const towerNameById = useMemo(() => {
    const m = new Map();
    (buildingOptions || []).forEach((o) => m.set(String(o.value), o.label));
    return m;
  }, [buildingOptions]);

  const floorNameByKey = useMemo(() => {
    const m = new Map();
    (floorOptions || []).forEach((o) => m.set(String(o.value), o.label));
    return m;
  }, [floorOptions]);

  const unitsByFloorKeys = useMemo(() => {
    const map = new Map(); // floorKey -> [unitIds]
    (unitAllOptions || []).forEach((u) => {
      const fk = String(u.floorKey || "");
      if (!fk) return;
      if (!map.has(fk)) map.set(fk, []);
      map.get(fk).push(String(u.value));
    });
    return map;
  }, [unitAllOptions]);

  /* ✅ project name fetch (best-effort) */
  const fetchProjectName = useCallback(
    async (pid) => {
      if (!pid) return;

      // 1) location.state (if your ProjectOverview passes it)
      const stName =
        location?.state?.projectName ||
        location?.state?.project_name ||
        location?.state?.project?.name ||
        location?.state?.project?.project_name ||
        "";
      if (stName && String(stName).trim()) {
        setProjectName(String(stName).trim());
        return;
      }

      // 2) localStorage
      const local = resolveProjectNameLocal(pid);
      if (local) {
        setProjectName(local);
        return;
      }

      // 3) API (try a few likely endpoints)
      try {
        const signal = newSignal("projectName");
        const endpoints = [
          `${API_BASE}/api/setup/projects/${pid}/`,
          `${API_BASE}/setup/projects/${pid}/`,
          `${API_BASE}/api/projects/${pid}/`,
          `${API_BASE}/projects/${pid}/`,
        ];

        for (const url of endpoints) {
          try {
            const res = await axios.get(url, {
              headers: authHeaders(),
              signal,
            });
            const d = res?.data ?? null;

            const name =
              d?.name ||
              d?.project_name ||
              d?.title ||
              d?.data?.name ||
              d?.data?.project_name ||
              d?.result?.name ||
              d?.result?.project_name ||
              "";

            if (name && String(name).trim()) {
              setProjectName(String(name).trim());
              return;
            }
          } catch (e) {
            if (e?.name === "CanceledError" || e?.code === "ERR_CANCELED") return;
            // ignore and try next endpoint
          }
        }
      } catch {
        // ignore
      }
    },
    [location]
  );

  const getSelectedFilters = useCallback(() => {
    const stages = uniq(stageIds);
    const towers = uniq(buildingIds);
    const floors = uniq(floorIds);

    let flats = uniq(unitIds);

    // ✅ if floor selected but units not selected → auto include all units from selected floors
    if (floors.length && !flats.length) {
      const all = [];
      floors.forEach((fk) => {
        const list = unitsByFloorKeys.get(String(fk)) || [];
        all.push(...list);
      });
      flats = uniq(all);
    }

    const roles = uniq(pendingFrom);
    return { stages, towers, floors, flats, roles };
  }, [stageIds, buildingIds, floorIds, unitIds, pendingFrom, unitsByFloorKeys]);

  const buildPayload = useCallback(() => {
    const { stages, towers, flats, roles } = getSelectedFilters();
    const payload = { project_id: projectId };

    if (stages.length) payload.stage_id = stages;
    if (towers.length) payload.building_id = towers;

    // ✅ main filter is unit_id (safer than sending floor_id)
    if (flats.length) payload.unit_id = flats;

    if (roles.length) payload.pending_from = roles;
    return payload;
  }, [getSelectedFilters, projectId]);

  const buildModalReportParams = useCallback(
    ({ include_rows = true, limit = 200 } = {}) => {
      const stageId = wipCtx?.stageId;
      const towerId = wipCtx?.towerId;

      const p = { project_id: projectId, group_by: "stage" };

      if (stageId) {
        p.stage_id = String(stageId);
        p.stage_ids = String(stageId);
      }

      if (towerId) {
        p.tower_id = String(towerId);
        p.building_id = String(towerId);
      }

      if (wipCtx?.flatCsv) {
        p.flat_id = String(wipCtx.flatCsv);
        p.unit_id = String(wipCtx.flatCsv);
      }

      if (debouncedWipRole) p.pending_from = String(debouncedWipRole);

      if (include_rows) p.include_rows = true;
      if (limit) p.limit = limit;

      return p;
    },
    [projectId, wipCtx, debouncedWipRole]
  );

  const buildModalBreakdownParams = useCallback(() => {
    const stageId = wipCtx?.stageId;
    const towerId = wipCtx?.towerId;

    const p = { project_id: projectId };
    if (stageId) p.stage_id = Number(stageId);
    if (towerId) p.tower_id = Number(towerId);
    if (debouncedWipRole) p.pending_from = String(debouncedWipRole);
    return p;
  }, [projectId, wipCtx, debouncedWipRole]);

  const fetchSummary = useCallback(async () => {
    if (!projectId) {
      setErr("Project not selected. (project_id missing)");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErr("");

    try {
      const signal = newSignal("summary");
      const res = await getUnitStageRoleSummary(buildPayload(), { signal });
      const data = res?.data ?? res;

      setCounts(data?.counts || data?.data?.counts || data?.result?.counts || {});
      setMeta(data?.meta || data?.data?.meta || data?.result?.meta || {});
    } catch (e) {
      if (e?.name === "CanceledError" || e?.code === "ERR_CANCELED") return;
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        e?.message ||
        "Failed to load overview";
      setErr(String(msg));
    } finally {
      setLoading(false);
    }
  }, [projectId, buildPayload]);

  const fetchFilterOptions = useCallback(async () => {
    if (!projectId) return;

    try {
      const [stagesRes, buildingsRes] = await Promise.allSettled([
        getStageDetailsByProjectId(projectId),
        fetchTowersByProject(projectId),
      ]);

      if (stagesRes.status === "fulfilled") {
        const list = normalizeList(stagesRes.value);
        setStageOptions(
          list
            .map((x) => ({
              value: String(x.id ?? x.stage_id ?? x.pk ?? ""),
              label: x.name ?? x.stage_name ?? x.title ?? `Stage #${x.id}`,
            }))
            .filter((o) => o.value)
        );
      } else setStageOptions([]);

      if (buildingsRes.status === "fulfilled") {
        const list = normalizeList(buildingsRes.value);
        setBuildingOptions(
          list
            .map((x) => ({
              value: String(x.id ?? x.building_id ?? x.pk ?? ""),
              label:
                x.name ??
                x.building_name ??
                x.tower_name ??
                x.title ??
                `Building #${x.id}`,
            }))
            .filter((o) => o.value)
        );
      } else setBuildingOptions([]);
    } catch {
      setStageOptions([]);
      setBuildingOptions([]);
    }
  }, [projectId]);

  /** ✅ fetch floors + units (dependent on selected buildings) */
  const fetchFloorsAndUnitsFromBuildings = useCallback(
    async (buildingIdList) => {
      const ids = uniq(buildingIdList).map(String);
      if (!ids.length) {
        setFloorOptions([]);
        setUnitAllOptions([]);
        setUnitOptions([]);
        setFloorIds([]);
        setUnitIds([]);
        return;
      }

      const settled = await Promise.allSettled(
        ids.map((bid) => getLevelsWithFlatsByBuilding(bid))
      );

      const floorMap = new Map(); // floorKey -> {value,label}
      const unitMap = new Map(); // unitId -> {value,label,floorKey}

      settled.forEach((r, idx) => {
        if (r.status !== "fulfilled") return;

        const bid = ids[idx];
        const towerLabel = towerNameById.get(String(bid)) || `Tower #${bid}`;

        const levels = normalizeList(r.value);
        levels.forEach((lvl) => {
          const floorName = lvl?.name ? String(lvl.name) : "Floor";
          const rawLevelId =
            lvl?.id ?? lvl?.floor_id ?? lvl?.level_id ?? lvl?.pk ?? null;

          const floorKey = `${bid}:${String(rawLevelId ?? floorName)}`;
          const floorLabel = `${towerLabel} • ${floorName}`;

          floorMap.set(floorKey, { value: floorKey, label: floorLabel });

          const flats = Array.isArray(lvl?.flats) ? lvl.flats : [];
          flats.forEach((f) => {
            const id = f?.id ?? f?.flat_id ?? f?.pk;
            if (!id) return;

            const number =
              f?.number ??
              f?.flat_number ??
              f?.unit_no ??
              f?.unit_number ??
              f?.name ??
              "";

            const typeName =
              f?.flattype?.type_name ??
              f?.flat_type?.type_name ??
              f?.flat_type_name ??
              "";

            const labelParts = [];
            if (number) labelParts.push(String(number));
            if (floorName) labelParts.push(floorName);

            const label = labelParts.join(" • ") || `Unit #${id}`;
            const finalLabel = typeName ? `${label} (${typeName})` : label;

            unitMap.set(String(id), {
              value: String(id),
              label: finalLabel,
              floorKey,
            });
          });
        });
      });

      const floors = Array.from(floorMap.values()).sort((a, b) =>
        String(a.label).localeCompare(String(b.label))
      );
      const allUnits = Array.from(unitMap.values());

      allUnits.sort((a, b) => {
        const na = parseInt(String(a.label).match(/\d+/)?.[0] || "0", 10);
        const nb = parseInt(String(b.label).match(/\d+/)?.[0] || "0", 10);
        return na - nb;
      });

      setFloorOptions(floors);
      setUnitAllOptions(allUnits);

      const allowedFloors = new Set(floors.map((f) => String(f.value)));
      setFloorIds((prev) => (prev || []).filter((x) => allowedFloors.has(String(x))));

      const allowedUnits = new Set(allUnits.map((u) => String(u.value)));
      setUnitIds((prev) => (prev || []).filter((x) => allowedUnits.has(String(x))));
    },
    [towerNameById]
  );

  /** ✅ filter unit dropdown list based on selected floors (UI only) */
  useEffect(() => {
    const floors = new Set((floorIds || []).map(String));
    let next = unitAllOptions || [];

    if (floors.size) next = next.filter((u) => floors.has(String(u.floorKey)));

    setUnitOptions(next);

    const allowed = new Set(next.map((u) => String(u.value)));
    setUnitIds((prev) => (prev || []).filter((x) => allowed.has(String(x))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [floorIds, unitAllOptions]);

  useEffect(() => {
    if (!projectId) return;

    if (didInitRef.current.projectId === projectId) return;
    didInitRef.current.projectId = projectId;

    setStageIds([]);
    setBuildingIds([]);
    setFloorIds([]);
    setUnitIds([]);
    setPendingFrom([]);

    setFloorOptions([]);
    setUnitAllOptions([]);
    setUnitOptions([]);

    fetchFilterOptions();
    fetchSummary();
    fetchProjectName(projectId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;
    fetchFloorsAndUnitsFromBuildings(buildingIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, buildingIds]);

  const resetFilters = () => {
    setStageIds([]);
    setBuildingIds([]);
    setFloorIds([]);
    setUnitIds([]);
    setPendingFrom([]);
    fetchSummary();
  };

  /* ---------------- WIP modal data ---------------- */
  const fetchWipTable = useCallback(async () => {
    if (!projectId) return;
    if (!wipCtx?.stageId) return;

    setWipLoading(true);
    setWipErr("");

    try {
      const signal = newSignal("wipTable");
      const params = buildModalReportParams({ include_rows: true, limit: 200 });
      const res = await getUnitChecklistReport(params, { signal });
      const data = res?.data ?? res;

      const rows = pickRows(data);
      const cols = pickColumns(data, rows);

      setWipRows(Array.isArray(rows) ? rows : []);
      setWipCols(Array.isArray(cols) ? cols : []);
      setWipMeta(pickMeta(data));
    } catch (e) {
      if (e?.name === "CanceledError" || e?.code === "ERR_CANCELED") return;
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        e?.message ||
        "Failed to load report table";
      setWipErr(String(msg));
    } finally {
      setWipLoading(false);
    }
  }, [projectId, wipCtx, buildModalReportParams]);

  const fetchWipBreakdown = useCallback(async () => {
    if (!projectId) return;
    if (!wipCtx?.stageId) return;

    setWipBreakdownLoading(true);
    setWipBreakdownErr("");

    try {
      const signal = newSignal("wipBreakdown");
      const params = buildModalBreakdownParams();
      const res = await getUnitWorkInProgressBreakdown(params, { signal });
      const data = res?.data ?? res;

      setWipBreakdown(data && typeof data === "object" ? data : null);
    } catch (e) {
      if (e?.name === "CanceledError" || e?.code === "ERR_CANCELED") return;
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        e?.message ||
        "Failed to load breakdown";
      setWipBreakdownErr(String(msg));
    } finally {
      setWipBreakdownLoading(false);
    }
  }, [projectId, wipCtx, buildModalBreakdownParams]);

  const refreshWipAll = useCallback(async () => {
    await Promise.allSettled([fetchWipTable(), fetchWipBreakdown()]);
  }, [fetchWipTable, fetchWipBreakdown]);

  useEffect(() => {
    if (!wipOpen) return;
    if (!projectId) return;
    if (!wipCtx?.stageId) return;
    refreshWipAll();
  }, [
    wipOpen,
    projectId,
    wipCtx?.stageId,
    wipCtx?.towerId,
    wipCtx?.flatCsv,
    debouncedWipRole,
    refreshWipAll,
  ]);

  const openWipModal = async () => {
    setWipOpen(true);

    setWipErr("");
    setWipRows([]);
    setWipMeta({});
    setWipCols([]);

    setWipBreakdownErr("");
    setWipBreakdown(null);

    setWipRole("");

    const { stages, towers, flats } = getSelectedFilters();
    if (!stages.length) {
      setWipErr("Select at least one Stage first (stage_ids required).");
      return;
    }

    const pickedStage = stages[0];
    const pickedTower = towers?.[0] || null;
    const flatCsv = toCsv(flats);

    setWipCtx({ stageId: pickedStage, towerId: pickedTower, flatCsv });
  };

  const exportWipExcel = async () => {
    const stageId = wipCtx?.stageId;
    if (!stageId) {
      setWipErr("Select at least one Stage first (stage_ids required).");
      return;
    }

    try {
      const params = buildModalReportParams({ include_rows: true, limit: 200 });
      await exportUnitChecklistReportExcel(params);
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        e?.message ||
        "Export failed";
      setWipErr(String(msg));
    }
  };

  const wipColumns = useMemo(() => {
    const cols =
      (Array.isArray(wipCols) && wipCols.length ? wipCols : null) ||
      (wipRows?.[0] && typeof wipRows[0] === "object"
        ? Object.keys(wipRows[0])
        : []);
    return (cols || []).filter((c) => !HIDE_COLS.has(String(c)));
  }, [wipCols, wipRows]);

  const breakdownMeta = wipBreakdown?.meta || {};
  const wipUnitCount = wipBreakdown?.work_in_progress_units?.count ?? null;
  const byPendingFrom = wipBreakdown?.breakdown?.by_pending_from || {};
  const makerSupervisorSplit = wipBreakdown?.breakdown?.maker_supervisor_split || {};
  const modalAsOf = breakdownMeta?.as_of || wipMeta?.as_of || "";

  const cards = useMemo(
    () => [
      { key: "total_units", title: "Total Units", value: fmtInt(counts.total_units), Icon: ClipboardList },
      { key: "pending_yet_to_start", title: "Pending (Yet to Start)", value: fmtInt(counts.pending_yet_to_start), Icon: Clock },
      { key: "initialised_unit_count", title: "Initialized Units", value: fmtInt(counts.initialised_unit_count), Icon: PlayCircle },
      { key: "work_in_progress_unit", title: "Unit Work In Progress", value: fmtInt(counts.work_in_progress_unit), Icon: Activity, onClick: openWipModal },
      { key: "yet_to_verify", title: "Yet to Verify (Questions)", value: fmtInt(counts.yet_to_verify), Icon: ShieldCheck },
      { key: "complete", title: "Complete", value: fmtInt(counts.complete), Icon: CheckCircle2 },
    ],
    [counts]
  );

  const RoleChip = ({ code, label }) => {
    const active = pendingFrom.includes(code);
    return (
      <button
        type="button"
        onClick={() =>
          setPendingFrom((prev) =>
            active ? prev.filter((x) => x !== code) : [...prev, code]
          )
        }
        className={[
          "rounded-full border px-3 py-1 text-xs font-medium",
          active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
        ].join(" ")}
      >
        {label}
      </button>
    );
  };

  const activeFiltersText = useMemo(() => {
    const { stages, towers, floors, flats, roles } = getSelectedFilters();

    const sNames = stages
      .map((id) => stageNameById.get(String(id)) || `Stage#${id}`)
      .slice(0, 4);

    const tNames = towers
      .map((id) => towerNameById.get(String(id)) || `Tower#${id}`)
      .slice(0, 3);

    const fNames = floors
      .map((fk) => floorNameByKey.get(String(fk)) || String(fk))
      .slice(0, 2);

    const parts = [];
    if (stages.length) parts.push(`Stage: ${sNames.join(", ")}${stages.length > 4 ? "…" : ""}`);
    if (towers.length) parts.push(`Tower: ${tNames.join(", ")}${towers.length > 3 ? "…" : ""}`);
    if (floors.length) parts.push(`Floor: ${fNames.join(", ")}${floors.length > 2 ? "…" : ""}`);
    if (flats.length) parts.push(`Units: ${flats.length}`);
    if (roles.length) parts.push(`Pending From: ${roles.join(", ")}`);

    return parts.length ? parts.join(" • ") : "No extra filters";
  }, [getSelectedFilters, stageNameById, towerNameById, floorNameByKey]);

  const modalStageName = useMemo(() => {
    const sid = wipCtx?.stageId;
    if (!sid) return "";
    return stageNameById.get(String(sid)) || `Stage #${sid}`;
  }, [wipCtx, stageNameById]);

  const modalTowerName = useMemo(() => {
    const tid = wipCtx?.towerId;
    if (!tid) return "";
    return towerNameById.get(String(tid)) || `Tower #${tid}`;
  }, [wipCtx, towerNameById]);

  const goToFlatReport = async (row) => {
    const flatId = getFlatIdFromRow(row);
    if (!flatId) {
      setWipErr("Flat ID not found in this row (cannot open flat report).");
      return;
    }

    if (openingFlatId === String(flatId)) return;

    setWipErr("");
    setOpeningFlatId(String(flatId));

    const paramsReq = { project_id: projectId, flat_id: flatId };
    if (wipCtx?.stageId) paramsReq.stage_id = wipCtx.stageId;
    if (wipCtx?.towerId) paramsReq.building_id = wipCtx.towerId;

    try {
      const signal = newSignal("flatPrefetch");

      const res = await axios.get(`${API_BASE}/checklists/stats/flat-room/`, {
        params: paramsReq,
        headers: authHeaders(),
        signal,
      });

      const prefetchedStats = res?.data ?? null;

      const flatMeta = {
        number: row.flat_number ?? row.unit_number ?? row.number ?? row.unit_no ?? row.unit_label ?? null,
        typeName: row.flat_type_name ?? row.unit_type_name ?? row.type_name ?? row.type ?? null,
        levelName: row.level_name ?? row.floor_name ?? row.level ?? null,
      };

      const filters = { stageId: wipCtx?.stageId || null, buildingId: wipCtx?.towerId || null };
      const path = `/projects/${projectId}/flat-report/${flatId}`;

      setWipOpen(false);
      navigate(path, { state: { prefetchedStats, flatMeta, filters } });
    } catch (e) {
      if (e?.name === "CanceledError" || e?.code === "ERR_CANCELED") return;

      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        e?.message ||
        "Failed to open flat report (prefetch failed).";
      setWipErr(String(msg));
    } finally {
      setOpeningFlatId(null);
    }
  };

  const toggleModalRole = (roleCode) => {
    const code = String(roleCode || "").toUpperCase();
    setWipRole((prev) => (prev === code ? "" : code));
  };

  return (
    <div className="p-4 md:p-6">
      {/* header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {/* ✅ Project Name at top */}
          <div className="text-xl font-semibold text-slate-900 truncate">
            {projectName ? projectName : projectId ? `Project #${projectId}` : "Project"}
          </div>
          <div className="mt-0.5 text-xs text-slate-500">
           
            <button
                type="button"
                onClick={() => navigate("/config")}
                className="w-10 h-10 rounded-xl border font-black"
                // style={{
                //   borderColor: theme === "dark" ? "#334155" : "#e2e8f0",
                //   color: textColor,
                //   background: theme === "dark" ? "rgba(2,6,23,0.45)" : "rgba(248,250,252,0.9)",
                // }}
              >
                ←
              </button>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchSummary}
          className="inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <RefreshCcw size={16} />
          Refresh
        </button>
      </div>

      {/* filters */}
      <div className="mb-4 rounded-xl border bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm font-semibold text-slate-900">Filters</div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-lg border bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={fetchSummary}
              className="rounded-lg border border-slate-900 bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:opacity-90"
            >
              Apply
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <MultiSelectDropdown
            label="Stages"
            value={stageIds}
            options={stageOptions}
            onChange={setStageIds}
            placeholder="Select stages"
          />

          <MultiSelectDropdown
            label="Buildings / Towers"
            value={buildingIds}
            options={buildingOptions}
            onChange={(vals) => {
              setBuildingIds(vals);
              setFloorIds([]);
              setUnitIds([]);
            }}
            placeholder="Select towers"
          />

          <MultiSelectDropdown
            label="Floors"
            value={floorIds}
            options={floorOptions}
            onChange={(vals) => {
              setFloorIds(vals);
              setUnitIds([]);
            }}
            placeholder={buildingIds.length ? "Select floors" : "Select tower first"}
            disabled={!buildingIds.length}
          />

          <MultiSelectDropdown
            label="Units"
            value={unitIds}
            options={unitOptions}
            onChange={setUnitIds}
            placeholder={
              !buildingIds.length
                ? "Select tower first"
                : floorIds.length
                ? "Select units (filtered by floor)"
                : "Select units"
            }
            disabled={!buildingIds.length}
          />
        </div>

        <div className="mt-4">
          <FilterLabel>Pending From (optional)</FilterLabel>
          <div className="mt-2 flex flex-wrap gap-2">
            <RoleChip code="MAKER" label="Maker" />
            <RoleChip code="INSPECTOR" label="Inspector" />
            <RoleChip code="CHECKER" label="Checker" />
            <RoleChip code="SUPERVISOR" label="Supervisor" />
          </div>
        </div>
      </div>

      {err ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      ) : null}

      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-900">KPIs</div>
        <div className="text-xs text-slate-500">Scroll horizontally if needed</div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="min-w-[220px] h-[76px] animate-pulse rounded-xl border bg-white px-4 py-3"
              >
                <div className="h-3 w-28 rounded bg-slate-100" />
                <div className="mt-3 h-6 w-16 rounded bg-slate-100" />
              </div>
            ))
          : cards.map((c) => (
              <Card
                key={c.key}
                title={c.title}
                value={c.value}
                Icon={c.Icon}
                onClick={c.onClick}
              />
            ))}
      </div>

      {/* ---------------- WIP MODAL ---------------- */}
      {wipOpen ? (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/40"
          onMouseDown={() => setWipOpen(false)}
        >
          <div className="min-h-full px-4 pb-10 pt-20 md:pt-24">
            <div
              className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 border-b bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-base font-semibold text-slate-900">
                      Work In Progress Breakdown
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {modalStageName ? <span>Stage: {modalStageName}</span> : null}
                      {modalTowerName ? <span> • Tower: {modalTowerName}</span> : null}
                      {wipRole ? <span> • Role: {roleLabel(wipRole)}</span> : null}
                      {modalAsOf ? <span> • As of: {modalAsOf}</span> : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={refreshWipAll}
                      className="inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <RefreshCcw size={14} />
                      Refresh
                    </button>

                    <button
                      type="button"
                      onClick={exportWipExcel}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-900 bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:opacity-90"
                    >
                      <Download size={14} />
                      Export Excel
                    </button>

                    <button
                      type="button"
                      onClick={() => setWipOpen(false)}
                      className="rounded-lg border bg-white p-2 text-slate-700 hover:bg-slate-50"
                      aria-label="Close"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4">
                {wipBreakdownErr ? (
                  <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {wipBreakdownErr}
                  </div>
                ) : null}

                {wipErr ? (
                  <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {wipErr}
                  </div>
                ) : null}

                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-semibold text-slate-700">Summary</div>

                  <div className="flex flex-wrap items-center gap-2">
                    <ChipButton active={!wipRole} onClick={() => setWipRole("")} title="Show all roles">
                      All Roles
                    </ChipButton>

                    {Object.keys(byPendingFrom || {}).map((k) => (
                      <ChipButton
                        key={k}
                        active={String(wipRole).toUpperCase() === String(k).toUpperCase()}
                        onClick={() => toggleModalRole(k)}
                        title="Filter table + breakdown by this role"
                      >
                        {roleLabel(k)} • {fmtInt(byPendingFrom[k])}
                      </ChipButton>
                    ))}
                  </div>
                </div>

                {wipBreakdownLoading ? (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-[54px] animate-pulse rounded-lg border bg-white px-3 py-2">
                        <div className="h-3 w-20 rounded bg-slate-100" />
                        <div className="mt-2 h-5 w-12 rounded bg-slate-100" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <MiniStat label="WIP Units" value={fmtInt(wipUnitCount)} />
                    <MiniStat label="Role Filter" value={wipRole ? roleLabel(wipRole) : "—"} />

                    {makerSupervisorSplit &&
                    typeof makerSupervisorSplit === "object" &&
                    Object.keys(makerSupervisorSplit).length ? (
                      <div className="mt-3 rounded-xl border bg-slate-50 p-3 sm:col-span-4">
                        <div className="mb-2 text-xs font-semibold text-slate-700">
                          Maker / Supervisor Split
                        </div>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {[
                            ["maker_pending", "units_with_maker_pending"],
                            ["supervisor_pending", "units_with_supervisor_pending"],
                          ].map(([label, key]) => (
                            <MiniStat
                              key={key}
                              label={splitLabel(label)}
                              value={fmtInt(makerSupervisorSplit?.[key])}
                            />
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}

                <div className="mt-4 rounded-2xl border">
                  <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
                    <div className="text-sm font-semibold text-slate-900">
                      Excel Table Preview
                    </div>
                  </div>

                  {wipLoading ? (
                    <div className="p-4 text-sm text-slate-600">Loading...</div>
                  ) : !wipRows?.length ? (
                    <div className="p-4 text-sm text-slate-600">No rows returned.</div>
                  ) : (
                    <div className="max-h-[56vh] overflow-auto">
                      <table className="min-w-max w-full text-sm">
                        <thead className="sticky top-0 bg-white">
                          <tr className="border-b">
                            <th className="whitespace-nowrap px-4 py-2 text-left text-[11px] font-semibold text-slate-600">
                              Open
                            </th>

                            {wipColumns.map((k) => {
                              const colKey = String(k);
                              const isRed = RED_HIGHLIGHT_COLS.has(colKey);
                              return (
                                <th
                                  key={colKey}
                                  className={[
                                    "whitespace-nowrap px-4 py-2 text-left text-[11px] font-semibold",
                                    isRed ? "bg-red-50 text-red-700" : "text-slate-600",
                                  ].join(" ")}
                                >
                                  {colKey.replace(/_/g, " ")}
                                </th>
                              );
                            })}
                          </tr>
                        </thead>

                        <tbody>
                          {wipRows.map((row, idx) => {
                            const flatId = getFlatIdFromRow(row);
                            const clickable = Boolean(flatId);

                            return (
                              <tr
                                key={idx}
                                className={[
                                  "border-b last:border-0",
                                  clickable ? "cursor-pointer hover:bg-slate-50" : "",
                                ].join(" ")}
                                onClick={() => {
                                  if (clickable) goToFlatReport(row);
                                }}
                              >
                                <td className="whitespace-nowrap px-4 py-2 text-slate-700">
                                  {clickable ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium">
                                      {openingFlatId === String(flatId) ? (
                                        "Opening..."
                                      ) : (
                                        <>
                                          <ExternalLink size={14} />
                                          Open
                                        </>
                                      )}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-slate-400">—</span>
                                  )}
                                </td>

                                {wipColumns.map((k) => {
                                  const colKey = String(k);
                                  const v = row?.[colKey];
                                  const txt = formatCell(colKey, v, row);
                                  const isRed = RED_HIGHLIGHT_COLS.has(colKey);

                                  return (
                                    <td
                                      key={colKey}
                                      className={[
                                        "whitespace-nowrap px-4 py-2",
                                        isRed ? "bg-red-50 font-semibold text-red-700" : "text-slate-800",
                                      ].join(" ")}
                                      title={txt}
                                    >
                                      {txt}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* meta if you want */}
                {modalAsOf ? (
                  <div className="mt-3 text-[11px] text-slate-500">
                    As of: {modalAsOf}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="h-6" />
          </div>
        </div>
      ) : null}
    </div>
  );
}

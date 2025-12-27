// ProjectOverview.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
} from "lucide-react";

import {
  getUnitStageRoleSummary,
  fetchTowersByProject,
  getStageDetailsByProjectId,
  getLevelsWithFlatsByBuilding,

  // ✅ Table + Excel (same API family)
  getUnitChecklistReport,
  exportUnitChecklistReportExcel,

  // ✅ breakdown API (cards in modal)
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

const parseCsvIds = (s) =>
  String(s || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

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

/* ✅ Hide these columns in modal table display (still available in row for click) */
const HIDE_COLS = new Set(["tower_id", "unit_id", "stage_id"]);

/* ✅ Columns that must show % */
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

/* ✅ Columns to highlight in red */
const RED_HIGHLIGHT_COLS = new Set([
  "flat_readiness",
  "maker_flat_readiness_percent",
]);

/* ✅ Column where we show day-count */
const DAYS_COUNT_COL = "no_of_days_count";

/* ✅ percent formatter */
const fmtPercent = (v) => {
  const n = num(v);
  if (n === null) return "—";
  // show 100% not 100.00%
  if (Math.abs(n - Math.round(n)) < 1e-9) return `${Math.round(n)}%`;
  return `${n.toFixed(2)}%`;
};

/* ✅ date helpers (local midnight, India no DST so safe) */
const parseDateOnlyLocal = (ymd) => {
  const s = String(ymd || "").trim();
  if (!s) return null;
  // Expect YYYY-MM-DD
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

/* ✅ compute days count: start_date -> (end_date if present else today) */
const computeDaysCount = (row) => {
  if (!row || typeof row !== "object") return null;

  // if backend already gave a usable number, keep it (especially when end_date exists)
  const backendVal = row?.[DAYS_COUNT_COL];
  const backendNum = num(backendVal);
  if (backendNum !== null && String(backendVal).trim() !== "") {
    return Math.max(0, Math.floor(backendNum));
  }

  const s = parseDateOnlyLocal(row?.start_date);
  if (!s) return null;

  const e = parseDateOnlyLocal(row?.end_date);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // local midnight
  const end = e || today;

  return daysDiff(s, end);
};

/* ✅ Format cell based on column rules */
const formatCell = (colKey, value, row) => {
  const c = String(colKey || "");
  if (c === DAYS_COUNT_COL) {
    const d = computeDaysCount(row);
    return d === null ? "—" : String(d);
  }
  if (PERCENT_COLS.has(c)) return fmtPercent(value);
  return getNiceCellText(value);
};

/* ---------------- tiny debounce hook ---------------- */
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
        "rounded-xl border bg-white p-4 shadow-sm text-left",
        clickable ? "hover:bg-slate-50 cursor-pointer" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-medium text-slate-700">{title}</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">
            {value}
          </div>
        </div>
        <div className="shrink-0 rounded-lg border bg-slate-50 p-2 text-slate-700">
          <Icon size={18} />
        </div>
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

const MultiSelect = ({
  value,
  options,
  onChange,
  placeholder = "Select...",
}) => (
  <select
    multiple
    value={value}
    onChange={(e) => {
      const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
      onChange(selected);
    }}
    className="mt-1 h-24 w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-slate-200"
  >
    {options.length === 0 ? (
      <option value="" disabled>
        {placeholder}
      </option>
    ) : null}
    {options.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </select>
);

export default function ProjectOverview() {
  const params = useParams();
  const navigate = useNavigate();

  const projectId = useMemo(
    () => resolveProjectId(params.projectId || params.id),
    [params]
  );

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [counts, setCounts] = useState({});
  const [meta, setMeta] = useState({});

  // filters
  const [stageIds, setStageIds] = useState([]);
  const [buildingIds, setBuildingIds] = useState([]);
  const [unitIds, setUnitIds] = useState([]);
  const [pendingFrom, setPendingFrom] = useState([]);

  // CSV inputs
  const [stageCsv, setStageCsv] = useState("");
  const [buildingCsv, setBuildingCsv] = useState("");
  const [unitCsv, setUnitCsv] = useState("");

  // dropdown options
  const [stageOptions, setStageOptions] = useState([]);
  const [buildingOptions, setBuildingOptions] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);

  /* ---------------- WIP MODAL STATES ---------------- */
  const [wipOpen, setWipOpen] = useState(false);

  // table (excel table preview)
  const [wipLoading, setWipLoading] = useState(false);
  const [wipErr, setWipErr] = useState("");
  const [wipRows, setWipRows] = useState([]);
  const [wipMeta, setWipMeta] = useState({});
  const [wipCols, setWipCols] = useState([]);

  // breakdown (cards content)
  const [wipBreakdownLoading, setWipBreakdownLoading] = useState(false);
  const [wipBreakdownErr, setWipBreakdownErr] = useState("");
  const [wipBreakdown, setWipBreakdown] = useState(null);

  // lock modal context (so both table + breakdown use SAME stage/tower + flats snapshot)
  const [wipCtx, setWipCtx] = useState({
    stageId: null,
    towerId: null,
    flatCsv: null,
  });

  // ✅ modal-only role filter (debounced)
  const [wipRole, setWipRole] = useState(""); // "", "MAKER", etc.
  const debouncedWipRole = useDebouncedValue(wipRole, 250);

  // ✅ opening flat (avoid double click + show "Opening...")
  const [openingFlatId, setOpeningFlatId] = useState(null);

  /* ---------------- anti-spam + strictmode guards ---------------- */
  const didInitRef = useRef({ projectId: null });
  const abortRef = useRef({
    summary: null,
    wipTable: null,
    wipBreakdown: null,
    flatPrefetch: null, // ✅ new
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
      // cleanup on unmount
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

  const getSelectedFilters = useCallback(() => {
    const stages = uniq([...stageIds, ...parseCsvIds(stageCsv)]);
    const towers = uniq([...buildingIds, ...parseCsvIds(buildingCsv)]);
    const flats = uniq([...unitIds, ...parseCsvIds(unitCsv)]);
    const roles = uniq(pendingFrom);
    return { stages, towers, flats, roles };
  }, [
    stageIds,
    stageCsv,
    buildingIds,
    buildingCsv,
    unitIds,
    unitCsv,
    pendingFrom,
  ]);

  const buildPayload = useCallback(() => {
    const { stages, towers, flats, roles } = getSelectedFilters();
    const payload = { project_id: projectId };
    if (stages.length) payload.stage_id = stages;
    if (towers.length) payload.building_id = towers;
    if (flats.length) payload.unit_id = flats;
    if (roles.length) payload.pending_from = roles;
    return payload;
  }, [getSelectedFilters, projectId]);

  // ✅ Modal "Excel table" params (LOCKED to wipCtx + modal role)
  const buildModalReportParams = useCallback(
    ({ include_rows = true, limit = 200 } = {}) => {
      const stageId = wipCtx?.stageId;
      const towerId = wipCtx?.towerId;

      const p = { project_id: projectId, group_by: "stage" };

      // ✅ send both keys (backend differences safe)
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

  // ✅ Modal breakdown params (LOCKED to wipCtx + modal role)
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

  // stages + buildings
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

  // units by building -> levels-with-flats
  const fetchUnitsFromBuildings = useCallback(async (buildingIdList) => {
    const ids = uniq(buildingIdList);
    if (!ids.length) {
      setUnitOptions([]);
      return;
    }

    const settled = await Promise.allSettled(
      ids.map((bid) => getLevelsWithFlatsByBuilding(bid))
    );

    const flatMap = new Map();
    settled.forEach((r) => {
      if (r.status !== "fulfilled") return;
      const levels = normalizeList(r.value);

      levels.forEach((lvl) => {
        const floorName = lvl?.name ? String(lvl.name) : "";
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

          flatMap.set(String(id), { value: String(id), label: finalLabel });
        });
      });
    });

    const opts = Array.from(flatMap.values());
    opts.sort((a, b) => {
      const na = parseInt(String(a.label).match(/\d+/)?.[0] || "0", 10);
      const nb = parseInt(String(b.label).match(/\d+/)?.[0] || "0", 10);
      return na - nb;
    });

    setUnitOptions(opts);

    const allowed = new Set(opts.map((o) => o.value));
    setUnitIds((prev) => (prev || []).filter((x) => allowed.has(String(x))));
  }, []);

  // ✅ initial load (STRICTMODE SAFE)
  useEffect(() => {
    if (!projectId) return;

    // prevent double-run in dev StrictMode
    if (didInitRef.current.projectId === projectId) return;
    didInitRef.current.projectId = projectId;

    setStageIds([]);
    setBuildingIds([]);
    setUnitIds([]);
    setPendingFrom([]);
    setStageCsv("");
    setBuildingCsv("");
    setUnitCsv("");
    setUnitOptions([]);

    fetchFilterOptions();
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // units refresh when building changes
  useEffect(() => {
    if (!projectId) return;
    const buildings = uniq([...buildingIds, ...parseCsvIds(buildingCsv)]);
    fetchUnitsFromBuildings(buildings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, buildingIds, buildingCsv]);

  const resetFilters = () => {
    setStageIds([]);
    setBuildingIds([]);
    setUnitIds([]);
    setPendingFrom([]);
    setStageCsv("");
    setBuildingCsv("");
    setUnitCsv("");
    setUnitOptions([]);
    // no setTimeout — just fetch once
    fetchSummary();
  };

  /* ---------------- WIP actions (NO SPAM) ---------------- */

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

  // ✅ auto refresh when modal context ready OR role changed (debounced)
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

    // reset modal states
    setWipErr("");
    setWipRows([]);
    setWipMeta({});
    setWipCols([]);

    setWipBreakdownErr("");
    setWipBreakdown(null);

    // default: no role filter inside modal
    setWipRole("");

    const { stages, towers, flats } = getSelectedFilters();
    if (!stages.length) {
      setWipErr("Select at least one Stage first (stage_ids required).");
      return;
    }

    // lock to first selected stage/tower + snapshot flats
    const pickedStage = stages[0];
    const pickedTower = towers?.[0] || null;
    const flatCsv = toCsv(flats);

    setWipCtx({ stageId: pickedStage, towerId: pickedTower, flatCsv });
    // NO setTimeout + NO manual fetch here — effect handles 1 clean refresh
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

  // breakdown mapping
  const breakdownMeta = wipBreakdown?.meta || {};
  const wipUnitCount = wipBreakdown?.work_in_progress_units?.count ?? null;
  const byPendingFrom = wipBreakdown?.breakdown?.by_pending_from || {};
  const makerSupervisorSplit =
    wipBreakdown?.breakdown?.maker_supervisor_split || {};

  const modalAsOf = breakdownMeta?.as_of || wipMeta?.as_of || "";

  const cards = useMemo(
    () => [
      {
        key: "total_units",
        title: "Total Units",
        value: fmtInt(counts.total_units),
        Icon: ClipboardList,
      },
      {
        key: "pending_yet_to_start",
        title: "Pending (Yet to Start)",
        value: fmtInt(counts.pending_yet_to_start),
        Icon: Clock,
      },
      {
        key: "initialised_unit_count",
        title: "Initialized Units",
        value: fmtInt(counts.initialised_unit_count),
        Icon: PlayCircle,
      },
      {
        key: "work_in_progress_unit",
        title: "Work In Progress",
        value: fmtInt(counts.work_in_progress_unit),
        Icon: Activity,
        onClick: openWipModal,
      },
      {
        key: "yet_to_verify",
        title: "Yet to Verify",
        value: fmtInt(counts.yet_to_verify),
        Icon: ShieldCheck,
      },
      {
        key: "complete",
        title: "Complete",
        value: fmtInt(counts.complete),
        Icon: CheckCircle2,
      },
    ],
    [counts]
  );

  const RoleChip = ({ code, label }) => {
    const active = pendingFrom.includes(code);
    return (
      <button
        type="button"
        onClick={() => {
          setPendingFrom((prev) =>
            active ? prev.filter((x) => x !== code) : [...prev, code]
          );
        }}
        className={[
          "rounded-full border px-3 py-1 text-xs font-medium",
          active
            ? "border-slate-900 bg-slate-900 text-white"
            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
        ].join(" ")}
      >
        {label}
      </button>
    );
  };

  const unitsPlaceholder = (() => {
    const buildings = uniq([...buildingIds, ...parseCsvIds(buildingCsv)]);
    if (!buildings.length) return "Select Building first";
    if (!unitOptions.length) return "No units found for selected building(s)";
    return "Select units";
  })();

  const activeFiltersText = useMemo(() => {
    const { stages, towers, flats, roles } = getSelectedFilters();
    const parts = [];
    if (stages.length) parts.push(`Stage: ${stages.join(",")}`);
    if (towers.length) parts.push(`Tower: ${towers.join(",")}`);
    if (flats.length) parts.push(`Unit: ${flats.join(",")}`);
    if (roles.length) parts.push(`Pending From: ${roles.join(",")}`);
    return parts.length ? parts.join(" • ") : "No extra filters";
  }, [getSelectedFilters]);

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

  // ✅ UPDATED: hit flat-room API, then redirect with prefetchedStats
  const goToFlatReport = async (row) => {
    const flatId = getFlatIdFromRow(row);
    if (!flatId) {
      setWipErr("Flat ID not found in this row (cannot open flat report).");
      return;
    }

    // avoid double click
    if (openingFlatId === String(flatId)) return;

    setWipErr("");
    setOpeningFlatId(String(flatId));

    const params = {
      project_id: projectId,
      flat_id: flatId,
    };

    // use modal-locked filters
    if (wipCtx?.stageId) params.stage_id = wipCtx.stageId;
    if (wipCtx?.towerId) params.building_id = wipCtx.towerId;

    try {
      const signal = newSignal("flatPrefetch");

      // ✅ HIT API BEFORE REDIRECT
      const res = await axios.get(`${API_BASE}/checklists/stats/flat-room/`, {
        params,
        headers: authHeaders(),
        signal,
      });

      const prefetchedStats = res?.data ?? null;

      const flatMeta = {
        number:
          row.flat_number ??
          row.unit_number ??
          row.number ??
          row.unit_no ??
          row.unit_label ??
          null,
        typeName:
          row.flat_type_name ??
          row.unit_type_name ??
          row.type_name ??
          row.type ??
          null,
        levelName: row.level_name ?? row.floor_name ?? row.level ?? null,
      };

      const filters = {
        stageId: wipCtx?.stageId || null,
        buildingId: wipCtx?.towerId || null,
      };

      const path = `/projects/${projectId}/flat-report/${flatId}`;

      setWipOpen(false);

      navigate(path, {
        state: {
          prefetchedStats, // ✅ send prefetched API response
          flatMeta,
          filters,
        },
      });
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
    // no manual refresh — debounced effect will run once
  };

  return (
    <div className="p-4 md:p-6">
      {/* header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-lg font-semibold text-slate-900">Overview</div>
          <div className="text-xs text-slate-500">
            Project ID: {projectId || "—"}
            {meta?.as_of ? <span> • As of: {meta.as_of}</span> : null}
            {activeFiltersText ? <span> • {activeFiltersText}</span> : null}
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

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {/* Stage */}
          <div>
            <FilterLabel>Stages (multi-select)</FilterLabel>
            <MultiSelect
              value={stageIds}
              options={stageOptions}
              onChange={setStageIds}
              placeholder="No stages found"
            />
            <input
              value={stageCsv}
              onChange={(e) => setStageCsv(e.target.value)}
              placeholder="Or type Stage IDs: 1,2,3"
              className="mt-2 w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* Building */}
          <div>
            <FilterLabel>Buildings / Towers (multi-select)</FilterLabel>
            <MultiSelect
              value={buildingIds}
              options={buildingOptions}
              onChange={setBuildingIds}
              placeholder="No buildings found"
            />
            <input
              value={buildingCsv}
              onChange={(e) => setBuildingCsv(e.target.value)}
              placeholder="Or type Building IDs: 10,11"
              className="mt-2 w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* Units */}
          <div>
            <FilterLabel>Units (multi-select)</FilterLabel>
            <MultiSelect
              value={unitIds}
              options={unitOptions}
              onChange={setUnitIds}
              placeholder={unitsPlaceholder}
            />
            <input
              value={unitCsv}
              onChange={(e) => setUnitCsv(e.target.value)}
              placeholder="Or type Unit IDs: 101,102"
              className="mt-2 w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-slate-200"
            />
            <div className="mt-1 text-[11px] text-slate-500">
              Loaded units: {unitOptions.length}
            </div>
          </div>
        </div>

        {/* Pending from */}
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

      {/* error */}
      {err ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      ) : null}

      {/* cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[108px] animate-pulse rounded-xl border bg-white p-4"
              >
                <div className="h-4 w-32 rounded bg-slate-100" />
                <div className="mt-3 h-8 w-24 rounded bg-slate-100" />
                <div className="mt-2 h-3 w-40 rounded bg-slate-100" />
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
              {/* header */}
              <div className="sticky top-0 z-10 border-b bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-base font-semibold text-slate-900">
                      Work In Progress Breakdown
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Project: {projectId || "—"}
                      {modalStageName ? (
                        <span> • Stage: {modalStageName}</span>
                      ) : null}
                      {modalTowerName ? (
                        <span> • Tower: {modalTowerName}</span>
                      ) : null}
                      {wipRole ? (
                        <span> • Role: {roleLabel(wipRole)}</span>
                      ) : null}
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

              {/* body */}
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

                {/* role chips */}
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-semibold text-slate-700">
                    Summary
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <ChipButton
                      active={!wipRole}
                      onClick={() => setWipRole("")}
                      title="Show all roles"
                    >
                      All Roles
                    </ChipButton>

                    {Object.keys(byPendingFrom || {}).map((k) => (
                      <ChipButton
                        key={k}
                        active={
                          String(wipRole).toUpperCase() ===
                          String(k).toUpperCase()
                        }
                        onClick={() => toggleModalRole(k)}
                        title="Filter table + breakdown by this role"
                      >
                        {roleLabel(k)} • {fmtInt(byPendingFrom[k])}
                      </ChipButton>
                    ))}
                  </div>
                </div>

                {/* mini stats */}
                {wipBreakdownLoading ? (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-[54px] animate-pulse rounded-lg border bg-white px-3 py-2"
                      >
                        <div className="h-3 w-20 rounded bg-slate-100" />
                        <div className="mt-2 h-5 w-12 rounded bg-slate-100" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <MiniStat label="WIP Units" value={fmtInt(wipUnitCount)} />
                    <MiniStat
                      label="Units Seen"
                      value={fmtInt(breakdownMeta?.total_unit_keys_seen)}
                    />
                    <MiniStat
                      label="Items Seen"
                      value={fmtInt(breakdownMeta?.items_seen)}
                    />
                    <MiniStat
                      label="Role Filter"
                      value={wipRole ? roleLabel(wipRole) : "—"}
                    />
                  </div>
                )}

                {/* maker/supervisor split */}
                {makerSupervisorSplit &&
                typeof makerSupervisorSplit === "object" &&
                Object.keys(makerSupervisorSplit).length ? (
                  <div className="mt-3 rounded-xl border bg-slate-50 p-3">
                    <div className="mb-2 text-xs font-semibold text-slate-700">
                      Maker / Supervisor Split
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                      {[
                        ["maker_pending", "units_with_maker_pending"],
                        ["supervisor_pending", "units_with_supervisor_pending"],
                        [
                          "both_pending",
                          "units_with_both_maker_and_supervisor_pending",
                        ],
                        ["maker_only", "units_with_maker_only_pending"],
                        [
                          "supervisor_only",
                          "units_with_supervisor_only_pending",
                        ],
                      ].map(([label, key]) => (
                        <MiniStat
                          key={key}
                          label={titleize(label)}
                          value={fmtInt(makerSupervisorSplit?.[key])}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* TABLE */}
                <div className="mt-4 rounded-2xl border">
                  <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
                    <div className="text-sm font-semibold text-slate-900">
                      Excel Table Preview
                    </div>
                    <div className="text-xs text-slate-500">
                      Tip: Click a row to open Flat Report
                    </div>
                  </div>

                  {wipLoading ? (
                    <div className="p-4 text-sm text-slate-600">Loading...</div>
                  ) : !wipRows?.length ? (
                    <div className="p-4 text-sm text-slate-600">
                      No rows returned.
                    </div>
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
                                    isRed
                                      ? "bg-red-50 text-red-700"
                                      : "text-slate-600",
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
                                  clickable
                                    ? "cursor-pointer hover:bg-slate-50"
                                    : "",
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
                                    <span className="text-xs text-slate-400">
                                      —
                                    </span>
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
                                        isRed
                                          ? "bg-red-50 font-semibold text-red-700"
                                          : "text-slate-800",
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

                <div className="mt-3 text-xs text-slate-500">
                  ✅ Clicking any row will redirect to:{" "}
                  <code>/projects/{projectId || ":projectId"}/flat-report/:flatId</code>
                </div>
              </div>
            </div>

            <div className="h-6" />
          </div>
        </div>
      ) : null}
    </div>
  );
}

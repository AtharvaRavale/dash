// src/pages/FlatReport.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useTheme } from "../ThemeContext";

const API_BASE = "https://konstruct.world";

const authHeaders = () => ({
  Authorization: `Bearer ${
    localStorage.getItem("ACCESS_TOKEN") ||
    localStorage.getItem("TOKEN") ||
    localStorage.getItem("token") ||
    ""
  }`,
});

function safeNumber(n, fallback = 0) {
  if (typeof n === "number" && !Number.isNaN(n)) return n;
  const parsed = Number(n);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function fmtInt(n) {
  return safeNumber(n).toLocaleString("en-IN");
}

/* ---------- helpers ---------- */
const normalizeList = (res) => {
  const d = res?.data ?? res;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.results)) return d.results;
  if (Array.isArray(d?.data)) return d.data;
  return [];
};

const toStr = (v) => (v === null || v === undefined ? "" : String(v));

/** ✅ VERY IMPORTANT: normalize id so "235", "235 ", "235.0" all become "235" */
const normId = (v) => {
  if (v === null || v === undefined) return "";
  if (typeof v === "number" && Number.isFinite(v)) return String(Math.trunc(v));
  const s = String(v).trim();
  if (!s) return "";
  const n = Number(s);
  if (Number.isFinite(n)) return String(Math.trunc(n));
  return s;
};

const uniq = (arr) => Array.from(new Set((arr || []).filter(Boolean)));

const getRoomIdFromStats = (room) =>
  room?.room_id ??
  room?.roomId ??
  room?.roomID ??
  room?.room ??
  room?.room_master_id ??
  room?.room_master ??
  room?.id ??
  null;

/* ---------- logs helpers ---------- */
const formatDT = (iso) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(iso);
  }
};

const statusKind = (s) => {
  const v = String(s || "").toLowerCase();
  if (!v) return "neutral";
  if (v.includes("completed") || v === "done") return "ok";
  if (v.includes("rejected") || v.includes("fail")) return "bad";
  if (v.includes("pending") || v.includes("not_started") || v.includes("open")) return "warn";
  return "neutral";
};

const badgeStyles = (theme, kind = "neutral") => {
  const dark = theme === "dark";
  const base = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    border: `1px solid ${
      dark ? "rgba(148,163,184,0.22)" : "rgba(15,23,42,0.10)"
    }`,
  };

  const presets = {
    neutral: {
      background: dark ? "rgba(51,65,85,0.45)" : "rgba(243,244,246,1)",
      color: dark ? "#e2e8f0" : "#111827",
    },
    ok: {
      background: dark ? "rgba(6,78,59,0.35)" : "rgba(220,252,231,1)",
      color: dark ? "#bbf7d0" : "#065f46",
    },
    warn: {
      background: dark ? "rgba(124,45,18,0.35)" : "rgba(255,237,213,1)",
      color: dark ? "#fed7aa" : "#9a3412",
    },
    bad: {
      background: dark ? "rgba(127,29,29,0.35)" : "rgba(254,226,226,1)",
      color: dark ? "#fecaca" : "#991b1b",
    },
    action: {
      background: dark ? "rgba(30,64,175,0.22)" : "rgba(219,234,254,0.95)",
      color: dark ? "#dbeafe" : "#0f172a",
    },
    role: {
      background: dark ? "rgba(30,41,59,0.65)" : "rgba(241,245,249,1)",
      color: dark ? "#e2e8f0" : "#0f172a",
    },
  };

  return { ...base, ...(presets[kind] || presets.neutral) };
};

const MetricRow = ({ label, value, tone = "neutral", theme }) => {
  const text = theme === "dark" ? "#f1f5f9" : "#0f172a";
  const secondary = theme === "dark" ? "#94a3b8" : "#64748b";
  const toneColor =
    tone === "ok"
      ? theme === "dark"
        ? "#bbf7d0"
        : "#065f46"
      : tone === "warn"
      ? theme === "dark"
        ? "#fed7aa"
        : "#9a3412"
      : tone === "bad"
      ? theme === "dark"
        ? "#fecaca"
        : "#991b1b"
      : text;

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="text-xs font-semibold" style={{ color: secondary }}>
        {label}
      </div>
      <div className="text-xl font-black tabular-nums" style={{ color: toneColor }}>
        {value}
      </div>
    </div>
  );
};

const Card = ({ theme, title, subtitle, children }) => {
  const cardBg = theme === "dark" ? "rgba(15,23,42,0.95)" : "rgba(255,255,255,0.98)";
  const borderColor = theme === "dark" ? "#475569" : "#cbd5e1";
  const text = theme === "dark" ? "#f1f5f9" : "#0f172a";
  const secondary = theme === "dark" ? "#94a3b8" : "#64748b";

  return (
    <div className="rounded-3xl border p-5" style={{ background: cardBg, borderColor }}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: secondary }}>
            {title}
          </div>
          {subtitle ? (
            <div className="mt-1 text-sm font-semibold" style={{ color: text }}>
              {subtitle}
            </div>
          ) : null}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
};

/* ---------- Logs Modal (inline, no extra files) ---------- */
function LogsModal({
  open,
  onClose,
  theme,
  projectId,
  flatId,
  filtersFromOverview,
}) {
  const textColor = theme === "dark" ? "#f1f5f9" : "#0f172a";
  const secondaryTextColor = theme === "dark" ? "#94a3b8" : "#64748b";
  const cardBg = theme === "dark" ? "rgba(15,23,42,0.96)" : "rgba(255,255,255,0.98)";
  const borderColor = theme === "dark" ? "#475569" : "#cbd5e1";

  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState("");
  const [logsData, setLogsData] = useState(null);

  const [order, setOrder] = useState("asc");
const resolveLabels = true; // ✅ always ON, no UI toggle
  const [itemsMode, setItemsMode] = useState("important");
  const [search, setSearch] = useState("");
    // ✅ Users map for showing names instead of only IDs
  const [userNameById, setUserNameById] = useState({});
  const [usersStatus, setUsersStatus] = useState("idle"); // idle | loading | ok | failed


  const tree = useMemo(() => (Array.isArray(logsData?.tree) ? logsData.tree : []), [logsData]);
  const widgets = logsData?.widgets || {};
  const meta = logsData?.meta || {};

  // stage accordion
  const [openStageIds, setOpenStageIds] = useState(() => new Set());
  useEffect(() => {
    if (!tree.length) return;
    const first = tree[0]?.stage_id;
    if (!first) return;
    setOpenStageIds(new Set([String(first)]));
  }, [tree?.length]);

  const toggleStage = (sid) => {
    const k = String(sid);
    setOpenStageIds((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  const filteredTree = useMemo(() => {
    const q = String(search || "").trim().toLowerCase();
    if (!q) return tree;

    const match = (ev) => {
            const uid = normId(ev?.user_id ?? ev?.user?.id ?? ev?.user ?? null);
      const uname = uid ? (userNameById?.[uid] || "") : "";

      const hay = [
        ev?.role,
        ev?.action,
        ev?.tower,
        ev?.unit_no,
        ev?.checklist_name,
        ev?.item_title,
        ev?.submission_status,
        ev?.remarks,
        uname, // ✅ user name searchable
        uid,   // ✅ user id searchable
      ]

        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    };

    return tree
      .map((node) => {
        const events = Array.isArray(node?.events) ? node.events : [];
        const filtered = events.filter(match);
        if (!filtered.length) return null;
        return { ...node, events: filtered };
      })
      .filter(Boolean);
  }, [tree, search,userNameById]);

  const totalFilteredEvents = useMemo(() => {
    return filteredTree.reduce((sum, n) => sum + (Array.isArray(n?.events) ? n.events.length : 0), 0);
  }, [filteredTree]);






    // ✅ Fetch users for this project (for user_id -> name mapping)
  useEffect(() => {
    const fetchUsers = async () => {
      if (!open) return;
      if (!projectId) return;

      setUsersStatus("loading");
      try {
        const res = await axios.get(`${API_BASE}/users/by-project/`, {
          params: { project_id: projectId },
          headers: authHeaders(),
        });

        const list = normalizeList(res);
        const map = {};

        list.forEach((u) => {
          const id = normId(u?.id);

          const name = String(
            u?.display_name ||
              `${u?.first_name || ""} ${u?.last_name || ""}`.trim() ||
              u?.username ||
              u?.email ||
              ""
          ).trim();

          if (id && name) map[id] = name;
        });

        setUserNameById(map);
        setUsersStatus("ok");
      } catch (e) {
        console.error("❌ Error fetching users:", e);
        setUserNameById({});
        setUsersStatus("failed");
      }
    };

    fetchUsers();
  }, [open, projectId]);

  // Fetch logs when modal opens or controls change
  useEffect(() => {
    const fetchLogs = async () => {
      if (!open) return;
      if (!projectId || !flatId) return;

      setLogsLoading(true);
      setLogsError("");

      try {
        const params = {
          project_id: projectId,
          flat_id: flatId, // can be "6394,6395" also
          order,
          resolve_labels: "true", // ✅ always true
          items: itemsMode, // "important" | "all"
        };

        // optional (if backend supports)
        if (filtersFromOverview?.stageId) params.stage_id = filtersFromOverview.stageId;
        if (filtersFromOverview?.buildingId) params.building_id = filtersFromOverview.buildingId;

        const res = await axios.get(`${API_BASE}/checklists/unit-logs/`, {
          params,
          headers: authHeaders(),
        });

        setLogsData(res.data || null);
      } catch (e) {
        const msg =
          e?.response?.data?.detail ||
          e?.response?.data?.message ||
          "Unable to load logs.";
        setLogsError(msg);
        toast.error(msg);
      } finally {
        setLogsLoading(false);
      }
    };

    fetchLogs();
}, [open, projectId, flatId, order, itemsMode, filtersFromOverview?.stageId, filtersFromOverview?.buildingId]);

  // ESC close
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.55)" }}
        onClick={onClose}
      />

      {/* modal */}
      <div
        className="relative w-full max-w-[1200px] rounded-3xl border overflow-hidden flex flex-col"
        style={{ background: cardBg, borderColor, maxHeight: "92vh" }}
        role="dialog"
        aria-modal="true"
      >
        {/* header */}
        <div
          className="px-6 py-4 border-b flex items-start justify-between gap-4"
          style={{
            borderColor,
            background: theme === "dark" ? "rgba(2,6,23,0.55)" : "rgba(249,250,251,1)",
          }}
        >
          <div>
            {/* <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: secondaryTextColor }}>
              Logs
            </div> */}
            <div className="text-xl font-black" style={{ color: textColor }}>
              Unit Logs 
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {/* <span style={badgeStyles(theme, "neutral")}>
                As of: <b>{meta?.as_of || "-"}</b>
              </span> */}
              <span style={badgeStyles(theme, "neutral")}>
                Checklists: <b>{fmtInt(meta?.total_checklists || 0)}</b>
              </span>
              {/* <span style={badgeStyles(theme, "neutral")}>
                Events: <b>{fmtInt(meta?.total_events || 0)}</b>
              </span> */}
              {/* <span style={badgeStyles(theme, "ok")}>Labels resolved</span> */}

            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center w-10 h-10 rounded-2xl border text-lg font-black"
              style={{ borderColor, color: textColor }}
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* controls */}
        <div className="px-6 py-4 border-b" style={{ borderColor }}>
          <div className="grid gap-3 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color: secondaryTextColor }}>
                Search
              </div>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search: action, role, item, checklist, remarks..."
                className="w-full rounded-2xl border px-4 py-2 text-sm outline-none"
                style={{
                  borderColor,
                  background: theme === "dark" ? "rgba(2,6,23,0.45)" : "white",
                  color: textColor,
                }}
              />
              
            </div>

            <div>
              <div className="text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color: secondaryTextColor }}>
                Order
              </div>
              <select
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className="w-full rounded-2xl border px-3 py-2 text-sm"
                style={{
                  borderColor,
                  background: theme === "dark" ? "rgba(2,6,23,0.45)" : "white",
                  color: textColor,
                }}
              >
                <option value="asc">Ascending → Descending</option>
                <option value="desc">Descending → Ascending</option>
              </select>

              {/* <label className="mt-3 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={resolveLabels}
                  onChange={(e) => setResolveLabels(e.target.checked)}
                />
                <span className="text-sm font-semibold" style={{ color: textColor }}>
                  Resolve labels
                </span>
              </label> */}
            </div>

            <div>
              {/* <div className="text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color: secondaryTextColor }}>
                Items
              </div> */}
              {/* <select
                value={itemsMode}
                onChange={(e) => setItemsMode(e.target.value)}
                className="w-full rounded-2xl border px-3 py-2 text-sm"
                style={{
                  borderColor,
                  background: theme === "dark" ? "rgba(2,6,23,0.45)" : "white",
                  color: textColor,
                }}
              >
                <option value="important">Important</option>
                <option value="all">All</option>
              </select> */}

              {/* <div className="mt-3 text-[11px] font-semibold" style={{ color: secondaryTextColor }}>
                Tip: ESC to close
              </div> */}
            </div>
          </div>
        </div>

        {/* body */}
        <div className="p-6 overflow-auto" style={{ background: cardBg }}>
          {logsLoading && (
            <div className="py-10 text-center">
              <div className="mb-4 inline-block">
                <div
                  className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
                  style={{
                    borderColor: theme === "dark" ? "#475569" : "#cbd5e1",
                    borderTopColor: "transparent",
                  }}
                />
              </div>
              <div className="text-sm font-semibold" style={{ color: secondaryTextColor }}>
                Loading logs...
              </div>
            </div>
          )}

          {!logsLoading && logsError && (
            <div
              className="rounded-3xl border px-6 py-5 backdrop-blur-xl mb-6"
              style={{
                background: theme === "dark" ? "rgba(127,29,29,0.35)" : "rgba(254,226,226,0.9)",
                borderColor: "#ef4444",
              }}
            >
              <div className="text-sm font-semibold mb-1" style={{ color: theme === "dark" ? "#fecaca" : "#991b1b" }}>
                {logsError}
              </div>
              <div className="text-xs" style={{ color: secondaryTextColor }}>
                Please check permissions / project_id / flat_id.
              </div>
            </div>
          )}

          {!logsLoading && !logsError && (
            <>
              {/* widgets cards */}
             {/* ✅ Pending summary (table) */}
<div className="rounded-3xl border overflow-hidden mb-6" style={{ borderColor, background: cardBg }}>
  <div
    className="px-6 py-4 border-b flex items-center justify-between gap-3"
    style={{
      borderColor,
      background: theme === "dark" ? "rgba(2,6,23,0.55)" : "rgba(249,250,251,1)",
    }}
  >
    <div>
      {/* <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: secondaryTextColor }}>
        Pending Summary
      </div>
      <div className="text-sm font-extrabold" style={{ color: textColor }}>
        Pending from: {widgets?.pending?.pending_from || "-"}
      </div> */}
    </div>

    {/* <span style={badgeStyles(theme, "neutral")}>
      Total:{" "}
      <b>
        {fmtInt(
          widgets?.pending?.maker_pending_items?.total ??
            widgets?.pending?.initializer_pending_items?.total ??
            widgets?.pending?.checker_pending_items?.total ??
            0
        )}
      </b>
    </span> */}
  </div>

  {/* <div className="overflow-auto">
    <table className="min-w-full text-sm">
      <thead
        className="sticky top-0 z-10"
        style={{ background: theme === "dark" ? "#020617" : "#e5e7eb" }}
      >
        <tr>
          <th className="text-left px-6 py-3 text-xs font-bold" style={{ color: textColor }}>
            Bucket
          </th>
          <th className="text-right px-4 py-3 text-xs font-bold" style={{ color: textColor }}>
            Count
          </th>
          <th className="text-right px-4 py-3 text-xs font-bold" style={{ color: textColor }}>
            Percent
          </th>
          <th className="text-right px-6 py-3 text-xs font-bold" style={{ color: textColor }}>
            Total
          </th>
        </tr>
      </thead>

      <tbody>
        {[
          { label: "Initializer Pending", obj: widgets?.pending?.initializer_pending_items },
          { label: "Maker Pending", obj: widgets?.pending?.maker_pending_items },
          { label: "Checker Pending", obj: widgets?.pending?.checker_pending_items },
        ].map((row, idx) => {
          const o = row?.obj || {};
          const count = safeNumber(o?.count, 0);
          const percent = safeNumber(o?.percent, 0);
          const total = safeNumber(o?.total, 0);

          return (
            <tr
              key={idx}
              className="border-t"
              style={{ borderColor: theme === "dark" ? "#0b1220" : "#e5e7eb" }}
            >
              <td className="px-6 py-3">
                <div className="font-semibold" style={{ color: textColor }}>
                  {row.label}
                </div>
              </td>

              <td className="px-4 py-3 text-right font-black tabular-nums" style={{ color: textColor }}>
                {fmtInt(count)}
              </td>

              <td className="px-4 py-3 text-right font-bold tabular-nums" style={{ color: textColor }}>
                {percent.toFixed(2)}%
              </td>

              <td className="px-6 py-3 text-right font-bold tabular-nums" style={{ color: textColor }}>
                {fmtInt(total)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div> */}
</div>


              {/* tree tables */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-lg font-black" style={{ color: textColor }}>
                    Logs Tree
                  </div>
                  <div className="text-[11px] font-semibold" style={{ color: secondaryTextColor }}>
                    Stage-wise events (table)
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {!filteredTree.length ? (
                  <div className="rounded-3xl border p-6 text-center" style={{ background: cardBg, borderColor }}>
                    <div className="text-sm font-semibold" style={{ color: secondaryTextColor }}>
                      No events found (try clearing search / change items).
                    </div>
                  </div>
                ) : (
                  filteredTree.map((node) => {
                    const sid = node?.stage_id;
                    const stageTitle = node?.stage || `Stage#${sid}`;
                    const openAcc = openStageIds.has(String(sid));
                    const events = Array.isArray(node?.events) ? node.events : [];
                    const summary = node?.stage_summary || {};

                    return (
                      <div key={String(sid)} className="rounded-3xl border overflow-hidden" style={{ borderColor }}>
                        <button
                          type="button"
                          onClick={() => toggleStage(sid)}
                          className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left"
                          style={{
                            background: theme === "dark" ? "rgba(2,6,23,0.55)" : "rgba(249,250,251,1)",
                          }}
                        >
                          <div>
                            <div className="text-sm font-black" style={{ color: textColor }}>
                              {stageTitle}
                            </div>
                            <div className="mt-1 flex flex-wrap gap-2">
                              <span style={badgeStyles(theme, "neutral")}>Events: {fmtInt(events.length)}</span>
                              <span style={badgeStyles(theme, "ok")}>Completed: {fmtInt(summary?.completed || 0)}</span>
                              <span style={badgeStyles(theme, "warn")}>Not Started: {fmtInt(summary?.not_started || 0)}</span>
                              <span style={badgeStyles(theme, "bad")}>Snag: {fmtInt(summary?.snag_raised_total || 0)}</span>
                              <span style={badgeStyles(theme, "neutral")}>Readiness: {safeNumber(summary?.flat_readiness || 0).toFixed(1)}%</span>
                            </div>
                          </div>

                          <div
                            className="w-10 h-10 rounded-2xl border flex items-center justify-center font-black"
                            style={{ borderColor, color: textColor }}
                          >
                            {openAcc ? "−" : "+"}
                          </div>
                        </button>

                        {openAcc ? (
                          <div className="p-5" style={{ background: cardBg }}>
                            <div className="overflow-auto rounded-2xl border" style={{ borderColor }}>
                              <table className="min-w-[980px] w-full text-sm">
                                <thead
                                  className="sticky top-0 z-10"
                                  style={{ background: theme === "dark" ? "#020617" : "#e5e7eb" }}
                                >
                                  <tr>
                                    <th className="text-left px-4 py-3 text-xs font-bold" style={{ color: textColor }}>Time</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold" style={{ color: textColor }}>Role</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold" style={{ color: textColor }}>Action</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold" style={{ color: textColor }}>Tower / Unit</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold" style={{ color: textColor }}>Checklist</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold" style={{ color: textColor }}>Item</th>
                                    <th className="text-right px-4 py-3 text-xs font-bold" style={{ color: textColor }}>Attempt</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold" style={{ color: textColor }}>Status</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold" style={{ color: textColor }}>User</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold" style={{ color: textColor }}>Remarks</th>
                                  </tr>
                                </thead>

                                <tbody>
                                  {!events.length ? (
                                    <tr>
                                      <td colSpan={10} className="px-4 py-10 text-center text-sm font-semibold" style={{ color: secondaryTextColor }}>
                                        No events under this stage (after filtering).
                                      </td>
                                    </tr>
                                  ) : (
                                    events.map((ev, i) => {
                                      const time = formatDT(ev?.at) || "-";
                                      const role = ev?.role || "-";
                                      const action = String(ev?.action || "-").replaceAll("_", " ");
                                      const tower = ev?.tower || (ev?.tower_id ? `Tower#${ev.tower_id}` : "-");
                                      const unitNo = ev?.unit_no || (ev?.unit_id ? String(ev.unit_id) : "-");
                                      const checklist = ev?.checklist_name
                                        ? `${ev.checklist_name}`
                                      
                                        : "-";
                                      const item = ev?.item_title
                                        ? `${ev.item_title}`
                                        : ev?.item_id
                                        ? `Item #${ev.item_id}`
                                        : "-";
                                      const attempt = ev?.attempts ?? "—";
                                      const st = ev?.submission_status || "";
                                      const uid = normId(ev?.user_id ?? ev?.user?.id ?? ev?.user ?? null);
                                      const user = uid ? (userNameById?.[uid] || `User #${uid}`) : "-";
                                      const remarks = ev?.remarks || "—";

                                      return (
                                        <tr
                                          key={`${sid}-${i}-${ev?.at || ""}-${ev?.action || ""}`}
                                          className="border-t"
                                          style={{ borderColor: theme === "dark" ? "#0b1220" : "#e5e7eb" }}
                                        >
                                          <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="font-semibold" style={{ color: textColor }}>{time}</div>
                                            
                                          </td>

                                          <td className="px-4 py-3">
                                            <span style={badgeStyles(theme, "role")}>{role}</span>
                                          </td>

                                          <td className="px-4 py-3">
                                            <span style={badgeStyles(theme, "action")}>{action}</span>
                                          </td>

                                          <td className="px-4 py-3">
                                            <div className="font-semibold" style={{ color: textColor }}>
                                              {tower} • Unit {unitNo}
                                            </div>
                                            <div className="text-[11px] font-semibold" style={{ color: secondaryTextColor }}>
                                              {/* Stage #{ev?.stage_id || "-"} • Project #{ev?.project_id || "-"} */}
                                            </div>
                                          </td>

                                          <td className="px-4 py-3">
                                            <div className="font-semibold" style={{ color: textColor }}>{checklist}</div>
                                          </td>

                                          <td className="px-4 py-3">
                                            <div className="font-semibold" style={{ color: textColor }}>{item}</div>
                                          </td>

                                          <td className="px-4 py-3 text-right font-black tabular-nums" style={{ color: textColor }}>
                                            {attempt}
                                          </td>

                                          <td className="px-4 py-3">
                                            <span style={badgeStyles(theme, statusKind(st))}>
                                              {st ? String(st).replaceAll("_", " ") : "—"}
                                            </span>
                                          </td>

                                         <td className="px-4 py-3">
  <div className="font-semibold" style={{ color: textColor }}>
    {user}
  </div>

 

  {usersStatus === "loading" ? (
    <div className="text-[11px] font-semibold" style={{ color: secondaryTextColor }}>
      Loading users…
    </div>
  ) : null}
</td>


                                          <td className="px-4 py-3">
                                            <div className="text-sm font-semibold" style={{ color: remarks !== "—" ? textColor : secondaryTextColor }}>
                                              {remarks}
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FlatReport() {
  const { id: projectId, flatId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  const [roomStats, setRoomStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ maps
  const [categoryNameById, setCategoryNameById] = useState({});
  const [roomNameById, setRoomNameById] = useState({});

  // ✅ meta statuses
  const [catMetaLoading, setCatMetaLoading] = useState(false);
  const [roomMetaStatus, setRoomMetaStatus] = useState("idle"); // idle | loading | ok | failed

  // ✅ Logs modal
  const [logsOpen, setLogsOpen] = useState(false);

  const projectFromState = location.state?.project || null;
  const flatMeta = location.state?.flatMeta || null;
  const filtersFromOverview = location.state?.filters || {};
  const prefetchedStats = location.state?.prefetchedStats || null;

  const didUsePrefetchRef = useRef(false);

  const textColor = theme === "dark" ? "#f1f5f9" : "#0f172a";
  const secondaryTextColor = theme === "dark" ? "#94a3b8" : "#64748b";
  const cardBg =
    theme === "dark" ? "rgba(15,23,42,0.95)" : "rgba(255,255,255,0.98)";
  const borderColor = theme === "dark" ? "#475569" : "#cbd5e1";

  /* ---------------- prefetched stats ---------------- */
  useEffect(() => {
    if (!prefetchedStats) return;
    if (didUsePrefetchRef.current) return;

    setRoomStats(prefetchedStats);
    setLoading(false);
    setError("");
    didUsePrefetchRef.current = true;
  }, [prefetchedStats]);

  /* ---------------- stats API ---------------- */
  useEffect(() => {
    const fetchStats = async () => {
      if (!projectId || !flatId) return;

      if (didUsePrefetchRef.current) {
        didUsePrefetchRef.current = false;
        return;
      }

      setLoading(true);
      setError("");

      try {
        const params = { project_id: projectId, flat_id: flatId };
        if (filtersFromOverview.stageId) params.stage_id = filtersFromOverview.stageId;
        if (filtersFromOverview.buildingId) params.building_id = filtersFromOverview.buildingId;

        const res = await axios.get(`${API_BASE}/checklists/stats/flat-room/`, {
          params,
          headers: authHeaders(),
        });

        setRoomStats(res.data || null);
      } catch (err) {
        console.error("Failed to load flat room stats", err);
        const msg =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Unable to load room-wise stats for this flat.";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [projectId, flatId, filtersFromOverview.stageId, filtersFromOverview.buildingId]);

  const rooms = useMemo(() => {
    const arr = roomStats?.rooms;
    return Array.isArray(arr) ? arr : [];
  }, [roomStats]);

  const neededRoomIds = useMemo(() => {
    const ids = rooms.map((r) => normId(getRoomIdFromStats(r))).filter(Boolean);
    return uniq(ids);
  }, [rooms]);

  /* ---------------- categories (project-scoped) ---------------- */
  useEffect(() => {
    const fetchCategories = async () => {
      if (!projectId) return;
      setCatMetaLoading(true);

      try {
        const catRes = await axios.get(`${API_BASE}/projects/categories-simple/`, {
          params: { project_id: projectId },
          headers: authHeaders(),
        });

        const list = normalizeList(catRes);
        const map = {};
        list.forEach((c) => {
          const id = normId(c?.id);
          const name = toStr(c?.name).trim();
          const proj = c?.project ?? c?.Project ?? c?.project_id;
          if (!id || !name) return;
          if (proj && normId(proj) !== normId(projectId)) return;
          map[id] = name;
        });
        setCategoryNameById(map);
      } catch {
        setCategoryNameById({});
      } finally {
        setCatMetaLoading(false);
      }
    };

    fetchCategories();
  }, [projectId]);

  /* ---------------- rooms meta ---------------- */
  useEffect(() => {
    const fetchRooms = async () => {
      if (!projectId) return;
      if (!neededRoomIds.length) {
        setRoomMetaStatus("ok");
        return;
      }

      setRoomMetaStatus("loading");

      try {
        let map = {};

        const r1 = await axios.get(`${API_BASE}/projects/rooms/`, {
          params: { project_id: projectId },
          headers: authHeaders(),
        });

        const list1 = normalizeList(r1);

        list1.forEach((r) => {
          const id = normId(r?.id ?? r?.room_id ?? r?.pk ?? r?.roomId ?? r?.room_master_id);
          const name = toStr(r?.rooms ?? r?.name ?? r?.room_name ?? r?.title ?? r?.roomName).trim();
          if (!id || !name) return;
          map[id] = name;
        });

        setRoomNameById(map);

        const stillMissing = neededRoomIds.filter((rid) => !map?.[rid]);
        if (stillMissing.length > 0) setRoomMetaStatus("failed");
        else setRoomMetaStatus("ok");
      } catch (e) {
        console.error("❌ Error fetching rooms:", e);
        setRoomNameById({});
        setRoomMetaStatus("failed");
      }
    };

    fetchRooms();
  }, [projectId, neededRoomIds.join("|")]);

  const totalItems = useMemo(
    () => rooms.reduce((sum, r) => sum + safeNumber(r.total), 0),
    [rooms]
  );
  const totalOpen = useMemo(
    () => rooms.reduce((sum, r) => sum + safeNumber(r.open), 0),
    [rooms]
  );
  const totalClosed = useMemo(
    () => rooms.reduce((sum, r) => sum + safeNumber(r.closed), 0),
    [rooms]
  );

  const flatLabel = flatMeta
    ? `Flat ${flatMeta.number || flatId}${flatMeta.typeName ? ` • ${flatMeta.typeName}` : ""}`
    : `Flat #${flatId}`;

  const levelLabel = flatMeta?.levelName || "";
  const projectName =
    projectFromState?.name ||
    projectFromState?.project_name ||
    `Project #${projectId}`;

  const normalizeByCategory = (room) => {
    const raw = room?.by_category;

    if (Array.isArray(raw)) {
      return raw.map((x) => ({
        category_id: normId(x?.category_id ?? x?.id ?? x?.category ?? null),
        count: x?.count ?? x?.total ?? 0,
        category_name: x?.category_name ?? x?.name ?? null,
      }));
    }

    if (raw && typeof raw === "object") {
      return Object.entries(raw).map(([k, v]) => ({
        category_id: normId(k),
        count: safeNumber(v, 0),
        category_name: null,
      }));
    }

    return [];
  };

  const getRoomLabel = (room) => {
    const direct =
      room?.room_name || room?.room_label || room?.room_title || room?.rooms || room?.name;
    if (direct) return String(direct);

    const id = normId(getRoomIdFromStats(room));
    if (!id) return "Room";

    if (roomMetaStatus === "loading") return "Loading…";
    if (roomNameById?.[id]) return roomNameById[id];

    return `Room #${id}`;
  };

  const getCategoryLabel = (cat) => {
    const direct = cat?.category_name || cat?.category_label || cat?.category_title || cat?.name;
    if (direct) return String(direct);

    const id = normId(cat?.category_id ?? cat?.category ?? cat?.id ?? null);
    if (id && categoryNameById?.[id]) return categoryNameById[id];
    return id ? `Category #${id}` : "Category";
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          theme === "dark"
            ? "linear-gradient(135deg, #0f172a 0%, #020617 100%)"
            : "linear-gradient(135deg, #f8fafc 0%, #e5e7eb 100%)",
      }}
    >
      {/* ✅ Logs modal */}
      <LogsModal
        open={logsOpen}
        onClose={() => setLogsOpen(false)}
        theme={theme}
        projectId={projectId}
        flatId={flatId}
        filtersFromOverview={filtersFromOverview}
      />

      <div className="mx-auto max-w-[1200px] px-4 md:px-8 py-8">
        {/* Header */}
        <div
          className="rounded-3xl mb-6 border backdrop-blur-xl px-6 py-5 flex items-start justify-between gap-4"
          style={{ background: cardBg, borderColor }}
        >
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-1 inline-flex items-center justify-center w-10 h-10 rounded-2xl border text-lg font-bold"
              style={{ borderColor, color: textColor }}
            >
              ←
            </button>

            <div>
             

              <h1
                className="text-2xl md:text-3xl font-black tracking-tight"
                style={{ color: textColor }}
              >
                {flatLabel}
              </h1>

              {levelLabel && (
                <div className="mt-1 text-sm font-semibold" style={{ color: secondaryTextColor }}>
                  {levelLabel}
                </div>
              )}

             

              <div className="mt-2 text-[11px]" style={{ color: secondaryTextColor }}>
                {roomMetaStatus === "loading" ? (
                  <span>Loading room names…</span>
                ) : roomMetaStatus === "failed" ? (
                  <span>Room names failed → showing IDs</span>
                ) : (
                  <span>
                   
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right side (Logs button + ids) */}
          <div className="text-right">
            <button
              type="button"
              onClick={() => setLogsOpen(true)}
              className="mb-3 inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-sm font-black"
              style={{
                borderColor,
                color: textColor,
                background:
                  theme === "dark"
                    ? "linear-gradient(135deg, rgba(30,64,175,0.25), rgba(2,6,23,0.35))"
                    : "linear-gradient(135deg, rgba(219,234,254,0.95), rgba(255,255,255,0.98))",
              }}
            >
              📜 Logs
            </button>

           
          </div>
        </div>

        {loading && (
          <div className="py-16 text-center">
            <div className="mb-4 inline-block">
              <div
                className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
                style={{
                  borderColor: theme === "dark" ? "#475569" : "#cbd5e1",
                  borderTopColor: "transparent",
                }}
              />
            </div>
            <div className="text-sm font-semibold" style={{ color: secondaryTextColor }}>
              Loading room-wise stats for this flat...
            </div>
          </div>
        )}

        {!loading && error && (
          <div
            className="rounded-3xl border px-6 py-5 backdrop-blur-xl mb-6"
            style={{
              background:
                theme === "dark"
                  ? "rgba(127,29,29,0.5)"
                  : "rgba(254,226,226,0.9)",
              borderColor: "#ef4444",
            }}
          >
            <div className="text-sm font-semibold mb-1" style={{ color: "#b91c1c" }}>
              {error}
            </div>
            <div className="text-xs" style={{ color: secondaryTextColor }}>
              Please check if checklist items exist for this flat and try again.
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Summary cards */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <div className="rounded-3xl border px-5 py-4" style={{ background: cardBg, borderColor }}>
                <div
                  className="text-[11px] font-semibold mb-1 uppercase tracking-wide"
                  style={{ color: secondaryTextColor }}
                >
                  Total Checks
                </div>
                <div className="text-3xl font-black" style={{ color: textColor }}>
                  {fmtInt(totalItems)}
                </div>
                <div className="text-[11px] mt-1" style={{ color: secondaryTextColor }}>
                  Across all rooms
                </div>
              </div>

              <div
                className="rounded-3xl border px-5 py-4"
                style={{
                  background:
                    theme === "dark"
                      ? "linear-gradient(135deg, #064e3b, #047857)"
                      : "linear-gradient(135deg, #bbf7d0, #4ade80)",
                  borderColor: theme === "dark" ? "#22c55e" : "#16a34a",
                }}
              >
                <div className="text-[11px] font-semibold mb-1 uppercase tracking-wide text-emerald-50">
                  Closed
                </div>
                <div className="text-3xl font-black text-emerald-50">
                  {fmtInt(totalClosed)}
                </div>
                <div className="text-[11px] mt-1 text-emerald-100">
                  {totalItems > 0
                    ? `${Math.round((totalClosed / totalItems) * 100)}% complete`
                    : "No items"}
                </div>
              </div>

              <div
                className="rounded-3xl border px-5 py-4"
                style={{
                  background:
                    theme === "dark"
                      ? "linear-gradient(135deg, #7c2d12, #b45309)"
                      : "linear-gradient(135deg, #fed7aa, #fb923c)",
                  borderColor: theme === "dark" ? "#f97316" : "#ea580c",
                }}
              >
                <div className="text-[11px] font-semibold mb-1 uppercase tracking-wide text-orange-50">
                  Open / Pending
                </div>
                <div className="text-3xl font-black text-orange-50">
                  {fmtInt(totalOpen)}
                </div>
                <div className="text-[11px] mt-1 text-orange-100">
                  {totalItems > 0
                    ? `${Math.round((totalOpen / totalItems) * 100)}% of total`
                    : "No items"}
                </div>
              </div>
            </div>

            {/* Room-wise table */}
            <div
              className="rounded-3xl border overflow-hidden backdrop-blur-xl"
              style={{ borderColor, background: cardBg }}
            >
              <div
                className="px-6 py-4 border-b"
                style={{
                  borderColor,
                  background:
                    theme === "dark" ? "rgba(15,23,42,0.9)" : "#f9fafb",
                }}
              >
                <div className="text-lg font-black" style={{ color: textColor }}>
                  Room-wise Snag Summary
                </div>
                
              </div>

              <div className="max-h-[480px] overflow-auto">
                <table className="min-w-full text-sm">
                  <thead
                    className="sticky top-0 z-10"
                    style={{
                      background: theme === "dark" ? "#020617" : "#e5e7eb",
                    }}
                  >
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-bold" style={{ color: textColor }}>
                        Room
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-bold" style={{ color: textColor }}>
                        Total
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-bold" style={{ color: textColor }}>
                        Open
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-bold" style={{ color: textColor }}>
                        Closed
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-bold" style={{ color: textColor }}>
                        By Category
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {rooms.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-10 text-center text-sm font-semibold"
                          style={{ color: secondaryTextColor }}
                        >
                          No checklist items found for this flat (with current filters).
                        </td>
                      </tr>
                    )}

                    {rooms.map((room, idx) => {
                      const rid = normId(getRoomIdFromStats(room));
                      const key = rid || `row-${idx}`;
                      const roomLabel = getRoomLabel(room);
                      const byCat = normalizeByCategory(room);

                      return (
                        <tr
                          key={key}
                          className="border-t"
                          style={{
                            borderColor: theme === "dark" ? "#020617" : "#e5e7eb",
                          }}
                        >
                          <td className="px-6 py-3 align-top">
                            <div className="font-semibold" style={{ color: textColor }}>
                              {roomLabel}
                            </div>

                          </td>

                          <td className="px-4 py-3 text-right align-top" style={{ color: textColor }}>
                            {fmtInt(room.total)}
                          </td>

                          <td className="px-4 py-3 text-right align-top" style={{ color: "#f97316" }}>
                            {fmtInt(room.open)}
                          </td>

                          <td className="px-4 py-3 text-right align-top" style={{ color: "#10b981" }}>
                            {fmtInt(room.closed)}
                          </td>

                          <td className="px-6 py-3 align-top">
                            <div className="flex flex-wrap gap-2">
                              {byCat.length === 0 && (
                                <span className="text-[11px]" style={{ color: secondaryTextColor }}>
                                  No category breakdown
                                </span>
                              )}

                              {byCat.map((cat, cidx) => {
                                const label = getCategoryLabel(cat);
                                const count = safeNumber(cat.count || 0, 0);
                                const cid = cat?.category_id || String(cidx);

                                return (
                                  <span
                                    key={`${key}-${cid}-${cidx}`}
                                    className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                                    style={{
                                      background:
                                        theme === "dark"
                                          ? "rgba(30,64,175,0.35)"
                                          : "rgba(219,234,254,0.9)",
                                      color: textColor,
                                      border: `1px solid ${
                                        theme === "dark"
                                          ? "rgba(148,163,184,0.25)"
                                          : "rgba(15,23,42,0.08)"
                                      }`,
                                    }}
                                    title={cid ? `Category ID: ${cid}` : ""}
                                  >
                                    {label} • {fmtInt(count)}
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

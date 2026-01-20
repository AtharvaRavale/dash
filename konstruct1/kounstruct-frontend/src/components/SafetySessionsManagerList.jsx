import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  getProjectsForCurrentUser,
  resolveActiveProjectId,
  setActiveProjectId,
  listSafetySessions,
  publishSafetySession,
  archiveSafetySession,
  deleteSafetySession,
} from "../api/index";

const MODES = [
  { value: "", label: "All Modes" },
  { value: "SELF_PACED", label: "Self Paced" },
  { value: "IN_PERSON", label: "In Person" },
];

const STATUSES = [
  { value: "", label: "All Status" },
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Archived" },
];

const safeArr = (v) => (Array.isArray(v) ? v : []);

const normalizeList = (data) => {
  // DRF pagination -> {count,next,previous,results:[...]}
  if (data && typeof data === "object" && Array.isArray(data.results)) {
    return {
      items: data.results,
      count: Number(data.count || 0),
      next: data.next || null,
      previous: data.previous || null,
    };
  }
  // Non paginated array
  if (Array.isArray(data)) {
    return { items: data, count: data.length, next: null, previous: null };
  }
  return { items: [], count: 0, next: null, previous: null };
};

const pickProjectLabel = (p) =>
  p?.label || p?.name || p?.project_label || p?.title || `Project #${p?.id ?? "-"}`;

const fmtDT = (v) => {
  if (!v) return "-";
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(v);
  }
};

export default function SafetySessionsManagerList() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState(
    String(resolveActiveProjectId?.() || "") || ""
  );

  const [mode, setMode] = useState("");
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");

  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);

  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);

  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Load projects dropdown
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoadingProjects(true);
        const res = await getProjectsForCurrentUser();
        const raw = res?.data;

        const list =
          normalizeList(raw).items.length > 0 ? normalizeList(raw).items : safeArr(raw);

        if (!alive) return;
        setProjects(list);

        // if no active project -> set first project
        if (!projectId && list?.length) {
          const firstId = list[0]?.id;
          if (firstId) {
            setProjectId(String(firstId));
            try {
              setActiveProjectId?.(firstId);
            } catch {}
          }
        }
      } catch (e) {
        if (!alive) return;
        setProjects([]);
      } finally {
        if (!alive) return;
        setLoadingProjects(false);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist project selection
  useEffect(() => {
    if (projectId) {
      try {
        setActiveProjectId?.(projectId);
      } catch {}
      setOffset(0);
    }
  }, [projectId]);

  const params = useMemo(() => {
    const p = { limit, offset };
    if (projectId) p.project_id = projectId;
    if (mode) p.mode = mode;
    if (status) p.status = status;
    return p;
  }, [limit, offset, projectId, mode, status]);

  // Load sessions list
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErr("");

        const res = await listSafetySessions(params);
        const { items, count: total } = normalizeList(res?.data);

        if (!alive) return;

        // FE-side search
        const qq = (q || "").trim().toLowerCase();
        const filtered = !qq
          ? items
          : items.filter((x) =>
              String(x?.title || "").toLowerCase().includes(qq)
            );

        setRows(filtered);
        setCount(total);
      } catch (e) {
        if (!alive) return;
        setRows([]);
        setCount(0);
        setErr(e?.response?.data?.detail || e?.message || "Failed to load sessions");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [params, q]);

  const refresh = async () => {
    const res = await listSafetySessions(params);
    const { items, count: total } = normalizeList(res?.data);
    setRows(items);
    setCount(total);
  };

  const onPublish = async (id) => {
    try {
      await publishSafetySession(id);
      toast.success("Published");
      await refresh();
    } catch (e) {
      toast.error(e?.response?.data?.detail || e?.message || "Publish failed");
    }
  };

  const onArchive = async (id) => {
    try {
      await archiveSafetySession(id);
      toast.success("Archived");
      await refresh();
    } catch (e) {
      toast.error(e?.response?.data?.detail || e?.message || "Archive failed");
    }
  };

  const onDelete = async (id) => {
    const ok = window.confirm("Delete this Safety Session? This cannot be undone.");
    if (!ok) return;

    try {
      await deleteSafetySession(id);
      toast.success("Deleted");
      await refresh();
    } catch (e) {
      toast.error(e?.response?.data?.detail || e?.message || "Delete failed");
    }
  };

  const totalPages = Math.max(1, Math.ceil((count || 0) / (limit || 1)));
  const currentPage = Math.floor((offset || 0) / (limit || 1)) + 1;

  return (
    <>
      <div className="safetyPage">
        <div className="safetyHeader">
          <div>
            <div className="safetyTitle">Safety Sessions (Manager)</div>
            <div className="safetySub">
              Create • Publish • Assign • Track • Attendance • Quiz
            </div>
          </div>

          <button
            className="safetyBtn primary"
           onClick={() => navigate("/safety/sessions/create")}

          >
            + Create Session
          </button>
        </div>

        <div className="safetyFilters">
          <div className="field">
            <label>Project</label>
            <select
              value={projectId || ""}
              onChange={(e) => setProjectId(e.target.value)}
              disabled={loadingProjects}
            >
              <option value="">
                {loadingProjects ? "Loading..." : "All (Manager Scope)"}
              </option>
              {projects.map((p) => (
                <option key={p.id} value={String(p.id)}>
                  {pickProjectLabel(p)}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Mode</label>
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              {MODES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field grow">
            <label>Search</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by title..."
            />
          </div>
        </div>

        {err ? <div className="safetyError">{err}</div> : null}

        <div className="safetyCard">
          <div className="safetyCardHeader">
            <div className="safetyCardTitle">Sessions ({count})</div>

            <div className="safetyPager">
              <button
                className="safetyBtn"
                disabled={currentPage <= 1 || loading}
                onClick={() => setOffset(Math.max(0, offset - limit))}
              >
                Prev
              </button>

              <div className="safetyPagerText">
                Page {currentPage} / {totalPages}
              </div>

              <button
                className="safetyBtn"
                disabled={currentPage >= totalPages || loading}
                onClick={() => setOffset(offset + limit)}
              >
                Next
              </button>

              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value) || 20);
                  setOffset(0);
                }}
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}/page
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="safetyLoading">Loading sessions...</div>
          ) : rows.length === 0 ? (
            <div className="safetyEmpty">No sessions found.</div>
          ) : (
            <div className="safetyTableWrap">
              <table className="safetyTable">
                <thead>
                  <tr>
                    <th style={{ width: 80 }}>ID</th>
                    <th>Title</th>
                    <th style={{ width: 140 }}>Mode</th>
                    <th style={{ width: 140 }}>Status</th>
                    <th style={{ width: 220 }}>Scheduled</th>
                    <th style={{ width: 220 }}>Due</th>
                    <th style={{ width: 300 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((s) => (
                    <tr key={s.id}>
                      <td>{s.id}</td>

                      <td>
                        <div className="cellTitle">{s.title || "-"}</div>
                        <div className="cellSub">
                          {safeArr(s.projects).length
                            ? `Projects: ${safeArr(s.projects)
                                .map((p) => p.project_label || p.project_id)
                                .join(", ")}`
                            : "Projects: -"}
                        </div>
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            s.mode === "IN_PERSON" ? "bBlue" : "bPurple"
                          }`}
                        >
                          {s.mode || "-"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            s.status === "PUBLISHED"
                              ? "bGreen"
                              : s.status === "ARCHIVED"
                              ? "bGray"
                              : "bOrange"
                          }`}
                        >
                          {s.status || "-"}
                        </span>
                      </td>

                      <td>{fmtDT(s.scheduled_at)}</td>
                      <td>{fmtDT(s.due_at)}</td>

                      <td>
                        <div className="rowActions">
                          <button
                            className="safetyBtn"
                            onClick={() => navigate(`/safety/sessions/${s.id}`)}

                          >
                            View
                          </button>

                          {s.status === "DRAFT" ? (
                            <button
                              className="safetyBtn primary"
                              onClick={() => onPublish(s.id)}
                            >
                              Publish
                            </button>
                          ) : null}

                          {s.status === "PUBLISHED" ? (
                            <button
                              className="safetyBtn warn"
                              onClick={() => onArchive(s.id)}
                            >
                              Archive
                            </button>
                          ) : null}

                          <button
                            className="safetyBtn danger"
                            onClick={() => onDelete(s.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ✅ CSS INSIDE SAME FILE */}
      <style>{`
        .safetyPage { padding: 16px; }

        .safetyHeader {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }

        .safetyTitle { font-size: 20px; font-weight: 700; }
        .safetySub { margin-top: 4px; color: #666; font-size: 13px; }

        .safetyFilters {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 12px;
        }

        .field { display: flex; flex-direction: column; gap: 6px; min-width: 200px; }
        .field.grow { flex: 1; min-width: 260px; }

        .field label { font-size: 12px; color: #555; }
        .field input, .field select {
          border: 1px solid #ddd;
          border-radius: 10px;
          padding: 10px 12px;
          outline: none;
          background: #fff;
        }

        .safetyCard {
          border: 1px solid #eee;
          border-radius: 14px;
          background: #fff;
          overflow: hidden;
        }

        .safetyCardHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 12px;
          border-bottom: 1px solid #eee;
          gap: 12px;
        }

        .safetyCardTitle { font-weight: 700; }

        .safetyPager { display: flex; align-items: center; gap: 8px; }
        .safetyPagerText { font-size: 13px; color: #444; }

        .safetyBtn {
          border: 1px solid #ddd;
          background: #fff;
          padding: 9px 12px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 13px;
          transition: transform 0.05s ease;
        }
        .safetyBtn:active { transform: scale(0.98); }
        .safetyBtn:disabled { opacity: 0.5; cursor: not-allowed; }

        .safetyBtn.primary { border-color: #0f62fe; background: #0f62fe; color: #fff; }
        .safetyBtn.warn { border-color: #ff9f1a; background: #ff9f1a; color: #111; }
        .safetyBtn.danger { border-color: #ff4d4f; background: #ff4d4f; color: #fff; }

        .safetyLoading, .safetyEmpty { padding: 18px; color: #444; }

        .safetyError {
          margin: 10px 0;
          padding: 10px 12px;
          border: 1px solid #ffd5d5;
          background: #fff3f3;
          color: #a40000;
          border-radius: 12px;
        }

        .safetyTableWrap { overflow: auto; }
        .safetyTable { width: 100%; border-collapse: collapse; min-width: 980px; }
        .safetyTable th, .safetyTable td {
          border-bottom: 1px solid #f1f1f1;
          padding: 12px;
          text-align: left;
          vertical-align: top;
        }
        .safetyTable th { font-size: 12px; color: #666; background: #fafafa; }

        .cellTitle { font-weight: 700; }
        .cellSub { font-size: 12px; color: #666; margin-top: 4px; }

        .rowActions { display: flex; flex-wrap: wrap; gap: 8px; }

        .badge {
          display: inline-block;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 12px;
          border: 1px solid #ddd;
        }
        .badge.bGreen { border-color: #1d7f2a; background: #ecfff0; color: #1d7f2a; }
        .badge.bOrange { border-color: #ff9f1a; background: #fff6e8; color: #9a5a00; }
        .badge.bGray { border-color: #999; background: #f6f6f6; color: #333; }
        .badge.bBlue { border-color: #2f6fed; background: #eef4ff; color: #2f6fed; }
        .badge.bPurple { border-color: #7a3ef2; background: #f3edff; color: #7a3ef2; }
      `}</style>
    </>
  );
}

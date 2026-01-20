import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import * as API from "../api/index";

const safeArr = (v) => (Array.isArray(v) ? v : []);

const normalizeList = (data) => {
  if (data && typeof data === "object" && Array.isArray(data.results)) {
    return { items: data.results, count: Number(data.count || 0) };
  }
  if (Array.isArray(data)) return { items: data, count: data.length };
  return { items: [], count: 0 };
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

const STATUSES = [
  { value: "", label: "All" },
  { value: "PUBLISHED", label: "Published" },
  { value: "DRAFT", label: "Draft" },
  { value: "ARCHIVED", label: "Archived" },
];

export default function SafetyMySessionsList() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const activeProjectId = String(API.resolveActiveProjectId?.() || "") || "";
  const [projectId, setProjectId] = useState(activeProjectId);

  const [status, setStatus] = useState("PUBLISHED");
  const [q, setQ] = useState("");

  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // load projects
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingProjects(true);
        const res = await API.getProjectsForCurrentUser?.();
        const raw = res?.data;
        const list =
          normalizeList(raw).items.length > 0 ? normalizeList(raw).items : safeArr(raw);

        if (!alive) return;
        setProjects(list);

        if (!projectId && list?.length) {
          const first = list[0]?.id;
          if (first) {
            setProjectId(String(first));
            try {
              API.setActiveProjectId?.(first);
            } catch {}
          }
        }
      } catch {
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

  // persist project selection
  useEffect(() => {
    if (!projectId) return;
    try {
      API.setActiveProjectId?.(projectId);
    } catch {}
  }, [projectId]);

  const params = useMemo(() => {
    const p = {};
    if (projectId) p.project_id = projectId;
    if (status) p.status = status;
    return p;
  }, [projectId, status]);

  // load sessions for user
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErr("");

        const res = await API.listSafetySessions(params);
        const { items, count: total } = normalizeList(res?.data);

        if (!alive) return;

        const qq = (q || "").trim().toLowerCase();
        const filtered = !qq
          ? items
          : items.filter((x) => String(x?.title || "").toLowerCase().includes(qq));

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

  return (
    <>
      <div className="safetyUserPage">
        <div className="header">
          <div>
            <div className="title">My Safety Sessions</div>
            <div className="sub">Watch • Acknowledge • Quiz • Complete</div>
          </div>
        </div>

        <div className="filters">
          <div className="field">
            <label>Project</label>
            <select
              value={projectId || ""}
              onChange={(e) => setProjectId(e.target.value)}
              disabled={loadingProjects}
            >
              <option value="">{loadingProjects ? "Loading..." : "Select Project"}</option>
              {projects.map((p) => (
                <option key={p.id} value={String(p.id)}>
                  {pickProjectLabel(p)}
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

        {err ? <div className="err">{err}</div> : null}

        <div className="card">
          <div className="cardTop">
            <div className="cardTitle">Sessions ({count})</div>
          </div>

          {loading ? (
            <div className="pad">Loading...</div>
          ) : rows.length === 0 ? (
            <div className="pad">No sessions found.</div>
          ) : (
            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: 80 }}>ID</th>
                    <th>Title</th>
                    <th style={{ width: 150 }}>Mode</th>
                    <th style={{ width: 150 }}>Status</th>
                    <th style={{ width: 220 }}>Scheduled</th>
                    <th style={{ width: 220 }}>Due</th>
                    <th style={{ width: 160 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((s) => (
                    <tr key={s.id}>
                      <td>{s.id}</td>
                      <td>
                        <div className="t1">{s.title || "-"}</div>
                        <div className="t2">{s.description ? String(s.description).slice(0, 90) : ""}</div>
                      </td>
                      <td>{s.mode || "-"}</td>
                      <td>{s.status || "-"}</td>
                      <td>{fmtDT(s.scheduled_at)}</td>
                      <td>{fmtDT(s.due_at)}</td>
                      <td>
                        <button
                          className="btn primary"
                          onClick={() => {
                            if (!projectId) return toast.error("Select project first");
                            navigate(`/safety/my-sessions/${s.id}?project_id=${projectId}`);
                          }}
                        >
                          Open
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .safetyUserPage{ padding: 16px; }
        .header{ display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 12px; }
        .title{ font-size: 20px; font-weight: 800; }
        .sub{ margin-top: 4px; color:#666; font-size: 13px; }

        .filters{ display:flex; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; }
        .field{ display:flex; flex-direction:column; gap: 6px; min-width: 220px; }
        .field.grow{ flex: 1; min-width: 260px; }
        label{ font-size: 12px; color:#555; }
        input, select{
          border: 1px solid #ddd; border-radius: 12px; padding: 10px 12px;
          outline:none; background:#fff; font-size: 14px;
        }

        .err{ padding: 10px 12px; border: 1px solid #ffd5d5; background:#fff3f3; color:#a40000; border-radius: 12px; margin-bottom: 12px; }

        .card{ background:#fff; border: 1px solid #eee; border-radius: 14px; overflow:hidden; }
        .cardTop{ padding: 12px; border-bottom: 1px solid #eee; display:flex; justify-content:space-between; }
        .cardTitle{ font-weight: 800; }
        .pad{ padding: 14px; color:#444; }

        .tableWrap{ overflow:auto; }
        .table{ width:100%; border-collapse: collapse; min-width: 980px; }
        th, td{ border-bottom: 1px solid #f1f1f1; padding: 12px; text-align:left; vertical-align:top; }
        th{ font-size: 12px; color:#666; background:#fafafa; }
        .t1{ font-weight: 800; }
        .t2{ font-size: 12px; color:#666; margin-top: 4px; }

        .btn{ border:1px solid #ddd; background:#fff; padding: 9px 12px; border-radius: 12px; cursor:pointer; font-size: 13px; }
        .btn.primary{ border-color:${"#ffbe63"}; background:${"#ffbe63"}; color:#111; font-weight: 800; }
      `}</style>
    </>
  );
}

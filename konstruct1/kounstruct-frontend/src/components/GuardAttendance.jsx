// components/GuardAttendance.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "../ThemeContext";
import { showToast } from "../utils/toast";
import {
  getProjectsForCurrentUser,
  getStaffByProject,
  listAttendanceByUser,
  markAttendance,
} from "../api";
import SideBarSetup, { SIDEBAR_WIDTH } from "./SideBarSetup";
import { useSidebar } from "./SidebarContext";

function getQuery(name) {
  try { return new URLSearchParams(window.location.search).get(name); }
  catch { return null; }
}
function ymd(d = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function coerceProjects(raw) {
  const src =
    (raw && Array.isArray(raw) && raw) ||
    (raw && Array.isArray(raw.results) && raw.results) ||
    (raw && raw.data && Array.isArray(raw.data) && raw.data) ||
    (raw && raw.data && Array.isArray(raw.data.results) && raw.data.results) ||
    [];
  return src
    .map((p) => {
      const id = p.id ?? p.project_id ?? p.pk ?? p.uid;
      const name = p.name ?? p.title ?? p.project_name ?? `Project ${id}`;
      return id ? { id: Number(id), name } : null;
    })
    .filter(Boolean);
}
function getInitialProjectIdFromAny(projects) {
  const fromQuery = getQuery("project_id");
  if (fromQuery && projects.some((p) => p.id === Number(fromQuery))) {
    return Number(fromQuery);
  }
  const ls = localStorage.getItem("ACTIVE_PROJECT_ID");
  if (ls && projects.some((p) => p.id === Number(ls))) {
    return Number(ls);
  }
  if (projects.length === 1) return projects[0].id;
  return null;
}
function getInitialUserIdFromQuery() {
  const qp = getQuery("user_id");
  return qp ? Number(qp) : null;
}

export default function GuardAttendance() {
  const { theme } = useTheme();
  const { sidebarOpen } = useSidebar();

  // THEME palette
  const ORANGE = "#ffbe63";
  const BG_OFFWHITE = "#fcfaf7";
  const bgColor = theme === "dark" ? "#191922" : BG_OFFWHITE;
  const cardColor = theme === "dark" ? "#23232c" : "#fff";
  const borderColor = ORANGE;
  const textColor = theme === "dark" ? "#fff" : "#222";
  const iconColor = ORANGE;

  // pickers
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState(null);

  const [staffList, setStaffList] = useState([]);
  const [staffSearch, setStaffSearch] = useState("");
  const [userId, setUserId] = useState(getInitialUserIdFromQuery());

  // attendance
  const [date, setDate] = useState(ymd());
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // build full image URL for relative photo paths
const API_BASE =
  (process.env.REACT_APP_API_BASE || "").replace(/\/$/, "");
const fullUrl = (p) =>
  !p ? "" : p.startsWith("http") ? p : `${API_BASE}${p.startsWith("/") ? "" : "/"}${p}`;

// "Show all" panel state
const [showAll, setShowAll] = useState(false);
const [allStaff, setAllStaff] = useState([]);
const [allLoading, setAllLoading] = useState(false);

const openAllStaff = async () => {
  if (!projectId) return showToast("Pick a project first", "error");
  try {
    setAllLoading(true);
    setShowAll(true);
    // empty q → fetch all (your endpoint supports `?q=`)
    const { data } = await getStaffByProject(projectId, "");
    setAllStaff(Array.isArray(data?.results) ? data.results : []);
  } catch {
    setAllStaff([]);
  } finally {
    setAllLoading(false);
  }
};


  // marking
  const [forceAction, setForceAction] = useState(""); // "", "IN", "OUT"
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState(null);

  // camera
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streamActive, setStreamActive] = useState(false);

  const canMark = useMemo(
    () => userId && projectId && (streamActive || file),
    [userId, projectId, streamActive, file]
  );

  // load projects
  useEffect(() => {
    (async () => {
      try {
        const res = await getProjectsForCurrentUser();
        const list = coerceProjects(res);
        setProjects(list);
        const initial = getInitialProjectIdFromAny(list);
        setProjectId(initial);
        if (initial) localStorage.setItem("ACTIVE_PROJECT_ID", String(initial));
      } catch (e) {
        showToast("Failed to load projects", "error");
      }
    })();
  }, []);

  // load staff when project/search changes
  useEffect(() => {
    if (!projectId) {
      setStaffList([]);
      return;
    }
    const h = setTimeout(async () => {
      try {
        const { data } = await getStaffByProject(projectId, staffSearch.trim());
        const list = Array.isArray(data?.results) ? data.results : [];
        setStaffList(list);
      } catch {
        setStaffList([]);
      }
    }, 300);
    return () => clearTimeout(h);
  }, [projectId, staffSearch]);

  // camera boot
  useEffect(() => {
    let stream;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setStreamActive(true);
        }
      } catch {
        setStreamActive(false);
      }
    })();
    return () => stream?.getTracks()?.forEach((t) => t.stop());
  }, []);

  const captureBlob = async () => {
    if (!videoRef.current || !canvasRef.current) return null;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d").drawImage(v, 0, 0, c.width, c.height);
    return new Promise((resolve) => c.toBlob((b) => resolve(b), "image/jpeg", 0.9));
  };

  const fetchList = async () => {
    if (!userId || !projectId) return;
    setLoading(true);
    try {
      const { data } = await listAttendanceByUser({
        user_id: userId,
        project_id: projectId,
        date,
      });
      setRows(Array.isArray(data) ? data : data?.results || []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, projectId, date]);

  const mark = async () => {
    if (!canMark || submitting) return;

    const getGeo = () =>
      new Promise((resolve) => {
        if (!navigator.geolocation) return resolve(null);
        navigator.geolocation.getCurrentPosition(
          (pos) =>
            resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
          () => resolve(null),
          { enableHighAccuracy: true, timeout: 5000 }
        );
      });

    try {
      setSubmitting(true);
      let photoBlob = file;
      if (!photoBlob && streamActive) photoBlob = await captureBlob();
      if (!photoBlob) {
        showToast("Please provide a face photo (camera or upload).", "error");
        setSubmitting(false);
        return;
      }
      const geo = await getGeo();
      const res = await markAttendance({
        user_id: Number(userId),
        project_id: Number(projectId),
        photo: photoBlob,
        lat: geo?.lat,
        lon: geo?.lon,
        force_action: forceAction || undefined,
      });

      const act = res?.data?.action || forceAction || "IN/OUT";
      showToast(`Marked ${act} ✅`, "success");
      setFile(null);
      fetchList();
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.photo ||
        "Failed to mark attendance";
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedStaff = staffList.find((s) => s.id === userId);

  // robust offset (works even if SIDEBAR_WIDTH wasn't exported)
  const sidebarOffset = sidebarOpen
    ? (typeof SIDEBAR_WIDTH === "number" ? SIDEBAR_WIDTH : (SIDEBAR_WIDTH?.WIDTH ?? 240))
    : 0;

  return (
    <>
      <SideBarSetup
        overrideNavItems={[
          { name: "Onboarding", path: "/guard/onboarding" },
          { name: "Attendance", path: "/guard/attendance" },
        ]}
      />

      <style>{`
        .guard-page input, .guard-page select, .guard-page button, .guard-page textarea {
          color: ${textColor};
          font-size: 14px;
        }
        .guard-card {
          background: ${cardColor};
          border: 1px solid ${theme === "dark" ? "rgba(255,190,99,.25)" : "rgba(255,190,99,.2)"};
          box-shadow: 0 2px 8px ${theme === "dark" ? "rgba(0,0,0,.3)" : "rgba(0,0,0,.06)"};
        }
        .guard-accent { color: ${iconColor}; }

        .guard-input {
          background: ${cardColor};
          border: 1px solid ${theme === "dark" ? "rgba(255,190,99,.35)" : "rgba(255,190,99,.3)"};
          border-radius: 8px;
          transition: all 0.2s ease;
          font-size: 14px;
          padding: 10px 12px;
        }
        .guard-input:hover {
          border-color: ${theme === "dark" ? "rgba(255,190,99,.5)" : "rgba(255,190,99,.45)"};
        }
        .guard-input:focus {
          outline: none;
          border-color: ${iconColor};
          box-shadow: 0 0 0 3px ${theme === "dark" ? "rgba(255,190,99,.15)" : "rgba(255,190,99,.1)"};
        }
        .guard-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .guard-primary { 
          background: ${iconColor}; 
          color: #222; 
          font-weight: 600;
          border-radius: 8px;
          padding: 12px 24px;
          transition: all 0.2s ease;
          border: none;
        }
        .guard-primary:hover:not(:disabled) { 
          filter: brightness(1.05);
          box-shadow: 0 4px 12px rgba(255,190,99,.3);
        }
        .guard-primary:active:not(:disabled) {
          transform: translateY(1px);
        }
        
        .guard-outline { 
          border: 1px solid ${theme === "dark" ? "rgba(255,190,99,.4)" : "rgba(255,190,99,.35)"}; 
          color: ${textColor}; 
          background: transparent;
          border-radius: 8px;
          padding: 8px 16px;
          font-weight: 500;
          transition: all 0.2s ease;
          font-size: 14px;
        }
        .guard-outline:hover:not(:disabled) {
          background: ${theme === "dark" ? "rgba(255,190,99,.08)" : "rgba(255,190,99,.06)"};
          border-color: ${iconColor};
        }
        .guard-outline:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .guard-table { 
          border-collapse: separate;
          border-spacing: 0;
        }
        .guard-table th { 
          border-bottom: 2px solid ${theme === "dark" ? "rgba(255,190,99,.25)" : "rgba(255,190,99,.2)"};
          padding: 12px 16px;
          font-weight: 600;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: ${theme === "dark" ? "rgba(255,255,255,.7)" : "rgba(0,0,0,.6)"};
        }
        .guard-table td {
          border-bottom: 1px solid ${theme === "dark" ? "rgba(255,190,99,.12)" : "rgba(255,190,99,.1)"};
          padding: 14px 16px;
          font-size: 14px;
        }
        .guard-table tbody tr:hover {
          background: ${theme === "dark" ? "rgba(255,190,99,.04)" : "rgba(255,190,99,.03)"};
        }
        .guard-table tbody tr:last-child td {
          border-bottom: none;
        }

        .guard-label {
          font-weight: 600;
          font-size: 13px;
          margin-bottom: 6px;
          display: block;
          letter-spacing: 0.3px;
        }

        .guard-section-title {
          font-weight: 600;
          font-size: 15px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          letter-spacing: 0.3px;
        }

        .guard-shell {
          min-height: calc(100vh - 32px);
          padding: 32px 24px 48px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }

        .guard-badge {
          display: inline-block;
          background: ${theme === "dark" ? "rgba(255,190,99,.15)" : "rgba(255,190,99,.12)"};
          color: ${iconColor};
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .guard-video-container {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid ${theme === "dark" ? "rgba(255,190,99,.25)" : "rgba(255,190,99,.2)"};
          background: ${theme === "dark" ? "#1a1a24" : "#f8f8f8"};
        }

        .guard-staff-grid-item {
          border: 1px solid ${theme === "dark" ? "rgba(255,190,99,.25)" : "rgba(255,190,99,.2)"};
          background: ${cardColor};
          border-radius: 10px;
          padding: 14px;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .guard-staff-grid-item:hover {
          border-color: ${iconColor};
          background: ${theme === "dark" ? "rgba(255,190,99,.06)" : "rgba(255,190,99,.04)"};
          transform: translateY(-1px);
          box-shadow: 0 4px 12px ${theme === "dark" ? "rgba(0,0,0,.2)" : "rgba(0,0,0,.08)"};
        }

        .guard-file-selected {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: ${theme === "dark" ? "rgba(255,190,99,.1)" : "rgba(255,190,99,.08)"};
          border-radius: 6px;
          font-size: 13px;
          margin-top: 8px;
        }
      `}</style>

      <div className="guard-page" style={{ background: bgColor, marginLeft: sidebarOffset }}>
        <div className="guard-shell">
          {/* Header */}
          <div className="text-center max-w-6xl w-full">
            <div className="guard-badge mb-3">
              Security Portal
            </div>
            <h1 className="text-4xl font-bold" style={{ color: textColor }}>
              Attendance Management
            </h1>
            <p className="mt-3 text-base" style={{ color: textColor, opacity: 0.7 }}>
              Verify staff identity and record check-in/out with facial recognition
            </p>
          </div>

          {/* Main Card */}
          <div className="guard-card rounded-xl p-8 space-y-8 max-w-6xl w-full">
            {/* Pickers Section */}
            <div>
              <h2 className="guard-section-title" style={{ color: textColor }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                Project & Staff Selection
              </h2>
              <div className="grid md:grid-cols-3 gap-5 mt-4">
                <div>
                  <label className="guard-label" style={{ color: textColor }}>
                    Project <span className="guard-accent">*</span>
                  </label>
                  <select
                    className="guard-input w-full"
                    value={projectId || ""}
                    onChange={(e) => {
                      const val = e.target.value ? Number(e.target.value) : null;
                      setProjectId(val);
                      localStorage.setItem("ACTIVE_PROJECT_ID", val ? String(val) : "");
                      setUserId(null);
                    }}
                  >
                    <option value="">Select project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} 
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="guard-label" style={{ color: textColor }}>
                    Staff Member <span className="guard-accent">*</span>
                  </label>
                  <select
                    className="guard-input w-full"
                    value={userId || ""}
                    onChange={(e) => setUserId(e.target.value ? Number(e.target.value) : null)}
                    disabled={!projectId}
                  >
                    <option value="">{projectId ? "Select staff member" : "Select project first"}</option>
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {(s.first_name || s.username || "User")} {s.last_name || ""}{" "}
                        {/* {s.phone_number || s.email || `ID ${s.id}`} */}
                      </option>
                    ))}
                  </select>
                  <input
                    className="guard-input w-full mt-3"
                    placeholder="Search by name, phone, or email..."
                    value={staffSearch}
                    onChange={(e) => setStaffSearch(e.target.value)}
                    disabled={!projectId}
                  />
                </div>

                <div>
                  <label className="guard-label" style={{ color: textColor }}>
                    Date
                  </label>
                  <input
                    className="guard-input w-full"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                  <button
                    type="button"
                    className="guard-outline w-full mt-3"
                    onClick={openAllStaff}
                    disabled={!projectId}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{display: "inline", marginRight: "6px"}}>
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    View All Staff
                  </button>
                </div>
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${theme === "dark" ? "rgba(255,190,99,.15)" : "rgba(255,190,99,.12)"}` }} />

            {/* Camera & Upload Section */}
            <div>
              <h2 className="guard-section-title" style={{ color: textColor }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                Identity Verification
              </h2>
              <div className="grid lg:grid-cols-2 gap-6 mt-4">
                <div>
                  <label className="guard-label" style={{ color: textColor }}>Live Camera Feed</label>
                  <div className="guard-video-container">
                    {streamActive ? (
                      <video ref={videoRef} playsInline muted style={{ width: "100%", display: "block", minHeight: "280px" }} />
                    ) : (
                      <div className="p-8 text-center" style={{ color: textColor, opacity: 0.6, minHeight: "280px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px" }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                          <circle cx="12" cy="13" r="4"/>
                        </svg>
                        <div className="text-sm">Camera unavailable. Please use file upload below.</div>
                      </div>
                    )}
                  </div>
                  <canvas ref={canvasRef} style={{ display: "none" }} />
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="guard-label" style={{ color: textColor }}>Upload Photo (Alternative)</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="guard-input w-full"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    {file && (
                      <div className="guard-file-selected" style={{ color: textColor }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                          <polyline points="13 2 13 9 20 9"/>
                        </svg>
                        <span>{file.name}</span>
                        <button className="text-xs underline ml-2" onClick={() => setFile(null)}>
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="guard-label" style={{ color: textColor }}>Action Type</label>
                    <select
                      className="guard-input w-full"
                      value={forceAction}
                      onChange={(e) => setForceAction(e.target.value)}
                    >
                      <option value="">Auto-detect (IN/OUT)</option>
                      <option value="IN">Force Check IN</option>
                      <option value="OUT">Force Check OUT</option>
                    </select>
                  </div>

                  <button
                    onClick={mark}
                    className="guard-primary w-full"
                    disabled={!canMark || submitting}
                    style={{
                      opacity: !canMark || submitting ? 0.5 : 1,
                      cursor: !canMark || submitting ? "not-allowed" : "pointer",
                    }}
                  >
                    {submitting ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{display: "inline", marginRight: "8px", animation: "spin 1s linear infinite"}}>
                          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{display: "inline", marginRight: "8px"}}>
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Mark Attendance
                      </>
                    )}
                  </button>
                  
                  {!canMark && (
                    <p className="text-xs text-center" style={{ color: textColor, opacity: 0.6 }}>
                      {!userId || !projectId ? "Select project and staff to continue" : "Provide a photo to mark attendance"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${theme === "dark" ? "rgba(255,190,99,.15)" : "rgba(255,190,99,.12)"}` }} />

            {/* Records Table */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="guard-section-title" style={{ color: textColor, marginBottom: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  Attendance Records
                </h2>
                <button className="guard-outline" onClick={fetchList} disabled={loading}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{display: "inline", marginRight: "6px"}}>
                    <polyline points="23 4 23 10 17 10"/>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                  </svg>
                  {loading ? "Refreshing..." : "Refresh"}
                </button>
              </div>
              <div className="overflow-x-auto rounded-lg" style={{ border: `1px solid ${theme === "dark" ? "rgba(255,190,99,.15)" : "rgba(255,190,99,.12)"}` }}>
                <table className="min-w-full guard-table" style={{ color: textColor }}>
                  <thead>
                    <tr className="text-left">
                      <th>Record ID</th>
                      <th>Check In Time</th>
                      <th>Check Out Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 && (
                      <tr>
                        <td className="text-center" colSpan={3} style={{ opacity: 0.6, padding: "32px" }}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{margin: "0 auto 12px", opacity: 0.3}}>
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                          </svg>
                          <div>No attendance records found</div>
                          <div className="text-xs mt-1" style={{opacity: 0.5}}>Records will appear here after marking attendance</div>
                        </td>
                      </tr>
                    )}
                    {rows.map((r) => (
                      <tr key={r.id}>
                        <td>#{r.id}</td>
                        <td>
                          {r.check_in_at ? new Date(r.check_in_at).toLocaleString() : (
                            <span style={{opacity: 0.5}}>—</span>
                          )}
                        </td>
                        <td>
                          {r.check_out_at ? new Date(r.check_out_at).toLocaleString() : (
                            <span style={{opacity: 0.5}}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All Staff Modal */}
      {showAll && (
        <div className="fixed inset-0 z-[1200]" style={{backdropFilter: "blur(4px)"}}>
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAll(false)} />
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-5xl max-h-[85vh] rounded-xl overflow-hidden"
            style={{ background: cardColor, border: `1px solid ${theme === "dark" ? "rgba(255,190,99,.25)" : "rgba(255,190,99,.2)"}`, boxShadow: "0 20px 60px rgba(0,0,0,.3)" }}
          >
            <div className="flex items-center justify-between p-6 border-b" style={{borderColor: theme === "dark" ? "rgba(255,190,99,.15)" : "rgba(255,190,99,.12)"}}>
              <div>
                <h3 className="text-xl font-semibold" style={{ color: textColor }}>All Staff Members</h3>
                <p className="text-sm mt-1" style={{color: textColor, opacity: 0.6}}>Select a staff member to mark attendance</p>
              </div>
              <button className="guard-outline" onClick={() => setShowAll(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{display: "inline", marginRight: "4px"}}>
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Close
              </button>
            </div>

            <div className="p-6 overflow-y-auto" style={{maxHeight: "calc(85vh - 100px)"}}>
              {allLoading ? (
                <div className="text-center py-12" style={{ color: textColor, opacity: 0.6 }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{margin: "0 auto 12px", animation: "spin 1s linear infinite"}}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  <div>Loading staff members...</div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {allStaff.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => { setUserId(s.id); setShowAll(false); }}
                      className="guard-staff-grid-item text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{background: theme === "dark" ? "rgba(255,190,99,.15)" : "rgba(255,190,99,.12)"}}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate" style={{ color: textColor }}>
                            {(s.first_name || s.username || "User")} {s.last_name || ""}
                          </div>
                          <div className="text-xs mt-1 truncate" style={{ color: textColor, opacity: 0.6 }}>
                            {s.phone_number || s.email || `ID: ${s.id}`}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                  {allStaff.length === 0 && (
                    <div className="col-span-full text-center py-12" style={{ color: textColor, opacity: 0.6 }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{margin: "0 auto 12px", opacity: 0.3}}>
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                      <div>No staff members found</div>
                      <div className="text-xs mt-1" style={{opacity: 0.5}}>Try selecting a different project</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
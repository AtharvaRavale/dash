// SafetySessionManagerView.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import * as API from "../api/index";

/* ---------------- helpers ---------------- */
const safeArr = (v) => (Array.isArray(v) ? v : []);

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

const pickProjectLabel = (p) =>
  p?.label || p?.name || p?.project_label || p?.title || `Project #${p?.id ?? "-"}`;

const pickAssetUrl = (a) =>
  a?.url || a?.file_url || a?.file || a?.asset_url || a?.path || "";

const pickAssetType = (a) => a?.asset_type || a?.type || a?.kind || "";
const isVideo = (a) => String(pickAssetType(a)).toUpperCase() === "VIDEO";
const isPpt = (a) => String(pickAssetType(a)).toUpperCase() === "PPT";

const pickQuestionText = (q) =>
  q?.question_text || q?.text || q?.title || q?.question || "Question";

const pickOptionText = (o) =>
  o?.option_text || o?.text || o?.title || o?.name || `Option #${o?.id ?? "-"}`;

const pickPhotoUrl = (p) => p?.image_url || p?.image || p?.url || "";

// ✅ topics / note picker (handles different backend keys safely)
const pickTopicsDiscussed = (report, reportMeta, session) => {
  const candidates = [
    report?.topics_discussed,
    reportMeta?.topics_discussed,
    report?.leader_topics,
    reportMeta?.leader_topics,
    session?.topics_discussed,
  ];
  for (const c of candidates) {
    const s = (c ?? "").toString().trim();
    if (s) return s;
  }
  return "";
};

const Badge = ({ children, tone = "gray" }) => (
  <span className={`badge b-${tone}`}>{children}</span>
);

const prettyJson = (obj) => {
  try {
    return JSON.stringify(obj ?? {}, null, 2);
  } catch {
    return String(obj);
  }
};

export default function SafetySessionManagerView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [session, setSession] = useState(null);

  // quiz preview
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);

  // report
  const [reportLoading, setReportLoading] = useState(false);
  const [reportErr, setReportErr] = useState("");
  const [report, setReport] = useState(null);

  // modals
  const [rawOpen, setRawOpen] = useState(false);
  const [rowOpen, setRowOpen] = useState(false);
  const [activeRow, setActiveRow] = useState(null);
  const [imgOpen, setImgOpen] = useState(false);
  const [activeImg, setActiveImg] = useState("");

  // filters
  const [userSearch, setUserSearch] = useState("");

  const assets = safeArr(session?.assets);
  const photos = safeArr(session?.photos);

  const projects = useMemo(() => {
    const ps = safeArr(session?.projects);
    if (ps.length) return ps;
    if (session?.project) return [session.project];
    return [];
  }, [session]);

  const questions = useMemo(() => {
    const qs = safeArr(quiz?.questions || quiz?.items || quiz?.results);
    return [...qs].sort((a, b) => Number(a?.order ?? 0) - Number(b?.order ?? 0));
  }, [quiz]);

  const statusTone = (st) => {
    if (st === "PUBLISHED") return "green";
    if (st === "ARCHIVED") return "gray";
    if (st === "DRAFT") return "orange";
    return "gray";
  };

  const modeTone = (m) => (m === "IN_PERSON" ? "blue" : "purple");

  const loadSession = async () => {
    if (!API.getSafetySessionById) {
      setErr("API.getSafetySessionById() missing in api/index.js");
      return;
    }
    try {
      setLoading(true);
      setErr("");
      const res = await API.getSafetySessionById(id);
      setSession(res?.data || null);
    } catch (e) {
      setSession(null);
      setErr(
        e?.response?.data?.detail ||
          (e?.response?.data && JSON.stringify(e.response.data)) ||
          e?.message ||
          "Failed to load session"
      );
    } finally {
      setLoading(false);
    }
  };

  const loadQuiz = async () => {
    if (!API.getSafetySessionQuiz) {
      toast.error("API.getSafetySessionQuiz() missing in api/index.js");
      return;
    }
    setQuizLoading(true);
    try {
      const res = await API.getSafetySessionQuiz(id);
      setQuiz(res?.data || null);
    } catch (e) {
      toast.error(e?.response?.data?.detail || e?.message || "Failed to load quiz");
    } finally {
      setQuizLoading(false);
    }
  };

  const loadReport = async () => {
    const fn = API.getSafetySessionReport;
    if (!fn) {
      setReportErr("API.getSafetySessionReport() missing in api/index.js");
      setReport(null);
      return;
    }
    setReportLoading(true);
    setReportErr("");
    try {
      const res = await fn(id);
      setReport(res?.data || null);
    } catch (e) {
      setReport(null);
      setReportErr(e?.response?.data?.detail || e?.message || "Failed to load report");
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // auto-load report after session loads
  useEffect(() => {
    if (!session?.id) return;
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id]);

  /* ✅ EXACT summary from /report/ */
  const summary = report?.summary || {};
  const stats = useMemo(() => {
    const assigned = Number(summary?.assigned ?? 0) || 0;
    const viewed = Number(summary?.viewed ?? 0) || 0;
    const completed = Number(summary?.completed ?? 0) || 0;
    const present = Number(summary?.present ?? 0) || 0;
    const absent = Number(summary?.absent ?? 0) || 0;

    const quizSubmitted = Number(summary?.quiz_submitted ?? 0) || 0;
    const quizPassed = Number(summary?.quiz_passed ?? 0) || 0;
    const quizFailed = Math.max(0, quizSubmitted - quizPassed);

    return { assigned, viewed, completed, present, absent, quizSubmitted, quizPassed, quizFailed };
  }, [summary]);

  const reportMeta = report?.report_meta || {};
  const groupPhotos = safeArr(report?.group_photos);

  // ✅ NEW: topics discussed (leader note) in manager view
  const topicsDiscussed = useMemo(
    () => pickTopicsDiscussed(report, reportMeta, session),
    [report, reportMeta, session]
  );
  const topicsPreview = useMemo(() => {
    const s = (topicsDiscussed || "").trim();
    if (!s) return "";
    return s.length > 90 ? `${s.slice(0, 90)}…` : s;
  }, [topicsDiscussed]);

  const reportUsersRaw = safeArr(report?.users);

  /* ✅ FIX: your report.users items are like:
     {
       user: {...}, viewed_at, completed_at, quiz, attendance, participant_photos
     }
  */
  const reportUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    const rows = reportUsersRaw.map((row) => {
      const u = row?.user || {};
      const full = `${u.first_name || ""} ${u.last_name || ""} ${u.username || ""}`.toLowerCase();
      const ok = !q || full.includes(q) || String(u?.id || "").includes(q);
      return ok ? row : null;
    });
    return rows.filter(Boolean);
  }, [reportUsersRaw, userSearch]);

  const onPublish = async () => {
    if (!API.publishSafetySession) return toast.error("publishSafetySession() missing");
    try {
      await API.publishSafetySession(id);
      toast.success("Published ✅");
      await loadSession();
      await loadReport();
    } catch (e) {
      toast.error(e?.response?.data?.detail || e?.message || "Publish failed");
    }
  };

  const onUnpublish = async () => {
    if (!API.archiveSafetySession) return toast.error("archiveSafetySession() missing");
    try {
      await API.archiveSafetySession(id);
      toast.success("Unpublished (Archived) ✅");
      await loadSession();
      await loadReport();
    } catch (e) {
      toast.error(e?.response?.data?.detail || e?.message || "Unpublish failed");
    }
  };

  const onDelete = async () => {
    if (!API.deleteSafetySession) return toast.error("deleteSafetySession() missing");
    const ok = window.confirm("Delete this Safety Session? This cannot be undone.");
    if (!ok) return;

    try {
      await API.deleteSafetySession(id);
      toast.success("Deleted ✅");
      navigate("/safety/sessions");
    } catch (e) {
      toast.error(e?.response?.data?.detail || e?.message || "Delete failed");
    }
  };

  const copyJson = async (obj) => {
    try {
      await navigator.clipboard.writeText(prettyJson(obj));
      toast.success("Copied ✅");
    } catch {
      toast.error("Copy failed");
    }
  };

  const openImage = (url) => {
    if (!url) return;
    setActiveImg(url);
    setImgOpen(true);
  };

  if (loading) {
    return (
      <div style={{ padding: 16 }}>
        <button onClick={() => navigate(-1)}>← Back</button>
        <div style={{ marginTop: 12 }}>Loading...</div>
      </div>
    );
  }

  if (err) {
    return (
      <div style={{ padding: 16 }}>
        <button onClick={() => navigate(-1)}>← Back</button>
        <div style={{ marginTop: 12, color: "#a40000" }}>{err}</div>
      </div>
    );
  }

  return (
    <>
      <div className="page">
        {/* header */}
        <div className="top">
          <div className="leftTop">
            <div className="h1">
              {session?.title || `Safety Session #${id}`}
              <span className="metaBadges">
                <Badge tone={modeTone(session?.mode)}>{session?.mode || "-"}</Badge>
                <Badge tone={statusTone(session?.status)}>{session?.status || "-"}</Badge>
              </span>
            </div>

            <div className="sub">
              Scheduled: <b>{fmtDT(session?.scheduled_at)}</b> • Due: <b>{fmtDT(session?.due_at)}</b>
              {session?.location ? (
                <>
                  {" "}
                  • Location: <b>{session.location}</b>
                </>
              ) : null}
            </div>

            {/* ✅ KPIs */}
            <div className="kpis">
              <div className="kpi">
                <div className="kLabel">Assigned</div>
                <div className="kVal">{stats.assigned}</div>
              </div>
              <div className="kpi">
                <div className="kLabel">Viewed</div>
                <div className="kVal">{stats.viewed}</div>
              </div>
              <div className="kpi">
                <div className="kLabel">Completed</div>
                <div className="kVal">{stats.completed}</div>
              </div>
              <div className="kpi">
                <div className="kLabel">Present</div>
                <div className="kVal">{stats.present}</div>
              </div>
              <div className="kpi">
                <div className="kLabel">Absent</div>
                <div className="kVal">{stats.absent}</div>
              </div>
              {report?.quiz_meta ? (
                <>
                  <div className="kpi">
                    <div className="kLabel">Quiz Submitted</div>
                    <div className="kVal">{stats.quizSubmitted}</div>
                  </div>
                  <div className="kpi">
                    <div className="kLabel">Quiz Passed</div>
                    <div className="kVal">{stats.quizPassed}</div>
                  </div>
                  <div className="kpi">
                    <div className="kLabel">Quiz Failed</div>
                    <div className="kVal">{stats.quizFailed}</div>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          <div className="actions">
            <button className="btn" onClick={() => navigate("/safety/sessions")}>
              ← Back
            </button>

            <button className="btn" onClick={() => loadReport()} disabled={reportLoading}>
              {reportLoading ? "Refreshing..." : "Refresh Report"}
            </button>

            <button className="btn" onClick={() => setRawOpen(true)} disabled={!report}>
              View Raw Report JSON
            </button>

            {session?.status === "DRAFT" || session?.status === "ARCHIVED" ? (
              <button className="btn primary" onClick={onPublish}>
                {session?.status === "ARCHIVED" ? "Re-Publish" : "Publish"}
              </button>
            ) : null}

            {session?.status === "PUBLISHED" ? (
              <button className="btn warn" onClick={onUnpublish}>
                Unpublish
              </button>
            ) : null}

            <button className="btn danger" onClick={onDelete}>
              Delete
            </button>
          </div>
        </div>

        {/* main grid */}
        <div className="grid">
          {/* LEFT */}
          <div className="card">
            <div className="cardTop">
              <div className="cardTitle">Details</div>
            </div>

            <div className="pad">
              {session?.description ? <div className="desc">{session.description}</div> : null}

              <div className="row2">
                <div className="info">
                  <div className="iLabel">Mandatory</div>
                  <div className="iVal">{String(!!session?.is_mandatory)}</div>
                </div>
                <div className="info">
                  <div className="iLabel">Duration (mins)</div>
                  <div className="iVal">{session?.duration_minutes ?? "-"}</div>
                </div>
              </div>

              <div className="sectionTitle">Projects</div>
              {projects.length ? (
                <div className="chips">
                  {projects.map((p, idx) => (
                    <span key={p?.id || idx} className="chip">
                      {pickProjectLabel(p)} {p?.id ? `(#${p.id})` : ""}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="muted">No projects info in response.</div>
              )}

              <div className="sectionTitle">Acknowledgement Text</div>
              <div className="ackBox">
                {session?.acknowledgement_text || session?.ack_text || "—"}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="card">
            <div className="cardTop">
              <div className="rowBetween">
                <div className="cardTitle">Assets & Quiz</div>

                <button
                  className="btn"
                  onClick={async () => {
                    const next = !quizOpen;
                    setQuizOpen(next);
                    if (next && !quiz) await loadQuiz();
                  }}
                >
                  {quizOpen ? "Hide Quiz" : "Open Quiz"}
                </button>
              </div>
            </div>

            <div className="pad">
              <div className="sectionTitle">Assets</div>
              {assets.length === 0 ? (
                <div className="muted">No assets uploaded.</div>
              ) : (
                <div className="assetList">
                  {assets.map((a) => {
                    const url = pickAssetUrl(a);
                    const type = pickAssetType(a);
                    const title = a?.title || a?.name || url || "-";
                    return (
                      <div key={a?.id || title} className="assetItem">
                        <div className="assetMeta">
                          <div className="pill">{String(type || "ASSET")}</div>
                          <div className="assetText">
                            <div className="assetTitle">{title}</div>
                            {url ? (
                              <a className="link" href={url} target="_blank" rel="noreferrer">
                                Open
                              </a>
                            ) : (
                              <div className="muted">No URL</div>
                            )}
                          </div>
                        </div>

                        {url && isVideo(a) ? <video className="video" controls src={url} /> : null}
                        {url && isPpt(a) ? (
                          <div className="muted" style={{ marginTop: 6 }}>
                            PPT preview depends on browser; use “Open”.
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="sectionTitle">Session Photos</div>
              {photos.length === 0 ? (
                <div className="muted">No session photos.</div>
              ) : (
                <div className="photos">
                  {photos.map((p) => {
                    const url = pickPhotoUrl(p);
                    return url ? (
                      <img
                        key={p?.id || url}
                        src={url}
                        alt=""
                        className="photo"
                        onClick={() => openImage(url)}
                        title="Click to open"
                      />
                    ) : null;
                  })}
                </div>
              )}

              {quizOpen ? (
                <>
                  <div className="divider" />
                  <div className="sectionTitle">Quiz Preview</div>

                  {quizLoading ? (
                    <div className="muted">Loading quiz...</div>
                  ) : !quiz ? (
                    <div className="muted">No quiz available.</div>
                  ) : (
                    <>
                      <div className="muted" style={{ marginBottom: 10 }}>
                        Quiz ID: <b>{quiz?.id ?? "-"}</b> • Pass Mark: <b>{quiz?.pass_mark ?? "-"}</b>{" "}
                        • Attempt Limit: <b>{quiz?.attempt_limit ?? "-"}</b> • Questions:{" "}
                        <b>{questions.length}</b>
                      </div>

                      {questions.length === 0 ? (
                        <div className="muted">No questions found.</div>
                      ) : (
                        <div className="qList">
                          {questions.map((q, idx) => {
                            const opts = [...safeArr(q?.options)].sort(
                              (a, b) => Number(a?.order ?? 0) - Number(b?.order ?? 0)
                            );
                            return (
                              <div key={q?.id || idx} className="qCard">
                                <div className="qTop">
                                  <div className="qTitle">
                                    {idx + 1}. {pickQuestionText(q)}
                                  </div>
                                  <Badge
                                    tone={
                                      String(q?.question_type || "").toUpperCase() === "MULTI"
                                        ? "purple"
                                        : "blue"
                                    }
                                  >
                                    {q?.question_type || "-"}
                                  </Badge>
                                </div>
                                <div className="opts">
                                  {opts.map((o) => (
                                    <div key={o?.id} className="opt">
                                      <div className="dot" />
                                      <div className="optText">{pickOptionText(o)}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* ✅ REPORT (GROUP PHOTOS ON TOP + TOPICS DISCUSSED + USER NOTES) */}
        <div className="card" style={{ marginTop: 12 }}>
          <div className="cardTop">
            <div className="rowBetween">
              <div className="cardTitle">Report</div>

              <div className="rowActions">
                <input
                  className="search"
                  placeholder="Search user..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
                <button className="btn" onClick={() => copyJson(report)} disabled={!report}>
                  Copy Report JSON
                </button>
                <button className="btn" onClick={() => loadReport()} disabled={reportLoading}>
                  {reportLoading ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>
          </div>

          <div className="pad">
            {reportErr ? <div className="errorBox">{reportErr}</div> : null}

            {!API.getSafetySessionReport ? (
              <div className="muted">
                Missing API export: <b>getSafetySessionReport()</b> in api/index.js
              </div>
            ) : reportLoading ? (
              <div className="muted">Loading report...</div>
            ) : !report ? (
              <div className="muted">No report loaded.</div>
            ) : (
              <>
                {/* report meta */}
                <div className="metaGrid">
                  <div className="metaCard">
                    <div className="mLabel">Leader</div>
                    <div className="mVal">
                      {reportMeta?.leader
                        ? `${reportMeta.leader.first_name || ""} ${reportMeta.leader.last_name || ""} (${reportMeta.leader.username || "-"})`
                        : "-"}
                    </div>
                  </div>

                  <div className="metaCard">
                    <div className="mLabel">Report Submitted At</div>
                    <div className="mVal">{fmtDT(reportMeta?.report_submitted_at)}</div>
                  </div>

                  <div className="metaCard">
                    <div className="mLabel">Submitted By</div>
                    <div className="mVal">
                      {reportMeta?.report_submitted_by
                        ? `${reportMeta.report_submitted_by.first_name || ""} ${reportMeta.report_submitted_by.last_name || ""} (${reportMeta.report_submitted_by.username || "-"})`
                        : "-"}
                    </div>
                  </div>

                  <div className="metaCard">
                    <div className="mLabel">Leader Locked</div>
                    <div className="mVal">
                      {reportMeta?.leader_locked ? (
                        <Badge tone="green">LOCKED</Badge>
                      ) : (
                        <Badge tone="orange">OPEN</Badge>
                      )}
                    </div>
                  </div>

                  {/* ✅ NEW: show leader "topics discussed" preview in meta grid */}
                  <div className="metaCard" style={{ gridColumn: "span 4" }}>
                    <div className="mLabel">Topics Discussed (Leader Note)</div>
                    <div className="mVal" style={{ fontWeight: 700 }}>
                      {topicsPreview ? topicsPreview : <span className="muted">No topics added.</span>}
                    </div>
                  </div>
                </div>

                {/* ✅ NEW: full Topics Discussed box */}
                <div className="sectionTitle" style={{ marginTop: 14 }}>
                  Topics Discussed
                </div>
                <div className="topicBox">
                  {topicsDiscussed ? (
                    topicsDiscussed
                  ) : (
                    <span className="muted">Leader has not added topics yet.</span>
                  )}
                </div>

                {/* ✅ Group photos ON TOP */}
                <div className="sectionTitle" style={{ marginTop: 14 }}>
                  Group Photos
                </div>
                {groupPhotos.length === 0 ? (
                  <div className="muted">No group photos uploaded.</div>
                ) : (
                  <div className="photos">
                    {groupPhotos.map((p) => {
                      const url = pickPhotoUrl(p);
                      return url ? (
                        <div key={p?.id || url} className="photoWrap">
                          <img
                            src={url}
                            alt=""
                            className="photoBig"
                            onClick={() => openImage(url)}
                            title="Click to open"
                          />
                          <div className="photoCap">
                            <span className="muted">
                              Uploaded: <b>{fmtDT(p?.uploaded_at)}</b>
                            </span>
                            {p?.uploaded_by ? (
                              <span className="muted">
                                {" "}
                                • By:{" "}
                                <b>
                                  {p.uploaded_by.first_name || ""} {p.uploaded_by.last_name || ""} (
                                  {p.uploaded_by.username || "-"})
                                </b>
                              </span>
                            ) : null}
                            {p?.caption ? (
                              <div className="muted" style={{ marginTop: 4 }}>
                                Caption: <b>{p.caption}</b>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}

                {/* Users */}
                <div className="sectionTitle" style={{ marginTop: 14 }}>
                  Users ({reportUsers.length})
                </div>

                {reportUsers.length === 0 ? (
                  <div className="muted">No users match your search.</div>
                ) : (
                  <div className="userCards">
                    {reportUsers.map((row, idx) => {
                      const u = row?.user || {};
                      const att = row?.attendance || null;
                      const q = row?.quiz || null;
                      const partPhotos = safeArr(row?.participant_photos);

                      const attStatus = att?.status || "UNKNOWN";
                      const attTone =
                        String(attStatus).toUpperCase() === "PRESENT"
                          ? "green"
                          : String(attStatus).toUpperCase() === "ABSENT"
                          ? "red"
                          : "gray";

                      return (
                        <div key={u?.id || idx} className="uCard">
                          <div className="uTop">
                            <div className="uNameBlock">
                              <div className="uName">
                                {u?.first_name || ""} {u?.last_name || ""}{" "}
                                <span className="muted">({u?.username || "-"})</span>
                              </div>
                              <div className="muted" style={{ fontSize: 12 }}>
                                User ID: <b>{u?.id ?? "-"}</b>
                              </div>
                            </div>

                            <div className="uBadges">
                              <Badge tone={row?.viewed_at ? "blue" : "gray"}>
                                Viewed: {row?.viewed_at ? "YES" : "NO"}
                              </Badge>
                              <Badge tone={row?.completed_at ? "purple" : "gray"}>
                                Completed: {row?.completed_at ? "YES" : "NO"}
                              </Badge>
                              <Badge tone={attTone}>Attendance: {attStatus}</Badge>
                              {/* ✅ quick note badge if present */}
                              {att?.note ? (
                                <Badge tone="orange" title={att.note}>
                                  Note: YES
                                </Badge>
                              ) : null}
                            </div>
                          </div>

                          <div className="uGrid">
                            <div className="uInfo">
                              <div className="infoRow">
                                <span className="muted">Viewed At:</span>{" "}
                                <b>{fmtDT(row?.viewed_at)}</b>
                              </div>
                              <div className="infoRow">
                                <span className="muted">Completed At:</span>{" "}
                                <b>{fmtDT(row?.completed_at)}</b>
                              </div>

                              <div className="divider2" />

                              <div className="infoRow">
                                <span className="muted">Attendance Marked At:</span>{" "}
                                <b>{fmtDT(att?.marked_at)}</b>
                              </div>

                              {/* ✅ THIS IS THE NOTE you want to show (leader entered) */}
                              <div className="infoRow">
                                <span className="muted">Note:</span>{" "}
                                <b>{att?.note || "-"}</b>
                              </div>

                              <div className="infoRow">
                                <span className="muted">Marked By:</span>{" "}
                                <b>
                                  {att?.marked_by
                                    ? `${att.marked_by.first_name || ""} ${att.marked_by.last_name || ""} (${att.marked_by.username || "-"})`
                                    : "-"}
                                </b>
                              </div>

                              {q ? (
                                <>
                                  <div className="divider2" />
                                  <div className="infoRow">
                                    <span className="muted">Quiz Attempt:</span>{" "}
                                    <b>#{q?.attempt_no ?? "-"}</b>
                                  </div>
                                  <div className="infoRow">
                                    <span className="muted">Score:</span>{" "}
                                    <b>
                                      {q?.score ?? "-"} / {q?.max_score ?? "-"}
                                    </b>
                                  </div>
                                  <div className="infoRow">
                                    <span className="muted">Percentage:</span>{" "}
                                    <b>{q?.percentage ?? "-"}%</b>
                                  </div>
                                  <div className="infoRow">
                                    <span className="muted">Passed:</span>{" "}
                                    <b>{q?.passed ? "YES" : "NO"}</b>
                                  </div>
                                  <div className="infoRow">
                                    <span className="muted">Submitted:</span>{" "}
                                    <b>{fmtDT(q?.submitted_at)}</b>
                                  </div>
                                </>
                              ) : null}
                            </div>

                            {/* ✅ participant photos for THIS user */}
                            <div className="uPhotos">
                              <div className="uPhotosTitle">Participant Photos</div>
                              {partPhotos.length === 0 ? (
                                <div className="muted">No participant photos.</div>
                              ) : (
                                <div className="thumbs">
                                  {partPhotos.map((p) => {
                                    const url = pickPhotoUrl(p);
                                    return url ? (
                                      <div key={p?.id || url} className="thumbWrap">
                                        <img
                                          src={url}
                                          alt=""
                                          className="thumb"
                                          onClick={() => openImage(url)}
                                          title="Click to open"
                                        />
                                        <div className="thumbMeta">
                                          <div className="muted" style={{ fontSize: 12 }}>
                                            {fmtDT(p?.uploaded_at)}
                                          </div>
                                          {p?.caption ? (
                                            <div className="muted" style={{ fontSize: 12 }}>
                                              {p.caption}
                                            </div>
                                          ) : null}
                                        </div>
                                      </div>
                                    ) : null;
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* RAW REPORT JSON MODAL */}
      {rawOpen ? (
        <div className="modalOverlay" onMouseDown={() => setRawOpen(false)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modalTop">
              <div className="modalTitle">Raw Report JSON</div>
              <div className="rowActions">
                <button className="btn" onClick={() => copyJson(report)} disabled={!report}>
                  Copy
                </button>
                <button className="btn" onClick={() => setRawOpen(false)}>
                  Close
                </button>
              </div>
            </div>

            <pre className="preBox">{prettyJson(report)}</pre>
          </div>
        </div>
      ) : null}

      {/* USER ROW JSON MODAL */}
      {rowOpen ? (
        <div className="modalOverlay" onMouseDown={() => setRowOpen(false)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modalTop">
              <div className="modalTitle">
                User Detail JSON {activeRow?.user?.id ? `(#${activeRow.user.id})` : ""}
              </div>
              <div className="rowActions">
                <button className="btn" onClick={() => copyJson(activeRow)} disabled={!activeRow}>
                  Copy
                </button>
                <button className="btn" onClick={() => setRowOpen(false)}>
                  Close
                </button>
              </div>
            </div>

            <pre className="preBox">{prettyJson(activeRow)}</pre>
          </div>
        </div>
      ) : null}

      {/* IMAGE LIGHTBOX */}
      {imgOpen ? (
        <div className="modalOverlay" onMouseDown={() => setImgOpen(false)}>
          <div className="imgModal" onMouseDown={(e) => e.stopPropagation()}>
            <button className="btn" onClick={() => setImgOpen(false)} style={{ alignSelf: "flex-end" }}>
              Close
            </button>
            <img src={activeImg} alt="" className="imgFull" />
          </div>
        </div>
      ) : null}

      <style>{`
        .page{ padding: 16px; }
        .top{ display:flex; justify-content:space-between; align-items:flex-start; gap: 12px; margin-bottom: 12px; }
        .leftTop{ min-width: 0; }
        .h1{ font-size: 20px; font-weight: 900; display:flex; gap: 10px; align-items:center; flex-wrap: wrap; }
        .metaBadges{ display:flex; gap: 8px; align-items:center; }
        .sub{ margin-top: 6px; font-size: 13px; color:#666; }

        .actions{ display:flex; gap: 10px; flex-wrap: wrap; align-items:center; }

        .kpis{ display:flex; gap: 10px; margin-top: 10px; flex-wrap: wrap; }
        .kpi{ border:1px solid #eee; border-radius: 14px; padding: 10px 12px; background:#fff; min-width: 130px; }
        .kLabel{ font-size: 12px; color:#666; }
        .kVal{ font-size: 16px; font-weight: 900; margin-top: 2px; }

        .grid{ display:grid; grid-template-columns: 1.2fr 1fr; gap: 12px; }
        @media (max-width: 1100px){ .grid{ grid-template-columns: 1fr; } }

        .card{ background:#fff; border:1px solid #eee; border-radius: 14px; overflow:hidden; }
        .cardTop{ padding: 12px; border-bottom: 1px solid #eee; background: #fafafa; }
        .cardTitle{ font-weight: 900; }
        .pad{ padding: 12px; }

        .btn{ border:1px solid #ddd; background:#fff; padding: 9px 12px; border-radius: 12px; cursor:pointer; font-size: 13px; }
        .btn.primary{ border-color:#0f62fe; background:#0f62fe; color:#fff; font-weight: 900; }
        .btn.warn{ border-color:#ff9f1a; background:#ff9f1a; color:#111; font-weight: 900; }
        .btn.danger{ border-color:#ff4d4f; background:#ff4d4f; color:#fff; font-weight: 900; }
        .btn.small{ padding: 7px 10px; border-radius: 10px; font-size: 12px; }
        .btn:disabled{ opacity:.55; cursor:not-allowed; }

        .badge{ display:inline-block; padding: 6px 10px; border-radius: 999px; font-size: 12px; border: 1px solid #ddd; background:#fff; }
        .b-green{ border-color:#1d7f2a; background:#ecfff0; color:#1d7f2a; }
        .b-orange{ border-color:#ff9f1a; background:#fff6e8; color:#9a5a00; }
        .b-gray{ border-color:#999; background:#f6f6f6; color:#333; }
        .b-blue{ border-color:#2f6fed; background:#eef4ff; color:#2f6fed; }
        .b-purple{ border-color:#7a3ef2; background:#f3edff; color:#7a3ef2; }
        .b-red{ border-color:#ff4d4f; background:#fff1f1; color:#b90000; }

        .desc{ color:#222; margin-bottom: 12px; white-space: pre-wrap; }
        .muted{ color:#666; font-size: 13px; }

        .row2{ display:grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 8px; }
        @media (max-width: 740px){ .row2{ grid-template-columns: 1fr; } }

        .info{ border:1px solid #eee; border-radius: 14px; padding: 10px 12px; background:#fff; }
        .iLabel{ font-size: 12px; color:#666; }
        .iVal{ font-weight: 900; margin-top: 2px; }

        .sectionTitle{ margin-top: 12px; margin-bottom: 8px; font-weight: 900; }

        .chips{ display:flex; gap: 8px; flex-wrap: wrap; }
        .chip{ border:1px solid #eee; border-radius: 999px; padding: 8px 10px; font-size: 12px; background:#fffdf7; }

        .ackBox{ border:1px dashed #eee; border-radius: 14px; padding: 10px 12px; background:#fff; white-space: pre-wrap; color:#333; }

        /* ✅ topics box (leader note) */
        .topicBox{
          border: 1px dashed #e9d5ff;
          background: #fbf7ff;
          border-radius: 14px;
          padding: 10px 12px;
          white-space: pre-wrap;
          color: #222;
        }

        .assetList{ display:flex; flex-direction:column; gap: 10px; }
        .assetItem{ border:1px solid #eee; border-radius: 14px; padding: 10px; }
        .assetMeta{ display:flex; gap: 10px; align-items:flex-start; }
        .assetText{ min-width: 0; }
        .assetTitle{ font-weight: 900; }
        .pill{ border:1px solid #ddd; border-radius: 999px; padding: 6px 10px; font-size: 12px; background:#fff; }
        .link{ display:inline-block; margin-top: 4px; font-size: 13px; }
        .video{ width: 100%; margin-top: 10px; border-radius: 12px; border:1px solid #eee; }

        .photos{ display:flex; gap: 12px; flex-wrap: wrap; }
        .photo{ width: 140px; height: 100px; object-fit: cover; border-radius: 12px; border: 1px solid #eee; cursor: pointer; }
        .photoWrap{ display:flex; flex-direction: column; gap: 6px; }
        .photoBig{ width: 240px; height: 160px; object-fit: cover; border-radius: 14px; border: 1px solid #eee; cursor: pointer; }
        .photoCap{ font-size: 12px; color:#666; }

        .divider{ height: 1px; background:#eee; margin: 12px 0; }
        .divider2{ height: 1px; background:#eee; margin: 10px 0; }

        .qList{ display:flex; flex-direction:column; gap: 10px; }
        .qCard{ border:1px solid #eee; border-radius: 14px; padding: 10px; }
        .qTop{ display:flex; justify-content:space-between; align-items:flex-start; gap: 10px; }
        .qTitle{ font-weight: 900; }
        .opts{ margin-top: 10px; display:flex; flex-direction:column; gap: 8px; }
        .opt{ display:flex; gap: 10px; align-items:flex-start; border:1px solid #eee; border-radius: 12px; padding: 8px 10px; background:#fff; }
        .dot{ width: 8px; height: 8px; border-radius: 999px; background:#111; margin-top: 6px; flex: 0 0 auto; }
        .optText{ font-size: 13px; color:#222; }

        .rowBetween{ display:flex; justify-content:space-between; align-items:center; gap: 10px; flex-wrap: wrap; }
        .rowActions{ display:flex; gap: 8px; flex-wrap: wrap; align-items:center; }

        .search{
          border: 1px solid #ddd;
          border-radius: 12px;
          padding: 9px 12px;
          outline: none;
          min-width: 240px;
        }

        .errorBox{
          padding: 10px 12px;
          border: 1px solid #ffd5d5;
          background: #fff3f3;
          color: #a40000;
          border-radius: 12px;
        }

        .metaGrid{
          display:grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
        }
        @media (max-width: 980px){ .metaGrid{ grid-template-columns: 1fr 1fr; } }
        @media (max-width: 520px){ .metaGrid{ grid-template-columns: 1fr; } }

        .metaCard{
          border: 1px solid #eee;
          border-radius: 14px;
          padding: 10px 12px;
          background: #fff;
        }
        .mLabel{ font-size: 12px; color:#666; }
        .mVal{ font-weight: 900; margin-top: 2px; }

        .userCards{ display:flex; flex-direction: column; gap: 10px; }
        .uCard{
          border: 1px solid #eee;
          border-radius: 16px;
          padding: 12px;
          background: #fff;
        }
        .uTop{
          display:flex;
          justify-content: space-between;
          align-items:flex-start;
          gap: 10px;
          flex-wrap: wrap;
        }
        .uName{ font-weight: 900; }
        .uBadges{ display:flex; gap: 8px; flex-wrap: wrap; align-items:center; }

        .uGrid{
          margin-top: 10px;
          display:grid;
          grid-template-columns: 1.2fr .8fr;
          gap: 12px;
          align-items: start;
        }
        @media (max-width: 980px){ .uGrid{ grid-template-columns: 1fr; } }

        .uInfo{
          border: 1px solid #f1f1f1;
          border-radius: 14px;
          padding: 10px 12px;
          background: #fafafa;
        }
        .infoRow{ font-size: 13px; color:#222; margin-top: 6px; }
        .infoRow b{ color:#111; }

        .uPhotos{
          border: 1px solid #f1f1f1;
          border-radius: 14px;
          padding: 10px 12px;
          background: #fafafa;
        }
        .uPhotosTitle{ font-weight: 900; margin-bottom: 8px; }
        .thumbs{ display:flex; gap: 10px; flex-wrap: wrap; }
        .thumbWrap{ display:flex; flex-direction: column; gap: 6px; }
        .thumb{
          width: 130px; height: 90px;
          object-fit: cover;
          border-radius: 12px;
          border: 1px solid #eee;
          cursor: pointer;
          background: #fff;
        }
        .thumbMeta{ line-height: 1; }

        /* modal */
        .modalOverlay{
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,.35);
          display:flex;
          align-items:center;
          justify-content:center;
          padding: 16px;
          z-index: 9999;
        }
        .modal{
          width: min(920px, 100%);
          background:#fff;
          border-radius: 16px;
          border: 1px solid #eee;
          padding: 14px;
          box-shadow: 0 12px 40px rgba(0,0,0,.2);
        }
        .modalTop{
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .modalTitle{ font-weight: 900; font-size: 16px; }

        .preBox{
          margin-top: 12px;
          border: 1px solid #eee;
          border-radius: 14px;
          padding: 12px;
          max-height: 65vh;
          overflow:auto;
          background: #fafafa;
          font-size: 12px;
          line-height: 1.5;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .imgModal{
          width: min(980px, 100%);
          background: rgba(255,255,255,.96);
          border: 1px solid rgba(255,255,255,.35);
          border-radius: 18px;
          padding: 12px;
          display:flex;
          flex-direction: column;
          gap: 10px;
          box-shadow: 0 12px 40px rgba(0,0,0,.25);
        }
        .imgFull{
          width: 100%;
          max-height: 78vh;
          object-fit: contain;
          border-radius: 14px;
          background: #fff;
          border: 1px solid #eee;
        }
      `}</style>
    </>
  );
}

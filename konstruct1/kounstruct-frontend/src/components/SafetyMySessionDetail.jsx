// SafetyMySessionDetail.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import * as API from "../api/index";

const ORANGE = "#ffbe63";
const BLUE = "#0f62fe";

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

const pickAssetUrl = (a) => a?.url || a?.file_url || a?.file || a?.asset_url || a?.path || "";
const pickAssetType = (a) => a?.asset_type || a?.type || a?.kind || "";
const isVideo = (a) => String(pickAssetType(a)).toUpperCase() === "VIDEO";
const isPpt = (a) => String(pickAssetType(a)).toUpperCase() === "PPT";

/* ===================== QUIZ HELPERS ===================== */

const toInt = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};

const extractIdFromUrlOrString = (v) => {
  if (!v) return null;
  if (typeof v === "number") return toInt(v);
  const s = String(v);
  const m = s.match(/(\d+)(?!.*\d)/); // last number
  return m ? toInt(m[1]) : null;
};

const extractSubmissionId = (data) => {
  if (!data) return null;

  const direct = extractIdFromUrlOrString(data);
  if (direct) return direct;

  if (typeof data !== "object") return null;

  const directKeys = [
    "id",
    "submission_id",
    "submissionId",
    "quiz_submission_id",
    "quizSubmissionId",
    "attempt_id",
    "attemptId",
    "pk",
  ];

  for (const k of directKeys) {
    const val = data?.[k];
    const got = extractIdFromUrlOrString(val);
    if (got) return got;

    if (val && typeof val === "object") {
      const nested = extractSubmissionId(val);
      if (nested) return nested;
    }
  }

  const nestedKeys = ["submission", "quiz_submission", "result", "data", "payload"];
  for (const k of nestedKeys) {
    const nested = extractSubmissionId(data?.[k]);
    if (nested) return nested;
  }

  return null;
};

const extractIdFromLocationHeader = (headers) => {
  const loc = headers?.location || headers?.Location;
  return extractIdFromUrlOrString(loc);
};

const pickQuestionText = (q) => q?.question_text || q?.text || q?.title || q?.question || "Question";

const pickOptionText = (o) =>
  o?.option_text || o?.text || o?.title || o?.name || `Option #${o?.id ?? "-"}`;

const isMultiQuestion = (q) => {
  const t = String(q?.question_type || q?.type || "").toUpperCase();
  return t === "MULTI" || t.includes("MULTI");
};

/* ===================== STEPPER ===================== */

const Stepper = ({ steps, activeIndex, onStep }) => {
  return (
    <div className="stepper">
      {steps.map((s, idx) => {
        const isActive = idx === activeIndex;
        const isDone = !!s.done;

        return (
          <button
            key={s.key}
            type="button"
            className={`step ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}
            onClick={() => onStep(idx)}
          >
            <div className="stepCircle">{isDone ? "✓" : idx + 1}</div>
            <div className="stepText">
              <div className="stepLabel">{s.label}</div>
              {s.sub ? <div className="stepSub">{s.sub}</div> : null}
            </div>

            {idx !== steps.length - 1 ? <div className="stepLine" /> : null}
          </button>
        );
      })}
    </div>
  );
};

export default function SafetyMySessionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [session, setSession] = useState(null);

  // Wizard step
  const [step, setStep] = useState(0);

  // acknowledgement
  const [ackChecked, setAckChecked] = useState(false);
  const [ackText, setAckText] = useState("I confirm I have understood the safety training/session.");

  // quiz
  const [quizLoading, setQuizLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);

  const [attemptId, setAttemptId] = useState(null);
  const [answersMap, setAnswersMap] = useState({}); // {questionId: [optionIds]}
  const [submitting, setSubmitting] = useState(false);

  // ✅ submit response (result)
  const [result, setResult] = useState(null);

  // clean quiz UX: one question at a time
  const [quizIndex, setQuizIndex] = useState(0);

  // ✅ IN_PERSON leader roster + attendance
  const autoJumpRef = useRef(false);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [rosterErr, setRosterErr] = useState("");
  const [roster, setRoster] = useState(null);
  const [attDraft, setAttDraft] = useState({}); // { userId: {status, note} }
  const [attSaving, setAttSaving] = useState(false);
  const [submittingReport, setSubmittingReport] = useState(false);
  const [rosterSearch, setRosterSearch] = useState("");

  // ✅ Leader Photos Upload
  const [groupFile, setGroupFile] = useState(null);
  const [groupCaption, setGroupCaption] = useState("");
  const [groupUploading, setGroupUploading] = useState(false);

  const [userPhotoDraft, setUserPhotoDraft] = useState({});
  // { [userId]: { file: File|null, caption: string, uploading: boolean } }

  // ✅ Leader Topics
  const [topicsDraft, setTopicsDraft] = useState("");
  const [topicsSaving, setTopicsSaving] = useState(false);

  const pickPhotoUrl = (p) => p?.image_url || p?.image || p?.url || "";

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErr("");

        const res = await API.getSafetySessionById(id);
        const data = res?.data || null;

        if (!alive) return;
        setSession(data);

        if (data?.acknowledgement_text) setAckText(String(data.acknowledgement_text));
        if (typeof data?.topics_discussed !== "undefined") {
          setTopicsDraft(String(data.topics_discussed || ""));
        }

        // ✅ If IN_PERSON leader => auto open Attendance step (only once)
        if (
          !autoJumpRef.current &&
          String(data?.mode || "").toUpperCase() === "IN_PERSON" &&
          !!data?.is_leader
        ) {
          autoJumpRef.current = true;
          setStep(1); // after rerender, leader steps will be: overview(0), attendance(1), ack(2), quiz(3)
        }
      } catch (e) {
        if (!alive) return;
        setSession(null);
        setErr(e?.response?.data?.detail || e?.message || "Failed to load session");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [id]);

  const assets = safeArr(session?.assets);
  const photos = safeArr(session?.photos);

  const isInPerson = String(session?.mode || "").toUpperCase() === "IN_PERSON";
  const isLeader = !!session?.is_leader;
  const leaderLocked = !!session?.leader_locked;
  const showAttendance = isInPerson && isLeader; // ✅ only leader sees roster/attendance

  const questions = useMemo(() => {
    const qs = safeArr(quiz?.questions || quiz?.items || quiz?.results);
    return [...qs].sort((a, b) => Number(a?.order ?? 0) - Number(b?.order ?? 0));
  }, [quiz]);

  const currentQ = questions[quizIndex] || null;

  const answeredCount = useMemo(() => {
    return questions.filter((q) => safeArr(answersMap?.[q.id]).length > 0).length;
  }, [questions, answersMap]);

  const isSubmitted = String(result?.status || "").toUpperCase() === "SUBMITTED";

  const getSelectedLabels = (q) => {
    const selectedIds = safeArr(answersMap?.[q.id]).map(Number);
    const opts = safeArr(q?.options);
    if (!selectedIds.length) return [];
    return selectedIds.map((sid) => {
      const found = opts.find((o) => Number(o?.id) === Number(sid));
      return found ? pickOptionText(found) : `Option #${sid}`;
    });
  };

  const markViewed = async () => {
    try {
      await API.markSafetySessionViewed(id, {});
      toast.success("Marked as viewed ✅");
    } catch (e) {
      toast.error(e?.response?.data?.detail || e?.message || "Failed");
    }
  };

  const markComplete = async () => {
    if (!ackChecked) return toast.error("Please tick acknowledgement checkbox");
    try {
      await API.markSafetySessionViewed(id, {
        complete: true,
        acknowledged: true,
        acknowledgement_text: ackText,
      });
      toast.success("Completed ✅");
    } catch (e) {
      toast.error(e?.response?.data?.detail || e?.message || "Failed");
    }
  };

  const loadQuiz = async () => {
    if (!API.getSafetySessionQuiz) return toast.error("Quiz API missing");
    setQuizLoading(true);
    try {
      const res = await API.getSafetySessionQuiz(id);
      const q = res?.data || null;
      setQuiz(q);

      // reset attempt/answers when loading fresh quiz
      setAttemptId(null);
      setAnswersMap({});
      setQuizIndex(0);
      setResult(null);
    } catch (e) {
      toast.error(e?.response?.data?.detail || e?.message || "Failed to load quiz");
    } finally {
      setQuizLoading(false);
    }
  };

  const startAttempt = async () => {
    if (!API.startSafetyQuizAttempt) return toast.error("Quiz start API missing");

    try {
      const res = await API.startSafetyQuizAttempt(id);
      const sid = extractSubmissionId(res?.data) || extractIdFromLocationHeader(res?.headers);

      console.log("✅ quiz_start raw:", res?.data, "headers:", res?.headers);

      if (!sid) {
        toast.error("Attempt created but submission id missing (check console)");
        return;
      }

      setAttemptId(sid);
      setAnswersMap({});
      setQuizIndex(0);
      setResult(null);
      toast.success("Quiz started ✅");
    } catch (e) {
      const sid = extractSubmissionId(e?.response?.data) || null;
      if (sid) {
        setAttemptId(sid);
        setAnswersMap({});
        setQuizIndex(0);
        setResult(null);
        toast.success("Quiz started ✅");
        return;
      }

      console.log("❌ quiz_start error:", e?.response?.data || e);
      toast.error(
        e?.response?.data?.detail ||
          (e?.response?.data && JSON.stringify(e.response.data)) ||
          e?.message ||
          "Failed to start quiz"
      );
    }
  };

  const toggleOption = (questionId, optionId, multi = false) => {
    setAnswersMap((prev) => {
      const cur = safeArr(prev?.[questionId]).map(Number);
      const oid = Number(optionId);

      if (!multi) return { ...prev, [questionId]: [oid] };

      const next = cur.includes(oid) ? cur.filter((x) => x !== oid) : [...cur, oid];
      return { ...prev, [questionId]: next };
    });
  };

  const submitQuiz = async () => {
    if (!attemptId) return toast.error("Start quiz first");
    if (!API.submitSafetyQuiz) return toast.error("Submit API missing");
    if (isSubmitted) return toast.error("Already submitted");

    const missing = questions
      .map((q, i) => ({ q, i }))
      .filter(({ q }) => safeArr(answersMap?.[q.id]).length === 0);

    if (missing.length) {
      return toast.error(`Please answer all questions. Missing: ${missing.map((x) => x.i + 1).join(", ")}`);
    }

    setSubmitting(true);
    try {
      const answersV1 = questions.map((q) => ({
        question_id: q.id,
        selected_option_ids: safeArr(answersMap?.[q.id]).map(Number),
      }));

      const answersV2 = questions.map((q) => {
        const selected = safeArr(answersMap?.[q.id]).map(Number);
        const multi = isMultiQuestion(q);
        if (multi) return { question_id: q.id, selected_option_ids: selected };
        return { question_id: q.id, selected_option_id: selected[0] };
      });

      const answersV3 = questions.map((q) => ({
        question_id: q.id,
        option_ids: safeArr(answersMap?.[q.id]).map(Number),
      }));

      const payloadTries = [
        { answers: answersV1 },
        { answers: answersV2 },
        { answers: answersV3 },
        { items: answersV1 },
        { responses: answersV1 },
      ];

      let lastErr = null;
      for (const payload of payloadTries) {
        try {
          const res = await API.submitSafetyQuiz(attemptId, payload);
          console.log("✅ quiz submit response:", res?.data);

          setResult(res?.data || null);
          toast.success("Quiz submitted ✅");
          setSubmitting(false);
          return;
        } catch (e) {
          lastErr = e;
        }
      }

      throw lastErr;
    } catch (e) {
      console.log("❌ quiz submit error:", e?.response?.data || e);
      toast.error(
        e?.response?.data?.detail ||
          (e?.response?.data && JSON.stringify(e.response.data)) ||
          e?.message ||
          "Submit failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ===================== LEADER ROSTER/ATTENDANCE ===================== */

  const loadRoster = async () => {
    if (!showAttendance) return;
    if (!API.getSafetySessionInPersonRoster) return toast.error("Roster API missing");

    setRosterLoading(true);
    setRosterErr("");
    try {
      const res = await API.getSafetySessionInPersonRoster(id);
      const data = res?.data || null;
      setRoster(data);

      if (typeof data?.topics_discussed !== "undefined") {
        setTopicsDraft(String(data.topics_discussed || ""));
      }

      const map = {};
      safeArr(data?.users).forEach((row) => {
        const uid = row?.user?.id;
        if (!uid) return;
        map[uid] = {
          status: row?.attendance?.status || "UNKNOWN",
          note: row?.attendance?.note || "",
        };
      });
      setAttDraft(map);
    } catch (e) {
      setRoster(null);
      setRosterErr(e?.response?.data?.detail || e?.message || "Failed to load roster");
    } finally {
      setRosterLoading(false);
    }
  };

  const saveAttendance = async () => {
    if (!showAttendance) return;
    if (leaderLocked) return toast.error("Report already submitted. Attendance locked.");
    if (!API.leaderMarkSafetySessionAttendance) return toast.error("Attendance API missing");

    const users = safeArr(roster?.users);
    const items = users
      .map((r) => {
        const uid = r?.user?.id;
        if (!uid) return null;
        const d = attDraft?.[uid] || {};
        return {
          user_id: uid,
          status: String(d.status || "UNKNOWN"),
          note: String(d.note || ""),
        };
      })
      .filter(Boolean);

    setAttSaving(true);
    try {
      // ✅ backend expects { items: [...] }
      await API.leaderMarkSafetySessionAttendance(id, { items });
      toast.success("Attendance saved ✅");
      await loadRoster();
    } catch (e) {
      toast.error(e?.response?.data?.detail || e?.message || "Save failed");
    } finally {
      setAttSaving(false);
    }
  };

  const saveTopics = async () => {
    if (!showAttendance) return;
    if (leaderLocked) return toast.error("Report already submitted. Topics locked.");
    if (!API.leaderUpdateSafetySessionTopics) return toast.error("Topics API missing");

    setTopicsSaving(true);
    try {
      await API.leaderUpdateSafetySessionTopics(id, topicsDraft);
      toast.success("Topics saved ✅");
      await loadRoster();
    } catch (e) {
      toast.error(e?.response?.data?.detail || e?.message || "Failed to save topics");
    } finally {
      setTopicsSaving(false);
    }
  };

  const submitLeaderReport = async () => {
    if (!showAttendance) return;
    if (leaderLocked) return toast.error("Already submitted");
    if (!API.leaderSubmitSafetySessionReport) return toast.error("Submit report API missing");

    setSubmittingReport(true);
    try {
      // ✅ save topics (best effort) before submitting report
      if (API.leaderUpdateSafetySessionTopics && topicsDraft?.trim()) {
        try {
          await API.leaderUpdateSafetySessionTopics(id, topicsDraft);
        } catch {
          // ignore, do not block report submit
        }
      }

      await API.leaderSubmitSafetySessionReport(id);
      toast.success("Report submitted ✅");

      // refresh session flags + roster UI
      const res = await API.getSafetySessionById(id);
      setSession(res?.data || null);
      await loadRoster();
    } catch (e) {
      toast.error(e?.response?.data?.detail || e?.message || "Submit failed");
    } finally {
      setSubmittingReport(false);
    }
  };

  /* ===================== LEADER PHOTOS (GROUP + PARTICIPANT) ===================== */

  const uploadLeaderPhoto = async ({ file, caption, participant_user_id }) => {
    if (!file) return toast.error("Please select photo file");
    if (leaderLocked) return toast.error("Report already submitted. Upload locked.");
    if (!API.leaderUploadSafetySessionPhoto) return toast.error("Leader photo upload API missing");

    const fd = new FormData();
    fd.append("image", file);
    if (caption) fd.append("caption", caption);
    if (participant_user_id) fd.append("participant_user_id", String(participant_user_id));

    await API.leaderUploadSafetySessionPhoto(id, fd);
    toast.success("Photo uploaded ✅");
    await loadRoster(); // refresh group + participant photos
  };

  const uploadGroupPhoto = async () => {
    if (!groupFile) return toast.error("Please select a group photo");
    try {
      setGroupUploading(true);
      await uploadLeaderPhoto({ file: groupFile, caption: groupCaption });
      setGroupFile(null);
      setGroupCaption("");
    } catch (e) {
      toast.error(e?.response?.data?.detail || e?.message || "Upload failed");
    } finally {
      setGroupUploading(false);
    }
  };

  const uploadUserPhoto = async (uid) => {
    const d = userPhotoDraft?.[uid] || {};
    if (!d.file) return toast.error("Select user photo first");

    try {
      setUserPhotoDraft((p) => ({
        ...p,
        [uid]: { ...(p[uid] || {}), uploading: true },
      }));

      await uploadLeaderPhoto({
        file: d.file,
        caption: d.caption || "",
        participant_user_id: uid,
      });

      setUserPhotoDraft((p) => ({
        ...p,
        [uid]: { file: null, caption: "", uploading: false },
      }));
    } catch (e) {
      setUserPhotoDraft((p) => ({
        ...p,
        [uid]: { ...(p[uid] || {}), uploading: false },
      }));
      toast.error(e?.response?.data?.detail || e?.message || "Upload failed");
    }
  };

  /* ===================== STEPS (dynamic) ===================== */

  const steps = useMemo(() => {
    const quizDone = questions.length > 0 && answeredCount === questions.length && !!attemptId;

    const arr = [
      {
        key: "overview",
        label: "Overview",
        sub: assets.length ? `${assets.length} asset(s)` : "Read content",
      },
    ];

    if (showAttendance) {
      arr.push({
        key: "attendance",
        label: "Attendance",
        sub: leaderLocked ? "Submitted (locked)" : "Mark attendance",
      });
    }

    arr.push(
      {
        key: "ack",
        label: "Acknowledge",
        sub: ackChecked ? "Ready" : "Pending",
      },
      {
        key: "quiz",
        label: "Quiz",
        sub: quiz ? `${answeredCount}/${questions.length} answered` : "Load quiz",
      }
    );

    // done flags
    return arr.map((s, idx) => ({
      ...s,
      done:
        s.key === "overview"
          ? step > idx
          : s.key === "attendance"
          ? leaderLocked
          : s.key === "ack"
          ? ackChecked
          : s.key === "quiz"
          ? quizDone
          : false,
    }));
  }, [step, assets.length, showAttendance, leaderLocked, ackChecked, quiz, answeredCount, questions.length, attemptId]);

  // keep step within range if steps change
  useEffect(() => {
    setStep((s) => Math.min(s, Math.max(0, steps.length - 1)));
  }, [steps.length]);

  const activeStepKey = steps?.[step]?.key || "overview";

  // auto-load quiz when entering quiz step
  useEffect(() => {
    if (activeStepKey !== "quiz") return;
    if (quiz || quizLoading) return;
    loadQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStepKey]);

  // auto-load roster when entering attendance step
  useEffect(() => {
    if (activeStepKey !== "attendance") return;
    if (!showAttendance) return;
    loadRoster();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStepKey, showAttendance]);

  const goNext = () => setStep((s) => Math.min(steps.length - 1, s + 1));
  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const nextKey = steps?.[step + 1]?.key || null;
  const nextLabel = steps?.[step + 1]?.label || "Next";
  const nextDisabled = activeStepKey === "ack" && nextKey === "quiz" && !ackChecked;

  /* ===================== RENDER STATES ===================== */

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
        <div className="top">
          <div>
            <div className="h1">{session?.title || `Session #${id}`}</div>
            <div className="sub">
              Mode: <b>{session?.mode || "-"}</b> • Due: <b>{fmtDT(session?.due_at)}</b>
              {showAttendance ? (
                <>
                  {" "}
                  • You are: <b>Leader</b>
                </>
              ) : null}
            </div>
          </div>

          <div className="actions">
            <button className="btn" onClick={() => navigate("/safety/my-sessions")}>
              ← Back
            </button>
            <button className="btn" onClick={markViewed}>
              Mark Viewed
            </button>
            <button className="btn primary" onClick={markComplete}>
              Acknowledge & Complete
            </button>
          </div>
        </div>

        <div className="stickyWrap">
          <Stepper
            steps={steps}
            activeIndex={step}
            onStep={(idx) => {
              setStep(idx);
            }}
          />

          <div className="navBtns">
            <button className="btn" onClick={goBack} disabled={step === 0}>
              ← Back
            </button>

            <button className="btn primary" onClick={goNext} disabled={step === steps.length - 1 || nextDisabled}>
              Next: {nextLabel} →
            </button>

            {nextDisabled ? (
              <div className="warnMini" style={{ marginTop: 0 }}>
                ⚠️ Please tick acknowledgement to proceed to Quiz.
              </div>
            ) : null}
          </div>
        </div>

        {/* ===================== STEP CONTENT ===================== */}

        {activeStepKey === "overview" ? (
          <div className="card">
            <div className="cardTop">
              <div className="cardTitle">Overview</div>
              <div className="muted">Read description + assets + photos</div>
            </div>

            <div className="pad">
              {session?.description ? <div className="desc">{session.description}</div> : <div className="muted">No description.</div>}

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
                      <div key={a.id || title} className="assetItem">
                        <div className="assetMeta">
                          <div className="pill">{String(type || "ASSET")}</div>
                          <div className="assetInfo">
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
                          <div className="muted" style={{ marginTop: 8 }}>
                            PPT preview depends on browser; use “Open”.
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="sectionTitle">Photos</div>
              {photos.length === 0 ? (
                <div className="muted">No photos.</div>
              ) : (
                <div className="photos">
                  {photos.map((p) => {
                    const url = pickPhotoUrl(p);
                    return url ? <img key={p.id || url} src={url} alt="" className="photo" /> : null;
                  })}
                </div>
              )}
            </div>
          </div>
        ) : null}

        {activeStepKey === "attendance" && showAttendance ? (
          <div className="card">
            <div className="cardTop">
              <div className="cardTitle">Attendance (Leader)</div>
              <div className="muted">{leaderLocked ? "Report already submitted — editing locked." : "Mark attendance then Save / Submit Report."}</div>
            </div>

            <div className="pad">
              {rosterErr ? <div style={{ color: "#a40000", marginBottom: 10 }}>{rosterErr}</div> : null}

              <div className="attTop">
                <input
                  className="attSearch"
                  placeholder="Search user..."
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                />

                <div className="attBtns">
                  <button className="btn" onClick={loadRoster} disabled={rosterLoading}>
                    {rosterLoading ? "Loading..." : "Refresh"}
                  </button>

                  <button className="btn primary" onClick={saveAttendance} disabled={leaderLocked || attSaving || rosterLoading}>
                    {attSaving ? "Saving..." : "Save Attendance"}
                  </button>

                  <button
                    className="btn warn"
                    onClick={submitLeaderReport}
                    disabled={leaderLocked || submittingReport || rosterLoading}
                    title={leaderLocked ? "Already submitted" : ""}
                  >
                    {leaderLocked ? "Submitted" : submittingReport ? "Submitting..." : "Submit Report"}
                  </button>
                </div>
              </div>

              {rosterLoading ? (
                <div className="muted" style={{ marginTop: 10 }}>
                  Loading roster...
                </div>
              ) : (
                <>
                  <div className="attMeta">
                    Location: <b>{roster?.location || session?.location || "-"}</b> • Scheduled:{" "}
                    <b>{fmtDT(roster?.scheduled_at || session?.scheduled_at)}</b>
                  </div>

                  {/* ✅ Topics Discussed */}
                  <div className="sectionTitle">Topics Discussed</div>
                  <div className="uploadBox">
                    <textarea
                      rows={4}
                      value={topicsDraft}
                      disabled={leaderLocked}
                      onChange={(e) => setTopicsDraft(e.target.value)}
                      placeholder="Write topics discussed in this IN_PERSON session..."
                    />
                    <div className="rowActions" style={{ marginTop: 10 }}>
                      <button className="btn primary" onClick={saveTopics} disabled={leaderLocked || topicsSaving || rosterLoading}>
                        {topicsSaving ? "Saving..." : "Save Topics"}
                      </button>
                      <div className="muted" style={{ alignSelf: "center" }}>
                        This will appear in the Manager report.
                      </div>
                    </div>
                  </div>

                  {/* ✅ Leader Photo Upload (Group + Individual) */}
                  <div className="sectionTitle">Photos (Leader)</div>

                  {/* Group upload */}
                  <div className="uploadBox">
                    <div style={{ fontWeight: 900, marginBottom: 6 }}>Group Photo</div>

                    <div className="uploadRow">
                      <input type="file" accept="image/*" disabled={leaderLocked} onChange={(e) => setGroupFile(e.target.files?.[0] || null)} />

                      <input
                        className="attNote"
                        placeholder="Caption (optional)"
                        value={groupCaption}
                        disabled={leaderLocked}
                        onChange={(e) => setGroupCaption(e.target.value)}
                      />

                      <button className="btn primary" onClick={uploadGroupPhoto} disabled={leaderLocked || groupUploading || !groupFile}>
                        {groupUploading ? "Uploading..." : "Upload Group Photo"}
                      </button>
                    </div>

                    <div className="photos" style={{ marginTop: 10 }}>
                      {safeArr(roster?.group_photos).map((p) => {
                        const url = pickPhotoUrl(p);
                        return url ? <img key={p.id || url} src={url} className="photo" alt="" /> : null;
                      })}
                      {!safeArr(roster?.group_photos).length ? <div className="muted">No group photos yet.</div> : null}
                    </div>
                  </div>

                  <div className="attList">
                    {safeArr(roster?.users)
                      .filter((r) => {
                        const u = r?.user || {};
                        const q = rosterSearch.trim().toLowerCase();
                        if (!q) return true;
                        const full = `${u.first_name || ""} ${u.last_name || ""} ${u.username || ""}`.toLowerCase();
                        return full.includes(q);
                      })
                      .map((r) => {
                        const u = r?.user || {};
                        const uid = u?.id;
                        const d = attDraft?.[uid] || { status: "UNKNOWN", note: "" };

                        const allowed = ["UNKNOWN", "PRESENT", "ABSENT"];
                        const extraStatus = d.status && !allowed.includes(String(d.status)) ? String(d.status) : null;

                        return (
                          <div key={uid} className="attRow">
                            <div className="attUser">
                              <div className="attName">
                                {u.first_name || ""} {u.last_name || ""} <span className="muted">({u.username || "-"})</span>
                              </div>
                              <div className="muted" style={{ fontSize: 12 }}>
                                User ID: {uid}
                              </div>
                            </div>

                            <div className="attControls">
                              <select
                                value={d.status}
                                disabled={leaderLocked}
                                onChange={(e) =>
                                  setAttDraft((p) => ({
                                    ...p,
                                    [uid]: { ...(p?.[uid] || {}), status: e.target.value },
                                  }))
                                }
                              >
                                {allowed.map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                                {extraStatus ? <option value={extraStatus}>{extraStatus}</option> : null}
                              </select>

                              <input
                                className="attNote"
                                placeholder="Note (optional)"
                                value={d.note}
                                disabled={leaderLocked}
                                onChange={(e) =>
                                  setAttDraft((p) => ({
                                    ...p,
                                    [uid]: { ...(p?.[uid] || {}), note: e.target.value },
                                  }))
                                }
                              />
                            </div>

                            {/* ✅ Individual photo upload + list */}
                            <div style={{ width: "100%", marginTop: 10 }}>
                              <div style={{ fontWeight: 900, marginBottom: 6, fontSize: 13 }}>Participant Photos</div>

                              <div className="uploadRow">
                                <input
                                  type="file"
                                  accept="image/*"
                                  disabled={leaderLocked}
                                  onChange={(e) => {
                                    const f = e.target.files?.[0] || null;
                                    setUserPhotoDraft((p) => ({
                                      ...p,
                                      [uid]: { ...(p[uid] || {}), file: f },
                                    }));
                                  }}
                                />

                                <input
                                  className="attNote"
                                  placeholder="Caption (optional)"
                                  disabled={leaderLocked}
                                  value={userPhotoDraft?.[uid]?.caption || ""}
                                  onChange={(e) =>
                                    setUserPhotoDraft((p) => ({
                                      ...p,
                                      [uid]: { ...(p[uid] || {}), caption: e.target.value },
                                    }))
                                  }
                                />

                                <button
                                  className="btn primary"
                                  disabled={leaderLocked || !!userPhotoDraft?.[uid]?.uploading || !userPhotoDraft?.[uid]?.file}
                                  onClick={() => uploadUserPhoto(uid)}
                                >
                                  {userPhotoDraft?.[uid]?.uploading ? "Uploading..." : "Upload"}
                                </button>
                              </div>

                              <div className="photos" style={{ marginTop: 8 }}>
                                {safeArr(r?.participant_photos).map((p) => {
                                  const url = pickPhotoUrl(p);
                                  return url ? <img key={p.id || url} src={url} className="photo" alt="" /> : null;
                                })}
                                {!safeArr(r?.participant_photos).length ? <div className="muted">No participant photos yet.</div> : null}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </>
              )}
            </div>
          </div>
        ) : null}

        {activeStepKey === "ack" ? (
          <div className="card">
            <div className="cardTop">
              <div className="cardTitle">Acknowledgement</div>
              <div className="muted">Tick checkbox then you can continue to Quiz</div>
            </div>

            <div className="pad">
              <label className="ackRow">
                <input type="checkbox" checked={ackChecked} onChange={(e) => setAckChecked(e.target.checked)} />
                <span>I confirm I have understood.</span>
              </label>

              <textarea value={ackText} onChange={(e) => setAckText(e.target.value)} rows={5} />

              <div className="rowActions">
                <button className="btn" onClick={markViewed}>
                  Mark Viewed
                </button>
                <button className="btn primary" onClick={markComplete} disabled={!ackChecked}>
                  Acknowledge & Complete
                </button>
                <button
                  className="btn warn"
                  onClick={() => setStep(steps.findIndex((s) => s.key === "quiz"))}
                  disabled={!ackChecked}
                >
                  Continue to Quiz →
                </button>
              </div>

              {!ackChecked ? <div className="warnMini">⚠️ Please tick acknowledgement to proceed to Quiz.</div> : null}
            </div>
          </div>
        ) : null}

        {activeStepKey === "quiz" ? (
          <div className="card">
            <div className="cardTop">
              <div className="cardTitle">Quiz</div>
              <div className="muted">
                {quiz ? (
                  <>
                    Questions: <b>{questions.length}</b> • Answered: <b>{answeredCount}</b>
                    {typeof quiz?.pass_mark !== "undefined" ? (
                      <>
                        {" "}
                        • Pass Mark: <b>{quiz?.pass_mark}%</b>
                      </>
                    ) : null}
                  </>
                ) : (
                  "Load & attempt quiz"
                )}
              </div>
            </div>

            <div className="pad">
              {quizLoading ? (
                <div className="muted">Loading quiz...</div>
              ) : !quiz ? (
                <div className="muted">
                  No quiz available.
                  <div style={{ marginTop: 10 }}>
                    <button className="btn" onClick={loadQuiz}>
                      Reload Quiz
                    </button>
                  </div>
                </div>
              ) : questions.length === 0 ? (
                <div className="muted">Quiz has no questions.</div>
              ) : (
                <>
                  <div className="quizTopBar">
                    <button className="btn" onClick={loadQuiz}>
                      Refresh Quiz
                    </button>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button className="btn primary" onClick={startAttempt} disabled={!!attemptId}>
                        {attemptId ? `Attempt Started (#${attemptId})` : "Start Quiz"}
                      </button>

                      <button
                        className="btn warn"
                        onClick={submitQuiz}
                        disabled={!attemptId || submitting || isSubmitted}
                        title={isSubmitted ? "Already submitted" : ""}
                      >
                        {isSubmitted ? "Submitted" : submitting ? "Submitting..." : "Submit Quiz"}
                      </button>
                    </div>
                  </div>

                  {result ? (
                    <div className={`resultBox ${result.passed ? "pass" : "fail"}`}>
                      <div className="resultTitle">{result.passed ? "✅ Passed" : "❌ Failed"}</div>

                      <div className="resultGrid">
                        <div>
                          Score:{" "}
                          <b>
                            {typeof result?.score !== "undefined" ? result.score : "-"} /{" "}
                            {typeof result?.max_score !== "undefined" ? result.max_score : "-"}
                          </b>
                        </div>
                        <div>
                          Percentage: <b>{result?.percentage ?? "-"}%</b>
                        </div>
                        <div>
                          Time:{" "}
                          <b>
                            {typeof result?.time_spent_seconds !== "undefined" ? `${result.time_spent_seconds}s` : "-"}
                          </b>
                        </div>
                        <div>
                          Attempt: <b>#{result?.attempt_no ?? "-"}</b>
                        </div>
                      </div>

                      <div className="muted" style={{ marginTop: 6 }}>
                        Submitted: <b>{fmtDT(result?.submitted_at)}</b>
                      </div>

                      <div className="reviewList">
                        {questions.map((q, idx) => {
                          const labels = getSelectedLabels(q);
                          return (
                            <div key={q.id} className="reviewCard">
                              <div className="reviewQ">
                                {idx + 1}. {pickQuestionText(q)}
                              </div>

                              <div className="reviewA">
                                Your Answer:{" "}
                                {labels.length ? (
                                  <span className="ansChips">
                                    {labels.map((t, i) => (
                                      <span key={i} className="chip">
                                        {t}
                                      </span>
                                    ))}
                                  </span>
                                ) : (
                                  <b>-</b>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  <div className="qDots">
                    {questions.map((q, idx) => {
                      const done = safeArr(answersMap?.[q.id]).length > 0;
                      const active = idx === quizIndex;
                      return (
                        <button
                          key={q.id}
                          type="button"
                          className={`qDot ${active ? "active" : ""} ${done ? "done" : ""}`}
                          onClick={() => setQuizIndex(idx)}
                          title={`Q${idx + 1} ${done ? "(answered)" : ""}`}
                          disabled={!attemptId}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>

                  {!attemptId ? (
                    <div className="warnMini" style={{ marginTop: 10 }}>
                      ⚠️ Start quiz to unlock questions.
                    </div>
                  ) : null}

                  {currentQ ? (
                    <div className={`qOne ${!attemptId ? "disabled" : ""}`}>
                      <div className="qHeader">
                        <div className="qTitle">
                          Q{quizIndex + 1}. {pickQuestionText(currentQ)}
                        </div>
                        <div className="qMeta">
                          Type: <b>{String(currentQ?.question_type || "-")}</b>
                        </div>
                      </div>

                      <div className="opts">
                        {[...safeArr(currentQ?.options)]
                          .sort((a, b) => Number(a?.order ?? 0) - Number(b?.order ?? 0))
                          .map((o) => {
                            const oid = o?.id;
                            const multi = isMultiQuestion(currentQ);
                            const selected = safeArr(answersMap?.[currentQ.id]).map(Number);
                            const checked = selected.includes(Number(oid));

                            return (
                              <label key={oid} className={`opt ${checked ? "on" : ""}`}>
                                <input
                                  type={multi ? "checkbox" : "radio"}
                                  name={`q-${currentQ.id}`}
                                  checked={checked}
                                  onChange={() => toggleOption(currentQ.id, oid, multi)}
                                  disabled={!attemptId || isSubmitted}
                                />
                                <span>{pickOptionText(o)}</span>
                              </label>
                            );
                          })}
                      </div>

                      <div className="qNav">
                        <button className="btn" onClick={() => setQuizIndex((x) => Math.max(0, x - 1))} disabled={quizIndex === 0 || !attemptId}>
                          ← Prev
                        </button>

                        <div className="muted">
                          {answeredCount}/{questions.length} answered
                        </div>

                        <button
                          className="btn primary"
                          onClick={() => setQuizIndex((x) => Math.min(questions.length - 1, x + 1))}
                          disabled={quizIndex === questions.length - 1 || !attemptId}
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        ) : null}
      </div>

      <style>{`
        .page{ padding: 16px; }
        .top{ display:flex; justify-content:space-between; align-items:flex-start; gap: 12px; margin-bottom: 12px; }
        .h1{ font-size: 20px; font-weight: 900; }
        .sub{ margin-top: 6px; font-size: 13px; color:#666; }
        .actions{ display:flex; gap: 10px; flex-wrap: wrap; }

        .stickyWrap{
          position: sticky;
          top: 0;
          z-index: 5;
          background: rgba(250,250,250,.92);
          border: 1px solid #eee;
          border-radius: 14px;
          padding: 12px;
          backdrop-filter: blur(6px);
          margin-bottom: 12px;
        }

        .card{ background:#fff; border:1px solid #eee; border-radius: 14px; overflow:hidden; }
        .cardTop{ padding: 12px; border-bottom: 1px solid #eee; background: linear-gradient(180deg,#fff,#fffaf0); }
        .cardTitle{ font-weight: 900; }
        .pad{ padding: 12px; }

        .btn{ border:1px solid #ddd; background:#fff; padding: 9px 12px; border-radius: 12px; cursor:pointer; font-size: 13px; }
        .btn.primary{ border-color:${ORANGE}; background:${ORANGE}; color:#111; font-weight: 900; }
        .btn.warn{ border-color:${BLUE}; background:${BLUE}; color:#fff; font-weight: 900; }
        .btn:disabled{ opacity:.55; cursor:not-allowed; }

        .muted{ color:#666; font-size: 13px; }
        .desc{ margin-bottom: 12px; color:#222; }
        .sectionTitle{ margin-top: 12px; margin-bottom: 8px; font-weight: 900; }

        /* stepper */
        .stepper{
          display:flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: stretch;
        }
        .step{
          position: relative;
          display:flex;
          align-items:center;
          gap: 10px;
          border: 1px solid #eee;
          background: #fff;
          border-radius: 14px;
          padding: 10px 12px;
          cursor: pointer;
          min-width: 220px;
          text-align: left;
        }
        .step:hover{ border-color: ${ORANGE}; }
        .step.active{ border-color: ${ORANGE}; box-shadow: 0 0 0 3px rgba(255,190,99,.22); }
        .step.done .stepCircle{ background: ${ORANGE}; border-color: ${ORANGE}; color:#111; }

        .stepCircle{
          width: 34px; height: 34px;
          border-radius: 999px;
          display:flex; align-items:center; justify-content:center;
          border: 1px solid #ddd;
          font-weight: 900;
          background: #fff;
          flex: 0 0 auto;
        }
        .stepText{ display:flex; flex-direction:column; gap: 2px; }
        .stepLabel{ font-weight: 900; font-size: 13px; }
        .stepSub{ font-size: 12px; color:#666; }

        .navBtns{
          margin-top: 10px;
          display:flex;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }

        /* assets/photos */
        .assetList{ display:flex; flex-direction:column; gap: 10px; }
        .assetItem{ border:1px solid #eee; border-radius: 12px; padding: 10px; }
        .assetMeta{ display:flex; gap: 10px; align-items:flex-start; }
        .assetInfo{ min-width: 0; }
        .assetTitle{ font-weight: 900; word-break: break-word; }
        .pill{ border:1px solid #ddd; border-radius: 999px; padding: 6px 10px; font-size: 12px; background:#fff; }
        .link{ display:inline-block; margin-top: 4px; font-size: 13px; }
        .video{ width: 100%; margin-top: 10px; border-radius: 12px; border:1px solid #eee; }

        .photos{ display:flex; gap: 10px; flex-wrap: wrap; }
        .photo{ width: 140px; height: 100px; object-fit: cover; border-radius: 12px; border: 1px solid #eee; }

        /* upload */
        .uploadBox{
          border: 1px solid #eee;
          border-radius: 14px;
          padding: 10px 12px;
          background: #fff;
          margin-top: 8px;
        }
        .uploadRow{
          display:flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items:center;
        }

        /* ack */
        .ackRow{ display:flex; gap: 10px; align-items:center; font-weight: 800; }
        textarea{ width: 100%; border:1px solid #ddd; border-radius: 12px; padding: 10px 12px; outline:none; resize: vertical; margin-top: 10px; }
        .rowActions{ margin-top: 10px; display:flex; gap: 10px; flex-wrap: wrap; }
        .warnMini{
          padding: 10px 12px;
          border: 1px solid #ffe6b5;
          background: #fff8e8;
          color: #6a4a00;
          border-radius: 12px;
          font-size: 13px;
        }

        /* quiz */
        .quizTopBar{
          display:flex;
          justify-content: space-between;
          align-items:center;
          gap: 10px;
          flex-wrap: wrap;
          padding: 10px;
          border: 1px solid #eee;
          border-radius: 14px;
          background: #fff;
        }

        .qDots{
          margin-top: 12px;
          display:flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .qDot{
          width: 34px; height: 34px;
          border-radius: 12px;
          border: 1px solid #ddd;
          background: #fff;
          cursor: pointer;
          font-weight: 900;
        }
        .qDot.active{ border-color: ${ORANGE}; box-shadow: 0 0 0 3px rgba(255,190,99,.22); }
        .qDot.done{ background: ${ORANGE}; border-color: ${ORANGE}; color:#111; }
        .qDot:disabled{ opacity: .5; cursor: not-allowed; }

        .qOne{
          margin-top: 12px;
          border: 1px solid #eee;
          border-radius: 14px;
          padding: 12px;
          background: #fff;
        }
        .qOne.disabled{ opacity: .65; pointer-events: none; }

        .qHeader{ display:flex; justify-content:space-between; align-items:flex-start; gap: 10px; flex-wrap: wrap; }
        .qTitle{ font-weight: 900; }
        .qMeta{ font-size: 13px; color:#666; }

        .opts{ margin-top: 10px; display:flex; flex-direction:column; gap: 8px; }
        .opt{
          display:flex;
          gap: 10px;
          align-items:flex-start;
          border:1px solid #eee;
          padding: 10px 12px;
          border-radius: 12px;
          cursor:pointer;
          background: #fff;
        }
        .opt.on{ border-color:${ORANGE}; box-shadow: 0 0 0 3px rgba(255,190,99,.20); }
        .opt input{ margin-top: 3px; }

        .qNav{
          margin-top: 12px;
          display:flex;
          justify-content: space-between;
          align-items:center;
          gap: 10px;
          flex-wrap: wrap;
          border-top: 1px dashed #eee;
          padding-top: 12px;
        }

        /* result */
        .resultBox{
          margin-top: 12px;
          border: 1px solid #eee;
          border-radius: 14px;
          padding: 12px;
          background: #fff;
        }
        .resultBox.pass{ border-color: #bdeac6; background: #f5fff7; }
        .resultBox.fail{ border-color: #ffd0d0; background: #fff7f7; }
        .resultTitle{ font-weight: 900; font-size: 16px; }

        .resultGrid{
          margin-top: 8px;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }
        @media (max-width: 700px){
          .resultGrid{ grid-template-columns: 1fr; }
        }

        .reviewList{ margin-top: 12px; display:flex; flex-direction:column; gap: 10px; }
        .reviewCard{
          border: 1px solid #eee;
          border-radius: 12px;
          padding: 10px 12px;
          background: #fff;
        }
        .reviewQ{ font-weight: 900; margin-bottom: 8px; }
        .reviewA{ font-size: 13px; color:#333; }
        .ansChips{ display:flex; flex-wrap: wrap; gap: 8px; }
        .chip{
          display:inline-flex;
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid #ddd;
          background: #fff;
          font-size: 12px;
          font-weight: 700;
        }

        /* ✅ Attendance */
        .attTop{
          display:flex;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }
        .attSearch{
          min-width: 240px;
          flex: 1;
          border:1px solid #ddd;
          border-radius: 12px;
          padding: 10px 12px;
          outline:none;
        }
        .attBtns{ display:flex; gap: 10px; flex-wrap: wrap; }
        .attMeta{ margin-top: 10px; margin-bottom: 10px; }
        .attList{ display:flex; flex-direction: column; gap: 10px; margin-top: 10px; }
        .attRow{
          border:1px solid #eee;
          border-radius: 14px;
          padding: 10px 12px;
          display:flex;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          background: #fff;
        }
        .attUser{ min-width: 220px; }
        .attName{ font-weight: 900; }
        .attControls{
          display:flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items:center;
        }
        .attControls select{
          border:1px solid #ddd;
          border-radius: 12px;
          padding: 9px 10px;
          outline:none;
        }
        .attNote{
          border:1px solid #ddd;
          border-radius: 12px;
          padding: 9px 10px;
          outline:none;
          min-width: 240px;
        }
      `}</style>
    </>
  );
}

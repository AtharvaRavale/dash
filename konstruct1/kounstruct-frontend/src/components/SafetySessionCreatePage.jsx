// import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";
// import * as API from "../api/index";

// const ORANGE = "#ffbe63";

// // ✅ if your backend expects a different key, change only this:
// const LEADER_PAYLOAD_FIELD = "leader_user_id";

// const MODES = [
//   { value: "SELF_PACED", label: "Self Paced" },
//   { value: "IN_PERSON", label: "In Person" },
// ];

// const ASSIGN_MODES = [
//   { value: "ALL", label: "Assign to All Users (in selected project)" },
//   { value: "SELECT", label: "Select Specific Users" },
// ];

// const ASSET_TYPES = [
//   { value: "VIDEO", label: "Video" },
//   { value: "PPT", label: "PPT" },
//   { value: "PDF", label: "PDF" },
//   { value: "OTHER", label: "Other" },
// ];

// const QUIZ_Q_TYPES = [
//   { value: "SINGLE", label: "Single Correct" },
//   { value: "MULTI", label: "Multiple Correct" },
// ];

// const STEPS = [
//   { key: "details", label: "Details" },
//   { key: "projects", label: "Projects" },
//   { key: "users", label: "Users" },
//   { key: "quiz", label: "Quiz" },
//   { key: "assets", label: "Assets" },
//   { key: "review", label: "Review" },
// ];

// const safeArr = (v) => (Array.isArray(v) ? v : []);

// const normalizeList = (data) => {
//   if (data && typeof data === "object" && Array.isArray(data.results)) {
//     return { items: data.results, count: Number(data.count || 0) };
//   }
//   if (Array.isArray(data)) return { items: data, count: data.length };
//   return { items: [], count: 0 };
// };

// const pickProjectLabel = (p) =>
//   p?.label ||
//   p?.name ||
//   p?.project_label ||
//   p?.title ||
//   `Project #${p?.id ?? "-"}`;

// const pickUserLabel = (u) =>
//   u?.display_name ||
//   [u?.first_name, u?.last_name].filter(Boolean).join(" ").trim() ||
//   u?.username ||
//   u?.email ||
//   `User #${u?.id ?? "-"}`;

// // datetime-local -> naive "YYYY-MM-DDTHH:mm:00"
// const toNaiveDT = (v) => {
//   if (!v) return null;
//   const s = String(v).trim();
//   if (!s) return null;
//   return s.length === 16 ? `${s}:00` : s;
// };

// const cleanPayload = (obj) => {
//   const out = {};
//   Object.keys(obj || {}).forEach((k) => {
//     const v = obj[k];
//     if (v === undefined || v === null) return;
//     if (typeof v === "string" && !v.trim()) return;
//     if (Array.isArray(v) && v.length === 0) return;
//     out[k] = v;
//   });
//   return out;
// };

// const makeTempId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

// const humanErr = (e, fallback = "Something went wrong") => {
//   return (
//     e?.response?.data?.detail ||
//     (e?.response?.data && JSON.stringify(e.response.data)) ||
//     e?.message ||
//     fallback
//   );
// };

// // ---- XLSX loader (Vite friendly) ----
// const loadXLSX = async () => {
//   try {
//     const mod = await import("xlsx");
//     return mod?.default || mod;
//   } catch (e) {
//     throw new Error("Missing dependency: install `xlsx` => npm i xlsx");
//   }
// };

// const normKey = (k) => String(k || "").trim().toLowerCase().replace(/\s+/g, "_");

// export default function SafetySessionCreatePage() {
//   const navigate = useNavigate();

//   // ---------- STEPPER ----------
//   const [step, setStep] = useState(0);
//   const stepKey = STEPS[step]?.key;

//   const gotoStep = (idx) => {
//     const n = Number(idx);
//     if (!Number.isFinite(n)) return;
//     if (n < 0 || n > STEPS.length - 1) return;
//     setStep(n);
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   const nextStep = () => {
//     const msg = validateStep(step);
//     if (msg) {
//       setErr(msg);
//       toast.error(msg);
//       return;
//     }
//     gotoStep(Math.min(step + 1, STEPS.length - 1));
//   };

//   const prevStep = () => gotoStep(Math.max(step - 1, 0));

//   // ---------- projects ----------
//   const [projects, setProjects] = useState([]);
//   const [loadingProjects, setLoadingProjects] = useState(true);

//   const activeProjectId = String(API.resolveActiveProjectId?.() || "") || "";
//   const [projectSearch, setProjectSearch] = useState("");
//   const [selectedProjectIds, setSelectedProjectIds] = useState(
//     activeProjectId ? [Number(activeProjectId)] : []
//   );

//   // ---------- core fields ----------
//   const [title, setTitle] = useState("");
//   const [mode, setMode] = useState("SELF_PACED");
//   const [description, setDescription] = useState("");
//   const [location, setLocation] = useState("");

//   // ✅ Leader (only for IN_PERSON)
//   const [leaderUserId, setLeaderUserId] = useState("");
//   const [leaderSearch, setLeaderSearch] = useState("");
//   const [manualLeaderId, setManualLeaderId] = useState("");

//   const [scheduledAt, setScheduledAt] = useState("");
//   const [dueAt, setDueAt] = useState("");

//   const [ackText, setAckText] = useState(
//     "I confirm I have understood the safety training/session."
//   );

//   // optional misc
//   const [durationMinutes, setDurationMinutes] = useState("");
//   const [isMandatory, setIsMandatory] = useState(true);

//   // quiz related
//   const [passMark, setPassMark] = useState("");
//   const [maxAttempts, setMaxAttempts] = useState("");

//   // ---------- users ----------
//   const [assignMode, setAssignMode] = useState("ALL");
//   const [users, setUsers] = useState([]);
//   const [loadingUsers, setLoadingUsers] = useState(false);
//   const [usersErr, setUsersErr] = useState("");
//   const [userSearch, setUserSearch] = useState("");

//   const [selectedUserIds, setSelectedUserIds] = useState([]); // for SELECT
//   const [skippedUserIds, setSkippedUserIds] = useState([]); // for ALL (skip list)
//   const [manualUserId, setManualUserId] = useState("");

//   // ---------- assets ----------
//   // each asset: { tempId, asset_type, title, file }
//   const [assets, setAssets] = useState([]);
//   const [assetType, setAssetType] = useState("VIDEO");
//   const [assetTitle, setAssetTitle] = useState("");
//   const [assetFile, setAssetFile] = useState(null);

//   // photos upload UI
//   const [photoFiles, setPhotoFiles] = useState([]);

//   // ---------- QUIZ ----------
//   const [quizEnabled, setQuizEnabled] = useState(false);

//   // each question: { tempId, text, qtype: SINGLE|MULTI, options:[{tempId,text,is_correct}] }
//   const [quizQuestions, setQuizQuestions] = useState([]);

//   // ---- Excel bulk states ----
//   const [bulkUploading, setBulkUploading] = useState(false);
//   const [bulkAppend, setBulkAppend] = useState(false);

//   const addQuizQuestion = () => {
//     setQuizQuestions((prev) => [
//       ...safeArr(prev),
//       {
//         tempId: makeTempId(),
//         text: "",
//         qtype: "SINGLE",
//         options: [
//           { tempId: makeTempId(), text: "", is_correct: true },
//           { tempId: makeTempId(), text: "", is_correct: false },
//         ],
//       },
//     ]);
//   };

//   const removeQuizQuestion = (tempId) => {
//     setQuizQuestions((prev) => safeArr(prev).filter((q) => q?.tempId !== tempId));
//   };

//   const updateQuizQuestion = (tempId, patch) => {
//     setQuizQuestions((prev) =>
//       safeArr(prev).map((q) => (q.tempId === tempId ? { ...q, ...patch } : q))
//     );
//   };

//   const addQuizOption = (qTempId) => {
//     setQuizQuestions((prev) =>
//       safeArr(prev).map((q) => {
//         if (q.tempId !== qTempId) return q;
//         return {
//           ...q,
//           options: [
//             ...safeArr(q.options),
//             { tempId: makeTempId(), text: "", is_correct: false },
//           ],
//         };
//       })
//     );
//   };

//   const removeQuizOption = (qTempId, oTempId) => {
//     setQuizQuestions((prev) =>
//       safeArr(prev).map((q) => {
//         if (q.tempId !== qTempId) return q;
//         const next = safeArr(q.options).filter((o) => o.tempId !== oTempId);
//         return { ...q, options: next };
//       })
//     );
//   };

//   const updateQuizOption = (qTempId, oTempId, patch) => {
//     setQuizQuestions((prev) =>
//       safeArr(prev).map((q) => {
//         if (q.tempId !== qTempId) return q;
//         return {
//           ...q,
//           options: safeArr(q.options).map((o) =>
//             o.tempId === oTempId ? { ...o, ...patch } : o
//           ),
//         };
//       })
//     );
//   };

//   const toggleCorrect = (qTempId, oTempId) => {
//     setQuizQuestions((prev) =>
//       safeArr(prev).map((q) => {
//         if (q.tempId !== qTempId) return q;

//         if (q.qtype === "SINGLE") {
//           return {
//             ...q,
//             options: safeArr(q.options).map((o) => ({
//               ...o,
//               is_correct: o.tempId === oTempId,
//             })),
//           };
//         }

//         return {
//           ...q,
//           options: safeArr(q.options).map((o) =>
//             o.tempId === oTempId ? { ...o, is_correct: !o.is_correct } : o
//           ),
//         };
//       })
//     );
//   };

//   // ---------- status ----------
//   const [saving, setSaving] = useState(false);
//   const [err, setErr] = useState("");

//   // ✅ If mode becomes SELF_PACED, reset leader fields
//   useEffect(() => {
//     if (mode !== "IN_PERSON") {
//       setLeaderUserId("");
//       setLeaderSearch("");
//       setManualLeaderId("");
//     }
//   }, [mode]);

//   // ---------------- load projects ----------------
//   useEffect(() => {
//     let alive = true;

//     (async () => {
//       try {
//         setLoadingProjects(true);
//         const res = await API.getProjectsForCurrentUser?.();
//         const raw = res?.data;

//         const list =
//           normalizeList(raw).items.length > 0 ? normalizeList(raw).items : safeArr(raw);

//         if (!alive) return;

//         setProjects(list);

//         if ((!selectedProjectIds || selectedProjectIds.length === 0) && list?.length) {
//           const firstId = Number(list[0]?.id || 0);
//           if (firstId) setSelectedProjectIds([firstId]);
//           try {
//             API.setActiveProjectId?.(firstId);
//           } catch {}
//         }
//       } catch {
//         if (!alive) return;
//         setProjects([]);
//       } finally {
//         if (!alive) return;
//         setLoadingProjects(false);
//       }
//     })();

//     return () => {
//       alive = false;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // persist active project
//   useEffect(() => {
//     const first = safeArr(selectedProjectIds)[0];
//     if (first) {
//       try {
//         API.setActiveProjectId?.(first);
//       } catch {}
//     }
//   }, [selectedProjectIds]);

//   // ---------------- filtered projects ----------------
//   const filteredProjects = useMemo(() => {
//     const qq = (projectSearch || "").trim().toLowerCase();
//     if (!qq) return projects;
//     return projects.filter((p) => String(pickProjectLabel(p)).toLowerCase().includes(qq));
//   }, [projects, projectSearch]);

//   const toggleProject = (id) => {
//     const pid = Number(id);
//     if (!pid) return;
//     setSelectedProjectIds((prev) => {
//       const cur = safeArr(prev).map(Number);
//       if (cur.includes(pid)) return cur.filter((x) => x !== pid);
//       return [...cur, pid];
//     });
//   };

//   const selectAllFilteredProjects = () => {
//     const ids = filteredProjects.map((p) => Number(p?.id)).filter(Boolean);
//     setSelectedProjectIds((prev) => {
//       const cur = new Set(safeArr(prev).map(Number));
//       ids.forEach((x) => cur.add(x));
//       return Array.from(cur);
//     });
//   };

//   const clearProjects = () => setSelectedProjectIds([]);

//   // ---------------- USERS: load from /users/by-project/?project_id=126 ----------------
//   const fetchUsers = async () => {
//     const firstProject = safeArr(selectedProjectIds)[0];
//     if (!firstProject) {
//       setUsers([]);
//       return;
//     }
//     if (!API.getUsersByProject) {
//       setUsers([]);
//       setUsersErr("getUsersByProject() missing in api/index.js");
//       return;
//     }

//     setLoadingUsers(true);
//     setUsersErr("");

//     try {
//       const res = await API.getUsersByProject(firstProject);
//       const raw = res?.data;
//       const list =
//         normalizeList(raw).items.length > 0 ? normalizeList(raw).items : safeArr(raw);

//       setUsers(list);
//     } catch (e) {
//       setUsers([]);
//       setUsersErr(e?.response?.data?.detail || e?.message || "Failed to load users");
//     } finally {
//       setLoadingUsers(false);
//     }
//   };

//   useEffect(() => {
//     if (!safeArr(selectedProjectIds).length) return;
//     fetchUsers();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedProjectIds]);

//   const filteredUsers = useMemo(() => {
//     const qq = (userSearch || "").trim().toLowerCase();
//     if (!qq) return users;
//     return users.filter((u) => {
//       const s = `${pickUserLabel(u)} ${(u?.email || "")} ${(u?.username || "")}`.toLowerCase();
//       return s.includes(qq);
//     });
//   }, [users, userSearch]);

//   // ✅ Leader helpers
//   const leaderUser = useMemo(() => {
//     const id = Number(leaderUserId);
//     if (!id) return null;
//     return safeArr(users).find((u) => Number(u?.id) === id) || null;
//   }, [users, leaderUserId]);

//   const filteredLeaderUsers = useMemo(() => {
//     const qq = (leaderSearch || "").trim().toLowerCase();
//     if (!qq) return users;
//     return users.filter((u) => {
//       const s = `${pickUserLabel(u)} ${(u?.email || "")} ${(u?.username || "")}`.toLowerCase();
//       return s.includes(qq);
//     });
//   }, [users, leaderSearch]);

//   const addManualLeader = () => {
//     const uid = Number(String(manualLeaderId || "").trim());
//     if (!uid) return toast.error("Enter valid numeric Leader User ID");
//     setLeaderUserId(String(uid));
//     setManualLeaderId("");
//   };

//   const toggleUserId = (id, bucket) => {
//     const uid = Number(id);
//     if (!uid) return;

//     if (bucket === "selected") {
//       setSelectedUserIds((prev) => {
//         const cur = safeArr(prev).map(Number);
//         return cur.includes(uid) ? cur.filter((x) => x !== uid) : [...cur, uid];
//       });
//     } else {
//       setSkippedUserIds((prev) => {
//         const cur = safeArr(prev).map(Number);
//         return cur.includes(uid) ? cur.filter((x) => x !== uid) : [...cur, uid];
//       });
//     }
//   };

//   const addManualUserId = (bucket) => {
//     const uid = Number(String(manualUserId || "").trim());
//     if (!uid) return toast.error("Enter valid numeric User ID");

//     if (bucket === "selected") {
//       setSelectedUserIds((prev) => Array.from(new Set([...safeArr(prev), uid].map(Number))));
//     } else {
//       setSkippedUserIds((prev) => Array.from(new Set([...safeArr(prev), uid].map(Number))));
//     }

//     setManualUserId("");
//   };

//   // ---------------- ASSETS ----------------
//   const addAsset = () => {
//     if (!assetType) return toast.error("Select asset type");
//     if (!assetFile) return toast.error("Choose a file");

//     const t = (assetTitle || "").trim() || assetFile.name || assetType;

//     setAssets((prev) => [
//       ...safeArr(prev),
//       { tempId: makeTempId(), asset_type: assetType, title: t, file: assetFile },
//     ]);

//     setAssetTitle("");
//     setAssetFile(null);
//   };

//   const removeAsset = (tempId) => {
//     setAssets((prev) => safeArr(prev).filter((a) => a?.tempId !== tempId));
//   };

//   const removePhoto = (idx) => {
//     setPhotoFiles((prev) => safeArr(prev).filter((_, i) => i !== idx));
//   };

//   // ---------------- validation ----------------
//   const validateQuiz = () => {
//     if (!quizEnabled) return "";

//     const qs = safeArr(quizQuestions);
//     if (!qs.length) return "Quiz enabled but no questions added";

//     for (let i = 0; i < qs.length; i++) {
//       const q = qs[i];
//       if (!String(q?.text || "").trim()) return `Question #${i + 1} text is required`;

//       const opts = safeArr(q?.options)
//         .map((o) => ({ ...o, text: String(o?.text || "").trim() }))
//         .filter((o) => o.text);

//       if (opts.length < 2) return `Question #${i + 1}: add at least 2 options`;

//       const correctCount = opts.filter((o) => !!o.is_correct).length;
//       if (correctCount < 1) return `Question #${i + 1}: mark at least 1 correct option`;

//       if (q.qtype === "SINGLE" && correctCount !== 1) {
//         return `Question #${i + 1}: Single correct requires exactly 1 correct option`;
//       }
//     }

//     return "";
//   };

//   const validate = () => {
//     if (!title.trim()) return "Title is required";
//     if (!mode) return "Mode is required";
//     if (!safeArr(selectedProjectIds).length) return "Select at least 1 project";
//     if (mode === "IN_PERSON" && !location.trim()) return "Location is required for In Person";
//     if (mode === "IN_PERSON" && !String(leaderUserId || "").trim())
//       return "Select a leader for In Person session";

//     if (dueAt && scheduledAt) {
//       const a = new Date(scheduledAt);
//       const b = new Date(dueAt);
//       if (!Number.isNaN(a.getTime()) && !Number.isNaN(b.getTime()) && b < a) {
//         return "Due date/time cannot be before Scheduled date/time";
//       }
//     }

//     if (assignMode === "SELECT" && safeArr(selectedUserIds).length === 0) {
//       return "Select at least 1 user OR change assign mode to 'Assign to All'";
//     }

//     const qmsg = validateQuiz();
//     if (qmsg) return qmsg;

//     return "";
//   };

//   // ✅ Step-wise validation
//   const validateStep = (stepIdx) => {
//     const key = STEPS[stepIdx]?.key;

//     if (key === "details") {
//       if (!title.trim()) return "Title is required";
//       if (!mode) return "Mode is required";
//       if (mode === "IN_PERSON" && !location.trim()) return "Location is required for In Person";
//       if (mode === "IN_PERSON" && !String(leaderUserId || "").trim())
//         return "Select a leader for In Person session";

//       if (dueAt && scheduledAt) {
//         const a = new Date(scheduledAt);
//         const b = new Date(dueAt);
//         if (!Number.isNaN(a.getTime()) && !Number.isNaN(b.getTime()) && b < a) {
//           return "Due date/time cannot be before Scheduled date/time";
//         }
//       }
//       return "";
//     }

//     if (key === "projects") {
//       if (!safeArr(selectedProjectIds).length) return "Select at least 1 project";
//       return "";
//     }

//     if (key === "users") {
//       if (assignMode === "SELECT" && safeArr(selectedUserIds).length === 0) {
//         return "Select at least 1 user OR change assign mode to 'Assign to All'";
//       }
//       return "";
//     }

//     if (key === "quiz") {
//       const qmsg = validateQuiz();
//       if (qmsg) return qmsg;
//       return "";
//     }

//     if (key === "review") {
//       return validate();
//     }

//     return "";
//   };

//   // ---------------- build create payload ----------------
//   const buildCreatePayload = () => {
//     const leaderIdNum = leaderUserId ? Number(leaderUserId) : undefined;

//     return cleanPayload({
//       title: title.trim(),
//       mode,
//       description: description.trim(),
//       location: mode === "IN_PERSON" ? location.trim() : "",
//       acknowledgement_text: ackText?.trim() || "",

//       // ✅ NEW: leader id only for IN_PERSON
//       [LEADER_PAYLOAD_FIELD]: mode === "IN_PERSON" ? leaderIdNum : undefined,

//       project_ids: safeArr(selectedProjectIds).map((x) => Number(x)).filter(Boolean),

//       scheduled_at: toNaiveDT(scheduledAt),
//       due_at: toNaiveDT(dueAt),

//       duration_minutes: durationMinutes ? Number(durationMinutes) : undefined,
//       is_mandatory: !!isMandatory,

//       pass_mark: passMark === "" ? undefined : Number(passMark),
//       max_attempts: maxAttempts === "" ? undefined : Number(maxAttempts),

//       assignee_user_ids: assignMode === "SELECT" ? safeArr(selectedUserIds).map(Number) : undefined,
//       skipped_assignee_user_ids:
//         assignMode === "ALL" ? safeArr(skippedUserIds).map(Number) : undefined,

//       status: "DRAFT",
//     });
//   };

//   // ---------------- upload assets/photos ----------------
//   const uploadFilesIfPossible = async (sessionId) => {
//     if (API.uploadSafetySessionAsset) {
//       const fileAssets = safeArr(assets).filter((a) => a?.file);
//       for (const a of fileAssets) {
//         try {
//           await API.uploadSafetySessionAsset(sessionId, {
//             asset_type: a.asset_type,
//             title: a.title || "",
//             file: a.file,
//           });
//         } catch (e) {
//           toast.error(humanErr(e, `Asset upload failed: ${a.title}`));
//         }
//       }
//       if (fileAssets.length) toast.success("Assets uploaded ✅");
//     }

//     if (API.uploadSafetySessionPhoto) {
//       for (const img of safeArr(photoFiles)) {
//         try {
//           await API.uploadSafetySessionPhoto(sessionId, { image: img, caption: "" });
//         } catch (e) {
//           toast.error(humanErr(e, `Photo upload failed: ${img.name}`));
//         }
//       }
//       if (photoFiles.length) toast.success("Photos uploaded ✅");
//     }
//   };

//   // ---------------- EXCEL TEMPLATE ----------------
//   const downloadQuizExcelTemplate = async () => {
//     try {
//       const XLSX = await loadXLSX();

//       const rows = [
//         {
//           question_text: "What is the first step in fire emergency?",
//           question_type: "SINGLE",
//           option_1: "Raise alarm",
//           option_2: "Run away silently",
//           option_3: "",
//           option_4: "",
//           correct_options: "1",
//         },
//         {
//           question_text: "Select PPE items (multi correct)",
//           question_type: "MULTI",
//           option_1: "Helmet",
//           option_2: "Safety shoes",
//           option_3: "Flip flops",
//           option_4: "",
//           correct_options: "1,2",
//         },
//       ];

//       const ws = XLSX.utils.json_to_sheet(rows);
//       const wb = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(wb, ws, "Questions");
//       XLSX.writeFile(wb, "safety_quiz_template.xlsx");
//       toast.success("Template downloaded ✅");
//     } catch (e) {
//       toast.error(humanErr(e, "Template download failed"));
//     }
//   };

//   // ---------------- EXCEL PARSE -> quizQuestions ----------------
//   const parseExcelToQuestions = async (file) => {
//     setBulkUploading(true);
//     try {
//       const XLSX = await loadXLSX();
//       const buf = await file.arrayBuffer();
//       const wb = XLSX.read(buf, { type: "array" });
//       const sheetName = wb.SheetNames?.[0];
//       if (!sheetName) throw new Error("No sheet found in Excel");

//       const ws = wb.Sheets[sheetName];
//       const rawRows = XLSX.utils.sheet_to_json(ws, { defval: "" });

//       if (!rawRows.length) throw new Error("Excel sheet is empty");

//       // normalize headers: {normalizedKey: originalKey}
//       const firstRow = rawRows[0] || {};
//       const headerMap = {};
//       Object.keys(firstRow).forEach((k) => {
//         headerMap[normKey(k)] = k;
//       });

//       const getCell = (row, keyCandidates) => {
//         for (const kc of keyCandidates) {
//           const orig = headerMap[normKey(kc)];
//           if (orig && row[orig] !== undefined) return row[orig];
//         }
//         return "";
//       };

//       const questionsOut = [];
//       let autoFixedCorrect = 0;

//       for (const row of rawRows) {
//         const qText = String(getCell(row, ["question_text", "question", "text", "q_text"])).trim();
//         if (!qText) continue;

//         const qTypeRaw = String(getCell(row, ["question_type", "type", "qtype"]) || "")
//           .trim()
//           .toUpperCase();

//         const qtype = qTypeRaw === "MULTI" ? "MULTI" : "SINGLE";

//         const options = [];
//         for (let i = 1; i <= 20; i++) {
//           const v = getCell(row, [`option_${i}`, `option ${i}`, `option${i}`]) ?? "";
//           const txt = String(v).trim();
//           if (txt) options.push({ idx: i, text: txt });
//         }

//         const correctRaw = String(
//           getCell(row, ["correct_options", "correct_option", "correct", "correct_indexes"])
//         )
//           .trim()
//           .replace(/\s+/g, "");

//         let correctIdxs = [];
//         if (correctRaw) {
//           correctIdxs = correctRaw
//             .split(",")
//             .map((x) => Number(x))
//             .filter((n) => Number.isFinite(n) && n > 0);
//         }

//         const mappedOptions = options.map((o) => ({
//           tempId: makeTempId(),
//           text: o.text,
//           is_correct: correctIdxs.includes(o.idx),
//         }));

//         const correctCount = mappedOptions.filter((x) => x.is_correct).length;
//         if (mappedOptions.length && correctCount === 0) {
//           mappedOptions[0].is_correct = true;
//           autoFixedCorrect += 1;
//         }

//         if (qtype === "SINGLE") {
//           let found = false;
//           for (const o of mappedOptions) {
//             if (!o.is_correct) continue;
//             if (!found) found = true;
//             else o.is_correct = false;
//           }
//           if (!found && mappedOptions.length) mappedOptions[0].is_correct = true;
//         }

//         questionsOut.push({
//           tempId: makeTempId(),
//           text: qText,
//           qtype,
//           options: mappedOptions.length
//             ? mappedOptions
//             : [
//                 { tempId: makeTempId(), text: "", is_correct: true },
//                 { tempId: makeTempId(), text: "", is_correct: false },
//               ],
//         });
//       }

//       if (!questionsOut.length) throw new Error("No valid questions found in Excel");

//       setQuizQuestions((prev) => (bulkAppend ? [...safeArr(prev), ...questionsOut] : questionsOut));

//       toast.success(`Excel loaded ✅ Questions: ${questionsOut.length}`);
//       if (autoFixedCorrect) {
//         toast(`⚠️ ${autoFixedCorrect} question(s): correct option missing, first option auto-marked ✓`, {
//           icon: "⚠️",
//         });
//       }
//     } catch (e) {
//       toast.error(humanErr(e, "Excel parse failed"));
//     } finally {
//       setBulkUploading(false);
//     }
//   };

//   // ---------------- build bulk upload payload ----------------
//   const buildBulkQuizPayload = () => {
//     const qs = safeArr(quizQuestions);

//     const questions = qs.map((q) => {
//       const qText = String(q?.text || "").trim();
//       const qtype = q?.qtype || "SINGLE";

//       const opts = safeArr(q?.options)
//         .map((o) => ({
//           option_text: String(o?.text || "").trim(),
//           is_correct: !!o?.is_correct,
//         }))
//         .filter((o) => o.option_text);

//       const options = opts.map((o, idx) => ({ ...o, order: idx }));

//       return cleanPayload({
//         question_text: qText,
//         question_type: qtype,
//         options,
//       });
//     });

//     return { questions };
//   };

//   // ---------------- QUIZ save (bulk first, fallback old) ----------------
//   const setupQuizIfPossible = async (sessionId) => {
//     if (!quizEnabled) return;

//     if (!API.setupSafetyQuiz) {
//       toast.error("setupSafetyQuiz() missing in api/index.js");
//       return;
//     }

//     try {
//       const payload = cleanPayload({
//         pass_mark: passMark === "" ? undefined : Number(passMark),
//         max_attempts: maxAttempts === "" ? undefined : Number(maxAttempts),
//       });
//       await API.setupSafetyQuiz(sessionId, payload);
//     } catch (e) {
//       try {
//         await API.setupSafetyQuiz(sessionId, {});
//       } catch (e2) {
//         toast.error(humanErr(e2, "Quiz setup failed"));
//         return;
//       }
//     }

//     if (API.bulkUploadSafetyQuizQuestions) {
//       try {
//         const bulkPayload = buildBulkQuizPayload();
//         await API.bulkUploadSafetyQuizQuestions(sessionId, bulkPayload);
//         toast.success("Quiz saved (bulk) ✅");
//         return;
//       } catch (e) {
//         toast.error(`Bulk upload failed, trying fallback...`);
//       }
//     }

//     if (!API.addSafetyQuizQuestion || !API.addSafetyQuizOption) {
//       toast.error("Quiz APIs missing in api/index.js (addSafetyQuizQuestion/addSafetyQuizOption)");
//       return;
//     }

//     for (const q of safeArr(quizQuestions)) {
//       const qText = String(q?.text || "").trim();
//       const qtype = q?.qtype || "SINGLE";

//       const opts = safeArr(q?.options)
//         .map((o) => ({ ...o, text: String(o?.text || "").trim() }))
//         .filter((o) => o.text);

//       let createdQ = null;
//       try {
//         const res = await API.addSafetyQuizQuestion(sessionId, {
//           question_text: qText,
//           question_type: qtype,
//         });
//         createdQ = res?.data || null;
//       } catch (e) {
//         toast.error(
//           e?.response?.data
//             ? `Question create failed: ${JSON.stringify(e.response.data)}`
//             : e?.message || "Question create failed"
//         );
//         continue;
//       }

//       const questionId = createdQ?.id || createdQ?.question_id || null;
//       if (!questionId) {
//         toast.error(`Quiz question id missing for: ${qText}`);
//         continue;
//       }

//       for (const o of opts) {
//         const oText = String(o.text || "").trim();
//         const isCorrect = !!o.is_correct;

//         const optPayloadTries = [
//           { question_id: questionId, option_text: oText, is_correct: isCorrect },
//           { question_id: questionId, text: oText, is_correct: isCorrect },
//           { question_id: questionId, name: oText, is_correct: isCorrect },
//           { question_id: questionId, option: oText, is_correct: isCorrect },
//           { question_id: questionId, option_text: oText, correct: isCorrect },
//         ];

//         let ok = false;
//         for (const op of optPayloadTries) {
//           try {
//             await API.addSafetyQuizOption(sessionId, op);
//             ok = true;
//             break;
//           } catch {
//             // keep trying
//           }
//         }

//         if (!ok) toast.error(`Option create failed: "${oText}" (Q: ${qText})`);
//       }
//     }

//     toast.success("Quiz saved ✅");
//   };

//   // ---------------- create session ----------------
//   const createSession = async ({ publish = false } = {}) => {
//     const msg = validate();
//     if (msg) {
//       setErr(msg);
//       toast.error(msg);
//       return;
//     }

//     setSaving(true);
//     setErr("");

//     try {
//       const first = safeArr(selectedProjectIds)[0];
//       if (first) {
//         try {
//           API.setActiveProjectId?.(first);
//         } catch {}
//       }

//       const payload = buildCreatePayload();
//       const res = await API.createSafetySession(payload);
//       const created = res?.data || {};
//       const id = created?.id;

//       toast.success(publish ? "Created ✅" : "Created (Draft) ✅");

//       if (id) {
//         await setupQuizIfPossible(id);
//         await uploadFilesIfPossible(id);

//         if (assignMode === "SELECT" && API.assignSafetySessionUsers) {
//           try {
//             await API.assignSafetySessionUsers(id, safeArr(selectedUserIds).map(Number));
//           } catch {}
//         }
//       }

//       if (publish && id) {
//         await API.publishSafetySession?.(id);
//         toast.success("Published ✅");
//       }

//       navigate("/safety/sessions");
//     } catch (e) {
//       const m = humanErr(e, "Create failed");
//       setErr(m);
//       toast.error(m);
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ---------------- UI helpers ----------------
//   const SummaryRow = ({ label, value }) => (
//     <div className="sumRow">
//       <div className="sumLabel">{label}</div>
//       <div className="sumValue">{value}</div>
//     </div>
//   );

//   const selectedProjectsCount = safeArr(selectedProjectIds).length;
//   const selectedUsersCount = safeArr(selectedUserIds).length;
//   const skippedUsersCount = safeArr(skippedUserIds).length;

//   // ---------------- Step content ----------------
//   const renderStep = () => {
//     if (stepKey === "details") {
//       return (
//         <div className="card">
//           <div className="cardHeader">
//             <div className="cardTitle">Session Details</div>
//             <div className="hint">Step 1 of {STEPS.length}</div>
//           </div>

//           <div className="form">
//             <div className="field">
//               <label>Title *</label>
//               <input value={title} onChange={(e) => setTitle(e.target.value)} />
//             </div>

//             <div className="row2">
//               <div className="field">
//                 <label>Mode *</label>
//                 <select value={mode} onChange={(e) => setMode(e.target.value)}>
//                   {MODES.map((m) => (
//                     <option key={m.value} value={m.value}>
//                       {m.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="field">
//                 <label>Mandatory</label>
//                 <div className="switchWrap">
//                   <label className="switch">
//                     <input
//                       type="checkbox"
//                       checked={isMandatory}
//                       onChange={(e) => setIsMandatory(e.target.checked)}
//                     />
//                     <span className="slider" />
//                   </label>
//                   <div className="switchText">{isMandatory ? "ON" : "OFF"}</div>
//                 </div>
//               </div>
//             </div>

//             {mode === "IN_PERSON" ? (
//               <>
//                 <div className="field">
//                   <label>Location *</label>
//                   <input value={location} onChange={(e) => setLocation(e.target.value)} />
//                 </div>

//                 {/* ✅ Leader Picker */}
//                 <div className="card" style={{ borderStyle: "dashed" }}>
//                   <div className="cardHeader">
//                     <div className="cardTitle">Select Leader *</div>
//                     <div className="hint">Required for In Person</div>
//                   </div>

//                   <div className="form">
//                     <div className="row2">
//                       <div className="field grow">
//                         <label>Search Leader</label>
//                         <input
//                           value={leaderSearch}
//                           onChange={(e) => setLeaderSearch(e.target.value)}
//                           placeholder="Search by name/email/username..."
//                         />
//                       </div>

//                       <div className="field">
//                         <label>Manual Leader ID</label>
//                         <div className="rowInline">
//                           <input
//                             value={manualLeaderId}
//                             onChange={(e) => setManualLeaderId(e.target.value)}
//                             inputMode="numeric"
//                             placeholder="e.g. 875"
//                           />
//                           <button className="btn primary" type="button" onClick={addManualLeader}>
//                             Set
//                           </button>
//                         </div>
//                       </div>
//                     </div>

//                     {loadingUsers ? (
//                       <div className="loading">Loading users...</div>
//                     ) : usersErr ? (
//                       <div className="warnBox">{usersErr}</div>
//                     ) : users.length === 0 ? (
//                       <div className="empty">
//                         No users found for selected project. Select project first (Step 2).
//                       </div>
//                     ) : (
//                       <div className="leaderList">
//                         {filteredLeaderUsers.map((u) => {
//                           const id = Number(u?.id);
//                           const active = String(leaderUserId) === String(id);
//                           return (
//                             <label key={id} className={`userItem ${active ? "active" : ""}`}>
//                               <input
//                                 type="radio"
//                                 name="leaderUser"
//                                 checked={active}
//                                 onChange={() => setLeaderUserId(String(id))}
//                               />
//                               <div className="userText">
//                                 <div className="userLabel">{pickUserLabel(u)}</div>
//                                 <div className="userSub">
//                                   ID: {id}
//                                   {u?.email ? ` • ${u.email}` : ""}
//                                   {u?.role ? ` • ${u.role}` : ""}
//                                 </div>
//                               </div>
//                             </label>
//                           );
//                         })}
//                       </div>
//                     )}

//                     <div className="note">
//                       Selected Leader:{" "}
//                       <b>
//                         {leaderUser
//                           ? `${pickUserLabel(leaderUser)} (ID: ${leaderUser.id})`
//                           : leaderUserId
//                           ? `User #${leaderUserId}`
//                           : "-"}
//                       </b>
//                     </div>
//                   </div>
//                 </div>
//               </>
//             ) : null}

//             <div className="field">
//               <label>Description</label>
//               <textarea
//                 value={description}
//                 onChange={(e) => setDescription(e.target.value)}
//                 rows={4}
//               />
//             </div>

//             <div className="row2">
//               <div className="field">
//                 <label>Scheduled At</label>
//                 <input
//                   type="datetime-local"
//                   value={scheduledAt}
//                   onChange={(e) => setScheduledAt(e.target.value)}
//                 />
//               </div>

//               <div className="field">
//                 <label>Due At</label>
//                 <input
//                   type="datetime-local"
//                   value={dueAt}
//                   onChange={(e) => setDueAt(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="row3">
//               <div className="field">
//                 <label>Duration (minutes)</label>
//                 <input
//                   value={durationMinutes}
//                   onChange={(e) => setDurationMinutes(e.target.value)}
//                   inputMode="numeric"
//                 />
//               </div>

//               <div className="field">
//                 <label>Pass Mark (%)</label>
//                 <input
//                   value={passMark}
//                   onChange={(e) => setPassMark(e.target.value)}
//                   inputMode="numeric"
//                   placeholder="e.g. 70"
//                 />
//               </div>

//               <div className="field">
//                 <label>Max Attempts</label>
//                 <input
//                   value={maxAttempts}
//                   onChange={(e) => setMaxAttempts(e.target.value)}
//                   inputMode="numeric"
//                   placeholder="e.g. 3"
//                 />
//               </div>
//             </div>

//             <div className="field">
//               <label>Acknowledgement Text</label>
//               <textarea value={ackText} onChange={(e) => setAckText(e.target.value)} rows={3} />
//             </div>
//           </div>
//         </div>
//       );
//     }

//     if (stepKey === "projects") {
//       return (
//         <div className="card">
//           <div className="cardHeader">
//             <div className="cardTitle">Projects *</div>
//             <div className="hint">Step 2 of {STEPS.length}</div>
//           </div>

//           <div className="form">
//             <div className="projTop">
//               <input
//                 value={projectSearch}
//                 onChange={(e) => setProjectSearch(e.target.value)}
//                 placeholder="Search project..."
//               />
//               <div className="projBtns">
//                 <button className="btn tiny" type="button" onClick={selectAllFilteredProjects}>
//                   Select All
//                 </button>
//                 <button className="btn tiny danger" type="button" onClick={clearProjects}>
//                   Clear
//                 </button>
//               </div>
//             </div>

//             {loadingProjects ? (
//               <div className="loading">Loading projects...</div>
//             ) : (
//               <div className="projList">
//                 {filteredProjects.map((p) => {
//                   const id = Number(p?.id);
//                   const checked = safeArr(selectedProjectIds).includes(id);
//                   return (
//                     <label key={id} className={`projItem ${checked ? "active" : ""}`}>
//                       <input type="checkbox" checked={checked} onChange={() => toggleProject(id)} />
//                       <div className="projText">
//                         <div className="projLabel">{pickProjectLabel(p)}</div>
//                         <div className="projSub">ID: {id}</div>
//                       </div>
//                     </label>
//                   );
//                 })}
//               </div>
//             )}

//             <div className="note">
//               Selected Projects: <b>{selectedProjectsCount}</b>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     if (stepKey === "users") {
//       return (
//         <div className="card">
//           <div className="cardHeader">
//             <div className="cardTitle">Users</div>
//             <div className="hint">Step 3 of {STEPS.length}</div>
//           </div>

//           <div className="form">
//             <div className="field">
//               <label>Assign Mode</label>
//               <select value={assignMode} onChange={(e) => setAssignMode(e.target.value)}>
//                 {ASSIGN_MODES.map((m) => (
//                   <option key={m.value} value={m.value}>
//                     {m.label}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="row2">
//               <div className="field grow">
//                 <label>Search Users</label>
//                 <input
//                   value={userSearch}
//                   onChange={(e) => setUserSearch(e.target.value)}
//                   placeholder="Search by name/email/username..."
//                 />
//               </div>

//               <div className="field">
//                 <label>Reload</label>
//                 <button className="btn" type="button" onClick={fetchUsers} disabled={loadingUsers}>
//                   {loadingUsers ? "Loading..." : "Refresh Users"}
//                 </button>
//               </div>
//             </div>

//             {usersErr ? <div className="warnBox">{usersErr}</div> : null}

//             <div className="row2">
//               <div className="field grow">
//                 <label>Manual Add User ID</label>
//                 <input
//                   value={manualUserId}
//                   onChange={(e) => setManualUserId(e.target.value)}
//                   inputMode="numeric"
//                   placeholder="e.g. 875"
//                 />
//               </div>
//               <div className="field">
//                 <label>&nbsp;</label>
//                 <button
//                   className="btn primary"
//                   type="button"
//                   onClick={() => addManualUserId(assignMode === "SELECT" ? "selected" : "skipped")}
//                 >
//                   Add ID
//                 </button>
//               </div>
//             </div>

//             {loadingUsers ? (
//               <div className="loading">Loading users...</div>
//             ) : users.length === 0 ? (
//               <div className="empty">No users found.</div>
//             ) : (
//               <div className="usersList">
//                 {filteredUsers.map((u) => {
//                   const id = Number(u?.id);
//                   const bucket = assignMode === "SELECT" ? "selected" : "skipped";
//                   const checked =
//                     bucket === "selected"
//                       ? safeArr(selectedUserIds).includes(id)
//                       : safeArr(skippedUserIds).includes(id);

//                   return (
//                     <label key={id} className={`userItem ${checked ? "active" : ""}`}>
//                       <input
//                         type="checkbox"
//                         checked={checked}
//                         onChange={() => toggleUserId(id, bucket)}
//                       />
//                       <div className="userText">
//                         <div className="userLabel">{pickUserLabel(u)}</div>
//                         <div className="userSub">
//                           ID: {id}
//                           {u?.email ? ` • ${u.email}` : ""}
//                           {u?.role ? ` • ${u.role}` : ""}
//                         </div>
//                       </div>
//                     </label>
//                   );
//                 })}
//               </div>
//             )}

//             <div className="note">
//               {assignMode === "ALL" ? (
//                 <>
//                   Assigning to all users. Skipped: <b>{skippedUsersCount}</b>
//                 </>
//               ) : (
//                 <>
//                   Selected users: <b>{selectedUsersCount}</b>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       );
//     }

//     if (stepKey === "quiz") {
//       return (
//         <div className="card">
//           <div className="cardHeader">
//             <div className="cardTitle">Quiz (optional)</div>
//             <div className="hint">Step 4 of {STEPS.length}</div>
//           </div>

//           <div className="form">
//             <div className="switchRow">
//               <label className="switch">
//                 <input
//                   type="checkbox"
//                   checked={quizEnabled}
//                   onChange={(e) => setQuizEnabled(e.target.checked)}
//                 />
//                 <span className="slider" />
//               </label>

//               <div>
//                 <div style={{ fontWeight: 800 }}>Enable Quiz</div>
//                 <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
//                   If ON, we will call: quiz_setup → quiz_bulk_upload (fallback: add_question/add_option)
//                 </div>
//               </div>
//             </div>

//             {quizEnabled ? (
//               <>
//                 <div className="bulkBox">
//                   <div className="bulkTop">
//                     <div>
//                       <div style={{ fontWeight: 900 }}>Excel Upload</div>
//                       <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
//                         Upload .xlsx and questions will appear here.
//                       </div>
//                     </div>

//                     <div className="bulkBtns">
//                       <button className="btn tiny" type="button" onClick={downloadQuizExcelTemplate}>
//                         Download Template
//                       </button>
//                     </div>
//                   </div>

//                   <div className="row2">
//                     <div className="field">
//                       <label>Upload Excel (.xlsx)</label>
//                       <input
//                         type="file"
//                         accept=".xlsx,.xls"
//                         disabled={bulkUploading}
//                         onChange={(e) => {
//                           const f = e.target.files?.[0];
//                           if (!f) return;
//                           parseExcelToQuestions(f);
//                           e.target.value = "";
//                         }}
//                       />
//                       <div className="miniNote">
//                         Columns: question_text, question_type, option_1.., correct_options
//                       </div>
//                     </div>

//                     <div className="field">
//                       <label>Mode</label>
//                       <div className="switchWrap">
//                         <label className="switch">
//                           <input
//                             type="checkbox"
//                             checked={bulkAppend}
//                             onChange={(e) => setBulkAppend(e.target.checked)}
//                           />
//                           <span className="slider" />
//                         </label>
//                         <div className="switchText">{bulkAppend ? "APPEND" : "REPLACE"}</div>
//                       </div>
//                       <div className="miniNote">
//                         Replace = Excel overwrite current questions. Append = add to list.
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <button className="btn primary" type="button" onClick={addQuizQuestion}>
//                   + Add Question
//                 </button>

//                 {quizQuestions.length ? (
//                   <div className="qList">
//                     {quizQuestions.map((q, qi) => (
//                       <div key={q.tempId} className="qCard">
//                         <div className="qTop">
//                           <div style={{ fontWeight: 900 }}>Q{qi + 1}</div>
//                           <button
//                             className="btn tiny danger"
//                             type="button"
//                             onClick={() => removeQuizQuestion(q.tempId)}
//                           >
//                             Remove
//                           </button>
//                         </div>

//                         <div className="row2">
//                           <div className="field">
//                             <label>Question Text *</label>
//                             <input
//                               value={q.text}
//                               onChange={(e) =>
//                                 updateQuizQuestion(q.tempId, { text: e.target.value })
//                               }
//                               placeholder="e.g. What is the first step in fire emergency?"
//                             />
//                           </div>

//                           <div className="field">
//                             <label>Type</label>
//                             <select
//                               value={q.qtype}
//                               onChange={(e) =>
//                                 updateQuizQuestion(q.tempId, { qtype: e.target.value })
//                               }
//                             >
//                               {QUIZ_Q_TYPES.map((t) => (
//                                 <option key={t.value} value={t.value}>
//                                   {t.label}
//                                 </option>
//                               ))}
//                             </select>
//                           </div>
//                         </div>

//                         <div className="optBox">
//                           <div className="optHead">
//                             <div style={{ fontWeight: 800 }}>Options *</div>
//                             <button
//                               className="btn tiny"
//                               type="button"
//                               onClick={() => addQuizOption(q.tempId)}
//                             >
//                               + Add Option
//                             </button>
//                           </div>

//                           {safeArr(q.options).map((o, oi) => (
//                             <div key={o.tempId} className="optRow">
//                               <button
//                                 className={`markBtn ${o.is_correct ? "on" : ""}`}
//                                 type="button"
//                                 onClick={() => toggleCorrect(q.tempId, o.tempId)}
//                                 title={q.qtype === "SINGLE" ? "Select correct option" : "Toggle correct"}
//                               >
//                                 ✓
//                               </button>

//                               <input
//                                 value={o.text}
//                                 onChange={(e) =>
//                                   updateQuizOption(q.tempId, o.tempId, { text: e.target.value })
//                                 }
//                                 placeholder={`Option ${oi + 1}`}
//                               />

//                               <button
//                                 className="btn tiny danger"
//                                 type="button"
//                                 onClick={() => removeQuizOption(q.tempId, o.tempId)}
//                                 disabled={safeArr(q.options).length <= 2}
//                                 title="Keep at least 2 options"
//                               >
//                                 Remove
//                               </button>
//                             </div>
//                           ))}

//                           <div className="miniNote">
//                             {q.qtype === "SINGLE"
//                               ? "Single Correct: only 1 option can be ✓"
//                               : "Multiple Correct: you can mark multiple ✓"}
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <div className="empty">No questions yet. Add manually OR upload Excel.</div>
//                 )}
//               </>
//             ) : (
//               <div className="empty">Quiz is OFF.</div>
//             )}
//           </div>
//         </div>
//       );
//     }

//     if (stepKey === "assets") {
//       return (
//         <>
//           <div className="card">
//             <div className="cardHeader">
//               <div className="cardTitle">Assets Upload</div>
//               <div className="hint">Step 5 of {STEPS.length}</div>
//             </div>

//             <div className="form">
//               <div className="row2">
//                 <div className="field">
//                   <label>Asset Type</label>
//                   <select value={assetType} onChange={(e) => setAssetType(e.target.value)}>
//                     {ASSET_TYPES.map((a) => (
//                       <option key={a.value} value={a.value}>
//                         {a.label}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div className="field">
//                   <label>Title (optional)</label>
//                   <input
//                     value={assetTitle}
//                     onChange={(e) => setAssetTitle(e.target.value)}
//                     placeholder="e.g. Safety Induction PPT"
//                   />
//                 </div>
//               </div>

//               <div className="field">
//                 <label>Choose File *</label>
//                 <input
//                   type="file"
//                   accept={
//                     assetType === "VIDEO"
//                       ? "video/*"
//                       : assetType === "PPT"
//                       ? ".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
//                       : assetType === "PDF"
//                       ? "application/pdf,.pdf"
//                       : "*/*"
//                   }
//                   onChange={(e) => setAssetFile(e.target.files?.[0] || null)}
//                 />
//                 {assetFile ? <div className="miniNote">Selected: {assetFile.name}</div> : null}
//               </div>

//               <button className="btn primary" type="button" onClick={addAsset}>
//                 + Add Asset
//               </button>

//               {assets.length ? (
//                 <div className="list">
//                   {assets.map((a) => (
//                     <div key={a.tempId} className="listItem">
//                       <div className="listLeft">
//                         <div className="pill">{a.asset_type}</div>
//                         <div>
//                           <div className="listTitle">{a.title}</div>
//                           <div className="listSub">{a.file?.name}</div>
//                         </div>
//                       </div>
//                       <button
//                         className="btn tiny danger"
//                         type="button"
//                         onClick={() => removeAsset(a.tempId)}
//                       >
//                         Remove
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="empty">No assets added.</div>
//               )}
//             </div>
//           </div>

//           <div className="card">
//             <div className="cardHeader">
//               <div className="cardTitle">Photos (optional)</div>
//               <div className="hint">Uploads after session is created</div>
//             </div>

//             <div className="form">
//               <div className="field">
//                 <label>Upload Photos</label>
//                 <input
//                   type="file"
//                   multiple
//                   accept="image/*"
//                   onChange={(e) => {
//                     const files = Array.from(e.target.files || []);
//                     if (!files.length) return;
//                     setPhotoFiles((prev) => [...safeArr(prev), ...files]);
//                   }}
//                 />
//               </div>

//               {photoFiles.length ? (
//                 <div className="list">
//                   {photoFiles.map((f, idx) => (
//                     <div key={`${f.name}-${idx}`} className="listItem">
//                       <div className="listLeft">
//                         <div className="pill">PHOTO</div>
//                         <div>
//                           <div className="listTitle">{f.name}</div>
//                           <div className="listSub">{Math.round((f.size || 0) / 1024)} KB</div>
//                         </div>
//                       </div>
//                       <button
//                         className="btn tiny danger"
//                         type="button"
//                         onClick={() => removePhoto(idx)}
//                       >
//                         Remove
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="empty">No photos selected.</div>
//               )}
//             </div>
//           </div>
//         </>
//       );
//     }

//     // REVIEW
//     return (
//       <div className="card">
//         <div className="cardHeader">
//           <div className="cardTitle">Review & Create</div>
//           <div className="hint">Step 6 of {STEPS.length}</div>
//         </div>

//         <div className="form">
//           <div className="reviewGrid">
//             <div className="reviewCard">
//               <div className="reviewTitle">Session</div>
//               <SummaryRow label="Title" value={title || "-"} />
//               <SummaryRow label="Mode" value={mode || "-"} />
//               <SummaryRow label="Location" value={mode === "IN_PERSON" ? location || "-" : "-"} />
//               <SummaryRow
//                 label="Leader"
//                 value={
//                   mode === "IN_PERSON"
//                     ? leaderUser
//                       ? `${pickUserLabel(leaderUser)} (ID: ${leaderUser.id})`
//                       : leaderUserId
//                       ? `User #${leaderUserId}`
//                       : "-"
//                     : "-"
//                 }
//               />
//               <SummaryRow label="Mandatory" value={isMandatory ? "Yes" : "No"} />
//               <SummaryRow label="Scheduled" value={scheduledAt || "-"} />
//               <SummaryRow label="Due" value={dueAt || "-"} />
//             </div>

//             <div className="reviewCard">
//               <div className="reviewTitle">Assignment</div>
//               <SummaryRow label="Projects selected" value={String(selectedProjectsCount)} />
//               <SummaryRow label="Assign mode" value={assignMode} />
//               <SummaryRow
//                 label={assignMode === "SELECT" ? "Selected users" : "Skipped users"}
//                 value={assignMode === "SELECT" ? String(selectedUsersCount) : String(skippedUsersCount)}
//               />
//             </div>

//             <div className="reviewCard">
//               <div className="reviewTitle">Quiz</div>
//               <SummaryRow label="Enabled" value={quizEnabled ? "Yes" : "No"} />
//               <SummaryRow
//                 label="Questions"
//                 value={quizEnabled ? String(safeArr(quizQuestions).length) : "-"}
//               />
//               <SummaryRow label="Pass mark" value={passMark || "-"} />
//               <SummaryRow label="Max attempts" value={maxAttempts || "-"} />
//             </div>

//             <div className="reviewCard">
//               <div className="reviewTitle">Uploads</div>
//               <SummaryRow label="Assets" value={String(safeArr(assets).length)} />
//               <SummaryRow label="Photos" value={String(safeArr(photoFiles).length)} />
//             </div>
//           </div>

//           <div className="note">
//             Tip: Click any step on top to edit quickly. Final create will run full validation.
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <>
//       <div className="safetyCreatePage">
//         {/* Header */}
//         <div className="topBar">
//           <div>
//             <div className="title">Create Safety Session</div>
//             <div className="sub">Wizard • Clean flow • Draft first</div>
//           </div>

//           <div className="topActions">
//             <button className="btn" onClick={() => navigate("/safety/sessions")}>
//               ← Back
//             </button>

//             {/* keep draft always available */}
//             <button
//               className="btn primary"
//               disabled={saving}
//               onClick={() => createSession({ publish: false })}
//             >
//               {saving ? "Saving..." : "Save Draft"}
//             </button>
//           </div>
//         </div>

//         {/* Stepper */}
//         <div className="stepperWrap">
//           <div className="stepper">
//             {STEPS.map((s, idx) => {
//               const active = idx === step;
//               const done = idx < step;
//               return (
//                 <button
//                   key={s.key}
//                   type="button"
//                   className={`stepItem ${active ? "active" : ""} ${done ? "done" : ""}`}
//                   onClick={() => gotoStep(idx)}
//                 >
//                   <div className="stepCircle">{done ? "✓" : idx + 1}</div>
//                   <div className="stepLabel">{s.label}</div>
//                 </button>
//               );
//             })}
//           </div>
//           <div className="stepLine" />
//         </div>

//         {err ? <div className="errorBox">{err}</div> : null}

//         <div className="wizardGrid">
//           {/* Main */}
//           <div className="wizardMain">{renderStep()}</div>

//           {/* Sticky Summary (desktop) */}
//           <div className="wizardSide">
//             <div className="card sticky">
//               <div className="cardHeader">
//                 <div className="cardTitle">Live Summary</div>
//                 <div className="hint">Quick view</div>
//               </div>
//               <div className="form compact">
//                 <SummaryRow label="Title" value={title || "-"} />
//                 <SummaryRow label="Mode" value={mode || "-"} />
//                 {mode === "IN_PERSON" ? (
//                   <SummaryRow
//                     label="Leader"
//                     value={
//                       leaderUser ? `${pickUserLabel(leaderUser)}` : leaderUserId ? `#${leaderUserId}` : "-"
//                     }
//                   />
//                 ) : null}
//                 <SummaryRow label="Projects" value={String(selectedProjectsCount)} />
//                 <SummaryRow
//                   label={assignMode === "SELECT" ? "Selected Users" : "Skipped Users"}
//                   value={assignMode === "SELECT" ? String(selectedUsersCount) : String(skippedUsersCount)}
//                 />
//                 <SummaryRow label="Quiz" value={quizEnabled ? `ON (${safeArr(quizQuestions).length})` : "OFF"} />
//                 <SummaryRow label="Assets" value={String(safeArr(assets).length)} />
//                 <SummaryRow label="Photos" value={String(safeArr(photoFiles).length)} />

//                 {stepKey === "review" ? (
//                   <button
//                     className="btn warn"
//                     disabled={saving}
//                     onClick={() => createSession({ publish: true })}
//                     type="button"
//                   >
//                     {saving ? "Publishing..." : "Create + Publish"}
//                   </button>
//                 ) : (
//                   <button className="btn" type="button" onClick={() => gotoStep(STEPS.length - 1)}>
//                     Jump to Review →
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Footer nav */}
//         <div className="wizardFooter">
//           <div className="footerLeft">
//             <button className="btn" type="button" onClick={prevStep} disabled={step === 0}>
//               ← Back
//             </button>
//           </div>

//           <div className="footerRight">
//             {step < STEPS.length - 1 ? (
//               <button className="btn primary" type="button" onClick={nextStep}>
//                 Next →
//               </button>
//             ) : (
//               <button
//                 className="btn warn"
//                 disabled={saving}
//                 onClick={() => createSession({ publish: true })}
//                 type="button"
//               >
//                 {saving ? "Publishing..." : "Create + Publish"}
//               </button>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* inline CSS */}
//       <style>{`
//         .safetyCreatePage { padding: 16px; padding-bottom: 90px; }
//         .topBar{ display:flex; align-items:flex-start; justify-content:space-between; gap: 12px; margin-bottom: 14px; }
//         .title{ font-size: 20px; font-weight: 800; }
//         .sub{ margin-top: 4px; color:#666; font-size: 13px; }
//         .topActions{ display:flex; gap: 10px; flex-wrap: wrap; }

//         .btn{ border: 1px solid #ddd; background:#fff; padding: 10px 12px; border-radius: 12px; cursor:pointer; font-size: 13px; }
//         .btn:disabled{ opacity:.55; cursor:not-allowed; }
//         .btn.primary{ border-color: ${ORANGE}; background:${ORANGE}; color:#111; font-weight: 800; }
//         .btn.warn{ border-color: #0f62fe; background:#0f62fe; color:#fff; font-weight: 800; }
//         .btn.danger{ border-color: #ff4d4f; background:#ff4d4f; color:#fff; }
//         .btn.tiny{ padding: 8px 10px; border-radius: 10px; font-size: 12px; }

//         .errorBox{ margin: 10px 0; padding: 10px 12px; border: 1px solid #ffd5d5; background: #fff3f3; color: #a40000; border-radius: 12px; }
//         .warnBox{ padding: 10px 12px; border: 1px solid #ffe6b5; background: #fff8e8; color: #6a4a00; border-radius: 12px; font-size: 13px; }

//         .card{ background:#fff; border: 1px solid #eee; border-radius: 14px; overflow:hidden; }
//         .card.sticky{ position: sticky; top: 12px; }
//         .cardHeader{ display:flex; align-items:center; justify-content:space-between; padding: 12px; border-bottom: 1px solid #eee; background: linear-gradient(180deg, #fff, #fffaf0); }
//         .cardTitle{ font-weight: 800; }
//         .hint{ font-size: 12px; color:#666; }

//         .form{ padding: 12px; display:flex; flex-direction:column; gap: 12px; }
//         .form.compact{ gap: 8px; }
//         .field{ display:flex; flex-direction:column; gap: 6px; }
//         .field.grow{ flex: 1; }
//         .field label{ font-size: 12px; color:#555; }

//         input, select, textarea{ border: 1px solid #ddd; border-radius: 12px; padding: 10px 12px; outline:none; background:#fff; font-size: 14px; }
//         textarea{ resize: vertical; }

//         .row2{ display:grid; grid-template-columns: 1fr 1fr; gap: 12px; }
//         .row3{ display:grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
//         @media (max-width: 740px){ .row2, .row3{ grid-template-columns: 1fr; } }

//         .rowInline{ display:flex; gap: 8px; align-items:center; }
//         .rowInline input{ flex: 1; }

//         /* Stepper */
//         .stepperWrap{ margin: 10px 0 14px; position: relative; }
//         .stepper{
//           display: grid;
//           grid-template-columns: repeat(6, 1fr);
//           gap: 8px;
//           background: #fff;
//           padding: 10px;
//           border-radius: 14px;
//           border: 1px solid #eee;
//         }
//         @media (max-width: 900px){
//           .stepper{ grid-template-columns: repeat(3, 1fr); }
//         }
//         .stepLine{
//           height: 1px;
//           background: #eee;
//           margin-top: -8px;
//         }
//         .stepItem{
//           border: 1px solid #eee;
//           background: #fff;
//           border-radius: 14px;
//           padding: 10px;
//           display:flex;
//           align-items:center;
//           gap: 10px;
//           cursor: pointer;
//           text-align: left;
//         }
//         .stepItem:hover{ border-color: #ddd; }
//         .stepItem.active{ border-color: ${ORANGE}; box-shadow: 0 0 0 3px rgba(255,190,99,.20); }
//         .stepItem.done{ border-color: #d7f5dc; background: #f6fffb; }
//         .stepCircle{
//           width: 30px; height: 30px;
//           border-radius: 999px;
//           border: 1px solid #ddd;
//           display:flex; align-items:center; justify-content:center;
//           font-weight: 900;
//           background:#fff;
//         }
//         .stepItem.active .stepCircle{ border-color:${ORANGE}; background:${ORANGE}; }
//         .stepItem.done .stepCircle{ border-color: #34c759; background: #34c759; color:#fff; }
//         .stepLabel{ font-weight: 800; font-size: 13px; color:#222; }

//         /* Wizard Layout */
//         .wizardGrid{
//           display: grid;
//           grid-template-columns: 1fr 360px;
//           gap: 12px;
//           align-items: start;
//         }
//         @media (max-width: 1100px){
//           .wizardGrid{ grid-template-columns: 1fr; }
//           .wizardSide{ order: -1; }
//           .card.sticky{ position: static; }
//         }
//         .wizardMain{ display:flex; flex-direction: column; gap: 12px; }
//         .wizardSide{ display:flex; flex-direction: column; gap: 12px; }

//         /* Footer */
//         .wizardFooter{
//           position: fixed;
//           left: 0; right: 0; bottom: 0;
//           background: rgba(255,255,255,0.92);
//           backdrop-filter: blur(8px);
//           border-top: 1px solid #eee;
//           padding: 10px 16px;
//           display:flex;
//           justify-content: space-between;
//           align-items: center;
//           gap: 12px;
//         }
//         .footerLeft, .footerRight{ display:flex; gap: 10px; align-items:center; }

//         .note{ padding: 10px 12px; border: 1px dashed #eee; border-radius: 12px; color:#666; font-size: 12px; background: #fffdf7; }
//         .loading, .empty{ padding: 10px 4px; color:#444; }
//         .miniNote{ font-size: 12px; color:#666; margin-top: 6px; }

//         /* Projects / Users list */
//         .projTop{ display:flex; gap: 10px; align-items:center; }
//         .projBtns{ display:flex; gap: 8px; flex-wrap: wrap; }

//         .projList{ max-height: 460px; overflow:auto; padding: 4px 0; }
//         .projItem{ display:flex; gap: 10px; align-items:flex-start; border: 1px solid #eee; border-radius: 12px; padding: 10px; margin-top: 10px; cursor: pointer; background: #fff; }
//         .projItem.active{ border-color: ${ORANGE}; box-shadow: 0 0 0 3px rgba(255,190,99,.25); }
//         .projItem input{ margin-top: 4px; }
//         .projLabel{ font-weight: 800; }
//         .projSub{ font-size: 12px; color:#666; margin-top: 2px; }

//         .usersList{ max-height: 520px; overflow:auto; padding: 4px 0; border-top: 1px solid #f3f3f3; }
//         .leaderList{ max-height: 260px; overflow:auto; padding: 4px 0; border-top: 1px solid #f3f3f3; }
//         .userItem{ display:flex; gap: 10px; align-items:flex-start; border: 1px solid #eee; border-radius: 12px; padding: 10px; margin-top: 10px; cursor: pointer; background: #fff; }
//         .userItem.active{ border-color: ${ORANGE}; box-shadow: 0 0 0 3px rgba(255,190,99,.25); }
//         .userItem input{ margin-top: 4px; }
//         .userLabel{ font-weight: 800; }
//         .userSub{ font-size: 12px; color:#666; margin-top: 2px; }

//         /* List */
//         .list{ display:flex; flex-direction:column; gap: 10px; border-top: 1px solid #f3f3f3; padding-top: 10px; }
//         .listItem{ display:flex; align-items:flex-start; justify-content:space-between; gap: 10px; border: 1px solid #eee; border-radius: 12px; padding: 10px; }
//         .listLeft{ display:flex; gap: 10px; align-items:flex-start; min-width: 0; }
//         .listTitle{ font-weight: 800; }
//         .listSub{ font-size: 12px; color:#666; margin-top: 2px; word-break: break-word; }
//         .pill{ flex: 0 0 auto; border: 1px solid #ddd; border-radius: 999px; padding: 6px 10px; font-size: 12px; background: #fafafa; }

//         /* Switch */
//         .switchWrap{ display:flex; align-items:center; gap: 10px; }
//         .switchText{ font-size: 12px; color:#444; font-weight: 700; }
//         .switch { position: relative; display: inline-block; width: 44px; height: 26px; }
//         .switch input { opacity: 0; width: 0; height: 0; }
//         .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ddd; transition: .2s; border-radius: 999px; }
//         .slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 3px; bottom: 3px; background-color: white; transition: .2s; border-radius: 999px; }
//         input:checked + .slider { background-color: ${ORANGE}; }
//         input:checked + .slider:before { transform: translateX(18px); }

//         .switchRow{
//           display:flex; gap: 12px; align-items:flex-start;
//           padding: 10px;
//           border: 1px solid #eee;
//           border-radius: 14px;
//           background: #fff;
//         }

//         /* Quiz */
//         .bulkBox{
//           border: 1px dashed #eee;
//           border-radius: 14px;
//           padding: 12px;
//           background: #fffdf7;
//         }
//         .bulkTop{
//           display:flex;
//           align-items:flex-start;
//           justify-content:space-between;
//           gap: 10px;
//           margin-bottom: 10px;
//         }
//         .bulkBtns{ display:flex; gap: 8px; flex-wrap: wrap; }

//         .qList{ display:flex; flex-direction:column; gap: 12px; }
//         .qCard{
//           border: 1px solid #eee;
//           border-radius: 14px;
//           padding: 12px;
//           background: #fff;
//         }
//         .qTop{ display:flex; align-items:center; justify-content:space-between; margin-bottom: 10px; }
//         .optBox{
//           border-top: 1px dashed #eee;
//           margin-top: 12px;
//           padding-top: 12px;
//           display:flex;
//           flex-direction:column;
//           gap: 10px;
//         }
//         .optHead{
//           display:flex;
//           align-items:center;
//           justify-content:space-between;
//           gap: 10px;
//         }
//         .optRow{
//           display:flex;
//           gap: 10px;
//           align-items:center;
//         }
//         .markBtn{
//           width: 34px; height: 34px;
//           border-radius: 10px;
//           border: 1px solid #ddd;
//           background: #fff;
//           cursor: pointer;
//           font-weight: 900;
//         }
//         .markBtn.on{
//           border-color: ${ORANGE};
//           background: ${ORANGE};
//         }
//         .optRow input{ flex: 1; }

//         /* Summary */
//         .sumRow{ display:flex; justify-content:space-between; gap: 10px; padding: 8px 10px; border: 1px solid #f2f2f2; border-radius: 12px; background:#fff; }
//         .sumLabel{ font-size: 12px; color:#666; font-weight: 700; }
//         .sumValue{ font-size: 13px; color:#111; font-weight: 800; text-align:right; word-break: break-word; }

//         .reviewGrid{
//           display:grid;
//           grid-template-columns: 1fr 1fr;
//           gap: 12px;
//         }
//         @media (max-width: 820px){ .reviewGrid{ grid-template-columns: 1fr; } }
//         .reviewCard{
//           border: 1px solid #eee;
//           border-radius: 14px;
//           padding: 12px;
//           background: #fff;
//           display:flex;
//           flex-direction:column;
//           gap: 8px;
//         }
//         .reviewTitle{ font-weight: 900; margin-bottom: 4px; }
//       `}</style>
//     </>
//   );
// }



import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import * as API from "../api/index";

const ORANGE = "#ffbe63";

// ✅ if your backend expects a different key, change only this:
const LEADER_PAYLOAD_FIELD = "leader_user_id";

const MODES = [
  { value: "SELF_PACED", label: "Self Paced" },
  { value: "IN_PERSON", label: "In Person" },
];

const ASSIGN_MODES = [
  { value: "ALL", label: "Assign to All Users (in selected project)" },
  { value: "SELECT", label: "Select Specific Users" },
];

const ASSET_TYPES = [
  { value: "VIDEO", label: "Video" },
  { value: "PPT", label: "PPT" },
  { value: "PDF", label: "PDF" },
  { value: "OTHER", label: "Other" },
];

const QUIZ_Q_TYPES = [
  { value: "SINGLE", label: "Single Correct" },
  { value: "MULTI", label: "Multiple Correct" },
];

const STEPS = [
  { key: "details", label: "Details" },
  { key: "projects", label: "Projects" },
  { key: "users", label: "Users" },
  { key: "quiz", label: "Quiz" },
  { key: "assets", label: "Assets" },
  { key: "review", label: "Review" },
];

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

const pickUserLabel = (u) =>
  u?.display_name ||
  [u?.first_name, u?.last_name].filter(Boolean).join(" ").trim() ||
  u?.username ||
  u?.email ||
  `User #${u?.id ?? "-"}`;

// datetime-local -> naive "YYYY-MM-DDTHH:mm:00"
const toNaiveDT = (v) => {
  if (!v) return null;
  const s = String(v).trim();
  if (!s) return null;
  return s.length === 16 ? `${s}:00` : s;
};

const cleanPayload = (obj) => {
  const out = {};
  Object.keys(obj || {}).forEach((k) => {
    const v = obj[k];
    if (v === undefined || v === null) return;
    if (typeof v === "string" && !v.trim()) return;
    if (Array.isArray(v) && v.length === 0) return;
    out[k] = v;
  });
  return out;
};

const makeTempId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const humanErr = (e, fallback = "Something went wrong") => {
  return (
    e?.response?.data?.detail ||
    (e?.response?.data && JSON.stringify(e.response.data)) ||
    e?.message ||
    fallback
  );
};

// ---- XLSX loader (Vite friendly) ----
const loadXLSX = async () => {
  try {
    const mod = await import("xlsx");
    return mod?.default || mod;
  } catch (e) {
    throw new Error("Missing dependency: install `xlsx` => npm i xlsx");
  }
};

const normKey = (k) => String(k || "").trim().toLowerCase().replace(/\s+/g, "_");

// ✅ merge users across multiple projects (unique by id)
const mergeUniqueUsers = (lists) => {
  const m = new Map();
  for (const list of lists) {
    for (const u of safeArr(list)) {
      const id = Number(u?.id);
      if (!id) continue;
      if (!m.has(id)) m.set(id, u);
    }
  }
  return Array.from(m.values());
};

export default function SafetySessionCreatePage() {
  const navigate = useNavigate();

  // ---------- STEPPER ----------
  const [step, setStep] = useState(0);
  const stepKey = STEPS[step]?.key;

  const gotoStep = (idx) => {
    const n = Number(idx);
    if (!Number.isFinite(n)) return;
    if (n < 0 || n > STEPS.length - 1) return;
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const nextStep = () => {
    const msg = validateStep(step);
    if (msg) {
      setErr(msg);
      toast.error(msg);
      return;
    }
    gotoStep(Math.min(step + 1, STEPS.length - 1));
  };

  const prevStep = () => gotoStep(Math.max(step - 1, 0));

  // ---------- projects ----------
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const activeProjectId = String(API.resolveActiveProjectId?.() || "") || "";
  const [projectSearch, setProjectSearch] = useState("");
  const [selectedProjectIds, setSelectedProjectIds] = useState(
    activeProjectId ? [Number(activeProjectId)] : []
  );

  // ---------- core fields ----------
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState("SELF_PACED");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  // ✅ Leader (now shown in Users step also)
  const [leaderUserId, setLeaderUserId] = useState("");
  const [leaderSearch, setLeaderSearch] = useState("");
  const [manualLeaderId, setManualLeaderId] = useState("");

  const [scheduledAt, setScheduledAt] = useState("");
  const [dueAt, setDueAt] = useState("");

  const [ackText, setAckText] = useState(
    "I confirm I have understood the safety training/session."
  );

  // optional misc
  const [durationMinutes, setDurationMinutes] = useState("");
  const [isMandatory, setIsMandatory] = useState(true);

  // quiz related
  const [passMark, setPassMark] = useState("");
  const [maxAttempts, setMaxAttempts] = useState("");

  // ---------- users ----------
  const [assignMode, setAssignMode] = useState("ALL");
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersErr, setUsersErr] = useState("");
  const [userSearch, setUserSearch] = useState("");

  const [selectedUserIds, setSelectedUserIds] = useState([]); // for SELECT
  const [skippedUserIds, setSkippedUserIds] = useState([]); // for ALL (skip list)
  const [manualUserId, setManualUserId] = useState("");

  // ---------- assets ----------
  // each asset: { tempId, asset_type, title, file }
  const [assets, setAssets] = useState([]);
  const [assetType, setAssetType] = useState("VIDEO");
  const [assetTitle, setAssetTitle] = useState("");
  const [assetFile, setAssetFile] = useState(null);

  // photos upload UI
  const [photoFiles, setPhotoFiles] = useState([]);

  // ---------- QUIZ ----------
  const [quizEnabled, setQuizEnabled] = useState(false);

  // each question: { tempId, text, qtype: SINGLE|MULTI, options:[{tempId,text,is_correct}] }
  const [quizQuestions, setQuizQuestions] = useState([]);

  // ---- Excel bulk states ----
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkAppend, setBulkAppend] = useState(false);

  const addQuizQuestion = () => {
    setQuizQuestions((prev) => [
      ...safeArr(prev),
      {
        tempId: makeTempId(),
        text: "",
        qtype: "SINGLE",
        options: [
          { tempId: makeTempId(), text: "", is_correct: true },
          { tempId: makeTempId(), text: "", is_correct: false },
        ],
      },
    ]);
  };

  const removeQuizQuestion = (tempId) => {
    setQuizQuestions((prev) => safeArr(prev).filter((q) => q?.tempId !== tempId));
  };

  const updateQuizQuestion = (tempId, patch) => {
    setQuizQuestions((prev) =>
      safeArr(prev).map((q) => (q.tempId === tempId ? { ...q, ...patch } : q))
    );
  };

  const addQuizOption = (qTempId) => {
    setQuizQuestions((prev) =>
      safeArr(prev).map((q) => {
        if (q.tempId !== qTempId) return q;
        return {
          ...q,
          options: [...safeArr(q.options), { tempId: makeTempId(), text: "", is_correct: false }],
        };
      })
    );
  };

  const removeQuizOption = (qTempId, oTempId) => {
    setQuizQuestions((prev) =>
      safeArr(prev).map((q) => {
        if (q.tempId !== qTempId) return q;
        const next = safeArr(q.options).filter((o) => o.tempId !== oTempId);
        return { ...q, options: next };
      })
    );
  };

  const updateQuizOption = (qTempId, oTempId, patch) => {
    setQuizQuestions((prev) =>
      safeArr(prev).map((q) => {
        if (q.tempId !== qTempId) return q;
        return {
          ...q,
          options: safeArr(q.options).map((o) => (o.tempId === oTempId ? { ...o, ...patch } : o)),
        };
      })
    );
  };

  const toggleCorrect = (qTempId, oTempId) => {
    setQuizQuestions((prev) =>
      safeArr(prev).map((q) => {
        if (q.tempId !== qTempId) return q;

        if (q.qtype === "SINGLE") {
          return {
            ...q,
            options: safeArr(q.options).map((o) => ({
              ...o,
              is_correct: o.tempId === oTempId,
            })),
          };
        }

        return {
          ...q,
          options: safeArr(q.options).map((o) =>
            o.tempId === oTempId ? { ...o, is_correct: !o.is_correct } : o
          ),
        };
      })
    );
  };

  // ---------- status ----------
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // ✅ If mode becomes SELF_PACED, reset leader fields
  useEffect(() => {
    if (mode !== "IN_PERSON") {
      setLeaderUserId("");
      setLeaderSearch("");
      setManualLeaderId("");
    }
  }, [mode]);

  // ---------------- load projects ----------------
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

        if ((!selectedProjectIds || selectedProjectIds.length === 0) && list?.length) {
          const firstId = Number(list[0]?.id || 0);
          if (firstId) setSelectedProjectIds([firstId]);
          try {
            API.setActiveProjectId?.(firstId);
          } catch {}
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

  // persist active project (keeps your old behavior)
  useEffect(() => {
    const first = safeArr(selectedProjectIds)[0];
    if (first) {
      try {
        API.setActiveProjectId?.(first);
      } catch {}
    }
  }, [selectedProjectIds]);

  // ---------------- filtered projects ----------------
  const filteredProjects = useMemo(() => {
    const qq = (projectSearch || "").trim().toLowerCase();
    if (!qq) return projects;
    return projects.filter((p) => String(pickProjectLabel(p)).toLowerCase().includes(qq));
  }, [projects, projectSearch]);

  const toggleProject = (id) => {
    const pid = Number(id);
    if (!pid) return;
    setSelectedProjectIds((prev) => {
      const cur = safeArr(prev).map(Number);
      if (cur.includes(pid)) return cur.filter((x) => x !== pid);
      return [...cur, pid];
    });
  };

  const selectAllFilteredProjects = () => {
    const ids = filteredProjects.map((p) => Number(p?.id)).filter(Boolean);
    setSelectedProjectIds((prev) => {
      const cur = new Set(safeArr(prev).map(Number));
      ids.forEach((x) => cur.add(x));
      return Array.from(cur);
    });
  };

  const clearProjects = () => setSelectedProjectIds([]);

  // ---------------- USERS: load users for ALL selected projects ----------------
  const fetchUsers = async (projectIdsArg) => {
    const ids = safeArr(projectIdsArg ?? selectedProjectIds).map(Number).filter(Boolean);

    if (!ids.length) {
      setUsers([]);
      return;
    }
    if (!API.getUsersByProject) {
      setUsers([]);
      setUsersErr("getUsersByProject() missing in api/index.js");
      return;
    }

    setLoadingUsers(true);
    setUsersErr("");

    try {
      // ✅ fetch all selected projects' users
      const settled = await Promise.allSettled(ids.map((pid) => API.getUsersByProject(pid)));

      const lists = settled.map((s) => {
        if (s.status !== "fulfilled") return [];
        const raw = s.value?.data;
        const list =
          normalizeList(raw).items.length > 0 ? normalizeList(raw).items : safeArr(raw);
        return list;
      });

      const merged = mergeUniqueUsers(lists);

      // (optional) stable sort by name
      merged.sort((a, b) => String(pickUserLabel(a)).localeCompare(String(pickUserLabel(b))));

      setUsers(merged);
    } catch (e) {
      setUsers([]);
      setUsersErr(e?.response?.data?.detail || e?.message || "Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (!safeArr(selectedProjectIds).length) {
      setUsers([]);
      return;
    }
    fetchUsers(selectedProjectIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectIds]);

  const filteredUsers = useMemo(() => {
    const qq = (userSearch || "").trim().toLowerCase();
    if (!qq) return users;
    return users.filter((u) => {
      const s = `${pickUserLabel(u)} ${(u?.email || "")} ${(u?.username || "")}`.toLowerCase();
      return s.includes(qq);
    });
  }, [users, userSearch]);

  // ✅ Leader helpers (now leader list is from merged users of all selected projects)
  const leaderUser = useMemo(() => {
    const id = Number(leaderUserId);
    if (!id) return null;
    return safeArr(users).find((u) => Number(u?.id) === id) || null;
  }, [users, leaderUserId]);

  const filteredLeaderUsers = useMemo(() => {
    const qq = (leaderSearch || "").trim().toLowerCase();
    if (!qq) return users;
    return users.filter((u) => {
      const s = `${pickUserLabel(u)} ${(u?.email || "")} ${(u?.username || "")}`.toLowerCase();
      return s.includes(qq);
    });
  }, [users, leaderSearch]);

  const addManualLeader = () => {
    const uid = Number(String(manualLeaderId || "").trim());
    if (!uid) return toast.error("Enter valid numeric Leader User ID");
    setLeaderUserId(String(uid));
    setManualLeaderId("");
  };

  const toggleUserId = (id, bucket) => {
    const uid = Number(id);
    if (!uid) return;

    if (bucket === "selected") {
      setSelectedUserIds((prev) => {
        const cur = safeArr(prev).map(Number);
        return cur.includes(uid) ? cur.filter((x) => x !== uid) : [...cur, uid];
      });
    } else {
      setSkippedUserIds((prev) => {
        const cur = safeArr(prev).map(Number);
        return cur.includes(uid) ? cur.filter((x) => x !== uid) : [...cur, uid];
      });
    }
  };

  const addManualUserId = (bucket) => {
    const uid = Number(String(manualUserId || "").trim());
    if (!uid) return toast.error("Enter valid numeric User ID");

    if (bucket === "selected") {
      setSelectedUserIds((prev) => Array.from(new Set([...safeArr(prev), uid].map(Number))));
    } else {
      setSkippedUserIds((prev) => Array.from(new Set([...safeArr(prev), uid].map(Number))));
    }

    setManualUserId("");
  };

  // ---------------- ASSETS ----------------
  const addAsset = () => {
    if (!assetType) return toast.error("Select asset type");
    if (!assetFile) return toast.error("Choose a file");

    const t = (assetTitle || "").trim() || assetFile.name || assetType;

    setAssets((prev) => [
      ...safeArr(prev),
      { tempId: makeTempId(), asset_type: assetType, title: t, file: assetFile },
    ]);

    setAssetTitle("");
    setAssetFile(null);
  };

  const removeAsset = (tempId) => {
    setAssets((prev) => safeArr(prev).filter((a) => a?.tempId !== tempId));
  };

  const removePhoto = (idx) => {
    setPhotoFiles((prev) => safeArr(prev).filter((_, i) => i !== idx));
  };

  // ---------------- validation ----------------
  const validateQuiz = () => {
    if (!quizEnabled) return "";

    const qs = safeArr(quizQuestions);
    if (!qs.length) return "Quiz enabled but no questions added";

    for (let i = 0; i < qs.length; i++) {
      const q = qs[i];
      if (!String(q?.text || "").trim()) return `Question #${i + 1} text is required`;

      const opts = safeArr(q?.options)
        .map((o) => ({ ...o, text: String(o?.text || "").trim() }))
        .filter((o) => o.text);

      if (opts.length < 2) return `Question #${i + 1}: add at least 2 options`;

      const correctCount = opts.filter((o) => !!o.is_correct).length;
      if (correctCount < 1) return `Question #${i + 1}: mark at least 1 correct option`;

      if (q.qtype === "SINGLE" && correctCount !== 1) {
        return `Question #${i + 1}: Single correct requires exactly 1 correct option`;
      }
    }

    return "";
  };

  const validate = () => {
    if (!title.trim()) return "Title is required";
    if (!mode) return "Mode is required";
    if (!safeArr(selectedProjectIds).length) return "Select at least 1 project";
    if (mode === "IN_PERSON" && !location.trim()) return "Location is required for In Person";
    if (mode === "IN_PERSON" && !String(leaderUserId || "").trim())
      return "Select a leader for In Person session";

    if (dueAt && scheduledAt) {
      const a = new Date(scheduledAt);
      const b = new Date(dueAt);
      if (!Number.isNaN(a.getTime()) && !Number.isNaN(b.getTime()) && b < a) {
        return "Due date/time cannot be before Scheduled date/time";
      }
    }

    if (assignMode === "SELECT" && safeArr(selectedUserIds).length === 0) {
      return "Select at least 1 user OR change assign mode to 'Assign to All'";
    }

    const qmsg = validateQuiz();
    if (qmsg) return qmsg;

    return "";
  };

  // ✅ Step-wise validation (leader requirement moved to Users step)
  const validateStep = (stepIdx) => {
    const key = STEPS[stepIdx]?.key;

    if (key === "details") {
      if (!title.trim()) return "Title is required";
      if (!mode) return "Mode is required";
      if (mode === "IN_PERSON" && !location.trim()) return "Location is required for In Person";

      if (dueAt && scheduledAt) {
        const a = new Date(scheduledAt);
        const b = new Date(dueAt);
        if (!Number.isNaN(a.getTime()) && !Number.isNaN(b.getTime()) && b < a) {
          return "Due date/time cannot be before Scheduled date/time";
        }
      }
      return "";
    }

    if (key === "projects") {
      if (!safeArr(selectedProjectIds).length) return "Select at least 1 project";
      return "";
    }

    if (key === "users") {
      if (mode === "IN_PERSON" && !String(leaderUserId || "").trim()) {
        return "Select a leader for In Person session";
      }
      if (assignMode === "SELECT" && safeArr(selectedUserIds).length === 0) {
        return "Select at least 1 user OR change assign mode to 'Assign to All'";
      }
      return "";
    }

    if (key === "quiz") {
      const qmsg = validateQuiz();
      if (qmsg) return qmsg;
      return "";
    }

    if (key === "review") {
      return validate();
    }

    return "";
  };

  // ---------------- build create payload ----------------
  const buildCreatePayload = () => {
    const leaderIdNum = leaderUserId ? Number(leaderUserId) : undefined;

    return cleanPayload({
      title: title.trim(),
      mode,
      description: description.trim(),
      location: mode === "IN_PERSON" ? location.trim() : "",
      acknowledgement_text: ackText?.trim() || "",

      // ✅ leader id only for IN_PERSON
      [LEADER_PAYLOAD_FIELD]: mode === "IN_PERSON" ? leaderIdNum : undefined,

      project_ids: safeArr(selectedProjectIds).map((x) => Number(x)).filter(Boolean),

      scheduled_at: toNaiveDT(scheduledAt),
      due_at: toNaiveDT(dueAt),

      duration_minutes: durationMinutes ? Number(durationMinutes) : undefined,
      is_mandatory: !!isMandatory,

      pass_mark: passMark === "" ? undefined : Number(passMark),
      max_attempts: maxAttempts === "" ? undefined : Number(maxAttempts),

      assignee_user_ids: assignMode === "SELECT" ? safeArr(selectedUserIds).map(Number) : undefined,
      skipped_assignee_user_ids: assignMode === "ALL" ? safeArr(skippedUserIds).map(Number) : undefined,

      status: "DRAFT",
    });
  };

  // ---------------- upload assets/photos ----------------
  const uploadFilesIfPossible = async (sessionId) => {
    if (API.uploadSafetySessionAsset) {
      const fileAssets = safeArr(assets).filter((a) => a?.file);
      for (const a of fileAssets) {
        try {
          await API.uploadSafetySessionAsset(sessionId, {
            asset_type: a.asset_type,
            title: a.title || "",
            file: a.file,
          });
        } catch (e) {
          toast.error(humanErr(e, `Asset upload failed: ${a.title}`));
        }
      }
      if (fileAssets.length) toast.success("Assets uploaded ✅");
    }

    if (API.uploadSafetySessionPhoto) {
      for (const img of safeArr(photoFiles)) {
        try {
          await API.uploadSafetySessionPhoto(sessionId, { image: img, caption: "" });
        } catch (e) {
          toast.error(humanErr(e, `Photo upload failed: ${img.name}`));
        }
      }
      if (photoFiles.length) toast.success("Photos uploaded ✅");
    }
  };

  // ---------------- EXCEL TEMPLATE ----------------
  const downloadQuizExcelTemplate = async () => {
    try {
      const XLSX = await loadXLSX();

      const rows = [
        {
          question_text: "What is the first step in fire emergency?",
          question_type: "SINGLE",
          option_1: "Raise alarm",
          option_2: "Run away silently",
          option_3: "",
          option_4: "",
          correct_options: "1",
        },
        {
          question_text: "Select PPE items (multi correct)",
          question_type: "MULTI",
          option_1: "Helmet",
          option_2: "Safety shoes",
          option_3: "Flip flops",
          option_4: "",
          correct_options: "1,2",
        },
      ];

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Questions");
      XLSX.writeFile(wb, "safety_quiz_template.xlsx");
      toast.success("Template downloaded ✅");
    } catch (e) {
      toast.error(humanErr(e, "Template download failed"));
    }
  };

  // ---------------- EXCEL PARSE -> quizQuestions ----------------
  const parseExcelToQuestions = async (file) => {
    setBulkUploading(true);
    try {
      const XLSX = await loadXLSX();
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheetName = wb.SheetNames?.[0];
      if (!sheetName) throw new Error("No sheet found in Excel");

      const ws = wb.Sheets[sheetName];
      const rawRows = XLSX.utils.sheet_to_json(ws, { defval: "" });

      if (!rawRows.length) throw new Error("Excel sheet is empty");

      // normalize headers: {normalizedKey: originalKey}
      const firstRow = rawRows[0] || {};
      const headerMap = {};
      Object.keys(firstRow).forEach((k) => {
        headerMap[normKey(k)] = k;
      });

      const getCell = (row, keyCandidates) => {
        for (const kc of keyCandidates) {
          const orig = headerMap[normKey(kc)];
          if (orig && row[orig] !== undefined) return row[orig];
        }
        return "";
      };

      const questionsOut = [];
      let autoFixedCorrect = 0;

      for (const row of rawRows) {
        const qText = String(getCell(row, ["question_text", "question", "text", "q_text"])).trim();
        if (!qText) continue;

        const qTypeRaw = String(getCell(row, ["question_type", "type", "qtype"]) || "")
          .trim()
          .toUpperCase();

        const qtype = qTypeRaw === "MULTI" ? "MULTI" : "SINGLE";

        const options = [];
        for (let i = 1; i <= 20; i++) {
          const v = getCell(row, [`option_${i}`, `option ${i}`, `option${i}`]) ?? "";
          const txt = String(v).trim();
          if (txt) options.push({ idx: i, text: txt });
        }

        const correctRaw = String(
          getCell(row, ["correct_options", "correct_option", "correct", "correct_indexes"])
        )
          .trim()
          .replace(/\s+/g, "");

        let correctIdxs = [];
        if (correctRaw) {
          correctIdxs = correctRaw
            .split(",")
            .map((x) => Number(x))
            .filter((n) => Number.isFinite(n) && n > 0);
        }

        const mappedOptions = options.map((o) => ({
          tempId: makeTempId(),
          text: o.text,
          is_correct: correctIdxs.includes(o.idx),
        }));

        const correctCount = mappedOptions.filter((x) => x.is_correct).length;
        if (mappedOptions.length && correctCount === 0) {
          mappedOptions[0].is_correct = true;
          autoFixedCorrect += 1;
        }

        if (qtype === "SINGLE") {
          let found = false;
          for (const o of mappedOptions) {
            if (!o.is_correct) continue;
            if (!found) found = true;
            else o.is_correct = false;
          }
          if (!found && mappedOptions.length) mappedOptions[0].is_correct = true;
        }

        questionsOut.push({
          tempId: makeTempId(),
          text: qText,
          qtype,
          options: mappedOptions.length
            ? mappedOptions
            : [
                { tempId: makeTempId(), text: "", is_correct: true },
                { tempId: makeTempId(), text: "", is_correct: false },
              ],
        });
      }

      if (!questionsOut.length) throw new Error("No valid questions found in Excel");

      setQuizQuestions((prev) => (bulkAppend ? [...safeArr(prev), ...questionsOut] : questionsOut));

      toast.success(`Excel loaded ✅ Questions: ${questionsOut.length}`);
      if (autoFixedCorrect) {
        toast(`⚠️ ${autoFixedCorrect} question(s): correct option missing, first option auto-marked ✓`, {
          icon: "⚠️",
        });
      }
    } catch (e) {
      toast.error(humanErr(e, "Excel parse failed"));
    } finally {
      setBulkUploading(false);
    }
  };

  // ---------------- build bulk upload payload ----------------
  const buildBulkQuizPayload = () => {
    const qs = safeArr(quizQuestions);

    const questions = qs.map((q) => {
      const qText = String(q?.text || "").trim();
      const qtype = q?.qtype || "SINGLE";

      const opts = safeArr(q?.options)
        .map((o) => ({
          option_text: String(o?.text || "").trim(),
          is_correct: !!o?.is_correct,
        }))
        .filter((o) => o.option_text);

      const options = opts.map((o, idx) => ({ ...o, order: idx }));

      return cleanPayload({
        question_text: qText,
        question_type: qtype,
        options,
      });
    });

    return { questions };
  };

  // ---------------- QUIZ save (bulk first, fallback old) ----------------
  const setupQuizIfPossible = async (sessionId) => {
    if (!quizEnabled) return;

    if (!API.setupSafetyQuiz) {
      toast.error("setupSafetyQuiz() missing in api/index.js");
      return;
    }

    try {
      const payload = cleanPayload({
        pass_mark: passMark === "" ? undefined : Number(passMark),
        max_attempts: maxAttempts === "" ? undefined : Number(maxAttempts),
      });
      await API.setupSafetyQuiz(sessionId, payload);
    } catch (e) {
      try {
        await API.setupSafetyQuiz(sessionId, {});
      } catch (e2) {
        toast.error(humanErr(e2, "Quiz setup failed"));
        return;
      }
    }

    if (API.bulkUploadSafetyQuizQuestions) {
      try {
        const bulkPayload = buildBulkQuizPayload();
        await API.bulkUploadSafetyQuizQuestions(sessionId, bulkPayload);
        toast.success("Quiz saved (bulk) ✅");
        return;
      } catch (e) {
        toast.error(`Bulk upload failed, trying fallback...`);
      }
    }

    if (!API.addSafetyQuizQuestion || !API.addSafetyQuizOption) {
      toast.error("Quiz APIs missing in api/index.js (addSafetyQuizQuestion/addSafetyQuizOption)");
      return;
    }

    for (const q of safeArr(quizQuestions)) {
      const qText = String(q?.text || "").trim();
      const qtype = q?.qtype || "SINGLE";

      const opts = safeArr(q?.options)
        .map((o) => ({ ...o, text: String(o?.text || "").trim() }))
        .filter((o) => o.text);

      let createdQ = null;
      try {
        const res = await API.addSafetyQuizQuestion(sessionId, {
          question_text: qText,
          question_type: qtype,
        });
        createdQ = res?.data || null;
      } catch (e) {
        toast.error(
          e?.response?.data
            ? `Question create failed: ${JSON.stringify(e.response.data)}`
            : e?.message || "Question create failed"
        );
        continue;
      }

      const questionId = createdQ?.id || createdQ?.question_id || null;
      if (!questionId) {
        toast.error(`Quiz question id missing for: ${qText}`);
        continue;
      }

      for (const o of opts) {
        const oText = String(o.text || "").trim();
        const isCorrect = !!o.is_correct;

        const optPayloadTries = [
          { question_id: questionId, option_text: oText, is_correct: isCorrect },
          { question_id: questionId, text: oText, is_correct: isCorrect },
          { question_id: questionId, name: oText, is_correct: isCorrect },
          { question_id: questionId, option: oText, is_correct: isCorrect },
          { question_id: questionId, option_text: oText, correct: isCorrect },
        ];

        let ok = false;
        for (const op of optPayloadTries) {
          try {
            await API.addSafetyQuizOption(sessionId, op);
            ok = true;
            break;
          } catch {
            // keep trying
          }
        }

        if (!ok) toast.error(`Option create failed: "${oText}" (Q: ${qText})`);
      }
    }

    toast.success("Quiz saved ✅");
  };

  // ---------------- create session ----------------
  const createSession = async ({ publish = false } = {}) => {
    const msg = validate();
    if (msg) {
      setErr(msg);
      toast.error(msg);
      return;
    }

    setSaving(true);
    setErr("");

    try {
      const first = safeArr(selectedProjectIds)[0];
      if (first) {
        try {
          API.setActiveProjectId?.(first);
        } catch {}
      }

      const payload = buildCreatePayload();
      const res = await API.createSafetySession(payload);
      const created = res?.data || {};
      const id = created?.id;

      toast.success(publish ? "Created ✅" : "Created (Draft) ✅");

      if (id) {
        await setupQuizIfPossible(id);
        await uploadFilesIfPossible(id);

        if (assignMode === "SELECT" && API.assignSafetySessionUsers) {
          try {
            await API.assignSafetySessionUsers(id, safeArr(selectedUserIds).map(Number));
          } catch {}
        }
      }

      if (publish && id) {
        await API.publishSafetySession?.(id);
        toast.success("Published ✅");
      }

      navigate("/safety/sessions");
    } catch (e) {
      const m = humanErr(e, "Create failed");
      setErr(m);
      toast.error(m);
    } finally {
      setSaving(false);
    }
  };

  // ---------------- UI helpers ----------------
  const SummaryRow = ({ label, value }) => (
    <div className="sumRow">
      <div className="sumLabel">{label}</div>
      <div className="sumValue">{value}</div>
    </div>
  );

  const selectedProjectsCount = safeArr(selectedProjectIds).length;
  const selectedUsersCount = safeArr(selectedUserIds).length;
  const skippedUsersCount = safeArr(skippedUserIds).length;

  // ---------------- Step content ----------------
  const renderStep = () => {
    if (stepKey === "details") {
      return (
        <div className="card">
          <div className="cardHeader">
            <div className="cardTitle">Session Details</div>
            <div className="hint">Step 1 of {STEPS.length}</div>
          </div>

          <div className="form">
            <div className="field">
              <label>Title *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="row2">
              <div className="field">
                <label>Mode *</label>
                <select value={mode} onChange={(e) => setMode(e.target.value)}>
                  {MODES.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Mandatory</label>
                <div className="switchWrap">
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={isMandatory}
                      onChange={(e) => setIsMandatory(e.target.checked)}
                    />
                    <span className="slider" />
                  </label>
                  <div className="switchText">{isMandatory ? "ON" : "OFF"}</div>
                </div>
              </div>
            </div>

            {mode === "IN_PERSON" ? (
              <>
                <div className="field">
                  <label>Location *</label>
                  <input value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>

                <div className="note">
                  Leader selection will be done in <b>Step 3 (Users)</b>.
                </div>
              </>
            ) : null}

            <div className="field">
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="row2">
              <div className="field">
                <label>Scheduled At</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                />
              </div>

              <div className="field">
                <label>Due At</label>
                <input
                  type="datetime-local"
                  value={dueAt}
                  onChange={(e) => setDueAt(e.target.value)}
                />
              </div>
            </div>

            <div className="row3">
              <div className="field">
                <label>Duration (minutes)</label>
                <input
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  inputMode="numeric"
                />
              </div>

              <div className="field">
                <label>Pass Mark (%)</label>
                <input
                  value={passMark}
                  onChange={(e) => setPassMark(e.target.value)}
                  inputMode="numeric"
                  placeholder="e.g. 70"
                />
              </div>

              <div className="field">
                <label>Max Attempts</label>
                <input
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(e.target.value)}
                  inputMode="numeric"
                  placeholder="e.g. 3"
                />
              </div>
            </div>

            <div className="field">
              <label>Acknowledgement Text</label>
              <textarea value={ackText} onChange={(e) => setAckText(e.target.value)} rows={3} />
            </div>
          </div>
        </div>
      );
    }

    if (stepKey === "projects") {
      return (
        <div className="card">
          <div className="cardHeader">
            <div className="cardTitle">Projects *</div>
            <div className="hint">Step 2 of {STEPS.length}</div>
          </div>

          <div className="form">
            <div className="projTop">
              <input
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                placeholder="Search project..."
              />
              <div className="projBtns">
                <button className="btn tiny" type="button" onClick={selectAllFilteredProjects}>
                  Select All
                </button>
                <button className="btn tiny danger" type="button" onClick={clearProjects}>
                  Clear
                </button>
              </div>
            </div>

            {loadingProjects ? (
              <div className="loading">Loading projects...</div>
            ) : (
              <div className="projList">
                {filteredProjects.map((p) => {
                  const id = Number(p?.id);
                  const checked = safeArr(selectedProjectIds).includes(id);
                  return (
                    <label key={id} className={`projItem ${checked ? "active" : ""}`}>
                      <input type="checkbox" checked={checked} onChange={() => toggleProject(id)} />
                      <div className="projText">
                        <div className="projLabel">{pickProjectLabel(p)}</div>
                        <div className="projSub">ID: {id}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            <div className="note">
              Selected Projects: <b>{selectedProjectsCount}</b>
            </div>
          </div>
        </div>
      );
    }

    if (stepKey === "users") {
      return (
        <div className="card">
          <div className="cardHeader">
            <div className="cardTitle">Users</div>
            <div className="hint">Step 3 of {STEPS.length}</div>
          </div>

          <div className="form">
            {/* ✅ Leader moved here (and uses ALL selected projects users) */}
            {mode === "IN_PERSON" ? (
              <div className="card" style={{ borderStyle: "dashed" }}>
                <div className="cardHeader">
                  <div className="cardTitle">Select Leader *</div>
                  <div className="hint">Required for In Person</div>
                </div>

                <div className="form">
                  <div className="row2">
                    <div className="field grow">
                      <label>Search Leader</label>
                      <input
                        value={leaderSearch}
                        onChange={(e) => setLeaderSearch(e.target.value)}
                        placeholder="Search by name/email/username..."
                      />
                    </div>

                    <div className="field">
                      <label>Manual Leader ID</label>
                      <div className="rowInline">
                        <input
                          value={manualLeaderId}
                          onChange={(e) => setManualLeaderId(e.target.value)}
                          inputMode="numeric"
                          placeholder="e.g. 875"
                        />
                        <button className="btn primary" type="button" onClick={addManualLeader}>
                          Set
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="row2">
                    <div className="field grow">
                      <label>Users Source</label>
                      <div className="miniNote">
                        Showing users from <b>ALL selected projects</b> (unique merged).
                      </div>
                    </div>

                    <div className="field">
                      <label>Reload</label>
                      <button
                        className="btn"
                        type="button"
                        onClick={() => fetchUsers(selectedProjectIds)}
                        disabled={loadingUsers}
                      >
                        {loadingUsers ? "Loading..." : "Refresh Users"}
                      </button>
                    </div>
                  </div>

                  {loadingUsers ? (
                    <div className="loading">Loading users...</div>
                  ) : usersErr ? (
                    <div className="warnBox">{usersErr}</div>
                  ) : users.length === 0 ? (
                    <div className="empty">
                      No users found for selected projects. Select projects first (Step 2).
                    </div>
                  ) : (
                    <div className="leaderList">
                      {filteredLeaderUsers.map((u) => {
                        const id = Number(u?.id);
                        const active = String(leaderUserId) === String(id);
                        return (
                          <label key={id} className={`userItem ${active ? "active" : ""}`}>
                            <input
                              type="radio"
                              name="leaderUser"
                              checked={active}
                              onChange={() => setLeaderUserId(String(id))}
                            />
                            <div className="userText">
                              <div className="userLabel">{pickUserLabel(u)}</div>
                              <div className="userSub">
                                ID: {id}
                                {u?.email ? ` • ${u.email}` : ""}
                                {u?.role ? ` • ${u.role}` : ""}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  <div className="note">
                    Selected Leader:{" "}
                    <b>
                      {leaderUser
                        ? `${pickUserLabel(leaderUser)} (ID: ${leaderUser.id})`
                        : leaderUserId
                        ? `User #${leaderUserId}`
                        : "-"}
                    </b>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="field">
              <label>Assign Mode</label>
              <select value={assignMode} onChange={(e) => setAssignMode(e.target.value)}>
                {ASSIGN_MODES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="row2">
              <div className="field grow">
                <label>Search Users</label>
                <input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by name/email/username..."
                />
              </div>

              <div className="field">
                <label>Reload</label>
                <button
                  className="btn"
                  type="button"
                  onClick={() => fetchUsers(selectedProjectIds)}
                  disabled={loadingUsers}
                >
                  {loadingUsers ? "Loading..." : "Refresh Users"}
                </button>
              </div>
            </div>

            {usersErr ? <div className="warnBox">{usersErr}</div> : null}

            <div className="row2">
              <div className="field grow">
                <label>Manual Add User ID</label>
                <input
                  value={manualUserId}
                  onChange={(e) => setManualUserId(e.target.value)}
                  inputMode="numeric"
                  placeholder="e.g. 875"
                />
              </div>
              <div className="field">
                <label>&nbsp;</label>
                <button
                  className="btn primary"
                  type="button"
                  onClick={() => addManualUserId(assignMode === "SELECT" ? "selected" : "skipped")}
                >
                  Add ID
                </button>
              </div>
            </div>

            {loadingUsers ? (
              <div className="loading">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="empty">No users found.</div>
            ) : (
              <div className="usersList">
                {filteredUsers.map((u) => {
                  const id = Number(u?.id);
                  const bucket = assignMode === "SELECT" ? "selected" : "skipped";
                  const checked =
                    bucket === "selected"
                      ? safeArr(selectedUserIds).includes(id)
                      : safeArr(skippedUserIds).includes(id);

                  return (
                    <label key={id} className={`userItem ${checked ? "active" : ""}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleUserId(id, bucket)}
                      />
                      <div className="userText">
                        <div className="userLabel">{pickUserLabel(u)}</div>
                        <div className="userSub">
                          ID: {id}
                          {u?.email ? ` • ${u.email}` : ""}
                          {u?.role ? ` • ${u.role}` : ""}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            <div className="note">
              {assignMode === "ALL" ? (
                <>
                  Assigning to all users. Skipped: <b>{skippedUsersCount}</b>
                </>
              ) : (
                <>
                  Selected users: <b>{selectedUsersCount}</b>
                </>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (stepKey === "quiz") {
      return (
        <div className="card">
          <div className="cardHeader">
            <div className="cardTitle">Quiz (optional)</div>
            <div className="hint">Step 4 of {STEPS.length}</div>
          </div>

          <div className="form">
            <div className="switchRow">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={quizEnabled}
                  onChange={(e) => setQuizEnabled(e.target.checked)}
                />
                <span className="slider" />
              </label>

              <div>
                <div style={{ fontWeight: 800 }}>Enable Quiz</div>
                <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                  If ON, we will call: quiz_setup → quiz_bulk_upload (fallback: add_question/add_option)
                </div>
              </div>
            </div>

            {quizEnabled ? (
              <>
                <div className="bulkBox">
                  <div className="bulkTop">
                    <div>
                      <div style={{ fontWeight: 900 }}>Excel Upload</div>
                      <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                        Upload .xlsx and questions will appear here.
                      </div>
                    </div>

                    <div className="bulkBtns">
                      <button className="btn tiny" type="button" onClick={downloadQuizExcelTemplate}>
                        Download Template
                      </button>
                    </div>
                  </div>

                  <div className="row2">
                    <div className="field">
                      <label>Upload Excel (.xlsx)</label>
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        disabled={bulkUploading}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          parseExcelToQuestions(f);
                          e.target.value = "";
                        }}
                      />
                      <div className="miniNote">
                        Columns: question_text, question_type, option_1.., correct_options
                      </div>
                    </div>

                    <div className="field">
                      <label>Mode</label>
                      <div className="switchWrap">
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={bulkAppend}
                            onChange={(e) => setBulkAppend(e.target.checked)}
                          />
                          <span className="slider" />
                        </label>
                        <div className="switchText">{bulkAppend ? "APPEND" : "REPLACE"}</div>
                      </div>
                      <div className="miniNote">
                        Replace = Excel overwrite current questions. Append = add to list.
                      </div>
                    </div>
                  </div>
                </div>

                <button className="btn primary" type="button" onClick={addQuizQuestion}>
                  + Add Question
                </button>

                {quizQuestions.length ? (
                  <div className="qList">
                    {quizQuestions.map((q, qi) => (
                      <div key={q.tempId} className="qCard">
                        <div className="qTop">
                          <div style={{ fontWeight: 900 }}>Q{qi + 1}</div>
                          <button
                            className="btn tiny danger"
                            type="button"
                            onClick={() => removeQuizQuestion(q.tempId)}
                          >
                            Remove
                          </button>
                        </div>

                        <div className="row2">
                          <div className="field">
                            <label>Question Text *</label>
                            <input
                              value={q.text}
                              onChange={(e) =>
                                updateQuizQuestion(q.tempId, { text: e.target.value })
                              }
                              placeholder="e.g. What is the first step in fire emergency?"
                            />
                          </div>

                          <div className="field">
                            <label>Type</label>
                            <select
                              value={q.qtype}
                              onChange={(e) =>
                                updateQuizQuestion(q.tempId, { qtype: e.target.value })
                              }
                            >
                              {QUIZ_Q_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>
                                  {t.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="optBox">
                          <div className="optHead">
                            <div style={{ fontWeight: 800 }}>Options *</div>
                            <button
                              className="btn tiny"
                              type="button"
                              onClick={() => addQuizOption(q.tempId)}
                            >
                              + Add Option
                            </button>
                          </div>

                          {safeArr(q.options).map((o, oi) => (
                            <div key={o.tempId} className="optRow">
                              <button
                                className={`markBtn ${o.is_correct ? "on" : ""}`}
                                type="button"
                                onClick={() => toggleCorrect(q.tempId, o.tempId)}
                                title={q.qtype === "SINGLE" ? "Select correct option" : "Toggle correct"}
                              >
                                ✓
                              </button>

                              <input
                                value={o.text}
                                onChange={(e) =>
                                  updateQuizOption(q.tempId, o.tempId, { text: e.target.value })
                                }
                                placeholder={`Option ${oi + 1}`}
                              />

                              <button
                                className="btn tiny danger"
                                type="button"
                                onClick={() => removeQuizOption(q.tempId, o.tempId)}
                                disabled={safeArr(q.options).length <= 2}
                                title="Keep at least 2 options"
                              >
                                Remove
                              </button>
                            </div>
                          ))}

                          <div className="miniNote">
                            {q.qtype === "SINGLE"
                              ? "Single Correct: only 1 option can be ✓"
                              : "Multiple Correct: you can mark multiple ✓"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty">No questions yet. Add manually OR upload Excel.</div>
                )}
              </>
            ) : (
              <div className="empty">Quiz is OFF.</div>
            )}
          </div>
        </div>
      );
    }

    if (stepKey === "assets") {
      return (
        <>
          <div className="card">
            <div className="cardHeader">
              <div className="cardTitle">Assets Upload</div>
              <div className="hint">Step 5 of {STEPS.length}</div>
            </div>

            <div className="form">
              <div className="row2">
                <div className="field">
                  <label>Asset Type</label>
                  <select value={assetType} onChange={(e) => setAssetType(e.target.value)}>
                    {ASSET_TYPES.map((a) => (
                      <option key={a.value} value={a.value}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>Title (optional)</label>
                  <input
                    value={assetTitle}
                    onChange={(e) => setAssetTitle(e.target.value)}
                    placeholder="e.g. Safety Induction PPT"
                  />
                </div>
              </div>

              <div className="field">
                <label>Choose File *</label>
                <input
                  type="file"
                  accept={
                    assetType === "VIDEO"
                      ? "video/*"
                      : assetType === "PPT"
                      ? ".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                      : assetType === "PDF"
                      ? "application/pdf,.pdf"
                      : "*/*"
                  }
                  onChange={(e) => setAssetFile(e.target.files?.[0] || null)}
                />
                {assetFile ? <div className="miniNote">Selected: {assetFile.name}</div> : null}
              </div>

              <button className="btn primary" type="button" onClick={addAsset}>
                + Add Asset
              </button>

              {assets.length ? (
                <div className="list">
                  {assets.map((a) => (
                    <div key={a.tempId} className="listItem">
                      <div className="listLeft">
                        <div className="pill">{a.asset_type}</div>
                        <div>
                          <div className="listTitle">{a.title}</div>
                          <div className="listSub">{a.file?.name}</div>
                        </div>
                      </div>
                      <button
                        className="btn tiny danger"
                        type="button"
                        onClick={() => removeAsset(a.tempId)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty">No assets added.</div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="cardHeader">
              <div className="cardTitle">Photos (optional)</div>
              <div className="hint">Uploads after session is created</div>
            </div>

            <div className="form">
              <div className="field">
                <label>Upload Photos</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (!files.length) return;
                    setPhotoFiles((prev) => [...safeArr(prev), ...files]);
                  }}
                />
              </div>

              {photoFiles.length ? (
                <div className="list">
                  {photoFiles.map((f, idx) => (
                    <div key={`${f.name}-${idx}`} className="listItem">
                      <div className="listLeft">
                        <div className="pill">PHOTO</div>
                        <div>
                          <div className="listTitle">{f.name}</div>
                          <div className="listSub">{Math.round((f.size || 0) / 1024)} KB</div>
                        </div>
                      </div>
                      <button
                        className="btn tiny danger"
                        type="button"
                        onClick={() => removePhoto(idx)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty">No photos selected.</div>
              )}
            </div>
          </div>
        </>
      );
    }

    // REVIEW
    return (
      <div className="card">
        <div className="cardHeader">
          <div className="cardTitle">Review & Create</div>
          <div className="hint">Step 6 of {STEPS.length}</div>
        </div>

        <div className="form">
          <div className="reviewGrid">
            <div className="reviewCard">
              <div className="reviewTitle">Session</div>
              <SummaryRow label="Title" value={title || "-"} />
              <SummaryRow label="Mode" value={mode || "-"} />
              <SummaryRow label="Location" value={mode === "IN_PERSON" ? location || "-" : "-"} />
              <SummaryRow
                label="Leader"
                value={
                  mode === "IN_PERSON"
                    ? leaderUser
                      ? `${pickUserLabel(leaderUser)} (ID: ${leaderUser.id})`
                      : leaderUserId
                      ? `User #${leaderUserId}`
                      : "-"
                    : "-"
                }
              />
              <SummaryRow label="Mandatory" value={isMandatory ? "Yes" : "No"} />
              <SummaryRow label="Scheduled" value={scheduledAt || "-"} />
              <SummaryRow label="Due" value={dueAt || "-"} />
            </div>

            <div className="reviewCard">
              <div className="reviewTitle">Assignment</div>
              <SummaryRow label="Projects selected" value={String(selectedProjectsCount)} />
              <SummaryRow label="Assign mode" value={assignMode} />
              <SummaryRow
                label={assignMode === "SELECT" ? "Selected users" : "Skipped users"}
                value={assignMode === "SELECT" ? String(selectedUsersCount) : String(skippedUsersCount)}
              />
            </div>

            <div className="reviewCard">
              <div className="reviewTitle">Quiz</div>
              <SummaryRow label="Enabled" value={quizEnabled ? "Yes" : "No"} />
              <SummaryRow
                label="Questions"
                value={quizEnabled ? String(safeArr(quizQuestions).length) : "-"}
              />
              <SummaryRow label="Pass mark" value={passMark || "-"} />
              <SummaryRow label="Max attempts" value={maxAttempts || "-"} />
            </div>

            <div className="reviewCard">
              <div className="reviewTitle">Uploads</div>
              <SummaryRow label="Assets" value={String(safeArr(assets).length)} />
              <SummaryRow label="Photos" value={String(safeArr(photoFiles).length)} />
            </div>
          </div>

          <div className="note">
            Tip: Click any step on top to edit quickly. Final create will run full validation.
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="safetyCreatePage">
        {/* Header */}
        <div className="topBar">
          <div>
            <div className="title">Create Safety Session</div>
            <div className="sub">Wizard • Clean flow • Draft first</div>
          </div>

          <div className="topActions">
            <button className="btn" onClick={() => navigate("/safety/sessions")}>
              ← Back
            </button>

            {/* keep draft always available */}
            <button
              className="btn primary"
              disabled={saving}
              onClick={() => createSession({ publish: false })}
            >
              {saving ? "Saving..." : "Save Draft"}
            </button>
          </div>
        </div>

        {/* Stepper */}
        <div className="stepperWrap">
          <div className="stepper">
            {STEPS.map((s, idx) => {
              const active = idx === step;
              const done = idx < step;
              return (
                <button
                  key={s.key}
                  type="button"
                  className={`stepItem ${active ? "active" : ""} ${done ? "done" : ""}`}
                  onClick={() => gotoStep(idx)}
                >
                  <div className="stepCircle">{done ? "✓" : idx + 1}</div>
                  <div className="stepLabel">{s.label}</div>
                </button>
              );
            })}
          </div>
          <div className="stepLine" />
        </div>

        {err ? <div className="errorBox">{err}</div> : null}

        <div className="wizardGrid">
          {/* Main */}
          <div className="wizardMain">{renderStep()}</div>

          {/* Sticky Summary (desktop) */}
          <div className="wizardSide">
            <div className="card sticky">
              <div className="cardHeader">
                <div className="cardTitle">Live Summary</div>
                <div className="hint">Quick view</div>
              </div>
              <div className="form compact">
                <SummaryRow label="Title" value={title || "-"} />
                <SummaryRow label="Mode" value={mode || "-"} />
                {mode === "IN_PERSON" ? (
                  <SummaryRow
                    label="Leader"
                    value={
                      leaderUser ? `${pickUserLabel(leaderUser)}` : leaderUserId ? `#${leaderUserId}` : "-"
                    }
                  />
                ) : null}
                <SummaryRow label="Projects" value={String(selectedProjectsCount)} />
                <SummaryRow
                  label={assignMode === "SELECT" ? "Selected Users" : "Skipped Users"}
                  value={assignMode === "SELECT" ? String(selectedUsersCount) : String(skippedUsersCount)}
                />
                <SummaryRow
                  label="Quiz"
                  value={quizEnabled ? `ON (${safeArr(quizQuestions).length})` : "OFF"}
                />
                <SummaryRow label="Assets" value={String(safeArr(assets).length)} />
                <SummaryRow label="Photos" value={String(safeArr(photoFiles).length)} />

                {stepKey === "review" ? (
                  <button
                    className="btn warn"
                    disabled={saving}
                    onClick={() => createSession({ publish: true })}
                    type="button"
                  >
                    {saving ? "Publishing..." : "Create + Publish"}
                  </button>
                ) : (
                  <button className="btn" type="button" onClick={() => gotoStep(STEPS.length - 1)}>
                    Jump to Review →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer nav */}
        <div className="wizardFooter">
          <div className="footerLeft">
            <button className="btn" type="button" onClick={prevStep} disabled={step === 0}>
              ← Back
            </button>
          </div>

          <div className="footerRight">
            {step < STEPS.length - 1 ? (
              <button className="btn primary" type="button" onClick={nextStep}>
                Next →
              </button>
            ) : (
              <button
                className="btn warn"
                disabled={saving}
                onClick={() => createSession({ publish: true })}
                type="button"
              >
                {saving ? "Publishing..." : "Create + Publish"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* inline CSS */}
      <style>{`
        .safetyCreatePage { padding: 16px; padding-bottom: 90px; }
        .topBar{ display:flex; align-items:flex-start; justify-content:space-between; gap: 12px; margin-bottom: 14px; }
        .title{ font-size: 20px; font-weight: 800; }
        .sub{ margin-top: 4px; color:#666; font-size: 13px; }
        .topActions{ display:flex; gap: 10px; flex-wrap: wrap; }

        .btn{ border: 1px solid #ddd; background:#fff; padding: 10px 12px; border-radius: 12px; cursor:pointer; font-size: 13px; }
        .btn:disabled{ opacity:.55; cursor:not-allowed; }
        .btn.primary{ border-color: ${ORANGE}; background:${ORANGE}; color:#111; font-weight: 800; }
        .btn.warn{ border-color: #0f62fe; background:#0f62fe; color:#fff; font-weight: 800; }
        .btn.danger{ border-color: #ff4d4f; background:#ff4d4f; color:#fff; }
        .btn.tiny{ padding: 8px 10px; border-radius: 10px; font-size: 12px; }

        .errorBox{ margin: 10px 0; padding: 10px 12px; border: 1px solid #ffd5d5; background: #fff3f3; color: #a40000; border-radius: 12px; }
        .warnBox{ padding: 10px 12px; border: 1px solid #ffe6b5; background: #fff8e8; color: #6a4a00; border-radius: 12px; font-size: 13px; }

        .card{ background:#fff; border: 1px solid #eee; border-radius: 14px; overflow:hidden; }
        .card.sticky{ position: sticky; top: 12px; }
        .cardHeader{ display:flex; align-items:center; justify-content:space-between; padding: 12px; border-bottom: 1px solid #eee; background: linear-gradient(180deg, #fff, #fffaf0); }
        .cardTitle{ font-weight: 800; }
        .hint{ font-size: 12px; color:#666; }

        .form{ padding: 12px; display:flex; flex-direction:column; gap: 12px; }
        .form.compact{ gap: 8px; }
        .field{ display:flex; flex-direction:column; gap: 6px; }
        .field.grow{ flex: 1; }
        .field label{ font-size: 12px; color:#555; }

        input, select, textarea{ border: 1px solid #ddd; border-radius: 12px; padding: 10px 12px; outline:none; background:#fff; font-size: 14px; }
        textarea{ resize: vertical; }

        .row2{ display:grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .row3{ display:grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
        @media (max-width: 740px){ .row2, .row3{ grid-template-columns: 1fr; } }

        .rowInline{ display:flex; gap: 8px; align-items:center; }
        .rowInline input{ flex: 1; }

        /* Stepper */
        .stepperWrap{ margin: 10px 0 14px; position: relative; }
        .stepper{
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 8px;
          background: #fff;
          padding: 10px;
          border-radius: 14px;
          border: 1px solid #eee;
        }
        @media (max-width: 900px){
          .stepper{ grid-template-columns: repeat(3, 1fr); }
        }
        .stepLine{
          height: 1px;
          background: #eee;
          margin-top: -8px;
        }
        .stepItem{
          border: 1px solid #eee;
          background: #fff;
          border-radius: 14px;
          padding: 10px;
          display:flex;
          align-items:center;
          gap: 10px;
          cursor: pointer;
          text-align: left;
        }
        .stepItem:hover{ border-color: #ddd; }
        .stepItem.active{ border-color: ${ORANGE}; box-shadow: 0 0 0 3px rgba(255,190,99,.20); }
        .stepItem.done{ border-color: #d7f5dc; background: #f6fffb; }
        .stepCircle{
          width: 30px; height: 30px;
          border-radius: 999px;
          border: 1px solid #ddd;
          display:flex; align-items:center; justify-content:center;
          font-weight: 900;
          background:#fff;
        }
        .stepItem.active .stepCircle{ border-color:${ORANGE}; background:${ORANGE}; }
        .stepItem.done .stepCircle{ border-color: #34c759; background: #34c759; color:#fff; }
        .stepLabel{ font-weight: 800; font-size: 13px; color:#222; }

        /* Wizard Layout */
        .wizardGrid{
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 12px;
          align-items: start;
        }
        @media (max-width: 1100px){
          .wizardGrid{ grid-template-columns: 1fr; }
          .wizardSide{ order: -1; }
          .card.sticky{ position: static; }
        }
        .wizardMain{ display:flex; flex-direction: column; gap: 12px; }
        .wizardSide{ display:flex; flex-direction: column; gap: 12px; }

        /* Footer */
        .wizardFooter{
          position: fixed;
          left: 0; right: 0; bottom: 0;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(8px);
          border-top: 1px solid #eee;
          padding: 10px 16px;
          display:flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }
        .footerLeft, .footerRight{ display:flex; gap: 10px; align-items:center; }

        .note{ padding: 10px 12px; border: 1px dashed #eee; border-radius: 12px; color:#666; font-size: 12px; background: #fffdf7; }
        .loading, .empty{ padding: 10px 4px; color:#444; }
        .miniNote{ font-size: 12px; color:#666; margin-top: 6px; }

        /* Projects / Users list */
        .projTop{ display:flex; gap: 10px; align-items:center; }
        .projBtns{ display:flex; gap: 8px; flex-wrap: wrap; }

        .projList{ max-height: 460px; overflow:auto; padding: 4px 0; }
        .projItem{ display:flex; gap: 10px; align-items:flex-start; border: 1px solid #eee; border-radius: 12px; padding: 10px; margin-top: 10px; cursor: pointer; background: #fff; }
        .projItem.active{ border-color: ${ORANGE}; box-shadow: 0 0 0 3px rgba(255,190,99,.25); }
        .projItem input{ margin-top: 4px; }
        .projLabel{ font-weight: 800; }
        .projSub{ font-size: 12px; color:#666; margin-top: 2px; }

        .usersList{ max-height: 520px; overflow:auto; padding: 4px 0; border-top: 1px solid #f3f3f3; }
        .leaderList{ max-height: 260px; overflow:auto; padding: 4px 0; border-top: 1px solid #f3f3f3; }
        .userItem{ display:flex; gap: 10px; align-items:flex-start; border: 1px solid #eee; border-radius: 12px; padding: 10px; margin-top: 10px; cursor: pointer; background: #fff; }
        .userItem.active{ border-color: ${ORANGE}; box-shadow: 0 0 0 3px rgba(255,190,99,.25); }
        .userItem input{ margin-top: 4px; }
        .userLabel{ font-weight: 800; }
        .userSub{ font-size: 12px; color:#666; margin-top: 2px; }

        /* List */
        .list{ display:flex; flex-direction:column; gap: 10px; border-top: 1px solid #f3f3f3; padding-top: 10px; }
        .listItem{ display:flex; align-items:flex-start; justify-content:space-between; gap: 10px; border: 1px solid #eee; border-radius: 12px; padding: 10px; }
        .listLeft{ display:flex; gap: 10px; align-items:flex-start; min-width: 0; }
        .listTitle{ font-weight: 800; }
        .listSub{ font-size: 12px; color:#666; margin-top: 2px; word-break: break-word; }
        .pill{ flex: 0 0 auto; border: 1px solid #ddd; border-radius: 999px; padding: 6px 10px; font-size: 12px; background: #fafafa; }

        /* Switch */
        .switchWrap{ display:flex; align-items:center; gap: 10px; }
        .switchText{ font-size: 12px; color:#444; font-weight: 700; }
        .switch { position: relative; display: inline-block; width: 44px; height: 26px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ddd; transition: .2s; border-radius: 999px; }
        .slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 3px; bottom: 3px; background-color: white; transition: .2s; border-radius: 999px; }
        input:checked + .slider { background-color: ${ORANGE}; }
        input:checked + .slider:before { transform: translateX(18px); }

        .switchRow{
          display:flex; gap: 12px; align-items:flex-start;
          padding: 10px;
          border: 1px solid #eee;
          border-radius: 14px;
          background: #fff;
        }

        /* Quiz */
        .bulkBox{
          border: 1px dashed #eee;
          border-radius: 14px;
          padding: 12px;
          background: #fffdf7;
        }
        .bulkTop{
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap: 10px;
          margin-bottom: 10px;
        }
        .bulkBtns{ display:flex; gap: 8px; flex-wrap: wrap; }

        .qList{ display:flex; flex-direction:column; gap: 12px; }
        .qCard{
          border: 1px solid #eee;
          border-radius: 14px;
          padding: 12px;
          background: #fff;
        }
        .qTop{ display:flex; align-items:center; justify-content:space-between; margin-bottom: 10px; }
        .optBox{
          border-top: 1px dashed #eee;
          margin-top: 12px;
          padding-top: 12px;
          display:flex;
          flex-direction:column;
          gap: 10px;
        }
        .optHead{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap: 10px;
        }
        .optRow{
          display:flex;
          gap: 10px;
          align-items:center;
        }
        .markBtn{
          width: 34px; height: 34px;
          border-radius: 10px;
          border: 1px solid #ddd;
          background: #fff;
          cursor: pointer;
          font-weight: 900;
        }
        .markBtn.on{
          border-color: ${ORANGE};
          background: ${ORANGE};
        }
        .optRow input{ flex: 1; }

        /* Summary */
        .sumRow{ display:flex; justify-content:space-between; gap: 10px; padding: 8px 10px; border: 1px solid #f2f2f2; border-radius: 12px; background:#fff; }
        .sumLabel{ font-size: 12px; color:#666; font-weight: 700; }
        .sumValue{ font-size: 13px; color:#111; font-weight: 800; text-align:right; word-break: break-word; }

        .reviewGrid{
          display:grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        @media (max-width: 820px){ .reviewGrid{ grid-template-columns: 1fr; } }
        .reviewCard{
          border: 1px solid #eee;
          border-radius: 14px;
          padding: 12px;
          background: #fff;
          display:flex;
          flex-direction:column;
          gap: 8px;
        }
        .reviewTitle{ font-weight: 900; margin-bottom: 4px; }
      `}</style>
    </>
  );
}

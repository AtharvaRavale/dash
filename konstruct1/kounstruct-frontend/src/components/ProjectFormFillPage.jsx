
// // src/components/ProjectFormFillPage.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
// import toast from "react-hot-toast";
// import {
//   createFormResponse,
//   getAssignedFormsForProject,
//   getUsersByProject,        // 🔥 NEW
//   forwardFormResponse, 
//   listFormTasks,
//   getFormResponse,         // ✅ add
//   updateFormResponse, 
//        // 🔥 NEW
// } from "../api";

// // ✅ Common regex to detect file-like labels (logo, signature, photograph etc.)
// const LABEL_FILE_REGEX = /logo|signature|stamp|photo|photograph|image/i;

// /* ------------------------------------------------------------------
//    Helper: infer field from a block (very tolerant)
// ------------------------------------------------------------------ */
// function extractFieldFromBlock(block) {
//   if (!block || typeof block !== "object") return null;

//   // 1) nested field object
//   if (block.field && block.field.key) {
//     const f = block.field;
//     const rawType = (
//       f.type ||
//       f.field_type ||
//       block.block_type ||
//       "TEXT"
//     ).toUpperCase();
//     const label = f.label || f.title || f.key;
//     const required = !!(f.required || f.is_required);

//     let type = rawType || "TEXT";
//     if (type === "TEXT_STATIC" || type === "LABEL") type = "TEXT";

//     // 👇 logo / signature / photo / image etc. => FILE
//     if (LABEL_FILE_REGEX.test(label || "")) {
//       type = "FILE";
//     }

//     return {
//       key: f.key,
//       label,
//       type,
//       config: f.config || f.field_config || {},
//       required,
//     };
//   }

//   // 2) flat block acting as a field
//   const key =
//     block.field_key ||
//     block.key ||
//     block.name ||
//     (block.meta && block.meta.key) ||
//     null;

//   if (!key) return null;

//   const rawType = (
//     block.field_type ||
//     block.input_type ||
//     block.block_type ||
//     "TEXT"
//   ).toUpperCase();

//   const label =
//     block.field_label ||
//     block.label ||
//     block.text ||
//     key;

//   const config = block.config || block.field_config || {};
//   const required = !!(block.required || block.is_required);

//   let type = rawType || "TEXT";
//   if (type === "TEXT_STATIC" || type === "LABEL") type = "TEXT";

//   if (type === "LONG_TEXT" || type === "MULTILINE") {
//     type = "TEXTAREA";
//   }

//   // 👇 logo / signature / photo / image etc. => FILE
//   if (LABEL_FILE_REGEX.test(label || "")) {
//     type = "FILE";
//   }

//   return { key, label, type, config, required };
// }

// /* ------------------------------------------------------------------
//    Schema se fields collect + AUTO logic (LEFT + HEADER + HARD fallback)
// ------------------------------------------------------------------ */
// function collectFieldsFromSchema(schema) {
//   const fields = [];
//   const seen = new Set();
//   if (!schema) return fields;

//   const addField = (field, col) => {
//     if (!field || !field.key) return;
//     if (seen.has(field.key)) {
//       console.log("⚠️ [collect] duplicate field key skipped:", field.key);
//       return;
//     }
//     console.log("➕ [collect] adding field:", field);
//     seen.add(field.key);
//     fields.push(field);

//     // store for later if needed (grid render)
//     if (col && !col._autoField) {
//       col._autoField = field;
//     }
//   };

//   const visitSectionsArray = (sections = []) => {
//     sections.forEach((sec) => {
//       const rows = sec.rows || [];
//       rows.forEach((row, rowIdx) => {
//         const columns = row.columns || row.blocks || row.cols || [];
//         columns.forEach((col, cIdx) => {
//           const blocks = col.blocks || [];
//           const colFields = col.fields || [];
//           let hasField = false;

//           // 1) block.field based fields
//           blocks.forEach((block) => {
//             const f = extractFieldFromBlock(block);
//             if (f && f.key) {
//               hasField = true;
//               addField(f, col);
//             }
//           });

//           // 2) col.fields array
//           colFields.forEach((f) => {
//             if (f && f.key) {
//               hasField = true;
//               let type = (f.type || f.field_type || "TEXT").toUpperCase();
//               if (type === "LONG_TEXT" || type === "MULTILINE") {
//                 type = "TEXTAREA";
//               }
//               const label = f.label || f.title || f.key;
//               if (LABEL_FILE_REGEX.test(label || "")) {
//                 type = "FILE";
//               }
//               addField(
//                 {
//                   key: f.key,
//                   label,
//                   type,
//                   config: f.config || f.field_config || {},
//                   required: !!(f.required || f.is_required),
//                 },
//                 col
//               );
//             }
//           });

//           // ✅ 2.5) IMAGE-only cells → auto FILE field (logo/signature/photo cells)
//           if (!hasField) {
//             const hasImageBlock = blocks.some((b) => {
//               const bt = (b.block_type || b.blockType || "").toUpperCase();
//               return bt === "IMAGE" || bt === "LOGO";
//             });

//             if (hasImageBlock) {
//               const rowTag = row.excel_row || rowIdx + 1;
//               const colTag = col.excel_col || cIdx + 1;
//               const baseKey = `cell_${rowTag}_${colTag}`;
//               const key = seen.has(baseKey) ? `${baseKey}_img` : baseKey;

//               const field = {
//                 key,
//                 label: "Image",
//                 type: "FILE",
//                 config: { hideLabel: true }, // label hide – sirf image dikhe
//                 required: false,
//               };

//               addField(field, col);
//               hasField = true;
//             }
//           }

//           // 3) AUTO FIELD logic – label/headers se generate
//           if (!hasField) {
//             const hasColFieldsAny = colFields.length > 0;
//             const hasTextBlock = blocks.some((b) => {
//               const bt = (b.block_type || b.blockType || "").toUpperCase();
//               return (
//                 (bt === "TEXT_STATIC" || bt === "TEXT") &&
//                 (b.text || b.label)
//               );
//             });
//             const hasImageBlock = blocks.some((b) => {
//               const bt = (b.block_type || b.blockType || "").toUpperCase();
//               return bt === "IMAGE" || bt === "LOGO";
//             });
//             const hasFieldBlock = blocks.some((b) => !!extractFieldFromBlock(b));

//             const isAutoEmpty =
//               !hasFieldBlock &&
//               !hasColFieldsAny &&
//               !hasTextBlock &&
//               !hasImageBlock;

//             if (isAutoEmpty) {
//               let createdFromLeft = false;

//               // 3a) LEFT label -> current blank cell
//               if (cIdx > 0) {
//                 const prevCol = columns[cIdx - 1];
//                 const prevBlocks = (prevCol && prevCol.blocks) || [];
//                 const labelBlock = prevBlocks.find((b) => {
//                   const bt = (b.block_type || b.blockType || "").toUpperCase();
//                   return (
//                     (bt === "TEXT_STATIC" || bt === "TEXT") &&
//                     (b.text || b.label)
//                   );
//                 });

//                 if (labelBlock) {
//                   const rowTag = row.excel_row || rowIdx + 1;
//                   const colTag = col.excel_col || cIdx + 1;
//                   const key = `cell_${rowTag}_${colTag}`;

//                   const labelText =
//                     labelBlock.text || labelBlock.label || key;

//                   let type = "TEXT";
//                   if (LABEL_FILE_REGEX.test(labelText || "")) {
//                     type = "FILE";
//                   }

//                   const field = {
//                     key,
//                     label: labelText,
//                     type,
//                     config: { hideLabel: true },
//                     required: false,
//                   };
//                   addField(field, col);
//                   createdFromLeft = true;
//                 }
//               }

//               // 3b) HEADER (row above) label -> current blank cell
//               if (!createdFromLeft && rowIdx > 0) {
//                 const headerRow = rows[rowIdx - 1];
//                 if (headerRow) {
//                   const headerCols =
//                     headerRow.columns ||
//                     headerRow.blocks ||
//                     headerRow.cols ||
//                     [];
//                   const headerCol = headerCols[cIdx];
//                   if (headerCol) {
//                     const headerBlocks = headerCol.blocks || [];
//                     const headerLabelBlock = headerBlocks.find((b) => {
//                       const bt = (b.block_type || b.blockType || "").toUpperCase();
//                       const txt = b.text || b.label;
//                       return (
//                         txt &&
//                         (bt === "TEXT_STATIC" || bt === "TEXT")
//                       );
//                     });

//                     if (headerLabelBlock) {
//                       const rowTag = row.excel_row || rowIdx + 1;
//                       const colTag = col.excel_col || cIdx + 1;
//                       const key = `cell_${rowTag}_${colTag}`;
//                       if (!seen.has(key)) {
//                         const labelText = String(
//                           headerLabelBlock.text ||
//                             headerLabelBlock.label ||
//                             key
//                         ).trim();

//                         let type = "TEXT";
//                         if (LABEL_FILE_REGEX.test(labelText || "")) {
//                           type = "FILE";
//                         }

//                         const field = {
//                           key,
//                           label: labelText,
//                           type,
//                           config: { hideLabel: true },
//                           required: false,
//                         };
//                         addField(field, col);
//                       }
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         });
//       });
//     });
//   };

//   if (Array.isArray(schema.sections)) {
//     visitSectionsArray(schema.sections);
//   }

//   // Flat fields at root (if any)
//   if (Array.isArray(schema.fields)) {
//     schema.fields.forEach((f) => {
//       if (f && f.key && !seen.has(f.key)) {
//         let type = (f.type || f.field_type || "TEXT").toUpperCase();
//         if (type === "LONG_TEXT" || type === "MULTILINE") {
//           type = "TEXTAREA";
//         }
//         const label = f.label || f.title || f.key;
//         if (LABEL_FILE_REGEX.test(label || "")) {
//           type = "FILE";
//         }
//         seen.add(f.key);
//         fields.push({
//           key: f.key,
//           label,
//           type,
//           config: f.config || f.field_config || {},
//           required: !!(f.required || f.is_required),
//         });
//       }
//     });
//   }

//   // HARD FALLBACK (pure Excel grid → blank cells to the right of labels)
//   if (fields.length > 0 && schema.excel_meta && Array.isArray(schema.sections)) {
//     console.log("🆘 [collect] HARD fallback from excel grid (top fields)");
//     schema.sections.forEach((sec) => {
//       const rows = sec.rows || [];
//       rows.forEach((row, rowIdx) => {
//         const columns = row.columns || row.blocks || row.cols || [];
//         columns.forEach((col, cIdx) => {
//           if (cIdx === 0) return;
//           const prevCol = columns[cIdx - 1];
//           if (!prevCol) return;

//           const prevBlocks = prevCol.blocks || [];
//           const labelBlock = prevBlocks.find((b) => {
//             const bt = (b.block_type || b.blockType || "").toUpperCase();
//             const txt = b.text || b.label;
//             return txt && (bt === "TEXT_STATIC" || bt === "TEXT");
//           });

//           if (!labelBlock) return;

//           const rowTag = row.excel_row || rowIdx + 1;
//           const colTag = col.excel_col || cIdx + 1;
//           const key = `cell_${rowTag}_${colTag}`;
//           if (seen.has(key)) return;

//           const labelText = String(
//             labelBlock.text || labelBlock.label || key
//           ).trim();

//           let type = "TEXT";
//           if (LABEL_FILE_REGEX.test(labelText || "")) {
//             type = "FILE";
//           }

//           const field = {
//             key,
//             label: labelText,
//             type,
//             config: { hideLabel: true },
//             required: false,
//           };
//           addField(field, col);
//         });
//       });
//     });
//   }

//   console.log("🧩 [collect] FINAL fields:", fields);
//   return fields;
// }

// /* ==================================================================
//    MAIN COMPONENT
// ================================================================== */
// const ProjectFormFillPage = () => {
//   const [searchParams] = useSearchParams();
//   const location = useLocation();
//   const navigate = useNavigate();

//   const qpProjectId = searchParams.get("project_id") || "";
// const qpAssignmentId =
//   searchParams.get("assignment_id") ||
//   searchParams.get("form_assignment_id") ||
//   searchParams.get("assignment") ||
//   searchParams.get("id") ||
//   "";


//   const qpResponseId = searchParams.get("response_id") || "";
// const [responseId, setResponseId] = useState(
//   qpResponseId ? Number(qpResponseId) : null
// );
// const [responsePayload, setResponsePayload] = useState(null);
// const [responseLoading, setResponseLoading] = useState(Boolean(qpResponseId));


//   const [projectId] = useState(qpProjectId);
//   const [assignment, setAssignment] = useState(
//     () => location.state?.assignment || null
//   );

//   // 👇 image width+height per field, and which image is selected
//   const [imageSizes, setImageSizes] = useState({});
//   const [activeImageKey, setActiveImageKey] = useState(null);
//   const getImageSize = (fieldKey) =>
//     imageSizes[fieldKey] || { width: 120, height: 60 }; // default size

//   const [formValues, setFormValues] = useState({});
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(!location.state?.assignment);
//   const [submitting, setSubmitting] = useState(false);

//   // 🔥 NEW: project users + forward state
//   const [projectUsers, setProjectUsers] = useState([]);
//   const [usersLoading, setUsersLoading] = useState(false);
//   const [forwardToUserId, setForwardToUserId] = useState("");
//   const [forwardDecision, setForwardDecision] = useState("APPROVED"); // ACCEPT by default

//   useEffect(() => {
//     console.log("📦 [Fill] assignment object:", assignment);
//     console.log(
//       "📦 [Fill] template_version_detail:",
//       assignment?.template_version_detail
//     );
//   }, [assignment]);
// useEffect(() => {
//   if (assignment || !projectId || !qpAssignmentId) return;

//   const normalizeList = (res) => {
//     const d = res?.data;
//     if (Array.isArray(d)) return d;
//     if (Array.isArray(d?.results)) return d.results;
//     return [];
//   };
  



//   const load = async () => {
//     setLoading(true);
//     try {
//       // 1) Try assignments (admin scope)
//       const res = await getAssignedFormsForProject(projectId);
//       const list = normalizeList(res);

//       const found = list.find((a) => String(a.id) === String(qpAssignmentId));
//       if (found) {
//         setAssignment(found);
//         return;
//       }

//       // 2) ✅ Fallback: tasks (user scope) -> redirect to task fill page
//       const tRes = await listFormTasks({ project_id: Number(projectId) });
//       const tasks = normalizeList(tRes);

//       const task =
//         tasks.find((t) => String(t.assignment_id) === String(qpAssignmentId)) ||
//         tasks.find((t) => String(t.assignment) === String(qpAssignmentId)) ||
//         null;

//       if (task?.id) {
//         // receiver/assignee should edit via tasks page
//         navigate(`/forms/tasks/${task.id}`);
//         return;
//       }

//       console.log("❌ Assigned forms list:", list);
//       console.log("❌ Tasks list:", tasks);

//       toast.error(
//         `Form assignment not found in assignments or tasks. project_id=${projectId}, assignment_id=${qpAssignmentId}`
//       );
//       navigate("/project-forms");
//     } catch (err) {
//       console.error("Failed to load assignment for fill page", err);
//       toast.error("Failed to load form details");
//       navigate("/project-forms");
//     } finally {
//       setLoading(false);
//     }
//   };

//   load();
// }, [assignment, projectId, qpAssignmentId, navigate]);
// const normalizeAnswersForSubmit = async (values) => {
//   const out = { ...(values || {}) };

//   for (const [k, v] of Object.entries(out)) {
//     if (v instanceof File) {
//       // safety: 1.5MB cap (change if needed)
//       if (v.size > 1.5 * 1024 * 1024) {
//         throw new Error(`File too large for ${k}. Please upload smaller image.`);
//       }
//       out[k] = await fileToDataUrl(v); // ✅ base64
//     }
//   }
//   return out;
// };
// const fileToDataUrl = (file) =>
//   new Promise((resolve, reject) => {
//     const r = new FileReader();
//     r.onload = () => resolve(r.result);
//     r.onerror = reject;
//     r.readAsDataURL(file);
//   });

//   // load assignment
// //   useEffect(() => {
// //     if (assignment || !projectId || !qpAssignmentId) return;

// //     const load = async () => {
// //       setLoading(true);
// //       try {
// //         const res = await getAssignedFormsForProject(projectId, {
// //           assignment_id: qpAssignmentId,
// //         });
// //         const data = res.data || [];
// //         if (!data.length) {
// //           toast.error("Form assignment not found for this project.");
// //           navigate("/project-forms");
// //           return;
// //         }
// //         setAssignment(data[0]);
// //       } catch (err) {
// //         console.error("Failed to load assignment for fill page", err);
// //         toast.error("Failed to load form details");
// //         navigate("/project-forms");
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     load();
// //   }, [assignment, projectId, qpAssignmentId, navigate]);

//   // 🔥 NEW: load project users once projectId available
//   useEffect(() => {
//     if (!projectId) return;

//     const loadUsers = async () => {
//       setUsersLoading(true);
//       try {
//         const res = await getUsersByProject(projectId);
//         const data = res.data || [];
//         setProjectUsers(Array.isArray(data) ? data : []);
//       } catch (err) {
//         console.error("Failed to load project users", err);
//         toast.error("Failed to load project users.");
//       } finally {
//         setUsersLoading(false);
//       }
//     };

//     loadUsers();
//   }, [projectId]);

//   const schema = assignment?.template_version_detail?.schema || {};

//   const allFields = useMemo(() => collectFieldsFromSchema(schema), [schema]);

//   // Map by key (cell_.. or normal)
//   const fieldMapByKey = useMemo(() => {
//     const map = {};
//     allFields.forEach((f) => {
//       if (f && f.key) map[f.key] = f;
//     });
//     return map;
//   }, [allFields]);

//   useEffect(() => {
//     console.log("📄 [Fill] raw schema:", schema);
//     console.log("📄 [Fill] allFields:", allFields);
//   }, [schema, allFields]);
// const prefillAnswers = useMemo(() => {
//   const a = responsePayload?.answers || responsePayload?.data || {};
//   // backend me file fields {} aa rahe hain, use null treat karo
//   const cleaned = {};
//   Object.entries(a || {}).forEach(([k, v]) => {
//     if (v && typeof v === "object" && !(v instanceof File) && !Array.isArray(v)) {
//       cleaned[k] = Object.keys(v).length ? v : null; // {} -> null
//     } else {
//       cleaned[k] = v;
//     }
//   });
//   return cleaned;
// }, [responsePayload]);
// useEffect(() => {
//   if (!responseId) return;

//   let mounted = true;
//   (async () => {
//     try {
//       setResponseLoading(true);
//       const res = await getFormResponse(responseId);
//       const data = res?.data ?? res;
//       if (!mounted) return;
//       setResponsePayload(data);
//     } catch (e) {
//       console.error(e);
//       toast.error(e?.response?.data?.detail || "Failed to load response.");
//     } finally {
//       if (mounted) setResponseLoading(false);
//     }
//   })();

//   return () => {
//     mounted = false;
//   };
// }, [responseId]);


// useEffect(() => {
//   if (!assignment) return;

//   const initial = {};
//   allFields.forEach((field) => {
//     const key = field.key;
//     if (!key) return;

//     const cfg = field.config || {};
//     if (field.default !== undefined && field.default !== null) initial[key] = field.default;
//     else if (cfg.default !== undefined && cfg.default !== null) initial[key] = cfg.default;
//     else initial[key] = field.type === "FILE" ? null : "";
//   });

//   // ✅ IMPORTANT: prefillAnswers merge
//   setFormValues({ ...initial, ...prefillAnswers });
//   setErrors({});
// }, [assignment, allFields, prefillAnswers]);


// //   useEffect(() => {
// //     if (!assignment) return;

// //     const initial = {};
// //     allFields.forEach((field) => {
// //       const key = field.key;
// //       if (!key) return;

// //       const cfg = field.config || {};
// //       if (field.default !== undefined && field.default !== null) {
// //         initial[key] = field.default;
// //       } else if (cfg.default !== undefined && cfg.default !== null) {
// //         initial[key] = cfg.default;
// //       } else {
// //         initial[key] = field.type === "FILE" ? null : "";
// //       }
// //     });
// //     setFormValues(initial);
// //     setErrors({});
// //   }, [assignment, allFields]);

//   const getFieldLabel = (field) =>
//     field.label || field.title || field.key || "Field";

//   const isFieldRequired = (field) => {
//     const cfg = field.config || {};
//     return !!(field.required || field.is_required || cfg.required);
//   };

//   const handleChange = (key, value) => {
//     setFormValues((prev) => ({ ...prev, [key]: value }));
//   };

//   const validate = () => {
//     const newErrors = {};
//     allFields.forEach((field) => {
//       if (!field.key) return;
//       if (!isFieldRequired(field)) return;

//       const v = formValues[field.key];
//       const isEmpty =
//         v === undefined ||
//         v === null ||
//         v === "" ||
//         (Array.isArray(v) && v.length === 0);

//       if (isEmpty) newErrors[field.key] = "Required";
//     });
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

// //   const handleSubmit = async (status = "SUBMITTED") => {
// //     if (!assignment || !projectId) return;

// //     if (status !== "DRAFT" && !validate()) {
// //       toast.error("Please fill all required fields.");
// //       return;
// //     }

// //     const tv = assignment.template_version_detail || {};
// //     const templateVersionId = tv.id;

// //     if (!templateVersionId) {
// //       toast.error("Invalid form version.");
// //       return;
// //     }

// //     const payload = {
// //       template_version: templateVersionId,
// //       assignment: assignment.id,
// //       project_id: Number(projectId),
// //       client_id: assignment.client_id || null,
// //       related_object_type: "",
// //       related_object_id: "",
// //       status,
// //       answers: formValues,
// //     };

// //     setSubmitting(true);
// //     try {
// //       // 1️⃣ response create karo
// //       const res = await createFormResponse(payload);
// //       const created = res.data || {};
// //       const responseId = created.id;

// //       // 2️⃣ agar forward user select hai, to forward bhi karo
// //       if (responseId && forwardToUserId) {
// //         try {
// //           await forwardFormResponse(responseId, {
// //             to_user_id: Number(forwardToUserId),
// //             decision: forwardDecision, // "APPROVED" | "REJECTED"
// //           });

// //           toast.success(
// //             status === "DRAFT"
// //               ? "Form saved as draft and forwarded."
// //               : "Form submitted and forwarded."
// //           );
// //         } catch (fErr) {
// //           console.error("Forwarding failed", fErr);
// //           toast.error(
// //             status === "DRAFT"
// //               ? "Form saved as draft, but forwarding failed."
// //               : "Form submitted, but forwarding failed."
// //           );
// //         }
// //       } else {
// //         // normal success
// //         toast.success(
// //           status === "DRAFT" ? "Form saved as draft." : "Form submitted."
// //         );
// //       }

// //       navigate(`/project-forms?project_id=${projectId}`);
// //     } catch (err) {
// //       console.error("Failed to submit form response", err);
// //       const data = err.response?.data;
// //       if (data && typeof data === "object") {
// //         toast.error("Failed to submit: " + (data.detail || "See console"));
// //       } else {
// //         toast.error("Failed to submit form.");
// //       }
// //     } finally {
// //       setSubmitting(false);
// //     }
// //   };

// const handleSubmit = async (status = "SUBMITTED") => {
//   if (!assignment || !projectId) return;

//   if (status !== "DRAFT" && !validate()) {
//     toast.error("Please fill all required fields.");
//     return;
//   }

//   const tv = assignment.template_version_detail || {};
//   const templateVersionId = tv.id;
//   if (!templateVersionId) {
//     toast.error("Invalid form version.");
//     return;
//   }

//   setSubmitting(true);
//   try {
//     // ✅ convert File -> base64 so it actually saves
//     const finalAnswers = await normalizeAnswersForSubmit(formValues);

//     let savedResponseId = responseId;

//     if (savedResponseId) {
//       // ✅ EDIT MODE (prefilled response)
//       await updateFormResponse(savedResponseId, {
//         status,
//         answers: finalAnswers,
//         data: finalAnswers,      // safe
//       });
//     } else {
//       // ✅ CREATE MODE
//       const payload = {
//         template_version: templateVersionId,
//         assignment: assignment.id,
//         project_id: Number(projectId),
//         client_id: assignment.client_id || null,
//         related_object_type: "",
//         related_object_id: "",
//         status,
//         answers: finalAnswers,
//         data: finalAnswers,
//       };

//       const res = await createFormResponse(payload);
//       const created = res.data || {};
//       savedResponseId = created.id;
//       setResponseId(savedResponseId);
//     }

//     // ✅ forward on same response id
//     if (savedResponseId && forwardToUserId) {
//       await forwardFormResponse(savedResponseId, {
//         to_user_id: Number(forwardToUserId),
//         decision: forwardDecision,
//       });
//       toast.success(status === "DRAFT" ? "Saved (draft) and forwarded." : "Submitted and forwarded.");
//     } else {
//       toast.success(status === "DRAFT" ? "Saved as draft." : "Submitted.");
//     }

//     navigate(`/project-forms?project_id=${projectId}`);
//   } catch (err) {
//     console.error(err);
//     toast.error(err?.response?.data?.detail || err?.message || "Failed to submit.");
//   } finally {
//     setSubmitting(false);
//   }
// };


//   // 🔧 FILE + normal fields (unchanged)
//   const renderField = (field, opts = {}) => {
//     if (!field || !field.key) return null;
//     const { compact = false } = opts;

//     const key = field.key;
//     const label = getFieldLabel(field);
//     const value = formValues[key];
//     const error = errors[key];

//     const rawType = (field.type || field.field_type || "TEXT").toUpperCase();
//     const cfg = field.config || {};
//     const placeholder = cfg.placeholder || "";
//     const options = field.options || cfg.options || [];
//     const hideLabel = cfg.hideLabel;

//     const showLabel = !compact && !hideLabel;

//     const commonLabel = showLabel ? (
//       <label className="block text-[11px] font-medium mb-1">
//         {label}
//         {isFieldRequired(field) && (
//           <span className="text-red-500 ml-0.5">*</span>
//         )}
//       </label>
//     ) : null;

//     const commonError = error ? (
//       <div className="text-[10px] text-red-500 mt-0.5">{error}</div>
//     ) : null;

//     const inputBase =
//       "w-full border rounded text-xs " +
//       (compact ? "px-1 py-[3px]" : "px-2 py-1");

//     const isFileLike =
//       rawType === "FILE" ||
//       rawType === "IMAGE" ||
//       rawType === "LOGO" ||
//       rawType.includes("FILE") ||
//       rawType.includes("UPLOAD") ||
//       rawType.includes("IMAGE");

//     // ✅ FILE / IMAGE fields: image preview + click -> top panel sliders
//     if (isFileLike) {
//       let previewUrl = null;

//       if (value) {
//         if (typeof value === "string") {
//           previewUrl = value;
//         } else if (value instanceof File) {
//           previewUrl = URL.createObjectURL(value);
//         }
//       }

//       const { width: imgWidth, height: imgHeight } = getImageSize(key);

//       const clearImage = () => {
//         // clear value
//         handleChange(key, null);

//         // clear sliders state
//         setImageSizes((prev) => {
//           const next = { ...prev };
//           delete next[key];
//           return next;
//         });

//         // close top slider panel if this was active
//         setActiveImageKey((prev) => (prev === key ? null : prev));
//       };

//       return (
//         <div key={key} className={compact ? "" : "mb-2"}>
//           {commonLabel}

//           {previewUrl && (
//             <div className="flex flex-col items-center mb-1 relative">
//               {/* ❌ Clear button */}
//               <button
//                 type="button"
//                 onClick={clearImage}
//                 className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] shadow"
//                 title="Remove image"
//               >
//                 ×
//               </button>

//               <img
//                 src={previewUrl}
//                 alt={label}
//                 className="object-contain cursor-pointer"
//                 style={{ maxHeight: imgHeight, maxWidth: imgWidth }}
//                 onClick={() => {
//                   // image select -> open top panel
//                   setActiveImageKey(key);
//                   if (!imageSizes[key]) {
//                     setImageSizes((prev) => ({
//                       ...prev,
//                       [key]: { width: 120, height: 60 },
//                     }));
//                   }
//                 }}
//               />
//               <div className="text-[9px] text-gray-400 mt-0.5">
//                 Click image to adjust size above
//               </div>
//             </div>
//           )}

//           <input
//             type="file"
//             className={inputBase}
//             onChange={(e) => {
//               const file = e.target.files && e.target.files[0];
//               handleChange(key, file || null);

//               // Agar pehli baar file choose kar rahe ho toh default size set karo
//               if (file && !imageSizes[key]) {
//                 setImageSizes((prev) => ({
//                   ...prev,
//                   [key]: { width: 120, height: 60 },
//                 }));
//               }
//             }}
//             accept={cfg.accept || ".png,.jpg,.jpeg,.webp,.svg,.pdf"}
//           />

//           {value && value.name && value instanceof File && (
//             <div className="mt-1 text-[10px] text-gray-600">
//               Selected: {value.name}
//             </div>
//           )}

//           {commonError}
//         </div>
//       );
//     }

//     // ---- normal fields below ----
//     switch (rawType) {
//       case "TEXT":
//       case "PHONE":
//       case "EMAIL":
//       case "NUMBER":
//         return (
//           <div key={key} className={compact ? "" : "mb-2"}>
//             {commonLabel}
//             <input
//               type={rawType === "NUMBER" ? "number" : "text"}
//               className={inputBase}
//               value={value ?? ""}
//               placeholder={placeholder}
//               onChange={(e) => handleChange(key, e.target.value)}
//             />
//             {commonError}
//           </div>
//         );

//       case "DATE":
//         return (
//           <div key={key} className={compact ? "" : "mb-2"}>
//             {commonLabel}
//             <input
//               type="date"
//               inputMode="date"
//               className={inputBase + " text-[10px] tracking-tight"}
//               value={value ?? ""}
//               placeholder={placeholder || "dd-mm-yyyy"}
//               onChange={(e) => handleChange(key, e.target.value)}
//             />
//             {commonError}
//           </div>
//         );

//       case "TEXTAREA":
//         return (
//           <div key={key} className={compact ? "" : "mb-2"}>
//             {commonLabel}
//             <textarea
//               className={
//                 inputBase + " min-h-[80px] " + (compact ? "resize-none" : "")
//               }
//               value={value ?? ""}
//               placeholder={placeholder}
//               onChange={(e) => handleChange(key, e.target.value)}
//             />
//             {commonError}
//           </div>
//         );

//       case "DROPDOWN":
//       case "SELECT":
//         return (
//           <div key={key} className={compact ? "" : "mb-2"}>
//             {commonLabel}
//             <select
//               className={inputBase + " bg-white"}
//               value={value ?? ""}
//               onChange={(e) => handleChange(key, e.target.value)}
//             >
//               <option value="">Select...</option>
//               {Array.isArray(options) &&
//                 options.map((opt) => {
//                   if (typeof opt === "string") {
//                     return (
//                       <option key={opt} value={opt}>
//                         {opt}
//                       </option>
//                     );
//                   }
//                   const val = opt.value ?? opt.code ?? opt.id;
//                   const lbl = opt.label ?? opt.name ?? String(val);
//                   return (
//                     <option key={val} value={val}>
//                       {lbl}
//                     </option>
//                   );
//                 })}
//             </select>
//             {commonError}
//           </div>
//         );

//       case "BOOLEAN":
//       case "CHECKBOX":
//         return (
//           <div
//             key={key}
//             className={
//               "flex items-center gap-2 " + (compact ? "" : "mb-2")
//             }
//           >
//             <input
//               type="checkbox"
//               checked={!!value}
//               onChange={(e) => handleChange(key, e.target.checked)}
//             />
//             <span className="text-[11px]">
//               {label}
//               {isFieldRequired(field) && (
//                 <span className="text-red-500 ml-0.5">*</span>
//               )}
//             </span>
//             {commonError}
//           </div>
//         );

//       default:
//         return (
//           <div key={key} className={compact ? "" : "mb-2"}>
//             {commonLabel}
//             <input
//               type="text"
//               className={inputBase}
//               value={value ?? ""}
//               placeholder={placeholder}
//               onChange={(e) => handleChange(key, e.target.value)}
//             />
//             {commonError}
//           </div>
//         );
//     }
//   };

//   /* ------------------------------------------------------------------
//      TOP SLIDER PANEL FOR ACTIVE IMAGE
//   ------------------------------------------------------------------ */
//   const renderImageSizePanel = () => {
//     if (!activeImageKey) return null;

//     const { width, height } = getImageSize(activeImageKey);
//     const field = allFields.find((f) => f.key === activeImageKey);
//     const label = field ? getFieldLabel(field) : activeImageKey;

//     return (
//       <div className="sticky top-0 z-40 mb-3 bg-white border border-purple-200 rounded-md shadow-sm p-2">
//         <div className="flex items-center justify-between gap-2 mb-1">
//           <div className="text-[11px]">
//             <span className="font-semibold">Adjust image size</span>{" "}
//             <span className="text-gray-500">({label})</span>
//           </div>
//           <button
//             type="button"
//             onClick={() => setActiveImageKey(null)}
//             className="text-[11px] px-2 py-0.5 border rounded bg-purple-50 hover:bg-purple-100"
//           >
//             Close
//           </button>
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//           <div>
//             <input
//               type="range"
//               min={60}
//               max={260}
//               value={width}
//               onChange={(e) => {
//                 const w = Number(e.target.value);
//                 setImageSizes((prev) => {
//                   const current = prev[activeImageKey] || {
//                     width: 120,
//                     height,
//                   };
//                   return {
//                     ...prev,
//                     [activeImageKey]: { ...current, width: w },
//                   };
//                 });
//               }}
//               className="w-full"
//             />
//             <div className="text-[10px] text-gray-500">
//               Logo width: {width}px
//             </div>
//           </div>
//           <div>
//             <input
//               type="range"
//               min={30}
//               max={160}
//               value={height}
//               onChange={(e) => {
//                 const h = Number(e.target.value);
//                 setImageSizes((prev) => {
//                   const current = prev[activeImageKey] || {
//                     width,
//                     height: 60,
//                   };
//                   return {
//                     ...prev,
//                     [activeImageKey]: { ...current, height: h },
//                   };
//                 });
//               }}
//               className="w-full"
//             />
//             <div className="text-[10px] text-gray-500">
//               Logo height: {height}px
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   /* ------------------------------------------------------------------
//      Layout: sections -> rows -> columns -> Excel-style grid
//   ------------------------------------------------------------------ */
//   const renderBody = () => {
//     if (!schema || (!schema.sections && !schema.fields)) {
//       return (
//         <div className="text-sm text-gray-500">
//           No schema defined for this form.
//         </div>
//       );
//     }

//     // CASE 1: sections
//     if (Array.isArray(schema.sections) && schema.sections.length) {
//       const meta = schema.excel_meta || null;
//       const hasExcelMeta = !!meta;

//       const sectionsUI = schema.sections.map((sec, sIdx) => {
//         const rows = sec.rows || [];
//         if (!rows.length) return null;

//         return (
//           <div
//             key={sec.key || sec.id || sIdx}
//             className="border rounded-md bg-white mb-4 overflow-x-auto"
//           >
//             {sec.title && (
//               <div className="px-3 py-2 border-b">
//                 <h2 className="text-sm font-semibold">{sec.title}</h2>
//               </div>
//             )}

//             <div className="min-w-[700px]">
//               {hasExcelMeta ? (
//                 (() => {
//                   const metaColWidths = meta.col_widths || [];
//                   const minCol = meta.min_col || 1;

//                   const firstRowCols =
//                     rows[0]?.columns ||
//                     rows[0]?.blocks ||
//                     rows[0]?.cols ||
//                     [];

//                   const nCols =
//                     metaColWidths.length || (firstRowCols.length || 1);

//                   // 🔎 header labels (top row)
//                   let headerLabels = [];
//                   if (rows.length) {
//                     const headerRow = rows[0];
//                     const headerCols =
//                       headerRow.columns ||
//                       headerRow.blocks ||
//                       headerRow.cols ||
//                       [];
//                     headerLabels = headerCols.map((col) => {
//                       const blocks = col.blocks || [];
//                       const textBlock = blocks.find((b) => {
//                         const bt = (b.block_type || b.blockType || "").toUpperCase();
//                         const txt = b.text || b.label;
//                         return (
//                           txt &&
//                           (bt === "TEXT_STATIC" || bt === "TEXT")
//                         );
//                       });
//                       return textBlock
//                         ? String(
//                             textBlock.text || textBlock.label || ""
//                           )
//                             .trim()
//                             .toLowerCase()
//                         : "";
//                     });
//                   }

//                   // base widths from Excel or equal
//                   let colWidths = [...metaColWidths];
//                   if (!colWidths.length) {
//                     colWidths = new Array(nCols).fill(1);
//                   }

//                   // 📏 widen date-ish columns thoda
//                   colWidths = colWidths.map((w, idx) => {
//                     const label = headerLabels[idx] || "";
//                     if (
//                       label.includes("target date") ||
//                       label.includes("status on (date)") ||
//                       label.includes("status on ")
//                     ) {
//                       return (w || 1) * 1.5;
//                     }
//                     return w || 1;
//                   });

//                   const totalUnits =
//                     colWidths.reduce((sum, w) => sum + (w || 0), 0) || 1;

//                   const gridTemplateColumns = colWidths
//                     .map((w) => `${(w / totalUnits) * 100}%`)
//                     .join(" ");

//                   const rowHeights = rows.map((row) => row.height || 20);
//                   const gridTemplateRows = rowHeights
//                     .map((h) => `${h + 4}px`)
//                     .join(" ");

//                   return (
//                     <div
//                       className="grid text-[11px]"
//                       style={{
//                         gridTemplateColumns,
//                         gridTemplateRows,
//                       }}
//                     >
//                       {rows.map((row, rIdx) => {
//                         const columns =
//                           row.columns || row.blocks || row.cols || [];
//                         return columns.map((col, cIdx) => {
//                           const merge = col.merge || {};
//                           const isMerged = !!merge.is_merged;
//                           const isTopLeft = merge.is_top_left !== false;

//                           if (isMerged && !isTopLeft) {
//                             return null;
//                           }

//                           const rowSpan = merge.row_span || 1;
//                           const colSpan = merge.col_span || 1;

//                           const blocks = col.blocks || [];
//                           const colFields = col.fields || [];

//                           const rowTag = row.excel_row || rIdx + 1;
//                           const colTag = col.excel_col || cIdx + 1;
//                           const coordKey = `cell_${rowTag}_${colTag}`;

//                           let fieldToRender =
//                             fieldMapByKey[coordKey] || null;

//                           if (!fieldToRender && blocks.length) {
//                             const fromBlocks = blocks
//                               .map((b) => extractFieldFromBlock(b))
//                               .find((f) => f && f.key);
//                             if (fromBlocks) fieldToRender = fromBlocks;
//                           }

//                           if (!fieldToRender && colFields.length) {
//                             const raw = colFields.find((f) => f && f.key);
//                             if (raw) {
//                               let type = (
//                                 raw.type ||
//                                 raw.field_type ||
//                                 "TEXT"
//                               ).toUpperCase();
//                               if (
//                                 type === "LONG_TEXT" ||
//                                 type === "MULTILINE"
//                               ) {
//                                 type = "TEXTAREA";
//                               }
//                               const label =
//                                 raw.label || raw.title || raw.key;
//                               if (LABEL_FILE_REGEX.test(label || "")) {
//                                 type = "FILE";
//                               }
//                               fieldToRender = {
//                                 key: raw.key,
//                                 label,
//                                 type,
//                                 config:
//                                   raw.config || raw.field_config || {},
//                                 required: !!(
//                                   raw.required || raw.is_required
//                                 ),
//                               };
//                             }
//                           }

//                           if (!fieldToRender && col._autoField) {
//                             fieldToRender = col._autoField;
//                           }

//                           const textBlocks = blocks.filter((b) => {
//                             const bt = (b.block_type || "").toUpperCase();
//                             return (
//                               bt === "TEXT_STATIC" || bt === "TEXT"
//                             );
//                           });

//                           const imageBlocks = blocks.filter((b) => {
//                             const bt = (b.block_type || "").toUpperCase();
//                             return (
//                               bt === "IMAGE" || bt === "LOGO"
//                             );
//                           });

//                           // LAST chance: match by label text
//                           if (!fieldToRender && textBlocks.length) {
//                             const labelTextRaw = textBlocks
//                               .map((b) => b.text || b.label || "")
//                               .join(" ")
//                               .trim();

//                             if (labelTextRaw) {
//                               const matched = allFields.find(
//                                 (f) =>
//                                   (f.label || "").trim() ===
//                                   labelTextRaw
//                               );
//                               if (matched) {
//                                 console.log(
//                                   "🔗 [Fill] matched field by label:",
//                                   labelTextRaw,
//                                   "->",
//                                   matched.key
//                                 );
//                                 fieldToRender = matched;
//                               }
//                             }
//                           }

//                           const startCol =
//                             (col.excel_col || cIdx + minCol) -
//                             minCol +
//                             1;
//                           const startRow = rIdx + 1;

//                           // 👉 inline rule: 1 label + 1 simple field => label and input on same line
//                           let canInline = false;
//                           if (textBlocks.length === 1 && fieldToRender) {
//                             const fType = (
//                               fieldToRender.type ||
//                               fieldToRender.field_type ||
//                               "TEXT"
//                             ).toUpperCase();
//                             const isFile =
//                               fType === "FILE" ||
//                               fType === "IMAGE" ||
//                               fType === "LOGO" ||
//                               fType.includes("FILE") ||
//                               fType.includes("UPLOAD") ||
//                               fType.includes("IMAGE");
//                             const isTextarea =
//                               fType === "TEXTAREA" ||
//                               fType === "LONG_TEXT" ||
//                               fType === "MULTILINE";

//                             if (!isFile && !isTextarea) {
//                               canInline = true;
//                             }
//                           }

//                           return (
//                             <div
//                               key={`${rIdx}-${cIdx}`}
//                               className="border border-gray-200 p-1 align-top"
//                               style={{
//                                 gridColumnStart: startCol,
//                                 gridColumnEnd: startCol + colSpan,
//                                 gridRowStart: startRow,
//                                 gridRowEnd: startRow + rowSpan,
//                               }}
//                             >
//                               {canInline ? (
//                                 <div className="flex items-center gap-1">
//                                   <span className="whitespace-nowrap">
//                                     {textBlocks[0].text ||
//                                       textBlocks[0].label ||
//                                       ""}
//                                   </span>
//                                   <div className="flex-1">
//                                     {renderField(fieldToRender, {
//                                       compact: true,
//                                     })}
//                                   </div>
//                                 </div>
//                               ) : (
//                                 <>
//                                   {textBlocks.length > 0 && (
//                                     <div className="whitespace-pre-wrap leading-tight">
//                                       {textBlocks.map((b, idx2) => (
//                                         <div key={idx2}>
//                                           {b.text || b.label || ""}
//                                         </div>
//                                       ))}
//                                     </div>
//                                   )}

//                                   {/* Placeholder only if koi interactive field nahi hai */}
//                                   {imageBlocks.length > 0 && !fieldToRender && (
//                                     <div className="mt-1 text-[10px] text-gray-400 italic">
//                                       [Logo / image placeholder]
//                                     </div>
//                                   )}

//                                   {fieldToRender && (
//                                     <div
//                                       className={
//                                         textBlocks.length ? "mt-1" : ""
//                                       }
//                                     >
//                                       {renderField(fieldToRender, {
//                                         compact: true,
//                                       })}
//                                     </div>
//                                   )}
//                                 </>
//                               )}
//                             </div>
//                           );
//                         });
//                       })}
//                     </div>
//                   );
//                 })()
//               ) : (
//                 // non-excel layout
//                 (sec.rows || []).map((row, rIdx) => {
//                   const columns = row.columns || row.blocks || row.cols || [];
//                   if (!columns.length) return null;

//                   const totalUnits =
//                     columns.reduce(
//                       (sum, c) =>
//                         sum +
//                         (typeof c.width === "number" ? c.width : 1),
//                       0
//                     ) || 1;

//                   return (
//                     <div key={row.id || rIdx} className="flex">
//                       {columns.map((col, cIdx) => {
//                         const blocks = col.blocks || [];
//                         const colFields = col.fields || [];

//                         let fieldToRender = null;

//                         if (blocks.length) {
//                           const fromBlocks = blocks
//                             .map((b) => extractFieldFromBlock(b))
//                             .find((f) => f && f.key);
//                           if (fromBlocks) fieldToRender = fromBlocks;
//                         }

//                         if (!fieldToRender && colFields.length) {
//                           const raw = colFields.find((f) => f && f.key);
//                           if (raw) {
//                             let type = (
//                               raw.type || raw.field_type || "TEXT"
//                             ).toUpperCase();
//                             if (
//                               type === "LONG_TEXT" ||
//                               type === "MULTILINE"
//                             ) {
//                               type = "TEXTAREA";
//                             }
//                             const label =
//                               raw.label || raw.title || raw.key;
//                             if (LABEL_FILE_REGEX.test(label || "")) {
//                               type = "FILE";
//                             }
//                             fieldToRender = {
//                               key: raw.key,
//                               label,
//                               type,
//                               config:
//                                 raw.config || raw.field_config || {},
//                               required: !!(
//                                 raw.required || raw.is_required
//                               ),
//                             };
//                           }
//                         }

//                         if (!fieldToRender && col._autoField) {
//                           fieldToRender = col._autoField;
//                         }

//                         const textBlocks = blocks.filter((b) => {
//                           const bt = (b.block_type || "").toUpperCase();
//                           return (
//                             bt === "TEXT_STATIC" || bt === "TEXT"
//                           );
//                         });

//                         const imageBlocks = blocks.filter((b) => {
//                           const bt = (b.block_type || "").toUpperCase();
//                           return (
//                             bt === "IMAGE" || bt === "LOGO"
//                           );
//                         });

//                         const widthUnits =
//                           typeof col.width === "number" ? col.width : 1;
//                         const widthPercent =
//                           (widthUnits / totalUnits) * 100;

//                         return (
//                           <div
//                             key={cIdx}
//                             className="border border-gray-200 px-2 py-1 align-top text-[11px]"
//                             style={{
//                               flexBasis: `${widthPercent}%`,
//                               maxWidth: `${widthPercent}%`,
//                             }}
//                           >
//                             {textBlocks.length > 0 && (
//                               <div className="whitespace-pre-wrap leading-tight">
//                                 {textBlocks.map((b, idx2) => (
//                                   <div key={idx2}>
//                                     {b.text || b.label || ""}
//                                   </div>
//                                 ))}
//                               </div>
//                             )}

//                             {imageBlocks.length > 0 && !fieldToRender && (
//                               <div className="mt-1 text-[10px] text-gray-400 italic">
//                                 [Logo / image placeholder]
//                               </div>
//                             )}

//                             {fieldToRender && (
//                               <div className={textBlocks.length ? "mt-1" : ""}>
//                                 {renderField(fieldToRender)}
//                               </div>
//                             )}
//                           </div>
//                         );
//                       })}
//                     </div>
//                   );
//                 })
//               )}
//             </div>
//           </div>
//         );
//       });

//       return <>{sectionsUI}</>;
//     }

//     // CASE 2: flat fields
//     if (Array.isArray(schema.fields)) {
//       return (
//         <div className="border rounded-md bg-white p-3">
//           {schema.fields.map((f) =>
//             renderField({
//               key: f.key,
//               label: f.label || f.title || f.key,
//               type: (f.type || f.field_type || "TEXT").toUpperCase(),
//               config: f.config || f.field_config || {},
//               required: !!(f.required || f.is_required),
//             })
//           )}
//         </div>
//       );
//     }

//     return (
//       <div className="text-sm text-gray-500">
//         Schema format not recognized.
//       </div>
//     );
//   };

//   if (!projectId || !qpAssignmentId) {
//     return (
//       <div className="p-4 text-sm text-gray-600">
//         <h1 className="text-lg font-semibold">Fill Form</h1>
//         <p>Missing project or assignment information.</p>
//       </div>
//     );
//   }

//   const tv = assignment?.template_version_detail || {};
//   const tpl = tv.template_detail || {};
//   const formTitle = tpl.name || tv.title || `Form v${tv.version || "-"}`;
//   const formCode = tpl.code;

//   return (
//     <div className="p-4 space-y-4">
//       {/* 🔝 Global logo resize panel */}
//       {renderImageSizePanel()}

//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
//         <div>
//           <h1 className="text-lg font-semibold">Fill Form: {formTitle}</h1>
//           <p className="text-xs text-gray-500">
//             Project #{projectId}
//             {formCode ? ` • Code: ${formCode}` : ""}
//           </p>
//         </div>
//         <button
//           onClick={() => navigate(-1)}
//           className="text-xs text-blue-600 underline"
//         >
//           ← Back to project forms
//         </button>
//       </div>

//       {loading || !assignment ? (
//         <div className="text-sm text-gray-500">Loading form...</div>
//       ) : (
//         <>
//           {renderBody()}

//           {/* 🔥 Forward section (optional) */}
//           <div className="mt-4 border-t pt-3">
//             <h2 className="text-sm font-semibold mb-2">
//               Forward (optional)
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
//               <div>
//                 <label className="block mb-1 font-medium">
//                   Project
//                 </label>
//                 <input
//                   type="text"
//                   className="w-full border rounded px-2 py-1 bg-gray-50"
//                   value={projectId}
//                   readOnly
//                 />
//               </div>

//               <div>
//                 <label className="block mb-1 font-medium">
//                   Forward to user
//                 </label>
//                 <select
//                   className="w-full border rounded px-2 py-1 bg-white"
//                   value={forwardToUserId}
//                   onChange={(e) => setForwardToUserId(e.target.value)}
//                   disabled={usersLoading}
//                 >
//                   <option value="">
//                     {usersLoading
//                       ? "Loading users..."
//                       : "Do not forward (only save)"}
//                   </option>
//                   {projectUsers.map((u) => {
//                     const id = u.id ?? u.user_id;
//                     const name =
//                       u.full_name ||
//                       u.name ||
//                       u.username ||
//                       `${u.first_name || ""} ${u.last_name || ""}`.trim() ||
//                       `User #${id}`;
//                     return (
//                       <option key={id} value={id}>
//                         {name} (#{id})
//                       </option>
//                     );
//                   })}
//                 </select>
//                 <div className="text-[10px] text-gray-500 mt-0.5">
//                   Project ke users yahan aa rahe hain.
//                 </div>
//               </div>

//               <div>
//                 <label className="block mb-1 font-medium">
//                   Status with forward
//                 </label>
//                 <select
//                   className="w-full border rounded px-2 py-1 bg-white"
//                   value={forwardDecision}
//                   onChange={(e) => setForwardDecision(e.target.value)}
//                   disabled={!forwardToUserId}
//                 >
//                   <option value="APPROVED">Accept (APPROVED)</option>
//                   <option value="REJECTED">Reject (REJECTED)</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           <div className="flex justify-end gap-2 mt-4">
//             <button
//               type="button"
//               disabled={submitting}
//               onClick={() => handleSubmit("DRAFT")}
//               className="px-3 py-1.5 text-xs border rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
//             >
//               Save as Draft
//             </button>
//             <button
//               type="button"
//               disabled={submitting}
//               onClick={() => handleSubmit("SUBMITTED")}
//               className="px-3 py-1.5 text-xs border rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
//             >
//               Submit Form
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default ProjectFormFillPage;
// src/components/ProjectFormFillPage.jsx
// import React, { useEffect, useMemo, useState ,} from "react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  createFormResponse,
  getAssignedFormsForProject,
  getUsersByProject, // 🔥 NEW
  forwardFormResponse,
  listFormTasks,
  getFormResponse, // ✅ add
  updateFormResponse,
} from "../api";

// ✅ Common regex to detect file-like labels (logo, signature, photograph etc.)
const LABEL_FILE_REGEX = /logo|signature|stamp|photo|photograph|image/i;

/* ------------------------------------------------------------------
   Helper: infer field from a block (very tolerant)
------------------------------------------------------------------ */
function extractFieldFromBlock(block) {
  if (!block || typeof block !== "object") return null;

  // 1) nested field object
  if (block.field && block.field.key) {
    const f = block.field;
    const rawType = (
      f.type ||
      f.field_type ||
      block.block_type ||
      "TEXT"
    ).toUpperCase();
    const label = f.label || f.title || f.key;
    const required = !!(f.required || f.is_required);

    let type = rawType || "TEXT";
    if (type === "TEXT_STATIC" || type === "LABEL") type = "TEXT";

    // 👇 logo / signature / photo / image etc. => FILE
    if (LABEL_FILE_REGEX.test(label || "")) {
      type = "FILE";
    }

    return {
      key: f.key,
      label,
      type,
      config: f.config || f.field_config || {},
      required,
    };
  }

  

  // 2) flat block acting as a field
  const key =
    block.field_key ||
    block.key ||
    block.name ||
    (block.meta && block.meta.key) ||
    null;

  if (!key) return null;

  const rawType = (
    block.field_type ||
    block.input_type ||
    block.block_type ||
    "TEXT"
  ).toUpperCase();

  const label =
    block.field_label ||
    block.label ||
    block.text ||
    key;

  const config = block.config || block.field_config || {};
  const required = !!(block.required || block.is_required);

  let type = rawType || "TEXT";
  if (type === "TEXT_STATIC" || type === "LABEL") type = "TEXT";

  if (type === "LONG_TEXT" || type === "MULTILINE") {
    type = "TEXTAREA";
  }

  // 👇 logo / signature / photo / image etc. => FILE
  if (LABEL_FILE_REGEX.test(label || "")) {
    type = "FILE";
  }

  return { key, label, type, config, required };
}

/* ------------------------------------------------------------------
   Schema se fields collect + AUTO logic (LEFT + HEADER + HARD fallback)
------------------------------------------------------------------ */
function collectFieldsFromSchema(schema) {
  const fields = [];
  const seen = new Set();
  if (!schema) return fields;

  const addField = (field, col) => {
    if (!field || !field.key) return;
    if (seen.has(field.key)) {
      console.log("⚠️ [collect] duplicate field key skipped:", field.key);
      return;
    }
    console.log("➕ [collect] adding field:", field);
    seen.add(field.key);
    fields.push(field);

    // store for later if needed (grid render)
    if (col && !col._autoField) {
      col._autoField = field;
    }
  };

  const visitSectionsArray = (sections = []) => {
    sections.forEach((sec) => {
      const rows = sec.rows || [];
      rows.forEach((row, rowIdx) => {
        const columns = row.columns || row.blocks || row.cols || [];
        columns.forEach((col, cIdx) => {
          const blocks = col.blocks || [];
          const colFields = col.fields || [];
          let hasField = false;

          // 1) block.field based fields
          blocks.forEach((block) => {
            const f = extractFieldFromBlock(block);
            if (f && f.key) {
              hasField = true;
              addField(f, col);
            }
          });

          // 2) col.fields array
          colFields.forEach((f) => {
            if (f && f.key) {
              hasField = true;
              let type = (f.type || f.field_type || "TEXT").toUpperCase();
              if (type === "LONG_TEXT" || type === "MULTILINE") {
                type = "TEXTAREA";
              }
              const label = f.label || f.title || f.key;
              if (LABEL_FILE_REGEX.test(label || "")) {
                type = "FILE";
              }
              addField(
                {
                  key: f.key,
                  label,
                  type,
                  config: f.config || f.field_config || {},
                  required: !!(f.required || f.is_required),
                },
                col
              );
            }
          });

          // ✅ 2.5) IMAGE-only cells → auto FILE field (logo/signature/photo cells)
          if (!hasField) {
            const hasImageBlock = blocks.some((b) => {
              const bt = (b.block_type || b.blockType || "").toUpperCase();
              return bt === "IMAGE" || bt === "LOGO";
            });

            if (hasImageBlock) {
              const rowTag = row.excel_row || rowIdx + 1;
              const colTag = col.excel_col || cIdx + 1;
              const baseKey = `cell_${rowTag}_${colTag}`;
              const key = seen.has(baseKey) ? `${baseKey}_img` : baseKey;

              const field = {
                key,
                label: "Image",
                type: "FILE",
                config: { hideLabel: true }, // label hide – sirf image dikhe
                required: false,
              };

              addField(field, col);
              hasField = true;
            }
          }

          // 3) AUTO FIELD logic – label/headers se generate
          if (!hasField) {
            const hasColFieldsAny = colFields.length > 0;
            const hasTextBlock = blocks.some((b) => {
              const bt = (b.block_type || b.blockType || "").toUpperCase();
              return (
                (bt === "TEXT_STATIC" || bt === "TEXT") &&
                (b.text || b.label)
              );
            });
            const hasImageBlock = blocks.some((b) => {
              const bt = (b.block_type || b.blockType || "").toUpperCase();
              return bt === "IMAGE" || bt === "LOGO";
            });
            const hasFieldBlock = blocks.some((b) => !!extractFieldFromBlock(b));

            const isAutoEmpty =
              !hasFieldBlock &&
              !hasColFieldsAny &&
              !hasTextBlock &&
              !hasImageBlock;

            if (isAutoEmpty) {
              let createdFromLeft = false;

              // 3a) LEFT label -> current blank cell
              if (cIdx > 0) {
                const prevCol = columns[cIdx - 1];
                const prevBlocks = (prevCol && prevCol.blocks) || [];
                const labelBlock = prevBlocks.find((b) => {
                  const bt = (b.block_type || b.blockType || "").toUpperCase();
                  return (
                    (bt === "TEXT_STATIC" || bt === "TEXT") &&
                    (b.text || b.label)
                  );
                });

                if (labelBlock) {
                  const rowTag = row.excel_row || rowIdx + 1;
                  const colTag = col.excel_col || cIdx + 1;
                  const key = `cell_${rowTag}_${colTag}`;

                  const labelText =
                    labelBlock.text || labelBlock.label || key;

                  let type = "TEXT";
                  if (LABEL_FILE_REGEX.test(labelText || "")) {
                    type = "FILE";
                  }

                  const field = {
                    key,
                    label: labelText,
                    type,
                    config: { hideLabel: true },
                    required: false,
                  };
                  addField(field, col);
                  createdFromLeft = true;
                }
              }

              // 3b) HEADER (row above) label -> current blank cell
              if (!createdFromLeft && rowIdx > 0) {
                const headerRow = rows[rowIdx - 1];
                if (headerRow) {
                  const headerCols =
                    headerRow.columns ||
                    headerRow.blocks ||
                    headerRow.cols ||
                    [];
                  const headerCol = headerCols[cIdx];
                  if (headerCol) {
                    const headerBlocks = headerCol.blocks || [];
                    const headerLabelBlock = headerBlocks.find((b) => {
                      const bt = (b.block_type || b.blockType || "").toUpperCase();
                      const txt = b.text || b.label;
                      return (
                        txt &&
                        (bt === "TEXT_STATIC" || bt === "TEXT")
                      );
                    });

                    if (headerLabelBlock) {
                      const rowTag = row.excel_row || rowIdx + 1;
                      const colTag = col.excel_col || cIdx + 1;
                      const key = `cell_${rowTag}_${colTag}`;
                      if (!seen.has(key)) {
                        const labelText = String(
                          headerLabelBlock.text ||
                            headerLabelBlock.label ||
                            key
                        ).trim();

                        let type = "TEXT";
                        if (LABEL_FILE_REGEX.test(labelText || "")) {
                          type = "FILE";
                        }

                        const field = {
                          key,
                          label: labelText,
                          type,
                          config: { hideLabel: true },
                          required: false,
                        };
                        addField(field, col);
                      }
                    }
                  }
                }
              }
            }
          }
        });
      });
    });
  };
  

  if (Array.isArray(schema.sections)) {
    visitSectionsArray(schema.sections);
  }

  // Flat fields at root (if any)
  if (Array.isArray(schema.fields)) {
    schema.fields.forEach((f) => {
      if (f && f.key && !seen.has(f.key)) {
        let type = (f.type || f.field_type || "TEXT").toUpperCase();
        if (type === "LONG_TEXT" || type === "MULTILINE") {
          type = "TEXTAREA";
        }
        const label = f.label || f.title || f.key;
        if (LABEL_FILE_REGEX.test(label || "")) {
          type = "FILE";
        }
        seen.add(f.key);
        fields.push({
          key: f.key,
          label,
          type,
          config: f.config || f.field_config || {},
          required: !!(f.required || f.is_required),
        });
      }
    });
  }

  // HARD FALLBACK (pure Excel grid → blank cells to the right of labels)
  if (fields.length > 0 && schema.excel_meta && Array.isArray(schema.sections)) {
    console.log("🆘 [collect] HARD fallback from excel grid (top fields)");
    schema.sections.forEach((sec) => {
      const rows = sec.rows || [];
      rows.forEach((row, rowIdx) => {
        const columns = row.columns || row.blocks || row.cols || [];
        columns.forEach((col, cIdx) => {
          if (cIdx === 0) return;
          const prevCol = columns[cIdx - 1];
          if (!prevCol) return;

          const prevBlocks = prevCol.blocks || [];
          const labelBlock = prevBlocks.find((b) => {
            const bt = (b.block_type || b.blockType || "").toUpperCase();
            const txt = b.text || b.label;
            return txt && (bt === "TEXT_STATIC" || bt === "TEXT");
          });

          if (!labelBlock) return;

          const rowTag = row.excel_row || rowIdx + 1;
          const colTag = col.excel_col || cIdx + 1;
          const key = `cell_${rowTag}_${colTag}`;
          if (seen.has(key)) return;

          const labelText = String(
            labelBlock.text || labelBlock.label || key
          ).trim();

          let type = "TEXT";
          if (LABEL_FILE_REGEX.test(labelText || "")) {
            type = "FILE";
          }

          const field = {
            key,
            label: labelText,
            type,
            config: { hideLabel: true },
            required: false,
          };
          addField(field, col);
        });
      });
    });
  }

  console.log("🧩 [collect] FINAL fields:", fields);
  return fields;
}

/* ==================================================================
   MAIN COMPONENT
================================================================== */
const ProjectFormFillPage = () => {
    const printRef = useRef(null);

  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const qpProjectId = searchParams.get("project_id") || "";
  const qpAssignmentId =
    searchParams.get("assignment_id") ||
    searchParams.get("form_assignment_id") ||
    searchParams.get("assignment") ||
    searchParams.get("id") ||
    "";

  const qpResponseId = searchParams.get("response_id") || "";
  const [responseId, setResponseId] = useState(
    qpResponseId ? Number(qpResponseId) : null
  );
  const [responsePayload, setResponsePayload] = useState(null);
  const [responseLoading, setResponseLoading] = useState(Boolean(qpResponseId));

  const [projectId] = useState(qpProjectId);
  const [assignment, setAssignment] = useState(
    () => location.state?.assignment || null
  );

  // 👇 image width+height per field, and which image is selected
  const [imageSizes, setImageSizes] = useState({});
  const [activeImageKey, setActiveImageKey] = useState(null);
  const getImageSize = (fieldKey) =>
    imageSizes[fieldKey] || { width: 120, height: 60 }; // default size

  const [formValues, setFormValues] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(!location.state?.assignment);
  const [submitting, setSubmitting] = useState(false);

  // 🔥 NEW: project users + forward state
  const [projectUsers, setProjectUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [forwardToUserId, setForwardToUserId] = useState("");
  const [forwardDecision, setForwardDecision] = useState("APPROVED"); // ACCEPT by default

  // ✅ Export PDF (Print)
//   const handleExportPdf = () => {
//     // keep it simple: no extra popups/toasts
//     // close image panel for clean print (optional)
//     setActiveImageKey(null);
//     window.print();
//   };

const handleExportPdf = () => {
  setActiveImageKey(null);

  // allow DOM to settle (close panels etc.)
  setTimeout(() => {
    const el = printRef.current;
    if (!el) {
      window.print();
      return;
    }

    // A4 LANDSCAPE inner width (match @page below)
    const mmToPx = (mm) => (mm / 25.4) * 96;
    const pageWidthMm = 297;     // A4 landscape width
    const marginMm = 8;          // must match @page margin
    const availablePx = mmToPx(pageWidthMm - marginMm * 2);

    const srcWidth = el.scrollWidth || el.getBoundingClientRect().width;
    const scale = Math.min(1, availablePx / srcWidth);

    // store css vars for print
    document.documentElement.style.setProperty("--pf-print-width", `${srcWidth}px`);
    document.documentElement.style.setProperty("--pf-print-scale", `${scale}`);

    window.print();
  }, 50);
};


  useEffect(() => {
    console.log("📦 [Fill] assignment object:", assignment);
    console.log(
      "📦 [Fill] template_version_detail:",
      assignment?.template_version_detail
    );
  }, [assignment]);

  useEffect(() => {
    if (assignment || !projectId || !qpAssignmentId) return;

    const normalizeList = (res) => {
      const d = res?.data;
      if (Array.isArray(d)) return d;
      if (Array.isArray(d?.results)) return d.results;
      return [];
    };

    const load = async () => {
      setLoading(true);
      try {
        // 1) Try assignments (admin scope)
        const res = await getAssignedFormsForProject(projectId);
        const list = normalizeList(res);

        const found = list.find((a) => String(a.id) === String(qpAssignmentId));
        if (found) {
          setAssignment(found);
          return;
        }

        // 2) ✅ Fallback: tasks (user scope) -> redirect to task fill page
        const tRes = await listFormTasks({ project_id: Number(projectId) });
        const tasks = normalizeList(tRes);

        const task =
          tasks.find((t) => String(t.assignment_id) === String(qpAssignmentId)) ||
          tasks.find((t) => String(t.assignment) === String(qpAssignmentId)) ||
          null;

        if (task?.id) {
          navigate(`/forms/tasks/${task.id}`);
          return;
        }

        console.log("❌ Assigned forms list:", list);
        console.log("❌ Tasks list:", tasks);

        toast.error(
          `Form assignment not found in assignments or tasks. project_id=${projectId}, assignment_id=${qpAssignmentId}`
        );
        navigate("/project-forms");
      } catch (err) {
        console.error("Failed to load assignment for fill page", err);
        toast.error("Failed to load form details");
        navigate("/project-forms");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [assignment, projectId, qpAssignmentId, navigate]);

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });

  const normalizeAnswersForSubmit = async (values) => {
    const out = { ...(values || {}) };

    for (const [k, v] of Object.entries(out)) {
      if (v instanceof File) {
        // safety: 1.5MB cap (change if needed)
        if (v.size > 1.5 * 1024 * 1024) {
          throw new Error(`File too large for ${k}. Please upload smaller image.`);
        }
        out[k] = await fileToDataUrl(v); // ✅ base64
      }
    }
    return out;
  };

  // 🔥 NEW: load project users once projectId available
  useEffect(() => {
    if (!projectId) return;

    const loadUsers = async () => {
      setUsersLoading(true);
      try {
        const res = await getUsersByProject(projectId);
        const data = res.data || [];
        setProjectUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load project users", err);
        toast.error("Failed to load project users.");
      } finally {
        setUsersLoading(false);
      }
    };

    loadUsers();
  }, [projectId]);

  const schema = assignment?.template_version_detail?.schema || {};

  const allFields = useMemo(() => collectFieldsFromSchema(schema), [schema]);

  // Map by key (cell_.. or normal)
  const fieldMapByKey = useMemo(() => {
    const map = {};
    allFields.forEach((f) => {
      if (f && f.key) map[f.key] = f;
    });
    return map;
  }, [allFields]);

  useEffect(() => {
    console.log("📄 [Fill] raw schema:", schema);
    console.log("📄 [Fill] allFields:", allFields);
  }, [schema, allFields]);

  const prefillAnswers = useMemo(() => {
    const a = responsePayload?.answers || responsePayload?.data || {};
    // backend me file fields {} aa rahe hain, use null treat karo
    const cleaned = {};
    Object.entries(a || {}).forEach(([k, v]) => {
      if (v && typeof v === "object" && !(v instanceof File) && !Array.isArray(v)) {
        cleaned[k] = Object.keys(v).length ? v : null; // {} -> null
      } else {
        cleaned[k] = v;
      }
    });
    return cleaned;
  }, [responsePayload]);
useEffect(() => {
  const cleanup = () => {
    document.documentElement.style.removeProperty("--pf-print-width");
    document.documentElement.style.removeProperty("--pf-print-scale");
  };
  window.addEventListener("afterprint", cleanup);
  return () => window.removeEventListener("afterprint", cleanup);
}, []);

  useEffect(() => {
    if (!responseId) return;

    let mounted = true;
    (async () => {
      try {
        setResponseLoading(true);
        const res = await getFormResponse(responseId);
        const data = res?.data ?? res;
        if (!mounted) return;
        setResponsePayload(data);
      } catch (e) {
        console.error(e);
        toast.error(e?.response?.data?.detail || "Failed to load response.");
      } finally {
        if (mounted) setResponseLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [responseId]);

  useEffect(() => {
    if (!assignment) return;

    const initial = {};
    allFields.forEach((field) => {
      const key = field.key;
      if (!key) return;

      const cfg = field.config || {};
      if (field.default !== undefined && field.default !== null) initial[key] = field.default;
      else if (cfg.default !== undefined && cfg.default !== null) initial[key] = cfg.default;
      else initial[key] = field.type === "FILE" ? null : "";
    });

    // ✅ IMPORTANT: prefillAnswers merge
    setFormValues({ ...initial, ...prefillAnswers });
    setErrors({});
  }, [assignment, allFields, prefillAnswers]);

  const getFieldLabel = (field) =>
    field.label || field.title || field.key || "Field";

  const isFieldRequired = (field) => {
    const cfg = field.config || {};
    return !!(field.required || field.is_required || cfg.required);
  };

  const handleChange = (key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const newErrors = {};
    allFields.forEach((field) => {
      if (!field.key) return;
      if (!isFieldRequired(field)) return;

      const v = formValues[field.key];
      const isEmpty =
        v === undefined ||
        v === null ||
        v === "" ||
        (Array.isArray(v) && v.length === 0);

      if (isEmpty) newErrors[field.key] = "Required";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (status = "SUBMITTED") => {
    if (!assignment || !projectId) return;

    if (status !== "DRAFT" && !validate()) {
      toast.error("Please fill all required fields.");
      return;
    }

    const tv = assignment.template_version_detail || {};
    const templateVersionId = tv.id;
    if (!templateVersionId) {
      toast.error("Invalid form version.");
      return;
    }

    setSubmitting(true);
    try {
      // ✅ convert File -> base64 so it actually saves
      const finalAnswers = await normalizeAnswersForSubmit(formValues);

      let savedResponseId = responseId;

      if (savedResponseId) {
        // ✅ EDIT MODE (prefilled response)
        await updateFormResponse(savedResponseId, {
          status,
          answers: finalAnswers,
          data: finalAnswers, // safe
        });
      } else {
        // ✅ CREATE MODE
        const payload = {
          template_version: templateVersionId,
          assignment: assignment.id,
          project_id: Number(projectId),
          client_id: assignment.client_id || null,
          related_object_type: "",
          related_object_id: "",
          status,
          answers: finalAnswers,
          data: finalAnswers,
        };

        const res = await createFormResponse(payload);
        const created = res.data || {};
        savedResponseId = created.id;
        setResponseId(savedResponseId);
      }

      // ✅ forward on same response id
      if (savedResponseId && forwardToUserId) {
        await forwardFormResponse(savedResponseId, {
          to_user_id: Number(forwardToUserId),
          decision: forwardDecision,
        });
        toast.success(
          status === "DRAFT" ? "Saved (draft) and forwarded." : "Submitted and forwarded."
        );
      } else {
        toast.success(status === "DRAFT" ? "Saved as draft." : "Submitted.");
      }

      navigate(`/project-forms?project_id=${projectId}`);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.detail || err?.message || "Failed to submit.");
    } finally {
      setSubmitting(false);
    }
  };

  // 🔧 FILE + normal fields (unchanged)
  const renderField = (field, opts = {}) => {
    if (!field || !field.key) return null;
    const { compact = false } = opts;

    const key = field.key;
    const label = getFieldLabel(field);
    const value = formValues[key];
    const error = errors[key];

    const rawType = (field.type || field.field_type || "TEXT").toUpperCase();
    const cfg = field.config || {};
    const placeholder = cfg.placeholder || "";
    const options = field.options || cfg.options || [];
    const hideLabel = cfg.hideLabel;

    const showLabel = !compact && !hideLabel;

    const commonLabel = showLabel ? (
      <label className="block text-[11px] font-medium mb-1">
        {label}
        {isFieldRequired(field) && (
          <span className="text-red-500 ml-0.5">*</span>
        )}
      </label>
    ) : null;

    const commonError = error ? (
      <div className="text-[10px] text-red-500 mt-0.5">{error}</div>
    ) : null;

    const inputBase =
      "w-full border rounded text-xs " +
      (compact ? "px-1 py-[3px]" : "px-2 py-1");

    const isFileLike =
      rawType === "FILE" ||
      rawType === "IMAGE" ||
      rawType === "LOGO" ||
      rawType.includes("FILE") ||
      rawType.includes("UPLOAD") ||
      rawType.includes("IMAGE");

    // ✅ FILE / IMAGE fields: image preview + click -> top panel sliders
    if (isFileLike) {
      let previewUrl = null;

      if (value) {
        if (typeof value === "string") {
          previewUrl = value;
        } else if (value instanceof File) {
          previewUrl = URL.createObjectURL(value);
        }
      }

      const { width: imgWidth, height: imgHeight } = getImageSize(key);

      const clearImage = () => {
        // clear value
        handleChange(key, null);

        // clear sliders state
        setImageSizes((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });

        // close top slider panel if this was active
        setActiveImageKey((prev) => (prev === key ? null : prev));
      };

      return (
        <div key={key} className={compact ? "" : "mb-2"}>
          {commonLabel}

          {previewUrl && (
            <div className="flex flex-col items-center mb-1 relative">
              {/* ❌ Clear button */}
              <button
                type="button"
                onClick={clearImage}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] shadow no-print"
                title="Remove image"
              >
                ×
              </button>

              <img
                src={previewUrl}
                alt={label}
                className="object-contain cursor-pointer"
                style={{ maxHeight: imgHeight, maxWidth: imgWidth }}
                onClick={() => {
                  // image select -> open top panel
                  setActiveImageKey(key);
                  if (!imageSizes[key]) {
                    setImageSizes((prev) => ({
                      ...prev,
                      [key]: { width: 120, height: 60 },
                    }));
                  }
                }}
              />
              <div className="text-[9px] text-gray-400 mt-0.5 no-print">
                Click image to adjust size above
              </div>
            </div>
          )}

          {/* hide file input in PDF print */}
          <input
            type="file"
            className={inputBase + " no-print"}
            onChange={(e) => {
              const file = e.target.files && e.target.files[0];
              handleChange(key, file || null);

              // Agar pehli baar file choose kar rahe ho toh default size set karo
              if (file && !imageSizes[key]) {
                setImageSizes((prev) => ({
                  ...prev,
                  [key]: { width: 120, height: 60 },
                }));
              }
            }}
            accept={cfg.accept || ".png,.jpg,.jpeg,.webp,.svg,.pdf"}
          />

          {value && value.name && value instanceof File && (
            <div className="mt-1 text-[10px] text-gray-600 no-print">
              Selected: {value.name}
            </div>
          )}

          {commonError}
        </div>
      );
    }

    // ---- normal fields below ----
    switch (rawType) {
      case "TEXT":
      case "PHONE":
      case "EMAIL":
      case "NUMBER":
        return (
          <div key={key} className={compact ? "" : "mb-2"}>
            {commonLabel}
            <input
              type={rawType === "NUMBER" ? "number" : "text"}
              className={inputBase}
              value={value ?? ""}
              placeholder={placeholder}
              onChange={(e) => handleChange(key, e.target.value)}
            />
            {commonError}
          </div>
        );

      case "DATE":
        return (
          <div key={key} className={compact ? "" : "mb-2"}>
            {commonLabel}
            <input
              type="date"
              inputMode="date"
              className={inputBase + " text-[10px] tracking-tight"}
              value={value ?? ""}
              placeholder={placeholder || "dd-mm-yyyy"}
              onChange={(e) => handleChange(key, e.target.value)}
            />
            {commonError}
          </div>
        );

      case "TEXTAREA":
        return (
          <div key={key} className={compact ? "" : "mb-2"}>
            {commonLabel}
            <textarea
              className={
                inputBase + " min-h-[80px] " + (compact ? "resize-none" : "")
              }
              value={value ?? ""}
              placeholder={placeholder}
              onChange={(e) => handleChange(key, e.target.value)}
            />
            {commonError}
          </div>
        );

      case "DROPDOWN":
      case "SELECT":
        return (
          <div key={key} className={compact ? "" : "mb-2"}>
            {commonLabel}
            <select
              className={inputBase + " bg-white"}
              value={value ?? ""}
              onChange={(e) => handleChange(key, e.target.value)}
            >
              <option value="">Select...</option>
              {Array.isArray(options) &&
                options.map((opt) => {
                  if (typeof opt === "string") {
                    return (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    );
                  }
                  const val = opt.value ?? opt.code ?? opt.id;
                  const lbl = opt.label ?? opt.name ?? String(val);
                  return (
                    <option key={val} value={val}>
                      {lbl}
                    </option>
                  );
                })}
            </select>
            {commonError}
          </div>
        );

      case "BOOLEAN":
      case "CHECKBOX":
        return (
          <div
            key={key}
            className={
              "flex items-center gap-2 " + (compact ? "" : "mb-2")
            }
          >
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleChange(key, e.target.checked)}
            />
            <span className="text-[11px]">
              {label}
              {isFieldRequired(field) && (
                <span className="text-red-500 ml-0.5">*</span>
              )}
            </span>
            {commonError}
          </div>
        );

      default:
        return (
          <div key={key} className={compact ? "" : "mb-2"}>
            {commonLabel}
            <input
              type="text"
              className={inputBase}
              value={value ?? ""}
              placeholder={placeholder}
              onChange={(e) => handleChange(key, e.target.value)}
            />
            {commonError}
          </div>
        );
    }
  };

  /* ------------------------------------------------------------------
     TOP SLIDER PANEL FOR ACTIVE IMAGE
  ------------------------------------------------------------------ */
  const renderImageSizePanel = () => {
    if (!activeImageKey) return null;

    const { width, height } = getImageSize(activeImageKey);
    const field = allFields.find((f) => f.key === activeImageKey);
    const label = field ? getFieldLabel(field) : activeImageKey;

    return (
      <div className="sticky top-0 z-40 mb-3 bg-white border border-purple-200 rounded-md shadow-sm p-2 no-print">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="text-[11px]">
            <span className="font-semibold">Adjust image size</span>{" "}
            <span className="text-gray-500">({label})</span>
          </div>
          <button
            type="button"
            onClick={() => setActiveImageKey(null)}
            className="text-[11px] px-2 py-0.5 border rounded bg-purple-50 hover:bg-purple-100"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <input
              type="range"
              min={60}
              max={260}
              value={width}
              onChange={(e) => {
                const w = Number(e.target.value);
                setImageSizes((prev) => {
                  const current = prev[activeImageKey] || {
                    width: 120,
                    height,
                  };
                  return {
                    ...prev,
                    [activeImageKey]: { ...current, width: w },
                  };
                });
              }}
              className="w-full"
            />
            <div className="text-[10px] text-gray-500">
              Logo width: {width}px
            </div>
          </div>
          <div>
            <input
              type="range"
              min={30}
              max={160}
              value={height}
              onChange={(e) => {
                const h = Number(e.target.value);
                setImageSizes((prev) => {
                  const current = prev[activeImageKey] || {
                    width,
                    height: 60,
                  };
                  return {
                    ...prev,
                    [activeImageKey]: { ...current, height: h },
                  };
                });
              }}
              className="w-full"
            />
            <div className="text-[10px] text-gray-500">
              Logo height: {height}px
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ------------------------------------------------------------------
     Layout: sections -> rows -> columns -> Excel-style grid
  ------------------------------------------------------------------ */
  const renderBody = () => {
    if (!schema || (!schema.sections && !schema.fields)) {
      return (
        <div className="text-sm text-gray-500">
          No schema defined for this form.
        </div>
      );
    }

    // CASE 1: sections
    if (Array.isArray(schema.sections) && schema.sections.length) {
      const meta = schema.excel_meta || null;
      const hasExcelMeta = !!meta;

      const sectionsUI = schema.sections.map((sec, sIdx) => {
        const rows = sec.rows || [];
        if (!rows.length) return null;

        return (
          <div
            key={sec.key || sec.id || sIdx}
  className="pf-section border rounded-md bg-white mb-4 overflow-x-auto"
          >
            {sec.title && (
              <div className="px-3 py-2 border-b">
                <h2 className="text-sm font-semibold">{sec.title}</h2>
              </div>
            )}

            <div className="min-w-[700px]">
              {hasExcelMeta ? (
                (() => {
                  const metaColWidths = meta.col_widths || [];
                  const minCol = meta.min_col || 1;

                  const firstRowCols =
                    rows[0]?.columns ||
                    rows[0]?.blocks ||
                    rows[0]?.cols ||
                    [];

                  const nCols =
                    metaColWidths.length || (firstRowCols.length || 1);

                  // 🔎 header labels (top row)
                  let headerLabels = [];
                  if (rows.length) {
                    const headerRow = rows[0];
                    const headerCols =
                      headerRow.columns ||
                      headerRow.blocks ||
                      headerRow.cols ||
                      [];
                    headerLabels = headerCols.map((col) => {
                      const blocks = col.blocks || [];
                      const textBlock = blocks.find((b) => {
                        const bt = (b.block_type || b.blockType || "").toUpperCase();
                        const txt = b.text || b.label;
                        return (
                          txt &&
                          (bt === "TEXT_STATIC" || bt === "TEXT")
                        );
                      });
                      return textBlock
                        ? String(
                            textBlock.text || textBlock.label || ""
                          )
                            .trim()
                            .toLowerCase()
                        : "";
                    });
                  }

                  // base widths from Excel or equal
                  let colWidths = [...metaColWidths];
                  if (!colWidths.length) {
                    colWidths = new Array(nCols).fill(1);
                  }

                  // 📏 widen date-ish columns thoda
                  colWidths = colWidths.map((w, idx) => {
                    const label = headerLabels[idx] || "";
                    if (
                      label.includes("target date") ||
                      label.includes("status on (date)") ||
                      label.includes("status on ")
                    ) {
                      return (w || 1) * 1.5;
                    }
                    return w || 1;
                  });

                  const totalUnits =
                    colWidths.reduce((sum, w) => sum + (w || 0), 0) || 1;

                  const gridTemplateColumns = colWidths
                    .map((w) => `${(w / totalUnits) * 100}%`)
                    .join(" ");

                  const rowHeights = rows.map((row) => row.height || 20);
                  const gridTemplateRows = rowHeights
                    .map((h) => `${h + 4}px`)
                    .join(" ");

                  return (
                    <div
                      className="grid text-[11px]"
                      style={{
                        gridTemplateColumns,
                        gridTemplateRows,
                      }}
                    >
                      {rows.map((row, rIdx) => {
                        const columns =
                          row.columns || row.blocks || row.cols || [];
                        return columns.map((col, cIdx) => {
                          const merge = col.merge || {};
                          const isMerged = !!merge.is_merged;
                          const isTopLeft = merge.is_top_left !== false;

                          if (isMerged && !isTopLeft) {
                            return null;
                          }

                          const rowSpan = merge.row_span || 1;
                          const colSpan = merge.col_span || 1;

                          const blocks = col.blocks || [];
                          const colFields = col.fields || [];

                          const rowTag = row.excel_row || rIdx + 1;
                          const colTag = col.excel_col || cIdx + 1;
                          const coordKey = `cell_${rowTag}_${colTag}`;

                          let fieldToRender =
                            fieldMapByKey[coordKey] || null;

                          if (!fieldToRender && blocks.length) {
                            const fromBlocks = blocks
                              .map((b) => extractFieldFromBlock(b))
                              .find((f) => f && f.key);
                            if (fromBlocks) fieldToRender = fromBlocks;
                          }

                          if (!fieldToRender && colFields.length) {
                            const raw = colFields.find((f) => f && f.key);
                            if (raw) {
                              let type = (
                                raw.type ||
                                raw.field_type ||
                                "TEXT"
                              ).toUpperCase();
                              if (
                                type === "LONG_TEXT" ||
                                type === "MULTILINE"
                              ) {
                                type = "TEXTAREA";
                              }
                              const label =
                                raw.label || raw.title || raw.key;
                              if (LABEL_FILE_REGEX.test(label || "")) {
                                type = "FILE";
                              }
                              fieldToRender = {
                                key: raw.key,
                                label,
                                type,
                                config:
                                  raw.config || raw.field_config || {},
                                required: !!(
                                  raw.required || raw.is_required
                                ),
                              };
                            }
                          }

                          if (!fieldToRender && col._autoField) {
                            fieldToRender = col._autoField;
                          }

                          const textBlocks = blocks.filter((b) => {
                            const bt = (b.block_type || "").toUpperCase();
                            return (
                              bt === "TEXT_STATIC" || bt === "TEXT"
                            );
                          });

                          const imageBlocks = blocks.filter((b) => {
                            const bt = (b.block_type || "").toUpperCase();
                            return (
                              bt === "IMAGE" || bt === "LOGO"
                            );
                          });

                          // LAST chance: match by label text
                          if (!fieldToRender && textBlocks.length) {
                            const labelTextRaw = textBlocks
                              .map((b) => b.text || b.label || "")
                              .join(" ")
                              .trim();

                            if (labelTextRaw) {
                              const matched = allFields.find(
                                (f) =>
                                  (f.label || "").trim() ===
                                  labelTextRaw
                              );
                              if (matched) {
                                console.log(
                                  "🔗 [Fill] matched field by label:",
                                  labelTextRaw,
                                  "->",
                                  matched.key
                                );
                                fieldToRender = matched;
                              }
                            }
                          }

                          const startCol =
                            (col.excel_col || cIdx + minCol) -
                            minCol +
                            1;
                          const startRow = rIdx + 1;

                          // 👉 inline rule: 1 label + 1 simple field => label and input on same line
                          let canInline = false;
                          if (textBlocks.length === 1 && fieldToRender) {
                            const fType = (
                              fieldToRender.type ||
                              fieldToRender.field_type ||
                              "TEXT"
                            ).toUpperCase();
                            const isFile =
                              fType === "FILE" ||
                              fType === "IMAGE" ||
                              fType === "LOGO" ||
                              fType.includes("FILE") ||
                              fType.includes("UPLOAD") ||
                              fType.includes("IMAGE");
                            const isTextarea =
                              fType === "TEXTAREA" ||
                              fType === "LONG_TEXT" ||
                              fType === "MULTILINE";

                            if (!isFile && !isTextarea) {
                              canInline = true;
                            }
                          }

                          return (
                            <div
                              key={`${rIdx}-${cIdx}`}
                              className="pf-cell border border-gray-200 p-1 align-top"
                              style={{
                                gridColumnStart: startCol,
                                gridColumnEnd: startCol + colSpan,
                                gridRowStart: startRow,
                                gridRowEnd: startRow + rowSpan,
                              }}
                            >
                              {canInline ? (
                                <div className="flex items-center gap-1">
                                  <span className="whitespace-nowrap">
                                    {textBlocks[0].text ||
                                      textBlocks[0].label ||
                                      ""}
                                  </span>
                                  <div className="flex-1">
                                    {renderField(fieldToRender, {
                                      compact: true,
                                    })}
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {textBlocks.length > 0 && (
                                    <div className="whitespace-pre-wrap leading-tight">
                                      {textBlocks.map((b, idx2) => (
                                        <div key={idx2}>
                                          {b.text || b.label || ""}
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Placeholder only if koi interactive field nahi hai */}
                                  {imageBlocks.length > 0 && !fieldToRender && (
                                    <div className="mt-1 text-[10px] text-gray-400 italic">
                                      [Logo / image placeholder]
                                    </div>
                                  )}

                                  {fieldToRender && (
                                    <div
                                      className={
                                        textBlocks.length ? "mt-1" : ""
                                      }
                                    >
                                      {renderField(fieldToRender, {
                                        compact: true,
                                      })}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          );
                        });
                      })}
                    </div>
                  );
                })()
              ) : (
                // non-excel layout
                (sec.rows || []).map((row, rIdx) => {
                  const columns = row.columns || row.blocks || row.cols || [];
                  if (!columns.length) return null;

                  const totalUnits =
                    columns.reduce(
                      (sum, c) =>
                        sum +
                        (typeof c.width === "number" ? c.width : 1),
                      0
                    ) || 1;

                  return (
                    <div key={row.id || rIdx} className="flex">
                      {columns.map((col, cIdx) => {
                        const blocks = col.blocks || [];
                        const colFields = col.fields || [];

                        let fieldToRender = null;

                        if (blocks.length) {
                          const fromBlocks = blocks
                            .map((b) => extractFieldFromBlock(b))
                            .find((f) => f && f.key);
                          if (fromBlocks) fieldToRender = fromBlocks;
                        }

                        if (!fieldToRender && colFields.length) {
                          const raw = colFields.find((f) => f && f.key);
                          if (raw) {
                            let type = (
                              raw.type || raw.field_type || "TEXT"
                            ).toUpperCase();
                            if (
                              type === "LONG_TEXT" ||
                              type === "MULTILINE"
                            ) {
                              type = "TEXTAREA";
                            }
                            const label =
                              raw.label || raw.title || raw.key;
                            if (LABEL_FILE_REGEX.test(label || "")) {
                              type = "FILE";
                            }
                            fieldToRender = {
                              key: raw.key,
                              label,
                              type,
                              config:
                                raw.config || raw.field_config || {},
                              required: !!(
                                raw.required || raw.is_required
                              ),
                            };
                          }
                        }

                        if (!fieldToRender && col._autoField) {
                          fieldToRender = col._autoField;
                        }

                        const textBlocks = blocks.filter((b) => {
                          const bt = (b.block_type || "").toUpperCase();
                          return (
                            bt === "TEXT_STATIC" || bt === "TEXT"
                          );
                        });

                        const imageBlocks = blocks.filter((b) => {
                          const bt = (b.block_type || "").toUpperCase();
                          return (
                            bt === "IMAGE" || bt === "LOGO"
                          );
                        });

                        const widthUnits =
                          typeof col.width === "number" ? col.width : 1;
                        const widthPercent =
                          (widthUnits / totalUnits) * 100;

                        return (
                          <div
                            key={cIdx}
                            className="border border-gray-200 px-2 py-1 align-top text-[11px]"
                            style={{
                              flexBasis: `${widthPercent}%`,
                              maxWidth: `${widthPercent}%`,
                            }}
                          >
                            {textBlocks.length > 0 && (
                              <div className="whitespace-pre-wrap leading-tight">
                                {textBlocks.map((b, idx2) => (
                                  <div key={idx2}>
                                    {b.text || b.label || ""}
                                  </div>
                                ))}
                              </div>
                            )}

                            {imageBlocks.length > 0 && !fieldToRender && (
                              <div className="mt-1 text-[10px] text-gray-400 italic">
                                [Logo / image placeholder]
                              </div>
                            )}

                            {fieldToRender && (
                              <div className={textBlocks.length ? "mt-1" : ""}>
                                {renderField(fieldToRender)}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      });

      return <>{sectionsUI}</>;
    }

    // CASE 2: flat fields
    if (Array.isArray(schema.fields)) {
      return (
        <div className="border rounded-md bg-white p-3">
          {schema.fields.map((f) =>
            renderField({
              key: f.key,
              label: f.label || f.title || f.key,
              type: (f.type || f.field_type || "TEXT").toUpperCase(),
              config: f.config || f.field_config || {},
              required: !!(f.required || f.is_required),
            })
          )}
        </div>
      );
    }

    return (
      <div className="text-sm text-gray-500">
        Schema format not recognized.
      </div>
    );
  };

  if (!projectId || !qpAssignmentId) {
    return (
      <div className="p-4 text-sm text-gray-600">
        <h1 className="text-lg font-semibold">Fill Form</h1>
        <p>Missing project or assignment information.</p>
      </div>
    );
  }

  const tv = assignment?.template_version_detail || {};
  const tpl = tv.template_detail || {};
  const formTitle = tpl.name || tv.title || `Form v${tv.version || "-"}`;
  const formCode = tpl.code;

  return (
    <div id="pf-page-root" className="p-4 space-y-4">
      {/* ✅ Print CSS for PDF export */}
      {/* <style>{`
        @page { size: A4; margin: 12mm; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-wrap { width: 100% !important; margin: 0 auto !important; }
          .overflow-x-auto { overflow: visible !important; }
          input, textarea, select { color: #000 !important; }
          button { display: none !important; }
        }
      `}</style> */}
      <style>{`
  @page { size: A4 landscape; margin: 8mm; }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    /* ✅ HIDE global app header/nav/sidebar/footer (outside this page) */
header, nav, footer, aside { display: none !important; }

/* common layout classes (add more if your project uses them) */
.navbar, .topbar, .sidebar, .app-header, .layout-header, .layout-nav {
  display: none !important;
}

/* ✅ remove extra page padding/min-height that can push content */
html, body { margin: 0 !important; padding: 0 !important; height: auto !important; }
#root { min-height: 0 !important; height: auto !important; }


    /* ✅ hide all UI except print root (NO visibility hack) */
    #pf-page-root > :not(#pf-print-root) { display: none !important; }

    /* remove extra padding/margins in print */
    #pf-page-root { padding: 0 !important; margin: 0 !important; }

    /* ✅ print root: NOT fixed (so it won't repeat) */
    #pf-print-root {
      display: block !important;
      position: static !important;
      width: var(--pf-print-width, 100%) !important;

      /* ✅ Chrome-friendly scaling (zoom affects layout so no extra pages) */
      zoom: var(--pf-print-scale, 1);
    }

    #pf-print-root .overflow-x-auto { overflow: visible !important; }

    #pf-print-root .pf-cell {
      overflow: hidden !important;
      padding: 2px !important;
    }

    #pf-print-root input,
    #pf-print-root select {
      font-size: 10px !important;
      line-height: 1.1 !important;
      height: 16px !important;
      padding: 0 2px !important;
      margin: 0 !important;
    }

    #pf-print-root textarea {
      font-size: 10px !important;
      line-height: 1.1 !important;
      min-height: 36px !important;
      padding: 2px !important;
      margin: 0 !important;
    }

    .no-print { display: none !important; }
  }
`}</style>


      {/* 🔝 Global logo resize panel */}
      {renderImageSizePanel()}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold">Fill Form: {formTitle}</h1>
          <p className="text-xs text-gray-500">
            Project #{projectId}
            {formCode ? ` • Code: ${formCode}` : ""}
            {responseLoading ? " • Loading response..." : ""}
          </p>
        </div>

        <div className="flex items-center gap-3 no-print">
          <button
            type="button"
            onClick={handleExportPdf}
            className="px-3 py-1.5 text-xs border rounded bg-white hover:bg-gray-50"
          >
            Export PDF
          </button>

          <button
            onClick={() => navigate(-1)}
            className="text-xs text-blue-600 underline"
          >
            ← Back to project forms
          </button>
        </div>
      </div>

      {loading || !assignment ? (
        <div className="text-sm text-gray-500">Loading form...</div>
      ) : (
        <>
          <div id="pf-print-root" ref={printRef}>
  {renderBody()}
</div>

          {/* 🔥 Forward section (optional) */}
          <div className="mt-4 border-t pt-3 no-print">
            <h2 className="text-sm font-semibold mb-2">
              Forward (optional)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block mb-1 font-medium">
                  Project
                </label>
                <input
                  type="text"
                  className="w-full border rounded px-2 py-1 bg-gray-50"
                  value={projectId}
                  readOnly
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">
                  Forward to user
                </label>
                <select
                  className="w-full border rounded px-2 py-1 bg-white"
                  value={forwardToUserId}
                  onChange={(e) => setForwardToUserId(e.target.value)}
                  disabled={usersLoading}
                >
                  <option value="">
                    {usersLoading
                      ? "Loading users..."
                      : "Do not forward (only save)"}
                  </option>
                  {projectUsers.map((u) => {
                    const id = u.id ?? u.user_id;
                    const name =
                      u.full_name ||
                      u.name ||
                      u.username ||
                      `${u.first_name || ""} ${u.last_name || ""}`.trim() ||
                      `User #${id}`;
                    return (
                      <option key={id} value={id}>
                        {name} (#{id})
                      </option>
                    );
                  })}
                </select>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  Project ke users yahan aa rahe hain.
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium">
                  Status with forward
                </label>
                <select
                  className="w-full border rounded px-2 py-1 bg-white"
                  value={forwardDecision}
                  onChange={(e) => setForwardDecision(e.target.value)}
                  disabled={!forwardToUserId}
                >
                  <option value="APPROVED">Accept (APPROVED)</option>
                  <option value="REJECTED">Reject (REJECTED)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4 no-print">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit("DRAFT")}
              className="px-3 py-1.5 text-xs border rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            >
              Save as Draft
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit("SUBMITTED")}
              className="px-3 py-1.5 text-xs border rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Submit Form
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectFormFillPage;

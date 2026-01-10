// src/components/ProjectFormFillPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  createFormResponse,
  getAssignedFormsForProject,
  getUsersByProject,
  forwardFormResponse,
  listFormTasks,
  getFormResponse,
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
    const rawType = (f.type || f.field_type || block.block_type || "TEXT").toUpperCase();
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

  const rawType = (block.field_type || block.input_type || block.block_type || "TEXT").toUpperCase();

  const label = block.field_label || block.label || block.text || key;

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
let blocks = col.blocks || [];
let colFields = col.fields || [];
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
                config: { hideLabel: true },
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
              return (bt === "TEXT_STATIC" || bt === "TEXT") && (b.text || b.label);
            });
            const hasImageBlock = blocks.some((b) => {
              const bt = (b.block_type || b.blockType || "").toUpperCase();
              return bt === "IMAGE" || bt === "LOGO";
            });
            const hasFieldBlock = blocks.some((b) => !!extractFieldFromBlock(b));

            const isAutoEmpty = !hasFieldBlock && !hasColFieldsAny && !hasTextBlock && !hasImageBlock;

            if (isAutoEmpty) {
              let createdFromLeft = false;

              // 3a) LEFT label -> current blank cell
              if (cIdx > 0) {
                const prevCol = columns[cIdx - 1];
                const prevBlocks = (prevCol && prevCol.blocks) || [];
                const labelBlock = prevBlocks.find((b) => {
                  const bt = (b.block_type || b.blockType || "").toUpperCase();
                  return (bt === "TEXT_STATIC" || bt === "TEXT") && (b.text || b.label);
                });

                if (labelBlock) {
                  const rowTag = row.excel_row || rowIdx + 1;
                  const colTag = col.excel_col || cIdx + 1;
                  const key = `cell_${rowTag}_${colTag}`;

                  const labelText = labelBlock.text || labelBlock.label || key;

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
              // 3b) HEADER (scan upward) label -> current blank cell (handles merged header rows)
if (!createdFromLeft) {
  let headerLabelBlock = null;

  // scan up to 12 rows ऊपर तक (merged headers ke liye)
  for (let up = rowIdx - 1; up >= 0 && up >= rowIdx - 12; up--) {
    const headerRow = rows[up];
    const headerCols = headerRow.columns || headerRow.blocks || headerRow.cols || [];
    const hc = headerCols[cIdx];
    if (!hc) continue;

    const hb = (hc.blocks || []).find((b) => {
      const bt = (b.block_type || b.blockType || "").toUpperCase();
      const txt = b.text || b.label;
      return txt && (bt === "TEXT_STATIC" || bt === "TEXT");
    });

    if (hb) {
      headerLabelBlock = hb;
      break;
    }
  }

  if (headerLabelBlock) {
    const rowTag = row.excel_row || rowIdx + 1;
    const colTag = col.excel_col || cIdx + 1;
    const key = `cell_${rowTag}_${colTag}`;
    if (!seen.has(key)) {
      const labelText = String(headerLabelBlock.text || headerLabelBlock.label || key).trim();

      let type = "TEXT";
      if (LABEL_FILE_REGEX.test(labelText || "")) type = "FILE";

      addField(
        {
          key,
          label: labelText,
          type,
          config: { hideLabel: true },
          required: false,
        },
        col
      );
    }
  }
}

              // if (!createdFromLeft && rowIdx > 0) {
              //   const headerRow = rows[rowIdx - 1];
              //   if (headerRow) {
              //     const headerCols = headerRow.columns || headerRow.blocks || headerRow.cols || [];
              //     const headerCol = headerCols[cIdx];
              //     if (headerCol) {
              //       const headerBlocks = headerCol.blocks || [];
              //       const headerLabelBlock = headerBlocks.find((b) => {
              //         const bt = (b.block_type || b.blockType || "").toUpperCase();
              //         const txt = b.text || b.label;
              //         return txt && (bt === "TEXT_STATIC" || bt === "TEXT");
              //       });

              //       if (headerLabelBlock) {
              //         const rowTag = row.excel_row || rowIdx + 1;
              //         const colTag = col.excel_col || cIdx + 1;
              //         const key = `cell_${rowTag}_${colTag}`;
              //         if (!seen.has(key)) {
              //           const labelText = String(headerLabelBlock.text || headerLabelBlock.label || key)
              //             .trim();

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
              //         }
              //       }
              //     }
              //   }
              // }
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

          const labelText = String(labelBlock.text || labelBlock.label || key).trim();

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
/* =========================
   TABLE DETECTION + RENDER
========================= */

// safer text extraction from a cell
const cellText = (col) => {
  const blocks = col?.blocks || [];
  const tb = blocks.find((b) => {
    const bt = String(b.block_type || b.blockType || "").toUpperCase();
    const t = b.text || b.label;
    return t && (bt === "TEXT_STATIC" || bt === "TEXT");
  });
  return tb ? String(tb.text || tb.label || "").trim() : "";
};

const rowTextCount = (row) => {
  const cols = row?.columns || row?.blocks || row?.cols || [];
  return cols.reduce((n, col) => (cellText(col) ? n + 1 : n), 0);
};

const rowHasBigMergedBlanks = (row) => {
  const cols = row?.columns || row?.blocks || row?.cols || [];
  if (!cols.length) return false;

  let mergedTall = 0;
  let empty = 0;

  cols.forEach((col) => {
    const t = cellText(col);
    if (!t) empty++;

    const m = col?.merge || {};
    const isTopLeft = m.is_top_left !== false;
    const rs = Number(m.row_span || 1);
    if (isTopLeft && rs >= 3) mergedTall++;
  });

  // mostly blank + many tall merged cells
  return empty >= Math.max(3, Math.floor(cols.length * 0.7)) && mergedTall >= Math.max(2, Math.floor(cols.length * 0.4));
};

// slug key from heading
const slugKey = (s) =>
  String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "col";

const detectTableRegion = (rows) => {
  // find a header row where next row is big blank merged area
  for (let i = 0; i < rows.length - 1; i++) {
    const header = rows[i];
    const body = rows[i + 1];

    const headerCols = header?.columns || header?.blocks || header?.cols || [];
    if (!headerCols.length) continue;

    const headCount = rowTextCount(header);
    if (headCount < 3) continue;

    // header should have "heading-like" short texts
    const labels = headerCols.map((c) => cellText(c));
    const shortHeadings = labels.filter((t) => t && t.length <= 35).length;
    if (shortHeadings < 3) continue;

    // next row must look like table body region
    if (!rowHasBigMergedBlanks(body)) continue;

    // decide table start/end columns by non-empty headings
    const idxs = labels
      .map((t, idx) => (t ? idx : null))
      .filter((v) => v !== null);

    if (idxs.length < 3) continue;

    const startIdx = idxs[0];
    const endIdx = idxs[idxs.length - 1];

    const bodyCols = body?.columns || body?.blocks || body?.cols || [];
    const spans = bodyCols.slice(startIdx, endIdx + 1).map((c) => Number(c?.merge?.row_span || 1));
    const bodyRowSpan = Math.max(...spans, 1);

    // stable table key from excel coords
    const headerRowTag = header.excel_row || i + 1;
    const startColTag = (headerCols[startIdx]?.excel_col || startIdx + 1);

    const tableKey = `table_${headerRowTag}_${startColTag}`;

    // build column meta
    const used = new Set();
    const columns = labels.slice(startIdx, endIdx + 1).map((lbl, j) => {
      const label = lbl || `Column ${j + 1}`;
      let key = slugKey(label);

      if (used.has(key)) {
        let k2 = key;
        let n = 2;
        while (used.has(`${k2}_${n}`)) n++;
        key = `${k2}_${n}`;
      }
      used.add(key);

      const upper = label.toUpperCase();
      const isSN = upper === "SN" || upper === "SNO" || upper.includes("SR") || upper.includes("SRNO") || upper.includes("S. NO");
      const isFile = LABEL_FILE_REGEX.test(label);

      let type = "TEXT";
      if (isFile) type = "FILE";
      else if (upper.includes("AMOUNT") || upper.includes("QTY") || upper.includes("QUANTITY") || upper.includes("RATE")) type = "NUMBER";

      return {
        key: isSN ? "sn" : key,
        label,
        type,
        readOnly: isSN,
      };
    });

    return { headerRowIdx: i, bodyStartRowIdx: i + 1, startIdx, endIdx, bodyRowSpan, tableKey, columns };
  }

  return null;
};

// Dynamic table component (stores array of rows in formValues[tableKey])
const TableField = ({ tableKey, columns, defaultRows = 8, value, onChange }) => {
  const ensureInit = React.useRef(false);

  useEffect(() => {
    if (ensureInit.current) return;
    ensureInit.current = true;

    if (!Array.isArray(value)) {
      const init = new Array(defaultRows).fill(0).map((_, i) => {
        const row = {};
        columns.forEach((c) => {
          if (c.key === "sn") row[c.key] = i + 1;
          else row[c.key] = c.type === "FILE" ? null : "";
        });
        return row;
      });
      onChange(init);
    }
  }, [value, columns, defaultRows, onChange]);

  const rows = Array.isArray(value) ? value : [];

  const setCell = (rIdx, colKey, val) => {
    const next = rows.map((r, i) => (i === rIdx ? { ...r, [colKey]: val } : r));
    // keep SN auto
    next.forEach((r, i) => {
      if ("sn" in r) r.sn = i + 1;
    });
    onChange(next);
  };

  const addRow = () => {
    const row = {};
    columns.forEach((c) => {
      if (c.key === "sn") row[c.key] = rows.length + 1;
      else row[c.key] = c.type === "FILE" ? null : "";
    });
    onChange([...(rows || []), row]);
  };

  const removeRow = (idx) => {
    const next = rows.filter((_, i) => i !== idx);
    next.forEach((r, i) => {
      if ("sn" in r) r.sn = i + 1;
    });
    onChange(next);
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 text-[11px]">
          <thead>
            <tr className="bg-gray-50">
              {columns.map((c) => (
                <th key={c.key} className="border border-gray-300 px-2 py-1 text-left font-semibold">
                  {c.label}
                </th>
              ))}
              <th className="border border-gray-300 px-2 py-1 text-left font-semibold no-print">Action</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r, rIdx) => (
              <tr key={rIdx}>
                {columns.map((c) => {
                  const v = r?.[c.key];

                  if (c.type === "FILE") {
                    let preview = null;
                    if (typeof v === "string") preview = v;
                    else if (v instanceof File) preview = URL.createObjectURL(v);

                    return (
                      <td key={c.key} className="border border-gray-300 px-2 py-1 align-top">
                        {preview && (
                          <img
                            src={preview}
                            alt={c.label}
                            className="mb-1 max-h-[60px] object-contain border rounded bg-white"
                          />
                        )}
                        <input
                          type="file"
                          className="no-print text-[10px]"
                          accept=".png,.jpg,.jpeg,.webp,.svg,.pdf"
                          onChange={(e) => setCell(rIdx, c.key, e.target.files?.[0] || null)}
                        />
                        {v instanceof File && <div className="no-print text-[10px] text-gray-600 mt-1">{v.name}</div>}
                      </td>
                    );
                  }

                  if (c.readOnly) {
                    return (
                      <td key={c.key} className="border border-gray-300 px-2 py-1">
                        {rIdx + 1}
                      </td>
                    );
                  }

                  return (
                    <td key={c.key} className="border border-gray-300 px-2 py-1">
                      <input
                        className="w-full border rounded px-1 py-[2px] text-[11px]"
                        type={c.type === "NUMBER" ? "number" : "text"}
                        value={v ?? ""}
                        onChange={(e) => setCell(rIdx, c.key, e.target.value)}
                      />
                    </td>
                  );
                })}

                <td className="border border-gray-300 px-2 py-1 no-print">
                  <button
                    type="button"
                    className="text-[10px] px-2 py-0.5 border rounded bg-white hover:bg-gray-50"
                    onClick={() => removeRow(rIdx)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-2 flex items-center gap-2 no-print">
        <button
          type="button"
          onClick={addRow}
          className="text-[11px] px-3 py-1 border rounded bg-white hover:bg-gray-50"
        >
          + Add Row
        </button>
        <div className="text-[10px] text-gray-500">Table key: {tableKey}</div>
      </div>
    </div>
  );
};

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
  const [responseId, setResponseId] = useState(qpResponseId ? Number(qpResponseId) : null);
  const [responsePayload, setResponsePayload] = useState(null);
  const [responseLoading, setResponseLoading] = useState(Boolean(qpResponseId));

  const [projectId] = useState(qpProjectId);
  const [assignment, setAssignment] = useState(() => location.state?.assignment || null);

  // 👇 image width+height per field, and which image is selected
  const [imageSizes, setImageSizes] = useState({});
  const [activeImageKey, setActiveImageKey] = useState(null);
  const getImageSize = (fieldKey) => imageSizes[fieldKey] || { width: 180, height: 90 };

  const [formValues, setFormValues] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(!location.state?.assignment);
  const [submitting, setSubmitting] = useState(false);

  // 🔥 NEW: project users + forward state
  const [projectUsers, setProjectUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [forwardToUserId, setForwardToUserId] = useState("");
  const [forwardDecision, setForwardDecision] = useState("APPROVED");

  const handleExportPdf = () => {
    setActiveImageKey(null);

    setTimeout(() => {
      const el = printRef.current;
      if (!el) {
        window.print();
        return;
      }

      const mmToPx = (mm) => (mm / 25.4) * 96;
      const pageWidthMm = 297;
      const marginMm = 8;
      const availablePx = mmToPx(pageWidthMm - marginMm * 2);

      const srcWidth = el.scrollWidth || el.getBoundingClientRect().width;
      const scale = Math.min(1, availablePx / srcWidth);

      document.documentElement.style.setProperty("--pf-print-width", `${srcWidth}px`);
      document.documentElement.style.setProperty("--pf-print-scale", `${scale}`);

      window.print();
    }, 50);
  };

  useEffect(() => {
    console.log("📦 [Fill] assignment object:", assignment);
    console.log("📦 [Fill] template_version_detail:", assignment?.template_version_detail);
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
        const res = await getAssignedFormsForProject(projectId);
        const list = normalizeList(res);

        const found = list.find((a) => String(a.id) === String(qpAssignmentId));
        if (found) {
          setAssignment(found);
          return;
        }

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

  // const normalizeAnswersForSubmit = async (values) => {
  //   const out = { ...(values || {}) };

  //   for (const [k, v] of Object.entries(out)) {
  //     if (v instanceof File) {
  //       if (v.size > 1.5 * 1024 * 1024) {
  //         throw new Error(`File too large for ${k}. Please upload smaller image.`);
  //       }
  //       out[k] = await fileToDataUrl(v);
  //     }
  //   }
  //   return out;
  // };
  const normalizeAnswersForSubmit = async (values) => {
  const maxSize = 1.5 * 1024 * 1024;

  const toDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });

  const walk = async (v, path = "") => {
    if (v instanceof File) {
      if (v.size > maxSize) throw new Error(`File too large at ${path}`);
      return await toDataUrl(v);
    }
    if (Array.isArray(v)) {
      const out = [];
      for (let i = 0; i < v.length; i++) out.push(await walk(v[i], `${path}[${i}]`));
      return out;
    }
    if (v && typeof v === "object") {
      const out = {};
      for (const [k, val] of Object.entries(v)) out[k] = await walk(val, path ? `${path}.${k}` : k);
      return out;
    }
    return v;
  };

  return await walk({ ...(values || {}) });
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
    const cleaned = {};
    Object.entries(a || {}).forEach(([k, v]) => {
      if (v && typeof v === "object" && !(v instanceof File) && !Array.isArray(v)) {
        cleaned[k] = Object.keys(v).length ? v : null;
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

    setFormValues({ ...initial, ...prefillAnswers });
    setErrors({});
  }, [assignment, allFields, prefillAnswers]);

  const getFieldLabel = (field) => field.label || field.title || field.key || "Field";

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
      const isEmpty = v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);

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
      const finalAnswers = await normalizeAnswersForSubmit(formValues);

      let savedResponseId = responseId;

      if (savedResponseId) {
        await updateFormResponse(savedResponseId, {
          status,
          answers: finalAnswers,
          data: finalAnswers,
        });
      } else {
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

      if (savedResponseId && forwardToUserId) {
        await forwardFormResponse(savedResponseId, {
          to_user_id: Number(forwardToUserId),
          decision: forwardDecision,
        });
        toast.success(status === "DRAFT" ? "Saved (draft) and forwarded." : "Submitted and forwarded.");
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

  // 🔧 FILE + normal fields (UI tightened; logic same)
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
        {isFieldRequired(field) && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    ) : null;

    const commonError = error ? <div className="text-[10px] text-red-500 mt-0.5">{error}</div> : null;

    // ✅ tighter + min-w-0 to stop overflow/overlay in grid
    const inputBase =
      "w-full min-w-0 border rounded text-xs leading-tight focus:outline-none " +
      (compact ? "px-1 py-[1px] h-[22px]" : "px-2 py-1");

    const isFileLike =
      rawType === "FILE" ||
      rawType === "IMAGE" ||
      rawType === "LOGO" ||
      rawType.includes("FILE") ||
      rawType.includes("UPLOAD") ||
      rawType.includes("IMAGE");

    if (isFileLike) {
      const fileInputId = `pf_file_${key}`;
      let previewUrl = null;

      if (value) {
        if (typeof value === "string") previewUrl = value;
        else if (value instanceof File) previewUrl = URL.createObjectURL(value);
      }

      const { width: imgWidth, height: imgHeight } = getImageSize(key);

      const clearImage = () => {
        handleChange(key, null);

        setImageSizes((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });

        setActiveImageKey((prev) => (prev === key ? null : prev));
      };

      // ✅ compact thumb limits so it NEVER overlays other rows
      // ✅ compact thumb (bigger)
const compactThumb = {
  maxHeight: 80,
  maxWidth: "100%",
};

      return (
        <div key={key} className={(compact ? "pf-fieldwrap" : "pf-fieldwrap mb-2")}>
          {commonLabel}

          {previewUrl && (
            <div className={compact ? "flex items-center gap-2 relative" : "flex flex-col items-center mb-1 relative"}>
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
  className="object-contain cursor-pointer rounded border border-gray-200 bg-white"
                style={compact ? compactThumb : { maxHeight: imgHeight, maxWidth: imgWidth }}
                onClick={() => {
                  setActiveImageKey(key);
                  if (!imageSizes[key]) {
                    setImageSizes((prev) => ({
                      ...prev,
                      [key]: { width: 180, height: 90 },
                    }));
                  }
                }}
              />

              {!compact && (
                <div className="text-[9px] text-gray-400 mt-0.5 no-print">Click image to adjust size above</div>
              )}
            </div>
          )}


{compact ? (
  <>
    {/* hidden real input */}
    <input
      id={fileInputId}
      type="file"
      className="hidden"
      onChange={(e) => {
        const file = e.target.files && e.target.files[0];
        handleChange(key, file || null);

        if (file && !imageSizes[key]) {
          setImageSizes((prev) => ({
            ...prev,
            [key]: { width: 180, height: 90 },
          }));
        }
      }}
      accept={cfg.accept || ".png,.jpg,.jpeg,.webp,.svg,.pdf"}
    />

    {/* visible compact button */}
    <label
      htmlFor={fileInputId}
      className="no-print inline-flex items-center gap-2 w-full border rounded px-1 h-[18px] text-[10px] bg-white cursor-pointer"
      title="Upload file"
    >
      <span className="shrink-0">Choose</span>
      <span className="text-gray-500 truncate min-w-0">
        {value instanceof File
          ? value.name
          : typeof value === "string" && value
          ? "Uploaded"
          : "No file"}
      </span>
    </label>
  </>
) : (
  <input
    type="file"
    className={inputBase + " no-print"}
    onChange={(e) => {
      const file = e.target.files && e.target.files[0];
      handleChange(key, file || null);

      if (file && !imageSizes[key]) {
        setImageSizes((prev) => ({
          ...prev,
          [key]: { width: 180, height: 90 },
        }));
      }
    }}
    accept={cfg.accept || ".png,.jpg,.jpeg,.webp,.svg,.pdf"}
  />
)}


          {value && value.name && value instanceof File && !compact && (
            <div className="mt-1 text-[10px] text-gray-600 no-print">Selected: {value.name}</div>
          )}

          {commonError}
        </div>
      );
    }

    switch (rawType) {
      case "TEXT":
      case "PHONE":
      case "EMAIL":
      case "NUMBER":
        return (
          <div key={key} className={(compact ? "pf-fieldwrap" : "pf-fieldwrap mb-2")}>
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
          <div key={key} className={(compact ? "pf-fieldwrap" : "pf-fieldwrap mb-2")}>
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
          <div key={key} className={(compact ? "pf-fieldwrap" : "pf-fieldwrap mb-2")}>
            {commonLabel}
            <textarea
              className={
                "w-full min-w-0 border rounded text-xs leading-tight focus:outline-none " +
                (compact ? "px-1 py-1 min-h-[44px] max-h-full overflow-auto resize-none" : "px-2 py-1 min-h-[80px]")
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
          <div key={key} className={(compact ? "pf-fieldwrap" : "pf-fieldwrap mb-2")}>
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
          <div key={key} className={"pf-fieldwrap flex items-center gap-2 " + (compact ? "" : "mb-2")}>
            <input type="checkbox" checked={!!value} onChange={(e) => handleChange(key, e.target.checked)} />
            <span className="text-[11px] min-w-0">
              {label}
              {isFieldRequired(field) && <span className="text-red-500 ml-0.5">*</span>}
            </span>
            {commonError}
          </div>
        );

      default:
        return (
          <div key={key} className={(compact ? "pf-fieldwrap" : "pf-fieldwrap mb-2")}>
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
                  const current = prev[activeImageKey] || { width: 120, height };
                  return {
                    ...prev,
                    [activeImageKey]: { ...current, width: w },
                  };
                });
              }}
              className="w-full"
            />
            <div className="text-[10px] text-gray-500">Logo width: {width}px</div>
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
                  const current = prev[activeImageKey] || { width, height: 60 };
                  return {
                    ...prev,
                    [activeImageKey]: { ...current, height: h },
                  };
                });
              }}
              className="w-full"
            />
            <div className="text-[10px] text-gray-500">Logo height: {height}px</div>
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
      return <div className="text-sm text-gray-500">No schema defined for this form.</div>;
    }

    if (Array.isArray(schema.sections) && schema.sections.length) {
      const meta = schema.excel_meta || null;
      const hasExcelMeta = !!meta;
const computeNCols = (rows, minCol) => {
  let maxCol = 0;

  rows.forEach((row, rIdx) => {
    const cols = row?.columns || row?.blocks || row?.cols || [];
    cols.forEach((col, cIdx) => {
      const m = col?.merge || {};
      const isMerged = !!m.is_merged;
      const isTopLeft = m.is_top_left !== false;
      if (isMerged && !isTopLeft) return;

      const excelCol = Number(col?.excel_col || (minCol + cIdx));
      const span = Number(m.col_span || 1);
      maxCol = Math.max(maxCol, excelCol + span - 1);
    });
  });

  return Math.max(1, maxCol - (minCol || 1) + 1);
};

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
                  // const metaColWidths = meta.col_widths || [];
                  // const minCol = meta.min_col || 1;
                  // const metaColWidths = meta.col_widths || [];
// const minCol = meta.min_col || 1;

// // ✅ true columns count (your case will become 7)
// const nCols = Math.max(
//   metaColWidths.length || 0,
//   computeNCols(rows, minCol)
// );

// // ✅ pad widths so gridTemplateColumns has all tracks
// let colWidths = [...metaColWidths];
const metaColWidths = meta.col_widths || [];
const minCol = meta.min_col || 1;

// ✅ true columns count (last columns bhi include honge)
const nCols = Math.max(
  metaColWidths.length || 0,
  computeNCols(rows, minCol)
);

// ✅ pad widths so gridTemplateColumns has all tracks
let colWidths = [...metaColWidths];
if (colWidths.length < nCols) colWidths = colWidths.concat(new Array(nCols - colWidths.length).fill(1));
if (colWidths.length > nCols) colWidths = colWidths.slice(0, nCols);
if (!colWidths.length) colWidths = new Array(nCols).fill(1);

if (colWidths.length < nCols) colWidths = colWidths.concat(new Array(nCols - colWidths.length).fill(1));
if (colWidths.length > nCols) colWidths = colWidths.slice(0, nCols);


                  const firstRowCols = rows[0]?.columns || rows[0]?.blocks || rows[0]?.cols || [];
                  // const nCols = metaColWidths.length || (firstRowCols.length || 1);

                  let headerLabels = [];
                  if (rows.length) {
                    const headerRow = rows[0];
                    const headerCols = headerRow.columns || headerRow.blocks || headerRow.cols || [];
                    headerLabels = headerCols.map((col) => {
                      const blocks = col.blocks || [];
                      const textBlock = blocks.find((b) => {
                        const bt = (b.block_type || b.blockType || "").toUpperCase();
                        const txt = b.text || b.label;
                        return txt && (bt === "TEXT_STATIC" || bt === "TEXT");
                      });
                      return textBlock ? String(textBlock.text || textBlock.label || "").trim().toLowerCase() : "";
                    });
                  }

                  // let colWidths = [...metaColWidths];
                  if (!colWidths.length) {
                    colWidths = new Array(nCols).fill(1);
                  }

                  colWidths = colWidths.map((w, idx) => {
                    const label = headerLabels[idx] || "";
                    if (label.includes("target date") || label.includes("status on (date)") || label.includes("status on ")) {
                      return (w || 1) * 1.5;
                    }
                    return w || 1;
                  });

                  const totalUnits = colWidths.reduce((sum, w) => sum + (w || 0), 0) || 1;

                  const gridTemplateColumns = colWidths.map((w) => `${(w / totalUnits) * 100}%`).join(" ");

                  const isFileLikeField = (f) => {
  const t = String(f?.type || f?.field_type || "").toUpperCase();
  const lbl = String(f?.label || f?.title || f?.key || "");
  return (
    t === "FILE" ||
    t === "IMAGE" ||
    t === "LOGO" ||
    t.includes("FILE") ||
    t.includes("UPLOAD") ||
    t.includes("IMAGE") ||
    LABEL_FILE_REGEX.test(lbl)
  );
};

const rowNeedsTall = (row, rIdx) => {
  const columns = row.columns || row.blocks || row.cols || [];
  return columns.some((col, cIdx) => {
    const blocks = col.blocks || [];
    const colFields = col.fields || [];

    // image/logo blocks
    const hasImgBlock = blocks.some((b) => {
      const bt = String(b.block_type || b.blockType || "").toUpperCase();
      return bt === "IMAGE" || bt === "LOGO";
    });
    if (hasImgBlock) return true;

    // explicit block fields
    const bf = blocks.map((b) => extractFieldFromBlock(b)).find(Boolean);
    if (bf && isFileLikeField(bf)) return true;

    // col.fields
    const cf = colFields.find((f) => isFileLikeField(f));
    if (cf) return true;

    // autoField
    if (col._autoField && isFileLikeField(col._autoField)) return true;

    // coord key mapping
    const rowTag = row.excel_row || rIdx + 1;
    const colTag = col.excel_col || cIdx + 1;
    const coordKey = `cell_${rowTag}_${colTag}`;
    if (isFileLikeField(fieldMapByKey[coordKey])) return true;

    return false;
  });
};

// ✅ rows with file/image get bigger height
const gridTemplateRows = rows
  .map((row, idx) => {
    const base = (row.height || 20) + 6;
    const minH = rowNeedsTall(row, idx) ? 110 : 28; // 👈 FILE row min height
    return `${Math.max(base, minH)}px`;
  })
  .join(" ");

const tableRegion = detectTableRegion(rows);

                  return (
                    <div
                      className="pf-grid grid"
                      style={{
                        gridTemplateColumns,
                        gridTemplateRows,
                            gridAutoColumns: "minmax(60px, 1fr)",

                      }}
                    >
                      {rows.map((row, rIdx) => {
                        const columns = row.columns || row.blocks || row.cols || [];
                        return columns.map((col, cIdx) => {
                          const merge = col.merge || {};
                          const isMerged = !!merge.is_merged;
                          const isTopLeft = merge.is_top_left !== false;

                          if (isMerged && !isTopLeft) return null;

                          const rowSpan = merge.row_span || 1;
                          const colSpan = merge.col_span || 1;
                          // ✅ If this is TOP-LEFT of a merged cell: collect all sub-cells content
let mergedContent = null;

if (isMerged && isTopLeft && (rowSpan > 1 || colSpan > 1)) {
  const fieldKeySet = new Set();
  const textSeen = new Set();

  const out = {
    textBlocks: [],
    imageBlocks: [],
    fields: [],
  };

  const pushField = (f) => {
    if (!f?.key) return;
    if (fieldKeySet.has(f.key)) return;
    fieldKeySet.add(f.key);
    out.fields.push(f);
  };

  for (let rr = 0; rr < rowSpan; rr++) {
    const rObj = rows[rIdx + rr];
    if (!rObj) continue;

    const cols2 = rObj.columns || rObj.blocks || rObj.cols || [];
    for (let cc = 0; cc < colSpan; cc++) {
      const cObj = cols2[cIdx + cc];
      if (!cObj) continue;

      const b2 = cObj.blocks || [];

      // collect text/image blocks
      b2.forEach((b) => {
        const bt = String(b.block_type || b.blockType || "").toUpperCase();
        const txt = String(b.text || b.label || "").trim();

        if (txt && (bt === "TEXT_STATIC" || bt === "TEXT")) {
          const k = `${bt}:${txt}`;
          if (!textSeen.has(k)) {
            textSeen.add(k);
            out.textBlocks.push(b);
          }
        }

        if (bt === "IMAGE" || bt === "LOGO") out.imageBlocks.push(b);

        // collect fields from blocks
        const f = extractFieldFromBlock(b);
        if (f?.key) pushField(f);
      });

      // collect fields from col.fields
      (cObj.fields || []).forEach((raw) => {
        if (!raw?.key) return;
        let type = (raw.type || raw.field_type || "TEXT").toUpperCase();
        if (type === "LONG_TEXT" || type === "MULTILINE") type = "TEXTAREA";

        const label = raw.label || raw.title || raw.key;
        if (LABEL_FILE_REGEX.test(label || "")) type = "FILE";

        pushField({
          key: raw.key,
          label,
          type,
          config: raw.config || raw.field_config || {},
          required: !!(raw.required || raw.is_required),
        });
      });

      // collect autoField
      if (cObj._autoField?.key) pushField(cObj._autoField);

      // collect coordKey mapped fields (cell_10_2 etc)
      const rTag2 = rObj.excel_row || (rIdx + rr + 1);
      const cTag2 = cObj.excel_col || (cIdx + cc + 1);
      const ck2 = `cell_${rTag2}_${cTag2}`;
      if (fieldMapByKey[ck2]?.key) pushField(fieldMapByKey[ck2]);
    }
  }

  mergedContent = out;
}


                          const blocks = col.blocks || [];
                          const colFields = col.fields || [];

                          const rowTag = row.excel_row || rIdx + 1;
                          const colTag = col.excel_col || cIdx + 1;
                          const coordKey = `cell_${rowTag}_${colTag}`;
                          // ✅ TABLE REGION RENDER (global)
if (tableRegion) {
  const inTableCols = cIdx >= tableRegion.startIdx && cIdx <= tableRegion.endIdx;
  const inTableRows =
    rIdx >= tableRegion.bodyStartRowIdx && rIdx < tableRegion.bodyStartRowIdx + tableRegion.bodyRowSpan;

  // 1) Header row: show ONLY headings (no inputs)
  if (rIdx === tableRegion.headerRowIdx) {
    // force disable any auto-field in header
    // (we’ll just let your existing textBlocks render below)
  }

  // 2) Body region: render ONE big table cell spanning all table columns + body rows
  if (rIdx === tableRegion.bodyStartRowIdx && cIdx === tableRegion.startIdx) {
    const startCol = (columns[cIdx].excel_col || cIdx + minCol) - minCol + 1;
    const startRow = rIdx + 1;

    return (
      <div
        key={`table-${rIdx}-${cIdx}`}
        className="pf-cell border border-gray-200 align-top bg-white"
        style={{
          gridColumnStart: startCol,
          gridColumnEnd: startCol + (tableRegion.endIdx - tableRegion.startIdx + 1),
          gridRowStart: startRow,
          gridRowEnd: startRow + tableRegion.bodyRowSpan,
          padding: "6px",
        }}
      >
        <TableField
          tableKey={tableRegion.tableKey}
          columns={tableRegion.columns}
          value={formValues[tableRegion.tableKey]}
          onChange={(rowsVal) => handleChange(tableRegion.tableKey, rowsVal)}
          defaultRows={8}
        />
      </div>
    );
  }

  // 3) Skip all other cells inside the table body area (they’re merged blanks)
  if (inTableCols && inTableRows) {
    return null;
  }
}


                          let fieldToRender = fieldMapByKey[coordKey] || null;

                          if (!fieldToRender && blocks.length) {
                            const fromBlocks = blocks.map((b) => extractFieldFromBlock(b)).find((f) => f && f.key);
                            if (fromBlocks) fieldToRender = fromBlocks;
                          }

                          if (!fieldToRender && colFields.length) {
                            const raw = colFields.find((f) => f && f.key);
                            if (raw) {
                              let type = (raw.type || raw.field_type || "TEXT").toUpperCase();
                              if (type === "LONG_TEXT" || type === "MULTILINE") {
                                type = "TEXTAREA";
                              }
                              const label = raw.label || raw.title || raw.key;
                              if (LABEL_FILE_REGEX.test(label || "")) {
                                type = "FILE";
                              }
                              fieldToRender = {
                                key: raw.key,
                                label,
                                type,
                                config: raw.config || raw.field_config || {},
                                required: !!(raw.required || raw.is_required),
                              };
                            }
                          }

                          if (!fieldToRender && col._autoField) {
                            fieldToRender = col._autoField;
                          }

                          const textBlocks = blocks.filter((b) => {
                            const bt = (b.block_type || "").toUpperCase();
                            return bt === "TEXT_STATIC" || bt === "TEXT";
                          });

                          const imageBlocks = blocks.filter((b) => {
                            const bt = (b.block_type || "").toUpperCase();
                            return bt === "IMAGE" || bt === "LOGO";
                          });
                          const effectiveTextBlocks = mergedContent?.textBlocks ?? textBlocks;
const effectiveImageBlocks = mergedContent?.imageBlocks ?? imageBlocks;

const mergedFields = mergedContent?.fields || [];
const fieldsToRender = mergedContent ? mergedFields : (fieldToRender ? [fieldToRender] : []);

const multiFields = fieldsToRender.length > 1;


                          // if (!fieldToRender && textBlocks.length) {
                          //   const labelTextRaw = textBlocks
                          //     .map((b) => b.text || b.label || "")
                          //     .join(" ")
                          //     .trim();

                          //   if (labelTextRaw) {
                          //     const matched = allFields.find((f) => (f.label || "").trim() === labelTextRaw);
                          //     if (matched) {
                          //       console.log("🔗 [Fill] matched field by label:", labelTextRaw, "->", matched.key);
                          //       fieldToRender = matched;
                          //     }
                          //   }
                          // }

                          const startCol = (col.excel_col || cIdx + minCol) - minCol + 1;
                          const startRow = rIdx + 1;

                          // 👉 inline rule: 1 label + 1 simple field => label and input on same line
                          // let canInline = false;
                          // if (textBlocks.length === 1 && fieldToRender) {
                          //   const fType = (fieldToRender.type || fieldToRender.field_type || "TEXT").toUpperCase();
                          //   const isFile =
                          //     fType === "FILE" ||
                          //     fType === "IMAGE" ||
                          //     fType === "LOGO" ||
                          //     fType.includes("FILE") ||
                          //     fType.includes("UPLOAD") ||
                          //     fType.includes("IMAGE");
                          //   const isTextarea = fType === "TEXTAREA" || fType === "LONG_TEXT" || fType === "MULTILINE";

                          //   if (!isFile && !isTextarea) {
                          //     canInline = true;
                          //   }
                          // }
                          let canInline = false;
if (effectiveTextBlocks.length === 1 && fieldsToRender.length === 1) {
  const onlyField = fieldsToRender[0];
  const fType = (onlyField.type || onlyField.field_type || "TEXT").toUpperCase();

  const isFile =
    fType === "FILE" ||
    fType === "IMAGE" ||
    fType === "LOGO" ||
    fType.includes("FILE") ||
    fType.includes("UPLOAD") ||
    fType.includes("IMAGE");

  const isTextarea = fType === "TEXTAREA" || fType === "LONG_TEXT" || fType === "MULTILINE";

  if (!isFile && !isTextarea) canInline = true;
}


                          return (
                            <div
                              key={`${rIdx}-${cIdx}`}
                              className="pf-cell border border-gray-200 align-top"
                              style={{
                                gridColumnStart: startCol,
                                gridColumnEnd: startCol + colSpan,
                                gridRowStart: startRow,
                                gridRowEnd: startRow + rowSpan,
                              }}
                            >
                              <div className="pf-cell-inner">
                                {canInline ? (
  <div className="pf-inline">
    <span title={effectiveTextBlocks[0]?.text || effectiveTextBlocks[0]?.label || ""}>
      {effectiveTextBlocks[0]?.text || effectiveTextBlocks[0]?.label || ""}
    </span>
    <div className="pf-field">
      {renderField(fieldsToRender[0], { compact: true })}
    </div>
  </div>
) : (
  <>
    {effectiveTextBlocks.length > 0 && (
      <div className="pf-text">
        {effectiveTextBlocks.map((b, idx2) => (
          <div key={idx2}>{b.text || b.label || ""}</div>
        ))}
      </div>
    )}

    {effectiveImageBlocks.length > 0 && fieldsToRender.length === 0 && (
      <div className="text-[10px] text-gray-400 italic">[Logo / image placeholder]</div>
    )}

    {fieldsToRender.map((f) => (
      <div key={f.key} className="pf-field">
        {renderField(f, { compact: !multiFields })}
      </div>
    ))}
  </>
)}

                                {/* {canInline ? (
                                  <div className="pf-inline">
                                    <span title={textBlocks[0].text || textBlocks[0].label || ""}>
                                      {textBlocks[0].text || textBlocks[0].label || ""}
                                    </span>
                                    <div className="pf-field">
                                      {renderField(fieldToRender, { compact: true })}
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                   <div className="pf-cell-inner">
  {effectiveTextBlocks.length > 0 && (
    <div className="pf-text">
      {effectiveTextBlocks.map((b, idx2) => (
        <div key={idx2}>{b.text || b.label || ""}</div>
      ))}
    </div>
  )}

  {effectiveImageBlocks.length > 0 && fieldsToRender.length === 0 && (
    <div className="text-[10px] text-gray-400 italic">[Logo / image placeholder]</div>
  )}

  {fieldsToRender.map((f) => (
    <div key={f.key} className="pf-field">
      {renderField(f, { compact: !multiFields })}
    </div>
  ))}
</div>

                                  </>
                                )} */}
                              </div>
                            </div>
                          );
                        });
                      })}
                    </div>
                  );
                })()
              ) : (
                (sec.rows || []).map((row, rIdx) => {
                  const columns = row.columns || row.blocks || row.cols || [];
                  if (!columns.length) return null;

                  const totalUnits =
                    columns.reduce((sum, c) => sum + (typeof c.width === "number" ? c.width : 1), 0) || 1;

                  return (
                    <div key={row.id || rIdx} className="flex">
                      {columns.map((col, cIdx) => {
                        const blocks = col.blocks || [];
                        const colFields = col.fields || [];

                        let fieldToRender = null;

                        if (blocks.length) {
                          const fromBlocks = blocks.map((b) => extractFieldFromBlock(b)).find((f) => f && f.key);
                          if (fromBlocks) fieldToRender = fromBlocks;
                        }

                        if (!fieldToRender && colFields.length) {
                          const raw = colFields.find((f) => f && f.key);
                          if (raw) {
                            let type = (raw.type || raw.field_type || "TEXT").toUpperCase();
                            if (type === "LONG_TEXT" || type === "MULTILINE") {
                              type = "TEXTAREA";
                            }
                            const label = raw.label || raw.title || raw.key;
                            if (LABEL_FILE_REGEX.test(label || "")) {
                              type = "FILE";
                            }
                            fieldToRender = {
                              key: raw.key,
                              label,
                              type,
                              config: raw.config || raw.field_config || {},
                              required: !!(raw.required || raw.is_required),
                            };
                          }
                        }

                        if (!fieldToRender && col._autoField) {
                          fieldToRender = col._autoField;
                        }

                        const textBlocks = blocks.filter((b) => {
                          const bt = (b.block_type || "").toUpperCase();
                          return bt === "TEXT_STATIC" || bt === "TEXT";
                        });

                        const imageBlocks = blocks.filter((b) => {
                          const bt = (b.block_type || "").toUpperCase();
                          return bt === "IMAGE" || bt === "LOGO";
                        });

                        const widthUnits = typeof col.width === "number" ? col.width : 1;
                        const widthPercent = (widthUnits / totalUnits) * 100;

                        return (
                          <div
                            key={cIdx}
                            className="border border-gray-200 align-top text-[11px] min-w-0 overflow-hidden"
                            style={{
                              flexBasis: `${widthPercent}%`,
                              maxWidth: `${widthPercent}%`,
                              padding: "3px",
                              boxSizing: "border-box",
                            }}
                          >
                            {textBlocks.length > 0 && (
                              <div className="whitespace-pre-wrap leading-tight break-words">
                                {textBlocks.map((b, idx2) => (
                                  <div key={idx2}>{b.text || b.label || ""}</div>
                                ))}
                              </div>
                            )}

                            {imageBlocks.length > 0 && !fieldToRender && (
                              <div className="mt-1 text-[10px] text-gray-400 italic">[Logo / image placeholder]</div>
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

    return <div className="text-sm text-gray-500">Schema format not recognized.</div>;
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

  return (
    <div id="pf-page-root" className="p-2 sm:p-4 space-y-4">
      {/* ✅ Screen + Mobile alignment fixes (NO LOGIC CHANGE) */}
      <style>{`
        /* Excel-grid look + prevent overlay */
        #pf-page-root .pf-section {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        #pf-page-root .pf-grid {
          width: 100%;
          font-size: 11px;
        }
        #pf-page-root .pf-cell {
          box-sizing: border-box;
          padding: 3px;
          overflow: hidden;       /* ✅ stop overlay */
          min-width: 0;           /* ✅ allow shrink */
          background: #fff;
        }
        #pf-page-root .pf-cell * {
          box-sizing: border-box;
        }
        #pf-page-root .pf-cell-inner {
          height: 100%;
          min-height: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
          justify-content: flex-start;
          min-width: 0;
        }
        #pf-page-root .pf-text {
          font-size: 11px;
          line-height: 1.15;
          white-space: pre-wrap;
          word-break: break-word;
          overflow: hidden;
          min-width: 0;
        }
        #pf-page-root .pf-field {
          min-width: 0;
        }

        /* Inline label + input in same row */
        #pf-page-root .pf-inline {
          display: flex;
          align-items: center;
          gap: 4px;
          min-width: 0;
        }
        #pf-page-root .pf-inline > span {
          flex: 0 0 auto;
          max-width: 55%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Inputs inside grid cells */
        #pf-page-root .pf-cell input,
        #pf-page-root .pf-cell select,
        #pf-page-root .pf-cell textarea {
          max-width: 100%;
          min-width: 0;
        }

        /* Mobile tweaks */
        @media (max-width: 640px) {
          #pf-page-root {
            padding: 8px !important;
          }
          #pf-page-root .pf-cell {
            padding: 2px;
          }
          #pf-page-root .pf-grid {
            font-size: 10px;
          }
        }
      `}</style>

      {/* ✅ Print CSS for PDF export */}
      <style>{`
        @page { size: A4 landscape; margin: 8mm; }

        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          header, nav, footer, aside { display: none !important; }
          .navbar, .topbar, .sidebar, .app-header, .layout-header, .layout-nav { display: none !important; }
          html, body { margin: 0 !important; padding: 0 !important; height: auto !important; }
          #root { min-height: 0 !important; height: auto !important; }

          #pf-page-root > :not(#pf-print-root) { display: none !important; }
          #pf-page-root { padding: 0 !important; margin: 0 !important; }

          #pf-print-root {
            display: block !important;
            position: static !important;
            width: var(--pf-print-width, 100%) !important;
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
          {responseLoading && <div className="text-xs text-gray-500 mt-1">Loading saved response...</div>}
        </div>

        <div className="flex flex-wrap items-center gap-2 no-print">
          <button
            type="button"
            onClick={handleExportPdf}
            className="px-3 py-1.5 text-xs border rounded bg-white hover:bg-gray-50"
          >
            Export PDF
          </button>

          <button onClick={() => navigate(-1)} className="text-xs text-blue-600 underline">
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
            <h2 className="text-sm font-semibold mb-2">Forward (optional)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block mb-1 font-medium">Project</label>
                <input type="text" className="w-full border rounded px-2 py-1 bg-gray-50" value={projectId} readOnly />
              </div>

              <div>
                <label className="block mb-1 font-medium">Forward to user</label>
                <select
                  className="w-full border rounded px-2 py-1 bg-white"
                  value={forwardToUserId}
                  onChange={(e) => setForwardToUserId(e.target.value)}
                  disabled={usersLoading}
                >
                  <option value="">
                    {usersLoading ? "Loading users..." : "Do not forward (only save)"}
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
              </div>

              <div>
                <label className="block mb-1 font-medium">Status with forward</label>
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

          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4 no-print">
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

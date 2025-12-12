import React, { useEffect, useState, useMemo } from "react";
import {
  listFormTemplates,
  createFormTemplate,
  updateFormTemplate,
  createFormTemplateVersion,
  previewFormExcel,
} from "../api";

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: "12px 16px",
    boxSizing: "border-box",
  },
  listWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 600,
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
  },
  btnPrimary: {
    backgroundColor: "#2563eb",
    color: "#fff",
    borderRadius: 999,
    border: "none",
    padding: "8px 16px",
    fontSize: 13,
    cursor: "pointer",
  },
  btnSecondary: {
    backgroundColor: "#e5e7eb",
    color: "#111827",
    borderRadius: 999,
    border: "none",
    padding: "6px 14px",
    fontSize: 12,
    cursor: "pointer",
  },
  btnGhost: {
    background: "none",
    border: "none",
    color: "#4b5563",
    fontSize: 13,
    cursor: "pointer",
    padding: 0,
  },
  listGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 12,
  },
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: "10px 12px",
    backgroundColor: "#fff",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(15,23,42,0.04)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 600,
  },
  badge: {
    fontSize: 11,
    backgroundColor: "#f3f4f6",
    borderRadius: 999,
    padding: "2px 6px",
    color: "#4b5563",
  },
  cardDesc: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  cardMeta: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 6,
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  loading: {
    fontSize: 13,
    color: "#6b7280",
    padding: 16,
  },
  empty: {
    fontSize: 13,
    color: "#6b7280",
    padding: 16,
  },

  // Builder layout
  builderWrapper: {
    display: "flex",
    flexDirection: "column",
    height: "calc(100vh - 80px)",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    overflow: "hidden",
    backgroundColor: "#f3f4f6",
    marginTop: 8,
  },
  builderTopbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 12px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #e5e7eb",
  },
  topLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  formMeta: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  inputTitle: {
    border: "none",
    outline: "none",
    fontSize: 16,
    fontWeight: 500,
    background: "transparent",
  },
  inputCode: {
    fontSize: 12,
    padding: "2px 8px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    width: 200,
  },
  builderMain: {
    display: "flex",
    flex: 1,
    minHeight: 0,
  },
  sidebar: {
    width: 260,
    borderRight: "1px solid #e5e7eb",
    backgroundColor: "#f9fafb",
    padding: 10,
    overflowY: "auto",
  },
  canvas: {
    flex: 1,
    padding: "12px 14px",
    overflowY: "auto",
  },
  canvasInner: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: "16px 18px",
    minHeight: 200,
    boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
  },
  propsPanel: {
    width: 260,
    borderLeft: "1px solid #e5e7eb",
    backgroundColor: "#f9fafb",
    padding: 10,
    overflowY: "auto",
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 6,
  },
  uploadHint: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 4,
  },
  subtitleSmall: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    color: "#6b7280",
    marginTop: 8,
    marginBottom: 4,
  },
  blockList: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  blockItem: {
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    backgroundColor: "#fff",
    padding: "4px 8px",
    fontSize: 12,
    textAlign: "left",
    cursor: "pointer",
  },
  emptyCanvas: {
    textAlign: "center",
    fontSize: 13,
    color: "#6b7280",
    padding: 32,
  },
  sectionCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 8,
  },
  rowWrapper: {
    marginBottom: 10,
    borderRadius: 8,
    border: "1px dashed #e5e7eb",
    padding: 6,
  },
  rowToolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  rowToolbarLeft: {
    fontSize: 11,
    color: "#6b7280",
  },
  rowToolbarRight: {
    display: "flex",
    gap: 4,
  },
  rowToolbarBtn: {
    fontSize: 10,
    padding: "2px 6px",
    borderRadius: 999,
    border: "1px solid #d1d5db",
    backgroundColor: "#f9fafb",
    cursor: "pointer",
  },
  row: {
    display: "flex",
    gap: 8,
  },
  col: {
    display: "flex",
    flexDirection: "column",
  },
  fieldBlock: (selected) => ({
    borderRadius: 8,
    border: `1px solid ${selected ? "#2563eb" : "#e5e7eb"}`,
    backgroundColor: selected ? "#eff6ff" : "#f9fafb",
    padding: "6px 8px",
    cursor: "pointer",
    minHeight: 40,
  }),
  fieldLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  requiredStar: {
    color: "#dc2626",
    marginLeft: 4,
  },
  fieldPreviewInput: {
    width: "100%",
    fontSize: 12,
    padding: "4px 6px",
    borderRadius: 6,
    border: "1px dashed #d1d5db",
    backgroundColor: "#f9fafb",
  },
  staticBlock: (selected) => ({
    borderRadius: 8,
    border: `1px solid ${selected ? "#2563eb" : "#e5e7eb"}`,
    backgroundColor: selected ? "#eff6ff" : "#f9fafb",
    padding: "6px 8px",
    fontSize: 12,
    cursor: "pointer",
    minHeight: 40,
    whiteSpace: "pre-wrap",
  }),
  imageBlock: (selected) => ({
    borderRadius: 8,
    border: `1px solid ${selected ? "#2563eb" : "#e5e7eb"}`,
    backgroundColor: selected ? "#eff6ff" : "#f9fafb",
    padding: "10px 8px",
    fontSize: 11,
    color: "#6b7280",
    textAlign: "center",
    cursor: "pointer",
    minHeight: 40,
  }),
  emptyCell: (selected) => ({
    borderRadius: 8,
    border: `1px dashed ${selected ? "#2563eb" : "#d1d5db"}`,
    backgroundColor: selected ? "#eff6ff" : "#f9fafb",
    padding: "8px 8px",
    fontSize: 11,
    color: "#9ca3af",
    textAlign: "center",
    cursor: "pointer",
    minHeight: 40,
  }),
  propsEmpty: {
    fontSize: 12,
    color: "#6b7280",
  },
  propGroup: {
    display: "flex",
    flexDirection: "column",
    marginBottom: 8,
  },
  propLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  propInput: {
    fontSize: 12,
    padding: "4px 6px",
    borderRadius: 6,
    border: "1px solid #d1d5db",
  },
  propTextarea: {
    fontSize: 12,
    padding: "4px 6px",
    borderRadius: 6,
    border: "1px solid #d1d5db",
    minHeight: 60,
  },
  propsNote: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 4,
  },
};

const FIELD_BLOCKS = [
  { type: "TEXT", label: "Text Field", defaultLabel: "Text Field" },
  { type: "NUMBER", label: "Number Field", defaultLabel: "Number" },
  { type: "DATE", label: "Date", defaultLabel: "Date" },
  { type: "PHONE", label: "Phone", defaultLabel: "Phone" },
  { type: "EMAIL", label: "Email", defaultLabel: "Email" },
  { type: "DROPDOWN", label: "Dropdown", defaultLabel: "Select Option" },
  { type: "SIGNATURE", label: "Signature", defaultLabel: "Signature" },
];

const STATIC_BLOCKS = [
  { type: "STATIC_TEXT", label: "Static Text" },
  { type: "IMAGE_LOGO", label: "Logo / Image" },
];

// --- helper: base schema ---

const makeEmptySchema = (title = "") => ({
  title,
  sections: [
    {
      id: "sec_1",
      title: "",
      rows: [
        {
          id: "row_1",
          columns: [
            {
              width: 12,
              blocks: [],
            },
          ],
        },
      ],
    },
  ],
});

/**
 * Excel-imported schema me auto FIELD blocks inject karo:
 * Pattern:
 *   LEFT cell = label (TEXT_STATIC / TEXT, with text)
 *   CURRENT cell = completely blank
 * => current cell me FIELD block create
 */
// function injectAutoFieldsFromExcel(schema) {
//   console.log("🔁 [injectAutoFieldsFromExcel] CALLED with schema:", schema);

//   if (!schema || !Array.isArray(schema.sections) || !schema.excel_meta) {
//     console.log(
//       "🔁 [injectAutoFieldsFromExcel] -> returning original schema (no sections or no excel_meta)"
//     );
//     return schema;
//   }

//   console.log("📐 [injectAutoFieldsFromExcel] excel_meta:", schema.excel_meta);

//   const next = {
//     ...schema,
//     sections: (schema.sections || []).map((sec, secIdx) => {
//       console.log("➡️ [inject] visiting section", secIdx, sec);
//       return {
//         ...sec,
//         rows: (sec.rows || []).map((row, rowIdx) => ({
//           ...row,
//           columns: (row.columns || []).map((col, cIdx) => {
//             const blocks = Array.isArray(col.blocks) ? [...col.blocks] : [];
//             console.log("   🔎 [inject] cell", {
//               rowIdx,
//               cIdx,
//               excel_row: row.excel_row,
//               excel_col: col.excel_col,
//               existingBlocks: blocks,
//             });
//             return { ...col, blocks };
//           }),
//         })),
//       };
//     }),
//   };

//   next.sections.forEach((sec, secIdx) => {
//     (sec.rows || []).forEach((row, rowIdx) => {
//       const cols = row.columns || [];
//       cols.forEach((col, cIdx) => {
//         const blocks = col.blocks || [];

//         const alreadyField = blocks.some(
//           (b) => (b.block_type || "").toUpperCase() === "FIELD"
//         );
//         if (alreadyField) {
//           console.log(
//             "   ⏭️ [inject] skip cell (already has FIELD block)",
//             { secIdx, rowIdx, cIdx, blocks }
//           );
//           return;
//         }

//         if (blocks.length > 0) {
//           console.log(
//             "   ⏭️ [inject] skip cell (has non-field blocks)",
//             { secIdx, rowIdx, cIdx, blocks }
//           );
//           return;
//         }

//         if (cIdx === 0) return;

//         const prevCol = cols[cIdx - 1];
//         if (!prevCol) return;

//         const prevBlocks = prevCol.blocks || [];
//         const labelBlock = prevBlocks.find((b) => {
//           const bt = (b.block_type || "").toUpperCase();
//           const txt = b.text || b.label;
//           if (!txt) return false;
//           return bt === "TEXT_STATIC" || bt === "TEXT";
//         });

//         if (!labelBlock) return;

//         const rawLabel = labelBlock.text || labelBlock.label || "";
//         const labelText = String(rawLabel).trim();
//         if (!labelText) return;

//         const rowTag = row.excel_row || rowIdx + 1;
//         const colTag = col.excel_col || cIdx + 1;
//         const key = `cell_${rowTag}_${colTag}`;

//         const isLogo = /logo|signature|stamp/i.test(labelText);
//         const fieldType = isLogo ? "FILE" : "TEXT";

//         const newBlock = {
//           block_type: "FIELD",
//           field: {
//             key,
//             label: labelText,
//             type: fieldType,
//             required: false,
//             config: {
//               hideLabel: true,
//             },
//           },
//         };

//         console.log("✅ [inject] ADD FIELD block in cell", {
//           secIdx,
//           rowIdx,
//           cIdx,
//           key,
//           labelText,
//           fieldType,
//           newBlock,
//         });

//         col.blocks.push(newBlock);
//       });
//     });
//   });

//   console.log(
//     "🎯 [injectAutoFieldsFromExcel] FINAL schema (after injection):",
//     next
//   );
//   return next;
// }


/**
 * Excel se aaya hua schema:
 *  - Top area: "Revision No", "Project", "Date" waale rows
 *    (label | empty cell) -> right cell me FIELD bana do.
 *  - Table area: "SN | Description | Photograph | Name of Contractor | ..."
 *    header row detect karo, uske niche jitne blank rows hain
 *    un sab me har column ke liye FIELD bana do.
 */



/**
 * Excel se aaya hua schema:
 *  - Top area: simple "label | value" rows → right cell me FIELD bana do.
 *  - Table area: header row detect karo (SN/Description/Photograph... ya
 *    MOM table: "Sr. No. | Description of Agenda | Brief details | ...")
 *    uske niche jitne rows hain unke HAR column ke liye FIELD bana do
 *    (existing TEXT_STATIC wagaira replace karke).
 */
function injectAutoFieldsFromExcel(schema) {
  console.log("🔁 [injectAutoFieldsFromExcel] CALLED with schema:", schema);

  if (!schema || !Array.isArray(schema.sections) || !schema.excel_meta) {
    console.log("🔁 [inject] no sections/excel_meta, returning original schema");
    return schema;
  }

  // --- helpers ---
  const cloneBlocks = (blocks) => (Array.isArray(blocks) ? [...blocks] : []);

  const isTextBlock = (b) => {
    if (!b) return false;
    const bt = (b.block_type || b.blockType || "").toUpperCase();
    const txt = b.text || b.label;
    return !!txt && (bt === "TEXT_STATIC" || bt === "TEXT");
  };

  const hasFieldBlock = (col) =>
    (col.blocks || []).some(
      (b) => (b.block_type || "").toUpperCase() === "FIELD"
    );

  const firstTextInCell = (col) => {
    const blk = (col.blocks || []).find(isTextBlock);
    if (!blk) return "";
    return String(blk.text || blk.label || "").trim();
  };

  const normalizeLabel = (label) =>
    String(label || "")
      .trim()
      .replace(/[:.]/g, "")
      .replace(/\s+/g, " ")
      .toLowerCase();

  const guessTypeFromLabel = (label) => {
    const l = (label || "").toLowerCase();
    if (/date/.test(l)) return "DATE";
    if (/amount|amt|debit|credit|qty|quantity|no\.?$|sr\.?$|sn$/.test(l))
      return "NUMBER";
    if (/photo|photograph|image|pic/.test(l)) return "FILE";
    if (/signature|logo|stamp/.test(l)) return "FILE";
    return "TEXT";
  };

  const makeFieldBlock = (row, rowIdx, col, colIdx, labelText) => {
    const rowTag = row.excel_row || rowIdx + 1;
    const colTag = col.excel_col || colIdx + 1;
    const key = `cell_${rowTag}_${colTag}`;
    const fType = guessTypeFromLabel(labelText);

    return {
      block_type: "FIELD",
      field: {
        key,
        label: labelText,
        type: fType,
        required: false,
        config: {
          hideLabel: true,
        },
      },
    };
  };

  // --- deep clone sections so we can mutate safely ---
  const next = {
    ...schema,
    sections: (schema.sections || []).map((sec) => ({
      ...sec,
      rows: (sec.rows || []).map((row) => ({
        ...row,
        columns: (row.columns || row.blocks || row.cols || []).map((col) => ({
          ...col,
          blocks: cloneBlocks(col.blocks),
        })),
      })),
    })),
  };

  // ------------------------------------------------------------------
  // PER SECTION PROCESSING
  // ------------------------------------------------------------------
  next.sections.forEach((sec, secIdx) => {
    const rows = sec.rows || [];

    // ---------- 1) SIMPLE "LABEL | VALUE" ROWS (top side) ----------
    rows.forEach((row, rIdx) => {
      const cols = row.columns || [];
      cols.forEach((col, cIdx) => {
        const blocks = col.blocks || [];

        // already has a FIELD? leave it
        if (hasFieldBlock(col)) return;

        // non-empty (text/image) cell? skip for this top-area rule
        if (blocks.length > 0) return;

        // first column me kabhi bhi auto field nahi banaate
        if (cIdx === 0) return;

        const leftCol = cols[cIdx - 1];
        if (!leftCol) return;

        const leftLabel = firstTextInCell(leftCol);
        if (!leftLabel) return;

        const newBlock = makeFieldBlock(row, rIdx, col, cIdx, leftLabel);

        console.log("✅ [inject] HORIZ field", {
          secIdx,
          rIdx,
          cIdx,
          label: leftLabel,
          key: newBlock.field.key,
          type: newBlock.field.type,
        });

        // is cell me sirf yahi FIELD hoga (pure empty box)
        col.blocks = [newBlock];
      });
    });

    // ---------- 2) TABLE HEADER DETECTION ----------
    let headerRowIdx = -1;

    rows.forEach((row, rIdx) => {
      const cols = row.columns || [];
      const labels = cols.map((col) => firstTextInCell(col));
      const normSet = new Set(
        labels.filter(Boolean).map((lbl) => normalizeLabel(lbl))
      );

      // Old pattern: SN | Description | Photograph | Name of Contractor ...
      const isOldTableHeader =
        normSet.has("sn") &&
        normSet.has("description") &&
        Array.from(normSet).some((x) => x.includes("photograph"));

      // MOM pattern: Sr. No. | Description of Agenda | Brief details | ...
      const hasSrNo =
        normSet.has("sr no") ||
        normSet.has("sr no.") ||
        normSet.has("srno") ||
        normSet.has("sr number");
      const isMomHeader =
        hasSrNo && normSet.has("description of agenda") && normSet.has("brief details");

      if (isOldTableHeader || isMomHeader) {
        headerRowIdx = rIdx;
      }
    });

    if (headerRowIdx === -1) {
      console.log(
        "ℹ️ [inject] no table header row found in section",
        secIdx
      );
      return;
    }

    console.log("📊 [inject] table header detected in section", secIdx, {
      headerRowIdx,
    });

    const headerRow = rows[headerRowIdx];
    const headerCols = headerRow.columns || [];
    const headerLabels = headerCols.map((col) => firstTextInCell(col));

    // ---------- 3) FOR ALL ROWS BELOW HEADER: EVERY CELL = FIELD ----------
    for (let rIdx = headerRowIdx + 1; rIdx < rows.length; rIdx++) {
      const row = rows[rIdx];
      const cols = row.columns || [];

      cols.forEach((col, cIdx) => {
        const labelText = headerLabels[cIdx];
        if (!labelText) return; // koi header hi nahi is column ka

        const newBlock = makeFieldBlock(row, rIdx, col, cIdx, labelText);

        console.log("✅ [inject] TABLE field (full-grid)", {
          secIdx,
          rIdx,
          cIdx,
          headerLabel: labelText,
          key: newBlock.field.key,
          type: newBlock.field.type,
        });

        // IMPORTANT: yahan hum purane TEXT_STATIC / sample text ko
        // replace kar rahe hain. Cell me sirf FIELD block rahega.
        col.blocks = [newBlock];
      });
    }
  });

  console.log(
    "🎯 [injectAutoFieldsFromExcel] FINAL schema after injection:",
    next
  );
  return next;
}




// function injectAutoFieldsFromExcel(schema) {
//   console.log("🔁 [injectAutoFieldsFromExcel] CALLED with schema:", schema);

//   if (!schema || !Array.isArray(schema.sections) || !schema.excel_meta) {
//     console.log("🔁 [inject] no sections/excel_meta, returning original schema");
//     return schema;
//   }

//   // --- helpers ---
//   const cloneBlocks = (blocks) => (Array.isArray(blocks) ? [...blocks] : []);

//   const isTextBlock = (b) => {
//     if (!b) return false;
//     const bt = (b.block_type || b.blockType || "").toUpperCase();
//     const txt = b.text || b.label;
//     return !!txt && (bt === "TEXT_STATIC" || bt === "TEXT");
//   };

//   const hasFieldBlock = (col) =>
//     (col.blocks || []).some(
//       (b) => (b.block_type || "").toUpperCase() === "FIELD"
//     );

//   const firstTextInCell = (col) => {
//     const blk = (col.blocks || []).find(isTextBlock);
//     if (!blk) return "";
//     return String(blk.text || blk.label || "").trim();
//   };

//   const guessTypeFromLabel = (label) => {
//     const l = (label || "").toLowerCase();
//     if (/date/.test(l)) return "DATE";
//     if (/amount|amt|debit|credit|qty|quantity|no\.?$|sr\.?$|sn$/.test(l))
//       return "NUMBER";
//     if (/photo|photograph|image|pic/.test(l)) return "FILE";
//     if (/signature|logo|stamp/.test(l)) return "FILE";
//     return "TEXT";
//   };

//   const makeFieldBlock = (row, rowIdx, col, colIdx, labelText) => {
//     const rowTag = row.excel_row || rowIdx + 1;
//     const colTag = col.excel_col || colIdx + 1;
//     const key = `cell_${rowTag}_${colTag}`;
//     const fType = guessTypeFromLabel(labelText);

//     return {
//       block_type: "FIELD",
//       field: {
//         key,
//         label: labelText,
//         type: fType,
//         required: false,
//         config: {
//           hideLabel: true,
//         },
//       },
//     };
//   };

//   // --- deep clone sections/rows/columns so we can mutate safely ---
//   const next = {
//     ...schema,
//     sections: (schema.sections || []).map((sec, sIdx) => ({
//       ...sec,
//       rows: (sec.rows || []).map((row, rIdx) => ({
//         ...row,
//         columns: (row.columns || row.blocks || row.cols || []).map(
//           (col, cIdx) => ({
//             ...col,
//             blocks: cloneBlocks(col.blocks),
//           })
//         ),
//       })),
//     })),
//   };

//   // ------------------------------------------------------------------
//   // PER SECTION PROCESSING
//   // ------------------------------------------------------------------
//   next.sections.forEach((sec, secIdx) => {
//     const rows = sec.rows || [];

//     // ---------- 1) SIMPLE "LABEL | VALUE" ROWS (top area) ----------
//     rows.forEach((row, rIdx) => {
//       const cols = row.columns || [];
//       cols.forEach((col, cIdx) => {
//         const blocks = col.blocks || [];

//         // already has a FIELD? leave it
//         if (hasFieldBlock(col)) return;

//         // non-empty (text/image) cell? skip
//         if (blocks.length > 0) return;

//         // first column me kabhi bhi auto field nahi banaate
//         if (cIdx === 0) return;

//         const leftCol = cols[cIdx - 1];
//         if (!leftCol) return;

//         const leftLabel = firstTextInCell(leftCol);
//         if (!leftLabel) return;

//         const newBlock = makeFieldBlock(row, rIdx, col, cIdx, leftLabel);

//         console.log("✅ [inject] HORIZ field", {
//           secIdx,
//           rIdx,
//           cIdx,
//           label: leftLabel,
//           key: newBlock.field.key,
//           type: newBlock.field.type,
//         });

//         col.blocks.push(newBlock);
//       });
//     });

//     // ---------- 2) TABLE HEADER DETECTION ("SN | Description | ...") ----------
//     let headerRowIdx = -1;

//     rows.forEach((row, rIdx) => {
//       const cols = row.columns || [];
//       const labels = cols.map((col) => firstTextInCell(col));
//       const labelSet = new Set(labels.filter(Boolean));

//       if (
//         labelSet.has("SN") &&
//         labelSet.has("Description") &&
//         labelSet.has("Photograph") &&
//         (labelSet.has("Name of Contractor") ||
//           labelSet.has("Name of\nContractor"))
//       ) {
//         headerRowIdx = rIdx;
//       }
//     });

//     if (headerRowIdx === -1) {
//       console.log(
//         "ℹ️ [inject] no table header row found in section",
//         secIdx
//       );
//       return;
//     }

//     console.log("📊 [inject] table header detected in section", secIdx, {
//       headerRowIdx,
//     });

//     const headerRow = rows[headerRowIdx];
//     const headerCols = headerRow.columns || [];
//     const headerLabels = headerCols.map((col) => firstTextInCell(col));

//     // ---------- 3) FOR ALL ROWS BELOW HEADER, MAKE FIELDS IN EVERY BLANK CELL ----------
//     for (let rIdx = headerRowIdx + 1; rIdx < rows.length; rIdx++) {
//       const row = rows[rIdx];
//       const cols = row.columns || [];

//       cols.forEach((col, cIdx) => {
//         const labelText = headerLabels[cIdx];
//         if (!labelText) return;

//         const blocks = col.blocks || [];

//         // already some field in this cell? skip
//         if (hasFieldBlock(col)) return;

//         // if cell already has text/image, skip (maybe footer)
//         const hasNonFieldBlock = blocks.some((b) => !isTextBlock(b));
//         if (hasNonFieldBlock) return;

//         const newBlock = makeFieldBlock(row, rIdx, col, cIdx, labelText);

//         console.log("✅ [inject] TABLE field", {
//           secIdx,
//           rIdx,
//           cIdx,
//           headerLabel: labelText,
//           key: newBlock.field.key,
//           type: newBlock.field.type,
//         });

//         col.blocks.push(newBlock);
//       });
//     }
//   });

//   console.log(
//     "🎯 [injectAutoFieldsFromExcel] FINAL schema after injection:",
//     next
//   );
//   return next;
// }

// ---------- Builder component ----------

const FormsBuilder = ({ template, onBack, onSaved }) => {
  const isEdit = !!template;
  const [saving, setSaving] = useState(false);
  const [formName, setFormName] = useState(template?.name || "");
  const [formCode, setFormCode] = useState(template?.code || "");
  const [description, setDescription] = useState(template?.description || "");
  const [schema, setSchema] = useState(makeEmptySchema(template?.name || ""));
  const [selectedPos, setSelectedPos] = useState(null); // {sectionIndex,rowIndex,colIndex,blockIndex}

  // ── helper: render correct preview control based on field.type ──
  const renderFieldControl = (field) => {
    const fType = (field?.type || "TEXT").toUpperCase();

    if (fType === "DATE") {
      return <input style={styles.fieldPreviewInput} type="date" />;
    }

    if (fType === "NUMBER") {
      return (
        <input
          style={styles.fieldPreviewInput}
          type="number"
          placeholder="0"
        />
      );
    }

    if (fType === "EMAIL") {
      return (
        <input
          style={styles.fieldPreviewInput}
          type="email"
          placeholder="name@example.com"
        />
      );
    }

    if (fType === "PHONE") {
      return (
        <input
          style={styles.fieldPreviewInput}
          type="tel"
          placeholder="Mobile / Phone"
        />
      );
    }

    if (fType === "DROPDOWN") {
      return (
        <select style={styles.fieldPreviewInput}>
          <option>Sample option 1</option>
          <option>Sample option 2</option>
        </select>
      );
    }

    if (fType === "FILE") {
      return (
        <div
          style={{
            fontSize: 11,
            color: "#6b7280",
            borderRadius: 6,
            border: "1px dashed #d1d5db",
            padding: "6px 8px",
            backgroundColor: "#f9fafb",
          }}
        >
          <div>File upload field (logo / signature / document)</div>
          <div style={{ marginTop: 4, fontSize: 10 }}>
            Preview only – actual upload user side pe hoga.
          </div>
        </div>
      );
    }

    if (fType === "SIGNATURE") {
      return (
        <div
          style={{
            fontSize: 11,
            color: "#6b7280",
            borderRadius: 6,
            border: "1px dashed #d1d5db",
            padding: "10px 8px",
            backgroundColor: "#f9fafb",
          }}
        >
          Signature pad / upload placeholder
        </div>
      );
    }

    // default TEXT
    return (
      <input
        style={styles.fieldPreviewInput}
        type="text"
        placeholder={field?.type || "Text"}
      />
    );
  };

  // load existing schema if editing
  useEffect(() => {
    console.log("⚙️ [Builder] isEdit =", isEdit);
    if (isEdit && template?.versions && template.versions.length > 0) {
      const latest = template.versions[0];
      console.log("📄 [Builder] latest version from API:", latest);
      console.log("📄 [Builder] raw latest.schema:", latest?.schema);

      if (latest.schema && latest.schema.sections) {
        const processed = injectAutoFieldsFromExcel(latest.schema);
        console.log(
          "🧩 [Builder] schema AFTER injectAutoFieldsFromExcel (before setState):",
          processed
        );
        setSchema(processed);
      } else {
        console.log(
          "⚠️ [Builder] latest.schema missing sections, using empty schema"
        );
        setSchema(makeEmptySchema(template.name || ""));
      }
    } else {
      console.log(
        "ℹ️ [Builder] not edit mode or no versions, using empty schema"
      );
      setSchema(makeEmptySchema(template?.name || ""));
    }
  }, [isEdit, template]);

  const selectedInfo = useMemo(() => {
    if (!selectedPos || !schema?.sections) return null;
    const { sectionIndex, rowIndex, colIndex, blockIndex = 0 } = selectedPos;
    const section = schema.sections[sectionIndex];
    if (!section) return null;
    const row = section.rows?.[rowIndex];
    if (!row) return null;
    const col = row.columns?.[colIndex];
    if (!col) return null;
    const block = col.blocks?.[blockIndex] || null;
    return { section, row, col, block, sectionIndex, rowIndex, colIndex, blockIndex };
  }, [selectedPos, schema]);

  const selectedBlock = selectedInfo?.block;
  const selectedColumn = selectedInfo?.col;

  const handleCellClick = (sectionIndex, rowIndex, colIndex) => {
    setSelectedPos({ sectionIndex, rowIndex, colIndex, blockIndex: 0 });
  };

  const ensureSchema = (prev) => {
    if (prev && prev.sections && prev.sections.length > 0) return prev;
    return makeEmptySchema(prev?.title || formName || "");
  };

  // ---- add field / static into selected cell ----

  const handleAddFieldBlock = (blockDef) => {
    setSchema((prev) => {
      const base = ensureSchema(prev);
      const sections = [...base.sections];
      const secIdx = 0;
      const section = { ...sections[secIdx] };
      const rows = section.rows ? [...section.rows] : [];

      if (!rows.length) {
        rows.push({
          id: "row_1",
          columns: [{ width: 12, blocks: [] }],
        });
      }

      let rowIndex = 0;
      let colIndex = 0;

      if (
        selectedPos &&
        selectedPos.sectionIndex === secIdx &&
        rows[selectedPos.rowIndex]
      ) {
        rowIndex = selectedPos.rowIndex;
        const rowTmp = rows[rowIndex];
        if (rowTmp.columns && rowTmp.columns[selectedPos.colIndex]) {
          colIndex = selectedPos.colIndex;
        }
      }

      const row = { ...rows[rowIndex] };
      const cols = row.columns ? [...row.columns] : [{ width: 12, blocks: [] }];

      if (!cols.length) {
        cols.push({ width: 12, blocks: [] });
      }

      if (colIndex >= cols.length) colIndex = 0;

      const col = { ...cols[colIndex] };
      const newBlock = {
        block_type: "FIELD",
        field: {
          key: `${blockDef.type.toLowerCase()}_${Date.now()}`,
          label: blockDef.defaultLabel,
          type: blockDef.type,
          required: false,
        },
      };

      col.blocks = [newBlock];

      cols[colIndex] = col;
      row.columns = cols;
      rows[rowIndex] = row;
      section.rows = rows;
      sections[secIdx] = section;

      return { ...base, sections };
    });
  };

  const handleAddStaticBlock = (blockDef) => {
    setSchema((prev) => {
      const base = ensureSchema(prev);
      const sections = [...base.sections];
      const secIdx = 0;
      const section = { ...sections[secIdx] };
      const rows = section.rows ? [...section.rows] : [];

      if (!rows.length) {
        rows.push({
          id: "row_1",
          columns: [{ width: 12, blocks: [] }],
        });
      }

      let rowIndex = 0;
      let colIndex = 0;

      if (
        selectedPos &&
        selectedPos.sectionIndex === secIdx &&
        rows[selectedPos.rowIndex]
      ) {
        rowIndex = selectedPos.rowIndex;
        const rowTmp = rows[rowIndex];
        if (rowTmp.columns && rowTmp.columns[selectedPos.colIndex]) {
          colIndex = selectedPos.colIndex;
        }
      }

      const row = { ...rows[rowIndex] };
      const cols = row.columns ? [...row.columns] : [{ width: 12, blocks: [] }];

      if (!cols.length) {
        cols.push({ width: 12, blocks: [] });
      }

      if (colIndex >= cols.length) colIndex = 0;

      const col = { ...cols[colIndex] };

      let block;
      if (blockDef.type === "STATIC_TEXT") {
        block = {
          block_type: "TEXT_STATIC",
          text: "Static text",
          style: "BODY",
        };
      } else if (blockDef.type === "IMAGE_LOGO") {
        block = {
          block_type: "IMAGE",
          subtype: "LOGO",
          asset_id: null,
          align: "LEFT",
          max_width: 120,
        };
      }

      col.blocks = [block];
      cols[colIndex] = col;
      row.columns = cols;
      rows[rowIndex] = row;
      section.rows = rows;
      sections[secIdx] = section;

      return { ...base, sections };
    });
  };

  // ---- Excel upload ----

  const handleExcelUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await previewFormExcel(file);
      const importedSchema = res.data?.schema;

      if (!importedSchema || !importedSchema.sections) {
        alert("Excel se valid schema nahin mila.");
        return;
      }

      if (importedSchema.title && !formName) {
        setFormName(importedSchema.title);
      }

      const withFields = injectAutoFieldsFromExcel(importedSchema);

      setSchema(withFields);
      setSelectedPos(null);

      alert(
        "Excel layout + auto text fields import hogaya. Ab cells ko further edit bhi kar sakte ho."
      );
    } catch (err) {
      console.error("Excel import failed", err);
      alert("Excel import fail hua, console check karo.");
    } finally {
      e.target.value = "";
    }
  };

  // ---- row / column operations ----

  const addRowBelow = (sectionIndex, rowIndex) => {
    setSchema((prev) => {
      const base = ensureSchema(prev);
      const sections = [...base.sections];
      const section = { ...sections[sectionIndex] };
      const rows = section.rows ? [...section.rows] : [];
      const newRow = {
        id: `row_${rows.length + 1}`,
        columns: [
          {
            width: 12,
            blocks: [],
          },
        ],
      };
      rows.splice(rowIndex + 1, 0, newRow);
      section.rows = rows;
      sections[sectionIndex] = section;
      return { ...base, sections };
    });
  };

  const deleteRow = (sectionIndex, rowIndex) => {
    setSchema((prev) => {
      const base = ensureSchema(prev);
      const sections = [...base.sections];
      const section = { ...sections[sectionIndex] };
      let rows = section.rows ? [...section.rows] : [];
      if (rows.length <= 1) {
        rows = [
          {
            id: "row_1",
            columns: [{ width: 12, blocks: [] }],
          },
        ];
      } else {
        rows.splice(rowIndex, 1);
      }
      section.rows = rows;
      sections[sectionIndex] = section;
      return { ...base, sections };
    });
    setSelectedPos(null);
  };

  const addColumnToRow = (sectionIndex, rowIndex) => {
    setSchema((prev) => {
      const base = ensureSchema(prev);
      const sections = [...base.sections];
      const section = { ...sections[sectionIndex] };
      const rows = section.rows ? [...section.rows] : [];
      const row = { ...rows[rowIndex] };
      const cols = row.columns ? [...row.columns] : [];

      cols.push({
        width: 4,
        blocks: [],
      });

      row.columns = cols;
      rows[rowIndex] = row;
      section.rows = rows;
      sections[sectionIndex] = section;
      return { ...base, sections };
    });
  };

  const clearSelectedCell = () => {
    if (!selectedInfo) return;
    const { sectionIndex, rowIndex, colIndex } = selectedInfo;
    setSchema((prev) => {
      const base = ensureSchema(prev);
      const sections = [...base.sections];
      const section = { ...sections[sectionIndex] };
      const rows = [...(section.rows || [])];
      const row = { ...rows[rowIndex] };
      const cols = [...(row.columns || [])];
      const col = { ...cols[colIndex] };
      col.blocks = [];
      cols[colIndex] = col;
      row.columns = cols;
      rows[rowIndex] = row;
      section.rows = rows;
      sections[sectionIndex] = section;
      return { ...base, sections };
    });
  };

  // move selected column left/right (pseudo drag-and-drop)
  const moveSelectedColumn = (direction) => {
    if (!selectedInfo) return;
    const { sectionIndex, rowIndex, colIndex } = selectedInfo;

    setSchema((prev) => {
      const base = ensureSchema(prev);
      const sections = [...base.sections];
      const section = { ...sections[sectionIndex] };
      const rows = [...(section.rows || [])];
      const row = { ...rows[rowIndex] };
      const cols = [...(row.columns || [])];

      const from = colIndex;
      const to = direction === "LEFT" ? colIndex - 1 : colIndex + 1;
      if (to < 0 || to >= cols.length) return base;

      const [moved] = cols.splice(from, 1);
      cols.splice(to, 0, moved);

      row.columns = cols;
      rows[rowIndex] = row;
      section.rows = rows;
      sections[sectionIndex] = section;

      return { ...base, sections };
    });

    setSelectedPos((prev) => {
      if (!prev) return prev;
      const delta = direction === "LEFT" ? -1 : 1;
      return { ...prev, colIndex: prev.colIndex + delta };
    });
  };

  const updateSelectedField = (updates) => {
    if (!selectedInfo || !selectedBlock) return;
    const { sectionIndex, rowIndex, colIndex, blockIndex } = selectedInfo;
    setSchema((prev) => {
      const base = ensureSchema(prev);
      const sections = [...base.sections];
      const section = { ...sections[sectionIndex] };
      const rows = [...(section.rows || [])];
      const row = { ...rows[rowIndex] };
      const cols = [...(row.columns || [])];
      const col = { ...cols[colIndex] };
      const blocks = [...(col.blocks || [])];
      const block = { ...blocks[blockIndex] };

      if (block.block_type === "FIELD") {
        block.field = { ...block.field, ...updates };
      } else if (block.block_type === "TEXT_STATIC") {
        Object.assign(block, updates);
      } else if (block.block_type === "IMAGE") {
        Object.assign(block, updates);
      }

      blocks[blockIndex] = block;
      col.blocks = blocks;
      cols[colIndex] = col;
      row.columns = cols;
      rows[rowIndex] = row;
      section.rows = rows;
      sections[sectionIndex] = section;

      return { ...base, sections };
    });
  };

  const updateSelectedColumn = (updates) => {
    if (!selectedInfo) return;
    const { sectionIndex, rowIndex, colIndex } = selectedInfo;
    setSchema((prev) => {
      const base = ensureSchema(prev);
      const sections = [...base.sections];
      const section = { ...sections[sectionIndex] };
      const rows = [...(section.rows || [])];
      const row = { ...rows[rowIndex] };
      const cols = [...(row.columns || [])];
      const col = { ...cols[colIndex] };

      Object.assign(col, updates);

      cols[colIndex] = col;
      row.columns = cols;
      rows[rowIndex] = row;
      section.rows = rows;
      sections[sectionIndex] = section;
      return { ...base, sections };
    });
  };

  // ---- save to backend ----

  const handleSave = async () => {
    if (!formName || !formCode) {
      alert("Form name and code are required");
      return;
    }

    try {
      setSaving(true);

      let templateId = template?.id;

      if (!templateId) {
        const res = await createFormTemplate({
          name: formName,
          code: formCode,
          description,
          is_active: true,
          owner_org_id: null,
        });
        templateId = res.data.id;
      } else {
        await updateFormTemplate(templateId, {
          name: formName,
          description,
          is_active: true,
        });
      }

      await createFormTemplateVersion({
        template: templateId,
        schema: schema,
        title: `${formName} v1`,
        is_published: true,
        is_default_for_new_responses: true,
      });

      alert("Form template saved successfully");
      onSaved();
    } catch (err) {
      console.error("Error saving form:", err);
      alert("Failed to save form template");
    } finally {
      setSaving(false);
    }
  };

  // DEBUG: see template coming from list page
  useEffect(() => {
    console.log("🧠 [Builder] template prop changed:", template);
  }, [template]);

  // DEBUG: watch schema as soon as we set it
  useEffect(() => {
    console.log("🧩 [Builder] current schema state:", schema);
  }, [schema]);

  return (
    <div style={styles.builderWrapper}>
      {/* Topbar */}
      <div style={styles.builderTopbar}>
        <div style={styles.topLeft}>
          <button style={styles.btnGhost} onClick={onBack}>
            ← Back
          </button>
          <div style={styles.formMeta}>
            <input
              style={styles.inputTitle}
              type="text"
              placeholder="Form name (e.g. Safety Committee MOM)"
              value={formName}
              onChange={(e) => {
                setFormName(e.target.value);
                setSchema((prev) => ({ ...prev, title: e.target.value }));
              }}
            />
            <input
              style={styles.inputCode}
              type="text"
              placeholder="Form code (e.g. SAFETY_MOM)"
              value={formCode}
              onChange={(e) => setFormCode(e.target.value.toUpperCase())}
            />
          </div>
        </div>
        <button
          style={{
            ...styles.btnPrimary,
            opacity: saving ? 0.7 : 1,
            cursor: saving ? "default" : "pointer",
          }}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Form"}
        </button>
      </div>

      {/* Main layout */}
      <div style={styles.builderMain}>
        {/* Left: library */}
        <div style={styles.sidebar}>
          <div>
            <div style={styles.sectionHeader}>Fields &amp; Blocks</div>
            <label style={{ ...styles.btnSecondary, display: "inline-block" }}>
              Upload Excel
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleExcelUpload}
                style={{ display: "none" }}
              />
            </label>
            <div style={styles.uploadHint}>
              Excel se layout import hoga (rows/columns). Uske baad cells ko
              field / static / logo me convert kar sakte ho.
            </div>

            <div style={styles.subtitleSmall}>Field blocks</div>
            <div style={styles.blockList}>
              {FIELD_BLOCKS.map((b) => (
                <button
                  key={b.type}
                  style={styles.blockItem}
                  onClick={() => handleAddFieldBlock(b)}
                >
                  {b.label}
                </button>
              ))}
            </div>

            <div style={styles.subtitleSmall}>Static blocks</div>
            <div style={styles.blockList}>
              {STATIC_BLOCKS.map((b) => (
                <button
                  key={b.type}
                  style={styles.blockItem}
                  onClick={() => handleAddStaticBlock(b)}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center: canvas */}
        <div style={styles.canvas}>
          <div style={styles.canvasInner}>
            {!schema.sections || schema.sections.length === 0 ? (
              <div style={styles.emptyCanvas}>
                <div>No layout yet.</div>
                <div>
                  Excel MOM jaisa form banane ke liye left se fields/static add
                  karna start karo.
                </div>
              </div>
            ) : (
              schema.sections.map((sec, sIdx) => {
                const meta = schema.excel_meta || null;
                const hasExcelMeta = !!meta;

                // 👉 Excel-imported layout: use CSS grid + row/col span
                if (hasExcelMeta) {
                  const totalUnits = meta.total_width_units || 1;
                  const colWidths = meta.col_widths || [];
                  const minCol = meta.min_col || 1;

                  const nCols =
                    colWidths.length ||
                    (sec.rows[0]?.columns?.length || 1);

                  const gridTemplateColumns = colWidths.length
                    ? colWidths
                        .map((w) => `${(w / totalUnits) * 100}%`)
                        .join(" ")
                    : `repeat(${nCols}, 1fr)`;

                  const rowHeights = sec.rows.map(
                    (row) => row.height || 20
                  );
                  const gridTemplateRows = rowHeights
                    .map((h) => `${h + 4}px`)
                    .join(" ");

                  return (
                    <div key={sec.id || sIdx} style={styles.sectionCard}>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns,
                          gridTemplateRows,
                          border: "1px solid #e5e7eb",
                          borderRadius: 8,
                          overflow: "hidden",
                        }}
                      >
                        {sec.rows.map((row, rIdx) =>
                          row.columns.map((col, cIdx) => {
                            const merge = col.merge || {};
                            const isMerged = !!merge.is_merged;
                            const isTopLeft =
                              merge.is_top_left !== false;

                            // ❌ non–top-left merged cells ko skip karo
                            if (isMerged && !isTopLeft) {
                              return null;
                            }

                            const rowSpan = merge.row_span || 1;
                            const colSpan = merge.col_span || 1;

                            const hasBlock =
                              col.blocks && col.blocks.length > 0;
                            const block = hasBlock
                              ? col.blocks[0]
                              : null;

                            const isSelected =
                              selectedPos &&
                              selectedPos.sectionIndex === sIdx &&
                              selectedPos.rowIndex === rIdx &&
                              selectedPos.colIndex === cIdx;

                            // Excel col/row → CSS grid line
                            const excelCol = col.excel_col || cIdx + minCol;
                            const startCol = excelCol - minCol + 1;
                            const startRow = rIdx + 1;

                            const positioning = {
                              gridColumnStart: startCol,
                              gridColumnEnd: startCol + colSpan,
                              gridRowStart: startRow,
                              gridRowEnd: startRow + rowSpan,
                            };

                            const handleClick = () =>
                              handleCellClick(sIdx, rIdx, cIdx);

                            // ==== Empty cell (Excel me blank) ====
                            if (!hasBlock) {
                              return (
                                <div
                                  key={`${rIdx}-${cIdx}`}
                                  style={{
                                    ...styles.emptyCell(isSelected),
                                    ...positioning,
                                  }}
                                  onClick={handleClick}
                                >
                                  {/* Excel empty cell */}
                                </div>
                              );
                            }

                            // ==== FIELD block ====
                            if (block.block_type === "FIELD") {
                              return (
                                <div
                                  key={`${rIdx}-${cIdx}`}
                                  style={{
                                    ...styles.fieldBlock(isSelected),
                                    ...positioning,
                                  }}
                                  onClick={handleClick}
                                >
                                  <div style={styles.fieldLabel}>
                                    {block.field.label}
                                    {block.field.required && (
                                      <span style={styles.requiredStar}>
                                        *
                                      </span>
                                    )}
                                  </div>
                                  {renderFieldControl(block.field)}
                                </div>
                              );
                            }

                            // ==== Static text ====
                            if (block.block_type === "TEXT_STATIC") {
                              return (
                                <div
                                  key={`${rIdx}-${cIdx}`}
                                  style={{
                                    ...styles.staticBlock(isSelected),
                                    ...positioning,
                                  }}
                                  onClick={handleClick}
                                >
                                  {block.text}
                                </div>
                              );
                            }

                            // ==== Image / logo ====
                            if (block.block_type === "IMAGE") {
                              return (
                                <div
                                  key={`${rIdx}-${cIdx}`}
                                  style={{
                                    ...styles.imageBlock(isSelected),
                                    ...positioning,
                                  }}
                                  onClick={handleClick}
                                >
                                  Logo / Image placeholder
                                </div>
                              );
                            }

                            return null;
                          })
                        )}
                      </div>
                    </div>
                  );
                }

                // 👉 Normal (non-Excel) templates ke liye purana flex layout
                return (
                  <div key={sec.id || sIdx} style={styles.sectionCard}>
                    {sec.rows.map((row, rIdx) => {
                      const totalUnits =
                        row.columns?.reduce(
                          (sum, c) =>
                            sum + (c.width != null ? c.width : 1),
                          0
                        ) || 1;

                      return (
                        <div
                          key={row.id || rIdx}
                          style={{
                            ...styles.rowWrapper,
                            minHeight: (row.height || 20) + 6,
                          }}
                        >
                          <div style={styles.row}>
                            {row.columns.map((col, cIdx) => {
                              const hasBlock =
                                col.blocks && col.blocks.length > 0;
                              const block = hasBlock
                                ? col.blocks[0]
                                : null;

                              const isSelected =
                                selectedPos &&
                                selectedPos.sectionIndex === sIdx &&
                                selectedPos.rowIndex === rIdx &&
                                selectedPos.colIndex === cIdx;

                              const unit =
                                col.width != null ? col.width : 1;
                              const flexBasis = `${
                                (unit / totalUnits) * 100
                              }%`;

                              if (!hasBlock) {
                                return (
                                  <div
                                    key={cIdx}
                                    style={{
                                      ...styles.col,
                                      flexBasis,
                                    }}
                                  >
                                    <div
                                      style={styles.emptyCell(isSelected)}
                                      onClick={() =>
                                        handleCellClick(
                                          sIdx,
                                          rIdx,
                                          cIdx
                                        )
                                      }
                                    >
                                      Empty cell – select and add
                                      field/static from left
                                    </div>
                                  </div>
                                );
                              }

                              if (block.block_type === "FIELD") {
                                return (
                                  <div
                                    key={cIdx}
                                    style={{
                                      ...styles.col,
                                      flexBasis,
                                    }}
                                  >
                                    <div
                                      style={styles.fieldBlock(isSelected)}
                                      onClick={() =>
                                        handleCellClick(
                                          sIdx,
                                          rIdx,
                                          cIdx
                                        )
                                      }
                                    >
                                      <div style={styles.fieldLabel}>
                                        {block.field.label}
                                        {block.field.required && (
                                          <span
                                            style={styles.requiredStar}
                                          >
                                            *
                                          </span>
                                        )}
                                      </div>
                                      {renderFieldControl(block.field)}
                                    </div>
                                  </div>
                                );
                              }

                              if (block.block_type === "TEXT_STATIC") {
                                return (
                                  <div
                                    key={cIdx}
                                    style={{
                                      ...styles.col,
                                      flexBasis,
                                    }}
                                  >
                                    <div
                                      style={styles.staticBlock(isSelected)}
                                      onClick={() =>
                                        handleCellClick(
                                          sIdx,
                                          rIdx,
                                          cIdx
                                        )
                                      }
                                    >
                                      {block.text}
                                    </div>
                                  </div>
                                );
                              }

                              if (block.block_type === "IMAGE") {
                                return (
                                  <div
                                    key={cIdx}
                                    style={{
                                      ...styles.col,
                                      flexBasis,
                                    }}
                                  >
                                    <div
                                      style={styles.imageBlock(isSelected)}
                                      onClick={() =>
                                        handleCellClick(
                                          sIdx,
                                          rIdx,
                                          cIdx
                                        )
                                      }
                                    >
                                      Logo / Image placeholder
                                    </div>
                                  </div>
                                );
                              }

                              return null;
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: properties */}
        <div style={styles.propsPanel}>
          <div style={styles.sectionHeader}>Properties</div>

          {!selectedInfo && (
            <div style={styles.propsEmpty}>
              Koi cell selected nahi hai. Canvas pe kisi cell / field / text pe
              click karo.
            </div>
          )}

          {/* Column (cell) props */}
          {selectedInfo && (
            <div style={{ marginBottom: 10 }}>
              <div style={styles.propGroup}>
                <label style={styles.propLabel}>Column width (1–12)</label>
                <input
                  type="range"
                  min={1}
                  max={12}
                  value={selectedColumn?.width || 12}
                  onChange={(e) =>
                    updateSelectedColumn({ width: Number(e.target.value) })
                  }
                />
                <div style={styles.propsNote}>
                  Width adjust karke Excel jaisa layout ban sakta hai (narrow /
                  wide cells).
                </div>
              </div>
              <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                <button
                  type="button"
                  style={{
                    ...styles.btnSecondary,
                    fontSize: 11,
                    padding: "4px 8px",
                  }}
                  onClick={() => moveSelectedColumn("LEFT")}
                >
                  ← Move left
                </button>
                <button
                  type="button"
                  style={{
                    ...styles.btnSecondary,
                    fontSize: 11,
                    padding: "4px 8px",
                  }}
                  onClick={() => moveSelectedColumn("RIGHT")}
                >
                  Move right →
                </button>
              </div>
              <button
                type="button"
                style={{
                  ...styles.btnSecondary,
                  fontSize: 11,
                  padding: "4px 8px",
                }}
                onClick={clearSelectedCell}
              >
                Clear cell
              </button>
            </div>
          )}

          {/* Field block props */}
          {selectedBlock && selectedBlock.block_type === "FIELD" && (
            <div>
              <div style={styles.propGroup}>
                <label style={styles.propLabel}>Label</label>
                <input
                  style={styles.propInput}
                  type="text"
                  value={selectedBlock.field.label}
                  onChange={(e) =>
                    updateSelectedField({ label: e.target.value })
                  }
                />
              </div>
              <div style={styles.propGroup}>
                <label style={styles.propLabel}>Key</label>
                <input
                  style={styles.propInput}
                  type="text"
                  value={selectedBlock.field.key}
                  onChange={(e) =>
                    updateSelectedField({ key: e.target.value })
                  }
                />
              </div>
              <div style={styles.propGroup}>
                <label style={styles.propLabel}>Type</label>
                <input
                  style={styles.propInput}
                  type="text"
                  readOnly
                  value={selectedBlock.field.type}
                />
              </div>
              <div style={styles.propGroup}>
                <label style={styles.propLabel}>
                  <input
                    type="checkbox"
                    checked={!!selectedBlock.field.required}
                    onChange={(e) =>
                      updateSelectedField({ required: e.target.checked })
                    }
                    style={{ marginRight: 6 }}
                  />
                  Required
                </label>
              </div>
            </div>
          )}

          {/* Static text props */}
          {selectedBlock && selectedBlock.block_type === "TEXT_STATIC" && (
            <div>
              <div style={styles.propGroup}>
                <label style={styles.propLabel}>Text</label>
                <textarea
                  style={styles.propTextarea}
                  value={selectedBlock.text || ""}
                  onChange={(e) =>
                    updateSelectedField({ text: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          {/* Image/logo props */}
          {selectedBlock && selectedBlock.block_type === "IMAGE" && (
            <div>
              <div style={styles.propGroup}>
                <label style={styles.propLabel}>Align</label>
                <select
                  style={styles.propInput}
                  value={selectedBlock.align || "LEFT"}
                  onChange={(e) =>
                    updateSelectedField({ align: e.target.value })
                  }
                >
                  <option value="LEFT">Left</option>
                  <option value="CENTER">Center</option>
                  <option value="RIGHT">Right</option>
                </select>
              </div>
              <div style={styles.propGroup}>
                <label style={styles.propLabel}>Max width (px)</label>
                <input
                  style={styles.propInput}
                  type="number"
                  value={selectedBlock.max_width || 120}
                  onChange={(e) =>
                    updateSelectedField({
                      max_width: Number(e.target.value || 120),
                    })
                  }
                />
              </div>
              <div style={styles.propsNote}>
                Logo library (FormAsset) baad me link karenge – abhi placeholder
                hai.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------- Main page: list + builder toggle ----------

const FormsEnginePage = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("list"); // "list" | "builder"
  const [activeTemplate, setActiveTemplate] = useState(null);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const res = await listFormTemplates();
      setTemplates(res.data || []);
    } catch (err) {
      console.error("Error fetching templates", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleNewForm = () => {
    setActiveTemplate(null);
    setMode("builder");
  };

  const handleEditTemplate = (tpl) => {
    setActiveTemplate(tpl);
    setMode("builder");
  };

  const handleBuilderBack = () => {
    setMode("list");
    setActiveTemplate(null);
  };

  const handleBuilderSaved = () => {
    setMode("list");
    setActiveTemplate(null);
    loadTemplates();
  };

  return (
    <div style={styles.page}>
      {mode === "list" && (
        <div style={styles.listWrapper}>
          <div style={styles.listHeader}>
            <div style={styles.titleBlock}>
              <div style={styles.title}>Dynamic Forms</div>
              <div style={styles.subtitle}>
                Superadmin Excel/Word/PDF based print-ready forms design kar sakta
                hai, aur projects ko assign kar sakta hai.
              </div>
            </div>
            <button style={styles.btnPrimary} onClick={handleNewForm}>
              + New Form
            </button>
          </div>

          {loading ? (
            <div style={styles.loading}>Loading form templates...</div>
          ) : templates.length === 0 ? (
            <div style={styles.empty}>
              No form templates yet. Click&nbsp;
              <button
                style={{ ...styles.btnSecondary, padding: "4px 10px" }}
                onClick={handleNewForm}
              >
                + New Form
              </button>{" "}
              to create your first one.
            </div>
          ) : (
            <div style={styles.listGrid}>
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  style={styles.card}
                  onClick={() => handleEditTemplate(tpl)}
                >
                  <div style={styles.cardHeader}>
                    <div style={styles.cardTitle}>{tpl.name}</div>
                    <span style={styles.badge}>{tpl.code}</span>
                  </div>
                  {tpl.description && (
                    <div style={styles.cardDesc}>{tpl.description}</div>
                  )}
                  <div style={styles.cardMeta}>
                    <span>Org #{tpl.owner_org_id || "-"}</span>
                    <span>Current v{tpl.current_version}</span>
                    <span>ID #{tpl.id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {mode === "builder" && (
        <FormsBuilder
          template={activeTemplate}
          onBack={handleBuilderBack}
          onSaved={handleBuilderSaved}
        />
      )}
    </div>
  );
};

export default FormsEnginePage;

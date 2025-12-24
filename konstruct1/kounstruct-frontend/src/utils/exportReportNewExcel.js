// src/utils/exportReportNewExcel.js
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const sanitizeSheetName = (name) => {
  const n = String(name || "Report")
    .replace(/[:\\/?*\[\]]/g, " ")
    .trim();
  return (n.slice(0, 31) || "Report").trim();
};

function buildReportSheet({
  leftTitle = "",
  rightTitle = "",
  hotoRows = [],
  snaggingRows = [],
  notes = {},
} = {}) {
  // 24 columns => A..X
  const makeRow24 = () => new Array(24).fill("");

  // --- Row 1 titles ---
  const r1 = makeRow24();
  r1[0] = leftTitle;  // A1
  r1[11] = rightTitle; // L1

  // --- Row 2 headers (match template) ---
  const r2 = makeRow24();

  // Left block (A-J) with blank H column
  r2[0] = "Tower";
  r2[1] = "Unit No";
  r2[2] = "Checklist";
  r2[3] = "Stage";
  r2[4] = "Total Snag Points";
  r2[5] = "Completed";
  r2[6] = "Pending";
  // r2[7] blank
  r2[8] = "Status";
  r2[9] = "Pending From";

  // Right block (L-X)
  r2[11] = "Tower";
  r2[12] = "Unit No";
  r2[13] = "Checklist";
  r2[14] = "Stage";
  r2[15] = "Total Checkpoints";
  r2[16] = "Completed";
  r2[17] = "Pending";
  r2[18] = "Total Snag Points";
  r2[19] = "Completed";
  r2[20] = "Pending";
  r2[21] = "No of Attempt";
  r2[22] = "Status";
  r2[23] = "Pending From";

  const aoa = [r1, r2];

  // --- Data rows ---
  const n = Math.max(hotoRows.length, snaggingRows.length);
  for (let i = 0; i < n; i++) {
    const row = makeRow24();

    const left = Array.isArray(hotoRows[i]) ? hotoRows[i] : null; // 10 cols
    const right = Array.isArray(snaggingRows[i]) ? snaggingRows[i] : null; // 13 cols

    if (left) {
      for (let c = 0; c < Math.min(10, left.length); c++) row[c] = left[c] ?? "";
    }
    // K (index 10) remains blank separator
    if (right) {
      for (let c = 0; c < Math.min(13, right.length); c++) row[11 + c] = right[c] ?? "";
    }

    aoa.push(row);
  }

  // --- Notes row (optional) ---
  const leftNote = notes?.leftNote || "";
  const rightNote = notes?.rightNote || "";
  if (leftNote || rightNote) {
    const noteRow = makeRow24();
    if (leftNote) noteRow[0] = leftNote;
    if (rightNote) noteRow[11] = rightNote;
    aoa.push(noteRow);
  }

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Merges (same as your template)
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },   // A1:J1
    { s: { r: 0, c: 11 }, e: { r: 0, c: 23 } }, // L1:X1
  ];

  if (leftNote || rightNote) {
    const lastRowIdx = aoa.length - 1;
    if (leftNote) ws["!merges"].push({ s: { r: lastRowIdx, c: 0 }, e: { r: lastRowIdx, c: 9 } });
    if (rightNote) ws["!merges"].push({ s: { r: lastRowIdx, c: 11 }, e: { r: lastRowIdx, c: 23 } });
  }

  // Column widths
  ws["!cols"] = [
    { wch: 10 }, { wch: 10 }, { wch: 30 }, { wch: 16 }, { wch: 18 },
    { wch: 12 }, { wch: 12 }, { wch: 3 },  { wch: 12 }, { wch: 14 },
    { wch: 3 },
    { wch: 10 }, { wch: 10 }, { wch: 30 }, { wch: 16 }, { wch: 18 },
    { wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 12 }, { wch: 12 },
    { wch: 14 }, { wch: 12 }, { wch: 14 },
  ];

  return ws;
}

/**
 * ✅ NEW:
 * sections: [{ sheetName, leftTitle, rightTitle, hotoRows, snaggingRows, notes }]
 *
 * OLD STILL WORKS:
 * hotoRows/snaggingRows + leftTitle/rightTitle -> single sheet "Report"
 */
export function exportReportNewExcel({
  sections = null,

  // old params (single sheet)
  hotoRows = [],
  snaggingRows = [],
  leftTitle = "Left",
  rightTitle = "Right",

  fileName = "Report New.xlsx",
  notes = {},
  items = null, // optional: raw items export
} = {}) {
  const wb = XLSX.utils.book_new();

  if (Array.isArray(sections) && sections.length) {
    sections.forEach((sec, idx) => {
      const ws = buildReportSheet({
        leftTitle: sec?.leftTitle ?? sec?.sheetName ?? `Purpose ${idx + 1}`,
        rightTitle: sec?.rightTitle ?? sec?.sheetName ?? `Purpose ${idx + 1}`,
        hotoRows: sec?.hotoRows || [],
        snaggingRows: sec?.snaggingRows || [],
        notes: sec?.notes || {},
      });

      XLSX.utils.book_append_sheet(
        wb,
        ws,
        sanitizeSheetName(sec?.sheetName || `Purpose ${idx + 1}`)
      );
    });
  } else {
    const ws = buildReportSheet({
      leftTitle,
      rightTitle,
      hotoRows,
      snaggingRows,
      notes,
    });
    XLSX.utils.book_append_sheet(wb, ws, "Report");
  }

  // Raw Items sheet (optional)
  if (Array.isArray(items) && items.length) {
    const rows = items.map((it) => {
      const loc = it.location || {};
      const cl = it.checklist || {};
      const latest = it.latest_submission || {};
      const roles = it.roles || {};
      return {
        purpose:
          cl.purpose_name ||
          cl.purpose_label ||
          (typeof cl.purpose === "string" ? cl.purpose : cl.purpose?.name || cl.purpose?.title || "") ||
          it.purpose ||
          "",

        building_id: loc.building_id ?? "",
        building_name: loc.building_name ?? loc.tower_name ?? "",
        flat_id: loc.flat_id ?? "",
        room_category: loc.room_category ?? loc.room_type ?? "",
        checklist_id: cl.id ?? "",
        checklist_title: cl.title ?? cl.name ?? "",
        stage_id: cl.stage_id ?? "",
        item_id: it.item_id ?? "",
        item_title: it.item_title ?? "",
        item_status: it.item_status ?? "",
        attempts: latest.attempts ?? "",
        maker_user_id: roles.maker?.user_id ?? "",
        supervisor_user_id: roles.supervisor?.user_id ?? "",
        checker_user_id: roles.checker?.user_id ?? "",
        checked_at: latest.checked_at ?? "",
        supervised_at: latest.supervised_at ?? "",
        maker_at: latest.maker_at ?? "",
      };
    });

    const ws2 = XLSX.utils.json_to_sheet(rows);
    ws2["!cols"] = Object.keys(rows[0] || {}).map((k) => ({ wch: Math.max(14, k.length + 2) }));
    XLSX.utils.book_append_sheet(wb, ws2, "Raw Items");
  }

  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([out], { type: "application/octet-stream" }), fileName);
}

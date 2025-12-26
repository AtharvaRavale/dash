// // src/utils/exportReportNewExcel.js
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";

// const sanitizeSheetName = (name) => {
//   const n = String(name || "Report")
//     .replace(/[:\\/?*\[\]]/g, " ")
//     .trim();
//   return (n.slice(0, 31) || "Report").trim();
// };
// // ✅ Keep same flat data together (Tower + UnitNo + Checklist + Stage)
// const sortRowsByTowerUnit = (rows = []) => {
//   const unitNum = (v) => {
//     const n = Number(String(v ?? "").replace(/[^\d]/g, ""));
//     return Number.isNaN(n) ? 0 : n;
//   };

//   rows.sort((a, b) => {
//     const t = String(a?.[0] ?? "").localeCompare(String(b?.[0] ?? ""));
//     if (t) return t;

//     const ua = unitNum(a?.[1]);
//     const ub = unitNum(b?.[1]);
//     if (ua !== ub) return ua - ub;

//     const c = String(a?.[2] ?? "").localeCompare(String(b?.[2] ?? ""));
//     if (c) return c;

//     return String(a?.[3] ?? "").localeCompare(String(b?.[3] ?? ""));
//   });

//   return rows;
// };

// function buildReportSheet({
//   leftTitle = "",
//   rightTitle = "",
//   hotoRows = [],
//   snaggingRows = [],
//   notes = {},
//   rightOnly = false, // ✅ NEW

// } = {}) {
//       // ✅ RIGHT ONLY sheet (16 columns A..P) - same as your current RIGHT block (L..AA)
//   // ✅ RIGHT ONLY sheet (20 columns A..T) - NEW FLOW
// if (rightOnly) {
//   const makeRow20 = () => new Array(20).fill("");

//   // Row 1 title
//   const r1 = makeRow20();
//   r1[0] = rightTitle || leftTitle || "Report";

//   // Row 2 headers
//   const r2 = makeRow20();
//   r2[0] = "Tower";
//   r2[1] = "Unit No";
//   r2[2] = "Checklist";
//   r2[3] = "Stage";

//   // ✅ Checkpoints (Initializer -> Checker initial check)
//   r2[4] = "Total Checkpoints";
//   r2[5] = "Checker Check Completed";
//   r2[6] = "Checker Check Pending";
//   r2[7] = "Checker Check %";

//   // ✅ Snag bucket (raised by checker)
//   r2[8] = "Total Snag Points";
//   r2[9] = "Snag Rejected by Checker";

//   // ✅ Maker work
//   r2[10] = "Maker Work Completed";
//   r2[11] = "Maker Work Pending";
//   r2[12] = "Maker % (Open/Close)";

//   // ✅ Checker re-check
//   r2[13] = "Checker Work Completed";
//   r2[14] = "Checker Work Pending";
//   r2[15] = "Checker % (Open/Close)";

//   // ✅ Final
//   r2[16] = "No of Attempt";
//   r2[17] = "Status";
//   r2[18] = "Pending From";
//   r2[19] = "Overall %";

//   const aoa = [r1, r2];

//   // Data rows
//   for (let i = 0; i < (snaggingRows?.length || 0); i++) {
//     const row = makeRow20();
//     const right = Array.isArray(snaggingRows[i]) ? snaggingRows[i] : null;

//     if (right) {
//       for (let c = 0; c < Math.min(20, right.length); c++) row[c] = right[c] ?? "";
//     }
//     aoa.push(row);
//   }

//   // Notes (optional)
//   const rightNote = notes?.rightNote || "";
//   if (rightNote) {
//     const noteRow = makeRow20();
//     noteRow[0] = rightNote;
//     aoa.push(noteRow);
//   }

//   const ws = XLSX.utils.aoa_to_sheet(aoa);

//   // Merge title A1:T1
//   ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 19 } }];

//   // Merge note row if note exists
//   if (rightNote) {
//     const lastRowIdx = aoa.length - 1;
//     ws["!merges"].push({ s: { r: lastRowIdx, c: 0 }, e: { r: lastRowIdx, c: 19 } });
//   }

//   // Column widths (20)
//   ws["!cols"] = [
//     { wch: 12 }, // Tower
//     { wch: 10 }, // Unit
//     { wch: 30 }, // Checklist
//     { wch: 16 }, // Stage

//     { wch: 18 }, // Total CP
//     { wch: 22 }, // Checker Check Completed
//     { wch: 20 }, // Checker Check Pending
//     { wch: 16 }, // Checker Check %

//     { wch: 18 }, // Total Snag
//     { wch: 22 }, // Snag Rejected by Checker

//     { wch: 20 }, // Maker Completed
//     { wch: 18 }, // Maker Pending
//     { wch: 18 }, // Maker %

//     { wch: 20 }, // Checker Completed
//     { wch: 20 }, // Checker Pending
//     { wch: 20 }, // Checker %

//     { wch: 14 }, // Attempts
//     { wch: 18 }, // Status
//     { wch: 16 }, // Pending From
//     { wch: 12 }, // Overall %
//   ];

//   return ws;
// }

//   // ✅ NOW 27 columns => A..AA
//   const makeRow27 = () => new Array(27).fill("");

//   // --- Row 1 titles ---
//   const r1 = makeRow27();
//   r1[0] = leftTitle; // A1
//   r1[11] = rightTitle; // L1

//   // --- Row 2 headers ---
//   const r2 = makeRow27();

//   // Left block (A-J) with blank H column
//   r2[0] = "Tower";
//   r2[1] = "Unit No";
//   r2[2] = "Checklist";
//   r2[3] = "Stage";
//   r2[4] = "Total Snag Points";
//   r2[5] = "Completed";
//   r2[6] = "Pending";
//   // r2[7] blank (kept)
//   r2[8] = "Status";
//   r2[9] = "Pending From";
//   // r2[10] blank separator (K)

//   // Right block (L-AA) ✅ adds CP% (Ready), Snag%, Overall%
//   r2[11] = "Tower";
//   r2[12] = "Unit No";
//   r2[13] = "Checklist";
//   r2[14] = "Stage";

//   r2[15] = "Total Checkpoints";
//   r2[16] = "Completed";
//   r2[17] = "Pending";
//   r2[18] = "CP % (Ready)"; // ✅ NEW

//   r2[19] = "Total Snag Points";
//   r2[20] = "Completed";
//   r2[21] = "Pending";
//   r2[22] = "Snag %"; // ✅ NEW

//   r2[23] = "No of Attempt";
//   r2[24] = "Status";
//   r2[25] = "Pending From";
//   r2[26] = "Overall %"; // ✅ NEW (overall = (CP+Snag) completion %)

//   const aoa = [r1, r2];

//   // --- Data rows ---
//   const n = Math.max(hotoRows.length, snaggingRows.length);
//   for (let i = 0; i < n; i++) {
//     const row = makeRow27();

//     const left = Array.isArray(hotoRows[i]) ? hotoRows[i] : null; // 10 cols
//     const right = Array.isArray(snaggingRows[i]) ? snaggingRows[i] : null; // ✅ 16 cols now

//     if (left) {
//       for (let c = 0; c < Math.min(10, left.length); c++) row[c] = left[c] ?? "";
//     }

//     // K (index 10) stays blank separator

//     if (right) {
//       for (let c = 0; c < Math.min(16, right.length); c++) row[11 + c] = right[c] ?? "";
//     }

//     aoa.push(row);
//   }

//   // --- Notes row (optional) ---
//   const leftNote = notes?.leftNote || "";
//   const rightNote = notes?.rightNote || "";
//   if (leftNote || rightNote) {
//     const noteRow = makeRow27();
//     if (leftNote) noteRow[0] = leftNote;
//     if (rightNote) noteRow[11] = rightNote;
//     aoa.push(noteRow);
//   }

//   const ws = XLSX.utils.aoa_to_sheet(aoa);

//   // ✅ Merges updated for 27 cols (Right: L..AA)
//   ws["!merges"] = [
//     { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }, // A1:J1
//     { s: { r: 0, c: 11 }, e: { r: 0, c: 26 } }, // L1:AA1 ✅
//   ];

//   if (leftNote || rightNote) {
//     const lastRowIdx = aoa.length - 1;
//     if (leftNote) ws["!merges"].push({ s: { r: lastRowIdx, c: 0 }, e: { r: lastRowIdx, c: 9 } });
//     if (rightNote) ws["!merges"].push({ s: { r: lastRowIdx, c: 11 }, e: { r: lastRowIdx, c: 26 } });
//   }

//   // ✅ Column widths (27 entries)
//   ws["!cols"] = [
//     // A..K
//     { wch: 10 }, // A Tower
//     { wch: 10 }, // B Unit
//     { wch: 30 }, // C Checklist
//     { wch: 16 }, // D Stage
//     { wch: 18 }, // E Total Snag
//     { wch: 12 }, // F Completed
//     { wch: 12 }, // G Pending
//     { wch: 3 },  // H blank
//     { wch: 12 }, // I Status
//     { wch: 14 }, // J Pending From
//     { wch: 3 },  // K blank

//     // L..AA
//     { wch: 10 }, // L Tower
//     { wch: 10 }, // M Unit
//     { wch: 30 }, // N Checklist
//     { wch: 16 }, // O Stage
//     { wch: 18 }, // P Total CP
//     { wch: 12 }, // Q CP Completed
//     { wch: 12 }, // R CP Pending
//     { wch: 12 }, // S CP % (Ready)
//     { wch: 18 }, // T Total Snag
//     { wch: 12 }, // U Snag Completed
//     { wch: 12 }, // V Snag Pending
//     { wch: 12 }, // W Snag %
//     { wch: 14 }, // X Attempts
//     { wch: 12 }, // Y Status
//     { wch: 14 }, // Z Pending From
//     { wch: 12 }, // AA Overall %
//   ];

//   return ws;
// }

// // ✅ Add buildingNameMap support for Raw Items (building_id -> building_name)
// const resolveBuildingName = (buildingNameMap, buildingId, loc = {}) => {
//   const direct = loc.building_name || loc.tower_name || "";
//   if (direct) return direct;

//   if (!buildingId) return "";
//   const key = String(buildingId);

//   if (buildingNameMap && typeof buildingNameMap.get === "function") {
//     return buildingNameMap.get(key) || "";
//   }
//   if (buildingNameMap && typeof buildingNameMap === "object") {
//     return buildingNameMap[key] || "";
//   }
//   return "";
// };

// /**
//  * ✅ NEW:
//  * sections: [{ sheetName, leftTitle, rightTitle, hotoRows, snaggingRows, notes }]
//  *
//  * You can also pass:
//  * buildingNameMap -> for Raw Items sheet building_name column
//  */
// export function exportReportNewExcel({
//   sections = null,

//   // old params (single sheet)
//   hotoRows = [],
//   snaggingRows = [],
//   leftTitle = "Left",
//   rightTitle = "Right",

//   fileName = "Report New.xlsx",
//   notes = {},
//   items = null, // optional raw items export
//   buildingNameMap = null, // ✅ NEW
// } = {}) {
//   const wb = XLSX.utils.book_new();

//   if (Array.isArray(sections) && sections.length) {
//     sections.forEach((sec, idx) => {
//       const ws = buildReportSheet({
//         leftTitle: sec?.leftTitle ?? sec?.sheetName ?? `Purpose ${idx + 1}`,
//         rightTitle: sec?.rightTitle ?? sec?.sheetName ?? `Purpose ${idx + 1}`,
//         hotoRows: sec?.hotoRows || [],
//         snaggingRows: sec?.snaggingRows || [],
//         notes: sec?.notes || {},
//         rightOnly: !!sec?.rightOnly, // ✅ ADD THIS

//       });

//       XLSX.utils.book_append_sheet(
//         wb,
//         ws,
//         sanitizeSheetName(sec?.sheetName || `Purpose ${idx + 1}`)
//       );
//     });
//   } else {
//     const ws = buildReportSheet({ leftTitle, rightTitle, hotoRows, snaggingRows, notes });
//     XLSX.utils.book_append_sheet(wb, ws, "Report");
//   }

//   // Raw Items sheet (optional)
//   if (Array.isArray(items) && items.length) {
//     const rows = items.map((it) => {
//       const loc = it.location || {};
//       const cl = it.checklist || {};
//       const latest = it.latest_submission || {};
//       const roles = it.roles || {};

//       return {
//         purpose:
//           cl.purpose_name ||
//           cl.purpose_label ||
//           (typeof cl.purpose === "string"
//             ? cl.purpose
//             : cl.purpose?.name || cl.purpose?.title || "") ||
//           it.purpose ||
//           "",

//         building_id: loc.building_id ?? "",
//         building_name: resolveBuildingName(buildingNameMap, loc.building_id, loc), // ✅ building name
//         flat_id: loc.flat_id ?? "",
//         room_category: loc.room_category ?? loc.room_type ?? "",
//         checklist_id: cl.id ?? "",
//         checklist_title: cl.title ?? cl.name ?? "",
//         stage_id: cl.stage_id ?? "",
//         item_id: it.item_id ?? "",
//         item_title: it.item_title ?? "",
//         item_status: it.item_status ?? "",
//         attempts: latest.attempts ?? "",
//         maker_user_id: roles.maker?.user_id ?? "",
//         supervisor_user_id: roles.supervisor?.user_id ?? "",
//         checker_user_id: roles.checker?.user_id ?? "",
//         checked_at: latest.checked_at ?? "",
//         supervised_at: latest.supervised_at ?? "",
//         maker_at: latest.maker_at ?? "",
//       };
//     });

//     const ws2 = XLSX.utils.json_to_sheet(rows);
//     ws2["!cols"] = Object.keys(rows[0] || {}).map((k) => ({ wch: Math.max(14, k.length + 2) }));
//     XLSX.utils.book_append_sheet(wb, ws2, "Raw Items");
//   }

//   const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
//   saveAs(new Blob([out], { type: "application/octet-stream" }), fileName);
// }


// // src/utils/exportReportNewExcel.js
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";

// /* ---------------- helpers ---------------- */
// const sanitizeSheetName = (name) => {
//   const n = String(name || "Report")
//     .replace(/[:\\/?*\[\]]/g, " ")
//     .trim();
//   return (n.slice(0, 31) || "Report").trim();
// };

// const uniqueSheetName = (baseName, usedSet) => {
//   const base = sanitizeSheetName(baseName);
//   if (!usedSet.has(base)) {
//     usedSet.add(base);
//     return base;
//   }
//   for (let i = 2; i < 1000; i++) {
//     const candidate = sanitizeSheetName(`${base.slice(0, 28)} ${i}`);
//     if (!usedSet.has(candidate)) {
//       usedSet.add(candidate);
//       return candidate;
//     }
//   }
//   // worst case fallback
//   const fallback = sanitizeSheetName(`${base.slice(0, 25)} ${Date.now() % 10000}`);
//   usedSet.add(fallback);
//   return fallback;
// };

// // ✅ Add buildingNameMap support for Raw Items (building_id -> building_name)
// const resolveBuildingName = (buildingNameMap, buildingId, loc = {}) => {
//   const direct = loc.building_name || loc.tower_name || "";
//   if (direct) return String(direct);

//   if (!buildingId) return "";
//   const key = String(buildingId);

//   if (buildingNameMap && typeof buildingNameMap.get === "function") {
//     return buildingNameMap.get(key) || "";
//   }
//   if (buildingNameMap && typeof buildingNameMap === "object") {
//     return buildingNameMap[key] || "";
//   }
//   return "";
// };

// /**
//  * ✅ buildReportSheet
//  * rightOnly=true  -> 20 columns A..T (your NEW snagging flow)
//  * rightOnly=false -> LEFT(A..J) + blank(K) + RIGHT(L..AE) (right is 20 cols)
//  */
// function buildReportSheet({
//   leftTitle = "",
//   rightTitle = "",
//   hotoRows = [],
//   snaggingRows = [],
//   notes = {},
//   rightOnly = false,
// } = {}) {
//   /* ---------------- RIGHT ONLY (A..T = 20 cols) ---------------- */
//   if (rightOnly) {
//     const makeRow20 = () => new Array(20).fill("");

//     // Row 1 title
//     const r1 = makeRow20();
//     r1[0] = rightTitle || leftTitle || "Report";

//     // Row 2 headers (20)
//     const r2 = makeRow20();
//     r2[0] = "Tower";
//     r2[1] = "Unit No";
//     r2[2] = "Checklist";
//     r2[3] = "Stage";

//     r2[4] = "Total Checkpoints";
//     r2[5] = "Checker Check Completed";
//     r2[6] = "Checker Check Pending";
//     r2[7] = "Checker Check %";

//     r2[8] = "Total Snag Points";
//     r2[9] = "Snag Rejected by Checker";

//     r2[10] = "Maker Work Completed";
//     r2[11] = "Maker Work Pending";
//     r2[12] = "Maker % (Open/Close)";

//     r2[13] = "Checker Work Completed";
//     r2[14] = "Checker Work Pending";
//     r2[15] = "Checker % (Open/Close)";

//     r2[16] = "No of Attempt";
//     r2[17] = "Status";
//     r2[18] = "Pending From";
//     r2[19] = "Overall %";

//     const aoa = [r1, r2];

//     // Data rows
//     for (let i = 0; i < (snaggingRows?.length || 0); i++) {
//       const row = makeRow20();
//       const right = Array.isArray(snaggingRows[i]) ? snaggingRows[i] : null;

//       if (right) {
//         for (let c = 0; c < Math.min(20, right.length); c++) row[c] = right[c] ?? "";
//       }
//       aoa.push(row);
//     }

//     // Notes row (optional)
//     const rightNote = notes?.rightNote || "";
//     if (rightNote) {
//       const noteRow = makeRow20();
//       noteRow[0] = rightNote;
//       aoa.push(noteRow);
//     }

//     const ws = XLSX.utils.aoa_to_sheet(aoa);

//     // Merge title A1:T1
//     ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 19 } }];

//     // Merge note row if note exists
//     if (rightNote) {
//       const lastRowIdx = aoa.length - 1;
//       ws["!merges"].push({ s: { r: lastRowIdx, c: 0 }, e: { r: lastRowIdx, c: 19 } });
//     }

//     ws["!cols"] = [
//       { wch: 14 }, // Tower
//       { wch: 10 }, // Unit
//       { wch: 34 }, // Checklist
//       { wch: 18 }, // Stage

//       { wch: 18 }, // Total CP
//       { wch: 24 }, // Checker Completed
//       { wch: 22 }, // Checker Pending
//       { wch: 16 }, // Checker %

//       { wch: 18 }, // Total Snag
//       { wch: 26 }, // Rejected by Checker

//       { wch: 22 }, // Maker Done
//       { wch: 20 }, // Maker Pending
//       { wch: 18 }, // Maker %

//       { wch: 22 }, // Checker Done
//       { wch: 22 }, // Checker Pending
//       { wch: 20 }, // Checker %

//       { wch: 14 }, // Attempts
//       { wch: 18 }, // Status
//       { wch: 16 }, // Pending From
//       { wch: 12 }, // Overall %
//     ];

//     return ws;
//   }

//   /* ---------------- LEFT + RIGHT (31 cols A..AE) ---------------- */
//   const makeRow31 = () => new Array(31).fill("");

//   // Row 1 titles
//   const r1 = makeRow31();
//   r1[0] = leftTitle || "Left";
//   r1[11] = rightTitle || "Right";

//   // Row 2 headers
//   const r2 = makeRow31();

//   // LEFT (A..J) -> matches your hotoRows (10 cols; includes blank at index 7)
//   r2[0] = "Tower";
//   r2[1] = "Unit No";
//   r2[2] = "Checklist";
//   r2[3] = "Stage";
//   r2[4] = "Total Snag Points";
//   r2[5] = "Completed";
//   r2[6] = "Pending";
//   r2[7] = ""; // keep blank
//   r2[8] = "Status";
//   r2[9] = "Pending From";

//   // K (index 10) blank separator

//   // RIGHT (L..AE = 20 cols)
//   r2[11] = "Tower";
//   r2[12] = "Unit No";
//   r2[13] = "Checklist";
//   r2[14] = "Stage";

//   r2[15] = "Total Checkpoints";
//   r2[16] = "Checker Check Completed";
//   r2[17] = "Checker Check Pending";
//   r2[18] = "Checker Check %";

//   r2[19] = "Total Snag Points";
//   r2[20] = "Snag Rejected by Checker";

//   r2[21] = "Maker Work Completed";
//   r2[22] = "Maker Work Pending";
//   r2[23] = "Maker % (Open/Close)";

//   r2[24] = "Checker Work Completed";
//   r2[25] = "Checker Work Pending";
//   r2[26] = "Checker % (Open/Close)";

//   r2[27] = "No of Attempt";
//   r2[28] = "Status";
//   r2[29] = "Pending From";
//   r2[30] = "Overall %";

//   const aoa = [r1, r2];

//   // Data rows
//   const n = Math.max(hotoRows?.length || 0, snaggingRows?.length || 0);
//   for (let i = 0; i < n; i++) {
//     const row = makeRow31();

//     const left = Array.isArray(hotoRows?.[i]) ? hotoRows[i] : null; // 10 cols
//     const right = Array.isArray(snaggingRows?.[i]) ? snaggingRows[i] : null; // 20 cols

//     if (left) {
//       for (let c = 0; c < Math.min(10, left.length); c++) row[c] = left[c] ?? "";
//     }

//     // K stays blank

//     if (right) {
//       for (let c = 0; c < Math.min(20, right.length); c++) row[11 + c] = right[c] ?? "";
//     }

//     aoa.push(row);
//   }

//   // Notes row (optional)
//   const leftNote = notes?.leftNote || "";
//   const rightNote = notes?.rightNote || "";
//   if (leftNote || rightNote) {
//     const noteRow = makeRow31();
//     if (leftNote) noteRow[0] = leftNote;
//     if (rightNote) noteRow[11] = rightNote;
//     aoa.push(noteRow);
//   }

//   const ws = XLSX.utils.aoa_to_sheet(aoa);

//   // Merges:
//   // Left title: A1:J1
//   // Right title: L1:AE1  (11..30)
//   ws["!merges"] = [
//     { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
//     { s: { r: 0, c: 11 }, e: { r: 0, c: 30 } },
//   ];

//   if (leftNote || rightNote) {
//     const lastRowIdx = aoa.length - 1;
//     if (leftNote) ws["!merges"].push({ s: { r: lastRowIdx, c: 0 }, e: { r: lastRowIdx, c: 9 } });
//     if (rightNote) ws["!merges"].push({ s: { r: lastRowIdx, c: 11 }, e: { r: lastRowIdx, c: 30 } });
//   }

//   // Column widths (31)
//   ws["!cols"] = [
//     // A..J (Left)
//     { wch: 12 }, // A Tower
//     { wch: 10 }, // B Unit
//     { wch: 34 }, // C Checklist
//     { wch: 18 }, // D Stage
//     { wch: 18 }, // E Total Snag
//     { wch: 12 }, // F Completed
//     { wch: 12 }, // G Pending
//     { wch: 3 },  // H blank
//     { wch: 14 }, // I Status
//     { wch: 16 }, // J Pending From

//     // K blank separator
//     { wch: 3 },

//     // L..AE (Right 20 cols)
//     { wch: 14 }, // L Tower
//     { wch: 10 }, // M Unit
//     { wch: 34 }, // N Checklist
//     { wch: 18 }, // O Stage
//     { wch: 18 }, // P Total CP
//     { wch: 24 }, // Q Checker Completed
//     { wch: 22 }, // R Checker Pending
//     { wch: 16 }, // S Checker %
//     { wch: 18 }, // T Total Snag
//     { wch: 26 }, // U Rejected by Checker
//     { wch: 22 }, // V Maker Done
//     { wch: 20 }, // W Maker Pending
//     { wch: 18 }, // X Maker %
//     { wch: 22 }, // Y Checker Done
//     { wch: 22 }, // Z Checker Pending
//     { wch: 20 }, // AA Checker %
//     { wch: 14 }, // AB Attempts
//     { wch: 18 }, // AC Status
//     { wch: 16 }, // AD Pending From
//     { wch: 12 }, // AE Overall %
//   ];

//   return ws;
// }

// /**
//  * ✅ exportReportNewExcel
//  *
//  * NEW: sections = [{ sheetName, leftTitle, rightTitle, hotoRows, snaggingRows, notes, rightOnly }]
//  * Optional: items -> will create "Raw Items" sheet
//  * Optional: buildingNameMap -> adds building_name in Raw Items
//  */
// export function exportReportNewExcel({
//   sections = null,

//   // old params (single sheet)
//   hotoRows = [],
//   snaggingRows = [],
//   leftTitle = "Left",
//   rightTitle = "Right",

//   fileName = "Report New.xlsx",
//   notes = {},
//   items = null,
//   buildingNameMap = null,
// } = {}) {
//   const wb = XLSX.utils.book_new();
//   const usedNames = new Set();

//   if (Array.isArray(sections) && sections.length) {
//     sections.forEach((sec, idx) => {
//       const sheetTitle = sec?.sheetName || sec?.rightTitle || sec?.leftTitle || `Purpose ${idx + 1}`;

//       const ws = buildReportSheet({
//         leftTitle: sec?.leftTitle ?? sheetTitle,
//         rightTitle: sec?.rightTitle ?? sheetTitle,
//         hotoRows: sec?.hotoRows || [],
//         snaggingRows: sec?.snaggingRows || [],
//         notes: sec?.notes || {},
//         rightOnly: !!sec?.rightOnly,
//       });

//       XLSX.utils.book_append_sheet(wb, ws, uniqueSheetName(sheetTitle, usedNames));
//     });
//   } else {
//     const ws = buildReportSheet({ leftTitle, rightTitle, hotoRows, snaggingRows, notes, rightOnly: false });
//     XLSX.utils.book_append_sheet(wb, ws, uniqueSheetName("Report", usedNames));
//   }

//   // Raw Items sheet (optional)
//   if (Array.isArray(items) && items.length) {
//     const rows = items.map((it) => {
//       const loc = it.location || {};
//       const cl = it.checklist || {};
//       const latest = it.latest_submission || {};
//       const roles = it.roles || {};

//       return {
//         purpose:
//           cl.purpose_name ||
//           cl.purpose_label ||
//           (typeof cl.purpose === "string"
//             ? cl.purpose
//             : cl.purpose?.name || cl.purpose?.title || "") ||
//           it.purpose ||
//           "",

//         building_id: loc.building_id ?? "",
//         building_name: resolveBuildingName(buildingNameMap, loc.building_id, loc),

//         flat_id: loc.flat_id ?? "",
//         room_category: loc.room_category ?? loc.room_type ?? "",

//         checklist_id: cl.id ?? "",
//         checklist_title: cl.title ?? cl.name ?? "",
//         stage_id: cl.stage_id ?? "",

//         item_id: it.item_id ?? "",
//         item_title: it.item_title ?? "",
//         item_status: it.item_status ?? "",

//         attempts: latest.attempts ?? "",

//         maker_user_id: roles.maker?.user_id ?? "",
//         supervisor_user_id: roles.supervisor?.user_id ?? "",
//         checker_user_id: roles.checker?.user_id ?? "",

//         checked_at: latest.checked_at ?? "",
//         supervised_at: latest.supervised_at ?? "",
//         maker_at: latest.maker_at ?? "",
//       };
//     });

//     const ws2 = XLSX.utils.json_to_sheet(rows);
//     const keys = Object.keys(rows[0] || {});
//     ws2["!cols"] = keys.map((k) => ({ wch: Math.max(14, String(k).length + 2) }));

//     XLSX.utils.book_append_sheet(wb, ws2, uniqueSheetName("Raw Items", usedNames));
//   }

//   const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
//   saveAs(new Blob([out], { type: "application/octet-stream" }), fileName);
// }



// // src/utils/exportReportNewExcel.js
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";

// /* ---------------- helpers ---------------- */
// const sanitizeSheetName = (name) => {
//   const n = String(name || "Report")
//     .replace(/[:\\/?*\[\]]/g, " ")
//     .trim();
//   return (n.slice(0, 31) || "Report").trim();
// };

// const uniqueSheetName = (baseName, usedSet) => {
//   const base = sanitizeSheetName(baseName);
//   if (!usedSet.has(base)) {
//     usedSet.add(base);
//     return base;
//   }
//   for (let i = 2; i < 1000; i++) {
//     const candidate = sanitizeSheetName(`${base.slice(0, 28)} ${i}`);
//     if (!usedSet.has(candidate)) {
//       usedSet.add(candidate);
//       return candidate;
//     }
//   }
//   const fallback = sanitizeSheetName(`${base.slice(0, 25)} ${Date.now() % 10000}`);
//   usedSet.add(fallback);
//   return fallback;
// };

// const toNum = (v) => {
//   const n = Number(v);
//   return Number.isFinite(n) ? n : 0;
// };

// const str = (v) => String(v ?? "").trim();

// const includesCI = (text, needle) =>
//   str(text).toLowerCase().includes(String(needle || "").toLowerCase());

// /**
//  * ✅ Add buildingNameMap support for Raw Items (building_id -> building_name)
//  */
// const resolveBuildingName = (buildingNameMap, buildingId, loc = {}) => {
//   const direct = loc.building_name || loc.tower_name || "";
//   if (direct) return String(direct);

//   if (!buildingId) return "";
//   const key = String(buildingId);

//   if (buildingNameMap && typeof buildingNameMap.get === "function") {
//     return buildingNameMap.get(key) || "";
//   }
//   if (buildingNameMap && typeof buildingNameMap === "object") {
//     return buildingNameMap[key] || "";
//   }
//   return "";
// };

// /* ---------------- NORMALIZE LOGIC (YOUR FIX) ----------------
//    ✅ Total Snag Points should show ONLY "Rejected by Checker"
//    ✅ Completed should be only when CHECKER closes/final-corrects (not maker)
//    We do this at export time so even if upstream rows are wrong, Excel shows correct.
// ------------------------------------------------------------- */

// /**
//  * LEFT row (10 cols):
//  * [0 Tower,1 Unit,2 Checklist,3 Stage,4 TotalSnag,5 Completed,6 Pending,7 blank,8 Status,9 PendingFrom]
//  *
//  * Rule:
//  * - If Pending From = maker => Completed must NOT count (set Completed=0, Pending=Total)
//  * - Keep Pending = Total - Completed (safe clamp)
//  */
// const normalizeLeftRow10 = (row) => {
//   if (!Array.isArray(row)) return row;

//   const out = row.slice(0, 10);
//   const total = toNum(out[4]);
//   let completed = toNum(out[5]);
//   let pending = toNum(out[6]);

//   const pendingFrom = str(out[9]);
//   const status = str(out[8]);

//   const isMaker = includesCI(pendingFrom, "maker");
//   const isChecker = includesCI(pendingFrom, "checker");

//   // ✅ If maker is holding it => it is NOT completed (as per your rule)
//   if (isMaker) {
//     completed = 0;
//     pending = total;
//     out[8] = status || "Pending";
//   } else {
//     // keep completed but fix totals safely
//     if (completed < 0) completed = 0;
//     if (completed > total) completed = total;

//     // if pending looks wrong, recompute from total
//     const expectedPending = Math.max(0, total - completed);

//     // if pending is missing/0 but checker pending is indicated, prefer expected
//     if (!Number.isFinite(pending) || pending < 0) pending = expectedPending;

//     // if sums are inconsistent, force to expected
//     if (Math.abs((completed + pending) - total) > 0.0001) {
//       pending = expectedPending;
//     }

//     // if total > 0 and pending == 0 => mark completed
//     if (total > 0 && pending === 0 && (status === "" || includesCI(status, "pending"))) {
//       out[8] = "Completed";
//     }

//     // optional: if checker is mentioned and pending > 0 => pending
//     if (isChecker && pending > 0 && (status === "" || includesCI(status, "completed"))) {
//       out[8] = "Pending";
//     }
//   }

//   out[4] = total;
//   out[5] = completed;
//   out[6] = pending;

//   return out;
// };

// /**
//  * RIGHT row (20 cols A..T):
//  * [0 Tower,1 Unit,2 Checklist,3 Stage,
//  *  4 TotalCP,5 CheckerCheckCompleted,6 CheckerCheckPending,7 CheckerCheck%,
//  *  8 TotalSnagPoints,9 SnagRejectedByChecker,
//  *  10 MakerDone,11 MakerPending,12 Maker%,
//  *  13 CheckerDone,14 CheckerPending,15 Checker%,
//  *  16 Attempts,17 Status,18 PendingFrom,19 Overall%]
//  *
//  * Rule:
//  * ✅ Total Snag Points (col 8) MUST be ONLY rejected by checker (col 9)
//  * ✅ Checker Work Pending (col 14) MUST be (rejected - checkerDone)
//  * ✅ If Pending From = maker => Status cannot be Completed
//  */
// const normalizeRightRow20 = (row) => {
//   if (!Array.isArray(row)) return row;

//   const out = row.slice(0, 20);

//   const rejectedByChecker = toNum(out[9]); // Snag Rejected by Checker
//   const checkerDone = toNum(out[13]);      // Checker Work Completed

//   // ✅ total snag points should be ONLY rejected by checker
//   out[8] = rejectedByChecker;

//   // ✅ checker pending should be based on rejected pool (NOT maker)
//   out[14] = Math.max(0, rejectedByChecker - checkerDone);

//   // keep maker pending consistent (optional safe clamp)
//   const makerDone = toNum(out[10]);
//   out[11] = Math.max(0, rejectedByChecker - makerDone);

//   // status/pending-from sanity
//   const pendingFrom = str(out[18]);
//   const status = str(out[17]);

//   const isMaker = includesCI(pendingFrom, "maker");
//   const isChecker = includesCI(pendingFrom, "checker");

//   if (rejectedByChecker === 0) {
//     // no snags -> keep status as is (or blank)
//     // but if someone sent "Completed" incorrectly, keep it
//   } else {
//     if (isMaker) {
//       // ✅ maker holding => not completed
//       if (includesCI(status, "completed")) out[17] = "Pending";
//       if (!out[17]) out[17] = "Pending";
//     } else if (!isChecker) {
//       // if no pendingFrom, derive basic status from checker pending
//       out[17] = out[14] === 0 ? "Completed" : "Pending";
//     } else {
//       out[17] = out[14] === 0 ? "Completed" : "Pending";
//     }
//   }

//   return out;
// };

// /**
//  * ✅ buildReportSheet
//  * rightOnly=true  -> 20 columns A..T (your NEW snagging flow)
//  * rightOnly=false -> LEFT(A..J) + blank(K) + RIGHT(L..AE) (right is 20 cols)
//  */
// function buildReportSheet({
//   leftTitle = "",
//   rightTitle = "",
//   hotoRows = [],
//   snaggingRows = [],
//   notes = {},
//   rightOnly = false,
//   normalizeCounts = true, // ✅ DEFAULT ON (your fix)
// } = {}) {
//   /* ---------------- RIGHT ONLY (A..T = 20 cols) ---------------- */
//   if (rightOnly) {
//     const makeRow20 = () => new Array(20).fill("");

//     // Row 1 title
//     const r1 = makeRow20();
//     r1[0] = rightTitle || leftTitle || "Report";

//     // Row 2 headers (20)
//     const r2 = makeRow20();
//     r2[0] = "Tower";
//     r2[1] = "Unit No";
//     r2[2] = "Checklist";
//     r2[3] = "Stage";

//     r2[4] = "Total Checkpoints";
//     r2[5] = "Checker Check Completed";
//     r2[6] = "Checker Check Pending";
//     r2[7] = "Checker Check %";

//     r2[8] = "Total Snag Points";
//     r2[9] = "Snag Rejected by Checker";

//     r2[10] = "Maker Work Completed";
//     r2[11] = "Maker Work Pending";
//     r2[12] = "Maker % (Open/Close)";

//     r2[13] = "Checker Work Completed";
//     r2[14] = "Checker Work Pending";
//     r2[15] = "Checker % (Open/Close)";

//     r2[16] = "No of Attempt";
//     r2[17] = "Status";
//     r2[18] = "Pending From";
//     r2[19] = "Overall %";

//     const aoa = [r1, r2];

//     // Data rows
//     for (let i = 0; i < (snaggingRows?.length || 0); i++) {
//       let right = Array.isArray(snaggingRows[i]) ? snaggingRows[i] : null;
//       if (right && normalizeCounts) right = normalizeRightRow20(right);

//       const row = makeRow20();
//       if (right) {
//         for (let c = 0; c < Math.min(20, right.length); c++) row[c] = right[c] ?? "";
//       }
//       aoa.push(row);
//     }

//     // Notes row (optional)
//     const rightNote = notes?.rightNote || "";
//     if (rightNote) {
//       const noteRow = makeRow20();
//       noteRow[0] = rightNote;
//       aoa.push(noteRow);
//     }

//     const ws = XLSX.utils.aoa_to_sheet(aoa);

//     // Merge title A1:T1
//     ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 19 } }];

//     // Merge note row if note exists
//     if (rightNote) {
//       const lastRowIdx = aoa.length - 1;
//       ws["!merges"].push({ s: { r: lastRowIdx, c: 0 }, e: { r: lastRowIdx, c: 19 } });
//     }

//     ws["!cols"] = [
//       { wch: 14 }, // Tower
//       { wch: 10 }, // Unit
//       { wch: 34 }, // Checklist
//       { wch: 18 }, // Stage

//       { wch: 18 }, // Total CP
//       { wch: 24 }, // Checker Completed
//       { wch: 22 }, // Checker Pending
//       { wch: 16 }, // Checker %

//       { wch: 18 }, // Total Snag
//       { wch: 26 }, // Rejected by Checker

//       { wch: 22 }, // Maker Done
//       { wch: 20 }, // Maker Pending
//       { wch: 18 }, // Maker %

//       { wch: 22 }, // Checker Done
//       { wch: 22 }, // Checker Pending
//       { wch: 20 }, // Checker %

//       { wch: 14 }, // Attempts
//       { wch: 18 }, // Status
//       { wch: 16 }, // Pending From
//       { wch: 12 }, // Overall %
//     ];

//     return ws;
//   }

//   /* ---------------- LEFT + RIGHT (31 cols A..AE) ---------------- */
//   const makeRow31 = () => new Array(31).fill("");

//   // Row 1 titles
//   const r1 = makeRow31();
//   r1[0] = leftTitle || "Left";
//   r1[11] = rightTitle || "Right";

//   // Row 2 headers
//   const r2 = makeRow31();

//   // LEFT (A..J) -> matches your hotoRows (10 cols; includes blank at index 7)
//   r2[0] = "Tower";
//   r2[1] = "Unit No";
//   r2[2] = "Checklist";
//   r2[3] = "Stage";
//   r2[4] = "Total Snag Points";
//   r2[5] = "Completed";
//   r2[6] = "Pending";
//   r2[7] = ""; // keep blank
//   r2[8] = "Status";
//   r2[9] = "Pending From";

//   // K (index 10) blank separator

//   // RIGHT (L..AE = 20 cols)
//   r2[11] = "Tower";
//   r2[12] = "Unit No";
//   r2[13] = "Checklist";
//   r2[14] = "Stage";

//   r2[15] = "Total Checkpoints";
//   r2[16] = "Checker Check Completed";
//   r2[17] = "Checker Check Pending";
//   r2[18] = "Checker Check %";

//   r2[19] = "Total Snag Points";
//   r2[20] = "Snag Rejected by Checker";

//   r2[21] = "Maker Work Completed";
//   r2[22] = "Maker Work Pending";
//   r2[23] = "Maker % (Open/Close)";

//   r2[24] = "Checker Work Completed";
//   r2[25] = "Checker Work Pending";
//   r2[26] = "Checker % (Open/Close)";

//   r2[27] = "No of Attempt";
//   r2[28] = "Status";
//   r2[29] = "Pending From";
//   r2[30] = "Overall %";

//   const aoa = [r1, r2];

//   // Data rows
//   const n = Math.max(hotoRows?.length || 0, snaggingRows?.length || 0);
//   for (let i = 0; i < n; i++) {
//     const row = makeRow31();

//     let left = Array.isArray(hotoRows?.[i]) ? hotoRows[i] : null; // 10 cols
//     let right = Array.isArray(snaggingRows?.[i]) ? snaggingRows[i] : null; // 20 cols

//     if (left && normalizeCounts) left = normalizeLeftRow10(left);
//     if (right && normalizeCounts) right = normalizeRightRow20(right);

//     if (left) {
//       for (let c = 0; c < Math.min(10, left.length); c++) row[c] = left[c] ?? "";
//     }

//     // K stays blank

//     if (right) {
//       for (let c = 0; c < Math.min(20, right.length); c++) row[11 + c] = right[c] ?? "";
//     }

//     aoa.push(row);
//   }

//   // Notes row (optional)
//   const leftNote = notes?.leftNote || "";
//   const rightNote = notes?.rightNote || "";
//   if (leftNote || rightNote) {
//     const noteRow = makeRow31();
//     if (leftNote) noteRow[0] = leftNote;
//     if (rightNote) noteRow[11] = rightNote;
//     aoa.push(noteRow);
//   }

//   const ws = XLSX.utils.aoa_to_sheet(aoa);

//   // Merges:
//   // Left title: A1:J1
//   // Right title: L1:AE1  (11..30)
//   ws["!merges"] = [
//     { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
//     { s: { r: 0, c: 11 }, e: { r: 0, c: 30 } },
//   ];

//   if (leftNote || rightNote) {
//     const lastRowIdx = aoa.length - 1;
//     if (leftNote) ws["!merges"].push({ s: { r: lastRowIdx, c: 0 }, e: { r: lastRowIdx, c: 9 } });
//     if (rightNote) ws["!merges"].push({ s: { r: lastRowIdx, c: 11 }, e: { r: lastRowIdx, c: 30 } });
//   }

//   // Column widths (31)
//   ws["!cols"] = [
//     // A..J (Left)
//     { wch: 12 }, // A Tower
//     { wch: 10 }, // B Unit
//     { wch: 34 }, // C Checklist
//     { wch: 18 }, // D Stage
//     { wch: 18 }, // E Total Snag
//     { wch: 12 }, // F Completed
//     { wch: 12 }, // G Pending
//     { wch: 3 },  // H blank
//     { wch: 14 }, // I Status
//     { wch: 16 }, // J Pending From

//     // K blank separator
//     { wch: 3 },

//     // L..AE (Right 20 cols)
//     { wch: 14 }, // L Tower
//     { wch: 10 }, // M Unit
//     { wch: 34 }, // N Checklist
//     { wch: 18 }, // O Stage
//     { wch: 18 }, // P Total CP
//     { wch: 24 }, // Q Checker Completed
//     { wch: 22 }, // R Checker Pending
//     { wch: 16 }, // S Checker %
//     { wch: 18 }, // T Total Snag
//     { wch: 26 }, // U Rejected by Checker
//     { wch: 22 }, // V Maker Done
//     { wch: 20 }, // W Maker Pending
//     { wch: 18 }, // X Maker %
//     { wch: 22 }, // Y Checker Done
//     { wch: 22 }, // Z Checker Pending
//     { wch: 20 }, // AA Checker %
//     { wch: 14 }, // AB Attempts
//     { wch: 18 }, // AC Status
//     { wch: 16 }, // AD Pending From
//     { wch: 12 }, // AE Overall %
//   ];

//   return ws;
// }

// /**
//  * ✅ exportReportNewExcel
//  *
//  * NEW: sections = [{ sheetName, leftTitle, rightTitle, hotoRows, snaggingRows, notes, rightOnly, normalizeCounts }]
//  * Optional: items -> will create "Raw Items" sheet
//  * Optional: buildingNameMap -> adds building_name in Raw Items
//  */
// export function exportReportNewExcel({
//   sections = null,

//   // old params (single sheet)
//   hotoRows = [],
//   snaggingRows = [],
//   leftTitle = "Left",
//   rightTitle = "Right",

//   fileName = "Report New.xlsx",
//   notes = {},

//   // optional raw items dump
//   items = null,
//   buildingNameMap = null,

//   // ✅ master switch (default ON)
//   normalizeCounts = true,
// } = {}) {
//   const wb = XLSX.utils.book_new();
//   const usedNames = new Set();

//   if (Array.isArray(sections) && sections.length) {
//     sections.forEach((sec, idx) => {
//       const sheetTitle =
//         sec?.sheetName ||
//         sec?.rightTitle ||
//         sec?.leftTitle ||
//         `Purpose ${idx + 1}`;

//       const ws = buildReportSheet({
//         leftTitle: sec?.leftTitle ?? sheetTitle,
//         rightTitle: sec?.rightTitle ?? sheetTitle,
//         hotoRows: sec?.hotoRows || [],
//         snaggingRows: sec?.snaggingRows || [],
//         notes: sec?.notes || {},
//         rightOnly: !!sec?.rightOnly,

//         // ✅ per-sheet override allowed
//         normalizeCounts: sec?.normalizeCounts ?? normalizeCounts,
//       });

//       XLSX.utils.book_append_sheet(wb, ws, uniqueSheetName(sheetTitle, usedNames));
//     });
//   } else {
//     const ws = buildReportSheet({
//       leftTitle,
//       rightTitle,
//       hotoRows,
//       snaggingRows,
//       notes,
//       rightOnly: false,
//       normalizeCounts,
//     });
//     XLSX.utils.book_append_sheet(wb, ws, uniqueSheetName("Report", usedNames));
//   }

//   // Raw Items sheet (optional)
//   if (Array.isArray(items) && items.length) {
//     const rows = items.map((it) => {
//       const loc = it.location || {};
//       const cl = it.checklist || {};
//       const latest = it.latest_submission || {};
//       const roles = it.roles || {};

//       return {
//         purpose:
//           cl.purpose_name ||
//           cl.purpose_label ||
//           (typeof cl.purpose === "string"
//             ? cl.purpose
//             : cl.purpose?.name || cl.purpose?.title || "") ||
//           it.purpose ||
//           "",

//         building_id: loc.building_id ?? "",
//         building_name: resolveBuildingName(buildingNameMap, loc.building_id, loc),

//         flat_id: loc.flat_id ?? "",
//         room_category: loc.room_category ?? loc.room_type ?? "",

//         checklist_id: cl.id ?? "",
//         checklist_title: cl.title ?? cl.name ?? "",
//         stage_id: cl.stage_id ?? "",

//         item_id: it.item_id ?? "",
//         item_title: it.item_title ?? "",
//         item_status: it.item_status ?? it.status ?? "",

//         attempts: latest.attempts ?? "",

//         maker_user_id: roles.maker?.user_id ?? "",
//         supervisor_user_id: roles.supervisor?.user_id ?? "",
//         checker_user_id: roles.checker?.user_id ?? "",

//         checked_at: latest.checked_at ?? "",
//         supervised_at: latest.supervised_at ?? "",
//         maker_at: latest.maker_at ?? "",
//       };
//     });

//     const ws2 = XLSX.utils.json_to_sheet(rows);
//     const keys = Object.keys(rows[0] || {});
//     ws2["!cols"] = keys.map((k) => ({ wch: Math.max(14, String(k).length + 2) }));

//     XLSX.utils.book_append_sheet(wb, ws2, uniqueSheetName("Raw Items", usedNames));
//   }

//   const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
//   saveAs(new Blob([out], { type: "application/octet-stream" }), fileName);
// }
// src/utils/exportReportNewExcel.js
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/* ===========================
   ✅ DEBUG SWITCH (READ THIS)
   ===========================
   Browser Console me export click se pehle:
   window.__DBG_EXCEL = { enabled: true, limit: 20 };

   Disable:
   window.__DBG_EXCEL = { enabled: false };
*/
const DBG = () =>
  typeof window !== "undefined" && window.__DBG_EXCEL?.enabled === true;

const DBG_LIMIT = () =>
  typeof window !== "undefined" && Number(window.__DBG_EXCEL?.limit ?? 20);

let __dbgRightCount = 0;
let __dbgLeftCount = 0;

/* ---------------- helpers ---------------- */
const sanitizeSheetName = (name) => {
  const n = String(name || "Report")
    .replace(/[:\\/?*\[\]]/g, " ")
    .trim();
  return (n.slice(0, 31) || "Report").trim();
};

const uniqueSheetName = (baseName, usedSet) => {
  const base = sanitizeSheetName(baseName);
  if (!usedSet.has(base)) {
    usedSet.add(base);
    return base;
  }
  for (let i = 2; i < 1000; i++) {
    const candidate = sanitizeSheetName(`${base.slice(0, 28)} ${i}`);
    if (!usedSet.has(candidate)) {
      usedSet.add(candidate);
      return candidate;
    }
  }
  const fallback = sanitizeSheetName(`${base.slice(0, 25)} ${Date.now() % 10000}`);
  usedSet.add(fallback);
  return fallback;
};

/**
 * ✅ IMPORTANT FIX:
 * - handles "100%", " 10 ", "1,234" etc
 */
const toNum = (v) => {
  if (v === null || v === undefined) return 0;
  const s = String(v).trim();
  if (!s) return 0;

  // remove commas, percent, currency-ish junk
  const cleaned = s.replace(/[,₹%]/g, "").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
};

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const pct = (done, total) => {
  const d = toNum(done);
  const t = toNum(total);
  if (t <= 0) return 0;
  // keep 2 decimals
  return Math.round((d / t) * 10000) / 100;
};

const str = (v) => String(v ?? "").trim();

const includesCI = (text, needle) =>
  str(text).toLowerCase().includes(String(needle || "").toLowerCase());

/**
 * ✅ Add buildingNameMap support for Raw Items (building_id -> building_name)
 */
const resolveBuildingName = (buildingNameMap, buildingId, loc = {}) => {
  const direct = loc.building_name || loc.tower_name || "";
  if (direct) return String(direct);

  if (!buildingId) return "";
  const key = String(buildingId);

  if (buildingNameMap && typeof buildingNameMap.get === "function") {
    return buildingNameMap.get(key) || "";
  }
  if (buildingNameMap && typeof buildingNameMap === "object") {
    return buildingNameMap[key] || "";
  }
  return "";
};

/* ===========================
   ✅ DEBUG LABEL TABLES
   =========================== */

const RIGHT_LABELS = [
  ["Tower", 0],
  ["Unit No", 1],
  ["Checklist", 2],
  ["Stage", 3],
  ["Total CP", 4],
  ["Checker Check Completed", 5],
  ["Checker Check Pending", 6],
  ["Checker Check %", 7],
  ["Total Snag Points", 8],
  ["Snag Rejected by Checker", 9],
  ["Maker Done", 10],
  ["Maker Pending", 11],
  ["Maker %", 12],
  ["Checker Done", 13],
  ["Checker Pending", 14],
  ["Checker %", 15],
  ["Attempts", 16],
  ["Status", 17],
  ["Pending From", 18],
  ["Overall %", 19],
];

const LEFT_LABELS = [
  ["Tower", 0],
  ["Unit No", 1],
  ["Checklist", 2],
  ["Stage", 3],
  ["Total Snag Points", 4],
  ["Completed", 5],
  ["Pending", 6],
  ["(blank)", 7],
  ["Status", 8],
  ["Pending From", 9],
];

const rowToTable = (labels, row) =>
  labels.map(([label, idx]) => ({
    idx,
    label,
    value: Array.isArray(row) ? row[idx] : undefined,
  }));

const debugGroup = (title, fn) => {
  if (!DBG()) return;
  try {
    console.groupCollapsed(title);
    fn();
  } finally {
    console.groupEnd();
  }
};

/* ---------------- NORMALIZE LOGIC (YOUR FIX) ----------------
   ✅ Total Snag Points should show ONLY "Rejected by Checker"
   ✅ Completed should be only when CHECKER closes/final-corrects (not maker)
------------------------------------------------------------- */

/**
 * LEFT row (10 cols):
 * [0 Tower,1 Unit,2 Checklist,3 Stage,4 TotalSnag,5 Completed,6 Pending,7 blank,8 Status,9 PendingFrom]
 */
const normalizeLeftRow10 = (row) => {
  if (!Array.isArray(row)) return row;

  const out = row.slice(0, 10);
  const total = toNum(out[4]);
  let completed = toNum(out[5]);
  let pending = toNum(out[6]);

  const pendingFrom = str(out[9]);
  const status = str(out[8]);

  const isMaker = includesCI(pendingFrom, "maker");

  if (DBG() && __dbgLeftCount < DBG_LIMIT()) {
    __dbgLeftCount++;
    debugGroup(`📌 [EXCEL DBG] LEFT #${__dbgLeftCount} BEFORE normalize`, () => {
      console.log("left raw[]:", row);
      console.table(rowToTable(LEFT_LABELS, row));
    });
  }

  // ✅ If maker is holding it => it is NOT completed
  if (isMaker) {
    completed = 0;
    pending = total;
    out[8] = status || "Pending";
  } else {
    completed = clamp(completed, 0, total);
    const expectedPending = Math.max(0, total - completed);

    if (!Number.isFinite(pending) || pending < 0) pending = expectedPending;
    if (Math.abs((completed + pending) - total) > 0.0001) pending = expectedPending;

    if (total > 0 && pending === 0 && (status === "" || includesCI(status, "pending"))) {
      out[8] = "Completed";
    }
  }

  out[4] = total;
  out[5] = completed;
  out[6] = pending;

  if (DBG() && __dbgLeftCount <= DBG_LIMIT()) {
    debugGroup(`✅ [EXCEL DBG] LEFT #${__dbgLeftCount} AFTER normalize`, () => {
      console.log("left normalized[]:", out);
      console.table(rowToTable(LEFT_LABELS, out));
    });
  }

  return out;
};

/**
 * RIGHT row (20 cols A..T):
 * [0 Tower,1 Unit,2 Checklist,3 Stage,
 *  4 TotalCP,5 CheckerCheckCompleted,6 CheckerCheckPending,7 CheckerCheck%,
 *  8 TotalSnagPoints,9 SnagRejectedByChecker,
 *  10 MakerDone,11 MakerPending,12 Maker%,
 *  13 CheckerDone,14 CheckerPending,15 Checker%,
 *  16 Attempts,17 Status,18 PendingFrom,19 Overall%]
 *
 * ✅ HARD RULES:
 * - RejectedByChecker <= CheckerCheckCompleted
 * - TotalSnagPoints = RejectedByChecker
 * - MakerPending = Rejected - MakerDone
 * - CheckerPending = Rejected - CheckerDone
 *
 * ✅ Special case (your current wrong Excel):
 *   completed=total, rejected=total, makerDone=0, checkerDone=0, overall=0
 *   => Treat as "inspection pending" (completed=0, rejected=0)
 */
const normalizeRightRow20 = (row) => {
  if (!Array.isArray(row)) return row;

  const out = row.slice(0, 20);

  if (DBG() && __dbgRightCount < DBG_LIMIT()) {
    __dbgRightCount++;
    debugGroup(`📌 [EXCEL DBG] RIGHT #${__dbgRightCount} BEFORE normalize`, () => {
      console.log("right raw[]:", row);
      console.table(rowToTable(RIGHT_LABELS, row));

      const a = toNum(row?.[5]); // checker check completed
      const b = toNum(row?.[9]); // rejected by checker
      if (a === b && a > 0) {
        console.warn(
          "⚠️ [SUSPECT] idx5 (CheckerCheckCompleted) == idx9 (RejectedByChecker). " +
            "Agar ye always same hai, backend ya FE mapping galat hai."
        );
      }
    });
  }

  // base reads
  const totalCP = toNum(out[4]);
  let chkDone = toNum(out[5]);
  let chkPending = toNum(out[6]);

  let rejected = toNum(out[9]);
  let makerDone = toNum(out[10]);
  let checkerDone = toNum(out[13]);

  const overallRawNum = toNum(out[19]);

  // ✅ detect the "always total" wrong pattern
  const suspicious =
    totalCP > 0 &&
    chkDone === totalCP &&
    rejected === totalCP &&
    makerDone === 0 &&
    checkerDone === 0 &&
    overallRawNum === 0;

  if (suspicious) {
    // treat as inspection pending
    chkDone = 0;
    chkPending = totalCP;
    rejected = 0;
    makerDone = 0;
    checkerDone = 0;
  }

  // ✅ checkpoint side consistency
  chkDone = clamp(chkDone, 0, totalCP);
  chkPending = Math.max(0, totalCP - chkDone);

  out[5] = chkDone;
  out[6] = chkPending;
  out[7] = pct(chkDone, totalCP);

  // ✅ rejected cannot exceed checked
  rejected = clamp(rejected, 0, chkDone);

  // ✅ total snag points must be ONLY rejected by checker
  out[9] = rejected;
  out[8] = rejected;

  // ✅ maker / checker done cannot exceed rejected
  makerDone = clamp(makerDone, 0, rejected);
  checkerDone = clamp(checkerDone, 0, rejected);

  const makerPending = Math.max(0, rejected - makerDone);
  const checkerPending = Math.max(0, rejected - checkerDone);

  out[10] = makerDone;
  out[11] = makerPending;
  out[12] = rejected > 0 ? pct(makerDone, rejected) : 0;

  out[13] = checkerDone;
  out[14] = checkerPending;
  out[15] = rejected > 0 ? pct(checkerDone, rejected) : 0;

  // ✅ Status + Pending From + Overall %
  if (rejected === 0) {
    out[18] = "";
    out[17] = totalCP > 0 && chkPending === 0 ? "Completed" : "Pending";
    out[19] = pct(chkDone, totalCP);
  } else {
    const pendingFrom = makerPending > 0 ? "Maker" : checkerPending > 0 ? "Checker" : "";
    out[18] = pendingFrom || str(out[18]) || "";
    out[17] = checkerPending === 0 ? "Completed" : "Pending";
    out[19] = pct(checkerDone, rejected);
  }

  // extra: if pendingFrom says maker => status cannot be completed
  if (includesCI(out[18], "maker") && includesCI(out[17], "completed")) {
    out[17] = "Pending";
  }

  // keep attempts numeric
  out[16] = toNum(out[16]);

  if (DBG() && __dbgRightCount <= DBG_LIMIT()) {
    debugGroup(`✅ [EXCEL DBG] RIGHT #${__dbgRightCount} AFTER normalize`, () => {
      console.log("right normalized[]:", out);
      console.table(rowToTable(RIGHT_LABELS, out));

      const a = toNum(out?.[5]);
      const b = toNum(out?.[9]);
      console.log("🔎 AFTER: CheckerCheckCompleted(idx5)=", a, "| RejectedByChecker(idx9)=", b);
    });
  }

  return out;
};

/**
 * ✅ buildReportSheet
 * rightOnly=true  -> 20 columns A..T (your NEW snagging flow)
 * rightOnly=false -> LEFT(A..J) + blank(K) + RIGHT(L..AE) (right is 20 cols)
 */
function buildReportSheet({
  leftTitle = "",
  rightTitle = "",
  hotoRows = [],
  snaggingRows = [],
  notes = {},
  rightOnly = false,
  normalizeCounts = true,
} = {}) {
  // reset counters per sheet (so each sheet shows first N rows)
  __dbgRightCount = 0;
  __dbgLeftCount = 0;

  if (DBG()) {
    debugGroup("🧾 [EXCEL DBG] buildReportSheet START", () => {
      console.log("leftTitle:", leftTitle);
      console.log("rightTitle:", rightTitle);
      console.log("rightOnly:", rightOnly);
      console.log("normalizeCounts:", normalizeCounts);
      console.log("hotoRows length:", hotoRows?.length || 0);
      console.log("snaggingRows length:", snaggingRows?.length || 0);
      if (Array.isArray(snaggingRows) && snaggingRows.length) {
        console.log("✅ [EXCEL DBG] snaggingRows[0] raw:", snaggingRows[0]);
        console.table(rowToTable(RIGHT_LABELS, snaggingRows[0]));
      }
    });
  }

  /* ---------------- RIGHT ONLY (A..T = 20 cols) ---------------- */
  if (rightOnly) {
    const makeRow20 = () => new Array(20).fill("");

    // Row 1 title
    const r1 = makeRow20();
    r1[0] = rightTitle || leftTitle || "Report";

    // Row 2 headers (20)
    const r2 = makeRow20();
    r2[0] = "Tower";
    r2[1] = "Unit No";
    r2[2] = "Checklist";
    r2[3] = "Stage";

    r2[4] = "Total Checkpoints";
    r2[5] = "Checker Check Completed";
    r2[6] = "Checker Check Pending";
    r2[7] = "Checker Check %";

    r2[8] = "Total Snag Points";
    r2[9] = "Snag Rejected by Checker";

    r2[10] = "Maker Work Completed";
    r2[11] = "Maker Work Pending";
    r2[12] = "Maker % (Open/Close)";

    r2[13] = "Checker Work Completed";
    r2[14] = "Checker Work Pending";
    r2[15] = "Checker % (Open/Close)";

    r2[16] = "No of Attempt";
    r2[17] = "Status";
    r2[18] = "Pending From";
    r2[19] = "Overall %";

    const aoa = [r1, r2];

    // Data rows
    for (let i = 0; i < (snaggingRows?.length || 0); i++) {
      let right = Array.isArray(snaggingRows[i]) ? snaggingRows[i] : null;
      if (right && normalizeCounts) right = normalizeRightRow20(right);

      const row = makeRow20();
      if (right) {
        for (let c = 0; c < Math.min(20, right.length); c++) row[c] = right[c] ?? "";
      }
      aoa.push(row);
    }

    // Notes row (optional)
    const rightNote = notes?.rightNote || "";
    if (rightNote) {
      const noteRow = makeRow20();
      noteRow[0] = rightNote;
      aoa.push(noteRow);
    }

    const ws = XLSX.utils.aoa_to_sheet(aoa);

    // Merge title A1:T1
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 19 } }];

    // Merge note row if note exists
    if (rightNote) {
      const lastRowIdx = aoa.length - 1;
      ws["!merges"].push({ s: { r: lastRowIdx, c: 0 }, e: { r: lastRowIdx, c: 19 } });
    }

    ws["!cols"] = [
      { wch: 14 }, // Tower
      { wch: 10 }, // Unit
      { wch: 34 }, // Checklist
      { wch: 18 }, // Stage
      { wch: 18 }, // Total CP
      { wch: 24 }, // Checker Completed
      { wch: 22 }, // Checker Pending
      { wch: 16 }, // Checker %
      { wch: 18 }, // Total Snag
      { wch: 26 }, // Rejected by Checker
      { wch: 22 }, // Maker Done
      { wch: 20 }, // Maker Pending
      { wch: 18 }, // Maker %
      { wch: 22 }, // Checker Done
      { wch: 22 }, // Checker Pending
      { wch: 20 }, // Checker %
      { wch: 14 }, // Attempts
      { wch: 18 }, // Status
      { wch: 16 }, // Pending From
      { wch: 12 }, // Overall %
    ];

    return ws;
  }

  /* ---------------- LEFT + RIGHT (31 cols A..AE) ---------------- */
  const makeRow31 = () => new Array(31).fill("");

  // Row 1 titles
  const r1 = makeRow31();
  r1[0] = leftTitle || "Left";
  r1[11] = rightTitle || "Right";

  // Row 2 headers
  const r2 = makeRow31();

  // LEFT (A..J)
  r2[0] = "Tower";
  r2[1] = "Unit No";
  r2[2] = "Checklist";
  r2[3] = "Stage";
  r2[4] = "Total Snag Points";
  r2[5] = "Completed";
  r2[6] = "Pending";
  r2[7] = "";
  r2[8] = "Status";
  r2[9] = "Pending From";

  // RIGHT (L..AE)
  r2[11] = "Tower";
  r2[12] = "Unit No";
  r2[13] = "Checklist";
  r2[14] = "Stage";

  r2[15] = "Total Checkpoints";
  r2[16] = "Checker Check Completed";
  r2[17] = "Checker Check Pending";
  r2[18] = "Checker Check %";

  r2[19] = "Total Snag Points";
  r2[20] = "Snag Rejected by Checker";

  r2[21] = "Maker Work Completed";
  r2[22] = "Maker Work Pending";
  r2[23] = "Maker % (Open/Close)";

  r2[24] = "Checker Work Completed";
  r2[25] = "Checker Work Pending";
  r2[26] = "Checker % (Open/Close)";

  r2[27] = "No of Attempt";
  r2[28] = "Status";
  r2[29] = "Pending From";
  r2[30] = "Overall %";

  const aoa = [r1, r2];

  const n = Math.max(hotoRows?.length || 0, snaggingRows?.length || 0);
  for (let i = 0; i < n; i++) {
    const row = makeRow31();

    let left = Array.isArray(hotoRows?.[i]) ? hotoRows[i] : null;
    let right = Array.isArray(snaggingRows?.[i]) ? snaggingRows[i] : null;

    if (left && normalizeCounts) left = normalizeLeftRow10(left);
    if (right && normalizeCounts) right = normalizeRightRow20(right);

    if (left) {
      for (let c = 0; c < Math.min(10, left.length); c++) row[c] = left[c] ?? "";
    }

    if (right) {
      for (let c = 0; c < Math.min(20, right.length); c++) row[11 + c] = right[c] ?? "";
    }

    aoa.push(row);
  }

  // Notes row (optional)
  const leftNote = notes?.leftNote || "";
  const rightNote = notes?.rightNote || "";
  if (leftNote || rightNote) {
    const noteRow = makeRow31();
    if (leftNote) noteRow[0] = leftNote;
    if (rightNote) noteRow[11] = rightNote;
    aoa.push(noteRow);
  }

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
    { s: { r: 0, c: 11 }, e: { r: 0, c: 30 } },
  ];

  if (leftNote || rightNote) {
    const lastRowIdx = aoa.length - 1;
    if (leftNote) ws["!merges"].push({ s: { r: lastRowIdx, c: 0 }, e: { r: lastRowIdx, c: 9 } });
    if (rightNote) ws["!merges"].push({ s: { r: lastRowIdx, c: 11 }, e: { r: lastRowIdx, c: 30 } });
  }

  ws["!cols"] = [
    { wch: 12 }, // A
    { wch: 10 }, // B
    { wch: 34 }, // C
    { wch: 18 }, // D
    { wch: 18 }, // E
    { wch: 12 }, // F
    { wch: 12 }, // G
    { wch: 3 }, // H
    { wch: 14 }, // I
    { wch: 16 }, // J
    { wch: 3 }, // K
    { wch: 14 }, // L
    { wch: 10 }, // M
    { wch: 34 }, // N
    { wch: 18 }, // O
    { wch: 18 }, // P
    { wch: 24 }, // Q
    { wch: 22 }, // R
    { wch: 16 }, // S
    { wch: 18 }, // T
    { wch: 26 }, // U
    { wch: 22 }, // V
    { wch: 20 }, // W
    { wch: 18 }, // X
    { wch: 22 }, // Y
    { wch: 22 }, // Z
    { wch: 20 }, // AA
    { wch: 14 }, // AB
    { wch: 18 }, // AC
    { wch: 16 }, // AD
    { wch: 12 }, // AE
  ];

  return ws;
}

/**
 * ✅ exportReportNewExcel
 */
export function exportReportNewExcel({
  sections = null,

  hotoRows = [],
  snaggingRows = [],
  leftTitle = "Left",
  rightTitle = "Right",

  fileName = "Report New.xlsx",
  notes = {},

  items = null,
  buildingNameMap = null,

  normalizeCounts = true,
} = {}) {
  if (DBG()) {
    debugGroup("🚀 [EXCEL DBG] exportReportNewExcel START", () => {
      console.log("fileName:", fileName);
      console.log("normalizeCounts:", normalizeCounts);
      console.log("sections:", sections ? sections.length : null);
      console.log("hotoRows length:", hotoRows?.length || 0);
      console.log("snaggingRows length:", snaggingRows?.length || 0);

      if (Array.isArray(snaggingRows) && snaggingRows.length) {
        console.log("✅ [EXCEL DBG] snaggingRows[0] at export:", snaggingRows[0]);
        console.table(rowToTable(RIGHT_LABELS, snaggingRows[0]));
      }
    });
  }

  const wb = XLSX.utils.book_new();
  const usedNames = new Set();

  if (Array.isArray(sections) && sections.length) {
    sections.forEach((sec, idx) => {
      const sheetTitle =
        sec?.sheetName ||
        sec?.rightTitle ||
        sec?.leftTitle ||
        `Purpose ${idx + 1}`;

      if (DBG()) {
        debugGroup(`📄 [EXCEL DBG] SHEET #${idx + 1} "${sheetTitle}" INPUT`, () => {
          console.log("rightOnly:", !!sec?.rightOnly);
          console.log("normalizeCounts effective:", sec?.normalizeCounts ?? normalizeCounts);
          console.log("hotoRows length:", sec?.hotoRows?.length || 0);
          console.log("snaggingRows length:", sec?.snaggingRows?.length || 0);

          const first = sec?.snaggingRows?.[0];
          if (Array.isArray(first)) {
            console.log("✅ [EXCEL DBG] sec.snaggingRows[0] raw:", first);
            console.table(rowToTable(RIGHT_LABELS, first));
          }
        });
      }

      const ws = buildReportSheet({
        leftTitle: sec?.leftTitle ?? sheetTitle,
        rightTitle: sec?.rightTitle ?? sheetTitle,
        hotoRows: sec?.hotoRows || [],
        snaggingRows: sec?.snaggingRows || [],
        notes: sec?.notes || {},
        rightOnly: !!sec?.rightOnly,
        normalizeCounts: sec?.normalizeCounts ?? normalizeCounts,
      });

      XLSX.utils.book_append_sheet(wb, ws, uniqueSheetName(sheetTitle, usedNames));
    });
  } else {
    const ws = buildReportSheet({
      leftTitle,
      rightTitle,
      hotoRows,
      snaggingRows,
      notes,
      rightOnly: false,
      normalizeCounts,
    });
    XLSX.utils.book_append_sheet(wb, ws, uniqueSheetName("Report", usedNames));
  }

  // Raw Items sheet (optional)
  if (Array.isArray(items) && items.length) {
    if (DBG()) {
      debugGroup("📦 [EXCEL DBG] Raw Items START", () => {
        console.log("items length:", items.length);
        console.log("items[0] sample:", items[0]);
      });
    }

    const rows = items.map((it) => {
      const loc = it.location || {};
      const cl = it.checklist || {};
      const latest = it.latest_submission || {};
      const roles = it.roles || {};

      return {
        purpose:
          cl.purpose_name ||
          cl.purpose_label ||
          (typeof cl.purpose === "string"
            ? cl.purpose
            : cl.purpose?.name || cl.purpose?.title || "") ||
          it.purpose ||
          "",

        building_id: loc.building_id ?? "",
        building_name: resolveBuildingName(buildingNameMap, loc.building_id, loc),

        flat_id: loc.flat_id ?? "",
        room_category: loc.room_category ?? loc.room_type ?? "",

        checklist_id: cl.id ?? "",
        checklist_title: cl.title ?? cl.name ?? "",
        stage_id: cl.stage_id ?? "",

        item_id: it.item_id ?? "",
        item_title: it.item_title ?? "",
        item_status: it.item_status ?? it.status ?? "",

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
    const keys = Object.keys(rows[0] || {});
    ws2["!cols"] = keys.map((k) => ({ wch: Math.max(14, String(k).length + 2) }));

    XLSX.utils.book_append_sheet(wb, ws2, uniqueSheetName("Raw Items", usedNames));
  }

  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([out], { type: "application/octet-stream" }), fileName);

  if (DBG()) {
    console.log("✅ [EXCEL DBG] exportReportNewExcel DONE");
  }
}

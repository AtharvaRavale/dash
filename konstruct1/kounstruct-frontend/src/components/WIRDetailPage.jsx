// src/components/WIRDetailPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useTheme } from "../ThemeContext";
import SignaturePadField from "../components/SignaturePadField";
import { exportWIRPdf } from "../api";

import {
  getWIRById,
  updateWIR,
  forwardWIR,
  getUsersByProject,
  getProjectsForCurrentUser,
  uploadWIRAttachments,
  uploadWIRLogos,
  signWIRContractor,
  signWIRInspector,
} from "../api";

// THEME PALETTE
const ORANGE = "#ffbe63";
const BG_OFFWHITE = "#fcfaf7";

/* ===== helpers ===== */
const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);

const isoDateOnly = (v) => {
  if (!v) return "";
  try {
    return String(v).substring(0, 10);
  } catch {
    return "";
  }
};

const fmtDDMonYYYY = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mon = d.toLocaleString("en-GB", { month: "short" }); // Dec
  const yyyy = d.getFullYear();
  return `${dd}-${mon}-${yyyy}`;
};

const safeStr = (v) => (v === null || v === undefined ? "" : String(v));

const sanitizeFileName = (name) =>
  String(name || "document")
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .slice(0, 160);

const RESERVED_EXTRA_KEYS = new Set([
  "project_display_name",
  "wir_title",
  "request_note",
  "contractor_required_actions",
]);

const ATT_MAP = [
  {
    key: "key_plan",
    label: "1. Area of Inspection Requested, Marked in Key Plan",
    flag: "att_key_plan",
    category: "KEY_PLAN",
  },
  {
    key: "checklist",
    label: "2. Inspection Request/Method Statement/Construction Checklist",
    flag: "att_checklist",
    category: "CHECKLIST",
  },
  {
    key: "clearance",
    label: "3. MEP / Interface / Area Clearance Form",
    flag: "att_clearance",
    category: "CLEARANCE",
  },
  {
    key: "drawing",
    label: "4. GFC/Shop Drawing (Attached or Referred)",
    flag: "att_drawing",
    category: "DRAWING",
  },
  {
    key: "other",
    label: "5. Other Documents",
    flag: "att_other",
    category: "OTHER",
  },
];

const DECISIONS = [
  { value: "NONE", label: "Select (optional)" },
  { value: "A", label: "A - Proceed With Works" },
  { value: "B", label: "B - Proceed With Works As Noted Above" },
  { value: "C", label: "C - Revise And Re-Submit" },
  { value: "D", label: "D - Rejected" },
];

const groupAttachmentsByCategory = (attachments = []) => {
  const map = {
    KEY_PLAN: [],
    CHECKLIST: [],
    CLEARANCE: [],
    DRAWING: [],
    OTHER: [],
    UNKNOWN: [],
  };
  (attachments || []).forEach((a) => {
    const c = (a.category || a.attachment_category || "").toUpperCase();
    if (map[c]) map[c].push(a);
    else map.UNKNOWN.push(a);
  });
  return map;
};

function Box({ checked }) {
  return (
    <span
      style={{
        width: 14,
        height: 14,
        border: "1.5px solid #000",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
        background: "#fff",
        lineHeight: 1,
      }}
    >
      {checked ? <span style={{ fontSize: 12, fontWeight: 900 }}>✓</span> : null}
    </span>
  );
}

/* ===== UI styles ===== */
const cardStyle = {
  borderRadius: 12,
  padding: 14,
  marginTop: 12,
};

const btnSmall = {
  padding: "8px 14px",
  background: ORANGE,
  color: "#222",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 800,
};

const btnExportStyle = {
  padding: "8px 14px",
  background: "#111827",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 900,
};

const miniTh = {
  textAlign: "left",
  background: "#f3f4f6",
  border: "1px solid #e5e7eb",
  padding: 8,
  fontSize: 12,
};

const miniTdKey = {
  border: "1px solid #e5e7eb",
  padding: 8,
  fontSize: 12,
  fontWeight: 900,
  width: 240,
};

const miniTdVal = {
  border: "1px solid #e5e7eb",
  padding: 8,
  fontSize: 12,
};

const logoBox = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 12,
  background: "#fff",
};

const logoPreview = {
  width: "100%",
  height: 120,
  border: "1px dashed #d1d5db",
  borderRadius: 10,
  marginBottom: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
};

const logoImg = { width: "100%", height: "100%", objectFit: "contain" };

const logoPlaceholder = {
  fontWeight: 900,
  color: "#6b7280",
};

const tdBox = {
  border: "1px solid #000",
  padding: 6,
  verticalAlign: "top",
  fontSize: 11,
};

const tdThick = {
  ...tdBox,
  border: "2px solid #000",
};

const hdrLabelCell = {
  ...tdBox,
  fontWeight: 900,
  background: "#f3f4f6",
};

const hdrValueCell = {
  ...tdBox,
};

const hdrText = {
  fontWeight: 800,
};

const hdrInput = {
  width: "100%",
  padding: 6,
  border: "1px solid #d1d5db",
  borderRadius: 6,
  fontSize: 12,
};

const excelInput = {
  width: "100%",
  padding: 6,
  border: "1px solid #d1d5db",
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 900,
  background: "#fff",
};

const lineInput = {
  padding: 6,
  border: "1px solid #d1d5db",
  borderRadius: 6,
  fontSize: 12,
  width: "calc(100% - 10px)",
};

const txtAreaSmall = {
  padding: 6,
  border: "1px solid #d1d5db",
  borderRadius: 6,
  fontSize: 12,
  fontFamily: "Arial, sans-serif",
  resize: "vertical",
};

const chkRow = { display: "flex", alignItems: "center", marginBottom: 6 };
const chkText = { fontSize: 11, fontWeight: 800 };

// ✅ NEW: categories list for sheet upload UI
const SHEET_CATS = ["KEY_PLAN", "CHECKLIST", "CLEARANCE", "DRAWING", "OTHER"];

export default function WIRDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const bgColor = theme === "dark" ? "#191922" : BG_OFFWHITE;
  const cardColor = theme === "dark" ? "#23232c" : "#fff";
  const borderColor = ORANGE;
  const textColor = theme === "dark" ? "#fff" : "#222";

  const [wir, setWir] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // ✅ PDF download loading
  const [pdfLoading, setPdfLoading] = useState(false);

  // project list (for editing project_id)
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projects, setProjects] = useState([]);

  // forward UI
  const [forwardUsers, setForwardUsers] = useState([]);
  const [selectedForwardUserId, setSelectedForwardUserId] = useState("");
  const [forwardComment, setForwardComment] = useState("");

  // attachments upload state (existing bottom card)
  const [uploadCategory, setUploadCategory] = useState("KEY_PLAN");
  const [attachmentsFiles, setAttachmentsFiles] = useState([]);
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentDescription, setAttachmentDescription] = useState("");

  // ✅ NEW: reset key for bottom card file input
  const [attInputKey, setAttInputKey] = useState(0);

  // ✅ NEW: per-category upload state INSIDE SHEET (edit mode)
  const makeEmptySheetUploads = () =>
    SHEET_CATS.reduce((acc, cat) => {
      acc[cat] = { files: [], name: "", description: "", inputKey: 0 };
      return acc;
    }, {});
  const [sheetUploads, setSheetUploads] = useState(() => makeEmptySheetUploads());

  const setSheetFiles = (cat, filesArr) => {
    setSheetUploads((prev) => ({
      ...prev,
      [cat]: { ...prev[cat], files: filesArr || [] },
    }));
  };
  const setSheetMeta = (cat, field, value) => {
    setSheetUploads((prev) => ({
      ...prev,
      [cat]: { ...prev[cat], [field]: value },
    }));
  };
  const resetSheetCat = (cat) => {
    setSheetUploads((prev) => ({
      ...prev,
      [cat]: { files: [], name: "", description: "", inputKey: (prev[cat]?.inputKey || 0) + 1 },
    }));
  };
  const resetAllSheetUploads = () => {
    setSheetUploads((prev) => {
      const next = { ...prev };
      SHEET_CATS.forEach((cat) => {
        next[cat] = { files: [], name: "", description: "", inputKey: (prev[cat]?.inputKey || 0) + 1 };
      });
      return next;
    });
  };

  // logos (update)
  const [clientLogoFile, setClientLogoFile] = useState(null);
  const [pmcLogoFile, setPmcLogoFile] = useState(null);
  const [contractorLogoFile, setContractorLogoFile] = useState(null);
  const DEFAULT_LOGO_ADJ = { scale: 1, x: 0, y: 0, fit: "contain" };

const [logoAdj, setLogoAdj] = useState({
  client: { ...DEFAULT_LOGO_ADJ },
  pmc: { ...DEFAULT_LOGO_ADJ },
  contractor: { ...DEFAULT_LOGO_ADJ },
});


  // signatures update (2)
  const [contractorSignFile, setContractorSignFile] = useState(null);
  const [inspectorSignFile, setInspectorSignFile] = useState(null);

  // editable full form state
  const [editForm, setEditForm] = useState(null);
  const [extraRows, setExtraRows] = useState([{ key: "", value: "" }]);
  const [isEditing, setIsEditing] = useState(false);

  const initialMode = searchParams.get("mode");

  // PDF ref – only this block will be exported
  const pdfRef = useRef(null);

  useEffect(() => {
    if (!id) return;
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    // preload projects (so project_id is editable)
    (async () => {
      try {
        setProjectsLoading(true);
        const res = await getProjectsForCurrentUser();
        setProjects(res?.data || []);
      } catch (e) {
        console.warn("Projects load failed", e);
      } finally {
        setProjectsLoading(false);
      }
    })();
  }, []);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await getWIRById(id);
      const data = res?.data || res;
      setWir(data);

      const extra = isObj(data?.extra_data) ? data.extra_data : {};
      setLogoAdj({
  client: data?.extra_data?.logo_adjustments?.client || { ...DEFAULT_LOGO_ADJ },
  pmc: data?.extra_data?.logo_adjustments?.pmc || { ...DEFAULT_LOGO_ADJ },
  contractor: data?.extra_data?.logo_adjustments?.contractor || { ...DEFAULT_LOGO_ADJ },
});


      // forward users
      if (data?.project_id) {
        try {
          const uRes = await getUsersByProject(data.project_id);
          const users = uRes?.data || [];
          setForwardUsers(
            users.map((u) => ({
              id: u.id,
              label:
                u.display_name ||
                [u.first_name, u.last_name].filter(Boolean).join(" ") ||
                u.username ||
                u.email ||
                `User #${u.id}`,
            }))
          );
        } catch (err) {
          console.warn("Forward users load failed", err);
        }
      }

      // extraRows (exclude reserved keys)
      const rows = Object.entries(extra)
        .filter(([k]) => !RESERVED_EXTRA_KEYS.has(k))
        .map(([k, v]) => ({
          key: k,
          value: v === null || v === undefined ? "" : String(v),
        }));
      setExtraRows(rows.length ? rows : [{ key: "", value: "" }]);

      setEditForm({
        project_id: data.project_id ? String(data.project_id) : "",

        project_display_name:
          safeStr(extra.project_display_name) ||
          safeStr(data.project_display_name) ||
          safeStr(data.project_text) ||
          safeStr(data.project_name) ||
          safeStr(data.project?.name),

        wir_title: safeStr(extra.wir_title) || safeStr(data.wir_title) || "WORK INSPECTION REQUEST (WIR)",

        date_of_submission: isoDateOnly(data.date_of_submission || data.created_at),
        inspection_request_no: safeStr(data.inspection_request_no),
        date_of_inspection: isoDateOnly(data.date_of_inspection),
        time_of_inspection: safeStr(data.time_of_inspection || "10:15"),

        description_of_work: safeStr(data.description_of_work),
        location_gridlines: safeStr(data.location_gridlines),
        approved_wms_ref_no: safeStr(data.approved_wms_ref_no),
        zone_area: safeStr(data.zone_area),
        element: safeStr(data.element),

        request_note: safeStr(extra.request_note),
        contractor_required_actions: safeStr(extra.contractor_required_actions),

        consultant_comments: safeStr(data.consultant_comments),
        decision: safeStr(data.decision || "NONE").toUpperCase(),

        att_key_plan: !!data.att_key_plan,
        att_checklist: !!data.att_checklist,
        att_clearance: !!data.att_clearance,
        att_drawing: !!data.att_drawing,
        att_other: !!data.att_other,
        att_other_text: safeStr(data.att_other_text),

        work_types: Array.isArray(data.work_types) ? data.work_types : [],

        contractor_rep_name: safeStr(data.contractor_rep_name),
        contractor_rep_sign_date: isoDateOnly(data.contractor_rep_sign_date),
        inspector_name: safeStr(data.inspector_name),
        inspector_sign_date: isoDateOnly(data.inspector_sign_date),
      });

      // ✅ safe: whenever detail reloads, clear sheet upload selections
      setSheetUploads(makeEmptySheetUploads());

      if (initialMode === "edit") setIsEditing(true);
    } catch (err) {
      console.error("Failed to load WIR detail", err);
      toast.error("Failed to load WIR detail");
    } finally {
      setLoading(false);
    }
  };
//   const decisionLabel = useMemo(() => {
//   const d = DECISIONS.find((x) => x.value === decision);
//   if (!d || d.value === "NONE") return "";
//   return d.label; // e.g. "B - Proceed With Works As Noted Above"
// }, [decision]);


  const attachmentsByCategory = useMemo(() => groupAttachmentsByCategory(wir?.attachments || []), [wir]);
// ✅ Decision value + label (SAFE, no TDZ, hooks order ok)
const decisionValue = useMemo(
  () => safeStr(editForm?.decision || "NONE").toUpperCase(),
  [editForm?.decision]
);

const decisionLabel = useMemo(() => {
  const d = DECISIONS.find((x) => x.value === decisionValue);
  return d && d.value !== "NONE" ? d.label : "";
}, [decisionValue]);

  const handleBack = () => navigate("/wir/inbox");

  const toggleEdit = () => {
    setIsEditing((prev) => {
      const next = !prev;

      if (prev === false && next === true) {
        // entering edit mode: clear temp uploads
        setAttachmentsFiles([]);
        setAttachmentName("");
        setAttachmentDescription("");
        setAttInputKey((k) => k + 1);
        resetAllSheetUploads();
      }

      if (prev === true && next === false) {
        // cancel edit -> discard changes
        setAttachmentsFiles([]);
        setAttachmentName("");
        setAttachmentDescription("");
        setAttInputKey((k) => k + 1);

        resetAllSheetUploads();
        fetchDetail();
      }

      return next;
    });
  };
  // console.log("WIR ID param:", id);


  const handleEditChange = (e) => {
    const { name, type } = e.target;
    const value = type === "checkbox" ? e.target.checked : e.target.value;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleExtraRowChange = (idx, field, value) => {
    setExtraRows((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const addExtraRow = () => setExtraRows((p) => [...p, { key: "", value: "" }]);
  const removeExtraRow = (idx) => setExtraRows((p) => p.filter((_, i) => i !== idx));

  const buildExtraDataPayload = () => {
  const obj = {
    project_display_name: editForm?.project_display_name || "",
    wir_title: editForm?.wir_title || "",
    request_note: editForm?.request_note || "",
    contractor_required_actions: editForm?.contractor_required_actions || "",
    logo_adjustments: logoAdj, // ✅ ALWAYS save
  };

  (extraRows || []).forEach((r) => {
    const k = (r.key || "").trim();
    if (!k) return;
    if (RESERVED_EXTRA_KEYS.has(k)) return;
    obj[k] = r.value ?? "";
  });

  return obj;
};

  // ✅ UPDATED: Save Changes also uploads sheet attachments (per checked category)
  const handleUpdateDetails = async () => {
    if (!wir?.id || !editForm) return;

    const payload = {
      project_id: editForm.project_id ? Number(editForm.project_id) : null,

      date_of_submission: editForm.date_of_submission || null,
      inspection_request_no: editForm.inspection_request_no || "",
      date_of_inspection: editForm.date_of_inspection || null,
      time_of_inspection: editForm.time_of_inspection || "",

      description_of_work: editForm.description_of_work || "",
      location_gridlines: editForm.location_gridlines || "",
      approved_wms_ref_no: editForm.approved_wms_ref_no || "",
      zone_area: editForm.zone_area || "",
      element: editForm.element || "",

      consultant_comments: editForm.consultant_comments || "",
      decision: (editForm.decision || "NONE").toUpperCase(),

      att_key_plan: !!editForm.att_key_plan,
      att_checklist: !!editForm.att_checklist,
      att_clearance: !!editForm.att_clearance,
      att_drawing: !!editForm.att_drawing,
      att_other: !!editForm.att_other,
      att_other_text: editForm.att_other_text || "",

      work_types: Array.isArray(editForm.work_types) ? editForm.work_types : [],

      contractor_rep_name: editForm.contractor_rep_name || "",
      contractor_rep_sign_date: editForm.contractor_rep_sign_date || null,
      inspector_name: editForm.inspector_name || "",
      inspector_sign_date: editForm.inspector_sign_date || null,

      extra_data: buildExtraDataPayload(),
    };

    // ✅ gather only categories that are checked AND have files selected
    const checkedCats = ATT_MAP.filter((a) => !!editForm?.[a.flag]).map((a) => a.category);
    const uploadQueue = checkedCats
      .filter((cat) => (sheetUploads?.[cat]?.files || []).length > 0)
      .map((cat) => ({
        category: cat,
        files: sheetUploads[cat].files,
        name: sheetUploads[cat].name,
        description: sheetUploads[cat].description,
      }));

    try {
      setActionLoading(true);

      // 1) Update WIR fields
      await updateWIR(wir.id, payload);

      // 2) Upload selected attachments from sheet (per category)
      for (const item of uploadQueue) {
        const fd = new FormData();
        fd.append("category", item.category);
        (item.files || []).forEach((f) => fd.append("files", f));
        if (item.name) fd.append("name", item.name);
        if (item.description) fd.append("description", item.description);
        await uploadWIRAttachments(wir.id, fd);
        resetSheetCat(item.category);
      }

      toast.success(uploadQueue.length ? "WIR updated + attachments uploaded." : "WIR updated.");
      setIsEditing(false);
      await fetchDetail();
    } catch (err) {
      console.error("Update WIR error", err);
      toast.error(
        err.response?.data?.detail || err.response?.data?.error || "WIR update / attachment upload error."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleForward = async () => {
    if (!wir?.id) return;
    if (!selectedForwardUserId) {
      toast.error("Select the user");
      return;
    }

    try {
      setActionLoading(true);
      await forwardWIR(wir.id, {
        to_user_id: Number(selectedForwardUserId),
        comment: forwardComment || "",
      });
      toast.success("WIR forwarded");
      setForwardComment("");
      await fetchDetail();
    } catch (err) {
      console.error("Forward WIR error", err);
      toast.error(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Forward WIR error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // existing upload button (bottom card) — unchanged
  const handleUploadAttachments = async () => {
    if (!wir?.id) return;
    if (!attachmentsFiles.length) {
      toast.error("Select atleast one file");
      return;
    }
    if (!uploadCategory) {
      toast.error("Select Category");
      return;
    }

    try {
      setActionLoading(true);
      const fd = new FormData();
      fd.append("category", uploadCategory);
      attachmentsFiles.forEach((file) => fd.append("files", file));
      if (attachmentName) fd.append("name", attachmentName);
      if (attachmentDescription) fd.append("description", attachmentDescription);

      await uploadWIRAttachments(wir.id, fd);
      toast.success("Attachments uploaded");

      setAttachmentsFiles([]);
      setAttachmentName("");
      setAttachmentDescription("");
      setAttInputKey((k) => k + 1);

      await fetchDetail();
    } catch (err) {
      console.error("Attachments upload error", err);
      toast.error(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Attachments upload error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const uploadLogo = async (fieldName, file) => {
    if (!wir?.id) return;
    if (!file) {
      toast.error("Slect logo first");
      return;
    }
    try {
      setActionLoading(true);
      const fd = new FormData();
      fd.append(fieldName, file); // client_logo | pmc_logo | contractor_logo
      await uploadWIRLogos(wir.id, fd);
      toast.success("Logo upload/updated");
      await fetchDetail();
    } catch (err) {
      console.error("Logo upload error", err);
      toast.error(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Logo upload error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ signatures upload (use api.js helper)
  const saveContractorSignature = async () => {
    if (!wir?.id) return;
    if (!contractorSignFile) {
      toast.error("Select Contractor signature");
      return;
    }
    try {
      setActionLoading(true);
      await signWIRContractor(wir.id, {
        file: contractorSignFile,
        name: editForm?.contractor_rep_name || "",
        sign_date: editForm?.contractor_rep_sign_date || "",
      });
      toast.success("Contractor signature updated.");
      setContractorSignFile(null);
      await fetchDetail();
    } catch (err) {
      console.error("Contractor signature error", err);
      toast.error(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Contractor signature update error."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const saveInspectorSignature = async () => {
    if (!wir?.id) return;
    if (!inspectorSignFile) {
      toast.error("Seelect Inspector signature");
      return;
    }
    try {
      setActionLoading(true);
      await signWIRInspector(wir.id, {
        file: inspectorSignFile,
        name: editForm?.inspector_name || "",
        sign_date: editForm?.inspector_sign_date || "",
      });
      toast.success("Inspector signature updated.");
      setInspectorSignFile(null);
      await fetchDetail();
    } catch (err) {
      console.error("Inspector signature error", err);
      toast.error(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Inspector signature update error."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ PRINT fallback (in case html2pdf is not installed / fails)
  const handlePrintFallback = () => {
    if (!pdfRef.current || !wir) {
      toast.error("PDF content not ready");
      return;
    }
    try {
      const sheet = pdfRef.current.querySelector("#wir-pdf-sheet");
      if (!sheet) {
        toast.error("PDF sheet not found.");
        return;
      }
      const printContents = sheet.outerHTML;
      const win = window.open("", "", "height=800,width=1000");
      if (!win) {
        toast.error("Please allow popups.");
        return;
      }

      win.document.write(`
        <html>
          <head>
            <title>WIR ${wir.inspection_request_no || `#${wir.id}`}</title>
            <style>
              @page { size: A4 portrait; margin: 5mm; }
              * { box-sizing: border-box; }
              html, body { margin: 0; padding: 0; }
              body {
                font-family: Arial, sans-serif;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                background: #fff;
              }
              #wir-pdf-sheet {
                page-break-inside: avoid;
                break-inside: avoid;
                margin: 0 !important;
              }
              #wir-pdf-sheet table { border-collapse: collapse; width: 100%; }
              #wir-pdf-sheet td {
                border: 1px solid #000;
                font-size: 9px !important;
                padding: 2px 3px !important;
                vertical-align: top;
              }
              input, textarea, select { font-size: 9px !important; }
              img { max-width: 100%; }
            </style>
          </head>
          <body>
            ${printContents}
          </body>
        </html>
      `);

      win.document.close();
      win.focus();
      win.print();
    } catch (e) {
      console.error("Print fallback error", e);
      toast.error("PDF error");
    }
  };

  // ✅ DOWNLOAD PDF (actual file)
  const [includeAttachments, setIncludeAttachments] = useState(true);

  const handleExportPdf = async () => {
    if (!wir?.id) return;

    try {
      setPdfLoading(true);
      await exportWIRPdf(wir.id, includeAttachments);
      toast.success("PDF downloaded.");
    } catch (e) {
      console.error("Export PDF error", e);
      toast.error(e?.message || "PDF export failed.");
      // handlePrintFallback();
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 20, background: bgColor, color: textColor, minHeight: "100vh" }}>
        <button onClick={handleBack} style={{ marginBottom: 12 }}>
          ← Back to Inbox
        </button>
        <div>Loading WIR...</div>
      </div>
    );
  }

  if (!wir || !editForm) {
    return (
      <div style={{ padding: 20, background: bgColor, color: textColor, minHeight: "100vh" }}>
        <button onClick={handleBack} style={{ marginBottom: 12 }}>
          ← Back to Inbox
        </button>
        <div>WIR not found.</div>
      </div>
    );
  }

  const extra = isObj(wir?.extra_data) ? wir.extra_data : {};

  const projectDisplayName = editForm.project_display_name || "";
  const wirTitle = editForm.wir_title || "WORK INSPECTION REQUEST (WIR)";

  const dateOfSubmission = editForm.date_of_submission || "";
  const inspectionRequestNo = editForm.inspection_request_no || "";
  const dateOfInspection = editForm.date_of_inspection || "";
  const timeOfInspection = editForm.time_of_inspection || "";

  const requestNote = editForm.request_note || "";
  const consultantComments = editForm.consultant_comments || "";
const decision = (editForm.decision || "NONE").toUpperCase();
//   const decisionLabel = useMemo(() => {
//   const d = DECISIONS.find((x) => x.value === decision);
//   if (!d || d.value === "NONE") return "";
//   return d.label; // e.g. "B - Proceed With Works As Noted Above"
// }, [decision]);

// ✅ Decision value + label (safe even before editForm is ready)


  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "20px auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        background: bgColor,
        color: textColor,
        borderRadius: 12,
      }}
    >
      {/* Top buttons */}
      <button
        onClick={handleBack}
        style={{
          marginBottom: 16,
          padding: "8px 16px",
          background: "#6b7280",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: 900,
        }}
      >
        ← Back to Inbox
      </button>

      <button
        type="button"
        onClick={toggleEdit}
        style={{
          padding: "8px 14px",
          fontSize: "12px",
          background: isEditing ? "#6b7280" : ORANGE,
          color: isEditing ? "#fff" : "#222",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: 900,
          marginLeft: 8,
        }}
      >
        {isEditing ? "Cancel Edit" : "Edit Mode"}
      </button>

      <button
        type="button"
        onClick={handleExportPdf}
        disabled={pdfLoading}
        style={{
          ...btnExportStyle,
          marginLeft: 8,
          opacity: pdfLoading ? 0.75 : 1,
          cursor: pdfLoading ? "not-allowed" : "pointer",
        }}
      >
        {pdfLoading ? "⏳ Generating PDF..." : "⬇ Export PDF"}
      </button>

      {/* Meta info */}
      <div style={{ marginTop: 10, marginBottom: 16, fontSize: 13 }}>
        <div>
          <strong>WIR ID:</strong> #{wir.id}
        </div>
        <div>
          <strong>Status:</strong> {wir.status || "-"}
        </div>
        <div>
          <strong>Project ID:</strong> {wir.project_id || "-"}
        </div>
        <div>
          <strong>Created By:</strong> {wir.created_by_name || "-"}
        </div>
        <div>
          <strong>Current Assignee:</strong> {wir.current_assignee_name || "-"}
        </div>
        <div>
          <strong>Created At:</strong>{" "}
          {wir.created_at ? new Date(wir.created_at).toLocaleString() : "-"}
        </div>
      </div>

      {/* ✅ Project editing (project_id) */}
      {isEditing && (
        <div style={{ ...cardStyle, background: cardColor, border: `1px solid ${borderColor}` }}>
          <h3 style={{ marginTop: 0 }}>⚙️ Edit Project</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 900, marginBottom: 6 }}>Project *</div>
              <select
                name="project_id"
                value={editForm.project_id}
                onChange={handleEditChange}
                disabled={projectsLoading}
                style={{ width: "100%", padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
              >
                <option value="">Select project</option>
                {(projects || []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name || p.project_name || `Project #${p.id}`}
                  </option>
                ))}
              </select>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 6 }}>
                (Project change tabhi chalega jab backend <code>project_id</code> update allow kare.)
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 900, marginBottom: 6 }}>
                Project Display Name (Header)
              </div>
              <input
                name="project_display_name"
                value={editForm.project_display_name}
                onChange={handleEditChange}
                style={{ width: "100%", padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
                placeholder="Project name shown on WIR"
              />
            </div>
          </div>
        </div>
      )}

      {/* ✅ Forward */}
      <div style={{ ...cardStyle, background: cardColor, border: `1px solid ${borderColor}` }}>
        <h3 style={{ marginTop: 0 }}>📤 Forward WIR</h3>

        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 10, alignItems: "center" }}>
          <div style={{ fontSize: 12, fontWeight: 900 }}>Select user</div>
          <select
            value={selectedForwardUserId}
            onChange={(e) => setSelectedForwardUserId(e.target.value)}
            style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
          >
            <option value="">Select user</option>
            {(forwardUsers || []).map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 900, marginBottom: 6 }}>Comment (optional)</div>
          <textarea
            rows={2}
            value={forwardComment}
            onChange={(e) => setForwardComment(e.target.value)}
            style={{ width: "100%", padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
            placeholder="Short comment..."
          />
        </div>

        <button
          type="button"
          onClick={handleForward}
          disabled={actionLoading}
          style={{ ...btnSmall, marginTop: 10, background: actionLoading ? "#d1d5db" : ORANGE }}
        >
          {actionLoading ? "Forwarding..." : "Forward"}
        </button>
      </div>

      {/* ✅ Logos upload */}
      <div style={{ ...cardStyle, background: cardColor, border: `1px solid ${borderColor}` }}>
        <h3 style={{ marginTop: 0 }}>🖼️ Header Logos (Client / PMC / Contractor)</h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          <div style={logoBox}>
            <div style={logoPreview}>
              {wir.client_logo ? (
<img
  src={wir.client_logo}
  alt="Client Logo"
  style={{
    ...logoImg,
    objectFit: logoAdj.client?.fit || "contain",
    transform: `translate(${logoAdj.client?.x || 0}px, ${logoAdj.client?.y || 0}px) scale(${logoAdj.client?.scale || 1})`,
    transformOrigin: "center",
  }}
/>
              ) : (
                <span style={logoPlaceholder}>Client Logo</span>
              )}
            </div>
            <div style={{ fontSize: 12, fontWeight: 900, marginBottom: 6 }}>Client Logo</div>
            <input type="file" accept="image/*" onChange={(e) => setClientLogoFile(e.target.files?.[0] || null)} />
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => uploadLogo("client_logo", clientLogoFile)}
              style={{ ...btnSmall, marginTop: 10 }}
            >
              Upload Client Logo
            </button>
          </div>

          <div style={logoBox}>
            <div style={logoPreview}>
              {wir.pmc_logo ? (
<img
  src={wir.pmc_logo}
  alt="PMC Logo"
  style={{
    ...logoImg,
    objectFit: logoAdj.pmc?.fit || "contain",
    transform: `translate(${logoAdj.pmc?.x || 0}px, ${logoAdj.pmc?.y || 0}px) scale(${logoAdj.pmc?.scale || 1})`,
    transformOrigin: "center",
  }}
/>
              ) : (
                <span style={{ ...logoPlaceholder, color: "#2563eb" }}>PMC&apos;s Logo</span>
              )}
            </div>
            <div style={{ fontSize: 12, fontWeight: 900, marginBottom: 6 }}>PMC Logo</div>
            <input type="file" accept="image/*" onChange={(e) => setPmcLogoFile(e.target.files?.[0] || null)} />
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => uploadLogo("pmc_logo", pmcLogoFile)}
              style={{ ...btnSmall, marginTop: 10 }}
            >
              Upload PMC Logo
            </button>
          </div>

          <div style={logoBox}>
            <div style={logoPreview}>
              {wir.contractor_logo ? (
<img
  src={wir.contractor_logo}
  alt="Contractor Logo"
  style={{
    ...logoImg,
    objectFit: logoAdj.contractor?.fit || "contain",
    transform: `translate(${logoAdj.contractor?.x || 0}px, ${logoAdj.contractor?.y || 0}px) scale(${logoAdj.contractor?.scale || 1})`,
    transformOrigin: "center",
  }}
/>
              ) : (
                <span style={{ ...logoPlaceholder, color: "#16a34a" }}>Contractor&apos;s Logo</span>
              )}
            </div>
            <div style={{ fontSize: 12, fontWeight: 900, marginBottom: 6 }}>Contractor Logo</div>
            <input type="file" accept="image/*" onChange={(e) => setContractorLogoFile(e.target.files?.[0] || null)} />
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => uploadLogo("contractor_logo", contractorLogoFile)}
              style={{ ...btnSmall, marginTop: 10 }}
            >
              Upload Contractor Logo
            </button>
          </div>
        </div>
      </div>

      {/* ===================== PDF AREA ===================== */}
      <div ref={pdfRef}>
        <div
          id="wir-pdf-sheet"
          style={{
            border: "2px solid #000",
            marginTop: 14,
            marginBottom: 20,
            background: "#fff",
            color: "#000",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* watermark */}
          <div
            style={{
              position: "absolute",
              top: 260,
              left: "50%",
              transform: "translateX(-50%) rotate(-28deg)",
              fontSize: 90,
              fontWeight: 900,
              letterSpacing: 4,
              color: "rgba(0,0,0,0.12)",
              zIndex: 0,
              pointerEvents: "none",
              userSelect: "none",
              whiteSpace: "nowrap",
            }}
          >
          </div>

          <div style={{ position: "relative", zIndex: 1 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <colgroup>
                <col style={{ width: "25%" }} />
                <col style={{ width: "25%" }} />
                <col style={{ width: "25%" }} />
                <col style={{ width: "25%" }} />
              </colgroup>

              <tbody>
                {/* Top logos row */}
                {/* Top logos row */}
<tr>
  {/* LEFT: Client (colSpan 2) */}
  <td style={tdBox} colSpan={2}>
    <div
      style={{
        width: 140,
        height: 70,
        border: "2px solid #000",
        borderRadius: 8,
        overflow: "hidden",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {wir.client_logo ? (
        <img
          src={wir.client_logo}
          alt="Client"
          style={{
            width: "100%",
            height: "100%",
            objectFit: logoAdj.client?.fit || "contain",
            transform: `translate(${logoAdj.client?.x || 0}px, ${logoAdj.client?.y || 0}px) scale(${logoAdj.client?.scale || 1})`,
            transformOrigin: "center",
            display: "block",
          }}
        />
      ) : (
        <span style={{ fontWeight: 900 }}>Client Logo</span>
      )}
    </div>
  </td>

  {/* CENTER: PMC */}
  <td style={{ ...tdBox, textAlign: "center" }}>
    <div
      style={{
        width: 140,
        height: 70,
        margin: "0 auto",
        border: "2px solid #000",
        borderRadius: 8,
        overflow: "hidden",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {wir.pmc_logo ? (
        <img
          src={wir.pmc_logo}
          alt="PMC"
          style={{
            width: "100%",
            height: "100%",
            objectFit: logoAdj.pmc?.fit || "contain",
            transform: `translate(${logoAdj.pmc?.x || 0}px, ${logoAdj.pmc?.y || 0}px) scale(${logoAdj.pmc?.scale || 1})`,
            transformOrigin: "center",
            display: "block",
          }}
        />
      ) : (
        <div style={{ fontWeight: 900, color: "#2563eb", textAlign: "center" }}>
          PMC&apos;s<br />Logo
        </div>
      )}
    </div>
  </td>

  {/* RIGHT: Contractor */}
  <td style={{ ...tdBox, textAlign: "center" }}>
    <div
      style={{
        width: 140,
        height: 70,
        margin: "0 auto",
        border: "2px solid #000",
        borderRadius: 8,
        overflow: "hidden",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {wir.contractor_logo ? (
        <img
          src={wir.contractor_logo}
          alt="Contractor"
          style={{
            width: "100%",
            height: "100%",
            objectFit: logoAdj.contractor?.fit || "contain",
            transform: `translate(${logoAdj.contractor?.x || 0}px, ${logoAdj.contractor?.y || 0}px) scale(${logoAdj.contractor?.scale || 1})`,
            transformOrigin: "center",
            display: "block",
          }}
        />
      ) : (
        <div style={{ fontWeight: 900, color: "#16a34a", textAlign: "center" }}>
          Contractor&apos;s<br />Logo
        </div>
      )}
    </div>
  </td>
</tr>


                {/* Project + Title */}
                <tr>
                  <td style={{ ...tdThick, fontWeight: 900 }} colSpan={2}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{ minWidth: 70 }}>Project:</div>
                      {isEditing ? (
                        <input
                          type="text"
                          name="project_display_name"
                          value={editForm.project_display_name || ""}
                          onChange={handleEditChange}
                          style={excelInput}
                        />
                      ) : (
                        <div style={{ fontWeight: 900 }}>{projectDisplayName || "—"}</div>
                      )}
                    </div>
                  </td>

                  <td style={{ ...tdThick, textAlign: "center", fontWeight: 900 }} colSpan={2}>
                    {isEditing ? (
                      <input
                        type="text"
                        name="wir_title"
                        value={editForm.wir_title || ""}
                        onChange={handleEditChange}
                        style={{ ...excelInput, textAlign: "center" }}
                      />
                    ) : (
                      <div style={{ fontWeight: 900 }}>{wirTitle}</div>
                    )}
                  </td>
                </tr>

                {/* Dates + No */}
                <tr>
                  <td style={hdrLabelCell}>Date of Submission:</td>
                  <td style={hdrValueCell}>
                    {isEditing ? (
                      <input type="date" name="date_of_submission" value={editForm.date_of_submission || ""} onChange={handleEditChange} style={hdrInput} />
                    ) : (
                      <span style={hdrText}>{fmtDDMonYYYY(dateOfSubmission) || "—"}</span>
                    )}
                  </td>

                  <td style={hdrLabelCell}>Inspection Request No. :</td>
                  <td style={hdrValueCell}>
                    {isEditing ? (
                      <input type="text" name="inspection_request_no" value={editForm.inspection_request_no || ""} onChange={handleEditChange} style={hdrInput} />
                    ) : (
                      <span style={hdrText}>{inspectionRequestNo || "—"}</span>
                    )}
                  </td>
                </tr>

                <tr>
                  <td style={hdrLabelCell}>Date Of Inspection:</td>
                  <td style={hdrValueCell}>
                    {isEditing ? (
                      <input type="date" name="date_of_inspection" value={editForm.date_of_inspection || ""} onChange={handleEditChange} style={hdrInput} />
                    ) : (
                      <span style={hdrText}>{dateOfInspection ? fmtDDMonYYYY(dateOfInspection) : "—"}</span>
                    )}
                  </td>

                  <td style={hdrLabelCell}>Time Of Inspection:</td>
                  <td style={hdrValueCell}>
                    {isEditing ? (
                      <input type="time" name="time_of_inspection" value={editForm.time_of_inspection || ""} onChange={handleEditChange} style={hdrInput} />
                    ) : (
                      <span style={hdrText}>{timeOfInspection || "—"}</span>
                    )}
                  </td>
                </tr>

                {/* Description */}
                <tr>
                  <td style={{ ...tdBox, fontWeight: 900 }} colSpan={4}>
                    Description of Work to be Inspected
                  </td>
                </tr>
                <tr>
                  <td style={{ ...tdBox, height: 90 }} colSpan={4}>
                    {isEditing ? (
                      <textarea
                        name="description_of_work"
                        value={editForm.description_of_work || ""}
                        onChange={handleEditChange}
                        rows={4}
                        style={{ ...txtAreaSmall, width: "100%" }}
                      />
                    ) : (
                      <div style={{ whiteSpace: "pre-wrap", fontWeight: 800 }}>{editForm.description_of_work || "—"}</div>
                    )}
                  </td>
                </tr>

                {/* Location/Gridlines + Approved WMS */}
                <tr>
                  <td style={tdBox} colSpan={2}>
                    <span style={{ fontWeight: 900 }}>Location/Gridlines</span>
                    {isEditing ? (
                      <input
                        type="text"
                        name="location_gridlines"
                        value={editForm.location_gridlines || ""}
                        onChange={handleEditChange}
                        style={{ ...lineInput, marginLeft: 8 }}
                      />
                    ) : (
                      <span style={{ marginLeft: 8, textDecoration: "underline", fontWeight: 900 }}>
                        {editForm.location_gridlines || " "}
                      </span>
                    )}
                  </td>

                  <td style={tdBox} colSpan={2}>
                    <span style={{ fontWeight: 900 }}>Approved WMS Ref. No:</span>
                    {isEditing ? (
                      <input
                        type="text"
                        name="approved_wms_ref_no"
                        value={editForm.approved_wms_ref_no || ""}
                        onChange={handleEditChange}
                        style={{ ...lineInput, marginLeft: 8 }}
                      />
                    ) : (
                      <span style={{ marginLeft: 8, textDecoration: "underline", fontWeight: 900 }}>
                        {editForm.approved_wms_ref_no || " "}
                      </span>
                    )}
                  </td>
                </tr>

                {/* Zone/Area + Element */}
                <tr>
                  <td style={tdBox} colSpan={2}>
                    <span style={{ fontWeight: 900 }}>Zone/Area</span>
                    {isEditing ? (
                      <input type="text" name="zone_area" value={editForm.zone_area || ""} onChange={handleEditChange} style={{ ...lineInput, marginLeft: 8 }} />
                    ) : (
                      <span style={{ marginLeft: 8, textDecoration: "underline", fontWeight: 900 }}>
                        {editForm.zone_area || " "}
                      </span>
                    )}
                  </td>

                  <td style={tdBox} colSpan={2}>
                    <span style={{ fontWeight: 900 }}>Element</span>
                    {isEditing ? (
                      <input type="text" name="element" value={editForm.element || ""} onChange={handleEditChange} style={{ ...lineInput, marginLeft: 8 }} />
                    ) : (
                      <span style={{ marginLeft: 8, textDecoration: "underline", fontWeight: 900 }}>
                        {editForm.element || " "}
                      </span>
                    )}
                  </td>
                </tr>

                {/* Request note + Attachments flags */}
                <tr>
                  <td style={{ ...tdBox, height: 190 }} colSpan={4}>
                    <div style={{ fontWeight: 900, marginBottom: 8 }}>
                      We request for inspection (note):
                      {isEditing ? (
                        <textarea
                          name="request_note"
                          value={editForm.request_note || ""}
                          onChange={handleEditChange}
                          rows={2}
                          style={{ ...txtAreaSmall, width: "100%", marginTop: 6 }}
                        />
                      ) : (
                        <span style={{ textDecoration: "underline", fontWeight: 900, marginLeft: 8 }}>
                          {requestNote || "__________________________"}
                        </span>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 18 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 900, marginBottom: 8 }}>Attachments:</div>

                        {ATT_MAP.map((a) => (
                          <div key={a.key} style={{ marginBottom: 10 }}>
                            <div style={chkRow}>
                              {isEditing ? (
  <>
    <input
      type="checkbox"
      name={a.flag}
      checked={!!editForm[a.flag]}
      onChange={handleEditChange}
      style={{ marginRight: 8 }}
    />
    <span style={chkText}>{a.label}</span>
    {!!editForm[a.flag] ? <span style={{ marginLeft: 8, fontWeight: 900 }}>✓</span> : null}
  </>
) : (
  <>
    <Box checked={!!editForm[a.flag]} />
    <span style={chkText}>{a.label}</span>
  </>
)}

                            </div>

                            {/* ✅ NEW: if checked + edit mode => show upload input INSIDE SHEET */}
                            {isEditing && !!editForm[a.flag] && (
                              <div style={{ marginLeft: 22, padding: 8, border: "1px dashed #000", borderRadius: 8 }}>
                                <div style={{ fontSize: 11, fontWeight: 900, marginBottom: 6 }}>
                                  Upload files for {a.category}
                                </div>

                                <input
                                  key={sheetUploads?.[a.category]?.inputKey || 0}
                                  type="file"
                                  multiple
                                  onChange={(e) => setSheetFiles(a.category, Array.from(e.target.files || []))}
                                />

                                {(sheetUploads?.[a.category]?.files || []).length > 0 && (
                                  <ul style={{ marginTop: 6, fontSize: 11, paddingLeft: 16 }}>
                                    {(sheetUploads[a.category].files || []).map((f, i) => (
                                      <li key={i}>{f.name}</li>
                                    ))}
                                  </ul>
                                )}

                                <div style={{ marginTop: 8 }}>
                                  <div style={{ fontSize: 10, fontWeight: 900 }}>Display Name (optional)</div>
                                  <input
                                    type="text"
                                    value={sheetUploads?.[a.category]?.name || ""}
                                    onChange={(e) => setSheetMeta(a.category, "name", e.target.value)}
                                    style={{ ...hdrInput, fontWeight: 900, marginTop: 4 }}
                                    placeholder="e.g. ITP / Checklist"
                                  />
                                </div>

                                <div style={{ marginTop: 8 }}>
                                  <div style={{ fontSize: 10, fontWeight: 900 }}>Description (optional)</div>
                                  <textarea
                                    rows={2}
                                    value={sheetUploads?.[a.category]?.description || ""}
                                    onChange={(e) => setSheetMeta(a.category, "description", e.target.value)}
                                    style={{ ...txtAreaSmall, width: "100%", marginTop: 4 }}
                                    placeholder="Short note..."
                                  />
                                </div>

                                <div style={{ marginTop: 6, fontSize: 10, color: "#111" }}>
                                  (Save Changes pe files upload ho jayengi)
                                </div>
                              </div>
                            )}
                          </div>
                        ))}

                        {isEditing && (
                          <div style={{ marginTop: 6 }}>
                            <div style={{ fontSize: 10, fontWeight: 900 }}>Other Documents label (if Other ticked)</div>
                            <input
                              type="text"
                              name="att_other_text"
                              value={editForm.att_other_text || ""}
                              onChange={handleEditChange}
                              style={{ ...lineInput, marginTop: 4 }}
                              placeholder="Other document name..."
                            />
                          </div>
                        )}
                      </div>

                      <div style={{ width: 160, display: "flex", justifyContent: "flex-end", alignItems: "flex-end" }}>
                        <div style={{ fontWeight: 900 }}>{fmtDDMonYYYY(dateOfSubmission) || ""}</div>
                      </div>
                    </div>
                  </td>
                </tr>

                {/* Contractor signature display */}
                <tr>
                  <td style={tdBox} colSpan={3}>
                    <div style={{ fontWeight: 900, fontSize: 10 }}>Contractor Rep Name(Signature)</div>

                    {isEditing ? (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 180px", gap: 10, marginTop: 6 }}>
                        <input
                          type="text"
                          name="contractor_rep_name"
                          value={editForm.contractor_rep_name || ""}
                          onChange={handleEditChange}
                          style={hdrInput}
                          placeholder="Contractor Rep Name"
                        />
                        <input
                          type="date"
                          name="contractor_rep_sign_date"
                          value={editForm.contractor_rep_sign_date || ""}
                          onChange={handleEditChange}
                          style={hdrInput}
                        />
                      </div>
                    ) : (
                      <div style={{ marginTop: 6, fontWeight: 900 }}>{editForm.contractor_rep_name || ""}</div>
                    )}

                    <div style={{ marginTop: 8, minHeight: 55 }}>
                      {wir.contractor_rep_sign ? (
                        <img
                          src={wir.contractor_rep_sign}
                          alt="Contractor Signature"
                          style={{ maxWidth: 180, maxHeight: 55, objectFit: "contain" }}
                        />
                      ) : (
                        <div style={{ borderBottom: "1px solid #000", height: 34 }} />
                      )}
                    </div>
                  </td>

                  <td style={tdBox}>
                    <div style={{ fontWeight: 900, fontSize: 10 }}>Date</div>
                    <div style={{ marginTop: 18, textAlign: "right", fontWeight: 900 }}>
                      {wir.contractor_rep_sign_date ? fmtDDMonYYYY(wir.contractor_rep_sign_date) : ""}
                    </div>
                    <div style={{ marginTop: 6, borderBottom: "1px solid #000" }} />
                  </td>
                </tr>

                {/* Consultant comments */}
                <tr>
                  <td style={{ ...tdBox, background: "#e5e7eb", fontWeight: 900 }} colSpan={4}>
                    Consultant&apos;s Comments (Response)
                  </td>
                </tr>
                <tr>
                  <td style={{ ...tdBox, height: 220, padding: 8 }} colSpan={4}>
                    {isEditing ? (
                      <>
                        <textarea
                          name="consultant_comments"
                          value={editForm.consultant_comments || ""}
                          onChange={handleEditChange}
                          rows={6}
                          style={{ ...txtAreaSmall, width: "100%" }}
                        />
                        <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "180px 1fr", gap: 10, alignItems: "center" }}>
                          <div style={{ fontWeight: 900 }}>Decision (Outcome)</div>
                          <select
                            name="decision"
                            value={editForm.decision || "NONE"}
                            onChange={handleEditChange}
                            style={{ ...hdrInput, fontWeight: 900 }}
                          >
                            {DECISIONS.map((d) => (
                              <option key={d.value} value={d.value}>
                                {d.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    ) : (
                      <>
                        {consultantComments ? (
                          <div style={{ fontSize: 11, marginBottom: 10, fontWeight: 800, whiteSpace: "pre-wrap" }}>
                            {consultantComments}
                          </div>
                        ) : null}

                        <div style={{ fontWeight: 900, marginTop: 6 }}>Decision:</div>
<div style={{ fontWeight: 900, textDecoration: "underline" }}>
  {decisionLabel}
</div>


                        {Array.from({ length: 10 }).map((_, i) => (
                          <div key={i} style={{ borderBottom: "1px dotted #000", height: 16 }} />
                        ))}
                      </>
                    )}
                  </td>
                </tr>

                {/* Required actions by contractor */}
                <tr>
                  <td style={{ ...tdBox, fontWeight: 900 }} colSpan={4}>
                    Required Action(s) By The Contractor:
                  </td>
                </tr>
                <tr>
                  <td style={{ ...tdBox, height: 80 }} colSpan={4}>
                    {isEditing ? (
                      <textarea
                        name="contractor_required_actions"
                        value={editForm.contractor_required_actions || ""}
                        onChange={handleEditChange}
                        rows={3}
                        style={{ ...txtAreaSmall, width: "100%" }}
                      />
                    ) : (
                      <div style={{ whiteSpace: "pre-wrap", fontWeight: 800 }}>
                        {editForm.contractor_required_actions || ""}
                      </div>
                    )}
                  </td>
                </tr>

                {/* Inspector signature display */}
                <tr>
                  <td style={tdBox} colSpan={3}>
                    <div style={{ fontWeight: 900, fontSize: 10 }}>PMC/Inspector Name(Signature)</div>

                    {isEditing ? (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 180px", gap: 10, marginTop: 6 }}>
                        <input
                          type="text"
                          name="inspector_name"
                          value={editForm.inspector_name || ""}
                          onChange={handleEditChange}
                          style={hdrInput}
                          placeholder="Inspector Name"
                        />
                        <input
                          type="date"
                          name="inspector_sign_date"
                          value={editForm.inspector_sign_date || ""}
                          onChange={handleEditChange}
                          style={hdrInput}
                        />
                      </div>
                    ) : (
                      <div style={{ marginTop: 6, fontWeight: 900 }}>{editForm.inspector_name || ""}</div>
                    )}

                    <div style={{ marginTop: 8, minHeight: 55 }}>
                      {wir.inspector_sign ? (
                        <img
                          src={wir.inspector_sign}
                          alt="Inspector Signature"
                          style={{ maxWidth: 180, maxHeight: 55, objectFit: "contain" }}
                        />
                      ) : (
                        <div style={{ borderBottom: "1px solid #000", height: 34 }} />
                      )}
                    </div>
                  </td>

                  <td style={tdBox}>
                    <div style={{ fontWeight: 900, fontSize: 10 }}>Date</div>
                    <div style={{ marginTop: 18, textAlign: "right", fontWeight: 900 }}>
                      {wir.inspector_sign_date ? fmtDDMonYYYY(wir.inspector_sign_date) : ""}
                    </div>
                    <div style={{ marginTop: 6, borderBottom: "1px solid #000" }} />
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Save Area inside sheet */}
            {isEditing && (
              <div style={{ padding: 15, borderTop: "2px solid #000" }}>
                <button
                  type="button"
                  onClick={handleUpdateDetails}
                  disabled={actionLoading}
                  style={{
                    padding: "10px 24px",
                    fontSize: 14,
                    fontWeight: 900,
                    background: actionLoading ? "#ccc" : "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    cursor: actionLoading ? "not-allowed" : "pointer",
                    marginRight: 10,
                  }}
                >
                  {actionLoading ? "Updating..." : "💾 Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={toggleEdit}
                  style={{
                    padding: "10px 24px",
                    fontSize: 14,
                    fontWeight: 900,
                    background: "#6b7280",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Extra Fields editable */}
      <div style={{ ...cardStyle, background: cardColor, border: `1px solid ${borderColor}` }}>
        <h3 style={{ marginTop: 0 }}>Extra Fields</h3>
        <p style={{ fontSize: 12, color: "#6b7280", marginTop: 0 }}>
          <code>project_display_name</code>, <code>wir_title</code>, <code>request_note</code>,{" "}
          <code>contractor_required_actions</code>
        </p>

        {!isEditing ? (
          <>
            {Object.keys(extra || {}).length ? (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    <th style={miniTh}>Key</th>
                    <th style={miniTh}>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(extra).map((k) => (
                    <tr key={k}>
                      <td style={miniTdKey}>{k}</td>
                      <td style={miniTdVal}>
                        {extra[k] === null || extra[k] === undefined ? "" : String(extra[k])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ fontSize: 13, color: "#6b7280" }}>No extra fields.</div>
            )}
          </>
        ) : (
          <>
            {extraRows.map((row, idx) => (
              <div
                key={idx}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr auto",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <input
                  type="text"
                  value={row.key}
                  onChange={(e) => handleExtraRowChange(idx, "key", e.target.value)}
                  style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
                  placeholder="Key"
                />
                <input
                  type="text"
                  value={row.value}
                  onChange={(e) => handleExtraRowChange(idx, "value", e.target.value)}
                  style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
                  placeholder="Value"
                />
                <button
                  type="button"
                  onClick={() => removeExtraRow(idx)}
                  disabled={extraRows.length === 1}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "none",
                    background: extraRows.length === 1 ? "#ccc" : ORANGE,
                    cursor: extraRows.length === 1 ? "not-allowed" : "pointer",
                    fontWeight: 900,
                  }}
                >
                  ✕
                </button>
              </div>
            ))}

            <button type="button" onClick={addExtraRow} style={btnSmall}>
              + Add Extra Field
            </button>
          </>
        )}
      </div>

      {/* ✅ Attachments (existing list + bottom upload card) */}
      <div style={{ ...cardStyle, background: cardColor, border: `1px solid ${borderColor}` }}>
        <h3 style={{ marginTop: 0 }}>📎 Attachments (Visible from Create + New Upload)</h3>

        {Array.isArray(wir.attachments) && wir.attachments.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
            {["KEY_PLAN", "CHECKLIST", "CLEARANCE", "DRAWING", "OTHER", "UNKNOWN"].map((cat) => (
              <div key={cat} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, background: "#fff" }}>
                <div style={{ fontWeight: 900, marginBottom: 8 }}>{cat}</div>
                {(attachmentsByCategory[cat] || []).length ? (
                  <ul style={{ fontSize: 13, paddingLeft: 18, margin: 0 }}>
                    {(attachmentsByCategory[cat] || []).map((att) => (
                      <li key={att.id} style={{ marginBottom: 8 }}>
                        <a href={att.file} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 900 }}>
                          {att.name || (att.file && att.file.split("/").slice(-1)[0]) || "Attachment"}
                        </a>
                        {att.description ? <span style={{ marginLeft: 6, color: "#555" }}>– {att.description}</span> : null}
                        <div style={{ fontSize: 11, color: "#777" }}>
                          {att.uploaded_by_name ? <>By {att.uploaded_by_name} · </> : null}
                          {att.created_at ? new Date(att.created_at).toLocaleString() : ""}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ fontSize: 12, color: "#6b7280" }}>No files</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 13, color: "#777", marginBottom: 12 }}>No attachments yet.</p>
        )}

        {/* <div style={{ borderTop: "1px dashed #e5e7eb", paddingTop: 12, marginTop: 14 }}>
          <h4 style={{ fontSize: 14, marginBottom: 8 }}>Upload new attachments</h4>

          <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 10, alignItems: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 900 }}>Category</div>
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
            >
              <option value="KEY_PLAN">KEY_PLAN</option>
              <option value="CHECKLIST">CHECKLIST</option>
              <option value="CLEARANCE">CLEARANCE</option>
              <option value="DRAWING">DRAWING</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>

          <div style={{ marginTop: 10 }}>
            <input
              key={attInputKey}
              type="file"
              multiple
              onChange={(e) => setAttachmentsFiles(Array.from(e.target.files || []))}
            />
            {attachmentsFiles.length > 0 && (
              <ul style={{ marginTop: 6, fontSize: 12 }}>
                {attachmentsFiles.map((file, idx) => (
                  <li key={idx}>{file.name}</li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ marginTop: 10 }}>
            <label style={{ fontSize: 12, fontWeight: 900 }}>Display Name (optional)</label>
            <input
              type="text"
              value={attachmentName}
              onChange={(e) => setAttachmentName(e.target.value)}
              style={{ width: "100%", padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
              placeholder="e.g. ITP / Checklist"
            />
          </div>

          <div style={{ marginTop: 10 }}>
            <label style={{ fontSize: 12, fontWeight: 900 }}>Description (optional)</label>
            <textarea
              rows={2}
              value={attachmentDescription}
              onChange={(e) => setAttachmentDescription(e.target.value)}
              style={{ width: "100%", padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
              placeholder="Short note..."
            />
          </div>

          <button
            type="button"
            onClick={handleUploadAttachments}
            disabled={actionLoading}
            style={{ ...btnSmall, marginTop: 10, background: actionLoading ? "#d1d5db" : ORANGE }}
          >
            {actionLoading ? "Uploading..." : "Upload Attachments"}
          </button>
        </div> */}
      </div>

      {/* ✅ Signatures Update (2) */}
      <div style={{ ...cardStyle, background: cardColor, border: `1px solid ${borderColor}` }}>
        <h3 style={{ marginTop: 0 }}>✍️ Signatures (Visible from Create + Update)</h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 12 }}>
          {/* Contractor */}
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, background: "#fff" }}>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>Contractor Rep</div>

            <div style={{ fontSize: 12, marginBottom: 8 }}>
              <div><b>Name:</b> {wir.contractor_rep_name || "-"}</div>
              <div><b>Date:</b> {wir.contractor_rep_sign_date ? fmtDDMonYYYY(wir.contractor_rep_sign_date) : "-"}</div>
            </div>

            {wir.contractor_rep_sign ? (
              <img
                src={wir.contractor_rep_sign}
                alt="Contractor Signature"
                style={{ maxWidth: "100%", maxHeight: 120, objectFit: "contain", border: "1px solid #e5e7eb", borderRadius: 10 }}
              />
            ) : (
              <div style={{ fontSize: 12, color: "#6b7280" }}>No contractor signature yet.</div>
            )}

            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 900, marginBottom: 6 }}>Update Contractor Signature</div>

              <input
                type="text"
                name="contractor_rep_name"
                value={editForm.contractor_rep_name || ""}
                onChange={handleEditChange}
                placeholder="Contractor Rep Name"
                style={{ width: "100%", padding: 10, border: "1px solid #ccc", borderRadius: 8, marginBottom: 8 }}
              />

              <input
                type="date"
                name="contractor_rep_sign_date"
                value={editForm.contractor_rep_sign_date || ""}
                onChange={handleEditChange}
                style={{ width: "100%", padding: 10, border: "1px solid #ccc", borderRadius: 8, marginBottom: 8 }}
              />

              <SignaturePadField label="" fileValue={contractorSignFile} onChangeFile={setContractorSignFile} />

              <button
                type="button"
                onClick={saveContractorSignature}
                disabled={actionLoading}
                style={{ ...btnSmall, marginTop: 10, background: actionLoading ? "#d1d5db" : ORANGE }}
              >
                {actionLoading ? "Saving..." : "Save Contractor Signature"}
              </button>
            </div>
          </div>

          {/* Inspector */}
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, background: "#fff" }}>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>PMC / Inspector</div>

            <div style={{ fontSize: 12, marginBottom: 8 }}>
              <div><b>Name:</b> {wir.inspector_name || "-"}</div>
              <div><b>Date:</b> {wir.inspector_sign_date ? fmtDDMonYYYY(wir.inspector_sign_date) : "-"}</div>
            </div>

            {wir.inspector_sign ? (
              <img
                src={wir.inspector_sign}
                alt="Inspector Signature"
                style={{ maxWidth: "100%", maxHeight: 120, objectFit: "contain", border: "1px solid #e5e7eb", borderRadius: 10 }}
              />
            ) : (
              <div style={{ fontSize: 12, color: "#6b7280" }}>No inspector signature yet.</div>
            )}

            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 900, marginBottom: 6 }}>Update Inspector Signature</div>

              <input
                type="text"
                name="inspector_name"
                value={editForm.inspector_name || ""}
                onChange={handleEditChange}
                placeholder="Inspector Name"
                style={{ width: "100%", padding: 10, border: "1px solid #ccc", borderRadius: 8, marginBottom: 8 }}
              />

              <input
                type="date"
                name="inspector_sign_date"
                value={editForm.inspector_sign_date || ""}
                onChange={handleEditChange}
                style={{ width: "100%", padding: 10, border: "1px solid #ccc", borderRadius: 8, marginBottom: 8 }}
              />

              <SignaturePadField label="" fileValue={inspectorSignFile} onChangeFile={setInspectorSignFile} />

              <button
                type="button"
                onClick={saveInspectorSignature}
                disabled={actionLoading}
                style={{ ...btnSmall, marginTop: 10, background: actionLoading ? "#d1d5db" : ORANGE }}
              >
                {actionLoading ? "Saving..." : "Save Inspector Signature"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

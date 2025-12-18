import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTheme } from "../ThemeContext";
import SignaturePadField from "../components/SignaturePadField";

import {
  getProjectsForCurrentUser,
  getUsersByProject,
  createMIRFull,
} from "../api";

const EMPTY_EXTRA_FIELD = { key: "", value: "" };

/* ---------------- THEME PALETTE ---------------- */
const ORANGE = "#ffbe63";
const BG_OFFWHITE = "#fcfaf7";

/* ---------------- TABLE CELL STYLES ---------------- */
const styles = {
  labelCell: {
    border: "1px solid #000",
    padding: "8px",
    fontWeight: "bold",
    background: BG_OFFWHITE,
    fontSize: "12px",
  },
  inputCell: {
    border: "1px solid #000",
    padding: "6px",
    background: "#fff",
  },
  input: {
    width: "100%",
    border: "none",
    outline: "none",
    padding: "4px",
    fontSize: "13px",
    background: "transparent",
  },
  textarea: {
    width: "100%",
    border: "none",
    outline: "none",
    padding: "4px",
    fontSize: "13px",
    resize: "vertical",
    background: "transparent",
    fontFamily: "Arial, sans-serif",
  },
  smallInput: {
    width: "100%",
    border: "none",
    outline: "none",
    padding: "2px",
    fontSize: "12px",
    background: "transparent",
    textAlign: "center",
  },
};

export default function MIRCreatePage() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const bgColor = theme === "dark" ? "#191922" : BG_OFFWHITE;
  const cardColor = theme === "dark" ? "#23232c" : "#fff";
  const borderColor = ORANGE;
  const textColor = theme === "dark" ? "#fff" : "#222";

  const [loading, setLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projects, setProjects] = useState([]);

  // --- SIGNATURE STATES ---
  const [storeSignFile, setStoreSignFile] = useState(null);
  const [storeSignName, setStoreSignName] = useState("");
  const [storeSignDate, setStoreSignDate] = useState("");

  const [qcSignFile, setQcSignFile] = useState(null);
  const [qcSignName, setQcSignName] = useState("");
  const [qcSignDate, setQcSignDate] = useState("");

  const [piSignFile, setPiSignFile] = useState(null);
  const [piSignName, setPiSignName] = useState("");
  const [piSignDate, setPiSignDate] = useState("");

  // --- MATERIAL PHOTOS (multi) ---
  const [materialPhotos, setMaterialPhotos] = useState([]);

  // --- ATTACHMENTS (DOCS / FILES) ---
  const [attachments, setAttachments] = useState([]);
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentDescription, setAttachmentDescription] = useState("");
  const [logoFile, setLogoFile] = useState(null);

  // MIR normal form + header fields
  const [form, setForm] = useState({
    project_id: "",
    mir_number: "",
    date: "",
    location: "",
    source_type: "CONTRACTOR",

    // Header / title fields (dynamic)
    ims_title: "INTEGRATED MANAGEMENT SYSTEM",
    report_title: "MATERIAL INSPECTION REPORT",
    company_name: "ARKADE DEVELOPERS LTD",

    manufacturer_name: "",
    certificate_no: "",
    certificate_date: "",
    material_id: "",
    material_name: "",
    material_specification: "",
    material_description: "",
    material_unique_id: "",
    supplier_qc_report_no: "",
    supplier_qc_report_date: "",
    details_of_inspection: "",
    total_qty: "",
    accepted_qty: "",
    rejected_qty: "",
    rejection_reason: "",
    visual_test_result: "",
    criteria_test_result: "",

    // numeric fields for Supplier Test Certificate / Actual inspection
    stc_min_limit: "",
    stc_max_limit: "",
    inspection_min_limit: "",
    inspection_actual_value: "",
    inspection_max_limit: "",
    stc_parameter_name: "",

    stc_doc_reference: "",          // 👈 NEW
    inspection_doc_reference: "",

    // text fields
    process_compatibility_test: "",
    other_required_tests: "",
  });

  const [extraFields, setExtraFields] = useState([EMPTY_EXTRA_FIELD]);

  // project users + selected users
  const [projectUsers, setProjectUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [forwardComment, setForwardComment] = useState("");

  // ---- load projects for dropdown ----
  useEffect(() => {
    async function loadProjects() {
      try {
        setProjectsLoading(true);
        const res = await getProjectsForCurrentUser();
        const rows = res?.data || [];
        setProjects(rows);
      } catch (err) {
        console.error("Failed to load projects", err);
        toast.error("Projects load nahi ho paaye.");
      } finally {
        setProjectsLoading(false);
      }
    }
    loadProjects();
  }, []);

  // ---- project change -> users load ----
  useEffect(() => {
    async function loadUsers() {
      const projectId = form.project_id;

      if (!projectId) {
        setProjectUsers([]);
        setSelectedUserIds([]);
        return;
      }

      setUsersLoading(true);
      try {
        const res = await getUsersByProject(projectId);
        const users = res?.data || [];

        const options = users.map((u) => ({
          id: u.id,
          label:
            u.display_name ||
            [u.first_name, u.last_name].filter(Boolean).join(" ") ||
            u.username ||
            u.email ||
            `User #${u.id}`,
        }));

        setProjectUsers(options);
      } catch (err) {
        console.error("Failed to load project users", err);
        toast.error("Project ke users load nahi ho paaye.");
      } finally {
        setUsersLoading(false);
      }
    }

    loadUsers();
  }, [form.project_id]);

  // ---- helpers ----
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleExtraChange = (index, field, value) => {
    setExtraFields((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addExtraRow = () => {
    setExtraFields((prev) => [...prev, { ...EMPTY_EXTRA_FIELD }]);
  };

  const removeExtraRow = (index) => {
    setExtraFields((prev) => prev.filter((_, i) => i !== index));
  };

  const buildExtraData = () => {
    const extra = {};
    extraFields.forEach((row) => {
      const key = (row.key || "").trim();
      if (!key) return;
      extra[key] = row.value ?? "";
    });
    return extra;
  };

  const parseNumber = (val) => {
    if (val === "" || val === null || val === undefined) return null;
    const num = Number(val);
    return Number.isNaN(num) ? null : num;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.project_id) {
      toast.error("Project select karo.");
      return;
    }

    if (!selectedUserIds.length) {
      toast.error("Kam se kam ek user select karo jise MIR forward hoga.");
      return;
    }

    const forwardToUserId = Number(selectedUserIds[0]);

    const payload = {
      project_id: Number(form.project_id),
      mir_number: form.mir_number || "",
      date: form.date || null,
      location: form.location || "",
      source_type: form.source_type,

      // dynamic headings
      ims_title: form.ims_title || "",
      report_title: form.report_title || "",
      company_name: form.company_name || "",

      manufacturer_name: form.manufacturer_name || "",
      certificate_no: form.certificate_no || "",
      certificate_date: form.certificate_date || null,

      material_id: form.material_id || "",
      material_name: form.material_name || "",
      material_specification: form.material_specification || "",
      material_description: form.material_description || "",
      material_unique_id: form.material_unique_id || "",

      supplier_qc_report_no: form.supplier_qc_report_no || "",
      supplier_qc_report_date: form.supplier_qc_report_date || null,
      details_of_inspection: form.details_of_inspection || "",

      total_qty: parseNumber(form.total_qty),
      accepted_qty: parseNumber(form.accepted_qty),
      rejected_qty: parseNumber(form.rejected_qty),
      rejection_reason: form.rejection_reason || "",
      visual_test_result: form.visual_test_result || "",
      criteria_test_result: form.criteria_test_result || "",

      // numeric fields
      stc_min_limit: parseNumber(form.stc_min_limit),
      stc_max_limit: parseNumber(form.stc_max_limit),
      inspection_min_limit: parseNumber(form.inspection_min_limit),
      inspection_max_limit: parseNumber(form.inspection_max_limit),
      inspection_actual_value: parseNumber(form.inspection_actual_value),
      stc_parameter_name: form.stc_parameter_name || "",


      stc_doc_reference: form.stc_doc_reference || "",
      inspection_doc_reference: form.inspection_doc_reference || "",


      // text fields
      process_compatibility_test: form.process_compatibility_test || "",
      other_required_tests: form.other_required_tests || "",

      extra_data: buildExtraData(),

      // full-create helper fields:
      material_images_caption: "",
      attachments_name: attachmentName || "",
      attachments_description: attachmentDescription || "",

      store_team_name: storeSignName || "",
      store_team_sign_date: storeSignDate || null,

      qc_team_name: qcSignName || "",
      qc_team_sign_date: qcSignDate || null,

      project_incharge_name: piSignName || "",
      project_incharge_sign_date: piSignDate || null,

      forward_to_user_id: forwardToUserId,
      forward_comment: forwardComment || "",
    };

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("data", JSON.stringify(payload));

      if (logoFile) {
        fd.append("logo", logoFile);
      }

      if (storeSignFile) {
        fd.append("store_signature", storeSignFile);
      }
      if (qcSignFile) {
        fd.append("qc_signature", qcSignFile);
      }
      if (piSignFile) {
        fd.append("project_incharge_signature", piSignFile);
      }

      materialPhotos.forEach((file) => {
        fd.append("material_images", file);
      });

      attachments.forEach((file) => {
        fd.append("attachments", file);
      });

      const res = await createMIRFull(fd);
      const data = res.data || res;
      const mirId = data.id;

      if (!mirId) {
        throw new Error("MIR full-create response me id nahi mila.");
      }

      toast.success(
        "MIR full-create success: MIR + logo + signatures + photos + attachments + auto-forward."
      );

      // reset (headings same rehne do)
      setForm((prev) => ({
        ...prev,
        mir_number: "",
        date: "",
        location: "",
        manufacturer_name: "",
        material_id: "",
        material_name: "",
        material_specification: "",
        material_description: "",
        material_unique_id: "",
        supplier_qc_report_no: "",
        supplier_qc_report_date: "",
        details_of_inspection: "",
        total_qty: "",
        accepted_qty: "",
        rejected_qty: "",
        rejection_reason: "",
        visual_test_result: "",
        criteria_test_result: "",
        stc_min_limit: "",
        stc_max_limit: "",
        inspection_min_limit: "",
        inspection_max_limit: "",
        stc_parameter_name: "",

        inspection_actual_value: "",
        stc_doc_reference: "",           // 👈 NEW
        inspection_doc_reference: "",
        process_compatibility_test: "",
        other_required_tests: "",
      }));
      setExtraFields([EMPTY_EXTRA_FIELD]);
      setForwardComment("");
      setMaterialPhotos([]);
      setAttachments([]);
      setAttachmentName("");
      setAttachmentDescription("");

      setStoreSignFile(null);
      setStoreSignName("");
      setStoreSignDate("");
      setQcSignFile(null);
      setQcSignName("");
      setQcSignDate("");
      setPiSignFile(null);
      setPiSignName("");
      setPiSignDate("");
      setLogoFile(null);
    } catch (err) {
      console.error("MIR full-create error", err);
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        "MIR full-create karte time error aaya.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "20px auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        background: bgColor,
        color: textColor,
      }}
    >
{/* FORM SWITCHER (Not part of PDF) */}
<div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
  <label style={{ fontWeight: "bold", marginRight: 8 }}>
    Select Form:
  </label>

  <select
    value="mir"
    onChange={(e) => {
      const v = e.target.value;
      const qp = form.project_id ? `?project_id=${form.project_id}` : "";
      if (v === "wir") navigate(`/wir/create${qp}`);
    }}
    style={{
      padding: "8px",
      border: "1px solid #ccc",
      fontSize: "14px",
      minWidth: 160,
    }}
  >
    <option value="mir">MIR</option>
    <option value="wir">WIR</option>
  </select>
</div>






      {/* PDF-STYLE SHEET */}
      <div
        id="mir-pdf-sheet"
        style={{
          border: "2px solid #000",
          marginBottom: "20px",
          background: cardColor,
        }}
      >
        {/* HEADER: IMS TITLE + LOGO (same layout as detail PDF) */}
        <div
          style={{
            borderBottom: "2px solid #000",
            padding: "5px",
            background: BG_OFFWHITE,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px",
            }}
          >
            {/* LEFT SPACER – same as detail page */}
            <div
              style={{
                width: "90px",
                height: "90px",
                borderRadius: "50%",
                visibility: "hidden",
                flexShrink: 0,
              }}
            />

            {/* CENTER TITLE INPUT */}
            <div style={{ flex: 1, textAlign: "center" }}>
              <input
                type="text"
                name="ims_title"
                value={form.ims_title}
                onChange={handleChange}
                style={{
                  width: "100%",
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "18px",
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  color: textColor,
                }}
              />
            </div>

            {/* RIGHT LOGO PREVIEW (circle with LOGO text) */}
            <div
              style={{
                width: "90px",
                height: "90px",
                borderRadius: "50%",
                border: "2px solid #000",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#fff",
                flexShrink: 0,
              }}
            >
              <span style={{ fontWeight: "bold", fontSize: "10px" }}>
                LOGO
              </span>
            </div>
          </div>
        </div>

        {/* Title Section */}
        <div
          style={{
            borderBottom: "2px solid #000",
            padding: "10px",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "16px",
          }}
        >
          <input
            type="text"
            name="report_title"
            value={form.report_title}
            onChange={handleChange}
            style={{
              width: "100%",
              textAlign: "center",
              fontWeight: "bold",
              fontSize: "16px",
              border: "none",
              outline: "none",
              background: "transparent",
              color: textColor,
            }}
          />
        </div>

        {/* Company Name */}
        <div
          style={{
            borderBottom: "2px solid #000",
            padding: "10px",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "20px",
          }}
        >
          <input
            type="text"
            name="company_name"
            value={form.company_name}
            onChange={handleChange}
            style={{
              width: "100%",
              textAlign: "center",
              fontWeight: "bold",
              fontSize: "20px",
              border: "none",
              outline: "none",
              background: "transparent",
              color: textColor,
            }}
          />
        </div>

        {/* Doc Number */}
        <div
          style={{
            borderBottom: "2px solid #000",
            padding: "8px 15px",
            fontSize: "12px",
          }}
        >
          DOC NO: ADL/QA/MIR/IMF/07
        </div>

        {/* FORM CONTENT STARTS HERE */}
        <form id="mir-create-form" onSubmit={handleSubmit}>
          {/* System Settings (NOT in PDF) */}
          <div
            style={{
              background: cardColor,
              border: `1px solid ${borderColor}`,
              padding: "15px",
              margin: "15px",
            }}
          >
            <h4
              style={{
                margin: "0 0 10px 0",
                color: borderColor,
              }}
            >
              System Settings (Not part of printed MIR)
            </h4>

            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  fontWeight: "bold",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Project *
              </label>
              <select
                name="project_id"
                value={form.project_id}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ccc",
                  fontSize: "14px",
                }}
              >
                <option value="">Select Project</option>
                {projectsLoading ? (
                  <option value="">Loading...</option>
                ) : (
                  projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name || p.project_name || `Project #${p.id}`}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  fontWeight: "bold",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Source Type
              </label>
              <div style={{ display: "flex", gap: "15px" }}>
                <label>
                  <input
                    type="radio"
                    name="source_type"
                    value="INHOUSE"
                    checked={form.source_type === "INHOUSE"}
                    onChange={handleChange}
                  />{" "}
                  In-house
                </label>
                <label>
                  <input
                    type="radio"
                    name="source_type"
                    value="CONTRACTOR"
                    checked={form.source_type === "CONTRACTOR"}
                    onChange={handleChange}
                  />{" "}
                  Contractor
                </label>
              </div>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  fontWeight: "bold",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Forward MIR To (multi users) *
              </label>
              <select
                multiple
                value={selectedUserIds}
                onChange={(e) => {
                  const opts = Array.from(e.target.selectedOptions);
                  setSelectedUserIds(opts.map((o) => o.value));
                }}
                disabled={!form.project_id || usersLoading}
                style={{
                  width: "100%",
                  minHeight: "80px",
                  padding: "8px",
                  border: "1px solid #ccc",
                }}
              >
                {!form.project_id && (
                  <option value="" disabled>
                    Select project first
                  </option>
                )}
                {form.project_id && usersLoading && (
                  <option value="" disabled>
                    Users loading...
                  </option>
                )}
                {form.project_id &&
                  !usersLoading &&
                  projectUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.label}
                    </option>
                  ))}
              </select>
              <div
                style={{
                  fontSize: "11px",
                  color: "#666",
                  marginTop: "4px",
                }}
              >
                Ctrl/Cmd + click for multiple selection
              </div>
            </div>

            {/* MIR Logo for PDF header */}
            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  fontWeight: "bold",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                MIR Logo (for PDF header, right corner)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              />
              {logoFile && (
                <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>
                  Selected: {logoFile.name}
                </div>
              )}
            </div>

            <div>
              <label
                style={{
                  fontWeight: "bold",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Forward Comment (optional)
              </label>
              <textarea
                value={forwardComment}
                onChange={(e) => setForwardComment(e.target.value)}
                rows={2}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ccc",
                  fontSize: "14px",
                }}
                placeholder="e.g. Please verify TC & QC docs before unloading."
              />
            </div>
          </div>

          {/* PDF TABLE LAYOUT – EXACT FIELDS AS PDF */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "13px",
            }}
          >
            <tbody>
              {/* Date & Location Row */}
              <tr>
                <td style={styles.labelCell}>Date -</td>
                <td style={styles.inputCell} colSpan={2}>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </td>
                <td style={styles.labelCell}>Location-</td>
                <td style={styles.inputCell} colSpan={3}>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </td>
              </tr>

              {/* MIR No Row */}
              <tr>
                <td style={styles.labelCell}>MIR No -</td>
                <td style={styles.inputCell} colSpan={6}>
                  <input
                    type="text"
                    name="mir_number"
                    value={form.mir_number}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </td>
              </tr>

              {/* Manufacturer Name Row */}
              <tr>
                <td style={styles.labelCell}>Manufacturer Name -</td>
                <td style={styles.inputCell} colSpan={6}>
                  <input
                    type="text"
                    name="manufacturer_name"
                    value={form.manufacturer_name}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </td>
              </tr>

              {/* Certificate No & Date Row */}
              <tr>
                <td style={styles.labelCell}>Certificate No & Date -</td>
                <td style={styles.inputCell} colSpan={3}>
                  <input
                    type="text"
                    name="certificate_no"
                    value={form.certificate_no}
                    onChange={handleChange}
                    placeholder="Certificate No"
                    style={styles.input}
                  />
                </td>
                <td style={styles.inputCell} colSpan={3}>
                  <input
                    type="date"
                    name="certificate_date"
                    value={form.certificate_date}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </td>
              </tr>

              {/* Material ID, Name, Specification Row */}
              <tr>
                <td style={styles.labelCell}>Material ID</td>
                <td style={styles.labelCell}>Material Name</td>
                <td style={styles.labelCell} colSpan={5}>
                  Material Specification
                </td>
              </tr>
              <tr>
                <td style={styles.inputCell}>
                  <input
                    type="text"
                    name="material_id"
                    value={form.material_id}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </td>
                <td style={styles.inputCell}>
                  <input
                    type="text"
                    name="material_name"
                    value={form.material_name}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </td>
                <td style={styles.inputCell} colSpan={5}>
                  <textarea
                    name="material_specification"
                    value={form.material_specification}
                    onChange={handleChange}
                    rows={2}
                    style={styles.textarea}
                  />
                </td>
              </tr>

              {/* Description of material */}
              <tr>
                <td style={styles.labelCell} colSpan={7}>
                  Description of material
                </td>
              </tr>
              <tr>
                <td style={styles.inputCell} colSpan={7}>
                  <textarea
                    name="material_description"
                    value={form.material_description}
                    onChange={handleChange}
                    rows={3}
                    style={styles.textarea}
                  />
                </td>
              </tr>

              {/* Material Unique ID */}
              <tr>
                <td style={styles.labelCell} colSpan={7}>
                  Material Unique ID/Serial /Type
                </td>
              </tr>
              <tr>
                <td style={styles.inputCell} colSpan={7}>
                  <input
                    type="text"
                    name="material_unique_id"
                    value={form.material_unique_id}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </td>
              </tr>

           {/* Supplier QC Report & Details of Inspection */}
<tr>
  <td style={styles.labelCell} colSpan={3}>
    Supplier Internal Quality inspection Report No &amp; Date -
  </td>
  <td style={styles.labelCell} colSpan={4}>
    Details Of Inspection
  </td>
</tr>

<tr>
  {/* Report No + Date */}
  <td style={styles.inputCell} colSpan={3}>
    <div style={{ display: "flex", gap: "6px" }}>
      <input
        type="text"
        name="supplier_qc_report_no"
        value={form.supplier_qc_report_no}
        onChange={handleChange}
        placeholder="Report No"
        style={{ ...styles.input, flex: 1 }}
      />
      <input
        type="date"
        name="supplier_qc_report_date"
        value={form.supplier_qc_report_date}
        onChange={handleChange}
        style={{ ...styles.input, flexBasis: "140px" }}
      />
    </div>
  </td>

  {/* Details of inspection */}
  <td style={styles.inputCell} colSpan={4} rowSpan={2}>
    <textarea
      name="details_of_inspection"
      value={form.details_of_inspection}
      onChange={handleChange}
      rows={5}
      style={styles.textarea}
    />
  </td>
</tr>

<tr>
  {/* empty row to match PDF grid */}
</tr>

{/* ====== EXACT HEADERS LIKE PDF ====== */}
<tr>
  <td
    style={{ ...styles.labelCell, textAlign: "center" }}
    colSpan={3}
  >
    As per Supplier Test certificate
  </td>
  <td
    style={{ ...styles.labelCell, textAlign: "center" }}
    colSpan={3}
  >
    As per Actual Inspection
  </td>
  {/* last column grid ke liye */}
  <td style={styles.labelCell}></td>
</tr>

<tr>
  {/* left side sub-headers */}
  <td style={styles.labelCell}>As per Supplier Test certificate</td>
  <td style={styles.labelCell}>Min. Limit</td>
  <td style={styles.labelCell}>Max. Limit</td>

  {/* right side sub-headers */}
  <td style={styles.labelCell}>As per Actual Inspection</td>
  <td style={styles.labelCell}>Min. Limit</td>
  <td style={styles.labelCell}>Max. Limit</td>

  <td style={styles.labelCell}></td>
</tr>

{/* ====== VALUE ROW – BACKEND FIELDS ====== */}
<tr>
  {/* stc_parameter_name (text) */}
  <td style={styles.inputCell}>
    <input
      type="text"
      name="stc_parameter_name"
      value={form.stc_parameter_name}
      onChange={handleChange}
      style={styles.input}
    />
  </td>

  {/* stc_min_limit */}
  <td style={styles.inputCell}>
    <input
      type="number"
      step="0.01"
      name="stc_min_limit"
      value={form.stc_min_limit}
      onChange={handleChange}
      style={styles.smallInput}
    />
  </td>

  {/* stc_max_limit */}
  <td style={styles.inputCell}>
    <input
      type="number"
      step="0.01"
      name="stc_max_limit"
      value={form.stc_max_limit}
      onChange={handleChange}
      style={styles.smallInput}
    />
  </td>

  {/* inspection_min_limit */}
  <td style={styles.inputCell}>
    <input
      type="number"
      step="0.01"
      name="inspection_min_limit"
      value={form.inspection_min_limit}
      onChange={handleChange}
      style={styles.smallInput}
    />
  </td>

  {/* inspection_actual_value */}
  <td style={styles.inputCell}>
    <input
      type="number"
      step="0.01"
      name="inspection_actual_value"
      value={form.inspection_actual_value}
      onChange={handleChange}
      style={styles.smallInput}
    />
  </td>

  {/* inspection_max_limit */}
  <td style={styles.inputCell}>
    <input
      type="number"
      step="0.01"
      name="inspection_max_limit"
      value={form.inspection_max_limit}
      onChange={handleChange}
      style={styles.smallInput}
    />
  </td>

  {/* extra grid column */}
  <td style={styles.inputCell}></td>
</tr>

{/* ====== DOC REFERENCE ROWS (STC + INSPECTION) ====== */}
<tr>
  <td
    style={{ ...styles.labelCell, textAlign: "center" }}
    colSpan={3}
  >
    Doc Reference
  </td>
  <td style={styles.inputCell}></td>
  <td
    style={{ ...styles.labelCell, textAlign: "center" }}
    colSpan={3}
  >
    Doc. Reference
  </td>
</tr>

<tr>
  {/* STC doc reference */}
  <td style={styles.inputCell} colSpan={3}>
    <input
      type="text"
      name="stc_doc_reference"
      value={form.stc_doc_reference}
      onChange={handleChange}
      style={styles.input}
    />
  </td>

  {/* middle thin box – blank */}
  <td style={styles.inputCell}></td>

  {/* Inspection doc reference */}
  <td style={styles.inputCell} colSpan={3}>
    <input
      type="text"
      name="inspection_doc_reference"
      value={form.inspection_doc_reference}
      onChange={handleChange}
      style={styles.input}
    />
  </td>
</tr>

{/* Test for in Process compatibility – full width */}
<tr>
  <td style={styles.labelCell} colSpan={7}>
    Test for in Process compatibility
  </td>
</tr>
<tr>
  <td
    style={{ ...styles.inputCell, height: "60px" }}
    colSpan={7}
  >
    <textarea
      name="process_compatibility_test"
      value={form.process_compatibility_test}
      onChange={handleChange}
      rows={2}
      style={styles.textarea}
    />
  </td>
</tr>

{/* Other test required – full width */}
<tr>
  <td style={styles.labelCell} colSpan={7}>
    Other test required to compline And Application
  </td>
</tr>
<tr>
  <td
    style={{ ...styles.inputCell, height: "60px" }}
    colSpan={7}
  >
    <textarea
      name="other_required_tests"
      value={form.other_required_tests}
      onChange={handleChange}
      rows={2}
      style={styles.textarea}
    />
  </td>
</tr>

              {/* Visual Test Result & Criterial test Result */}
              <tr>
                <td
                  style={{ ...styles.labelCell, textAlign: "center" }}
                  colSpan={3}
                >
                  Visual Test Result
                </td>
                <td
                  style={{ ...styles.labelCell, textAlign: "center" }}
                  colSpan={4}
                >
                  Criterial test Result
                </td>
              </tr>
              <tr>
                <td
                  style={{ ...styles.inputCell, height: "80px" }}
                  colSpan={3}
                >
                  <textarea
                    name="visual_test_result"
                    value={form.visual_test_result}
                    onChange={handleChange}
                    rows={3}
                    style={styles.textarea}
                  />
                </td>
                <td
                  style={{ ...styles.inputCell, height: "80px" }}
                  colSpan={4}
                >
                  <textarea
                    name="criteria_test_result"
                    value={form.criteria_test_result}
                    onChange={handleChange}
                    rows={3}
                    style={styles.textarea}
                  />
                </td>
              </tr>

              {/* Total Qty & Rejection Reason */}
              <tr>
                <td style={styles.labelCell} colSpan={2}>
                  Total Qty.-
                </td>
                <td style={styles.labelCell} colSpan={5}>
                  Rejection Reason
                </td>
              </tr>
              <tr>
                <td style={styles.inputCell} colSpan={2}>
                  <input
                    type="number"
                    step="0.01"
                    name="total_qty"
                    value={form.total_qty}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </td>
                <td
                  style={{ ...styles.inputCell, height: "60px" }}
                  colSpan={5}
                  rowSpan={2}
                >
                  <textarea
                    name="rejection_reason"
                    value={form.rejection_reason}
                    onChange={handleChange}
                    rows={3}
                    style={styles.textarea}
                  />
                </td>
              </tr>

              {/* Accepted Qty & Rejected Qty */}
              <tr>
                <td style={styles.labelCell}>Accepted Qty-</td>
                <td style={styles.labelCell}>Rejected Qty-</td>
              </tr>
              <tr>
                <td style={styles.inputCell}>
                  <input
                    type="number"
                    step="0.01"
                    name="accepted_qty"
                    value={form.accepted_qty}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </td>
                <td style={styles.inputCell}>
                  <input
                    type="number"
                    step="0.01"
                    name="rejected_qty"
                    value={form.rejected_qty}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </td>
                <td style={styles.inputCell} colSpan={5}></td>
              </tr>

              {/* Signature Row – QC / Store / Project Incharge */}
              <tr>
                <td
                  style={{
                    ...styles.labelCell,
                    textAlign: "center",
                    height: "150px",
                    verticalAlign: "bottom",
                  }}
                  colSpan={2}
                >
                  <div>
                    <div style={{ marginBottom: "8px" }}>
                      <input
                        type="text"
                        value={qcSignName}
                        onChange={(e) => setQcSignName(e.target.value)}
                        placeholder="QC Team Name"
                        style={{ ...styles.input, marginBottom: "4px" }}
                      />
                      <input
                        type="date"
                        value={qcSignDate}
                        onChange={(e) => setQcSignDate(e.target.value)}
                        style={styles.input}
                      />
                    </div>
                    <SignaturePadField
                      label=""
                      fileValue={qcSignFile}
                      onChangeFile={setQcSignFile}
                    />
                  </div>
                  <div style={{ fontWeight: "bold", marginTop: "8px" }}>
                    QC Team
                  </div>
                </td>

                <td
                  style={{
                    ...styles.labelCell,
                    textAlign: "center",
                    height: "150px",
                    verticalAlign: "bottom",
                  }}
                  colSpan={3}
                >
                  <div>
                    <div style={{ marginBottom: "8px" }}>
                      <input
                        type="text"
                        value={storeSignName}
                        onChange={(e) => setStoreSignName(e.target.value)}
                        placeholder="Store Team Name"
                        style={{ ...styles.input, marginBottom: "4px" }}
                      />
                      <input
                        type="date"
                        value={storeSignDate}
                        onChange={(e) => setStoreSignDate(e.target.value)}
                        style={styles.input}
                      />
                    </div>
                    <SignaturePadField
                      label=""
                      fileValue={storeSignFile}
                      onChangeFile={setStoreSignFile}
                    />
                  </div>
                  <div style={{ fontWeight: "bold", marginTop: "8px" }}>
                    Store Team
                  </div>
                </td>

                <td
                  style={{
                    ...styles.labelCell,
                    textAlign: "center",
                    height: "150px",
                    verticalAlign: "bottom",
                  }}
                  colSpan={2}
                >
                  <div>
                    <div style={{ marginBottom: "8px" }}>
                      <input
                        type="text"
                        value={piSignName}
                        onChange={(e) => setPiSignName(e.target.value)}
                        placeholder="Project Incharge Name"
                        style={{ ...styles.input, marginBottom: "4px" }}
                      />
                      <input
                        type="date"
                        value={piSignDate}
                        onChange={(e) => setPiSignDate(e.target.value)}
                        style={styles.input}
                      />
                    </div>
                    <SignaturePadField
                      label=""
                      fileValue={piSignFile}
                      onChangeFile={setPiSignFile}
                    />
                  </div>
                  <div style={{ fontWeight: "bold", marginTop: "8px" }}>
                    Project incharge
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>

      {/* ADDITIONAL SECTIONS (NOT IN PDF TABLE) */}
      <div
        style={{
          border: `1px solid ${borderColor}`,
          padding: "15px",
          marginTop: "20px",
          background: cardColor,
        }}
      >
        <h4
          style={{
            margin: "0 0 15px 0",
            color: borderColor,
          }}
        >
          📎 Additional Attachments (Not in PDF format)
        </h4>

        {/* Material Photos */}
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              fontWeight: "bold",
              display: "block",
              marginBottom: "5px",
            }}
          >
            Material Photos
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) =>
              setMaterialPhotos(Array.from(e.target.files || []))
            }
            style={{ marginBottom: "5px" }}
          />
          {materialPhotos.length > 0 && (
            <ul
              style={{
                marginTop: 8,
                fontSize: 12,
                paddingLeft: "20px",
              }}
            >
              {materialPhotos.map((file, idx) => (
                <li key={idx}>{file.name}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Attachments */}
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              fontWeight: "bold",
              display: "block",
              marginBottom: "5px",
            }}
          >
            Attachments (Docs / Files)
          </label>
          <input
            type="file"
            multiple
            onChange={(e) => setAttachments(Array.from(e.target.files || []))}
            style={{ marginBottom: "5px" }}
          />
          {attachments.length > 0 && (
            <ul
              style={{
                marginTop: 8,
                fontSize: 12,
                paddingLeft: "20px",
              }}
            >
              {attachments.map((file, idx) => (
                <li key={idx}>{file.name}</li>
              ))}
            </ul>
          )}

          <div style={{ marginTop: 8 }}>
            <label
              style={{
                fontSize: 12,
                display: "block",
                marginBottom: "3px",
              }}
            >
              Display Name (optional)
            </label>
            <input
              type="text"
              value={attachmentName}
              onChange={(e) => setAttachmentName(e.target.value)}
              style={{
                width: "100%",
                padding: 6,
                border: "1px solid #ccc",
              }}
              placeholder="e.g. Mill Test Certificate"
            />
          </div>

          <div style={{ marginTop: 8 }}>
            <label
              style={{
                fontSize: 12,
                display: "block",
                marginBottom: "3px",
              }}
            >
              Description (optional)
            </label>
            <textarea
              rows={2}
              value={attachmentDescription}
              onChange={(e) => setAttachmentDescription(e.target.value)}
              style={{
                width: "100%",
                padding: 6,
                border: "1px solid #ccc",
              }}
              placeholder="Short note..."
            />
          </div>
        </div>

        {/* Extra Fields */}
        <div>
          <label
            style={{
              fontWeight: "bold",
              display: "block",
              marginBottom: "5px",
            }}
          >
            Extra Fields (Modular)
          </label>
          <p
            style={{
              fontSize: 11,
              color: "#666",
              marginBottom: 8,
            }}
          >
            Custom fields stored in extra_data JSON
          </p>
          {extraFields.map((row, idx) => (
            <div
              key={idx}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr auto",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <input
                type="text"
                placeholder="Key (e.g. gate_entry_no)"
                value={row.key}
                onChange={(e) =>
                  handleExtraChange(idx, "key", e.target.value)
                }
                style={{ padding: "6px", border: "1px solid #ccc" }}
              />
              <input
                type="text"
                placeholder="Value"
                value={row.value}
                onChange={(e) =>
                  handleExtraChange(idx, "value", e.target.value)
                }
                style={{ padding: "6px", border: "1px solid #ccc" }}
              />
              <button
                type="button"
                onClick={() => removeExtraRow(idx)}
                disabled={extraFields.length === 1}
                style={{
                  padding: "6px 12px",
                  borderRadius: "4px",
                  border: "none",
                  background: extraFields.length === 1 ? "#ccc" : ORANGE,
                  color: extraFields.length === 1 ? "#666" : "#222",
                  cursor:
                    extraFields.length === 1 ? "not-allowed" : "pointer",
                }}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addExtraRow}
            style={{
              padding: "8px 16px",
              background: ORANGE,
              color: "#222",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            + Add Extra Field
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button
          type="submit"
          form="mir-create-form"
          disabled={loading}
          style={{
            padding: "12px 40px",
            fontSize: "16px",
            fontWeight: "bold",
            background: loading ? "#ccc" : ORANGE,
            color: loading ? "#666" : "#222",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          {loading ? "Creating MIR..." : "Create & Forward MIR"}
        </button>
      </div>
    </div>
  );
}

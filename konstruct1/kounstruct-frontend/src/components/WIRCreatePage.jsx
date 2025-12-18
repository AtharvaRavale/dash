// src/pages/WIRCreatePage.jsx (or your current path)

import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useTheme } from "../ThemeContext";
import SignaturePadField from "../components/SignaturePadField";

import { getProjectsForCurrentUser, getUsersByProject, createWIRFull } from "../api";

const EMPTY_EXTRA_FIELD = { key: "", value: "" };

const ORANGE = "#ffbe63";
const BG_OFFWHITE = "#fcfaf7";

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
};

// ✅ keys aligned to backend booleans + file buckets
const ATT_CATEGORIES = [
  { key: "key_plan", label: "1. Area of Inspection Requested, Marked in Key Plan" },
  { key: "checklist", label: "2. Inspection Request/Method Statement/Construction Checklist" },
  { key: "clearance", label: "3. MEP / Interface / Area Clearance Form" },
  { key: "drawing", label: "4. GFC/Shop Drawing (Attached or Referred)" },
  { key: "other", label: "5. Other Documents" },
];

const DECISIONS = [
  { value: "NONE", label: "Select (optional)" },
  { value: "A", label: "A - Proceed With Works" },
  { value: "B", label: "B - Proceed With Works As Noted Above" },
  { value: "C", label: "C - Revise And Re-Submit" },
  { value: "D", label: "D - Rejected" },
];

// small helper for file preview url (auto revoke)
function useObjectUrl(file) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (!file) {
      setUrl("");
      return;
    }
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  return url;
}

function LogoCircle({ url, fallbackText }) {
  return (
    <div
      style={{
        width: 90,
        height: 90,
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
      {url ? (
        <img src={url} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <div style={{ fontWeight: "bold", fontSize: 16, color: "#444", textAlign: "center", whiteSpace: "pre-line" }}>
          {fallbackText}
        </div>
      )}
    </div>
  );
}

export default function WIRCreatePage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();

  const bgColor = theme === "dark" ? "#191922" : BG_OFFWHITE;
  const cardColor = theme === "dark" ? "#23232c" : "#fff";
  const borderColor = ORANGE;
  const textColor = theme === "dark" ? "#fff" : "#222";

  const [loading, setLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projects, setProjects] = useState([]);

  // ✅ 3 logo uploads -> backend expects: client_logo, pmc_logo, contractor_logo
  const [clientLogoFile, setClientLogoFile] = useState(null);
  const [pmcLogoFile, setPmcLogoFile] = useState(null);
  const [contractorLogoFile, setContractorLogoFile] = useState(null);

  const clientLogoUrl = useObjectUrl(clientLogoFile);
  const pmcLogoUrl = useObjectUrl(pmcLogoFile);
  const contractorLogoUrl = useObjectUrl(contractorLogoFile);

  // signatures (2 only)
  const [contractorSignFile, setContractorSignFile] = useState(null);
  const [contractorSignName, setContractorSignName] = useState("");
  const [contractorSignDate, setContractorSignDate] = useState("");

  const [inspectorSignFile, setInspectorSignFile] = useState(null);
  const [inspectorSignName, setInspectorSignName] = useState("");
  const [inspectorSignDate, setInspectorSignDate] = useState("");

  // users + forward
  const [projectUsers, setProjectUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [forwardComment, setForwardComment] = useState("");

  // attachments (checkbox -> show upload)
  const [attChecks, setAttChecks] = useState(() => {
    const obj = {};
    ATT_CATEGORIES.forEach((c) => (obj[c.key] = false));
    return obj;
  });

  const [attFiles, setAttFiles] = useState(() => {
    const obj = {};
    ATT_CATEGORIES.forEach((c) => (obj[c.key] = []));
    return obj;
  });

  const [otherDocLabel, setOtherDocLabel] = useState("");

  // project name editable behavior
  const [projectNameTouched, setProjectNameTouched] = useState(false);

  // WIR fields (UI)
  const [form, setForm] = useState({
    project_id: searchParams.get("project_id") || "",

    // UI header (we will store in extra_data)
    project_display_name: "",
    wir_title: "WORK INSPECTION REQUEST (WIR)",

    date_of_submission: "",
    inspection_request_no: "",

    date_of_inspection: "",
    time_of_inspection: "10:15",

    description_of_work: "",
    location_gridlines: "",
    approved_wms_ref_no: "",
    zone_area: "",
    element: "",

    // UI-only fields (store in extra_data)
    request_note: "",
    contractor_required_actions: "",

    // optional at create time
    consultant_comments: "",
    decision: "NONE",
  });

  const [extraFields, setExtraFields] = useState([EMPTY_EXTRA_FIELD]);

  // load projects
  useEffect(() => {
    async function loadProjects() {
      try {
        setProjectsLoading(true);
        const res = await getProjectsForCurrentUser();
        setProjects(res?.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Projects load nahi ho paaye.");
      } finally {
        setProjectsLoading(false);
      }
    }
    loadProjects();
  }, []);

  // when project changes, auto-fill display name ONLY if not touched
  useEffect(() => {
    const pid = form.project_id;
    if (!pid || !projects?.length) return;
    if (projectNameTouched) return;

    const p = projects.find((x) => String(x.id) === String(pid));
    const label = p?.name || p?.project_name || `Project #${pid}`;
    setForm((prev) => ({ ...prev, project_display_name: label }));
  }, [form.project_id, projects, projectNameTouched]);

  // load users
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
        setProjectUsers(
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
        console.error(err);
        toast.error("Project ke users load nahi ho paaye.");
      } finally {
        setUsersLoading(false);
      }
    }
    loadUsers();
  }, [form.project_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "project_display_name") {
      setProjectNameTouched(true);
    }

    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleExtraChange = (index, field, value) => {
    setExtraFields((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addExtraRow = () => setExtraFields((p) => [...p, { ...EMPTY_EXTRA_FIELD }]);
  const removeExtraRow = (index) => setExtraFields((p) => p.filter((_, i) => i !== index));

  const buildExtraData = () => {
    const extra = {};

    // ✅ keep your editable header + UI-only sections in extra_data
    extra.project_display_name = form.project_display_name || "";
    extra.wir_title = form.wir_title || "";
    extra.request_note = form.request_note || "";
    extra.contractor_required_actions = form.contractor_required_actions || "";

    // ✅ plus modular extra fields
    extraFields.forEach((row) => {
      const key = (row.key || "").trim();
      if (!key) return;
      extra[key] = row.value ?? "";
    });

    return extra;
  };

  const toggleAtt = (key) => {
    setAttChecks((p) => {
      const next = { ...p, [key]: !p[key] };
      if (p[key] === true) {
        setAttFiles((f) => ({ ...f, [key]: [] }));
        if (key === "other") setOtherDocLabel("");
      }
      return next;
    });
  };

  const onAttFilesChange = (key, filesArr) => {
    setAttFiles((p) => ({ ...p, [key]: filesArr }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.project_id) {
      toast.error("Project select karo.");
      return;
    }
    if (!selectedUserIds.length) {
      toast.error("Kam se kam ek user select karo jise WIR forward hoga.");
      return;
    }

    const forwardToUserId = Number(selectedUserIds[0]);

    // ✅ payload aligned to backend model fields
    const payload = {
      project_id: Number(form.project_id),

      date_of_submission: form.date_of_submission || null,
      inspection_request_no: form.inspection_request_no || "",

      date_of_inspection: form.date_of_inspection || null,
      time_of_inspection: form.time_of_inspection || "",

      description_of_work: form.description_of_work || "",
      work_types: [],

      location_gridlines: form.location_gridlines || "",
      zone_area: form.zone_area || "",
      approved_wms_ref_no: form.approved_wms_ref_no || "",
      element: form.element || "",

      // ✅ attachment booleans
      att_key_plan: !!attChecks.key_plan,
      att_checklist: !!attChecks.checklist,
      att_clearance: !!attChecks.clearance,
      att_drawing: !!attChecks.drawing,
      att_other: !!attChecks.other,
      att_other_text: otherDocLabel || "",

      consultant_comments: form.consultant_comments || "",
      decision: (form.decision || "NONE").toUpperCase(),

      // signatures meta (files are attached separately)
      contractor_rep_name: contractorSignName || "",
      contractor_rep_sign_date: contractorSignDate || null,

      inspector_name: inspectorSignName || "",
      inspector_sign_date: inspectorSignDate || null,

      // ✅ store UI-only fields here
      extra_data: buildExtraData(),

      // forward (single assignee; multi-select UI allowed but first is used)
      forward_to_user_id: forwardToUserId,
      forward_comment: forwardComment || "",
    };

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("data", JSON.stringify(payload));

      // ✅ 3 logos (backend keys)
      if (clientLogoFile) fd.append("client_logo", clientLogoFile);
      if (pmcLogoFile) fd.append("pmc_logo", pmcLogoFile);
      if (contractorLogoFile) fd.append("contractor_logo", contractorLogoFile);

      // signatures (backend keys)
      if (contractorSignFile) fd.append("contractor_signature", contractorSignFile);
      if (inspectorSignFile) fd.append("inspector_signature", inspectorSignFile);

      // ✅ category-wise attachments (backend keys)
      if (attChecks.key_plan) (attFiles.key_plan || []).forEach((f) => fd.append("key_plan_files", f));
      if (attChecks.checklist) (attFiles.checklist || []).forEach((f) => fd.append("checklist_files", f));
      if (attChecks.clearance) (attFiles.clearance || []).forEach((f) => fd.append("clearance_files", f));
      if (attChecks.drawing) (attFiles.drawing || []).forEach((f) => fd.append("drawing_files", f));
      if (attChecks.other) (attFiles.other || []).forEach((f) => fd.append("other_files", f));

      const res = await createWIRFull(fd);
      const data = res?.data || res;
      if (!data?.id) throw new Error("WIR full-create response me id nahi mila.");

      toast.success("WIR created + logos + attachments + signatures + auto-forward.");

      // reset (keep project selection + project_display_name as-is)
      setForm((p) => ({
        ...p,
        wir_title: "WORK INSPECTION REQUEST (WIR)",
        date_of_submission: "",
        inspection_request_no: "",
        date_of_inspection: "",
        time_of_inspection: "10:15",
        description_of_work: "",
        location_gridlines: "",
        approved_wms_ref_no: "",
        zone_area: "",
        element: "",
        request_note: "",
        contractor_required_actions: "",
        consultant_comments: "",
        decision: "NONE",
      }));

      setExtraFields([EMPTY_EXTRA_FIELD]);
      setForwardComment("");

      setContractorSignFile(null);
      setContractorSignName("");
      setContractorSignDate("");

      setInspectorSignFile(null);
      setInspectorSignName("");
      setInspectorSignDate("");

      const resetChecks = {};
      const resetFiles = {};
      ATT_CATEGORIES.forEach((c) => {
        resetChecks[c.key] = false;
        resetFiles[c.key] = [];
      });
      setAttChecks(resetChecks);
      setAttFiles(resetFiles);
      setOtherDocLabel("");
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        "WIR create karte time error aaya.";
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
        <label style={{ fontWeight: "bold", marginRight: 8 }}>Select Form:</label>
        <select
          defaultValue="wir"
          onChange={(e) => {
            const v = e.target.value;
            const qp = form.project_id ? `?project_id=${form.project_id}` : "";
            if (v === "mir") navigate(`/mir/create${qp}`);
          }}
          style={{ padding: "8px", border: "1px solid #ccc", fontSize: "14px", minWidth: 160 }}
        >
          <option value="mir">MIR</option>
          <option value="wir">WIR</option>
        </select>
      </div>

      {/* PDF-STYLE SHEET */}
      <div style={{ border: "2px solid #000", marginBottom: "20px", background: cardColor }}>
        {/* TOP HEADER */}
        <div style={{ borderBottom: "2px solid #000", background: BG_OFFWHITE, padding: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            {/* LEFT: Client/Company logo + text */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <LogoCircle url={clientLogoUrl} fallbackText={"Client /\nCompany\nLogo"} />
              <div style={{ fontWeight: "bold", lineHeight: 1.1 }}>
                <div style={{ fontSize: 26, letterSpacing: 1 }}>HORIZON</div>
                <div style={{ fontSize: 14, letterSpacing: 1 }}>INDUSTRIAL PARKS</div>
              </div>
            </div>

            {/* CENTER: PMC logo */}
            <div style={{ textAlign: "center" }}>
              <LogoCircle url={pmcLogoUrl} fallbackText={"PMC's\nLogo"} />
            </div>

            {/* RIGHT: Contractor logo */}
            <div style={{ textAlign: "center" }}>
              <LogoCircle url={contractorLogoUrl} fallbackText={"Contractor's\nLogo"} />
            </div>
          </div>
        </div>

        {/* PROJECT NAME + WIR TITLE ROW (editable) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "2px solid #000" }}>
          <div style={{ borderRight: "2px solid #000", padding: "10px", fontWeight: "bold" }}>
            Project:&nbsp;
            <input
              name="project_display_name"
              value={form.project_display_name}
              onChange={handleChange}
              placeholder="Project name..."
              style={{
                width: "80%",
                border: "none",
                outline: "none",
                background: "transparent",
                fontWeight: "bold",
                fontSize: 18,
              }}
            />
          </div>

          <div style={{ padding: "10px", fontWeight: "bold", textAlign: "center" }}>
            <input
              name="wir_title"
              value={form.wir_title}
              onChange={handleChange}
              style={{
                width: "100%",
                textAlign: "center",
                border: "none",
                outline: "none",
                background: "transparent",
                fontWeight: "bold",
                fontSize: 18,
              }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* System Settings */}
          <div
            style={{
              background: cardColor,
              border: `1px solid ${borderColor}`,
              padding: "15px",
              margin: "15px",
            }}
          >
            <h4 style={{ margin: "0 0 10px 0", color: borderColor }}>
              System Settings (Not part of printed WIR)
            </h4>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontWeight: "bold", display: "block", marginBottom: "4px" }}>
                Project *
              </label>
              <select
                name="project_id"
                value={form.project_id}
                onChange={(e) => {
                  setProjectNameTouched(false);
                  handleChange(e);
                }}
                required
                style={{ width: "100%", padding: "8px", border: "1px solid #ccc", fontSize: "14px" }}
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

            {/* 3 logo uploads */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontWeight: "bold", display: "block", marginBottom: 6 }}>
                  Client/Company Logo (left)
                </label>
                <input type="file" accept="image/*" onChange={(e) => setClientLogoFile(e.target.files?.[0] || null)} />
                {clientLogoFile && (
                  <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>Selected: {clientLogoFile.name}</div>
                )}
              </div>

              <div>
                <label style={{ fontWeight: "bold", display: "block", marginBottom: 6 }}>
                  PMC Logo (center)
                </label>
                <input type="file" accept="image/*" onChange={(e) => setPmcLogoFile(e.target.files?.[0] || null)} />
                {pmcLogoFile && (
                  <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>Selected: {pmcLogoFile.name}</div>
                )}
              </div>

              <div>
                <label style={{ fontWeight: "bold", display: "block", marginBottom: 6 }}>
                  Contractor Logo (right)
                </label>
                <input type="file" accept="image/*" onChange={(e) => setContractorLogoFile(e.target.files?.[0] || null)} />
                {contractorLogoFile && (
                  <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>Selected: {contractorLogoFile.name}</div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontWeight: "bold", display: "block", marginBottom: "4px" }}>
                Forward WIR To (multi users) *
              </label>
              <select
                multiple
                value={selectedUserIds}
                onChange={(e) => {
                  const opts = Array.from(e.target.selectedOptions);
                  setSelectedUserIds(opts.map((o) => o.value));
                }}
                disabled={!form.project_id || usersLoading}
                style={{ width: "100%", minHeight: "80px", padding: "8px", border: "1px solid #ccc" }}
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

              <div style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}>
                Ctrl/Cmd + click for multiple selection • Note: backend auto-forward only uses the <b>first selected user</b>
              </div>
            </div>

            <div>
              <label style={{ fontWeight: "bold", display: "block", marginBottom: "4px" }}>
                Forward Comment (optional)
              </label>
              <textarea
                value={forwardComment}
                onChange={(e) => setForwardComment(e.target.value)}
                rows={2}
                style={{ width: "100%", padding: "8px", border: "1px solid #ccc", fontSize: "14px" }}
                placeholder="e.g. Please arrange PMC inspection at 10:15 AM."
              />
            </div>
          </div>

          {/* WIR TABLE */}
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <tbody>
              <tr>
                <td style={styles.labelCell}>Date of Submission</td>
                <td style={styles.inputCell}>
                  <input type="date" name="date_of_submission" value={form.date_of_submission} onChange={handleChange} style={styles.input} />
                </td>
                <td style={styles.labelCell}>Inspection Request No.</td>
                <td style={styles.inputCell}>
                  <input
                    type="text"
                    name="inspection_request_no"
                    value={form.inspection_request_no}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="e.g. HIPPL-ABC-XXX-QUA-WIR-..."
                  />
                </td>
              </tr>

              <tr>
                <td style={styles.labelCell}>Date Of Inspection</td>
                <td style={styles.inputCell}>
                  <input type="date" name="date_of_inspection" value={form.date_of_inspection} onChange={handleChange} style={styles.input} />
                </td>
                <td style={styles.labelCell}>Time Of Inspection</td>
                <td style={styles.inputCell}>
                  <input type="time" name="time_of_inspection" value={form.time_of_inspection} onChange={handleChange} style={styles.input} />
                </td>
              </tr>

              <tr>
                <td style={styles.labelCell} colSpan={4}>
                  Description of Work to be Inspected
                </td>
              </tr>
              <tr>
                <td style={styles.inputCell} colSpan={4}>
                  <textarea name="description_of_work" value={form.description_of_work} onChange={handleChange} rows={3} style={styles.textarea} />
                </td>
              </tr>

              <tr>
                <td style={styles.labelCell}>Location / Gridlines</td>
                <td style={styles.inputCell}>
                  <input type="text" name="location_gridlines" value={form.location_gridlines} onChange={handleChange} style={styles.input} />
                </td>
                <td style={styles.labelCell}>Approved WMS Ref. No.</td>
                <td style={styles.inputCell}>
                  <input type="text" name="approved_wms_ref_no" value={form.approved_wms_ref_no} onChange={handleChange} style={styles.input} />
                </td>
              </tr>

              <tr>
                <td style={styles.labelCell}>Zone / Area</td>
                <td style={styles.inputCell}>
                  <input type="text" name="zone_area" value={form.zone_area} onChange={handleChange} style={styles.input} />
                </td>
                <td style={styles.labelCell}>Element</td>
                <td style={styles.inputCell}>
                  <input type="text" name="element" value={form.element} onChange={handleChange} style={styles.input} />
                </td>
              </tr>

              <tr>
                <td style={styles.labelCell} colSpan={4}>
                  We request for inspection (note)
                </td>
              </tr>
              <tr>
                <td style={styles.inputCell} colSpan={4}>
                  <textarea
                    name="request_note"
                    value={form.request_note}
                    onChange={handleChange}
                    rows={2}
                    style={styles.textarea}
                    placeholder="e.g. We request for inspection for reinforcement at Grid A-B / 1-2..."
                  />
                </td>
              </tr>

              <tr>
                <td style={styles.labelCell} colSpan={4}>
                  Attachments (tick  upload field shows)
                </td>
              </tr>
              <tr>
                <td style={styles.inputCell} colSpan={4}>
                  {ATT_CATEGORIES.map((c) => (
                    <div key={c.key} style={{ marginBottom: 10 }}>
                      <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <input type="checkbox" checked={!!attChecks[c.key]} onChange={() => toggleAtt(c.key)} />
                        <span style={{ fontWeight: 600 }}>{c.label}</span>
                      </label>

                      {attChecks[c.key] && (
                        <div style={{ marginLeft: 26, marginTop: 6 }}>
                          {c.key === "other" && (
                            <div style={{ marginBottom: 8 }}>
                              <input
                                type="text"
                                value={otherDocLabel}
                                onChange={(e) => setOtherDocLabel(e.target.value)}
                                placeholder="Other document name..."
                                style={{ width: "100%", padding: 8, border: "1px solid #ccc", marginBottom: 8 }}
                              />
                            </div>
                          )}

                          <input type="file" multiple onChange={(e) => onAttFilesChange(c.key, Array.from(e.target.files || []))} />

                          {(attFiles[c.key] || []).length > 0 && (
                            <ul style={{ marginTop: 8, fontSize: 12, paddingLeft: 18 }}>
                              {(attFiles[c.key] || []).map((f, idx) => (
                                <li key={idx}>{f.name}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </td>
              </tr>

              <tr>
                <td style={styles.labelCell} colSpan={4}>
                  Consultant's Comments & Response (optional at create time)
                </td>
              </tr>
              <tr>
                <td style={styles.inputCell} colSpan={4}>
                  <textarea name="consultant_comments" value={form.consultant_comments} onChange={handleChange} rows={3} style={styles.textarea} />
                </td>
              </tr>

              <tr>
                <td style={styles.labelCell}>Decision (Outcome)</td>
                <td style={styles.inputCell} colSpan={3}>
                  <select
                    name="decision"
                    value={form.decision}
                    onChange={handleChange}
                    style={{ width: "100%", padding: 8, border: "1px solid #ccc" }}
                  >
                    {DECISIONS.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                  <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
                    Decision optional at create time. Inspector can update later.
                  </div>
                </td>
              </tr>

              <tr>
                <td style={styles.labelCell} colSpan={4}>
                  Required Action(s) By The Contractor (optional)
                </td>
              </tr>
              <tr>
                <td style={styles.inputCell} colSpan={4}>
                  <textarea
                    name="contractor_required_actions"
                    value={form.contractor_required_actions}
                    onChange={handleChange}
                    rows={2}
                    style={styles.textarea}
                  />
                </td>
              </tr>

              {/* signatures row (2) */}
              <tr>
                <td style={{ ...styles.labelCell, textAlign: "center" }} colSpan={2}>
                  Contractor Rep Name + Date + Signature
                </td>
                <td style={{ ...styles.labelCell, textAlign: "center" }} colSpan={2}>
                  PMC/Inspector Name + Date + Signature
                </td>
              </tr>

              <tr>
                <td style={styles.inputCell} colSpan={2}>
                  <input
                    type="text"
                    value={contractorSignName}
                    onChange={(e) => setContractorSignName(e.target.value)}
                    placeholder="Contractor Rep Name"
                    style={{ width: "100%", padding: 8, border: "1px solid #ccc", marginBottom: 8 }}
                  />
                  <input
                    type="date"
                    value={contractorSignDate}
                    onChange={(e) => setContractorSignDate(e.target.value)}
                    style={{ width: "100%", padding: 8, border: "1px solid #ccc", marginBottom: 8 }}
                  />
                  <SignaturePadField label="" fileValue={contractorSignFile} onChangeFile={setContractorSignFile} />
                </td>

                <td style={styles.inputCell} colSpan={2}>
                  <input
                    type="text"
                    value={inspectorSignName}
                    onChange={(e) => setInspectorSignName(e.target.value)}
                    placeholder="PMC/Inspector Name"
                    style={{ width: "100%", padding: 8, border: "1px solid #ccc", marginBottom: 8 }}
                  />
                  <input
                    type="date"
                    value={inspectorSignDate}
                    onChange={(e) => setInspectorSignDate(e.target.value)}
                    style={{ width: "100%", padding: 8, border: "1px solid #ccc", marginBottom: 8 }}
                  />
                  <SignaturePadField label="" fileValue={inspectorSignFile} onChangeFile={setInspectorSignFile} />
                </td>
              </tr>
            </tbody>
          </table>

          {/* Extra Fields */}
          <div style={{ border: `1px solid ${borderColor}`, padding: "15px", margin: "15px", background: cardColor }}>
            <h4 style={{ margin: "0 0 10px 0", color: borderColor }}>Extra Fields (Modular)</h4>

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
                  placeholder="Key (e.g. slab_no)"
                  value={row.key}
                  onChange={(e) => handleExtraChange(idx, "key", e.target.value)}
                  style={{ padding: "6px", border: "1px solid #ccc" }}
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={row.value}
                  onChange={(e) => handleExtraChange(idx, "value", e.target.value)}
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
                    cursor: extraFields.length === 1 ? "not-allowed" : "pointer",
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

          {/* Submit */}
          <div style={{ textAlign: "center", margin: "20px 0" }}>
            <button
              type="submit"
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
              {loading ? "Creating WIR..." : "Create & Forward WIR"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// src/components/FormRenderer.jsx
import React, { useMemo } from "react";

const toUpper = (v) => String(v || "").toUpperCase();

const pickBlocks = (payload) =>
  payload?.template_version?.blocks ||
  payload?.template_version_blocks ||
  payload?.template_blocks ||
  payload?.blocks ||
  payload?.template?.blocks ||
  [];

const pickData = (payload) =>
  payload?.response?.data ||
  payload?.response_data ||
  payload?.data ||
  payload?.answers ||
  {};

function normalizeDateValue(v) {
  if (!v) return "";
  // handles "2025-12-12", "2025-12-12T10:20:30Z"
  const s = String(v);
  if (s.includes("T")) return s.slice(0, 10);
  return s.slice(0, 10);
}

function normalizeDateTimeValue(v) {
  if (!v) return "";
  // "2025-12-12T10:20:30+05:30" -> "2025-12-12T10:20"
  const s = String(v);
  if (!s.includes("T")) return "";
  return s.slice(0, 16);
}

function extractField(block) {
  if (!block || typeof block !== "object") return null;

  const f = block.field || block;
  const key = f.key || f.name || block.key || block.id;
  if (!key) return null;

  const rawType = toUpper(f.type || f.field_type || block.block_type || block.type || "TEXT");

  const label =
    f.label ||
    f.title ||
    block.label ||
    block.title ||
    key;

  const required = Boolean(f.required || block.required);

  const options =
    f.options ||
    block.options ||
    f.choices ||
    block.choices ||
    [];

  return { key, type: rawType, label, required, options, meta: f };
}

function getChildren(block) {
  return (
    block?.children ||
    block?.blocks ||
    block?.items ||
    block?.fields ||
    block?.rows ||
    []
  );
}

function isContainer(block) {
  const t = toUpper(block?.block_type || block?.type);
  return ["SECTION", "GROUP", "CONTAINER", "CARD", "COLUMN", "ROW"].includes(t);
}

function isLabel(block) {
  const t = toUpper(block?.block_type || block?.type);
  return ["LABEL", "TEXT_STATIC", "HEADING", "TITLE", "PARAGRAPH"].includes(t);
}

function renderLabel(block) {
  const text = block?.text || block?.label || block?.title || "";
  if (!text) return null;
  return <div className="fe-label">{text}</div>;
}

export default function FormRenderer({
  payload,          // whole API payload OR {blocks,data}
  blocks: blocksProp,
  value,
  onChange,
  readOnly = false,
}) {
  const blocks = useMemo(() => blocksProp || pickBlocks(payload) || [], [blocksProp, payload]);
  const data = value ?? pickData(payload) ?? {};

  const setVal = (k, v) => {
    if (readOnly) return;
    onChange?.({ ...data, [k]: v });
  };

  const renderField = (block) => {
    const field = extractField(block);
    if (!field) return null;

    const { key, type, label, required, options } = field;
    const v = data?.[key];

    const common = {
      id: key,
      name: key,
      disabled: readOnly,
      className: "fe-input",
    };

    if (type === "TEXTAREA") {
      return (
        <div className="fe-field" key={key}>
          <label className="fe-label-row" htmlFor={key}>
            {label}{required ? <span className="fe-req">*</span> : null}
          </label>
          <textarea
            {...common}
            rows={4}
            value={v ?? ""}
            onChange={(e) => setVal(key, e.target.value)}
          />
        </div>
      );
    }

    if (type === "NUMBER") {
      return (
        <div className="fe-field" key={key}>
          <label className="fe-label-row" htmlFor={key}>
            {label}{required ? <span className="fe-req">*</span> : null}
          </label>
          <input
            {...common}
            type="number"
            value={v ?? ""}
            onChange={(e) => setVal(key, e.target.value)}
          />
        </div>
      );
    }

    if (type === "DATE") {
      return (
        <div className="fe-field" key={key}>
          <label className="fe-label-row" htmlFor={key}>
            {label}{required ? <span className="fe-req">*</span> : null}
          </label>
          <input
            {...common}
            type="date"
            value={normalizeDateValue(v)}
            onChange={(e) => setVal(key, e.target.value)}
          />
        </div>
      );
    }

    if (type === "DATETIME" || type === "DATETIME_LOCAL" || type === "DATETIME-LOCAL") {
      return (
        <div className="fe-field" key={key}>
          <label className="fe-label-row" htmlFor={key}>
            {label}{required ? <span className="fe-req">*</span> : null}
          </label>
          <input
            {...common}
            type="datetime-local"
            value={normalizeDateTimeValue(v)}
            onChange={(e) => setVal(key, e.target.value)}
          />
        </div>
      );
    }

    if (type === "SELECT") {
      const opts = Array.isArray(options) ? options : [];
      return (
        <div className="fe-field" key={key}>
          <label className="fe-label-row" htmlFor={key}>
            {label}{required ? <span className="fe-req">*</span> : null}
          </label>
          <select
            {...common}
            value={v ?? ""}
            onChange={(e) => setVal(key, e.target.value)}
          >
            <option value="">Select</option>
            {opts.map((op, idx) => {
              const ov = op.value ?? op.key ?? op.id ?? op;
              const ol = op.label ?? op.title ?? op.name ?? String(ov);
              return <option key={`${key}-op-${idx}`} value={ov}>{ol}</option>;
            })}
          </select>
        </div>
      );
    }

    if (type === "CHECKBOX") {
      return (
        <div className="fe-field" key={key}>
          <label className="fe-checkbox">
            <input
              type="checkbox"
              disabled={readOnly}
              checked={Boolean(v)}
              onChange={(e) => setVal(key, e.target.checked)}
            />
            <span>{label}{required ? <span className="fe-req">*</span> : null}</span>
          </label>
        </div>
      );
    }

    if (type === "FILE" || type === "IMAGE" || type === "PHOTO" || type === "UPLOAD") {
      const url = typeof v === "string" ? v : v?.url || "";
      return (
        <div className="fe-field" key={key}>
          <label className="fe-label-row" htmlFor={key}>
            {label}{required ? <span className="fe-req">*</span> : null}
          </label>

          {url ? (
            <div className="fe-file-row">
              <a href={url} target="_blank" rel="noreferrer">View uploaded file</a>
            </div>
          ) : (
            <div className="fe-file-row fe-muted">No file uploaded</div>
          )}

          {!readOnly ? (
            <input
              {...common}
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setVal(key, file); // backend should accept multipart OR you handle upload separately
              }}
            />
          ) : null}
        </div>
      );
    }

    // default TEXT
    return (
      <div className="fe-field" key={key}>
        <label className="fe-label-row" htmlFor={key}>
          {label}{required ? <span className="fe-req">*</span> : null}
        </label>
        <input
          {...common}
          type="text"
          value={v ?? ""}
          onChange={(e) => setVal(key, e.target.value)}
        />
      </div>
    );
  };

  const renderBlock = (block, idx) => {
    if (!block) return null;

    if (isContainer(block)) {
      const title = block.title || block.label;
      const children = getChildren(block);
      return (
        <div className="fe-section" key={block.id || `${idx}-section`}>
          {title ? <div className="fe-section-title">{title}</div> : null}
          <div className="fe-section-body">
            {children.map((ch, i) => renderBlock(ch, i))}
          </div>
        </div>
      );
    }

    if (isLabel(block)) {
      return <div key={block.id || `${idx}-label`}>{renderLabel(block)}</div>;
    }

    return renderField(block);
  };

  return (
    <div className="fe-root">
      {blocks.map((b, i) => renderBlock(b, i))}
      <style>{`
        .fe-root{display:flex;flex-direction:column;gap:12px;}
        .fe-section{border:1px solid rgba(255,255,255,0.08);padding:12px;border-radius:10px;}
        .fe-section-title{font-weight:700;margin-bottom:8px;}
        .fe-section-body{display:flex;flex-direction:column;gap:12px;}
        .fe-field{display:flex;flex-direction:column;gap:6px;}
        .fe-label-row{font-size:13px;opacity:0.9}
        .fe-req{color:#ff6b6b;margin-left:4px;}
        .fe-input{padding:10px 12px;border-radius:10px;border:1px solid rgba(255,255,255,0.12);background:rgba(0,0,0,0.15);color:inherit;outline:none;}
        .fe-checkbox{display:flex;align-items:center;gap:10px;}
        .fe-file-row{font-size:13px;}
        .fe-muted{opacity:0.7}
        .fe-label{opacity:0.85;line-height:1.4}
      `}</style>
    </div>
  );
}

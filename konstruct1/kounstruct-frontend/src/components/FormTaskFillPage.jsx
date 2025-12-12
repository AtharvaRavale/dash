// src/components/FormTaskFillPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import FormRenderer from "./FormRenderer";
import { getFormTask, saveFormTask, forwardFormTask } from "../api";

export default function FormTaskFillPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  const [forwardTo, setForwardTo] = useState("");
  const [forwarding, setForwarding] = useState(false);

  const canEdit = useMemo(() => {
    return Boolean(payload?.can_edit ?? payload?.task?.can_edit ?? true);
  }, [payload]);

  const forwardUsers = useMemo(() => {
    return payload?.forward_users || payload?.users || payload?.task?.forward_users || [];
  }, [payload]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        const res = await getFormTask(taskId);
        if (!mounted) return;
        setPayload(res);

        const data =
          res?.response?.data ||
          res?.response_data ||
          res?.data ||
          {};
        setFormData(data);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load forwarded form task.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => (mounted = false);
  }, [taskId]);

  const onSave = async () => {
    try {
      setSaving(true);
      await saveFormTask(taskId, { data: formData });
      toast.success("Saved.");
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.detail || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const onForward = async () => {
    if (!forwardTo) return toast.error("Select user to forward.");
    try {
      setForwarding(true);
      // always save before forward
      await saveFormTask(taskId, { data: formData });
      const res = await forwardFormTask(taskId, { to_user_id: Number(forwardTo) });
      toast.success("Forwarded.");

      // important: navigate to your own task list OR the newly created task if backend returns it
      if (res?.new_task_id) navigate(`/forms/tasks/${res.new_task_id}`);
      else navigate(`/forms/tasks`); // fallback
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.detail || "Forward failed.");
    } finally {
      setForwarding(false);
    }
  };

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;
  if (!payload) return <div style={{ padding: 16 }}>No data</div>;

  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button disabled={!canEdit || saving} onClick={onSave}>
          {saving ? "Saving..." : "Save"}
        </button>

        <select
          value={forwardTo}
          onChange={(e) => setForwardTo(e.target.value)}
          disabled={!canEdit || forwarding}
        >
          <option value="">Forward to...</option>
          {forwardUsers.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name || u.username || u.email || `User ${u.id}`}
            </option>
          ))}
        </select>

        <button disabled={!canEdit || forwarding} onClick={onForward}>
          {forwarding ? "Forwarding..." : "Forward"}
        </button>
      </div>

      <FormRenderer
        payload={payload}
        value={formData}
        onChange={setFormData}
        readOnly={!canEdit}
      />
    </div>
  );
}

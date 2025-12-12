// src/components/MyFormResponseDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getFormResponse } from "../api";
import FormRenderer from "./FormRenderer";

export default function MyFormResponseDetailPage() {
  const { responseId } = useParams();
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const res = await getFormResponse(responseId);
        if (!mounted) return;
        setPayload(res);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load response.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, [responseId]);

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;
  if (!payload) return <div style={{ padding: 16 }}>No data</div>;

  return (
    <div style={{ padding: 16 }}>
      <FormRenderer payload={payload} readOnly />
    </div>
  );
}

// CRMHandoverForm.jsx
import React from "react";
import toast from "react-hot-toast";

export default function CRMHandoverForm({ meta, themeConfig, checklistInstance, onSuccess }) {
  const [dateStr, setDateStr] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const myCompletedId = meta?.my_completed_stagehistory_id;
  const crmDone = meta?.crm?.done;

  const todayStr = React.useMemo(() => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }, []);

  if (!myCompletedId || crmDone) return null;

  const handleSubmit = async () => {
    const effectiveDate = dateStr || todayStr;

    // block past date
    const chosen = new Date(effectiveDate + "T00:00:00");
    const today  = new Date(todayStr + "T00:00:00");
    if (chosen < today) {
      toast.error("Please choose today or a future date.");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("ACCESS_TOKEN");
      const base = checklistInstance?.defaults?.baseURL || "";
      const endsWithChecklists = /\/checklists\/?$/.test(base);
      const ENDPOINT = endsWithChecklists
        ? "/checklists/stagehistory/crm-update/"
        : "/checklists/checklists/stagehistory/crm-update/";

      await checklistInstance.post(
        ENDPOINT,
        { stagehistory_id: myCompletedId, crm_date: effectiveDate }, // ✅ correct key
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("✅ Handover sent to CRM");
      onSuccess?.({ effectiveDate });
      setTimeout(() => window.location.reload(), 500);

    } catch (e) {
      toast.error("❌ " + (e?.response?.data?.detail || e?.message || "Failed to handover to CRM"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8">
      <div
        className="relative border border-opacity-20 rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl"
        style={{
          background: `linear-gradient(145deg, ${themeConfig.cardBg}f5 0%, ${themeConfig.cardBg}ff 100%)`,
          borderColor: themeConfig.border,
          backdropFilter: 'blur(20px)',
          boxShadow: `0 8px 32px -8px ${themeConfig.accent}15`
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Animated background layer — make it non-interactive */}
        <div
          className="absolute inset-0 opacity-[0.03] transition-opacity duration-700 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, ${themeConfig.accent} 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${themeConfig.success} 0%, transparent 50%)`,
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            transition: 'transform 0.7s ease-out',
            zIndex: 0
          }}
        />

        {/* Header */}
        <div className="relative z-10 px-8 py-6 border-b border-opacity-10" style={{ borderColor: themeConfig.border }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="relative w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${themeConfig.accent}12, ${themeConfig.accent}25)`, border: `1px solid ${themeConfig.accent}20` }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M8 12L11 15L21 5M3 12L6 15L16 5" stroke={themeConfig.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight mb-1" style={{ color: themeConfig.textPrimary }}>
                  CRM Integration
                </h3>
                <p className="text-sm font-medium opacity-65" style={{ color: themeConfig.textSecondary }}>
                  Schedule handover process
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-8 py-8">
          {/* Status indicator (optional) */}
          <div
            className="mb-8 p-5 rounded-2xl border border-opacity-50"
            style={{ background: `linear-gradient(135deg, ${themeConfig.success}08, ${themeConfig.success}05)`, borderColor: `${themeConfig.success}20` }}
          >
            <h4 className="font-semibold text-base mb-2" style={{ color: themeConfig.textPrimary }}>
              Ready for Handover
            </h4>
            <p className="text-sm leading-relaxed opacity-80" style={{ color: themeConfig.textSecondary }}>
              Select your preferred handover date below and initiate the CRM process.
            </p>
          </div>

          {/* 🔁 REPLACE your old "Form Section" with this SINGLE-LINE action bar */}
          {/* One-line action bar */}
          <div className="mt-6 relative z-10">
            <div
              className="flex items-center gap-3 overflow-x-auto no-scrollbar"
              style={{ whiteSpace: 'nowrap' }}
            >
              {/* Accessible label (hidden visually) */}
              <label htmlFor="crm-date" className="sr-only">Handover Date</label>

              {/* Date input */}
              <input
                id="crm-date"
                type="date"
                min={todayStr}
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="px-4 py-3 rounded-xl border text-sm font-medium"
                style={{
                  background: `linear-gradient(135deg, ${themeConfig.cardBg}f8, ${themeConfig.cardBg}ff)`,
                  borderColor: dateStr ? themeConfig.accent : themeConfig.border,
                  color: themeConfig.textPrimary
                }}
              />

              {/* Initiate button */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: submitting
                    ? `linear-gradient(135deg, ${themeConfig.accent}60, ${themeConfig.accent}80)`
                    : `linear-gradient(135deg, ${themeConfig.accent}, ${themeConfig.accent}dd)`,
                  color: 'white',
                  border: `2px solid ${themeConfig.accent}`,
                  boxShadow: `0 4px 20px ${themeConfig.accent}30`
                }}
              >
                {submitting ? 'Processing Handover' : 'Initiate Handover'}
              </button>
            </div>
          </div>
        </div>

        <div
          className="h-1"
          style={{ background: `linear-gradient(90deg, transparent, ${themeConfig.accent}40, ${themeConfig.success}40, transparent)` }}
        />
      </div>
    </div>
  );
}

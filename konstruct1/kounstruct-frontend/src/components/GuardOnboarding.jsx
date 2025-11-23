// // components/GuardOnboarding.jsx
// import React, { useEffect, useRef, useState, useMemo } from "react";
// import { useNavigate } from "react-router-dom";
// import { useTheme } from "../ThemeContext";
// import { showToast } from "../utils/toast";
// import { onboardStaff, getProjectsForCurrentUser } from "../api";
// import SideBarSetup, { SIDEBAR_WIDTH } from "./SideBarSetup";
// import { useSidebar } from "./SidebarContext";

// function getActiveProjectIdFromAny() {
//   try {
//     const q = new URLSearchParams(window.location.search).get("project_id");
//     if (q) return Number(q);
//   } catch {}
//   const ls = localStorage.getItem("ACTIVE_PROJECT_ID");
//   if (ls) return Number(ls);
//   try {
//     const accesses = JSON.parse(localStorage.getItem("ACCESSES") || "[]");
//     const ids = [...new Set(accesses.map((a) => a.project_id).filter(Boolean))];
//     if (ids.length === 1) return ids[0];
//   } catch {}
//   return null;
// }

// // normalize API → [{id, name}]
// function coerceProjects(raw) {
//   const src =
//     (raw && Array.isArray(raw) && raw) ||
//     (raw && Array.isArray(raw.results) && raw.results) ||
//     (raw && Array.isArray(raw.items) && raw.items) ||
//     (raw &&
//       raw.data &&
//       ((Array.isArray(raw.data) && raw.data) ||
//         (Array.isArray(raw.data.results) && raw.data.results) ||
//         (Array.isArray(raw.data.items) && raw.data.items))) ||
//     [];
//   return src
//     .map((p) => {
//       const id = p.id ?? p.project_id ?? p.pk ?? p.uid;
//       const name =
//         p.name ?? p.title ?? p.project_name ?? p.display_name ?? `Project ${id}`;
//       return id ? { id: Number(id), name } : null;
//     })
//     .filter(Boolean);
// }

// export default function GuardOnboarding() {
//   const { theme } = useTheme();
//   const { sidebarOpen } = useSidebar();
//   const navigate = useNavigate();

//   // THEME palette (only these)
//   const ORANGE = "#ffbe63";
//   const BG_OFFWHITE = "#fcfaf7";
//   const bgColor = theme === "dark" ? "#191922" : BG_OFFWHITE;
//   const cardColor = theme === "dark" ? "#23232c" : "#fff";
//   const borderColor = ORANGE;
//   const textColor = theme === "dark" ? "#fff" : "#222";
//   const iconColor = ORANGE;

//   // Projects
//   const [projects, setProjects] = useState([]);
//   const [loadingProjects, setLoadingProjects] = useState(true);

//   // Form
//   const [projectId, setProjectId] = useState(getActiveProjectIdFromAny());
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [aadhaar, setAadhaar] = useState("");
//   const [imgFile, setImgFile] = useState(null);
//   const [submitting, setSubmitting] = useState(false);
//   const [username, setUsername] = useState("");
//   const prevPhoneRef = useRef("");

//   // Camera
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [streamActive, setStreamActive] = useState(false);

//   // Load projects
//   useEffect(() => {
//     (async () => {
//       try {
//         setLoadingProjects(true);
//         const res = await getProjectsForCurrentUser();
//         const list = coerceProjects(res);
//         setProjects(list);
//         const preset = getActiveProjectIdFromAny();
//         const presetInList = preset && list.some((p) => p.id === preset);
//         if (presetInList) setProjectId(preset);
//         else if (!preset && list.length === 1) setProjectId(list[0].id);
//       } catch (e) {
//         showToast("Failed to load your projects.", "error");
//       } finally {
//         setLoadingProjects(false);
//       }
//     })();
//   }, []);

//   // Boot camera
//   useEffect(() => {
//     let stream;
//     (async () => {
//       try {
//         stream = await navigator.mediaDevices.getUserMedia({ video: true });
//         if (videoRef.current) {
//           videoRef.current.srcObject = stream;
//           await videoRef.current.play();
//           setStreamActive(true);
//         }
//       } catch {
//         setStreamActive(false);
//       }
//     })();
//     return () => stream?.getTracks()?.forEach((t) => t.stop());
//   }, []);

//   const captureFrame = async () => {
//     if (!videoRef.current || !canvasRef.current) return null;
//     const v = videoRef.current;
//     const c = canvasRef.current;
//     c.width = v.videoWidth;
//     c.height = v.videoHeight;
//     const ctx = c.getContext("2d");
//     ctx.drawImage(v, 0, 0, c.width, c.height);
//     return new Promise((resolve) => c.toBlob((b) => resolve(b), "image/jpeg", 0.9));
//   };

//   const canSubmit = useMemo(
//     () => projectId && firstName && phone && (imgFile || streamActive),
//     [projectId, firstName, phone, imgFile, streamActive]
//   );

//   const onPhoneChange = (v) => {
//     setPhone(v);
//     setUsername((cur) => (cur === "" || cur === prevPhoneRef.current ? v : cur));
//     prevPhoneRef.current = v;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!canSubmit || submitting) return;
//     try {
//       setSubmitting(true);
//       let photoBlob = imgFile;
//       if (!photoBlob && streamActive) photoBlob = await captureFrame();
//       if (!photoBlob) {
//         showToast("Please provide a face photo (camera or upload).", "error");
//         setSubmitting(false);
//         return;
//       }
//       localStorage.setItem("ACTIVE_PROJECT_ID", String(projectId));
//       const safeUsername = (username || phone).trim();

//       const res = await onboardStaff({
//         project_id: Number(projectId),
//         // username: safeUsername,
//         username: (username).trim(),
//         first_name: firstName.trim(),
//         last_name: (lastName || "").trim(),
//         phone_number: phone.trim(),
//         adharcard_nummber: (aadhaar || "").trim(),
//         photo: photoBlob,
//       });
//       showToast("Onboarding successful ✅", "success");
//       const newUserId = res?.user_id || res?.data?.user_id;
//       navigate(`/guard/attendance?user_id=${newUserId}&project_id=${projectId}`);
//     } catch (err) {
//       const data = err?.response?.data;
//       const msg = data?.detail || data?.photo || "Onboarding failed";
//       showToast(msg, "error");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // robust sidebar offset (handles number export or {WIDTH})
//   const sidebarOffset = sidebarOpen
//     ? (typeof SIDEBAR_WIDTH === "number"
//         ? SIDEBAR_WIDTH
//         : (SIDEBAR_WIDTH?.WIDTH ?? 240))
//     : 0;

//   return (
//     <>
//       {/* Fixed sidebar with only guard links */}
//       <SideBarSetup
//         overrideNavItems={[
//           { name: "Onboarding", path: "/guard/onboarding" },
//           { name: "Attendance", path: "/guard/attendance" },
//         ]}
//       />

//       {/* Palette-only styles */}
//       <style>{`
//         .guard-page input, .guard-page select, .guard-page button, .guard-page textarea {
//           color: ${textColor};
//         }
//         .guard-card { background: ${cardColor}; border: 2px solid ${borderColor}; }
//         .guard-accent { color: ${iconColor}; }

//         .guard-input {
//           background: ${cardColor};
//           border: 2px solid ${theme === "dark" ? "rgba(255,190,99,.85)" : "rgba(255,190,99,.65)"};
//           border-radius: 10px;
//         }
//         .guard-input:hover {
//           box-shadow: 0 0 0 3px ${theme === "dark" ? "rgba(255,190,99,.15)" : "rgba(255,190,99,.12)"} inset;
//         }
//         .guard-input:focus {
//           outline: none;
//           box-shadow: 0 0 0 3px ${theme === "dark" ? "rgba(255,190,99,.28)" : "rgba(255,190,99,.2)"};
//         }

//         .guard-primary { background: ${iconColor}; color: #fff; }
//         .guard-primary:hover { filter: brightness(0.95); }
//         .guard-outline { border: 2px solid ${borderColor}; color: ${textColor}; background: transparent; }

//         /* Center the content area (right of the sidebar) */
//         .guard-shell {
//           min-height: calc(100vh - 32px);
//           display: grid;
//           place-items: start center; /* top + horizontally centered */
//           padding: 24px 16px 48px;
//           gap: 12px;
//         }
//       `}</style>

//       {/* Background + centered content to the right of sidebar */}
//       <div className="guard-page" style={{ background: bgColor, minHeight: "100vh" }}>
//         <main className="guard-shell" style={{ marginLeft: sidebarOffset }}>
//           <div className="w-full max-w-3xl">
//             {/* Header */}
//             <div className="mb-6 text-center">
//               <div className="text-sm guard-accent font-semibold tracking-widest uppercase">
//                 Security
//               </div>
//               <h1 className="text-3xl font-bold mt-1" style={{ color: textColor }}>
//                 Staff Onboarding
//               </h1>
//               <p className="mt-2" style={{ color: textColor, opacity: 0.8 }}>
//                 Add a new staff with project
//               </p>
//             </div>

//             {/* Card */}
//             <form onSubmit={handleSubmit} className="guard-card rounded-2xl p-6 space-y-6">
//               {/* Project & Contact */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <label className="flex flex-col">
//                   <span className="font-medium" style={{ color: textColor }}>
//                     Project <span className="guard-accent">*</span>
//                   </span>
//                   <select
//                     className="guard-input mt-1 p-2 rounded"
//                     disabled={loadingProjects || projects.length === 0}
//                     value={projectId || ""}
//                     onChange={(e) =>
//                       setProjectId(e.target.value ? Number(e.target.value) : null)
//                     }
//                   >
//                     <option value="">
//                       {loadingProjects ? "Loading..." : "Select project"}
//                     </option>
//                     {projects.map((p) => (
//                       <option key={p.id} value={p.id}>
//                         {p.name} 
//                       </option>
//                     ))}
//                   </select>
//                   {!loadingProjects && projects.length === 0 && (
//                     <span className="text-xs mt-1" style={{ color: textColor, opacity: 0.7 }}>
//                       No projects found for your account.
//                     </span>
//                   )}
//                 </label>

//                 <label className="flex flex-col">
//                   <span className="font-medium" style={{ color: textColor }}>
//                     Phone Number <span className="guard-accent">*</span>
//                   </span>
//                   <input
//             type="tel"
//             className="guard-input mt-1 p-2 rounded"
//             value={phone}
//             onChange={(e) => onPhoneChange(e.target.value)}   // <-- changed
//             placeholder="10–13 digits"
//             required
//           />
//         </label>

//            {/* NEW Username field */}
//         <label className="flex flex-col">
//           <span className="font-medium" style={{ color: textColor }}>
//             Username
//           </span>
//           <input
//             className="guard-input mt-1 p-2 rounded"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             placeholder="(defaults to phone if left blank)"
//           />
//         </label>

//                 <label className="flex flex-col">
//                   <span className="font-medium" style={{ color: textColor }}>
//                     First Name <span className="guard-accent">*</span>
//                   </span>
//                   <input
//                     className="guard-input mt-1 p-2 rounded"
//                     value={firstName}
//                     onChange={(e) => setFirstName(e.target.value)}
//                     required
//                   />
//                 </label>

//                 <label className="flex flex-col">
//                   <span className="font-medium" style={{ color: textColor }}>
//                     Last Name
//                   </span>
//                   <input
//                     className="guard-input mt-1 p-2 rounded"
//                     value={lastName}
//                     onChange={(e) => setLastName(e.target.value)}
//                   />
//                 </label>

//                 <label className="flex flex-col md:col-span-2">
//                   <span className="font-medium" style={{ color: textColor }}>
//                     Aadhaar (12 digits)
//                   </span>
//                   <input
//                     className="guard-input mt-1 p-2 rounded"
//                     value={aadhaar}
//                     onChange={(e) =>
//                       setAadhaar(e.target.value.replace(/\D/g, "").slice(0, 12))
//                     }
//                     placeholder="Optional"
//                     inputMode="numeric"
//                     pattern="\d{12}"
//                   />
//                 </label>
//               </div>

//               {/* Camera / Upload */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
//                 <div>
//                   <div className="font-semibold mb-2 guard-accent">Live Camera</div>
//                   <div className="rounded overflow-hidden" style={{ border: `2px solid ${borderColor}` }}>
//                     {streamActive ? (
//                       <video ref={videoRef} playsInline muted style={{ width: "100%", display: "block" }} />
//                     ) : (
//                       <div className="p-4 text-sm" style={{ color: textColor, opacity: 0.8 }}>
//                         Camera unavailable. Use file upload instead.
//                       </div>
//                     )}
//                   </div>
//                   <canvas ref={canvasRef} style={{ display: "none" }} />
//                 </div>

//                 <div>
//                   <div className="font-semibold mb-2 guard-accent">Or Upload Photo</div>
//                   <input
//                     type="file"
//                     accept="image/*"
//                     className="guard-input p-2 rounded w-full"
//                     onChange={(e) => setImgFile(e.target.files?.[0] || null)}
//                   />
//                   {imgFile && (
//                     <div className="text-xs mt-2" style={{ color: textColor, opacity: 0.8 }}>
//                       Selected: {imgFile.name}
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Actions */}
//               <div className="flex gap-3 justify-center">
//                 <button
//                   type="submit"
//                   className="guard-primary px-5 py-2 rounded font-semibold"
//                   disabled={!canSubmit || submitting}
//                   style={{
//                     opacity: !canSubmit || submitting ? 0.6 : 1,
//                     cursor: !canSubmit || submitting ? "not-allowed" : "pointer",
//                   }}
//                 >
//                   {submitting ? "Submitting..." : "Onboard Guard"}
//                 </button>

//                 <button
//                   type="button"
//                   className="guard-outline px-5 py-2 rounded font-semibold"
//                   onClick={() =>
//                     navigate("/guard/attendance" + (projectId ? `?project_id=${projectId}` : ""))
//                   }
//                 >
//                   Go to Attendance
//                 </button>
//               </div>
//             </form>
//           </div>
//         </main>
//       </div>
//     </>
//   );
// }
// components/GuardOnboarding.jsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import { showToast } from "../utils/toast";
import { onboardStaff, getProjectsForCurrentUser } from "../api";
import SideBarSetup, { SIDEBAR_WIDTH } from "./SideBarSetup";
import { useSidebar } from "./SidebarContext";

function getActiveProjectIdFromAny() {
  try {
    const q = new URLSearchParams(window.location.search).get("project_id");
    if (q) return Number(q);
  } catch {}
  const ls = localStorage.getItem("ACTIVE_PROJECT_ID");
  if (ls) return Number(ls);
  try {
    const accesses = JSON.parse(localStorage.getItem("ACCESSES") || "[]");
    const ids = [...new Set(accesses.map((a) => a.project_id).filter(Boolean))];
    if (ids.length === 1) return ids[0];
  } catch {}
  return null;
}

// normalize API → [{id, name}]
function coerceProjects(raw) {
  const src =
    (raw && Array.isArray(raw) && raw) ||
    (raw && Array.isArray(raw.results) && raw.results) ||
    (raw && Array.isArray(raw.items) && raw.items) ||
    (raw &&
      raw.data &&
      ((Array.isArray(raw.data) && raw.data) ||
        (Array.isArray(raw.data.results) && raw.data.results) ||
        (Array.isArray(raw.data.items) && raw.data.items))) ||
    [];
  return src
    .map((p) => {
      const id = p.id ?? p.project_id ?? p.pk ?? p.uid;
      const name =
        p.name ?? p.title ?? p.project_name ?? p.display_name ?? `Project ${id}`;
      return id ? { id: Number(id), name } : null;
    })
    .filter(Boolean);
}

export default function GuardOnboarding() {
  const { theme } = useTheme();
  const { sidebarOpen } = useSidebar();
  const navigate = useNavigate();

  // THEME palette (only these)
  const ORANGE = "#ffbe63";
  const BG_OFFWHITE = "#fcfaf7";
  const bgColor = theme === "dark" ? "#191922" : BG_OFFWHITE;
  const cardColor = theme === "dark" ? "#23232c" : "#fff";
  const borderColor = ORANGE;
  const textColor = theme === "dark" ? "#fff" : "#222";
  const iconColor = ORANGE;

  // Projects
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Form
  const [projectId, setProjectId] = useState(getActiveProjectIdFromAny());
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [imgFile, setImgFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [username, setUsername] = useState("");
  const prevPhoneRef = useRef("");

  // Camera
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streamActive, setStreamActive] = useState(false);

  // Load projects
  useEffect(() => {
    (async () => {
      try {
        setLoadingProjects(true);
        const res = await getProjectsForCurrentUser();
        const list = coerceProjects(res);
        setProjects(list);
        const preset = getActiveProjectIdFromAny();
        const presetInList = preset && list.some((p) => p.id === preset);
        if (presetInList) setProjectId(preset);
        else if (!preset && list.length === 1) setProjectId(list[0].id);
      } catch (e) {
        showToast("Failed to load your projects.", "error");
      } finally {
        setLoadingProjects(false);
      }
    })();
  }, []);

  // Boot camera
  useEffect(() => {
    let stream;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setStreamActive(true);
        }
      } catch {
        setStreamActive(false);
      }
    })();
    return () => stream?.getTracks()?.forEach((t) => t.stop());
  }, []);

  const captureFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return null;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext("2d");
    ctx.drawImage(v, 0, 0, c.width, c.height);
    return new Promise((resolve) => c.toBlob((b) => resolve(b), "image/jpeg", 0.9));
  };

  const canSubmit = useMemo(
    () => projectId && firstName && phone && (imgFile || streamActive),
    [projectId, firstName, phone, imgFile, streamActive]
  );

  const onPhoneChange = (v) => {
    setPhone(v);
    setUsername((cur) => (cur === "" || cur === prevPhoneRef.current ? v : cur));
    prevPhoneRef.current = v;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    try {
      setSubmitting(true);
      let photoBlob = imgFile;
      if (!photoBlob && streamActive) photoBlob = await captureFrame();
      if (!photoBlob) {
        showToast("Please provide a face photo (camera or upload).", "error");
        setSubmitting(false);
        return;
      }
      localStorage.setItem("ACTIVE_PROJECT_ID", String(projectId));
      const safeUsername = (username || phone).trim();

      const res = await onboardStaff({
        project_id: Number(projectId),
        username: (username).trim(),
        first_name: firstName.trim(),
        last_name: (lastName || "").trim(),
        phone_number: phone.trim(),
        adharcard_nummber: (aadhaar || "").trim(),
        photo: photoBlob,
      });
      showToast("Onboarding successful ✅", "success");
      const newUserId = res?.user_id || res?.data?.user_id;
      navigate(`/guard/attendance?user_id=${newUserId}&project_id=${projectId}`);
    } catch (err) {
      const data = err?.response?.data;
      const msg = data?.detail || data?.photo || "Onboarding failed";
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // robust sidebar offset (handles number export or {WIDTH})
  const sidebarOffset = sidebarOpen
    ? (typeof SIDEBAR_WIDTH === "number"
        ? SIDEBAR_WIDTH
        : (SIDEBAR_WIDTH?.WIDTH ?? 240))
    : 0;

  return (
    <>
      {/* Fixed sidebar with only guard links */}
      <SideBarSetup
        overrideNavItems={[
          { name: "Onboarding", path: "/guard/onboarding" },
          { name: "Attendance", path: "/guard/attendance" },
        ]}
      />

      {/* Palette-only styles */}
      <style>{`
        .guard-page input, .guard-page select, .guard-page button, .guard-page textarea {
          color: ${textColor};
          font-size: 14px;
        }
        .guard-card { 
          background: ${cardColor}; 
          border: 1px solid ${theme === "dark" ? "rgba(255,190,99,.25)" : "rgba(255,190,99,.2)"};
          box-shadow: 0 2px 8px ${theme === "dark" ? "rgba(0,0,0,.3)" : "rgba(0,0,0,.06)"};
        }
        .guard-accent { color: ${iconColor}; }

        .guard-input {
          background: ${cardColor};
          border: 1px solid ${theme === "dark" ? "rgba(255,190,99,.35)" : "rgba(255,190,99,.3)"};
          border-radius: 8px;
          transition: all 0.2s ease;
          font-size: 14px;
          padding: 10px 12px;
        }
        .guard-input:hover {
          border-color: ${theme === "dark" ? "rgba(255,190,99,.5)" : "rgba(255,190,99,.45)"};
        }
        .guard-input:focus {
          outline: none;
          border-color: ${iconColor};
          box-shadow: 0 0 0 3px ${theme === "dark" ? "rgba(255,190,99,.15)" : "rgba(255,190,99,.1)"};
        }
        .guard-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .guard-primary { 
          background: ${iconColor}; 
          color: #222; 
          font-weight: 600;
          border-radius: 8px;
          padding: 12px 24px;
          transition: all 0.2s ease;
          border: none;
        }
        .guard-primary:hover:not(:disabled) { 
          filter: brightness(1.05);
          box-shadow: 0 4px 12px rgba(255,190,99,.3);
        }
        .guard-primary:active:not(:disabled) {
          transform: translateY(1px);
        }
        .guard-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .guard-outline { 
          border: 1px solid ${theme === "dark" ? "rgba(255,190,99,.4)" : "rgba(255,190,99,.35)"}; 
          color: ${textColor}; 
          background: transparent;
          border-radius: 8px;
          padding: 10px 20px;
          font-weight: 500;
          transition: all 0.2s ease;
          font-size: 14px;
        }
        .guard-outline:hover {
          background: ${theme === "dark" ? "rgba(255,190,99,.08)" : "rgba(255,190,99,.06)"};
          border-color: ${iconColor};
        }

        .guard-label {
          font-weight: 600;
          font-size: 13px;
          margin-bottom: 6px;
          display: block;
          letter-spacing: 0.3px;
        }

        .guard-section-title {
          font-weight: 600;
          font-size: 15px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          letter-spacing: 0.3px;
        }

        .guard-shell {
          min-height: calc(100vh - 32px);
          padding: 32px 24px 48px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }

        .guard-badge {
          display: inline-block;
          background: ${theme === "dark" ? "rgba(255,190,99,.15)" : "rgba(255,190,99,.12)"};
          color: ${iconColor};
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .guard-video-container {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid ${theme === "dark" ? "rgba(255,190,99,.25)" : "rgba(255,190,99,.2)"};
          background: ${theme === "dark" ? "#1a1a24" : "#f8f8f8"};
        }

        .guard-file-selected {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: ${theme === "dark" ? "rgba(255,190,99,.1)" : "rgba(255,190,99,.08)"};
          border-radius: 6px;
          font-size: 13px;
          margin-top: 8px;
        }

        .guard-field-hint {
          font-size: 12px;
          margin-top: 4px;
          opacity: 0.7;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Background + centered content to the right of sidebar */}
      <div className="guard-page" style={{ background: bgColor, minHeight: "100vh" }}>
        <main className="guard-shell" style={{ marginLeft: sidebarOffset }}>
          <div className="w-full max-w-4xl">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="guard-badge mb-3">
                Security Portal
              </div>
              <h1 className="text-4xl font-bold" style={{ color: textColor }}>
                Staff Onboarding
              </h1>
              <p className="mt-3 text-base" style={{ color: textColor, opacity: 0.7 }}>
                Register new staff members with facial recognition
              </p>
            </div>

            {/* Card */}
            <form onSubmit={handleSubmit} className="guard-card rounded-xl p-8 space-y-8">
              {/* Project Selection */}
              <div>
                <h2 className="guard-section-title" style={{ color: textColor }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  Project Assignment
                </h2>
                <div className="mt-4">
                  <label className="guard-label" style={{ color: textColor }}>
                    Select Project <span className="guard-accent">*</span>
                  </label>
                  <select
                    className="guard-input w-full"
                    disabled={loadingProjects || projects.length === 0}
                    value={projectId || ""}
                    onChange={(e) =>
                      setProjectId(e.target.value ? Number(e.target.value) : null)
                    }
                  >
                    <option value="">
                      {loadingProjects ? "Loading projects..." : "Select a project"}
                    </option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} 
                      </option>
                    ))}
                  </select>
                  {!loadingProjects && projects.length === 0 && (
                    <p className="guard-field-hint" style={{ color: textColor }}>
                      No projects found for your account.
                    </p>
                  )}
                </div>
              </div>

              <div style={{ borderTop: `1px solid ${theme === "dark" ? "rgba(255,190,99,.15)" : "rgba(255,190,99,.12)"}` }} />

              {/* Personal Information */}
              <div>
                <h2 className="guard-section-title" style={{ color: textColor }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                  <div>
                    <label className="guard-label" style={{ color: textColor }}>
                      First Name <span className="guard-accent">*</span>
                    </label>
                    <input
                      className="guard-input w-full"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter first name"
                      required
                    />
                  </div>

                  <div>
                    <label className="guard-label" style={{ color: textColor }}>
                      Last Name
                    </label>
                    <input
                      className="guard-input w-full"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter last name (optional)"
                    />
                  </div>

                  <div>
                    <label className="guard-label" style={{ color: textColor }}>
                      Phone Number <span className="guard-accent">*</span>
                    </label>
                    <input
                      type="tel"
                      className="guard-input w-full"
                      value={phone}
                      onChange={(e) => onPhoneChange(e.target.value)}
                      placeholder="10-13 digits"
                      required
                    />
                    <p className="guard-field-hint" style={{ color: textColor }}>
                      Primary contact number
                    </p>
                  </div>

                  <div>
                    <label className="guard-label" style={{ color: textColor }}>
                      Username
                    </label>
                    <input
                      className="guard-input w-full"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Defaults to phone number"
                    />
                    <p className="guard-field-hint" style={{ color: textColor }}>
                      Optional - auto-filled from phone
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="guard-label" style={{ color: textColor }}>
                      Aadhaar Number
                    </label>
                    <input
                      className="guard-input w-full"
                      value={aadhaar}
                      onChange={(e) =>
                        setAadhaar(e.target.value.replace(/\D/g, "").slice(0, 12))
                      }
                      placeholder="12-digit Aadhaar (optional)"
                      inputMode="numeric"
                      pattern="\d{12}"
                    />
                    <p className="guard-field-hint" style={{ color: textColor }}>
                      Optional government ID
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: `1px solid ${theme === "dark" ? "rgba(255,190,99,.15)" : "rgba(255,190,99,.12)"}` }} />

              {/* Photo Capture */}
              <div>
                <h2 className="guard-section-title" style={{ color: textColor }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                  Facial Recognition Setup
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                  <div>
                    <label className="guard-label" style={{ color: textColor }}>Live Camera Feed</label>
                    <div className="guard-video-container">
                      {streamActive ? (
                        <video ref={videoRef} playsInline muted style={{ width: "100%", display: "block", minHeight: "280px" }} />
                      ) : (
                        <div className="p-8 text-center" style={{ color: textColor, opacity: 0.6, minHeight: "280px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px" }}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                            <circle cx="12" cy="13" r="4"/>
                          </svg>
                          <div className="text-sm">Camera unavailable</div>
                          <div className="text-xs">Please use file upload instead</div>
                        </div>
                      )}
                    </div>
                    <canvas ref={canvasRef} style={{ display: "none" }} />
                  </div>

                  <div>
                    <label className="guard-label" style={{ color: textColor }}>Upload Photo (Alternative)</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="guard-input w-full"
                      onChange={(e) => setImgFile(e.target.files?.[0] || null)}
                    />
                    {imgFile && (
                      <div className="guard-file-selected" style={{ color: textColor }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                          <polyline points="13 2 13 9 20 9"/>
                        </svg>
                        <span>{imgFile.name}</span>
                        <button 
                          type="button"
                          className="text-xs underline ml-2" 
                          onClick={() => setImgFile(null)}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                    <div className="mt-6 p-4 rounded-lg" style={{ background: theme === "dark" ? "rgba(255,190,99,.08)" : "rgba(255,190,99,.06)", border: `1px solid ${theme === "dark" ? "rgba(255,190,99,.2)" : "rgba(255,190,99,.15)"}` }}>
                      <div className="text-sm font-medium mb-2" style={{ color: textColor }}>Photo Guidelines:</div>
                      <ul className="text-xs space-y-1" style={{ color: textColor, opacity: 0.8 }}>
                        <li>• Clear, well-lit frontal face photo</li>
                        <li>• No sunglasses or face coverings</li>
                        <li>• Neutral expression recommended</li>
                        <li>• Used for attendance verification</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <button
                  type="submit"
                  className="guard-primary"
                  disabled={!canSubmit || submitting}
                  style={{
                    opacity: !canSubmit || submitting ? 0.5 : 1,
                    cursor: !canSubmit || submitting ? "not-allowed" : "pointer",
                  }}
                >
                  {submitting ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{display: "inline", marginRight: "8px", animation: "spin 1s linear infinite"}}>
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{display: "inline", marginRight: "8px"}}>
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="8.5" cy="7" r="4"/>
                        <line x1="20" y1="8" x2="20" y2="14"/>
                        <line x1="23" y1="11" x2="17" y2="11"/>
                      </svg>
                      Complete Onboarding
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="guard-outline"
                  onClick={() =>
                    navigate("/guard/attendance" + (projectId ? `?project_id=${projectId}` : ""))
                  }
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{display: "inline", marginRight: "8px"}}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  Go to Attendance
                </button>
              </div>

              {!canSubmit && (
                <p className="text-sm text-center" style={{ color: textColor, opacity: 0.6 }}>
                  {!projectId ? "Select a project to continue" : 
                   !firstName || !phone ? "Fill in required fields (marked with *)" : 
                   "Provide a photo to complete onboarding"}
                </p>
              )}
            </form>
          </div>
        </main>
      </div>
    </>
  );
}
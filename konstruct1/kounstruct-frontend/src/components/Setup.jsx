// import React, { useState, useEffect } from "react";
// import {
//   FileText, Layers, Building2, Building, MapPin, Home, Package, FileCheck
// } from "lucide-react";
// import Projects from "../containers/setup/Projects";
// import Stages from "../containers/setup/Stages";
// import Zone from "../containers/setup/Zone";
// import FlatType from "../containers/setup/FlatType";
// import Unit from "../containers/setup/Unit";
// import TransferRules from "../containers/setup/TransferRules";
// import Tower from "../containers/setup/Tower";
// import Level from "../containers/setup/Level";
// import { useSelector, useDispatch } from "react-redux";
// import { setSelectedProject } from "../store/userSlice";
// import { useTheme } from "../ThemeContext";
// import { useNavigate } from "react-router-dom";
// import projectImage from "../Images/Project.png";

// // Utility to get role
// function getUserRole() {
//   try {
//     return localStorage.getItem("ROLE") || "";
//   } catch {
//     return "";
//   }
// }

// const ORANGE = "#ffbe63";
// const BG_OFFWHITE = "#fcfaf7";

// // Project name badge palette (same as Configuration page)
// const palette = {
//   projectNameBg: "#fffbe7",
//   projectNameColor: "#ea7d19",
// };

// const SETUP_STEPS = [
//   { key: "project", label: "Project", icon: FileText },
//   { key: "stages", label: "Stages", icon: Layers },
//   { key: "tower", label: "Tower", icon: Building2 },
//   { key: "level", label: "Level", icon: Building },
//   { key: "zone", label: "Zone", icon: MapPin },
//   { key: "flatType", label: "Flat Type", icon: Home },
//   { key: "unit", label: "Units", icon: Package },
//   { key: "transferRules", label: "Transfer Rules", icon: FileCheck },
// ];

// // Modal that triggers redirect on close
// function NotAllowedModal({ onClose }) {
//   return (
//     <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
//       <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full text-center">
//         <h2 className="text-2xl font-bold text-red-600 mb-3">Not Allowed</h2>
//         <p className="text-gray-700 mb-6">
//           You do not have permission to access this setup page.
//         </p>
//         <button
//           className="px-6 py-2 bg-orange-500 text-white font-semibold rounded-lg shadow hover:bg-orange-600 transition"
//           onClick={onClose}
//         >
//           Go to Initialize Checklist
//         </button>
//       </div>
//     </div>
//   );
// }

// function Setup() {
//   const dispatch = useDispatch();
//   const { theme } = useTheme();
//   const navigate = useNavigate();
//   const [showModal, setShowModal] = useState(false);

//   // Color palette for the rest
//   const bgColor = theme === "dark" ? "#191922" : BG_OFFWHITE;
//   const cardColor = theme === "dark" ? "#23232c" : "#fff";
//   const borderColor = ORANGE;
//   const textColor = theme === "dark" ? "#fff" : "#222";
//   const iconColor = ORANGE;

//   // Restrict for Intializer
//   useEffect(() => {
//     const role = getUserRole();
//     if (role === "Intializer") setShowModal(true);
//   }, []);

//   const handleModalClose = () => {
//     setShowModal(false);
//     navigate("/Initialize-Checklist");
//   };

//   const userId = useSelector((state) => state.user.user.id);
//   const selectedProject = useSelector((state) => state.user.selectedProject); // Get project object
//   const selectedProjectId = selectedProject?.id;

//   const purposes = useSelector((state) => state.user.purposes);
//   const phases = useSelector((state) => state.user.phases);
//   const stages = useSelector((state) => state.user.stages);

//   const [setup, setSetup] = useState("project");
//   const next = [
//     "project",
//     "stages",
//     "tower",
//     "level",
//     "zone",
//     "flatType",
//     "unit",
//     "transferRules",
//   ];

//   const nextStep = () => {
//     const currentIndex = next.indexOf(setup);
//     if (currentIndex < next.length - 1) setSetup(next[currentIndex + 1]);
//   };

//   const previousStep = () => {
//     const currentIndex = next.indexOf(setup);
//     if (currentIndex > 0) setSetup(next[currentIndex - 1]);
//   };

//   const onProjectSetupComplete = (project) => {
//     dispatch(setSelectedProject(project));
//     setSetup("stages");
//   };

//   const isStageData = React.useCallback(() => {
//     const projectPurposes = purposes?.[selectedProjectId];
//     const projectPhases = phases?.[selectedProjectId];
//     const projectStages = stages?.[selectedProjectId];
//     return (
//       Array.isArray(projectPurposes) && projectPurposes.length > 0 &&
//       Array.isArray(projectPhases) && projectPhases.length > 0 &&
//       Array.isArray(projectStages) && projectStages.length > 0
//     );
//   }, [selectedProjectId, purposes, phases, stages]);

//   const getStepIndex = (stepKey) => SETUP_STEPS.findIndex(s => s.key === stepKey);
//   const currentStepIndex = getStepIndex(setup);

//   // const isStepDisabled = (stepKey) => {
//   //   const stepIndex = getStepIndex(stepKey);
//   //   if (stepKey === "project") return !userId;
//   //   if (stepKey === "stages") return !selectedProjectId;
//   //   if (stepIndex > 1) return !selectedProjectId || !isStageData();
//   //   return false;
//   // };
//   const isStepDisabled = (stepKey) => false; // All steps always enabled

//   const isStepCompleted = (stepKey) => getStepIndex(stepKey) < currentStepIndex;

//   // ----- For image and project name badge -----
//   const projectImgUrl = selectedProject?.image || projectImage;
//   const projectName = selectedProject?.name || selectedProject?.project_name || "";

//   if (showModal) return <NotAllowedModal onClose={handleModalClose} />;

//   return (
//     <div className="flex flex-col min-h-screen" style={{ background: bgColor }}>
//       {/* Stepper */}
//       <div
//         className="rounded-2xl shadow-lg p-6 mb-8 border mx-auto mt-8"
//         style={{
//           background: cardColor,
//           borderColor: borderColor,
//           maxWidth: 1200,
//           width: "100%",
//         }}
//       >
//         <div className="flex items-center justify-between overflow-x-auto">
//           {SETUP_STEPS.map((step, idx) => {
//             const Icon = step.icon;
//             const isActive = setup === step.key;
//             const isCompleted = isStepCompleted(step.key);
//             const isDisabled = isStepDisabled(step.key);

//             return (
//               <React.Fragment key={step.key}>
//                 <button
//                   className={`
//                     flex flex-col items-center justify-center min-w-[120px] px-4 py-3 rounded-lg
//                     transition-all duration-300
//                     ${isActive ? "scale-105 shadow-lg" : isCompleted ? "shadow" : ""}
//                     ${isDisabled ? "opacity-60 cursor-not-allowed" : "hover:scale-105"}
//                   `}
//                   disabled={isDisabled}
//                   onClick={() => !isDisabled && setSetup(step.key)}
//                   style={{
//                     background: isActive || isCompleted ? iconColor : cardColor,
//                     color: isActive || isCompleted ? "#fff" : textColor,
//                     border: `2px solid ${borderColor}`,
//                     boxShadow: isActive ? "0 2px 10px #0002" : undefined,
//                     fontWeight: 700,
//                     fontSize: "1rem",
//                     borderRadius: 14,
//                     minHeight: 56,
//                     minWidth: 112,
//                     padding: "8px 18px",
//                   }}
//                 >
//                   <span
//                     className="
//                       flex items-center justify-center w-10 h-8 rounded-md mb-1
//                       font-bold text-base
//                     "
//                     style={{
//                       background: cardColor,
//                       color: iconColor,
//                       border: `2px solid ${borderColor}`,
//                       borderRadius: 6,
//                       minWidth: 40,
//                     }}
//                   >
//                     {idx + 1}
//                   </span>
//                   <Icon size={20} color={iconColor} style={{ marginBottom: 2 }} />
//                   <span className="font-bold tracking-wide">{step.label}</span>
//                 </button>
//                 {idx < SETUP_STEPS.length - 1 && (
//                   <div className="flex-1 h-1 mx-2"
//                     style={{
//                       background: borderColor,
//                       minWidth: 38,
//                       borderRadius: 8,
//                     }}
//                   ></div>
//                 )}
//               </React.Fragment>
//             );
//           })}
//         </div>
//         {/* Progress Bar */}
//         <div className="mt-6">
//           <div className={`flex justify-between text-xs mb-2`} style={{ color: textColor }}>
//             <span>Progress</span>
//             <span>
//               {Math.round((currentStepIndex / (SETUP_STEPS.length - 1)) * 100)}% Complete
//             </span>
//           </div>
//           <div
//             className="w-full rounded-full h-2 overflow-hidden"
//             style={{ background: cardColor }}
//           >
//             <div
//               className="h-full rounded-full transition-all duration-500"
//               style={{
//                 width: `${(currentStepIndex / (SETUP_STEPS.length - 1)) * 100}%`,
//                 background: iconColor
//               }}
//             ></div>
//           </div>
//         </div>
//       </div>
//       {/* ----------- Project image and name ---------- */}
//       {setup === "project" && selectedProjectId && (
//         <div className="flex flex-col items-center my-4">
//           <img
//             src={projectImgUrl}
//             alt={projectName}
//             className="rounded-2xl object-cover shadow-lg"
//             style={{
//               width: 240,
//               height: 200,
//               objectFit: "cover",
//               border: `2px solid`,
//               marginBottom: 10,
//               background: "#f5f5f5"
//             }}
//           />
//           <div
//             style={{
//               background: palette.projectNameBg,
//               color: palette.projectNameColor,
//               fontWeight: 600,
//               borderRadius: 12,
//               padding: "8px 24px",
//               fontSize: "1.15rem",
//               marginTop: 4,
//               textAlign: "center",
//               boxShadow: "0 2px 6px #0001"
//             }}
//           >
//             {projectName || "Project Name"}
//           </div>
//         </div>
//       )}

//       {/* Content */}
//       <div
//         className="rounded-2xl shadow-lg p-8 flex-1 border mx-auto mb-8"
//         style={{
//           background: cardColor,
//           borderColor: borderColor,
//           color: textColor,
//           maxWidth: 1200,
//           width: "100%",
//         }}
//       >
//         <div className="setup-container w-full h-full">
//           {setup === "project" && (
//             <Projects
//               nextStep={nextStep}
//               onProjectSetupComplete={onProjectSetupComplete}
//             />
//           )}
//           {setup === "stages" && (
//             <Stages nextStep={nextStep} previousStep={previousStep} />
//           )}
//           {setup === "tower" && (
//             <Tower nextStep={nextStep} previousStep={previousStep} />
//           )}
//           {setup === "level" && (
//             <Level nextStep={nextStep} previousStep={previousStep} />
//           )}
//           {setup === "zone" && (
//             <Zone nextStep={nextStep} previousStep={previousStep} />
//           )}
//           {setup === "flatType" && (
//             <FlatType nextStep={nextStep} previousStep={previousStep} />
//           )}
//           {setup === "unit" && (
//             <Unit nextStep={nextStep} previousStep={previousStep} />
//           )}
//           {setup === "transferRules" && (
//             <TransferRules nextStep={nextStep} previousStep={previousStep} />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Setup;



// import React, { useState, useEffect } from "react";
// import {
//   FileText,
//   Layers,
//   Building2,
//   Building,
//   MapPin,
//   Home,
//   Package,
//   FileCheck,
// } from "lucide-react";
// import Projects from "../containers/setup/Projects";
// import Stages from "../containers/setup/Stages";
// import Zone from "../containers/setup/Zone";
// import FlatType from "../containers/setup/FlatType";
// import Unit from "../containers/setup/Unit";
// import TransferRules from "../containers/setup/TransferRules";
// import Tower from "../containers/setup/Tower";
// import Level from "../containers/setup/Level";
// import { useSelector, useDispatch } from "react-redux";
// import { setSelectedProject } from "../store/userSlice";
// import { useTheme } from "../ThemeContext";
// import { useNavigate } from "react-router-dom";
// import projectImage from "../Images/Project.png";

// // Utility to get role
// function getUserRole() {
//   try {
//     return localStorage.getItem("ROLE") || "";
//   } catch {
//     return "";
//   }
// }

// const ORANGE = "#ffbe63";
// const BG_OFFWHITE = "#fcfaf7";

// // Project name badge palette (same as Configuration page)
// const palette = {
//   projectNameBg: "#fffbe7",
//   projectNameColor: "#ea7d19",
// };

// const SETUP_STEPS = [
//   { key: "project", label: "Project", icon: FileText },
//   { key: "stages", label: "Stages", icon: Layers },
//   { key: "tower", label: "Tower", icon: Building2 },
//   { key: "level", label: "Level", icon: Building },
//   { key: "zone", label: "Zone", icon: MapPin },
//   { key: "flatType", label: "Flat Type", icon: Home },
//   { key: "unit", label: "Units", icon: Package },
//   { key: "transferRules", label: "Transfer Rules", icon: FileCheck },
// ];

// // Modal that triggers redirect on close
// function NotAllowedModal({ onClose }) {
//   return (
//     <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
//       <div className="bg-white p-8  shadow-lg max-w-sm w-full text-center">
//         <h2 className="text-2xl font-bold text-red-600 mb-3">Not Allowed</h2>
//         <p className="text-gray-700 mb-6">
//           You do not have permission to access this setup page.
//         </p>
//         <button
//           className="px-6 py-2 bg-orange-500 text-white font-semibold  shadow hover:bg-orange-600 transition"
//           onClick={onClose}
//         >
//           Go to Initialize Checklist
//         </button>
//       </div>
//     </div>
//   );
// }

// function Setup() {
//   const dispatch = useDispatch();
//   const { theme } = useTheme();
//   const navigate = useNavigate();
//   const [showModal, setShowModal] = useState(false);

//   // Color palette for the rest
//   const bgColor = theme === "dark" ? "#191922" : BG_OFFWHITE;
//   const cardColor = theme === "dark" ? "#23232c" : "#fff";
//   const borderColor = ORANGE;
//   const textColor = theme === "dark" ? "#fff" : "#222";
//   const iconColor = ORANGE;

//   // Restrict for Intializer
//   useEffect(() => {
//     const role = getUserRole();
//     if (role === "Intializer") setShowModal(true);
//   }, []);

//   const handleModalClose = () => {
//     setShowModal(false);
//     navigate("/Initialize-Checklist");
//   };

//   const userId = useSelector((state) => state.user.user.id);
//   const selectedProject = useSelector((state) => state.user.selectedProject); // Get project object
//   const selectedProjectId = selectedProject?.id;

//   const purposes = useSelector((state) => state.user.purposes);
//   const phases = useSelector((state) => state.user.phases);
//   const stages = useSelector((state) => state.user.stages);

//   const [setup, setSetup] = useState("project");
//   const next = [
//     "project",
//     "stages",
//     "tower",
//     "level",
//     "zone",
//     "flatType",
//     "unit",
//     "transferRules",
//   ];

//   const nextStep = () => {
//     const currentIndex = next.indexOf(setup);
//     if (currentIndex < next.length - 1) setSetup(next[currentIndex + 1]);
//   };

//   const previousStep = () => {
//     const currentIndex = next.indexOf(setup);
//     if (currentIndex > 0) setSetup(next[currentIndex - 1]);
//   };

//   const onProjectSetupComplete = (project) => {
//     dispatch(setSelectedProject(project));
//     setSetup("stages");
//   };

//   const isStageData = React.useCallback(() => {
//     const projectPurposes = purposes?.[selectedProjectId];
//     const projectPhases = phases?.[selectedProjectId];
//     const projectStages = stages?.[selectedProjectId];
//     return (
//       Array.isArray(projectPurposes) &&
//       projectPurposes.length > 0 &&
//       Array.isArray(projectPhases) &&
//       projectPhases.length > 0 &&
//       Array.isArray(projectStages) &&
//       projectStages.length > 0
//     );
//   }, [selectedProjectId, purposes, phases, stages]);

//   const getStepIndex = (stepKey) =>
//     SETUP_STEPS.findIndex((s) => s.key === stepKey);
//   const currentStepIndex = getStepIndex(setup);

//   // const isStepDisabled = (stepKey) => {
//   //   const stepIndex = getStepIndex(stepKey);
//   //   if (stepKey === "project") return !userId;
//   //   if (stepKey === "stages") return !selectedProjectId;
//   //   if (stepIndex > 1) return !selectedProjectId || !isStageData();
//   //   return false;
//   // };
//   const isStepDisabled = (stepKey) => {
//     const stepIndex = getStepIndex(stepKey);
//     return stepIndex > currentStepIndex; // Only allow current and previous steps
//   }; // All steps always enabled

//   const isStepCompleted = (stepKey) => getStepIndex(stepKey) < currentStepIndex;

//   // ----- For image and project name badge -----
//   const projectImgUrl = selectedProject?.image || projectImage;
//   const projectName =
//     selectedProject?.name || selectedProject?.project_name || "";

//   if (showModal) return <NotAllowedModal onClose={handleModalClose} />;

//   return (
//     <div className="flex flex-col min-h-screen" style={{ background: bgColor }}>
//       {/* Stepper */}
//       <div
//         className=" shadow-lg p-6 mb-8 border mx-auto mt-8"
//         style={{
//           background: cardColor,
//           borderColor: borderColor,
//           maxWidth: 1200,
//           width: "100%",
//         }}
//       >
//         <div className="flex items-center justify-between overflow-x-auto">
//           {SETUP_STEPS.map((step, idx) => {
//             const Icon = step.icon;
//             const isActive = setup === step.key;
//             const isCompleted = isStepCompleted(step.key);
//             const isDisabled = isStepDisabled(step.key);

//             return (
//               <React.Fragment key={step.key}>
//                 <button
//                   className={`
//                     flex flex-col items-center justify-center min-w-[120px] px-4 py-3 
//                     transition-all duration-300
//                     ${
//                       isActive
//                         ? "scale-105 shadow-lg"
//                         : isCompleted
//                         ? "shadow"
//                         : ""
//                     }
//                     ${
//                       isDisabled
//                         ? "opacity-60 cursor-not-allowed"
//                         : "hover:scale-105"
//                     }
//                   `}
//                   disabled={isDisabled}
//                   onClick={() => !isDisabled && setSetup(step.key)}
//                   style={{
//                     background: isActive || isCompleted ? iconColor : cardColor,
//                     color: isActive || isCompleted ? "#fff" : textColor,
//                     border: `2px solid ${borderColor}`,
//                     boxShadow: isActive ? "0 2px 10px #0002" : undefined,
//                     fontWeight: 700,
//                     fontSize: "1rem",
//                     borderRadius: 14,
//                     minHeight: 56,
//                     minWidth: 112,
//                     padding: "8px 18px",
//                   }}
//                 >
//                   <span
//                     className="
//                       flex items-center justify-center w-10 h-8  mb-1
//                       font-bold text-base
//                     "
//                     style={{
//                       background: cardColor,
//                       color: iconColor,
//                       border: `2px solid ${borderColor}`,
//                       borderRadius: 6,
//                       minWidth: 40,
//                     }}
//                   >
//                     {idx + 1}
//                   </span>
//                   <Icon
//                     size={20}
//                     color={iconColor}
//                     style={{ marginBottom: 2 }}
//                   />
//                   <span className="font-bold tracking-wide">{step.label}</span>
//                 </button>
//                 {idx < SETUP_STEPS.length - 1 && (
//                   <div
//                     className="flex-1 h-1 mx-2"
//                     style={{
//                       background: borderColor,
//                       minWidth: 38,
//                       borderRadius: 8,
//                     }}
//                   ></div>
//                 )}
//               </React.Fragment>
//             );
//           })}
//         </div>
//         {/* Progress Bar */}
//         <div className="mt-6">
//           <div
//             className={`flex justify-between text-xs mb-2`}
//             style={{ color: textColor }}
//           >
//             <span>Progress</span>
//             <span>
//               {Math.round((currentStepIndex / (SETUP_STEPS.length - 1)) * 100)}%
//               Complete
//             </span>
//           </div>
//           <div
//             className="w-full  h-2 overflow-hidden"
//             style={{ background: cardColor }}
//           >
//             <div
//               className="h-full  transition-all duration-500"
//               style={{
//                 width: `${
//                   (currentStepIndex / (SETUP_STEPS.length - 1)) * 100
//                 }%`,
//                 background: iconColor,
//               }}
//             ></div>
//           </div>
//         </div>
//       </div>
//       {/* ----------- Project image and name ---------- */}
//       {setup === "project" && selectedProjectId && (
//         <div className="flex flex-col items-center my-4">
//           <img
//             src={projectImgUrl}
//             alt={projectName}
//             className=" object-cover shadow-lg"
//             style={{
//               width: 240,
//               height: 200,
//               objectFit: "cover",
//               border: `2px solid`,
//               marginBottom: 10,
//               background: "#f5f5f5",
//             }}
//           />
//           <div
//             style={{
//               background: palette.projectNameBg,
//               color: palette.projectNameColor,
//               fontWeight: 600,
//               borderRadius: 12,
//               padding: "8px 24px",
//               fontSize: "1.15rem",
//               marginTop: 4,
//               textAlign: "center",
//               boxShadow: "0 2px 6px #0001",
//             }}
//           >
//             {projectName || "Project Name"}
//           </div>
//         </div>
//       )}

//       {/* Content */}
//       <div
//         className=" shadow-lg p-8 flex-1 border mx-auto mb-8"
//         style={{
//           background: cardColor,
//           borderColor: borderColor,
//           color: textColor,
//           maxWidth: 1200,
//           width: "100%",
//         }}
//       >
//         <div className="setup-container w-full h-full">
//           {setup === "project" && (
//             <Projects
//               nextStep={nextStep}
//               onProjectSetupComplete={onProjectSetupComplete}
//             />
//           )}
//           {setup === "stages" && (
//             <Stages nextStep={nextStep} previousStep={previousStep} />
//           )}
//           {setup === "tower" && (
//             <Tower nextStep={nextStep} previousStep={previousStep} />
//           )}
//           {setup === "level" && (
//             <Level nextStep={nextStep} previousStep={previousStep} />
//           )}
//           {setup === "zone" && (
//             <Zone nextStep={nextStep} previousStep={previousStep} />
//           )}
//           {setup === "flatType" && (
//             <FlatType nextStep={nextStep} previousStep={previousStep} />
//           )}
//           {setup === "unit" && (
//             <Unit nextStep={nextStep} previousStep={previousStep} />
//           )}
//           {setup === "transferRules" && (
//             <TransferRules nextStep={nextStep} previousStep={previousStep} />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Setup;
import React, { useState, useEffect } from "react";
import {
  FileText,
  Layers,
  Building2,
  Building,
  MapPin,
  Home,
  Package,
  FileCheck,
} from "lucide-react";
import Projects from "../containers/setup/Projects";
import Stages from "../containers/setup/Stages";
import Zone from "../containers/setup/Zone";
import FlatType from "../containers/setup/FlatType";
import Unit from "../containers/setup/Unit";
import TransferRules from "../containers/setup/TransferRules";
import Tower from "../containers/setup/Tower";
import Level from "../containers/setup/Level";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedProject } from "../store/userSlice";
import { useTheme } from "../ThemeContext";
import { useNavigate } from "react-router-dom";
import projectImage from "../Images/Project.png";

// Utility to get role
function getUserRole() {
  try {
    return localStorage.getItem("ROLE") || "";
  } catch {
    return "";
  }
}

const ORANGE = "#ffbe63";
const BG_OFFWHITE = "#fcfaf7";

// Project name badge palette (same as Configuration page)
const palette = {
  projectNameBg: "#fffbe7",
  projectNameColor: "#ea7d19",
};

const SETUP_STEPS = [
  { key: "project", label: "Project", icon: FileText },
  { key: "stages", label: "Stages", icon: Layers },
  { key: "tower", label: "Tower", icon: Building2 },
  { key: "level", label: "Level", icon: Building },
  { key: "zone", label: "Zone", icon: MapPin },
  { key: "flatType", label: "Flat Type", icon: Home },
  { key: "unit", label: "Units", icon: Package },
  { key: "transferRules", label: "Transfer Rules", icon: FileCheck },
];

// Modal that triggers redirect on close
function NotAllowedModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white p-8  shadow-lg max-w-sm w-full text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-3">Not Allowed</h2>
        <p className="text-gray-700 mb-6">
          You do not have permission to access this setup page.
        </p>
        <button
          className="px-6 py-2 bg-orange-500 text-white font-semibold  shadow hover:bg-orange-600 transition"
          onClick={onClose}
        >
          Go to Initialize Checklist
        </button>
      </div>
    </div>
  );
}

function Setup() {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  // Color palette for the rest
  const bgColor = theme === "dark" ? "#191922" : BG_OFFWHITE;
  const cardColor = theme === "dark" ? "#23232c" : "#fff";
  const borderColor = ORANGE;
  const textColor = theme === "dark" ? "#fff" : "#222";
  const iconColor = ORANGE;

  // Restrict for Intializer
  useEffect(() => {
    const role = getUserRole();
    if (role === "Intializer") setShowModal(true);
  }, []);

  const handleModalClose = () => {
    setShowModal(false);
    navigate("/Initialize-Checklist");
  };

  const userId = useSelector((state) => state.user.user.id);
  const selectedProject = useSelector((state) => state.user.selectedProject); // Get project object
  const selectedProjectId = selectedProject?.id;

  const purposes = useSelector((state) => state.user.purposes);
  const phases = useSelector((state) => state.user.phases);
  const stages = useSelector((state) => state.user.stages);

  const [setup, setSetup] = useState("project");
  const next = [
    "project",
    "stages",
    "tower",
    "level",
    "zone",
    "flatType",
    "unit",
    "transferRules",
  ];

  const nextStep = () => {
    const currentIndex = next.indexOf(setup);
    if (currentIndex < next.length - 1) setSetup(next[currentIndex + 1]);
  };

  const previousStep = () => {
    const currentIndex = next.indexOf(setup);
    if (currentIndex > 0) setSetup(next[currentIndex - 1]);
  };

  const onProjectSetupComplete = (project) => {
    dispatch(setSelectedProject(project));
    setSetup("stages");
  };

  const isStageData = React.useCallback(() => {
    const projectPurposes = purposes?.[selectedProjectId];
    const projectPhases = phases?.[selectedProjectId];
    const projectStages = stages?.[selectedProjectId];
    return (
      Array.isArray(projectPurposes) &&
      projectPurposes.length > 0 &&
      Array.isArray(projectPhases) &&
      projectPhases.length > 0 &&
      Array.isArray(projectStages) &&
      projectStages.length > 0
    );
  }, [selectedProjectId, purposes, phases, stages]);

  const getStepIndex = (stepKey) =>
    SETUP_STEPS.findIndex((s) => s.key === stepKey);
  const currentStepIndex = getStepIndex(setup);

  const isStepDisabled = (stepKey) => {
    const stepIndex = getStepIndex(stepKey);
    return stepIndex > currentStepIndex; // Only allow current and previous steps
  }; // All steps always enabled

  const isStepCompleted = (stepKey) => getStepIndex(stepKey) < currentStepIndex;

  // ----- For image and project name badge -----
  const projectImgUrl = selectedProject?.image || projectImage;
  const projectName =
    selectedProject?.name || selectedProject?.project_name || "";

  if (showModal) return <NotAllowedModal onClose={handleModalClose} />;

  return (
    <div className="flex flex-col min-h-screen" style={{ background: bgColor }}>
      {/* Stepper */}
      <div
        className=" shadow-lg p-6 mb-8 border mx-auto mt-8"
        style={{
          background: cardColor,
          borderColor: borderColor,
          maxWidth: 1200,
          width: "100%",
        }}
      >
        <div className="flex items-center justify-between overflow-x-auto">
          {SETUP_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = setup === step.key;
            const isCompleted = isStepCompleted(step.key);
            const isDisabled = isStepDisabled(step.key);

            return (
              <React.Fragment key={step.key}>
                <button
                  className={`
                    flex flex-col items-center justify-center min-w-[120px] px-4 py-3 
                    transition-all duration-300
                    ${
                      isActive
                        ? "scale-105 shadow-lg"
                        : isCompleted
                        ? "shadow"
                        : ""
                    }
                    ${
                      isDisabled
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:scale-105"
                    }
                  `}
                  disabled={isDisabled}
                  onClick={() => !isDisabled && setSetup(step.key)}
                  style={{
                    background: isActive || isCompleted ? iconColor : cardColor,
                    color: isActive || isCompleted ? "#fff" : textColor,
                    border: `2px solid ${borderColor}`,
                    boxShadow: isActive ? "0 2px 10px #0002" : undefined,
                    fontWeight: 700,
                    fontSize: "1rem",
                    borderRadius: 14,
                    minHeight: 56,
                    minWidth: 112,
                    padding: "8px 18px",
                  }}
                >
                  <span
                    className="
                      flex items-center justify-center w-10 h-8  mb-1
                      font-bold text-base
                    "
                    style={{
                      background: cardColor,
                      color: iconColor,
                      border: `2px solid ${borderColor}`,
                      borderRadius: 6,
                      minWidth: 40,
                    }}
                  >
                    {idx + 1}
                  </span>
                  <Icon
                    size={20}
                    color={iconColor}
                    style={{ marginBottom: 2 }}
                  />
                  <span className="font-bold tracking-wide">{step.label}</span>
                </button>
                {idx < SETUP_STEPS.length - 1 && (
                  <div
                    className="flex-1 h-1 mx-2"
                    style={{
                      background: borderColor,
                      minWidth: 38,
                      borderRadius: 8,
                    }}
                  ></div>
                )}
              </React.Fragment>
            );
          })}
        </div>
        {/* Progress Bar */}
        <div className="mt-6">
          <div
            className={`flex justify-between text-xs mb-2`}
            style={{ color: textColor }}
          >
            <span>Progress</span>
            <span>
              {Math.round((currentStepIndex / (SETUP_STEPS.length - 1)) * 100)}%
              Complete
            </span>
          </div>
          <div
            className="w-full  h-2 overflow-hidden"
            style={{ background: cardColor }}
          >
            <div
              className="h-full  transition-all duration-500"
              style={{
                width: `${
                  (currentStepIndex / (SETUP_STEPS.length - 1)) * 100
                }%`,
                background: iconColor,
              }}
            ></div>
          </div>
        </div>
      </div>
      {/* ----------- Project image and name ---------- */}
      {setup === "project" && selectedProjectId && (
        <div className="flex flex-col items-center my-4">
          <img
            src={projectImgUrl}
            alt={projectName}
            className=" object-cover shadow-lg"
            style={{
              width: 240,
              height: 200,
              objectFit: "cover",
              border: `2px solid`,
              marginBottom: 10,
              background: "#f5f5f5",
            }}
          />
          <div
            style={{
              background: palette.projectNameBg,
              color: palette.projectNameColor,
              fontWeight: 600,
              borderRadius: 12,
              padding: "8px 24px",
              fontSize: "1.15rem",
              marginTop: 4,
              textAlign: "center",
              boxShadow: "0 2px 6px #0001",
            }}
          >
            {projectName || "Project Name"}
          </div>
        </div>
      )}

      {/* Content (NO outer block, just the components directly) */}
      <div className="setup-container w-full h-full">
        {setup === "project" && (
          <Projects
            nextStep={nextStep}
            onProjectSetupComplete={onProjectSetupComplete}
          />
        )}
        {setup === "stages" && (
          <Stages nextStep={nextStep} previousStep={previousStep} />
        )}
        {setup === "tower" && (
          <Tower nextStep={nextStep} previousStep={previousStep} />
        )}
        {setup === "level" && (
          <Level nextStep={nextStep} previousStep={previousStep} />
        )}
        {setup === "zone" && (
          <Zone nextStep={nextStep} previousStep={previousStep} />
        )}
        {setup === "flatType" && (
          <FlatType nextStep={nextStep} previousStep={previousStep} />
        )}
        {setup === "unit" && (
          <Unit nextStep={nextStep} previousStep={previousStep} />
        )}
        {setup === "transferRules" && (
          <TransferRules nextStep={nextStep} previousStep={previousStep} />
        )}
      </div>
    </div>
  );
}

export default Setup;

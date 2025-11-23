import React, { useState, useEffect } from "react";
import {
  FileText, Layers, Building2, Building, MapPin, Home, Package, FileCheck
} from "lucide-react";
import Projects from "../containers/setup/Projects";
import Stages from "../containers/setup/Stages";
import Zone from "../containers/setup/Zone";
import FlatType from "../containers/setup/FlatType";
import Unit from "../containers/setup/Unit";
import TransferRules from "../containers/setup/TransferRules";
import Tower from "../containers/setup/Tower";
import Level from "../containers/setup/Level";
import SideBarSetup from "./SideBarSetup";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedProject } from "../store/userSlice";
import { useTheme } from "../ThemeContext";
import { useNavigate } from "react-router-dom";

// Utility to get role
function getUserRole() {
  try {
    return localStorage.getItem("ROLE") || "";
  } catch {
    return "";
  }
}

const ORANGE = "#ea6822";
const ORANGE_DARK = "#e44a22";
const BG_GRAY = "#f7f6fa";

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
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-3">Not Allowed</h2>
        <p className="text-gray-700 mb-6">
          You do not have permission to access this setup page.
        </p>
        <button
          className="px-6 py-2 bg-orange-500 text-white font-semibold rounded-lg shadow hover:bg-orange-600 transition"
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

  // Restrict for Intializer
  useEffect(() => {
    const role = getUserRole();
    if (role === "Intializer") {
      setShowModal(true);
    }
  }, []);

  // Handle modal close: redirect to /Initialize-Checklist
  const handleModalClose = () => {
    setShowModal(false);
    navigate("/Initialize-Checklist");
  };

  const userId = useSelector((state) => state.user.user.id);
  const selectedProjectId = useSelector((state) => state.user.selectedProject.id);
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

  const onProjectSetupComplete = (id) => {
    dispatch(setSelectedProject(id));
    setSetup("stages");
  };

  const isStageData = React.useCallback(() => (
    purposes?.[selectedProjectId]?.length > 0 &&
    phases?.[selectedProjectId]?.length > 0 &&
    stages?.[selectedProjectId]?.length > 0
  ), [selectedProjectId, purposes, phases, stages]);

  const getStepIndex = (stepKey) => SETUP_STEPS.findIndex(s => s.key === stepKey);
  const currentStepIndex = getStepIndex(setup);

  const isStepDisabled = (stepKey) => {
    const stepIndex = getStepIndex(stepKey);
    if (stepKey === "project") return !userId;
    if (stepKey === "stages") return !selectedProjectId;
    if (stepIndex > 1) return !selectedProjectId || !isStageData();
    return false;
  };

  const isStepCompleted = (stepKey) => getStepIndex(stepKey) < currentStepIndex;

  // Palette based on theme
  const palette = theme === "dark"
    ? {
        stepActiveBg: "linear-gradient(90deg, #fde047 60%, #facc15 100%)",
        stepActiveText: "#783f04",
        stepCompletedText: "#783f04",
        stepCompletedBg: "linear-gradient(90deg, #fde047 60%, #facc15 100%)",
        stepInactiveBg: "#23232e",
        stepInactiveText: "#facc15",
        progress: "linear-gradient(to right, #fde047 60%, #facc15 100%)",
        border: "#facc1530",
        boxShadow: "0 2px 10px #fde04744"
      }
    : {
        stepActiveBg: "linear-gradient(90deg, #ea6822 60%, #e44a22 100%)",
        stepActiveText: "#fff",
        stepCompletedText: "#ea6822",
        stepCompletedBg: "linear-gradient(90deg, #ea6822 60%, #e44a22 100%)",
        stepInactiveBg: BG_GRAY,
        stepInactiveText: "#969696",
        progress: "linear-gradient(to right, #ea6822 60%, #e44a22 100%)",
        border: "#ededed",
        boxShadow: "0 2px 10px #ea682244"
      };

  // Show modal and block everything else if restricted
  if (showModal) {
    return <NotAllowedModal onClose={handleModalClose} />;
  }

  return (
    <div className="flex min-h-screen" style={{ background: theme === "dark" ? "#181820" : BG_GRAY }}>
      <SideBarSetup />
      <div className="flex flex-col flex-1 min-h-screen w-[84%] mt-5 ml-[16%] px-6">

        {/* Stepper */}
        <div className="rounded-2xl shadow-lg p-6 mb-8 border"
          style={{
            background: theme === "dark" ? "#191921" : "#fff",
            borderColor: palette.border,
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
                      flex flex-col items-center justify-center min-w-[140px] px-5 py-3 rounded-full
                      transition-all duration-300
                      ${isActive
                        ? "scale-105 shadow-lg"
                        : isCompleted
                        ? "shadow"
                        : ""
                      }
                      ${isDisabled ? "opacity-70 cursor-not-allowed" : "hover:scale-105"}
                    `}
                    disabled={isDisabled}
                    onClick={() => !isDisabled && setSetup(step.key)}
                    style={{
                      borderRadius: "2rem",
                      fontWeight: 700,
                      fontSize: "1rem",
                      background: isActive
                        ? palette.stepActiveBg
                        : isCompleted
                        ? palette.stepCompletedBg
                        : palette.stepInactiveBg,
                      color: isActive
                        ? palette.stepActiveText
                        : isCompleted
                        ? palette.stepCompletedText
                        : palette.stepInactiveText,
                      border: `2px solid ${isActive || isCompleted ? (theme === "dark" ? "#facc15" : "#ea6822") : palette.border}`,
                      boxShadow: isActive ? palette.boxShadow : undefined,
                    }}
                  >
                    <span
                      className={`
                        flex items-center justify-center w-8 h-8 rounded-full mb-1
                        font-bold text-base
                      `}
                      style={{
                        background: isActive || isCompleted
                          ? "#fff"
                          : "#ededed",
                        color: isActive || isCompleted
                          ? (theme === "dark" ? "#783f04" : "#ea6822")
                          : "#bfbfbf",
                        border: `2px solid ${isActive || isCompleted ? (theme === "dark" ? "#facc15" : "#ea6822") : "#ededed"}`
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span className="font-bold tracking-wide">{step.label}</span>
                  </button>
                  {idx < SETUP_STEPS.length - 1 && (
                    <div className="flex-1 h-1 mx-2"
                      style={{
                        background: isCompleted
                          ? palette.progress
                          : palette.border,
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
            <div className={`flex justify-between text-xs ${theme === "dark" ? "text-amber-200" : "text-gray-500"} mb-2`}>
              <span>Progress</span>
              <span>{Math.round((currentStepIndex / (SETUP_STEPS.length - 1)) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-[#ededed] rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(currentStepIndex / (SETUP_STEPS.length - 1)) * 100}%`,
                  background: palette.progress
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="rounded-2xl shadow-lg p-8 flex-1 border"
          style={{
            background: theme === "dark" ? "#191921" : "#fff",
            borderColor: palette.border,
          }}
        >
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
      </div>
    </div>
  );
}

export default Setup;

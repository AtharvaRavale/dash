import React, {
  useState,
  createContext,
  useContext,
  useEffect,
  useRef,
} from "react";
import projectImage from "./Images/Project.png";
import { AiOutlineClose, AiOutlineSearch } from "react-icons/ai"; // Import X icon
import {
  FaPlus,
  FaTimes,
  FaCheckCircle,
  FaEdit,
  FaTrash,
  FaSearch,
  FaUser,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { MdModeEdit } from "react-icons/md";
// import Header from "./components/Header";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { MdOutlineCancel } from "react-icons/md";
import { IoIosArrowDown, IoMdAdd, IoMdClose } from "react-icons/io";
import Select from "react-select";
import profile from "../src/Images/profile.jpg";
import Projects from "./containers/setup/Projects";
import Stages from "./containers/setup/Stages";
import Tower from "./containers/setup/Tower";
import Level from "./containers/setup/Level";
import Zone from "./containers/setup/Zone";
import FlatType from "./containers/setup/FlatType";
const ProgressBar = ({ currentStep, setCurrentStep }) => {
  const steps = [
    "Project",
    "Stages",
    "Towers",
    "Levels",
    "Zone",
    "Flat Type",
    "Units",
    "Transfer Rules",
    "Schedule",
    "User",
  ];
  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/schedule");
  };

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
    "schedule",
    "user",
  ];

  const nextStep = () => {
    const currentIndex = next.indexOf(setup); // Get the current index
    if (currentIndex < next.length - 1) {
      setSetup(next[currentIndex + 1]); // Move to the next step
    }
  };

  const previousStep = () => {
    const currentIndex = next.indexOf(setup); // Get the current index of the current step
    if (currentIndex > 0) {
      setSetup(next[currentIndex - 1]); // Set the previous step
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-5 bg-white rounded shadow-lg ">
      {/* <Header /> */}
      <div className="flex items-center justify-between space-x-4 mt-5 bg-gray-100 rounded-md">
        {steps.map((step, index) => (
          <div key={index} className="flex-1">
            <button
              onClick={() => {
                setCurrentStep(index);
                if (step === "Schedule") {
                  <Schedule />; // Redirect to the schedule page
                } else if (step === "User") {
                  // navigate("/user"); // Redirect to the User page
                }
              }}
              className={`relative h-14 px-4 rounded-xl flex items-center justify-center whitespace-nowrap text-sm md:text-base font-semibold transition-all duration-200 ${
                index === currentStep
                  ? "bg-white text-blue-500 shadow-custom-all-sides border rounded-md"
                  : "text-black"
              }`}
            >
              {step}
            </button>
          </div>
        ))}
      </div>
      {/* <div className="flex flex-col my-auto mx-auto flex-1 h-full w-full">
        <div className="hidden md:flex flex-wrap justify-between gap-5 mt-3 mx-5 px-5 bg-white rounded-md py-2">
          <div
            className={`p-2 text-slate-800 cursor-pointer ${
              setup === "project"
                ? "bg-gray-200 text-blue-500 font-semibold rounded-md"
                : ""
            }`}
            onClick={() => setSetup("project")}
          >
            Project
          </div>
          <div
            className={`p-2 text-slate-800 cursor-pointer ${
              setup === "stages"
                ? "bg-gray-200 text-blue-500 font-semibold rounded-md"
                : ""
            }`}
            onClick={() => setSetup("stages")}
          >
            Stages
          </div>
          <div
            className={`p-2 text-slate-800 cursor-pointer ${
              setup === "tower"
                ? "bg-gray-200 text-blue-500 font-semibold rounded-md"
                : ""
            }`}
            onClick={() => setSetup("tower")}
          >
            Tower
          </div>
          <div
            className={`p-2 text-slate-800 cursor-pointer ${
              setup === "level"
                ? "bg-gray-200 text-blue-500 font-semibold rounded-md"
                : ""
            }`}
            onClick={() => setSetup("level")}
          >
            Level
          </div>
          <div
            className={`p-2 text-slate-800 cursor-pointer ${
              setup === "zone"
                ? "bg-gray-200 text-blue-500 font-semibold rounded-md"
                : ""
            }`}
            onClick={() => setSetup("zone")}
          >
            Zone
          </div>
          <div
            className={`p-2 text-slate-800 cursor-pointer ${
              setup === "flatType"
                ? "bg-gray-200 text-blue-500 font-semibold rounded-md"
                : ""
            }`}
            onClick={() => setSetup("flatType")}
          >
            Flat Type
          </div>
          <div
            className={`p-2 text-slate-800 cursor-pointer ${
              setup === "unit"
                ? "bg-gray-200 text-blue-500 font-semibold rounded-md"
                : ""
            }`}
            onClick={() => setSetup("unit")}
          >
            Units
          </div>
          <div
            className={`p-2 text-slate-800 cursor-pointer ${
              setup === "transferRules"
                ? "bg-gray-200 text-blue-500 font-semibold rounded-md"
                : ""
            }`}
            onClick={() => setSetup("transferRules")}
          >
            Transfer Rules
          </div>
          <div
            className={`p-2 text-slate-800 cursor-pointer ${
              setup === "schedule"
                ? "bg-gray-200 text-blue-500 font-semibold rounded-md"
                : ""
            }`}
            onClick={() => setSetup("schedule")}
          >
            Schedule
          </div>
          <div
            className={`p-2 text-slate-800 cursor-pointer ${
              setup === "user"
                ? "bg-gray-200 text-blue-500 font-semibold rounded-md"
                : ""
            }`}
            onClick={() => setSetup("user")}
          >
            User
          </div>
        </div>
        <div className="my-5">
          {setup === "project" && <Projects nextStep={nextStep} />}
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
          {setup === "building" && (
            <Building nextStep={nextStep} previousStep={previousStep} />
          )}
          {setup === "wing" && (
            <Wing nextStep={nextStep} previousStep={previousStep} />
          )}
          {setup === "area" && (
            <Area nextStep={nextStep} previousStep={previousStep} />
          )}
          {setup === "floor" && (
            <Floor nextStep={nextStep} previousStep={previousStep} />
          )}
          {setup === "unit" && (
            <Unit nextStep={nextStep} previousStep={previousStep} />
          )}
          {setup === "room" && (
            <Room nextStep={nextStep} previousStep={previousStep} />
          )}
          {setup === "activeSchool" && (
            <ActiveSchool previousStep={previousStep} />
          )}
        </div>
      </div> */}
    </div>
  );
};

// Create the Context for sharing tower data across components
const TowerContext = createContext();

// Context Provider to wrap around the main component
const TowerProvider = ({ children }) => {
  const [towerData, setTowerData] = useState({
    prefix: "Tower",
    namingConvention: "numeric",
    numTowers: 1,
    towerNames: [],
    floors: {},
  });

  return (
    <TowerContext.Provider value={{ towerData, setTowerData }}>
      {children}
    </TowerContext.Provider>
  );
};

// Custom hook to use the Tower Data from context
const useTowerData = () => {
  return useContext(TowerContext);
};

const AddProjectModal = ({
  isOpen,
  onClose,
  onSave,
  onNext,
  setCurrentStep,
}) => {
  const [projectName, setProjectName] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [useDefaultImage, setUseDefaultImage] = useState(true);
  const [isSaved, setIsSaved] = useState(false); // New state to track if the project is saved

  // Function to handle image selection
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(URL.createObjectURL(e.target.files[0]));
      setUseDefaultImage(false); // Disable default if custom is selected
    }
  };

  // Function to save the project and proceed
  const handleSave = () => {
    const imageToUse = useDefaultImage ? projectImage : selectedImage;
    onSave(projectName, imageToUse);
    setIsSaved(true); // Set saved state to true
  };

  return isOpen ? (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-2 right-2">
          <AiOutlineClose className="text-xl text-gray-600 hover:text-gray-900" />
        </button>

        {/* Step 1 */}
        <h2 className="text-2xl font-bold mb-4">Add New Project</h2>
        <label className="block text-sm font-medium text-gray-700">
          Project Name
        </label>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="mt-1 p-2 border border-gray-300 rounded-md w-full"
          placeholder="Enter project name"
        />

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Project Image
          </label>
          <div className="flex items-center mt-2">
            <input
              type="radio"
              checked={useDefaultImage}
              onChange={() => setUseDefaultImage(true)}
            />
            <span className="ml-2">Use Default Image</span>
          </div>

          <div className="flex items-center mt-2">
            <input
              type="radio"
              checked={!useDefaultImage}
              onChange={() => setUseDefaultImage(false)}
            />
            <span className="ml-2">Upload Custom Image</span>
          </div>

          {!useDefaultImage && (
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-2"
            />
          )}

          {selectedImage && !useDefaultImage && (
            <img
              src={selectedImage}
              alt="Custom Project"
              className="mt-4 w-full h-32 object-cover rounded-md"
            />
          )}
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={handleSave}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          >
            Save Project
          </button>

          {/* Show Next button after saving */}
          {isSaved && (
            <button
              onClick={() => {
                onNext(); // Move to the next step
                onClose(); // Close the modal after clicking Next
                setCurrentStep((prevStep) => Math.min(prevStep + 1, 8)); // Update the current step
              }}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  ) : null;
};

const ProjectGrid = ({ setCurrentStep }) => {
  const [projects, setProjects] = useState([
    { name: "Prime Core", image: projectImage, id: 1 },
    { name: "Vision Venture", image: projectImage, id: 2 },
    { name: "Civil Connect", image: projectImage, id: 3 },
    { name: "Unity Hub", image: projectImage, id: 4 },
    { name: "Social Circle", image: projectImage, id: 5 },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const addProject = (name, image) => {
    const newProject = { name, image, id: projects.length + 1 };
    setProjects([...projects, newProject]);
  };

  return (
    <div className="max-w-7xl mx-auto p-5 bg-white rounded shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-green-800">Projects</h2>
      <div className="grid grid-cols-5 gap-8">
        {projects.map((project) => (
          <div
            key={project.id}
            className="relative bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <img
              src={project.image}
              alt="Project Background"
              className="w-full h-96 "
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-50 text-white text-lg font-semibold p-4">
              {project.name}
            </div>
          </div>
        ))}
        <div
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center bg-gray-200 rounded-lg shadow-lg cursor-pointer hover:bg-gray-300"
        >
          <button className="text-2xl font-bold text-green-700">
            + Add Project
          </button>
        </div>
      </div>

      <AddProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={addProject}
        onNext={() => console.log("Next step")} // Placeholder for next step function
        setCurrentStep={setCurrentStep} // Pass setCurrentStep here
      />
    </div>
  );
};

const StepTwoExact = () => {
  const [purposes, setPurposes] = useState([
    { name: "Snagging", enabled: true },
    { name: "QC", enabled: true },
    { name: "Cleaning", enabled: true },
    { name: "Construction Monitoring", enabled: true },
  ]);
  const [newPurpose, setNewPurpose] = useState("");

  // State for Phase Management
  const [phases, setPhases] = useState([]);
  const [selectedPurpose, setSelectedPurpose] = useState("");
  const [phaseName, setPhaseName] = useState("");

  // State for Stage Management
  const [stages, setStages] = useState([]);
  const [selectedPhase, setSelectedPhase] = useState("");
  const [stageName, setStageName] = useState("");

  // State for Navigation
  const [activeSection, setActiveSection] = useState("Purpose"); // Default to "Purpose"

  // Handlers for Purpose Management
  const handleCreatePurpose = () => {
    if (newPurpose) {
      setPurposes((prev) => [...prev, { name: newPurpose, enabled: true }]);
      setNewPurpose("");
    }
  };

  const handleTogglePurpose = (index) => {
    setPurposes((prev) =>
      prev.map((purpose, i) =>
        i === index ? { ...purpose, enabled: !purpose.enabled } : purpose
      )
    );
  };

  // Handlers for Phase Management
  const handleCreatePhase = () => {
    if (selectedPurpose && phaseName) {
      setPhases((prevPhases) => [
        ...prevPhases,
        { purpose: selectedPurpose, phase: phaseName },
      ]);
      setSelectedPurpose("");
      setPhaseName("");
    }
  };

  // Handlers for Stage Management

  const handleCreateStage = () => {
    if (selectedPhase && stageName) {
      const [purpose, phase] = selectedPhase.split(":"); // Split the combined string
      setStages((prevStages) => [
        ...prevStages,
        { purpose, phase, stage: stageName }, // Save all details
      ]);
      setSelectedPhase("");
      setStageName("");
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-12 bg-white rounded-lg shadow-md">
      {/* Navigation */}
      <div className="flex lg:flex-row flex-col gap-2 relative items-center justify-center w-full">
        <div className="sm:flex grid grid-cols-3 flex-wrap text-sm md:text-base sm:flex-row gap-5 font-medium p-2 xl:rounded-full rounded-md opacity-90 bg-gray-200">
          <button
            onClick={() => setActiveSection("Purpose")}
            className={`md:rounded-full px-4 cursor-pointer text-center transition-all duration-300 ease-linear ${
              activeSection === "Purpose" &&
              "bg-white text-blue-500 shadow-custom-all-sides"
            }`}
          >
            Purpose
          </button>
          <button
            onClick={() => setActiveSection("Phases")}
            className={`md:rounded-full px-4 cursor-pointer text-center transition-all duration-300 ease-linear ${
              activeSection === "Phases" &&
              "bg-white text-blue-500 shadow-custom-all-sides"
            }`}
          >
            Phases
          </button>
          <button
            onClick={() => setActiveSection("Stages")}
            className={`md:rounded-full px-4 cursor-pointer text-center transition-all duration-300 ease-linear ${
              activeSection === "Stages" &&
              "bg-white text-blue-500 shadow-custom-all-sides"
            }`}
          >
            Stages
          </button>
        </div>
      </div>

      {/* Purpose Section */}
      {activeSection === "Purpose" && (
        <div className="w-full bg-green-50 p-4 rounded-lg shadow-lg">
          <h3 className="text-lg font-bold text-green-900">
            Purpose Management
          </h3>
          <input
            value={newPurpose}
            onChange={(e) => setNewPurpose(e.target.value)}
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 mb-2"
            placeholder="Enter new purpose"
          />
          <button
            onClick={handleCreatePurpose}
            className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-600 transition"
          >
            Add Purpose
          </button>
          <h4 className="text-md font-semibold text-green-800 mt-4">
            Manage Purposes
          </h4>
          <ul>
            {purposes.map((purpose, index) => (
              <li
                key={index}
                className="flex justify-between items-center py-2"
              >
                <span
                  className={`${
                    !purpose.enabled
                      ? "line-through text-gray-500"
                      : "text-green-900"
                  }`}
                >
                  {purpose.name}
                </span>
                <button
                  onClick={() => handleTogglePurpose(index)}
                  className={`text-sm ${
                    purpose.enabled
                      ? "text-red-600 hover:text-red-800"
                      : "text-green-600 hover:text-green-800"
                  }`}
                >
                  {purpose.enabled ? "Disable" : "Enable"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Phases Section */}
      {activeSection === "Phases" && (
        <div className="w-full">
          <h3 className="text-lg font-bold text-green-700">Create Phase</h3>
          <div className="flex mb-4">
            <div className="w-1/3">
              <label className="block text-green-600 font-semibold mb-2">
                Purpose
              </label>
              <select
                value={selectedPurpose}
                onChange={(e) => setSelectedPurpose(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Purpose</option>
                {purposes
                  .filter((purpose) => purpose.enabled)
                  .map((purpose, index) => (
                    <option key={index} value={purpose.name}>
                      {purpose.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="w-1/3 ml-4">
              <label className="block text-green-600 font-semibold mb-2">
                Phase Name
              </label>
              <input
                value={phaseName}
                onChange={(e) => setPhaseName(e.target.value)}
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter Phase Name"
              />
            </div>
            <div className="w-1/3 ml-4 flex items-end">
              <button
                className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                onClick={handleCreatePhase}
              >
                Create
              </button>
            </div>
          </div>

          <h3 className="text-lg font-bold text-green-600 mt-4">
            Manage Phases
          </h3>
          <ul className="bg-green-50 p-4 rounded-lg shadow mt-2">
            {phases.map((phase, index) => (
              <li key={index} className="py-2">
                {`Purpose: ${phase.purpose}, Phase: ${phase.phase}`}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Stages Section */}

      {activeSection === "Stages" && (
        <div className="w-full">
          <h3 className="text-lg font-bold text-green-600">Create Stage</h3>
          <div className="flex mb-4">
            <div className="w-1/3">
              <label className="block text-green-600 font-semibold mb-2">
                Phase
              </label>
              <select
                value={selectedPhase}
                onChange={(e) => setSelectedPhase(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Phase</option>
                {phases.map((phase, index) => (
                  <option
                    key={index}
                    value={`${phase.purpose}:${phase.phase}`} // Combine purpose and phase for clarity
                  >
                    {`${phase.purpose} - ${phase.phase}`} {/* Display both */}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-1/3 ml-4">
              <label className="block text-green-600 font-semibold mb-2">
                Stage Name
              </label>
              <input
                value={stageName}
                onChange={(e) => setStageName(e.target.value)}
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter Stage Name"
              />
            </div>
            <div className="w-1/3 ml-4 flex items-end">
              <button
                className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                onClick={handleCreateStage}
              >
                Create
              </button>
            </div>
          </div>

          <h3 className="text-lg font-bold text-green-600 mt-4">
            Manage Stages
          </h3>
          <ul className="bg-gray-100 p-4 rounded-lg shadow">
            {stages.map((stage, index) => (
              <li key={index} className="py-2">
                {`Purpose: ${stage.purpose}, Phase: ${stage.phase}, Stage: ${stage.stage}`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// TowerSetup Component
const TowerSetup = ({ setCurrentStep }) => {
  const { towerData, setTowerData } = useTowerData();
  const [showImages, setShowImages] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [tempName, setTempName] = useState("");

  const generateTowerNames = () => {
    let towerNames = [];
    for (let i = 0; i < parseInt(towerData.numTowers) || 0; i++) {
      const towerName =
        towerData.namingConvention === "numeric"
          ? `${towerData.prefix} ${i + 1}`
          : `${towerData.prefix} ${String.fromCharCode(65 + i)}`;
      towerNames.push(towerName);
    }
    return towerNames;
  };

  const handleAdd = () => {
    const towerNames = generateTowerNames();
    setTowerData({ ...towerData, towerNames });
    setShowImages(true);
  };

  const handleEditClick = (index, name) => {
    setEditingIndex(index);
    setTempName(name);
  };

  const handleInputChange = (e) => {
    setTempName(e.target.value);
  };

  const handleBlur = (index) => {
    let updatedNames = [...towerData.towerNames];
    updatedNames[index] = tempName.trim() || "Assign Name"; // Assign a default name
    setTowerData({ ...towerData, towerNames: updatedNames });
    setEditingIndex(null);
  };

  return (
    <div className="max-w-7xl mx-auto bg-white rounded shadow-lg">
      <h2 className="text-xl px-5 font-bold">Add Towers</h2>
      <div className="flex justify-center gap-5 space-y-4">
        <div className="flex flex-col w-60">
          <label className="mr-2 font-medium mt-4 mb-2">Prefix:</label>
          <input
            type="text"
            value={towerData.prefix}
            onChange={(e) =>
              setTowerData({ ...towerData, prefix: e.target.value })
            }
            className="border rounded p-2 w-full focus:outline-none focus:ring focus:border-green-300"
          />
        </div>
        <div className="flex flex-col w-60">
          <label className="mr-2 font-medium mb-2">Naming Convention:</label>
          <select
            value={towerData.namingConvention}
            onChange={(e) =>
              setTowerData({ ...towerData, namingConvention: e.target.value })
            }
            className="border rounded p-2 w-full focus:outline-none focus:ring focus:border-green-300"
          >
            <option value="numeric">Numeric</option>
            <option value="alphabetic">Alphabetic</option>
          </select>
        </div>
        <div className="flex flex-col w-40">
          <label className="mr-2 font-medium mb-2">No. of Towers:</label>
          <input
            type="number"
            value={towerData.numTowers}
            onChange={(e) =>
              setTowerData({ ...towerData, numTowers: e.target.value })
            }
            className="border rounded p-2 w-full focus:outline-none focus:ring focus:border-green-300"
            min="1"
          />
        </div>
        <div className="flex flex-col">
          <button
            onClick={handleAdd}
            className="bg-green-700 text-white font-bold py-2 px-4 rounded hover:bg-green-800 transition-colors duration-200 mt-8"
          >
            Add
          </button>
        </div>
      </div>

      {/* {showImages && (
        <div className="flex flex-wrap justify-center gap-6 mt-6">
          {generateTowerNames().map((name, index) => (
            <div
              key={index}
              className="relative rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300 w-48"
            >
              <img
                src={projectImage}
                alt={name}
                className="w-full h-72 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <p className="text-white text-lg font-bold">{name}</p>
              </div>
            </div>
          ))}
        </div>
      )} */}
      {showImages && (
        <div className="flex flex-wrap justify-center gap-6 mt-6">
          {towerData.towerNames?.map((name, index) => (
            <div
              key={index}
              className="relative rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300 w-48"
            >
              <img
                src={projectImage}
                alt={name}
                className="w-full h-72 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                {editingIndex === index ? (
                  <input
                    type="text"
                    value={tempName}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur(index)}
                    className="text-center bg-black bg-opacity-50 text-white text-lg font-bold px-2 py-1 "
                    autoFocus
                  />
                ) : (
                  <p
                    className="text-white text-lg font-bold cursor-pointer"
                    onClick={() => handleEditClick(index, name)}
                  >
                    {name}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between mt-4 pb-5 px-5">
        <button
          onClick={() => setCurrentStep(1)}
          className="bg-gray-400 text-white px-4 py-2 rounded-md"
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentStep(3)}
          className="bg-gray-400 text-white px-4 py-2 rounded-md"
        >
          Next
        </button>
      </div>
    </div>
  );
};

const FloorSetup = ({ setCurrentStep, setZoneData }) => {
  const { towerData, setTowerData } = useTowerData();
  const [currentTower, setCurrentTower] = useState(null);
  const [floorInput, setFloorInput] = useState("");
  const [selectedCommonFloors, setSelectedCommonFloors] = useState([]);

  const additionalFloorTypes = [
    "Basement",
    "Parking",
    "Podium",
    "Terrace",
    "Ground",
  ];

  const handleAddFloors = () => {
    if (!currentTower || !floorInput) return;

    const numFloors = parseInt(floorInput);
    if (isNaN(numFloors) || numFloors <= 0) return;

    const newFloors = Array.from(
      { length: numFloors },
      (_, i) => `Floor ${i + 1}`
    );
    const floorsWithCommon = newFloors.concat(selectedCommonFloors);

    const updatedFloors = {
      ...towerData.floors,
      [currentTower]: (towerData.floors[currentTower] || []).concat(
        floorsWithCommon
      ),
    };

    setTowerData({ ...towerData, floors: updatedFloors });

    // Initialize zone data for each floor with 4 default zones
    const initialZoneData = floorsWithCommon.map((floor) => ({
      floor,
      zones: Array.from({ length: 4 }, (_, i) => `Zone ${i + 1}`), // Default 4 zones
    }));

    setZoneData((prevData) => ({
      ...prevData,
      [currentTower]: initialZoneData,
    }));

    setCurrentTower(null);
    setFloorInput("");
    setSelectedCommonFloors([]);
  };

  const handleToggleFloorType = (type) => {
    setSelectedCommonFloors((prevSelected) =>
      prevSelected.includes(type)
        ? prevSelected.filter((item) => item !== type)
        : [...prevSelected, type]
    );
  };

  const handleDeleteFloor = (tower, floorToDelete) => {
    setTowerData((prevData) => {
      const updatedFloors = { ...prevData.floors };
      updatedFloors[tower] = updatedFloors[tower].filter(
        (floor) => floor !== floorToDelete
      );

      return {
        ...prevData,
        floors: updatedFloors,
      };
    });
  };
  const handleEditFloor = (tower, floorIndex, newFloorName) => {
    setTowerData((prevData) => {
      const updatedFloors = { ...prevData.floors };
      updatedFloors[tower][floorIndex] = newFloorName; // Update the specific floor
      return {
        ...prevData,
        floors: updatedFloors,
      };
    });
    setEditing({ tower: null, floorIndex: null, floorName: "" }); // Reset editing state
  };

  const [editing, setEditing] = useState({
    tower: null,
    floorIndex: null,
    floorName: "",
  });

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded shadow-lg">
      {/* <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Add Floors to Towers
      </h2> */}

      <div className="w-full overflow-x-auto pb-5">
        <div className="flex gap-6 w-max">
          {towerData.towerNames.map((tower, index) => (
            <div
              key={index}
              className="border py-1 px-2 rounded shadow hover:shadow-lg transition-shadow duration-300 min-w-[250px]"
            >
              <h3 className="text-lg font-semibold mb-2 text-blue-600 text-center">
                {tower}
              </h3>
              <div className="mb-4">
                <ul className="mt-2 space-y-2 max-h-[350px] overflow-y-auto pr-2">
                  {(towerData.floors[tower] || []).map((floor, i) => (
                    <li
                      key={i}
                      className="flex justify-between items-center bg-gray-100 p-1 rounded"
                    >
                      {editing.tower === tower && editing.floorIndex === i ? (
                        <input
                          type="text"
                          value={editing.floorName}
                          onChange={(e) =>
                            setEditing((prev) => ({
                              ...prev,
                              floorName: e.target.value,
                            }))
                          }
                          onBlur={() => {
                            handleEditFloor(tower, i, editing.floorName);
                            setEditing({
                              tower: null,
                              floorIndex: null,
                              floorName: "",
                            });
                          }}
                          className="flex-1 border rounded px-2 py-1"
                          autoFocus
                        />
                      ) : (
                        <span>{floor}</span>
                      )}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDeleteFloor(tower, floor)}
                          className="text-red-600 hover:text-red-800 font-semibold"
                        >
                          <MdDelete />
                        </button>
                        <button
                          onClick={() =>
                            setEditing({
                              tower,
                              floorIndex: i,
                              floorName: floor,
                            })
                          }
                          className="text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          <MdModeEdit />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-center items-center mb-2">
                <button
                  className="mt-4 flex items-center text-green-700 hover:text-green-900 font-semibold"
                  onClick={() => setCurrentTower(tower)}
                >
                  <FaPlus className="mr-2" />
                  Add Floor
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {currentTower && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full relative">
            <h2 className="text-lg font-bold mb-4">
              Add Floors to {currentTower}
            </h2>
            <input
              type="number"
              value={floorInput}
              onChange={(e) => setFloorInput(e.target.value)}
              className="border rounded p-2 mb-4 w-full focus:outline-none focus:ring focus:border-green-300"
              placeholder="Number of Floors"
              min="1"
            />

            <h2 className="text-md font-bold mb-2">
              Select Common Floor Types
            </h2>

            <div className="flex flex-wrap gap-2 mb-4">
              {additionalFloorTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => handleToggleFloorType(type)}
                  className={`px-3 py-2 rounded font-semibold ${
                    selectedCommonFloors.includes(type)
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            {/* <select
              multiple
              value={selectedCommonFloors}
              onChange={(e) => {
                const options = e.target.options;
                const values = [];
                for (let i = 0; i < options.length; i++) {
                  if (options[i].selected) {
                    values.push(options[i].value);
                  }
                }
                setSelectedCommonFloors(values);
              }}
              className="border rounded p-2 mb-4 w-full focus:outline-none focus:ring focus:border-green-300"
            >
              {additionalFloorTypes.map((type, index) => (
                <option key={index} value={type}>{type}</option>
              ))}
            </select> */}

            <button
              className="bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600 transition-colors duration-200 w-full"
              onClick={handleAddFloors}
            >
              Add Floors
            </button>

            <button
              onClick={() => setCurrentTower(null)}
              className="absolute top-2 right-2 text-gray-600 hover:text-red-600"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentStep(2)}
          className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500"
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentStep(4)}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
          Save & Proceed to Next Step
        </button>
      </div>
    </div>
  );
};

const ZoneConfiguration = ({ zoneData = {}, setZoneData }) => {
  const [subZoneCounts, setSubZoneCounts] = useState({});
  const [zoneNames, setZoneNames] = useState({});

  useEffect(() => {
    if (zoneData && Object.keys(zoneData).length > 0) {
      const initializeZoneNames = () => {
        const newZoneNames = {};
        Object.keys(zoneData).forEach((towerName) => {
          if (Array.isArray(zoneData[towerName])) {
            zoneData[towerName].forEach((floor) => {
              if (Array.isArray(floor.zones)) {
                floor.zones.forEach((zone) => {
                  newZoneNames[`${towerName}-${floor.floor}-${zone.name}`] =
                    zone.name;
                  if (Array.isArray(zone.subZones)) {
                    zone.subZones.forEach((subZone) => {
                      newZoneNames[
                        `${towerName}-${floor.floor}-${zone.name}-${subZone.name}`
                      ] = subZone.name;
                    });
                  }
                });
              }
            });
          }
        });
        setZoneNames(newZoneNames);
      };
      initializeZoneNames();
    }
  }, [zoneData]);

  if (
    !zoneData ||
    typeof zoneData !== "object" ||
    Object.keys(zoneData).length === 0
  ) {
    return (
      <div className="text-center text-lg text-gray-600">
        No zones configured yet.
      </div>
    );
  }

  const handleAddSubZones = (
    towerName,
    floorName,
    zonePath,
    numberOfSubZones
  ) => {
    if (numberOfSubZones > 0) {
      const newSubZones = [];
      for (let i = 1; i <= numberOfSubZones; i++) {
        const subZoneName = `Sub-Zone ${i}`;
        newSubZones.push({ name: subZoneName, subZones: [] });
      }

      setZoneData((prevData) => {
        const updatedHierarchy = addSubZonesToHierarchy(
          prevData[towerName],
          floorName,
          zonePath,
          newSubZones
        );
        return {
          ...prevData,
          [towerName]: updatedHierarchy,
        };
      });
    }
  };

  const handleRemoveZone = (towerName, floorName, zonePath, zoneName) => {
    setZoneData((prevData) => {
      const updatedHierarchy = removeZoneFromHierarchy(
        prevData[towerName],
        floorName,
        zonePath,
        zoneName
      );
      return {
        ...prevData,
        [towerName]: updatedHierarchy,
      };
    });
  };

  const handleRenameZone = (
    towerName,
    floorName,
    zonePath,
    oldZoneName,
    newZoneName
  ) => {
    setZoneData((prevData) => {
      const updatedHierarchy = renameZoneInHierarchy(
        prevData[towerName],
        floorName,
        zonePath,
        oldZoneName,
        newZoneName
      );
      return {
        ...prevData,
        [towerName]: updatedHierarchy,
      };
    });
  };

  const renameZoneInHierarchy = (
    floors,
    floorName,
    zonePath,
    oldZoneName,
    newZoneName
  ) => {
    return floors.map((floor) => {
      if (floor.floor === floorName) {
        const updatedZones = renameSubZone(
          floor.zones,
          zonePath,
          oldZoneName,
          newZoneName
        );
        return {
          ...floor,
          zones: updatedZones,
        };
      }
      return floor;
    });
  };

  const renameSubZone = (zones, zonePath, oldZoneName, newZoneName) => {
    if (zonePath.length === 0) {
      return zones.map((zone) => {
        if (zone.name === oldZoneName) {
          return { ...zone, name: newZoneName };
        }
        return zone;
      });
    }

    const [currentZone, ...restPath] = zonePath;
    return zones.map((zone) => {
      if (zone.name === currentZone) {
        return {
          ...zone,
          subZones: renameSubZone(
            zone.subZones,
            restPath,
            oldZoneName,
            newZoneName
          ),
        };
      }
      return zone;
    });
  };

  const removeZoneFromHierarchy = (
    floors,
    floorName,
    zonePath,
    zoneToRemove
  ) => {
    return floors.map((floor) => {
      if (floor.floor === floorName) {
        const updatedZones = removeSubZone(floor.zones, zonePath, zoneToRemove);
        return { ...floor, zones: updatedZones };
      }
      return floor;
    });
  };

  const removeSubZone = (zones, zonePath, zoneToRemove) => {
    const [currentZone, ...restPath] = zonePath;
    return zones.reduce((acc, zone) => {
      if (zone.name === zoneToRemove && zonePath.length === 0) {
        return acc;
      }

      if (zone.name === currentZone) {
        return [
          ...acc,
          {
            ...zone,
            subZones:
              restPath.length === 0
                ? []
                : removeSubZone(zone.subZones, restPath, zoneToRemove),
          },
        ];
      }

      return [...acc, zone];
    }, []);
  };

  const addSubZonesToHierarchy = (floors, floorName, zonePath, newSubZones) => {
    return floors.map((floor) => {
      if (floor.floor === floorName) {
        if (!zonePath) {
          return { ...floor, zones: [...floor.zones, ...newSubZones] };
        } else {
          const updatedZones = updateSubZoneHierarchy(
            floor.zones,
            zonePath,
            newSubZones
          );
          return { ...floor, zones: updatedZones };
        }
      }
      return floor;
    });
  };

  const updateSubZoneHierarchy = (zones, zonePath, newSubZones) => {
    const [currentZone, ...restPath] = zonePath;
    return zones.map((zone) => {
      if (zone.name === currentZone) {
        if (restPath.length === 0) {
          return { ...zone, subZones: [...zone.subZones, ...newSubZones] };
        } else {
          return {
            ...zone,
            subZones: updateSubZoneHierarchy(
              zone.subZones,
              restPath,
              newSubZones
            ),
          };
        }
      }
      return zone;
    });
  };

  const renderZones = (
    zones,
    towerName,
    floorName,
    parentPath = [],
    isMainZone = true
  ) => (
    <ul className="space-y-4 ml-4">
      {zones?.map((zone) => {
        const zoneName = zone.name;
        const currentPath = [...parentPath, zoneName];

        if (!zoneName) return null;

        return (
          <li key={zoneName} className="mb-4">
            <div
              className={`flex justify-between items-center p-2 rounded-lg shadow-sm ${
                isMainZone ? "bg-green-200" : "bg-blue-200"
              }`}
            >
              <input
                type="text"
                value={
                  zoneNames[`${towerName}-${floorName}-${zoneName}`] || zoneName
                }
                onChange={(e) =>
                  setZoneNames({
                    ...zoneNames,
                    [`${towerName}-${floorName}-${zoneName}`]: e.target.value,
                  })
                }
                onBlur={() =>
                  handleRenameZone(
                    towerName,
                    floorName,
                    parentPath,
                    zoneName,
                    zoneNames[`${towerName}-${floorName}-${zoneName}`] ||
                      zoneName
                  )
                }
                className="border border-gray-300 rounded-lg p-1 w-1/2 focus:ring focus:ring-indigo-200"
              />
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    handleRemoveZone(towerName, floorName, parentPath, zoneName)
                  }
                  className="text-red-500 hover:text-red-700 focus:outline-none transition duration-300"
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            <div className="flex items-center mb-2 ml-6">
              <label className="text-gray-600 mr-2">Sub-Zones:</label>
              <input
                type="number"
                min="1"
                value={
                  subZoneCounts[
                    `${towerName}-${floorName}-${currentPath.join("-")}`
                  ] || ""
                }
                onChange={(e) =>
                  setSubZoneCounts((prev) => ({
                    ...prev,
                    [`${towerName}-${floorName}-${currentPath.join("-")}`]:
                      e.target.value,
                  }))
                }
                className="border border-gray-300 rounded-lg p-1 w-1/3 focus:ring focus:ring-indigo-200"
              />
              <button
                onClick={() =>
                  handleAddSubZones(
                    towerName,
                    floorName,
                    currentPath,
                    subZoneCounts[
                      `${towerName}-${floorName}-${currentPath.join("-")}`
                    ]
                  )
                }
                className="ml-2 text-green-600 hover:text-green-800 focus:outline-none transition duration-300"
              >
                <FaPlus className="mr-2" /> Add
              </button>
            </div>

            {zone.subZones &&
              renderZones(
                zone.subZones,
                towerName,
                floorName,
                currentPath,
                false
              )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="p-6 bg-white shadow-xl rounded-lg">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Zone Configuration
      </h2>
      <div className="flex flex-wrap -mx-2">
        {Object.keys(zoneData).map((towerName) => (
          <div key={towerName} className="w-full md:w-1/2 lg:w-1/3 p-2">
            <div className="mb-4 p-6 bg-gray-50 border border-gray-200 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-gray-900">
                {towerName}
              </h3>
              {zoneData[towerName].map((floor) => (
                <div
                  key={floor.floor}
                  className="mb-4 p-4 bg-white shadow rounded-lg"
                >
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">
                    Floor {floor.floor}
                  </h4>

                  <div className="flex items-center mb-2">
                    <label className="text-gray-600 mr-2">Zones:</label>
                    <input
                      type="number"
                      min="1"
                      value={subZoneCounts[`${towerName}-${floor.floor}`] || ""}
                      onChange={(e) =>
                        setSubZoneCounts((prev) => ({
                          ...prev,
                          [`${towerName}-${floor.floor}`]: e.target.value,
                        }))
                      }
                      className="border border-gray-300 rounded-lg p-1 w-1/3 focus:ring focus:ring-indigo-200"
                    />
                    <button
                      onClick={() =>
                        handleAddSubZones(
                          towerName,
                          floor.floor,
                          null,
                          subZoneCounts[`${towerName}-${floor.floor}`]
                        )
                      }
                      className="ml-2 text-green-600 hover:text-green-800 focus:outline-none transition duration-300"
                    >
                      <FaPlus className="mr-2" /> Add
                    </button>
                  </div>

                  {renderZones(floor.zones, towerName, floor.floor)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const FlatTypeSetup = ({ currentStep, setCurrentStep }) => {
  const [flatType, setFlatType] = useState("");
  const [common, setCommon] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [newRoom, setNewRoom] = useState("");
  const [roomOptions, setRoomOptions] = useState([
    "Living Room",
    "Kitchen",
    "Bedroom 1",
    "Bedroom 2",
    "Bathroom",
    "Hall",
    "Dining Room",
    "Master Bedroom",
    "Balcony",
    "Store Room",
    "Study Toilet",
    "Bedroom 1",
  ]);
  const [submittedFlatType, setSubmittedFlatType] = useState(null);
  const [submittedOptions, setSubmittedOptions] = useState([]);
  const [isEditing, setIsEditing] = useState(false); // Manage edit mode state
  const [showAll, setShowAll] = useState(false);
  const [createIsShow, setCreateIsShow] = useState(false);
  // Adding a new room
  const handleAddRoom = () => {
    if (newRoom && !roomOptions.includes(newRoom)) {
      setRoomOptions([...roomOptions, newRoom]);
      setNewRoom("");
    }
  };

  const handleOptionChange = (option) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter((item) => item !== option));
    } else if (selectedOptions.length < 15) {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const handleSubmit = () => {
    setSubmittedFlatType(flatType);
    setSubmittedOptions(selectedOptions);
  };

  const handleEdit = () => {
    setIsEditing(true); // Set to editing mode when edit button is clicked
  };

  const handleDeleteFlatType = () => {
    setSubmittedFlatType(null);
    setSubmittedOptions([]);
  };

  const handleDeleteRoom = (roomToDelete) => {
    setSubmittedOptions(
      submittedOptions.filter((room) => room !== roomToDelete)
    );
    setSelectedOptions(selectedOptions.filter((room) => room !== roomToDelete)); // Remove from selected options too
  };
  const visibleOptions = showAll ? roomOptions : roomOptions.slice(0, 10);
  const [isFlatType, setIsFlatType] = useState(false);
  const [checked, setChecked] = useState(false);

  const formattedRoomOptions = roomOptions.map((room) => ({
    value: room,
    label: room,
  }));

  const handleSelectChange = (selected) => {
    setSelectedOptions(selected);
  };

  const [isEditFlatType, setIsEditFlatType] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-6 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-bold mb-4">Flat Type Setup</h2>

      {/* Room selection section */}
      <div className="flex flex-wrap gap-4 mb-6">
        {visibleOptions.map((option) => (
          <button
            key={option}
            className={`border rounded-md p-2 whitespace-nowrap ${
              selectedOptions.includes(option)
                ? "bg-green-700 text-white"
                : "bg-white text-green-700"
            }`}
            onClick={() => handleOptionChange(option)}
          >
            {option}
          </button>
        ))}
        <div>
          <button
            className="underline"
            onClick={() => setShowAll((prev) => !prev)}
          >
            {showAll ? "View Less" : "View More"}
          </button>
        </div>
      </div>
      <div className="flex gap-2 mb-5">
        <button
          className="border rounded-md text-gray-800 px-5 py-2 flex items-center gap-1"
          onClick={() => setCreateIsShow(!createIsShow)}
        >
          <IoMdAdd /> New Room
        </button>
        {createIsShow && (
          <div className="flex items-center">
            <input
              type="text"
              value={newRoom}
              onChange={(e) => setNewRoom(e.target.value)}
              placeholder="Enter New Room"
              className="border rounded-md p-2 mr-2 w-full"
            />
            <button
              onClick={handleAddRoom}
              className="bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600 whitespace-nowrap"
            >
              Save
            </button>
          </div>
        )}
      </div>
      {/* Flat type input */}

      {/* Submit button */}
      <div className="flex justify-between">
        <button
          onClick={() => setIsFlatType(!isFlatType)}
          // onClick={handleSubmit}
          className="bg-green-700 text-white font-bold py-2 px-6 rounded hover:bg-green-800 flex items-center gap-1"
        >
          <IoMdAdd /> Add Flat Type
        </button>
      </div>
      <div className="flex gap-5">
        {isFlatType && (
          <div className="border rounded-md w-96 p-3 my-5 grid grid-rows-3 content-between">
            <div>
              <div className="flex gap-5 items-center mb-3">
                <div className="flex items-center">
                  <input
                    type="text"
                    value={flatType}
                    onChange={(e) => setFlatType(e.target.value)}
                    className="border rounded-md w-full p-2"
                    placeholder="Enter Flat Type"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="customCheckbox"
                    className="w-3 h-3 text-violet-500 border-gray-300 rounded focus:ring focus:ring-violet-300"
                    checked={checked}
                    onChange={() => setChecked(!checked)}
                  />
                  <label htmlFor="customCheckbox" className="text-gray-700">
                    Common
                  </label>
                </div>
              </div>
              <Select
                isMulti
                options={formattedRoomOptions}
                value={selectedOptions}
                onChange={handleSelectChange}
                placeholder="Select up to 15 Options"
                className="basic-multi-select"
                classNamePrefix="select"
              />
            </div>
            <div></div>
            <div className="flex justify-center my-6">
              <button className="border text-black font-bold px-6 flex items-center gap-1 rounded-md">
                Create
              </button>
            </div>
          </div>
        )}
        <div className="border rounded-md w-96 p-5 my-5">
          <div className="flex gap-3 items-center mb-3">
            <div className="flex items-center">
              <input
                type="text"
                value={flatType}
                onChange={(e) => setFlatType(e.target.value)}
                className="border rounded-md w-full p-2"
                placeholder="Enter Flat Type"
                disabled={!isEditFlatType}
              />
            </div>
            <input
              type="color"
              value="#3C4AF5"
              className="w-8 h-8"
              disabled={!isEditFlatType}
            />
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="customCheckbox"
                className="w-3 h-3 text-violet-500 border-gray-300 rounded focus:ring focus:ring-violet-300"
                checked={checked}
                onChange={() => setChecked(!checked)}
                disabled={!isEditFlatType}
              />
              <label htmlFor="customCheckbox" className="text-gray-700">
                Common
              </label>
            </div>
          </div>
          <div className="flex justify-center my-5">
            {isEditFlatType ? (
              <div className="w-full">
                <Select
                  isMulti
                  options={formattedRoomOptions}
                  value={selectedOptions}
                  onChange={handleSelectChange}
                  placeholder="Select up to 15 Options"
                  className="w-full"
                  classNamePrefix="select"
                  readOnly
                />
              </div>
            ) : (
              <div className="flex flex-col w-full space-y-2">
                <div className="border rounded-md p-2 px-5 w-full">
                  <h2>Living Room</h2>
                </div>
                <div className="border rounded-md p-2 px-5 w-full">
                  <h2>Bedroom 1</h2>
                </div>
                <div className="border rounded-md p-2 px-5 w-full">
                  <h2>Kitchen</h2>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center my-5">
            {isEditFlatType ? (
              <button
                onClick={() => setIsEditFlatType(false)}
                className="bg-green-700 text-white font-bold py-2 px-6 rounded flex items-center gap-1"
              >
                Save
              </button>
            ) : (
              <button
                onClick={() => setIsEditFlatType(true)}
                className="border text-black font-bold py-2 px-6 rounded flex items-center gap-1"
              >
                Edit
              </button>
            )}
          </div>
          {/* <div className="mt-6 p-4 border-t-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">
              Submitted Flat Type:{" "}
              <span className="text-green-700">{submittedFlatType}</span>
            </h3>
            <button
              onClick={handleEdit}
              className="bg-green-700 text-white py-2 px-4 rounded hover:bg-green-800"
            >
              Edit
            </button>
          </div>
          <h4 className="font-semibold mb-2">Selected Rooms:</h4>
          <div className="flex flex-wrap items-center">
            {submittedOptions.map((option, index) => (
              <span
                key={index}
                className="bg-green-100 text-green-700 font-medium px-3 py-1 rounded-full mr-2 mb-2 flex items-center"
              >
                <FaCheckCircle className="text-green-500 mr-2" />
                {option}
                {isEditing && (
                  <button
                    onClick={() => handleDeleteRoom(option)}
                    className="text-red-500 ml-2"
                  >
                    <FaTrash />
                  </button>
                )}
              </span>
            ))}
          </div>
        </div> */}
        </div>
      </div>
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentStep(4)}
          className="bg-gray-400 text-white px-4 py-2 rounded-md"
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentStep(6)}
          className="bg-green-500 text-white px-4 py-2 rounded-md"
        >
          Save & Proceed to Next Step
        </button>
      </div>
    </div>
  );
};

const FlatUnitConfiguration = ({ currentStep, setCurrentStep }) => {
  const [tower, setTower] = useState("");
  const [floors, setFloors] = useState([]);
  const [unitsPerFloor, setUnitsPerFloor] = useState({});
  const [selectedFlatType, setSelectedFlatType] = useState(null);
  const [error, setError] = useState("");
  const [unitCount, setUnitCount] = useState(""); // Store number of units to add

  const towerData = {
    "Tower A": 5,
    "Tower B": 8,
    "Tower C": 10,
  };

  const flatTypes = ["1BHK", "2BHK", "3BHK", "4BHK"];

  const flatTypeColors = {
    "1BHK": "#FFCCCB",
    "2BHK": "#FFEB3B",
    "3BHK": "#BBDEFB",
    "4BHK": "#C8E6C9",
  };

  const handleTowerChange = (selectedTower) => {
    setTower(selectedTower);
    setFloors(
      Array.from({ length: towerData[selectedTower] }, (_, i) => i + 1)
    );
    setUnitsPerFloor({});
  };

  const handleAddUnitsToAllFloors = () => {
    if (!unitCount || unitCount <= 0) {
      alert("Please enter a valid number of units.");
      return;
    }

    setUnitsPerFloor(() => {
      const updatedUnits = {};
      floors.forEach((floor) => {
        const newUnits = Array.from({ length: unitCount }, (_, i) => ({
          name: `${floor}${i + 1}01`,
          type: selectedFlatType,
        }));

        updatedUnits[floor] = {
          units: newUnits, // Replaces the units instead of appending
        };
      });
      return updatedUnits;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pb-5 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Configure Units/Area</h2>

      <div className="flex gap-2 justify-center my-5">
        <div>
          <select
            value={tower}
            onChange={(e) => handleTowerChange(e.target.value)}
            className="border p-2 rounded w-60"
          >
            <option value="">Select Tower</option>
            {Object.keys(towerData).map((towerName) => (
              <option key={towerName} value={towerName}>
                {towerName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <input
            type="number"
            className="border p-2 rounded w-fit"
            placeholder="Number of Units"
            value={unitCount}
            onChange={(e) => setUnitCount(e.target.value)}
          />
        </div>

        <div>
          <button
            onClick={handleAddUnitsToAllFloors}
            className="bg-blue-500 text-white px-4 py-2 rounded w-fit hover:bg-blue-600"
          >
            Add Units for All Floors
          </button>
        </div>
      </div>

      {/* <div className="flex items-center space-x-4 mb-4">
        <label className="font-semibold">Select Flat Type for All Units:</label>
        <select
          value={selectedFlatType}
          onChange={(e) => setSelectedFlatType(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Select Flat Type</option>
          {flatTypes.map((flatType) => (
            <option key={flatType} value={flatType}>
              {flatType}
            </option>
          ))}
        </select>
      </div> */}

      {tower && (
        <div>
          <div className="flex gap-2 mb-4">
            {flatTypes.map((flat, index) => (
              <button
                key={index}
                className={`px-3 py-1 rounded text-black ${
                  selectedFlatType === flat ? "border-2 border-black" : ""
                }`}
                style={{ backgroundColor: flatTypeColors[flat] || "#E0E0E0" }}
                onClick={() => setSelectedFlatType(flat)}
              >
                {flat}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Floor</th>
                  <th className="border px-4 py-2">Units</th>
                </tr>
              </thead>
              <tbody>
                {floors.map((floor) => (
                  <tr key={floor} className="border">
                    <td className="border px-5 py-2 font-semibold whitespace-nowrap">
                      Floor {floor}
                    </td>
                    <td className="border px-5 py-2">
                      <div className="flex items-center space-x-4">
                        {unitsPerFloor[floor]?.units?.map((unit, i) => (
                          <div
                            key={i}
                            className="flex items-center space-x-2 border p-2"
                          >
                            <input
                              type="text"
                              className="p-2 rounded w-20"
                              value={unit.name}
                              onChange={(e) =>
                                setUnitsPerFloor((prev) => {
                                  const updatedUnits = [...prev[floor].units];
                                  updatedUnits[i].name = e.target.value;
                                  return {
                                    ...prev,
                                    [floor]: { units: updatedUnits },
                                  };
                                })
                              }
                            />
                            <span
                              className="px-2 py-1 rounded text-white"
                              style={{
                                backgroundColor: flatTypeColors[unit.type],
                              }}
                            >
                              {unit.type}
                            </span>
                            <button
                              onClick={() =>
                                setUnitsPerFloor((prev) => {
                                  const updatedUnits = [...prev[floor].units];
                                  updatedUnits.splice(i, 1);
                                  return {
                                    ...prev,
                                    [floor]: { units: updatedUnits },
                                  };
                                })
                              }
                              className="text-red-500 px-2"
                            >
                              <IoMdClose />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            if (!selectedFlatType) return; // Prevent adding without selecting a flat type

                            setUnitsPerFloor((prev) => ({
                              ...prev,
                              [floor]: {
                                units: [
                                  ...(prev[floor]?.units || []),
                                  {
                                    name: `${floor}${
                                      (prev[floor]?.units?.length || 0) + 1
                                    }01`,
                                    type: selectedFlatType,
                                  },
                                ],
                              },
                            }));
                          }}
                          className="text-green-500"
                        >
                          <FaPlus />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {error && <div className="text-red-500 font-semibold mb-4">{error}</div>}

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(5)}
          className="bg-gray-400 text-white px-4 py-2 mt-2 rounded-md"
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentStep(7)}
          className="bg-green-500 text-white px-4 py-2 rounded-md"
        >
          Save & Proceed to Next Step
        </button>
      </div>
    </div>
  );
};

const TransferLevelSelection = ({ currentStep, setCurrentStep }) => {
  const [selectedLevel, setSelectedLevel] = useState("Question Level");

  const [successMessage, setSuccessMessage] = useState("");

  // Function to handle the button click
  const handleSubmit = () => {
    // Logic for saving data goes here...

    // Set the success message
    setSuccessMessage("Submitted Successfully! Thank You!!!");
  };

  const handleSelection = (event) => {
    setSelectedLevel(event.target.value);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="bg-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-green-700">
          Note :
        </h2>

        <p className=" text-gray-600 mb-8 text-justify text-xl">
          You have the option to select the transfer at Question-level /
          Checklist-level . For Example: If you choose Question-level, the
          moment a question has a positive answer it will be transferred to the
          next level. If you choose to transfer at the checklist level, a
          checklist will move to the next level only after all the Questions in
          the checklist have marked positive.
        </p>

        <form className="mb-8">
          <div className="flex flex-col-10 gap-4">
            <label className="flex items-center justify-between space-x-3 py-2 border border-gray-200 rounded-md px-4">
              <input
                type="radio"
                name="transferLevel"
                value="Flat Level"
                checked={selectedLevel === "Flat Level"}
                onChange={handleSelection}
                className="form-radio h-4 w-4 text-green-600"
              />
              <span className="text-gray-700 text-xl">Flat Level</span>
            </label>

            <label className="flex items-center justify-between space-x-3 py-2 border border-gray-200 rounded-md px-4">
              <input
                type="radio"
                name="transferLevel"
                value="Room Level"
                checked={selectedLevel === "Room Level"}
                onChange={handleSelection}
                className="form-radio h-4 w-4 text-green-600"
              />
              <span className="text-gray-700 text-xl">Room Level</span>
            </label>

            <label className="flex items-center justify-between space-x-3 py-2 border border-gray-200 rounded-md px-4">
              <input
                type="radio"
                name="transferLevel"
                value="Checklist Level"
                checked={selectedLevel === "Checklist Level"}
                onChange={handleSelection}
                className="form-radio h-4 w-4 text-green-600"
              />
              <span className="text-gray-700 text-xl">Checklist Level</span>
            </label>

            <label className="flex items-center justify-between space-x-3 py-2 border border-gray-200 rounded-md px-4">
              <input
                type="radio"
                name="transferLevel"
                value="Question Level"
                checked={selectedLevel === "Question Level"}
                onChange={handleSelection}
                className="form-radio h-4 w-4 text-green-600"
              />
              <span className="text-gray-700 text-xl">Question Level</span>
            </label>
          </div>
        </form>

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep(6)} // Move to previous step
            className="bg-gray-400 text-white px-4 py-2 mt-2 rounded-md"
          >
            Previous
          </button>
          <button
            onClick={handleSubmit}
            className="bg-green-500 text-white px-4 py-2 rounded-md"
          >
            Submit
          </button>

          {/* Display Success Message */}
          {successMessage && (
            <div className="mt-4 text-green-600 font-semibold">
              {successMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Schedule = ({ currentStep, setCurrentStep }) => {
  const deliveries = [
    {
      responsiblePerson: "demo user",
      tower: "I2",
      floor: "Ground",
      flat: "03",
      startDate: "2022-07-22",
      endDate: "2022-07-22",
      currentStage: "Stage 1",
      status: "rejected",
    },
    {
      responsiblePerson: "demo user",
      tower: "I2",
      floor: "Ground",
      flat: "02",
      startDate: "2022-07-22",
      endDate: "2022-07-22",
      currentStage: "Stage 1",
      status: "rejected",
    },
    {
      responsiblePerson: "demo user, Admin Lockated",
      tower: "H1",
      floor: "Ground",
      flat: "Retail 1",
      startDate: "2022-08-29",
      endDate: "2022-08-31",
      currentStage: "Stage 2",
      status: "complete",
    },
    {
      responsiblePerson: "demo user, Admin Lockated",
      tower: "H1",
      floor: "Ground",
      flat: "5",
      startDate: "2022-08-29",
      endDate: "2022-08-31",
      currentStage: "Stage 1",
      status: "wip",
    },
  ];
  const [isAdd, setAdd] = useState(false);
  const [selectedTowers, setSelectedTowers] = useState([]);
  const towers = [
    "H1",
    "H2",
    "I1",
    "I2",
    "I3",
    "I4",
    "I5",
    "I6",
    "J1",
    "J2",
    "J3",
    "J4",
    "J5",
    "J6",
  ];
  const handleAdd = () => {
    setAdd(true);
  };

  const [activeTab, setActiveTab] = useState("delivery");

  return (
    <div className="max-w-7xl mx-auto p-5 bg-white rounded shadow-lg">
      {/* Tabs navigation */}
      <div className="flex space-x-6 border-b pb-2">
        <button
          className={`text-base px-6 py-2 ${
            activeTab === "delivery" ? "border-b-2 border-primary" : ""
          }`}
          onClick={() => setActiveTab("delivery")}
        >
          Delivery Rules
        </button>
        {/* <button
          className={`text-base px-6 py-2 ${activeTab === "general" ? "border-b-2 border-primary" : ""}`}
          onClick={() => setActiveTab("general")}
        >
          General Rules
        </button>
        <button
          className={`text-base px-6 py-2 ${activeTab === "daily" ? "border-b-2 border-primary" : ""}`}
          onClick={() => setActiveTab("daily")}
        >
          Daily Activities
        </button>
        <button
          className={`text-base px-6 py-2 ${activeTab === "handover" ? "border-b-2 border-primary" : ""}`}
          onClick={() => setActiveTab("handover")}
        >
          Handover Approval
        </button> */}
      </div>

      {/* Tab content */}
      {activeTab === "delivery" && (
        <div className="mt-6">
          <div className="flex gap-2 mb-6">
            <button
              className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 flex items-centern"
              onClick={handleAdd}
            >
              Schedule
            </button>
            <button className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 flex items-center">
              Filter
            </button>
            <button className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 flex items-center">
              Export
            </button>
          </div>

          <div className="border rounded-lg">
            <table className="min-w-full">
              <thead>
                <tr className="bg-purple-50">
                  <th className="font-semibold px-4 py-2">Responsible Role</th>
                  <th className="font-semibold px-4 py-2">Tower</th>
                  <th className="font-semibold px-4 py-2">Floor</th>
                  <th className="font-semibold px-4 py-2">Flat</th>
                  <th className="font-semibold px-4 py-2">Start Date</th>
                  <th className="font-semibold px-4 py-2">End Date</th>
                  <th className="font-semibold px-4 py-2">Current Stage</th>
                  <th className="font-semibold px-4 py-2">Status</th>
                  <th className="font-semibold px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((delivery, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{delivery.responsiblePerson}</td>
                    <td className="px-4 py-2">{delivery.tower}</td>
                    <td className="px-4 py-2">{delivery.floor}</td>
                    <td className="px-4 py-2">{delivery.flat}</td>
                    <td className="px-4 py-2">{delivery.startDate}</td>
                    <td className="px-4 py-2">{delivery.endDate}</td>
                    <td className="px-4 py-2">{delivery.currentStage}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                          ${
                            delivery.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : ""
                          }
                          ${
                            delivery.status === "complete"
                              ? "bg-green-100 text-green-800"
                              : ""
                          }
                          ${
                            delivery.status === "wip"
                              ? "bg-yellow-100 text-yellow-800"
                              : ""
                          }
                        `}
                      >
                        {delivery.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <button className="bg-transparent text-red-500 hover:text-red-600">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {isAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-full max-w-5xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Add Schedule</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setAdd(false)}
              >
                <MdOutlineCancel size={24} />
              </button>
            </div>

            {/* Form Controls */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm mb-1">Stage</label>
                <select className="w-full border rounded-md p-2">
                  <option>Select Stage</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Start Date</label>
                <input
                  type="date"
                  placeholder="Start Date"
                  className="w-full border rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">End Date</label>
                <input
                  type="date"
                  placeholder="End Date"
                  className="w-full border rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Role</label>
                <select className="w-full border rounded-md p-2">
                  <option>Inspector</option>
                  <option>Reviewer</option>
                  <option>Verifier</option>
                </select>
              </div>
            </div>

            {/* Selection Grid */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {/* Tower Selection */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-purple-700 font-semibold mb-3">
                  SELECT TOWER
                </h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {towers.map((tower) => (
                    <label
                      key={tower}
                      className="flex items-center space-x-2 p-2 hover:bg-purple-100 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTowers.includes(tower)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTowers([...selectedTowers, tower]);
                          } else {
                            setSelectedTowers(
                              selectedTowers.filter((t) => t !== tower)
                            );
                          }
                        }}
                        className="rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span>{tower}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Floor Selection */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-purple-700 font-semibold mb-3">
                  SELECT FLOOR
                </h3>
                <div className="h-[300px]"></div>
              </div>

              {/* Flat Selection */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-purple-700 font-semibold mb-3">
                  SELECT FLAT
                </h3>
                <div className="h-[300px]"></div>
              </div>

              {/* Preview */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-purple-700 font-semibold mb-3">PREVIEW</h3>
                <div className="h-[300px]"></div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-center">
              <button className="bg-purple-700 text-white px-6 py-2 rounded-md hover:bg-purple-800 transition-colors">
                SET SCHEDULE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
const User = ({ currentStep, setCurrentStep }) => {
  const [isAdd, setAdd] = useState(false);

  const handleAdd = () => {
    setAdd(true);
  };

  const users = [
    {
      id: 1,
      name: "Sagar Singh",
      role: "Inspector",
      email: "sagar@gmail.com",
    },
    {
      id: 2,
      name: "Vijay More",
      role: "Repairer",
      email: "vijay@gmail.com",
    },
    {
      id: 3,
      name: "Riya Gupta",
      role: "Reviewer",
      email: "riya@gmail.com",
    },
    {
      id: 4,
      name: "Rahal Yadav",
      role: "Initiator",
      email: "rahul@gmail.com",
    },
    {
      id: 5,
      name: "Priya Panchal",
      role: "Initiator",
      email: "rahul@gmail.com",
    },
  ];

  const [selectedUser, setSelectedUser] = useState(users[0]);
  const [expandedProject, setExpandedProject] = useState();
  const projects = [
    {
      name: "Godrej Crest",
      stages: [
        { stage: "Stage - 1", roles: ["Inspector", "Repairer"] },
        { stage: "Stage - 2", roles: ["Inspector", "Repairer"] },
      ],
    },
    {
      name: "Godrej RKS",
      stages: [
        { stage: "Stage - 1", roles: ["Inspector", "Repairer"] },
        { stage: "Stage - 2", roles: ["Inspector", "Repairer"] },
      ],
    },
    {
      name: "Godrej Retreat",
      stages: [
        { stage: "Stage - 1", roles: ["Inspector", "Repairer"] },
        { stage: "Stage - 2", roles: ["Inspector", "Repairer"] },
      ],
    },
  ];

  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState("Active User (5)");
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const selectStatus = (newStatus) => {
    setStatus(newStatus);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const projectOptions = [
    { value: "project1", label: "Project 1" },
    { value: "project2", label: "Project 2" },
    { value: "project3", label: "Project 3" },
    { value: "project4", label: "Project 4" },
  ];

  const [selectedProjects, setSelectedProjects] = useState([]);

  const handleChange = (selectedOptions) => {
    setSelectedProjects(selectedOptions);
  };

  const [isProject, setIsProject] = useState(false);
  const [isStage, setIsStage] = useState(false);
  return (
    <div className="px-6 max-w-7xl mx-auto bg-white rounded shadow-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">USERS</h1>
      </div>
      <div className="flex h-full border shadow-md">
        <div className="w-1/3 border-r p-4 bg-gray-100">
          <div className="flex items-center gap-2">
            <div className="relative w-full" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="w-full bg-purple-600 text-white py-2 mb-4 flex items-center justify-center gap-2 rounded"
              >
                {status}
                <span className="border-l border-white h-5"></span>
                <IoIosArrowDown />
              </button>

              {isOpen && (
                <div className="absolute left-0 w-full bg-white shadow-md rounded-md">
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-200"
                    onClick={() => selectStatus("Active User (5)")}
                  >
                    Active User (5)
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-200"
                    onClick={() => selectStatus("Inactive User (2)")}
                  >
                    Inactive User (2)
                  </button>
                </div>
              )}
            </div>
            <div className="w-full bg-purple-600 text-white py-2 mb-4 flex items-center justify-center gap-2 rounded">
              <button onClick={handleAdd} className="flex gap-2 items-center">
                <FaPlus />
                New User
              </button>
              <span className="border-l border-white h-5"></span>
              <IoIosArrowDown />
            </div>
          </div>
          <div className="my-2">
            <input
              type="search"
              placeholder="Search"
              className="w-full py-2 px-2 rounded-md"
            />
          </div>
          <div className="max-h-[450px] overflow-y-auto">
            {users.map((user, index) => (
              <div
                key={index}
                className={`p-4 flex items-center gap-3 cursor-pointer rounded ${
                  selectedUser.id === user.id
                    ? "bg-gradient-to-r from-purple-500 to=pink-500 text-white"
                    : "bg-white"
                }`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex items-center gap-4">
                  <div className="border w-16 h-16">
                    <img src={profile} className="rounded-md" alt="profile" />
                  </div>
                  <div>
                    <h3 className="font-bold">{user.name}</h3>
                    <p className="text-sm">{user.role}</p>
                    <p className="text-xs">{user.email}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="w-2/3 p-6">
          <div className="flex">
            <div className="flex items-center gap-4">
              <div className="border w-20 h-20">
                <img src={profile} className="rounded-md" alt="profile" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{selectedUser.name}</h2>
                <p className="text-gray-600">{selectedUser.role}</p>
                <p className="flex items-center gap-2 text-gray-600">
                  <FaEnvelope /> {selectedUser.email}
                </p>
              </div>
            </div>
            <FaEdit className="text-gray-500 cursor-pointer" />
          </div>
          <h3 className="mt-6 text-xl font-bold">User Information</h3>
          <div className="mt-4">
            <div className="border rounded p-3 mt-2">
              <div className="flex flex-col space-y-5">
                {projects.map((project, index) => (
                  <div key={index}>
                    <div className="flex gap-2 items-center">
                      <h2 className="font-semibold">{project.name}</h2>
                      <button
                        onClick={() =>
                          setExpandedProject(
                            expandedProject === index ? null : index
                          )
                        }
                      >
                        <IoIosArrowDown
                          size={20}
                          className={
                            expandedProject === index ? "rotate-180" : ""
                          }
                        />
                      </button>
                    </div>
                    {expandedProject === index && (
                      <div className="ml-4 border-l pl-4 my-3 space-y-3">
                        {project.stages.map((stage, idx) => (
                          <div key={idx}>
                            <p className="font-medium">{stage.stage}</p>
                            <ul className="ml-8 list-disc space-y-2 my-2">
                              {stage.roles.map((role, i) => (
                                <li key={i}>{role}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 text-gray-800 space-y-2">
            <div className="flex gap-5">
              <p className="font-semibold">Created by: </p>
              <p>Suneel More </p>
              <p>Sat, 23 Mar 2024 11:15 PM</p>
            </div>
            <div className="flex gap-5">
              <p className="font-semibold">Last Modified by: </p>
              <p>Dinesh Shinde </p>
              <p> Sat, 25 Mar 2024 01:15 PM</p>
            </div>
          </div>
        </div>
      </div>
      {isAdd && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white max-h-[90vh] w-1/3 rounded-lg shadow-lg p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-semibold text-start">Add New User</h1>
              <button
                className="text-gray-600 hover:text-gray-800"
                onClick={() => setAdd(false)}
              >
                <MdOutlineCancel size={24} />
              </button>
            </div>

            {/* <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <button className="absolute bottom-0 right-0 bg-purple-700 text-white p-2 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
              </div>
            </div> */}

            <div className="overflow-y-auto max-h-[90vh]">
              <form className="space-y-3 px-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-5 gap-5 items-center mt-3">
                    <label className="text-sm font-medium whitespace-nowrap text-end">
                      First Name<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="col-span-4 w-full p-1 border rounded focus:outline-none focus:ring-1 focus:ring-purple-700"
                    />
                  </div>
                  <div className="grid grid-cols-5 gap-5 items-center">
                    <label className="text-sm font-medium whitespace-nowrap text-end">
                      Last Name<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="col-span-4 w-full p-1 border rounded focus:outline-none focus:ring-1 focus:ring-purple-700"
                    />
                  </div>
                  <div className="grid grid-cols-5 gap-5 items-center">
                    <label className="text-sm font-medium whitespace-nowrap text-end">
                      Mobile<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      className="col-span-4 w-full p-1 border rounded focus:outline-none focus:ring-1 focus:ring-purple-700"
                    />
                  </div>
                  <div className="grid grid-cols-5 gap-5 items-center">
                    <label className="text-sm font-medium whitespace-nowrap text-end">
                      Email ID<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      className="col-span-4 w-full p-1 border rounded focus:outline-none focus:ring-1 focus:ring-purple-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-5 items-center">
                  <label className="text-sm font-medium whitespace-nowrap text-end">
                    Profile<span className="text-red-500">*</span>
                  </label>
                  <select className="col-span-4 w-full p-1 border rounded focus:outline-none focus:ring-1 focus:ring-purple-700 h-[38px]">
                    <option value="">Select Profile</option>
                  </select>
                </div>

                <div className="grid grid-cols-5 gap-5 items-center">
                  <label className="text-sm font-medium whitespace-nowrap text-end">
                    Project
                  </label>
                  <div className="col-span-4">
                    <Select
                      isMulti
                      options={projectOptions}
                      value={selectedProjects}
                      onChange={handleChange}
                      className="w-full"
                      classNamePrefix="select"
                      styles={{
                        control: (provided, state) => ({
                          ...provided,
                          minHeight: "4px",
                          borderRadius: "0.375rem", // Rounded border like select
                          borderColor: state.isFocused ? "#6B46C1" : "#D1D5DB", // Purple focus, gray default
                          boxShadow: state.isFocused
                            ? "0 0 0 1px #6B46C1"
                            : "none",
                          "&:hover": { borderColor: "#6B46C1" },
                        }),
                      }}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="border w-fit text-black py-1 px-4 rounded text-sm"
                  >
                    Edit
                  </button>
                  <button
                    type="submit"
                    className="border w-fit text-black py-1 px-4 rounded text-sm"
                  >
                    Save
                  </button>
                </div>
                <div className="grid grid-cols-5">
                  <div></div>
                  <div className="col-span-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-violet-500 border-gray-300 rounded focus:ring-violet-500"
                        checked={isProject}
                        onChange={() => setIsProject(!isProject)}
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Map at the stage
                      </span>
                    </label>
                  </div>
                </div>
                {isProject && (
                  <div className="border-t-2 py-5">
                    <div className="flex gap-3 items-center">
                      <h2 className="font-medium">Godrej Crest</h2>
                      <button>
                        <IoIosArrowDown />
                      </button>
                    </div>
                    <div className="mx-8">
                      <div className="flex gap-2 mt-3 mb-2 items-center mx-3">
                        <div className="border rounded-md px-5 py-1">
                          <h2>Stage 1</h2>
                        </div>
                        <div className="flex gap-2 h-fit">
                          <div className="border rounded-md px-3 bg-purple-700 text-white flex items-center">
                            <h2 className="text-sm mb-1">Inspector</h2>
                          </div>
                          <div className="border rounded-md px-3  bg-purple-700 text-white flex items-center">
                            <h2 className="text-sm mb-1">Repairer</h2>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mx-3">
                        <div className="border rounded-md px-5 py-1 whitespace-nowrap">
                          <h2>Stage 2</h2>
                        </div>
                        <select className="border rounded-md px-3 py-1 w-full">
                          <option>Select Role</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2 my-2 mx-3">
                        <div className="border rounded-md px-5 py-1 whitespace-nowrap">
                          <h2>Stage 3</h2>
                        </div>
                        <div className="relative w-64">
                          <AiOutlineSearch
                            className="absolute left-3 top-2.5 text-gray-500"
                            size={18}
                          />
                          <select className="w-full p-1 border pl-12 pr-4 rounded focus:outline-none focus:ring-1 focus:ring-purple-700">
                            <option value="">Select Role</option>
                            <option value="admin">Admin</option>
                            <option value="teacher">Teacher</option>
                            <option value="student">Student</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full bg-purple-700 text-white py-2 px-4 rounded hover:bg-purple-800 transition duration-200 my-3"
                >
                  Create
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MyComponent = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [zoneData, setZoneData] = useState({}); // Add this line to hold zone data

  return (
    <div>
      <ProgressBar currentStep={currentStep} setCurrentStep={setCurrentStep} />
      {currentStep === 0 && <ProjectGrid setCurrentStep={setCurrentStep} />}
      {currentStep === 1 && <StepTwoExact setCurrentStep={setCurrentStep} />}

      <TowerProvider>
        {currentStep === 2 && <TowerSetup setCurrentStep={setCurrentStep} />}
        {currentStep === 3 && (
          <FloorSetup
            setCurrentStep={setCurrentStep}
            setZoneData={setZoneData}
          />
        )}{" "}
        {/* Pass setZoneData */}
        {currentStep === 4 && (
          <ZoneConfiguration zoneData={zoneData} setZoneData={setZoneData} />
        )}{" "}
        {/* Ensure zoneData is passed */}
        {currentStep === 5 && <FlatTypeSetup setCurrentStep={setCurrentStep} />}
        {currentStep === 6 && (
          <FlatUnitConfiguration setCurrentStep={setCurrentStep} />
        )}
        {currentStep === 7 && (
          <TransferLevelSelection
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
          />
        )}
        {currentStep === 8 && (
          <Schedule currentStep={currentStep} setCurrentStep={setCurrentStep} />
        )}
        {currentStep === 9 && (
          <User currentStep={currentStep} setCurrentStep={setCurrentStep} />
        )}
      </TowerProvider>
    </div>
  );
};

export default MyComponent;

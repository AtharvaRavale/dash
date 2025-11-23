import React, { useState } from "react";
import { MdOutlineCancel } from "react-icons/md";
import { AiOutlineClose } from "react-icons/ai";
import axios from "axios";
import { useTheme } from "../ThemeContext";
import { showToast } from "../utils/toast";
import {
  createUserAccessRole,
  createOrganization,
  createProject,
} from "../api";
import { useSidebar } from "./SidebarContext";
import { projectInstance } from '../api/axiosInstance';

// ----------- PALETTE (the only colors used) -----------
// const SIDEBAR_WIDTH = 240;
const ORANGE = "#ffbe63";
const BG_OFFWHITE = "#fcfaf7";
function usePalette(theme) {
  return {
    ORANGE,
    BG_OFFWHITE,
    bgColor: theme === "dark" ? "#191922" : BG_OFFWHITE,
    cardColor: theme === "dark" ? "#23232c" : "#fff",
    borderColor: ORANGE,
    textColor: theme === "dark" ? "#fff" : "#222",
    iconColor: ORANGE,
  };
}

// const [projectId, setProjectId] = useState<number | null>(null);

// const [flags, setFlags] = useState({
//   skipSupervisor: false,
//   checklistRepetition: false,
//   allFlags: false,
// });


// ----- STEP 1: USER -----
function UserAndRoleManagement({ onUserCreated, palette }) {
  const [isAdd, setAdd] = useState(false);
  const [form, setForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const isFormValid =
    form.username && form.firstName && form.lastName && form.email && form.password;

  const handleClose = () => {
    setAdd(false);
    setForm({
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      mobile: "",
      password: "",
    });
    setSubmitting(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      alert("Please fill all required fields!");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        user: {
          username: form.username,
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email,
          phone_number: form.mobile || "",
          password: form.password,
          is_client: true,
          is_manager: false,
          has_access: true,
          org: null,
          company: null,
          entity: null,
        },
        access: {},
        roles: [],
      };
      const response = await createUserAccessRole(payload);
      if (response.status === 201 && response.data.user && response.data.user.id) {
        alert("Client user created successfully!");
        onUserCreated(
          response.data.user.id,
          `${response.data.user.first_name || ""} ${response.data.user.last_name || ""}`.trim() ||
            response.data.user.username
        );
        handleClose();
      } else {
        alert("Failed to create client user!");
      }
    } catch (error) {
      if (error.response && error.response.data) {
        if (error.response.data.user && error.response.data.user.username) {
          alert("Username already exists.");
          setSubmitting(false);
          return;
        }
        if (error.response.data.user && error.response.data.user.email) {
          alert("Email already exists.");
          setSubmitting(false);
          return;
        }
      }
      alert("Error creating client user. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <div
      className="p-6 max-w-7xl mx-auto rounded shadow-lg"
      style={{
        background: palette.cardColor,
        color: palette.textColor,
        border: `1.5px solid ${palette.borderColor}`,
      }}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4" style={{ color: palette.iconColor }}>
          USERS
        </h1>
        <div className="flex gap-3 mb-4">
          <button
            style={{
              background: palette.iconColor,
              color: "#fff",
              borderRadius: 6,
              padding: "0.5rem 1.1rem",
              fontWeight: 600,
            }}
            onClick={() => setAdd(true)}
          >
            <span style={{ fontSize: 18, fontWeight: 700 }}>+</span> Add Client User
          </button>
        </div>
      </div>
      {isAdd && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div
            className="max-h-[75vh] w-[95vw] sm:w-[400px] rounded-lg shadow-lg border"
            style={{
              background: palette.cardColor,
              border: `2.5px solid ${palette.borderColor}`,
              color: palette.textColor,
            }}
          >
            <div
              className="flex items-center justify-between mb-6 p-4 border-b"
              style={{ borderColor: palette.borderColor }}
            >
              <h1 className="text-lg font-bold" style={{ color: palette.iconColor }}>
                CREATE CLIENT USER
              </h1>
              <button
                onClick={handleClose}
                style={{
                  color: palette.iconColor,
                  background: "none",
                  border: "none",
                }}
                disabled={submitting}
              >
                <MdOutlineCancel size={28} />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[55vh] px-5 pb-5">
              <form className="space-y-3" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Username<span style={{ color: palette.iconColor }}>*</span>
                    </label>
                    <input
                      name="username"
                      type="text"
                      className="w-full p-2 border rounded"
                      style={{
                        borderColor: palette.borderColor,
                        background: palette.bgColor,
                        color: palette.textColor,
                      }}
                      value={form.username}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      First Name<span style={{ color: palette.iconColor }}>*</span>
                    </label>
                    <input
                      name="firstName"
                      type="text"
                      className="w-full p-2 border rounded"
                      style={{
                        borderColor: palette.borderColor,
                        background: palette.bgColor,
                        color: palette.textColor,
                      }}
                      value={form.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Last Name<span style={{ color: palette.iconColor }}>*</span>
                    </label>
                    <input
                      name="lastName"
                      type="text"
                      className="w-full p-2 border rounded"
                      style={{
                        borderColor: palette.borderColor,
                        background: palette.bgColor,
                        color: palette.textColor,
                      }}
                      value={form.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email<span style={{ color: palette.iconColor }}>*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    className="w-full p-2 border rounded"
                    style={{
                      borderColor: palette.borderColor,
                      background: palette.bgColor,
                      color: palette.textColor,
                    }}
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Mobile</label>
                    <input
                      name="mobile"
                      type="tel"
                      className="w-full p-2 border rounded"
                      style={{
                        borderColor: palette.borderColor,
                        background: palette.bgColor,
                        color: palette.textColor,
                      }}
                      value={form.mobile}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Password<span style={{ color: palette.iconColor }}>*</span>
                    </label>
                    <input
                      name="password"
                      type="password"
                      className="w-full p-2 border rounded"
                      style={{
                        borderColor: palette.borderColor,
                        background: palette.bgColor,
                        color: palette.textColor,
                      }}
                      value={form.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full mt-3"
                  style={{
                    background: palette.iconColor,
                    color: "#fff",
                    padding: "0.7rem 0",
                    borderRadius: 8,
                    fontWeight: 700,
                  }}
                  disabled={submitting || !isFormValid}
                >
                  {submitting ? "Creating..." : "Create"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ----- STEP 2: ORG -----
function OrganizationSetup({ userIdToAssign, onAssigned, palette }) {
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    if (!orgName.trim() || !userIdToAssign) {
      alert("User must be created first and org name is required.");
      return;
    }
    setLoading(true);
    try {
      const orgResp = await createOrganization({
        organization_name: orgName,
        created_by: userIdToAssign,
      });
      alert("Organization created and assigned to user!");
      setOrgName("");
      if (onAssigned) onAssigned(orgResp.data.id, orgResp.data.organization_name);
    } catch {
      alert("Error creating organization.");
    }
    setLoading(false);
  };

  return (
    <div
      className="p-8 rounded-xl shadow-lg"
      style={{
        background: palette.cardColor,
        color: palette.textColor,
        border: `1.5px solid ${palette.borderColor}`,
      }}
    >
      <h3 className="text-xl font-semibold mb-4" style={{ color: palette.iconColor }}>
        Organization Setup
      </h3>
      <form onSubmit={handleCreateOrg} className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Organization name"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          className="border rounded px-3 py-2 flex-1"
          style={{
            borderColor: palette.borderColor,
            background: palette.bgColor,
            color: palette.textColor,
          }}
          required
        />
        <button
          type="submit"
          style={{
            background: palette.iconColor,
            color: "#fff",
            borderRadius: 7,
            fontWeight: 600,
            padding: "0.55rem 1.4rem",
          }}
          disabled={loading || !userIdToAssign}
        >
          {loading ? "Adding..." : "Add & Assign to User"}
        </button>
      </form>
      {!userIdToAssign && (
        <div className="text-red-500 mt-2">
          <b>Please create a user first.</b>
        </div>
      )}
    </div>
  );
}

// ----- STEP 3: PROJECT -----
function ProjectSetupStep({
  orgId,
  orgName,
  userId,
  clientName,
  onProjectCreated,
  onClose,
  palette,
}) {
  const [projectName, setProjectName] = useState("");
  const [useDefaultImage, setUseDefaultImage] = useState(true);
  const [image, setImage] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setIsSaved(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectName) {
      showToast("Project name is required", "info");
      return;
    }
    if (!orgId || !userId) {
      showToast("Organization and client are required", "error");
      return;
    }
    const formData = new FormData();
    formData.append("name", projectName);
    formData.append("created_by", userId);
    formData.append("organization_id", orgId);
    if (!useDefaultImage && image) {
      formData.append("image", image);
    }
    try {
      const res = await createProject(formData);
      showToast("Project created!", "success");
      if (onProjectCreated) onProjectCreated(res.data.id || res.data.data?.id);
      setIsSaved(true);
    } catch (error) {
      showToast(
        error.response?.data?.message ||
          error.response?.data?.detail ||
          JSON.stringify(error.response?.data) ||
          error.message ||
          "Error creating project",
        "error"
      );
    }
  };

  return (
    <div
      className="p-6 rounded-xl shadow-2xl w-full max-w-2xl relative"
      style={{
        background: palette.cardColor,
        color: palette.textColor,
        border: `1.5px solid ${palette.borderColor}`,
      }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-lg"
        style={{
          color: palette.iconColor,
          background: "none",
          border: "none",
        }}
      >
        <AiOutlineClose className="text-xl" />
      </button>
      <h2 className="text-2xl font-bold mb-6" style={{ color: palette.iconColor }}>
        Create Project
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Organization
            </label>
            <input
              type="text"
              value={orgName || ""}
              disabled
              className="w-full rounded-lg px-4 py-3 border bg-gray-100 cursor-not-allowed"
              style={{
                color: palette.textColor,
                borderColor: palette.borderColor,
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Client User
            </label>
            <input
              type="text"
              value={clientName || ""}
              disabled
              className="w-full rounded-lg px-4 py-3 border bg-gray-100 cursor-not-allowed"
              style={{
                color: palette.textColor,
                borderColor: palette.borderColor,
              }}
            />
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Project Name <span style={{ color: palette.iconColor }}>*</span>
          </label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full rounded-lg px-4 py-3 border"
            style={{
              color: palette.textColor,
              borderColor: palette.borderColor,
              background: palette.bgColor,
            }}
            placeholder="Enter project name"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3">
            Project Image
          </label>
          <div className="space-y-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                checked={useDefaultImage}
                onChange={() => setUseDefaultImage(true)}
                className="mr-2"
              />
              <span>Use Default Image</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                checked={!useDefaultImage}
                onChange={() => setUseDefaultImage(false)}
                className="mr-2"
              />
              <span>Upload Custom Image</span>
            </label>
          </div>
          {!useDefaultImage && (
            <input
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="mt-3 w-full text-sm"
            />
          )}
          {image && !useDefaultImage && (
            <img
              src={URL.createObjectURL(image)}
              alt="Custom Project"
              className="mt-4 w-full max-h-48 object-cover rounded-lg border"
              style={{
                borderColor: palette.borderColor,
              }}
            />
          )}
        </div>
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-lg border"
            style={{
              background: "none",
              color: palette.iconColor,
              borderColor: palette.borderColor,
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 rounded-lg"
            style={{
              background: palette.iconColor,
              color: "#fff",
              fontWeight: 700,
            }}
            disabled={!projectName}
          >
            Save Project
          </button>
        </div>
      </form>
    </div>
  );
}

// ----- STEP 4: PURPOSE MANAGEMENT -----
function PurposeManagementStep({ userId, clientName, palette }) {
  const [purposes, setPurposes] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [selected, setSelected] = useState([]);
  const [newPurpose, setNewPurpose] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [removing, setRemoving] = useState({});
  const [error, setError] = useState("");

  // const API_URL = "https://konstruct.world/projects/all-purposes/";
  const API_URL = "/all-purposes/";
  // const CLIENT_PURPOSE_URL = "https://konstruct.world/projects/client-purpose/";
  const CLIENT_PURPOSE_URL = "/client-purpose/";
  // const CLIENT_PURPOSE_DETAIL_URL = (userId) =>
  //   `https://konstruct.world/projects/client-purpose/${userId}/`;
  const CLIENT_PURPOSE_DETAIL_URL = (userId) => `/client-purpose/${userId}/`;
  // const CLIENT_PURPOSE_SOFT_DELETE_URL = (assignmentId) =>
  //   `https://konstruct.world/projects/client-purpose/${assignmentId}/soft-delete/`;
  const CLIENT_PURPOSE_SOFT_DELETE_URL = (assignmentId) => `/client-purpose/${assignmentId}/soft-delete/`;

  const fetchAll = async () => {
    try {
      const token = localStorage.getItem("ACCESS_TOKEN");
      const all = await projectInstance.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPurposes(all.data || []);
      if (userId) {
        const res2 = await projectInstance.get(CLIENT_PURPOSE_DETAIL_URL(userId), {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAssigned(res2.data || []);
      }
    } catch {
      setError("Could not load purposes or mapping.");
    }
  };

  React.useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
  }, [userId]);

  const handleAddPurpose = async (e) => {
    e.preventDefault();
    if (!newPurpose.trim()) return;
    setAddLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("ACCESS_TOKEN");
      await projectInstance.post(
        API_URL,
        { name: newPurpose },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewPurpose("");
      showToast("Purpose added!", "success");
      fetchAll();
    } catch (e) {
      setError(
        e?.response?.data?.name?.[0] ||
          e?.response?.data?.detail ||
          "Failed to add purpose."
      );
    }
    setAddLoading(false);
  };

  const handleAssign = async () => {
    if (!selected.length) return;
    setMapLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("ACCESS_TOKEN");
      await Promise.all(
        selected.map((purposeId) =>
          projectInstance.post(
            CLIENT_PURPOSE_URL,
            { client_id: userId, purpose_id: purposeId },
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );
      setSelected([]);
      showToast("Purpose(s) assigned!", "success");
      fetchAll();
    } catch {
      setError("Assignment failed.");
    }
    setMapLoading(false);
  };

  const handleRemove = async (assignmentId) => {
    if (!window.confirm("Remove this purpose?")) return;
    setRemoving((r) => ({ ...r, [assignmentId]: true }));
    try {
      const token = localStorage.getItem("ACCESS_TOKEN");
      await projectInstance.patch(
        CLIENT_PURPOSE_SOFT_DELETE_URL(assignmentId),
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAll();
    } catch {
      showToast("Remove failed.", "error");
    }
    setRemoving((r) => ({ ...r, [assignmentId]: false }));
  };

  return (
    <div
      className="max-w-xl mx-auto border rounded-2xl shadow-xl p-8"
      style={{
        background: palette.cardColor,
        color: palette.textColor,
        border: `1.5px solid ${palette.borderColor}`,
      }}
    >
      <h2 className="text-2xl font-bold mb-4" style={{ color: palette.iconColor }}>
        Purpose Management for{" "}
        <span style={{ color: palette.iconColor }}>{clientName}</span>
      </h2>
      <form className="flex gap-2 mb-6" onSubmit={handleAddPurpose}>
        <input
          type="text"
          value={newPurpose}
          onChange={(e) => setNewPurpose(e.target.value)}
          placeholder="Add new purpose"
          className="flex-1 px-3 py-2 rounded border"
          style={{
            borderColor: palette.borderColor,
            background: palette.bgColor,
            color: palette.textColor,
          }}
          disabled={addLoading}
        />
        <button
          type="submit"
          className="px-4 py-2 rounded"
          style={{
            background: palette.iconColor,
            color: "#fff",
            fontWeight: 600,
          }}
          disabled={addLoading || !newPurpose.trim()}
        >
          {addLoading ? "Adding..." : "Add"}
        </button>
      </form>
      <div className="mb-6">
        <label className="block font-medium mb-2">Assign to user:</label>
        <select
          multiple
          className="w-full p-2 rounded border"
          value={selected}
          onChange={(e) =>
            setSelected(Array.from(e.target.selectedOptions, (o) => Number(o.value)))
          }
          disabled={mapLoading || purposes.length === 0}
          style={{
            minHeight: 90,
            borderColor: palette.borderColor,
            background: palette.bgColor,
            color: palette.textColor,
          }}
        >
          {purposes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <button
          className="mt-3 w-full py-2 rounded"
          style={{
            background: palette.iconColor,
            color: "#fff",
            fontWeight: 600,
          }}
          onClick={handleAssign}
          disabled={mapLoading || !selected.length}
        >
          {mapLoading ? "Assigning..." : "Assign selected"}
        </button>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Assigned Purposes:</h3>
        <ul className="space-y-2">
          {assigned.length === 0 ? (
            <li className="text-gray-500 text-sm">No purposes assigned</li>
          ) : (
            assigned.map((ap) => (
              <li
                key={ap.id}
                className="flex items-center justify-between border-b py-2"
                style={{
                  borderColor: palette.borderColor,
                }}
              >
                <span>{ap.purpose_name || ap.name}</span>
                <button
                  onClick={() => handleRemove(ap.id)}
                  className="px-2 py-1 rounded text-xs ml-3"
                  style={{
                    background: palette.iconColor,
                    color: "#fff",
                  }}
                  disabled={removing[ap.id]}
                >
                  {removing[ap.id] ? "Removing..." : "Remove"}
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
      {error && (
        <div
          className="mt-4 text-sm bg-white border rounded p-2"
          style={{
            color: "red",
            borderColor: palette.borderColor,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}

// ------ MAIN WIZARD ------
const steps = [
  "User & Role",
  "Organization Setup",
  "Project Setup",
  "Purpose Management",
];

const UserManagementSetup = () => {
  const { theme } = useTheme();
  const palette = usePalette(theme);

  const { sidebarOpen } = useSidebar();

  const [activeStep, setActiveStep] = useState(0);
  const [createdUserId, setCreatedUserId] = useState(null);
  const [createdUserName, setCreatedUserName] = useState("");
  const [assignedOrgId, setAssignedOrgId] = useState(null);
  const [assignedOrgName, setAssignedOrgName] = useState("");
  const [createdProjectId, setCreatedProjectId] = useState(null);

  // Handlers for wizard step transitions
  const handleUserCreated = (userId, userName) => {
    setCreatedUserId(userId);
    setCreatedUserName(userName);
    setActiveStep(1);
  };

  const handleOrgAssigned = (orgId, orgName) => {
    setAssignedOrgId(orgId);
    setAssignedOrgName(orgName);
    setActiveStep(2);
  };

  const handleProjectCreated = (projectId) => {
    setCreatedProjectId(projectId);
    setActiveStep(3);
  };

  function StepContent({ step }) {
    if (step === 0)
      return <UserAndRoleManagement onUserCreated={handleUserCreated} palette={palette} />;
    if (step === 1)
      return (
        <OrganizationSetup
          userIdToAssign={createdUserId}
          onAssigned={handleOrgAssigned}
          palette={palette}
        />
      );
    if (step === 2)
      return (
        <ProjectSetupStep
          orgId={assignedOrgId}
          orgName={assignedOrgName}
          userId={createdUserId}
          clientName={createdUserName}
          onProjectCreated={handleProjectCreated}
          onClose={() => setActiveStep(1)}
          palette={palette}
        />
      );
    if (step === 3)
      return (
        <PurposeManagementStep
          userId={createdUserId}
          clientName={createdUserName}
          palette={palette}
        />
      );
    return (
      <div className="p-8">
        <h3 className="text-xl font-semibold mb-2">{steps[step]}</h3>
        <p>
          Setup content for <b>{steps[step]}</b> goes here.
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center"
      // style={{
      //   background: palette.bgColor,
      //   marginLeft: sidebarOpen ? SIDEBAR_WIDTH : 0,
      //   transition: "margin-left 0.35s cubic-bezier(.6,-0.17,.22,1.08)",
      //   minHeight: "100vh",
      // }}
    >
      <h2
        className="text-2xl font-bold mb-8"
        style={{ color: palette.iconColor, marginTop: "2.5rem" }}
      >
        User Management Setup
      </h2>

      <div className="flex gap-3 mb-12 flex-wrap justify-center max-w-full">
        {steps.map((label, idx) => (
          <button
            key={label}
            onClick={() => setActiveStep(idx)}
            disabled={
              (idx === 1 && !createdUserId) ||
              (idx === 2 && !assignedOrgId) ||
              (idx === 3 && !createdProjectId)
            }
            className={`flex flex-col items-center px-3 py-2 rounded-lg border transition-all`}
            style={{
              background:
                activeStep === idx ? palette.bgColor : palette.cardColor,
              color: activeStep === idx ? palette.iconColor : palette.textColor,
              borderColor: palette.borderColor,
              fontWeight: activeStep === idx ? 700 : 400,
            }}
          >
            <span>{label}</span>
            {activeStep === idx && (
              <div
                className="w-3 h-1 mt-1 rounded-full"
                style={{
                  background: palette.iconColor,
                }}
              />
            )}
          </button>
        ))}
      </div>

      <div
        className="w-full max-w-7xl rounded-xl shadow-lg mb-8"
        style={{
          background: palette.cardColor,
          color: palette.textColor,
          border: `1.5px solid ${palette.borderColor}`,
        }}
      >
        <StepContent step={activeStep} />
      </div>
    </div>
  );
};

export default UserManagementSetup;






// import React, { useState } from "react";
// import { MdOutlineCancel } from "react-icons/md";
// import { AiOutlineClose } from "react-icons/ai";
// import { useTheme } from "../ThemeContext";
// import { showToast } from "../utils/toast";
// import {
//   createUserAccessRole,
//   createOrganization,
//   createProject,
// } from "../api";
// import { useSidebar } from "./SidebarContext";
// import { projectInstance } from "../api/axiosInstance";

// // ----------- PALETTE (the only colors used) -----------
// const ORANGE = "#ffbe63";
// const BG_OFFWHITE = "#fcfaf7";
// function usePalette(theme) {
//   return {
//     ORANGE,
//     BG_OFFWHITE,
//     bgColor: theme === "dark" ? "#191922" : BG_OFFWHITE,
//     cardColor: theme === "dark" ? "#23232c" : "#fff",
//     borderColor: ORANGE,
//     textColor: theme === "dark" ? "#fff" : "#222",
//     iconColor: ORANGE,
//   };
// }

// // ----- STEP 1: USER -----
// function UserAndRoleManagement({ onUserCreated, palette }) {
//   const [isAdd, setAdd] = useState(false);
//   const [form, setForm] = useState({
//     username: "",
//     firstName: "",
//     lastName: "",
//     email: "",
//     mobile: "",
//     password: "",
//   });
//   const [submitting, setSubmitting] = useState(false);

//   const isFormValid =
//     form.username && form.firstName && form.lastName && form.email && form.password;

//   const handleClose = () => {
//     setAdd(false);
//     setForm({
//       username: "",
//       firstName: "",
//       lastName: "",
//       email: "",
//       mobile: "",
//       password: "",
//     });
//     setSubmitting(false);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!isFormValid) {
//       alert("Please fill all required fields!");
//       return;
//     }
//     setSubmitting(true);
//     try {
//       const payload = {
//         user: {
//           username: form.username,
//           first_name: form.firstName,
//           last_name: form.lastName,
//           email: form.email,
//           phone_number: form.mobile || "",
//           password: form.password,
//           is_client: true,
//           is_manager: false,
//           has_access: true,
//           org: null,
//           company: null,
//           entity: null,
//         },
//         access: {},
//         roles: [],
//       };
//       const response = await createUserAccessRole(payload);
//       if (response.status === 201 && response.data.user && response.data.user.id) {
//         alert("Client user created successfully!");
//         onUserCreated(
//           response.data.user.id,
//           `${response.data.user.first_name || ""} ${response.data.user.last_name || ""}`.trim() ||
//             response.data.user.username
//         );
//         handleClose();
//       } else {
//         alert("Failed to create client user!");
//       }
//     } catch (error) {
//       if (error.response && error.response.data) {
//         if (error.response.data.user && error.response.data.user.username) {
//           alert("Username already exists.");
//           setSubmitting(false);
//           return;
//         }
//         if (error.response.data.user && error.response.data.user.email) {
//           alert("Email already exists.");
//           setSubmitting(false);
//           return;
//         }
//       }
//       alert("Error creating client user. Please try again.");
//     }
//     setSubmitting(false);
//   };

//   return (
//     <div
//       className="p-6 max-w-7xl mx-auto rounded shadow-lg"
//       style={{
//         background: palette.cardColor,
//         color: palette.textColor,
//         border: `1.5px solid ${palette.borderColor}`,
//       }}
//     >
//       <div className="mb-6">
//         <h1 className="text-2xl font-bold mb-4" style={{ color: palette.iconColor }}>
//           USERS
//         </h1>
//         <div className="flex gap-3 mb-4">
//           <button
//             style={{
//               background: palette.iconColor,
//               color: "#fff",
//               borderRadius: 6,
//               padding: "0.5rem 1.1rem",
//               fontWeight: 600,
//             }}
//             onClick={() => setAdd(true)}
//           >
//             <span style={{ fontSize: 18, fontWeight: 700 }}>+</span> Add Client User
//           </button>
//         </div>
//       </div>
//       {isAdd && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
//           <div
//             className="max-h-[75vh] w-[95vw] sm:w-[400px] rounded-lg shadow-lg border"
//             style={{
//               background: palette.cardColor,
//               border: `2.5px solid ${palette.borderColor}`,
//               color: palette.textColor,
//             }}
//           >
//             <div
//               className="flex items-center justify-between mb-6 p-4 border-b"
//               style={{ borderColor: palette.borderColor }}
//             >
//               <h1 className="text-lg font-bold" style={{ color: palette.iconColor }}>
//                 CREATE CLIENT USER
//               </h1>
//               <button
//                 onClick={handleClose}
//                 style={{
//                   color: palette.iconColor,
//                   background: "none",
//                   border: "none",
//                 }}
//                 disabled={submitting}
//               >
//                 <MdOutlineCancel size={28} />
//               </button>
//             </div>
//             <div className="overflow-y-auto max-h-[55vh] px-5 pb-5">
//               <form className="space-y-3" onSubmit={handleSubmit}>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium mb-1">
//                       Username<span style={{ color: palette.iconColor }}>*</span>
//                     </label>
//                     <input
//                       name="username"
//                       type="text"
//                       className="w-full p-2 border rounded"
//                       style={{
//                         borderColor: palette.borderColor,
//                         background: palette.bgColor,
//                         color: palette.textColor,
//                       }}
//                       value={form.username}
//                       onChange={handleChange}
//                       required
//                     />
//                   </div>
//                   <div></div>
//                 </div>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium mb-1">
//                       First Name<span style={{ color: palette.iconColor }}>*</span>
//                     </label>
//                     <input
//                       name="firstName"
//                       type="text"
//                       className="w-full p-2 border rounded"
//                       style={{
//                         borderColor: palette.borderColor,
//                         background: palette.bgColor,
//                         color: palette.textColor,
//                       }}
//                       value={form.firstName}
//                       onChange={handleChange}
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium mb-1">
//                       Last Name<span style={{ color: palette.iconColor }}>*</span>
//                     </label>
//                     <input
//                       name="lastName"
//                       type="text"
//                       className="w-full p-2 border rounded"
//                       style={{
//                         borderColor: palette.borderColor,
//                         background: palette.bgColor,
//                         color: palette.textColor,
//                       }}
//                       value={form.lastName}
//                       onChange={handleChange}
//                       required
//                     />
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium mb-1">
//                     Email<span style={{ color: palette.iconColor }}>*</span>
//                   </label>
//                   <input
//                     name="email"
//                     type="email"
//                     className="w-full p-2 border rounded"
//                     style={{
//                       borderColor: palette.borderColor,
//                       background: palette.bgColor,
//                       color: palette.textColor,
//                     }}
//                     value={form.email}
//                     onChange={handleChange}
//                     required
//                   />
//                 </div>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium mb-1">Mobile</label>
//                     <input
//                       name="mobile"
//                       type="tel"
//                       className="w-full p-2 border rounded"
//                       style={{
//                         borderColor: palette.borderColor,
//                         background: palette.bgColor,
//                         color: palette.textColor,
//                       }}
//                       value={form.mobile}
//                       onChange={handleChange}
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium mb-1">
//                       Password<span style={{ color: palette.iconColor }}>*</span>
//                     </label>
//                     <input
//                       name="password"
//                       type="password"
//                       className="w-full p-2 border rounded"
//                       style={{
//                         borderColor: palette.borderColor,
//                         background: palette.bgColor,
//                         color: palette.textColor,
//                       }}
//                       value={form.password}
//                       onChange={handleChange}
//                       required
//                     />
//                   </div>
//                 </div>
//                 <button
//                   type="submit"
//                   className="w-full mt-3"
//                   style={{
//                     background: palette.iconColor,
//                     color: "#fff",
//                     padding: "0.7rem 0",
//                     borderRadius: 8,
//                     fontWeight: 700,
//                   }}
//                   disabled={submitting || !isFormValid}
//                 >
//                   {submitting ? "Creating..." : "Create"}
//                 </button>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // ----- STEP 2: ORG -----
// function OrganizationSetup({ userIdToAssign, onAssigned, palette }) {
//   const [orgName, setOrgName] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleCreateOrg = async (e) => {
//     e.preventDefault();
//     if (!orgName.trim() || !userIdToAssign) {
//       alert("User must be created first and org name is required.");
//       return;
//     }
//     setLoading(true);
//     try {
//       const orgResp = await createOrganization({
//         organization_name: orgName,
//         created_by: userIdToAssign,
//       });
//       alert("Organization created and assigned to user!");
//       setOrgName("");
//       if (onAssigned) onAssigned(orgResp.data.id, orgResp.data.organization_name);
//     } catch {
//       alert("Error creating organization.");
//     }
//     setLoading(false);
//   };

//   return (
//     <div
//       className="p-8 rounded-xl shadow-lg"
//       style={{
//         background: palette.cardColor,
//         color: palette.textColor,
//         border: `1.5px solid ${palette.borderColor}`,
//       }}
//     >
//       <h3 className="text-xl font-semibold mb-4" style={{ color: palette.iconColor }}>
//         Organization Setup
//       </h3>
//       <form onSubmit={handleCreateOrg} className="flex items-center gap-2">
//         <input
//           type="text"
//           placeholder="Organization name"
//           value={orgName}
//           onChange={(e) => setOrgName(e.target.value)}
//           className="border rounded px-3 py-2 flex-1"
//           style={{
//             borderColor: palette.borderColor,
//             background: palette.bgColor,
//             color: palette.textColor,
//           }}
//           required
//         />
//         <button
//           type="submit"
//           style={{
//             background: palette.iconColor,
//             color: "#fff",
//             borderRadius: 7,
//             fontWeight: 600,
//             padding: "0.55rem 1.4rem",
//           }}
//           disabled={loading || !userIdToAssign}
//         >
//           {loading ? "Adding..." : "Add & Assign to User"}
//         </button>
//       </form>
//       {!userIdToAssign && (
//         <div className="text-red-500 mt-2">
//           <b>Please create a user first.</b>
//         </div>
//       )}
//     </div>
//   );
// }


// // ----- STEP 3: PROJECT -----
// function ProjectSetupStep({
//   orgId,
//   orgName,
//   userId,
//   clientName,
//   onProjectCreated,
//   onClose,
//   palette,
// }) {
//   const [projectName, setProjectName] = useState("");
//   const [useDefaultImage, setUseDefaultImage] = useState(true);
//   const [image, setImage] = useState("");
//   const [isSaved, setIsSaved] = useState(false);

//   // NEW: for buttons
//   const [projectId, setProjectId] = useState(null);
//   const [flags, setFlags] = useState({
//     skipSupervisor: false,
//     checklistRepetition: false,
//     allFlags: false,
//   });

//   const handleChange = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       setImage(file);
//       setIsSaved(true);
//     }
//   };

//   // NEW: fetch flags (fixed endpoint path)
//   const fetchProjectFlags = async (id) => {
//     try {
//       const token = localStorage.getItem("ACCESS_TOKEN");
//       const res = await projectInstance.get(`/${id}/`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setFlags({
//         skipSupervisor: res.data?.skip_supervisory || false,
//         checklistRepetition: res.data?.checklist_repetition || false,
//         allFlags: res.data?.all_flags || false,
//       });
//     } catch (err) {
//       console.error("Could not fetch project flags", err);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!projectName) {
//       showToast("Project name is required", "info");
//       return;
//     }
//     if (!orgId || !userId) {
//       showToast("Organization and client are required", "error");
//       return;
//     }
//     const formData = new FormData();
//     formData.append("name", projectName);
//     formData.append("created_by", userId);
//     formData.append("organization_id", orgId);
//     if (!useDefaultImage && image) {
//       formData.append("image", image);
//     }

//     try {
//       const res = await createProject(formData);
//       // robust id extraction
//       const newId =
//         res?.data?.id ??
//         res?.data?.project_id ??
//         res?.data?.data?.id ??
//         res?.data?.data?.project_id ??
//         (Array.isArray(res?.data) ? res.data[0]?.id : null);

//       if (!newId) {
//         showToast("Project created but no ID returned", "error");
//         return;
//       }

//       setProjectId(newId);
//       setIsSaved(true);
//       showToast("Project created!", "success");
//       fetchProjectFlags(newId);
//       if (onProjectCreated) onProjectCreated(newId);
//     } catch (error) {
//       console.error("Error creating project:", error?.response?.data || error?.message || error);
//       showToast(
//         error?.response?.data?.message ||
//           error?.response?.data?.detail ||
//           JSON.stringify(error?.response?.data) ||
//           error?.message ||
//           "Error creating project",
//         "error"
//       );
//     }
//   };

//   // NEW: toggle endpoints (use base .../projects as baseURL, so no extra /projects here)
//   const toggleFlag = async (flag) => {
//     if (!projectId) return;

//     let endpoint = "";
//     if (flag === "skipSupervisor") {
//       endpoint = flags.skipSupervisor
//         ? `/${projectId}/disable-skip-supervisory/`
//         : `/${projectId}/enable-skip-supervisory/`;
//     } else if (flag === "checklistRepetition") {
//       endpoint = flags.checklistRepetition
//         ? `/${projectId}/disable-checklist-repoetory/`
//         : `/${projectId}/enable-checklist-repoetory/`;
//     } else if (flag === "allFlags") {
//       endpoint = flags.allFlags
//         ? `/${projectId}/disable-all-flags/`
//         : `/${projectId}/enable-all-flags/`;
//     }

//     try {
//       const token = localStorage.getItem("ACCESS_TOKEN");
//       await projectInstance.post(endpoint, {}, { headers: { Authorization: `Bearer ${token}` } });
//       showToast("Operation successful!", "success");
//       setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }));
//     } catch (err) {
//       console.error("Toggle flag failed:", err?.response?.data || err?.message || err);
//       showToast("Operation failed", "error");
//     }
//   };

//   return (
//     <div
//       className="p-6 rounded-xl shadow-2xl w-full max-w-2xl relative"
//       style={{
//         background: palette.cardColor,
//         color: palette.textColor,
//         border: `1.5px solid ${palette.borderColor}`,
//       }}
//     >
//       <button
//         onClick={onClose}
//         className="absolute top-4 right-4 p-2 rounded-lg"
//         style={{
//           color: palette.iconColor,
//           background: "none",
//           border: "none",
//         }}
//       >
//         <AiOutlineClose className="text-xl" />
//       </button>
//       <h2 className="text-2xl font-bold mb-6" style={{ color: palette.iconColor }}>
//         Create Project
//       </h2>
//       <form onSubmit={handleSubmit}>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
//           <div>
//             <label className="block text-sm font-medium mb-2">
//               Organization
//             </label>
//             <input
//               type="text"
//               value={orgName || ""}
//               disabled
//               className="w-full rounded-lg px-4 py-3 border bg-gray-100 cursor-not-allowed"
//               style={{
//                 color: palette.textColor,
//                 borderColor: palette.borderColor,
//               }}
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium mb-2">
//               Client User
//             </label>
//             <input
//               type="text"
//               value={clientName || ""}
//               disabled
//               className="w-full rounded-lg px-4 py-3 border bg-gray-100 cursor-not-allowed"
//               style={{
//                 color: palette.textColor,
//                 borderColor: palette.borderColor,
//               }}
//             />
//           </div>
//         </div>
//         <div className="mb-6">
//           <label className="block text-sm font-medium mb-2">
//             Project Name <span style={{ color: palette.iconColor }}>*</span>
//           </label>
//           <input
//             type="text"
//             value={projectName}
//             onChange={(e) => setProjectName(e.target.value)}
//             className="w-full rounded-lg px-4 py-3 border"
//             style={{
//               color: palette.textColor,
//               borderColor: palette.borderColor,
//               background: palette.bgColor,
//             }}
//             placeholder="Enter project name"
//             required
//           />
//         </div>
//         <div className="mb-6">
//           <label className="block text-sm font-medium mb-3">
//             Project Image
//           </label>
//           <div className="space-y-3">
//             <label className="flex items-center cursor-pointer">
//               <input
//                 type="radio"
//                 checked={useDefaultImage}
//                 onChange={() => setUseDefaultImage(true)}
//                 className="mr-2"
//               />
//               <span>Use Default Image</span>
//             </label>
//             <label className="flex items-center cursor-pointer">
//               <input
//                 type="radio"
//                 checked={!useDefaultImage}
//                 onChange={() => setUseDefaultImage(false)}
//                 className="mr-2"
//               />
//               <span>Upload Custom Image</span>
//             </label>
//           </div>
//           {!useDefaultImage && (
//             <input
//               type="file"
//               accept="image/*"
//               onChange={handleChange}
//               className="mt-3 w-full text-sm"
//             />
//           )}
//           {image && !useDefaultImage && (
//             <img
//               src={URL.createObjectURL(image)}
//               alt="Custom Project"
//               className="mt-4 w-full max-h-48 object-cover rounded-lg border"
//               style={{
//                 borderColor: palette.borderColor,
//               }}
//             />
//           )}
//         </div>
//         <div className="flex gap-4 justify-end">
//           <button
//             type="button"
//             onClick={onClose}
//             className="px-6 py-3 rounded-lg border"
//             style={{
//               background: "none",
//               color: palette.iconColor,
//               borderColor: palette.borderColor,
//             }}
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             className="px-6 py-3 rounded-lg"
//             style={{
//               background: palette.iconColor,
//               color: "#fff",
//               fontWeight: 700,
//             }}
//             disabled={!projectName}
//           >
//             Save Project
//           </button>
//         </div>
//       </form>

//       {/* Buttons appear only after project is saved and ID is known */}
//       {isSaved && projectId && (
//         <div className="flex flex-col gap-3 mt-6">
//           <button
//             type="button"
//             className="px-6 py-3 rounded-lg"
//             style={{ background: palette.iconColor, color: "#fff", fontWeight: 700 }}
//             onClick={() => toggleFlag("skipSupervisor")}
//           >
//             {flags.skipSupervisor ? "Disable Skip Supervisor" : "Enable Skip Supervisor"}
//           </button>
//           <button
//             type="button"
//             className="px-6 py-3 rounded-lg"
//             style={{ background: palette.iconColor, color: "#fff", fontWeight: 700 }}
//             onClick={() => toggleFlag("checklistRepetition")}
//           >
//             {flags.checklistRepetition ? "Disable Checklist Repetition" : "Enable Checklist Repetition"}
//           </button>
//           <button
//             type="button"
//             className="px-6 py-3 rounded-lg"
//             style={{ background: palette.iconColor, color: "#fff", fontWeight: 700 }}
//             onClick={() => toggleFlag("allFlags")}
//           >
//             {flags.allFlags ? "Disable All Flags" : "Enable All Flags"}
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }


// // ----- STEP 4: PURPOSE MANAGEMENT -----
// function PurposeManagementStep({ userId, clientName, palette }) {
//   const [purposes, setPurposes] = useState([]);
//   const [assigned, setAssigned] = useState([]);
//   const [selected, setSelected] = useState([]);
//   const [newPurpose, setNewPurpose] = useState("");
//   const [addLoading, setAddLoading] = useState(false);
//   const [mapLoading, setMapLoading] = useState(false);
//   const [removing, setRemoving] = useState({});
//   const [error, setError] = useState("");

//   // const API_URL = "https://konstruct.world/projects/all-purposes/";
//   const API_URL = "/all-purposes/";
//   // const CLIENT_PURPOSE_URL = "https://konstruct.world/projects/client-purpose/";
//   const CLIENT_PURPOSE_URL = "/client-purpose/";
//   // const CLIENT_PURPOSE_DETAIL_URL = (userId) =>
//   //   `https://konstruct.world/projects/client-purpose/${userId}/`;
//   const CLIENT_PURPOSE_DETAIL_URL = (userId) => `/client-purpose/${userId}/`;
//   // const CLIENT_PURPOSE_SOFT_DELETE_URL = (assignmentId) =>
//   //   `https://konstruct.world/projects/client-purpose/${assignmentId}/soft-delete/`;
//   const CLIENT_PURPOSE_SOFT_DELETE_URL = (assignmentId) => `/client-purpose/${assignmentId}/soft-delete/`;

//   const fetchAll = async () => {
//     try {
//       const token = localStorage.getItem("ACCESS_TOKEN");
//       const all = await projectInstance.get(API_URL, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setPurposes(all.data || []);
//       if (userId) {
//         const res2 = await projectInstance.get(CLIENT_PURPOSE_DETAIL_URL(userId), {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setAssigned(res2.data || []);
//       }
//     } catch {
//       setError("Could not load purposes or mapping.");
//     }
//   };

//   React.useEffect(() => {
//     fetchAll();
//   }, [userId]);

//   const handleAddPurpose = async (e) => {
//     e.preventDefault();
//     if (!newPurpose.trim()) return;
//     setAddLoading(true);
//     setError("");
//     try {
//       const token = localStorage.getItem("ACCESS_TOKEN");
//       await projectInstance.post(
//         API_URL,
//         { name: newPurpose },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setNewPurpose("");
//       showToast("Purpose added!", "success");
//       fetchAll();
//     } catch (e) {
//       setError(
//         e?.response?.data?.name?.[0] ||
//           e?.response?.data?.detail ||
//           "Failed to add purpose."
//       );
//     }
//     setAddLoading(false);
//   };

//   const handleAssign = async () => {
//     if (!selected.length) return;
//     setMapLoading(true);
//     setError("");
//     try {
//       const token = localStorage.getItem("ACCESS_TOKEN");
//       await Promise.all(
//         selected.map((purposeId) =>
//           projectInstance.post(
//             CLIENT_PURPOSE_URL,
//             { client_id: userId, purpose_id: purposeId },
//             { headers: { Authorization: `Bearer ${token}` } }
//           )
//         )
//       );
//     setSelected([]);
//     showToast("Purpose(s) assigned!", "success");
//     fetchAll();
//     } catch {
//       setError("Assignment failed.");
//     }
//     setMapLoading(false);
//   };

//   const handleRemove = async (assignmentId) => {
//     if (!window.confirm("Remove this purpose?")) return;
//     setRemoving((r) => ({ ...r, [assignmentId]: true }));
//     try {
//       const token = localStorage.getItem("ACCESS_TOKEN");
//       await projectInstance.patch(
//         CLIENT_PURPOSE_SOFT_DELETE_URL(assignmentId),
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       fetchAll();
//     } catch {
//       showToast("Remove failed.", "error");
//     }
//     setRemoving((r) => ({ ...r, [assignmentId]: false }));
//   };

//   return (
//     <div
//       className="max-w-xl mx-auto border rounded-2xl shadow-xl p-8"
//       style={{
//         background: palette.cardColor,
//         color: palette.textColor,
//         border: `1.5px solid ${palette.borderColor}`,
//       }}
//     >
//       <h2 className="text-2xl font-bold mb-4" style={{ color: palette.iconColor }}>
//         Purpose Management for{" "}
//         <span style={{ color: palette.iconColor }}>{clientName}</span>
//       </h2>
//       <form className="flex gap-2 mb-6" onSubmit={handleAddPurpose}>
//         <input
//           type="text"
//           value={newPurpose}
//           onChange={(e) => setNewPurpose(e.target.value)}
//           placeholder="Add new purpose"
//           className="flex-1 px-3 py-2 rounded border"
//           style={{
//             borderColor: palette.borderColor,
//             background: palette.bgColor,
//             color: palette.textColor,
//           }}
//           disabled={addLoading}
//         />
//         <button
//           type="submit"
//           className="px-4 py-2 rounded"
//           style={{
//             background: palette.iconColor,
//             color: "#fff",
//             fontWeight: 600,
//           }}
//           disabled={addLoading || !newPurpose.trim()}
//         >
//           {addLoading ? "Adding..." : "Add"}
//         </button>
//       </form>
//       <div className="mb-6">
//         <label className="block font-medium mb-2">Assign to user:</label>
//         <select
//           multiple
//           className="w-full p-2 rounded border"
//           value={selected}
//           onChange={(e) =>
//             setSelected(Array.from(e.target.selectedOptions, (o) => Number(o.value)))
//           }
//           disabled={mapLoading || purposes.length === 0}
//           style={{
//             minHeight: 90,
//             borderColor: palette.borderColor,
//             background: palette.bgColor,
//             color: palette.textColor,
//           }}
//         >
//           {purposes.map((p) => (
//             <option key={p.id} value={p.id}>
//               {p.name}
//             </option>
//           ))}
//         </select>
//         <button
//           className="mt-3 w-full py-2 rounded"
//           style={{
//             background: palette.iconColor,
//             color: "#fff",
//             fontWeight: 600,
//           }}
//           onClick={handleAssign}
//           disabled={mapLoading || !selected.length}
//         >
//           {mapLoading ? "Assigning..." : "Assign selected"}
//         </button>
//       </div>
//       <div>
//         <h3 className="font-semibold mb-2">Assigned Purposes:</h3>
//         <ul className="space-y-2">
//           {assigned.length === 0 ? (
//             <li className="text-gray-500 text-sm">No purposes assigned</li>
//           ) : (
//             assigned.map((ap) => (
//               <li
//                 key={ap.id}
//                 className="flex items-center justify-between border-b py-2"
//                 style={{
//                   borderColor: palette.borderColor,
//                 }}
//               >
//                 <span>{ap.purpose_name || ap.name}</span>
//                 <button
//                   onClick={() => handleRemove(ap.id)}
//                   className="px-2 py-1 rounded text-xs ml-3"
//                   style={{
//                     background: palette.iconColor,
//                     color: "#fff",
//                   }}
//                   disabled={removing[ap.id]}
//                 >
//                   {removing[ap.id] ? "Removing..." : "Remove"}
//                 </button>
//               </li>
//             ))
//           )}
//         </ul>
//       </div>
//       {error && (
//         <div
//           className="mt-4 text-sm bg-white border rounded p-2"
//           style={{
//             color: "red",
//             borderColor: palette.borderColor,
//           }}
//         >
//           {error}
//         </div>
//       )}
//     </div>
//   );
// }

// // ------ MAIN WIZARD ------
// const steps = [
//   "User & Role",
//   "Organization Setup",
//   "Project Setup",
//   "Purpose Management",
// ];

// const UserManagementSetup = () => {
//   const { theme } = useTheme();
//   const palette = usePalette(theme);
//   const { sidebarOpen } = useSidebar();

//   const [activeStep, setActiveStep] = useState(0);
//   const [createdUserId, setCreatedUserId] = useState(null);
//   const [createdUserName, setCreatedUserName] = useState("");
//   const [assignedOrgId, setAssignedOrgId] = useState(null);
//   const [assignedOrgName, setAssignedOrgName] = useState("");
//   const [createdProjectId, setCreatedProjectId] = useState(null);

//   const handleUserCreated = (userId, userName) => {
//     setCreatedUserId(userId);
//     setCreatedUserName(userName);
//     setActiveStep(1);
//   };

//   const handleOrgAssigned = (orgId, orgName) => {
//     setAssignedOrgId(orgId);
//     setAssignedOrgName(orgName);
//     setActiveStep(2);
//   };

//   const handleProjectCreated = (projectId) => {
//     setCreatedProjectId(projectId);
//     setActiveStep(3);
//   };

//   function StepContent({ step }) {
//     if (step === 0)
//       return (
//         <UserAndRoleManagement
//           onUserCreated={handleUserCreated}
//           palette={palette}
//         />
//       );
//     if (step === 1)
//       return (
//         <OrganizationSetup
//           userIdToAssign={createdUserId}
//           onAssigned={handleOrgAssigned}
//           palette={palette}
//         />
//       );
//     if (step === 2)
//       return (
//         <ProjectSetupStep
//           orgId={assignedOrgId}
//           orgName={assignedOrgName}
//           userId={createdUserId}
//           clientName={createdUserName}
//           onProjectCreated={handleProjectCreated}
//           onClose={() => setActiveStep(1)}
//           palette={palette}
//         />
//       );
//     if (step === 3)
//       return (
//         <PurposeManagementStep
//           userId={createdUserId}
//           clientName={createdUserName}
//           palette={palette}
//         />
//       );
//     return null;
//   }

//   return (
//     <div className="min-h-screen flex flex-col items-center">
//       <h2
//         className="text-2xl font-bold mb-8"
//         style={{ color: palette.iconColor, marginTop: "2.5rem" }}
//       >
//         User Management Setup
//       </h2>

//       <div className="flex gap-3 mb-12 flex-wrap justify-center max-w-full">
//         {steps.map((label, idx) => (
//           <button
//             key={label}
//             onClick={() => setActiveStep(idx)}
//             disabled={
//               (idx === 1 && !createdUserId) ||
//               (idx === 2 && !assignedOrgId) ||
//               (idx === 3 && !createdProjectId)
//             }
//             className="flex flex-col items-center px-3 py-2 rounded-lg border transition-all"
//             style={{
//               background:
//                 activeStep === idx ? palette.bgColor : palette.cardColor,
//               color:
//                 activeStep === idx ? palette.iconColor : palette.textColor,
//               borderColor: palette.borderColor,
//               fontWeight: activeStep === idx ? 700 : 400,
//             }}
//           >
//             <span>{label}</span>
//             {activeStep === idx && (
//               <div
//                 className="w-3 h-1 mt-1 rounded-full"
//                 style={{
//                   background: palette.iconColor,
//                 }}
//               />
//             )}
//           </button>
//         ))}
//       </div>

//       <div
//         className="w-full max-w-7xl rounded-xl shadow-lg mb-8"
//         style={{
//           background: palette.cardColor,
//           color: palette.textColor,
//           border: `1.5px solid ${palette.borderColor}`,
//         }}
//       >
//         <StepContent step={activeStep} />
//       </div>
//     </div>
//   );
// };

// export default UserManagementSetup;

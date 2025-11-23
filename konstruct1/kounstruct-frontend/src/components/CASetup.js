import React, { useState } from "react";
import SideBarSetup from "./SideBarSetup";

const ProgressBar = ({ currentStep, setCurrentStep }) => {
  const steps = [
    "Location",
    "Sub Location",
    "Activity",
    "Sub Activity",
    "Group Of Assets",
    "Category",
    "Sub Category",
    "Assets",
    "Observation Type",
    "Tag",

    "Project Status",
    "Schedule",
    "Email Setup",
  ];

  return (
    <div className="flex items-center justify-between space-x-4 mt-10 bg-gray-100 rounded-md w-dvw">
      {steps.map((step, index) => (
        <div key={index} className="flex-1">
          <button
            onClick={() => {
              setCurrentStep(index);
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
  );
};

const ProjectGrid = ({ setCurrentStep }) => {
  const [locations, setLocations] = useState([
    { location: "jkcxvhds", createdAt: "2024-09-23", createdBy: "" },
    { location: "Time S", createdAt: "2024-09-14", createdBy: "" },
    { location: "jasdbasj", createdAt: "2024-07-17", createdBy: "" },
    { location: "hjsad", createdAt: "2024-07-17", createdBy: "" },
    { location: "Tower 2", createdAt: "2024-07-16", createdBy: "" },
    { location: "jn", createdAt: "2024-07-16", createdBy: "" },
    { location: "sdjkfbsk", createdAt: "2024-07-16", createdBy: "" },
  ]);

  const [newLocation, setNewLocation] = useState("");
  const [isAddingLocation, setIsAddingLocation] = useState(false);

  const addLocation = () => {
    if (newLocation.trim()) {
      setLocations([
        ...locations,
        {
          location: newLocation,
          createdAt: new Date().toISOString().slice(0, 10),
          createdBy: "",
        },
      ]);
      setNewLocation("");
      setIsAddingLocation(false);
    }
  };

  return (
    <div>
      <div className="p-4">
        <div className="flex gap-4 items-center mb-4">
          <button
            className="bg-purple-600 text-white rounded-lg shadow-md px-4 py-2"
            onClick={() => setIsAddingLocation(true)}
          >
            Add Location
          </button>
          <div>
            {isAddingLocation && (
              <div className="flex items-center gap-4">
                <input
                  placeholder="Enter Location"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="border-gray-700 rounded-lg px-4 py-2"
                />
                <button
                  onClick={addLocation}
                  className="bg-purple-600 text-white rounded-lg shadow-md px-4 py-2"
                >
                  Submit
                </button>
              </div>
            )}
          </div>
          {/* <input
          placeholder="Enter Location"
          value={newLocation}
          onChange={(e) => setNewLocation(e.target.value)}
          className="border-purple-600 focus:ring-purple-600 rounded-lg px-4 py-2"
        />
        <button onClick={addLocation} className="bg-purple-600 text-white rounded-lg shadow-md px-4 py-2">
          Submit
        </button> */}
        </div>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="text-left px-4 py-2">Location</th>
                <th className="text-left px-4 py-2">Created At</th>
                <th className="text-left px-4 py-2">Created By</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((loc, index) => (
                <tr key={index} className="odd:bg-white even:bg-gray-100">
                  <td className="px-4 py-2">{loc.location}</td>
                  <td className="px-4 py-2">{loc.createdAt}</td>
                  <td className="px-4 py-2">{loc.createdBy || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SubLocation = ({ setCurrentStep }) => {
  const [locations, setLocations] = useState([
    {
      location: "jkcxvhds",
      sublocation: "garden",
      createdAt: "2024-09-23",
      createdBy: "",
    },
    {
      location: "Time S",
      sublocation: "1st Floor",
      createdAt: "2024-09-14",
      createdBy: "",
    },
    {
      location: "jasdbasj",
      sublocation: "V4",
      createdAt: "2024-07-17",
      createdBy: "",
    },
    {
      location: "hjsad",
      sublocation: "V1",
      createdAt: "2024-07-17",
      createdBy: "",
    },
    {
      location: "Tower 2",
      sublocation: "V2",
      createdAt: "2024-07-16",
      createdBy: "",
    },
    {
      location: "jn",
      sublocation: "V3",
      createdAt: "2024-07-16",
      createdBy: "",
    },
    {
      location: "sdjkfbsk",
      sublocation: "V5",
      createdAt: "2024-07-16",
      createdBy: "",
    },
  ]);

  const [newLocation, setNewLocation] = useState("");
  const [isAddingLocation, setIsAddingLocation] = useState(false);

  const addLocation = () => {
    if (newLocation.trim()) {
      setLocations([
        ...locations,
        {
          location: newLocation,
          createdAt: new Date().toISOString().slice(0, 10),
          createdBy: "",
        },
      ]);
      setNewLocation("");
      setIsAddingLocation(false);
    }
  };

  return (
    <div>
      <div className="p-4">
        <div className="flex gap-4 items-center mb-4">
          <button
            className="bg-purple-600 text-white rounded-lg shadow-md px-4 py-2"
            onClick={() => setIsAddingLocation(true)}
          >
            Add Sub Location
          </button>
          <div>
            {isAddingLocation && (
              <div className="flex items-center gap-5">
                <select className="border rounded-lg px-4 py-2">
                  <option value="">Select Location</option>
                  <option value="">Villa 1</option>
                  <option value="">Villa 2</option>
                  <option value="">Villa 3</option>
                </select>

                <input
                  placeholder="Enter Location"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="border rounded-lg px-4 py-2"
                />
                <button
                  onClick={addLocation}
                  className="bg-purple-600 text-white rounded-lg shadow-md px-4 py-2"
                >
                  Submit
                </button>
              </div>
            )}
          </div>
          {/* <input
          placeholder="Enter Location"
          value={newLocation}
          onChange={(e) => setNewLocation(e.target.value)}
          className="border-purple-600 focus:ring-purple-600 rounded-lg px-4 py-2"
        />
        <button onClick={addLocation} className="bg-purple-600 text-white rounded-lg shadow-md px-4 py-2">
          Submit
        </button> */}
        </div>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="text-left px-4 py-2">Location</th>
                <th className="text-left px-4 py-2">SubLocation</th>
                <th className="text-left px-4 py-2">Created At</th>
                <th className="text-left px-4 py-2">Created By</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((loc, index) => (
                <tr key={index} className="odd:bg-white even:bg-gray-100">
                  <td className="px-4 py-2">{loc.location}</td>
                  <td className="px-4 py-2">{loc.sublocation}</td>
                  <td className="px-4 py-2">{loc.createdAt}</td>
                  <td className="px-4 py-2">{loc.createdBy || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Activity = ({ setCurrentStep }) => {
  const [locations, setLocations] = useState([
    { location: "jkcxvhds", createdAt: "2024-09-23", createdBy: "" },
    { location: "Time S", createdAt: "2024-09-14", createdBy: "" },
    { location: "jasdbasj", createdAt: "2024-07-17", createdBy: "" },
    { location: "hjsad", createdAt: "2024-07-17", createdBy: "" },
    { location: "Tower 2", createdAt: "2024-07-16", createdBy: "" },
    { location: "jn", createdAt: "2024-07-16", createdBy: "" },
    { location: "sdjkfbsk", createdAt: "2024-07-16", createdBy: "" },
  ]);

  const [newLocation, setNewLocation] = useState("");
  const [isAddingLocation, setIsAddingLocation] = useState(false);

  const addLocation = () => {
    if (newLocation.trim()) {
      setLocations([
        ...locations,
        {
          location: newLocation,
          createdAt: new Date().toISOString().slice(0, 10),
          createdBy: "",
        },
      ]);
      setNewLocation("");
      setIsAddingLocation(false);
    }
  };

  return (
    <div>
      <div className="p-4">
        <div className="flex gap-4 items-center mb-4">
          <button
            className="bg-purple-600 text-white rounded-lg shadow-md px-4 py-2"
            onClick={() => setIsAddingLocation(true)}
          >
            Add Activity
          </button>
          <div>
            {isAddingLocation && (
              <div className="flex items-center gap-4">
                <input
                  placeholder="Enter Activity"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="border rounded-lg px-4 py-2"
                />
                <button
                  onClick={addLocation}
                  className="bg-purple-600 text-white rounded-lg shadow-md px-4 py-2"
                >
                  Submit
                </button>
              </div>
            )}
          </div>
          {/* <input
          placeholder="Enter Location"
          value={newLocation}
          onChange={(e) => setNewLocation(e.target.value)}
          className="border-purple-600 focus:ring-purple-600 rounded-lg px-4 py-2"
        />
        <button onClick={addLocation} className="bg-purple-600 text-white rounded-lg shadow-md px-4 py-2">
          Submit
        </button> */}
        </div>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="text-left px-4 py-2">Activity</th>
                <th className="text-left px-4 py-2">Created At</th>
                <th className="text-left px-4 py-2">Created By</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((loc, index) => (
                <tr key={index} className="odd:bg-white even:bg-gray-100">
                  <td className="px-4 py-2">{loc.location}</td>
                  <td className="px-4 py-2">{loc.createdAt}</td>
                  <td className="px-4 py-2">{loc.createdBy || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
const Subactivity = ({ setCurrentStep }) => {
  const [locations, setLocations] = useState([
    { location: "jkcxvhds", createdAt: "2024-09-23", createdBy: "" },
    { location: "Time S", createdAt: "2024-09-14", createdBy: "" },
    { location: "jasdbasj", createdAt: "2024-07-17", createdBy: "" },
    { location: "hjsad", createdAt: "2024-07-17", createdBy: "" },
    { location: "Tower 2", createdAt: "2024-07-16", createdBy: "" },
    { location: "jn", createdAt: "2024-07-16", createdBy: "" },
    { location: "sdjkfbsk", createdAt: "2024-07-16", createdBy: "" },
  ]);

  const [newLocation, setNewLocation] = useState("");
  const [isAddingLocation, setIsAddingLocation] = useState(false);

  const addLocation = () => {
    if (newLocation.trim()) {
      setLocations([
        ...locations,
        {
          location: newLocation,
          createdAt: new Date().toISOString().slice(0, 10),
          createdBy: "",
        },
      ]);
      setNewLocation("");
      setIsAddingLocation(false);
    }
  };

  return (
    <div>
      <div className="p-4">
        <div className="flex gap-4 items-center mb-4">
          <button
            className="bg-purple-600 text-white rounded-lg shadow-md px-4 py-2"
            onClick={() => setIsAddingLocation(true)}
          >
            Add Sub Activity
          </button>
          <div>
            {isAddingLocation && (
              <div className="flex items-center gap-4">
                <input
                  placeholder="Enter Sub Activity"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="border rounded-lg px-4 py-2"
                />
                <button
                  onClick={addLocation}
                  className="bg-purple-600 text-white rounded-lg shadow-md px-4 py-2"
                >
                  Submit
                </button>
              </div>
            )}
          </div>
          {/* <input
          placeholder="Enter Location"
          value={newLocation}
          onChange={(e) => setNewLocation(e.target.value)}
          className="border-purple-600 focus:ring-purple-600 rounded-lg px-4 py-2"
        />
        <button onClick={addLocation} className="bg-purple-600 text-white rounded-lg shadow-md px-4 py-2">
          Submit
        </button> */}
        </div>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="text-left px-4 py-2"> Sub Activity</th>
                <th className="text-left px-4 py-2">Created At</th>
                <th className="text-left px-4 py-2">Created By</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((loc, index) => (
                <tr key={index} className="odd:bg-white even:bg-gray-100">
                  <td className="px-4 py-2">{loc.location}</td>
                  <td className="px-4 py-2">{loc.createdAt}</td>
                  <td className="px-4 py-2">{loc.createdBy || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const GroupAsset = ({ setCurrentStep }) => {
  const [locations, setLocations] = useState([
    {
      location: "Mopping",
      sublocation: "Lift",
      createdAt: "2024-09-23",
      createdBy: "",
    },
    {
      location: "Safety",
      sublocation: "Excavation",
      createdAt: "2024-09-14",
      createdBy: "",
    },
    {
      location: "Safety",
      sublocation: "External Plaster",
      createdAt: "2024-07-17",
      createdBy: "",
    },
    {
      location: "Safety",
      sublocation: "Internal Plaster",
      createdAt: "2024-07-17",
      createdBy: "",
    },
    {
      location: "Safety",
      sublocation: "Erection",
      createdAt: "2024-07-16",
      createdBy: "",
    },
    {
      location: "Safety",
      sublocation: "Internal Plaster",
      createdAt: "2024-07-16",
      createdBy: "",
    },
    {
      location: "Safety",
      sublocation: "Excavation",
      createdAt: "2024-07-16",
      createdBy: "",
    },
  ]);

  const [newLocation, setNewLocation] = useState("");
  const [isAddingLocation, setIsAddingLocation] = useState(false);

  const addLocation = () => {
    if (newLocation.trim()) {
      setLocations([
        ...locations,
        {
          location: newLocation,
          createdAt: new Date().toISOString().slice(0, 10),
          createdBy: "",
        },
      ]);
      setNewLocation("");
      setIsAddingLocation(false);
    }
  };

  return (
    <div>
      <div className="p-4">
        <div className="flex gap-4 items-center mb-4">
          <button
            className="bg-purple-600 text-white rounded-lg shadow-md px-4 py-2"
            onClick={() => setIsAddingLocation(true)}
          >
            Add Sub Activity
          </button>
          <div>
            {isAddingLocation && (
              <div className="flex items-center gap-5">
                <select className="border rounded-lg px-4 py-2">
                  <option value="">Select Activity</option>
                  <option value="">Snag</option>
                  <option value="">Quality</option>
                  <option value="">Safety</option>
                </select>

                <input
                  placeholder="Enter Group of Asset"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="border rounded-lg px-4 py-2"
                />
                <button
                  onClick={addLocation}
                  className="bg-purple-600 text-white rounded-lg shadow-md px-4 py-2"
                >
                  Submit
                </button>
              </div>
            )}
          </div>
          {/* <input
          placeholder="Enter Location"
          value={newLocation}
          onChange={(e) => setNewLocation(e.target.value)}
          className="border-purple-600 focus:ring-purple-600 rounded-lg px-4 py-2"
        />
        <button onClick={addLocation} className="bg-purple-600 text-white rounded-lg shadow-md px-4 py-2">
          Submit
        </button> */}
        </div>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="text-left px-4 py-2">Activity</th>
                <th className="text-left px-4 py-2">Group of Assets </th>
                <th className="text-left px-4 py-2">Created At</th>
                <th className="text-left px-4 py-2">Created By</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((loc, index) => (
                <tr key={index} className="odd:bg-white even:bg-gray-100">
                  <td className="px-4 py-2">{loc.location}</td>
                  <td className="px-4 py-2">{loc.sublocation}</td>
                  <td className="px-4 py-2">{loc.createdAt}</td>
                  <td className="px-4 py-2">{loc.createdBy || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Category = ({ setCurrentStep }) => {
  const [locations, setLocations] = useState([
    { location: "Technical", createdAt: "2024-09-23", createdBy: "" },
    { location: "Time S", createdAt: "2024-09-14", createdBy: "" },
    { location: "jasdbasj", createdAt: "2024-07-17", createdBy: "" },
    { location: "hjsad", createdAt: "2024-07-17", createdBy: "" },
    { location: "Tower 2", createdAt: "2024-07-16", createdBy: "" },
    { location: "jn", createdAt: "2024-07-16", createdBy: "" },
    { location: "sdjkfbsk", createdAt: "2024-07-16", createdBy: "" },
  ]);

  const [newLocation, setNewLocation] = useState("");
  const [isAddingLocation, setIsAddingLocation] = useState(false);

  const addLocation = () => {
    if (newLocation.trim()) {
      setLocations([
        ...locations,
        {
          location: newLocation,
          createdAt: new Date().toISOString().slice(0, 10),
          createdBy: "",
        },
      ]);
      setNewLocation("");
      setIsAddingLocation(false);
    }
  };

  return (
    <div>
      <div className="p-4">
        <div className="flex gap-4 items-center mb-4">
          <button
            className="bg-purple-600 text-white rounded-lg shadow-md px-4 py-2"
            onClick={() => setIsAddingLocation(true)}
          >
            Add Observation Category
          </button>
          <div>
            {isAddingLocation && (
              <div className="flex items-center gap-4">
                <input
                  placeholder="Enter Category"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="border rounded-lg px-4 py-2"
                />
                <button
                  onClick={addLocation}
                  className="bg-purple-600 text-white rounded-lg shadow-md px-4 py-2"
                >
                  Submit
                </button>
              </div>
            )}
          </div>
          {/* <input
          placeholder="Enter Location"
          value={newLocation}
          onChange={(e) => setNewLocation(e.target.value)}
          className="border-purple-600 focus:ring-purple-600 rounded-lg px-4 py-2"
        />
        <button onClick={addLocation} className="bg-purple-600 text-white rounded-lg shadow-md px-4 py-2">
          Submit
        </button> */}
        </div>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="text-left px-4 py-2">Category</th>
                <th className="text-left px-4 py-2">Created At</th>
                <th className="text-left px-4 py-2">Created By</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((loc, index) => (
                <tr key={index} className="odd:bg-white even:bg-gray-100">
                  <td className="px-4 py-2">{loc.location}</td>
                  <td className="px-4 py-2">{loc.createdAt}</td>
                  <td className="px-4 py-2">{loc.createdBy || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Subcategory = ({ setCurrentStep }) => {
  const [locations, setLocations] = useState([
    {
      location: "Child Labor",
      sublocation: "Mechanical",
      createdAt: "2024-09-23",
      createdBy: "",
    },
    {
      location: "Technical",
      sublocation: "B B",
      createdAt: "2024-09-14",
      createdBy: "",
    },
    {
      location: "U & S",
      sublocation: "A B",
      createdAt: "2024-07-17",
      createdBy: "",
    },
    {
      location: "U & S",
      sublocation: "B B",
      createdAt: "2024-07-17",
      createdBy: "",
    },
    {
      location: "U & S",
      sublocation: "A B",
      createdAt: "2024-07-16",
      createdBy: "",
    },
    {
      location: "U & S",
      sublocation: "B B",
      createdAt: "2024-07-16",
      createdBy: "",
    },
    {
      location: "U & S",
      sublocation: "A B",
      createdAt: "2024-07-16",
      createdBy: "",
    },
  ]);

  const [newLocation, setNewLocation] = useState("");
  const [isAddingLocation, setIsAddingLocation] = useState(false);

  const addLocation = () => {
    if (newLocation.trim()) {
      setLocations([
        ...locations,
        {
          location: newLocation,
          createdAt: new Date().toISOString().slice(0, 10),
          createdBy: "",
        },
      ]);
      setNewLocation("");
      setIsAddingLocation(false);
    }
  };

  return (
    <div>
      <div className="p-4">
        <div className="flex gap-4 items-center mb-4">
          <button
            className="bg-purple-600 text-white rounded-lg shadow-md px-4 py-2"
            onClick={() => setIsAddingLocation(true)}
          >
            Add Sub Category
          </button>

          <div>
            {isAddingLocation && (
              <div className="flex items-center gap-5">
                <select className="border rounded-lg px-4 py-2">
                  <option value="">Select Category</option>
                  <option value="">Child Labor</option>
                  <option value="">Plumbing</option>
                  <option value="">Civil Infra</option>
                </select>

                <input
                  placeholder="Enter Sub Category"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="border rounded-lg px-4 py-2"
                />
                <button
                  onClick={addLocation}
                  className="bg-purple-600 text-white rounded-lg shadow-md px-4 py-2"
                >
                  Submit
                </button>
              </div>
            )}
          </div>
          {/* <input
          placeholder="Enter Location"
          value={newLocation}
          onChange={(e) => setNewLocation(e.target.value)}
          className="border-purple-600 focus:ring-purple-600 rounded-lg px-4 py-2"
        />
        <button onClick={addLocation} className="bg-purple-600 text-white rounded-lg shadow-md px-4 py-2">
          Submit
        </button> */}
        </div>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="text-left px-4 py-2">Category</th>
                <th className="text-left px-4 py-2">Sub Category/Assets </th>
                <th className="text-left px-4 py-2">Created At</th>
                <th className="text-left px-4 py-2">Created By</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((loc, index) => (
                <tr key={index} className="odd:bg-white even:bg-gray-100">
                  <td className="px-4 py-2">{loc.location}</td>
                  <td className="px-4 py-2">{loc.sublocation}</td>
                  <td className="px-4 py-2">{loc.createdAt}</td>
                  <td className="px-4 py-2">{loc.createdBy || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Asset = ({ setCurrentStep }) => {
  const [locations, setLocations] = useState([
    {
      location: "Child Labor",
      sublocation: "Mechanical",
      createdAt: "2024-09-23",
      createdBy: "",
    },
    {
      location: "Technical",
      sublocation: "B B",
      createdAt: "2024-09-14",
      createdBy: "",
    },
    {
      location: "U & S",
      sublocation: "A B",
      createdAt: "2024-07-17",
      createdBy: "",
    },
    {
      location: "U & S",
      sublocation: "B B",
      createdAt: "2024-07-17",
      createdBy: "",
    },
    {
      location: "U & S",
      sublocation: "A B",
      createdAt: "2024-07-16",
      createdBy: "",
    },
    {
      location: "U & S",
      sublocation: "B B",
      createdAt: "2024-07-16",
      createdBy: "",
    },
    {
      location: "U & S",
      sublocation: "A B",
      createdAt: "2024-07-16",
      createdBy: "",
    },
  ]);

  const [newLocation, setNewLocation] = useState("");
  const [isAddingLocation, setIsAddingLocation] = useState(false);

  const addLocation = () => {
    if (newLocation.trim()) {
      setLocations([
        ...locations,
        {
          location: newLocation,
          createdAt: new Date().toISOString().slice(0, 10),
          createdBy: "",
        },
      ]);
      setNewLocation("");
      setIsAddingLocation(false);
    }
  };

  return (
    <div>
      <div className="p-4">
        <div className="flex gap-4 items-center mb-4">
          <button
            className="bg-purple-600 text-white rounded-lg shadow-md px-4 py-2"
            onClick={() => setIsAddingLocation(true)}
          >
            Add Sub Category
          </button>

          <div>
            {isAddingLocation && (
              <div className="flex items-center gap-5">
                <select className="border rounded-lg px-4 py-2">
                  <option value="">Select Category</option>
                  <option value="">Child Labor</option>
                  <option value="">Plumbing</option>
                  <option value="">Civil Infra</option>
                </select>

                <input
                  placeholder="Enter Sub Category"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="border rounded-lg px-4 py-2"
                />
                <button
                  onClick={addLocation}
                  className="bg-purple-600 text-white rounded-lg shadow-md px-4 py-2"
                >
                  Submit
                </button>
              </div>
            )}
          </div>
          {/* <input
          placeholder="Enter Location"
          value={newLocation}
          onChange={(e) => setNewLocation(e.target.value)}
          className="border-purple-600 focus:ring-purple-600 rounded-lg px-4 py-2"
        />
        <button onClick={addLocation} className="bg-purple-600 text-white rounded-lg shadow-md px-4 py-2">
          Submit
        </button> */}
        </div>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="text-left px-4 py-2">Asset Name</th>
                <th className="text-left px-4 py-2">Location </th>
                <th className="text-left px-4 py-2"> Sub Location </th>
                <th className="text-left px-4 py-2"> Category</th>
                <th className="text-left px-4 py-2">Sub Category</th>
                <th className="text-left px-4 py-2">Activity</th>
                <th className="text-left px-4 py-2">Group of Assets </th>
                <th className="text-left px-4 py-2">Created </th>
              </tr>
            </thead>
            <tbody>
              {locations.map((loc, index) => (
                <tr key={index} className="odd:bg-white even:bg-gray-100">
                  <td className="px-4 py-2">{loc.location}</td>
                  <td className="px-4 py-2">{loc.sublocation}</td>
                  <td className="px-4 py-2">{loc.createdAt}</td>
                  <td className="px-4 py-2">{loc.createdBy || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const CASetup = () => {
  const [currentStep, setCurrentStep] = useState(0);
  return (
    <div>
      <SideBarSetup />
      <div className="my-5 w-[85%] mt-5 ml-[16%] mr-[1%]">
        <ProgressBar
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
        />
        {currentStep === 0 && <ProjectGrid setCurrentStep={setCurrentStep} />}
        {currentStep === 1 && <SubLocation setCurrentStep={setCurrentStep} />}
        {currentStep === 2 && <Activity setCurrentStep={setCurrentStep} />}
        {currentStep === 3 && <Subactivity setCurrentStep={setCurrentStep} />}
        {currentStep === 4 && <GroupAsset setCurrentStep={setCurrentStep} />}
        {currentStep === 5 && <Category setCurrentStep={setCurrentStep} />}
        {currentStep === 6 && <Subcategory setCurrentStep={setCurrentStep} />}
        {currentStep === 7 && <Asset setCurrentStep={setCurrentStep} />}
      </div>
    </div>
  );
};

export default CASetup;

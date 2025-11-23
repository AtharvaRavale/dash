import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // To navigate between pages

const SiteConfiguration = () => {
  const navigate = useNavigate();

  const [siteName, setSiteName] = useState("");
  const [siteAddress, setSiteAddress] = useState("");
  const [tower, setTower] = useState("");
  const [flat, setFlat] = useState("");
  const [carpetArea, setCarpetArea] = useState("");
  const [possessionDate, setPossessionDate] = useState("");
  const [status, setStatus] = useState("");
  const [units, setUnits] = useState([{ unitNumber: "", unitType: "", config: "" }]);

  const addUnit = () => {
    setUnits([...units, { unitNumber: "", unitType: "", config: "" }]);
  };

  const saveSite = () => {
    // Add save functionality here
    console.log("Site Name:", siteName);
    console.log("Site Address:", siteAddress);
    console.log("Units:", units);
  };

  const goToChifSetup = () => {
    navigate("/ChifSetup"); // Navigate to the ChifSetup page
  };

  return (
    <div className="w-full h-full flex flex-col justify-between bg-gray-100 min-h-screen">
      {/* Main Content */}
      <main className="w-full max-w-6xl mx-auto p-8">
        {/* Site Configuration Form */}
        <div className="bg-gray-100 rounded-lg px-8 pt-6 pb-8 mb-6">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Site Configuration</h2>
          <div className="grid grid-cols-3 gap-6 mb-6">
            {/* Site Name */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Site Name</label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>

            {/* Tower */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Tower</label>
              <input
                type="text"
                value={tower}
                onChange={(e) => setTower(e.target.value)}
                className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>

            {/* Flat */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Flat</label>
              <input
                type="text"
                value={flat}
                onChange={(e) => setFlat(e.target.value)}
                className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>

            {/* Carpet Area */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Carpet Area</label>
              <input
                type="text"
                value={carpetArea}
                onChange={(e) => setCarpetArea(e.target.value)}
                className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>

            {/* Date of Possession */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Date of Possession</label>
              <input
                type="date"
                value={possessionDate}
                onChange={(e) => setPossessionDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="Sale">Sale</option>
                <option value="Rent">Rent</option>
                <option value="Occupied">Occupied</option>
              </select>
            </div>
          </div>

          {/* Site Address */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Site Address</label>
            <textarea
              value={siteAddress}
              onChange={(e) => setSiteAddress(e.target.value)}
              className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          {/* Units Section */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Units</h3>
            {units.map((unit, index) => (
              <div key={index} className="grid grid-cols-3 gap-6 mb-4">
                <input
                  type="text"
                  placeholder="Unit Number"
                  value={unit.unitNumber}
                  onChange={(e) => {
                    const newUnits = [...units];
                    newUnits[index].unitNumber = e.target.value;
                    setUnits(newUnits);
                  }}
                  className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
                <input
                  type="text"
                  placeholder="Unit Type"
                  value={unit.unitType}
                  onChange={(e) => {
                    const newUnits = [...units];
                    newUnits[index].unitType = e.target.value;
                    setUnits(newUnits);
                  }}
                  className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
                <input
                  type="text"
                  placeholder="Configuration"
                  value={unit.config}
                  onChange={(e) => {
                    const newUnits = [...units];
                    newUnits[index].config = e.target.value;
                    setUnits(newUnits);
                  }}
                  className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
            ))}
            <div></div>
            <button
              onClick={addUnit}
              className="bg-cyan-500 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Add Unit
            </button>
          </div>

          {/* Save Button */}
       
        
            <button
              onClick={saveSite}
              className="bg-cyan-500 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Save Site
            </button>
          
        </div>
      </main>
    </div>
  );
};

export default SiteConfiguration;

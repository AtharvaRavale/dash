

import { useState } from "react"
import { MdOutlineCancel } from "react-icons/md";

   
export default function Schedule() {
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
]
const [isAdd, setAdd] = useState(false);
const [selectedTowers, setSelectedTowers] = useState([]);
 const towers = ["H1", "H2", "I1", "I2", "I3", "I4", "I5", "I6", "J1", "J2", "J3", "J4", "J5", "J6"]
 const handleAdd = () => {
    setAdd(true); 
};
  
  const [activeTab, setActiveTab] = useState("delivery")

  return (
    <div className="max-w-7xl mx-auto p-5 bg-white rounded shadow-lg">
      {/* Tabs navigation */}
      <div className="flex space-x-6 border-b pb-2">
        <button
          className={`text-base px-6 py-2 ${activeTab === "delivery" ? "border-b-2 border-primary" : ""}`}
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
            <button className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 flex items-centern" onClick={handleAdd}>
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
                          ${delivery.status === "rejected" ? "bg-red-100 text-red-800" : ""}
                          ${delivery.status === "complete" ? "bg-green-100 text-green-800" : ""}
                          ${delivery.status === "wip" ? "bg-yellow-100 text-yellow-800" : ""}
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
          <button className="text-gray-500 hover:text-gray-700" onClick={() => setAdd(false)}>
            <MdOutlineCancel size={24}/>
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
            <input type="date" placeholder="Start Date" className="w-full border rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">End Date</label>
            <input type="date" placeholder="End Date" className="w-full border rounded-md p-2" />
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
            <h3 className="text-purple-700 font-semibold mb-3">SELECT TOWER</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {towers.map((tower) => (
                <label key={tower} className="flex items-center space-x-2 p-2 hover:bg-purple-100 rounded">
                  <input
                    type="checkbox"
                    checked={selectedTowers.includes(tower)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTowers([...selectedTowers, tower])
                      } else {
                        setSelectedTowers(selectedTowers.filter((t) => t !== tower))
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
            <h3 className="text-purple-700 font-semibold mb-3">SELECT FLOOR</h3>
            <div className="h-[300px]"></div>
          </div>

          {/* Flat Selection */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-purple-700 font-semibold mb-3">SELECT FLAT</h3>
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
  )
}

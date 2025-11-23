import { IoMdEye } from "react-icons/io";
import { useNavigate, useLocation, useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getFloorTypeDetails, getstageDetails } from "../api";
import toast from "react-hot-toast";
import SiteBarHome from "./SiteBarHome";

export default function ChecklistFloor() {
  const [activeStage, setActiveStage] = useState(null); // Track which stage is clicked
  const [isChecked, setIsChecked] = useState(false);
  const [isHandover, setIshandover] = useState(false);
  const [isReport, setReport] = useState(false);
  const [isMessage, setIsMessage] = useState(false);
  const [exportType, setExportType] = useState("pdf");
  const [viewType, setViewType] = useState("condensed");
  const navigate = useNavigate();
  const { state } = useLocation();
  const proId = state.projectId;
  const [floorTypeData, setFloorTypeData] = useState([]);
  const { id } = useParams();
  console.log("line 20", id);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [selectedRoomName, setSelectedRoomName] = useState([]);
  const [filterRoomData, setFilterRoomData] = useState([]);
  const [floorData, setFloorData] = useState([]);
  const [stageData, setStageData] = useState([]);
  const [level, setLevel] = useState("");
  const [floor, setFloor] = useState("");
  const [unit, setUnit] = useState("");
  useEffect(() => {
    const fetchFloorDetail = async () => {
      const response = await getFloorTypeDetails(id, proId);
      console.log(response);
      const responseData = response.data.data;
      setFloorData(responseData);
      const uniqueRooms = [
        ...new Map(
          responseData.map((item) => [item.room.id, item.room])
        ).values(),
      ];
      const roomId = uniqueRooms?.[0]?.id || null;
      setSelectedRoomName(uniqueRooms);
      setSelectedRoomId(roomId);
      console.log("line 39", response.data.data, uniqueRooms);
      const filteredData = responseData.filter(
        (item) => item.room.id === roomId // Always uses the latest selectedRoomId
      );
      setFilterRoomData(filteredData);
      console.log("line 44", filteredData);
      setLevel(response?.data?.data[0]?.tower?.name);
      setFloor(response?.data?.data[0]?.level?.name);
      setUnit(response?.data?.data[0]?.unit?.name);

      if (response.status === 200) {
        setFloorTypeData(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    };

    const fetchStageDetails = async () => {
      const response = await getstageDetails(proId);
      const stageId = response.data.data.stage.map((item) => item.id);
      console.log(stageId);
      setStageData(response.data.data.stage.map((item) => item.stages_name));
    };

    fetchFloorDetail();
    fetchStageDetails();
  }, [id]);
  console.log("line 62", stageData);
  const handleClick = (checkId, roomId) => {
    console.log("Checklist Questions:", roomId);
    navigate(`/checklistpage/${checkId}`, { state: { roomId } });
  };

  const handleRoomId = (id) => {
    setSelectedRoomId(id);
    const floorDetails = [...floorData];
    const filteredData = floorDetails.filter((item) => item.room.id === id);
    setFilterRoomData(filteredData);
  };
  const handleBack = () => {
    navigate(-1); // Navigate to the previous page
  };

  const handleStageClick = (stage) => {
    setActiveStage(stage); // Set the active stage when clicked
  };
  const [activeRoom, setActiveRoom] = useState(null);

  const handleRoomClick = (room) => {
    setActiveRoom(room); // Update active room on click
  };
  const handleCheckboxChange = () => {
    setIsChecked(!isChecked); // Toggle checkbox state
  };
  const handleHandover = () => {
    setIshandover(true);
  };
  const handleReport = () => {
    setReport(true);
  };
  //  const handleSaveComment = () => {
  //   // You can add logic to save or process the comment here.
  //   console.log("Comment Saved:", comment);
  //   setIsMessageOpen(false); // Close the popup after saving the comment
  // };
  console.log("line 100", filterRoomData);
  console.log("line 101", selectedRoomId);

  const details = (
    <div className="flex-1">
      <span className="text-gray-600">Initiator</span>
      <div className="flex items-center  gap-2">
        {/* Numbers with Borders */}
        <span className="border-[1px] border-red-500 text-center px-2 py-1 rounded font-bold text-red-700 text-sm mb-2">
          39
        </span>
        <span className="border-[1px] border-yellow-500 text-center px-2 py-1 rounded font-bold text-yellow-600 text-sm mb-2">
          0
        </span>
        <span className="border-[1px] border-teal-500 text-center px-1 py-1 rounded font-bold text-teal-700 text-sm mb-2">
          0
        </span>

        <div className="flex-1 text-center">
          <span className="text-gray-600">Repairer</span>

          {/* Numbers with Borders */}
          <span className="border-[1px] border-red-500 text-center px-2 py-1 rounded font-bold text-red-700 text-sm mb-2">
            39
          </span>
          <span className="border-[1px] border-yellow-500 text-center px-2 py-1 rounded font-bold text-yellow-600 text-sm mb-2">
            0
          </span>
          <span className="border-[1px] border-teal-500 text-center px-1 py-1 rounded font-bold text-teal-700 text-sm mb-2">
            0
          </span>
        </div>
        <div className="flex-1 text-center">
          <span className="text-gray-600">Reviewer</span>

          {/* Numbers with Borders */}
          <span className="border-[1px] border-red-500 text-center px-2 py-1 rounded font-bold text-red-700 text-sm mb-2">
            39
          </span>
          <span className="border-[1px] border-yellow-500 text-center px-2 py-1 rounded font-bold text-yellow-600 text-sm mb-2">
            0
          </span>
          <span className="border-[1px] border-teal-500 text-center px-1 py-1 rounded font-bold text-teal-700 text-sm mb-2">
            0
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex">
      <SiteBarHome />
      <div className="my-5 w-[85%] mt-5 ml-[16%] mr-[1%]">
        <div className="max-w-7xl mx-auto px-5 pb-10 pt-5 bg-white rounded shadow-lg">
          {/* <button
            className="px-4 py-2 mb-4 bg-gray-100 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
            onClick={handleBack}
          >
            &larr; Back
          </button> */}
          {/* Header */}
          <div className="flex justify-between">
            <h2 className="text-lg font-semibold">
              {level} {floor}
              {/* TOWER A 1ST FLOOR */}
            </h2>

            {/* Stages */}
            <div className="flex gap-3  text-left mb-5 justify-end h-15">
              {
                // ["Stage 1", "Stage 2", "Stage 3"]
                stageData.map((stage, index) => (
                  <div
                    key={stage}
                    onClick={() => handleStageClick(stage)}
                    className={`border-[1.5px] p-1 rounded text-center cursor-pointer transition-all flex flex-col gap-1 ${
                      activeStage === stage
                        ? "border-green-500 w-72" // Compact expanded style
                        : index === 0
                        ? "border-red-500 text-red-700 w-32"
                        : index === 1
                        ? "border-blue-500 text-blue-700 w-32"
                        : "border-teal-500 text-teal-700 w-32"
                    }`}
                  >
                    <div className="text-sm font-medium">{stage}</div>

                    {/* Expand Details */}
                    {activeStage === stage && (
                      <div className="flex justify-around mt-1">
                        {/* Columns with numbers */}
                        {["Inspect", "Repair", "Review"].map((category) => (
                          <div key={category} className="text-center">
                            <div className="text-xs font-semibold mb-1">
                              {category}
                            </div>
                            <div className="flex gap-1">
                              <span className="border-[1px] border-red-500 text-red-700 text-center px-1 py-0.5 rounded text-xs font-bold">
                                16
                              </span>
                              <span className="border-[1px] border-yellow-500 text-yellow-600 text-center px-1 py-0.5 rounded text-xs font-bold">
                                22
                              </span>
                              <span className="border-[1px] border-teal-500 text-teal-700 text-center px-1 py-0.5 rounded text-xs font-bold">
                                55
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              }
            </div>
          </div>
          <div className=" flex gap-4 mb-5 ">
            <button
              className="bg-purple-800 hover:bg-purple-900 text-white px-7 rounded-md h-10 w-15"
              onClick={handleHandover}
            >
              Handover
            </button>
            <button className="bg-purple-800 hover:bg-purple-900 text-white px-7 rounded-md h-10 w-15">
              Refresh
            </button>
            {isChecked && (
              <button
                className="bg-purple-800 hover:bg-purple-900 text-white px-7 rounded-md h-10 w-15"
                onClick={handleReport}
              >
                Report
              </button>
            )}
          </div>

          {/* Project Status */}
          <div className="flex gap-6 ">
            {/* Rooms Sidebar */}
            <div className="flex gap-5 ">
              {/* Rooms Sidebar */}
              <div className="w-64">
                <h2 className="flex justify-center">{unit}</h2>
                <div className="space-y-2 bg-gray-50 p-4 min-w-[200px] text-base rounded-md">
                  {
                    // ["Flat No 101", "Living Room", "Kitchen", "Bathroom"]
                    selectedRoomName.map((room) => (
                      <div
                        key={room}
                        className="flex items-center gap-2 relative mr-2"
                      >
                        {room === "Flat No 101" && (
                          <input
                            type="checkbox"
                            className="absolute left-0 top-1/2 transform -translate-y-1/2"
                            onChange={handleCheckboxChange}
                          />
                        )}
                        <button
                          key={room.id}
                          className={`px-4 py-2 rounded-md ${
                            selectedRoomId === room.id
                              ? "bg-blue-500 text-white w-full"
                              : "bg-gray-200 w-full"
                          }`}
                          onClick={() => handleRoomId(room.id)}
                        >
                          {room.name}
                        </button>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>

            {/* Checklist Table */}
            {selectedRoomId && (
              <div className="flex-1">
                <div className="bg-gray-50 rounded-lg">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left">
                        <th className="p-2 w-12"></th>{" "}
                        {/* Consistent padding */}
                        {/* <th className="p-2">Name</th> */}
                        <th className="p-2">Category</th>
                        <th className="p-2">Sub Category</th>
                        <th className="p-2">Stage</th>
                        <th className="p-2">Updated %</th>
                        <th className="p-2">Checkpoints</th>
                        <th className="p-2">No. Of Snags</th>
                        <th className="p-2 w-12">View</th>{" "}
                        {/* Consistent padding */}
                      </tr>
                    </thead>
                    <tbody>
                      {
                        // [
                        //   {
                        //     name: "Civil Walls Checklist",
                        //     category: "Civil",
                        //     points: 8,
                        //     snag: 4,
                        //   },
                        //   {
                        //     name: "Door Checklist",
                        //     category: "Civil",
                        //     points: 8,
                        //     snag: 4,
                        //   },
                        //   {
                        //     name: "Brick Masonry Checklist (Post)",
                        //     category: "Civil",
                        //     points: 5,
                        //     snag: 4,
                        //   },
                        // ]
                        filterRoomData.map((item) =>
                          item.checklists.map((cat, index) => (
                            <tr
                              key={`${item.room.id}-${cat.category.id}-${index}`}
                              className="border-t"
                            >
                              <td className="p-2"></td>
                              <td className="p-2">{cat.category.name}</td>
                              <td className="p-2">
                                {cat.subcategory
                                  .map((sub) => sub.name)
                                  .join(", ")}
                              </td>
                              <td className="p-2">
                                {cat.stages
                                  .map((stage) => stage.name)
                                  .join(", ")}
                              </td>
                              <td className="p-2 text-center">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-800 text-white">
                                  0%
                                </span>
                              </td>
                              <td className="p-2">
                                {cat.checklist_questions?.length || 0}
                              </td>
                              <td className="p-2">
                                {(cat.checklist_questions || []).reduce(
                                  (count, question) =>
                                    count +
                                    question.statuses.filter(
                                      (status) => status.submission === "N"
                                    ).length,
                                  0
                                )}
                              </td>
                              <td className="p-2">
                                <button
                                  onClick={() =>
                                    handleClick([cat.id], item.room.id)
                                  }
                                >
                                  <IoMdEye className="w-4 h-4 text-gray-600" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          {isHandover && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-lg w-1/3">
                <h2 className="text-xl font-semibold mb-4">Handover Details</h2>
                <div className="grid grid-cols-2 gap-4 items-center">
                  <label className="font-medium">Handover Date</label>

                  <label className="font-medium">Updated by</label>
                </div>

                <div className="flex flex-row space-x-4">
                  <div className="w-full h-11  border border-gray-300 rounded-lg p-2">
                    <input type="date" placeholder="Start Date" className="" />
                  </div>

                  <div className="w-full h-11  border border-gray-300 rounded-lg p-2">
                    Test
                  </div>
                </div>
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={() => setIshandover(false)} // Close the popup
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-2 rounded"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
          {isReport && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-lg w-1/3">
                <h2 className="text-lg font-semibold mb-4">
                  Selected checklist should be exported as:
                </h2>

                {/* Export Type */}
                <div className="mb-4">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="exportType"
                        value="pdf"
                        checked={exportType === "pdf"}
                        onChange={() => setExportType("pdf")}
                        className="mr-2"
                      />
                      PDF
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="exportType"
                        value="excel"
                        checked={exportType === "excel"}
                        onChange={() => setExportType("excel")}
                        className="mr-2"
                      />
                      Excel
                    </label>
                  </div>
                </div>

                {/* View Type */}
                <div className="mb-4">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="viewType"
                        value="condensed"
                        checked={viewType === "condensed"}
                        onChange={() => setViewType("condensed")}
                        className="mr-2"
                      />
                      Condensed View
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="viewType"
                        value="detailed"
                        checked={viewType === "detailed"}
                        onChange={() => setViewType("detailed")}
                        className="mr-2"
                      />
                      Detailed View
                    </label>
                  </div>
                </div>

                {/* Dropdowns */}
                <div className="grid gap-4">
                  {[
                    {
                      label: "Snag Type",
                      options: ["User Generated Snag", "Pre Configured Snag"],
                    },
                    {
                      label: "Points",
                      options: [
                        "Positive",
                        "Currently Negative",
                        "Unattempted",
                        "All Negative",
                      ],
                    },
                    {
                      label: "Category",
                      options: ["Civil", "Plumbing", "Electrical"],
                    },
                    {
                      label: "Sub-Category",
                      options: ["Flooring", "Finishing", "wooden Flooring"],
                    },
                    {
                      label: "Stage",
                      options: ["Stage 1", "Stage 2", "Stage 3"],
                    },
                  ].map(({ label, options }, idx) => (
                    <div key={idx}>
                      <label className="block text-sm font-medium mb-1">
                        {label}
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                        defaultValue="All"
                      >
                        <option value="All">All</option>
                        {options.map((option, i) => (
                          <option key={i} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    className="px-4 py-2 border rounded-lg text-gray-700 border-gray-300 hover:bg-gray-100 "
                    onClick={() => setReport(false)}
                  >
                    Cancel
                  </button>
                  <button className="px-4 py-2 rounded-lg text-white bg-purple-700 hover:bg-purple-800">
                    Export
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { RiArrowDropDownLine } from "react-icons/ri";
import { FaCamera } from "react-icons/fa";
import { MdMessage } from "react-icons/md";
import projectImage from "../Images/Project.png";
import { MdOutlineCancel } from "react-icons/md";
import { getRoomsWiseChecklist } from "../api";
import toast from "react-hot-toast";
import SiteBarHome from "./SiteBarHome";
export default function Checklist() {
  const [activeItem, setActiveItem] = useState(null);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [isMessage, setIsMessage] = useState(false);
  const [isImage, setImage] = useState(false);
  const [isImageOpen, setImageOpen] = useState(false); // Manage popup visibility
  const [comment, setComment] = useState("");
  const [isUser, setUser] = useState(false);
  const [isAdd, setAdd] = useState(false);
  const [roomName, setRoomName] = useState([]);
  const [stageName, setStageName] = useState([]);
  const [questionData, setQuestionData] = useState([]);
  const { id } = useParams();
  const checkListId = id;
  console.log("Checklist ID:", checkListId);

  const navigate = useNavigate();
  const { state } = useLocation();
  const room_id = state.roomId;
  console.log("Room ID:", room_id);
  useEffect(() => {
    const fetchRoomsWiseChecklist = async () => {
      try {
        const response = await getRoomsWiseChecklist(checkListId, room_id);
        setQuestionData(
          response.data.data[0].checklist_id.checklist_questions.map(
            (item) => item.question
          )
        );
        setRoomName(response.data.data[0].checklist_id.room.name);
        setStageName(response.data.data[0].checklist_id.stages[0].name);
      } catch (error) {
        toast.error(error.response.data.message);
      }
    };
    fetchRoomsWiseChecklist();
  }, [checkListId, room_id]);
  const inspectionItems = [
    "Carpet area not as per drawing",
    "Non-uniform/chipped/cracks in plaster on walls/ceiling",
    "Seepage marks or dampness found on walls or ceiling",
    "Hollowness in plaster",
    "Filling around Door/Window frames not done/cracks found",
    "Wall angles/Frames not perpendicular",
  ];

  const expandedData = [
    { role: "Inspector", mark: "Pass", name: "John Smith", date: "17/08/22" },
    { role: "Repairer", mark: "Done", name: "John Doe", date: "18/08/22" },
    { role: "Reviewer", mark: "Verify", name: "Jane Smith", date: "19/08/22" },
    { role: "Verifier", mark: "Accept", name: "Mike Brown", date: "20/08/22" },
  ];
  const projects = [
    { name: "Prime Core", image: projectImage, id: 1 },
    { name: "Vision Venture", image: projectImage, id: 2 },
    { name: "Civil Connect", image: projectImage, id: 3 },
    { name: "Unity Hub", image: projectImage, id: 4 },
    { name: "Social Circle", image: projectImage, id: 5 },
  ];
  const stages = [
    { title: "Initiator", name: "Test1 Insp1" },
    { title: "Inspect", name: "Test1 Insp1" },
    { title: "Repair", name: "Test1 Repairer" },
    { title: "Review", name: "Test1 Reviewer" },
  ];

  const toggleAccordion = (index) => {
    setActiveItem(activeItem === index ? null : index);
  };

  const handleBack = () => {
    navigate(-1); // Navigate to the previous page
  };

  const handleMessageClick = () => {
    setIsMessageOpen(true); // Open the comment popup
  };
  const handleClick = () => {
    setIsMessage(true); // Open the comment popup
  };
  const handleImage = () => {
    setImage(true); // Open the comment popup
  };
  const handleImageOpen = () => {
    setImageOpen(true);
  };

  const handleUser = () => {
    setUser(true); // Open the comment popup
  };

  const handleSaveComment = () => {
    // You can add logic to save or process the comment here.
    console.log("Comment Saved:", comment);
    setIsMessageOpen(false); // Close the popup after saving the comment
  };
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const preview = document.getElementById("imagePreview");
    const placeholder = document.getElementById("imagePlaceholder");

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.src = e.target.result;
        preview.style.display = "block";
        placeholder.style.display = "none";
      };
      reader.readAsDataURL(file);
    } else {
      preview.src = "";
      preview.style.display = "none";
      placeholder.style.display = "block";
    }
  };

  return (
    <div className="flex">
      <SiteBarHome />
      <div className="my-5 w-[85%] mt-5 ml-[16%] mr-[1%]">
        <div className="px-6 pt-3 pb-5 max-w-7xl mx-auto bg-white rounded shadow-lg">
          {/* <button
            className="px-4 py-2 mb-4 bg-gray-100 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
            onClick={handleBack}
          >
            &larr; Back
          </button> */}
          <div className="flex">
            {/* Sidebar */}
            <div className="w-64 flex-shrink-0">
              <h3 className="text-purple-800 mb-4 text-lg">Rooms</h3>
              <div className="bg-purple-50 text-purple-800 rounded-lg p-4 shadow-sm">
                {roomName}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 pl-6">
              <div className="flex justify-between items-center mb-6 gap-1">
                <span className="text-lg font-semibold text-gray-900 gap-x-5">
                  Checklist Finishes Checklist
                </span>
                <button
                  className="bg-purple-800 hover:bg-purple-900 text-white py-2 px-4 rounded"
                  onClick={handleUser}
                >
                  Users Associated
                </button>
              </div>
              <div className="text-gray-500 mb-4">{stageName}</div>

              {/* Accordion */}
              <div className="space-y-2">
                {
                  // inspectionItems
                  questionData.map((item, index) => (
                    <div
                      key={index}
                      className={`border rounded-lg bg-white shadow-sm ${
                        activeItem === index ? "border-purple-800" : ""
                      }`}
                    >
                      {/* Main Row */}
                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="text-purple-800 font-medium">
                          {item}
                        </div>
                        <div className="flex items-center gap-6">
                          {/* Camera Icon */}
                          <FaCamera
                            size={15}
                            className={`cursor-pointer ${
                              activeItem === index
                                ? "hidden"
                                : "text-gray-600 hover:text-purple-800"
                            }`}
                            onClick={handleImageOpen}
                          />
                          <MdMessage
                            size={15}
                            className={`cursor-pointer ${
                              activeItem === index
                                ? "hidden"
                                : "text-gray-600 hover:text-purple-800"
                            }`}
                            onClick={handleMessageClick} // Open popup on clicking message icon
                          />
                          {/* Dropdown Arrow Icon */}
                          <RiArrowDropDownLine
                            size={35}
                            className={`cursor-pointer transform transition-transform ${
                              activeItem === index
                                ? "text-purple-800 rotate-180"
                                : "text-purple-800"
                            }`}
                            onClick={() => toggleAccordion(index)}
                          />
                        </div>
                      </div>

                      {/* Expanded Row */}
                      {activeItem === index && (
                        <div className="px-4 pb-3">
                          <div className="border-l-4 border-black border-dotted pl-4">
                            <div className="space-y-4">
                              {expandedData.map((data, i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-between gap-8"
                                >
                                  {/* Role, Name, Date */}
                                  <div className="flex items-center gap-8">
                                    <span className="text-gray-800 font-medium min-w-[120px]">
                                      {data.role}
                                    </span>
                                    <span className="text-gray-800 font-medium min-w-[120px]">
                                      {data.mark}
                                    </span>
                                    <span className="font-semibold text-gray-700 min-w-[150px]">
                                      {data.name}
                                    </span>
                                    <span className="font-semibold text-gray-700 min-w-[120px]">
                                      {data.date}
                                    </span>
                                    <span className="font-semibold text-gray-700 min-w-[120px]">
                                      <FaCamera
                                        className="text-purple-800 cursor-pointer"
                                        size={15}
                                        onClick={handleImage}
                                      />
                                    </span>
                                    <span className="font-semibold text-gray-700 min-w-[120px]">
                                      <MdMessage
                                        className="text-purple-800 cursor-pointer"
                                        size={15}
                                        onClick={handleClick}
                                      />
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                }
              </div>
            </div>
          </div>

          {/* Popup Modal for Message */}
          {isMessageOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-lg w-1/3">
                <h2 className="text-xl font-semibold mb-4">Add Comment</h2>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full h-32 border border-gray-300 rounded-lg p-2"
                  placeholder="Enter your comment here..."
                />
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={handleSaveComment}
                    className="bg-purple-800 hover:bg-purple-900 text-white py-2 px-4 rounded"
                  >
                    Save Comment
                  </button>
                  <button
                    onClick={() => setIsMessageOpen(false)} // Close the popup
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
          {isImageOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-lg w-1/3">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Upload Image</h2>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setImageOpen(false)}
                  >
                    <MdOutlineCancel size={24} />
                  </button>
                </div>

                {/* Image Upload Section */}
                <form className="space-y-4">
                  <div className="flex flex-col items-center">
                    {/* Image Preview Placeholder */}
                    <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-100 mb-4">
                      <img
                        id="imagePreview"
                        alt="Preview"
                        className="max-w-full max-h-full object-cover hidden"
                      />
                      <span
                        className="text-gray-400 text-sm"
                        id="imagePlaceholder"
                      >
                        No Image
                      </span>
                    </div>

                    {/* File Input */}
                    <input
                      type="file"
                      accept="image/*"
                      className="block w-full text-sm text-gray-500 file:py-2 file:px-4 file:rounded-lg file:border file:border-gray-300 file:bg-gray-200 file:hover:bg-gray-300"
                      onChange={(e) => handleImageUpload(e)}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-purple-700 text-white py-2 px-4 rounded hover:bg-purple-800 transition duration-200"
                  >
                    Upload
                  </button>
                </form>
              </div>
            </div>
          )}

          {isMessage && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-lg w-1/3">
                <h2 className="text-xl font-semibold mb-4">Add Comment</h2>
                <div className="w-full h-11  border border-gray-300 rounded-lg p-2">
                  Test
                </div>

                <div className="flex gap-4 mt-4">
                  <button
                    onClick={() => setIsMessage(false)} // Close the popup
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-2 rounded"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {isImage && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-lg w-1/3">
                <h2 className="text-xl font-semibold mb-4">Attachments</h2>

                <div className="flex flex-row gap-10 mb-4">
                  {/* Image 1 */}
                  <img
                    src={projectImage} // Replace with the URL of your image
                    alt="Attachment 1"
                    className="w-32 h-32"
                  />

                  {/* Image 2 */}
                  <img
                    src={projectImage} // Replace with the URL of your image
                    alt="Attachment 1"
                    className="w-32 h-32"
                  />
                </div>

                <div className="flex gap-4 mt-4">
                  <button
                    onClick={() => setImage(false)} // Close the popup
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
          {isUser && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
              <div className="p-4 bg-white relative rounded-lg shadow-lg">
                {/* Close Button in Top Right */}
                <button
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                  onClick={() => setUser(false)}
                >
                  <MdOutlineCancel size={24} />
                </button>

                <h2 className="text-xl font-bold text-center">
                  User Associated
                </h2>

                <div className="mt-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t-4 border-green-500" />
                    </div>
                    <span className="relative text-lg font-semibold text-green-500 bg-white px-2">
                      Stage 1
                    </span>
                  </div>

                  <div className="mt-6 grid grid-cols-4 gap-4">
                    {stages.map((stage, index) => (
                      <div key={index} className="p-4 bg-pink-100 rounded-md">
                        <h4 className="text-center text-sm font-medium text-gray-500">
                          {stage.title}
                        </h4>
                        <input
                          type="text"
                          value={stage.name}
                          readOnly
                          className="mt-2 w-full text-center bg-white border border-gray-300 rounded-md text-pink-700 font-semibold"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import projectImage from "../Images/Project.png";
import { getProjectLevelDetails } from "../api";
import toast from "react-hot-toast";
import SiteBarHome from "./SiteBarHome";
import axios from "axios";

const ProjectDetailsPage = () => {
  const { id: projectIdFromUrl } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const projectFromState = location.state?.project;
  const projectId =
    projectFromState?.id || projectFromState?.project_id || projectIdFromUrl;

  const projectImg = projectFromState?.image_url || projectImage;
  const [projectLevelData, setProjectLevelData] = useState([]);

  useEffect(() => {
    if (!projectId) {
      // Redirect to home if no project id found
      navigate("/");
      return;
    }
    const fetchProjectTower = async () => {
  try {
    const token = localStorage.getItem("ACCESS_TOKEN");
    console.log("📦 Project ID:", projectId);
    console.log("🔐 ACCESS_TOKEN:", token);

    const response = await axios.get(
      `https://konstruct.world/projects/buildings/by_project/${projectId}/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200 && Array.isArray(response.data)) {
  setProjectLevelData(response.data);
} else {
  setProjectLevelData([]); // fallback to empty list
  toast.error("Invalid or empty response from server.");
}

  } catch (error) {
    console.error("❌ API fetch failed:", error);
    toast.error("Something went wrong while fetching project levels.");
  }
};

fetchProjectTower();
}, [projectId, navigate]);

  const handleImageClick = (proj) => {
    navigate(`/Level/${proj}`, {
      state: { projectLevelData },
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  // If you want to fetch the project name from the backend if not present in state,
  // you could do that here as well (optional improvement)

  return (
    <div className="flex">
      <SiteBarHome />
      <div className="my-5 w-[85%] mt-5 ml-[16%] mr-[1%]">
        <div className="max-w-7xl mx-auto pt-3 px-5 pb-8 bg-white rounded shadow-lg">
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-center text-purple-800 mb-4 ">
              {projectFromState?.project_name || `Project ${projectId}`}
            </h2>
          </div>
          <div>
            {projectLevelData && projectLevelData.length > 0 ? (
              <div className="grid grid-cols-5 gap-6">
                {projectLevelData.map((proj) => (
                  <div
                    key={proj.id}
                    className={`relative bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer ${
                      proj.id === projectId ? "ring-4 ring-purple-50" : ""
                    }`}
                    onClick={() => handleImageClick(proj.id)}
                  >
                    <img
                      src={projectImg}
                      alt={`${
                        proj.name || proj.naming_convention || "Project"
                      } Background`}
                      className="w-full h-80"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-50 text-white text-sm font-semibold p-2">
                      {proj.name}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 text-lg font-semibold mt-10">
                No projects available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { getFloorDetails } from "../api";
import SiteBarHome from "./SiteBarHome";
export default function Snagging() {
  const [floorData, setFloorData] = useState([]);
  const floors = ["6th", "5th", "4th", "3rd", "2nd", "1st"];
  const units = ["101", "102", "103", "104", "105", "106"];
  const [isLegends, setIsLegends] = useState(false);
  const { id } = useParams();
  console.log("line 10", id);
  useEffect(() => {
    const fetchFloor = async () => {
      const response = await getFloorDetails(id);
      console.log(response.data);
      console.log();
      if (response.status === 200) {
        setFloorData(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    };

    fetchFloor();
  }, [id]);

  console.log("line 25", floorData);
  const navigate = useNavigate();
  const { state } = useLocation();
  console.log(state);
  const towerName = state.projectLevelData?.map(
    (item) => item.naming_convention
  );
  const handleClick = (unitId, projectId) => {
    console.log(projectId);
    navigate(`/checklistfloor/${unitId}`, {
      state: { projectId },
    });
  };

  const handleBack = () => {
    navigate(-1); // Navigate to the previous page
  };

  return (
    <div className="flex">
      <SiteBarHome />
      <div className="my-5 w-[85%] mt-5 ml-[16%] mr-[1%]">
        <div className="max-w-7xl mx-auto pt-3 px-5 pb-8 bg-white rounded shadow-lg">
          {/* Header Section */}
          <div className="flex justify-between">
            {/* <button
              className="px-4 py-2 mb-4 bg-gray-100 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
              onClick={handleBack}
            >
              &larr; Back
            </button> */}
            <h2 className="text-xl font-medium text-purple-600 mb-3">
              {/* Tower : B */}
              {towerName}
            </h2>
            <div className="justify-end">
              <button
                className="text-sm font-semibold mb-4 mr-4"
                onClick={() => setIsLegends(!isLegends)}
              >
                Legends
              </button>
            </div>
          </div>
          {isLegends && (
            <div className="flex mb-4 mr-5 gap-x-8 justify-end">
              <span className="flex items-center">
                <span className="w-4 h-4 bg-orange-500 rounded"></span> Stage 1
              </span>
              <span className="flex items-center">
                <span className="w-4 h-4 bg-purple-500 rounded"></span> Stage 2
              </span>
              <span className="flex items-center">
                <span className="w-4 h-4 bg-black rounded"></span> Stage 3
              </span>
              <span className="flex items-center">
                <span className="w-4 h-4 bg-fuchsia-500 rounded"></span> FM
              </span>
            </div>
          )}
          {/* Tower Section */}
          <div>
            {floorData && floorData.length > 0 ? (
              <div>
                <div className="flex">
                  {/* Floor Numbers */}
                  <div className="bg-gray-50 p-3 min-w-[150px] rounded-md">
                    {floorData.map((floor) => (
                      <div
                        key={floor}
                        className="h-12 flex items-center justify-center text-sm"
                      >
                        {floor.level_name}
                      </div>
                    ))}
                  </div>

                  {/* Units Grid */}
                  {/* <div className="flex-1 p-4 ">
            {floorData.map((floor) => (
              <div key={floor} className="flex flex-wrap gap-4 h-12">
                {units.map((unit) => (
                  <div
                    key={`${floor}-${unit}`}
                    className="border  border-gray-300 w-32  gap-6 flex items-center justify-center text-sm mb-4"
                    onClick={handleClick}
                  >
                    {unit}
                  </div>
                ))}
              </div>
            ))}
          </div> */}
                  <div className="flex-1 p-4">
                    {floorData.map((floor) => (
                      <div key={floor.id} className="flex flex-wrap gap-4 h-12">
                        {floor.units.map((unit) => (
                          <div
                            key={unit.id}
                            className="border border-gray-300 w-32 gap-6 flex items-center justify-center text-sm mb-4"
                            onClick={() =>
                              handleClick(unit.id, unit.flat_type.project_id)
                            }
                            style={{ background: unit.color }}
                          >
                            {unit.unit_name}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">
                No data available
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

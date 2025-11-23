import { useEffect, useState } from "react";
import Select from "react-select";
import { useSelector } from "react-redux";
import {
  createChecklistMapping,
  getFlatTypes,
  getChecklistMappingDetails,
  getSubCategoryChecklist,
} from "../../api";
import { toast } from "react-hot-toast";

const ChecklistMapping = ({
  setMappingSelectedId,
  categoryOptions,
  subCategoryOptions,
}) => {
  const rooms = useSelector((state) => state.user.rooms);
  const projectId = useSelector((state) => state.user.selectedProject.id);
  const stages = useSelector((state) => state.user.stages[projectId]);
  const organizationId = useSelector((state) => state.user.organization.id);

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedSubCategoryOptions, setSelectedSubCategoryOptions] = useState(
    []
  );
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [selectedStageId, setSelectedStageId] = useState([]);
  // const handleCategoryChange = (e) => {
  //   setSelectedCategoryId(e.target.value);
  //   const subCategoryOptionsFiltered = subCategoryOptions
  //     .filter(
  //       (option) =>
  //         option.category_id?.toString() === e.target.value?.toString()
  //     )
  //     .map((option) => ({
  //       value: option.id,
  //       label: option.sub_category,
  //     }));
  //   console.log("line 35", subCategoryOptions);
  //   setSelectedSubCategoryOptions(subCategoryOptionsFiltered);
  //   setSelectedSubCategoryId([]);
  // };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategoryId(categoryId);
    console.log("line 47", categoryId);
    fetchSubCategory(categoryId);
  };

  const handleSubCategoryChange = (e) => {
    console.log(e, "E");
    setSelectedSubCategoryId([...e]);
  };

  const handleRoomChange = (e) => {
    setSelectedRoomId(e.target.value);
  };

  const formattedStageOptions = stages.map((stage) => ({
    value: stage.id,
    label: stage.stage,
  }));

  const [flatRoomTypes, setRoomFlatTypes] = useState([]);
  useEffect(() => {
    const fetchFlatTypes = async () => {
      try {
        const response = await getFlatTypes(projectId);
        console.log("line 60", response);
        const allRooms = response.data.data.flatMap((flat) =>
          flat.room_ids.map((id, index) => ({
            id,
            name: flat.room_types[index],
          }))
        );
        const uniqueRooms = Array.from(
          new Map(allRooms.map((room) => [room.id, room])).values()
        );
        console.log(uniqueRooms);
        setRoomFlatTypes(uniqueRooms); // Assuming response contains flat types data
      } catch (error) {
        console.error("Error fetching flat types:", error);
      }
    };

    if (projectId) {
      fetchFlatTypes();
    }
    getChecklistMapping();
  }, [projectId]);
  console.log("line 93", flatRoomTypes);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [subCategoryId, setSubCategoryId] = useState([]);
  const [subCateData, setSubCateData] = useState([]);
  const handleSubCateChange = (selectedOptions) => {
    console.log("line 98", selectedOptions);
    setSubCategoryId(selectedOptions);
  };
  const fetchSubCategory = async (cateId) => {
    console.log(cateId);
    try {
      const response = await getSubCategoryChecklist(cateId);
      const subCateName = response.data.map((item) => ({
        value: item.id,
        label: `${item.name} (${item.question ? item.question.length : 0})`,
      }));
      console.log("line 140", subCateName);
      setSubCateData(subCateName);
    } catch (error) {
      console.log(error, "Error");
      toast.error(error.response.data.message);
    }
  };

  console.log(subCategoryId);
  const handleCreateChecklistMapping = async () => {
    const checklistMappingData = {
      category_id: Number(selectedCategoryId),
      // sub_category_ids: selectedSubCategoryId.map(
      //   (subCategory) => subCategory.value
      // ),
      checklist_ids: subCategoryId.map((subCategory) => subCategory.value),
      stage_ids: selectedStageId.map((stage) => stage.value),
      project_id: Number(projectId),
      organization_id: Number(organizationId),
      room_id: Number(selectedRoom),
    };
    console.log(checklistMappingData, "Checklist Mapping Data");

    // setMappingSelectedId(null);

    try {
      const response = await createChecklistMapping(checklistMappingData);
      console.log(response, "Response");
      toast.success(response.data.message);
      setSelectedCategoryId(null);
      // setSelectedSubCategoryId([]);
      setSelectedStageId([]);
      setSelectedRoom("");
      getChecklistMapping();
    } catch (error) {
      console.log(error, "Error");
      toast.error(error.response.data.message);
    }
  };
  const [mappingData, setMappingData] = useState([]);
  const getChecklistMapping = async () => {
    const response = await getChecklistMappingDetails(projectId);
    console.log("line 118", response.data);
    if (response.status === 200) {
      setMappingData(response.data);
    } else {
      toast.error(response.data.message);
    }
  };
  console.log(mappingData);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Checklist Mapping</h1>
        <button
          className="bg-purple-700 text-white px-4 py-2 rounded"
          onClick={() => setMappingSelectedId(null)}
        >
          Back
        </button>
      </div>
      <div className="flex gap-4 items-center justify-center">
        {/* <select
          className="w-full p-2 mt-1 border border-gray-300 rounded"
          value={selectedRoomId}
          onChange={handleRoomChange}
        >
          <option>Select Rooms</option>
          {rooms.map((option) => (
            <option key={option.id} value={option.id}>
              {option.room_type}
            </option>
          ))}
        </select> */}
        <select
          className="w-full p-2 mt-1 border border-gray-300 rounded"
          onChange={(e) => setSelectedRoom(e.target.value)}
          value={selectedRoom}
        >
          <option value="">Select Room</option>
          {flatRoomTypes.map((flat) => (
            <option key={flat.id} value={flat.id}>
              {flat.name}
            </option>
          ))}
        </select>
        <select
          className="w-full p-2 mt-1 border border-gray-300 rounded"
          value={selectedCategoryId}
          onChange={handleCategoryChange}
        >
          <option>Select Category</option>
          {categoryOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.category}
            </option>
          ))}
        </select>
        {/* <Select
          isMulti
          options={selectedSubCategoryOptions}
          value={selectedSubCategoryId}
          onChange={(e) => handleSubCategoryChange(e)}
          placeholder="Select up to 15 Options"
          className="w-full"
          classNamePrefix="select"
          readOnly
        /> */}
        <Select
          isMulti
          options={subCateData}
          value={subCategoryId}
          onChange={(e) => handleSubCateChange(e)}
          placeholder="Select up to 15 Options"
          className="w-full"
          classNamePrefix="select"
          readOnly
        />
      </div>
      <div className="flex flex-col gap-4 items-start justify-center mt-6">
        <label className="text-sm font-bold">Associate Stage</label>
        <Select
          isMulti
          options={formattedStageOptions}
          value={selectedStageId}
          onChange={(e) => setSelectedStageId(e)}
          placeholder="Select up to 15 Options"
          className="w-full"
          classNamePrefix="select"
          readOnly
        />
      </div>
      <div className="flex gap-4 items-center justify-center mt-6">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleCreateChecklistMapping}
        >
          Complete Mapping
        </button>
      </div>

      <table className="min-w-full bg-white shadow rounded my-5">
        <thead className="bg-gray-200">
          <tr>
            <th className="font-semibold p-2 text-left">Room</th>
            <th className="font-semibold p-2 text-left">Category</th>
            <th className="font-semibold p-2 text-left">Subcategory</th>
            <th className="font-semibold p-2 text-left">Stage</th>
            <th className="font-semibold p-2 text-left">ID</th>
          </tr>
        </thead>
        <tbody>
          {mappingData?.map((item, index) => (
            <tr key={index} className="border-t">
              <td className="p-2">{item.room?.name || "N/A"}</td>
              <td className="p-2">{item.category?.name || "N/A"}</td>
              <td className="p-2">{item.sub_categories.name || "N/A"}</td>
              <td className="p-2">
                {item.stages?.map((stage) => stage.name).join(", ") || "N/A"}
              </td>
              <td className="p-2 whitespace-nowrap">
                {item.checklists.map((checklist) => checklist.id).join(",") ||
                  "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ChecklistMapping;

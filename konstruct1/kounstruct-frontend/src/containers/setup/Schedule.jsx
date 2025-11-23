import React, { useState } from "react";

function Schedule() {
  const [selectedLevel, setSelectedLevel] = useState("Question Level");

  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = () => {
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
          <button className="bg-gray-400 text-white px-4 py-2 mt-2 rounded-md">
            Previous
          </button>
          <button
            onClick={handleSubmit}
            className="bg-green-500 text-white px-4 py-2 rounded-md"
          >
            Submit
          </button>

          {successMessage && (
            <div className="mt-4 text-green-600 font-semibold">
              {successMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Schedule;

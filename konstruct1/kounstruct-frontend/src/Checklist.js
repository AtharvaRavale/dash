import React, { useState } from "react";

const ChecklistForm = () => {
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [checklistTitle, setChecklistTitle] = useState("");
  const [questions, setQuestions] = useState([
    { question: "", mandatory: false, imageRequired: false },
  ]);
  const [numOfQuestions, setNumOfQuestions] = useState(1);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", mandatory: false, imageRequired: false },
    ]);
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-md">
      <h1 className="text-xl font-semibold mb-4">Add Checklist</h1>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-gray-700">Category</label>
          <select
            className="w-full p-2 mt-1 border border-gray-300 rounded"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Select Category</option>
            <option value="category1">Category 1</option>
            <option value="category2">Category 2</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700">Sub Category</label>
          <select
            className="w-full p-2 mt-1 border border-gray-300 rounded"
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
          >
            <option>Select Sub-Category</option>
            <option value="sub1">Sub 1</option>
            <option value="sub2">Sub 2</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700">Title of the Checklist</label>
          <input
            type="text"
            className="w-full p-2 mt-1 border border-gray-300 rounded"
            value={checklistTitle}
            onChange={(e) => setChecklistTitle(e.target.value)}
            placeholder="Enter the title"
          />
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Add Questions</h2>
        <div className="grid grid-cols-6 gap-4 mb-4">
          <label className="col-span-2">Add No. of Questions</label>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded col-span-1"
            min={1}
            value={numOfQuestions}
            onChange={(e) => setNumOfQuestions(e.target.value)}
          />
          <button
            onClick={handleAddQuestion}
            className="bg-purple-600 text-white p-2 rounded col-span-2"
          >
            Add More
          </button>
        </div>

        {questions.map((q, index) => (
          <div key={index} className="flex items-center gap-4 mb-4">
            <input
              type="text"
              placeholder="Enter your question"
              className="w-full p-2 border border-gray-300 rounded"
              value={q.question}
              onChange={(e) =>
                handleQuestionChange(index, "question", e.target.value)
              }
            />
            <div className="flex items-center gap-2">
              <label>Question Mandatory</label>
              <input
                type="checkbox"
                checked={q.mandatory}
                onChange={(e) =>
                  handleQuestionChange(index, "mandatory", e.target.checked)
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <label>Image Mandatory</label>
              <input
                type="checkbox"
                checked={q.imageRequired}
                onChange={(e) =>
                  handleQuestionChange(index, "imageRequired", e.target.checked)
                }
              />
            </div>
            <button
              className="text-red-600"
              onClick={() =>
                setQuestions(questions.filter((_, qIndex) => qIndex !== index))
              }
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <button className="bg-purple-700 text-white p-3 rounded">
          Create Checklist
        </button>
        <button className="bg-gray-500 text-white p-3 rounded">Proceed</button>
      </div>
    </div>
  );
};

export default ChecklistForm;

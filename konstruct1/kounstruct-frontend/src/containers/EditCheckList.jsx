import React, { useState, useEffect } from "react";
import { MdDelete, MdAdd } from "react-icons/md";
import { useSelector } from "react-redux";
import { createChecklist, updateChecklist } from "../../src/api/index";
import { toast } from "react-hot-toast";

const EditCheckList = ({
  setShowForm,
  categoryOptions,
  subCategoryOptions,
  checklist,
}) => {
  const organizationId = useSelector((state) => state.user.organization.id);

  const [isEdit, setIsEdit] = useState(checklist?.group_id ? true : false);
  console.log(checklist, "CHECKLIST", subCategoryOptions);
  const [category, setCategory] = useState(
    isEdit ? checklist?.checklist_category_id : ""
  );
  const [subCategory, setSubCategory] = useState(
    isEdit ? checklist?.checklist_sub_category_id : ""
  );
  const [options, setOptions] = useState([{ value: "", submission: "P" }]);
  const [questions, setQuestions] = useState(
    isEdit
      ? checklist?.questions
      : [
          {
            question: "",
            options: [],
          },
        ]
  );
  const [numOfQuestions, setNumOfQuestions] = useState(1);
  const [subCategoryOptionsFiltered, setSubCategoryOptionsFiltered] = useState(
    []
  );

  useEffect(() => {
    if (isEdit) {
      console.log(
        subCategoryOptions.filter(
          (option) =>
            option.category_id.toString() === checklist?.checklist_category_id
        ),
        "SUB CATEGORY OPTIONS FILTERED"
      );
      setSubCategoryOptionsFiltered(
        subCategoryOptions.filter(
          (option) =>
            option.category_id.toString() ===
            checklist?.checklist_category_id.toString()
        )
      );
    }
  }, [isEdit, checklist, subCategoryOptions]);

  const handleAddQuestion = () => {
    const updatedQuestions = [...questions];

    // Create separate question objects for each new question
    for (let i = 0; i < numOfQuestions; i++) {
      const newQuestion = {
        question: "",
        options: options
          .filter((option) => option.value !== "")
          .map((opt) => ({ ...opt })),
      };
      updatedQuestions.push(newQuestion);
    }

    setQuestions(updatedQuestions);
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    // Create a new object for the specific question being updated
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    };
    setQuestions(updatedQuestions);
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
    const subCategoryOptionFilteredData = subCategoryOptions.filter(
      (option) => option?.category_id?.toString() === value?.toString()
    );
    console.log(subCategoryOptionFilteredData, "SUB CATEGORY OPTION FILTERED");
    setSubCategoryOptionsFiltered(subCategoryOptionFilteredData);
  };

  const handleAddOption = () => {
    setOptions([...options, { value: "", submission: "P" }]);
  };

  const handleOptionChange = (index, field, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = {
      ...updatedOptions[index],
      [field]: value,
    };
    setOptions(updatedOptions);
  };

  const handleQuestionOptionChange = (
    questionIndex,
    field,
    value,
    optionIndex
  ) => {
    console.log(questionIndex, optionIndex, value, field, "QUESTIONS");
    const updatedQuestions = [...questions];
    if (!updatedQuestions[questionIndex].options) {
      updatedQuestions[questionIndex].options = [];
    }
    const updatedOption = {
      ...updatedQuestions[questionIndex].options[optionIndex],
      [field]: value,
    };
    updatedQuestions[questionIndex].options = [
      ...updatedQuestions[questionIndex].options.slice(0, optionIndex),
      updatedOption,
      ...updatedQuestions[questionIndex].options.slice(optionIndex + 1),
    ];

    setQuestions(updatedQuestions);
  };

  const handleQuestionOptionAdd = (index) => {
    const updatedQuestions = [...questions];
    const newOption = { value: "", submission: "P" };

    // Add new option only to this specific question
    if (!updatedQuestions[index].options) {
      updatedQuestions[index].options = [];
    }

    updatedQuestions[index].options = [
      ...updatedQuestions[index].options,
      { ...newOption },
    ];

    setQuestions(updatedQuestions);
  };

  const handleQuestionOptionRemove = (index, optionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].options.splice(optionIndex, 1);
    setQuestions(updatedQuestions);

    // Remove from main options if this was the last question using it
    const isOptionUsedElsewhere = questions.some(
      (q, qIndex) => index !== qIndex && q.options[optionIndex]
    );

    if (!isOptionUsedElsewhere) {
      const updatedOptions = [...options];
      updatedOptions.splice(optionIndex, 1);
      setOptions(updatedOptions);
    }
  };

  const handleAddQuestionOptionUpdate = () => {
    // First, filter out any empty options
    const validOptions = options.filter((opt) => opt.value !== "");

    // Update all questions with the valid options
    const updatedQuestions = questions.map((question) => ({
      ...question,
      options: validOptions.map((opt) => ({ ...opt })),
    }));

    console.log("Updating questions with options:", validOptions);
    setQuestions(updatedQuestions);
  };

  const handleCreateChecklist = async () => {
    // Validate category and subcategory
    if (!category) {
      toast.error("Please select a category");
      return;
    }
    if (!subCategory) {
      toast.error("Please select a sub-category");
      return;
    }

    // Validate options
    const validOptions = options.filter((opt) => opt.value.trim() !== "");
    if (validOptions.length === 0) {
      toast.error("Please add at least one option");
      return;
    }

    // Validate questions
    const invalidQuestions = questions.filter((q) => !q.question.trim());
    if (invalidQuestions.length > 0) {
      toast.error(
        `Please fill in all question fields (${invalidQuestions.length} empty questions found)`
      );
      return;
    }

    // Validate that each question has options
    const questionsWithoutOptions = questions.filter(
      (q) => !q.options || q.options.length === 0
    );
    if (questionsWithoutOptions.length > 0) {
      toast.error(
        `Some questions don't have any options. Please add options to all questions.`
      );
      return;
    }

    // Validate that all options in questions have values
    const questionsWithInvalidOptions = questions.filter((q) =>
      q.options.some((opt) => !opt.value.trim())
    );
    if (questionsWithInvalidOptions.length > 0) {
      toast.error(
        "Some questions have empty options. Please fill in all option values."
      );
      return;
    }

    const checklistData = {
      checklist_category_id: category,
      checklist_sub_category_id: subCategory,
      checklist_questions: questions,
      organization_id: organizationId,
    };

    try {
      const response = await createChecklist(checklistData);
      console.log(response, "RESPONSE");
      if (response.status === 200 || response.data.success) {
        toast.success(response.data.message);
        setShowForm(false);
      } else {
        toast.error(response.data.message || "Failed to create checklist");
      }
    } catch (error) {
      console.error("Error creating checklist:", error);
      toast.error("Failed to create checklist. Please try again.");
    }
  };

  const handleUpdateChecklist = async () => {
    console.log("Updating checklist");

    // Validate category and subcategory
    if (!category) {
      toast.error("Please select a category");
      return;
    }
    if (!subCategory) {
      toast.error("Please select a sub-category");
      return;
    }

    // Validate questions
    const invalidQuestions = questions.filter((q) => !q.question.trim());
    if (invalidQuestions.length > 0) {
      toast.error(
        `Please fill in all question fields (${invalidQuestions.length} empty questions found)`
      );
      return;
    }

    // Validate that each question has options
    const questionsWithoutOptions = questions.filter(
      (q) => !q.options || q.options.length === 0
    );
    if (questionsWithoutOptions.length > 0) {
      toast.error(
        `Some questions don't have any options. Please add options to all questions.`
      );
      return;
    }

    // Validate that all options in questions have values
    const questionsWithInvalidOptions = questions.filter((q) =>
      q.options.some((opt) => !opt.value.trim())
    );
    if (questionsWithInvalidOptions.length > 0) {
      toast.error(
        "Some questions have empty options. Please fill in all option values."
      );
      return;
    }

    const updatedQuestion = [];

    questions.forEach((question) => {
      checklist.questions.forEach((checklistQuestion) => {
        if (checklistQuestion.id === question.id) {
          updatedQuestion.push({
            ...question,
            id: checklistQuestion.id,
          });
        }
      });
    });

    console.log(checklist, "CHECKLIST UPDATE");

    const checklistData = {
      group_id: checklist?.random_num,
      checklist_category_id: category,
      checklist_sub_category_id: subCategory,
      checklist_questions: updatedQuestion,
      organization_id: organizationId,
    };

    console.log(checklistData, "CHECKLIST DATA");

    try {
      const response = await updateChecklist(checklistData);
      console.log(response, "RESPONSE");
      if (response.status === 200 || response.data.success) {
        toast.success(response.data.message);
        setShowForm(false);
      } else {
        toast.error(response.data.message || "Failed to update checklist");
      }
    } catch (error) {
      console.error("Error updating checklist:", error);
      toast.error("Failed to update checklist. Please try again.");
    }
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold mb-4">Edit Checklist</h1>
        {/* <button
          className="bg-purple-700 text-white p-2 rounded"
          onClick={() => setShowForm(false)}
        >
          Back
        </button> */}
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-gray-700">Category</label>
          <select
            className="w-full p-2 mt-1 border border-gray-300 rounded"
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option>Select Category</option>
            {categoryOptions?.map((option) => (
              <option key={option.id} value={option.id}>
                {option.category}
              </option>
            ))}
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
            {subCategoryOptionsFiltered?.map((option) => (
              <option key={option.id} value={option.id}>
                {option.sub_category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!isEdit && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Add Options</h2>

          <div className="flex items-center justify-between gap-2 flex-wrap">
            {options.map((option, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-2 border border-gray-300 rounded-md p-2"
              >
                <input
                  type="text"
                  placeholder="Add Option"
                  className="w-full outline-none focus:outline-none border-none appearance-none active:outline-none"
                  value={option.value}
                  onChange={(e) =>
                    handleOptionChange(index, "value", e.target.value)
                  }
                  onBlur={handleAddQuestionOptionUpdate}
                />
                <select
                  value={option.submission}
                  onChange={(e) => {
                    handleOptionChange(index, "submission", e.target.value);
                  }}
                  onBlur={handleAddQuestionOptionUpdate}
                  style={{
                    backgroundColor:
                      option.submission === "P" ? "Green" : "Red",
                    color: "white",
                    borderRadius: "8px",
                  }}
                >
                  <option>P</option>
                  <option>N</option>
                </select>
                <button
                  onClick={() => {
                    setOptions(options.filter((_, i) => i !== index));
                    handleAddQuestionOptionUpdate();
                  }}
                >
                  <MdDelete />
                </button>
              </div>
            ))}
            <button
              onClick={handleAddOption}
              className="bg-purple-600 text-white p-2 rounded"
            >
              Add More
            </button>
          </div>
        </div>
      )}

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
            Add More Questions
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {questions.map((q, index) => (
            <div key={index}>
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
                <button
                  className="text-red-600"
                  onClick={() =>
                    setQuestions(
                      questions.filter((_, qIndex) => qIndex !== index)
                    )
                  }
                >
                  Remove
                </button>
              </div>
              <div className="flex items-center gap-2">
                {q.options.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    className="flex items-center justify-between gap-2 border border-gray-300 rounded-md p-2"
                  >
                    <input
                      type="text"
                      placeholder="Add Option"
                      className="w-full outline-none focus:outline-none border-none appearance-none active:outline-none"
                      value={option.value || ""}
                      onChange={(e) =>
                        handleQuestionOptionChange(
                          index,
                          "value",
                          e.target.value,
                          optionIndex
                        )
                      }
                    />
                    <select
                      value={option.submission || "P"}
                      onChange={(e) =>
                        handleQuestionOptionChange(
                          index,
                          "submission",
                          e.target.value,
                          optionIndex
                        )
                      }
                      style={{
                        backgroundColor:
                          option.submission === "P" ? "Green" : "Red",
                        color: "white",
                        borderRadius: "8px",
                      }}
                    >
                      <option>P</option>
                      <option>N</option>
                    </select>
                    <button
                      onClick={() =>
                        handleQuestionOptionRemove(index, optionIndex)
                      }
                    >
                      <MdDelete />
                    </button>
                  </div>
                ))}
                <button
                  className="bg-purple-600 text-white p-2 rounded"
                  onClick={() => handleQuestionOptionAdd(index)}
                >
                  <MdAdd />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-6">
          {!isEdit && (
            <button
              className="bg-purple-700 text-white p-3 rounded"
              onClick={handleCreateChecklist}
            >
              Create Checklist
            </button>
          )}
          {isEdit && (
            <button
              className="bg-purple-700 text-white p-3 rounded"
              onClick={handleUpdateChecklist}
            >
              Update Checklist
            </button>
          )}
          <button className="bg-gray-500 text-white p-3 rounded">
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCheckList;

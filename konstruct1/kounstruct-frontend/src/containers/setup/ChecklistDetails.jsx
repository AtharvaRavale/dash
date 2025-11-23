// import React, { useState } from "react";

// const Checklistdetails = ({
//   setShowForm,
//   setDetailForm,
//   checklist,
//   categoryOptions,
//   subCategoryOptions,
// }) => {
//   console.log(checklist, "CHECKLIST", subCategoryOptions, categoryOptions);

//   if (!checklist) return null;

//   const getCategoryNameById = (id) => {
//     return categoryOptions.find((option) => option.id === id)?.category;
//   };

//   const getSubCategoryNameById = (id) => {
//     return subCategoryOptions.find((option) => option.id === id)?.sub_category;
//   };

//   return (
//     <>
//       <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-2 mb-6">
//             <div className="w-6 h-6 bg-purple-700 rounded-full flex items-center justify-center">
//               <svg
//                 className="w-4 h-4 text-white"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
//                 />
//               </svg>
//             </div>
//             <h1 className="text-purple-700 text-xl">Checklist Detail</h1>
//             <button
//               className="bg-gray-200 px-2 py-1 rounded justify-end text-end"
//               onClick={() => setShowForm(true)}
//             >
//               ✎
//             </button>
//           </div>
//           <button
//             className="bg-purple-700 text-white px-4 py-2 rounded"
//             onClick={() => setDetailForm(false)}
//           >
//             Back
//           </button>
//         </div>

//         {/* Info Grid */}
//         <div className="bg-white rounded p-4 mb-6 shadow-sm">
//           <div className="grid grid-cols-4 gap-4">
//             <div>
//               <div className="text-gray-500 text-sm mb-1">Category</div>
//               <div className="text-gray-700">
//                 {getCategoryNameById(checklist.checklist_category_id)}
//               </div>
//             </div>
//             <div>
//               <div className="text-gray-500 text-sm mb-1">Sub Category</div>
//               <div className="text-gray-700">
//                 {getSubCategoryNameById(checklist.checklist_sub_category_id)}
//               </div>
//             </div>
//             {/* <div>
//               <div className="text-gray-500 text-sm mb-1">
//                 Title of the Checklist
//               </div>
//               <div className="text-gray-700">
//                 Civil Finishes Checklist (Ananda)
//               </div>
//             </div> */}
//             <div>
//               <div className="text-gray-500 text-sm mb-1">No. of Questions</div>
//               <div className="text-gray-700">{checklist.questions.length}</div>
//             </div>
//           </div>
//           <div className="mt-4 flex items-center">
//             <span className="text-gray-500 text-sm mr-2">Status</span>
//             <div className="w-12 h-6 bg-green-700 rounded-full relative">
//               <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
//             </div>
//           </div>
//         </div>

//         {/* Questions */}
//         <div className="space-y-4">
//           {checklist.questions.map((question, index) => (
//             <div key={question.id} className="bg-white rounded p-4 shadow-sm">
//               <div className="flex justify-between items-start mb-4">
//                 <span className="text-gray-700">{index + 1}</span>
//                 <button className="text-gray-400 hover:text-gray-600">
//                   <svg
//                     className="w-5 h-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
//                     />
//                   </svg>
//                 </button>
//               </div>

//               <div className="text-gray-700 mb-4">{question.question}</div>

//               {question.options && (
//                 <div className="grid grid-cols-2 gap-4 mb-4">
//                   <div>
//                     <span className="text-gray-500 text-sm">Answer Type :</span>
//                     <span className="text-gray-700 ml-2">
//                       {question.options.length > 0 ? "Multiple Choice" : "Text"}
//                     </span>
//                   </div>
//                   <div className="flex items-center">
//                     <span className="text-gray-500 text-sm mr-2">Answers:</span>
//                     <div className="flex gap-4 text-gray-700">
//                       {question.options.map((option) => (
//                         <span key={option.value}>
//                           {option.value} ({option.submission})
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* <div className="flex gap-8">
//                 <div className="flex items-center gap-2">
//                   <span className="text-gray-500 text-sm">
//                     Question Mandatory
//                   </span>
//                   <div className="w-12 h-6 bg-pink-200 rounded-full relative">
//                     <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <span className="text-gray-500 text-sm">Image Mandatory</span>
//                   <div className="w-12 h-6 bg-pink-200 rounded-full relative">
//                     <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
//                   </div>
//                 </div>
//               </div> */}
//             </div>
//           ))}
//         </div>
//       </div>
//     </>
//   );
// };

// export default Checklistdetails;


// import React, { useState } from "react";
// import SideBarSetup from "../../components/SideBarSetup";

// const Checklistdetails = ({ setShowForm, setDetailForm, checklist }) => {
//   console.log(checklist, "CHECKLIST");

//   if (!checklist) return null;

//   // Use the correct data structure from API response
//   const questionsData = checklist.items || [];

//   return (
//     <>
//       <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md">
//         <SideBarSetup />
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-2 mb-6">
//             <div className="w-6 h-6 bg-purple-700 rounded-full flex items-center justify-center">
//               <svg
//                 className="w-4 h-4 text-white"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
//                 />
//               </svg>
//             </div>
//             <h1 className="text-purple-700 text-xl">Checklist Detail</h1>
//             <button
//               className="bg-gray-200 px-2 py-1 rounded justify-end text-end"
//               onClick={() => setShowForm(true)}
//             >
//               ✎
//             </button>
//           </div>
//           <button
//             className="bg-purple-700 text-white px-4 py-2 rounded"
//             onClick={() => setDetailForm(false)}
//           >
//             Back
//           </button>
//         </div>

//         {/* Info Grid */}
//         <div className="bg-white rounded p-4 mb-6 shadow-sm">
//           <div className="grid grid-cols-4 gap-4">
//             <div>
//               <div className="text-gray-500 text-sm mb-1">Checklist Name</div>
//               <div className="text-gray-700">
//                 {checklist.name || "Unnamed Checklist"}
//               </div>
//             </div>
//             <div>
//               <div className="text-gray-500 text-sm mb-1">Category ID</div>
//               <div className="text-gray-700">{checklist.category || "N/A"}</div>
//             </div>
//             <div>
//               <div className="text-gray-500 text-sm mb-1">Project ID</div>
//               <div className="text-gray-700">
//                 {checklist.project_id || "N/A"}
//               </div>
//             </div>
//             <div>
//               <div className="text-gray-500 text-sm mb-1">No. of Questions</div>
//               <div className="text-gray-700">{questionsData.length}</div>
//             </div>
//           </div>
//           <div className="mt-4 flex items-center">
//             <span className="text-gray-500 text-sm mr-2">Status</span>
//             <div
//               className={`px-3 py-1 rounded-full text-sm font-medium ${
//                 checklist.status === "completed"
//                   ? "bg-green-100 text-green-800"
//                   : checklist.status === "in_progress"
//                   ? "bg-yellow-100 text-yellow-800"
//                   : "bg-gray-100 text-gray-800"
//               }`}
//             >
//               {checklist.status?.replace("_", " ").toUpperCase() ||
//                 "NOT STARTED"}
//             </div>
//           </div>
//         </div>

//         {/* Questions */}
//         <div className="space-y-4">
//           {questionsData.map((question, index) => (
//             <div
//               key={question.id}
//               className="bg-white rounded p-4 shadow-sm border"
//             >
//               <div className="flex justify-between items-start mb-4">
//                 <span className="text-purple-700 font-bold text-lg">
//                   {index + 1}
//                 </span>
//                 <div className="flex items-center gap-2">
//                   {question.photo_required && (
//                     <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
//                       📷 Photo Required
//                     </span>
//                   )}
//                   <span
//                     className={`text-xs px-2 py-1 rounded ${
//                       question.status === "completed"
//                         ? "bg-green-100 text-green-800"
//                         : question.status === "in_progress"
//                         ? "bg-yellow-100 text-yellow-800"
//                         : "bg-gray-100 text-gray-800"
//                     }`}
//                   >
//                     {question.status?.replace("_", " ").toUpperCase()}
//                   </span>
//                 </div>
//               </div>

//               <div className="text-gray-700 mb-4 font-medium">
//                 {question.title}
//               </div>

//               {question.options && question.options.length > 0 && (
//                 <div className="mb-4">
//                   <div className="text-gray-500 text-sm mb-2">
//                     Answer Options:
//                   </div>
//                   <div className="flex flex-wrap gap-2">
//                     {question.options.map((option) => (
//                       <span
//                         key={option.id}
//                         className={`px-3 py-1 rounded-full text-sm font-medium ${
//                           option.choice === "P"
//                             ? "bg-green-100 text-green-800"
//                             : "bg-red-100 text-red-800"
//                         }`}
//                       >
//                         {option.name} (
//                         {option.choice === "P" ? "Positive" : "Negative"})
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {question.description && (
//                 <div className="text-gray-600 text-sm italic">
//                   Description: {question.description}
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>

//         {questionsData.length === 0 && (
//           <div className="text-center py-8 text-gray-500">
//             No questions found in this checklist.
//           </div>
//         )}
//       </div>
//     </>
//   );
// };

// export default Checklistdetails;


import React, { useState } from "react";
import SideBarSetup from "../../components/SideBarSetup";
import { useTheme } from "../../ThemeContext";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
const Checklistdetails = ({ setShowForm, setDetailForm, checklist }) => {
  console.log(checklist, "CHECKLIST");

  const { theme } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 10;
  // Add loading states
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);

  // Enhanced Orange-Based Theme Palette (same as Checklist.jsx)
  const palette =
    theme === "dark"
      ? {
          bg: "#0a0a0f",
          card: "bg-gradient-to-br from-[#191919] to-[#181820]",
          text: "text-yellow-100",
          textSecondary: "text-yellow-200/70",
          border: "border-yellow-600/30",
          shadow: "shadow-2xl shadow-yellow-900/20",
          primary:
            "bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold hover:from-yellow-600 hover:to-yellow-700",
          secondary:
            "bg-gradient-to-r from-yellow-900 to-yellow-800 text-yellow-100 hover:from-yellow-800 hover:to-yellow-700",
          badge:
            "bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500",
          badgeText: "text-yellow-900 font-bold",
          questionCard: "bg-gradient-to-br from-[#1e1e28] to-[#1a1a24]",
          infoCard: "bg-gradient-to-br from-[#1a1a24] to-[#151520]",
          statusCompleted:
            "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white",
          statusProgress:
            "bg-gradient-to-r from-amber-600 to-amber-700 text-white",
          statusNotStarted:
            "bg-gradient-to-r from-slate-600 to-slate-700 text-white",
          // Answer option styles using theme colors
          answerYes:
            "bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 border-yellow-500",
          answerNo:
            "bg-gradient-to-r from-slate-600 to-slate-700 text-white border-slate-600",
          checkbox: "border-yellow-400 bg-[#1e1e28]",
          downloadBtn:
            "bg-gradient-to-r from-yellow-600 to-yellow-700 text-black hover:from-yellow-700 hover:to-yellow-800",
        }
      : {
          bg: "#faf9f7",
          card: "bg-gradient-to-br from-white to-orange-50/30",
          text: "text-orange-900",
          textSecondary: "text-orange-700/70",
          border: "border-orange-300/60",
          shadow: "shadow-xl shadow-orange-200/30",
          primary:
            "bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold hover:from-orange-600 hover:to-orange-700",
          secondary:
            "bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600",
          badge:
            "bg-gradient-to-r from-orange-300 via-orange-400 to-orange-500",
          badgeText: "text-orange-900 font-bold",
          questionCard: "bg-gradient-to-br from-white to-orange-50/50",
          infoCard: "bg-gradient-to-br from-orange-50/30 to-white",
          statusCompleted:
            "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white",
          statusProgress:
            "bg-gradient-to-r from-amber-500 to-amber-600 text-white",
          statusNotStarted:
            "bg-gradient-to-r from-slate-500 to-slate-600 text-white",
          // Answer option styles using theme colors
          answerYes:
            "bg-gradient-to-r from-orange-400 to-orange-500 text-white border-orange-500",
          answerNo:
            "bg-gradient-to-r from-slate-500 to-slate-600 text-white border-slate-500",
          checkbox: "border-orange-400 bg-white",
          downloadBtn:
            "bg-gradient-to-r from-orange-600 to-orange-700 text-white hover:from-orange-700 hover:to-orange-800",
        };

  if (!checklist) return null;

  const questionsData = checklist.items || [];

  // Pagination logic
  const totalPages = Math.ceil(questionsData.length / questionsPerPage);
  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = questionsData.slice(
    indexOfFirstQuestion,
    indexOfLastQuestion
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return palette.statusCompleted;
      case "in_progress":
      case "work_in_progress":
        return palette.statusProgress;
      default:
        return palette.statusNotStarted;
    }
  };
const handleDownloadPDF = async () => {
  setIsDownloadingPDF(true);
  try {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(20);
    doc.setTextColor(234, 104, 34); // Orange color
    doc.text("Checklist Details", 20, 30);

    // Add checklist info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(
      `Checklist Name: ${checklist.name || "Unnamed Checklist"}`,
      20,
      50
    );
    doc.text(`Category ID: ${checklist.category || "N/A"}`, 20, 60);
    doc.text(`Project ID: ${checklist.project_id || "N/A"}`, 20, 70);
    doc.text(`Total Questions: ${questionsData.length}`, 20, 80);
    doc.text(
      `Status: ${
        checklist.status?.replace("_", " ").toUpperCase() || "NOT STARTED"
      }`,
      20,
      90
    );

    // Add questions
    let yPosition = 110;

    questionsData.forEach((question, index) => {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 30;
      }

      // Question number and title
      doc.setFontSize(14);
      doc.setTextColor(234, 104, 34);
      doc.text(`${index + 1}. ${question.title}`, 20, yPosition);
      yPosition += 10;

      // Answer options with checkboxes
      if (question.options && question.options.length > 0) {
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        question.options.forEach((option) => {
          // Draw checkbox
          doc.rect(25, yPosition - 3, 4, 4);
          // Add option text
          doc.text(
            `${option.name} (${option.choice === "P" ? "Yes" : "No"})`,
            35,
            yPosition
          );
          yPosition += 8;
        });
      }

      // Description if exists
      if (question.description) {
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`Description: ${question.description}`, 25, yPosition);
        yPosition += 8;
      }

      yPosition += 10; // Space between questions
    });

    // Save the PDF
    doc.save(`${checklist.name || "checklist"}_${checklist.id}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Error generating PDF. Please try again.");
  } finally {
    setIsDownloadingPDF(false);
  }
};

const handleDownloadExcel = async () => {
  setIsDownloadingExcel(true);
  try {
    // Prepare data for Excel
    const excelData = [];

    // Add header info
    excelData.push(["Checklist Details", "", "", ""]);
    excelData.push(["Name", checklist.name || "Unnamed Checklist", "", ""]);
    excelData.push(["Category ID", checklist.category || "N/A", "", ""]);
    excelData.push(["Project ID", checklist.project_id || "N/A", "", ""]);
    excelData.push(["Total Questions", questionsData.length, "", ""]);
    excelData.push([
      "Status",
      checklist.status?.replace("_", " ").toUpperCase() || "NOT STARTED",
      "",
      "",
    ]);
    excelData.push(["", "", "", ""]); // Empty row

    // Add questions header
    excelData.push([
      "Question No.",
      "Question",
      "Answer Options",
      "Description",
    ]);

    // Add questions data
    questionsData.forEach((question, index) => {
      const answerOptions = question.options
        ? question.options
            .map((opt) => `${opt.name} (${opt.choice === "P" ? "Yes" : "No"})`)
            .join(", ")
        : "No options";

      excelData.push([
        index + 1,
        question.title,
        answerOptions,
        question.description || "No description",
      ]);
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // Set column widths
    ws["!cols"] = [
      { width: 12 }, // Question No.
      { width: 50 }, // Question
      { width: 30 }, // Answer Options
      { width: 30 }, // Description
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Checklist");

    // Generate Excel file and save
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${checklist.name || "checklist"}_${checklist.id}.xlsx`);
  } catch (error) {
    console.error("Error generating Excel:", error);
    alert("Error generating Excel file. Please try again.");
  } finally {
    setIsDownloadingExcel(false);
  }
};

  const renderPagination = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 rounded-lg font-medium transition-all duration-200 text-sm ${
            i === currentPage
              ? `${palette.primary} transform scale-105`
              : `bg-slate-200 hover:bg-slate-300 text-slate-700 hover:transform hover:scale-105`
          }`}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  return (
    <div className="flex min-h-screen" style={{ background: palette.bg }}>
      <SideBarSetup />
      <div className="flex-1 p-4 lg:p-8 ml-[250px] lg:ml-[16%]">
        <div
          className={`w-full max-w-7xl mx-auto p-4 lg:p-8 rounded-2xl ${palette.card} ${palette.shadow} border ${palette.border}`}
        >
          {/* Enhanced Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl ${palette.primary} shadow-lg`}>
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${palette.text}`}>
                  Checklist Details
                </h1>
                <p className={`${palette.textSecondary} text-lg mt-1`}>
                  View and manage checklist information
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:transform hover:scale-105 ${palette.secondary} flex items-center space-x-2 shadow-lg`}
                onClick={() => setShowForm(true)}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <span>Edit</span>
              </button>
              <button
                className={`px-6 py-3 rounded-xl font-semibold text-lg transition-all duration-300 hover:transform hover:scale-105 ${palette.primary} flex items-center space-x-2 shadow-lg`}
                onClick={() => setDetailForm(false)}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span>Back to List</span>
              </button>
            </div>
          </div>

          {/* Enhanced Info Card */}
          <div
            className={`${palette.infoCard} rounded-2xl p-6 mb-8 border ${palette.border} ${palette.shadow}`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div
                  className={`text-sm font-medium ${palette.textSecondary} flex items-center space-x-2`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  <span>Checklist Name</span>
                </div>
                <div className={`text-lg font-semibold ${palette.text}`}>
                  {checklist.name || "Unnamed Checklist"}
                </div>
              </div>

              <div className="space-y-2">
                <div
                  className={`text-sm font-medium ${palette.textSecondary} flex items-center space-x-2`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <span>Category ID</span>
                </div>
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${palette.badge} ${palette.badgeText}`}
                >
                  {checklist.category || "N/A"}
                </div>
              </div>

              <div className="space-y-2">
                <div
                  className={`text-sm font-medium ${palette.textSecondary} flex items-center space-x-2`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0V9a1 1 0 011-1h4a1 1 0 011 1v12"
                    />
                  </svg>
                  <span>Project ID</span>
                </div>
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${palette.badge} ${palette.badgeText}`}
                >
                  {checklist.project_id || "N/A"}
                </div>
              </div>

              <div className="space-y-2">
                <div
                  className={`text-sm font-medium ${palette.textSecondary} flex items-center space-x-2`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Total Questions</span>
                </div>
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${palette.badge} ${palette.badgeText}`}
                >
                  {questionsData.length} Questions
                </div>
              </div>
            </div>

            {/* Status Section */}
            <div className="mt-6 pt-6 border-t border-orange-200/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span
                    className={`text-sm font-medium ${palette.textSecondary}`}
                  >
                    Current Status:
                  </span>
                  <div
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadge(
                      checklist.status
                    )} shadow-lg`}
                  >
                    {checklist.status?.replace("_", " ").toUpperCase() ||
                      "NOT STARTED"}
                  </div>
                </div>
                <div className={`text-sm ${palette.textSecondary}`}>
                  ID: <span className="font-semibold">{checklist.id}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Questions Section with Header Controls */}
          <div className="space-y-6">
            {/* Questions Header with Downloads and Pagination */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
              <div className="flex items-center space-x-3">
                <h2 className={`text-2xl font-bold ${palette.text}`}>
                  Questions
                </h2>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${palette.badge} ${palette.badgeText}`}
                >
                  {questionsData.length} Total
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Download Buttons */}
                <div className="flex items-center space-x-2">
                  <button
  onClick={handleDownloadPDF}
  disabled={isDownloadingPDF}
  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:transform hover:scale-105 ${palette.downloadBtn} flex items-center space-x-2 shadow-lg disabled:opacity-50`}
>
  {isDownloadingPDF ? (
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )}
  <span>{isDownloadingPDF ? 'Generating...' : 'PDF'}</span>
</button>

<button
  onClick={handleDownloadExcel}
  disabled={isDownloadingExcel}
  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:transform hover:scale-105 ${palette.downloadBtn} flex items-center space-x-2 shadow-lg disabled:opacity-50`}
>
  {isDownloadingExcel ? (
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )}
  <span>{isDownloadingExcel ? 'Generating...' : 'Excel'}</span>
</button>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm ${palette.textSecondary}`}>
                      Page:
                    </span>
                    <div className="flex space-x-1">{renderPagination()}</div>
                  </div>
                )}
              </div>
            </div>

            {questionsData.length > 0 ? (
              currentQuestions.map((question, index) => (
                <div
                  key={question.id}
                  className={`${palette.questionCard} rounded-2xl p-6 border ${palette.border} shadow-lg hover:shadow-xl transition-all duration-300`}
                >
                  {/* Question Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${palette.primary} text-white font-bold text-lg shadow-lg`}
                    >
                      {indexOfFirstQuestion + index + 1}
                    </div>
                    <div className="flex items-center gap-3">
                      {question.photo_required && (
                        <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-3 py-1 rounded-full font-semibold flex items-center space-x-1">
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span>Photo Required</span>
                        </span>
                      )}
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-semibold ${getStatusBadge(
                          question.status
                        )}`}
                      >
                        {question.status?.replace("_", " ").toUpperCase() ||
                          "NOT STARTED"}
                      </span>
                    </div>
                  </div>

                  {/* Question Title */}
                  <div
                    className={`text-xl font-semibold ${palette.text} mb-6 leading-relaxed`}
                  >
                    {question.title}
                  </div>

                  {/* Enhanced Answer Options with Checkboxes */}
                  {question.options && question.options.length > 0 && (
                    <div className="mb-4">
                      <div
                        className={`text-sm font-medium ${palette.textSecondary} mb-4 flex items-center space-x-2`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        <span>Answer Options:</span>
                      </div>
                      <div className="space-y-3">
                        {question.options.map((option) => (
                          <div
                            key={option.id}
                            className="flex items-center space-x-4"
                          >
                            {/* Static Checkbox */}
                            <div
                              className={`w-5 h-5 border-2 rounded ${palette.checkbox} flex items-center justify-center`}
                            >
                              <div className="w-2 h-2 bg-transparent rounded-sm"></div>
                            </div>
                            {/* Answer Option */}
                            <span
                              className={`px-4 py-2 rounded-xl text-sm font-semibold shadow-md transition-all duration-200 ${
                                option.choice === "P"
                                  ? palette.answerYes
                                  : palette.answerNo
                              }`}
                            >
                              {option.name} •{" "}
                              {option.choice === "P" ? "Yes" : "No"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {question.description && (
                    <div
                      className={`${palette.textSecondary} text-sm italic bg-gradient-to-r from-orange-50/50 to-orange-100/50 p-3 rounded-lg border-l-4 border-orange-400`}
                    >
                      <strong>Description:</strong> {question.description}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-6 rounded-full bg-orange-100">
                    <svg
                      className="w-16 h-16 text-orange-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="text-center">
                    <h3
                      className={`text-xl font-semibold ${palette.text} mb-2`}
                    >
                      No questions found
                    </h3>
                    <p className={`${palette.textSecondary} mb-6`}>
                      This checklist doesn't have any questions yet
                    </p>
                    <button
                      className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:transform hover:scale-105 ${palette.primary}`}
                      onClick={() => setShowForm(true)}
                    >
                      Add Questions
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


export default Checklistdetails;
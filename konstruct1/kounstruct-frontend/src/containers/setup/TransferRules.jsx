// import React, { useState, useEffect } from "react";
// import { useSelector } from "react-redux";
// import { createTransferRule, getTransferRules } from "../../api";
// import { showToast } from "../../utils/toast";
// import { useTheme } from "../../ThemeContext";
// import { useNavigate } from "react-router-dom"; 

// // THEME COLORS
// const COLORS = {
//   light: {
//     ORANGE: "#b54b13",
//     ORANGE_DARK: "#882c10",
//     ORANGE_LIGHT: "#ede1d3",
//     BORDER_GRAY: "#a29991",
//     TEXT_GRAY: "#29252c",
//     WHITE: "#fff",
//   },
//   dark: {
//     ORANGE: "#ffbe63",
//     ORANGE_DARK: "#f4b95e",
//     ORANGE_LIGHT: "#2b2321",
//     BORDER_GRAY: "#6f6561",
//     TEXT_GRAY: "#ece2d7",
//     WHITE: "#171214",
//   },
// };

// function TransferRules({ nextStep, previousStep }) {
//   const { theme } = useTheme();
//   const c = COLORS[theme === "dark" ? "dark" : "light"];
//   const navigate = useNavigate(); 

//   const projectId = useSelector((state) => state.user.selectedProject.id);

//   const [selectedLevel, setSelectedLevel] = useState("question_level");

//   useEffect(() => {
//     const fetchTransferRules = async () => {
//       const response = await getTransferRules(projectId.id);
//       if (response.status === 200) {
//         const transferRule = response.data.data?.["Transfer-Rule"][0];
//         if (transferRule) {
//           const matchingRule = Object.keys(transferRule).find(
//             (key) => transferRule[key] === true
//           );
//           if (matchingRule) {
//             setSelectedLevel(matchingRule);
//           }
//         }
//         showToast(response.data.message,'success');
//       }
//     };
//     fetchTransferRules();
//   }, [projectId]);

//   const handleSubmit = async () => {
//     const data = {
//       project: projectId.id,
//       zone_level: selectedLevel === "zone_level",
//       flat_level: selectedLevel === "flat_level",
//       room_level: selectedLevel === "room_level",
//       checklist_level: selectedLevel === "checklist_level",
//       question_level: selectedLevel === "question_level",
//     };
//     const response = await createTransferRule(data);
//     console.log(response);
//     if (response.status === 200) {
//       showToast(response.data.message,"success");
//       setTimeout(() => navigate("/config"), 1200);
//       nextStep();
//     } else {
//       showToast(response.data.message,"error");
//     }
//   };

//   const handleSelection = (event) => {
//     setSelectedLevel(event.target.value);
//   };

//   return (
//     <div
//       className="max-w-3xl my-8 mx-auto px-6 py-8 rounded-2xl shadow-xl"
//       style={{
//         background: c.ORANGE_LIGHT,
//         border: `1.5px solid ${c.BORDER_GRAY}`,
//         color: c.TEXT_GRAY,
//       }}
//     >
//       <div className="p-8 rounded-2xl" style={{ background: c.WHITE }}>
//         <h2
//           className="text-2xl font-bold mb-5 text-center"
//           style={{ color: c.ORANGE_DARK }}
//         >
//           Note
//         </h2>
//         <p
//           className="mb-10 text-justify text-lg"
//           style={{ color: c.TEXT_GRAY, lineHeight: 1.7 }}
//         >
//           You have the option to select the transfer at Question-level /
//           Checklist-level. <br />
//           <b>Example:</b> If you choose <b>Question-level</b>, the moment a
//           question has a positive answer it will be transferred to the next
//           level. If you choose <b>Checklist-level</b>, a checklist will move to
//           the next level only after <b>all</b> questions in the checklist have
//           marked positive.
//         </p>

//         <form className="mb-10">
//           <div className="flex flex-col gap-5">
//             {[
//               { value: "zone_level", label: "Zone Level" },
//               { value: "flat_level", label: "Flat Level" },
//               { value: "room_level", label: "Room Level" },
//               { value: "checklist_level", label: "Checklist Level" },
//               { value: "question_level", label: "Question Level" },
//             ].map(({ value, label }) => (
//               <label
//                 key={value}
//                 className="flex items-center justify-between space-x-3 py-3 border rounded-xl px-4 cursor-pointer transition-all"
//                 style={{
//                   borderColor: c.BORDER_GRAY,
//                   background:
//                     selectedLevel === value ? c.ORANGE_LIGHT : c.WHITE,
//                 }}
//               >
//                 <input
//                   type="radio"
//                   name="transfer-level"
//                   value={value}
//                   checked={selectedLevel === value}
//                   onChange={handleSelection}
//                   className="form-radio h-5 w-5"
//                   style={{
//                     accentColor: c.ORANGE_DARK,
//                   }}
//                 />
//                 <span
//                   className="text-xl"
//                   style={{
//                     color:
//                       selectedLevel === value ? c.ORANGE_DARK : c.TEXT_GRAY,
//                     fontWeight: selectedLevel === value ? 600 : 500,
//                   }}
//                 >
//                   {label}
//                 </span>
//               </label>
//             ))}
//           </div>
//         </form>

//         <div className="flex justify-between gap-5 mt-10">
//           <button
//             className="px-7 py-3 rounded-xl font-semibold"
//             style={{
//               background: c.BORDER_GRAY,
//               color: "#fff",
//               minWidth: 120,
//             }}
//             onClick={previousStep}
//             type="button"
//           >
//             Previous
//           </button>
//           <button
//             onClick={handleSubmit}
//             className="px-7 py-3 rounded-xl font-semibold shadow"
//             style={{
//               background: `linear-gradient(90deg, ${c.ORANGE} 70%, ${c.ORANGE_DARK} 100%)`,
//               color: "#fff",
//               minWidth: 120,
//             }}
//             type="button"
//           >
//             Submit
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default TransferRules;


import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { createTransferRule, getTransferRules } from "../../api";
import { showToast } from "../../utils/toast";
import { useTheme } from "../../ThemeContext";
import { useNavigate } from "react-router-dom";

function TransferRules({ nextStep, previousStep }) {
  const { theme } = useTheme();

  // THEME palette
  const ORANGE = "#ffbe63";
  const BG_OFFWHITE = "#fcfaf7";
  const bgColor = theme === "dark" ? "#191922" : BG_OFFWHITE;
  const cardColor = theme === "dark" ? "#23232c" : "#fff";
  const borderColor = ORANGE;
  const textColor = theme === "dark" ? "#fff" : "#222";
  const iconColor = ORANGE;

  const navigate = useNavigate();
  const projectId = useSelector((state) => state.user.selectedProject.id);

  const [selectedLevel, setSelectedLevel] = useState("question_level");

  useEffect(() => {
    const fetchTransferRules = async () => {
      const response = await getTransferRules(projectId.id);
      if (response.status === 200) {
        const transferRule = response.data.data?.["Transfer-Rule"][0];
        if (transferRule) {
          const matchingRule = Object.keys(transferRule).find(
            (key) => transferRule[key] === true
          );
          if (matchingRule) {
            setSelectedLevel(matchingRule);
          }
        }
        showToast(response.data.message, "success");
      }
    };
    fetchTransferRules();
  }, [projectId]);

  const handleSubmit = async () => {
    const data = {
      project: projectId.id,
      zone_level: selectedLevel === "zone_level",
      flat_level: selectedLevel === "flat_level",
      room_level: selectedLevel === "room_level",
      checklist_level: selectedLevel === "checklist_level",
      question_level: selectedLevel === "question_level",
    };
    const response = await createTransferRule(data);
    if (response.status === 200) {
      showToast(response.data.message, "success");
      setTimeout(() => navigate("/config"), 1200);
      nextStep();
    } else {
      showToast(response.data.message, "error");
    }
  };

  const handleSelection = (event) => {
    setSelectedLevel(event.target.value);
  };

  return (
    <div
      className="max-w-3xl my-8 mx-auto px-6 py-8 rounded-2xl shadow-xl"
      style={{
        background: bgColor,
        border: `1.5px solid ${borderColor}`,
        color: textColor,
      }}
    >
      <div className="p-8 rounded-2xl" style={{ background: cardColor }}>
        <h2
          className="text-2xl font-bold mb-5 text-center"
          style={{ color: borderColor }}
        >
          Note
        </h2>
        <p
          className="mb-10 text-justify text-lg"
          style={{ color: textColor, lineHeight: 1.7 }}
        >
          You have the option to select the transfer at Question-level /
          Checklist-level. <br />
          <b>Example:</b> If you choose <b>Question-level</b>, the moment a
          question has a positive answer it will be transferred to the next
          level. If you choose <b>Checklist-level</b>, a checklist will move to
          the next level only after <b>all</b> questions in the checklist have
          marked positive.
        </p>

        <form className="mb-10">
          <div className="flex flex-col gap-5">
            {[
              { value: "zone_level", label: "Zone Level" },
              { value: "flat_level", label: "Flat Level" },
              { value: "room_level", label: "Room Level" },
              { value: "checklist_level", label: "Checklist Level" },
              { value: "question_level", label: "Question Level" },
            ].map(({ value, label }) => (
              <label
                key={value}
                className="flex items-center justify-between space-x-3 py-3 border rounded-xl px-4 cursor-pointer transition-all"
                style={{
                  borderColor: borderColor,
                  background: selectedLevel === value ? BG_OFFWHITE : cardColor,
                }}
              >
                <input
                  type="radio"
                  name="transfer-level"
                  value={value}
                  checked={selectedLevel === value}
                  onChange={handleSelection}
                  className="form-radio h-5 w-5"
                  style={{
                    accentColor: borderColor,
                  }}
                />
                <span
                  className="text-xl"
                  style={{
                    color: selectedLevel === value ? borderColor : textColor,
                    fontWeight: selectedLevel === value ? 600 : 500,
                  }}
                >
                  {label}
                </span>
              </label>
            ))}
          </div>
        </form>

        <div className="flex justify-between gap-5 mt-10">
          <button
            className="px-7 py-3 rounded-xl font-semibold"
            style={{
              background: borderColor,
              color: "#fff",
              minWidth: 120,
              opacity: 0.7,
            }}
            onClick={previousStep}
            type="button"
          >
            Previous
          </button>
          <button
            onClick={handleSubmit}
            className="px-7 py-3 rounded-xl font-semibold shadow"
            style={{
              background: `linear-gradient(90deg, ${ORANGE} 70%, #ffd385 100%)`,
              color: "#222",
              minWidth: 120,
            }}
            type="button"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default TransferRules;



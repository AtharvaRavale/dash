import React, { useState, useEffect } from "react";

// Recursive utility to get child key at each level
const getChildKey = (level) => {
  if (level === 0) return "level1";
  if (level === 1) return "level2";
  if (level === 2) return "level3";
  if (level === 3) return "level4";
  if (level === 4) return "level5";
  if (level === 5) return "level6";
  return null;
};

const DynamicCategorySelector = ({ categoryTree, onChange }) => {
  // path: array of objects: [{ id, name }]
  const [selectedPath, setSelectedPath] = useState([]);

  // Get options for the current dropdown level
  const getOptionsAtLevel = (level, path) => {
    if (level === 0) return categoryTree;
    let options = categoryTree;
    for (let i = 0; i < level; i++) {
      const key = getChildKey(i);
      const selected = options.find((item) => item.id === path[i]?.id);
      if (!selected || !selected[key]) return [];
      options = selected[key];
    }
    return options;
  };

  // Handle selection at a certain level
  const handleSelect = (level, e) => {
    const id = e.target.value ? parseInt(e.target.value) : null;
    if (!id) {
      setSelectedPath(selectedPath.slice(0, level));
      onChange(selectedPath.slice(0, level));
      return;
    }
    const options = getOptionsAtLevel(level, selectedPath);
    const selected = options.find((item) => item.id === id);
    const newPath = [
      ...selectedPath.slice(0, level),
      { id: selected.id, name: selected.name },
    ];
    setSelectedPath(newPath);
    onChange(newPath);
  };

  // Render dropdowns up to the selected depth
  const renderDropdowns = () => {
    const dropdowns = [];
    let level = 0;
    let stop = false;
    while (!stop) {
      const options = getOptionsAtLevel(level, selectedPath);
      if (!options || options.length === 0) break;
      dropdowns.push(
        <select
          key={level}
          className="border rounded p-2 ml-2"
          value={selectedPath[level]?.id || ""}
          onChange={(e) => handleSelect(level, e)}
        >
          <option value="">
            Select {level === 0 ? "Category" : `Level ${level}`}
          </option>
          {options.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      );
      // If no further child at this level, stop rendering more dropdowns
      const key = getChildKey(level);
      const selected = options.find(
        (item) => item.id === selectedPath[level]?.id
      );
      if (!selected || !selected[key] || selected[key].length === 0)
        stop = true;
      level += 1;
      if (level > 6) break; // maximum depth for your model
    }
    return dropdowns;
  };

  return (
    <div className="flex items-center gap-2 my-4">
      {renderDropdowns()}
      {selectedPath.length > 0 && (
        <span className="ml-4 text-sm text-gray-600">
          Selected: {selectedPath.map((n) => n.name).join(" → ")}
        </span>
      )}
    </div>
  );
};

export default DynamicCategorySelector;

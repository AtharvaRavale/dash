import React, { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Save,
  CheckSquare,
  Square,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useSelector } from "react-redux";
import {
  zonewithbluidlingwithlevel,
  NestedZonenSubzone,
} from "../../api";
import { useTheme } from "../../ThemeContext";

const THEME = {
  light: {
    YELLOW: "#FFD600",
    CARD_BG: "#fff",
    BACKGROUND: "#F6F4ED",
    BORDER: "#e2e8f0",
    TEXT: "#1f2937",
    ACCENT: "#3b82f6",
    INPUT_BG: "#f8fafc",
    ERROR: "#ef4444",
    DISABLED: "#9ca3af",
  },
  dark: {
    YELLOW: "#FFD600",
    CARD_BG: "#1f2937",
    BACKGROUND: "#111827",
    BORDER: "#374151",
    TEXT: "#f9fafb",
    ACCENT: "#60a5fa",
    INPUT_BG: "#374151",
    ERROR: "#f87171",
    DISABLED: "#6b7280",
  },
};

function Zone({ nextStep }) {
  const { theme: appTheme } = useTheme();
  const theme = THEME[appTheme === "dark" ? "dark" : "light"];
  const projectId = useSelector((state) => state.user.selectedProject.id);
  
  const [zoneData, setZoneData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [zoneCounts, setZoneCounts] = useState({});
  const [subZoneCounts, setSubZoneCounts] = useState({});
  const [zoneNames, setZoneNames] = useState({});
  const [selectedZones, setSelectedZones] = useState({});
  const [batchZoneCount, setBatchZoneCount] = useState("");
  const [batchSubZoneCount, setBatchSubZoneCount] = useState({});
  
  // Dropdown states
  const [expandedTowers, setExpandedTowers] = useState({});
  const [expandedFloors, setExpandedFloors] = useState({});

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    zonewithbluidlingwithlevel(projectId)
      .then((response) => {
        const result =
          (response.data || []).reduce((obj, tower) => {
            obj[tower.id] = {
              details: { naming_convention: tower.name },
              floors: (tower.levels || []).map((lvl) => ({
                ...lvl,
                level_name: lvl.name,
                zones: (lvl.zones || []).map((zone) => ({
                  ...zone,
                  subZones: zone.subzones || [],
                })),
              })),
            };
            return obj;
          }, {}) || {};
        setZoneData(result);
        // Auto-expand first tower
        if (Object.keys(result).length > 0) {
          setExpandedTowers({ [Object.keys(result)[0]]: true });
        }
        setLoading(false);
      })
      .catch(() => {
        setZoneData(null);
        setLoading(false);
      });
  }, [projectId]);

  const getTowerId = (towerName) =>
    Object.keys(zoneData).find(
      (key) => zoneData[key].details.naming_convention === towerName
    );

  const sortedFloors = (floors) => {
    return [...floors].sort((a, b) => {
      const numA = parseInt(a.level_name.match(/\d+/)?.[0]);
      const numB = parseInt(b.level_name.match(/\d+/)?.[0]);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      if (!isNaN(numA)) return -1;
      if (!isNaN(numB)) return 1;
      return a.level_name.localeCompare(b.level_name);
    });
  };

  const handleAddZonesToAll = () => {
    const num = Number(batchZoneCount);
    if (!num || num < 1) return;
    let newData = { ...zoneData };
    Object.keys(newData).forEach((towerId) => {
      newData[towerId].floors = newData[towerId].floors.map((floor) => {
        const existingZones = floor.zones || [];
        const toAdd = [];
        for (let i = 1; i <= num; i++) {
          toAdd.push({
            name: `Zone ${existingZones.length + i}`,
            subZones: [],
          });
        }
        return { ...floor, zones: existingZones.concat(toAdd) };
      });
    });
    setZoneData(newData);
    setBatchZoneCount("");
  };

  const handleAddZones = (towerName, floorName, numberOfZones) => {
    if (!numberOfZones || numberOfZones <= 0) return;
    const towerId = getTowerId(towerName);
    const floorObj = zoneData[towerId].floors.find(
      (f) => f.level_name === floorName
    );
    const newZones = Array.from(
      { length: Number(numberOfZones) },
      (_, i) => ({
        name: `Zone ${(floorObj.zones?.length || 0) + i + 1}`,
        subZones: [],
      })
    );
    const updatedZoneData = {
      ...zoneData,
      [towerId]: {
        ...zoneData[towerId],
        floors: zoneData[towerId].floors.map((floor) => {
          if (floor.level_name === floorName) {
            return {
              ...floor,
              zones: (floor.zones || []).concat(newZones),
            };
          }
          return floor;
        }),
      },
    };
    setZoneData(updatedZoneData);
    setZoneCounts((prev) => ({
      ...prev,
      [`${towerName}-${floorName}`]: "",
    }));
  };

  const handleSelectAllZones = (
    towerName,
    floorName,
    isAllSelected,
    zoneNamesArr
  ) => {
    const key = `${towerName}__${floorName}`;
    setSelectedZones((prev) => ({
      ...prev,
      [key]: isAllSelected ? [] : zoneNamesArr,
    }));
  };

  const handleDeleteSelectedZones = (towerName, floorName) => {
    const key = `${towerName}__${floorName}`;
    const towerId = getTowerId(towerName);
    if (!selectedZones[key] || selectedZones[key].length === 0) return;

    const updatedZoneData = {
      ...zoneData,
      [towerId]: {
        ...zoneData[towerId],
        floors: zoneData[towerId].floors.map((floor) => {
          if (floor.level_name === floorName) {
            return {
              ...floor,
              zones: (floor.zones || []).filter(
                (zone) => !selectedZones[key].includes(zone.name)
              ),
            };
          }
          return floor;
        }),
      },
    };
    setZoneData(updatedZoneData);
    setSelectedZones((prev) => ({ ...prev, [key]: [] }));
  };

  const handleAddSubZonesToAll = (
    towerName,
    floorName,
    numberOfSubZones,
    onlySelected = false
  ) => {
    if (!numberOfSubZones || numberOfSubZones <= 0) return;
    const towerId = getTowerId(towerName);
    const key = `${towerName}__${floorName}`;
    const floorObj = zoneData[towerId].floors.find(
      (f) => f.level_name === floorName
    );
    let zoneNamesArr = (floorObj.zones || []).map((z) => z.name);
    let zonesToUpdate = onlySelected ? selectedZones[key] || [] : zoneNamesArr;
    const updatedZoneData = {
      ...zoneData,
      [towerId]: {
        ...zoneData[towerId],
        floors: zoneData[towerId].floors.map((floor) => {
          if (floor.level_name === floorName) {
            return {
              ...floor,
              zones: (floor.zones || []).map((zone) => {
                if (zonesToUpdate.includes(zone.name)) {
                  const nextSubIndex = (zone.subZones?.length || 0) + 1;
                  const newSubs = Array.from(
                    { length: Number(numberOfSubZones) },
                    (_, i) => ({
                      name: `Sub-Zone ${nextSubIndex + i}`,
                      subZones: [],
                    })
                  );
                  return {
                    ...zone,
                    subZones: (zone.subZones || []).concat(newSubs),
                  };
                }
                return zone;
              }),
            };
          }
          return floor;
        }),
      },
    };
    setZoneData(updatedZoneData);
    setBatchSubZoneCount((prev) => ({ ...prev, [key]: "" }));
  };

  const handleAddSubZones = (towerName, floorName, zonePath, numberOfSubZones) => {
    if (!numberOfSubZones || numberOfSubZones <= 0) return;
    const towerId = getTowerId(towerName);
    const newSubZones = Array.from({ length: Number(numberOfSubZones) }, (_, i) => ({
      name: `Sub-Zone ${i + 1}`,
      subZones: [],
    }));
    if (!zonePath || zonePath.length !== 1) return;
    const updateZones = (zones) =>
      zones.map((zone) => {
        if (zone.name === zonePath[0]) {
          return {
            ...zone,
            subZones: [...(zone.subZones || []), ...newSubZones],
          };
        }
        return zone;
      });
    const updatedZoneData = {
      ...zoneData,
      [towerId]: {
        ...zoneData[towerId],
        floors: zoneData[towerId].floors.map((floor) => {
          if (floor.level_name === floorName) {
            return {
              ...floor,
              zones: updateZones(floor.zones || []),
            };
          }
          return floor;
        }),
      },
    };
    setZoneData(updatedZoneData);
    setSubZoneCounts((prev) => ({
      ...prev,
      [`${towerName}-${floorName}-${zonePath.join("-")}`]: "",
    }));
  };

  const handleDeleteZone = (towerName, floorName, zonePath) => {
    const towerId = getTowerId(towerName);
    const deleteZones = (zones, pathIndex = 0) => {
      if (!zones) return zones;
      return zones
        .map((zone) => {
          if (zone.name === zonePath[pathIndex]) {
            if (pathIndex === zonePath.length - 1) return null;
            return {
              ...zone,
              subZones: deleteZones(zone.subZones || [], pathIndex + 1),
            };
          }
          return zone;
        })
        .filter(Boolean);
    };
    const updatedZoneData = {
      ...zoneData,
      [towerId]: {
        ...zoneData[towerId],
        floors: zoneData[towerId].floors.map((floor) => {
          if (floor.level_name === floorName) {
            return {
              ...floor,
              zones: deleteZones(floor.zones || []),
            };
          }
          return floor;
        }),
      },
    };
    setZoneData(updatedZoneData);
  };

  const handleRenameZones = (towerName, floorName, zonePath, newName) => {
    const towerId = getTowerId(towerName);
    const renameZones = (zones, pathIndex = 0) => {
      if (!zones) return zones;
      return zones.map((zone) => {
        if (zone.name === zonePath[pathIndex]) {
          if (pathIndex === zonePath.length - 1) {
            return { ...zone, name: newName };
          }
          return {
            ...zone,
            subZones: renameZones(zone.subZones || [], pathIndex + 1),
          };
        }
        return zone;
      });
    };
    const updatedZoneData = {
      ...zoneData,
      [towerId]: {
        ...zoneData[towerId],
        floors: zoneData[towerId].floors.map((floor) => {
          if (floor.level_name === floorName) {
            return {
              ...floor,
              zones: renameZones(floor.zones || []),
            };
          }
          return floor;
        }),
      },
    };
    setZoneData(updatedZoneData);
  };

  const renderZones = (
    zones,
    towerName,
    floorName,
    parentPath = [],
    isMainZone = true
  ) => {
    const key = `${towerName}__${floorName}`;
    return (
      <div className="space-y-2">
        {zones?.map((zone, idx) => {
          const zoneName = zone.name;
          const currentPath = [...parentPath, zoneName];
          if (!zoneName) return null;
          const isSelected = (selectedZones[key] || []).includes(zoneName);
          return (
            <div key={zoneName + idx}>
              <div
                className={`flex items-center gap-2 p-2 rounded border ${
                  isMainZone ? 'bg-blue-50' : 'bg-gray-50'
                }`}
                style={{
                  backgroundColor: isMainZone
                    ? (appTheme === 'dark' ? '#1e3a8a20' : '#eff6ff')
                    : theme.INPUT_BG,
                  borderColor: theme.BORDER,
                }}
              >
                {isMainZone && (
                  <button
                    onClick={() => {
                      setSelectedZones((prev) => {
                        const cur = prev[key] || [];
                        return {
                          ...prev,
                          [key]: cur.includes(zoneName)
                            ? cur.filter((z) => z !== zoneName)
                            : [...cur, zoneName],
                        };
                      });
                    }}
                    className="text-blue-600"
                  >
                    {isSelected ? (
                      <CheckSquare size={16} />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                )}
                
                <input
                  type="text"
                  value={
                    zoneNames[`${towerName}-${floorName}-${zoneName}`] ||
                    zoneName
                  }
                  onChange={(e) =>
                    setZoneNames({
                      ...zoneNames,
                      [`${towerName}-${floorName}-${zoneName}`]: e.target.value,
                    })
                  }
                  onBlur={() =>
                    handleRenameZones(
                      towerName,
                      floorName,
                      currentPath,
                      zoneNames[
                        `${towerName}-${floorName}-${zoneName}`
                      ] || zoneName
                    )
                  }
                  className="flex-1 px-2 py-1 text-sm border rounded"
                  style={{
                    borderColor: theme.BORDER,
                    backgroundColor: theme.CARD_BG,
                    color: theme.TEXT,
                  }}
                />
                
                {isMainZone && (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      value={
                        subZoneCounts[
                          `${towerName}-${floorName}-${currentPath.join("-")}`
                        ] || ""
                      }
                      onChange={(e) =>
                        setSubZoneCounts((prev) => ({
                          ...prev,
                          [`${towerName}-${floorName}-${currentPath.join("-")}`]:
                            e.target.value,
                        }))
                      }
                      className="w-12 px-1 py-1 text-xs border rounded text-center"
                      style={{
                        borderColor: theme.BORDER,
                        backgroundColor: theme.INPUT_BG,
                        color: theme.TEXT,
                      }}
                      placeholder="0"
                    />
                    <button
                      onClick={() =>
                        handleAddSubZones(
                          towerName,
                          floorName,
                          currentPath,
                          subZoneCounts[
                            `${towerName}-${floorName}-${currentPath.join("-")}`
                          ]
                        )
                      }
                      className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      +Sub
                    </button>
                  </div>
                )}
                
                <button
                  onClick={() =>
                    handleDeleteZone(towerName, floorName, currentPath)
                  }
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              
              {zone.subZones && zone.subZones.length > 0 && (
                <div className="ml-6 mt-1">
                  {renderZones(
                    zone.subZones,
                    towerName,
                    floorName,
                    currentPath,
                    false
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const handleSaveZones = async () => {
    if (!zoneData || !projectId) return;
    setSaving(true);
    setSaveMessage("");
    try {
      let savePayload = [];
      Object.keys(zoneData).forEach((towerId) => {
        (zoneData[towerId].floors || []).forEach((floor) => {
          savePayload.push({
            level: floor.id,
            zones: (floor.zones || []).map((zone) => ({
              name: zone.name,
              subzones: (zone.subZones || []).map((subzone) => ({
                name: subzone.name,
              })),
            })),
          });
        });
      });
      await NestedZonenSubzone(savePayload);

      setSaveMessage("Saved!");
      setTimeout(() => {
        setSaveMessage("");
        if (nextStep) nextStep();
      }, 1500);
    } catch (error) {
      setSaveMessage("Error!");
      setTimeout(() => setSaveMessage(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: theme.BACKGROUND }}>
        <div className="flex items-center gap-2" style={{ color: theme.ACCENT }}>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!zoneData || Object.keys(zoneData).length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: theme.BACKGROUND }}>
        <div className="text-center p-8 rounded-lg" style={{ background: theme.CARD_BG, color: theme.TEXT }}>
          <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: theme.ACCENT }} />
          <div>No zones configured yet.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4" style={{ background: theme.BACKGROUND }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 p-4 rounded-lg" style={{ background: theme.CARD_BG }}>
          <h2 className="text-xl font-bold" style={{ color: theme.ACCENT }}>
            Zone Configuration
          </h2>
          <div className="flex items-center gap-3">
            {saveMessage && (
              <span className={`text-sm px-3 py-1 rounded ${saveMessage.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                {saveMessage}
              </span>
            )}
            <button
              onClick={handleSaveZones}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {/* Batch Add */}
        <div className="mb-4 p-3 rounded-lg flex items-center gap-3" style={{ background: theme.CARD_BG }}>
          <span className="text-sm font-medium" style={{ color: theme.TEXT }}>Quick Add:</span>
          <input
            type="number"
            min="1"
            value={batchZoneCount}
            onChange={(e) => setBatchZoneCount(e.target.value)}
            className="w-16 px-2 py-1 text-sm border rounded text-center"
            style={{ borderColor: theme.BORDER, background: theme.INPUT_BG, color: theme.TEXT }}
            placeholder="0"
          />
          <button
            onClick={handleAddZonesToAll}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add to All Floors
          </button>
        </div>

        {/* Towers */}
        <div className="space-y-3">
          {Object.keys(zoneData).map((towerId) => (
            <div key={towerId} className="border rounded-lg" style={{ backgroundColor: theme.CARD_BG, borderColor: theme.BORDER }}>
              {/* Tower Header */}
              <button
                onClick={() => setExpandedTowers(prev => ({ ...prev, [towerId]: !prev[towerId] }))}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50"
                style={{ color: theme.ACCENT }}
              >
                <span className="font-medium">{zoneData[towerId].details.naming_convention}</span>
                {expandedTowers[towerId] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              
              {/* Tower Content */}
              {expandedTowers[towerId] && (
                <div className="border-t px-3 pb-3" style={{ borderColor: theme.BORDER }}>
                  {sortedFloors(zoneData[towerId]?.floors).map((floor) => {
                    const key = `${zoneData[towerId].details.naming_convention}__${floor.level_name}`;
                    const floorKey = `${towerId}-${floor.level_name}`;
                    const allZoneNames = (floor.zones || []).map((z) => z.name);
                    const allSelected = allZoneNames.length && selectedZones[key]?.length === allZoneNames.length;
                    const hasSelectedZones = selectedZones[key]?.length > 0;
                    
                    return (
                      <div key={floor.level_name} className="mt-3 border rounded" style={{ borderColor: theme.BORDER }}>
                        {/* Floor Header */}
                        <button
                          onClick={() => setExpandedFloors(prev => ({ ...prev, [floorKey]: !prev[floorKey] }))}
                          className="w-full flex items-center justify-between p-2 text-sm hover:bg-gray-50"
                          style={{ color: theme.TEXT }}
                        >
                          <span className="font-medium">{floor.level_name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {floor.zones?.length || 0} zones
                            </span>
                            {expandedFloors[floorKey] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </div>
                        </button>
                        
                        {/* Floor Content */}
                        {expandedFloors[floorKey] && (
                          <div className="border-t p-3 space-y-3" style={{ borderColor: theme.BORDER }}>
                            {/* Floor Controls */}
                            <div className="space-y-2">
                              {/* Add Zones */}
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="1"
                                  value={zoneCounts[`${zoneData[towerId].details.naming_convention}-${floor.level_name}`] || ""}
                                  onChange={(e) =>
                                    setZoneCounts((prev) => ({
                                      ...prev,
                                      [`${zoneData[towerId].details.naming_convention}-${floor.level_name}`]: e.target.value,
                                    }))
                                  }
                                  className="w-16 px-2 py-1 text-sm border rounded text-center"
                                  style={{ borderColor: theme.BORDER, background: theme.INPUT_BG, color: theme.TEXT }}
                                  placeholder="0"
                                />
                                <button
                                  onClick={() =>
                                    handleAddZones(
                                      zoneData[towerId].details.naming_convention,
                                      floor.level_name,
                                      zoneCounts[`${zoneData[towerId].details.naming_convention}-${floor.level_name}`]
                                    )
                                  }
                                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                  Add Zones
                                </button>
                              </div>
                              
                              {/* Selection & Batch Sub-zones */}
                              {floor.zones && floor.zones.length > 0 && (
                                <div className="flex items-center gap-2 text-sm">
                                  <button
                                    onClick={() =>
                                      handleSelectAllZones(
                                        zoneData[towerId].details.naming_convention,
                                        floor.level_name,
                                        allSelected,
                                        allZoneNames
                                      )
                                    }
                                    className={`px-2 py-1 border rounded ${allSelected ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}`}
                                    style={{ borderColor: theme.BORDER }}
                                  >
                                    {allSelected ? "Unselect All" : "Select All"}
                                  </button>
                                  <button
                                    disabled={!hasSelectedZones}
                                    onClick={() =>
                                      handleDeleteSelectedZones(
                                        zoneData[towerId].details.naming_convention,
                                        floor.level_name
                                      )
                                    }
                                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Delete Selected
                                  </button>
                                  <div className="flex items-center gap-1 ml-auto">
                                    <input
                                      type="number"
                                      min="1"
                                      value={batchSubZoneCount[key] || ""}
                                      onChange={(e) =>
                                        setBatchSubZoneCount((prev) => ({
                                          ...prev,
                                          [key]: e.target.value,
                                        }))
                                      }
                                      className="w-12 px-1 py-1 text-xs border rounded text-center"
                                      style={{ borderColor: theme.BORDER, background: theme.INPUT_BG, color: theme.TEXT }}
                                      placeholder="0"
                                    />
                                    <button
                                      onClick={() =>
                                        handleAddSubZonesToAll(
                                          zoneData[towerId].details.naming_convention,
                                          floor.level_name,
                                          batchSubZoneCount[key]
                                        )
                                      }
                                      className="px-2 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600"
                                    >
                                      +All
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleAddSubZonesToAll(
                                          zoneData[towerId].details.naming_convention,
                                          floor.level_name,
                                          batchSubZoneCount[key],
                                          true
                                        )
                                      }
                                      className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                    >
                                      +Sel
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Warning */}
                            {(!floor?.zones || floor?.zones?.length === 0) && (
                              <div className="text-xs text-red-600 bg-red-50 p-2 rounded flex items-center gap-1">
                                <AlertCircle size={12} />
                                At least 1 zone required
                              </div>
                            )}
                            
                            {/* Zones */}
                            {floor?.zones?.length > 0 && (
                              renderZones(
                                floor?.zones || [],
                                zoneData[towerId].details.naming_convention,
                                floor.level_name
                              )
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Zone;
import React, { useEffect, useState } from "react";
import { getLevelsWithFlatsByBuilding } from "../api";
import { useParams } from "react-router-dom";

function FlatMatrixTable({ towerName = "B" }) {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    setLoading(true);
    setApiError(null);
    (async () => {
      try {
        const res = await getLevelsWithFlatsByBuilding(id);
        setLevels(res.data || []);
        console.log("API Levels Data:", res.data);
      } catch {
        setApiError("Failed to fetch levels/flats.");
        setLevels([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Get the max number of flats across all levels for perfect grid alignment
  const maxFlats = Math.max(...levels.map(l => (l.flats || []).length), 0);

  if (loading) return <div>Loading...</div>;
  if (apiError) return <div>{apiError}</div>;
  if (!levels.length) return <div>No data</div>;

  return (
    <div className="w-full py-8 px-8">
      <div className="flex items-center mb-6">
        <span className="text-2xl font-bold text-purple-700">Tower : {towerName}</span>
      </div>
      
      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200 mx-4">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left py-5 px-8 font-medium text-gray-700 border-r border-gray-200 min-w-[140px]">
                Level
              </th>
              {maxFlats > 0 && Array(maxFlats).fill(0).map((_, colIndex) => (
                <th key={colIndex} className="text-center py-5 px-8 font-medium text-gray-700 border-r border-gray-200 last:border-r-0 min-w-[140px]">
                  Unit {colIndex + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {levels.map((level) => (
              <tr key={level.id} className="border-t border-gray-200">
                <td className="py-5 px-8 font-medium text-gray-700 bg-gray-50 border-r border-gray-200">
                  {level.name}
                </td>
                {Array(maxFlats).fill(0).map((_, colIndex) => {
                  const flat = (level.flats || [])[colIndex];
                  return (
                    <td key={colIndex} className="py-5 px-8 text-center border-r border-gray-200 last:border-r-0">
                      {flat ? (
                        <div className="bg-white border border-gray-300 rounded-lg py-3 px-4 text-center shadow-sm hover:shadow-md transition-shadow">
                          <div className="font-semibold text-gray-800 text-lg">
                            {flat.number}
                          </div>
                          {flat.flattype?.type_name && (
                            <div className="text-xs text-blue-600 mt-1 font-medium">
                              {flat.flattype.type_name}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-gray-100 border border-gray-200 rounded-lg py-3 px-4 h-16"></div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FlatMatrixTable;
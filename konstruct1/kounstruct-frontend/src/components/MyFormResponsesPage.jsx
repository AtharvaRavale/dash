// src/components/MyFormResponsesPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listMyFormResponses, getFormResponse } from "../api";
import { toast } from "react-hot-toast";

const MyFormResponsesPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await listMyFormResponses();
        const data = res.data || [];
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load my form responses", err);
        toast.error("Failed to load your forms.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

//   const handleOpen = async (item) => {
//     // simplest: open detail page by id
//     // TODO: tum baad me yahan edit/forward flow add karoge
//     navigate(`/my-forms/${item.id}`);
//   };
const handleOpen = async (item) => {
  // Pehle yeh tha:
  // navigate(`/my-forms/${item.id}`);

  // Ab hum direct fill page pe le jaayenge same Excel UI ke saath
  // aur response_id pass karenge taaki values prefill ho sakein
  navigate(
    `/project-forms/fill?project_id=${item.project_id}&assignment_id=${item.assignment}&response_id=${item.id}`
  );
};

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">My Forms Inbox</h1>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-gray-500">No forms assigned to you yet.</div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-3 py-2">ID</th>
                <th className="text-left px-3 py-2">Form</th>
                <th className="text-left px-3 py-2">Project</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">From</th>
                <th className="text-left px-3 py-2">Last Updated</th>
                <th className="text-right px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => {
                const id = it.id;
                const formTitle =
                  it.template_title ||
                  it.template_name ||
                  it.form_title ||
                  `Form #${id}`;
                const projectName =
                  it.project_name ||
                  (it.project && it.project.name) ||
                  `#${it.project_id || "-"}`;
                const status =
                  it.latest_decision ||
                  it.status ||
                  it.current_status ||
                  "-";
                const fromUser =
                  it.from_user_name ||
                  (it.created_by && it.created_by.full_name) ||
                  it.created_by_name ||
                  "-";
                const updatedAt =
                  it.updated_at || it.last_action_at || it.created_at || "";

                return (
                  <tr key={id} className="border-b last:border-b-0">
                    <td className="px-3 py-2 align-top">{id}</td>
                    <td className="px-3 py-2 align-top">{formTitle}</td>
                    <td className="px-3 py-2 align-top">{projectName}</td>
                    <td className="px-3 py-2 align-top">
                      <span className="inline-flex items-center px-2 py-[2px] rounded-full bg-gray-100">
                        {status}
                      </span>
                    </td>
                    <td className="px-3 py-2 align-top">{fromUser}</td>
                    <td className="px-3 py-2 align-top text-[10px] text-gray-500">
                      {updatedAt && updatedAt.slice(0, 16).replace("T", " ")}
                    </td>
                    <td className="px-3 py-2 align-top text-right">
                      <button
                        onClick={() => handleOpen(it)}
                        className="px-2 py-1 text-[11px] border rounded bg-blue-50 hover:bg-blue-100"
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyFormResponsesPage;

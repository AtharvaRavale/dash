import React, { useEffect, useState } from "react";
import SiteBarHome from "./SiteBarHome";
import { checklistInstance } from "../api/axiosInstance";

function MyInProgressSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [photoFiles, setPhotoFiles] = useState({});

  // Load in-progress submissions
  useEffect(() => {
    fetchSubmissions();
    // eslint-disable-next-line
  }, []);

  async function fetchSubmissions() {
    setLoading(true);
    setError(null);
    try {
      const res = await checklistInstance.get("my-inprogress-checklistitem-submissions/");
      setSubmissions(res.data);
    } catch (err) {
      setError(
        (err.response && err.response.data && JSON.stringify(err.response.data)) ||
        err.message ||
        "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  const getChecklistItemLabel = (item) => {
    if (item.checklist_item_description) return item.checklist_item_description;
    if (typeof item.checklist_item === "object" && item.checklist_item.description)
      return item.checklist_item.description;
    return `Checklist Item #${item.checklist_item}`;
  };

  // Handler for PATCH
  async function patchSubmission(submissionId, photoRequired) {
    setUpdatingId(submissionId);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("submission_id", submissionId);
      // Only attach photo if file is chosen
      if (photoFiles[submissionId]) {
        formData.append("maker_photo", photoFiles[submissionId]);
      }
      // PATCH to /patch-checklistitemsubmission/
      await checklistInstance.patch("patch-checklistitemsubmission/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setPhotoFiles((prev) => {
        const copy = { ...prev };
        delete copy[submissionId];
        return copy;
      });
      await fetchSubmissions();
    } catch (err) {
      setError(
        (err.response && err.response.data && JSON.stringify(err.response.data)) ||
        err.message ||
        "Update failed."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const handleFileChange = (submissionId, e) => {
    setPhotoFiles((prev) => ({
      ...prev,
      [submissionId]: e.target.files[0],
    }));
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SiteBarHome />
      <main className="ml-[15%] w-full p-6">
        <h2 className="text-2xl font-bold mb-4">My In-Progress Checklist Item Submissions</h2>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && submissions.length === 0 && (
          <p>No in-progress submissions found.</p>
        )}

        <ul className="space-y-4">
          {submissions.map((item) => (
            <li
              key={item.id}
              className="bg-white p-4 rounded-md shadow border border-gray-100"
            >
              <div className="font-semibold text-lg mb-2">
                {getChecklistItemLabel(item)}
              </div>
              <div className="text-gray-600 mb-1">
                <strong>Status:</strong>{" "}
                <span className="font-semibold text-yellow-600">
                  {item.status}
                </span>
              </div>
              <div className="text-gray-600 mb-1">
                <strong>Accepted At:</strong>{" "}
                {item.accepted_at ? new Date(item.accepted_at).toLocaleString() : "—"}
              </div>
              <div className="text-gray-600 mb-1">
                <strong>Photo Required:</strong>{" "}
                <span className={item.photo_required ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}>
                  {item.photo_required ? "Yes" : "No"}
                </span>
              </div>
              {item.selected_option && (
                <div className="text-gray-600 mb-1">
                  <strong>Selected Option:</strong> {item.selected_option}
                </div>
              )}
              {item.check_remark && (
                <div className="text-gray-600">
                  <strong>Remark:</strong> {item.check_remark}
                </div>
              )}

              {/* If photo required: must upload photo. If not: photo optional */}
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  className="mt-2"
                  onChange={(e) => handleFileChange(item.id, e)}
                  disabled={updatingId === item.id}
                />
                <button
                  className={`mt-2 px-4 py-2 rounded text-white ${
                    (item.photo_required && !photoFiles[item.id]) || updatingId === item.id
                      ? "bg-gray-400 cursor-not-allowed"
                      : item.photo_required
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-green-600 hover:bg-green-700"
                  }`}
                  disabled={(item.photo_required && !photoFiles[item.id]) || updatingId === item.id}
                  onClick={() => patchSubmission(item.id, item.photo_required)}
                >
                  {updatingId === item.id
                    ? (item.photo_required ? "Submitting..." : "Updating...")
                    : (item.photo_required ? "Submit Photo" : "Mark as Done")}
                </button>
                {/*
                  For optional photo, you could add a second button if you want
                  but this keeps it simple!
                */}
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

export default MyInProgressSubmissions;

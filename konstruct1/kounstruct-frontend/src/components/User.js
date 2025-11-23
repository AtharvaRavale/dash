import { useState } from "react";
import { MdOutlineCancel } from "react-icons/md";
import { useTheme } from "../ThemeContext";

export default function User() {
  const [isAdd, setAdd] = useState(false);
  const { theme } = useTheme();

  // Strict palette
  const ORANGE = "#ea6822";
  const BG_OFFWHITE = "#fff8f2";
  const bgColor = theme === "dark" ? "#191922" : BG_OFFWHITE;
  const cardColor = theme === "dark" ? "#23232c" : "#fff";
  const borderColor = ORANGE;
  const textColor = theme === "dark" ? "#fff" : "#222";
  const iconColor = ORANGE;

  const handleAdd = () => {
    setAdd(true);
  };

  return (
    <div
      className="p-4 sm:p-6 max-w-7xl mx-auto rounded shadow-lg"
      style={{ background: bgColor, minHeight: "100vh" }}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4" style={{ color: iconColor }}>
          USERS
        </h1>
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="search"
            placeholder="Search"
            className="px-3 py-2 border rounded-md"
            style={{
              borderColor: borderColor,
              background: cardColor,
              color: textColor,
              minWidth: 200,
            }}
          />
          <button
            style={{
              background: iconColor,
              color: "#fff",
              borderRadius: 6,
              padding: "0.5rem 1.1rem",
              fontWeight: 600,
            }}
            onClick={handleAdd}
          >
            <span style={{ fontSize: 18, fontWeight: 700 }}>+</span> Add
          </button>
          <button
            style={{
              background: iconColor,
              color: "#fff",
              borderRadius: 6,
              padding: "0.5rem 1.1rem",
              fontWeight: 600,
            }}
          >
            Remove User Access
          </button>
          <button
            style={{
              background: cardColor,
              color: iconColor,
              border: `2px solid ${iconColor}`,
              borderRadius: 6,
              padding: "0.5rem 1.1rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span style={{ fontSize: 18 }}>↓</span> Export
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table
          className="w-full border-collapse rounded-lg"
          style={{ background: cardColor, color: textColor }}
        >
          <thead>
            <tr style={{ background: BG_OFFWHITE }}>
              <th className="text-left p-3 font-semibold">ID</th>
              <th className="text-left p-3 font-semibold">Name</th>
              <th className="text-left p-3 font-semibold">Email</th>
              <th className="text-left p-3 font-semibold">Mobile</th>
              <th className="text-left p-3 font-semibold">Role</th>
              <th className="text-left p-3 font-semibold">Profile</th>
              <th className="text-left p-3 font-semibold">User Type</th>
              <th className="text-left p-3 font-semibold">Status</th>
              <th className="text-left p-3 font-semibold">View</th>
              <th className="text-left p-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(3)].map((_, index) => (
              <tr
                key={index}
                style={{
                  background:
                    index % 2 === 0
                      ? cardColor
                      : theme === "dark"
                      ? "#22222b"
                      : BG_OFFWHITE,
                }}
              >
                <td className="p-3">001</td>
                <td className="p-3">John Doe</td>
                <td className="p-3">john@example.com</td>
                <td className="p-3">+1234567890</td>
                <td className="p-3">Admin</td>
                <td className="p-3">Profile A</td>
                <td className="p-3">Full Access</td>
                <td className="p-3">Active</td>
                <td className="p-3">
                  <button
                    style={{
                      color: "#fff",
                      background: iconColor,
                      borderRadius: 4,
                      padding: "0.25rem 0.7rem",
                    }}
                  >
                    View
                  </button>
                </td>
                <td className="p-3">
                  <button
                    style={{
                      color: iconColor,
                      background: "none",
                      border: `1px solid ${iconColor}`,
                      borderRadius: 4,
                      padding: "0.25rem 0.7rem",
                    }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {isAdd && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div
            className="max-h-[80vh] w-[95vw] sm:w-[480px] rounded-lg shadow-lg border"
            style={{
              background: cardColor,
              border: `2.5px solid ${borderColor}`,
              color: textColor,
            }}
          >
            <div className="flex items-center justify-between mb-6 p-4 border-b" style={{borderColor}}>
              <h1 className="text-lg font-bold" style={{ color: iconColor }}>
                CREATE USER
              </h1>
              <button
                className="text-gray-600 hover:text-gray-800"
                onClick={() => setAdd(false)}
                style={{ color: iconColor, background: "none", border: "none" }}
              >
                <MdOutlineCancel size={28} />
              </button>
            </div>

            <div className="flex justify-center mb-6">
              <div className="relative">
                <div
                  className="w-20 h-20 bg-[#fff8f2] rounded-full flex items-center justify-center border"
                  style={{
                    borderColor,
                    color: iconColor,
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 14c-3.866 0-7 1.79-7 4v2h14v-2c0-2.21-3.134-4-7-4zm0-2a4 4 0 100-8 4 4 0 000 8z"
                    />
                  </svg>
                </div>
                <button
                  className="absolute bottom-0 right-0"
                  style={{
                    background: iconColor,
                    color: "#fff",
                    padding: 7,
                    borderRadius: "50%",
                    border: `2px solid ${borderColor}`,
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[55vh] px-5 pb-5">
              <form className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      First Name<span style={{ color: "#ea6822" }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      style={{
                        borderColor,
                        background: bgColor,
                        color: textColor,
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Last Name<span style={{ color: "#ea6822" }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      style={{
                        borderColor,
                        background: bgColor,
                        color: textColor,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email<span style={{ color: "#ea6822" }}>*</span>
                  </label>
                  <input
                    type="email"
                    className="w-full p-2 border rounded"
                    style={{
                      borderColor,
                      background: bgColor,
                      color: textColor,
                    }}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Mobile<span style={{ color: "#ea6822" }}>*</span>
                    </label>
                    <input
                      type="tel"
                      className="w-full p-2 border rounded"
                      style={{
                        borderColor,
                        background: bgColor,
                        color: textColor,
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Password<span style={{ color: "#ea6822" }}>*</span>
                    </label>
                    <input
                      type="password"
                      className="w-full p-2 border rounded"
                      style={{
                        borderColor,
                        background: bgColor,
                        color: textColor,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Role<span style={{ color: "#ea6822" }}>*</span>
                  </label>
                  <select
                    className="w-full p-2 border rounded"
                    style={{
                      borderColor,
                      background: bgColor,
                      color: textColor,
                    }}
                  >
                    <option value="">Select Role</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Profile<span style={{ color: "#ea6822" }}>*</span>
                  </label>
                  <select
                    className="w-full p-2 border rounded"
                    style={{
                      borderColor,
                      background: bgColor,
                      color: textColor,
                    }}
                  >
                    <option value="">Profile</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">User Type</label>
                  <select
                    className="w-full p-2 border rounded"
                    style={{
                      borderColor,
                      background: bgColor,
                      color: textColor,
                    }}
                  >
                    <option value="">Select User Type</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Project Associated</label>
                  <select
                    className="w-full p-2 border rounded"
                    style={{
                      borderColor,
                      background: bgColor,
                      color: textColor,
                    }}
                  >
                    <option value="">Project 1</option>
                    <option value="">Project 2</option>
                    <option value="">Project 3</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full mt-3"
                  style={{
                    background: iconColor,
                    color: "#fff",
                    padding: "0.7rem 0",
                    borderRadius: 8,
                    fontWeight: 700,
                  }}
                >
                  Create
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

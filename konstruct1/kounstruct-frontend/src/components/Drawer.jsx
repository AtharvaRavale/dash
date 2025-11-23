import React from "react";
import { IoMdClose } from "react-icons/io";

function Drawer({ onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black opacity-30"
        onClick={onClose}
      ></div>

      {/* Drawer Panel */}
      <div className="relative w-96 h-full bg-gray-700 shadow-xl z-50 transition-transform duration-300 transform translate-x-0">
        <button
          onClick={onClose}
          className="absolute top-0 -left-9 text-xl bg-white text-gray-700 rounded-full p-1"
        >
          <IoMdClose />
        </button>

        <div className="mt-10">{children}</div>
      </div>
    </div>
  );
}

export default Drawer;

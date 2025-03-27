"use client";
import React from "react";

interface FloatingStatusButtonProps {
  pendingCount: number;
  onClick: () => void;
}

const FloatingStatusButton: React.FC<FloatingStatusButtonProps> = ({ pendingCount, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-blue-700 transition duration-300 flex items-center z-10"
    >
      <span className="text-sm font-semibold">
        {pendingCount > 0 ? `${pendingCount} Pending Collection` : "0 Pending Collection"}
      </span>
    </button>
  );
};

export default FloatingStatusButton;
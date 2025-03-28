"use client";
import React from "react";

interface FloatingStatusButtonProps {
  pendingCount: number;
  onClick: () => void;
}

const FloatingStatusButton: React.FC<FloatingStatusButtonProps> = ({ pendingCount, onClick }) => {
  if (pendingCount === 0) return null;
  
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-red-500 text-white px-4 py-3 rounded-full shadow-lg hover:bg-red-400 transition duration-300 flex items-center z-50"
    >
      <span className="text-sm font-semibold">
        {pendingCount} Pending Collection
      </span>
    </button>
  );
};

export default FloatingStatusButton;
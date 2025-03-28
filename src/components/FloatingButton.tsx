"use client";
import React from "react";
import { FiPackage } from "react-icons/fi";

interface FloatingStatusButtonProps {
  pendingCount: number;
  onClick: () => void;
}

const FloatingStatusButton: React.FC<FloatingStatusButtonProps> = ({ pendingCount, onClick }) => {
  if (pendingCount === 0) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-red-500 text-white px-4 py-3 rounded-full shadow-lg hover:bg-red-400 transition duration-300 flex items-center z-50 animate-bounce"
    >
      <FiPackage className="text-xl mr-2" />

      <span className="text-sm font-semibold">Pending</span>

      {/* Notification Badge */}
      <div className="absolute -top-2 -left-2 bg-white text-red-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md border border-red-500">
        {pendingCount}
      </div>
    </button>
  );
};

export default FloatingStatusButton;
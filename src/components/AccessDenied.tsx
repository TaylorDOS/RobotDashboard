"use client";

import { signIn } from "next-auth/react";
import { FiLogIn } from "react-icons/fi";

export default function AccessDenied() {
  return (
    <div className="flex items-center justify-center h-[91vh] bg-gradient-to-br from-blue-100 to-blue-200 px-4">
      <div className="max-w-md w-full p-8 bg-white shadow-2xl rounded-2xl text-center">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-blue-100 text-blue-600 p-4 rounded-full shadow-sm">
            <FiLogIn className="text-4xl" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900">Authentication Required</h1>

        {/* Description */}
        <p className="text-gray-600 mt-2">
          Sign in to access the delivery system.
        </p>

        {/* CTA Button */}
        <button
          onClick={() => signIn()}
          className="mt-6 w-full px-6 py-3 bg-blue-600 text-white font-medium text-lg rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <FiLogIn className="text-xl" />
          Sign In
        </button>
      </div>
    </div>
  );
}
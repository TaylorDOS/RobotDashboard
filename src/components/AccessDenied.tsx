"use client";

import { signIn } from "next-auth/react";

export default function AccessDenied() {
  return (
    <div className="flex items-center justify-center h-[91vh] bg-gradient-to-r from-blue-200 to-purple-200">
      <div className="max-w-md p-8 bg-white shadow-xl rounded-2xl text-center">
        <div className="flex justify-center">
          
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Welcome</h1>
        <p className="text-gray-600 mt-2">
          Please sign in to schedule a delivery
        </p>
        <button
          onClick={() => signIn()}
          className="mt-6 px-6 py-3 bg-blue-600 text-white font-medium text-lg rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
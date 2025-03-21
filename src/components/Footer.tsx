"use client";

import Link from "next/link";
import Image from "next/image";
import React from "react";
import { FaGithub, FaGlobe } from "react-icons/fa";

export function Footer() {
  const navigation = ["Deliver", "Overview"];

  return (
    <div className="relative mx-auto max-w-screen-xl px-4 sm:px-8 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-10 mt-5 border-t border-gray-200">
        {/* Logo & Description */}
        <div className="text-center md:text-left">
          <Link
            href="/"
            className="flex justify-center md:justify-start items-center space-x-2 text-2xl font-bold dark:text-gray-100"
          >
            <Image
              src="/img/logo.png"
              alt="RobotDashboard Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span>RobotDashboard</span>
          </Link>
          <p className="mt-4 text-gray-800 dark:text-gray-300">
            SUTD Capstone S38
          </p>
        </div>

        {/* Navigation */}
        <div className="text-center md:text-left">
          <h3 className="text-lg font-semibold mb-2">Navigation</h3>
          <div className="flex flex-col gap-2">
            {navigation.map((item, index) => (
              <Link
                key={index}
                href="/"
                className="text-gray-600 dark:text-gray-300 hover:text-indigo-500 text-sm"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div className="text-center md:text-left">
          <h3 className="text-lg font-semibold mb-2">Resources</h3>
          <div className="flex justify-center md:justify-start mt-4 space-x-4 text-gray-400">
            <a
              href="https://taylordos-portfolio.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="sr-only">Website</span>
              <FaGlobe className="w-6 h-6 hover:text-blue-600 transition" />
            </a>
            <a
              href="https://github.com/TaylorDOS/RobotDashboard"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="sr-only">GitHub</span>
              <FaGithub className="w-6 h-6 hover:text-blue-600 transition" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Text */}
      <div className="mt-10 text-sm text-center text-gray-600 dark:text-gray-400">
        © 2025 Capstone S38. All rights reserved.
      </div>
    </div>
  );
}
import React, { useState } from "react";
import { FiPackage, FiX } from "react-icons/fi";
import { MdArrowForward } from "react-icons/md";

interface Task {
  taskID: number;
  receiver: string;
  sender: string;
  start_station: string;
  end_station: string;
  slot: number;
  progress: string;
  status: string;
  description: string;
  priority: number;
}

const progressSteps = [
  "Pending",
  "UserDropoff",
  "MoveToStart",
  "Loading",
  "LoadingDone",
  "MoveToEnd",
  "Unloading",
  "UnloadingDone",
  "Completed",
];

const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return "bg-red-100 text-red-600";
      case 2:
        return "bg-yellow-100 text-yellow-600";
      case 3:
        return "bg-green-100 text-green-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <>
      <div
        className={"rounded-lg p-4 sm:p-6 border transition-all relative cursor-pointer hover:shadow-xl bg-white"
        }
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex items-center gap-2">
          <FiPackage className="text-xl sm:text-2xl" />
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 line-clamp-1">{task.description}</h3>
        </div>

        <span className="text-xs sm:text-sm font-semibold text-center block mt-1">
          {task.status}
        </span>

        {/* Sender & Receiver Section */}
        <div className="flex justify-between items-center mt-3 sm:mt-4">
          {/* Sender Section */}
          <div className="flex flex-col items-start">
            <p className="text-xs sm:text-sm text-gray-700">Sender</p>
            <p className="text-sm sm:text-lg font-bold text-blue-600 line-clamp-1">{task.sender}</p>
            <p className="text-xs sm:text-sm font-semibold text-blue-500">Base {task.start_station}</p>
          </div>

          {/* Arrow Indicator with Icon */}
          <div className="flex flex-col items-center text-gray-700">
            <MdArrowForward className="text-lg sm:text-xl" />
          </div>

          {/* Receiver Section */}
          <div className="flex flex-col items-end">
            <p className="text-xs sm:text-sm text-gray-700">Receiver</p>
            <p className="text-sm sm:text-lg font-bold text-red-600 line-clamp-1">{task.receiver}</p>
            <p className="text-xs sm:text-sm font-semibold text-red-500">Base {task.end_station}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="w-full mt-2">
          <p className="text-xs sm:text-sm font-bold text-gray-700">Progress</p>
          <span className="text-xs sm:text-sm font-semibold text-gray-600 line-clamp-1">
            {task.progress}
          </span>
        </div>

        {/* Task ID (Bottom Right) */}
        <div className="absolute bottom-2 right-3 sm:bottom-3 sm:right-4 text-[10px] sm:text-xs text-gray-500 font-medium">
          Task ID: #{task.taskID}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-5">
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-[95%] sm:max-w-xl max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 sm:top-3 sm:right-3 text-gray-500 hover:text-red-400 transition text-2xl"
              aria-label="Close Modal"
            >
              ✖
            </button>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 divide-y lg:divide-y-0 lg:divide-x">
                {/* Left: Task Info */}
                <div className="pr-0 lg:pr-6 space-y-3 sm:space-y-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 line-clamp-2">{task.description}</h2>
                    <p className="text-xs text-gray-500">Task ID: #{task.taskID}</p>
                  </div>

                  <div className="space-y-2 text-sm text-gray-700">
                    <div><strong className="text-gray-900">Sender:</strong> {task.sender}</div>
                    <div><strong className="text-gray-900">Receiver:</strong> {task.receiver}</div>
                    <div><strong className="text-gray-900">Start:</strong> {task.start_station}</div>
                    <div><strong className="text-gray-900">End:</strong> {task.end_station}</div>
                    <div><strong className="text-gray-900">Slot:</strong> {task.slot}</div>
                    <div className="flex items-center">
                      <strong className="text-gray-900 mr-2">Priority:</strong>
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <strong className="text-gray-900 mr-2">Status:</strong>
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${task.status === "Completed" ? "bg-green-100 text-green-600" : task.status === "Ongoing" ? "bg-blue-100 text-blue-600" : "bg-red-100 text-red-600"}`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Progress Tracker */}
                <div className="pl-0 lg:pl-6 pt-4 lg:pt-0">
                  <strong className="block text-sm text-gray-900 mb-3 sm:mb-4">Progress:</strong>
                  <div className="flex flex-col items-center justify-center">
                    {progressSteps.map((step, index) => {
                      const isCompleted = progressSteps.indexOf(task.progress) >= index;

                      return (
                        <div key={index} className="relative flex flex-col items-center w-full">
                          {index !== 0 && (
                            <div className="left-1/2 transform h-6 sm:h-8 flex flex-col items-center w-full">
                              <div className={`my-1 w-[2px] h-full ${isCompleted ? "bg-blue-300" : "bg-gray-300"}`} />
                            </div>
                          )}

                          <div
                            className={`w-full text-center rounded-full py-1 text-xs sm:text-sm font-medium
              ${isCompleted ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"}`}
                          >
                            {step}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskCard;
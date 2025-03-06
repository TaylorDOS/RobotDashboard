import React, { useState } from "react";
import { FiPackage } from "react-icons/fi";
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
      {/* Task Card */}
      <div
        className={` rounded-lg p-6 border transition-all relative cursor-pointer hover:shadow-xl
        ${{
            Ongoing: "bg-blue-50 border-blue-300",
            PendingCollection: "bg-orange-50 border-orange-300",
            Completed: "bg-gray-50 border-gray-300",
          }[task.status] || "bg-red-50 border-red-300"}`}
        onClick={() => setIsModalOpen(true)}
      >
        <h3 className="text-xl font-bold text-gray-800">{task.description}</h3>

        <span className="text-sm font-semibold text-center">
          {task.status}
        </span>

        {/* Sender & Receiver Section */}
        <div className="flex justify-between items-center mt-4">
          {/* Sender Section */}
          <div className="flex flex-col items-start">
            <p className="text-sm text-gray-700">Sender</p>
            <p className="text-lg font-bold text-blue-600">{task.sender}</p>
            <p className="text-sm font-semibold text-blue-500">Base Station {task.start_station}</p>
          </div>

          {/* Arrow Indicator with Icon */}
          <div className="flex flex-col items-center text-gray-700">
            <FiPackage className="text-xl mb-1" />
            <MdArrowForward className="text-xl" />
          </div>

          {/* Receiver Section */}
          <div className="flex flex-col items-end">
            <p className="text-sm text-gray-700">Receiver</p>
            <p className="text-lg font-bold text-red-600">{task.receiver}</p>
            <p className="text-sm font-semibold text-red-500">Base Station {task.end_station}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="w-full mt-2">
          <p className="text-sm font-bold text-gray-700">Progress</p>
          <span
            className="w-full text-sm font-semibold text-gray-600">
            {task.progress}
          </span>
        </div>

        {/* Task ID (Bottom Right) */}
        <div className="absolute bottom-3 right-4 text-xs text-gray-500 font-medium">
          Task ID: #{task.taskID}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl relative mx-4">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✖
            </button>

            <h2 className="text-2xl font-bold text-gray-900">{task.description}</h2>
            <div className="text-gray-900 mb-4 text-xs">Task ID: {task.taskID}

            </div>

            {/* Task Details */}
            <div className="grid grid-cols-2 gap-4 text-gray-700 text-sm">

              <p><strong className="text-gray-900">Sender:</strong> {task.sender}</p>
              <p><strong className="text-gray-900">Receiver:</strong> {task.receiver}</p>
              <p><strong className="text-gray-900">Start:</strong> {task.start_station}</p>
              <p><strong className="text-gray-900">End:</strong> {task.end_station}</p>
              <p><strong className="text-gray-900">Slot:</strong> {task.slot}</p>
              <p> <strong className="text-gray-900">Priority:</strong>
                <span className={`ml-2 px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(task.priority)}`}>{task.priority}</span>
              </p>

              <p className="col-span-2 flex items-center">
                <strong className="text-gray-900">Status:</strong>
                <span className={`ml-2 px-3 py-1 text-sm font-medium rounded-full ${task.status === "Completed" ? "bg-green-100 text-green-600" : task.status === "Ongoing" ? "bg-blue-100 text-blue-600" : "bg-red-100 text-red-600"}`}>
                  {task.status}
                </span>
              </p>
            </div>

            {/* Progress Tracker */}
            <div className="relative items-center mt-4">
              <strong className="text-gray-900 text-sm">Progress:</strong>
              <div className="flex flex-col items-center justify-center">
                {progressSteps.map((step, index) => {
                  const isCompleted = progressSteps.indexOf(task.progress) >= index;

                  return (
                    <div key={index} className="relative flex flex-col items-center w-full">

                      {index !== 0 && (
                        <div
                          className="left-1/2 transform h-8 flex flex-col items-center w-full"
                        >
                          <div className={`my-1 w-[2px] h-full ${isCompleted ? "bg-blue-300" : "bg-gray-300"}`} />

                        </div>
                      )}

                      <div
                        className={`lg:w-1/2 w-full p-1 text-center rounded-full text-sm font-bold
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
      )}
    </>
  );
};

export default TaskCard;
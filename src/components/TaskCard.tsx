import React, { useState } from "react";

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

const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getPriorityColor = (priority: Number) => {
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
        className="bg-white shadow-lg rounded-lg p-6 border border-gray-300 hover:shadow-xl transition-all relative cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        {/* Task Description as Title */}
        <h3 className="text-xl font-bold text-gray-800 mb-4">{task.description}</h3>

        {/* Sender & Receiver Section */}
        <div className="flex justify-between items-center">
          {/* Sender */}
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-700">Sender</p>
            <p className="text-lg font-bold text-blue-600">{task.sender}</p>
            <p className="text-sm text-gray-600">{task.start_station}</p>
          </div>

          {/* Arrow Indicator */}
          <div className="text-gray-500 text-xl font-bold">→</div>

          {/* Receiver */}
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-700">Receiver</p>
            <p className="text-lg font-bold text-red-600">{task.receiver}</p>
            <p className="text-sm text-gray-600">{task.end_station}</p>
          </div>
        </div>

        {/* Progress & Status with Pill Shape */}
        <div className="mt-4 flex flex-col space-y-2 mb-4">
          {/* Progress */}
          <span className="w-full px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-600 text-center">
            {task.progress}
          </span>

          {/* Status */}
          <span
            className={`w-full px-3 py-1 text-xs font-semibold rounded-full text-center ${
              task.status === "Completed"
                ? "bg-green-100 text-green-600"
                : task.status === "In Progress"
                ? "bg-yellow-100 text-yellow-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            {task.status}
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
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✖
            </button>

            {/* Modal Content */}
            <h2 className="text-2xl font-bold mb-4">{task.description}</h2>

            <div className="text-sm text-gray-700 space-y-3">
              <p>
                <strong>Task ID:</strong> {task.taskID}
              </p>
              <p>
                <strong>Sender:</strong> {task.sender} 
              </p>
              <p>
                <strong>Receiver:</strong> {task.receiver}
              </p>
              <p>
                <strong>Start:</strong> {task.start_station}
              </p>
              <p>
                <strong>End:</strong> {task.end_station}
              </p>
              <p>
                <strong>Slot: </strong> {task.slot}
              </p>

              <p>
                <strong>Priority:</strong>{" "}
                <span className={`px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </p>


              <p>
                <strong>Progress:</strong>{" "}
                <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-600">
                  {task.progress}
                </span>
              </p>

              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`px-2 py-1 rounded-full ${
                    task.status === "Completed"
                      ? "bg-green-100 text-green-600"
                      : task.status === "In Progress"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {task.status}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskCard;
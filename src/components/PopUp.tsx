"use client";
import { useEffect, useState } from "react";

interface Task {
  taskID: number;
  sender: string;
  receiver: string;
  end_station: string;
  description: string;
  status: string;
}

const PopUp: React.FC<{ username: string }> = ({ username }) => {
  const [newTasks, setNewTasks] = useState<Task[]>([]);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(`/api/fetchCollection?userId=${username}`);
        if (!response.ok) throw new Error("Failed to fetch tasks");

        const tasks: Task[] = await response.json();

        const pendingTasks = tasks.filter((task) => task.status === "WaitingCollection");

        if (pendingTasks.length > 0) {
          setNewTasks(pendingTasks);
          setShowPopup(true);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    const interval = setInterval(fetchTasks, 10000);

    return () => clearInterval(interval);
  }, [username]);

  return (
    <>
      {showPopup && (
        <div className="fixed bottom-6 right-6 bg-white shadow-xl rounded-lg border border-red-400 p-5 w-96 z-50 animate-slideIn">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-red-600">📢 Task Ready for Pickup!</h3>
            <button
              onClick={() => setShowPopup(false)}
              className="text-gray-500 hover:text-gray-700 text-lg"
            >
              ✖
            </button>
          </div>

          {/* Task List */}
          <div className="mt-3">
            <ul>
              {newTasks.map((task) => (
                <li key={task.taskID} className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-2 shadow-sm">
                  {/* Task Title */}
                  <p className="text-sm font-semibold">{task.description}</p>

                  {/* Collection Details */}
                  <p className="text-xs text-gray-600">
                    📍 <strong>Collect from:</strong> {task.end_station}
                  </p>

                  <p className="text-xs text-gray-600">
                    ✉️ <strong>Sender:</strong> {task.sender}
                  </p>

                  <p className="text-xs text-gray-500">Task #{task.taskID}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Dismiss Button */}
          <button
            onClick={() => setShowPopup(false)}
            className="w-full mt-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg shadow-md transition duration-300"
          >
            Dismiss
          </button>
        </div>
      )}
    </>
  );
};

export default PopUp;
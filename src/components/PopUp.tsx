"use client";
import { useState, useEffect } from "react";

interface Task {
  taskID: number;
  sender: string;
  receiver: string;
  end_station: string;
  description: string;
  status: string;
}

const PopUp: React.FC<{ tasks: Task[]; isOpen: boolean; setIsOpen: (open: boolean) => void; onDismiss: (taskID: number) => void }> = ({ tasks, isOpen, setIsOpen, onDismiss }) => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (tasks.length > 0) {
      setShowPopup(true);
    }
  }, [tasks]);

  return (
    <>
      {showPopup && tasks.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex flex-col items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4 md:max-w-lg relative">
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
            >
              ✖
            </button>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-red-600">You have delivery!</h3>
            </div>

            <div className="mt-3">
              <ul>
                {tasks.map((task) => (
                  <li key={task.taskID} className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-2 shadow-sm">
                    <p className="text-sm font-semibold">{task.description}</p>
                    <p className="text-xs text-gray-600"><strong>Collect from:</strong> {task.end_station}</p>
                    <p className="text-xs text-gray-600"><strong>Sender:</strong> {task.sender}</p>
                    <button
                      onClick={() => onDismiss(task.taskID)}
                      className="text-red-600 text-sm underline mt-1"
                    >
                      Dismiss
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => {
                tasks.forEach(task => onDismiss(task.taskID));
                setShowPopup(false);
              }}
              className="w-full mt-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg shadow-md transition duration-300"
            >
              Dismiss All
            </button>
          </div>
        </div>

      )}
    </>
  );
};

export default PopUp;
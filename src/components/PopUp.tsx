"use client";
import { useState, useEffect } from "react";
import { FiPackage } from "react-icons/fi";

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
        <div className="fixed inset-0 bg-black/50 flex flex-col items-center justify-center p-4 z-10 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-[90%] sm:max-w-md md:max-w-lg relative max-h-[90vh] overflow-y-auto">
            {/* <button
              onClick={() => setShowPopup(false)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✖
            </button> */}
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-red-600">Delivery Notification</h3>
            </div>
            <div className="mt-3">
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tasks.map((task) => (
                  <li key={task.taskID} className="bg-red-100 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg shadow-sm flex flex-row">
                    <div className="w-1/6 flex items-center justify-center">
                      <FiPackage className="text-5xl" />
                    </div>
                    <div className="w-5/6">
                      <p className="text-lg font-semibold">{task.description}</p>
                      <p className="text-md text-gray-600"><strong>Collect at: </strong> Base {task.end_station}</p>
                      <p className="text-md text-gray-600"><strong>From:</strong> {task.sender}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => {
                tasks.forEach(task => onDismiss(task.taskID));
                setShowPopup(false);
              }}
              className="w-full mt-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg shadow-md transition duration-300 text-sm sm:text-base"
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
"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Task {
  taskID: number;
  receiver: string;
  sender: string;
  start_station: string;
  end_station: string;
  progress: string;  // For "Loading", "Unloading" states
  status: string;    // For "PendingDropoff", "PendingCollection" states
  slot: number;
  description: string;
  priority: number;
}

export function TaskActions({ selectedTask, allTasks = [] }: { 
  selectedTask: Task | null,
  allTasks?: Task[] 
}) {
  const [actionStatus, setActionStatus] = useState({
    userDropoff: false,
    loadingDone: false,
    unloadingDone: false,
    userPickup: false
  });
  
  const [actionMessage, setActionMessage] = useState<string>("");

  useEffect(() => {
    if (!selectedTask) return;
    
    console.log("Evaluating task for button states:", selectedTask);
    
    // Reset all action states
    const initialState = {
      userDropoff: false,
      loadingDone: false,
      unloadingDone: false,
      userPickup: false
    };
    

    if (selectedTask.status !== "PendingDropoff") {
      initialState.userDropoff = true; 
    }
    

    if (selectedTask.progress !== "Loading") {
      initialState.loadingDone = true; 
    }
    

    if (selectedTask.progress !== "Unloading") {
      initialState.unloadingDone = true; 
    }

    if (selectedTask.status !== "PendingCollection") {
      initialState.userPickup = true;
    }
    
    console.log("Setting action states:", initialState);
    setActionStatus(initialState);
    setActionMessage("");
  }, [selectedTask]);
  
  const sendActionRequest = async (actionType: string, description: string) => {
    if (!selectedTask) return;
    
    setActionMessage(`Processing: ${description}...`);
    
    try {
      const requestPayload = { 
        taskID: selectedTask.taskID,
        message: actionType
      };
      
      console.log("Sending action request:", requestPayload);
      await axios.post('https://4oomdu5wr0.execute-api.ap-southeast-1.amazonaws.com/default/WebHooks', requestPayload);
      
      setActionStatus(prev => ({
        ...prev,
        [actionType === 'UserDropoff' ? 'userDropoff' : 
         actionType === 'LoadingDone' ? 'loadingDone' :
         actionType === 'UnloadingDone' ? 'unloadingDone' : 
         'userPickup']: true
      }));
      
      setActionMessage(`Success: ${description}`);
    } catch (error) {
      console.error('Error sending action request:', error);
      setActionMessage(`Error: Failed to ${description.toLowerCase()}`);
    }
  };

  if (!selectedTask) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200 space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-3">Task Actions</h2>
          
          {/* Task Selection Dropdown */}
          <div className="mb-4">
            <label htmlFor="taskSelect" className="block text-sm font-medium text-gray-700 mb-1">
              Select Task ID:
            </label>
            <select
              id="taskSelect"
              className="w-full p-2 border border-gray-300 rounded-md"
              value=""
              onChange={(e) => {
                const taskId = Number(e.target.value);
                if (typeof window !== 'undefined') {
                  const event = new CustomEvent('taskSelected', { 
                    detail: { taskId } 
                  });
                  window.dispatchEvent(event);
                }
              }}
            >
              <option value="">-- Select a Task --</option>
              {allTasks.map(task => (
                <option key={task.taskID} value={task.taskID}>
                  Task {task.taskID} - {task.progress} ({task.start_station} to {task.end_station})
                </option>
              ))}
            </select>
          </div>
          
          <p className="text-gray-500 mt-4">Select a task to view available actions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-3">Task Actions</h2>
        
        {/* Task Selection Dropdown */}
        <div className="mb-4">
          <label htmlFor="taskSelect" className="block text-sm font-medium text-gray-700 mb-1">
            Select Task ID:
          </label>
          <select
            id="taskSelect"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={selectedTask?.taskID || ''}
            onChange={(e) => {
              const taskId = Number(e.target.value);
              if (typeof window !== 'undefined') {
                const event = new CustomEvent('taskSelected', { 
                  detail: { taskId } 
                });
                window.dispatchEvent(event);
              }
            }}
          >
            <option value="">-- Select a Task --</option>
            {allTasks.map(task => (
              <option key={task.taskID} value={task.taskID}>
                Task {task.taskID} - {task.progress} ({task.start_station} to {task.end_station})
              </option>
            ))}
          </select>
        </div>
        
        <div className="text-sm text-gray-600 mb-2">
          <p><strong>ID:</strong> {selectedTask.taskID}</p>
          <p><strong>Status:</strong> {selectedTask.status}</p>
          <p><strong>Progress:</strong> {selectedTask.progress}</p>
        </div>
        
        {actionMessage && (
          <div className={`mb-4 py-2 px-4 rounded ${actionMessage.includes('Error') ? 'bg-red-100 text-red-700' : actionMessage.includes('Success') ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
            {actionMessage}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Four main buttons with correct conditional logic */}
        <button 
          className={`py-3 px-4 rounded-md font-medium
            ${actionStatus.userDropoff ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white'}`}
          onClick={() => !actionStatus.userDropoff && sendActionRequest('UserDropoff', 'User dropped off item')}
          disabled={actionStatus.userDropoff}
        >
          1. User Dropoff {selectedTask.status === "PendingDropoff" ? "✓" : ""}
        </button>
        
        <button 
          className={`py-3 px-4 rounded-md font-medium
            ${actionStatus.loadingDone ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white'}`}
          onClick={() => !actionStatus.loadingDone && sendActionRequest('LoadingDone', 'Loading completed')}
          disabled={actionStatus.loadingDone}
        >
          2. Loading Done {selectedTask.progress === "Loading" ? "✓" : ""}
        </button>
        
        <button 
          className={`py-3 px-4 rounded-md font-medium
            ${actionStatus.unloadingDone ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white'}`}
          onClick={() => !actionStatus.unloadingDone && sendActionRequest('UnloadingDone', 'Unloading completed')}
          disabled={actionStatus.unloadingDone}
        >
          3. Unloading Done {selectedTask.progress === "Unloading" ? "✓" : ""}
        </button>
        
        <button 
          className={`py-3 px-4 rounded-md font-medium
            ${actionStatus.userPickup ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white'}`}
          onClick={() => !actionStatus.userPickup && sendActionRequest('UserPickup', 'User picked up item')}
          disabled={actionStatus.userPickup}
        >
          4. User Pickup {selectedTask.status === "PendingCollection" ? "✓" : ""}
        </button>
      </div>
    </div>
  );
}
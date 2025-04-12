"use client";
import { useState, useEffect, useRef } from 'react';
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

interface TaskActionsProps {
  selectedTask: Task | null;
  allTasks?: Task[];
  onTaskUpdate?: (updatedTask: Task) => void;
}

export function TaskActions({ selectedTask, allTasks = [], onTaskUpdate }: TaskActionsProps) {
  const [actionStatus, setActionStatus] = useState({
    userDropoff: false,
    loadingDone: false,
    unloadingDone: false,
    userPickup: false
  });
  
  const [actionMessage, setActionMessage] = useState<string>("");
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [lastActionTime, setLastActionTime] = useState<number | null>(null);
  
  // Use refs to track the currently selected task ID for polling
  const selectedTaskIdRef = useRef<number | null>(null);
  const cognitoUsernameRef = useRef<string | null>(null);

  // Update the ref whenever selectedTask changes
  useEffect(() => {
    selectedTaskIdRef.current = selectedTask?.taskID || null;
    // Extract username from task data if available
    if (selectedTask) {
      cognitoUsernameRef.current = selectedTask.sender || selectedTask.receiver || null;
    }
  }, [selectedTask]);

  // Initial setup of action button states based on task status/progress
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
    
    // Set button states based on task status and progress
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
  
  // Polling function to get the latest task status using the existing API
  const pollTaskStatus = async () => {
    const taskId = selectedTaskIdRef.current;
    const username = cognitoUsernameRef.current;
    
    if (!taskId || !username) return;
    
    try {
      setIsPolling(true);
      console.log(`Polling for updates on task ${taskId}...`);
      
      // Fetch tasks using both queues to ensure we get the latest status
      const fetchTasks = async (messageType: string) => {
        try {
          const response = await fetch(`/api/fetchTasks?userId=${encodeURIComponent(username)}&message=${messageType}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch ${messageType}`);
          }
          return await response.json();
        } catch (error) {
          console.error(`Error fetching ${messageType}:`, error);
          return [];
        }
      };
      
      // Fetch from both queues in parallel
      const [sendTasks, receiveTasks] = await Promise.all([
        fetchTasks("SendQueue"),
        fetchTasks("ReceiveQueue")
      ]);
      
      // Find the task in either queue
      const allFetchedTasks = [...sendTasks, ...receiveTasks];
      const updatedTask = allFetchedTasks.find(task => task.taskID === taskId);
      
      // Update the task if we found it
      if (updatedTask) {
        console.log("Task update found:", updatedTask);
        
        // Update parent component if callback provided
        if (onTaskUpdate) {
          onTaskUpdate(updatedTask);
        }
        
        // Update local UI state based on task status
        const newActionStatus = {
          userDropoff: updatedTask.status !== "PendingDropoff",
          loadingDone: updatedTask.progress !== "Loading",
          unloadingDone: updatedTask.progress !== "Unloading",
          userPickup: updatedTask.status !== "PendingCollection"
        };
        
        setActionStatus(newActionStatus);
      } else {
        console.log("No updates found for task", taskId);
      }
    } catch (error) {
      console.error("Error polling for task updates:", error);
    } finally {
      setIsPolling(false);
    }
  };
  
  // Set up polling interval
  useEffect(() => {
    if (!selectedTask) return;
    
    // Poll immediately on task selection
    pollTaskStatus();
    
    // Set up recurring polling
    const intervalId = setInterval(() => {
      pollTaskStatus();
    }, 5000); // Poll every 5 seconds
    
    // Clean up interval on unmount or task change
    return () => {
      clearInterval(intervalId);
    };
  }, [selectedTask, lastActionTime]);
  
  // Function to send action request
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
      
      // Update button state
      setActionStatus(prev => ({
        ...prev,
        [actionType === 'UserDropoff' ? 'userDropoff' : 
         actionType === 'LoadingDone' ? 'loadingDone' :
         actionType === 'UnloadingDone' ? 'unloadingDone' : 
         'userPickup']: true
      }));
      
      setActionMessage(`Success: ${description}`);
      
      // Set last action time to trigger an immediate poll
      setLastActionTime(Date.now());
      
      // Poll for updates after a short delay
      setTimeout(() => {
        pollTaskStatus();
      }, 1000);
    } catch (error) {
      console.error('Error sending action request:', error);
      setActionMessage(`Error: Failed to ${description.toLowerCase()}`);
    }
  };

  // If no task is selected, show only the dropdown
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
                  Task {task.taskID} - {task.progress || task.status} ({task.start_station} to {task.end_station})
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
                Task {task.taskID} - {task.progress || task.status} ({task.start_station} to {task.end_station})
              </option>
            ))}
          </select>
        </div>
        
        <div className="text-sm text-gray-600 mb-2">
          <p><strong>ID:</strong> {selectedTask.taskID}</p>
          <p><strong>Status:</strong> {selectedTask.status}</p>
          <p><strong>Progress:</strong> {selectedTask.progress}</p>
          {isPolling && <p className="text-blue-500 text-xs italic mt-1">Checking for updates...</p>}
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
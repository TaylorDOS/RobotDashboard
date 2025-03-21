"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import AccessDenied from "@/components/AccessDenied";
import { DeliverForm } from "@/components/DeliverForm";
import TaskCard from "@/components/TaskCard";
import { StationStatus } from "@/components/StationStatus";
import { TaskActions } from "@/components/TaskActions";

interface Task {
  taskID: number;
  receiver: string;
  sender: string;
  start_station: string;
  end_station: string;
  progress: string;
  status: string;
  slot: number;
  description: string;
  priority: number;
}

const AdminSimulator: React.FC = () => {
  const { data: session } = useSession();
  const [cognitoUsername, setCognitoUsername] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [sentTasks, setSentTasks] = useState<Task[]>([]);
  const [receivedTasks, setReceivedTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!session?.user?.email) return;

      try {
        const response = await fetch("/api/getUsers");
        const users = await response.json();

        if (Array.isArray(users)) {
          const matchedUser = users.find((user) => user.email === session.user?.email);

          if (matchedUser) {
            console.log("Current User Found:", matchedUser);
            setCognitoUsername(matchedUser.username);
            setUserEmail(matchedUser.email);
          } else {
            console.warn("No matching user found for email:", session.user.email);
            setCognitoUsername("Not found");
            setUserEmail(session.user.email);
          }
        }
      } catch (error) {
        console.error("Error fetching Cognito users:", error);
      }
    };

    fetchUsers();
  }, [session]);

  const fetchUserTasks = async (messageType: string, setTasks: (tasks: Task[]) => void) => {
    if (!cognitoUsername) return;

    try {
      setIsLoading(true);
      setFetchError(null);
      
      console.log(`Fetching ${messageType} for user ${cognitoUsername}...`);
      
      const response = await fetch(`/api/fetchTasks?userId=${cognitoUsername}&message=${messageType}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch ${messageType}`);
      }

      const taskList: Task[] = await response.json();
      console.log(`Fetched ${messageType} tasks:`, taskList);
      
      setTasks(taskList);
      
      if (selectedTask) {
        const updatedTask = taskList.find(task => task.taskID === selectedTask.taskID);
        if (updatedTask) {
          setSelectedTask(updatedTask);
        }
      }
    } catch (error) {
      console.error(`Error fetching ${messageType}:`, error);
      setFetchError(`Failed to load ${messageType}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTasksWithInterval = () => {
    if (cognitoUsername) {
      fetchUserTasks("SendQueue", setSentTasks);
      fetchUserTasks("ReceiveQueue", setReceivedTasks);
    }
  };

  useEffect(() => {
    console.log("Current cognitoUsername:", cognitoUsername);
    
    if (cognitoUsername) {
      console.log("Initiating task fetching for:", cognitoUsername);
      fetchTasksWithInterval();
      
      // Set up polling every 10 seconds
      const intervalId = setInterval(fetchTasksWithInterval, 10000);
      
      return () => clearInterval(intervalId);
    }
  }, [cognitoUsername]);

  useEffect(() => {
    const handleTaskSelection = (event: Event) => {
      const customEvent = event as CustomEvent;
      const taskId = customEvent.detail.taskId;
      
      const allTasks = [...sentTasks, ...receivedTasks];
      const task = allTasks.find(t => t.taskID === taskId) || null;
      
      if (task) {
        console.log("Selected task:", task);
        setSelectedTask(task);
      }
    };
    
    window.addEventListener('taskSelected', handleTaskSelection as EventListener);
    
    return () => {
      window.removeEventListener('taskSelected', handleTaskSelection as EventListener);
    };
  }, [sentTasks, receivedTasks]);

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <AccessDenied />
      </div>
    );
  }

  const combinedTasks = [...(sentTasks || []), ...(receivedTasks || [])];
  console.log("Combined tasks for dropdown:", combinedTasks);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-6">Admin Simulator</h1>
        
        <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-160px)]">
          {/* Left Column - Form */}
          <div className="lg:w-1/3 bg-white rounded-lg shadow-md flex flex-col">
            <div className="p-4 bg-gray-200 font-bold text-xl text-center">
              FORM
            </div>
            <div className="p-4 flex-grow overflow-auto">
              <DeliverForm />
            </div>
          </div>
          
          {/* Right Column - Overviews */}
          <div className="lg:w-2/3 flex flex-col gap-6 flex-grow">
            {/* User Info */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-md text-gray-800">
                <strong>Username:</strong> <span className="text-blue-700">{cognitoUsername || "Loading..."}</span>
              </div>
              <div className="text-md text-gray-800">
                <strong>Email:</strong> <span className="text-blue-700">{userEmail || "Loading..."}</span>
              </div>
            </div>
            
            {fetchError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p>{fetchError}</p>
                <button 
                  className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                  onClick={fetchTasksWithInterval}
                >
                  Retry
                </button>
              </div>
            )}
            
            {/* Sending Overview Section */}
            <div className="bg-gray-200 rounded-lg p-6 flex flex-col">
              <h2 className="text-2xl font-bold mb-4">SENDING OVERVIEW</h2>
              <div className="bg-white rounded-lg p-4 min-h-64 flex-grow overflow-auto">
                {isLoading && sentTasks.length === 0 ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : sentTasks.length > 0 ? (
                  <div className="flex space-x-4 pb-2">
                    {sentTasks.map((task) => (
                      <div 
                        key={task.taskID} 
                        className={`min-w-64 cursor-pointer ${selectedTask?.taskID === task.taskID ? 'ring-2 ring-blue-500' : ''}`}
                        onClick={() => setSelectedTask(task)}
                      >
                        <TaskCard task={task} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No active sending tasks</p>
                )}
              </div>
            </div>
            
            {/* Receiving Overview Section */}
            <div className="bg-gray-200 rounded-lg p-6 flex flex-col">
              <h2 className="text-2xl font-bold mb-4">RECEIVING OVERVIEW</h2>
              <div className="bg-white rounded-lg p-4 min-h-64 flex-grow overflow-auto">
                {isLoading && receivedTasks.length === 0 ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : receivedTasks.length > 0 ? (
                  <div className="flex space-x-4 pb-2">
                    {receivedTasks.map((task) => (
                      <div 
                        key={task.taskID} 
                        className={`min-w-64 cursor-pointer ${selectedTask?.taskID === task.taskID ? 'ring-2 ring-blue-500' : ''}`}
                        onClick={() => setSelectedTask(task)}
                      >
                        <TaskCard task={task} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No active receiving tasks</p>
                )}
              </div>
            </div>
            
            {/* Actions and Base Stations in horizontal layout */}
            <div className="grid grid-cols-5 gap-4">
              {/* Actions Section - Takes up wider space */}
              <div className="col-span-2 bg-gray-200 rounded-lg p-4">
                <h2 className="text-xl font-bold mb-3 text-center">ACTIONS</h2>
                <TaskActions 
                  selectedTask={selectedTask}
                  allTasks={combinedTasks} 
                />
              </div>
              
              {/* Base Stations - Takes up 3 columns */}
              <div className="col-span-3">
                <StationStatus />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSimulator;
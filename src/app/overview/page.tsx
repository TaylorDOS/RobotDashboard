"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import AccessDenied from "@/components/AccessDenied";
import TaskCard from "@/components/TaskCard";
import Popup from "@/components/PopUp";
import FloatingStatusButton from "@/components/FloatingButton";

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

const Notification: React.FC = () => {
  const { data: session } = useSession();
  const [cognitoUsername, setCognitoUsername] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [sentTasks, setSentTasks] = useState<Task[]>([]);
  const [receivedTasks, setReceivedTasks] = useState<Task[]>([]);
  const [pendingCollectionTasks, setPendingCollectionTasks] = useState<Task[]>([]);
  const [dismissedTasks, setDismissedTasks] = useState<number[]>([]);
  const REFRESH_INTERVAL = 5000;
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!session?.user?.email) return;

      try {
        const response = await fetch("/api/getUsers");
        const users = await response.json();

        if (Array.isArray(users)) {
          const matchedUser = users.find((user) => user.email === session.user?.email);

          if (matchedUser) {
            setCognitoUsername(matchedUser.username);
            setUserEmail(matchedUser.email);
          } else {
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
      const response = await fetch(`/api/fetchTasks?userId=${cognitoUsername}&message=${messageType}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch ${messageType}`);
      }

      const taskList: Task[] = await response.json();
      setTasks(taskList);

      if (messageType === "ReceiveQueue") {
        const pending = taskList.filter((task) => task.status === "PendingCollection");

        const filteredTasks = pending.filter((task) => !dismissedTasks.includes(task.taskID));

        setPendingCollectionTasks(filteredTasks);
      }
    } catch (error) {
      console.error(`Error fetching ${messageType}:`, error);
    }
  };

  useEffect(() => {
    if (!cognitoUsername) return;

    const fetchTasks = () => {
      fetchUserTasks("SendQueue", setSentTasks);
      fetchUserTasks("ReceiveQueue", setReceivedTasks);
    };

    fetchTasks();

    const intervalId = setInterval(fetchTasks, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [cognitoUsername, dismissedTasks]);

  const handleDismiss = (taskID: number) => {
    setDismissedTasks((prev) => [...prev, taskID]);
  };

  const visibleTasks = pendingCollectionTasks.filter(
    (task) => !dismissedTasks.includes(task.taskID)
  );

  if (!session) return <AccessDenied />;

  return (
    <div className="bg-gradient-to-b from-blue-200 to-transparent -z-10">
      <div className="max-w-6xl mx-auto">
        <div className="pt-8 px-4 sm:px-6 lg:px-8">
          {/* Floating Button + Modal */}
          <FloatingStatusButton
            pendingCount={visibleTasks.length}
            onClick={() => setIsModalOpen(true)}
          />
          <Popup
            tasks={visibleTasks}
            isOpen={isModalOpen}
            setIsOpen={setIsModalOpen}
            onDismiss={handleDismiss}
          />

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Delivery Overview</h1>
            <p className="text-gray-600 text-sm sm:text-base mt-1">
              Track your ongoing delivery tasks and activity
            </p>
          </div>

          {/* User Info */}
          <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-5 mb-8 space-y-2 text-sm sm:text-base">
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Username</span>
              <span className="text-blue-700 font-semibold">{cognitoUsername || "Loading..."}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Email</span>
              <span className="text-blue-700 font-semibold">{userEmail || "Loading..."}</span>
            </div>
          </div>

          {/* Sending Section */}
          <div className="mt-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Sending</h2>
            {sentTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sentTasks.map((task) => (
                  <TaskCard key={task.taskID} task={task} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No sent tasks.</p>
            )}
          </div>

          {/* Receiving Section */}
          <div className="mt-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Receiving</h2>
            {receivedTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {receivedTasks.map((task) => (
                  <TaskCard key={task.taskID} task={task} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No received tasks.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notification;
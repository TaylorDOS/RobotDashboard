"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import AccessDenied from "@/components/AccessDenied";
import TaskCard from "@/components/TaskCard";
import Popup from "@/components/PopUp";

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

  useEffect(() => {
    const fetchUserTasks = async (messageType: string, setTasks: (tasks: Task[]) => void) => {
      if (!cognitoUsername) return;

      try {
        const response = await fetch(`/api/fetchTasks?userId=${cognitoUsername}&message=${messageType}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch ${messageType}`);
        }

        const taskList: Task[] = await response.json();
        setTasks(taskList);
      } catch (error) {
        console.error(`Error fetching ${messageType}:`, error);
      }
    };

    if (cognitoUsername) {
      fetchUserTasks("SendQueue", setSentTasks);
      fetchUserTasks("ReceiveQueue", setReceivedTasks);
    }
  }, [cognitoUsername]);

  if (!session) return <AccessDenied />;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mx-8 mt-8">
        <h1 className="text-4xl font-bold">Delivery Overview</h1>
        <div className="text-md mb-4">Check your ongoing delivery status here</div>
        {cognitoUsername && <Popup username={cognitoUsername} />}

        <div className="text-md text-gray-800">
          <strong>Username:</strong> <span className="text-blue-700">{cognitoUsername || "Loading..."}</span>
        </div>
        <div className="text-md text-gray-800">
          <strong>Email:</strong> <span className="text-blue-700">{userEmail || "Loading..."}</span>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Sending</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sentTasks.length > 0 ? (
              sentTasks.map((task) => <TaskCard key={task.taskID} task={task} />)
            ) : (
              <p className="text-gray-500">No sent tasks.</p>
            )}
          </div>
        </div>

        {/* Received Tasks */}
        <div className="mt-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Receiving</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {receivedTasks.length > 0 ? (
              receivedTasks.map((task) => <TaskCard key={task.taskID} task={task} />)
            ) : (
              <p className="text-gray-500">No received tasks.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notification;
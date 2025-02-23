import { NextApiRequest, NextApiResponse } from "next";

interface Task {
  taskID: number;
  receiver: string;
  sender: string;
  start_station: string;
  end_station: string;
  progress: string;
  status: string;
  description: string;
}

const API_URL =
  "https://umsfyussf6.execute-api.ap-southeast-1.amazonaws.com/default/DynamoRetrieve";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, message } = req.query;

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "userId is required" });
  }

  if (!message || (message !== "SendQueue" && message !== "ReceiveQueue")) {
    return res.status(400).json({ error: "Invalid message parameter. Use SendQueue or ReceiveQueue." });
  }

  try {
    const requestUrl = `${API_URL}?message=${message}&userId=${encodeURIComponent(userId)}`;
    const response = await fetch(requestUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch tasks: ${response.statusText}`);
    }

    const taskList = await response.json();

    return res.status(200).json(taskList);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return res.status(500).json({ error: "Failed to retrieve tasks" });
  }
}
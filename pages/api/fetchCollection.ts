import { NextApiRequest, NextApiResponse } from "next";

const API_URL =
  "https://umsfyussf6.execute-api.ap-southeast-1.amazonaws.com/default/DynamoRetrieve";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId } = req.query;

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "userId is required" });
  }

  try {
    const response = await fetch(`${API_URL}?userId=${userId}&message=ReceiveQueue`);

    if (!response.ok) {
      throw new Error("Failed to fetch tasks");
    }

    const tasks = await response.json();
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching real-time tasks:", error);
    res.status(500).json({ error: "Failed to retrieve tasks" });
  }
}
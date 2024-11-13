import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

// Declare the types for the response data
type ResponseData = {
  status: string;
  timestamp?: number | null;
};

let latestStatus: string = 'None'; // Initial status
let latestTimestamp: number | null = null; // Initial timestamp as null

// URL for your DynamoDB API endpoint
const DYNAMODB_API_URL = 'https://fzn1ni864d.execute-api.ap-southeast-1.amazonaws.com/default/CurrentProgress';

// Function to fetch the latest value from DynamoDB (only when needed)
const fetchFromDynamoDB = async (): Promise<void> => {
  try {
    const response = await axios.get(DYNAMODB_API_URL);
    latestStatus = response.data.status;
    latestTimestamp = response.data.timestamp;
  } catch (error) {
    console.error('Error fetching from DynamoDB:', error);
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
): Promise<void> {
  try {
    if (req.method === 'POST') {
      const { status } = req.body;  // Change from message to status

      // Check if the status is provided
      if (status) {
        latestStatus = status;
        await axios.post(DYNAMODB_API_URL, {
          status: status,   // Only send the status in the request
        });

        return res.status(200).json({ status: 'Status updated successfully' }); // Changed response message
      } else {
        return res.status(400).json({ status: 'No status provided' }); // Changed response message
      }

    } else if (req.method === 'GET') {
      // Fetch from DynamoDB if latestStatus is empty or stale
      if (latestStatus === 'None') {
        await fetchFromDynamoDB();
      }

      return res.status(200).json({ status: latestStatus, timestamp: latestTimestamp }); // Changed response to use status
    } else {
      return res.status(405).json({ status: 'Method Not Allowed' }); // Changed response message
    }
  } catch (error) {
    console.error('Error in status handler:', error);
    return res.status(500).json({ status: 'Internal Server Error' }); // Changed response message
  }
}

import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

let latestMessage = 'None'; // Initial message

type ResponseData = {
  message: string;
};

const DYNAMODB_API_URL = 'https://fzn1ni864d.execute-api.ap-southeast-1.amazonaws.com/default/CurrentProgress';

// Function to fetch the latest value from DynamoDB (only when needed)
const fetchFromDynamoDB = async () => {
  try {
    const response = await axios.get(DYNAMODB_API_URL);
    latestMessage = response.data.currentProgress || latestMessage;
  } catch (error) {
    console.error('Error fetching from DynamoDB:', error);
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try {
    if (req.method === 'POST') {
      const { message } = req.body;

      if (message) {
        latestMessage = message;
        // Update DynamoDB with the new message
        await axios.post(DYNAMODB_API_URL, {
          currentProgress: message,
        });

        return res.status(200).json({ message: 'Message updated successfully' });
      } else {
        return res.status(400).json({ message: 'No message provided' });
      }

    } else if (req.method === 'GET') {
      // Return the current message, fetching from DynamoDB only if it's empty or stale
      if (latestMessage === 'None') {
        await fetchFromDynamoDB();
      }

      return res.status(200).json({ message: latestMessage });
    } else {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Error in status handler:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

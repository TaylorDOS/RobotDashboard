import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

let latestMessage = 'None'; // Initial message

type ResponseData = {
  message: string;
};

const DYNAMODB_API_URL = 'https://fzn1ni864d.execute-api.ap-southeast-1.amazonaws.com/default/CurrentProgress';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try {
    if (req.method === 'POST') {
      const { message } = req.body;

      if (message) {
        // Update local state
        latestMessage = message;

        // Update DynamoDB via HTTP POST request
        await axios.post(DYNAMODB_API_URL, {
          currentProgress: message,
        });

        return res.status(200).json({ message: 'Message updated successfully' });
      } else {
        return res.status(400).json({ message: 'No message provided' });
      }

    } else if (req.method === 'GET') {
      // Fetch the latest message from DynamoDB via HTTP GET request
      const response = await axios.get(DYNAMODB_API_URL);
      
      // Assume the response contains { currentProgress: <value> }
      latestMessage = response.data.currentProgress || latestMessage;

      return res.status(200).json({ message: latestMessage });
    } else {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Error in status handler:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

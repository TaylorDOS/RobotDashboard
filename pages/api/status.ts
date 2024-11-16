import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

type ResponseData = {
  status: string;
  timestamp?: number | null;
};

let latestStatus: string = 'None';
let latestTimestamp: number | null = null;

const DYNAMODB_API_URL = 'https://fzn1ni864d.execute-api.ap-southeast-1.amazonaws.com/default/CurrentProgress';

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
      const { status } = req.body;

      if (status) {
        latestStatus = status;
        await axios.post(DYNAMODB_API_URL, {
          status: status,
        });

        return res.status(200).json({ status: 'Status updated successfully' });
      } else {
        return res.status(400).json({ status: 'No status provided' });
      }

    } else if (req.method === 'GET') {
      if (latestStatus === 'None') {
        await fetchFromDynamoDB();
      }
      return res.status(200).json({ status: latestStatus, timestamp: latestTimestamp });
    } else {
      return res.status(405).json({ status: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Error in status handler:', error);
    return res.status(500).json({ status: 'Internal Server Error' });
  }
}

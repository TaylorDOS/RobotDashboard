import type { NextApiRequest, NextApiResponse } from 'next';

let latestMessage = 'Hello from Next.js!'; // Initial message

type ResponseData = {
  message: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === 'POST') {
    // Update the message with data from the POST request
    const { message } = req.body;
    if (message) {
      latestMessage = message;
      return res.status(200).json({ message: 'Message updated successfully' });
    } else {
      return res.status(400).json({ message: 'No message provided' });
    }
  } else if (req.method === 'GET') {
    // Return the latest message
    return res.status(200).json({ message: latestMessage });
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}

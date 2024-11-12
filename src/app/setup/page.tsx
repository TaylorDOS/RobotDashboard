"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Setup {
  commands: string;
  content: string;
  timestamp: number;
}

const Setup: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = () => {
    setLoading(true);
    axios.get('https://umsfyussf6.execute-api.ap-southeast-1.amazonaws.com/default/DynamoRetrieve')
      .then((response) => {
      })
      .catch((error) => {
        console.error('Error fetching logs:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const sendCommand = (number: number) => {
    setLoading(true);
    setSuccessMessage("");

    axios.post(
      'https://4oomdu5wr0.execute-api.ap-southeast-1.amazonaws.com/default/WebHooks',
      { message: number },
    )
      .then((response) => {
        setSuccessMessage("Command sent successfully!");
        fetchLogs(); // Fetch updated logs after sending command
      })
      .catch((error) => {
        console.error('Error sending command:', error);
        setSuccessMessage("Error sending command.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="max-w-screen-lg mx-auto mt-8">
      <h1 className="text-4xl font-bold mb-4">Setup</h1>
      <div className="text-md mb-4">description here</div>
      <div className="flex gap-2 mb-4">
        <button onClick={() => sendCommand(1)} className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400">
          1
        </button>
        <button onClick={() => sendCommand(2)} className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400">
          2
        </button>
        <button onClick={() => sendCommand(3)} className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400">
          3
        </button>
      </div>
      {successMessage && <div className="text-green-500 mb-4">{successMessage}</div>}
    </div>
  );
};

export default Setup;

"use client";

import { useState } from 'react';
import axios from 'axios';

interface Log {
  commands: string;
  content: string;
  timestamp: number;
}

const Log: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchLogs = () => {
    setLoading(true);
    axios.get('https://umsfyussf6.execute-api.ap-southeast-1.amazonaws.com/default/DynamoRetrieve')
      .then((response) => {
        setLogs(response.data);
      })
      .catch((error) => {
        console.error('Error fetching logs:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="max-w-screen-lg mx-auto mt-8">
      <h1 className="text-4xl font-bold mb-4">Commands Log</h1>
      <div className="text-md mb-4">description here</div>
      <button
        onClick={fetchLogs}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Generate Logs
      </button>
      {loading ? (
        <div>Loading...</div>
      ) : (
        logs.length > 0 ? (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border p-2">Command ID</th>
                <th className="border p-2">Content</th>
                <th className="border p-2">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.commands}>
                  <td className="border p-2">{log.commands}</td>
                  <td className="border p-2">{log.content}</td>
                  <td className="border p-2">{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div>No logs to display</div>
        )
      )}
    </div>
  );
};

export default Log;
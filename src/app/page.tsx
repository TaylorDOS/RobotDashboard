"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Log {
  commands: string;
  content: string;
  timestamp: number;
}

const Dashboard: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [dropdown1, setDropdown1] = useState<string>('');
  const [dropdown2, setDropdown2] = useState<string>('');
  const [dropdown3, setDropdown3] = useState<string>('');
  const [dropdown4, setDropdown4] = useState<string>('');

  useEffect(() => {
    fetchLogs();
  }, []);

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

  const handleDropdownAction = () => {
    const selectedOptions = { dropdown1, dropdown2, dropdown3, dropdown4 };
    console.log("Selected options:", selectedOptions);

    axios.post('https://example.com/api/dropdown-action', selectedOptions)
      .then(response => {
        setSuccessMessage('Dropdown action executed successfully!');
      })
      .catch(error => {
        setSuccessMessage('Error executing dropdown action.');
        console.error('Error:', error);
      });
  };

  return (
    <div className="max-w-screen-lg mx-auto mt-8">
      <h1 className="text-4xl font-bold">Robot Dashboard</h1>
      <div className="w-full mt-8">
        <div className="w-1/2 grid gap-4 grid-cols-2 items-center mb-4">
          <label htmlFor="dropdown1" className="text-lg font-medium">Start Point</label>
          <select id="dropdown1" value={dropdown1} onChange={(e) => setDropdown1(e.target.value)}
            className="p-2 border bg-black text-white border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select Start Point</option>
            <option value="Marker1">Marker 1</option>
            <option value="Marker2">Marker 2</option>
            <option value="Marker3">Marker 3</option>
          </select>

          <label htmlFor="dropdown2" className="text-lg font-medium">End Point</label>
          <select id="dropdown2" value={dropdown2} onChange={(e) => setDropdown2(e.target.value)}
            className="p-2 border bg-black text-white border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select End Point</option>
            <option value="Marker1">Marker 1</option>
            <option value="Marker2">Marker 2</option>
            <option value="Marker3">Marker 3</option>
          </select>

          <label htmlFor="dropdown3" className="text-lg font-medium">Load Compartment</label>
          <select id="dropdown3" value={dropdown3} onChange={(e) => setDropdown3(e.target.value)}
            className="p-2 border bg-black text-white border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select Load Compartment</option>
            <option value="Compartment1">Compartment 1</option>
            <option value="Compartment2">Compartment 2</option>
            <option value="Compartment3">Compartment 3</option>
          </select>

          <label htmlFor="dropdown4" className="text-lg font-medium">Unload Compartment</label>
          <select id="dropdown4" value={dropdown4} onChange={(e) => setDropdown4(e.target.value)}
            className="p-2 border bg-black text-white border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select Unload Compartment</option>
            <option value="Compartment1">Compartment 1</option>
            <option value="Compartment2">Compartment 2</option>
            <option value="Compartment3">Compartment 3</option>
          </select>
        </div>
      </div>
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
        <button onClick={fetchLogs} className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400">
          Get Logs
        </button>
      </div>

      {successMessage && <div className="text-green-500 mb-4">{successMessage}</div>}

      <button onClick={handleDropdownAction} className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4">
        Execute Action
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

export default Dashboard;

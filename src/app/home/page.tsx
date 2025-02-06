"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import axios from "axios";
import StatusBar from "@/components/StatusBar";
import AccessDenied from "@/components/AccessDenied";

const Dashboard: React.FC = () => {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [loadCompartment, setLoadCompartment] = useState<string>("");
  const [unloadCompartment, setUnloadCompartment] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("None");
  const [timestamp, setTimestamp] = useState<number | null>(null);

  const steps = ["Waiting", "Moving to Start", "Pickup", "Moving to Dropoff", "Dropoff", "Done"];

  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/status");
      if (response.ok) {
        const data = await response.json();
        setStatusMessage(data.status);
        setTimestamp(data.timestamp);
      } else {
        console.error("Failed to fetch status");
      }
    } catch (error) {
      console.error("Error fetching status:", error);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(fetchStatus, 3000);
    fetchStatus();
    return () => clearInterval(intervalId);
  }, []);

  const handleDropdownAction = () => {
    const requestPayload = {
      message: "InitiateLoading",
      start,
      end,
      loadCompartment,
      unloadCompartment,
    };

    axios
      .post("https://4oomdu5wr0.execute-api.ap-southeast-1.amazonaws.com/default/WebHooks", requestPayload)
      .then(() => {
        setStatusMessage("Initiate Loading!");
      })
      .catch((error) => {
        setStatusMessage("Error executing dropdown action.");
        console.error("Error:", error);
      });
  };

  // 🔹 Show loading state while checking authentication
  if (isLoading) return <div className="text-center mt-8">Loading...</div>;

  // 🔹 If user is not logged in, show AccessDenied page
  if (!session) return <AccessDenied />;

  return (
    <div className="max-w-screen-lg mx-auto">
      <div className='mx-4 lg:mx-0'>
        <h1 className="mt-8 text-4xl font-bold">Welcome, operator</h1>
        <div className="text-md mb-4">Assign a delivery task by selecting the start and end points, choosing load and unload compartments, and initiating the process. Monitor the task progress and ensure smooth operations across all steps.</div>
        <div className="lg:flex w-full mt-4 gap-16 justify-start items-start">
          <div className="flex flex-col lg:w-1/2 mr-4">
            <label htmlFor="start" className="text-md font-medium">Start Point</label>
            <select id="start" value={start} onChange={(e) => setStart(e.target.value)}
              className="p-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select Start Point</option>
              <option value="Marker1">Marker 1</option>
              <option value="Marker2">Marker 2</option>
              <option value="Marker3">Marker 3</option>
            </select>

            <label htmlFor="end" className="text-md font-medium mt-4">End Point</label>
            <select id="end" value={end} onChange={(e) => setEnd(e.target.value)}
              className="p-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select End Point</option>
              <option value="Marker1">Marker 1</option>
              <option value="Marker2">Marker 2</option>
              <option value="Marker3">Marker 3</option>
            </select>

            <label htmlFor="loadCompartment" className="text-md font-medium mt-4">Load Compartment</label>
            <select id="loadCompartment" value={loadCompartment} onChange={(e) => setLoadCompartment(e.target.value)}
              className="p-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select Load Compartment</option>
              <option value="Compartment1">Compartment 1</option>
              <option value="Compartment2">Compartment 2</option>
              <option value="Compartment3">Compartment 3</option>
            </select>

            <label htmlFor="unloadCompartment" className="text-md font-medium mt-4">Unload Compartment</label>
            <select id="unloadCompartment" value={unloadCompartment} onChange={(e) => setUnloadCompartment(e.target.value)}
              className="p-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select Unload Compartment</option>
              <option value="Compartment1">Compartment 1</option>
              <option value="Compartment2">Compartment 2</option>
              <option value="Compartment3">Compartment 3</option>
            </select>

            <button onClick={handleDropdownAction} className="mt-8 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4">
              Deliver
            </button>
          </div>
          <div className="mt-8 lg:mt-0 lg:w-1/2 flex flex-col">
            <span className="text-md font-medium mb-2 text-center">Map Region</span>
            <div className="w-full aspect-video bg-slate-200">
              {/* Map content */}
            </div>
          </div>
          <div>
          </div>
        </div>
        <StatusBar status={status} timestamp={timestamp} />
      </div>
    </div>
  );
};

export default Dashboard;

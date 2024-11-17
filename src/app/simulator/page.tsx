"use client";
import StatusBar from '@/components/StatusBar';
import { useState, useEffect } from "react";
import axios from "axios";
import sendStatusUpdate from "@/components/SendStatusUpdate";

interface CommandField {
  name: string;
  placeholder: string;
}

interface Command {
  name: string;
  status: string;
  fields: CommandField[];
}

const ESP32: Command[] = [
  {
    status: "Moving to Dropoff",
    name: "LoadingDone",
    fields: [
      { name: "end", placeholder: "End" },
      { name: "unloadCompartment", placeholder: "Unload Compartment" },
    ],
  },
  {
    status: "Done",
    name: "UnloadingDone",
    fields: [],
  },
];

const FRONTEND: Command[] = [
  {
    status: "Waiting",
    name: "Reset",
    fields: [
    ],
  },
  {
    status: "Moving to Start",
    name: "InitiateLoading",
    fields: [
      { name: "start", placeholder: "Start" },
      { name: "end", placeholder: "End" },
      { name: "loadCompartment", placeholder: "Load Compartment" },
      { name: "unloadCompartment", placeholder: "Unload Compartment" },
    ],
  },
];

const MIRFLEET: Command[] = [
  {
    status: "Pickup",
    name: "LoadingDocked",
    fields: [
      { name: "end", placeholder: "End" },
      { name: "loadCompartment", placeholder: "Load Compartment" },
      { name: "unloadCompartment", placeholder: "Unload Compartment" },
    ],
  },
  {
    status: "Dropoff",
    name: "UnloadingDocked",
    fields: [
      { name: "unloadCompartment", placeholder: "Unload Compartment" },
    ],
  },
];

const ENDPOINT =
  "https://4oomdu5wr0.execute-api.ap-southeast-1.amazonaws.com/default/WebHooks";

const Simulator: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"ESP32" | "Frontend" | "MiRFleet">("Frontend");
  const [activeCommand, setActiveCommand] = useState<Command | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<string>("None");
  const [timestamp, setTimestamp] = useState<number | null>(null);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data.status);
        setTimestamp(data.timestamp);
      } else {
        console.error('Failed to fetch status');
      }
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(fetchStatus, 3000);
    fetchStatus();
    return () => clearInterval(intervalId);
  }, []);

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const sendCommand = () => {
    if (!activeCommand) return;
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");
    const payload: Record<string, string> = { message: activeCommand.name };
    for (const field of activeCommand.fields) {
      if (!formData[field.name]) {
        setErrorMessage(`Please fill in the ${field.placeholder} field.`);
        setLoading(false);
        return;
      }
      payload[field.name] = formData[field.name];
    }
    axios
      .post(ENDPOINT, payload)
      .then(() => {
        setSuccessMessage(`${activeCommand.name} sent successfully!`);
        sendStatusUpdate(activeCommand.status)
          .then((response) => console.log("Status update response:", response))
          .catch((error) =>
            console.error("Error sending status update:", error)
          );

      })
      .catch((error) => {
        console.error(`Error sending ${activeCommand.name}:`, error);
        setErrorMessage(`Error sending ${activeCommand.name}.`);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getCommandsByTab = () => {
    switch (activeTab) {
      case "ESP32":
        return ESP32;
      case "Frontend":
        return FRONTEND;
      case "MiRFleet":
        return MIRFLEET;
      default:
        return [];
    }
  };


  return (
    <div className="max-w-screen-lg mx-auto">
      <div className="mx-4 mt-4">
        <h1 className="text-4xl font-bold mb-4">Commands Simulator</h1>
        <div>Simulate different commands from the frontend, ESP32, and MiR Fleet Integration API to ensure AWS Lambda responds correctly.</div>

        {/* Tab Navigation */}
        <div className="flex mb-8 border-b">
          <button
            onClick={() => setActiveTab("Frontend")}
            className={`px-4 py-2 text-lg font-semibold ${activeTab === "Frontend" ? "border-b-2 border-blue-500" : ""}`}
          >
            Frontend
          </button>
          <button
            onClick={() => setActiveTab("MiRFleet")}
            className={`px-4 py-2 text-lg font-semibold ${activeTab === "MiRFleet" ? "border-b-2 border-blue-500" : ""}`}
          >
            MiRFleet
          </button>
          <button
            onClick={() => setActiveTab("ESP32")}
            className={`px-4 py-2 text-lg font-semibold ${activeTab === "ESP32" ? "border-b-2 border-blue-500" : ""}`}
          >
            ESP32
          </button>
        </div>

        {/* Command Buttons for Selected Tab */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {getCommandsByTab().map((command, index) => (
            <button
              key={index}
              onClick={() => {
                setActiveCommand(command);
                setFormData({}); // Clear form data when switching command
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
            >
              {command.name}
            </button>
          ))}
        </div>

        {/* Active Command Form */}
        {activeCommand && (
          <div className="border p-4 rounded-lg bg-gray-50">
            <h3 className="text-xl font-semibold mb-4">{activeCommand.name}</h3>
            <div className="grid grid-cols-2 gap-4">
              {activeCommand.fields.map((field) => (
                <div key={field.name}>
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    className="border p-2 w-full rounded"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && <div className="text-red-500 mt-4">{errorMessage}</div>}

        {/* Submit Button */}
        <div className="mt-4">
          <button
            onClick={sendCommand} // Attach the correct function
            disabled={loading || !activeCommand} // Disable button while loading or if no command is selected
            className={`px-4 py-2 rounded-lg text-white ${loading || !activeCommand
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
              }`}
          >
            {loading ? "Sending..." : "Send Command"}
          </button>
        </div>

        {/* Success Message */}
        {successMessage && <div className="text-green-500 mt-4">{successMessage}</div>}
        <StatusBar status={status} timestamp={timestamp} />

      </div>

    </div>
  );
};

export default Simulator;

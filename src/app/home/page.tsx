"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { getBaseStationAvailability, BaseStation } from "@/utils/getBaseStationAvailability";
import AccessDenied from "@/components/AccessDenied";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import Link from "next/link";


interface CognitoUser {
  username: string;
  email: string;
}

const Deliver: React.FC = () => {
  const { data: session } = useSession();
  const generateTaskID = () => {
    const timestamp = Date.now().toString().slice(-6);
    const randomPart = Math.floor(100 + Math.random() * 900).toString();
    return timestamp + randomPart;
  };
  const [taskID, setTaskID] = useState<string | null>(null);

  const [users, setUsers] = useState<CognitoUser[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string>("");

  const [baseStations, setBaseStations] = useState<BaseStation[]>([]);
  const [pickupStation, setPickupStation] = useState<string>("");
  const [slot, setSlot] = useState<number | null>(null);
  const [dropoffStation, setDropoffStation] = useState<string>("");


  const [priority, setPriority] = useState<number | "">("");
  const [description, setDescription] = useState<string>("");

  const [error, setError] = useState("");

  const [currentStep, setCurrentStep] = useState(0);
  const [showNextButton, setShowNextButton] = useState(true);
  const [showBackButton, setShowBackButton] = useState(false);


  const fetchUsers = async () => {
    try {
      console.log("Fetching all users from /api/getUsers...");
      const response = await fetch("/api/getUsers", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const usersList: CognitoUser[] = await response.json();
      setUsers(usersList);
      console.log("Users retrieved:", usersList);
    } catch (error) {
      console.error("Error fetching Cognito users:", error);
    }
  };

  const fetchCurrentUsername = async () => {
    if (!session?.user?.email) {
      console.warn("Session email not available yet.");
      return;
    }
    try {
      const matchedUser = users.find((user) => user.email === session.user?.email);
      if (matchedUser) {
        console.log("Current User Found:", matchedUser);
        setUsername(matchedUser.username);
      } else {
        console.warn("No matching user found for email:", session.user.email);
      }
    } catch (error) {
      console.error("Error fetching current username:", error);
    }
  };

  useEffect(() => {
    if (session?.user?.email) {
      fetchUsers();
    }
  }, [session]);

  useEffect(() => {
    if (users.length > 0 && session?.user?.email) {
      fetchCurrentUsername();
    }
  }, [users]);

  useEffect(() => {
    if (currentStep === 1) {
      fetchStations();
    } else if (currentStep === 3) {
      setTaskID(generateTaskID());
    }
  }, [currentStep]);

  const fetchStations = async () => {
    try {
      setError("");
      const stations = await getBaseStationAvailability();
      setBaseStations(stations);
    } catch (err) {
      console.error("Error fetching base station data:", err);
      setError("Failed to load base station data.");
    }
  };

  const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUser(event.target.value);
  };

  useEffect(() => {
    if (currentStep === 0) {
      setShowNextButton(true);
      setShowBackButton(false);
    } else if (currentStep === 4) {
      setShowNextButton(false);
      setShowBackButton(false);
    }
    else if (currentStep === 3) {
      setShowNextButton(false);
      setShowBackButton(true);
    } else {
      setShowNextButton(true);
      setShowBackButton(true);
    }
  }, [currentStep]);

  const sendRequest = () => {
    const requestPayload = {
      message: "AddTask",
      start: pickupStation,
      end: dropoffStation,
      slot: slot,
      priority: priority,
      taskID: taskID,
      receiver: selectedUser,
      sender: username,
      description: description
    };

    axios.post('https://4oomdu5wr0.execute-api.ap-southeast-1.amazonaws.com/default/WebHooks', requestPayload)
      .then(response => {
      })
      .catch(error => {
        console.error('Error:', error);
      });
    handleNext();
  };

  const handleNext = () => {
    if (currentStep === 0 && (!selectedUser)) {
      setError("Please select a recipient before proceeding.");
      return;
    }
    if (currentStep === 1 && (!pickupStation || slot === null || !dropoffStation)) {
      setError("Please select pickup station, slot, and dropoff station before proceeding.");
      return;
    }
    if (currentStep === 2 && (priority === "" || description.trim() === "")) {
      setError("Please describe the item and priority before proceeding.");
      return;
    }
    setError("");
    if (currentStep < screens.length - 1)
      setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const screens = [
    {
      title: "Who are you delivering to?",
      description: "Select a recipient for your delivery",
      content: (
        <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto h-full">
          <select
            className="border border-gray-300 rounded p-2 mt-2 w-full"
            value={selectedUser}
            onChange={handleUserChange}
          >
            <option value="" disabled>
              Receiver
            </option>
            {users.map((user) => (
              <option key={user.username} value={user.username}>
                {user.username} ({user.email})
              </option>
            ))}
          </select>

          <div className="h-6 text-center mt-8">
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        </div>
      ),
    },
    {
      title: "Select Your Pickup & Drop-off Locations",
      description: "Select the nearest pickup and drop-off stations based on availability.",
      content: (
        <div className="w-full h-full flex flex-col items-center justify-top mx-8">
          {/* <div className="w-full flex flex-row justify-center items-center gap-8">
            <div className="mb-2 text-xl font-semibold">Base Station Status</div>
            <button
              onClick={fetchStations}
              className="w-12 h-12 flex items-center justify-center bg-blue-400 text-white rounded-full hover:bg-blue-600 transition duration-300 shadow-md"
            >
              <FiRefreshCw className="text-xl" />
            </button>
          </div> */}
          {baseStations === null ? (
            <p className="text-lg font-medium">Loading base station availability...</p>
          ) : (
            <div className="w-full flex flex-col items-center my-12">

              <div className="mt-6 w-full max-w-lg flex justify-between gap-4">
                <div className="flex-1">
                  <label className="block font-medium text-lg">Pickup Location</label>
                  <select
                    className="border border-gray-300 rounded p-2 mt-2 w-full"
                    value={pickupStation}
                    onChange={(e) => {
                      setPickupStation(e.target.value);
                      setDropoffStation("");
                      setSlot(null);
                      setError("");
                    }}
                  >
                    <option value="" disabled>Select Start Station</option>
                    {baseStations.map((station) => (
                      <option key={station.station} value={station.station}>
                        {station.station}
                      </option>
                    ))}
                  </select>
                </div>


                <div className="flex-1">
                  <label className="block font-medium text-lg">Dropoff Location</label>
                  <select
                    className="border border-gray-300 rounded p-2 mt-2 w-full"
                    value={dropoffStation}
                    onChange={(e) => {
                      setDropoffStation(e.target.value);
                      setSlot(null);
                      setError("");
                    }}
                    disabled={!pickupStation}
                  >
                    <option value="" disabled>Select End Station</option>
                    {baseStations
                      .filter((station) => station.station !== pickupStation)
                      .map((station) => (
                        <option key={station.station} value={station.station}>
                          {station.station}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {pickupStation && dropoffStation && (() => {
                // Find available slots for both stations
                const startSlots = baseStations.find((s) => s.station === pickupStation)?.slots.filter((s) => s.status) || [];
                const endSlots = baseStations.find((s) => s.station === dropoffStation)?.slots.filter((s) => s.status) || [];

                // Find common slots between the two stations
                const commonSlots = startSlots.filter((s) => endSlots.some((es) => es.slot === s.slot));

                // If no common slots exist, return error message
                if (commonSlots.length === 0) {
                  return <p className="text-red-500 text-sm mt-4">No available slots between the selected stations.</p>;
                }

                return (
                  <div className="mt-6 w-full max-w-lg">
                    <label className="block font-medium text-lg">Available Slots</label>
                    <select
                      className="border border-gray-300 rounded p-2 mt-2 w-full"
                      value={slot || ""}
                      onChange={(e) => setSlot(Number(e.target.value))}
                    >
                      <option value="" disabled>Select Slot</option>
                      {commonSlots.map((slot) => (
                        <option key={slot.slot} value={slot.slot}>
                          Slot {slot.slot}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })()}

              <div className="h-6 text-center mt-8">
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Describe the item",
      description: "GenAI will be used to determined the priority of your task",
      content: (
        <div className="flex flex-col w-full max-w-lg mx-auto">
          <div className="mt-6 w-full">
            <label className="block font-medium text-lg">Describe the item</label>
            <input
              type="text"
              className="border border-gray-300 rounded p-2 mt-2 w-full"
              placeholder="Describe the item of delivery..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="mt-4 w-full">
            <label className="block font-medium text-lg">Category</label>
            <select
              className="border border-gray-300 rounded p-2 mt-2 w-full"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
            >
              <option value="" disabled>Select Categories</option>
              <option value={1}>Medicine</option>
              <option value={2}>Blood Samples</option>
              <option value={3}>Documents</option>
              <option value={4}>Linen Supplies</option>
              <option value={5}>Others</option>
            </select>
          </div>
          <div className="h-6 text-center mt-8">
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        </div>

      ),
    },
    {
      title: "Task Confirmation",
      description: "Double-check the order details before proceeding.",
      content: (
        <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto">
          {/* Task Summary Table */}
          <div className="w-full border border-gray-300 rounded-lg shadow-md bg-white p-4 mt-4">
            <table className="w-full text-left border-collapse">
              <tbody>
                <tr>
                  <td className="font-semibold p-2 border-b">Task ID:</td>
                  <td className="p-2 border-b">{taskID}</td>
                </tr>
                <tr>
                  <td className="font-semibold p-2 border-b">Description:</td>
                  <td className="p-2 border-b">{description}</td>
                </tr>
                <tr>
                  <td className="font-semibold p-2 border-b">Sender:</td>
                  <td className="p-2 border-b">{username || "Not selected"}</td>
                </tr>
                <tr>
                  <td className="font-semibold p-2 border-b">Receiver:</td>
                  <td className="p-2 border-b">{selectedUser}</td>
                </tr>
                <tr>
                  <td className="font-semibold p-2 border-b">Pickup:</td>
                  <td className="p-2 border-b">{pickupStation || "Not selected"}</td>
                </tr>
                <tr>
                  <td className="font-semibold p-2 border-b">Dropoff:</td>
                  <td className="p-2 border-b">{dropoffStation || "Not selected"}</td>
                </tr>
                <tr>
                  <td className="font-semibold p-2 border-b">Selected Slot:</td>
                  <td className="p-2 border-b">{slot || "Not selected"}</td>
                </tr>
                <tr>
                  <td className="font-semibold p-2 border-b">Priority:</td>
                  <td className="p-2 border-b">{priority || "Not selected"}</td>
                </tr>

              </tbody>
            </table>
          </div>

          {/* Submit Button */}
          <button
            onClick={sendRequest}
            className="px-6 py-2 bg-green-500 text-white rounded-lg mt-6 hover:bg-green-600 transition duration-300 shadow-md"
          >
            Create Task
          </button>
        </div>
      ),
    },
    {
      title: "Progress",
      description: "Check the status of your delivery.",
      content: (
        <div className="w-full mx-8">

          <Link href="/overview">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
              Proceed
            </button>
          </Link>


        </div>

      ),
    },
  ];

  const progress = ((currentStep) / (screens.length - 1)) * 100;
  if (!session) return <AccessDenied />;

  return (
    <div className="mx-auto flex flex-col min-h-screen">
      <div className="relative w-full bg-gray-200 h-2">
        <div
          className="bg-blue-500 h-2 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="w-full flex flex-col flex-grow justify-center items-center text-center px-4 bg-gradient-to-b from-blue-200 to-transparent">
        <div className="pt-8 pb-4 lg:flex flex-row items-center w-full max-w-2xl">
          {showBackButton && (
            <button
              onClick={handleBack}
              className="ml-4 w-12 h-12 shrink-0 flex items-center justify-center bg-blue-500 text-white rounded-full hover:bg-blue-400 transition duration-300 shadow-md"
            >
              <FiArrowLeft className="text-2xl" />
            </button>
          )}

          <div className="mt-8 flex-grow text-center">
            <div>{username}</div>
            <h1 className="text-2xl font-bold">{screens[currentStep].title}</h1>
            <p className="text-gray-600 mt-2">{screens[currentStep].description}</p>
          </div>
        </div>
        <div className="flex flex-col flex-grow justify-top pt-8 items-center h-full w-full">
          {screens[currentStep].content}
          {showNextButton && (
            <div className="flex justify-center w-full h-full mt-8">
              <button
                onClick={handleNext}
                className="w-12 h-12 flex items-center justify-center bg-blue-500 text-white rounded-full hover:bg-blue-400 transition duration-300 shadow-md"
              >
                <FiArrowRight className="text-2xl" />
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default Deliver;

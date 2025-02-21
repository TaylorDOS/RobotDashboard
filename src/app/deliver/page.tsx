"use client";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { listUsers, CognitoUser } from "@/components/GetUsers";
import { getBaseStationAvailability, BaseStation } from "@/utils/getBaseStationAvailability";
import AccessDenied from "@/components/AccessDenied";
import { FiArrowLeft, FiArrowRight, FiRefreshCw } from "react-icons/fi";

const Deliver: React.FC = () => {
  const { data: session, status: authStatus } = useSession();
  const isLoading = authStatus === "loading";
  const generateTaskID = () => {
    const timestamp = Date.now().toString().slice(-6);
    const randomPart = Math.floor(100 + Math.random() * 900).toString();
    return timestamp + randomPart;
  };
  const [taskID, setTaskID] = useState<string | null>(null);

  const [users, setUsers] = useState<CognitoUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");

  const [baseStations, setBaseStations] = useState<BaseStation[]>([]);
  const [pickupStation, setPickupStation] = useState<string>("");
  const [slot, setSlot] = useState<number | null>(null);
  const [dropoffStation, setDropoffStation] = useState<string>("");


  const [priority, setPriority] = useState<number | "">("");
  const [x, setX] = useState<string>("");

  const [error, setError] = useState("");

  const [currentStep, setCurrentStep] = useState(0);
  const [showNextButton, setShowNextButton] = useState(true);
  const [showBackButton, setShowBackButton] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log("Fetching users from Cognito...");
        const usersList = await listUsers();
        console.log("Users retrieved:", usersList);
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching Cognito users:", error);
      }
    };

    if (currentStep === 0) {
      fetchUsers();
    } else if (currentStep === 1) {
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
    } else if (currentStep === 3) {
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
      timeslot: 1,
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
    if (currentStep === 2 && priority === "") {
      setError("Please select priority before proceeding.");
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
        <div className="flex flex-col items-center">
          <select
            className="border border-gray-300 rounded p-2 mt-2 w-72"
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
        <div className="w-full flex flex-col items-center justify-top mx-8">
          <div className="w-full flex flex-row justify-center items-center gap-8">
            <div className="mb-2 font-semibold">Base Station Availability</div>
            <button
              onClick={fetchStations}
              className=" py-2 px-4 flex items-center justify-center bg-blue-400 text-white rounded-lg hover:bg-blue-600 transition duration-300 shadow-md"
            >
              <FiRefreshCw className="text-2xl" />
              <div className="ml-2">Refresh
              </div>
            </button>
          </div>
          {baseStations === null ? (
            <p className="text-lg font-medium">Loading base station availability...</p>
          ) : (
            <div className="w-full flex flex-col items-center my-12">

              <div className="grid grid-cols-3 gap-8 w-full max-w-4xl">
                {baseStations.map((station) => (
                  <div key={station.station} className="border border-gray-300 rounded-lg p-4 w-full shadow-lg">
                    <h3 className="text-lg font-bold text-center mb-2">{station.station}</h3>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {station.slots.map((slot) => (
                        <div
                          key={slot.slot}
                          className={`w-12 h-12 flex items-center justify-center text-white font-bold rounded-md ${slot.status ? "bg-green-500" : "bg-red-500"
                            }`}
                        >
                          {slot.slot}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>


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

              {pickupStation && dropoffStation && (
                <div className="mt-6 w-full max-w-lg">
                  <label className="block font-medium text-lg">Available Slots</label>
                  <select
                    className="border border-gray-300 rounded p-2 mt-2 w-full"
                    value={slot || ""}
                    onChange={(e) => setSlot(Number(e.target.value))}
                  >
                    <option value="" disabled>Select Slot</option>
                    {(() => {
                      const startSlots = baseStations.find((s) => s.station === pickupStation)?.slots.filter((s) => s.status) || [];
                      const endSlots = baseStations.find((s) => s.station === dropoffStation)?.slots.filter((s) => s.status) || [];

                      const commonSlots = startSlots.filter((s) =>
                        endSlots.some((es) => es.slot === s.slot)
                      );

                      if (commonSlots.length === 0) {
                        setError("No available slots between selected stations.");
                        return null;
                      }

                      return commonSlots.map((slot) => (
                        <option key={slot.slot} value={slot.slot}>
                          Slot {slot.slot}
                        </option>
                      ));
                    })()}
                  </select>
                </div>
              )}

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
        <div>
          <div className="mt-6 w-full max-w-lg">
            <label className="block font-medium text-lg">Enter Message</label>
            <input
              type="text"
              className="border border-gray-300 rounded p-2 mt-2 w-full"
              placeholder="Describe the item of delivery..."
              value={x}
              onChange={(e) => setX(e.target.value)}
            />
          </div>

          {/* Priority Selection */}
          <div className="mt-4 w-full max-w-lg">
            <label className="block font-medium text-lg">Select Priority</label>
            <select
              className="border border-gray-300 rounded p-2 mt-2 w-full"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
            >
              <option value="" disabled>Select Priority</option>
              <option value={1}>1 (Highest)</option>
              <option value={2}>2</option>
              <option value={3}>3 (Lowest)</option>
            </select>
          </div>
          <div className="h-6 text-center mt-8">
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
          </div>
        </div>

      ),
    },
    {
      title: "Task Confirmation",
      description: "Double check the order details before proceeding.",
      content: (
        <div className="flex flex-col items-center justify-center">
          <div className="px-4 py-2 text-black rounded mt-4">
            <p><strong>Task ID:</strong> {taskID}</p>
            <p><strong>Message:</strong> AddTask</p>
            <p><strong>Receiver:</strong> {selectedUser}</p>
            <p><strong>Pickup:</strong> {pickupStation || "Not selected"}</p>
            <p><strong>Dropoff:</strong> {dropoffStation || "Not selected"}</p>
            <p><strong>Selected Slot:</strong> {slot || "Not selected"}</p>
            <p><strong>Priority:</strong> {priority || "Not selected"}</p>
            <p><strong>Timeslot:</strong> </p>

          </div>
          <button
            onClick={sendRequest}
            className="px-4 py-2 bg-green-500 text-white rounded mt-4"
          >
            Create Task
          </button>

        </div>
      ),
    },
    // {
    //   title: "Working hard",
    //   description: "Please wait while we calculate the best route for you.",
    //   content: (
    //     <div className="flex flex-col items-center">
    //       <p className="mt-4 text-gray-600">Calculating...</p>
    //     </div>
    //   ),
    //   onLoad: () => {
    //     console.log("Calculating route...");
    //     setTimeout(() => {
    //       setCurrentStep(4);
    //     }, 3000);
    //   },

    // },
    {
      title: "Progress",
      description: "Check the status of your delivery.",
      content: (
        <div className="w-full mx-8">
          {/* <StatusBar status={status} timestamp={timestamp} /> */}
        </div>

      ),
    },
  ];

  const progress = ((currentStep) / (screens.length - 1)) * 100;

  if (isLoading) return <div className="text-center mt-8">Loading...</div>;

  if (!session) return <AccessDenied />;

  return (
    <div className="mx-auto h-[90vh] flex flex-col justify-between items-center">
      <div className="relative w-full bg-gray-200 h-2">
        <div
          className="bg-blue-500 h-2 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="max-w-screen-lg w-full h-full">
        <div className="my-16 flex flex-col justify-center items-center text-center">
          <h1 className="text-2xl font-bold">{screens[currentStep].title}</h1>
          <p className="text-gray-600 mt-2">{screens[currentStep].description}</p>
        </div>
        <div className="flex justify-center items-center w-full">{screens[currentStep].content}</div>
        {showBackButton && (
          <button
            onClick={handleBack}
            className="absolute top-28 left-4 w-12 h-12 flex items-center justify-center bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition duration-300 shadow-md"
          >
            <FiArrowLeft className="text-2xl" />
          </button>
        )}

        {showNextButton && (
          <button
            onClick={handleNext}
            className="absolute bottom-30 left-1/2 transform -translate-x-1/2 w-12 h-12 flex items-center justify-center bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition duration-300 shadow-md"
          >
            <FiArrowRight className="text-2xl" />
          </button>
        )}

      </div>

    </div>
  );
};

export default Deliver;

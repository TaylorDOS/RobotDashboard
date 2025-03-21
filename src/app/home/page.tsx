"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { getBaseStationAvailability, BaseStation } from "@/utils/getBaseStationAvailability";
import AccessDenied from "@/components/AccessDenied";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { FaSpinner } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import Select from "react-select";

interface CognitoUser {
  username: string;
  email: string;
}

const Home: React.FC = () => {
  const { data: session } = useSession();
  const generateTaskID = () => {
    const timestamp = Date.now().toString().slice(-6);
    const randomPart = Math.floor(100 + Math.random() * 900).toString();
    return timestamp + randomPart;
  };
  const [isLoading, setIsLoading] = useState(false);
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

  const userOptions = users.map((user) => ({
    value: user.username,
    label: `${user.username} (${user.email})`,
  }));

  const stationOptions = baseStations.map((station) => ({
    value: station.station,
    label: station.station,
  }));

  const getSlotVisuals = () => {
    const start = baseStations.find((s) => s.station === pickupStation);
    const end = baseStations.find((s) => s.station === dropoffStation);

    if (!start || !end) return [];

    const startAvailable = start.slots.filter((s) => s.status);
    const endAvailable = end.slots.filter((s) => s.status);
    const common = startAvailable.filter((s) =>
      endAvailable.some((e) => e.slot === s.slot)
    );

    const allSlots = Array.from({ length: 3 }, (_, i) => i + 1); // Assuming slots 1 to 5

    return allSlots.map((slotNum) => {
      const isAvailable = common.some((s) => s.slot === slotNum);
      return {
        value: slotNum,
        label: `${slotNum}`,
        available: isAvailable,
      };
    });
  };


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
    }
    if (currentStep === 3) {
      setTaskID(generateTaskID());
    }
  }, [currentStep]);

  const fetchStations = async () => {
    setIsLoading(true);
    setError("");
    try {
      const stations = await getBaseStationAvailability();
      setBaseStations(stations);
    } catch (err) {
      console.error("Error fetching base station data:", err);
      setError("Failed to load base station data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserChange = (selectedOption: any) => {
    setSelectedUser(selectedOption?.value || "");
  };

  const handlePriority = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setPriority(1);
      // const response = await axios.post("/api/vertex-ai", {
      //   description,
      //   category: priority
      // });
    } catch (error) {
      console.error("Error calling Vertex AI:", error);
      return;
    }
  }

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

  const handleNext = async () => {
    if (currentStep === 0 && (!selectedUser)) {
      setError("Please select a recipient before proceeding.");
      return;
    }
    if (currentStep === 1 && (!pickupStation || slot === null || !dropoffStation)) {
      setError("Please select pickup station, slot, and dropoff station before proceeding.");
      return;
    }
    if (currentStep === 2 && (description.trim() === "")) {
      setError("Please describe the item and priority before proceeding.");
      return;
    }
    setError("");
    if (currentStep === 2) {
      setIsLoading(true);
      await handlePriority();
      setIsLoading(false);
    }
    if (currentStep < screens.length - 1)
      setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const screens = [
    {
      title: "Automated Delivery",
      description: "Schedule a task for the delivery robot.",
      content: (
        <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto h-full -mt-12">
          <Image
            src="/img/deliver/robot.png"
            alt="Delivery Robot"
            width={300}
            height={300}
          />
          <div className="mt-8">
            Choose the intended recipient for the delivery.
          </div>
          <div className="mt-4 w-full">
            <label className="block font-medium text-lg mb-2">Select Receiver</label>
            <Select
              options={userOptions}
              onChange={handleUserChange}
              value={userOptions.find((opt) => opt.value === selectedUser)}
              placeholder="Choose a user..."
              className="text-left"
              classNames={{
                control: () => "p-1 shadow-md border border-gray-300",
              }}
            />
          </div>

          <div className="h-6 text-center mt-8">
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        </div>
      ),
    },
    {
      title: "Location",
      description: "Set your pickup and drop-off points and select an available slot.",
      content: (
        <div className="w-full h-full flex flex-col items-center justify-top mx-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <FaSpinner className="animate-spin text-blue-600 text-3xl" />
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              <div className="mt-6 w-full max-w-lg flex justify-between gap-4">
                {/* Pickup Station */}
                <div className="flex-1">
                  <label className="block font-medium text-lg mb-2">Pickup</label>
                  <Select
                    options={stationOptions}
                    value={stationOptions.find((opt) => opt.value === pickupStation)}
                    onChange={(selected) => {
                      setPickupStation(selected?.value || "");
                      setDropoffStation("");
                      setSlot(null);
                      setError("");
                    }}
                    placeholder="Select Start Station"
                    classNames={{ control: () => "rounded-full" }}
                  />
                </div>

                {/* Dropoff Station */}
                <div className="flex-1">
                  <label className="block font-medium text-lg mb-2">Dropoff</label>
                  <Select
                    options={stationOptions.filter((s) => s.value !== pickupStation)}
                    value={stationOptions.find((opt) => opt.value === dropoffStation)}
                    onChange={(selected) => {
                      setDropoffStation(selected?.value || "");
                      setSlot(null);
                      setError("");
                    }}
                    placeholder="Select End Station"
                    isDisabled={!pickupStation}
                    classNames={{ control: () => "rounded-full" }}
                  />
                </div>
              </div>

              {pickupStation && dropoffStation && (() => {
                const slotOptions = getSlotVisuals();

                return (
                  <div className="mt-6 w-40">
                    <label className="block font-medium text-lg mb-4">Available Slots</label>
                    <div className="w-full rounded-xl border border-gray-300 bg-white shadow-sm p-4">
                      <div className="grid grid-cols-1 gap-3">
                        {slotOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => option.available && setSlot(option.value)}
                            disabled={!option.available}
                            className={`py-2 px-4 rounded-md text-sm font-medium border transition duration-200
                              ${option.available
                                ? slot === option.value
                                  ? "bg-green-600 text-white border-green-600 shadow-md"
                                  : "bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
                                : "bg-red-100 text-red-400 border-red-200 cursor-not-allowed"
                              }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
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
      title: "Details",
      description: "Describe the item so we can assess its priority.",
      content: (
        <div className="flex flex-col w-full max-w-lg mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <FaSpinner className="animate-spin text-blue-600 text-3xl" />
            </div>
          ) : (
            <>
              <div className="mt-6 w-full">
                <input
                  type="text"
                  className="border border-gray-300 rounded p-2 mt-2 w-full"
                  placeholder="Describe the item of delivery..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="h-6 text-center mt-8">
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>
            </>
          )}
        </div>
      ),
    },
    {
      title: "Review",
      description: "Double-check all task details before submitting.",
      content: (
        <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto">
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
                  <td className="font-semibold p-2">Priority:</td>
                  <td className="p-2">{priority || "Not selected"}</td>
                </tr>

              </tbody>
            </table>
          </div>

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
      description: "Task created, You can now track its delivery progress.",
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
      <div className="relative w-full bg-gray-200 h-1">
        <div
          className="bg-blue-500 h-1 rounded-full"
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
          <div className="flex-grow text-center">
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

export default Home;

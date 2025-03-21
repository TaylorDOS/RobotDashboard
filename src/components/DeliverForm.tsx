"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { getBaseStationAvailability, BaseStation } from "@/utils/getBaseStationAvailability";
import { classifyDescription } from "@/lib/api";

interface CognitoUser {
  username: string;
  email: string;
}

export function DeliverForm() {
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
  
  // Item details and classification states
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [priority, setPriority] = useState<number | "">("");
  const [isClassifying, setIsClassifying] = useState<boolean>(false);
  const [classificationError, setClassificationError] = useState<boolean>(false);
  const [manualSelection, setManualSelection] = useState<boolean>(false);
  
  const [error, setError] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Map categories to their respective priorities
  const categoryPriorityMap: {[key: string]: number} = {
    "Medicine": 1,
    "Blood Samples": 2,
    "Documents": 3,
    "Linen Supplies": 4,
    "Others": 5
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
    } catch (error) {
      console.error("Error fetching Cognito users:", error);
      setError(prev => ({...prev, general: "Failed to fetch users"}));
    }
  };
  
  const fetchCurrentUsername = async () => {
    if (!session) return;
    
    try {
      if (session.user?.name) {
        setUsername(session.user.name);
        return;
      }
      
      const matchedUser = users.find((user) => user.email === session.user?.email);
      if (matchedUser) {
        setUsername(matchedUser.username);
      }
    } catch (error) {
      console.error("Error fetching current username:", error);
    }
  };
  
  const fetchStations = async () => {
    try {
      const stations = await getBaseStationAvailability();
      setBaseStations(stations);
    } catch (err) {
      console.error("Error fetching base station data:", err);
      setError(prev => ({...prev, locations: "Failed to load base station data."}));
    }
  };
  
  // Function to classify the description and set priority/category
  const handleClassification = async () => {
    if (!description.trim()) {
      setError(prev => ({...prev, description: "Please enter a description first"}));
      return;
    }
    
    setError(prev => ({...prev, description: ""}));
    setIsClassifying(true);
    setClassificationError(false);
    
    try {
      console.log("Starting classification for:", description);
      
      // Set a timeout to switch to manual mode if classification takes too long
      const timeoutId = setTimeout(() => {
        if (isClassifying) {
          console.log("Classification timeout - switching to manual selection");
          setClassificationError(true);
          setIsClassifying(false);
        }
      }, 8000); // 8-second timeout
      
      // Attempt to classify, but with error handling that doesn't break the UI
      try {
        // Call the classification API
        const result = await classifyDescription(description);
        
        console.log("Classification successful:", result);
        
        // Handle API response format
        if (!result.category) {
          throw new Error("API response missing category information");
        }
        
        setCategory(result.category);
        // If API returns priority directly, use it; otherwise, map from category
        if (result.priority !== undefined) {
          setPriority(result.priority);
        } else {
          setPriority(categoryPriorityMap[result.category] || 5); // Default to "Others" (5) if not found
        }
        
        setClassificationError(false);
        setManualSelection(false);
      } catch (apiError) {
        console.error("API error details:", apiError);
        setClassificationError(true);
        
        // If the API failed, second resort
        // This is a fallback heuristic when the API is unavailable
        if (description.toLowerCase().includes("medicine") || 
            description.toLowerCase().includes("pill") || 
            description.toLowerCase().includes("drug") || 
            description.toLowerCase().includes("prescription")) {
          console.log("Applying fallback heuristic: Medicine");
          setCategory("Medicine");
          setPriority(1);
          setManualSelection(true); // Still enable manual mode, but with a pre-selection
        } else if (description.toLowerCase().includes("blood") || 
                 description.toLowerCase().includes("sample") || 
                 description.toLowerCase().includes("specimen") || 
                 description.toLowerCase().includes("lab")) {
          console.log("Applying fallback heuristic: Blood Samples");
          setCategory("Blood Samples");
          setPriority(2);
          setManualSelection(true);
        } else if (description.toLowerCase().includes("document") || 
                 description.toLowerCase().includes("paper") || 
                 description.toLowerCase().includes("file") || 
                 description.toLowerCase().includes("form")) {
          console.log("Applying fallback heuristic: Documents");
          setCategory("Documents");
          setPriority(3);
          setManualSelection(true);
        } else if (description.toLowerCase().includes("linen") || 
                 description.toLowerCase().includes("cloth") || 
                 description.toLowerCase().includes("supply") || 
                 description.toLowerCase().includes("fabric")) {
          console.log("Applying fallback heuristic: Linen Supplies");
          setCategory("Linen Supplies");
          setPriority(4);
          setManualSelection(true);
        } else {
          // When all else fails, default to "Others"
          console.log("Applying fallback default: Others");
          setCategory("Others");
          setPriority(5);
          setManualSelection(true);
        }
      }
      
      clearTimeout(timeoutId);
    } catch (error) {
      console.error("General error during classification process:", error);
      setClassificationError(true);
      setManualSelection(true); // Automatically switch to manual mode on critical errors
    } finally {
      setIsClassifying(false);
    }
  };
  
  // Reset classification when description changes
  useEffect(() => {
    if (!manualSelection && description.trim() !== "" && !isClassifying) {
      // Reset category and priority when description changes and not in manual mode
      setCategory("");
      setPriority("");
    }
  }, [description]);
  
  const validateForm = () => {
    let isValid = true;
    const newErrors: {[key: string]: string} = {};
    
    if (!selectedUser) {
      newErrors.user = "Please select a recipient";
      isValid = false;
    }
    
    if (!pickupStation || !dropoffStation || slot === null) {
      newErrors.locations = "Please complete location details";
      isValid = false;
    }
    
    if (description.trim() === "") {
      newErrors.description = "Please enter a description";
      isValid = false;
    }
    
    if (priority === "") {
      newErrors.description = (newErrors.description || "") + " Please classify or select a category";
      isValid = false;
    }
    
    setError(newErrors);
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
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
    
    try {
      await axios.post('https://4oomdu5wr0.execute-api.ap-southeast-1.amazonaws.com/default/WebHooks', requestPayload);
      setIsSubmitted(true);

      setSelectedUser("");
      setPickupStation("");
      setDropoffStation("");
      setSlot(null);
      setPriority("");
      setCategory("");
      setDescription("");
      setTaskID(generateTaskID());
      setIsSubmitted(false);
      setManualSelection(false);
      
      setError({success: "Task created successfully!"});
      setTimeout(() => {
        setError({});
      }, 3000);
      
    } catch (error) {
      console.error('Error:', error);
      setError({general: "Failed to submit task. Please try again."});
    } finally {
      setIsSubmitting(false);
    }
  };
  
  useEffect(() => {
    setTaskID(generateTaskID());
  }, []);
  
  useEffect(() => {
    if (session) {
      fetchUsers();
      fetchStations();
    }
  }, [session]);

  useEffect(() => {
    if (users.length > 0 && session?.user?.email) {
      fetchCurrentUsername();
    }
  }, [users]);
  
  return (
    <div className="w-full">
      {username && (
        <div className="text-sm text-gray-600 mb-4">Logged in as: {username}</div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {error.general && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
            {error.general}
          </div>
        )}
        
        {error.success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded text-sm">
            {error.success}
          </div>
        )}
        
        {/* Section 1: Recipient */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-md font-medium mb-3 text-blue-600">1. Recipient Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Who are you delivering to?
            </label>
            <select
              className="border border-gray-300 rounded p-2 w-full text-sm"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="" disabled>Select Recipient</option>
              {users.map((user) => (
                <option key={user.username} value={user.username}>
                  {user.username} ({user.email})
                </option>
              ))}
            </select>
            {error.user && <p className="text-red-500 text-xs mt-1">{error.user}</p>}
          </div>
        </div>
        
        {/* Section 2: Locations */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-md font-medium mb-3 text-blue-600">2. Pickup & Dropoff</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Location
              </label>
              <select
                className="border border-gray-300 rounded p-2 w-full text-sm"
                value={pickupStation}
                onChange={(e) => {
                  setPickupStation(e.target.value);
                  setDropoffStation("");
                  setSlot(null);
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dropoff Location
              </label>
              <select
                className="border border-gray-300 rounded p-2 w-full text-sm"
                value={dropoffStation}
                onChange={(e) => {
                  setDropoffStation(e.target.value);
                  setSlot(null);
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
            
            {pickupStation && dropoffStation && (
              (() => {
                // Find available slots for both stations
                const startSlots = baseStations.find((s) => s.station === pickupStation)?.slots.filter((s) => s.status) || [];
                const endSlots = baseStations.find((s) => s.station === dropoffStation)?.slots.filter((s) => s.status) || [];

                // Find common slots between the two stations
                const commonSlots = startSlots.filter((s) => endSlots.some((es) => es.slot === s.slot));

                // If no common slots exist, return error message
                if (commonSlots.length === 0) {
                  return <p className="text-red-500 text-xs mt-1">No available slots between the selected stations.</p>;
                }

                return (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Available Slot
                    </label>
                    <select
                      className="border border-gray-300 rounded p-2 w-full text-sm"
                      value={slot || ""}
                      onChange={(e) => setSlot(Number(e.target.value))}
                    >
                      <option value="" disabled>Select Slot</option>
                      {commonSlots.map((slotItem) => (
                        <option key={slotItem.slot} value={slotItem.slot}>
                          Slot {slotItem.slot}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })()
            )}
            {error.locations && <p className="text-red-500 text-xs mt-1">{error.locations}</p>}
          </div>
        </div>
        
        {/* Section 3: Item Details with Auto-Classification */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-md font-medium mb-3 text-blue-600">3. Item Details</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="border border-gray-300 rounded p-2 flex-grow text-sm"
                  placeholder="Describe the item for delivery..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleClassification}
                  disabled={isClassifying || description.trim() === ""}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-sm disabled:bg-blue-300"
                >
                  {isClassifying ? "Classifying..." : "Classify"}
                </button>
              </div>
            </div>
            
            {/* Classification Result or Manual Selection */}
            {isClassifying ? (
              <div className="flex items-center text-blue-600 text-sm">
                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Classifying description...
              </div>
            ) : classificationError || manualSelection ? (
              <>
                {classificationError && !manualSelection && (
                  <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-2 rounded text-xs mb-2">
                    <p>Classification service is unavailable. A best guess has been made based on your description.</p>
                    <p className="mt-1 font-medium">You can adjust the category if needed.</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category (Manual Selection)
                  </label>
                  <select
                    className="border border-gray-300 rounded p-2 w-full text-sm"
                    value={priority}
                    onChange={(e) => {
                      const priorityValue = Number(e.target.value);
                      setPriority(priorityValue);
                      // Find corresponding category
                      const selectedCategory = Object.entries(categoryPriorityMap)
                        .find(([_, value]) => value === priorityValue)?.[0] || "Others";
                      setCategory(selectedCategory);
                    }}
                  >
                    <option value="" disabled>Select Category</option>
                    <option value={1}>Medicine</option>
                    <option value={2}>Blood Samples</option>
                    <option value={3}>Documents</option>
                    <option value={4}>Linen Supplies</option>
                    <option value={5}>Others</option>
                  </select>
                </div>
              </>
            ) : category ? (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <div className="flex justify-between">
                  <div className="font-medium text-green-800 text-sm">Classification Result:</div>
                  <button
                    type="button"
                    onClick={() => setManualSelection(true)}
                    className="text-blue-600 hover:text-blue-800 text-xs"
                  >
                    Change Manually
                  </button>
                </div>
                <div className="mt-1 text-sm">
                  <div><span className="font-medium">Category:</span> {category}</div>
                  <div><span className="font-medium">Priority:</span> {priority}</div>
                </div>
              </div>
            ) : description.trim() !== "" ? (
              <div className="flex items-center justify-between">
                <div className="text-amber-600 text-sm">
                  Please classify the description or select a category manually.
                </div>
                <button
                  type="button"
                  onClick={() => setManualSelection(true)}
                  className="text-blue-600 hover:text-blue-800 text-xs"
                >
                  Select Manually
                </button>
              </div>
            ) : null}
            
            {error.description && <p className="text-red-500 text-xs mt-1">{error.description}</p>}
          </div>
        </div>
        
        {/* Task Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-md font-medium mb-3 text-blue-600">4. Task Summary</h3>
          
          <div className="text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div className="font-medium">Task ID:</div>
              <div>{taskID || "Generating..."}</div>
              
              <div className="font-medium">Sender:</div>
              <div>{username || "Not determined"}</div>
              
              <div className="font-medium">Receiver:</div>
              <div>{selectedUser || "Not selected"}</div>
              
              <div className="font-medium">Pickup:</div>
              <div>{pickupStation || "Not selected"}</div>
              
              <div className="font-medium">Dropoff:</div>
              <div>{dropoffStation || "Not selected"}</div>
              
              <div className="font-medium">Slot:</div>
              <div>{slot !== null ? `Slot ${slot}` : "Not selected"}</div>
              
              <div className="font-medium">Category:</div>
              <div>{category || "Not classified"}</div>
              
              <div className="font-medium">Priority:</div>
              <div>{priority !== "" ? priority : "Not set"}</div>
              
              <div className="font-medium">Description:</div>
              <div>{description || "Not provided"}</div>
            </div>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition duration-300 disabled:bg-blue-300"
        >
          {isSubmitting ? "Creating Task..." : "Create Task"}
        </button>
      </form>
    </div>
  );
}
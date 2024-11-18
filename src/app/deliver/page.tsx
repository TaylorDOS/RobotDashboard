"use client";
import { FiBox, FiLoader } from "react-icons/fi";
import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";
import StatusBar from "@/components/StatusBar";


const Deliver: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const [pickup, setPickup] = useState<number | null>(null);
  const [dropoff, setDropoff] = useState<number | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [status, setStatus] = useState<string>("None");
  const [timestamp, setTimestamp] = useState<number | null>(null);

  const [fetching, setFetching] = useState(false);
  const [showNextButton, setShowNextButton] = useState(true);
  const [showBackButton, setShowBackButton] = useState(false);

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
    if (!fetching) return;

    const intervalId = setInterval(fetchStatus, 3000);
    fetchStatus();

    return () => clearInterval(intervalId)
  }, [fetching]);

  useEffect(() => {
    if (currentStep === 0) {
      setShowNextButton(false);
      setShowBackButton(false);
    }
    else if (currentStep === 4) {
      setShowNextButton(false);
      setShowBackButton(false);
    }
    else if (currentStep === 5) {
      setShowNextButton(false);
      setShowBackButton(false);

    }
    else if (currentStep === 6) {
      setShowNextButton(false);
      setShowBackButton(false);

    }
    else if (currentStep === 7) {
      setShowNextButton(false);
      setShowBackButton(false);
    }
     else {
      setShowNextButton(true);
      setShowBackButton(true);
    }

    if (screens[currentStep]?.onLoad) {
      screens[currentStep].onLoad();
    }
  }, [currentStep]);

  const startFetching = () => {
    setFetching(true);
  };

  const sendRequest = () => {
    const requestPayload = {
      message: "InitiateLoading",
      start: pickup,
      end: dropoff,
      loadCompartment: 1,
      unloadCompartment: 1,
    };

    axios.post('https://4oomdu5wr0.execute-api.ap-southeast-1.amazonaws.com/default/WebHooks', requestPayload)
      .then(response => {
      })
      .catch(error => {
        console.error('Error:', error);
      });
    handleNext();
  };

  const handleSelectSize = (size: string) => {
    setSelectedSize(size);
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (selectedSize === null) {
        setError("Please select size before proceeding.");
        return;
      }
    }
    else if (currentStep === 2 && pickup === null) {
      setError("Please select a base station before proceeding.");
      return;
    }
    else if (currentStep === 3 && dropoff === null) {
      setError("Please select a base station before proceeding.");
      return;
    }
    else if (currentStep === 6) {
      startFetching();
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
      title: "Welcome, operator",
      description: "Before proceeding, confirm that you are ready to begin.",
      content: (
        <button
          onClick={() => handleNext()}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Confirm
        </button>
      ),
    },
    {
      title: "Select the size of your parcel",
      description: "Choose the parcel size for your delivery.",
      content: (
        <div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <button
              className={`flex flex-col items-center justify-center w-32 h-32 rounded shadow ${selectedSize === "Small"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-800"
                }`}
              onClick={() => handleSelectSize("Small")}
            >
              <FiBox size={24} className={`${selectedSize === "Small" ? "text-white" : "text-blue-500"}`} />
              <span className="mt-2">Small</span>
            </button>

            <button
              className={`flex flex-col items-center justify-center w-32 h-32 rounded shadow ${selectedSize === "Medium"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800"
                }`}
              onClick={() => handleSelectSize("Medium")}
            >
              <FiBox size={32} className={`${selectedSize === "Medium" ? "text-white" : "text-blue-500"}`} />
              <span className="mt-2">Medium</span>
            </button>


            <button
              className={`flex flex-col items-center justify-center w-32 h-32 rounded shadow ${selectedSize === "Large"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800"
                }`}
              onClick={() => handleSelectSize("Large")}
            >
              <FiBox size={40} className={`${selectedSize === "Large" ? "text-white" : "text-blue-500"}`} />
              <span className="mt-2">Large</span>
            </button>

          </div>
          <div className="h-6 mt-2">
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
          </div>
        </div>

      ),
    },
    {
      title: "Where to pick up?",
      description: "Select the nearest base station to where you are.",
      content: (
        <div className="w-1/2">
          <label className="block">
            <select
              className="border border-gray-300 rounded p-2 mt-2 w-full"
              value={pickup === null ? "" : pickup}
              onChange={(e) => setPickup(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="" disabled>
                Select a base station
              </option>
              <option value={1}>Base Station 1</option>
              <option value={2}>Base Station 2</option>
              <option value={3}>Base Station 3</option>
            </select>
          </label>
          <div className="h-6 mt-2 ">
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Where to drop off?",
      description: "Select which base station to drop off at.",
      content: (
        <div className="w-1/2">
          <label className="block">
            Select Drop Off Base Station:
            <select
              className="border border-gray-300 rounded p-2 mt-2 w-full"
              value={dropoff === null ? "" : dropoff}
              onChange={(e) => setDropoff(Number(e.target.value))}
            >
              <option value="" disabled>
                Select an option
              </option>
              <option value={1}>Base Station 1</option>
              <option value={2}>Base Station 2</option>
              <option value={3}>Base Station 3</option>
            </select>
          </label>
          <div className="h-6 mt-2 ">
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Working hard",
      description: "Please wait while we calculate the best route for you.",
      content: (
        <div className="flex flex-col items-center">
          <FiLoader className="animate-spin text-blue-500 text-4xl" />
          <p className="mt-4 text-gray-600">Calculating...</p>
        </div>
      ),
      onLoad: () => {
        console.log("Calculating route...");
        setTimeout(() => {
          setCurrentStep(5);
        }, 3000);
      },
    },
    {
      title: "Please drop off at:",
      description: "Compartment X at Base Station 1",
      content: (
        <div className="flex flex-col items-center justify-center">
          <Image
            src="/img/basestation.png"
            alt="Base Station"
            width={200} // Image width
            height={24} // Image height
            className="object-contain items-center justify-center"
          />
          <div className="px-4 py-2 text-black rounded mt-4">
            Click done when you have dropped off the parcel.
          </div>
          <button className="px-4 py-2 bg-green-500 text-white rounded mt-4" onClick={handleNext}>
            Done
          </button>

        </div>
      ),
    },
    {
      title: "Order Confirmation",
      description: "Double check the order details before proceeding.",
      content: (
        <div className="flex flex-col items-center justify-center">
          <div className="px-4 py-2 text-black rounded mt-4">
            {/* Display selected variables here */}
            <p><strong>Pickup Base Station:</strong> {pickup === 0 ? "Not selected" : `Base Station ${pickup}`}</p>
            <p><strong>Dropoff Base Station:</strong> {dropoff === 0 ? "Not selected" : `Base Station ${dropoff}`}</p>
            <p><strong>Parcel Size:</strong> {selectedSize || "Not selected"}</p>
            <p><strong>Pickup Compartment:</strong> 1, hardcoded</p>
            <p><strong>Dropoff Compartment:</strong> 1, hardcoded</p>
          </div>
          <button
            onClick={sendRequest}
            className="px-4 py-2 bg-green-500 text-white rounded mt-4"
          >
            Send Request
          </button>

        </div>
      ),
    },
    {
      title: "Status",
      description: "Check the status of your delivery.",
      content: (
        <StatusBar status={status} timestamp={timestamp} />
      ),
    },
  ];



  const progress = ((currentStep) / (screens.length - 1)) * 100;
  useEffect(() => {
    if (screens[currentStep]?.onLoad) {
      screens[currentStep].onLoad();
    }
  }, [currentStep]);

  return (
    <div className="max-w-screen-lg mx-auto h-[90vh] flex flex-col justify-between items-center">
      <div className="h-1/3 w-full flex flex-col justify-center items-center text-center">
        <h1 className="text-2xl font-bold">{screens[currentStep].title}</h1>
        <p className="text-gray-600 mt-2">{screens[currentStep].description}</p>
      </div>
      <div className="flex h-2/3 justify-center items-center bg-slate-50 w-full">{screens[currentStep].content}</div>
      {showBackButton && (
        <button
          onClick={handleBack}
          className="absolute top-28 left-4 px-4 py-2 bg-gray-200 text-gray-800 rounded"
        >
          Back
        </button>
      )}
      {showNextButton && (
        <button
          onClick={handleNext}
          className="absolute top-28 right-4 px-4 py-2 bg-gray-200 text-gray-800 rounded"
        >
          Next
        </button>
      )}

      <div className="absolute top-[9vh] left-0 w-full bg-gray-200 h-2">
        <div
          className="bg-blue-500 h-2 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default Deliver;

import React from 'react';

interface StatusBarProps {
  status: string;
  timestamp: number | null;
}

const StatusBar: React.FC<StatusBarProps> = ({ status, timestamp }) => {
  // Steps in the process
  const steps = ['Waiting', 'Moving to Start', 'Pickup', 'Moving to Dropoff', 'Dropoff', 'Done'];

  // Mapping status to completed steps
  const statusToCompletedSteps: { [key: string]: number } = {
    'Waiting': 1,
    'Moving to Start': 2,
    'Pickup': 3,
    'Moving to Dropoff': 4,
    'Dropoff': 5,
    'Done': 6,
  };

  const completedSteps = statusToCompletedSteps[status] ?? 0;

  return (
    <div className="mt-4">
      <h2 className="text-2xl font-bold mb-4">Status</h2>
      <div className="text-lg">
        <strong>Current Progress: </strong> {status}
      </div>
      <div className="text-sm">
        <strong>Last Updated: </strong> {timestamp ? new Date(timestamp).toLocaleString() : "Not available"}
      </div>
      <div className="flex flex-col lg:flex-row justify-between w-full items-center gap-x-4 gap-y-4 lg:gap-y-0 mt-4">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`w-full flex-grow h-12 rounded-full flex items-center justify-center
              ${index < completedSteps ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}
          >
            {step}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusBar;

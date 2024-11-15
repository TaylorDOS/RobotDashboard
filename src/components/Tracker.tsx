// Tracker Component (adjusting types to accept an array of strings)
interface DominoTrackerProps {
    steps: string[];      // This accepts an array of strings, e.g., ['Waiting', 'Moving', 'Pickup', ...]
    completedSteps: number; // Represents the number of completed steps
  }
  
  const Tracker: React.FC<DominoTrackerProps> = ({ steps, completedSteps }) => {
    return (
        <div className="flex flex-col lg:flex-row justify-between w-full items-center gap-x-4 gap-y-4 lg:gap-y-0">
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
      
    );
  };
  
  export default Tracker;
  
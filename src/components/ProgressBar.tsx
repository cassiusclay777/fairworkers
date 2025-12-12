import './ProgressBar.css';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export function ProgressBar({ currentStep, totalSteps, steps }: ProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full space-y-4">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`bg-accent h-2 rounded-full transition-all duration-300 w-[${progress}%]`} />
      </div>
      
      {/* Step Labels */}
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div 
            key={index}
            className={`text-center flex-1 ${
              index === currentStep - 1 
                ? 'text-accent font-900' 
                : index < currentStep - 1 
                ? 'text-green-600' 
                : 'text-gray-400'
            }`}
          >
            <div className="text-sm font-body font-500">{step}</div>
            <div className="text-xs mt-1">
              {index < currentStep - 1 ? '✓' : `${index + 1}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProgressBar;
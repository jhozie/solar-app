import { useState } from 'react';
import SummaryModal from './SummaryModal';
import { CalculatorData } from './Calculator';

type Step = {
  title: string;
  description: string;
  component: React.ReactNode;
};

type StepperProps = {
  steps: Step[];
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  canNext: boolean;
  data: CalculatorData;
  tariffs: Record<string, {
    minHours: number;
    maxHours: number;
    tariff: number;
    avgKwhPerDay: number;
  }>;
};

export default function Stepper({ 
  steps, 
  currentStep, 
  onNext, 
  onPrev, 
  canNext,
  data,
  tariffs
}: StepperProps) {
  const [showSummary, setShowSummary] = useState(false);

  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      setShowSummary(true);
    } else {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="relative pb-8">
        <div className="flex justify-between mb-4">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm
                  ${index <= currentStep 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-400 dark:bg-gray-700'}`}
              >
                {index + 1}
              </div>
              <div className="text-center mt-2">
                <p className={`text-sm font-medium ${
                  index <= currentStep 
                    ? 'text-gray-900 dark:text-gray-100' 
                    : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 hidden sm:block">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute top-4 left-0 right-0 -z-10">
          <div className="h-0.5 bg-gray-200 dark:bg-gray-700 w-full" />
          <div 
            className="h-0.5 bg-green-600 absolute top-0 left-0 transition-all duration-300"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Current Step Content */}
      <div className="py-6 transition-all duration-300">
        {steps[currentStep].component}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onPrev}
          disabled={currentStep === 0}
          className={`px-6 py-2 rounded-lg font-medium transition-colors
            ${currentStep === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={!canNext}
          className={`px-6 py-2 rounded-lg font-medium transition-colors
            ${!canNext
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800'
              : currentStep === steps.length - 1
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
        >
          {currentStep === steps.length - 1 ? 'View Summary' : 'Next'}
        </button>
      </div>

      <SummaryModal
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
        data={data}
        tariffs={tariffs}
      />
    </div>
  );
} 
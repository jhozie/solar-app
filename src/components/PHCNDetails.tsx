import { CalculatorData } from './Calculator';

type PHCNDetailsProps = {
  hoursMin: number;
  hoursMax: number;
  onChange: (updates: Partial<CalculatorData>) => void;
  selectedBand: 'A' | 'B' | 'C' | 'D' | null;
  bandInfo: Record<string, { minHours: number; maxHours: number; tariff: number }>;
};

export default function PHCNDetails({ 
  hoursMin, 
  hoursMax, 
  onChange,
  selectedBand,
  bandInfo
}: PHCNDetailsProps) {
  
  const handleMinChange = (value: number) => {
    // Ensure min doesn't exceed max and stays within 0-20 range
    const newMin = Math.min(value, hoursMax, 20);
    onChange({ phcnHoursMin: newMin });
  };

  const handleMaxChange = (value: number) => {
    // Ensure max isn't below min and stays within 0-24 range
    const newMax = Math.min(Math.max(value, hoursMin), 24);
    onChange({ phcnHoursMax: newMax });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          PHCN Power Supply Hours
        </h2>
        <div className="px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
          <span className="text-green-800 dark:text-green-300 font-medium">
            Current Range: {hoursMin} - {hoursMax} hrs/day
          </span>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Minimum Hours per Day
          </label>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {hoursMin} hrs
          </div>
          <input
            type="range"
            value={hoursMin}
            onChange={(e) => handleMinChange(Number(e.target.value))}
            min={0}
            max={20}
            step="0.5"
            className="w-full accent-green-600"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>0hrs</span>
            <span>20hrs</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Maximum Hours per Day
          </label>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {hoursMax} hrs
          </div>
          <input
            type="range"
            value={hoursMax}
            onChange={(e) => handleMaxChange(Number(e.target.value))}
            min={0}
            max={24}
            step="0.5"
            className="w-full accent-green-600"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>0hrs</span>
            <span>24hrs</span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium text-blue-700 dark:text-blue-300">
            Power Supply Range
          </span>
        </div>
        <p className="text-sm text-blue-600 dark:text-blue-300">
          You've set your PHCN power supply range to:
          <span className="block mt-1 text-lg font-bold">
            {hoursMin} - {hoursMax} hours per day
          </span>
          {selectedBand && (
            <span className="block mt-2 text-xs opacity-75">
              Note: Band {selectedBand} typically provides {bandInfo[selectedBand].minHours} - {bandInfo[selectedBand].maxHours} hours,
              but you can set any range based on your actual experience.
            </span>
          )}
        </p>
      </div>
    </div>
  );
} 
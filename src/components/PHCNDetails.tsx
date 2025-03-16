'use client';

import { CalculatorData } from './Calculator';

type PHCNDetailsProps = {
  hoursMin: number;
  hoursMax: number;
  generatorHours: number[];
  onChange: (updates: Partial<CalculatorData>) => void;
  selectedBand: 'A' | 'B' | 'C' | 'D' | 'E' | null;
  bandInfo: Record<string, { minHours: number; maxHours: number; tariff: number }>;
};

export default function PHCNDetails({ 
  hoursMin,
  hoursMax,
  generatorHours, 
  onChange,
  selectedBand,
  bandInfo
}: PHCNDetailsProps) {
  const handleMinChange = (value: number) => {
    onChange({ phcnHoursMin: Math.min(Math.max(value, 0), hoursMax) });
  };

  const handleMaxChange = (value: number) => {
    onChange({ phcnHoursMax: Math.max(Math.min(value, 24), hoursMin) });
  };

  const handleGeneratorChange = (value: number, dayIndex: number) => {
    const newHours = [...generatorHours];
    const avgPHCN = (hoursMin + hoursMax) / 2;
    const maxGenHours = Math.max(24 - avgPHCN, 0);
    newHours[dayIndex] = Math.min(Math.max(value, 0), maxGenHours);
    onChange({ generatorHours: newHours });
  };

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const avgGenerator = (generatorHours.reduce((sum, hours) => sum + hours, 0) / 7).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Power Supply Hours
        </h2>
        <div className="px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
          <span className="text-green-800 dark:text-green-300 font-medium">
            PHCN Range: {hoursMin} - {hoursMax} hrs/day
          </span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            PHCN Minimum Hours per Day
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
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            PHCN Maximum Hours per Day
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
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Daily Power Supply Hours
        </h2>
        <div className="flex space-x-4">
          <div className="px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <span className="text-green-800 dark:text-green-300 font-medium">
              Avg Generator: {avgGenerator} hrs/day
            </span>
          </div>
        </div>
      </div>
      
      <div className="grid gap-6">
        {daysOfWeek.map((day, index) => (
          <div key={day} className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white">{day}</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Generator Hours
                </label>
                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  {generatorHours[index]} hrs
                </div>
              </div>
              <input
                type="range"
                value={generatorHours[index]}
                onChange={(e) => handleGeneratorChange(Number(e.target.value), index)}
                min={0}
                max={24}
                step="0.5"
                className="w-full accent-orange-600"
              />
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              Total: {generatorHours[index]}/24 hrs
            </div>
          </div>
        ))}
      </div>

      {selectedBand && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium text-blue-700 dark:text-blue-300">
              Band {selectedBand} Information
            </span>
          </div>
          <p className="text-sm text-blue-600 dark:text-blue-300">
            Your selected Band {selectedBand} typically provides {bandInfo[selectedBand].minHours} - {bandInfo[selectedBand].maxHours} hours,
            but you can set any range based on your actual experience.
          </p>
        </div>
      )}
    </div>
  );
} 
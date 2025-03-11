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
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
        PHCN Power Supply Hours
      </h2>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Minimum Hours per Day
          </label>
          <input
            type="number"
            value={hoursMin}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (selectedBand) {
                const min = bandInfo[selectedBand].minHours;
                const max = bandInfo[selectedBand].maxHours;
                if (value >= min && value <= max) {
                  onChange({ phcnHoursMin: value });
                }
              }
            }}
            min={selectedBand ? bandInfo[selectedBand].minHours : 0}
            max={selectedBand ? bandInfo[selectedBand].maxHours : 24}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          {selectedBand && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Band {selectedBand} minimum: {bandInfo[selectedBand].minHours} hours
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Maximum Hours per Day
          </label>
          <input
            type="number"
            value={hoursMax}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (selectedBand) {
                const min = bandInfo[selectedBand].minHours;
                const max = bandInfo[selectedBand].maxHours;
                if (value >= min && value <= max) {
                  onChange({ phcnHoursMax: value });
                }
              }
            }}
            min={selectedBand ? bandInfo[selectedBand].minHours : 0}
            max={selectedBand ? bandInfo[selectedBand].maxHours : 24}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          {selectedBand && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Band {selectedBand} maximum: {bandInfo[selectedBand].maxHours} hours
            </p>
          )}
        </div>
      </div>

      {selectedBand && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-600 dark:text-blue-300">
            Based on Band {selectedBand}, you should receive between{' '}
            <span className="font-medium">{bandInfo[selectedBand].minHours}</span> and{' '}
            <span className="font-medium">{bandInfo[selectedBand].maxHours}</span> hours of power supply daily.
            Your estimated monthly PHCN bill will be shown in the results.
          </p>
        </div>
      )}
    </div>
  );
} 
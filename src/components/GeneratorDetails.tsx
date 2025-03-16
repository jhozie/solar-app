import { CalculatorData } from './Calculator';

type GeneratorDetailsProps = {
  kva: number;
  dieselPrice: number;
  maintenanceCost: number;
  onChange: (updates: Partial<CalculatorData>) => void;
};

export default function GeneratorDetails({ kva, dieselPrice, maintenanceCost, onChange }: GeneratorDetailsProps) {
  const handleKVAChange = (value: number) => {
    // Allow any input, even if outside range
    onChange({ generatorKVA: value });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
        Generator Details
      </h2>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Generator Capacity (KVA)
          </label>
          <div className="relative">
            <div className="flex items-center">
              <input
                type="number"
                value={kva}
                onChange={(e) => handleKVAChange(Number(e.target.value))}
                min="3"
                max="10"
                step="any"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 
                  ${kva < 3 || kva > 10 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-300 focus:border-green-500'} 
                  dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                placeholder="Enter KVA (3-10)"
              />
              <span className="absolute right-3 text-sm text-gray-500">KVA</span>
            </div>
            {(kva < 3 || kva > 10) && (
              <p className="absolute text-xs text-red-500 mt-1">
                Please enter a value between 3 and 10 KVA
              </p>
            )}
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
            <span>Min: 3 KVA</span>
            <span>Max: 10 KVA</span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Recommended solar packages:
            <ul className="mt-1 space-y-1 pl-4">
              <li>• 3-4 KVA → 3kW solar system</li>
              <li>• 5-7 KVA → 5kW solar system</li>
              <li>• 8-10 KVA → 10kW solar system</li>
            </ul>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Diesel/Petrol Price (₦/Liter)
          </label>
          <input
            type="number"
            value={dieselPrice}
            onChange={(e) => onChange({ dieselPricePerLiter: Number(e.target.value) })}
            min="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Yearly Maintenance Cost (₦)
          </label>
          <input
            type="number"
            value={maintenanceCost}
            onChange={(e) => onChange({ maintenanceCostYearly: Number(e.target.value) })}
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>
    </div>
  );
} 
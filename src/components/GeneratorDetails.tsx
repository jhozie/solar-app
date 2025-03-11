import { CalculatorData } from './Calculator';

type GeneratorDetailsProps = {
  kva: number;
  dieselPrice: number;
  onChange: (updates: Partial<CalculatorData>) => void;
};

export default function GeneratorDetails({ kva, dieselPrice, onChange }: GeneratorDetailsProps) {
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
          <input
            type="number"
            value={kva}
            onChange={(e) => onChange({ generatorKVA: Number(e.target.value) })}
            min="1"
            max="500"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Diesel Price (₦/Liter)
          </label>
          <input
            type="number"
            value={dieselPrice}
            onChange={(e) => onChange({ dieselPricePerLiter: Number(e.target.value) })}
            min="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>
    </div>
  );
} 
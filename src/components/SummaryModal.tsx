import { CalculatorData } from './Calculator';

type SummaryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  data: CalculatorData;
  tariffs: Record<string, {
    minHours: number;
    maxHours: number;
    tariff: number;
    avgKwhPerDay: number;
  }>;
};

// Update the generator fuel consumption lookup table with full load values
const GENERATOR_FUEL_CONSUMPTION: Record<number, number> = {
  3: 1.2,    // 3kVA = 1.2L/hr at full load
  4: 1.6,    // 4kVA = 1.6L/hr at full load
  5: 2.0,    // 5kVA = 2.0L/hr at full load
  6: 2.4,    // 6kVA = 2.4L/hr at full load
  7: 2.8,    // 7kVA = 2.8L/hr at full load
  8: 3.2,    // 8kVA = 3.2L/hr at full load
  9: 3.6,    // 9kVA = 3.6L/hr at full load
  10: 4.0    // 10kVA = 4.0L/hr at full load
};

// Update solar packages
const SOLAR_PACKAGES = {
  'SMALL': {
    capacity: 3,
    cost: 2_000_000, // ₦2M
    description: 'Suitable for 3-4 KVA generators'
  },
  'MEDIUM': {
    capacity: 5,
    cost: 2_750_000, // ₦2.75M
    description: 'Suitable for 5-7 KVA generators'
  },
  'LARGE': {
    capacity: 10,
    cost: 5_700_000, // ₦5.7M
    description: 'Suitable for 8-10 KVA generators'
  }
};

// Function to get nearest KVA fuel consumption
const getNearestFuelConsumption = (kva: number): number => {
  const sizes = Object.keys(GENERATOR_FUEL_CONSUMPTION).map(Number);
  const nearest = sizes.reduce((prev, curr) => {
    return Math.abs(curr - kva) < Math.abs(prev - kva) ? curr : prev;
  });
  return GENERATOR_FUEL_CONSUMPTION[nearest];
};

export default function SummaryModal({ isOpen, onClose, data, tariffs }: SummaryModalProps) {
  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Update the calculations
  const calculateAnnualCosts = () => {
    const avgPHCNHours = (data.phcnHoursMin + data.phcnHoursMax) / 2;
    const genHours = 24 - avgPHCNHours;
    
    // PHCN Details
    const dailyPHCNKwh = data.avgDailyConsumption * (avgPHCNHours / 24);
    const phcnYearly = dailyPHCNKwh * (data.powerBand ? tariffs[data.powerBand].tariff : 0) * 365;
    
    // Generator Details
    const powerFactor = 0.8;
    const genKW = data.generatorKVA * powerFactor;
    const dailyGenKwh = genKW * genHours;
    const litresPerHour = GENERATOR_FUEL_CONSUMPTION[data.generatorKVA] || 0;
    const dailyDieselCost = genHours * litresPerHour * data.dieselPricePerLiter;
    const yearlyDieselCost = dailyDieselCost * 365;
    const genYearly = yearlyDieselCost + data.maintenanceCostYearly;
    
    // Solar Details
    let solarPackage = 'MEDIUM';
    if (data.generatorKVA <= 4) {
      solarPackage = 'SMALL';
    } else if (data.generatorKVA > 7) {
      solarPackage = 'LARGE';
    }

    const systemCost = SOLAR_PACKAGES[solarPackage].cost;
    const yearlyMaintenance = systemCost * 0.01;
    const batteryReplacementYearly = (systemCost * 0.3) / 7;
    const solarYearly = yearlyMaintenance + batteryReplacementYearly;

    // Calculate savings and payback
    const totalCurrentCost = phcnYearly + genYearly;
    const annualSavings = totalCurrentCost - solarYearly;
    const paybackPeriod = systemCost / annualSavings;

    return {
      phcnYearly,
      genYearly,
      solarYearly,
      systemCost,
      dailyDieselLitres: litresPerHour * genHours,
      yearlyDieselCost,
      yearlyMaintenance,
      batteryReplacementYearly,
      paybackPeriod,
      annualSavings,
      totalCurrentCost,
      phcnDailyKwh: dailyPHCNKwh,
      genDailyKwh: dailyGenKwh
    };
  };

  const costs = calculateAnnualCosts();
  const totalLifetimeSavings = (costs.annualSavings * 25) - costs.systemCost;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Cost Comparison Summary
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Current Setup Costs */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Current Annual Costs</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>PHCN:</span>
                  <span className="font-medium">{formatCurrency(costs.phcnYearly)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Generator:</span>
                  <span className="font-medium">{formatCurrency(costs.genYearly)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total Current Cost:</span>
                  <span>{formatCurrency(costs.totalCurrentCost)}</span>
                </div>
              </div>
            </div>

            {/* Solar Solution */}
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Solar Solution</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Initial Investment:</span>
                  <span className="font-medium">{formatCurrency(costs.systemCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Annual Operating Cost:</span>
                  <span className="font-medium">{formatCurrency(costs.solarYearly)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-green-600 dark:text-green-400 pt-2 border-t">
                  <span>Annual Savings:</span>
                  <span>{formatCurrency(costs.annualSavings)}</span>
                </div>
              </div>
            </div>

            {/* ROI Analysis */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Return on Investment</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Payback Period:</span>
                  <span className="font-medium">{costs.paybackPeriod.toFixed(1)} years</span>
                </div>
                <div className="flex justify-between">
                  <span>System Lifespan:</span>
                  <span className="font-medium">25 years</span>
                </div>
                <div className="mt-2 text-sm text-blue-600 dark:text-blue-300">
                  Total savings over system lifespan:{' '}
                  <span className="font-bold">
                    {formatCurrency(totalLifetimeSavings)}
                  </span>
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Cost Breakdown</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Current Setup Expenses:</h4>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• Daily Diesel Usage: {costs.dailyDieselLitres.toFixed(1)} litres</li>
                    <li>• Yearly Diesel Cost: {formatCurrency(costs.yearlyDieselCost)}</li>
                    <li>• Generator Maintenance: {formatCurrency(data.maintenanceCostYearly)}</li>
                    <li>• PHCN Bills: {formatCurrency(costs.phcnYearly)}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium">Solar Setup Expenses:</h4>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• Yearly Maintenance: {formatCurrency(costs.yearlyMaintenance)}</li>
                    <li>• Battery Replacement Fund: {formatCurrency(costs.batteryReplacementYearly)}</li>
                    <li>• No fuel costs</li>
                    <li>• No PHCN bills</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Close Summary
          </button>
        </div>
      </div>
    </div>
  );
} 
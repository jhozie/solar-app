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

type SolarPackageType = 'SMALL' | 'MEDIUM' | 'LARGE';

const SOLAR_PACKAGES = {
  'SMALL': {
    capacity: 3,
    cost: 2_000_000,
    description: 'Suitable for 3-4 KVA generators'
  },
  'MEDIUM': {
    capacity: 5,
    cost: 2_750_000,
    description: 'Suitable for 5-7 KVA generators'
  },
  'LARGE': {
    capacity: 10,
    cost: 5_700_000,
    description: 'Suitable for 8-10 KVA generators'
  }
} as const;

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

  const calculateCosts = () => {
    // PHCN Costs
    const bandInfo = data.powerBand ? tariffs[data.powerBand] : null;
    const phcnYearly = bandInfo ? (bandInfo.avgKwhPerDay * bandInfo.tariff * 365) : 0;

    // Generator Costs
    const avgGeneratorHours = data.generatorHours.reduce((sum, h) => sum + h, 0) / 7;
    const litresPerHour = GENERATOR_FUEL_CONSUMPTION[data.generatorKVA] || 0;
    const dailyDieselCost = avgGeneratorHours * litresPerHour * data.dieselPricePerLiter;
    const genYearly = (dailyDieselCost * 365) + data.maintenanceCostYearly;

    // Solar System
    let solarPackage: SolarPackageType = 'MEDIUM';
    if (data.generatorKVA <= 4) {
      solarPackage = 'SMALL';
    } else if (data.generatorKVA >= 8) {
      solarPackage = 'LARGE';
    }

    const systemCost = SOLAR_PACKAGES[solarPackage].cost;
    const paybackPeriod = systemCost / genYearly;

    return {
      phcnYearly,
      genYearly,
      systemCost,
      solarPackage,
      paybackPeriod,
      totalCurrentCost: phcnYearly + genYearly,
      annualSavings: genYearly  // Only generator costs are saved
    };
  };

  const costs = calculateCosts();
  const totalLifetimeSavings = (costs.genYearly * 25) - costs.systemCost;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Solar Investment Summary
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Current Costs */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Current Generator Costs</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Annual Generator Cost:</span>
                  <span className="font-medium">{formatCurrency(costs.genYearly)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Annual Solar Cost:</span>
                  <span className="font-medium">₦0</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-green-600 pt-2 border-t">
                  <span>Annual Savings vs Generator:</span>
                  <span>{formatCurrency(costs.genYearly)}</span>
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
                  <span>System Size:</span>
                  <span className="font-medium">{SOLAR_PACKAGES[costs.solarPackage].capacity}kW</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-green-600 pt-2 border-t">
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
                  <span className="font-bold">{formatCurrency(totalLifetimeSavings)}</span>
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
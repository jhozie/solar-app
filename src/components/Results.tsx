import { CalculatorData } from './Calculator';

type ResultsProps = {
  data: CalculatorData;
  tariffs: Record<string, {
    minHours: number;
    maxHours: number;
    tariff: number;
    avgKwhPerDay: number;
  }>;
};

type SolarPackageType = 'SMALL' | 'MEDIUM' | 'LARGE';

// Update the generator fuel consumption lookup table with full load values from the table
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

export default function Results({ data, tariffs }: ResultsProps) {
  // Calculate power distribution hours
  const getPowerDistribution = () => {
    if (!data.powerBand) return { phcn: 0, generator: 0, solar: 0 };
    const avgPHCNHours = (data.phcnHoursMin + data.phcnHoursMax) / 2;
    const avgGeneratorHours = data.generatorHours.reduce((sum, h) => sum + h, 0) / 7;
    // Solar will cover generator hours, but PHCN remains unchanged
    return {
      phcn: avgPHCNHours,
      generator: avgGeneratorHours,
      solar: avgGeneratorHours // Solar replaces generator hours
    };
  };

  // PHCN Cost Calculation
  const calculatePHCNCost = () => {
    if (!data.powerBand) return { daily: 0, monthly: 0, yearly: 0, kwhPerDay: 0 };
    
    const bandInfo = tariffs[data.powerBand];
    const avgPHCNHours = (data.phcnHoursMin + data.phcnHoursMax) / 2;
    
    // Calculate kWh consumption during PHCN hours
    // Use the actual daily consumption rate from the band
    const dailyKwh = bandInfo.avgKwhPerDay;
    const dailyCost = dailyKwh * bandInfo.tariff;

    return {
      daily: dailyCost,
      monthly: dailyCost * 30,
      yearly: dailyCost * 365,
      kwhPerDay: dailyKwh
    };
  };

  // Generator Cost Calculation (current situation without solar)
  const calculateGeneratorCost = () => {
    const avgGeneratorHours = data.generatorHours.reduce((sum, h) => sum + h, 0) / 7;
    const dailyKwh = (data.avgDailyConsumption * avgGeneratorHours) / 24;
    
    const litresPerHour = GENERATOR_FUEL_CONSUMPTION[data.generatorKVA] || 0;
    const dailyDieselCost = avgGeneratorHours * litresPerHour * data.dieselPricePerLiter;
    const dailyMaintenance = data.maintenanceCostYearly / 365;
    
    return {
      daily: dailyDieselCost + dailyMaintenance,
      monthly: (dailyDieselCost + dailyMaintenance) * 30,
      yearly: (dailyDieselCost + dailyMaintenance) * 365,
      kwhPerDay: dailyKwh
    };
  };

  // Solar System Cost Calculation
  const calculateSolarCost = () => {
    // Size solar system based on generator KVA
    let solarPackage: SolarPackageType = 'MEDIUM';
    if (data.generatorKVA <= 4) {
      solarPackage = 'SMALL';
    } else if (data.generatorKVA >= 8) {
      solarPackage = 'LARGE';
    }

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
    };

    const systemCost = SOLAR_PACKAGES[solarPackage].cost;
    const generatorCosts = calculateGeneratorCost();
    const paybackPeriod = systemCost / generatorCosts.yearly;

    return {
      systemCost,
      paybackPeriod,
      package: SOLAR_PACKAGES[solarPackage],
      yearlySavings: generatorCosts.yearly // What you save by not using generator
    };
  };

  const powerHours = getPowerDistribution();
  const phcnCosts = calculatePHCNCost();
  const generatorCosts = calculateGeneratorCost();
  const solarCosts = calculateSolarCost();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
        Cost Comparison Analysis
      </h2>

      {/* Power Distribution Summary */}
      <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Daily Power Distribution
        </h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-blue-600 dark:text-blue-400">PHCN Supply:</span>
              <span className="font-bold">{powerHours.phcn.toFixed(1)} hours/day</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: `${(powerHours.phcn / 24) * 100}%` }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-red-600 dark:text-red-400">Generator Needed:</span>
              <span className="font-bold">{powerHours.generator.toFixed(1)} hours/day</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full" 
                style={{ width: `${(powerHours.generator / 24) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* PHCN Costs */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-400 mb-4">
          PHCN Costs ({powerHours.phcn.toFixed(1)} hours/day)
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-blue-600 dark:text-blue-300">Daily</p>
            <p className="text-xl font-bold">{formatCurrency(phcnCosts.daily)}</p>
            <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
              {(phcnCosts.kwhPerDay ?? 0).toFixed(1)} kWh/day
            </p>
          </div>
          <div>
            <p className="text-sm text-blue-600 dark:text-blue-300">Monthly</p>
            <p className="text-xl font-bold">{formatCurrency(phcnCosts.monthly)}</p>
          </div>
          <div>
            <p className="text-sm text-blue-600 dark:text-blue-300">Yearly</p>
            <p className="text-xl font-bold">{formatCurrency(phcnCosts.yearly)}</p>
          </div>
        </div>
      </div>

      {/* Generator Costs */}
      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-4">
          Generator Costs ({powerHours.generator.toFixed(1)} hours/day)
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-red-600 dark:text-red-300">Daily</p>
            <p className="text-xl font-bold">{formatCurrency(generatorCosts.daily)}</p>
            <p className="text-xs text-red-500 dark:text-red-400 mt-1">
              {generatorCosts.kwhPerDay.toFixed(1)} kWh/day
            </p>
          </div>
          <div>
            <p className="text-sm text-red-600 dark:text-red-300">Monthly</p>
            <p className="text-xl font-bold">{formatCurrency(generatorCosts.monthly)}</p>
          </div>
          <div>
            <p className="text-sm text-red-600 dark:text-red-300">Yearly</p>
            <p className="text-xl font-bold">{formatCurrency(generatorCosts.yearly)}</p>
          </div>
        </div>
        <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-300">
            Diesel Consumption: {GENERATOR_FUEL_CONSUMPTION[data.generatorKVA]?.toFixed(1) || 0} L/hour at full load
          </p>
        </div>
      </div>

      {/* Solar Costs */}
      <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-400 mb-4">
          Solar Solution
        </h3>
        
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
          <p className="text-green-700 dark:text-green-300 text-xl font-bold mb-4">
            Initial Investment: {formatCurrency(solarCosts.systemCost)}
          </p>
          <div className="mt-2 text-sm space-y-2">
            <p className="font-medium">System Details:</p>
            <p>• {solarCosts.package.capacity}kW Solar System</p>
            <p>• {solarCosts.package.description}</p>
            <p>• Zero operating costs</p>
            <p className="text-green-600 font-medium mt-4">
              Annual Savings: {formatCurrency(solarCosts.yearlySavings)}
            </p>
            <p className="font-medium">
              Return on investment in {solarCosts.paybackPeriod.toFixed(1)} years
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Total Annual Savings vs Generator
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-lg">
            <span>Annual Generator Cost:</span>
            <span>{formatCurrency(generatorCosts.yearly)}</span>
          </div>
          <div className="flex justify-between text-lg">
            <span>Annual Solar Cost:</span>
            <span>₦0</span>
          </div>
          <div className="flex justify-between text-2xl font-bold text-green-600 dark:text-green-400 pt-2 border-t">
            <span>Annual Savings:</span>
            <span>{formatCurrency(generatorCosts.yearly)}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 
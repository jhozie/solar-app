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

export default function Results({ data, tariffs }: ResultsProps) {
  // Calculate power distribution hours
  const getPowerDistribution = () => {
    if (!data.powerBand) return { phcn: 0, generator: 0 };
    const avgPHCNHours = (data.phcnHoursMin + data.phcnHoursMax) / 2;
    const genHours = 24 - avgPHCNHours;
    return {
      phcn: avgPHCNHours,
      generator: genHours
    };
  };

  // PHCN Cost Calculation
  const calculatePHCNCost = () => {
    if (!data.powerBand) return { daily: 0, monthly: 0, yearly: 0 };
    
    const bandInfo = tariffs[data.powerBand];
    const avgPHCNHours = (data.phcnHoursMin + data.phcnHoursMax) / 2;
    const dailyPHCNKwh = (data.avgDailyConsumption * avgPHCNHours) / 24;
    const dailyCost = dailyPHCNKwh * bandInfo.tariff;

    return {
      daily: dailyCost,
      monthly: dailyCost * 30,
      yearly: dailyCost * 365,
      kwhPerDay: dailyPHCNKwh
    };
  };

  // Generator Cost Calculation
  const calculateGeneratorCost = () => {
    const avgPHCNHours = (data.phcnHoursMin + data.phcnHoursMax) / 2;
    const genHours = 24 - avgPHCNHours;
    
    // More accurate diesel consumption calculation
    const loadFactor = 0.7; // 70% average load
    const litresPerHour = (data.generatorKVA * loadFactor * 0.21); // 0.21L/kVA is typical for modern generators
    const dailyDieselCost = genHours * litresPerHour * data.dieselPricePerLiter;
    
    const dailyMaintenance = data.maintenanceCostYearly / 365;
    const dailyKwh = (data.avgDailyConsumption * genHours) / 24;
    
    return {
      daily: dailyDieselCost + dailyMaintenance,
      monthly: (dailyDieselCost + dailyMaintenance) * 30,
      yearly: (dailyDieselCost + dailyMaintenance) * 365,
      kwhPerDay: dailyKwh
    };
  };

  // Solar System Cost Calculation
  const calculateSolarCost = () => {
    // Updated solar system costs in Nigeria (2024)
    const requiredKw = data.avgDailyConsumption * 1.3; // 30% overhead for inefficiencies
    const systemCost = requiredKw * 1000 * 400; // ₦400 per watt installed (panels, batteries, inverter)
    const yearlyMaintenance = systemCost * 0.01; // 1% of system cost
    const systemLifespan = 25; // years
    
    // Daily cost including replacement of batteries every 7 years
    const batteryReplacementCost = systemCost * 0.3; // 30% of system cost
    const totalLifetimeCost = systemCost + (yearlyMaintenance * systemLifespan) + 
                             (batteryReplacementCost * Math.floor(systemLifespan / 7));
    
    const dailyCost = totalLifetimeCost / (systemLifespan * 365);
    
    return {
      daily: dailyCost,
      monthly: dailyCost * 30,
      yearly: dailyCost * 365,
      systemCost: systemCost,
      kwhPerDay: data.avgDailyConsumption
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
              {phcnCosts.kwhPerDay.toFixed(1)} kWh/day
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
            Diesel Consumption: {(data.generatorKVA * 0.7 * 0.21).toFixed(1)} L/hour
          </p>
        </div>
      </div>

      {/* Solar Costs */}
      <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-400 mb-4">
          Solar Solution
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-green-600 dark:text-green-300">Daily Cost</p>
            <p className="text-xl font-bold">{formatCurrency(solarCosts.daily)}</p>
          </div>
          <div>
            <p className="text-sm text-green-600 dark:text-green-300">Monthly Cost</p>
            <p className="text-xl font-bold">{formatCurrency(solarCosts.monthly)}</p>
          </div>
          <div>
            <p className="text-sm text-green-600 dark:text-green-300">Yearly Cost</p>
            <p className="text-xl font-bold">{formatCurrency(solarCosts.yearly)}</p>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
          <p className="text-green-700 dark:text-green-300">
            Initial Solar System Cost: {formatCurrency(solarCosts.systemCost)}
          </p>
          <p className="mt-2 text-sm text-green-600 dark:text-green-400">
            • 25-year system lifespan<br />
            • Minimal maintenance costs<br />
            • No fuel costs<br />
            • Environmental benefits<br />
            • Return on investment in ~3-5 years
          </p>
        </div>
      </div>

      <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Total Annual Savings with Solar
        </h3>
        <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
          {formatCurrency((phcnCosts.yearly + generatorCosts.yearly) - solarCosts.yearly)}
        </p>
      </div>
    </div>
  );
} 
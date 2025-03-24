import { CalculatorData } from './Calculator';
import { useEffect } from 'react';

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

export default function Results({ data, tariffs, onStartOver, onMessageReady }: ResultsProps & { 
  onStartOver: () => void;
  onMessageReady?: (message: string) => void;
}) {
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

  // Create WhatsApp message with cost details
  const createWhatsAppMessage = () => {
    const powerHours = getPowerDistribution();
    const phcnCosts = calculatePHCNCost();
    const generatorCosts = calculateGeneratorCost();
    const solarCosts = calculateSolarCost();

    return encodeURIComponent(
      `Hello! I would like to get a quote for a solar system based on my calculator results:\n\n` +
      `My Current Setup:\n` +
      `- PHCN Usage: ${powerHours.phcn.toFixed(1)} hrs/day\n` +
      `- Generator Usage: ${powerHours.generator.toFixed(1)} hrs/day\n` +
      `- Generator Size: ${data.generatorKVA}KVA\n\n` +
      `My Current Monthly Costs:\n` +
      `- PHCN: ${formatCurrency(phcnCosts.monthly)}\n` +
      `- Generator: ${formatCurrency(generatorCosts.monthly)}\n\n` +
      `Recommended System:\n` +
      `- ${solarCosts.package.capacity}kW Solar System\n` +
      `- Estimated Investment: ${formatCurrency(solarCosts.systemCost)}\n` +
      `- Potential Annual Savings: ${formatCurrency(solarCosts.yearlySavings)}\n\n` +
      `Please provide me with a detailed quote for this solar system. Thank you!`
    );
  };

  // Call this when component mounts
  useEffect(() => {
    const message = createWhatsAppMessage();
    onMessageReady?.(message);
  }, []);

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

      {/* Update the WhatsApp button */}
      <div className="grid gap-4 md:grid-cols-2 mt-8">
        <a
          href={`https://wa.me/2348033161606?text=${createWhatsAppMessage()}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Click Here for a Free Quote
        </a>
        <button
          onClick={onStartOver}
          className="px-6 py-3 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Start Over
        </button>
      </div>
    </div>
  );
} 
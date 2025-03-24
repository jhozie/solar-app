'use client';

import { useState, useEffect } from 'react';
import Stepper from './Stepper';
import PowerBandSelector from './PowerBandSelector';
import GeneratorDetails from './GeneratorDetails';
import PHCNDetails from './PHCNDetails';
import Results from './Results';
import { trackStepView } from '../utils/analytics';

// Updated PHCN band information with accurate 2024 tariffs
const BAND_INFO = {
  'A': {
    minHours: 20,
    maxHours: 24,
    tariff: 209.50, // Updated from 225 to 209.50 ₦/kWh
    avgKwhPerDay: 32
  },
  'B': {
    minHours: 16,
    maxHours: 24,
    tariff: 64.07, // MD rate (can also use 61.00 for Non-MD)
    avgKwhPerDay: 24
  },
  'C': {
    minHours: 12,
    maxHours: 24,
    tariff: 52.05, // MD rate (can also use 48.53 for Non-MD)
    avgKwhPerDay: 16
  },
  'D': {
    minHours: 8,
    maxHours: 24,
    tariff: 43.27, // MD rate (can also use 32.48 for Non-MD)
    avgKwhPerDay: 12
  },
  'E': {  // Adding Band E
    minHours: 4,
    maxHours: 24,
    tariff: 43.27, // MD rate (can also use 32.44 for Non-MD)
    avgKwhPerDay: 8
  }
} as const;

export type CalculatorData = {
  powerBand: 'A' | 'B' | 'C' | 'D' | 'E' | null;
  generatorKVA: number;
  phcnHoursMin: number;
  phcnHoursMax: number;
  dieselPricePerLiter: number;
  maintenanceCostYearly: number;
  avgDailyConsumption: number;
  generatorHours: number[];
};

type CalculatorProps = {
  onStepChange?: (currentStep: number, totalSteps: number, message?: string) => void;
};

export default function Calculator({ onStepChange }: CalculatorProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<CalculatorData>({
    powerBand: null,
    generatorKVA: 3,
    phcnHoursMin: 6,
    phcnHoursMax: 10,
    dieselPricePerLiter: 1200,
    maintenanceCostYearly: 100000,
    avgDailyConsumption: 20,
    generatorHours: Array(7).fill(4), // Initialize with 4 hours for each day
  });

  // Update PHCN hours and consumption when band changes
  useEffect(() => {
    if (data.powerBand) {
      const bandInfo = BAND_INFO[data.powerBand];
      setData(prev => ({
        ...prev,
        phcnHoursMin: bandInfo.minHours,
        phcnHoursMax: bandInfo.maxHours,
        avgDailyConsumption: bandInfo.avgKwhPerDay,
      }));
    }
  }, [data.powerBand]);

  // Track step changes
  useEffect(() => {
    trackStepView({
      step: currentStep,
      stepName: steps[currentStep].title,
      powerBand: data.powerBand || undefined,
      generatorKVA: data.generatorKVA,
      completed: currentStep === steps.length - 1
    });
  }, [currentStep, data.powerBand, data.generatorKVA]);

  const updateData = (updates: Partial<CalculatorData>) => {
    setData(prev => {
      const newData = { ...prev, ...updates };
      
      // Remove the auto-correction for generatorKVA
      if ('generatorKVA' in updates) {
        // Only round the number, don't clamp it
        newData.generatorKVA = Number(newData.generatorKVA);
      }
      
      return newData;
    });
  };

  const handleStartOver = () => {
    setCurrentStep(0);
    setData({
      powerBand: null,
      generatorKVA: 3,
      phcnHoursMin: 6,
      phcnHoursMax: 10,
      dieselPricePerLiter: 1200,
      maintenanceCostYearly: 100000,
      avgDailyConsumption: 20,
      generatorHours: Array(7).fill(4),
    });
  };

  const steps = [
    {
      title: 'Power Band',
      description: 'Select your PHCN service band',
      component: (
        <PowerBandSelector 
          selected={data.powerBand} 
          onChange={(band) => updateData({ powerBand: band })} 
          tariffs={BAND_INFO}
        />
      )
    },
    {
      title: 'Generator',
      description: 'Enter generator details',
      component: (
        <GeneratorDetails 
          kva={data.generatorKVA}
          dieselPrice={data.dieselPricePerLiter}
          maintenanceCost={data.maintenanceCostYearly}
          onChange={(updates) => updateData(updates)}
        />
      )
    },
    {
      title: 'Power Usage',
      description: 'Enter PHCN and generator hours',
      component: (
        <PHCNDetails 
          hoursMin={data.phcnHoursMin}
          hoursMax={data.phcnHoursMax}
          generatorHours={data.generatorHours}
          onChange={(updates) => updateData(updates)}
          selectedBand={data.powerBand}
          bandInfo={BAND_INFO}
        />
      )
    },
    {
      title: 'Results',
      description: 'View cost comparison',
      component: (
        <Results 
          data={data} 
          tariffs={BAND_INFO}
          onStartOver={handleStartOver}
        />
      )
    }
  ];

  const canProceedToNext = () => {
    switch (currentStep) {
      case 0:
        return data.powerBand !== null;
      case 1:
        return data.generatorKVA >= 3 && data.generatorKVA <= 10 && data.dieselPricePerLiter > 0;
      case 2: {
        const avgPHCN = (data.phcnHoursMin + data.phcnHoursMax) / 2;
        const avgGenerator = data.generatorHours.reduce((sum, h) => sum + h, 0) / 7;
        return data.phcnHoursMin >= 0 && 
               data.phcnHoursMax <= 24 && 
               data.generatorHours.length === 7 &&
               (avgPHCN + avgGenerator) <= 24;
      }
      default:
        return true;
    }
  };

  const handleStepChange = (newStep: number) => {
    setCurrentStep(newStep);
    // If we're moving to the results step, pass the WhatsApp message
    if (newStep === steps.length - 1) {
      const message = createWhatsAppMessage(); // You'll need to implement this function
      onStepChange?.(newStep, steps.length, message);
    } else {
      onStepChange?.(newStep, steps.length);
    }
  };

  // Add the createWhatsAppMessage function (copy from Results component)
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

  return (
    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-3xl shadow-xl p-6 md:p-8 ring-1 ring-black/5 dark:ring-white/10">
      <div className="max-w-4xl mx-auto">
        <Stepper
          steps={steps}
          currentStep={currentStep}
          onNext={() => handleStepChange(Math.min(currentStep + 1, steps.length - 1))}
          onPrev={() => handleStepChange(Math.max(currentStep - 1, 0))}
          canNext={canProceedToNext()}
          data={data}
          tariffs={BAND_INFO}
        />
      </div>
    </div>
  );
} 
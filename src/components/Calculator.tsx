'use client';

import { useState, useEffect } from 'react';
import Stepper from './Stepper';
import PowerBandSelector from './PowerBandSelector';
import GeneratorDetails from './GeneratorDetails';
import PHCNDetails from './PHCNDetails';
import Results from './Results';

// Updated PHCN band information with accurate tariffs from image
const BAND_INFO = {
  'A': {
    minHours: 20,
    maxHours: 24,
    tariff: 225, // ₦225/kWh for all categories (NMD, MD1, MD2)
    avgKwhPerDay: 32
  },
  'B': {
    minHours: 16,
    maxHours: 24,
    tariff: 64.07, // ₦64.07/kWh for MD1 and MD2, ₦61 for NMD
    avgKwhPerDay: 24
  },
  'C': {
    minHours: 12,
    maxHours: 24,
    tariff: 52.05, // ₦52.05/kWh for MD1 and MD2, ₦48.53 for NMD
    avgKwhPerDay: 16
  },
  'D': {
    minHours: 8,
    maxHours: 24,
    tariff: 43.27, // ₦43.27/kWh for MD1 and MD2, ₦32.48 for NMD
    avgKwhPerDay: 12
  }
} as const;

export type CalculatorData = {
  powerBand: 'A' | 'B' | 'C' | 'D' | null;
  generatorKVA: number;
  phcnHoursMin: number;
  phcnHoursMax: number;
  dieselPricePerLiter: number;
  maintenanceCostYearly: number;
  avgDailyConsumption: number;
};

export default function Calculator() {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<CalculatorData>({
    powerBand: null,
    generatorKVA: 3,
    phcnHoursMin: 6,
    phcnHoursMax: 10,
    dieselPricePerLiter: 1200,
    maintenanceCostYearly: 100000,
    avgDailyConsumption: 20,
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
      title: 'PHCN Usage',
      description: 'Enter power supply hours',
      component: (
        <PHCNDetails 
          hoursMin={data.phcnHoursMin}
          hoursMax={data.phcnHoursMax}
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
        <Results data={data} tariffs={BAND_INFO} />
      )
    }
  ];

  const canProceedToNext = () => {
    switch (currentStep) {
      case 0:
        return data.powerBand !== null;
      case 1:
        return data.generatorKVA >= 3 && data.generatorKVA <= 10 && data.dieselPricePerLiter > 0;
      case 2:
        return data.phcnHoursMin >= 0 && data.phcnHoursMax <= 24;
      default:
        return true;
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <Stepper
        steps={steps}
        currentStep={currentStep}
        onNext={() => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))}
        onPrev={() => setCurrentStep(prev => Math.max(prev - 1, 0))}
        canNext={canProceedToNext()}
        data={data}
        tariffs={BAND_INFO}
      />
    </div>
  );
} 
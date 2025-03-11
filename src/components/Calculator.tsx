'use client';

import { useState, useEffect } from 'react';
import Stepper from './Stepper';
import PowerBandSelector from './PowerBandSelector';
import GeneratorDetails from './GeneratorDetails';
import PHCNDetails from './PHCNDetails';
import Results from './Results';

// Updated PHCN band information with accurate 2024 Nigerian tariffs
const BAND_INFO = {
  'A': {
    minHours: 20,
    maxHours: 24,
    tariff: 225, // ₦/kWh - Premium service areas
    avgKwhPerDay: 32, // Average daily consumption for premium areas
  },
  'B': {
    minHours: 16,
    maxHours: 20,
    tariff: 210, // ₦/kWh - High-density commercial/residential areas
    avgKwhPerDay: 24, // Average daily consumption
  },
  'C': {
    minHours: 12,
    maxHours: 16,
    tariff: 200, // ₦/kWh - Medium-density residential areas
    avgKwhPerDay: 16, // Average daily consumption
  },
  'D': {
    minHours: 8,
    maxHours: 12,
    tariff: 188, // ₦/kWh - Low-density/rural areas
    avgKwhPerDay: 12, // Average daily consumption
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
    generatorKVA: 5,
    phcnHoursMin: 6,
    phcnHoursMax: 10,
    dieselPricePerLiter: 1200, // Current diesel price 2024
    maintenanceCostYearly: 100000,
    avgDailyConsumption: 20, // Default average daily consumption in kWh
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
    setData(prev => ({ ...prev, ...updates }));
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
        return data.generatorKVA > 0 && data.dieselPricePerLiter > 0;
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
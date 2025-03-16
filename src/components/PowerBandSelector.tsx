type PowerBandSelectorProps = {
  selected: 'A' | 'B' | 'C' | 'D' | 'E' | null;
  onChange: (band: 'A' | 'B' | 'C' | 'D' | 'E' | null) => void;
  tariffs: Record<string, { minHours: number; maxHours: number; tariff: number }>;
};

const BAND_DESCRIPTIONS = {
  'A': {
    hours: '20-24',
    description: 'Premium service with minimum of 20 hours daily power supply',
    examples: 'Areas with good infrastructure and industrial zones'
  },
  'B': {
    hours: '16-20',
    description: 'Very good service with 16-20 hours daily power supply',
    examples: 'Urban areas with stable infrastructure'
  },
  'C': {
    hours: '12-16',
    description: 'Medium service level with 12-16 hours daily power supply',
    examples: 'Semi-urban areas and residential zones'
  },
  'D': {
    hours: '8-12',
    description: 'Basic service with 8-12 hours daily power supply',
    examples: 'Rural areas and developing regions'
  },
  'E': {
    hours: '4-8',
    description: 'Basic service with 4-8 hours daily power supply',
    examples: 'Remote areas and developing regions'
  }
};

export default function PowerBandSelector({ selected, onChange, tariffs }: PowerBandSelectorProps) {
  const bands = ['A', 'B', 'C', 'D'] as const;
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Select Your PHCN Power Band
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Choose your electricity service band based on your location and average daily power supply
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {bands.map((band) => (
          <button
            key={band}
            onClick={() => onChange(band)}
            className={`
              p-4 rounded-xl transition-all duration-200 text-left
              ${selected === band 
                ? 'bg-green-600 text-white ring-2 ring-green-600 ring-offset-2' 
                : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700'}
            `}
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Band {band}</span>
                <span className={`text-sm ${selected === band ? 'text-green-100' : 'text-green-600 dark:text-green-400'}`}>
                  ₦{tariffs[band].tariff}/kWh
                </span>
              </div>
              
              <div className={`text-sm ${selected === band ? 'text-green-100' : 'text-gray-600 dark:text-gray-300'}`}>
                <p className="font-medium">{tariffs[band].minHours}-{tariffs[band].maxHours} hours/day</p>
                <p className="mt-1 text-xs">{BAND_DESCRIPTIONS[band].description}</p>
                <p className="mt-1 text-xs italic">Example: {BAND_DESCRIPTIONS[band].examples}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            You selected <span className="font-medium">Band {selected}</span> with tariff rate of{' '}
            <span className="font-medium">₦{tariffs[selected].tariff}/kWh</span>. This band typically provides{' '}
            {tariffs[selected].minHours}-{tariffs[selected].maxHours} hours of power supply daily.
          </p>
        </div>
      )}
    </div>
  );
} 
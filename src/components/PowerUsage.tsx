export default function PowerUsage({ data, onChange }: PowerUsageProps) {
  return (
    <div className="space-y-4">
      {/* PHCN Hours Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">
          PHCN Hours Range
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400">
              Min: {data.phcnHoursMin} hrs
            </label>
            <input
              type="range"
              min="0"
              max="24"
              value={data.phcnHoursMin}
              onChange={(e) => onChange({ ...data, phcnHoursMin: Number(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400">
              Max: {data.phcnHoursMax} hrs
            </label>
            <input
              type="range"
              min="0"
              max="24"
              value={data.phcnHoursMax}
              onChange={(e) => onChange({ ...data, phcnHoursMax: Number(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>
        </div>
      </div>

      {/* Generator Hours Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">
          Daily Generator Usage
        </h3>
        <div className="max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-1 gap-3">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <div key={day} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                <span className="w-8 text-sm font-medium text-gray-600 dark:text-gray-400">{day}</span>
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max="24"
                    value={data.generatorHours[index]}
                    onChange={(e) => {
                      const newHours = [...data.generatorHours];
                      newHours[index] = Number(e.target.value);
                      onChange({ ...data, generatorHours: newHours });
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                </div>
                <span className="w-12 text-right text-sm text-gray-600 dark:text-gray-400">
                  {data.generatorHours[index]}h
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 
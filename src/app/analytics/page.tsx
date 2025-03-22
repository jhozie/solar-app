'use client';

import { useEffect, useState } from 'react';
import { Suspense } from 'react';

function AnalyticsDashboard() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/analytics', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }

      const results = await response.json();
      setData(results);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setError('Failed to load analytics data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClearData = async () => {
    if (!window.confirm('Are you sure you want to clear all analytics data? This cannot be undone.')) {
      return;
    }

    setClearing(true);
    setError(null);
    try {
      const response = await fetch('/api/analytics/clear', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear data');
      }
      
      await fetchData();
    } catch (error) {
      console.error('Failed to clear analytics:', error);
      setError('Failed to clear analytics data');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Calculator Analytics Dashboard</h1>
        <button
          onClick={handleClearData}
          disabled={clearing || loading}
          className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors
            ${(clearing || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {clearing ? 'Clearing...' : 'Clear All Data'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-12">Loading analytics...</div>
      ) : data.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No analytics data available</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {data.map((step) => (
            <div key={step.step_number} className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">
                Step {step.step_number + 1}: {step.step_name}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600">Unique Visitors</p>
                  <p className="text-2xl font-bold">{step.unique_visitors}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600">Total Views</p>
                  <p className="text-2xl font-bold">{step.total_views}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-600">Completions</p>
                  <p className="text-2xl font-bold">{step.completions}</p>
                </div>
                {step.power_band_selections > 0 && (
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-600">Power Band Selections</p>
                    <p className="text-2xl font-bold">{step.power_band_selections}</p>
                  </div>
                )}
                {step.generator_selections > 0 && (
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-600">Generator Selections</p>
                    <p className="text-2xl font-bold">{step.generator_selections}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
      <AnalyticsDashboard />
    </Suspense>
  );
} 
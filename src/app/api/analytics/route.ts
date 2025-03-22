import { NextResponse } from 'next/server';
import { analyticsStore } from '@/lib/analytics-store';

export async function GET() {
  try {
    const data = analyticsStore.getData();
    
    // Process analytics data to calculate metrics per step
    const processedData = data.reduce((acc: any[], entry) => {
      const existingStep = acc.find(s => s.step_number === entry.step);
      
      if (existingStep) {
        // Update existing step
        existingStep.total_views++;
        if (!existingStep.sessions.includes(entry.sessionId)) {
          existingStep.unique_visitors++;
          existingStep.sessions.push(entry.sessionId);
        }
        if (entry.completed) existingStep.completions++;
        if (entry.powerBand) existingStep.power_band_selections++;
        if (entry.generatorKVA) existingStep.generator_selections++;
      } else {
        // Add new step
        acc.push({
          step_number: entry.step,
          step_name: entry.stepName,
          total_views: 1,
          unique_visitors: 1,
          completions: entry.completed ? 1 : 0,
          power_band_selections: entry.powerBand ? 1 : 0,
          generator_selections: entry.generatorKVA ? 1 : 0,
          sessions: [entry.sessionId]
        });
      }
      return acc;
    }, []);

    // Remove sessions array from response
    const cleanedData = processedData.map(({ sessions, ...rest }) => rest);

    // Sort by step number
    cleanedData.sort((a, b) => a.step_number - b.step_number);

    return NextResponse.json(cleanedData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' }, 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    analyticsStore.addEntry(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save analytics' }, { status: 500 });
  }
} 
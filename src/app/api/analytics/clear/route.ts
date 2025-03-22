import { NextResponse } from 'next/server';
import { analyticsStore } from '@/lib/analytics-store';

export async function POST() {
  try {
    analyticsStore.clear();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to clear analytics:', error);
    return NextResponse.json({ error: 'Failed to clear analytics' }, { status: 500 });
  }
} 
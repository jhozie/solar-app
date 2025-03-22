import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    await sql`
      INSERT INTO step_analytics (
        session_id,
        step_number,
        step_name,
        power_band,
        generator_kva,
        completed,
        timestamp
      ) VALUES (
        ${body.sessionId},
        ${body.step},
        ${body.stepName},
        ${body.powerBand || null},
        ${body.generatorKVA || null},
        ${body.completed},
        ${body.timestamp}
      )
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to track step:', error);
    return NextResponse.json({ success: false, error: 'Failed to track step' }, { status: 500 });
  }
} 
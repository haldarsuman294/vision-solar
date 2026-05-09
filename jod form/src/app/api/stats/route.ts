import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const STATS_PATH = path.join(process.cwd(), 'data', 'stats.json');

export async function GET() {
  try {
    const data = await fs.readFile(STATS_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    // Default fallback
    return NextResponse.json({
      totalForms: 24,
      signaturesCollected: 1492,
      submissionRate: 68.5
    });
  }
}

export async function POST(request: Request) {
  try {
    const newStats = await request.json();
    await fs.writeFile(STATS_PATH, JSON.stringify(newStats, null, 2));
    return NextResponse.json(newStats);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update stats' }, { status: 500 });
  }
}

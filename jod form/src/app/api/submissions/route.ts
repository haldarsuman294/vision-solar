import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'submissions.json');

export async function GET() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const submission = await request.json();
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const submissions = JSON.parse(data);
    
    const newSubmission = {
      ...submission,
      id: 'sub-' + Date.now(),
      submittedAt: new Date().toISOString()
    };
    
    submissions.unshift(newSubmission);
    await fs.writeFile(DB_PATH, JSON.stringify(submissions, null, 2));
    
    return NextResponse.json(newSubmission);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 });
  }
}

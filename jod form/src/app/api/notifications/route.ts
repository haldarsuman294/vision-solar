import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'notifications.json');

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
    const { id } = await request.json();
    const data = await fs.readFile(DB_PATH, 'utf-8');
    let notifications = JSON.parse(data);
    
    notifications = notifications.map((n: any) => 
      n.id === id ? { ...n, unread: false } : n
    );
    
    await fs.writeFile(DB_PATH, JSON.stringify(notifications, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

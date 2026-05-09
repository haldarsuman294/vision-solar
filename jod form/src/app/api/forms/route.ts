import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'forms.json');

async function ensureDb() {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, '[]');
  }
}

export async function GET() {
  try {
    await ensureDb();
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read database' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDb();
    const newForm = await request.json();
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const forms = JSON.parse(data);
    
    const existingIndex = forms.findIndex((f: any) => f.id === newForm.id);
    let updatedForms;
    if (existingIndex >= 0) {
      updatedForms = [...forms];
      updatedForms[existingIndex] = newForm;
    } else {
      updatedForms = [newForm, ...forms];
    }
    
    await fs.writeFile(DB_PATH, JSON.stringify(updatedForms, null, 2));
    
    return NextResponse.json(newForm);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update database' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await ensureDb();
    const data = await fs.readFile(DB_PATH, 'utf-8');
    let forms = JSON.parse(data);
    
    forms = forms.filter((f: any) => f.id !== id);
    await fs.writeFile(DB_PATH, JSON.stringify(forms, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete from database' }, { status: 500 });
  }
}

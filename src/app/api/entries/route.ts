import { NextRequest, NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';
import { Entry } from '@/types';

export async function GET() {
  try {
    const storage = await getStorage();
    const entries = await storage.findAll();
    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const entryData: Omit<Entry, '_id'> = await request.json();
    
    const storage = await getStorage();
    const newEntry = await storage.insertOne({
      ...entryData,
      date: new Date(entryData.date),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error('Error creating entry:', error);
    return NextResponse.json(
      { error: 'Failed to create entry' },
      { status: 500 }
    );
  }
}

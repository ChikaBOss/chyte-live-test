import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDB } from '@/lib/mongodb';

type AdminSettings = {
  _id: string;
  updatedAt?: Date;
  [key: string]: any;
};

export async function GET() {
  try {
    await connectToDB();

    const db = mongoose.connection.db;
    if (!db) throw new Error('Database not initialized');

    const settings = await db
      .collection<AdminSettings>('adminSettings')
      .findOne({ _id: 'global' });

    return NextResponse.json(settings || {});
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const updates = await request.json();

    await connectToDB();

    const db = mongoose.connection.db;
    if (!db) throw new Error('Database not initialized');

    await db.collection<AdminSettings>('adminSettings').updateOne(
      { _id: 'global' },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating admin settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
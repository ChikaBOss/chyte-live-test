import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { connectToDB } from '@/lib/mongodb';
import { authOptions } from '@/lib/auth-config';

type AdminSettings = {
  _id: string;          // 👈 STRING ID
  updatedAt?: Date;
  updatedBy?: string;
  [key: string]: any;
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
          updatedBy: session.user.email,
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
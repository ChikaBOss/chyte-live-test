import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { connectToDB } from '@/lib/mongodb';
import Rider from '@/models/Rider';

export async function POST(req: Request) {
  try {
    await connectToDB();
    const { name, email, password, phone, address } = await req.json();

    const existing = await Rider.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const rider = await Rider.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      approved: false,
      status: 'pending',
    });

    return NextResponse.json({ success: true, riderId: rider._id });
  } catch (error) {
    console.error('Rider registration error:', error);
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
  }
}
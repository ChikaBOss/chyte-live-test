// app/api/admin/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectToDB } from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectToDB();

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const skip = (page - 1) * limit;
  const status = searchParams.get('status');
  const vendorSearch = searchParams.get('vendor');

  const filter: any = {};
  if (status) filter.status = status;
  if (vendorSearch) {
    filter.vendorName = { $regex: vendorSearch, $options: 'i' };
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);

  return NextResponse.json({
    orders,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}
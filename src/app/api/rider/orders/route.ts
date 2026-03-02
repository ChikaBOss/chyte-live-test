// app/api/rider/orders/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectToDB } from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'rider') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // 'active' or 'completed'

    let query: any = { selectedCompanyId: session.user.id };

    if (status === 'active') {
      query.status = { $in: ['PENDING', 'PROCESSING', 'OUT_FOR_DELIVERY'] };
    } else if (status === 'completed') {
      query.status = 'COMPLETED';
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching rider orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
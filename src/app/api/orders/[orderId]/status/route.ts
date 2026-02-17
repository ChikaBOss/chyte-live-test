import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { connectToDB } from '@/lib/mongodb';
import Order from '@/models/orderModel';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // ✅ Extract orderId safely (Next.js 15)
    const orderId = request.nextUrl.pathname.split('/').pop();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing orderId' },
        { status: 400 }
      );
    }

    const { status } = await request.json();

    await connectToDB();

    // Update order if it belongs to this chef
    const order = await Order.findOneAndUpdate(
      {
        _id: orderId,
        chefId: session.user.id,
        status: { $nin: ['completed', 'cancelled'] }
      },
      {
        status,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found or cannot be updated' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      _id: order._id.toString(),
      status: order.status,
      message: 'Order status updated'
    });
  } catch (error) {
    console.error('Status update error:', error);
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    );
  }
}
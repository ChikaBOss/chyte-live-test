import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import Wallet from '@/models/Wallet';
import Transaction from '@/models/Transaction';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectToDB();
    
    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get('range') || '30d';
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate = new Date(0);
    }
    
    // Get rider wallet
    const wallet = await Wallet.findOne({ 
      userId: session.user.id, 
      role: 'rider' 
    });
    
    // Get completed delivery orders
    const orders = await Order.find({
      riderId: session.user.id,
      status: { $in: ['COMPLETED', 'DELIVERED'] },
      'payment.status': 'PAID',
      createdAt: { $gte: startDate }
    })
    .sort({ createdAt: -1 })
    .select('orderNumber totalAmount createdAt customer deliveryFee distribution');
    
    // Calculate stats
    const totalEarnings = orders.reduce((sum, order) => 
      sum + (order.distribution?.riderAmount || 0), 0
    );
    
    return NextResponse.json({
      success: true,
      wallet: {
        balance: wallet?.balance || 0,
        pending: wallet?.pendingBalance || 0,
        totalEarned: wallet?.totalEarned || 0
      },
      orders,
      stats: {
        today: await calculateTodayEarnings(session.user.id),
        week: await calculateWeekEarnings(session.user.id),
        month: await calculateMonthEarnings(session.user.id),
        total: totalEarnings,
        deliveries: orders.length
      },
      recentTransactions: await Transaction.find({
        userId: session.user.id,
        role: 'rider',
        source: 'ORDER_PAYMENT'
      })
      .sort({ createdAt: -1 })
      .limit(5)
    });
    
  } catch (error: any) {
    console.error('Rider earnings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch earnings', details: error.message },
      { status: 500 }
    );
  }
}

async function calculateTodayEarnings(riderId: string) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const orders = await Order.find({
    riderId,
    status: { $in: ['COMPLETED', 'DELIVERED'] },
    'payment.status': 'PAID',
    createdAt: { $gte: startOfDay }
  });
  
  return orders.reduce((sum, order) => 
    sum + (order.distribution?.riderAmount || 0), 0
  );
}

async function calculateWeekEarnings(riderId: string) {
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - 7);
  
  const orders = await Order.find({
    riderId,
    status: { $in: ['COMPLETED', 'DELIVERED'] },
    'payment.status': 'PAID',
    createdAt: { $gte: startOfWeek }
  });
  
  return orders.reduce((sum, order) => 
    sum + (order.distribution?.riderAmount || 0), 0
  );
}

async function calculateMonthEarnings(riderId: string) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const orders = await Order.find({
    riderId,
    status: { $in: ['COMPLETED', 'DELIVERED'] },
    'payment.status': 'PAID',
    createdAt: { $gte: startOfMonth }
  });
  
  return orders.reduce((sum, order) => 
    sum + (order.distribution?.riderAmount || 0), 0
  );
}
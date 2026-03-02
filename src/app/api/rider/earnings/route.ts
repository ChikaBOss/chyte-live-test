import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectToDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import Wallet from '@/models/Wallet';
import Transaction from '@/models/Transaction';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'rider') {
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
    
    // Get completed delivery orders (using selectedCompanyId)
    const orders = await Order.find({
      selectedCompanyId: session.user.id,
      status: 'COMPLETED',
      'payment.status': 'PAID',
      createdAt: { $gte: startDate }
    })
    .sort({ createdAt: -1 })
    .select('orderNumber totalAmount createdAt customer deliveryFee distribution');
    
    // Calculate stats
    const totalEarnings = orders.reduce((sum, order) => 
      sum + (order.distribution?.riderAmount || 0), 0
    );
    
    // Helper functions for period earnings
    const getEarningsForPeriod = async (days: number) => {
      const periodStart = new Date();
      periodStart.setDate(periodStart.getDate() - days);
      const periodOrders = await Order.find({
        selectedCompanyId: session.user.id,
        status: 'COMPLETED',
        'payment.status': 'PAID',
        createdAt: { $gte: periodStart }
      });
      return periodOrders.reduce((sum, o) => sum + (o.distribution?.riderAmount || 0), 0);
    };
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayOrders = await Order.find({
      selectedCompanyId: session.user.id,
      status: 'COMPLETED',
      'payment.status': 'PAID',
      createdAt: { $gte: todayStart }
    });
    const todayEarnings = todayOrders.reduce((sum, o) => sum + (o.distribution?.riderAmount || 0), 0);
    
    return NextResponse.json({
      success: true,
      wallet: {
        balance: wallet?.balance || 0,
        pending: wallet?.pendingBalance || 0,
        totalEarned: wallet?.totalEarned || 0
      },
      orders,
      stats: {
        today: todayEarnings,
        week: await getEarningsForPeriod(7),
        month: await getEarningsForPeriod(30),
        total: totalEarnings,
        deliveries: orders.length
      },
      recentTransactions: await Transaction.find({
        userId: session.user.id,
        role: 'rider',
        source: { $in: ['DELIVERY_FEE', 'ORDER_PAYMENT'] }
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
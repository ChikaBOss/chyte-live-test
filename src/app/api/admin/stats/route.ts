import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectToDB } from '@/lib/mongodb';
import Chef from '@/models/Chef';
import Vendor from '@/models/Vendor';
import Pharmacy from '@/models/Pharmacy';
import TopVendor from '@/models/TopVendor';
import Rider from '@/models/Rider'; // ✅ ADD RIDER
import Withdrawal from '@/models/Withdrawal';
import Order from '@/models/Order';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();

    // Fetch counts and data in parallel (include riders)
    const [
      chefs,
      vendors,
      pharmacies,
      topVendors,
      riders,          // ✅ ADD RIDERS
      withdrawals,
      orders,
    ] = await Promise.all([
      Chef.find().lean(),
      Vendor.find().lean(),
      Pharmacy.find().lean(),
      TopVendor.find().lean(),
      Rider.find().lean(),   // ✅ FETCH RIDERS
      Withdrawal.find({ status: 'PENDING' }).sort({ createdAt: -1 }).limit(5).lean(),
      Order.find({ status: { $in: ['paid', 'delivered'] } })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    // Pending applications from all roles (including riders)
    const pendingApps = [
      ...chefs.filter(c => !c.approved).map(c => ({ role: 'chef', ...c })),
      ...vendors.filter(v => !v.approved).map(v => ({ role: 'vendor', ...v })),
      ...pharmacies.filter(p => !p.approved).map(p => ({ role: 'pharmacy', ...p })),
      ...topVendors.filter(tv => !tv.approved).map(tv => ({ role: 'topvendor', ...tv })),
      ...riders.filter(r => !r.approved).map(r => ({ role: 'rider', ...r })), // ✅ ADD RIDER PENDING
    ].slice(0, 5); // latest 5 pending

    // Total revenue (sum of admin commission from paid orders)
    const totalRevenue = orders.reduce((sum, o) => sum + (o.adminFee || 0), 0);

    // Revenue by day for last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const dayOrders = orders.filter(o => {
        const createdAt = new Date(o.createdAt);
        return createdAt >= date && createdAt < nextDay;
      });
      const amount = dayOrders.reduce((sum, o) => sum + (o.adminFee || 0), 0);
      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        amount,
      };
    }).reverse();

    // Stats object with riders included
    const stats = {
      totalUsers: {
        chefs: chefs.length,
        vendors: vendors.length,
        pharmacies: pharmacies.length,
        topVendors: topVendors.length,
        riders: riders.length, // ✅ ADD RIDERS
      },
      approvedUsers: {
        chefs: chefs.filter(c => c.approved).length,
        vendors: vendors.filter(v => v.approved).length,
        pharmacies: pharmacies.filter(p => p.approved).length,
        topVendors: topVendors.filter(tv => tv.approved).length,
        riders: riders.filter(r => r.approved).length, // ✅ ADD RIDERS
      },
      pendingApprovals: {
        chefs: chefs.filter(c => !c.approved).length,
        vendors: vendors.filter(v => !v.approved).length,
        pharmacies: pharmacies.filter(p => !p.approved).length,
        topVendors: topVendors.filter(tv => !tv.approved).length,
        riders: riders.filter(r => !r.approved).length, // ✅ ADD RIDERS
        total: pendingApps.length,
        recent: pendingApps,
      },
      revenue: {
        total: totalRevenue,
        last7Days,
      },
      payouts: {
        pendingCount: withdrawals.length,
        pendingTotal: withdrawals.reduce((sum, w) => sum + w.amount, 0),
        recent: withdrawals,
      },
      recentOrders: orders.slice(0, 5).map(o => ({
        id: o._id,
        orderNumber: o.orderNumber,
        total: o.total,
        commission: o.adminFee,
        createdAt: o.createdAt,
        customerName: o.customer?.name,
      })),
    };

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
  }
}
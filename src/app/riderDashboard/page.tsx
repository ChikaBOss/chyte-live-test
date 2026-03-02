'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { DeliveryCard } from '@/components/RiderDashboard/DeliveryCard';

type Delivery = {
  id: string;
  customer: string;
  phone: string;
  pickup: string;
  dropoff: string;
  price: number;
  status: 'pending' | 'ongoing' | 'completed' | 'cancelled';
  items: { name: string; quantity: number }[];
};

type Stats = {
  todayEarnings: number;
  completedToday: number;
  activeDeliveries: number;
  totalEarnings: number;
};

export default function RiderDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [stats, setStats] = useState<Stats>({
    todayEarnings: 0,
    completedToday: 0,
    activeDeliveries: 0,
    totalEarnings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'rider') {
      router.replace('/rider/login');
      return;
    }
    fetchDashboardData();
  }, [session, status, router]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, deliveriesRes] = await Promise.all([
        fetch('/api/rider/stats'),
        fetch('/api/rider/deliveries?status=active'),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      if (deliveriesRes.ok) {
        const deliveriesData = await deliveriesRes.json();
        setDeliveries(deliveriesData);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (deliveryId: string, newStatus: string) => {
    // Optimistic update, then optionally refetch
    setDeliveries(prev =>
      prev.map(d => (d.id === deliveryId ? { ...d, status: newStatus as any } : d))
    );
    // You could also send API request here to update status
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold text-dark mb-2">Rider Dashboard</h1>
        <p className="text-dark/70">Welcome back, {session?.user?.name}! Ready to deliver some smiles today? 😊</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-mustard/20">
          <p className="text-dark/70 text-sm">Today's Earnings</p>
          <p className="text-2xl font-bold text-green">₦{stats.todayEarnings.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-mustard/20">
          <p className="text-dark/70 text-sm">Completed Today</p>
          <p className="text-2xl font-bold text-olive">{stats.completedToday}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-mustard/20">
          <p className="text-dark/70 text-sm">Active Deliveries</p>
          <p className="text-2xl font-bold text-mustard">{stats.activeDeliveries}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-mustard/20">
          <p className="text-dark/70 text-sm">Total Earnings</p>
          <p className="text-2xl font-bold text-dark">₦{stats.totalEarnings.toLocaleString()}</p>
        </div>
      </div>

      {/* Active Deliveries */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-mustard/20">
        <h2 className="text-xl font-bold text-dark mb-4">Active Deliveries</h2>
        <div className="grid gap-4">
          {deliveries.length > 0 ? (
            deliveries.map(delivery => (
              <DeliveryCard
                key={delivery.id}
                delivery={delivery}
                onStatusChange={(newStatus) => handleStatusChange(delivery.id, newStatus)}
              />
            ))
          ) : (
            <div className="text-center py-8 text-dark/50">
              No active deliveries at the moment
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// app/vendor/dashboard/page.tsx (or any route)
// Make sure: npm i chart.js
'use client';

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function VendorDashboard() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'],
        datasets: [
          {
            label: 'Daily Sales (₦)',
            data: [12000, 19000, 15000, 25000, 22000, 19400, 28400],
            backgroundColor: 'rgba(199, 165, 157, 0.2)', // olive tint
            borderColor: '#C7A59D',
            borderWidth: 3,
            tension: 0.4,
            pointBackgroundColor: '#C7A59D',
            pointRadius: 4,
            pointHoverRadius: 7,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
          x: { grid: { display: false } },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, []);

  return (
    <div className="min-h-screen bg-cream p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-dark">Vendor Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <svg className="h-6 w-6 text-olive" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-green rounded-full h-4 w-4 text-xs flex items-center justify-center text-cream">3</span>
            </div>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-olive to-mustard flex items-center justify-center text-cream font-semibold">
              VC
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-olive card-hover">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm uppercase text-olive font-semibold">Today's Orders</p>
                <p className="text-3xl font-bold text-dark mt-2">12</p>
                <p className="text-xs text-green mt-2 flex items-center">
                  <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  +2 from yesterday
                </p>
              </div>
              <div className="bg-olive rounded-lg p-3">
                <svg className="h-6 w-6 text-cream" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-mustard card-hover">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm uppercase text-mustard font-semibold">Gross Sales</p>
                <p className="text-3xl font-bold text-dark mt-2">₦85,400</p>
                <p className="text-xs text-green mt-2 flex items-center">
                  <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  +15% from last week
                </p>
              </div>
              <div className="bg-mustard rounded-lg p-3">
                <svg className="h-6 w-6 text-cream" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green card-hover">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm uppercase text-green font-semibold">Your Net (5%)</p>
                <p className="text-3xl font-bold text-dark mt-2">₦81,130</p>
                <p className="text-xs text-green mt-2">Available for withdrawal</p>
              </div>
              <div className="bg-green rounded-lg p-3">
                <svg className="h-6 w-6 text-cream" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Chart + Next Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-dark">Weekly Performance</h2>
              <span className="px-3 py-1 bg-cream text-dark rounded-full text-xs font-medium">Last 7 days</span>
            </div>
            <div className="h-64">
              <canvas ref={canvasRef} aria-label="Weekly sales line chart" role="img" />
            </div>
          </div>

          <div className="bg-olive rounded-2xl shadow-lg p-6 text-cream">
            <h2 className="text-lg font-semibold mb-4">What's next?</h2>

            <div className="space-y-4">
              <NextItem
                iconPath="M12 6v6m0 0v6m0-6h6m-6 0H6"
                title="Add or update products"
                note="Keep your catalog fresh with new items"
                delay="0s"
              />
              <NextItem
                iconPath="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                title="Review new orders"
                note="5 orders need your attention"
                delay="1s"
              />
              <NextItem
                iconPath="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                title="Check earnings & request payout"
                note="₦81,130 available for withdrawal"
                delay="2s"
              />
            </div>

            <button className="mt-6 w-full bg-cream text-olive py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all">
              View All Tasks
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
          <h2 className="text-lg font-semibold text-dark mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <ActivityRow title="New order #3245" time="2 minutes ago" amount="+₦12,500" amountClass="text-green" />
            <ActivityRow title="New order #3244" time="15 minutes ago" amount="+₦8,300" amountClass="text-green" />
            <ActivityRow
              title="Product low in stock"
              time="1 hour ago"
              amount="Attention needed"
              amountClass="text-mustard"
              alert
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Small TSX helpers ---------- */

function NextItem({
  iconPath,
  title,
  note,
  delay,
}: {
  iconPath: string;
  title: string;
  note: string;
  delay: string;
}) {
  return (
    <div className="flex items-start animate-float" style={{ animationDelay: delay }}>
      <div className="bg-cream text-olive rounded-lg p-2 mr-4">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={iconPath} />
        </svg>
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm opacity-80 mt-1">{note}</p>
      </div>
    </div>
  );
}

function ActivityRow({
  title,
  time,
  amount,
  amountClass,
  alert = false,
}: {
  title: string;
  time: string;
  amount: string;
  amountClass: string;
  alert?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between py-3 ${!alert ? 'border-b border-gray-100' : ''}`}>
      <div className="flex items-center">
        <div className="bg-cream rounded-lg p-2 mr-4">
          <svg
            className={`h-5 w-5 ${alert ? 'text-mustard' : 'text-green'}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            aria-hidden="true"
          >
            {alert ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            )}
          </svg>
        </div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-gray-500">{time}</p>
        </div>
      </div>
      <span className={`font-semibold ${amountClass}`}>{amount}</span>
    </div>
  );
}
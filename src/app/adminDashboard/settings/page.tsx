"use client";

import { useEffect, useState } from "react";

type AdminSettings = {
  commissionRate: number; // e.g. 0.07 for 7%
  topVendorsCommissionRate: number; // e.g. 0.05 for 5%
  minPayout: number;      // NGN
  supportEmail: string;
};

const DEFAULTS: AdminSettings = {
  commissionRate: 0.07,
  topVendorsCommissionRate: 0.05,
  minPayout: 10000,
  supportEmail: "support@chyte.app",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<AdminSettings>(DEFAULTS);
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("adminSettings");
    if (raw) {
      try {
        const savedSettings = JSON.parse(raw);
        setSettings({ ...DEFAULTS, ...savedSettings });
      } catch (e) {
        console.error("Error parsing settings:", e);
      }
    }
    setIsLoading(false);
  }, []);

  function save() {
    localStorage.setItem("adminSettings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Platform Settings</h1>
          <button 
            onClick={save} 
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
          >
            {saved ? (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved!
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>

        {saved && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-800">Settings saved successfully!</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Commission Settings Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Commission Rates
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Standard Commission Rate (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="50"
                    value={(settings.commissionRate * 100).toString()}
                    onChange={(e) => {
                      const pct = Math.max(0, Math.min(50, Number(e.target.value)));
                      setSettings(s => ({ ...s, commissionRate: pct / 100 }));
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Percentage taken from vendor sales (0-50%)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Top Vendors Commission Rate (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="50"
                    value={(settings.topVendorsCommissionRate * 100).toString()}
                    onChange={(e) => {
                      const pct = Math.max(0, Math.min(50, Number(e.target.value)));
                      setSettings(s => ({ ...s, topVendorsCommissionRate: pct / 100 }));
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Reduced rate for top-performing vendors (0-50%)</p>
              </div>
            </div>
          </div>

          {/* Payout Settings Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Payout Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Payout Amount</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">₦</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={settings.minPayout}
                    onChange={(e) => setSettings(s => ({ ...s, minPayout: Number(e.target.value) }))}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimum amount required for vendors to request a payout</p>
              </div>
            </div>
          </div>

          {/* Contact Settings Card */}
          <div className="bg-white rounded-xl shadow-md p-6 md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings(s => ({ ...s, supportEmail: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">Email address for vendor and customer support inquiries</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 极速赛车开奖直播，极速赛车开奖记录，极速赛车开奖历史，极速赛车开奖号码，极速赛车开奖结果，极速赛车开奖视频，极速赛车开奖直播现场，极速赛车开奖官网，极速赛车开奖记录查询，极速赛车开奖号码查询，极速赛车开奖结果查询，极速赛车开奖视频回放，极速赛车开奖直播回放，极速赛车开奖历史记录，极速赛车开奖号码历史，极速赛车开奖结果历史，极速赛车开奖视频历史，极速赛车开奖直播历史，极速赛车开奖记录历史，极速赛车开奖号码记录，极速赛车开奖结果记录，极速赛车开奖视频记录，极速赛车开奖直播记录，极速赛车开奖历史记录查询，极速赛车开奖号码历史记录，极速赛车开奖结果历史记录，极速赛车开奖视频历史记录，极速赛车开奖直播历史记录，极速赛车开奖记录历史记录，极速赛车开奖号码记录查询，极速赛车开奖结果记录查询，极速赛车开奖视频记录查询，极速赛车开奖直播记录查询" />
            </svg>
            Implementation Note
          </h3>
          <p className="text-sm text-blue-600 mt-1">
            Your vendor and earnings pages should reference <code className="bg-blue-100 px-1 py-0.5 rounded">adminSettings.commissionRate</code> and <code className="bg-blue-100 px-1 py-0.5 rounded">adminSettings.topVendorsCommissionRate</code> instead of hard-coded values.
          </p>
        </div>
      </div>
    </div>
  );
}
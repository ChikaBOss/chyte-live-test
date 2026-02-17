"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type Withdrawal = {
  _id: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: "PENDING" | "PROCESSING" | "APPROVED" | "COMPLETED" | "REJECTED" | "FAILED";
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  createdAt: string;
  completedAt?: string;
};

export default function TopVendorPayoutsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      
      // Fetch wallet balance
      const walletRes = await fetch('/api/vendor/earnings');
      const walletData = await walletRes.json();
      
      if (walletData.success) {
        setWalletBalance(walletData.wallet?.balance || 0);
      }
      
      // Fetch withdrawal history
      const withdrawalsRes = await fetch('/api/wallet/withdrawals');
      const withdrawalsData = await withdrawalsRes.json();
      
      if (withdrawalsData.success) {
        setWithdrawals(withdrawalsData.withdrawals || []);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredWithdrawals = withdrawals.filter(w => 
    statusFilter === "all" || w.status === statusFilter.toUpperCase()
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-mustard text-cream";
      case "PROCESSING": return "bg-olive text-cream";
      case "COMPLETED": return "bg-green text-cream";
      case "FAILED":
      case "REJECTED": return "bg-dark text-cream";
      default: return "bg-gray-200 text-gray-800";
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    
    if (!amount || amount < 1000) {
      alert("Minimum withdrawal amount is ₦1,000");
      return;
    }
    
    if (amount > walletBalance) {
      alert("Insufficient balance");
      return;
    }

    // For demo purposes - in production, you would collect bank details
    const bankDetails = {
      bankCode: "057",
      bankName: "Zenith Bank",
      accountNumber: "0123456789",
      accountName: "Top Vendor Account"
    };

    try {
      setSubmitting(true);
      
      const response = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          bankDetails: bankDetails
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert("Withdrawal request submitted!");
        setShowWithdrawModal(false);
        setWithdrawAmount("");
        fetchData(); // Refresh
      } else {
        alert(data.error || "Withdrawal failed");
      }
    } catch (error) {
      console.error("Withdrawal error:", error);
      alert("Withdrawal request failed");
    } finally {
      setSubmitting(false);
    }
  };

  const calculateTotals = () => {
    const pending = withdrawals.filter(w => w.status === "PENDING" || w.status === "PROCESSING");
    const completed = withdrawals.filter(w => w.status === "COMPLETED");
    
    return {
      available: walletBalance,
      pending: pending.reduce((sum, w) => sum + w.amount, 0),
      totalPaid: completed.reduce((sum, w) => sum + w.amount, 0)
    };
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="p-6 bg-cream min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-olive"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-cream min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-between items-center"
      >
        <h1 className="text-3xl font-bold text-dark">Payouts</h1>
        <button 
          onClick={() => setShowWithdrawModal(true)}
          disabled={walletBalance < 1000}
          className="bg-olive text-cream px-4 py-2 rounded-lg font-medium hover:bg-olive-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Request Payout
        </button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-olive">
          <p className="text-sm text-olive font-medium">Available for Payout</p>
          <p className="text-2xl font-bold text-dark">₦{totals.available.toLocaleString()}</p>
          {totals.available < 1000 && (
            <p className="text-xs text-red-500 mt-2">Minimum: ₦1,000</p>
          )}
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-mustard">
          <p className="text-sm text-mustard font-medium">Pending Payouts</p>
          <p className="text-2xl font-bold text-dark">₦{totals.pending.toLocaleString()}</p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-green">
          <p className="text-sm text-green font-medium">Total Paid Out</p>
          <p className="text-2xl font-bold text-dark">₦{totals.totalPaid.toLocaleString()}</p>
        </div>
      </div>

      {/* Payout History */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-dark">Payout History</h2>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark/10">
                <th className="pb-3 text-left text-dark font-semibold">Payout ID</th>
                <th className="pb-3 text-left text-dark font-semibold">Date</th>
                <th className="pb-3 text-left text-dark font-semibold">Amount</th>
                <th className="pb-3 text-left text-dark font-semibold">Status</th>
                <th className="pb-3 text-left text-dark font-semibold">Method</th>
                <th className="pb-3 text-left text-dark font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWithdrawals.map((withdrawal, index) => (
                <motion.tr
                  key={withdrawal._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border-b border-dark/10 hover:bg-cream/30"
                >
                  <td className="py-4 text-dark font-medium">#{withdrawal._id.slice(-8)}</td>
                  <td className="py-4 text-dark">
                    {new Date(withdrawal.createdAt).toLocaleDateString('en-NG', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="py-4 text-dark">₦{withdrawal.amount.toLocaleString()}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(withdrawal.status)}`}>
                      {formatStatus(withdrawal.status)}
                    </span>
                  </td>
                  <td className="py-4 text-dark">Bank Transfer</td>
                  <td className="py-4">
                    <button className="text-olive hover:text-olive-2 font-medium text-sm">
                      View Details
                    </button>
                  </td>
                </motion.tr>
              ))}
              
              {filteredWithdrawals.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-dark/60">
                    <div className="text-4xl mb-3">💳</div>
                    <p>No payout requests found</p>
                    <p className="text-sm">Your withdrawal history will appear here</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-dark/60">
            Showing {filteredWithdrawals.length} of {withdrawals.length} payouts
          </p>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-200 rounded-lg text-dark hover:bg-cream">
              Previous
            </button>
            <button className="px-3 py-1 bg-olive text-cream rounded-lg">1</button>
            <button className="px-3 py-1 border border-gray-200 rounded-lg text-dark hover:bg-cream">
              2
            </button>
            <button className="px-3 py-1 border border-gray-200 rounded-lg text-dark hover:bg-cream">
              Next
            </button>
          </div>
        </div>
      </motion.div>

      {/* Bank Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <h2 className="text-xl font-semibold text-dark mb-4">Payout Method</h2>
        <div className="flex items-center justify-between p-4 border border-olive rounded-xl">
          <div className="flex items-center">
            <div className="bg-cream p-3 rounded-lg mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-olive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-dark">Bank Transfer</p>
              <p className="text-sm text-dark/60">**** **** **** 1234 • Zenith Bank</p>
            </div>
          </div>
          <button className="text-olive hover:text-olive-2 font-medium">
            Edit
          </button>
        </div>
      </motion.div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-cream rounded-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-dark">Request Payout</h3>
                <button 
                  onClick={() => setShowWithdrawModal(false)}
                  disabled={submitting}
                  className="w-8 h-8 rounded-full bg-white text-dark flex items-center justify-center hover:bg-dark/10"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Available Balance */}
                <div className="bg-olive/10 border border-olive/20 rounded-xl p-4">
                  <p className="text-sm text-olive">Available Balance</p>
                  <p className="text-2xl font-bold text-dark">₦{walletBalance.toLocaleString()}</p>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Amount to Withdraw
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark">₦</span>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 border border-dark/20 rounded-xl bg-white"
                      placeholder="1000"
                      min="1000"
                      max={walletBalance}
                      disabled={submitting}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-dark/60 mt-2">
                    <span>Minimum: ₦1,000</span>
                    <span>Fee: ₦50</span>
                  </div>
                  {withdrawAmount && (
                    <p className="text-sm font-medium text-dark mt-2">
                      You'll receive: ₦{(parseFloat(withdrawAmount) - 50).toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Note about bank details */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> Withdrawals will be sent to your registered bank account. 
                    Please ensure your bank details are up to date.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowWithdrawModal(false)}
                    className="flex-1 px-4 py-3 border border-dark/20 rounded-xl text-dark hover:bg-dark/5 transition-colors"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleWithdraw}
                    disabled={submitting || !withdrawAmount || parseFloat(withdrawAmount) < 1000}
                    className="flex-1 px-4 py-3 bg-olive text-cream rounded-xl font-medium hover:bg-olive-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Processing..." : "Confirm Withdrawal"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
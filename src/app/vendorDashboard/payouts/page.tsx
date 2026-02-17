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

type BankDetails = {
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
};

export default function VendorPayoutsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    bankCode: "",
    bankName: "",
    accountNumber: "",
    accountName: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [walletRes, withdrawalsRes] = await Promise.all([
        fetch('/api/vendor/earnings'),
        fetch('/api/wallet/withdrawals')
      ]);
      
      const walletData = await walletRes.json();
      const withdrawalsData = await withdrawalsRes.json();
      
      if (walletData.success) {
        setWalletBalance(walletData.wallet?.balance || 0);
      }
      
      if (withdrawalsData.success) {
        setWithdrawals(withdrawalsData.withdrawals || []);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) < 1000) {
      alert("Minimum withdrawal amount is ₦1,000");
      return;
    }

    if (!bankDetails.accountNumber || !bankDetails.accountName || !bankDetails.bankCode) {
      alert("Please complete your bank details");
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(withdrawAmount),
          bankDetails: bankDetails
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert("Withdrawal request submitted successfully!");
        setShowWithdrawModal(false);
        setWithdrawAmount("");
        fetchData(); // Refresh data
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green text-cream";
      case "PROCESSING":
        return "bg-olive text-cream";
      case "APPROVED":
        return "bg-blue-500 text-white";
      case "PENDING":
        return "bg-mustard text-cream";
      case "REJECTED":
      case "FAILED":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green mx-auto"></div>
          <p className="mt-4 text-dark">Loading payout data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-dark mb-2">Payouts</h1>
          <p className="text-dark/70">Withdraw your earnings to your bank account</p>
        </div>
        <button 
          onClick={() => setShowWithdrawModal(true)}
          disabled={walletBalance < 1000}
          className={`bg-olive text-cream px-4 py-2 rounded-lg font-medium transition ${
            walletBalance < 1000 
              ? "opacity-50 cursor-not-allowed" 
              : "hover:bg-olive-2"
          }`}
        >
          Request Payout
        </button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-cream rounded-xl p-4 border border-olive">
          <p className="text-sm text-olive">Available for Payout</p>
          <p className="text-2xl font-bold text-dark">₦{walletBalance.toLocaleString()}</p>
          {walletBalance < 1000 && (
            <p className="text-xs text-red-500 mt-1">Minimum: ₦1,000</p>
          )}
        </div>
        
        <div className="bg-cream rounded-xl p-4 border border-mustard">
          <p className="text-sm text-mustard">Pending Payouts</p>
          <p className="text-2xl font-bold text-dark">
            ₦{withdrawals
              .filter(w => w.status === "PENDING" || w.status === "PROCESSING")
              .reduce((sum, w) => sum + w.amount, 0)
              .toLocaleString()}
          </p>
        </div>
        
        <div className="bg-cream rounded-xl p-4 border border-green">
          <p className="text-sm text-green">Total Paid Out</p>
          <p className="text-2xl font-bold text-dark">
            ₦{withdrawals
              .filter(w => w.status === "COMPLETED")
              .reduce((sum, w) => sum + w.amount, 0)
              .toLocaleString()}
          </p>
        </div>
      </div>

      {/* Payout History */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h2 className="text-xl font-semibold text-dark mb-6">Payout History</h2>
        
        {withdrawals.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">💳</div>
            <p className="text-dark/60">No payout requests yet</p>
            <p className="text-sm text-dark/40">Your withdrawal history will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-left text-dark">Date</th>
                  <th className="pb-3 text-left text-dark">Amount</th>
                  <th className="pb-3 text-left text-dark">Fee</th>
                  <th className="pb-3 text-left text-dark">Net Amount</th>
                  <th className="pb-3 text-left text-dark">Status</th>
                  <th className="pb-3 text-left text-dark">Completed</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((withdrawal, index) => (
                  <motion.tr
                    key={withdrawal._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border-b border-gray-100 hover:bg-cream/30"
                  >
                    <td className="py-4 text-dark">{formatDate(withdrawal.createdAt)}</td>
                    <td className="py-4 text-dark font-semibold">₦{withdrawal.amount.toLocaleString()}</td>
                    <td className="py-4 text-red-500">-₦{withdrawal.fee.toLocaleString()}</td>
                    <td className="py-4 text-green font-bold">₦{withdrawal.netAmount.toLocaleString()}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(withdrawal.status)}`}>
                        {withdrawal.status}
                      </span>
                    </td>
                    <td className="py-4 text-dark/70">
                      {withdrawal.completedAt ? formatDate(withdrawal.completedAt) : "-"}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-cream rounded-2xl w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-dark">Request Payout</h3>
                <button 
                  className="w-8 h-8 rounded-full bg-white text-dark flex items-center justify-center"
                  onClick={() => setShowWithdrawModal(false)}
                  disabled={submitting}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Available Balance */}
                <div className="bg-green/10 border border-green/20 rounded-xl p-4">
                  <p className="text-sm text-green">Available Balance</p>
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
                  <p className="text-xs text-dark/60 mt-1">
                    Minimum: ₦1,000 • Fee: ₦50
                  </p>
                  {withdrawAmount && (
                    <p className="text-sm text-dark mt-2">
                      You'll receive: ₦{(parseFloat(withdrawAmount) - 50).toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Bank Details */}
                <div className="space-y-3">
                  <h4 className="font-medium text-dark">Bank Details</h4>
                  
                  <input
                    type="text"
                    placeholder="Bank Name"
                    value={bankDetails.bankName}
                    onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                    className="w-full px-4 py-3 border border-dark/20 rounded-xl bg-white"
                    disabled={submitting}
                  />
                  
                  <input
                    type="text"
                    placeholder="Account Number"
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                    className="w-full px-4 py-3 border border-dark/20 rounded-xl bg-white"
                    disabled={submitting}
                  />
                  
                  <input
                    type="text"
                    placeholder="Account Name"
                    value={bankDetails.accountName}
                    onChange={(e) => setBankDetails({...bankDetails, accountName: e.target.value})}
                    className="w-full px-4 py-3 border border-dark/20 rounded-xl bg-white"
                    disabled={submitting}
                  />
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
          </motion.div>
        </div>
      )}
    </div>
  );
}
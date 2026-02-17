"use client";

import { useEffect, useState } from "react";

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

export default function RiderPayoutsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankDetails, setBankDetails] = useState({
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
      
      // Fetch rider wallet balance
      const walletRes = await fetch('/api/rider/earnings');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-green-100 text-green-800";
      case "PROCESSING": return "bg-blue-100 text-blue-800";
      case "APPROVED": return "bg-yellow-100 text-yellow-800";
      case "PENDING": return "bg-gray-100 text-gray-800";
      case "REJECTED":
      case "FAILED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
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
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payouts</h1>
          <p className="text-gray-600">Withdraw your delivery earnings</p>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-6 shadow-lg mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h2 className="text-xl font-bold mb-2">Available Balance</h2>
              <p className="text-3xl font-bold">₦{walletBalance.toLocaleString()}</p>
              <div className="flex gap-4 mt-2 text-blue-100">
                <span>Pending: ₦{withdrawals
                  .filter(w => w.status === "PENDING" || w.status === "PROCESSING")
                  .reduce((sum, w) => sum + w.amount, 0)
                  .toLocaleString()}</span>
                <span>•</span>
                <span>Total Paid: ₦{withdrawals
                  .filter(w => w.status === "COMPLETED")
                  .reduce((sum, w) => sum + w.amount, 0)
                  .toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={() => setShowWithdrawModal(true)}
              disabled={walletBalance < 1000}
              className={`mt-4 md:mt-0 px-6 py-3 rounded-xl font-bold transition-colors ${
                walletBalance >= 1000
                  ? "bg-white text-blue-600 hover:bg-blue-50"
                  : "bg-blue-400 text-white cursor-not-allowed"
              }`}
            >
              Withdraw Funds
            </button>
          </div>
        </div>

        {/* Payout History */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Payout History</h2>
          </div>
          
          {withdrawals.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-3">💳</div>
              <p className="text-gray-600">No payout requests yet</p>
              <p className="text-sm text-gray-500">Your withdrawal history will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {withdrawals.map((withdrawal) => (
                    <tr key={withdrawal._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900">{formatDate(withdrawal.createdAt)}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900">₦{withdrawal.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-red-500">-₦{withdrawal.fee.toLocaleString()}</td>
                      <td className="px-6 py-4 font-bold text-green-600">₦{withdrawal.netAmount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(withdrawal.status)}`}>
                          {withdrawal.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {withdrawal.completedAt ? formatDate(withdrawal.completedAt) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Request Payout</h3>
                <button 
                  onClick={() => setShowWithdrawModal(false)}
                  disabled={submitting}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Balance */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700">Available Balance</p>
                  <p className="text-2xl font-bold text-gray-900">₦{walletBalance.toLocaleString()}</p>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount to Withdraw
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₦</span>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="1000"
                      min="1000"
                      max={walletBalance}
                      disabled={submitting}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>Minimum: ₦1,000</span>
                    <span>Fee: ₦50</span>
                  </div>
                  {withdrawAmount && (
                    <p className="text-sm font-medium text-gray-900 mt-2">
                      You'll receive: ₦{(parseFloat(withdrawAmount) - 50).toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Bank Details */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Bank Details</h4>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Bank Name</label>
                    <input
                      type="text"
                      placeholder="Select your bank"
                      value={bankDetails.bankName}
                      onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={submitting}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Account Number</label>
                    <input
                      type="text"
                      placeholder="0123456789"
                      value={bankDetails.accountNumber}
                      onChange={(e) => {
                        const accountNum = e.target.value.replace(/\D/g, '');
                        setBankDetails({...bankDetails, accountNumber: accountNum});
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={submitting}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Account Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={bankDetails.accountName}
                      onChange={(e) => setBankDetails({...bankDetails, accountName: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={submitting}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowWithdrawModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleWithdraw}
                    disabled={submitting || !withdrawAmount || parseFloat(withdrawAmount) < 1000}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
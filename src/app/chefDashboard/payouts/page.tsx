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

export default function ChefPayoutsPage() {
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
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6 bg-cream min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-cream min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-dark mb-2">Payouts</h1>
            <p className="text-dark/70">Withdraw your earnings to your bank account</p>
          </div>
          <button 
            onClick={() => setShowWithdrawModal(true)}
            disabled={walletBalance < 1000}
            className={`px-6 py-3 rounded-xl font-bold transition-colors ${
              walletBalance >= 1000
                ? "bg-olive text-cream hover:bg-olive-2"
                : "bg-olive/50 text-cream/70 cursor-not-allowed"
            }`}
          >
            Request Payout
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-olive">
            <p className="text-sm text-olive font-medium">Available for Payout</p>
            <p className="text-2xl font-bold text-dark">₦{walletBalance.toLocaleString()}</p>
            {walletBalance < 1000 && (
              <p className="text-xs text-red-500 mt-2">Minimum: ₦1,000</p>
            )}
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-mustard">
            <p className="text-sm text-mustard font-medium">Pending Payouts</p>
            <p className="text-2xl font-bold text-dark">
              ₦{withdrawals
                .filter(w => w.status === "PENDING" || w.status === "PROCESSING")
                .reduce((sum, w) => sum + w.amount, 0)
                .toLocaleString()}
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-green">
            <p className="text-sm text-green font-medium">Total Paid Out</p>
            <p className="text-2xl font-bold text-dark">
              ₦{withdrawals
                .filter(w => w.status === "COMPLETED")
                .reduce((sum, w) => sum + w.amount, 0)
                .toLocaleString()}
            </p>
          </div>
        </div>

        {/* Payout History */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-dark/10">
            <h2 className="text-xl font-bold text-dark">Payout History</h2>
          </div>
          
          {withdrawals.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-3">💳</div>
              <p className="text-dark/60">No payout requests yet</p>
              <p className="text-sm text-dark/40">Your withdrawal history will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-cream border-b border-dark/10">
                    <th className="p-4 text-left font-semibold text-dark">Date</th>
                    <th className="p-4 text-left font-semibold text-dark">Amount</th>
                    <th className="p-4 text-left font-semibold text-dark">Fee</th>
                    <th className="p-4 text-left font-semibold text-dark">Net Amount</th>
                    <th className="p-4 text-left font-semibold text-dark">Status</th>
                    <th className="p-4 text-left font-semibold text-dark">Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((withdrawal) => (
                    <tr key={withdrawal._id} className="border-b border-dark/10 hover:bg-cream/50">
                      <td className="p-4 text-dark">{formatDate(withdrawal.createdAt)}</td>
                      <td className="p-4 font-semibold text-dark">₦{withdrawal.amount.toLocaleString()}</td>
                      <td className="p-4 text-red-500">-₦{withdrawal.fee.toLocaleString()}</td>
                      <td className="p-4 font-bold text-green-600">₦{withdrawal.netAmount.toLocaleString()}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                          {withdrawal.status}
                        </span>
                      </td>
                      <td className="p-4 text-dark/70">
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
                {/* Balance */}
                <div className="bg-green/10 border border-green/20 rounded-xl p-4">
                  <p className="text-sm text-green">Available Balance</p>
                  <p className="text-2xl font-bold text-dark">₦{walletBalance.toLocaleString()}</p>
                </div>

                {/* Amount */}
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

                {/* Actions */}
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
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type Withdrawal = {
  _id: string;
  userId: string;
  user: {
    name: string;
    email: string;
    phone?: string;
  };
  role: "vendor" | "rider";
  amount: number;
  fee: number;
  netAmount: number;
  status: "PENDING" | "PROCESSING" | "APPROVED" | "COMPLETED" | "REJECTED";
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  paystackTransferCode?: string;
};

export default function AdminPayoutsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchWithdrawals();
  }, [filter]);

  async function fetchWithdrawals() {
    try {
      setLoading(true);
      const url = filter === "all" 
        ? "/api/admin/withdrawals"
        : `/api/admin/withdrawals?status=${filter}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setWithdrawals(data.withdrawals || []);
      }
    } catch (error) {
      console.error("Failed to fetch withdrawals:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      setProcessingId(id);
      
      const response = await fetch(`/api/admin/withdrawals/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchWithdrawals(); // Refresh list
        if (selectedWithdrawal?._id === id) {
          setSelectedWithdrawal({
            ...selectedWithdrawal,
            status: newStatus as any
          });
        }
      } else {
        alert(data.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Status update error:", error);
      alert("Failed to update status");
    } finally {
      setProcessingId(null);
    }
  };

  const initiateTransfer = async (id: string) => {
    try {
      setProcessingId(id);
      
      const response = await fetch(`/api/admin/withdrawals/${id}/transfer`, {
        method: "POST"
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert("Transfer initiated successfully!");
        fetchWithdrawals();
      } else {
        alert(data.error || "Failed to initiate transfer");
      }
    } catch (error) {
      console.error("Transfer error:", error);
      alert("Failed to initiate transfer");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "PROCESSING": return "bg-blue-100 text-blue-800";
      case "APPROVED": return "bg-green-100 text-green-800";
      case "COMPLETED": return "bg-emerald-100 text-emerald-800";
      case "REJECTED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleColor = (role: string) => {
    return role === "vendor" 
      ? "bg-purple-100 text-purple-800" 
      : "bg-indigo-100 text-indigo-800";
  };

  const calculateTotals = () => {
    const pending = withdrawals.filter(w => w.status === "PENDING");
    const processing = withdrawals.filter(w => w.status === "PROCESSING");
    
    return {
      pendingAmount: pending.reduce((sum, w) => sum + w.amount, 0),
      pendingCount: pending.length,
      processingAmount: processing.reduce((sum, w) => sum + w.amount, 0),
      processingCount: processing.length,
      totalAmount: withdrawals.reduce((sum, w) => sum + w.amount, 0)
    };
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payout requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payout Management</h1>
          <p className="text-gray-600">Review and process withdrawal requests</p>
        </div>
        <button
          onClick={fetchWithdrawals}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500">Pending Requests</p>
          <p className="text-2xl font-bold text-gray-900">{totals.pendingCount}</p>
          <p className="text-lg text-gray-700">₦{totals.pendingAmount.toLocaleString()}</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">Processing</p>
          <p className="text-2xl font-bold text-gray-900">{totals.processingCount}</p>
          <p className="text-lg text-gray-700">₦{totals.processingAmount.toLocaleString()}</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Total This Month</p>
          <p className="text-2xl font-bold text-gray-900">{withdrawals.length}</p>
          <p className="text-lg text-gray-700">₦{totals.totalAmount.toLocaleString()}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
        {[
          { value: "all", label: "All Requests" },
          { value: "PENDING", label: "Pending" },
          { value: "PROCESSING", label: "Processing" },
          { value: "APPROVED", label: "Approved" },
          { value: "COMPLETED", label: "Completed" }
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === tab.value
                ? "bg-white text-gray-900 shadow"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Withdrawals Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Withdrawal Requests</h2>
        </div>
        
        {withdrawals.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-3">💰</div>
            <p className="text-gray-600">No withdrawal requests found</p>
            <p className="text-sm text-gray-500">When vendors or riders request payouts, they'll appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bank Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {withdrawals.map((withdrawal) => (
                  <motion.tr
                    key={withdrawal._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{withdrawal.user.name}</p>
                        <p className="text-sm text-gray-500">{withdrawal.user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(withdrawal.role)}`}>
                        {withdrawal.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-gray-900">₦{withdrawal.amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">Net: ₦{withdrawal.netAmount.toLocaleString()}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-900">{withdrawal.bankDetails.accountName}</p>
                        <p className="text-xs text-gray-500">
                          {withdrawal.bankDetails.bankName} ••••{withdrawal.bankDetails.accountNumber.slice(-4)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(withdrawal.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(withdrawal.status)}`}>
                        {withdrawal.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedWithdrawal(withdrawal)}
                          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                          View
                        </button>
                        
                        {withdrawal.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(withdrawal._id, "APPROVED")}
                              disabled={processingId === withdrawal._id}
                              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                            >
                              {processingId === withdrawal._id ? "..." : "Approve"}
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(withdrawal._id, "REJECTED")}
                              disabled={processingId === withdrawal._id}
                              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                            >
                              {processingId === withdrawal._id ? "..." : "Reject"}
                            </button>
                          </>
                        )}
                        
                        {withdrawal.status === "APPROVED" && (
                          <button
                            onClick={() => initiateTransfer(withdrawal._id)}
                            disabled={processingId === withdrawal._id}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                          >
                            {processingId === withdrawal._id ? "Processing..." : "Send via Paystack"}
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Withdrawal Details Modal */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl w-full max-w-2xl"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Withdrawal Details</h3>
                <button
                  onClick={() => setSelectedWithdrawal(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* User Info */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">User Information</h4>
                  <div className="space-y-2">
                    <p><span className="text-gray-500">Name:</span> {selectedWithdrawal.user.name}</p>
                    <p><span className="text-gray-500">Email:</span> {selectedWithdrawal.user.email}</p>
                    <p><span className="text-gray-500">Role:</span> {selectedWithdrawal.role}</p>
                    <p><span className="text-gray-500">Requested:</span> {new Date(selectedWithdrawal.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                {/* Payment Details */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Payment Details</h4>
                  <div className="space-y-2">
                    <p><span className="text-gray-500">Amount:</span> ₦{selectedWithdrawal.amount.toLocaleString()}</p>
                    <p><span className="text-gray-500">Fee:</span> ₦{selectedWithdrawal.fee.toLocaleString()}</p>
                    <p><span className="text-gray-500">Net Amount:</span> <strong>₦{selectedWithdrawal.netAmount.toLocaleString()}</strong></p>
                    <p><span className="text-gray-500">Status:</span> 
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(selectedWithdrawal.status)}`}>
                        {selectedWithdrawal.status}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Bank Details */}
                <div className="col-span-2">
                  <h4 className="font-semibold text-gray-700 mb-3">Bank Account Details</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Bank Name</p>
                        <p className="font-medium">{selectedWithdrawal.bankDetails.bankName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Account Number</p>
                        <p className="font-medium">{selectedWithdrawal.bankDetails.accountNumber}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500">Account Name</p>
                        <p className="font-medium">{selectedWithdrawal.bankDetails.accountName}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Admin Actions */}
                <div className="col-span-2 pt-6 border-t">
                  <h4 className="font-semibold text-gray-700 mb-3">Admin Actions</h4>
                  <div className="flex space-x-3">
                    {selectedWithdrawal.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => {
                            handleStatusUpdate(selectedWithdrawal._id, "APPROVED");
                            setSelectedWithdrawal(null);
                          }}
                          disabled={processingId === selectedWithdrawal._id}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          Approve Request
                        </button>
                        <button
                          onClick={() => {
                            handleStatusUpdate(selectedWithdrawal._id, "REJECTED");
                            setSelectedWithdrawal(null);
                          }}
                          disabled={processingId === selectedWithdrawal._id}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                          Reject Request
                        </button>
                      </>
                    )}
                    
                    {selectedWithdrawal.status === "APPROVED" && (
                      <button
                        onClick={() => {
                          initiateTransfer(selectedWithdrawal._id);
                          setSelectedWithdrawal(null);
                        }}
                        disabled={processingId === selectedWithdrawal._id}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        Initiate Paystack Transfer
                      </button>
                    )}
                    
                    <button
                      onClick={() => setSelectedWithdrawal(null)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
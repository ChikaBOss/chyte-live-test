"use client";

import { useEffect, useState } from "react";

type Pending = {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  createdAt: number;
};

export default function ApprovalsPage() {
  const [pending, setPending] = useState<Pending[]>([]);

  useEffect(() => {
    const p = JSON.parse(localStorage.getItem("pendingVendors") || "[]");
    setPending(p);
  }, []);

  function approve(id: string) {
    const p = JSON.parse(localStorage.getItem("pendingVendors") || "[]") as Pending[];
    const approvedVendor = p.find((x) => x.id === id);
    const remaining = p.filter((x) => x.id !== id);

    localStorage.setItem("pendingVendors", JSON.stringify(remaining));
    setPending(remaining);

    // mark account approved
    const accounts = JSON.parse(localStorage.getItem("vendorAccounts") || "[]");
    const updated = accounts.map((a: any) => (a.id === id ? { ...a, approved: true } : a));
    localStorage.setItem("vendorAccounts", JSON.stringify(updated));
    alert(`Approved ${approvedVendor?.businessName}. They can now log in.`);
  }

  function reject(id: string) {
    const p = JSON.parse(localStorage.getItem("pendingVendors") || "[]") as Pending[];
    const remaining = p.filter((x) => x.id !== id);
    localStorage.setItem("pendingVendors", JSON.stringify(remaining));
    setPending(remaining);

    // remove login record too (demo)
    const accounts = JSON.parse(localStorage.getItem("vendorAccounts") || "[]");
    localStorage.setItem("vendorAccounts", JSON.stringify(accounts.filter((a: any) => a.id !== id)));
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Vendor Approvals</h1>
      {pending.length === 0 ? (
        <p className="text-gray-600">No pending vendors.</p>
      ) : (
        <div className="space-y-3">
          {pending.map((v) => (
            <div key={v.id} className="bg-white p-4 rounded shadow flex items-center justify-between">
              <div>
                <p className="font-semibold">{v.businessName}</p>
                <p className="text-sm text-gray-600">{v.ownerName} • {v.email} • {v.phone}</p>
                <p className="text-sm text-gray-500">{v.address} • {v.category}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => approve(v.id)} className="px-3 py-1 rounded bg-green-600 text-white">Approve</button>
                <button onClick={() => reject(v.id)} className="px-3 py-1 rounded bg-red-600 text-white">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
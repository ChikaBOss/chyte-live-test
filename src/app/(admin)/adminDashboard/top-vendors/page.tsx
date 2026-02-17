"use client";

import { useEffect, useMemo, useState } from "react";

type TopVendor = {
  _id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone?: string;
  address?: string;
  category?: string;
  approved: boolean;
  status?: string;
  createdAt: string;
  updatedAt: string;
};

export default function TopVendorsPage() {
  const [pending, setPending] = useState<TopVendor[]>([]);
  const [accounts, setAccounts] = useState<TopVendor[]>([]);
  const [tab, setTab] = useState<"approved" | "pending">("approved");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const [pendingRes, accountsRes] = await Promise.all([
          fetch("/api/top-vendors/pending"),
          fetch("/api/top-vendors/accounts"),
        ]);

        if (!pendingRes.ok) {
          throw new Error(`Failed to fetch pending: ${pendingRes.status}`);
        }
        if (!accountsRes.ok) {
          throw new Error(`Failed to fetch accounts: ${accountsRes.status}`);
        }

        setPending(await pendingRes.json());
        setAccounts(await accountsRes.json());
      } catch (err) {
        console.error("Failed to load top vendors:", err);
        alert("Failed to load top vendor data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  /* ================= ACTIONS ================= */

  async function approveFromPending(id: string) {
    try {
      const res = await fetch("/api/top-vendors/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Approval failed");
      }

      const [pendingRes, accountsRes] = await Promise.all([
        fetch("/api/top-vendors/pending"),
        fetch("/api/top-vendors/accounts"),
      ]);

      if (pendingRes.ok) setPending(await pendingRes.json());
      if (accountsRes.ok) setAccounts(await accountsRes.json());

      alert("Top Vendor approved successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to approve");
    }
  }

  async function unapprove(id: string) {
    try {
      const res = await fetch("/api/top-vendors/unapprove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Unapprove failed");
      }

      const accountsRes = await fetch("/api/top-vendors/accounts");
      if (accountsRes.ok) setAccounts(await accountsRes.json());

      alert("Top Vendor unapproved");
    } catch (err: any) {
      alert(err.message || "Failed to unapprove");
    }
  }

  async function removeAccount(id: string) {
    if (!confirm("Remove this Top Vendor permanently?")) return;

    try {
      const res = await fetch("/api/top-vendors/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Remove failed");
      }

      const accountsRes = await fetch("/api/top-vendors/accounts");
      if (accountsRes.ok) setAccounts(await accountsRes.json());

      alert("Top Vendor removed");
    } catch (err: any) {
      alert(err.message || "Failed to remove");
    }
  }

  async function rejectApplication(id: string) {
    if (!confirm("Reject this application permanently?")) return;

    try {
      const res = await fetch("/api/top-vendors/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Reject failed");
      }

      const pendingRes = await fetch("/api/top-vendors/pending");
      if (pendingRes.ok) setPending(await pendingRes.json());

      alert("Application rejected");
    } catch (err: any) {
      alert(err.message || "Failed to reject");
    }
  }

  /* ================= FILTERS ================= */

  const filteredApproved = useMemo(
    () =>
      accounts
        .filter(v => v.approved)
        .filter(v =>
          q
            ? v.businessName.toLowerCase().includes(q.toLowerCase()) ||
              v.email.toLowerCase().includes(q.toLowerCase())
            : true
        ),
    [accounts, q]
  );

  const filteredPending = useMemo(
    () =>
      pending.filter(v =>
        q
          ? v.businessName.toLowerCase().includes(q.toLowerCase()) ||
            v.email.toLowerCase().includes(q.toLowerCase())
          : true
      ),
    [pending, q]
  );

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-indigo-600 rounded-full mx-auto" />
          <p className="mt-4 text-gray-600">Loading Top Vendors…</p>
        </div>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
          Top Vendors Management
        </h1>

        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search business or email"
          className="border px-4 py-2 rounded-lg w-full md:w-64"
        />
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Top Vendors" value={accounts.length} />
        <StatCard title="Approved" value={accounts.filter(a => a.approved).length} />
        <StatCard title="Pending Approval" value={pending.length} />
      </div>

      {/* TABS */}
      <div className="flex bg-white rounded-lg p-1 shadow-sm w-fit mb-6">
        <Tab label="Approved Top Vendors" active={tab === "approved"} onClick={() => setTab("approved")} />
        <Tab label="Pending Approval" active={tab === "pending"} onClick={() => setTab("pending")} />
      </div>

      {tab === "approved" ? (
        <ApprovedTable
          data={filteredApproved}
          onUnapprove={unapprove}
          onRemove={removeAccount}
        />
      ) : (
        <PendingTable
          data={filteredPending}
          onApprove={approveFromPending}
          onReject={rejectApplication}
        />
      )}
    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

function Tab({ label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md text-sm ${
        active ? "bg-indigo-100 text-indigo-700" : "text-gray-600"
      }`}
    >
      {label}
    </button>
  );
}

function ApprovedTable({ data, onUnapprove, onRemove }: any) {
  return (
    <TableWrapper>
      {data.map((v: any) => (
        <tr key={v._id}>
          <td className="px-6 py-4 font-medium">{v.businessName}</td>
          <td className="px-6 py-4">{v.email}</td>
          <td className="px-6 py-4">
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
              Approved
            </span>
          </td>
          <td className="px-6 py-4 space-x-2">
            <button onClick={() => onUnapprove(v._id)} className="text-yellow-600">
              Unapprove
            </button>
            <button onClick={() => onRemove(v._id)} className="text-red-600">
              Remove
            </button>
          </td>
        </tr>
      ))}
    </TableWrapper>
  );
}

function PendingTable({ data, onApprove, onReject }: any) {
  return (
    <TableWrapper>
      {data.map((v: any) => (
        <tr key={v._id}>
          <td className="px-6 py-4 font-medium">{v.businessName}</td>
          <td className="px-6 py-4">{v.ownerName}</td>
          <td className="px-6 py-4">{v.email}</td>
          <td className="px-6 py-4 space-x-2">
            <button onClick={() => onApprove(v._id)} className="text-green-600">
              Approve
            </button>
            <button onClick={() => onReject(v._id)} className="text-red-600">
              Reject
            </button>
          </td>
        </tr>
      ))}
    </TableWrapper>
  );
}

function TableWrapper({ children }: any) {
  return (
    <div className="bg-white rounded-xl shadow overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs uppercase">Business</th>
            <th className="px-6 py-3 text-left text-xs uppercase">Email / Owner</th>
            <th className="px-6 py-3 text-left text-xs uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs uppercase">Actions</th>
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
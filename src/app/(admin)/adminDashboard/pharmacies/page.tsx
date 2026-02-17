"use client";

import { useEffect, useMemo, useState } from "react";

/* ================= TYPES ================= */

type Doc = {
  name: string;
  type: string;
  url: string;        // ✅ Cloudinary URL
  publicId?: string; // optional (for future delete)
};

type Pharmacy = {
  _id: string;
  pharmacyName: string;
  ownerName: string;
  email: string;
  phone?: string;
  address?: string;
  approved: boolean;
  documents?: Doc[];
  createdAt: string;
};

/* ================= PAGE ================= */

export default function PharmaciesPage() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [tab, setTab] = useState<"approved" | "pending">("approved");
  const [q, setQ] = useState("");
  const [openDocs, setOpenDocs] = useState<Doc[] | null>(null);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD FROM BACKEND ================= */

  async function loadPharmacies() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/pharmacies", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || "Failed to load pharmacies");
        return;
      }

      setPharmacies(data);
    } catch (err) {
      console.error("Load pharmacies error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPharmacies();
  }, []);

  /* ================= ACTIONS ================= */

  async function approve(id: string) {
    await fetch(`/api/admin/pharmacies/${id}/approve`, { method: "PATCH" });
    loadPharmacies();
  }

  async function unapprove(id: string) {
    await fetch(`/api/admin/pharmacies/${id}/unapprove`, { method: "PATCH" });
    loadPharmacies();
  }

  async function remove(id: string) {
    if (!confirm("Remove pharmacy permanently?")) return;
    await fetch(`/api/admin/pharmacies/${id}`, { method: "DELETE" });
    loadPharmacies();
  }

  /* ================= FILTERS ================= */

  const approved = useMemo(
    () =>
      pharmacies.filter(
        p =>
          p.approved &&
          (q
            ? p.pharmacyName.toLowerCase().includes(q.toLowerCase()) ||
              p.email.toLowerCase().includes(q.toLowerCase())
            : true)
      ),
    [pharmacies, q]
  );

  const pending = useMemo(
    () =>
      pharmacies.filter(
        p =>
          !p.approved &&
          (q
            ? p.pharmacyName.toLowerCase().includes(q.toLowerCase()) ||
              p.email.toLowerCase().includes(q.toLowerCase())
            : true)
      ),
    [pharmacies, q]
  );

  /* ================= UI ================= */

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between mb-6">
        <h1 className="text-2xl font-bold">Pharmacies Management</h1>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search pharmacy or email"
          className="px-4 py-2 border rounded-lg w-full md:w-64"
        />
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded shadow">
          <p className="text-sm">Total Pharmacies</p>
          <p className="text-3xl font-bold">{pharmacies.length}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <p className="text-sm">Approved</p>
          <p className="text-3xl font-bold">{approved.length}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <p className="text-sm">Pending</p>
          <p className="text-3xl font-bold">{pending.length}</p>
        </div>
      </div>

      {/* TABS */}
      <div className="mb-6 flex bg-white rounded p-1 shadow w-fit">
        <button
          onClick={() => setTab("approved")}
          className={`px-4 py-2 rounded ${tab === "approved" ? "bg-indigo-100" : ""}`}
        >
          Approved
        </button>
        <button
          onClick={() => setTab("pending")}
          className={`px-4 py-2 rounded ${tab === "pending" ? "bg-indigo-100" : ""}`}
        >
          Pending
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Pharmacy</th>
              <th className="p-3 text-left">Owner</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Docs</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(tab === "approved" ? approved : pending).map(p => (
              <tr key={p._id} className="border-t">
                <td className="p-3">{p.pharmacyName}</td>
                <td className="p-3">{p.ownerName}</td>
                <td className="p-3">{p.email}</td>
                <td className="p-3">
                  {p.documents?.length ? (
                    <button
                      onClick={() => setOpenDocs(p.documents || [])}
                      className="px-3 py-1 bg-blue-100 rounded"
                    >
                      View Docs
                    </button>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="p-3 space-x-2">
                  {p.approved ? (
                    <>
                      <button
                        onClick={() => unapprove(p._id)}
                        className="px-3 py-1 bg-yellow-100 rounded"
                      >
                        Unapprove
                      </button>
                      <button
                        onClick={() => remove(p._id)}
                        className="px-3 py-1 bg-red-100 rounded"
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => approve(p._id)}
                        className="px-3 py-1 bg-green-600 text-white rounded"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => remove(p._id)}
                        className="px-3 py-1 bg-red-600 text-white rounded"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}

            {!loading && !(tab === "approved" ? approved : pending).length && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* DOCUMENT MODAL */}
      {openDocs && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded max-w-lg w-full">
            <h3 className="font-bold mb-4">Verification Documents</h3>

            <div className="space-y-4 max-h-96 overflow-auto">
              {openDocs.map((d, i) => (
                <div key={i} className="border p-3 rounded">
                  <p className="text-sm font-medium mb-2">{d.name}</p>

                  {d.type.startsWith("image") ? (
                    <img
                      src={d.url}
                      alt={d.name}
                      className="max-h-60 rounded border"
                    />
                  ) : (
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Open document
                    </a>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setOpenDocs(null)}
              className="mt-4 px-4 py-2 bg-gray-800 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
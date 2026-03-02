"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function PharmacyLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    if (!email || !password) {
      alert("Enter email and password");
      return;
    }

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        role: "pharmacy",
        redirect: false,
      });

      if (result?.error) {
        alert("Invalid credentials or account not approved");
        return;
      }

      router.push("/pharmacyDashboard");
      router.refresh();
    } catch (err) {
      console.error("Pharmacy login error:", err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="min-h-[70vh] flex items-center justify-center bg-cream px-6 py-12">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-dark mb-2">Pharmacy Login</h1>
        <p className="text-sm text-gray-600 mb-6">
          Manage prescriptions, stock and orders.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="pharmacy@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-dark text-cream py-2 rounded hover:bg-green transition disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Don’t have an account?{" "}
          <Link href="/pharmacies/register" className="text-green font-semibold hover:underline">
            Register as a Pharmacy
          </Link>
        </p>
      </div>
    </section>
  );
}
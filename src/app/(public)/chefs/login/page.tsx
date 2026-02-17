"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function ChefLoginPage() {
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
        role: "chef", // 🔥 ADDED ROLE PARAMETER
        redirect: false,
      });

      console.log("🔐 Chef login result:", result);

      if (result?.error) {
        alert("Invalid credentials or account not approved");
        return;
      }

      router.push("/chefDashboard");
      router.refresh();
      
    } catch (err) {
      console.error("Chef login error:", err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="min-h-[70vh] flex items-center justify-center bg-cream px-6 py-12">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-dark mb-2">Chef Login</h1>
        <p className="text-sm text-gray-600 mb-6">
          Manage orders, menu and earnings.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="chef@example.com"
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

          {/* Debug info */}
          <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
            <p className="font-semibold">🔍 Debug Info:</p>
            <p>Email: <code>chikafavourchisom@gmail.com</code></p>
            <p>Role being sent: <strong>chef</strong></p>
            <p>Expected chef ID: <code>696b7595d13d0ca193c05f75</code></p>
            <p>Expected balance: ₦7,000</p>
          </div>
        </form>
      </div>
    </section>
  );
}
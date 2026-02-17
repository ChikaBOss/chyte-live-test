// app/debug/page.tsx
import DebugSplit from "@/components/DebugSplit";

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🔧 Payment Split Debugger</h1>
        <p className="text-gray-600 mb-6">Test your split logic without Paystack complexity</p>
        <DebugSplit />
      </div>
    </div>
  );
}
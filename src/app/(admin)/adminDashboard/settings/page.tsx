'use client';

import { useEffect, useState } from 'react';

interface PlatformSettings {
  commissionPercentage: number;
  minimumWithdrawal: number;
  withdrawalFee: number;
  platformFee: number;
  taxPercentage: number;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ✅ FETCH SETTINGS
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to load settings');
        }

        setSettings(data.settings);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // ✅ SAVE SETTINGS
  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save settings');
      }

      setSuccess('Settings updated successfully');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="p-6">Loading settings...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-600">{error}</p>;
  }

  if (!settings) {
    return <p className="p-6">No settings found.</p>;
  }

  return (
    <div className="max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Platform Settings</h1>

      {success && <p className="text-green-600">{success}</p>}

      <div className="space-y-4">
        <Input
          label="Commission Percentage (%)"
          value={settings.commissionPercentage}
          onChange={(v) =>
            setSettings({ ...settings, commissionPercentage: v })
          }
        />

        <Input
          label="Minimum Withdrawal"
          value={settings.minimumWithdrawal}
          onChange={(v) =>
            setSettings({ ...settings, minimumWithdrawal: v })
          }
        />

        <Input
          label="Withdrawal Fee"
          value={settings.withdrawalFee}
          onChange={(v) =>
            setSettings({ ...settings, withdrawalFee: v })
          }
        />

        <Input
          label="Platform Fee"
          value={settings.platformFee}
          onChange={(v) =>
            setSettings({ ...settings, platformFee: v })
          }
        />

        <Input
          label="Tax Percentage (%)"
          value={settings.taxPercentage}
          onChange={(v) =>
            setSettings({ ...settings, taxPercentage: v })
          }
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-2 bg-black text-white rounded disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
}

/**
 * 🔹 Reusable input component
 */
function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full border rounded px-3 py-2"
      />
    </div>
  );
}
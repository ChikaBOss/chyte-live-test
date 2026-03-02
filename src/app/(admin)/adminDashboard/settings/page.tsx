'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface PlatformSettings {
  commissionPercentage: number;
  minimumWithdrawal: number;
  platformFee: number; // service fee on checkout
}

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Email change state
  const [newEmail, setNewEmail] = useState('');
  const [passwordForEmail, setPasswordForEmail] = useState('');
  const [changingEmail, setChangingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to load settings');
        }

        setSettings({
          commissionPercentage: data.commissionPercentage ?? 0,
          minimumWithdrawal: data.minimumWithdrawal ?? 0,
          platformFee: data.platformFee ?? 0,
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Save platform settings
  const handleSaveSettings = async () => {
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

  // Change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setChangingPassword(true);

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      setPasswordSuccess('Password changed successfully');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  // Change email (requires current password)
  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setEmailSuccess(null);

    if (!passwordForEmail) {
      setEmailError('Password is required');
      return;
    }

    setChangingEmail(true);

    try {
      const res = await fetch('/api/admin/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail, password: passwordForEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update email');
      }

      setEmailSuccess('Email updated successfully');
      setNewEmail('');
      setPasswordForEmail('');
    } catch (err: unknown) {
      setEmailError(err instanceof Error ? err.message : 'Failed to update email');
    } finally {
      setChangingEmail(false);
    }
  };

  if (loading) {
    return <p className="p-6">Loading settings...</p>;
  }

  if (error && !settings) {
    return <p className="p-6 text-red-600">{error}</p>;
  }

  if (!settings) {
    return <p className="p-6">No settings found.</p>;
  }

  return (
    <div className="max-w-3xl p-4 md:p-6 space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold">Platform Settings</h1>

      {/* Platform Settings */}
      <div className="space-y-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold">Commission & Fees</h2>

        {success && <p className="text-green-600">{success}</p>}
        {error && <p className="text-red-600">{error}</p>}

        <div className="space-y-4">
          <Input
            label="Commission Percentage (%)"
            value={settings.commissionPercentage}
            onChange={(v) =>
              setSettings({ ...settings, commissionPercentage: v })
            }
          />

          <Input
            label="Minimum Withdrawal (₦)"
            value={settings.minimumWithdrawal}
            onChange={(v) =>
              setSettings({ ...settings, minimumWithdrawal: v })
            }
          />

          <Input
            label="Platform Fee (%) – service fee on checkout"
            value={settings.platformFee}
            onChange={(v) =>
              setSettings({ ...settings, platformFee: v })
            }
          />
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-6 py-2 bg-black text-white rounded disabled:opacity-50 hover:bg-gray-800 transition"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Change Password */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>

        {passwordSuccess && <p className="text-green-600 mb-4">{passwordSuccess}</p>}
        {passwordError && <p className="text-red-600 mb-4">{passwordError}</p>}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={changingPassword}
            className="px-6 py-2 bg-black text-white rounded disabled:opacity-50 hover:bg-gray-800 transition"
          >
            {changingPassword ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Change Email */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Change Email</h2>
        <p className="text-sm text-gray-600 mb-4">
          Current email: <strong>{session?.user?.email}</strong>
        </p>

        {emailSuccess && <p className="text-green-600 mb-4">{emailSuccess}</p>}
        {emailError && <p className="text-red-600 mb-4">{emailError}</p>}

        <form onSubmit={handleChangeEmail} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">New Email</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirm with Password</label>
            <input
              type="password"
              value={passwordForEmail}
              onChange={(e) => setPasswordForEmail(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={changingEmail}
            className="px-6 py-2 bg-black text-white rounded disabled:opacity-50 hover:bg-gray-800 transition"
          >
            {changingEmail ? 'Updating...' : 'Update Email'}
          </button>
        </form>
      </div>
    </div>
  );
}

/**
 * Reusable numeric input component
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
        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        step="0.01"
        min="0"
      />
    </div>
  );
}
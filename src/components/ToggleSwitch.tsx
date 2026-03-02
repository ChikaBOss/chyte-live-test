'use client';

interface ToggleSwitchProps {
  isOn: boolean;
  onToggle: () => void;
  label?: string;
}

export default function ToggleSwitch({ isOn, onToggle, label }: ToggleSwitchProps) {
  return (
    <div className="flex items-center gap-3">
      {label && <span className="text-sm text-gray-600">{label}</span>}
      <button
        type="button"
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          isOn ? 'bg-blue-600' : 'bg-red-500'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isOn ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
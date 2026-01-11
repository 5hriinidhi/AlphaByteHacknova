import { useState } from 'react';
import { MousePointer2 } from 'lucide-react';

interface BigClickZonesProps {
  enabled: boolean;
}

export function BigClickZones({ enabled }: BigClickZonesProps) {
  const [isActive, setIsActive] = useState(true);

  if (!enabled) return null;

  return (
    <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MousePointer2 className="w-5 h-5 text-teal-600" />
          <span className="text-sm font-medium text-teal-900">Big Click Zones</span>
        </div>
        <button
          onClick={() => setIsActive(!isActive)}
          className={`px-3 py-1 rounded transition text-sm ${
            isActive
              ? 'bg-teal-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          {isActive ? 'Active' : 'Inactive'}
        </button>
      </div>
      {isActive && (
        <style>
          {`
            button, a, input, select, textarea {
              min-height: 48px !important;
              min-width: 48px !important;
              padding: 12px 24px !important;
              font-size: 16px !important;
            }
          `}
        </style>
      )}
    </div>
  );
}

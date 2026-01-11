import { useState } from 'react';
import { Target, Eye, EyeOff } from 'lucide-react';

interface FocusTunnelProps {
  enabled: boolean;
  children: React.ReactNode;
}

export function FocusTunnel({ enabled, children }: FocusTunnelProps) {
  const [isActive, setIsActive] = useState(false);

  if (!enabled) return <>{children}</>;

  return (
    <div className="relative">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-900">Focus Tunnel Mode</span>
          </div>
          <button
            onClick={() => setIsActive(!isActive)}
            className={`flex items-center gap-2 px-3 py-1 rounded transition text-sm ${
              isActive
                ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {isActive ? (
              <>
                <Eye className="w-4 h-4" />
                <span>Active</span>
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4" />
                <span>Inactive</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className={isActive ? 'relative z-10' : ''}>
        {isActive && (
          <div className="fixed inset-0 bg-black bg-opacity-70 pointer-events-none z-0" />
        )}
        <div className={isActive ? 'relative z-20 bg-white rounded-lg' : ''}>
          {children}
        </div>
      </div>
    </div>
  );
}

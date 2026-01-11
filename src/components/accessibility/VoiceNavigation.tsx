import { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceNavigationProps {
  enabled: boolean;
}

export function VoiceNavigation({ enabled }: VoiceNavigationProps) {
  const [isListening, setIsListening] = useState(false);
  const [command, setCommand] = useState('');

  if (!enabled) return null;

  const toggleVoiceControl = () => {
    if (isListening) {
      setIsListening(false);
      setCommand('');
    } else {
      setIsListening(true);
      setTimeout(() => {
        setCommand('Simulated voice command: "Go to assignments"');
      }, 1000);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white rounded-lg shadow-xl border-2 border-blue-500 p-4 min-w-[250px]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-900">Voice Navigation</span>
          </div>
          <button
            onClick={toggleVoiceControl}
            className={`p-2 rounded-full transition ${
              isListening
                ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        </div>
        {isListening && (
          <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
            {command || 'Listening...'}
          </div>
        )}
        <div className="mt-3 text-xs text-gray-500">
          Try: "Go to dashboard", "Read assignments", "Open settings"
        </div>
      </div>
    </div>
  );
}

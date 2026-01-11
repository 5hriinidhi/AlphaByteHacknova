import { useState } from 'react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';

interface SemanticReaderProps {
  content: string;
  enabled: boolean;
}

export function SemanticReader({ content, enabled }: SemanticReaderProps) {
  const [isReading, setIsReading] = useState(false);
  const [rate, setRate] = useState(1.0);

  if (!enabled) return null;

  const speak = () => {
    if ('speechSynthesis' in window) {
      if (isReading) {
        window.speechSynthesis.cancel();
        setIsReading(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(content);
        utterance.rate = rate;
        utterance.onend = () => setIsReading(false);
        window.speechSynthesis.speak(utterance);
        setIsReading(true);
      }
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">Semantic Reader</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-blue-700">Speed:</label>
            <select
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="text-xs border border-blue-300 rounded px-2 py-1 bg-white"
            >
              <option value="0.5">0.5x</option>
              <option value="0.75">0.75x</option>
              <option value="1.0">1.0x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
            </select>
          </div>
          <button
            onClick={speak}
            className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
          >
            {isReading ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Read Aloud</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

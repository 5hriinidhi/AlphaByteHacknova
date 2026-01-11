import { useEffect, useState, useRef } from 'react';
import { Subtitles, Mic, MicOff } from 'lucide-react';
import { DeepgramClient } from '../../lib/deepgram';

interface LiveCaptionsProps {
  enabled: boolean;
  onCaptionUpdate?: (text: string) => void;
}

export function LiveCaptions({ enabled, onCaptionUpdate }: LiveCaptionsProps) {
  const [isListening, setIsListening] = useState(false);
  const [caption, setCaption] = useState('');
  const [emotionTag, setEmotionTag] = useState<string | null>(null);
  const clientRef = useRef<DeepgramClient | null>(null);

  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.stop();
      }
    };
  }, []);

  if (!enabled) return null;

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      if (clientRef.current) {
        clientRef.current.stop();
        clientRef.current = null;
      }
      setCaption('');
      setEmotionTag(null);
    } else {
      setIsListening(true);
      setCaption('Connecting to Live Captions...');

      clientRef.current = new DeepgramClient(
        (text, _isFinal) => {
          setCaption(prev => {
            // Limited buffer size for UI
            const newText = prev + (prev && !prev.endsWith(' ') ? ' ' : '') + text;
            return newText.length > 500 ? '...' + newText.slice(-500) : newText;
          });

          if (onCaptionUpdate) {
            onCaptionUpdate(text);
          }

          // Simple emotion detection
          const currentText = text.toLowerCase();
          if (currentText.includes('happy') || currentText.includes('great')) setEmotionTag('Positive');
          else if (currentText.includes('sad') || currentText.includes('sorry')) setEmotionTag('Concerned');
          else if (currentText.includes('?')) setEmotionTag('Curious');
        },
        (error) => {
          console.error(error);
          setIsListening(false);
          setEmotionTag(null);

          if (error.includes('MUTED')) {
            setCaption('⚠️ Microphone is MUTED. Please check your system settings.');
          } else {
            setCaption(`Error: ${error}`);
          }
        }
      );

      clientRef.current.start();
    }
  };

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Subtitles className="w-5 h-5 text-purple-600" />
          <span className="text-sm font-medium text-purple-900">Live Captions (iFlytek)</span>
        </div>
        <button
          onClick={toggleListening}
          className={`flex items-center gap-2 px-3 py-1 rounded transition text-sm ${isListening
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-4 h-4" />
              <span>Stop</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              <span>Start</span>
            </>
          )}
        </button>
      </div>
      {isListening && (
        <div className="space-y-2">
          <div className="bg-white border border-purple-300 rounded p-3 min-h-[60px]">
            <p className="text-sm text-gray-700">{caption}</p>
          </div>
          {emotionTag && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-purple-700">Emotion:</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                {emotionTag}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

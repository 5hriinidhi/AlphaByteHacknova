import { useState } from 'react';
import { Image as ImageIcon, Loader2 } from 'lucide-react';

interface AIImageDescriberProps {
  enabled: boolean;
}

export function AIImageDescriber({ enabled }: AIImageDescriberProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  if (!enabled) return null;

  const analyzeImage = async () => {
    if (!imageUrl) return;

    setLoading(true);
    setTimeout(() => {
      setDescription(
        'This is a simulated AI image description. In production, this would use Gemini Vision API to analyze the image and provide a detailed description of its contents, including objects, people, text, colors, and context.'
      );
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <ImageIcon className="w-5 h-5 text-green-600" />
        <span className="text-sm font-medium text-green-900">AI Image Descriptions</span>
      </div>
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Paste image URL to analyze"
            className="flex-1 px-3 py-2 border border-green-300 rounded text-sm"
          />
          <button
            onClick={analyzeImage}
            disabled={loading || !imageUrl}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Analyze
          </button>
        </div>
        {description && (
          <div className="bg-white border border-green-300 rounded p-3 text-sm text-gray-700">
            {description}
          </div>
        )}
      </div>
    </div>
  );
}

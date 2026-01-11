import { useState } from 'react';
import { Zap } from 'lucide-react';

interface BionicReadingProps {
  enabled: boolean;
  text: string;
}

export function BionicReading({ enabled, text }: BionicReadingProps) {
  const [isActive, setIsActive] = useState(true);

  if (!enabled) return <p className="text-gray-700">{text}</p>;

  const applyBionicReading = (text: string) => {
    const words = text.split(' ');
    return words.map((word, index) => {
      const boldLength = Math.ceil(word.length / 2);
      const boldPart = word.slice(0, boldLength);
      const normalPart = word.slice(boldLength);

      return (
        <span key={index}>
          <strong className="font-bold">{boldPart}</strong>
          {normalPart}
          {index < words.length - 1 ? ' ' : ''}
        </span>
      );
    });
  };

  return (
    <div>
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-900">Bionic Reading</span>
          </div>
          <button
            onClick={() => setIsActive(!isActive)}
            className={`px-3 py-1 rounded transition text-sm ${
              isActive
                ? 'bg-orange-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {isActive ? 'Active' : 'Inactive'}
          </button>
        </div>
      </div>
      <div className="text-gray-700 leading-relaxed">
        {isActive ? applyBionicReading(text) : text}
      </div>
    </div>
  );
}

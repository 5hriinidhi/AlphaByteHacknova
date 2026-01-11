import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { SemanticReader } from './accessibility/SemanticReader';
import { AIImageDescriber } from './accessibility/AIImageDescriber';
import { LiveCaptions } from './accessibility/LiveCaptions';
import { FocusTunnel } from './accessibility/FocusTunnel';
import { BionicReading } from './accessibility/BionicReading';
import { VoiceNavigation } from './accessibility/VoiceNavigation';
import { BigClickZones } from './accessibility/BigClickZones';
import { DocumentDropzone } from './DocumentDropzone';


export function AdaptiveContent() {
  const { accessibilitySettings } = useAuth();
  const [content, setContent] = useState(`Learning is a lifelong journey that transforms us in countless ways. Every student has unique strengths and challenges, and adaptive technology helps create an inclusive environment where everyone can thrive. By personalizing the learning experience, we can ensure that every student has equal access to knowledge and opportunities for growth.`);

  if (!accessibilitySettings) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
      <SemanticReader
        content={content}
        enabled={accessibilitySettings.semantic_reader_enabled}
      />

      <AIImageDescriber enabled={accessibilitySettings.ai_image_descriptions_enabled} />

      <LiveCaptions
        enabled={accessibilitySettings.live_captions_enabled}
        onCaptionUpdate={(text) => setContent(prev => prev + ' ' + text)}
      />

      <BigClickZones enabled={accessibilitySettings.big_click_zones_enabled} />

      <FocusTunnel enabled={accessibilitySettings.focus_tunnel_enabled}>
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <DocumentDropzone onTextExtracted={setContent} />

          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sample Learning Content</h2>

          {accessibilitySettings.bionic_reading_enabled ? (
            <BionicReading enabled={true} text={content} />
          ) : (
            <p className="text-gray-700 leading-relaxed mb-6">{content}</p>
          )}


        </div>
      </FocusTunnel>

      <VoiceNavigation enabled={accessibilitySettings.voice_navigation_enabled} />
    </div>
  );
}

import { useState } from 'react';
import { Settings, Volume2, Subtitles, Target, Zap, Mic, MousePointer2, Image as ImageIcon, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface AdaptiveToolbarProps {
  onStartTutorial?: () => void;
}

export function AdaptiveToolbar({ onStartTutorial }: AdaptiveToolbarProps) {
  const { student, accessibilitySettings, refreshProfile } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!student || !accessibilitySettings) return null;

  const toggleSetting = async (setting: keyof typeof accessibilitySettings, value: boolean) => {
    setIsSaving(true);
    await supabase
      .from('accessibility_settings')
      .update({ [setting]: value, updated_at: new Date().toISOString() })
      .eq('student_id', student.id);

    await refreshProfile();
    setIsSaving(false);
  };

  const updateFontSize = async (size: number) => {
    setIsSaving(true);
    await supabase
      .from('accessibility_settings')
      .update({ font_size: size, updated_at: new Date().toISOString() })
      .eq('student_id', student.id);

    document.documentElement.style.fontSize = `${size}px`;
    await refreshProfile();
    setIsSaving(false);
  };

  const features = [
    {
      key: 'semantic_reader_enabled',
      icon: Volume2,
      label: 'Semantic Reader',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      key: 'ai_image_descriptions_enabled',
      icon: ImageIcon,
      label: 'AI Image Descriptions',
      color: 'bg-green-100 text-green-600'
    },
    {
      key: 'live_captions_enabled',
      icon: Subtitles,
      label: 'Live Captions',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      key: 'emotion_tags_enabled',
      icon: Subtitles,
      label: 'Emotion Tags',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      key: 'focus_tunnel_enabled',
      icon: Target,
      label: 'Focus Tunnel',
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      key: 'bionic_reading_enabled',
      icon: Zap,
      label: 'Bionic Reading',
      color: 'bg-orange-100 text-orange-600'
    },
    {
      key: 'voice_navigation_enabled',
      icon: Mic,
      label: 'Voice Navigation',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      key: 'big_click_zones_enabled',
      icon: MousePointer2,
      label: 'Big Click Zones',
      color: 'bg-teal-100 text-teal-600'
    }
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm" data-tour="toolbar">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Adaptive Toolbar</span>
            {isSaving && (
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onStartTutorial}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Help / Tutorial</span>
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              {isExpanded ? (
                <>
                  <span>Collapse</span>
                  <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Expand Settings</span>
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="pb-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                const isEnabled = accessibilitySettings[feature.key as keyof typeof accessibilitySettings];

                return (
                  <button
                    key={feature.key}
                    onClick={() => toggleSetting(feature.key as keyof typeof accessibilitySettings, !isEnabled as boolean)}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition ${isEnabled
                      ? `${feature.color} border-current`
                      : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{feature.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Font Size:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateFontSize(Math.max(12, accessibilitySettings.font_size - 2))}
                  className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition text-sm"
                >
                  A-
                </button>
                <span className="text-sm font-medium min-w-[3rem] text-center">
                  {accessibilitySettings.font_size}px
                </span>
                <button
                  onClick={() => updateFontSize(Math.min(24, accessibilitySettings.font_size + 2))}
                  className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition text-sm"
                >
                  A+
                </button>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Contrast:</span>
                <select
                  value={accessibilitySettings.contrast_mode}
                  onChange={(e) => {
                    supabase
                      .from('accessibility_settings')
                      .update({ contrast_mode: e.target.value, updated_at: new Date().toISOString() })
                      .eq('student_id', student.id)
                      .then(() => refreshProfile());
                  }}
                  className="px-3 py-1 bg-white border border-gray-300 rounded text-sm"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="inverted">Inverted</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

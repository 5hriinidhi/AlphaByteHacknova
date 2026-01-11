import { LectureFlowChart } from './LectureFlowChart';
import { TopicInsightsChart } from './TopicInsightsChart';
import { AISuggestions } from './AISuggestions';
import { ChevronLeft } from 'lucide-react';

interface LectureInsightsViewProps {
    onBack: () => void;
    topicTitle: string;
}

export function LectureInsightsView({ onBack, topicTitle }: LectureInsightsViewProps) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-4 mb-4">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{topicTitle}</h2>
                    <p className="text-sm text-gray-500">Detailed performance & insights</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LectureFlowChart />
                <TopicInsightsChart />
            </div>

            <div className="h-[400px]">
                <AISuggestions />
            </div>
        </div>
    );
}

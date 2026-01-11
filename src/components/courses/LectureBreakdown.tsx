import { ChevronDown, PlayCircle, FileText, CheckCircle2 } from 'lucide-react';

interface Topic {
    id: string;
    title: string;
    type: 'video' | 'exercise' | 'reading';
    completed: boolean;
}

interface Module {
    id: string;
    title: string;
    number: string;
    topics: Topic[];
}

interface LectureBreakdownProps {
    onTopicSelect: (topic: Topic) => void;
}

export function LectureBreakdown({ onTopicSelect }: LectureBreakdownProps) {
    const modules: Module[] = [
        {
            id: 'm1',
            title: 'Introduction to Basics',
            number: '1.1',
            topics: [
                { id: 't1', title: 'Alphabets & Sounds', type: 'video', completed: true },
                { id: 't2', title: 'First Words', type: 'exercise', completed: true },
            ]
        },
        {
            id: 'm2',
            title: 'Building Sentences',
            number: '1.2',
            topics: [
                { id: 't3', title: 'Action Verbs', type: 'video', completed: false },
                { id: 't4', title: 'Simple Sentences', type: 'reading', completed: false },
                { id: 't5', title: 'Match the Word', type: 'exercise', completed: false },
            ]
        }
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Lecture Breakdown</h3>

            <div className="space-y-6">
                {modules.map((module) => (
                    <div key={module.id} className="relative pl-6 border-l-2 border-gray-100 last:border-0 pb-6 last:pb-0">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-purple-100 border-2 border-purple-600" />

                        <div className="mb-3">
                            <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-md">{module.number}</span>
                            <h4 className="text-base font-bold text-gray-900 mt-1">{module.title}</h4>
                        </div>

                        <div className="space-y-2">
                            {module.topics.map((topic) => (
                                <div
                                    key={topic.id}
                                    onClick={() => onTopicSelect(topic)}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer"
                                >
                                    <div className={`p-1.5 rounded-full ${topic.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                        {topic.completed ? <CheckCircle2 className="w-4 h-4" /> :
                                            topic.type === 'video' ? <PlayCircle className="w-4 h-4" /> :
                                                topic.type === 'exercise' ? <FileText className="w-4 h-4" /> :
                                                    <FileText className="w-4 h-4" />
                                        }
                                    </div>
                                    <span className={`text-sm ${topic.completed ? 'text-gray-500 line-through' : 'text-gray-700 font-medium'}`}>
                                        {topic.title}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

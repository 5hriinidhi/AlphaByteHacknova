import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

export function CalendarWidget() {
    const upcomingLessons = [
        { id: 1, subject: 'Electronics', time: '10:00 AM', color: 'bg-blue-100 text-blue-700' },
        { id: 2, subject: 'Robotics', time: '11:30 AM', color: 'bg-purple-100 text-purple-700' },
        { id: 3, subject: 'C++', time: '02:00 PM', color: 'bg-green-100 text-green-700' },
    ];

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900">January 2025</h3>
                <div className="flex gap-2">
                    <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <ChevronLeft className="w-4 h-4 text-gray-500" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                    </button>
                </div>
            </div>

            {/* Simple Calendar Grid Mockup */}
            <div className="grid grid-cols-7 gap-2 mb-8 text-center text-sm">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                    <div key={day} className="text-gray-400 font-medium">{day}</div>
                ))}
                {Array.from({ length: 31 }).map((_, i) => (
                    <button
                        key={i}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${i + 1 === 15
                                ? 'bg-[#2D3091] text-white shadow-md'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wider">Upcoming Lessons</h4>
                <div className="space-y-3">
                    {upcomingLessons.map((lesson) => (
                        <div key={lesson.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                            <div className={`p-2 rounded-lg ${lesson.color}`}>
                                <Clock className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">{lesson.subject}</p>
                                <p className="text-xs text-gray-500">{lesson.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

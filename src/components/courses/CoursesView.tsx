import { useState } from 'react';
import { CourseCard } from './CourseCard';
import { LectureBreakdown } from './LectureBreakdown';
import { UploadWidget } from './UploadWidget';
import { LectureInsightsView } from '../insights/LectureInsightsView';
import { Filter, AppWindow } from 'lucide-react';

export function CoursesView() {
    const [activeCourse, setActiveCourse] = useState<string | null>(null);
    const [activeTopic, setActiveTopic] = useState<{ id: string; title: string } | null>(null);

    const courses = [
        { id: 'c1', title: 'Operating System', description: 'Understanding process management and memory allocation.', instructor: 'Dr. Sarah Smith', color: 'bg-orange-500' },
        { id: 'c2', title: 'Data Structures', description: 'Advanced algorithms and tree manipulations.', instructor: 'Prof. Alan Turing', color: 'bg-blue-500' },
        { id: 'c3', title: 'Web Accessibility', description: 'Building inclusive digital experiences for all users.', instructor: 'Jane Doe', color: 'bg-purple-500' },
    ];

    return (
        <div className="space-y-8">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    {!activeCourse ? 'All Courses' : (
                        <>
                            <button
                                onClick={() => {
                                    setActiveCourse(null);
                                    setActiveTopic(null);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                Courses
                            </button>
                            <span className="text-gray-300">/</span>
                            <span>{courses.find(c => c.id === activeCourse)?.title}</span>
                            {activeTopic && (
                                <>
                                    <span className="text-gray-300">/</span>
                                    <span className="text-gray-600">{activeTopic.title}</span>
                                </>
                            )}
                        </>
                    )}
                </h2>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                        <Filter className="w-4 h-4" />
                        Filter
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#2D3091] text-white rounded-lg text-sm font-medium hover:bg-[#1a1c5f]">
                        <AppWindow className="w-4 h-4" />
                        New Course
                    </button>
                </div>
            </div>

            {!activeCourse ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <UploadWidget />
                    {courses.map(course => (
                        <CourseCard
                            key={course.id}
                            title={course.title}
                            description={course.description}
                            instructor={course.instructor}
                            imageColor={course.color}
                            onNext={() => setActiveCourse(course.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <LectureBreakdown onTopicSelect={(topic) => setActiveTopic(topic)} />
                    </div>
                    <div className="lg:col-span-2 space-y-6">
                        {!activeTopic ? (
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[400px]">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Lesson Content</h3>
                                <p className="text-gray-500 mb-6">Select a topic from the breakdown to view content.</p>
                                <UploadWidget />
                            </div>
                        ) : (
                            <LectureInsightsView
                                topicTitle={activeTopic.title}
                                onBack={() => setActiveTopic(null)}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

import { ChevronRight, Monitor, Cpu, Code } from 'lucide-react';

interface CourseListProps {
    onNavigate: (item: string) => void;
}

export function CourseList({ onNavigate }: CourseListProps) {
    const courses = [
        {
            id: 1,
            title: 'Operating System',
            description: 'Learn the basic operating system abstractions, mechanisms, and their implementations.',
            icon: Monitor,
            color: 'bg-blue-100 text-blue-600',
        },
        {
            id: 2,
            title: 'Artificial Intelligence',
            description: 'Intelligence demonstrated by machines, unlike the natural intelligence displayed by humans and animals.',
            icon: Cpu,
            color: 'bg-purple-100 text-purple-600',
        },
        {
            id: 3,
            title: 'Software Engineering',
            description: 'Learn detailed of engineering to the design, development and maintenance of software.',
            icon: Code,
            color: 'bg-pink-100 text-pink-600',
        }
    ];

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">My Courses</h2>
                <div className="flex gap-2">
                    {/* Filter place holders as per design, functionality can be added later if requested */}
                </div>
            </div>

            <div className="space-y-4">
                {courses.map((course) => (
                    <div key={course.id} className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition duration-200">
                        <div className={`p-4 rounded-xl ${course.color}`}>
                            <course.icon className="w-8 h-8" />
                        </div>

                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900">{course.title}</h3>
                            <p className="text-sm text-gray-500 mt-1 max-w-xl">{course.description}</p>
                        </div>

                        <button
                            onClick={() => onNavigate('content')}
                            className="p-3 bg-white hover:bg-purple-600 hover:text-white text-purple-600 rounded-full shadow-sm transition-all duration-200 group"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

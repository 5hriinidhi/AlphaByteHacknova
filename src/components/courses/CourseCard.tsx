import { MoreVertical, ChevronRight } from 'lucide-react';

interface CourseCardProps {
    title: string;
    description: string;
    instructor: string;
    imageColor: string;
    onNext: () => void;
}

export function CourseCard({ title, description, instructor, imageColor, onNext }: CourseCardProps) {
    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-2xl ${imageColor} flex items-center justify-center text-white font-bold text-xl`}>
                    {title.charAt(0)}
                </div>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <MoreVertical className="w-5 h-5" />
                </button>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#2D3091] transition-colors">{title}</h3>
            <p className="text-gray-500 text-sm mb-6 line-clamp-2">{description}</p>

            <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200" /> {/* Placeholder for avatar */}
                    <span className="text-sm font-medium text-gray-700">{instructor}</span>
                </div>

                <button
                    onClick={onNext}
                    className="w-10 h-10 rounded-full bg-[#f0f0f8] text-[#2D3091] flex items-center justify-center hover:bg-[#2D3091] hover:text-white transition-all transform hover:rotate-[-45deg]"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

import { UploadCloud } from 'lucide-react';

export function UploadWidget() {
    return (
        <div className="border-2 border-dashed border-gray-300 rounded-3xl p-8 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group text-center flex flex-col items-center justify-center min-h-[200px]">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Upload Course Material</h3>
            <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
                Drag and drop your video lectures, PDFs, or assignments here.
            </p>
            <button className="mt-4 px-6 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 shadow-sm group-hover:border-purple-200 group-hover:text-purple-700 transition-colors">
                Browse Files
            </button>
        </div>
    );
}

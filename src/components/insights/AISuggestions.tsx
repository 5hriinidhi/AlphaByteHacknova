import { Send, Sparkles, Bot } from 'lucide-react';

export function AISuggestions() {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gradient-to-r from-purple-50 to-white">
                <div className="p-2 bg-purple-100 rounded-lg">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900">AI Teaching Assistant</h3>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex-shrink-0 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="bg-gray-50 p-3 rounded-2xl rounded-tl-none text-sm text-gray-700">
                        Based on the recent quiz results, 30% of students struggled with "Action Verbs". I recommend reviewing this topic with a visual aid.
                    </div>
                </div>

                <div className="flex gap-3 flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-600">ME</span>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-2xl rounded-tr-none text-sm text-blue-900">
                        Can you suggest a visual activity for this?
                    </div>
                </div>

                <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex-shrink-0 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="bg-gray-50 p-3 rounded-2xl rounded-tl-none text-sm text-gray-700">
                        Certainly! Try a "Charades" game where students act out verbs. Alternatively, use flashcards with action images.
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-gray-100">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Ask for suggestions..."
                        className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm"
                    />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm">
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

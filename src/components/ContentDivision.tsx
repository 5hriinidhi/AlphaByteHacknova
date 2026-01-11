import { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Loader2, ChevronDown, ChevronRight, BookOpen, AlertCircle, ArrowRight, ArrowLeft, Brain, Calendar, History } from 'lucide-react';
import { extractTextFromPDF } from '../lib/pdfUtils';
import { generateContentDivision, ContentDivisionResponse } from '../lib/gemini.ts';
import { LiveClassroom } from './LiveClassroom';
import { supabase, Lecture } from '../lib/supabase';
import { TopicStats } from '../lib/lectureTypes';

export function ContentDivision() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [content, setContent] = useState<ContentDivisionResponse | null>(null);
    const [expandedTopics, setExpandedTopics] = useState<Record<number, boolean>>({});
    const [showLiveSession, setShowLiveSession] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Persistence State
    const [lectures, setLectures] = useState<Lecture[]>([]);
    const [viewingHistory, setViewingHistory] = useState<TopicStats[] | undefined>(undefined);

    useEffect(() => {
        fetchLectures();
    }, []);

    const fetchLectures = async () => {
        const { data, error } = await supabase
            .from('lectures')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching lectures:', error);
        } else {
            setLectures(data || []);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type !== 'application/pdf') {
                setError('Please upload a valid PDF file.');
                return;
            }
            setFile(selectedFile);
            setError(null);
            setContent(null);
        }
    };

    const handleProcess = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);

        try {
            setStatus('Extracting text from PDF...');
            const text = await extractTextFromPDF(file);

            if (!text || text.trim().length === 0) {
                throw new Error('Could not extract text from the PDF. It might be an image-based PDF.');
            }

            setStatus('Analyzing content with Gemini AI...');
            const result = await generateContentDivision(text);

            setContent(result);
            // Expand all topics by default
            const initialExpanded: Record<number, boolean> = {};
            result.topics.forEach((_, index) => {
                initialExpanded[index] = true;
            });
            setExpandedTopics(initialExpanded);
            setViewingHistory(undefined); // Ensure we are not in view-only mode

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'An error occurred while processing the file.');
        } finally {
            setLoading(false);
            setStatus('');
        }
    };

    const handleSessionComplete = async (history: TopicStats[]) => {
        if (!content || !file) return;

        try {
            const { error } = await supabase
                .from('lectures')
                .insert({
                    title: file.name.replace('.pdf', ''),
                    content: content,
                    stats: history
                });

            if (error) throw error;

            // Refresh list
            fetchLectures();
        } catch (err) {
            console.error('Error saving lecture:', err);
        }
    };

    const handleViewLecture = (lecture: Lecture) => {
        setContent(lecture.content);
        setViewingHistory(lecture.stats);

        // Expand all topics
        const initialExpanded: Record<number, boolean> = {};
        lecture.content.topics.forEach((_: any, index: number) => {
            initialExpanded[index] = true;
        });
        setExpandedTopics(initialExpanded);

        setShowLiveSession(true);
    };

    const toggleTopic = (index: number) => {
        setExpandedTopics(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    if (showLiveSession) {
        return (
            <div className="space-y-6">
                <button
                    onClick={() => {
                        setShowLiveSession(false);
                        if (viewingHistory) {
                            // If we were viewing history, clear content to go back to main list
                            setContent(null);
                            setViewingHistory(undefined);
                        }
                    }}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors px-2"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Content
                </button>
                <LiveClassroom
                    content={content}
                    initialHistory={viewingHistory}
                    onSessionComplete={viewingHistory ? undefined : handleSessionComplete}
                />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 min-h-[600px] relative">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-100 rounded-full">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Content Division</h2>
                        <p className="text-gray-500">Upload study material to auto-generate topics and subtopics</p>
                    </div>
                </div>

                {!content && (
                    <div className="max-w-xl mx-auto mt-12">
                        <div
                            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${file ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                                }`}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".pdf"
                                className="hidden"
                            />

                            <div className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center">
                                    {file ? (
                                        <FileText className="w-8 h-8 text-blue-600" />
                                    ) : (
                                        <Upload className="w-8 h-8 text-gray-400" />
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {file ? file.name : 'Upload Study Material'}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'PDF files only'}
                                    </p>
                                </div>

                                {!file && (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                    >
                                        Select PDF
                                    </button>
                                )}

                                {file && !loading && (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                setFile(null);
                                                if (fileInputRef.current) fileInputRef.current.value = '';
                                            }}
                                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                        >
                                            Change
                                        </button>
                                        <button
                                            onClick={handleProcess}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                                        >
                                            <Brain className="w-4 h-4" />
                                            Generate Topics
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {loading && (
                            <div className="mt-8 text-center">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
                                <p className="text-gray-600 font-medium">{status}</p>
                            </div>
                        )}

                        {error && (
                            <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <p>{error}</p>
                            </div>
                        )}
                    </div>
                )}

                {content && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Generated Content Structure</h3>
                            <button
                                onClick={() => setContent(null)}
                                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                            >
                                Upload Another File
                            </button>
                        </div>

                        <div className="space-y-4">
                            {content.topics.map((topic, index) => (
                                <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => toggleTopic(index)}
                                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition text-left"
                                    >
                                        <span className="font-semibold text-gray-800 text-lg">{index + 1}. {topic.title}</span>
                                        {expandedTopics[index] ? (
                                            <ChevronDown className="w-5 h-5 text-gray-500" />
                                        ) : (
                                            <ChevronRight className="w-5 h-5 text-gray-500" />
                                        )}
                                    </button>

                                    {expandedTopics[index] && (
                                        <div className="p-4 bg-white border-t border-gray-200">
                                            <ul className="space-y-2">
                                                {topic.subtopics.map((subtopic, subIndex) => (
                                                    <li key={subIndex} className="flex items-start gap-3 p-2 hover:bg-blue-50 rounded-lg transition">
                                                        <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 shrink-0" />
                                                        <span className="text-gray-700">{subtopic}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Next Button Floating Action */}
                        <button
                            onClick={() => setShowLiveSession(true)}
                            className="fixed bottom-8 right-8 px-6 py-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 text-lg font-semibold transition-all hover:scale-105 active:scale-95 flex items-center gap-2 z-10"
                        >
                            Start Live Session
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Previous Lectures Section */}
            {!content && lectures.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-indigo-100 rounded-full">
                            <History className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Previous Lectures</h2>
                            <p className="text-gray-500">View analytics from past sessions</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lectures.map((lecture) => (
                            <div key={lecture.id} className="border border-gray-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Brain className="w-16 h-16 text-indigo-600" />
                                </div>

                                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 pr-4">{lecture.title}</h3>

                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                                    <Calendar className="w-4 h-4" />
                                    <span>{new Date(lecture.created_at).toLocaleDateString()}</span>
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center gap-2">
                                        <div className="text-sm font-medium text-gray-700">
                                            {lecture.stats.length} Topics Covered
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleViewLecture(lecture)}
                                        className="text-indigo-600 font-medium text-sm hover:underline flex items-center gap-1"
                                    >
                                        View Report <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}


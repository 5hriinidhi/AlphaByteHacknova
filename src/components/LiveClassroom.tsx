import { useState, useEffect } from 'react';
import mqtt from 'mqtt';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    LineChart, Line, Legend
} from 'recharts';
import { Users, Activity, CheckCircle, XCircle, ArrowRight, BookOpen, Brain } from 'lucide-react';
import { ContentDivisionResponse } from '../lib/gemini';
import { TopicStats } from '../lib/lectureTypes';

interface StudentResponse {
    id: string;
    response: 'GREEN' | 'RED';
    timestamp: number;
}

interface LiveClassroomProps {
    content?: ContentDivisionResponse | null;
    initialHistory?: TopicStats[];
    onSessionComplete?: (history: TopicStats[]) => void;
}

export function LiveClassroom({ content, initialHistory, onSessionComplete }: LiveClassroomProps) {
    const [responses, setResponses] = useState<Record<string, StudentResponse>>({});
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

    // Session State
    const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
    const [currentSubtopicIndex, setCurrentSubtopicIndex] = useState(0);
    const [sessionHistory, setSessionHistory] = useState<TopicStats[]>(initialHistory || []);
    const [isSessionComplete, setIsSessionComplete] = useState(!!initialHistory);

    useEffect(() => {
        // If viewing history, don't connect to MQTT
        if (!!initialHistory) {
            setConnectionStatus('disconnected');
            return;
        }

        const clientId = 'emqx_react_' + Math.random().toString(16).substring(2, 8);
        const host = 'ws://broker.hivemq.com:8000/mqtt';

        console.log('Connecting to MQTT broker:', host);
        const client = mqtt.connect(host, {
            clientId,
            clean: true,
            connectTimeout: 4000,
            reconnectPeriod: 1000,
        });

        client.on("connect", () => {
            console.log("Connected to MQTT");
            setConnectionStatus('connected');
            client.subscribe("classroom/feedback", (err) => {
                if (err) {
                    console.error("Subscription error:", err);
                } else {
                    console.log("Subscribed to classroom/feedback");
                }
            });
        });

        client.on("message", (topic: string, message: any) => {
            if (topic === "classroom/feedback") {
                try {
                    const data = JSON.parse(message.toString());
                    // Expected format: { student_id: "123", response: "GREEN" | "RED" }
                    if (data.student_id && data.response) {
                        setResponses(prev => ({
                            ...prev,
                            [data.student_id]: {
                                id: data.student_id,
                                response: data.response,
                                timestamp: Date.now()
                            }
                        }));
                    }
                } catch (e) {
                    console.error("Error parsing MQTT message:", e);
                }
            }
        });

        client.on("close", () => {
            setConnectionStatus('disconnected');
        });

        client.on("error", (err: any) => {
            console.error("MQTT Error:", err);
            setConnectionStatus('disconnected');
        });

        return () => {
            if (client.connected) {
                client.end();
            }
        };
    }, [initialHistory]);

    // Calculate current stats
    const currentStats = Object.values(responses).reduce(
        (acc, curr) => {
            if (curr.response === 'GREEN') acc.green++;
            else if (curr.response === 'RED') acc.red++;
            return acc;
        },
        { green: 0, red: 0 }
    );

    const handleNext = () => {
        if (!content) return;

        const currentTopic = content.topics[currentTopicIndex];
        const currentSubtopic = currentTopic.subtopics[currentSubtopicIndex];
        const totalStudents = currentStats.green + currentStats.red;

        // Save history
        const stats: TopicStats = {
            topic: currentTopic.title,
            subtopic: currentSubtopic,
            green: currentStats.green,
            red: currentStats.red,
            total: totalStudents,
            understandingPercentage: totalStudents > 0 ? (currentStats.green / totalStudents) * 100 : 0
        };

        const newHistory = [...sessionHistory, stats];
        setSessionHistory(newHistory);
        setResponses({}); // Reset for next topic

        // Calculate next indices
        if (currentSubtopicIndex < currentTopic.subtopics.length - 1) {
            setCurrentSubtopicIndex(prev => prev + 1);
        } else if (currentTopicIndex < content.topics.length - 1) {
            setCurrentTopicIndex(prev => prev + 1);
            setCurrentSubtopicIndex(0);
        } else {
            setIsSessionComplete(true);
            if (onSessionComplete) {
                onSessionComplete(newHistory);
            }
        }
    };

    const activeChartData = [
        { name: 'Understood', value: currentStats.green, color: '#22c55e' },
        { name: 'Confused', value: currentStats.red, color: '#ef4444' }
    ];

    if (isSessionComplete) {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Brain className="w-6 h-6 text-indigo-600" />
                        Lecture Flow Analysis
                    </h2>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sessionHistory} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="subtopic"
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                    interval={0}
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis domain={[0, 100]} label={{ value: 'Understanding %', angle: -90, position: 'insideLeft' }} />
                                <Tooltip />
                                <Legend verticalAlign="top" />
                                <Line
                                    type="monotone"
                                    dataKey="understandingPercentage"
                                    name="Understanding Level"
                                    stroke="#4f46e5"
                                    strokeWidth={3}
                                    dot={{ r: 6, fill: "#4f46e5", strokeWidth: 2 }}
                                    activeDot={{ r: 8 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Topic Insights</h2>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sessionHistory} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="subtopic"
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                    interval={0}
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="green" name="Understood" stackId="a" fill="#22c55e" />
                                <Bar dataKey="red" name="Confused" stackId="a" fill="#ef4444" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                        <h4 className="font-semibold text-gray-800 mb-1">AI Insight:</h4>
                        <p className="text-gray-700">
                            Based on the student responses, reviewing
                            <span className="font-bold"> {[...sessionHistory].sort((a, b) => a.understandingPercentage - b.understandingPercentage)[0]?.subtopic} </span>
                            might be beneficial as it had the lowest understanding rate.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 animate-in fade-in zoom-in duration-300 relative">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-100 rounded-full">
                        <Activity className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Live Classroom Feedback</h2>
                        {content && (
                            <div className="mt-2 flex items-center gap-2 text-indigo-600 font-medium">
                                <BookOpen className="w-4 h-4" />
                                <span>Topic {currentTopicIndex + 1}.{currentSubtopicIndex + 1}: {content.topics[currentTopicIndex].subtopics[currentSubtopicIndex]}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
                            <p className="text-sm text-gray-500 capitalize">{connectionStatus} API</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span className="font-semibold">{Object.keys(responses).length}</span>
                        <span className="text-sm">Active Students</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Graph Section */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Real-time Comprehension</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={activeChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={60}>
                                    {activeChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-8 mt-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            <span className="text-sm font-medium text-gray-700">Understood: {currentStats.green}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <span className="text-sm font-medium text-gray-700">Confused: {currentStats.red}</span>
                        </div>
                    </div>
                </div>

                {/* Student List Section */}
                <div className="bg-white rounded-xl border border-gray-200 flex flex-col h-[450px]">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                        <h3 className="font-semibold text-gray-800">Student Responses</h3>
                    </div>
                    <div className="overflow-y-auto flex-1 p-2">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-white">
                                <tr>
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-500 bg-white border-b border-gray-100">Student ID</th>
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-500 bg-white border-b border-gray-100 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.values(responses).map((student) => (
                                    <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4 text-gray-900 font-mono text-sm">{student.id}</td>
                                        <td className="py-3 px-4 text-right">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${student.response === 'GREEN'
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : 'bg-red-50 text-red-700 border-red-200'
                                                }`}>
                                                {student.response === 'GREEN' ? (
                                                    <><CheckCircle className="w-3 h-3" /> Understood</>
                                                ) : (
                                                    <><XCircle className="w-3 h-3" /> Confused</>
                                                )}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {Object.keys(responses).length === 0 && (
                                    <tr>
                                        <td colSpan={2} className="py-12 text-center text-gray-400">
                                            Waiting for data...
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Next Button */}
            {content && (
                <div className="absolute bottom-6 right-6">
                    <button
                        onClick={handleNext}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 font-semibold"
                    >
                        Next Topic
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
}

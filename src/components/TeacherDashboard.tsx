import { useState } from 'react';
import {
    UserPlus,
    Search,
    Activity,
    Eye,
    Ear,
    Brain,
    Accessibility,
    CheckCircle,
    XCircle,
    BookOpen,
    BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DisabilityType, Severity, supabase, Lecture } from '../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardHome } from './dashboard/DashboardHome';
import { ContentDivision } from './ContentDivision';

import { Layout } from './layout/Layout';

export function TeacherDashboard() {
    const { registerStudent, allStudents, assignDisabilityProfile } = useAuth();
    const [activeSidebarItem, setActiveSidebarItem] = useState('dashboard');
    const [activeStudentTab, setActiveStudentTab] = useState<'register' | 'manage'>('register');

    // Registration Form State
    const [newStudentName, setNewStudentName] = useState('');
    const [newStudentRoll, setNewStudentRoll] = useState('');
    const [newStudentEmail, setNewStudentEmail] = useState('');
    const [registerStatus, setRegisterStatus] = useState<{ success?: boolean; message?: string } | null>(null);
    const [isRegistering, setIsRegistering] = useState(false);

    // Management State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [selectedDisabilities, setSelectedDisabilities] = useState<Record<string, Severity>>({});
    const [assignStatus, setAssignStatus] = useState<{ success?: boolean; message?: string } | null>(null);
    const [isAssigning, setIsAssigning] = useState(false);

    // Insights State
    const [selectedStudentForInsights, setSelectedStudentForInsights] = useState<string | null>(null);
    const [insightsSubject, setInsightsSubject] = useState<string>('Operating System');
    const [insightsData, setInsightsData] = useState<any[]>([]);
    const [isLoadingInsights, setIsLoadingInsights] = useState(false);

    const fetchInsights = async (subject: string) => {
        setIsLoadingInsights(true);
        try {
            const { data, error } = await supabase
                .from('lectures')
                .select('*')
                .ilike('title', `%${subject}%`)
                .order('created_at', { ascending: true });

            if (error) throw error;

            if (data) {
                const formattedData = data.map((lecture: Lecture) => {
                    // Calculate average understanding for this lecture
                    // Assuming lecture.stats is TopicStats[]
                    const stats = lecture.stats || [];
                    if (stats.length === 0) return null;

                    const avgUnderstanding = stats.reduce((acc: number, curr: any) => acc + curr.understandingPercentage, 0) / stats.length;
                    const avgConfused = stats.reduce((acc: number, curr: any) => acc + (100 - curr.understandingPercentage), 0) / stats.length;

                    return {
                        name: new Date(lecture.created_at).toLocaleDateString(),
                        understood: Math.round(avgUnderstanding),
                        confused: Math.round(avgConfused)
                    };
                }).filter(Boolean);
                setInsightsData(formattedData);
            }
        } catch (err) {
            console.error('Error fetching insights:', err);
            setInsightsData([]);
        } finally {
            setIsLoadingInsights(false);
        }
    };

    const filteredStudents = allStudents.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.roll_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleDisability = (type: DisabilityType) => {
        setSelectedDisabilities(prev => {
            const next = { ...prev };
            if (next[type]) {
                delete next[type];
            } else {
                next[type] = 'moderate';
            }
            return next;
        });
    };

    const updateSeverity = (type: DisabilityType, severity: Severity) => {
        setSelectedDisabilities(prev => ({
            ...prev,
            [type]: severity
        }));
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsRegistering(true);
        setRegisterStatus(null);

        try {
            await registerStudent({
                name: newStudentName,
                roll_number: newStudentRoll,
                email: newStudentEmail
            });
            setRegisterStatus({ success: true, message: 'Student registered successfully' });
            setNewStudentName('');
            setNewStudentRoll('');
            setNewStudentEmail('');
        } catch (error) {
            setRegisterStatus({ success: false, message: 'Failed to register student' });
        } finally {
            setIsRegistering(false);
        }
    };

    const handleAssignDisability = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudentId || Object.keys(selectedDisabilities).length === 0) return;

        setIsAssigning(true);
        try {
            await Promise.all(
                Object.entries(selectedDisabilities).map(([type, severity]) =>
                    assignDisabilityProfile(selectedStudentId, type as DisabilityType, severity)
                )
            );

            setAssignStatus({ success: true, message: 'Profiles assigned successfully' });
            setTimeout(() => {
                setSelectedStudentId(null);
                setAssignStatus(null);
                setSelectedDisabilities({});
            }, 1000);
        } catch (error) {
            setAssignStatus({ success: false, message: 'Failed to assign profiles' });
        } finally {
            setIsAssigning(false);
        }
    };

    const renderContent = () => {
        switch (activeSidebarItem) {
            case 'dashboard':
                return <DashboardHome onNavigate={setActiveSidebarItem} />;
            case 'students':
                return (
                    <div className="space-y-6">
                        {/* Student Sub-navigation */}
                        <div className="flex gap-4 border-b border-gray-200 pb-1">
                            <button
                                onClick={() => setActiveStudentTab('register')}
                                className={`pb-3 px-2 text-sm font-medium transition-colors relative ${activeStudentTab === 'register' ? 'text-purple-600' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Register Students
                                {activeStudentTab === 'register' && (
                                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-600 rounded-t-full" />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveStudentTab('manage')}
                                className={`pb-3 px-2 text-sm font-medium transition-colors relative ${activeStudentTab === 'manage' ? 'text-purple-600' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Manage Disabilities
                                {activeStudentTab === 'manage' && (
                                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-600 rounded-t-full" />
                                )}
                            </button>
                        </div>

                        {activeStudentTab === 'register' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-purple-100 rounded-full">
                                        <UserPlus className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">Register New Student</h2>
                                        <p className="text-gray-500">Add a new student to the system</p>
                                    </div>
                                </div>

                                <form onSubmit={handleRegister} className="space-y-6 max-w-2xl">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                            <input
                                                type="text"
                                                value={newStudentName}
                                                onChange={(e) => setNewStudentName(e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                                                placeholder="e.g. Rahul Verma"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Roll Number</label>
                                            <input
                                                type="text"
                                                value={newStudentRoll}
                                                onChange={(e) => setNewStudentRoll(e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                                                placeholder="e.g. 2024005"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address (Optional)</label>
                                        <input
                                            type="email"
                                            value={newStudentEmail}
                                            onChange={(e) => setNewStudentEmail(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                                            placeholder="e.g. rahul@example.com"
                                        />
                                    </div>

                                    {registerStatus && (
                                        <div className={`p-4 rounded-lg flex items-center gap-3 ${registerStatus.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                            }`}>
                                            {registerStatus.success ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                            <span>{registerStatus.message}</span>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isRegistering}
                                        className="w-full md:w-auto px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isRegistering ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                <span>Registering...</span>
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="w-5 h-5" />
                                                <span>Register Student</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        )}

                        {activeStudentTab === 'manage' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-purple-100 rounded-full">
                                            <Accessibility className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900">Manage Disabilities</h2>
                                            <p className="text-gray-500">Assign disability profiles to students</p>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Search students..."
                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none w-full md:w-64"
                                        />
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Roll No</th>
                                                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Name</th>
                                                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Insights</th>
                                                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredStudents.map((student) => (
                                                <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                                    <td className="py-3 px-4 text-gray-900">{student.roll_number}</td>
                                                    <td className="py-3 px-4 text-gray-900 font-medium">{student.name}</td>
                                                    <td className="py-3 px-4">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedStudentForInsights(student.id);
                                                                setInsightsSubject('Operating System');
                                                                fetchInsights('Operating System');
                                                            }}
                                                            className="text-gray-500 hover:text-purple-600 transition-colors"
                                                            title="View Insights"
                                                        >
                                                            <BarChart3 className="w-5 h-5" />
                                                        </button>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <button
                                                            onClick={() => setSelectedStudentId(student.id)}
                                                            className="text-purple-600 hover:text-purple-800 font-medium text-sm flex items-center gap-1"
                                                        >
                                                            <Activity className="w-4 h-4" />
                                                            Assign Profile
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredStudents.length === 0 && (
                                                <tr>
                                                    <td colSpan={3} className="py-8 text-center text-gray-500">
                                                        No students found matching "{searchTerm}"
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        {/* Assignment Modal */}
                        {selectedStudentId && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                                <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in duration-200">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-gray-900">Assign Disability Profile</h3>
                                        <button
                                            onClick={() => {
                                                setSelectedStudentId(null);
                                                setAssignStatus(null);
                                            }}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <XCircle className="w-6 h-6" />
                                        </button>
                                    </div>

                                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Assigning profile for:</p>
                                        <p className="font-bold text-gray-900 text-lg">
                                            {allStudents.find(s => s.id === selectedStudentId)?.name}
                                        </p>
                                    </div>

                                    <form onSubmit={handleAssignDisability} className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-4">Select Disabilities & Severity</label>
                                            <div className="space-y-4">
                                                {[
                                                    { id: 'visually_impaired', label: 'Visual Impairment', icon: Eye },
                                                    { id: 'hearing_impaired', label: 'Hearing Impairment', icon: Ear },
                                                    { id: 'adhd', label: 'ADHD', icon: Brain },
                                                    { id: 'motor_disabilities', label: 'Motor Disability', icon: Accessibility },
                                                ].map((type) => {
                                                    const isSelected = !!selectedDisabilities[type.id];
                                                    const currentSeverity = selectedDisabilities[type.id] || 'moderate';

                                                    return (
                                                        <div
                                                            key={type.id}
                                                            className={`p-4 rounded-xl border-2 transition-all ${isSelected
                                                                ? 'border-purple-600 bg-purple-50'
                                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                                                }`}
                                                        >
                                                            <div className="flex items-center justify-between mb-3">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleDisability(type.id as DisabilityType)}
                                                                    className="flex items-center gap-3 text-left w-full"
                                                                >
                                                                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-purple-200 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
                                                                        <type.icon className="w-5 h-5" />
                                                                    </div>
                                                                    <span className={`font-semibold ${isSelected ? 'text-purple-900' : 'text-gray-700'}`}>
                                                                        {type.label}
                                                                    </span>
                                                                </button>
                                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected
                                                                    ? 'border-purple-600 bg-purple-600'
                                                                    : 'border-gray-300'
                                                                    }`}>
                                                                    {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                                                                </div>
                                                            </div>

                                                            {isSelected && (
                                                                <div className="ml-12 animate-in fade-in slide-in-from-top-2">
                                                                    <label className="text-xs font-semibold text-purple-800 uppercase tracking-wider mb-2 block">Severity Level</label>
                                                                    <div className="flex gap-2">
                                                                        {['mild', 'moderate', 'severe'].map((level) => (
                                                                            <button
                                                                                key={level}
                                                                                type="button"
                                                                                onClick={() => updateSeverity(type.id as DisabilityType, level as Severity)}
                                                                                className={`flex-1 py-1.5 text-xs font-medium rounded-md border transition capitalize ${currentSeverity === level
                                                                                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                                                                                    : 'bg-white text-gray-600 border-purple-200 hover:bg-purple-100'
                                                                                    }`}
                                                                            >
                                                                                {level}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {assignStatus && (
                                            <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${assignStatus.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                                }`}>
                                                {assignStatus.success ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                                <span>{assignStatus.message}</span>
                                            </div>
                                        )}

                                        <div className="flex gap-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedStudentId(null);
                                                    setAssignStatus(null);
                                                    setSelectedDisabilities({});
                                                }}
                                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isAssigning || Object.keys(selectedDisabilities).length === 0}
                                                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isAssigning ? 'Saving...' : 'Save Profiles'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Insights Modal */}
                        {selectedStudentForInsights && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                                <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full p-6 animate-in fade-in zoom-in duration-200">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">Student Insights</h3>
                                            <p className="text-gray-500">
                                                Performance analysis for <span className="font-semibold text-gray-900">{allStudents.find(s => s.id === selectedStudentForInsights)?.name}</span>
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setSelectedStudentForInsights(null)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <XCircle className="w-6 h-6" />
                                        </button>
                                    </div>

                                    {/* Subject Tabs */}
                                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                                        {['Operating System', 'Artificial Intelligence', 'Software Engineering'].map((subject) => (
                                            <button
                                                key={subject}
                                                onClick={() => {
                                                    setInsightsSubject(subject);
                                                    fetchInsights(subject);
                                                }}
                                                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${insightsSubject === subject
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {subject}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Chart Area */}
                                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 min-h-[400px]">
                                        {isLoadingInsights ? (
                                            <div className="h-full flex flex-col items-center justify-center text-gray-500">
                                                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4" />
                                                Loading insights...
                                            </div>
                                        ) : insightsData.length > 0 ? (
                                            <div className="h-[350px] w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={insightsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} unit="%" />
                                                        <Tooltip
                                                            cursor={{ fill: '#f3f4f6' }}
                                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                        />
                                                        <Legend />
                                                        <Bar name="Understood" dataKey="understood" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} />
                                                        <Bar name="Confused" dataKey="confused" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={20} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                                <Activity className="w-12 h-12 mb-4 opacity-20" />
                                                <p className="text-lg font-medium">No data available for {insightsSubject}</p>
                                                <p className="text-sm mt-2">Create and complete a lecture titled "{insightsSubject}" to see data here.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'content':
                return <ContentDivision />;
            default:
                return (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="w-8 h-8 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Module Under Construction</h2>
                        <p className="text-gray-500 mt-2">The {activeSidebarItem} module is coming soon.</p>
                    </div>
                );
        }
    };

    return (
        <Layout activeItem={activeSidebarItem} onNavigate={setActiveSidebarItem}>
            {renderContent()}
        </Layout>
    );
}

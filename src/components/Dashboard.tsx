import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, LearningHealthRecord, ClassroomFeedback, RemedialAssignment } from '../lib/supabase';
import { BookOpen, TrendingUp, MessageSquare, ClipboardList, LogOut, Video, FileText } from 'lucide-react';

export function Dashboard() {
  const { student, disabilityProfiles, accessibilitySettings, logout } = useAuth();
  const [learningRecords, setLearningRecords] = useState<LearningHealthRecord[]>([]);
  const [feedback, setFeedback] = useState<ClassroomFeedback[]>([]);
  const [assignments, setAssignments] = useState<RemedialAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (student) {
      loadDashboardData();
    }
  }, [student]);

  const loadDashboardData = async () => {
    if (!student) return;

    const [recordsResult, feedbackResult, assignmentsResult] = await Promise.all([
      supabase
        .from('learning_health_records')
        .select('*')
        .eq('student_id', student.id)
        .order('recorded_at', { ascending: false })
        .limit(10),
      supabase
        .from('classroom_feedback')
        .select('*')
        .eq('student_id', student.id)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('remedial_assignments')
        .select('*')
        .eq('student_id', student.id)
        .order('created_at', { ascending: false })
    ]);

    if (recordsResult.data) setLearningRecords(recordsResult.data);
    if (feedbackResult.data) setFeedback(feedbackResult.data);
    if (assignmentsResult.data) setAssignments(assignmentsResult.data);

    setLoading(false);
  };

  const calculateAverageScore = (records: LearningHealthRecord[], field: keyof LearningHealthRecord) => {
    if (records.length === 0) return 0;
    const sum = records.reduce((acc, record) => acc + Number(record[field]), 0);
    return Math.round(sum / records.length);
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600 bg-green-50';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const avgComprehension = calculateAverageScore(learningRecords, 'comprehension_score');
  const avgEngagement = calculateAverageScore(learningRecords, 'engagement_score');
  const avgConfusion = calculateAverageScore(learningRecords, 'confusion_level');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome, {student?.name}</h1>
              <p className="text-sm text-gray-600 mt-1">Roll Number: {student?.roll_number}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {disabilityProfiles.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Active Accessibility Profiles</h3>
            <div className="flex flex-wrap gap-2">
              {disabilityProfiles.map((profile) => (
                <span
                  key={profile.id}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {profile.disability_type.replace('_', ' ')} ({profile.severity})
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Comprehension</p>
                <p className={`text-3xl font-bold mt-2 ${getScoreColor(avgComprehension)}`}>
                  {avgComprehension}%
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Engagement</p>
                <p className={`text-3xl font-bold mt-2 ${getScoreColor(avgEngagement)}`}>
                  {avgEngagement}%
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confusion Level</p>
                <p className={`text-3xl font-bold mt-2 ${getScoreColor(100 - avgConfusion)}`}>
                  {avgConfusion}%
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-4 px-1">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Reading Materials</h3>
            <p className="text-sm text-gray-600">
              Access adaptive reading materials with customizable fonts and text-to-speech support.
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
              <Video className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Video Lessons</h3>
            <p className="text-sm text-gray-600">
              Watch video content with live captions, emotion tags, and adjustable playback speeds.
            </p>
          </div>

          <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Interactive Exercises</h3>
            <p className="text-sm text-gray-600">
              Complete exercises with voice navigation, larger click zones, and AI-powered hints.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                Remedial Assignments
              </h2>
            </div>
            <div className="p-6">
              {assignments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No assignments yet</p>
              ) : (
                <div className="space-y-4">
                  {assignments.slice(0, 5).map((assignment) => (
                    <div key={assignment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{assignment.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(assignment.status)}`}>
                          {assignment.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Topic: {assignment.topic}</span>
                        <span>Level: {assignment.difficulty_level}</span>
                        {assignment.score && <span>Score: {assignment.score}%</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Recent Feedback
              </h2>
            </div>
            <div className="p-6">
              {feedback.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No feedback yet</p>
              ) : (
                <div className="space-y-4">
                  {feedback.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {item.feedback_type}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{item.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

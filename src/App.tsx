import { useAuth } from './contexts/AuthContext';
import { KioskLogin } from './components/KioskLogin';
import { TeacherDashboard } from './components/TeacherDashboard';
import { isSupabaseConfigured } from './lib/supabase';
import { AlertTriangle, Settings } from 'lucide-react';

function App() {
  const { teacher, loading } = useAuth();

  // Fail-safe check for environment variables
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-8 border border-red-100">
          <div className="flex items-center gap-4 mb-6 text-red-600">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold">Configuration Required</h1>
          </div>

          <p className="text-gray-600 mb-6 text-lg">
            The application cannot start because it's missing the connection to Supabase.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="flex items-center gap-2 font-semibold text-blue-900 mb-3">
              <Settings className="w-5 h-5" />
              Action Required in Vercel
            </h3>
            <p className="text-sm text-blue-800 mb-4">
              Please go to your Vercel Project Settings {'>'} Environment Variables and add these keys:
            </p>
            <ul className="space-y-2 font-mono text-sm">
              <li className="bg-white px-3 py-2 rounded border border-blue-200 text-gray-700">
                VITE_SUPABASE_URL
              </li>
              <li className="bg-white px-3 py-2 rounded border border-blue-200 text-gray-700">
                VITE_SUPABASE_ANON_KEY
              </li>
            </ul>
          </div>

          <p className="text-sm text-gray-500 text-center">
            After saving these variables in Vercel, you must <strong>Redeploy</strong> your project.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (teacher) {
    return <TeacherDashboard />;
  }

  return <KioskLogin />;
}

export default App;

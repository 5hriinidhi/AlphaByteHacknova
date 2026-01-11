import { useAuth } from './contexts/AuthContext';
import { KioskLogin } from './components/KioskLogin';
import { Dashboard } from './components/Dashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { AdaptiveToolbar } from './components/AdaptiveToolbar';
import { AdaptiveContent } from './components/AdaptiveContent';
import { UniBuddy } from './components/UniBuddy';
import { TutorialOverlay } from './components/TutorialOverlay';
import { useState } from 'react';
import { LayoutDashboard, BookOpen } from 'lucide-react';

function App() {
  const { student, teacher, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'content'>('dashboard');
  const [showTutorial, setShowTutorial] = useState(false);

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

  if (!student) {
    return <KioskLogin />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdaptiveToolbar onStartTutorial={() => setShowTutorial(true)} />

      <TutorialOverlay isOpen={showTutorial} onClose={() => setShowTutorial(false)} />

      <div className="pt-16">
        <div className="bg-white border-b border-gray-200" data-tour="navigation">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex gap-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${currentView === 'dashboard'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </button>
              <button
                onClick={() => setCurrentView('content')}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${currentView === 'content'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                <BookOpen className="w-5 h-5" />
                <span className="font-medium">Learning Content</span>
              </button>
            </nav>
          </div>
        </div>

        <div data-tour="content">
          {currentView === 'dashboard' ? <Dashboard /> : <AdaptiveContent />}
        </div>
      </div>

      <div data-tour="unibuddy">
        <UniBuddy />
      </div>
    </div>
  );
}

export default App;

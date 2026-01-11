import { useState } from 'react';
import { LogIn, User, GraduationCap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function KioskLogin() {
  const [isTeacherLogin, setIsTeacherLogin] = useState(true);
  const [rollNumber, setRollNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginWithRollNumber, loginAsTeacher } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let result;
    if (isTeacherLogin) {
      result = await loginAsTeacher(password);
    } else {
      result = await loginWithRollNumber(rollNumber);
    }

    if (!result.success) {
      setError(result.error || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className={`w-16 h-16 ${isTeacherLogin ? 'bg-purple-600' : 'bg-blue-600'} rounded-full flex items-center justify-center mb-4 transition-colors duration-300`}>
              {isTeacherLogin ? (
                <GraduationCap className="w-8 h-8 text-white" />
              ) : (
                <User className="w-8 h-8 text-white" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900">SaralClass</h1>
            <p className="text-gray-600 mt-2">{isTeacherLogin ? 'Teacher Access Portal' : 'Kiosk Login System'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isTeacherLogin ? (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-lg"
                  placeholder="Enter admin password"
                  required
                  autoFocus
                />
              </div>
            ) : (
              <div>
                <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Roll Number
                </label>
                <input
                  id="rollNumber"
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-lg"
                  placeholder="Enter your roll number"
                  required
                  autoFocus
                />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${isTeacherLogin ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'} text-white py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>{isTeacherLogin ? 'Login as Teacher' : 'Login'}</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                setIsTeacherLogin(!isTeacherLogin);
                setError('');
                setRollNumber('');
                setPassword('');
              }}
              className="w-full text-sm text-gray-500 hover:text-gray-700 text-center underline"
            >
              {isTeacherLogin ? 'Back to Student Login' : 'Login as Teacher'}
            </button>
            {!isTeacherLogin && (
              <p className="text-xs text-gray-400 text-center mt-4">
                Your personalized accessibility settings will load automatically upon login
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, Student, DisabilityProfile, AccessibilitySettings } from '../lib/supabase';
import { mockStudents, mockDisabilityProfiles, mockAccessibilitySettings } from '../lib/mockData';

interface AuthContextType {
  student: Student | null;
  teacher: boolean;
  disabilityProfiles: DisabilityProfile[];
  accessibilitySettings: AccessibilitySettings | null;
  loading: boolean;
  loginWithRollNumber: (rollNumber: string) => Promise<{ success: boolean; error?: string }>;
  loginAsTeacher: (password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  registerStudent: (studentData: Omit<Student, 'id' | 'created_at' | 'last_login'>) => Promise<{ success: boolean; error?: string }>;
  assignDisabilityProfile: (studentId: string, profileData: Omit<DisabilityProfile, 'id' | 'created_at' | 'updated_at' | 'student_id'>) => Promise<{ success: boolean; error?: string }>;
  allStudents: Student[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [teacher, setTeacher] = useState<boolean>(false);
  const [disabilityProfiles, setDisabilityProfiles] = useState<DisabilityProfile[]>([]);
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Local state for new students and profiles to simulate persistence in this session
  const [localStudents, setLocalStudents] = useState<Student[]>([]);
  const [localProfiles, setLocalProfiles] = useState<DisabilityProfile[]>([]);

  // Derived state for all students
  const allStudents = [...mockStudents, ...localStudents];

  const loadStudentProfile = async (studentId: string) => {
    try {
      const [profilesResult, settingsResult] = await Promise.all([
        supabase
          .from('disability_profiles')
          .select('*')
          .eq('student_id', studentId),
        supabase
          .from('accessibility_settings')
          .select('*')
          .eq('student_id', studentId)
          .maybeSingle()
      ]);

      if (profilesResult.data && profilesResult.data.length > 0) {
        setDisabilityProfiles(profilesResult.data);
      } else {
        // Fallback to mock data + local data
        const mockProfiles = mockDisabilityProfiles.filter((p: DisabilityProfile) => p.student_id === studentId);
        const newLocalProfiles = localProfiles.filter(p => p.student_id === studentId);
        setDisabilityProfiles([...mockProfiles, ...newLocalProfiles]);
      }

      if (settingsResult.data) {
        setAccessibilitySettings(settingsResult.data);
      } else {
        // Fallback to mock data
        const mockSettings = mockAccessibilitySettings.find((s: AccessibilitySettings) => s.student_id === studentId);
        if (mockSettings) {
          setAccessibilitySettings(mockSettings);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Fallback to mock data + local data on error
      const mockProfiles = mockDisabilityProfiles.filter((p: DisabilityProfile) => p.student_id === studentId);
      const newLocalProfiles = localProfiles.filter(p => p.student_id === studentId);
      setDisabilityProfiles([...mockProfiles, ...newLocalProfiles]);

      const mockSettings = mockAccessibilitySettings.find((s: AccessibilitySettings) => s.student_id === studentId);
      if (mockSettings) {
        setAccessibilitySettings(mockSettings);
      }
    }
  };

  const loginWithRollNumber = async (rollNumber: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('roll_number', rollNumber)
        .maybeSingle();

      let studentToLogin = studentData;

      if (studentError || !studentData) {
        // Try to find in mock data
        const mockStudent = mockStudents.find((s: Student) => s.roll_number === rollNumber);
        // Try to find in local data
        const localStudent = localStudents.find(s => s.roll_number === rollNumber);

        if (mockStudent) {
          studentToLogin = mockStudent;
        } else if (localStudent) {
          studentToLogin = localStudent;
        } else {
          return { success: false, error: 'Invalid roll number' };
        }
      }

      if (studentToLogin) {
        // Only try to update Supabase if we have a real connection and it's not a local/mock student
        if (studentData) {
          await supabase
            .from('students')
            .update({ last_login: new Date().toISOString() })
            .eq('id', studentToLogin.id);
        }

        setStudent(studentToLogin);
        setTeacher(false);
        await loadStudentProfile(studentToLogin.id);
        return { success: true };
      }

      return { success: false, error: 'Invalid roll number' };
    } catch (error) {
      console.error('Login error:', error);
      // Fallback to mock/local data check on error
      const mockStudent = mockStudents.find((s: Student) => s.roll_number === rollNumber);
      const localStudent = localStudents.find(s => s.roll_number === rollNumber);

      if (mockStudent) {
        setStudent(mockStudent);
        setTeacher(false);
        await loadStudentProfile(mockStudent.id);
        return { success: true };
      } else if (localStudent) {
        setStudent(localStudent);
        setTeacher(false);
        await loadStudentProfile(localStudent.id);
        return { success: true };
      }
      return { success: false, error: 'Login failed' };
    }
  };

  const loginAsTeacher = async (password: string): Promise<{ success: boolean; error?: string }> => {
    // Simple hardcoded password for prototype
    if (password === 'admin123') {
      setTeacher(true);
      setStudent(null);
      return { success: true };
    }
    return { success: false, error: 'Invalid password' };
  };

  const registerStudent = async (studentData: Omit<Student, 'id' | 'created_at' | 'last_login'>): Promise<{ success: boolean; error?: string }> => {
    try {
      // Check if roll number exists in mock or local
      if (mockStudents.some(s => s.roll_number === studentData.roll_number) ||
        localStudents.some(s => s.roll_number === studentData.roll_number)) {
        return { success: false, error: 'Roll number already exists' };
      }

      const newStudent: Student = {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        ...studentData
      };

      // In a real app, we would insert into Supabase here
      // const { error } = await supabase.from('students').insert(newStudent);

      // For now, store locally
      setLocalStudents(prev => [...prev, newStudent]);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  };

  const assignDisabilityProfile = async (studentId: string, profileData: Omit<DisabilityProfile, 'id' | 'created_at' | 'updated_at' | 'student_id'>): Promise<{ success: boolean; error?: string }> => {
    try {
      const newProfile: DisabilityProfile = {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        student_id: studentId,
        ...profileData
      };

      // In a real app, we would insert into Supabase here

      // For now, store locally
      setLocalProfiles(prev => [...prev, newProfile]);
      return { success: true };
    } catch (error) {
      console.error('Assignment error:', error);
      return { success: false, error: 'Assignment failed' };
    }
  };

  const logout = async () => {
    setStudent(null);
    setTeacher(false);
    setDisabilityProfiles([]);
    setAccessibilitySettings(null);
  };

  const refreshProfile = async () => {
    if (student) {
      await loadStudentProfile(student.id);
    }
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        student,
        teacher,
        disabilityProfiles,
        accessibilitySettings,
        loading,
        loginWithRollNumber,
        loginAsTeacher,
        logout,
        refreshProfile,
        registerStudent,
        assignDisabilityProfile,
        allStudents
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Manages student authentication and profile
import { getCurrentSession, getStudentProfile, onAuthStateChange } from './supabase-client.js';

class AuthManager {
  constructor() {
    this.currentStudent = null;
    this.authSubscription = null;
  }

  // Initialize and check for existing session
  async initialize() {
    console.log('AuthManager: Initializing...');
    
    const session = await getCurrentSession();
    
    if (session) {
      console.log('AuthManager: Found existing session');
      await this.loadStudentProfile(session.user.id);
    } else {
      console.log('AuthManager: No session found');
    }
    
    // Listen for login/logout
    this.authSubscription = onAuthStateChange(async (event, session) => {
      console.log('AuthManager: Auth state changed:', event);
      
      if (event === 'SIGNED_IN' && session) {
        await this.loadStudentProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        await this.handleSignOut();
      }
    });
  }

  // Load student profile from database
  async loadStudentProfile(userId) {
    console.log('AuthManager: Loading profile for user:', userId);
    
    const profile = await getStudentProfile(userId);
    
    if (profile) {
      this.currentStudent = {
        id: profile.id,
        userId: userId,
        rollNumber: profile.roll_number,
        name: profile.name,
        disability: profile.disability_type,
        preferences: profile.preferences || {}
      };
      
      // Save to chrome storage
      await chrome.storage.local.set({ 
        studentProfile: this.currentStudent,
        isAuthenticated: true 
      });
      
      console.log('AuthManager: Profile loaded:', this.currentStudent);
      
      // Notify other parts of extension
      this.broadcastProfileUpdate();
      
      return this.currentStudent;
    } else {
      console.error('AuthManager: Failed to load profile');
      return null;
    }
  }

  // Get current student
  async getCurrentStudent() {
    if (this.currentStudent) {
      return this.currentStudent;
    }
    
    // Try to load from storage
    const stored = await chrome.storage.local.get(['studentProfile', 'isAuthenticated']);
    
    if (stored.isAuthenticated && stored.studentProfile) {
      this.currentStudent = stored.studentProfile;
      return this.currentStudent;
    }
    
    return null;
  }

  // Handle sign out
  async handleSignOut() {
    console.log('AuthManager: Signing out');
    
    this.currentStudent = null;
    
    await chrome.storage.local.remove(['studentProfile', 'isAuthenticated']);
    
    this.broadcastProfileUpdate();
  }

  // Notify other parts of extension
  broadcastProfileUpdate() {
    chrome.runtime.sendMessage({
      type: 'PROFILE_UPDATED',
      profile: this.currentStudent
    }).catch(() => {
      // Ignore if no listeners
    });
  }
}

// Export single instance
export const authManager = new AuthManager();

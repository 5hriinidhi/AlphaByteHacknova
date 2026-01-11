// Supabase connection
import { createClient } from '@supabase/supabase-js';

// TODO: Get these from your friend!
const SUPABASE_URL = 'https://qoibzfwtlknpdlprpkou.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvaWJ6Znd0bGtucGRscHJwa291Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMzg3NDMsImV4cCI6MjA4MzYxNDc0M30.ZBsC7rHL67Iz_1ODExr7r-H135w1vHj_sHlQY2lYBW8';

let supabaseClient = null;

// Initialize Supabase
export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true
      }
    });
  }
  return supabaseClient;
}

// Get current user
export async function getCurrentUser() {
  const supabase = getSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  
  return user;
}

// Get current session
export async function getCurrentSession() {
  const supabase = getSupabaseClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  
  return session;
}

// Listen for auth changes
export function onAuthStateChange(callback) {
  const supabase = getSupabaseClient();
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
  
  return subscription;
}

// Get student profile from database
export async function getStudentProfile(userId) {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  
  return data;
}

// Insert data
export async function insertData(table, data) {
  const supabase = getSupabaseClient();
  
  const { data: result, error } = await supabase
    .from(table)
    .insert(data)
    .select();
  
  if (error) {
    console.error(`Error inserting to ${table}:`, error);
    return { success: false, error };
  }
  
  return { success: true, data: result };
}

// Supabase Configuration
const SUPABASE_URL = 'https://qoibzfwtlknpdlprpkou.supabase.co';  // ← Replace with your URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvaWJ6Znd0bGtucGRscHJwa291Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMzg3NDMsImV4cCI6MjA4MzYxNDc0M30.ZBsC7rHL67Iz_1ODExr7r-H135w1vHj_sHlQY2lYBW8';  // ← Replace with your key

// Helper function to make Supabase requests
async function supabaseQuery(table, filters = {}) {
  try {
    let url = `${SUPABASE_URL}/rest/v1/${table}?select=*`;
    
    // Add filters
    Object.keys(filters).forEach(key => {
      url += `&${key}=eq.${encodeURIComponent(filters[key])}`;
    });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Supabase query error: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('❌ Supabase query error:', error);
    throw error;
  }
}

async function supabaseInsert(table, data) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Supabase error: ${error.message || response.status}`);
    }

    const result = await response.json();
    console.log('✅ Data saved to Supabase:', table, result);
    return result;
  } catch (error) {
    console.error('❌ Supabase insert error:', error);
    throw error;
  }
}

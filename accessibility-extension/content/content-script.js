// Content script - runs on every webpage
console.log('Content Script: Loaded on', window.location.href);

let studentProfile = null;
let activeFeatures = [];

// Get student profile when page loads
chrome.runtime.sendMessage(
  { type: 'GET_STUDENT_PROFILE' },
  (response) => {
    if (response && response.success && response.profile) {
      console.log('Content Script: Student profile received:', response.profile);
      studentProfile = response.profile;
      loadFeatures();
    } else {
      console.log('Content Script: No student profile available');
      // Load universal features anyway
      loadUniversalFeatures();
    }
  }
);

// Load universal features (always load these)
function loadUniversalFeatures() {
  console.log('Content Script: Loading universal features...');
  
  // Inject AI Companion script
  injectScript('features/universal/ai-companion.js');
}

// Load all features based on profile
function loadFeatures() {
  console.log('Content Script: Loading features for:', studentProfile.disability);
  
  // Always load universal features
  loadUniversalFeatures();
  
  // Load disability-specific features later
}

// Helper function to inject external scripts
function injectScript(scriptPath) {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL(scriptPath);
  script.onload = () => {
    console.log(`Content Script: Loaded ${scriptPath}`);
    script.remove(); // Clean up after loading
  };
  script.onerror = () => console.error(`Content Script: Failed to load ${scriptPath}`);
  (document.head || document.documentElement).appendChild(script);
}

// Listen for messages from service worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content Script: Received message:', message.type);
  
  if (message.type === 'PROFILE_UPDATED') {
    console.log('Content Script: Profile updated:', message.profile);
    studentProfile = message.profile;
    if (message.profile) {
      loadFeatures();
    }
  }
  
  sendResponse({ success: true });
});

console.log('Content Script: Ready!');

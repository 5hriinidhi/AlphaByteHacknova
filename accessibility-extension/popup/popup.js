document.addEventListener('DOMContentLoaded', () => {
  // Auth elements
  const loginBtn = document.getElementById('login-btn');
  const studentInfo = document.getElementById('student-info');
  const studentNameDisplay = document.getElementById('student-name-display');
  const rollNumberDisplay = document.getElementById('roll-number-display');
  const disabilityDisplay = document.getElementById('disability-display');
  
  // Check if logged in
  chrome.storage.sync.get(['logged_in', 'student_name','roll_number', 'disability_type'], (result) => {
    if (result.logged_in) {
      loginBtn.textContent = '✅ Logged In';
      loginBtn.style.background = '#22c55e';
      studentInfo.style.display = 'block';
      studentNameDisplay.textContent = result.student_name;
      rollNumberDisplay.textContent = result.roll_number;
      disabilityDisplay.textContent = result.disability_type.toUpperCase();
      
      filterFeaturesByDisability(result.disability_type);
    }
  });

  // Login button click
  loginBtn.addEventListener('click', () => {
    chrome.windows.create({
      url: chrome.runtime.getURL('auth/login.html'),
      type: 'popup',
      width: 420,
      height: 550
    });
  });

  // Logout button click
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await chrome.storage.sync.clear();
      
      loginBtn.textContent = '🔑 Login';
      loginBtn.classList.remove('logged-in');
      loginBtn.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      studentInfo.style.display = 'none';
      
      document.getElementById('adhd-section').style.display = 'block';
      document.getElementById('hearing-section').style.display = 'block';
      document.getElementById('visual-section').style.display = 'block';
      document.getElementById('motor-section').style.display = 'block';
      
      const statusEl = document.getElementById('status');
      statusEl.textContent = '✅ Logged out successfully';
      
      setTimeout(() => {
        statusEl.textContent = 'Ready';
      }, 2000);
      
      console.log('✅ User logged out');
    });
  }

  // Filter features based on disability
  function filterFeaturesByDisability(disabilityType) {
    const sections = {
      adhd: document.querySelector('.section:has(#toggle-bionic)'),
      hearing: document.querySelector('.section:has(#toggle-transcribe)'),
      visual: document.querySelector('.section:has(#toggle-reader)'),
      motor: document.querySelector('.section:has(#toggle-bigclick)')
    };

    Object.keys(sections).forEach(key => {
      if (key !== disabilityType && sections[key]) {
        sections[key].style.display = 'none';
      }
    });
  }

  // Get all button elements
  const bionicBtn = document.getElementById('toggle-bionic');
  const blinderBtn = document.getElementById('toggle-blinder');
  const transcribeBtn = document.getElementById('toggle-transcribe');
  const readerBtn = document.getElementById('toggle-reader');
  const imageDescriberBtn = document.getElementById('toggle-image-describer');
  const brailleBoxBtn = document.getElementById('toggle-braille-box');
  const bigClickBtn = document.getElementById('toggle-bigclick');
  const voiceNavBtn = document.getElementById('toggle-voice-nav');
  const status = document.getElementById('status');

  // Load current states from storage
  chrome.storage.local.get([
    'bionic_enabled',
    'blinder_enabled',
    'transcribe_enabled',
    'reader_enabled',
    'image_describer_enabled',
    'braille_box_enabled',
    'bigclick_enabled',
    'voice_nav_enabled'
  ], (result) => {
    if (result.bionic_enabled) bionicBtn.classList.add('active');
    if (result.blinder_enabled) blinderBtn.classList.add('active');
    if (result.transcribe_enabled) transcribeBtn.classList.add('active');
    if (result.reader_enabled) readerBtn.classList.add('active');
    if (result.image_describer_enabled) imageDescriberBtn.classList.add('active');
    if (result.braille_box_enabled) brailleBoxBtn.classList.add('active');
    if (result.bigclick_enabled) bigClickBtn.classList.add('active');
    if (result.voice_nav_enabled) voiceNavBtn.classList.add('active');
  });

  // ADHD: Bionic Reading
  bionicBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_BIONIC' }, (response) => {
      if (response && response.success) {
        if (response.enabled) {
          bionicBtn.classList.add('active');
          showStatus('✨ Bionic Reading ON');
        } else {
          bionicBtn.classList.remove('active');
          showStatus('Bionic Reading OFF');
        }
        chrome.storage.local.set({ bionic_enabled: response.enabled });
      }
    });
  });

  // ADHD: Blinder Mode
  blinderBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_BLINDER' }, (response) => {
      if (response && response.success) {
        if (response.enabled) {
          blinderBtn.classList.add('active');
          showStatus('🎯 Focus Tunnel ON');
        } else {
          blinderBtn.classList.remove('active');
          showStatus('Focus Tunnel OFF');
        }
        chrome.storage.local.set({ blinder_enabled: response.enabled });
      }
    });
  });

  // HEARING: Live Transcription
  transcribeBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_TRANSCRIBE' }, (response) => {
      if (response && response.success) {
        if (response.enabled) {
          transcribeBtn.classList.add('active');
          showStatus('📝 Live Transcription ON');
        } else {
          transcribeBtn.classList.remove('active');
          showStatus('Live Transcription OFF');
        }
        chrome.storage.local.set({ transcribe_enabled: response.enabled });
      }
    });
  });

  // VISION: Screen Reader
  readerBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_READER' }, (response) => {
      if (response && response.success) {
        if (response.enabled) {
          readerBtn.classList.add('active');
          showStatus('📖 Screen Reader ON');
        } else {
          readerBtn.classList.remove('active');
          showStatus('Screen Reader OFF');
        }
        chrome.storage.local.set({ reader_enabled: response.enabled });
      }
    });
  });

  // VISION: Image Describer
  imageDescriberBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_IMAGE_DESCRIBER' }, (response) => {
      if (response && response.success) {
        if (response.enabled) {
          imageDescriberBtn.classList.add('active');
          showStatus('🖼️ Image Describer ON');
        } else {
          imageDescriberBtn.classList.remove('active');
          showStatus('Image Describer OFF');
        }
        chrome.storage.local.set({ image_describer_enabled: response.enabled });
      }
    });
  });

  // VISION: Braille Box (SINGLE HANDLER - KEEP ONLY THIS ONE)
  brailleBoxBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_BRAILLE_BOX' }, (response) => {
      if (response && response.success) {
        if (response.enabled) {
          brailleBoxBtn.classList.add('active');
          showStatus('⠃ Braille Box ON');
        } else {
          brailleBoxBtn.classList.remove('active');
          showStatus('Braille Box OFF');
        }
        chrome.storage.local.set({ braille_box_enabled: response.enabled });
      }
    });
  });

  // MOTOR: Big Click
  bigClickBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_BIG_CLICK' }, (response) => {
      if (response && response.success) {
        if (response.enabled) {
          bigClickBtn.classList.add('active');
          showStatus('👆 Big Click ON');
        } else {
          bigClickBtn.classList.remove('active');
          showStatus('Big Click OFF');
        }
        chrome.storage.local.set({ bigclick_enabled: response.enabled });
      }
    });
  });

  // MOTOR: Voice Navigation
  voiceNavBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_VOICE_NAV' }, (response) => {
      if (response && response.success) {
        if (response.enabled) {
          voiceNavBtn.classList.add('active');
          showStatus('🎤 Voice Navigation ON');
        } else {
          voiceNavBtn.classList.remove('active');
          showStatus('Voice Navigation OFF');
        }
        chrome.storage.local.set({ voice_nav_enabled: response.enabled });
      }
    });
  });

  function showStatus(message) {
    status.textContent = message;
    setTimeout(() => {
      status.textContent = 'Ready';
    }, 2000);
  }
});

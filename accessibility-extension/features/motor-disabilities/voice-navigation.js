// Voice Navigation - Hands-free control (EXPANDED)
(function() {
  let voiceNavEnabled = false;
  let recognition = null;
  let feedbackDiv = null;
  let numberedLinks = [];

  const commands = {
    // Scrolling
    'scroll down': () => window.scrollBy({ top: 300, behavior: 'smooth' }),
    'scroll up': () => window.scrollBy({ top: -300, behavior: 'smooth' }),
    'scroll top': () => window.scrollTo({ top: 0, behavior: 'smooth' }),
    'scroll bottom': () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }),
    'page down': () => window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' }),
    'page up': () => window.scrollBy({ top: -window.innerHeight * 0.8, behavior: 'smooth' }),
    
    // Navigation
    'go back': () => window.history.back(),
    'go forward': () => window.history.forward(),
    'refresh': () => window.location.reload(),
    'refresh page': () => window.location.reload(),
    
    // Clicking
    'click': () => clickClosestLink(),
    'next page': () => clickNext(),
    'previous page': () => clickPrevious(),
    
    // Tab management
    'close tab': () => window.close(),
    'new tab': () => chrome.runtime.sendMessage({ type: 'NEW_TAB' }),
    
    // Zoom
    'zoom in': () => adjustZoom(0.1),
    'zoom out': () => adjustZoom(-0.1),
    'reset zoom': () => resetZoom(),
    
    // Form interaction
    'search': () => focusSearchBox(),
    'submit': () => submitForm(),
    'send': () => submitForm(),
    
    // Media controls
    'play video': () => controlMedia('play'),
    'pause video': () => controlMedia('pause'),
    'stop video': () => controlMedia('pause'),
    'mute': () => muteMedia(true),
    'unmute': () => muteMedia(false),
    
    // Reading
    'read page': () => startReading(),
    'stop reading': () => stopReading(),
    
    // Link selection
    'show links': () => showNumberedLinks(),
    'hide links': () => hideNumberedLinks(),
    
    // Utility
    'select all': () => document.execCommand('selectAll'),
    'copy': () => document.execCommand('copy'),
    'find': () => focusFind(),
  };

  function createFeedbackDisplay() {
    feedbackDiv = document.createElement('div');
    feedbackDiv.id = 'voice-nav-feedback';
    feedbackDiv.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(102, 126, 234, 0.95);
      color: white;
      padding: 14px 24px;
      border-radius: 25px;
      font-weight: 600;
      font-size: 14px;
      z-index: 999999;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      gap: 10px;
      backdrop-filter: blur(10px);
    `;
    
    feedbackDiv.innerHTML = `
      <span style="width: 10px; height: 10px; background: #ef4444; border-radius: 50%; animation: pulse-red 1.5s infinite;"></span>
      <span>🎤 Listening for voice commands...</span>
    `;

    document.body.appendChild(feedbackDiv);

    // Add help button
    const helpBtn = document.createElement('button');
    helpBtn.textContent = '?';
    helpBtn.style.cssText = `
      position: fixed;
      top: 70px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255, 255, 255, 0.9);
      color: #667eea;
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      font-weight: bold;
      font-size: 16px;
      cursor: pointer;
      z-index: 999999;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
    helpBtn.addEventListener('click', showCommandsHelp);
    document.body.appendChild(helpBtn);
  }

  function startVoiceNav() {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice recognition not supported. Please use Chrome or Edge.');
      return;
    }

    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    recognition.onresult = (event) => {
      const last = event.results.length - 1;
      const command = event.results[last][0].transcript.toLowerCase().trim();
      
      console.log('Voice command:', command);
      handleCommand(command);
    };

    recognition.onerror = (event) => {
      console.error('Voice Navigation: Error', event.error);
      if (event.error !== 'no-speech') {
        showFeedback(`Error: ${event.error}`, 'error');
      }
    };

    recognition.onend = () => {
      if (voiceNavEnabled) {
        recognition.start(); // Restart
      }
    };

    recognition.start();
    createFeedbackDisplay();
    console.log('Voice Navigation: Started');
  }

  function handleCommand(command) {
    let executed = false;

    // Check for numbered link commands (e.g., "open link 1")
    const linkMatch = command.match(/(?:open|click)\s+(?:link\s+)?(\d+)/);
    if (linkMatch) {
      const linkNumber = parseInt(linkMatch[1]);
      clickNumberedLink(linkNumber);
      return;
    }

    // Check exact matches
    for (const [key, action] of Object.entries(commands)) {
      if (command.includes(key)) {
        showFeedback(`✓ ${key}`, 'success');
        try {
          action();
          executed = true;
        } catch (error) {
          console.error('Command execution error:', error);
          showFeedback(`Error executing: ${key}`, 'error');
        }
        break;
      }
    }

    if (!executed) {
      showFeedback(`❓ Unknown: "${command}"`, 'error');
    }
  }

  function showFeedback(message, type = 'info') {
    if (!feedbackDiv) return;

    const color = type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#667eea';
    
    feedbackDiv.innerHTML = `
      <span style="width: 10px; height: 10px; background: ${color}; border-radius: 50%;"></span>
      <span>${message}</span>
    `;

    setTimeout(() => {
      if (feedbackDiv) {
        feedbackDiv.innerHTML = `
          <span style="width: 10px; height: 10px; background: #ef4444; border-radius: 50%; animation: pulse-red 1.5s infinite;"></span>
          <span>🎤 Listening...</span>
        `;
      }
    }, 2000);
  }

  // ===== COMMAND IMPLEMENTATIONS =====

  function clickClosestLink() {
    const links = Array.from(document.querySelectorAll('a, button'));
    const viewportCenter = window.innerHeight / 2;
    
    let closest = null;
    let closestDistance = Infinity;

    links.forEach(link => {
      const rect = link.getBoundingClientRect();
      if (rect.top < 0 || rect.top > window.innerHeight) return;
      
      const distance = Math.abs(rect.top - viewportCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = link;
      }
    });

    if (closest) {
      closest.click();
      showFeedback('✓ Clicked element', 'success');
    } else {
      showFeedback('No clickable element found', 'error');
    }
  }

  function clickNext() {
    const nextLinks = Array.from(document.querySelectorAll('a, button')).filter(el => {
      const text = el.textContent.toLowerCase();
      return text.includes('next') || text.includes('→') || text.includes('>');
    });
    
    if (nextLinks.length > 0) {
      nextLinks[0].click();
      showFeedback('✓ Next page', 'success');
    } else {
      showFeedback('No "next" link found', 'error');
    }
  }

  function clickPrevious() {
    const prevLinks = Array.from(document.querySelectorAll('a, button')).filter(el => {
      const text = el.textContent.toLowerCase();
      return text.includes('previous') || text.includes('prev') || text.includes('←') || text.includes('<');
    });
    
    if (prevLinks.length > 0) {
      prevLinks[0].click();
      showFeedback('✓ Previous page', 'success');
    } else {
      showFeedback('No "previous" link found', 'error');
    }
  }

  function adjustZoom(delta) {
    const currentZoom = parseFloat(document.body.style.zoom || 1);
    const newZoom = Math.max(0.5, Math.min(2.0, currentZoom + delta));
    document.body.style.zoom = newZoom;
    showFeedback(`Zoom: ${Math.round(newZoom * 100)}%`, 'success');
  }

  function resetZoom() {
    document.body.style.zoom = 1;
    showFeedback('Zoom reset to 100%', 'success');
  }

  function focusSearchBox() {
    const searchInputs = document.querySelectorAll('input[type="search"], input[name*="search" i], input[placeholder*="search" i], input[id*="search" i]');
    
    if (searchInputs.length > 0) {
      searchInputs[0].focus();
      showFeedback('✓ Search box focused', 'success');
    } else {
      showFeedback('No search box found', 'error');
    }
  }

  function submitForm() {
    const forms = document.querySelectorAll('form');
    
    if (forms.length > 0) {
      const activeForm = document.activeElement.closest('form') || forms[0];
      activeForm.submit();
      showFeedback('✓ Form submitted', 'success');
    } else {
      showFeedback('No form found', 'error');
    }
  }

  function controlMedia(action) {
    const videos = document.querySelectorAll('video');
    const audios = document.querySelectorAll('audio');
    
    const media = [...videos, ...audios];
    
    if (media.length > 0) {
      media.forEach(m => {
        if (action === 'play') {
          m.play();
        } else {
          m.pause();
        }
      });
      showFeedback(`✓ Media ${action}ed`, 'success');
    } else {
      showFeedback('No media found', 'error');
    }
  }

  function muteMedia(mute) {
    const videos = document.querySelectorAll('video');
    const audios = document.querySelectorAll('audio');
    
    const media = [...videos, ...audios];
    
    if (media.length > 0) {
      media.forEach(m => m.muted = mute);
      showFeedback(`✓ Media ${mute ? 'muted' : 'unmuted'}`, 'success');
    } else {
      showFeedback('No media found', 'error');
    }
  }

  function startReading() {
    speechSynthesis.cancel();
    
    const mainContent = extractMainText();
    const utterance = new SpeechSynthesisUtterance(mainContent);
    utterance.lang = 'en-IN';
    utterance.rate = 0.9;
    
    speechSynthesis.speak(utterance);
    showFeedback('✓ Reading page', 'success');
  }

  function stopReading() {
    speechSynthesis.cancel();
    showFeedback('✓ Stopped reading', 'success');
  }

  function extractMainText() {
    const main = document.querySelector('main, article, #content, .content') || document.body;
    const paragraphs = main.querySelectorAll('p, h1, h2, h3');
    
    let text = '';
    paragraphs.forEach(p => {
      if (!p.closest('nav, aside, footer, header')) {
        text += p.textContent + '. ';
      }
    });
    
    return text.substring(0, 5000); // Limit to prevent very long reads
  }

  function showNumberedLinks() {
    hideNumberedLinks(); // Clear existing
    
    const links = Array.from(document.querySelectorAll('a, button')).filter(link => {
      const rect = link.getBoundingClientRect();
      return rect.top >= 0 && rect.top <= window.innerHeight && rect.width > 0 && rect.height > 0;
    });

    links.forEach((link, index) => {
      const badge = document.createElement('div');
      badge.className = 'voice-nav-link-badge';
      badge.textContent = index + 1;
      badge.style.cssText = `
        position: absolute;
        background: #ef4444;
        color: white;
        font-weight: bold;
        font-size: 12px;
        padding: 4px 8px;
        border-radius: 12px;
        z-index: 999998;
        pointer-events: none;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      `;

      const rect = link.getBoundingClientRect();
      badge.style.top = (window.scrollY + rect.top - 5) + 'px';
      badge.style.left = (window.scrollX + rect.left - 5) + 'px';

      document.body.appendChild(badge);
      numberedLinks.push({ badge, link });
    });

    showFeedback(`✓ ${numberedLinks.length} links numbered`, 'success');
  }

  function hideNumberedLinks() {
    document.querySelectorAll('.voice-nav-link-badge').forEach(badge => badge.remove());
    numberedLinks = [];
  }

  function clickNumberedLink(number) {
    if (number > 0 && number <= numberedLinks.length) {
      const { link } = numberedLinks[number - 1];
      link.click();
      showFeedback(`✓ Clicked link ${number}`, 'success');
      hideNumberedLinks();
    } else {
      showFeedback(`Link ${number} not found`, 'error');
    }
  }

  function focusFind() {
    // Trigger browser find (Ctrl+F)
    document.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'f',
      ctrlKey: true,
      bubbles: true
    }));
    showFeedback('✓ Find activated', 'success');
  }

  function showCommandsHelp() {
    const helpModal = document.createElement('div');
    helpModal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.8);
      z-index: 9999999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    `;

    helpModal.innerHTML = `
      <div style="background: white; border-radius: 16px; max-width: 600px; width: 100%; max-height: 80vh; overflow-y: auto; padding: 24px;">
        <h2 style="margin: 0 0 16px 0; color: #333;">🎤 Voice Commands</h2>
        
        <div style="margin-bottom: 16px;">
          <h3 style="font-size: 16px; color: #667eea; margin-bottom: 8px;">📜 Scrolling</h3>
          <p style="margin: 4px 0; font-size: 14px;">• "scroll down" / "scroll up"</p>
          <p style="margin: 4px 0; font-size: 14px;">• "scroll top" / "scroll bottom"</p>
          <p style="margin: 4px 0; font-size: 14px;">• "page down" / "page up"</p>
        </div>

        <div style="margin-bottom: 16px;">
          <h3 style="font-size: 16px; color: #667eea; margin-bottom: 8px;">🔙 Navigation</h3>
          <p style="margin: 4px 0; font-size: 14px;">• "go back" / "go forward"</p>
          <p style="margin: 4px 0; font-size: 14px;">• "refresh" / "refresh page"</p>
          <p style="margin: 4px 0; font-size: 14px;">• "next page" / "previous page"</p>
        </div>

        <div style="margin-bottom: 16px;">
          <h3 style="font-size: 16px; color: #667eea; margin-bottom: 8px;">🖱️ Clicking</h3>
          <p style="margin: 4px 0; font-size: 14px;">• "click" (clicks nearest element)</p>
          <p style="margin: 4px 0; font-size: 14px;">• "show links" (number all links)</p>
          <p style="margin: 4px 0; font-size: 14px;">• "open link 1" / "click 5" (after showing links)</p>
          <p style="margin: 4px 0; font-size: 14px;">• "hide links"</p>
        </div>

        <div style="margin-bottom: 16px;">
          <h3 style="font-size: 16px; color: #667eea; margin-bottom: 8px;">🔍 Forms & Search</h3>
          <p style="margin: 4px 0; font-size: 14px;">• "search" (focus search box)</p>
          <p style="margin: 4px 0; font-size: 14px;">• "submit" / "send" (submit form)</p>
          <p style="margin: 4px 0; font-size: 14px;">• "find" (open browser find)</p>
        </div>

        <div style="margin-bottom: 16px;">
          <h3 style="font-size: 16px; color: #667eea; margin-bottom: 8px;">🔊 Media</h3>
          <p style="margin: 4px 0; font-size: 14px;">• "play video" / "pause video"</p>
          <p style="margin: 4px 0; font-size: 14px;">• "mute" / "unmute"</p>
        </div>

        <div style="margin-bottom: 16px;">
          <h3 style="font-size: 16px; color: #667eea; margin-bottom: 8px;">📖 Reading</h3>
          <p style="margin: 4px 0; font-size: 14px;">• "read page" (text-to-speech)</p>
          <p style="margin: 4px 0; font-size: 14px;">• "stop reading"</p>
        </div>

        <div style="margin-bottom: 16px;">
          <h3 style="font-size: 16px; color: #667eea; margin-bottom: 8px;">🔎 Zoom</h3>
          <p style="margin: 4px 0; font-size: 14px;">• "zoom in" / "zoom out"</p>
          <p style="margin: 4px 0; font-size: 14px;">• "reset zoom"</p>
        </div>

        <div style="margin-bottom: 16px;">
          <h3 style="font-size: 16px; color: #667eea; margin-bottom: 8px;">📑 Tabs</h3>
          <p style="margin: 4px 0; font-size: 14px;">• "new tab"</p>
          <p style="margin: 4px 0; font-size: 14px;">• "close tab"</p>
        </div>

        <div style="margin-bottom: 16px;">
          <h3 style="font-size: 16px; color: #667eea; margin-bottom: 8px;">✂️ Utility</h3>
          <p style="margin: 4px 0; font-size: 14px;">• "select all"</p>
          <p style="margin: 4px 0; font-size: 14px;">• "copy"</p>
        </div>

        <button id="close-help" style="width: 100%; padding: 12px; background: #667eea; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 16px;">Close</button>
      </div>
    `;

    document.body.appendChild(helpModal);

    helpModal.querySelector('#close-help').addEventListener('click', () => {
      helpModal.remove();
    });

    helpModal.addEventListener('click', (e) => {
      if (e.target === helpModal) {
        helpModal.remove();
      }
    });
  }

  function stopVoiceNav() {
    voiceNavEnabled = false;
    
    if (recognition) {
      recognition.stop();
      recognition = null;
    }

    if (feedbackDiv) {
      feedbackDiv.remove();
      feedbackDiv = null;
    }

    hideNumberedLinks();
    speechSynthesis.cancel();

    // Remove help button
    document.querySelectorAll('button').forEach(btn => {
      if (btn.textContent === '?') {
        btn.remove();
      }
    });

    console.log('Voice Navigation: Stopped');
  }

  // Listen for toggle message
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'TOGGLE_VOICE_NAV') {
      voiceNavEnabled = !voiceNavEnabled;
      
      if (voiceNavEnabled) {
        startVoiceNav();
        sendResponse({ success: true, enabled: true });
      } else {
        stopVoiceNav();
        sendResponse({ success: true, enabled: false });
      }
      
      return true;
    }
  });

  // Add animation style
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse-red {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
  `;
  document.head.appendChild(style);

  console.log('Voice Navigation: Ready');
})();

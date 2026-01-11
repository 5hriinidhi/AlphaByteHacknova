// Live Transcribe - Real-time audio transcription
(function() {
  let transcribeEnabled = false;
  let recognition = null;
  let transcriptOverlay = null;
  let transcriptBuffer = [];
  const MAX_LINES = 5;

  function createTranscriptOverlay() {
    transcriptOverlay = document.createElement('div');
    transcriptOverlay.id = 'live-transcript-overlay';
    transcriptOverlay.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: 90%;
      max-width: 800px;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 20px;
      z-index: 999996;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      border: 2px solid rgba(255, 255, 255, 0.2);
    `;

    transcriptOverlay.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="width: 12px; height: 12px; background: #ef4444; border-radius: 50%; animation: pulse-red 1.5s infinite;"></span>
          <span style="color: white; font-weight: 600; font-size: 14px;">Live Transcription</span>
        </div>
        <button id="close-transcript" style="background: rgba(255,255,255,0.1); border: none; color: white; font-size: 20px; cursor: pointer; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center;">✕</button>
      </div>
      <div id="transcript-content" style="color: white; font-size: 16px; line-height: 1.8; min-height: 60px; max-height: 200px; overflow-y: auto;"></div>
      <style>
        @keyframes pulse-red {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        #transcript-content::-webkit-scrollbar {
          width: 8px;
        }
        #transcript-content::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
        }
        #transcript-content::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.3);
          border-radius: 4px;
        }
      </style>
    `;

    document.body.appendChild(transcriptOverlay);

    // Close button
    document.getElementById('close-transcript').addEventListener('click', () => {
      stopTranscription();
    });

    console.log('Live Transcribe: Overlay created');
  }

  function startTranscription() {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN'; // Indian English

    const transcriptContent = document.getElementById('transcript-content');

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        addTranscriptLine(finalTranscript.trim());
      }

      // Show interim results in gray
      updateDisplay(interimTranscript);
    };

    recognition.onerror = (event) => {
      console.error('Live Transcribe: Error', event.error);
      if (event.error === 'no-speech') {
        // Continue listening
        return;
      }
    };

    recognition.onend = () => {
      if (transcribeEnabled) {
        // Restart if still enabled
        recognition.start();
      }
    };

    recognition.start();
    console.log('Live Transcribe: Started');
  }

  function addTranscriptLine(text) {
    const timestamp = new Date().toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    // Analyze for emotions/keywords
    const analyzed = analyzeText(text);
    
    transcriptBuffer.push({
      text: text,
      time: timestamp,
      emotion: analyzed.emotion,
      hasKeyword: analyzed.hasKeyword
    });

    // Keep only last MAX_LINES
    if (transcriptBuffer.length > MAX_LINES) {
      transcriptBuffer.shift();
    }

    updateDisplay();
  }

  function analyzeText(text) {
    const lowerText = text.toLowerCase();
    
    // Emotion detection
    const negativeWords = ['urgent', 'important', 'danger', 'warning', 'error', 'problem', 'fail', 'stop', 'no', 'don\'t', 'cannot'];
    const positiveWords = ['good', 'great', 'excellent', 'success', 'correct', 'right', 'yes', 'perfect'];
    
    let emotion = 'neutral';
    let hasKeyword = false;

    negativeWords.forEach(word => {
      if (lowerText.includes(word)) {
        emotion = 'negative';
        hasKeyword = true;
      }
    });

    positiveWords.forEach(word => {
      if (lowerText.includes(word)) {
        emotion = 'positive';
        hasKeyword = true;
      }
    });

    return { emotion, hasKeyword };
  }

  function updateDisplay(interimText = '') {
    const transcriptContent = document.getElementById('transcript-content');
    if (!transcriptContent) return;

    let html = '';

    transcriptBuffer.forEach((line) => {
      let color = '#ffffff';
      let bgColor = 'transparent';
      let animation = '';

      if (line.emotion === 'negative' && line.hasKeyword) {
        color = '#fca5a5';
        bgColor = 'rgba(239, 68, 68, 0.2)';
        animation = 'flash 1s infinite';
      } else if (line.emotion === 'positive' && line.hasKeyword) {
        color = '#86efac';
        bgColor = 'rgba(34, 197, 94, 0.2)';
      }

      html += `
        <div style="margin-bottom: 8px; padding: 8px 12px; border-radius: 8px; background: ${bgColor}; animation: ${animation};">
          <span style="color: rgba(255,255,255,0.5); font-size: 12px; margin-right: 8px;">${line.time}</span>
          <span style="color: ${color};">${line.text}</span>
        </div>
      `;
    });

    // Add interim text
    if (interimText) {
      html += `<div style="color: rgba(255,255,255,0.5); font-style: italic;">${interimText}</div>`;
    }

    transcriptContent.innerHTML = html;
    transcriptContent.scrollTop = transcriptContent.scrollHeight;
  }

  function stopTranscription() {
    transcribeEnabled = false;
    
    if (recognition) {
      recognition.stop();
      recognition = null;
    }

    if (transcriptOverlay) {
      transcriptOverlay.remove();
      transcriptOverlay = null;
    }

    transcriptBuffer = [];
    console.log('Live Transcribe: Stopped');
  }

  // Listen for toggle message
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'TOGGLE_TRANSCRIBE') {
      transcribeEnabled = !transcribeEnabled;
      
      if (transcribeEnabled) {
        createTranscriptOverlay();
        startTranscription();
        sendResponse({ success: true, enabled: true });
      } else {
        stopTranscription();
        sendResponse({ success: true, enabled: false });
      }
      
      return true;
    }
  });

  // Add flash animation style
  const style = document.createElement('style');
  style.textContent = `
    @keyframes flash {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
  `;
  document.head.appendChild(style);

  console.log('Live Transcribe: Ready');
})();

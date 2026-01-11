// Semantic Screen Reader - Clean reader view with TTS
(function() {
  let readerEnabled = false;
  let readerOverlay = null;
  let currentUtterance = null;
  let currentSentenceIndex = 0;
  let sentences = [];

  function createReaderOverlay() {
    // Extract main content
    const content = extractMainContent();
    
    if (!content) {
      alert('Could not find main content on this page.');
      return;
    }

    readerOverlay = document.createElement('div');
    readerOverlay.id = 'semantic-reader-overlay';
    readerOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #f5f5f5;
      z-index: 9999998;
      overflow-y: auto;
      font-family: Georgia, 'Times New Roman', serif;
    `;

    readerOverlay.innerHTML = `
      <div style="max-width: 700px; margin: 0 auto; padding: 40px 20px;">
        <div style="position: fixed; top: 20px; right: 20px; display: flex; gap: 12px; z-index: 10;">
          <button id="reader-play" style="padding: 12px 20px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px;">▶ Play</button>
          <button id="reader-pause" style="padding: 12px 20px; background: #f59e0b; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; display: none;">⏸ Pause</button>
          <button id="reader-close" style="padding: 12px 20px; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px;">✕ Close</button>
        </div>
        
        <h1 style="font-size: 32px; margin-bottom: 20px; color: #1a202c; line-height: 1.3;">${content.title}</h1>
        <div id="reader-content" style="font-size: 20px; line-height: 1.8; color: #2d3748;">
          ${content.body}
        </div>
      </div>
    `;

    document.body.appendChild(readerOverlay);
    document.body.style.overflow = 'hidden';

    // Event listeners
    document.getElementById('reader-play').addEventListener('click', startReading);
    document.getElementById('reader-pause').addEventListener('click', pauseReading);
    document.getElementById('reader-close').addEventListener('click', closeReader);

    // Prepare sentences for highlighting
    prepareSentences();

    console.log('Screen Reader: Overlay created');
  }

  function extractMainContent() {
    // Try multiple content selectors
    const selectors = [
      'article',
      'main',
      '[role="main"]',
      '#content',
      '.post-content',
      '.article-content',
      '.entry-content'
    ];

    let mainElement = null;
    for (const selector of selectors) {
      mainElement = document.querySelector(selector);
      if (mainElement) break;
    }

    if (!mainElement) {
      mainElement = document.body;
    }

    // Get title
    let title = '';
    const h1 = mainElement.querySelector('h1') || document.querySelector('h1');
    if (h1) {
      title = h1.textContent.trim();
    } else {
      title = document.title;
    }

    // Get body content - skip nav, footer, aside
    const elementsToSkip = ['nav', 'aside', 'footer', 'header', '.sidebar', '.menu', '.advertisement'];
    let bodyText = '';

    const paragraphs = mainElement.querySelectorAll('p, h2, h3, li');
    paragraphs.forEach(el => {
      // Skip if inside nav, footer, etc.
      let skip = false;
      elementsToSkip.forEach(selector => {
        if (el.closest(selector)) {
          skip = true;
        }
      });

      if (!skip && el.textContent.trim().length > 20) {
        const tag = el.tagName.toLowerCase();
        if (tag === 'h2') {
          bodyText += `<h2 style="font-size: 24px; margin-top: 32px; margin-bottom: 16px; color: #1a202c;">${el.textContent}</h2>`;
        } else if (tag === 'h3') {
          bodyText += `<h3 style="font-size: 20px; margin-top: 24px; margin-bottom: 12px; color: #2d3748;">${el.textContent}</h3>`;
        } else {
          bodyText += `<p style="margin-bottom: 20px;">${el.textContent}</p>`;
        }
      }
    });

    return bodyText ? { title, body: bodyText } : null;
  }

  function prepareSentences() {
    const contentDiv = document.getElementById('reader-content');
    if (!contentDiv) return;

    const text = contentDiv.textContent;
    sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    currentSentenceIndex = 0;
  }

  function startReading() {
    if (!sentences.length) return;

    document.getElementById('reader-play').style.display = 'none';
    document.getElementById('reader-pause').style.display = 'block';

    readNextSentence();
  }

  function readNextSentence() {
    if (currentSentenceIndex >= sentences.length) {
      // Finished reading
      pauseReading();
      currentSentenceIndex = 0;
      return;
    }

    const sentence = sentences[currentSentenceIndex].trim();
    
    currentUtterance = new SpeechSynthesisUtterance(sentence);
    currentUtterance.lang = 'en-IN';
    currentUtterance.rate = 0.9;
    currentUtterance.pitch = 1.0;

    currentUtterance.onend = () => {
      currentSentenceIndex++;
      readNextSentence();
    };

    speechSynthesis.speak(currentUtterance);
    console.log('Reading:', sentence);
  }

  function pauseReading() {
    speechSynthesis.cancel();
    document.getElementById('reader-play').style.display = 'block';
    document.getElementById('reader-pause').style.display = 'none';
  }

  function closeReader() {
    readerEnabled = false;
    speechSynthesis.cancel();
    
    if (readerOverlay) {
      readerOverlay.remove();
      readerOverlay = null;
    }

    document.body.style.overflow = '';
    console.log('Screen Reader: Closed');
  }

  // Listen for toggle message
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'TOGGLE_READER') {
      readerEnabled = !readerEnabled;
      
      if (readerEnabled) {
        createReaderOverlay();
        sendResponse({ success: true, enabled: true });
      } else {
        closeReader();
        sendResponse({ success: true, enabled: false });
      }
      
      return true;
    }
  });

  console.log('Semantic Screen Reader: Ready');
})();

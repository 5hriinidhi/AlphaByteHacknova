// Braille Box Integration - Single-Cell Refreshable Braille Display
(function() {
  let brailleBoxEnabled = false;
  let serialPort = null;
  let writer = null;
  let controlPanel = null;
  let isReading = false;
  let textQueue = [];
  let currentIndex = 0;

  // Braille character mapping (6-dot Braille patterns)
  const brailleMap = {
    'a': '100000', 'b': '110000', 'c': '100100', 'd': '100110', 'e': '100010',
    'f': '110100', 'g': '110110', 'h': '110010', 'i': '010100', 'j': '010110',
    'k': '101000', 'l': '111000', 'm': '101100', 'n': '101110', 'o': '101010',
    'p': '111100', 'q': '111110', 'r': '111010', 's': '011100', 't': '011110',
    'u': '101001', 'v': '111001', 'w': '010111', 'x': '101101', 'y': '101111',
    'z': '101011',
    '1': '100000', '2': '110000', '3': '100100', '4': '100110', '5': '100010',
    '6': '110100', '7': '110110', '8': '110010', '9': '010100', '0': '010110',
    ' ': '000000',
    '.': '010011', ',': '010000', '?': '011001', '!': '011010',
    '-': '001001', '/': '001100', ':': '010010', ';': '011000',
    '\n': '000000'
  };

  async function enableBrailleBox() {
    try {
      console.log('Braille Box: Requesting serial port...');
      
      serialPort = await navigator.serial.requestPort();
      console.log('Braille Box: Opening serial port...');
      
      await serialPort.open({ baudRate: 9600 });
      writer = serialPort.writable.getWriter();
      
      console.log('Braille Box: ✅ Connected successfully!');
      
      createControlPanel();
      showToast('✅ Braille Box Connected!', 'success');
      
    } catch (error) {
      console.error('Braille Box: Connection error:', error);
      showToast('❌ Failed to connect. Make sure device is plugged in.', 'error');
      brailleBoxEnabled = false;
    }
  }

  function createControlPanel() {
    controlPanel = document.createElement('div');
    controlPanel.id = 'braille-box-panel';
    controlPanel.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 320px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      z-index: 999997;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      border: 2px solid #667eea;
    `;

    controlPanel.innerHTML = `
      <div style="padding: 16px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 14px 14px 0 0; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 20px;">⠃</span>
          <span style="font-weight: 600; font-size: 15px;">Braille Box</span>
        </div>
        <button id="braille-close" style="background: rgba(255,255,255,0.2); border: none; color: white; font-size: 18px; cursor: pointer; width: 28px; height: 28px; border-radius: 6px;">✕</button>
      </div>

      <div style="padding: 20px;">
        <div style="margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="width: 10px; height: 10px; background: #22c55e; border-radius: 50%;"></span>
            <span style="font-size: 13px; color: #22c55e; font-weight: 600;">Connected</span>
          </div>
          <div id="braille-status" style="font-size: 12px; color: #666; margin-left: 18px;">
            Ready to read
          </div>
        </div>

        <div style="margin-bottom: 16px;">
          <label style="font-size: 13px; color: #333; font-weight: 600; display: block; margin-bottom: 8px;">Reading Speed (ms/char)</label>
          <input type="range" id="braille-speed" min="100" max="1000" value="300" step="50" style="width: 100%;">
          <div style="text-align: center; font-size: 12px; color: #666; margin-top: 4px;">
            <span id="speed-value">300</span> ms
          </div>
        </div>

        <div style="display: flex; gap: 10px; margin-bottom: 12px;">
          <button id="braille-read-page" style="flex: 1; padding: 12px; background: #667eea; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 13px;">
            📖 Read Page
          </button>
          <button id="braille-pause" style="flex: 1; padding: 12px; background: #f59e0b; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 13px; display: none;">
            ⏸ Pause
          </button>
        </div>

        <button id="braille-read-selection" style="width: 100%; padding: 12px; background: white; color: #667eea; border: 2px solid #667eea; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 13px; margin-bottom: 12px;">
          📝 Read Selection
        </button>

        <div style="background: #f8f9fa; padding: 12px; border-radius: 8px;">
          <div style="font-size: 11px; color: #666; line-height: 1.5;">
            <strong>Current character:</strong>
            <div id="current-char" style="font-size: 24px; text-align: center; margin: 8px 0; color: #333; font-weight: bold;">-</div>
            <div style="text-align: center; font-size: 11px; color: #999;">
              Position: <span id="char-position">0</span> / <span id="total-chars">0</span>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(controlPanel);

    document.getElementById('braille-close').addEventListener('click', closeBrailleBox);
    document.getElementById('braille-read-page').addEventListener('click', readPage);
    document.getElementById('braille-pause').addEventListener('click', pauseReading);
    document.getElementById('braille-read-selection').addEventListener('click', readSelection);
    
    const speedSlider = document.getElementById('braille-speed');
    speedSlider.addEventListener('input', (e) => {
      document.getElementById('speed-value').textContent = e.target.value;
    });

    console.log('Braille Box: Control panel created');
  }

  function extractPageText() {
    console.log('Braille Box: Extracting page text...');
    
    const mainSelectors = ['main', 'article', '#content', '.content', '.post-content'];
    let mainElement = null;

    for (const selector of mainSelectors) {
      mainElement = document.querySelector(selector);
      if (mainElement) break;
    }

    if (!mainElement) {
      mainElement = document.body;
    }

    const elements = mainElement.querySelectorAll('h1, h2, h3, p, li');
    let text = '';

    elements.forEach(el => {
      if (el.closest('nav, aside, footer, header, .sidebar, .menu, .advertisement')) {
        return;
      }

      const elementText = el.textContent.trim();
      if (elementText.length > 0) {
        if (el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3') {
          text += '\n\n' + elementText + '\n\n';
        } else {
          text += elementText + ' ';
        }
      }
    });

    return text.trim();
  }

  async function readPage() {
    const text = extractPageText();
    
    if (!text) {
      showToast('No text found on page', 'error');
      return;
    }

    await startReading(text);
  }

  async function readSelection() {
    const selection = window.getSelection().toString().trim();
    
    if (!selection) {
      showToast('Please select some text first', 'error');
      return;
    }

    await startReading(selection);
  }

  async function startReading(text) {
    if (isReading) {
      showToast('Already reading...', 'error');
      return;
    }

    console.log('Braille Box: Starting to read text...', text.substring(0, 100));

    const cleanText = text.toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^a-z0-9\s.,?!\-/:;\n]/g, '');

    textQueue = cleanText.split('');
    currentIndex = 0;
    isReading = true;

    document.getElementById('braille-read-page').style.display = 'none';
    document.getElementById('braille-pause').style.display = 'block';
    document.getElementById('total-chars').textContent = textQueue.length;

    showToast(`📖 Reading ${textQueue.length} characters...`, 'success');

    await sendNextCharacter();
  }

  async function sendNextCharacter() {
    if (!isReading || currentIndex >= textQueue.length) {
      finishReading();
      return;
    }

    const char = textQueue[currentIndex];
    const braillePattern = brailleMap[char] || '000000';

    document.getElementById('current-char').textContent = char === ' ' ? '(space)' : char;
    document.getElementById('char-position').textContent = currentIndex + 1;

    try {
      const data = braillePattern + '\n';
      await writer.write(new TextEncoder().encode(data));
      
      console.log(`Braille Box: Sent '${char}' -> ${braillePattern}`);
      document.getElementById('braille-status').textContent = `Reading: "${char}"`;

    } catch (error) {
      console.error('Braille Box: Send error:', error);
      showToast('Connection lost', 'error');
      finishReading();
      return;
    }

    currentIndex++;

    const speed = parseInt(document.getElementById('braille-speed').value);
    setTimeout(() => {
      if (isReading) {
        sendNextCharacter();
      }
    }, speed);
  }

  function pauseReading() {
    isReading = false;
    document.getElementById('braille-read-page').style.display = 'block';
    document.getElementById('braille-pause').style.display = 'none';
    document.getElementById('braille-status').textContent = 'Paused';
    showToast('⏸ Paused', 'info');
  }

  function finishReading() {
    isReading = false;
    document.getElementById('braille-read-page').style.display = 'block';
    document.getElementById('braille-pause').style.display = 'none';
    document.getElementById('braille-status').textContent = 'Finished reading';
    document.getElementById('current-char').textContent = '-';
    showToast('✅ Finished reading', 'success');
  }

  async function closeBrailleBox() {
    brailleBoxEnabled = false;
    isReading = false;

    try {
      if (writer) {
        writer.releaseLock();
        writer = null;
      }

      if (serialPort) {
        await serialPort.close();
        serialPort = null;
      }

      console.log('Braille Box: Disconnected');
    } catch (error) {
      console.error('Braille Box: Disconnect error:', error);
    }

    if (controlPanel) {
      controlPanel.remove();
      controlPanel = null;
    }

    showToast('Braille Box disconnected', 'info');
  }

  function showToast(message, type = 'info') {
    const existingToast = document.getElementById('braille-toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.id = 'braille-toast';
    
    const colors = {
      success: '#22c55e',
      error: '#ef4444',
      info: '#667eea'
    };

    toast.style.cssText = `
      position: fixed;
      top: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: ${colors[type] || colors.info};
      color: white;
      padding: 14px 24px;
      border-radius: 25px;
      font-weight: 600;
      font-size: 14px;
      z-index: 9999999;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
    `;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'TOGGLE_BRAILLE_BOX') {
      brailleBoxEnabled = !brailleBoxEnabled;
      
      if (brailleBoxEnabled) {
        enableBrailleBox();
        sendResponse({ success: true, enabled: true });
      } else {
        closeBrailleBox();
        sendResponse({ success: true, enabled: false });
      }
      
      return true;
    }
  });

  console.log('Braille Box: Ready');
})();

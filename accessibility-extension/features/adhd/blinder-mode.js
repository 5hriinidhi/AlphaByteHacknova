// Blinder Mode - Reading mask that follows cursor
(function() {
  let blinderEnabled = false;
  let overlay = null;
  let window = null;

  function createBlinder() {
    // Create overlay
    overlay = document.createElement('div');
    overlay.className = 'focus-tunnel-overlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 999998;
      pointer-events: none;
    `;

    // Create reading window
    window = document.createElement('div');
    window.className = 'focus-tunnel-window';
    window.style.cssText = `
      position: fixed;
      left: 0;
      right: 0;
      height: 120px;
      top: 40%;
      transform: translateY(-50%);
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7);
      pointer-events: none;
      transition: top 0.1s ease;
    `;

    overlay.appendChild(window);
    document.body.appendChild(overlay);

    // Arrow key controls
    document.addEventListener('keydown', handleKeyDown);

    console.log('Blinder Mode: Activated');
  }

  function handleKeyDown(e) {
    if (!blinderEnabled || !window) return;

    const currentTop = parseInt(window.style.top || '40', 10);
    
    if (e.key === 'ArrowDown') {
      window.style.top = Math.min(currentTop + 5, 80) + '%';
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      window.style.top = Math.max(currentTop - 5, 10) + '%';
      e.preventDefault();
    }
  }

  function removeBlinder() {
    if (overlay) {
      overlay.remove();
      overlay = null;
      window = null;
    }
    document.removeEventListener('keydown', handleKeyDown);
    console.log('Blinder Mode: Deactivated');
  }

  // Listen for toggle message
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'TOGGLE_BLINDER') {
      blinderEnabled = !blinderEnabled;
      
      if (blinderEnabled) {
        createBlinder();
      } else {
        removeBlinder();
      }
      
      sendResponse({ success: true, enabled: blinderEnabled });
    }
  });

  console.log('Blinder Mode: Ready');
})();

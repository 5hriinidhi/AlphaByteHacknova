// Big Click - Expands clickable areas
(function() {
  let bigClickEnabled = false;

  function enableBigClick() {
    document.body.classList.add('big-click-mode');
    console.log('Big Click: Enabled');
  }

  function disableBigClick() {
    document.body.classList.remove('big-click-mode');
    console.log('Big Click: Disabled');
  }

  // Listen for toggle message
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'TOGGLE_BIG_CLICK') {
      bigClickEnabled = !bigClickEnabled;
      
      if (bigClickEnabled) {
        enableBigClick();
      } else {
        disableBigClick();
      }
      
      sendResponse({ success: true, enabled: bigClickEnabled });
    }
  });

  // Auto-enable for motor disability students
  chrome.storage.sync.get('disability_type', (result) => {
    if (result.disability_type === 'motor') {
      bigClickEnabled = true;
      enableBigClick();
    }
  });

  console.log('Big Click: Ready');
})();

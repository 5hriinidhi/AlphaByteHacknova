// Bionic Reading - Bolds first half of each word
(function() {
  let bionicEnabled = false;

  function applyBionicReading(root) {
    if (!root) root = document.body;
    
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      null
    );

    const textNodes = [];
    let node;
    
    while ((node = walker.nextNode())) {
      // Skip script, style, etc.
      const parent = node.parentElement;
      if (parent && !['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)) {
        textNodes.push(node);
      }
    }

    textNodes.forEach((textNode) => {
      const text = textNode.textContent || '';
      if (!text.trim()) return;

      const words = text.split(' ');
      const html = words.map((word) => {
        const clean = word.trim();
        if (!clean) return word;
        
        const mid = Math.ceil(clean.length / 2);
        const first = clean.slice(0, mid);
        const second = clean.slice(mid);
        
        return `<strong>${first}</strong>${second}`;
      }).join(' ');

      const span = document.createElement('span');
      span.innerHTML = html;
      span.classList.add('bionic-text');
      
      textNode.parentNode?.replaceChild(span, textNode);
    });

    console.log('Bionic Reading: Applied to page');
  }

  function removeBionicReading() {
    document.querySelectorAll('.bionic-text').forEach(span => {
      const text = span.textContent;
      const textNode = document.createTextNode(text);
      span.parentNode?.replaceChild(textNode, span);
    });
    console.log('Bionic Reading: Removed from page');
  }

  // Listen for toggle message
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'TOGGLE_BIONIC') {
      bionicEnabled = !bionicEnabled;
      
      if (bionicEnabled) {
        applyBionicReading();
      } else {
        removeBionicReading();
      }
      
      sendResponse({ success: true, enabled: bionicEnabled });
    }
  });

  console.log('Bionic Reading: Ready');
})();

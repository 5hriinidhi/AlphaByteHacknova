// TL;DR Button - AI Summary
(function() {
  let tldrButton = null;
  let summaryModal = null;

  function createTLDRButton() {
    tldrButton = document.createElement('button');
    tldrButton.id = 'tldr-floating-btn';
    tldrButton.textContent = '📝 TL;DR';
    tldrButton.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 24px;
      z-index: 999996;
      padding: 14px 24px;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      border: none;
      border-radius: 25px;
      font-weight: 600;
      font-size: 15px;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(245, 87, 108, 0.4);
      transition: all 0.2s;
    `;

    tldrButton.addEventListener('mouseenter', () => {
      tldrButton.style.transform = 'scale(1.05)';
    });

    tldrButton.addEventListener('mouseleave', () => {
      tldrButton.style.transform = 'scale(1)';
    });

    tldrButton.addEventListener('click', generateSummary);

    document.body.appendChild(tldrButton);
    console.log('TL;DR Button: Created');
  }

  function extractPageText() {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          
          const style = window.getComputedStyle(parent);
          if (style.display === 'none' || 
              style.visibility === 'hidden' || 
              style.opacity === '0') {
            return NodeFilter.FILTER_REJECT;
          }
          
          return node.textContent && node.textContent.trim()
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        }
      }
    );

    const parts = [];
    let node;
    while ((node = walker.nextNode())) {
      parts.push(node.textContent);
    }

    return parts.join(' ').substring(0, 3000); // Limit text
  }

  async function generateSummary() {
    tldrButton.textContent = '⏳ Loading...';
    tldrButton.disabled = true;

    try {
      const pageText = extractPageText();
      
      // Send to service worker to call Perplexity
      const response = await chrome.runtime.sendMessage({
        type: 'GENERATE_TLDR',
        text: pageText
      });

      if (response.success) {
        showSummaryModal(response.summary);
      } else {
        showSummaryModal('❌ Could not generate summary. Please try again.');
      }
    } catch (error) {
      console.error('TL;DR Error:', error);
      showSummaryModal('❌ Error generating summary.');
    } finally {
      tldrButton.textContent = '📝 TL;DR';
      tldrButton.disabled = false;
    }
  }

  function showSummaryModal(summary) {
    if (summaryModal) summaryModal.remove();

    summaryModal = document.createElement('div');
    summaryModal.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.7); z-index: 9999999; display: flex; align-items: center; justify-content: center; padding: 20px;">
        <div style="background: white; border-radius: 16px; max-width: 600px; width: 100%; max-height: 80vh; overflow-y: auto; padding: 24px; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0; font-size: 20px; color: #333;">📝 TL;DR Summary</h3>
            <button id="close-tldr" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #999;">✕</button>
          </div>
          <div style="font-size: 15px; line-height: 1.7; color: #333; white-space: pre-wrap;">${summary}</div>
        </div>
      </div>
    `;

    document.body.appendChild(summaryModal);

    summaryModal.querySelector('#close-tldr').addEventListener('click', () => {
      summaryModal.remove();
      summaryModal = null;
    });

    summaryModal.addEventListener('click', (e) => {
      if (e.target === summaryModal.firstElementChild) {
        summaryModal.remove();
        summaryModal = null;
      }
    });
  }

  function removeTLDRButton() {
    if (tldrButton) {
      tldrButton.remove();
      tldrButton = null;
    }
    if (summaryModal) {
      summaryModal.remove();
      summaryModal = null;
    }
  }

  // Auto-create on ADHD pages
  chrome.storage.sync.get('disability_type', (result) => {
    if (result.disability_type === 'adhd') {
      createTLDRButton();
    }
  });

  console.log('TL;DR Button: Ready');
})();

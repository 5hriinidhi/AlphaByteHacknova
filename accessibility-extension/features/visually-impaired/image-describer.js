// Image Describer - AI-powered image descriptions
(function() {
  let describerEnabled = false;
  let activeDescriptions = new Map();

  function enableImageDescriber() {
    console.log('Image Describer: Scanning images...');
    
    // Find all images without alt text
    const images = document.querySelectorAll('img');
    let count = 0;

    images.forEach((img, index) => {
      const hasAlt = img.alt && img.alt.trim().length > 0;
      
      if (!hasAlt && img.offsetWidth > 50 && img.offsetHeight > 50) {
        addDescribeButton(img, index);
        count++;
      }
    });

    console.log(`Image Describer: Found ${count} images without alt text`);
  }

  function addDescribeButton(img, index) {
    // Create container for image and button
    const container = document.createElement('div');
    container.style.cssText = 'position: relative; display: inline-block;';
    
    img.parentNode.insertBefore(container, img);
    container.appendChild(img);

    // Create describe button
    const button = document.createElement('button');
    button.className = 'image-describe-btn';
    button.innerHTML = '🔊 Describe';
    button.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      padding: 8px 14px;
      background: rgba(102, 126, 234, 0.95);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transition: all 0.2s;
    `;

    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.05)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
    });

    button.addEventListener('click', async () => {
      await describeImage(img, button, index);
    });

    container.appendChild(button);
  }

  async function describeImage(img, button, index) {
    button.textContent = '⏳ Analyzing...';
    button.disabled = true;

    try {
      // Get image data
      const imageUrl = img.src;
      
      // Send to service worker for AI description
      const response = await chrome.runtime.sendMessage({
        type: 'DESCRIBE_IMAGE',
        imageUrl: imageUrl
      });

      if (response.success && response.description) {
        const description = response.description;
        activeDescriptions.set(index, description);
        
        // Update button
        button.textContent = '🔊 Listen';
        button.disabled = false;
        
        // Speak description
        speakDescription(description);
        
        // Show description overlay
        showDescriptionOverlay(img, description);
      } else {
        throw new Error(response.error || 'Could not generate description');
      }
    } catch (error) {
      console.error('Image Describer: Error', error);
      button.textContent = '❌ Error';
      setTimeout(() => {
        button.textContent = '🔊 Describe';
        button.disabled = false;
      }, 2000);
    }
  }

  function speakDescription(text) {
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    
    speechSynthesis.speak(utterance);
  }

  function showDescriptionOverlay(img, description) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
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

    overlay.innerHTML = `
      <div style="background: white; border-radius: 16px; max-width: 600px; width: 100%; padding: 24px; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="margin: 0; font-size: 20px; color: #333;">Image Description</h3>
          <button id="close-desc" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #999;">✕</button>
        </div>
        <img src="${img.src}" style="width: 100%; max-height: 300px; object-fit: contain; margin-bottom: 16px; border-radius: 8px;">
        <p style="font-size: 16px; line-height: 1.7; color: #333; margin: 0;">${description}</p>
        <button id="speak-again" style="margin-top: 16px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">🔊 Speak Again</button>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('#close-desc').addEventListener('click', () => {
      speechSynthesis.cancel();
      overlay.remove();
    });

    overlay.querySelector('#speak-again').addEventListener('click', () => {
      speakDescription(description);
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        speechSynthesis.cancel();
        overlay.remove();
      }
    });
  }

  function disableImageDescriber() {
    document.querySelectorAll('.image-describe-btn').forEach(btn => btn.remove());
    activeDescriptions.clear();
    speechSynthesis.cancel();
    console.log('Image Describer: Disabled');
  }

  // Listen for toggle message
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'TOGGLE_IMAGE_DESCRIBER') {
      describerEnabled = !describerEnabled;
      
      if (describerEnabled) {
        enableImageDescriber();
        sendResponse({ success: true, enabled: true });
      } else {
        disableImageDescriber();
        sendResponse({ success: true, enabled: false });
      }
      
      return true;
    }
  });

  console.log('Image Describer: Ready');
})();

// AI Assistant Panel - Fixed Version
(function() {
  console.log('Assistant Panel: Loading...');

  class AssistantPanel {
    constructor() {
      this.container = null;
      this.currentTopic = '';
      this.contentObserver = null;
      this.feedbackHistory = [];
      this.isDragging = false;
      this.dragOffset = { x: 0, y: 0 };
      this.currentWidth = 360;
      this.currentHeight = 'auto'; // Changed to auto
      this.minWidth = 300;
      this.minHeight = 300;
      this.maxWidth = 700;
      this.resizeStep = 50;
    }

    initialize() {
      this.injectStyles();
      this.createUI();
      this.attachEventListeners();
      this.makeDraggable();
      this.attachResizeButtons();
      this.startContentMonitoring();
      console.log('Assistant Panel: Initialized with resize buttons!');
    }

    attachResizeButtons() {
      console.log('Assistant Panel: Attaching resize buttons...');
      
      const widthPlus = document.getElementById('resize-width-plus');
      const widthMinus = document.getElementById('resize-width-minus');
      
      if (widthPlus) {
        widthPlus.addEventListener('click', () => {
          this.resizePanel('width', this.resizeStep);
        });
      }
      
      if (widthMinus) {
        widthMinus.addEventListener('click', () => {
          this.resizePanel('width', -this.resizeStep);
        });
      }
      
      console.log('Assistant Panel: Resize buttons attached!');
    }

    resizePanel(dimension, change) {
      if (dimension === 'width') {
        this.currentWidth += change;
        this.currentWidth = Math.max(this.minWidth, Math.min(this.currentWidth, this.maxWidth));
        this.container.style.width = this.currentWidth + 'px';
        console.log('New width:', this.currentWidth);
        this.adjustContentForSize(this.currentWidth);
      }
    }

    adjustContentForSize(width) {
      const scaleFactor = width / 360;
      
      const input = this.container.querySelector('#doubt-text-input');
      if (input) {
        const inputSize = Math.max(12, Math.min(15, 14 * scaleFactor));
        input.style.fontSize = inputSize + 'px';
      }
      
      const buttons = this.container.querySelectorAll('.understanding-btn');
      buttons.forEach(btn => {
        const fontSize = Math.max(13, Math.min(16, 15 * scaleFactor));
        btn.style.fontSize = fontSize + 'px';
      });

      const sectionHeaders = this.container.querySelectorAll('.section-header');
      sectionHeaders.forEach(header => {
        const fontSize = Math.max(13, Math.min(16, 15 * scaleFactor));
        header.style.fontSize = fontSize + 'px';
      });
    }

    makeDraggable() {
      const header = this.container.querySelector('.panel-drag-handle');
      
      header.addEventListener('mousedown', (e) => {
        if (e.target.closest('.panel-minimize-btn') || 
            e.target.closest('.resize-btn')) {
          return;
        }
        
        this.isDragging = true;
        this.dragOffset.x = e.clientX - this.container.offsetLeft;
        this.dragOffset.y = e.clientY - this.container.offsetTop;
        
        header.style.cursor = 'grabbing';
        
        e.preventDefault();
      });

      document.addEventListener('mousemove', (e) => {
        if (!this.isDragging) return;
        
        let newX = e.clientX - this.dragOffset.x;
        let newY = e.clientY - this.dragOffset.y;
        
        const maxX = window.innerWidth - this.container.offsetWidth;
        const maxY = window.innerHeight - this.container.offsetHeight;
        
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));
        
        this.container.style.left = newX + 'px';
        this.container.style.top = newY + 'px';
        this.container.style.right = 'auto';
        this.container.style.bottom = 'auto';
      });

      document.addEventListener('mouseup', () => {
        if (this.isDragging) {
          this.isDragging = false;
          header.style.cursor = 'grab';
        }
      });
    }

    startContentMonitoring() {
      console.log('Assistant Panel: Starting content monitoring...');
      
      this.detectAndPromptForTopic();
      
      this.contentObserver = new MutationObserver(() => {
        clearTimeout(this.contentCheckTimeout);
        this.contentCheckTimeout = setTimeout(() => {
          this.detectAndPromptForTopic();
        }, 2000);
      });

      this.contentObserver.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
      });

      let scrollTimeout;
      window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          this.detectAndPromptForTopic();
        }, 1500);
      });
    }

    detectAndPromptForTopic() {
      const newTopic = this.extractTopicFromPage();
      
      if (newTopic && newTopic !== this.currentTopic && !this.isTopicInRecentHistory(newTopic)) {
        console.log('Assistant Panel: New topic detected:', newTopic);
        this.currentTopic = newTopic;
        this.showFeedbackPrompt(newTopic);
      }
    }

    extractTopicFromPage() {
      let topic = '';

      const mainContentSelectors = [
        'main h1',
        'article h1',
        '#content h1',
        '.main-content h1',
        '#main h1'
      ];

      for (const selector of mainContentSelectors) {
        const heading = document.querySelector(selector);
        if (heading && heading.textContent.trim().length > 3) {
          topic = heading.textContent.trim();
          break;
        }
      }

      if (!topic && window.location.hostname.includes('wikipedia.org')) {
        const wikiTitle = document.querySelector('#firstHeading, .mw-page-title-main');
        if (wikiTitle) {
          topic = wikiTitle.textContent.trim();
        }
      }

      if (!topic) {
        const allH1s = Array.from(document.querySelectorAll('h1'));
        const mainH1s = allH1s.filter(h1 => {
          const text = h1.textContent.trim();
          if (text.length < 4) return false;
          const isInSidebar = h1.closest('nav, aside, .sidebar');
          return !isInSidebar;
        });

        if (mainH1s.length > 0) {
          topic = mainH1s[0].textContent.trim();
        }
      }

      topic = topic.replace(/\s+/g, ' ').trim();
      topic = topic.replace(/\[edit\]/gi, '').trim();
      
      if (topic.length > 100) {
        topic = topic.substring(0, 97) + '...';
      }

      const invalidTopics = ['', 'home', 'welcome', 'index', 'new tab', 'contents', 'menu'];
      if (invalidTopics.includes(topic.toLowerCase()) || topic.length < 3) {
        return null;
      }

      return topic;
    }

    isTopicInRecentHistory(topic) {
      const recentTopics = this.feedbackHistory.slice(-5);
      return recentTopics.some(item => item.topic === topic);
    }

    showFeedbackPrompt(topicName) {
      const topicDisplay = document.getElementById('current-topic-display');
      if (topicDisplay) {
        topicDisplay.textContent = `"${topicName}"`;
        topicDisplay.style.display = 'block';
      }

      const shortTopic = topicName.length > 50 ? topicName.substring(0, 47) + '...' : topicName;
      this.showToast(`📖 New topic: ${shortTopic}`);
    }

    injectStyles() {
      const style = document.createElement('style');
      style.id = 'assistant-panel-styles';
      style.textContent = `
        #assistant-panel {
          position: fixed !important;
          bottom: 24px !important;
          right: 24px !important;
          width: 360px !important;
          background: white !important;
          border: 2px solid #333 !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15) !important;
          z-index: 999997 !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif !important;
          overflow: visible !important;
          transition: width 0.3s ease !important;
        }

        .panel-drag-handle {
          padding: 12px 18px !important;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: white !important;
          font-weight: 600 !important;
          font-size: 15px !important;
          cursor: grab !important;
          user-select: none !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          border-radius: 10px 10px 0 0 !important;
        }

        .panel-drag-handle:active {
          cursor: grabbing !important;
        }

        .panel-title {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
        }

        .panel-controls {
          display: flex !important;
          gap: 8px !important;
        }

        .panel-minimize-btn {
          width: 28px !important;
          height: 28px !important;
          border: none !important;
          background: rgba(255, 255, 255, 0.2) !important;
          color: white !important;
          border-radius: 6px !important;
          cursor: pointer !important;
          font-size: 18px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.2s !important;
          font-weight: bold !important;
        }

        .panel-minimize-btn:hover {
          background: rgba(255, 255, 255, 0.35) !important;
          transform: scale(1.1) !important;
        }


       
        .panel-content {
          border-radius: 0 0 10px 10px !important;
          overflow: hidden !important;
        }

        .panel-section {
          border-bottom: 2px solid #e5e5e5 !important;
        }

        .panel-section:last-child {
          border-bottom: none !important;
        }

        .section-header {
          padding: 12px 18px !important;
          background: #f8f9fa !important;
          font-weight: 600 !important;
          font-size: 14px !important;
          color: #333 !important;
          border-bottom: 1px solid #e5e5e5 !important;
        }

        .doubt-input-area {
          padding: 16px 18px !important;
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
        }

        #doubt-text-input {
          flex: 1 !important;
          padding: 11px 14px !important;
          border: 2px solid #ddd !important;
          border-radius: 8px !important;
          font-size: 14px !important;
          outline: none !important;
          font-family: inherit !important;
          transition: border-color 0.2s !important;
        }

        #doubt-text-input:focus {
          border-color: #667eea !important;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
        }

        #doubt-send-btn,
        #doubt-mic-btn {
          width: 44px !important;
          height: 44px !important;
          border: 2px solid #ddd !important;
          border-radius: 50% !important;
          background: white !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 18px !important;
          transition: all 0.2s !important;
          flex-shrink: 0 !important;
        }

        #doubt-send-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          border-color: #667eea !important;
          color: white !important;
          font-size: 20px !important;
        }

        #doubt-send-btn:hover {
          transform: scale(1.08) !important;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4) !important;
        }

        #doubt-mic-btn:hover {
          background: #f5f5f5 !important;
          border-color: #667eea !important;
          transform: scale(1.08) !important;
        }

        #doubt-mic-btn.recording {
          background: #ffebee !important;
          border-color: #f56565 !important;
          animation: pulse 1.5s infinite !important;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        .understanding-section {
          padding: 16px 18px 18px 18px !important;
        }

        .understanding-header-text {
          font-size: 14px !important;
          color: #555 !important;
          font-weight: 500 !important;
          margin-bottom: 14px !important;
          line-height: 1.5 !important;
        }

        .current-topic {
          display: block !important;
          font-size: 13px !important;
          color: #667eea !important;
          font-weight: 600 !important;
          margin-top: 6px !important;
          font-style: italic !important;
        }

        .understanding-buttons {
          display: flex !important;
          flex-direction: column !important;
          gap: 10px !important;
        }

        .understanding-btn {
          padding: 12px !important;
          border: 2px solid !important;
          border-radius: 8px !important;
          background: white !important;
          cursor: pointer !important;
          font-size: 15px !important;
          font-weight: 600 !important;
          transition: all 0.2s !important;
          text-align: center !important;
        }

        .understanding-btn:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
        }

        #yes-btn {
          border-color: #48bb78 !important;
          color: #48bb78 !important;
        }

        #yes-btn:hover {
          background: #48bb78 !important;
          color: white !important;
        }

        #no-btn {
          border-color: #f56565 !important;
          color: #f56565 !important;
        }

        #no-btn:hover {
          background: #f56565 !important;
          color: white !important;
        }

        .panel-toast {
          position: fixed !important;
          bottom: 40px !important;
          right: 400px !important;
          transform: translateX(100px) !important;
          padding: 14px 24px !important;
          background: #333 !important;
          color: white !important;
          border-radius: 10px !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3) !important;
          z-index: 999999 !important;
          opacity: 0 !important;
          transition: all 0.3s ease !important;
          max-width: 300px !important;
        }

        .panel-toast.show {
          opacity: 1 !important;
          transform: translateX(0) !important;
        }

        /* MINIMIZED STATE */
        #assistant-panel.minimized {
          width: 280px !important;
        }

        #assistant-panel.minimized .panel-content {
          display: none !important;
        }

        #assistant-panel.minimized .resize-controls {
          display: none !important;
        }

        #assistant-panel.minimized .panel-drag-handle {
          border-radius: 10px !important;
        }
      `;
      document.head.appendChild(style);
    }

    createUI() {
      this.container = document.createElement('div');
      this.container.id = 'assistant-panel';
      this.container.innerHTML = `
        <div class="panel-drag-handle">
          <div class="panel-title">
            <span>🤖</span>
            <span>AI Assistant</span>
          </div>
          <div class="panel-controls">
            <button class="panel-minimize-btn" title="Minimize">−</button>
          </div>
        </div>

        <div class="panel-content">
          <div class="panel-section">
            <div class="section-header">Ask a doubt</div>
            <div class="doubt-input-area">
              <input type="text" id="doubt-text-input" placeholder="Type your doubt...">
              <button id="doubt-send-btn">➤</button>
              <button id="doubt-mic-btn">🎤</button>
            </div>
          </div>

          <div class="panel-section">
            <div class="section-header">Understanding Check</div>
            <div class="understanding-section">
              <div class="understanding-header-text">
                Do you understand the topic onscreen?
                <span class="current-topic" id="current-topic-display"></span>
              </div>
              <div class="understanding-buttons">
                <button class="understanding-btn" id="yes-btn">✓ Yes, I understand</button>
                <button class="understanding-btn" id="no-btn">✗ No, I have doubts</button>
              </div>
            </div>
          </div>
        </div>

        

        <div class="panel-toast" id="panel-toast">✓ Feedback sent!</div>
      `;
      document.body.appendChild(this.container);
      
      console.log('Assistant Panel: UI created!');
    }

    attachEventListeners() {
      const doubtInput = document.getElementById('doubt-text-input');
      doubtInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.submitDoubt(doubtInput.value);
          doubtInput.value = '';
        }
      });

      const sendBtn = document.getElementById('doubt-send-btn');
      sendBtn?.addEventListener('click', () => {
        const doubtInput = document.getElementById('doubt-text-input');
        if (doubtInput) {
          this.submitDoubt(doubtInput.value);
          doubtInput.value = '';
        }
      });

      const micBtn = document.getElementById('doubt-mic-btn');
      micBtn?.addEventListener('click', () => this.startVoiceInput());

      const yesBtn = document.getElementById('yes-btn');
      const noBtn = document.getElementById('no-btn');
      
      yesBtn?.addEventListener('click', () => this.handleUnderstanding('understood'));
      noBtn?.addEventListener('click', () => this.handleUnderstanding('doubt'));

      // MINIMIZE FUNCTIONALITY
      const minimizeBtn = this.container.querySelector('.panel-minimize-btn');
      minimizeBtn?.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent dragging when clicking minimize
        const isMinimized = this.container.classList.toggle('minimized');
        minimizeBtn.textContent = isMinimized ? '+' : '−';
        minimizeBtn.title = isMinimized ? 'Expand' : 'Minimize';
        console.log('Panel minimized:', isMinimized);
      });
    }

    submitDoubt(doubtText) {
      if (!doubtText.trim()) return;

      console.log('✅ Assistant Panel: Doubt submitted:', doubtText);

      const topic = this.currentTopic || this.extractTopicFromPage() || 'General';
      const pageContent = this.extractPageContent();

      this.showToast('🤔 AI is thinking...');
      
      this.getAIResponse(doubtText, pageContent, topic)
        .then(aiResponse => {
          this.showAIResponseModal(doubtText, aiResponse);
        })
        .catch(error => {
          console.error('❌ Assistant Panel: Error:', error);
          this.showToast('❌ ' + error.message);
        });
    }

    async handleUnderstanding(type) {
  const topic = this.currentTopic || this.extractTopicFromPage() || 'General';
  
  console.log(`Assistant Panel: ${type} - Topic: "${topic}"`);

  // Add to local history
  this.feedbackHistory.push({
    topic: topic,
    type: type,
    timestamp: new Date().toISOString()
  });

  // ========== SAVE TO SUPABASE ==========
  try {
    const studentData = await chrome.storage.sync.get(['logged_in', 'roll_number', 'student_name']);
    
    if (studentData.logged_in && studentData.roll_number && studentData.student_name) {
      await supabaseInsert('understanding_feedback', {
        roll_number: studentData.roll_number,
        student_name: studentData.student_name,
        topic: topic,
        feedback_type: type,
        page_url: window.location.href,
        given_at: new Date().toISOString()
      });
      
      console.log('✅ Feedback saved to Supabase!');
    } else {
      console.warn('⚠️ Not logged in. Feedback not saved.');
      this.showToast('⚠️ Please login to save feedback');
    }
  } catch (error) {
    console.error('❌ Failed to save to Supabase:', error);
  }
  // ========== END SUPABASE ==========

  const message = type === 'understood' 
    ? `✓ "${topic}" marked as understood!` 
    : `? Doubt recorded for "${topic}"`;
  
  this.showToast(message);

  const topicDisplay = document.getElementById('current-topic-display');
  if (topicDisplay) {
    topicDisplay.textContent = '';
  }
}


    showToast(message) {
      const toast = document.getElementById('panel-toast');
      if (!toast) return;
      
      toast.textContent = message;
      toast.classList.add('show');

      setTimeout(() => {
        toast.classList.remove('show');
      }, 3000);
    }

    startVoiceInput() {
      if (!('webkitSpeechRecognition' in window)) {
        alert('Voice input not supported in this browser');
        return;
      }

      const recognition = new webkitSpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.continuous = false;

      const micBtn = document.getElementById('doubt-mic-btn');

      recognition.onstart = () => micBtn?.classList.add('recording');
      recognition.onend = () => micBtn?.classList.remove('recording');
      recognition.onerror = () => micBtn?.classList.remove('recording');

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const input = document.getElementById('doubt-text-input');
        if (input) {
          input.value = transcript;
          this.submitDoubt(transcript);
        }
      };

      recognition.start();
    }

    extractPageContent() {
      let content = '';

      const mainContentSelectors = [
        'main',
        'article',
        '#content',
        '.main-content',
        'body'
      ];

      let mainElement = null;
      for (const selector of mainContentSelectors) {
        mainElement = document.querySelector(selector);
        if (mainElement) break;
      }

      if (!mainElement) {
        mainElement = document.body;
      }

      const textElements = mainElement.querySelectorAll('p, h1, h2, h3, li');
      
      const texts = [];
      textElements.forEach(el => {
        const text = el.textContent.trim();
        const isHidden = el.offsetParent === null;
        const isInNav = el.closest('nav, aside, .sidebar, header, footer');
        
        if (!isHidden && !isInNav && text.length > 10 && text.length < 500) {
          texts.push(text);
        }
      });

      const uniqueTexts = [...new Set(texts)];
      content = uniqueTexts.slice(0, 30).join('\n');

      if (content.length > 4000) {
        content = content.substring(0, 4000);
      }

      return content;
    }

    async getAIResponse(question, pageContent, topic) {
      try {
        const response = await chrome.runtime.sendMessage({
          type: 'GET_AI_RESPONSE',
          question: question,
          context: pageContent,
          topic: topic
        });

        if (response && response.success && response.answer) {
          return response.answer;
        } else {
          throw new Error(response.error || 'No response from AI');
        }
      } catch (error) {
        console.error('Assistant Panel: Message error:', error);
        throw error;
      }
    }

    showAIResponseModal(question, answer) {
      const existingModal = document.getElementById('ai-response-modal');
      if (existingModal) {
        existingModal.remove();
      }

      const modal = document.createElement('div');
      modal.id = 'ai-response-modal';
      modal.innerHTML = `
        <div class="ai-modal-overlay">
          <div class="ai-modal-content">
            <div class="ai-modal-header">
              <span>🤖 AI Assistant Response</span>
              <button class="ai-modal-close">✕</button>
            </div>
            <div class="ai-modal-body">
              <div class="ai-modal-question">
                <strong>Your Question:</strong>
                <p>${question}</p>
              </div>
              <div class="ai-modal-answer">
                <strong>Answer:</strong>
                <p>${answer}</p>
              </div>
            </div>
            <div class="ai-modal-footer">
              <button class="ai-modal-btn" id="ai-modal-understood">I Understood</button>
              <button class="ai-modal-btn ai-modal-btn-secondary" id="ai-modal-still-doubt">Still Have Doubt</button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
      this.injectModalStyles();

      modal.querySelector('.ai-modal-close').addEventListener('click', () => {
        modal.remove();
      });

      modal.querySelector('.ai-modal-overlay').addEventListener('click', (e) => {
        if (e.target.classList.contains('ai-modal-overlay')) {
          modal.remove();
        }
      });

      document.getElementById('ai-modal-understood').addEventListener('click', () => {
        this.handleUnderstanding('understood');
        modal.remove();
      });

      document.getElementById('ai-modal-still-doubt').addEventListener('click', () => {
        this.handleUnderstanding('doubt');
        modal.remove();
      });
    }

    injectModalStyles() {
      if (document.getElementById('ai-modal-styles')) return;

      const style = document.createElement('style');
      style.id = 'ai-modal-styles';
      style.textContent = `
        .ai-modal-overlay {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          background: rgba(0, 0, 0, 0.7) !important;
          z-index: 9999999 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 20px !important;
        }

        .ai-modal-content {
          background: white !important;
          border-radius: 16px !important;
          max-width: 600px !important;
          width: 100% !important;
          max-height: 80vh !important;
          overflow: hidden !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
          display: flex !important;
          flex-direction: column !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif !important;
        }

        .ai-modal-header {
          padding: 20px 24px !important;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: white !important;
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          font-weight: 600 !important;
          font-size: 18px !important;
        }

        .ai-modal-close {
          background: rgba(255, 255, 255, 0.2) !important;
          border: none !important;
          color: white !important;
          font-size: 24px !important;
          cursor: pointer !important;
          width: 36px !important;
          height: 36px !important;
          border-radius: 8px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: background 0.2s !important;
        }

        .ai-modal-close:hover {
          background: rgba(255, 255, 255, 0.3) !important;
        }

        .ai-modal-body {
          padding: 24px !important;
          overflow-y: auto !important;
          flex: 1 !important;
        }

        .ai-modal-question,
        .ai-modal-answer {
          margin-bottom: 20px !important;
        }

        .ai-modal-question strong,
        .ai-modal-answer strong {
          display: block !important;
          margin-bottom: 8px !important;
          color: #333 !important;
          font-size: 15px !important;
        }

        .ai-modal-question p {
          background: #f8f9fa !important;
          padding: 12px 16px !important;
          border-radius: 8px !important;
          color: #333 !important;
          font-size: 14px !important;
          line-height: 1.6 !important;
          border-left: 4px solid #667eea !important;
        }

        .ai-modal-answer p {
          background: #f0f7ff !important;
          padding: 16px !important;
          border-radius: 8px !important;
          color: #1a202c !important;
          font-size: 14px !important;
          line-height: 1.7 !important;
          border-left: 4px solid #48bb78 !important;
          white-space: pre-wrap !important;
        }

        .ai-modal-footer {
          padding: 16px 24px !important;
          border-top: 1px solid #e2e8f0 !important;
          display: flex !important;
          gap: 12px !important;
        }

        .ai-modal-btn {
          flex: 1 !important;
          padding: 12px 20px !important;
          border: none !important;
          border-radius: 8px !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          transition: all 0.2s !important;
          background: linear-gradient(135deg, #48bb78 0%, #38a169 100%) !important;
          color: white !important;
        }

        .ai-modal-btn:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 4px 12px rgba(72, 187, 120, 0.4) !important;
        }

        .ai-modal-btn-secondary {
          background: white !important;
          color: #f56565 !important;
          border: 2px solid #f56565 !important;
        }

        .ai-modal-btn-secondary:hover {
          background: #f56565 !important;
          color: white !important;
          box-shadow: 0 4px 12px rgba(245, 101, 101, 0.4) !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const panel = new AssistantPanel();
      panel.initialize();
    });
  } else {
    const panel = new AssistantPanel();
    panel.initialize();
  }

  console.log('Assistant Panel: Ready! 🚀');
})();

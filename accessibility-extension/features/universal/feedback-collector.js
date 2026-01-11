// Feedback Collector - "I understood" / "I have a doubt" buttons
(function() {
  console.log('Feedback Collector: Loading...');

  class FeedbackCollector {
    constructor() {
      this.container = null;
      this.currentTopic = '';
    }

    initialize() {
      this.detectCurrentTopic();
      this.injectStyles();
      this.createUI();
      this.attachEventListeners();
      console.log('Feedback Collector: Initialized');
    }

    detectCurrentTopic() {
      // Try to detect the current topic from page title or heading
      this.currentTopic = document.title || 'Current Topic';
    }

    injectStyles() {
      const style = document.createElement('style');
      style.id = 'feedback-collector-styles';
      style.textContent = `
        #feedback-collector {
          position: fixed !important;
          bottom: 24px !important;
          left: 24px !important;
          z-index: 999999 !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif !important;
        }

        #feedback-buttons {
          display: flex !important;
          flex-direction: column !important;
          gap: 10px !important;
        }

        .feedback-btn {
          padding: 12px 20px !important;
          border: none !important;
          border-radius: 12px !important;
          cursor: pointer !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          transition: all 0.2s ease !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
          min-width: 160px !important;
        }

        .feedback-btn:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2) !important;
        }

        .feedback-btn:active {
          transform: translateY(0) !important;
        }

        #understood-btn {
          background: linear-gradient(135deg, #48bb78 0%, #38a169 100%) !important;
          color: white !important;
        }

        #doubt-btn {
          background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%) !important;
          color: white !important;
        }

        .feedback-icon {
          font-size: 18px !important;
        }

        /* Feedback confirmation popup */
        .feedback-confirmation {
          position: absolute !important;
          bottom: 100% !important;
          left: 0 !important;
          margin-bottom: 10px !important;
          padding: 12px 16px !important;
          background: white !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2) !important;
          font-size: 13px !important;
          white-space: nowrap !important;
          animation: fadeIn 0.3s ease !important;
          display: none !important;
        }

        .feedback-confirmation.show {
          display: block !important;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `;
      document.head.appendChild(style);
    }

    createUI() {
      this.container = document.createElement('div');
      this.container.id = 'feedback-collector';
      this.container.innerHTML = `
        <div class="feedback-confirmation" id="feedback-confirmation">
          ✓ Feedback sent!
        </div>
        <div id="feedback-buttons">
          <button class="feedback-btn" id="understood-btn">
            <span class="feedback-icon">✓</span>
            <span>I Understood</span>
          </button>
          <button class="feedback-btn" id="doubt-btn">
            <span class="feedback-icon">?</span>
            <span>I Have a Doubt</span>
          </button>
        </div>
      `;
      document.body.appendChild(this.container);
    }

    attachEventListeners() {
      const understoodBtn = document.getElementById('understood-btn');
      const doubtBtn = document.getElementById('doubt-btn');

      understoodBtn?.addEventListener('click', () => this.handleFeedback('understood'));
      doubtBtn?.addEventListener('click', () => this.handleFeedback('doubt'));
    }

    handleFeedback(type) {
      console.log('Feedback Collector: User clicked', type);

      // Update current topic
      this.detectCurrentTopic();

      // Show confirmation
      this.showConfirmation(type);

      // Send to background script to log
      chrome.runtime.sendMessage({
        type: 'LOG_FEEDBACK',
        topic: this.currentTopic,
        feedbackType: type
      }, (response) => {
        if (response && response.success) {
          console.log('Feedback Collector: Feedback logged successfully');
        }
      });
    }

    showConfirmation(type) {
      const confirmation = document.getElementById('feedback-confirmation');
      
      if (type === 'understood') {
        confirmation.textContent = '✓ Marked as understood!';
        confirmation.style.background = '#48bb78';
        confirmation.style.color = 'white';
      } else {
        confirmation.textContent = '? Doubt recorded!';
        confirmation.style.background = '#f56565';
        confirmation.style.color = 'white';
      }

      confirmation.classList.add('show');

      setTimeout(() => {
        confirmation.classList.remove('show');
      }, 2000);
    }
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const collector = new FeedbackCollector();
      collector.initialize();
    });
  } else {
    const collector = new FeedbackCollector();
    collector.initialize();
  }

  console.log('Feedback Collector: Ready!');
})();

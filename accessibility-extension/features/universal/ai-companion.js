// AI Companion - Floating button with slim sidebar chat
(function() {
  console.log('AI Companion: Loading...');

  class AICompanion {
    constructor() {
      this.isOpen = false;
      this.container = null;
      this.messages = [];
    }

    initialize() {
      this.injectStyles();
      this.createUI();
      this.attachEventListeners();
      console.log('AI Companion: Initialized');
    }

    injectStyles() {
      const style = document.createElement('style');
      style.id = 'ai-companion-styles';
      style.textContent = `
        #ai-companion-toggle {
          position: fixed !important;
          bottom: 24px !important;
          right: 24px !important;
          width: 56px !important;
          height: 56px !important;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          border-radius: 50% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 28px !important;
          cursor: pointer !important;
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.5) !important;
          z-index: 999999 !important;
          transition: all 0.3s ease !important;
        }

        #ai-companion-toggle:hover {
          transform: scale(1.1) translateY(-2px) !important;
          box-shadow: 0 6px 24px rgba(102, 126, 234, 0.6) !important;
        }

        #ai-companion-chat {
          position: fixed !important;
          top: 0 !important;
          right: 0 !important;
          width: 360px !important;
          height: 100vh !important;
          background: white !important;
          box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15) !important;
          display: none !important;
          flex-direction: column !important;
          z-index: 999998 !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif !important;
        }

        #ai-companion-chat.open {
          display: flex !important;
          animation: slideIn 0.3s ease !important;
        }

        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        #ai-companion-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: white !important;
          padding: 18px 20px !important;
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          font-weight: 600 !important;
          font-size: 17px !important;
        }

        #ai-companion-close {
          background: rgba(255, 255, 255, 0.2) !important;
          border: none !important;
          color: white !important;
          font-size: 22px !important;
          cursor: pointer !important;
          padding: 4px !important;
          width: 32px !important;
          height: 32px !important;
          border-radius: 8px !important;
          transition: all 0.2s !important;
        }

        #ai-companion-close:hover {
          background: rgba(255, 255, 255, 0.3) !important;
        }

        #ai-companion-messages {
          flex: 1 !important;
          overflow-y: auto !important;
          padding: 20px !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 12px !important;
          background: #f8f9fa !important;
        }

        .ai-message {
          padding: 10px 14px !important;
          border-radius: 16px !important;
          max-width: 80% !important;
          word-wrap: break-word !important;
          font-size: 14px !important;
          line-height: 1.5 !important;
        }

        .ai-message-user {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: white !important;
          align-self: flex-end !important;
          margin-left: auto !important;
          border-bottom-right-radius: 4px !important;
        }

        .ai-message-assistant {
          background: white !important;
          color: #2d3748 !important;
          align-self: flex-start !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08) !important;
          border-bottom-left-radius: 4px !important;
        }

        #ai-companion-input-area {
          padding: 16px 20px !important;
          border-top: 1px solid #e2e8f0 !important;
          display: flex !important;
          gap: 8px !important;
          background: white !important;
        }

        #ai-companion-input {
          flex: 1 !important;
          padding: 12px 16px !important;
          border: 2px solid #e2e8f0 !important;
          border-radius: 24px !important;
          font-size: 14px !important;
          outline: none !important;
          background: #f8f9fa !important;
        }

        #ai-companion-input:focus {
          border-color: #667eea !important;
          background: white !important;
        }

        #ai-companion-send, #ai-companion-voice {
          padding: 12px 16px !important;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: white !important;
          border: none !important;
          border-radius: 24px !important;
          cursor: pointer !important;
          font-size: 14px !important;
          font-weight: 600 !important;
        }

        #ai-companion-voice {
          padding: 12px !important;
          font-size: 16px !important;
        }
      `;
      document.head.appendChild(style);
    }

    createUI() {
      this.container = document.createElement('div');
      this.container.id = 'ai-companion-container';
      this.container.innerHTML = `
        <div id="ai-companion-toggle" title="Open AI Assistant">🤖</div>
        <div id="ai-companion-chat">
          <div id="ai-companion-header">
            <span>AI Assistant</span>
            <button id="ai-companion-close">✕</button>
          </div>
          <div id="ai-companion-messages"></div>
          <div id="ai-companion-input-area">
            <input type="text" id="ai-companion-input" placeholder="Ask me anything...">
            <button id="ai-companion-send">Send</button>
            <button id="ai-companion-voice">🎤</button>
          </div>
        </div>
      `;
      document.body.appendChild(this.container);
    }

    attachEventListeners() {
      document.getElementById('ai-companion-toggle')?.addEventListener('click', () => this.toggleChat());
      document.getElementById('ai-companion-close')?.addEventListener('click', () => this.toggleChat());
      document.getElementById('ai-companion-send')?.addEventListener('click', () => this.sendMessage());
      document.getElementById('ai-companion-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.sendMessage();
      });
    }

    toggleChat() {
      this.isOpen = !this.isOpen;
      const chat = document.getElementById('ai-companion-chat');
      const toggle = document.getElementById('ai-companion-toggle');
      
      if (this.isOpen) {
        chat.classList.add('open');
        toggle.style.display = 'none';
      } else {
        chat.classList.remove('open');
        setTimeout(() => chat.style.display = 'none', 300);
        toggle.style.display = 'flex';
      }
    }

    sendMessage() {
      const input = document.getElementById('ai-companion-input');
      const message = input?.value.trim();
      if (!message) return;
      
      this.addMessage(message, 'user');
      input.value = '';
      
      setTimeout(() => {
        this.addMessage(`You said: "${message}"`, 'assistant');
      }, 500);
    }

    addMessage(text, sender) {
      const messagesDiv = document.getElementById('ai-companion-messages');
      const messageDiv = document.createElement('div');
      messageDiv.className = `ai-message ai-message-${sender}`;
      messageDiv.textContent = text;
      messagesDiv?.appendChild(messageDiv);
      if (messagesDiv) messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const companion = new AICompanion();
      companion.initialize();
    });
  } else {
    const companion = new AICompanion();
    companion.initialize();
  }

  console.log('AI Companion: Ready!');
})();

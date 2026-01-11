// Logs usage data and syncs to Supabase
import { insertData } from './supabase-client.js';
import { TABLES, SYNC_INTERVAL } from './config.js';

class DataLogger {
  constructor() {
    this.logQueue = [];
    this.currentSessionId = null;
    this.syncTimer = null;
  }

  // Start a lab session
  async startSession(studentId, computerId) {
    console.log('DataLogger: Starting session');
    
    const sessionData = {
      student_id: studentId,
      computer_id: computerId,
      session_start: new Date().toISOString(),
      session_end: null
    };
    
    const result = await insertData(TABLES.LAB_SESSIONS, sessionData);
    
    if (result.success && result.data && result.data[0]) {
      this.currentSessionId = result.data[0].id;
      console.log('DataLogger: Session started, ID:', this.currentSessionId);
      
      // Start periodic sync
      this.startPeriodicSync();
    }
    
    return this.currentSessionId;
  }

  // Log feature usage
  logFeatureUsage(studentId, featureName, action) {
    const log = {
      table: TABLES.FEATURE_USAGE,
      data: {
        student_id: studentId,
        session_id: this.currentSessionId,
        feature_name: featureName,
        action: action,
        timestamp: new Date().toISOString()
      }
    };
    
    this.logQueue.push(log);
    console.log('DataLogger: Logged feature usage:', featureName, action);
  }

  // Log feedback (understood/doubt)
  logFeedback(studentId, topic, feedbackType) {
    const log = {
      table: TABLES.FEEDBACK_EVENTS,
      data: {
        student_id: studentId,
        session_id: this.currentSessionId,
        topic: topic,
        feedback_type: feedbackType,
        timestamp: new Date().toISOString()
      }
    };
    
    this.logQueue.push(log);
    console.log('DataLogger: Logged feedback:', feedbackType, topic);
  }

  // Log AI interaction
  logAIInteraction(studentId, query, response) {
    const log = {
      table: TABLES.AI_INTERACTIONS,
      data: {
        student_id: studentId,
        session_id: this.currentSessionId,
        query: query,
        response: response,
        timestamp: new Date().toISOString()
      }
    };
    
    this.logQueue.push(log);
    console.log('DataLogger: Logged AI interaction');
  }

  // Sync logs to database
  async syncLogs() {
    if (this.logQueue.length === 0) {
      return;
    }
    
    console.log(`DataLogger: Syncing ${this.logQueue.length} logs...`);
    
    // Group logs by table
    const logsByTable = {};
    
    for (const log of this.logQueue) {
      if (!logsByTable[log.table]) {
        logsByTable[log.table] = [];
      }
      logsByTable[log.table].push(log.data);
    }
    
    // Insert each group
    for (const [table, data] of Object.entries(logsByTable)) {
      await insertData(table, data);
    }
    
    // Clear queue
    this.logQueue = [];
    console.log('DataLogger: Sync complete');
  }

  // Start automatic syncing
  startPeriodicSync() {
    if (this.syncTimer) return;
    
    this.syncTimer = setInterval(() => {
      this.syncLogs();
    }, SYNC_INTERVAL);
    
    console.log('DataLogger: Periodic sync started');
  }

  // Stop syncing
  stopPeriodicSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
      console.log('DataLogger: Periodic sync stopped');
    }
  }
}

// Export single instance
export const dataLogger = new DataLogger();

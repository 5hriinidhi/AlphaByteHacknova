// Manages which features are active based on disability
import { FEATURE_MAPPING, UNIVERSAL_FEATURES } from './config.js';

class FeatureManager {
  constructor() {
    this.activeFeatures = new Set();
  }

  // Get features for a disability type
  getFeaturesToActivate(disabilityType) {
    const features = [];
    
    // Always add universal features
    features.push(...UNIVERSAL_FEATURES);
    
    // Add disability-specific features
    if (disabilityType && FEATURE_MAPPING[disabilityType]) {
      features.push(...FEATURE_MAPPING[disabilityType]);
    }
    
    return features;
  }

  // Activate features
  async activateFeatures(disabilityType) {
    console.log('FeatureManager: Activating features for:', disabilityType);
    
    const featuresToActivate = this.getFeaturesToActivate(disabilityType);
    
    console.log('FeatureManager: Features to activate:', featuresToActivate);
    
    // Store active features
    this.activeFeatures = new Set(featuresToActivate);
    await chrome.storage.local.set({ 
      activeFeatures: Array.from(this.activeFeatures) 
    });
    
    return featuresToActivate;
  }

  // Get currently active features
  async getActiveFeatures() {
    if (this.activeFeatures.size > 0) {
      return Array.from(this.activeFeatures);
    }
    
    // Load from storage
    const stored = await chrome.storage.local.get('activeFeatures');
    if (stored.activeFeatures) {
      this.activeFeatures = new Set(stored.activeFeatures);
      return stored.activeFeatures;
    }
    
    return [];
  }

  // Check if specific feature is active
  async isFeatureActive(featureName) {
    const active = await this.getActiveFeatures();
    return active.includes(featureName);
  }

  // Deactivate all
  async deactivateAll() {
    console.log('FeatureManager: Deactivating all features');
    
    this.activeFeatures.clear();
    await chrome.storage.local.remove('activeFeatures');
  }
}

// Export single instance
export const featureManager = new FeatureManager();

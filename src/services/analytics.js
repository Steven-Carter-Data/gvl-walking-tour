import ReactGA from 'react-ga4';
import { logAnalyticsEvent } from './firestore.js';

// Initialize GA4 - Replace with your actual Measurement ID from Google Analytics
const GA4_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID;

let ga4Initialized = false;

export const initGA4 = () => {
  if (GA4_MEASUREMENT_ID && GA4_MEASUREMENT_ID !== 'G-XXXXXXXXXX' && !ga4Initialized) {
    ReactGA.initialize(GA4_MEASUREMENT_ID);
    ga4Initialized = true;
    console.log('📊 Google Analytics 4 initialized');
  } else if (!GA4_MEASUREMENT_ID) {
    console.log('📊 GA4 not configured - add VITE_GA4_MEASUREMENT_ID to .env');
  }
};

// GA4 specific tracking functions
export const ga4 = {
  pageView: (page, title) => {
    if (!ga4Initialized) return;
    ReactGA.send({ hitType: 'pageview', page, title });
  },

  event: (action, params = {}) => {
    if (!ga4Initialized) return;
    ReactGA.event(action, params);
  },

  beginCheckout: (amount) => {
    if (!ga4Initialized) return;
    ReactGA.event('begin_checkout', {
      currency: 'USD',
      value: amount,
      items: [{
        item_id: 'falls-park-tour',
        item_name: 'Falls Park Self-Guided Tour',
        price: amount,
        quantity: 1
      }]
    });
  },

  purchase: (transactionId, amount) => {
    if (!ga4Initialized) return;
    ReactGA.event('purchase', {
      transaction_id: transactionId,
      currency: 'USD',
      value: amount,
      items: [{
        item_id: 'falls-park-tour',
        item_name: 'Falls Park Self-Guided Tour',
        price: amount,
        quantity: 1
      }]
    });
  },

  // Tour-specific events
  tourStarted: () => ga4.event('tour_started', { tour_name: 'Falls Park Tour' }),
  geofenceTriggered: (stopName, stopOrder) => ga4.event('geofence_triggered', { stop_name: stopName, stop_order: stopOrder }),
  audioPlayed: (stopName, stopOrder) => ga4.event('audio_played', { stop_name: stopName, stop_order: stopOrder }),
  audioCompleted: (stopName, stopOrder) => ga4.event('audio_completed', { stop_name: stopName, stop_order: stopOrder }),
  tourCompleted: (stopsVisited) => ga4.event('tour_completed', { stops_visited: stopsVisited }),
  previewPlayed: () => ga4.event('preview_played'),
  offlineDownload: (status) => ga4.event('offline_download', { status }),
  shareClicked: (platform) => ga4.event('share', { method: platform }),
  reviewPromptShown: () => ga4.event('review_prompt_shown'),
  reviewClicked: () => ga4.event('review_clicked')
};

// Analytics event types
export const EVENTS = {
  PAGE_VIEW: 'page_view',
  TOUR_PREVIEW: 'tour_preview',
  TOUR_PURCHASE_STARTED: 'tour_purchase_started',
  TOUR_PURCHASED: 'tour_purchased',
  TOUR_STARTED: 'tour_started',
  STOP_TRIGGERED: 'stop_triggered',
  STOP_COMPLETED: 'stop_completed',
  TOUR_COMPLETED: 'tour_completed',
  AUDIO_PLAY: 'audio_play',
  AUDIO_PAUSE: 'audio_pause',
  LOCATION_PERMISSION_GRANTED: 'location_permission_granted',
  LOCATION_PERMISSION_DENIED: 'location_permission_denied',
  ERROR: 'error'
};

class Analytics {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.tourStartTime = null;
    this.currentStop = null;
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async trackPageView(page) {
    return await logAnalyticsEvent({
      event: EVENTS.PAGE_VIEW,
      sessionId: this.sessionId,
      page,
      timestamp: new Date()
    });
  }

  async trackTourPreview(tourId) {
    return await logAnalyticsEvent({
      event: EVENTS.TOUR_PREVIEW,
      sessionId: this.sessionId,
      tourId,
      timestamp: new Date()
    });
  }

  async trackPurchaseStarted(tourId, price) {
    return await logAnalyticsEvent({
      event: EVENTS.TOUR_PURCHASE_STARTED,
      sessionId: this.sessionId,
      tourId,
      price,
      timestamp: new Date()
    });
  }

  async trackPurchaseCompleted(tourId, price, paymentMethod) {
    return await logAnalyticsEvent({
      event: EVENTS.TOUR_PURCHASED,
      sessionId: this.sessionId,
      tourId,
      price,
      paymentMethod,
      timestamp: new Date()
    });
  }

  async trackTourStarted(tourId, location) {
    this.tourStartTime = new Date();
    return await logAnalyticsEvent({
      event: EVENTS.TOUR_STARTED,
      sessionId: this.sessionId,
      tourId,
      startLocation: location,
      timestamp: this.tourStartTime
    });
  }

  async trackStopTriggered(stopId, stopTitle, location, triggerType = 'gps') {
    this.currentStop = {
      id: stopId,
      title: stopTitle,
      startTime: new Date()
    };

    return await logAnalyticsEvent({
      event: EVENTS.STOP_TRIGGERED,
      sessionId: this.sessionId,
      stopId,
      stopTitle,
      location,
      triggerType, // 'gps' or 'manual'
      timestamp: new Date()
    });
  }

  async trackStopCompleted(stopId, stopTitle, duration) {
    return await logAnalyticsEvent({
      event: EVENTS.STOP_COMPLETED,
      sessionId: this.sessionId,
      stopId,
      stopTitle,
      duration,
      timestamp: new Date()
    });
  }

  async trackTourCompleted(tourId, totalDuration, stopsCompleted) {
    const completionTime = new Date();
    const totalTime = this.tourStartTime 
      ? completionTime - this.tourStartTime 
      : totalDuration;

    return await logAnalyticsEvent({
      event: EVENTS.TOUR_COMPLETED,
      sessionId: this.sessionId,
      tourId,
      totalDuration: totalTime,
      stopsCompleted,
      completionRate: stopsCompleted / 10, // Assuming 10 total stops
      timestamp: completionTime
    });
  }

  async trackAudioEvent(event, stopId, currentTime, duration) {
    return await logAnalyticsEvent({
      event,
      sessionId: this.sessionId,
      stopId,
      currentTime,
      duration,
      timestamp: new Date()
    });
  }

  async trackLocationPermission(granted) {
    const event = granted 
      ? EVENTS.LOCATION_PERMISSION_GRANTED 
      : EVENTS.LOCATION_PERMISSION_DENIED;

    return await logAnalyticsEvent({
      event,
      sessionId: this.sessionId,
      timestamp: new Date()
    });
  }

  async trackError(error, context) {
    return await logAnalyticsEvent({
      event: EVENTS.ERROR,
      sessionId: this.sessionId,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      context,
      timestamp: new Date()
    });
  }

  // Convenience methods for common tracking patterns
  async trackUserJourney(stage, data = {}) {
    const journeyEvents = {
      'landing': () => this.trackPageView('welcome'),
      'preview': (tourId) => this.trackTourPreview(tourId),
      'purchase_start': (tourId, price) => this.trackPurchaseStarted(tourId, price),
      'purchase_complete': (tourId, price, method) => this.trackPurchaseCompleted(tourId, price, method),
      'tour_start': (tourId, location) => this.trackTourStarted(tourId, location),
      'tour_complete': (tourId, duration, stops) => this.trackTourCompleted(tourId, duration, stops)
    };

    const trackingFunction = journeyEvents[stage];
    if (trackingFunction) {
      return await trackingFunction(data.tourId, data.price, data.method, data.location, data.duration, data.stops);
    } else {
      console.warn(`Unknown journey stage: ${stage}`);
    }
  }
}

// Export singleton instance
const analytics = new Analytics();
export default analytics;
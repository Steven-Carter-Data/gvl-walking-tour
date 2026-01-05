/**
 * Tour Configuration - Abstraction layer for multi-tour scalability
 *
 * This config file centralizes all tour-specific content, making it easy
 * to create new tours by simply creating a new config object.
 */

import tourStopsData from '../data/falls_park_tour_stops.json';

// Falls Park Tour Configuration
export const fallsParkTour = {
  id: 'falls-park-greenville',

  // Basic Info
  name: 'Falls Park Self-Guided Walking Tour',
  shortName: 'Falls Park Tour',
  location: 'Greenville, SC',
  tagline: "Skip the Boring History Lesson. Let Falls Park Tell Its Story.",

  // Tour Stats
  stats: {
    stops: tourStopsData.stops.length,
    duration: 45, // minutes
    distance: 1.2, // miles
  },

  // Key Locations
  startPoint: 'Cradle of Greenville',
  endPoint: 'Falls Park Gardens',

  // Media
  hero: {
    video: '/video/falls-park-flyover.mp4',
    previewAudio: '/audio/preview-sample.wav',
  },

  // Pricing
  pricing: {
    model: 'pay-what-you-want',
    currency: 'USD',
    minimum: 0.51, // Stripe minimum + buffer
    defaultAmount: 8,
    presetAmounts: [3, 5, 8, 10, 15],
    popularAmount: 8,
  },

  // Content
  content: {
    brandLine: 'Basecamp Presents:',
    valueProps: [
      { benefit: "Pay What You Want", detail: "vs $25-40 fixed guided tour price" },
      { benefit: "Start Anytime You Want", detail: "vs fixed 10am or 2pm tour times" },
      { benefit: "Walk at Your Own Pace", detail: "vs being rushed through with a group" },
      { benefit: "Pause for Lunch or Photos", detail: "vs stuck on rigid group schedule" },
      { benefit: "Tour Again Whenever", detail: "vs one-time guided experience" },
      { benefit: "45 Minutes of Expert Narration", detail: "professional storytelling included" },
    ],
    contributionMessage: "Every dollar you contribute helps us continue sharing local history with visitors like you",
    thankYouMessage: "Thank you for supporting local history!",
  },

  // Share Settings
  share: {
    title: 'Falls Park Self-Guided Walking Tour',
    text: "I just got access to an amazing self-guided tour of Falls Park in Greenville, SC! GPS-triggered audio at historic stops. Check it out:",
    url: 'https://tours.basecampdataanalytics.com',
  },

  // Contact
  support: {
    email: 'services@basecampdataanalytics.com',
    responseTime: '24 hours',
  },

  // Tour Data
  stops: tourStopsData.stops,
};

// Export the active tour config
// When adding new tours, you can switch this or make it dynamic based on URL/domain
export const activeTour = fallsParkTour;

// Helper to get tour by ID (for future multi-tour support)
export const getTourById = (tourId) => {
  const tours = {
    'falls-park-greenville': fallsParkTour,
    // Add more tours here as they're created
    // 'downtown-greenville': downtownTour,
    // 'swamp-rabbit-trail': swampRabbitTour,
  };

  return tours[tourId] || fallsParkTour;
};

export default activeTour;

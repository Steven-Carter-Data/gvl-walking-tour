// Local storage utilities for offline functionality

const STORAGE_KEYS = {
  TOUR_PURCHASED: 'tourPurchased',
  TOUR_DATA: 'tourData',
  VISITED_STOPS: 'visitedStops',
  AUDIO_CACHE: 'audioCacheUrls',
  USER_PROGRESS: 'userProgress'
};

export const setTourPurchased = (purchased) => {
  localStorage.setItem(STORAGE_KEYS.TOUR_PURCHASED, JSON.stringify(purchased));
};

export const getTourPurchased = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.TOUR_PURCHASED);
  return stored ? JSON.parse(stored) : false;
};

export const saveTourData = (tourData) => {
  localStorage.setItem(STORAGE_KEYS.TOUR_DATA, JSON.stringify(tourData));
};

export const getTourData = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.TOUR_DATA);
  return stored ? JSON.parse(stored) : null;
};

export const markStopVisited = (stopId) => {
  const visited = getVisitedStops();
  if (!visited.includes(stopId)) {
    visited.push(stopId);
    localStorage.setItem(STORAGE_KEYS.VISITED_STOPS, JSON.stringify(visited));
  }
};

export const getVisitedStops = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.VISITED_STOPS);
  return stored ? JSON.parse(stored) : [];
};

export const saveUserProgress = (progress) => {
  localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(progress));
};

export const getUserProgress = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
  return stored ? JSON.parse(stored) : {
    currentStop: 0,
    completedStops: [],
    totalStops: 0,
    startedAt: null,
    completedAt: null
  };
};

export const cacheAudioUrl = async (audioUrl, stopId) => {
  try {
    // In a production app, you would implement proper audio caching here
    // This could use IndexedDB or Cache API for better offline support
    
    const cachedUrls = getCachedAudioUrls();
    cachedUrls[stopId] = {
      url: audioUrl,
      cachedAt: Date.now(),
      status: 'cached'
    };
    
    localStorage.setItem(STORAGE_KEYS.AUDIO_CACHE, JSON.stringify(cachedUrls));
    return true;
  } catch (error) {
    console.error('Error caching audio:', error);
    return false;
  }
};

export const getCachedAudioUrls = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.AUDIO_CACHE);
  return stored ? JSON.parse(stored) : {};
};

export const isCached = (stopId) => {
  const cachedUrls = getCachedAudioUrls();
  return cachedUrls[stopId]?.status === 'cached';
};

export const clearCache = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};
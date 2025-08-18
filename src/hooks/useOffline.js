import { useState, useEffect } from 'react';
import { cacheAudioUrl, getCachedAudioUrls, saveTourData } from '../utils/storage.js';

export const useOffline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [offlineReady, setOfflineReady] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const downloadTourForOffline = async (tourData) => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    setDownloadProgress(0);
    
    try {
      // Save tour data
      saveTourData(tourData);
      
      const stops = tourData.stops || [];
      let completed = 0;
      
      // Cache audio files
      for (const stop of stops) {
        if (stop.audio_url) {
          try {
            // In a real implementation, you would fetch and cache the actual audio
            await cacheAudioUrl(stop.audio_url, stop.id);
            completed++;
            setDownloadProgress((completed / stops.length) * 100);
          } catch (error) {
            console.error(`Failed to cache audio for stop ${stop.id}:`, error);
          }
        }
      }
      
      setOfflineReady(true);
      
    } catch (error) {
      console.error('Error downloading tour for offline use:', error);
      throw error;
    } finally {
      setIsDownloading(false);
    }
  };

  const checkOfflineStatus = () => {
    const cachedUrls = getCachedAudioUrls();
    const hasCompleteCache = Object.keys(cachedUrls).length > 0;
    setOfflineReady(hasCompleteCache);
    return hasCompleteCache;
  };

  useEffect(() => {
    checkOfflineStatus();
  }, []);

  return {
    isOnline,
    isDownloading,
    downloadProgress,
    offlineReady,
    downloadTourForOffline,
    checkOfflineStatus
  };
};
import { useState, useEffect, useCallback } from 'react';
import { getCurrentLocation, watchLocation, stopWatchingLocation, isWithinGeofence } from '../utils/location.js';

export const useLocation = (options = {}) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [watchId, setWatchId] = useState(null);
  const [accuracy, setAccuracy] = useState(null);

  const requestLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const position = await getCurrentLocation(options);
      setLocation({
        lat: position.lat,
        lng: position.lng
      });
      setAccuracy(position.accuracy);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Location error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const startWatching = useCallback(() => {
    if (watchId) {
      stopWatchingLocation(watchId);
    }

    const newWatchId = watchLocation(
      (position, error) => {
        if (error) {
          setError(error.message);
          return;
        }
        
        setLocation({
          lat: position.lat,
          lng: position.lng
        });
        setAccuracy(position.accuracy);
        setError(null);
        setIsLoading(false);
      },
      options
    );

    setWatchId(newWatchId);
  }, [options, watchId]);

  const stopWatching = useCallback(() => {
    if (watchId) {
      stopWatchingLocation(watchId);
      setWatchId(null);
    }
  }, [watchId]);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  useEffect(() => {
    return () => {
      if (watchId) {
        stopWatchingLocation(watchId);
      }
    };
  }, [watchId]);

  return {
    location,
    error,
    isLoading,
    accuracy,
    requestLocation,
    startWatching,
    stopWatching,
    isWatching: watchId !== null
  };
};

export const useGeofencing = (location, geofences = [], onEnter, onExit) => {
  const [currentGeofences, setCurrentGeofences] = useState(new Set());

  useEffect(() => {
    if (!location || !geofences.length) return;

    const newCurrentGeofences = new Set();

    geofences.forEach(geofence => {
      const isInside = isWithinGeofence(
        location,
        geofence.center,
        geofence.radius
      );

      if (isInside) {
        newCurrentGeofences.add(geofence.id);
        
        // Check if this is a new entry
        if (!currentGeofences.has(geofence.id)) {
          onEnter?.(geofence);
        }
      } else {
        // Check if this is an exit
        if (currentGeofences.has(geofence.id)) {
          onExit?.(geofence);
        }
      }
    });

    setCurrentGeofences(newCurrentGeofences);
  }, [location, geofences, currentGeofences, onEnter, onExit]);

  return {
    currentGeofences: Array.from(currentGeofences),
    isInside: (geofenceId) => currentGeofences.has(geofenceId)
  };
};
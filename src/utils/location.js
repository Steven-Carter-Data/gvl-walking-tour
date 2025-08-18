// Location utility functions

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
};

export const getCurrentLocation = (options = {}) => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
      ...options
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
      },
      (error) => {
        let message;
        switch(error.code) {
          case error.PERMISSION_DENIED:
            message = "Location access denied by user.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            message = "Location request timed out.";
            break;
          default:
            message = "An unknown error occurred.";
            break;
        }
        reject(new Error(message));
      },
      defaultOptions
    );
  });
};

export const watchLocation = (callback, options = {}) => {
  if (!navigator.geolocation) {
    callback(null, new Error('Geolocation is not supported'));
    return null;
  }

  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 5000,
    ...options
  };

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      callback({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      }, null);
    },
    (error) => {
      callback(null, error);
    },
    defaultOptions
  );

  return watchId;
};

export const stopWatchingLocation = (watchId) => {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
  }
};

export const isWithinGeofence = (userLocation, geofenceCenter, radiusMeters) => {
  const distance = calculateDistance(
    userLocation.lat,
    userLocation.lng,
    geofenceCenter.lat,
    geofenceCenter.lng
  );
  
  return distance <= radiusMeters;
};
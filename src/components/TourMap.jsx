import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getCompleteTourRoute } from '../services/routingService';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Dynamic user location icon with direction arrow
const createUserLocationIcon = (heading = null, accuracy = null) => {
  const hasHeading = heading !== null && heading !== undefined && !isNaN(heading);
  const color = accuracy && accuracy < 10 ? '#10B981' : accuracy && accuracy < 20 ? '#3B82F6' : '#F59E0B';
  
  return new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
        <!-- Accuracy circle -->
        <circle cx="16" cy="16" r="14" fill="white" stroke="${color}" stroke-width="2" opacity="0.9"/>
        <circle cx="16" cy="16" r="10" fill="${color}" opacity="0.8"/>
        <circle cx="16" cy="16" r="4" fill="white"/>
        
        <!-- Direction arrow (only if heading available) -->
        ${hasHeading ? `
          <g transform="rotate(${heading} 16 16)">
            <path d="M16 4 L20 12 L16 10 L12 12 Z" fill="white" stroke="${color}" stroke-width="1"/>
          </g>
        ` : ''}
        
        <!-- GPS accuracy indicator -->
        <circle cx="26" cy="6" r="3" fill="${color}" opacity="0.8"/>
        <text x="26" y="8" text-anchor="middle" fill="white" font-size="6" font-weight="bold">
          ${accuracy ? Math.round(accuracy * 3.28084) : 'GPS'}
        </text>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const tourStopIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
      <circle cx="24" cy="24" r="22" fill="#ffffff" stroke="#16A34A" stroke-width="4"/>
      <circle cx="24" cy="24" r="16" fill="#16A34A"/>
      <circle cx="24" cy="24" r="8" fill="#ffffff"/>
    </svg>
  `),
  iconSize: [48, 48],
  iconAnchor: [24, 24],
});

// Special starting point icon (Stop 1) - Prominent red START marker
const startingPointIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" width="60" height="60">
      <circle cx="30" cy="30" r="28" fill="#ffffff" stroke="#DC2626" stroke-width="4"/>
      <circle cx="30" cy="30" r="22" fill="#DC2626"/>
      <circle cx="30" cy="30" r="14" fill="#ffffff"/>
      <text x="30" y="34" text-anchor="middle" fill="#DC2626" font-size="10" font-weight="bold">START</text>
    </svg>
  `),
  iconSize: [60, 60],
  iconAnchor: [30, 30],
});

const lockedStopIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64=' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#6B7280" width="32" height="32">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function LocationTracker({ userLocation, tourStops, tourPurchased, onStopTriggered }) {
  const map = useMap();
  const [triggeredStops, setTriggeredStops] = useState(new Set());
  
  useEffect(() => {
    if (!userLocation || !tourPurchased) return;

    // Check if user is within any stop's radius
    tourStops.forEach(stop => {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        stop.coordinates.lat,
        stop.coordinates.lng
      );
      
      console.log(`📍 Distance to ${stop.title}: ${Math.round(distance)}m (geofence: ${stop.radius_m}m)`);
      
      if (distance <= stop.radius_m && !triggeredStops.has(stop.id)) {
        // User is within this stop's geofence and hasn't been triggered yet
        console.log(`🎯 GEOFENCE TRIGGERED: ${stop.title}`);
        setTriggeredStops(prev => new Set([...prev, stop.id]));
        onStopTriggered(stop);
      } else if (distance > stop.radius_m + 10 && triggeredStops.has(stop.id)) {
        // User is well outside the geofence, allow re-triggering
        console.log(`🚶 Left geofence for: ${stop.title}`);
        setTriggeredStops(prev => {
          const newSet = new Set(prev);
          newSet.delete(stop.id);
          return newSet;
        });
      }
    });
  }, [userLocation, tourStops, tourPurchased, onStopTriggered, triggeredStops]);

  // Removed automatic map centering on user location to keep focus on tour area

  return null;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
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
}

function TourMap({ userLocation, tourStops, tourPurchased, onStopTriggered, onBack, isTestMode = false }) {
  const [showWelcomeAudio, setShowWelcomeAudio] = useState(true);
  const [welcomeAudioPlaying, setWelcomeAudioPlaying] = useState(false);
  const welcomeAudioRef = useRef(null);
  
  const [selectedStop, setSelectedStop] = useState(null);
  const [walkingRoute, setWalkingRoute] = useState([]);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeType, setRouteType] = useState('loading'); // 'real', 'mock', 'fallback', 'loading'
  const mapRef = useRef();

  const handleWelcomeAudioToggle = async () => {
    if (welcomeAudioRef.current) {
      try {
        if (welcomeAudioPlaying) {
          welcomeAudioRef.current.pause();
          setWelcomeAudioPlaying(false);
        } else {
          await welcomeAudioRef.current.play();
          setWelcomeAudioPlaying(true);
        }
      } catch (error) {
        console.log('Audio play prevented - user interaction required');
      }
    }
  };

  const defaultCenter = [34.844685, -82.400653]; // Liberty Bridge coordinates (updated to start position)
  
  // Calculate bounds that encompass all tour stops for better map focus
  const calculateTourBounds = () => {
    if (!tourStops || tourStops.length === 0) return null;
    
    const lats = tourStops.map(stop => stop.coordinates.lat);
    const lngs = tourStops.map(stop => stop.coordinates.lng);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    // Add small padding to bounds
    const padding = 0.001;
    return [
      [minLat - padding, minLng - padding],
      [maxLat + padding, maxLng + padding]
    ];
  };
  
  const tourBounds = calculateTourBounds();
  
  // Debug logging
  console.log('TourMap rendered with', tourStops?.length || 0, 'tour stops');
  if (tourStops?.length > 0) {
    console.log('First tour stop:', tourStops[0]);
  }

  // Fetch walking route when tour stops are available
  useEffect(() => {
    async function fetchWalkingRoute() {
      if (!tourStops || tourStops.length < 2) {
        setWalkingRoute([]);
        return;
      }

      setRouteLoading(true);
      setRouteType('loading');
      try {
        console.log('Fetching walking route for', tourStops.length, 'stops...');
        const result = await getCompleteTourRoute(tourStops);
        console.log('Walking route fetched:', result.route.length, 'waypoints, type:', result.type);
        setWalkingRoute(result.route);
        setRouteType(result.type);
      } catch (error) {
        console.error('Error fetching walking route:', error);
        // Fallback to simple path
        const fallbackPath = tourStops
          .sort((a, b) => a.order - b.order)
          .map(stop => [stop.coordinates.lat, stop.coordinates.lng]);
        setWalkingRoute(fallbackPath);
        setRouteType('fallback');
      } finally {
        setRouteLoading(false);
      }
    }

    fetchWalkingRoute();
  }, [tourStops]);

  // Create tour path - use walking route if available, otherwise simple path
  const tourPath = walkingRoute.length > 0 
    ? walkingRoute
    : tourStops && tourStops.length > 0 
      ? tourStops
          .sort((a, b) => a.order - b.order) // Sort by order to ensure correct path
          .map(stop => [stop.coordinates.lat, stop.coordinates.lng])
      : [];

  // Generate arrow markers for direction indication along real walking route
  const generateArrowMarkers = () => {
    if (!tourPath || tourPath.length < 10 || !tourStops || tourStops.length < 2) return [];
    
    const arrows = [];
    const sortedStops = [...tourStops].sort((a, b) => a.order - b.order);
    
    // Find key route segments by matching tour stops to route waypoints
    for (let stopIndex = 0; stopIndex < sortedStops.length - 1; stopIndex++) {
      const currentStop = sortedStops[stopIndex];
      const nextStop = sortedStops[stopIndex + 1];
      
      // Find the closest route waypoints to current and next stops
      let startWaypointIndex = findClosestWaypointIndex(tourPath, currentStop.coordinates);
      let endWaypointIndex = findClosestWaypointIndex(tourPath, nextStop.coordinates);
      
      // Ensure we have a valid segment
      if (startWaypointIndex >= endWaypointIndex || endWaypointIndex - startWaypointIndex < 5) continue;
      
      // Add arrows along the route segment (every ~25% of the way)
      const segmentLength = endWaypointIndex - startWaypointIndex;
      const arrowPositions = [
        Math.floor(startWaypointIndex + segmentLength * 0.25),
        Math.floor(startWaypointIndex + segmentLength * 0.75)
      ];
      
      for (const waypointIndex of arrowPositions) {
        if (waypointIndex < tourPath.length - 1) {
          const [lat1, lng1] = tourPath[waypointIndex];
          const [lat2, lng2] = tourPath[waypointIndex + 1];
          
          // Calculate bearing along the actual route
          const dLng = (lng2 - lng1) * Math.PI / 180;
          const lat1Rad = lat1 * Math.PI / 180;
          const lat2Rad = lat2 * Math.PI / 180;
          
          const y = Math.sin(dLng) * Math.cos(lat2Rad);
          const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
          
          let bearing = Math.atan2(y, x) * 180 / Math.PI;
          bearing = (bearing + 360) % 360;
          
          arrows.push({
            position: [lat1, lng1],
            bearing: bearing,
            fromStop: currentStop.order,
            toStop: nextStop.order,
            routeSegment: stopIndex + 1
          });
        }
      }
    }
    
    return arrows;
  };
  
  // Helper function to find closest waypoint to a stop
  const findClosestWaypointIndex = (routePath, stopCoordinates) => {
    let closestIndex = 0;
    let minDistance = Number.MAX_VALUE;
    
    for (let i = 0; i < routePath.length; i++) {
      const [lat, lng] = routePath[i];
      const distance = Math.sqrt(
        Math.pow(lat - stopCoordinates.lat, 2) + 
        Math.pow(lng - stopCoordinates.lng, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }
    
    return closestIndex;
  };

  const arrowMarkers = generateArrowMarkers();

  const handleStopClick = (stop) => {
    setSelectedStop(stop);
    if (tourPurchased) {
      onStopTriggered(stop);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Compact Header */}
      <div className="relative bc-primary-bg text-white shadow-lg z-20">
        <div className="absolute inset-0 bg-opacity-10"></div>
        <div className="relative px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={onBack}
                className="mr-3 p-2 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-300 shadow-lg"
                title="Return to welcome"
              >
                <div className="flex items-center">
                  <span className="text-lg">←</span>
                </div>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                  <div className="text-lg">🗺️</div>
                </div>
                <div>
                  <h1 className="text-lg text-bc-on-dark" style={{fontFamily: 'Anton, sans-serif', fontWeight: '400', lineHeight: '1.1', letterSpacing: '-0.01em', textTransform: 'uppercase'}}>
                    Downtown Greenville Self-Guided Walking Tour
                  </h1>
                </div>
              </div>
            </div>
            
            {/* GPS Status Indicator */}
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-xs font-medium">
                <span className="mr-1">📍</span>
                GPS Active
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Audio Section */}
      {showWelcomeAudio && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4" style={{backgroundColor: '#d4967d'}}>
                  <span className="text-2xl text-white">🎧</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Welcome to Your Tour!</h3>
                  <p className="text-sm text-gray-600">Start here to learn about your experience</p>
                </div>
              </div>
              <button
                onClick={() => setShowWelcomeAudio(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                ✕
              </button>
            </div>
            
            <button
              onClick={handleWelcomeAudioToggle}
              className="w-full text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-colors"
              style={{backgroundColor: '#d4967d'}}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#c8855b'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#d4967d'}
            >
              <span className="mr-2 text-lg">
                {welcomeAudioPlaying ? '⏸️' : '▶️'}
              </span>
              {welcomeAudioPlaying ? 'Pause Welcome Audio' : 'Play Welcome Audio'}
            </button>
            
            <audio
              ref={welcomeAudioRef}
              src="/audio/0_WELCOME.wav"
              onEnded={() => setWelcomeAudioPlaying(false)}
              onPause={() => setWelcomeAudioPlaying(false)}
              preload="metadata"
            />
          </div>
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={defaultCenter}
          zoom={tourBounds ? undefined : 17}
          bounds={tourBounds}
          boundsOptions={{padding: [30, 30]}}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <LocationTracker
            userLocation={userLocation}
            tourStops={tourStops}
            tourPurchased={tourPurchased}
            onStopTriggered={onStopTriggered}
          />

          {/* Tour Path - Real walking routes following sidewalks and trails */}
          {tourPath.length > 1 && (
            <>
              {/* White outline for better contrast - renders first (behind) */}
              <Polyline
                positions={tourPath}
                pathOptions={{
                  color: '#ffffff',           // White outline
                  weight: 8,                  // Slightly thicker for outline
                  opacity: 0.8,              // More opaque for better visibility
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
              />
              
              {/* Main walking route - renders second (on top) */}
              <Polyline
                positions={tourPath}
                pathOptions={{
                  color: routeType === 'real' ? '#d4967d' : routeType === 'mock' ? '#495a58' : '#303636', // Basecamp accent=real, primary=mock, muted=fallback
                  weight: 6,                  // Thick line for elderly users
                  opacity: 0.9,              // High visibility
                  dashArray: routeType === 'real' ? null : '10, 10', // Solid for real routes, dashed for others
                  lineCap: 'round',          // Rounded ends
                  lineJoin: 'round'          // Rounded corners
                }}
              />
            </>
          )}

          {/* Route Loading Indicator */}
          {routeLoading && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 30,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '16px 24px',
              borderRadius: '16px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                border: '3px solid #e5e7eb',
                borderTop: '3px solid #10b981',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <span style={{
                color: '#374151',
                fontWeight: '600',
                fontSize: '14px'
              }}>
                🚶‍♂️ Calculating walking route...
              </span>
            </div>
          )}

          {/* Directional Arrows - Following real sidewalk routes */}
          {arrowMarkers.map((arrow, index) => {
            const arrowIcon = new L.Icon({
              iconUrl: 'data:image/svg+xml;base64,' + btoa(`
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28">
                  <g transform="rotate(${arrow.bearing} 14 14)">
                    <circle cx="14" cy="14" r="12" fill="#ffffff" stroke="#d4967d" stroke-width="2" opacity="0.9"/>
                    <!-- Cleaner arrow design pointing UP (North) by default -->
                    <path d="M14 4 L18 10 L16 10 L16 18 L12 18 L12 10 L10 10 Z" fill="#d4967d"/>
                  </g>
                </svg>
              `),
              iconSize: [28, 28],
              iconAnchor: [14, 14],
            });

            return (
              <Marker
                key={`route-arrow-${arrow.routeSegment}-${index}`}
                position={arrow.position}
                icon={arrowIcon}
                title={`Follow sidewalk: Stop ${arrow.fromStop} → Stop ${arrow.toStop}`}
              />
            );
          })}

          {/* User location marker */}
          {userLocation && (
            <Marker 
              position={[userLocation.lat, userLocation.lng]}
              icon={createUserLocationIcon(userLocation.heading, userLocation.accuracy)}
            >
              <Popup>
                <div className="text-center">
                  <strong>Your Location</strong>
                  {userLocation.accuracy && (
                    <div style={{fontSize: '12px', color: '#666'}}>
                      Accuracy: ±{Math.round(userLocation.accuracy * 3.28084)}ft
                    </div>
                  )}
                  {userLocation.heading && (
                    <div style={{fontSize: '12px', color: '#666'}}>
                      Heading: {Math.round(userLocation.heading)}°
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )}

          {/* Tour stop markers */}
          {tourStops.map((stop) => {
            // Create numbered icon for each stop
            const numberedIcon = stop.order === 1 ? startingPointIcon : new L.Icon({
              iconUrl: 'data:image/svg+xml;base64,' + btoa(`
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
                  <circle cx="24" cy="24" r="22" fill="#ffffff" stroke="#16A34A" stroke-width="4"/>
                  <circle cx="24" cy="24" r="16" fill="#16A34A"/>
                  <text x="24" y="28" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="bold">${stop.order}</text>
                </svg>
              `),
              iconSize: [48, 48],
              iconAnchor: [24, 24],
            });

            return (
              <div key={stop.id}>
                <Marker
                  position={[stop.coordinates.lat, stop.coordinates.lng]}
                  icon={numberedIcon}
                  eventHandlers={{
                    click: () => handleStopClick(stop),
                  }}
                >
                  <Popup>
                    <div style={{maxWidth: '300px'}}>
                      <h3><strong>Stop {stop.order}: {stop.title}</strong></h3>
                      <p>{stop.description}</p>
                      <p><em>~{Math.floor(stop.duration_sec_estimate / 60)} minutes</em></p>
                      <button
                        onClick={() => onStopTriggered(stop)}
                        style={{
                          backgroundColor: '#2563eb',
                          color: 'white',
                          padding: '8px 16px',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          width: '100%',
                          marginTop: '8px'
                        }}
                      >
                        🎧 Play Audio
                      </button>
                    </div>
                  </Popup>
                </Marker>
                
                {/* Geofence circle */}
                <Circle
                  center={[stop.coordinates.lat, stop.coordinates.lng]}
                  radius={stop.radius_m}
                  pathOptions={{
                    color: isTestMode ? '#DC2626' : '#16A34A',
                    fillColor: isTestMode ? '#DC2626' : '#16A34A',
                    fillOpacity: isTestMode ? 0.3 : 0.1,
                    weight: isTestMode ? 3 : 1,
                    dashArray: isTestMode ? '5, 10' : null,
                  }}
                />
              </div>
            );
          })}
        </MapContainer>

        {/* GPS Status - Fixed Readability */}
        {userLocation && (
          <div style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            zIndex: 30
          }}>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(12px)',
              borderRadius: '16px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              padding: '16px'
            }}>
              <div style={{display: 'flex', alignItems: 'center'}}>
                <div style={{marginRight: '12px', position: 'relative'}}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: '#10b981',
                    borderRadius: '50%',
                    boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)'
                  }}></div>
                </div>
                <div>
                  <div style={{
                    color: '#059669',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '2px'
                  }}>
                    <span style={{marginRight: '6px'}}>🛰️</span>GPS Connected
                  </div>
                  <div style={{
                    color: '#065f46',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>High Accuracy</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Compact Tour Progress Panel */}
        {tourPurchased && (
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            right: '12px',
            zIndex: 30
          }}>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '16px',
              padding: '12px 16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(8px)'
            }}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#d4967d',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px'
                  }}>
                    <span style={{color: 'white', fontSize: '14px'}}>🎯</span>
                  </div>
                  <div>
                    <div style={{
                      fontWeight: '600',
                      color: '#303636',
                      fontSize: '14px'
                    }}>Tour Progress</div>
                  </div>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                  <div style={{
                    backgroundColor: '#e5e3dc',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    border: '1px solid #d4967d'
                  }}>
                    <span style={{fontWeight: 'bold', color: '#303636', fontSize: '14px'}}>0</span>
                    <span style={{color: '#495a58', fontSize: '12px'}}>/{tourStops.length}</span>
                  </div>
                  <p style={{
                    color: '#495a58',
                    fontSize: '12px',
                    fontWeight: '500',
                    margin: 0
                  }}>
                    🚶‍♂️ Walk to START marker
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TourMap;
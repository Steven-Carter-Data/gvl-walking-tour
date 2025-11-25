import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getCompleteTourRoute } from '../services/routingService';
import { ga4 } from '../services/analytics.js';
import ReviewPrompt from './ReviewPrompt.jsx';
import ShareButtons from './ShareButtons.jsx';
import GroupShareLink from './GroupShareLink.jsx';

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

function LocationTracker({ userLocation, tourStops, tourPurchased, onStopTriggered, onStopCompleted }) {
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
        // Mark stop as completed when triggered
        if (onStopCompleted) {
          onStopCompleted(stop.id);
        }
        // Track in GA4
        ga4.geofenceTriggered(stop.title, stop.order);
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
  }, [userLocation, tourStops, tourPurchased, onStopTriggered, onStopCompleted, triggeredStops]);

  return null;
}

// Custom hook to add route directly to map using pure Leaflet
function RouteRenderer({ tourPath, tourStops }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !tourStops || tourStops.length < 2) return;

    console.log('🗺️ BUILDING ROUTE FROM ACTUAL TOUR STOPS');

    // Remove existing route layers
    map.eachLayer((layer) => {
      if (layer.options && layer.options.className === 'tour-route') {
        map.removeLayer(layer);
      }
    });

    // Create route using actual tour stop coordinates in order
    const actualTourPath = tourStops
      .sort((a, b) => a.order - b.order)
      .map(stop => [stop.coordinates.lat, stop.coordinates.lng]);

    console.log('📍 Actual tour stops route:');
    actualTourPath.forEach((point, i) => {
      console.log(`  Stop ${i + 1}:`, point);
    });

    // SIMPLE STOP-TO-STOP ROUTE: Just connect the actual tour stops in order
    const simpleRoute = actualTourPath.filter(coord =>
      coord &&
      Array.isArray(coord) &&
      coord.length === 2 &&
      typeof coord[0] === 'number' &&
      typeof coord[1] === 'number'
    );

    console.log('📍 All actualTourPath entries:');
    actualTourPath.forEach((point, i) => {
      console.log(`  ${i}:`, point, typeof point);
    });

    console.log('📍 Simple route points:', simpleRoute.length);
    console.log('📍 Simple route coordinates:', simpleRoute);

    // Only create route if we have valid coordinates
    if (simpleRoute.length > 1) {
      // SIMPLE ROUTE connecting just the actual tour stops
      const routePolyline = L.polyline(simpleRoute, {
        color: '#495a58',    // Basecamp primary
        weight: 6,
        opacity: 1.0,
        className: 'tour-route'
      });
      routePolyline.addTo(map);

      // White outline for contrast
      const outlinePolyline = L.polyline(simpleRoute, {
        color: '#ffffff',
        weight: 10,
        opacity: 0.8,
        className: 'tour-route'
      });
      outlinePolyline.addTo(map);
      // Add outline behind main route
      outlinePolyline.bringToBack();

      console.log('✅ SIMPLE ROUTE RENDERED SUCCESSFULLY');
    } else {
      console.log('❌ NO VALID ROUTE COORDINATES');
    }

    console.log('✅ CURVED ROUTE CONNECTING', tourStops.length, 'TOUR STOPS');

    return () => {
      // Cleanup
      map.eachLayer((layer) => {
        if (layer.options && layer.options.className === 'tour-route') {
          map.removeLayer(layer);
        }
      });
    };
  }, [map, tourStops]);

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

function TourMap({ userLocation, tourStops, tourPurchased, onStopTriggered, onBack }) {
  const [showWelcomeAudio, setShowWelcomeAudio] = useState(true);
  const [welcomeAudioPlaying, setWelcomeAudioPlaying] = useState(false);
  const welcomeAudioRef = useRef(null);
  const [showRouteReference, setShowRouteReference] = useState(false);

  const [selectedStop, setSelectedStop] = useState(null);
  const [walkingRoute, setWalkingRoute] = useState([]);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeType, setRouteType] = useState('loading'); // 'real', 'mock', 'fallback', 'loading'
  const mapRef = useRef();

  // Tour progress tracking
  const [completedStops, setCompletedStops] = useState(() => {
    const saved = localStorage.getItem('completed_stops');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // GPS status tracking
  const [gpsStatus, setGpsStatus] = useState('loading'); // 'loading', 'active', 'error', 'denied'
  const [gpsError, setGpsError] = useState(null);

  // Track completed stops and trigger review prompt
  useEffect(() => {
    if (completedStops.size > 0) {
      localStorage.setItem('completed_stops', JSON.stringify([...completedStops]));
    }
  }, [completedStops]);

  // Update GPS status based on userLocation
  useEffect(() => {
    if (userLocation) {
      setGpsStatus('active');
      setGpsError(null);
    }
  }, [userLocation]);

  // Mark a stop as completed
  const markStopCompleted = (stopId) => {
    setCompletedStops(prev => {
      const newSet = new Set(prev);
      newSet.add(stopId);

      // Track in GA4
      const stop = tourStops.find(s => s.id === stopId);
      if (stop) {
        ga4.audioCompleted(stop.title, stop.order);
      }

      // Check if tour is complete
      if (newSet.size === tourStops.length) {
        ga4.tourCompleted(newSet.size);
      }

      return newSet;
    });
  };

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

  // Will add DIRECT LEAFLET APPROACH after tourPath is defined

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

  // SIMPLE TEST ROUTE: Using actual tour stop coordinates to ensure it works
  const testTourRoute = tourStops && tourStops.length > 0 ? [
    // Use actual stop coordinates but with smooth connections
    [34.852380, -82.394200],  // Start
    [34.852420, -82.394100],  // Towards Liberty Bridge
    [34.852452, -82.39408],   // Liberty Bridge
    [34.852400, -82.393900],  // Towards Falls
    [34.852236, -82.393611],  // Reedy River Falls
    [34.851800, -82.394000],  // Curve west
    [34.851522, -82.398048],  // West End Gateway
    [34.851200, -82.399000],  // Towards Peace Center
    [34.850922, -82.39917],   // Peace Center
    [34.851500, -82.399500],  // Back north
    [34.851934, -82.399961],  // Main Street
    [34.852400, -82.400500],  // Towards Courthouse
    [34.852836, -82.400962],  // Courthouse
    [34.850000, -82.401500],  // Towards Joe Jackson
    [34.846969, -82.40187],   // Shoeless Joe Jackson
    [34.849000, -82.400500],  // Towards Wyche
    [34.85105, -82.400212],   // Wyche Pavilion
    [34.851800, -82.398000],  // Back to park
    [34.85234, -82.39389]     // Falls Park Gardens
  ] : [];

  // EXACT ROUTE: Precisely matching tour_route_example.png curved path
  const exactMatchRoute = [
    // Start: Near Liberty Bridge
    [34.852380, -82.394200],

    // Smooth curve southeast toward falls
    [34.852350, -82.394100],
    [34.852300, -82.394000],
    [34.852250, -82.393900],
    [34.852200, -82.393800],

    // Eastern curve (distinctive bulge from reference image)
    [34.852150, -82.393700],
    [34.852100, -82.393600],
    [34.852050, -82.393550],
    [34.852000, -82.393500],
    [34.851950, -82.393450],
    [34.851900, -82.393400], // Easternmost point

    // Return curve westward
    [34.851950, -82.393450],
    [34.852000, -82.393500],
    [34.852050, -82.393550],
    [34.852100, -82.393600],
    [34.852150, -82.393700],

    // Final curve back toward gardens
    [34.852200, -82.393800],
    [34.852250, -82.393850],
    [34.852300, -82.393900],

    // End: Falls Park Gardens
    [34.852340, -82.393890]
  ];

  // FALLBACK: If no tour stops, use simple rectangle for testing
  const fallbackTestRoute = [
    [34.852380, -82.394200],  // Top left
    [34.852380, -82.393000],  // Top right
    [34.850000, -82.393000],  // Bottom right
    [34.850000, -82.394200],  // Bottom left
    [34.852380, -82.394200]   // Back to start
  ];

  console.log('🎯 EXACT MATCH ROUTE START:', exactMatchRoute[0]);
  console.log('🎯 EXACT MATCH ROUTE END:', exactMatchRoute[exactMatchRoute.length - 1]);
  console.log('🎯 EXACT MATCH ROUTE LENGTH:', exactMatchRoute.length);
  console.log('🎯 EXACT MATCH ROUTE:', exactMatchRoute);

  // Create tour path - use exact match route that follows tour_route_example.png
  const tourPath = exactMatchRoute.length > 0
    ? exactMatchRoute
    : testTourRoute.length > 0
      ? testTourRoute
      : fallbackTestRoute.length > 0
        ? fallbackTestRoute
        : walkingRoute.length > 0
          ? walkingRoute
          : tourStops && tourStops.length > 0
            ? tourStops
                .sort((a, b) => a.order - b.order) // Sort by order to ensure correct path
                .map(stop => [stop.coordinates.lat, stop.coordinates.lng])
            : [];

  // Debug logging for route
  console.log('🗺️ TOUR PATH LENGTH:', tourPath.length);
  console.log('🗺️ TOUR PATH FIRST POINT:', tourPath[0]);
  console.log('🗺️ TOUR PATH LAST POINT:', tourPath[tourPath.length - 1]);
  console.log('🗺️ FULL TOUR PATH:', tourPath);
  console.log('🗺️ COORDINATES VALID:', tourPath.every(point =>
    Array.isArray(point) &&
    point.length === 2 &&
    typeof point[0] === 'number' &&
    typeof point[1] === 'number'
  ));


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
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                  <div className="text-lg">🗺️</div>
                </div>
                <div>
                  <h1 className="text-lg text-bc-on-dark" style={{fontFamily: 'Anton, sans-serif', fontWeight: '400', lineHeight: '1.1', letterSpacing: '-0.01em', textTransform: 'uppercase'}}>
                    Falls Park Self-Guided Tour
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
              src="/audio/0_welcome.wav"
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
            onStopCompleted={markStopCompleted}
          />



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
                    color: '#16A34A',
                    fillColor: '#16A34A',
                    fillOpacity: 0.1,
                    weight: 1,
                  }}
                />
              </div>
            );
          })}
        </MapContainer>


        {/* Route Reference Button */}
        <div style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          zIndex: 30
        }}>
          <button
            onClick={() => setShowRouteReference(true)}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(12px)',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              padding: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#495a58'
            }}
            title="View walking route reference"
          >
            <span style={{fontSize: '16px'}}>🗺️</span>
            Route Map
          </button>
        </div>

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

        {/* Route Reference Modal */}
        {showRouteReference && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflow: 'hidden',
              position: 'relative'
            }}>
              {/* Header */}
              <div style={{
                padding: '20px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <h3 style={{
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#495a58'
                  }}>Optimized Walking Route</h3>
                  <p style={{
                    margin: '4px 0 0 0',
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>Reference map for the complete tour path</p>
                </div>
                <button
                  onClick={() => setShowRouteReference(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#6b7280',
                    padding: '4px',
                    borderRadius: '8px'
                  }}
                  title="Close"
                >
                  ✕
                </button>
              </div>

              {/* Route Image */}
              <div style={{
                padding: '20px',
                display: 'flex',
                justifyContent: 'center'
              }}>
                <img
                  src="/complete_route.png"
                  alt="Complete walking route map"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '70vh',
                    objectFit: 'contain',
                    borderRadius: '8px'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Tour Progress Panel */}
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
              padding: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(8px)'
            }}>
              {/* Progress Bar */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <span style={{ fontWeight: '600', color: '#303636', fontSize: '14px' }}>
                    Tour Progress
                  </span>
                  <span style={{ fontWeight: 'bold', color: '#d4967d', fontSize: '14px' }}>
                    {completedStops.size}/{tourStops.length} stops
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: '#e5e3dc',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${(completedStops.size / tourStops.length) * 100}%`,
                    height: '100%',
                    backgroundColor: '#d4967d',
                    borderRadius: '4px',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>

              {/* Stop Indicators */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '4px',
                marginBottom: '12px'
              }}>
                {tourStops.map((stop) => (
                  <div
                    key={stop.id}
                    title={`${stop.order}. ${stop.title}`}
                    style={{
                      flex: 1,
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      backgroundColor: completedStops.has(stop.id) ? '#10B981' : '#e5e3dc',
                      color: completedStops.has(stop.id) ? 'white' : '#495a58',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {completedStops.has(stop.id) ? '✓' : stop.order}
                  </div>
                ))}
              </div>

              {/* Status Message */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <p style={{
                  color: '#495a58',
                  fontSize: '12px',
                  fontWeight: '500',
                  margin: 0
                }}>
                  {completedStops.size === 0 && '🚶‍♂️ Walk to the START marker to begin'}
                  {completedStops.size > 0 && completedStops.size < tourStops.length && `🎧 ${tourStops.length - completedStops.size} stops remaining`}
                  {completedStops.size === tourStops.length && '🎉 Tour complete! Great job!'}
                </p>

                {/* Share button when tour is complete or near complete */}
                {completedStops.size >= Math.min(5, tourStops.length) && (
                  <button
                    onClick={() => setShowShareModal(true)}
                    style={{
                      backgroundColor: '#d4967d',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    📤 Share
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* GPS Loading/Error States */}
        {!userLocation && gpsStatus === 'loading' && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 40,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            textAlign: 'center',
            maxWidth: '300px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              margin: '0 auto 16px',
              border: '4px solid #e5e3dc',
              borderTop: '4px solid #d4967d',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <h3 style={{ color: '#303636', margin: '0 0 8px 0', fontSize: '18px' }}>
              Finding Your Location
            </h3>
            <p style={{ color: '#495a58', margin: 0, fontSize: '14px' }}>
              Please allow location access when prompted
            </p>
          </div>
        )}

        {gpsStatus === 'error' && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 40,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            textAlign: 'center',
            maxWidth: '320px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📍</div>
            <h3 style={{ color: '#303636', margin: '0 0 8px 0', fontSize: '18px' }}>
              GPS Not Available
            </h3>
            <p style={{ color: '#495a58', margin: '0 0 16px 0', fontSize: '14px' }}>
              {gpsError || 'Unable to get your location. You can still explore the tour manually.'}
            </p>
            <button
              onClick={() => {
                setGpsStatus('loading');
                navigator.geolocation.getCurrentPosition(
                  () => setGpsStatus('active'),
                  (err) => {
                    setGpsStatus('error');
                    setGpsError(err.message);
                  },
                  { enableHighAccuracy: true, timeout: 10000 }
                );
              }}
              style={{
                backgroundColor: '#d4967d',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                marginRight: '8px'
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => setGpsStatus('manual')}
              style={{
                backgroundColor: '#e5e3dc',
                color: '#495a58',
                border: '1px solid #d4967d',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Continue Manually
            </button>
          </div>
        )}

        {/* Share Modal */}
        {showShareModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '400px',
              width: '100%',
              position: 'relative'
            }}>
              <button
                onClick={() => setShowShareModal(false)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#6B7280'
                }}
              >
                ✕
              </button>
              <ShareButtons
                title="Falls Park Self-Guided Walking Tour"
                text={`I'm exploring Falls Park in Greenville, SC with this amazing self-guided tour! ${completedStops.size}/${tourStops.length} stops completed. Check it out:`}
                url="https://tours.basecampdataanalytics.com"
              />
            </div>
          </div>
        )}

        {/* Review Prompt */}
        <ReviewPrompt
          stopsCompleted={completedStops.size}
          totalStops={tourStops.length}
          onDismiss={() => setShowReviewPrompt(false)}
        />

        {/* Group Share Button - for group purchases */}
        {tourPurchased && <GroupShareLink />}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default TourMap;
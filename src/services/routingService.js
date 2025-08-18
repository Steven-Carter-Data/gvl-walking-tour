// OpenRouteService walking route API service
// Get your free API key from: https://openrouteservice.org/dev/#/signup

// Hardcoded API key for production - your OpenRouteService API key
const ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjJhMGEwYTg4Mzc3NTQyOTk4NzQ2OGI1OGM5MTdiZTJjIiwiaCI6Im11cm11cjY0In0=';
const ORS_BASE_URL = 'https://api.openrouteservice.org/v2/directions/foot-walking/geojson';

console.log('🔍 API Key Status: HARDCODED - Ready for real sidewalk routing!');

/**
 * Fetches walking route between two points using OpenRouteService
 * @param {Array} startCoords - [longitude, latitude] 
 * @param {Array} endCoords - [longitude, latitude]
 * @returns {Promise<Array>} Array of [lat, lng] coordinates for the walking route
 */
export async function getWalkingRoute(startCoords, endCoords) {
  try {
    // Try real API first if key is available
    if (ORS_API_KEY && ORS_API_KEY !== 'demo-key') {
      console.log('🚶‍♂️ Using OpenRouteService API for real walking directions...');
      console.log('API Key length:', ORS_API_KEY.length);
      console.log('Request coordinates:', startCoords, '->', endCoords);
      
      const response = await fetch(ORS_BASE_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': ORS_API_KEY
        },
        body: JSON.stringify({
          coordinates: [startCoords, endCoords],
          radiuses: [1000, 1000], // Allow some deviation from exact points
          instructions: false,
          geometry_simplify: false,
          preference: 'recommended' // Best walking route
        })
      });

      console.log('API Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ ORS API error: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`ORS API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (data.features && data.features[0] && data.features[0].geometry) {
        // Convert GeoJSON coordinates to Leaflet format [lat, lng]
        const route = data.features[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
        console.log(`✅ Real walking route found with ${route.length} waypoints (follows actual sidewalks)`);
        return { route, type: 'real' };
      } else {
        throw new Error('Invalid response format from ORS API');
      }
    } else {
      console.log('⚠️ No API key found, using mock walking route (see ROUTING_SETUP.md)');
      // Mock route that approximates walking paths in Greenville
      const mockRoute = generateMockWalkingRoute(startCoords, endCoords);
      return { route: mockRoute, type: 'mock' };
    }
  } catch (error) {
    console.error('❌ Error fetching walking route:', error);
    // Fallback to mock route, then direct line
    try {
      console.log('🔄 Falling back to mock route...');
      const mockRoute = generateMockWalkingRoute(startCoords, endCoords);
      return { route: mockRoute, type: 'mock' };
    } catch (mockError) {
      console.error('❌ Mock route also failed:', mockError);
      // Final fallback to direct line
      console.log('🔄 Final fallback to direct line...');
      const fallbackRoute = [
        [startCoords[1], startCoords[0]], // Convert to [lat, lng]
        [endCoords[1], endCoords[0]]
      ];
      return { route: fallbackRoute, type: 'fallback' };
    }
  }
}

/**
 * Generate mock walking routes that approximate realistic paths
 * This simulates following actual streets and park paths in Greenville
 */
function generateMockWalkingRoute(startCoords, endCoords) {
  const [startLng, startLat] = startCoords;
  const [endLng, endLat] = endCoords;
  
  // For very short distances, use direct path
  const distance = Math.sqrt(Math.pow(endLat - startLat, 2) + Math.pow(endLng - startLng, 2));
  if (distance < 0.002) { // Very close stops
    return [[startLat, startLng], [endLat, endLng]];
  }
  
  // Create waypoints that follow more realistic street/path patterns
  const waypoints = [];
  waypoints.push([startLat, startLng]);
  
  // Determine if we should route via Main Street or stay in park
  const isMainStreetRoute = shouldRouteViaMainStreet(startCoords, endCoords);
  
  if (isMainStreetRoute) {
    // Route via Main Street for downtown portions
    waypoints.push(...getMainStreetRoute(startCoords, endCoords));
  } else {
    // Direct park/falls area route with minimal waypoints
    const midLat = (startLat + endLat) / 2;
    const midLng = (startLng + endLng) / 2;
    
    // Only add midpoint if it makes sense (longer routes)
    if (distance > 0.003) {
      waypoints.push([midLat, midLng]);
    }
  }
  
  waypoints.push([endLat, endLng]);
  
  return waypoints;
}

/**
 * Determine if route should go via Main Street based on stop locations
 */
function shouldRouteViaMainStreet(startCoords, endCoords) {
  const [startLng, startLat] = startCoords;
  const [endLng, endLat] = endCoords;
  
  // Main Street runs roughly north-south around lng -82.399
  const mainStreetLng = -82.399;
  const fallsParkLng = -82.401;
  
  // If crossing from falls area to downtown or vice versa, use Main Street
  const startInPark = startLng < fallsParkLng;
  const endInPark = endLng < fallsParkLng;
  
  return startInPark !== endInPark; // Different areas
}

/**
 * Generate waypoints that follow Main Street corridor
 */
function getMainStreetRoute(startCoords, endCoords) {
  const [startLng, startLat] = startCoords;
  const [endLng, endLat] = endCoords;
  
  const mainStreetLng = -82.399; // Approximate Main Street longitude
  const waypoints = [];
  
  // Route to Main Street first, then along Main Street, then to destination
  if (Math.abs(startLng - mainStreetLng) > 0.001) {
    waypoints.push([startLat, mainStreetLng]); // Move to Main Street latitude
  }
  
  if (Math.abs(endLng - mainStreetLng) > 0.001) {
    waypoints.push([endLat, mainStreetLng]); // Move along Main Street to destination latitude
  }
  
  return waypoints;
}

/**
 * Gets walking routes for entire tour path
 * @param {Array} tourStops - Array of tour stop objects with coordinates
 * @returns {Promise<Array>} Complete walking route coordinates
 */
export async function getCompleteTourRoute(tourStops) {
  if (!tourStops || tourStops.length < 2) {
    return { route: [], type: 'none' };
  }
  
  // Sort stops by order
  const sortedStops = [...tourStops].sort((a, b) => a.order - b.order);
  
  let completeRoute = [];
  let routeType = 'real'; // Assume real unless we get a fallback
  
  for (let i = 0; i < sortedStops.length - 1; i++) {
    const currentStop = sortedStops[i];
    const nextStop = sortedStops[i + 1];
    
    const startCoords = [currentStop.coordinates.lng, currentStop.coordinates.lat];
    const endCoords = [nextStop.coordinates.lng, nextStop.coordinates.lat];
    
    try {
      const result = await getWalkingRoute(startCoords, endCoords);
      const segmentRoute = result.route;
      
      // Track the "worst" route type we encounter
      if (result.type === 'fallback' || (result.type === 'mock' && routeType === 'real')) {
        routeType = result.type;
      }
      
      // Add segment to complete route (avoid duplicating waypoints)
      if (completeRoute.length === 0) {
        completeRoute = [...segmentRoute];
      } else {
        // Skip first point to avoid duplication
        completeRoute = [...completeRoute, ...segmentRoute.slice(1)];
      }
      
      // Small delay to respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ Error getting route from stop ${i + 1} to ${i + 2}:`, error);
      // Fallback to direct connection
      routeType = 'fallback';
      if (completeRoute.length === 0) {
        completeRoute.push([currentStop.coordinates.lat, currentStop.coordinates.lng]);
      }
      completeRoute.push([nextStop.coordinates.lat, nextStop.coordinates.lng]);
    }
  }
  
  return { route: completeRoute, type: routeType };
}
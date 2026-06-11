import { MapContainer, TileLayer, Marker, Circle, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import tourConfig from '../config/tourConfig.js';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Tour stop icon for preview
const previewStopIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <circle cx="16" cy="16" r="14" fill="#ffffff" stroke="#d4967d" stroke-width="3"/>
      <circle cx="16" cy="16" r="10" fill="#d4967d"/>
      <circle cx="16" cy="16" r="4" fill="#ffffff"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Special starting point icon
const previewStartIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
      <circle cx="20" cy="20" r="18" fill="#ffffff" stroke="#495a58" stroke-width="3"/>
      <circle cx="20" cy="20" r="14" fill="#495a58"/>
      <circle cx="20" cy="20" r="8" fill="#ffffff"/>
      <text x="20" y="24" text-anchor="middle" fill="#495a58" font-size="6" font-weight="bold">START</text>
    </svg>
  `),
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// Calculate map bounds that encompass all tour stops with tighter zoom
const calculateTourBounds = () => {
  if (!tourConfig.stops || tourConfig.stops.length === 0) return null;

  const lats = tourConfig.stops.map(stop => stop.coordinates.lat);
  const lngs = tourConfig.stops.map(stop => stop.coordinates.lng);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const padding = 0.0003;
  return [
    [minLat - padding, minLng - padding],
    [maxLat + padding, maxLng + padding]
  ];
};

// Landing-page route preview. Lazy-loaded so Leaflet stays out of the
// initial bundle — it's below the fold anyway.
function WelcomePreviewMap() {
  const tourBounds = calculateTourBounds();

  return (
    <MapContainer
      bounds={tourBounds}
      boundsOptions={{padding: [10, 10]}}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {tourConfig.stops.map((stop) => (
        <div key={stop.id}>
          <Marker
            position={[stop.coordinates.lat, stop.coordinates.lng]}
            icon={stop.order === 1 ? previewStartIcon : previewStopIcon}
          >
            <Popup>
              <div style={{maxWidth: '220px'}}>
                <strong>Stop {stop.order}: {stop.title}</strong>
                <p style={{margin: '6px 0 0 0', fontSize: '13px'}}>{stop.description}</p>
              </div>
            </Popup>
          </Marker>
          <Circle
            center={[stop.coordinates.lat, stop.coordinates.lng]}
            radius={stop.radius_m}
            pathOptions={{
              color: '#d4967d',
              fillColor: '#d4967d',
              fillOpacity: 0.1,
              weight: 1,
            }}
          />
        </div>
      ))}
    </MapContainer>
  );
}

export default WelcomePreviewMap;

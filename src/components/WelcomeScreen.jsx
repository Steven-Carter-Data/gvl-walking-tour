import { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import tourData from '../data/falls_park_tour_stops.json';

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

function WelcomeScreen({ onScreenChange, tourPurchased, onStartTourMap }) {
  const [showPreview, setShowPreview] = useState(false);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [showMapPreview, setShowMapPreview] = useState(false);
  const audioRef = useRef(null);

  const previewStop = tourData.stops[0]; // Liberty Bridge - the first stop

  // Calculate map bounds that encompass all tour stops with tighter zoom
  const calculateTourBounds = () => {
    if (!tourData.stops || tourData.stops.length === 0) return null;

    const lats = tourData.stops.map(stop => stop.coordinates.lat);
    const lngs = tourData.stops.map(stop => stop.coordinates.lng);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    // Reduced padding for tighter zoom
    const padding = 0.0008;
    return [
      [minLat - padding, minLng - padding],
      [maxLat + padding, maxLng + padding]
    ];
  };

  const tourBounds = calculateTourBounds();

  // Create tour route path
  const tourRoute = tourData.stops
    .sort((a, b) => a.order - b.order)
    .map(stop => [stop.coordinates.lat, stop.coordinates.lng]);

  const handlePreviewPlay = async () => {
    setShowPreview(true);

    if (audioRef.current) {
      try {
        if (isPreviewPlaying) {
          audioRef.current.pause();
          setIsPreviewPlaying(false);
        } else {
          audioRef.current.currentTime = 0; // Start from beginning
          await audioRef.current.play();
          setIsPreviewPlaying(true);
        }
      } catch (error) {
        console.log('Audio autoplay prevented - user interaction required');
        // This is normal browser behavior
      }
    }
  };

  const handleStartTour = () => {
    if (tourPurchased && onStartTourMap) {
      // User has already paid, go directly to tour map
      onStartTourMap();
    } else {
      // User hasn't paid yet, go to group size selector first
      onScreenChange();
    }
  };

  return (
    <div className="min-h-screen" style={{backgroundColor: '#e5e3dc'}}>
      {/* Basecamp Style Header - Using theme colors */}
      <div className="relative overflow-hidden bc-primary-bg text-bc-on-dark">
        <div className="absolute inset-0">
          {/* Subtle overlay */}
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent opacity-20"></div>
        </div>
        
        <div className="relative px-6 py-20 text-center">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 mb-8 bg-white bg-opacity-10 rounded-full shadow-lg border-2 border-white border-opacity-20">
            <div className="text-4xl">🗺️</div>
          </div>
          
          <p className="bc-brand-text mb-6">
            Basecamp Presents:
          </p>
          <h1 className="bc-title bc-h1 mb-4" style={{color: '#e5e3dc', fontWeight: '400'}}>
            <span className="bc-underline">Falls Park</span><br />
            <span>Self-Guided Walking Tour</span>
          </h1>

          <p className="text-xl text-white mb-6 max-w-lg mx-auto leading-relaxed font-light">
            Skip the Boring History Lesson.<br />
            Let Falls Park Tell Its Story.
          </p>
          
          {/* CTA Button */}
          <div className="mb-6">
            <button 
              onClick={handleStartTour}
              className="bc-btn-primary"
            >
              {tourPurchased ? 'Start Your Tour' : 'Start Your Walking Tour'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section with proper contrast */}
      <div className="px-6 py-8 bc-card-bg shadow-lg">
        <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
          <div className="text-center">
            <div className="text-3xl font-black mb-2" style={{color: '#d4967d'}}>7</div>
            <div className="text-xs font-semibold uppercase tracking-wide" style={{color: '#495a58'}}>
              Historic Stops
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black mb-2" style={{color: '#d4967d'}}>45</div>
            <div className="text-xs font-semibold uppercase tracking-wide" style={{color: '#495a58'}}>
              Minutes
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black mb-2" style={{color: '#d4967d'}}>1.2</div>
            <div className="text-xs font-semibold uppercase tracking-wide" style={{color: '#495a58'}}>
              Miles
            </div>
          </div>
        </div>
      </div>

      {/* Urgency Section */}
      <div className="px-6 py-8" style={{backgroundColor: '#d4967d'}}>
        <div className="max-w-md mx-auto text-center">
          <div className="mb-4">
            <h3 className="text-3xl font-black mb-3" style={{
              fontFamily: 'Anton, sans-serif',
              letterSpacing: '0.1em',
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.4)'
            }}>
              PAY WHAT YOU WANT
            </h3>
            <div className="w-20 h-1 mx-auto rounded-full" style={{backgroundColor: '#495a58'}}></div>
          </div>
          <p className="text-lg font-medium leading-relaxed" style={{color: 'white'}}>
            Choose your own price — pay what feels fair to you. No fixed cost, no pressure. Just great stories at whatever value you decide.
          </p>
        </div>
      </div>

      {/* Content Section with proper Basecamp colors */}
      <div className="flex-1 px-6 py-8 space-y-6" style={{backgroundColor: '#e5e3dc'}}>
        
        {/* What Makes Us Different Section */}
        <div className="bc-card-bg rounded-2xl p-8 shadow-xl border" style={{borderColor: '#495a58'}}>
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-4" style={{color: '#303636', fontFamily: 'Anton, sans-serif', fontWeight: '700'}}>
              WHY CHOOSE OUR TOUR?
            </h2>
            <p className="text-lg leading-relaxed" style={{color: '#495a58'}}>
              Unlike other walking tours, we deliver a <strong>seamless storytelling experience</strong> that automatically comes alive as you walk. No maps to fumble with, no wondering "am I in the right spot?" Compelling stories appear right when you reach each historic spot.
            </p>
          </div>
          
          {/* Key Differentiators */}
          <div className="grid grid-cols-1 gap-4">
            {[
              {
                icon: "🎯",
                title: "Stories That Find YOU",
                description: "Walk naturally and let our GPS technology do the rest. Your phone knows when you've reached each historic spot and serves up the perfect story - no maps to check, no guessing where to go!"
              },
              {
                icon: "🎭",
                title: "Leave with Stories You'll Actually Remember",
                description: "Professional narration that turns local history into fascinating tales you'll share with friends and family"
              },
              {
                icon: "⚡",
                title: "Perfect for YOUR Schedule",
                description: "Start anytime, pause for lunch, skip ahead, or take your time. This is your adventure on your timeline!"
              }
            ].map((feature, index) => (
              <div key={index} className="flex items-start p-4 rounded-xl border" style={{backgroundColor: '#e5e3dc', borderColor: '#d4967d'}}>
                <div className="text-3xl mr-4 flex-shrink-0">{feature.icon}</div>
                <div>
                  <h3 className="font-bold text-lg mb-1" style={{color: '#303636'}}>{feature.title}</h3>
                  <p className="text-sm leading-relaxed" style={{color: '#495a58'}}>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 rounded-xl text-center" style={{backgroundColor: '#d4967d', color: '#ffffff'}}>
            <p className="font-medium">
              🚀 Experience Falls Park's remarkable story.
            </p>
          </div>
        </div>

        {/* Interactive Map Preview Card */}
        <div className="bc-card-bg rounded-2xl p-8 shadow-xl border" style={{borderColor: '#495a58'}}>
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg" style={{backgroundColor: '#495a58'}}>
              <div className="text-2xl text-white">🗺️</div>
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold" style={{color: '#303636'}}>Interactive Route Preview</h3>
              <p className="font-medium" style={{color: '#495a58'}}>See where your journey takes you</p>
            </div>
          </div>

          <p className="text-lg leading-relaxed mb-6" style={{color: '#495a58'}}>
            Explore the complete walking route and discover all 7 historical stops throughout Falls Park. Click below to reveal your adventure path!
          </p>

          <button
            onClick={() => setShowMapPreview(!showMapPreview)}
            className="bc-btn-primary w-full mb-6"
          >
            <div className="flex items-center justify-center">
              <span className="mr-3 text-2xl">
                {showMapPreview ? '🔽' : '🗺️'}
              </span>
              {showMapPreview ? 'Hide Tour Map' : 'Reveal Tour Map'}
            </div>
          </button>

          {showMapPreview && (
            <div className="space-y-4">
              <div className="rounded-xl border overflow-hidden relative" style={{borderColor: '#d4967d', height: '400px'}}>
                <MapContainer
                  bounds={tourBounds}
                  boundsOptions={{padding: [20, 20]}}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={false}
                  attributionControl={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {/* Tour stop markers */}
                  {tourData.stops.map((stop) => (
                    <div key={stop.id}>
                      <Marker
                        position={[stop.coordinates.lat, stop.coordinates.lng]}
                        icon={stop.order === 1 ? previewStartIcon : previewStopIcon}
                      />

                      {/* Geofence circles (smaller for preview) */}
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

                {/* Map overlay with tour info */}
                <div className="absolute bottom-4 left-4 right-4 bg-white bg-opacity-95 rounded-lg p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm" style={{color: '#303636'}}>
                        Your 7-Stop Journey
                      </h4>
                      <p className="text-xs" style={{color: '#495a58'}}>
                        ~45 minutes • 1.2 miles • Professional audio narration
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{backgroundColor: '#d4967d'}}></div>
                      <span className="text-xs font-medium" style={{color: '#495a58'}}>Tour Stops</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick tour info below map */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-lg border" style={{backgroundColor: '#e5e3dc', borderColor: '#d4967d'}}>
                  <div className="text-lg font-bold" style={{color: '#495a58'}}>START</div>
                  <div className="text-xs" style={{color: '#495a58'}}>Liberty Bridge</div>
                </div>
                <div className="text-center p-3 rounded-lg border" style={{backgroundColor: '#e5e3dc', borderColor: '#d4967d'}}>
                  <div className="text-lg font-bold" style={{color: '#495a58'}}>7</div>
                  <div className="text-xs" style={{color: '#495a58'}}>Historic Stops</div>
                </div>
                <div className="text-center p-3 rounded-lg border" style={{backgroundColor: '#e5e3dc', borderColor: '#d4967d'}}>
                  <div className="text-lg font-bold" style={{color: '#495a58'}}>END</div>
                  <div className="text-xs" style={{color: '#495a58'}}>Park Gardens</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Audio Preview Card */}
        <div className="bc-card-bg rounded-2xl p-8 shadow-xl border" style={{borderColor: '#495a58'}}>
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg" style={{backgroundColor: '#d4967d'}}>
              <div className="text-2xl text-white">🎧</div>
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold" style={{color: '#303636'}}>Audio Preview</h3>
              <p className="font-medium" style={{color: '#495a58'}}>Experience Premium Quality</p>
            </div>
          </div>
          
          <p className="text-lg leading-relaxed mb-6" style={{color: '#495a58'}}>
            Listen to our professionally narrated sample and discover the exceptional quality of our immersive storytelling experience.
          </p>
          
          <button 
            onClick={handlePreviewPlay}
            className="bc-btn-primary w-full"
          >
            <div className="flex items-center justify-center">
              <span className="mr-3 text-2xl">
                {isPreviewPlaying ? '⏸️' : '▶️'}
              </span>
              {isPreviewPlaying ? 'Pause Premium Preview' : 'Play Premium Preview'}
            </div>
          </button>
          
          {showPreview && (
            <div className="mt-6 p-6 rounded-xl border" style={{backgroundColor: '#e5e3dc', borderColor: '#d4967d'}}>
              <div className="flex items-center mb-3">
                <div className="w-3 h-3 rounded-full mr-3" style={{backgroundColor: '#d4967d'}}></div>
                <h4 className="font-bold text-lg" style={{color: '#303636'}}>
                  "Tour Preview Sample"
                </h4>
              </div>
              <p className="leading-relaxed mb-4" style={{color: '#495a58'}}>
                Get a taste of our professional storytelling experience and discover what makes Falls Park's history come alive through engaging narration and fascinating historical insights.
              </p>
            </div>
          )}
        </div>

        {/* Start Tour Card */}
        <div className="bc-card-bg rounded-2xl p-8 shadow-xl border" style={{borderColor: '#495a58'}}>
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg" style={{backgroundColor: '#495a58'}}>
              <div className="text-2xl text-white">🚀</div>
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold" style={{color: '#303636'}}>Begin Your Journey</h3>
              <p className="font-medium" style={{color: '#495a58'}}>Professional Historical Experience</p>
            </div>
          </div>
          
          {/* Feature List */}
          <div className="grid grid-cols-1 gap-4 mb-8">
            {[
              { icon: "📍", title: "7 GPS-Triggered Stops", subtitle: "Automatic audio activation" },
              { icon: "🎙️", title: "Professional Narration", subtitle: "3-5 minutes per location" },
              { icon: "⏱️", title: "Self-Paced Experience", subtitle: "~45 minutes total journey" }
            ].map((feature, index) => (
              <div key={index} className="flex items-center p-4 rounded-xl border" style={{backgroundColor: '#e5e3dc', borderColor: '#d4967d'}}>
                <div className="text-2xl mr-4">{feature.icon}</div>
                <div>
                  <div className="font-semibold" style={{color: '#303636'}}>{feature.title}</div>
                  <div className="text-sm" style={{color: '#495a58'}}>{feature.subtitle}</div>
                </div>
              </div>
            ))}
          </div>
          
          <button 
            onClick={handleStartTour}
            className="bc-btn-primary w-full text-lg"
          >
            <div className="flex items-center justify-center">
              <span className="mr-3 text-2xl">🎧</span>
              {tourPurchased ? 'Start Your Tour' : 'Start Premium Experience'}
            </div>
          </button>
        </div>
      </div>

      {/* Contact Section */}
      <div className="px-6 py-8 bg-white border-t-2" style={{borderColor: '#d4967d'}}>
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full" style={{backgroundColor: '#d4967d'}}>
            <div className="text-2xl text-white">📧</div>
          </div>
          <h3 className="text-2xl font-bold mb-4" style={{color: '#303636'}}>
            Questions, Comments, or Suggestions?
          </h3>
          <p className="text-lg mb-6" style={{color: '#495a58'}}>
            We'd love to hear from you! Send us your feedback, reviews, or any questions about the tour experience.
          </p>
          <div className="bg-white p-6 rounded-2xl border-2 shadow-lg" style={{borderColor: '#d4967d'}}>
            <p className="text-sm font-medium mb-2" style={{color: '#495a58'}}>
              Contact us at:
            </p>
            <a
              href="mailto:services@basecampdataanalytics.com"
              className="text-lg md:text-xl font-bold hover:underline transition-all duration-200 break-all text-center block"
              style={{color: '#d4967d'}}
            >
              services@basecampdataanalytics.com
            </a>
            <p className="text-sm mt-3" style={{color: '#495a58'}}>
              We typically respond within 24 hours
            </p>
          </div>
        </div>
      </div>

      {/* Footer with Basecamp colors */}
      <div className="bc-muted-bg text-white py-8 px-6">
        <div className="text-center">
          <p className="text-white font-medium mb-2">
            Powered by Basecamp Data Analytics
          </p>
          <p className="text-sm" style={{color: '#d4967d'}}>
            Start at Liberty Bridge • Self-paced experience • Premium quality audio
          </p>
        </div>
      </div>

      {/* Hidden Audio Element for Preview */}
      <audio
        ref={audioRef}
        src="/audio/preview-sample.wav"
        onEnded={() => {
          setIsPreviewPlaying(false);
        }}
        onPause={() => {
          setIsPreviewPlaying(false);
        }}
        preload="metadata"
      />
    </div>
  );
}

export default WelcomeScreen;
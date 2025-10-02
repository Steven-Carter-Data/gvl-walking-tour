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
  const [showMapPreview, setShowMapPreview] = useState(true); // Changed to true - show by default
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

    // Even tighter zoom - reduced padding further
    const padding = 0.0003;
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
      {/* Hero Section with Video Background */}
      <div className="relative overflow-hidden" style={{minHeight: '600px'}}>
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            filter: 'brightness(0.7)',
            objectPosition: 'center'
          }}
        >
          <source src="/video/falls-park-flyover.mp4" type="video/mp4" />
        </video>

        {/* Gradient Overlays for Better Text Visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-60"></div>
        <div className="absolute inset-0" style={{backgroundColor: 'rgba(73, 90, 88, 0.3)'}}></div>

        {/* Content Overlay */}
        <div className="relative px-6 py-20 text-center" style={{minHeight: '600px', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
          <p className="text-lg font-semibold mb-6" style={{
            color: '#ffffff',
            textShadow: '2px 2px 12px rgba(0,0,0,0.9), 0 0 30px rgba(0,0,0,0.8)',
            letterSpacing: '0.05em'
          }}>
            Basecamp Presents:
          </p>
          <h1 className="text-5xl md:text-6xl font-bold mb-4" style={{
            fontFamily: 'Anton, sans-serif',
            fontWeight: '400',
            letterSpacing: '0.02em',
            color: '#ffffff',
            textShadow: '3px 3px 15px rgba(0,0,0,0.95), 0 0 50px rgba(0,0,0,0.8), 2px 2px 30px rgba(0,0,0,0.9)',
            lineHeight: '1.2'
          }}>
            <span style={{
              borderBottom: '4px solid #d4967d',
              paddingBottom: '8px',
              display: 'inline-block'
            }}>Falls Park</span><br />
            <span>Self-Guided Walking Tour</span>
          </h1>

          <p className="text-xl md:text-2xl mb-8 max-w-lg mx-auto leading-relaxed font-medium" style={{
            color: '#ffffff',
            textShadow: '3px 3px 15px rgba(0,0,0,0.95), 0 0 50px rgba(0,0,0,0.8), 2px 2px 30px rgba(0,0,0,0.9)'
          }}>
            Skip the Boring History Lesson.<br />
            Let Falls Park Tell Its Story.
          </p>

          {/* CTA Button */}
          <div className="mb-6">
            <button
              onClick={handleStartTour}
              className="px-8 py-4 rounded-xl text-xl font-bold text-white transition-all duration-200 hover:transform hover:scale-105 shadow-2xl border-2 border-white border-opacity-40"
              style={{
                backgroundColor: '#d4967d',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(10px)'
              }}
            >
              {tourPurchased ? 'Start Your Tour' : 'Start Tour - Pay What You Want'}
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

      {/* 5-Star Rating Section */}
      <div className="px-6 py-6" style={{backgroundColor: '#e5e3dc'}}>
        <div className="max-w-md mx-auto">
          <div className="bc-card-bg rounded-2xl p-6 shadow-xl border-2" style={{borderColor: '#d4967d'}}>
            <div className="text-center">
              {/* Star Rating */}
              <div className="flex items-center justify-center gap-2 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className="w-8 h-8"
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(212, 150, 125, 0.3))',
                      animation: `star-pulse-${star} 2s ease-in-out infinite`
                    }}
                    viewBox="0 0 24 24"
                    fill="#d4967d"
                    stroke="#495a58"
                    strokeWidth="1"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>

              {/* Rating Text */}
              <div className="mb-2">
                <span className="text-2xl font-black" style={{color: '#495a58'}}>
                  5.0 STAR RATED
                </span>
              </div>

              {/* Subtext */}
              <p className="text-sm font-semibold" style={{color: '#d4967d'}}>
                ⭐ Loved by visitors exploring Greenville
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes star-pulse-1 {
          0%, 100% { transform: scale(1); }
          10% { transform: scale(1.2); }
        }
        @keyframes star-pulse-2 {
          0%, 100% { transform: scale(1); }
          20% { transform: scale(1.2); }
        }
        @keyframes star-pulse-3 {
          0%, 100% { transform: scale(1); }
          30% { transform: scale(1.2); }
        }
        @keyframes star-pulse-4 {
          0%, 100% { transform: scale(1); }
          40% { transform: scale(1.2); }
        }
        @keyframes star-pulse-5 {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
      `}</style>

      {/* Content Section with proper Basecamp colors */}
      <div className="flex-1 px-6 py-8 space-y-6" style={{backgroundColor: '#e5e3dc'}}>
        
        {/* Comparison Section - Mobile-First Clean Design */}
        <div className="bc-card-bg rounded-2xl p-6 md:p-8 shadow-xl border" style={{borderColor: '#495a58'}}>
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{color: '#303636', fontFamily: 'Anton, sans-serif', fontWeight: '700'}}>
              WHY SELF-GUIDED?
            </h2>
            <p className="text-base md:text-lg font-medium" style={{color: '#495a58'}}>
              More freedom for less money
            </p>
          </div>

          {/* Clean Comparison List - Stacked on Mobile */}
          <div className="space-y-4">
            {[
              {
                benefit: "Pay What You Want",
                detail: "vs $25-40 fixed guided tour price"
              },
              {
                benefit: "Start Anytime You Want",
                detail: "vs fixed 10am or 2pm tour times"
              },
              {
                benefit: "Walk at Your Own Pace",
                detail: "vs being rushed through with a group"
              },
              {
                benefit: "Pause for Lunch or Photos",
                detail: "vs stuck on rigid group schedule"
              },
              {
                benefit: "Tour Again Whenever",
                detail: "vs one-time guided experience"
              },
              {
                benefit: "45 Minutes of Expert Narration",
                detail: "professional storytelling included"
              }
            ].map((item, index) => (
              <div
                key={index}
                className="p-4 md:p-5 rounded-xl border-2"
                style={{
                  backgroundColor: '#e5e3dc',
                  borderColor: '#d4967d'
                }}
              >
                <div className="flex items-start">
                  <div
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3 md:mr-4"
                    style={{
                      backgroundColor: '#d4967d',
                      marginTop: '2px'
                    }}
                  >
                    <svg width="14" height="11" viewBox="0 0 14 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5.5L5 9.5L13 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base md:text-lg mb-1" style={{color: '#303636'}}>
                      {item.benefit}
                    </h3>
                    <p className="text-sm md:text-base" style={{color: '#495a58'}}>
                      {item.detail}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-6 p-5 rounded-xl text-center" style={{backgroundColor: '#d4967d', color: '#ffffff'}}>
            <p className="text-lg md:text-xl font-bold mb-1">
              More Freedom. Better Value. Your Price.
            </p>
            <p className="text-sm font-medium opacity-90">
              Experience Falls Park on your terms
            </p>
          </div>
        </div>

        {/* Interactive Map Preview Card - Always Visible */}
        <div className="bc-card-bg rounded-2xl p-6 md:p-8 shadow-xl border" style={{borderColor: '#495a58'}}>
          {/* Centered header with icon above text - All Devices */}
          <div className="text-center mb-6">
            <div className="inline-flex w-12 h-12 md:w-14 md:h-14 rounded-xl items-center justify-center shadow-lg mb-3" style={{backgroundColor: '#495a58'}}>
              <div className="text-xl md:text-2xl text-white">🗺️</div>
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-1" style={{color: '#303636'}}>Your Complete Walking Route</h3>
            <p className="text-sm md:text-base font-medium" style={{color: '#495a58'}}>7 historic stops throughout Falls Park</p>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border overflow-hidden relative" style={{borderColor: '#d4967d', height: '300px'}}>
              <MapContainer
                bounds={tourBounds}
                boundsOptions={{padding: [10, 10]}}
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
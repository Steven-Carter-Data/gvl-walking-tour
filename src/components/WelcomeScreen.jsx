import { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
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

function WelcomeScreen({ onScreenChange, onQuickCheckout, tourPurchased, onStartTourMap }) {
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const audioRef = useRef(null);

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

  const tourBounds = calculateTourBounds();

  const handlePreviewPlay = async () => {
    if (audioRef.current) {
      try {
        if (isPreviewPlaying) {
          audioRef.current.pause();
          setIsPreviewPlaying(false);
        } else {
          audioRef.current.currentTime = 0;
          await audioRef.current.play();
          setIsPreviewPlaying(true);
        }
      } catch (error) {
        console.log('Audio autoplay prevented - user interaction required');
      }
    }
  };

  const handleStartTour = () => {
    if (tourPurchased && onStartTourMap) {
      onStartTourMap();
    } else {
      onScreenChange();
    }
  };

  const handleQuickCheckout = () => {
    if (onQuickCheckout) {
      onQuickCheckout(tourConfig.pricing.defaultAmount);
    }
  };

  return (
    <div className="min-h-screen" style={{backgroundColor: '#e5e3dc'}}>
      <title>Greenville SC Walking Tour | Falls Park Self-Guided Audio Tour</title>
      <meta name="description" content="Best things to do in Greenville SC! Self-guided walking tour of Falls Park with GPS-triggered audio at 7 historic stops. Pay what you want." />
      {/* Hero Section with Video Background */}
      <header className="relative overflow-hidden" style={{minHeight: '85vh'}}>
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            minWidth: '100%',
            minHeight: '100%',
            width: 'auto',
            height: 'auto',
            transform: 'translate(-50%, -50%)',
            filter: 'brightness(0.7)',
            objectFit: 'cover'
          }}
        >
          <source src={tourConfig.hero.video} type="video/mp4" />
        </video>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-60"></div>
        <div className="absolute inset-0" style={{backgroundColor: 'rgba(73, 90, 88, 0.3)'}}></div>

        {/* Content Overlay */}
        <div className="relative px-6 py-16 text-center" style={{minHeight: '85vh', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
          <p className="text-lg font-semibold mb-4" style={{
            color: '#ffffff',
            textShadow: '2px 2px 12px rgba(0,0,0,0.9)',
            letterSpacing: '0.05em'
          }}>
            {tourConfig.content.brandLine}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{
            fontFamily: 'Anton, sans-serif',
            fontWeight: '400',
            letterSpacing: '0.02em',
            color: '#ffffff',
            textShadow: '3px 3px 15px rgba(0,0,0,0.95)',
            lineHeight: '1.2'
          }}>
            <span style={{
              borderBottom: '4px solid #d4967d',
              paddingBottom: '8px',
              display: 'inline-block'
            }}>{tourConfig.shortName.split(' ')[0]} {tourConfig.shortName.split(' ')[1]}</span><br />
            <span>Self-Guided Walking Tour</span>
          </h1>

          <p className="text-xl md:text-2xl mb-8 max-w-lg mx-auto leading-relaxed font-medium" style={{
            color: '#ffffff',
            textShadow: '3px 3px 15px rgba(0,0,0,0.95)'
          }}>
            {tourConfig.tagline}
          </p>

          {/* CTA Buttons - Streamlined */}
          <div className="space-y-4 max-w-sm mx-auto">
            {tourPurchased ? (
              <button
                onClick={handleStartTour}
                className="w-full px-8 py-4 rounded-xl text-xl font-bold text-white transition-all duration-200 hover:transform hover:scale-105 shadow-2xl"
                style={{
                  backgroundColor: '#d4967d',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                }}
              >
                Start Your Tour
              </button>
            ) : (
              <>
                {/* Quick Checkout - Primary CTA */}
                <button
                  onClick={handleQuickCheckout}
                  className="w-full px-8 py-4 rounded-xl text-xl font-bold text-white transition-all duration-200 hover:transform hover:scale-105 shadow-2xl"
                  style={{
                    backgroundColor: '#d4967d',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  }}
                >
                  Continue with ${tourConfig.pricing.defaultAmount}
                </button>

                {/* Choose Your Price - Secondary CTA */}
                <button
                  onClick={handleStartTour}
                  className="w-full px-6 py-3 rounded-xl text-lg font-semibold transition-all duration-200 hover:transform hover:scale-105"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    color: '#ffffff',
                    border: '2px solid rgba(255,255,255,0.4)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  Choose Your Own Price
                </button>
              </>
            )}
          </div>

          {/* Audio Preview Button */}
          <div className="max-w-sm mx-auto mt-4">
            <button
              onClick={handlePreviewPlay}
              className="w-full px-6 py-3 rounded-xl text-lg font-semibold transition-all duration-200 hover:transform hover:scale-105"
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: '#ffffff',
                border: '2px solid rgba(255,255,255,0.4)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div className="flex items-center justify-center">
                <span className="mr-3 text-xl">
                  {isPreviewPlaying ? '⏸️' : '🎧'}
                </span>
                {isPreviewPlaying ? 'Pause Audio Preview' : 'Play Audio Preview'}
              </div>
            </button>
          </div>

          {/* Quick Stats Row */}
          <div className="flex justify-center mt-8" style={{gap: '32px'}}>
            <div className="text-center" style={{minWidth: '70px'}}>
              <div className="text-2xl font-black" style={{color: '#d4967d'}}>{tourConfig.stats.stops}</div>
              <div className="text-xs uppercase font-semibold" style={{color: 'rgba(255,255,255,0.9)', letterSpacing: '0.1em'}}>Stops</div>
            </div>
            <div style={{width: '1px', backgroundColor: 'rgba(255,255,255,0.3)', alignSelf: 'stretch'}}></div>
            <div className="text-center" style={{minWidth: '70px'}}>
              <div className="text-2xl font-black" style={{color: '#d4967d'}}>{tourConfig.stats.duration}</div>
              <div className="text-xs uppercase font-semibold" style={{color: 'rgba(255,255,255,0.9)', letterSpacing: '0.1em'}}>Minutes</div>
            </div>
            <div style={{width: '1px', backgroundColor: 'rgba(255,255,255,0.3)', alignSelf: 'stretch'}}></div>
            <div className="text-center" style={{minWidth: '70px'}}>
              <div className="text-2xl font-black" style={{color: '#d4967d'}}>{tourConfig.stats.distance}</div>
              <div className="text-xs uppercase font-semibold" style={{color: 'rgba(255,255,255,0.9)', letterSpacing: '0.1em'}}>Miles</div>
            </div>
          </div>
        </div>
      </header>

      {/* Pay What You Want Banner - Condensed */}
      <section className="px-6 py-6" style={{backgroundColor: '#d4967d'}}>
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-black mb-2" style={{
            fontFamily: 'Anton, sans-serif',
            letterSpacing: '0.1em',
            color: 'white',
          }}>
            PAY WHAT YOU WANT
          </h2>
          <p className="text-base font-medium" style={{color: 'white'}}>
            No fixed cost, no pressure. Just great stories at whatever value you decide.
          </p>
        </div>
      </section>

      {/* Main Content - Condensed */}
      <main className="px-6 py-6 space-y-6" style={{backgroundColor: '#e5e3dc'}}>

        {/* Interactive Map Preview */}
        <div className="bc-card-bg rounded-2xl p-6 shadow-xl border" style={{borderColor: '#495a58'}}>
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold mb-1" style={{color: '#303636'}}>Your Walking Route</h2>
            <p className="text-base" style={{color: '#495a58'}}>{tourConfig.stats.stops} historic stops throughout {tourConfig.location.split(',')[0]}</p>
          </div>

          <div className="rounded-xl border overflow-hidden relative" style={{borderColor: '#d4967d', height: '250px'}}>
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
                  />
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

            <div className="absolute bottom-3 left-3 right-3 bg-white bg-opacity-95 rounded-lg p-3 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm" style={{color: '#303636'}}>
                    {tourConfig.stats.stops}-Stop Journey
                  </h3>
                  <p className="text-xs" style={{color: '#495a58'}}>
                    ~{tourConfig.stats.duration} min | {tourConfig.stats.distance} mi | Professional audio
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Why Self-Guided - Condensed to 3 key points */}
        <div className="bc-card-bg rounded-2xl p-6 shadow-xl border" style={{borderColor: '#495a58'}}>
          <h2 className="text-xl font-bold mb-4 text-center" style={{color: '#303636'}}>
            Why Self-Guided?
          </h2>

          <div className="space-y-3">
            {tourConfig.content.valueProps.slice(0, 3).map((item, index) => (
              <div
                key={index}
                className="p-4 rounded-xl border flex items-start gap-3"
                style={{ backgroundColor: '#e5e3dc', borderColor: '#d4967d' }}
              >
                <div
                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center"
                  style={{ marginTop: '2px' }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M2 10L8 16L18 4" stroke="#d4967d" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-base" style={{color: '#303636'}}>{item.benefit}</h3>
                  <p className="text-sm" style={{color: '#495a58'}}>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Meet Your Guide */}
        <div className="bc-card-bg rounded-2xl p-6 shadow-xl border" style={{borderColor: '#495a58'}}>
          <h2 className="text-xl font-bold mb-4 text-center" style={{color: '#303636'}}>
            Meet Your Guide
          </h2>
          <div className="flex flex-col items-center text-center">
            <img
              src="/images/tour-guide.png"
              alt="Your tour guide"
              className="rounded-full shadow-lg border-4"
              style={{
                width: '120px',
                height: '120px',
                objectFit: 'cover',
                borderColor: '#d4967d',
              }}
            />
            <p className="mt-4 text-sm leading-relaxed" style={{color: '#495a58'}}>
              Your narrator brings each stop to life with stories of Greenville's rich history, from its textile mill origins to its modern-day renaissance.
            </p>
          </div>
        </div>

        {/* Final CTA */}
        <div className="bc-card-bg rounded-2xl p-6 shadow-xl border text-center" style={{borderColor: '#d4967d', backgroundColor: '#d4967d'}}>
          <h2 className="text-xl font-bold mb-2" style={{color: 'white'}}>
            Ready to Explore?
          </h2>
          <p className="text-base mb-4" style={{color: 'rgba(255,255,255,0.9)'}}>
            Start your self-guided adventure today
          </p>
          <button
            onClick={tourPurchased ? handleStartTour : handleQuickCheckout}
            className="w-full px-6 py-3 rounded-xl text-lg font-bold transition-all duration-200 hover:transform hover:scale-105"
            style={{
              backgroundColor: 'white',
              color: '#d4967d',
            }}
          >
            {tourPurchased ? 'Start Tour' : `Get Started - $${tourConfig.pricing.defaultAmount}`}
          </button>
        </div>
      </main>

      {/* Contact & Footer */}
      <footer>
        <div className="px-6 py-6 bg-white border-t-2" style={{borderColor: '#d4967d'}}>
          <div className="max-w-md mx-auto text-center">
            <p className="text-base mb-2" style={{color: '#495a58'}}>
              Questions? Contact us:
            </p>
            <a
              href={`mailto:${tourConfig.support.email}`}
              className="text-lg font-semibold hover:underline"
              style={{color: '#d4967d'}}
            >
              {tourConfig.support.email}
            </a>
          </div>
        </div>
        <div className="bc-muted-bg text-white py-6 px-6">
          <div className="text-center">
            <p className="text-sm" style={{color: '#d4967d'}}>
              Powered by Basecamp Data Analytics
            </p>
          </div>
        </div>
      </footer>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={tourConfig.hero.previewAudio}
        onEnded={() => setIsPreviewPlaying(false)}
        onPause={() => setIsPreviewPlaying(false)}
        preload="metadata"
      />
    </div>
  );
}

export default WelcomeScreen;

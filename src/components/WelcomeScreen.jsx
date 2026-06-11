import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import tourConfig from '../config/tourConfig.js';
import { verifyPayment, ACCESS_SESSION_KEY } from '../utils/stripe.js';
import { ga4 } from '../services/analytics.js';
import EmailCapture from './EmailCapture.jsx';

// Leaflet is heavy and the route preview sits below the fold — load it lazily
const WelcomePreviewMap = lazy(() => import('./WelcomePreviewMap.jsx'));

// Distance in meters between two {lat, lng}-ish points (haversine)
const distanceMeters = (a, b) => {
  const R = 6371e3;
  const φ1 = (a.lat * Math.PI) / 180;
  const φ2 = (b.lat * Math.PI) / 180;
  const Δφ = ((b.lat - a.lat) * Math.PI) / 180;
  const Δλ = ((b.lng - a.lng) * Math.PI) / 180;
  const h = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

function WelcomeScreen({ onScreenChange, onQuickCheckout, tourPurchased, onStartTourMap, checkoutCancelled, onDismissCancelled }) {
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [previewEnded, setPreviewEnded] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restoreEmail, setRestoreEmail] = useState('');
  const [restoreMessage, setRestoreMessage] = useState(null);
  const [showStickyCta, setShowStickyCta] = useState(false);
  // 'near' = standing close to the park, 'far' = planning from elsewhere,
  // null = unknown (no permission yet — we never prompt on the landing page)
  const [proximity, setProximity] = useState(null);
  const audioRef = useRef(null);
  const heroRef = useRef(null);

  // Tailor the pitch to where the visitor is — but only if they've already
  // granted location permission to this site. Prompting on page load is a
  // bounce-rate killer, so unknown stays unknown until they start the tour.
  useEffect(() => {
    if (!navigator.geolocation || !navigator.permissions?.query) return;

    let cancelled = false;
    navigator.permissions.query({ name: 'geolocation' }).then((status) => {
      if (cancelled || status.state !== 'granted') return;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (cancelled) return;
          const start = tourConfig.stops.find((s) => s.order === 1);
          if (!start) return;
          const d = distanceMeters(
            { lat: pos.coords.latitude, lng: pos.coords.longitude },
            start.coordinates
          );
          setProximity(d < 1500 ? 'near' : 'far');
        },
        () => {},
        { timeout: 8000, maximumAge: 300000 }
      );
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Show the sticky CTA bar once the hero (and its buttons) scroll away
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyCta(!entry.isIntersecting),
      { threshold: 0.15 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  // Regain access on a new device using the email from checkout
  const handleRestorePurchase = async () => {
    const email = restoreEmail.trim();
    if (!email) return;

    setIsRestoring(true);
    setRestoreMessage(null);
    try {
      const response = await fetch('/api/restore-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (data.found && data.session_id) {
        const result = await verifyPayment(data.session_id);
        if (result.success) {
          localStorage.setItem(ACCESS_SESSION_KEY, data.session_id);
          localStorage.setItem('tour_access', 'granted');
          window.location.href = '/?tour=true';
          return;
        }
      }
      setRestoreMessage({
        type: 'error',
        text: `No purchase found for that email. If you believe this is an error, contact ${tourConfig.support.email}`,
      });
    } catch (error) {
      console.error('Restore purchase error:', error);
      setRestoreMessage({
        type: 'error',
        text: 'Could not check your purchase right now. Please try again.',
      });
    } finally {
      setIsRestoring(false);
    }
  };

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
          setPreviewEnded(false);
          ga4.previewPlayed();
        }
      } catch {
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

  const handleQuickCheckout = async () => {
    if (onQuickCheckout && !isCheckingOut) {
      setIsCheckingOut(true);
      setCheckoutError(null);
      try {
        const result = await onQuickCheckout(tourConfig.pricing.defaultAmount);
        if (result && !result.success) {
          setCheckoutError('We couldn’t open the checkout page. Please check your connection and try again.');
        }
      } finally {
        setIsCheckingOut(false);
      }
    }
  };

  return (
    <div className="min-h-screen" style={{
      backgroundColor: '#e5e3dc',
      // Keep the sticky CTA bar from covering the footer
      paddingBottom: showStickyCta && !tourPurchased ? '84px' : 0,
    }}>
      <title>Greenville SC Walking Tour | Falls Park Self-Guided Audio Tour</title>
      <meta name="description" content="Best things to do in Greenville SC! Self-guided walking tour of Falls Park with GPS-triggered audio at 7 historic stops. Pay what you want." />

      {/* Win-back banner for visitors who backed out of Stripe checkout */}
      {checkoutCancelled && !tourPurchased && (
        <div className="px-4 py-3" style={{backgroundColor: '#495a58'}}>
          <div className="max-w-md mx-auto flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-white mb-1">
                Still deciding? No pressure.
              </p>
              <p className="text-xs" style={{color: 'rgba(255,255,255,0.85)'}}>
                It really is pay what you want — even ${tourConfig.pricing.presetAmounts[0]} unlocks
                all {tourConfig.stats.stops} stops. Or try Stop 1 free on the map first.
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => { onDismissCancelled?.(); onScreenChange(); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                  style={{backgroundColor: '#d4967d'}}
                >
                  Choose Your Price
                </button>
                <button
                  onClick={() => { onDismissCancelled?.(); onStartTourMap?.(); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.4)'}}
                >
                  Try Stop 1 Free
                </button>
              </div>
            </div>
            <button
              onClick={() => onDismissCancelled?.()}
              aria-label="Dismiss"
              className="text-white opacity-70 hover:opacity-100 text-lg leading-none flex-shrink-0"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Hero Section with Video Background */}
      <header ref={heroRef} className="relative overflow-hidden" style={{minHeight: '85vh'}}>
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

          {/* Location-aware nudge (only when permission was already granted) */}
          {proximity && !tourPurchased && (
            <div className="max-w-sm mx-auto mb-4">
              <span className="inline-block px-4 py-2 rounded-full text-sm font-bold" style={{
                backgroundColor: 'rgba(255,255,255,0.92)',
                color: '#303636',
              }}>
                {proximity === 'near'
                  ? '📍 You’re just steps from the starting point — perfect timing!'
                  : '🗓️ Planning a visit? Buy once — lifetime access, tour whenever you arrive.'}
              </span>
            </div>
          )}

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
                  disabled={isCheckingOut}
                  className="w-full px-8 py-4 rounded-xl text-xl font-bold text-white transition-all duration-200 hover:transform hover:scale-105 shadow-2xl disabled:opacity-70"
                  style={{
                    backgroundColor: '#d4967d',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  }}
                >
                  {isCheckingOut ? 'Opening Secure Checkout…' : `Unlock Full Tour – $${tourConfig.pricing.defaultAmount}`}
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

                {/* Free sample path - lowest friction entry */}
                <button
                  onClick={() => onStartTourMap?.()}
                  className="w-full text-base font-semibold underline"
                  style={{
                    color: '#ffffff',
                    textShadow: '2px 2px 8px rgba(0,0,0,0.9)',
                    background: 'none',
                    border: 'none',
                    padding: '4px',
                  }}
                >
                  🗺️ Or explore the map first — Stop 1 is free
                </button>
              </>
            )}

            {checkoutError && (
              <div className="rounded-xl px-4 py-3 text-sm font-semibold" style={{
                backgroundColor: 'rgba(254, 226, 226, 0.95)',
                color: '#991b1b',
              }}>
                {checkoutError}
              </div>
            )}
          </div>

          {/* Audio Preview */}
          <div className="max-w-sm mx-auto mt-4">
            {previewEnded && !tourPurchased ? (
              /* Post-preview conversion moment — highest-intent point on the page */
              <div className="rounded-xl px-5 py-4 text-center" style={{
                backgroundColor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
              }}>
                <p className="text-base font-bold mb-1" style={{color: '#303636'}}>
                  Like what you hear?
                </p>
                <p className="text-sm mb-3" style={{color: '#495a58'}}>
                  That's one minute of {tourConfig.stats.duration} — there's a story like this at every stop.
                </p>
                <button
                  onClick={handleQuickCheckout}
                  disabled={isCheckingOut}
                  className="w-full px-6 py-3 rounded-xl text-base font-bold text-white disabled:opacity-70"
                  style={{backgroundColor: '#d4967d'}}
                >
                  {isCheckingOut ? 'Opening Secure Checkout…' : `Unlock All ${tourConfig.stats.stops} Stops`}
                </button>
                <button
                  onClick={handlePreviewPlay}
                  className="mt-2 text-sm font-medium underline"
                  style={{color: '#495a58', background: 'none', border: 'none'}}
                >
                  Replay preview
                </button>
              </div>
            ) : (
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
                  {isPreviewPlaying ? 'Pause Audio Preview' : 'Hear a 1-Minute Sample'}
                </div>
              </button>
            )}
          </div>

          {/* Trust signals */}
          <div className="max-w-sm mx-auto mt-4 flex items-center justify-center flex-wrap" style={{gap: '6px 14px'}}>
            {['🔒 Secure Stripe checkout', '📱 No app needed', '♾️ Lifetime access'].map((signal) => (
              <span key={signal} className="text-xs font-semibold" style={{
                color: 'rgba(255,255,255,0.95)',
                textShadow: '1px 1px 6px rgba(0,0,0,0.9)',
              }}>
                {signal}
              </span>
            ))}
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

      {/* Pay What You Want Banner */}
      <section className="px-6 py-10" style={{backgroundColor: '#d4967d'}}>
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-4xl font-black mb-3" style={{
            fontFamily: 'Anton, sans-serif',
            letterSpacing: '0.15em',
            color: '#f0ece4',
            textShadow: '0 2px 8px rgba(0,0,0,0.25)',
          }}>
            PAY WHAT YOU WANT
          </h2>
          <p className="text-base font-medium" style={{color: '#f0ece4'}}>
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
            <Suspense fallback={
              <div style={{
                height: '100%',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#e5e3dc',
                color: '#495a58',
                fontSize: '14px',
                fontWeight: 600
              }}>
                Loading route map…
              </div>
            }>
              <WelcomePreviewMap />
            </Suspense>

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

        {/* How It Works - 3 steps, answers "what exactly am I buying?" */}
        <div className="bc-card-bg rounded-2xl p-6 shadow-xl border" style={{borderColor: '#495a58'}}>
          <h2 className="text-xl font-bold mb-4 text-center" style={{color: '#303636'}}>
            How It Works
          </h2>
          <div className="space-y-4">
            {[
              { step: '1', title: 'Pay what you want', detail: 'Quick secure checkout — no app to download, no account to create' },
              { step: '2', title: 'Walk the route', detail: `Follow the map ${tourConfig.stats.distance} miles through Falls Park and downtown` },
              { step: '3', title: 'Stories play automatically', detail: 'GPS triggers the audio as you arrive at each stop — or tap to play manually' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{backgroundColor: '#d4967d'}}
                >
                  {item.step}
                </div>
                <div>
                  <h3 className="font-bold text-base" style={{color: '#303636'}}>{item.title}</h3>
                  <p className="text-sm" style={{color: '#495a58'}}>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What You'll Discover - stop teaser list builds curiosity before the ask */}
        <div className="bc-card-bg rounded-2xl p-6 shadow-xl border" style={{borderColor: '#495a58'}}>
          <h2 className="text-xl font-bold mb-1 text-center" style={{color: '#303636'}}>
            What You'll Discover
          </h2>
          <p className="text-sm text-center mb-4" style={{color: '#495a58'}}>
            {tourConfig.stats.stops} stories, told where they happened
          </p>
          <div className="space-y-3">
            {[...tourConfig.stops]
              .sort((a, b) => a.order - b.order)
              .map((stop) => (
                <div
                  key={stop.id}
                  className="p-4 rounded-xl border flex items-start gap-3"
                  style={{backgroundColor: '#e5e3dc', borderColor: '#d4967d'}}
                >
                  <div
                    className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{backgroundColor: stop.order === 1 ? '#495a58' : '#d4967d', marginTop: '2px'}}
                  >
                    {stop.order}
                  </div>
                  <div>
                    <h3 className="font-bold text-base" style={{color: '#303636'}}>
                      {stop.title}
                      {stop.order === 1 && (
                        <span
                          className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold text-white align-middle"
                          style={{backgroundColor: '#495a58'}}
                        >
                          FREE SAMPLE
                        </span>
                      )}
                    </h3>
                    <p className="text-sm" style={{color: '#495a58'}}>{stop.description}</p>
                  </div>
                </div>
              ))}
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
              className="rounded-xl shadow-lg border-4"
              style={{
                width: '140px',
                height: '140px',
                objectFit: 'cover',
                borderColor: '#d4967d',
              }}
            />
            <p className="mt-4 text-sm leading-relaxed" style={{color: '#495a58'}}>
              Hi, I'm your narrator! I live right here in Greenville County and love sharing the stories behind this incredible city — from its textile mill origins to the vibrant downtown you see today.
            </p>
          </div>
        </div>

        {/* Email capture - reach visitors who aren't ready to buy today */}
        {!tourPurchased && (
          <EmailCapture
            source="landing"
            title={proximity === 'near' ? 'Want the Link for Later?' : 'Not Touring Today?'}
          />
        )}

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
            disabled={isCheckingOut}
            className="w-full px-6 py-3 rounded-xl text-lg font-bold transition-all duration-200 hover:transform hover:scale-105 disabled:opacity-70"
            style={{
              backgroundColor: 'white',
              color: '#d4967d',
            }}
          >
            {tourPurchased
              ? 'Start Tour'
              : isCheckingOut
                ? 'Opening Secure Checkout…'
                : `Unlock Full Tour – $${tourConfig.pricing.defaultAmount}`}
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
            {!tourPurchased && (
              <p className="mt-3">
                <button
                  onClick={() => {
                    setRestoreMessage(null);
                    setShowRestoreModal(true);
                  }}
                  className="text-sm font-medium hover:underline"
                  style={{color: '#495a58'}}
                >
                  Already purchased? Restore access
                </button>
              </p>
            )}
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

      {/* Sticky bottom CTA - keeps purchase one tap away once hero scrolls off */}
      {showStickyCta && !tourPurchased && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 px-4 py-3"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.97)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.12)',
            borderTop: '2px solid #d4967d',
          }}
        >
          <div className="max-w-md mx-auto flex items-center gap-3">
            <div className="flex-shrink-0">
              <p className="text-sm font-bold leading-tight" style={{color: '#303636'}}>
                {tourConfig.stats.stops} stops · {tourConfig.stats.duration} min
              </p>
              <p className="text-xs" style={{color: '#495a58'}}>Pay what you want</p>
            </div>
            <button
              onClick={handleQuickCheckout}
              disabled={isCheckingOut}
              className="flex-1 px-4 py-3 rounded-xl text-base font-bold text-white disabled:opacity-70"
              style={{backgroundColor: '#d4967d'}}
            >
              {isCheckingOut ? 'Opening Checkout…' : `Unlock Full Tour – $${tourConfig.pricing.defaultAmount}`}
            </button>
          </div>
        </div>
      )}

      {/* Restore Purchase Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-bold" style={{color: '#303636'}}>
                Restore Your Purchase
              </h3>
              <button
                onClick={() => setShowRestoreModal(false)}
                aria-label="Close"
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>
            <p className="text-sm mb-4" style={{color: '#495a58'}}>
              Enter the email address you used at checkout and we'll look up your purchase.
            </p>
            <input
              type="email"
              value={restoreEmail}
              onChange={(e) => setRestoreEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isRestoring) handleRestorePurchase();
              }}
              placeholder="you@example.com"
              autoFocus
              className="w-full p-3 rounded-xl border-2 text-base mb-3"
              style={{borderColor: '#d4967d', color: '#303636'}}
            />
            {restoreMessage && (
              <p
                className="text-sm mb-3 px-3 py-2 rounded-lg"
                style={{
                  backgroundColor: restoreMessage.type === 'error' ? '#fee2e2' : '#e8f5e8',
                  color: restoreMessage.type === 'error' ? '#991b1b' : '#166534',
                }}
              >
                {restoreMessage.text}
              </p>
            )}
            <button
              onClick={handleRestorePurchase}
              disabled={isRestoring || !restoreEmail.trim()}
              className="w-full px-6 py-3 rounded-xl text-white font-bold disabled:opacity-50"
              style={{backgroundColor: '#d4967d'}}
            >
              {isRestoring ? 'Checking your purchase…' : 'Restore Access'}
            </button>
          </div>
        </div>
      )}

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={tourConfig.hero.previewAudio}
        onEnded={() => {
          setIsPreviewPlaying(false);
          setPreviewEnded(true);
        }}
        onPause={() => setIsPreviewPlaying(false)}
        preload="metadata"
      />
    </div>
  );
}

export default WelcomeScreen;

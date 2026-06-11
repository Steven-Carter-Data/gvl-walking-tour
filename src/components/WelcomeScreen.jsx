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

  // Fade-and-rise sections in as they scroll into view
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
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

  const sortedStops = [...tourConfig.stops].sort((a, b) => a.order - b.order);

  return (
    <div
      className="min-h-screen bg-cream"
      style={{ paddingBottom: showStickyCta && !tourPurchased ? '84px' : 0 }}
    >
      <title>Greenville SC Walking Tour | Falls Park Self-Guided Audio Tour</title>
      <meta name="description" content="Best things to do in Greenville SC! Self-guided walking tour of Falls Park with GPS-triggered audio at 7 historic stops. Pay what you want." />

      {/* Win-back banner for visitors who backed out of Stripe checkout */}
      {checkoutCancelled && !tourPurchased && (
        <div className="bg-sage px-4 py-3">
          <div className="max-w-md mx-auto flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-white mb-1">
                Still deciding? No pressure.
              </p>
              <p className="text-xs text-white/85">
                It really is pay what you want. Even ${tourConfig.pricing.presetAmounts[0]} unlocks
                all {tourConfig.stats.stops} stops, or you can try Stop 1 free on the map first.
              </p>
              <div className="flex gap-2 mt-2.5">
                <button
                  onClick={() => { onDismissCancelled?.(); onScreenChange(); }}
                  className="px-4 py-1.5 rounded-full text-xs font-bold text-white bg-terracotta hover:bg-terracotta-deep transition-colors"
                >
                  Choose Your Price
                </button>
                <button
                  onClick={() => { onDismissCancelled?.(); onStartTourMap?.(); }}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold text-white bg-white/10 border border-white/40 hover:bg-white/20 transition-colors"
                >
                  Try Stop 1 Free
                </button>
              </div>
            </div>
            <button
              onClick={() => onDismissCancelled?.()}
              aria-label="Dismiss"
              className="text-white/70 hover:text-white text-lg leading-none flex-shrink-0"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ───────────────────────── Hero ───────────────────────── */}
      <header ref={heroRef} className="relative overflow-hidden" style={{ minHeight: '88vh' }}>
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover"
          style={{ filter: 'brightness(0.65)' }}
        >
          <source src={tourConfig.hero.video} type="video/mp4" />
        </video>

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70"></div>
        <div className="absolute inset-0 bg-sage/25"></div>

        {/* Content */}
        <div
          className="relative px-6 py-16 text-center flex flex-col justify-center"
          style={{ minHeight: '88vh' }}
        >
          <p
            className="text-xs font-bold uppercase mb-5 text-white/90"
            style={{ letterSpacing: '0.3em', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
          >
            {tourConfig.content.brandLine}
          </p>

          <h1
            className="font-display text-white uppercase mb-5"
            style={{
              fontSize: 'clamp(2.6rem, 9vw, 4rem)',
              lineHeight: 1.04,
              letterSpacing: '0.01em',
              textShadow: '0 4px 24px rgba(0,0,0,0.85)',
            }}
          >
            {tourConfig.shortName.split(' ')[0]} {tourConfig.shortName.split(' ')[1]}
            <br />
            <span className="text-terracotta">Walking Tour</span>
          </h1>

          <p
            className="font-serif italic text-white mb-9 max-w-md mx-auto"
            style={{ fontSize: '1.2rem', lineHeight: 1.5, textShadow: '0 2px 14px rgba(0,0,0,0.9)' }}
          >
            {tourConfig.tagline}
          </p>

          {/* Location-aware nudge (only when permission was already granted) */}
          {proximity && !tourPurchased && (
            <div className="max-w-sm mx-auto mb-5">
              <span className="inline-block px-4 py-2 rounded-full text-sm font-bold bg-white/95 text-ink shadow-lg">
                {proximity === 'near'
                  ? '📍 You’re just steps from the starting point. Perfect timing!'
                  : '🗓️ Planning a visit? Buy once and tour whenever you arrive. Lifetime access.'}
              </span>
            </div>
          )}

          {/* CTAs */}
          <div className="space-y-3 max-w-sm mx-auto w-full">
            {tourPurchased ? (
              <button onClick={handleStartTour} className="btn-primary text-xl">
                Start Your Tour <span aria-hidden>→</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleQuickCheckout}
                  disabled={isCheckingOut}
                  className="btn-primary text-xl"
                >
                  {isCheckingOut
                    ? 'Opening Secure Checkout…'
                    : <>Unlock Full Tour · ${tourConfig.pricing.defaultAmount} <span aria-hidden>→</span></>}
                </button>

                <button onClick={handleStartTour} className="btn-glass">
                  Choose Your Own Price
                </button>

                <button
                  onClick={() => onStartTourMap?.()}
                  className="w-full text-sm font-semibold text-white underline underline-offset-4 decoration-terracotta decoration-2 bg-transparent border-none cursor-pointer py-1"
                  style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}
                >
                  Or explore the map first. Stop 1 is free.
                </button>
              </>
            )}

            {checkoutError && (
              <div className="rounded-2xl px-4 py-3 text-sm font-semibold bg-red-100/95 text-red-900">
                {checkoutError}
              </div>
            )}
          </div>

          {/* Audio Preview */}
          <div className="max-w-sm mx-auto w-full mt-4">
            {previewEnded && !tourPurchased ? (
              /* Post-preview conversion moment — highest-intent point on the page */
              <div className="rounded-3xl px-6 py-5 text-center bg-white/95 backdrop-blur shadow-2xl">
                <p className="font-display uppercase text-ink text-xl mb-1">Like what you hear?</p>
                <p className="text-sm text-sage mb-4">
                  That's one minute of {tourConfig.stats.duration}. There's a story like this at every stop.
                </p>
                <button
                  onClick={handleQuickCheckout}
                  disabled={isCheckingOut}
                  className="btn-primary text-base"
                >
                  {isCheckingOut ? 'Opening Secure Checkout…' : `Unlock All ${tourConfig.stats.stops} Stops`}
                </button>
                <button
                  onClick={handlePreviewPlay}
                  className="mt-2.5 text-sm font-medium text-sage underline underline-offset-4 bg-transparent border-none cursor-pointer"
                >
                  Replay preview
                </button>
              </div>
            ) : (
              <button onClick={handlePreviewPlay} className="btn-glass">
                <span className="text-lg" aria-hidden>{isPreviewPlaying ? '⏸' : '▶'}</span>
                {isPreviewPlaying ? 'Pause Audio Preview' : 'Hear a 1-Minute Sample'}
              </button>
            )}
          </div>

          {/* Trust signals */}
          <div className="max-w-sm mx-auto mt-5 flex items-center justify-center flex-wrap gap-x-4 gap-y-1.5">
            {['Secure Stripe checkout', 'No app needed', 'Lifetime access'].map((signal) => (
              <span
                key={signal}
                className="text-[11px] font-bold uppercase text-white/85"
                style={{ letterSpacing: '0.14em', textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}
              >
                {signal}
              </span>
            ))}
          </div>

          {/* Stats strip */}
          <div className="flex justify-center items-stretch gap-8 mt-10 max-w-sm mx-auto border-t border-b border-white/25 py-4">
            {[
              { value: tourConfig.stats.stops, label: 'Stops' },
              { value: tourConfig.stats.duration, label: 'Minutes' },
              { value: tourConfig.stats.distance, label: 'Miles' },
            ].map((stat, i) => (
              <div key={stat.label} className={`text-center px-2 ${i > 0 ? 'border-l border-white/25 pl-8' : ''}`}>
                <div className="font-display text-terracotta text-3xl">{stat.value}</div>
                <div
                  className="text-[11px] uppercase font-bold text-white/85 mt-0.5"
                  style={{ letterSpacing: '0.18em' }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ─────────────────── Pay What You Want band ─────────────────── */}
      <section className="bg-terracotta px-6 py-12 text-center overflow-hidden">
        <h2
          className="font-display uppercase text-white"
          style={{ fontSize: 'clamp(2.2rem, 8vw, 3.2rem)', lineHeight: 1.05, letterSpacing: '0.04em' }}
        >
          Pay What
          <br />
          You Want
        </h2>
        <p className="font-serif italic text-white/95 mt-3 max-w-xs mx-auto" style={{ fontSize: '1.05rem' }}>
          No fixed cost, no pressure. Just great stories at whatever value you decide.
        </p>
      </section>

      {/* ───────────────────────── Main ───────────────────────── */}
      <main className="max-w-md mx-auto px-6">

        {/* The Route */}
        <section className="pt-14 pb-4 reveal">
          <p className="kicker mb-3">The Route</p>
          <h2 className="display-h text-3xl mb-2">
            {tourConfig.stats.distance} miles of
            <br />
            <span className="text-terracotta-deep">living history</span>
          </h2>
          <p className="text-sage text-base mb-6">
            {tourConfig.stats.stops} historic stops winding through Falls Park and downtown {tourConfig.location.split(',')[0]}. Tap any marker to peek at its story.
          </p>
        </section>

        {/* Full-bleed map */}
        <div className="-mx-6 relative reveal" style={{ height: '300px' }}>
          <Suspense fallback={
            <div className="h-full w-full flex items-center justify-center bg-sand text-sage text-sm font-semibold">
              Loading route map…
            </div>
          }>
            <WelcomePreviewMap />
          </Suspense>
          <div className="absolute bottom-3 left-6 right-6 z-[500] pointer-events-none">
            <div className="inline-flex items-center gap-2 bg-ink/85 backdrop-blur px-4 py-2 rounded-full">
              <span className="w-2 h-2 rounded-full bg-terracotta inline-block"></span>
              <span className="text-white text-xs font-semibold tracking-wide">
                ~{tourConfig.stats.duration} min · {tourConfig.stats.distance} mi · professional audio
              </span>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <section className="pt-16 reveal">
          <p className="kicker mb-3">How It Works</p>
          <h2 className="display-h text-3xl mb-8">Three steps,<br />zero hassle</h2>

          <div className="space-y-9">
            {[
              { num: '1', title: 'Pay what you want', detail: 'Quick secure checkout. No app to download, no account to create.' },
              { num: '2', title: 'Walk the route', detail: `Follow the map ${tourConfig.stats.distance} miles through Falls Park and downtown.` },
              { num: '3', title: 'Stories find you', detail: 'GPS triggers the audio as you arrive at each stop, or tap to play it manually.' },
            ].map((item) => (
              <div key={item.num} className="flex items-start gap-5">
                <span className="ghost-num" aria-hidden>{item.num}</span>
                <div className="pt-2">
                  <h3 className="font-bold text-ink text-lg leading-snug">{item.title}</h3>
                  <p className="text-sage text-[15px] mt-1 leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* The Stories (timeline) */}
        <section className="pt-16 reveal">
          <p className="kicker mb-3">The Stories</p>
          <h2 className="display-h text-3xl mb-2">What you'll<br />discover</h2>
          <p className="text-sage text-base mb-8">
            {tourConfig.stats.stops} stories, told exactly where they happened.
          </p>

          <div className="timeline space-y-8">
            {sortedStops.map((stop) => (
              <div key={stop.id} className="flex items-start gap-4">
                <span
                  className="timeline-dot"
                  style={stop.order === 1 ? { background: 'var(--color-sage)' } : undefined}
                >
                  {stop.order}
                </span>
                <div className="-mt-0.5">
                  <h3 className="font-bold text-ink text-[17px] leading-snug">
                    {stop.title}
                    {stop.order === 1 && (
                      <span
                        className="ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-white bg-sage align-middle inline-block"
                        style={{ letterSpacing: '0.08em' }}
                      >
                        FREE SAMPLE
                      </span>
                    )}
                  </h3>
                  <p className="text-sage text-sm mt-1 leading-relaxed">{stop.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why Self-Guided */}
        <section className="pt-16 reveal">
          <p className="kicker mb-3">Why Self-Guided</p>
          <h2 className="display-h text-3xl mb-6">Your park,<br />your pace</h2>

          <div>
            {tourConfig.content.valueProps.slice(0, 3).map((item, index) => (
              <div key={index} className={`py-5 ${index > 0 ? 'hairline' : ''}`}>
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-bold text-ink text-lg">{item.benefit}</h3>
                  <svg className="flex-shrink-0 translate-y-0.5" width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
                    <path d="M2 10L8 16L18 4" stroke="#d4967d" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter" />
                  </svg>
                </div>
                <p className="text-sage text-[15px] mt-0.5">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Your Narrator */}
        <section className="pt-14 pb-2 reveal">
          <p className="kicker mb-3">Your Narrator</p>
          <div className="flex items-start gap-5 mt-5">
            <img
              src="/images/tour-guide.png"
              alt="Your tour guide"
              className="w-24 h-24 rounded-full object-cover flex-shrink-0 ring-4 ring-terracotta/40 shadow-lg"
            />
            <div className="relative">
              <span
                className="absolute -top-5 -left-1 font-serif text-terracotta select-none"
                style={{ fontSize: '3.2rem', lineHeight: 1, opacity: 0.5 }}
                aria-hidden
              >
                “
              </span>
              <p className="font-serif italic text-ink text-[17px] leading-relaxed pt-2">
                Hi, I'm Steven. Greenville is home for me, and a few of these stops still give me goosebumps every time I walk past them. Think of this tour as a stroll with a friend who can't wait to show you around.
              </p>
              <p className="kicker mt-3" style={{ fontSize: '0.7rem' }}>Steven Carter · Greenville Local</p>
            </div>
          </div>
        </section>

        {/* Email capture - reach visitors who aren't ready to buy today */}
        {!tourPurchased && (
          <section className="pt-14 pb-16 reveal">
            <EmailCapture
              source="landing"
              title={proximity === 'near' ? 'Want the link for later?' : 'Not touring today?'}
            />
          </section>
        )}
      </main>

      {/* ─────────────────── Final CTA (full-bleed sage) ─────────────────── */}
      <section className="bg-sage px-6 pt-14 pb-12 text-center">
        <div className="max-w-md mx-auto">
          <h2
            className="font-display uppercase text-white mb-3"
            style={{ fontSize: 'clamp(2rem, 7vw, 2.8rem)', lineHeight: 1.08 }}
          >
            Ready to <span className="text-terracotta">explore?</span>
          </h2>
          <p className="font-serif italic text-white/85 mb-7" style={{ fontSize: '1.05rem' }}>
            The park is waiting. The stories are ready.
          </p>
          <div className="max-w-sm mx-auto">
            <button
              onClick={tourPurchased ? handleStartTour : handleQuickCheckout}
              disabled={isCheckingOut}
              className="btn-primary text-lg"
            >
              {tourPurchased
                ? <>Start Tour <span aria-hidden>→</span></>
                : isCheckingOut
                  ? 'Opening Secure Checkout…'
                  : <>Unlock Full Tour · ${tourConfig.pricing.defaultAmount} <span aria-hidden>→</span></>}
            </button>
          </div>

          <div className="mt-10 pt-7 border-t border-white/15">
            <p className="text-sm text-white/70 mb-1">Questions?</p>
            <a
              href={`mailto:${tourConfig.support.email}`}
              className="text-base font-semibold text-terracotta hover:underline"
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
                  className="text-sm font-medium text-white/70 hover:text-white underline underline-offset-4 bg-transparent border-none cursor-pointer"
                >
                  Already purchased? Restore access
                </button>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink py-5 px-6 text-center">
        <p className="text-xs font-semibold uppercase text-terracotta" style={{ letterSpacing: '0.18em' }}>
          Powered by Basecamp Data Analytics
        </p>
      </footer>

      {/* Sticky bottom CTA - keeps purchase one tap away once hero scrolls off */}
      {showStickyCta && !tourPurchased && (
        <div className="fixed bottom-0 left-0 right-0 z-40 px-4 py-3 bg-cream/95 backdrop-blur-md border-t border-sage/20 shadow-[0_-6px_24px_rgba(0,0,0,0.12)]">
          <div className="max-w-md mx-auto flex items-center gap-3">
            <div className="flex-shrink-0">
              <p className="text-sm font-bold leading-tight text-ink">
                {tourConfig.stats.stops} stops · {tourConfig.stats.duration} min
              </p>
              <p className="text-xs text-sage">Pay what you want</p>
            </div>
            <button
              onClick={handleQuickCheckout}
              disabled={isCheckingOut}
              className="btn-primary flex-1 text-base"
              style={{ padding: '0.8rem 1.25rem' }}
            >
              {isCheckingOut ? 'Opening Checkout…' : `Unlock Tour · $${tourConfig.pricing.defaultAmount}`}
            </button>
          </div>
        </div>
      )}

      {/* Restore Purchase Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-black/55 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-7">
            <div className="flex items-start justify-between mb-2">
              <h3 className="display-h text-xl">Restore your purchase</h3>
              <button
                onClick={() => setShowRestoreModal(false)}
                aria-label="Close"
                className="text-sage/60 hover:text-sage text-xl leading-none bg-transparent border-none cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-sage mb-5">
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
              className="input-line mb-5"
            />
            {restoreMessage && (
              <p
                className={`text-sm mb-4 px-3 py-2 rounded-xl ${
                  restoreMessage.type === 'error' ? 'bg-red-100 text-red-900' : 'bg-green-100 text-green-900'
                }`}
              >
                {restoreMessage.text}
              </p>
            )}
            <button
              onClick={handleRestorePurchase}
              disabled={isRestoring || !restoreEmail.trim()}
              className="btn-primary text-base"
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

import { useState, useEffect, lazy, Suspense } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import tourConfig from './config/tourConfig.js';

// Only the landing screen loads eagerly — everything else splits out of the
// initial bundle so first paint on a QR scan stays fast
const PricingSelection = lazy(() => import('./components/PricingSelection'));
const TourMap = lazy(() => import('./components/TourMap'));
const AudioPlayer = lazy(() => import('./components/AudioPlayer'));
const PaymentSuccess = lazy(() => import('./components/PaymentSuccess'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));

// Branded full-screen loader for lazy screen transitions
const ScreenLoader = () => (
  <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#e5e3dc'}}>
    <div className="text-center">
      <div
        className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto mb-3"
        style={{borderColor: '#d4967d'}}
      ></div>
      <p className="text-sm font-semibold" style={{color: '#495a58'}}>Loading…</p>
    </div>
  </div>
);
import { createPaymentSession, hasStoredAccess, revalidateAccess, revokeAccess } from './utils/stripe.js';
import { getAudioToken } from './utils/audioAccess.js';

function App() {
  const [currentScreen, setCurrentScreen] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);

    // Check if we're on the success page
    if (urlParams.get('session_id')) {
      return 'success';
    }

    // Check if user wants to go directly to tour
    if (urlParams.get('tour') === 'true') {
      return 'map';
    }

    return 'welcome';
  });
  const [userLocation, setUserLocation] = useState(null);
  // Optimistic local check so offline users aren't blocked; a background
  // re-verification against Stripe below revokes claims the server rejects
  const [tourPurchased, setTourPurchased] = useState(() => hasStoredAccess());
  // Stripe checkout sends users back with ?cancelled=true when they abandon
  // payment — our warmest audience, so greet them with a win-back message
  const [checkoutCancelled, setCheckoutCancelled] = useState(() =>
    new URLSearchParams(window.location.search).get('cancelled') === 'true'
  );

  // Clean the cancelled flag out of the URL so refresh/share doesn't re-show it
  useEffect(() => {
    if (checkoutCancelled) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [checkoutCancelled]);
  const [currentStop, setCurrentStop] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Check for payment status changes
  useEffect(() => {
    const checkPaymentStatus = () => {
      if (hasStoredAccess() && !tourPurchased) {
        console.log('Payment found in localStorage, updating state');
        setTourPurchased(true);

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('tour') === 'true') {
          setCurrentScreen('map');
        }
      }
    };

    checkPaymentStatus();
    window.addEventListener('storage', checkPaymentStatus);
    return () => window.removeEventListener('storage', checkPaymentStatus);
  }, [tourPurchased]);

  // Re-verify the stored purchase against Stripe once per load. Network
  // failures keep access (offline tour use); only a definitive server
  // rejection revokes it.
  useEffect(() => {
    if (!hasStoredAccess()) return;

    let cancelled = false;
    revalidateAccess().then((result) => {
      if (cancelled) return;
      if (result === 'invalid') {
        console.warn('Stored tour access failed verification, revoking');
        revokeAccess();
        setTourPurchased(false);
        setCurrentScreen((screen) => (screen === 'map' ? 'welcome' : screen));
      } else {
        // Pre-warm the signed-audio token so the first geofence trigger
        // doesn't wait on a network round-trip (and offline visits reuse it)
        getAudioToken();
      }
    });
    return () => { cancelled = true; };
  }, []);

  // GPS tracking - only start when on map screen
  useEffect(() => {
    let watchId;

    if (currentScreen === 'map' && navigator.geolocation) {
      console.log('Starting GPS tracking...');

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp
          };

          setUserLocation(newLocation);
        },
        (error) => {
          console.error('GPS tracking error:', error);

          if (error.code === error.PERMISSION_DENIED) {
            setLocationError('denied');
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            setLocationError('unavailable');
          } else if (error.code === error.TIMEOUT) {
            setLocationError('timeout');
          } else {
            setLocationError('unknown');
          }

          // Fallback to single position request
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLocationError(null);
              setUserLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy
              });
            },
            (fallbackError) => {
              console.error('Fallback GPS also failed:', fallbackError);
              if (fallbackError.code === fallbackError.PERMISSION_DENIED) {
                setLocationError('denied');
              }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 5000
        }
      );
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        console.log('GPS tracking stopped');
      }
    };
  }, [currentScreen]);

  const handleScreenChange = (screen) => {
    setCurrentScreen(screen);
    if (!audioUnlocked) {
      unlockAudio();
    }
  };

  const unlockAudio = () => {
    console.log('Attempting to unlock audio for autoplay...');
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const buffer = audioContext.createBuffer(1, 1, 22050);
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0);
    setAudioUnlocked(true);
    console.log('Audio unlocked for autoplay');
  };

  const handleStopTriggered = (stop) => {
    setCurrentStop(stop);
    setIsPlaying(true);
  };

  // Quick checkout handler - processes payment with default amount.
  // Returns the session result so callers can surface errors inline.
  const handleQuickCheckout = async (amount) => {
    try {
      const paymentData = {
        type: 'individual',
        amount: amount,
        isCustom: false,
        groupSize: 1,
        currency: tourConfig.pricing.currency.toLowerCase(),
        tourId: tourConfig.id,
      };

      const result = await createPaymentSession(paymentData);

      if (!result.success) {
        throw new Error(result.error || 'Payment session failed');
      }
      return result;
    } catch (error) {
      console.error('Quick checkout error:', error);
      return { success: false, error: error.message };
    }
  };

  // The stop the narration should guide the listener to after the current one
  const getNextStop = (stop) =>
    tourConfig.stops.find((s) => s.order === stop.order + 1) || null;

  return (
    <div className="min-h-screen bg-gray-50">
      {currentScreen === 'welcome' && (
        <WelcomeScreen
          onScreenChange={() => setCurrentScreen('pricing')}
          onQuickCheckout={handleQuickCheckout}
          tourPurchased={tourPurchased}
          onStartTourMap={() => handleScreenChange('map')}
          checkoutCancelled={checkoutCancelled}
          onDismissCancelled={() => setCheckoutCancelled(false)}
        />
      )}

      {currentScreen === 'pricing' && (
        <Suspense fallback={<ScreenLoader />}>
          <PricingSelection
            onBack={() => setCurrentScreen('welcome')}
          />
        </Suspense>
      )}

      {currentScreen === 'success' && (
        <Suspense fallback={<ScreenLoader />}>
          <PaymentSuccess />
        </Suspense>
      )}

      {currentScreen === 'map' && (
        <Suspense fallback={<ScreenLoader />}>
        <TourMap
          userLocation={userLocation}
          locationError={locationError}
          onRetryLocation={() => {
            setLocationError(null);
            navigator.geolocation.getCurrentPosition(
              (position) => {
                setLocationError(null);
                setUserLocation({
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                  accuracy: position.coords.accuracy
                });
              },
              (err) => {
                if (err.code === err.PERMISSION_DENIED) {
                  setLocationError('denied');
                } else {
                  setLocationError('error');
                }
              },
              { enableHighAccuracy: true, timeout: 10000 }
            );
          }}
          tourStops={tourConfig.stops}
          tourPurchased={tourPurchased}
          onStopTriggered={handleStopTriggered}
          onBack={() => handleScreenChange('welcome')}
          onUnlock={() => setCurrentScreen('pricing')}
        />
        </Suspense>
      )}

      {isPlaying && currentStop && (
        <Suspense fallback={null}>
        <AudioPlayer
          stop={currentStop}
          isPlaying={isPlaying}
          audioUnlocked={audioUnlocked}
          nextStop={getNextStop(currentStop)}
          tourPurchased={tourPurchased}
          onPlayNext={handleStopTriggered}
          onUnlock={() => {
            setIsPlaying(false);
            setCurrentStop(null);
            setCurrentScreen('pricing');
          }}
          onClose={() => {
            setIsPlaying(false);
            setCurrentStop(null);
          }}
        />
        </Suspense>
      )}

      {/* Admin panel - gated here too so its chunk never downloads for visitors */}
      {new URLSearchParams(window.location.search).get('admin') === 'true' && (
        <Suspense fallback={null}>
          <AdminPanel />
        </Suspense>
      )}
    </div>
  );
}

export default App;

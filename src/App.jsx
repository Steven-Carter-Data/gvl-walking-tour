import { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import PricingSelection from './components/PricingSelection';
import TourMap from './components/TourMap';
import AudioPlayer from './components/AudioPlayer';
import PaymentSuccess from './components/PaymentSuccess';
import AdminPanel from './components/AdminPanel';
import tourConfig from './config/tourConfig.js';
import { createPaymentSession, hasStoredAccess, revalidateAccess, revokeAccess } from './utils/stripe.js';

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

  // Quick checkout handler - processes payment with default amount
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
    } catch (error) {
      console.error('Quick checkout error:', error);
      alert('Payment processing failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentScreen === 'welcome' && (
        <WelcomeScreen
          onScreenChange={() => setCurrentScreen('pricing')}
          onQuickCheckout={handleQuickCheckout}
          tourPurchased={tourPurchased}
          onStartTourMap={() => setCurrentScreen('map')}
        />
      )}

      {currentScreen === 'pricing' && (
        <PricingSelection
          onBack={() => setCurrentScreen('welcome')}
        />
      )}

      {currentScreen === 'success' && (
        <PaymentSuccess />
      )}

      {currentScreen === 'map' && (
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
        />
      )}

      {isPlaying && currentStop && (
        <AudioPlayer
          stop={currentStop}
          isPlaying={isPlaying}
          audioUnlocked={audioUnlocked}
          onClose={() => {
            setIsPlaying(false);
            setCurrentStop(null);
          }}
        />
      )}

      {/* Admin panel - only shows with ?admin=true */}
      <AdminPanel />
    </div>
  );
}

export default App;

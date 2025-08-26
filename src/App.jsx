import { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import TourMap from './components/TourMap';
import AudioPlayer from './components/AudioPlayer';
import PaymentFlow from './components/PaymentFlow';
import AdminPanel from './components/AdminPanel';
import tourData from './data/greenville_tour_stops_with_test_scripts.json';
import testTourData from './data/test_tour_local.json';

function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [userLocation, setUserLocation] = useState(null);
  const [tourPurchased, setTourPurchased] = useState(true); // Free for MVP
  const [currentStop, setCurrentStop] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false); // Toggle for local testing
  const [audioUnlocked, setAudioUnlocked] = useState(false); // Track if user has enabled audio
  
  // Choose tour data based on test mode
  const activeTourData = isTestMode ? testTourData : tourData;

  useEffect(() => {
    let watchId;
    
    // Start continuous GPS tracking
    if (navigator.geolocation) {
      console.log('🛰️ Starting continuous GPS tracking...');
      
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
          
          console.log('📍 GPS Update:', newLocation);
          setUserLocation(newLocation);
        },
        (error) => {
          console.error('❌ GPS tracking error:', error);
          
          // Fallback to single position request
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log('📍 Fallback GPS position obtained');
              setUserLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy
              });
            },
            (fallbackError) => {
              console.error('❌ Fallback GPS also failed:', fallbackError);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
          );
        },
        { 
          enableHighAccuracy: true,    // Use GPS, not network location
          timeout: 15000,              // 15 second timeout
          maximumAge: 5000             // Accept positions up to 5 seconds old
        }
      );
    }

    // Cleanup: stop watching location when component unmounts
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        console.log('🛑 GPS tracking stopped');
      }
    };
  }, []);

  const handleScreenChange = (screen) => {
    setCurrentScreen(screen);
    // Unlock audio on first user interaction
    if (!audioUnlocked) {
      unlockAudio();
    }
  };
  
  const unlockAudio = () => {
    console.log('🔓 Attempting to unlock audio for autoplay...');
    // Create a silent audio context to unlock audio
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const buffer = audioContext.createBuffer(1, 1, 22050);
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0);
    
    setAudioUnlocked(true);
    console.log('✅ Audio unlocked for autoplay');
  };

  const handlePurchaseComplete = () => {
    setTourPurchased(true);
    localStorage.setItem('tourPurchased', 'true');
    setCurrentScreen('map');
  };

  const handleStopTriggered = (stop) => {
    setCurrentStop(stop);
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentScreen === 'welcome' && (
        <WelcomeScreen
          onScreenChange={handleScreenChange}
          tourPurchased={tourPurchased}
        />
      )}
      
      {currentScreen === 'payment' && (
        <PaymentFlow
          onPaymentComplete={handlePurchaseComplete}
          onBack={() => handleScreenChange('welcome')}
        />
      )}
      
      {currentScreen === 'map' && (
        <TourMap
          userLocation={userLocation}
          tourStops={activeTourData.stops}
          tourPurchased={tourPurchased}
          onStopTriggered={handleStopTriggered}
          onBack={() => handleScreenChange('welcome')}
          isTestMode={isTestMode}
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
      
      {/* Test Mode Toggle - for development */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        backgroundColor: isTestMode ? '#dc2626' : '#16a34a',
        color: 'white',
        padding: '12px 16px',
        borderRadius: '12px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: 'bold',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
      }} onClick={() => setIsTestMode(!isTestMode)}>
        {isTestMode ? '🏠 LOCAL TEST' : '🌍 GREENVILLE'}
      </div>
    </div>
  );
}

export default App;
